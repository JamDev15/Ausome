"""
PayMongo integration — Checkout Sessions API.
Docs: https://developers.paymongo.com/reference/checkout-session-resource
"""
import base64
import hashlib
import hmac
from typing import Optional
import httpx
from app.core.config import settings

PAYMONGO_BASE = "https://api.paymongo.com/v1"

PLANS = {
    "family": {
        "amount": 19900,          # ₱199.00 in centavos
        "name": "Ausome Family Plan",
        "description": "Monthly subscription — full access to all features",
    },
    "family_annual": {
        "amount": 149900,         # ₱1,499.00 in centavos
        "name": "Ausome Family Annual Plan",
        "description": "Annual subscription — save ₱889 vs monthly",
    },
}


def _auth_header() -> str:
    encoded = base64.b64encode(f"{settings.PAYMONGO_SECRET_KEY}:".encode()).decode()
    return f"Basic {encoded}"


async def create_checkout_session(
    plan: str,
    user_email: str,
    user_name: str,
    user_id: str,
) -> dict:
    plan_data = PLANS.get(plan)
    if not plan_data:
        raise ValueError(f"Unknown plan: {plan}")

    payload = {
        "data": {
            "attributes": {
                "send_email_receipt": True,
                "show_description": True,
                "show_line_items": True,
                "line_items": [
                    {
                        "currency": "PHP",
                        "amount": plan_data["amount"],
                        "name": plan_data["name"],
                        "description": plan_data["description"],
                        "quantity": 1,
                    }
                ],
                "payment_method_types": ["gcash", "card", "paymaya", "grab_pay"],
                "success_url": settings.PAYMONGO_SUCCESS_URL,
                "cancel_url": settings.PAYMONGO_CANCEL_URL,
                "description": plan_data["description"],
                "billing": {
                    "name": user_name,
                    "email": user_email,
                },
                "metadata": {
                    "user_id": user_id,
                    "plan": plan,
                },
            }
        }
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYMONGO_BASE}/checkout_sessions",
            json=payload,
            headers={"Authorization": _auth_header(), "Content-Type": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()["data"]


async def get_checkout_session(session_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{PAYMONGO_BASE}/checkout_sessions/{session_id}",
            headers={"Authorization": _auth_header()},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()["data"]


def verify_webhook_signature(raw_body: bytes, signature_header: str) -> bool:
    """Verify PayMongo webhook signature."""
    if not settings.PAYMONGO_WEBHOOK_SECRET:
        return True  # skip verification in dev
    try:
        # signature_header format: "t=timestamp,te=token,li=live_sig,te=test_sig"
        parts = dict(p.split("=", 1) for p in signature_header.split(",") if "=" in p)
        timestamp = parts.get("t", "")
        sig = parts.get("li") or parts.get("te", "")
        message = f"{timestamp}.{raw_body.decode()}"
        computed = hmac.new(
            settings.PAYMONGO_WEBHOOK_SECRET.encode(), message.encode(), hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(computed, sig)
    except Exception:
        return False
