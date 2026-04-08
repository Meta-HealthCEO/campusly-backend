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
// CHAPTER 1: The Economy — Economic Systems and the Circular Flow (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Economic Systems and Participants ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Economy\n\nAn **economy** is a system in which a country\'s goods and services are produced, distributed, and consumed. South Africa\'s economy involves millions of people making decisions every day about what to buy, what to produce, and how to earn a living.\n\n### Needs, Wants, and Scarcity\n\n| Concept | Definition | Examples |\n|---------|-----------|----------|\n| **Needs** | Things essential for survival | Food, water, shelter, clothing |\n| **Wants** | Things that improve quality of life but are not essential | Smartphones, holiday trips, designer clothing |\n| **Scarcity** | Resources are limited while human wants are unlimited | Only a certain amount of land, labour, and capital exist |\n\nBecause of scarcity, every individual, family, and country must make **choices**. Every choice has an **opportunity cost** — the next best alternative that is given up.'),
  t(2, '### Goods and Services\n\n**Goods** are tangible (physical) products that satisfy needs or wants.\n- **Consumer goods:** Products used directly by people (e.g. bread, shoes, furniture)\n- **Capital goods:** Products used to make other goods (e.g. machines, factory buildings, delivery trucks)\n\n**Services** are intangible (non-physical) activities that satisfy needs or wants.\n- Examples: haircuts, medical treatment, education, banking, transport\n\n### Factors of Production\n\nEvery economy uses four factors of production:\n\n| Factor | Description | Reward |\n|--------|-----------|--------|\n| **Natural resources (Land)** | All gifts of nature — land, water, minerals, climate | Rent |\n| **Labour (Human resources)** | Physical and mental effort of workers | Wages / Salaries |\n| **Capital** | Money, machinery, and equipment used to produce goods | Interest |\n| **Entrepreneurship** | The ability to combine resources and take risks to start a business | Profit |'),
  q(3, 'Which of the following is an example of a capital good?',
    ['A factory machine used to make clothing', 'A loaf of bread bought for lunch', 'A pair of running shoes', 'A movie ticket'], 0,
    'Capital goods are used to produce other goods and services. A factory machine is used in the production process, not consumed directly.'),
  fb(4, 'The reward for labour is ___, while the reward for entrepreneurship is ___.',
    ['wages', 'profit'],
    'Workers receive wages or salaries. Entrepreneurs take risks and earn profit (or bear losses).'),
  t(5, '### The Three Major Economic Systems\n\n**1. Free Market Economy (Capitalism)**\n- Individuals and private businesses own the factors of production\n- Prices are determined by supply and demand\n- The government does not interfere in the economy\n- Examples: No pure free market exists, but the USA and Hong Kong are close\n\n**2. Command Economy (Communism / Planned Economy)**\n- The government owns and controls all factors of production\n- The government decides what to produce, how to produce, and for whom\n- Examples: North Korea, Cuba\n\n**3. Mixed Economy**\n- Combines elements of both free market and command economies\n- Private businesses and the government both play a role\n- Most countries in the world, including **South Africa**, have a mixed economy\n\n| Feature | Free Market | Command | Mixed |\n|---------|------------|---------|-------|\n| Ownership | Private | Government | Both |\n| Price setting | Supply & demand | Government | Both |\n| Competition | High | None | Moderate |\n| Consumer choice | Wide | Limited | Moderate |'),
  q(6, 'South Africa operates under which type of economic system?',
    ['A mixed economy', 'A free market economy', 'A command economy', 'A traditional economy'], 0,
    'South Africa has a mixed economy. The government provides services like healthcare and education, while private businesses also operate freely in the market.'),
  t(7, '### Participants in the Economy\n\nThere are four main participants (also called sectors or role-players) in the economy:\n\n**1. Households**\n- Supply factors of production (labour, capital, land)\n- Receive income (wages, interest, rent, profit)\n- Spend income on goods and services\n\n**2. Businesses (Firms)**\n- Use factors of production to produce goods and services\n- Pay households for the use of their resources\n- Aim to make a profit\n\n**3. Government**\n- Collects taxes (income tax, VAT, company tax) through SARS\n- Provides public goods and services (roads, hospitals, schools, police)\n- Regulates the economy (sets minimum wages, enforces labour laws)\n- Redistributes income through social grants\n\n**4. Foreign Sector (International Trade)**\n- South Africa exports goods (platinum, gold, fruit) and imports goods (electronics, machinery, oil)\n- Trade takes place with countries around the world'),
  q(8, 'SARS collects taxes on behalf of which participant in the economy?',
    ['The government', 'Businesses', 'Households', 'The foreign sector'], 0,
    'SARS (South African Revenue Service) collects taxes such as income tax, VAT, and company tax on behalf of the South African government.'),
  fb(9, 'In a mixed economy, both ___ businesses and the ___ play a role in economic activity.',
    ['private', 'government'],
    'A mixed economy combines private enterprise with government involvement in certain sectors.'),
  t(10, '### The Three Sectors of the Economy\n\n| Sector | Activities | Examples |\n|--------|-----------|----------|\n| **Primary sector** | Extraction of raw materials from nature | Mining (gold, platinum, coal), farming, fishing, forestry |\n| **Secondary sector** | Manufacturing and processing of raw materials into finished goods | Car manufacturing (Toyota SA), food processing (Tiger Brands), construction |\n| **Tertiary sector** | Providing services | Banking (FNB, Standard Bank), retail (Shoprite, Woolworths), tourism, education |\n\nSouth Africa\'s economy has shifted over time. The **tertiary sector** now contributes the most to GDP (Gross Domestic Product), while the **primary sector** has declined in relative importance.\n\n**Interrelationship between sectors:**\n- The primary sector supplies raw materials to the secondary sector\n- The secondary sector processes goods for the tertiary sector to sell\n- All three sectors depend on each other for the economy to function'),
  q(11, 'Toyota South Africa assembling vehicles in Durban is an example of which sector?',
    ['Secondary sector', 'Primary sector', 'Tertiary sector', 'Informal sector'], 0,
    'Manufacturing and assembly of goods falls under the secondary sector. Toyota takes raw materials and components and turns them into finished vehicles.'),
];

// --- Lesson 2: The Circular Flow of the Economy ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## The Circular Flow of the Economy\n\nThe circular flow model shows how money, goods, services, and factors of production flow between the participants in the economy.\n\n### Simple Circular Flow (Two-Sector Model)\n\nIn the simplest model, there are only two participants: **households** and **businesses**.\n\n**Two flows exist between them:**\n\n1. **Real flow (physical flow):** Households supply factors of production (labour, land, capital) to businesses. Businesses supply goods and services to households.\n\n2. **Money flow (monetary flow):** Businesses pay households for factors of production (wages, rent, interest, profit). Households pay businesses for goods and services.\n\nThese flows move in opposite directions, creating a continuous circle.\n\n### The Factor Market and the Goods Market\n\n| Market | What is traded | Direction |\n|--------|---------------|----------|\n| **Factor market** | Factors of production (labour, land, capital) | Households → Businesses |\n| **Goods market** | Goods and services | Businesses → Households |'),
  t(2, '### The Four-Sector Circular Flow\n\nThe full circular flow includes all four participants: households, businesses, government, and the foreign sector.\n\n**Government\'s role:**\n- Collects taxes from households (income tax) and businesses (company tax, VAT)\n- Spends money on public goods and services (grants, infrastructure, salaries of public servants)\n- This is called the government\'s **fiscal policy**\n\n**Foreign sector\'s role:**\n- **Exports:** SA businesses sell goods and services to other countries → money flows IN\n- **Imports:** SA households and businesses buy goods from other countries → money flows OUT\n- If exports > imports: **trade surplus** (positive for the economy)\n- If imports > exports: **trade deficit** (can weaken the rand)\n\n**Injections** (add money into the circular flow):\n- Government spending, exports, investment\n\n**Leakages** (remove money from the circular flow):\n- Taxes, imports, savings'),
  q(3, 'When South Africa exports gold to China, this is an example of:',
    ['An injection into the circular flow', 'A leakage from the circular flow', 'Government spending', 'A factor market transaction'], 0,
    'Exports bring money into the South African economy, so they are an injection into the circular flow.'),
  fb(4, 'Taxes, imports, and savings are called ___ because they remove money from the circular flow. Government spending, exports, and investment are called ___ because they add money.',
    ['leakages', 'injections'],
    'Leakages reduce money circulating in the economy. Injections increase it.'),
  t(5, '### The Government\'s Role in the SA Economy\n\nThe South African government plays a significant role in the economy through:\n\n**1. Providing public goods and services**\n- Roads, bridges, dams (infrastructure)\n- Public schools and hospitals\n- Police and national defence\n- Social grants (child support, old age, disability)\n\n**2. Regulating the economy**\n- Setting minimum wages (National Minimum Wage: currently R27.58 per hour)\n- Enforcing labour laws through the CCMA and Department of Labour\n- Protecting consumers through the Consumer Protection Act\n- Regulating businesses through the Companies Act\n\n**3. Redistributing income**\n- Progressive income tax: higher earners pay a higher percentage\n- Social grants: over 18 million South Africans receive social grants\n- Free basic services: water, electricity, and housing for the poorest households\n\n**4. Managing the economy**\n- The South African Reserve Bank (SARB) controls interest rates and the money supply\n- National Treasury develops the national budget'),
  q(6, 'The CCMA helps resolve disputes between:',
    ['Employers and employees', 'The government and businesses', 'South Africa and other countries', 'Banks and their customers'], 0,
    'The CCMA (Commission for Conciliation, Mediation and Arbitration) resolves labour disputes between employers and employees in South Africa.'),
  t(7, '### Why the Economy Must Grow\n\nEconomic growth means an increase in the total value of goods and services produced in a country (GDP).\n\n**Benefits of economic growth:**\n- More jobs are created (reduces unemployment)\n- Higher incomes for households\n- More tax revenue for the government\n- Improved standard of living\n\n**Challenges facing the SA economy:**\n- High unemployment (especially youth unemployment, over 45%)\n- Inequality (the gap between rich and poor)\n- Load shedding and energy shortages\n- Skills shortages in key sectors\n- Infrastructure backlogs\n\n**GDP (Gross Domestic Product)** measures the total value of all goods and services produced within a country in one year. It is the most common measure of economic performance.\n\n| Measure | What it shows |\n|---------|---------------|\n| GDP | Total output of the economy |\n| GDP per capita | GDP divided by population — shows average output per person |\n| GDP growth rate | How fast the economy is growing (or shrinking) |'),
  fb(8, 'GDP stands for Gross ___ Product. GDP per capita divides the total GDP by the ___.',
    ['Domestic', 'population'],
    'GDP = Gross Domestic Product. GDP per capita = GDP / total population, showing average output per person.'),
  q(9, 'Which of the following is a challenge facing the South African economy?',
    ['High youth unemployment', 'Too many skilled workers', 'Very low inequality', 'Excessive economic growth'], 0,
    'South Africa faces extremely high youth unemployment (over 45%), which is one of the most pressing economic challenges in the country.'),
  t(10, '### Using a Circular Flow Diagram\n\nWhen drawing or interpreting a circular flow diagram, remember:\n\n1. **Arrows show the direction of flow** — goods/services flow one way, money flows the opposite way\n2. **The factor market** is where households sell their labour and other resources to businesses\n3. **The goods market** is where businesses sell their products to households\n4. **Government** connects to both households and businesses through taxes and spending\n5. **The foreign sector** connects through imports and exports\n\n**Key exam tip:** If a question asks you to draw a circular flow, always:\n- Label all four participants\n- Show both the real flow and the money flow\n- Include arrows with labels (e.g., "wages", "goods & services", "taxes", "exports")\n- Show injections and leakages clearly'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Financial Literacy — The Accounting Equation and Source
//            Documents (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The Accounting Equation ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## The Accounting Equation\n\nAccounting is the process of recording, organising, and reporting financial information. Every business, no matter how small, must keep accurate financial records.\n\n### The Basic Accounting Equation\n\n$$\\text{Assets} = \\text{Owner\'s Equity} + \\text{Liabilities}$$\n\nOr equivalently:\n$$\\text{Owner\'s Equity} = \\text{Assets} - \\text{Liabilities}$$\n\n| Term | Definition | Examples |\n|------|-----------|----------|\n| **Assets** | Everything the business owns or is owed | Cash, bank, equipment, stock, debtors |\n| **Owner\'s equity** | The owner\'s financial interest in the business | Capital contributed by the owner |\n| **Liabilities** | Everything the business owes to others | Creditors, bank loan, overdraft |\n\n**The equation must ALWAYS balance.** Every transaction affects at least two items, keeping the equation in balance. This is called the **double-entry principle**.'),
  t(2, '### How Transactions Affect the Equation\n\n**Example:** Thabo starts a business with R50 000 cash.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Cash: R50 000 | = | Capital: R50 000 | + | R0 |\n\n**Transaction 1:** Buys equipment for R12 000 cash.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Cash: R38 000 | = | Capital: R50 000 | + | R0 |\n| Equipment: R12 000 | | | | |\n| **Total: R50 000** | = | **R50 000** | + | **R0** |\n\nCash decreased and equipment increased — both are assets. The equation still balances.\n\n**Transaction 2:** Buys stock on credit from a supplier for R8 000.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Cash: R38 000 | = | Capital: R50 000 | + | Creditors: R8 000 |\n| Equipment: R12 000 | | | | |\n| Stock: R8 000 | | | | |\n| **Total: R58 000** | = | **R50 000** | + | **R8 000** |'),
  q(3, 'A business has assets of R120 000 and liabilities of R45 000. What is the owner\'s equity?',
    ['R75 000', 'R165 000', 'R120 000', 'R45 000'], 0,
    'Owner\'s equity = Assets - Liabilities = R120 000 - R45 000 = R75 000.'),
  fb(4, 'The accounting equation states that Assets = Owner\'s Equity + ___. The equation must always ___.',
    ['Liabilities', 'balance'],
    'Assets = Owner\'s Equity + Liabilities. Every transaction keeps the equation in balance through the double-entry principle.'),
  t(5, '### The Effect of Income and Expenses\n\n**Income** increases owner\'s equity (the business earns more, so the owner\'s share grows).\n**Expenses** decrease owner\'s equity (the business spends money, so the owner\'s share shrinks).\n\n**Transaction 3:** Thabo sells goods for R5 000 cash (the goods cost R3 000).\n- Cash increases by R5 000 (asset increases)\n- Stock decreases by R3 000 (asset decreases)\n- The difference of R2 000 is profit, which increases owner\'s equity\n\n**Transaction 4:** Pays rent of R2 500 cash.\n- Cash decreases by R2 500 (asset decreases)\n- Owner\'s equity decreases by R2 500 (expense reduces the owner\'s interest)\n\n**Summary of effects:**\n\n| Transaction type | Effect on owner\'s equity |\n|-----------------|-------------------------|\n| Income / Revenue | Increases |\n| Expenses | Decreases |\n| Owner invests more capital | Increases |\n| Owner makes drawings (withdrawals) | Decreases |'),
  q(6, 'When a business earns income, the effect on the accounting equation is:',
    ['Assets increase and owner\'s equity increases', 'Assets increase and liabilities increase', 'Assets decrease and owner\'s equity decreases', 'Liabilities decrease and owner\'s equity increases'], 0,
    'Income increases the business\'s assets (e.g. cash received) and also increases owner\'s equity because the business has earned money for the owner.'),
  t(7, '### Classification of Accounts\n\nAll items in the accounting equation can be grouped into five main categories:\n\n| Category | Normal balance | Examples |\n|----------|---------------|----------|\n| **Assets** | Debit | Cash, bank, equipment, stock, debtors |\n| **Owner\'s equity** | Credit | Capital |\n| **Liabilities** | Credit | Creditors, bank loan |\n| **Income** | Credit | Sales, service fees, interest received |\n| **Expenses** | Debit | Rent, salaries, water & electricity, advertising |\n\n**Debit** means the left side of an account.\n**Credit** means the right side of an account.\n\n**Rules:**\n- To **increase** an asset or expense: **Debit** the account\n- To **increase** a liability, owner\'s equity, or income: **Credit** the account\n- To **decrease** an asset or expense: **Credit** the account\n- To **decrease** a liability, owner\'s equity, or income: **Debit** the account'),
  fb(8, 'Assets and expenses have a normal ___ balance. Liabilities, owner\'s equity, and income have a normal ___ balance.',
    ['debit', 'credit'],
    'Assets and expenses sit on the left (debit) side. Liabilities, equity, and income sit on the right (credit) side.'),
  q(9, 'When a business pays rent of R3 000 by EFT, which accounts are affected?',
    ['Rent expense is debited, bank is credited', 'Bank is debited, rent expense is credited', 'Rent expense is debited, capital is credited', 'Cash is debited, rent expense is credited'], 0,
    'Rent is an expense (debit to increase it). The payment from the bank reduces the bank account (credit to decrease an asset).'),
  t(10, '### Drawings\n\n**Drawings** occur when the owner takes money or goods from the business for personal use.\n\n**Effect on the accounting equation:**\n- Assets decrease (cash or stock is removed)\n- Owner\'s equity decreases (the owner is reducing their investment)\n\n**Example:** Thabo withdraws R2 000 cash for personal use.\n- Cash (asset) decreases by R2 000\n- Drawings increase by R2 000 (which reduces owner\'s equity)\n\n**Important:** Drawings are NOT a business expense. They are a reduction in the owner\'s capital investment.\n\nAt the end of the financial year:\n$$\\text{Final capital} = \\text{Opening capital} + \\text{Net profit} - \\text{Drawings}$$'),
];

