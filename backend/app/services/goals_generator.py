"""
Rule-based parent goals generator.
Selects 3 SMART goals from a priority-ranked pool based on survey data.
Translation keys are resolved by the frontend.
"""
from typing import List, Optional
from app.models.onboarding import ParentGoal

# (goal_key, frequency, target_days)
_GOAL_POOL: dict[str, tuple[str, int]] = {
    "improve_sleep_routine": ("nightly", 30),
    "consistent_mealtime": ("3× daily", 30),
    "reduce_meltdowns": ("as needed / daily practice", 30),
    "communication_practice": ("daily, 10 min", 30),
    "toileting_independence": ("every 2 hours", 30),
    "sensory_regulation": ("3× daily", 30),
    "social_skills": ("1× per week", 30),
    "school_readiness": ("daily after school", 30),
    "following_instructions": ("10+ times daily", 30),
    "emotional_regulation": ("woven into the day", 30),
}

# Maps parent_goal survey keys → goal pool keys
_PARENT_GOAL_MAP: dict[str, str] = {
    "sleep": "improve_sleep_routine",
    "mealtime": "consistent_mealtime",
    "meltdowns": "reduce_meltdowns",
    "communication": "communication_practice",
    "toileting": "toileting_independence",
    "sensory": "sensory_regulation",
    "social": "social_skills",
    "school": "school_readiness",
    "instructions": "following_instructions",
    "emotional": "emotional_regulation",
    "independence": "following_instructions",
}

# Fallback priority by challenge
_CHALLENGE_GOAL_MAP: dict[str, str] = {
    "sleep": "improve_sleep_routine",
    "feeding": "consistent_mealtime",
    "meltdowns": "reduce_meltdowns",
    "social": "social_skills",
    "focus": "following_instructions",
    "motor": "sensory_regulation",
    "toileting": "toileting_independence",
    "anxiety": "emotional_regulation",
    "sensory": "sensory_regulation",
    "transitions": "reduce_meltdowns",
}

# Fallback by communication level
_COMM_GOAL_MAP: dict[str, str] = {
    "nonverbal": "communication_practice",
    "minimal": "communication_practice",
    "aac": "communication_practice",
    "verbal": "following_instructions",
    "fluent": "emotional_regulation",
}


def generate_goals(
    parent_goals: List[str],
    challenges: List[str],
    communication_level: Optional[str],
) -> List[ParentGoal]:
    selected: List[str] = []

    # 1. Honour explicit parent choices first
    for pg in parent_goals:
        gk = _PARENT_GOAL_MAP.get(pg)
        if gk and gk not in selected:
            selected.append(gk)
        if len(selected) == 3:
            break

    # 2. Fill from challenges
    for ch in challenges:
        if len(selected) >= 3:
            break
        gk = _CHALLENGE_GOAL_MAP.get(ch)
        if gk and gk not in selected:
            selected.append(gk)

    # 3. Fill from communication level
    if len(selected) < 3 and communication_level:
        gk = _COMM_GOAL_MAP.get(communication_level)
        if gk and gk not in selected:
            selected.append(gk)

    # 4. Guaranteed fallback
    for fallback in ["emotional_regulation", "sensory_regulation", "following_instructions"]:
        if len(selected) >= 3:
            break
        if fallback not in selected:
            selected.append(fallback)

    result = []
    for i, gk in enumerate(selected[:3]):
        freq, days = _GOAL_POOL.get(gk, ("daily", 30))
        result.append(ParentGoal(goal_key=gk, order=i + 1, frequency=freq, target_days=days))

    return result
