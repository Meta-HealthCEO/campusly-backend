const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');

let blockNum = 0;
function bid() { return 'block-' + String(++blockNum).padStart(3, '0'); }

function t(order, content) {
  return { blockId: bid(), type: 'text', order, content, points: 0, hints: [], explanation: '', metadata: {}, curriculumNodeId: null, cognitiveLevel: null };
}
function q(order, question, options, correctIndex, explanation, hints) {
  return {
    blockId: bid(), type: 'quiz', order,
    content: JSON.stringify({ question, options, correctIndex }),
    points: 1, hints: hints || [], explanation: explanation || '',
    metadata: { options, correctIndex }, curriculumNodeId: null, cognitiveLevel: null,
  };
}
function fb(order, text, blanks, explanation, hints) {
  return {
    blockId: bid(), type: 'fill_blank', order,
    content: JSON.stringify({ text, blanks }),
    points: blanks.length, hints: hints || [], explanation: explanation || '',
    metadata: { blanks }, curriculumNodeId: null, cognitiveLevel: null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 1: All About Me (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## All About Me\n\nWelcome to Grade 4 Life Orientation! This year you will learn many exciting things about yourself, other people, and the world around you. Let us start with the most important topic of all: **YOU!**\n\nEvery person in the world is different. Nobody else has the same fingerprints, the same smile, or the same thoughts as you. You are **one of a kind**.\n\nThink about these questions:\n- What is your name and what does it mean?\n- What language do you speak at home?\n- What do you enjoy doing after school?\n- What makes you smile?\n\nIn South Africa, we have many different cultures and languages. Some children speak isiZulu at home, some speak Afrikaans, some speak Setswana, and some speak English. This is what makes our Rainbow Nation so beautiful!'),
  t(2, '### My Strengths\n\nA **strength** is something you are good at. Everyone has strengths! You might not always notice them, but they are there.\n\nHere are some examples of strengths:\n- Being kind to animals\n- Sharing your lunch with a friend\n- Being good at drawing or colouring\n- Helping your gogo carry her bags\n- Being brave when you try something new\n- Making people laugh\n- Running fast at break time\n\nYour strengths do not have to be about schoolwork. Being a good friend is a strength. Being a good listener is a strength. Helping at home is a strength.\n\n**Activity:** Think of three things you are good at. It could be anything at all! Tell your friend next to you about one of your strengths.'),
  q(3, 'Thandi is very good at sharing her crayons with her friends. She always makes sure everyone has a colour to use. What strength does Thandi have?',
    ['She is kind and generous', 'She is good at running', 'She is the smartest in her class', 'She has the most crayons'], 0,
    'Sharing with others is a sign of being kind and generous. This is a wonderful strength! You do not need to be the best at schoolwork to have great strengths.'),
  t(4, '### My Family\n\nFamilies come in all shapes and sizes. Some children live with their mom and dad. Some live with their gogo (grandmother) or their aunt. Some have many brothers and sisters, and some are the only child.\n\n**All families are special.** What matters most is that the people in your family love you and take care of you.\n\nIn South Africa, family is very important. Many families live together in extended families — this means grandparents, aunts, uncles, and cousins might all live close together or even in the same house. This is a beautiful part of our culture.\n\n**Things families do together:**\n- Eating meals together\n- Telling stories\n- Going to church, mosque, or temple\n- Celebrating birthdays and holidays\n- Helping each other with chores\n- Looking after younger children'),
  fb(5, 'Every person in the world is different. Nobody else has the same ___ as you. In South Africa, we call our country the ___ Nation because we have so many different cultures.',
    ['fingerprints', 'Rainbow'],
    'Your fingerprints are unique to you — no one else in the world has the same ones. South Africa is called the Rainbow Nation because of all the different cultures, languages, and people living together.'),
  t(6, '### Being Proud of Myself\n\nBeing proud of yourself does not mean showing off or boasting. It means feeling good about who you are and the things you do.\n\nYou can feel proud when you:\n- Try your best at something, even if you do not get it right the first time\n- Help someone who needs it\n- Learn something new\n- Stand up for what is right\n- Are honest, even when it is hard\n\n**Respecting differences:**\nYour classmates might look different from you, speak a different language, or celebrate different holidays. That is okay! In fact, it is wonderful. Imagine how boring the world would be if everyone was exactly the same.\n\nRespecting differences means:\n- Not making fun of how someone looks or talks\n- Being interested in other people\'s cultures\n- Including everyone in games and activities\n- Remembering that different does NOT mean wrong'),
  q(7, 'Buhle says she is proud because she helped her little brother tie his shoes this morning. Is this a good reason to feel proud?',
    ['Yes, helping others is always something to be proud of', 'No, tying shoes is too easy to be proud of', 'No, only schoolwork achievements count', 'Yes, but only if her teacher saw her do it'], 0,
    'Helping others, even with small things, is always something to be proud of. You do not need to do something big and famous to feel proud. Small acts of kindness matter a lot!'),
  q(8, 'Which of these shows respect for differences?',
    ['Asking your friend to teach you a greeting in their home language', 'Laughing at someone\'s traditional clothes', 'Only playing with children who look like you', 'Saying your culture is better than someone else\'s'], 0,
    'Asking someone to teach you about their language or culture shows respect and curiosity. It makes the other person feel valued and helps you learn something new.'),
  fb(9, 'A ___ is something you are good at. Being a good ___ is a strength, even if it is not about schoolwork.',
    ['strength', 'friend'],
    'A strength is any quality or skill that you are good at. Being a good friend — someone who listens, shares, and cares — is one of the most important strengths a person can have.'),
  t(10, '### Summary: All About Me\n\n**Key ideas from this chapter:**\n- You are unique and special — there is nobody else exactly like you\n- Everyone has strengths, and they are not always about schoolwork\n- Families come in all shapes and sizes, and all families are special\n- Being proud of yourself means feeling good about who you are and what you do\n- Respecting differences makes our Rainbow Nation stronger\n\n**Remember:** You are important just the way you are!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Healthy Living (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Healthy Living\n\nYour body is amazing! It helps you run, play, think, and learn every single day. But to work properly, your body needs you to take good care of it. Taking care of your body is called **healthy living**.\n\nHealthy living has many parts:\n- Eating the right foods\n- Drinking enough water\n- Exercising and playing\n- Getting enough sleep\n- Keeping your body clean\n\nWhen you look after your body, you feel strong, happy, and full of energy. When you do not look after your body, you might feel tired, sick, or grumpy.\n\nLet us learn about each part of healthy living!'),
  t(2, '### Eating Healthy Food\n\nYour body needs healthy food to grow strong and give you energy. Think of food as fuel for your body — just like a car needs petrol to drive, your body needs good food to work.\n\n**Healthy foods to eat every day:**\n- **Fruit and vegetables** — apples, bananas, spinach, carrots, butternut, tomatoes\n- **Grains and starches** — pap, bread, rice, samp\n- **Protein** — chicken, fish, eggs, beans, lentils\n- **Dairy** — milk, yoghurt, cheese (amasi is also very healthy!)\n\n**Foods to eat only sometimes (treats):**\n- Sweets and chocolates\n- Chips and crisps\n- Fizzy drinks like Coke and Fanta\n- Fried foods like vetkoek (only sometimes!)\n\nIn South Africa, we have many delicious healthy foods. Pap and morogo (wild spinach) is a traditional meal that is very nutritious. Amasi is full of good bacteria that help your stomach.'),
  q(3, 'Which of these is the healthiest choice for lunch?',
    ['Pap with beans and spinach', 'A packet of chips and a fizzy drink', 'Sweets and a chocolate bar', 'Only bread with nothing on it'], 0,
    'Pap with beans and spinach gives your body starch for energy, protein from the beans, and vitamins from the spinach. This is a balanced, healthy, and traditional South African meal!'),
  t(4, '### Drinking Water and Exercise\n\n**Water is the best drink for your body.** You should try to drink at least 6 glasses of water every day. Water helps your body in many ways:\n- It keeps you from getting thirsty and tired\n- It helps your brain think clearly\n- It keeps your skin healthy\n- It helps your body get rid of waste\n\nIn South Africa, clean water is precious. Not everyone has a tap in their home. If you do, be grateful and do not waste water!\n\n**Exercise:**\nYour body is made to move! Children should be active for at least 60 minutes every day. This does not have to be at a gym — playing outside counts!\n\n**Fun ways to exercise:**\n- Playing catch or tag with friends\n- Skipping rope\n- Dancing to your favourite music\n- Riding a bicycle\n- Playing soccer or netball\n- Walking to school instead of getting a lift'),
  fb(5, 'You should drink at least ___ glasses of water every day. Children should be active for at least ___ minutes every day.',
    ['6', '60'],
    'Drinking 6 glasses of water keeps your body hydrated and your brain working well. Being active for 60 minutes (one hour) keeps your body strong and healthy.'),
  t(6, '### Sleep and Keeping Clean\n\n**Sleep:**\nSleep is when your body repairs itself and your brain organises everything you learned during the day. Grade 4 learners need about **9 to 11 hours of sleep** every night.\n\n**Tips for good sleep:**\n- Go to bed at the same time every night\n- Do not watch TV or play on a phone right before bed\n- Make sure your room is dark and quiet\n- Read a book or tell a story before sleeping\n\n**Keeping clean:**\nGerms are tiny living things that can make you sick. You cannot see them, but they are everywhere! Keeping clean helps keep germs away.\n\n**Daily hygiene habits:**\n- Wash your hands with soap before eating and after using the toilet\n- Brush your teeth twice a day — morning and night\n- Bath or shower every day\n- Wear clean clothes\n- Cover your mouth when you cough or sneeze (use your elbow, not your hand!)'),
  q(7, 'How many hours of sleep does a Grade 4 learner need every night?',
    ['9 to 11 hours', '4 to 5 hours', '12 to 14 hours', 'It does not matter how many hours you sleep'], 0,
    'Grade 4 learners need about 9 to 11 hours of sleep every night. Sleep helps your body grow, your brain learn, and your mood stay happy.'),
  q(8, 'Why should you cover your mouth with your elbow when you cough, instead of your hand?',
    ['Because germs on your hand can spread to things you touch and to other people', 'Because your elbow is cleaner than your hand', 'Because it looks more polite', 'Because your teacher told you to'], 0,
    'When you cough into your hand, the germs get on your hand. Then everything you touch — door handles, books, your friend\'s hand — can spread those germs. Your elbow does not touch other things, so it is safer.'),
  fb(9, 'Germs are tiny living things that can make you ___. You should wash your hands with ___ before eating and after using the toilet.',
    ['sick', 'soap'],
    'Germs are too small to see, but they can cause illness. Washing your hands with soap is one of the best ways to get rid of germs and stay healthy.'),
  t(10, '### Summary: Healthy Living\n\n**Key ideas from this chapter:**\n- Eat a variety of healthy foods every day — fruit, vegetables, grains, protein, and dairy\n- Drink at least 6 glasses of water every day\n- Be active for at least 60 minutes every day\n- Sleep 9 to 11 hours every night\n- Keep clean by washing your hands, brushing your teeth, and bathing daily\n- Cover your coughs and sneezes with your elbow to stop germs spreading\n\n**Remember:** A healthy body helps you learn better and have more fun!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Feelings and Emotions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Feelings and Emotions\n\nEvery single person in the world has feelings. Feelings are also called **emotions**. They are the way your heart and mind react to what happens around you.\n\nSome common feelings are:\n- **Happy** — when something good happens, like getting a gold star\n- **Sad** — when something bad happens, like losing a pet\n- **Angry** — when something feels unfair, like someone taking your turn\n- **Scared** — when you feel in danger or worried about something\n- **Excited** — when you cannot wait for something, like your birthday\n- **Shy** — when you feel nervous around new people\n- **Proud** — when you do something well\n\nAll feelings are **normal**. There is no such thing as a "bad" feeling. Even angry and sad feelings are okay to have. What matters is what you DO with your feelings.'),
  t(2, '### Expressing Feelings in Healthy Ways\n\nSometimes feelings are very strong. You might feel SO angry that you want to shout or hit something. You might feel SO sad that you want to cry all day. These big feelings can be hard to manage.\n\n**Healthy ways to deal with big feelings:**\n\n| Feeling | Healthy Choice | Unhealthy Choice |\n|---------|---------------|------------------|\n| Angry | Take deep breaths and count to 10 | Hit, kick, or break things |\n| Sad | Talk to someone you trust | Keep it all inside and hide |\n| Scared | Tell an adult who can help | Pretend everything is fine |\n| Frustrated | Take a break and try again later | Give up and refuse to try |\n| Jealous | Be happy for the other person | Say mean things about them |\n\n**The "traffic light" trick:**\n- **RED** — Stop! Do not react yet.\n- **YELLOW** — Think! What are my choices?\n- **GREEN** — Go! Choose the best action.\n\nThis trick helps you pause before you act, so you do not do something you will regret.'),
  q(3, 'Thabo is very angry because someone broke his pencil. He wants to push the person who did it. What should Thabo do FIRST?',
    ['Stop, take deep breaths, and count to 10 before doing anything', 'Push the person back immediately', 'Break something that belongs to the other person', 'Shout and scream at the person'], 0,
    'When you feel very angry, the first thing to do is STOP and calm down. Taking deep breaths and counting to 10 gives your brain time to think clearly. Then you can choose a better action, like telling the teacher.'),
  t(4, '### Talking About Feelings\n\nOne of the most important things you can learn is how to **talk about your feelings**. When you keep feelings locked inside, they can grow bigger and bigger until they feel like they are going to burst.\n\n**How to talk about feelings:**\n- Use "I feel" sentences: "I feel sad because..." or "I feel angry when..."\n- Talk to someone you trust — a parent, teacher, grandparent, or friend\n- You can also write your feelings in a journal or draw a picture\n\n**Examples of "I feel" sentences:**\n- "I feel left out when you do not invite me to play."\n- "I feel happy when we read stories together."\n- "I feel worried about the test tomorrow."\n\nSometimes boys are told they should not cry or show their feelings. This is NOT true. **Everyone** — boys and girls — has feelings, and it is healthy to express them.'),
  fb(5, 'There is no such thing as a "bad" ___. What matters is what you ___ with your feelings.',
    ['feeling', 'do'],
    'All feelings are normal and natural. Feeling angry, sad, or scared does not make you a bad person. What matters is choosing healthy ways to express those feelings, like talking about them or taking deep breaths.'),
  t(6, '### Being Kind to Others\n\nJust like you have feelings, every other person has feelings too. When you are kind to others, you help them feel happy and safe. When you are unkind, you can hurt their feelings.\n\n**Ways to be kind every day:**\n- Say "please" and "thank you"\n- Smile at someone who looks sad\n- Include someone who is standing alone at break time\n- Say something nice to a classmate: "I like your drawing!" or "You did well in the test!"\n- Help someone who dropped their books\n- Share your food if someone forgot their lunch\n\n**Empathy** means understanding how another person feels. It is like putting yourself in their shoes. Before you say or do something, ask yourself: "How would I feel if someone did this to me?"\n\nIn South Africa, we believe in **ubuntu** — the idea that we are all connected. When you are kind to someone, it makes the whole community stronger.'),
  q(7, 'Naledi notices that a new girl in her class is sitting alone at break time and looks sad. What is the BEST thing Naledi can do?',
    ['Go over and invite the new girl to play with her and her friends', 'Ignore the new girl because she is not Naledi\'s problem', 'Tell the teacher to deal with it', 'Wait for the new girl to come and ask to play'], 0,
    'Going over and inviting the new girl to play shows empathy and kindness. Starting at a new school is scary, and a friendly invitation can make a huge difference. This is ubuntu in action!'),
  q(8, 'What does the "traffic light" trick help you do when you have a big feeling?',
    ['Stop and think before you act', 'Pretend you do not have any feelings', 'Run away from the situation', 'Always do what you feel like doing'], 0,
    'The traffic light trick (Red = Stop, Yellow = Think, Green = Go) helps you pause before reacting. This gives your brain time to choose a smart and healthy action instead of doing something you might regret.'),
  fb(9, '___ means understanding how another person feels. In South Africa, we believe in ___ — the idea that we are all connected.',
    ['Empathy', 'ubuntu'],
    'Empathy means imagining yourself in someone else\'s shoes so you can understand their feelings. Ubuntu is the African philosophy that teaches us we are all connected and should care for one another.'),
  t(10, '### Summary: Feelings and Emotions\n\n**Key ideas from this chapter:**\n- Everyone has feelings, and all feelings are normal\n- There is no such thing as a "bad" feeling — it is what you DO with your feelings that matters\n- Use the "traffic light" trick: Stop, Think, Go\n- Talk about your feelings using "I feel" sentences\n- Everyone — boys and girls — should express their feelings in healthy ways\n- Being kind and showing empathy makes our community stronger\n- Ubuntu teaches us that we are all connected\n\n**Remember:** Your feelings matter, and so do everyone else\'s!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: My Body (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## My Body\n\nYour body is precious and belongs only to you. Nobody else has the right to hurt your body or make you feel uncomfortable. In this chapter, you will learn about taking care of your body and keeping yourself safe.\n\nYour body does amazing things every day:\n- Your heart beats about 100 000 times a day to pump blood around your body\n- Your lungs breathe in and out about 20 000 times a day\n- Your brain controls everything — thinking, moving, feeling, and even dreaming\n- Your bones, muscles, and skin protect the important parts inside\n\nBecause your body does so much for you, it is important to treat it with care and respect.'),
  t(2, '### Taking Care of Your Body\n\nHere are important ways to take care of your body every day:\n\n**Eat healthy food** — Your body needs good fuel to work properly. Eat fruit, vegetables, and protein every day.\n\n**Drink water** — Water keeps your body hydrated and helps your brain think.\n\n**Exercise** — Moving your body keeps your muscles strong and your heart healthy.\n\n**Rest** — Your body needs sleep to grow and repair itself. Turn off screens at least 30 minutes before bed.\n\n**Protect yourself from the sun** — The South African sun is very strong! Wear a hat, use sunscreen, and find shade during the hottest part of the day (between 11:00 and 15:00).\n\n**Visit the dentist and doctor** — Regular check-ups help catch problems early.\n\n**Keep clean** — Wash your hands, brush your teeth, and bath every day to keep germs away.'),
  q(3, 'During which time of day is the South African sun strongest and most dangerous for your skin?',
    ['Between 11:00 and 15:00', 'Early in the morning at 6:00', 'Late at night', 'The sun is never dangerous'], 0,
    'The sun is at its strongest between 11:00 and 15:00 in South Africa. During this time, it is important to wear a hat, use sunscreen, and stay in the shade as much as possible to protect your skin.'),
  t(4, '### Good Touch and Bad Touch\n\nTouches can be divided into three groups:\n\n**Good touches** make you feel safe, loved, and cared for:\n- A hug from your mom or dad\n- A high-five from your friend\n- A pat on the back from your teacher when you did well\n- Holding your gogo\'s hand when you cross the road\n\n**Bad touches** make you feel scared, uncomfortable, or confused:\n- When someone touches your private body parts (the parts covered by your underwear/swimming costume)\n- When someone hurts you on purpose — hitting, pinching, kicking\n- Any touch that someone tells you to keep a secret\n\n**Confusing touches** might start as okay but then feel wrong:\n- Tickling that does not stop when you say "stop"\n- A hug that lasts too long and feels uncomfortable\n\n**Important rule:** Your private body parts are YOURS. Nobody should touch them except a doctor during a check-up (and your parent or caregiver should be with you).'),
  fb(5, 'Your private body parts are the parts covered by your ___. If someone gives you a bad touch, you should say ___ loudly and clearly.',
    ['underwear', 'no'],
    'The parts of your body covered by your underwear or swimming costume are private. If anyone tries to touch you in a way that makes you feel uncomfortable, you have the right to say "no" loudly and firmly.'),
  t(6, '### Saying No and Telling a Trusted Adult\n\nIf someone ever gives you a bad touch or makes you feel uncomfortable, there are three important steps to follow:\n\n**1. SAY NO** — Use a strong, loud voice. Say "No!" or "Stop!" or "I don\'t like that!" You have the right to say no to ANY person — even if they are an adult, even if they are someone you know.\n\n**2. GET AWAY** — Move away from the person as quickly as you can. Go to a safe place where there are other people.\n\n**3. TELL SOMEONE** — Tell a **trusted adult** right away. A trusted adult is someone who:\n- Listens to you\n- Believes you\n- Keeps you safe\n- Could be a parent, teacher, grandparent, aunt, uncle, or school counsellor\n\n**Remember these important things:**\n- It is NEVER your fault if someone gives you a bad touch\n- You will NOT get in trouble for telling\n- If the first adult you tell does not help, tell another adult\n- Secrets about touching are NEVER okay — always tell\n\n**Childline South Africa: 116** — You can call this number for free if you need help.'),
  q(7, 'If someone touches you in a way that makes you feel scared or uncomfortable, what should you do?',
    ['Say no, get away, and tell a trusted adult', 'Keep it a secret like they told you to', 'Think it is your fault and say nothing', 'Wait and see if it happens again'], 0,
    'The three steps are: Say No, Get Away, and Tell a trusted adult. It is NEVER your fault, and you should ALWAYS tell someone. If the first person you tell does not help, keep telling until someone does.'),
  q(8, 'Which of these is a "trusted adult" you could talk to if you felt unsafe?',
    ['A parent, teacher, grandparent, or school counsellor', 'A stranger on the street', 'Only your best friend', 'No one — you should handle it yourself'], 0,
    'A trusted adult is someone like a parent, teacher, grandparent, or school counsellor who will listen to you, believe you, and help keep you safe. You should never try to handle a scary situation alone.'),
  fb(9, 'If you need help and no adult is listening, you can call ___ for free. This is the number for ___ South Africa.',
    ['116', 'Childline'],
    'Childline South Africa can be reached at 116. It is a free call, and trained counsellors are available to listen, help, and give advice to any child who needs it.'),
  t(10, '### Summary: My Body\n\n**Key ideas from this chapter:**\n- Your body is precious and belongs only to you\n- Take care of your body by eating well, drinking water, exercising, sleeping, and keeping clean\n- Protect your skin from the strong South African sun\n- Good touches make you feel safe and loved; bad touches make you feel scared or uncomfortable\n- Your private body parts are covered by your underwear — nobody should touch them\n- If someone makes you feel unsafe: Say No, Get Away, Tell a trusted adult\n- It is NEVER your fault, and you should NEVER keep it a secret\n- Childline: 116 (free call)\n\n**Remember:** Your body is yours, and you have the right to feel safe!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Safety First (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Safety First\n\nStaying safe is one of the most important things you can learn. Accidents can happen anywhere — on the road, at home, at school, or near water. But when you know the safety rules, you can protect yourself and others.\n\nIn this chapter, you will learn about:\n- Road safety\n- Fire safety\n- Water safety\n- Playground safety\n- Emergency numbers\n\nKnowing these rules could save your life or someone else\'s life one day!'),
  t(2, '### Road Safety\n\nMany children in South Africa walk to school along busy roads. Knowing how to be safe on the road is very important.\n\n**Rules for crossing the road (Stop, Look, Listen):**\n1. **STOP** at the edge of the road\n2. **LOOK** left, then right, then left again\n3. **LISTEN** for cars, trucks, or motorbikes\n4. **Walk** — do not run — across the road when it is clear\n5. Use a **pedestrian crossing** or **traffic light** whenever possible\n\n**More road safety rules:**\n- Always walk on the pavement (sidewalk). If there is no pavement, walk on the side of the road facing the traffic\n- Wear bright or light-coloured clothes so drivers can see you\n- Never play in the road or near the road\n- Always wear a **seatbelt** in a car — even in the back seat\n- Children under 12 should sit in the back seat of a car\n- Never ride in the back of an open bakkie (pickup truck)'),
  q(3, 'When crossing the road, in which order should you look?',
    ['Left, then right, then left again', 'Right, then left', 'Just look straight ahead', 'You do not need to look if there is no traffic light'], 0,
    'You should look LEFT first (because in South Africa cars drive on the left side of the road, so the closest lane of traffic comes from the left), then RIGHT, then LEFT again to make sure it is safe.'),
  t(4, '### Fire Safety\n\n**Fires can start very easily.** In South Africa, many families cook with paraffin stoves or open fires, which can be dangerous if not handled carefully.\n\n**How to prevent fires:**\n- Never play with matches or lighters\n- Keep candles away from curtains, blankets, and paper\n- Never leave a stove or fire burning when nobody is watching\n- Keep a bucket of water or sand near the cooking area\n\n**What to do if there is a fire:**\n1. Get out of the building immediately — do not stop to collect your things\n2. Stay low and crawl if there is smoke (smoke rises, so the air is cleaner near the floor)\n3. Feel a closed door before opening it — if it is hot, do NOT open it\n4. Meet at a safe meeting point outside\n5. Call for help: **10177** (ambulance) or shout for neighbours\n\n**If your clothes catch fire: STOP, DROP, and ROLL**\n- **STOP** — do not run (running makes the fire worse)\n- **DROP** — fall to the ground and cover your face with your hands\n- **ROLL** — roll back and forth to put out the flames'),
  fb(5, 'If your clothes catch fire, you should ___, drop, and ___. You should NOT run because running makes the fire ___.',
    ['stop', 'roll', 'worse'],
    'Stop, Drop, and Roll is the correct action if your clothes catch fire. Running fans the flames and makes the fire bigger and more dangerous.'),
  t(6, '### Water Safety and Playground Safety\n\n**Water safety:**\nWater can be very dangerous, even if it does not look deep. Many children drown every year in South Africa.\n\n- Never swim alone — always have an adult watching\n- Do not swim in rivers, dams, or the sea unless an adult says it is safe\n- Do not push or hold other children under water — even as a joke\n- If you see someone drowning, do NOT jump in. Shout for help and throw something that floats (like a ball or a bottle)\n- Learn to swim if you get the chance!\n\n**Playground safety:**\n- Wait your turn on the swings and slide\n- Do not push or shove on the jungle gym\n- Do not stand on top of the swings\n- Tell a teacher if equipment is broken\n- Do not play rough games that can hurt someone'),
  q(7, 'You see a small child fall into a swimming pool. You cannot swim very well. What should you do?',
    ['Shout loudly for help and try to throw something that floats to the child', 'Jump in and try to save the child yourself', 'Run home and tell your parents', 'Wait and see if the child can get out alone'], 0,
    'If you cannot swim well, jumping in could put both of you in danger. The safest thing is to shout for help immediately and throw something that floats to the child — like a ball, bottle, or pool noodle.'),
  q(8, 'What number do you call for the police in South Africa?',
    ['10111', '10177', '911', '999'], 0,
    'In South Africa, the police emergency number is 10111. The ambulance emergency number is 10177. These are important numbers to memorise!'),
  fb(9, 'The police emergency number in South Africa is ___. The ambulance emergency number is ___.',
    ['10111', '10177'],
    'Remember these two important emergency numbers: 10111 for the South African Police Service (SAPS) and 10177 for the ambulance service. These calls are free from any phone.'),
  t(10, '### Summary: Safety First\n\n**Key ideas from this chapter:**\n- Road safety: Stop, Look, Listen before crossing. Always wear a seatbelt\n- Fire safety: Never play with matches. If your clothes catch fire: Stop, Drop, Roll\n- Water safety: Never swim alone. Do not jump in to save someone if you cannot swim\n- Playground safety: Wait your turn, do not push, tell a teacher about broken equipment\n- **Emergency numbers to memorise:**\n  - Police: **10111**\n  - Ambulance: **10177**\n  - Childline: **116**\n\n**Remember:** Knowing the safety rules can save your life!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Getting Along with Others (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Getting Along with Others\n\nHumans are social beings. That means we need other people! Think about your life — you spend time with your family, your friends, your classmates, and your teachers every day. Getting along with all these different people is a very important skill.\n\nIn South Africa, with so many different cultures, languages, and traditions, learning to get along with others is extra important. The African philosophy of **ubuntu** teaches us: *"I am because we are."* This means that we are all connected and we need each other.\n\nLet us learn about the skills that help us get along with the people in our lives.'),
  t(2, '### Friendship\n\nFriends make life more fun! A good friend is someone who:\n- Plays with you and includes you\n- Listens when you talk\n- Is happy when good things happen to you\n- Helps you when you are struggling\n- Says sorry when they make a mistake\n- Keeps your secrets (unless you are in danger)\n\n**How to be a good friend:**\n- **Share** — share your toys, your snacks, and your time\n- **Take turns** — let others go first sometimes\n- **Be honest** — but be kind with your words\n- **Stand up for your friends** — if someone is being mean to your friend, help them\n- **Forgive** — nobody is perfect. When a friend makes a mistake and says sorry, try to forgive them\n\n**Making new friends:**\nStarting a friendship can feel scary. Here are some tips:\n- Smile and say hello\n- Ask a question: "What is your name?" or "Do you want to play?"\n- Find something you both like — maybe you both love soccer or drawing\n- Be yourself — the best friendships happen when you are real'),
  q(3, 'Lerato and Mpho are best friends. Mpho accidentally spills water on Lerato\'s homework. Mpho says sorry and offers to help Lerato redo it. What should Lerato do?',
    ['Forgive Mpho because it was an accident and Mpho said sorry', 'Stop being friends with Mpho forever', 'Spill water on Mpho\'s homework to get even', 'Tell the whole class what Mpho did'], 0,
    'Mpho made an honest mistake and apologised. A good friend forgives when someone is truly sorry. Nobody is perfect, and accidents happen to everyone.'),
  t(4, '### Teamwork and Sharing\n\n**Teamwork** means working together to reach a goal. It is one of the most important skills you will ever learn!\n\n**Tips for good teamwork:**\n- Listen to everyone\'s ideas, not just your own\n- Give everyone a job to do\n- Encourage your teammates: "Good job!" or "Keep trying!"\n- Do not blame others when things go wrong — solve the problem together\n- Celebrate together when you succeed\n\n**Sharing:**\nSharing means giving some of what you have to others. You can share:\n- Your things — crayons, food, toys\n- Your time — helping someone with their work\n- Your ideas — telling the group your thoughts\n- Your feelings — being open and honest\n\nSharing does not mean giving away everything. It means being generous when you can. Even sharing a smile costs nothing and can brighten someone\'s day!\n\nIn many South African communities, sharing is a way of life. Neighbours share meals, families help each other, and communities come together in times of need.'),
  fb(5, '___ means working together to reach a goal. The African philosophy of ___ teaches us that we are all connected and need each other.',
    ['Teamwork', 'ubuntu'],
    'Teamwork is when people work together to achieve something they could not do alone. Ubuntu reminds us that our lives are connected to the lives of others.'),
  t(6, '### Solving Disagreements\n\nEven the best of friends sometimes disagree. Having a disagreement does not mean you are not friends anymore — it just means you see things differently.\n\n**Steps to solve a disagreement:**\n1. **Calm down** — take deep breaths. Do not try to solve a problem when you are very angry\n2. **Listen** — let the other person talk. Try to understand their side\n3. **Speak kindly** — use "I feel" words instead of blaming: "I feel upset when..." instead of "You always..."\n4. **Think of solutions** — brainstorm ideas that could work for both of you\n5. **Agree and move on** — once you find a solution, shake hands and let it go\n\n**What NOT to do:**\n- Do not name-call or say hurtful things\n- Do not gossip about the person to others\n- Do not use your fists — violence is NEVER the answer\n- Do not hold a grudge forever\n\nIf you cannot solve a disagreement on your own, ask a teacher or parent to help. This is called **mediation** — when a third person helps two people find a fair solution.'),
  q(7, 'Sizwe and Ayanda both want to be the captain of their soccer team. They start arguing loudly. What is the BEST first step?',
    ['Both of them should calm down and take deep breaths before discussing it', 'They should have a fight to decide who is stronger', 'Sizwe should just let Ayanda be captain because arguing is bad', 'They should stop being friends'], 0,
    'The first step in solving any disagreement is to calm down. When people are shouting and angry, they cannot think clearly or listen to each other. Once they are calm, they can talk it through and maybe find a solution — like taking turns being captain.'),
  q(8, 'Which of these is an example of good teamwork?',
    ['Listening to everyone\'s ideas and giving each person a job to do', 'Doing all the work yourself so it gets done faster', 'Telling your teammates they are doing it wrong', 'Only working with people you are friends with'], 0,
    'Good teamwork means including everyone, listening to all ideas, and sharing the work. When each person contributes, the team is stronger and the result is better.'),
  fb(9, 'If you cannot solve a disagreement on your own, you can ask a teacher or parent to help. This is called ___. Violence is ___ the answer.',
    ['mediation', 'never'],
    'Mediation is when a fair third person helps two people find a solution to their disagreement. Violence — hitting, kicking, or fighting — is never the answer and always makes things worse.'),
  t(10, '### Summary: Getting Along with Others\n\n**Key ideas from this chapter:**\n- Friends make life better — be a good friend by sharing, listening, and forgiving\n- Teamwork means working together and including everyone\n- Sharing is a way of life in South African communities\n- Disagreements are normal — solve them by calming down, listening, and speaking kindly\n- Violence is NEVER the answer\n- If you need help solving a problem, ask for mediation from a trusted adult\n- Ubuntu: "I am because we are"\n\n**Remember:** Treating others with respect and kindness makes the world a better place!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Our Rights (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Our Rights\n\nDid you know that children have special rights that are protected by the law? In South Africa, the **Constitution** is the most important law in the country. It protects everyone — including children.\n\n**What is a right?**\nA right is something that every person should have, just because they are a human being. Rights are not things you have to earn — you are born with them.\n\n**Some important rights that every child in South Africa has:**\n- The right to **food** and clean water\n- The right to a safe **home** (shelter)\n- The right to **education** — to go to school and learn\n- The right to **health care** — to see a doctor when you are sick\n- The right to be **protected** from harm, abuse, and neglect\n- The right to **play** and rest\n- The right to a **name** and a nationality\n\nThese rights are written in **Section 28** of the South African Constitution. They are there to make sure every child can grow up safe, healthy, and happy.'),
  t(2, '### Rights Come with Responsibilities\n\nA **responsibility** is something you should do to help yourself and others. Rights and responsibilities go together — you cannot have one without the other.\n\n| Your Right | Your Responsibility |\n|-----------|--------------------|\n| The right to education | To go to school, do your work, and respect your teachers |\n| The right to food | To not waste food and be grateful for what you have |\n| The right to a safe home | To help keep your home clean and tidy |\n| The right to play | To play safely and include others |\n| The right to be protected | To tell an adult if you see someone being hurt |\n| The right to health care | To take care of your body and keep clean |\n\n**Example:** You have the right to education. But you also have the responsibility to arrive at school on time, do your homework, and treat your teacher with respect.\n\n**Another example:** You have the right to play. But you also have the responsibility to play fairly, include others, and not hurt anyone.'),
  q(3, 'Kagiso says, "I have the right to education, so I can behave however I want at school." Is Kagiso correct?',
    ['No — the right to education comes with the responsibility to respect teachers and learn properly', 'Yes — it is his right so he can do what he wants', 'No — children do not really have rights', 'Yes — rights mean you do not have any responsibilities'], 0,
    'Every right comes with a responsibility. The right to education means you should attend school, do your best, and respect your teachers and classmates. Rights do not mean you can do whatever you want.'),
  t(4, '### Respecting Other People\'s Rights\n\nJust as you have rights, so does every other person. Respecting other people\'s rights means:\n\n- **Not bullying** — everyone has the right to feel safe\n- **Not stealing** — everyone has the right to their belongings\n- **Not excluding** — everyone has the right to be included\n- **Not being mean** — everyone has the right to dignity (being treated with respect)\n\n**What happens when rights are not respected?**\nWhen people do not respect each other\'s rights, there is conflict, pain, and unfairness. South Africa knows this very well because of **apartheid** — a time in our history when many people\'s rights were taken away because of the colour of their skin.\n\nBut brave South Africans like **Nelson Mandela**, **Desmond Tutu**, **Walter Sisulu**, and **Albertina Sisulu** fought for everyone\'s rights. Because of their courage, we now have a Constitution that protects ALL people.\n\n**Freedom Day** (27 April) celebrates the day all South Africans were finally allowed to vote in 1994. On this day, we remember that rights must be protected and respected.'),
  fb(5, 'Children\'s rights are protected in Section ___ of the South African Constitution. ___ Day on 27 April celebrates the day all South Africans could vote for the first time.',
    ['28', 'Freedom'],
    'Section 28 of the Constitution specifically lists the rights of children. Freedom Day on 27 April commemorates the first democratic election in 1994, when all South Africans — regardless of race — could vote.'),
  t(6, '### The Constitution Protects Children\n\nThe South African Constitution is sometimes called the "supreme law" because it is more powerful than any other law. It says that children\'s rights are very important.\n\n**What the Constitution says about children (Section 28):**\n- Every child has the right to family care or parental care\n- Every child has the right to basic nutrition (food), shelter, and health care\n- Every child has the right to be protected from maltreatment (being treated badly), neglect, and abuse\n- Every child has the right not to be used for child labour (being forced to work instead of going to school)\n- Every child has the right to education\n\n**Who helps protect children\'s rights?**\n- **Parents and families** — they are the first people who should protect you\n- **Teachers and schools** — they keep you safe while you learn\n- **The police** (10111) — they help when someone is breaking the law\n- **Social workers** — they help children who are in difficult situations\n- **Childline** (116) — a free helpline just for children\n\nIf your rights are not being respected, you should tell a trusted adult. You deserve to be safe, fed, educated, and treated with respect.'),
  q(7, 'Which of these is NOT a right that children have according to the South African Constitution?',
    ['The right to have a cellphone', 'The right to food and clean water', 'The right to education', 'The right to be protected from abuse'], 0,
    'The Constitution protects children\'s rights to food, water, shelter, education, health care, and protection. Having a cellphone is not a right — it is a want. It is important to know the difference between rights and wants.'),
  q(8, 'Nelson Mandela and Desmond Tutu fought for the rights of all South Africans. Why do we remember them?',
    ['Because they worked to make South Africa a fair country where everyone\'s rights are protected', 'Because they invented the Constitution by themselves', 'Because they were the richest people in South Africa', 'Because they only helped children, not adults'], 0,
    'Nelson Mandela, Desmond Tutu, and many other brave South Africans fought against apartheid to create a fair country where all people — regardless of race — have their rights respected and protected.'),
  fb(9, 'A ___ is something you should do to help yourself and others. Rights and ___ go together.',
    ['responsibility', 'responsibilities'],
    'A responsibility is a duty or something you should do. Every right you have comes with a responsibility. For example, the right to education comes with the responsibility to attend school and do your best.'),
  t(10, '### Summary: Our Rights\n\n**Key ideas from this chapter:**\n- Every child has rights protected by the South African Constitution (Section 28)\n- Important rights: food, shelter, education, health care, protection, play\n- Every right comes with a responsibility\n- Respecting other people\'s rights is just as important as knowing your own\n- Brave South Africans fought against apartheid so that all people could have equal rights\n- Freedom Day (27 April) celebrates our democracy\n- If your rights are being violated, tell a trusted adult, call the police (10111), or call Childline (116)\n\n**Remember:** You have rights, and so does everyone else. Let us protect each other!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Physical Education (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Physical Education\n\nPhysical education (PE) is all about moving your body, playing sports, and having fun while getting fit. Your body is designed to move — and the more you move, the stronger and healthier you become!\n\n**Why is physical activity important?**\n- It makes your heart and lungs stronger\n- It makes your muscles and bones stronger\n- It helps you concentrate better in class\n- It makes you feel happier (exercise releases "happy chemicals" in your brain)\n- It helps you sleep better at night\n- It helps you make friends through team activities\n\nIn South Africa, there are many exciting sports and games to play. Some are modern sports like soccer and netball. Others are **indigenous games** that South African children have played for hundreds of years!\n\nLet us learn about warming up, different activities, and some special South African games.'),
  t(2, '### Warming Up and Cooling Down\n\nBefore you start any exercise or sport, you must **warm up** your body. A warm-up gets your muscles ready and helps prevent injuries.\n\n**Warm-up activities (5-10 minutes):**\n- Jogging on the spot\n- Star jumps (jumping jacks)\n- Arm circles — big circles with your arms\n- Leg swings — swing each leg forward and back\n- High knees — march on the spot, lifting your knees high\n\nAfter you finish exercising, you must **cool down**. A cool-down helps your body return to normal slowly.\n\n**Cool-down activities (5 minutes):**\n- Slow walking\n- Gentle stretches — reach for your toes, stretch your arms above your head\n- Deep breathing — breathe in slowly through your nose, out through your mouth\n\n**Why warm up and cool down?**\n- Warming up gets blood flowing to your muscles so they are ready to work\n- Cooling down stops your muscles from getting stiff and sore\n- Both help prevent injuries like pulled muscles'),
  q(3, 'Why is it important to warm up before playing a sport?',
    ['It gets your muscles ready and helps prevent injuries', 'It wastes time so you play for less time', 'It is only important for professional athletes', 'It makes the game more difficult'], 0,
    'Warming up gets blood flowing to your muscles, making them flexible and ready to work. Without a warm-up, you are more likely to pull a muscle or get injured during exercise.'),
  t(4, '### Running, Jumping, Throwing, and Catching\n\nThese are the **basic movement skills** that you use in almost every sport:\n\n**Running:**\n- Pump your arms as you run (this helps you go faster)\n- Land on the balls of your feet, not your heels\n- Look ahead, not at the ground\n- Breathe steadily\n\n**Jumping:**\n- Bend your knees before you jump\n- Swing your arms forward and up as you jump\n- Land with both feet and bend your knees to cushion the landing\n\n**Throwing:**\n- Stand with one foot in front of the other\n- Bring the ball behind your head with your throwing hand\n- Step forward with your front foot as you throw\n- Follow through with your arm (let it swing forward after you release)\n\n**Catching:**\n- Watch the ball with your eyes the whole time\n- Reach your hands towards the ball\n- Bring the ball into your body as you catch it (this cushions the catch)\n- Keep your fingers spread and soft — hard, stiff fingers will make the ball bounce off'),
  fb(5, 'Before you start exercising, you should ___ up your body. After you finish, you should ___ down.',
    ['warm', 'cool'],
    'Warming up prepares your muscles for exercise and helps prevent injuries. Cooling down helps your body return to its normal state gradually and prevents stiffness.'),
  t(6, '### Team Games and Indigenous SA Games\n\n**Team games** are sports where you work together with others. They teach you teamwork, communication, and sportsmanship.\n\nPopular team games in South Africa:\n- **Soccer** (football) — the most popular sport in SA\n- **Netball** — especially popular among girls\n- **Cricket** — played with a bat and ball\n- **Rugby** — the Springboks make us all proud!\n\n**Indigenous South African games:**\nThese are games that South African children have played for generations. They are part of our heritage!\n\n- **Diketo** — a stone-throwing game played with pebbles. You toss a stone in the air and try to scoop up other stones before catching it. It improves hand-eye coordination\n- **Drie stokkies** (three sticks) — a chasing game where two teams play. One team guards three sticks while the other tries to knock them down. It is like a combination of tag and capture the flag\n- **Kgati** (rope jumping) — two people swing a long rope while others jump in. Players do tricks and patterns while jumping\n- **Morabaraba** — a board game played on a grid drawn in the sand. It is like a South African version of checkers and chess combined\n\nThese indigenous games are not just fun — they keep our culture alive!'),
  q(7, 'What is "diketo"?',
    ['An indigenous South African stone-throwing game that improves hand-eye coordination', 'A modern video game', 'A type of soccer played in South Africa', 'A warm-up exercise'], 0,
    'Diketo is a traditional South African game played with small stones or pebbles. You toss a stone in the air and try to scoop up other stones before catching the tossed one. It has been played by SA children for generations.'),
  q(8, 'What is the most important thing about playing team sports?',
    ['Working together and being a good sport, whether you win or lose', 'Winning every game', 'Being the best player on the team', 'Making sure you score the most points'], 0,
    'Team sports teach you to work together, support your teammates, and handle both winning and losing with grace. Being a good sport — congratulating the other team and encouraging your teammates — is more important than always winning.'),
  fb(9, 'Drie stokkies is an indigenous game where one team guards ___ sticks while the other team tries to knock them down. ___ is the most popular team sport in South Africa.',
    ['three', 'Soccer'],
    'Drie stokkies (which means "three sticks" in Afrikaans) is a traditional chasing and guarding game. Soccer (football) is by far the most popular team sport in South Africa, played in communities across the country.'),
  t(10, '### Summary: Physical Education\n\n**Key ideas from this chapter:**\n- Physical activity makes your body and mind stronger and healthier\n- Always warm up before exercise and cool down after\n- Basic movement skills: running, jumping, throwing, and catching\n- Team games teach teamwork and sportsmanship\n- Indigenous SA games (diketo, drie stokkies, kgati, morabaraba) are part of our heritage\n- Being a good sport is more important than winning\n\n**Remember:** Move your body every day — it is fun AND good for you!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Caring for Our Environment (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Caring for Our Environment\n\nThe **environment** is everything around us — the air we breathe, the water we drink, the ground we walk on, the plants, the animals, and even the weather. Our environment gives us everything we need to live.\n\nBut our environment is in trouble. People are polluting the air, throwing litter on the ground, wasting water, and cutting down trees. If we do not take care of our environment, it will not be able to take care of us.\n\nThe good news is that even YOU — a Grade 4 learner — can make a big difference! Every small action helps. Let us learn how we can care for our beautiful South Africa.'),
  t(2, '### Keeping School and Home Clean\n\nA clean environment is a healthy environment. When there is litter lying around, it:\n- Looks ugly and makes the area feel uncared for\n- Attracts rats, flies, and cockroaches that spread disease\n- Can block drains and cause flooding when it rains\n- Can hurt animals — birds and dogs can choke on plastic\n\n**What you can do at school:**\n- Put your rubbish in the bin — never throw it on the ground\n- If you see litter on the ground, pick it up (even if it is not yours!)\n- Keep your desk and classroom tidy\n- Take part in school clean-up campaigns\n\n**What you can do at home:**\n- Help sweep the yard\n- Put your things away when you are finished with them\n- Help carry rubbish bags to the collection point\n- Do not throw rubbish out of the car window\n\n**A clean community is a proud community.** In many South African townships and villages, community members come together for clean-up days. You can join in too!'),
  q(3, 'Why is litter dangerous for animals?',
    ['Animals can choke on plastic or get tangled in rubbish', 'Litter is only dangerous for people, not animals', 'Animals enjoy playing with litter', 'Litter makes animals stronger'], 0,
    'Litter is very dangerous for animals. Birds, dogs, and sea animals can choke on plastic bags and wrappers. Animals can also get tangled in plastic rings and string. Keeping the environment clean protects both people and animals.'),
  t(4, '### Recycling and Saving Water\n\n**Recycling** means turning old, used items into new things instead of throwing them away. Recycling reduces waste and saves resources.\n\n**What can be recycled?**\n- **Paper** — old newspapers, magazines, cardboard boxes\n- **Plastic** — bottles, containers, bags\n- **Glass** — jars and bottles\n- **Metal** — cool drink cans, tin cans\n\n**Tip:** In South Africa, many people collect recyclable materials to sell. This is called waste picking, and it is honest, hard work that helps the environment.\n\n**Saving water:**\nSouth Africa is a **water-scarce country**. This means we do not have as much fresh water as many other countries. That is why saving water is so important!\n\n**Ways to save water:**\n- Turn off the tap while you brush your teeth\n- Take short showers instead of baths\n- Fix leaking taps — a dripping tap wastes thousands of litres per year\n- Use a bucket to wash the car instead of a hosepipe\n- Water plants in the early morning or late afternoon (less water evaporates)\n- Collect rainwater in a bucket to water the garden'),
  fb(5, '___ means turning old, used items into new things instead of throwing them away. South Africa is a water-___ country, which means we must save water.',
    ['Recycling', 'scarce'],
    'Recycling reduces waste and saves precious resources. South Africa does not have a lot of fresh water compared to many countries, so every drop counts. Small actions like turning off the tap while brushing your teeth make a big difference.'),
  t(6, '### Planting Trees and Loving Nature\n\nTrees and plants are incredibly important for life on Earth:\n- They give us **oxygen** — the air we breathe\n- They provide **shade** and keep us cool\n- They give animals a **home**\n- Their roots hold the **soil** together and prevent erosion\n- They give us **fruit** and medicine\n\n**South Africa has beautiful indigenous trees and plants:**\n- **The Yellowwood** — South Africa\'s national tree. Some yellowwoods are over 1 000 years old!\n- **The Baobab** — a huge tree found in Limpopo. Some people call it the "upside-down tree" because its branches look like roots\n- **The Spekboom** — a special plant that absorbs a LOT of carbon dioxide from the air. Planting spekboom helps fight climate change\n- **The Protea** — South Africa\'s national flower. It grows in the Western Cape fynbos\n\n**What you can do:**\n- Plant a tree or start a small vegetable garden\n- Do not break branches or pick flowers in parks\n- Learn the names of plants and trees around your school\n- Join an environmental club or Arbor Day activities'),
  q(7, 'Why is the spekboom plant special for the environment?',
    ['It absorbs a lot of carbon dioxide from the air and helps fight climate change', 'It is the tallest plant in South Africa', 'It produces the most fruit', 'It only grows in one place in the world'], 0,
    'The spekboom is sometimes called a "wonder plant" because it absorbs very large amounts of carbon dioxide — a gas that causes climate change. Planting spekboom is one of the easiest things South Africans can do to help the environment.'),
  q(8, 'Which of these is a good way to save water at home?',
    ['Turn off the tap while brushing your teeth', 'Leave the tap running while you look for your toothbrush', 'Take very long showers every day', 'Use a hosepipe to wash the driveway'], 0,
    'Turning off the tap while brushing your teeth can save up to 6 litres of water per minute! In a water-scarce country like South Africa, these small savings add up to a big difference.'),
  fb(9, 'South Africa\'s national tree is the ___. South Africa\'s national flower is the ___.',
    ['Yellowwood', 'Protea'],
    'The Yellowwood is South Africa\'s national tree — some are over 1 000 years old! The Protea is our national flower and can be found in the fynbos of the Western Cape. Both are symbols of our beautiful natural heritage.'),
  t(10, '### Summary: Caring for Our Environment\n\n**Key ideas from this chapter:**\n- The environment gives us everything we need to live — we must take care of it\n- Pick up litter, even if it is not yours. A clean community is a proud community\n- Recycle paper, plastic, glass, and metal whenever you can\n- South Africa is water-scarce — save water every day\n- Trees and plants give us oxygen, shade, food, and homes for animals\n- Plant trees and learn about indigenous plants like the spekboom, yellowwood, and protea\n\n**Remember:** The Earth is our home. Let us take care of it!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Looking Forward (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Looking Forward\n\nCongratulations! You have almost finished Grade 4. This has been a big year, and you have learned so many important things — about yourself, about staying healthy, about your feelings, about safety, about getting along with others, about your rights, and about caring for the environment.\n\nNow it is time to look forward. What do you want to achieve in the future? What kind of person do you want to be? What dreams do you have?\n\nIn this chapter, we will think about everything you have learned, set some goals, and look ahead with excitement and hope.'),
  t(2, '### What I Learned This Year\n\nLet us think back to everything you learned in Life Orientation this year:\n\n- **All About Me** — you are unique, special, and have many strengths\n- **Healthy Living** — eating well, drinking water, exercising, sleeping, and staying clean keeps you strong\n- **Feelings and Emotions** — all feelings are normal. Express them in healthy ways. Show empathy and kindness\n- **My Body** — your body is precious. Know about good touch and bad touch. Tell a trusted adult if you feel unsafe\n- **Safety First** — road, fire, water, and playground safety. Emergency numbers: 10111, 10177, 116\n- **Getting Along with Others** — friendship, sharing, teamwork, and solving disagreements peacefully\n- **Our Rights** — you have rights protected by the Constitution, and responsibilities that go with them\n- **Physical Education** — warming up, basic skills, team games, and indigenous SA games\n- **Caring for Our Environment** — reduce, reuse, recycle, save water, and plant trees\n\nAll of these lessons are tools you can use every day to live a good, safe, and happy life.'),
  q(3, 'Which emergency number should you call if you need the police in South Africa?',
    ['10111', '10177', '116', '911'], 0,
    'The South African Police Service (SAPS) emergency number is 10111. It is important to remember this number in case you ever need help from the police. 10177 is for ambulance, and 116 is for Childline.'),
  t(4, '### Setting Goals\n\nA **goal** is something you want to achieve. Setting goals helps you know what you are working towards. Without goals, it is like walking without knowing where you are going!\n\n**Types of goals:**\n- **Short-term goals** — things you want to achieve soon (this week or this month)\n  - "I will read one book this month"\n  - "I will practise my times tables every night this week"\n  - "I will be kind to someone new at school this week"\n\n- **Long-term goals** — things you want to achieve in the future (this year or when you grow up)\n  - "I want to pass Grade 5 with good marks"\n  - "I want to learn to swim"\n  - "I want to become a doctor, teacher, pilot, or engineer one day"\n\n**How to set a good goal:**\n1. **Be specific** — "I want to get better at reading" is better than "I want to be better at school"\n2. **Make a plan** — decide what steps you will take\n3. **Work hard** — goals do not happen by magic. You have to put in the effort\n4. **Do not give up** — if you fail the first time, try again. Thomas Edison failed thousands of times before he invented the light bulb!'),
  fb(5, 'A ___ is something you want to achieve. Short-term goals are things you want to achieve ___, while long-term goals are for the future.',
    ['goal', 'soon'],
    'A goal gives you something to work towards. Short-term goals keep you motivated day to day, while long-term goals give you a bigger dream to work towards over time. Both types of goals are important.'),
  t(6, '### What I Want to Be\n\nWhat do you want to be when you grow up? There are so many exciting careers to choose from!\n\n**Some careers to think about:**\n- **Doctor or nurse** — helping sick people get better\n- **Teacher** — helping children learn and grow\n- **Engineer** — designing buildings, roads, and machines\n- **Farmer** — growing food to feed people\n- **Police officer** — keeping communities safe\n- **Artist or musician** — creating beautiful things that inspire people\n- **Pilot** — flying aeroplanes around the world\n- **Scientist** — discovering new things about the world\n- **Social worker** — helping families and children in need\n- **Entrepreneur** — starting your own business\n\n**South Africans who followed their dreams:**\n- **Siya Kolisi** — grew up in a poor community in the Eastern Cape and became the first Black captain of the Springboks\n- **Zozibini Tunzi** — from the Eastern Cape, she became Miss Universe in 2019\n- **Elon Musk** — grew up in Pretoria and became one of the world\'s greatest inventors and businessmen\n- **Miriam Makeba** — "Mama Africa," a singer who used her voice to fight for freedom\n\nNo matter where you come from, you can achieve great things if you work hard and believe in yourself!'),
  q(7, 'Siya Kolisi grew up in a poor community but became the captain of the Springboks. What does his story teach us?',
    ['That hard work and determination can help you achieve your dreams no matter where you come from', 'That only people from rich families can succeed', 'That you must play rugby to be successful', 'That school does not matter if you are good at sport'], 0,
    'Siya Kolisi\'s story shows that your background does not determine your future. He faced many challenges growing up, but through hard work, determination, and never giving up, he achieved his dream and inspired millions of South Africans.'),
  q(8, 'Why is it important to set goals?',
    ['Because goals help you know what you are working towards and keep you motivated', 'Because your teacher forces you to', 'Because everyone must have the same goals', 'Because goals are always easy to achieve'], 0,
    'Goals give you direction and motivation. When you know what you want to achieve, you can make a plan and work towards it step by step. Goals keep you focused, even when things get difficult.'),
  fb(9, 'Short-term goals are for this ___ or month. ___ goals are things you want to achieve when you grow up.',
    ['week', 'Long-term'],
    'Short-term goals keep you on track day by day — like reading a book this week or being kind to someone new. Long-term goals are your bigger dreams for the future — like the career you want or the person you want to become.'),
  t(10, '### Summary: Looking Forward\n\n**Key ideas from this chapter:**\n- You have learned so much this year — about yourself, health, safety, relationships, rights, and the environment\n- Setting goals (short-term and long-term) helps you know what you are working towards\n- There are many exciting careers to choose from — follow your interests and passions\n- South Africans like Siya Kolisi, Zozibini Tunzi, and Miriam Makeba show that dreams can come true\n- Hard work, determination, and believing in yourself are the keys to success\n- Never give up, even when things are difficult\n\n**A message for you:**\nYou are an amazing person with a bright future ahead. Whatever you dream of becoming, know that it is possible. Work hard, be kind, stay safe, and always believe in yourself.\n\n**You matter. Your dreams matter. Your future is bright!**'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create Grade 4
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 4/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 4:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 4', schoolId: SCHOOL_ID, orderIndex: 4,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 4:', String(GRADE_ID));
  }

  // Look up or create the Life Orientation subject
  let subjectDoc = await db.collection('subjects').findOne({ name: /Life.*Orient/i, schoolId: SCHOOL_ID });
  let SUBJECT_ID;

  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Life Orientation subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Life Orientation',
      code: 'LO',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Life Orientation subject:', String(SUBJECT_ID));
  }

  // Find the CAPS framework
  const capsFramework = await db.collection('curriculumframeworks').findOne({ name: 'CAPS', schoolId: null });
  const FRAMEWORK_ID = capsFramework ? capsFramework._id : new mongoose.Types.ObjectId();
  if (capsFramework) {
    console.log('Found CAPS framework:', String(FRAMEWORK_ID));
  } else {
    console.log('CAPS framework not found, using generated ID:', String(FRAMEWORK_ID));
  }

  const now = new Date();
  const baseDoc = {
    schoolId: SCHOOL_ID,
    createdBy: CREATED_BY,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    type: 'lesson',
    format: 'interactive',
    source: 'system',
    sourceAttribution: '',
    status: 'approved',
    tags: ['grade-4', 'life-orientation', 'caps'],
    aiModel: '',
    aiPrompt: '',
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    difficulty: 2,
    estimatedMinutes: 30,
    prerequisites: [],
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: '',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const chapters = [
    {
      title: 'Chapter 1: All About Me',
      description: 'Self-awareness, personal strengths, family diversity, being proud of yourself, and respecting differences in the Rainbow Nation.',
      order: 1,
      lessons: [
        { title: 'All About Me', description: 'Who am I, my strengths, my family, things I enjoy, being proud of myself, and respecting differences in our Rainbow Nation.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Healthy Living',
      description: 'Eating healthy South African foods, drinking water, daily exercise, getting enough sleep, keeping clean, and avoiding germs.',
      order: 2,
      lessons: [
        { title: 'Healthy Living', description: 'Eating healthy food with SA examples, drinking 6 glasses of water daily, 60 minutes of exercise, 9-11 hours of sleep, hygiene habits, and germ prevention.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Feelings and Emotions',
      description: 'Identifying different feelings, expressing emotions in healthy ways, the traffic light trick, empathy, kindness, and ubuntu.',
      order: 3,
      lessons: [
        { title: 'Feelings and Emotions', description: 'Identifying happy, sad, angry, scared, and excited feelings, healthy vs unhealthy responses, the traffic light trick, talking about feelings, empathy, and ubuntu.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: My Body',
      description: 'Taking care of your body, good touch and bad touch, saying no, telling a trusted adult, privacy, and the Childline helpline.',
      order: 4,
      lessons: [
        { title: 'My Body', description: 'Body care, sun safety, understanding good touch and bad touch, private body parts, saying no, telling a trusted adult, and Childline (116).', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Safety First',
      description: 'Road safety (Stop Look Listen), fire safety (Stop Drop Roll), water safety, playground safety, and SA emergency numbers.',
      order: 5,
      lessons: [
        { title: 'Safety First', description: 'Road safety rules, seatbelts, fire prevention and Stop Drop Roll, water safety, playground safety, and emergency numbers (10111, 10177, 116).', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Getting Along with Others',
      description: 'Friendship skills, sharing, taking turns, teamwork, solving disagreements peacefully, respect, and ubuntu.',
      order: 6,
      lessons: [
        { title: 'Getting Along with Others', description: 'Being a good friend, making new friends, sharing and taking turns, teamwork, solving disagreements with I-feel statements, mediation, and ubuntu.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Our Rights',
      description: 'Children\'s rights in the SA Constitution (Section 28), responsibilities, respecting others\' rights, apartheid history, and Freedom Day.',
      order: 7,
      lessons: [
        { title: 'Our Rights', description: 'Children\'s rights (food, shelter, education, protection), matching rights with responsibilities, respecting others\' rights, the Constitution, apartheid history, and Freedom Day.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Physical Education',
      description: 'Warming up and cooling down, running, jumping, throwing, catching, team games, and indigenous SA games (diketo, drie stokkies).',
      order: 8,
      lessons: [
        { title: 'Physical Education', description: 'Warm-up and cool-down routines, basic movement skills (running, jumping, throwing, catching), team games, sportsmanship, and indigenous SA games (diketo, drie stokkies, kgati, morabaraba).', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Caring for Our Environment',
      description: 'Keeping clean, picking up litter, recycling, saving water, planting trees, and indigenous SA plants and trees.',
      order: 9,
      lessons: [
        { title: 'Caring for Our Environment', description: 'Keeping school and home clean, the dangers of litter, recycling paper/plastic/glass/metal, saving water in a water-scarce country, planting trees, and indigenous plants (spekboom, yellowwood, protea).', blocks: ch9_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 10: Looking Forward',
      description: 'Reviewing the year, setting short-term and long-term goals, career dreams, SA role models, working hard, and being positive about the future.',
      order: 10,
      lessons: [
        { title: 'Looking Forward', description: 'What I learned this year, setting short-term and long-term goals, exciting careers, SA role models (Siya Kolisi, Zozibini Tunzi, Miriam Makeba), hard work and determination, and believing in yourself.', blocks: ch10_lesson1, term: 4 },
      ],
    },
  ];

  const textbookChapters = [];
  let totalLessons = 0;

  for (const ch of chapters) {
    const resourceIds = [];
    for (const lesson of ch.lessons) {
      const res = await db.collection('contentresources').insertOne({
        ...baseDoc,
        title: lesson.title,
        description: lesson.description,
        blocks: lesson.blocks,
        term: lesson.term,
        curriculumNodeId: null,
      });
      resourceIds.push(res.insertedId);
      totalLessons++;
      console.log('  Inserted: ' + lesson.title + ' (' + lesson.blocks.length + ' blocks)');
    }

    textbookChapters.push({
      id: new mongoose.Types.ObjectId().toString(),
      title: ch.title,
      description: ch.description,
      order: ch.order,
      curriculumNodeId: null,
      resources: resourceIds.map(function(id, i) { return { resourceId: id, order: i }; }),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 4 Life Orientation \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering All About Me, Healthy Living, Feelings and Emotions, My Body, Safety First, Getting Along with Others, Our Rights, Physical Education, Caring for Our Environment, and Looking Forward for the Grade 4 Life Orientation curriculum.',
    frameworkId: FRAMEWORK_ID,
    schoolId: SCHOOL_ID,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    coverImageUrl: '',
    status: 'published',
    chapters: textbookChapters,
    createdBy: CREATED_BY,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  });

  console.log('\n========================================');
  console.log('  TEXTBOOK: Grade 4 Life Orientation');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
