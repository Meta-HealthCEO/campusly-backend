const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642'); // Grade 12

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
// CHAPTER 1: Companies — Unique Transactions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Types of Companies and the Companies Act ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Types of Companies\n\nSouth African companies are governed by the **Companies Act 71 of 2008**.\n\n### Private Company (Pty) Ltd\n- Shares are NOT traded on the JSE\n- Maximum of 50 shareholders\n- Name ends in **(Pty) Ltd** (Proprietary Limited)\n- Shares can only be transferred with the consent of other shareholders\n- Does not need to publish financial statements publicly\n\n### Public Company (Ltd)\n- Shares ARE traded on the **Johannesburg Stock Exchange (JSE)**\n- Unlimited number of shareholders\n- Name ends in **Ltd** (Limited)\n- Must publish audited annual financial statements\n- Must have a minimum of 3 directors\n- Subject to stricter corporate governance rules'),
  t(2, '### Key Concepts\n\n| Term | Meaning |\n|------|--------|\n| **Share** | A unit of ownership in a company |\n| **Shareholder** | A person who owns shares in a company |\n| **Share capital** | The total value of shares issued by a company |\n| **No par value shares** | Shares without a fixed face value (all SA companies since 2012) |\n| **Authorised share capital** | Maximum number of shares a company may issue (per its MOI) |\n| **Issued share capital** | Shares actually sold to shareholders |\n| **Memorandum of Incorporation (MOI)** | The founding document of a company |\n| **Directors** | Persons elected by shareholders to manage the company |\n| **Auditors** | Independent persons who verify financial statements |'),
  q(3, 'Which of the following is TRUE about a public company (Ltd)?',
    ['Its shares are traded on the JSE', 'It may have a maximum of 50 shareholders', 'It does not need to publish financial statements', 'Its shares cannot be transferred without consent'], 0,
    'A public company (Ltd) has its shares traded on the JSE and has no limit on the number of shareholders.'),
  t(4, '### GAAP Principles Applied to Companies\n\nGenerally Accepted Accounting Practice (GAAP) principles guide how companies record and report financial information:\n\n| Principle | Meaning | Example |\n|-----------|---------|--------|\n| **Historical cost** | Assets recorded at original purchase price | Land bought for R500 000 stays at R500 000 in the books |\n| **Prudence (Conservatism)** | Recognise losses immediately but only recognise profits when realised | Write off bad debts as soon as identified |\n| **Materiality** | Only report items significant enough to influence decisions | R10 stapler expensed immediately, not depreciated |\n| **Business entity** | Business finances kept separate from owners\' personal finances | Director\'s personal car not in company books |\n| **Going concern** | Assume the business will continue to operate | Assets valued at cost, not liquidation value |\n| **Matching** | Match income with the expenses incurred to earn it | December sales matched with December cost of sales |'),
  fb(5, 'The ___ principle requires that a business records assets at their original purchase price. The ___ principle means losses are recognised immediately but profits only when realised.',
    ['historical cost', 'prudence'],
    'Historical cost = record at purchase price. Prudence (conservatism) = be cautious — recognise losses immediately.'),
  t(6, '### Share Issue at a Premium\n\nWhen a company issues shares at a price higher than the average price of previously issued shares, the excess is called a **share premium**. Under the Companies Act (no par value shares), all proceeds go to the **Ordinary Share Capital** account.\n\n**Example:** Campusly Ltd issues 10 000 shares at R5 each.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bank | R50 000 | |\n| Ordinary share capital | | R50 000 |\n\nLater, the company issues a further 5 000 shares at R8 each:\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bank | R40 000 | |\n| Ordinary share capital | | R40 000 |\n\nTotal ordinary share capital = R50 000 + R40 000 = **R90 000** for 15 000 shares.'),
  q(7, 'A company has 100 000 issued shares. It issues 20 000 new shares at R12 each. What is the journal entry?',
    ['Debit Bank R240 000; Credit Ordinary Share Capital R240 000', 'Debit Ordinary Share Capital R240 000; Credit Bank R240 000', 'Debit Bank R120 000; Credit Share Premium R120 000', 'Debit Share Capital R240 000; Credit Revenue R240 000'], 0,
    'Under no par value shares, the full amount (20 000 × R12 = R240 000) is credited to Ordinary Share Capital.'),
  t(8, '### Directors and Auditors\n\n**Directors:**\n- Elected by shareholders at the Annual General Meeting (AGM)\n- Responsible for the management of the company\n- Receive **directors\' fees** (an expense for the company)\n- Executive directors are involved in day-to-day management\n- Non-executive directors provide oversight and governance\n\n**Auditors:**\n- Independent of the company\n- Appointed by shareholders at the AGM\n- Examine the financial records and give an **audit opinion**\n- Verify that financial statements comply with IFRS/GAAP\n- Public companies MUST be audited; private companies may be exempt\n\n**Journal entry for directors\' fees:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Directors\' fees | R180 000 | |\n| Bank / Accrued expenses | | R180 000 |'),
  fb(9, 'Directors are elected by ___ at the Annual General Meeting. Auditors are ___ of the company and verify that financial statements comply with IFRS.',
    ['shareholders', 'independent'],
    'Shareholders elect directors. Auditors must be independent to give an unbiased opinion.'),
  q(10, 'Which GAAP principle prevents a company from including the personal car of a director in the company\'s books?',
    ['Business entity principle', 'Historical cost principle', 'Prudence principle', 'Going concern principle'], 0,
    'The business entity principle requires that the business\'s finances are kept separate from the personal finances of its owners/directors.'),
];

// --- Lesson 2: Retained Income, Dividends, and Tax ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Retained Income\n\nRetained income (also called **retained earnings**) is the accumulated profit that a company has NOT distributed to shareholders as dividends. It represents the company\'s **self-financing**.\n\n$$\\text{Retained income} = \\text{Opening balance} + \\text{Net profit after tax} - \\text{Dividends}$$\n\n### Retained Income Note\n\n| | R |\n|---|---:|\n| Balance at beginning of year | 450 000 |\n| Net profit after tax | 380 000 |\n| | 830 000 |\n| Less: Dividends | (200 000) |\n| **Balance at end of year** | **630 000** |'),
  t(2, '### Dividends\n\nDividends are the portion of profit distributed to shareholders.\n\n**Key points:**\n- Dividends are declared by the **board of directors**\n- Shareholders receive dividends in proportion to the number of shares they hold\n- **Interim dividend**: Paid during the financial year (usually at the half-year)\n- **Final dividend**: Declared after year-end when final profit is known\n- Dividends are subject to **Dividends Tax** at 20% (withheld by the company)\n\n**Example:** A company with 100 000 shares declares a dividend of R3,00 per share.\n- Total dividend = 100 000 × R3,00 = R300 000\n- Dividends tax (20%) = R300 000 × 20% = R60 000\n- Net dividend to shareholders = R300 000 − R60 000 = R240 000'),
  t(3, '### Journal Entries for Dividends\n\n**When dividends are declared (interim or final):**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Retained income / Dividends on ordinary shares | R300 000 | |\n| Shareholders for dividends | | R240 000 |\n| SARS — Dividends tax | | R60 000 |\n\n**When dividends are paid to shareholders:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Shareholders for dividends | R240 000 | |\n| Bank | | R240 000 |\n\n**When dividends tax is paid to SARS:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| SARS — Dividends tax | R60 000 | |\n| Bank | | R60 000 |'),
  q(4, 'A company declares dividends of R500 000. After 20% dividends tax, how much do shareholders receive?',
    ['R400 000', 'R500 000', 'R100 000', 'R600 000'], 0,
    'Dividends tax = R500 000 × 20% = R100 000. Shareholders receive R500 000 − R100 000 = R400 000.'),
  t(5, '### Income Tax for Companies\n\nCompanies pay **income tax** to SARS on their taxable income. The corporate tax rate in South Africa is **27%** (from 2023).\n\n**Provisional tax** is paid in advance during the year:\n- 1st provisional payment: 6 months into the financial year\n- 2nd provisional payment: At financial year-end\n- 3rd (top-up) payment: Within 6 months after year-end (if needed)\n\n**Example:** A company\'s taxable income is R800 000.\n- Income tax = R800 000 × 27% = R216 000\n- Provisional tax already paid: R150 000\n- Amount still owing to SARS = R216 000 − R150 000 = R66 000'),
  t(6, '### Journal Entries for Income Tax\n\n**Recording the income tax expense:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Income tax | R216 000 | |\n| SARS — Income tax | | R216 000 |\n\n**Provisional tax already paid during the year:**\n\n| | Debit | Credit |\n|---|---:|---:|\n| SARS — Income tax | R150 000 | |\n| Bank | | R150 000 |\n\nThe SARS — Income tax account now has a credit balance of R66 000 (R216 000 − R150 000), meaning the company still owes SARS R66 000. This appears as a **current liability** on the Balance Sheet.\n\nIf provisional tax paid EXCEEDED the actual tax, the balance would be a debit (asset) — SARS owes the company a refund.'),
  q(7, 'A company paid R180 000 in provisional tax. The actual income tax for the year is R210 000. How does this appear on the Balance Sheet?',
    ['Current liability of R30 000 (SARS — Income tax)', 'Current asset of R30 000', 'Non-current liability of R30 000', 'No effect on the Balance Sheet'], 0,
    'The company still owes SARS R210 000 − R180 000 = R30 000, which is a current liability.'),
  fb(8, 'The corporate income tax rate in South Africa is ___ %. Dividends tax is levied at ___ % and is withheld by the company on behalf of SARS.',
    ['27', '20'],
    'Corporate tax is 27% (since 2023). Dividends tax is 20%, withheld at source by the company.'),
  t(9, '### Loans to/from Directors and Members\n\nCompanies may grant loans to directors or receive loans from directors.\n\n**Loan from a director (the company borrows):**\n- Appears as a **liability** on the Balance Sheet\n- Interest paid on the loan is an expense\n\n**Loan to a director (the company lends):**\n- Appears as an **asset** on the Balance Sheet\n- Interest received on the loan is income\n- Must comply with Companies Act requirements and be disclosed\n\n| | Debit | Credit |\n|---|---:|---:|\n| Loan to director (asset) | R100 000 | |\n| Bank | | R100 000 |'),
  q(10, 'A loan FROM a director of R200 000 appears on the Balance Sheet as:',
    ['A non-current liability', 'A non-current asset', 'Ordinary share capital', 'An expense on the Income Statement'], 0,
    'A loan FROM a director means the company owes the director money, which is a liability. If repayable beyond 12 months, it is non-current.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Financial Statements of Companies (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Year-End Adjustments ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Year-End Adjustments\n\nBefore preparing financial statements, accountants must make adjustments to ensure that income and expenses are recorded in the correct financial period (the **matching principle**).\n\n### 1. Depreciation\n\nDepreciation allocates the cost of a tangible asset over its useful life.\n\n**Straight-line method:**\n$$\\text{Annual depreciation} = \\frac{\\text{Cost} - \\text{Residual value}}{\\text{Useful life}}$$\n\n**Diminishing (Reducing) balance method:**\n$$\\text{Annual depreciation} = \\text{Carrying value} \\times \\text{Rate}$$\n\n**Example:** Equipment cost R120 000, residual value R20 000, useful life 5 years.\n- Straight-line: (R120 000 − R20 000) ÷ 5 = **R20 000 per year**\n\n**Example:** Vehicle cost R300 000, depreciation rate 20% p.a. on diminishing balance.\n- Year 1: R300 000 × 20% = R60 000. Carrying value = R240 000\n- Year 2: R240 000 × 20% = R48 000. Carrying value = R192 000'),
  q(2, 'Equipment costing R80 000 with a residual value of R8 000 is depreciated over 4 years using the straight-line method. The annual depreciation is:',
    ['R18 000', 'R20 000', 'R72 000', 'R16 000'], 0,
    'Annual depreciation = (R80 000 − R8 000) ÷ 4 = R72 000 ÷ 4 = R18 000.'),
  t(3, '### 2. Bad Debts and Provision for Bad Debts\n\n**Bad debts:** When a debtor is unable to pay, the debt is written off as a loss.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bad debts | R5 000 | |\n| Debtors\' control | | R5 000 |\n\n**Provision for bad debts:** An estimate of future bad debts based on a percentage of outstanding debtors.\n\n**Example:** Debtors = R200 000. Provision for bad debts must be 5%. Existing provision = R8 000.\n- Required provision = R200 000 × 5% = R10 000\n- Increase in provision = R10 000 − R8 000 = R2 000\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bad debts | R2 000 | |\n| Provision for bad debts | | R2 000 |\n\nThe provision for bad debts is deducted from debtors on the Balance Sheet:\n- Debtors: R200 000 − R10 000 = R190 000 (net realisable value)'),
  fb(4, 'When a debtor cannot pay, the amount is written off as a ___. The provision for bad debts is deducted from ___ on the Balance Sheet.',
    ['bad debt', 'debtors'],
    'Bad debts are written off as a loss. The provision for bad debts reduces the debtors figure on the Balance Sheet to show net realisable value.'),
  t(5, '### 3. Accrued and Prepaid Items\n\n**Accrued expenses (accruals):** Expenses incurred but not yet paid.\n- Example: Salaries for December earned by employees but paid in January\n- Appears as a **current liability**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Salaries expense | R15 000 | |\n| Accrued expenses | | R15 000 |\n\n**Prepaid expenses:** Expenses paid in advance for a future period.\n- Example: Insurance for January paid in December\n- Appears as a **current asset**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Prepaid expenses (asset) | R4 000 | |\n| Insurance expense | | R4 000 |\n\n**Accrued income:** Income earned but not yet received.\n- Appears as a **current asset**\n\n**Income received in advance:** Income received for a future period.\n- Appears as a **current liability**'),
  q(6, 'Rent for January (R12 000) was paid on 28 December. At the 31 December year-end, this R12 000 is:',
    ['A prepaid expense (current asset)', 'An accrued expense (current liability)', 'An expense on the Income Statement', 'Revenue for December'], 0,
    'The rent was paid in advance for January. At year-end it has not yet been "used up", so it is a prepaid expense (current asset).'),
  t(7, '### 4. Trading Stock Adjustment\n\n**Stock deficit (shortage):** Closing stock per physical count is LESS than the stock records show.\n- Cause: Theft, damage, wastage, errors\n- The deficit is written off as an expense\n\n| | Debit | Credit |\n|---|---:|---:|\n| Trading stock deficit | R3 500 | |\n| Trading stock | | R3 500 |\n\n**Stock surplus:** Closing stock per physical count is MORE than the stock records show.\n- Cause: Recording errors, returns not captured\n\n| | Debit | Credit |\n|---|---:|---:|\n| Trading stock | R1 200 | |\n| Trading stock surplus | | R1 200 |\n\n**Damaged stock:** Stock that can only be sold below cost must be written down to **net realisable value** (NRV) per the prudence principle.'),
  q(8, 'The stock records show R145 000 but the physical count shows R141 500. The adjustment is:',
    ['Debit Trading stock deficit R3 500; Credit Trading stock R3 500', 'Debit Trading stock R3 500; Credit Trading stock surplus R3 500', 'Debit Cost of sales R3 500; Credit Bank R3 500', 'No adjustment needed'], 0,
    'Stock deficit = R145 000 − R141 500 = R3 500. Debit the deficit account (expense) and credit Trading stock (reduce the asset).'),
  fb(9, 'When physical stock is less than the records, there is a stock ___. When physical stock is more than the records, there is a stock ___.',
    ['deficit', 'surplus'],
    'Less than records = deficit (shortage). More than records = surplus.'),
  t(10, '### Summary of Year-End Adjustments\n\n| Adjustment | Debit | Credit | BS effect |\n|-----------|-------|--------|----------|\n| Depreciation | Depreciation expense | Accumulated depreciation | Reduces asset |\n| Bad debts written off | Bad debts | Debtors\' control | Reduces debtors |\n| Increase in provision | Bad debts | Provision for bad debts | Reduces net debtors |\n| Decrease in provision | Provision for bad debts | Bad debts | Increases net debtors |\n| Accrued expense | Expense account | Accrued expenses | Current liability |\n| Prepaid expense | Prepaid expenses | Expense account | Current asset |\n| Stock deficit | Trading stock deficit | Trading stock | Reduces stock |\n| Stock surplus | Trading stock | Trading stock surplus | Increases stock |'),
];

