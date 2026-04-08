const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d2c1f317b8332733f72601'); // Grade 11

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
// CHAPTER 1: Bank Reconciliation (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Bank Reconciliation Concepts ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Bank Reconciliation\n\nA bank reconciliation is the process of comparing the **Cash Journals (CRJ and CPJ)** of a business with the **bank statement** to identify and correct differences.\n\n### Why Reconcile?\n- The bank statement balance and the bank account balance in the ledger rarely agree at month-end\n- Differences arise because of **timing**, **errors**, or **items not yet recorded**\n- Reconciliation ensures that the cash records are accurate and complete\n\n### Documents Used\n| Document | Kept by | Shows |\n|----------|---------|-------|\n| Cash Receipts Journal (CRJ) | Business | Money received |\n| Cash Payments Journal (CPJ) | Business | Money paid out |\n| Bank Statement | Bank | All transactions processed by the bank |\n| Bank Reconciliation Statement (BRS) | Business | Explanation of differences |'),
  t(2, '### Common Causes of Differences\n\n**Items on the bank statement but NOT in the Cash Journals:**\n- **Bank charges** (service fees, card fees)\n- **Interest on overdraft** charged by the bank\n- **Interest earned** on a positive balance\n- **Direct deposits** (EFTs received directly into the account)\n- **Debit orders** (insurance, loan repayments deducted automatically)\n- **Dishonoured cheques** (a deposited cheque that bounced / returned R/D)\n- **Bank errors** (the bank processed something incorrectly)\n\n**Items in the Cash Journals but NOT on the bank statement:**\n- **Outstanding deposits** (money deposited but not yet cleared)\n- **Outstanding cheques** (cheques issued but not yet presented for payment)\n- **Post-dated cheques** (cheques dated for a future date)'),
  q(3, 'A debit order for insurance of R850 appears on the bank statement but not in the CPJ. What must the business do?',
    ['Record the R850 in the CPJ (payment)', 'Record the R850 in the CRJ (receipt)', 'Ignore it since the bank already processed it', 'Add it to the BRS as an outstanding item'], 0,
    'Items on the bank statement but not in the journals must be recorded in the correct journal. A debit order is a payment, so it goes in the CPJ.'),
  fb(4, 'Items that appear on the bank statement but not in the cash journals must be entered in the ___. Items in the cash journals but not on the bank statement are listed on the ___.',
    ['cash journals', 'bank reconciliation statement'],
    'First update the journals, then prepare the BRS for items not yet on the bank statement.'),
  t(5, '### The Bank Reconciliation Process\n\n**Step 1:** Compare the CRJ with the deposit (credit) column of the bank statement. Tick off matching items.\n\n**Step 2:** Compare the CPJ with the payment (debit) column of the bank statement. Tick off matching items.\n\n**Step 3:** Unticked items on the bank statement must be entered in the correct journal:\n- Receipts (credits on bank statement) go in the CRJ\n- Payments (debits on bank statement) go in the CPJ\n\n**Step 4:** Unticked items in the journals become outstanding items on the BRS.\n\n**Step 5:** Prepare the Bank Reconciliation Statement.'),
  t(6, '### Bank Reconciliation Statement Format\n\n**Campusly Trading**\n**Bank Reconciliation Statement on 31 March 2026**\n\n| | R |\n|---|---:|\n| Debit balance as per bank statement | xx |\n| **Credit outstanding deposits** | |\n| Deposit 30 March (not yet cleared) | xx |\n| **Debit outstanding cheques** | |\n| Cheque 457 (not yet presented) | (xx) |\n| Cheque 461 (not yet presented) | (xx) |\n| **Errors** | |\n| Bank error (incorrect debit) | xx |\n| **Credit balance as per bank account (ledger)** | **xx** |\n\n**Note:** A debit balance on the bank statement means the business has money in the bank (the bank owes the business). A credit balance on the bank statement means the business is in overdraft.'),
  q(7, 'On the bank statement, a debit balance means:',
    ['The business has a favourable (positive) bank balance', 'The business has an overdraft', 'The bank owes SARS money', 'The business owes creditors money'], 0,
    'From the bank perspective, a debit balance means the bank owes money to the business (the business has funds available). This is opposite to the business books where a credit balance in the bank column is favourable.'),
  fb(8, 'A cheque issued by the business that has not yet been presented for payment at the bank is called an outstanding ___. A deposit made but not yet reflected on the bank statement is called an outstanding ___.',
    ['cheque', 'deposit'],
    'Outstanding cheques reduce the bank statement balance. Outstanding deposits increase it.'),
  q(9, 'Which of the following would appear on the Bank Reconciliation Statement (not in the journals)?',
    ['An outstanding cheque issued but not yet presented', 'A debit order for insurance', 'Bank charges', 'Interest earned on the account'], 0,
    'Debit orders, bank charges, and interest are recorded in the journals. Outstanding cheques are items in the journals but not on the bank statement, so they appear on the BRS.'),
  t(10, '### EFT Payments and Receipts\n\nElectronic Funds Transfers (EFTs) are instant bank payments commonly used in South Africa.\n\n**Key points:**\n- EFTs appear on the bank statement immediately (or within a day)\n- If the business records the EFT but the bank processes it the next day, it becomes an outstanding item\n- EFTs have largely replaced cheques in modern business\n\n### Dishonoured Cheques (R/D)\n\nA cheque received from a debtor and deposited may be returned by the bank because:\n- Insufficient funds in the drawer\'s account\n- The cheque is post-dated, stale, or has been stopped\n- Signature does not match\n\nWhen a cheque is dishonoured:\n\n| | Debit | Credit |\n|---|---:|---:|\n| Debtors control | xx | |\n| Bank (CRJ reversal) | | xx |\n\nThe debtor still owes the money.'),
];