// --- Lesson 2: Source Documents ---
blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Source Documents\n\nA **source document** is the original document that provides proof that a transaction has taken place. No entry can be made in the accounting records without a source document.\n\n### Common Source Documents\n\n| Document | Purpose | Issued by |\n|----------|---------|----------|\n| **Receipt** | Proof of cash received | The business receiving money |\n| **Cheque** | Payment from a bank account | The person making the payment |\n| **Invoice** | Record of a credit sale or purchase | The seller |\n| **Cash register slip** | Proof of a cash sale | The business |\n| **Credit note** | Adjustment for returned goods or overcharging | The seller |\n| **Debit note** | Request for a credit note (returns) | The buyer |\n| **Deposit slip** | Proof of money deposited into a bank account | The person making the deposit |\n| **EFT notification** | Proof of electronic payment | The bank |'),
  t(2, '### Details on Key Source Documents\n\n**The Invoice**\nAn invoice is issued when goods are sold on credit. It contains:\n- Invoice number\n- Date\n- Name and address of buyer and seller\n- Description and quantity of goods\n- Unit price and total price\n- VAT amount (if the business is VAT-registered)\n- Terms of payment (e.g., 30 days)\n\n**The Receipt**\nA receipt is issued when cash is received. It contains:\n- Receipt number\n- Date\n- Name of the person who paid\n- Amount received (in words and figures)\n- Reason for payment\n- Signature of the person receiving the money\n\n**The Credit Note**\nIssued by the seller when:\n- Goods are returned by the buyer\n- The buyer was overcharged\n- Damaged goods were delivered\n\nA credit note reduces the amount the buyer owes.'),
  q(3, 'A credit note is issued when:',
    ['Goods are returned by the buyer to the seller', 'A business makes a cash sale', 'The owner invests capital', 'The business pays salaries'], 0,
    'A credit note is issued by the seller when goods are returned, the buyer was overcharged, or damaged goods were delivered. It reduces the amount owed.'),
  fb(4, 'An invoice is issued when goods are sold on ___. A receipt is issued when ___ is received.',
    ['credit', 'cash'],
    'Invoices record credit transactions (buy now, pay later). Receipts record cash transactions (payment received immediately).'),
  t(5, '### Cash vs Credit Transactions\n\n| | Cash Transaction | Credit Transaction |\n|---|---|---|\n| Payment timing | Immediately | Later (e.g., 30 days) |\n| Source document | Receipt / Cash register slip | Invoice |\n| Risk | None (payment received) | Risk of non-payment |\n| Journal used | Cash Receipts Journal (CRJ) or Cash Payments Journal (CPJ) | Debtors Journal (DJ) or Creditors Journal (CJ) |\n\n**Debtors** are people who owe the business money (they bought on credit).\n**Creditors** are people to whom the business owes money (the business bought on credit).\n\n**Example:**\n- Thabo sells goods worth R2 000 on credit to Sipho → Sipho is a **debtor**\n- Thabo buys stock worth R5 000 on credit from Patel Wholesalers → Patel Wholesalers is a **creditor**'),
  q(6, 'A person who owes the business money for goods bought on credit is called a:',
    ['Debtor', 'Creditor', 'Supplier', 'Investor'], 0,
    'A debtor is someone who owes the business money. They bought goods or services on credit and have not yet paid.'),
  t(7, '### The Role of Source Documents in the Accounting Cycle\n\nThe accounting cycle follows these steps:\n\n1. **Transaction occurs** → a source document is created\n2. **Record** the transaction in the correct **journal** (book of first entry)\n3. **Post** from the journal to the **ledger** (book of final entry)\n4. **Prepare** a **trial balance** to check that debits equal credits\n\n**Journals used in Grade 9 EMS:**\n\n| Journal | Abbreviation | Records |\n|---------|-------------|--------|\n| Cash Receipts Journal | CRJ | All cash received by the business |\n| Cash Payments Journal | CPJ | All cash paid by the business |\n| Debtors Journal | DJ | All credit sales |\n| Creditors Journal | CJ | All credit purchases |\n| Debtors Allowances Journal | DAJ | Returns from debtors (credit notes issued) |\n| Creditors Allowances Journal | CAJ | Returns to creditors (credit notes received) |'),
  fb(8, 'The journal is called the book of ___ entry. The ledger is called the book of ___ entry.',
    ['first', 'final'],
    'Transactions are first recorded in the journal, then posted to the ledger for final recording.'),
  q(9, 'Which journal is used to record all credit purchases?',
    ['Creditors Journal (CJ)', 'Cash Payments Journal (CPJ)', 'Debtors Journal (DJ)', 'Cash Receipts Journal (CRJ)'], 0,
    'Credit purchases are recorded in the Creditors Journal (CJ). Cash purchases go in the Cash Payments Journal (CPJ).'),
  t(10, '### Filing and Safekeeping of Documents\n\nSource documents must be kept safe because:\n- They provide proof of transactions\n- They are needed for auditing\n- SARS requires businesses to keep records for at least **5 years**\n- They help resolve disputes with customers and suppliers\n\n**Filing methods:**\n- **Alphabetical filing:** Documents filed by name (e.g., customer name)\n- **Numerical filing:** Documents filed by number (e.g., invoice number)\n- **Chronological filing:** Documents filed by date\n\n**Digital records:**\nMany businesses now use electronic filing. EFT notifications, emailed invoices, and accounting software (like Pastel or Sage) store records digitally. Digital backups must be made regularly to prevent data loss.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Financial Literacy — Cash Journals (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Cash Receipts Journal (CRJ) ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## The Cash Receipts Journal (CRJ)\n\nThe **Cash Receipts Journal** records all money received by the business, whether by cash, cheque, or EFT.\n\n### Format of the CRJ\n\n| Doc | Day | Details | Fol | Analysis of Receipts | Bank | Sales | Debtors Control | Sundry Accounts |\n|-----|-----|---------|-----|---------------------|------|-------|----------------|----------------|\n| Rec 01 | 2 | Cash sales | | | 3 500 | 3 500 | | |\n| Rec 02 | 5 | S. Nkosi (debtor) | | | 2 000 | | 2 000 | |\n| Rec 03 | 10 | Rent income | | | 1 500 | | | Rent income 1 500 |\n| Rec 04 | 15 | Cash sales | | | 4 200 | 4 200 | | |\n| | | **Totals** | | | **11 200** | **7 700** | **2 000** | **1 500** |\n\n### Column Explanations\n- **Bank:** The total amount deposited (this column equals the sum of all other columns)\n- **Sales:** Cash sales of goods\n- **Debtors Control:** Money received from debtors (customers who owed us)\n- **Sundry Accounts:** Any other receipts that do not have their own column'),
  t(2, '### How to Record Entries in the CRJ\n\n**Step 1:** Identify the source document (receipt, cash register slip, deposit slip)\n\n**Step 2:** Determine the nature of the transaction:\n- Cash sale → record in the **Sales** column\n- Payment from a debtor → record in the **Debtors Control** column\n- Any other receipt → record in the **Sundry Accounts** column with a description\n\n**Step 3:** Record the total amount in the **Bank** column\n\n**Examples of sundry receipts:**\n- Rent income received\n- Interest received from the bank\n- Commission income\n- Owner contributing additional capital\n\n**Important rules:**\n- Every entry must have a source document number\n- The date is the date of the transaction\n- Every entry appears in the Bank column AND one other column\n- At month-end, total all columns and check: Bank total = Sales + Debtors Control + Sundry total'),
  q(3, 'A debtor, P. Mokoena, pays R3 500 by EFT. In which columns of the CRJ is this recorded?',
    ['Bank column and Debtors Control column', 'Bank column and Sales column', 'Bank column and Sundry Accounts column', 'Sales column and Debtors Control column'], 0,
    'When a debtor pays, the amount goes in the Bank column (money received) and the Debtors Control column (reducing what the debtor owes).'),
  fb(4, 'Cash sales are recorded in the Bank column and the ___ column. Payments from debtors are recorded in the Bank column and the ___ column.',
    ['Sales', 'Debtors Control'],
    'Cash sales go in the Sales column. Debtor payments go in the Debtors Control column. Both also appear in the Bank column.'),
  t(5, '### Worked Example: CRJ for March 2026\n\n**Campusly Stationery** — Transactions for March 2026:\n\n1. 3 March: Cash sales R4 800 (cash register slip 201)\n2. 7 March: Received R2 500 from debtor T. Dlamini (receipt 45)\n3. 12 March: Cash sales R5 200 (cash register slip 202)\n4. 18 March: Rent income received R3 000 (receipt 46)\n5. 22 March: Received R1 800 from debtor A. van Wyk (receipt 47)\n6. 28 March: Cash sales R3 600 (cash register slip 203)\n7. 31 March: Interest received from bank R450 (bank statement)\n\n### Solution:\n\n| Doc | Day | Details | Bank | Sales | Debtors Control | Sundry |\n|-----|-----|---------|------|-------|----------------|--------|\n| CRS 201 | 3 | Cash sales | 4 800 | 4 800 | | |\n| Rec 45 | 7 | T. Dlamini | 2 500 | | 2 500 | |\n| CRS 202 | 12 | Cash sales | 5 200 | 5 200 | | |\n| Rec 46 | 18 | Rent income | 3 000 | | | Rent income 3 000 |\n| Rec 47 | 22 | A. van Wyk | 1 800 | | 1 800 | |\n| CRS 203 | 28 | Cash sales | 3 600 | 3 600 | | |\n| BS | 31 | Interest received | 450 | | | Interest received 450 |\n| | | **Totals** | **21 350** | **13 600** | **4 300** | **3 450** |\n\n**Check:** R13 600 + R4 300 + R3 450 = R21 350 ✓'),
  q(6, 'In the CRJ, if the totals of the Sales, Debtors Control, and Sundry columns do not add up to the Bank total, it means:',
    ['There is an error that must be found and corrected', 'The trial balance will not balance', 'The sundry column is not needed', 'The Bank column is optional'], 0,
    'The Bank column must always equal the sum of all other receipt columns. If it does not, there is a recording error.'),
  t(7, '### Posting from the CRJ to the Ledger\n\nAt the end of the month, the CRJ totals are posted (transferred) to the ledger accounts:\n\n| CRJ Column | Posted to Ledger Account | Debit or Credit |\n|-----------|------------------------|----------------|\n| Bank total | Bank account | Debit (asset increases) |\n| Sales total | Sales account | Credit (income increases) |\n| Debtors Control total | Debtors Control account | Credit (debtors owe less) |\n| Each sundry item | The specific account named | Credit |\n\n**Remember:** In the CRJ, the business is RECEIVING money, so:\n- Bank is debited (money comes in)\n- The source accounts are credited'),
  fb(8, 'When posting CRJ totals to the ledger, the Bank account is ___ and the Sales account is ___.',
    ['debited', 'credited'],
    'Bank is debited because money is coming in (asset increases). Sales is credited because revenue is being earned (income increases).'),
  q(9, 'The Debtors Control column total in the CRJ represents:',
    ['The total amount received from debtors during the month', 'The total amount owed by debtors', 'The total credit sales for the month', 'The total cash sales for the month'], 0,
    'The Debtors Control column in the CRJ records cash received from debtors, reducing the amount they owe.'),
  t(10, '### Common Errors in the CRJ\n\n**Errors to avoid:**\n1. **Recording a credit sale in the CRJ** — Credit sales go in the Debtors Journal, not the CRJ\n2. **Omitting the source document number** — Every entry must have a reference\n3. **Recording the amount in the wrong column** — A debtor payment in the Sales column will cause errors in the ledger\n4. **Not cross-checking totals** — Always verify that Bank = Sales + Debtors Control + Sundry\n5. **Recording bank charges in the CRJ** — Bank charges are a payment, so they go in the CPJ\n\n**Tip for exams:**\n- Read each transaction carefully\n- Identify the source document\n- Decide if the transaction involves money COMING IN (CRJ) or money GOING OUT (CPJ)\n- Only money COMING IN goes in the CRJ'),
];

