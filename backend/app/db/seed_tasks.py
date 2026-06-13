"""
Seed task programs — called from seed.py or separately.
Adds default life-skills task templates available to all users.
"""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import TaskProgram, TaskStep, TaskDomain


async def seed_task_templates(db: AsyncSession):
    templates = [
        {
            "title": "Washing Hands",
            "domain": TaskDomain.HYGIENE,
            "token_reward": 1,
            "steps": [
                ("Turn on the water", "Turn the tap to warm water"),
                ("Wet your hands", "Put both hands under the water"),
                ("Add soap", "Press the soap pump once"),
                ("Scrub for 20 seconds", "Rub hands together — sing the ABCs!"),
                ("Rinse off soap", "Hold hands under running water"),
                ("Turn off the water", "Use your elbow or a towel"),
                ("Dry your hands", "Use the hand towel — pat dry"),
            ],
        },
        {
            "title": "Brushing Teeth",
            "domain": TaskDomain.HYGIENE,
            "token_reward": 1,
            "steps": [
                ("Get your toothbrush", "Take your toothbrush from the holder"),
                ("Add toothpaste", "A small pea-sized amount is enough"),
                ("Brush top teeth", "Brush back and forth — 30 seconds"),
                ("Brush bottom teeth", "Brush back and forth — 30 seconds"),
                ("Brush the front", "Gentle circles on the front teeth"),
                ("Brush your tongue", "Gentle brush — removes bad breath"),
                ("Rinse your mouth", "Sip water, swish, spit"),
                ("Rinse your toothbrush", "Hold under water until clean"),
            ],
        },
        {
            "title": "Getting Dressed",
            "domain": TaskDomain.DRESSING,
            "token_reward": 2,
            "steps": [
                ("Get your clothes", "Find clothes laid out or in your drawer"),
                ("Put on underwear", "Step into underwear and pull up"),
                ("Put on shirt", "Arms in first, then head through"),
                ("Put on pants", "One leg at a time, then pull up"),
                ("Put on socks", "Heel at the back, pull up"),
                ("Put on shoes", "Right shoe on right foot — press velcro"),
            ],
        },
        {
            "title": "Cleaning Up Toys",
            "domain": TaskDomain.CLEANING,
            "token_reward": 2,
            "steps": [
                ("Find all your toys", "Look around the room"),
                ("Pick up toys", "One by one, carry them to the box"),
                ("Put toys in the bin", "Each toy in its right place"),
                ("Check the floor", "Walk around — any left behind?"),
                ("Tell a grown-up you're done", "Say 'I'm finished!' or tap done"),
            ],
        },
        {
            "title": "Eating a Meal",
            "domain": TaskDomain.EATING,
            "token_reward": 2,
            "steps": [
                ("Wash your hands first", "Clean hands before eating"),
                ("Sit at the table", "Find your chair and sit down"),
                ("Wait for your food", "Hands in your lap — wait calmly"),
                ("Use your fork or spoon", "Pick up the right tool for your food"),
                ("Take small bites", "Small bites are easier to chew"),
                ("Chew with mouth closed", "Quiet chewing is polite"),
                ("Use a napkin if needed", "Wipe your face with the napkin"),
                ("Finish and clear your plate", "Carry your plate to the sink"),
            ],
        },
    ]

    for t in templates:
        program = TaskProgram(
            title=t["title"],
            domain=t["domain"],
            token_reward=t["token_reward"],
            is_template=True,
            is_active=True,
        )
        db.add(program)
        await db.flush()

        for idx, (step_title, step_instruction) in enumerate(t["steps"]):
            db.add(TaskStep(
                program_id=program.id,
                title=step_title,
                instruction=step_instruction,
                position=idx,
            ))

    print(f"  ✅ Seeded {len(templates)} task templates")