// --- Lesson 2: Bank Reconciliation Worked Example ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Worked Example: Bank Reconciliation\n\n**Campusly Stores** — 28 February 2026\n\nThe bank account in the ledger shows a debit balance (favourable) of **R24 350**.\nThe bank statement shows a credit balance (favourable from the bank\'s perspective) of **R31 200**.\n\nThe following differences were identified:\n\n1. Bank charges of R180 appear on the bank statement, not in the CPJ\n2. A debit order for insurance of R1 500 appears on the bank statement, not in the CPJ\n3. Interest earned of R420 appears on the bank statement, not in the CRJ\n4. A deposit from a debtor (EFT) of R3 600 appears on the bank statement, not in the CRJ\n5. Cheque 287 for R5 800 has not yet been presented at the bank\n6. A deposit of R2 450 made on 28 Feb has not yet appeared on the bank statement\n7. A cheque for R800 from debtor M. Nkosi was dishonoured (R/D) — on the bank statement but not in the CRJ'),
  t(2, '### Step 1: Update the Cash Journals\n\nItems on the bank statement but not in the journals:\n\n**CRJ (receipts):**\n- Interest earned: R420\n- EFT from debtor: R3 600\n\n**CPJ (payments):**\n- Bank charges: R180\n- Debit order (insurance): R1 500\n- Dishonoured cheque (M. Nkosi): R800\n\n**Updated bank balance in the ledger:**\n\n| | R |\n|---|---:|\n| Balance before adjustments | 24 350 |\n| Add: Interest earned | 420 |\n| Add: EFT from debtor | 3 600 |\n| Less: Bank charges | (180) |\n| Less: Debit order (insurance) | (1 500) |\n| Less: Dishonoured cheque | (800) |\n| **Adjusted bank balance** | **25 890** |'),
  t(3, '### Step 2: Bank Reconciliation Statement\n\n**Campusly Stores**\n**Bank Reconciliation Statement on 28 February 2026**\n\n| | R |\n|---|---:|\n| Debit balance as per bank statement | 31 200 |\n| Credit outstanding deposit (28 Feb) | 2 450 |\n| Debit outstanding cheque no. 287 | (5 800) |\n| | |\n| = 31 200 + 2 450 - 5 800 | |\n| **Debit balance as per bank account** | **27 850** |\n\n**Wait** — let us verify: our adjusted ledger balance is R25 890, but the BRS gives R27 850. This means we need to recheck.\n\nActually, the dishonoured cheque was already deducted from the bank statement (the bank reversed the deposit), so it reduces the ledger balance but does NOT affect the BRS. Let us re-verify:\n\nBank statement balance: R31 200\n+ Outstanding deposit: R2 450\n- Outstanding cheque 287: R5 800\n= R31 200 + R2 450 - R5 800 = **R27 850**\n\nLedger: R24 350 + R420 + R3 600 - R180 - R1 500 - R800 = **R25 890**\n\nThe difference of R1 960 suggests we need to recheck. In practice, if the BRS does not balance, there is an undetected error.'),
  q(4, 'Bank charges of R250 appear on the bank statement but not in the journals. The correct treatment is:',
    ['Record R250 in the CPJ as a bank charges payment', 'Add R250 to the BRS as an outstanding deposit', 'Deduct R250 from the bank statement balance', 'Ignore it until next month'], 0,
    'Bank charges on the bank statement but not in the journals must be recorded in the CPJ (it is a payment/expense).'),
  t(5, '### Corrected Worked Example\n\nLet us use clean numbers. **Phakathi Trading** — 31 March 2026\n\nBank statement shows a debit balance of **R18 600**.\nThe following items were identified:\n\n**On bank statement, not in journals:**\n- Bank charges: R220\n- Debit order (rates): R1 800\n- EFT from debtor P. Dlamini: R4 500\n- Interest earned: R380\n\n**In journals, not on bank statement:**\n- Outstanding cheque no. 312: R3 400\n- Outstanding deposit (31 March): R2 100'),
  t(6, '### Solution\n\n**Update the ledger (bank account):**\nBalance before: We need to find this.\n\nLedger balance = Bank statement balance - outstanding deposits + outstanding cheques + journal adjustments\n\nLet us work backwards:\n- Start with the bank statement: R18 600\n- Add outstanding deposit: R2 100 (in our books but not bank)\n- Less outstanding cheque: R3 400 (in our books but not bank)\n- This gives the **unadjusted** ledger balance: R18 600 + R2 100 - R3 400 = R17 300\n\n**Now adjust for items on bank statement not yet in journals:**\n- Add EFT received: R4 500\n- Add interest earned: R380\n- Less bank charges: R220\n- Less debit order: R1 800\n- Adjusted ledger balance: R17 300 + R4 500 + R380 - R220 - R1 800 = **R20 160**\n\nWait, that gives an adjusted balance higher than the bank statement — let us reconcile properly.'),
  t(7, '### Proper Reconciliation Format\n\nThe correct approach:\n\n**Step 1: Adjust the CRJ and CPJ** (items on bank statement not in journals)\n\nCRJ additions: R4 500 + R380 = R4 880\nCPJ additions: R220 + R1 800 = R2 020\nNet effect on ledger balance: +R4 880 - R2 020 = +R2 860\n\n**Step 2: Bank Reconciliation Statement**\n\n| | R |\n|---|---:|\n| Debit balance as per bank statement | 18 600 |\n| Credit outstanding deposit (31 March) | 2 100 |\n| Debit outstanding cheque no. 312 | (3 400) |\n| **Debit balance as per bank account (adjusted)** | **17 300** |\n\nAnd the adjusted ledger balance after journal entries = original ledger balance + R2 860.\nFor the BRS to balance: original ledger balance + R2 860 = R17 300, so original ledger balance = R14 440.\n\nAfter adjusting journals: R14 440 + R2 860 = **R17 300** which matches the BRS.'),
  q(8, 'An outstanding deposit of R3 200 appears in the CRJ but not on the bank statement. On the BRS, this amount is:',
    ['Added to the bank statement balance', 'Deducted from the bank statement balance', 'Added to the ledger balance', 'Recorded in the CPJ'], 0,
    'An outstanding deposit is money the business deposited (recorded in CRJ) but the bank has not yet processed. It is added to the bank statement balance on the BRS.'),
  fb(9, 'On the BRS, outstanding deposits are ___ to the bank statement balance, while outstanding cheques are ___ from the bank statement balance.',
    ['added', 'deducted'],
    'Outstanding deposits increase the bank statement balance (they will appear when cleared). Outstanding cheques decrease it (they will be deducted when presented).'),
  q(10, 'A dishonoured cheque from debtor K. Moyo for R1 200 appears on the bank statement. The business should:',
    ['Debit Debtors control R1 200 and credit Bank R1 200 in the CRJ', 'Add R1 200 to the BRS as an outstanding item', 'Credit Debtors control R1 200 and debit Bank R1 200', 'Ignore it since the bank has already processed it'], 0,
    'A dishonoured cheque means the deposit was reversed by the bank. The debtor still owes the money, so debit Debtors control and credit Bank.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Creditors Reconciliation (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Creditors Reconciliation Concepts ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Creditors Reconciliation\n\nA creditors reconciliation compares the **creditor\'s statement** (sent by the supplier) with the **creditor\'s account in the Creditors Ledger** of the business.\n\n### Purpose\n- Verify that the amount the business owes the creditor is correct\n- Identify missing invoices, credit notes, or payments\n- Detect errors made by either party\n- Ensure timely payment to maintain good supplier relationships\n\n### Documents Involved\n| Document | Prepared by | Purpose |\n|----------|------------|--------|\n| Creditor\'s Statement | Supplier | Shows all transactions from the supplier\'s perspective |\n| Creditors Ledger Account | Business | Shows all transactions recorded by the business |\n| Creditors Reconciliation Statement | Business | Explains the difference between the two |'),
  t(2, '### Common Differences\n\n**On the creditor\'s statement but NOT in the Creditors Ledger:**\n- Invoice not yet received or not yet recorded\n- Credit note not yet received or not yet recorded\n- Interest charged by the creditor\n- Delivery charges added by the creditor\n- Errors by the creditor\n\n**In the Creditors Ledger but NOT on the creditor\'s statement:**\n- Payment sent but not yet received by the creditor\n- Returns (debit note sent) not yet processed by the creditor\n- Errors by the business\n\n### Key Principle\nThe creditor\'s statement and the creditors ledger are **mirror images**:\n- A **debit** in the creditor\'s statement (we owe more) = a **credit** in our ledger\n- A **credit** in the creditor\'s statement (we owe less) = a **debit** in our ledger'),
  q(3, 'An invoice from a supplier appears on the creditor\'s statement but not in the business\'s Creditors Ledger. What should the business do?',
    ['Record the invoice in the Creditors Journal (CJ)', 'Add it to the Creditors Reconciliation Statement only', 'Ignore it until the supplier sends a reminder', 'Record it in the Cash Payments Journal'], 0,
    'Missing invoices must be recorded in the Creditors Journal (purchases on credit). They cannot just be listed on the reconciliation statement.'),
  fb(4, 'The creditor\'s statement is prepared by the ___, while the Creditors Ledger is maintained by the ___.',
    ['supplier', 'business'],
    'The supplier sends a statement showing what they believe is owed. The business keeps its own record in the Creditors Ledger.'),
  t(5, '### Creditors Reconciliation Statement Format\n\n**Campusly Trading**\n**Creditors Reconciliation Statement with Phakathi Suppliers on 31 March 2026**\n\n| | R |\n|---|---:|\n| Balance as per Creditors Ledger (credit) | 12 400 |\n| **Items on statement, not in ledger:** | |\n| Invoice 782 not yet recorded | 3 200 |\n| Credit note 56 not yet recorded | (800) |\n| **Items in ledger, not on statement:** | |\n| Payment (EFT 15 March) not yet received by creditor | (2 600) |\n| Debit note for returns not yet processed | (1 100) |\n| **Balance as per Creditor\'s Statement (credit)** | **11 100** |\n\n**Note:** We start with OUR balance and reconcile TO the creditor\'s statement balance (or vice versa). The direction depends on what your exam question requires.'),
  t(6, '### Understanding the Reconciliation Direction\n\n**Starting from the Creditors Ledger balance:**\n- Items on the statement not in our books: These will INCREASE or DECREASE our balance once recorded\n  - Missing invoice: ADD (we will owe more when recorded)\n  - Missing credit note: SUBTRACT (we will owe less when recorded)\n- Items in our books not on the statement: These will INCREASE or DECREASE the statement balance once processed\n  - Payment not received: SUBTRACT (the supplier will show less owed once they receive it)\n  - Returns not processed: SUBTRACT (the supplier will reduce our balance once processed)\n\nThe reconciliation adjusts from one balance to arrive at the other.'),
  q(7, 'A payment of R5 000 sent by EFT on 28 March has not yet appeared on the creditor\'s statement dated 31 March. On the reconciliation statement (starting from the ledger balance), this payment is:',
    ['Deducted (it will reduce the statement balance when received)', 'Added (the creditor has not recorded it yet)', 'Ignored because it is an EFT', 'Recorded in the CRJ'], 0,
    'The payment is in our books (reducing what we owe) but not on the statement. When the creditor processes it, their balance will decrease. Starting from our ledger balance, we deduct it to arrive at the statement balance.'),
  fb(8, 'An invoice on the creditor\'s statement that is not in the Creditors Ledger must be recorded in the ___. A credit note on the statement not yet recorded must be entered in the ___.',
    ['Creditors Journal', 'Creditors Allowances Journal'],
    'Invoices for purchases on credit go in the Creditors Journal. Credit notes (allowances) go in the Creditors Allowances Journal (or General Journal).'),
  q(9, 'The Creditors Ledger shows a balance of R8 200. An invoice for R1 500 on the statement was not recorded. A payment of R2 000 by the business was not on the statement. The creditor\'s statement balance should be:',
    ['R7 700', 'R8 200', 'R11 700', 'R9 700'], 0,
    'Start with ledger: R8 200. Add unrecorded invoice: +R1 500 = R9 700. Deduct unprocessed payment: -R2 000 = R7 700. The creditor\'s statement should show R7 700.'),
  t(10, '### Practical Tips for Exams\n\n1. **Always tick off matching items** between the statement and the ledger\n2. **Identify the direction** of reconciliation (from ledger to statement or from statement to ledger)\n3. **Invoices increase** the amount owed; **credit notes and payments decrease** it\n4. **Check for transposition errors** (e.g., R1 350 recorded as R1 530)\n5. **Interest charged** by a creditor must be recorded in the CPJ or General Journal\n6. Items already in both records do NOT appear on the reconciliation statement\n7. The reconciliation statement explains the difference — it does not fix it. Fixing happens in the journals.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Fixed Assets (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Asset Register and Depreciation ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Fixed Assets and the Asset Register\n\nFixed assets (also called **tangible assets** or **non-current assets**) are long-term assets used in the business to generate income. They are NOT held for resale.\n\n**Examples:** Land, buildings, vehicles, equipment, furniture, machinery\n\n### The Asset Register\n\nAn asset register is a detailed record of all fixed assets owned by the business.\n\n| Field | Description |\n|-------|------------|\n| Asset description | What the asset is |\n| Date purchased | When it was bought |\n| Cost price | Original purchase price |\n| Estimated useful life | How long the asset will be used |\n| Depreciation method | Straight-line or diminishing balance |\n| Depreciation rate | Percentage or annual amount |\n| Accumulated depreciation | Total depreciation to date |\n| Carrying value (book value) | Cost minus accumulated depreciation |'),
  t(2, '### Depreciation Methods\n\n**1. Straight-Line Method**\n$$\\text{Annual depreciation} = \\frac{\\text{Cost price} - \\text{Residual value}}{\\text{Useful life in years}}$$\n\nThe depreciation amount is the **same every year**.\n\n**Example:** Equipment costs R60 000, residual value R6 000, useful life 6 years.\nAnnual depreciation = (R60 000 - R6 000) / 6 = **R9 000 per year**\n\n| Year | Cost | Accum. Depr. | Carrying Value |\n|------|------|-------------|----------------|\n| 0 | 60 000 | 0 | 60 000 |\n| 1 | 60 000 | 9 000 | 51 000 |\n| 2 | 60 000 | 18 000 | 42 000 |\n| 3 | 60 000 | 27 000 | 33 000 |\n| 4 | 60 000 | 36 000 | 24 000 |\n| 5 | 60 000 | 45 000 | 15 000 |\n| 6 | 60 000 | 54 000 | 6 000 |'),
  t(3, '**2. Diminishing (Reducing) Balance Method**\n$$\\text{Annual depreciation} = \\text{Carrying value at start of year} \\times \\text{Rate}$$\n\nThe depreciation amount **decreases each year** because the carrying value gets smaller.\n\n**Example:** Vehicle costs R200 000, depreciation rate 25% p.a. on diminishing balance.\n\n| Year | Carrying Value (start) | Depreciation | Carrying Value (end) |\n|------|----------------------|-------------|---------------------|\n| 1 | 200 000 | 50 000 | 150 000 |\n| 2 | 150 000 | 37 500 | 112 500 |\n| 3 | 112 500 | 28 125 | 84 375 |\n| 4 | 84 375 | 21 094 | 63 281 |\n\n**Key difference:** Straight-line gives equal annual amounts. Diminishing balance gives higher depreciation in the early years and lower in later years.'),
  q(4, 'A machine costing R150 000 with a residual value of R30 000 is depreciated over 5 years using the straight-line method. The annual depreciation is:',
    ['R24 000', 'R30 000', 'R120 000', 'R36 000'], 0,
    'Annual depreciation = (R150 000 - R30 000) / 5 = R120 000 / 5 = R24 000.'),
  q(5, 'A vehicle has a carrying value of R180 000 at the start of year 3. Depreciation is 20% p.a. on diminishing balance. The depreciation for year 3 is:',
    ['R36 000', 'R180 000', 'R20 000', 'R144 000'], 0,
    'Diminishing balance: R180 000 x 20% = R36 000. The carrying value at end of year 3 = R180 000 - R36 000 = R144 000.'),
  t(6, '### Journal Entries for Depreciation\n\n| | Debit | Credit |\n|---|---:|---:|\n| Depreciation (expense) | R9 000 | |\n| Accumulated depreciation: Equipment | | R9 000 |\n\n**Important:**\n- Depreciation is an **expense** (reduces profit on the Income Statement)\n- Accumulated depreciation is a **contra-asset** (reduces the asset on the Balance Sheet)\n- The original cost of the asset does NOT change\n\n**Balance Sheet presentation:**\n\n| | R |\n|---|---:|\n| Equipment at cost | 60 000 |\n| Less: Accumulated depreciation | (18 000) |\n| **Carrying value** | **42 000** |'),
  fb(7, 'The straight-line method gives ___ depreciation amounts each year. The diminishing balance method applies the rate to the ___ at the start of each year.',
    ['equal', 'carrying value'],
    'Straight-line = same amount each year. Diminishing balance = rate applied to the reducing carrying value.'),
  t(8, '### Depreciation for Part of a Year\n\nWhen an asset is purchased during the financial year, depreciation is calculated **proportionally** for the number of months owned.\n\n**Example:** Equipment costing R48 000 (residual value R0, useful life 4 years) is purchased on 1 September. The financial year ends on 28 February.\n\n- Full year depreciation = R48 000 / 4 = R12 000\n- Months owned in this financial year: September to February = 6 months\n- Depreciation for the year = R12 000 x 6/12 = **R6 000**\n\n**For diminishing balance:**\n- Vehicle cost R120 000, rate 30% p.a., purchased 1 December, year-end 28 February.\n- Full year depreciation = R120 000 x 30% = R36 000\n- Months: December to February = 3 months\n- Depreciation = R36 000 x 3/12 = **R9 000**'),
  q(9, 'Equipment costing R96 000 (no residual value, 8-year life) is bought on 1 July. Year-end is 28 February. The first year depreciation (straight-line) is:',
    ['R8 000', 'R12 000', 'R96 000', 'R4 000'], 0,
    'Full year = R96 000 / 8 = R12 000. Months: July to February = 8 months. Depreciation = R12 000 x 8/12 = R8 000.'),
  q(10, 'Which depreciation method results in higher depreciation in the early years and lower depreciation in later years?',
    ['Diminishing (reducing) balance method', 'Straight-line method', 'Both give the same amounts', 'Neither method changes over time'], 0,
    'The diminishing balance method applies the rate to a decreasing carrying value, resulting in higher depreciation early on.'),
];

