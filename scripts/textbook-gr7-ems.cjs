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
// CHAPTER 1: The Economy — History of Money (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The History of Money ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The History of Money\n\nBefore money existed, people used a system called **bartering** to get the things they needed. Money was invented to solve the problems of bartering, and it has changed many times throughout history.\n\n### What Is Bartering?\n\n**Bartering** means swapping one good or service directly for another good or service — without using money.\n\n**Example:** A farmer gives a bag of maize to a potter in exchange for a clay pot.\n\n### Problems with Bartering\n\n| Problem | Explanation | Example |\n|---------|-----------|--------|\n| **Double coincidence of wants** | Both people must want what the other has | The farmer wants a pot, but the potter does not want maize |\n| **No standard of value** | It is hard to decide how much one item is worth compared to another | How many eggs equal one goat? |\n| **Goods are not divisible** | You cannot split a cow in half to buy something small | You need half a cow\'s worth of grain |\n| **Goods are perishable** | Some items rot or spoil before they can be traded | Fish, fruit, and milk go bad quickly |\n| **Hard to store wealth** | Goods take up space and cannot be saved easily | You cannot store 100 bags of maize for years |'),
  t(2, '### The Development of Money\n\nTo solve the problems of bartering, people began using items that everyone agreed had value. Over time, money has evolved through several stages.\n\n| Stage | Type of money | Examples |\n|-------|-------------|----------|\n| **1. Commodity money** | Useful items used as money | Cattle, shells, salt, beads, tobacco |\n| **2. Metal coins** | Pieces of precious metal stamped with a value | Gold coins, silver coins |\n| **3. Paper money (banknotes)** | Paper notes backed by gold or government promise | South African rand notes |\n| **4. Bank deposits** | Money kept in bank accounts | Savings accounts, current accounts |\n| **5. Electronic money** | Digital transactions and online payments | EFT, debit cards, credit cards |\n| **6. Mobile money** | Payments using mobile phones | e-Wallet, SnapScan, Capitec app |\n\n### South African Money\n\nSouth Africa\'s currency is the **rand (R)**, divided into 100 **cents (c)**.\n\n- The rand was introduced on **14 February 1961** when South Africa became a republic\n- Before the rand, South Africans used **pounds, shillings, and pence**\n- South African banknotes feature the face of **Nelson Mandela** and images of the **Big Five** animals\n- The **South African Reserve Bank (SARB)** is the only institution that can print and issue rand notes and coins'),
  q(3, 'The main problem with bartering that money was invented to solve is:',
    ['The double coincidence of wants — both people must want what the other has', 'People did not like trading with each other', 'There were too many items to choose from', 'The government banned bartering'], 0,
    'The double coincidence of wants means both traders must want exactly what the other person offers. Money removes this problem because everyone accepts money.'),
  fb(4, 'Bartering means swapping goods or services without using ___. South Africa\'s currency is called the ___.',
    ['money', 'rand'],
    'Bartering is trade without money. The rand (R) is South Africa\'s currency, introduced in 1961.'),
  t(5, '### Forms of Money in Circulation Today\n\nIn modern South Africa, several forms of money are used at the same time:\n\n**1. Coins:** R5, R2, R1, 50c, 20c, 10c\n\n**2. Banknotes:** R10, R20, R50, R100, R200\n\n**3. Electronic money:**\n- **Debit card:** Uses money already in your bank account\n- **Credit card:** Borrows money from the bank (you must pay it back with interest)\n- **EFT (Electronic Funds Transfer):** Sending money directly from one bank account to another\n- **Mobile payments:** SnapScan, Zapper, bank apps on your phone\n\n### Characteristics of Good Money\n\nFor something to work well as money, it must have certain characteristics:\n\n| Characteristic | What it means |\n|---------------|---------------|\n| **Acceptable** | Everyone must be willing to accept it |\n| **Durable** | It must last a long time and not fall apart |\n| **Divisible** | It must be easy to divide into smaller amounts |\n| **Portable** | It must be easy to carry around |\n| **Scarce** | It must not be too easy to find or make |\n| **Uniform** | Every unit must look the same and have the same value |'),
  q(6, 'Which of the following is a characteristic of good money?',
    ['It must be durable and not fall apart easily', 'It must be made of gold', 'It must be very large so it cannot be lost', 'It must be edible'], 0,
    'Good money must be durable — it needs to last through many transactions without falling apart. Coins and notes are designed to be durable.'),
  t(7, '### The Functions of Money\n\nMoney serves four important functions in the economy:\n\n| Function | What it means | Example |\n|----------|-------------|--------|\n| **Medium of exchange** | Money is used to buy and sell goods and services | You pay R20 for bread at the shop |\n| **Measure of value (unit of account)** | Money gives everything a price so we can compare values | A loaf of bread costs R20, a litre of milk costs R18 |\n| **Store of value** | Money can be saved and used later | You save R500 in your piggy bank for next month |\n| **Standard of deferred payment** | Money allows you to pay later (credit) | You buy a fridge and pay it off over 12 months |\n\n### Why Money Is Important\n\n- Without money, we would have to barter — which is slow and difficult\n- Money makes trade faster and easier\n- Money allows people to save for the future\n- Money allows businesses to set prices and calculate profits\n- Money allows the government to collect taxes and provide services'),
  fb(8, 'The four functions of money are: medium of exchange, measure of value, store of value, and standard of ___ payment. The ___ prints and issues South African money.',
    ['deferred', 'South African Reserve Bank'],
    'Deferred payment means paying later (e.g. buying on credit). The South African Reserve Bank (SARB) is responsible for printing and issuing all rand notes and coins.'),
  q(9, 'A farmer in the past could not split a cow in half to buy a small item. This illustrates which problem of bartering?',
    ['Goods are not divisible', 'Double coincidence of wants', 'Goods are perishable', 'No standard of value'], 0,
    'Divisibility is a problem with bartering — many goods cannot be easily divided into smaller units. Money solves this because coins and notes come in different denominations.'),
  t(10, '### Modern Money and Technology\n\nTechnology has changed how we use money:\n\n**Cashless society:** More people are paying electronically instead of using cash. In South Africa, the use of debit cards and mobile payments is growing rapidly.\n\n**Advantages of electronic money:**\n- Faster transactions\n- Safer than carrying large amounts of cash\n- Easy to track spending\n- Can pay from anywhere using your phone\n\n**Disadvantages of electronic money:**\n- Requires internet or cell phone signal\n- Cybercrime and fraud risks\n- Not everyone has access to a bank account or smartphone\n- Load shedding can prevent electronic payments\n\n**Key insight:** Although money has changed from cattle and shells to digital payments, its basic functions remain the same — it helps us exchange goods and services, measure value, save wealth, and make future payments.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: The Economy — Needs and Wants (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Needs, Wants, and Scarcity ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Needs, Wants, and Scarcity\n\nEvery person has **needs** and **wants**. Understanding the difference between them is a key concept in Economics.\n\n### What Are Needs?\n\n**Needs** are things that are essential for survival — you cannot live without them.\n\n| Type of need | Examples |\n|-------------|----------|\n| **Food and water** | Bread, rice, clean drinking water |\n| **Clothing** | Basic clothes to protect your body |\n| **Shelter** | A house or place to live |\n| **Health care** | Medicine, hospitals, clinics |\n| **Education** | School, books, learning |\n\n### What Are Wants?\n\n**Wants** are things that you would like to have but can live without. They make life more comfortable or enjoyable.\n\n| Examples of wants |\n|------------------|\n| A smartphone |\n| Designer clothing |\n| Sweets and cold drinks |\n| A holiday to Durban |\n| A PlayStation or Xbox |\n| Jewellery |\n\n**Key difference:** If you do not get a need, your health or safety is at risk. If you do not get a want, you are disappointed but still okay.'),
  t(2, '### Needs vs Wants — How to Tell the Difference\n\nSometimes it is tricky to decide if something is a need or a want. The answer depends on the **context** (the situation).\n\n| Item | Need or want? | Why? |\n|------|-------------|------|\n| A pair of school shoes | Need | Required for school; protects feet |\n| Nike Air Force trainers | Want | Expensive brand — basic shoes would do |\n| Clean water | Need | Essential for survival |\n| Coca-Cola | Want | Not essential; water is sufficient |\n| A warm jacket in winter | Need | Protects you from cold |\n| A Gucci jacket | Want | A basic jacket would keep you warm |\n| A cell phone for a doctor on call | Need | Must be reachable for emergencies |\n| A cell phone for playing games | Want | Entertainment, not essential |\n\n### Scarcity\n\n**Scarcity** means that people\'s wants are unlimited, but the resources to satisfy them are limited.\n\n- There is never enough money, time, or resources to give everyone everything they want\n- Scarcity forces people to make **choices**\n- Because we cannot have everything, we must decide what is most important\n\n**South African example:** The government has limited money. It must choose between building more schools OR building more hospitals. It cannot do everything at once.'),
  q(3, 'Which of the following is a NEED?',
    ['Clean drinking water', 'A PlayStation 5', 'A holiday to Cape Town', 'A pair of Nike trainers'], 0,
    'Clean drinking water is essential for survival — you cannot live without it. The other options are wants that make life more comfortable but are not essential.'),
  fb(4, 'Needs are things essential for ___. Scarcity means that wants are unlimited but resources are ___.',
    ['survival', 'limited'],
    'Needs are necessary for survival (food, water, shelter). Scarcity exists because we have unlimited wants but limited resources to satisfy them.'),
  t(5, '### Opportunity Cost\n\nBecause of scarcity, we must make choices. When we choose one thing, we give up something else. The thing we give up is called the **opportunity cost**.\n\n**Opportunity cost** is the next best alternative that you give up when you make a choice.\n\n**Examples:**\n\n| Choice made | Opportunity cost |\n|------------|------------------|\n| You spend R50 on airtime | The R50 you could have spent on lunch |\n| You study for a test on Saturday | The time you could have spent playing with friends |\n| Government builds a new road | The hospital it could have built instead |\n| A farmer plants maize | The sunflowers she could have planted instead |\n\n**Example in detail:**\nSipho has R100. He can buy:\n- Option A: A new book (R100)\n- Option B: A T-shirt (R100)\n- Option C: Two movie tickets (R100)\n\nSipho chooses the book. His opportunity cost is the **next best alternative** — the T-shirt (if that was his second choice). The movie tickets are not the opportunity cost because they were his third choice.\n\n**Key rule:** Opportunity cost is always the NEXT BEST option, not all the other options.'),
  q(6, 'Thandi has R200. She can buy shoes (R200), a bag (R200), or a dress (R200). She buys the shoes. Her second choice was the dress. What is her opportunity cost?',
    ['The dress', 'The bag', 'The shoes', 'R200'], 0,
    'Opportunity cost is the next best alternative given up. Thandi\'s second choice was the dress, so the dress is her opportunity cost.'),
  t(7, '### Making Good Choices\n\nBecause of scarcity, we must make wise decisions about how to use our resources. This is called **economising**.\n\n**Tips for making good economic choices:**\n\n1. **Prioritise needs before wants** — pay for food, shelter, and school fees before buying luxuries\n2. **Compare prices** — shop around before buying\n3. **Make a budget** — plan how to spend your money\n4. **Avoid impulse buying** — think before you buy\n5. **Save** — set aside money for emergencies and the future\n6. **Consider the opportunity cost** — what are you giving up?\n\n### Prioritising Needs\n\nA good way to prioritise is to use **Maslow\'s hierarchy of needs** (simplified):\n\n| Priority | Type of need | Examples |\n|----------|-------------|----------|\n| 1 (most urgent) | **Basic physiological needs** | Food, water, air, sleep |\n| 2 | **Safety needs** | Shelter, security, health care |\n| 3 | **Social needs** | Friends, family, belonging |\n| 4 | **Self-esteem needs** | Respect, achievement, confidence |\n| 5 (least urgent) | **Self-actualisation** | Reaching your full potential |'),
  fb(8, 'The next best alternative you give up when making a choice is called the ___. Choosing needs before wants is called ___.',
    ['opportunity cost', 'prioritising'],
    'Opportunity cost is what you sacrifice when making a choice. Prioritising means ranking items in order of importance, with needs coming first.'),
  q(9, 'Why must people make choices about how to spend their money?',
    ['Because resources are limited but wants are unlimited (scarcity)', 'Because money is illegal to save', 'Because the government tells them what to buy', 'Because shops close every day'], 0,
    'Scarcity forces people to choose. We have unlimited wants but limited money, so we must decide what is most important to spend on.'),
  t(10, '### Needs and Wants in South Africa\n\nSouth Africa faces many challenges related to needs and wants:\n\n**Challenges:**\n- Many South Africans lack access to basic needs like clean water, housing, and quality health care\n- High unemployment means many families cannot afford even basic needs\n- The gap between rich and poor is very large — some people have all their needs and many wants met, while others struggle to survive\n\n**What the government does:**\n- Provides **social grants** (child support grant R530 per month, old age pension R2 180 per month)\n- Builds **RDP houses** for low-income families\n- Provides **free basic water and electricity** to poor households\n- Funds **public schools and hospitals**\n- Provides **free school meals** through the National School Nutrition Programme\n\n**Your responsibility:**\n- Use resources wisely — do not waste water, electricity, or food\n- Learn to tell the difference between needs and wants\n- Make a budget and stick to it\n- Save money whenever you can\n\n**Key message:** Understanding needs, wants, scarcity, and opportunity cost helps you make better decisions about money and resources.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: The Economy — Goods and Services (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Goods and Services and the Sectors of the Economy ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Goods and Services\n\nThe economy produces two types of things to satisfy people\'s needs and wants: **goods** and **services**.\n\n### What Are Goods?\n\n**Goods** are physical (tangible) items that you can touch, see, and hold.\n\n| Type of good | Description | Examples |\n|-------------|-----------|----------|\n| **Consumer goods** | Final products used by people | Bread, clothes, smartphones |\n| **Capital goods** | Goods used to produce other goods | Factory machines, delivery trucks |\n| **Free goods** | Goods that nature provides at no cost | Air, sunlight, rain water |\n| **Economic goods** | Goods that are scarce and have a price | Food, petrol, clothing |\n\n### What Are Services?\n\n**Services** are actions or activities done for people. They are intangible — you cannot touch them.\n\n| Type of service | Examples |\n|----------------|----------|\n| **Personal services** | Haircuts, medical treatment, tutoring |\n| **Financial services** | Banking, insurance, loans |\n| **Transport services** | Uber, buses, trains, delivery |\n| **Government services** | Police, fire department, schools, clinics |\n| **Communication services** | Cell phone networks, internet, postal services |'),
  t(2, '### Differences Between Goods and Services\n\n| Feature | Goods | Services |\n|---------|-------|----------|\n| **Tangibility** | Tangible — can be touched | Intangible — cannot be touched |\n| **Storage** | Can be stored | Cannot be stored |\n| **Ownership** | Ownership passes to the buyer | No transfer of ownership |\n| **Production and use** | Produced first, used later | Produced and used at the same time |\n| **Quality** | Easier to check (look, touch, taste) | Harder to check before you experience it |\n\n**Examples:**\n- Buying a loaf of bread (good) — you take it home, eat it later\n- Getting a haircut (service) — it happens while you sit in the chair; you cannot store a haircut\n\n### How People Get Goods and Services\n\nPeople get goods and services in several ways:\n\n| Method | Description | Example |\n|--------|-----------|--------|\n| **Buying** | Paying money for goods or services | Buying groceries at Shoprite |\n| **Producing** | Making things yourself | A farmer growing vegetables |\n| **Government provision** | The government provides free or subsidised services | Free education at public schools |\n| **Charity/donations** | Receiving goods from NGOs or community organisations | Gift of the Givers providing food parcels |'),
  q(3, 'Which of the following is a SERVICE (not a good)?',
    ['A haircut at a salon', 'A loaf of bread', 'A pair of shoes', 'A school textbook'], 0,
    'A haircut is a service — it is an action done for you and cannot be touched or stored. Bread, shoes, and textbooks are tangible goods.'),
  fb(4, 'Goods are ___ items that can be touched. Services are ___ activities done for people.',
    ['tangible', 'intangible'],
    'Goods are tangible (physical). Services are intangible — you experience them but cannot touch them.'),
  t(5, '### The Three Sectors of the Economy\n\nAll economic activities can be grouped into three sectors:\n\n| Sector | What it does | Examples |\n|--------|-------------|----------|\n| **Primary sector** | Extracts raw materials from nature | Farming, fishing, mining, forestry |\n| **Secondary sector** | Manufactures (makes) products from raw materials | Factories, construction, food processing |\n| **Tertiary sector** | Provides services to people and businesses | Shops, banks, schools, hospitals, transport |\n\n### How the Sectors Are Connected\n\nThe three sectors work together like a chain:\n\n**Example: From farm to table**\n1. **Primary sector:** A farmer grows wheat (raw material)\n2. **Secondary sector:** A factory turns wheat into flour, then bakes bread (manufacturing)\n3. **Tertiary sector:** A shop sells the bread to customers (service/retail)\n\n**Example: From mine to car**\n1. **Primary sector:** A mine extracts iron ore\n2. **Secondary sector:** A factory turns iron into steel, then into car parts\n3. **Tertiary sector:** A car dealership sells the car; a mechanic services it\n\n**Key insight:** The primary sector provides inputs for the secondary sector. The secondary sector produces goods. The tertiary sector distributes goods and provides services.'),
  q(6, 'A factory that turns sugar cane into sugar operates in which sector?',
    ['Secondary sector (manufacturing)', 'Primary sector (farming)', 'Tertiary sector (services)', 'None of the sectors'], 0,
    'The factory manufactures a product (sugar) from a raw material (sugar cane). Manufacturing belongs to the secondary sector.'),
  t(7, '### Sectors of the Economy in South Africa\n\nSouth Africa\'s economy includes all three sectors, but the tertiary sector is the largest.\n\n| Sector | Contribution to GDP | Main industries |\n|--------|--------------------|-----------------|\n| **Primary** | About 10% | Mining (gold, platinum, coal), agriculture (maize, fruit, wine) |\n| **Secondary** | About 25% | Manufacturing (cars, food, chemicals), construction |\n| **Tertiary** | About 65% | Finance, retail, tourism, government services, telecommunications |\n\n### Producers, Consumers, and the Flow of Goods\n\n| Term | Definition | Example |\n|------|-----------|--------|\n| **Producer** | A person or business that makes or provides goods and services | A bakery that bakes bread |\n| **Consumer** | A person who buys and uses goods and services | A family that buys bread |\n| **Distributor** | A person or business that moves goods from producers to consumers | A truck company delivering bread to shops |\n\n**The flow:** Producer → Distributor → Consumer\n\n**Key fact:** Everyone is both a producer and a consumer. A teacher produces education services, but also consumes food, clothing, and transport.'),
  fb(8, 'The primary sector extracts ___ from nature. The tertiary sector provides ___ to people and businesses.',
    ['raw materials', 'services'],
    'Primary sector = raw materials (mining, farming). Tertiary sector = services (shops, banks, transport, schools).'),
  q(9, 'Which sector of the South African economy contributes the most to GDP?',
    ['The tertiary sector (about 65%)', 'The primary sector (about 65%)', 'The secondary sector (about 65%)', 'All three sectors contribute equally'], 0,
    'The tertiary (service) sector contributes about 65% of GDP, making it the largest sector in South Africa\'s economy.'),
  t(10, '### The Link Between Goods, Services, and Needs\n\nGoods and services exist to satisfy people\'s needs and wants:\n\n| Need | Goods that satisfy it | Services that satisfy it |\n|------|----------------------|------------------------|\n| **Food** | Bread, rice, vegetables | Restaurant meals, food delivery |\n| **Shelter** | Bricks, cement, roof tiles | Construction, plumbing, electrical work |\n| **Health** | Medicine, bandages | Doctor visits, hospital care |\n| **Education** | Textbooks, uniforms | Teaching, tutoring |\n| **Transport** | Cars, bicycles | Bus services, Uber, trains |\n\n**Using goods and services wisely:**\n- Recycle and reuse goods to reduce waste\n- Use services efficiently (e.g. do not waste electricity)\n- Support local producers and businesses\n- Buy South African products to support local jobs\n\n**Key message:** The economy exists to produce goods and services that satisfy needs and wants. Understanding the three sectors helps you see how the economy is organised.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: The Economy — Inequality and Poverty (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Inequality and Poverty in South Africa ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Inequality and Poverty\n\n**Inequality** means that wealth, income, and opportunities are not shared equally among people. **Poverty** means not having enough resources to meet basic needs.\n\nSouth Africa is one of the most unequal countries in the world.\n\n### Types of Inequality\n\n| Type | Description | Example |\n|------|-----------|--------|\n| **Income inequality** | Some people earn much more than others | A CEO earns R5 million per year; a farm worker earns R36 000 per year |\n| **Wealth inequality** | Some people own much more property and savings | Some families own multiple houses; others live in shacks |\n| **Social inequality** | Unequal access to education, health, and opportunities | Private schools have computers; some rural schools have no electricity |\n| **Gender inequality** | Women often earn less and have fewer opportunities than men | Women in SA earn about 23% less than men for the same work |\n\n### Causes of Inequality in South Africa\n\n- **Apartheid legacy:** For decades, black South Africans were denied quality education, land, and economic opportunities\n- **Unemployment:** Over 30% of South Africans are unemployed\n- **Unequal education:** The quality of education varies greatly between schools\n- **Unequal land ownership:** A small percentage of people own most of the productive land\n- **Discrimination:** Some people still face barriers based on race, gender, or disability'),
  t(2, '### The Difference Between Urban and Rural Areas\n\n| Feature | Urban areas (cities and towns) | Rural areas (countryside) |\n|---------|------------------------------|-------------------------|\n| **Services** | Schools, hospitals, shops, banks nearby | Far from services; poor infrastructure |\n| **Employment** | More job opportunities | Very few jobs; many depend on farming |\n| **Income** | Generally higher incomes | Lower incomes; many rely on social grants |\n| **Housing** | Formal houses, flats, townhouses | Traditional homes, mud houses, some RDP |\n| **Transport** | Buses, taxis, Uber, Gautrain | Few transport options; long distances |\n| **Technology** | Good internet and cell coverage | Limited or no internet access |\n\n### Poverty in South Africa\n\n**Poverty** means a person does not have enough income or resources to meet basic needs like food, shelter, and clothing.\n\n**Types of poverty:**\n\n| Type | Description |\n|------|------------|\n| **Absolute poverty** | Cannot afford basic needs (food, water, shelter) — survival is at risk |\n| **Relative poverty** | Can afford basic needs but has much less than most people in the community |\n\n**Facts about poverty in South Africa:**\n- About 55% of South Africans live below the poverty line\n- Rural areas have higher poverty rates than urban areas\n- Poverty affects children, women, and black South Africans disproportionately\n- The Eastern Cape, Limpopo, and KwaZulu-Natal have the highest poverty rates'),
  q(3, 'Absolute poverty means:',
    ['A person cannot afford basic needs like food, water, and shelter', 'A person earns less than their neighbours', 'A person does not have a car', 'A person lives in a rural area'], 0,
    'Absolute poverty means the person lacks basic necessities for survival — food, water, and shelter. It is the most severe form of poverty.'),
  fb(4, 'Inequality means wealth and opportunities are not shared ___. About ___% of South Africans live below the poverty line.',
    ['equally', '55'],
    'Inequality refers to unequal distribution of wealth and opportunities. Approximately 55% of South Africans live in poverty.'),
  t(5, '### Causes of Poverty\n\n| Cause | How it leads to poverty |\n|-------|------------------------|\n| **Unemployment** | Without a job, there is no income to buy basic needs |\n| **Low wages** | Some jobs pay so little that workers still cannot afford enough food |\n| **Lack of education** | Without education, it is hard to find well-paying jobs |\n| **Poor health** | Sick people cannot work; medical costs drain savings |\n| **Large families** | More people to feed on the same income |\n| **Lack of resources** | No land to farm, no capital to start a business |\n\n### Effects of Poverty\n\n| Effect | Description |\n|--------|------------|\n| **Hunger and malnutrition** | Children go to school hungry; poor nutrition affects growth |\n| **Poor health** | Cannot afford medicine or healthy food |\n| **Low education** | Children drop out of school to work or help at home |\n| **Crime** | Some people turn to crime out of desperation |\n| **Homelessness** | Cannot afford housing |\n| **Cycle of poverty** | Poor parents cannot give their children opportunities, so poverty continues from one generation to the next |'),
  q(6, 'The "cycle of poverty" means:',
    ['Poverty passes from one generation to the next because poor parents cannot give their children opportunities', 'Poverty only lasts for one year', 'Only one person in a family is poor', 'Poverty affects only rural areas'], 0,
    'The cycle of poverty means poverty repeats across generations — poor parents cannot afford education and resources for their children, who then struggle as adults too.'),
  t(7, '### How Poverty and Inequality Can Be Reduced\n\n**Government efforts:**\n\n| Strategy | Description |\n|----------|------------|\n| **Social grants** | Child support grant, old age pension, disability grant |\n| **Free basic services** | Free water (6 kilolitres per month), free electricity (50 kWh per month) |\n| **RDP housing** | Free houses for low-income families |\n| **Education** | No-fee schools, free school meals, NSFAS bursaries |\n| **Land reform** | Redistributing land to previously disadvantaged communities |\n| **Job creation** | Public works programmes (EPWP), supporting small businesses |\n\n**What individuals and communities can do:**\n- Start small businesses to create jobs\n- Join community savings groups (stokvels)\n- Get educated and develop skills\n- Support local businesses and buy local products\n- Volunteer and help community organisations\n- Form cooperatives to share resources and skills'),
  fb(8, 'The government provides ___ grants to help reduce poverty. A stokvel is a community ___ group.',
    ['social', 'savings'],
    'Social grants (child support, old age, disability) help the poorest families. Stokvels are community savings clubs where members contribute and save together.'),
  q(9, 'Which of the following is a government strategy to reduce inequality?',
    ['Providing no-fee schools and free school meals', 'Closing all hospitals', 'Increasing the price of electricity', 'Reducing the number of social grants'], 0,
    'No-fee schools and free school meals help poor children access education and nutrition, reducing inequality.'),
  t(10, '### Creating Sustainable Job Opportunities\n\nReducing poverty and inequality requires creating jobs. In South Africa, several approaches are used:\n\n**1. Supporting SMMEs (Small, Medium, and Micro Enterprises):**\n- SMMEs create the most new jobs in South Africa\n- The government provides training, funding, and mentorship\n- Agencies like SEDA (Small Enterprise Development Agency) help entrepreneurs\n\n**2. Skills development:**\n- Learnerships and apprenticeships give young people practical skills\n- SETA (Sector Education and Training Authority) programmes\n- FET colleges provide vocational training\n\n**3. Community-based initiatives:**\n- Community gardens provide food and income\n- Cooperatives allow groups to produce and sell together\n- Tourism initiatives in rural areas\n\n**Key message:** Everyone has a role to play in reducing inequality and poverty. Education is the most powerful tool — it opens doors to jobs, income, and a better life. By understanding these problems, you can make informed decisions and contribute to building a fairer South Africa.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Financial Literacy — Accounting Concepts (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Introduction to Accounting Concepts ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Introduction to Accounting Concepts\n\nAccounting is the language of business. It is the process of recording, organising, and reporting financial information. Even a small spaza shop or a tuck shop at school needs basic accounting.\n\n### Why Do Businesses Keep Financial Records?\n\n| Reason | Explanation |\n|--------|------------|\n| **Know if the business is making a profit or loss** | Records show how much money comes in and goes out |\n| **Make good decisions** | Records help the owner plan for the future |\n| **Pay taxes** | SARS requires businesses to report their income and expenses |\n| **Apply for loans** | Banks need to see financial records before lending money |\n| **Track what the business owns and owes** | The owner must know the financial position |\n\n### Key Accounting Terms\n\n| Term | Definition | Example |\n|------|-----------|--------|\n| **Capital** | Money or assets the owner invests to start the business | Lerato puts R10 000 cash into her business |\n| **Assets** | Everything the business owns | Cash, equipment, stock, furniture |\n| **Liabilities** | Everything the business owes to others | A bank loan, money owed to a supplier |\n| **Income (Revenue)** | Money earned by the business | Sales, fees for services |\n| **Expenses** | Costs the business pays to operate | Rent, electricity, wages, supplies |'),
  t(2, '### More Accounting Concepts\n\n| Term | Definition | Example |\n|------|-----------|--------|\n| **Profit** | When income is MORE than expenses | Income R8 000 − Expenses R5 000 = Profit R3 000 |\n| **Loss** | When expenses are MORE than income | Income R4 000 − Expenses R6 000 = Loss R2 000 |\n| **Transactions** | Any event that involves money in the business | Buying stock, selling goods, paying rent |\n| **Owner\'s equity** | The owner\'s share of the business (what would be left if all debts were paid) | Assets R50 000 − Liabilities R20 000 = Owner\'s equity R30 000 |\n| **Drawings** | Money or goods the owner takes from the business for personal use | The owner takes R500 from the till for groceries |\n\n### Types of Income and Expenses\n\n**Common types of income:**\n- **Sales** — money from selling goods\n- **Fee income** — money from providing services\n- **Rent income** — money from renting out property\n- **Interest income** — money earned from savings in the bank\n\n**Common types of expenses:**\n- **Rent expense** — cost of renting a building\n- **Salaries and wages** — payments to workers\n- **Electricity** — cost of power\n- **Water** — cost of water\n- **Telephone** — cost of phone and internet\n- **Advertising** — cost of promoting the business\n- **Stationery** — cost of paper, pens, printing'),
  q(3, 'Profit occurs when:',
    ['Income is more than expenses', 'Expenses are more than income', 'The owner invests more capital', 'The business borrows money'], 0,
    'Profit = Income − Expenses. When income exceeds expenses, the business makes a profit.'),
  fb(4, 'Assets are everything the business ___. Liabilities are everything the business ___.',
    ['owns', 'owes'],
    'Assets = what the business owns (cash, equipment). Liabilities = what the business owes to others (loans, creditors).'),
  t(5, '### The Accounting Equation\n\nThe most important formula in accounting:\n\n$$\\text{Assets} = \\text{Owner\'s Equity} + \\text{Liabilities}$$\n\nThis can also be written as:\n$$A = OE + L$$\n\nOr rearranged:\n$$\\text{Owner\'s Equity} = \\text{Assets} - \\text{Liabilities}$$\n\n**What the equation means:**\n- Everything the business owns (assets) was paid for either by the owner (owner\'s equity) or by borrowing (liabilities)\n- The equation must ALWAYS balance — the left side must equal the right side\n\n**Example: Lerato\'s Tuck Shop**\n\nLerato starts a tuck shop with R10 000 of her own money and borrows R5 000 from her uncle.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Cash: R15 000 | = | Capital: R10 000 | + | Loan from uncle: R5 000 |\n| **R15 000** | = | **R10 000** | + | **R5 000** |\n\n**Check:** R15 000 = R10 000 + R5 000 ✓'),
  q(6, 'A business has assets of R40 000 and liabilities of R15 000. What is the owner\'s equity?',
    ['R25 000', 'R55 000', 'R40 000', 'R15 000'], 0,
    'Owner\'s equity = Assets − Liabilities = R40 000 − R15 000 = R25 000.'),
  t(7, '### How Transactions Affect the Accounting Equation\n\nEvery transaction changes at least two items in the equation, but the equation always stays balanced.\n\n**Transaction 1:** Lerato invests R10 000 cash.\n\n| Assets | = | OE | + | Liabilities |\n|--------|---|------|---|-------------|\n| Cash: R10 000 | = | Capital: R10 000 | + | R0 |\n\n**Transaction 2:** She buys a display shelf for R3 000 cash.\n\n| Assets | = | OE | + | Liabilities |\n|--------|---|------|---|-------------|\n| Cash: R7 000 | = | Capital: R10 000 | + | R0 |\n| Shelf: R3 000 | | | | |\n| **R10 000** | = | **R10 000** | + | **R0** |\n\n**Transaction 3:** She buys stock on credit for R2 000 (pays later).\n\n| Assets | = | OE | + | Liabilities |\n|--------|---|------|---|-------------|\n| Cash: R7 000 | = | Capital: R10 000 | + | Creditor: R2 000 |\n| Shelf: R3 000 | | | | |\n| Stock: R2 000 | | | | |\n| **R12 000** | = | **R10 000** | + | **R2 000** |'),
  fb(8, 'The accounting equation states that ___ = Owner\'s Equity + Liabilities. When Lerato buys stock on credit, both assets and ___ increase.',
    ['Assets', 'liabilities'],
    'The equation: Assets = OE + Liabilities. Buying on credit increases assets (stock) and liabilities (creditor) equally, keeping the equation balanced.'),
  q(9, 'When an owner takes money from the business for personal use, this is called:',
    ['Drawings', 'Income', 'Capital', 'An expense'], 0,
    'Drawings are money or goods the owner takes out for personal use. Drawings reduce owner\'s equity but are NOT a business expense.'),
  t(10, '### The Personal Statement of Net Worth\n\nJust like a business, an individual can calculate their financial position using a **personal statement of net worth**.\n\n$$\\text{Net Worth} = \\text{What you own} - \\text{What you owe}$$\n\n**Example: Sipho\'s Statement of Net Worth**\n\n| What Sipho owns (Assets) | R |\n|-------------------------|---:|\n| Savings at FNB | 3 000 |\n| Bicycle | 2 500 |\n| Cell phone | 4 000 |\n| School books and equipment | 1 500 |\n| **Total assets** | **11 000** |\n\n| What Sipho owes (Liabilities) | R |\n|------------------------------|---:|\n| Money borrowed from friend | 500 |\n| **Total liabilities** | **500** |\n\n| **Net worth** | **R10 500** |\n\n**Sipho\'s net worth is R10 500.** This means if he sold everything and paid back his friend, he would have R10 500 left.\n\n**Key message:** The accounting equation applies to businesses AND to individuals. Understanding your financial position helps you make better money decisions.'),
];