// --- Lesson 2: Cash Payments Journal (CPJ) ---
blockNum = 0;
const ch3_lesson2 = [
  t(1, '## The Cash Payments Journal (CPJ)\n\nThe **Cash Payments Journal** records all money paid out by the business, whether by cheque, EFT, or cash.\n\n### Format of the CPJ\n\n| Doc | Day | Details | Fol | Bank | Trading Stock | Creditors Control | Salaries/ Wages | Sundry Accounts |\n|-----|-----|---------|-----|------|--------------|------------------|----------------|----------------|\n| Ch 101 | 3 | Cash purchases | | 2 500 | 2 500 | | | |\n| Ch 102 | 8 | Patel Wholesalers | | 4 000 | | 4 000 | | |\n| EFT | 15 | Staff salaries | | 6 200 | | | 6 200 | |\n| Ch 103 | 20 | Rent paid | | 3 500 | | | | Rent expense 3 500 |\n| EFT | 25 | Telkom (telephone) | | 1 200 | | | | Telephone 1 200 |\n| | | **Totals** | | **17 400** | **2 500** | **4 000** | **6 200** | **4 700** |'),
  t(2, '### Column Explanations\n\n- **Bank:** The total amount paid (equals the sum of all other columns)\n- **Trading Stock:** Cash purchases of goods for resale\n- **Creditors Control:** Payments to creditors (suppliers from whom we bought on credit)\n- **Salaries/Wages:** Payments to employees\n- **Sundry Accounts:** Any other payments (rent, telephone, electricity, insurance, stationery, etc.)\n\n### How to Record Entries in the CPJ\n\n**Step 1:** Identify the source document (cheque counterfoil, EFT proof, petty cash voucher)\n\n**Step 2:** Determine the nature of the payment:\n- Cash purchase of stock → **Trading Stock** column\n- Payment to a creditor → **Creditors Control** column\n- Staff wages or salaries → **Salaries/Wages** column\n- Any other payment → **Sundry Accounts** column with a description\n\n**Step 3:** Record the total amount in the **Bank** column\n\n**Check:** Bank total = Trading Stock + Creditors Control + Salaries + Sundry'),
  q(3, 'The business pays R6 500 to a creditor, Maseko Suppliers, by EFT. In which CPJ columns is this recorded?',
    ['Bank column and Creditors Control column', 'Bank column and Trading Stock column', 'Bank column and Sundry Accounts column', 'Creditors Control column and Sundry column'], 0,
    'Paying a creditor records the amount in the Bank column (money going out) and the Creditors Control column (reducing what we owe the creditor).'),
  fb(4, 'Cash purchases of trading stock are recorded in the Bank column and the ___ column. Staff salaries are recorded in the Bank column and the ___ column.',
    ['Trading Stock', 'Salaries/Wages'],
    'Cash purchases go in the Trading Stock column. Employee payments go in the Salaries/Wages column.'),
  t(5, '### Worked Example: CPJ for March 2026\n\n**Campusly Stationery** — Payments for March 2026:\n\n1. 2 March: Cash purchases R3 200 (cheque 150)\n2. 5 March: Paid creditor B. Patel R5 800 (EFT)\n3. 10 March: Paid rent R4 000 (EFT)\n4. 15 March: Staff wages R7 500 (EFT)\n5. 18 March: Paid for advertising R1 200 (cheque 151)\n6. 22 March: Paid Eskom electricity R2 100 (EFT)\n7. 25 March: Paid creditor J. Singh R3 400 (EFT)\n8. 31 March: Bank charges R320 (bank statement)\n\n### Solution:\n\n| Doc | Day | Details | Bank | Stock | Creditors | Wages | Sundry |\n|-----|-----|---------|------|-------|-----------|-------|--------|\n| Ch 150 | 2 | Cash purchases | 3 200 | 3 200 | | | |\n| EFT | 5 | B. Patel | 5 800 | | 5 800 | | |\n| EFT | 10 | Rent | 4 000 | | | | Rent 4 000 |\n| EFT | 15 | Staff wages | 7 500 | | | 7 500 | |\n| Ch 151 | 18 | Advertising | 1 200 | | | | Advertising 1 200 |\n| EFT | 22 | Electricity | 2 100 | | | | Electricity 2 100 |\n| EFT | 25 | J. Singh | 3 400 | | 3 400 | | |\n| BS | 31 | Bank charges | 320 | | | | Bank charges 320 |\n| | | **Totals** | **27 520** | **3 200** | **9 200** | **7 500** | **7 620** |\n\n**Check:** R3 200 + R9 200 + R7 500 + R7 620 = R27 520 ✓'),
  q(6, 'Bank charges of R280 appear on the bank statement. In the CPJ, this is recorded in:',
    ['Bank column and Sundry Accounts column (bank charges)', 'Bank column and Creditors Control column', 'Bank column and Trading Stock column', 'It is not recorded in the CPJ'], 0,
    'Bank charges are an expense paid by the business. They are recorded in the Bank column and Sundry column, described as "bank charges".'),
  t(7, '### Posting from the CPJ to the Ledger\n\nAt the end of the month, the CPJ totals are posted to the ledger accounts:\n\n| CPJ Column | Posted to Ledger Account | Debit or Credit |\n|-----------|------------------------|----------------|\n| Bank total | Bank account | Credit (asset decreases) |\n| Trading Stock total | Trading Stock account | Debit (asset increases) |\n| Creditors Control total | Creditors Control account | Debit (liability decreases) |\n| Salaries/Wages total | Salaries account | Debit (expense increases) |\n| Each sundry item | The specific account named | Debit |\n\n**Remember:** In the CPJ, the business is PAYING money, so:\n- Bank is credited (money goes out)\n- The destination accounts are debited'),
  fb(8, 'When posting CPJ totals to the ledger, the Bank account is ___ and expense accounts are ___.',
    ['credited', 'debited'],
    'Bank is credited because money is going out (asset decreases). Expenses are debited because costs increase (expenses have debit balances).'),
  q(9, 'Which of the following should NOT be recorded in the CPJ?',
    ['A credit purchase of goods from a supplier', 'A cash purchase of stationery', 'Payment of staff wages', 'Payment of water and electricity'], 0,
    'A credit purchase involves no cash payment at the time of purchase, so it is recorded in the Creditors Journal (CJ), not the CPJ.'),
  t(10, '### Effect of Cash Transactions on the Accounting Equation\n\nEvery CRJ and CPJ entry affects the accounting equation:\n\n| Transaction | Asset Effect | Owner\'s Equity / Liability |\n|------------|-------------|---------------------------|\n| Cash sale | Bank ↑ | Sales (income) ↑ = OE ↑ |\n| Cash purchase | Bank ↓, Stock ↑ | No net change |\n| Debtor pays | Bank ↑, Debtors ↓ | No net change |\n| Pay creditor | Bank ↓ | Creditors ↓ (liability decreases) |\n| Pay rent | Bank ↓ | Rent expense ↑ = OE ↓ |\n| Pay salaries | Bank ↓ | Salaries expense ↑ = OE ↓ |\n| Receive rent income | Bank ↑ | Rent income ↑ = OE ↑ |\n\n**Key insight:** Cash journals record CASH movements. Every transaction either increases or decreases the bank account, and always affects at least one other account to keep the equation balanced.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Financial Literacy — The General Ledger and Trial Balance (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: The General Ledger ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## The General Ledger\n\nThe **general ledger** is the book of final entry. All journal totals are posted (transferred) to the ledger. Each account in the ledger collects all the transactions for one specific item.\n\n### T-Account Format\n\nEvery ledger account is presented in a T-account format:\n\n**Bank Account**\n\n| Debit (Dr) | | Credit (Cr) | |\n|------------|---:|------------|---:|\n| CRJ (total receipts) | 21 350 | CPJ (total payments) | 27 520 |\n| | | Balance c/d | |\n\nThe debit side records increases in assets and expenses.\nThe credit side records increases in liabilities, owner\'s equity, and income.\n\n### Steps for Posting\n\n1. Open a T-account for each account\n2. Post the journal totals to the correct side\n3. Use the journal abbreviation as the reference (CRJ, CPJ, DJ, CJ)\n4. Balance each account at month-end'),
  t(2, '### Posting from the CRJ\n\nUsing our earlier CRJ example (totals: Bank R21 350, Sales R13 600, Debtors Control R4 300, Sundry R3 450):\n\n**Bank Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CRJ — Total receipts | 21 350 | | |\n\n**Sales Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ — Cash sales | 13 600 |\n\n**Debtors Control Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ — Payments received | 4 300 |\n\n**Rent Income Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ — Rent received | 3 000 |\n\n**Interest Received Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ — Bank interest | 450 |'),
  q(3, 'When posting the Sales total from the CRJ to the ledger, the Sales account is:',
    ['Credited (income has a credit balance)', 'Debited (sales increase assets)', 'Both debited and credited', 'Not posted — only the Bank account is posted'], 0,
    'Sales is an income account with a normal credit balance. Cash sales are credited to the Sales account in the ledger.'),
  t(4, '### Posting from the CPJ\n\nUsing our CPJ example (totals: Bank R27 520, Stock R3 200, Creditors R9 200, Wages R7 500, Sundry R7 620):\n\n**Bank Account** (continuing from CRJ posting)\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CRJ — Total receipts | 21 350 | CPJ — Total payments | 27 520 |\n\n**Trading Stock Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Cash purchases | 3 200 | | |\n\n**Creditors Control Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Payments to creditors | 9 200 | | |\n\n**Wages Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Staff wages | 7 500 | | |\n\nSundry items (rent R4 000, advertising R1 200, electricity R2 100, bank charges R320) are each debited to their individual accounts.'),
  fb(5, 'In the ledger, the Bank account has a ___ entry from the CRJ totals and a ___ entry from the CPJ totals.',
    ['debit', 'credit'],
    'CRJ receipts are debited to Bank (money in). CPJ payments are credited to Bank (money out).'),
  t(6, '### Balancing a Ledger Account\n\nAt the end of the month, each account must be balanced:\n\n**Steps to balance:**\n1. Total the debit side and the credit side\n2. Find the difference between the two sides\n3. Enter the difference as "Balance c/d" (carried down) on the smaller side\n4. Rule off both sides so they are equal\n5. Bring the balance down: "Balance b/d" (brought down) on the opposite side\n\n**Example: Bank Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CRJ | 21 350 | CPJ | 27 520 |\n| | | Balance c/d | |\n\nDebit total: R21 350\nCredit total: R27 520\nDifference: R27 520 - R21 350 = R6 170\n\nSince the credit side is larger, the balance is on the credit side (overdrawn).\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CRJ | 21 350 | CPJ | 27 520 |\n| Balance c/d (overdrawn) | 6 170 | | |\n| **Total** | **27 520** | **Total** | **27 520** |\n| | | Balance b/d | 6 170 |'),
  q(7, 'If the debit side of the Bank account totals R15 000 and the credit side totals R12 000, the balance is:',
    ['R3 000 debit (favourable)', 'R3 000 credit (overdrawn)', 'R27 000 debit', 'R15 000 credit'], 0,
    'The debit side is larger by R3 000 (R15 000 - R12 000). A debit balance on the Bank account means the business has money in the bank (favourable).'),
  fb(8, 'A debit balance on the Bank account means the business has money ___. A credit balance on the Bank account means the business is ___.',
    ['in the bank', 'overdrawn'],
    'Debit balance = favourable (money available). Credit balance = overdrawn (the business owes the bank).'),
  q(9, 'When balancing a ledger account, "Balance c/d" is written on the:',
    ['Smaller side to make both sides equal', 'Larger side to make both sides equal', 'Debit side only', 'Credit side only'], 0,
    'Balance c/d goes on the smaller side to equalise the totals. Then Balance b/d appears on the opposite side to start the next period.'),
  t(10, '### Types of Ledger Accounts\n\nThe general ledger contains different types of accounts:\n\n| Account Type | Normal Balance | Where it appears |\n|-------------|---------------|------------------|\n| Assets (Bank, Equipment, Stock, Debtors) | Debit | Balance Sheet |\n| Liabilities (Creditors, Loan) | Credit | Balance Sheet |\n| Owner\'s Equity (Capital) | Credit | Balance Sheet |\n| Income (Sales, Rent Income) | Credit | Income Statement |\n| Expenses (Rent, Wages, Electricity) | Debit | Income Statement |\n\n**Balance Sheet accounts** (assets, liabilities, equity) carry their balances forward from one period to the next.\n\n**Income Statement accounts** (income and expenses) are closed off at year-end. Their balances are transferred to the Profit and Loss account.'),
];