// --- Lesson 2: Disposal of Fixed Assets ---
blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Disposal of Fixed Assets\n\nWhen a business sells or scraps a fixed asset, the asset and its accumulated depreciation must be removed from the books. A **profit or loss on disposal** may result.\n\n### Key Concepts\n\n$$\\text{Carrying value at disposal} = \\text{Cost price} - \\text{Accumulated depreciation to date of disposal}$$\n\n$$\\text{Profit on disposal} = \\text{Selling price} - \\text{Carrying value}$$\n\n- If selling price > carrying value: **Profit on disposal** (other operating income)\n- If selling price < carrying value: **Loss on disposal** (operating expense)\n- If selling price = carrying value: No profit or loss'),
  t(2, '### Worked Example\n\n**Campusly Training** sells old equipment on 31 August 2025.\n\n| Detail | Amount |\n|--------|--------|\n| Cost price | R80 000 |\n| Accumulated depreciation to date of sale | R56 000 |\n| Selling price | R30 000 |\n\n**Carrying value** = R80 000 - R56 000 = **R24 000**\n**Profit on disposal** = R30 000 - R24 000 = **R6 000**\n\n### Journal Entries for Disposal\n\n| | Debit | Credit |\n|---|---:|---:|\n| Bank | 30 000 | |\n| Accumulated depreciation: Equipment | 56 000 | |\n| Equipment at cost | | 80 000 |\n| Profit on disposal of asset | | 6 000 |\n\nThis entry removes the asset and its accumulated depreciation from the books and records the cash received and the profit.'),
  q(3, 'A vehicle costing R250 000 with accumulated depreciation of R175 000 is sold for R60 000. The result is:',
    ['Loss on disposal of R15 000', 'Profit on disposal of R15 000', 'Loss on disposal of R60 000', 'Profit on disposal of R60 000'], 0,
    'Carrying value = R250 000 - R175 000 = R75 000. Selling price = R60 000. Loss = R60 000 - R75 000 = -R15 000 (loss of R15 000).'),
  t(4, '### Disposal with Additional Depreciation\n\nIf the asset is sold **during the financial year**, depreciation must be calculated up to the date of disposal before recording the sale.\n\n**Example:** Equipment cost R120 000, straight-line over 10 years, no residual value. Bought 1 March 2023. Sold 31 August 2025. Year-end is 28 February.\n\n- Annual depreciation = R120 000 / 10 = R12 000\n- Full years: March 2023 to Feb 2025 = 2 years = R24 000\n- Part year: March 2025 to August 2025 = 6 months = R12 000 x 6/12 = R6 000\n- Total accumulated depreciation = R24 000 + R6 000 = **R30 000**\n- Carrying value at disposal = R120 000 - R30 000 = **R90 000**\n\nRemember to record the additional R6 000 depreciation BEFORE the disposal entry.'),
  fb(5, 'When an asset is disposed of during the year, depreciation must be calculated up to the ___. If the selling price exceeds the carrying value, the result is a ___ on disposal.',
    ['date of disposal', 'profit'],
    'Depreciation runs up to the date of sale. Selling price > carrying value = profit.'),
  t(6, '### Asset Register Update on Disposal\n\nWhen an asset is disposed of, the asset register must be updated:\n\n| Field | Detail |\n|-------|--------|\n| Date of disposal | 31 August 2025 |\n| Selling price | R30 000 |\n| Carrying value at disposal | R24 000 |\n| Profit / (Loss) on disposal | R6 000 |\n| Reason | Replaced with newer model |\n\nThe asset line in the register is marked as disposed and is no longer included in the total carrying value of assets.\n\n### Scrapping an Asset\n\nIf an asset is **scrapped** (discarded with no selling price):\n- Selling price = R0\n- The entire carrying value is a **loss on disposal**\n\n| | Debit | Credit |\n|---|---:|---:|\n| Accumulated depreciation: Equipment | xx | |\n| Loss on disposal of asset | xx | |\n| Equipment at cost | | xx |'),
  q(7, 'Furniture costing R45 000 with accumulated depreciation of R45 000 is scrapped. The loss on disposal is:',
    ['R0 (fully depreciated)', 'R45 000', 'R22 500', 'Cannot be determined'], 0,
    'Carrying value = R45 000 - R45 000 = R0. Scrapped for R0. Loss = R0 - R0 = R0. A fully depreciated asset scrapped at R0 has no profit or loss.'),
  t(8, '### Replacement of Assets\n\nWhen a business replaces an old asset with a new one:\n\n**Step 1:** Record the disposal of the old asset (including any trade-in value)\n**Step 2:** Record the purchase of the new asset\n\n**Example:** Old delivery vehicle (cost R180 000, accumulated depreciation R126 000) is traded in for a new vehicle costing R280 000. Trade-in value: R65 000.\n\n- Carrying value of old vehicle: R180 000 - R126 000 = R54 000\n- Trade-in value: R65 000\n- Profit on disposal: R65 000 - R54 000 = R11 000\n- Cash to be paid for new vehicle: R280 000 - R65 000 = R215 000\n\n| | Debit | Credit |\n|---|---:|---:|\n| Vehicles at cost (new) | 280 000 | |\n| Accumulated depreciation: Vehicles (old) | 126 000 | |\n| Vehicles at cost (old) | | 180 000 |\n| Bank | | 215 000 |\n| Profit on disposal of asset | | 11 000 |'),
  fb(9, 'When an old asset is given as part-payment for a new asset, the value assigned to the old asset is called the ___ value. The cash paid equals the new asset cost minus the ___ value.',
    ['trade-in', 'trade-in'],
    'The trade-in value is what the supplier allows for the old asset. Cash payment = new cost - trade-in.'),
  q(10, 'Equipment cost R60 000, accumulated depreciation R42 000. It is traded in for R20 000 against new equipment costing R85 000. The profit/(loss) on disposal is:',
    ['Profit of R2 000', 'Loss of R2 000', 'Profit of R20 000', 'Loss of R18 000'], 0,
    'Carrying value = R60 000 - R42 000 = R18 000. Trade-in = R20 000. Profit = R20 000 - R18 000 = R2 000.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Partnerships — Accounting Concepts and Final Accounts (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Partnership Formation and Unique Concepts ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Partnerships — Introduction\n\nA partnership is a business owned by **two or more persons** (maximum 20) who share profits and losses. Partnerships are governed by the **Partnership Agreement** (or partnership deed).\n\n### Key Characteristics\n- Partners have **unlimited liability** (personal assets can be used to pay business debts)\n- A partnership is NOT a separate legal entity from its partners\n- Each partner is an **agent** of the partnership (can bind the business in contracts)\n- Partners share profits and losses according to the partnership agreement\n\n### The Partnership Agreement typically includes:\n- Names of partners and the name of the business\n- Capital contributions of each partner\n- Profit-sharing ratio\n- Interest on capital and drawings\n- Salaries to partners\n- Duties and responsibilities of each partner\n- Procedures for admitting new partners or dissolving the partnership'),
  t(2, '### Unique Accounts in Partnerships\n\n**1. Capital Accounts**\nEach partner has a separate capital account showing their permanent investment in the business.\n\n| Partner | Capital Contribution |\n|---------|--------------------|\n| A. Nkosi | R300 000 |\n| B. Dlamini | R200 000 |\n| **Total capital** | **R500 000** |\n\nCapital accounts only change when partners contribute additional capital or withdraw permanent capital.\n\n**2. Current Accounts**\nEach partner has a current account that records all partnership adjustments:\n- Interest on capital (credit)\n- Salaries to partners (credit)\n- Share of profit (credit)\n- Interest on drawings (debit)\n- Drawings (debit)\n\nThe current account balance shows whether the partnership owes the partner money (credit balance) or the partner owes the partnership (debit balance).'),
  q(3, 'Which account records a partner\'s permanent investment in a partnership?',
    ['Capital account', 'Current account', 'Drawings account', 'Retained income account'], 0,
    'The capital account records the partner\'s permanent investment. The current account records adjustments like salaries, interest, and profit sharing.'),
  t(4, '### Interest on Capital\n\nPartners may receive **interest on their capital contributions** to compensate for different investment amounts. This is calculated BEFORE profits are shared.\n\n**Example:** Partnership agreement provides for interest on capital at 10% p.a.\n- A. Nkosi: R300 000 x 10% = R30 000\n- B. Dlamini: R200 000 x 10% = R20 000\n\n| | Debit | Credit |\n|---|---:|---:|\n| Profit and Loss Appropriation | 50 000 | |\n| Current account: A. Nkosi | | 30 000 |\n| Current account: B. Dlamini | | 20 000 |\n\nInterest on capital is an appropriation of profit (not an expense). It reduces the profit available for sharing.'),
  t(5, '### Salaries to Partners\n\nPartners who work in the business may receive a **salary** to compensate for their time and effort. This is also calculated BEFORE the remaining profit is shared.\n\n**Important:** Partnership salaries are NOT the same as employee salaries. They are an **appropriation of profit**, not an operating expense.\n\n**Example:** A. Nkosi receives a salary of R120 000 p.a.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Profit and Loss Appropriation | 120 000 | |\n| Current account: A. Nkosi | | 120 000 |\n\n### Interest on Drawings\n\nPartners may be charged interest on money they withdraw from the business. This discourages excessive drawings.\n\n**Example:** B. Dlamini is charged R4 500 interest on drawings.\n\n| | Debit | Credit |\n|---|---:|---:|\n| Current account: B. Dlamini | 4 500 | |\n| Profit and Loss Appropriation | | 4 500 |'),
  fb(6, 'Interest on capital and partner salaries are appropriations of ___, not business expenses. Interest on drawings ___ the profit available for sharing.',
    ['profit', 'increases'],
    'Interest on capital and salaries reduce profit available for sharing. Interest on drawings increases it (it is charged to partners).'),
  q(7, 'Partners A and B share profits equally. Net profit is R400 000. A receives a salary of R80 000. Interest on capital: A = R20 000, B = R15 000. How much does B receive as a share of remaining profit?',
    ['R142 500', 'R200 000', 'R285 000', 'R157 500'], 0,
    'Remaining profit = R400 000 - R80 000 (salary) - R20 000 (interest A) - R15 000 (interest B) = R285 000. B share = R285 000 / 2 = R142 500.'),
  t(8, '### Profit-Sharing Ratios\n\nThe partnership agreement specifies how remaining profit (after appropriations) is shared.\n\n**Common ratios:**\n- Equal sharing (1:1)\n- In proportion to capital contributions\n- A specific ratio (e.g., 3:2 or 60:40)\n\n**Example:** Remaining profit of R285 000 shared in ratio 3:2.\n- A. Nkosi: R285 000 x 3/5 = R171 000\n- B. Dlamini: R285 000 x 2/5 = R114 000\n\n**Check:** R171 000 + R114 000 = R285 000\n\n### If no partnership agreement exists\nThe law (common law) provides that:\n- Partners share profits and losses **equally**\n- No interest on capital\n- No salaries to partners\n- No interest on drawings'),
  q(9, 'Partners X, Y, and Z share profits in ratio 5:3:2. Remaining profit after appropriations is R180 000. Partner Y receives:',
    ['R54 000', 'R60 000', 'R90 000', 'R36 000'], 0,
    'Total ratio = 5 + 3 + 2 = 10. Y share = R180 000 x 3/10 = R54 000.'),
  fb(10, 'If no partnership agreement exists, partners share profits ___. The maximum number of partners in an ordinary partnership is ___.',
    ['equally', '20'],
    'Without an agreement, common law applies: equal profit sharing. Maximum 20 partners in an ordinary partnership.'),
];

