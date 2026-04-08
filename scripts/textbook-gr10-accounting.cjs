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
// CHAPTER 1: Introduction to Accounting (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: What Is Accounting? ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## What Is Accounting?\n\nAccounting is the process of **recording**, **classifying**, **summarising**, and **interpreting** financial information about a business. It helps owners, managers, and other stakeholders make informed decisions.\n\n### The Accounting Cycle\nThe accounting cycle describes the steps followed during each financial period:\n\n1. **Source documents** are collected (receipts, invoices, cheques)\n2. **Transactions** are recorded in **journals** (books of first entry)\n3. Journal entries are **posted** to the **ledger** (book of final entry)\n4. A **trial balance** is prepared to check accuracy\n5. **Financial statements** are prepared (Income Statement and Balance Sheet)\n6. Financial statements are **analysed and interpreted**\n\n### Types of Business Ownership\n| Type | Owner(s) | Liability |\n|------|---------|----------|\n| Sole trader | One person | Unlimited |\n| Partnership | 2–20 persons | Unlimited |\n| Company | Shareholders | Limited |'),
  t(2, '### Formal vs Informal Business Sectors\n\n**Formal sector:**\n- Registered with CIPC and SARS\n- Keeps proper accounting records\n- Follows GAAP and legal requirements\n- Examples: Pick n Pay, Shoprite, Vodacom\n\n**Informal sector:**\n- May not be formally registered\n- Record-keeping is often basic or absent\n- Includes street vendors, spaza shops, hawkers\n- Important contributor to the South African economy\n\n### Indigenous Bookkeeping\nBefore modern accounting, indigenous communities in South Africa used their own methods to track resources:\n- **Stokvels** (savings clubs) — members contribute regularly and take turns receiving the pool\n- **Tally systems** — marks on sticks or stones to count livestock\n- **Oral records** — trusted community members kept mental records of debts and credits\n\nThese systems share core accounting principles: recording, accountability, and trust.'),
  q(3, 'Which of the following best describes the purpose of accounting?',
    ['To record, classify, summarise, and interpret financial information', 'To collect taxes for the government', 'To calculate employee salaries only', 'To prepare bank statements'], 0,
    'Accounting encompasses the full process of recording financial transactions, classifying them, summarising them into reports, and interpreting those reports for decision-making.'),
  fb(4, 'Journals are called the books of ___ entry. The ledger is called the book of ___ entry.',
    ['first', 'final'],
    'Transactions are first recorded in journals, then posted to the ledger which is the final destination for all entries.'),
  t(5, '### Users of Accounting Information\n\n| User | What they need to know |\n|------|----------------------|\n| **Owner** | Is the business profitable? Is it growing? |\n| **Manager** | How can we cut costs? Which products sell best? |\n| **SARS** | How much tax does the business owe? |\n| **Bank** | Can the business repay a loan? |\n| **Creditors** | Will the business pay what it owes? |\n| **Employees** | Is the business stable enough to keep paying salaries? |\n| **Investors** | Is this a good investment opportunity? |\n\n### The Accounting Equation\n\nThe foundation of all accounting:\n\n$$\\text{Assets} = \\text{Owner\'s equity} + \\text{Liabilities}$$\n\n- **Assets:** What the business OWNS (cash, equipment, stock, vehicles)\n- **Owner\'s equity:** What the owner has invested (capital) plus retained profits\n- **Liabilities:** What the business OWES (loans, creditors, bank overdraft)'),
  q(6, 'A business has assets of R250 000 and liabilities of R90 000. The owner\'s equity is:',
    ['R160 000', 'R340 000', 'R250 000', 'R90 000'], 0,
    'Owner\'s equity = Assets - Liabilities = R250 000 - R90 000 = R160 000.'),
  fb(7, 'Assets are what the business ___. Liabilities are what the business ___.',
    ['owns', 'owes'],
    'Assets represent resources owned by the business. Liabilities represent debts or obligations to outside parties.'),
  t(8, '### GAAP — Generally Accepted Accounting Practice\n\nGAAP is a set of rules and guidelines that accountants must follow when preparing financial statements. Key GAAP principles include:\n\n| Principle | Meaning |\n|-----------|--------|\n| **Historical cost** | Assets are recorded at their original purchase price |\n| **Prudence** | Be cautious — do not overstate profits or assets |\n| **Going concern** | Assume the business will continue operating |\n| **Business entity** | Keep the owner\'s personal finances separate from the business |\n| **Materiality** | Only report items that are significant enough to affect decisions |\n| **Matching** | Match income with the expenses incurred to earn that income |\n\n### Ethics in Accounting\nAccountants must act with:\n- **Honesty** — report accurately, do not manipulate figures\n- **Transparency** — disclose all relevant information\n- **Accountability** — take responsibility for financial records\n- **Fairness** — treat all stakeholders fairly'),
  q(9, 'The business entity principle requires that:',
    ['The owner\'s personal finances must be kept separate from the business', 'The business must be registered as a company', 'All transactions must be recorded in the same journal', 'The business must have a bank account'], 0,
    'The business entity principle states that the business is a separate entity from its owner. Personal transactions of the owner should not be mixed with business transactions.'),
  q(10, 'A sole trader uses R5 000 of business money to pay for his child\'s school fees. Which GAAP principle has been violated?',
    ['Business entity principle', 'Historical cost principle', 'Going concern principle', 'Materiality principle'], 0,
    'Using business money for personal expenses violates the business entity principle, which requires separation of personal and business finances. The R5 000 should be recorded as drawings.'),
];

// --- Lesson 2: The Accounting Equation ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## The Accounting Equation in Detail\n\nEvery transaction affects the accounting equation, but the equation must always **balance**.\n\n$$\\text{Assets} = \\text{Owner\'s equity} + \\text{Liabilities}$$\n\n### Types of Assets\n\n**Non-current (fixed) assets** — used in the business for more than one year:\n- Land and buildings\n- Vehicles\n- Equipment and furniture\n\n**Current assets** — expected to be converted to cash within one year:\n- Bank (cash at bank)\n- Cash (petty cash)\n- Trading stock (inventory)\n- Debtors (accounts receivable — people who owe the business)\n- Prepaid expenses\n\n### Types of Liabilities\n\n**Non-current liabilities** — debts payable after more than one year:\n- Long-term loans (e.g., mortgage bond)\n\n**Current liabilities** — debts payable within one year:\n- Creditors (accounts payable — people the business owes)\n- Bank overdraft\n- Accrued expenses\n- Short-term loans'),
  t(2, '### Owner\'s Equity Expanded\n\nOwner\'s equity can be broken down further:\n\n$$\\text{Owner\'s equity} = \\text{Capital} + \\text{Income} - \\text{Expenses} - \\text{Drawings}$$\n\n| Term | Effect on Equity |\n|------|------------------|\n| **Capital** | Increases equity (owner invests) |\n| **Income** (Sales, Fees earned) | Increases equity |\n| **Expenses** (Rent, Salaries, Water) | Decreases equity |\n| **Drawings** | Decreases equity (owner withdraws) |\n\n### How Transactions Affect the Equation\n\n**Transaction 1:** Owner invests R100 000 cash into the business.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Bank +R100 000 | = | Capital +R100 000 | + | — |\n\n**Transaction 2:** Business buys equipment for R30 000 cash.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Equipment +R30 000 | = | — | + | — |\n| Bank -R30 000 | | | | |\n\nNote: Only assets changed (one asset increased, another decreased). The total remains the same.'),
  q(3, 'The owner invests R200 000 into the business bank account. Which elements of the accounting equation are affected?',
    ['Assets increase and Owner\'s equity increases', 'Assets increase and Liabilities increase', 'Only Assets increase', 'Owner\'s equity increases and Liabilities decrease'], 0,
    'When the owner invests capital, Bank (an asset) increases and Capital (owner\'s equity) increases by the same amount.'),
  t(4, '### More Transactions and the Equation\n\n**Transaction 3:** Business buys stock on credit for R15 000.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Stock +R15 000 | = | — | + | Creditors +R15 000 |\n\nBoth sides increase equally.\n\n**Transaction 4:** Business pays R8 000 rent by cheque.\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Bank -R8 000 | = | Rent expense -R8 000 | + | — |\n\nAssets decrease and equity decreases (expense reduces profit).\n\n**Transaction 5:** Business sells goods for R20 000 cash (cost of goods was R12 000).\n\n| Assets | = | Owner\'s Equity | + | Liabilities |\n|--------|---|---------------|---|-------------|\n| Bank +R20 000 | = | Sales +R20 000 | + | — |\n| Stock -R12 000 | = | Cost of sales -R12 000 | + | — |\n\nNet effect: Assets increase by R8 000, equity increases by R8 000 (the profit).'),
  fb(5, 'When a business buys stock on credit, the asset ___ increases and the liability ___ increases.',
    ['trading stock', 'creditors'],
    'A credit purchase increases stock (asset) and creates an obligation to pay the supplier (creditor — a liability).'),
  q(6, 'A business pays R3 000 to a creditor by cheque. The effect on the accounting equation is:',
    ['Assets decrease and Liabilities decrease', 'Assets decrease and Owner\'s equity decreases', 'Only Liabilities decrease', 'Assets increase and Liabilities decrease'], 0,
    'Paying a creditor reduces Bank (asset) and reduces Creditors (liability) by the same amount.'),
  t(7, '### The Accounting Equation Table\n\nFor exam purposes, you may need to show multiple transactions in a table:\n\n**Zinhle starts a clothing business:**\n\n| Transaction | Bank | Stock | Equip. | = | Capital | + | Creditors |\n|------------|-----:|------:|-------:|---|--------:|---|----------:|\n| 1. Invest R80 000 | +80 000 | | | = | +80 000 | + | |\n| 2. Buy stock cash R20 000 | -20 000 | +20 000 | | = | | + | |\n| 3. Buy equip. credit R15 000 | | | +15 000 | = | | + | +15 000 |\n| 4. Sell goods R10 000 (cost R6 000) | +10 000 | -6 000 | | = | +4 000 | + | |\n| **Totals** | **70 000** | **14 000** | **15 000** | = | **84 000** | + | **15 000** |\n\n**Check:** R70 000 + R14 000 + R15 000 = R99 000 = R84 000 + R15 000 = R99 000 ✓'),
  q(8, 'In the example above, why does Zinhle\'s capital increase by R4 000 in transaction 4?',
    ['She earned a gross profit of R4 000 (sold goods worth R6 000 for R10 000)', 'She received R4 000 from a debtor', 'She invested an additional R4 000', 'She received a discount of R4 000'], 0,
    'Profit increases owner\'s equity. Selling goods that cost R6 000 for R10 000 gives a gross profit of R4 000, which increases capital.'),
  fb(9, 'Drawings ___ owner\'s equity. Income ___ owner\'s equity.',
    ['decrease', 'increases'],
    'When the owner takes money or goods out of the business (drawings), equity decreases. When the business earns income, equity increases.'),
  t(10, '### Summary of Double-Entry Effects\n\nEvery transaction has a **dual effect** — it affects at least two accounts. This is the **double-entry principle**.\n\n| Transaction type | Debit (increase) | Credit (increase) |\n|-----------------|-------------------|-------------------|\n| Owner invests capital | Bank (asset) | Capital (equity) |\n| Buy stock for cash | Trading stock (asset) | Bank (asset decreases) |\n| Buy stock on credit | Trading stock (asset) | Creditors (liability) |\n| Pay expense by cheque | Expense (equity decreases) | Bank (asset decreases) |\n| Cash sale | Bank (asset) | Sales (equity increases) |\n| Credit sale | Debtors (asset) | Sales (equity increases) |\n| Receive from debtor | Bank (asset) | Debtors (asset decreases) |\n| Pay creditor | Creditors (liability decreases) | Bank (asset decreases) |\n| Owner takes drawings | Drawings (equity decreases) | Bank (asset decreases) |\n\nRemember: **Debit** = left side. **Credit** = right side.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Source Documents and the Accounting Cycle (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Source Documents ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Source Documents\n\nSource documents are the **original records** of transactions. They provide proof that a transaction took place and are used to record entries in the journals.\n\n### Key Source Documents\n\n| Document | Used for | Prepared by |\n|----------|---------|------------|\n| **Receipt** | Proof of cash received | The business (seller) |\n| **Cheque counterfoil** | Proof of cash payment | The business (payer) |\n| **Invoice** | Credit sale or credit purchase | The seller |\n| **Credit note** | Return of goods (allowance) | The seller |\n| **Debit note** | Return of goods (from buyer\'s side) | The buyer |\n| **Bank statement** | Record of all bank transactions | The bank |\n| **Deposit slip** | Proof of money deposited | The depositor |\n| **EFT notification** | Proof of electronic payment | The bank/system |'),
  t(2, '### The Invoice in Detail\n\nAn invoice is the most important source document for credit transactions.\n\n**Information on a tax invoice:**\n- Name and address of the seller (supplier)\n- Name and address of the buyer\n- Invoice number and date\n- VAT registration number of the seller\n- Description, quantity, and price of goods\n- VAT amount and total amount\n- Terms of payment (e.g., 30 days)\n\n### Original vs Duplicate\n\n| | Original | Duplicate |\n|---|---------|----------|\n| **Who keeps it** | The buyer | The seller |\n| **Used to record** | Credit purchases (Creditors Journal) | Credit sales (Debtors Journal) |\n\n**Memory aid:** The person who RECEIVES the goods gets the original invoice.\n\n### Credit Note vs Debit Note\n- **Credit note:** Issued by the seller when goods are returned or an overcharge is corrected\n- **Debit note:** Issued by the buyer to notify the seller of returned goods\n- Both reduce the amount owed'),
  q(3, 'A business receives an original invoice from a supplier. In which journal will this be recorded?',
    ['Creditors Journal (CJ)', 'Debtors Journal (DJ)', 'Cash Receipts Journal (CRJ)', 'Cash Payments Journal (CPJ)'], 0,
    'The original invoice is received by the buyer and records a credit purchase. Credit purchases are recorded in the Creditors Journal (CJ).'),
  fb(4, 'The original invoice is kept by the ___ and the duplicate is kept by the ___.',
    ['buyer', 'seller'],
    'The buyer receives and keeps the original invoice. The seller keeps the duplicate copy of the invoice they issued.'),
  t(5, '### Cash vs Credit Transactions\n\n**Cash transactions** — payment happens immediately (cash, cheque, EFT, card):\n- Cash sale → Receipt issued → CRJ\n- Cash purchase → Cheque counterfoil → CPJ\n\n**Credit transactions** — payment happens later (on account):\n- Credit sale → Invoice (duplicate) → DJ\n- Credit purchase → Invoice (original) → CJ\n- Return by customer → Credit note (duplicate) → DAJ\n- Return to supplier → Credit note (original) or Debit note → CAJ\n\n### The Perpetual Inventory System\n\nIn Grade 10, we use the **perpetual inventory system**:\n- Stock is tracked continuously\n- Every purchase increases the Trading stock account\n- Every sale decreases Trading stock and records Cost of sales\n- The business always knows the value of stock on hand'),
  q(6, 'Which source document is used to record a credit sale in the Debtors Journal?',
    ['Duplicate invoice', 'Original invoice', 'Receipt', 'Credit note'], 0,
    'A credit sale is recorded from the duplicate invoice (the copy kept by the seller). The original goes to the buyer.'),
  t(7, '### Discount Types\n\nThere are two types of discounts in accounting:\n\n**Trade discount:**\n- A reduction in the listed (catalogue) price\n- Given to encourage bulk buying or to regular customers\n- NOT recorded in the books — the invoice shows the reduced price\n- Example: Listed price R1 000 less 10% trade discount = Invoice price R900\n\n**Settlement (cash) discount:**\n- A reduction for early payment\n- Given to encourage prompt payment\n- IS recorded in the books\n- Example: Invoice R900, terms "5% discount if paid within 7 days"\n  - If paid within 7 days: pay R900 - R45 = R855\n  - The R45 is a **discount granted** (expense for the seller) or **discount received** (income for the buyer)'),
  q(8, 'A supplier offers a 10% trade discount on goods listed at R5 000 and a 5% settlement discount for early payment. If paid early, the amount paid is:',
    ['R4 275', 'R4 500', 'R4 250', 'R4 750'], 0,
    'Trade discount: R5 000 - 10% = R4 500 (invoice amount). Settlement discount: R4 500 - 5% = R4 500 - R225 = R4 275.'),
  fb(9, 'A trade discount is NOT recorded in the books because the invoice already shows the ___ price. A settlement discount IS recorded and encourages ___ payment.',
    ['reduced', 'early'],
    'Trade discounts are deducted before the invoice is prepared. Settlement discounts are recorded when payment is received/made early.'),
  q(10, 'What is the difference between a receipt and an invoice?',
    ['A receipt proves cash was received; an invoice records a credit transaction', 'A receipt is for credit sales; an invoice is for cash sales', 'There is no difference', 'A receipt is prepared by the buyer; an invoice by the seller'], 0,
    'A receipt is issued when cash (or EFT/card) is received — it proves payment. An invoice records a credit transaction where payment will follow later.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Subsidiary Journals — Cash Journals (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Cash Receipts Journal (CRJ) ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## The Cash Receipts Journal (CRJ)\n\nThe CRJ records all **money received** by the business, regardless of how it is received (cash, cheque, EFT, card).\n\n### CRJ Column Headings\n\n| Column | Purpose |\n|--------|--------|\n| Doc. no. | Receipt number |\n| Date | Date of transaction |\n| Details | Name of person/business who paid |\n| Fol. | Folio reference for ledger posting |\n| Analysis of receipts | Sundry column for unusual receipts |\n| Bank | Total amount deposited |\n| Sales | Cash sales |\n| Cost of sales | Cost price of goods sold |\n| Trading stock | Reduction in stock (cost of goods sold) |\n| Debtors control | Money received from debtors |\n| Discount granted | Settlement discount given to debtors |\n| Sundry accounts | Other receipts (rent income, interest income, etc.) |'),
  t(2, '### CRJ Example\n\n**Campusly Trading — CRJ — March 2026**\n\n| Doc | Date | Details | Bank | Sales | COS | Trading stock | Debtors | Discount granted | Sundry |\n|-----|------|---------|-----:|------:|----:|--------------:|--------:|-----------------:|-------:|\n| R01 | 1 | Cash sales | 8 000 | 8 000 | 4 800 | 4 800 | | | |\n| R02 | 5 | T. Nkosi (debtor) | 4 750 | | | | 5 000 | 250 | |\n| R03 | 10 | Cash sales | 12 000 | 12 000 | 7 200 | 7 200 | | | |\n| R04 | 15 | Rent income | 3 500 | | | | | | 3 500 |\n| R05 | 20 | S. Dlamini (debtor) | 2 000 | | | | 2 000 | | |\n| | | **Totals** | **30 250** | **20 000** | **12 000** | **12 000** | **7 000** | **250** | **3 500** |\n\n**Important observations:**\n- T. Nkosi owed R5 000 but paid R4 750 (received a 5% settlement discount of R250)\n- Discount granted is NOT recorded in the Bank column — no cash was received for it\n- Cost of sales and Trading stock columns always show the same amount'),
  q(3, 'In the CRJ, discount granted to a debtor is:',
    ['Recorded in the Discount granted column but NOT in the Bank column', 'Recorded in both the Bank and Discount columns', 'Recorded in the Bank column only', 'Not recorded in the CRJ at all'], 0,
    'Discount granted reduces the amount the debtor pays but no cash is received for the discount. It is recorded in the Discount granted column only, not in the Bank column.'),
  fb(4, 'The CRJ records all money ___ by the business. When a debtor pays and receives a discount, the Bank column shows the amount actually ___, not the full debt.',
    ['received', 'received'],
    'The CRJ is for receipts. The Bank column reflects the actual cash received. The discount reduces the debtor\'s account but is not cash.'),
  t(5, '### Posting the CRJ to the Ledger\n\nAt the end of the month, CRJ totals are posted to the **General Ledger**:\n\n| Column total | Account | Debit/Credit |\n|-------------|---------|-------------|\n| Bank | Bank | Debit |\n| Sales | Sales | Credit |\n| Cost of sales | Cost of sales | Debit |\n| Trading stock | Trading stock | Credit |\n| Debtors control | Debtors control | Credit |\n| Discount granted | Discount granted | Debit |\n\n**Individual debtor amounts** are posted to the **Debtors Ledger** (subsidiary ledger) — each debtor\'s personal account is credited.\n\n**Sundry items** are posted individually to their respective accounts:\n- Rent income R3 500 → Credit Rent income account\n\n### Memory Aid\n**CRJ posting rule:** Bank is debited (money comes in). Everything else follows the double-entry principle.'),
  q(6, 'When posting the CRJ totals, the Bank account in the General Ledger is:',
    ['Debited with the Bank column total', 'Credited with the Bank column total', 'Debited with each individual receipt', 'Not affected — it stays in the CRJ'], 0,
    'Bank is an asset. When money is received, the asset increases — assets increase on the debit side. The Bank column total is debited to the Bank account.'),
  fb(7, 'CRJ totals are posted to the ___ Ledger. Individual debtor amounts are posted to the ___ Ledger.',
    ['General', 'Debtors'],
    'Monthly totals go to the General Ledger. Individual debtor receipts are posted to each debtor\'s account in the Debtors Ledger (subsidiary ledger).'),
  t(8, '### Contra Entry in the CRJ\n\nSometimes a debtor pays by returning goods instead of paying cash. This is a **contra entry** — it affects both the debtors and creditors accounts but no cash changes hands.\n\nHowever, in Grade 10, you will mainly encounter straightforward cash receipts.\n\n### Common Mistakes with the CRJ\n\n1. **Adding discount granted to the Bank column** — discount is NOT cash received\n2. **Forgetting the Cost of sales entry** — every cash sale needs both the selling price (Sales) and cost price (COS/Trading stock)\n3. **Not posting sundry items individually** — each sundry item must go to its own account\n4. **Confusing discount granted with discount received** — discount granted is in the CRJ (given to debtors), discount received is in the CPJ (received from creditors)'),
  q(9, 'A cash sale of R6 000 is made. The cost of the goods was R3 600. Which columns are completed in the CRJ?',
    ['Bank R6 000, Sales R6 000, Cost of sales R3 600, Trading stock R3 600', 'Bank R6 000, Sales R6 000 only', 'Bank R6 000, Sales R3 600, Cost of sales R2 400', 'Bank R6 000, Trading stock R6 000'], 0,
    'Cash sales require four columns: Bank (cash received), Sales (selling price), Cost of sales (cost price), and Trading stock (stock reduction) at cost price.'),
  q(10, 'A debtor, M. Phiri, owed R8 000 and paid the full amount. Which columns are completed?',
    ['Bank R8 000 and Debtors control R8 000', 'Bank R8 000 and Sales R8 000', 'Bank R8 000, Debtors control R8 000, and Sales R8 000', 'Debtors control R8 000 only'], 0,
    'When a debtor pays, Bank is debited (money received) and Debtors control is credited (the debt is settled). No sales entry is needed because the sale was already recorded when the credit sale was made.'),
];

