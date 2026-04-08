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
// CHAPTER 1: Needs and Wants (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Needs and Wants ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Needs and Wants\n\nEvery day we use things — food, clothes, toys, and more. But did you know that some of these things are more important than others? In this lesson we will learn about **needs** and **wants** and why it is important to know the difference.\n\n### What Are Needs?\n\n**Needs** are things you MUST have to stay alive and healthy. Without your needs being met, you could become very sick or even die.\n\nHere are the basic needs every person has:\n\n| Basic Need | Why You Need It | Example |\n|-----------|----------------|--------|\n| **Food and water** | To give your body energy and keep you hydrated | Bread, pap, clean water |\n| **Shelter** | To protect you from sun, rain, and cold | A house, flat, or room |\n| **Clothing** | To cover and protect your body | School uniform, warm jersey |\n| **Health care** | To get better when you are sick | Visiting the clinic, medicine |\n\n### What Are Wants?\n\n**Wants** are things you would LIKE to have, but you can live without them. Wants make life more fun, but they are not essential.\n\n**Examples of wants:**\n- A new bicycle\n- Sweets from the tuck shop\n- A tablet or smartphone\n- Fancy sneakers\n- A trip to Gold Reef City'),
  t(2, '### How to Tell the Difference\n\nAsk yourself this question: **"Will I be okay without this?"**\n\n- If the answer is **NO** — it is a **need**.\n- If the answer is **YES** — it is a **want**.\n\n| Item | Need or Want? | Why? |\n|------|-------------|------|\n| A glass of clean water | Need | You cannot survive without water |\n| A can of Fanta | Want | It tastes nice but water keeps you alive |\n| A warm coat in winter | Need | You need warmth to stay healthy |\n| A brand-name hoodie | Want | A plain coat keeps you just as warm |\n| Pap and vegetables for supper | Need | Your body needs food to grow |\n| A bag of Simba chips | Want | Tasty, but not essential |\n\n### We Cannot Have Everything\n\nHave you ever walked through a shop and wanted to buy lots of things? Most people feel this way! Our wants are **unlimited** — they never stop.\n\nBut our money is **limited** — there is only so much to go around.\n\nThis means we have to **choose** what to spend our money on. The smart choice is: **needs first, wants second**.\n\n**Example:** Lerato has R50. She needs a new exercise book for school (R25) and she wants a lollipop (R10). She buys the exercise book first because it is a need. With the R25 left, she can choose whether to save or buy the lollipop.'),
  q(3, 'Which of these is a NEED?',
    ['A warm jersey in winter', 'A PlayStation game', 'A holiday to Durban', 'Designer sunglasses'], 0,
    'A warm jersey in winter protects you from cold and keeps you healthy. The other items are wants — nice to have, but not essential for survival.'),
  fb(4, 'Things we must have to survive are called ___. Things we would like but can live without are called ___.',
    ['needs', 'wants'],
    'Needs are essential for survival (food, water, shelter, clothing). Wants are extras that make life more enjoyable.'),
  t(5, '### Making Choices\n\nBecause we cannot have everything, we must **make choices**. When you choose one thing, you give up something else.\n\n**Example:**\nThemba has R20 pocket money. He can buy:\n- Option A: A vetkoek from the lady outside school (R20)\n- Option B: Two pencils he needs for class (R20)\n- Option C: A packet of sweets (R20)\n\nThemba chooses the pencils because he needs them for school. The vetkoek — his second choice — is what he gives up.\n\nThe thing you give up when you make a choice is called the **opportunity cost**. Themba\'s opportunity cost was the vetkoek.\n\n### Needs and Wants in South Africa\n\nIn South Africa, many families have to make hard choices every day. Some families struggle to afford even their basic needs.\n\n**How the government helps:**\n- The **child support grant** helps parents buy food and clothes for their children\n- **Free school meals** make sure learners get at least one healthy meal each day\n- **RDP houses** give families a safe place to live\n- **Free clinics** help people who cannot afford a private doctor'),
  q(6, 'Sihle has R30. She can buy a sandwich (R30), a comic book (R30), or hair clips (R30). She buys the sandwich. Her second choice was the comic book. What is her opportunity cost?',
    ['The comic book', 'The sandwich', 'The hair clips', 'R30'], 0,
    'Opportunity cost is the next best option you give up. Sihle\'s second choice was the comic book, so the comic book is her opportunity cost.'),
  fb(7, 'When you choose one thing and give up another, the thing you give up is called the ___. Our wants are ___ but our money is limited.',
    ['opportunity cost', 'unlimited'],
    'Opportunity cost is the next best alternative you give up when making a choice. Our wants never end (unlimited), but our resources are limited.'),
  q(8, 'Why must people choose what to spend their money on?',
    ['Because our wants are unlimited but our money is limited', 'Because shops only sell one item at a time', 'Because the government chooses for us', 'Because money expires after one week'], 0,
    'We have unlimited wants but limited money, so we must make choices about what is most important to buy.'),
  t(9, '### Summary\n\n| Key Word | Meaning |\n|---------|--------|\n| **Needs** | Things essential for survival — food, water, shelter, clothing, health care |\n| **Wants** | Things that are nice to have but not essential — toys, sweets, games |\n| **Unlimited wants** | Our wants never stop — we always want more |\n| **Limited money** | We only have a certain amount of money to spend |\n| **Opportunity cost** | The next best thing you give up when you make a choice |\n\n**Remember:** Always put needs first, then use what is left for wants!\n\n**Try this:** Draw two columns in your workbook. Label one "Needs" and the other "Wants". Write five items in each column from your own life.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Where Does Money Come From? (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Where Does Money Come From? ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Where Does Money Come From?\n\nMoney does not grow on trees! People must **work** to earn money. In this lesson we will learn about how people earn money and what the South African Rand is.\n\n### People Work to Earn Money\n\nWhen adults go to work, they do a job and get paid for it. The money they receive for working is called their **income**.\n\nDifferent people do different jobs and earn different amounts:\n\n| Job | What They Do | How They Help Us |\n|-----|-------------|------------------|\n| **Teacher** | Teaches children at school | Helps us learn and grow |\n| **Farmer** | Grows food like mealies, potatoes, and fruit | Gives us food to eat |\n| **Doctor** | Helps sick people get better | Keeps us healthy |\n| **Taxi driver** | Drives people where they need to go | Helps people get to work and school |\n| **Shop assistant** | Helps customers in a shop | Makes sure we find what we need |\n| **Police officer** | Keeps our community safe | Protects us from crime |\n| **Builder** | Builds houses, schools, and roads | Gives us places to live and learn |\n\n### How Workers Get Paid\n\nWorkers can be paid in different ways:\n\n| Type of pay | What it means | Example |\n|-----------|-------------|--------|\n| **Salary** | A fixed amount paid every month | A teacher earns a salary |\n| **Wage** | Paid by the hour or by the day | A farm worker earns a wage |\n| **Commission** | Paid based on how much you sell | A car salesperson earns commission |'),
  t(2, '### The South African Rand\n\nIn South Africa, our money is called the **Rand**. The symbol for the Rand is **R**.\n\nWe also use **cents**. There are 100 cents in one Rand.\n\n| Coins | Notes |\n|-------|-------|\n| 10c, 20c, 50c | R10 (green) |\n| R1, R2, R5 | R20 (brown) |\n| | R50 (red) |\n| | R100 (blue) |\n| | R200 (orange) |\n\n**Did you know?** The animals on our Rand notes are called the **Big Five**: the lion, elephant, rhino, buffalo, and leopard. These are famous South African animals!\n\n### Where Does Your Money Come From?\n\nAs a Grade 5 learner, you probably do not have a job yet. But you might get money from:\n\n- **Pocket money** — money your parents or guardians give you\n- **Gifts** — money you receive on your birthday or special occasions\n- **Doing chores** — helping around the house in exchange for a small payment\n- **Selling things** — selling biscuits, sweets, or crafts you have made\n\nNo matter where your money comes from, it is important to use it wisely!'),
  q(3, 'What is the money people receive for doing their job called?',
    ['Income', 'A gift', 'Pocket money', 'A fine'], 0,
    'Income is the money a person earns from working. Gifts and pocket money are other ways to receive money, but income specifically comes from work.'),
  fb(4, 'South African money is called the ___. The symbol we use is ___.',
    ['Rand', 'R'],
    'Our currency is the Rand, and we write it with the symbol R (for example, R50).'),
  t(5, '### Different Jobs, Different Pay\n\nNot all jobs pay the same amount. Some jobs pay more because they:\n- Need many years of studying (like a doctor)\n- Are very dangerous (like a mine worker)\n- Require special skills (like a pilot)\n\n**Example earnings in South Africa:**\n\n| Job | Approximate monthly pay |\n|-----|------------------------|\n| Farm worker | R4 000 – R5 000 |\n| Shop assistant | R5 000 – R7 000 |\n| Teacher | R15 000 – R25 000 |\n| Nurse | R12 000 – R20 000 |\n| Doctor | R40 000 – R80 000 |\n\n*These are approximate amounts — actual pay varies.*\n\n### Why All Jobs Are Important\n\nSome people think only high-paying jobs are important. But that is not true!\n\n- Without **cleaners**, our schools and hospitals would be dirty and unsafe\n- Without **farmers**, we would have no food\n- Without **taxi drivers**, millions of South Africans could not get to work\n- Without **builders**, we would have no homes or schools\n\nEvery single job helps our community work. We should **respect all workers**, no matter what job they do.'),
  q(6, 'A person who gets paid based on how many hours they work earns a:',
    ['Wage', 'Salary', 'Commission', 'Bonus'], 0,
    'A wage is payment based on hours or days worked. A salary is a fixed monthly amount, and commission is based on sales.'),
  fb(7, 'A ___ is a fixed amount paid every month. A ___ is paid based on the number of hours worked.',
    ['salary', 'wage'],
    'Salary is a set monthly payment regardless of hours (like a teacher). A wage is calculated per hour or per day (like a farm worker).'),
  q(8, 'Which animals appear on South African Rand bank notes?',
    ['The Big Five — lion, elephant, rhino, buffalo, leopard', 'Dogs, cats, and rabbits', 'Eagles, hawks, and owls', 'Sharks, dolphins, and whales'], 0,
    'The Big Five (lion, elephant, rhino, buffalo, and leopard) appear on South African bank notes.'),
  t(9, '### Summary\n\n| Key Word | Meaning |\n|---------|--------|\n| **Income** | Money earned from working |\n| **Salary** | A fixed amount of pay received every month |\n| **Wage** | Pay based on hours or days worked |\n| **Commission** | Pay based on how much you sell |\n| **Rand (R)** | South Africa\'s currency |\n| **Cents (c)** | 100 cents = 1 Rand |\n\n**Remember:** Money is earned through hard work. Every job — big or small — is important to our community.\n\n**Try this:** Ask three adults you know what jobs they do and how their work helps people. Write their answers in your workbook.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Spending and Saving (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Spending and Saving ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Spending and Saving\n\nNow that we know where money comes from, let us learn about what to do with it! There are two main things you can do with money: **spend** it or **save** it. Smart people learn to do both.\n\n### Why We Spend Money\n\nWe spend money to buy the things we need and want:\n- **Needs:** food, school fees, transport, clothing\n- **Wants:** toys, sweets, games, outings\n\n### Keeping Track of Spending\n\nDo you know where your money goes? Many people spend money without thinking and then wonder where it all went!\n\nA good habit is to **write down everything you spend**. This is called keeping a **spending record**.\n\n**Example — Palesa\'s spending for the week:**\n\n| Day | What she bought | Amount |\n|-----|----------------|--------|\n| Monday | Vetkoek at school | R10 |\n| Tuesday | Nothing | R0 |\n| Wednesday | Chips and juice | R15 |\n| Thursday | Hair band | R12 |\n| Friday | Sweets | R8 |\n| **Total** | | **R45** |\n\nPalesa started the week with R50. She spent R45 and has only R5 left. If she had saved more, she could buy something bigger at the end of the month!'),
  t(2, '### Why Saving Is Important\n\n**Saving** means keeping some of your money instead of spending it all. Saving is one of the smartest money habits you can learn!\n\n**Reasons to save:**\n\n| Reason | Explanation |\n|--------|------------|\n| **Emergencies** | If something unexpected happens (like your shoes break), you have money to fix it |\n| **Big goals** | You can save up for something special — like a new bag or a book |\n| **The future** | Saving now means you will have more money later |\n| **Peace of mind** | Knowing you have savings makes you feel safe |\n\n### Where Can You Save Money?\n\nThere are different places to keep your savings:\n\n| Place | Good for | How it works |\n|-------|---------|-------------|\n| **Piggy bank or jar** | Small amounts at home | Drop coins in every day — do not open until it is full! |\n| **Savings envelope** | Keeping money safe at home | Label it with your goal (e.g., "New book — R80") |\n| **Bank savings account** | Bigger amounts, long-term saving | A bank keeps your money safe and can even pay you extra money called **interest** |\n\n### What Is Interest?\n\nWhen you put money in a bank savings account, the bank uses your money to help other people. As a thank-you, the bank pays you a little extra money. This extra money is called **interest**.\n\n**Example:** You save R100 in the bank. After one year, the bank gives you R5 interest. You now have R105 — your money grew without you doing anything!'),
  q(3, 'What is the main reason for saving money?',
    ['To have money for emergencies and future goals', 'To show off to your friends', 'Because spending money is not allowed', 'To make the bank happy'], 0,
    'Saving money helps you prepare for emergencies, reach your goals, and have money for the future. It is a smart habit, not something you do for others.'),
  fb(4, 'Writing down everything you spend is called keeping a ___. Extra money the bank pays you for saving is called ___.',
    ['spending record', 'interest'],
    'A spending record helps you track where your money goes. Interest is the extra money a bank pays you for keeping your savings with them.'),
  t(5, '### Saving for a Goal\n\nSaving is easier when you have a **goal** — something specific you are saving for.\n\n**Steps to save for a goal:**\n\n1. **Decide what you want** — for example, a new school bag that costs R120\n2. **Find out how much it costs** — R120\n3. **Decide how long you will save** — 4 weeks\n4. **Work out how much to save each week** — R120 ÷ 4 = R30 per week\n5. **Stick to your plan!**\n\n**Ayanda\'s savings plan:**\n\n| Week | Amount saved | Total so far |\n|------|-------------|-------------|\n| Week 1 | R30 | R30 |\n| Week 2 | R30 | R60 |\n| Week 3 | R30 | R90 |\n| Week 4 | R30 | R120 |\n\nAfter 4 weeks, Ayanda has R120 and can buy the school bag!\n\n### The 50-30-20 Idea\n\nHere is a simple way to divide your money:\n\n| Portion | What it is for | Example (if you get R100) |\n|---------|---------------|-------------------------|\n| **50%** | Needs (things you must have) | R50 for school supplies |\n| **30%** | Wants (things you would like) | R30 for a treat |\n| **20%** | Savings (put it away) | R20 saved for later |'),
  q(6, 'Buhle wants to save R80 for a book. She can save R20 per week. How many weeks will it take?',
    ['4 weeks', '3 weeks', '5 weeks', '2 weeks'], 0,
    'R80 ÷ R20 per week = 4 weeks. Buhle needs to save for 4 weeks to reach her goal.'),
  fb(7, 'To save for a goal, you should ___ your plan. In the 50-30-20 idea, ___% of your money goes to savings.',
    ['stick to', '20'],
    'Discipline is key — you must stick to your savings plan. The 50-30-20 rule says 20% of your money should go into savings.'),
  q(8, 'Where is the SAFEST place to save a large amount of money?',
    ['A bank savings account', 'Under your pillow', 'In your school bag', 'In your pocket'], 0,
    'A bank savings account is the safest place for large amounts because the bank protects your money and even pays you interest.'),
  t(9, '### Summary\n\n| Key Word | Meaning |\n|---------|--------|\n| **Spending** | Using money to buy goods and services |\n| **Spending record** | Writing down what you spend to track your money |\n| **Saving** | Keeping money instead of spending it all |\n| **Interest** | Extra money the bank pays you for saving with them |\n| **Savings goal** | A specific thing you are saving up to buy |\n\n**Golden rule:** Do not spend everything you get. Always put something aside for saving!\n\n**Try this:** Start a savings jar at home. Each week, put in whatever you can — even R2 or R5. After one month, count how much you have saved!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Goods and Services (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Goods and Services ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Goods and Services\n\nWhen you go to a shop or visit a doctor, you are taking part in the **economy**. The economy is all about people making, selling, and buying things. Everything in the economy can be divided into two groups: **goods** and **services**.\n\n### What Are Goods?\n\n**Goods** are things you can **touch, hold, and keep**. When you buy a good, you own it.\n\n**Examples of goods:**\n\n| Good | Where you buy it |\n|------|------------------|\n| A loaf of bread | Shoprite, Pick n Pay, Spar |\n| A school uniform | a clothing shop or school |\n| A cell phone | Vodacom, MTN, or a phone shop |\n| A bicycle | a sports or toy shop |\n| A pencil | a stationery shop |\n\n### What Are Services?\n\n**Services** are things that people **do for you**. You cannot touch or hold a service — you experience it.\n\n**Examples of services:**\n\n| Service | Who provides it |\n|---------|----------------|\n| Teaching you at school | Your teacher |\n| Cutting your hair | A barber or hairdresser |\n| Driving you in a taxi | A taxi driver |\n| Checking your health | A doctor or nurse |\n| Fixing a leaking tap | A plumber |'),
  t(2, '### The Big Difference\n\n| | Goods | Services |\n|--|-------|----------|\n| **Can you touch it?** | Yes — goods are physical | No — services are actions |\n| **Can you keep it?** | Yes — you take it home | No — once it is done, it is done |\n| **Can you store it?** | Yes — put it on a shelf | No — you cannot save a haircut for later |\n| **Example** | Buying chips at the tuck shop | Getting a ride in a taxi |\n\n### Shops and Businesses in Our Community\n\nLook around your community. You will see many businesses that provide goods, services, or both!\n\n| Business | Goods, services, or both? | What they provide |\n|----------|--------------------------|-------------------|\n| **Spaza shop** | Goods | Bread, milk, airtime, snacks |\n| **Hair salon** | Services | Haircuts, braiding, styling |\n| **Garage (petrol station)** | Both | Petrol (good) + car wash (service) |\n| **Shoprite** | Goods | Groceries, household items |\n| **Clinic** | Services | Health check-ups, medicine |\n| **Restaurant** | Both | Food (good) + cooking and serving (service) |\n\n### Paying for Goods and Services\n\nWhen you buy goods or services, you pay for them using money. You can pay in different ways:\n\n- **Cash** — Rand notes and coins\n- **Bank card** — swiping or tapping your card at a machine\n- **EFT (Electronic Funds Transfer)** — sending money from your bank account online\n- **Mobile money** — using apps on your phone'),
  q(3, 'Which of the following is a GOOD?',
    ['A loaf of bread', 'A taxi ride', 'A haircut', 'A doctor\'s check-up'], 0,
    'A loaf of bread is a good because you can touch it, hold it, and take it home. The other options are services — actions people do for you.'),
  fb(4, 'Things you can touch and keep are called ___. Things people do for you are called ___.',
    ['goods', 'services'],
    'Goods are physical items you can hold (like bread or shoes). Services are actions done for you (like a haircut or taxi ride).'),
  t(5, '### Getting Value for Money\n\nWhen you buy something, you want to make sure you are getting **value for money**. This means the item or service is worth what you paid for it.\n\n**How to get value for money:**\n\n| Tip | Explanation |\n|-----|------------|\n| **Compare prices** | The same item may cost less at a different shop |\n| **Check quality** | A cheap item that breaks quickly is not good value |\n| **Look for specials** | Shops often have sales where things cost less |\n| **Read the label** | Check what you are getting — size, ingredients, expiry date |\n| **Ask yourself: Do I need this?** | If you do not need it, even a cheap price is wasting money |\n\n**Example:**\nThabo wants to buy a juice:\n- Spar: R12 for 500ml\n- Shoprite: R10 for 500ml (on special)\n- Tuck shop: R15 for 500ml\n\nThe best value is at Shoprite because the same juice costs the least there.'),
  q(6, 'A spaza shop that sells bread and cool drinks provides:',
    ['Goods', 'Services', 'Both goods and services', 'Neither'], 0,
    'A spaza shop sells physical items (bread, cool drinks) that you can touch and take home. These are goods.'),
  fb(7, 'When you compare prices and quality to make sure something is worth the money, you are looking for ___ for money. A business that sells physical items provides ___.',
    ['value', 'goods'],
    'Value for money means the item is worth what you paid. Physical items you can touch and take home are called goods.'),
  q(8, 'Which is NOT a way to pay for goods in South Africa?',
    ['Paying with buttons', 'Paying with cash', 'Paying by bank card', 'Paying by EFT'], 0,
    'Buttons are not a form of payment! In South Africa, you can pay with cash (Rand), bank cards, EFT, or mobile money.'),
  t(9, '### Summary\n\n| Key Word | Meaning |\n|---------|--------|\n| **Goods** | Physical things you can touch, hold, and keep |\n| **Services** | Actions or tasks people do for you |\n| **Business** | A place that sells goods, services, or both |\n| **Value for money** | Getting something that is worth the price you paid |\n\n**Remember:** Before buying, always compare prices and ask yourself if you really need the item!\n\n**Try this:** Walk through your neighbourhood or local shops. Make a list of five businesses. Write down whether each one sells goods, services, or both.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Buying and Selling (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Buying and Selling ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Buying and Selling\n\nEvery time you buy something — a packet of chips, a cool drink, or a pencil — you are taking part in **buying and selling**. In this lesson, we will learn how shops work, what profit means, and how to be a smart buyer.\n\n### How Shops Work\n\nA shop owner does not get goods for free. They have to **buy** the goods first, and then **sell** them to you at a higher price.\n\n**The two important prices:**\n\n| Price | What it means | Example |\n|-------|-------------|--------|\n| **Cost price** | The price the shop owner pays to buy the goods | The shop buys a chocolate for R8 |\n| **Selling price** | The price you pay when you buy it from the shop | The shop sells the chocolate to you for R12 |\n\n### What Is Profit?\n\n**Profit** is the money a shop owner makes after paying for the goods. It is the difference between the selling price and the cost price.\n\n**The profit formula:**\n\n> **Profit = Selling Price − Cost Price**\n\n**Example:**\n- A tuck shop buys a packet of chips for **R5** (cost price)\n- The tuck shop sells it for **R8** (selling price)\n- Profit = R8 − R5 = **R3**\n\nThe tuck shop earns R3 profit on each packet of chips sold.'),
  t(2, '### Why Things Cost Different Amounts\n\nHave you ever wondered why some things are expensive and others are cheap? Here are some reasons:\n\n| Reason | Explanation | Example |\n|--------|-----------|--------|\n| **How much it costs to make** | Items that cost more to produce cost more to buy | A leather bag costs more than a plastic bag |\n| **How rare it is** | Things that are hard to find cost more | Gold costs more than sand |\n| **Brand name** | Famous brands charge more for their name | Nike sneakers vs no-name sneakers |\n| **Where you buy it** | Prices differ from shop to shop | A cool drink at a movie theatre costs more than at a supermarket |\n| **Supply and demand** | If many people want it but there is not much of it, the price goes up | Umbrellas cost more when it rains |\n\n### Comparing Prices — Being a Smart Buyer\n\nA **smart buyer** does not just buy the first thing they see. They compare prices and think before spending.\n\n**Example:**\nNaledi wants to buy a school bag. She checks three shops:\n\n| Shop | Price |\n|------|-------|\n| PEP | R89 |\n| Ackermans | R110 |\n| Checkers | R95 |\n\nThe cheapest is PEP at R89. But Naledi also checks the quality — the PEP bag looks strong and has good zips. It is the best value for money!\n\n**Tips for smart buying:**\n1. **Compare** — check at least two shops before buying\n2. **Wait for sales** — shops often reduce prices on specials\n3. **Check quality** — a cheap item that breaks quickly wastes money\n4. **Make a list** — decide what you need BEFORE you go shopping\n5. **Avoid impulse buying** — do not buy just because something looks nice'),
  q(3, 'A shop buys sweets for R4 each and sells them for R7 each. What is the profit per sweet?',
    ['R3', 'R4', 'R7', 'R11'], 0,
    'Profit = Selling Price - Cost Price = R7 - R4 = R3. The shop earns R3 profit on each sweet.'),
  fb(4, 'The price a shop pays to buy goods is called the ___. The extra money the shop earns after selling is called ___.',
    ['cost price', 'profit'],
    'Cost price is what the shop owner pays for the goods. Profit is the difference between the selling price and the cost price.'),
  t(5, '### Let Us Calculate Profit\n\nPractise working out the profit for these items:\n\n| Item | Cost Price | Selling Price | Profit |\n|------|-----------|--------------|--------|\n| Lollipop | R2 | R5 | R5 − R2 = **R3** |\n| Cool drink | R6 | R10 | R10 − R6 = **R4** |\n| Biscuits | R8 | R12 | R12 − R8 = **R4** |\n| Sandwich | R15 | R25 | R25 − R15 = **R10** |\n| Popcorn | R3 | R7 | R7 − R3 = **R4** |\n\n### What Happens When a Business Does NOT Make Profit?\n\nIf the cost price is **higher** than the selling price, the business makes a **loss**.\n\n> **Loss = Cost Price − Selling Price** (when cost price is higher)\n\n**Example:**\nA shop buys oranges for R10 per bag. The oranges start to rot before they sell, so the shop drops the price to R6. \n\nLoss = R10 − R6 = **R4 loss**\n\nIf a business keeps making losses, it will run out of money and have to **close down**. That is why shop owners must be careful about what they buy and how they price their goods.'),
  q(6, 'A tuck shop buys a pie for R12 and sells it for R20. What is the profit?',
    ['R8', 'R12', 'R20', 'R32'], 0,
    'Profit = Selling Price - Cost Price = R20 - R12 = R8.'),
  fb(7, 'Profit = Selling Price minus ___. When a shop sells for less than it paid, it makes a ___.',
    ['Cost Price', 'loss'],
    'Profit is calculated as Selling Price minus Cost Price. If the selling price is lower than the cost price, the result is a loss.'),
  q(8, 'Which of these is good advice for a smart buyer?',
    ['Compare prices at different shops before buying', 'Always buy the most expensive option', 'Buy things as soon as you see them', 'Never check the quality of an item'], 0,
    'A smart buyer compares prices at different shops to find the best value for money.'),
  t(9, '### Summary\n\n| Key Word | Meaning |\n|---------|--------|\n| **Cost price** | The price a shop pays to buy goods from a supplier |\n| **Selling price** | The price you pay when you buy from the shop |\n| **Profit** | Selling price minus cost price — the money the shop earns |\n| **Loss** | When the cost price is more than the selling price — the shop loses money |\n| **Smart buyer** | A person who compares prices, checks quality, and thinks before spending |\n\n**Remember:** Profit = Selling Price − Cost Price. Always compare before you buy!\n\n**Try this:** Next time you visit a shop, check the price of the same item (like bread or milk) at two different shops. Which shop offers the better price?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: People Who Help Us (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: People Who Help Us ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## People Who Help Us\n\nOur communities work because of the many **workers** who keep everything running. From the police officer on the street to the nurse at the clinic, community workers help us every day. In this lesson, we will learn about these workers, how they are paid, and why their jobs matter.\n\n### Community Workers\n\nCommunity workers provide **services** that help keep our community safe, healthy, and running smoothly.\n\n| Worker | What They Do | Where They Work |\n|--------|------------|----------------|\n| **Police officer** | Protects people from crime, keeps communities safe | Police station, on patrol |\n| **Nurse** | Looks after sick and injured people | Clinic, hospital |\n| **Teacher** | Educates children and helps them learn | School |\n| **Firefighter** | Puts out fires, rescues people from danger | Fire station |\n| **Paramedic** | Gives emergency medical help and takes people to hospital | Ambulance |\n| **Librarian** | Helps people find books and information | Library |\n| **Social worker** | Helps families and children in difficult situations | Community centre, government office |\n| **Street sweeper** | Keeps our roads and pavements clean | Streets, public areas |\n\n### How Are Community Workers Paid?\n\nMany community workers are paid by the **government**. The government gets its money from **taxes** — money that working adults and businesses must pay.\n\n| Who pays tax? | What kind of tax? |\n|-------------|------------------|\n| People who earn a salary or wage | **Income tax** — a portion of their earnings |\n| Everyone who buys goods and services | **VAT (Value Added Tax)** — 15% added to the price of most items |\n| Businesses | **Company tax** — a portion of their profits |'),
  t(2, '### Why These Jobs Are Important\n\nImagine what would happen without community workers:\n\n| Without this worker... | What would happen? |\n|-----------------------|-------------------|\n| No police officers | Crime would increase and people would feel unsafe |\n| No nurses or doctors | Sick people would have no one to help them |\n| No teachers | Children would not learn to read, write, or do maths |\n| No firefighters | Fires would burn uncontrolled and destroy homes |\n| No refuse collectors | Rubbish would pile up, causing disease |\n| No road workers | Roads would be full of potholes and dangerous |\n\n### Government Services\n\nThe government uses tax money to provide **basic services** for everyone:\n\n| Service | What the government provides |\n|---------|-----------------------------|\n| **Education** | Public schools, teacher salaries, school books |\n| **Health care** | Public hospitals, clinics, medicine |\n| **Safety** | Police, fire brigades, traffic officers |\n| **Water and electricity** | Clean water supply, electricity through Eskom |\n| **Roads and transport** | Building and fixing roads, public buses |\n| **Social grants** | Money for pensioners, disabled people, and families with children |\n\n**Social grants in South Africa:**\n- **Child Support Grant** — helps parents care for their children\n- **Old Age Pension** — helps elderly people who are retired\n- **Disability Grant** — helps people who cannot work because of a disability'),
  q(3, 'Where does the government get money to pay community workers like police officers and teachers?',
    ['From taxes that people and businesses pay', 'From printing more money', 'From borrowing from other countries only', 'From selling sweets'], 0,
    'The government pays community workers using tax money. People pay income tax on their earnings, and everyone pays VAT when they buy goods and services.'),
  fb(4, 'The tax added to the price of most goods and services in South Africa is called ___. It is currently ___% of the price.',
    ['VAT', '15'],
    'VAT (Value Added Tax) is 15% and is added to the price of most goods and services in South Africa.'),
  t(5, '### Respecting All Workers\n\nEvery worker — no matter what their job is — deserves **respect**. Here are some ways to show respect to community workers:\n\n| Worker | How to show respect |\n|--------|--------------------|\n| **Teacher** | Listen in class, do your homework, say "thank you" |\n| **Police officer** | Follow the rules, be polite when they speak to you |\n| **Cleaner** | Do not litter, keep your classroom tidy |\n| **Nurse** | Be patient at the clinic, follow their instructions |\n| **Taxi driver** | Be polite, pay your fare, do not damage the vehicle |\n\n### Volunteering — Helping Without Being Paid\n\nSome people help their community without getting paid. This is called **volunteering**.\n\n**Examples of volunteering in South Africa:**\n- Helping at a soup kitchen that feeds hungry people\n- Cleaning up litter in your neighbourhood\n- Reading to younger children at the library\n- Helping elderly neighbours carry their shopping\n\nVolunteering does not earn you money, but it makes your community a better place — and it feels great too!'),
  q(6, 'Which of the following is a social grant provided by the South African government?',
    ['Child Support Grant', 'Pocket Money Grant', 'Tuck Shop Grant', 'Holiday Grant'], 0,
    'The Child Support Grant is a real social grant provided by the South African government to help parents care for their children.'),
  fb(7, 'Helping your community without being paid is called ___. Community workers like police and teachers are paid using ___ money.',
    ['volunteering', 'tax'],
    'Volunteering means helping others for free. Government workers are paid with money collected from taxes.'),
  q(8, 'Why is it important to respect ALL workers, even those with "small" jobs?',
    ['Because every job helps keep the community running', 'Because they will give you free things', 'Because it is a school rule only', 'Because their jobs are easy'], 0,
    'Every single job — from street sweeper to doctor — plays an important role in keeping our community safe, clean, and running smoothly.'),
  t(9, '### Summary\n\n| Key Word | Meaning |\n|---------|--------|\n| **Community workers** | People whose jobs help keep the community running |\n| **Taxes** | Money that people and businesses pay to the government |\n| **VAT** | Value Added Tax — 15% added to most goods and services |\n| **Income tax** | Tax taken from a worker\'s salary or wage |\n| **Social grants** | Government payments to help people who need support |\n| **Volunteering** | Helping your community without being paid |\n\n**Remember:** Taxes pay for important services. Respect every worker — they all make a difference!\n\n**Try this:** Choose one community worker (nurse, police officer, teacher, etc.). Write five sentences about why their job is important.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Taking Care of Our Things (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Taking Care of Our Things ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Taking Care of Our Things\n\nEverything we own cost money — your school shoes, your books, your bag, and even the desk you sit at in class. In this lesson, we will learn why it is important to **look after our belongings** and share resources wisely.\n\n### Why Looking After Our Belongings Matters\n\nWhen we take care of our things, they **last longer**. This means we do not have to spend more money to replace them.\n\n| If you... | Then... |\n|-----------|--------|\n| Look after your school shoes | They last the whole year |\n| Throw your shoes around and get them wet | They break and you need new ones — more money! |\n| Cover your textbooks with plastic | They stay neat and can be used next year |\n| Leave your books in the rain | They get damaged and must be replaced |\n\n**Example:**\nThandi\'s school shoes cost R350. She looks after them — polishes them every week and does not play in them. They last the whole year.\n\nHer friend Zinhle does not look after her shoes. After 4 months, they are torn and she needs a new pair — another R350.\n\n**Thandi spent: R350 for the year**\n**Zinhle spent: R350 + R350 = R700 for the year**\n\nBy looking after her things, Thandi saved R350 that her family could use for other needs.\n\n### Tips for Looking After Your Belongings\n\n| Belonging | How to look after it |\n|-----------|---------------------|\n| **School shoes** | Polish them, do not play sport in them |\n| **School bag** | Do not drag it on the ground, close zips properly |\n| **Textbooks** | Cover them with plastic, do not write in them |\n| **Uniform** | Hang it up after school, do not play in it |\n| **Stationery** | Keep pencils in a pencil bag, put lids on pens |'),
  t(2, '### Sharing Resources\n\nNot everyone can afford to have everything they need. **Sharing** means allowing other people to use something you have.\n\n**Examples of sharing at school:**\n- Sharing a textbook with a classmate who does not have one\n- Lending a pen to a friend\n- Taking turns on the school computer\n- Sharing your snack with a friend who has no food\n\n**Rules for sharing:**\n1. Ask before borrowing someone else\'s things\n2. Take care of borrowed items — treat them as well as your own\n3. Return things on time and in good condition\n4. Say "thank you" when someone shares with you\n\n### Borrowing and Returning\n\nBorrowing is when someone lets you use their things for a while. It comes with **responsibility**.\n\n| Good borrowing | Bad borrowing |\n|---------------|---------------|\n| Ask politely before taking | Take without asking |\n| Look after the item | Use it roughly and damage it |\n| Return it on time | Keep it and "forget" to give it back |\n| Return it in the same condition | Return it broken or dirty |\n\n**Think about this:** If you borrow a friend\'s book and tear the pages, will they want to lend you things again? Probably not! Being a good borrower means people will **trust** you.'),
  q(3, 'Thandi\'s shoes last the whole year because she looks after them. Her shoes cost R350. If she did NOT look after them and had to buy a second pair, how much MORE would she spend?',
    ['R350', 'R700', 'R175', 'R0'], 0,
    'If Thandi needs to buy a second pair at R350, that is R350 more than if she had looked after the first pair.'),
  fb(4, 'When we look after our belongings, they last ___. When we borrow something, we must ___ it on time and in good condition.',
    ['longer', 'return'],
    'Taking care of our things makes them last longer, saving money. Borrowed items must always be returned on time and in the same condition.'),
  t(5, '### Waste Not, Want Not\n\nThis old saying means: if you do not waste things, you will always have what you need.\n\n**Types of waste and how to avoid them:**\n\n| Type of waste | What happens | How to avoid it |\n|-------------|-------------|----------------|\n| **Food waste** | Throwing away food you did not finish | Take only what you can eat, use leftovers |\n| **Water waste** | Leaving taps running, long showers | Turn off taps, take shorter showers |\n| **Electricity waste** | Leaving lights and TVs on in empty rooms | Switch off when you leave a room |\n| **Paper waste** | Using paper once and throwing it away | Write on both sides, recycle |\n| **Money waste** | Buying things you do not need or use | Think before you buy — do you really need it? |\n\n**In South Africa, we face challenges with water and electricity (load shedding). That is why saving these resources is so important!**\n\n### Reusing and Recycling\n\n**Reusing** means using something again instead of throwing it away.\n**Recycling** means turning old materials into new products.\n\n| Material | How to recycle or reuse |\n|----------|------------------------|\n| **Plastic bottles** | Recycle at a depot, or reuse as a water bottle |\n| **Newspapers** | Recycle, or use to wrap things or start a fire safely |\n| **Glass jars** | Reuse for storing food, or recycle |\n| **Cardboard boxes** | Recycle, or reuse for storage or school projects |\n| **Old clothes** | Donate to charity, or cut up for cleaning cloths |'),
  q(6, 'What does the saying "Waste not, want not" mean?',
    ['If you do not waste things, you will always have what you need', 'You should want everything you see', 'Waste is not a problem', 'You should not want anything'], 0,
    '"Waste not, want not" means if you are careful not to waste your resources, you will always have enough.'),
  fb(7, 'Using something again instead of throwing it away is called ___. Turning old materials into new products is called ___.',
    ['reusing', 'recycling'],
    'Reusing means using an item again for the same or a different purpose. Recycling means processing old materials to make new products.'),
  q(8, 'Which of these is an example of REUSING?',
    ['Using a glass jar to store pencils', 'Throwing away an empty bottle', 'Buying a new lunch box every week', 'Leaving the tap running'], 0,
    'Using a glass jar to store pencils is reusing — you are giving the jar a new purpose instead of throwing it away.'),
  t(9, '### Summary\n\n| Key Word | Meaning |\n|---------|--------|\n| **Looking after belongings** | Taking care of the things you own so they last longer |\n| **Sharing** | Allowing others to use what you have |\n| **Borrowing** | Using something that belongs to someone else, then returning it |\n| **Waste** | Using more than you need, or throwing things away carelessly |\n| **Reusing** | Using something again instead of throwing it away |\n| **Recycling** | Turning old materials into new products |\n\n**Remember:** Take care of what you have, share when you can, and reduce waste!\n\n**Try this:** Find three items at home that you would normally throw away. Think of a way to reuse each one. Write your ideas in your workbook.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: My Own Business (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: My Own Business ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## My Own Business\n\nHave you ever thought about starting your own small business? Maybe selling biscuits, making friendship bracelets, or running a lemonade stand? In this lesson, we will learn what a business is, how to plan one, and how to count your money!\n\n### What Is a Business?\n\nA **business** is any activity where someone sells goods or services to earn money.\n\nBusinesses can be big or small:\n\n| Size | Examples |\n|------|----------|\n| **Big businesses** | Shoprite, Woolworths, MTN, Sasol |\n| **Medium businesses** | A restaurant in town, a clothing factory |\n| **Small businesses** | A spaza shop, a hairdresser working from home |\n| **Micro businesses** | A learner selling sweets at school, a car washer |\n\nAll of these are businesses! The person who starts and runs a business is called an **entrepreneur**.\n\n### South African Entrepreneurs\n\nSome of South Africa\'s most successful businesses started very small:\n\n| Entrepreneur | Business | How they started |\n|-------------|---------|------------------|\n| **Herman Mashaba** | Black Like Me hair products | Started making hair products in his kitchen |\n| **Raymond Ackerman** | Pick n Pay | Bought a few small shops and grew them into a huge chain |\n| **Nicky Memory** | Street vendor | Started by selling snacks on the street, now runs a food business |\n\n**Lesson:** You do not need a lot of money to start a business. You need a good idea, hard work, and determination!'),
  t(2, '### Selling Things at School — The Tuck Shop\n\nThe school tuck shop is a great example of a small business. Let us see how it works:\n\n**Step 1: Buy stock (goods to sell)**\n- The tuck shop owner buys chips, sweets, juice, and sandwiches from a wholesaler at a low **cost price**.\n\n**Step 2: Set a selling price**\n- The selling price must be **higher** than the cost price, so the tuck shop makes a **profit**.\n\n**Step 3: Sell to customers**\n- Learners and teachers buy the items during break time.\n\n**Example:**\n\n| Item | Cost price | Selling price | Profit per item |\n|------|-----------|--------------|----------------|\n| Packet of chips | R4 | R7 | R3 |\n| Lollipop | R1.50 | R3 | R1.50 |\n| Juice box | R5 | R9 | R4 |\n| Sandwich | R12 | R20 | R8 |\n\n### Making Things to Sell\n\nYou do not have to buy goods to resell — you can **make** things and sell them!\n\n**Ideas for things you can make and sell:**\n\n| Product | What you need | Who would buy it |\n|---------|-------------|------------------|\n| **Friendship bracelets** | String, beads | Classmates |\n| **Bookmarks** | Card, markers, stickers | Friends, teachers |\n| **Baked goods** | Flour, sugar, eggs | Neighbours, classmates |\n| **Greeting cards** | Paper, pens, creativity | Parents, neighbours |\n| **Plant pots** | Recycled tins, paint, small plants | Adults in the community |'),
  q(3, 'What do we call a person who starts and runs a business?',
    ['An entrepreneur', 'A customer', 'A teacher', 'A bank manager'], 0,
    'An entrepreneur is someone who starts and runs a business. They take a business idea and turn it into reality.'),
  fb(4, 'For a tuck shop to make a profit, the ___ must be higher than the cost price. A person who starts a business is called an ___.',
    ['selling price', 'entrepreneur'],
    'Profit only happens when the selling price is higher than the cost price. The person who starts and runs a business is an entrepreneur.'),
  t(5, '### Planning a Small Business\n\nBefore starting a business, you need a **plan**. Here is a simple business plan:\n\n**1. What will I sell?**\nDecide on your product or service.\n*Example: I will sell homemade popcorn.*\n\n**2. Who will buy it?**\nThink about your **customers**.\n*Example: Learners at school during break time.*\n\n**3. What do I need to get started?**\nList the things you need and how much they cost.\n\n| Item needed | Cost |\n|------------|------|\n| Popcorn kernels (1 kg bag) | R25 |\n| Cooking oil | R15 |\n| Salt | R5 |\n| Paper bags (20) | R10 |\n| **Total start-up cost** | **R55** |\n\n**4. What will I charge?**\nSet your selling price. Each bag of popcorn will sell for **R5**.\n\n**5. How much profit will I make?**\nFrom R55, you can make about 20 bags of popcorn.\n- Income from sales: 20 bags × R5 = **R100**\n- Cost of supplies: **R55**\n- **Profit = R100 − R55 = R45**\n\nYou would earn R45 profit! You could use some for yourself, save some, and use some to buy more supplies and keep the business going.'),
  q(6, 'You buy supplies for R55 and sell 20 bags of popcorn at R5 each. What is your total profit?',
    ['R45', 'R55', 'R100', 'R5'], 0,
    'Total sales = 20 × R5 = R100. Profit = R100 - R55 (cost) = R45.'),
  t(7, '### Counting Your Money — Keeping Records\n\nA good business owner always knows exactly how much money comes in and goes out. This is called **record keeping**.\n\n**Simple record for a popcorn business:**\n\n| Date | Money IN (sales) | Money OUT (costs) | Notes |\n|------|-----------------|-------------------|-------|\n| Monday | R25 (5 bags sold) | R0 | Good day! |\n| Tuesday | R15 (3 bags sold) | R0 | Rainy day, fewer sales |\n| Wednesday | R30 (6 bags sold) | R0 | Best day so far |\n| Thursday | R20 (4 bags sold) | R0 | Average day |\n| Friday | R10 (2 bags sold) | R0 | Most learners go home early |\n| **Week total** | **R100** | **R55** (original supplies) | |\n| **Profit** | **R100 − R55 = R45** | | |\n\n### Challenges of Running a Business\n\nRunning a business is not always easy:\n\n| Challenge | How to handle it |\n|-----------|------------------|\n| Not enough customers | Tell more people about your product, make it better |\n| Running out of stock | Plan ahead and buy enough supplies |\n| Competition | Make your product special — better quality, better price |\n| Keeping track of money | Write down every sale and every cost |\n| Things going wrong | Stay positive and learn from mistakes |'),
  fb(8, 'Writing down all the money that comes in and goes out of your business is called ___. The money you need to start a business is called the ___ cost.',
    ['record keeping', 'start-up'],
    'Record keeping means tracking all income and expenses. Start-up cost is the money needed to begin a business (buying supplies, equipment, etc.).'),
  q(9, 'Which of these is a good reason to make a business plan BEFORE starting your business?',
    ['To know how much money you need and whether you can make a profit', 'To make the business look fancy', 'Because the government forces you to', 'To impress your friends'], 0,
    'A business plan helps you figure out costs, set prices, and see if your business idea can make a profit. It is about being prepared!'),
  t(10, '### Summary\n\n| Key Word | Meaning |\n|---------|--------|\n| **Business** | An activity where someone sells goods or services to earn money |\n| **Entrepreneur** | A person who starts and runs a business |\n| **Cost price** | The price you pay to buy or make your goods |\n| **Selling price** | The price you charge your customers |\n| **Profit** | The money you earn after paying your costs (Selling price − Cost price) |\n| **Start-up cost** | The money you need to begin a business |\n| **Record keeping** | Writing down all money in and money out |\n\n**Remember:** Anyone can be an entrepreneur — even a Grade 5 learner! All you need is a good idea, a plan, and hard work.\n\n**Try this:** Think of a small business you could start. Write a simple business plan: What would you sell? Who would your customers be? How much would you charge? What supplies do you need? How much profit could you make?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 5
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
    tags: ['grade-5', 'ems', 'caps'],
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
      title: 'Chapter 1: Needs and Wants',
      description: 'What we need to survive vs what we want, basic needs (food, water, shelter, clothing), unlimited wants, making choices, and opportunity cost.',
      order: 1,
      lessons: [
        { title: 'Needs and Wants', description: 'What are needs and wants; telling them apart; unlimited wants and limited money; making choices; opportunity cost; needs and wants in South Africa.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Where Does Money Come From?',
      description: 'People earn money by working, different jobs and how they earn (teacher, farmer, doctor, taxi driver), pocket money, and the South African Rand.',
      order: 2,
      lessons: [
        { title: 'Where Does Money Come From?', description: 'People work to earn income; different jobs (teacher, farmer, doctor, taxi driver); salary vs wage vs commission; the South African Rand; coins and notes; where learners get money.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Spending and Saving',
      description: 'Why we spend money, keeping track of spending, why saving is important, piggy banks and savings accounts, saving for goals, and the 50-30-20 idea.',
      order: 3,
      lessons: [
        { title: 'Spending and Saving', description: 'Why we spend; keeping a spending record; why saving matters; piggy banks, jars, and bank accounts; interest; saving for a goal; the 50-30-20 idea.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Goods and Services',
      description: 'Difference between goods and services, shops and businesses in our community, paying for goods and services, and getting value for money.',
      order: 4,
      lessons: [
        { title: 'Goods and Services', description: 'What are goods; what are services; the difference between them; shops and businesses in our community; paying for goods and services (cash, card, EFT); getting value for money.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Buying and Selling',
      description: 'How shops work, profit (selling price minus cost price), why things cost different amounts, comparing prices, and being a smart buyer.',
      order: 5,
      lessons: [
        { title: 'Buying and Selling', description: 'How shops work; cost price and selling price; profit formula; why prices differ; comparing prices; being a smart buyer; loss; calculating profit.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: People Who Help Us',
      description: 'Community workers (police, nurses, teachers, firefighters), how they are paid through taxes, why their jobs are important, and government services.',
      order: 6,
      lessons: [
        { title: 'People Who Help Us', description: 'Community workers and what they do; how they are paid (taxes); types of tax (income tax, VAT); government services; social grants; respecting all workers; volunteering.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Taking Care of Our Things',
      description: 'Looking after belongings, sharing resources, borrowing and returning, waste not want not, and reusing and recycling.',
      order: 7,
      lessons: [
        { title: 'Taking Care of Our Things', description: 'Why looking after belongings matters; tips for caring for things; sharing resources; borrowing and returning; waste not want not; reusing and recycling.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: My Own Business',
      description: 'What is a business, selling things at school (tuck shop), making things to sell, planning a small business, and counting your money.',
      order: 8,
      lessons: [
        { title: 'My Own Business', description: 'What is a business; entrepreneurs; South African entrepreneur stories; the tuck shop; making things to sell; planning a small business; calculating profit; record keeping; challenges.', blocks: ch8_lesson1, term: 4 },
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
    title: 'Grade 5 EMS \u2014 CAPS Textbook',
    description: 'Introductory CAPS-aligned textbook covering foundational economic literacy concepts for Grade 5 learners: needs and wants, where money comes from, spending and saving, goods and services, buying and selling, people who help us, taking care of our things, and starting a small business.',
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
  console.log('  TEXTBOOK: Grade 5 EMS');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