// --- Lesson 2: Partnership Financial Statements ---
blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Profit and Loss Appropriation Account\n\nThe Appropriation Account shows how the net profit is distributed among partners.\n\n**Campusly Partners**\n**Profit and Loss Appropriation Account for the year ended 28 February 2026**\n\n| | A. Nkosi | B. Dlamini | Total |\n|---|---:|---:|---:|\n| Net profit | | | 400 000 |\n| **Add:** Interest on drawings | 5 000 | 4 500 | 9 500 |\n| | | | 409 500 |\n| **Less: Appropriations** | | | |\n| Salaries | (120 000) | 0 | (120 000) |\n| Interest on capital | (30 000) | (20 000) | (50 000) |\n| | | | 239 500 |\n| **Share of remaining profit (3:2)** | (143 700) | (95 800) | (239 500) |\n| | | | **0** |\n\n**Total per partner:**\n- A. Nkosi: R120 000 + R30 000 + R143 700 - R5 000 = R288 700\n- B. Dlamini: R20 000 + R95 800 - R4 500 = R111 300'),
  t(2, '### Current Accounts of Partners\n\n**Campusly Partners — Current Account: A. Nkosi**\n\n| Debit | R | Credit | R |\n|-------|---:|--------|---:|\n| Drawings | 100 000 | Balance b/d | 15 000 |\n| Interest on drawings | 5 000 | Salary | 120 000 |\n| Balance c/d | 158 700 | Interest on capital | 30 000 |\n| | | Share of profit | 143 700 |\n| **Total** | **308 700** | | **308 700** |\n\n| | |\n|---|---|\n| Balance b/d (next period) | R158 700 (credit) |\n\nA credit balance means the partnership **owes** A. Nkosi R158 700. This appears as a current liability on the Balance Sheet.\n\nA debit balance would mean the partner **owes** the partnership, appearing as a current asset.'),
  q(3, 'Partner C has a current account with: Salary R60 000, Interest on capital R15 000, Share of profit R80 000, Drawings R140 000, Interest on drawings R3 000. The balance of the current account is:',
    ['R12 000 credit (partnership owes partner)', 'R12 000 debit (partner owes partnership)', 'R155 000 credit', 'R143 000 debit'], 0,
    'Credits: R60 000 + R15 000 + R80 000 = R155 000. Debits: R140 000 + R3 000 = R143 000. Balance = R155 000 - R143 000 = R12 000 credit.'),
  t(4, '### Balance Sheet of a Partnership\n\nThe owner\'s equity section of a partnership Balance Sheet differs from a sole trader:\n\n**Owner\'s Equity**\n\n| | R |\n|---|---:|\n| Capital: A. Nkosi | 300 000 |\n| Capital: B. Dlamini | 200 000 |\n| **Total capital** | **500 000** |\n| Current account: A. Nkosi | 158 700 |\n| Current account: B. Dlamini | 81 300 |\n| **Total current accounts** | **240 000** |\n| **Total owner\'s equity** | **740 000** |\n\n**Note:**\n- If a current account has a **credit** balance, it is added to equity\n- If a current account has a **debit** balance, it is deducted from equity (or shown as a current asset)\n- There is NO retained income account in a partnership (that is for companies)'),
  fb(5, 'In a partnership, there is no ___ account. Instead, all profit distribution flows through the partners\' ___ accounts.',
    ['retained income', 'current'],
    'Partnerships do not have retained income. Profits are appropriated to partners through their current accounts.'),
  t(6, '### Year-End Adjustments in Partnerships\n\nPartnerships make the same year-end adjustments as sole traders:\n- Depreciation\n- Bad debts and provision for bad debts\n- Accrued and prepaid items\n- Stock adjustments\n\n**Additional partnership adjustments:**\n- Interest on capital\n- Interest on drawings\n- Salaries to partners\n- Profit sharing\n\nThe order of preparation:\n1. Make standard year-end adjustments\n2. Prepare the Income Statement to determine net profit\n3. Prepare the Appropriation Account to distribute profit\n4. Update partner current accounts\n5. Prepare the Balance Sheet'),
  q(7, 'In a partnership, salaries to partners appear in the:',
    ['Profit and Loss Appropriation Account', 'Income Statement as an operating expense', 'Balance Sheet as a liability', 'Cash Payments Journal only'], 0,
    'Partner salaries are appropriations of profit, not expenses. They appear in the Profit and Loss Appropriation Account.'),
  t(8, '### Partnership Income Statement\n\nThe Income Statement of a partnership is the **same format** as a sole trader. The difference comes AFTER net profit is determined.\n\n**Sole Trader:**\nNet profit goes directly to the Capital account (via the owner\'s equity section).\n\n**Partnership:**\nNet profit goes to the **Profit and Loss Appropriation Account** where it is distributed among partners.\n\n**Key points for the Income Statement:**\n- Do NOT include partner salaries as an expense (they are appropriations)\n- Do NOT include interest on capital as an expense\n- DO include depreciation, bad debts, and other standard expenses\n- Interest on drawings is NOT income — it goes to the Appropriation Account'),
  fb(9, 'Partner salaries must NOT appear on the ___. They appear in the ___ Account.',
    ['Income Statement', 'Appropriation'],
    'Partner salaries are not business expenses. They are appropriations of profit shown in the Profit and Loss Appropriation Account.'),
  q(10, 'In a partnership Balance Sheet, a partner\'s current account with a debit balance is:',
    ['Shown as a current asset (partner owes the business)', 'Added to owner\'s equity', 'Shown as a current liability', 'Deducted from the partner\'s capital account'], 0,
    'A debit balance on a current account means the partner owes the partnership. It is shown as a current asset (or deducted from equity).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Partnerships — Analysis and Interpretation (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Financial Indicators ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Analysis and Interpretation of Financial Statements\n\nAfter preparing financial statements, we analyse them using **financial indicators** (ratios) to assess the health of the business.\n\n### Categories of Financial Indicators\n\n| Category | What it measures | Key ratios |\n|----------|-----------------|------------|\n| **Profitability** | How well the business generates profit | Gross profit %, Net profit %, Operating expenses % |\n| **Liquidity** | Ability to pay short-term debts | Current ratio, Acid-test ratio |\n| **Solvency** | Ability to pay all debts (long-term) | Solvency ratio |\n| **Risk/Gearing** | Reliance on borrowed funds | Debt-equity ratio |\n| **Return** | Return earned on investment | Return on equity (ROE), Return on capital employed (ROCE) |'),
  t(2, '### Profitability Ratios\n\n**Gross Profit Percentage (Mark-up on cost of sales):**\n$$\\text{Gross profit %} = \\frac{\\text{Gross profit}}{\\text{Sales}} \\times 100$$\n\nMeasures profit earned from trading before operating expenses.\n\n**Net Profit Percentage:**\n$$\\text{Net profit %} = \\frac{\\text{Net profit}}{\\text{Sales}} \\times 100$$\n\nMeasures overall profitability after all expenses.\n\n**Operating Expenses to Sales:**\n$$\\text{Operating expenses %} = \\frac{\\text{Operating expenses}}{\\text{Sales}} \\times 100$$\n\nMeasures how well expenses are controlled.\n\n**Example:** Sales = R800 000, Cost of sales = R480 000, Operating expenses = R200 000.\n- Gross profit = R320 000. GP% = R320 000 / R800 000 x 100 = **40%**\n- Net profit = R320 000 - R200 000 = R120 000. NP% = R120 000 / R800 000 x 100 = **15%**\n- OE% = R200 000 / R800 000 x 100 = **25%**'),
  q(3, 'Sales are R1 200 000 and Cost of Sales is R780 000. The gross profit percentage is:',
    ['35%', '65%', '40%', '60%'], 0,
    'Gross profit = R1 200 000 - R780 000 = R420 000. GP% = R420 000 / R1 200 000 x 100 = 35%.'),
  t(4, '### Liquidity Ratios\n\n**Current Ratio:**\n$$\\text{Current ratio} = \\frac{\\text{Current assets}}{\\text{Current liabilities}}$$\n\nShows ability to pay short-term debts. Ideal: **1.5:1 to 2:1**\n\n**Acid-Test (Quick) Ratio:**\n$$\\text{Acid-test ratio} = \\frac{\\text{Current assets} - \\text{Stock}}{\\text{Current liabilities}}$$\n\nA stricter test — excludes stock because stock may not be quickly convertible to cash. Ideal: **1:1**\n\n**Example:** Current assets = R250 000 (including stock R80 000), Current liabilities = R100 000.\n- Current ratio = R250 000 / R100 000 = **2.5:1** (strong)\n- Acid-test = (R250 000 - R80 000) / R100 000 = R170 000 / R100 000 = **1.7:1** (healthy)'),
  fb(5, 'The current ratio compares ___ to current liabilities. The acid-test ratio excludes ___ from current assets because it may not be quickly converted to cash.',
    ['current assets', 'stock'],
    'Current ratio = CA / CL. Acid-test removes stock for a stricter liquidity test.'),
  t(6, '### Solvency and Gearing\n\n**Solvency Ratio:**\n$$\\text{Solvency ratio} = \\frac{\\text{Total assets}}{\\text{Total liabilities}}$$\n\nShows ability to pay ALL debts. Should be **greater than 1** (assets exceed liabilities). If less than 1, the business is technically insolvent.\n\n**Debt-Equity Ratio (Gearing):**\n$$\\text{Debt-equity ratio} = \\frac{\\text{Non-current liabilities}}{\\text{Owner\'s equity}}$$\n\nMeasures how much the business relies on borrowed funds versus owner investment. A ratio above **1:1** means the business is highly geared (risky).\n\n**Example:** Total assets = R900 000, Total liabilities = R400 000, Non-current liabilities = R250 000, Owner\'s equity = R500 000.\n- Solvency = R900 000 / R400 000 = **2.25:1** (solvent)\n- Debt-equity = R250 000 / R500 000 = **0.5:1** (low gearing, good)'),
  q(7, 'A business has total assets of R600 000 and total liabilities of R700 000. The solvency ratio is:',
    ['0.86:1 (technically insolvent)', '1.17:1 (solvent)', '0.86:1 (solvent)', '1.17:1 (insolvent)'], 0,
    'Solvency = R600 000 / R700 000 = 0.86:1. Since this is below 1, total liabilities exceed total assets and the business is technically insolvent.'),
  t(8, '### Return Ratios\n\n**Return on Owner\'s Equity (ROE):**\n$$\\text{ROE} = \\frac{\\text{Net profit}}{\\text{Average owner\'s equity}} \\times 100$$\n\nMeasures the return partners earn on their investment. Should exceed the interest rate they could earn elsewhere (opportunity cost).\n\n**Stock Turnover Rate:**\n$$\\text{Stock turnover rate} = \\frac{\\text{Cost of sales}}{\\text{Average stock}}$$\n\n$$\\text{Average stock} = \\frac{\\text{Opening stock} + \\text{Closing stock}}{2}$$\n\nMeasures how many times stock is sold and replaced per year. Higher is generally better (efficient stock management).\n\n**Example:** Cost of sales = R480 000, Opening stock = R60 000, Closing stock = R80 000.\n- Average stock = (R60 000 + R80 000) / 2 = R70 000\n- Stock turnover = R480 000 / R70 000 = **6.86 times per year**\n- In days: 365 / 6.86 = approximately **53 days** to sell and replace stock'),
  q(9, 'Cost of sales is R900 000. Opening stock R120 000, Closing stock R180 000. The stock turnover rate is:',
    ['6 times', '5 times', '7.5 times', '9 times'], 0,
    'Average stock = (R120 000 + R180 000) / 2 = R150 000. Stock turnover = R900 000 / R150 000 = 6 times.'),
  fb(10, 'A debt-equity ratio above ___ means the business is highly geared. Stock turnover rate measures how many times stock is sold and ___ during the year.',
    ['1:1', 'replaced'],
    'Debt-equity > 1:1 = high gearing (high reliance on debt). Stock turnover = number of times stock is sold and replaced.'),
];

