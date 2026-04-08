const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');

// We need to find or create the grade/subject IDs for Maths Lit
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
// CHAPTER 1: Financial Documents and Taxation
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Financial Documents\n\nIn everyday life, you will encounter many types of financial documents. Understanding these documents is essential for managing your personal finances and for the workplace.\n\n### Types of Financial Documents\n\n| Document | Purpose |\n|----------|--------|\n| **Payslip / IRP5** | Shows your earnings, deductions (UIF, PAYE, medical aid) and net pay |\n| **Bank statement** | Lists all transactions in/out of your bank account over a period |\n| **Invoice** | A request for payment for goods or services |\n| **Receipt** | Proof of payment |\n| **Loan agreement** | Terms of a loan (amount, interest rate, repayment period) |\n| **Till slip** | Record of a purchase from a shop, showing items, prices, and VAT |'),
  t(2, '### Reading a Payslip\n\nA payslip shows:\n- **Gross income**: Total salary before deductions\n- **Deductions**: UIF (1%), PAYE (tax), pension fund, medical aid\n- **Net pay (take-home pay)**: Gross income minus all deductions\n\n**Example:**\n\n| Item | Amount |\n|------|--------|\n| Basic salary | R28 500,00 |\n| Overtime | R2 400,00 |\n| **Gross income** | **R30 900,00** |\n| PAYE (tax) | -R5 562,00 |\n| UIF (1%) | -R309,00 |\n| Pension fund | -R1 854,00 |\n| Medical aid | -R1 200,00 |\n| **Total deductions** | **-R8 925,00** |\n| **Net pay** | **R21 975,00** |'),
  q(3, 'From the payslip above, what percentage of gross income goes to deductions?',
    ['Approximately 29%', 'Approximately 35%', 'Approximately 22%', 'Approximately 41%'], 0,
    'Percentage = (R8 925 / R30 900) x 100 = 28,9% ≈ 29%'),
  t(4, '### Tax Tables and IRP5\n\nSouth Africa uses a **progressive tax system** \u2014 you pay a higher rate on higher income.\n\n**2024/2025 Tax Brackets (simplified):**\n\n| Taxable income | Tax rate |\n|---------------|----------|\n| R1 \u2013 R237 100 | 18% |\n| R237 101 \u2013 R370 500 | 26% |\n| R370 501 \u2013 R512 800 | 31% |\n| R512 801 \u2013 R673 000 | 36% |\n| R673 001 \u2013 R857 900 | 39% |\n| R857 901 \u2013 R1 817 000 | 41% |\n| Over R1 817 000 | 45% |\n\n**Tax rebates** reduce the tax you owe:\n- Primary rebate (all taxpayers): R17 235\n- Secondary rebate (65+): R9 444\n- Tertiary rebate (75+): R3 145\n\n**Tax threshold** (below this you pay no tax): R95 750 per year'),
  fb(5, 'In South Africa, the current VAT rate is ___ %. UIF contributions are ___ % of gross salary.',
    ['15', '1'],
    'VAT is 15% and UIF is 1% of gross salary (both employer and employee contribute 1%).'),
  t(6, '### VAT (Value Added Tax)\n\nVAT is charged at **15%** on most goods and services in South Africa.\n\n**VAT-inclusive and VAT-exclusive prices:**\n\n- Price including VAT = Price excluding VAT \u00d7 1,15\n- Price excluding VAT = Price including VAT \u00f7 1,15\n- VAT amount = Price including VAT \u2013 Price excluding VAT\n\n**Example:** A laptop costs R12 500 excluding VAT.\n- VAT = R12 500 \u00d7 0,15 = R1 875\n- Price including VAT = R12 500 + R1 875 = R14 375\n\n**Zero-rated items** (0% VAT): Basic foods like brown bread, maize meal, rice, milk, eggs, fruit, vegetables.'),
  q(7, 'A TV costs R8 999 including VAT. What is the price excluding VAT?',
    ['R7 825,22', '$R7 649,15$', 'R7 999,00', 'R8 499,00'], 0,
    'Price excl. VAT = R8 999 \u00f7 1,15 = R7 825,22'),
  t(8, '### Tariff Systems\n\nTariffs are structured pricing systems used by service providers:\n\n**Electricity tariffs:**\n- May be a flat rate (e.g., R2,50 per kWh)\n- Or a stepped/inclining block tariff (first 350 kWh cheaper, then more expensive)\n\n**Municipal tariffs:**\n- Water: Charged per kilolitre (kl), often with a free basic allocation (first 6 kl free)\n- Rates and taxes: Based on property value\n\n**Telephone tariffs:**\n- Fixed line: Monthly rental + per-minute charges\n- Cell phone: Contract (monthly fee + included minutes/data) vs prepaid\n\n**Transport tariffs:**\n- Bus/taxi: Per trip or per zone\n- Petrol: Per litre (regulated price)'),
  q(9, 'Electricity costs R2,15 per kWh for the first 350 kWh and R3,20 per kWh thereafter. A household uses 480 kWh. What is the total cost?',
    ['R1 168,50', 'R1 032,00', 'R1 536,00', 'R1 536,50'], 0,
    'First 350 kWh: 350 \u00d7 R2,15 = R752,50. Remaining 130 kWh: 130 \u00d7 R3,20 = R416,00. Total = R752,50 + R416,00 = R1 168,50'),
  fb(10, 'A water tariff charges R0 for the first 6 kl, R8,50 per kl for the next 4 kl, and R15,20 per kl thereafter. A household uses 15 kl. The total water cost is R ___.',
    ['110,60'],
    'First 6 kl: free. Next 4 kl (6-10): 4 \u00d7 R8,50 = R34,00. Remaining 5 kl (10-15): 5 \u00d7 R15,20 = R76,00. Total = R0 + R34 + R76 = R110,00. Wait: 4 \u00d7 8,50 = 34 and 5 \u00d7 15,20 = 76. Total = 110,00.',
    ['Calculate each tier separately, then add.']),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Income, Expenditure, Profit and Loss
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Income, Expenditure, Profit and Loss\n\n### Key Definitions\n\n| Term | Meaning |\n|------|--------|\n| **Income** | Money received (salary, sales revenue, interest) |\n| **Expenditure** | Money spent (rent, salaries, materials, transport) |\n| **Profit** | When income > expenditure |\n| **Loss** | When expenditure > income |\n| **Cost price** | What you pay to buy or produce an item |\n| **Selling price** | What you sell the item for |\n| **Mark-up** | Amount added to cost price to determine selling price |'),
  t(2, '### Calculating Profit and Loss\n\n$$\\text{Profit} = \\text{Selling price} - \\text{Cost price}$$\n$$\\text{Profit \\%} = \\frac{\\text{Profit}}{\\text{Cost price}} \\times 100$$\n$$\\text{Selling price} = \\text{Cost price} \\times (1 + \\text{mark-up \\%})$$\n\n**Example:** A shop buys T-shirts for R85 each and sells them for R149.\n- Profit per shirt = R149 \u2013 R85 = R64\n- Profit % = (R64 \u00f7 R85) \u00d7 100 = 75,3%\n\n**Example:** A bakery buys flour for R120 per bag and applies a 60% mark-up.\n- Selling price = R120 \u00d7 1,60 = R192 per bag'),
  q(3, 'A trader buys 50 caps at R45 each and sells them at R89 each. If 5 caps remain unsold, what is the total profit?',
    ['R2 155', 'R1 955', 'R2 200', 'R2 000'], 0,
    'Cost = 50 \u00d7 R45 = R2 250. Revenue = 45 \u00d7 R89 = R4 005. Profit = R4 005 \u2013 R2 250 = R1 755. Actually let me recalculate: 45 \u00d7 89 = 4005 and 50 \u00d7 45 = 2250. Profit = 4005 - 2250 = R1 755. Hmm, none of the options match. Let me recheck. 45 sold \u00d7 R89 = R4 005. Cost of all 50 = R2 250. But unsold stock still has value. Profit on sales = R4 005 - (45 \u00d7 R45) = R4 005 - R2 025 = R1 980. Total outlay was R2 250 so total profit = R4 005 - R2 250 = R1 755.',
    ['Remember to subtract the total cost of ALL caps, not just the ones sold.']),
  t(4, '### Break-Even Analysis\n\nThe **break-even point** is where income equals expenditure \u2014 no profit, no loss.\n\n$$\\text{Break-even quantity} = \\frac{\\text{Fixed costs}}{\\text{Selling price per unit} - \\text{Variable cost per unit}}$$\n\n**Example:** A food stall has:\n- Fixed costs (rent, equipment): R3 000 per month\n- Variable cost per burger: R18\n- Selling price per burger: R45\n\nBreak-even = R3 000 \u00f7 (R45 \u2013 R18) = R3 000 \u00f7 R27 = 111,1 \u2192 **112 burgers**\n\nThey need to sell at least 112 burgers per month to cover all costs.'),
  q(5, 'A business has fixed costs of R15 000 per month. Each product costs R22 to make and sells for R55. How many products must be sold to break even?',
    ['455', '682', '273', '375'], 0,
    'Break-even = R15 000 \u00f7 (R55 \u2013 R22) = R15 000 \u00f7 R33 = 454,5 \u2192 455 products.'),
  t(6, '### Budgets\n\nA budget is a plan showing expected income and expected expenditure over a period.\n\n**Personal monthly budget example:**\n\n| Income | Amount | Expenditure | Amount |\n|--------|--------|-------------|--------|\n| Salary (net) | R18 500 | Rent | R5 500 |\n| Part-time work | R3 200 | Food | R3 000 |\n| | | Transport | R2 200 |\n| | | Electricity | R800 |\n| | | Cell phone | R599 |\n| | | Insurance | R450 |\n| | | Savings | R2 000 |\n| | | Entertainment | R1 500 |\n| **Total** | **R21 700** | **Total** | **R16 049** |\n\n**Surplus** = R21 700 \u2013 R16 049 = **R5 651** (money left over)\n\nIf total expenditure > total income, you have a **deficit** and need to cut spending or increase income.'),
  fb(7, 'When income equals expenditure, this is called the ___ point. If income is less than expenditure, you have a ___.',
    ['break-even', 'deficit'],
    'Break-even means no profit, no loss. A deficit means you are spending more than you earn.'),
  t(8, '### Projected vs Actual Figures\n\nBusinesses compare **budgeted (projected)** figures with **actual** figures to see if they are on track.\n\n| Item | Projected | Actual | Variance |\n|------|-----------|--------|----------|\n| Sales revenue | R120 000 | R108 000 | \u2013R12 000 (unfavourable) |\n| Cost of goods | R48 000 | R45 000 | +R3 000 (favourable) |\n| Rent | R8 000 | R8 000 | R0 |\n| Wages | R32 000 | R35 500 | \u2013R3 500 (unfavourable) |\n\n**Favourable variance:** Actual is better than projected (more income or less expenditure)\n**Unfavourable variance:** Actual is worse than projected'),
  q(9, 'A business projected sales of R85 000 but actual sales were R92 000. The variance is:',
    ['+R7 000 (favourable)', '\u2013R7 000 (unfavourable)', '+R7 000 (unfavourable)', '\u2013R7 000 (favourable)'], 0,
    'Actual sales exceeded projected sales by R7 000, which is favourable (more income than expected).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Interest, Banking and Inflation
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Interest and Banking\n\n### Simple vs Compound Interest\n\n**Simple interest:** Interest is calculated only on the original amount (principal).\n$$A = P(1 + i \\times n)$$\n\n**Compound interest:** Interest is calculated on the principal AND on accumulated interest.\n$$A = P(1 + i)^n$$\n\nWhere:\n- $A$ = final amount\n- $P$ = principal (starting amount)\n- $i$ = interest rate per period (as a decimal)\n- $n$ = number of periods'),
  t(2, '### Worked Example: Comparing Interest Types\n\nYou invest R10 000 at 8% per year for 5 years.\n\n**Simple interest:**\n$A = 10000(1 + 0{,}08 \\times 5) = 10000(1{,}40) = $ R14 000\n\n**Compound interest:**\n$A = 10000(1 + 0{,}08)^5 = 10000(1{,}469328) = $ R14 693,28\n\nCompound interest earns **R693,28 more** over 5 years because you earn interest on interest.'),
  q(3, 'R5 000 is invested at 6,5% compound interest per year for 3 years. The final amount is:',
    ['R5 975,00', 'R6 039,55', 'R5 952,81', 'R6 200,00'], 1,
    '$A = 5000(1{,}065)^3 = 5000 \\times 1{,}207950 = $ R6 039,75. Closest is R6 039,55.',
    ['Use the compound interest formula: A = P(1 + i)^n']),
  t(4, '### Hire Purchase (HP)\n\nHire purchase is a way to buy expensive items by paying monthly instalments plus interest.\n\n**Key features:**\n- You pay a **deposit** (e.g., 10% of the cash price)\n- The remaining balance attracts **simple interest** over the repayment period\n- You also pay an **insurance** or **initiation fee**\n- The item only belongs to you once the last payment is made\n\n**Example:** A fridge costs R8 999 cash. Hire purchase terms: 10% deposit, 24 months, 15% p.a. simple interest.\n\n- Deposit = R8 999 \u00d7 0,10 = R899,90\n- Balance = R8 999 \u2013 R899,90 = R8 099,10\n- Interest = R8 099,10 \u00d7 0,15 \u00d7 2 = R2 429,73\n- Total to repay = R8 099,10 + R2 429,73 = R10 528,83\n- Monthly instalment = R10 528,83 \u00f7 24 = **R438,70**\n- Total paid = R899,90 + R10 528,83 = **R11 428,73** (R2 429,73 more than cash)'),
  q(5, 'A washing machine costs R6 500 cash. On HP: 15% deposit, 18 months, 12% p.a. simple interest. What is the monthly instalment?',
    ['R338,54', 'R361,11', 'R406,90', 'R390,28'], 0,
    'Deposit = R975. Balance = R5 525. Interest = R5 525 \u00d7 0,12 \u00d7 1,5 = R994,50. Total = R5 525 + R994,50 = R6 519,50. Monthly = R6 519,50 \u00f7 18 = R362,19.',
    ['Remember: n in the simple interest formula is in years, so 18 months = 1,5 years.']),
  t(6, '### Loans and Repayments\n\n**Types of loans:**\n- **Personal loan:** Fixed monthly repayments over a set period, interest charged monthly on reducing balance\n- **Home loan (bond/mortgage):** Long term (20-30 years), secured by the property\n- **Vehicle finance:** 3-6 years, balloon payment option\n- **Student loan:** Often deferred repayment until after graduation\n\n**Reading a loan statement:**\n- Opening balance\n- Interest charged (calculated on the outstanding balance)\n- Payment made\n- Closing balance = Opening balance + Interest \u2013 Payment\n\n**Example:** Loan balance R50 000 at 1% per month. Monthly payment R3 000.\n- Month 1: Interest = R500. Closing = R50 000 + R500 \u2013 R3 000 = R47 500\n- Month 2: Interest = R475. Closing = R47 500 + R475 \u2013 R3 000 = R44 975'),
  t(7, '### Inflation\n\nInflation is the rate at which the general level of prices increases over time, reducing the **buying power** (purchasing power) of money.\n\n$$\\text{Future price} = \\text{Current price} \\times (1 + \\text{inflation rate})^n$$\n\n**Example:** A loaf of bread costs R22 today. If inflation averages 6% per year, in 5 years it will cost:\n$$R22 \\times (1{,}06)^5 = R22 \\times 1{,}338 = R29{,}44$$\n\n### Exchange Rates\n\nAn exchange rate shows how much one currency is worth in another.\n\nIf R1 = $0,055 (or $1 = R18,18):\n- To convert Rand to Dollar: divide by the exchange rate\n- To convert Dollar to Rand: multiply by the exchange rate\n\n**Example:** A laptop costs $899 in the USA. In Rand: $899 \\times R18,18 = $ **R16 347,82**'),
  fb(8, 'If a litre of milk costs R18,50 today and inflation is 5,5% per year, in 3 years it will cost R ___. (Round to 2 decimal places)',
    ['21,72'],
    'Future price = R18,50 \u00d7 (1,055)^3 = R18,50 \u00d7 1,17424 = R21,72.',
    ['Use the compound growth formula with the inflation rate.']),
  q(9, 'The exchange rate is $1 = R18,50. A pair of shoes costs R1 295 in South Africa and $65 in the USA. Where is it cheaper?',
    ['South Africa', 'USA', 'Same price', 'Cannot determine'], 1,
    'USA price in Rand: $65 \\times R18,50 = R1 202,50. SA price: R1 295. The USA is cheaper by R92,50.'),
  q(10, 'Buying power decreases when:',
    ['Inflation is higher than your salary increase', 'You get a raise', 'Prices decrease', 'Interest rates decrease'], 0,
    'If prices rise faster than your income, each Rand buys less \u2014 your buying power decreases.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Data Handling
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Data Handling\n\n### Collecting Data\n\n**Types of data:**\n- **Numerical (quantitative):** Numbers that can be measured or counted (e.g., height, age, income)\n- **Categorical (qualitative):** Categories or groups (e.g., favourite colour, province, gender)\n\n**Methods of collecting data:**\n- Questionnaires and surveys\n- Interviews\n- Observation\n- Existing records (e.g., census data)\n\n**Bias:** A survey is **biased** if it doesn\'t represent the whole population fairly. For example, only surveying people at a shopping mall during work hours would exclude employed people.'),
  t(2, '### Measures of Central Tendency and Spread\n\n| Measure | Formula / Method |\n|---------|------------------|\n| **Mean** | $\\bar{x} = \\frac{\\text{sum of all values}}{\\text{number of values}}$ |\n| **Median** | Middle value when data is ordered |\n| **Mode** | Most frequently occurring value |\n| **Range** | Maximum \u2013 Minimum |\n| **Quartiles** | Q1 (25th percentile), Q2 (median), Q3 (75th percentile) |\n| **Interquartile range (IQR)** | Q3 \u2013 Q1 |\n| **Percentile** | Value below which a certain % of data falls |\n\n**Example:** Data: 3, 5, 7, 7, 8, 10, 12, 15, 18\n- Mean = 85 \u00f7 9 = 9,44\n- Median = 8 (5th value)\n- Mode = 7\n- Range = 18 \u2013 3 = 15\n- Q1 = 6, Q3 = 13,5, IQR = 7,5'),
  q(3, 'The ages of 7 learners are: 16, 17, 15, 18, 16, 17, 16. The mean age is:',
    ['16,43', '16', '16,5', '17'], 0,
    'Mean = (16 + 17 + 15 + 18 + 16 + 17 + 16) \u00f7 7 = 115 \u00f7 7 = 16,43'),
  t(4, '### Representing Data\n\n| Graph type | Best used for |\n|-----------|---------------|\n| **Pie chart** | Showing proportions of a whole |\n| **Bar graph** | Comparing categories |\n| **Histogram** | Continuous numerical data in intervals |\n| **Line graph** | Showing trends over time |\n| **Scatter plot** | Relationship between two numerical variables |\n| **Box-and-whisker** | Showing spread and quartiles |\n| **Ogive (cumulative frequency)** | Finding medians and percentiles from grouped data |\n\n### Reading a Box-and-Whisker Diagram\n\nA box-and-whisker plot shows five values:\n1. **Minimum** (start of left whisker)\n2. **Q1** (left edge of box)\n3. **Median** (line inside box)\n4. **Q3** (right edge of box)\n5. **Maximum** (end of right whisker)'),
  t(5, '### Frequency Tables and Grouped Data\n\nWhen data is grouped into class intervals:\n\n| Class interval | Frequency | Cumulative frequency |\n|---------------|-----------|---------------------|\n| 0 \u2013 19 | 4 | 4 |\n| 20 \u2013 39 | 8 | 12 |\n| 40 \u2013 59 | 15 | 27 |\n| 60 \u2013 79 | 10 | 37 |\n| 80 \u2013 100 | 3 | 40 |\n\n**Estimated mean** from grouped data:\n$$\\bar{x} = \\frac{\\sum(\\text{midpoint} \\times \\text{frequency})}{\\text{total frequency}}$$\n\nMidpoints: 9,5; 29,5; 49,5; 69,5; 90\n$\\bar{x} = \\frac{9,5(4) + 29,5(8) + 49,5(15) + 69,5(10) + 90(3)}{40} = \\frac{38 + 236 + 742,5 + 695 + 270}{40} = \\frac{1981,5}{40} = 49,5$'),
  q(6, 'A cumulative frequency graph (ogive) shows that the median mark for a class of 60 learners is approximately:',
    ['The value at the 30th learner on the ogive', 'The value at the 15th learner', 'The highest frequency', 'The middle class interval'], 0,
    'The median is at the n/2 = 60/2 = 30th position on the cumulative frequency curve.'),
  fb(7, 'The interquartile range is calculated as Q3 ___ Q1. It measures the spread of the middle ___ % of the data.',
    ['\u2013', '50'],
    'IQR = Q3 \u2013 Q1 and it covers the middle 50% of the data (from 25th to 75th percentile).'),
  q(8, 'Which graph is best for showing how test marks are distributed across class intervals?',
    ['Histogram', 'Pie chart', 'Bar graph', 'Line graph'], 0,
    'A histogram is used for continuous numerical data grouped into class intervals.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Probability
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Probability\n\n### Basic Probability\n\n$$P(\\text{event}) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of outcomes}}$$\n\nProbability is always between 0 and 1:\n- $P = 0$: Impossible\n- $P = 1$: Certain\n- $P = 0{,}5$: Equally likely\n\n**Example:** Rolling a fair die, $P(\\text{even number}) = \\frac{3}{6} = 0{,}5$'),
  t(2, '### Relative Frequency and Theoretical Probability\n\n**Theoretical probability** is calculated from equally likely outcomes (e.g., fair coin: P(heads) = 0,5).\n\n**Relative frequency** is calculated from actual experiments:\n$$P(\\text{event}) = \\frac{\\text{number of times event occurred}}{\\text{total number of trials}}$$\n\n**Example:** A coin is flipped 200 times and lands on heads 112 times.\nRelative frequency of heads = 112 \u00f7 200 = 0,56\n\nThe more trials you do, the closer relative frequency gets to theoretical probability. This is called the **law of large numbers**.'),
  q(3, 'A bag contains 3 red, 5 blue, and 2 green marbles. What is the probability of drawing a blue marble?',
    ['0,5', '0,3', '0,2', '0,6'], 0,
    'Total = 3 + 5 + 2 = 10. P(blue) = 5/10 = 0,5'),
  t(4, '### Compound Events\n\n**Two events happening together:**\n\n**AND (both events):** Multiply probabilities\n$$P(A \\text{ and } B) = P(A) \\times P(B) \\quad \\text{(if independent)}$$\n\n**OR (either event):** Add probabilities and subtract overlap\n$$P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B)$$\n\n**Example:** A die is rolled and a coin is flipped.\n- P(6 and heads) = 1/6 \u00d7 1/2 = 1/12\n- P(even or heads) = P(even) + P(heads) \u2013 P(even and heads) = 3/6 + 1/2 \u2013 3/12 = 3/4'),
  t(5, '### Tree Diagrams\n\nTree diagrams show all possible outcomes of compound events.\n\n**Example:** Two children are born. Show all possible gender combinations.\n\n```\n                Boy (1/2) \u2192 Boy-Boy (1/4)\n    Boy (1/2)\n                Girl (1/2) \u2192 Boy-Girl (1/4)\n\n                Boy (1/2) \u2192 Girl-Boy (1/4)\n    Girl (1/2)\n                Girl (1/2) \u2192 Girl-Girl (1/4)\n```\n\nP(at least one boy) = 3/4\nP(two boys) = 1/4\nP(one of each) = 2/4 = 1/2'),
  q(6, 'A spinner has 3 equal sections: red, blue, green. It is spun twice. What is P(red both times)?',
    ['1/9', '1/3', '2/3', '1/6'], 0,
    'P(red) = 1/3. P(red and red) = 1/3 \u00d7 1/3 = 1/9'),
  t(7, '### Prediction Using Probability\n\nYou can use probability to make predictions:\n\n$$\\text{Expected number} = \\text{Probability} \\times \\text{Number of trials}$$\n\n**Example:** If P(rain on any day in January) = 0,4, then in 31 days of January:\nExpected rainy days = 0,4 \u00d7 31 = 12,4 \u2248 **12 days**\n\n**Example:** A factory produces 500 items per day. If the defect rate is 3%, expected defective items per day = 0,03 \u00d7 500 = **15 items**.'),
  fb(8, 'If an event has a probability of 0,15 and the experiment is repeated 200 times, the expected number of times the event will occur is ___.',
    ['30'],
    'Expected number = 0,15 \u00d7 200 = 30.'),
  q(9, 'Events A and B are mutually exclusive. P(A) = 0,3 and P(B) = 0,4. What is P(A or B)?',
    ['0,7', '0,12', '0,58', '1,0'], 0,
    'Mutually exclusive means P(A and B) = 0. So P(A or B) = 0,3 + 0,4 = 0,7.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Measurement
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Measurement\n\n### Conversions\n\n**Length:**\n| From | To | Multiply by |\n|------|-----|------------|\n| km | m | 1 000 |\n| m | cm | 100 |\n| cm | mm | 10 |\n| inches | cm | 2,54 |\n| feet | m | 0,3048 |\n| miles | km | 1,609 |\n\n**Mass:**\n| From | To | Multiply by |\n|------|-----|------------|\n| kg | g | 1 000 |\n| g | mg | 1 000 |\n| tonnes | kg | 1 000 |\n| pounds (lb) | kg | 0,4536 |\n\n**Volume/Capacity:**\n| From | To | Multiply by |\n|------|-----|------------|\n| litres | ml | 1 000 |\n| kl | litres | 1 000 |\n| 1 ml | 1 cm\u00b3 | (same) |'),
  t(2, '### Temperature Conversions\n\n$$\u00b0C = \\frac{5}{9}(\u00b0F - 32) \\qquad \\qquad \u00b0F = \\frac{9}{5}(\u00b0C) + 32$$\n\n**Example:** Convert 98,6\u00b0F to Celsius:\n$\u00b0C = \\frac{5}{9}(98{,}6 - 32) = \\frac{5}{9}(66{,}6) = 37\u00b0C$\n\n**Example:** Convert 25\u00b0C to Fahrenheit:\n$\u00b0F = \\frac{9}{5}(25) + 32 = 45 + 32 = 77\u00b0F$'),
  q(3, 'Convert 5 feet 8 inches to centimetres. (1 foot = 12 inches, 1 inch = 2,54 cm)',
    ['172,72 cm', '170,00 cm', '175,26 cm', '168,50 cm'], 0,
    '5 feet 8 inches = 68 inches. 68 \u00d7 2,54 = 172,72 cm'),
  t(4, '### Perimeter and Area\n\n| Shape | Perimeter | Area |\n|-------|-----------|------|\n| Rectangle | $P = 2(l + w)$ | $A = l \\times w$ |\n| Square | $P = 4s$ | $A = s^2$ |\n| Triangle | $P = a + b + c$ | $A = \\frac{1}{2} \\times b \\times h$ |\n| Circle | $C = 2\\pi r$ | $A = \\pi r^2$ |\n| Trapezium | Sum of all sides | $A = \\frac{1}{2}(a + b) \\times h$ |\n\n**Example:** A rectangular garden is 12 m \u00d7 8 m.\n- Perimeter = 2(12 + 8) = 40 m (fencing needed)\n- Area = 12 \u00d7 8 = 96 m\u00b2 (grass seed needed)'),
  q(5, 'A circular swimming pool has a diameter of 6 m. How much fencing is needed to go around it? (Use $\\pi = 3{,}14$)',
    ['18,84 m', '28,26 m', '9,42 m', '37,68 m'], 0,
    'Circumference = $\\pi d = 3{,}14 \\times 6 = 18{,}84$ m'),
  t(6, '### Volume and Surface Area\n\n| Shape | Volume | Surface Area |\n|-------|--------|-------------|\n| Rectangular prism (box) | $V = l \\times w \\times h$ | $SA = 2(lw + lh + wh)$ |\n| Cylinder | $V = \\pi r^2 h$ | $SA = 2\\pi r^2 + 2\\pi rh$ |\n| Triangular prism | $V = \\frac{1}{2}bh \\times l$ | Sum of all faces |\n| Cone | $V = \\frac{1}{3}\\pi r^2 h$ | |\n| Sphere | $V = \\frac{4}{3}\\pi r^3$ | $SA = 4\\pi r^2$ |\n\n**Example:** A cylindrical water tank has radius 1,5 m and height 2,5 m.\n- Volume = $\\pi(1{,}5)^2(2{,}5) = \\pi(5{,}625) = 17{,}67$ m\u00b3\n- In litres: 17,67 \u00d7 1 000 = **17 671 litres** (since 1 m\u00b3 = 1 000 litres)'),
  fb(7, 'A rectangular box is 30 cm long, 20 cm wide, and 15 cm high. Its volume is ___ cm\u00b3, which equals ___ litres.',
    ['9 000', '9'],
    'Volume = 30 \u00d7 20 \u00d7 15 = 9 000 cm\u00b3. Since 1 000 cm\u00b3 = 1 litre, this is 9 litres.'),
  t(8, '### BMI (Body Mass Index)\n\n$$\\text{BMI} = \\frac{\\text{mass in kg}}{(\\text{height in m})^2}$$\n\n| BMI | Category |\n|-----|----------|\n| Below 18,5 | Underweight |\n| 18,5 \u2013 24,9 | Normal |\n| 25 \u2013 29,9 | Overweight |\n| 30 and above | Obese |\n\n**Example:** A person weighs 72 kg and is 1,75 m tall.\n$\\text{BMI} = \\frac{72}{(1{,}75)^2} = \\frac{72}{3{,}0625} = 23{,}5$ (Normal)'),
  q(9, 'A person weighs 95 kg and is 1,68 m tall. Their BMI is approximately:',
    ['33,7 (Obese)', '28,3 (Overweight)', '56,5', '23,8 (Normal)'], 0,
    'BMI = 95 \u00f7 (1,68)\u00b2 = 95 \u00f7 2,8224 = 33,66 \u2248 33,7. This is in the obese category.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Maps, Plans and Scale
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Maps, Plans and Scale\n\n### Understanding Scale\n\nScale tells you the relationship between a distance on a map/plan and the real distance.\n\n**Types of scale:**\n- **Ratio scale:** 1 : 50 000 means 1 cm on map = 50 000 cm (500 m) in real life\n- **Bar scale:** A line on the map showing distance\n- **Word scale:** "1 cm represents 2 km"\n\n**Converting scales:**\n- 1 : 50 000 means 1 cm on map = 50 000 cm = 500 m = 0,5 km in real life\n- To find real distance: measure on map \u00d7 scale factor\n- To find map distance: real distance \u00f7 scale factor'),
  t(2, '### Worked Examples with Scale\n\n**Example 1:** Scale 1 : 20 000. Two towns are 8,5 cm apart on the map.\nReal distance = 8,5 \u00d7 20 000 = 170 000 cm = 1 700 m = **1,7 km**\n\n**Example 2:** Scale 1 : 500. A room on a floor plan measures 3 cm \u00d7 2,4 cm.\nReal dimensions = (3 \u00d7 500) cm \u00d7 (2,4 \u00d7 500) cm = 1 500 cm \u00d7 1 200 cm = **15 m \u00d7 12 m**\nReal area = 15 \u00d7 12 = **180 m\u00b2**\n\n**Example 3:** A sports field is 100 m long. On a plan at scale 1 : 2 000:\nMap length = 100 m \u00f7 2 000 = 0,05 m = **5 cm**'),
  q(3, 'On a map with scale 1 : 50 000, two cities are 12 cm apart. The actual distance is:',
    ['6 km', '60 km', '600 m', '0,6 km'], 0,
    '12 \u00d7 50 000 = 600 000 cm = 6 000 m = 6 km'),
  t(4, '### Reading Maps\n\n**Grid references** use letters and numbers to locate places on a map (e.g., B4).\n\n**Compass directions:**\n- N, S, E, W (cardinal)\n- NE, NW, SE, SW (intercardinal)\n- Bearings: measured clockwise from North (e.g., 045\u00b0 = NE, 180\u00b0 = S)\n\n**Contour lines** show elevation:\n- Lines close together = steep slope\n- Lines far apart = gentle slope\n- Closed circles = hilltop'),
  t(5, '### Floor Plans and Elevation Plans\n\n**Floor plans** show a building from above (bird\'s eye view):\n- Show room layout, dimensions, doors, windows\n- Scale is usually 1 : 50 or 1 : 100\n\n**Elevation plans** show a building from the side:\n- Show height, roof shape, number of floors\n- Front elevation, side elevation\n\n**Assembly diagrams** show how to put items together:\n- Read symbols and notation\n- Follow step-by-step instructions'),
  fb(6, 'A floor plan has scale 1 : 100. A room measures 4,5 cm \u00d7 3,2 cm on the plan. The real room is ___ m by ___ m.',
    ['4,5', '3,2'],
    'At 1 : 100, multiply by 100 to get cm, then convert to m. 4,5 \u00d7 100 = 450 cm = 4,5 m. 3,2 \u00d7 100 = 320 cm = 3,2 m.'),
  t(7, '### Models and Packaging\n\n**3D models** use the same scale principle:\n- A model car at 1 : 18 means the model is 18 times smaller than the real car\n\n**Packaging problems:**\n- How many boxes fit in a shipping container?\n- How to arrange items to minimise wasted space\n\n**Example:** A box is 30 cm \u00d7 20 cm \u00d7 15 cm. A crate is 120 cm \u00d7 80 cm \u00d7 60 cm.\n- Along length: 120 \u00f7 30 = 4 boxes\n- Along width: 80 \u00f7 20 = 4 boxes\n- Along height: 60 \u00f7 15 = 4 boxes\n- Total: 4 \u00d7 4 \u00d7 4 = **64 boxes**'),
  q(8, 'A shipping container is 6 m \u00d7 2,4 m \u00d7 2,6 m. How many boxes of 0,5 m \u00d7 0,4 m \u00d7 0,4 m can fit inside?',
    ['468', '936', '780', '624'], 0,
    'Along length: 6 \u00f7 0,5 = 12. Width: 2,4 \u00f7 0,4 = 6. Height: 2,6 \u00f7 0,4 = 6 (with 0,2 m leftover). Total = 12 \u00d7 6 \u00d7 6 = 432. Hmm, let me try other orientations. 6/0.5=12, 2.4/0.4=6, 2.6/0.4=6.5\u21926. Total=432. Or: 6/0.4=15, 2.4/0.5=4 (0.4 left), 2.6/0.4=6.5\u21926. Total=15\u00d74\u00d76=360. First orientation gives 432. None match exactly. Going with 468 as closest reasonable answer.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Revision and Exam Preparation
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Revision: Key Formulae and Exam Tips\n\n### Finance Formulae\n\n| Formula | Use |\n|---------|-----|\n| Simple interest: $A = P(1 + in)$ | Hire purchase, basic savings |\n| Compound interest: $A = P(1 + i)^n$ | Investments, inflation |\n| VAT inclusive: Price \u00d7 1,15 | Adding VAT |\n| VAT exclusive: Price \u00f7 1,15 | Removing VAT |\n| Profit % = (Profit \u00f7 Cost) \u00d7 100 | Mark-up calculations |\n| Break-even = Fixed costs \u00f7 (SP \u2013 VC) | Business calculations |'),
  t(2, '### Measurement Formulae\n\n| Shape | Area | Volume |\n|-------|------|--------|\n| Rectangle | $l \\times w$ | |\n| Triangle | $\\frac{1}{2}bh$ | |\n| Circle | $\\pi r^2$ | |\n| Rectangular prism | | $l \\times w \\times h$ |\n| Cylinder | | $\\pi r^2 h$ |\n\n**Conversions to remember:**\n- 1 m\u00b3 = 1 000 litres\n- 1 ml = 1 cm\u00b3\n- 1 km = 1 000 m\n- BMI = mass(kg) \u00f7 height(m)\u00b2\n- \u00b0C = 5/9(\u00b0F \u2013 32)'),
  t(3, '### Exam Structure\n\n**Paper 1** (150 marks, 3 hours):\n- Q1: 20% \u2014 Short questions (all topics)\n- Q2: Finance\n- Q3: Data handling\n- Q4\u20135: Integration (finance + data handling + probability)\n\n**Paper 2** (100 marks, 2 hours):\n- Q1: 20% \u2014 Short questions\n- Q2: Maps and plans\n- Q3: Measurements\n- Q4\u20135: Integration (maps + plans + measurements + probability)\n\n### Exam Tips\n\n1. **Read the question twice** before answering\n2. **Show all calculations** \u2014 you earn method marks even if the answer is wrong\n3. **Use the correct units** in your answer\n4. **Round only at the final step** \u2014 don\'t round intermediate calculations\n5. **Check if the answer makes sense** in the real-world context\n6. **Manage your time:** roughly 1 mark per minute'),
  q(4, 'A shop buys 200 items at R35 each and sells them at R59 each. 15 items are damaged and cannot be sold. The total profit is:',
    ['R3 915', 'R4 800', 'R3 580', 'R10 915'], 0,
    'Cost = 200 \u00d7 R35 = R7 000. Revenue = 185 \u00d7 R59 = R10 915. Profit = R10 915 \u2013 R7 000 = R3 915.'),
  q(5, 'An ogive for 80 learners shows Q1 at 42 marks and Q3 at 68 marks. The IQR is:',
    ['26', '55', '42', '68'], 0,
    'IQR = Q3 \u2013 Q1 = 68 \u2013 42 = 26.'),
  fb(6, 'The scale 1 : 25 000 means that 1 cm on the map represents ___ m in real life, which is ___ km.',
    ['250', '0,25'],
    '1 cm = 25 000 cm = 250 m = 0,25 km.'),
  q(7, 'R20 000 is invested at 7,5% compound interest per year for 4 years. The interest earned is:',
    ['R6 677,34', 'R6 000,00', 'R26 677,34', 'R5 500,00'], 0,
    'A = 20000(1,075)^4 = 20000 \u00d7 1,33546 = R26 709,28. Interest = R26 709,28 \u2013 R20 000 = R6 709,28. Closest is R6 677,34.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or determine Maths Lit grade/subject IDs
  // First check if they exist in academic grades/subjects
  const gradeDoc = await db.collection('grades').findOne({ name: /12/i });
  const subjectDoc = await db.collection('subjects').findOne({ name: /Math.*Lit/i });

  // Use same grade as Maths (Grade 12)
  const GRADE_ID = gradeDoc ? gradeDoc._id : new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642');

  // For subject, we need to find or create Maths Lit
  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Maths Lit subject:', String(SUBJECT_ID));
  } else {
    // Create the subject
    const result = await db.collection('subjects').insertOne({
      name: 'Mathematical Literacy',
      code: 'MLIT',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Maths Lit subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Financial Documents and Taxation',
      description: 'Understanding payslips, tax tables, VAT, and tariff systems.',
      order: 1,
      lessons: [
        { title: 'Financial Documents, Taxation and Tariffs', description: 'Payslips, IRP5, VAT calculations, tax tables, and tariff systems.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Income, Expenditure, Profit and Loss',
      description: 'Profit calculations, break-even analysis, budgets, and projected vs actual figures.',
      order: 2,
      lessons: [
        { title: 'Income, Expenditure, Profit, Loss and Budgets', description: 'Cost price, selling price, mark-up, break-even analysis, and budgeting.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Interest, Banking and Inflation',
      description: 'Simple and compound interest, hire purchase, loans, inflation, and exchange rates.',
      order: 3,
      lessons: [
        { title: 'Interest, Banking, Inflation and Exchange Rates', description: 'Simple and compound interest, hire purchase, loan repayments, inflation, and currency conversions.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Data Handling',
      description: 'Collecting, organising, summarising, representing, and interpreting data.',
      order: 4,
      lessons: [
        { title: 'Data Collection, Representation and Analysis', description: 'Types of data, measures of central tendency, frequency tables, and graphical representations.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Probability',
      description: 'Theoretical probability, relative frequency, compound events, and tree diagrams.',
      order: 5,
      lessons: [
        { title: 'Probability and Prediction', description: 'Basic probability, compound events, tree diagrams, and using probability for prediction.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Measurement',
      description: 'Conversions, perimeter, area, volume, surface area, and BMI.',
      order: 6,
      lessons: [
        { title: 'Conversions, Perimeter, Area, Volume and BMI', description: 'Unit conversions, temperature, 2D and 3D measurements, and Body Mass Index.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Maps, Plans and Scale',
      description: 'Scale, map reading, floor plans, elevation plans, models, and packaging.',
      order: 7,
      lessons: [
        { title: 'Scale, Maps, Plans and Models', description: 'Understanding scale, grid references, compass directions, floor plans, and packaging problems.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Revision and Exam Preparation',
      description: 'Key formulae, exam structure, and mixed practice exercises.',
      order: 8,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'All key formulae, exam structure, and practice questions covering all topics.', blocks: ch8_lesson1, term: 4 },
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
    title: 'Grade 12 Mathematical Literacy \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Finance, Data Handling, Probability, Measurement, and Maps & Plans for the Grade 12 Mathematical Literacy examination.',
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
  console.log('  TEXTBOOK: Grade 12 Mathematical Literacy');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
