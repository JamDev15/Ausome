"""
Rule-based routine generator.
Outputs language-agnostic RoutineBlock objects; the frontend renders translation keys.
"""
from typing import List, Optional
from app.models.onboarding import RoutineBlock


def _add_minutes(time_str: str, minutes: int) -> str:
    h, m = map(int, time_str.split(':'))
    total = h * 60 + m + minutes
    return f"{(total // 60) % 24:02d}:{total % 60:02d}"


def _fmt_range(start: str, duration: int) -> tuple[str, str]:
    end = _add_minutes(start, duration)
    return f"{start}-{end}", end


def generate_routine(
    child_age: Optional[int],
    communication_level: Optional[str],
    challenges: List[str],
    strengths: List[str],
    wake_time: str = "07:00",
    school_start: Optional[str] = None,
    school_end: Optional[str] = None,
    bedtime: str = "20:00",
) -> List[RoutineBlock]:
    blocks: List[RoutineBlock] = []
    cursor = wake_time
    is_nonverbal = communication_level in ("nonverbal", "aac")
    has_school = bool(school_start and school_end)
    evening_start = _add_minutes(bedtime, -120)  # 2h before bed

    def add(activity_key: str, duration: int, category: str,
            tip_key: str, why_key: str, icon_key: str) -> None:
        nonlocal cursor
        time_range, cursor = _fmt_range(cursor, duration)
        blocks.append(RoutineBlock(
            time_range=time_range,
            activity_key=activity_key,
            duration_minutes=duration,
            category=category,
            tip_key=tip_key,
            why_key=why_key,
            icon_key=icon_key,
        ))

    # ── MORNING ──────────────────────────────────────────────────────────────
    add("routine.morning_wake", 15, "morning",
        "tips.morning_wake_nonverbal" if is_nonverbal else "tips.morning_wake_verbal",
        "why.predictable_start", "sunny-outline")

    if is_nonverbal:
        add("routine.morning_visual_review", 10, "morning",
            "tips.visual_schedule_tip", "why.visual_schedule", "calendar-outline")

    if communication_level == "aac":
        add("routine.morning_aac", 10, "morning",
            "tips.aac_morning_tip", "why.aac_morning", "chatbubbles-outline")

    add("routine.morning_hygiene", 20, "morning",
        "tips.hygiene_steps", "why.hygiene_routine", "water-outline")

    add("routine.morning_breakfast", 30, "morning",
        "tips.breakfast_picky" if "feeding" in challenges else "tips.sensory_warmup_tip",
        "why.structured_meal", "restaurant-outline")

    if "sensory" in challenges or is_nonverbal:
        add("routine.morning_sensory", 15, "morning",
            "tips.sensory_warmup_tip", "why.sensory_warmup", "body-outline")

    if has_school:
        add("routine.morning_prepare", 20, "morning",
            "tips.calm_transition", "why.calm_transition", "bag-outline")
        cursor = school_start  # jump to school start

        # ── MIDDAY (school hours) ────────────────────────────────────────────
        mid_cursor = school_start
        mid_dur = 0
        try:
            sh, sm = map(int, school_start.split(':'))
            eh, em = map(int, school_end.split(':'))
            mid_dur = (eh * 60 + em) - (sh * 60 + sm)
        except Exception:
            mid_dur = 240

        # Lunch roughly halfway through school
        lunch_offset = mid_dur // 2
        lunch_start = _add_minutes(school_start, lunch_offset - 15)
        blocks.append(RoutineBlock(
            time_range=f"{lunch_start}-{_add_minutes(lunch_start, 30)}",
            activity_key="routine.midday_lunch",
            duration_minutes=30,
            category="midday",
            tip_key="tips.midday_rest_tip",
            why_key="why.structured_meal",
            icon_key="restaurant-outline",
        ))

        if "focus" in challenges:
            mv_start = _add_minutes(school_start, lunch_offset + 30)
            blocks.append(RoutineBlock(
                time_range=f"{mv_start}-{_add_minutes(mv_start, 10)}",
                activity_key="routine.midday_movement",
                duration_minutes=10,
                category="midday",
                tip_key="tips.movement_tip",
                why_key="why.movement_break",
                icon_key="walk-outline",
            ))

        cursor = school_end
    else:
        # Home full time — add a midday learning block
        add("routine.midday_learning", 45, "midday",
            "tips.afternoon_play_tip", "why.learning_activity", "book-outline")

        add("routine.midday_break", 20, "midday",
            "tips.midday_rest_tip", "why.midday_rest", "bed-outline")

    # ── AFTERNOON ────────────────────────────────────────────────────────────
    add("routine.afternoon_snack", 15, "afternoon",
        "tips.afternoon_play_tip", "why.structured_meal", "cafe-outline")

    add("routine.afternoon_play", 45, "afternoon",
        "tips.afternoon_play_tip", "why.afternoon_play", "game-controller-outline")

    if "sensory" in challenges or "meltdowns" in challenges:
        add("routine.afternoon_sensory", 15, "afternoon",
            "tips.sensory_break_tip", "why.sensory_break", "pulse-outline")

    if "social" in challenges or "social" in strengths:
        add("routine.afternoon_social", 30, "afternoon",
            "tips.social_tip", "why.social_play", "people-outline")

    if child_age and child_age >= 5 and has_school:
        add("routine.afternoon_homework", 30, "afternoon",
            "tips.movement_tip", "why.learning_activity", "pencil-outline")

    if strengths and any(s in strengths for s in ["music", "drawing", "crafts", "technology"]):
        add("routine.afternoon_creative", 30, "afternoon",
            "tips.afternoon_play_tip", "why.afternoon_play", "color-palette-outline")

    # ── EVENING ──────────────────────────────────────────────────────────────
    cursor = evening_start

    add("routine.evening_dinner", 30, "evening",
        "tips.bath_tip", "why.calming_dinner", "restaurant-outline")

    add("routine.evening_bath", 20, "evening",
        "tips.bath_tip", "why.bath_routine", "water-outline")

    add("routine.evening_calm", 25, "evening",
        "tips.wind_down_tip", "why.wind_down", "moon-outline")

    if not child_age or child_age <= 14:
        add("routine.evening_story", 20, "evening",
            "tips.story_tip", "why.story_time", "book-outline")

    if is_nonverbal:
        add("routine.evening_visual_tomorrow", 10, "evening",
            "tips.preview_tip", "why.preview_tomorrow", "calendar-outline")

    add("routine.evening_sleep", 0, "evening",
        "tips.sleep_tip", "why.sleep_hygiene", "moon-outline")
    # set sleep block time_range to just the bedtime
    if blocks:
        blocks[-1].time_range = bedtime

    return blocks