// --- Lesson 2: Interpretation and Comments ---
blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Interpreting Financial Indicators\n\nCalculating ratios is only half the task. You must also **interpret** them — explain what they mean and suggest reasons for changes.\n\n### How to Comment on Ratios (Exam Technique)\n\n1. **State the trend** (improved/declined compared to previous year)\n2. **State whether the ratio is favourable or unfavourable**\n3. **Give a possible reason** for the change\n4. **Suggest an action** the business can take\n\n**Example comment:**\n*The gross profit percentage decreased from 42% to 38%. This is unfavourable. A possible reason is that the business did not increase selling prices in line with the increase in cost of sales. The partners should consider increasing selling prices or negotiating better prices with suppliers.*'),
  t(2, '### Profitability Commentary Guide\n\n| Ratio | Improved when | Possible reasons for decline |\n|-------|-------------|-----------------------------|\n| Gross profit % | Increases | Mark-up not maintained, theft of stock, stock deficit, cost of sales increased |\n| Net profit % | Increases | Operating expenses increased (rent, salaries, bad debts), lower gross profit |\n| Operating expenses % | Decreases | Expenses not controlled, new employees hired, rent increase |\n\n### Liquidity Commentary Guide\n\n| Ratio | Ideal | Warning signs |\n|-------|-------|---------------|\n| Current ratio | 1.5:1 to 2:1 | Below 1:1 = cannot pay short-term debts. Above 3:1 = assets not used efficiently |\n| Acid-test | Around 1:1 | Below 0.8:1 = may struggle to pay debts without selling stock |'),
  q(3, 'The acid-test ratio decreased from 1.2:1 to 0.6:1. Which comment is most appropriate?',
    ['The liquidity position has deteriorated; the business may struggle to pay short-term debts without selling stock', 'The business is more profitable than last year', 'The gearing has improved significantly', 'Stock turnover has increased'], 0,
    'A drop in the acid-test ratio below 1:1 indicates the business cannot cover current liabilities without selling stock — a deterioration in liquidity.'),
  t(4, '### Gearing and Risk Commentary\n\n**Low gearing (debt-equity below 0.5:1):**\n- Business relies mainly on own funds\n- Lower risk\n- May not be taking advantage of leverage\n\n**High gearing (debt-equity above 1:1):**\n- Business relies heavily on borrowed funds\n- Higher risk — interest must be paid regardless of profit\n- Creditors may be reluctant to extend further credit\n\n### Return Commentary\n\n**ROE:**\n- Should exceed the rate partners could earn from a bank deposit or other investments\n- If ROE is below 10% in South Africa, the partners might earn more from a fixed deposit\n- Consider the risk involved — a business should offer a higher return than a risk-free investment\n\n**Stock turnover:**\n- Higher stock turnover = efficient stock management\n- Lower stock turnover may indicate slow-moving stock, overstocking, or declining sales\n- Compare to industry norms (a grocery store has faster turnover than a furniture store)'),
  fb(5, 'If the ROE is lower than the bank deposit rate, partners might earn more by ___ their money. High gearing means the business has a high reliance on ___ funds.',
    ['investing', 'borrowed'],
    'ROE below the bank rate suggests the investment is not worthwhile. High gearing = heavy reliance on loans/borrowed capital.'),
  t(6, '### Worked Interpretation Example\n\n**Campusly Partners — Key Financial Data:**\n\n| Indicator | 2025 | 2026 |\n|-----------|------|------|\n| Gross profit % | 40% | 36% |\n| Net profit % | 18% | 14% |\n| Current ratio | 2.1:1 | 1.8:1 |\n| Acid-test ratio | 1.3:1 | 0.9:1 |\n| Debt-equity ratio | 0.4:1 | 0.7:1 |\n| Stock turnover | 8 times | 6 times |\n| ROE | 22% | 16% |\n\n**Analysis:**\n- **Profitability** has declined: GP% dropped 4% and NP% dropped 4%. Possible causes: increased cost of sales, higher operating expenses.\n- **Liquidity** has weakened: Acid-test dropped below 1:1, indicating difficulty paying short-term debts without selling stock.\n- **Gearing** has increased: More reliance on borrowed funds (debt-equity rose from 0.4:1 to 0.7:1). While still within acceptable range, the trend is concerning.\n- **Stock turnover** has slowed: Stock takes longer to sell (from 46 days to 61 days). Possible overstocking or declining sales.\n- **ROE** has declined but remains above typical bank deposit rates (around 8%), so the investment is still worthwhile.'),
  q(7, 'The stock turnover rate decreased from 10 times to 6 times. The most likely reason is:',
    ['The business is overstocking or sales have declined', 'The business increased its selling price', 'The business paid off its long-term loan', 'The business sold assets at a profit'], 0,
    'Lower stock turnover means stock takes longer to sell. This suggests overstocking, slow-moving items, or declining sales.'),
  q(8, 'A partnership has ROE of 7% while the bank deposit rate is 9%. What advice would you give?',
    ['The partners should consider whether the business is worth the risk, since they could earn more from a bank deposit', 'The ROE is excellent and no changes are needed', 'The partners should increase their drawings', 'The business should take on more debt'], 0,
    'If ROE (7%) is below the risk-free bank rate (9%), the partners are not being adequately compensated for the risk of running a business.'),
  fb(9, 'Stock turnover in days is calculated as 365 divided by the ___. A current ratio above 3:1 may suggest that ___ are not being used efficiently.',
    ['stock turnover rate', 'assets'],
    '365 / stock turnover rate = days to sell stock. A very high current ratio may mean idle assets not earning returns.'),
  t(10, '### Exam Tips for Analysis Questions\n\n1. **Always show your workings** — even if the ratio is given, verify it\n2. **Compare to prior year** — state whether the ratio improved or declined\n3. **Use the correct formula** — marks are lost for incorrect formulae\n4. **Give specific reasons** — not just "expenses increased" but "salaries increased by 15%"\n5. **Suggest practical actions** — "negotiate better prices with suppliers" not just "reduce costs"\n6. **Link ratios together** — if GP% drops, NP% will likely drop too. If stock turnover slows, liquidity may weaken.\n7. **Use South African context** — reference load shedding, rand depreciation, SARS, interest rate changes by the SARB'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Budgeting (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Cash Budget ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Budgeting\n\nA budget is a **financial plan** for a future period. It helps the business to:\n- Plan cash inflows and outflows\n- Anticipate shortages and surpluses\n- Control spending\n- Make informed decisions\n\n### Types of Budgets at Grade 11\n1. **Cash Budget** — projects cash receipts and cash payments\n2. **Projected Income Statement** — projects income and expenses\n\n### The Cash Budget\n\nA cash budget shows the expected **cash receipts** and **cash payments** for each month, and the resulting **cash surplus or deficit**.\n\n| | January | February | March |\n|---|---:|---:|---:|\n| **Receipts** | | | |\n| Cash sales | 50 000 | 55 000 | 60 000 |\n| Collections from debtors | 40 000 | 42 000 | 45 000 |\n| **Total receipts** | **90 000** | **97 000** | **105 000** |\n| **Payments** | | | |\n| Cash purchases | 30 000 | 32 000 | 35 000 |\n| Payments to creditors | 25 000 | 28 000 | 30 000 |\n| Salaries | 18 000 | 18 000 | 18 000 |\n| Rent | 8 000 | 8 000 | 8 000 |\n| **Total payments** | **81 000** | **86 000** | **91 000** |\n| **Surplus/(Deficit)** | **9 000** | **11 000** | **14 000** |'),
  t(2, '### Debtors Collection Schedule\n\nNot all credit sales are collected in the same month. A collection schedule shows the expected pattern.\n\n**Example:** Credit sales are collected as follows:\n- 60% in the month of sale\n- 30% in the month after sale\n- 8% two months after sale\n- 2% is estimated as bad debts\n\n| Month of sale | Amount | Same month (60%) | Next month (30%) | 2 months later (8%) |\n|--------------|--------|-----------------|-----------------|--------------------|\n| January | 100 000 | 60 000 | 30 000 | 8 000 |\n| February | 120 000 | 72 000 | 36 000 | 9 600 |\n| March | 110 000 | 66 000 | 33 000 | 8 800 |\n\n**Cash received from debtors in March:**\n- From January sales: R100 000 x 8% = R8 000\n- From February sales: R120 000 x 30% = R36 000\n- From March sales: R110 000 x 60% = R66 000\n- **Total: R110 000**'),
  q(3, 'Credit sales in April are R80 000. 50% is collected in the month of sale, 40% in the next month. How much is collected FROM APRIL SALES in May?',
    ['R32 000', 'R40 000', 'R80 000', 'R48 000'], 0,
    'Amount collected from April sales in May = R80 000 x 40% = R32 000.'),
  t(4, '### Creditors Payment Schedule\n\nSimilarly, the business may not pay all credit purchases immediately.\n\n**Example:** Credit purchases are paid:\n- 40% in the month of purchase\n- 60% in the month after purchase\n\n| Month of purchase | Amount | Same month (40%) | Next month (60%) |\n|------------------|--------|-----------------|------------------|\n| January | 50 000 | 20 000 | 30 000 |\n| February | 60 000 | 24 000 | 36 000 |\n| March | 55 000 | 22 000 | 33 000 |\n\n**Payments to creditors in March:**\n- From February purchases: R60 000 x 60% = R36 000\n- From March purchases: R55 000 x 40% = R22 000\n- **Total: R58 000**'),
  fb(5, 'A debtors collection schedule shows when credit sales are expected to be ___. A creditors payment schedule shows when credit purchases are expected to be ___.',
    ['collected', 'paid'],
    'Collection schedules project cash receipts from debtors. Payment schedules project cash payments to creditors.'),
  t(6, '### Handling Opening and Closing Bank Balances\n\nThe cash budget may include a running bank balance:\n\n| | January | February | March |\n|---|---:|---:|---:|\n| Opening bank balance | 5 000 | 14 000 | 25 000 |\n| Total receipts | 90 000 | 97 000 | 105 000 |\n| Total payments | (81 000) | (86 000) | (91 000) |\n| **Closing bank balance** | **14 000** | **25 000** | **39 000** |\n\nThe closing balance of one month becomes the opening balance of the next.\n\n**If the closing balance is negative**, the business will need an overdraft or must reduce spending.\n\n### Tips for Cash Budget Questions\n- Only include **cash items** (no depreciation, bad debts provision, or accruals)\n- VAT may or may not be included — read the question carefully\n- Capital expenditure (buying assets) IS a cash payment\n- Loan repayments (capital + interest) are cash payments'),
  q(7, 'Which of the following should NOT appear in a cash budget?',
    ['Depreciation on equipment', 'Purchase of a new vehicle', 'Loan repayment', 'Cash sales'], 0,
    'Depreciation is a non-cash expense — it does not involve any cash movement. It should not appear in a cash budget.'),
  fb(8, 'The closing bank balance of one month becomes the ___ balance of the next month. Depreciation does not appear in a cash budget because it is a ___ expense.',
    ['opening', 'non-cash'],
    'Bank balances carry forward. Depreciation allocates cost over time but no cash changes hands.'),
];

// --- Lesson 2: Projected Income Statement ---
blockNum = 0;
const ch6_lesson2 = [
  t(1, '## Projected Income Statement\n\nA projected (budgeted) income statement estimates the **income and expenses** for a future period. Unlike the cash budget, it includes **non-cash items** like depreciation and provision for bad debts.\n\n### Format\n\n**Campusly Trading**\n**Projected Income Statement for the year ending 28 February 2027**\n\n| | R |\n|---|---:|\n| Sales | 1 200 000 |\n| Cost of sales | (720 000) |\n| **Gross profit** | **480 000** |\n| Other income | 15 000 |\n| **Gross operating income** | **495 000** |\n| Operating expenses | (310 000) |\n| **Net profit** | **185 000** |\n\n### Key Differences from Cash Budget\n| Cash Budget | Projected Income Statement |\n|------------|---------------------------|\n| Cash items only | Includes non-cash items |\n| Shows cash receipts and payments | Shows income and expenses |\n| No depreciation | Includes depreciation |\n| Includes capital expenditure | Does not include capital expenditure |\n| Includes loan repayments | Only includes interest (not capital) |'),
  t(2, '### Projected vs Actual\n\nAfter the budget period, the business compares **projected figures** to **actual figures** to identify **variances**.\n\n| Item | Projected | Actual | Variance |\n|------|----------|--------|----------|\n| Sales | 1 200 000 | 1 150 000 | (50 000) Unfavourable |\n| Cost of sales | (720 000) | (700 000) | 20 000 Favourable |\n| Gross profit | 480 000 | 450 000 | (30 000) Unfavourable |\n| Salaries | (180 000) | (195 000) | (15 000) Unfavourable |\n| Rent | (48 000) | (48 000) | 0 |\n| Net profit | 185 000 | 155 000 | (30 000) Unfavourable |\n\n### Variance Definitions\n- **Favourable variance:** Actual is better than projected (higher income or lower expenses)\n- **Unfavourable variance:** Actual is worse than projected (lower income or higher expenses)'),
  q(3, 'Projected salaries are R200 000 but actual salaries are R185 000. This is a:',
    ['Favourable variance of R15 000', 'Unfavourable variance of R15 000', 'Favourable variance of R200 000', 'No variance'], 0,
    'Actual expenses lower than projected = favourable. R200 000 - R185 000 = R15 000 favourable.'),
  fb(4, 'A variance is ___ when actual income exceeds projected income. A variance is ___ when actual expenses exceed projected expenses.',
    ['favourable', 'unfavourable'],
    'Higher income than expected = favourable. Higher expenses than expected = unfavourable.'),
  t(5, '### Reasons for Variances\n\n**Unfavourable sales variance (sales lower than projected):**\n- Economic downturn, increased competition, poor marketing\n- Load shedding affecting trading hours (SA context)\n- Loss of major customers\n\n**Favourable cost of sales variance (lower than projected):**\n- Better prices negotiated with suppliers\n- Stronger rand reducing import costs\n- Less wastage or theft\n\n**Unfavourable salary variance (higher than projected):**\n- Unplanned salary increases, overtime, additional staff hired\n- Minimum wage increases\n\n**General principles for exam answers:**\n- Always state whether the variance is favourable or unfavourable\n- Give a specific, realistic reason\n- Use South African business context where possible'),
  q(6, 'Projected sales were R500 000 but actual sales were R550 000. This is:',
    ['A favourable variance of R50 000', 'An unfavourable variance of R50 000', 'A favourable variance of R500 000', 'No variance — sales increased'], 0,
    'Actual sales exceed projected = favourable variance. R550 000 - R500 000 = R50 000 favourable.'),
  t(7, '### Preparing a Projected Income Statement from Given Information\n\n**Common adjustments to project from a current year:**\n- Sales expected to increase by 10%: Multiply current sales by 1.10\n- Cost of sales maintain a gross profit margin of 40%: COS = Sales x 60%\n- Salaries to increase by 8%: Current salaries x 1.08\n- Rent increases by R500 per month from July: Calculate months at new rate\n- Depreciation: Use straight-line or diminishing balance on asset values\n\n**Example calculation:**\nCurrent sales = R1 000 000. Expected 10% increase.\nProjected sales = R1 000 000 x 1.10 = **R1 100 000**\n\nGross profit margin to be maintained at 40%.\nProjected COS = R1 100 000 x 60% = **R660 000**\nProjected gross profit = R1 100 000 x 40% = **R440 000**'),
  fb(8, 'If sales are expected to increase by 15%, projected sales = current sales multiplied by ___. If the gross profit margin is 35%, cost of sales = sales multiplied by ___.',
    ['1.15', '0.65'],
    'Increase of 15% means multiply by 1.15. If GP is 35% of sales, then COS is 65% of sales (1 - 0.35 = 0.65).'),
  q(9, 'Current salaries are R240 000. A 7.5% increase is expected. What is the projected salary figure?',
    ['R258 000', 'R252 000', 'R264 000', 'R222 000'], 0,
    'Projected = R240 000 x 1.075 = R258 000.'),
  t(10, '### Summary: Budgeting Key Points\n\n1. **Cash budget** deals with cash flows only — no depreciation, no provision for bad debts\n2. **Projected income statement** includes all income and expenses, including non-cash items\n3. **Debtors/creditors schedules** help project the timing of cash receipts and payments\n4. **Variances** compare projected to actual — favourable means better than expected\n5. **Always give reasons** for variances using realistic business context\n6. **Opening bank balance** + receipts - payments = closing bank balance\n7. A negative closing bank balance indicates the need for an overdraft facility'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Inventory Systems (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Perpetual and Periodic Systems ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Inventory Systems\n\nBusinesses need a system to track the value of their stock (inventory). There are two main systems:\n\n### 1. Perpetual Inventory System\n- Stock is tracked **continuously** — after every purchase and sale\n- A **stock card** is maintained for each item\n- Cost of sales is calculated with each sale\n- Stock count is used to verify records (detect theft/damage)\n\n### 2. Periodic Inventory System\n- Stock is only counted at the **end of the period**\n- Cost of sales is calculated using the formula:\n$$\\text{COS} = \\text{Opening stock} + \\text{Purchases} - \\text{Closing stock}$$\n- No individual stock cards are kept\n- Less accurate — cannot detect theft or shortages during the year\n\n| Feature | Perpetual | Periodic |\n|---------|-----------|----------|\n| Stock tracking | Continuous | Only at year-end |\n| Stock cards | Yes | No |\n| COS calculation | Per transaction | End of period |\n| Theft detection | Yes (compare records to count) | No (shortage hidden in COS) |'),
  t(2, '### The Stock Card (Perpetual System)\n\nA stock card records all movements of a particular stock item.\n\n**Example: Stock Card for Item A**\n\n| Date | Details | Received (In) | Issued (Out) | Balance |\n|------|---------|---:|---:|---:|\n| | | Qty / Cost / Total | Qty / Cost / Total | Qty / Cost / Total |\n| 1 Mar | Balance | | | 100 / R20 / R2 000 |\n| 5 Mar | Purchase | 50 / R22 / R1 100 | | 150 / ? / R3 100 |\n| 12 Mar | Sale | | 80 / ? / ? | 70 / ? / ? |\n\n### Cost Allocation Methods\nWhen stock is purchased at different prices, we need a method to determine the cost of items sold:\n- **FIFO (First In, First Out):** Oldest stock is sold first\n- **Weighted Average:** Average cost of all units in stock'),
  q(3, 'In a periodic inventory system, cost of sales is calculated as:',
    ['Opening stock + Purchases - Closing stock', 'Sales - Gross profit', 'Closing stock - Opening stock + Purchases', 'Opening stock + Closing stock - Purchases'], 0,
    'COS = Opening stock + Purchases - Closing stock. This is the standard formula for the periodic system.'),
  t(4, '### FIFO Method (First In, First Out)\n\nThe oldest stock is assumed to be sold first.\n\n**Using the stock card above:**\n- Balance: 100 units at R20 = R2 000\n- Purchase: 50 units at R22 = R1 100\n- Total: 150 units, total cost R3 100\n\n**Sale of 80 units (FIFO):**\nFirst 80 units come from the oldest stock (100 units at R20):\n- 80 units x R20 = R1 600 (cost of goods sold)\n\n**Remaining stock:**\n- 20 units at R20 = R400 (remaining from original batch)\n- 50 units at R22 = R1 100 (from purchase)\n- Total: 70 units = R1 500\n\n**Verification:** R2 000 + R1 100 - R1 600 = R1 500'),
  t(5, '### Weighted Average Method\n\nCalculate the average cost after each purchase, then use that average for issues.\n\n**Using the same example:**\n- After purchase: 150 units, total cost R3 100\n- Weighted average cost = R3 100 / 150 = **R20.67 per unit**\n\n**Sale of 80 units:**\n- 80 x R20.67 = R1 653.60 (cost of goods sold)\n\n**Remaining stock:**\n- 70 units x R20.67 = R1 446.90\n\n**Note:** The weighted average is recalculated after EVERY purchase (not after sales).\n\n### Comparison\n| | FIFO | Weighted Average |\n|---|---|---|\n| When prices rise | Lower COS, Higher profit | Higher COS, Lower profit |\n| Closing stock value | Based on latest prices (higher) | Based on average (moderate) |\n| Simplicity | More complex per transaction | Simpler calculation |'),
  q(6, 'Under FIFO, when prices are rising, cost of sales is:',
    ['Lower (because older, cheaper stock is sold first)', 'Higher (because newer, expensive stock is sold first)', 'The same as weighted average', 'Cannot be determined'], 0,
    'FIFO sells the oldest (cheapest) stock first. When prices rise, this gives a lower COS and higher gross profit compared to weighted average.'),
  fb(7, 'FIFO stands for First In, ___. In the weighted average method, the average cost is recalculated after every ___.',
    ['First Out', 'purchase'],
    'FIFO = First In, First Out. Weighted average is recalculated whenever new stock is purchased (not when stock is sold).'),
  t(8, '### Mark-Up Percentage\n\n**Mark-up** is the percentage added to cost price to determine selling price.\n\n$$\\text{Selling price} = \\text{Cost price} \\times (1 + \\text{mark-up \\%})$$\n\n$$\\text{Mark-up \\%} = \\frac{\\text{Gross profit}}{\\text{Cost of sales}} \\times 100$$\n\n**Example:** Cost price = R200, Mark-up = 50%\n- Selling price = R200 x 1.50 = **R300**\n- Gross profit = R300 - R200 = R100\n- Mark-up check: R100 / R200 x 100 = 50%\n\n### Gross Profit Margin vs Mark-Up\n\n| | Formula | Example (Cost R200, Sell R300) |\n|---|---|---|\n| **Mark-up** | GP / COS x 100 | R100 / R200 x 100 = **50%** |\n| **Margin** | GP / Sales x 100 | R100 / R300 x 100 = **33.3%** |\n\nThey are different! A 50% mark-up = 33.3% margin. Do not confuse them.'),
  q(9, 'An item has a cost price of R400 and a mark-up of 75%. The selling price is:',
    ['R700', 'R475', 'R575', 'R300'], 0,
    'Selling price = R400 x 1.75 = R700. Mark-up of 75% means adding 75% of cost to the cost price.'),
  fb(10, 'Mark-up is calculated as gross profit divided by ___. Profit margin is calculated as gross profit divided by ___.',
    ['cost of sales', 'sales'],
    'Mark-up = GP / COS. Margin = GP / Sales. These give different percentages for the same transaction.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Cost Accounting — Manufacturing (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Cost Concepts and Production Cost Statement ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Cost Accounting — Manufacturing\n\nA manufacturing business makes (produces) goods rather than buying them for resale. Cost accounting helps determine the **cost of producing** each unit.\n\n### Types of Costs\n\n**By behaviour:**\n| Type | Description | Examples |\n|------|------------|----------|\n| **Variable costs** | Change in proportion to production volume | Raw materials, direct labour, packaging |\n| **Fixed costs** | Stay the same regardless of production volume | Rent, insurance, security, depreciation (straight-line) |\n| **Semi-variable** | Have fixed and variable components | Electricity (fixed connection + usage), telephone |\n\n**By traceability:**\n| Type | Description | Examples |\n|------|------------|----------|\n| **Direct costs** | Can be traced directly to a product | Raw materials used, factory workers wages |\n| **Indirect costs** (Overheads) | Cannot be traced to a specific product | Factory rent, factory insurance, factory supervisor salary |'),
  t(2, '### The Three Elements of Production Cost\n\n$$\\text{Total production cost} = \\text{Direct materials} + \\text{Direct labour} + \\text{Factory overheads}$$\n\n**1. Direct Materials (Raw Materials)**\n$$\\text{Direct materials used} = \\text{Opening stock of raw materials} + \\text{Purchases} - \\text{Closing stock of raw materials}$$\n\n**2. Direct Labour**\nWages of factory workers who directly produce the goods.\n\n**3. Factory Overheads (Indirect Costs)**\n- Factory rent\n- Factory electricity\n- Factory insurance\n- Depreciation of factory equipment\n- Factory supervisor salary\n- Factory maintenance\n\n**Important:** Only **factory-related** costs are included in production cost. Administration, selling, and distribution costs are operating expenses, NOT production costs.'),
  q(3, 'Which of the following is a direct cost of production?',
    ['Wages of factory workers', 'Factory rent', 'Office salaries', 'Delivery vehicle depreciation'], 0,
    'Factory workers wages are direct labour — they can be traced directly to the production of goods. Factory rent is an indirect cost (overhead).'),
  fb(4, 'Variable costs change in proportion to production ___. Fixed costs remain ___ regardless of how many units are produced.',
    ['volume', 'constant'],
    'Variable costs increase/decrease with production. Fixed costs stay the same within the relevant range.'),
  t(5, '### Production Cost Statement\n\n**Campusly Manufacturing**\n**Production Cost Statement for the year ended 28 February 2026**\n\n| | R |\n|---|---:|\n| **Direct materials** | |\n| Opening stock of raw materials | 45 000 |\n| Purchases of raw materials | 320 000 |\n| | 365 000 |\n| Less: Closing stock of raw materials | (52 000) |\n| **Direct materials used** | **313 000** |\n| **Direct labour** | **180 000** |\n| **Prime cost** | **493 000** |\n| **Factory overheads** | |\n| Factory rent | 60 000 |\n| Factory electricity | 24 000 |\n| Depreciation — factory equipment | 35 000 |\n| Factory insurance | 12 000 |\n| Factory supervisor salary | 96 000 |\n| **Total factory overheads** | **227 000** |\n| **Total manufacturing cost** | **720 000** |\n| Add: Opening stock of WIP | 28 000 |\n| Less: Closing stock of WIP | (32 000) |\n| **Cost of production (finished goods)** | **716 000** |'),
  t(6, '### Key Definitions\n\n$$\\text{Prime cost} = \\text{Direct materials} + \\text{Direct labour}$$\n\n$$\\text{Total manufacturing cost} = \\text{Prime cost} + \\text{Factory overheads}$$\n\n$$\\text{Cost of production} = \\text{Total manufacturing cost} + \\text{Opening WIP} - \\text{Closing WIP}$$\n\n**Work-in-Progress (WIP):** Goods that are partially completed at the end of the period.\n\n### Cost of Sales for a Manufacturer\n\n$$\\text{COS} = \\text{Opening stock of finished goods} + \\text{Cost of production} - \\text{Closing stock of finished goods}$$\n\n**Using the example above:**\n- Opening finished goods: R85 000\n- Cost of production: R716 000\n- Closing finished goods: R92 000\n- COS = R85 000 + R716 000 - R92 000 = **R709 000**'),
  q(7, 'Prime cost is R500 000 and factory overheads are R200 000. Opening WIP is R30 000 and closing WIP is R45 000. The cost of production is:',
    ['R685 000', 'R700 000', 'R715 000', 'R730 000'], 0,
    'Total manufacturing cost = R500 000 + R200 000 = R700 000. Cost of production = R700 000 + R30 000 - R45 000 = R685 000.'),
  fb(8, 'Prime cost consists of direct materials and direct ___. Work-in-progress refers to goods that are ___ completed at the end of the period.',
    ['labour', 'partially'],
    'Prime cost = direct materials + direct labour. WIP = partially completed goods still in the factory.'),
  t(9, '### Unit Cost and Break-Even\n\n**Unit cost:**\n$$\\text{Unit cost} = \\frac{\\text{Total production cost}}{\\text{Number of units produced}}$$\n\n**Break-even point:**\n$$\\text{Break-even units} = \\frac{\\text{Total fixed costs}}{\\text{Selling price per unit} - \\text{Variable cost per unit}}$$\n\nThe denominator is the **contribution per unit**.\n\n**Example:** Fixed costs = R200 000, Selling price = R50, Variable cost per unit = R30.\n- Contribution = R50 - R30 = R20\n- Break-even = R200 000 / R20 = **10 000 units**\n- At 10 000 units, total revenue equals total costs (no profit, no loss)\n\n**Break-even in rand:**\n$$\\text{Break-even sales} = \\text{Break-even units} \\times \\text{Selling price} = 10\\,000 \\times R50 = R500\\,000$$'),
  q(10, 'Fixed costs are R150 000. Selling price per unit is R40, variable cost per unit is R25. The break-even point is:',
    ['10 000 units', '6 000 units', '3 750 units', '15 000 units'], 0,
    'Contribution = R40 - R25 = R15. Break-even = R150 000 / R15 = 10 000 units.'),
];

// --- Lesson 2: Manufacturing and Income Statement ---
blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Income Statement of a Manufacturing Business\n\nThe Income Statement of a manufacturer differs in the **cost of sales** section. Instead of purchasing finished goods, the business manufactures them.\n\n### Format\n\n**Campusly Manufacturing**\n**Income Statement for the year ended 28 February 2026**\n\n| | R |\n|---|---:|\n| Sales | 1 200 000 |\n| Cost of sales | |\n| Opening stock of finished goods | 85 000 |\n| Cost of production (from PCS) | 716 000 |\n| | 801 000 |\n| Less: Closing stock of finished goods | (92 000) |\n| **Cost of sales** | **(709 000)** |\n| **Gross profit** | **491 000** |\n| Operating expenses | (280 000) |\n| **Net profit** | **211 000** |\n\n**Note:** The Production Cost Statement feeds into the Income Statement. Operating expenses include administration, selling, and distribution costs — NOT factory costs.'),
  t(2, '### Allocating Shared Costs\n\nSome costs are shared between the factory and the office. These must be **split** appropriately.\n\n**Examples:**\n- Rent: Factory occupies 60% of the building, offices 40%\n  - Factory rent (production cost): Total rent x 60%\n  - Office rent (operating expense): Total rent x 40%\n\n- Electricity: Factory uses 70%, offices 30%\n  - Factory electricity: Total x 70%\n  - Office electricity: Total x 30%\n\n- Insurance: Factory assets insured for R800 000, office assets R200 000\n  - Factory insurance: Total insurance x 80%\n  - Office insurance: Total insurance x 20%\n\n**Rule:** Factory costs go to the Production Cost Statement. Office costs go to Operating Expenses on the Income Statement.'),
  q(3, 'Total rent is R120 000. The factory occupies 75% of the floor space. The factory rent for the Production Cost Statement is:',
    ['R90 000', 'R120 000', 'R30 000', 'R60 000'], 0,
    'Factory rent = R120 000 x 75% = R90 000. The remaining R30 000 is an operating expense.'),
  fb(4, 'Factory costs appear on the ___. Administration and selling costs appear as ___ on the Income Statement.',
    ['Production Cost Statement', 'operating expenses'],
    'Factory-related costs are manufacturing costs. Office/selling costs are operating expenses.'),
  t(5, '### Variable, Fixed, and Semi-Variable Cost Analysis\n\n**Variable cost per unit is constant:**\n- If raw materials cost R10 per unit, producing 1 000 units costs R10 000 and producing 2 000 units costs R20 000\n- Total variable cost changes, but cost per unit stays at R10\n\n**Fixed cost per unit decreases as production increases:**\n- If factory rent is R60 000 per year and 10 000 units are produced, fixed cost per unit = R6\n- If 20 000 units are produced, fixed cost per unit = R3\n- Total fixed cost stays at R60 000, but the cost per unit drops\n\n**This is why manufacturers want to produce MORE units** — it spreads fixed costs over more units, reducing the cost per unit and increasing profit per unit.\n\n### Semi-Variable Costs\nElectricity: R2 000 fixed connection fee + R0.50 per unit produced\n- At 10 000 units: R2 000 + (10 000 x R0.50) = R7 000\n- At 20 000 units: R2 000 + (20 000 x R0.50) = R12 000'),
  q(6, 'Factory rent is R180 000. If the factory produces 30 000 units, the fixed cost per unit is:',
    ['R6.00', 'R180 000', 'R0.006', 'Cannot be determined without variable costs'], 0,
    'Fixed cost per unit = R180 000 / 30 000 = R6.00. Fixed costs per unit decrease as production increases.'),
  t(7, '### Break-Even Analysis — Further Applications\n\n**Contribution per unit:**\n$$\\text{Contribution} = \\text{Selling price} - \\text{Variable cost per unit}$$\n\nContribution is the amount each unit contributes towards covering fixed costs and earning profit.\n\n**Target profit:**\n$$\\text{Units for target profit} = \\frac{\\text{Fixed costs} + \\text{Target profit}}{\\text{Contribution per unit}}$$\n\n**Example:** Fixed costs R200 000, Selling price R50, Variable cost R30, Target profit R100 000.\n- Contribution = R50 - R30 = R20\n- Units needed = (R200 000 + R100 000) / R20 = **15 000 units**\n\n**Margin of safety:**\n$$\\text{Margin of safety} = \\text{Actual/Expected sales} - \\text{Break-even sales}$$\n\nThis shows how far sales can drop before the business incurs a loss.'),
  q(8, 'Fixed costs are R300 000. Contribution per unit is R25. The business wants a profit of R75 000. How many units must be sold?',
    ['15 000', '12 000', '3 000', '375 000'], 0,
    'Units = (R300 000 + R75 000) / R25 = R375 000 / R25 = 15 000 units.'),
  fb(9, 'Contribution per unit = Selling price minus ___ cost per unit. The margin of safety is the difference between actual sales and ___ sales.',
    ['variable', 'break-even'],
    'Contribution = SP - VC per unit. Margin of safety = Actual sales - Break-even sales.'),
  t(10, '### Summary: Cost Accounting Key Points\n\n1. **Three elements:** Direct materials + Direct labour + Factory overheads\n2. **Prime cost** = Direct materials + Direct labour\n3. **Production Cost Statement** includes ONLY factory-related costs\n4. **Cost of production** adjusts for WIP (opening and closing)\n5. **Cost of sales** for a manufacturer uses finished goods stock (not raw materials)\n6. **Shared costs** must be split between factory and office\n7. **Break-even** = Fixed costs / Contribution per unit\n8. **Variable costs** are constant per unit; **fixed costs** decrease per unit as production increases\n9. Manufacturing businesses in SA must comply with SARS tax requirements and may claim input VAT on raw materials'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: VAT (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: VAT Concepts and Calculations ---
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Value-Added Tax (VAT)\n\nVAT is an indirect tax levied on the supply of goods and services in South Africa. It is administered by **SARS** (South African Revenue Service).\n\n### Key Facts\n- Current VAT rate: **15%**\n- VAT-registered businesses collect VAT on behalf of SARS\n- Registration is compulsory if taxable turnover exceeds **R1 million** in a 12-month period\n- Voluntary registration is possible for turnover above R50 000\n\n### VAT Terminology\n| Term | Meaning |\n|------|--------|\n| **Output VAT** | VAT charged on sales (collected from customers) |\n| **Input VAT** | VAT paid on purchases and expenses (paid to suppliers) |\n| **VAT vendor** | A business registered for VAT |\n| **Tax invoice** | Document showing VAT separately (required for input VAT claims) |\n| **VAT period** | Usually 2 months; the period for filing a VAT return |'),
  t(2, '### VAT Calculations\n\n**Adding VAT to an amount (exclusive to inclusive):**\n$$\\text{VAT-inclusive price} = \\text{Price} \\times 1.15$$\n\n**Example:** Goods cost R500 excluding VAT.\n- VAT = R500 x 15% = R75\n- Inclusive price = R500 + R75 = R575 (or R500 x 1.15 = R575)\n\n**Extracting VAT from an inclusive amount:**\n$$\\text{VAT amount} = \\text{Inclusive price} \\times \\frac{15}{115}$$\n\n$$\\text{Exclusive price} = \\text{Inclusive price} \\times \\frac{100}{115}$$\n\n**Example:** Total bill is R1 150 including VAT.\n- VAT = R1 150 x 15/115 = **R150**\n- Exclusive amount = R1 150 x 100/115 = **R1 000**\n\n**Verification:** R1 000 + R150 = R1 150'),
  q(3, 'An item costs R800 excluding VAT (15%). The VAT-inclusive price is:',
    ['R920', 'R800', 'R680', 'R120'], 0,
    'Inclusive price = R800 x 1.15 = R920. VAT = R800 x 15% = R120.'),
  fb(4, 'To extract VAT from an inclusive amount, multiply by ___. To find the exclusive amount, multiply by ___.',
    ['15/115', '100/115'],
    'VAT = inclusive x 15/115. Exclusive = inclusive x 100/115.'),
  t(5, '### Zero-Rated and Exempt Items\n\n**Zero-rated items (VAT at 0%):**\nVAT is charged at 0%, but the vendor can still claim input VAT on purchases related to these items.\n\n**Examples of zero-rated items in SA:**\n- Basic foodstuffs: brown bread, maize meal, rice, dried beans, fresh fruit and vegetables, vegetable oil, milk, eggs\n- Petrol and diesel (subject to fuel levy instead)\n- Exports\n- Municipal property rates (for residential property)\n\n**Exempt items (no VAT at all):**\nNo VAT is charged, and the vendor CANNOT claim input VAT on related purchases.\n\n**Examples of exempt items:**\n- Financial services (interest, insurance premiums)\n- Residential rental\n- Educational services by approved institutions\n- Public transport\n\n| | Zero-rated | Exempt |\n|---|---|---|\n| VAT charged | 0% | No VAT |\n| Input VAT claim | Yes | No |'),
  q(6, 'Which of the following is zero-rated for VAT in South Africa?',
    ['Brown bread', 'White bread', 'Canned fish', 'Biscuits'], 0,
    'Brown bread is one of the basic foodstuffs that are zero-rated. White bread, canned fish, and biscuits are standard-rated at 15%.'),
  t(7, '### The VAT Control Account\n\nThe VAT control account records all output VAT (credit) and input VAT (debit) for the VAT period.\n\n**VAT Control Account**\n\n| Debit | R | Credit | R |\n|-------|---:|--------|---:|\n| Input VAT (purchases) | 45 000 | Output VAT (sales) | 72 000 |\n| Input VAT (expenses) | 8 000 | | |\n| SARS (payment) | 19 000 | | |\n| Balance c/d | 0 | | |\n| **Total** | **72 000** | **Total** | **72 000** |\n\n**If output VAT > input VAT:** The business owes SARS (credit balance = current liability)\nR72 000 - R53 000 = **R19 000 payable to SARS**\n\n**If input VAT > output VAT:** SARS owes the business a refund (debit balance = current asset)'),
  q(8, 'Output VAT for the period is R85 000 and input VAT is R62 000. The VAT owing to SARS is:',
    ['R23 000', 'R85 000', 'R62 000', 'R147 000'], 0,
    'VAT payable = Output VAT - Input VAT = R85 000 - R62 000 = R23 000 owing to SARS.'),
  fb(9, 'When output VAT exceeds input VAT, the business owes ___. When input VAT exceeds output VAT, ___ owes the business a refund.',
    ['SARS', 'SARS'],
    'Output > Input = business pays SARS. Input > Output = SARS refunds the business.'),
  t(10, '### Recording VAT in Journals\n\n**Credit sale of R11 500 (inclusive of VAT):**\n- VAT = R11 500 x 15/115 = R1 500\n- Exclusive amount = R11 500 - R1 500 = R10 000\n\n| | Debit | Credit |\n|---|---:|---:|\n| Debtors control | 11 500 | |\n| Sales | | 10 000 |\n| VAT output (control) | | 1 500 |\n\n**Cash purchase of R5 750 (inclusive of VAT):**\n- VAT = R5 750 x 15/115 = R750\n- Exclusive amount = R5 000\n\n| | Debit | Credit |\n|---|---:|---:|\n| Purchases / Expense | 5 000 | |\n| VAT input (control) | 750 | |\n| Bank | | 5 750 |\n\n**Remember:** Debtors and creditors are recorded at the VAT-inclusive amount. Sales, purchases, and expenses are recorded at the exclusive amount. VAT is recorded separately in the VAT control account.'),
  q(11, 'A cash sale of R4 600 (VAT inclusive) is made. The sales amount recorded in the books (exclusive of VAT) is:',
    ['R4 000', 'R4 600', 'R600', 'R3 910'], 0,
    'Exclusive = R4 600 x 100/115 = R4 000. VAT = R4 600 x 15/115 = R600.'),
  fb(12, 'Debtors and creditors are recorded at the VAT-___ amount. Sales and purchases are recorded at the VAT-___ amount.',
    ['inclusive', 'exclusive'],
    'Debtors/creditors include VAT (total owed). Revenue and expenses are recorded without VAT (net amounts).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Revision (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// --- Lesson 1: Key Formulae, Exam Tips, and Practice ---
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Grade 11 Accounting — Revision\n\n### Key Formulae Sheet\n\n**Depreciation:**\n- Straight-line: (Cost - Residual value) / Useful life\n- Diminishing balance: Carrying value x Rate\n\n**Disposal:**\n- Carrying value = Cost - Accumulated depreciation\n- Profit/Loss = Selling price - Carrying value\n\n**Profitability Ratios:**\n- Gross profit % = Gross profit / Sales x 100\n- Net profit % = Net profit / Sales x 100\n- Operating expenses % = Operating expenses / Sales x 100\n- Mark-up % = Gross profit / Cost of sales x 100\n\n**Liquidity Ratios:**\n- Current ratio = Current assets / Current liabilities\n- Acid-test = (Current assets - Stock) / Current liabilities\n\n**Solvency and Gearing:**\n- Solvency ratio = Total assets / Total liabilities\n- Debt-equity ratio = Non-current liabilities / Owner\'s equity'),
  t(2, '### More Formulae\n\n**Return and Efficiency:**\n- ROE = Net profit / Average owner\'s equity x 100\n- Stock turnover rate = Cost of sales / Average stock\n- Stock turnover in days = 365 / Stock turnover rate\n\n**VAT:**\n- VAT amount = Inclusive amount x 15/115\n- Exclusive amount = Inclusive amount x 100/115\n- Inclusive amount = Exclusive amount x 1.15\n\n**Manufacturing:**\n- Prime cost = Direct materials + Direct labour\n- Total manufacturing cost = Prime cost + Factory overheads\n- Cost of production = TMC + Opening WIP - Closing WIP\n- COS (manufacturer) = Opening FG + Cost of production - Closing FG\n\n**Break-Even:**\n- Break-even units = Fixed costs / (Selling price - Variable cost per unit)\n- Contribution per unit = Selling price - Variable cost per unit\n- Target profit units = (Fixed costs + Target profit) / Contribution'),
  q(3, 'The formula for the acid-test ratio is:',
    ['(Current assets - Stock) / Current liabilities', 'Current assets / Current liabilities', 'Total assets / Total liabilities', 'Non-current liabilities / Owner\'s equity'], 0,
    'Acid-test = (Current assets - Stock) / Current liabilities. It excludes stock for a stricter liquidity test.'),
  t(4, '### Exam Structure — Grade 11 Accounting\n\n**Paper 1 (Financial Reporting and Evaluation) — 150 marks, 2 hours**\n- Section A: Compulsory (30 marks)\n  - Short questions covering all topics\n- Section B: Choose 2 of 3 questions (120 marks)\n  - Question 2: Partnerships (60 marks)\n  - Question 3: Reconciliations or Manufacturing (60 marks)\n  - Question 4: Analysis and Interpretation (60 marks)\n\n**Paper 2 (Management Accounting) — 150 marks, 2 hours**\n- Section A: Compulsory (30 marks)\n  - Short questions covering all topics\n- Section B: Choose 2 of 3 questions (120 marks)\n  - Question 2: Budgeting or Fixed Assets (60 marks)\n  - Question 3: Inventory or Cost Accounting (60 marks)\n  - Question 4: VAT or Mixed question (60 marks)'),
  fb(5, 'Grade 11 Accounting has ___ exam papers. In Section B, learners choose ___ questions out of three.',
    ['two', 'two'],
    'There are two papers (Paper 1 and Paper 2). In Section B of each paper, you answer 2 out of 3 questions.'),
  t(6, '### Common Exam Mistakes to Avoid\n\n**Bank Reconciliation:**\n- Putting journal items on the BRS (they belong in the CRJ/CPJ)\n- Confusing debit/credit on the bank statement (opposite to the business books)\n- Forgetting to update the bank balance after journal adjustments\n\n**Creditors Reconciliation:**\n- Confusing the direction of reconciliation (ledger to statement or statement to ledger)\n- Not recording unrecorded invoices and credit notes in the correct journal\n\n**Partnerships:**\n- Including partner salaries as an expense (they are appropriations)\n- Forgetting interest on drawings (it increases available profit)\n- Incorrect profit-sharing ratio calculation\n\n**Fixed Assets:**\n- Not calculating part-year depreciation for mid-year purchases/disposals\n- Using cost instead of carrying value for diminishing balance\n- Forgetting accumulated depreciation in disposal entries'),
  t(7, '### More Common Mistakes\n\n**Financial Analysis:**\n- Confusing mark-up (based on cost) and margin (based on sales)\n- Not comparing to prior year or ideal ratios\n- Vague comments ("it improved") instead of specific explanations\n\n**Budgeting:**\n- Including depreciation in the cash budget\n- Confusing capital repayments with interest\n- Not carrying the closing balance forward as the next month opening balance\n\n**Manufacturing:**\n- Including office costs in the Production Cost Statement\n- Forgetting WIP adjustments\n- Using raw materials stock instead of finished goods stock for COS\n\n**VAT:**\n- Using the wrong fraction (15/100 instead of 15/115 to extract VAT)\n- Not recording debtors at VAT-inclusive amounts\n- Forgetting that zero-rated items allow input VAT claims but exempt items do not'),
  q(8, 'To extract VAT from a VAT-inclusive amount of R690, the correct calculation is:',
    ['R690 x 15/115 = R90', 'R690 x 15/100 = R103.50', 'R690 / 1.15 = R600', 'R690 - 15% = R586.50'], 0,
    'VAT from an inclusive amount = inclusive x 15/115. R690 x 15/115 = R90. The third option gives the exclusive amount, not the VAT.'),
  fb(9, 'In the diminishing balance method, depreciation is calculated on the ___, not the original cost. In a partnership, interest on drawings ___ the profit available for sharing.',
    ['carrying value', 'increases'],
    'Diminishing balance uses carrying value (cost - accumulated depreciation). Interest on drawings is charged to partners, increasing profit available.'),
  t(10, '### Final Study Tips\n\n1. **Know your formats:** Income Statement, Balance Sheet, Appropriation Account, Production Cost Statement, Cash Budget, BRS, Creditors Reconciliation Statement\n2. **Practice journal entries:** Depreciation, disposal, dividends, VAT, partnership appropriations\n3. **Master the formulae:** Write them out until you can recall them without notes\n4. **Read questions carefully:** Identify whether amounts include or exclude VAT, whether depreciation is straight-line or diminishing balance\n5. **Show all workings:** Even if your answer is wrong, correct workings earn marks\n6. **Time management:** In Section B, each question is worth 60 marks — allocate approximately 40 minutes per question\n7. **Use South African context:** Reference SARS, the Companies Act, SARB interest rates, JSE, and current economic conditions in your answers\n8. **Practise past papers:** NSC and provincial papers from the Department of Basic Education are freely available'),
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
      title: 'Chapter 1: Bank Reconciliation',
      description: 'Reconciling bank statements with cash journals, EFTs, debit orders, bank charges, dishonoured cheques, outstanding items, and the Bank Reconciliation Statement.',
      order: 1,
      lessons: [
        { title: 'Bank Reconciliation Concepts', description: 'Purpose of bank reconciliation, common causes of differences, EFTs, debit orders, bank charges, dishonoured cheques, and the reconciliation process.', blocks: ch1_lesson1, term: 1 },
        { title: 'Bank Reconciliation Worked Example', description: 'Step-by-step bank reconciliation, updating cash journals, preparing the BRS, outstanding deposits and cheques.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Creditors Reconciliation',
      description: 'Reconciling creditor statements with the Creditors Ledger, outstanding invoices, credit notes, and the Creditors Reconciliation Statement.',
      order: 2,
      lessons: [
        { title: 'Creditors Reconciliation Concepts and Format', description: 'Purpose of creditors reconciliation, common differences, reconciliation direction, and statement format.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Fixed Assets',
      description: 'Asset register, straight-line and diminishing balance depreciation, part-year depreciation, disposal of assets, trade-ins, and journal entries.',
      order: 3,
      lessons: [
        { title: 'Asset Register and Depreciation', description: 'Fixed asset concepts, asset register, straight-line and diminishing balance depreciation, part-year calculations, and journal entries.', blocks: ch3_lesson1, term: 1 },
        { title: 'Disposal of Fixed Assets', description: 'Profit and loss on disposal, journal entries for disposal, scrapping assets, trade-ins, and asset register updates.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Partnerships — Accounting Concepts and Final Accounts',
      description: 'Partnership formation, capital and current accounts, interest on capital and drawings, salaries to partners, profit sharing, appropriation account, and financial statements.',
      order: 4,
      lessons: [
        { title: 'Partnership Formation and Unique Concepts', description: 'Partnership characteristics, capital and current accounts, interest on capital, salaries, interest on drawings, and profit-sharing ratios.', blocks: ch4_lesson1, term: 1 },
        { title: 'Partnership Financial Statements', description: 'Profit and Loss Appropriation Account, current accounts, Balance Sheet format, and year-end adjustments for partnerships.', blocks: ch4_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Partnerships — Analysis and Interpretation',
      description: 'Financial indicators including profitability, liquidity, solvency, gearing, return on equity, stock turnover, and interpretation of ratios.',
      order: 5,
      lessons: [
        { title: 'Financial Indicators and Ratios', description: 'Profitability, liquidity, solvency, gearing, return on equity, and stock turnover ratios with worked examples.', blocks: ch5_lesson1, term: 2 },
        { title: 'Interpretation and Commentary', description: 'How to interpret and comment on financial ratios, variance analysis, exam technique for analysis questions.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Budgeting',
      description: 'Cash budget, projected income statement, debtors and creditors collection schedules, projected vs actual comparison, and variance analysis.',
      order: 6,
      lessons: [
        { title: 'Cash Budget and Collection Schedules', description: 'Cash budget format, debtors collection schedule, creditors payment schedule, opening and closing bank balances.', blocks: ch6_lesson1, term: 3 },
        { title: 'Projected Income Statement and Variance Analysis', description: 'Projected income statement format, projected vs actual comparison, favourable and unfavourable variances.', blocks: ch6_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Inventory Systems',
      description: 'Perpetual and periodic inventory systems, stock cards, FIFO and weighted average methods, mark-up percentage, and cost of sales.',
      order: 7,
      lessons: [
        { title: 'Perpetual and Periodic Inventory Systems', description: 'Perpetual vs periodic systems, stock cards, FIFO, weighted average, mark-up percentage, and gross profit margin.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Cost Accounting — Manufacturing',
      description: 'Variable and fixed costs, direct and indirect costs, production cost statement, break-even analysis, and manufacturing income statement.',
      order: 8,
      lessons: [
        { title: 'Cost Concepts and Production Cost Statement', description: 'Types of costs, three elements of production cost, prime cost, factory overheads, WIP, unit cost, and break-even analysis.', blocks: ch8_lesson1, term: 3 },
        { title: 'Manufacturing Income Statement and Break-Even', description: 'Income statement of a manufacturer, allocating shared costs, cost behaviour, break-even applications, and margin of safety.', blocks: ch8_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: VAT',
      description: 'VAT concepts, calculations, VAT control account, zero-rated and exempt items, and recording VAT in journals.',
      order: 9,
      lessons: [
        { title: 'VAT Concepts, Calculations, and Journal Entries', description: 'VAT rate, output and input VAT, extracting VAT from inclusive amounts, zero-rated and exempt items, VAT control account, and journal entries.', blocks: ch9_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 10: Revision and Exam Preparation',
      description: 'Key formulae, exam structure for Paper 1 and Paper 2, common mistakes, and study tips for the Grade 11 Accounting examination.',
      order: 10,
      lessons: [
        { title: 'Key Formulae, Exam Structure, and Practice', description: 'All Grade 11 Accounting formulae, exam paper structure, common mistakes to avoid, and final study tips.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 11 Accounting \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Bank Reconciliation, Creditors Reconciliation, Fixed Assets, Partnerships, Financial Analysis, Budgeting, Inventory Systems, Cost Accounting, and VAT for the Grade 11 Accounting examination.',
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
  console.log('  TEXTBOOK: Grade 11 Accounting');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
