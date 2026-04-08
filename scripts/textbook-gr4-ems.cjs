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
// CHAPTER 1: Things We Need and Want (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Things We Need and Want ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Things We Need and Want\n\nEvery day you use many different things. You eat food, drink water, wear clothes, and sleep in a bed. You also play with toys, eat sweets, and watch TV. But some of these things are much more important than others!\n\nIn this lesson we will learn about **needs** and **wants**.\n\n### What Are Needs?\n\n**Needs** are things you MUST have to stay alive and be healthy. If you do not have your needs, you can get very sick.\n\nHere are the four basic needs:\n\n| Need | Why You Need It | Example |\n|------|----------------|--------|\n| **Food and water** | To give your body energy and keep you strong | Pap, bread, fruit, clean water |\n| **Shelter** | A safe place to live, away from rain and cold | A house, a flat, a room |\n| **Clothes** | To keep your body warm and protected | School uniform, warm jacket |\n| **Health care** | To get help when you are sick | Going to the clinic, taking medicine |\n\nThink about it: without food, your tummy hurts and you feel weak. Without shelter, you get cold and wet in the rain. These are things nobody can live without.'),
  t(2, '### What Are Wants?\n\n**Wants** are things you would LIKE to have, but you do not NEED them to stay alive. Wants are nice to have, but you will be okay without them.\n\n**Examples of wants:**\n- A packet of chips from the tuck shop\n- A new toy car or doll\n- Sweets and cool drinks\n- A bicycle\n- A trip to the zoo\n\n### How Do I Know If Something Is a Need or a Want?\n\nAsk yourself: **"Can I live without this?"**\n\n- If you say **NO** — it is a **need**.\n- If you say **YES** — it is a **want**.\n\nLook at these examples:\n\n| Item | Need or Want? | Why? |\n|------|-------------|------|\n| A glass of clean water | Need | You must drink water every day |\n| A can of Fanta | Want | It is tasty, but water is what you need |\n| A warm jersey in winter | Need | You need warmth to stay healthy |\n| A fancy pair of sneakers | Want | Plain shoes keep your feet safe too |\n| Rice and chicken for supper | Need | Your body needs food to grow |\n| A chocolate bar | Want | It is yummy, but you can live without it |'),
  q(3, 'Which of these is a NEED?',
    ['Clean water to drink', 'A new toy car', 'A packet of sweets', 'A trip to the zoo'], 0,
    'Clean water is something you must have every day to stay alive. The other things are wants — nice to have, but not needed to survive.'),
  fb(4, 'Things you must have to stay alive are called ___. Things that are nice to have but not needed are called ___.',
    ['needs', 'wants'],
    'Needs keep you alive and healthy (food, water, shelter, clothes). Wants are extras that make life fun but are not essential.'),
  t(5, '### We Cannot Have Everything\n\nHave you ever been in a shop and wanted to buy lots of things? Maybe you wanted chips AND sweets AND a cool drink AND a toy. But your mom or dad said: "You can only choose ONE thing."\n\nThis happens because money does not last forever. There is only a certain amount of money to spend.\n\nOur wants are **many** — we always want more and more!\nBut our money is **limited** — it runs out.\n\nSo we must **choose**. And the smart choice is: **needs first, wants second**.\n\n**Example:**\nNomsa has R20. She needs a new pencil for school (R10) and she wants a lollipop (R5). What should she buy first?\n\nShe should buy the pencil first, because she needs it for school. Then, if she has money left over, she can buy the lollipop.\n\nNomsa made a **good choice** — she put her need before her want!'),
  q(6, 'Sipho has R15. He needs an eraser for school (R8) and wants a packet of chips (R10). Which should he buy first?',
    ['The eraser, because it is a need', 'The chips, because they taste nice', 'Both of them at the same time', 'Neither — he should keep the money'], 0,
    'The eraser is a need for school, so Sipho should buy it first. The chips are a want. After buying the eraser he will have R7 left, which is not enough for the chips, so he made the right choice by putting needs first.'),
  fb(7, 'Our wants are many, but our ___ is limited. We should always buy ___ before wants.',
    ['money', 'needs'],
    'We always want more things, but we only have a limited amount of money. The smart rule is: needs first, wants second.'),
  q(8, 'Which list shows ONLY needs?',
    ['Food, water, shelter, clothes', 'Toys, sweets, games, cool drinks', 'Water, bicycle, shelter, chips', 'Clothes, chocolate, food, dolls'], 0,
    'Food, water, shelter, and clothes are all things you must have to survive. The other lists mix needs and wants together.'),
  t(9, '### Summary\n\n| Key Word | What It Means |\n|---------|---------------|\n| **Needs** | Things you must have to stay alive — food, water, shelter, clothes |\n| **Wants** | Things that are nice to have but not essential — toys, sweets, games |\n| **Choose** | Pick what is most important when you cannot have everything |\n\n**Remember:** Needs come first! Wants come second.\n\n**Try this at home:** Look around your room. Make two lists in your workbook — one for NEEDS and one for WANTS. How many items can you find for each list?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Money (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Money ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Money\n\nIn South Africa we use money to buy the things we need and want. Our money is called the **Rand**. We write it with the letter **R** in front of the number. For example: R10, R50, R200.\n\nWe also use **cents**. There are **100 cents in one Rand**.\n\n### South African Coins\n\nCoins are the small, round pieces of money you can hold in your hand.\n\n| Coin | What It Looks Like |\n|------|--------------------|\n| **5c** | Very small, copper-coloured |\n| **10c** | Small, copper-coloured |\n| **20c** | A bit bigger, copper-coloured |\n| **50c** | Silver-coloured, larger |\n| **R1** | Silver-coloured, round |\n| **R2** | Silver-coloured with a gold ring |\n| **R5** | Silver-coloured with a gold middle |\n\n### South African Notes\n\nNotes are the paper money. Each note has a picture of Nelson Mandela on the front and a Big Five animal on the back.\n\n| Note | Colour | Animal on the Back |\n|------|--------|--------------------|\n| **R10** | Green | Rhino |\n| **R20** | Brown | Elephant |\n| **R50** | Red | Lion |\n| **R100** | Blue | Buffalo |\n| **R200** | Orange | Leopard |'),
  t(2, '### Counting Money\n\nWhen you have different coins and notes, you must count them together to find the total.\n\n**Example 1:** You have a R5 coin, a R2 coin, and a R1 coin.\nR5 + R2 + R1 = **R8**\n\n**Example 2:** You have a R10 note and three R2 coins.\nR10 + R2 + R2 + R2 = **R16**\n\n**Example 3:** You have a R20 note, a R5 coin, and a 50c coin.\nR20 + R5 + R0,50 = **R25,50**\n\n### Making Change\n\nWhen you pay for something and give more money than the price, you get **change** back.\n\nTo work out change: **Money you give − Price = Change**\n\n**Example 1:**\nYou buy a banana for R3. You give R5.\nR5 − R3 = **R2 change**\n\n**Example 2:**\nYou buy a cool drink for R12. You give R20.\nR20 − R12 = **R8 change**\n\n**Example 3:**\nYou buy a sandwich for R15. You give R50.\nR50 − R15 = **R35 change**'),
  q(3, 'How many cents are in one Rand?',
    ['100 cents', '10 cents', '50 cents', '200 cents'], 0,
    'There are 100 cents in one Rand. So R1 = 100c, and R2 = 200c.'),
  fb(4, 'South African money is called the ___. We write it with the letter ___ in front of the number.',
    ['Rand', 'R'],
    'Our currency is the Rand and we use the symbol R. For example, fifty Rand is written as R50.'),
  q(5, 'You have a R10 note and two R5 coins. How much money do you have?',
    ['R20', 'R15', 'R25', 'R10'], 0,
    'R10 + R5 + R5 = R20. You count all the notes and coins together to find the total.'),
  t(6, '### Working Out Change — More Practice\n\nLet us practise giving change. Remember the rule:\n\n**Money given − Price = Change**\n\n| What You Buy | Price | Money You Give | Change You Get |\n|-------------|-------|----------------|----------------|\n| An apple | R4 | R5 | R1 |\n| A packet of chips | R8 | R10 | R2 |\n| A school pen | R6 | R20 | R14 |\n| A vetkoek | R15 | R20 | R5 |\n| A juice box | R7 | R50 | R43 |\n\nAlways check your change! Count the coins and notes the shopkeeper gives you to make sure it is the right amount.'),
  q(7, 'You buy a pencil for R4 and give the shopkeeper R10. How much change should you get?',
    ['R6', 'R4', 'R14', 'R10'], 0,
    'R10 − R4 = R6. You should get R6 change.'),
  fb(8, 'If you pay R20 for something that costs R13, your change is R___. To work out change you subtract the ___ from the money you give.',
    ['7', 'price'],
    'R20 − R13 = R7 change. The rule is: Money given minus the price equals the change.'),
  q(9, 'Which South African note has a picture of an elephant on the back?',
    ['R20 note', 'R10 note', 'R50 note', 'R100 note'], 0,
    'The R20 note (brown) has an elephant on the back. Each note shows one of the Big Five animals.'),
  t(10, '### Summary\n\n| Key Word | What It Means |\n|---------|---------------|\n| **Rand (R)** | The name of South African money |\n| **Cents (c)** | Smaller parts of the Rand — 100c = R1 |\n| **Coins** | Small round money — 5c, 10c, 20c, 50c, R1, R2, R5 |\n| **Notes** | Paper money — R10, R20, R50, R100, R200 |\n| **Change** | The money you get back when you pay too much |\n\n**Remember:** Always count your money carefully and check your change!\n\n**Try this:** Ask a parent or guardian to show you different coins and notes. Practise counting them and working out how much you have altogether.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Spending Money (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Spending Money ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Spending Money\n\nWhen you go to a shop, you give money in exchange for the things you want to buy. This is called **spending**. But it is important to spend your money **wisely** — that means thinking carefully before you buy something.\n\n### Buying Things at a Shop\n\nWhen you buy something at a shop, every item has a **price**. The price tells you how much money you need to pay.\n\n**How buying works:**\n1. You choose what you want to buy\n2. You look at the price\n3. You check if you have enough money\n4. You pay the shopkeeper\n5. You get your item (and change if you paid too much)\n\n**Example:**\nThandi goes to the tuck shop at school. She sees these items:\n\n| Item | Price |\n|------|-------|\n| Apple | R3 |\n| Packet of chips | R8 |\n| Juice box | R7 |\n| Sandwich | R15 |\n| Lollipop | R2 |\n\nThandi has R20. She wants the sandwich (R15) and a juice box (R7). That would cost R15 + R7 = R22. But she only has R20! She does not have enough money for both.\n\nSo Thandi chooses the sandwich (R15) and the apple (R3). That costs R15 + R3 = R18. She pays R20 and gets R2 change.'),
  t(2, '### Spending Wisely\n\n**Spending wisely** means thinking before you spend. Here are some good rules:\n\n1. **Ask yourself: Do I really need this?** If not, maybe save your money instead.\n2. **Compare prices.** The same item might cost less at a different shop.\n3. **Do not buy something just because your friend has it.** Think about what YOU need.\n4. **Check if you have enough money** before you go to the till.\n\n### Not Wasting Money\n\nSome children spend all their money on sweets and cool drinks at the tuck shop. By the end of the week, their money is gone and they have nothing to show for it.\n\n**Wasting money** means spending it on things that do not last or that you do not really need.\n\n| Wise Spending | Wasting Money |\n|--------------|---------------|\n| Buying a pencil you need for school | Buying five lollipops in one day |\n| Saving up for a book you want | Buying chips every single break time |\n| Buying a sandwich for lunch | Buying something just to show off |\n\n### A Shopping List Helps!\n\nBefore you go to a shop, make a **shopping list**. Write down what you need. This helps you:\n- Remember what to buy\n- Not buy things you do not need\n- Stay within your budget (the amount of money you have)'),
  q(3, 'What does "spending wisely" mean?',
    ['Thinking carefully before you buy something', 'Spending all your money as fast as possible', 'Only buying the most expensive things', 'Never spending any money at all'], 0,
    'Spending wisely means thinking about whether you really need something before you buy it. It does not mean never spending — it means spending on the right things.'),
  fb(4, 'Before going to a shop, it is smart to make a ___. The amount of money you have to spend is called your ___.',
    ['shopping list', 'budget'],
    'A shopping list helps you remember what to buy and avoid wasting money. Your budget is the total amount of money you have available to spend.'),
  q(5, 'Bongani has R10. Chips cost R8 and a banana costs R3. He cannot buy both. What is the smarter choice?',
    ['The banana, because it is healthier and costs less', 'The chips, because they taste better', 'He should borrow money to buy both', 'He should not buy anything'], 0,
    'The banana is a healthier choice and cheaper too. Bongani will even have R7 change, which he could save!'),
  t(6, '### Paying and Getting Change\n\nWhen you pay at a shop, always:\n\n1. **Count your money** before you hand it over\n2. **Wait for your change** — do not walk away without it!\n3. **Count your change** to make sure it is correct\n\n**Example:**\nJabu buys a pie for R18. He gives the shopkeeper R50.\nChange = R50 − R18 = R32\n\nThe shopkeeper gives Jabu: R20 + R10 + R2 = R32. That is correct!\n\n**What if the change is wrong?**\nIf you think you got the wrong change, politely tell the shopkeeper: "Excuse me, I think my change is not right." Then work it out together.\n\n### Keeping Track of Spending\n\nIt is a good idea to write down what you spend your money on. You can use a simple table:\n\n| Day | What I Bought | How Much |\n|-----|-------------|----------|\n| Monday | School pencil | R5 |\n| Tuesday | Juice box | R7 |\n| Wednesday | Nothing | R0 |\n| Thursday | Banana | R3 |\n| Friday | Chips | R8 |\n| **Total** | | **R23** |\n\nThis helps you see where your money goes!'),
  q(7, 'Why should you count your change at a shop?',
    ['To make sure you got the right amount back', 'Because it is fun to count', 'To show the shopkeeper you are clever', 'Because coins are heavy'], 0,
    'You count your change to make sure the shopkeeper gave you the correct amount. Mistakes can happen, and it is your money!'),
  fb(8, 'When you pay more than the price, you get ___ back. It is smart to write down what you spend to keep ___ of your money.',
    ['change', 'track'],
    'Change is the money returned when you overpay. Keeping track of your spending means writing down what you buy so you know where your money goes.'),
  t(9, '### Summary\n\n| Key Word | What It Means |\n|---------|---------------|\n| **Spending** | Using money to buy things |\n| **Price** | How much something costs |\n| **Budget** | The total amount of money you have to spend |\n| **Spending wisely** | Thinking carefully before buying |\n| **Wasting money** | Spending on things you do not need or that do not last |\n| **Shopping list** | A list of what you plan to buy |\n\n**Remember:** Think before you spend! Ask yourself: Do I need this? Can I afford it?\n\n**Try this:** For one week, write down everything you spend money on. At the end of the week, add up the total. Were there any things you did not really need?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Saving Money (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Saving Money ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Saving Money\n\nHave you ever wanted something that cost more money than you had? Maybe a special toy, a pair of shoes, or a book? The answer is **saving**!\n\n**Saving** means keeping some of your money and not spending it right away. You put it away a little bit at a time until you have enough.\n\n### Why Do We Save?\n\nThere are many good reasons to save money:\n\n1. **To buy something special** — Maybe you want a R60 toy, but you only get R10 pocket money each week. If you save R10 each week, after 6 weeks you will have R60!\n2. **For emergencies** — What if your school bag breaks and you need a new one? Saved money can help.\n3. **To feel safe** — Knowing you have some money saved makes you feel good.\n4. **To help others** — With saved money, you could buy a gift for someone you love.\n\n### Saving vs Spending\n\n| Saving | Spending |\n|--------|----------|\n| Keeping money for later | Using money now |\n| You get something bigger later | You get something small now |\n| Takes patience | Gives you something right away |\n| Helps you reach goals | Money is gone once you spend it |'),
  t(2, '### Where Can You Keep Your Savings?\n\n**At Home:**\n- A **savings jar** — a glass jar where you put coins\n- A **piggy bank** — a special container for saving coins\n- An **envelope** — write your goal on it (like "New book — R40") and put money inside\n\n**At a Bank:**\n- A **savings account** — a safe place at the bank where they keep your money for you\n- Some banks in South Africa have special accounts for children\n- Your money is safe at the bank — nobody can take it\n- The bank even gives you a little extra money called **interest** — it is like a thank-you for keeping your money there!\n\n### Saving for Something Special\n\nLet us see how saving works with an example:\n\n**Amahle wants a storybook that costs R50.**\n\nShe gets R10 pocket money every week. She decides to save R5 each week and spend R5 on small things she needs.\n\n| Week | Money Saved This Week | Total Saved |\n|------|----------------------|-------------|\n| Week 1 | R5 | R5 |\n| Week 2 | R5 | R10 |\n| Week 3 | R5 | R15 |\n| Week 4 | R5 | R20 |\n| Week 5 | R5 | R25 |\n| Week 6 | R5 | R30 |\n| Week 7 | R5 | R35 |\n| Week 8 | R5 | R40 |\n| Week 9 | R5 | R45 |\n| Week 10 | R5 | **R50!** |\n\nAfter 10 weeks, Amahle has enough to buy her book! She is so proud because she did it all by herself.'),
  q(3, 'What does "saving" mean?',
    ['Keeping money and not spending it right away', 'Throwing money away', 'Giving all your money to a friend', 'Spending money as fast as you can'], 0,
    'Saving means putting money away so you can use it later for something important or special.'),
  fb(4, 'A safe place at the bank where they keep your money is called a ___. The extra money the bank gives you for saving there is called ___.',
    ['savings account', 'interest'],
    'A savings account keeps your money safe at the bank. Interest is the small extra amount the bank adds to your savings as a reward.'),
  q(5, 'Lebo gets R8 pocket money each week. She saves R4 each week. How many weeks will it take to save R20?',
    ['5 weeks', '4 weeks', '8 weeks', '20 weeks'], 0,
    'If Lebo saves R4 per week: Week 1 = R4, Week 2 = R8, Week 3 = R12, Week 4 = R16, Week 5 = R20. It takes 5 weeks.'),
  t(6, '### The Difference Between Saving and Spending\n\nImagine two friends: Thabo and Zanele. They both get R20 pocket money each week.\n\n**Thabo** spends all R20 every week on sweets, chips, and cool drinks.\n- After 4 weeks, Thabo has spent R80 on snacks.\n- He has R0 saved.\n- When he wants to buy a R50 cricket ball, he cannot afford it.\n\n**Zanele** saves R10 every week and spends R10.\n- After 4 weeks, Zanele has spent R40 on things she needs.\n- She has **R40 saved**.\n- She is almost ready to buy the R50 puzzle she wants!\n\nWho made the smarter choice? **Zanele!** She still enjoyed spending some money, but she also saved for something special.\n\n### Tips for Saving\n\n1. **Set a goal** — Decide what you are saving for and how much it costs\n2. **Save a little every week** — Even R2 or R5 adds up!\n3. **Do not touch your savings** — Once it goes in the jar, leave it there\n4. **Be patient** — Saving takes time, but it is worth it\n5. **Celebrate when you reach your goal!**'),
  q(7, 'Which child is saving wisely?',
    ['Palesa, who puts R5 in her piggy bank every week', 'Tshepo, who spends all his money on sweets every day', 'Mpho, who borrows money from friends', 'Kagiso, who hides money and forgets where it is'], 0,
    'Palesa is saving wisely because she regularly puts money away in her piggy bank. A little bit every week adds up over time!'),
  fb(8, 'When you save money, you keep it for ___. Saving takes ___, but it is worth it.',
    ['later', 'patience'],
    'Saving means keeping money for later use. It takes patience because you must wait, but you end up with enough for something special.'),
  t(9, '### Summary\n\n| Key Word | What It Means |\n|---------|---------------|\n| **Saving** | Keeping money to use later |\n| **Piggy bank** | A container where you save coins at home |\n| **Savings account** | A safe place at a bank to keep your money |\n| **Interest** | Extra money the bank gives you for saving there |\n| **Goal** | What you are saving up for |\n\n**Remember:** Save a little every week. It adds up fast!\n\n**Try this:** Set a savings goal. Choose something you want that costs between R20 and R50. Decide how much to save each week, then start a savings jar or envelope!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: People Who Work (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: People Who Work ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## People Who Work\n\nLook around your community. You will see many people going to work every day. Teachers go to school, doctors go to hospitals, and shop assistants go to shops. But why do people work?\n\n### Why Do People Work?\n\nPeople work for many reasons:\n\n1. **To earn money** — People need money to buy food, pay rent, and look after their families\n2. **To help others** — Doctors help sick people, teachers help children learn, police keep us safe\n3. **To use their skills** — A baker loves baking, a builder is good at building\n4. **To feel proud** — Doing a good job makes people feel happy and useful\n\n### Different Jobs in Our Community\n\n| Job | What They Do | Where They Work |\n|-----|-------------|----------------|\n| **Teacher** | Teaches children reading, maths, and other subjects | At a school |\n| **Doctor** | Helps sick people get better | At a hospital or clinic |\n| **Police officer** | Keeps the community safe and catches criminals | At a police station |\n| **Farmer** | Grows crops like mealies and vegetables, or raises animals | On a farm |\n| **Shopkeeper** | Sells things people need — food, clothes, medicine | At a shop or market |\n| **Nurse** | Takes care of sick people and gives medicine | At a hospital or clinic |\n| **Taxi driver** | Drives people where they need to go | On the roads |\n| **Builder** | Builds houses, schools, and other buildings | At building sites |'),
  t(2, '### How People Earn Money\n\nWhen people do their jobs, they get **paid**. The money they earn is called their **income**.\n\nPeople use their income to pay for:\n- Food for the family\n- A home to live in (rent or a bond)\n- School fees and uniforms\n- Electricity and water\n- Transport to get to work\n\n**Without workers, our community could not function!**\n\nThink about it:\n- Without **teachers**, children would not learn to read and write\n- Without **farmers**, there would be no food in the shops\n- Without **doctors and nurses**, sick people would have no help\n- Without **builders**, there would be no houses or schools\n- Without **taxi drivers**, many people could not get to work\n\n### Every Job Is Important\n\nSome people think only certain jobs are important. But that is not true!\n\nThe cleaner who mops the floor at your school is just as important as the principal. The lady who sells vetkoek outside the school gates is helping to feed people. The garden worker who cuts the grass keeps our areas neat and safe.\n\n**All jobs deserve respect.** If someone works hard, they are helping the community.'),
  q(3, 'Why do people go to work?',
    ['To earn money to look after their families', 'Because they have nothing else to do', 'Only to make friends', 'Because the government forces them to'], 0,
    'The main reason people work is to earn money (income) so they can buy food, pay for a home, and take care of their families. They also work to help others and use their skills.'),
  fb(4, 'The money people earn from working is called their ___. Without ___, our community could not function.',
    ['income', 'workers'],
    'Income is the money earned from a job. Every worker helps keep the community running — from teachers to farmers to taxi drivers.'),
  q(5, 'Which worker helps keep us safe in the community?',
    ['A police officer', 'A farmer', 'A shopkeeper', 'A builder'], 0,
    'Police officers protect us and keep the community safe. Farmers grow food, shopkeepers sell things, and builders construct buildings.'),
  t(6, '### Jobs in South Africa\n\nSouth Africa has many different kinds of work. Some people work in big offices in the city. Others work on farms in the countryside. Some people even work from home!\n\n**Types of work in South Africa:**\n\n| Type of Work | Examples |\n|-------------|----------|\n| **Farming** | Growing mealies, fruit, and vegetables; raising cattle and chickens |\n| **Mining** | Digging for gold, platinum, and coal deep underground |\n| **Shops and markets** | Selling food, clothes, and other goods |\n| **Government** | Teachers, police, nurses who work for the government |\n| **Building** | Constructing houses, roads, and bridges |\n| **Transport** | Taxi drivers, bus drivers, truck drivers |\n\n**Did you know?** Many South Africans run their own small businesses. They might sell fruit at a market stall, fix cars in their yard, or braid hair. These people are called **entrepreneurs** — they create their own work!'),
  q(7, 'What is an entrepreneur?',
    ['A person who starts their own business', 'A person who works at a school', 'A person who does not work', 'A person who only buys things'], 0,
    'An entrepreneur is someone who starts and runs their own business. They create their own work instead of working for someone else.'),
  fb(8, 'A person who starts their own business is called an ___. All jobs deserve ___ because every worker helps the community.',
    ['entrepreneur', 'respect'],
    'Entrepreneurs start their own businesses. And every job — big or small — is important because all workers help the community.'),
  t(9, '### Summary\n\n| Key Word | What It Means |\n|---------|---------------|\n| **Income** | Money earned from working |\n| **Job / Work** | Something a person does to earn money and help others |\n| **Community** | The group of people living and working in an area |\n| **Entrepreneur** | A person who starts and runs their own business |\n\n**Remember:** Every job is important. From the teacher to the cleaner, every worker helps our community!\n\n**Try this:** Talk to three adults you know. Ask them: What is your job? What do you do? Why is your job important? Write their answers in your workbook.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Shops and Markets (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Shops and Markets ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Shops and Markets\n\nWhere does your family buy food, clothes, and other things? Most people buy from **shops** and **markets**. In this lesson, we will learn about the different types of shops and the people who work in them.\n\n### Types of Shops\n\nThere are many different kinds of shops in South Africa:\n\n| Type of Shop | What They Sell | Example |\n|-------------|---------------|--------|\n| **Supermarket** | Food, drinks, cleaning products, and more | Shoprite, Pick n Pay, Spar |\n| **Spaza shop** | Snacks, bread, milk, airtime — in the neighbourhood | A small shop at someone\'s house |\n| **Market stall** | Fresh fruit, vegetables, clothes, or handmade goods | A table at a weekend market |\n| **Clothing shop** | Clothes, shoes, and accessories | PEP, Ackermans, Jet |\n| **Pharmacy** | Medicine, vitamins, and health products | Dis-Chem, Clicks |\n| **Stationery shop** | Pens, pencils, books, and school supplies | CNA |\n| **Tuck shop** | Snacks and drinks at school | Your school tuck shop |\n\n### Supermarkets\n\nA **supermarket** is a big shop that sells many different things. You push a trolley up and down the aisles and put items in your trolley. Then you pay at the **till** (cash register).\n\nSupermarkets have **special offers** — this means some things cost less than usual. Smart shoppers look for specials!'),
  t(2, '### Spaza Shops\n\nA **spaza shop** is a small shop that is often in someone\'s home or garage. Spaza shops are very popular in South African townships and villages.\n\n**Why are spaza shops useful?**\n- They are close to home — you do not need transport\n- They are open early and late\n- You can buy small amounts (one egg, one tomato, a small bag of sugar)\n- They help the owner earn money\n\n### Market Stalls\n\nAt a **market**, people set up tables or stalls and sell fresh food, clothes, or handmade things. Markets are often held on weekends.\n\nYou can find markets in many South African towns. Some sell fresh fruit and vegetables straight from the farm. Others sell handmade crafts like beaded jewellery and wooden carvings.\n\n### People Who Work in Shops\n\nMany people have jobs in shops:\n\n| Worker | What They Do |\n|--------|-------------|\n| **Shop assistant** | Helps customers find what they need |\n| **Cashier** | Takes your money at the till |\n| **Shelf packer** | Puts products on the shelves |\n| **Manager** | Runs the whole shop and makes decisions |\n| **Security guard** | Keeps the shop and customers safe |\n| **Cleaner** | Keeps the shop clean and tidy |'),
  q(3, 'What is a spaza shop?',
    ['A small shop often in someone\'s home in the neighbourhood', 'A very big shop like Shoprite', 'A shop that only sells medicine', 'A shop only found in big cities'], 0,
    'A spaza shop is a small neighbourhood shop, often run from someone\'s home or garage. They are very common in townships and villages across South Africa.'),
  fb(4, 'A big shop where you push a trolley and pay at the till is called a ___. A small neighbourhood shop run from someone\'s home is called a ___ shop.',
    ['supermarket', 'spaza'],
    'Supermarkets are large shops like Shoprite or Pick n Pay. Spaza shops are small, local shops often in someone\'s home.'),
  q(5, 'Who works at the till and takes your money at a shop?',
    ['A cashier', 'A security guard', 'A shelf packer', 'A cleaner'], 0,
    'The cashier is the person who works at the till (cash register) and takes your money when you pay for your shopping.'),
  t(6, '### Buying From Shops\n\nWhen you buy things at a shop, here are some smart tips:\n\n1. **Make a list** — Write down what you need before you go\n2. **Look at prices** — Check how much things cost\n3. **Compare** — The same item might be cheaper at another shop\n4. **Check for specials** — Look for yellow stickers or signs that say "SPECIAL" or "SALE"\n5. **Do not buy extra things** — Stick to your list!\n\n**Example:**\nMama sends Sizwe to the shop to buy:\n- Bread: R17\n- Milk: R22\n- Eggs: R35\n- Tomatoes: R12\n\nTotal: R17 + R22 + R35 + R12 = **R86**\n\nMama gives Sizwe R100.\nChange: R100 − R86 = **R14**\n\nSizwe brings home the groceries AND the R14 change. He did not spend the change on sweets — good boy, Sizwe!\n\n### Receipts\n\nWhen you buy something, the shop gives you a **receipt**. A receipt is a small paper that shows:\n- What you bought\n- How much each item cost\n- The total you paid\n- The date and time\n\nReceipts are important because if something is broken or wrong, you can take it back to the shop with the receipt and they will help you.'),
  q(7, 'Why should you keep the receipt when you buy something?',
    ['So you can return the item if something is wrong', 'To use as a bookmark', 'Because the shopkeeper tells you to', 'Because receipts are fun to collect'], 0,
    'A receipt is proof that you bought something. If the item is broken or wrong, you can take it back to the shop with the receipt to get it fixed or replaced.'),
  fb(8, 'A small paper that shows what you bought and how much you paid is called a ___. When shops sell items at lower prices, these are called ___.',
    ['receipt', 'specials'],
    'A receipt is the paper showing your purchases and costs. Specials (or sales) are when shops reduce prices on certain items.'),
  t(9, '### Summary\n\n| Key Word | What It Means |\n|---------|---------------|\n| **Supermarket** | A big shop that sells many types of products |\n| **Spaza shop** | A small shop in the neighbourhood, often in a home |\n| **Market stall** | A table where someone sells goods at a market |\n| **Cashier** | The person who takes your money at the till |\n| **Receipt** | A paper that shows what you bought and how much you paid |\n| **Specials** | Items that are cheaper than usual |\n\n**Remember:** Be a smart shopper — make a list, check prices, and look for specials!\n\n**Try this:** Next time you go to a shop with your family, look at the receipt. Can you find the name of each item and its price? Add them up to check the total.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Taking Care of Things (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Taking Care of Things ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Taking Care of Things\n\nYour school bag, your books, your uniform, your shoes — all of these things cost money. If you break them or lose them, your family has to spend more money to replace them. That is why it is so important to **take care of your things**.\n\n### Why Should We Look After Our Belongings?\n\n1. **Things cost money** — If you break your pencil case, someone must buy a new one\n2. **They last longer** — A school bag that is looked after can last for years\n3. **You feel proud** — It feels good to have neat, clean things\n4. **It shows respect** — Taking care of things shows you are grateful for what you have\n\n### Looking After Your School Things\n\nHere are tips for taking care of what you have:\n\n| Item | How to Look After It |\n|------|---------------------|\n| **School bag** | Do not drag it on the ground. Zip it closed. Do not overload it. |\n| **Books** | Cover your books with plastic. Do not write on covers. Keep them dry. |\n| **Pencils and pens** | Keep them in a pencil case. Put the lid back on pens. Do not chew them! |\n| **School uniform** | Hang it up after school. Do not play rough in it. Wash it regularly. |\n| **Shoes** | Clean them often. Do not kick walls or stomp in puddles. |\n| **Lunch box** | Wash it every day. Do not leave old food inside. |'),
  t(2, '### Sharing\n\n**Sharing** means letting someone else use something that belongs to you. Sharing is kind and it helps everyone.\n\n**Examples of sharing:**\n- Letting your friend use your coloured pencils\n- Sharing your lunch with someone who forgot theirs\n- Taking turns with a ball at break time\n\n**Rules for sharing:**\n- Be fair — everyone gets a turn\n- Be gentle — do not break something that is not yours\n- Say "please" and "thank you"\n\n### Borrowing and Returning\n\n**Borrowing** means using something that belongs to someone else, with their permission.\n\n**Important rules for borrowing:**\n1. **Always ask first** — "May I please borrow your ruler?"\n2. **Take care of it** — Treat it even better than your own things\n3. **Return it on time** — Give it back when you said you would\n4. **Return it in good condition** — Do not break or damage it\n5. **Say thank you** — Show that you are grateful\n\n**What if you break something you borrowed?**\nBe honest! Tell the person what happened and say sorry. If you can, help fix it or replace it. Hiding it or pretending nothing happened is not the right thing to do.'),
  q(3, 'Why is it important to take care of your school things?',
    ['Because they cost money and they last longer if you look after them', 'Because your teacher will be angry if you do not', 'Because new things are ugly', 'Because you will get a prize'], 0,
    'Things cost money to buy. If you look after them, they last longer and your family does not have to spend money on replacements.'),
  fb(4, 'When you let someone else use your things, it is called ___. When you use something that belongs to someone else, it is called ___.',
    ['sharing', 'borrowing'],
    'Sharing is letting others use your belongings. Borrowing is using something that belongs to someone else with their permission.'),
  q(5, 'What should you do if you break something you borrowed?',
    ['Tell the person, say sorry, and try to help fix or replace it', 'Hide it and pretend nothing happened', 'Blame someone else', 'Throw it away so nobody finds out'], 0,
    'Honesty is always the best choice. Tell the person what happened, apologise, and try to fix or replace the item if you can.'),
  t(6, '### Not Wasting Things\n\n**Wasting** means using more than you need or throwing things away when they are still useful.\n\n**Examples of wasting:**\n- Leaving the tap running while you brush your teeth\n- Throwing away food you did not finish\n- Tearing pages out of your exercise book for no reason\n- Using five sheets of paper when one would be enough\n\n**How to avoid wasting:**\n\n| Resource | How Not to Waste It |\n|---------|--------------------|\n| **Water** | Turn off the tap. Take short showers. |\n| **Food** | Only put on your plate what you will eat. |\n| **Paper** | Write on both sides. Use scrap paper for rough work. |\n| **Electricity** | Switch off lights when you leave a room. |\n| **Clothes** | Pass down clothes that still fit someone else. |\n\nIn South Africa, water is very precious. We do not always have enough rain, so saving water is very important.\n\n### Reusing Things\n\nBefore you throw something away, ask: "Can I use this again?"\n\n- An old ice cream container can hold your crayons\n- Old newspaper can cover your school books\n- An empty cool drink bottle can become a flower vase\n- A torn t-shirt can become a cleaning cloth\n\nThis is called **reusing** — giving something old a new purpose!'),
  q(7, 'Which of these is an example of WASTING?',
    ['Leaving the tap running while you talk to a friend', 'Turning off the light when you leave a room', 'Writing on both sides of the paper', 'Eating all the food on your plate'], 0,
    'Leaving the tap running wastes water. The other choices show being careful with resources.'),
  fb(8, 'Using something old for a new purpose is called ___. In South Africa, ___ is a very precious resource we must not waste.',
    ['reusing', 'water'],
    'Reusing means finding a new use for something old instead of throwing it away. Water is precious in South Africa because droughts are common.'),
  t(9, '### Summary\n\n| Key Word | What It Means |\n|---------|---------------|\n| **Belongings** | The things that belong to you |\n| **Sharing** | Letting someone else use your things |\n| **Borrowing** | Using something that belongs to someone else, with permission |\n| **Wasting** | Using more than you need or throwing useful things away |\n| **Reusing** | Giving something old a new purpose |\n\n**Remember:** Take care of what you have! Look after it, share nicely, and do not waste.\n\n**Try this:** Find three items at home that you were going to throw away. Can you think of a new use for each one? Write or draw your ideas in your workbook.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Making and Selling (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Making and Selling ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Making and Selling\n\nDid you know that you can make things and sell them to earn money? Many people in South Africa do this every day! A gogo makes bead bracelets and sells them at the market. A boy at school makes bookmarks and sells them to his classmates. A family makes vetkoek and sells them at the school gate.\n\nIn this lesson, we will learn about making things and selling them.\n\n### What Can You Make and Sell?\n\nHere are some ideas for things children can make:\n\n| Thing to Make | What You Need | Who Might Buy It |\n|-------------|--------------|------------------|\n| **Bead bracelets** | Beads and string | Friends, family, people at a market |\n| **Lemonade** | Lemons, sugar, water, cups | People at a school market or sports day |\n| **Cookies or muffins** | Flour, sugar, eggs, butter (and an adult to help!) | Classmates, teachers, neighbours |\n| **Bookmarks** | Cardboard, markers, stickers | Classmates who love reading |\n| **Greeting cards** | Paper, crayons, glitter | People who need birthday or holiday cards |\n| **Popcorn** | Popcorn kernels, oil, salt, small bags | Learners at school |\n\n### The School Market\n\nSome schools hold a **school market day**. On this day, learners bring things they have made and sell them to other learners, teachers, and parents. It is a fun way to learn about business!'),
  t(2, '### What Does It Cost to Make Something?\n\nBefore you sell something, you need to know how much it **costs** to make it. This is called the **cost price**.\n\n**Example: Making Lemonade**\n\nNeo wants to sell lemonade at the school market. He needs:\n- 6 lemons: R12\n- Sugar: R5\n- 10 cups: R8\n\n**Total cost = R12 + R5 + R8 = R25**\n\nNeo can make 10 cups of lemonade.\nCost per cup = R25 divided by 10 = **R2,50 per cup**\n\n### Setting a Selling Price\n\nThe **selling price** is how much you charge people to buy your product.\n\nThe selling price must be MORE than the cost price. The extra money is your **profit** — that is the money you get to keep!\n\n**Selling price − Cost price = Profit**\n\nNeo decides to sell each cup of lemonade for **R5**.\n- Selling price per cup: R5\n- Cost price per cup: R2,50\n- Profit per cup: R5 − R2,50 = **R2,50**\n\nIf he sells all 10 cups:\n- Total sales: 10 x R5 = R50\n- Total cost: R25\n- Total profit: R50 − R25 = **R25!**\n\nNeo spent R25 on supplies and earned R50 from selling. He made R25 profit!'),
  q(3, 'What is the "cost price"?',
    ['The amount of money it costs to make something', 'The price you sell something for', 'The profit you make', 'The money left over after selling'], 0,
    'The cost price is how much you spend to make or buy the product. The selling price is what you charge your customers.'),
  fb(4, 'The price you charge customers is called the ___. The money left over after paying your costs is called ___.',
    ['selling price', 'profit'],
    'The selling price is what the buyer pays you. Profit is what remains after you subtract the cost price from the selling price.'),
  q(5, 'Zandi makes 5 bead bracelets. Each one costs R4 to make. She sells each one for R10. How much profit does she make in total?',
    ['R30', 'R20', 'R50', 'R10'], 0,
    'Cost per bracelet: R4. Selling price: R10. Profit per bracelet: R10 − R4 = R6. Total profit: 5 x R6 = R30.'),
  t(6, '### Planning Your Own Product\n\nIf you want to make and sell something, you need a simple plan:\n\n**Step 1: Choose what to make**\nPick something you are good at making and that people will want to buy.\n\n**Step 2: Work out the cost**\nWrite down everything you need and how much it costs.\n\n**Step 3: Set a selling price**\nMake sure it is more than the cost price, but not so expensive that nobody will buy it.\n\n**Step 4: Make your product**\nMake it neatly and with care. If it looks good, more people will want to buy it!\n\n**Step 5: Sell it**\nTell people about your product. You could make a sign or poster.\n\n**Example plan:**\n\n| Step | Kagiso\'s Cookie Business |\n|------|--------------------------|\n| Product | Chocolate cookies |\n| Supplies needed | Flour (R15), sugar (R8), cocoa (R12), butter (R20), eggs (R18) |\n| Total cost | R73 |\n| Number of cookies | About 30 |\n| Cost per cookie | R73 ÷ 30 = about R2,50 |\n| Selling price | R5 per cookie |\n| Profit per cookie | R5 − R2,50 = R2,50 |\n| Total profit (if all sold) | 30 x R2,50 = **R75** |'),
  q(7, 'Why must your selling price be higher than your cost price?',
    ['So that you make a profit — money you get to keep', 'Because it is a rule from the government', 'So that the product looks more expensive', 'Because customers like to pay more'], 0,
    'If your selling price is the same as or less than your cost price, you will not make any profit. You need the selling price to be higher so you earn money from your work.'),
  fb(8, 'Before selling something, you should first work out the ___. Selling price minus cost price equals ___.',
    ['cost price', 'profit'],
    'Always calculate your cost price first so you know how much to charge. The formula is: Selling price minus Cost price equals Profit.'),
  q(9, 'At a school market, Lindiwe sells popcorn for R3 a bag. Each bag costs R1 to make. She sells 20 bags. How much profit does she make?',
    ['R40', 'R60', 'R20', 'R30'], 0,
    'Profit per bag: R3 − R1 = R2. Total profit: 20 x R2 = R40.'),
  t(10, '### Summary\n\n| Key Word | What It Means |\n|---------|---------------|\n| **Cost price** | How much it costs to make or buy something |\n| **Selling price** | The price you charge your customers |\n| **Profit** | The money you earn after paying your costs |\n| **School market** | A day when learners sell things they have made |\n\n**Remember:** Anyone can make and sell things — even a Grade 4 learner! All you need is a good idea, some supplies, and the courage to try.\n\n**Try this:** Choose one thing from the ideas in this lesson (bracelets, lemonade, cookies, bookmarks). Write a simple plan: What supplies do you need? How much do they cost? What selling price will you choose? How much profit will you make?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 4
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

  // Find or create EMS subject
  let SUBJECT_ID;
  let subjectDoc = await db.collection('subjects').findOne({ name: /EMS|Economic.*Management/i, schoolId: SCHOOL_ID });
  if (!subjectDoc) {
    const result = await db.collection('subjects').insertOne({
      name: 'Economic and Management Sciences',
      code: 'EMS',
      schoolId: SCHOOL_ID,
      gradeIds: [GRADE_ID],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created EMS subject:', String(SUBJECT_ID));
  } else {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found EMS subject:', String(SUBJECT_ID));
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
    tags: ['grade-4', 'ems', 'caps'],
    aiModel: '',
    aiPrompt: '',
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    difficulty: 3,
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
      title: 'Chapter 1: Things We Need and Want',
      description: 'Basic needs (food, water, shelter, clothes) vs wants (toys, sweets, games), why we cannot have everything, and making smart choices.',
      order: 1,
      lessons: [
        { title: 'Things We Need and Want', description: 'What are needs and wants; four basic needs; telling them apart; unlimited wants and limited money; making good choices; needs first, wants second.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Money',
      description: 'South African coins and notes, the Rand and cents, counting money, making change, and the Big Five animals on our notes.',
      order: 2,
      lessons: [
        { title: 'Money', description: 'South African coins (5c to R5); South African notes (R10 to R200); the Big Five animals; counting money; making change; checking your change.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Spending Money',
      description: 'Buying things at a shop, prices, paying and getting change, spending wisely, not wasting money, shopping lists, and keeping track of spending.',
      order: 3,
      lessons: [
        { title: 'Spending Money', description: 'Buying at a shop; prices; paying and getting change; spending wisely; wasting money; shopping lists; budgets; receipts; keeping track of spending.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Saving Money',
      description: 'Why we save, saving jars and piggy banks, bank savings accounts, interest, saving for something special, and the difference between saving and spending.',
      order: 4,
      lessons: [
        { title: 'Saving Money', description: 'Why we save; saving vs spending; piggy banks and savings jars; bank savings accounts; interest; saving for a goal; tips for saving; patience pays off.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: People Who Work',
      description: 'Different jobs in our community, why people work, earning income, types of work in South Africa, and entrepreneurs.',
      order: 5,
      lessons: [
        { title: 'People Who Work', description: 'Why people work; different jobs (teacher, doctor, police, farmer, shopkeeper); income; every job is important; types of work in South Africa; entrepreneurs.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Shops and Markets',
      description: 'Different types of shops (supermarket, spaza shop, market stall), people who work in shops, smart shopping tips, and receipts.',
      order: 6,
      lessons: [
        { title: 'Shops and Markets', description: 'Types of shops (supermarket, spaza shop, market stall, clothing shop, pharmacy); people who work in shops; buying smartly; specials and sales; receipts.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Taking Care of Things',
      description: 'Looking after belongings (school bag, books, uniform), sharing, borrowing and returning, not wasting, and reusing things.',
      order: 7,
      lessons: [
        { title: 'Taking Care of Things', description: 'Why look after belongings; caring for school things; sharing; borrowing and returning; not wasting water, food, and paper; reusing old items.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Making and Selling',
      description: 'Making things to sell (bead bracelets, lemonade, cookies), the school market, cost price and selling price, earning profit, and planning a product.',
      order: 8,
      lessons: [
        { title: 'Making and Selling', description: 'Things children can make and sell; the school market; cost price; selling price; profit; planning a product step by step; working out costs and profit.', blocks: ch8_lesson1, term: 4 },
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
      _id: new mongoose.Types.ObjectId(),
      title: ch.title,
      description: ch.description,
      order: ch.order,
      curriculumNodeId: null,
      resources: resourceIds.map(function(id, i) { return { resourceId: id, order: i }; }),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 4 EMS \u2014 CAPS Textbook',
    description: 'Introductory CAPS-aligned textbook covering foundational economic literacy concepts for Grade 4 learners: needs and wants, money, spending, saving, people who work, shops and markets, taking care of things, and making and selling.',
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
  console.log('  TEXTBOOK: Grade 4 EMS');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
