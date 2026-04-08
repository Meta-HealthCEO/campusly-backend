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
// CHAPTER 1: I Am Special (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## I Am Special\n\nHello and welcome to Grade 3 Life Skills! In this first lesson, we are going to talk about the most important person in the world — **YOU!**\n\nDid you know that there is nobody else on the whole planet who is exactly like you? Even twins are a little bit different from each other! You have your own special name, your own smile, and your own way of doing things.\n\nLet us think about what makes you special:\n- What is your name? Do you know what it means?\n- Who is in your family?\n- What do you love to do?\n- What are you really good at?'),
  t(2, '### My Name and My Family\n\nYour name is a very important part of who you are. In South Africa, names often have beautiful meanings.\n\n**Some South African names and their meanings:**\n- **Thando** — Love\n- **Sipho** — Gift\n- **Naledi** — Star\n- **Lebo** — Gift (in Setswana)\n- **Anele** — Enough (a blessing)\n\nYour family is special too! Some children live with their mom and dad. Some live with their gogo (granny) or their auntie. Some have big families with lots of brothers and sisters. Some have small families.\n\n**All families are special**, no matter what they look like. What matters most is that the people in your family love you and care about you.'),
  q(3, 'Naledi tells her class that her name means "Star." Why are names important?',
    ['Because your name is a special part of who you are', 'Because names are just words and do not matter', 'Because everyone has the same name', 'Because only long names are special'], 0,
    'Your name is one of the first gifts you ever received. In South Africa, names often carry beautiful meanings and connect you to your family and culture.'),
  t(4, '### Things I Can Do\n\nEveryone can do amazing things! You might be good at:\n- Drawing beautiful pictures\n- Running really fast\n- Singing a song\n- Making your friends laugh\n- Helping your mom in the kitchen\n- Being kind to animals\n- Listening when a friend is sad\n- Building things with blocks or clay\n\nYou do not have to be the best in the class at reading or maths to be special. Being kind is special. Being brave is special. Trying your best is special.\n\n**Activity:** Think of two things you are really good at. Tell your partner what they are. Now tell your partner one thing THEY are good at!'),
  fb(5, 'There is nobody else on the whole planet who is exactly like ___. In South Africa, the name Thando means ___.',
    ['you', 'Love'],
    'You are one of a kind — there is nobody else exactly like you in the whole world! The name Thando comes from isiZulu and isiXhosa and means "Love."'),
  t(6, '### Being Proud of Who I Am\n\nBeing proud does not mean showing off. It means feeling happy about who you are and the good things you do.\n\nYou can feel proud when you:\n- Try something new, even if it is a little bit scary\n- Help someone who needs it\n- Share with your friends\n- Say "sorry" when you make a mistake\n- Tell the truth\n\nIn South Africa, we come from many different cultures. Some children speak isiZulu at home, some speak Afrikaans, some speak Setswana, and some speak English. We eat different foods and celebrate different things. This is what makes our **Rainbow Nation** so wonderful!\n\n**Remember:** You do not have to be like anyone else. Just be YOU — because you are already amazing!'),
  q(7, 'Which of these is a good reason to feel proud?',
    ['Helping your little sister put on her shoes', 'Being the tallest in your class', 'Having the most toys', 'Wearing the newest clothes'], 0,
    'Helping others is always something to be proud of. Being proud is about the kind things you do, not about what you own or what you look like.'),
  q(8, 'South Africa is called the Rainbow Nation. Why do you think that is?',
    ['Because we have many different cultures, languages, and people living together', 'Because there are lots of rainbows in the sky', 'Because everyone wears rainbow colours', 'Because we only have one culture'], 0,
    'South Africa is called the Rainbow Nation because of all the wonderful different cultures, languages, and people who live here. Just like a rainbow has many colours, our country has many people who are all beautiful and special.'),
  fb(9, 'Being proud means feeling ___ about who you are. South Africa is called the ___ Nation because of all our different cultures.',
    ['happy', 'Rainbow'],
    'Being proud is about feeling happy and good about who you are and the kind things you do. South Africa is our beautiful Rainbow Nation full of different people and cultures.'),
  t(10, '### Summary: I Am Special\n\n**What we learned:**\n- There is nobody else exactly like you in the whole world\n- Your name is special and often has a beautiful meaning\n- All families are special, no matter what they look like\n- Everyone is good at different things — and being kind counts!\n- Being proud means feeling happy about who you are and what you do\n- Our Rainbow Nation is beautiful because of all our different cultures\n\n**Remember:** You are special just the way you are!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Healthy Habits (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Healthy Habits\n\nA **habit** is something you do every day without even thinking about it. Some habits are good for you — like brushing your teeth. Some habits are not so good — like biting your nails.\n\nIn this lesson, we are going to learn about the healthy habits that keep your body clean, strong, and full of energy. When you have healthy habits, you feel good and you do not get sick very often!\n\nLet us learn about the healthy things you should do every single day.'),
  t(2, '### Keeping Clean\n\nGerms are tiny, tiny things that you cannot see with your eyes. They live on your hands, on door handles, on desks, and in many other places. Some germs can make you sick — they can give you a tummy ache, a runny nose, or a sore throat.\n\n**How to keep germs away:**\n\n**Wash your hands with soap and water:**\n- Before you eat\n- After you use the toilet\n- After you play outside\n- After you blow your nose or sneeze\n- Sing "Happy Birthday" twice while you wash — that is long enough!\n\n**Brush your teeth twice a day:**\n- In the morning after you wake up\n- At night before you go to bed\n- Brush for two minutes — all the way around!\n\n**Bath or wash every day:**\n- Use soap and water to wash your whole body\n- Wash behind your ears and between your toes!\n- Put on clean clothes after you wash'),
  q(3, 'When should you wash your hands? Choose the BEST answer.',
    ['Before eating and after using the toilet', 'Only when they look dirty', 'Only when your teacher tells you to', 'Once a week is enough'], 0,
    'You should always wash your hands before eating and after using the toilet. Germs are too small to see, so even if your hands look clean, they might still have germs on them!'),
  t(4, '### Eating Breakfast and Drinking Water\n\n**Eating breakfast:**\nBreakfast is the first meal of the day, and it is very important! When you sleep, your body uses up its energy. Breakfast fills you up again so you can think and play.\n\nGood breakfast foods:\n- Porridge (pap, oats, or maltabella)\n- Bread with peanut butter\n- Fruit — a banana or an apple\n- Eggs\n- A glass of milk or amasi\n\nIf you go to school without eating breakfast, you might feel tired, dizzy, or find it hard to think clearly.\n\n**Drinking water:**\nWater is the best drink for your body! Try to drink lots of water every day. Water helps your body work properly and keeps you from feeling tired.\n\nFizzy drinks like Coke and Fanta have lots of sugar in them. They are a treat, not something for every day. Too much sugar can make your teeth rot and give you a tummy ache.'),
  fb(5, 'Breakfast is the first ___ of the day. The best drink for your body is ___.',
    ['meal', 'water'],
    'Breakfast is the first meal you eat after sleeping all night. It gives your body and brain the energy to start the day. Water is the best drink because it keeps your body healthy without any sugar.'),
  t(6, '### Getting Enough Sleep and Wearing Clean Clothes\n\n**Sleep:**\nWhen you sleep, your body rests and grows. Your brain sorts out all the things you learned during the day. Children in Grade 3 need about **10 to 11 hours of sleep** every night.\n\nTips for a good night\'s sleep:\n- Go to bed at the same time every night\n- Keep your room quiet and dark\n- Do not watch TV or play on a phone before bed\n- Read a story or sing a song to help you relax\n\n**Clean clothes:**\nWearing clean clothes is part of being healthy. Dirty clothes can have germs and can smell bad. Try to:\n- Wear clean underwear every day\n- Wear a clean school uniform\n- Put dirty clothes in the washing basket\n\nIf you look clean and smell nice, you feel good about yourself too!'),
  q(7, 'How many hours of sleep does a Grade 3 learner need every night?',
    ['About 10 to 11 hours', 'About 5 hours', 'About 15 hours', 'It does not matter how much you sleep'], 0,
    'Grade 3 children need about 10 to 11 hours of sleep every night. This helps your body grow strong and your brain work well for learning and playing.'),
  q(8, 'Why is breakfast important?',
    ['Because it gives your body energy after sleeping all night', 'Because it is just a rule', 'Because lunch is not important', 'Because you must eat before you watch TV'], 0,
    'When you sleep, your body uses up its energy. Breakfast fills you up again and gives your brain the fuel it needs to think, learn, and play at school.'),
  fb(9, 'Grade 3 children need about ___ to 11 hours of sleep every night. You should brush your teeth ___ a day.',
    ['10', 'twice'],
    'You need about 10 to 11 hours of sleep to let your body rest and grow. Brushing your teeth twice a day — morning and night — keeps your teeth strong and healthy.'),
  t(10, '### Summary: Healthy Habits\n\n**What we learned:**\n- Wash your hands with soap before eating and after using the toilet\n- Brush your teeth twice a day — morning and night\n- Bath or wash every day and wear clean clothes\n- Eat breakfast every morning to give your body energy\n- Drink lots of water — it is the best drink for your body\n- Sleep 10 to 11 hours every night\n\n**Remember:** Good habits keep you clean, strong, and healthy!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: My Feelings (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## My Feelings\n\nEveryone has feelings — you, me, your teacher, your mom, your friends, and even your dog! Feelings are how your heart and mind react to what happens around you.\n\nHere are some feelings you might know:\n- **Happy** — when you get a gold star or play with your friends\n- **Sad** — when you miss someone or lose something special\n- **Angry** — when something feels unfair or someone is mean to you\n- **Scared** — when you hear a loud noise or it is very dark\n- **Worried** — when you think something bad might happen\n\nAll feelings are **okay**. It is perfectly normal to feel angry sometimes. It is perfectly normal to feel scared. There is no such thing as a "bad feeling."'),
  t(2, '### Showing Feelings Nicely\n\nEven though all feelings are okay, we need to learn how to **show** our feelings in a nice way. This means not hurting other people when we feel big feelings inside.\n\n**When you feel angry:**\n- Take a deep breath in through your nose, and blow it out slowly through your mouth\n- Count to 10 before you do anything\n- Walk away if you need to calm down\n- Do NOT hit, kick, or throw things\n\n**When you feel sad:**\n- It is okay to cry — crying helps you feel better\n- Talk to someone about why you are sad\n- Give yourself a hug or ask for one\n- Draw a picture about how you feel\n\n**When you feel scared:**\n- Tell a grown-up you trust\n- Take deep breaths\n- Remember that many scary things are not really dangerous\n- Hold someone\'s hand if it helps'),
  q(3, 'Buhle feels very angry because someone took her crayon. What should she do?',
    ['Take a deep breath and count to 10 before doing anything', 'Hit the person who took her crayon', 'Throw all the crayons on the floor', 'Scream as loud as she can'], 0,
    'When you feel angry, the best thing to do is stop and take a deep breath. Counting to 10 helps your brain calm down so you can think of a better way to solve the problem, like asking for the crayon back or telling your teacher.'),
  t(4, '### What to Do When You Feel Bad\n\nSometimes you might feel bad for a long time. Maybe you feel sad every day, or worried all the time, or angry a lot. That is a sign that you need to talk to someone.\n\n**A trusted person** is someone who:\n- Listens to you\n- Cares about you\n- Helps you feel better\n- Keeps you safe\n\nTrusted people could be:\n- Your mom, dad, or gogo\n- Your teacher\n- Your auntie or uncle\n- A school counsellor\n\n**How to talk about your feelings:**\nUse these words to tell someone how you feel:\n- "I feel happy when..."\n- "I feel sad because..."\n- "I feel angry when..."\n- "I feel scared of..."\n\nTalking about your feelings is very brave. It does not make you weak — it makes you strong!'),
  fb(5, 'All feelings are ___. When you feel bad for a long time, you should talk to a ___ person.',
    ['okay', 'trusted'],
    'Every feeling you have is okay and normal. When sad or worried feelings do not go away, talking to a trusted person like your mom, gogo, or teacher can help you feel much better.'),
  t(6, '### Understanding Other People\'s Feelings\n\nJust like you have feelings, so does everyone else! Sometimes you can see how someone is feeling by looking at their face or body.\n\n**How to tell what someone is feeling:**\n- A smile means they are probably happy\n- Tears mean they are probably sad\n- Crossed arms and a frown mean they might be angry\n- Wide eyes and a frozen body mean they might be scared\n\n**Being kind about feelings:**\n- If a friend is sad, ask them: "Are you okay? Do you want to talk?"\n- If someone is angry, give them space to calm down\n- If someone is scared, stay with them and help them feel safe\n- Never laugh at someone for showing their feelings\n\nIn South Africa, we say **"ubuntu"** — it means "I am because we are." When you care about how other people feel, you are showing ubuntu.'),
  q(7, 'Your friend Sipho looks sad and is sitting alone at break time. What should you do?',
    ['Go to him and ask if he is okay and if he wants to talk', 'Leave him alone because it is not your problem', 'Laugh at him for looking sad', 'Tell everyone that Sipho is crying'], 0,
    'When you notice a friend is sad, the kindest thing to do is go to them, ask if they are okay, and offer to listen. This shows ubuntu — that you care about your friend\'s feelings.'),
  q(8, 'Is it okay for boys to cry?',
    ['Yes, everyone — boys and girls — has feelings and it is healthy to express them', 'No, boys should never cry', 'Only when they are alone', 'Only babies cry'], 0,
    'Everyone has feelings, and crying is a healthy way to let out sadness. Boys and girls both feel happy, sad, angry, and scared. Showing your feelings does not make you weak — it makes you brave.'),
  fb(9, 'When you feel angry, you should take a deep ___ and count to ___.',
    ['breath', '10'],
    'Taking a deep breath fills your body with air and helps calm you down. Counting to 10 gives your brain time to think clearly before you act, so you can make a good choice.'),
  t(10, '### Summary: My Feelings\n\n**What we learned:**\n- Everyone has feelings, and all feelings are okay\n- Happy, sad, angry, scared, and worried are all normal feelings\n- Show your feelings in nice ways — do not hit, kick, or throw things\n- When you feel angry, take a deep breath and count to 10\n- When you feel bad for a long time, talk to a trusted person\n- Care about other people\'s feelings too — that is ubuntu\n- Boys and girls can ALL show their feelings\n\n**Remember:** Your feelings matter, and it is always okay to talk about them!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Being Safe (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Being Safe\n\nBeing safe means making sure that you do not get hurt. There are safe places and unsafe places, and it is important to know the difference.\n\n**Safe places** are where grown-ups look after you:\n- Your home\n- Your school\n- Your church, mosque, or temple\n- A friend\'s house when their parents are home\n\n**Unsafe places** are where you could get hurt:\n- A busy road with lots of cars\n- A river or dam with no grown-ups watching\n- An empty building or field where there are no people\n- Anywhere you do not know\n\nIn this lesson, we will learn about road safety, stranger danger, emergencies, and knowing important information that can help keep you safe.'),
  t(2, '### Road Safety\n\nMany children in South Africa walk along roads every day — to school, to the shops, or to visit friends. Cars and trucks can be very dangerous, so it is important to know the road safety rules.\n\n**How to cross the road safely:**\n1. **STOP** at the edge of the road\n2. **LOOK** left, then right, then left again\n3. **LISTEN** for cars or trucks\n4. **WALK** — do NOT run — across the road when it is safe\n\n**More road safety rules:**\n- Walk on the pavement (sidewalk) if there is one\n- If there is no pavement, walk facing the cars so you can see them coming\n- Never play in the road or near the road\n- Wear bright clothes so drivers can see you, especially in the early morning or late afternoon\n- Always wear a seatbelt in the car\n- Hold a grown-up\'s hand when crossing busy roads'),
  q(3, 'When you cross the road, which way should you look first?',
    ['Left, then right, then left again', 'Right, then left', 'You do not need to look', 'Just look straight ahead and walk'], 0,
    'In South Africa, cars drive on the left side of the road. This means the closest cars come from your left, so you look LEFT first, then RIGHT, then LEFT again to make sure it is safe to cross.'),
  t(4, '### Stranger Danger\n\nA **stranger** is someone you do not know. Most strangers are nice people, but some strangers could be dangerous. Because you cannot tell which strangers are safe just by looking at them, there are important rules to follow.\n\n**Stranger safety rules:**\n- Never go anywhere with a stranger, even if they seem nice\n- Never take sweets, money, or gifts from a stranger\n- Never get into a stranger\'s car\n- If a stranger asks you for help (like finding a lost puppy), say "No, ask a grown-up" and walk away\n- If a stranger tries to grab you, **scream loudly** and run to a safe place\n\n**What to do if you feel unsafe:**\n- Run to the nearest shop, house, or group of people\n- Shout "Help! I do not know this person!"\n- Tell a trusted grown-up straight away\n\nRemember: A safe grown-up will NEVER ask a child for help or tell a child to keep a secret from their parents.'),
  fb(5, 'When crossing the road, you should look ___, then right, then left again. You should never go anywhere with a ___.',
    ['left', 'stranger'],
    'Always look left first because South African traffic comes from the left side. A stranger is someone you do not know, and you should never go with them, even if they seem friendly.'),
  t(6, '### What to Do in an Emergency\n\nAn **emergency** is when something dangerous happens and you need help quickly. Emergencies can be a fire, someone getting very hurt, or someone getting very sick.\n\n**Important emergency numbers in South Africa:**\n- **Police:** 10111\n- **Ambulance:** 10177\n- **Childline:** 116 (free to call!)\n\n**If there is an emergency:**\n1. Stay calm — take a deep breath\n2. Find a grown-up and tell them what happened\n3. If no grown-up is near, call one of the numbers above\n4. Tell them: your name, where you are, and what happened\n\n**Know your important information!**\nEvery child should try to remember:\n- Your full name\n- Your home address (or at least the name of your street or area)\n- Your mom or dad\'s phone number\n- The name of your school\n\nAsk your mom, dad, or gogo to help you practise these until you know them by heart!'),
  q(7, 'What number do you call for the police in South Africa?',
    ['10111', '10177', '911', '116'], 0,
    'The South African Police Service (SAPS) emergency number is 10111. This is a very important number to remember! The ambulance is 10177 and Childline is 116.'),
  q(8, 'A friendly-looking stranger at the park offers you sweets and asks you to come help find their lost puppy. What should you do?',
    ['Say "No, ask a grown-up" and walk away quickly', 'Go with them because they seem nice', 'Take the sweets but do not go with them', 'Ask the stranger to wait while you ask your friend'], 0,
    'A safe grown-up would never ask a child for help. Even if the stranger seems very nice, you should always say no, walk away, and tell a trusted grown-up what happened.'),
  fb(9, 'The police emergency number in South Africa is ___. The Childline number is ___ and it is free to call.',
    ['10111', '116'],
    'Remember these important numbers! Call 10111 for the police and 116 for Childline. Childline is a special helpline just for children, and it does not cost anything to call.'),
  t(10, '### Summary: Being Safe\n\n**What we learned:**\n- Know the difference between safe and unsafe places\n- Road safety: Stop, Look left-right-left, Listen, Walk\n- Stranger danger: Never go with a stranger or take things from them\n- If a stranger tries to grab you, scream and run to safety\n- Emergency numbers: Police 10111, Ambulance 10177, Childline 116\n- Know your full name, address, and your parent\'s phone number\n\n**Remember:** Being safe means knowing the rules and following them!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: My Body (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## My Body\n\nYour body is amazing! It helps you run, jump, think, play, eat, and sleep every single day. Your body belongs to **you** and nobody else.\n\nLet us learn about the different parts of your body and how to keep them healthy and safe.\n\n**Parts of your body:**\n- Your **brain** is inside your head. It helps you think, remember, and feel.\n- Your **heart** beats all day and night to pump blood around your body.\n- Your **lungs** help you breathe in air.\n- Your **bones** hold you up and let you move.\n- Your **muscles** make you strong and help you lift, push, and pull.\n- Your **skin** covers your whole body and protects everything inside.'),
  t(2, '### Keeping My Body Healthy\n\nYour body needs good things to stay strong and healthy. Think of your body like a plant — a plant needs water, sunshine, and good soil to grow. Your body needs good food, water, exercise, and rest!\n\n**Good food for your body:**\n- Fruit and vegetables — bananas, apples, spinach, carrots, pumpkin\n- Pap, bread, and rice give you energy\n- Chicken, fish, eggs, and beans make you strong\n- Milk, yoghurt, and amasi keep your bones strong\n\n**Foods that are treats (not for every day):**\n- Sweets and chocolates\n- Chips and crisps\n- Fizzy drinks\n- Too many fried foods\n\n**Exercise:**\nYour body loves to move! Running, jumping, skipping, dancing, and playing games all count as exercise. Try to play and move around for at least **one hour every day**.'),
  q(3, 'Which of these is a healthy food to eat every day?',
    ['Fruit and vegetables like bananas and spinach', 'Sweets and chocolates', 'Chips and crisps', 'Fizzy drinks like Coke'], 0,
    'Fruit and vegetables are full of vitamins that help your body grow strong and fight off sickness. Bananas give you energy and spinach makes you strong — they are healthy foods for every day!'),
  t(4, '### Good Touch and Bad Touch\n\nSome touches feel nice and safe. These are called **good touches**. Other touches feel scary or uncomfortable. These are called **bad touches**.\n\n**Good touches:**\n- A hug from your mom or dad\n- A high-five from your friend\n- Holding your gogo\'s hand\n- A pat on the back from your teacher when you did well\n\n**Bad touches:**\n- When someone touches the private parts of your body (the parts covered by your underwear)\n- When someone hurts you on purpose — hitting, pinching, or kicking\n- Any touch that makes you feel scared or uncomfortable\n- Any touch that someone tells you to keep a secret\n\n**Your body belongs to YOU.** Nobody has the right to touch you in a way that makes you feel bad.'),
  fb(5, 'A good touch makes you feel ___ and loved. Your private parts are the parts covered by your ___.',
    ['safe', 'underwear'],
    'Good touches make you feel safe, warm, and cared for — like a hug from someone you love. Your private parts are covered by your underwear and belong only to you.'),
  t(6, '### My Body Belongs to Me\n\nIf someone ever gives you a bad touch or makes you feel uncomfortable, you should do three things:\n\n**1. SAY NO!** Use a big, strong voice. Say "No!" or "Stop it!" or "I do not like that!"\n\n**2. GO AWAY.** Move away from the person. Run if you need to. Go to a safe place.\n\n**3. TELL SOMEONE.** Tell a grown-up you trust — your mom, dad, gogo, teacher, or auntie.\n\n**Very important things to remember:**\n- It is NEVER your fault if someone gives you a bad touch\n- You will NOT get in trouble for telling\n- If the first person you tell does not help, tell someone else\n- Secrets about touching are NEVER okay\n\n**Childline:** If you need help, call **116** — it is free!'),
  q(7, 'If someone touches you in a way that makes you feel scared or uncomfortable, what is the FIRST thing you should do?',
    ['Say "No!" in a big, strong voice', 'Keep it a secret', 'Pretend it did not happen', 'Do nothing and hope it stops'], 0,
    'The first step is to say "No!" in a loud, strong voice. Then go away from the person and tell a trusted grown-up. It is never your fault, and you should always tell someone.'),
  q(8, 'Which of these is a good touch?',
    ['A hug from your mom', 'A touch that someone tells you to keep a secret', 'A touch on your private parts', 'A hit or a kick'], 0,
    'A hug from your mom is a good touch because it makes you feel safe, warm, and loved. Good touches come from people who care about you and never make you feel scared or uncomfortable.'),
  fb(9, 'If someone gives you a bad touch, say no, go away, and ___ someone. You can call ___ for free to get help.',
    ['tell', '116'],
    'Always tell a trusted grown-up if someone gives you a bad touch. If you cannot find anyone to help, call Childline at 116 — it is free, and they will listen and help you.'),
  t(10, '### Summary: My Body\n\n**What we learned:**\n- Your body is amazing and belongs only to you\n- Keep your body healthy with good food, water, exercise, and rest\n- Good touches make you feel safe and loved\n- Bad touches make you feel scared or uncomfortable\n- Your private parts are covered by your underwear — they belong to you\n- If someone gives you a bad touch: Say No, Go Away, Tell Someone\n- It is NEVER your fault and you will NOT get in trouble for telling\n- Childline: 116 (free to call)\n\n**Remember:** Your body belongs to YOU!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Playing and Exercise (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Playing and Exercise\n\nDo you know that playing is actually one of the best things you can do for your body? When you run, jump, skip, and play, your body gets stronger and healthier!\n\nExercise is good for you because it:\n- Makes your heart and muscles strong\n- Gives you energy\n- Helps you sleep better at night\n- Makes you feel happy\n- Helps your brain think better\n\nChildren should try to be active for at least **one hour every day**. That sounds like a lot, but it is easy when you are having fun! Playing at break time, walking to school, and riding your bicycle all count.'),
  t(2, '### Fun Ways to Exercise\n\nYou do not need a gym or special equipment to exercise. There are so many fun ways to move your body!\n\n**Running:** Have a race with your friends at break time. See who can run the fastest!\n\n**Jumping:** Jump over a rope, jump on one foot, or play hopscotch. How high can you jump?\n\n**Skipping:** Skip with a skipping rope or skip along the path. Try to count how many times you can skip without stopping!\n\n**Ball games:** Play catch, soccer, or netball with your friends. Throwing and catching helps your hands and eyes work together.\n\n**Dancing:** Put on your favourite music and dance! Dancing is great exercise and it makes you feel happy.\n\n**Walking:** Walk to school if you can. Walk to the shops with your mom. Walking is exercise too!'),
  q(3, 'How long should children be active every day?',
    ['At least one hour', 'Only 5 minutes', 'Children do not need exercise', 'Only on weekends'], 0,
    'Children should be active for at least one hour (60 minutes) every day. This can be playing at break, walking, running, jumping, or any fun activity that gets your body moving!'),
  t(4, '### Playing Fairly and Taking Turns\n\nPlaying is much more fun when everyone plays fairly. Being a good sport means following the rules and being kind — whether you win or lose.\n\n**Rules for fair play:**\n- Follow the rules of the game\n- Wait for your turn — do not push in\n- Do not cheat — it spoils the fun for everyone\n- If you win, be humble — do not brag or show off\n- If you lose, be a good sport — say "Well done!" to the winner\n- Include everyone — do not leave someone out because they are not good at the game\n\n**Taking turns:**\nWhen you take turns, everyone gets a chance. This is fair! You can take turns:\n- On the swings and slide\n- When choosing games at break time\n- When speaking in class\n- When playing with toys at home'),
  fb(5, 'Being a good sport means following the ___ and being kind whether you win or ___.',
    ['rules', 'lose'],
    'Fair play means following the rules of the game. A good sport is happy when they win but also kind and graceful when they lose — they do not sulk or blame others.'),
  t(6, '### South African Games\n\nDid you know that children in South Africa have been playing special games for hundreds of years? These are called **indigenous games**, and they are lots of fun!\n\n**Diketo (Jacks):** You throw a stone in the air and quickly pick up other stones from the ground before catching it again. This game helps your hands move quickly!\n\n**Drie Stokkies (Three Sticks):** A team game where you stack three sticks and one team tries to knock them down while the other team guards them.\n\n**Kgati (Rope Jumping):** Two people swing a long rope and others jump in and out. You can sing songs while you jump!\n\n**Kennetjie:** A game played with two sticks — you use the big stick to flick the small stick into the air and then hit it as far as you can.\n\nThese games do not need expensive equipment. You can play them with sticks, stones, and a piece of rope. They are fun, free, and full of exercise!'),
  q(7, 'What is diketo?',
    ['A traditional South African game where you throw a stone in the air and pick up others from the ground', 'A type of food', 'A song you sing at school', 'A dance you do at parties'], 0,
    'Diketo is a traditional South African game, also known as "jacks." You throw a stone in the air and try to pick up other stones from the ground before catching the first stone. It is great for making your hands quick and nimble!'),
  q(8, 'Your team just lost a soccer game at break time. What is the best thing to do?',
    ['Say "Well done!" to the other team and try harder next time', 'Get angry and refuse to play again', 'Say the other team cheated', 'Walk away and do not talk to anyone'], 0,
    'A good sport congratulates the winning team and does not get angry or blame others. Losing is a normal part of playing games. You can always practise and try harder next time!'),
  fb(9, 'Children in South Africa have played ___ games for hundreds of years. Kgati is a traditional game played with a long ___.',
    ['indigenous', 'rope'],
    'Indigenous games are traditional games that have been played in South Africa for a very long time. Kgati is a jumping game played with a long rope while singing songs — it is lots of fun!'),
  t(10, '### Summary: Playing and Exercise\n\n**What we learned:**\n- Exercise makes your body strong, your brain sharp, and your heart happy\n- Children should be active for at least one hour every day\n- Fun ways to exercise: running, jumping, skipping, ball games, dancing, and walking\n- Play fairly — follow the rules, take turns, and include everyone\n- Be a good sport — whether you win or lose\n- South Africa has special indigenous games like diketo, drie stokkies, kgati, and kennetjie\n\n**Remember:** Playing and exercising is good for your body AND your heart!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Friends and Family (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Friends and Family\n\nFriends and family are the most important people in your life. Your family gives you love and takes care of you. Your friends make life fun and keep you company.\n\nIn South Africa, family and community are very, very important. We have a special word for this: **ubuntu**. Ubuntu means "I am because we are." It teaches us that we all belong together and should help and care for each other.\n\nIn this lesson, we will learn about being a good friend, helping at home, respecting our elders, and understanding that families come in all shapes and sizes.'),
  t(2, '### Being a Good Friend\n\nA good friend is someone who makes you feel happy and safe. Being a good friend is one of the most important things you can learn!\n\n**How to be a good friend:**\n- **Share** — share your toys, your snacks, and your time\n- **Listen** — when your friend talks, really listen to what they say\n- **Be kind** — say nice things and help them when they are struggling\n- **Be honest** — always tell the truth, but be gentle about it\n- **Play together** — include your friend in games and activities\n- **Say sorry** — if you do something wrong, say "I am sorry" and mean it\n- **Forgive** — if your friend says sorry, try to forgive them\n\n**Making new friends:**\nMaking a new friend can be easy! Just:\n- Smile and say "Hello, my name is..."\n- Ask them: "Do you want to play with us?"\n- Find out what you both enjoy — maybe you both like soccer or drawing!'),
  q(3, 'Your friend Zinhle accidentally broke your favourite pencil and she looks very upset about it. She says she is sorry. What should you do?',
    ['Forgive her because it was an accident and she is sorry', 'Stop being her friend forever', 'Break one of her pencils too', 'Tell everyone in the class what she did'], 0,
    'A good friend forgives when someone is truly sorry, especially when it was an accident. Nobody is perfect, and everyone makes mistakes. Forgiving Zinhle will make you both feel better.'),
  t(4, '### Helping at Home and Respecting Elders\n\n**Helping at home:**\nYou are part of a team called your family! Even though you are young, there are many ways you can help at home:\n- Make your bed in the morning\n- Put your dirty clothes in the washing basket\n- Help wash the dishes\n- Sweep the floor\n- Look after your little brother or sister\n- Feed the dog or cat\n- Set the table before meals\n\nWhen everyone helps at home, the work gets done faster and your family has more time to spend together.\n\n**Respecting elders:**\nIn South Africa, we show great respect to older people. This is an important part of our culture.\n- Say "Sawubona" or "Dumela" when you greet older people\n- Say "please" and "thank you"\n- Listen when elders are speaking — do not interrupt\n- Offer to help if you see an older person carrying heavy bags\n- Use respectful words like "Gogo," "Tata," "Mama," or "Baba"'),
  fb(5, 'Ubuntu means "I am because we ___." In South Africa, we show great ___ to older people.',
    ['are', 'respect'],
    'Ubuntu teaches us that we are all connected — "I am because we are." Respecting our elders is an important part of South African culture, and we show it by greeting them politely and offering to help.'),
  t(6, '### Different Types of Families\n\nFamilies come in all shapes and sizes. No family is the same, and that is perfectly okay! What makes a family special is the love inside it.\n\n**Different types of families:**\n- Some children live with their mom and dad\n- Some children live with just their mom or just their dad\n- Some children live with their gogo (grandmother) or grandfather\n- Some children live with an aunt, uncle, or other family member\n- Some children are raised by foster parents who love them\n- Some families are big with many brothers, sisters, and cousins\n- Some families are small with just one or two people\n\nIn South Africa, it is very common for grandparents to raise their grandchildren, or for aunties and uncles to help look after children. Extended families — where grandparents, aunts, uncles, and cousins all live close together — are a beautiful part of our culture.\n\n**Every family is a real family as long as there is love!**'),
  q(7, 'Mpho lives with his gogo because his parents work in another city. Is Mpho\'s family a real family?',
    ['Yes! A family is a real family as long as there is love', 'No, a real family needs a mom and dad living together', 'Only if his gogo is young', 'No, only parents count as family'], 0,
    'Mpho\'s gogo loves him and takes care of him — that makes them a real family. In South Africa, many children live with their grandparents, and these families are full of love and care.'),
  q(8, 'What does the word "ubuntu" teach us?',
    ['That we are all connected and should care for each other', 'That only your family matters', 'That you should only look after yourself', 'That you should always be the best'], 0,
    'Ubuntu is a beautiful African idea that means "I am because we are." It teaches us that we are all connected to each other and that we should care for and help one another — like one big family.'),
  fb(9, 'A good friend says ___ when they make a mistake. Families come in all shapes and sizes — what makes a family special is the ___ inside it.',
    ['sorry', 'love'],
    'Saying sorry when you make a mistake is an important part of being a good friend. And no matter what your family looks like, it is the love that makes it special.'),
  t(10, '### Summary: Friends and Family\n\n**What we learned:**\n- A good friend shares, listens, is kind, honest, and forgiving\n- Making new friends is easy — just smile, say hello, and invite them to play\n- Help at home by making your bed, sweeping, and setting the table\n- Respect elders by greeting them politely, listening, and offering to help\n- Families come in all shapes and sizes — all families are special\n- Ubuntu teaches us that we are all connected and should care for each other\n\n**Remember:** When you show love, kindness, and respect, you make the world a better place!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Our Rights (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Our Rights\n\nDid you know that every child in South Africa has special rights? A **right** is something that you deserve just because you are a person. Nobody can take your rights away from you.\n\nThe **South African Constitution** (the big book of rules for our country) says that every child has the right to:\n- **Food** — you deserve to eat and not be hungry\n- **Shelter** — you deserve a safe place to live\n- **Education** — you deserve to go to school and learn\n- **Love and care** — you deserve people who look after you\n- **Protection** — you deserve to be safe from harm\n- **Health care** — you deserve to see a doctor when you are sick\n\nThese rights belong to EVERY child — no matter who they are, what they look like, or where they come from.'),
  t(2, '### Rights Come with Responsibilities\n\nA **responsibility** is something you must do. When you have rights, you also have responsibilities. They go together like shoes and socks!\n\n**Your rights and your responsibilities:**\n\n| Your Right | Your Responsibility |\n|---|---|\n| You have the right to education | You must go to school and do your best |\n| You have the right to be safe | You must not hurt other people |\n| You have the right to food | You must not waste food |\n| You have the right to a clean place | You must not litter |\n| You have the right to be treated fairly | You must treat others fairly too |\n| You have the right to learn | You must listen to your teacher and respect others |\n\nWhen everyone takes care of their responsibilities, everyone\'s rights are protected. It is like a promise we all make to each other!'),
  q(3, 'Every child has the right to education. What is the responsibility that goes with this right?',
    ['To go to school and do your best', 'To stay at home and play all day', 'To only learn things you like', 'To let other children do your work'], 0,
    'If you have the right to go to school, your responsibility is to make the most of it — go to school, listen to your teacher, and try your best. Rights and responsibilities always go together.'),
  t(4, '### Looking After School Property\n\nYour school is a special place. It is where you learn, play, and make friends. Everyone must help look after the school so it stays a nice place for all.\n\n**How to look after school property:**\n- Do not write on desks or walls\n- Do not break windows, chairs, or doors\n- Keep the toilets clean — flush after you use them\n- Do not tear pages out of library books\n- Put rubbish in the bin, not on the ground\n- Take care of the playground equipment — do not break it on purpose\n\n**Why does this matter?**\nIf school property is broken, it costs money to fix. Many schools in South Africa do not have much money. When you look after your school, you are helping to make sure everyone can learn and play in a good environment.\n\nYour school belongs to your whole community — treat it with respect!'),
  fb(5, 'A ___ is something you must do. When you have rights, you also have ___.',
    ['responsibility', 'responsibilities'],
    'A responsibility is something you must do. Your rights and responsibilities go together — if you have the right to learn, you have the responsibility to go to school and try your best.'),
  t(6, '### Treating Others Fairly\n\nTreating others fairly means giving everyone an equal chance. It means not leaving people out because they are different from you.\n\n**Fair treatment means:**\n- Letting everyone join in games at break time\n- Not making fun of someone because of how they look, talk, or dress\n- Sharing equally — not giving more to your best friend and less to others\n- Standing up for someone who is being treated badly\n- Listening to everyone\'s ideas, not just the popular children\n\n**Bullying is NOT fair.**\nBullying is when someone is mean to the same person over and over again. Bullying can be:\n- Calling someone hurtful names\n- Hitting, pushing, or kicking\n- Leaving someone out on purpose\n- Saying mean things about someone behind their back\n\nIf you see bullying, do not just watch. Tell a teacher. Standing up for someone who is being bullied is one of the bravest things you can do!'),
  q(7, 'Lerato sees that a group of children are being mean to a younger child every day at break time. What should she do?',
    ['Tell a teacher about the bullying', 'Join in with the group', 'Ignore it because it is not her problem', 'Wait and see if it stops by itself'], 0,
    'Bullying is serious and it does not usually stop by itself. The bravest and best thing Lerato can do is tell a teacher. This is not "telling tales" — it is standing up for someone who needs help.'),
  q(8, 'Why should you look after school property?',
    ['Because the school belongs to the whole community and broken things are hard to replace', 'Because you might get punished if you break something', 'Because only new schools are nice', 'Because property does not matter'], 0,
    'Your school belongs to the whole community. When property is broken, it costs money to fix, and many schools do not have extra money. Looking after your school is a responsibility that helps everyone.'),
  fb(9, 'Every child in South Africa has the right to food, shelter, ___, and love. Treating others fairly means giving everyone an ___ chance.',
    ['education', 'equal'],
    'The South African Constitution says every child has the right to food, shelter, education, and love. Treating others fairly means making sure everyone gets an equal chance — no one should be left out or treated badly.'),
  t(10, '### Summary: Our Rights\n\n**What we learned:**\n- Every child has the right to food, shelter, education, love, protection, and health care\n- Rights come with responsibilities — they go together\n- Look after school property — it belongs to the whole community\n- Treat everyone fairly and give everyone an equal chance\n- Bullying is never okay — if you see it, tell a teacher\n- Standing up for others is one of the bravest things you can do\n\n**Remember:** You have rights, and so does everyone else. Let us protect each other!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Looking After Our World (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Looking After Our World\n\nOur planet Earth is our home. It gives us air to breathe, water to drink, food to eat, and beautiful places to enjoy. But our planet needs us to look after it!\n\nIn South Africa, we have beautiful mountains, rivers, oceans, and wildlife. From Table Mountain in Cape Town to the Kruger National Park, our country is full of amazing places. But if we do not take care of our world, these beautiful things could disappear.\n\nIn this lesson, we will learn about not littering, recycling, saving water, planting seeds, and looking after animals.'),
  t(2, '### Don\'t Litter!\n\nLitter is rubbish that is thrown on the ground instead of in a bin. Litter is bad because:\n- It makes our streets, parks, and schools look ugly\n- Animals can eat litter and get very sick or die\n- Litter blocks drains and causes flooding when it rains\n- It spreads germs and makes people sick\n\n**How to stop litter:**\n- Always put your rubbish in a bin\n- If you see litter on the ground, pick it up and put it in a bin\n- Take a bag with you when you go to the park or beach to carry your rubbish home\n- Never throw anything out of a car window\n\nIn South Africa, many communities organise clean-up days. This is a wonderful way to look after your neighbourhood. Maybe you and your friends or family can do a clean-up in your area!'),
  q(3, 'Why is littering bad for animals?',
    ['Animals can eat litter and get very sick or even die', 'Animals like playing with litter', 'Litter does not affect animals at all', 'Animals know to stay away from litter'], 0,
    'Animals often mistake litter for food. Plastic bags, sweet wrappers, and other rubbish can make animals very sick or even kill them. Birds, turtles, and fish are especially affected by litter.'),
  t(4, '### Recycling\n\n**Recycling** means turning old, used things into new things instead of throwing them away. This is very important because it helps reduce the amount of rubbish that goes into landfills (big rubbish dumps).\n\n**Things you can recycle:**\n- **Paper** — old newspapers, magazines, and school paper\n- **Plastic** — bottles, containers, and bags\n- **Glass** — bottles and jars\n- **Metal** — tin cans and cool drink cans\n\n**How to recycle:**\n- Separate your rubbish into different groups: paper, plastic, glass, and metal\n- Put recyclable items in a recycling bin or bag\n- Give them to a recycling collector or take them to a recycling centre\n\nIn South Africa, many people collect recyclable items to sell. These hardworking people are called **waste pickers** and they help keep our country clean while earning money for their families.'),
  fb(5, '___ means turning old, used things into new things. You can recycle paper, plastic, glass, and ___.',
    ['Recycling', 'metal'],
    'Recycling is the process of taking old, used materials and turning them into something new. Paper, plastic, glass, and metal are the most common things we can recycle to reduce waste.'),
  t(6, '### Saving Water and Planting Seeds\n\n**Saving water:**\nSouth Africa is a country that does not have a lot of water. That means we must be very careful not to waste it!\n\n**How to save water:**\n- Close the tap while you brush your teeth\n- Take short showers instead of full baths\n- Tell a grown-up if you see a dripping tap\n- Use a bucket to wash the car instead of a hosepipe\n- Collect rainwater in a bucket to water the garden\n\n**Planting seeds:**\nPlanting is a wonderful way to help the earth! You can plant:\n- Flowers to make your home beautiful and help the bees\n- Vegetables like tomatoes, spinach, or mielies to eat\n- Trees that give shade and clean air\n\nPlanting a seed is like magic. You put a tiny seed in the soil, give it water and sunshine, and it grows into something beautiful! The **spekboom** is a special South African plant that is very easy to grow and is great for cleaning the air.'),
  q(7, 'What is one easy way to save water at home?',
    ['Close the tap while you brush your teeth', 'Leave the tap running all day', 'Take very long baths', 'Water does not need to be saved'], 0,
    'Closing the tap while you brush your teeth is a simple way to save a lot of water. In South Africa, water is precious, and every drop we save helps keep our rivers and dams full.'),
  q(8, 'Why are waste pickers important for South Africa?',
    ['They help keep the country clean by collecting recyclable materials', 'They make the streets messy', 'They are not important', 'They only collect things for fun'], 0,
    'Waste pickers do very important work! They collect recyclable materials like cardboard, plastic, and metal, which keeps our streets cleaner and reduces the amount of rubbish in landfills. They also earn money for their families.'),
  fb(9, 'South Africa does not have a lot of ___. The ___ is a South African plant that cleans the air and is very easy to grow.',
    ['water', 'spekboom'],
    'South Africa is a water-scarce country, which means we do not have as much water as many other countries. The spekboom is a wonderful indigenous plant that absorbs carbon dioxide and helps clean our air.'),
  t(10, '### Summary: Looking After Our World\n\n**What we learned:**\n- Do not litter — always put rubbish in a bin\n- Littering hurts animals, blocks drains, and makes our country ugly\n- Recycling turns old things into new things — recycle paper, plastic, glass, and metal\n- South Africa does not have much water — save water by closing the tap and taking short showers\n- Plant seeds — flowers, vegetables, and trees help our planet\n- The spekboom is a special SA plant that cleans the air\n\n**Remember:** If we all do a little bit, we can make a BIG difference for our planet!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Celebrating Together (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Celebrating Together\n\nSouth Africa is a country that loves to celebrate! We have special public holidays, birthday parties, cultural celebrations, and many reasons to come together and have fun.\n\nCelebrating is important because it:\n- Brings people together\n- Helps us remember important events in our history\n- Makes us feel happy and grateful\n- Teaches us about different cultures\n\nIn this lesson, we will learn about some of South Africa\'s special days and why celebrating together makes our Rainbow Nation even more beautiful.'),
  t(2, '### South African Public Holidays\n\nSouth Africa has many special public holidays. Here are some of the most important ones:\n\n**Freedom Day — 27 April:**\nThis is the day we remember when ALL South Africans — no matter what colour their skin is — were allowed to vote for the first time in 1994. Before that, during **apartheid**, only some people were allowed to vote. Freedom Day reminds us how precious our freedom is.\n\n**Heritage Day — 24 September:**\nThis is the day we celebrate all the different cultures, languages, and traditions in South Africa. Many people also call it **Braai Day** because South Africans love to braai (barbecue) together! On this day, you might wear traditional clothes, cook traditional food, and celebrate what makes your culture special.\n\n**Youth Day — 16 June:**\nThis day honours the brave young people of Soweto who stood up for their right to learn in their own language in 1976. Youth Day reminds us that young people can make a big difference in the world.'),
  q(3, 'What happened on 27 April 1994 that makes Freedom Day so important?',
    ['All South Africans were allowed to vote for the first time', 'It was the first Braai Day', 'Schools were closed for the first time', 'It was the first Youth Day'], 0,
    'On 27 April 1994, South Africa held its first democratic election where ALL people could vote, no matter the colour of their skin. This was the end of apartheid and the beginning of freedom for everyone.'),
  t(4, '### Birthdays and Cultural Celebrations\n\n**Birthdays:**\nBirthdays are a wonderful time to celebrate YOU! On your birthday, you are one year older. In South Africa, many families celebrate birthdays by:\n- Baking or buying a cake\n- Singing "Happy Birthday"\n- Having a party with friends and family\n- Giving presents\n\nEven a small birthday celebration with your family is special. It is not about how big the party is — it is about the love!\n\n**Cultural celebrations:**\nSouth Africa has so many beautiful cultural celebrations:\n- **Diwali** — the Festival of Lights, celebrated by Hindu South Africans with beautiful lamps and delicious sweets\n- **Eid** — celebrated by Muslim South Africans after a month of fasting, with special prayers and food\n- **Christmas** — celebrated by many South Africans in December with family, food, and gifts\n- **Umhlanga (Reed Dance)** — a traditional Zulu celebration honouring young women\n- **Heritage festivals** — celebrated by many different groups with traditional food, music, and dancing'),
  fb(5, 'Heritage Day on 24 September is also called ___ Day. On Freedom Day, we remember that ALL South Africans could ___ for the first time in 1994.',
    ['Braai', 'vote'],
    'Many South Africans call Heritage Day "Braai Day" because braaiing (barbecuing) together is a tradition that brings people of all cultures together. Freedom Day celebrates the first time every South African could vote in a democratic election.'),
  t(6, '### Being Thankful\n\nCelebrating is also a time to be **thankful**. Being thankful means noticing the good things in your life and feeling grateful for them.\n\n**Things to be thankful for:**\n- Your family who loves you\n- Your friends who play with you\n- Your teachers who help you learn\n- Food on your table\n- A school to go to\n- Clean water to drink\n- A safe place to sleep\n- The beautiful country you live in\n\nSometimes we forget to say "thank you" for the things we have. But being thankful makes you feel happier and helps you see all the good things around you.\n\n**Ways to show you are thankful:**\n- Say "thank you" to people who help you\n- Tell your family you love them\n- Take care of the things you have\n- Help others who have less than you\n- Write a thank-you note to someone special'),
  q(7, 'Youth Day on 16 June honours the brave young people of which town?',
    ['Soweto', 'Cape Town', 'Durban', 'Pretoria'], 0,
    'Youth Day honours the brave students of Soweto who marched on 16 June 1976. They were standing up for their right to be taught in their own language. Their bravery changed South Africa forever.'),
  q(8, 'Why is celebrating together important for South Africa?',
    ['Because it brings people of different cultures together and helps us learn about each other', 'Because it means we do not have to go to school', 'Because only one culture matters', 'Because celebrations are only for grown-ups'], 0,
    'Celebrating together brings people of all cultures together. In our Rainbow Nation, we have many different traditions, and when we celebrate together, we learn about each other and grow closer as a country.'),
  fb(9, 'Being ___ means noticing the good things in your life. Youth Day honours the brave young people of ___ in 1976.',
    ['thankful', 'Soweto'],
    'Being thankful means feeling grateful for the good things you have — your family, friends, food, school, and more. Youth Day remembers the brave students of Soweto who stood up for the right to learn in their own language.'),
  t(10, '### Summary: Celebrating Together\n\n**What we learned:**\n- South Africa has special public holidays like Freedom Day, Heritage Day, and Youth Day\n- Freedom Day (27 April) celebrates the first time all South Africans could vote in 1994\n- Heritage Day (24 September) celebrates all our different cultures — also called Braai Day!\n- Youth Day (16 June) honours the brave young people of Soweto in 1976\n- We celebrate birthdays, Diwali, Eid, Christmas, and many other special occasions\n- Being thankful makes you happier and helps you see the good in life\n\n**Remember:** When we celebrate together, we make our Rainbow Nation stronger!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create Grade 3
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 3/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 3:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 3', schoolId: SCHOOL_ID, orderIndex: 3,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 3:', String(GRADE_ID));
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
    tags: ['grade-3', 'life-orientation', 'caps'],
    aiModel: '',
    aiPrompt: '',
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    difficulty: 1,
    estimatedMinutes: 25,
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
      title: 'Chapter 1: I Am Special',
      description: 'What makes me special, the meaning of my name, my family, things I can do, being proud of who I am, and celebrating our Rainbow Nation.',
      order: 1,
      lessons: [
        { title: 'I Am Special', description: 'What makes me special, my name and its meaning, my family, things I am good at, being proud of myself, and respecting differences in our Rainbow Nation.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Healthy Habits',
      description: 'Washing hands, brushing teeth, bathing, wearing clean clothes, eating breakfast, drinking water, and getting enough sleep.',
      order: 2,
      lessons: [
        { title: 'Healthy Habits', description: 'Washing hands with soap, brushing teeth twice a day, bathing daily, wearing clean clothes, eating breakfast, drinking water, and sleeping 10-11 hours.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: My Feelings',
      description: 'Happy, sad, angry, scared, and worried feelings, showing feelings nicely, talking to a trusted person, and understanding others\' feelings with ubuntu.',
      order: 3,
      lessons: [
        { title: 'My Feelings', description: 'Identifying happy, sad, angry, scared, and worried feelings, healthy ways to show feelings, talking to a trusted person, understanding others\' feelings, and ubuntu.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Being Safe',
      description: 'Safe and unsafe places, road safety (look left-right-left), stranger danger, emergencies, and knowing your address and parents\' phone numbers.',
      order: 4,
      lessons: [
        { title: 'Being Safe', description: 'Safe and unsafe places, road safety (Stop, Look, Listen), stranger danger rules, what to do in emergencies, SA emergency numbers (10111, 10177, 116), and knowing your personal information.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: My Body',
      description: 'Parts of the body, keeping healthy with good food and exercise, good touch and bad touch (age-appropriate), and my body belongs to me.',
      order: 5,
      lessons: [
        { title: 'My Body', description: 'Parts of the body and what they do, keeping healthy with good food and exercise, good touch and bad touch, private body parts, saying no, telling a trusted adult, and Childline (116).', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Playing and Exercise',
      description: 'Why exercise is good, running, jumping, skipping, ball games, playing fairly, taking turns, and indigenous South African games.',
      order: 6,
      lessons: [
        { title: 'Playing and Exercise', description: 'Benefits of exercise, fun ways to move (running, jumping, skipping, dancing, ball games), playing fairly, taking turns, being a good sport, and indigenous SA games (diketo, drie stokkies, kgati, kennetjie).', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Friends and Family',
      description: 'Being a good friend, sharing and caring, helping at home, respecting elders, different types of families, and ubuntu.',
      order: 7,
      lessons: [
        { title: 'Friends and Family', description: 'Being a good friend (share, listen, forgive), making new friends, helping at home, respecting elders, different types of families, extended families, and ubuntu.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Our Rights',
      description: 'Every child\'s right to food, shelter, education, and love, being responsible, looking after school property, and treating others fairly.',
      order: 8,
      lessons: [
        { title: 'Our Rights', description: 'Children\'s rights (food, shelter, education, love, protection), matching rights with responsibilities, looking after school property, treating others fairly, and standing up against bullying.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Looking After Our World',
      description: 'Don\'t litter, recycling paper/plastic/glass/metal, saving water, planting seeds, the spekboom, and taking care of animals.',
      order: 9,
      lessons: [
        { title: 'Looking After Our World', description: 'Not littering, recycling paper/plastic/glass/metal, waste pickers, saving water in a water-scarce country, planting seeds and trees, and the spekboom.', blocks: ch9_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 10: Celebrating Together',
      description: 'SA public holidays (Heritage Day, Freedom Day, Youth Day), celebrating birthdays, cultural celebrations (Diwali, Eid, Christmas), and being thankful.',
      order: 10,
      lessons: [
        { title: 'Celebrating Together', description: 'Freedom Day (27 April), Heritage Day / Braai Day (24 September), Youth Day (16 June), birthdays, cultural celebrations (Diwali, Eid, Christmas, Umhlanga), and being thankful.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 3 Life Orientation \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering I Am Special, Healthy Habits, My Feelings, Being Safe, My Body, Playing and Exercise, Friends and Family, Our Rights, Looking After Our World, and Celebrating Together for the Grade 3 Life Orientation curriculum.',
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
  console.log('  TEXTBOOK: Grade 3 Life Orientation');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