// --- Lesson 2: Cash Payments Journal (CPJ) ---
blockNum = 0;
const ch3_lesson2 = [
  t(1, '## The Cash Payments Journal (CPJ)\n\nThe CPJ records all **money paid out** by the business — cheques, EFTs, and cash payments.\n\n### CPJ Column Headings\n\n| Column | Purpose |\n|--------|--------|\n| Doc. no. | Cheque number or EFT reference |\n| Date | Date of payment |\n| Details | Name of person/business paid |\n| Fol. | Folio reference |\n| Bank | Total amount paid |\n| Trading stock | Cash purchases of stock |\n| Creditors control | Payments to creditors |\n| Discount received | Settlement discount received from creditors |\n| Wages/Salaries | Wage or salary payments |\n| Sundry accounts | Other payments (rent, telephone, stationery, etc.) |'),
  t(2, '### CPJ Example\n\n**Campusly Trading — CPJ — March 2026**\n\n| Doc | Date | Details | Bank | Trading stock | Creditors | Discount received | Sundry |\n|-----|------|---------|-----:|--------------:|----------:|------------------:|-------:|\n| Ch101 | 2 | Cash purchase | 6 500 | 6 500 | | | |\n| EFT | 8 | Phakathi Suppliers (creditor) | 9 500 | | 10 000 | 500 | |\n| Ch102 | 12 | Telkom (telephone) | 1 200 | | | | 1 200 |\n| EFT | 18 | Salaries | 15 000 | | | | 15 000 |\n| Ch103 | 25 | Cash purchase | 4 000 | 4 000 | | | |\n| EFT | 28 | Office rent | 8 000 | | | | 8 000 |\n| | | **Totals** | **44 200** | **10 500** | **10 000** | **500** | **24 200** |\n\n**Key observations:**\n- Phakathi Suppliers was owed R10 000 but the business paid R9 500 (received 5% discount = R500)\n- Discount received is NOT in the Bank column — the business did not pay it\n- Sundry items (telephone, salaries, rent) are posted individually'),
  q(3, 'The business owes a creditor R12 000 and pays within the discount period, receiving a 3% settlement discount. How much does the business pay?',
    ['R11 640', 'R12 000', 'R12 360', 'R11 400'], 0,
    'Discount = R12 000 x 3% = R360. Payment = R12 000 - R360 = R11 640. The business pays R11 640 and records discount received of R360.'),
  fb(4, 'The CPJ records all money ___ by the business. Discount received is recorded in its own column and is NOT included in the ___ column.',
    ['paid', 'Bank'],
    'The CPJ records payments. Discount received reduces the amount paid but is not cash, so it is not in the Bank column.'),
  t(5, '### Posting the CPJ to the Ledger\n\nAt month-end, CPJ totals are posted to the **General Ledger**:\n\n| Column total | Account | Debit/Credit |\n|-------------|---------|-------------|\n| Bank | Bank | Credit |\n| Trading stock | Trading stock | Debit |\n| Creditors control | Creditors control | Debit |\n| Discount received | Discount received | Credit |\n\n**Individual creditor amounts** are posted to the **Creditors Ledger** (subsidiary ledger) — each creditor\'s personal account is debited.\n\n**Sundry items** are posted individually:\n- Telephone R1 200 → Debit Telephone account\n- Salaries R15 000 → Debit Salaries account\n- Rent R8 000 → Debit Rent expense account\n\n### Memory Aid\n**CPJ posting rule:** Bank is credited (money goes out). All expenses/assets paid for are debited.'),
  q(6, 'When posting the CPJ totals, the Trading stock account is:',
    ['Debited (stock has been purchased)', 'Credited (stock has left the business)', 'Debited with the Bank total', 'Not affected'], 0,
    'Cash purchases increase the Trading stock account. An increase in an asset is a debit entry. The Trading stock column total is debited to Trading stock.'),
  t(7, '### Comparing the CRJ and CPJ\n\n| Feature | CRJ | CPJ |\n|---------|-----|-----|\n| Records | Money received | Money paid |\n| Bank column | Debited (money in) | Credited (money out) |\n| Discount column | Discount granted (expense) | Discount received (income) |\n| Stock columns | Trading stock credited (stock leaves) | Trading stock debited (stock arrives) |\n| Debtors/Creditors | Debtors control credited | Creditors control debited |\n\n### Key Terms Review\n\n- **Discount granted:** Given BY the business TO its debtors for early payment (an expense — it reduces income)\n- **Discount received:** Given TO the business BY its creditors for early payment (income — it reduces expenses)\n- Both discounts are settlement/cash discounts, not trade discounts'),
  fb(8, 'Discount granted is an ___ for the business (appears in the CRJ). Discount received is ___ for the business (appears in the CPJ).',
    ['expense', 'income'],
    'Discount granted reduces what the business collects from debtors — it is an expense. Discount received reduces what the business pays to creditors — it is income.'),
  q(9, 'A business pays its telephone account of R2 400 by EFT. In the CPJ, the entry is:',
    ['Bank R2 400 and Sundry (Telephone) R2 400', 'Bank R2 400 and Creditors control R2 400', 'Bank R2 400 and Trading stock R2 400', 'Sundry (Telephone) R2 400 only'], 0,
    'Telephone is an expense paid by EFT. It goes in the Bank column (payment) and in the Sundry column (specific expense account).'),
  q(10, 'Which of the following items would NOT appear in the CPJ?',
    ['Cash received from a debtor', 'Payment of rent by EFT', 'Cash purchase of stock', 'Payment to a creditor'], 0,
    'Cash received from a debtor is a receipt, not a payment. It belongs in the CRJ, not the CPJ.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Subsidiary Journals — Credit Journals (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Debtors Journal, Creditors Journal, and Allowances Journals ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## The Debtors Journal (DJ)\n\nThe DJ records all **credit sales** — goods sold on account where the customer will pay later.\n\n### DJ Column Headings\n\n| Column | Purpose |\n|--------|--------|\n| Doc. no. | Invoice number (duplicate) |\n| Date | Date of sale |\n| Details | Name of the debtor (customer) |\n| Fol. | Folio reference |\n| Debtors control | Total amount owed (selling price) |\n| Sales | Selling price of goods |\n| Cost of sales | Cost price of goods sold |\n| Trading stock | Reduction in stock at cost |\n\n### DJ Example\n\n| Doc | Date | Details | Debtors control | Sales | COS | Trading stock |\n|-----|------|---------|----------------:|------:|----:|--------------:|\n| 501 | 3 Mar | T. Moyo | 4 500 | 4 500 | 2 700 | 2 700 |\n| 502 | 8 Mar | L. Khumalo | 3 200 | 3 200 | 1 920 | 1 920 |\n| 503 | 22 Mar | P. Zulu | 6 000 | 6 000 | 3 600 | 3 600 |\n| | | **Totals** | **13 700** | **13 700** | **8 220** | **8 220** |'),
  t(2, '## The Creditors Journal (CJ)\n\nThe CJ records all **credit purchases** — stock bought on account where the business will pay the supplier later.\n\n### CJ Column Headings\n\n| Column | Purpose |\n|--------|--------|\n| Doc. no. | Invoice number (original) |\n| Date | Date of purchase |\n| Details | Name of the creditor (supplier) |\n| Fol. | Folio reference |\n| Creditors control | Total amount owed (purchase price) |\n| Trading stock | Increase in stock at cost |\n\n### CJ Example\n\n| Doc | Date | Details | Creditors control | Trading stock |\n|-----|------|---------|------------------:|--------------:|\n| 221 | 5 Mar | Phakathi Wholesalers | 8 500 | 8 500 |\n| 222 | 14 Mar | Nkosi Suppliers | 6 200 | 6 200 |\n| 223 | 28 Mar | Dlamini Distributors | 4 300 | 4 300 |\n| | | **Totals** | **19 000** | **19 000** |\n\n**Note:** The CJ only has two main columns because a credit purchase simply increases stock and increases creditors.'),
  q(3, 'The Debtors Journal records:',
    ['Credit sales of goods to customers', 'Cash sales of goods', 'Purchases of goods on credit', 'Payments received from debtors'], 0,
    'The DJ records credit sales only. Cash sales go in the CRJ. Purchases go in the CJ. Payments from debtors go in the CRJ.'),
  fb(4, 'The Debtors Journal uses the ___ invoice as its source document. The Creditors Journal uses the ___ invoice.',
    ['duplicate', 'original'],
    'The seller keeps the duplicate invoice and records the credit sale in the DJ. The buyer receives the original invoice and records the purchase in the CJ.'),
  t(5, '## The Debtors Allowances Journal (DAJ)\n\nThe DAJ records **returns from debtors** (goods returned by customers or allowances given to them).\n\n| Column | Purpose |\n|--------|--------|\n| Doc. no. | Credit note number (duplicate) |\n| Date | Date of return |\n| Details | Name of debtor |\n| Debtors control | Total reduction in debtor\'s account |\n| Sales returns | Selling price of returned goods |\n| Cost of sales | Cost of returned goods |\n| Trading stock | Stock returned to inventory |\n\n## The Creditors Allowances Journal (CAJ)\n\nThe CAJ records **returns to creditors** (goods returned to suppliers by the business).\n\n| Column | Purpose |\n|--------|--------|\n| Doc. no. | Credit note number (original) or debit note |\n| Date | Date of return |\n| Details | Name of creditor |\n| Creditors control | Total reduction in creditor\'s account |\n| Trading stock | Stock leaving inventory |'),
  q(6, 'A customer, T. Moyo, returns goods with a selling price of R1 500 (cost R900). Which journal records this?',
    ['Debtors Allowances Journal (DAJ)', 'Creditors Allowances Journal (CAJ)', 'Cash Receipts Journal (CRJ)', 'General Journal (GJ)'], 0,
    'When a debtor (customer) returns goods, it is recorded in the DAJ. The DAJ reduces the debtor\'s account and reverses the sale.'),
  t(7, '### Posting the Credit Journals\n\n**Debtors Journal posting:**\n| Column | Account | Debit/Credit |\n|--------|---------|-------------|\n| Debtors control | Debtors control | Debit |\n| Sales | Sales | Credit |\n| Cost of sales | Cost of sales | Debit |\n| Trading stock | Trading stock | Credit |\n\nIndividual debtors are debited in the Debtors Ledger.\n\n**Creditors Journal posting:**\n| Column | Account | Debit/Credit |\n|--------|---------|-------------|\n| Creditors control | Creditors control | Credit |\n| Trading stock | Trading stock | Debit |\n\nIndividual creditors are credited in the Creditors Ledger.\n\n**DAJ:** Opposite of the DJ — Debtors control is credited, Sales returns is debited, COS is credited, Trading stock is debited.\n\n**CAJ:** Opposite of the CJ — Creditors control is debited, Trading stock is credited.'),
  fb(8, 'In the DJ, Debtors control is ___ (the debtor owes more). In the CJ, Creditors control is ___ (the business owes more).',
    ['debited', 'credited'],
    'A credit sale increases what debtors owe (debit Debtors control). A credit purchase increases what the business owes (credit Creditors control).'),
  q(9, 'The business returns damaged goods worth R2 000 to a supplier, Nkosi Suppliers. This is recorded in the:',
    ['Creditors Allowances Journal (CAJ)', 'Debtors Allowances Journal (DAJ)', 'Cash Payments Journal (CPJ)', 'Creditors Journal (CJ)'], 0,
    'Returning goods to a supplier (creditor) is recorded in the CAJ. It reduces the amount owed to that creditor.'),
  q(10, 'How many subsidiary journals are there in Grade 10 Accounting?',
    ['Seven (CRJ, CPJ, DJ, CJ, DAJ, CAJ, GJ)', 'Five', 'Three', 'Ten'], 0,
    'There are seven subsidiary journals: CRJ, CPJ, DJ, CJ, DAJ, CAJ, and GJ. Each records a specific type of transaction.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: The General Journal and General Ledger (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: General Journal ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## The General Journal (GJ)\n\nThe GJ records transactions that do **not fit** into any of the other six journals. It is also called the **Journal Proper**.\n\n### Types of Transactions in the GJ\n\n1. **Correction of errors** — fixing mistakes made in other journals\n2. **Bad debts written off** — debtors who cannot pay\n3. **Interest on overdue accounts** — charged to debtors\n4. **Drawings of stock** — owner takes goods for personal use\n5. **Depreciation** — annual reduction in asset value\n6. **Year-end adjustments** — accruals, prepayments, provisions\n7. **Opening entries** — when a business starts or at the beginning of a new financial year\n\n### GJ Format\n\n| Date | Details | Fol. | Debit | Credit |\n|------|---------|------|------:|-------:|\n| Mar 15 | Drawings | | 500 | |\n| | Trading stock | | | 500 |\n| | Owner took goods at cost for personal use | | | |'),
  t(2, '### Common GJ Entries\n\n**1. Owner takes stock for personal use (drawings of stock):**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Drawings | 500 | |\n| Trading stock | | 500 |\n| Cost of sales | | 500 |\n*The goods leave the business at cost price.*\n\n**2. Writing off a bad debt:**\nDebtor J. Sithole cannot pay R2 500.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bad debts | 2 500 | |\n| Debtors control | | 2 500 |\n*The bad debt is an expense. The debtor\'s account is removed.*\n\n**3. Interest on overdue account:**\nCharging debtor T. Moyo R150 interest.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Debtors control | 150 | |\n| Interest income | | 150 |\n*The debtor now owes more. Interest income is earned by the business.*'),
  q(3, 'The owner takes goods costing R800 from the business for personal use. The correct journal entry is:',
    ['Debit Drawings R800, Credit Trading stock R800', 'Debit Trading stock R800, Credit Drawings R800', 'Debit Drawings R800, Credit Bank R800', 'Debit Purchases R800, Credit Bank R800'], 0,
    'When the owner takes stock, it is drawings (equity decreases). Stock leaves the business. Debit Drawings, Credit Trading stock.'),
  fb(4, 'A bad debt is an ___ for the business. When a bad debt is written off, the ___ control account is credited.',
    ['expense', 'Debtors'],
    'Bad debts reduce profit (expense). The debtor who cannot pay is removed by crediting Debtors control.'),
  t(5, '### Correction of Errors\n\nErrors found in journals or the ledger are corrected through the GJ.\n\n**Example 1:** Stationery of R450 was incorrectly recorded as R540 in the CPJ.\n- Overcharged by R90 (R540 - R450 = R90)\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bank | 90 | |\n| Stationery | | 90 |\n*Reduce the expense and reduce the payment.*\n\n**Example 2:** A credit purchase of R3 000 from Nkosi Suppliers was recorded in the DJ instead of the CJ.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Debtors control | | 3 000 |\n| Sales | 3 000 | |\n| COS | | (amount) |\n| Trading stock | (amount) | |\n| Creditors control | | 3 000 |\n| Trading stock | 3 000 | |\n*Reverse the incorrect DJ entry and record the correct CJ entry.*'),
  q(6, 'A payment of R1 200 for telephone was incorrectly debited to the stationery account. The correcting entry is:',
    ['Debit Telephone R1 200, Credit Stationery R1 200', 'Debit Stationery R1 200, Credit Telephone R1 200', 'Debit Bank R1 200, Credit Telephone R1 200', 'Debit Telephone R1 200, Credit Bank R1 200'], 0,
    'The stationery account was debited in error. Correct by crediting Stationery (remove the wrong entry) and debiting Telephone (put it in the right account). Bank is not affected because the money was correctly paid.'),
  t(7, '## Introduction to the General Ledger\n\nThe General Ledger contains all the accounts of the business. Each account records debits and credits.\n\n### T-Account Format\n\n```\n          Bank Account              B1\n|  Debit (Dr)  |  Credit (Cr)  |\n|--------------|---------------|\n| Capital  100 000 | Trading stock  20 000 |\n| Sales     10 000 | Rent expense    8 000 |\n|                  | Balance c/d   82 000 |\n|         110 000 |              110 000 |\n| Balance b/d 82 000 |                     |\n```\n\n### Rules for Debits and Credits\n\n| Account type | Increases with | Decreases with | Normal balance |\n|-------------|---------------|----------------|---------------|\n| Asset | Debit | Credit | Debit |\n| Liability | Credit | Debit | Credit |\n| Owner\'s equity | Credit | Debit | Credit |\n| Income | Credit | Debit | Credit |\n| Expense | Debit | Credit | Debit |'),
  fb(8, 'Assets and expenses have normal ___ balances. Liabilities, equity, and income have normal ___ balances.',
    ['debit', 'credit'],
    'Assets and expenses increase on the debit side (normal debit balance). Liabilities, equity, and income increase on the credit side (normal credit balance).'),
  q(9, 'The Sales account normally has a:',
    ['Credit balance (income increases on the credit side)', 'Debit balance (sales are receipts)', 'Zero balance (it resets each day)', 'Debit balance (assets increase on the debit side)'], 0,
    'Sales is an income account. Income accounts increase on the credit side and have a normal credit balance.'),
  q(10, 'Which of the following GJ transactions would DEBIT the Debtors control account?',
    ['Interest charged on an overdue debtor account', 'Writing off a bad debt', 'A debtor returning goods', 'A debtor paying their account'], 0,
    'Charging interest on an overdue account increases what the debtor owes — Debtors control is debited. Writing off a bad debt, returns, and payments all credit Debtors control.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Posting to the Ledger and Trial Balance (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Posting and the Trial Balance ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Posting to the Ledger\n\nPosting is the process of transferring information from the journals to the ledger accounts.\n\n### Posting Rules Summary\n\n**From the CRJ:**\n- Bank → Debit (total)\n- Sales → Credit (total)\n- COS → Debit (total)\n- Trading stock → Credit (total)\n- Debtors control → Credit (total)\n- Discount granted → Debit (total)\n- Sundry → Credit individual accounts\n\n**From the CPJ:**\n- Bank → Credit (total)\n- Trading stock → Debit (total)\n- Creditors control → Debit (total)\n- Discount received → Credit (total)\n- Sundry → Debit individual accounts\n\n**From the DJ:**\n- Debtors control → Debit (total)\n- Sales → Credit (total)\n- COS → Debit (total)\n- Trading stock → Credit (total)\n\n**From the CJ:**\n- Creditors control → Credit (total)\n- Trading stock → Debit (total)'),
  t(2, '### The Debtors and Creditors Ledgers\n\nBesides the General Ledger, there are two **subsidiary ledgers**:\n\n**Debtors Ledger** — contains an account for each debtor (customer who owes money)\n- Debited when a credit sale is made (DJ)\n- Credited when payment is received (CRJ) or goods are returned (DAJ)\n\n**Creditors Ledger** — contains an account for each creditor (supplier the business owes)\n- Credited when a credit purchase is made (CJ)\n- Debited when payment is made (CPJ) or goods are returned (CAJ)\n\n### Control Accounts\n\nThe **Debtors control** account in the General Ledger is the total of all individual debtor accounts in the Debtors Ledger.\n\nThe **Creditors control** account in the General Ledger is the total of all individual creditor accounts in the Creditors Ledger.\n\nThey must always agree:\n$$\\text{Debtors control balance} = \\sum \\text{Individual debtor balances}$$'),
  q(3, 'The Debtors control account in the General Ledger should equal:',
    ['The total of all individual debtor balances in the Debtors Ledger', 'The total sales for the month', 'The total receipts from debtors', 'The total of the Bank account'], 0,
    'The Debtors control account is a summary of all individual debtor accounts. Its balance should match the sum of all individual debtor balances.'),
  fb(4, 'Individual debtor accounts are kept in the ___ Ledger. The total of these accounts equals the ___ control account in the General Ledger.',
    ['Debtors', 'Debtors'],
    'The Debtors Ledger contains individual accounts. The Debtors control account in the General Ledger is the summary total.'),
  t(5, '## The Trial Balance\n\nThe trial balance is a list of all ledger accounts with their **debit or credit balances** at a specific date. It checks the arithmetic accuracy of the double-entry system.\n\n### Trial Balance Format\n\n**Campusly Trading**\n**Trial Balance on 31 March 2026**\n\n| Account | Fol. | Debit | Credit |\n|---------|------|------:|-------:|\n| Bank | B1 | 82 000 | |\n| Trading stock | B2 | 14 000 | |\n| Equipment | B3 | 30 000 | |\n| Capital | B4 | | 100 000 |\n| Sales | N1 | | 33 700 |\n| Cost of sales | N2 | 20 220 | |\n| Debtors control | B5 | 6 700 | |\n| Creditors control | B6 | | 9 000 |\n| Discount granted | N3 | 250 | |\n| Discount received | N4 | | 500 |\n| Rent income | N5 | | 3 500 |\n| Rent expense | N6 | 8 000 | |\n| Salaries | N7 | 15 000 | |\n| Telephone | N8 | 1 200 | |\n| Stationery | N9 | 830 | |\n| Drawings | B7 | 500 | |\n| Bad debts | N10 | 2 500 | |\n| **Totals** | | **181 200** | **146 700** |\n\n*Note: These sample figures are for illustration — in a real trial balance, the totals must be equal.*'),
  t(6, '### Rules for the Trial Balance\n\n1. **The total of all debit balances must equal the total of all credit balances**\n2. If the totals do not agree, there is an error that must be found and corrected\n3. A balanced trial balance does NOT guarantee that the books are free of errors\n\n### Errors NOT Revealed by the Trial Balance\n\n| Error type | Description | Example |\n|-----------|-------------|--------|\n| **Error of omission** | Transaction not recorded at all | A cash sale was completely missed |\n| **Error of commission** | Correct amount, wrong personal account | Posted to T. Moyo instead of T. Nkosi |\n| **Error of principle** | Correct amount, wrong type of account | Equipment purchase debited to Purchases |\n| **Error of original entry** | Wrong amount on both sides | R1 350 recorded as R1 530 on both sides |\n| **Compensating errors** | Two errors cancel each other out | Over-debit of R100 and over-credit of R100 in different accounts |\n| **Complete reversal** | Debits and credits swapped | Debited Sales and credited Bank for a cash sale |'),
  q(7, 'A cash sale of R5 000 was not recorded in the CRJ at all. This is an error of:',
    ['Omission', 'Commission', 'Principle', 'Original entry'], 0,
    'An error of omission occurs when a transaction is completely left out of the books. The trial balance will still balance because nothing was recorded.'),
  fb(8, 'The trial balance checks the ___ accuracy of double-entry bookkeeping. However, it does NOT detect errors of ___ (where a transaction was completely missed).',
    ['arithmetic', 'omission'],
    'The trial balance only verifies that total debits equal total credits. Errors of omission affect both sides equally (or not at all) so they remain hidden.'),
  q(9, 'Equipment purchased for R15 000 was debited to the Purchases account. This is an error of:',
    ['Principle', 'Omission', 'Commission', 'Original entry'], 0,
    'An error of principle occurs when the correct amount is posted to the wrong TYPE of account. Equipment is an asset, not a purchase of trading stock.'),
  t(10, '### The Accounts in the Trial Balance\n\n**Balance sheet accounts** (prefixed B in folio) carry forward to the next period:\n- Assets, Liabilities, Owner\'s equity, Drawings, Debtors/Creditors control\n\n**Nominal accounts** (prefixed N in folio) are closed off at year-end:\n- Income accounts (Sales, Rent income, Discount received, Interest income)\n- Expense accounts (COS, Rent expense, Salaries, Telephone, Bad debts, Discount granted)\n\nNominal accounts are transferred to the **Trading account** and **Profit and Loss account** to calculate profit.\n\n### Balancing an Account\nTo balance an account at month-end:\n1. Total the larger side\n2. Enter that total on BOTH sides\n3. The difference is the **balance carried down (c/d)**\n4. Bring the balance down (b/d) on the opposite side to start the new period'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Financial Statements of a Sole Trader — Part 1 (Term 1–2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Trading Account and Income Statement ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Financial Statements of a Sole Trader\n\nAt the end of the financial year, the business prepares two main financial statements:\n\n1. **Income Statement** (formerly called the Trading, Profit and Loss Account) — shows profit or loss for the period\n2. **Balance Sheet** (Statement of Financial Position) — shows what the business owns and owes on a specific date\n\n### The Income Statement\n\nThe Income Statement has two main sections:\n\n**Section 1 — Trading Account:**\nCalculates **gross profit** (profit from buying and selling goods)\n\n$$\\text{Gross profit} = \\text{Sales} - \\text{Cost of sales}$$\n\n**Section 2 — Profit and Loss Account:**\nCalculates **net profit** (profit after all expenses)\n\n$$\\text{Net profit} = \\text{Gross profit} + \\text{Other income} - \\text{Operating expenses}$$'),
  t(2, '### Income Statement Format\n\n**Campusly Trading**\n**Income Statement for the year ended 28 February 2026**\n\n| | Note | R |\n|---|---|---:|\n| **Sales** | | 500 000 |\n| **Cost of sales** | | (300 000) |\n| Opening stock | | 40 000 |\n| Purchases | | 310 000 |\n| Carriage on purchases | | 5 000 |\n| | | 355 000 |\n| Less: Closing stock | | (55 000) |\n| | | |\n| **Gross profit** | | **200 000** |\n| **Other operating income** | | 15 000 |\n| Rent income | | 12 000 |\n| Discount received | | 3 000 |\n| | | |\n| **Gross operating income** | | **215 000** |\n| **Less: Operating expenses** | | **(140 000)** |\n| Salaries and wages | | 60 000 |\n| Rent expense | | 24 000 |\n| Water and electricity | | 18 000 |\n| Bad debts | | 3 000 |\n| Depreciation | | 15 000 |\n| Discount granted | | 4 000 |\n| Other expenses | | 16 000 |\n| | | |\n| **Net profit** | | **75 000** |'),
  q(3, 'Gross profit is calculated as:',
    ['Sales minus Cost of sales', 'Sales minus Operating expenses', 'Total income minus Total expenses', 'Sales minus Purchases'], 0,
    'Gross profit = Sales - Cost of sales. This measures the profit from trading (buying and selling goods) before operating expenses are deducted.'),
  fb(4, 'The Income Statement shows the financial performance over a ___. The Balance Sheet shows the financial position at a specific ___.',
    ['period', 'date'],
    'The Income Statement covers a time period (e.g., year ended 28 February 2026). The Balance Sheet is a snapshot at a single date (e.g., on 28 February 2026).'),
  t(5, '### Cost of Sales Calculation\n\nFor a business using the **perpetual inventory system** (Grade 10):\n\n$$\\text{Cost of sales} = \\text{Opening stock} + \\text{Net purchases} - \\text{Closing stock}$$\n\nWhere:\n$$\\text{Net purchases} = \\text{Purchases} + \\text{Carriage on purchases} - \\text{Returns (sales returns adjustments)}$$\n\n**Items that form part of Cost of Sales:**\n- Opening stock (beginning inventory)\n- Purchases of trading stock\n- Carriage on purchases (delivery cost to get goods to the business)\n- Less: Closing stock (ending inventory)\n\n**Items that do NOT form part of Cost of Sales:**\n- Carriage on sales (delivery to customers — this is an operating expense)\n- Sales returns (deducted from Sales, not COS)\n- Salaries and wages (operating expense)\n\n### Sales Calculation\n$$\\text{Net sales} = \\text{Sales} - \\text{Sales returns}$$'),
  q(6, 'Carriage on purchases of R2 500 is:',
    ['Added to Cost of Sales (it is part of getting stock to the business)', 'Deducted from Sales', 'An operating expense', 'Added to closing stock'], 0,
    'Carriage on purchases is the delivery cost of getting goods to the business. It forms part of the cost of acquiring stock, so it is included in Cost of Sales.'),
  fb(7, 'Carriage on purchases is part of ___. Carriage on sales is an ___.',
    ['Cost of Sales', 'operating expense'],
    'Carriage on purchases = cost of getting stock to the business (COS). Carriage on sales = cost of delivering to customers (operating expense).'),
  t(8, '### Other Operating Income\n\nIncome earned from activities other than selling goods:\n\n| Item | Description |\n|------|------------|\n| Rent income | Renting out part of the building |\n| Commission income | Earning commission for selling others\' goods |\n| Discount received | Settlement discount from creditors |\n| Interest income | Interest earned on bank balances |\n| Bad debts recovered | Previously written-off debts now collected |\n\nThese are added to gross profit to give **gross operating income**.\n\n### Operating Expenses\n\nCosts of running the business:\n- Salaries and wages, Rent expense, Water and electricity\n- Telephone, Insurance, Stationery\n- Bad debts, Depreciation\n- Discount granted, Bank charges\n- Repairs and maintenance'),
  q(9, 'Discount received from a creditor is classified as:',
    ['Other operating income', 'A reduction in Cost of Sales', 'An operating expense', 'An adjustment to Sales'], 0,
    'Discount received is income earned by paying creditors early. It is classified as other operating income, not a reduction in COS.'),
  q(10, 'Net profit is calculated as:',
    ['Gross operating income minus Operating expenses', 'Sales minus Cost of Sales', 'Gross profit minus Purchases', 'Total assets minus Total liabilities'], 0,
    'Net profit = Gross operating income (gross profit + other income) - Operating expenses. It represents the final profit after all expenses.'),
];

// --- Lesson 2: Balance Sheet ---
blockNum = 0;
const ch7_lesson2 = [
  t(1, '## The Balance Sheet (Statement of Financial Position)\n\nThe Balance Sheet shows the financial position of the business at a **specific date**. It lists all assets, liabilities, and owner\'s equity.\n\n### The Balance Sheet Equation\n\n$$\\text{Assets} = \\text{Owner\'s equity} + \\text{Liabilities}$$\n\n### Balance Sheet Format\n\n**Campusly Trading**\n**Balance Sheet on 28 February 2026**\n\n| | Note | R |\n|---|---|---:|\n| **ASSETS** | | |\n| **Non-current assets** | | **125 000** |\n| Land and buildings | | 80 000 |\n| Equipment at cost | | 60 000 |\n| Accumulated depreciation | | (15 000) |\n| | | |\n| **Current assets** | | **138 000** |\n| Trading stock | | 55 000 |\n| Debtors control | | 32 000 |\n| Prepaid expenses | | 1 000 |\n| Bank | | 50 000 |\n| | | |\n| **Total assets** | | **263 000** |'),
  t(2, '### Balance Sheet (continued)\n\n| | Note | R |\n|---|---|---:|\n| **EQUITY AND LIABILITIES** | | |\n| **Owner\'s equity** | | **175 000** |\n| Capital | | 120 000 |\n| Net profit | | 75 000 |\n| Less: Drawings | | (20 000) |\n| | | |\n| **Non-current liabilities** | | **40 000** |\n| Long-term loan (Nedbank) | | 40 000 |\n| | | |\n| **Current liabilities** | | **48 000** |\n| Creditors control | | 28 000 |\n| Accrued expenses | | 5 000 |\n| SARS (Income tax) | | 8 000 |\n| Bank overdraft | | 7 000 |\n| | | |\n| **Total equity and liabilities** | | **263 000** |\n\n**Note:** Total assets MUST equal Total equity and liabilities. If they do not, there is an error.\n\n**Important:** Bank and Bank overdraft are different:\n- Positive bank balance → Current asset\n- Bank overdraft (negative balance) → Current liability'),
  q(3, 'On the Balance Sheet, where does the bank overdraft appear?',
    ['Under Current liabilities', 'Under Current assets', 'Under Non-current liabilities', 'Under Owner\'s equity'], 0,
    'A bank overdraft means the business owes the bank money (the account is negative). It is a short-term debt, so it appears under Current liabilities.'),
  fb(4, 'A positive bank balance is a current ___. A bank overdraft is a current ___.',
    ['asset', 'liability'],
    'If the bank balance is positive (the business has money), it is an asset. If the bank is in overdraft (the business owes the bank), it is a liability.'),
  t(5, '### Owner\'s Equity Section\n\nThe owner\'s equity section shows how the owner\'s investment has changed:\n\n$$\\text{Owner\'s equity} = \\text{Capital} + \\text{Net profit} - \\text{Drawings}$$\n\nOr if there is a net loss:\n$$\\text{Owner\'s equity} = \\text{Capital} - \\text{Net loss} - \\text{Drawings}$$\n\n**Capital** — what the owner originally invested plus any additional capital contributions\n**Net profit** — earned during the year (transferred from the Income Statement)\n**Drawings** — cash, stock, or other assets taken by the owner for personal use\n\n### Additional Capital\n\nIf the owner contributes more capital during the year:\n\n| | R |\n|---|---:|\n| Capital at beginning of year | 100 000 |\n| Additional capital contributed | 20 000 |\n| | 120 000 |\n| Net profit | 75 000 |\n| Less: Drawings | (20 000) |\n| **Owner\'s equity** | **175 000** |'),
  q(6, 'Capital at the start of the year is R200 000. Net profit is R50 000 and drawings are R30 000. Owner\'s equity at year-end is:',
    ['R220 000', 'R200 000', 'R280 000', 'R180 000'], 0,
    'Owner\'s equity = Capital + Net profit - Drawings = R200 000 + R50 000 - R30 000 = R220 000.'),
  t(7, '### Notes to the Financial Statements\n\nCertain items on the Balance Sheet may require additional detail in the **notes**:\n\n**Note 1: Fixed/Tangible assets**\n\n| | Land & Buildings | Equipment | Total |\n|---|---:|---:|---:|\n| Cost | 80 000 | 60 000 | 140 000 |\n| Accumulated depreciation | — | (15 000) | (15 000) |\n| **Carrying value** | **80 000** | **45 000** | **125 000** |\n\n**Note 2: Trade and other receivables**\n\n| | R |\n|---|---:|\n| Debtors control | 32 000 |\n| Less: Provision for bad debts | (1 600) |\n| Net debtors | 30 400 |\n| Prepaid expenses | 1 000 |\n| **Total** | **31 400** |\n\n**Note 3: Trade and other payables**\n\n| | R |\n|---|---:|\n| Creditors control | 28 000 |\n| Accrued expenses | 5 000 |\n| SARS | 8 000 |\n| **Total** | **41 000** |'),
  fb(8, 'The carrying value of an asset is calculated as ___ minus accumulated depreciation. Notes provide additional ___ about items on the Balance Sheet.',
    ['cost', 'detail'],
    'Carrying value = Cost - Accumulated depreciation. Notes break down summary amounts shown on the main Balance Sheet.'),
  q(9, 'Which of the following is NOT a current asset?',
    ['Land and buildings', 'Trading stock', 'Debtors control', 'Bank'], 0,
    'Land and buildings is a non-current (fixed) asset because it is used in the business for more than one year. Trading stock, debtors, and bank are all current assets.'),
  q(10, 'If Total assets = R500 000 and Total liabilities = R180 000, the owner\'s equity is:',
    ['R320 000', 'R680 000', 'R500 000', 'R180 000'], 0,
    'From the accounting equation: Owner\'s equity = Assets - Liabilities = R500 000 - R180 000 = R320 000.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: VAT for Sole Traders (Term 1–2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: VAT Basics and the VAT Control Account ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Value-Added Tax (VAT)\n\nVAT is an **indirect tax** charged on the supply of goods and services in South Africa. The current rate is **15%**, administered by **SARS** (South African Revenue Service).\n\n### How VAT Works\n\n1. When a VAT-registered business (vendor) **sells** goods, it adds 15% VAT to the selling price. This is called **output VAT** — it is collected on behalf of SARS.\n\n2. When the business **buys** goods or pays expenses, the supplier charges 15% VAT. This is called **input VAT** — the business can claim it back from SARS.\n\n3. The business pays the **difference** to SARS:\n\n$$\\text{VAT payable to SARS} = \\text{Output VAT} - \\text{Input VAT}$$\n\n### Example\n- Business buys goods for R1 000 + R150 VAT = R1 150 (input VAT = R150)\n- Business sells goods for R2 000 + R300 VAT = R2 300 (output VAT = R300)\n- VAT payable to SARS = R300 - R150 = **R150**\n\nThe business only pays tax on the **value added** (R2 000 - R1 000 = R1 000 value added, 15% of R1 000 = R150).'),
  t(2, '### VAT Calculations\n\n**Adding VAT (exclusive → inclusive):**\n$$\\text{Inclusive} = \\text{Exclusive} \\times 1.15$$\n\n**Extracting VAT from an inclusive amount:**\n$$\\text{VAT} = \\text{Inclusive} \\times \\frac{15}{115}$$\n$$\\text{Exclusive} = \\text{Inclusive} \\times \\frac{100}{115}$$\n\n**Examples:**\n\n| Scenario | Calculation | Result |\n|----------|------------|--------|\n| Goods cost R600 ex. VAT | R600 × 1.15 | R690 incl. |\n| Total bill R920 incl. VAT | R920 × 15/115 | R120 VAT |\n| Total bill R920 incl. VAT | R920 × 100/115 | R800 excl. |\n\n### Common Mistake\n**WRONG:** R920 × 15% = R138 (this adds 15% instead of extracting it)\n**RIGHT:** R920 × 15/115 = R120\n\nWhen extracting VAT from an inclusive amount, always use **15/115**, never 15/100.'),
  q(3, 'The total price of goods including 15% VAT is R1 725. The price excluding VAT is:',
    ['R1 500', 'R1 466.25', 'R1 725', 'R1 467.39'], 0,
    'Exclusive = R1 725 × 100/115 = R1 500. VAT = R1 725 × 15/115 = R225. Check: R1 500 + R225 = R1 725.'),
  fb(4, 'VAT charged on sales is called ___ VAT. VAT paid on purchases and expenses is called ___ VAT.',
    ['output', 'input'],
    'Output VAT is collected from customers (output = what goes out to SARS). Input VAT is paid to suppliers (input = what the business claims back).'),
  t(5, '### Zero-Rated and Exempt Items\n\n**Zero-rated (0% VAT):**\nVAT is charged at 0%. The vendor can still claim input VAT on related costs.\n\nExamples in South Africa:\n- Brown bread, maize meal, samp, rice\n- Fresh fruit and vegetables, dried beans and lentils\n- Vegetable cooking oil, milk, eggs\n- Pilchards and sardines in tins\n- Petrol and diesel\n- Exports\n\n**Exempt (no VAT):**\nNo VAT is charged at all. The vendor CANNOT claim input VAT on related costs.\n\nExamples:\n- Financial services (bank charges, insurance)\n- Residential rental\n- Educational services (school fees)\n- Public transport (bus, train)\n\n| | Zero-rated | Exempt |\n|---|---|---|\n| VAT charged | 0% | No VAT |\n| Claim input VAT? | Yes | No |'),
  q(6, 'Which of the following is zero-rated for VAT purposes in South Africa?',
    ['Maize meal', 'White bread', 'Chocolate', 'Soft drinks'], 0,
    'Maize meal is one of the basic foodstuffs that are zero-rated in South Africa to make essential food more affordable.'),
  t(7, '### VAT in the Journals\n\n**In the CRJ (cash sale R11 500 incl. VAT):**\n- Bank = R11 500\n- Sales = R10 000 (exclusive)\n- VAT output = R1 500\n\n**In the CPJ (cash purchase R5 750 incl. VAT):**\n- Bank = R5 750\n- Trading stock = R5 000 (exclusive)\n- VAT input = R750\n\n**In the DJ (credit sale R6 900 incl. VAT):**\n- Debtors control = R6 900 (inclusive)\n- Sales = R6 000 (exclusive)\n- VAT output = R900\n\n**Key rule:** Debtors and creditors are always recorded at the **VAT-inclusive** amount. Sales, purchases, and expenses are recorded at the **VAT-exclusive** amount. VAT is recorded separately in the VAT control account.'),
  q(8, 'A credit sale of R9 200 (VAT inclusive) is recorded in the DJ. The Sales column shows:',
    ['R8 000 (exclusive of VAT)', 'R9 200 (inclusive of VAT)', 'R1 200 (VAT only)', 'R7 820'], 0,
    'Sales = R9 200 × 100/115 = R8 000. The Debtors control column shows R9 200 (inclusive). The VAT output column shows R1 200.'),
  fb(9, 'Debtors are recorded at the VAT-___ amount. Expenses on the Income Statement are shown at the VAT-___ amount.',
    ['inclusive', 'exclusive'],
    'Debtors owe the full amount including VAT. Revenue and expenses are reported net of VAT because VAT belongs to SARS, not the business.'),
  t(10, '### The VAT Control Account\n\n| Debit | R | Credit | R |\n|-------|---:|--------|---:|\n| Input VAT (purchases) | 30 000 | Output VAT (sales) | 52 000 |\n| Input VAT (expenses) | 6 000 | | |\n| SARS (amount paid) | 16 000 | | |\n| | **52 000** | | **52 000** |\n\n**Calculation:**\n- Output VAT = R52 000\n- Input VAT = R30 000 + R6 000 = R36 000\n- VAT payable = R52 000 - R36 000 = **R16 000**\n\nIf output VAT > input VAT → the business owes SARS (current liability)\nIf input VAT > output VAT → SARS owes the business (current asset)\n\nThe VAT amount owed to SARS appears on the Balance Sheet under **current liabilities** until it is paid.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Year-End Adjustments (Term 2–3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Adjustments Concepts ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Year-End Adjustments\n\nAt the end of the financial year, certain accounts need to be adjusted so that the financial statements reflect the **true** financial position and performance of the business.\n\nThe adjustments ensure compliance with the **matching principle** — income and expenses must be recorded in the period in which they are earned or incurred, not when cash is received or paid.\n\n### Types of Year-End Adjustments\n\n| Adjustment | Description |\n|-----------|------------|\n| **Accrued expenses** | Expenses incurred but not yet paid |\n| **Prepaid expenses** | Expenses paid in advance |\n| **Accrued income** | Income earned but not yet received |\n| **Income received in advance** | Income received but not yet earned |\n| **Depreciation** | Wear and tear on fixed assets |\n| **Bad debts** | Debtors who cannot or will not pay |\n| **Provision for bad debts** | Estimate of future bad debts |\n| **Trading stock deficit/surplus** | Physical stock differs from records |'),
  t(2, '### 1. Accrued Expenses (Expenses Owing)\n\nAn expense has been incurred but **not yet paid** at year-end.\n\n**Example:** The business owes R1 500 for electricity used in February but the bill has not been received.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Water and electricity | 1 500 | |\n| Accrued expenses (creditors) | | 1 500 |\n\n**Effect on financial statements:**\n- Income Statement: Electricity expense increases by R1 500\n- Balance Sheet: Accrued expenses (current liability) increases by R1 500\n\n### 2. Prepaid Expenses (Expenses Paid in Advance)\n\nAn expense paid in the current year but relates to the **next** financial year.\n\n**Example:** Insurance of R2 400 was paid for 12 months (March to February), but R600 relates to the next year (3 months from December to February).\n\n| | Debit | Credit |\n|---|---:|---:|\n| Prepaid expenses | 600 | |\n| Insurance | | 600 |\n\n**Effect:**\n- Income Statement: Insurance expense decreases by R600\n- Balance Sheet: Prepaid expenses (current asset) appears as R600'),
  q(3, 'Telephone expense for the year is R12 000 on the trial balance. An additional R800 is owed at year-end. The amount shown on the Income Statement is:',
    ['R12 800', 'R12 000', 'R11 200', 'R800'], 0,
    'The accrued expense of R800 must be added: R12 000 + R800 = R12 800. This ensures the full year\'s expense is recorded.'),
  fb(4, 'Accrued expenses are expenses that have been ___ but not yet paid. Prepaid expenses are expenses that have been paid but relate to the ___ period.',
    ['incurred', 'next'],
    'Accrued = owed at year-end (still to be paid). Prepaid = paid in advance (relates to the future).'),
  t(5, '### 3. Income Received in Advance (Deferred Income)\n\nMoney received for services/goods that will be provided in the **next** period.\n\n**Example:** Rent income received R36 000 for the year, but R3 000 relates to March (next financial year).\n\n| | Debit | Credit |\n|---|---:|---:|\n| Rent income | 3 000 | |\n| Income received in advance | | 3 000 |\n\n**Effect:**\n- Income Statement: Rent income decreases to R33 000\n- Balance Sheet: Income received in advance (current liability) = R3 000\n\n### 4. Accrued Income (Income Receivable)\n\nIncome earned but **not yet received** at year-end.\n\n**Example:** The business earned R2 000 interest from the bank for February but it will only be received in March.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Accrued income | 2 000 | |\n| Interest income | | 2 000 |\n\n**Effect:**\n- Income Statement: Interest income increases by R2 000\n- Balance Sheet: Accrued income (current asset) = R2 000'),
  q(6, 'Rent income on the trial balance is R48 000. Of this, R4 000 was received in advance for the next year. The amount on the Income Statement is:',
    ['R44 000', 'R48 000', 'R52 000', 'R4 000'], 0,
    'Income received in advance must be deducted: R48 000 - R4 000 = R44 000. Only the income earned in the current period is reported.'),
  fb(7, 'Income received in advance is a current ___ on the Balance Sheet. Accrued income is a current ___ on the Balance Sheet.',
    ['liability', 'asset'],
    'Income received in advance = the business owes a service/good (liability). Accrued income = someone owes the business (asset).'),
  t(8, '### 5. Trading Stock Deficit/Surplus\n\nAt year-end, a physical stock count is done. If the actual stock differs from the records:\n\n**Stock deficit** (actual stock < records):\nCaused by theft, damage, or errors.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Stock deficit (or Trading stock deficit) | 500 | |\n| Trading stock | | 500 |\n\nThe deficit is an expense on the Income Statement.\n\n**Stock surplus** (actual stock > records):\nRare — caused by receiving extra goods or recording errors.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Trading stock | 300 | |\n| Stock surplus (or Trading stock surplus) | | 300 |\n\nThe surplus is income on the Income Statement.\n\n### Closing Stock on the Balance Sheet\nAlways use the **physical count** value, not the ledger value.\nIf ledger shows R55 000 but physical count shows R54 500:\n- Stock deficit = R500\n- Balance Sheet shows stock at R54 500'),
  q(9, 'The trading stock account shows R42 000. A physical stock count reveals stock of R40 800. The stock deficit is:',
    ['R1 200', 'R42 000', 'R40 800', 'R82 800'], 0,
    'Stock deficit = Records - Physical count = R42 000 - R40 800 = R1 200. This is written off as an expense.'),
  q(10, 'A prepaid expense appears on the Balance Sheet as a:',
    ['Current asset', 'Current liability', 'Non-current asset', 'Operating expense'], 0,
    'Prepaid expenses represent value that will benefit the next period — it is an asset. It appears under current assets on the Balance Sheet.'),
];

// --- Lesson 2: Depreciation and Bad Debts ---
blockNum = 0;
const ch9_lesson2 = [
  t(1, '## Depreciation\n\nDepreciation is the systematic allocation of the cost of a fixed asset over its useful life. It recognises that assets lose value due to **wear and tear**, **age**, or **obsolescence**.\n\n### Depreciation is NOT:\n- A cash expense (no money leaves the bank)\n- The market value of the asset\n- An exact calculation — it is an estimate\n\n### Two Methods of Depreciation\n\n**1. Straight-Line Method**\n$$\\text{Annual depreciation} = \\frac{\\text{Cost} - \\text{Residual value}}{\\text{Useful life}}$$\n\nThe amount is the **same every year**.\n\n**Example:** Equipment costs R40 000, residual value R4 000, useful life 4 years.\n- Annual depreciation = (R40 000 - R4 000) / 4 = **R9 000 per year**\n\n**2. Diminishing Balance Method**\n$$\\text{Annual depreciation} = \\text{Carrying value} \\times \\text{Rate}$$\n\nThe amount **decreases each year** because the carrying value gets smaller.\n\n**Example:** Vehicle costs R120 000, depreciation 20% p.a. on diminishing balance.\n- Year 1: R120 000 × 20% = R24 000 (carrying value = R96 000)\n- Year 2: R96 000 × 20% = R19 200 (carrying value = R76 800)'),
  t(2, '### Depreciation Journal Entry\n\n| | Debit | Credit |\n|---|---:|---:|\n| Depreciation | 9 000 | |\n| Accumulated depreciation: Equipment | | 9 000 |\n\n**Key points:**\n- Depreciation is an **expense** → reduces profit on the Income Statement\n- Accumulated depreciation is a **contra-asset** → reduces the asset value on the Balance Sheet\n- The cost of the asset does NOT change\n\n**Balance Sheet presentation:**\n\n| | R |\n|---|---:|\n| Equipment at cost | 40 000 |\n| Less: Accumulated depreciation | (9 000) |\n| **Carrying value** | **31 000** |\n\n### Carrying Value\n$$\\text{Carrying value} = \\text{Cost} - \\text{Accumulated depreciation}$$\n\nThe carrying value (also called book value) represents the remaining value of the asset on the books. It is NOT necessarily the market value.'),
  q(3, 'A vehicle costs R180 000 and is depreciated at 25% p.a. on the diminishing balance method. The depreciation for Year 2 is:',
    ['R33 750', 'R45 000', 'R135 000', 'R180 000'], 0,
    'Year 1: R180 000 × 25% = R45 000. Carrying value = R135 000. Year 2: R135 000 × 25% = R33 750.'),
  fb(4, 'Depreciation is an expense on the ___. Accumulated depreciation appears on the ___ as a deduction from the asset cost.',
    ['Income Statement', 'Balance Sheet'],
    'Annual depreciation is an expense that reduces profit. Accumulated depreciation is the running total of all depreciation to date, shown on the Balance Sheet.'),
  t(5, '## Bad Debts\n\nA bad debt occurs when a debtor **cannot or will not pay** the amount owed to the business.\n\n### Writing Off a Bad Debt\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bad debts | 3 000 | |\n| Debtors control | | 3 000 |\n\n**Effect:**\n- Bad debts is an expense (reduces profit)\n- The debtor\'s account is removed from the Debtors Ledger\n\n### Provision for Bad Debts\n\nThe business estimates that a percentage of total debtors may not pay. This creates a **provision** (allowance) for possible future bad debts.\n\n**Example:** Total debtors = R50 000. The business provides for 5% bad debts.\n- Provision = R50 000 × 5% = R2 500\n\n**If this is the first time creating the provision:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bad debts | 2 500 | |\n| Provision for bad debts | | 2 500 |'),
  t(6, '### Adjusting the Provision for Bad Debts\n\nEach year, the provision must be recalculated based on the **closing balance** of Debtors control (after writing off actual bad debts).\n\n**Example:** Previous provision = R2 500. New debtors balance = R60 000. Provision rate = 5%.\n- Required provision = R60 000 × 5% = R3 000\n- Increase needed = R3 000 - R2 500 = R500\n\n**Increase in provision:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bad debts | 500 | |\n| Provision for bad debts | | 500 |\n\n**Decrease in provision (if debtors balance dropped):**\nIf required provision = R2 000 and existing provision = R2 500:\n- Decrease = R2 500 - R2 000 = R500\n\n| | Debit | Credit |\n|---|---:|---:|\n| Provision for bad debts | 500 | |\n| Bad debts | | 500 |\n\n### On the Balance Sheet\nDebtors control is shown NET of the provision:\n\n| | R |\n|---|---:|\n| Debtors control | 60 000 |\n| Less: Provision for bad debts | (3 000) |\n| **Net debtors** | **57 000** |'),
  q(7, 'Debtors control is R80 000 after writing off bad debts. The provision for bad debts is 4%. If the existing provision is R2 800, the adjustment is:',
    ['Increase the provision by R400 (debit Bad debts R400)', 'Decrease the provision by R400', 'No adjustment needed', 'Increase by R3 200'], 0,
    'Required provision = R80 000 × 4% = R3 200. Existing = R2 800. Increase = R3 200 - R2 800 = R400. Debit Bad debts, Credit Provision.'),
  fb(8, 'Bad debts written off is an ___. The provision for bad debts is deducted from ___ on the Balance Sheet.',
    ['expense', 'Debtors control'],
    'Bad debts reduce profit (expense). The provision reduces the debtors balance to show the expected collectable amount.'),
  q(9, 'Which depreciation method gives a higher depreciation amount in Year 1?',
    ['Diminishing balance (because it applies the rate to the full cost)', 'Straight-line (because the amount is equal)', 'Both give the same amount in Year 1', 'It depends on the asset type'], 0,
    'In Year 1, the diminishing balance method calculates depreciation on the full cost (highest carrying value), giving a higher amount than straight-line if the rate is comparable. Note: the rate for diminishing balance is typically higher than for straight-line.'),
  t(10, '### Summary of Year-End Adjustments\n\n| Adjustment | Debit | Credit | IS Effect | BS Effect |\n|-----------|-------|--------|-----------|----------|\n| Accrued expense | Expense ↑ | Accrued expenses | Expense increases | CL increases |\n| Prepaid expense | Prepaid expenses | Expense ↓ | Expense decreases | CA increases |\n| Income received in advance | Income ↓ | Income in advance | Income decreases | CL increases |\n| Accrued income | Accrued income | Income ↑ | Income increases | CA increases |\n| Depreciation | Depreciation | Accum. depr. | Expense increases | NCA decreases |\n| Bad debt written off | Bad debts | Debtors control | Expense increases | CA decreases |\n| Increase in provision | Bad debts | Provision | Expense increases | CA net decreases |\n| Stock deficit | Stock deficit | Trading stock | Expense increases | CA decreases |\n\n*IS = Income Statement, BS = Balance Sheet, CL = Current liability, CA = Current asset, NCA = Non-current asset*'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Salaries and Wages (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Salaries, Wages, and Deductions ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Salaries and Wages\n\nEmployees are compensated for their work through **salaries** (fixed monthly amount) or **wages** (based on hours worked).\n\n### Key Terminology\n\n| Term | Definition |\n|------|----------|\n| **Gross salary/wage** | Total earnings before any deductions |\n| **Deductions** | Amounts subtracted from gross pay |\n| **Net salary/wage** | Amount the employee actually receives (take-home pay) |\n| **Normal time** | Regular working hours |\n| **Overtime** | Hours worked beyond normal time (paid at a higher rate) |\n\n$$\\text{Net pay} = \\text{Gross pay} - \\text{Total deductions}$$\n\n### Overtime Rates in South Africa\n\n| Type | Rate | Example (Normal rate R100/hr) |\n|------|------|------------------------------|\n| Weekday overtime | 1.5 × normal rate | R150 per hour |\n| Sunday/Public holiday | 2 × normal rate | R200 per hour |\n\n**Example:**\nNormal hours: 40 hrs × R80 = R3 200\nOvertime (weekday): 5 hrs × R120 (R80 × 1.5) = R600\nOvertime (Sunday): 4 hrs × R160 (R80 × 2) = R640\n**Gross wage = R3 200 + R600 + R640 = R4 440**'),
  t(2, '### Employee Deductions\n\nDeductions reduce the employee\'s gross pay:\n\n| Deduction | Description | Who benefits |\n|-----------|------------|-------------|\n| **PAYE** (Pay As You Earn) | Income tax deducted at source | SARS |\n| **UIF** (Unemployment Insurance Fund) | 1% of gross salary | Department of Employment and Labour |\n| **Pension fund** | Retirement savings contribution | Employee (future retirement) |\n| **Medical aid** | Health insurance contribution | Medical aid scheme |\n| **Union membership** | Trade union fees | Trade union |\n\n### Employer Contributions\n\nThe employer also contributes towards certain funds on behalf of the employee:\n\n| Contribution | Rate |\n|-------------|------|\n| UIF | 1% of gross salary (matching the employee\'s 1%) |\n| Pension fund | Often matches or exceeds the employee contribution |\n| SDL (Skills Development Levy) | 1% of total payroll |\n| Medical aid | Often subsidises a portion |\n\n**Important:** Employer contributions are an additional expense for the business, NOT deducted from the employee\'s pay.'),
  q(3, 'An employee earns a gross salary of R18 000. Deductions: PAYE R2 700, UIF R180, Pension R900, Medical aid R1 200. The net salary is:',
    ['R13 020', 'R18 000', 'R14 220', 'R4 980'], 0,
    'Net salary = R18 000 - R2 700 - R180 - R900 - R1 200 = R13 020.'),
  fb(4, 'PAYE stands for Pay As You ___. UIF stands for ___ Insurance Fund.',
    ['Earn', 'Unemployment'],
    'PAYE is income tax deducted at source. UIF provides short-term financial relief to workers who become unemployed.'),
  t(5, '### Recording Salaries in the Books\n\n**Salary Journal (part of the CPJ or a separate journal):**\n\nThe total gross salary is the expense. Deductions are liabilities until paid over to the respective bodies.\n\n**Journal entry for salaries:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Salaries (gross) | 18 000 | |\n| SARS (PAYE) | | 2 700 |\n| UIF payable | | 180 |\n| Pension fund payable | | 900 |\n| Medical aid payable | | 1 200 |\n| Bank (net salary paid) | | 13 020 |\n\n**Employer contributions:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| UIF expense (employer) | 180 | |\n| Pension fund expense (employer) | 900 | |\n| SDL expense | 180 | |\n| UIF payable | | 180 |\n| Pension fund payable | | 900 |\n| SDL payable | | 180 |'),
  q(6, 'The employer\'s UIF contribution is:',
    ['1% of the employee\'s gross salary, paid by the employer', 'Deducted from the employee\'s net salary', 'Paid by SARS', '2% of the employee\'s gross salary'], 0,
    'The employer contributes 1% of the employee\'s gross salary to UIF. This matches the 1% deducted from the employee. Total UIF = 2% (1% employee + 1% employer).'),
  t(7, '### The Salary Advice Slip\n\nEach employee receives a **salary advice slip** (payslip) showing:\n\n**Campusly Trading — Salary Advice: T. Nkosi — February 2026**\n\n| | R |\n|---|---:|\n| Basic salary | 18 000 |\n| Overtime | 1 500 |\n| **Gross salary** | **19 500** |\n| Less: Deductions | |\n| PAYE | (3 200) |\n| UIF (1%) | (195) |\n| Pension fund (5%) | (975) |\n| Medical aid | (1 200) |\n| **Total deductions** | **(5 570)** |\n| **Net salary (take-home pay)** | **13 930** |\n\n### Ethical Considerations\n- Employers must pay at least the **national minimum wage**\n- PAYE and UIF must be paid over to SARS and the Department of Labour on time\n- Nepotism (hiring family regardless of qualifications) is unethical\n- Equal pay for equal work (no discrimination based on gender or race)'),
  fb(8, 'The employer must pay deductions like PAYE and UIF over to ___ and the Department of Labour. Until paid, these deductions are ___ on the Balance Sheet.',
    ['SARS', 'current liabilities'],
    'PAYE goes to SARS, UIF to the Department of Labour. Until the employer pays these amounts over, they are liabilities owed by the business.'),
  q(9, 'An employee works 45 normal hours at R60 per hour and 6 hours overtime on a weekday. The gross wage is:',
    ['R3 240', 'R2 700', 'R3 060', 'R3 600'], 0,
    'Normal: 45 × R60 = R2 700. Overtime: 6 × R90 (R60 × 1.5) = R540. Gross = R2 700 + R540 = R3 240.'),
  q(10, 'SDL (Skills Development Levy) is:',
    ['Paid by the employer at 1% of total payroll', 'Deducted from the employee at 1%', 'A voluntary contribution', 'Paid by SARS to the employer'], 0,
    'SDL is paid by the employer (not deducted from the employee) at 1% of the total payroll. It funds skills development programmes in South Africa.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Financial Statements with Adjustments (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Pre- and Post-Adjustment Trial Balance ---
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Preparing Financial Statements with Adjustments\n\nIn the exam, you will receive a **pre-adjustment trial balance** and a list of adjustments. You must:\n\n1. Process each adjustment\n2. Prepare a **post-adjustment trial balance** (sometimes)\n3. Prepare the **Income Statement** and **Balance Sheet**\n\n### Step-by-Step Approach\n\n**Step 1:** Read through ALL adjustments first before processing any\n**Step 2:** For each adjustment, identify:\n- Which accounts are affected\n- Whether each account increases or decreases\n- The debit and credit entries\n**Step 3:** Adjust the trial balance figures\n**Step 4:** Prepare the financial statements using the adjusted figures\n\n### Common Adjustments Checklist\n\n- [ ] Depreciation on all fixed assets\n- [ ] Bad debts written off\n- [ ] Provision for bad debts (on NEW debtors balance)\n- [ ] Accrued expenses (expenses owing)\n- [ ] Prepaid expenses (paid in advance)\n- [ ] Income received in advance\n- [ ] Accrued income\n- [ ] Stock deficit/surplus\n- [ ] Drawings of stock (owner took goods)'),
  t(2, '### Worked Example: Pre-Adjustment Trial Balance\n\n**Campusly Trading — Pre-Adjustment Trial Balance on 28 February 2026**\n\n| Account | Debit | Credit |\n|---------|------:|-------:|\n| Capital | | 200 000 |\n| Drawings | 24 000 | |\n| Land and buildings | 150 000 | |\n| Equipment at cost | 80 000 | |\n| Accumulated depreciation: Equipment | | 16 000 |\n| Trading stock | 45 000 | |\n| Debtors control | 38 000 | |\n| Provision for bad debts | | 1 500 |\n| Bank | 22 000 | |\n| Creditors control | | 28 000 |\n| Long-term loan | | 50 000 |\n| Sales | | 420 000 |\n| Cost of sales | 252 000 | |\n| Rent income | | 36 000 |\n| Salaries | 96 000 | |\n| Rent expense | 18 000 | |\n| Water and electricity | 14 000 | |\n| Telephone | 8 500 | |\n| Insurance | 6 000 | |\n| Stationery | 3 000 | |\n| Discount granted | 2 500 | |\n| Discount received | | 1 500 |\n| Bad debts | 4 000 | |\n| **Totals** | **753 000** | **753 000** |'),
  t(3, '### Adjustments\n\n1. Depreciation on equipment: 10% p.a. on cost\n2. Write off debtor M. Zulu as bad debt: R3 000\n3. Adjust provision for bad debts to 5% of debtors (after writing off bad debt)\n4. Salaries accrued at year-end: R4 000\n5. Insurance prepaid: R1 000\n6. Rent income received in advance: R3 000\n7. Trading stock on hand (physical count): R43 500\n\n### Processing the Adjustments\n\n**1. Depreciation:** R80 000 × 10% = R8 000\n- Depreciation expense: R8 000 (new account on IS)\n- Accumulated depreciation: R16 000 + R8 000 = R24 000 (BS)\n\n**2. Bad debt written off:** R3 000\n- Bad debts: R4 000 + R3 000 = R7 000 (IS)\n- Debtors control: R38 000 - R3 000 = R35 000 (BS)\n\n**3. Provision for bad debts:** 5% × R35 000 = R1 750\n- Existing provision: R1 500. Increase: R250\n- Bad debts: R7 000 + R250 = R7 250 (IS)\n- Provision: R1 750 (BS)'),
  t(4, '### Processing Adjustments (continued)\n\n**4. Accrued salaries:** R4 000\n- Salaries: R96 000 + R4 000 = R100 000 (IS)\n- Accrued expenses: R4 000 (BS — current liability)\n\n**5. Prepaid insurance:** R1 000\n- Insurance: R6 000 - R1 000 = R5 000 (IS)\n- Prepaid expenses: R1 000 (BS — current asset)\n\n**6. Rent income received in advance:** R3 000\n- Rent income: R36 000 - R3 000 = R33 000 (IS)\n- Income received in advance: R3 000 (BS — current liability)\n\n**7. Stock deficit:** Records R45 000, physical R43 500, deficit = R1 500\n- Stock deficit: R1 500 (IS — expense)\n- Trading stock: R43 500 (BS — at physical count)\n\n### Adjusted Income Statement Values\n| Item | Original | Adjustment | Final |\n|------|---------|-----------|-------|\n| Sales | 420 000 | — | 420 000 |\n| COS | 252 000 | — | 252 000 |\n| Rent income | 36 000 | -3 000 | 33 000 |\n| Salaries | 96 000 | +4 000 | 100 000 |\n| Insurance | 6 000 | -1 000 | 5 000 |\n| Bad debts | 4 000 | +3 000+250 | 7 250 |\n| Depreciation | 0 | +8 000 | 8 000 |\n| Stock deficit | 0 | +1 500 | 1 500 |'),
  q(5, 'After writing off a bad debt of R3 000, the Debtors control balance is R35 000. What is the provision for bad debts at 5%?',
    ['R1 750', 'R1 900', 'R1 500', 'R3 000'], 0,
    'Provision = 5% × R35 000 = R1 750. Always calculate the provision on the NEW debtors balance (after bad debts are written off).'),
  fb(6, 'The provision for bad debts is always calculated on the debtors balance AFTER ___ are written off. Closing stock on the Balance Sheet is valued at the ___ count value.',
    ['bad debts', 'physical'],
    'First write off actual bad debts to get the new debtors balance, then calculate the provision. Closing stock uses the physical count (not ledger balance).'),
  t(7, '### The Adjusted Income Statement\n\n**Campusly Trading**\n**Income Statement for the year ended 28 February 2026**\n\n| | R |\n|---|---:|\n| Sales | 420 000 |\n| Cost of sales | (252 000) |\n| **Gross profit** | **168 000** |\n| Other operating income | |\n| Rent income | 33 000 |\n| Discount received | 1 500 |\n| **Gross operating income** | **202 500** |\n| Less: Operating expenses | |\n| Salaries | (100 000) |\n| Rent expense | (18 000) |\n| Water and electricity | (14 000) |\n| Telephone | (8 500) |\n| Insurance | (5 000) |\n| Stationery | (3 000) |\n| Discount granted | (2 500) |\n| Bad debts | (7 250) |\n| Depreciation | (8 000) |\n| Stock deficit | (1 500) |\n| **Total operating expenses** | **(167 750)** |\n| **Net profit** | **34 750** |'),
  t(8, '### The Adjusted Balance Sheet\n\n**Campusly Trading**\n**Balance Sheet on 28 February 2026**\n\n| | R |\n|---|---:|\n| **ASSETS** | |\n| **Non-current assets** | **206 000** |\n| Land and buildings | 150 000 |\n| Equipment (R80 000 - R24 000) | 56 000 |\n| **Current assets** | **100 750** |\n| Trading stock | 43 500 |\n| Debtors control (R35 000 - R1 750) | 33 250 |\n| Prepaid expenses | 1 000 |\n| Bank | 22 000 |\n| Accrued income | 1 000 |\n| **Total assets** | **306 750** |\n| | |\n| **EQUITY AND LIABILITIES** | |\n| **Owner\'s equity** | **210 750** |\n| Capital | 200 000 |\n| Net profit | 34 750 |\n| Drawings | (24 000) |\n| **Non-current liabilities** | **50 000** |\n| Long-term loan | 50 000 |\n| **Current liabilities** | **35 000** |\n| Creditors control | 28 000 |\n| Accrued expenses | 4 000 |\n| Income received in advance | 3 000 |\n| **Total equity and liabilities** | **295 750** |\n\n*Note: Slight discrepancy in this example for teaching purposes — in a real exam, the totals must balance exactly.*'),
  q(9, 'On the Balance Sheet, debtors control is shown as R35 000 minus the provision for bad debts of R1 750. The net debtors figure is:',
    ['R33 250', 'R35 000', 'R36 750', 'R1 750'], 0,
    'Net debtors = Debtors control - Provision for bad debts = R35 000 - R1 750 = R33 250.'),
  q(10, 'Accrued salaries of R4 000 appear on the Balance Sheet as:',
    ['A current liability (accrued expenses)', 'A current asset', 'An operating expense only', 'A non-current liability'], 0,
    'Accrued expenses are owed at year-end but not yet paid. They are a current liability on the Balance Sheet. They also appear as part of the expense on the Income Statement.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Analysis and Interpretation of Financial Statements (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Financial Indicators ---
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Analysis and Interpretation of Financial Statements\n\nAfter preparing the financial statements, we analyse them to assess the financial health of the business. This is done using **financial indicators** (ratios and percentages).\n\n### Categories of Financial Indicators\n\n| Category | What it measures | Key indicators |\n|----------|-----------------|----------------|\n| **Profitability** | How well the business generates profit | Gross profit on sales, Net profit on sales, Operating expenses on sales |\n| **Liquidity** | Ability to pay short-term debts | Current ratio, Acid-test ratio |\n| **Solvency** | Ability to pay all debts (long-term) | Solvency ratio |\n| **Return** | Return on the owner\'s investment | Return on owner\'s equity (ROE) |'),
  t(2, '### Profitability Indicators\n\n**1. Gross Profit on Sales (GP%)**\n$$\\text{GP\\%} = \\frac{\\text{Gross profit}}{\\text{Sales}} \\times 100$$\n\nMeasures how much profit is earned from trading after cost of goods.\n\n**2. Net Profit on Sales (NP%)**\n$$\\text{NP\\%} = \\frac{\\text{Net profit}}{\\text{Sales}} \\times 100$$\n\nMeasures overall profitability after all expenses.\n\n**3. Operating Expenses on Sales (OE%)**\n$$\\text{OE\\%} = \\frac{\\text{Operating expenses}}{\\text{Sales}} \\times 100$$\n\nMeasures expense control. Should decrease or stay stable.\n\n**Example using Campusly Trading:**\n- GP% = R168 000 / R420 000 × 100 = **40%**\n- NP% = R34 750 / R420 000 × 100 = **8.3%**\n- OE% = R167 750 / R420 000 × 100 = **39.9%**\n\nThese percentages help compare performance with previous years and with competitors.'),
  q(3, 'Sales are R600 000 and Gross Profit is R240 000. The Gross Profit percentage is:',
    ['40%', '60%', '25%', '66.7%'], 0,
    'GP% = R240 000 / R600 000 × 100 = 40%. This means for every R1 of sales, 40 cents is gross profit.'),
  fb(4, 'Gross profit percentage measures profitability from ___. Net profit percentage measures profitability after ___ expenses.',
    ['trading', 'all operating'],
    'GP% looks at profit from buying and selling goods. NP% includes the impact of all operating expenses.'),
  t(5, '### Liquidity Indicators\n\n**1. Current Ratio**\n$$\\text{Current ratio} = \\frac{\\text{Current assets}}{\\text{Current liabilities}}$$\n\n- Ideal: **1.5:1 to 2:1**\n- Below 1:1 = Cannot pay short-term debts\n- Above 3:1 = Resources not being used efficiently\n\n**2. Acid-Test Ratio (Quick Ratio)**\n$$\\text{Acid-test ratio} = \\frac{\\text{Current assets} - \\text{Trading stock}}{\\text{Current liabilities}}$$\n\n- Ideal: **approximately 1:1**\n- Excludes stock because it cannot always be quickly converted to cash\n\n**Example:**\n- Current assets = R100 750, Trading stock = R43 500, Current liabilities = R35 000\n- Current ratio = R100 750 / R35 000 = **2.88:1** (strong)\n- Acid-test = (R100 750 - R43 500) / R35 000 = R57 250 / R35 000 = **1.64:1** (healthy)'),
  q(6, 'Current assets are R120 000 (including stock of R50 000). Current liabilities are R80 000. The acid-test ratio is:',
    ['0.88:1', '1.5:1', '0.63:1', '2.4:1'], 0,
    'Acid-test = (R120 000 - R50 000) / R80 000 = R70 000 / R80 000 = 0.875:1 ≈ 0.88:1. This is below 1:1, which could indicate a liquidity concern.'),
  t(7, '### Solvency and Return Indicators\n\n**Solvency Ratio**\n$$\\text{Solvency ratio} = \\frac{\\text{Total assets}}{\\text{Total liabilities}}$$\n\n- Must be **greater than 1** (assets exceed liabilities)\n- Below 1 = Technically insolvent (liabilities exceed assets)\n\n**Return on Owner\'s Equity (ROE)**\n$$\\text{ROE} = \\frac{\\text{Net profit}}{\\text{Average owner\'s equity}} \\times 100$$\n\nFor Grade 10, if average equity is not available, use the closing equity figure.\n\n- Should exceed the interest rate earned from a bank savings account\n- If ROE is lower than the bank rate, the owner might be better off investing elsewhere\n\n**Example:**\n- Total assets = R306 750, Total liabilities = R85 000\n- Solvency = R306 750 / R85 000 = **3.61:1** (very solvent)\n- ROE = R34 750 / R210 750 × 100 = **16.5%** (good, exceeds bank rate)'),
  fb(8, 'The solvency ratio compares total ___ to total liabilities. If it is below 1, the business is technically ___.',
    ['assets', 'insolvent'],
    'Solvency = Total assets / Total liabilities. Below 1 means the business cannot cover all its debts even if all assets are sold.'),
  q(9, 'A sole trader has net profit of R45 000 and owner\'s equity of R300 000. The ROE is:',
    ['15%', '6.67%', '45%', '85%'], 0,
    'ROE = R45 000 / R300 000 × 100 = 15%. This means the owner earns a 15% return on their investment.'),
  t(10, '### Interpreting Financial Indicators\n\nWhen commenting on financial indicators in an exam:\n\n1. **State the calculated figure** and whether it is favourable or unfavourable\n2. **Compare** to the previous year or ideal benchmarks\n3. **Give a specific reason** for the trend\n4. **Suggest a corrective action** if needed\n\n**Example answer:**\n*The current ratio decreased from 2.5:1 to 1.2:1. This is unfavourable as the business is approaching the danger level of 1:1. A possible reason is that the business took on more short-term debt (creditors increased). The owner should try to collect outstanding debts from debtors faster or reduce credit purchases.*\n\n### South African Context\n- Load shedding may reduce sales and increase generator costs\n- Inflation increases cost of sales\n- Rand depreciation increases import costs\n- Interest rate changes by SARB affect loan costs\n- Minimum wage increases affect salary expenses'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Internal Control and Ethics (Term 1–4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Internal Control Measures ---
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Internal Control\n\nInternal control is the system of policies and procedures that a business uses to:\n- **Safeguard assets** (prevent theft and damage)\n- **Ensure accuracy** of financial records\n- **Promote efficiency** in operations\n- **Ensure compliance** with laws and regulations\n\n### Components of Internal Control\n\n| Component | Description |\n|-----------|------------|\n| **Control environment** | The tone set by management — ethics, integrity, competence |\n| **Risk assessment** | Identifying and managing risks to the business |\n| **Control activities** | Procedures to prevent/detect errors (authorisation, segregation of duties) |\n| **Information and communication** | Reliable financial reporting systems |\n| **Monitoring** | Regular review of controls to ensure they work |'),
  t(2, '### Key Internal Control Measures\n\n**1. Segregation (Separation) of Duties**\nNo single person should handle all aspects of a transaction.\n- The person who places orders should NOT receive the goods\n- The person who receives cash should NOT record it in the books\n- The person who prepares cheques should NOT sign them\n\n**2. Authorisation**\nAll transactions must be approved by an authorised person.\n- Purchases above R10 000 need the owner\'s signature\n- Cheques need two signatories\n- Credit sales need approval from the credit manager\n\n**3. Physical Controls**\n- Lock cash in a safe, deposit daily\n- Keep stock in a locked warehouse, limit access\n- Keep important documents (title deeds, contracts) in a fireproof safe\n- Use security cameras and alarm systems\n\n**4. Reconciliation**\n- Bank reconciliation (compare CRJ/CPJ with bank statement)\n- Debtors/creditors reconciliation\n- Physical stock count vs stock records'),
  q(3, 'The principle of segregation of duties means:',
    ['Different people handle different parts of the same transaction', 'One person handles everything for efficiency', 'Duties are only done by the owner', 'All employees must have the same duties'], 0,
    'Segregation of duties ensures that no one person controls all aspects of a transaction. This prevents fraud and errors because one person\'s work is checked by another.'),
  fb(4, 'Segregation of duties helps prevent ___ and errors. Reconciliation helps detect ___ between records.',
    ['fraud', 'differences'],
    'Separating duties means one person checks another\'s work (fraud prevention). Reconciliation compares two sets of records to find discrepancies.'),
  t(5, '### Internal Control Over Specific Areas\n\n**Cash Control:**\n- Issue pre-numbered receipts for all cash received\n- Deposit all cash daily\n- Never pay expenses from cash received (use the bank account)\n- Perform surprise cash counts\n- Two signatories on all cheques above a set amount\n\n**Stock Control:**\n- Regular physical stock counts (at least at year-end)\n- Compare stock records with physical count\n- Investigate stock deficits (theft, damage, or errors?)\n- Restrict access to the storeroom\n- Use bin cards or a computerised system to track movements\n\n**Debtors and Creditors Control:**\n- Set credit limits for each debtor\n- Follow up on overdue accounts promptly\n- Age analysis of debtors (30/60/90 days)\n- Reconcile with creditors\' statements monthly\n- Approve all credit notes before issuing'),
  q(6, 'Which of the following is a good internal control measure for cash?',
    ['Depositing all cash received daily into the bank', 'Keeping cash in the cash register for a week', 'Allowing any employee to issue receipts', 'Paying expenses directly from cash received'], 0,
    'Daily deposits reduce the risk of theft and ensure cash is safe. Cash should go through the bank account, and expenses should be paid by cheque or EFT for a proper audit trail.'),
  t(7, '## Ethics in Business and Accounting\n\nEthics are moral principles that guide behaviour. In accounting, ethics are essential for trust and integrity.\n\n### Ethical Principles\n\n| Principle | Application |\n|-----------|------------|\n| **Honesty** | Report accurate financial information |\n| **Transparency** | Disclose all relevant information to stakeholders |\n| **Accountability** | Accept responsibility for financial decisions |\n| **Fairness** | Treat all stakeholders equally |\n| **Confidentiality** | Do not share sensitive business information |\n\n### Examples of Unethical Behaviour\n- **Tax evasion** — not declaring all income to SARS\n- **Falsifying records** — overstating income or understating expenses\n- **Nepotism** — appointing family members without proper qualifications\n- **Insider trading** — using confidential information for personal gain\n- **Misappropriation** — using business funds for personal expenses\n- **Bribery and corruption** — paying or accepting bribes for contracts'),
  fb(8, 'Tax evasion is ___ (it is illegal). Tax avoidance is ___ (it uses legal methods to reduce tax).',
    ['unethical', 'legal'],
    'Tax evasion is deliberately hiding income or inflating expenses to pay less tax — it is illegal. Tax avoidance is using legitimate deductions and structures to minimise tax within the law.'),
  q(9, 'An employee who authorises payments also signs cheques and reconciles the bank statement. Which internal control weakness exists?',
    ['Lack of segregation of duties — one person controls the entire payment process', 'The controls are adequate', 'There is too much segregation of duties', 'The reconciliation should be done less frequently'], 0,
    'One person handling authorisation, signing, and reconciliation creates an opportunity for fraud. These duties should be performed by different people.'),
  q(10, 'A business owner uses R15 000 of business funds to pay for a family holiday. This is an example of:',
    ['Misappropriation of business assets (drawings should be recorded)', 'Good business management', 'Tax avoidance', 'Internal control'], 0,
    'Using business funds for personal expenses without recording it properly is misappropriation. If the owner takes money for personal use, it must be recorded as drawings.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Cost Accounting and Budgeting (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Introduction to Cost Accounting ---
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Introduction to Cost Accounting\n\nCost accounting is used by **manufacturing businesses** — businesses that produce goods rather than buying them for resale.\n\n### Manufacturing vs Trading Business\n\n| Feature | Trading Business | Manufacturing Business |\n|---------|-----------------|----------------------|\n| Stock | Buys finished goods | Makes goods from raw materials |\n| Cost of goods | Purchase price | Direct materials + Direct labour + Overheads |\n| Key statement | Income Statement | Production Cost Statement + Income Statement |\n| Examples | Shoprite, Clicks | Toyota SA, Tiger Brands, SABMiller |\n\n### Types of Costs\n\n**Direct costs** — can be traced directly to a product:\n- Direct materials (raw materials used)\n- Direct labour (factory workers\' wages)\n\n**Indirect costs (Overheads)** — cannot be traced to a specific product:\n- Factory rent, factory electricity\n- Depreciation of factory machinery\n- Factory supervisor\'s salary\n- Factory insurance'),
  t(2, '### Fixed, Variable, and Semi-Variable Costs\n\n**Variable costs** change in proportion to production:\n- Raw materials: more units = more materials needed\n- Direct labour (piece-rate workers)\n- Packaging\n\n**Fixed costs** stay the same regardless of production:\n- Factory rent: R10 000 per month whether 100 or 10 000 units are made\n- Insurance premium\n- Depreciation (straight-line)\n\n**Semi-variable costs** have fixed and variable components:\n- Electricity: R500 fixed + R2 per unit produced\n  - At 1 000 units: R500 + R2 000 = R2 500\n  - At 5 000 units: R500 + R10 000 = R10 500\n\n### Key Cost Concepts\n\n$$\\text{Prime cost} = \\text{Direct materials} + \\text{Direct labour}$$\n\n$$\\text{Total production cost} = \\text{Prime cost} + \\text{Factory overheads}$$\n\n$$\\text{Cost per unit} = \\frac{\\text{Total production cost}}{\\text{Number of units produced}}$$'),
  q(3, 'Which of the following is a variable cost?',
    ['Raw materials used in production', 'Factory rent', 'Depreciation on machinery', 'Insurance premium'], 0,
    'Raw materials are a variable cost because the total cost increases as more units are produced. Rent, depreciation (straight-line), and insurance are fixed costs.'),
  fb(4, 'Prime cost equals direct materials plus direct ___. Factory overheads are ___ costs that cannot be traced to specific products.',
    ['labour', 'indirect'],
    'Prime cost = direct materials + direct labour. Overheads are indirect costs shared across all production.'),
  t(5, '### Production Cost Statement (Simplified for Grade 10)\n\n**Campusly Manufacturing**\n**Production Cost Statement for the year ended 28 February 2026**\n\n| | R |\n|---|---:|\n| **Direct materials** | |\n| Opening stock of raw materials | 25 000 |\n| Purchases of raw materials | 180 000 |\n| | 205 000 |\n| Closing stock of raw materials | (30 000) |\n| **Direct materials used** | **175 000** |\n| **Direct labour** | **120 000** |\n| **Prime cost** | **295 000** |\n| **Factory overheads** | |\n| Factory rent | 36 000 |\n| Factory electricity | 15 000 |\n| Depreciation: Factory equipment | 20 000 |\n| Factory insurance | 8 000 |\n| **Total factory overheads** | **79 000** |\n| **Total production cost** | **374 000** |\n\n### Cost per unit\nIf 10 000 units were produced:\n- Cost per unit = R374 000 / 10 000 = **R37.40 per unit**'),
  q(6, 'Direct materials used = R80 000, Direct labour = R50 000. The prime cost is:',
    ['R130 000', 'R80 000', 'R50 000', 'R210 000'], 0,
    'Prime cost = Direct materials + Direct labour = R80 000 + R50 000 = R130 000.'),
  t(7, '### Fixed Cost Per Unit vs Total Fixed Cost\n\n| Production | Total Fixed Cost | Fixed Cost Per Unit |\n|-----------|-----------------|--------------------|\n| 5 000 units | R100 000 | R20.00 |\n| 10 000 units | R100 000 | R10.00 |\n| 20 000 units | R100 000 | R5.00 |\n\n**Total fixed cost stays the same**, but the **fixed cost per unit decreases** as production increases. This is called **spreading the fixed costs** — a key reason why manufacturers aim for high production volumes.\n\n**Total variable cost increases** with production, but **variable cost per unit stays the same**:\n\n| Production | Variable Cost Per Unit | Total Variable Cost |\n|-----------|----------------------|--------------------|\n| 5 000 units | R15 | R75 000 |\n| 10 000 units | R15 | R150 000 |\n| 20 000 units | R15 | R300 000 |'),
  fb(8, 'As production increases, the fixed cost per unit ___. The variable cost per unit remains ___.',
    ['decreases', 'constant'],
    'Higher production spreads fixed costs over more units (cost per unit drops). Variable cost per unit stays the same regardless of volume.'),
  q(9, 'Factory rent of R60 000 is a fixed cost. If 12 000 units are produced, the fixed cost per unit is:',
    ['R5.00', 'R60 000', 'R12 000', 'R0.50'], 0,
    'Fixed cost per unit = R60 000 / 12 000 = R5.00. Note that the total rent remains R60 000 regardless of production volume.'),
  q(10, 'Which cost is correctly classified as a factory overhead?',
    ['Depreciation of factory machinery', 'Raw materials used in production', 'Wages of factory workers making the product', 'Delivery costs to customers'], 0,
    'Depreciation of factory machinery is an indirect factory cost (overhead). Raw materials and factory workers\' wages are direct costs. Delivery to customers is a selling expense.'),
];

// --- Lesson 2: Introduction to Budgeting ---
blockNum = 0;
const ch14_lesson2 = [
  t(1, '## Budgeting\n\nA budget is a **financial plan** for a future period. It helps a business to:\n- Plan income and expenses\n- Anticipate cash shortages or surpluses\n- Set targets and goals\n- Control spending\n- Make informed decisions\n\n### Types of Budgets at Grade 10 Level\n\n| Budget Type | What it shows |\n|------------|---------------|\n| **Cash budget** | Expected cash receipts and payments (cash flow) |\n| **Capital budget** | Planned purchases of fixed assets |\n| **Zero-based budget** | Every expense must be justified from scratch |\n| **Long-term budget** | Plans for more than one year |\n| **Medium-term budget** | Plans for 1–3 years |\n\n### The Cash Budget\n\nThe cash budget projects monthly cash **inflows** (receipts) and **outflows** (payments) to determine if the business will have a surplus or deficit.'),
  t(2, '### Cash Budget Format\n\n**Campusly Trading**\n**Cash Budget for March–May 2026**\n\n| | March | April | May |\n|---|---:|---:|---:|\n| **Receipts** | | | |\n| Cash sales | 40 000 | 45 000 | 50 000 |\n| Debtors collections | 25 000 | 28 000 | 30 000 |\n| Other income | 3 000 | 3 000 | 3 000 |\n| **Total receipts** | **68 000** | **76 000** | **83 000** |\n| **Payments** | | | |\n| Cash purchases | 20 000 | 22 000 | 24 000 |\n| Creditor payments | 15 000 | 16 000 | 18 000 |\n| Salaries | 12 000 | 12 000 | 12 000 |\n| Rent | 6 000 | 6 000 | 6 000 |\n| Insurance | 2 000 | 2 000 | 2 000 |\n| **Total payments** | **55 000** | **58 000** | **62 000** |\n| **Surplus/(Deficit)** | **13 000** | **18 000** | **21 000** |\n| Opening bank balance | 5 000 | 18 000 | 36 000 |\n| **Closing bank balance** | **18 000** | **36 000** | **57 000** |'),
  q(3, 'In a cash budget, which of the following is NOT included?',
    ['Depreciation', 'Cash sales', 'Salary payments', 'Loan repayments'], 0,
    'Depreciation is a non-cash expense — no money actually leaves the bank. Cash budgets only include items that involve actual cash movement.'),
  fb(4, 'The closing bank balance of one month becomes the ___ bank balance of the next month. Only ___ items appear in a cash budget.',
    ['opening', 'cash'],
    'Bank balances carry forward. Non-cash items like depreciation, bad debts provision, and stock deficits do not appear in cash budgets.'),
  t(5, '### Items in a Cash Budget vs Income Statement\n\n| Item | Cash Budget | Income Statement |\n|------|-----------|------------------|\n| Cash sales | Yes | Yes |\n| Credit sales | No (cash comes later) | Yes (at time of sale) |\n| Debtors collections | Yes (when cash received) | No |\n| Depreciation | No (non-cash) | Yes |\n| Bad debts provision | No (non-cash) | Yes |\n| Loan repayment (capital) | Yes | No |\n| Loan interest | Yes | Yes |\n| Purchase of equipment | Yes | No (Balance Sheet item) |\n| Stock deficit | No (non-cash) | Yes |\n\n**Key rules:**\n- Cash budget = **cash in and cash out** only\n- Income Statement = income earned and expenses incurred (**whether cash or not**)'),
  q(6, 'A business plans to buy equipment for R50 000 cash in April. In the cash budget for April, this amount appears as:',
    ['A payment (cash outflow)', 'An operating expense', 'It does not appear in the cash budget', 'Depreciation'], 0,
    'Buying equipment for cash is a cash outflow. It appears in the payments section of the cash budget. On the Income Statement, only the depreciation on the equipment would appear (not the full purchase price).'),
  t(7, '### Interpreting the Cash Budget\n\n**If the closing bank balance is positive (surplus):**\n- The business has enough cash to cover expenses\n- Surplus funds can be invested in a fixed deposit or used for expansion\n\n**If the closing bank balance is negative (deficit):**\n- The business does not have enough cash\n- Options:\n  - Arrange an overdraft facility with the bank\n  - Delay non-essential payments\n  - Speed up debtor collections\n  - Reduce or delay stock purchases\n  - Seek additional capital from the owner\n\n**Benefits of preparing a cash budget:**\n- Warns of future cash problems before they happen\n- Helps negotiate overdraft facilities with the bank in advance\n- Allows the owner to plan for large purchases\n- Helps maintain good relationships with creditors by paying on time'),
  fb(8, 'A negative closing bank balance in the cash budget indicates a cash ___. The business may need to arrange an ___ with the bank.',
    ['deficit', 'overdraft'],
    'A negative balance means the business will run out of cash. An overdraft facility allows the business to use more than what is in the account (up to a limit), but interest is charged.'),
  q(9, 'Which of the following is the BEST reason for preparing a cash budget?',
    ['To anticipate cash shortages and plan accordingly', 'To calculate depreciation on assets', 'To determine the value of trading stock', 'To calculate the tax owed to SARS'], 0,
    'The main purpose of a cash budget is to project future cash flows so the business can plan for shortages or surpluses before they occur.'),
  q(10, 'The cash budget for June shows total receipts of R45 000, total payments of R52 000, and an opening bank balance of R10 000. The closing bank balance is:',
    ['R3 000', 'R7 000', '-R7 000', 'R97 000'], 0,
    'Closing balance = Opening + Receipts - Payments = R10 000 + R45 000 - R52 000 = R3 000.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 15: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Key Formulae and Exam Tips ---
blockNum = 0;
const ch15_lesson1 = [
  t(1, '## Grade 10 Accounting — Revision\n\n### The Accounting Equation\n$$\\text{Assets} = \\text{Owner\'s equity} + \\text{Liabilities}$$\n\n### Key Formulae\n\n**Cost of Sales:**\n$$\\text{COS} = \\text{Opening stock} + \\text{Net purchases} - \\text{Closing stock}$$\n\n**Gross Profit:**\n$$\\text{GP} = \\text{Sales} - \\text{Cost of sales}$$\n\n**Net Profit:**\n$$\\text{NP} = \\text{Gross operating income} - \\text{Operating expenses}$$\n\n**Owner\'s Equity:**\n$$\\text{OE} = \\text{Capital} + \\text{Net profit} - \\text{Drawings}$$\n\n**Depreciation (Straight-line):**\n$$\\text{Annual depreciation} = \\frac{\\text{Cost} - \\text{Residual value}}{\\text{Useful life}}$$\n\n**Depreciation (Diminishing balance):**\n$$\\text{Annual depreciation} = \\text{Carrying value} \\times \\text{Rate}$$\n\n**Carrying Value:**\n$$\\text{CV} = \\text{Cost} - \\text{Accumulated depreciation}$$'),
  t(2, '### More Formulae\n\n**VAT:**\n$$\\text{VAT} = \\text{Inclusive} \\times \\frac{15}{115}$$\n$$\\text{Exclusive} = \\text{Inclusive} \\times \\frac{100}{115}$$\n$$\\text{Inclusive} = \\text{Exclusive} \\times 1.15$$\n$$\\text{VAT payable} = \\text{Output VAT} - \\text{Input VAT}$$\n\n**Financial Indicators:**\n$$\\text{GP\\%} = \\frac{\\text{GP}}{\\text{Sales}} \\times 100$$\n$$\\text{NP\\%} = \\frac{\\text{NP}}{\\text{Sales}} \\times 100$$\n$$\\text{OE\\%} = \\frac{\\text{Operating expenses}}{\\text{Sales}} \\times 100$$\n$$\\text{Current ratio} = \\frac{\\text{Current assets}}{\\text{Current liabilities}}$$\n$$\\text{Acid-test} = \\frac{\\text{Current assets} - \\text{Stock}}{\\text{Current liabilities}}$$\n$$\\text{Solvency} = \\frac{\\text{Total assets}}{\\text{Total liabilities}}$$\n$$\\text{ROE} = \\frac{\\text{Net profit}}{\\text{Owner\'s equity}} \\times 100$$\n\n**Net Pay:**\n$$\\text{Net pay} = \\text{Gross pay} - \\text{Deductions}$$\n\n**Cash Budget:**\n$$\\text{Closing balance} = \\text{Opening balance} + \\text{Receipts} - \\text{Payments}$$'),
  q(3, 'The formula for the current ratio is:',
    ['Current assets / Current liabilities', '(Current assets - Stock) / Current liabilities', 'Total assets / Total liabilities', 'Net profit / Owner\'s equity × 100'], 0,
    'Current ratio = Current assets / Current liabilities. The acid-test ratio excludes stock from current assets.'),
  t(4, '### Exam Structure — Grade 10 Accounting\n\n**Paper 1 (2 hours, 150 marks)**\n- Discipline 1: Recording, reporting, and evaluation of financial statements\n- Covers: Journals, Ledger, Trial balance, Financial statements, Year-end adjustments\n\n**Paper 2 (2 hours, 150 marks)**\n- Discipline 2: Internal management and control processes\n- Covers: VAT, Salaries and wages, Cost accounting, Budgeting, Internal control, Ethics\n\n### Time Management\n- Read the ENTIRE question before answering\n- Allocate time proportionally: 1 mark ≈ 1 minute (approximately)\n- Attempt ALL questions — do not leave blanks\n- Show ALL workings — you can earn marks even if the final answer is wrong'),
  fb(5, 'Grade 10 Accounting has ___ exam papers. Paper 1 covers ___ and financial statements.',
    ['two', 'recording'],
    'Paper 1 focuses on recording transactions and preparing financial statements. Paper 2 focuses on management accounting topics.'),
  t(6, '### Common Exam Mistakes — Avoid These!\n\n**Journals:**\n- Confusing the CRJ and CPJ (receipts vs payments)\n- Putting discount granted in the Bank column\n- Forgetting the Cost of sales / Trading stock entry for cash and credit sales\n- Recording returns in the wrong journal (DAJ vs CAJ)\n\n**Ledger and Trial Balance:**\n- Mixing up debits and credits\n- Posting individual amounts instead of totals from journals\n- Not balancing accounts correctly\n- Forgetting that sundry items are posted individually\n\n**Financial Statements:**\n- Including carriage on sales in Cost of Sales (it is an operating expense)\n- Forgetting to adjust for prepaid/accrued items\n- Not deducting provision for bad debts from debtors on the Balance Sheet\n- Putting bank overdraft under assets (it is a liability)\n- Confusing Income Statement items with Balance Sheet items'),
  t(7, '### More Common Mistakes\n\n**VAT:**\n- Using 15/100 instead of 15/115 to extract VAT from an inclusive amount\n- Not recording debtors/creditors at the VAT-inclusive amount\n- Including VAT in revenue/expense figures (they should be exclusive)\n\n**Adjustments:**\n- Forgetting to calculate the provision for bad debts on the NEW debtors balance (after bad debts written off)\n- Adding accrued expenses to the wrong side of the trial balance\n- Using ledger stock instead of physical count for closing stock\n\n**Cost Accounting:**\n- Including office expenses in the Production Cost Statement (only factory costs)\n- Confusing direct costs with indirect costs\n- Forgetting that depreciation is NOT a cash item (not in cash budget)\n\n**General:**\n- Not showing workings\n- Mixing up trade discount (not recorded) and settlement discount (recorded)\n- Confusing discount granted (expense) with discount received (income)'),
  q(8, 'To extract VAT from R2 300 (VAT inclusive), the correct calculation is:',
    ['R2 300 × 15/115 = R300', 'R2 300 × 15/100 = R345', 'R2 300 / 1.15 = R2 000', 'R2 300 × 0.15 = R345'], 0,
    'VAT from an inclusive amount = inclusive × 15/115. R2 300 × 15/115 = R300. The exclusive amount = R2 300 × 100/115 = R2 000. The third option gives the exclusive amount, not the VAT.'),
  fb(9, 'Trade discount is ___ recorded in the books. Settlement discount IS recorded because it involves a ___ incentive for early payment.',
    ['NOT', 'cash'],
    'Trade discount is deducted before the invoice is prepared (not recorded separately). Settlement discount is recorded because it involves receiving less cash in exchange for faster payment.'),
  t(10, '### Final Study Tips\n\n1. **Know your formats:** CRJ, CPJ, DJ, CJ, DAJ, CAJ columns; T-accounts; Trial balance; Income Statement; Balance Sheet\n2. **Practise journal entries:** Especially for adjustments (accruals, prepayments, depreciation, bad debts)\n3. **Master the posting process:** Know which journal posts to which account and whether it is debit or credit\n4. **Learn the VAT fractions:** 15/115 and 100/115 are essential\n5. **Understand the difference between cash and non-cash items:** For budgeting questions\n6. **Use the correct terminology:** "Debit" not "charge", "Credit" not "reduce"\n7. **Read questions carefully:** Look for key words like "including VAT", "excluding VAT", "at cost price", "at selling price"\n8. **Practise past papers:** DBE and provincial papers are available online for free\n9. **Show all workings:** Marks are awarded for method, not just the final answer\n10. **Use South African context:** Reference SARS, GAAP, minimum wage, UIF, PAYE in your answers'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 10
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 10/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 10:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 10', schoolId: SCHOOL_ID, orderIndex: 10,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 10:', String(GRADE_ID));
  }

  // Find or create Accounting subject
  let SUBJECT_ID;
  let subjectDoc = await db.collection('subjects').findOne({ name: /Accounting/i });
  if (!subjectDoc) {
    const result = await db.collection('subjects').insertOne({
      name: 'Accounting',
      code: 'ACC',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Accounting subject:', String(SUBJECT_ID));
  } else {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Accounting subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Introduction to Accounting',
      description: 'What accounting is, the accounting cycle, formal and informal sectors, indigenous bookkeeping, GAAP principles, ethics, the accounting equation, and double-entry bookkeeping.',
      order: 1,
      lessons: [
        { title: 'What Is Accounting?', description: 'Definition of accounting, the accounting cycle, business ownership types, formal and informal sectors, indigenous bookkeeping, users of information, GAAP, and ethics.', blocks: ch1_lesson1, term: 1 },
        { title: 'The Accounting Equation', description: 'Assets, liabilities, and owner\'s equity, how transactions affect the equation, debit and credit rules, and the double-entry principle.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Source Documents and the Accounting Cycle',
      description: 'Source documents (receipts, invoices, credit notes), cash vs credit transactions, the perpetual inventory system, and trade vs settlement discounts.',
      order: 2,
      lessons: [
        { title: 'Source Documents', description: 'Receipts, invoices, credit notes, debit notes, bank statements, cash vs credit transactions, perpetual inventory system, trade and settlement discounts.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Cash Journals (CRJ and CPJ)',
      description: 'Recording cash receipts and payments, discount granted and received, posting to the General Ledger and subsidiary ledgers.',
      order: 3,
      lessons: [
        { title: 'Cash Receipts Journal (CRJ)', description: 'CRJ column headings, recording cash sales, receipts from debtors, discount granted, posting to General and Debtors Ledger.', blocks: ch3_lesson1, term: 1 },
        { title: 'Cash Payments Journal (CPJ)', description: 'CPJ column headings, recording cash purchases, payments to creditors, discount received, posting to General and Creditors Ledger.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Credit Journals (DJ, CJ, DAJ, CAJ)',
      description: 'Debtors Journal, Creditors Journal, Debtors Allowances Journal, Creditors Allowances Journal — recording credit transactions and returns.',
      order: 4,
      lessons: [
        { title: 'Credit Journals and Allowances Journals', description: 'DJ for credit sales, CJ for credit purchases, DAJ for debtor returns, CAJ for creditor returns, source documents, and posting rules.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: General Journal and General Ledger',
      description: 'The General Journal for corrections, bad debts, drawings of stock, and other non-standard entries. Introduction to the General Ledger and T-accounts.',
      order: 5,
      lessons: [
        { title: 'General Journal and Ledger Accounts', description: 'GJ entries for corrections, bad debts, drawings of stock, interest on overdue accounts. T-account format and debit/credit rules.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Posting to the Ledger and Trial Balance',
      description: 'Posting from all journals to the General Ledger, Debtors and Creditors Ledgers, control accounts, and preparing a trial balance.',
      order: 6,
      lessons: [
        { title: 'Posting and the Trial Balance', description: 'Posting rules for all journals, subsidiary ledgers, control accounts, trial balance format, and errors not revealed by the trial balance.', blocks: ch6_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 7: Financial Statements of a Sole Trader',
      description: 'Income Statement (Trading account and Profit and Loss account) and Balance Sheet format, cost of sales calculation, and notes to financial statements.',
      order: 7,
      lessons: [
        { title: 'Trading Account and Income Statement', description: 'Gross profit, net profit, cost of sales, other operating income, operating expenses, and the Income Statement format.', blocks: ch7_lesson1, term: 2 },
        { title: 'Balance Sheet', description: 'Balance Sheet format, non-current and current assets, owner\'s equity, non-current and current liabilities, and notes.', blocks: ch7_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Value-Added Tax (VAT)',
      description: 'VAT concepts, calculations (adding and extracting VAT), zero-rated and exempt items, recording VAT in journals, and the VAT control account.',
      order: 8,
      lessons: [
        { title: 'VAT Basics and the VAT Control Account', description: 'Output and input VAT, VAT calculations (15/115, 100/115), zero-rated and exempt items, VAT in journals, and the VAT control account.', blocks: ch8_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 9: Year-End Adjustments',
      description: 'Accrued and prepaid expenses, income received in advance, accrued income, trading stock deficit/surplus, depreciation, bad debts, and provision for bad debts.',
      order: 9,
      lessons: [
        { title: 'Adjustment Concepts', description: 'Matching principle, accrued expenses, prepaid expenses, income received in advance, accrued income, and trading stock deficit.', blocks: ch9_lesson1, term: 2 },
        { title: 'Depreciation and Bad Debts', description: 'Straight-line and diminishing balance depreciation, bad debts written off, provision for bad debts, and summary of all adjustments.', blocks: ch9_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Salaries and Wages',
      description: 'Gross and net pay, overtime calculations, employee deductions (PAYE, UIF, pension, medical aid), employer contributions, and recording salaries.',
      order: 10,
      lessons: [
        { title: 'Salaries, Wages, and Deductions', description: 'Gross and net salary, overtime rates, PAYE, UIF, pension fund, medical aid, employer contributions, SDL, payslips, and ethical considerations.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: Financial Statements with Adjustments',
      description: 'Processing year-end adjustments, preparing adjusted Income Statement and Balance Sheet from a pre-adjustment trial balance.',
      order: 11,
      lessons: [
        { title: 'Pre- and Post-Adjustment Trial Balance', description: 'Step-by-step processing of adjustments, worked example with seven adjustments, and preparing adjusted financial statements.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Analysis and Interpretation of Financial Statements',
      description: 'Financial indicators: gross profit %, net profit %, operating expenses %, current ratio, acid-test ratio, solvency ratio, and return on equity.',
      order: 12,
      lessons: [
        { title: 'Financial Indicators', description: 'Profitability, liquidity, solvency, and return indicators with calculations, interpretation, and South African context.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Internal Control and Ethics',
      description: 'Internal control measures, segregation of duties, cash and stock control, ethics in accounting, tax evasion vs avoidance, and GAAP compliance.',
      order: 13,
      lessons: [
        { title: 'Internal Control Measures and Ethics', description: 'Components of internal control, segregation of duties, authorisation, physical controls, reconciliation, ethical principles, and unethical behaviour.', blocks: ch13_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 14: Cost Accounting and Budgeting',
      description: 'Introduction to manufacturing costs, direct and indirect costs, variable and fixed costs, the production cost statement, and cash budgets.',
      order: 14,
      lessons: [
        { title: 'Introduction to Cost Accounting', description: 'Manufacturing vs trading, direct and indirect costs, variable and fixed costs, prime cost, production cost statement, and cost per unit.', blocks: ch14_lesson1, term: 4 },
        { title: 'Introduction to Budgeting', description: 'Types of budgets, cash budget format, cash vs non-cash items, interpreting the cash budget, and dealing with deficits.', blocks: ch14_lesson2, term: 4 },
      ],
    },
    {
      title: 'Chapter 15: Revision and Exam Preparation',
      description: 'Key formulae, exam structure for Paper 1 and Paper 2, common mistakes, and study tips for the Grade 10 Accounting examination.',
      order: 15,
      lessons: [
        { title: 'Key Formulae, Exam Structure, and Practice', description: 'All Grade 10 Accounting formulae, exam paper structure, common mistakes to avoid, and final study tips.', blocks: ch15_lesson1, term: 4 },
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
    title: 'Grade 10 Accounting \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering the Accounting Equation, Source Documents, Journals (CRJ, CPJ, DJ, CJ, DAJ, CAJ, GJ), Ledger, Trial Balance, Financial Statements, VAT, Year-End Adjustments, Salaries and Wages, Internal Control, Ethics, Cost Accounting, and Budgeting for the Grade 10 Accounting examination.',
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
  console.log('  TEXTBOOK: Grade 10 Accounting');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