// --- Lesson 2: The Trial Balance ---
blockNum = 0;
const ch4_lesson2 = [
  t(1, '## The Trial Balance\n\nA **trial balance** is a list of all the ledger account balances at a specific date. It is used to check that the total debits equal the total credits.\n\n### Purpose of the Trial Balance\n1. To check the **arithmetic accuracy** of the books (debits must equal credits)\n2. To provide a summary of all account balances\n3. To serve as the basis for preparing financial statements\n\n### Format\n\n**Campusly Stationery**\n**Trial Balance on 31 March 2026**\n\n| Account | Fol | Debit (R) | Credit (R) |\n|---------|-----|----------|------------|\n| Bank | B1 | | 6 170 |\n| Capital | B2 | | 50 000 |\n| Trading Stock | B3 | 11 200 | |\n| Equipment | B4 | 12 000 | |\n| Debtors Control | B5 | 3 700 | |\n| Creditors Control | B6 | | 9 200 |\n| Sales | N1 | | 13 600 |\n| Rent Income | N2 | | 3 000 |\n| Interest Received | N3 | | 450 |\n| Wages | N4 | 7 500 | |\n| Rent Expense | N5 | 4 000 | |\n| Advertising | N6 | 1 200 | |\n| Electricity | N7 | 2 100 | |\n| Bank Charges | N8 | 320 | |\n| | | **42 020** | **42 020** |\n\nDebits must ALWAYS equal Credits.'),
  t(2, '### Rules for Preparing a Trial Balance\n\n1. List **every** ledger account that has a balance\n2. Accounts with a **debit balance** go in the debit column\n3. Accounts with a **credit balance** go in the credit column\n4. Total both columns — they must be **equal**\n\n**Which accounts have debit balances?**\n- Assets: Bank (if favourable), Equipment, Stock, Debtors\n- Expenses: Wages, Rent, Electricity, etc.\n\n**Which accounts have credit balances?**\n- Liabilities: Creditors, Loans\n- Owner\'s Equity: Capital\n- Income: Sales, Rent Income, Interest Received\n- Bank (if overdrawn)\n\n**Important:** The Bank account can appear on either side:\n- Debit balance = money in the bank (asset)\n- Credit balance = overdrawn (liability)'),
  q(3, 'The trial balance totals are: Debit R85 000 and Credit R82 000. This means:',
    ['There is an error of R3 000 that must be found', 'The business made a profit of R3 000', 'The business has a loss of R3 000', 'The trial balance is correct'], 0,
    'When debits do not equal credits, there is an error somewhere in the recording or posting process. The R3 000 difference must be investigated.'),
  fb(4, 'In the trial balance, assets and expenses appear in the ___ column, while liabilities, equity, and income appear in the ___ column.',
    ['debit', 'credit'],
    'Assets and expenses have debit balances. Liabilities, owner\'s equity, and income have credit balances.'),
  t(5, '### Errors the Trial Balance CAN Detect\n\nThe trial balance will NOT balance when:\n- A transaction is posted to only one account (not both)\n- An amount is posted to the wrong side (debit instead of credit)\n- Different amounts are posted to the debit and credit sides\n- An account balance is calculated incorrectly\n- An account is omitted from the trial balance\n\n### Errors the Trial Balance CANNOT Detect\n\nEven when the trial balance balances, these errors may still exist:\n\n| Error | Description |\n|-------|------------|\n| **Error of omission** | A transaction is not recorded at all |\n| **Error of commission** | Correct amount, correct side, but wrong person\'s account (e.g., debiting the wrong debtor) |\n| **Error of principle** | Correct amount, correct side, but wrong type of account (e.g., recording equipment purchase as an expense) |\n| **Compensating errors** | Two or more errors cancel each other out |\n| **Error of original entry** | Wrong amount in both accounts (e.g., R540 instead of R450) |\n| **Complete reversal of entries** | Correct accounts, correct amounts, but debits and credits are swopped |'),
  q(6, 'An invoice for R2 300 was recorded as R3 200 in both the debit and credit accounts. This is an error of:',
    ['Original entry', 'Omission', 'Commission', 'Principle'], 0,
    'An error of original entry occurs when the wrong amount is used consistently in all accounts affected. The trial balance still balances because both sides have the same (incorrect) amount.'),
  t(7, '### From Trial Balance to Financial Statements\n\nThe trial balance is used to prepare two financial statements:\n\n**1. Income Statement (Statement of Comprehensive Income)**\nShows income and expenses for a period to determine profit or loss.\n\n$$\\text{Net Profit} = \\text{Total Income} - \\text{Total Expenses}$$\n\n**2. Balance Sheet (Statement of Financial Position)**\nShows assets, liabilities, and owner\'s equity at a specific date.\n\n$$\\text{Assets} = \\text{Owner\'s Equity} + \\text{Liabilities}$$\n\n**From our trial balance:**\n- Total income: R13 600 + R3 000 + R450 = R17 050\n- Total expenses: R7 500 + R4 000 + R1 200 + R2 100 + R320 = R15 120\n- **Net profit: R17 050 - R15 120 = R1 930**'),
  fb(8, 'The Income Statement shows the profit or loss for a ___. The Balance Sheet shows the financial position at a specific ___.',
    ['period', 'date'],
    'Income Statement covers a period (e.g., "for the month ended 31 March"). Balance Sheet is a snapshot at a specific date (e.g., "on 31 March").'),
  q(9, 'Which of the following trial balance items appears on the Balance Sheet?',
    ['Equipment', 'Sales', 'Wages', 'Advertising'], 0,
    'Equipment is an asset and appears on the Balance Sheet. Sales, wages, and advertising are income/expense items that appear on the Income Statement.'),
  t(10, '### Preparing a Balance Sheet from the Trial Balance\n\n**Campusly Stationery**\n**Balance Sheet on 31 March 2026**\n\n| **Assets** | R |\n|-----------|---:|\n| Equipment | 12 000 |\n| Trading stock | 11 200 |\n| Debtors | 3 700 |\n| | |\n| **Total assets** | **26 900** |\n\n| **Owner\'s Equity and Liabilities** | R |\n|-----------------------------------|---:|\n| Capital | 50 000 |\n| Add: Net profit | 1 930 |\n| | 51 930 |\n| Less: Drawings | 0 |\n| **Owner\'s equity** | **51 930** |\n| | |\n| Bank (overdraft) | 6 170 |\n| Creditors | 9 200 |\n| **Current liabilities** | **15 370** |\n| | |\n| **This does not balance** because this is a simplified example. In practice, the opening balances of stock and debtors would need to be included to ensure Assets = OE + Liabilities. |\n\n**Note:** At Grade 9, you must understand the structure. Full Balance Sheet preparation with all adjustments is covered in higher grades.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: The Economy — Price Theory (Demand and Supply) (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Demand and Supply ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Price Theory: Demand and Supply\n\nThe price of goods and services in a market economy is determined by **demand and supply**. Understanding demand and supply helps explain why prices change.\n\n### Demand\n\n**Demand** is the quantity of a good or service that consumers are willing and able to buy at different prices during a specific period.\n\n**The Law of Demand:** When the price of a good rises, the quantity demanded falls (and vice versa). There is an **inverse (negative) relationship** between price and quantity demanded.\n\n**Example: Demand for bread**\n\n| Price per loaf (R) | Quantity demanded (loaves per week) |\n|-------------------|---------------------------------|\n| 10 | 500 |\n| 12 | 400 |\n| 14 | 300 |\n| 16 | 200 |\n| 18 | 100 |\n\nAs the price increases, fewer loaves are demanded. This data creates a **demand curve** that slopes downward from left to right.'),
  t(2, '### Supply\n\n**Supply** is the quantity of a good or service that producers are willing and able to offer for sale at different prices during a specific period.\n\n**The Law of Supply:** When the price of a good rises, the quantity supplied increases (and vice versa). There is a **direct (positive) relationship** between price and quantity supplied.\n\n**Example: Supply of bread**\n\n| Price per loaf (R) | Quantity supplied (loaves per week) |\n|-------------------|---------------------------------|\n| 10 | 100 |\n| 12 | 200 |\n| 14 | 300 |\n| 16 | 400 |\n| 18 | 500 |\n\nAs the price increases, more loaves are offered for sale. This creates a **supply curve** that slopes upward from left to right.\n\n**Why does supply increase with price?**\n- Higher prices mean higher profits for producers\n- More businesses enter the market to earn profit\n- Existing businesses produce more to maximise profits'),
  q(3, 'According to the Law of Demand, when the price of a product increases:',
    ['The quantity demanded decreases', 'The quantity demanded increases', 'The quantity supplied decreases', 'There is no effect on demand'], 0,
    'The Law of Demand states there is an inverse relationship between price and quantity demanded. Higher price = lower quantity demanded.'),
  fb(4, 'The demand curve slopes ___. The supply curve slopes ___.',
    ['downward', 'upward'],
    'Demand curve slopes downward (inverse relationship). Supply curve slopes upward (direct relationship).'),
  t(5, '### Equilibrium Price and Quantity\n\n**Equilibrium** occurs where the demand curve and supply curve intersect. At this point:\n- The quantity demanded equals the quantity supplied\n- There is no surplus and no shortage\n- The market "clears"\n\nFrom our bread example:\n- At R14, quantity demanded = 300 and quantity supplied = 300\n- **Equilibrium price = R14**\n- **Equilibrium quantity = 300 loaves**\n\n### What happens at non-equilibrium prices?\n\n| Situation | Price | Result | Market response |\n|-----------|-------|--------|-----------------|\n| **Surplus** | Above equilibrium (e.g., R18) | Supply > Demand (500 > 100) | Producers lower prices to sell excess stock |\n| **Shortage** | Below equilibrium (e.g., R10) | Demand > Supply (500 > 100) | Producers raise prices as consumers compete for limited goods |\n\nThe market naturally moves toward equilibrium through price adjustments.'),
  q(6, 'When there is a surplus of goods in the market, producers will:',
    ['Lower prices to sell the excess stock', 'Raise prices to make more profit', 'Produce more goods', 'Stop selling goods entirely'], 0,
    'A surplus means supply exceeds demand. Producers lower prices to attract more buyers and reduce excess stock, moving toward equilibrium.'),
  t(7, '### Factors That Shift the Demand Curve\n\nThe demand curve shifts when something other than the product\'s own price changes:\n\n| Factor | Shift direction | Example |\n|--------|----------------|--------|\n| **Income increases** | Right (more demand) | People earn more, so they buy more clothing |\n| **Income decreases** | Left (less demand) | Retrenchments reduce spending |\n| **Price of substitute rises** | Right | If Coca-Cola price rises, demand for Pepsi increases |\n| **Price of complement rises** | Left | If petrol price rises, demand for large cars decreases |\n| **Population increases** | Right | More people means more demand for food |\n| **Tastes/preferences change** | Either | Fashion trends increase demand for certain brands |\n| **Advertising** | Right | Effective marketing increases demand |\n\n**Substitutes:** Goods that can replace each other (Coke and Pepsi, butter and margarine)\n**Complements:** Goods that are used together (petrol and cars, bread and butter)'),
  fb(8, 'Goods that can replace each other are called ___. Goods that are used together are called ___.',
    ['substitutes', 'complements'],
    'Substitutes replace each other (e.g., tea and coffee). Complements are used together (e.g., pens and ink).'),
  t(9, '### Factors That Shift the Supply Curve\n\n| Factor | Shift direction | Example |\n|--------|----------------|--------|\n| **Cost of production decreases** | Right (more supply) | Cheaper raw materials, new technology |\n| **Cost of production increases** | Left (less supply) | Load shedding increases electricity costs |\n| **Number of producers increases** | Right | New bakeries open |\n| **Government subsidies** | Right | Government pays farmers to produce more maize |\n| **Taxes on producers** | Left | Higher sin taxes reduce cigarette supply |\n| **Natural disasters** | Left | Drought reduces agricultural supply |\n| **Technology improves** | Right | Better machines produce goods faster and cheaper |\n\n**South African example:** Load shedding has shifted the supply curve to the left for many businesses because they face higher costs (diesel for generators, lost production time).'),
  q(10, 'A drought in the Western Cape reduces grape production. This causes the supply curve for wine to shift:',
    ['To the left (supply decreases)', 'To the right (supply increases)', 'It does not shift — only the price changes', 'Downward along the existing curve'], 0,
    'A drought is a factor that reduces supply. Less grapes means less wine can be produced, shifting the supply curve to the left.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Entrepreneurship — Sectors and Business Ideas (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Entrepreneurship and Sectors of the Economy ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Entrepreneurship\n\nAn **entrepreneur** is a person who identifies a business opportunity, takes the risk, and starts a business to earn a profit.\n\n### Characteristics of a Successful Entrepreneur\n\n| Characteristic | Description |\n|---------------|------------|\n| **Risk-taker** | Willing to invest money with no guarantee of success |\n| **Innovative** | Creates new ideas, products, or ways of doing things |\n| **Self-motivated** | Driven to work hard without being told |\n| **Creative** | Finds unique solutions to problems |\n| **Determined / Persistent** | Does not give up when facing challenges |\n| **Good communicator** | Can sell ideas and negotiate with people |\n| **Decision-maker** | Makes tough choices quickly and confidently |\n\n### Famous South African Entrepreneurs\n- **Patrice Motsepe** — Mining (African Rainbow Minerals)\n- **Herman Mashaba** — Hair care products (Black Like Me)\n- **Elon Musk** — Born in Pretoria (Tesla, SpaceX)\n- **Adrian Gore** — Insurance (Discovery Health)\n- **Wendy Appelbaum** — Wine and investments'),
  t(2, '### Types of Businesses\n\n**By sector:**\n\n| Sector | Description | Business examples |\n|--------|-----------|------------------|\n| **Formal sector** | Registered businesses, pay taxes, follow regulations | Shoprite, Pick n Pay, Standard Bank |\n| **Informal sector** | Not registered, often small-scale, may not pay taxes | Street vendors, spaza shops, car guards |\n\n**By size:**\n\n| Size | Description | Examples |\n|------|-----------|----------|\n| **SMME (Micro)** | 0–5 employees, turnover under R200 000 | Street vendor, home baker |\n| **Small** | 6–50 employees | Local restaurant, IT company |\n| **Medium** | 51–200 employees | Regional factory, chain of shops |\n| **Large** | 200+ employees | Vodacom, Sasol, Woolworths |\n\n**SMMEs** (Small, Medium, and Micro Enterprises) are extremely important in South Africa because they:\n- Create jobs in a country with high unemployment\n- Contribute to economic growth\n- Develop skills in local communities\n- Reduce poverty and inequality'),
  q(3, 'A spaza shop owner in a township who is not registered with CIPC operates in the:',
    ['Informal sector', 'Formal sector', 'Primary sector', 'Government sector'], 0,
    'An unregistered business that does not pay formal taxes operates in the informal sector. Spaza shops are a common example in South Africa.'),
  fb(4, 'SMME stands for Small, Medium, and ___ Enterprises. SMMEs are important because they create ___ in South Africa.',
    ['Micro', 'jobs'],
    'SMMEs = Small, Medium, and Micro Enterprises. They are a major source of employment creation in the SA economy.'),
  t(5, '### The Role of Each Sector in the Economy\n\n**Primary sector businesses:**\n- Extract raw materials from nature\n- South Africa is rich in minerals: gold, platinum, iron ore, manganese, chrome, coal\n- Agriculture: maize, wheat, citrus, grapes, sugar cane\n- Challenges: fluctuating commodity prices, drought, mining safety\n\n**Secondary sector businesses:**\n- Process raw materials into finished goods\n- SA examples: Sasol (chemicals), ArcelorMittal (steel), SAB (beverages)\n- Challenges: load shedding, high labour costs, competition from imports\n\n**Tertiary sector businesses:**\n- Provide services\n- SA examples: FNB, MTN, Shoprite, Mediclinic\n- The largest sector in SA\'s economy (about 65% of GDP)\n- Growing areas: IT, tourism, financial services\n\n### Interrelationships\nAll three sectors depend on each other:\n- A farmer (primary) sells maize to Tiger Brands (secondary) who processes it into mealie meal, which is sold by Shoprite (tertiary)'),
  q(6, 'Which sector contributes the most to South Africa\'s GDP?',
    ['Tertiary sector (services)', 'Primary sector (mining and agriculture)', 'Secondary sector (manufacturing)', 'Informal sector'], 0,
    'The tertiary sector (services) contributes approximately 65% of South Africa\'s GDP, making it the largest sector.'),
  t(7, '### Identifying Business Opportunities\n\nEntrepreneurs find business opportunities by:\n\n1. **Identifying a need or problem** — What do people need that is not being provided?\n2. **Observing gaps in the market** — Is there an area with no services (e.g., no laundry in a new housing development)?\n3. **Improving on existing products** — Can you make something better, cheaper, or faster?\n4. **Following trends** — What is growing in demand (e.g., solar energy, online tutoring)?\n5. **Using personal skills** — What are you good at that others would pay for?\n\n### Evaluating a Business Idea\n\nBefore starting, an entrepreneur should ask:\n- Is there a **market** (enough customers)?\n- Can I **afford** the start-up costs?\n- Do I have the **skills** needed?\n- Is the business **sustainable** (will it survive long-term)?\n- What is the **competition** like?'),
  fb(8, 'Entrepreneurs find opportunities by identifying a ___ in the market. Before starting a business, they must check if there is a sufficient ___ for their product or service.',
    ['gap', 'market'],
    'A gap in the market means an unmet need. The entrepreneur must verify there are enough potential customers (market) before investing.'),
  q(9, 'Sipho notices there is no affordable printing service near the university campus. He decides to open one. Sipho is acting as:',
    ['An entrepreneur identifying a gap in the market', 'A government official creating jobs', 'A consumer demanding a service', 'An employee of the university'], 0,
    'Sipho is identifying a gap in the market (no nearby printing service) and taking the risk to start a business — classic entrepreneurial behaviour.'),
  t(10, '### Government Support for Entrepreneurs in SA\n\nThe South African government supports entrepreneurs through:\n\n| Organisation | Type of support |\n|-------------|----------------|\n| **SEDA** (Small Enterprise Development Agency) | Business advice, mentoring, training |\n| **SEFA** (Small Enterprise Finance Agency) | Loans and funding for SMMEs |\n| **NEF** (National Empowerment Fund) | Funding for black-owned businesses |\n| **DTI** (Department of Trade and Industry) | Incentive programmes, export support |\n| **NYDA** (National Youth Development Agency) | Youth entrepreneurship grants and training |\n\n**Challenges entrepreneurs face in SA:**\n- Difficulty accessing funding (banks require collateral)\n- Load shedding and unreliable infrastructure\n- Crime and theft\n- Red tape and regulations\n- Competition from imported goods\n- Skills shortages'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Financial Literacy — Credit Transactions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Debtors Journal and Creditors Journal ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Credit Transactions\n\nCredit transactions occur when goods or services are bought or sold now, with payment to follow later. These are recorded in separate journals from cash transactions.\n\n### The Debtors Journal (DJ)\n\nThe **Debtors Journal** records all **credit sales** (goods sold on credit to customers).\n\n**Format of the Debtors Journal:**\n\n| Doc | Day | Debtor | Fol | Amount |\n|-----|-----|--------|-----|-------:|\n| Inv 001 | 3 | T. Mokoena | D1 | 2 500 |\n| Inv 002 | 8 | P. Naidoo | D2 | 3 800 |\n| Inv 003 | 15 | S. Botha | D3 | 1 200 |\n| Inv 004 | 22 | T. Mokoena | D1 | 4 100 |\n| | | **Total** | | **11 600** |\n\n**Source document:** Invoice (issued by the business to the customer)\n\n**Posting:**\n- Total is posted to the **Debtors Control** account (debit) and **Sales** account (credit)\n- Individual amounts are posted to each debtor\'s account in the **Debtors Ledger**'),
  t(2, '### The Creditors Journal (CJ)\n\nThe **Creditors Journal** records all **credit purchases** (goods bought on credit from suppliers).\n\n**Format of the Creditors Journal:**\n\n| Doc | Day | Creditor | Fol | Amount |\n|-----|-----|----------|-----|-------:|\n| Inv 780 | 2 | Patel Wholesalers | C1 | 8 500 |\n| Inv 341 | 10 | Maseko Traders | C2 | 5 200 |\n| Inv 782 | 18 | Patel Wholesalers | C1 | 3 600 |\n| Inv 155 | 25 | Singh Supplies | C3 | 2 900 |\n| | | **Total** | | **20 200** |\n\n**Source document:** Invoice (received from the supplier)\n\n**Posting:**\n- Total is posted to the **Trading Stock** account (debit) and **Creditors Control** account (credit)\n- Individual amounts are posted to each creditor\'s account in the **Creditors Ledger**\n\n### Key Difference\n| | Debtors Journal | Creditors Journal |\n|---|---|---|\n| Records | Credit sales | Credit purchases |\n| Source document | Invoice issued | Invoice received |\n| Debit account | Debtors Control | Trading Stock |\n| Credit account | Sales | Creditors Control |'),
  q(3, 'The business sells goods worth R4 500 on credit to K. Zulu. This transaction is recorded in the:',
    ['Debtors Journal', 'Creditors Journal', 'Cash Receipts Journal', 'Cash Payments Journal'], 0,
    'A credit sale is recorded in the Debtors Journal. K. Zulu becomes a debtor (they owe the business R4 500).'),
  fb(4, 'The Debtors Journal records all credit ___. The Creditors Journal records all credit ___.',
    ['sales', 'purchases'],
    'Debtors Journal = credit sales (customers owe us). Creditors Journal = credit purchases (we owe suppliers).'),
  t(5, '### The National Credit Act (NCA)\n\nThe **National Credit Act (No. 34 of 2005)** protects consumers who buy on credit in South Africa.\n\n**Key provisions:**\n- Credit providers must check if the consumer can afford repayments (**affordability assessment**)\n- All fees, interest rates, and terms must be clearly disclosed\n- Consumers have the right to receive a **credit agreement** in plain language\n- **Reckless lending** is prohibited (giving credit to someone who clearly cannot afford it)\n- The maximum interest rates are regulated\n- Consumers can approach the **National Credit Regulator (NCR)** for complaints\n\n**Important for businesses:**\n- If a business sells on credit, it must comply with the NCA\n- Businesses must keep proper records of credit transactions\n- Businesses cannot charge excessive interest or hidden fees\n\n**Debt counselling:** If a consumer is over-indebted, they can apply for **debt counselling** through a registered debt counsellor. This rearranges repayments to make them more affordable.'),
  q(6, 'The National Credit Act requires credit providers to:',
    ['Check if the consumer can afford the repayments', 'Give credit to everyone who applies', 'Charge the highest possible interest rates', 'Only sell for cash'], 0,
    'The NCA requires an affordability assessment before granting credit. Reckless lending (giving credit to someone who cannot afford it) is prohibited.'),
  t(7, '### Posting Credit Transactions to the Ledger\n\n**From the Debtors Journal:**\n\n1. **Debtors Control** (General Ledger) — Debit with the total (R11 600)\n2. **Sales** (General Ledger) — Credit with the total (R11 600)\n3. **Individual debtor accounts** (Debtors Ledger) — Debit each debtor with their amount\n\n**T. Mokoena (Debtors Ledger)**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| DJ — Inv 001 | 2 500 | | |\n| DJ — Inv 004 | 4 100 | | |\n\n**From the Creditors Journal:**\n\n1. **Trading Stock** (General Ledger) — Debit with the total (R20 200)\n2. **Creditors Control** (General Ledger) — Credit with the total (R20 200)\n3. **Individual creditor accounts** (Creditors Ledger) — Credit each creditor with their amount\n\n**Patel Wholesalers (Creditors Ledger)**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CJ — Inv 780 | 8 500 |\n| | | CJ — Inv 782 | 3 600 |'),
  fb(8, 'In the Debtors Ledger, each debtor\'s account is ___ when they buy on credit. In the Creditors Ledger, each creditor\'s account is ___ when we buy on credit.',
    ['debited', 'credited'],
    'Debtors owe us more (debit increases the amount owed to us). We owe creditors more (credit increases what we owe them).'),
  q(9, 'The Debtors Control account in the general ledger shows the:',
    ['Total amount owed by all debtors combined', 'Amount owed by a specific debtor', 'Total credit purchases', 'Total cash sales'], 0,
    'The Debtors Control is a summary account in the General Ledger that shows the total amount all debtors owe the business.'),
  t(10, '### The Accounting Cycle with Credit Transactions\n\nWith credit transactions included, the full accounting cycle is:\n\n1. **Source documents** → Invoices, receipts, credit notes\n2. **Journals** → CRJ, CPJ, DJ, CJ, DAJ, CAJ\n3. **Ledgers:**\n   - **General Ledger** — Control accounts and all other accounts\n   - **Debtors Ledger** — Individual debtor accounts\n   - **Creditors Ledger** — Individual creditor accounts\n4. **Trial Balance** — List of all General Ledger balances\n5. **Financial Statements** — Income Statement and Balance Sheet\n\n**The three ledgers:**\n| Ledger | Contains | Purpose |\n|--------|---------|--------|\n| General Ledger | All accounts (Bank, Capital, Sales, etc.) | Full record of all transactions |\n| Debtors Ledger | Individual debtor accounts | Track what each customer owes |\n| Creditors Ledger | Individual creditor accounts | Track what we owe each supplier |'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Entrepreneurship — The Business Plan (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Functions of a Business and the Business Plan ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Functions of a Business\n\nEvery business, whether large or small, performs several key functions to operate successfully.\n\n### The Eight Business Functions\n\n| Function | Description | Example |\n|----------|-----------|--------|\n| **General management** | Planning, organising, leading, and controlling the business | The owner sets goals and monitors progress |\n| **Administration** | Record-keeping, filing, correspondence | Keeping invoices, filing tax returns |\n| **Purchasing** | Buying raw materials, stock, and supplies | Ordering inventory from wholesalers |\n| **Marketing** | Promoting and selling products/services | Advertising on social media, setting prices |\n| **Production** | Making or assembling products | A bakery baking bread, a factory assembling phones |\n| **Human resources** | Hiring, training, and managing employees | Recruiting new staff, calculating salaries |\n| **Financing** | Managing money, budgets, and financial records | Keeping books, applying for loans |\n| **Public relations** | Building relationships with the community | Sponsoring school events, charity work |\n\nSmall businesses may have one person performing several functions. Large businesses have entire departments for each function.'),
  t(2, '### Forms of Ownership\n\n| Form | Owners | Liability | Legal personality | Examples |\n|------|--------|-----------|------------------|----------|\n| **Sole proprietor** | 1 person | Unlimited | No | Spaza shop, freelancer |\n| **Partnership** | 2–20 people | Unlimited | No | Law firm, medical practice |\n| **Close Corporation (CC)** | 1–10 members | Limited | Yes | Small family business |\n| **Company (Pty) Ltd** | 1+ shareholders | Limited | Yes | Shoprite, MTN |\n\n**Unlimited liability:** The owner\'s personal assets can be used to pay business debts.\n**Limited liability:** The owners can only lose the money they invested — personal assets are protected.\n**Separate legal personality:** The business is a separate "person" in law — it can own property, enter contracts, and be sued.\n\n**Note:** CCs can no longer be registered in South Africa (since the Companies Act of 2008), but existing CCs are still allowed to operate. New businesses must register as a Private Company (Pty) Ltd with CIPC.'),
  q(3, 'Which form of business ownership offers limited liability and separate legal personality?',
    ['Private Company (Pty) Ltd', 'Sole proprietorship', 'Partnership', 'All of the above'], 0,
    'A Private Company (Pty) Ltd has separate legal personality and offers limited liability to shareholders. Sole proprietors and partnerships have unlimited liability.'),
  fb(4, 'A sole proprietor has ___ liability, meaning personal assets can be used to pay business debts. A (Pty) Ltd company has ___ liability, protecting the owners\' personal assets.',
    ['unlimited', 'limited'],
    'Sole proprietors risk personal assets. Company shareholders can only lose their investment.'),
  t(5, '### The Business Plan\n\nA **business plan** is a detailed document that describes the business, its goals, strategies, and financial projections.\n\n**Why write a business plan?**\n- To plan the business before investing money\n- To attract investors or apply for a bank loan\n- To set clear goals and strategies\n- To identify potential risks and challenges\n- To guide decision-making\n\n### Sections of a Business Plan\n\n| Section | Content |\n|---------|--------|\n| **1. Cover page** | Business name, logo, date, owner\'s contact details |\n| **2. Executive summary** | Brief overview of the entire plan (written last) |\n| **3. Business description** | What the business does, its mission, vision, and values |\n| **4. Market analysis** | Target market, competitors, market size |\n| **5. Marketing plan** | Product, price, place, promotion (the 4 Ps) |\n| **6. Production/operations plan** | How goods/services will be produced or delivered |\n| **7. Management plan** | Who runs the business, their skills and experience |\n| **8. Financial plan** | Start-up costs, projected income, cash flow, break-even |\n| **9. SWOT analysis** | Strengths, weaknesses, opportunities, threats |'),
  q(6, 'The executive summary of a business plan should be written:',
    ['Last, after all other sections are complete', 'First, before any other section', 'Only if the business needs a loan', 'By the bank, not the entrepreneur'], 0,
    'The executive summary provides an overview of the entire business plan. It should be written last so it can summarise all sections accurately.'),
  t(7, '### SWOT Analysis\n\nA **SWOT analysis** evaluates the business\'s internal strengths and weaknesses and external opportunities and threats.\n\n| | Positive | Negative |\n|---|---------|----------|\n| **Internal** (within the business\'s control) | **Strengths** | **Weaknesses** |\n| **External** (outside the business\'s control) | **Opportunities** | **Threats** |\n\n**Example: A new tutoring business in Soweto**\n\n| Strengths | Weaknesses |\n|-----------|------------|\n| Owner is a qualified teacher | Limited start-up capital |\n| Low overhead costs (work from home) | No brand recognition |\n| High demand for tutoring | Only one tutor (capacity limited) |\n\n| Opportunities | Threats |\n|--------------|--------|\n| Growing demand for maths and science tutoring | Competition from online tutoring platforms |\n| Partnership with local schools | Load shedding (affects online tools) |\n| NYDA funding available | Economic downturn (families cut back) |'),
  fb(8, 'In a SWOT analysis, strengths and weaknesses are ___ factors. Opportunities and threats are ___ factors.',
    ['internal', 'external'],
    'Internal factors are within the business\'s control (strengths, weaknesses). External factors are outside its control (opportunities, threats).'),
  q(9, 'Load shedding affecting a business is an example of:',
    ['A threat (external, negative)', 'A weakness (internal, negative)', 'A strength (internal, positive)', 'An opportunity (external, positive)'], 0,
    'Load shedding is outside the business\'s control (external) and has a negative impact, making it a threat in the SWOT analysis.'),
  t(10, '### The Marketing Mix (4 Ps)\n\nThe **marketing mix** describes the four key decisions in marketing a product:\n\n| P | Element | Questions to answer |\n|---|---------|--------------------|\n| **Product** | What you sell | What features does it have? What makes it different? |\n| **Price** | What you charge | Is it affordable for the target market? What are competitors charging? |\n| **Place** | Where you sell | Where will customers find it? (shop, online, door-to-door) |\n| **Promotion** | How you advertise | Social media, flyers, word of mouth, radio? |\n\n**Example: A biltong business**\n- **Product:** Beef biltong in 100g, 250g, and 500g packs\n- **Price:** R55 per 100g (competitive with Woolworths)\n- **Place:** Local market, WhatsApp orders, delivery in Johannesburg\n- **Promotion:** Instagram page, sampling at community events, word of mouth\n\n**Pricing strategies:**\n- **Cost-plus pricing:** Cost + mark-up percentage = selling price\n- **Competitive pricing:** Price similar to competitors\n- **Penetration pricing:** Start with low prices to attract customers, then increase'),
];

// --- Lesson 2: The Financial Plan and Start-up Costs ---
blockNum = 0;
const ch8_lesson2 = [
  t(1, '## The Financial Plan\n\nThe **financial plan** is one of the most important sections of the business plan. It shows whether the business will be financially viable.\n\n### Start-Up Costs\n\nStart-up costs are the once-off expenses needed to start a business before it earns any income.\n\n**Example: Campusly Tutoring — Start-up Costs**\n\n| Item | Amount (R) |\n|------|----------:|\n| Registration with CIPC | 175 |\n| Laptop computer | 8 500 |\n| Printer and ink | 3 200 |\n| Furniture (desk, chairs) | 4 500 |\n| Stationery and textbooks | 2 800 |\n| Marketing (flyers, website) | 3 500 |\n| First month\'s rent | 4 000 |\n| Transport (first month) | 1 200 |\n| **Total start-up costs** | **27 875** |\n\n### Sources of Funding\n\n| Source | Description |\n|-------|------------|\n| **Own savings** | The safest — no debt, no interest |\n| **Family and friends** | Informal loans — may strain relationships |\n| **Bank loan** | Formal loan with interest — requires collateral |\n| **Government grants** | SEDA, NYDA — often free but competitive |\n| **Investors** | Give up a share of ownership in exchange for money |'),
  t(2, '### Projected Income Statement\n\nA projected income statement estimates the business\'s expected income and expenses for the first year.\n\n**Campusly Tutoring — Projected Income Statement (Year 1)**\n\n| | Monthly (R) | Annual (R) |\n|---|---:|---:|\n| **Income** | | |\n| Tutoring fees (20 students x R500) | 10 000 | 120 000 |\n| Exam preparation workshops | 2 000 | 24 000 |\n| **Total income** | **12 000** | **144 000** |\n| **Expenses** | | |\n| Rent | 4 000 | 48 000 |\n| Transport | 1 200 | 14 400 |\n| Stationery and printing | 500 | 6 000 |\n| Electricity | 800 | 9 600 |\n| Marketing | 600 | 7 200 |\n| Phone and data | 500 | 6 000 |\n| **Total expenses** | **7 600** | **91 200** |\n| **Net profit** | **4 400** | **52 800** |\n\nThis shows the business should earn a profit of R52 800 in Year 1, which is a good start for a small tutoring business.'),
  q(3, 'Which of the following is a start-up cost?',
    ['Registration with CIPC', 'Monthly rent for the second year', 'Sales revenue from customers', 'Profit earned in the first month'], 0,
    'Start-up costs are once-off expenses needed before the business begins operating. CIPC registration is a once-off cost to legally register the business.'),
  fb(4, 'A projected income statement estimates the expected ___ and expenses for a future period. The difference between total income and total expenses is the ___.',
    ['income', 'net profit'],
    'The projected income statement forecasts future income and expenses. Net profit = total income - total expenses.'),
  t(5, '### Cash Flow Projection\n\nA **cash flow projection** shows when money is expected to come in and go out, month by month.\n\n**Why is this important?**\n- A business can be profitable but still run out of cash (cash flow crisis)\n- Expenses are often paid before income is received\n- Seasonal businesses earn more in certain months\n\n**Example:**\n\n| | Month 1 | Month 2 | Month 3 |\n|---|---:|---:|---:|\n| Opening balance | 10 000 | 2 400 | 6 800 |\n| + Income received | 8 000 | 12 000 | 12 000 |\n| - Expenses paid | (15 600) | (7 600) | (7 600) |\n| **Closing balance** | **2 400** | **6 800** | **11 200** |\n\n**Note:** Month 1 has high expenses because of start-up costs. The business needs enough starting capital to survive the early months.\n\n**Key rule:** The closing balance of one month = the opening balance of the next month.'),
  q(6, 'A business has an opening balance of R5 000, receives R8 000 in income, and pays R10 000 in expenses. The closing balance is:',
    ['R3 000', 'R5 000', 'R13 000', 'R23 000'], 0,
    'Closing balance = Opening balance + Income - Expenses = R5 000 + R8 000 - R10 000 = R3 000.'),
  t(7, '### Break-Even Analysis\n\nThe **break-even point** is the level of sales where the business covers all its costs — no profit and no loss.\n\n$$\\text{Break-even} = \\frac{\\text{Total fixed costs}}{\\text{Selling price per unit} - \\text{Variable cost per unit}}$$\n\n**Example: Campusly Tutoring**\n- Fixed costs per month: R5 100 (rent, phone, marketing)\n- Variable cost per student: R50 (printing, stationery per student)\n- Fee per student: R500\n\nBreak-even = R5 100 / (R500 - R50) = R5 100 / R450 = **11.3 students**\n\nThis means the business needs at least **12 students** to cover its costs. With 20 students, it is well above break-even.\n\n### Fixed vs Variable Costs\n| Type | Description | Examples |\n|------|-----------|----------|\n| **Fixed costs** | Stay the same regardless of how many students | Rent, marketing, phone |\n| **Variable costs** | Change based on number of students | Printing, stationery per student |'),
  fb(8, 'At the break-even point, total income equals total ___. Fixed costs remain the same regardless of the number of ___ served.',
    ['costs', 'customers'],
    'Break-even = no profit, no loss (income = costs). Fixed costs do not change with the volume of business.'),
  q(9, 'A business has fixed costs of R8 000 per month. The selling price is R200 per unit and the variable cost is R120 per unit. How many units must be sold to break even?',
    ['100 units', '80 units', '40 units', '200 units'], 0,
    'Break-even = Fixed costs / (Selling price - Variable cost) = R8 000 / (R200 - R120) = R8 000 / R80 = 100 units.'),
  t(10, '### Presenting the Business Plan\n\nWhen presenting a business plan to potential investors or banks:\n\n1. **Be professional** — neat document, clear headings, correct spelling\n2. **Be realistic** — do not overestimate income or underestimate expenses\n3. **Know your numbers** — be able to explain every figure in the financial plan\n4. **Show passion** — investors invest in people as much as in ideas\n5. **Prepare for questions** — "What if you get fewer customers than expected?"\n6. **Include supporting documents** — quotations, market research, qualifications\n\n**Common mistakes in business plans:**\n- Ignoring competition ("there is no competition" is never true)\n- Underestimating expenses (forgetting about insurance, maintenance, SARS)\n- No market research ("everyone will want my product" is not evidence)\n- No contingency plan (what happens if things go wrong?)'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Financial Literacy — Debtors and Creditors Ledger (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Subsidiary Journals and Ledgers ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Debtors Allowances and Creditors Allowances Journals\n\nWhen goods are returned after a credit transaction, the business needs to record the return using an allowance journal.\n\n### Debtors Allowances Journal (DAJ)\n\nRecords **credit notes issued** to debtors when they return goods that were sold on credit.\n\n**Format:**\n\n| Doc | Day | Debtor | Fol | Amount |\n|-----|-----|--------|-----|-------:|\n| CN 01 | 5 | T. Mokoena | D1 | 600 |\n| CN 02 | 18 | P. Naidoo | D2 | 1 200 |\n| | | **Total** | | **1 800** |\n\n**Posting:**\n- **Sales Returns** (or Sales Allowances) — Debit R1 800\n- **Debtors Control** — Credit R1 800\n- Individual debtor accounts in the Debtors Ledger — Credit\n\n**Effect:** The debtor now owes less because they returned goods.'),
  t(2, '### Creditors Allowances Journal (CAJ)\n\nRecords **credit notes received** from creditors when the business returns goods that were purchased on credit.\n\n**Format:**\n\n| Doc | Day | Creditor | Fol | Amount |\n|-----|-----|----------|-----|-------:|\n| CN 45 | 8 | Patel Wholesalers | C1 | 1 500 |\n| CN 12 | 20 | Singh Supplies | C3 | 800 |\n| | | **Total** | | **2 300** |\n\n**Posting:**\n- **Creditors Control** — Debit R2 300 (we owe less)\n- **Trading Stock** — Credit R2 300 (stock returned reduces our stock)\n- Individual creditor accounts in the Creditors Ledger — Debit\n\n**Effect:** We now owe the creditor less because we returned goods.\n\n### Summary of All Six Journals\n\n| Journal | Source Document | Debit Account | Credit Account |\n|---------|----------------|--------------|----------------|\n| CRJ | Receipt | Bank | Sales / Debtors / Sundry |\n| CPJ | Cheque / EFT | Stock / Creditors / Expenses | Bank |\n| DJ | Invoice (issued) | Debtors Control | Sales |\n| CJ | Invoice (received) | Trading Stock | Creditors Control |\n| DAJ | Credit note (issued) | Sales Returns | Debtors Control |\n| CAJ | Credit note (received) | Creditors Control | Trading Stock |'),
  q(3, 'The business receives a credit note from a supplier for R2 000 worth of goods returned. This is recorded in the:',
    ['Creditors Allowances Journal (CAJ)', 'Debtors Allowances Journal (DAJ)', 'Cash Receipts Journal (CRJ)', 'Creditors Journal (CJ)'], 0,
    'When the business returns goods to a creditor and receives a credit note, it is recorded in the CAJ. The amount we owe the creditor is reduced.'),
  fb(4, 'The Debtors Allowances Journal records credit notes ___ to debtors. The Creditors Allowances Journal records credit notes ___ from creditors.',
    ['issued', 'received'],
    'DAJ = credit notes we issue (reducing what debtors owe us). CAJ = credit notes we receive (reducing what we owe creditors).'),
  t(5, '### The Debtors Ledger (Subsidiary Ledger)\n\nThe **Debtors Ledger** contains a separate account for each debtor. It shows all transactions with that debtor.\n\n**T. Mokoena — Debtors Ledger Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| DJ — Inv 001 | 2 500 | DAJ — CN 01 | 600 |\n| DJ — Inv 004 | 4 100 | CRJ — Payment | 3 000 |\n| | | Balance c/d | 3 000 |\n| **Total** | **6 600** | **Total** | **6 600** |\n| Balance b/d | 3 000 | | |\n\n**T. Mokoena still owes the business R3 000.**\n\n**The Debtors Control account** in the General Ledger shows the total of ALL debtors combined. The total of all individual debtor accounts in the Debtors Ledger must equal the Debtors Control balance.'),
  t(6, '### The Creditors Ledger (Subsidiary Ledger)\n\nThe **Creditors Ledger** contains a separate account for each creditor.\n\n**Patel Wholesalers — Creditors Ledger Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CAJ — CN 45 | 1 500 | CJ — Inv 780 | 8 500 |\n| CPJ — Payment | 5 800 | CJ — Inv 782 | 3 600 |\n| Balance c/d | 4 800 | | |\n| **Total** | **12 100** | **Total** | **12 100** |\n| | | Balance b/d | 4 800 |\n\n**The business still owes Patel Wholesalers R4 800.**\n\n### Control Account Reconciliation\n\nThe totals must agree:\n- Sum of all individual debtor balances = Debtors Control balance\n- Sum of all individual creditor balances = Creditors Control balance\n\nIf they do not agree, there is a posting error that must be found.'),
  q(7, 'The Debtors Control account has a balance of R15 000. The individual debtor accounts in the Debtors Ledger total R14 500. This means:',
    ['There is a posting error of R500 that must be investigated', 'The trial balance will still balance', 'The debtors have overpaid', 'R500 should be written off as bad debts'], 0,
    'The Debtors Control total must equal the sum of all individual debtor accounts. A difference of R500 indicates a posting error.'),
  fb(8, 'The Debtors Control account is found in the ___ Ledger. Individual debtor accounts are found in the ___ Ledger.',
    ['General', 'Debtors'],
    'The General Ledger has the Debtors Control (summary) account. The Debtors Ledger has a separate account for each individual debtor.'),
  q(9, 'When a debtor returns goods and is issued a credit note, the Debtors Control account is:',
    ['Credited (the debtor owes less)', 'Debited (the debtor owes more)', 'Not affected', 'Closed off'], 0,
    'A credit note reduces the amount the debtor owes. The Debtors Control account is credited (decreased) to reflect this.'),
  t(10, '### The Complete Picture: All Journals and Ledgers\n\n**Flow of information:**\n\n```\nSource Documents → Journals → Ledgers → Trial Balance → Financial Statements\n```\n\n**Six journals** feed into **three ledgers:**\n\n| Journals | Ledger |\n|---------|--------|\n| CRJ, CPJ, DJ, CJ, DAJ, CAJ | General Ledger (control accounts + all other accounts) |\n| DJ, DAJ, CRJ (debtor payments) | Debtors Ledger (individual debtors) |\n| CJ, CAJ, CPJ (creditor payments) | Creditors Ledger (individual creditors) |\n\n**Key principle:** The General Ledger is the master record. The Debtors and Creditors Ledgers are subsidiary (supporting) ledgers that provide detail.\n\n**At any time:**\n- Debtors Control balance (GL) = Total of all debtor balances (DL)\n- Creditors Control balance (GL) = Total of all creditor balances (CL)'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Financial Literacy — Posting to General Ledger and Creditors
//             Ledger (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Posting Cash Payments Journal to Ledgers ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Posting the Cash Payments Journal (CPJ) to the General Ledger and Creditors Ledger\n\nThe CPJ records all cash payments. At month-end, these must be posted to the General Ledger and Creditors Ledger.\n\n### Worked Example: CPJ for April 2026\n\n**Campusly Trading — CPJ April 2026**\n\n| Doc | Day | Details | Bank | Stock | Creditors | Wages | Sundry |\n|-----|-----|---------|------|-------|-----------|-------|--------|\n| EFT | 2 | Cash purchases | 4 500 | 4 500 | | | |\n| EFT | 5 | Patel Wholesalers | 3 200 | | 3 200 | | |\n| EFT | 10 | Maseko Traders | 2 800 | | 2 800 | | |\n| EFT | 15 | Staff wages | 8 000 | | | 8 000 | |\n| EFT | 18 | Cash purchases | 2 200 | 2 200 | | | |\n| EFT | 20 | Rent | 5 000 | | | | Rent 5 000 |\n| EFT | 25 | Electricity | 1 800 | | | | Electricity 1 800 |\n| BS | 30 | Bank charges | 350 | | | | Bank charges 350 |\n| | | **Totals** | **27 850** | **6 700** | **6 000** | **8 000** | **7 150** |'),
  t(2, '### Posting to the General Ledger\n\n**Bank Account (General Ledger)**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CPJ (April) | 27 850 |\n\n**Trading Stock Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Cash purchases | 6 700 | | |\n\n**Creditors Control Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Creditor payments | 6 000 | | |\n\n**Wages Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Staff wages | 8 000 | | |\n\n**Rent Expense Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Rent paid | 5 000 | | |\n\n**Electricity Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Electricity | 1 800 | | |\n\n**Bank Charges Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Bank charges | 350 | | |'),
  q(3, 'When posting the CPJ to the General Ledger, the Creditors Control account is:',
    ['Debited (liability decreases when we pay creditors)', 'Credited (liability increases when we pay creditors)', 'Not affected', 'Debited and credited'], 0,
    'Paying creditors reduces what we owe them. The Creditors Control (a liability) is debited to show the decrease.'),
  t(4, '### Posting to the Creditors Ledger\n\nEach individual creditor payment from the CPJ must be posted to the creditor\'s account in the Creditors Ledger.\n\n**Patel Wholesalers (Creditors Ledger)**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Payment (5 April) | 3 200 | | |\n\n**Maseko Traders (Creditors Ledger)**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Payment (10 April) | 2 800 | | |\n\n**Important:**\n- The CPJ **Creditors Control column total** (R6 000) is posted to the **General Ledger**\n- The **individual amounts** (R3 200 and R2 800) are posted to the **Creditors Ledger**\n- These must agree: R3 200 + R2 800 = R6 000 ✓\n\n### Double posting rule:\n| Where | What is posted | Amount |\n|-------|---------------|--------|\n| General Ledger — Creditors Control | Column total | R6 000 (Dr) |\n| Creditors Ledger — Patel | Individual amount | R3 200 (Dr) |\n| Creditors Ledger — Maseko | Individual amount | R2 800 (Dr) |'),
  fb(5, 'The Creditors Control column total is posted to the ___. Individual creditor amounts are posted to the ___.',
    ['General Ledger', 'Creditors Ledger'],
    'The General Ledger gets the total. The Creditors Ledger gets individual amounts. The individual amounts must add up to the total.'),
  t(6, '### Posting from Multiple Journals\n\nIn practice, the Creditors Control account receives entries from several journals:\n\n**Creditors Control Account (General Ledger)**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ — Payments to creditors | 6 000 | CJ — Credit purchases | 20 200 |\n| CAJ — Returns to creditors | 2 300 | | |\n| Balance c/d | 11 900 | | |\n| **Total** | **20 200** | **Total** | **20 200** |\n| | | Balance b/d | 11 900 |\n\n**The business owes its creditors a total of R11 900.**\n\n**Verify:** CJ (credit purchases) R20 200 - CPJ (payments) R6 000 - CAJ (returns) R2 300 = R11 900 ✓'),
  q(7, 'The Creditors Control account has entries from the CJ (R15 000 credit), CPJ (R8 000 debit), and CAJ (R1 500 debit). The balance is:',
    ['R5 500 credit (we owe creditors R5 500)', 'R5 500 debit', 'R24 500 credit', 'R15 000 credit'], 0,
    'Credits: R15 000 (purchases). Debits: R8 000 (payments) + R1 500 (returns) = R9 500. Balance = R15 000 - R9 500 = R5 500 credit.'),
  fb(8, 'The Creditors Journal adds entries to the ___ side of the Creditors Control account. The CPJ and CAJ add entries to the ___ side.',
    ['credit', 'debit'],
    'CJ records credit purchases (credit to Creditors Control). CPJ and CAJ reduce what we owe (debit to Creditors Control).'),
  t(9, '### The Debtors Control Account — Complete View\n\nSimilarly, the Debtors Control receives entries from multiple journals:\n\n**Debtors Control Account (General Ledger)**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| DJ — Credit sales | 11 600 | CRJ — Debtor payments | 4 300 |\n| | | DAJ — Returns from debtors | 1 800 |\n| | | Balance c/d | 5 500 |\n| **Total** | **11 600** | **Total** | **11 600** |\n| Balance b/d | 5 500 | | |\n\n**Debtors owe the business a total of R5 500.**\n\n**Verify:** DJ (credit sales) R11 600 - CRJ (payments) R4 300 - DAJ (returns) R1 800 = R5 500 ✓'),
  q(10, 'The total of all individual debtor balances in the Debtors Ledger should equal the balance of the:',
    ['Debtors Control account in the General Ledger', 'Creditors Control account in the General Ledger', 'Bank account in the General Ledger', 'Sales account in the General Ledger'], 0,
    'The Debtors Ledger totals must match the Debtors Control account balance. This confirms that all individual postings agree with the control total.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: The Economy — Trade Unions (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Trade Unions and Labour Relations ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Trade Unions\n\nA **trade union** is an organisation formed by workers to protect their rights, improve their working conditions, and negotiate better wages.\n\n### Why Workers Join Trade Unions\n- **Collective bargaining:** Workers negotiate as a group (stronger than negotiating alone)\n- **Protection:** Against unfair dismissal, unsafe working conditions, and exploitation\n- **Better wages:** Unions negotiate annual wage increases\n- **Benefits:** Legal advice, funeral cover, education funds\n- **Workplace representation:** Shop stewards represent workers in disputes\n\n### Major Trade Unions in South Africa\n\n| Trade Union | Full Name | Sector |\n|------------|-----------|--------|\n| **COSATU** | Congress of South African Trade Unions | Federation (multiple industries) |\n| **FEDUSA** | Federation of Unions of South Africa | Federation (multiple industries) |\n| **SAFTU** | South African Federation of Trade Unions | Federation (multiple industries) |\n| **SADTU** | South African Democratic Teachers\' Union | Education |\n| **NUM** | National Union of Mineworkers | Mining |\n| **NEHAWU** | National Education, Health and Allied Workers\' Union | Public sector |'),
  t(2, '### The Labour Relations Act (LRA)\n\nThe **Labour Relations Act (No. 66 of 1995)** is the most important labour law in South Africa. It governs the relationship between employers, employees, and trade unions.\n\n**Key provisions:**\n\n| Right | Description |\n|-------|------------|\n| **Freedom of association** | Workers have the right to join (or not join) a trade union |\n| **Right to strike** | Workers may strike (stop working) if legal procedures are followed |\n| **Right to lock out** | Employers may lock out workers during a dispute |\n| **Protection against unfair dismissal** | Workers cannot be fired without a valid reason and fair procedure |\n| **Collective bargaining** | Unions and employers must negotiate in good faith |\n\n### The CCMA\n\nThe **Commission for Conciliation, Mediation and Arbitration (CCMA)** resolves labour disputes:\n\n1. **Conciliation:** A commissioner helps the parties reach an agreement\n2. **Mediation:** A neutral third party suggests solutions\n3. **Arbitration:** A commissioner makes a binding decision if conciliation fails'),
  q(3, 'The right of workers to stop working in protest over wages or conditions is called a:',
    ['Strike', 'Lock out', 'Dismissal', 'Arbitration'], 0,
    'A strike is when workers collectively stop working to put pressure on the employer. It must follow legal procedures under the LRA.'),
  fb(4, 'The Labour Relations Act gives workers the right to join a ___. The CCMA resolves labour ___ between employers and employees.',
    ['trade union', 'disputes'],
    'Workers have freedom of association (right to join a union). The CCMA provides dispute resolution services.'),
  t(5, '### The Effect of Trade Unions on Businesses\n\n**Positive effects:**\n- Unions provide a formal channel for communication between workers and management\n- Disputes are resolved peacefully through negotiation rather than wild strikes\n- Unions help enforce health and safety standards\n- Workers feel valued, which can improve productivity and loyalty\n\n**Negative effects:**\n- Wage increases demanded by unions increase the cost of production\n- Strikes disrupt production and cause financial losses\n- Unions may resist necessary changes (like automation or restructuring)\n- Businesses may relocate to countries with weaker labour laws\n\n### The Effect of Trade Unions on the Economy\n\n**Positive:**\n- Higher wages increase consumer spending, which stimulates economic growth\n- Unions reduce inequality by ensuring fair wages for lower-income workers\n- They promote sustainable economic growth through decent work\n\n**Negative:**\n- Excessive wage demands can cause inflation (higher costs passed on to consumers)\n- Violent strikes damage infrastructure and discourage investment\n- High labour costs can make South African goods less competitive globally'),
  q(6, 'Which of the following is a positive effect of trade unions on a business?',
    ['Providing a formal channel for worker-management communication', 'Increasing the cost of production', 'Disrupting production through strikes', 'Resisting automation and restructuring'], 0,
    'Unions provide a structured way for workers and management to communicate, reducing the likelihood of wild (illegal) strikes and improving workplace relations.'),
  t(7, '### Strikes and Lock-outs\n\n**A legal (protected) strike must follow these steps:**\n1. The issue must be referred to the CCMA for conciliation\n2. If conciliation fails, a certificate of non-resolution is issued\n3. The union gives the employer 48 hours\' written notice (7 days for essential services)\n4. Workers may then strike legally — they cannot be dismissed for striking\n\n**An unprotected (illegal) strike:**\n- Does not follow the legal procedures\n- Workers can be dismissed\n- The union can be sued for damages\n\n**A lock-out:**\n- The employer\'s response to a dispute\n- The employer closes the workplace and workers cannot come to work\n- Must also follow legal procedures\n\n### Recent SA examples:\n- Marikana mine strike (2012) — resulted in tragic loss of life\n- National public sector strikes — affecting hospitals and schools\n- Municipal worker strikes — affecting service delivery'),
  fb(8, 'A protected strike follows the procedures set out in the ___. An unprotected strike is ___ and workers may be dismissed.',
    ['LRA', 'illegal'],
    'The LRA sets out the procedures for a legal strike. Failure to follow these procedures makes the strike unprotected/illegal.'),
  q(9, 'Before a union can call a legal strike, the dispute must first be referred to the:',
    ['CCMA for conciliation', 'Police for investigation', 'National Treasury for funding', 'SARS for tax review'], 0,
    'The first step before a legal strike is referral to the CCMA for conciliation. Only after conciliation fails can a strike be called.'),
  t(10, '### Other Important Labour Laws\n\n| Law | Purpose |\n|-----|--------|\n| **Basic Conditions of Employment Act (BCEA)** | Sets minimum standards for working hours, leave, overtime, and termination |\n| **Employment Equity Act (EEA)** | Promotes equal opportunity and prohibits unfair discrimination |\n| **Skills Development Act** | Encourages employers to invest in training and skills development |\n| **Occupational Health and Safety Act** | Ensures safe working conditions |\n| **National Minimum Wage Act** | Sets a minimum hourly wage (currently R27.58/hour) |\n\n**Basic Conditions (BCEA highlights):**\n- Maximum 45 ordinary working hours per week\n- 21 consecutive days of annual leave\n- At least 30 days of sick leave in a 3-year cycle\n- 4 months of maternity leave (unpaid, but UIF provides some income)\n- Overtime must be paid at 1.5 times the normal rate\n\n**Employment Equity (EEA highlights):**\n- Prohibits discrimination based on race, gender, disability, religion, etc.\n- Requires designated employers to implement affirmative action plans\n- Promotes transformation in the workplace'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Financial Literacy — Cash and Credit, General Ledger,
//             Trial Balance of a Service Business (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Cash and Credit Journals for a Service Business ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Accounting for a Service Business\n\nA **service business** earns income by providing services, not by selling physical goods. Examples include hairdressers, lawyers, plumbers, tutors, and IT consultants.\n\n### Key Differences from a Trading Business\n\n| Feature | Trading business | Service business |\n|---------|-----------------|------------------|\n| Income source | Sales of goods | Service fees / professional fees |\n| Trading stock | Yes (buys and sells goods) | No (or minimal supplies) |\n| Cost of sales | Yes (opening stock + purchases - closing stock) | No |\n| Gross profit | Yes | No — service income goes directly to net profit calculation |\n\n### Income Statement of a Service Business\n\n| | R |\n|---|---:|\n| Service fees / Fee income | 180 000 |\n| Other income | 5 000 |\n| **Total income** | **185 000** |\n| Less: Operating expenses | |\n| Salaries | (72 000) |\n| Rent | (36 000) |\n| Telephone | (8 400) |\n| Stationery | (3 200) |\n| **Total expenses** | **(119 600)** |\n| **Net profit** | **65 400** |\n\nThere is no "Gross Profit" line because there is no cost of sales.'),
  t(2, '### Cash Journals for a Service Business\n\n**CRJ — Cash Receipts Journal:**\nThe main income column is **Fee Income** (or Service Fees) instead of Sales.\n\n| Doc | Day | Details | Bank | Fee Income | Debtors Control | Sundry |\n|-----|-----|---------|------|-----------|----------------|--------|\n| Rec 01 | 3 | Cash services rendered | 2 500 | 2 500 | | |\n| Rec 02 | 10 | T. Dlamini (debtor) | 3 000 | | 3 000 | |\n| Rec 03 | 15 | Cash services rendered | 4 200 | 4 200 | | |\n| Rec 04 | 20 | Interest received | 300 | | | Interest received 300 |\n| | | **Totals** | **10 000** | **6 700** | **3 000** | **300** |\n\n**CPJ — Cash Payments Journal:**\nThere is usually **no Trading Stock column** because a service business does not buy goods for resale. Instead, there may be a **Consumable Supplies** column.\n\n| Doc | Day | Details | Bank | Consumables | Creditors | Salaries | Sundry |\n|-----|-----|---------|------|------------|-----------|----------|--------|\n| EFT | 5 | Office supplies | 800 | 800 | | | |\n| EFT | 15 | Staff salaries | 6 000 | | | 6 000 | |\n| EFT | 20 | Rent | 3 000 | | | | Rent 3 000 |\n| | | **Totals** | **9 800** | **800** | **0** | **6 000** | **3 000** |'),
  q(3, 'A service business earns its main income from:',
    ['Providing services (fee income)', 'Selling physical goods', 'Buying and reselling products', 'Manufacturing products'], 0,
    'Service businesses earn income from providing services. Their main income account is Fee Income or Service Fees, not Sales.'),
  fb(4, 'In a service business, the main income account is called ___ instead of Sales. There is no ___ line on the Income Statement because no goods are sold.',
    ['Fee Income', 'Gross Profit'],
    'Service businesses earn Fee Income. Without cost of sales, there is no gross profit calculation — expenses are deducted directly from income.'),
  t(5, '### Double Entry for a Service Business\n\nThe double-entry principle applies the same way:\n\n**Cash service rendered (R2 500):**\n- Debit: Bank R2 500 (asset increases)\n- Credit: Fee Income R2 500 (income increases)\n\n**Debtor pays (R3 000):**\n- Debit: Bank R3 000 (asset increases)\n- Credit: Debtors Control R3 000 (asset decreases — debtor owes less)\n\n**Pay rent (R3 000):**\n- Debit: Rent Expense R3 000 (expense increases)\n- Credit: Bank R3 000 (asset decreases)\n\n**Pay salaries (R6 000):**\n- Debit: Salaries Expense R6 000 (expense increases)\n- Credit: Bank R6 000 (asset decreases)\n\n**Every transaction has a debit and a credit of the same amount.** This is the fundamental rule of double-entry bookkeeping.'),
  q(6, 'A plumber receives R1 800 cash for fixing a leaking pipe. The journal entry is:',
    ['Debit Bank R1 800, Credit Fee Income R1 800', 'Debit Fee Income R1 800, Credit Bank R1 800', 'Debit Bank R1 800, Credit Sales R1 800', 'Debit Cash R1 800, Credit Debtors R1 800'], 0,
    'Cash received increases the bank account (debit). The income earned is fee income, not sales, so Fee Income is credited.'),
  t(7, '### T-Accounts for a Service Business\n\nUsing the CRJ and CPJ data from above:\n\n**Bank Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CRJ | 10 000 | CPJ | 9 800 |\n| | | Balance c/d | 200 |\n| **Total** | **10 000** | **Total** | **10 000** |\n| Balance b/d | 200 | | |\n\n**Fee Income Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| | | CRJ | 6 700 |\n\n**Salaries Expense Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ | 6 000 | | |\n\n**Rent Expense Account**\n\n| Dr | | Cr | |\n|---|---:|---|---:|\n| CPJ | 3 000 | | |'),
  fb(8, 'In the Bank account, the CRJ total is entered on the ___ side and the CPJ total is entered on the ___ side.',
    ['debit', 'credit'],
    'Money received (CRJ) is debited to Bank. Money paid (CPJ) is credited to Bank. The difference is the bank balance.'),
  q(9, 'After posting the CRJ and CPJ, the bank balance is R200 debit. This means:',
    ['The business has R200 in the bank', 'The business is overdrawn by R200', 'The bank owes the business R200', 'There is an error in the books'], 0,
    'A debit balance on the Bank account means the business has money in the bank (favourable). R10 000 received - R9 800 paid = R200 available.'),
  t(10, '### Trial Balance of a Service Business\n\n**Campusly Plumbing Services**\n**Trial Balance on 30 April 2026**\n\n| Account | Debit (R) | Credit (R) |\n|---------|----------|------------|\n| Bank | 200 | |\n| Capital | | 20 000 |\n| Equipment | 15 000 | |\n| Debtors Control | 2 000 | |\n| Fee Income | | 6 700 |\n| Interest Received | | 300 |\n| Consumable Supplies | 800 | |\n| Salaries | 6 000 | |\n| Rent Expense | 3 000 | |\n| | **27 000** | **27 000** |\n\nDebits = Credits ✓\n\n**From this trial balance:**\n- Total income: R6 700 + R300 = R7 000\n- Total expenses: R800 + R6 000 + R3 000 = R9 800\n- Net loss: R9 800 - R7 000 = R2 800 loss\n\nThis business made a loss in April, possibly because it is a new business with high initial costs relative to the income earned so far.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Key Concepts, Formulae, and Exam Tips ---
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Grade 9 EMS — Revision\n\n### Key Formulae and Definitions\n\n**The Accounting Equation:**\n$$\\text{Assets} = \\text{Owner\'s Equity} + \\text{Liabilities}$$\n\n**Net Profit:**\n$$\\text{Net Profit} = \\text{Total Income} - \\text{Total Expenses}$$\n\n**Final Capital:**\n$$\\text{Final Capital} = \\text{Opening Capital} + \\text{Net Profit} - \\text{Drawings}$$\n\n**Break-Even:**\n$$\\text{Break-even} = \\frac{\\text{Fixed Costs}}{\\text{Selling Price} - \\text{Variable Cost per unit}}$$\n\n**Cash Flow:**\n$$\\text{Closing Balance} = \\text{Opening Balance} + \\text{Receipts} - \\text{Payments}$$\n\n**Key Terms:**\n\n| Term | Definition |\n|------|----------|\n| Debit | Left side of an account |\n| Credit | Right side of an account |\n| Debtor | Person who owes the business money |\n| Creditor | Person to whom the business owes money |\n| Double entry | Every transaction has an equal debit and credit |\n| Trial balance | List of all ledger balances to check accuracy |'),
  t(2, '### The Six Journals — Summary\n\n| Journal | Abbreviation | What it records | Source document |\n|---------|-------------|----------------|----------------|\n| Cash Receipts Journal | CRJ | All cash received | Receipt |\n| Cash Payments Journal | CPJ | All cash paid | Cheque / EFT |\n| Debtors Journal | DJ | Credit sales | Invoice issued |\n| Creditors Journal | CJ | Credit purchases | Invoice received |\n| Debtors Allowances Journal | DAJ | Returns by debtors | Credit note issued |\n| Creditors Allowances Journal | CAJ | Returns to creditors | Credit note received |\n\n### The Three Ledgers\n\n| Ledger | Contains |\n|--------|--------|\n| General Ledger | All accounts — Bank, Capital, Sales, Expenses, Control accounts |\n| Debtors Ledger | Individual debtor accounts |\n| Creditors Ledger | Individual creditor accounts |'),
  q(3, 'Credit sales are recorded in the:',
    ['Debtors Journal (DJ)', 'Cash Receipts Journal (CRJ)', 'Creditors Journal (CJ)', 'Cash Payments Journal (CPJ)'], 0,
    'Credit sales (goods sold on account, not for cash) are recorded in the Debtors Journal. Cash sales go in the CRJ.'),
  fb(4, 'The General Ledger is the book of ___ entry. The journal is the book of ___ entry.',
    ['final', 'first'],
    'Transactions are first recorded in journals, then posted to the ledger (final entry).'),
  t(5, '### The Economy — Key Concepts\n\n| Topic | Key points |\n|-------|----------|\n| **Needs vs wants** | Needs are essential for survival; wants improve quality of life |\n| **Scarcity** | Resources are limited while wants are unlimited |\n| **Opportunity cost** | The next best alternative given up when making a choice |\n| **Factors of production** | Land (rent), Labour (wages), Capital (interest), Entrepreneurship (profit) |\n| **Economic systems** | Free market, command, mixed — SA is a mixed economy |\n| **Circular flow** | Money, goods, and services flow between households, businesses, government, and the foreign sector |\n| **Demand** | Inverse relationship with price (downward-sloping curve) |\n| **Supply** | Direct relationship with price (upward-sloping curve) |\n| **Equilibrium** | Where demand = supply; the market-clearing price |\n| **Trade unions** | Protect workers\' rights; governed by the LRA |\n| **CCMA** | Resolves labour disputes through conciliation, mediation, arbitration |'),
  q(6, 'The opportunity cost of choosing to study instead of working a part-time job is:',
    ['The wages you could have earned from the job', 'The cost of textbooks', 'The time spent studying', 'The grade you will receive'], 0,
    'Opportunity cost is the value of the next best alternative given up. If you choose to study, the opportunity cost is the wages you forgo from the part-time job.'),
  t(7, '### Entrepreneurship — Key Concepts\n\n| Topic | Key points |\n|-------|----------|\n| **Entrepreneur** | Identifies opportunities, takes risks, starts businesses |\n| **SMMEs** | Small, Medium, and Micro Enterprises — create jobs in SA |\n| **Sectors** | Primary (extraction), Secondary (manufacturing), Tertiary (services) |\n| **Forms of ownership** | Sole proprietor, Partnership, CC, (Pty) Ltd |\n| **Business plan** | Describes the business, market, marketing mix, finances |\n| **SWOT analysis** | Strengths/Weaknesses (internal), Opportunities/Threats (external) |\n| **Marketing mix (4 Ps)** | Product, Price, Place, Promotion |\n| **Break-even** | The sales level where income = costs (no profit, no loss) |\n| **Start-up costs** | Once-off costs needed to begin the business |\n| **Sources of funding** | Own savings, bank loan, SEDA, SEFA, NYDA, investors |'),
  fb(8, 'SWOT stands for Strengths, Weaknesses, ___, and Threats. The 4 Ps of marketing are Product, Price, Place, and ___.',
    ['Opportunities', 'Promotion'],
    'SWOT = Strengths, Weaknesses, Opportunities, Threats. 4 Ps = Product, Price, Place, Promotion.'),
  q(9, 'Which of the following is an internal factor in a SWOT analysis?',
    ['The owner\'s skills and experience (strength)', 'New government regulations (threat)', 'A growing market for the product (opportunity)', 'Competition from large companies (threat)'], 0,
    'Internal factors are within the business\'s control. The owner\'s skills are an internal strength. Government regulations, market growth, and competition are external factors.'),
  t(10, '### Exam Tips for Grade 9 EMS\n\n**Paper structure:**\nGrade 9 EMS typically has one paper covering all three topics: The Economy, Financial Literacy, and Entrepreneurship.\n\n**Study tips:**\n1. **Know the accounting equation** — it is the foundation of everything in financial literacy\n2. **Practise journal entries** — you must know which journal to use for each transaction\n3. **Understand T-accounts** — practise balancing accounts and posting from journals\n4. **Learn the debit/credit rules** — assets and expenses = debit; liabilities, equity, income = credit\n5. **Use the correct terminology** — "debtor" not "person who owes money"\n6. **Read questions carefully** — cash vs credit, issued vs received, buying vs selling\n7. **Show all workings** — even simple calculations should be written out\n8. **Use South African examples** — SARS, CCMA, NCA, SARB, COSATU\n9. **Draw diagrams** — circular flow, demand and supply curves\n10. **Time management** — allocate time based on marks per question'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 9
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 9/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 9:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 9', schoolId: SCHOOL_ID, orderIndex: 9,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 9:', String(GRADE_ID));
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
      title: 'Chapter 1: The Economy — Economic Systems and the Circular Flow',
      description: 'Needs, wants, and scarcity; goods and services; factors of production; economic systems; participants in the economy; sectors; circular flow; government role; GDP.',
      order: 1,
      lessons: [
        { title: 'Economic Systems and Participants', description: 'Needs, wants, scarcity; goods and services; factors of production; the three economic systems; participants in the economy; primary, secondary, and tertiary sectors.', blocks: ch1_lesson1, term: 1 },
        { title: 'The Circular Flow of the Economy', description: 'Simple and four-sector circular flow; factor and goods markets; injections and leakages; the government\'s role in the SA economy; economic growth and GDP.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Financial Literacy — The Accounting Equation and Source Documents',
      description: 'The accounting equation (Assets = Owner\'s Equity + Liabilities); double-entry principle; classification of accounts; debit and credit rules; source documents; cash vs credit transactions.',
      order: 2,
      lessons: [
        { title: 'The Accounting Equation', description: 'Assets, owner\'s equity, and liabilities; how transactions affect the equation; income and expenses; classification of accounts; debit and credit rules; drawings.', blocks: ch2_lesson1, term: 1 },
        { title: 'Source Documents', description: 'Invoices, receipts, credit notes, debit notes, deposit slips; cash vs credit transactions; debtors and creditors; the accounting cycle; filing and safekeeping.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Financial Literacy — Cash Journals',
      description: 'Cash Receipts Journal (CRJ) and Cash Payments Journal (CPJ); recording cash transactions; posting to the general ledger; worked examples.',
      order: 3,
      lessons: [
        { title: 'Cash Receipts Journal (CRJ)', description: 'Format of the CRJ; Bank, Sales, Debtors Control, and Sundry columns; recording entries; worked example; posting to the ledger.', blocks: ch3_lesson1, term: 1 },
        { title: 'Cash Payments Journal (CPJ)', description: 'Format of the CPJ; Bank, Trading Stock, Creditors Control, Wages, and Sundry columns; recording entries; worked example; posting to the ledger.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Financial Literacy — The General Ledger and Trial Balance',
      description: 'T-account format; posting from CRJ and CPJ; balancing accounts; trial balance format; errors detected and not detected; financial statements overview.',
      order: 4,
      lessons: [
        { title: 'The General Ledger', description: 'T-account format; posting from CRJ and CPJ; balancing ledger accounts; types of ledger accounts; debit and credit balances.', blocks: ch4_lesson1, term: 1 },
        { title: 'The Trial Balance', description: 'Purpose and format of the trial balance; errors detected and not detected; from trial balance to financial statements; Income Statement and Balance Sheet overview.', blocks: ch4_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: The Economy — Price Theory (Demand and Supply)',
      description: 'The law of demand; the law of supply; equilibrium price and quantity; surplus and shortage; factors that shift demand and supply curves.',
      order: 5,
      lessons: [
        { title: 'Demand and Supply', description: 'The law of demand; demand schedule and curve; the law of supply; supply schedule and curve; equilibrium; surplus and shortage; factors shifting demand and supply.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Entrepreneurship — Sectors and Business Ideas',
      description: 'Characteristics of entrepreneurs; types of businesses; formal and informal sectors; SMMEs; sectors of the economy; identifying business opportunities; government support.',
      order: 6,
      lessons: [
        { title: 'Entrepreneurship and Sectors of the Economy', description: 'Entrepreneurial characteristics; famous SA entrepreneurs; formal vs informal sector; SMMEs; primary, secondary, tertiary sectors; identifying opportunities; government support.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Financial Literacy — Credit Transactions',
      description: 'Debtors Journal and Creditors Journal; the National Credit Act; posting credit transactions to the General Ledger, Debtors Ledger, and Creditors Ledger.',
      order: 7,
      lessons: [
        { title: 'Debtors Journal, Creditors Journal, and the NCA', description: 'Debtors Journal format; Creditors Journal format; National Credit Act; posting credit transactions; the three ledgers; the accounting cycle with credit transactions.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Entrepreneurship — The Business Plan',
      description: 'Functions of a business; forms of ownership; the business plan structure; SWOT analysis; the marketing mix (4 Ps); financial plan; start-up costs; break-even analysis.',
      order: 8,
      lessons: [
        { title: 'Functions of a Business and the Business Plan', description: 'Eight business functions; forms of ownership; business plan sections; SWOT analysis; marketing mix (4 Ps); pricing strategies.', blocks: ch8_lesson1, term: 3 },
        { title: 'The Financial Plan and Start-up Costs', description: 'Start-up costs; sources of funding; projected income statement; cash flow projection; break-even analysis; presenting the business plan.', blocks: ch8_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Financial Literacy — Debtors and Creditors Ledger',
      description: 'Debtors Allowances Journal (DAJ); Creditors Allowances Journal (CAJ); Debtors Ledger; Creditors Ledger; control account reconciliation.',
      order: 9,
      lessons: [
        { title: 'Subsidiary Journals and Ledgers', description: 'DAJ and CAJ formats; posting returns; Debtors Ledger and Creditors Ledger accounts; control account reconciliation; all six journals and three ledgers.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Financial Literacy — Posting to General Ledger and Creditors Ledger',
      description: 'Posting the CPJ to the General Ledger and Creditors Ledger; complete Creditors Control and Debtors Control accounts; reconciliation of control accounts with subsidiary ledgers.',
      order: 10,
      lessons: [
        { title: 'Posting Cash Payments Journal to Ledgers', description: 'Worked example of CPJ posting; General Ledger entries; Creditors Ledger entries; complete Creditors Control and Debtors Control accounts.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: The Economy — Trade Unions',
      description: 'Trade unions in South Africa; the Labour Relations Act; CCMA; strikes and lock-outs; effect on businesses and the economy; other labour laws.',
      order: 11,
      lessons: [
        { title: 'Trade Unions and Labour Relations', description: 'Why workers join unions; major SA unions; the LRA; CCMA; protected and unprotected strikes; lock-outs; BCEA; EEA; National Minimum Wage.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Financial Literacy — Cash and Credit for a Service Business',
      description: 'Accounting for a service business; CRJ and CPJ for services; fee income; T-accounts; trial balance of a service business.',
      order: 12,
      lessons: [
        { title: 'Cash and Credit Journals for a Service Business', description: 'Service vs trading business; fee income; CRJ and CPJ formats; double entry; T-accounts; trial balance of a service business.', blocks: ch12_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 13: Revision and Exam Preparation',
      description: 'Key formulae; summary of all journals and ledgers; economy concepts; entrepreneurship concepts; exam tips and study strategies.',
      order: 13,
      lessons: [
        { title: 'Key Concepts, Formulae, and Exam Tips', description: 'Accounting equation; six journals; three ledgers; economy key concepts; entrepreneurship key concepts; exam structure and study tips.', blocks: ch13_lesson1, term: 4 },
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
    title: 'Grade 9 Economic and Management Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering The Economy (economic systems, circular flow, demand and supply, trade unions), Financial Literacy (accounting equation, journals, ledgers, trial balance), and Entrepreneurship (business plans, SWOT analysis, marketing mix) for the Grade 9 EMS curriculum.',
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
  console.log('  TEXTBOOK: Grade 9 EMS');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
