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
// CHAPTER 1: What Do We Need? (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: What Do We Need? ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## What Do We Need?\n\nEvery single day, you use many things. You eat breakfast, drink water, put on your clothes, and go to your warm home after school. You also play with toys, eat sweets, and watch cartoons.\n\nBut did you know that some of these things are **very important** and others are just **nice to have**?\n\nLet us learn about **needs** and **wants**!\n\n### Needs\n\n**Needs** are things you MUST have. Without them, you could get sick or feel very bad.\n\nHere are the things every person needs:\n\n| Need | Why? |\n|------|------|\n| **Food** | Your body needs food to be strong and grow |\n| **Water** | You must drink clean water every day |\n| **A home** | A safe place to sleep and stay dry when it rains |\n| **Clothes** | To keep you warm and protect your body |\n\nThink about it: if you have no food, your tummy hurts. If you have no home, you get wet in the rain. These things are very important!'),
  t(2, '### Wants\n\n**Wants** are things you would LIKE to have. They make life fun! But you can live without them.\n\n**Examples of wants:**\n- A bag of chips from the tuck shop\n- A new teddy bear\n- Sweets and lollipops\n- A cool new pencil case\n- A trip to the park\n\n### How Can I Tell?\n\nAsk yourself: **"Can I live without this?"**\n\n- If you say **NO** — it is a **need**.\n- If you say **YES** — it is a **want**.\n\nLook at these examples:\n\n| Thing | Need or Want? | Why? |\n|-------|-------------|------|\n| A glass of water | Need | You must drink water every day |\n| A can of cool drink | Want | It is yummy, but water is what you really need |\n| A warm jacket in winter | Need | You need warmth to stay healthy |\n| A sparkly new dress | Want | Your old clothes still keep you warm |\n| Bread for lunch | Need | Your body needs food |\n| A chocolate bar | Want | It is tasty, but you can live without it |'),
  q(3, 'Which one of these is a NEED?',
    ['Food to eat', 'A new toy car', 'A packet of sweets', 'A colouring book'], 0,
    'Food is something you must have every day to stay alive and grow. Toy cars, sweets, and colouring books are wants — they are fun, but you can live without them.'),
  fb(4, 'Things you MUST have to live are called ___. Things that are nice to have are called ___.',
    ['needs', 'wants'],
    'Needs are things like food, water, a home, and clothes. Wants are things like toys, sweets, and games — nice to have but not needed to survive.'),
  t(5, '### We Cannot Have Everything\n\nHave you ever gone to a shop and wanted EVERYTHING? Maybe you wanted chips, sweets, a toy, AND a cool drink!\n\nBut your mom or dad said: "You can only pick ONE thing."\n\nThat is because money does not last forever. We must **choose** wisely.\n\n**The golden rule:** Buy what you NEED first. Then, if there is money left, you can buy what you WANT.\n\n**Example:**\nThandi has R10. She needs a new eraser for school (R5) and she wants a lollipop (R3). What should she buy first?\n\nShe should buy the eraser first because she needs it for school. Then she still has R5 left, so she can even buy the lollipop!\n\nThandi made a smart choice!'),
  q(6, 'Bongani has R8. He needs a ruler for school (R6) and wants a packet of chips (R7). What should he buy first?',
    ['The ruler, because it is a need', 'The chips, because they are yummy', 'Both at the same time', 'He should not buy anything'], 0,
    'The ruler is a need for school. Bongani should buy it first. After buying the ruler he has R2 left, which is not enough for chips, but he made the smart choice by putting his need first.'),
  fb(7, 'We should always buy our ___ first. Then, if we have money left, we can buy our ___.',
    ['needs', 'wants'],
    'The golden rule is: needs first, wants second. Buy what you must have before buying the fun extras.'),
  q(8, 'Which list shows ONLY needs?',
    ['Food, water, clothes, a home', 'Toys, sweets, games, stickers', 'Water, chips, a home, dolls', 'Clothes, chocolate, food, crayons'], 0,
    'Food, water, clothes, and a home are all things you must have. The other lists have wants mixed in with needs.'),
  t(9, '### Let Us Remember!\n\n| Word | What It Means |\n|------|---------------|\n| **Needs** | Things you must have — food, water, a home, clothes |\n| **Wants** | Things that are nice to have — toys, sweets, games |\n| **Choose** | Pick what is most important first |\n\n**Remember:** Needs come FIRST! Wants come SECOND.\n\n**Fun activity:** Draw two big boxes in your workbook. Write NEEDS on one box and WANTS on the other. Draw pictures of things that go in each box!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Our Money (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Our Money ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Our Money\n\nIn South Africa, we use special money called the **Rand**. We write it with the letter **R**. So ten Rand looks like this: **R10**.\n\nWe also have **cents**. There are **100 cents** in one Rand.\n\n### Our Coins\n\nCoins are the small, round pieces of money. You can hold them in your hand or put them in a piggy bank!\n\n| Coin | What It Looks Like |\n|------|--------------------|\n| **5c** | Very tiny and copper-coloured |\n| **10c** | Small and copper-coloured |\n| **20c** | A little bigger, copper-coloured |\n| **50c** | Silver-coloured |\n| **R1** | Silver-coloured and round |\n| **R2** | Silver with a gold ring around the edge |\n| **R5** | Silver with a gold middle — the biggest coin! |\n\nDid you know? South African coins have pictures of animals and plants on them! Look at your coins carefully next time.'),
  t(2, '### Our Notes\n\nNotes are the paper money. They are bigger than coins and come in pretty colours. Every note has a picture of **Nelson Mandela** on the front!\n\nOn the back of each note is one of the **Big Five** animals:\n\n| Note | Colour | Animal on the Back |\n|------|--------|--------------------|\n| **R10** | Green | Rhino |\n| **R20** | Brown | Elephant |\n| **R50** | Red | Lion |\n| **R100** | Blue | Buffalo |\n| **R200** | Orange | Leopard |\n\nThe R200 note is worth the most. The R10 note is worth the least.\n\n### Counting Coins\n\nWhen you have different coins, you add them together to find the total.\n\n**Example 1:** You have a R2 coin and a R1 coin.\nR2 + R1 = **R3**\n\n**Example 2:** You have two R5 coins.\nR5 + R5 = **R10**\n\n**Example 3:** You have a R5 coin, a R2 coin, and two R1 coins.\nR5 + R2 + R1 + R1 = **R9**'),
  q(3, 'Which animal is on the back of the R50 note?',
    ['Lion', 'Elephant', 'Rhino', 'Leopard'], 0,
    'The lion is on the back of the red R50 note. The elephant is on the R20, the rhino on the R10, the buffalo on the R100, and the leopard on the R200.'),
  fb(4, 'South African money is called the ___. There are 100 ___ in one Rand.',
    ['Rand', 'cents'],
    'Our money is called the Rand (R). One Rand is made up of 100 cents. So R1 = 100c.'),
  q(5, 'You have a R5 coin and a R2 coin. How much money do you have?',
    ['R7', 'R3', 'R10', 'R52'], 0,
    'R5 + R2 = R7. You add the coins together to find the total amount.'),
  t(6, '### Which Note Is Worth More?\n\nLook at the notes from smallest to biggest:\n\n**R10** → **R20** → **R50** → **R100** → **R200**\n\nSo a R100 note is worth more than a R50 note. And a R200 note is worth MORE than any other note!\n\n### Fun Facts About Our Money\n\n- **Nelson Mandela** is on every single note. He was our first democratic president!\n- The **Big Five** animals on the notes are: rhino, elephant, lion, buffalo, and leopard.\n- The R2 coin has a special **two-colour** design — silver on the outside and gold on the inside.\n- The R5 coin also has two colours — it is the **biggest and heaviest** coin.\n- The smallest coin is the **5c** coin. It is very tiny!'),
  q(7, 'Which note is worth the MOST money?',
    ['R200', 'R100', 'R50', 'R10'], 0,
    'The R200 note is the highest value South African note. It is orange and has a leopard on the back.'),
  fb(8, 'Every South African note has a picture of ___ on the front. The R20 note has an ___ on the back.',
    ['Nelson Mandela', 'elephant'],
    'Nelson Mandela appears on the front of all our notes. The Big Five animals are on the back — the R20 has the elephant.'),
  q(9, 'You have three R1 coins and one R5 coin. How much money is that?',
    ['R8', 'R6', 'R15', 'R3'], 0,
    'R1 + R1 + R1 + R5 = R8. Count each coin and add them all together.'),
  t(10, '### Let Us Remember!\n\n| Word | What It Means |\n|------|---------------|\n| **Rand (R)** | The name of South African money |\n| **Cents (c)** | Small parts of a Rand — 100c = R1 |\n| **Coins** | Round metal money (5c, 10c, 20c, 50c, R1, R2, R5) |\n| **Notes** | Paper money (R10, R20, R50, R100, R200) |\n\n**Fun activity:** Ask a grown-up to show you some real coins and notes. Can you find the animals on the notes? Can you sort the coins from smallest to biggest?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Buying Things (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Buying Things ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Buying Things\n\nWhen you go to a shop with your mom, dad, or granny, you see lots of things on the shelves. Every item has a **price** — a little number that tells you how much it costs.\n\n### Looking at Prices\n\nPrices are usually written on a sticker or a sign next to the item.\n\n| Item | Price |\n|------|-------|\n| Bread | R16 |\n| Milk | R18 |\n| Banana | R3 |\n| Juice box | R7 |\n| Packet of chips | R8 |\n| Lollipop | R2 |\n\nBefore you buy something, always check the price first! If you have R10, you can buy the banana (R3), the juice box (R7), the chips (R8), or the lollipop (R2). But you cannot buy the bread (R16) because it costs more than R10.\n\n### Paying With Money\n\nWhen you buy something, you give the shopkeeper your money. If you give the **exact** amount, you do not get any money back. But if you give **more** than the price, you get **change**.'),
  t(2, '### Getting Change\n\nChange is the money you get back when you pay more than the price.\n\n**How to work out change:**\n**Money you give − Price = Change**\n\nLet us try!\n\n**Example 1:**\nYou buy a lollipop for R2. You give R5.\nR5 − R2 = **R3 change**\n\n**Example 2:**\nYou buy a juice box for R7. You give R10.\nR10 − R7 = **R3 change**\n\n**Example 3:**\nYou buy a banana for R3. You give R20.\nR20 − R3 = **R17 change**\n\nAlways count your change to make sure it is right!\n\n### Practice Table\n\n| What You Buy | Price | Money You Give | Change |\n|-------------|-------|----------------|--------|\n| Lollipop | R2 | R5 | R3 |\n| Apple | R4 | R5 | R1 |\n| Chips | R8 | R10 | R2 |\n| Juice | R7 | R10 | R3 |\n| Pencil | R5 | R20 | R15 |'),
  q(3, 'You buy an apple for R4 and give the shopkeeper R10. How much change do you get?',
    ['R6', 'R4', 'R14', 'R10'], 0,
    'R10 − R4 = R6. You should get R6 change back from the shopkeeper.'),
  fb(4, 'The money you get back when you pay too much is called ___. To find the change, you take the ___ away from the money you give.',
    ['change', 'price'],
    'Change is what you get back. The formula is: Money you give minus the Price equals the Change.'),
  t(5, '### Choosing What to Buy\n\nSometimes you do not have enough money to buy everything you want. Then you must choose!\n\n**Example:**\nZinhle has R10 at the tuck shop. Here are the prices:\n- Chips: R8\n- Juice: R7\n- Lollipop: R2\n- Cookie: R5\n\nCan she buy chips AND juice? R8 + R7 = R15. No! She only has R10.\n\nCan she buy chips AND a lollipop? R8 + R2 = R10. Yes! That is exactly R10.\n\nCan she buy a cookie AND a lollipop AND juice? R5 + R2 + R7 = R14. No! Too much.\n\nSo Zinhle must think carefully about what she really wants and check if she has enough money.'),
  q(6, 'Themba has R20. A sandwich costs R12 and a cool drink costs R9. Can he buy both?',
    ['No, because R12 + R9 = R21, which is more than R20', 'Yes, because R20 is a lot of money', 'Yes, because R12 + R9 = R19', 'No, because he should save his money'], 0,
    'R12 + R9 = R21. Themba only has R20, so he is R1 short. He cannot buy both items.'),
  fb(7, 'Before you buy something, always check the ___. If you give more money than the price, you get ___ back.',
    ['price', 'change'],
    'Always look at the price tag first. If you hand over more money than the price, the shopkeeper gives you change.'),
  q(8, 'A pencil costs R5 and a rubber costs R3. You have R10. How much change do you get if you buy both?',
    ['R2', 'R8', 'R5', 'R3'], 0,
    'R5 + R3 = R8 for both items. R10 − R8 = R2 change.'),
  t(9, '### Let Us Remember!\n\n| Word | What It Means |\n|------|---------------|\n| **Price** | How much something costs |\n| **Pay** | Give money to the shopkeeper |\n| **Change** | Money you get back when you give more than the price |\n| **Choose** | Pick carefully when you cannot buy everything |\n\n**Remember:** Always check the price before you buy. Count your change. And choose wisely!\n\n**Fun activity:** Pretend you have R20. Look at the prices in the lesson. Write down everything you could buy and how much change you would get!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Saving Money (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Saving Money ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Saving Money\n\nHave you ever wanted something special — like a new toy, a book, or a bicycle — but you did not have enough money?\n\nThat is where **saving** comes in!\n\n**Saving** means keeping some of your money instead of spending it all. You put it away safely, and over time it grows into a bigger amount.\n\n### Why Do We Save?\n\nWe save money so we can:\n- Buy something special later\n- Have money when we really need it\n- Not worry if something unexpected happens\n\n**Example:**\nLerato wants a new book that costs R40. She gets R10 pocket money every week. If she saves ALL her pocket money:\n- After 1 week: R10\n- After 2 weeks: R20\n- After 3 weeks: R30\n- After 4 weeks: R40 — she can buy the book!\n\nLerato was **patient**. She waited and saved, and now she has enough!'),
  t(2, '### Where Can I Save My Money?\n\nThere are different places to keep your money safe:\n\n| Place | How It Works |\n|-------|-------------|\n| **Piggy bank** | A container shaped like a pig (or any shape!) where you put coins |\n| **Saving jar** | A glass jar where you can see your money growing |\n| **Envelope** | A paper envelope you keep in a safe place |\n| **Bank account** | A very safe place at the bank where grown-ups can help you save |\n\nThe most important thing is to keep your savings **safe** and **not touch them** until you have enough for your goal.\n\n### Tips for Saving\n\n1. **Set a goal** — Know what you are saving for (a toy, a book, a gift for someone).\n2. **Be patient** — It takes time! Do not give up.\n3. **Do not spend everything** — When you get pocket money, put some in your piggy bank FIRST.\n4. **Count your savings** — Check how much you have every week. It feels great to watch it grow!\n5. **Avoid temptation** — When you see sweets at the tuck shop, remember your goal!'),
  q(3, 'What does "saving" mean?',
    ['Keeping some money instead of spending it all', 'Spending all your money at once', 'Giving all your money away', 'Hiding money so nobody can find it'], 0,
    'Saving means putting some money away instead of spending everything. You keep it safe so you can use it later for something special.'),
  fb(4, 'Saving means keeping your money instead of ___ it all. A ___ is a fun place to save your coins.',
    ['spending', 'piggy bank'],
    'When you save, you do not spend everything. A piggy bank is a great way for children to save coins at home.'),
  t(5, '### Saving For Something Special\n\nLet us follow Sipho. He wants a new soccer ball that costs R60.\n\nSipho gets R5 every day for doing chores at home. He decides to save R3 every day and spend R2.\n\nLet us see how his savings grow:\n\n| Day | Money Saved Today | Total Saved |\n|-----|-------------------|-------------|\n| Monday | R3 | R3 |\n| Tuesday | R3 | R6 |\n| Wednesday | R3 | R9 |\n| Thursday | R3 | R12 |\n| Friday | R3 | R15 |\n\nAfter one week, Sipho has R15. After two weeks, he has R30. After three weeks, R45. After four weeks, R60!\n\nSipho can now buy his soccer ball. He is so proud because he saved all by himself!\n\n**The lesson:** You do not need to save ALL your money. Even saving a LITTLE bit every day adds up to a LOT over time.'),
  q(6, 'Amahle saves R4 every day. How much will she have after 5 days?',
    ['R20', 'R4', 'R9', 'R40'], 0,
    'R4 saved every day for 5 days: R4 + R4 + R4 + R4 + R4 = R20. Saving a little every day adds up!'),
  fb(7, 'When you save, you should set a ___ so you know what you are saving for. You must also be ___ because saving takes time.',
    ['goal', 'patient'],
    'Setting a goal helps you stay focused. Being patient means waiting until you have enough money instead of giving up and spending it.'),
  q(8, 'Why is it smart to save some of your pocket money?',
    ['So you can buy something special later', 'Because money is not for spending', 'Because you should never buy anything', 'So you can show it to your friends'], 0,
    'Saving lets you buy something you really want later. You do not need to save all your money — just some of it, so it grows over time.'),
  t(9, '### Let Us Remember!\n\n| Word | What It Means |\n|------|---------------|\n| **Save** | Keep money instead of spending it |\n| **Piggy bank** | A container for saving coins |\n| **Goal** | What you are saving for |\n| **Patient** | Waiting calmly without giving up |\n\n**Remember:** Even saving a little bit every day adds up to a lot! Be patient and keep your goal in mind.\n\n**Fun activity:** Make your own saving jar! Decorate a jar or box with pictures and write your saving goal on it. Start putting coins in it today!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: People Who Help Us (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: People Who Help Us ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## People Who Help Us\n\nLook around your community. There are many people who work hard every day to help you and your family!\n\nThese people have different **jobs**. A job is the work someone does. People work to earn money so they can buy the things they need.\n\n### Jobs in Our Community\n\n| Person | What They Do | How They Help Us |\n|--------|-------------|------------------|\n| **Teacher** | Teaches children at school | Helps us learn to read, write, and count |\n| **Doctor** | Helps sick people get better | Checks our bodies and gives us medicine |\n| **Police officer** | Keeps us safe | Catches bad people and helps when there is trouble |\n| **Shopkeeper** | Sells things in a shop | Makes sure we can buy food, clothes, and other items |\n| **Farmer** | Grows food on a farm | Grows the mielies, fruit, and vegetables we eat |\n| **Taxi driver** | Drives a taxi or bus | Takes people where they need to go |'),
  t(2, '### More Helpers in Our Community\n\n| Person | What They Do | How They Help Us |\n|--------|-------------|------------------|\n| **Nurse** | Cares for sick people at the clinic | Gives injections and helps the doctor |\n| **Firefighter** | Puts out fires | Saves people and buildings from fire |\n| **Librarian** | Works at the library | Helps us find books to read |\n| **Cleaner** | Keeps places clean | Makes sure our school, shops, and streets are tidy |\n| **Builder** | Builds houses and buildings | Makes the homes and schools we use every day |\n| **Chef or cook** | Cooks food | Makes delicious meals at restaurants and schools |\n\n### Every Job Is Important!\n\nSome people think that only doctors and teachers have important jobs. But that is not true! Every single job matters.\n\nIf there were no farmers, we would have no food. If there were no cleaners, our schools would be dirty. If there were no taxi drivers, people could not get to work.\n\n**Every worker helps our community. We should thank them and treat them with respect.**'),
  q(3, 'Who helps us learn to read and write?',
    ['A teacher', 'A shopkeeper', 'A taxi driver', 'A farmer'], 0,
    'Teachers work at schools and help children learn to read, write, count, and many other things!'),
  fb(4, 'A ___ grows food for us to eat. A ___ keeps our community safe from bad people.',
    ['farmer', 'police officer'],
    'Farmers grow our food — like mielies, fruit, and vegetables. Police officers protect us and keep our community safe.'),
  t(5, '### Why Do People Work?\n\nPeople work for different reasons:\n\n1. **To earn money** — When you work, you get paid. You use that money to buy food, pay for a home, and look after your family.\n2. **To help others** — Many people love their jobs because they get to help. Doctors help sick people. Teachers help children learn.\n3. **To use their skills** — Everyone is good at something! A baker is good at baking. A mechanic is good at fixing cars. A singer is good at singing.\n\n### What Do You Want to Be?\n\nWhen you grow up, you will have a job too! What would you like to do?\n\nMaybe you want to be:\n- A **teacher** who helps children learn\n- A **doctor** who makes sick people better\n- A **pilot** who flies aeroplanes\n- A **chef** who cooks yummy food\n- A **soccer player** who plays in a big stadium\n\nWhatever you choose, remember: every job is important and every worker deserves respect!'),
  q(6, 'Why do people work?',
    ['To earn money and help others', 'Because they are bored at home', 'Only to become famous', 'Because the government tells them to'], 0,
    'People work to earn money so they can buy what they need, and also to help others in the community. Some people also work because they love using their special skills.'),
  fb(7, 'People work to earn ___ so they can buy the things they need. Every ___ is important in our community.',
    ['money', 'job'],
    'Workers earn money by doing their jobs. No matter what the job is — teacher, cleaner, farmer, or driver — every job helps the community.'),
  q(8, 'Which person helps put out fires?',
    ['A firefighter', 'A police officer', 'A builder', 'A nurse'], 0,
    'Firefighters are specially trained to put out fires and rescue people from burning buildings. They are very brave!'),
  t(9, '### Let Us Remember!\n\n| Word | What It Means |\n|------|---------------|\n| **Job** | The work a person does |\n| **Community** | The people who live and work near you |\n| **Earn** | Get money for working |\n| **Respect** | Treat someone nicely because they are important |\n\n**Remember:** Every person who works in our community is a helper. Be kind and say "thank you" to the people who help you!\n\n**Fun activity:** Draw a picture of what YOU want to be when you grow up. Write one sentence about how you will help others.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Sharing and Caring (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Sharing and Caring ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Sharing and Caring\n\nDo you know what makes a community a happy place? When people **share** and **care** for each other!\n\nSharing means giving some of what you have to someone else. Caring means looking after people and things around you.\n\n### Sharing With Others\n\nSharing makes everyone feel good — both the person who gives AND the person who receives.\n\n**Ways you can share:**\n- Share your lunch with a friend who forgot theirs\n- Let your brother or sister play with your toy\n- Give old clothes you have outgrown to someone who needs them\n- Share your crayons with a classmate\n- Help carry the groceries when mom comes home\n\n**Example:**\nNeo has two sandwiches in his lunchbox. His friend Aisha forgot her lunch at home. Neo gives one sandwich to Aisha.\n\nNeo still has a sandwich to eat, and now Aisha is not hungry. They are both happy!\n\n**Sharing does not mean you lose. It means you make the world a little better.**'),
  t(2, '### Not Wasting\n\nDo you know what **wasting** means? It means using more than you need, or throwing things away when they are still good.\n\n**Things we should not waste:**\n\n| Thing | How We Waste It | How to Save It |\n|-------|-----------------|----------------|\n| **Food** | Putting too much on your plate, then throwing it away | Take only what you will eat |\n| **Water** | Leaving the tap running | Turn off the tap when you are done |\n| **Paper** | Using a new page when you still have space | Write on both sides of the paper |\n| **Electricity** | Leaving lights on when nobody is in the room | Switch off the light when you leave |\n\nIn South Africa, clean water and electricity are very precious. Not everyone has them. So we must use them carefully and not waste them.\n\n### Looking After Our Things\n\nYour family works hard to buy your school things, clothes, and toys. If you look after them, they last a long time!\n\n**Tips for looking after your things:**\n- Keep your **books** clean — use a book cover\n- Hang up your **school uniform** — do not throw it on the floor\n- Put your **toys** back in the box after playing\n- Take care of your **shoes** — do not kick stones with them\n- Keep your **pencils** in a pencil case so they do not break'),
  q(3, 'Why is sharing a good thing?',
    ['It makes both people feel happy', 'It means you lose your things', 'Only the other person is happy', 'Sharing is not a good thing'], 0,
    'Sharing makes the giver and the receiver both feel good. The giver feels proud and kind, and the receiver feels cared for.'),
  fb(4, 'Using more than you need is called ___. You should always turn off the ___ when you are not using water.',
    ['wasting', 'tap'],
    'Wasting means using too much or throwing away things that are still good. Always turn off the tap to save water.'),
  t(5, '### Being Kind With What We Have\n\nYou do not need to be rich to be kind. Kindness is free!\n\nHere are some ways to be kind:\n\n- **Say "please" and "thank you"** — It costs nothing but means a lot.\n- **Help someone who is struggling** — Maybe a friend cannot carry their bag. Help them!\n- **Do not tease** someone who has less than you — Everyone deserves respect.\n- **Give away what you do not use** — Old toys and clothes can make another child very happy.\n- **Take turns** — Do not push in. Wait for your turn.\n\n**Story:**\nLindiwe got a new pencil case for her birthday. She noticed that her friend Thabo was writing with a broken pencil. Lindiwe took one of her good pencils and gave it to Thabo.\n\nThabo smiled and said "Thank you!" Lindiwe felt happy inside because she helped her friend.\n\nThat is what sharing and caring is all about!'),
  q(6, 'What should you do with clothes you have outgrown?',
    ['Give them to someone who can use them', 'Throw them in the bin', 'Keep them even though they do not fit', 'Leave them on the floor'], 0,
    'When clothes do not fit you anymore, giving them to someone who needs them is a wonderful way to share and care. It means less waste too!'),
  fb(7, 'To make your school books last, you should use a ___. To keep your pencils safe, put them in a ___.',
    ['book cover', 'pencil case'],
    'A book cover protects your books from getting dirty or torn. A pencil case keeps your pencils safe and stops them from breaking.'),
  q(8, 'Which of these is an example of WASTING?',
    ['Leaving the tap running while you talk', 'Turning off the light when you leave', 'Writing on both sides of the paper', 'Eating all the food on your plate'], 0,
    'Leaving the tap running when you are not using the water wastes our precious clean water. Always turn off the tap!'),
  t(9, '### Let Us Remember!\n\n| Word | What It Means |\n|------|---------------|\n| **Share** | Give some of what you have to others |\n| **Care** | Look after people and things around you |\n| **Waste** | Use more than you need or throw away good things |\n| **Kind** | Being nice and helpful to others |\n\n**Remember:** You do not need a lot of money to be a good person. Share what you can, care for your things, do not waste, and always be kind!\n\n**Fun activity:** Do one act of kindness today! Share something, help someone, or take extra good care of your things. Draw or write about it in your workbook.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 3
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
    tags: ['grade-3', 'ems', 'caps'],
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
      title: 'Chapter 1: What Do We Need?',
      description: 'Things we need every day (food, water, a home, clothes), things we want (toys, sweets, games), the difference between needs and wants, and making smart choices.',
      order: 1,
      lessons: [
        { title: 'What Do We Need?', description: 'Basic needs (food, water, home, clothes); wants (toys, sweets, games); telling needs from wants; choosing needs first; the golden rule of spending.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Our Money',
      description: 'South African coins (5c to R5), notes (R10 to R200), the Rand and cents, animals on our notes, and counting coins.',
      order: 2,
      lessons: [
        { title: 'Our Money', description: 'SA coins (5c, 10c, 20c, 50c, R1, R2, R5); SA notes (R10 to R200); the Big Five animals; Nelson Mandela; counting coins; which note is worth more.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Buying Things',
      description: 'Going to the shop, looking at prices, paying with money, getting change, and choosing what to buy when money is limited.',
      order: 3,
      lessons: [
        { title: 'Buying Things', description: 'Prices on items; paying with money; getting change; the change formula; choosing what to buy; checking if you have enough money.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Saving Money',
      description: 'Why we save, piggy banks and saving jars, saving for something special, being patient, and not spending all our money.',
      order: 4,
      lessons: [
        { title: 'Saving Money', description: 'What saving means; why we save; piggy banks and saving jars; setting a goal; being patient; saving a little every day; watching savings grow.', blocks: ch4_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 5: People Who Help Us',
      description: 'Jobs in our community (teacher, doctor, police officer, shopkeeper, farmer, taxi driver), how they help, why every job is important, and what we want to be.',
      order: 5,
      lessons: [
        { title: 'People Who Help Us', description: 'Jobs in our community; teacher, doctor, police officer, shopkeeper, farmer, taxi driver, nurse, firefighter; why people work; earning money; every job is important; what do you want to be.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Sharing and Caring',
      description: 'Sharing with others, not wasting food and water, looking after our things (books, uniform, toys), and being kind with what we have.',
      order: 6,
      lessons: [
        { title: 'Sharing and Caring', description: 'Why sharing makes everyone happy; not wasting food, water, paper, electricity; looking after school things and toys; being kind; acts of kindness.', blocks: ch6_lesson1, term: 4 },
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
    title: 'Grade 3 EMS \u2014 CAPS Textbook',
    description: 'Introductory CAPS-aligned textbook covering basic economic literacy for Grade 3 learners: needs and wants, South African money, buying things, saving, community helpers, and sharing and caring.',
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
  console.log('  TEXTBOOK: Grade 3 EMS');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
