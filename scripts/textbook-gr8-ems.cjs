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
// CHAPTER 1: The Economy — Government (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The Role of Government in the Economy ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Role of Government in the Economy\n\nIn Grade 7, you learned about needs and wants, goods and services, and inequality. Now we will look at how the **government** plays a role in the South African economy.\n\n### What Is Government?\n\n**Government** is the group of people who have the authority to govern a country. The government makes laws, collects taxes, and provides services to the people.\n\nSouth Africa is a **democratic** country, meaning the people elect their leaders. The government is responsible for using the country\'s resources wisely to improve the lives of all citizens.\n\n### The Three Levels of Government\n\n| Level | Area of responsibility | Examples of services |\n|-------|----------------------|---------------------|\n| **National government** | The whole country | Defence, foreign affairs, national roads, SARS |\n| **Provincial government** | One of the 9 provinces | Schools, hospitals, provincial roads, housing |\n| **Local government (municipalities)** | Cities, towns, and rural areas | Water, electricity, refuse removal, local roads, parks |'),
  t(2, '### The Role of Government in Respect of Households\n\nThe government interacts with households in two important ways:\n\n**As a consumer:**\n- The government buys goods and services from businesses (e.g. office supplies, vehicles, construction services)\n- Government employees (teachers, nurses, police officers) earn wages and salaries\n\n**As a producer (provider of services):**\n- The government provides public services that households need:\n  - **Education:** Public schools and universities\n  - **Health care:** Public hospitals and clinics\n  - **Social grants:** Child support grant, old age pension, disability grant\n  - **Housing:** RDP houses for low-income families\n  - **Safety and security:** Police (SAPS) and courts\n  - **Infrastructure:** Roads, bridges, dams, electricity (Eskom)\n\n### The Role of Government in Respect of Businesses\n\n**As a consumer:**\n- The government buys from businesses through **tenders** and procurement\n\n**As a producer and regulator:**\n- The government creates laws that businesses must follow (e.g. Companies Act, Consumer Protection Act)\n- It provides infrastructure (roads, ports, railways) that businesses need to operate\n- It supports small businesses through agencies like SEDA and SEFA'),
  q(3, 'Which level of government is responsible for providing water and refuse removal?',
    ['Local government (municipalities)', 'National government', 'Provincial government', 'All three levels equally'], 0,
    'Local government (municipalities) is responsible for basic services like water, electricity, refuse removal, and local roads.'),
  fb(4, 'South Africa has ___ levels of government. Local government is also called a ___.',
    ['three', 'municipality'],
    'The three levels are national, provincial, and local. Local government structures are called municipalities.'),
  t(5, '### Government Revenue (Income)\n\nThe government needs money to provide services. This money is called **government revenue**, and most of it comes from **taxes** collected by **SARS (South African Revenue Service)**.\n\n**Types of Taxes:**\n\n| Type | Description | Examples |\n|------|-----------|----------|\n| **Direct tax** | Paid directly by a person or business to SARS | Income tax (individuals), Company tax (businesses) |\n| **Indirect tax** | Added to the price of goods and services | VAT (Value Added Tax — currently 15%), Fuel levy, Sin tax |\n\n**Other sources of government revenue:**\n- Borrowing from local and international institutions\n- Fees and fines (e.g. traffic fines, licence fees)\n- Income from state-owned enterprises (Eskom, Transnet, SAA)\n\n### Who Pays Income Tax?\n- Individuals who earn above a certain threshold pay income tax\n- South Africa uses a **progressive tax** system — the more you earn, the higher the percentage you pay\n- This helps **redistribute income** from wealthy to poorer citizens'),
  q(6, 'VAT (Value Added Tax) is an example of:',
    ['Indirect tax', 'Direct tax', 'Income tax', 'Company tax'], 0,
    'VAT is an indirect tax because it is added to the price of goods and services. The consumer pays it indirectly when buying products.'),
  t(7, '### Government Expenditure (Spending)\n\nThe money the government collects through taxes is spent on providing services to the people.\n\n**Main areas of government expenditure in South Africa:**\n\n| Area | Examples |\n|------|----------|\n| **Education** | Teacher salaries, school buildings, textbooks, NSFAS |\n| **Health** | Hospital equipment, nurse and doctor salaries, medicines |\n| **Social protection** | Social grants (child support, old age, disability) |\n| **Housing** | RDP housing programmes |\n| **Transport** | Building and maintaining roads, Gautrain, PRASA |\n| **Safety and security** | Police, courts, prisons, defence |\n| **Infrastructure** | Dams, bridges, power stations |\n\n**Over 18 million South Africans** receive social grants, making social protection one of the largest areas of government spending.\n\n**Key insight:** Government expenditure should improve the quality of life for all citizens, reduce poverty, and grow the economy.'),
  fb(8, 'Government revenue comes mainly from ___ collected by SARS. The largest areas of government expenditure include education, health, and ___.',
    ['taxes', 'social protection'],
    'SARS collects taxes (income tax, VAT, company tax) to fund government expenditure on education, health, social grants, and infrastructure.'),
  q(9, 'The progressive tax system means that:',
    ['People who earn more pay a higher percentage of tax', 'Everyone pays the same percentage of tax', 'Only businesses pay tax', 'Poor people pay more tax than wealthy people'], 0,
    'Progressive tax means the more you earn, the higher the percentage of tax you pay. This is designed to reduce inequality.'),
  t(10, '### Government as Consumer and Producer — Summary\n\n| Role | As Consumer | As Producer/Provider |\n|------|------------|---------------------|\n| **With households** | Employs people (pays salaries) | Provides education, health care, grants, housing, safety |\n| **With businesses** | Buys goods and services through tenders | Creates laws and regulations; provides infrastructure |\n\n**Why is the government important in the economy?**\n1. It provides services that private businesses may not provide (e.g. defence, police)\n2. It corrects market failures (e.g. providing free education for those who cannot afford it)\n3. It redistributes income to reduce the gap between rich and poor\n4. It regulates businesses to protect consumers and workers\n5. It creates an environment where businesses can grow and create jobs'),
];

