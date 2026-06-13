"""
AI Autism Support Service — comprehensive caregiver guidance assistant.

When AI_ENABLED=true and a valid OPENAI_API_KEY is set, routes to OpenAI.
Otherwise returns rich placeholder responses for offline/demo use.

All responses are educational only — no medical diagnoses or prescriptions.
"""

from typing import List, Optional
from app.core.config import settings

SYSTEM_PROMPT = """You are Ausome, a warm, patient, and expert autism support assistant
dedicated to helping parents, guardians, and caregivers of children with Autism Spectrum
Disorder (ASD). You were created specifically for the Ausome app to support families
navigating the challenges and joys of raising a child with autism.

YOUR EXPERTISE COVERS:
1. BEHAVIOR SUPPORT
   - Understanding meltdowns vs. tantrums and how to respond to each
   - Identifying triggers and building proactive strategies
   - De-escalation techniques during crisis moments
   - Positive Behavior Support (PBS) principles
   - Managing aggression, self-injurious behavior, and elopement safely
   - Teaching replacement behaviors for challenging ones
   - Using visual supports, social stories, and structured choice boards

2. SPEECH & COMMUNICATION DELAY
   - Strategies for non-verbal and minimally verbal children
   - How to encourage first words and expand vocabulary
   - AAC (Augmentative and Alternative Communication) guidance
   - PECS (Picture Exchange Communication System) basics
   - Functional communication training
   - Supporting echolalia productively
   - Reading comprehension and language development tips

3. ROUTINES & DAILY LIVING SKILLS
   - Building predictable visual schedules that reduce anxiety
   - Morning, afternoon, and bedtime routine strategies
   - Toileting/potty training for children with ASD
   - Dressing, hygiene, and grooming support
   - Mealtime challenges and food selectivity strategies
   - Sleep difficulties and bedtime routines
   - Transition warnings to reduce resistance

4. DEVELOPMENT & LEARNING
   - Understanding developmental milestones and delays
   - How to support late walkers, late talkers
   - Play-based learning strategies
   - Flashcard and visual learning techniques
   - Building attention span and focus
   - School readiness and IEP goal support
   - Homework and academic support strategies

5. SENSORY PROCESSING
   - Identifying sensory sensitivities (sound, light, touch, taste, smell)
   - Creating sensory-friendly environments at home
   - Sensory diet activities for regulation
   - Weighted blankets, compression vests, fidget tools guidance
   - Helping with haircuts, dentist visits, and medical appointments

6. SOCIAL SKILLS & EMOTIONAL REGULATION
   - Teaching emotions recognition and regulation
   - Peer interaction and friendship skills
   - Understanding social cues and body language
   - Role-playing and social stories for specific situations
   - Managing anxiety in social situations
   - Helping siblings understand autism

7. PARENT & CAREGIVER WELLBEING
   - Coping with caregiver burnout and emotional exhaustion
   - Finding strength and resilience during hard situations
   - How to advocate for your child at school and in public
   - Dealing with public meltdowns and judgment from others
   - Sibling dynamics and family balance
   - Celebrating small wins and developmental progress
   - Building a support network

8. POSITIVE REINFORCEMENT & REWARDS
   - Token economy systems and how to implement them
   - Finding intrinsic motivators for each unique child
   - How to fade prompts and build independence
   - Praise techniques that actually work

RESPONSE STYLE:
- Always warm, compassionate, and non-judgmental
- Practical, specific, and immediately actionable
- Structured with numbered steps or bullet points when giving strategies
- Acknowledge the caregiver's feelings before giving advice
- Keep responses focused and clear (not overwhelming)
- End with encouragement when appropriate
- Use "your child" not "autistic people" to keep it personal

STRICT LIMITS — ALWAYS:
- NEVER diagnose autism or any condition
- NEVER recommend specific medications or dosages
- NEVER replace professional medical, psychiatric, or therapeutic care
- ALWAYS encourage professional consultation for medical concerns
- If asked about medication, redirect to the child's doctor
- Include a brief note to consult professionals for serious safety concerns"""

DISCLAIMER = (
    "This is educational guidance from Ausome AI — not a replacement for "
    "licensed medical, therapeutic, or psychiatric care. For serious concerns, "
    "please consult your child's doctor, psychologist, or therapist."
)

