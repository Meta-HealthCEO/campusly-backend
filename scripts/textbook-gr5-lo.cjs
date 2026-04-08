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
// CHAPTER 1: Positive Self-Concept (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Positive Self-Concept\n\nEvery person is unique and special. As a Grade 5 learner, you are growing and changing every day. Understanding who you are — your strengths, your personality, and what makes you different — is called having a **self-concept**.\n\nYour self-concept is like a picture you carry in your mind of yourself. It includes:\n\n- **What you are good at** — maybe you are fast at running, creative at drawing, or kind to your friends\n- **What you find difficult** — everyone has areas they struggle with, and that is perfectly okay\n- **How you feel about yourself** — do you feel proud, confident, or sometimes unsure?\n\nHaving a **positive self-concept** means you know your strengths AND your weaknesses, but you still feel good about who you are. You believe in yourself even when things are hard.'),
  t(2, '### Strengths and Weaknesses\n\nNobody is good at everything, and nobody is bad at everything. Understanding what you are strong at helps you feel proud and confident. Understanding what you are weak at helps you know where to grow.\n\n| Strengths | Weaknesses |\n|-----------|------------|\n| I am good at helping others | I sometimes get angry quickly |\n| I can run fast | I find spelling difficult |\n| I make friends easily | I am shy when I speak in front of the class |\n| I am good at maths | I forget to do my chores |\n\n**Remember:** A weakness is NOT something to be ashamed of. It is something you can work on. Even the greatest South Africans — like Siya Kolisi, Caster Semenya, and Trevor Noah — had weaknesses they had to overcome.\n\n**Activity idea:** Write down three of your strengths and two things you would like to improve. Share one strength with your partner.'),
  q(3, 'Lerato says, "I am terrible at everything. I cannot do anything right." What does Lerato need to work on?',
    ['Developing a positive self-concept by recognising her strengths', 'Becoming better at schoolwork only', 'Ignoring her feelings', 'Comparing herself to others more often'], 0,
    'Lerato is being too hard on herself. Everyone has strengths. She needs to recognise what she IS good at, even small things, to build a more positive self-concept.'),
  t(4, '### Positive Self-Talk\n\nThe things you say to yourself inside your head are called **self-talk**. Self-talk can be positive or negative.\n\n**Negative self-talk** makes you feel bad:\n- "I am so stupid."\n- "Nobody likes me."\n- "I will never get this right."\n\n**Positive self-talk** makes you feel stronger:\n- "I made a mistake, but I can try again."\n- "I am kind and my friends like being around me."\n- "This is hard, but I am learning."\n\nPositive self-talk does not mean pretending everything is perfect. It means being fair to yourself and giving yourself encouragement, just like a good coach would.\n\n**Tip:** When you catch yourself thinking something negative, try to change it. Instead of "I can\'t do this," say "I can\'t do this YET."'),
  fb(5, 'The things you say to yourself inside your head are called ___. When you change "I can\'t do this" to "I can\'t do this yet," you are using ___ self-talk.',
    ['self-talk', 'positive'],
    'Self-talk is your inner voice. Changing negative thoughts into encouraging ones is called positive self-talk. It helps you feel more confident and motivated.'),
  t(6, '### Celebrating Achievements and Being Unique\n\nIt is important to celebrate your achievements — big and small. Did you finish a difficult homework task? Celebrate! Did you help a younger child? That is something to be proud of!\n\nIn South Africa, we celebrate our diversity. We come from many different cultures, speak different languages, and have different traditions. This is what makes our country a **Rainbow Nation**.\n\n**What makes YOU unique?**\n- Your language and culture\n- Your family and where you come from\n- Your interests and hobbies\n- Your personality — maybe you are funny, brave, thoughtful, or adventurous\n- Your dreams for the future\n\nBeing different is not something to hide. It is something to celebrate! When we respect each other\'s differences, we build a stronger community.'),
  q(7, 'Why is it important to celebrate even small achievements?',
    ['Because it builds self-confidence and encourages you to keep trying', 'Because you should show off to your friends', 'Because only big achievements matter in life', 'Because teachers give you marks for celebrating'], 0,
    'Celebrating small achievements builds your self-confidence. When you notice the good things you do, you feel more motivated to keep trying and improving.'),
  q(8, 'Which of the following is an example of positive self-talk?',
    ['"This is hard, but I am learning and getting better"', '"Everyone else is smarter than me"', '"I should just give up"', '"I am useless at this"'], 0,
    'Positive self-talk means being encouraging to yourself. Saying "This is hard, but I am learning" shows you believe in your ability to grow and improve.'),
  fb(9, 'Having a ___ self-concept means you know your strengths and weaknesses but still feel ___ about who you are.',
    ['positive', 'good'],
    'A positive self-concept does not mean thinking you are perfect. It means accepting yourself — both your strengths and areas for growth — and still feeling good about who you are.'),
  t(10, '### Summary: Positive Self-Concept\n\n**Key ideas from this chapter:**\n- Your self-concept is the picture you have of yourself\n- Everyone has strengths AND weaknesses — both are normal\n- Positive self-talk helps you feel confident and motivated\n- Celebrate your achievements, even the small ones\n- You are unique — your culture, language, personality, and interests make you special\n- Being different is something to celebrate in our Rainbow Nation\n\n**Remember:** You do not have to be perfect to be amazing!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Relationships (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Relationships\n\nRelationships are the connections we have with other people. As a Grade 5 learner, your relationships with family, friends, teachers, and classmates are very important. Good relationships make you feel happy, supported, and safe.\n\n### Types of Relationships\n\n| Relationship | Examples |\n|-------------|----------|\n| **Family** | Parents, grandparents, brothers, sisters, aunts, uncles |\n| **Friends** | School friends, neighbourhood friends, teammates |\n| **School** | Teachers, classmates, principal |\n| **Community** | Neighbours, church members, sports coaches |\n\nIn South Africa, many children are raised not only by their parents but also by their grandparents, aunts, uncles, and even neighbours. The African saying **"It takes a village to raise a child"** reminds us that many people help us grow up.'),
  t(2, '### Healthy Friendships\n\nA **healthy friendship** is one where both people feel respected, valued, and happy. Good friends:\n\n- **Listen** to each other\n- **Support** each other when things are tough\n- **Share** and take turns\n- **Are honest** without being hurtful\n- **Respect differences** — they do not try to change each other\n- **Apologise** when they make mistakes\n\n**Signs of an unhealthy friendship:**\n- One person always wants to be in charge\n- One person makes fun of the other or puts them down\n- There is pressure to do things that are wrong\n- You feel scared, sad, or anxious around the person\n\nIf a friendship makes you feel bad about yourself more than it makes you feel good, it may be an unhealthy friendship. Talk to a trusted adult if you are not sure.'),
  q(3, 'Sipho and Bongani are friends. Bongani always tells Sipho what to do, gets angry if Sipho wants to play with other children, and sometimes calls him names. What kind of friendship is this?',
    ['An unhealthy friendship because Bongani does not respect Sipho', 'A normal friendship because friends sometimes argue', 'A strong friendship because Bongani is protective', 'A healthy friendship because they spend a lot of time together'], 0,
    'This is an unhealthy friendship. In a healthy friendship, both people feel respected and free. Bongani is being controlling and hurtful. Sipho should talk to a trusted adult about this.'),
  t(4, '### Dealing with Conflict\n\nConflict happens when people disagree. Even the best of friends have disagreements sometimes. What matters is HOW you deal with the conflict.\n\n**Steps for resolving conflict peacefully:**\n1. **Cool down** — take a deep breath or walk away for a few minutes\n2. **Listen** — let the other person explain their side without interrupting\n3. **Use "I" statements** — say "I feel hurt when you..." instead of "You always..."\n4. **Find a solution together** — think of a way that works for both of you\n5. **Forgive** — holding a grudge only hurts you\n\n**"I" statement examples:**\n- "I feel left out when you don\'t include me in the game."\n- "I feel upset when you take my things without asking."\n- "I feel frustrated when you do not listen to me."'),
  fb(5, 'When you have a disagreement with a friend, you should first ___ down. Then you should ___ to the other person\'s side of the story.',
    ['cool', 'listen'],
    'Cooling down first prevents you from saying things you might regret. Listening to the other person helps you understand their point of view and find a solution together.'),
  t(6, '### Communication Skills and Respecting Differences\n\nGood communication is the key to good relationships. Communication is not just about talking — it also means **listening**.\n\n**Tips for good communication:**\n- Look at the person when they are speaking\n- Do not interrupt\n- Nod or say "I understand" to show you are listening\n- Ask questions if you do not understand\n- Speak politely, even when you disagree\n\n**Respecting differences:**\nIn South Africa, we have 12 official languages and many different cultures. Your classmates may celebrate different holidays, eat different foods, or follow different traditions. Respecting differences means:\n- Being curious instead of judgmental\n- Not making fun of someone\'s culture, language, or beliefs\n- Learning about other people\'s traditions\n- Treating everyone with **ubuntu** — the belief that we are all connected'),
  q(7, 'Naledi speaks isiZulu at home. Some children at school make fun of her accent when she speaks English. What should Naledi do?',
    ['Tell a trusted adult and remember that speaking more than one language is a strength, not a weakness', 'Stop speaking isiZulu so the children will stop teasing her', 'Make fun of those children back', 'Ignore it and pretend it does not bother her'], 0,
    'Naledi should tell a trusted adult because teasing someone about their language is disrespectful. South Africa has 12 official languages, and speaking more than one language is a wonderful skill to have.'),
  q(8, 'What does the word "ubuntu" mean?',
    ['I am because we are — we are all connected and should care for each other', 'Every person should look after themselves first', 'Only your family matters', 'Being the best at everything you do'], 0,
    'Ubuntu is an African philosophy that means "I am because we are." It teaches that people are connected to each other and that we should treat everyone with kindness and respect.'),
  fb(9, 'The African saying "___ takes a village to raise a child" means that many people help a child grow up. The philosophy of ___ teaches us that we are all connected.',
    ['It', 'ubuntu'],
    'This famous African proverb reminds us that raising a child is a community effort. Ubuntu is the philosophy that we become who we are through our relationships with others.'),
  t(10, '### Summary: Relationships\n\n**Key ideas from this chapter:**\n- We have many types of relationships — family, friends, school, and community\n- Healthy friendships involve respect, honesty, support, and kindness\n- Conflict is normal — what matters is how we handle it\n- Use "I" statements to express your feelings without blaming others\n- Good communication means listening AND speaking respectfully\n- Respect differences — celebrate our Rainbow Nation\n- Ubuntu teaches us that we are all connected\n\n**Remember:** Treat others the way you would like to be treated!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Healthy Eating (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Healthy Eating\n\nThe food you eat gives your body the energy and nutrients it needs to grow, learn, and play. Eating the right foods helps you stay healthy, concentrate in class, and have energy for sport and games.\n\n### The Food Groups\n\nThe South African Food-Based Dietary Guidelines teach us about different food groups:\n\n| Food group | What it does | SA examples |\n|-----------|-------------|-------------|\n| **Starchy foods** | Give you energy | Pap, bread, rice, samp, potatoes, umphokoqo |\n| **Vegetables and fruit** | Provide vitamins and minerals | Spinach (morogo), tomatoes, butternut, oranges, bananas, mangoes |\n| **Protein** | Builds and repairs muscles | Chicken, fish, eggs, beans, lentils, mopane worms |\n| **Dairy** | Strengthens bones and teeth | Milk, maas (amasi), cheese, yoghurt |\n| **Fats and oils** | Give energy and protect organs | Cooking oil, peanut butter, avocado, nuts |\n| **Water** | Keeps your body working properly | At least 6–8 glasses a day |\n\n**Tip:** Try to eat foods from ALL the food groups every day for a balanced diet.'),
  t(2, '### Balanced Meals and SA Traditional Foods\n\nA **balanced meal** contains foods from at least three different food groups. In South Africa, many traditional meals are already well-balanced!\n\n**Examples of balanced SA meals:**\n- **Pap with morogo and chicken** — starch + vegetables + protein\n- **Samp and beans with pumpkin** — starch + protein + vegetables\n- **Bread with peanut butter and a banana** — starch + fats/protein + fruit\n- **Umngqusho (samp and beans)** — a favourite of Nelson Mandela, full of energy and protein\n\n### Reading Food Labels\n\nWhen you buy food from a shop, look at the **food label** on the packaging. It tells you:\n- **Ingredients** — what the food is made of (listed from most to least)\n- **Sugar content** — too much sugar is bad for your teeth and health\n- **Salt content** — too much salt raises blood pressure\n- **Kilojoules (kJ)** — how much energy the food gives you\n\n**Rule of thumb:** If sugar or salt is listed in the first three ingredients, the food is probably not a healthy choice.'),
  q(3, 'Which of the following is a balanced South African meal?',
    ['Pap with morogo and grilled chicken', 'A packet of chips and a fizzy drink', 'Two slices of white bread with nothing on them', 'Only a chocolate bar for lunch'], 0,
    'Pap with morogo and grilled chicken combines starch (pap), vegetables (morogo), and protein (chicken) — three food groups in one meal. The other options are missing important food groups.'),
  fb(4, 'The food group that gives you energy is called ___ foods. The food group that builds and repairs muscles is called ___.',
    ['starchy', 'protein'],
    'Starchy foods like pap, bread, and rice provide energy. Protein foods like chicken, beans, and eggs help build and repair your muscles.'),
  t(5, '### The Dangers of Junk Food\n\nJunk food is food that is high in sugar, salt, and unhealthy fat but low in the nutrients your body needs. Examples include chips, sweets, fizzy drinks, fried foods, and sugary cereals.\n\n**Why junk food is harmful:**\n- Causes tooth decay — sugar feeds the bacteria that damage your teeth\n- Leads to weight gain — too many kilojoules without enough exercise\n- Makes you feel tired — a sugar "high" is always followed by a "crash"\n- Can cause health problems later in life — diabetes, heart disease, high blood pressure\n\n**Did you know?** One can of fizzy drink contains about 10 teaspoons of sugar! The recommended daily limit for a child is only 5–6 teaspoons.\n\n**Healthy swaps:**\n| Instead of... | Try... |\n|--------------|--------|\n| Fizzy drink | Water with lemon or rooibos tea |\n| Chips | Popcorn (without too much salt) |\n| Sweets | Fresh fruit like grapes or apple slices |\n| White bread | Brown bread or whole-wheat bread |'),
  q(6, 'How many teaspoons of sugar are in one can of fizzy drink?',
    ['About 10 teaspoons', 'About 2 teaspoons', 'About 5 teaspoons', 'No sugar at all'], 0,
    'One can of fizzy drink contains about 10 teaspoons of sugar, which is almost double the recommended daily limit for a child. Water is always the healthiest choice!'),
  t(7, '### Water — Your Body\'s Best Friend\n\nWater is the most important drink for your body. Your body is about 60% water! You need water for:\n\n- **Thinking clearly** — your brain needs water to work properly\n- **Digesting food** — water helps break down the food you eat\n- **Keeping cool** — when you sweat, you lose water\n- **Carrying nutrients** — water moves vitamins and minerals around your body\n- **Getting rid of waste** — water helps your kidneys clean your blood\n\n**How much water should you drink?**\nGrade 5 learners should drink at least **6–8 glasses of water** every day. You may need more if it is a hot day or you are doing sport.\n\n**Signs you are not drinking enough water:**\n- Feeling thirsty (by then you are already a bit dehydrated!)\n- Dark yellow urine (healthy urine is light yellow)\n- Headaches\n- Feeling tired or dizzy\n\n**Tip:** Carry a water bottle to school every day and take sips throughout the day.'),
  q(8, 'Thandi often gets headaches at school and feels tired in the afternoon. She only drinks one glass of water in the morning. What is the most likely cause?',
    ['She is not drinking enough water and may be dehydrated', 'She has a serious illness and needs medicine', 'She is eating too much food at lunch', 'She needs more sleep every night'], 0,
    'Headaches and tiredness are common signs of dehydration. Thandi should drink at least 6–8 glasses of water throughout the day. Carrying a water bottle to school would help.'),
  fb(9, 'You should drink at least ___ to ___ glasses of water every day. Your body is about ___% water.',
    ['6', '8', '60'],
    'Children should drink 6 to 8 glasses of water daily. Your body is approximately 60% water, which shows just how important staying hydrated is.'),
  t(10, '### Summary: Healthy Eating\n\n**Key ideas from this chapter:**\n- There are five main food groups plus water — try to eat from all groups daily\n- A balanced meal includes foods from at least three food groups\n- South African traditional meals like pap, morogo, and chicken are naturally balanced\n- Read food labels to check for sugar and salt content\n- Junk food is high in sugar, salt, and fat — limit how much you eat\n- Water is your body\'s best friend — drink 6–8 glasses every day\n\n**Challenge:** For one week, try to drink at least 6 glasses of water every day and eat fruit instead of sweets as a snack!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Personal Hygiene (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Personal Hygiene\n\nPersonal hygiene means keeping your body clean and healthy. Good hygiene helps you stay healthy, prevents the spread of germs, and makes you feel good about yourself.\n\n### Why Is Hygiene Important?\n\n- **Prevents illness** — germs (bacteria and viruses) cause diseases like flu, diarrhoea, and skin infections\n- **Stops germs from spreading** — clean hands stop germs from reaching your mouth, eyes, and nose\n- **Builds confidence** — when you look and smell clean, you feel good about yourself\n- **Shows respect** — taking care of your body shows respect for yourself and the people around you\n\n### Body Hygiene Basics\n\n| Hygiene habit | How often? |\n|--------------|------------|\n| **Bath or shower** | Every day |\n| **Wash hands** | Before eating, after using the toilet, after playing |\n| **Brush teeth** | At least twice a day (morning and night) |\n| **Wear clean clothes** | Every day — especially underwear and socks |\n| **Wash hair** | At least 2–3 times per week |\n| **Cut nails** | Once a week |'),
  t(2, '### Hand Washing — Your Best Defence\n\nHand washing is one of the simplest and most effective ways to prevent illness. Many diseases spread because people do not wash their hands properly.\n\n**The 5 steps of hand washing:**\n1. **Wet** your hands with clean running water\n2. **Lather** with soap — rub between your fingers, under your nails, and the backs of your hands\n3. **Scrub** for at least 20 seconds (sing "Happy Birthday" twice)\n4. **Rinse** under clean running water\n5. **Dry** with a clean towel or air dry\n\n**When must you wash your hands?**\n- Before eating or touching food\n- After using the toilet\n- After blowing your nose, coughing, or sneezing\n- After playing outside or touching animals\n- After touching rubbish\n\n**Did you know?** Proper hand washing can reduce diarrhoea by up to 40%! In South Africa, diarrhoea is one of the leading causes of illness in children, so washing hands saves lives.'),
  q(3, 'How long should you scrub your hands with soap when washing them?',
    ['At least 20 seconds', 'About 5 seconds', 'Just a quick rinse is enough', 'One minute'], 0,
    'You should scrub your hands with soap for at least 20 seconds. A helpful tip is to sing "Happy Birthday" twice — that takes about 20 seconds. This ensures germs are properly removed.'),
  t(4, '### Dental Care\n\nTaking care of your teeth is important because your adult teeth are the last set you will ever get. Once they are damaged, they cannot grow back.\n\n**How to take care of your teeth:**\n- **Brush twice a day** — in the morning and before bed\n- **Use fluoride toothpaste** — it strengthens your teeth\n- **Brush for 2 minutes** — cover all surfaces: front, back, and top\n- **Replace your toothbrush** every 3 months\n- **Floss** to clean between your teeth where the brush cannot reach\n- **Avoid too much sugar** — sugar feeds the bacteria that cause cavities\n\n**Visiting the dentist:**\nYou should visit the dentist at least once a year. Many government clinics in South Africa offer free dental check-ups for children. Do not wait until you have a toothache — prevention is better than cure!'),
  fb(5, 'You should brush your teeth at least ___ a day. You should replace your toothbrush every ___ months.',
    ['twice', '3'],
    'Brushing twice daily — in the morning and before bed — keeps your teeth clean and healthy. Replace your toothbrush every 3 months because old bristles become less effective at cleaning.'),
  t(6, '### Your Changing Body\n\nAs a Grade 5 learner, your body is starting to change. This is called **puberty**, and it is a normal and natural part of growing up. Some children start puberty earlier than others, and that is perfectly okay.\n\n**Changes you might notice:**\n- Growing taller\n- Sweating more, especially under your arms\n- Body odour (your sweat starts to smell different)\n- Skin becomes oilier, and you may get pimples\n- Hair may start growing under your arms and on your legs\n\n**Hygiene tips for your changing body:**\n- Use **deodorant** to manage body odour\n- **Shower daily** — especially after sport or physical activity\n- **Wash your face** morning and night to help prevent pimples\n- **Wear clean clothes** every day, especially underwear\n- **Talk to a trusted adult** if you have questions about the changes happening to your body\n\n**Remember:** Every person goes through puberty. It is nothing to be embarrassed about!'),
  q(7, 'Kabelo notices that he sweats more than he used to and his sweat smells different. What is happening to him?',
    ['He is going through puberty, which is a normal part of growing up', 'He is sick and needs to see a doctor immediately', 'He is not washing enough and should bath three times a day', 'Something is wrong with him that his friends will not experience'], 0,
    'Increased sweating and body odour are normal signs of puberty. Kabelo should start using deodorant and make sure he showers daily, especially after physical activity.'),
  fb(8, 'The stage of life when your body starts changing from a child to an adult is called ___. Using ___ helps manage body odour.',
    ['puberty', 'deodorant'],
    'Puberty is the natural process of growing from a child into an adult. Deodorant helps control the body odour that comes with increased sweating during puberty.'),
  q(9, 'Proper hand washing can reduce diarrhoea by up to what percentage?',
    ['40%', '10%', '5%', '80%'], 0,
    'Research shows that proper hand washing with soap can reduce diarrhoea by up to 40%. This is especially important in South Africa where diarrhoea is a leading cause of childhood illness.'),
  t(10, '### Summary: Personal Hygiene\n\n**Key ideas from this chapter:**\n- Good hygiene prevents illness and helps you feel confident\n- Wash your hands properly for at least 20 seconds with soap and water\n- Brush your teeth twice a day and visit the dentist once a year\n- As your body changes during puberty, your hygiene routine needs to change too\n- Use deodorant, shower daily, and wear clean clothes\n- Keep your environment clean — a clean space helps you stay healthy\n\n**Remember:** Taking care of your body is one of the most important ways to take care of yourself!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Safety at Home and School (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Safety at Home and School\n\nStaying safe is one of the most important things you can learn. Accidents and dangerous situations can happen at home, at school, and in your community. Knowing how to stay safe — and what to do in an emergency — could save your life or someone else\'s.\n\n### Fire Safety\n\nFires are a serious danger in South Africa, especially in informal settlements where homes are built close together.\n\n**How to prevent fires:**\n- Never play with matches, lighters, or candles\n- Keep candles away from curtains, blankets, and paper\n- Do not leave cooking food unattended\n- Make sure paraffin stoves are on a flat surface away from things that can burn\n- Never leave a fire (braai or open fire) without an adult watching it\n\n**What to do if there is a fire:**\n1. **GET OUT** — leave the building immediately. Do not stop to collect belongings\n2. **Stay LOW** — smoke rises, so crawl on the floor where the air is cleaner\n3. **Feel the door** — if a door is hot, do not open it. Use another exit\n4. **STOP, DROP, and ROLL** — if your clothes catch fire, do not run. Stop, drop to the ground, and roll to put out the flames\n5. **Call for help** — call the fire brigade or ask an adult to call'),
  t(2, '### Electricity Safety\n\nElectricity is useful but dangerous. It can cause electric shocks, burns, and even death.\n\n**Rules for electricity safety:**\n- Never touch electrical plugs, switches, or wires with wet hands\n- Do not put your fingers or objects into plug sockets\n- Do not overload plug points with too many adapters\n- Stay away from fallen power lines — they can still carry electricity\n- Do not fly kites near power lines\n- Never climb electricity pylons\n\n### Poison Safety\n\n**Common household poisons:**\n- Cleaning products (bleach, dishwashing liquid)\n- Insecticides (Doom, Raid)\n- Medicines (if taken incorrectly or by the wrong person)\n- Paraffin\n\n**Poison safety rules:**\n- Never drink or eat anything from a container without a label\n- Keep medicines and cleaning products out of reach of young children\n- Never store paraffin in a cold drink bottle — young children might drink it\n- If someone swallows poison, call the **Poison Information Centre: 0861 555 777** or go to the nearest hospital immediately'),
  q(3, 'Nomsa sees a bottle that looks like a cold drink bottle under the kitchen sink. It has a clear liquid inside. What should she do?',
    ['Leave it alone because it could contain poison — cleaning products are sometimes stored in unlabelled bottles', 'Taste a small amount to check if it is cold drink', 'Pour it into a glass and drink it', 'Give it to her younger brother to taste first'], 0,
    'Never drink anything from an unlabelled bottle or a bottle stored under the sink. It could contain bleach, paraffin, or another dangerous substance. This is one of the most common causes of poisoning in South African children.'),
  t(4, '### Road Safety\n\nRoad accidents are one of the leading causes of death and injury in South Africa. As a Grade 5 learner, you need to know how to stay safe on and near roads.\n\n**Road safety rules for pedestrians:**\n- Always walk on the pavement (sidewalk). If there is no pavement, walk facing oncoming traffic\n- Use pedestrian crossings and traffic lights to cross the road\n- **STOP, LOOK, and LISTEN** before crossing: stop at the kerb, look left-right-left, listen for vehicles, then cross quickly\n- Never run across the road\n- Do not use your phone or wear earphones while walking near traffic\n- Wear bright or reflective clothing when walking in the dark\n\n**Road safety on the school route:**\n- Walk with friends — there is safety in numbers\n- Use the same safe route every day\n- If a stranger offers you a lift, say NO and tell an adult immediately'),
  fb(5, 'Before crossing the road, you should ___, ___, and listen. In South Africa, the emergency police number is ___.',
    ['stop', 'look', '10111'],
    'The road safety rule is Stop, Look, and Listen. Stop at the kerb, look left-right-left for vehicles, and listen for traffic before crossing. The South African Police Service emergency number is 10111.'),
  t(6, '### Stranger Danger\n\nMost people in your community are kind and safe. But some people may try to harm children. Knowing how to protect yourself is very important.\n\n**Rules for staying safe around strangers:**\n- Never go anywhere with someone you do not know, even if they seem friendly\n- If a stranger offers you sweets, money, or a ride, say **NO** and walk away quickly\n- Never give your personal information (home address, phone number) to strangers\n- If someone makes you feel uncomfortable or unsafe, trust your feelings and GET AWAY\n- Always tell a trusted adult if a stranger approaches you\n\n**Trusted adults include:**\n- Your parents or guardians\n- Your teacher or principal\n- A police officer\n- A family member you trust\n\n**If you are ever in danger, shout loudly and run to the nearest safe place** (a shop, a school, a neighbour\'s house).'),
  q(7, 'A man in a car stops and tells Zanele that her mother sent him to pick her up from school. What should Zanele do?',
    ['Say no, walk away quickly, and tell a trusted adult about the stranger', 'Get in the car because her mother might really have sent him', 'Ask the man for her mother\'s phone number to check', 'Go with the man if he looks friendly'], 0,
    'Zanele should NEVER get into a car with someone she does not know, even if they claim to know her family. She should say no, walk away, and immediately tell a trusted adult.'),
  t(8, '### Emergency Numbers in South Africa\n\nKnowing these numbers could save a life. Write them down and keep them somewhere you can find them easily.\n\n| Emergency service | Number |\n|------------------|--------|\n| **Police (SAPS)** | **10111** |\n| **Ambulance** | **10177** |\n| **Fire brigade** | **10177** (some areas) or local number |\n| **Childline** | **116** (free from any phone) |\n| **Poison Information Centre** | **0861 555 777** |\n| **Gender-Based Violence Command Centre** | **0800 428 428** |\n\n**Remember:** You can call **Childline (116)** for free from any phone — even a phone without airtime. They are available 24 hours a day, 7 days a week.'),
  q(9, 'Which South African emergency number can children call for free from any phone, even without airtime?',
    ['Childline — 116', 'Police — 10111', 'Ambulance — 10177', 'Poison Centre — 0861 555 777'], 0,
    'Childline (116) is a free helpline for children in South Africa. You can call it from any phone, even without airtime, 24 hours a day. Trained counsellors are ready to help with any problem.'),
  t(10, '### Summary: Safety at Home and School\n\n**Key ideas from this chapter:**\n- Prevent fires by being careful with candles, stoves, and matches\n- Stop, Drop, and Roll if your clothes catch fire\n- Never touch electrical things with wet hands\n- Never drink from unlabelled bottles — it could be poison\n- Stop, Look, and Listen before crossing the road\n- Never go with a stranger — say NO, walk away, and TELL an adult\n- Know the emergency numbers: Police (10111), Ambulance (10177), Childline (116)\n\n**Activity:** Practise an emergency escape plan with your family. Decide on a meeting point outside your home in case of a fire.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Substance Abuse Awareness (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Substance Abuse Awareness\n\nA **substance** is anything you put into your body that changes the way you feel, think, or behave. Some substances are legal (like medicine when used correctly), but many are dangerous and can damage your health, relationships, and future.\n\n### What Are Substances?\n\n| Substance | Legal or illegal? | Dangers |\n|-----------|-------------------|----------|\n| **Tobacco (cigarettes)** | Legal for adults (18+) | Causes cancer, lung disease, bad breath, yellow teeth |\n| **Alcohol (beer, wine, spirits)** | Legal for adults (18+) | Damages liver and brain, causes violence, leads to addiction |\n| **Dagga (marijuana/cannabis)** | Illegal in public | Damages brain development in children, affects memory and concentration |\n| **Tik (methamphetamine)** | Illegal | Highly addictive, destroys teeth, causes paranoia and violence |\n| **Nyaope/whoonga** | Illegal | Extremely addictive, causes weight loss, organ damage, and death |\n| **Glue/petrol sniffing** | Illegal for this purpose | Damages brain, lungs, kidneys, and liver; can cause sudden death |\n\n**Important:** ALL of these substances are dangerous for children. Even the ones that are legal for adults are ILLEGAL for anyone under 18.'),
  t(2, '### The Dangers of Tobacco\n\nTobacco contains over **7,000 chemicals**, and at least 70 of these cause cancer. When someone smokes, the smoke does not only harm them — it also harms everyone around them (this is called **passive smoking** or **secondhand smoke**).\n\n**Effects of smoking on the body:**\n- Lungs become damaged and cannot take in enough oxygen\n- Heart has to work harder, increasing the risk of heart attack\n- Teeth become yellow and breath smells bad\n- Skin ages faster and becomes wrinkled\n- You become addicted — nicotine makes it very hard to stop\n\n### The Dangers of Alcohol\n\nAlcohol is the most commonly abused substance in South Africa. It is involved in nearly half of all road accidents and many cases of violence.\n\n**Effects of alcohol:**\n- Slows down the brain — you cannot think clearly or make good decisions\n- Damages the liver — the organ that cleans your blood\n- Causes aggressive behaviour — many fights and domestic violence involve alcohol\n- Is addictive — people can become dependent on it\n- Damages brain development in children and teenagers'),
  q(3, 'Why is passive smoking (secondhand smoke) dangerous?',
    ['Because the smoke from someone else\'s cigarette contains the same harmful chemicals and can make non-smokers sick too', 'Because it makes your clothes smell bad', 'It is not actually dangerous — only the smoker is affected', 'Because it makes you addicted to smoking'], 0,
    'Passive smoking means breathing in someone else\'s cigarette smoke. This smoke contains the same harmful chemicals and can cause lung cancer, asthma, and other diseases in non-smokers, especially children.'),
  t(4, '### Saying No — Refusal Skills\n\nPeer pressure is when your friends or classmates try to get you to do something. Sometimes they might pressure you to try alcohol, cigarettes, or other substances. Knowing how to say NO is one of the most important skills you can learn.\n\n**Ways to say no:**\n- **Be direct:** "No thanks, I don\'t do that."\n- **Give a reason:** "No, I want to stay healthy for soccer."\n- **Suggest something else:** "Let\'s go play instead."\n- **The broken record:** Keep repeating "No" calmly, no matter what they say\n- **Walk away:** If they keep pressuring you, just leave\n- **Use humour:** "No way! I like my brain cells just the way they are!"\n\n**Remember:** A real friend will NEVER force you to do something dangerous. If someone keeps pressuring you after you say no, they are not a good friend.'),
  fb(5, 'When your friends try to get you to do something you do not want to do, this is called peer ___. If you keep repeating "No" calmly no matter what they say, this is called the ___ record technique.',
    ['pressure', 'broken'],
    'Peer pressure is the influence your peers have on your behaviour. The broken record technique means calmly repeating your refusal over and over until the other person gives up.'),
  q(6, 'Jabu\'s older cousin offers him a sip of beer at a family braai. Jabu does not want to drink it. What is the BEST thing for Jabu to say?',
    ['"No thanks, I do not drink alcohol — it is not good for me"', '"Okay, just one small sip will not hurt"', '"I will drink it later when nobody is watching"', '"Only if you promise not to tell my parents"'], 0,
    'Jabu should say no clearly and give a reason. One sip can lead to more, and alcohol is especially dangerous for children\'s developing brains. It is also illegal for children under 18 to drink alcohol.'),
  t(7, '### Where to Get Help\n\nIf you or someone you know is affected by substance abuse, there are people who can help.\n\n**Helplines:**\n- **Childline:** 116 (free, 24 hours)\n- **South African National Council on Alcoholism and Drug Dependence (SANCA):** 011 892 3829\n- **Drug helpline:** 0800 12 13 14 (free)\n- **Your school counsellor or teacher** — they can help in confidence\n\n**Signs that someone may have a substance abuse problem:**\n- Personality changes — becoming angry, secretive, or withdrawn\n- Dropping school marks\n- Losing interest in hobbies and activities they used to enjoy\n- Hanging out with a new group of friends\n- Stealing money\n- Bloodshot eyes or unusual smells\n\n**It is NOT your job to fix someone\'s substance abuse problem**, but you CAN tell a trusted adult who can get them help.'),
  fb(8, 'The free helpline number for children in South Africa is ___. Tobacco smoke contains over ___ chemicals.',
    ['116', '7,000'],
    'Childline (116) is free to call from any phone in South Africa. Tobacco smoke contains over 7,000 chemicals, at least 70 of which are known to cause cancer.'),
  q(9, 'Which of the following is TRUE about alcohol?',
    ['It damages brain development in children and teenagers and is involved in nearly half of all road accidents in SA', 'It is safe for children if they only drink a small amount', 'It only becomes dangerous after many years of drinking', 'It helps people make better decisions'], 0,
    'Alcohol is especially dangerous for children and teenagers because their brains are still developing. In South Africa, alcohol is involved in nearly half of all road accidents and many cases of violence.'),
  t(10, '### Summary: Substance Abuse Awareness\n\n**Key ideas from this chapter:**\n- Substances like tobacco, alcohol, and drugs are dangerous — especially for children\n- Tobacco causes cancer and passive smoking harms everyone nearby\n- Alcohol damages the brain and liver and is involved in violence and road accidents\n- Learn to say NO using refusal skills like the broken record technique\n- A real friend will never pressure you to use substances\n- Call Childline (116) for free, 24-hour support\n\n**Remember:** Saying NO to substances is one of the bravest and smartest things you can do!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Physical Education and Fitness (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Physical Education and Fitness\n\nExercise is one of the best things you can do for your body and mind. Regular physical activity helps you grow strong, stay healthy, and feel happy.\n\n### Benefits of Exercise\n\n| Benefit | How it helps |\n|---------|-------------|\n| **Strong bones and muscles** | Exercise makes your body stronger and helps you grow |\n| **Healthy heart** | Your heart is a muscle — exercise makes it stronger |\n| **Healthy weight** | Exercise burns energy and helps you stay fit |\n| **Better mood** | Exercise releases chemicals called endorphins that make you feel happy |\n| **Better sleep** | Active children sleep better at night |\n| **Better concentration** | Exercise helps your brain focus during lessons |\n| **Stress relief** | Physical activity helps you relax and let go of worries |\n\n**How much exercise do you need?**\nChildren should be active for at least **60 minutes every day**. This does not have to be all at once — you can spread it throughout the day.'),
  t(2, '### Warming Up and Cooling Down\n\nBefore you exercise, you must **warm up** your body. After exercise, you must **cool down**. This helps prevent injuries.\n\n**Warming up (5–10 minutes):**\nA warm-up gets your blood flowing and prepares your muscles for action.\n- Light jogging on the spot\n- Star jumps (jumping jacks)\n- Arm circles\n- High knees\n- Gentle stretching\n\n**Cooling down (5–10 minutes):**\nA cool-down helps your body return to normal gradually.\n- Slow walking\n- Deep breathing\n- Stretching your arms, legs, and back\n- Hold each stretch for 15–20 seconds — do not bounce!\n\n**Why is warming up important?**\nImagine pulling a cold rubber band quickly — it might snap! But if you warm it up first by stretching it gently, it becomes more flexible. Your muscles work the same way.'),
  q(3, 'Why is it important to warm up before exercising?',
    ['Because it prepares your muscles and helps prevent injuries', 'Because it makes the exercise easier so you do not have to work hard', 'Because the teacher said so', 'Because it counts as your whole exercise for the day'], 0,
    'Warming up increases blood flow to your muscles and makes them more flexible, which helps prevent injuries like muscle strains and pulls. Cold muscles are more likely to get hurt.'),
  t(4, '### Types of Exercise\n\nThere are different types of exercise, and each one is good for you in a different way.\n\n| Type | What it does | Examples |\n|------|-------------|----------|\n| **Cardio (aerobic)** | Strengthens heart and lungs | Running, swimming, cycling, dancing |\n| **Strength** | Builds muscles | Push-ups, sit-ups, climbing, carrying heavy objects |\n| **Flexibility** | Helps muscles stretch | Stretching, yoga, gymnastics |\n| **Balance** | Improves coordination | Standing on one leg, hopscotch, beam walking |\n| **Team sports** | All of the above + teamwork | Soccer, netball, cricket, rugby, volleyball |\n\n### Indigenous South African Games\n\nLong before modern sports, South African children played traditional games that kept them fit and active. These games are still fun today!\n\n- **Diketo (jacks)** — tossing and catching small stones or seeds; improves hand-eye coordination\n- **Drie stokkies (three sticks)** — a running and hiding game similar to capture the flag\n- **Kgati (skipping rope game)** — two people swing a rope while others jump in; great for cardio and rhythm\n- **Morabaraba** — a board game that exercises your mind (sometimes called "cow game")\n- **Jukskei** — a traditional Afrikaans game of throwing wooden pins at a stake; improves aim and strength'),
  fb(5, 'Children should be active for at least ___ minutes every day. Before exercising, you should ___ up to prepare your muscles.',
    ['60', 'warm'],
    'The recommended amount of physical activity for children is at least 60 minutes per day. Warming up before exercise prepares your muscles and helps prevent injuries.'),
  q(6, 'Which traditional South African game involves tossing and catching small stones and improves hand-eye coordination?',
    ['Diketo', 'Morabaraba', 'Jukskei', 'Drie stokkies'], 0,
    'Diketo (also known as jacks) is a traditional game where players toss and catch small stones or seeds. It is great for developing hand-eye coordination and fine motor skills.'),
  t(7, '### Sportsmanship and Fair Play\n\nBeing good at sport is not just about winning. It is also about how you behave — this is called **sportsmanship**.\n\n**Good sportsmanship means:**\n- Playing by the rules\n- Respecting the referee, coach, and other players\n- Congratulating the other team when they win\n- Not bragging when you win\n- Encouraging teammates instead of criticising them\n- Trying your best, whether you win or lose\n\n**The spirit of sport in South Africa:**\nSouth Africa has a proud sporting tradition. The 1995 Rugby World Cup, when the Springboks won with President Mandela wearing the number 6 jersey, showed the world that sport can unite a nation. Whether you play in a school team or just for fun, sport brings people together.'),
  q(8, 'After Nathi\'s soccer team loses a match, he shakes hands with the other team and says "Well played." What does this show?',
    ['Good sportsmanship because he is respectful even in defeat', 'That he does not care about winning', 'That his team did not try hard enough', 'That he wants to join the other team'], 0,
    'Shaking hands and congratulating the other team is an excellent example of good sportsmanship. It shows respect and maturity, whether you win or lose.'),
  fb(9, 'How you behave during and after sport is called ___. The traditional Afrikaans throwing game played with wooden pins is called ___.',
    ['sportsmanship', 'jukskei'],
    'Sportsmanship is about fair play, respect, and good behaviour in sport. Jukskei is a traditional Afrikaans game where players throw wooden pins at a stake — it has been played in South Africa for hundreds of years.'),
  t(10, '### Summary: Physical Education and Fitness\n\n**Key ideas from this chapter:**\n- Exercise makes your body and mind stronger — aim for 60 minutes a day\n- Always warm up before and cool down after exercise\n- There are different types of exercise: cardio, strength, flexibility, balance, and team sports\n- South Africa has a rich tradition of indigenous games like diketo, kgati, and jukskei\n- Good sportsmanship means playing fair, respecting others, and being gracious in both victory and defeat\n\n**Challenge:** Try one indigenous South African game this week! Teach it to a friend.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Rights and Responsibilities (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Rights and Responsibilities\n\nIn South Africa, every child has rights that are protected by the **Constitution** — the highest law in our country. These rights are listed in the **Bill of Rights** (Chapter 2 of the Constitution), and children have special rights under **Section 28**.\n\n### Children\'s Rights (Section 28)\n\nEvery child in South Africa has the right to:\n\n| Right | What it means |\n|-------|---------------|\n| **A name and nationality** | You have the right to be registered at birth and be a South African citizen |\n| **Family or parental care** | You have the right to be cared for by your family or guardian |\n| **Basic nutrition and shelter** | You have the right to food and a place to live |\n| **Basic health care** | You have the right to see a doctor or nurse when you are sick |\n| **Education** | You have the right to go to school |\n| **Protection from abuse and neglect** | No one may hurt you or fail to take care of you |\n| **Protection from child labour** | You should not be forced to do dangerous work |\n| **Not to be detained** | Children should not be kept in prison except as a last resort |\n\n**The best interest of the child** comes first in every matter concerning children. This means that adults must always think about what is best for you.'),
  t(2, '### Responsibilities That Go with Rights\n\nEvery right comes with a responsibility. If you want your rights to be respected, you must also respect the rights of others.\n\n| Your right | Your responsibility |\n|-----------|--------------------|\n| Education | Attend school, do your homework, respect your teachers |\n| A safe environment | Do not bully others, report unsafe situations |\n| Basic nutrition | Do not waste food, eat healthily |\n| Be heard | Listen to others and respect their opinions |\n| Health care | Take care of your body and health |\n| Protection | Report abuse — do not keep it a secret |\n\n**Example:** You have the right to education, which means you can go to school for free. But your responsibility is to attend school, pay attention in class, do your homework, and respect your teachers and classmates.\n\n**Think about it:** What would happen if everyone demanded their rights but nobody took responsibility? The system would break down. Rights and responsibilities work together like two sides of the same coin.'),
  q(3, 'Under Section 28 of the South African Constitution, every child has the right to basic nutrition, shelter, and health care. What responsibility goes with the right to education?',
    ['Attend school, do your homework, and respect your teachers', 'Demand that the school gives you everything for free', 'Only go to school when you feel like it', 'Let your parents do your homework for you'], 0,
    'The right to education comes with the responsibility to actually attend school, do your work, and show respect. Rights and responsibilities always go together.'),
  t(4, '### Ubuntu — I Am Because We Are\n\n**Ubuntu** is an African philosophy that is deeply important in South African culture. The word comes from the Nguni languages (isiZulu, isiXhosa, isiNdebele, siSwati) and means **"I am because we are."**\n\n**What ubuntu means in everyday life:**\n- Caring for your neighbours and community\n- Sharing what you have with others\n- Treating everyone with dignity and respect\n- Understanding that your actions affect other people\n- Working together instead of only thinking about yourself\n\n**Ubuntu in action:**\n- Helping a classmate who is struggling with their schoolwork\n- Sharing your lunch with a friend who has no food\n- Standing up for someone who is being bullied\n- Welcoming a new learner to your school\n- Cleaning up litter in your community, even if you did not drop it\n\n**Archbishop Desmond Tutu** explained ubuntu like this: "A person with ubuntu is welcoming, hospitable, warm and generous, willing to share. Such people are open and available to others, willing to be vulnerable, affirming of others."'),
  fb(5, 'Children\'s rights in South Africa are protected under Section ___ of the Constitution. The African philosophy that means "I am because we are" is called ___.',
    ['28', 'ubuntu'],
    'Section 28 of the South African Constitution specifically protects children\'s rights. Ubuntu is the African philosophy that teaches us we are all connected and should care for each other.'),
  q(6, 'Mandla sees a new boy sitting alone at break time. Nobody is talking to him. What would someone who practises ubuntu do?',
    ['Go over, introduce themselves, and invite the new boy to play', 'Ignore the new boy because he is not in Mandla\'s friend group', 'Tell the new boy to find his own friends', 'Wait for the teacher to introduce them'], 0,
    'Ubuntu means being welcoming and caring towards others. A person who practises ubuntu would not let someone sit alone — they would reach out and include them.'),
  t(7, '### Respecting Other People\'s Rights\n\nRespecting rights is not just about knowing your OWN rights — it also means respecting OTHER people\'s rights.\n\n**Examples of respecting others\' rights:**\n- **Right to dignity:** Do not tease, mock, or insult others\n- **Right to equality:** Treat everyone fairly, regardless of their race, gender, religion, or culture\n- **Right to privacy:** Do not go through other people\'s belongings without permission\n- **Right to a safe environment:** Do not bully, hit, or threaten others\n- **Right to education:** Do not disrupt the classroom so everyone can learn\n\n**South Africa\'s history** teaches us what happens when people\'s rights are NOT respected. During apartheid, millions of South Africans were denied basic rights because of the colour of their skin. We fought hard for our democracy and our Constitution. We must never take our rights for granted.'),
  q(8, 'Why is it important for Grade 5 learners to learn about rights and responsibilities?',
    ['Because understanding rights helps you protect yourself and respect others, which builds a fair society', 'Because you need to pass a test on it', 'Because only adults need to know about rights', 'Because rights are only important for some people'], 0,
    'Understanding your rights helps you protect yourself from harm, and understanding responsibilities helps you contribute to a fair and just society. Every person — including children — plays a role in upholding human rights.'),
  fb(9, 'Every right comes with a ___. During apartheid, millions of South Africans were denied their basic ___ because of the colour of their skin.',
    ['responsibility', 'rights'],
    'Rights and responsibilities always go together. Apartheid was a system of racial discrimination that denied the majority of South Africans their basic human rights. The new Constitution was written to make sure this never happens again.'),
  t(10, '### Summary: Rights and Responsibilities\n\n**Key ideas from this chapter:**\n- The South African Constitution protects every child\'s rights under Section 28\n- Children have the right to education, health care, safety, nutrition, and family care\n- Every right comes with a responsibility\n- Ubuntu teaches us to care for each other: "I am because we are"\n- We must respect other people\'s rights as well as our own\n- South Africa\'s history reminds us never to take our rights for granted\n\n**Activity:** Choose one right from Section 28 and make a poster showing the right and the responsibility that goes with it.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Environmental Care (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Environmental Care\n\nThe environment is everything around us — the air we breathe, the water we drink, the land we live on, and all the plants and animals. Taking care of the environment is not just something for adults — every Grade 5 learner can make a difference!\n\n### Why Should We Care for the Environment?\n\n- **Clean air** — we need it to breathe and stay healthy\n- **Clean water** — we need it to drink, cook, and grow food\n- **Healthy soil** — we need it to grow the crops that feed us\n- **Biodiversity** — plants and animals are important for balanced ecosystems\n- **Our future** — if we damage the environment now, life will be harder for future generations\n\n**South Africa\'s environmental challenges:**\n- Water shortages — South Africa is a water-scarce country\n- Air pollution from factories and vehicles\n- Litter and illegal dumping\n- Deforestation — cutting down trees\n- Soil erosion\n- Climate change — leading to droughts and extreme weather'),
  t(2, '### Reducing Waste — The 3 R\'s\n\nEvery day, South Africans produce mountains of waste. Much of this waste ends up in landfill sites, rivers, and oceans, harming the environment and wildlife.\n\nThe **3 R\'s** help us reduce waste:\n\n**1. Reduce** — Use less in the first place\n- Bring a reusable water bottle instead of buying plastic bottles\n- Use both sides of your paper at school\n- Turn off lights and taps when not in use\n\n**2. Reuse** — Use items again instead of throwing them away\n- Use old newspapers for art projects\n- Turn old containers into plant pots\n- Give clothes you have outgrown to someone who needs them\n\n**3. Recycle** — Turn old materials into new products\n- Paper, cardboard, glass, tin cans, and some plastics can be recycled\n- Look for recycling bins at school and in your community\n- Many South Africans earn a living by collecting recyclable materials\n\n**Did you know?** In South Africa, about 90% of waste goes to landfill sites. If we all recycled more, we could reduce this significantly.'),
  q(3, 'What does it mean to "reduce" waste?',
    ['Use less in the first place, for example by bringing a reusable water bottle instead of buying plastic ones', 'Put waste in the correct bin', 'Burn waste instead of throwing it away', 'Hide waste so no one can see it'], 0,
    'Reducing waste means using less in the first place. This is the most effective of the 3 R\'s because it prevents waste from being created at all. Reusable items like water bottles and shopping bags are great examples.'),
  t(4, '### Saving Water\n\nSouth Africa is one of the **30 driest countries in the world**. Water is precious and we must use it wisely. Cape Town nearly ran out of water in 2018 — this event was called **"Day Zero"** and it showed how important water conservation is.\n\n**Ways to save water at home and school:**\n- Take short showers (2 minutes) instead of baths\n- Turn off the tap while brushing your teeth\n- Fix leaking taps — a dripping tap wastes up to 30 litres a day!\n- Use a bucket to wash the car, not a hosepipe\n- Water the garden in the early morning or evening when it is cooler\n- Collect rainwater in tanks for watering plants\n- Report burst pipes to your municipality\n\n### Saving Electricity\n\nSouth Africa often experiences **load shedding** because we do not produce enough electricity. Saving electricity helps reduce load shedding and protects the environment (most of our electricity comes from burning coal, which causes air pollution).\n\n**Ways to save electricity:**\n- Switch off lights when you leave a room\n- Unplug chargers and appliances when not in use\n- Use energy-saving light bulbs\n- Open curtains during the day instead of switching on lights\n- Do not leave the fridge door open'),
  fb(5, 'South Africa is one of the ___ driest countries in the world. A dripping tap can waste up to ___ litres of water a day.',
    ['30', '30'],
    'South Africa is water-scarce, ranking among the 30 driest countries globally. Even a small drip from a leaking tap can waste up to 30 litres of water per day — that adds up to thousands of litres per year!'),
  t(6, '### Indigenous Trees and Plants of South Africa\n\nSouth Africa is home to an incredible variety of plants and trees. Many of them are found nowhere else on Earth!\n\n**Important indigenous plants:**\n\n| Plant | Interesting fact |\n|-------|------------------|\n| **Baobab tree** | Can live for over 1,000 years; stores water in its trunk |\n| **Yellowwood (Podocarpus)** | South Africa\'s national tree |\n| **Protea** | South Africa\'s national flower |\n| **Rooibos** | Only grows in the Cederberg mountains of the Western Cape |\n| **Aloe** | Used for medicine and skin care; over 130 species in SA |\n| **Strelitzia (Bird of Paradise)** | Beautiful orange and blue flower found in the Eastern Cape |\n| **Spekboom** | Called a "miracle plant" because it absorbs huge amounts of carbon dioxide |\n\n**Spekboom** is especially important for fighting climate change. One hectare of spekboom can absorb the same amount of carbon dioxide as 40 hectares of regular forest! Many schools in South Africa have started growing spekboom in their gardens.'),
  q(7, 'Which South African plant is called a "miracle plant" because it absorbs huge amounts of carbon dioxide?',
    ['Spekboom', 'Rooibos', 'Aloe', 'Baobab'], 0,
    'Spekboom is called a "miracle plant" because it is incredibly efficient at absorbing carbon dioxide from the atmosphere. One hectare of spekboom absorbs as much CO₂ as 40 hectares of regular forest.'),
  q(8, 'What happened in Cape Town in 2018 that showed South Africans the importance of saving water?',
    ['The city nearly ran out of water in an event called "Day Zero"', 'A flood destroyed the water treatment plant', 'The government banned all water usage', 'A new dam was built that solved all water problems'], 0,
    'In 2018, Cape Town came very close to "Day Zero" — the day the taps would run dry. Residents had to limit their water use to 50 litres per person per day. It showed the whole country how important water conservation is.'),
  fb(9, 'South Africa\'s national tree is the ___ and the national flower is the ___.',
    ['yellowwood', 'protea'],
    'The yellowwood (Podocarpus) is South Africa\'s national tree, and the protea is the national flower. The protea also features on the Springbok rugby jersey and South African coins.'),
  t(10, '### Summary: Environmental Care\n\n**Key ideas from this chapter:**\n- The environment provides everything we need — air, water, food, and shelter\n- Reduce, Reuse, Recycle — the 3 R\'s help us cut down on waste\n- South Africa is water-scarce — save water by fixing leaks and taking short showers\n- Save electricity to reduce load shedding and protect the environment\n- South Africa has amazing indigenous plants like the spekboom, yellowwood, and protea\n- Every person can make a difference — even small actions add up\n\n**Challenge:** Plant a spekboom or start a recycling project at your school!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Dealing with Bullying (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Dealing with Bullying\n\nBullying is when someone repeatedly hurts, scares, or upsets another person on purpose. It is NOT just "kids being kids" or "part of growing up" — bullying is WRONG and nobody deserves to be bullied.\n\n### Types of Bullying\n\n| Type | Examples |\n|------|----------|\n| **Physical bullying** | Hitting, kicking, pushing, tripping, taking someone\'s belongings |\n| **Verbal bullying** | Name-calling, teasing, insulting, threatening |\n| **Social bullying** | Leaving someone out on purpose, spreading rumours, embarrassing someone in front of others |\n| **Cyberbullying** | Sending mean messages online, posting hurtful photos or comments on social media, creating fake profiles |\n\n**Important:** Bullying is different from a once-off disagreement or argument between friends. Bullying is **repeated** behaviour that happens **on purpose** to hurt someone who finds it hard to defend themselves.'),
  t(2, '### The Effects of Bullying\n\nBullying can have serious effects on the person being bullied, the bully, and the people who witness it.\n\n**Effects on the person being bullied:**\n- Feeling sad, scared, lonely, or angry\n- Not wanting to go to school\n- Difficulty concentrating in class\n- Trouble sleeping or nightmares\n- Stomachaches and headaches\n- Low self-esteem and self-confidence\n- In serious cases, depression and thoughts of self-harm\n\n**Effects on the bully:**\n- More likely to get into trouble with the law later in life\n- Difficulty forming healthy relationships\n- May not learn empathy and kindness\n\n**Effects on bystanders (people who see bullying happen):**\n- Feeling guilty for not helping\n- Feeling scared that they might be next\n- Feeling helpless\n\n**Remember:** Bullying affects EVERYONE — not just the person being bullied. That is why it is everyone\'s responsibility to stop it.'),
  q(3, 'Lindiwe\'s classmates keep leaving her out of games at break time. They whisper about her and laugh when she walks past. What type of bullying is this?',
    ['Social bullying — deliberately excluding someone, spreading rumours, and embarrassing them', 'Physical bullying — because it hurts her feelings', 'This is not bullying — it is just normal friendship behaviour', 'Cyberbullying — because they are talking behind her back'], 0,
    'This is social bullying (also called relational bullying). Deliberately excluding someone, whispering about them, and laughing at them is a form of bullying that can be just as harmful as physical bullying.'),
  t(4, '### What to Do If You Are Being Bullied\n\nIf you are being bullied, remember: **it is NOT your fault.** You do not deserve to be treated this way, and there are things you can do.\n\n**Steps to take:**\n1. **Tell a trusted adult** — a parent, teacher, school counsellor, or other adult you trust. This is NOT tattling — it is asking for help\n2. **Stay calm** — bullies often want to see you get upset. Try to stay calm and walk away\n3. **Stay with friends** — there is safety in numbers\n4. **Keep evidence** — if you are being cyberbullied, take screenshots of the messages\n5. **Do not fight back** — hitting back usually makes the situation worse\n6. **Call for help** — Childline (116) is free and available 24/7\n\n**Remember:** Telling an adult about bullying is BRAVE, not weak. You are not only helping yourself — you might be helping other children who are being bullied too.'),
  fb(5, 'When someone repeatedly hurts, scares, or upsets another person on purpose, this is called ___. If you are being cyberbullied, you should take ___ of the messages as evidence.',
    ['bullying', 'screenshots'],
    'Bullying is repeated harmful behaviour done on purpose. If you experience cyberbullying, saving screenshots of messages, posts, or comments provides evidence that adults can use to help stop the bullying.'),
  t(6, '### Being an Upstander, Not a Bystander\n\nA **bystander** is someone who sees bullying happen but does nothing. An **upstander** is someone who takes action to stop bullying or help the person being bullied.\n\n**How to be an upstander:**\n- **Speak up** — tell the bully to stop (only if it is safe to do so)\n- **Support the person** — sit with them, include them, and let them know they are not alone\n- **Report it** — tell a teacher or trusted adult what you saw\n- **Do not join in** — never laugh at or encourage bullying, even if others are doing it\n- **Be a friend** — sometimes just being kind to someone who is being bullied makes a huge difference\n\n**The power of upstanders:**\nResearch shows that when a bystander speaks up, bullying stops within 10 seconds about 57% of the time. Your voice has power — use it!\n\n**In South Africa**, many organisations work to stop bullying, including the Department of Education\'s anti-bullying campaigns and Childline.'),
  q(7, 'What is the difference between a bystander and an upstander?',
    ['A bystander sees bullying and does nothing, while an upstander takes action to help stop it', 'A bystander helps the victim, while an upstander reports to the police', 'There is no difference — both words mean the same thing', 'A bystander is the victim, and an upstander is the bully'], 0,
    'A bystander watches bullying happen without acting. An upstander takes positive action — speaking up, supporting the victim, or reporting to an adult. Research shows that upstanders can stop bullying quickly.'),
  q(8, 'Why is cyberbullying particularly harmful?',
    ['Because it can happen 24/7, reach a large audience, and the messages stay online permanently', 'Because it only happens at school', 'Because it is less serious than physical bullying', 'Because adults cannot see cyberbullying'], 0,
    'Cyberbullying is especially harmful because it does not stop when you leave school — it follows you home. Hurtful messages can be seen by many people and are difficult to delete permanently.'),
  fb(9, 'Research shows that when a ___ speaks up, bullying stops within 10 seconds about 57% of the time. The free helpline for children in SA is ___.',
    ['bystander', '116'],
    'When bystanders become upstanders and speak up, bullying stops quickly in most cases. Childline (116) is available 24/7 and free from any phone in South Africa.'),
  t(10, '### Summary: Dealing with Bullying\n\n**Key ideas from this chapter:**\n- Bullying is repeated, purposeful behaviour that hurts others — it is NEVER okay\n- There are four types: physical, verbal, social, and cyberbullying\n- Bullying affects everyone — the victim, the bully, and the bystanders\n- If you are being bullied, tell a trusted adult — this is brave, not weak\n- Be an upstander, not a bystander — your voice can stop bullying\n- Childline (116) is free, confidential, and available 24/7\n\n**Pledge:** "I will not bully others. I will not stand by while others are bullied. I will be an upstander."'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Money Matters (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Money Matters\n\nMoney is an important part of everyday life. Understanding how money works — how to earn it, save it, and spend it wisely — is a skill that will help you your whole life.\n\n### Needs vs Wants\n\nThe first step to being smart with money is understanding the difference between **needs** and **wants**.\n\n| Needs | Wants |\n|-------|-------|\n| Things you MUST have to survive and be healthy | Things you would LIKE to have but can live without |\n| Food, water, shelter, clothing, medicine | Sweets, toys, video games, designer clothing |\n| School fees, textbooks, uniform | Latest phone, expensive sneakers |\n| Electricity for cooking and studying | New bicycle, holiday |\n\n**Remember:** Needs must be paid for FIRST. Only after your needs are met should you spend money on wants.\n\n**Example:** Thabo receives R100 from his grandmother. He needs a new school pen (R15) and wants a bag of chips (R20). He should buy the pen first because it is a need. The chips are a want — he can buy them with leftover money or skip them and save instead.'),
  t(2, '### Saving Money\n\nSaving means putting money aside for later instead of spending it all at once. Saving is one of the smartest money habits you can develop.\n\n**Why save?**\n- For something special — like a birthday present for your mom\n- For emergencies — in case something unexpected happens\n- For the future — school trips, high school supplies, or even university one day\n\n**Tips for saving:**\n- Use a piggy bank, jar, or savings box at home\n- Set a goal — "I want to save R200 for a new book bag"\n- Save a portion of any money you receive — even R5 or R10 adds up!\n- Avoid impulse buying — before buying something, wait a day and ask "Do I really need this?"\n\n**The power of saving:**\nIf you save just R5 every school day, after one year you will have about **R1,000**! That is the power of small, regular savings.\n\n**Did you know?** In South Africa, banks like FNB, Standard Bank, and Capitec offer savings accounts for children. Some even give you a free debit card. Ask your parents about opening one!'),
  q(3, 'Amahle receives R50 pocket money each week. She wants to buy a book that costs R200. How many weeks does she need to save ALL her pocket money?',
    ['4 weeks', '2 weeks', '5 weeks', '10 weeks'], 0,
    'R200 ÷ R50 = 4 weeks. If Amahle saves all her pocket money each week, she will have enough after 4 weeks. In real life, she might also spend some on needs, so it could take longer.'),
  t(4, '### Making a Simple Budget\n\nA **budget** is a plan for how you will spend and save your money. Even Grade 5 learners can make a simple budget!\n\n**Buhle\'s weekly budget:**\n| Item | Amount |\n|------|--------|\n| **Pocket money received** | R40 |\n| **School snack (need)** | -R10 |\n| **Savings (save)** | -R10 |\n| **Available for wants** | R20 |\n\nBuhle puts her needs first (school snack), then saves R10, and has R20 left for wants. This is a smart way to manage money!\n\n**Steps to make your own budget:**\n1. Write down how much money you receive (pocket money, gifts, etc.)\n2. List your needs and how much they cost\n3. Decide how much you want to save\n4. Whatever is left can be spent on wants\n\n**The golden rule:** Never spend more than you receive!'),
  fb(5, 'Things you must have to survive are called ___. Things you would like but can live without are called ___.',
    ['needs', 'wants'],
    'Needs are essentials for survival and well-being — food, water, shelter, and clothing. Wants are things that would be nice to have but are not necessary. Always pay for needs first!'),
  t(6, '### Earning Money and the Value of Money\n\nMoney does not grow on trees! It takes hard work to earn money. Understanding this helps you appreciate and respect money more.\n\n**Ways children can earn money (age-appropriate):**\n- Doing extra chores at home (washing the car, gardening, sweeping)\n- Helping a neighbour with their garden or groceries\n- Selling homemade crafts, baked goods, or art\n- Helping at a family business (e.g., a fruit stall or spaza shop)\n\n**Understanding the value of money:**\nImagine your parent works at a shop and earns R30 per hour. If you ask for R60 to buy a toy, that means your parent had to work for 2 hours to earn that money. Understanding this helps you think twice before spending carelessly.\n\n**Entrepreneurship in South Africa:**\nMany successful South African businesses started small. **Nando\'s** started as a small restaurant in Johannesburg. **Capitec Bank** started with just a few branches. Even children can be entrepreneurs — think about what skills or products you could offer!'),
  q(7, 'If Zinhle\'s mother earns R40 per hour and Zinhle asks for R120 to buy new earphones, how many hours did her mother have to work to earn that money?',
    ['3 hours', '2 hours', '4 hours', '1 hour'], 0,
    'R120 ÷ R40 = 3 hours. Understanding how long someone has to work to earn money helps you respect the value of money and think carefully before spending.'),
  t(8, '### Advertising Awareness\n\n**Advertising** is how companies try to get you to buy their products. Adverts are everywhere — on TV, the internet, billboards, and social media. Learning to think critically about adverts helps you make smarter spending decisions.\n\n**Common advertising tricks:**\n- **Celebrity endorsement** — a famous person uses the product, so you think you should too\n- **"Limited time offer"** — creates urgency so you buy without thinking\n- **"Buy one, get one free"** — you might not have needed the first one!\n- **Bright colours and catchy music** — makes the product seem more exciting\n- **Targeting children** — using cartoons, toys, and fun characters\n\n**How to be a smart consumer:**\n- Ask: "Do I NEED this or do I just WANT it?"\n- Ask: "Am I buying this because I want it or because the advert made me want it?"\n- Compare prices before buying\n- Read reviews and ask others for their opinions\n- Wait before buying — if you still want it after a week, it might be worth it'),
  q(9, 'A TV advert shows a famous soccer player drinking a certain energy drink. The advert makes it seem like drinking it will make you a better player. What advertising trick is being used?',
    ['Celebrity endorsement — using a famous person to make you want the product', 'A limited time offer', 'Buy one get one free', 'Factual information about the product'], 0,
    'Celebrity endorsement is when a famous person promotes a product. The advert makes you think that if you use the same product, you will be like them. This is a trick — drinking an energy drink will not make you a better soccer player!'),
  t(10, '### Summary: Money Matters\n\n**Key ideas from this chapter:**\n- Know the difference between needs (essentials) and wants (extras)\n- Save regularly — even small amounts add up over time\n- Make a simple budget: needs first, then savings, then wants\n- Money takes hard work to earn — respect its value\n- Be aware of advertising tricks that try to make you spend money\n- You can be an entrepreneur — think about what you could create or sell\n\n**Challenge:** Make a weekly budget for your pocket money. Track your spending for one week and see where your money goes!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Planning for the Future (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Planning for the Future\n\nIt is never too early to start thinking about your future! As a Grade 5 learner, you have your whole life ahead of you. By setting goals, learning about different careers, and working hard, you can build the future you dream of.\n\n### Setting Goals\n\nA **goal** is something you want to achieve. Goals give you direction and motivation. They can be short-term or long-term.\n\n| Type | Time frame | Examples |\n|------|-----------|----------|\n| **Short-term** | Days to weeks | Finish my homework on time this week, learn 10 new spelling words |\n| **Medium-term** | Months | Pass my Grade 5 exams, save R100 by December |\n| **Long-term** | Years | Go to university, become a doctor, open my own business |\n\n**Tips for setting good goals:**\n- **Be specific** — "I want to improve my maths mark" is better than "I want to do better at school"\n- **Write it down** — you are more likely to achieve a goal if you write it down\n- **Make it achievable** — start with small goals and build up\n- **Set a deadline** — "by the end of Term 2" gives you something to work towards\n- **Tell someone** — share your goal with a parent, teacher, or friend who can encourage you'),
  t(2, '### Different Careers\n\nThere are thousands of different careers you could choose one day. Here are some career areas and what they involve:\n\n| Career area | Examples | Subjects that help |\n|------------|---------|-------------------|\n| **Health care** | Doctor, nurse, dentist, paramedic | Maths, Natural Sciences, Life Sciences |\n| **Education** | Teacher, lecturer, school principal | Any subject you love + Education studies |\n| **Technology** | Software developer, IT specialist, engineer | Maths, Technology, Computer skills |\n| **Business** | Accountant, manager, entrepreneur | Maths, Economics, Business Studies |\n| **Creative arts** | Artist, musician, actor, designer | Creative Arts, Languages |\n| **Trades** | Electrician, plumber, mechanic, builder | Maths, Technology |\n| **Law and safety** | Lawyer, police officer, firefighter | Languages, Social Sciences |\n| **Sport** | Professional athlete, coach, sports scientist | Life Skills, Physical Education |\n| **Agriculture** | Farmer, veterinarian, conservationist | Natural Sciences, Geography |\n\n**Did you know?** South Africa needs more people in STEM careers (Science, Technology, Engineering, and Mathematics). These careers often offer good salaries and many job opportunities.'),
  q(3, 'Khanyi loves animals and wants to help them when she grows up. Which career would be the best fit for her?',
    ['Veterinarian — an animal doctor', 'Accountant — someone who works with money', 'Lawyer — someone who works with the law', 'Software developer — someone who creates computer programs'], 0,
    'A veterinarian (animal doctor) is the best career fit for someone who loves animals. To become a vet, Khanyi should focus on subjects like Natural Sciences and Mathematics.'),
  t(4, '### Skills Needed for Jobs\n\nNo matter what career you choose, there are certain skills that employers value highly. You can start developing these skills right now, as a Grade 5 learner!\n\n**Important skills for the workplace:**\n\n| Skill | What it means | How to develop it now |\n|-------|--------------|----------------------|\n| **Communication** | Expressing your ideas clearly | Practise reading, writing, and speaking in class |\n| **Teamwork** | Working well with others | Group projects, team sports, helping classmates |\n| **Problem-solving** | Finding solutions to challenges | Maths problems, puzzles, brainstorming |\n| **Creativity** | Thinking of new ideas | Art, writing stories, finding new ways to do things |\n| **Responsibility** | Being reliable and doing what you promise | Doing homework on time, completing chores |\n| **Digital literacy** | Using technology safely and effectively | Computer classes, responsible internet use |\n| **Resilience** | Not giving up when things are hard | Trying again after making mistakes |'),
  fb(5, 'A ___ is something you want to achieve. Writing your goals down makes you more likely to ___ them.',
    ['goal', 'achieve'],
    'Setting clear goals gives you direction and purpose. Research shows that people who write their goals down are significantly more likely to achieve them than those who only think about their goals.'),
  t(6, '### Dreaming Big — Role Models in South Africa\n\nSouth Africa is full of people who dreamed big and achieved incredible things. Their stories can inspire you to aim high!\n\n**Inspiring South Africans:**\n\n- **Nelson Mandela** — Fought for freedom and became South Africa\'s first democratic president. He spent 27 years in prison but never gave up on his dream of a free South Africa.\n\n- **Siya Kolisi** — Grew up in poverty in the Eastern Cape but became the first Black captain of the Springboks and led them to win the Rugby World Cup in 2019 AND 2023.\n\n- **Dr Precious Moloi-Motsepe** — Doctor, fashion entrepreneur, and philanthropist who uses her success to help others.\n\n- **Elon Musk** — Born in Pretoria, he went on to create SpaceX, Tesla, and other groundbreaking companies.\n\n- **Zozibini Tunzi** — From the Eastern Cape, she became Miss Universe 2019 and is an advocate for women\'s rights and natural beauty.\n\n- **Patrice Motsepe** — Started with nothing and became one of Africa\'s wealthiest people through mining and business.\n\n**What do all these people have in common?** They set goals, worked hard, faced challenges, and NEVER gave up.'),
  q(7, 'What do Siya Kolisi, Nelson Mandela, and Zozibini Tunzi have in common?',
    ['They all faced challenges but worked hard and never gave up on their dreams', 'They all went to the same school', 'They all became president of South Africa', 'They all won the Nobel Peace Prize'], 0,
    'All of these role models faced significant challenges in their lives but persevered through hard work, determination, and belief in their goals. This teaches us that success is possible no matter where you come from.'),
  t(8, '### What Subjects Help with Careers?\n\nThe subjects you study at school are the foundation for your future career. Even in Grade 5, the work you do matters!\n\n**How school subjects connect to careers:**\n- **Mathematics** — almost every career uses maths in some way (doctors, engineers, shopkeepers, farmers)\n- **Languages** — communication is important in every job. The better you read and write, the more opportunities you will have\n- **Natural Sciences** — essential for health care, technology, agriculture, and environmental careers\n- **Social Sciences** — helps you understand people, history, and the world (law, journalism, social work)\n- **Technology** — the world is becoming more digital every day. Technology skills are needed in almost every field\n- **Life Skills** — teaches you about yourself, relationships, and the world around you\n- **Creative Arts** — develops your creativity, which is valued in advertising, design, film, and many other careers\n\n**Remember:** There is no such thing as a "useless" subject. Every subject teaches you skills that can be used in your career and life.'),
  q(9, 'Why is it important to work hard at ALL your school subjects, even the ones you do not enjoy?',
    ['Because every subject teaches skills that can help you in future careers and in life', 'Because you will get punished if you do not', 'Because all subjects are equally easy', 'Because you must be the top learner in your class'], 0,
    'Every subject develops different skills — maths develops problem-solving, languages develop communication, and so on. Even subjects you find difficult now might become important for your career later. Working hard in all subjects keeps your options open.'),
  fb(10, 'South Africa needs more people in ___ careers (Science, Technology, Engineering, and Mathematics). The first Black captain of the Springboks was ___.',
    ['STEM', 'Siya Kolisi'],
    'STEM stands for Science, Technology, Engineering, and Mathematics. These fields offer many job opportunities in South Africa. Siya Kolisi made history as the first Black Springbok captain and inspired millions.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create Grade 5
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 5/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 5:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 5', schoolId: SCHOOL_ID, orderIndex: 5,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 5:', String(GRADE_ID));
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
    tags: ['grade-5', 'life-orientation', 'caps'],
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
      title: 'Chapter 1: Positive Self-Concept',
      description: 'Self-awareness, strengths and weaknesses, positive self-talk, self-confidence, celebrating achievements, and being unique in the Rainbow Nation.',
      order: 1,
      lessons: [
        { title: 'Positive Self-Concept', description: 'Understanding self-concept, identifying strengths and weaknesses, practising positive self-talk, building self-confidence, celebrating achievements, and appreciating your unique qualities.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Relationships',
      description: 'Healthy friendships, family relationships, respecting differences, dealing with conflict, communication skills, forgiveness, and ubuntu.',
      order: 2,
      lessons: [
        { title: 'Relationships', description: 'Types of relationships, healthy vs unhealthy friendships, resolving conflict using "I" statements, good communication skills, respecting cultural differences, and the philosophy of ubuntu.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Healthy Eating',
      description: 'Food groups, balanced meals, reading food labels, South African traditional foods, dangers of junk food, and the importance of water intake.',
      order: 3,
      lessons: [
        { title: 'Healthy Eating', description: 'The five food groups with SA examples, balanced meals using traditional foods, reading food labels for sugar and salt, dangers of junk food and fizzy drinks, and drinking 6-8 glasses of water daily.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Personal Hygiene',
      description: 'Body hygiene, dental care, proper hand washing, caring for your body during puberty, and keeping your environment clean.',
      order: 4,
      lessons: [
        { title: 'Personal Hygiene', description: 'Daily hygiene habits, the five steps of hand washing, dental care basics, age-appropriate puberty education, body odour management, and hygiene for a changing body.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Safety at Home and School',
      description: 'Fire safety, electricity safety, poison safety, road safety rules, stranger danger, and emergency numbers in South Africa.',
      order: 5,
      lessons: [
        { title: 'Safety at Home and School', description: 'Fire prevention and Stop Drop Roll, electricity safety rules, poison safety, road safety (Stop Look Listen), stranger danger rules, and SA emergency numbers (10111, 10177, 116).', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Substance Abuse Awareness',
      description: 'Types of substances, dangers of tobacco and alcohol, saying no to peer pressure, refusal skills, and where to get help.',
      order: 6,
      lessons: [
        { title: 'Substance Abuse Awareness', description: 'What substances are, dangers of tobacco (passive smoking), alcohol, dagga, tik, and nyaope, refusal skills including the broken record technique, peer influence, and helplines (Childline 116).', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Physical Education and Fitness',
      description: 'Exercise benefits, warming up and cooling down, types of exercise, indigenous South African games, and sportsmanship.',
      order: 7,
      lessons: [
        { title: 'Physical Education and Fitness', description: 'Benefits of exercise, warming up and cooling down, cardio, strength, flexibility, and balance exercises, indigenous SA games (diketo, kgati, jukskei), and sportsmanship.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Rights and Responsibilities',
      description: 'Children\'s rights in the SA Constitution (Section 28), responsibilities, respecting others\' rights, and the philosophy of ubuntu.',
      order: 8,
      lessons: [
        { title: 'Rights and Responsibilities', description: 'Section 28 children\'s rights, matching rights with responsibilities, ubuntu philosophy, respecting others\' rights, and lessons from South Africa\'s apartheid history.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Environmental Care',
      description: 'Caring for the environment, the 3 R\'s (Reduce, Reuse, Recycle), saving water and electricity, and indigenous trees and plants of South Africa.',
      order: 9,
      lessons: [
        { title: 'Environmental Care', description: 'Environmental challenges in SA, the 3 R\'s, saving water (Day Zero), saving electricity (load shedding), indigenous plants (spekboom, yellowwood, protea), and what learners can do.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Dealing with Bullying',
      description: 'Types of bullying (physical, verbal, social, cyberbullying), effects of bullying, what to do if bullied, being an upstander, and reporting.',
      order: 10,
      lessons: [
        { title: 'Dealing with Bullying', description: 'Four types of bullying, effects on victims, bullies, and bystanders, steps to take if bullied, being an upstander vs bystander, and Childline (116).', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Money Matters',
      description: 'Needs vs wants, saving money, making a simple budget, earning money, the value of money, and advertising awareness.',
      order: 11,
      lessons: [
        { title: 'Money Matters', description: 'Distinguishing needs from wants, saving tips, making a simple weekly budget, understanding the value of money, entrepreneurship in SA, and recognising advertising tricks.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Planning for the Future',
      description: 'Setting goals, different careers, skills needed for jobs, dreaming big, school subjects and career paths, and role models in South Africa.',
      order: 12,
      lessons: [
        { title: 'Planning for the Future', description: 'Setting short-term and long-term goals, career areas and subjects that help, workplace skills to develop now, STEM careers, SA role models (Mandela, Kolisi, Tunzi), and dreaming big.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 5 Life Orientation \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Positive Self-Concept, Relationships, Healthy Eating, Personal Hygiene, Safety at Home and School, Substance Abuse Awareness, Physical Education and Fitness, Rights and Responsibilities, Environmental Care, Dealing with Bullying, Money Matters, and Planning for the Future for the Grade 5 Life Orientation curriculum.',
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
  console.log('  TEXTBOOK: Grade 5 Life Orientation');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
