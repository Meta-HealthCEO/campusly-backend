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

// --- Lesson 1: Understanding Needs and Wants ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Understanding Needs and Wants\n\nEvery day, people must decide how to spend their money. Before we can make good decisions, we need to understand the difference between **needs** and **wants**.\n\n### What Are Needs?\n\n**Needs** are things you must have to survive. Without them, your health or safety would be at risk.\n\nThe basic needs of every person are:\n\n| Basic need | Why it is essential | Examples |\n|-----------|-------------------|----------|\n| **Food and water** | Your body needs nutrition and hydration to stay alive | Bread, rice, clean water, vegetables |\n| **Shelter** | You need protection from heat, cold, and rain | A house, flat, or room to live in |\n| **Clothing** | You need to cover and protect your body | School uniform, warm jacket, shoes |\n| **Health care** | You need medical help when you are sick or hurt | Visiting a clinic, medicine |\n| **Education** | You need to learn skills for your future | Going to school, reading books |\n\n### What Are Wants?\n\n**Wants** are things you would like to have but can live without. They make life more fun or comfortable, but you will not be in danger without them.\n\n**Examples of wants:**\n- A new smartphone\n- Sweets and chocolate\n- Designer sneakers\n- A holiday to Durban\n- A PlayStation or Xbox'),
  t(2, '### How Do You Tell the Difference?\n\nSometimes it can be tricky to decide if something is a need or a want. A good test is to ask: **"Can I survive without this?"**\n\n| Item | Need or want? | Reason |\n|------|-------------|--------|\n| A pair of school shoes | Need | You need shoes to attend school and protect your feet |\n| A pair of Nike Air Jordans | Want | Basic shoes would do the same job |\n| Clean drinking water | Need | You cannot survive without water |\n| Coca-Cola | Want | It is nice to drink, but water keeps you alive |\n| A warm jacket in winter | Need | You need warmth to stay healthy |\n| A Gucci jacket | Want | A plain jacket keeps you just as warm |\n| Rice and vegetables for supper | Need | Your body needs food |\n| A takeaway pizza | Want | It is tasty, but you do not need it to survive |\n\n### Unlimited Wants, Limited Resources\n\nPeople always want more things — a bigger house, a faster phone, more clothes. Our wants are **unlimited** — they never end.\n\nBut the money and resources we have are **limited**. Nobody — not even the richest person — can have everything they want.\n\nThis problem is called **scarcity**: unlimited wants but limited resources.\n\nBecause of scarcity, we must make **choices** about what to spend our money on.'),
  q(3, 'Which of the following is a NEED?',
    ['Clean drinking water', 'A PlayStation 5', 'A holiday to Cape Town', 'Designer sneakers'], 0,
    'Clean drinking water is essential for survival. The other options are wants — nice to have, but you can survive without them.'),
  fb(4, 'Things you must have to survive are called ___. Things you would like but can live without are called ___.',
    ['needs', 'wants'],
    'Needs are essential for survival (food, water, shelter, clothing). Wants are extras that make life more comfortable or enjoyable.'),
  t(5, '### Prioritising — Putting First Things First\n\nBecause we cannot buy everything, we must **prioritise**. This means putting the most important things first.\n\n**The rule:** Always pay for needs before wants.\n\n**Example:**\nNomsa receives R200 pocket money for the month. She writes a list:\n\n| Item | Cost | Need or want? | Priority |\n|------|------|-------------|----------|\n| School stationery | R60 | Need | 1st |\n| Bus fare to school | R80 | Need | 2nd |\n| Sweets and snacks | R30 | Want | 3rd |\n| Hair accessories | R40 | Want | 4th |\n\nNomsa has R200. Her needs cost R60 + R80 = R140. She has R60 left for wants.\n\nShe can afford the sweets (R30) but not the hair accessories too (R30 + R40 = R70 > R60). She must choose.\n\n### Opportunity Cost\n\nWhen you choose one thing, you give up something else. The next best thing you give up is called the **opportunity cost**.\n\n**Example:** Sipho has R50. He can buy:\n- Option A: Airtime (R50)\n- Option B: A sandwich (R50)\n- Option C: A comic book (R50)\n\nSipho chooses the sandwich. His second choice was the airtime. So the **opportunity cost** of the sandwich is the airtime.\n\n**Remember:** Opportunity cost is always the NEXT BEST option you gave up — not all the other options.'),
  q(6, 'Thandi has R100. She can buy a book (R100), a bag (R100), or earphones (R100). She buys the book. Her second choice was the bag. What is her opportunity cost?',
    ['The bag', 'The earphones', 'The book', 'R100'], 0,
    'Opportunity cost is the next best alternative you give up. Thandi\'s second choice was the bag, so the bag is her opportunity cost.'),
  t(7, '### Needs and Wants in South Africa\n\nSouth Africa is a country where some people have many of their wants met, while others struggle to meet even their basic needs.\n\n**Challenges many South Africans face:**\n- Some families do not have enough food every day\n- Many people live in shacks without running water\n- Unemployment means some parents cannot earn money for their families\n\n**What the government does to help:**\n- Provides **social grants** (like the child support grant) to help families\n- Builds **RDP houses** for people who need homes\n- Provides **free meals at schools** through the National School Nutrition Programme\n- Offers **free health care** at public clinics for children under 6\n\n**What you can do:**\n- Do not waste food, water, or electricity\n- Think carefully before buying — is it a need or a want?\n- Save some of your pocket money instead of spending it all\n- Share with others when you can'),
  fb(8, 'When you choose one thing and give up another, the next best option you gave up is called the ___. The problem of unlimited wants and limited resources is called ___.',
    ['opportunity cost', 'scarcity'],
    'Opportunity cost is the value of the next best alternative you give up. Scarcity exists because our wants are unlimited but our resources are limited.'),
  q(9, 'Why must people make choices about spending their money?',
    ['Because our wants are unlimited but our money is limited', 'Because the government tells us what to buy', 'Because shops run out of things to sell', 'Because money is only used on weekdays'], 0,
    'Scarcity forces us to make choices. We have unlimited wants but limited money, so we must decide what is most important.'),
  t(10, '### Summary\n\nLet us review what we have learned:\n\n| Key concept | Meaning |\n|------------|--------|\n| **Needs** | Things essential for survival — food, water, shelter, clothing, health care, education |\n| **Wants** | Things that are nice to have but not essential — games, sweets, holidays |\n| **Scarcity** | Unlimited wants + limited resources = we must make choices |\n| **Prioritising** | Putting needs before wants — spending on the most important things first |\n| **Opportunity cost** | The next best option you give up when making a choice |\n\n**Golden rule for spending wisely:** Needs first, wants second, and always think about what you are giving up!\n\n**Activity idea:** Make a list of 10 things you spent money on (or asked your parents to buy) this month. Label each one as a need or a want. Were your needs covered first?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Goods and Services (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Goods and Services ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Goods and Services\n\nThe economy produces things to meet people\'s needs and wants. Everything the economy produces can be sorted into two groups: **goods** and **services**.\n\n### What Are Goods?\n\n**Goods** are physical things you can touch, see, and hold. When you buy a good, you take it home with you.\n\n| Type of good | Description | Examples |\n|-------------|-----------|----------|\n| **Consumer goods** | Finished products people buy and use | Bread, shoes, a cell phone |\n| **Capital goods** | Items used to make other goods | A factory oven, a delivery truck |\n| **Free goods** | Things provided by nature at no cost | Fresh air, sunlight, rain |\n\n### What Are Services?\n\n**Services** are things people do for you. You cannot touch or hold a service — you experience it.\n\n| Type of service | Examples |\n|----------------|----------|\n| **Personal services** | A haircut, a doctor\'s check-up, tutoring |\n| **Transport services** | A bus ride, a taxi, a train journey |\n| **Financial services** | Banking, insurance |\n| **Government services** | Police protection, fire brigade, public schools |\n| **Communication services** | Cell phone network, internet, the post office |'),
  t(2, '### Differences Between Goods and Services\n\n| Feature | Goods | Services |\n|---------|-------|----------|\n| **Can you touch it?** | Yes — goods are tangible | No — services are intangible |\n| **Can you store it?** | Yes — you can keep goods for later | No — a service happens and is done |\n| **Ownership** | You own the good after buying it | You experience the service but do not own it |\n| **Example** | Buying a loaf of bread at Shoprite | Getting a haircut at the salon |\n\n### Producers and Consumers\n\nIn the economy, there are two important roles:\n\n| Role | What they do | Examples |\n|------|-------------|----------|\n| **Producer** | Makes or provides goods and services | A baker who makes bread, a teacher who provides education |\n| **Consumer** | Buys and uses goods and services | A family buying groceries, a learner at school |\n\n**Important:** Everyone is both a producer and a consumer! A teacher **produces** education (service) but **consumes** food, electricity, and transport.\n\n### South African Examples\n\n| Business | Goods or services? | What they provide |\n|----------|-------------------|------------------|\n| **Shoprite** | Goods | Groceries and household items |\n| **Woolworths** | Goods (and some services) | Food, clothing |\n| **Capitec Bank** | Services | Banking, savings accounts |\n| **Minibus taxis** | Services | Transport for millions of South Africans |\n| **Eskom** | Services | Electricity supply |'),
  q(3, 'Which of the following is a SERVICE?',
    ['A taxi ride to town', 'A loaf of bread', 'A pair of shoes', 'A school textbook'], 0,
    'A taxi ride is a service — the driver does something for you (transports you). You cannot touch or store a taxi ride. Bread, shoes, and a textbook are goods you can touch and keep.'),
  fb(4, 'Goods are ___ items you can touch. Services are ___ activities done for you.',
    ['physical', 'intangible'],
    'Goods are physical (tangible) — you can hold them. Services are intangible — you experience them but cannot touch them.'),
  t(5, '### How Goods and Services Meet Our Needs\n\nGoods and services work together to meet our needs:\n\n| Need | Goods that help | Services that help |\n|------|----------------|-------------------|\n| **Food** | Bread, rice, fruit | Restaurant cooking, food delivery |\n| **Shelter** | Bricks, cement, roof tiles | Builders, plumbers, electricians |\n| **Health** | Medicine, bandages | Doctor visits, clinic check-ups |\n| **Education** | Textbooks, pencils, uniforms | Teaching, tutoring |\n| **Transport** | Cars, bicycles | Bus services, taxis, Uber |\n\n### Where Do Goods and Services Come From?\n\nGoods and services are produced in different **sectors** (parts) of the economy:\n\n| Sector | What happens | Examples |\n|--------|-------------|----------|\n| **Primary sector** | Raw materials are taken from nature | Farming (maize, fruit), mining (gold, coal), fishing |\n| **Secondary sector** | Raw materials are turned into products | Factories making bread, cars, clothes |\n| **Tertiary sector** | Services are provided to people | Shops, banks, schools, hospitals, transport |\n\n**Example chain:** A farmer grows wheat (primary) → A factory makes bread (secondary) → A shop sells the bread (tertiary).'),
  q(6, 'A factory that turns milk into cheese operates in which sector of the economy?',
    ['The secondary sector', 'The primary sector', 'The tertiary sector', 'None of the above'], 0,
    'The factory manufactures a product (cheese) from a raw material (milk). Manufacturing belongs to the secondary sector.'),
  t(7, '### Supporting Local Businesses\n\nWhen you buy goods and services from South African businesses, you help the country\'s economy:\n\n- **Jobs:** Local businesses create jobs for South Africans\n- **Taxes:** Businesses pay taxes that the government uses for schools, roads, and hospitals\n- **Growth:** When businesses grow, the economy grows, and more people benefit\n\n**South African products you might know:**\n- **Simba chips** — made in South Africa\n- **Mrs Ball\'s chutney** — a South African favourite\n- **Nando\'s** — a restaurant chain that started in South Africa\n- **Pick n Pay** — a South African grocery chain\n\n**Buying local** means choosing South African-made products when you can. This supports local producers and keeps money in our economy.'),
  fb(8, 'A person who makes or provides goods and services is called a ___. A person who buys and uses goods and services is called a ___.',
    ['producer', 'consumer'],
    'Producers make or provide goods and services. Consumers buy and use them. Everyone plays both roles.'),
  q(9, 'Which South African company provides banking SERVICES (not goods)?',
    ['Capitec Bank', 'Shoprite', 'Simba', 'Woolworths Food'], 0,
    'Capitec Bank provides banking services — you cannot touch or store banking. Shoprite, Simba, and Woolworths Food mainly provide physical goods.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Goods** | Physical things you can touch and own — bread, shoes, textbooks |\n| **Services** | Activities done for you — haircuts, taxi rides, teaching |\n| **Producer** | Someone who makes or provides goods and services |\n| **Consumer** | Someone who buys and uses goods and services |\n| **Primary sector** | Takes raw materials from nature (farming, mining) |\n| **Secondary sector** | Makes products from raw materials (factories) |\n| **Tertiary sector** | Provides services (shops, banks, schools) |\n\n**Activity idea:** Walk through your home. List 5 goods you can see and 5 services your family uses. Can you name the producer for each one?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Money and its Role (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Money and its Role ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Money and its Role\n\nMoney is something we use every day, but have you ever wondered where it came from or why we use it?\n\n### Before Money — The Barter System\n\nLong ago, there was no money. People got what they needed by **bartering** — swapping one thing directly for another.\n\n**Example:** A fisherman gives 10 fish to a farmer in exchange for a bag of maize.\n\n### Problems with Bartering\n\n| Problem | What it means | Example |\n|---------|-------------|--------|\n| **Double coincidence of wants** | Both people must want what the other has | The fisherman wants maize, but the farmer does not want fish |\n| **No way to measure value** | How do you decide what is a fair swap? | How many fish equal one goat? |\n| **Cannot split items easily** | Some items cannot be divided into smaller pieces | You cannot cut a cow in half to buy a small item |\n| **Items go bad** | Many goods rot or spoil | Fish, milk, and fruit do not last |\n\nBecause of these problems, people needed something better — **money**.'),
  t(2, '### The History of Money\n\nMoney has changed many times over the centuries:\n\n| Stage | Type of money | How it worked |\n|-------|-------------|---------------|\n| **1. Commodity money** | Useful objects everyone valued | People used cattle, shells, salt, or beads as money |\n| **2. Metal coins** | Pieces of gold or silver stamped with a value | Easier to carry and did not go bad |\n| **3. Paper notes (banknotes)** | Paper certificates representing value | Lighter than coins, easier to carry |\n| **4. Bank accounts** | Money stored at a bank | Safer than keeping cash at home |\n| **5. Electronic money** | Digital payments | Debit cards, EFT, internet banking |\n| **6. Mobile money** | Payments from your phone | SnapScan, bank apps, e-Wallet |\n\n### South African Currency\n\nOur currency is the **South African rand (R)**, divided into 100 **cents (c)**.\n\n**Coins in circulation:** R5, R2, R1, 50c, 20c, 10c\n\n**Banknotes in circulation:** R10, R20, R50, R100, R200\n\n**Fun facts:**\n- The rand was introduced on **14 February 1961** when South Africa became a republic\n- Before the rand, South Africans used pounds, shillings, and pence\n- Our banknotes feature the face of **Nelson Mandela** on the front and the **Big Five animals** on the back\n- The word "rand" comes from the **Witwatersrand**, the gold-mining ridge near Johannesburg'),
  q(3, 'What was the main problem with the barter system?',
    ['Both people had to want what the other person had (double coincidence of wants)', 'People did not like trading', 'There were no markets to trade in', 'The government did not allow it'], 0,
    'The biggest problem with bartering was the double coincidence of wants — both traders had to want exactly what the other person offered. Money solved this because everyone accepts money.'),
  fb(4, 'South Africa\'s currency is the ___. It was introduced in the year ___.',
    ['rand', '1961'],
    'The South African rand (R) has been our currency since 14 February 1961, when South Africa became a republic.'),
  t(5, '### What Does Money Do?\n\nMoney has four important jobs in the economy:\n\n| Job of money | What it means | Example |\n|-------------|-------------|--------|\n| **Medium of exchange** | Money is used to buy and sell things | You pay R15 for bread at the shop |\n| **Measure of value** | Money gives everything a price so we can compare | A pen costs R10, a book costs R50 — the book is worth more |\n| **Store of value** | Money can be saved and used later | You save R100 in a jar for next month |\n| **Standard of payment** | Money lets you pay debts and bills | Your family pays the electricity bill with money |\n\n### The South African Reserve Bank (SARB)\n\nThe **South African Reserve Bank** is the country\'s central bank. It has a very important job:\n\n- It is the **only** institution allowed to print and issue rand notes and coins\n- It controls how much money is in the economy\n- It helps keep prices stable so that things do not become too expensive too quickly\n- Its head office is in **Pretoria**\n\n**Why can\'t we just print more money?** If the SARB prints too much money, prices go up (this is called **inflation**). Imagine if everyone had R1 million — a loaf of bread might cost R10 000! Money only works because it is limited.'),
  q(6, 'Which institution is the only one allowed to print and issue South African rand notes?',
    ['The South African Reserve Bank (SARB)', 'Shoprite', 'The local municipality', 'Any commercial bank like FNB'], 0,
    'The South African Reserve Bank (SARB) in Pretoria is the only institution that may print and issue rand notes and coins.'),
  t(7, '### Types of Money We Use Today\n\nIn modern South Africa, people use different forms of money:\n\n**1. Cash (notes and coins)**\n- Physical money you can hold\n- Accepted almost everywhere\n- Can be lost or stolen\n\n**2. Debit card**\n- A card linked to your bank account\n- Money comes directly from your account when you pay\n- You can only spend what you have\n\n**3. Electronic Funds Transfer (EFT)**\n- Sending money from one bank account to another using the internet\n- Used for paying bills or sending money to family\n\n**4. Mobile payments**\n- Paying using apps on your phone (like SnapScan or your bank\'s app)\n- Quick and convenient\n\n**Safety tips for using money:**\n- Never share your bank PIN with anyone\n- Count your change when paying with cash\n- Keep your money in a safe place\n- Tell a parent if you find money that is not yours'),
  fb(8, 'The four jobs of money are: medium of exchange, measure of value, store of value, and standard of ___. The only institution that can print rand notes is the ___.',
    ['payment', 'South African Reserve Bank'],
    'Money serves as a standard of payment (paying bills and debts). The SARB is the only institution allowed to issue South African currency.'),
  q(9, 'Why can the Reserve Bank not simply print lots more money to make everyone rich?',
    ['Printing too much money causes prices to rise (inflation)', 'The printing machines would break', 'Other countries would be angry', 'There is not enough paper'], 0,
    'If too much money is printed, there is more money chasing the same amount of goods. This pushes prices up — called inflation — and money becomes worth less.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Barter** | Swapping goods directly without money |\n| **Double coincidence of wants** | The main problem with bartering — both traders must want what the other offers |\n| **Rand (R)** | South Africa\'s currency, divided into 100 cents |\n| **SARB** | The South African Reserve Bank — prints and controls our money |\n| **Medium of exchange** | Money is used to buy and sell |\n| **Measure of value** | Money gives everything a price |\n| **Store of value** | Money can be saved for later |\n| **Inflation** | When too much money is printed, prices rise |\n\n**Activity idea:** Look at a South African banknote (R10, R20, R50, R100, or R200). Which Big Five animal is on the back? What security features can you find?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Income and Expenses (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Income and Expenses ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Income and Expenses\n\nTo manage your money well, you need to understand two key ideas: **income** (money coming in) and **expenses** (money going out).\n\n### What Is Income?\n\n**Income** is money that a person or family receives.\n\n| Type of income | What it means | Example |\n|---------------|-------------|--------|\n| **Salary** | A fixed amount paid every month for doing a job | A teacher earns R18 000 per month |\n| **Wages** | Money paid per hour or per day of work | A shop worker earns R35 per hour |\n| **Pocket money** | Money given to you by parents or guardians | You receive R50 per week |\n| **Gifts** | Money given to you for birthdays or special occasions | Gogo gives you R200 for your birthday |\n| **Interest** | Money the bank pays you for keeping your savings there | The bank adds R5 to your savings account |\n\n### What Are Expenses?\n\n**Expenses** are things you spend money on.\n\n| Type of expense | What it means | Examples |\n|----------------|-------------|----------|\n| **Fixed expenses** | Cost the same every month | Rent (R3 000), school fees (R500), bus fare (R200) |\n| **Variable expenses** | Change from month to month | Food, electricity, airtime, clothes |\n| **Occasional expenses** | Only happen sometimes | Doctor visit, birthday gift, school trip |'),
  t(2, '### Keeping Track of Your Money\n\nIt is important to write down what you earn and what you spend. This helps you see where your money goes.\n\n**A simple income and expense record:**\n\n| Date | Description | Income (R) | Expense (R) |\n|------|-----------|-----------|------------|\n| 1 March | Pocket money from Mom | 100 | |\n| 3 March | Bus fare to school | | 20 |\n| 5 March | Bought lunch at tuck shop | | 25 |\n| 8 March | Helped neighbour carry groceries | 30 | |\n| 10 March | Bought a pen for school | | 15 |\n| **Totals** | | **R130** | **R60** |\n\n**Income – Expenses = Money left over**\nR130 – R60 = **R70 left over** (this can be saved!)\n\n### The Simple Income Statement\n\nA basic income statement shows:\n\n```\nTotal Income      R130\n– Total Expenses   R60\n= Surplus           R70\n```\n\n- If income is MORE than expenses → you have a **surplus** (money left over) ✓\n- If expenses are MORE than income → you have a **deficit** (you overspent) ✗\n\n**Goal:** Always try to have a surplus so you can save.'),
  q(3, 'If Thabo earns R200 pocket money and spends R150, what does he have?',
    ['A surplus of R50', 'A deficit of R50', 'A surplus of R150', 'A deficit of R200'], 0,
    'Income (R200) minus expenses (R150) = R50 surplus. Thabo has R50 left over that he can save.'),
  fb(4, 'Money that a person receives is called ___. Money that a person spends is called ___.',
    ['income', 'expenses'],
    'Income is money coming in (earned or received). Expenses are money going out (spent on goods and services).'),
  t(5, '### Where Do Families Get Their Income?\n\nDifferent families earn money in different ways:\n\n| Source of income | How it works | Example |\n|----------------|-------------|--------|\n| **Employment** | Working for a company or the government | A nurse working at a public hospital |\n| **Self-employment** | Running your own business | A woman selling vetkoek at the taxi rank |\n| **Social grants** | Money the government gives to people who need help | The child support grant (R530 per month) |\n| **Remittances** | Money sent by family members working far away | A father working in Johannesburg sends money home |\n| **Informal work** | Earning money from small jobs | Washing cars, selling sweets at school |\n\n### Types of Family Expenses\n\nFamilies spend money on many things. Here is an example of a South African family\'s monthly expenses:\n\n| Expense | Amount | Type |\n|---------|--------|------|\n| Rent | R3 500 | Fixed |\n| Food and groceries | R2 000 | Variable |\n| Electricity (prepaid) | R400 | Variable |\n| Transport (taxi fare) | R600 | Fixed |\n| School fees | R300 | Fixed |\n| Airtime and data | R150 | Variable |\n| Clothing | R200 | Variable |\n| **Total** | **R7 150** | |'),
  q(6, 'Which of the following is a FIXED expense?',
    ['Rent — it stays the same every month', 'Groceries — the amount changes each month', 'Electricity — it depends on how much you use', 'Clothing — you buy it only when needed'], 0,
    'Rent is a fixed expense because it stays the same every month. Groceries, electricity, and clothing vary depending on what you buy and use.'),
  t(7, '### Why Tracking Money Matters\n\nKeeping track of income and expenses helps you:\n\n1. **See where your money goes** — you might be surprised how much you spend on snacks!\n2. **Avoid overspending** — if you know your expenses, you can stay within your income\n3. **Find ways to save** — you can cut spending on wants and save more\n4. **Plan for the future** — you can set goals for things you want to buy\n5. **Prepare for emergencies** — having savings helps when unexpected expenses come up\n\n**Tips for Grade 6 learners:**\n- Write down every rand you receive and spend this week\n- Use a small notebook or a page in your homework book\n- At the end of the week, add up your income and expenses\n- See if you had a surplus or a deficit\n- Think about what you could do differently next week'),
  fb(8, 'If your income is more than your expenses, you have a ___. If your expenses are more than your income, you have a ___.',
    ['surplus', 'deficit'],
    'A surplus means you have money left over (good!). A deficit means you spent more than you earned (not good — you need to cut expenses).'),
  q(9, 'A family earns R8 000 per month and spends R8 500. What is their situation?',
    ['They have a deficit of R500 — they are overspending', 'They have a surplus of R500', 'They are breaking even', 'They need to earn R8 500 more'], 0,
    'R8 000 income minus R8 500 expenses = –R500. This is a deficit. The family is spending R500 more than they earn each month.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Income** | Money received — salary, wages, pocket money, grants |\n| **Expenses** | Money spent — rent, food, transport, school fees |\n| **Fixed expenses** | Stay the same each month (rent, school fees) |\n| **Variable expenses** | Change each month (food, electricity, airtime) |\n| **Surplus** | Income > expenses — money left over to save |\n| **Deficit** | Expenses > income — overspending |\n| **Income statement** | A record that shows total income minus total expenses |\n\n**Golden rule:** Always know how much money is coming in and going out. The first step to being good with money is keeping track of it!\n\n**Activity idea:** For one week, record every rand you receive and spend. At the end, calculate your surplus or deficit.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Saving and Budgeting (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Saving and Budgeting ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Saving and Budgeting\n\nSaving money and making a budget are two of the most important skills you can learn. They help you reach your goals and avoid running out of money.\n\n### Why Should You Save?\n\nSaving means putting money aside instead of spending it right away.\n\n**Reasons to save:**\n\n| Reason | Explanation |\n|--------|------------|\n| **Emergency fund** | If something unexpected happens (you lose your school bag, a family member gets sick), savings can help |\n| **Reach a goal** | You might want to buy something special — like a bicycle or a new book — that costs more than your pocket money |\n| **Future needs** | One day you will need money for university, a car, or your own home |\n| **Peace of mind** | Knowing you have savings makes you feel less worried about money |\n| **Earn interest** | If you save at a bank, the bank pays you extra money (interest) for keeping your savings there |\n\n### Setting a Savings Goal\n\nA savings goal gives you something to work towards.\n\n**Example:**\nAmahle wants to buy a gift for her mother\'s birthday. The gift costs R150. She gets R50 pocket money per week.\n\nIf she saves R30 per week: R150 ÷ R30 = **5 weeks** to reach her goal.\n\nIf she saves R50 per week (all her pocket money): R150 ÷ R50 = **3 weeks** — but she would have nothing to spend on anything else.'),
  t(2, '### What Is a Budget?\n\nA **budget** is a plan for how you will spend and save your money.\n\nA budget helps you:\n- Spend on needs first\n- Set aside money for savings\n- Decide how much you can spend on wants\n- Avoid running out of money before the end of the week or month\n\n### How to Make a Simple Budget\n\n**Step 1:** Write down your income (how much money you will receive)\n**Step 2:** List your expenses (things you need to pay for)\n**Step 3:** Subtract expenses from income\n**Step 4:** Decide how much to save\n\n**Example — Lebo\'s Weekly Budget:**\n\n| Item | Amount |\n|------|--------|\n| **Income** | |\n| Pocket money | R80 |\n| **Total Income** | **R80** |\n| **Expenses** | |\n| School tuck shop (lunch) | R25 |\n| Bus fare | R20 |\n| Stationery | R10 |\n| **Total Expenses** | **R55** |\n| **Money left over** | **R25** |\n| **Savings** | **R15** |\n| **Spending money for wants** | **R10** |\n\nLebo\'s budget makes sure his needs are paid for first, then he saves R15, and he has R10 for wants.'),
  q(3, 'What is a budget?',
    ['A plan for how you will spend and save your money', 'A list of everything you want to buy', 'A record of what you already spent', 'A type of bank account'], 0,
    'A budget is a forward-looking plan. It shows how you will divide your money between needs, wants, and savings before you spend it.'),
  fb(4, 'Putting money aside instead of spending it right away is called ___. A plan for how to spend and save your money is called a ___.',
    ['saving', 'budget'],
    'Saving is setting money aside for later use. A budget is a plan that organises your income into expenses, savings, and spending money.'),
  t(5, '### The Simple Savings Formula\n\n**Income – Expenses = Savings**\n\nThis formula is the key to managing your money:\n\n| If ... | Then ... |\n|--------|----------|\n| Income is R100 and expenses are R70 | Savings = R30 |\n| Income is R100 and expenses are R100 | Savings = R0 (nothing left!) |\n| Income is R100 and expenses are R120 | You are R20 short — you overspent! |\n\n### Tips for Saving More\n\n1. **Pay yourself first** — as soon as you get money, put some away for savings before spending anything\n2. **Use a savings jar** — have a special container at home where you put your savings\n3. **Avoid impulse buying** — wait a day before buying something you want. If you still want it the next day, then consider buying it\n4. **Pack your own lunch** — instead of buying at the tuck shop every day, bring food from home some days\n5. **Set a savings goal** — having a target makes saving easier and more exciting\n\n### Bank Savings Accounts for Young People\n\nSome South African banks offer savings accounts for young people:\n\n| Bank | Youth account | Feature |\n|------|-------------|--------|\n| **Capitec** | Global One | No monthly fees for under-18s |\n| **FNB** | S account | Designed for children with parental control |\n| **Nedbank** | 4Me account | For learners under 18 |\n| **Standard Bank** | Kidz Banking | Teaches children about saving |\n\nYour parent or guardian must go with you to open an account.'),
  q(6, 'Mpho earns R60 pocket money per week. She spends R40 on needs. How much can she save?',
    ['R20', 'R40', 'R60', 'R100'], 0,
    'Income (R60) minus expenses (R40) = R20 that Mpho can save each week.'),
  t(7, '### Creating Your Own Budget\n\nHere is a blank template you can use:\n\n| Item | Amount (R) |\n|------|----------|\n| **INCOME** | |\n| Pocket money | |\n| Other income (gifts, chores) | |\n| **Total Income** | |\n| **EXPENSES (Needs)** | |\n| Transport | |\n| School supplies | |\n| Lunch | |\n| **EXPENSES (Wants)** | |\n| Snacks | |\n| Entertainment | |\n| **Total Expenses** | |\n| **SAVINGS** (Income – Expenses) | |\n\n### Common Budgeting Mistakes\n\n| Mistake | Why it is a problem | What to do instead |\n|---------|-------------------|-------------------|\n| Not writing a budget | You lose track of spending | Write down your plan before the week starts |\n| Forgetting about small expenses | R5 here, R10 there — it adds up! | Record every purchase, no matter how small |\n| Spending savings on wants | You never reach your savings goal | Keep savings separate — do not touch them |\n| Not adjusting your budget | Your expenses change over time | Review your budget every week or month |'),
  fb(8, 'The formula for calculating savings is: Income minus ___ equals savings. Before buying something you want, you should wait a day to avoid ___ buying.',
    ['expenses', 'impulse'],
    'Savings = Income – Expenses. Impulse buying is purchasing something on a whim without thinking. Waiting a day helps you decide if you really need it.'),
  q(9, 'Which is the BEST advice for saving money?',
    ['Pay yourself first — save before you spend on anything else', 'Save only if you have money left at the end of the month', 'Spend on wants first because life is short', 'Ask your friends for money instead of saving'], 0,
    'Paying yourself first means setting aside savings as soon as you receive money. If you wait until the end of the month, there is usually nothing left to save.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Saving** | Putting money aside for future use |\n| **Budget** | A plan for spending and saving your money |\n| **Income – Expenses = Savings** | The basic formula for managing money |\n| **Savings goal** | A target amount you are saving towards |\n| **Impulse buying** | Buying something without thinking — a budget helps prevent this |\n| **Pay yourself first** | Save money before spending on anything else |\n\n**Challenge:** Create a budget for next week using the template above. At the end of the week, check if you followed your plan. How much did you save?\n\n**Remember:** Saving even a small amount each week adds up over time. R10 per week = R520 per year!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Buying Wisely (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Buying Wisely ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Buying Wisely\n\nEvery time you spend money, you are making a choice. A **smart consumer** makes careful choices to get the best value for their money.\n\n### What Is a Consumer?\n\nA **consumer** is anyone who buys or uses goods and services. That includes you! Every time you buy a packet of chips, pay for a taxi ride, or use electricity, you are a consumer.\n\n### Being a Smart Consumer\n\nA smart consumer does not just buy the first thing they see. They:\n\n1. **Compare prices** — check the price at different shops before buying\n2. **Read labels** — look at what is in the product and how much you are getting\n3. **Think before buying** — ask "Do I really need this? Can I afford it?"\n4. **Look for specials** — shops often have sales and discounts\n5. **Check quality** — the cheapest item is not always the best value if it breaks quickly\n\n### Comparing Prices — A Real Example\n\nYou want to buy 1 litre of milk. You check three shops:\n\n| Shop | Price for 1L milk |\n|------|------------------|\n| Shop A | R18.99 |\n| Shop B | R16.50 |\n| Shop C | R19.99 |\n\n**Smart choice:** Buy from Shop B and save R2.49 compared to Shop A or R3.49 compared to Shop C.\n\nThose small savings add up over time!'),
  t(2, '### Advertising Tricks\n\nCompanies spend billions of rands on advertising to make you want to buy their products. It is important to recognise advertising tricks so you do not waste money.\n\n| Trick | How it works | Example |\n|-------|-------------|--------|\n| **Celebrity endorsement** | A famous person promotes the product to make it seem cool | A soccer star advertising a sports drink |\n| **Bandwagon** | Makes you feel everyone is buying it, so you should too | "Everyone is switching to Brand X!" |\n| **Emotional appeal** | Makes you feel happy, scared, or excited so you buy | A sad puppy in a pet food advert |\n| **Free gifts** | Offers a "free" item to get you to buy the product | "Buy 2, get 1 FREE!" (but did you need 2?) |\n| **Before and after** | Shows a dramatic change to make you believe the product works miracles | A skin cream advert showing perfect skin |\n| **Limited time offer** | Creates urgency so you buy quickly without thinking | "Sale ends TODAY!" |\n\n### Questions to Ask Before You Buy\n\n- Do I **need** this or do I just **want** it?\n- Can I **afford** it without using money meant for needs?\n- Have I **compared prices** at different shops?\n- Is the **quality** good — will it last?\n- Am I being tricked by **advertising**?\n- What is the **opportunity cost** — what else could I do with this money?'),
  q(3, 'Which advertising trick makes you feel like everyone else is buying the product?',
    ['Bandwagon', 'Celebrity endorsement', 'Emotional appeal', 'Limited time offer'], 0,
    'The bandwagon trick makes you feel that "everyone is doing it" so you should too. It puts social pressure on you to follow the crowd.'),
  fb(4, 'A person who buys or uses goods and services is called a ___. Checking prices at different shops before buying is called ___ prices.',
    ['consumer', 'comparing'],
    'A consumer is anyone who buys or uses goods and services. Comparing prices helps you find the best deal and save money.'),
  t(5, '### Your Consumer Rights\n\nIn South Africa, consumers are protected by the **Consumer Protection Act (CPA)**. This law gives you important rights:\n\n| Right | What it means |\n|-------|-------------|\n| **Right to choose** | You can decide which products and services to buy — no one can force you |\n| **Right to information** | Products must have clear labels showing price, ingredients, and expiry date |\n| **Right to safety** | Products must be safe to use — dangerous products must be recalled |\n| **Right to fair value** | Products must be worth what you pay — you should not be cheated |\n| **Right to return defective goods** | If a product is broken or faulty, you can return it within 6 months for a refund, repair, or replacement |\n| **Right to honest advertising** | Adverts must not lie about what a product can do |\n\n### What to Do If Something Goes Wrong\n\n1. Take the product back to the shop with your **receipt** (proof of purchase)\n2. Explain the problem calmly\n3. Ask for a **refund**, **repair**, or **replacement**\n4. If the shop refuses, contact the **National Consumer Commission** for help\n\n**Important:** Always keep your receipts! Without a receipt, it is very hard to prove where and when you bought something.'),
  q(6, 'According to the Consumer Protection Act, what can you do if you buy a product that is defective?',
    ['Return it within 6 months for a refund, repair, or replacement', 'Nothing — you must keep the product', 'Only exchange it for the same product', 'Only return it within 24 hours'], 0,
    'The CPA gives you the right to return defective goods within 6 months. You can choose a refund, a repair, or a replacement.'),
  t(7, '### Saving Money When Shopping\n\nHere are practical tips for spending less:\n\n**At the grocery store:**\n- Make a shopping list and stick to it\n- Buy house brands (store brands) instead of expensive name brands — they are often the same quality\n- Check the "price per kilogram" or "price per litre" to compare sizes fairly\n- Do not shop when you are hungry — you will buy more than you need\n\n**At school:**\n- Pack lunch from home instead of buying every day\n- Share a taxi or walk with friends instead of paying alone\n- Take care of your stationery so it lasts longer\n\n**With technology:**\n- Compare airtime and data prices between networks (Vodacom, MTN, Cell C, Telkom)\n- Use free Wi-Fi when available instead of your mobile data\n- Do not buy apps or games on impulse\n\n**The power of small savings:**\n\n| Saving | Per day | Per month | Per year |\n|--------|---------|-----------|----------|\n| Pack lunch instead of buying | R15 saved | R300 saved | R3 600 saved |\n| Walk instead of taking taxi (short trips) | R10 saved | R200 saved | R2 400 saved |'),
  fb(8, 'The law that protects consumers in South Africa is called the ___. You should always keep your ___ as proof of purchase.',
    ['Consumer Protection Act', 'receipt'],
    'The Consumer Protection Act (CPA) protects your rights as a consumer. A receipt proves when and where you bought something, which you need if you want to return a faulty product.'),
  q(9, 'Why should you compare the "price per kilogram" when shopping for groceries?',
    ['It helps you compare the true value of different sizes fairly', 'It tells you how heavy the product is', 'It shows you the expiry date', 'It is required by law'], 0,
    'Price per kilogram (or per litre) allows you to compare products of different sizes fairly. A larger pack might look more expensive but could actually be cheaper per kilogram.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Smart consumer** | Someone who makes careful buying decisions |\n| **Compare prices** | Check the cost at different shops before buying |\n| **Advertising tricks** | Tactics companies use to persuade you to buy |\n| **Consumer Protection Act** | South African law that protects your rights as a buyer |\n| **Receipt** | Proof of purchase — always keep it |\n| **Price per kg/litre** | The best way to compare value across different product sizes |\n\n**Golden rule:** Think before you buy. Ask yourself — do I need it, can I afford it, and am I getting the best price?\n\n**Activity idea:** Next time you go shopping with your family, compare the prices of three products (like cereal, juice, or soap) at different shops or between brands. Which offers the best value?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: The Market (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The Market ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## The Market\n\nYou probably think of a market as a place where people sell fruit and vegetables. In economics, a **market** is any place where buyers and sellers come together to trade goods and services.\n\n### Types of Markets\n\nMarkets come in many forms:\n\n| Type of market | Description | South African example |\n|---------------|-----------|---------------------|\n| **Physical market** | A specific place where people buy and sell face-to-face | The Warwick Junction market in Durban, a flea market |\n| **Supermarket / shop** | A formal store with fixed prices | Shoprite, Pick n Pay, Checkers |\n| **Street vendors** | Informal sellers on the pavement or at a taxi rank | A vendor selling fruit at the taxi rank |\n| **Online market** | Buying and selling on the internet | Takealot, Superbalist, Facebook Marketplace |\n| **Labour market** | Where people offer their work skills and employers hire them | Job interviews, CV submissions |\n\n### Buyers and Sellers\n\nEvery market has two sides:\n\n| Role | What they want | Example |\n|------|---------------|--------|\n| **Buyer (consumer)** | Wants to get goods and services at the lowest possible price | You buying bread at the shop |\n| **Seller (producer)** | Wants to sell goods and services at the highest possible price | The shop selling bread to make a profit |\n\n**The price** is decided where the buyer and seller agree. If the seller asks too much, the buyer goes somewhere else. If the buyer offers too little, the seller refuses.'),
  t(2, '### Supply and Demand — The Basics\n\nTwo powerful forces control prices in every market: **demand** and **supply**.\n\n**Demand** is how much of a product people want to buy.\n\n**Supply** is how much of a product sellers have available to sell.\n\n### How Supply and Demand Affect Prices\n\n| Situation | What happens to the price | Example |\n|-----------|------------------------|--------|\n| **High demand + low supply** | Price goes UP | Heaters in winter — everyone wants one, but shops have few left |\n| **Low demand + high supply** | Price goes DOWN | Mangoes in summer — there are so many that sellers lower the price |\n| **High demand + high supply** | Price stays the same | Bread — many people want it, and shops keep plenty in stock |\n\n### Real South African Examples\n\n| Product | When is demand high? | When is demand low? | Effect on price |\n|---------|--------------------|--------------------|----------------|\n| **Sunscreen** | Summer (December) | Winter (June) | More expensive in summer |\n| **Heaters** | Winter (June–August) | Summer (December) | More expensive in winter |\n| **School uniforms** | January (back to school) | Mid-year | More expensive in January |\n| **Braai meat** | Heritage Day (24 Sept), December holidays | Ordinary weekdays | More expensive during holidays |\n| **Petrol** | Always in demand | — | Price set by government; goes up when oil price rises |'),
  q(3, 'In economics, what is a "market"?',
    ['Any place where buyers and sellers come together to trade', 'Only a place that sells fruit and vegetables', 'A big shopping mall', 'A government building'], 0,
    'In economics, a market is any place — physical or online — where buyers and sellers meet to trade goods and services.'),
  fb(4, 'How much of a product people want to buy is called ___. How much of a product sellers have available is called ___.',
    ['demand', 'supply'],
    'Demand is the quantity consumers want to buy. Supply is the quantity producers have available to sell. Together they determine the price.'),
  t(5, '### Why Do Prices Change?\n\nPrices do not stay the same forever. Here are the main reasons prices change:\n\n| Reason | Explanation | South African example |\n|--------|-----------|---------------------|\n| **Demand changes** | If more people want something, the price goes up | Christmas gifts — demand rises in December, prices rise |\n| **Supply changes** | If there is less of something available, the price goes up | A drought kills crops, so vegetable prices rise |\n| **Cost of production rises** | If it costs more to make something, the price goes up | Petrol price increases make transport and food more expensive |\n| **Competition** | More sellers means lower prices | Two spaza shops on the same street lower prices to win customers |\n| **Seasons** | Products cost more in the season when demand is highest | Warm clothes cost more in winter |\n\n### Formal and Informal Markets\n\nSouth Africa has both **formal** and **informal** markets:\n\n| Feature | Formal market | Informal market |\n|---------|-------------|----------------|\n| **Registration** | Registered with SARS, pays tax | Usually not registered |\n| **Location** | Fixed shop or office | Street corner, taxi rank, home |\n| **Examples** | Shoprite, Woolworths, Capitec | Street vendors, spaza shops, hawkers |\n| **Receipts** | Issues receipts | Usually no receipts |\n| **Prices** | Fixed prices on labels | Often negotiable (you can bargain) |\n\n**Both are important!** Informal markets provide jobs for millions of South Africans and serve communities that formal shops do not always reach.'),
  q(6, 'If there is a drought and fewer vegetables are available, what will most likely happen to vegetable prices?',
    ['Prices will go up because supply has decreased', 'Prices will go down', 'Prices will stay the same', 'Vegetables will be free'], 0,
    'When supply decreases (fewer vegetables available) but demand stays the same, prices go up. Less supply + same demand = higher prices.'),
  t(7, '### The Role of Competition\n\nCompetition happens when many sellers offer the same or similar products. Competition is **good for consumers** because:\n\n- Sellers must offer **lower prices** to attract customers\n- Sellers must provide **better quality** to stand out\n- Sellers must offer **better service** to keep customers happy\n\n**Example:**\nThere are two tuck shops at your school. Tuck Shop A sells a packet of chips for R8. Tuck Shop B sells the same chips for R6. Where will you buy your chips?\n\nMost people will go to Tuck Shop B. To keep customers, Tuck Shop A must either:\n- Lower its price, OR\n- Offer something extra (like a free drink with purchase)\n\n**Without competition**, a seller can charge any price they want because you have no other choice. This is why competition is important in the economy.\n\n**South African competition example:** Cell phone networks (Vodacom, MTN, Cell C, Telkom) compete on price. This has made airtime and data cheaper over the years.'),
  fb(8, 'When many sellers offer similar products and try to win customers, this is called ___. In South Africa, markets that operate on street corners and are usually not registered are called ___ markets.',
    ['competition', 'informal'],
    'Competition means multiple sellers competing for customers, which drives prices down and quality up. Informal markets include street vendors, spaza shops, and hawkers.'),
  q(9, 'Why is competition between sellers good for consumers?',
    ['It pushes prices down and quality up as sellers try to win customers', 'It means there are fewer products to choose from', 'It makes products more expensive', 'It helps sellers make more profit'], 0,
    'Competition forces sellers to lower prices, improve quality, and offer better service to attract and keep customers. This benefits consumers.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Market** | Any place where buyers and sellers come together to trade |\n| **Demand** | How much of a product people want to buy |\n| **Supply** | How much of a product sellers have available |\n| **High demand + low supply** | Prices go up |\n| **Low demand + high supply** | Prices go down |\n| **Formal market** | Registered businesses (shops, banks) |\n| **Informal market** | Unregistered sellers (street vendors, spaza shops) |\n| **Competition** | Multiple sellers competing for customers — good for consumers |\n\n**Activity idea:** Visit a local shop or market with a family member. Look at the prices of five common items (bread, milk, eggs, sugar, cooking oil). Then compare them with the prices at a different shop. Which shop offers better value?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Entrepreneurship (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Entrepreneurship ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Entrepreneurship\n\nAn **entrepreneur** is a person who starts their own business. Entrepreneurs see a need or a gap in the market and create a product or service to fill it.\n\n### Why Are Entrepreneurs Important?\n\nEntrepreneurs play a crucial role in South Africa:\n\n| Contribution | How it helps |\n|-------------|-------------|\n| **Create jobs** | They hire people, which reduces unemployment |\n| **Provide goods and services** | They make products people need and want |\n| **Drive innovation** | They come up with new ideas and better ways of doing things |\n| **Grow the economy** | Successful businesses pay taxes and boost economic activity |\n| **Solve problems** | They find solutions to everyday challenges |\n\n### South African Entrepreneurs\n\n| Entrepreneur | Business | What they did |\n|-------------|---------|---------------|\n| **Nicky Newton-King** | Johannesburg Stock Exchange (JSE) | Led the largest stock exchange in Africa |\n| **Herman Mashaba** | Black Like Me | Built one of SA\'s most successful hair care brands |\n| **Lebo Gunguluza** | GEM Group | Created jobs in call centres across SA |\n| **Rapelang Rabana** | Rekindle Learning | Built a technology platform for education |\n\nMany everyday South Africans are also entrepreneurs — the woman selling vetkoek at the taxi rank, the man fixing cell phones at the market, the teenager washing cars on weekends.'),
  t(2, '### Characteristics of a Good Entrepreneur\n\nNot everyone becomes a successful entrepreneur, but anyone can develop these skills:\n\n| Characteristic | What it means | Example |\n|---------------|-------------|--------|\n| **Hardworking** | Willing to put in long hours and effort | Working evenings and weekends to grow the business |\n| **Creative** | Comes up with new ideas | Finding a new way to sell products using WhatsApp |\n| **Risk-taker** | Willing to try new things, even if they might fail | Spending savings to start a business, not knowing if it will succeed |\n| **Problem-solver** | Finds solutions to challenges | When supplies are late, finding another supplier |\n| **Determined** | Does not give up when things get tough | Trying again after a business fails |\n| **Good with people** | Treats customers and workers well | Smiling, being polite, and listening to customer needs |\n| **Organised** | Keeps records and plans ahead | Writing down sales, costs, and profits every day |\n\n### How Entrepreneurs Make Money\n\nEntrepreneurs make money by selling goods or services for more than they cost to produce:\n\n**Cost price** — what it costs to make or buy the product\n**Selling price** — what the customer pays\n**Profit = Selling price – Cost price**\n\n**Example:**\nAmanda buys apples for R2 each. She sells them for R5 each.\nProfit per apple = R5 – R2 = **R3 profit**\n\nIf she sells 20 apples: 20 × R3 = **R60 profit**'),
  q(3, 'What is an entrepreneur?',
    ['A person who starts and runs their own business', 'A person who works for the government', 'A person who only buys goods', 'A person who saves money at the bank'], 0,
    'An entrepreneur is someone who starts their own business, usually by identifying a need in the market and creating a product or service to meet it.'),
  fb(4, 'Profit is calculated as selling price minus ___. Entrepreneurs help the economy by creating ___ for other people.',
    ['cost price', 'jobs'],
    'Profit = Selling price – Cost price. One of the most important contributions of entrepreneurs is creating employment opportunities.'),
  t(5, '### Starting a Small Business Idea\n\nYou do not have to wait until you are grown up to think like an entrepreneur! Here are business ideas that Grade 6 learners could start with help from parents:\n\n| Business idea | What you sell | Start-up cost |\n|-------------|-------------|---------------|\n| **Friendship bracelets** | Handmade bracelets to classmates | R30 for thread and beads |\n| **Car washing** | Car wash service in your neighbourhood | R20 for soap, sponge, and bucket |\n| **Baking** | Muffins or cookies sold at school events | R50 for ingredients |\n| **Tutoring** | Help younger learners with homework | R0 (just your time and knowledge) |\n| **Garden service** | Mowing lawns and pulling weeds | R0 if you borrow family tools |\n\n### Steps to Start a Small Business\n\n1. **Find a need** — What do people around you need or want? What problem can you solve?\n2. **Plan your product or service** — What will you sell? How will you make or provide it?\n3. **Calculate costs** — How much money do you need to start? What are your costs?\n4. **Set a price** — Your selling price must cover your costs and leave a profit\n5. **Find customers** — Tell people about your business (word of mouth, posters, WhatsApp)\n6. **Keep records** — Write down every sale and every cost\n7. **Improve and grow** — Listen to feedback and make your product or service better'),
  q(6, 'Amanda buys oranges for R3 each and sells them for R7 each. She sells 15 oranges. What is her total profit?',
    ['R60', 'R105', 'R45', 'R15'], 0,
    'Profit per orange = R7 – R3 = R4. Total profit = 15 × R4 = R60.'),
  t(7, '### The Tuck Shop Business — A South African Classic\n\nMany South African entrepreneurs start with a **tuck shop** (also called a spaza shop). Let us look at how a simple tuck shop works:\n\n**Themba\'s Tuck Shop Plan:**\n\n| Item | Cost price (what Themba pays) | Selling price (what customers pay) | Profit per item |\n|------|----------------------------|----------------------------------|----------------|\n| Packet of chips | R5 | R8 | R3 |\n| Cold drink (330ml) | R6 | R10 | R4 |\n| Lollipop | R1 | R3 | R2 |\n| Biscuits | R4 | R7 | R3 |\n\n**In one day, Themba sells:**\n- 10 packets of chips: 10 × R3 = R30 profit\n- 8 cold drinks: 8 × R4 = R32 profit\n- 15 lollipops: 15 × R2 = R30 profit\n- 5 packets of biscuits: 5 × R3 = R15 profit\n\n**Total daily profit = R30 + R32 + R30 + R15 = R107**\n\n### Challenges Entrepreneurs Face\n\n| Challenge | How to overcome it |\n|-----------|-------------------|\n| Not enough money to start | Start small; borrow from family; save up |\n| Competition | Offer better prices, quality, or service |\n| Customers do not pay | Ask for cash upfront; do not sell on credit |\n| Running out of stock | Keep track of what sells fast and restock in time |\n| Losing motivation | Remember your goals; celebrate small wins |'),
  fb(8, 'A small informal shop in a township is often called a ___ shop. The first step in starting a business is to find a ___ that people have.',
    ['spaza', 'need'],
    'A spaza shop (or tuck shop) is a common informal business in South African townships. Successful businesses start by identifying a need that people are willing to pay to have met.'),
  q(9, 'Which of the following is a characteristic of a successful entrepreneur?',
    ['Being determined and not giving up when things get tough', 'Giving up after the first problem', 'Waiting for the government to help', 'Only working when they feel like it'], 0,
    'Determination is a key characteristic of successful entrepreneurs. Businesses face many challenges, and the ability to keep going when things are difficult is essential.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Entrepreneur** | A person who starts and runs their own business |\n| **Profit** | Selling price minus cost price |\n| **Cost price** | What it costs to buy or make a product |\n| **Selling price** | What the customer pays |\n| **Characteristics** | Hardworking, creative, risk-taker, determined, organised |\n| **Spaza / tuck shop** | A common small business in South African communities |\n\n**Key message:** You do not need to be rich or old to be an entrepreneur. You need an idea, hard work, and the willingness to learn from mistakes.\n\n**Activity idea:** Think of a business you could start at school or in your community. Write down: (1) What you would sell, (2) Who your customers would be, (3) How much it would cost, and (4) How much you would charge.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: The Government and the Economy (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The Government and the Economy ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## The Government and the Economy\n\nThe government plays a very important role in our daily lives. It uses money collected from **taxes** to provide services that everyone needs.\n\n### What Are Taxes?\n\n**Tax** is money that people and businesses must pay to the government. The government uses this money to provide services and build things that help the whole country.\n\n### Types of Tax in South Africa\n\n| Type of tax | Who pays it | How it works |\n|------------|-----------|-------------|\n| **Income tax** | People who earn a salary or wages | A percentage of your earnings goes to the government |\n| **VAT (Value Added Tax)** | Everyone who buys goods and services | 15% is added to the price of most products |\n| **Company tax** | Businesses that make a profit | Companies pay a portion of their profits to the government |\n\n### Where Does Tax Money Go?\n\nTax money (also called **government revenue**) is used to pay for services that benefit everyone:\n\n| Service | What it provides | Why it matters |\n|---------|-----------------|---------------|\n| **Education** | Public schools, free textbooks, school feeding schemes | Every child deserves to learn |\n| **Health care** | Public hospitals and clinics | People need medical care when they are sick |\n| **Safety** | Police (SAPS), fire brigade, ambulances | We need protection from crime and emergencies |\n| **Infrastructure** | Roads, bridges, dams, electricity | Without these, the country cannot function |\n| **Social grants** | Child support, old age pension, disability grants | Helps people who cannot earn an income |'),
  t(2, '### Basic Services the Government Provides\n\nThe government is responsible for providing **basic services** to all South Africans. Basic services are things that communities need to live safely and healthily.\n\n| Basic service | Who provides it | Why it is important |\n|-------------|----------------|--------------------|\n| **Clean water** | Local municipality | You need clean water to drink, cook, and wash |\n| **Electricity** | Eskom (national) and municipalities | Needed for cooking, lighting, heating, and powering devices |\n| **Roads** | National, provincial, and local government | People and goods need to move around the country |\n| **Refuse removal** | Local municipality | Rubbish must be collected to keep communities clean and healthy |\n| **Sewerage** | Local municipality | Proper sanitation prevents disease |\n| **Street lights** | Local municipality | Safety at night |\n\n### How the Government Helps Communities\n\n**Social grants in South Africa:**\n\n| Grant | Who receives it | Amount (approximate) |\n|-------|---------------|--------------------|\n| **Child Support Grant** | Children under 18 (paid to caregiver) | R530 per month |\n| **Old Age Pension** | People over 60 | R2 180 per month |\n| **Disability Grant** | People who cannot work due to disability | R2 180 per month |\n| **Foster Child Grant** | Foster parents caring for orphaned children | R1 180 per month |\n\nOver **18 million** South Africans receive social grants. These grants help families meet their basic needs.'),
  q(3, 'VAT in South Africa is currently:',
    ['15% added to the price of most goods and services', '10% of your salary', '20% of company profits', 'A voluntary donation to the government'], 0,
    'VAT (Value Added Tax) is 15% and is added to the price of most goods and services in South Africa. Every time you buy something, you pay VAT.'),
  fb(4, 'Money that people and businesses pay to the government is called ___. The government uses this money to provide services like education, health care, and ___.',
    ['tax', 'roads'],
    'Taxes are compulsory payments to the government. Tax revenue is used to fund public services including education, health care, roads, police, and social grants.'),
  t(5, '### Why Do We Pay Tax?\n\nSome people might wonder: "Why should I pay tax?" Here are the reasons:\n\n1. **We all use government services** — roads, police, schools, hospitals\n2. **Tax helps the poor** — social grants, free housing, and free health care are funded by taxes\n3. **Tax builds the country** — infrastructure like roads, bridges, and dams cost billions of rands\n4. **It is the law** — South African tax law (administered by SARS) requires people and businesses to pay their fair share\n5. **Everyone benefits** — even if you do not use a hospital today, you might need one tomorrow\n\n### SARS — The South African Revenue Service\n\n**SARS** is the government agency that collects taxes. It makes sure that people and businesses pay the correct amount of tax.\n\n- SARS stands for **South African Revenue Service**\n- It was established in 1997\n- It collects income tax, VAT, and other taxes\n- If someone does not pay their taxes, SARS can take legal action\n\n### What Happens When People Do Not Pay Tax?\n\nIf people and businesses do not pay tax:\n- The government has less money for services\n- Roads do not get repaired\n- Hospitals and schools lack supplies\n- Social grants could be reduced\n- The whole country suffers\n\nThis is why paying tax is both a **legal duty** and a **moral responsibility**.'),
  q(6, 'What does SARS stand for?',
    ['South African Revenue Service', 'South African Road Service', 'South African Reserve System', 'Southern African Regional Services'], 0,
    'SARS stands for the South African Revenue Service. It is the government body responsible for collecting taxes from individuals and businesses.'),
  t(7, '### Government Spending in Your Community\n\nLook around your community. You can see where the government has spent money:\n\n- **The road you walk or drive on** — built and maintained by government\n- **Your school** — if it is a public school, the government pays for buildings and teachers\n- **Street lights** — installed by the local municipality\n- **Clinics and hospitals** — the government funds public health care\n- **RDP houses** — built by government for families who need homes\n- **Police stations** — the government funds the South African Police Service\n\n### Challenges the Government Faces\n\n| Challenge | What it means |\n|-----------|-------------|\n| **Not enough money** | There are more needs than there is tax money to pay for them |\n| **Corruption** | Some officials steal public money instead of using it for services |\n| **Unemployment** | Fewer employed people = less income tax collected |\n| **Growing population** | More people need services, but the budget does not grow as fast |\n| **Load shedding** | Eskom struggles to produce enough electricity for everyone |\n\n**What can citizens do?**\n- Pay taxes honestly\n- Report corruption\n- Use public services responsibly (do not waste water or electricity)\n- Vote in elections to choose good leaders'),
  fb(8, 'The government agency that collects taxes in South Africa is called ___. Over ___ million South Africans receive social grants.',
    ['SARS', '18'],
    'SARS (South African Revenue Service) collects taxes. More than 18 million South Africans depend on social grants to meet basic needs.'),
  q(9, 'Why does the government provide social grants?',
    ['To help people who cannot earn enough income to meet their basic needs', 'To make people lazy', 'To punish businesses', 'Because the government has unlimited money'], 0,
    'Social grants support people who cannot earn an income — children, the elderly, and people with disabilities. They help ensure that basic needs are met.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Tax** | Money people and businesses must pay to the government |\n| **VAT** | Value Added Tax — 15% added to most goods and services |\n| **SARS** | South African Revenue Service — collects taxes |\n| **Basic services** | Water, electricity, roads, sanitation, refuse removal |\n| **Social grants** | Government payments to people in need (children, elderly, disabled) |\n| **Government revenue** | The total money the government collects from taxes |\n\n**Key message:** The government uses our tax money to provide services we all need. Without taxes, there would be no public schools, hospitals, roads, or police. It is everyone\'s responsibility to contribute.\n\n**Activity idea:** Make a list of 5 things in your community that the government has provided (roads, schools, clinics, street lights, etc.). Next to each one, write how it helps people in your area.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Trade (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Trade ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Trade\n\n**Trade** means buying and selling goods and services between people, businesses, or countries. Trade is one of the oldest human activities — people have been trading for thousands of years.\n\n### Why Do People Trade?\n\nNo single person, community, or country can produce everything it needs. Trade allows us to get things we cannot make ourselves.\n\n**Example:** South Africa grows great oranges and mines gold, but we cannot grow bananas as well as Mozambique does, and we do not manufacture smartphones like South Korea does. So we **trade** — we sell what we are good at making, and buy what others are good at making.\n\n### Types of Trade\n\n| Type | Description | Example |\n|------|-----------|--------|\n| **Local trade** | Buying and selling within your own town or city | Buying bread from the local bakery |\n| **National trade** | Buying and selling between provinces in the same country | Cape Town wine sold to shops in Gauteng |\n| **International trade** | Buying and selling between different countries | South Africa sells gold to China |\n\n### Imports and Exports\n\nTwo key words you need to know:\n\n| Term | Meaning | Example |\n|------|---------|--------|\n| **Export** | Goods sent OUT of a country to be sold elsewhere | South Africa exports gold to other countries |\n| **Import** | Goods brought INTO a country from elsewhere | South Africa imports electronics from China |'),
  t(2, '### What Does South Africa Export?\n\nSouth Africa exports many valuable products to the rest of the world:\n\n| Export product | Details |\n|---------------|--------|\n| **Gold** | SA was once the world\'s biggest gold producer. Gold is mined mainly in Gauteng |\n| **Platinum** | SA has the world\'s largest platinum reserves. Used in car parts and jewellery |\n| **Coal** | Used for electricity generation. Exported through Richards Bay port |\n| **Fruit** | Oranges, grapes, apples, and pears. Western Cape and Limpopo are major growing regions |\n| **Wine** | SA wine is famous worldwide, especially from the Western Cape |\n| **Motor vehicles** | Cars and trucks made in factories in Eastern Cape and KwaZulu-Natal |\n| **Iron and steel** | Raw iron ore and manufactured steel |\n\n### What Does South Africa Import?\n\n| Import product | Details |\n|---------------|--------|\n| **Oil (crude petroleum)** | SA does not produce enough oil, so we import it for petrol and diesel |\n| **Electronics** | Smartphones, computers, and televisions from China, South Korea, and Japan |\n| **Machinery** | Factory machines and equipment |\n| **Medicines** | Pharmaceutical products from Europe and India |\n| **Clothing** | Cheap clothes from China and Bangladesh |\n\n### South Africa\'s Trading Partners\n\nOur biggest trading partners include:\n- **China** — our largest trading partner (we export raw materials and import manufactured goods)\n- **Germany** — trade in cars and machinery\n- **United States** — exports of minerals and fruit\n- **India** — trade in medicines and textiles\n- **Countries in Africa** — SA trades with neighbours like Botswana, Mozambique, and Namibia through SADC'),
  q(3, 'What does it mean to EXPORT a product?',
    ['To send goods out of a country to be sold in another country', 'To buy goods from another country', 'To sell goods at a local market', 'To throw goods away'], 0,
    'Exporting means sending goods out of your country to sell them in other countries. South Africa exports gold, fruit, wine, and cars to the rest of the world.'),
  fb(4, 'Goods sent out of a country are called ___. Goods brought into a country from elsewhere are called ___.',
    ['exports', 'imports'],
    'Exports leave the country (e.g. SA gold sold to China). Imports come into the country (e.g. electronics from China to SA).'),
  t(5, '### Why Do Countries Trade?\n\nCountries trade because no single country can produce everything efficiently. Each country focuses on what it does best.\n\n| Reason for trade | Explanation | South African example |\n|-----------------|-----------|---------------------|\n| **Natural resources** | Some countries have resources others do not | SA has gold and platinum; Middle East has oil |\n| **Climate** | Different climates grow different crops | SA grows great citrus fruit; Brazil grows coffee |\n| **Skills and technology** | Some countries are better at making certain things | Japan is great at electronics; SA is great at mining |\n| **Variety** | Trade gives us access to goods from all over the world | You can eat Japanese sushi, wear Italian shoes, and use an American phone — all in South Africa |\n| **Lower prices** | Some countries can make things more cheaply | Clothing from China is often cheaper than locally made clothing |\n\n### Trade Creates Jobs\n\nTrade is important for creating jobs in South Africa:\n\n- **Farms** that grow fruit for export employ thousands of workers\n- **Mines** that extract gold and platinum employ hundreds of thousands\n- **Factories** that make cars for export provide jobs in the Eastern Cape and KwaZulu-Natal\n- **Ports** in Durban, Cape Town, and Richards Bay employ dockworkers, truck drivers, and logistics staff\n- **Tourism** (a type of service export) brings visitors who spend money in SA — creating jobs in hotels, restaurants, and tour companies'),
  q(6, 'Why does South Africa import crude oil (petroleum)?',
    ['Because SA does not produce enough oil for its own needs', 'Because imported oil is better quality', 'Because SA has no cars', 'Because the government wants to spend money abroad'], 0,
    'South Africa does not have large oil reserves, so we must import crude oil from other countries to make petrol and diesel for our cars and transport.'),
  t(7, '### Ports — Where Trade Happens\n\nMost international trade happens through **ports** — places where ships load and unload goods.\n\nSouth Africa\'s major trading ports:\n\n| Port | Location | What it handles |\n|------|----------|----------------|\n| **Durban** | KwaZulu-Natal | The busiest port in Africa — handles containers, cars, and general cargo |\n| **Richards Bay** | KwaZulu-Natal | Coal and mineral exports |\n| **Cape Town** | Western Cape | Fruit exports, container shipping |\n| **Port Elizabeth (Gqeberha)** | Eastern Cape | Car exports — many car factories are nearby |\n| **Saldanha Bay** | Western Cape | Iron ore exports |\n\n### Trade and You\n\nEven as a Grade 6 learner, you are connected to international trade every day:\n\n- Your **school uniform** may contain cotton imported from India\n- Your **cell phone** was probably imported from China or South Korea\n- The **fruit** you eat at break might be grown in SA for export, and some is sold locally\n- The **petrol** in your family\'s car came from imported crude oil\n- Your **stationery** may have been manufactured in another country\n\nTrade connects South Africa to the rest of the world. By exporting what we are good at and importing what others make better or cheaper, everyone benefits.'),
  fb(8, 'The busiest port in Africa is the port of ___. South Africa\'s largest trading partner is ___.',
    ['Durban', 'China'],
    'The Port of Durban in KwaZulu-Natal is the busiest port on the African continent. China is South Africa\'s largest trading partner.'),
  q(9, 'Which of the following is a South African EXPORT product?',
    ['Gold mined in Gauteng', 'Smartphones from South Korea', 'Oil from the Middle East', 'Clothing from China'], 0,
    'Gold is one of South Africa\'s most important exports — it is mined in SA and sold to other countries. Smartphones, oil, and cheap clothing are imported into SA.'),
  t(10, '### Summary\n\n| Key concept | Meaning |\n|------------|--------|\n| **Trade** | Buying and selling goods and services |\n| **Export** | Goods sent out of a country to be sold elsewhere |\n| **Import** | Goods brought into a country from elsewhere |\n| **International trade** | Trade between different countries |\n| **SA exports** | Gold, platinum, coal, fruit, wine, cars |\n| **SA imports** | Oil, electronics, machinery, medicines, clothing |\n| **Ports** | Where ships load and unload goods for trade (Durban, Richards Bay, Cape Town) |\n| **Trading partners** | Countries we trade with — China is our biggest |\n\n**Key message:** No country can produce everything on its own. By trading with other countries, South Africa gets the goods it needs and earns money from selling what it produces best.\n\n**Activity idea:** Look at 5 products in your home (clothing labels, electronic devices, food packaging). Where were they made? How many come from other countries? This shows you how international trade affects your daily life.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 6
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 6/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 6:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 6', schoolId: SCHOOL_ID, orderIndex: 6,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 6:', String(GRADE_ID));
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
    tags: ['grade-6', 'ems', 'caps'],
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
      description: 'The difference between needs and wants, basic needs (food, shelter, clothing), unlimited wants vs limited resources, prioritising spending, and opportunity cost.',
      order: 1,
      lessons: [
        { title: 'Understanding Needs and Wants', description: 'Defining needs and wants; telling them apart; unlimited wants and limited resources (scarcity); prioritising needs before wants; opportunity cost; needs and wants in South Africa.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Goods and Services',
      description: 'What are goods and services, the difference between tangible goods and intangible services, producers and consumers, South African business examples, and the three sectors of the economy.',
      order: 2,
      lessons: [
        { title: 'Goods and Services', description: 'Tangible goods vs intangible services; types of goods; producers and consumers; SA business examples (Shoprite, Woolworths, Capitec); the three sectors of the economy.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Money and its Role',
      description: 'The history of money from barter to digital payments, South African currency (the rand), the role of the SARB, and the four functions of money.',
      order: 3,
      lessons: [
        { title: 'Money and its Role', description: 'Bartering and its problems; the history of money; South African currency (rand and cents); the South African Reserve Bank; the four functions of money; types of money in use today.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Income and Expenses',
      description: 'Sources of income (salary, wages, pocket money), types of expenses (fixed and variable), keeping track of spending, and simple income statements.',
      order: 4,
      lessons: [
        { title: 'Income and Expenses', description: 'What is income; types of income (salary, wages, pocket money, grants); what are expenses; fixed vs variable expenses; keeping records; the simple income statement; surplus and deficit.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Saving and Budgeting',
      description: 'Why we save, setting savings goals, creating a simple budget, the savings formula (income minus expenses), and bank savings accounts for young people.',
      order: 5,
      lessons: [
        { title: 'Saving and Budgeting', description: 'Why save; savings goals; what is a budget; creating a simple budget; the savings formula; tips for saving more; youth bank accounts; common budgeting mistakes.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Buying Wisely',
      description: 'Being a smart consumer, comparing prices, recognising advertising tricks, consumer rights, and the Consumer Protection Act in South Africa.',
      order: 6,
      lessons: [
        { title: 'Buying Wisely', description: 'What is a smart consumer; comparing prices; advertising tricks (bandwagon, celebrity endorsement, emotional appeal); consumer rights; the Consumer Protection Act; saving money when shopping.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: The Market',
      description: 'What is a market, types of markets, supply and demand (basic concepts), why prices change, formal and informal markets, competition, and South African market examples.',
      order: 7,
      lessons: [
        { title: 'The Market', description: 'What is a market; types of markets; buyers and sellers; supply and demand basics; why prices change; formal vs informal markets; the role of competition; SA market examples.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Entrepreneurship',
      description: 'What is an entrepreneur, characteristics of successful entrepreneurs, South African entrepreneur stories, profit calculation, starting a small business idea, and the tuck shop business.',
      order: 8,
      lessons: [
        { title: 'Entrepreneurship', description: 'What is an entrepreneur; why entrepreneurs matter; SA entrepreneurs; characteristics of good entrepreneurs; profit = selling price minus cost price; business ideas for learners; the tuck shop business; challenges entrepreneurs face.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: The Government and the Economy',
      description: 'What the government does with tax money, types of tax (income tax, VAT), basic services (water, electricity, roads), SARS, social grants, and why we pay tax.',
      order: 9,
      lessons: [
        { title: 'The Government and the Economy', description: 'What are taxes; types of tax (income tax, VAT, company tax); where tax money goes; basic services; social grants; SARS; why we pay tax; challenges the government faces.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Trade',
      description: 'What is trade, why countries trade, South African exports (gold, fruit, wine, cars), South African imports (oil, electronics), trading partners, and the role of ports.',
      order: 10,
      lessons: [
        { title: 'Trade', description: 'What is trade; types of trade (local, national, international); imports and exports; SA exports and imports; why countries trade; trade creates jobs; SA ports (Durban, Richards Bay, Cape Town); SA trading partners.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 6 EMS \u2014 CAPS Textbook',
    description: 'Introductory CAPS-aligned textbook covering foundational economic literacy concepts for Grade 6 learners: needs and wants, goods and services, money and its role, income and expenses, saving and budgeting, buying wisely, the market, entrepreneurship, the government and the economy, and trade.',
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
  console.log('  TEXTBOOK: Grade 6 EMS');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