UNSAFE_TOPICS = [
    "medication dosage", "prescription drug", "diagnose my child",
    "cure autism", "illegal", "abuse", "harm",
]


def _is_safe_prompt(message: str) -> bool:
    lower = message.lower()
    for bad in UNSAFE_TOPICS:
        if bad in lower:
            return False
    return True


async def get_ai_response(
    message: str,
    history: List[dict],
    child_context: Optional[str] = None,
) -> str:
    if not _is_safe_prompt(message):
        return (
            "I'm not able to advise on that specific topic. For medication questions "
            "or medical concerns, please speak directly with your child's doctor or psychiatrist. "
            "I'm here to help with behavioral strategies, routines, communication, and daily support."
        )

    if not settings.AI_ENABLED or not settings.OPENAI_API_KEY:
        return _placeholder_response(message)

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        system_content = SYSTEM_PROMPT
        if child_context:
            system_content += f"\n\nCHILD PROFILE CONTEXT:\n{child_context}"

        messages = [{"role": "system", "content": system_content}]
        messages.extend(history[-12:])
        messages.append({"role": "user", "content": message})

        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=messages,
            max_tokens=700,
            temperature=0.65,
        )
        reply = response.choices[0].message.content or "I'm here to help. Could you share more details?"
        return reply
    except Exception:
        return _placeholder_response(message)