// --- Lesson 2: Income and Expenses ---
blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Income and Expenses\n\nA business exists to earn income and make a profit. To do this, it must manage its income and expenses carefully.\n\n### Types of Business Income\n\n| Type of income | Description | Example |\n|---------------|-----------|--------|\n| **Sales** | Money from selling goods | A spaza shop sells cold drinks |\n| **Fee income** | Money from providing a service | A plumber charges R500 to fix a tap |\n| **Rent income** | Money from renting out property | A landlord receives R3 000 per month |\n| **Commission** | Money earned for selling on behalf of someone else | An estate agent earns 5% for selling a house |\n| **Interest income** | Money earned on savings in the bank | A business earns R200 interest on its savings |\n\n### Types of Business Expenses\n\n| Type of expense | Description |\n|----------------|------------|\n| **Cost of sales** | The cost of goods bought for reselling |\n| **Rent expense** | Monthly payment for using a building |\n| **Salaries and wages** | Payments to employees |\n| **Electricity** | Cost of electrical power |\n| **Water** | Cost of water supply |\n| **Telephone and internet** | Communication costs |\n| **Advertising** | Promoting the business |\n| **Insurance** | Protecting the business against risks |\n| **Stationery** | Paper, pens, printing |\n| **Bank charges** | Fees charged by the bank |'),
  t(2, '### Calculating Profit and Loss\n\nThe basic formula for profit is:\n\n$$\\text{Profit} = \\text{Total Income} - \\text{Total Expenses}$$\n\nIf expenses are greater than income, the result is a **loss**.\n\n**Example: Thandi\'s Hair Salon — March**\n\n| Income | R |\n|--------|---:|\n| Fee income (haircuts and styling) | 12 000 |\n| **Total income** | **12 000** |\n\n| Expenses | R |\n|----------|---:|\n| Rent | 3 000 |\n| Wages (assistant) | 2 500 |\n| Electricity | 800 |\n| Hair products used | 1 500 |\n| Advertising | 500 |\n| **Total expenses** | **8 300** |\n\n| **Profit** | **R3 700** |\n\n$$\\text{Profit} = R12 000 - R8 300 = R3 700$$\n\nThandi made a profit of R3 700 in March. This is her reward for being an entrepreneur.\n\n### What Happens to Profit?\n\nThe owner can use the profit in different ways:\n- **Keep it in the business** to buy more stock or equipment (reinvest)\n- **Take it out as drawings** for personal use\n- **Save it** for future business needs\n- **Pay off debts** to reduce liabilities'),
  q(3, 'Thandi\'s salon earned R12 000 income and had R8 300 expenses. Her profit is:',
    ['R3 700', 'R20 300', 'R8 300', 'R12 000'], 0,
    'Profit = Income − Expenses = R12 000 − R8 300 = R3 700.'),
  fb(4, 'If total income is greater than total expenses, the business makes a ___. If total expenses are greater than total income, the business makes a ___.',
    ['profit', 'loss'],
    'Profit = Income > Expenses. Loss = Expenses > Income.'),
  t(5, '### The Personal Income and Expenditure Statement\n\nIndividuals and families also have income and expenses. A **personal income and expenditure statement** shows whether you are living within your means.\n\n**Example: Mama Dlamini\'s Monthly Income and Expenses**\n\n| Income | R |\n|--------|---:|\n| Salary (part-time domestic worker) | 4 000 |\n| Child support grant (2 children) | 1 060 |\n| **Total income** | **5 060** |\n\n| Expenses | R |\n|----------|---:|\n| Rent | 1 200 |\n| Food | 1 800 |\n| Transport | 600 |\n| Electricity | 300 |\n| School fees (1 child) | 200 |\n| Clothing | 300 |\n| Savings (stokvel) | 200 |\n| **Total expenses** | **4 600** |\n\n| **Surplus (money left over)** | **R460** |\n\n**Surplus vs Deficit:**\n- **Surplus:** Income > Expenses (money left over — can be saved)\n- **Deficit:** Expenses > Income (spending more than you earn — a problem!)'),
  q(6, 'Mama Dlamini has a surplus of R460. This means:',
    ['Her income is R460 more than her expenses', 'She owes R460', 'She needs to borrow R460', 'Her expenses are R460 more than her income'], 0,
    'A surplus means income exceeds expenses. Mama Dlamini has R460 left over each month after paying all expenses.'),
  t(7, '### Personal Financial Records\n\nKeeping personal financial records helps you manage your money.\n\n**Source documents for personal finances:**\n\n| Document | What it records |\n|----------|----------------|\n| **Pay slip** | Your salary or wage — how much you earn |\n| **Till slip (receipt)** | What you bought and how much you paid |\n| **Bank statement** | All money going in and out of your bank account |\n| **Invoice** | A bill for goods or services you must pay |\n| **Municipal account** | Monthly bill for water, electricity, rates |\n\n**Tips for managing personal finances:**\n1. Keep all your receipts and pay slips\n2. Write down everything you earn and spend\n3. Compare your spending to your budget each month\n4. Look for ways to reduce expenses\n5. Save before you spend — put money aside first\n\n**The difference between income and expenditure:**\n- **Income** is money coming IN (salary, grants, pocket money)\n- **Expenditure** is money going OUT (rent, food, transport, clothing)'),
  fb(8, 'A pay slip shows how much you ___. A till slip shows what you ___ and how much you paid.',
    ['earn', 'bought'],
    'A pay slip records earnings (income). A till slip records purchases (expenditure) at a shop.'),
  q(9, 'Which of the following is an EXPENSE for a business?',
    ['Rent paid for the business premises', 'Money received from selling goods', 'Capital invested by the owner', 'A loan received from the bank'], 0,
    'Rent is a cost the business pays to operate — it is an expense. Sales are income, capital is owner\'s investment, and a loan is a liability.'),
  t(10, '### The Statement of Net Worth — Worked Example\n\nLet us calculate the financial position of a small business.\n\n**Sipho\'s Car Wash — 31 March**\n\n| What the business owns (Assets) | R |\n|--------------------------------|---:|\n| Cash at bank | 8 000 |\n| Equipment (hoses, vacuum, buckets) | 5 000 |\n| Cleaning supplies | 1 200 |\n| **Total assets** | **14 200** |\n\n| What the business owes (Liabilities) | R |\n|-------------------------------------|---:|\n| Money owed to supplier | 2 000 |\n| **Total liabilities** | **2 000** |\n\n| **Owner\'s equity** | **R12 200** |\n\n$$\\text{Owner\'s equity} = R14 200 - R2 000 = R12 200$$\n\n**Check the accounting equation:**\nAssets R14 200 = OE R12 200 + Liabilities R2 000 = R14 200 ✓\n\n**Key message:** By understanding income, expenses, profit, and the accounting equation, you have the foundation for financial literacy. These concepts apply to personal finances and to any business, no matter how small.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Financial Literacy — Budgets (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Personal and Business Budgets ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Budgets\n\nA **budget** is a financial plan that shows expected income and expected expenses for a future period. It helps people and businesses plan how to use their money wisely.\n\n### Why Is a Budget Important?\n\n| Reason | Explanation |\n|--------|------------|\n| **Control spending** | Shows you exactly where your money goes |\n| **Avoid debt** | Helps you spend less than you earn |\n| **Plan for savings** | Ensures money is set aside for the future |\n| **Prepare for expenses** | Warns you about big expenses ahead |\n| **Achieve goals** | Helps you save for things you want |\n\n### Steps to Create a Budget\n\n1. **Estimate your income** — How much money do you expect to receive?\n2. **List your expenses** — What do you need to pay for?\n3. **Categorise expenses** — Sort into needs (fixed) and wants (variable)\n4. **Compare income and expenses** — Is there a surplus or deficit?\n5. **Adjust if needed** — Cut wants if expenses are too high\n6. **Review regularly** — Check actual spending against your budget\n\n### Fixed vs Variable Expenses\n\n| Type | Description | Examples |\n|------|-----------|----------|\n| **Fixed expenses** | Stay the same every month | Rent, school fees, insurance, loan payments |\n| **Variable expenses** | Change from month to month | Food, electricity, transport, entertainment |'),
  t(2, '### Personal Budget Example\n\n**Busi\'s Monthly Budget (Grade 7 learner)**\n\nBusi gets pocket money from her parents and earns extra money by helping neighbours.\n\n| Income | Budget (R) | Actual (R) | Difference |\n|--------|----------:|----------:|-----------:|\n| Pocket money | 200 | 200 | 0 |\n| Helping neighbours | 150 | 180 | +30 |\n| **Total income** | **350** | **380** | **+30** |\n\n| Expenses | Budget (R) | Actual (R) | Difference |\n|----------|----------:|----------:|-----------:|\n| School tuck shop | 100 | 140 | −40 |\n| Transport | 50 | 50 | 0 |\n| Savings | 80 | 80 | 0 |\n| Entertainment | 60 | 50 | +10 |\n| Stationery | 40 | 30 | +10 |\n| **Total expenses** | **330** | **350** | **−20** |\n\n| **Surplus** | **20** | **30** | **+10** |\n\n**Analysis:**\n- Busi earned R30 MORE than budgeted (good!)\n- She spent R40 MORE at the tuck shop than planned (overspent)\n- She spent R20 LESS on entertainment and stationery (saved money)\n- Overall, she has a surplus of R30 (actual income − actual expenses = R380 − R350)'),
  q(3, 'In Busi\'s budget, she overspent on which item?',
    ['School tuck shop (spent R40 more than planned)', 'Transport', 'Savings', 'Entertainment'], 0,
    'Busi budgeted R100 for the tuck shop but actually spent R140 — that is R40 more than planned.'),
  fb(4, 'A budget is a financial ___ for the future. Fixed expenses stay the ___ every month.',
    ['plan', 'same'],
    'A budget plans income and expenses for a future period. Fixed expenses like rent and school fees stay the same each month.'),
  t(5, '### Business Budget Example\n\n**Themba\'s Tuck Shop — Monthly Budget**\n\nThemba runs a tuck shop at a taxi rank. He prepares a budget each month to plan his finances.\n\n| Income | R |\n|--------|---:|\n| Expected sales | 15 000 |\n| **Total expected income** | **15 000** |\n\n| Expenses | R |\n|----------|---:|\n| Cost of stock (cold drinks, sweets, chips) | 8 000 |\n| Rent for stand | 1 500 |\n| Electricity | 400 |\n| Transport (collecting stock) | 600 |\n| Helper\'s wages | 2 000 |\n| Cell phone | 200 |\n| **Total expected expenses** | **12 700** |\n\n| **Expected profit** | **R2 300** |\n\n**What the budget tells Themba:**\n- He expects to make R2 300 profit\n- His biggest expense is buying stock (R8 000)\n- If sales drop below R12 700, he will make a loss\n- He should try to save some of his profit for slow months'),
  q(6, 'If Themba\'s actual sales are only R11 000 instead of R15 000, and expenses stay at R12 700, the result is:',
    ['A loss of R1 700', 'A profit of R1 700', 'A profit of R2 300', 'Break even'], 0,
    'If sales are R11 000 and expenses are R12 700, the business makes a loss: R11 000 − R12 700 = −R1 700.'),
  t(7, '### The Definition of a Business Budget, Income, and Expenditure\n\nA **business budget** includes:\n\n| Component | Description |\n|-----------|------------|\n| **Projected income** | How much money the business expects to earn |\n| **Projected expenses** | How much money the business expects to spend |\n| **Expected profit or loss** | The difference between projected income and expenses |\n\n### How to Improve a Business Budget\n\nIf the budget shows a deficit (loss), the owner can:\n1. **Increase income:** Sell more products, raise prices, add new products\n2. **Decrease expenses:** Find cheaper suppliers, reduce waste, use less electricity\n3. **Cut unnecessary costs:** Cancel subscriptions not being used\n\nIf the budget shows a surplus (profit), the owner can:\n1. **Save for emergencies** (build a cash reserve)\n2. **Invest in the business** (buy better equipment)\n3. **Pay off debts** faster\n4. **Expand** (open a second location or add more products)'),
  fb(8, 'If a budget shows that expenses will be more than income, the result is a ___. To fix this, the business should increase income or decrease ___.',
    ['deficit', 'expenses'],
    'A deficit means expenses exceed income (losing money). The solution is to earn more or spend less.'),
  q(9, 'Which of the following is a FIXED expense?',
    ['Monthly rent of R1 500', 'Food purchases that change each week', 'Electricity that varies by season', 'Transport costs that depend on petrol prices'], 0,
    'Rent is a fixed expense because it stays the same amount every month. Food, electricity, and transport costs vary.'),
  t(10, '### Savings — Why It Matters\n\nA budget should always include **savings** — money set aside for the future.\n\n**Why save?**\n- Emergencies (car repair, medical bills, job loss)\n- Future goals (education, starting a business, buying a house)\n- Retirement (when you stop working)\n- Avoiding debt (using savings instead of borrowing)\n\n**The 50/30/20 rule** — a simple guideline for budgeting:\n\n| Category | % of income | What it covers |\n|----------|------------|----------------|\n| **Needs** | 50% | Rent, food, transport, school fees, medical |\n| **Wants** | 30% | Entertainment, clothing, eating out, hobbies |\n| **Savings** | 20% | Emergency fund, future goals, investments |\n\n**Example:** If your family earns R10 000 per month:\n- Needs: R5 000 (rent, food, transport, bills)\n- Wants: R3 000 (clothing, entertainment, extras)\n- Savings: R2 000 (saved for emergencies and the future)\n\n**Key message:** A budget is the most important tool for managing money. Whether you are a Grade 7 learner with pocket money or a business owner, budgeting helps you control spending, avoid debt, and achieve your financial goals.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Financial Literacy — Savings and Banking (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Savings and Investments ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Savings and Investments\n\n**Saving** means setting aside money for future use instead of spending it now. It is one of the most important financial habits you can develop.\n\n### The Difference Between Saving and Investing\n\n| | Saving | Investing |\n|---|--------|----------|\n| **Definition** | Putting money aside in a safe place | Using money to buy something that will grow in value |\n| **Risk** | Very low risk | Higher risk (you could lose money) |\n| **Return** | Low interest | Potentially higher returns |\n| **Access** | Easy to withdraw | May be locked in for a period |\n| **Examples** | Savings account, stokvel, piggy bank | Shares, property, unit trusts |\n\n### Why Should You Save?\n\n| Reason | Explanation |\n|--------|------------|\n| **Emergencies** | Unexpected costs like medical bills or home repairs |\n| **Goals** | Save for something specific (school trip, bicycle, university) |\n| **Independence** | Having money gives you choices and freedom |\n| **Avoid debt** | Using savings instead of borrowing saves you interest costs |\n| **Future security** | Retirement, starting a business, buying a home |'),
  t(2, '### How to Save — Practical Tips\n\n**1. Pay yourself first:** Before spending on anything else, put some money into savings.\n\n**2. Set a goal:** Know what you are saving for and how much you need.\n\n**3. Start small:** Even R20 per week adds up to R1 040 per year.\n\n**4. Avoid impulse buying:** Think before you buy. Ask: "Do I need this, or do I just want it?"\n\n**5. Track your spending:** Write down everything you spend to find areas where you can save.\n\n**6. Use a savings plan:**\n\n| Amount saved per week | After 1 month | After 6 months | After 1 year |\n|----------------------|--------------|----------------|-------------|\n| R10 | R40 | R260 | R520 |\n| R20 | R80 | R520 | R1 040 |\n| R50 | R200 | R1 300 | R2 600 |\n| R100 | R400 | R2 600 | R5 200 |\n\n### What Is Interest?\n\n**Interest** is money earned on your savings, or money paid when you borrow.\n\n- When you SAVE: The bank pays YOU interest (a reward for saving)\n- When you BORROW: You pay the BANK interest (the cost of borrowing)\n\n**Example:** You save R1 000 at 5% interest per year.\n- Interest earned in one year: R1 000 × 5% = R50\n- After one year you have: R1 000 + R50 = R1 050'),
  q(3, 'If you save R50 per week for one year, how much will you have saved?',
    ['R2 600', 'R600', 'R1 200', 'R5 200'], 0,
    'R50 × 52 weeks = R2 600 saved in one year.'),
  fb(4, 'Interest is money ___ on your savings. When you borrow, you pay interest to the ___.',
    ['earned', 'bank'],
    'Savers earn interest as a reward. Borrowers pay interest as the cost of using someone else\'s money.'),
  t(5, '### Community Savings: Stokvels\n\nA **stokvel** is a South African community savings club where a group of people save money together.\n\n**How a stokvel works:**\n1. A group of people (usually 10-20) agree to contribute a fixed amount regularly (weekly or monthly)\n2. Each member takes turns receiving the total pool of money\n3. Some stokvels save for a specific purpose (Christmas, funerals, groceries)\n\n**Example: Mama Zulu\'s stokvel**\n- 10 members contribute R500 each per month\n- Total monthly pool: R5 000\n- Each month, one member receives the R5 000\n- After 10 months, every member has received R5 000 once\n\n**Types of stokvels:**\n\n| Type | Purpose |\n|------|--------|\n| **Savings stokvel** | Members save for the end of the year (e.g. Christmas) |\n| **Burial stokvel** | Helps pay for funeral costs |\n| **Grocery stokvel** | Saves for bulk grocery shopping (usually December) |\n| **Investment stokvel** | Members invest together in shares or property |\n\n**Advantages:** Peer pressure to save, community support, disciplined saving\n**Disadvantages:** Risk of dishonesty, no legal protection, no interest earned (unless invested)'),
  q(6, 'In a stokvel with 10 members who each contribute R500 per month, the monthly pool is:',
    ['R5 000', 'R500', 'R50 000', 'R10 000'], 0,
    '10 members × R500 each = R5 000 monthly pool.'),
  t(7, '### The Role of Banks\n\nA **bank** is a financial institution that keeps your money safe, helps you save, and lends money to people and businesses.\n\n**Services offered by banks:**\n\n| Service | Description |\n|---------|------------|\n| **Savings account** | A safe place to save money and earn interest |\n| **Current/cheque account** | An account for daily transactions (deposits, payments) |\n| **Loans** | Money the bank lends to you (you pay it back with interest) |\n| **Debit card** | A card linked to your account for purchases and ATM withdrawals |\n| **EFT (Electronic Funds Transfer)** | Sending money between accounts electronically |\n| **Internet and mobile banking** | Managing your account online or via your phone |\n| **ATM** | A machine where you can withdraw cash, deposit, and check balances |\n\n**Major banks in South Africa:**\n- ABSA\n- Capitec\n- FNB (First National Bank)\n- Nedbank\n- Standard Bank\n- African Bank\n- TymeBank (digital bank)'),
  fb(8, 'A savings account earns ___ on your money. A loan is money the bank ___ to you.',
    ['interest', 'lends'],
    'Banks pay interest on savings (reward for saving). Banks lend money through loans (you pay interest as the cost of borrowing).'),
  q(9, 'Which of the following is NOT a service offered by a bank?',
    ['Selling groceries', 'Savings accounts', 'Loans', 'Electronic funds transfers'], 0,
    'Banks offer financial services like savings accounts, loans, and EFTs. Selling groceries is a retail activity, not a banking service.'),
  t(10, '### Opening a Bank Account\n\nTo open a bank account in South Africa, you need:\n\n| Document | Why it is needed |\n|----------|------------------|\n| **South African ID** or birth certificate | Proves your identity |\n| **Proof of address** | Shows where you live (utility bill, lease, or affidavit) |\n| **Initial deposit** | Some accounts require a minimum amount to open |\n\n**For learners under 18:**\n- A parent or guardian must open the account with you\n- You will need your birth certificate and parent\'s ID\n- Some banks offer special youth savings accounts with no monthly fees\n\n**Bank fees:**\n- Banks charge fees for their services (monthly fees, ATM withdrawals, EFTs)\n- Compare different banks\' fees before opening an account\n- Digital banks like TymeBank and Capitec often have lower fees\n\n**Key message:** Saving money is a habit that starts small and grows over time. Whether you use a piggy bank, a stokvel, or a bank account, the most important thing is to start saving today. Even saving a small amount regularly can make a big difference in your future.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Entrepreneurship — The Entrepreneur (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: What Is an Entrepreneur? ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## What Is an Entrepreneur?\n\nAn **entrepreneur** is a person who starts and runs a business, taking on financial risks in the hope of making a profit.\n\n### Definitions\n\n| Term | Definition |\n|------|----------|\n| **Entrepreneur** | A person who identifies a business opportunity, takes a risk, and starts a business |\n| **Entrepreneurship** | The process of starting and running a business |\n| **Business** | An organisation that produces goods or services to earn a profit |\n| **Enterprise** | Another word for a business venture |\n\n### Types of People Who Own Businesses\n\nNot every business owner is the same:\n\n| Type | Description | Example |\n|------|-----------|--------|\n| **Entrepreneur** | Creates something new; innovates; takes risks | Elon Musk started SpaceX and Tesla |\n| **Intrapreneur** | Acts like an entrepreneur INSIDE an existing company | An employee at MTN who develops a new app |\n| **Franchise owner** | Buys the right to use an existing brand and business model | Owning a Steers or Debonairs franchise |\n| **Self-employed person** | Works for themselves but may not innovate | A freelance photographer |'),
  t(2, '### Characteristics of a Successful Entrepreneur\n\nSuccessful entrepreneurs share certain qualities:\n\n| Characteristic | What it means | Example |\n|---------------|-------------|--------|\n| **Risk-taker** | Willing to risk money and time on a new idea | Investing savings in a new business |\n| **Creative and innovative** | Comes up with new ideas and solutions | Inventing a product that solves a problem |\n| **Hardworking** | Puts in long hours and effort | Working weekends to grow the business |\n| **Persistent (determined)** | Does not give up when things get tough | Continuing after the first product fails |\n| **Self-confident** | Believes in their ability to succeed | Presenting their idea to investors |\n| **Good communicator** | Can explain ideas and motivate others | Convincing customers to try a new product |\n| **Problem-solver** | Finds solutions to challenges | Finding a cheaper supplier when costs rise |\n| **Organised** | Plans and manages time and resources well | Keeping records and meeting deadlines |\n| **Passionate** | Loves what they do | Starting a business in a field they enjoy |\n\n### South African Entrepreneurs\n\n| Entrepreneur | Business | Achievement |\n|-------------|----------|-------------|\n| **Patrice Motsepe** | African Rainbow Minerals | First black billionaire in South Africa; mining |\n| **Nicky Oppenheimer** | De Beers | Diamond mining empire |\n| **Mark Sobhani (Shuttleworth)** | Thawte | Sold internet security company; first African in space |\n| **Wendy Appelbaum** | De Morgenzon | Wine and business; philanthropist |\n| **DJ Sbu (Sbusiso Leope)** | MoFaya Energy Drink | Created an energy drink brand from nothing |'),
  q(3, 'Which of the following BEST describes an entrepreneur?',
    ['A person who identifies a business opportunity, takes a risk, and starts a business', 'A person who works for a large company', 'A person who only buys and sells goods', 'A person who inherits a business'], 0,
    'An entrepreneur identifies opportunities, takes financial risks, and creates a new business. They are innovators and risk-takers.'),
  fb(4, 'An entrepreneur takes ___ in the hope of making a profit. An intrapreneur acts like an entrepreneur inside an existing ___.',
    ['risks', 'company'],
    'Entrepreneurs risk their own money and time. Intrapreneurs innovate and take initiative within someone else\'s company.'),
  t(5, '### Entrepreneurial Skills\n\nTo be a successful entrepreneur, you need certain skills:\n\n| Skill | Why it matters |\n|-------|---------------|\n| **Financial management** | Managing money, budgeting, and understanding profit and loss |\n| **Marketing** | Knowing how to attract and keep customers |\n| **Communication** | Speaking, writing, and listening effectively |\n| **Leadership** | Guiding and motivating employees |\n| **Time management** | Using time wisely to get things done |\n| **Record-keeping** | Keeping track of money, stock, and transactions |\n| **Negotiation** | Getting good deals with suppliers and customers |\n| **Technical skills** | Knowing how to produce your product or service |\n\n### Skills of Buying and Selling\n\n**Buying skills:**\n- Compare prices from different suppliers\n- Buy in bulk for discounts\n- Check quality before buying\n- Negotiate the best price\n\n**Selling skills:**\n- Know your product well\n- Be friendly and helpful to customers\n- Set competitive prices\n- Offer good customer service\n- Display products attractively'),
  q(6, 'Which entrepreneurial skill involves managing money, budgeting, and understanding profit and loss?',
    ['Financial management', 'Marketing', 'Communication', 'Negotiation'], 0,
    'Financial management includes budgeting, tracking income and expenses, and understanding whether the business is profitable.'),
  t(7, '### Making Profit Through Buying and Selling\n\nThe basic way to make profit in a trading business is to buy goods at a **lower price** and sell them at a **higher price**.\n\n$$\\text{Profit per item} = \\text{Selling price} - \\text{Cost price}$$\n\n**Example: Sipho\'s sweet business**\n\n| Item | Cost price (bought for) | Selling price (sold for) | Profit per item |\n|------|------------------------|-----------------------|----------------|\n| Bag of sweets | R5 | R10 | R5 |\n| Cold drink | R8 | R15 | R7 |\n| Packet of chips | R7 | R12 | R5 |\n\n**If Sipho sells 20 bags of sweets in a day:**\n- Revenue: 20 × R10 = R200\n- Cost: 20 × R5 = R100\n- Profit: R200 − R100 = R100\n\n### Mark-up\n\n**Mark-up** is the amount added to the cost price to get the selling price.\n\n$$\\text{Selling price} = \\text{Cost price} + \\text{Mark-up}$$\n\n**Example:** Sipho buys sweets for R5 and adds a R5 mark-up.\n- Selling price: R5 + R5 = R10\n- Mark-up percentage: (R5 ÷ R5) × 100 = 100% mark-up'),
  fb(8, 'Profit per item equals selling price minus ___ price. Mark-up is the amount ___ to the cost price.',
    ['cost', 'added'],
    'Profit = Selling price − Cost price. Mark-up is added to the cost price to determine the selling price.'),
  q(9, 'Sipho buys a cold drink for R8 and sells it for R15. His mark-up percentage is:',
    ['87.5% (R7 ÷ R8 × 100)', '100%', '50%', '15%'], 0,
    'Mark-up = (Selling price − Cost price) ÷ Cost price × 100 = (R15 − R8) ÷ R8 × 100 = R7 ÷ R8 × 100 = 87.5%.'),
  t(10, '### The Importance of Entrepreneurs in South Africa\n\nEntrepreneurs play a vital role in the South African economy:\n\n| Contribution | How entrepreneurs help |\n|-------------|----------------------|\n| **Job creation** | Start businesses that employ people, reducing unemployment |\n| **Innovation** | Create new products and services that improve lives |\n| **Economic growth** | Increase production and spending in the economy |\n| **Poverty reduction** | Provide income for themselves and their workers |\n| **Community development** | Solve local problems and meet community needs |\n| **Tax revenue** | Pay taxes that fund government services |\n\n**SMMEs (Small, Medium, and Micro Enterprises):**\n- Over 2.6 million SMMEs in South Africa\n- They create most of the new jobs\n- They contribute about 40% of GDP\n- The government supports them through agencies like SEDA and SEFA\n\n**Key message:** You do not need to wait until you are an adult to be an entrepreneur. Many successful businesses started as small ideas — selling sweets at school, washing cars, or tutoring younger learners. The skills you learn now will help you in the future.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Entrepreneurship — Starting a Business (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Formal and Informal Businesses ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Starting a Business\n\nBefore starting a business, an entrepreneur must understand the difference between **formal** and **informal** businesses and plan carefully.\n\n### Formal vs Informal Businesses\n\n| Feature | Formal business | Informal business |\n|---------|----------------|-------------------|\n| **Registration** | Registered with CIPC and SARS | Not registered |\n| **Tax** | Pays income tax and VAT | Usually does not pay tax |\n| **Location** | Fixed premises (shop, office, factory) | Home, street, market stall |\n| **Records** | Keeps proper financial records | Few or no records |\n| **Employees** | Legal contracts, UIF, minimum wage | Casual employment, often no contracts |\n| **Banking** | Business bank account | Cash-based, may use personal account |\n| **Examples** | Shoprite, Mr Price, Capitec | Spaza shop, street vendor, car wash |\n\n### Needs and Wants in a Business Context\n\nA new business must have certain things to operate:\n\n| Business needs (essentials) | Business wants (nice to have) |\n|---------------------------|------------------------------|\n| A product or service to sell | A fancy logo and branding |\n| Customers | A large advertising budget |\n| Capital (start-up money) | A new delivery vehicle |\n| A location to operate from | Office furniture |\n| Basic equipment | The latest technology |'),
  t(2, '### Steps to Start a Business\n\n| Step | What to do | Details |\n|------|-----------|--------|\n| 1 | **Identify an opportunity** | What need can you fill? What problem can you solve? |\n| 2 | **Research the market** | Who are your customers? Who are your competitors? |\n| 3 | **Plan your business** | Write a simple business plan with goals and a budget |\n| 4 | **Get capital (start-up money)** | Own savings, family loans, bank loans |\n| 5 | **Choose a location** | Where will you operate? (Home, market, shop) |\n| 6 | **Buy equipment and stock** | Get what you need to start producing or selling |\n| 7 | **Start selling** | Open your business and attract customers |\n| 8 | **Keep records** | Track all income and expenses from day one |\n\n### Sources of Capital (Start-up Money)\n\n| Source | Advantage | Disadvantage |\n|--------|----------|---------------|\n| **Own savings** | No debt; full control | May not be enough |\n| **Family and friends** | Easy to get; low or no interest | Risk to relationships |\n| **Bank loan** | Large amounts available | Must pay back with interest; hard to qualify |\n| **Government grants** | Free money; no repayment | Very competitive; lots of paperwork |\n| **Stokvel or savings group** | Community support | Limited amounts |\n| **Microfinance** | Designed for small businesses | Higher interest rates |'),
  q(3, 'A spaza shop that is not registered with CIPC is an example of:',
    ['An informal business', 'A formal business', 'A public company', 'A franchise'], 0,
    'Unregistered businesses like many spaza shops operate in the informal sector — they are not registered with CIPC or SARS.'),
  fb(4, 'Before starting a business, an entrepreneur must identify a business ___. Start-up money needed to begin a business is called ___.',
    ['opportunity', 'capital'],
    'Entrepreneurs look for opportunities (unmet needs or problems to solve). Capital is the money or resources needed to start the business.'),
  t(5, '### SWOT Analysis\n\nA **SWOT analysis** helps an entrepreneur evaluate a business idea by looking at four areas:\n\n| Factor | Type | Question | Example |\n|--------|------|----------|--------|\n| **S — Strengths** | Internal (inside the business) | What are we good at? | Good location, unique product, skilled owner |\n| **W — Weaknesses** | Internal (inside the business) | What are we NOT good at? | Limited capital, no experience, small menu |\n| **O — Opportunities** | External (outside the business) | What chances are available? | Growing demand, new housing development nearby |\n| **T — Threats** | External (outside the business) | What dangers exist? | Competition, crime, load shedding |\n\n**Example: SWOT for a school tuck shop**\n\n| **Strengths** | **Weaknesses** |\n|-------------|---------------|\n| Captive market (learners) | Small budget |\n| Good location (at school) | Limited menu |\n| Fresh, healthy options | No experience running a business |\n\n| **Opportunities** | **Threats** |\n|------------------|------------|\n| No other tuck shop at school | Teachers may restrict selling times |\n| Learners want affordable snacks | Other learners may copy the idea |\n| Can expand to sell stationery | Bad weather reduces outdoor sales |'),
  q(6, 'In a SWOT analysis, "competition from a nearby shop" is an example of:',
    ['A threat (external danger)', 'A strength (internal advantage)', 'A weakness (internal disadvantage)', 'An opportunity (external chance)'], 0,
    'Competition is an external factor that could harm the business — making it a threat in SWOT analysis.'),
  t(7, '### Setting Goals and Achieving Them\n\nEvery business needs **goals** — targets to work towards.\n\n**SMARTER goals:**\n\n| Letter | Meaning | Example |\n|--------|---------|--------|\n| **S** | Specific | "Sell 50 packets of chips per week" (not "sell lots") |\n| **M** | Measurable | "Earn R2 000 profit per month" |\n| **A** | Achievable | Set goals you can actually reach |\n| **R** | Relevant | Goals must relate to your business |\n| **T** | Time-bound | "Achieve this by the end of Term 3" |\n| **E** | Exciting | Goals should motivate you |\n| **R** | Recorded | Write them down! |\n\n**Short-term goals** (within 1 year): "Save R5 000 for new equipment by December."\n\n**Long-term goals** (more than 1 year): "Open a second location within 3 years."\n\n### Challenges Faced by New Businesses\n\n| Challenge | Solution |\n|-----------|----------|\n| Not enough capital | Start small; reinvest profits |\n| No customers | Advertise; offer a special deal |\n| Competition | Offer something unique; better service |\n| Crime and theft | Get insurance; install security |\n| Load shedding | Buy a generator or gas stove; work around schedules |\n| Lack of skills | Take short courses; ask for advice from experienced people |'),
  fb(8, 'SWOT stands for Strengths, Weaknesses, Opportunities, and ___. Goals should be SMARTER — specific, measurable, achievable, relevant, and ___-bound.',
    ['Threats', 'time'],
    'SWOT: Strengths, Weaknesses, Opportunities, Threats. SMARTER goals are time-bound — they have a deadline.'),
  q(9, 'Which of the following is a SMART goal for a tuck shop?',
    ['"Sell at least 30 cold drinks per day by the end of this term"', '"Sell lots of stuff"', '"Make money"', '"Be the best business ever"'], 0,
    'A SMART goal is specific (30 cold drinks), measurable (per day), achievable, relevant, and time-bound (by end of term). The other options are vague.'),
  t(10, '### The Importance of Record-Keeping\n\nFrom day one, every business must keep records of all financial transactions.\n\n**Why keep records?**\n- Know if you are making a profit or loss\n- Track what you owe and what is owed to you\n- Plan for the future using past information\n- Provide information to SARS for tax purposes\n- Apply for loans (banks require records)\n\n**Basic records every small business should keep:**\n\n| Record | What it tracks |\n|--------|---------------|\n| **Cash book** | All money coming in and going out |\n| **Stock record** | What stock you have, what you bought, what you sold |\n| **Receipt book** | Receipts given to customers |\n| **Invoice file** | Bills received from suppliers |\n| **Bank statements** | All bank transactions |\n\n**Key message:** Starting a business takes careful planning, hard work, and a willingness to take risks. By doing a SWOT analysis, setting SMART goals, keeping records, and managing your money wisely, you give your business the best chance of success.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Entrepreneurship — Advertising and the Business Plan (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Advertising and Marketing ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Advertising and Marketing\n\nNo business can succeed without customers. **Advertising** is how a business tells people about its products and services.\n\n### What Is Advertising?\n\n**Advertising** is paid communication that promotes a product, service, or business to attract customers.\n\n**Marketing** is the broader process of identifying customer needs and satisfying them profitably. Advertising is one part of marketing.\n\n### The AIDA Model\n\nA good advertisement follows the **AIDA** model:\n\n| Letter | Step | What it means | Example |\n|--------|------|-------------|--------|\n| **A** | Attention | Grab the viewer\'s attention | A bright colour, catchy headline, or funny image |\n| **I** | Interest | Make them interested in the product | Explain what the product does and why it is good |\n| **D** | Desire | Make them WANT the product | Show how it will improve their life |\n| **A** | Action | Tell them what to do next | "Visit us today!", "Call now!", "Order online!" |\n\n**Example advertisement for Sipho\'s Tuck Shop:**\n\n> **HUNGRY? 🍕**\n> *Sipho\'s Tuck Shop has the tastiest snacks at the best prices!*\n> Cold drinks R10 | Chips R8 | Sweets from R2\n> **Find us at Gate 3 every break time!**'),
  t(2, '### Types of Advertising Media\n\nDifferent types of advertising reach different audiences:\n\n| Medium | Description | Advantage | Disadvantage |\n|--------|-----------|----------|---------------|\n| **Posters and flyers** | Printed on paper, put up in the community | Cheap; reaches local people | Limited reach; can be torn down |\n| **Newspapers** | Advertisements in local newspapers | Reaches many readers | Can be expensive; short-lived |\n| **Radio** | Advertisements on radio stations | Reaches a wide audience | Listeners may tune out |\n| **Television** | Video advertisements on TV | Reaches millions; visual impact | Very expensive |\n| **Social media** | Facebook, Instagram, TikTok, WhatsApp | Cheap or free; reaches young people | Need internet; lots of competition |\n| **Word of mouth** | People telling others about the business | Free; very powerful | Hard to control; slow |\n| **Signage** | A sign outside the business | Visible to passers-by; permanent | Only reaches people nearby |\n\n### Advertising for Small Businesses\n\nSmall businesses with limited budgets should focus on:\n1. **Social media** (free or very cheap)\n2. **Word of mouth** (free — provide excellent service)\n3. **Flyers and posters** (print at home or at a copy shop)\n4. **WhatsApp groups** (free — share specials and updates)\n5. **Signage** (a clear, visible sign at the business location)'),
  q(3, 'The AIDA model stands for:',
    ['Attention, Interest, Desire, Action', 'Advertising, Information, Distribution, Action', 'Attention, Investment, Desire, Advertising', 'Advertising, Interest, Delivery, Action'], 0,
    'AIDA: Attention (grab attention), Interest (create interest), Desire (create desire to buy), Action (tell them to act now).'),
  fb(4, 'Advertising is ___ communication that promotes a product or service. The cheapest form of advertising for a small business is ___.',
    ['paid', 'word of mouth'],
    'Advertising involves paying to promote products. Word of mouth is free — satisfied customers tell others about the business.'),
  t(5, '### Responsible Advertising\n\nNot all advertising is ethical. Businesses must advertise **responsibly**.\n\n**Rules for responsible advertising:**\n\n| Rule | What it means | Bad example |\n|------|-------------|-------------|\n| **Truthful** | Do not make false claims | "This cream will make you 10 years younger!" |\n| **Not misleading** | Do not trick customers | Showing a huge burger in the ad when the real one is tiny |\n| **Not offensive** | Do not insult or discriminate | Using racist or sexist images |\n| **Age-appropriate** | Do not target children with harmful products | Advertising alcohol or cigarettes to children |\n| **Clear pricing** | Do not hide costs | "Only R99!" but not mentioning hidden fees |\n\n**The Advertising Regulatory Board (ARB)** oversees advertising in South Africa. Consumers can complain about misleading or offensive advertisements.\n\n### Consumer Rights\n\nThe **Consumer Protection Act** (CPA) protects South African consumers:\n- Right to receive honest information about products\n- Right to return faulty goods\n- Right to not be misled by advertising\n- Right to fair and honest dealing'),
  q(6, 'An advertisement that claims a product can cure all diseases is an example of:',
    ['False and misleading advertising', 'Responsible advertising', 'Good marketing', 'Word of mouth advertising'], 0,
    'Claiming a product can cure all diseases is false — it makes claims that are not true. This is irresponsible and often illegal.'),
  t(7, '### The Entrepreneur\'s Day Budget\n\nFor the Grade 7 EMS project, you will plan and run a business for **Entrepreneur\'s Day**. You need a budget.\n\n**Steps to create your Entrepreneur\'s Day budget:**\n\n1. **Decide what to sell** (e.g. cupcakes, popcorn, juice, beaded bracelets)\n2. **Calculate your costs:**\n\n| Expense | Example cost |\n|---------|-------------:|\n| Ingredients/materials | R150 |\n| Packaging (bags, cups) | R30 |\n| Advertising (posters) | R20 |\n| **Total costs** | **R200** |\n\n3. **Set your selling price:**\n\n| Item | Cost price | Mark-up | Selling price |\n|------|----------:|--------:|--------------:|\n| Cupcake | R4 | R6 | R10 |\n\n4. **Estimate your sales:**\n- If you sell 40 cupcakes at R10 each: Revenue = R400\n- Less costs: R200\n- **Expected profit: R200**\n\n### Key Budgeting Concepts\n\n| Concept | Definition |\n|---------|----------|\n| **Fixed costs** | Costs that stay the same no matter how much you sell (e.g. stall rental) |\n| **Variable costs** | Costs that change based on how much you sell (e.g. ingredients) |\n| **Cost price** | What the item costs you to make or buy |\n| **Selling price** | What you sell the item for |\n| **Break-even** | The point where income = expenses (no profit, no loss) |'),
  fb(8, 'Fixed costs stay the ___ no matter how much you sell. The break-even point is where income equals ___.',
    ['same', 'expenses'],
    'Fixed costs do not change with sales volume. Break-even is when total income equals total expenses — no profit and no loss.'),
  q(9, 'If cupcakes cost R4 to make and sell for R10, and total fixed costs are R60, how many cupcakes must be sold to break even?',
    ['10 cupcakes (R60 ÷ R6 profit per cupcake)', '6 cupcakes', '15 cupcakes', '4 cupcakes'], 0,
    'Profit per cupcake: R10 − R4 = R6. Break-even: R60 ÷ R6 = 10 cupcakes. After selling 10, all costs are covered.'),
  t(10, '### Creating Your Business Plan\n\nA **business plan** is a written document that describes your business, its goals, and how you plan to achieve them.\n\n**Simple business plan for Entrepreneur\'s Day:**\n\n| Section | What to include |\n|---------|----------------|\n| **Business name** | Choose a catchy, memorable name |\n| **Product/service** | What are you selling? Describe it |\n| **Target market** | Who are your customers? (Learners, teachers, parents) |\n| **SWOT analysis** | Strengths, weaknesses, opportunities, threats |\n| **Marketing plan** | How will you advertise? (Posters, social media, word of mouth) |\n| **Budget** | Costs, selling prices, expected revenue, expected profit |\n| **Goals** | What do you want to achieve? (How much profit? How many sales?) |\n\n**Tips for Entrepreneur\'s Day:**\n1. Choose a product that is easy to make and popular with your target market\n2. Keep costs LOW to maximise profit\n3. Set prices that are affordable but still make a good profit\n4. Make your stall attractive and welcoming\n5. Be friendly and enthusiastic — good customer service sells!\n6. Keep a record of EVERY sale and expense\n\n**Key message:** Advertising and planning are essential for business success. By understanding the AIDA model, choosing the right advertising methods, and creating a solid budget, you are building real business skills for the future.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: The Economy — The Production Process (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Inputs, Outputs, and the Production Process ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## The Production Process\n\n**Production** is the process of turning raw materials (inputs) into finished goods and services (outputs) that satisfy people\'s needs and wants.\n\n### Inputs, Processes, and Outputs\n\n| Stage | Description | Example: Making bread |\n|-------|-----------|---------------------|\n| **Inputs** | Resources used in production | Flour, water, yeast, salt, oven, baker |\n| **Process** | The steps to transform inputs into outputs | Mixing, kneading, baking |\n| **Output** | The finished product or service | A loaf of bread |\n\n### Types of Inputs\n\nInputs are the same as the **factors of production**:\n\n| Input (Factor) | Description | Example (bread bakery) |\n|---------------|-----------|----------------------|\n| **Natural resources (land)** | Raw materials from nature | Wheat (flour), water, salt |\n| **Labour** | Human effort and skills | The baker and assistants |\n| **Capital** | Tools, machines, and money | Ovens, mixing bowls, delivery van |\n| **Entrepreneurship** | The person who organises everything | The bakery owner |\n\n### Types of Outputs\n\n| Output type | Description | Examples |\n|------------|-----------|----------|\n| **Goods** | Physical products | Bread, clothes, furniture, cars |\n| **Services** | Non-physical activities | Teaching, medical care, banking |'),
  t(2, '### The Production Process in Each Sector\n\n**Primary sector — extracting from nature:**\n\n| Input | Process | Output |\n|-------|---------|--------|\n| Seeds, soil, water, labour | Planting, growing, harvesting | Wheat, maize, fruit |\n| Earth, mining equipment | Drilling, blasting, extracting | Gold, coal, iron ore |\n| Ocean, boats, nets | Fishing, sorting | Fresh fish |\n\n**Secondary sector — manufacturing:**\n\n| Input | Process | Output |\n|-------|---------|--------|\n| Flour, yeast, water | Mixing, kneading, baking | Bread |\n| Steel, glass, rubber | Cutting, welding, assembling | Cars |\n| Cotton fabric, thread | Cutting, sewing, finishing | Clothing |\n\n**Tertiary sector — providing services:**\n\n| Input | Process | Output |\n|-------|---------|--------|\n| Teacher, textbooks, classroom | Teaching, assessing | Education |\n| Doctor, medicine, equipment | Examining, diagnosing, treating | Health care |\n| Driver, vehicle, fuel | Driving, transporting | Transport service |\n\n### Productivity\n\n**Productivity** measures how efficiently inputs are turned into outputs.\n\n$$\\text{Productivity} = \\frac{\\text{Output}}{\\text{Input}}$$\n\n**Example:** A bakery uses 100 kg of flour to produce 200 loaves of bread. Productivity = 200 ÷ 100 = 2 loaves per kg of flour.'),
  q(3, 'In the production process, wheat, water, and yeast are examples of:',
    ['Inputs (resources used in production)', 'Outputs (finished products)', 'Processes (steps taken)', 'Services (actions performed)'], 0,
    'Wheat, water, and yeast are raw materials (inputs) that go into the production process. The output is the finished bread.'),
  fb(4, 'The production process turns ___ into outputs. Productivity measures how ___ inputs are turned into outputs.',
    ['inputs', 'efficiently'],
    'Inputs (resources) are transformed into outputs (finished goods/services). Productivity measures how efficiently this happens — more output from less input means higher productivity.'),
  t(5, '### Technology in the Production Process\n\nTechnology plays an important role in modern production.\n\n| Type of technology | How it helps | Example |\n|-------------------|-------------|--------|\n| **Machinery** | Does work faster and more accurately | A tractor ploughs a field faster than a person with a hoe |\n| **Computers** | Manages information and controls processes | A computer controls the temperature in a bakery oven |\n| **Robots** | Perform repetitive tasks without tiring | Car assembly robots weld and paint cars |\n| **Internet** | Connects businesses to customers worldwide | An online shop sells products to anyone in SA |\n| **Mobile phones** | Enables communication and payments | A farmer checks market prices on their phone |\n\n### Advantages of Technology\n\n- **Increased productivity:** Machines produce more in less time\n- **Better quality:** Consistent, precise products\n- **Lower costs:** Fewer workers needed for some tasks\n- **Access to markets:** Sell products online to a wider audience\n\n### Disadvantages of Technology\n\n- **Job losses:** Machines replace workers, increasing unemployment\n- **Expensive:** New technology costs a lot of money\n- **Training needed:** Workers must learn to use new technology\n- **Environmental impact:** Factories and machines cause pollution'),
  q(6, 'A major disadvantage of using more technology in the production process is:',
    ['Job losses — machines replace workers', 'Better quality products', 'Faster production', 'Access to more markets'], 0,
    'When machines and robots replace human workers, it leads to job losses and higher unemployment — a major concern in South Africa.'),
  t(7, '### Sustainable Use of Resources\n\nAs we produce goods and services, we use the earth\'s resources. **Sustainable use** means using resources in a way that meets our needs today without harming the ability of future generations to meet their needs.\n\n| Resource | Unsustainable use | Sustainable use |\n|----------|-------------------|----------------|\n| **Water** | Polluting rivers; wasting water | Saving water; recycling water; fixing leaks |\n| **Forests** | Cutting down all trees for wood | Planting new trees (reforestation); using recycled paper |\n| **Soil** | Over-farming until soil is useless | Crop rotation; composting; organic farming |\n| **Energy** | Burning coal for electricity | Using solar panels and wind turbines |\n| **Minerals** | Mining without restoring the land | Rehabilitating mined land; recycling metals |\n\n### The Three Rs\n\n| R | Meaning | Example |\n|---|---------|--------|\n| **Reduce** | Use less | Turn off lights; use less water; buy only what you need |\n| **Reuse** | Use again | Use shopping bags again; refill water bottles |\n| **Recycle** | Turn waste into new products | Recycle paper, glass, plastic, and metal |'),
  fb(8, 'Sustainable development means meeting the needs of the present without harming ___ generations. The three Rs are Reduce, Reuse, and ___.',
    ['future', 'Recycle'],
    'Sustainability is about not harming the future. The three Rs help protect the environment: Reduce consumption, Reuse items, and Recycle waste.'),
  q(9, 'Which of the following is an example of sustainable use of resources?',
    ['A farmer practises crop rotation to protect the soil', 'A factory dumps waste into a river', 'A mining company leaves a huge hole in the ground', 'A business uses electricity 24 hours a day with no need'], 0,
    'Crop rotation protects soil fertility for future use — it is sustainable. Dumping waste, abandoning mines, and wasting electricity are all unsustainable.'),
  t(10, '### Economic Growth and the Meaning of Productivity\n\nWhen a country\'s production increases over time, the economy **grows**.\n\n**Economic growth** means the total value of goods and services produced in the country increases from one year to the next.\n\n**How economic growth benefits people:**\n- More goods and services available\n- More jobs created\n- Higher incomes\n- Better standard of living\n- More tax revenue for the government\n\n**How to improve productivity:**\n\n| Strategy | How it works |\n|----------|-------------|\n| **Education and training** | Skilled workers produce more and better-quality outputs |\n| **Better technology** | Modern machines produce faster and more efficiently |\n| **Good management** | Well-organised businesses waste less time and resources |\n| **Healthy workers** | Healthy people work harder and miss fewer days |\n| **Infrastructure** | Good roads, electricity, and water supply help businesses operate |\n\n**Key message:** The production process is how the economy creates value. By understanding inputs, processes, outputs, and productivity, you can see how businesses work and how the economy grows. Using resources sustainably ensures that production can continue into the future.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Financial Literacy — Savings and the Role of Banks (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The Role of Banks and Services Offered ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## The Role of Banks and Services Offered\n\nBanks play a central role in the economy. They keep money safe, help people save, and make loans to individuals and businesses.\n\n### What Is a Bank?\n\nA bank is a **financial institution** that accepts deposits (money from savers) and makes loans (lends money to borrowers).\n\n### How Banks Work\n\n```\nSavers deposit money → Bank keeps it safe → Bank lends to borrowers\n      ↓                                           ↓\n  Earn interest                              Pay interest\n  (reward for saving)                        (cost of borrowing)\n```\n\n**The bank makes money** by charging borrowers a HIGHER interest rate than it pays to savers.\n\n**Example:**\n- Saver deposits R10 000 at 5% interest → Bank pays saver R500 per year\n- Bank lends R10 000 to a borrower at 10% interest → Borrower pays bank R1 000 per year\n- Bank\'s profit: R1 000 − R500 = R500\n\n### Types of Banks\n\n| Type | What they do | Examples |\n|------|-------------|----------|\n| **Commercial banks** | Everyday banking for individuals and businesses | ABSA, FNB, Standard Bank, Capitec, Nedbank |\n| **The Reserve Bank (SARB)** | Controls the money supply; sets interest rates; prints money | South African Reserve Bank |\n| **Development banks** | Lend money for infrastructure and development projects | Development Bank of Southern Africa (DBSA) |'),
  t(2, '### Services Offered by Banks\n\n| Service | Description | Who uses it |\n|---------|-----------|-------------|\n| **Savings accounts** | Store money safely and earn interest | Individuals, families |\n| **Current accounts** | Account for daily transactions | Individuals and businesses |\n| **Fixed deposit** | Save a lump sum for a fixed period at a higher interest rate | Savers wanting better returns |\n| **Loans** | Bank lends money; you pay back with interest | Home buyers, car buyers, businesses |\n| **Home loans (mortgages)** | Long-term loan to buy a house | Home buyers |\n| **Overdraft** | Allows you to spend more than what is in your account (temporary loan) | Account holders |\n| **Credit cards** | A card that lets you borrow money for purchases | Individuals |\n| **Debit cards** | A card linked to your account; uses YOUR money | Account holders |\n| **Internet banking** | Manage your account online | Anyone with internet |\n| **Mobile banking** | Manage your account via phone app | Smartphone users |\n| **ATM services** | Withdraw cash, check balance, deposit money | Card holders |\n| **Insurance** | Protects against financial loss | Individuals and businesses |\n\n### The Difference Between Debit Cards and Credit Cards\n\n| | Debit card | Credit card |\n|---|-----------|-------------|\n| **Whose money?** | YOUR money (from your account) | The BANK\'S money (a loan) |\n| **Interest?** | No interest charged | Interest charged if you do not pay in full |\n| **Risk** | Can only spend what you have | Can lead to debt if not managed |\n| **Best for** | Everyday purchases | Emergencies; building a credit history |'),
  q(3, 'The South African Reserve Bank (SARB) is responsible for:',
    ['Printing money and setting interest rates', 'Offering savings accounts to individuals', 'Selling goods and services', 'Providing home loans'], 0,
    'The SARB is the central bank — it prints money, sets interest rates, and controls the money supply. It does not deal directly with the public.'),
  fb(4, 'Banks accept ___ from savers and make ___ to borrowers.',
    ['deposits', 'loans'],
    'Banks take deposits (money from savers) and lend that money to borrowers (as loans), charging interest on the loans.'),
  t(5, '### The Purpose of Saving at a Bank\n\nSaving at a bank is safer and more rewarding than keeping cash at home.\n\n| Keeping cash at home | Saving at a bank |\n|---------------------|------------------|\n| Risk of theft or fire | Money is insured and secure |\n| No interest earned | Earn interest on your savings |\n| Tempting to spend | Harder to access impulsively |\n| Cannot prove you had the money | Bank statements prove your savings |\n| No access to banking services | Access to loans, cards, EFTs |\n\n### Types of Savings Options\n\n| Option | Risk | Return | Access |\n|--------|------|--------|--------|\n| **Savings account** | Very low | Low interest | Easy to withdraw |\n| **Fixed deposit** | Very low | Higher interest | Locked for a fixed period |\n| **Stokvel** | Low-medium | Depends on group | Monthly or annual payout |\n| **Unit trusts** | Medium | Potentially higher | Can withdraw but takes a few days |\n| **Government bonds (RSA Retail Bonds)** | Very low | Good interest | Locked for 2-5 years |'),
  q(6, 'Why is saving at a bank better than keeping cash at home?',
    ['Money is secure, insured, and earns interest', 'Banks give you free money', 'You can spend it faster at the bank', 'Cash at home earns more interest'], 0,
    'Banks keep money safe from theft and fire, insure deposits, and pay interest. Cash at home earns no interest and is at risk.'),
  t(7, '### Community Savings Schemes\n\nIn South Africa, many communities use group savings schemes to help members save money.\n\n**Stokvels:**\n- Over 11 million South Africans belong to stokvels\n- Stokvels save over R50 billion per year\n- They provide a disciplined way to save\n\n**Burial societies:**\n- Members contribute monthly\n- When a member\'s family has a death, the society pays funeral costs\n- Very important in South African communities where funerals are expensive\n\n**Community savings groups:**\n- Informal groups that save together\n- Often operate without a bank account\n- Trust and accountability are essential\n\n### The Importance of Saving for the Economy\n\n| How saving helps | Explanation |\n|-----------------|------------|\n| **Investment** | Banks use savings to lend to businesses that create jobs |\n| **Economic stability** | People with savings are more resilient during tough times |\n| **Less debt** | Savers borrow less, reducing financial stress |\n| **Capital formation** | Savings become capital for investment and growth |'),
  fb(8, 'Over ___ million South Africans belong to stokvels. When you save at a bank, the bank uses your money to make ___ to others.',
    ['11', 'loans'],
    'Over 11 million South Africans participate in stokvels. Banks use deposited savings to make loans, which drives economic activity.'),
  q(9, 'A fixed deposit account offers higher interest than a regular savings account because:',
    ['Your money is locked in for a fixed period, so the bank can use it for longer', 'It is a free gift from the bank', 'You can withdraw the money at any time', 'Fixed deposits are only for businesses'], 0,
    'With a fixed deposit, you agree not to withdraw for a set period. The bank rewards this with higher interest because it can use the money for longer.'),
  t(10, '### Opening a Savings Account and Managing Your Money\n\n**Steps to open a savings account:**\n1. Choose a bank (compare fees, interest rates, and services)\n2. Visit the bank or apply online\n3. Bring your ID (or birth certificate if under 18) and proof of address\n4. A parent or guardian must come with you if you are under 18\n5. Make your first deposit\n\n**Managing your bank account:**\n- Check your balance regularly\n- Keep track of bank charges (fees the bank charges)\n- Set up a savings goal\n- Never share your PIN or password\n- Report lost or stolen cards immediately\n\n**Protecting yourself from fraud:**\n- Never give your PIN to anyone\n- Do not click on suspicious links in emails or SMS\n- Always log out of internet banking\n- Cover the keypad when entering your PIN at an ATM\n- If something seems wrong, contact your bank immediately\n\n**Key message:** Banks are essential for a healthy economy. They provide a safe place to save, offer loans for growth, and connect savers with borrowers. By saving regularly — whether at a bank, in a stokvel, or through a community group — you are building a secure financial future for yourself and your family.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 7
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 7/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 7:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 7', schoolId: SCHOOL_ID, orderIndex: 7,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 7:', String(GRADE_ID));
  }

  // Find or create EMS subject
  let SUBJECT_ID;
  let subjectDoc = await db.collection('subjects').findOne({ name: /Econ.*Manage/i });
  if (!subjectDoc) {
    const result = await db.collection('subjects').insertOne({
      name: 'Economic and Management Sciences',
      code: 'EMS',
      schoolId: SCHOOL_ID,
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

  const now = new Date();
  const baseDoc = {
    schoolId: SCHOOL_ID,
    createdBy: CREATED_BY,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    type: 'lesson',
    status: 'approved',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const chapters = [
    {
      title: 'Chapter 1: The Economy — History of Money',
      description: 'Bartering and its problems; the development of money from commodity money to electronic payments; South African currency; characteristics and functions of money.',
      order: 1,
      lessons: [
        { title: 'The History of Money', description: 'Bartering and its problems; stages in the development of money; South African currency (the rand); characteristics of good money; functions of money; modern electronic money.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: The Economy — Needs and Wants',
      description: 'The difference between needs and wants; scarcity and choice; opportunity cost; prioritising needs; making good economic decisions.',
      order: 2,
      lessons: [
        { title: 'Needs, Wants, and Scarcity', description: 'Defining needs and wants; telling them apart in context; scarcity and unlimited wants; opportunity cost; prioritising needs; Maslow\'s hierarchy; needs and wants in South Africa.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: The Economy — Goods and Services',
      description: 'Goods vs services; types of goods; the three sectors of the economy (primary, secondary, tertiary); producers, consumers, and distributors.',
      order: 3,
      lessons: [
        { title: 'Goods and Services and the Sectors of the Economy', description: 'Tangible goods vs intangible services; types of goods; the primary, secondary, and tertiary sectors; how sectors are connected; producers and consumers; SA economic sectors.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: The Economy — Inequality and Poverty',
      description: 'Types of inequality; causes and effects of poverty; urban vs rural challenges; government strategies to reduce poverty; creating sustainable job opportunities.',
      order: 4,
      lessons: [
        { title: 'Inequality and Poverty in South Africa', description: 'Income, wealth, social, and gender inequality; causes and effects of poverty; absolute vs relative poverty; government efforts; SMMEs and skills development.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Financial Literacy — Accounting Concepts',
      description: 'Key accounting terms (capital, assets, liabilities, income, expenses, profit, loss); the accounting equation; how transactions affect the equation; personal statement of net worth; income and expenses.',
      order: 5,
      lessons: [
        { title: 'Introduction to Accounting Concepts', description: 'Why keep financial records; key terms (capital, assets, liabilities, owner\'s equity, income, expenses, profit, loss); the accounting equation; transactions and the equation; personal net worth.', blocks: ch5_lesson1, term: 2 },
        { title: 'Income and Expenses', description: 'Types of business income and expenses; calculating profit and loss; personal income and expenditure; source documents for personal finances; statement of net worth for a business.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Financial Literacy — Budgets',
      description: 'Personal and business budgets; fixed vs variable expenses; creating a budget; surplus and deficit; savings and the 50/30/20 rule.',
      order: 6,
      lessons: [
        { title: 'Personal and Business Budgets', description: 'Importance of budgets; steps to create a budget; fixed vs variable expenses; personal budget example; business budget example; surplus vs deficit; savings and the 50/30/20 rule.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Financial Literacy — Savings and Banking',
      description: 'Saving vs investing; why save; interest; stokvels and community savings; the role of banks; services offered by banks; opening a bank account.',
      order: 7,
      lessons: [
        { title: 'Savings and Investments', description: 'Saving vs investing; reasons to save; practical saving tips; interest explained; stokvels and community savings; role of banks; bank services; opening an account.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Entrepreneurship — The Entrepreneur',
      description: 'Definition of an entrepreneur; characteristics and skills of entrepreneurs; South African entrepreneurs; buying and selling; mark-up and profit; importance of entrepreneurs.',
      order: 8,
      lessons: [
        { title: 'What Is an Entrepreneur?', description: 'Entrepreneur vs intrapreneur; characteristics of successful entrepreneurs; SA entrepreneurs; entrepreneurial skills; buying and selling for profit; mark-up; importance of SMMEs.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Entrepreneurship — Starting a Business',
      description: 'Formal vs informal businesses; steps to start a business; sources of capital; SWOT analysis; setting SMARTER goals; record-keeping.',
      order: 9,
      lessons: [
        { title: 'Formal and Informal Businesses', description: 'Formal vs informal businesses; steps to start a business; sources of start-up capital; SWOT analysis; SMARTER goals; challenges and solutions; record-keeping.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Entrepreneurship — Advertising and the Business Plan',
      description: 'Advertising and the AIDA model; types of advertising media; responsible advertising; Entrepreneur\'s Day budget; fixed and variable costs; break-even; creating a business plan.',
      order: 10,
      lessons: [
        { title: 'Advertising and Marketing', description: 'What is advertising; the AIDA model; types of advertising media; responsible advertising; Entrepreneur\'s Day budget; cost price, selling price, mark-up; break-even; business plan.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: The Economy — The Production Process',
      description: 'Inputs, processes, and outputs; factors of production; production in each sector; technology in production; sustainable use of resources; productivity and economic growth.',
      order: 11,
      lessons: [
        { title: 'Inputs, Outputs, and the Production Process', description: 'Inputs and outputs; factors of production as inputs; production in primary, secondary, tertiary sectors; technology advantages and disadvantages; sustainability and the three Rs; productivity.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Financial Literacy — Savings and the Role of Banks',
      description: 'How banks work; types of banks; services offered; saving at a bank vs cash at home; stokvels and community schemes; opening and managing a bank account.',
      order: 12,
      lessons: [
        { title: 'The Role of Banks and Services Offered', description: 'How banks work; types of banks; bank services; debit vs credit cards; purpose of saving; savings options; community savings schemes; opening and managing an account.', blocks: ch12_lesson1, term: 4 },
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
      resources: resourceIds.map((id, i) => ({ resourceId: id, order: i })),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 7 Economic and Management Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering The Economy (history of money, needs and wants, goods and services, inequality and poverty, the production process), Financial Literacy (accounting concepts, income and expenses, budgets, savings and banking), and Entrepreneurship (the entrepreneur, starting a business, advertising and the business plan) for the Grade 7 EMS curriculum.',
    schoolId: SCHOOL_ID,
    gradeId: GRADE_ID,
    subjectId: SUBJECT_ID,
    status: 'published',
    chapters: textbookChapters,
    createdBy: CREATED_BY,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  });

  console.log('\n========================================');
  console.log('  TEXTBOOK: Grade 7 EMS');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