// --- Lesson 2: The National Budget ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## The National Budget\n\nEvery year in February, the **Minister of Finance** presents the **national budget** to Parliament. The budget is a plan showing how the government will earn money (revenue) and how it will spend money (expenditure) for the coming year.\n\n### What Is a Budget?\n\nA **budget** is a financial plan that estimates income and expenses for a specific period. Just like a family needs a budget to manage its money, the government needs a national budget to manage the country\'s finances.\n\n### The National Budget Process\n\n| Step | What happens |\n|------|-------------|\n| 1 | National Treasury prepares the budget over many months |\n| 2 | The Minister of Finance presents the budget speech in Parliament (usually in February) |\n| 3 | Parliament debates and approves the budget |\n| 4 | Government departments receive their allocations |\n| 5 | SARS collects the revenue (taxes) throughout the year |\n| 6 | The Auditor-General checks that money was spent correctly |'),
  t(2, '### The Influence of the National Budget on Growth\n\nThe national budget affects economic growth in several ways:\n\n**How the budget promotes growth:**\n- **Spending on infrastructure** (roads, power stations, ports) creates jobs and makes it easier for businesses to operate\n- **Spending on education and training** develops a skilled workforce\n- **Tax incentives** encourage businesses to invest and create jobs\n- **Social grants** give poor households money to spend, which stimulates the economy\n\n**How the budget redresses economic inequalities:**\n- Progressive income tax takes more from the wealthy\n- Social grants provide income to the poorest families\n- Free basic services (water, electricity, housing) support low-income households\n- Spending on education and health in disadvantaged areas\n\n### Budget Surplus vs Budget Deficit\n\n| Situation | What it means |\n|-----------|---------------|\n| **Budget surplus** | Revenue > Expenditure (government earns more than it spends) |\n| **Budget deficit** | Revenue < Expenditure (government spends more than it earns) |\n| **Balanced budget** | Revenue = Expenditure |\n\nSouth Africa usually has a **budget deficit**, meaning the government borrows money to cover the shortfall. This increases the country\'s **national debt**.'),
  q(3, 'If the government earns R1.5 trillion in revenue but spends R1.8 trillion, this is called a:',
    ['Budget deficit', 'Budget surplus', 'Balanced budget', 'Trade surplus'], 0,
    'When expenditure exceeds revenue, the government has a budget deficit. It must borrow money to cover the difference.'),
  fb(4, 'The national budget is presented by the Minister of ___. When government spending exceeds revenue, it is called a budget ___.',
    ['Finance', 'deficit'],
    'The Minister of Finance presents the budget in Parliament each February. A deficit means spending is more than income.'),
  t(5, '### How the Budget Affects You\n\nThe national budget affects every South African:\n\n**For learners:**\n- Determines how much money goes to schools and universities\n- Affects whether textbooks and school meals are provided\n- Influences the availability of bursaries (like NSFAS)\n\n**For families:**\n- Changes in income tax affect how much money families take home\n- Changes in VAT affect the price of goods in shops\n- Social grant amounts may increase or decrease\n- Fuel levy changes affect transport costs\n\n**For businesses:**\n- Company tax rates affect profits\n- Infrastructure spending creates business opportunities\n- Tax incentives may encourage investment\n\n**Example:** If the Minister announces a 1% increase in VAT (from 15% to 16%), a R100 item would now cost R116 instead of R115. This affects everyone who buys goods and services.'),
  q(6, 'An increase in VAT from 15% to 16% would directly affect:',
    ['The price of goods and services for everyone', 'Only the income of wealthy people', 'Only businesses, not consumers', 'Only government employees'], 0,
    'VAT is added to the price of goods and services. An increase in VAT raises prices for all consumers.'),
  t(7, '### Key Budget Concepts\n\n| Concept | Definition |\n|---------|----------|\n| **Revenue** | Money the government earns (mainly taxes) |\n| **Expenditure** | Money the government spends on services |\n| **Deficit** | When expenditure exceeds revenue |\n| **Surplus** | When revenue exceeds expenditure |\n| **National debt** | Total amount the government owes (from borrowing) |\n| **Fiscal policy** | Government\'s plan for taxing and spending |\n| **Allocation** | The amount of money given to each department |\n\n### How Budget Allocations Work\n\nThe national budget divides money among government departments:\n\n| Department | Share of budget |\n|-----------|----------------|\n| Education | Largest share (approximately 20%) |\n| Health | Second largest |\n| Social protection | Third largest |\n| Police and defence | Significant portion |\n| Infrastructure | Growing portion |\n\n**Note:** Education consistently receives the largest share of the SA budget, showing the government\'s commitment to developing human capital.'),
  fb(8, 'Fiscal policy refers to the government\'s plan for ___ and spending. Education receives the ___ share of the national budget.',
    ['taxing', 'largest'],
    'Fiscal policy involves decisions about taxation and government spending. Education gets the biggest allocation at approximately 20% of the budget.'),
  q(9, 'Which of the following is a way the national budget redresses economic inequalities?',
    ['Providing social grants to poor families', 'Reducing spending on education', 'Increasing taxes for poor households', 'Cutting free basic services'], 0,
    'Social grants transfer money to the poorest households, helping to reduce the gap between rich and poor.'),
  t(10, '### Personal and Household Budgets\n\nJust like the government, every family should have a budget.\n\n**Steps to create a personal budget:**\n1. List all sources of **income** (salary, pocket money, grants)\n2. List all **expenses** (rent, food, transport, school fees, electricity)\n3. Subtract total expenses from total income\n4. If income > expenses: you have a **surplus** (save or invest it)\n5. If expenses > income: you have a **deficit** (cut spending or earn more)\n\n**Example: Thandi\'s Monthly Budget**\n\n| Income | R | Expenses | R |\n|--------|---:|----------|---:|\n| Salary | 8 500 | Rent | 2 500 |\n| | | Food | 1 800 |\n| | | Transport | 1 200 |\n| | | Electricity | 600 |\n| | | Clothing | 500 |\n| | | Savings | 500 |\n| **Total income** | **8 500** | **Total expenses** | **7 100** |\n\n**Surplus:** R8 500 - R7 100 = R1 400\n\nThandi has R1 400 left over each month. She can save this or use it for unexpected expenses.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: The Economy — Standard of Living (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Standard of Living and the Environment ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Standard of Living\n\nThe **standard of living** refers to the level of comfort, material goods, and necessities available to a person or community. It measures how well people live.\n\n### Factors That Affect Standard of Living\n\n| Factor | How it affects standard of living |\n|--------|----------------------------------|\n| **Income** | Higher income allows people to buy more goods and services |\n| **Employment** | Having a job provides income and a sense of purpose |\n| **Education** | Better education leads to better-paying jobs |\n| **Health care** | Access to health services keeps people healthy and productive |\n| **Housing** | Safe, adequate housing improves quality of life |\n| **Safety** | Low crime rates make communities more liveable |\n| **Infrastructure** | Good roads, water supply, and electricity improve daily life |\n\n### Lifestyles in South Africa\n\n**Urban (city) lifestyles:**\n- Access to shopping centres, hospitals, and schools\n- Better job opportunities\n- Higher cost of living\n- Challenges: traffic, pollution, crime\n\n**Rural lifestyles:**\n- More natural environment\n- Lower cost of living\n- Challenges: limited services, fewer job opportunities, poor infrastructure\n- Many rural areas depend on subsistence farming and social grants'),
  t(2, '### Modern vs Traditional Societies\n\n| Feature | Modern society | Traditional/Rural society |\n|---------|---------------|-------------------------|\n| Economy | Industrial, service-based | Farming, subsistence |\n| Technology | High use of technology | Limited technology |\n| Housing | Formal houses, apartments | Traditional homes, informal settlements |\n| Services | Access to water, electricity, internet | Limited access to basic services |\n| Income | Wage-based income | Farming income, social grants |\n\n### Inequality in South Africa\n\nSouth Africa is one of the **most unequal countries in the world**. The gap between the rich and the poor is very large.\n\n**Causes of inequality:**\n- Historical apartheid policies that denied opportunities to the majority\n- Unequal access to quality education\n- High unemployment (over 30%)\n- Unequal distribution of land and resources\n\n**Measures of inequality:**\n- **Gini coefficient** — a number between 0 and 1 (0 = perfect equality, 1 = perfect inequality). South Africa\'s Gini coefficient is approximately 0.63, one of the highest in the world.'),
  q(3, 'Which of the following best describes standard of living?',
    ['The level of comfort, material goods, and necessities available to a person', 'The amount of money in a person\'s bank account', 'The number of cars a person owns', 'The size of a person\'s house only'], 0,
    'Standard of living measures overall comfort and access to goods, services, and necessities — not just one factor like income or housing.'),
  fb(4, 'South Africa is one of the most ___ countries in the world. The ___ coefficient measures the level of inequality.',
    ['unequal', 'Gini'],
    'South Africa has a Gini coefficient of approximately 0.63, indicating very high levels of inequality between rich and poor.'),
  t(5, '### The Impact of Development on the Environment\n\nAs countries develop and people\'s standard of living improves, the **environment** is often affected negatively.\n\n| Activity | Environmental impact |\n|----------|---------------------|\n| **Mining** | Destroys land, pollutes water, produces toxic waste |\n| **Factories** | Air pollution, water pollution, greenhouse gases |\n| **Urbanisation** | Loss of farmland, deforestation, increased waste |\n| **Transport** | Carbon emissions, air pollution |\n| **Agriculture** | Soil erosion, water overuse, pesticide pollution |\n\n### Sustainable Development\n\n**Sustainable development** means meeting the needs of the present without compromising the ability of future generations to meet their own needs.\n\n**Ways to promote sustainability:**\n- Using renewable energy (solar, wind) instead of coal\n- Recycling and reducing waste\n- Protecting natural areas and biodiversity\n- Water conservation\n- Green building practices'),
  q(6, 'Sustainable development means:',
    ['Meeting present needs without harming future generations\' ability to meet their needs', 'Developing as fast as possible regardless of the environment', 'Stopping all industrial development', 'Only using technology that existed 100 years ago'], 0,
    'Sustainable development balances economic growth with environmental protection, ensuring resources are available for future generations.'),
  t(7, '### Unemployment in South Africa\n\nUnemployment is one of South Africa\'s biggest challenges and directly affects the standard of living.\n\n**Types of unemployment:**\n\n| Type | Description |\n|------|----------|\n| **Structural unemployment** | Workers\' skills do not match available jobs |\n| **Cyclical unemployment** | Caused by a downturn in the economy |\n| **Seasonal unemployment** | Jobs only available at certain times of the year (e.g. farm work during harvest) |\n| **Frictional unemployment** | People between jobs or looking for their first job |\n\n**Effects of unemployment:**\n- Poverty and lower standard of living\n- Increased crime rates\n- Mental health problems (stress, depression)\n- Loss of skills over time\n- Dependence on social grants\n\n**South Africa\'s unemployment rate** is over 30% (using the narrow definition), and youth unemployment (ages 15-34) is over 45%.'),
  fb(8, 'When workers\' skills do not match available jobs, this is called ___ unemployment. South Africa\'s youth unemployment rate is over ___.',
    ['structural', '45%'],
    'Structural unemployment occurs when there is a mismatch between workers\' skills and the skills employers need. Youth unemployment in SA exceeds 45%.'),
  q(9, 'Which of the following would improve a community\'s standard of living?',
    ['Building a new clinic and school in the area', 'Closing down the local police station', 'Removing access to clean water', 'Increasing the cost of electricity'], 0,
    'Better health care and education improve the quality of life. A new clinic and school would raise the standard of living in the community.'),
  t(10, '### Productive Use of Resources\n\nTo improve the standard of living and promote a healthy environment, resources must be used **productively** — meaning efficiently and without waste.\n\n**Productive use of resources includes:**\n\n| Resource | Productive use | Wasteful use |\n|----------|---------------|-------------|\n| **Water** | Drip irrigation, fixing leaks, rain harvesting | Leaving taps running, polluting rivers |\n| **Land** | Crop rotation, sustainable farming | Overgrazing, deforestation |\n| **Energy** | Solar panels, energy-efficient appliances | Leaving lights on, using old appliances |\n| **Human resources** | Training and skills development | Not investing in education |\n| **Money** | Saving, investing, budgeting | Impulse buying, gambling |\n\n**Key message:** Every individual, household, business, and government has a responsibility to use resources wisely to protect the environment and ensure a better future for all South Africans.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Financial Literacy — Accounting Concepts (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Accounting Concepts and the Accounting Equation ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Accounting Concepts\n\nAccounting is the process of recording, organising, and reporting the financial information of a business. Every business — even a small spaza shop — must keep records of money coming in and going out.\n\n### Why Keep Financial Records?\n- To know whether the business is making a **profit** or a **loss**\n- To know how much the business **owns** and **owes**\n- To help make good business decisions\n- To submit information to **SARS** for tax purposes\n- To apply for loans from banks\n\n### Key Accounting Concepts\n\n| Concept | Definition | Example |\n|---------|-----------|--------|\n| **Sole trader** | A business owned by one person | A hair salon owned by Nomsa |\n| **Capital** | Money or assets the owner invests in the business | Thabo starts a business with R30 000 |\n| **Assets** | Everything the business owns or is owed | Cash, equipment, stock, debtors |\n| **Liabilities** | Everything the business owes to others | Creditors, bank loan |\n| **Owner\'s equity** | The owner\'s financial interest in the business | Capital + profits − drawings |\n| **Income** | Money earned from selling goods or services | Sales, fees earned, rent income |\n| **Expenses** | Costs the business pays to operate | Rent, salaries, electricity, advertising |'),
  t(2, '### More Key Concepts\n\n| Concept | Definition | Example |\n|---------|-----------|--------|\n| **Profit** | When income exceeds expenses | Income R10 000 − Expenses R7 000 = Profit R3 000 |\n| **Loss** | When expenses exceed income | Income R5 000 − Expenses R8 000 = Loss R3 000 |\n| **Transactions** | Financial events that affect the business | Buying stock, selling goods, paying rent |\n| **Debit** | The left side of an account | Assets and expenses increase on the debit side |\n| **Credit** | The right side of an account | Liabilities, equity, and income increase on the credit side |\n| **Banking** | Using a bank account for business transactions | Deposits, withdrawals, EFT payments |\n\n### The Accounting Equation\n\nThe most important formula in accounting:\n\n$$\\text{Assets} = \\text{Owner\'s Equity} + \\text{Liabilities}$$\n\nThis can also be written as:\n$$A = O + L$$\n\n**The equation must ALWAYS balance.** If assets are R50 000, then owner\'s equity + liabilities must also equal R50 000.\n\n**Example:** Nomsa starts her salon with R20 000 cash and borrows R10 000 from the bank.\n- Assets: Cash R30 000\n- Owner\'s Equity: Capital R20 000\n- Liabilities: Bank loan R10 000\n- Check: R30 000 = R20 000 + R10 000 ✓'),
  q(3, 'A business has assets of R80 000 and liabilities of R25 000. What is the owner\'s equity?',
    ['R55 000', 'R105 000', 'R80 000', 'R25 000'], 0,
    'Owner\'s equity = Assets − Liabilities = R80 000 − R25 000 = R55 000.'),
  fb(4, 'The accounting equation states that Assets = Owner\'s Equity + ___. If a business makes a profit, owner\'s equity ___.',
    ['Liabilities', 'increases'],
    'Assets = Owner\'s Equity + Liabilities. Profit adds to owner\'s equity because the owner\'s share of the business grows.'),
  t(5, '### How Transactions Affect the Accounting Equation\n\nEvery transaction affects at least two items in the equation, keeping it balanced.\n\n**Transaction 1:** Thabo starts a business with R30 000 cash.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Cash: R30 000 | = | Capital: R30 000 | + | R0 |\n\n**Transaction 2:** Buys equipment for R8 000 cash.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Cash: R22 000 | = | Capital: R30 000 | + | R0 |\n| Equipment: R8 000 | | | | |\n| **Total: R30 000** | = | **R30 000** | + | **R0** |\n\n**Transaction 3:** Buys supplies on credit for R5 000.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Cash: R22 000 | = | Capital: R30 000 | + | Creditors: R5 000 |\n| Equipment: R8 000 | | | | |\n| Supplies: R5 000 | | | | |\n| **Total: R35 000** | = | **R30 000** | + | **R5 000** |'),
  q(6, 'Thabo buys a computer for R6 000 cash. Which TWO items in the accounting equation change?',
    ['Cash decreases and Equipment increases (both are assets)', 'Cash decreases and Liabilities increase', 'Owner\'s equity decreases and cash decreases', 'Liabilities decrease and assets increase'], 0,
    'Buying equipment for cash means one asset (cash) decreases and another asset (equipment) increases. Total assets stay the same.'),
  t(7, '### Cash Receipts and Cash Payments\n\n**Cash receipts** are money received by the business. They increase assets (cash/bank).\n\n**Cash payments** are money paid out by the business. They decrease assets (cash/bank).\n\n| Type | Description | Effect on equation |\n|------|-----------|-------------------|\n| **Cash receipt — from sales** | Customer pays for goods or services | Assets ↑, Owner\'s equity ↑ (income) |\n| **Cash receipt — from debtor** | A debtor pays what they owe | Cash ↑, Debtors ↓ (both assets — no net change) |\n| **Cash payment — expense** | Business pays rent, salaries, electricity | Assets ↓, Owner\'s equity ↓ (expense) |\n| **Cash payment — to creditor** | Business pays a supplier | Assets ↓, Liabilities ↓ |\n\n### Subsidiary Journals\n\nTransactions are recorded in special books called **subsidiary journals**:\n- **Cash Receipts Journal (CRJ)** — records all money received\n- **Cash Payments Journal (CPJ)** — records all money paid out\n\nThese journals organise transactions by type, making record-keeping easier.'),
  fb(8, 'The Cash Receipts Journal records all money ___. The Cash Payments Journal records all money ___.',
    ['received', 'paid out'],
    'CRJ = money coming in. CPJ = money going out. Together they record all cash transactions of the business.'),
  q(9, 'When a business pays rent of R3 000, the effect on the accounting equation is:',
    ['Assets decrease and owner\'s equity decreases', 'Assets increase and liabilities increase', 'Assets decrease and liabilities decrease', 'Owner\'s equity increases and liabilities decrease'], 0,
    'Paying rent reduces cash (asset decreases) and is an expense (owner\'s equity decreases). The equation stays balanced.'),
  t(10, '### The Double-Entry Principle\n\nThe **double-entry principle** means that every transaction is recorded in at least **two** accounts — one debit and one credit of the same amount.\n\n**Rules for debits and credits:**\n\n| Account type | To increase | To decrease |\n|-------------|-------------|-------------|\n| **Assets** | Debit | Credit |\n| **Expenses** | Debit | Credit |\n| **Owner\'s equity** | Credit | Debit |\n| **Liabilities** | Credit | Debit |\n| **Income** | Credit | Debit |\n\n**Memory aid:**\n- **DEAD** = **D**ebit **E**xpenses, **A**ssets, **D**rawings\n- **CLIO** = **C**redit **L**iabilities, **I**ncome, **O**wner\'s equity\n\n**Example:** Business receives R2 000 cash from a customer for services:\n- Debit: Bank R2 000 (asset increases)\n- Credit: Service fees R2 000 (income increases)'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Financial Literacy — Source Documents (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Source Documents ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Source Documents\n\nA **source document** is the original document that provides proof that a financial transaction took place. Without source documents, no entry can be made in the accounting records.\n\n### Common Source Documents\n\n| Document | Purpose | Who issues it |\n|----------|---------|---------------|\n| **Receipt** | Proof that cash was received | The business receiving money |\n| **Deposit slip** | Proof that money was deposited into a bank account | The person making the deposit |\n| **Cash register slip (till slip)** | Proof of a cash sale | The business (from the cash register) |\n| **Cash invoice** | Record of a cash purchase or sale | The seller |\n| **Electronic Funds Transfer (EFT)** | Proof of an electronic payment | The bank |\n| **Bank statement** | Summary of all transactions in a bank account | The bank |'),
  t(2, '### Details on Key Source Documents\n\n**The Receipt**\nA receipt is issued when cash is received by the business. It contains:\n- Receipt number\n- Date\n- Name of the person who paid\n- Amount in words and figures\n- Reason for payment\n- Signature of the person receiving the money\n\n**The Deposit Slip**\nA deposit slip is completed when money is deposited at the bank. It contains:\n- Account holder\'s name and account number\n- Date of deposit\n- Amount deposited (cash and/or cheques)\n- Branch name\n\n**The Cash Register Slip (Till Slip)**\nIssued automatically when a sale is made. It shows:\n- Name of the business\n- Date and time\n- Items purchased with prices\n- Total amount\n- VAT amount\n- Payment method (cash, card)\n\n**The EFT Notification**\nAn electronic proof of payment showing:\n- Sender and recipient details\n- Amount transferred\n- Date and reference number\n- Bank details'),
  q(3, 'Which source document proves that money was deposited into a bank account?',
    ['Deposit slip', 'Receipt', 'Invoice', 'Bank statement'], 0,
    'A deposit slip is completed when money is deposited at the bank. It serves as proof of the deposit.'),
  fb(4, 'A receipt is issued when ___ is received. A till slip is issued automatically by the ___.',
    ['cash', 'cash register'],
    'Receipts prove cash was received by the business. Till slips are printed by the cash register when a sale is made.'),
  t(5, '### The Bank Statement\n\nA **bank statement** is a document issued by the bank that shows all transactions in a bank account for a specific period.\n\n**Information on a bank statement:**\n- Account holder\'s name and account number\n- Opening balance (at the start of the period)\n- All deposits (money in)\n- All withdrawals and payments (money out)\n- Bank charges and fees\n- Interest earned or charged\n- Closing balance (at the end of the period)\n\n**Example of a simplified bank statement:**\n\n| Date | Description | Deposits | Withdrawals | Balance |\n|------|-----------|----------|-------------|--------|\n| 1 Mar | Opening balance | | | 5 000 |\n| 3 Mar | Deposit — cash sales | 3 500 | | 8 500 |\n| 7 Mar | EFT — Rent paid | | 2 500 | 6 000 |\n| 15 Mar | EFT — Salary received | 8 000 | | 14 000 |\n| 25 Mar | Debit order — electricity | | 1 200 | 12 800 |\n| 31 Mar | Bank charges | | 150 | 12 650 |\n\n**Important:** Bank charges (fees the bank charges for its services) and interest appear on the bank statement. These must also be recorded in the business\'s accounting records.'),
  q(6, 'Bank charges that appear on the bank statement are recorded in the business\'s books as:',
    ['An expense (reduces owner\'s equity)', 'Income (increases owner\'s equity)', 'A liability (the business owes the bank)', 'They do not need to be recorded'], 0,
    'Bank charges are a cost of using banking services. They are an expense and must be recorded in the Cash Payments Journal.'),
  t(7, '### Why Source Documents Are Important\n\n1. **Proof of transaction:** They prove that a transaction actually happened\n2. **Accuracy:** They provide the correct amounts, dates, and details for recording\n3. **Legal requirement:** SARS requires businesses to keep financial records for at least **5 years**\n4. **Auditing:** Auditors check source documents to verify that records are correct\n5. **Dispute resolution:** If there is a disagreement with a customer or supplier, the source document provides evidence\n\n### The Accounting Cycle (Overview)\n\nSource documents are the starting point of the **accounting cycle**:\n\n1. **Transaction occurs** → source document is created\n2. **Record** the transaction in the correct **journal** (CRJ or CPJ)\n3. **Post** from the journal to the **ledger**\n4. **Prepare** a **trial balance**\n\nAt Grade 8 level, we focus on the Cash Receipts Journal (CRJ) and Cash Payments Journal (CPJ) for a **service business** (a business that earns income by providing services, not selling goods).'),
  fb(8, 'SARS requires businesses to keep financial records for at least ___ years. Source documents are the starting point of the ___ cycle.',
    ['5', 'accounting'],
    'By law, businesses must keep records for 5 years for SARS. The accounting cycle begins with source documents as proof of transactions.'),
  q(9, 'Which of the following is NOT a source document?',
    ['The trial balance', 'A receipt', 'A deposit slip', 'An EFT notification'], 0,
    'A trial balance is a summary of ledger balances — it is not a source document. Source documents are original proof of transactions (receipts, deposit slips, EFTs).'),
  t(10, '### Linking Source Documents to Journals\n\nEach source document tells you which journal to use:\n\n| Source document | Transaction | Journal |\n|----------------|-------------|--------|\n| Receipt / Till slip | Cash received from a customer | Cash Receipts Journal (CRJ) |\n| Deposit slip | Money deposited in the bank | Cash Receipts Journal (CRJ) |\n| EFT proof (payment made) | Business pays a bill | Cash Payments Journal (CPJ) |\n| Bank statement — bank charges | Bank deducts fees | Cash Payments Journal (CPJ) |\n| Bank statement — interest received | Bank pays interest | Cash Receipts Journal (CRJ) |\n\n**Key rule:** If money is **coming in** → CRJ. If money is **going out** → CPJ.\n\n**Tip:** Always look at the source document first to determine:\n1. What type of transaction is it?\n2. Is money coming in or going out?\n3. Which journal should be used?'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Financial Literacy — The Accounting Cycle and the Accounting
//            Equation (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Overview of the Accounting Cycle ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Overview of the Accounting Cycle\n\nThe **accounting cycle** is a step-by-step process that businesses follow to record, organise, and report their financial information. It is repeated every month or every financial year.\n\n### Steps of the Accounting Cycle\n\n| Step | Action | Tool/Document |\n|------|--------|---------------|\n| 1 | A transaction occurs | Source document (receipt, EFT, deposit slip) |\n| 2 | Record the transaction | Subsidiary journal (CRJ or CPJ) |\n| 3 | Post to the ledger | General ledger (T-accounts) |\n| 4 | Prepare a trial balance | Trial balance |\n| 5 | Prepare financial statements | Income statement, Balance sheet |\n\n### Key Terms\n\n| Term | Definition |\n|------|----------|\n| **Source document** | Original proof of a transaction |\n| **Subsidiary journal** | Book of first entry — CRJ and CPJ |\n| **General ledger** | Book of final entry — all T-accounts |\n| **Trial balance** | List of all ledger balances to check accuracy |\n| **Income statement** | Shows profit or loss for a period |\n| **Balance sheet** | Shows assets, liabilities, and equity at a date |'),
  t(2, '### Service Business vs Trading Business\n\nAt Grade 8, we focus on a **service business**.\n\n| Feature | Service business | Trading business |\n|---------|-----------------|------------------|\n| **Income source** | Fees for services | Sales of goods |\n| **Main income account** | Fee income / Service fees | Sales |\n| **Trading stock** | No (or very little) | Yes — buys and sells goods |\n| **Cost of sales** | No | Yes |\n| **Gross profit** | No | Yes |\n\n**Examples of service businesses in South Africa:**\n- Hair salons\n- Plumbing and electrical repair\n- Tutoring services\n- Law firms and accounting firms\n- IT support companies\n- Medical practices\n\n**A sole trader** is the simplest form of business. One person owns and runs the business. The owner has **unlimited liability**, meaning their personal assets can be used to pay business debts.'),
  q(3, 'A service business earns its income mainly from:',
    ['Providing services to customers', 'Buying and selling goods', 'Manufacturing products in a factory', 'Importing goods from other countries'], 0,
    'Service businesses earn fee income by providing services, not by selling physical goods.'),
  fb(4, 'The journal is called the book of ___ entry. The ledger is called the book of ___ entry.',
    ['first', 'final'],
    'Transactions are first recorded in journals (book of first entry), then posted to the ledger (book of final entry).'),
  t(5, '### Cash Transactions and the Accounting Equation\n\nA **cash transaction** is any transaction where money is received or paid immediately — either by cash, cheque, or EFT.\n\nEvery cash transaction affects the accounting equation:\n\n$$\\text{Assets} = \\text{Owner\'s Equity} + \\text{Liabilities}$$\n\n**Example transactions for Nomsa\'s Salon (service business):**\n\n| Transaction | Assets | Owner\'s Equity | Liabilities |\n|------------|--------|---------------|-------------|\n| Nomsa invests R20 000 cash | Cash ↑ R20 000 | Capital ↑ R20 000 | — |\n| Buys equipment for R5 000 cash | Cash ↓ R5 000, Equipment ↑ R5 000 | — | — |\n| Earns R3 000 for hair styling | Cash ↑ R3 000 | Fee income ↑ R3 000 | — |\n| Pays R1 500 rent | Cash ↓ R1 500 | Rent expense ↑ (OE ↓) R1 500 | — |\n| Takes a R8 000 bank loan | Cash ↑ R8 000 | — | Bank loan ↑ R8 000 |\n| Pays creditor R2 000 | Cash ↓ R2 000 | — | Creditors ↓ R2 000 |'),
  q(6, 'Nomsa receives R3 000 cash for hair styling services. Which part of the accounting equation is affected?',
    ['Assets increase (cash) and owner\'s equity increases (income)', 'Assets increase and liabilities increase', 'Assets decrease and owner\'s equity decreases', 'Only assets change — equity stays the same'], 0,
    'Earning income increases cash (asset) and increases owner\'s equity (fee income). Both sides of the equation go up equally.'),
  t(7, '### Understanding Debit and Credit in Practice\n\nThe **double-entry principle** means every transaction has TWO entries — a debit and a credit.\n\n**For a service business, common transactions are:**\n\n| Transaction | Debit (left) | Credit (right) |\n|------------|-------------|----------------|\n| Owner invests capital | Bank | Capital |\n| Buy equipment for cash | Equipment | Bank |\n| Receive fees from customer | Bank | Fee income |\n| Pay rent | Rent expense | Bank |\n| Pay salaries | Salaries expense | Bank |\n| Pay electricity | Electricity expense | Bank |\n| Receive interest from bank | Bank | Interest received |\n| Pay bank charges | Bank charges | Bank |\n\n**Notice the pattern:**\n- When money comes IN: **Debit Bank**, Credit the source (income or debtor)\n- When money goes OUT: **Credit Bank**, Debit the destination (expense or asset)'),
  fb(8, 'When a business receives cash, the Bank account is ___. When a business pays cash, the Bank account is ___.',
    ['debited', 'credited'],
    'Money in = debit to Bank (asset increases). Money out = credit to Bank (asset decreases).'),
  q(9, 'The owner withdraws R1 000 cash from the business for personal use. This is called:',
    ['Drawings', 'Expenses', 'Income', 'Capital'], 0,
    'When the owner takes money from the business for personal use, it is called drawings. Drawings reduce owner\'s equity but are NOT a business expense.'),
  t(10, '### Drawings and Capital\n\n**Capital** is the money or assets the owner **puts into** the business.\n**Drawings** is the money or assets the owner **takes out** of the business for personal use.\n\n| | Capital | Drawings |\n|---|---------|----------|\n| Direction | Owner → Business | Business → Owner |\n| Effect on equity | Increases | Decreases |\n| Is it an expense? | No | No |\n\n**Important:** Drawings are NOT a business expense. They are a reduction in the owner\'s investment.\n\n**Calculating the owner\'s equity at year-end:**\n\n$$\\text{Closing capital} = \\text{Opening capital} + \\text{Net profit} - \\text{Drawings}$$\n\n**Example:**\n- Opening capital: R20 000\n- Net profit for the year: R15 000\n- Drawings during the year: R6 000\n- Closing capital: R20 000 + R15 000 − R6 000 = **R29 000**'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Financial Literacy — Cash Receipts Journal (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The CRJ of a Service Business ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## The Cash Receipts Journal (CRJ) of a Service Business\n\nThe **Cash Receipts Journal (CRJ)** records all money received by the business, whether by cash, cheque, or EFT.\n\n### Format of the CRJ for a Service Business\n\n| Doc | Day | Details | Fol | Analysis of Receipts | Bank | Fee Income | Sundry Accounts |\n|-----|-----|---------|-----|---------------------|------|-----------|----------------|\n| Rec 01 | 3 | Services rendered | | | 2 500 | 2 500 | |\n| Rec 02 | 8 | Services rendered | | | 1 800 | 1 800 | |\n| Rec 03 | 15 | Rent income | | | 1 000 | | Rent income 1 000 |\n| Rec 04 | 22 | Services rendered | | | 3 200 | 3 200 | |\n| BS | 28 | Interest received | | | 250 | | Interest received 250 |\n| | | **Totals** | | | **8 750** | **7 500** | **1 250** |\n\n### Column Explanations\n\n| Column | What goes here |\n|--------|----------------|\n| **Doc** | The source document number (receipt number, bank statement) |\n| **Day** | The date of the transaction |\n| **Details** | A short description |\n| **Fol** | Folio number (reference to the ledger) |\n| **Bank** | Total amount received (always filled in) |\n| **Fee Income** | Cash received for services rendered |\n| **Sundry Accounts** | Any other receipts — with a description |'),
  t(2, '### Recording Entries in the CRJ\n\n**Step 1:** Identify the source document (receipt, deposit slip, bank statement).\n\n**Step 2:** Ask: "Is money coming INTO the business?" If yes, use the CRJ.\n\n**Step 3:** Determine what type of receipt it is:\n- Cash received for services → **Fee Income** column\n- Any other receipt → **Sundry Accounts** column (with a description)\n\n**Step 4:** Record the total amount in the **Bank** column.\n\n**Examples of sundry receipts:**\n- Rent income received (if the business rents out part of its premises)\n- Interest received from the bank\n- Owner contributing additional capital\n- Commission income\n\n**Important rules:**\n- Every entry must have a source document number\n- Every entry appears in the Bank column AND one other column\n- At month-end: **Bank total = Fee Income total + Sundry total**\n- The CRJ is closed off (totalled) at the end of each month'),
  q(3, 'A plumber receives R4 500 cash for fixing a burst pipe. In which CRJ columns is this recorded?',
    ['Bank column and Fee Income column', 'Bank column and Sundry Accounts column', 'Fee Income column only', 'Bank column only'], 0,
    'Cash received for services goes in both the Bank column (total money in) and the Fee Income column (type of receipt).'),
  fb(4, 'In the CRJ, fees earned for services go in the ___ column. Other receipts go in the ___ column.',
    ['Fee Income', 'Sundry Accounts'],
    'Fee Income records the main service revenue. Sundry Accounts captures anything else (rent income, interest, additional capital).'),
  t(5, '### Worked Example: CRJ for March 2026\n\n**Thabo\'s IT Services** — Receipts for March 2026:\n\n1. 2 March: Received R3 500 for computer repairs (receipt 101)\n2. 8 March: Received R2 000 for network setup (receipt 102)\n3. 12 March: Rent income received R1 500 (receipt 103)\n4. 18 March: Received R4 200 for software installation (receipt 104)\n5. 25 March: Received R2 800 for computer repairs (receipt 105)\n6. 31 March: Interest received from bank R350 (bank statement)\n\n### Solution:\n\n| Doc | Day | Details | Bank | Fee Income | Sundry |\n|-----|-----|---------|------|-----------|--------|\n| Rec 101 | 2 | Computer repairs | 3 500 | 3 500 | |\n| Rec 102 | 8 | Network setup | 2 000 | 2 000 | |\n| Rec 103 | 12 | Rent income | 1 500 | | Rent income 1 500 |\n| Rec 104 | 18 | Software installation | 4 200 | 4 200 | |\n| Rec 105 | 25 | Computer repairs | 2 800 | 2 800 | |\n| BS | 31 | Interest received | 350 | | Interest received 350 |\n| | | **Totals** | **14 350** | **12 500** | **1 850** |\n\n**Cross-check:** R12 500 + R1 850 = R14 350 ✓'),
  q(6, 'In the worked example, why is rent income recorded in the Sundry column and not the Fee Income column?',
    ['Because rent income is not the business\'s main service — it is other income', 'Because rent income is not real income', 'Because it was received by EFT', 'Because it is less than R2 000'], 0,
    'Fee Income is for the business\'s main service (IT repairs). Rent income is a different type of income, so it goes in Sundry.'),
  t(7, '### Closing Off the CRJ\n\nAt the end of each month, the CRJ must be **closed off** (finalised):\n\n1. **Draw a line** under the last entry\n2. **Total** each column\n3. **Cross-check:** Bank total = Fee Income + Sundry totals\n4. **Double-rule** under the totals\n\n### The Effect of CRJ Transactions on the Accounting Equation\n\nEvery CRJ entry affects the accounting equation:\n\n| CRJ Transaction | Assets | Owner\'s Equity |\n|----------------|--------|---------------|\n| Fee income received | Bank ↑ | Fee income ↑ (OE ↑) |\n| Rent income received | Bank ↑ | Rent income ↑ (OE ↑) |\n| Interest received | Bank ↑ | Interest received ↑ (OE ↑) |\n| Owner adds capital | Bank ↑ | Capital ↑ (OE ↑) |\n\n**Key insight:** All CRJ transactions increase the Bank account (asset). They also increase some form of income or capital (owner\'s equity).'),
  fb(8, 'At month-end, the CRJ Bank total must equal the sum of the ___ and Sundry columns. All CRJ entries increase the ___ account.',
    ['Fee Income', 'Bank'],
    'Bank = Fee Income + Sundry (cross-check). Every CRJ entry records money coming in, which increases the Bank account.'),
  q(9, 'The CRJ Bank total is R15 000, Fee Income total is R11 500, and Sundry total is R3 000. What can we conclude?',
    ['There is an error because R11 500 + R3 000 ≠ R15 000', 'The CRJ is correct', 'The extra R500 is profit', 'The Sundry column should be R3 500'], 0,
    'R11 500 + R3 000 = R14 500, not R15 000. The R500 difference means there is an error that must be found and corrected.'),
  t(10, '### Posting from the CRJ to the Ledger\n\nAt month-end, the CRJ totals are **posted** (transferred) to the general ledger:\n\n| CRJ Column | Posted to Ledger Account | Debit or Credit |\n|-----------|------------------------|----------------|\n| Bank total | Bank account | **Debit** (asset increases) |\n| Fee Income total | Fee Income account | **Credit** (income increases) |\n| Each sundry item | The specific account named | **Credit** |\n\n**Example posting from our CRJ:**\n\n**Bank Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CRJ (March) | 14 350 | | |\n\n**Fee Income Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ (March) | 12 500 |\n\n**Rent Income Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ (March) | 1 500 |\n\n**Interest Received Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ (March) | 350 |\n\n**Remember:** Bank is debited because money is coming IN. Income accounts are credited because income increases on the credit side.'),
];

// --- Lesson 2: More CRJ Practice and the Accounting Equation ---
blockNum = 0;
const ch6_lesson2 = [
  t(1, '## CRJ Practice: Linking the CRJ to the Accounting Equation\n\nEvery entry in the CRJ has a direct effect on the accounting equation. Let us trace how each transaction changes the equation.\n\n### Opening Balances\n\n**Thabo\'s IT Services — 1 March 2026**\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Bank: R10 000 | = | Capital: R25 000 | + | Creditors: R3 000 |\n| Equipment: R15 000 | | | | |\n| Supplies: R3 000 | | | | |\n| **Total: R28 000** | = | **R25 000** | + | **R3 000** |\n\n### After Recording the CRJ for March\n\nFrom the CRJ worked example, total receipts were R14 350:\n- Fee income: R12 500 (increases owner\'s equity)\n- Rent income: R1 500 (increases owner\'s equity)\n- Interest received: R350 (increases owner\'s equity)\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Bank: R24 350 | = | Capital: R25 000 | + | Creditors: R3 000 |\n| Equipment: R15 000 | | Fee income: R12 500 | | |\n| Supplies: R3 000 | | Rent income: R1 500 | | |\n| | | Interest received: R350 | | |\n| **Total: R42 350** | = | **R39 350** | + | **R3 000** |\n\n**Check:** R42 350 = R39 350 + R3 000 ✓'),
  t(2, '### Practice Exercise: Recording in the CRJ\n\n**Sipho\'s Cleaning Services** — Transactions for April 2026:\n\n1. 3 April: Received R2 800 for office cleaning (receipt 201)\n2. 7 April: Received R1 500 for carpet cleaning (receipt 202)\n3. 14 April: Owner added R5 000 additional capital (receipt 203)\n4. 20 April: Received R3 200 for office cleaning (receipt 204)\n5. 25 April: Received R1 000 for window cleaning (receipt 205)\n6. 30 April: Interest received from FNB R180 (bank statement)\n\n### Solution:\n\n| Doc | Day | Details | Bank | Fee Income | Sundry |\n|-----|-----|---------|------|-----------|--------|\n| Rec 201 | 3 | Office cleaning | 2 800 | 2 800 | |\n| Rec 202 | 7 | Carpet cleaning | 1 500 | 1 500 | |\n| Rec 203 | 14 | Additional capital | 5 000 | | Capital 5 000 |\n| Rec 204 | 20 | Office cleaning | 3 200 | 3 200 | |\n| Rec 205 | 25 | Window cleaning | 1 000 | 1 000 | |\n| BS | 30 | Interest received | 180 | | Interest received 180 |\n| | | **Totals** | **13 680** | **8 500** | **5 180** |\n\n**Cross-check:** R8 500 + R5 180 = R13 680 ✓'),
  q(3, 'When the owner adds R5 000 additional capital, in which CRJ column is this recorded?',
    ['Sundry Accounts column (as Capital)', 'Fee Income column', 'It is not recorded in the CRJ', 'A separate journal is used'], 0,
    'Additional capital from the owner is cash coming in, so it goes in the CRJ. It is not fee income, so it goes in the Sundry column labelled "Capital".'),
  fb(4, 'When the owner contributes additional capital, it is recorded in the ___ column of the CRJ. This increases both assets and ___.',
    ['Sundry', 'owner\'s equity'],
    'Additional capital goes in Sundry (labelled Capital). It increases Bank (asset) and Capital (owner\'s equity).'),
  t(5, '### Common Mistakes When Recording the CRJ\n\n**Mistakes to avoid:**\n\n| Mistake | Why it is wrong |\n|---------|----------------|\n| Forgetting to write the source document number | Every entry must have a reference |\n| Recording cash payments in the CRJ | The CRJ is only for money RECEIVED — payments go in the CPJ |\n| Not including the Bank column entry | Every receipt must appear in the Bank column |\n| Recording fees in the Sundry column | Fee income should go in the Fee Income column, not Sundry |\n| Not totalling at month-end | The CRJ must be closed off and totalled |\n| Incorrect cross-check | Bank ≠ Fee Income + Sundry means there is an error |\n\n**Test tip:** When completing a CRJ in a test:\n1. Read each transaction carefully\n2. Ask: "Is money coming IN?" — If yes, use CRJ\n3. Ask: "Is it for the main service?" — If yes, Fee Income column\n4. If not the main service → Sundry column with a description\n5. Always fill in the Bank column\n6. Cross-check your totals'),
  q(6, 'A business pays R2 000 rent by EFT. Should this be recorded in the CRJ?',
    ['No — it should be recorded in the CPJ because money is going out', 'Yes — in the Bank and Sundry columns', 'Yes — in the Fee Income column', 'No — rent is not recorded in any journal'], 0,
    'The CRJ records only money RECEIVED. Paying rent is money going OUT, so it belongs in the Cash Payments Journal (CPJ).'),
  t(7, '### Understanding the Folio Column\n\nThe **Fol (Folio)** column in the CRJ contains reference numbers that link journal entries to ledger accounts.\n\n**How folio references work:**\n\n| Column | Folio reference | Meaning |\n|--------|----------------|--------|\n| Bank | B1 | Bank account (ledger page 1) |\n| Fee Income | N1 | Fee Income account (N for Nominal/income) |\n| Sundry — Rent income | N2 | Rent Income account |\n| Sundry — Interest received | N3 | Interest Received account |\n| Sundry — Capital | B2 | Capital account (Balance sheet item) |\n\n**Purpose of folio references:**\n- They create a **trail** from journal to ledger and back\n- If you find an error, you can trace it using folio numbers\n- They confirm that entries have been posted to the ledger\n\n**When are folio numbers filled in?**\n- In the **journal**: when you POST the entry to the ledger\n- In the **ledger**: when you record where the entry came from (CRJ, CPJ)'),
  fb(8, 'The Folio column links entries in the ___ to accounts in the ___. Folio numbers are filled in when entries are ___.',
    ['journal', 'ledger', 'posted'],
    'Folio references connect journal entries to ledger accounts. They are written in when posting (transferring) entries from journal to ledger.'),
  q(9, 'The CRJ for May shows: Bank R20 000, Fee Income R16 000, Sundry R4 000. The Bank account in the ledger should be debited with:',
    ['R20 000', 'R16 000', 'R4 000', 'R36 000'], 0,
    'The Bank column total (R20 000) is posted to the debit side of the Bank account. This represents the total cash received during May.'),
  t(10, '### Summary: The CRJ Flow\n\n```\nTransaction occurs → Source document created → Record in CRJ → Post to Ledger\n```\n\n**What we learned about the CRJ:**\n\n1. The CRJ records **all money received** by the business\n2. For a service business, the main income column is **Fee Income**\n3. Other receipts go in the **Sundry** column with a description\n4. The **Bank** column total = Fee Income + Sundry totals\n5. At month-end, CRJ totals are **posted** to the general ledger\n6. The Bank account is **debited** (money in)\n7. Income accounts are **credited**\n8. Every entry must have a **source document** reference\n\n**In the next chapter, we will learn about the Cash Payments Journal (CPJ) — the mirror image of the CRJ, recording all money paid out by the business.**'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Entrepreneurship — Factors of Production (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Factors of Production ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Factors of Production\n\nTo produce goods and services, a business needs **resources**. These resources are called **factors of production**.\n\n### The Four Factors of Production\n\n| Factor | Description | Reward |\n|--------|-----------|--------|\n| **Natural resources (Land)** | All gifts of nature — land, water, minerals, sunlight, climate | **Rent** |\n| **Labour (Human resources)** | Physical and mental effort of workers | **Wages / Salaries** |\n| **Capital** | Money, machines, equipment, and tools used to produce | **Interest** |\n| **Entrepreneurship** | The ability to combine the other three factors, take risks, and start a business | **Profit** |\n\n### Types of Capital\n\nDo not confuse the factor of production "capital" with financial capital:\n\n| Type | Description | Examples |\n|------|-----------|----------|\n| **Fixed capital** | Long-lasting equipment and buildings | Factory machines, delivery trucks, computers |\n| **Working capital** | Money used for day-to-day running of the business | Cash for buying stock, paying wages |\n| **Financial capital** | Money invested in the business | Owner\'s capital, bank loans |'),
  t(2, '### Types of Labour\n\n| Type | Description | Examples | Typical reward |\n|------|-----------|----------|---------------|\n| **Unskilled labour** | No formal training or qualifications needed | Cleaner, farm worker, car guard | Low wages |\n| **Semi-skilled labour** | Some training or experience needed | Machine operator, driver, cashier | Moderate wages |\n| **Skilled labour** | Formal qualifications and expertise | Doctor, engineer, teacher, accountant | High salaries |\n\n### The Role of Workers in a Business\n\nWorkers are essential to every business because they:\n- Provide the physical and mental effort to produce goods and services\n- Bring skills, knowledge, and experience\n- Interact with customers\n- Operate machinery and technology\n\n### Fair Employment Practices\n\nSouth African law requires businesses to treat workers fairly:\n- Pay at least the **National Minimum Wage** (currently R27.58 per hour)\n- Follow the **Basic Conditions of Employment Act** (BCEA) — maximum 45 hours/week\n- Not discriminate based on race, gender, age, or disability\n- Provide a safe working environment\n- Give workers their legal leave entitlements'),
  q(3, 'A factory machine operator who has completed a short training course is classified as:',
    ['Semi-skilled labour', 'Unskilled labour', 'Skilled labour', 'Entrepreneurship'], 0,
    'A machine operator has some training but not formal professional qualifications, making them semi-skilled labour.'),
  fb(4, 'The reward for natural resources is ___. The reward for labour is ___.',
    ['rent', 'wages'],
    'Rent is the reward for land/natural resources. Wages or salaries are the reward for labour.'),
  t(5, '### Natural Resources in South Africa\n\nSouth Africa is rich in **natural resources**, which are vital for the economy.\n\n**Mineral resources:**\n- Gold (Gauteng, Free State)\n- Platinum (Limpopo, North West)\n- Coal (Mpumalanga)\n- Iron ore (Northern Cape)\n- Diamonds (Northern Cape, Free State)\n- Manganese (Northern Cape)\n- Chrome (Limpopo, North West)\n\n**Agricultural resources:**\n- Maize (Free State, Mpumalanga)\n- Sugar cane (KwaZulu-Natal)\n- Citrus fruits (Limpopo, Eastern Cape)\n- Wine grapes (Western Cape)\n\n**Challenges related to natural resources:**\n- Mining causes environmental damage\n- Resources are non-renewable — once extracted, they are gone\n- Water scarcity is increasing\n- Climate change affects agriculture\n\n**Sustainability:** South Africa must use its natural resources responsibly to ensure they are available for future generations.'),
  q(6, 'South Africa\'s mining industry is located mainly in which provinces?',
    ['Gauteng, Limpopo, North West, and Mpumalanga', 'Western Cape and Eastern Cape', 'KwaZulu-Natal only', 'All provinces equally'], 0,
    'Mining is concentrated in Gauteng (gold), Limpopo and North West (platinum, chrome), and Mpumalanga (coal).'),
  t(7, '### Remuneration of Factors of Production\n\n**Remuneration** means the reward or payment received for providing a factor of production.\n\n| Factor | Remuneration | Explanation |\n|--------|-------------|------------|\n| **Land/Natural resources** | **Rent** | Payment for the use of land or natural resources |\n| **Labour** | **Wages/Salaries** | Payment for work done — wages (hourly/daily) or salaries (monthly) |\n| **Capital** | **Interest** | Payment for the use of money or equipment |\n| **Entrepreneurship** | **Profit** | The surplus after all costs are paid — reward for risk-taking |\n\n**Example: Sipho\'s Bakery**\n- Sipho rents a shop for R4 000/month → **rent** (payment for land)\n- He employs 3 workers at R3 500 each → **wages** (payment for labour)\n- He borrowed R50 000 from the bank at 12% interest → **interest** (payment for capital)\n- After paying all costs, he has R8 000 left → **profit** (reward for entrepreneurship)\n\n**Key insight:** All four factors must be combined for production to take place. Without any one of them, the business cannot operate.'),
  fb(8, 'The entrepreneur\'s reward is called ___. If the business does not earn enough to cover costs, the entrepreneur makes a ___.',
    ['profit', 'loss'],
    'Profit is the entrepreneur\'s reward for taking risks. If costs exceed income, the entrepreneur bears the loss.'),
  q(9, 'Which factor of production involves taking risks to start and run a business?',
    ['Entrepreneurship', 'Labour', 'Capital', 'Natural resources'], 0,
    'Entrepreneurship involves combining the other factors, taking financial risks, and making decisions to run the business.'),
  t(10, '### How the Factors of Production Work Together\n\n**Example: Building a house**\n\n| Factor | Role | Specific example |\n|--------|------|------------------|\n| **Natural resources** | Provide raw materials | Land to build on, water, sand, timber |\n| **Labour** | Do the physical and mental work | Builders, plumbers, electricians, architects |\n| **Capital** | Provide tools and finance | Cement mixers, cranes, bank loan for construction |\n| **Entrepreneurship** | Organise and manage the project | The construction company owner |\n\nWithout land, there is nowhere to build. Without labour, no one does the work. Without capital, there are no tools or funding. Without entrepreneurship, no one organises the project.\n\n**All four factors are interdependent** — they need each other to create value.\n\n### Connection to the Economy\n- When businesses use all four factors efficiently, they produce more goods and services\n- This creates **economic growth** and raises the **standard of living**\n- More businesses = more jobs = more income = more spending = more growth'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Entrepreneurship — Forms of Ownership (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Sole Traders and Partnerships ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Forms of Ownership\n\nWhen starting a business, one of the first decisions is the **form of ownership** — how the business will be legally structured. Each form has different rules about ownership, liability, and management.\n\n### Sole Trader (Sole Proprietorship)\n\nA **sole trader** is a business owned and managed by **one person**.\n\n| Feature | Detail |\n|---------|--------|\n| **Number of owners** | 1 |\n| **Liability** | Unlimited — the owner\'s personal assets can be used to pay debts |\n| **Legal personality** | No — the business and the owner are the same legal entity |\n| **Registration** | Not required by law (but must register for tax with SARS) |\n| **Decision-making** | Quick — the owner makes all decisions alone |\n| **Profit sharing** | Owner keeps all the profit (but also bears all the losses) |\n| **Continuity** | Ends when the owner dies or closes the business |\n\n**Advantages of a sole trader:**\n- Easy and cheap to start\n- Owner keeps all profits\n- Complete control over the business\n- Few legal requirements\n\n**Disadvantages of a sole trader:**\n- Unlimited liability (personal risk)\n- Limited capital (only the owner\'s money)\n- All the workload falls on one person\n- Business may end when the owner dies'),
  t(2, '### Partnership\n\nA **partnership** is a business owned by **two to twenty** people who agree to work together and share profits.\n\n| Feature | Detail |\n|---------|--------|\n| **Number of owners** | 2 to 20 partners |\n| **Liability** | Unlimited — each partner is personally liable for ALL business debts |\n| **Legal personality** | No — the partnership and partners are the same legal entity |\n| **Registration** | Not legally required but a **partnership agreement** is recommended |\n| **Decision-making** | Shared — partners make decisions together |\n| **Profit sharing** | According to the partnership agreement |\n| **Continuity** | May end when a partner dies, leaves, or if partners disagree |\n\n**The partnership agreement** should include:\n- Names and contributions of each partner\n- How profits (and losses) will be shared\n- Duties and responsibilities of each partner\n- What happens if a partner wants to leave\n- How disputes will be resolved\n\n**Advantages of a partnership:**\n- More capital available (from multiple partners)\n- Shared skills and workload\n- Better decision-making (more perspectives)\n\n**Disadvantages of a partnership:**\n- Unlimited liability for ALL partners\n- Disagreements between partners can harm the business\n- Profits must be shared\n- Each partner can bind the other partners to contracts'),
  q(3, 'A key disadvantage of both a sole trader and a partnership is:',
    ['Unlimited liability', 'Too many shareholders', 'Difficulty getting a tax number', 'Having a board of directors'], 0,
    'Both sole traders and partnerships have unlimited liability — the owners\' personal assets are at risk to pay business debts.'),
  fb(4, 'A sole trader is owned by ___ person. A partnership can have between 2 and ___ partners.',
    ['one', '20'],
    'A sole trader has one owner. A partnership has 2 to 20 partners who share the business.'),
  t(5, '### Comparison: Sole Trader vs Partnership\n\n| Feature | Sole Trader | Partnership |\n|---------|------------|------------|\n| Number of owners | 1 | 2–20 |\n| Liability | Unlimited | Unlimited |\n| Legal personality | No | No |\n| Capital available | Limited (one person) | More (multiple partners) |\n| Decision-making | Fast (one person decides) | Slower (partners must agree) |\n| Profit sharing | Keeps all profit | Shared among partners |\n| Continuity | Ends with owner | May end if partner leaves |\n| Skills available | One person\'s skills | Multiple skills combined |\n| Risk | Owner bears all risk | Risk shared among partners |\n\n**When to choose a sole trader:**\n- You want full control\n- The business is small and simple\n- You have enough capital on your own\n\n**When to choose a partnership:**\n- You need more capital\n- You need different skills (e.g. a doctor and an accountant starting a medical practice)\n- You want to share the workload and risk'),
  q(6, 'Why is a partnership agreement important?',
    ['It sets out the rules for profit sharing, duties, and dispute resolution', 'It is required by law for all partnerships', 'It gives the partnership limited liability', 'It allows the partnership to have more than 20 partners'], 0,
    'A partnership agreement prevents disputes by clearly stating how profits are shared, what each partner does, and how to resolve disagreements.'),
  t(7, '### Examples of Sole Traders and Partnerships in South Africa\n\n**Common sole trader businesses:**\n- Spaza shops\n- Street vendors\n- Freelance graphic designers\n- Independent plumbers and electricians\n- Small-scale farmers\n- Home-based bakers\n\n**Common partnerships:**\n- Law firms (attorneys often work in partnerships)\n- Medical practices (doctors sharing a practice)\n- Accounting firms\n- Architecture firms\n\n**Real-world example:**\nTwo friends, Lerato (a hairstylist) and Mpho (a beautician), decide to open a salon together. They each contribute R15 000 in capital and agree to share profits equally. They write a partnership agreement that says:\n- Lerato handles hairstyling and walk-in clients\n- Mpho handles beauty treatments and bookings\n- Both partners must agree on any purchase over R5 000\n- Profits are split 50/50 at the end of each month'),
  fb(8, 'Unlimited liability means the owner\'s ___ assets can be used to pay business debts. A business with separate legal personality is treated as a different ___ from its owners.',
    ['personal', 'entity'],
    'Unlimited liability puts personal assets at risk. Separate legal personality means the business is a different legal person from its owners.'),
  q(9, 'In a partnership, if one partner signs a contract, the other partners are:',
    ['Also bound by that contract', 'Not affected at all', 'Only affected if they agreed', 'Protected by limited liability'], 0,
    'In a partnership, each partner can bind the other partners to contracts. This is called mutual agency and is a significant risk.'),
  t(10, '### The Role of Forms of Ownership in Job Creation\n\nDifferent forms of ownership contribute to job creation in South Africa:\n\n**Sole traders:**\n- Often self-employment (the owner creates a job for themselves)\n- May employ 1-5 workers\n- Important in the informal sector (spaza shops, street vendors)\n- Over 2 million South Africans are self-employed sole traders\n\n**Partnerships:**\n- Typically employ more people than sole traders\n- Common in professional services (law, medicine, accounting)\n- Create skilled employment opportunities\n\n**Key message:** All forms of ownership contribute to job creation and economic growth. Even a small sole trader who employs one helper is reducing unemployment. SMMEs (Small, Medium, and Micro Enterprises) create the majority of new jobs in South Africa.\n\n**Sustainable use of natural resources:**\nEvery business must consider its impact on the environment. A sole trader or partnership that uses resources wastefully harms future generations. Sustainable business practices include recycling, saving energy, and reducing waste.'),
];

// --- Lesson 2: Companies ---
blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Companies (Private and Public)\n\nA **company** is a more complex form of business ownership. It is a separate legal entity from its owners.\n\n### Private Company — (Pty) Ltd\n\n| Feature | Detail |\n|---------|--------|\n| **Number of shareholders** | 1 or more (no maximum) |\n| **Liability** | **Limited** — shareholders can only lose the money they invested |\n| **Legal personality** | **Yes** — the company is a separate legal person |\n| **Registration** | Must register with **CIPC** (Companies and Intellectual Property Commission) |\n| **Shares** | Cannot be sold to the public — only offered privately |\n| **Abbreviation** | (Pty) Ltd — Proprietary Limited |\n\n**Advantages:**\n- Limited liability protects shareholders\' personal assets\n- Separate legal personality — can own property, sue, and be sued\n- Easier to raise capital (can add shareholders)\n- Continuity — the company continues even if a shareholder dies\n\n**Disadvantages:**\n- More expensive and complicated to set up\n- Must follow the Companies Act regulations\n- Must file annual returns with CIPC\n- More administrative requirements (meetings, records)'),
  t(2, '### Public Company — Ltd\n\nA **public company** (Ltd) is the largest form of business ownership. Its shares can be traded on the **Johannesburg Stock Exchange (JSE)**.\n\n| Feature | Detail |\n|---------|--------|\n| **Number of shareholders** | 1 or more (no maximum) |\n| **Liability** | **Limited** |\n| **Legal personality** | **Yes** |\n| **Registration** | Must register with CIPC |\n| **Shares** | Can be sold to the general public on the JSE |\n| **Abbreviation** | Ltd — Limited |\n\n**Examples of public companies listed on the JSE:**\n- Shoprite Holdings Ltd\n- MTN Group Ltd\n- Naspers Ltd\n- Sasol Ltd\n- Standard Bank Group Ltd\n- Woolworths Holdings Ltd\n\n**Key difference between private and public companies:**\n\n| | Private (Pty) Ltd | Public Ltd |\n|---|---|---|\n| Shares sold to | Selected individuals | General public |\n| Listed on JSE | No | Yes |\n| Financial reporting | Less strict | Must publish annual financial statements |\n| Minimum directors | 1 | 3 |\n| Company secretary | Not required | Required |'),
  q(3, 'Which form of ownership allows shares to be bought and sold on the JSE?',
    ['Public company (Ltd)', 'Private company (Pty) Ltd', 'Partnership', 'Sole trader'], 0,
    'Only public companies (Ltd) can list their shares on the Johannesburg Stock Exchange for public trading.'),
  fb(4, 'A private company uses the abbreviation (Pty) ___. Companies must register with ___ (Companies and Intellectual Property Commission).',
    ['Ltd', 'CIPC'],
    '(Pty) Ltd stands for Proprietary Limited. All companies must register with CIPC.'),
  t(5, '### Comparison of All Four Forms of Ownership\n\n| Feature | Sole Trader | Partnership | Private (Pty) Ltd | Public Ltd |\n|---------|------------|------------|-------------------|------------|\n| Owners | 1 | 2–20 | 1+ shareholders | 1+ shareholders |\n| Liability | Unlimited | Unlimited | Limited | Limited |\n| Legal personality | No | No | Yes | Yes |\n| Registration | Not required | Not required | CIPC | CIPC |\n| Shares on JSE | No | No | No | Yes |\n| Continuity | Ends with owner | May end | Continues | Continues |\n| Profit distribution | Owner keeps all | Shared by partners | Dividends to shareholders | Dividends to shareholders |\n\n**Which is best?** There is no single best form of ownership. The choice depends on:\n- How much capital is needed\n- How much risk the owner is willing to take\n- How many people are involved\n- How big the business is expected to grow\n- The legal requirements the owner can manage'),
  q(6, 'Limited liability means:',
    ['Shareholders can only lose the money they invested in the company', 'The business cannot make a loss', 'The owner has no financial risk at all', 'The company cannot borrow money'], 0,
    'Limited liability protects shareholders\' personal assets. They can only lose the amount they invested — not their house, car, or personal savings.'),
  t(7, '### The Role of Companies in the SA Economy\n\nCompanies are the backbone of the South African economy:\n\n**Job creation:**\n- Large companies like Shoprite employ over 140 000 people\n- Companies provide stable employment with benefits (medical aid, pension, leave)\n\n**Tax contribution:**\n- Companies pay company tax (currently 27% of profits)\n- They collect VAT on behalf of SARS\n- Employee taxes (PAYE) are deducted from salaries\n\n**Economic growth:**\n- Companies invest in infrastructure, technology, and research\n- They export goods and bring foreign currency into South Africa\n- They develop skills by training employees\n\n**Community development:**\n- Many companies have corporate social responsibility (CSR) programmes\n- They sponsor schools, sports teams, and community projects\n- B-BBEE (Broad-Based Black Economic Empowerment) encourages transformation'),
  fb(8, 'Companies pay company tax at a rate of ___% of profits. Broad-Based Black Economic Empowerment is abbreviated as ___.',
    ['27', 'B-BBEE'],
    'The company tax rate in South Africa is 27%. B-BBEE promotes economic transformation and inclusion.'),
  q(9, 'A Close Corporation (CC) can no longer be registered in South Africa because:',
    ['The Companies Act of 2008 replaced CCs with (Pty) Ltd companies', 'CCs were too profitable', 'Only public companies are allowed', 'CCs had too many members'], 0,
    'Since the Companies Act of 2008, new CCs cannot be registered. Existing CCs may continue, but new businesses must register as (Pty) Ltd.'),
  t(10, '### Choosing the Right Form of Ownership\n\n**Scenario 1:** Sipho wants to sell fruit from a stand at the taxi rank. He has R2 000 savings.\n→ **Sole trader** — simple, cheap, no registration needed, small scale.\n\n**Scenario 2:** Two accountants want to start an accounting firm together.\n→ **Partnership** — they can share skills, capital, and clients.\n\n**Scenario 3:** A family wants to start a restaurant and protect their personal assets.\n→ **Private company (Pty) Ltd** — limited liability, separate legal entity.\n\n**Scenario 4:** A successful tech company wants to raise R500 million from investors.\n→ **Public company (Ltd)** — can sell shares to the public on the JSE.\n\n**Key exam tip:** When a question asks you to recommend a form of ownership, always explain WHY that form is best for the specific situation. Mention liability, capital needs, number of owners, and the size of the business.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Financial Literacy — Cash Payments Journal (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The CPJ of a Service Business ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## The Cash Payments Journal (CPJ) of a Service Business\n\nThe **Cash Payments Journal (CPJ)** records all money paid out by the business, whether by cheque, EFT, or cash.\n\n### Format of the CPJ for a Service Business\n\nA service business does not buy trading stock, so there is no Trading Stock column. Instead, there may be a **Consumable Supplies** column for items used in providing services.\n\n| Doc | Day | Details | Fol | Bank | Salaries/Wages | Sundry Accounts |\n|-----|-----|---------|-----|------|---------------|----------------|\n| EFT | 3 | Rent paid | | 3 000 | | Rent expense 3 000 |\n| EFT | 10 | Staff salaries | | 5 500 | 5 500 | |\n| Ch 01 | 15 | Stationery | | 800 | | Stationery 800 |\n| EFT | 20 | Electricity | | 1 200 | | Electricity 1 200 |\n| EFT | 25 | Telephone | | 650 | | Telephone 650 |\n| BS | 31 | Bank charges | | 180 | | Bank charges 180 |\n| | | **Totals** | | **11 330** | **5 500** | **5 830** |'),
  t(2, '### Column Explanations\n\n| Column | What goes here |\n|--------|----------------|\n| **Doc** | Source document number (EFT reference, cheque number, BS for bank statement) |\n| **Day** | Date of the transaction |\n| **Details** | Short description of the payment |\n| **Fol** | Folio reference to the ledger |\n| **Bank** | Total amount paid (always filled in) |\n| **Salaries/Wages** | Payments to employees |\n| **Sundry Accounts** | All other payments — with a description |\n\n### How to Record Entries in the CPJ\n\n**Step 1:** Identify the source document (EFT proof, cheque counterfoil, bank statement).\n\n**Step 2:** Ask: "Is money going OUT of the business?" If yes, use the CPJ.\n\n**Step 3:** Determine the type of payment:\n- Employee wages or salaries → **Salaries/Wages** column\n- Any other payment → **Sundry Accounts** column with a description\n\n**Step 4:** Record the total amount in the **Bank** column.\n\n**Cross-check:** Bank total = Salaries/Wages + Sundry totals'),
  q(3, 'The business pays R1 500 for electricity by EFT. In which CPJ columns is this recorded?',
    ['Bank column and Sundry Accounts column (Electricity)', 'Bank column and Salaries column', 'Fee Income column and Bank column', 'It is not recorded in the CPJ'], 0,
    'Electricity is an expense payment. It goes in the Bank column (total paid) and the Sundry column described as "Electricity".'),
  fb(4, 'The CPJ records all money ___ by the business. Staff salaries are recorded in the Bank column and the ___ column.',
    ['paid out', 'Salaries/Wages'],
    'The CPJ records outflows. Salaries have their own column because they are a regular, significant payment for most businesses.'),
  t(5, '### Worked Example: CPJ for March 2026\n\n**Thabo\'s IT Services** — Payments for March 2026:\n\n1. 2 March: Paid rent R4 000 (EFT)\n2. 5 March: Paid for stationery R650 (cheque 301)\n3. 10 March: Paid staff salaries R6 000 (EFT)\n4. 15 March: Paid Telkom telephone R900 (EFT)\n5. 18 March: Paid for printer ink R450 (cheque 302)\n6. 22 March: Paid Eskom electricity R1 800 (EFT)\n7. 28 March: Owner\'s drawings R2 000 (EFT)\n8. 31 March: Bank charges R220 (bank statement)\n\n### Solution:\n\n| Doc | Day | Details | Bank | Salaries | Sundry |\n|-----|-----|---------|------|----------|--------|\n| EFT | 2 | Rent | 4 000 | | Rent 4 000 |\n| Ch 301 | 5 | Stationery | 650 | | Stationery 650 |\n| EFT | 10 | Staff salaries | 6 000 | 6 000 | |\n| EFT | 15 | Telephone | 900 | | Telephone 900 |\n| Ch 302 | 18 | Printer ink | 450 | | Consumables 450 |\n| EFT | 22 | Electricity | 1 800 | | Electricity 1 800 |\n| EFT | 28 | Drawings | 2 000 | | Drawings 2 000 |\n| BS | 31 | Bank charges | 220 | | Bank charges 220 |\n| | | **Totals** | **16 020** | **6 000** | **10 020** |\n\n**Cross-check:** R6 000 + R10 020 = R16 020 ✓'),
  q(6, 'Thabo withdraws R2 000 for personal use. In the CPJ, this is recorded as:',
    ['Drawings in the Sundry column', 'An expense in the Salaries column', 'Fee income in the Bank column', 'It is not recorded because it is personal'], 0,
    'Drawings are cash taken out by the owner for personal use. They are recorded in the CPJ Sundry column as "Drawings". They are NOT an expense.'),
  t(7, '### Posting from the CPJ to the Ledger\n\nAt month-end, the CPJ totals are posted to the general ledger:\n\n| CPJ Column | Posted to Ledger Account | Debit or Credit |\n|-----------|------------------------|----------------|\n| Bank total | Bank account | **Credit** (asset decreases) |\n| Salaries total | Salaries account | **Debit** (expense increases) |\n| Each sundry item | The specific account named | **Debit** |\n\n**Example posting from our CPJ:**\n\n**Bank Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CRJ (March) | 14 350 | CPJ (March) | 16 020 |\n\n**Salaries Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ (March) | 6 000 | | |\n\n**Rent Expense Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ (March) | 4 000 | | |\n\n**Drawings Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ (March) | 2 000 | | |\n\n**Remember:** Bank is credited because money is going OUT. Expenses and drawings are debited because they increase on the debit side.'),
  fb(8, 'When posting CPJ totals, the Bank account is ___ and expense accounts are ___.',
    ['credited', 'debited'],
    'Bank is credited (money leaving). Expenses are debited (costs increase on the debit side).'),
  q(9, 'The CPJ Bank total is R12 000, Salaries total is R5 000, and Sundry total is R6 500. What should you do?',
    ['Investigate the error — R5 000 + R6 500 = R11 500, not R12 000', 'The CPJ is correct', 'Add R500 to the Sundry column', 'Reduce the Bank total to R11 500'], 0,
    'Bank must equal Salaries + Sundry. R5 000 + R6 500 = R11 500, not R12 000. There is an R500 error to find.'),
  t(10, '### The Effect of CPJ Transactions on the Accounting Equation\n\nEvery CPJ entry affects the accounting equation:\n\n| CPJ Transaction | Assets | Owner\'s Equity | Liabilities |\n|----------------|--------|---------------|-------------|\n| Pay rent expense | Bank ↓ | Rent expense ↑ (OE ↓) | — |\n| Pay salaries | Bank ↓ | Salaries ↑ (OE ↓) | — |\n| Pay electricity | Bank ↓ | Electricity ↑ (OE ↓) | — |\n| Pay bank charges | Bank ↓ | Bank charges ↑ (OE ↓) | — |\n| Owner drawings | Bank ↓ | Drawings ↑ (OE ↓) | — |\n| Pay creditor | Bank ↓ | — | Creditors ↓ |\n\n**Key insight:** All CPJ entries decrease the Bank account (asset). Expense payments reduce owner\'s equity. Payments to creditors reduce liabilities.\n\n**Combined effect of CRJ and CPJ:**\n- CRJ receipts increase Bank: + R14 350\n- CPJ payments decrease Bank: − R16 020\n- Net change: R14 350 − R16 020 = **−R1 670**\n- If opening balance was R10 000, closing balance = R10 000 − R1 670 = **R8 330**'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Financial Literacy — Combined CRJ, CPJ, and Accounting Equation
//             (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Combined CRJ and CPJ Transactions ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Combining the CRJ and CPJ\n\nIn previous chapters, we looked at the CRJ (money in) and CPJ (money out) separately. Now we combine them to see the full picture of a business\'s cash transactions.\n\n### Worked Example: Nomsa\'s Salon — April 2026\n\n**Receipts (CRJ):**\n1. 2 April: Services rendered R3 800 (Rec 301)\n2. 9 April: Services rendered R2 500 (Rec 302)\n3. 16 April: Services rendered R4 100 (Rec 303)\n4. 23 April: Services rendered R3 000 (Rec 304)\n5. 30 April: Interest received R200 (BS)\n\n**CRJ:**\n\n| Doc | Day | Details | Bank | Fee Income | Sundry |\n|-----|-----|---------|------|-----------|--------|\n| Rec 301 | 2 | Styling services | 3 800 | 3 800 | |\n| Rec 302 | 9 | Styling services | 2 500 | 2 500 | |\n| Rec 303 | 16 | Styling services | 4 100 | 4 100 | |\n| Rec 304 | 23 | Styling services | 3 000 | 3 000 | |\n| BS | 30 | Interest received | 200 | | Interest received 200 |\n| | | **Totals** | **13 600** | **13 400** | **200** |'),
  t(2, '### CPJ — Payments for April 2026\n\n**Payments (CPJ):**\n1. 3 April: Rent R3 500 (EFT)\n2. 8 April: Cleaning supplies R400 (Ch 201)\n3. 15 April: Staff wages R4 500 (EFT)\n4. 20 April: Electricity R1 100 (EFT)\n5. 25 April: Advertising R800 (Ch 202)\n6. 30 April: Bank charges R150 (BS)\n\n**CPJ:**\n\n| Doc | Day | Details | Bank | Wages | Sundry |\n|-----|-----|---------|------|-------|--------|\n| EFT | 3 | Rent | 3 500 | | Rent 3 500 |\n| Ch 201 | 8 | Cleaning supplies | 400 | | Supplies 400 |\n| EFT | 15 | Staff wages | 4 500 | 4 500 | |\n| EFT | 20 | Electricity | 1 100 | | Electricity 1 100 |\n| Ch 202 | 25 | Advertising | 800 | | Advertising 800 |\n| BS | 30 | Bank charges | 150 | | Bank charges 150 |\n| | | **Totals** | **10 450** | **4 500** | **5 950** |\n\n**Cross-check:** R4 500 + R5 950 = R10 450 ✓'),
  q(3, 'From the worked example, what is the net cash received (receipts minus payments) for April?',
    ['R3 150 (R13 600 − R10 450)', 'R13 600', 'R10 450', 'R24 050'], 0,
    'Net cash = CRJ total − CPJ total = R13 600 − R10 450 = R3 150. The business received R3 150 more than it paid out.'),
  fb(4, 'The CRJ records cash ___. The CPJ records cash ___. The Bank balance is calculated from both journals.',
    ['receipts', 'payments'],
    'CRJ = money in (receipts). CPJ = money out (payments). The Bank account combines both to show the balance.'),
  t(5, '### Effect on the Accounting Equation\n\n**Opening position (1 April):**\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Bank: R8 000 | = | Capital: R20 000 | + | R0 |\n| Equipment: R12 000 | | | | |\n| **Total: R20 000** | = | **R20 000** | + | **R0** |\n\n**After recording ALL April transactions:**\n\nThe Bank increased by: R13 600 (CRJ) − R10 450 (CPJ) = R3 150\nNew Bank balance: R8 000 + R3 150 = R11 150\n\nTotal income earned: R13 400 (fees) + R200 (interest) = R13 600\nTotal expenses: R3 500 + R400 + R4 500 + R1 100 + R800 + R150 = R10 450\nNet profit: R13 600 − R10 450 = R3 150\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Bank: R11 150 | = | Capital: R20 000 | + | R0 |\n| Equipment: R12 000 | | Net profit: R3 150 | | |\n| **Total: R23 150** | = | **R23 150** | + | **R0** |\n\n**Check:** R23 150 = R23 150 + R0 ✓'),
  q(6, 'In the worked example, the net profit for April is R3 150. This equals:',
    ['The net increase in the Bank account', 'The CRJ total only', 'The CPJ total only', 'The opening Bank balance'], 0,
    'In this example (no non-cash transactions), net profit equals the net cash increase: R13 600 − R10 450 = R3 150.'),
  t(7, '### Closing Off the CRJ and CPJ Together\n\nAt month-end, both journals are closed off and their totals posted to the ledger.\n\n**Bank Account (combining CRJ and CPJ)**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CRJ (April) | 13 600 | CPJ (April) | 10 450 |\n| | | Balance c/d | 3 150 |\n| **Total** | **13 600** | **Total** | **13 600** |\n| Balance b/d | 3 150 | | |\n\n**Note:** If the opening balance was R8 000, it would appear before the CRJ entry:\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| Balance b/d | 8 000 | CPJ (April) | 10 450 |\n| CRJ (April) | 13 600 | Balance c/d | 11 150 |\n| **Total** | **21 600** | **Total** | **21 600** |\n| Balance b/d | 11 150 | | |\n\nThe closing Bank balance is R11 150 — a **debit balance** meaning the business has money in the bank.'),
  fb(8, 'A debit balance on the Bank account means the business has ___. A credit balance on the Bank account means the business is ___.',
    ['money in the bank', 'overdrawn'],
    'Debit = favourable (money available). Credit = overdrawn (the business owes the bank money).'),
  q(9, 'If the CRJ total is R8 000 and the CPJ total is R12 000 (with no opening balance), the Bank account will show:',
    ['A credit balance of R4 000 (overdrawn)', 'A debit balance of R4 000', 'A debit balance of R20 000', 'A credit balance of R8 000'], 0,
    'CPJ (R12 000) > CRJ (R8 000), so more money went out than came in. The Bank has a credit balance of R4 000, meaning it is overdrawn.'),
  t(10, '### Summary: CRJ and CPJ Together\n\n| | CRJ | CPJ |\n|---|-----|-----|\n| Records | Money received | Money paid out |\n| Bank column | Total receipts | Total payments |\n| Income column | Fee Income | — |\n| Expense columns | — | Salaries, Sundry |\n| Bank account posting | Debit (money in) | Credit (money out) |\n| Effect on OE | Income increases OE | Expenses decrease OE |\n\n**The relationship:**\n\n$$\\text{Closing Bank} = \\text{Opening Bank} + \\text{CRJ total} - \\text{CPJ total}$$\n\n$$\\text{Net Profit} = \\text{Total Income} - \\text{Total Expenses}$$\n\n**Important:** At Grade 8, all transactions are **cash transactions**. This means the net profit often equals the net increase in the Bank balance (unless there were non-income/expense transactions like capital or drawings).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: The Economy — Markets (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Types of Markets ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Markets\n\nA **market** is any place or system where buyers and sellers come together to exchange goods, services, or factors of production. Markets do not have to be physical places — they can also be online.\n\n### Types of Markets\n\n| Market | What is traded | Examples |\n|--------|---------------|----------|\n| **Goods market** | Finished goods and services | Shoprite selling groceries, a salon offering haircuts |\n| **Services market** | Services provided to consumers | Banking, insurance, medical care, education |\n| **Factor market** | Factors of production (land, labour, capital) | Job market, property market, stock market |\n\n### The Factor Market\n\nThe **factor market** is where factors of production are bought and sold:\n\n**1. Labour market:**\n- Workers offer their labour (skills and time)\n- Businesses hire workers and pay wages or salaries\n- The price of labour is determined by supply and demand\n- More skilled workers generally earn higher wages\n\n**2. Financial market (capital market):**\n- Savers lend money to borrowers through banks\n- The price of capital is the **interest rate**\n- The JSE (Johannesburg Stock Exchange) is South Africa\'s financial market\n- Banks like FNB, Standard Bank, Absa, and Nedbank operate in this market'),
  t(2, '### The Goods and Services Market\n\nThe **goods and services market** is where businesses sell their products to consumers.\n\n**Types of goods:**\n\n| Type | Description | Examples |\n|------|-----------|----------|\n| **Consumer goods** | Final products used by individuals | Bread, clothing, smartphones |\n| **Capital goods** | Goods used to produce other goods | Factory machines, delivery trucks |\n| **Durable goods** | Goods that last a long time | Furniture, appliances, cars |\n| **Non-durable goods** | Goods that are used quickly | Food, toiletries, petrol |\n\n**Types of services:**\n\n| Type | Examples |\n|------|----------|\n| **Financial services** | Banking, insurance, investments |\n| **Health services** | Hospitals, clinics, pharmacies |\n| **Education services** | Schools, universities, tutoring |\n| **Transport services** | Uber, MyCiti buses, Gautrain |\n| **Professional services** | Lawyers, accountants, engineers |\n| **Personal services** | Hairdressing, plumbing, cleaning |\n\nIn South Africa, the **services sector** (tertiary sector) is the largest part of the economy, contributing about 65% of GDP.'),
  q(3, 'The labour market is an example of:',
    ['A factor market', 'A goods market', 'A services market', 'A financial market only'], 0,
    'The labour market trades a factor of production (labour), making it part of the factor market.'),
  fb(4, 'In the factor market, the price of labour is ___. The price of capital is the ___.',
    ['wages', 'interest rate'],
    'Workers earn wages (price of labour). The interest rate is the price of borrowing capital (money).'),
  t(5, '### How Markets Work: Supply and Demand\n\nMarkets are driven by **supply and demand**:\n\n**Demand** — how much consumers want to buy at various prices\n- When prices go UP, demand goes DOWN (people buy less)\n- When prices go DOWN, demand goes UP (people buy more)\n\n**Supply** — how much producers want to sell at various prices\n- When prices go UP, supply goes UP (producers want to sell more)\n- When prices go DOWN, supply goes DOWN (producers produce less)\n\n**Market price** is determined where supply meets demand.\n\n**South African example:**\n- When the petrol price increases, people drive less and use public transport more (demand for petrol decreases)\n- When maize prices are high, farmers plant more maize (supply increases)\n- During December holidays, demand for flights increases, so airline ticket prices rise\n\n**Key insight:** Prices act as signals in the economy:\n- High prices signal producers to supply MORE\n- Low prices signal consumers to buy MORE\n- The market naturally moves towards a balance (equilibrium)'),
  q(6, 'During the December holiday season, flight ticket prices increase because:',
    ['Demand for flights increases while supply stays the same', 'Airlines want to lose money', 'Fewer people want to travel', 'The government raises prices'], 0,
    'More people want to fly during holidays (demand increases). With a limited number of flights (supply unchanged), prices rise.'),
  t(7, '### The Informal Market\n\nSouth Africa has a large **informal market** alongside the formal market.\n\n| Feature | Formal market | Informal market |\n|---------|--------------|----------------|\n| Registration | Businesses are registered | Often unregistered |\n| Tax | Businesses pay tax | Often do not pay tax |\n| Regulation | Follow labour and consumer laws | Less regulated |\n| Location | Fixed premises (shops, offices) | Streets, markets, homes |\n| Records | Keep formal accounting records | Few or no records |\n| Examples | Shoprite, Standard Bank, MTN | Spaza shops, street vendors, car washes |\n\n**The informal market is important because:**\n- It provides income for millions of South Africans\n- It creates self-employment opportunities\n- It serves communities that formal businesses do not reach\n- It contributes to economic activity and growth\n\n**Challenges of the informal market:**\n- No legal protection for workers\n- No insurance or safety standards\n- Income is unpredictable\n- Difficult to access banking and credit'),
  fb(8, 'The formal market consists of ___ businesses that pay taxes. The informal market includes businesses that are often ___.',
    ['registered', 'unregistered'],
    'Formal businesses are registered with CIPC and pay taxes. Informal businesses are often unregistered and operate outside formal regulations.'),
  q(9, 'A spaza shop that is not registered with CIPC operates in the:',
    ['Informal market', 'Formal market', 'Financial market', 'International market'], 0,
    'Unregistered businesses like many spaza shops operate in the informal market.'),
  t(10, '### Markets and the Circular Flow\n\nMarkets connect the participants in the economy through the circular flow:\n\n**Factor market:**\n- Households sell their labour → businesses buy labour\n- Money flows from businesses to households (wages)\n- Labour flows from households to businesses\n\n**Goods and services market:**\n- Businesses sell goods and services → households buy them\n- Money flows from households to businesses (spending)\n- Goods and services flow from businesses to households\n\n**Financial market:**\n- Households save money in banks → banks lend to businesses\n- Interest flows from borrowers to savers\n\n**The government interacts with all markets:**\n- It regulates markets (setting rules)\n- It taxes participants (income tax, VAT)\n- It provides services (education, health, infrastructure)\n- It employs workers (teachers, nurses, police)\n\n**Key message:** All markets are interconnected. What happens in one market affects the others. For example, if there are fewer jobs in the labour market, households earn less income and spend less in the goods market.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Entrepreneurship — Levels and Functions of Management (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Management Levels and Tasks ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Levels and Functions of Management\n\nEvery business, no matter how small, needs **management** — the process of planning, organising, leading, and controlling resources to achieve goals.\n\n### Levels of Management\n\n| Level | Who | Responsibilities | Example |\n|-------|-----|-----------------|--------|\n| **Top management** | CEO, Managing Director, Board of Directors | Set the vision, mission, and long-term goals of the business | The CEO of Shoprite |\n| **Middle management** | Department managers, branch managers | Implement strategies set by top management; manage daily operations | A regional manager at Pick n Pay |\n| **Lower management (First-line)** | Supervisors, team leaders, foremen | Supervise workers directly; carry out instructions from middle management | A shift supervisor at a factory |\n\n### The Management Hierarchy\n\nManagement is structured like a pyramid:\n\n```\n        /  Top  \\\n       / Management \\\n      /  (Few people)  \\\n     /  Middle Management  \\\n    /  (More people)          \\\n   / Lower Management             \\\n  /  (Most managers)                  \\\n /  Workers / Employees                  \\\n```\n\n- **Top management** = fewest people, biggest decisions\n- **Lower management** = most managers, closest to workers'),
  t(2, '### Management Tasks: POLC\n\nManagement involves four key tasks, known as **POLC**:\n\n| Task | Description | Example |\n|------|-----------|--------|\n| **Planning** | Setting goals and deciding how to achieve them | A bakery owner plans to increase sales by 20% this year |\n| **Organising** | Arranging resources (people, money, equipment) to carry out the plan | Assigning roles to staff, buying ingredients, scheduling shifts |\n| **Leading** | Motivating and guiding employees to work towards goals | The manager encourages workers, communicates the vision, resolves conflicts |\n| **Controlling** | Checking that actual performance matches the plan and correcting problems | Comparing actual sales to the target, taking action if sales are low |\n\n### Planning in Detail\n\n| Type of plan | Time frame | Who creates it | Example |\n|-------------|-----------|----------------|--------|\n| **Strategic plan** | Long-term (3–5 years) | Top management | Expand to 3 new provinces |\n| **Tactical plan** | Medium-term (1–2 years) | Middle management | Open 2 new branches this year |\n| **Operational plan** | Short-term (daily/weekly) | Lower management | Schedule workers for this week |'),
  q(3, 'The four management tasks (POLC) are:',
    ['Planning, Organising, Leading, Controlling', 'Production, Organisation, Leadership, Communication', 'Planning, Operating, Lending, Checking', 'Purchasing, Ordering, Leading, Calculating'], 0,
    'POLC stands for Planning, Organising, Leading, and Controlling — the four essential management tasks.'),
  fb(4, 'Top management creates ___ plans (3-5 years). Lower management creates ___ plans (daily/weekly).',
    ['strategic', 'operational'],
    'Strategic plans are long-term and set by top management. Operational plans are short-term and managed by first-line supervisors.'),
  t(5, '### Organising\n\nOrganising involves arranging resources to carry out the plan:\n\n- **Human resources:** Deciding who does what (job descriptions, teams, reporting lines)\n- **Physical resources:** Ensuring equipment, materials, and space are available\n- **Financial resources:** Allocating budgets to departments\n\n### Leading\n\nLeading involves influencing and motivating people:\n\n| Leadership style | Description | When to use |\n|-----------------|-----------|------------|\n| **Autocratic** | Leader makes all decisions without consulting workers | In emergencies or when quick decisions are needed |\n| **Democratic** | Leader involves workers in decision-making | When teamwork and creativity are important |\n| **Laissez-faire** | Leader gives workers freedom to make their own decisions | With highly skilled, experienced workers |\n\n**Good leaders:**\n- Communicate clearly\n- Listen to employees\n- Lead by example\n- Make fair decisions\n- Motivate and inspire\n- Handle conflict professionally'),
  q(6, 'A democratic leadership style means:',
    ['The leader involves workers in decision-making', 'The leader makes all decisions alone', 'Workers make all decisions without a leader', 'The government controls the business'], 0,
    'Democratic leadership involves consulting and including employees in decision-making, which improves teamwork and morale.'),
  t(7, '### Controlling\n\nControlling ensures that the business is on track to achieve its goals.\n\n**The controlling process:**\n\n| Step | Action | Example |\n|------|--------|--------|\n| 1 | Set **standards** (targets) | Target: Sell 500 loaves per day |\n| 2 | **Measure** actual performance | Actual: Sold 420 loaves per day |\n| 3 | **Compare** actual to standard | Difference: 80 loaves short |\n| 4 | Take **corrective action** | Increase advertising, offer a discount |\n\n**Areas where controlling is applied:**\n- **Quality control** — checking that products meet standards\n- **Financial control** — comparing budgets to actual spending\n- **Stock control** — ensuring enough stock without overstocking\n- **Time management** — ensuring deadlines are met\n\n**Example:** A restaurant manager notices that food costs are 10% higher than budgeted. She investigates and finds that a supplier increased prices. She negotiates with the supplier or finds a cheaper alternative — this is corrective action.'),
  fb(8, 'The controlling process involves setting standards, measuring performance, comparing results, and taking ___ action. POLC stands for Planning, Organising, Leading, and ___.',
    ['corrective', 'Controlling'],
    'Corrective action fixes deviations from the plan. POLC = Planning, Organising, Leading, Controlling.'),
  q(9, 'A factory supervisor who oversees workers on the production line is at which level of management?',
    ['Lower management (first-line)', 'Top management', 'Middle management', 'Not a manager'], 0,
    'Supervisors and team leaders who directly oversee workers are at the lower (first-line) management level.'),
  t(10, '### Characteristics of Good Management\n\nA good manager has the following qualities:\n\n| Characteristic | Description |\n|---------------|------------|\n| **Communication skills** | Can explain goals and give clear instructions |\n| **Decision-making** | Makes informed, timely decisions |\n| **Problem-solving** | Identifies problems and finds effective solutions |\n| **Integrity** | Honest and ethical in all dealings |\n| **Delegation** | Assigns tasks to the right people |\n| **Adaptability** | Can adjust to changing circumstances |\n| **Technical knowledge** | Understands the work being managed |\n| **Emotional intelligence** | Understands and manages emotions — own and others\' |\n\n**The difference between a manager and a leader:**\n\n| Manager | Leader |\n|---------|--------|\n| Focuses on processes and tasks | Focuses on people and vision |\n| Plans and organises | Inspires and motivates |\n| Controls and monitors | Empowers and trusts |\n| Maintains the current system | Drives change and innovation |\n\n**The best managers are also leaders** — they manage processes efficiently while inspiring their teams.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Financial Literacy — General Ledger and Trial Balance (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The General Ledger ---
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## The General Ledger\n\nThe **general ledger** is the book of final entry. It contains all the accounts of the business. After recording transactions in the CRJ and CPJ, the totals are **posted** (transferred) to the general ledger.\n\n### T-Account Format\n\nEvery account in the general ledger uses a **T-account** format:\n\n```\n     Account Name\n  Dr          |         Cr\n  ------------|------------\n  Left side   |  Right side\n  (Debits)    |  (Credits)\n```\n\n### Posting from CRJ and CPJ\n\n| Journal | What is posted | To which account | Side |\n|---------|---------------|-----------------|------|\n| CRJ — Bank total | Total receipts | Bank | Debit |\n| CRJ — Fee Income total | Total fee income | Fee Income | Credit |\n| CRJ — Each sundry item | Individual amounts | Named account | Credit |\n| CPJ — Bank total | Total payments | Bank | Credit |\n| CPJ — Salaries total | Total salaries | Salaries | Debit |\n| CPJ — Each sundry item | Individual amounts | Named account | Debit |\n\n**Remember:**\n- CRJ entries go on the **debit** side of Bank and the **credit** side of income accounts\n- CPJ entries go on the **credit** side of Bank and the **debit** side of expense accounts'),
  t(2, '### Worked Example: Posting to the General Ledger\n\n**Thabo\'s IT Services — March 2026**\n\nUsing our CRJ totals: Bank R14 350, Fee Income R12 500, Rent Income R1 500, Interest Received R350\nUsing our CPJ totals: Bank R16 020, Salaries R6 000, Rent R4 000, Stationery R650, Telephone R900, Consumables R450, Electricity R1 800, Drawings R2 000, Bank charges R220\n\n**Bank Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| Balance b/d | 10 000 | CPJ (March) | 16 020 |\n| CRJ (March) | 14 350 | Balance c/d | 8 330 |\n| **Total** | **24 350** | **Total** | **24 350** |\n| Balance b/d | 8 330 | | |\n\n**Fee Income Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ (March) | 12 500 |\n\n**Salaries Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ (March) | 6 000 | | |\n\n**Rent Expense Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ (March) | 4 000 | | |'),
  q(3, 'In the Bank account, the opening balance of R10 000 is entered on the:',
    ['Debit side (the business has money in the bank)', 'Credit side (the business owes the bank)', 'Both sides equally', 'It is not entered in the Bank account'], 0,
    'A positive bank balance (money in the bank) is a debit balance. The opening balance appears on the debit side.'),
  fb(4, 'CRJ totals are posted to the ___ side of the Bank account. CPJ totals are posted to the ___ side of the Bank account.',
    ['debit', 'credit'],
    'Money received (CRJ) = debit to Bank. Money paid (CPJ) = credit to Bank.'),
  t(5, '### The Double-Entry Principle in Practice\n\nEvery posting involves a **debit** and a **credit** of the same amount:\n\n| Transaction | Debit Account | Credit Account | Amount |\n|------------|--------------|----------------|--------|\n| CRJ — Fee Income | Bank | Fee Income | R12 500 |\n| CRJ — Rent Income | Bank | Rent Income | R1 500 |\n| CRJ — Interest | Bank | Interest Received | R350 |\n| CPJ — Salaries | Salaries Expense | Bank | R6 000 |\n| CPJ — Rent paid | Rent Expense | Bank | R4 000 |\n| CPJ — Stationery | Stationery Expense | Bank | R650 |\n| CPJ — Drawings | Drawings | Bank | R2 000 |\n\n**Check:** Total debits = Total credits\n- Total debits: R14 350 (Bank from CRJ) + R6 000 + R4 000 + R650 + R900 + R450 + R1 800 + R2 000 + R220 = R30 370\n- Total credits: R12 500 + R1 500 + R350 + R16 020 (Bank from CPJ) = R30 370 ✓'),
  q(6, 'Rent expense of R4 000 from the CPJ is posted to the Rent Expense account on the:',
    ['Debit side (expenses increase on the debit side)', 'Credit side (expenses decrease on the credit side)', 'Both sides equally', 'It stays in the CPJ and is not posted'], 0,
    'Expenses have a normal debit balance. When rent is paid, the Rent Expense account is debited to increase the expense.'),
  t(7, '### Balancing Ledger Accounts\n\n**Steps to balance a T-account:**\n\n1. **Total** the debit and credit sides separately\n2. Find the **difference** between the two totals\n3. Write **"Balance c/d"** (carried down) on the **smaller** side to make both sides equal\n4. **Rule off** both sides\n5. Write **"Balance b/d"** (brought down) on the **opposite** side to start the new period\n\n**Example: Balancing the Electricity Account**\n\nAssume electricity was paid in March (R1 800) and April (R2 100):\n\n**Electricity Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ (March) | 1 800 | | |\n| CPJ (April) | 2 100 | Balance c/d | 3 900 |\n| **Total** | **3 900** | **Total** | **3 900** |\n| Balance b/d | 3 900 | | |\n\nThe Electricity account has a debit balance of R3 900, representing total electricity expenses.'),
  fb(8, 'Balance c/d is written on the ___ side of the T-account. Balance b/d appears on the ___ side to start the new period.',
    ['smaller', 'opposite'],
    'Balance c/d goes on the smaller side to equalise totals. Balance b/d goes on the opposite side to carry the balance forward.'),
  q(9, 'After balancing all accounts, the Bank account shows a debit balance of R8 330. This means:',
    ['The business has R8 330 in the bank (favourable)', 'The business is overdrawn by R8 330', 'The business made R8 330 profit', 'The Bank owes the business R8 330'], 0,
    'A debit balance on the Bank account means the business has money available — R8 330 in this case. A favourable position.'),
  t(10, '### Types of Accounts in the General Ledger\n\nAll accounts fall into five categories:\n\n| Category | Normal balance | Examples | Financial statement |\n|----------|---------------|----------|--------------------|\n| **Assets** | Debit | Bank, Equipment, Supplies | Balance Sheet |\n| **Owner\'s equity** | Credit | Capital | Balance Sheet |\n| **Liabilities** | Credit | Creditors, Bank loan | Balance Sheet |\n| **Income** | Credit | Fee income, Rent income, Interest | Income Statement |\n| **Expenses** | Debit | Rent, Salaries, Electricity, Bank charges | Income Statement |\n\n**Balance Sheet accounts** (assets, equity, liabilities) carry forward to the next period.\n**Income Statement accounts** (income, expenses) are used to calculate profit or loss.\n\n**Drawing account:** Appears on the Balance Sheet as a deduction from owner\'s equity.\n\n$$\\text{Closing capital} = \\text{Opening capital} + \\text{Net profit} - \\text{Drawings}$$'),
];

// --- Lesson 2: The Trial Balance ---
blockNum = 0;
const ch13_lesson2 = [
  t(1, '## The Trial Balance\n\nA **trial balance** is a list of all the general ledger account balances at a specific date. It checks that total debits equal total credits.\n\n### Purpose of the Trial Balance\n\n1. To verify the **arithmetic accuracy** of the books (debits = credits)\n2. To provide a **summary** of all account balances\n3. To serve as the basis for preparing **financial statements**\n\n### Format\n\n**Thabo\'s IT Services**\n**Trial Balance on 31 March 2026**\n\n| Account | Fol | Debit (R) | Credit (R) |\n|---------|-----|----------|------------|\n| Bank | B1 | 8 330 | |\n| Equipment | B2 | 15 000 | |\n| Supplies | B3 | 3 000 | |\n| Capital | B4 | | 25 000 |\n| Creditors | B5 | | 3 000 |\n| Fee income | N1 | | 12 500 |\n| Rent income | N2 | | 1 500 |\n| Interest received | N3 | | 350 |\n| Salaries | N4 | 6 000 | |\n| Rent expense | N5 | 4 000 | |\n| Stationery | N6 | 650 | |\n| Telephone | N7 | 900 | |\n| Consumables | N8 | 450 | |\n| Electricity | N9 | 1 800 | |\n| Drawings | N10 | 2 000 | |\n| Bank charges | N11 | 220 | |\n| | | **42 350** | **42 350** |\n\n**Debits = Credits ✓**'),
  t(2, '### Rules for Preparing a Trial Balance\n\n1. List **every** ledger account that has a balance\n2. Accounts with a **debit balance** go in the debit column:\n   - Assets (Bank, Equipment, Supplies)\n   - Expenses (Rent, Salaries, Electricity, etc.)\n   - Drawings\n3. Accounts with a **credit balance** go in the credit column:\n   - Owner\'s equity (Capital)\n   - Liabilities (Creditors, Bank loan)\n   - Income (Fee income, Rent income, Interest received)\n4. **Total both columns** — they MUST be equal\n\n### What if the Trial Balance Does Not Balance?\n\n**Possible errors:**\n- An amount was posted to only one account (not both)\n- An amount was posted to the wrong side (debit instead of credit)\n- Different amounts were posted to the debit and credit sides\n- A balance was calculated incorrectly\n- An account was left out of the trial balance\n- An arithmetic error in totalling\n\n**Steps to find the error:**\n1. Re-add both columns\n2. Find the difference between the two totals\n3. Check if any entry equals that difference\n4. Divide the difference by 2 — an entry may be on the wrong side\n5. Divide the difference by 9 — a transposition error (e.g., 54 instead of 45)'),
  q(3, 'In the trial balance, the Drawings account appears in the:',
    ['Debit column', 'Credit column', 'It is not included in the trial balance', 'Both columns'], 0,
    'Drawings have a debit balance (they reduce owner\'s equity). The Drawings account appears in the debit column of the trial balance.'),
  fb(4, 'In the trial balance, assets and expenses appear in the ___ column. Liabilities, equity, and income appear in the ___ column.',
    ['debit', 'credit'],
    'Assets and expenses have debit balances. Liabilities, owner\'s equity, and income have credit balances.'),
  t(5, '### From Trial Balance to Financial Statements\n\nThe trial balance provides the information needed to prepare two financial statements:\n\n**1. Income Statement** — shows profit or loss for a period\n\n**Thabo\'s IT Services — Income Statement for March 2026**\n\n| | R |\n|---|---:|\n| **Income** | |\n| Fee income | 12 500 |\n| Rent income | 1 500 |\n| Interest received | 350 |\n| **Total income** | **14 350** |\n| **Less: Expenses** | |\n| Salaries | 6 000 |\n| Rent expense | 4 000 |\n| Stationery | 650 |\n| Telephone | 900 |\n| Consumables | 450 |\n| Electricity | 1 800 |\n| Bank charges | 220 |\n| **Total expenses** | **14 020** |\n| **Net profit** | **330** |\n\n$$\\text{Net Profit} = \\text{Total Income} - \\text{Total Expenses} = R14 350 - R14 020 = R330$$'),
  q(6, 'From the Income Statement, Thabo\'s net profit for March is R330. This means:',
    ['The business earned R330 more than it spent on expenses', 'The business has R330 in the bank', 'The business owes R330', 'The owner withdrew R330'], 0,
    'Net profit means income exceeded expenses by R330. This is the profit earned during March.'),
  t(7, '### The Balance Sheet\n\n**2. Balance Sheet** — shows the financial position at a specific date\n\n**Thabo\'s IT Services — Balance Sheet on 31 March 2026**\n\n| **Assets** | R |\n|-----------|---:|\n| Bank | 8 330 |\n| Equipment | 15 000 |\n| Supplies | 3 000 |\n| **Total assets** | **26 330** |\n\n| **Owner\'s Equity** | R |\n|-------------------|---:|\n| Capital (opening) | 25 000 |\n| Add: Net profit | 330 |\n| | 25 330 |\n| Less: Drawings | (2 000) |\n| **Owner\'s equity** | **23 330** |\n\n| **Liabilities** | R |\n|----------------|---:|\n| Creditors | 3 000 |\n| **Total liabilities** | **3 000** |\n\n| **Owner\'s equity + Liabilities** | **26 330** |\n\n**Check:** Assets R26 330 = Owner\'s equity R23 330 + Liabilities R3 000 = R26 330 ✓'),
  fb(8, 'The Income Statement shows the profit or loss for a ___. The Balance Sheet shows the financial position at a specific ___.',
    ['period', 'date'],
    'Income Statement covers a period (e.g., "for the month ended 31 March"). Balance Sheet is a snapshot at a specific date (e.g., "on 31 March").'),
  q(9, 'Which of the following trial balance items appears on the Income Statement?',
    ['Fee income', 'Equipment', 'Capital', 'Creditors'], 0,
    'Fee income is an income account and appears on the Income Statement. Equipment, capital, and creditors appear on the Balance Sheet.'),
  t(10, '### Grade 8 EMS — Final Summary\n\n**What you learned this year:**\n\n| Topic | Key concepts |\n|-------|--------------|\n| **The Economy** | Government (3 levels), national budget, standard of living, markets |\n| **Financial Literacy** | Accounting equation, source documents, CRJ, CPJ, general ledger, trial balance |\n| **Entrepreneurship** | Factors of production, forms of ownership, management (POLC) |\n\n**Key formulae:**\n\n$$\\text{Assets} = \\text{Owner\'s Equity} + \\text{Liabilities}$$\n\n$$\\text{Net Profit} = \\text{Total Income} - \\text{Total Expenses}$$\n\n$$\\text{Closing Capital} = \\text{Opening Capital} + \\text{Net Profit} - \\text{Drawings}$$\n\n**Exam tips:**\n1. Know the accounting equation — it is the foundation\n2. Practise recording CRJ and CPJ entries\n3. Understand T-accounts and how to balance them\n4. Learn the debit/credit rules (DEAD / CLIO)\n5. Use South African examples (SARS, CIPC, JSE, CCMA)\n6. Read questions carefully — is money coming IN or going OUT?\n7. Always show your workings\n8. Cross-check CRJ and CPJ totals'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 8
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 8/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 8:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 8', schoolId: SCHOOL_ID, orderIndex: 8,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 8:', String(GRADE_ID));
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
      title: 'Chapter 1: The Economy — Government',
      description: 'The meaning of government; three levels of government; the role of government in respect of households and businesses; government revenue and expenditure; the national budget.',
      order: 1,
      lessons: [
        { title: 'The Role of Government in the Economy', description: 'Meaning of government; three levels of government; government as consumer and producer; government revenue (direct and indirect tax); government expenditure on services.', blocks: ch1_lesson1, term: 1 },
        { title: 'The National Budget', description: 'What is a budget; the national budget process; budget surplus and deficit; how the budget affects growth and reduces inequalities; personal budgets.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: The Economy — Standard of Living',
      description: 'Standard of living; lifestyles; modern and rural societies; inequality; impact of development on the environment; unemployment; sustainable development.',
      order: 2,
      lessons: [
        { title: 'Standard of Living and the Environment', description: 'Factors affecting standard of living; urban vs rural lifestyles; inequality and the Gini coefficient; environmental impact of development; sustainable development; unemployment.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Financial Literacy — Accounting Concepts',
      description: 'Key accounting concepts; the accounting equation (A = O + L); how transactions affect the equation; cash receipts and payments; the double-entry principle.',
      order: 3,
      lessons: [
        { title: 'Accounting Concepts and the Accounting Equation', description: 'Sole trader; capital; assets; liabilities; owner\'s equity; income; expenses; profit and loss; the accounting equation; how transactions affect the equation; debit and credit rules.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Financial Literacy — Source Documents',
      description: 'Common source documents (receipts, deposit slips, till slips, EFT notifications, bank statements); importance of source documents; linking documents to journals.',
      order: 4,
      lessons: [
        { title: 'Source Documents', description: 'Receipts; deposit slips; cash register slips; EFT notifications; bank statements; cash invoices; importance of source documents; the accounting cycle overview.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Financial Literacy — The Accounting Cycle and the Accounting Equation',
      description: 'Overview of the accounting cycle; service business vs trading business; cash transactions and the accounting equation; debit and credit in practice; drawings and capital.',
      order: 5,
      lessons: [
        { title: 'Overview of the Accounting Cycle', description: 'Steps of the accounting cycle; service vs trading business; cash transactions on the accounting equation; double-entry examples; drawings vs capital.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Financial Literacy — Cash Receipts Journal (CRJ)',
      description: 'The CRJ format for a service business; recording entries; worked examples; closing off the CRJ; effect on the accounting equation; posting to the ledger.',
      order: 6,
      lessons: [
        { title: 'The CRJ of a Service Business', description: 'CRJ format and columns; recording fee income and sundry receipts; worked example; closing off; effect on the accounting equation; posting to the ledger.', blocks: ch6_lesson1, term: 2 },
        { title: 'More CRJ Practice and the Accounting Equation', description: 'Tracing CRJ entries through the accounting equation; additional worked example; common mistakes; folio references; posting totals.', blocks: ch6_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Entrepreneurship — Factors of Production',
      description: 'The four factors of production; types of capital and labour; natural resources in South Africa; remuneration of factors; how factors work together.',
      order: 7,
      lessons: [
        { title: 'Factors of Production', description: 'Natural resources, labour, capital, entrepreneurship; types of labour; fair employment practices; SA natural resources; remuneration; interdependence of factors.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Entrepreneurship — Forms of Ownership',
      description: 'Sole traders; partnerships; private companies (Pty) Ltd; public companies (Ltd); comparison; the role of forms of ownership in job creation and use of natural resources.',
      order: 8,
      lessons: [
        { title: 'Sole Traders and Partnerships', description: 'Sole trader characteristics; partnership characteristics; advantages and disadvantages; partnership agreements; comparison; role in job creation.', blocks: ch8_lesson1, term: 3 },
        { title: 'Companies', description: 'Private company (Pty) Ltd; public company (Ltd); CIPC registration; limited liability; comparison of all four forms; role of companies in the SA economy.', blocks: ch8_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Financial Literacy — Cash Payments Journal (CPJ)',
      description: 'The CPJ format for a service business; recording entries; worked example; posting to the ledger; effect on the accounting equation.',
      order: 9,
      lessons: [
        { title: 'The CPJ of a Service Business', description: 'CPJ format and columns; recording salaries and sundry payments; worked example; drawings; posting to the ledger; effect on the accounting equation.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Financial Literacy — Combined CRJ, CPJ, and Accounting Equation',
      description: 'Recording combined CRJ and CPJ transactions; calculating net cash; effect on the accounting equation; the Bank T-account; closing off both journals.',
      order: 10,
      lessons: [
        { title: 'Combined CRJ and CPJ Transactions', description: 'Worked example with both CRJ and CPJ; net cash flow; combined effect on the accounting equation; Bank T-account; debit and credit balances.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: The Economy — Markets',
      description: 'Types of markets (goods, services, factor); the labour and financial markets; supply and demand basics; the informal market; markets and the circular flow.',
      order: 11,
      lessons: [
        { title: 'Types of Markets', description: 'Goods and services market; factor market (labour, capital); supply and demand basics; informal vs formal markets; markets and the circular flow.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Entrepreneurship — Levels and Functions of Management',
      description: 'Three levels of management; management tasks (POLC — planning, organising, leading, controlling); leadership styles; characteristics of good management.',
      order: 12,
      lessons: [
        { title: 'Management Levels and Tasks', description: 'Top, middle, and lower management; POLC (planning, organising, leading, controlling); leadership styles; the controlling process; characteristics of good management.', blocks: ch12_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 13: Financial Literacy — General Ledger and Trial Balance',
      description: 'T-account format; posting from CRJ and CPJ; balancing accounts; trial balance format; Income Statement and Balance Sheet of a service business.',
      order: 13,
      lessons: [
        { title: 'The General Ledger', description: 'T-account format; posting from CRJ and CPJ; the double-entry principle in practice; balancing ledger accounts; types of accounts.', blocks: ch13_lesson1, term: 4 },
        { title: 'The Trial Balance', description: 'Purpose and format of the trial balance; rules for preparation; finding errors; Income Statement and Balance Sheet of a service business; Grade 8 summary.', blocks: ch13_lesson2, term: 4 },
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
    title: 'Grade 8 Economic and Management Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering The Economy (government, national budget, standard of living, markets), Financial Literacy (accounting concepts, source documents, CRJ, CPJ, general ledger, trial balance), and Entrepreneurship (factors of production, forms of ownership, management) for the Grade 8 EMS curriculum.',
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
  console.log('  TEXTBOOK: Grade 8 EMS');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