def _placeholder_response(message: str) -> str:
    lower = message.lower()

    # Meltdown / behavior crisis
    if any(w in lower for w in ["meltdown", "tantrum", "hitting", "aggression", "screaming", "biting", "crisis"]):
        return (
            "Meltdowns and tantrums are different — and that matters:\n\n"
            "A **meltdown** is a loss of control due to sensory/emotional overflow. "
            "Your child isn't being defiant — they're overwhelmed.\n\n"
            "**In the moment:**\n"
            "1. Stay calm — your calm voice and body regulate theirs\n"
            "2. Reduce stimulation — lower lights, reduce noise, create space\n"
            "3. Don't demand compliance or ask questions during a meltdown\n"
            "4. Offer a comfort item (weighted blanket, favorite toy)\n"
            "5. Use a calm-down corner with sensory tools they already love\n\n"
            "**After the meltdown:**\n"
            "• When calm, identify what triggered it\n"
            "• Keep a behavior log to find patterns\n"
            "• Build a proactive plan to prevent future occurrences\n\n"
            "You are doing a great job by seeking strategies. This takes time — be patient with yourself too."
        )

    # Speech delay / communication
    if any(w in lower for w in ["speech", "talk", "words", "verbal", "nonverbal", "aac", "language", "communication", "not talking"]):
        return (
            "Speech delay is one of the most common challenges in autism, and there is so much you can do at home:\n\n"
            "**For non-verbal or minimally verbal children:**\n"
            "1. Use AAC tools — picture boards, PECS cards, or AAC apps\n"
            "2. Honor ALL communication — pointing, gestures, eye contact, sounds\n"
            "3. Use simple 1-2 word models (say 'want juice' when they reach for a drink)\n"
            "4. Reduce pressure — forced speech often backfires\n"
            "5. Create communication opportunities — pause and wait expectantly\n\n"
            "**For emerging verbal children:**\n"
            "• Expand their words by one step ('car' → 'big car' → 'I want the car')\n"
            "• Read books together daily — point at pictures and label them\n"
            "• Sing songs with repetition — music activates language differently\n\n"
            "**Important:** Work with a Speech-Language Pathologist (SLP) who specializes in autism for a personalized plan."
        )

    # Routine / schedule
    if any(w in lower for w in ["routine", "schedule", "morning", "bedtime", "night", "transition", "change"]):
        return (
            "Predictable routines are incredibly powerful for children with autism — they reduce anxiety and build independence.\n\n"
            "**Building a visual schedule:**\n"
            "1. Take photos of each step in the routine (real photos work better than drawings for many kids)\n"
            "2. Arrange them on a strip or board in order\n"
            "3. Let your child check off or flip each step as they complete it\n"
            "4. Keep it posted at eye level in the relevant room\n\n"
            "**Morning routine example:**\n"
            "Wake up → Bathroom → Brush teeth → Get dressed → Eat breakfast → Pack bag → Ready!\n\n"
            "**Transitions:** Give a 5-minute and 1-minute warning before changing activities. A visual timer helps enormously.\n\n"
            "**Key principle:** Consistency is everything. The routine itself becomes the authority — not you — which reduces power struggles."
        )

    # Sleep
    if any(w in lower for w in ["sleep", "night", "wake", "insomnia", "bedtime"]):
        return (
            "Sleep difficulties affect up to 80% of children with autism. Here are evidence-based strategies:\n\n"
            "**Environment:**\n"
            "• Blackout curtains (light sensitivity is common)\n"
            "• White noise machine to block sound\n"
            "• Weighted blanket (use only if appropriate for your child's size)\n"
            "• Keep room cool and comfortable\n\n"
            "**Bedtime routine (30-45 min before bed):**\n"
            "1. Dim lights throughout the home\n"
            "2. Stop screens at least 60 minutes before bed\n"
            "3. Warm bath (regulates sensory system)\n"
            "4. Calm, predictable sequence: PJs → teeth → book → bed\n"
            "5. Use a visual schedule for the bedtime routine\n\n"
            "**Talk to your pediatrician** about melatonin if behavioral strategies alone aren't working — it is commonly used and generally safe but needs medical guidance."
        )

    # Behavior / triggers
    if any(w in lower for w in ["behavior", "trigger", "bad behavior", "difficult", "challenging", "why does he", "why does she"]):
        return (
            "Challenging behavior is always communicating something — our job is to decode the message.\n\n"
            "**The ABCs of behavior:**\n"
            "• **A — Antecedent:** What happened right before?\n"
            "• **B — Behavior:** Exactly what did your child do?\n"
            "• **C — Consequence:** What happened after (did it get them something or help them escape something)?\n\n"
            "**Common functions of challenging behavior:**\n"
            "1. **Escape** — 'I want to get away from this task/situation'\n"
            "2. **Attention** — 'I need you to notice me'\n"
            "3. **Access** — 'I want that thing'\n"
            "4. **Sensory** — 'This feels good/bad to my body'\n\n"
            "**What to do:**\n"
            "• Keep a behavior log for 1-2 weeks to identify patterns\n"
            "• Teach a replacement behavior (a better way to communicate the same need)\n"
            "• Reinforce what you DO want to see, immediately and consistently\n\n"
            "A Board Certified Behavior Analyst (BCBA) can create a formal Behavior Intervention Plan if needed."
        )

    # Sensory
    if any(w in lower for w in ["sensory", "sound", "noise", "light", "touch", "texture", "smell", "overwhelm"]):
        return (
            "Sensory sensitivities are very real in autism — the brain processes sensory input differently.\n\n"
            "**Common sensory challenges:**\n"
            "• Sound: loud environments, unexpected noises, certain pitches\n"
            "• Touch: clothing tags, certain fabrics, hugs, haircuts, toothbrushing\n"
            "• Light: fluorescent lights, bright sunlight\n"
            "• Taste/smell: strong foods, perfumes, public bathrooms\n\n"
            "**Strategies:**\n"
            "1. Create a 'sensory diet' — regular scheduled sensory activities throughout the day\n"
            "2. Provide calming sensory input: deep pressure (tight hugs, weighted blanket), heavy work (carrying groceries, pushing a cart)\n"
            "3. Use noise-cancelling headphones in loud environments\n"
            "4. Allow clothing that feels comfortable — remove tags, use seamless socks\n"
            "5. Warn before touching — 'I'm going to touch your shoulder'\n\n"
            "An Occupational Therapist (OT) specializing in sensory integration is invaluable here."
        )

    # Late development
    if any(w in lower for w in ["late", "behind", "delay", "milestone", "development", "not walking", "not eating"]):
        return (
            "Developmental delays can feel frightening, but early action makes an enormous difference.\n\n"
            "**Remember:**\n"
            "• Every child with autism has a unique developmental profile — strengths AND challenges\n"
            "• 'Late' does not mean 'never' — many children catch up with the right support\n"
            "• Progress is not always linear — celebrate every small step\n\n"
            "**What helps most:**\n"
            "1. Early intervention services (the earlier, the better)\n"
            "2. Consistent practice in natural environments (home, play, daily routines)\n"
            "3. Following the child's lead in play to build engagement and skills\n"
            "4. Building on existing strengths to reach new skills\n"
            "5. Involving the whole family — consistency across caregivers matters\n\n"
            "**For parents:**\n"
            "Grief about delays is normal and valid. You can feel sad AND be your child's strongest advocate at the same time. Both are true."
        )

    # Social skills
    if any(w in lower for w in ["social", "friend", "play", "interaction", "peers", "school", "other kids"]):
        return (
            "Social skills can be taught — they just need to be broken down and practiced.\n\n"
            "**Start with the basics:**\n"
            "1. Greetings — practice 'hello' and 'goodbye' at home first\n"
            "2. Joint attention — looking at the same thing together\n"
            "3. Turn-taking — in games, conversation, and activities\n"
            "4. Requesting — how to ask for something they want\n\n"
            "**Strategies that work:**\n"
            "• Social stories — short, personalized stories about specific social situations\n"
            "• Video modeling — watching videos of peer interactions\n"
            "• Role-play — practice situations at home in a safe environment\n"
            "• Structured play dates — one child, short duration, clear activity\n"
            "• Social skills groups led by a therapist\n\n"
            "**Key insight:** Don't force friendships — focus on finding one or two children with shared interests."
        )

    # Parent strength / hard situation
    if any(w in lower for w in ["hard", "difficult", "tired", "exhausted", "stressed", "burnout", "give up", "can't do", "overwhelming", "strong", "help me"]):
        return (
            "First — I want you to know that what you are doing is one of the hardest and most important jobs in the world. You are seen.\n\n"
            "**You are not alone:**\n"
            "• Caregiver burnout is real and affects most autism parents at some point\n"
            "• Feeling overwhelmed does not mean you are failing — it means you care deeply\n\n"
            "**Ways to build resilience:**\n"
            "1. **Celebrate micro-wins** — your child made eye contact, sat for 2 more minutes, tried a new food. These matter enormously\n"
            "2. **Find your community** — connect with other autism parents (online groups, local support groups)\n"
            "3. **Ask for help** — from family, from respite care, from your child's school\n"
            "4. **Protect your own mental health** — you cannot pour from an empty cup\n"
            "5. **Focus on today** — not the 5-year plan. What is one thing you can celebrate today?\n\n"
            "**Remember:** Your child's greatest advantage is having a parent who loves them enough to keep learning and keep trying. That is you."
        )

    # Eating / food
    if any(w in lower for w in ["eat", "food", "picky", "diet", "meal", "feeding", "texture"]):
        return (
            "Food selectivity is extremely common in autism — often linked to sensory sensitivities.\n\n"
            "**Why it happens:**\n"
            "• Texture, smell, color, or temperature can be overwhelming\n"
            "• Transition to new foods requires time and low-pressure exposure\n\n"
            "**Strategies:**\n"
            "1. **Food chaining** — slowly modify preferred foods (e.g., from one brand of nuggets to another)\n"
            "2. **Exposure without pressure** — put new food on the plate with no requirement to eat it\n"
            "3. **Let them play with food** — touching and smelling is a step toward eating\n"
            "4. **Visual supports** — a picture of the meal before it's served reduces surprises\n"
            "5. **Keep mealtimes calm** — avoid battles, turn off TV, reduce distractions\n"
            "6. **Eat together** — modeling is powerful\n\n"
            "If your child's diet is very restricted and you have nutritional concerns, a Registered Dietitian with ASD experience and an OT for feeding therapy can help."
        )

    # General / default
    return (
        "Thank you for reaching out — I'm here to support you every step of the way.\n\n"
        "I can help you with:\n"
        "• **Meltdowns & behavior** — de-escalation, triggers, replacement behaviors\n"
        "• **Speech & communication** — AAC, language delays, encouraging words\n"
        "• **Daily routines** — visual schedules, transitions, morning/bedtime\n"
        "• **Development** — milestones, skills building, play-based learning\n"
        "• **Sensory processing** — sensitivities, calming tools, environment\n"
        "• **Social skills** — friendships, school, peer interaction\n"
        "• **Parent support** — when things feel hard, building resilience\n\n"
        "Tell me more about what you and your child are going through, and I'll give you specific, practical guidance."
    )
