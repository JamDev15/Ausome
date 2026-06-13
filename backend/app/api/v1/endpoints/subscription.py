from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.services.paymongo_service import create_checkout_session, get_checkout_session, verify_webhook_signature

router = APIRouter(prefix="/subscription", tags=["Subscription"])

PLAN_DURATIONS = {
    "family": 30,
    "family_annual": 365,
}


class CheckoutRequest(BaseModel):
    plan: str   # "family" | "family_annual"


@router.post("/trial")
async def start_trial(current_user: User = Depends(get_current_user)):
    """Start the 3-day free trial."""
    current_user.plan_chosen = True
    current_user.subscription_plan = "free_trial"
    current_user.subscription_status = "trial"
    current_user.trial_ends_at = datetime.now(timezone.utc) + timedelta(days=3)
    await current_user.save()
    return {
        "subscription_plan": current_user.subscription_plan,
        "subscription_status": current_user.subscription_status,
        "trial_ends_at": current_user.trial_ends_at.isoformat(),
        "subscription_ends_at": None,
        "is_full_access": True,
        "plan_chosen": True,
    }


@router.post("/checkout")
async def create_checkout(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
):
    """Create a PayMongo checkout session for a paid plan."""
    if payload.plan not in ("family", "family_annual"):
        raise HTTPException(400, "Invalid plan. Choose 'family' or 'family_annual'.")

    session = await create_checkout_session(
        plan=payload.plan,
        user_email=current_user.email,
        user_name=current_user.full_name,
        user_id=str(current_user.id),
    )

    current_user.plan_chosen = True
    current_user.subscription_plan = payload.plan
    current_user.subscription_status = "pending"
    current_user.paymongo_checkout_session_id = session["id"]
    await current_user.save()

    return {
        "checkout_url": session["attributes"]["checkout_url"],
        "session_id": session["id"],
    }


@router.get("/status")
async def get_status(current_user: User = Depends(get_current_user)):
    """Poll subscription status — used by the app while waiting for payment confirmation."""
    now = datetime.now(timezone.utc)

    # Auto-expire trial
    if current_user.subscription_status == "trial" and current_user.trial_ends_at:
        trial_end = current_user.trial_ends_at
        if trial_end.tzinfo is None:
            trial_end = trial_end.replace(tzinfo=timezone.utc)
        if now > trial_end:
            current_user.subscription_status = "expired"
            await current_user.save()

    # Auto-expire paid plan
    if current_user.subscription_status == "active" and current_user.subscription_ends_at:
        sub_end = current_user.subscription_ends_at
        if sub_end.tzinfo is None:
            sub_end = sub_end.replace(tzinfo=timezone.utc)
        if now > sub_end:
            current_user.subscription_status = "expired"
            await current_user.save()

    # If still pending, check PayMongo
    if current_user.subscription_status == "pending" and current_user.paymongo_checkout_session_id:
        try:
            session = await get_checkout_session(current_user.paymongo_checkout_session_id)
            pm_status = session["attributes"].get("status")
            if pm_status == "paid":
                days = PLAN_DURATIONS.get(current_user.subscription_plan, 30)
                current_user.subscription_status = "active"
                current_user.subscription_ends_at = now + timedelta(days=days)
                await current_user.save()
        except Exception:
            pass

    return {
        "subscription_plan": current_user.subscription_plan,
        "subscription_status": current_user.subscription_status,
        "trial_ends_at": current_user.trial_ends_at.isoformat() if current_user.trial_ends_at else None,
        "subscription_ends_at": current_user.subscription_ends_at.isoformat() if current_user.subscription_ends_at else None,
        "is_full_access": _is_full_access(current_user),
        "plan_chosen": current_user.plan_chosen,
    }


@router.post("/webhook", include_in_schema=False)
async def paymongo_webhook(request: Request):
    """PayMongo webhook — called when payment is completed."""
    raw_body = await request.body()
    sig = request.headers.get("Paymongo-Signature", "")

    if not verify_webhook_signature(raw_body, sig):
        raise HTTPException(400, "Invalid webhook signature")

    import json
    event = json.loads(raw_body)
    event_type = event.get("data", {}).get("attributes", {}).get("type", "")

    if event_type in ("checkout_session.payment.paid", "payment.paid"):
        attributes = event["data"]["attributes"].get("data", {}).get("attributes", {})
        metadata = attributes.get("metadata", {})
        user_id = metadata.get("user_id")
        plan = metadata.get("plan", "family")

        if user_id:
            from beanie import PydanticObjectId
            try:
                user = await User.get(PydanticObjectId(user_id))
                if user:
                    days = PLAN_DURATIONS.get(plan, 30)
                    user.subscription_status = "active"
                    user.subscription_plan = plan
                    user.subscription_ends_at = datetime.now(timezone.utc) + timedelta(days=days)
                    await user.save()
            except Exception:
                pass

    return {"received": True}


def _is_full_access(user: User) -> bool:
    now = datetime.now(timezone.utc)
    if user.subscription_status == "trial" and user.trial_ends_at:
        te = user.trial_ends_at
        if te.tzinfo is None:
            te = te.replace(tzinfo=timezone.utc)
        return now <= te
    if user.subscription_status == "active" and user.subscription_ends_at:
        se = user.subscription_ends_at
        if se.tzinfo is None:
            se = se.replace(tzinfo=timezone.utc)
        return now <= se
    return False