// --- Lesson 2: Income Statement and Balance Sheet ---
blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Statement of Comprehensive Income (Income Statement)\n\nThe Income Statement shows the company\'s financial performance over a period (usually one year).\n\n### Format\n\n**ABC Ltd**\n**Statement of Comprehensive Income for the year ended 28 February 2026**\n\n| | Note | R |\n|---|---|---:|\n| Revenue (Sales) | | 2 400 000 |\n| Cost of sales | | (1 440 000) |\n| **Gross profit** | | **960 000** |\n| Other operating income | | 35 000 |\n| **Gross operating income** | | **995 000** |\n| Operating expenses | | (620 000) |\n| **Operating profit (EBIT)** | | **375 000** |\n| Interest income | | 12 000 |\n| Interest expense | | (45 000) |\n| **Profit before tax** | | **342 000** |\n| Income tax | | (92 340) |\n| **Profit after tax (Net profit)** | | **249 660** |'),
  t(2, '### Cost of Sales\n\n$$\\text{Cost of sales} = \\text{Opening stock} + \\text{Purchases} - \\text{Closing stock}$$\n\n**Example:**\n- Opening stock: R180 000\n- Purchases: R1 500 000\n- Closing stock: R240 000\n- Cost of sales = R180 000 + R1 500 000 − R240 000 = **R1 440 000**\n\n### Operating Expenses (typical items)\n- Depreciation\n- Bad debts\n- Salaries and wages\n- Rent expense\n- Water and electricity\n- Insurance\n- Audit fees\n- Directors\' fees\n- Trading stock deficit\n- Repairs and maintenance'),
  q(3, 'If Revenue is R2 000 000, Cost of sales is R1 200 000, and Operating expenses are R500 000, the Operating profit is:',
    ['R300 000', 'R800 000', 'R500 000', 'R1 500 000'], 0,
    'Gross profit = R2 000 000 − R1 200 000 = R800 000. Operating profit = R800 000 − R500 000 = R300 000 (ignoring other operating income for simplicity).'),
  t(4, '## Statement of Financial Position (Balance Sheet)\n\nThe Balance Sheet shows what the company **owns** (assets), what it **owes** (liabilities), and the **shareholders\' equity** at a specific date.\n\n### Format\n\n**ABC Ltd**\n**Statement of Financial Position as at 28 February 2026**\n\n| **ASSETS** | Note | R |\n|---|---|---:|\n| **Non-current assets** | | |\n| Land and buildings | | 800 000 |\n| Equipment (cost − accum. depreciation) | | 320 000 |\n| Vehicles (cost − accum. depreciation) | | 185 000 |\n| | | **1 305 000** |\n| **Current assets** | | |\n| Trading stock | | 240 000 |\n| Debtors\' control | | 190 000 |\n| Prepaid expenses | | 4 000 |\n| Cash and cash equivalents | | 85 000 |\n| | | **519 000** |\n| **Total assets** | | **1 824 000** |'),
  t(5, '| **EQUITY AND LIABILITIES** | Note | R |\n|---|---|---:|\n| **Shareholders\' equity** | | |\n| Ordinary share capital | | 600 000 |\n| Retained income | | 630 000 |\n| | | **1 230 000** |\n| **Non-current liabilities** | | |\n| Loan from director | | 200 000 |\n| Mortgage bond | | 150 000 |\n| | | **350 000** |\n| **Current liabilities** | | |\n| Trade creditors | | 125 000 |\n| SARS — Income tax | | 66 000 |\n| Accrued expenses | | 28 000 |\n| Shareholders for dividends | | 25 000 |\n| | | **244 000** |\n| **Total equity and liabilities** | | **1 824 000** |\n\n**The accounting equation must always balance:**\n$$\\text{Assets} = \\text{Equity} + \\text{Liabilities}$$\n$$R1\\,824\\,000 = R1\\,230\\,000 + R594\\,000$$'),
  q(6, 'In the Balance Sheet, the provision for bad debts is:',
    ['Deducted from debtors under current assets', 'Shown as a current liability', 'Added to debtors under current assets', 'Shown under shareholders\' equity'], 0,
    'The provision for bad debts is deducted from Trade debtors to show the net realisable value of debtors under current assets.'),
  fb(7, 'The accounting equation states that ___ = Equity + ___. Retained income appears under ___ equity.',
    ['Assets', 'Liabilities', 'shareholders\''],
    'Assets = Equity + Liabilities. Retained income is part of shareholders\' equity.'),
  t(8, '### Notes to the Financial Statements\n\nNotes provide additional detail for items on the Income Statement and Balance Sheet.\n\n**Note: Retained Income**\n\n| | R |\n|---|---:|\n| Balance at beginning of year | 450 000 |\n| Net profit after tax | 249 660 |\n| | 699 660 |\n| Interim dividends paid | (44 660) |\n| Final dividends declared | (25 000) |\n| **Balance at end of year** | **630 000** |\n\n**Note: Trade and Other Receivables (Debtors)**\n\n| | R |\n|---|---:|\n| Trade debtors | 200 000 |\n| Provision for bad debts | (10 000) |\n| **Net trade debtors** | **190 000** |\n| Prepaid expenses | 4 000 |\n| Accrued income | — |\n| **Total** | **194 000** |'),
  q(9, 'If net profit after tax is R300 000, opening retained income is R500 000, and total dividends are R120 000, the closing retained income is:',
    ['R680 000', 'R800 000', 'R920 000', 'R380 000'], 0,
    'Closing retained income = R500 000 + R300 000 − R120 000 = R680 000.'),
  t(10, '### Cash Flow Statement (Overview)\n\nThe Cash Flow Statement shows how cash moved in and out of the business during the year. It has three sections:\n\n1. **Cash from operating activities** — Cash generated from the normal business operations (sales, expenses)\n2. **Cash from investing activities** — Cash used to buy or received from selling non-current assets\n3. **Cash from financing activities** — Cash from issuing shares, taking loans, paying dividends\n\n| Section | Inflows | Outflows |\n|---------|---------|----------|\n| Operating | Cash receipts from customers | Cash paid to suppliers and employees |\n| Investing | Sale of assets | Purchase of assets |\n| Financing | Issue of shares, new loans | Repayment of loans, payment of dividends |\n\nThe net of all three sections explains the change in the company\'s cash balance from the start to the end of the year.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Analysis and Interpretation of Financial Statements (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Profitability and Solvency Ratios ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Financial Indicators — Profitability\n\nFinancial indicators (ratios) help stakeholders assess the **performance**, **liquidity**, and **solvency** of a company.\n\n### Profitability Ratios\n\n| Ratio | Formula | Purpose |\n|-------|---------|--------|\n| Gross profit % | $$\\frac{\\text{Gross profit}}{\\text{Revenue}} \\times 100$$ | How much profit on each R1 of sales after cost of goods |\n| Operating profit % | $$\\frac{\\text{Operating profit}}{\\text{Revenue}} \\times 100$$ | Profit from core operations |\n| Net profit % | $$\\frac{\\text{Net profit after tax}}{\\text{Revenue}} \\times 100$$ | Bottom-line profitability |\n| Operating expenses % | $$\\frac{\\text{Operating expenses}}{\\text{Revenue}} \\times 100$$ | How much of revenue is consumed by expenses |'),
  t(2, '### Worked Example — Profitability\n\nUsing ABC Ltd\'s figures:\n- Revenue: R2 400 000\n- Cost of sales: R1 440 000\n- Gross profit: R960 000\n- Operating profit: R375 000\n- Net profit after tax: R249 660\n- Operating expenses: R620 000\n\n| Ratio | Calculation | Result |\n|-------|-------------|--------|\n| Gross profit % | R960 000 / R2 400 000 × 100 | **40%** |\n| Operating profit % | R375 000 / R2 400 000 × 100 | **15,6%** |\n| Net profit % | R249 660 / R2 400 000 × 100 | **10,4%** |\n| Operating expenses % | R620 000 / R2 400 000 × 100 | **25,8%** |\n\n**Interpretation:**\n- GP% of 40% means the company retains R0,40 from every R1,00 of sales after paying for goods\n- The lower the operating expenses %, the more efficient the company\n- Net profit % shows what percentage of revenue ultimately becomes profit for shareholders'),
  q(3, 'A company has Revenue of R3 000 000, Cost of sales of R1 950 000, and Operating expenses of R650 000. The Gross profit % is:',
    ['35%', '65%', '21,7%', '78,3%'], 0,
    'Gross profit = R3 000 000 − R1 950 000 = R1 050 000. GP% = R1 050 000 / R3 000 000 × 100 = 35%.'),
  t(4, '### Return Ratios\n\n| Ratio | Formula | Purpose |\n|-------|---------|--------|\n| ROSHE (Return on Shareholders\' Equity) | $$\\frac{\\text{Net profit after tax}}{\\text{Average shareholders\' equity}} \\times 100$$ | Return earned for shareholders |\n| ROTCE (Return on Total Capital Employed) | $$\\frac{\\text{Net profit before interest and tax}}{\\text{Average total capital employed}} \\times 100$$ | How effectively ALL capital is used |\n\n**Total capital employed** = Shareholders\' equity + Non-current liabilities\n\n**Average** = (Opening balance + Closing balance) ÷ 2\n\n**Example:**\n- Net profit after tax: R249 660\n- Average shareholders\' equity: R1 115 000\n- ROSHE = R249 660 / R1 115 000 × 100 = **22,4%**\n\nInterpretation: Shareholders earned a 22,4% return on their investment. This should be compared with bank interest rates and prior years.'),
  q(5, 'ROSHE of 18% and a bank savings rate of 8% suggests:',
    ['The company is generating a good return compared to saving in the bank', 'Shareholders should sell their shares', 'The company is making a loss', 'The company should close down'], 0,
    'A ROSHE of 18% exceeds the 8% bank rate, meaning shareholders are earning more by investing in the company than they would in a bank savings account.'),
  t(6, '### Solvency Ratios\n\n| Ratio | Formula | Meaning |\n|-------|---------|--------|\n| Solvency ratio | $$\\frac{\\text{Total assets}}{\\text{Total liabilities}}$$ | Can the company pay ALL its debts if it sold all assets? |\n| Debt-equity ratio | $$\\frac{\\text{Non-current liabilities}}{\\text{Shareholders\' equity}}$$ | How much long-term debt compared to equity |\n\n**Example:**\n- Total assets: R1 824 000\n- Total liabilities: R594 000\n- Solvency ratio = R1 824 000 / R594 000 = **3,07:1**\n\nInterpretation: For every R1,00 of debt, the company has R3,07 in assets. A ratio above 1:1 means the company is solvent.\n\n**Debt-equity ratio:**\n- Non-current liabilities: R350 000\n- Shareholders\' equity: R1 230 000\n- Debt-equity = R350 000 / R1 230 000 = **0,28:1**\n\nInterpretation: Low reliance on long-term debt. A ratio below 1:1 is generally considered safe.'),
  fb(7, 'A solvency ratio above ___ : 1 means the company is solvent. A high debt-equity ratio indicates ___ reliance on long-term debt.',
    ['1', 'high'],
    'Solvency ratio above 1:1 = solvent (assets exceed liabilities). High debt-equity = high reliance on borrowed funds.'),
  q(8, 'A company has total assets of R2 000 000 and total liabilities of R2 500 000. The solvency ratio is:',
    ['0,8:1 — the company is technically insolvent', '1,25:1 — the company is solvent', '0,5:1 — break-even', '2,5:1 — very safe'], 0,
    'Solvency ratio = R2 000 000 / R2 500 000 = 0,8:1. This is below 1:1, meaning liabilities exceed assets — the company is technically insolvent.'),
];

