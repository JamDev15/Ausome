"""
Seed script — populates MongoDB with initial data.
Run: docker exec eboyapp_api python -m app.db.seed
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.child_profile import ChildProfile
from app.models.aac import AACCategory, AACItem
from app.models.flashcard import FlashcardDeck, FlashcardCard
from app.models.task import Task, TaskStep, TaskDomain
from app.models.behavior_log import BehaviorLog
from app.models.schedule import ScheduleTemplate
from app.models.reward import Reward, RewardTransaction, DailyStreak
from app.models.goal import Goal, ProgressEntry
from app.models.note import CaregiverNote
from app.models.audit_log import AuditLog
from app.models.ai_conversation import AIConversation, AIMessage


async def seed():
    print("🌱 Seeding database...")

    # ---- Admin user ----
    existing = await User.find_one(User.email == settings.FIRST_ADMIN_EMAIL)
    if not existing:
        admin = User(
            email=settings.FIRST_ADMIN_EMAIL,
            hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
            full_name="Admin",
            role=UserRole.ADMIN,
        )
        await admin.insert()
        print(f"  ✓ Admin user created: {settings.FIRST_ADMIN_EMAIL}")
    else:
        admin = existing
        print(f"  - Admin user already exists")

    # ---- Demo parent user ----
    parent = await User.find_one(User.email == "parent@eboyapp.com")
    if not parent:
        parent = User(
            email="parent@eboyapp.com",
            hashed_password=hash_password("Parent123!"),
            full_name="Demo Parent",
            role=UserRole.PARENT,
        )
        await parent.insert()
        print("  ✓ Demo parent created")

    # ---- Demo child user account ----
    child_user = await User.find_one(User.email == "child@eboyapp.com")
    if not child_user:
        child_user = User(
            email="child@eboyapp.com",
            hashed_password=hash_password("Child123!"),
            full_name="Demo Child",
            role=UserRole.CHILD,
        )
        await child_user.insert()
        print("  ✓ Demo child user created")

    # ---- Demo child ----
    child = await ChildProfile.find_one(ChildProfile.full_name == "Demo Child")
    if not child:
        child = ChildProfile(
            primary_caregiver_id=parent.id,
            full_name="Demo Child",
            nickname="Buddy",
            age=7,
            gender="male",
            communication_level="emerging_verbal",
            asd_support_level="level_2",
            custom_tags=["visual learner", "loves trains"],
        )
        await child.insert()
        print("  ✓ Demo child profile created")

    # ---- AAC Categories ----
    default_categories = [
        {"name": "Core", "icon": "star", "color": "#E8589A", "position": 0, "is_default": True},
        {"name": "Feelings", "icon": "emoticon", "color": "#FF6B6B", "position": 1, "is_default": True},
        {"name": "Food & Drink", "icon": "food", "color": "#FFB347", "position": 2, "is_default": True},
        {"name": "Actions", "icon": "run", "color": "#6BCB77", "position": 3, "is_default": True},
        {"name": "Places", "icon": "map-marker", "color": "#4D96FF", "position": 4, "is_default": True},
        {"name": "People", "icon": "account-group", "color": "#C77DFF", "position": 5, "is_default": True},
        {"name": "Objects", "icon": "cube", "color": "#FF9F1C", "position": 6, "is_default": True},
    ]

    aac_cat_map = {}
    for cat_data in default_categories:
        existing_cat = await AACCategory.find_one(AACCategory.name == cat_data["name"])
        if not existing_cat:
            cat = AACCategory(**cat_data)
            await cat.insert()
            aac_cat_map[cat_data["name"]] = cat
            print(f"  ✓ AAC category: {cat_data['name']}")
        else:
            aac_cat_map[cat_data["name"]] = existing_cat

    # ---- AAC Items ----
    # Proloquo2Go grammar colors
    _PINK  = "#E8589A"   # social / core function words
    _ORANGE = "#F5A623"  # pronouns / people
    _GREEN = "#4CAF82"   # verbs / actions / prepositions
    _BLUE  = "#5B8DEF"   # descriptors / questions
    _RED   = "#E74C3C"   # negation / stop

    aac_items_data = [
        # Core vocabulary (Proloquo2Go-style grammar coloring)
        # pronouns
        ("Core", "I",         "I",              _ORANGE),
        ("Core", "Me",        "Me",             _ORANGE),
        ("Core", "You",       "You",            _ORANGE),
        ("Core", "We",        "We",             _ORANGE),
        # verbs
        ("Core", "Want",      "I want",         _GREEN),
        ("Core", "Need",      "I need",         _GREEN),
        ("Core", "Like",      "I like",         _GREEN),
        ("Core", "Go",        "Go",             _GREEN),
        ("Core", "Get",       "Get",            _GREEN),
        ("Core", "Make",      "Make",           _GREEN),
        ("Core", "Do",        "Do",             _GREEN),
        ("Core", "Have",      "I have",         _GREEN),
        ("Core", "Come",      "Come",           _GREEN),
        ("Core", "See",       "I see",          _GREEN),
        ("Core", "Put",       "Put",            _GREEN),
        ("Core", "Take",      "Take",           _GREEN),
        ("Core", "Eat",       "I want to eat",  _GREEN),
        ("Core", "Play",      "I want to play", _GREEN),
        ("Core", "Is",        "Is",             _PINK),
        ("Core", "Can",       "Can",            _PINK),
        # descriptors
        ("Core", "More",      "More",           _BLUE),
        ("Core", "Good",      "Good",           _BLUE),
        ("Core", "Bad",       "Bad",            _BLUE),
        ("Core", "Big",       "Big",            _BLUE),
        ("Core", "Little",    "Little",         _BLUE),
        ("Core", "Different", "Different",      _BLUE),
        ("Core", "Some",      "Some",           _BLUE),
        ("Core", "All",       "All",            _BLUE),
        ("Core", "Up",        "Up",             _BLUE),
        # question words
        ("Core", "What",      "What",           _BLUE),
        ("Core", "Where",     "Where",          _BLUE),
        ("Core", "Who",       "Who",            _BLUE),
        # prepositions / location
        ("Core", "On",        "On",             _GREEN),
        ("Core", "In",        "In",             _GREEN),
        ("Core", "Out",       "Out",            _GREEN),
        ("Core", "Here",      "Here",           _GREEN),
        ("Core", "There",     "There",          _GREEN),
        ("Core", "For",       "For",            _GREEN),
        ("Core", "Of",        "Of",             _GREEN),
        ("Core", "To",        "To",             _GREEN),
        # social / function
        ("Core", "Yes",       "Yes",            _PINK),
        ("Core", "No",        "No",             _RED),
        ("Core", "Not",       "Not",            _RED),
        ("Core", "Done",      "All done",       _PINK),
        ("Core", "This",      "This",           _PINK),
        ("Core", "That",      "That",           _PINK),
        ("Core", "It",        "It",             _PINK),
        ("Core", "Hello",     "Hello",          _PINK),
        ("Core", "Help",      "Help me",        _PINK),
        ("Core", "Please",    "Please",         _PINK),
        # Feelings
        ("Feelings", "Happy",     "I feel happy"),
        ("Feelings", "Sad",       "I feel sad"),
        ("Feelings", "Angry",     "I feel angry"),
        ("Feelings", "Scared",    "I feel scared"),
        ("Feelings", "Tired",     "I feel tired"),
        ("Feelings", "Excited",   "I feel excited"),
        ("Feelings", "Calm",      "I feel calm"),
        ("Feelings", "Worried",   "I feel worried"),
        ("Feelings", "Surprised", "I feel surprised"),
        ("Feelings", "Proud",     "I feel proud"),
        ("Feelings", "Hurt",      "I feel hurt"),
        ("Feelings", "Hungry",    "I am hungry"),
        ("Feelings", "Thirsty",   "I am thirsty"),
        # Food & Drink
        ("Food & Drink", "Water",       "Water"),
        ("Food & Drink", "Milk",        "Milk"),
        ("Food & Drink", "Juice",       "Juice"),
        ("Food & Drink", "Apple",       "Apple"),
        ("Food & Drink", "Banana",      "Banana"),
        ("Food & Drink", "Bread",       "Bread"),
        ("Food & Drink", "Cookie",      "Cookie"),
        ("Food & Drink", "Cake",        "Cake"),
        ("Food & Drink", "Rice",        "Rice"),
        ("Food & Drink", "Egg",         "Egg"),
        ("Food & Drink", "Pizza",       "Pizza"),
        ("Food & Drink", "Chicken",     "Chicken"),
        ("Food & Drink", "Snack",       "I want a snack"),
        ("Food & Drink", "Lunch",       "It is lunch time"),
        ("Food & Drink", "Breakfast",   "I want breakfast"),
        ("Food & Drink", "Dinner",      "It is dinner time"),
        ("Food & Drink", "Strawberry",  "Strawberry"),
        ("Food & Drink", "Orange",      "Orange"),
        ("Food & Drink", "Carrot",      "Carrot"),
        ("Food & Drink", "Grape",       "Grape"),
        # Actions
        ("Actions", "Help",    "Help me please"),
        ("Actions", "Stop",    "Stop"),
        ("Actions", "Go",      "Go"),
        ("Actions", "Play",    "I want to play"),
        ("Actions", "Eat",     "I want to eat"),
        ("Actions", "Drink",   "I want to drink"),
        ("Actions", "Sleep",   "I want to sleep"),
        ("Actions", "Rest",    "I need a rest"),
        ("Actions", "Walk",    "Let us walk"),
        ("Actions", "Run",     "I want to run"),
        ("Actions", "Jump",    "Jump"),
        ("Actions", "Sit",     "Please sit down"),
        ("Actions", "Read",    "I want to read"),
        ("Actions", "More",    "More please"),
        ("Actions", "Done",    "I am done"),
        ("Actions", "Wait",    "Please wait"),
        ("Actions", "Wash",    "I need to wash my hands"),
        ("Actions", "Listen",  "Please listen"),
        ("Actions", "Share",   "Let us share"),
        # Places
        ("Places", "Home",       "I want to go home"),
        ("Places", "School",     "I am at school"),
        ("Places", "Bathroom",   "I need to use the bathroom"),
        ("Places", "Park",       "I want to go to the park"),
        ("Places", "Hospital",   "I am at the hospital"),
        ("Places", "Store",      "We are at the store"),
        ("Places", "Outside",    "I want to go outside"),
        # People
        ("People", "Mom",      "Mom"),
        ("People", "Dad",      "Dad"),
        ("People", "Teacher",  "Teacher"),
        ("People", "Friend",   "My friend"),
        ("People", "Doctor",   "The doctor"),
        ("People", "Baby",     "The baby"),
        ("People", "Grandma",  "Grandma"),
        ("People", "Grandpa",  "Grandpa"),
        ("People", "Me",       "Me"),
        ("People", "You",      "You"),
        ("People", "We",       "We"),
        # Objects
        ("Objects", "Ball",     "Ball"),
        ("Objects", "Book",     "Book"),
        ("Objects", "Bag",      "Bag"),
        ("Objects", "Bed",      "Bed"),
        ("Objects", "Chair",    "Chair"),
        ("Objects", "Phone",    "Phone"),
        ("Objects", "Car",      "Car"),
        ("Objects", "Bus",      "Bus"),
        ("Objects", "Bicycle",  "Bicycle"),
        ("Objects", "Door",     "Door"),
    ]

    for entry in aac_items_data:
        cat_name, label, audio_text = entry[0], entry[1], entry[2]
        item_color = entry[3] if len(entry) > 3 else None
        cat = aac_cat_map.get(cat_name)
        if cat:
            existing_item = await AACItem.find_one(
                AACItem.category_id == cat.id,
                AACItem.label == label,
            )
            if not existing_item:
                item = AACItem(category_id=cat.id, label=label, audio_text=audio_text, color=item_color)
                await item.insert()

    print("  ✓ AAC items seeded")

    # ---- Flashcard Decks (100 cards total) ----
    DECKS = [
        {
            "title": "Emotions",
            "description": "Learn to name and understand feelings",
            "category": "emotions",
            "color": "#FF6B6B",
            "cards": [
                FlashcardCard(word="Happy", description="Feeling joyful and good inside", example="I feel happy when I play with my friends.", audio_text="Happy", position=0),
                FlashcardCard(word="Sad", description="Feeling unhappy or upset", example="I feel sad when I miss my mom.", audio_text="Sad", position=1),
                FlashcardCard(word="Angry", description="Feeling mad or frustrated", example="I feel angry when someone takes my toy.", audio_text="Angry", position=2),
                FlashcardCard(word="Scared", description="Feeling afraid of something", example="I feel scared of loud noises.", audio_text="Scared", position=3),
                FlashcardCard(word="Calm", description="Feeling peaceful and relaxed", example="I feel calm when I take deep breaths.", audio_text="Calm", position=4),
                FlashcardCard(word="Excited", description="Feeling very happy about something coming", example="I feel excited on my birthday!", audio_text="Excited", position=5),
                FlashcardCard(word="Tired", description="Feeling sleepy and low on energy", example="I feel tired after a long day.", audio_text="Tired", position=6),
                FlashcardCard(word="Surprised", description="Feeling shocked by something unexpected", example="I feel surprised when someone jumps out!", audio_text="Surprised", position=7),
                FlashcardCard(word="Proud", description="Feeling good about something you did", example="I feel proud when I finish my homework.", audio_text="Proud", position=8),
                FlashcardCard(word="Worried", description="Feeling uneasy about something", example="I feel worried when I can't find mom.", audio_text="Worried", position=9),
            ],
        },
        {
            "title": "Animals",
            "description": "Learn the names of animals",
            "category": "animals",
            "color": "#6EC6A1",
            "cards": [
                FlashcardCard(word="Dog", description="A friendly pet that barks", example="The dog wags its tail.", audio_text="Dog", position=0),
                FlashcardCard(word="Cat", description="A soft pet that meows", example="The cat is sleeping on the sofa.", audio_text="Cat", position=1),
                FlashcardCard(word="Bird", description="An animal with wings that can fly", example="The bird sings in the morning.", audio_text="Bird", position=2),
                FlashcardCard(word="Fish", description="An animal that lives in water", example="The fish swims in the tank.", audio_text="Fish", position=3),
                FlashcardCard(word="Rabbit", description="A fluffy animal with long ears", example="The rabbit hops around the garden.", audio_text="Rabbit", position=4),
                FlashcardCard(word="Bear", description="A big furry animal", example="The bear sleeps all winter.", audio_text="Bear", position=5),
                FlashcardCard(word="Lion", description="A big cat with a mane", example="The lion roars loudly.", audio_text="Lion", position=6),
                FlashcardCard(word="Elephant", description="A huge animal with a long trunk", example="The elephant uses its trunk to drink.", audio_text="Elephant", position=7),
                FlashcardCard(word="Duck", description="A bird that swims and quacks", example="The duck swims on the pond.", audio_text="Duck", position=8),
                FlashcardCard(word="Frog", description="A green animal that jumps and croaks", example="The frog jumps into the water.", audio_text="Frog", position=9),
                FlashcardCard(word="Butterfly", description="A pretty insect with colorful wings", example="The butterfly lands on a flower.", audio_text="Butterfly", position=10),
                FlashcardCard(word="Cow", description="A farm animal that gives milk", example="The cow says moo.", audio_text="Cow", position=11),
                FlashcardCard(word="Horse", description="A big animal you can ride", example="The horse runs very fast.", audio_text="Horse", position=12),
                FlashcardCard(word="Monkey", description="A playful animal that climbs trees", example="The monkey swings on the branch.", audio_text="Monkey", position=13),
                FlashcardCard(word="Turtle", description="A slow animal with a shell", example="The turtle hides in its shell.", audio_text="Turtle", position=14),
            ],
        },
        {
            "title": "Food",
            "description": "Learn the names of foods",
            "category": "food",
            "color": "#F7A44A",
            "cards": [
                FlashcardCard(word="Apple", description="A round red or green fruit", example="I eat an apple for a snack.", audio_text="Apple", position=0),
                FlashcardCard(word="Banana", description="A yellow curved fruit", example="I peel the banana before eating it.", audio_text="Banana", position=1),
                FlashcardCard(word="Bread", description="A baked food made from flour", example="I eat bread with butter.", audio_text="Bread", position=2),
                FlashcardCard(word="Milk", description="A white drink that comes from cows", example="I drink milk every morning.", audio_text="Milk", position=3),
                FlashcardCard(word="Egg", description="A food with a white and a yolk", example="Mom cooks an egg for breakfast.", audio_text="Egg", position=4),
                FlashcardCard(word="Rice", description="Small white grains we cook and eat", example="I eat rice with my dinner.", audio_text="Rice", position=5),
                FlashcardCard(word="Pizza", description="A round flat bread with toppings", example="Pizza has cheese and tomato sauce.", audio_text="Pizza", position=6),
                FlashcardCard(word="Cookie", description="A small sweet baked treat", example="I eat a cookie after lunch.", audio_text="Cookie", position=7),
                FlashcardCard(word="Cake", description="A sweet dessert for special days", example="We eat cake on birthdays.", audio_text="Cake", position=8),
                FlashcardCard(word="Orange", description="A round orange fruit full of juice", example="I squeeze an orange for juice.", audio_text="Orange", position=9),
                FlashcardCard(word="Carrot", description="An orange vegetable that grows in the ground", example="The carrot is crunchy and sweet.", audio_text="Carrot", position=10),
                FlashcardCard(word="Strawberry", description="A red sweet fruit with seeds on top", example="I put strawberries in my yogurt.", audio_text="Strawberry", position=11),
                FlashcardCard(word="Grape", description="A small sweet fruit that grows in bunches", example="I eat grapes as a snack.", audio_text="Grape", position=12),
                FlashcardCard(word="Watermelon", description="A big green fruit with red inside", example="Watermelon is juicy and cool.", audio_text="Watermelon", position=13),
                FlashcardCard(word="Chicken", description="A food made from chicken meat", example="I eat chicken for dinner.", audio_text="Chicken", position=14),
            ],
        },
        {
            "title": "Actions",
            "description": "Learn action words",
            "category": "actions",
            "color": "#5B8DEF",
            "cards": [
                FlashcardCard(word="Eat", description="Put food in your mouth and chew", example="I eat my lunch at noon.", audio_text="Eat", position=0),
                FlashcardCard(word="Drink", description="Swallow a liquid", example="I drink water when I am thirsty.", audio_text="Drink", position=1),
                FlashcardCard(word="Sleep", description="Close your eyes and rest", example="I sleep at night in my bed.", audio_text="Sleep", position=2),
                FlashcardCard(word="Play", description="Have fun with toys or friends", example="I play in the park after school.", audio_text="Play", position=3),
                FlashcardCard(word="Run", description="Move fast with your legs", example="I run in the playground.", audio_text="Run", position=4),
                FlashcardCard(word="Walk", description="Move slowly on your feet", example="I walk to school every day.", audio_text="Walk", position=5),
                FlashcardCard(word="Jump", description="Push off the ground with both feet", example="I jump over the puddle.", audio_text="Jump", position=6),
                FlashcardCard(word="Sit", description="Rest on a chair or the floor", example="I sit at my desk to learn.", audio_text="Sit", position=7),
                FlashcardCard(word="Stop", description="Do not move or do the action anymore", example="Stop at the red light.", audio_text="Stop", position=8),
                FlashcardCard(word="Help", description="Give support to someone who needs it", example="I help mom carry the bags.", audio_text="Help", position=9),
                FlashcardCard(word="Share", description="Give some of what you have to others", example="I share my crayons with my friend.", audio_text="Share", position=10),
                FlashcardCard(word="Listen", description="Pay attention to sounds or words", example="I listen to my teacher.", audio_text="Listen", position=11),
                FlashcardCard(word="Wait", description="Stay still until it is your turn", example="I wait in line at the store.", audio_text="Wait", position=12),
                FlashcardCard(word="Wash", description="Clean with water and soap", example="I wash my hands before eating.", audio_text="Wash", position=13),
                FlashcardCard(word="Read", description="Look at words and understand them", example="I read a book before bed.", audio_text="Read", position=14),
            ],
        },
        {
            "title": "People",
            "description": "Learn about the people around us",
            "category": "people",
            "color": "#C3AED6",
            "cards": [
                FlashcardCard(word="Mom", description="Your female parent who loves and cares for you", example="Mom gives me a hug when I am sad.", audio_text="Mom", position=0),
                FlashcardCard(word="Dad", description="Your male parent who loves and cares for you", example="Dad reads me a story at night.", audio_text="Dad", position=1),
                FlashcardCard(word="Baby", description="A very young child who cannot walk yet", example="The baby is sleeping in the crib.", audio_text="Baby", position=2),
                FlashcardCard(word="Teacher", description="A person who helps you learn at school", example="My teacher writes on the board.", audio_text="Teacher", position=3),
                FlashcardCard(word="Doctor", description="A person who helps you when you are sick", example="The doctor checks my ears.", audio_text="Doctor", position=4),
                FlashcardCard(word="Friend", description="Someone you like to play and spend time with", example="My friend and I play together.", audio_text="Friend", position=5),
                FlashcardCard(word="Boy", description="A male child", example="The boy is playing with a ball.", audio_text="Boy", position=6),
                FlashcardCard(word="Girl", description="A female child", example="The girl is drawing a picture.", audio_text="Girl", position=7),
                FlashcardCard(word="Grandma", description="Your parent's mother", example="Grandma bakes cookies for us.", audio_text="Grandma", position=8),
                FlashcardCard(word="Grandpa", description="Your parent's father", example="Grandpa tells me funny stories.", audio_text="Grandpa", position=9),
            ],
        },
        {
            "title": "Colors",
            "description": "Learn color names",
            "category": "colors",
            "color": "#4ECDC4",
            "cards": [
                FlashcardCard(word="Red", description="The color of apples and stop signs", example="My shirt is red.", audio_text="Red", position=0),
                FlashcardCard(word="Blue", description="The color of the sky and water", example="The sky is bright blue.", audio_text="Blue", position=1),
                FlashcardCard(word="Green", description="The color of grass and leaves", example="The grass is green.", audio_text="Green", position=2),
                FlashcardCard(word="Yellow", description="The color of the sun and bananas", example="The sun is big and yellow.", audio_text="Yellow", position=3),
                FlashcardCard(word="Orange", description="A warm color like oranges and fire", example="The pumpkin is orange.", audio_text="Orange", position=4),
                FlashcardCard(word="Purple", description="A color made from red and blue", example="The grapes are purple.", audio_text="Purple", position=5),
                FlashcardCard(word="Pink", description="A soft light red color", example="The flower is pink.", audio_text="Pink", position=6),
                FlashcardCard(word="White", description="The lightest color, like snow", example="The clouds are white.", audio_text="White", position=7),
                FlashcardCard(word="Black", description="The darkest color, like the night sky", example="My shoes are black.", audio_text="Black", position=8),
                FlashcardCard(word="Brown", description="The color of wood and chocolate", example="The tree trunk is brown.", audio_text="Brown", position=9),
            ],
        },
        {
            "title": "Places",
            "description": "Learn about different places",
            "category": "places",
            "color": "#FF8B94",
            "cards": [
                FlashcardCard(word="Home", description="The place where you live with your family", example="I feel safe at home.", audio_text="Home", position=0),
                FlashcardCard(word="School", description="The place where children go to learn", example="I go to school on weekdays.", audio_text="School", position=1),
                FlashcardCard(word="Park", description="An outdoor place with grass and trees to play", example="We play at the park on weekends.", audio_text="Park", position=2),
                FlashcardCard(word="Hospital", description="A place where doctors help sick people", example="The doctor works at the hospital.", audio_text="Hospital", position=3),
                FlashcardCard(word="Store", description="A place where you buy things", example="Mom buys food at the store.", audio_text="Store", position=4),
            ],
        },
        {
            "title": "Objects",
            "description": "Learn the names of everyday objects",
            "category": "objects",
            "color": "#A78BFA",
            "cards": [
                FlashcardCard(word="Ball", description="A round toy you can throw and catch", example="I kick the ball in the garden.", audio_text="Ball", position=0),
                FlashcardCard(word="Book", description="Pages with words and pictures to read", example="I read a book before bedtime.", audio_text="Book", position=1),
                FlashcardCard(word="Bag", description="A container you carry your things in", example="I put my lunch in my bag.", audio_text="Bag", position=2),
                FlashcardCard(word="Chair", description="A seat with four legs and a back", example="I sit on a chair at school.", audio_text="Chair", position=3),
                FlashcardCard(word="Bed", description="A soft piece of furniture for sleeping", example="I sleep in my bed at night.", audio_text="Bed", position=4),
                FlashcardCard(word="Door", description="A panel you open to enter a room", example="I knock on the door before entering.", audio_text="Door", position=5),
                FlashcardCard(word="Car", description="A vehicle with four wheels", example="Dad drives the car to work.", audio_text="Car", position=6),
                FlashcardCard(word="Bus", description="A big vehicle that carries many people", example="I take the bus to school.", audio_text="Bus", position=7),
                FlashcardCard(word="Bicycle", description="A two-wheeled vehicle you pedal", example="I ride my bicycle in the park.", audio_text="Bicycle", position=8),
                FlashcardCard(word="Phone", description="A device used to call and message people", example="Mom calls me on the phone.", audio_text="Phone", position=9),
            ],
        },
        {
            "title": "Numbers",
            "description": "Learn to count from one to five",
            "category": "numbers",
            "color": "#F59E0B",
            "cards": [
                FlashcardCard(word="One", description="The first number, a single thing", example="I have one apple.", audio_text="One", position=0),
                FlashcardCard(word="Two", description="One more than one, a pair", example="I have two shoes.", audio_text="Two", position=1),
                FlashcardCard(word="Three", description="One more than two", example="I see three birds.", audio_text="Three", position=2),
                FlashcardCard(word="Four", description="One more than three", example="A dog has four legs.", audio_text="Four", position=3),
                FlashcardCard(word="Five", description="One more than four, the fingers on one hand", example="I have five fingers.", audio_text="Five", position=4),
            ],
        },
        {
            "title": "Daily Routine",
            "description": "Steps through your daily day",
            "category": "routines",
            "color": "#4D96FF",
            "cards": [
                FlashcardCard(word="Wake Up", description="Open your eyes and get out of bed", example="I wake up when the alarm rings.", audio_text="Wake up", position=0),
                FlashcardCard(word="Brush Teeth", description="Clean your teeth with a toothbrush", example="I brush my teeth for two minutes.", audio_text="Brush your teeth", position=1),
                FlashcardCard(word="Get Dressed", description="Put on your clothes for the day", example="I get dressed after my shower.", audio_text="Get dressed", position=2),
                FlashcardCard(word="Eat Breakfast", description="Eat the first meal of the day", example="I eat breakfast every morning.", audio_text="Eat breakfast", position=3),
                FlashcardCard(word="Pack Bag", description="Put your things in your bag to go", example="I pack my bag the night before.", audio_text="Pack your bag", position=4),
            ],
        },
    ]

    for deck_data in DECKS:
        existing = await FlashcardDeck.find_one(FlashcardDeck.title == deck_data["title"])
        if not existing:
            deck = FlashcardDeck(
                title=deck_data["title"],
                description=deck_data["description"],
                category=deck_data["category"],
                color=deck_data["color"],
                is_default=True,
                cards=deck_data["cards"],
            )
            await deck.insert()
            print(f"  ✓ {deck_data['title']} flashcard deck created ({len(deck_data['cards'])} cards)")

    # ---- Task templates ----
    task_templates = [
        {
            "title": "Brush Teeth",
            "domain": TaskDomain.HYGIENE,
            "token_reward": 2,
            "is_template": True,
            "steps": [
                TaskStep(title="Get toothbrush", position=0),
                TaskStep(title="Put toothpaste on brush", position=1),
                TaskStep(title="Brush for 2 minutes", position=2),
                TaskStep(title="Rinse mouth", position=3),
            ],
        },
        {
            "title": "Get Dressed",
            "domain": TaskDomain.DRESSING,
            "token_reward": 2,
            "is_template": True,
            "steps": [
                TaskStep(title="Choose clothes", position=0),
                TaskStep(title="Put on shirt", position=1),
                TaskStep(title="Put on pants", position=2),
                TaskStep(title="Put on socks and shoes", position=3),
            ],
        },
        {
            "title": "Wash Hands",
            "domain": TaskDomain.HYGIENE,
            "token_reward": 1,
            "is_template": True,
            "steps": [
                TaskStep(title="Turn on water", position=0),
                TaskStep(title="Apply soap", position=1),
                TaskStep(title="Scrub for 20 seconds", position=2),
                TaskStep(title="Rinse and dry", position=3),
            ],
        },
    ]

    for t_data in task_templates:
        existing_task = await Task.find_one(Task.title == t_data["title"], Task.is_template == True)
        if not existing_task:
            task = Task(**t_data)
            await task.insert()
            print(f"  ✓ Task template: {t_data['title']}")

    print("\n✅ Seed complete!")


async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB]

    await init_beanie(
        database=db,
        document_models=[
            User, ChildProfile, AACCategory, AACItem,
            FlashcardDeck, Task, BehaviorLog, ScheduleTemplate,
            Reward, RewardTransaction, DailyStreak,
            Goal, ProgressEntry, CaregiverNote,
            AuditLog, AIConversation, AIMessage,
        ],
    )
    await seed()


if __name__ == "__main__":
    asyncio.run(main())