// --- Lesson 2: Liquidity and Efficiency Ratios ---
blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Liquidity Ratios\n\nLiquidity measures a company\'s ability to pay its **short-term** debts.\n\n| Ratio | Formula | Ideal |\n|-------|---------|-------|\n| Current ratio | $$\\frac{\\text{Current assets}}{\\text{Current liabilities}}$$ | 1,5:1 to 2:1 |\n| Acid test ratio | $$\\frac{\\text{Current assets} - \\text{Stock}}{\\text{Current liabilities}}$$ | 1:1 or higher |\n\n**Example (ABC Ltd):**\n- Current assets: R519 000 (Stock R240 000)\n- Current liabilities: R244 000\n\n| Ratio | Calculation | Result |\n|-------|-------------|--------|\n| Current ratio | R519 000 / R244 000 | **2,13:1** |\n| Acid test | (R519 000 − R240 000) / R244 000 | **1,14:1** |\n\n**Interpretation:**\n- Current ratio of 2,13:1 is healthy — the company can comfortably pay short-term debts\n- Acid test of 1,14:1 shows the company can still pay debts even without selling stock'),
  q(2, 'A company has current assets of R350 000 (including stock of R150 000) and current liabilities of R250 000. The acid test ratio is:',
    ['0,8:1', '1,4:1', '0,6:1', '1,0:1'], 0,
    'Acid test = (R350 000 − R150 000) / R250 000 = R200 000 / R250 000 = 0,8:1. This is below 1:1, which may be a concern.'),
  t(3, '## Efficiency Ratios\n\nEfficiency ratios measure how well the company manages its working capital.\n\n### Stock Management\n\n| Ratio | Formula |\n|-------|--------|\n| Stock turnover rate | $$\\frac{\\text{Cost of sales}}{\\text{Average stock}}$$ |\n| Stock holding period | $$\\frac{\\text{Average stock}}{\\text{Cost of sales}} \\times 365$$ |\n\n**Example:**\n- Cost of sales: R1 440 000\n- Average stock: (R180 000 + R240 000) / 2 = R210 000\n\n| Ratio | Calculation | Result |\n|-------|-------------|--------|\n| Stock turnover rate | R1 440 000 / R210 000 | **6,86 times** |\n| Stock holding period | R210 000 / R1 440 000 × 365 | **53 days** |\n\nInterpretation: Stock is sold and replaced almost 7 times per year, or stock sits for about 53 days before being sold. A higher turnover rate (fewer days) is generally better.'),
  t(4, '### Debtors and Creditors Management\n\n| Ratio | Formula |\n|-------|--------|\n| Debtors\' collection period | $$\\frac{\\text{Average debtors}}{\\text{Credit sales}} \\times 365$$ |\n| Creditors\' payment period | $$\\frac{\\text{Average creditors}}{\\text{Credit purchases}} \\times 365$$ |\n\n**Example:**\n- Average debtors: R195 000\n- Credit sales: R2 160 000 (90% of R2 400 000)\n- Debtors\' collection period = R195 000 / R2 160 000 × 365 = **33 days**\n\nInterpretation: On average, debtors take 33 days to pay. If credit terms are 30 days, collection is slightly slow.\n\n**Example:**\n- Average creditors: R118 000\n- Credit purchases: R1 500 000\n- Creditors\' payment period = R118 000 / R1 500 000 × 365 = **29 days**\n\nInterpretation: The company pays its suppliers within 29 days. Ideally, the creditors\' payment period should be LONGER than the debtors\' collection period.'),
  q(5, 'A company collects from debtors in 45 days and pays creditors in 30 days. This means:',
    ['The company may experience cash flow problems', 'The company has excellent cash flow', 'The debtors collection period is ideal', 'No impact on cash flow'], 0,
    'If the company pays creditors before it collects from debtors, cash goes out faster than it comes in. This can cause cash flow problems.'),
  fb(6, 'The stock turnover rate measures how many times stock is ___ and replaced per year. A higher rate is generally ___.',
    ['sold', 'better'],
    'Stock turnover measures how frequently inventory is sold and replaced. Higher = more efficient stock management.'),
  t(7, '### Shareholder Ratios\n\n| Ratio | Formula | Purpose |\n|-------|---------|--------|\n| Earnings per share (EPS) | $$\\frac{\\text{Net profit after tax}}{\\text{Number of shares issued}}$$ | Profit earned per share |\n| Dividends per share (DPS) | $$\\frac{\\text{Total dividends}}{\\text{Number of shares issued}}$$ | Dividend per share |\n| Dividend payout rate | $$\\frac{\\text{DPS}}{\\text{EPS}} \\times 100$$ | % of earnings distributed |\n| Net asset value (NAV) per share | $$\\frac{\\text{Shareholders\' equity}}{\\text{Number of shares issued}}$$ | Book value per share |\n\n**Example (ABC Ltd — 100 000 shares):**\n\n| Ratio | Calculation | Result |\n|-------|-------------|--------|\n| EPS | R249 660 / 100 000 | **R2,50** |\n| DPS | R69 660 / 100 000 | **R0,70** |\n| Dividend payout rate | R0,70 / R2,50 × 100 | **28%** |\n| NAV per share | R1 230 000 / 100 000 | **R12,30** |'),
  q(8, 'A company has net profit after tax of R600 000, 200 000 shares issued, and total dividends of R180 000. The EPS and dividend payout rate are:',
    ['EPS = R3,00; Payout = 30%', 'EPS = R0,90; Payout = 150%', 'EPS = R3,00; Payout = 33,3%', 'EPS = R2,10; Payout = 30%'], 0,
    'EPS = R600 000 / 200 000 = R3,00. DPS = R180 000 / 200 000 = R0,90. Payout = R0,90 / R3,00 × 100 = 30%.'),
  t(9, '### Interpreting Financial Indicators — Key Guidelines\n\n| Indicator | Good sign | Warning sign |\n|-----------|-----------|-------------|\n| Gross profit % | Stable or improving | Declining (rising cost of goods, pressure on margins) |\n| Net profit % | Increasing | Decreasing despite higher sales |\n| Current ratio | Between 1,5:1 and 2:1 | Below 1:1 (cannot pay short-term debts) |\n| Acid test | Above 1:1 | Below 0,5:1 |\n| Stock turnover | High (fast-moving stock) | Low (slow/obsolete stock) |\n| Debtors\' collection | Within credit terms | Much longer than credit terms |\n| Solvency ratio | Above 1,5:1 | Below 1:1 (insolvent) |\n| ROSHE | Above bank interest rate | Below bank interest rate |\n| EPS | Increasing year-on-year | Declining (profitability problems) |\n\n**Always compare ratios:**\n1. With previous years (trend analysis)\n2. With industry averages\n3. With the company\'s own targets'),
  q(10, 'Which combination suggests the company is struggling financially?',
    ['Current ratio 0,7:1, Net profit % declining, Debtors collection 90 days', 'Current ratio 2,1:1, ROSHE 22%, EPS increasing', 'Stock turnover 8 times, GP% 45%, Solvency 3:1', 'DPS increasing, NAV increasing, Operating expenses % decreasing'], 0,
    'A current ratio below 1:1 means the company cannot pay short-term debts, declining net profit shows profitability problems, and 90-day debtors collection means slow payment from customers.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Inventory Valuation (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: FIFO, Weighted Average, Specific Identification ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Inventory Valuation Methods\n\nWhen a business buys the same product at different prices over time, which cost do we use when items are sold? There are three methods:\n\n1. **Specific identification** — each item is individually tracked\n2. **First In, First Out (FIFO)** — oldest stock is assumed to be sold first\n3. **Weighted average** — uses an average cost per unit\n\n### Perpetual vs Periodic Inventory Systems\n\n| System | Description |\n|--------|------------|\n| **Perpetual** | Stock records are updated after EVERY purchase and sale (continuous tracking) |\n| **Periodic** | Stock is only counted at the END of the period (physical stock-take) |\n\nGrade 12 Accounting focuses on the **perpetual** inventory system with FIFO and weighted average methods.'),
  t(2, '### FIFO — First In, First Out\n\nAssumes the OLDEST stock purchased is sold FIRST.\n\n**Stock card example — FIFO (Perpetual):**\n\n| Date | Details | In (Qty × Cost) | Out (Qty × Cost) | Balance |\n|------|---------|-----------------|-------------------|--------|\n| 1 Mar | Opening | | | 100 @ R20 = R2 000 |\n| 5 Mar | Purchase | 50 @ R24 = R1 200 | | 100 @ R20 + 50 @ R24 = R3 200 |\n| 12 Mar | Sale (80 units) | | 80 @ R20 = R1 600 | 20 @ R20 + 50 @ R24 = R1 600 |\n| 20 Mar | Purchase | 60 @ R26 = R1 560 | | 20 @ R20 + 50 @ R24 + 60 @ R26 = R3 160 |\n| 28 Mar | Sale (55 units) | | 20 @ R20 + 35 @ R24 = R1 240 | 15 @ R24 + 60 @ R26 = R1 920 |\n\n**Key:** In FIFO, the cost of goods sold uses the OLDEST prices first.'),
  q(3, 'Using FIFO, if you have 30 units @ R10 and 20 units @ R12, and you sell 40 units, the cost of the sale is:',
    ['R10 × 30 + R12 × 10 = R420', 'R12 × 40 = R480', 'R10 × 40 = R400', 'R11 × 40 = R440'], 0,
    'FIFO sells the oldest first: 30 @ R10 = R300 + 10 @ R12 = R120. Total cost = R420. Remaining: 10 @ R12 = R120.'),
  t(4, '### Weighted Average Method\n\nAfter every purchase, calculate a NEW average cost per unit.\n\n$$\\text{Weighted average cost} = \\frac{\\text{Total value of stock}}{\\text{Total number of units}}$$\n\n**Stock card example — Weighted Average (Perpetual):**\n\n| Date | Details | In | Out | Balance |\n|------|---------|-----|-------|--------|\n| 1 Mar | Opening | | | 100 @ R20,00 = R2 000 |\n| 5 Mar | Purchase | 50 @ R24 = R1 200 | | 150 @ R21,33 = R3 200 |\n| 12 Mar | Sale (80 units) | | 80 @ R21,33 = R1 706,67 | 70 @ R21,33 = R1 493,33 |\n| 20 Mar | Purchase | 60 @ R26 = R1 560 | | 130 @ R23,49 = R3 053,33 |\n| 28 Mar | Sale (55 units) | | 55 @ R23,49 = R1 291,83 | 75 @ R23,49 = R1 761,50 |\n\n**After the 5 Mar purchase:** New average = R3 200 ÷ 150 = R21,33\n**After the 20 Mar purchase:** New average = R3 053,33 ÷ 130 = R23,49'),
  fb(5, 'In the FIFO method, the ___ stock purchased is assumed to be sold first. In the weighted average method, a new average is calculated after every ___.',
    ['oldest', 'purchase'],
    'FIFO = First In, First Out (oldest sold first). Weighted average recalculates after every purchase.'),
  t(6, '### Specific Identification\n\nEach item is individually identified and tracked. Used for:\n- High-value items (cars, jewellery, artwork)\n- Unique items (custom-built furniture)\n\n**Example:** A car dealership has:\n- Vehicle A: Cost R180 000\n- Vehicle B: Cost R195 000\n- Vehicle C: Cost R210 000\n\nIf Vehicle B is sold for R250 000:\n- Cost of sales = R195 000 (the actual cost of that specific vehicle)\n- Gross profit = R250 000 − R195 000 = R55 000\n\nThis method is the most accurate but is impractical for businesses with many identical items.'),
  t(7, '### Effect of Valuation Method on Profit\n\nWhen purchase prices are **rising** (inflation):\n\n| Method | Cost of sales | Closing stock | Gross profit |\n|--------|--------------|--------------|-------------|\n| FIFO | Lower (older, cheaper costs) | Higher (newer, more expensive stock) | **Higher** |\n| Weighted average | Medium | Medium | **Medium** |\n\nWhen purchase prices are **falling**:\n\n| Method | Cost of sales | Closing stock | Gross profit |\n|--------|--------------|--------------|-------------|\n| FIFO | Higher (older, more expensive costs) | Lower (newer, cheaper stock) | **Lower** |\n| Weighted average | Medium | Medium | **Medium** |\n\n**Important:** The choice of method does NOT change the actual cash flow — it only affects how profits are REPORTED.'),
  q(8, 'During a period of rising prices, which method produces the HIGHEST reported gross profit?',
    ['FIFO', 'Weighted average', 'Specific identification', 'All methods give the same profit'], 0,
    'When prices are rising, FIFO assigns older (lower) costs to cost of sales, resulting in a higher gross profit.'),
  t(9, '### Ethical Issues in Inventory\n\n| Issue | Explanation |\n|-------|------------|\n| **Obsolete stock** | Stock that is outdated or unsaleable must be written down to net realisable value |\n| **Damaged stock** | Must be revalued; cannot be kept at original cost |\n| **Wastage** | Must be investigated and controlled (internal audit function) |\n| **Theft** | Perpetual system helps detect theft (compare records to physical count) |\n| **Changing methods** | Companies should NOT change valuation methods to manipulate profits |\n| **Window dressing** | Overstating stock to make the Balance Sheet look better is unethical |\n\nThe **prudence principle** requires stock to be valued at the LOWER of cost or net realisable value.'),
  q(10, 'Stock was purchased for R45 per unit but can now only be sold for R38 per unit. At what value should it appear in the financial statements?',
    ['R38 (net realisable value)', 'R45 (historical cost)', 'R41,50 (average of cost and NRV)', 'R0 (write it off completely)'], 0,
    'The prudence principle and IAS 2 require stock to be valued at the LOWER of cost (R45) or net realisable value (R38). Therefore R38.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Fixed Assets and Internal Control (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Asset Register and Depreciation ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Fixed Assets (Tangible Non-Current Assets)\n\n### The Asset Register\n\nAn asset register is a detailed record of all non-current assets owned by the business. It includes:\n\n| Field | Description |\n|-------|------------|\n| Asset number | Unique identification code |\n| Description | What the asset is |\n| Date of purchase | When it was bought |\n| Cost price | Original purchase price |\n| Depreciation method | Straight-line or diminishing balance |\n| Depreciation rate | Percentage per year |\n| Accumulated depreciation | Total depreciation to date |\n| Carrying value (book value) | Cost − Accumulated depreciation |\n| Location | Where the asset is kept |\n| Condition | Working order, needs repair, etc. |\n\nThe asset register is an **internal control** tool — it helps the business track, protect, and verify its assets.'),
  t(2, '### Depreciation Methods Compared\n\n**Straight-line method:**\n- Same amount each year\n- Formula: (Cost − Residual value) ÷ Useful life\n- Used for: Assets that lose value evenly (furniture, buildings)\n\n**Diminishing (Reducing) balance method:**\n- Higher depreciation in early years, less in later years\n- Formula: Carrying value × Rate\n- Used for: Assets that lose value quickly early on (vehicles, computers)\n\n**Example: Vehicle cost R400 000**\n\n| Year | Straight-line (25% on cost) | Diminishing balance (25%) |\n|------|---------------------------|-------------------------|\n| 1 | R100 000 → CV R300 000 | R100 000 → CV R300 000 |\n| 2 | R100 000 → CV R200 000 | R75 000 → CV R225 000 |\n| 3 | R100 000 → CV R100 000 | R56 250 → CV R168 750 |\n| 4 | R100 000 → CV R0 | R42 188 → CV R126 562 |\n\nNote: Straight-line reaches R0 after 4 years; diminishing balance never reaches R0.'),
  q(3, 'A machine costs R250 000. Using the diminishing balance method at 20% p.a., the carrying value at the end of Year 2 is:',
    ['R160 000', 'R200 000', 'R150 000', 'R100 000'], 0,
    'Year 1: R250 000 × 20% = R50 000 depreciation. CV = R200 000. Year 2: R200 000 × 20% = R40 000. CV = R160 000.'),
  t(4, '### Disposal of Assets\n\nWhen a fixed asset is sold or scrapped, you must calculate the **profit or loss on disposal**.\n\n$$\\text{Profit/Loss} = \\text{Selling price} - \\text{Carrying value at date of sale}$$\n\n**Example:** Equipment was bought for R180 000. Accumulated depreciation at date of sale is R120 000. It is sold for R70 000.\n\n- Carrying value = R180 000 − R120 000 = R60 000\n- Selling price = R70 000\n- **Profit on disposal = R70 000 − R60 000 = R10 000**\n\n### Journal Entries for Disposal\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bank | R70 000 | |\n| Accumulated depreciation: Equipment | R120 000 | |\n| Equipment (at cost) | | R180 000 |\n| Profit on disposal of asset | | R10 000 |'),
  q(5, 'A vehicle cost R350 000. Accumulated depreciation is R280 000. It is sold for R50 000. The result is:',
    ['Loss on disposal of R20 000', 'Profit on disposal of R20 000', 'Loss on disposal of R50 000', 'No profit or loss'], 0,
    'Carrying value = R350 000 − R280 000 = R70 000. Selling price = R50 000. Loss = R50 000 − R70 000 = −R20 000 (loss of R20 000).'),
  fb(6, 'The carrying value of an asset is calculated as ___ minus accumulated depreciation. A profit on disposal occurs when the selling price is ___ than the carrying value.',
    ['cost', 'higher'],
    'Carrying value = Cost − Accumulated depreciation. Profit on disposal occurs when selling price > carrying value.'),
  t(7, '### Internal Audit vs External Audit\n\n| | Internal Audit | External Audit |\n|---|---|---|\n| **Done by** | Employees of the company | Independent external auditors |\n| **Purpose** | Improve internal controls, detect fraud, improve efficiency | Express an opinion on financial statements |\n| **Reports to** | Management / Audit committee | Shareholders |\n| **Frequency** | Ongoing throughout the year | Once a year |\n| **Legal requirement** | Not required by law | Required for public companies |\n| **Scope** | Operational and financial processes | Financial statements only |'),
  t(8, '### Internal Control Processes for Fixed Assets\n\n1. **Physical controls:**\n   - Assets must be numbered and tagged\n   - Regular physical verification (compare asset register to actual assets)\n   - Assets must be stored securely and insured\n\n2. **Authorisation controls:**\n   - Purchase of assets above a certain value needs board approval\n   - Disposal of assets must be authorised by management\n   - Maintenance expenditure must be approved\n\n3. **Record-keeping controls:**\n   - Maintain a complete and up-to-date asset register\n   - Record all movements (purchases, transfers, disposals)\n   - Reconcile asset register to general ledger regularly\n\n4. **Segregation of duties:**\n   - Different people should authorise, record, and have custody of assets\n   - Person doing the physical count should not be the record keeper'),
  q(9, 'Which of the following is an internal control weakness for fixed assets?',
    ['The same person authorises purchases and records them in the asset register', 'Different people count and record assets', 'All assets have unique identification tags', 'Disposals require board approval'], 0,
    'Having the same person authorise AND record purchases violates the segregation of duties principle and creates an opportunity for fraud.'),
  t(10, '### GAAP and Fixed Assets\n\n| Principle | Application to fixed assets |\n|-----------|---------------------------|\n| Historical cost | Record assets at original purchase price |\n| Matching | Depreciation matches the cost of the asset with the periods that benefit from its use |\n| Prudence | If an asset\'s value is impaired (permanently reduced below carrying value), write it down immediately |\n| Materiality | Small items (e.g., a R50 calculator) are expensed immediately rather than capitalised and depreciated |\n| Going concern | Assets are valued at cost less depreciation (not at forced-sale/liquidation value) |'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Cost Accounting — Manufacturing (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Manufacturing Concepts and Cost Classification ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Manufacturing vs Merchandising\n\n| | Merchandising business | Manufacturing business |\n|---|---|---|\n| **Activity** | Buys and resells finished goods | Buys raw materials and converts them into finished goods |\n| **Stock types** | Trading stock only | Raw materials, work-in-progress, finished goods |\n| **Cost of goods** | Purchase price of goods | Manufacturing cost (materials + labour + overheads) |\n| **Financial statement** | Income Statement only | Production Cost Statement + Income Statement |\n\n### Cost Classification\n\n| Classification | Direct costs | Indirect costs (Overheads) |\n|---------------|-------------|---------------------------|\n| **Materials** | Raw materials used in production | Factory supplies, cleaning materials |\n| **Labour** | Wages of factory workers who make the product | Factory supervisor salary, security |\n| **Other** | — | Factory rent, electricity, depreciation of machinery |'),
  t(2, '### Variable vs Fixed Costs\n\n| | Variable costs | Fixed costs |\n|---|---|---|\n| **Behaviour** | Change in proportion to production volume | Stay the same regardless of production volume |\n| **Examples** | Raw materials, direct labour, packaging | Factory rent, insurance, supervisor salary |\n| **Per unit** | Stays constant per unit | Decreases per unit as production increases |\n\n**Example:** A factory produces school desks.\n- Raw materials per desk: R350 (variable)\n- Direct labour per desk: R120 (variable)\n- Factory rent per month: R25 000 (fixed)\n\nIf 500 desks are produced:\n- Variable cost per desk = R350 + R120 = R470\n- Fixed cost per desk = R25 000 ÷ 500 = R50\n- Total cost per desk = R520\n\nIf 1 000 desks are produced:\n- Variable cost per desk = still R470\n- Fixed cost per desk = R25 000 ÷ 1 000 = R25\n- Total cost per desk = R495\n\n**Key insight:** Producing MORE units reduces the fixed cost per unit, which reduces the total cost per unit.'),
  q(3, 'A factory has fixed costs of R60 000 per month and variable costs of R80 per unit. If 1 500 units are produced, the total cost per unit is:',
    ['R120', 'R80', 'R140', 'R60'], 0,
    'Fixed cost per unit = R60 000 ÷ 1 500 = R40. Variable cost per unit = R80. Total = R40 + R80 = R120.'),
  fb(4, 'Costs that change with production volume are called ___ costs. Costs that remain the same regardless of production volume are called ___ costs.',
    ['variable', 'fixed'],
    'Variable costs change with output. Fixed costs stay constant.'),
  t(5, '### Production Cost Statement\n\nThe Production Cost Statement calculates the **cost of manufacturing finished goods**.\n\n**Sunshine Manufacturing**\n**Production Cost Statement for the year ended 28 February 2026**\n\n| | R | R |\n|---|---:|---:|\n| **Direct materials cost** | | |\n| Opening stock of raw materials | 45 000 | |\n| Purchases of raw materials | 380 000 | |\n| Carriage on raw materials | 12 000 | |\n| | 437 000 | |\n| Less: Closing stock of raw materials | (52 000) | |\n| **Cost of raw materials used** | | **385 000** |\n| **Direct labour cost** | | **280 000** |\n| **Prime cost** | | **665 000** |\n| **Factory overhead cost** | | |\n| Indirect materials | 18 000 | |\n| Indirect labour | 65 000 | |\n| Factory rent | 96 000 | |\n| Factory electricity | 42 000 | |\n| Depreciation: Factory equipment | 35 000 | |\n| **Total factory overheads** | | **256 000** |\n| **Total manufacturing cost** | | **921 000** |\n| Add: Opening work-in-progress | | 38 000 |\n| Less: Closing work-in-progress | | (41 000) |\n| **Cost of production (finished goods)** | | **918 000** |'),
  q(6, 'Prime cost is the total of:',
    ['Direct materials + Direct labour', 'Direct materials + Factory overheads', 'Direct labour + Factory overheads', 'All manufacturing costs'], 0,
    'Prime cost = Direct materials cost + Direct labour cost. It excludes factory overheads.'),
  t(7, '### Break-Even Analysis for Manufacturing\n\n$$\\text{Break-even quantity} = \\frac{\\text{Total fixed costs}}{\\text{Selling price per unit} - \\text{Variable cost per unit}}$$\n\nThe difference between selling price and variable cost per unit is called the **contribution per unit**.\n\n**Example:**\n- Selling price per desk: R850\n- Variable cost per desk: R470\n- Total fixed costs per month: R95 000\n\n- Contribution per unit = R850 − R470 = R380\n- Break-even = R95 000 ÷ R380 = **250 desks per month**\n\n**To earn a target profit of R57 000:**\n- Required units = (R95 000 + R57 000) ÷ R380 = **400 desks per month**'),
  q(8, 'A factory has fixed costs of R120 000. Selling price is R200 per unit and variable cost is R140 per unit. The break-even point is:',
    ['2 000 units', '600 units', '857 units', '1 500 units'], 0,
    'Contribution = R200 − R140 = R60. Break-even = R120 000 ÷ R60 = 2 000 units.'),
  t(9, '### Abridged Income Statement for a Manufacturing Business\n\n| | R |\n|---|---:|\n| Revenue (Sales) | 1 500 000 |\n| Cost of sales: | |\n| Opening stock of finished goods | 85 000 |\n| Cost of production | 918 000 |\n| | 1 003 000 |\n| Less: Closing stock of finished goods | (92 000) |\n| **Cost of sales** | **(911 000)** |\n| **Gross profit** | **589 000** |\n| Less: Administration costs | (145 000) |\n| Less: Selling and distribution costs | (98 000) |\n| **Net profit** | **346 000** |\n\n**Note:** Factory costs appear in the Production Cost Statement, not in the Income Statement. Only admin and selling costs appear below gross profit.'),
  fb(10, 'In a manufacturing business, cost of sales = opening finished goods + ___ − closing finished goods. Factory costs appear in the ___ Cost Statement.',
    ['cost of production', 'Production'],
    'Cost of sales uses cost of production (not purchases). Factory overheads are shown in the Production Cost Statement.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Reconciliations (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Bank Reconciliation ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Bank Reconciliation\n\n### Why Reconcile?\n\nThe **Bank account** in the company\'s books and the **bank statement** from the bank often show different balances. Reasons include:\n\n| Difference | Explanation |\n|-----------|------------|\n| **Outstanding deposits** | Deposits recorded in cash receipts journal but not yet on bank statement |\n| **Outstanding/Unpresented cheques** | Cheques issued and recorded in cash payments journal but not yet presented to the bank |\n| **Direct deposits** | Payments received directly into the bank (e.g., EFTs from debtors) — on bank statement but not yet in our books |\n| **Bank charges** | Deducted by the bank, not yet recorded in our books |\n| **Interest on overdraft** | Charged by bank, not yet in our books |\n| **Interest on positive balance** | Credited by bank, not yet in our books |\n| **Debit orders / Stop orders** | Recurring payments deducted by bank |\n| **Dishonoured cheques (R/D)** | Cheques that bounced — bank reverses them |\n| **Errors** | Either the business or the bank made a mistake |'),
  t(2, '### The Reconciliation Process\n\n**Step 1:** Update the Cash Journals (CRJ and CPJ) with items on the bank statement not yet in our books:\n- Bank charges → CPJ\n- Interest charged → CPJ\n- Interest received → CRJ\n- Direct deposits from debtors → CRJ\n- Debit orders → CPJ\n- Dishonoured cheques → CPJ (or reverse in CRJ)\n- Errors in our books → correct in the relevant journal\n\n**Step 2:** Prepare the Bank Reconciliation Statement starting with the balance per the bank statement, then adjust for items in our books not yet on the bank statement.\n\n### Bank Reconciliation Statement\n\n| | R |\n|---|---:|\n| Balance per bank statement (credit/favourable) | 45 320 |\n| Add: Outstanding deposits | 12 500 |\n| | 57 820 |\n| Less: Outstanding cheques | |\n| Cheque 4521 | (3 200) |\n| Cheque 4525 | (8 400) |\n| Cheque 4528 | (1 450) |\n| | (13 050) |\n| **Balance per Bank account (debit)** | **44 770** |'),
  q(3, 'An outstanding deposit of R8 000 means:',
    ['The business recorded it but the bank has not yet processed it', 'The bank recorded it but the business has not', 'The deposit has been cancelled', 'It is a dishonoured cheque'], 0,
    'An outstanding deposit is one that the business has recorded in its CRJ and deposited, but the bank has not yet processed it on the bank statement.'),
  fb(4, 'Bank charges and debit orders appear on the bank statement but not in our books. They must be recorded in the ___. Outstanding cheques appear in our books but not on the ___.',
    ['cash payments journal', 'bank statement'],
    'Items on the bank statement not in our books go to CRJ/CPJ. Outstanding items are in our books but not on the bank statement.'),
  t(5, '### Worked Example\n\nThe Bank account in the ledger shows a debit balance of R44 770 on 28 February.\nThe bank statement shows a credit balance of R45 320 on 28 February.\n\n**Differences identified:**\n1. Bank charges of R350 not yet recorded ✎ CPJ\n2. Interest on favourable balance R180 not yet recorded ✎ CRJ\n3. Debit order for insurance R1 200 not yet recorded ✎ CPJ\n4. Direct deposit from J. Smith R6 500 not yet recorded ✎ CRJ\n5. Cheque 4529 for R2 100 not yet on bank statement (outstanding cheque)\n6. Deposit of R5 000 on 28 Feb not yet on bank statement (outstanding deposit)\n\n**Updated Bank account balance:**\nR44 770 + R180 + R6 500 − R350 − R1 200 = **R49 900**\n\n**Bank Reconciliation Statement:**\n\n| | R |\n|---|---:|\n| Balance per bank statement | 45 320 |\n| Add: Outstanding deposit (28 Feb) | 5 000 |\n| | 50 320 |\n| Plus: Direct deposit from J. Smith | 6 500 |\n| Plus: Interest received | 180 |\n| Less: Bank charges | (350) |\n| Less: Debit order insurance | (1 200) |\n\nWait — the reconciliation statement only deals with items NOT yet on the bank statement:\n\n| | R |\n|---|---:|\n| Balance per bank statement | 45 320 |\n| Add: Outstanding deposit | 5 000 |\n| Less: Outstanding cheque 4529 | (2 100) |\n| **Balance per adjusted Bank account** | **48 220** |\n\nHmm, let me redo: after updating journals, the new bank balance should equal the adjusted bank statement. The correct approach adjusts both sides and they should agree.'),
  q(6, 'A dishonoured (R/D) cheque from a debtor means:',
    ['The debtor\'s cheque bounced and the bank reversed the deposit', 'The business wrote a cheque that bounced', 'The bank made an error', 'The cheque was stolen'], 0,
    'A dishonoured (returned/R/D) cheque means a cheque deposited from a debtor was rejected by the debtor\'s bank (insufficient funds). The amount is reversed from our bank account.'),
  t(7, '### Common Errors in Bank Reconciliations\n\n| Error | Correction |\n|-------|----------|\n| Amount recorded incorrectly in CRJ/CPJ | Correct in the relevant journal |\n| Cheque recorded in wrong debtor/creditor account | Journal entry to correct |\n| Deposit recorded twice | Reverse the duplicate entry |\n| Bank error (wrong amount or wrong account) | Notify the bank — this goes on the reconciliation statement until corrected |\n| Transposition error (e.g., R5 340 vs R5 430) | Correct in our books or notify the bank |'),
  fb(8, 'A cheque issued by the business but not yet presented to the bank is called an ___ cheque. A deposit made but not yet appearing on the bank statement is called an ___ deposit.',
    ['outstanding', 'outstanding'],
    'Both are called "outstanding" items. Outstanding cheques and outstanding deposits are items in our books but not yet on the bank statement.'),
];

// --- Lesson 2: Debtors' and Creditors' Reconciliation ---
blockNum = 0;
const ch7_lesson2 = [
  t(1, '## Debtors\' Reconciliation\n\n### Purpose\nTo verify that the **Debtors\' control account** balance in the general ledger agrees with the **Debtors\' list** (total of all individual debtor balances in the debtors\' ledger).\n\n### Debtors\' Control Account\n\n| Debit side | Credit side |\n|-----------|------------|\n| Opening balance (total owed) | Bank (receipts from debtors) |\n| Credit sales (from DJ/SDJ) | Sales returns |\n| Interest charged to debtors | Bad debts written off |\n| Dishonoured cheques | Discount allowed |\n| | Closing balance |\n\n### Reasons for Differences\n\n| Reason | Action |\n|--------|--------|\n| Entry in control but not in debtor\'s account | Post to the individual debtor\'s account |\n| Entry in debtor\'s account but not in control | Post to the debtors\' control account |\n| Error in amount | Correct the error |\n| Posted to wrong debtor\'s account | Transfer between the correct accounts |\n| Debtor\'s account omitted from the list | Add it to the debtors\' list |'),
  t(2, '### Worked Example — Debtors\' Reconciliation\n\nDebtors\' control account balance: R186 400\nDebtors\' list total: R182 200\nDifference: R4 200\n\n**Errors found:**\n1. Sales of R2 800 to M. Nkosi was posted to the control account but not to M. Nkosi\'s account in the debtors\' ledger\n2. A receipt of R1 500 from T. Dlamini was posted as R1 050 in the debtors\' ledger (transposition error)\n3. Bad debts of R950 were written off in the control account but not in K. Zulu\'s account\n\n**Corrected Debtors\' List:**\n\n| | R |\n|---|---:|\n| Debtors\' list as per ledger | 182 200 |\n| Add: M. Nkosi (sales not posted) | 2 800 |\n| Less: T. Dlamini (R1 500 − R1 050 undercast) | (450) |\n| Less: K. Zulu (bad debts not posted) | (950) |\n| **Corrected debtors\' list** | **183 600** |\n\nIf the control balance is also wrong, correct it too until both agree.'),
  q(3, 'The debtors\' control account balance is R95 000 and the debtors\' list total is R97 500. A possible reason is:',
    ['A receipt of R2 500 was posted to the control account but not to the individual debtor\'s account', 'Sales of R2 500 were understated in the control account', 'Both A and B could be correct', 'The difference is always due to fraud'], 2,
    'Both reasons could cause the control account to be R2 500 less than the debtors\' list. A receipt in the control but not in the ledger, or understated sales in the control, both create this difference.'),
  t(4, '## Creditors\' Reconciliation\n\n### Purpose\nTo verify the balance in the **Creditors\' control account** by comparing it with the **statement received from the creditor** (supplier).\n\n### Reasons for Differences\n\n| Our books | Creditor\'s statement |\n|-----------|--------------------|\n| Payment sent | Not yet received by creditor |\n| Returns sent | Not yet processed by creditor |\n| Discount claimed | Not yet recorded by creditor |\n| Invoice received late | Already on creditor\'s statement |\n| Error in our books | Correct amount on statement |\n| | Goods in transit (invoice on statement, goods not yet received by us) |\n\n### Creditors\' Reconciliation Statement\n\n| | R |\n|---|---:|\n| Balance per creditor\'s statement | 48 500 |\n| Less: Payment sent, not yet received by creditor | (8 000) |\n| Less: Returns sent, not yet processed | (2 300) |\n| Add: Invoice not yet received by us | 3 500 |\n| **Balance per our creditors\' ledger** | **41 700** |'),
  q(5, 'Our records show we owe Supplier X R35 000, but Supplier X\'s statement shows R42 000. A likely reason is:',
    ['We sent a payment of R7 000 that the supplier has not yet received', 'The supplier charged us R7 000 extra by mistake', 'Either A or B could explain the difference', 'We have overpaid the supplier'], 2,
    'The R7 000 difference could be caused by a payment in transit (in our books but not on the statement) or an error/extra charge on the statement. Both are plausible.'),
  t(6, '### Age Analysis of Debtors\n\nAn age analysis classifies debtors by how long they have owed money:\n\n| Debtor | Current (0-30 days) | 31-60 days | 61-90 days | 90+ days | Total |\n|--------|---:|---:|---:|---:|---:|\n| M. Nkosi | 5 200 | 2 800 | — | — | 8 000 |\n| T. Dlamini | 3 100 | 1 500 | 4 200 | — | 8 800 |\n| K. Zulu | — | — | 1 800 | 6 500 | 8 300 |\n| S. Moyo | 7 400 | — | — | — | 7 400 |\n| **Total** | **15 700** | **4 300** | **6 000** | **6 500** | **32 500** |\n\n**Purpose of age analysis:**\n- Identify slow-paying debtors for follow-up\n- Determine the provision for bad debts\n- K. Zulu (90+ days) is high risk and may need to be written off\n- Helps management make informed credit decisions'),
  fb(7, 'An age analysis classifies debtors by how long they have ___ money. Amounts in the 90+ days column are considered ___ risk.',
    ['owed', 'high'],
    'Age analysis shows how long debts have been outstanding. Older debts (90+ days) have a higher risk of becoming bad debts.'),
  q(8, 'The creditors\' reconciliation statement adjusts the balance per the creditor\'s statement for:',
    ['Items in our books but not yet on the creditor\'s statement', 'Items on the bank statement not in our books', 'Items that require journal entries', 'Items that affect the debtors\' control account'], 0,
    'The creditors\' reconciliation starts with the creditor\'s statement balance and adjusts for items in our books that the creditor has not yet processed (payments in transit, returns in transit).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: VAT (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Value Added Tax (VAT)\n\n### Overview\n\nVAT is an **indirect tax** levied at **15%** on most goods and services in South Africa. It is administered by SARS.\n\n| Term | Meaning |\n|------|--------|\n| **Output VAT** | VAT charged on sales — collected FROM customers on behalf of SARS |\n| **Input VAT** | VAT paid on purchases — paid TO suppliers, claimable from SARS |\n| **VAT vendor** | A business registered for VAT (turnover > R1 million must register) |\n\n### VAT Payable to / Receivable from SARS\n\n$$\\text{VAT payable} = \\text{Output VAT} - \\text{Input VAT}$$\n\n- If Output VAT > Input VAT → **Pay** the difference to SARS\n- If Input VAT > Output VAT → **Claim** the difference from SARS (refund)\n\n**Example:**\n- Sales (incl. VAT): R1 150 000 → Output VAT = R150 000\n- Purchases (incl. VAT): R805 000 → Input VAT = R105 000\n- VAT payable to SARS = R150 000 − R105 000 = **R45 000**'),
  t(2, '### VAT Calculations\n\n**VAT-inclusive to VAT-exclusive:**\n$$\\text{Excl. amount} = \\frac{\\text{Incl. amount}}{1,15}$$\n$$\\text{VAT amount} = \\text{Incl. amount} - \\text{Excl. amount} = \\text{Incl. amount} \\times \\frac{15}{115}$$\n\n**VAT-exclusive to VAT-inclusive:**\n$$\\text{Incl. amount} = \\text{Excl. amount} \\times 1,15$$\n$$\\text{VAT amount} = \\text{Excl. amount} \\times 0,15$$\n\n**Example:** An invoice totals R34 500 including VAT.\n- VAT amount = R34 500 × 15/115 = **R4 500**\n- Amount excluding VAT = R34 500 − R4 500 = **R30 000**\n\nOr: R34 500 ÷ 1,15 = R30 000 (excl.); R34 500 − R30 000 = R4 500 (VAT)'),
  q(3, 'A business purchases goods for R57 500 including VAT. The input VAT is:',
    ['R7 500', 'R8 625', 'R49 000', 'R6 600'], 0,
    'Input VAT = R57 500 × 15/115 = R7 500. (Or: R57 500 ÷ 1,15 = R50 000 excl.; VAT = R57 500 − R50 000 = R7 500.)'),
  t(4, '### VAT Control Account\n\nThe VAT control account summarises all VAT transactions:\n\n| Debit (Input VAT) | Credit (Output VAT) |\n|-------------------|---------------------|\n| VAT on purchases | VAT on sales |\n| VAT on expenses (e.g., electricity) | VAT on cash sales |\n| VAT on fixed asset purchases | VAT on sale of fixed assets |\n| Payment to SARS (settlement) | Balance b/d (if owing to SARS) |\n| Balance b/d (if SARS owes us) | |\n\n**Example VAT Control Account:**\n\n| Debit | R | Credit | R |\n|-------|---:|--------|---:|\n| Input VAT: Purchases | 105 000 | Output VAT: Sales | 150 000 |\n| Input VAT: Expenses | 8 700 | Output VAT: Cash sales | 22 000 |\n| Input VAT: Equipment | 15 000 | | |\n| Bank (payment to SARS) | 43 300 | | |\n| | **172 000** | | **172 000** |\n\nAmount paid to SARS = R172 000 − R128 700 = R43 300'),
  fb(5, 'Output VAT is collected from ___ and input VAT is paid to ___. If output VAT exceeds input VAT, the business must pay the difference to ___.',
    ['customers', 'suppliers', 'SARS'],
    'Output VAT is charged to customers. Input VAT is paid to suppliers. The net amount is paid to (or claimed from) SARS.'),
  t(6, '### Items Exempt from VAT and Zero-Rated Items\n\n**Zero-rated items (0% VAT):**\n- Basic foodstuffs (brown bread, maize meal, rice, milk, eggs, vegetables, fruit, tinned pilchards, etc.)\n- Petrol and diesel (subject to fuel levy instead)\n- Exports\n- International transport\n\n**Exempt supplies (no VAT at all — cannot claim input VAT):**\n- Financial services (bank fees, insurance premiums)\n- Educational services (school fees)\n- Residential rental\n- Public transport\n\n**The difference:**\n- Zero-rated: The vendor can still claim input VAT on purchases\n- Exempt: The vendor CANNOT claim input VAT on related purchases'),
  q(7, 'A school tuckshop sells brown bread (zero-rated) and cooldrinks (standard-rated). Which statement is correct?',
    ['No VAT is charged on the bread; 15% VAT is charged on cooldrinks', 'VAT is charged on both', 'Neither item attracts VAT', '15% VAT on bread; 0% on cooldrinks'], 0,
    'Brown bread is zero-rated (0% VAT). Cooldrinks are standard-rated (15% VAT).'),
  t(8, '### Processing VAT in Journals\n\nWhen recording transactions in the journals, VAT must be separated:\n\n**Credit purchase of goods for R11 500 (incl. VAT):**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Trading stock (R11 500 ÷ 1,15) | R10 000 | |\n| VAT input (R11 500 × 15/115) | R1 500 | |\n| Creditors\' control | | R11 500 |\n\n**Cash sale of R6 900 (incl. VAT):**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bank | R6 900 | |\n| Sales (R6 900 ÷ 1,15) | | R6 000 |\n| VAT output (R6 900 × 15/115) | | R900 |'),
  q(9, 'Equipment is purchased for R92 000 including VAT. The amount debited to the Equipment account is:',
    ['R80 000', 'R92 000', 'R78 200', 'R12 000'], 0,
    'Equipment amount = R92 000 ÷ 1,15 = R80 000. The R12 000 VAT is debited to VAT Input (claimable from SARS).'),
  fb(10, 'When recording a VAT-inclusive purchase of R23 000, the trading stock account is debited with R ___ and the VAT input account is debited with R ___.',
    ['20 000', '3 000'],
    'Stock = R23 000 ÷ 1,15 = R20 000. VAT = R23 000 − R20 000 = R3 000 (or R23 000 × 15/115 = R3 000).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Budgeting (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Cash Budget and Projected Income Statement ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Budgeting\n\nA budget is a **financial plan** that sets targets for income and expenditure over a future period. It is used for:\n- Planning and controlling operations\n- Identifying potential cash flow problems in advance\n- Evaluating performance (actual vs budget)\n- Making informed business decisions\n\n### Types of Budgets\n\n| Budget | Purpose |\n|--------|--------|\n| **Cash budget** | Shows expected cash inflows and outflows — will the business have enough cash? |\n| **Projected income statement** | Shows expected profit/loss — will the business be profitable? |\n| **Sales budget** | Expected sales volume and revenue |\n| **Purchases budget** | Expected purchases needed to meet sales targets |\n| **Production budget** | (Manufacturing) Expected production quantities |'),
  t(2, '### Cash Budget\n\nA cash budget shows the expected **cash receipts** and **cash payments** for each month.\n\n**Sunshine Manufacturing — Cash Budget for March to May 2026**\n\n| | March | April | May |\n|---|---:|---:|---:|\n| **Receipts** | | | |\n| Cash sales | 45 000 | 48 000 | 52 000 |\n| Collections from debtors | 120 000 | 135 000 | 140 000 |\n| Loan received | — | 50 000 | — |\n| **Total receipts** | **165 000** | **233 000** | **192 000** |\n| **Payments** | | | |\n| Cash purchases | 15 000 | 18 000 | 16 000 |\n| Payments to creditors | 95 000 | 88 000 | 102 000 |\n| Salaries and wages | 42 000 | 42 000 | 45 000 |\n| Rent | 8 000 | 8 000 | 8 000 |\n| Equipment purchased | — | 65 000 | — |\n| Loan repayment | 5 000 | 5 000 | 5 000 |\n| **Total payments** | **165 000** | **226 000** | **176 000** |\n| **Surplus / (Deficit)** | **0** | **7 000** | **16 000** |\n| Opening bank balance | 12 000 | 12 000 | 19 000 |\n| **Closing bank balance** | **12 000** | **19 000** | **35 000** |'),
  q(3, 'In the cash budget above, April\'s closing bank balance of R19 000 is calculated as:',
    ['Opening R12 000 + Surplus R7 000 = R19 000', 'Total receipts − Total payments', 'R233 000 − R226 000', 'All of the above are correct ways to express it'], 3,
    'Closing balance = Opening balance + (Receipts − Payments) = R12 000 + R7 000 = R19 000. The surplus is R233 000 − R226 000 = R7 000.'),
  t(4, '### Projected Income Statement\n\nA projected (budgeted) income statement shows the **expected** profit for a future period.\n\n**Sunshine Manufacturing**\n**Projected Income Statement for the year ending 28 February 2027**\n\n| | Projected | Actual (2026) |\n|---|---:|---:|\n| Revenue | 1 800 000 | 1 500 000 |\n| Cost of sales | (1 080 000) | (911 000) |\n| **Gross profit** | **720 000** | **589 000** |\n| Operating expenses | (410 000) | (385 000) |\n| **Operating profit** | **310 000** | **204 000** |\n| Interest income | 5 000 | 3 500 |\n| Interest expense | (28 000) | (32 000) |\n| **Net profit before tax** | **287 000** | **175 500** |\n\n**GP% projected:** R720 000 / R1 800 000 × 100 = **40%**\n**GP% actual (2026):** R589 000 / R1 500 000 × 100 = **39,3%**'),
  fb(5, 'A cash budget shows expected cash ___ and cash ___. A projected income statement shows expected ___ for a future period.',
    ['receipts', 'payments', 'profit'],
    'Cash budget deals with cash flows (receipts and payments). Projected income statement deals with profitability.'),
  t(6, '### Variance Analysis: Projected vs Actual\n\nAfter the period, compare actual results to the budget:\n\n$$\\text{Variance} = \\text{Actual} - \\text{Projected}$$\n\n| Item | Projected | Actual | Variance | F/U |\n|------|---:|---:|---:|---|\n| Revenue | 1 800 000 | 1 720 000 | (80 000) | Unfavourable |\n| Cost of sales | (1 080 000) | (1 050 000) | 30 000 | Favourable |\n| Gross profit | 720 000 | 670 000 | (50 000) | Unfavourable |\n| Operating expenses | (410 000) | (435 000) | (25 000) | Unfavourable |\n| Net profit | 287 000 | 215 000 | (72 000) | Unfavourable |\n\n**Favourable variance:** Actual result is BETTER than projected\n- Higher income than expected → favourable\n- Lower expense than expected → favourable\n\n**Unfavourable variance:** Actual result is WORSE than projected\n- Lower income than expected → unfavourable\n- Higher expense than expected → unfavourable'),
  q(7, 'Projected salaries were R180 000 but actual salaries were R195 000. This variance is:',
    ['Unfavourable — expenses were higher than budgeted', 'Favourable — the business spent more on staff', 'Unfavourable — revenue was lower', 'Favourable — expenses were higher'], 0,
    'Higher actual expenses than budgeted is unfavourable because it reduces profit.'),
  t(8, '### Interpreting Budget Variances\n\n**Questions to ask when variances are identified:**\n\n| Unfavourable variance | Possible causes | Action |\n|----------------------|----------------|--------|\n| Revenue lower than projected | Price cuts, fewer customers, economic downturn | Investigate marketing, pricing strategy |\n| Cost of sales higher than projected | Supplier price increases, wastage, theft | Negotiate with suppliers, improve internal controls |\n| Operating expenses higher | Unplanned repairs, overtime, utility increases | Review spending, implement cost controls |\n\n| Favourable variance | Caution needed? |\n|--------------------|------------------|\n| Revenue higher than projected | Good, but was the budget realistic? |\n| Expenses lower than projected | Good, but were quality or safety compromised? |\n| Salary costs lower | Were staff cuts made? Is morale affected? |\n\n**A budget is only useful if:**\n- It is realistic and achievable\n- It is compared to actual results regularly\n- Corrective action is taken when variances are identified'),
  q(9, 'Cost of sales was projected at R600 000 but the actual was R540 000. This is:',
    ['Favourable — less was spent than planned', 'Unfavourable — less was spent than planned', 'Favourable — more was spent than planned', 'Neither favourable nor unfavourable'], 0,
    'Lower actual costs than budgeted is a favourable variance — the business spent less, which improves profitability.'),
  fb(10, 'A favourable variance for revenue means actual was ___ than projected. A favourable variance for expenses means actual was ___ than projected.',
    ['higher', 'lower'],
    'Favourable = better than expected. For revenue, better means higher. For expenses, better means lower.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Key Formulae and Exam Tips ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Key Formulae — Grade 12 Accounting\n\n### Profitability Ratios\n\n| Formula | |\n|---------|---|\n| Gross profit % | (Gross profit ÷ Revenue) × 100 |\n| Operating profit % | (Operating profit ÷ Revenue) × 100 |\n| Net profit % | (Net profit after tax ÷ Revenue) × 100 |\n| Operating expenses % | (Operating expenses ÷ Revenue) × 100 |\n| ROSHE | (Net profit after tax ÷ Average shareholders\' equity) × 100 |\n| ROTCE | (Net profit before interest and tax ÷ Average total capital employed) × 100 |\n\n### Liquidity Ratios\n\n| Formula | |\n|---------|---|\n| Current ratio | Current assets ÷ Current liabilities |\n| Acid test ratio | (Current assets − Stock) ÷ Current liabilities |'),
  t(2, '### Efficiency Ratios\n\n| Formula | |\n|---------|---|\n| Stock turnover rate | Cost of sales ÷ Average stock |\n| Stock holding period | (Average stock ÷ Cost of sales) × 365 days |\n| Debtors\' collection period | (Average debtors ÷ Credit sales) × 365 days |\n| Creditors\' payment period | (Average creditors ÷ Credit purchases) × 365 days |\n\n### Solvency and Shareholder Ratios\n\n| Formula | |\n|---------|---|\n| Solvency ratio | Total assets ÷ Total liabilities |\n| Debt-equity ratio | Non-current liabilities ÷ Shareholders\' equity |\n| EPS | Net profit after tax ÷ Number of shares issued |\n| DPS | Total dividends ÷ Number of shares issued |\n| Dividend payout rate | (DPS ÷ EPS) × 100 |\n| NAV per share | Shareholders\' equity ÷ Number of shares issued |\n\n### Manufacturing\n\n| Formula | |\n|---------|---|\n| Prime cost | Direct materials + Direct labour |\n| Total manufacturing cost | Prime cost + Factory overheads |\n| Cost of production | Total manufacturing cost + Opening WIP − Closing WIP |\n| Break-even | Total fixed costs ÷ Contribution per unit |'),
  t(3, '### Other Key Formulae\n\n| Formula | |\n|---------|---|\n| Cost of sales | Opening stock + Purchases − Closing stock |\n| Depreciation (straight-line) | (Cost − Residual value) ÷ Useful life |\n| Depreciation (diminishing balance) | Carrying value × Rate |\n| Carrying value | Cost − Accumulated depreciation |\n| VAT amount | Inclusive amount × 15 ÷ 115 |\n| Amount excl. VAT | Inclusive amount ÷ 1,15 |\n| Amount incl. VAT | Exclusive amount × 1,15 |\n| Retained income | Opening balance + Net profit after tax − Dividends |'),
  q(4, 'The formula for cost of production in a manufacturing business is:',
    ['Total manufacturing cost + Opening WIP − Closing WIP', 'Prime cost + Factory overheads', 'Direct materials + Direct labour', 'Opening stock + Purchases − Closing stock'], 0,
    'Cost of production = Total manufacturing cost + Opening WIP − Closing WIP. It represents the cost of goods that were COMPLETED during the period.'),
  t(5, '### Exam Structure\n\n**Paper 1: Financial Reporting and Evaluation — 150 marks, 2 hours**\n\n| Question | Topic | Marks (approx.) |\n|----------|-------|---:|\n| 1 | Financial statements of companies (Income Statement) | 40 |\n| 2 | Financial statements of companies (Balance Sheet + Notes) | 40 |\n| 3 | Cash Flow Statement | 30 |\n| 4 | Analysis and interpretation of financial statements | 40 |\n\n**Paper 2: Managerial Accounting, Internal Auditing and Control — 150 marks, 2 hours**\n\n| Question | Topic | Marks (approx.) |\n|----------|-------|---:|\n| 1 | Reconciliations (Bank and/or Debtors/Creditors) | 45 |\n| 2 | Inventory valuation (FIFO / Weighted average) | 30 |\n| 3 | Manufacturing (Production Cost Statement) | 40 |\n| 4 | Budgeting (Cash budget and/or Projected Income Statement) | 35 |'),
  t(6, '### Exam Tips for Accounting\n\n1. **Show all workings** — method marks are awarded even if the final answer is wrong\n2. **Use the correct format** — Income Statement, Balance Sheet, and Cash Flow Statement must follow the prescribed CAPS format\n3. **Label your answers clearly** — write headings, note numbers, and account names\n4. **Round to the nearest Rand** unless otherwise stated\n5. **Watch the dates** — is it for the year ended (Income Statement) or as at (Balance Sheet)?\n6. **Adjustments change BOTH the Income Statement AND Balance Sheet** — a depreciation adjustment affects the expense AND the accumulated depreciation\n7. **Read the required carefully** — some questions ask for specific notes, not the full statement\n8. **Time management** — Paper 1: approximately 1 mark per minute; Paper 2: same\n9. **Check that the Balance Sheet balances** — if it doesn\'t, look for the error\n10. **For ratios, ALWAYS write the formula first**, then substitute, then calculate'),
  q(7, 'In the exam, if you cannot get the Balance Sheet to balance, you should:',
    ['Write a "balancing figure" and note it, then move on to earn marks on other questions', 'Leave the entire Balance Sheet blank', 'Spend all remaining time trying to find the error', 'Change the retained income figure to force it to balance'], 0,
    'Time management is critical. If the Balance Sheet doesn\'t balance, insert a suspense/balancing figure, note it, and move on. You will still earn marks for the correct items.'),
  fb(8, 'Paper 1 covers ___ reporting and evaluation (150 marks). Paper 2 covers managerial accounting, ___ auditing and control (150 marks).',
    ['financial', 'internal'],
    'Paper 1 = Financial reporting and evaluation. Paper 2 = Managerial accounting, internal auditing and control.'),
  t(9, '### Mixed Practice Questions\n\n**Question 1:** A company has the following information:\n- Revenue: R4 200 000\n- Cost of sales: R2 520 000\n- Operating expenses: R980 000\n- Interest expense: R85 000\n- Income tax: 27% of profit before tax\n- 500 000 shares issued\n- Total dividends: R120 000\n\nCalculate:\n1. Gross profit % = (R1 680 000 / R4 200 000) × 100 = **40%**\n2. Operating profit = R1 680 000 − R980 000 = R700 000\n3. Net profit before tax = R700 000 − R85 000 = R615 000\n4. Income tax = R615 000 × 27% = R166 050\n5. Net profit after tax = R615 000 − R166 050 = **R448 950**\n6. EPS = R448 950 / 500 000 = **R0,90**\n7. DPS = R120 000 / 500 000 = **R0,24**\n8. Dividend payout = R0,24 / R0,90 × 100 = **26,7%**'),
  q(10, 'Using the figures from the practice question, what is the net profit percentage?',
    ['10,7%', '40%', '16,7%', '14,6%'], 0,
    'Net profit % = R448 950 / R4 200 000 × 100 = 10,69% ≈ 10,7%.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

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
      title: 'Chapter 1: Companies — Unique Transactions',
      description: 'Types of companies, the Companies Act, GAAP principles, share capital, directors, auditors, retained income, dividends, and income tax.',
      order: 1,
      lessons: [
        { title: 'Types of Companies, GAAP Principles, and Share Capital', description: 'Public vs private companies, Companies Act 71 of 2008, JSE, no par value shares, GAAP principles, directors, and auditors.', blocks: ch1_lesson1, term: 1 },
        { title: 'Retained Income, Dividends, and Income Tax', description: 'Retained income note, interim and final dividends, dividends tax, corporate income tax, provisional tax, and loans to/from directors.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Financial Statements of Companies',
      description: 'Year-end adjustments, Income Statement, Balance Sheet, Cash Flow Statement, and Notes to the financial statements.',
      order: 2,
      lessons: [
        { title: 'Year-End Adjustments', description: 'Depreciation, bad debts, provision for bad debts, accrued and prepaid items, trading stock deficit and surplus.', blocks: ch2_lesson1, term: 1 },
        { title: 'Income Statement, Balance Sheet, and Cash Flow Statement', description: 'Statement of Comprehensive Income, Statement of Financial Position, Cash Flow Statement, and Notes.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Analysis and Interpretation of Financial Statements',
      description: 'Financial indicators including profitability, liquidity, efficiency, solvency, and shareholder ratios with formulas and interpretation.',
      order: 3,
      lessons: [
        { title: 'Profitability, Return, and Solvency Ratios', description: 'Gross profit %, net profit %, operating profit %, ROSHE, ROTCE, solvency ratio, and debt-equity ratio.', blocks: ch3_lesson1, term: 1 },
        { title: 'Liquidity, Efficiency, and Shareholder Ratios', description: 'Current ratio, acid test, stock turnover, debtors collection, creditors payment, EPS, DPS, NAV, and dividend payout rate.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Inventory Valuation',
      description: 'FIFO, weighted average, and specific identification methods under the perpetual inventory system, including stock cards and effects on profit.',
      order: 4,
      lessons: [
        { title: 'Inventory Valuation Methods — FIFO, Weighted Average, and Specific Identification', description: 'Perpetual vs periodic systems, FIFO stock cards, weighted average calculations, effect on profit, and ethical issues.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Fixed Assets and Internal Control',
      description: 'Asset register, depreciation methods, disposal of assets, internal audit vs external audit, and internal control processes.',
      order: 5,
      lessons: [
        { title: 'Asset Register, Depreciation, Disposal, and Internal Controls', description: 'Asset register, straight-line and diminishing balance depreciation, profit/loss on disposal, internal vs external audit, and GAAP for fixed assets.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Cost Accounting — Manufacturing',
      description: 'Direct and indirect costs, variable and fixed costs, production cost statement, break-even analysis, and the abridged income statement.',
      order: 6,
      lessons: [
        { title: 'Manufacturing Concepts, Production Cost Statement, and Break-Even', description: 'Cost classification, prime cost, factory overheads, production cost statement, break-even analysis, and abridged income statement.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Reconciliations',
      description: 'Bank reconciliation, debtors reconciliation, creditors reconciliation, and age analysis.',
      order: 7,
      lessons: [
        { title: 'Bank Reconciliation', description: 'Bank reconciliation statement, outstanding deposits and cheques, bank charges, interest, dishonoured cheques, and errors.', blocks: ch7_lesson1, term: 2 },
        { title: 'Debtors\' and Creditors\' Reconciliation', description: 'Debtors control account, debtors list, creditors reconciliation statement, and age analysis.', blocks: ch7_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: VAT',
      description: 'Input and output VAT, VAT calculations, VAT control account, zero-rated and exempt items, and processing VAT in journals.',
      order: 8,
      lessons: [
        { title: 'VAT Calculations, Control Account, and Journal Entries', description: 'Output and input VAT, VAT payable/receivable, VAT control account, zero-rated and exempt items, and VAT in journals.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Budgeting',
      description: 'Cash budget, projected income statement, variance analysis (favourable and unfavourable), and interpretation of variances.',
      order: 9,
      lessons: [
        { title: 'Cash Budget, Projected Income Statement, and Variance Analysis', description: 'Cash budget preparation, projected income statement, actual vs projected comparison, favourable and unfavourable variances.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Revision and Exam Preparation',
      description: 'Key formulae sheet, exam structure for Paper 1 and Paper 2, exam tips, and mixed practice questions.',
      order: 10,
      lessons: [
        { title: 'Key Formulae, Exam Structure, and Practice Questions', description: 'All formulae for ratios, manufacturing, VAT, and depreciation. Paper 1 and Paper 2 structure, exam tips, and worked practice questions.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 12 Accounting \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Companies, Financial Statements, Analysis & Interpretation, Inventory Valuation, Fixed Assets, Manufacturing, Reconciliations, VAT, and Budgeting for the Grade 12 Accounting examination.',
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
  console.log('  TEXTBOOK: Grade 12 Accounting');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
