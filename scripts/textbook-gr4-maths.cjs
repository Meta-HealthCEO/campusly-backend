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
// CHAPTER 1: Whole Numbers (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Whole Numbers\n\nWhole numbers are $0, 1, 2, 3, 4, 5, \\ldots$ They go on forever!\n\nIn Grade 4 we work with whole numbers up to **4 digits** (thousands).\n\n### Place Value up to 4 Digits\n\nEvery digit in a number has a **place value** depending on where it sits.\n\n| Thousands | Hundreds | Tens | Ones |\n|---|---|---|---|\n| 1 000 | 100 | 10 | 1 |\n\n**Example:** In the number $3\\,472$:\n- The digit $3$ is in the thousands place — its value is $3\\,000$\n- The digit $4$ is in the hundreds place — its value is $400$\n- The digit $7$ is in the tens place — its value is $70$\n- The digit $2$ is in the ones place — its value is $2$\n\nSo $3\\,472 = 3\\,000 + 400 + 70 + 2$. This is called **expanded notation**.'),
  t(2, '### Ordering and Comparing Numbers\n\nWe use the symbols $<$ (less than), $>$ (greater than), and $=$ (equals).\n\nTo compare two numbers, start from the **leftmost digit**.\n\n**Example:** Which is bigger: $2\\,456$ or $2\\,465$?\n- Thousands: both are $2$ — the same.\n- Hundreds: both are $4$ — the same.\n- Tens: $5$ versus $6$ — $6$ is bigger.\n\nSo $2\\,465 > 2\\,456$.\n\n**Example:** Arrange in ascending order (smallest to biggest): $1\\,305$; $1\\,350$; $1\\,053$\n$$1\\,053 < 1\\,305 < 1\\,350$$\n\n### Odd and Even Numbers\n- **Even numbers** end in $0, 2, 4, 6, 8$. You can share them equally into two groups.\n- **Odd numbers** end in $1, 3, 5, 7, 9$. There is always one left over.'),
  q(3, 'What is the value of the digit $5$ in $2\\,538$?',
    ['$500$', '$50$', '$5\\,000$', '$5$'], 0,
    'The $5$ is in the hundreds place, so its value is $500$.'),
  t(4, '### Rounding Off\n\nRounding makes a number simpler. We look at the digit to the **right** of where we are rounding.\n\n**Rules:**\n- If the digit is **5 or more**, round **up**.\n- If the digit is **less than 5**, round **down**.\n\n**Rounding to the nearest 10:**\n- $47$ rounds to $50$ (the $7$ tells us to round up)\n- $83$ rounds to $80$ (the $3$ tells us to round down)\n\n**Rounding to the nearest 100:**\n- $2\\,361$ rounds to $2\\,400$ (the $6$ tells us to round up)\n- $4\\,729$ rounds to $4\\,700$ (the $2$ tells us to round down)\n\n**Example:** Round $3\\,650$ to the nearest hundred.\nThe tens digit is $5$ — round up: $3\\,700$.'),
  q(5, 'Round $2\\,847$ to the nearest $10$.',
    ['$2\\,850$', '$2\\,800$', '$2\\,840$', '$2\\,900$'], 0,
    'Look at the ones digit: $7$. Since $7 \\geq 5$, round up: $2\\,850$.'),
  fb(6, 'The number $6\\,381$ in expanded notation is $6\\,000 + 300 + \\text{___} + 1$. The number $4\\,926$ is an ___ number because it ends in $6$.',
    ['80', 'even'],
    'The tens digit is $8$, so it contributes $80$. Numbers ending in $0, 2, 4, 6, 8$ are even.'),
  t(7, '### Counting in Different Intervals\n\nYou can skip-count forwards or backwards:\n- Count in $2$s: $2, 4, 6, 8, 10, \\ldots$\n- Count in $5$s: $5, 10, 15, 20, 25, \\ldots$\n- Count in $10$s from $1\\,000$: $1\\,000$; $1\\,010$; $1\\,020$; $1\\,030$; $\\ldots$\n- Count in $100$s from $2\\,500$: $2\\,500$; $2\\,600$; $2\\,700$; $2\\,800$; $\\ldots$\n\n**Example:** Count backwards in $25$s from $200$:\n$$200; 175; 150; 125; 100; 75; 50; 25; 0$$'),
  q(8, 'Is the number $3\\,571$ odd or even?',
    ['Odd', 'Even'], 0,
    'The last digit is $1$, which is odd. So $3\\,571$ is an odd number.'),
  t(9, '### Real-Life Problems\n\n**Example 1:** A school in Johannesburg has $1\\,245$ learners. Round this to the nearest hundred.\nThe tens digit is $4$ — round down: $1\\,200$ learners.\n\n**Example 2:** Arrange these heights of South African mountains from tallest to shortest:\n- Mafadi: $3\\,450$ m\n- Champagne Castle: $3\\,377$ m\n- Giant\'s Castle: $3\\,315$ m\n\n$$3\\,450 > 3\\,377 > 3\\,315$$\n\nMafadi is the tallest!'),
  q(10, 'Which number is the biggest: $4\\,099$, $4\\,909$, or $4\\,990$?',
    ['$4\\,990$', '$4\\,909$', '$4\\,099$', 'They are all equal'], 0,
    'Compare the hundreds digit: $0$, $9$, $9$. Then the tens: $9$ vs $9$. Then the ones: $0$ vs $0$. Actually comparing: $4\\,990 > 4\\,909 > 4\\,099$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Addition and Subtraction (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Addition and Subtraction\n\nIn Grade 4 we add and subtract whole numbers up to **4 digits**.\n\n### Addition — Carrying (Regrouping)\n\nWhen we add and a column totals $10$ or more, we **carry** to the next column.\n\n**Example 1:** $2\\,456 + 1\\,327$\n$$2\\,456 + 1\\,327 = 3\\,783$$\n\n**Example 2:** $1\\,875 + 2\\,648$\n- Ones: $5 + 8 = 13$ — write $3$, carry $1$\n- Tens: $7 + 4 + 1 = 12$ — write $2$, carry $1$\n- Hundreds: $8 + 6 + 1 = 15$ — write $5$, carry $1$\n- Thousands: $1 + 2 + 1 = 4$\n$$1\\,875 + 2\\,648 = 4\\,523$$'),
  t(2, '### Subtraction — Borrowing (Regrouping)\n\nWhen the top digit is smaller than the bottom digit, we **borrow** from the next column.\n\n**Example:** $4\\,302 - 1\\,567$\n- We cannot take $7$ from $2$, so borrow from tens.\n- We cannot take $6$ from $0$, so borrow from hundreds.\n$$4\\,302 - 1\\,567 = 2\\,735$$\n\n### Checking Your Answer\n\nAddition and subtraction are **inverse operations** — they undo each other.\n\n**Check:** If $4\\,302 - 1\\,567 = 2\\,735$, then $2\\,735 + 1\\,567 = 4\\,302$ ✓\n\n### Estimation\n\nRound each number first, then add or subtract.\n\n**Example:** Estimate $3\\,478 + 1\\,215$.\n- Round: $3\\,500 + 1\\,200 = 4\\,700$\n- Exact: $3\\,478 + 1\\,215 = 4\\,693$\n- The estimate is close, so the answer is reasonable.'),
  q(3, 'Calculate: $2\\,345 + 1\\,678$.',
    ['$4\\,023$', '$4\\,123$', '$3\\,923$', '$4\\,013$'], 0,
    'Add column by column with carrying: $2\\,345 + 1\\,678 = 4\\,023$.'),
  t(4, '### Word Problems\n\n**Key words for addition:** total, sum, altogether, combined, how many in all\n**Key words for subtraction:** difference, how many more, how many left, remain, take away\n\n**Example 1:** A baker in Cape Town bakes $1\\,350$ loaves on Monday and $1\\,275$ loaves on Tuesday. How many loaves altogether?\n$$1\\,350 + 1\\,275 = 2\\,625 \\text{ loaves}$$\n\n**Example 2:** A farm has $3\\,500$ sheep. The farmer sells $1\\,245$ sheep. How many remain?\n$$3\\,500 - 1\\,245 = 2\\,255 \\text{ sheep}$$\n\n**Example 3:** Sipho has R$2\\,000$. He buys a school bag for R$485$ and shoes for R$599$. How much money is left?\n$$2\\,000 - 485 - 599 = 2\\,000 - 1\\,084 = R916$$'),
  q(5, 'A school library has $3\\,250$ books. It receives $875$ new books. How many books are there now?',
    ['$4\\,125$', '$4\\,025$', '$4\\,225$', '$2\\,375$'], 0,
    '$3\\,250 + 875 = 4\\,125$ books.'),
  fb(6, 'Calculate: $5\\,000 - 2\\,367 = $ ___. Addition and subtraction are ___ operations.',
    ['2 633', 'inverse'],
    '$5\\,000 - 2\\,367 = 2\\,633$. They undo each other, so they are inverse operations.'),
  t(7, '### Strategies for Mental Maths\n\n**Strategy 1: Break apart**\n$$245 + 138 = 200 + 100 + 40 + 30 + 5 + 8 = 300 + 70 + 13 = 383$$\n\n**Strategy 2: Add to a round number, then adjust**\n$$398 + 256 = 400 + 256 - 2 = 656 - 2 = 654$$\n\n**Strategy 3: Compensation for subtraction**\n$$503 - 198 = 503 - 200 + 2 = 303 + 2 = 305$$\n\nPick the strategy that feels easiest for you!'),
  q(8, 'Estimate $2\\,789 + 1\\,345$ by rounding to the nearest hundred.',
    ['$4\\,100$', '$4\\,200$', '$4\\,000$', '$4\\,134$'], 0,
    'Round: $2\\,800 + 1\\,300 = 4\\,100$. Exact: $2\\,789 + 1\\,345 = 4\\,134$.'),
  t(9, '### More Practice\n\n**Example:** A shop in Pretoria sells $2\\,145$ cold drinks in March and $1\\,890$ in April. How many more cold drinks were sold in March?\n$$2\\,145 - 1\\,890 = 255 \\text{ more cold drinks}$$\n\n**Example:** Thandi collects $1\\,250$ stamps. Her friend gives her $380$ more. She then gives $175$ stamps to her cousin. How many stamps does Thandi have now?\n$$1\\,250 + 380 - 175 = 1\\,630 - 175 = 1\\,455 \\text{ stamps}$$'),
  q(10, 'Calculate: $4\\,006 - 2\\,738$.',
    ['$1\\,268$', '$1\\,368$', '$1\\,278$', '$1\\,168$'], 0,
    'Borrow where needed: $4\\,006 - 2\\,738 = 1\\,268$. Check: $1\\,268 + 2\\,738 = 4\\,006$ ✓'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Multiplication (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Multiplication\n\nMultiplication is a quick way to add the same number many times.\n\n### Times Tables (2 to 10)\n\nYou **must** know your times tables! Here are some important ones:\n\n| $\\times$ | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |\n|---|---|---|---|---|---|---|---|---|---|\n| **3** | 6 | 9 | 12 | 15 | 18 | 21 | 24 | 27 | 30 |\n| **4** | 8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 |\n| **5** | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 |\n| **6** | 12 | 18 | 24 | 30 | 36 | 42 | 48 | 54 | 60 |\n| **7** | 14 | 21 | 28 | 35 | 42 | 49 | 56 | 63 | 70 |\n| **8** | 16 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 80 |\n| **9** | 18 | 27 | 36 | 45 | 54 | 63 | 72 | 81 | 90 |\n\n**Tip:** $a \\times b = b \\times a$. So if you know $7 \\times 8 = 56$, you also know $8 \\times 7 = 56$!'),
  t(2, '### Multiplying a 2-Digit Number by a 1-Digit Number\n\nBreak the bigger number into tens and ones.\n\n**Example 1:** $34 \\times 6$\n$$34 \\times 6 = (30 \\times 6) + (4 \\times 6) = 180 + 24 = 204$$\n\n**Example 2:** $57 \\times 8$\n$$57 \\times 8 = (50 \\times 8) + (7 \\times 8) = 400 + 56 = 456$$\n\n**Example 3:** $93 \\times 4$\n$$93 \\times 4 = (90 \\times 4) + (3 \\times 4) = 360 + 12 = 372$$\n\n### Doubling\n\nDoubling means multiplying by $2$.\n- Double $35$: $35 \\times 2 = 70$\n- Double $128$: $128 \\times 2 = 256$\n- Double $450$: $450 \\times 2 = 900$\n\nDoubling is very useful! To multiply by $4$, double twice. To multiply by $8$, double three times.'),
  q(3, 'Calculate: $46 \\times 7$.',
    ['$322$', '$312$', '$332$', '$342$'], 0,
    '$46 \\times 7 = (40 \\times 7) + (6 \\times 7) = 280 + 42 = 322$.'),
  t(4, '### Word Problems — Multiplication\n\n**Example 1:** A packet of biscuits costs R$8$. Mrs Nkosi buys $24$ packets for a school party. How much does she pay?\n$$24 \\times 8 = (20 \\times 8) + (4 \\times 8) = 160 + 32 = R192$$\n\n**Example 2:** There are $36$ learners in a class. Each learner needs $5$ exercise books. How many exercise books are needed?\n$$36 \\times 5 = (30 \\times 5) + (6 \\times 5) = 150 + 30 = 180 \\text{ exercise books}$$\n\n**Example 3:** A minibus taxi carries $15$ passengers. If $9$ taxis travel from Soweto to town, how many passengers can travel altogether?\n$$15 \\times 9 = (10 \\times 9) + (5 \\times 9) = 90 + 45 = 135 \\text{ passengers}$$'),
  q(5, 'A farmer plants $8$ rows of mielies with $65$ plants in each row. How many plants altogether?',
    ['$520$', '$530$', '$510$', '$540$'], 0,
    '$65 \\times 8 = (60 \\times 8) + (5 \\times 8) = 480 + 40 = 520$ plants.'),
  fb(6, '$7 \\times 9 = $ ___. Double $75$ is ___.',
    ['63', '150'],
    '$7 \\times 9 = 63$. Doubling $75$: $75 \\times 2 = 150$.'),
  t(7, '### Multiplying by 10 and 100\n\n- Multiply by $10$: write one zero at the end.\n- Multiply by $100$: write two zeros at the end.\n\n**Examples:**\n$$23 \\times 10 = 230$$\n$$45 \\times 10 = 450$$\n$$7 \\times 100 = 700$$\n$$32 \\times 100 = 3\\,200$$\n\n### The Zero and Identity Properties\n\n- **Any number $\\times$ 0 = 0** (the zero property)\n- **Any number $\\times$ 1 = the number itself** (the identity property)\n\n**Examples:** $456 \\times 0 = 0$ and $456 \\times 1 = 456$.'),
  q(8, 'Calculate: $58 \\times 10$.',
    ['$580$', '$5\\,800$', '$508$', '$58$'], 0,
    'When you multiply by $10$, write a zero at the end: $58 \\times 10 = 580$.'),
  t(9, '### More Practice\n\n**Example 1:** There are $7$ days in a week. How many days are there in $52$ weeks?\n$$52 \\times 7 = (50 \\times 7) + (2 \\times 7) = 350 + 14 = 364 \\text{ days}$$\n\n**Example 2:** A school tuck shop sells juice boxes for R$6$ each. On Sports Day they sell $78$ juice boxes. How much money do they make?\n$$78 \\times 6 = (70 \\times 6) + (8 \\times 6) = 420 + 48 = R468$$'),
  q(10, 'What is $85 \\times 4$?',
    ['$340$', '$320$', '$350$', '$360$'], 0,
    '$85 \\times 4 = (80 \\times 4) + (5 \\times 4) = 320 + 20 = 340$. Or double twice: $85 \\times 2 = 170$, then $170 \\times 2 = 340$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Division (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Division\n\nDivision means sharing equally or grouping into equal parts.\n\n### Sharing and Grouping\n\n**Sharing:** $12$ sweets shared among $3$ children — each child gets $12 \\div 3 = 4$ sweets.\n\n**Grouping:** $12$ sweets put into bags of $4$ — you get $12 \\div 4 = 3$ bags.\n\n### Division with a 1-Digit Divisor\n\n**Example 1:** $84 \\div 4$\nThink: $4 \\times ? = 84$.\n$4 \\times 20 = 80$ and $4 \\times 1 = 4$, so $4 \\times 21 = 84$.\n$$84 \\div 4 = 21$$\n\n**Example 2:** $96 \\div 8$\nThink: $8 \\times 12 = 96$.\n$$96 \\div 8 = 12$$'),
  t(2, '### Division with Remainders\n\nSometimes a number does not divide exactly. The amount left over is the **remainder**.\n\n**Example 1:** $47 \\div 5$\n$5 \\times 9 = 45$, and $47 - 45 = 2$.\n$$47 \\div 5 = 9 \\text{ remainder } 2$$\n\n**Example 2:** $67 \\div 8$\n$8 \\times 8 = 64$, and $67 - 64 = 3$.\n$$67 \\div 8 = 8 \\text{ remainder } 3$$\n\n**In real life, the remainder matters!**\n- $25$ children need to cross a river. A boat holds $6$ children. How many trips? $25 \\div 6 = 4$ remainder $1$. You need **$5$ trips** (to carry the last child).\n\n### Halving\n\nHalving means dividing by $2$.\n- Half of $86$: $86 \\div 2 = 43$\n- Half of $150$: $150 \\div 2 = 75$\n- Half of $1\\,200$: $1\\,200 \\div 2 = 600$'),
  q(3, 'Calculate: $72 \\div 6$.',
    ['$12$', '$11$', '$13$', '$14$'], 0,
    'Think: $6 \\times 12 = 72$. So $72 \\div 6 = 12$.'),
  t(4, '### Relationship Between Multiplication and Division\n\nMultiplication and division are **inverse operations** — they undo each other.\n\nIf $7 \\times 8 = 56$, then:\n$$56 \\div 7 = 8 \\quad \\text{and} \\quad 56 \\div 8 = 7$$\n\nThis is called a **fact family**:\n$$5 \\times 9 = 45 \\quad 9 \\times 5 = 45 \\quad 45 \\div 5 = 9 \\quad 45 \\div 9 = 5$$\n\n### Word Problems — Division\n\n**Example 1:** A farmer has $96$ eggs. He puts them into boxes of $6$. How many boxes does he fill?\n$$96 \\div 6 = 16 \\text{ boxes}$$\n\n**Example 2:** R$84$ is shared equally among $7$ friends. How much does each friend get?\n$$84 \\div 7 = R12$$'),
  q(5, '$53$ sweets are shared equally among $8$ children. How many does each child get, and how many are left over?',
    ['$6$ each, remainder $5$', '$7$ each, remainder $3$', '$6$ each, remainder $3$', '$7$ each, remainder $5$'], 0,
    '$8 \\times 6 = 48$. $53 - 48 = 5$. So each child gets $6$ sweets with $5$ left over.'),
  fb(6, '$63 \\div 9 = $ ___. Half of $94$ is ___.',
    ['7', '47'],
    '$9 \\times 7 = 63$, so $63 \\div 9 = 7$. Half of $94$: $94 \\div 2 = 47$.'),
  t(7, '### Division Rules\n\n- **You can never divide by $0$.** It is impossible!\n- **Any number divided by $1$ equals itself:** $45 \\div 1 = 45$\n- **Any number divided by itself equals $1$:** $45 \\div 45 = 1$ (as long as the number is not $0$)\n- **$0$ divided by any number is $0$:** $0 \\div 7 = 0$\n\n### Dividing Larger Numbers\n\n**Example:** $135 \\div 5$\nBreak it up: $100 \\div 5 = 20$ and $35 \\div 5 = 7$.\n$$135 \\div 5 = 20 + 7 = 27$$\n\n**Example:** $256 \\div 4$\n$200 \\div 4 = 50$ and $56 \\div 4 = 14$.\n$$256 \\div 4 = 50 + 14 = 64$$'),
  q(8, 'A school orders $168$ pencils. They are shared equally among $8$ classes. How many pencils does each class get?',
    ['$21$', '$20$', '$22$', '$18$'], 0,
    '$168 \\div 8 = 21$. Check: $21 \\times 8 = 168$ ✓'),
  t(9, '### More Practice\n\n**Example 1:** Granny bakes $75$ koeksisters. She puts $6$ on each plate. How many full plates can she make? How many koeksisters are left?\n$$75 \\div 6 = 12 \\text{ remainder } 3$$\nShe makes $12$ full plates with $3$ koeksisters left over.\n\n**Example 2:** A bus from Durban to Pietermaritzburg covers $90$ km. If the bus travels $9$ km every $10$ minutes, how many $10$-minute intervals does the trip take?\n$$90 \\div 9 = 10 \\text{ intervals}$$\nThe trip takes $10 \\times 10 = 100$ minutes.'),
  q(10, 'What is $95 \\div 4$?',
    ['$23$ remainder $3$', '$24$ remainder $1$', '$23$ remainder $2$', '$22$ remainder $3$'], 0,
    '$4 \\times 23 = 92$ and $95 - 92 = 3$. So $95 \\div 4 = 23$ remainder $3$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Common Fractions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Common Fractions\n\nA **fraction** shows a part of a whole. It is written as $\\frac{\\text{numerator}}{\\text{denominator}}$.\n\n- The **numerator** (top number) tells how many parts we have.\n- The **denominator** (bottom number) tells how many equal parts in total.\n\n### Types of Fractions We Know\n\n| Name | Fraction | Meaning |\n|---|---|---|\n| Halves | $\\frac{1}{2}$ | 1 out of 2 equal parts |\n| Thirds | $\\frac{1}{3}$ | 1 out of 3 equal parts |\n| Quarters | $\\frac{1}{4}$ | 1 out of 4 equal parts |\n| Fifths | $\\frac{1}{5}$ | 1 out of 5 equal parts |\n| Sixths | $\\frac{1}{6}$ | 1 out of 6 equal parts |\n| Eighths | $\\frac{1}{8}$ | 1 out of 8 equal parts |\n\n**Example:** If a pizza is cut into $8$ equal slices and you eat $3$ slices, you have eaten $\\frac{3}{8}$ of the pizza.'),
  t(2, '### Fractions of Shapes\n\nWhen we colour a fraction of a shape, we must divide the shape into **equal parts**.\n\n**Example:** A rectangle is divided into $6$ equal parts. If $4$ parts are shaded, the shaded fraction is $\\frac{4}{6}$.\n\n### Fractions of Groups (Collections)\n\n**Example 1:** There are $12$ apples. $\\frac{1}{4}$ of them are green. How many green apples?\n$$\\frac{1}{4} \\text{ of } 12 = 12 \\div 4 = 3 \\text{ green apples}$$\n\n**Example 2:** A class has $30$ learners. $\\frac{2}{5}$ of them walk to school. How many walk?\n$$\\frac{2}{5} \\text{ of } 30 = (30 \\div 5) \\times 2 = 6 \\times 2 = 12 \\text{ learners}$$\n\n### Comparing Fractions\n\nWhen fractions have the **same denominator**, the one with the bigger numerator is bigger:\n$$\\frac{5}{8} > \\frac{3}{8}$$\n\nWhen fractions have the **same numerator**, the one with the smaller denominator is bigger:\n$$\\frac{1}{3} > \\frac{1}{5}$$\n(A third of a cake is bigger than a fifth!)'),
  q(3, 'What is $\\frac{1}{3}$ of $24$?',
    ['$8$', '$6$', '$12$', '$3$'], 0,
    '$\\frac{1}{3}$ of $24 = 24 \\div 3 = 8$.'),
  t(4, '### Equivalent Fractions\n\nEquivalent fractions look different but are **worth the same**.\n\n$$\\frac{1}{2} = \\frac{2}{4} = \\frac{3}{6} = \\frac{4}{8}$$\n\nTo find an equivalent fraction, multiply (or divide) the top and bottom by the **same number**.\n\n**Example:** Write two fractions equivalent to $\\frac{2}{3}$.\n$$\\frac{2 \\times 2}{3 \\times 2} = \\frac{4}{6} \\quad \\text{and} \\quad \\frac{2 \\times 3}{3 \\times 3} = \\frac{6}{9}$$\n\n### Ordering Fractions\n\n**Example:** Put these fractions in order from smallest to biggest: $\\frac{1}{2}$, $\\frac{1}{4}$, $\\frac{3}{4}$\n\nThink of a chocolate bar:\n- $\\frac{1}{4}$ is one quarter — the smallest piece.\n- $\\frac{1}{2}$ is a half — bigger.\n- $\\frac{3}{4}$ is three quarters — the biggest.\n\n$$\\frac{1}{4} < \\frac{1}{2} < \\frac{3}{4}$$'),
  q(5, 'Which fraction is the biggest: $\\frac{3}{8}$, $\\frac{5}{8}$, or $\\frac{1}{8}$?',
    ['$\\frac{5}{8}$', '$\\frac{3}{8}$', '$\\frac{1}{8}$', 'They are all equal'], 0,
    'They all have denominator $8$. The biggest numerator is $5$, so $\\frac{5}{8}$ is the biggest.'),
  fb(6, 'A fraction equivalent to $\\frac{1}{2}$ with denominator $6$ is $\\frac{\\text{___}}{6}$. The fraction $\\frac{3}{4}$ of $20$ is ___.',
    ['3', '15'],
    '$\\frac{1}{2} = \\frac{3}{6}$ (multiply top and bottom by $3$). $\\frac{3}{4}$ of $20 = (20 \\div 4) \\times 3 = 5 \\times 3 = 15$.'),
  t(7, '### Adding and Subtracting Fractions (Same Denominator)\n\nWhen fractions have the same denominator, just add or subtract the **numerators**.\n\n**Example 1:** $\\frac{2}{5} + \\frac{1}{5} = \\frac{3}{5}$\n\n**Example 2:** $\\frac{7}{8} - \\frac{3}{8} = \\frac{4}{8} = \\frac{1}{2}$\n\n### Fractions in Real Life\n\n**Example:** Mama buys a $1$ kg bag of sugar. She uses $\\frac{1}{4}$ kg for a cake. How much sugar is left?\n$$1 - \\frac{1}{4} = \\frac{4}{4} - \\frac{1}{4} = \\frac{3}{4} \\text{ kg}$$'),
  q(8, 'Calculate: $\\frac{3}{6} + \\frac{2}{6}$.',
    ['$\\frac{5}{6}$', '$\\frac{5}{12}$', '$\\frac{6}{6}$', '$\\frac{1}{6}$'], 0,
    'Same denominator, so add the numerators: $\\frac{3 + 2}{6} = \\frac{5}{6}$.'),
  t(9, '### More Practice with Fractions\n\n**Example 1:** At a braai, $\\frac{3}{8}$ of the boerewors rolls have been eaten. What fraction is left?\n$$\\frac{8}{8} - \\frac{3}{8} = \\frac{5}{8}$$\n\n**Example 2:** There are $40$ learners in a class. $\\frac{3}{8}$ of them play netball. How many play netball?\n$$\\frac{3}{8} \\text{ of } 40 = (40 \\div 8) \\times 3 = 5 \\times 3 = 15 \\text{ learners}$$\n\n**Example 3:** Is $\\frac{2}{3}$ or $\\frac{3}{4}$ bigger? Think of equivalent fractions with the same denominator:\n$$\\frac{2}{3} = \\frac{8}{12} \\quad \\text{and} \\quad \\frac{3}{4} = \\frac{9}{12}$$\nSo $\\frac{3}{4} > \\frac{2}{3}$.'),
  q(10, 'What is $\\frac{2}{5}$ of $35$?',
    ['$14$', '$7$', '$10$', '$17$'], 0,
    '$\\frac{2}{5}$ of $35 = (35 \\div 5) \\times 2 = 7 \\times 2 = 14$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Number Patterns (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Number Patterns\n\nA **pattern** is a list of numbers that follows a rule.\n\n### Counting in Intervals\n\nWe can count forward or backward by the same number each time.\n\n**Count in $3$s:** $3, 6, 9, 12, 15, 18, \\ldots$\n**Count in $4$s from $5$:** $5, 9, 13, 17, 21, 25, \\ldots$\n**Count back in $5$s from $100$:** $100, 95, 90, 85, 80, \\ldots$\n**Count in $25$s:** $25, 50, 75, 100, 125, 150, \\ldots$ (like counting Rand coins!)\n\n### Describing a Pattern\n\nTo describe a pattern, say:\n1. What the **first number** is.\n2. What the **rule** is (add or subtract how much each time).\n\n**Example:** $8, 15, 22, 29, 36, \\ldots$\n- Start at $8$.\n- Add $7$ each time.\n- Next number: $36 + 7 = 43$.'),
  t(2, '### Extending Patterns\n\n**Example 1:** Find the next three numbers: $12, 18, 24, 30, \\ldots$\nRule: add $6$. Next: $36, 42, 48$.\n\n**Example 2:** Find the next three numbers: $95, 87, 79, 71, \\ldots$\nRule: subtract $8$. Next: $63, 55, 47$.\n\n### Input–Output Tables\n\nA rule turns an **input** number into an **output** number.\n\n**Example:** Rule: multiply by $3$, then add $1$.\n\n| Input | 1 | 2 | 3 | 4 | 5 |\n|---|---|---|---|---|---|\n| Output | 4 | 7 | 10 | 13 | 16 |\n\nCheck: $1 \\times 3 + 1 = 4$ ✓, $2 \\times 3 + 1 = 7$ ✓, $5 \\times 3 + 1 = 16$ ✓\n\n### Finding the Rule\n\n**Example:** What is the rule?\n\n| Input | 2 | 4 | 6 | 8 |\n|---|---|---|---|---|\n| Output | 5 | 9 | 13 | 17 |\n\nThe difference between outputs is $4$. When input $= 2$, output $= 5 = 2 \\times 2 + 1$.\nRule: multiply by $2$, add $1$.'),
  q(3, 'What are the next two numbers in the pattern $4, 11, 18, 25, \\ldots$?',
    ['$32, 39$', '$33, 40$', '$31, 38$', '$30, 37$'], 0,
    'The rule is add $7$. Next: $25 + 7 = 32$, $32 + 7 = 39$.'),
  t(4, '### Geometric Patterns\n\nA **geometric pattern** uses shapes.\n\n**Example:** Thandi builds squares with matchsticks.\n- Shape 1: $4$ matchsticks (one square).\n- Shape 2: $7$ matchsticks (two squares sharing a side).\n- Shape 3: $10$ matchsticks (three squares sharing sides).\n\nThe number pattern is $4, 7, 10, \\ldots$ — add $3$ each time.\n\nShape 5 would need: $4 + 3 + 3 + 3 + 3 = 16$ matchsticks.\n\n**Example:** A growing pattern with dots:\n- Step 1: $1$ dot\n- Step 2: $3$ dots\n- Step 3: $6$ dots\n- Step 4: $10$ dots\n\nThese are called **triangular numbers**. The differences are $2, 3, 4, \\ldots$ — they grow by $1$ each time!'),
  q(5, 'If the rule is "multiply by $2$ then subtract $3$", what is the output when the input is $6$?',
    ['$9$', '$15$', '$6$', '$12$'], 0,
    '$6 \\times 2 = 12$, then $12 - 3 = 9$.'),
  fb(6, 'In the pattern $50, 43, 36, 29, \\ldots$ the rule is subtract ___. The next number is ___.',
    ['7', '22'],
    'Each number decreases by $7$. Next: $29 - 7 = 22$.'),
  t(7, '### Creating Your Own Patterns\n\nYou can make your own pattern by choosing:\n1. A starting number.\n2. A rule.\n\n**Example:** Start at $100$, subtract $9$:\n$$100, 91, 82, 73, 64, 55, 46, \\ldots$$\n\n**Example:** Start at $2$, multiply by $2$:\n$$2, 4, 8, 16, 32, 64, \\ldots$$\nThese numbers double each time!\n\n### Patterns in Real Life\n\n- South African coins: $5$c, $10$c, $20$c, $50$c, R$1$, R$2$, R$5$ — each is roughly double!\n- House numbers on a street: $1, 3, 5, 7, 9, \\ldots$ (odd numbers on one side)'),
  q(8, 'A pattern of tiles grows: $5, 8, 11, 14, \\ldots$ How many tiles are in Step 6?',
    ['$20$', '$17$', '$23$', '$22$'], 0,
    'Rule: add $3$. Step 5: $17$, Step 6: $17 + 3 = 20$.'),
  t(9, '### Problem Solving with Patterns\n\n**Example:** Sipho saves R$5$ in Week 1, R$10$ in Week 2, R$15$ in Week 3, and so on.\n\n| Week | 1 | 2 | 3 | 4 | 5 | 6 |\n|---|---|---|---|---|---|---|\n| Savings (R) | 5 | 10 | 15 | 20 | 25 | 30 |\n\nRule: add R$5$ each week.\n\nHow much will Sipho save in Week $10$?\n$$10 \\times 5 = R50$$\n\nHow much will Sipho have saved in total after $10$ weeks?\n$$5 + 10 + 15 + \\ldots + 50 = R275$$'),
  q(10, 'What number is missing? $3, 6, \\text{___}, 12, 15$',
    ['$9$', '$8$', '$10$', '$7$'], 0,
    'The rule is add $3$. After $6$: $6 + 3 = 9$. Check: $9 + 3 = 12$ ✓'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Capacity and Volume (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Capacity and Volume\n\n**Capacity** is how much a container can hold.\n**Volume** is how much space something takes up.\n\n### Units of Capacity\n\n| Unit | Symbol | Example |\n|---|---|---|\n| Litre | $\\ell$ | A large bottle of cool drink |\n| Millilitre | $m\\ell$ | A teaspoon of medicine |\n\n### The Relationship\n\n$$1 \\text{ litre} = 1\\,000 \\text{ millilitres}$$\n$$1\\,\\ell = 1\\,000\\,m\\ell$$\n\n**Converting litres to millilitres:** Multiply by $1\\,000$.\n- $2\\,\\ell = 2 \\times 1\\,000 = 2\\,000\\,m\\ell$\n- $3{,}5\\,\\ell = 3{,}5 \\times 1\\,000 = 3\\,500\\,m\\ell$\n\n**Converting millilitres to litres:** Divide by $1\\,000$.\n- $5\\,000\\,m\\ell = 5\\,000 \\div 1\\,000 = 5\\,\\ell$\n- $1\\,500\\,m\\ell = 1\\,500 \\div 1\\,000 = 1{,}5\\,\\ell$'),
  t(2, '### Estimating Capacity\n\n**Helpful benchmarks:**\n- A teaspoon holds about $5\\,m\\ell$.\n- A tablespoon holds about $15\\,m\\ell$.\n- A cup holds about $250\\,m\\ell$.\n- A standard water bottle holds $500\\,m\\ell$.\n- A large cold drink bottle holds $2\\,\\ell$.\n- A bucket holds about $10\\,\\ell$.\n\n### Comparing Containers\n\nTo compare containers, convert everything to the **same unit**.\n\n**Example:** Which holds more: a $750\\,m\\ell$ bottle or a $1\\,\\ell$ jug?\n- $1\\,\\ell = 1\\,000\\,m\\ell$\n- $1\\,000\\,m\\ell > 750\\,m\\ell$\n- The jug holds more.\n\n### Practical Measuring\n\nTo measure capacity:\n1. Choose a suitable measuring container (cup, jug, measuring cylinder).\n2. Pour the liquid into the container.\n3. Read the scale at **eye level**.'),
  q(3, 'How many millilitres are in $2{,}5$ litres?',
    ['$2\\,500\\,m\\ell$', '$250\\,m\\ell$', '$25\\,000\\,m\\ell$', '$25\\,m\\ell$'], 0,
    '$2{,}5 \\times 1\\,000 = 2\\,500\\,m\\ell$.'),
  t(4, '### Solving Capacity Problems\n\n**Example 1:** A recipe needs $750\\,m\\ell$ of milk. Mama has a $2\\,\\ell$ bottle of milk. How much milk will be left after making the recipe?\n$$2\\,000\\,m\\ell - 750\\,m\\ell = 1\\,250\\,m\\ell = 1{,}25\\,\\ell$$\n\n**Example 2:** A fish tank holds $15\\,\\ell$ of water. If you use a $500\\,m\\ell$ jug to fill it, how many jugs of water do you need?\n$$15\\,\\ell = 15\\,000\\,m\\ell$$\n$$15\\,000 \\div 500 = 30 \\text{ jugs}$$\n\n**Example 3:** Lerato drinks $4$ glasses of water a day. Each glass holds $250\\,m\\ell$. How many litres does she drink per day?\n$$4 \\times 250 = 1\\,000\\,m\\ell = 1\\,\\ell$$'),
  q(5, 'A bucket holds $8\\,\\ell$. How many $500\\,m\\ell$ bottles can be filled from one bucket?',
    ['$16$', '$8$', '$4$', '$160$'], 0,
    '$8\\,\\ell = 8\\,000\\,m\\ell$. $8\\,000 \\div 500 = 16$ bottles.'),
  fb(6, '$4\\,500\\,m\\ell = $ ___ litres. A teaspoon holds about ___ $m\\ell$.',
    ['4,5', '5'],
    '$4\\,500 \\div 1\\,000 = 4{,}5\\,\\ell$. A teaspoon holds approximately $5\\,m\\ell$.'),
  t(7, '### Mixing and Pouring\n\n**Example 1:** You mix $350\\,m\\ell$ of orange juice, $350\\,m\\ell$ of pineapple juice, and $300\\,m\\ell$ of lemonade. What is the total volume?\n$$350 + 350 + 300 = 1\\,000\\,m\\ell = 1\\,\\ell$$\n\n**Example 2:** A school needs $25\\,\\ell$ of soup for a sports day. Each pot holds $5\\,\\ell$. How many pots of soup must be made?\n$$25 \\div 5 = 5 \\text{ pots}$$\n\n**Remember:** When comparing or adding, always use the **same unit** (all litres or all millilitres).'),
  q(8, 'Which is more: $3\\,250\\,m\\ell$ or $3\\,\\ell$?',
    ['$3\\,250\\,m\\ell$', '$3\\,\\ell$', 'They are the same', 'Cannot tell'], 0,
    '$3\\,\\ell = 3\\,000\\,m\\ell$. Since $3\\,250 > 3\\,000$, $3\\,250\\,m\\ell$ is more.'),
  t(9, '### Volume of Containers\n\nWe can estimate the volume of a box-shaped container by thinking about how many small cubes fit inside.\n\n**Example:** A box is $3$ cubes long, $2$ cubes wide, and $2$ cubes tall. Its volume is:\n$$3 \\times 2 \\times 2 = 12 \\text{ cubes}$$\n\nIn later grades you will learn the formula:\n$$\\text{Volume} = \\text{length} \\times \\text{width} \\times \\text{height}$$'),
  q(10, 'Mama uses $375\\,m\\ell$ of milk each morning. How much milk does she use in a week ($7$ days)?',
    ['$2\\,625\\,m\\ell$', '$2\\,525\\,m\\ell$', '$2\\,725\\,m\\ell$', '$3\\,000\\,m\\ell$'], 0,
    '$375 \\times 7 = 2\\,625\\,m\\ell$. That is about $2{,}6\\,\\ell$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Time (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Time\n\n### Reading an Analogue Clock\n\nAn analogue clock has:\n- A **short hand** (hour hand) that shows the **hour**.\n- A **long hand** (minute hand) that shows the **minutes**.\n\n**Key positions of the minute hand:**\n- At $12$ → **o\'clock** (0 minutes)\n- At $6$ → **half past** (30 minutes)\n- At $3$ → **quarter past** (15 minutes)\n- At $9$ → **quarter to** (45 minutes, or 15 minutes to the next hour)\n\n### Reading 5-Minute Intervals\n\nEach number on the clock face is $5$ minutes apart:\n- $12 = 0$ min, $1 = 5$ min, $2 = 10$ min, $3 = 15$ min, $4 = 20$ min, $5 = 25$ min\n- $6 = 30$ min, $7 = 35$ min, $8 = 40$ min, $9 = 45$ min, $10 = 50$ min, $11 = 55$ min\n\n**Example:** If the hour hand is between $3$ and $4$, and the minute hand points to $4$, the time is **3:20** (twenty past three).'),
  t(2, '### Days, Weeks, and Months\n\n**Days in a week:** Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday ($7$ days).\n\n**Months of the year:**\n\n| Month | Days |\n|---|---|\n| January | 31 |\n| February | 28 (29 in a leap year) |\n| March | 31 |\n| April | 30 |\n| May | 31 |\n| June | 30 |\n| July | 31 |\n| August | 31 |\n| September | 30 |\n| October | 31 |\n| November | 30 |\n| December | 31 |\n\n**Helpful rhyme:** "Thirty days hath September, April, June, and November..."\n\n**Important facts:**\n- $1$ week $= 7$ days\n- $1$ year $= 12$ months $= 365$ days ($366$ in a leap year)\n- $1$ day $= 24$ hours\n- $1$ hour $= 60$ minutes'),
  q(3, 'How many minutes are in $1$ hour and $15$ minutes?',
    ['$75$ minutes', '$115$ minutes', '$65$ minutes', '$60$ minutes'], 0,
    '$1$ hour $= 60$ minutes. $60 + 15 = 75$ minutes.'),
  t(4, '### Elapsed Time\n\n**Elapsed time** is how much time passes between a start time and an end time.\n\n**Example 1:** A maths lesson starts at $9{:}15$ and ends at $10{:}00$. How long is the lesson?\n- From $9{:}15$ to $10{:}00$ is $45$ minutes.\n\n**Example 2:** Sipho leaves home at $7{:}30$ and arrives at school at $8{:}10$. How long is his trip?\n- From $7{:}30$ to $8{:}00$ is $30$ minutes.\n- From $8{:}00$ to $8{:}10$ is $10$ minutes.\n- Total: $30 + 10 = 40$ minutes.\n\n**Example 3:** A movie starts at $2{:}45$ and lasts $1$ hour $30$ minutes. What time does it end?\n- $2{:}45 + 1$ hour $= 3{:}45$\n- $3{:}45 + 30$ minutes $= 4{:}15$\n- The movie ends at $4{:}15$.'),
  q(5, 'School starts at $7{:}45$ and ends at $2{:}30$. How long is the school day?',
    ['$6$ hours $45$ minutes', '$7$ hours $15$ minutes', '$6$ hours $15$ minutes', '$5$ hours $45$ minutes'], 0,
    'From $7{:}45$ to $2{:}30$: count $7{:}45 \\to 8{:}00$ (15 min), $8{:}00 \\to 2{:}00$ (6 hours), $2{:}00 \\to 2{:}30$ (30 min). Total: $6$ hours $45$ minutes.'),
  fb(6, 'There are ___ months in a year. If the time is quarter to $5$, the time in numbers is ___.',
    ['12', '4:45'],
    'A year has $12$ months. Quarter to $5$ means $15$ minutes before $5{:}00$, which is $4{:}45$.'),
  t(7, '### Reading a Calendar\n\n**Using a calendar we can answer questions like:**\n- What day of the week is 15 March?\n- How many Saturdays are in April?\n- How many days from 3 June to 20 June?\n\n**Example:** How many days from 18 March to 5 April?\n- March has $31$ days. From 18 March to 31 March: $31 - 18 = 13$ days.\n- From 1 April to 5 April: $5$ days.\n- Total: $13 + 5 = 18$ days.\n\n### Timetables\n\nA timetable shows when events happen.\n\n**Example — A bus timetable:**\n\n| Bus | Departs Soweto | Arrives Sandton |\n|---|---|---|\n| 1 | $6{:}00$ | $6{:}45$ |\n| 2 | $7{:}15$ | $8{:}05$ |\n| 3 | $8{:}30$ | $9{:}25$ |\n\nHow long does Bus 2 take? From $7{:}15$ to $8{:}05 = 50$ minutes.'),
  q(8, 'How many days are there in February during a leap year?',
    ['$29$', '$28$', '$30$', '$31$'], 0,
    'February normally has $28$ days, but in a leap year it has $29$ days.'),
  t(9, '### More Time Problems\n\n**Example 1:** Heritage Day is on 24 September. Youth Day is on 16 June. How many days are between them?\n- June: $30 - 16 = 14$ days left\n- July: $31$ days\n- August: $31$ days\n- September 1 to 24: $24$ days\n- Total: $14 + 31 + 31 + 24 = 100$ days\n\n**Example 2:** A cake must bake for $1$ hour $20$ minutes. If you put it in the oven at $3{:}50$, when must you take it out?\n- $3{:}50 + 1$ hour $= 4{:}50$\n- $4{:}50 + 20$ minutes $= 5{:}10$\n- Take the cake out at $5{:}10$.'),
  q(10, 'A train departs Cape Town at $9{:}25$ and arrives in Stellenbosch at $10{:}15$. How long is the journey?',
    ['$50$ minutes', '$45$ minutes', '$1$ hour', '$55$ minutes'], 0,
    'From $9{:}25$ to $10{:}00$ is $35$ minutes. From $10{:}00$ to $10{:}15$ is $15$ minutes. Total: $35 + 15 = 50$ minutes.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Length (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Length\n\nLength tells us how long, wide, tall, or deep something is.\n\n### Units of Length\n\n| Unit | Symbol | Used for |\n|---|---|---|\n| Metre | m | Height of a door, length of a room |\n| Centimetre | cm | Length of a pencil, width of a book |\n| Millimetre | mm | Thickness of a coin, a tiny insect |\n\n### Converting Between Units\n\n$$1\\,\\text{m} = 100\\,\\text{cm}$$\n$$1\\,\\text{cm} = 10\\,\\text{mm}$$\n$$1\\,\\text{m} = 1\\,000\\,\\text{mm}$$\n\n**Metres to centimetres:** Multiply by $100$.\n- $3\\,\\text{m} = 3 \\times 100 = 300\\,\\text{cm}$\n- $2{,}5\\,\\text{m} = 2{,}5 \\times 100 = 250\\,\\text{cm}$\n\n**Centimetres to millimetres:** Multiply by $10$.\n- $15\\,\\text{cm} = 15 \\times 10 = 150\\,\\text{mm}$\n\n**Centimetres to metres:** Divide by $100$.\n- $450\\,\\text{cm} = 450 \\div 100 = 4{,}5\\,\\text{m}$'),
  t(2, '### Measuring with a Ruler\n\nWhen using a ruler:\n1. Place the $0$ mark at the start of the object.\n2. Read the number at the other end.\n3. The small lines between numbers are **millimetres**.\n\n**Example:** A crayon measures from $0$ to $8\\,\\text{cm}$ and $5\\,\\text{mm}$. Its length is $8{,}5\\,\\text{cm}$ or $85\\,\\text{mm}$.\n\n### Estimating Length\n\n**Helpful benchmarks:**\n- Your fingernail is about $1\\,\\text{cm}$ wide.\n- The tip of a ballpoint pen is about $1\\,\\text{mm}$.\n- A door is about $2\\,\\text{m}$ tall.\n- A new pencil is about $19\\,\\text{cm}$ long.\n- A rugby field is $100\\,\\text{m}$ long.\n\n**Example:** Estimate the length of your desk.\n- A desk is about $1{,}2\\,\\text{m}$ or $120\\,\\text{cm}$ long.'),
  q(3, 'How many centimetres are in $3{,}7$ metres?',
    ['$370\\,\\text{cm}$', '$37\\,\\text{cm}$', '$3\\,700\\,\\text{cm}$', '$307\\,\\text{cm}$'], 0,
    '$3{,}7 \\times 100 = 370\\,\\text{cm}$.'),
  t(4, '### Solving Length Problems\n\n**Example 1:** Thandi is $1\\,\\text{m}$ $35\\,\\text{cm}$ tall. Her brother is $1\\,\\text{m}$ $52\\,\\text{cm}$ tall. How much taller is her brother?\n$$152\\,\\text{cm} - 135\\,\\text{cm} = 17\\,\\text{cm}$$\n\n**Example 2:** A ribbon is $2\\,\\text{m}$ long. Lerato cuts off $85\\,\\text{cm}$. How much ribbon is left?\n$$200\\,\\text{cm} - 85\\,\\text{cm} = 115\\,\\text{cm} = 1{,}15\\,\\text{m}$$\n\n**Example 3:** A caterpillar is $45\\,\\text{mm}$ long. Write this in centimetres.\n$$45\\,\\text{mm} = 45 \\div 10 = 4{,}5\\,\\text{cm}$$'),
  q(5, 'A pencil is $18\\,\\text{cm}$ long. How many millimetres is that?',
    ['$180\\,\\text{mm}$', '$1\\,800\\,\\text{mm}$', '$18\\,\\text{mm}$', '$1{,}8\\,\\text{mm}$'], 0,
    '$18 \\times 10 = 180\\,\\text{mm}$.'),
  fb(6, '$5\\,\\text{m} = $ ___ cm. A door is about ___ m tall.',
    ['500', '2'],
    '$5 \\times 100 = 500\\,\\text{cm}$. A standard door is about $2\\,\\text{m}$ tall.'),
  t(7, '### Adding and Subtracting Lengths\n\nAlways convert to the **same unit** before adding or subtracting.\n\n**Example 1:** $2\\,\\text{m}\\,40\\,\\text{cm} + 1\\,\\text{m}\\,75\\,\\text{cm}$\n$$240\\,\\text{cm} + 175\\,\\text{cm} = 415\\,\\text{cm} = 4\\,\\text{m}\\,15\\,\\text{cm}$$\n\n**Example 2:** Bongani runs $800\\,\\text{m}$ and then $450\\,\\text{m}$. How far does he run in total?\n$$800 + 450 = 1\\,250\\,\\text{m} = 1{,}25\\,\\text{km}$$\n\n*Wait — we mentioned kilometres!*\n$$1\\,\\text{km} = 1\\,000\\,\\text{m}$$\nYou will use kilometres more in Grade 5, but it is good to know!'),
  q(8, 'A table is $1\\,\\text{m}\\,20\\,\\text{cm}$ long. A cloth is $95\\,\\text{cm}$ long. How much longer is the table?',
    ['$25\\,\\text{cm}$', '$35\\,\\text{cm}$', '$15\\,\\text{cm}$', '$125\\,\\text{cm}$'], 0,
    'Table: $120\\,\\text{cm}$. $120 - 95 = 25\\,\\text{cm}$.'),
  t(9, '### Real-Life Length Problems\n\n**Example 1:** A classroom wall is $8\\,\\text{m}$ long. If you place desks that are each $1\\,\\text{m}\\,20\\,\\text{cm}$ wide along the wall, how many desks fit?\n$$8\\,\\text{m} = 800\\,\\text{cm}$$\n$$800 \\div 120 = 6 \\text{ remainder } 80$$\n$6$ desks fit, with $80\\,\\text{cm}$ left over.\n\n**Example 2:** A stick insect is $62\\,\\text{mm}$ long. A ladybug is $8\\,\\text{mm}$ long. How much longer is the stick insect?\n$$62 - 8 = 54\\,\\text{mm}$$'),
  q(10, 'Convert $2\\,350\\,\\text{mm}$ to centimetres.',
    ['$235\\,\\text{cm}$', '$23{,}5\\,\\text{cm}$', '$2\\,350\\,\\text{cm}$', '$23\\,500\\,\\text{cm}$'], 0,
    '$2\\,350 \\div 10 = 235\\,\\text{cm}$ (or $2\\,\\text{m}\\,35\\,\\text{cm}$).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Mass (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Mass\n\n**Mass** tells us how heavy something is.\n\n### Units of Mass\n\n| Unit | Symbol | Used for |\n|---|---|---|\n| Kilogram | kg | A bag of sugar, a child |\n| Gram | g | A slice of bread, a coin |\n\n### The Relationship\n\n$$1\\,\\text{kg} = 1\\,000\\,\\text{g}$$\n\n**Kilograms to grams:** Multiply by $1\\,000$.\n- $2\\,\\text{kg} = 2\\,000\\,\\text{g}$\n- $1{,}5\\,\\text{kg} = 1\\,500\\,\\text{g}$\n\n**Grams to kilograms:** Divide by $1\\,000$.\n- $3\\,000\\,\\text{g} = 3\\,\\text{kg}$\n- $2\\,500\\,\\text{g} = 2{,}5\\,\\text{kg}$\n\n### Estimating Mass\n\n**Helpful benchmarks:**\n- A R$5$ coin weighs about $7\\,\\text{g}$.\n- An apple weighs about $150\\,\\text{g}$.\n- A loaf of bread weighs about $700\\,\\text{g}$.\n- A bag of sugar weighs $1\\,\\text{kg}$ or $2\\,\\text{kg}$.\n- A Grade 4 learner weighs about $30\\,\\text{kg}$.'),
  t(2, '### Reading a Scale\n\nScales are used to measure mass. There are different types:\n- **Kitchen scale** (for food)\n- **Bathroom scale** (for people)\n- **Balance scale** (for comparing)\n\n**Reading a scale:**\n1. Look at the numbers on the scale.\n2. Count how many small lines are between the numbers.\n3. Each small line represents a certain amount (e.g., $50\\,\\text{g}$ or $100\\,\\text{g}$).\n\n**Example:** A kitchen scale shows numbers $0, 1, 2, 3, \\ldots$ (kilograms) with $4$ small lines between each number. Each small line is $\\frac{1}{4}\\,\\text{kg} = 250\\,\\text{g}$. If the pointer is on the $3$rd line after $1$, the reading is $1{,}75\\,\\text{kg}$ or $1\\,750\\,\\text{g}$.\n\n### Comparing Mass\n\nConvert to the **same unit** before comparing.\n\n**Example:** Which is heavier: $1\\,200\\,\\text{g}$ or $1{,}5\\,\\text{kg}$?\n- $1{,}5\\,\\text{kg} = 1\\,500\\,\\text{g}$\n- $1\\,500\\,\\text{g} > 1\\,200\\,\\text{g}$\n- $1{,}5\\,\\text{kg}$ is heavier.'),
  q(3, 'How many grams are in $3{,}25\\,\\text{kg}$?',
    ['$3\\,250\\,\\text{g}$', '$325\\,\\text{g}$', '$32\\,500\\,\\text{g}$', '$32{,}5\\,\\text{g}$'], 0,
    '$3{,}25 \\times 1\\,000 = 3\\,250\\,\\text{g}$.'),
  t(4, '### Solving Mass Problems\n\n**Example 1:** A recipe needs $500\\,\\text{g}$ of flour. Gogo has $2\\,\\text{kg}$ of flour. How much will be left after making the recipe?\n$$2\\,000\\,\\text{g} - 500\\,\\text{g} = 1\\,500\\,\\text{g} = 1{,}5\\,\\text{kg}$$\n\n**Example 2:** A box of apples weighs $3\\,\\text{kg}$. Each apple weighs about $150\\,\\text{g}$. Roughly how many apples are in the box?\n$$3\\,000 \\div 150 = 20 \\text{ apples}$$\n\n**Example 3:** Bongani carries $3$ bags from the shops. The bags weigh $1{,}5\\,\\text{kg}$, $2\\,\\text{kg}$, and $800\\,\\text{g}$. What is the total mass?\n$$1\\,500 + 2\\,000 + 800 = 4\\,300\\,\\text{g} = 4{,}3\\,\\text{kg}$$'),
  q(5, 'A bag of potatoes weighs $5\\,\\text{kg}$. Mama uses $1\\,750\\,\\text{g}$ for supper. How many grams are left?',
    ['$3\\,250\\,\\text{g}$', '$3\\,750\\,\\text{g}$', '$3\\,350\\,\\text{g}$', '$3\\,150\\,\\text{g}$'], 0,
    '$5\\,\\text{kg} = 5\\,000\\,\\text{g}$. $5\\,000 - 1\\,750 = 3\\,250\\,\\text{g}$.'),
  fb(6, '$4\\,750\\,\\text{g} = $ ___ kg. An apple weighs about ___ g.',
    ['4,75', '150'],
    '$4\\,750 \\div 1\\,000 = 4{,}75\\,\\text{kg}$. An apple weighs roughly $150\\,\\text{g}$.'),
  t(7, '### Practical Mass Activities\n\n**Activity 1: Estimating and checking**\nPick up an object and guess its mass. Then use a scale to check.\n\n| Object | Estimate | Actual |\n|---|---|---|\n| School bag | $3\\,\\text{kg}$ | $3{,}2\\,\\text{kg}$ |\n| Pencil case | $200\\,\\text{g}$ | $180\\,\\text{g}$ |\n| Textbook | $500\\,\\text{g}$ | $450\\,\\text{g}$ |\n\n**Activity 2: Ordering by mass**\nArrange from lightest to heaviest:\n- Feather ($2\\,\\text{g}$), coin ($7\\,\\text{g}$), apple ($150\\,\\text{g}$), bag of rice ($2\\,\\text{kg}$)\n$$2\\,\\text{g} < 7\\,\\text{g} < 150\\,\\text{g} < 2\\,000\\,\\text{g}$$'),
  q(8, 'Which is heavier: $2\\,800\\,\\text{g}$ or $2{,}5\\,\\text{kg}$?',
    ['$2\\,800\\,\\text{g}$', '$2{,}5\\,\\text{kg}$', 'They are the same', 'Cannot tell'], 0,
    '$2{,}5\\,\\text{kg} = 2\\,500\\,\\text{g}$. Since $2\\,800 > 2\\,500$, $2\\,800\\,\\text{g}$ is heavier.'),
  t(9, '### More Mass Problems\n\n**Example 1:** A loaf of bread weighs $700\\,\\text{g}$. If the baker bakes $6$ loaves, what is the total mass?\n$$6 \\times 700 = 4\\,200\\,\\text{g} = 4{,}2\\,\\text{kg}$$\n\n**Example 2:** At a market in Johannesburg, bananas cost R$15$ per kilogram. If you buy $500\\,\\text{g}$ of bananas, how much do you pay?\n$$500\\,\\text{g} = 0{,}5\\,\\text{kg}$$\n$$0{,}5 \\times 15 = R7{,}50$$'),
  q(10, 'A parcel weighs $1\\,\\text{kg}\\,350\\,\\text{g}$. Write this in grams.',
    ['$1\\,350\\,\\text{g}$', '$1\\,035\\,\\text{g}$', '$13\\,500\\,\\text{g}$', '$135\\,\\text{g}$'], 0,
    '$1\\,\\text{kg} = 1\\,000\\,\\text{g}$. So $1\\,\\text{kg}\\,350\\,\\text{g} = 1\\,000 + 350 = 1\\,350\\,\\text{g}$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Properties of 2D Shapes (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Properties of 2D Shapes\n\nA **2D shape** (two-dimensional shape) is flat. It has length and width but no depth.\n\n### Common 2D Shapes\n\n| Shape | Sides | Corners (Vertices) | Special Features |\n|---|---|---|---|\n| Circle | $0$ (curved line) | $0$ | Perfectly round |\n| Triangle | $3$ | $3$ | All sides are straight |\n| Square | $4$ | $4$ | All sides equal, all corners are right angles |\n| Rectangle | $4$ | $4$ | Opposite sides equal, all corners are right angles |\n| Pentagon | $5$ | $5$ | Five straight sides |\n| Hexagon | $6$ | $6$ | Six straight sides |\n\n### Sides and Corners\n\n- A **side** is a straight line that forms part of the shape.\n- A **corner** (or **vertex**) is where two sides meet.\n- A **right angle** looks like the corner of a book — exactly $90°$.'),
  t(2, '### Straight and Curved Lines\n\n- **Straight lines:** Triangles, squares, rectangles, pentagons, hexagons — all have straight sides.\n- **Curved lines:** A circle is made of one curved line. An oval (ellipse) is also curved.\n\n### Types of Triangles\n\nTriangles can be different shapes:\n- If **all 3 sides are the same length**, it is an **equilateral triangle**.\n- If **2 sides are the same length**, it is an **isosceles triangle**.\n- If **all 3 sides are different**, it is a **scalene triangle**.\n\n### Comparing Shapes\n\n**How is a square different from a rectangle?**\n- A square has **all 4 sides equal**.\n- A rectangle has **opposite sides equal** (the longer sides are the same, and the shorter sides are the same).\n- Both have $4$ right angles.\n\n**A square is a special type of rectangle!**'),
  q(3, 'How many sides does a hexagon have?',
    ['$6$', '$5$', '$7$', '$8$'], 0,
    'A hexagon has $6$ sides. "Hex" means $6$.'),
  t(4, '### Identifying Shapes in Real Life\n\nShapes are all around us!\n\n| Shape | Real-life example |\n|---|---|\n| Circle | A coin, a clock face, a wheel |\n| Triangle | A roof, a road sign (yield), a slice of pizza |\n| Square | A tile on the floor, a window pane |\n| Rectangle | A door, a book, a cricket pitch |\n| Pentagon | A star outline section, some house shapes |\n| Hexagon | A honeycomb cell, a stop sign in some countries |\n\n**Activity:** Look around your classroom. Can you find:\n- $3$ circles?\n- $3$ rectangles?\n- $1$ triangle?'),
  q(5, 'A shape has $4$ sides, all the same length, and $4$ right angles. What shape is it?',
    ['Square', 'Rectangle', 'Rhombus', 'Pentagon'], 0,
    'A square has $4$ equal sides and $4$ right angles ($90°$ each).'),
  fb(6, 'A triangle has ___ corners. A shape with $5$ sides is called a ___.',
    ['3', 'pentagon'],
    'A triangle has $3$ corners (vertices). A $5$-sided shape is a pentagon ("penta" means $5$).'),
  t(7, '### Symmetry\n\nA shape has **symmetry** if you can fold it along a line and both halves match exactly. This line is called a **line of symmetry**.\n\n**Examples:**\n- A **square** has $4$ lines of symmetry.\n- A **rectangle** has $2$ lines of symmetry.\n- A **circle** has infinitely many lines of symmetry.\n- An **equilateral triangle** has $3$ lines of symmetry.\n- A **scalene triangle** has $0$ lines of symmetry.\n\n**Test:** If you fold a heart shape down the middle, both halves match. The heart has $1$ line of symmetry.'),
  q(8, 'How many lines of symmetry does a rectangle have?',
    ['$2$', '$4$', '$1$', '$0$'], 0,
    'A rectangle can be folded along $2$ lines of symmetry (horizontal middle and vertical middle). A square has $4$.'),
  t(9, '### Sorting and Classifying Shapes\n\nWe can sort shapes by:\n- **Number of sides:** triangles ($3$), quadrilaterals ($4$), pentagons ($5$), hexagons ($6$)\n- **Curved or straight lines**\n- **Right angles or no right angles**\n- **Equal sides or unequal sides**\n\n**Example:** Sort these shapes into two groups — shapes with right angles and shapes without:\n- Square ✓, circle ✗, triangle (some ✓, some ✗), rectangle ✓, hexagon ✗\n\nShapes with right angles: square, rectangle\nShapes without right angles: circle, hexagon'),
  q(10, 'Which triangle has all three sides the same length?',
    ['Equilateral triangle', 'Isosceles triangle', 'Scalene triangle', 'Right triangle'], 0,
    'An equilateral triangle has all $3$ sides equal and all $3$ angles equal ($60°$ each).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Properties of 3D Objects (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Properties of 3D Objects\n\nA **3D object** (three-dimensional object) has length, width, **and** height (depth). You can hold a 3D object in your hand!\n\n### Common 3D Objects\n\n| Object | Shape | Real-life example |\n|---|---|---|\n| Cube | All faces are squares | A dice, a Rubik\'s cube |\n| Rectangular prism (cuboid) | Faces are rectangles (and/or squares) | A cereal box, a brick |\n| Sphere | Perfectly round | A ball, an orange |\n| Cylinder | Round top and bottom, curved side | A tin can, a candle |\n| Cone | Round base, pointed top | An ice cream cone, a party hat |\n\n### Faces, Edges, and Vertices\n\n- A **face** is a flat surface.\n- An **edge** is where two faces meet (a line).\n- A **vertex** (plural: vertices) is a corner point.'),
  t(2, '### Counting Faces, Edges, and Vertices\n\n| 3D Object | Faces | Edges | Vertices |\n|---|---|---|---|\n| Cube | $6$ | $12$ | $8$ |\n| Rectangular prism | $6$ | $12$ | $8$ |\n| Cylinder | $3$ ($2$ flat, $1$ curved) | $2$ | $0$ |\n| Cone | $2$ ($1$ flat, $1$ curved) | $1$ | $1$ (the apex) |\n| Sphere | $1$ (curved) | $0$ | $0$ |\n\n**Note:** A sphere has no flat faces, no edges, and no vertices. It is perfectly round everywhere.\n\n### Flat vs Curved Surfaces\n\n- **Cube and rectangular prism:** Only flat faces.\n- **Cylinder:** $2$ flat faces (circles) and $1$ curved surface.\n- **Cone:** $1$ flat face (circle) and $1$ curved surface.\n- **Sphere:** Only $1$ curved surface.'),
  q(3, 'How many faces does a cube have?',
    ['$6$', '$4$', '$8$', '$12$'], 0,
    'A cube has $6$ square faces — top, bottom, front, back, left, and right.'),
  t(4, '### Identifying 3D Objects in Real Life\n\n**Look around your home and school!**\n\n| 3D Object | Where you find it |\n|---|---|\n| Cube | A dice, a sugar cube |\n| Rectangular prism | A book, a shoebox, a fridge |\n| Sphere | A tennis ball, a marble, the Earth |\n| Cylinder | A cool drink can, a crayon, a toilet roll tube |\n| Cone | A traffic cone, a megaphone, an ice cream cone |\n\n**Example:** What 3D shape is a Kreepy Krauly (pool) ball?\n- It is a **sphere** — perfectly round with no flat faces.\n\n**Example:** What 3D shape is a tin of baked beans?\n- It is a **cylinder** — it has two circular faces and a curved surface.'),
  q(5, 'A rectangular prism has how many edges?',
    ['$12$', '$8$', '$6$', '$10$'], 0,
    'A rectangular prism has $12$ edges — $4$ along the length, $4$ along the width, and $4$ along the height.'),
  fb(6, 'A cone has ___ vertex (vertices). A sphere has ___ flat faces.',
    ['1', '0'],
    'A cone has $1$ vertex at its point (apex). A sphere has no flat faces — only a curved surface.'),
  t(7, '### Rolling and Stacking\n\n**Which 3D objects can roll?**\n- Sphere: rolls in any direction ✓\n- Cylinder: rolls in one direction ✓\n- Cone: rolls in a circle ✓\n- Cube: cannot roll ✗\n- Rectangular prism: cannot roll ✗\n\n**Which 3D objects can be stacked?**\n- Cube: stacks well ✓ (flat faces)\n- Rectangular prism: stacks well ✓\n- Cylinder: stacks on flat ends ✓\n- Sphere: does NOT stack (rolls away) ✗\n- Cone: does NOT stack well ✗\n\n**Why?** Objects with **flat faces** can be stacked. Objects with **curved surfaces** can roll.'),
  q(8, 'Which 3D object has $2$ flat circular faces and $1$ curved surface?',
    ['Cylinder', 'Cone', 'Sphere', 'Cube'], 0,
    'A cylinder has $2$ flat circular faces (top and bottom) and $1$ curved surface around the side.'),
  t(9, '### Comparing 3D Objects\n\n**How is a cube different from a rectangular prism?**\n- A cube has all faces the **same size** (all squares).\n- A rectangular prism can have faces that are **different sizes** (rectangles).\n- Both have $6$ faces, $12$ edges, and $8$ vertices.\n\n**A cube is a special type of rectangular prism!**\n\n**How is a cylinder different from a cone?**\n- A cylinder has $2$ circular faces — top and bottom are the same size.\n- A cone has $1$ circular face at the bottom and comes to a point at the top.'),
  q(10, 'What shape are the faces of a cube?',
    ['Squares', 'Rectangles', 'Triangles', 'Circles'], 0,
    'All $6$ faces of a cube are squares — they are all the same size.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Perimeter and Area (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Perimeter and Area\n\n### Perimeter\n\nThe **perimeter** is the total distance around the outside of a shape.\n\nTo find the perimeter, **add up all the sides**.\n\n**Example 1:** A rectangle is $8\\,\\text{cm}$ long and $5\\,\\text{cm}$ wide.\n$$\\text{Perimeter} = 8 + 5 + 8 + 5 = 26\\,\\text{cm}$$\n\nOr use the shortcut:\n$$\\text{Perimeter of a rectangle} = 2 \\times (\\text{length} + \\text{width}) = 2 \\times (8 + 5) = 2 \\times 13 = 26\\,\\text{cm}$$\n\n**Example 2:** A square has sides of $6\\,\\text{cm}$.\n$$\\text{Perimeter} = 4 \\times 6 = 24\\,\\text{cm}$$\n\n**Example 3:** A triangle has sides $7\\,\\text{cm}$, $5\\,\\text{cm}$, and $9\\,\\text{cm}$.\n$$\\text{Perimeter} = 7 + 5 + 9 = 21\\,\\text{cm}$$'),
  t(2, '### Perimeter by Counting\n\nIf a shape is drawn on grid paper, you can **count the units** around the outside.\n\n**Example:** A shape drawn on centimetre grid paper has the following sides: $4\\,\\text{cm}$, $2\\,\\text{cm}$, $1\\,\\text{cm}$, $1\\,\\text{cm}$, $3\\,\\text{cm}$, $3\\,\\text{cm}$.\n$$\\text{Perimeter} = 4 + 2 + 1 + 1 + 3 + 3 = 14\\,\\text{cm}$$\n\n### Area\n\nThe **area** is the amount of flat space a shape covers.\n\nWe measure area in **square units** (e.g., $\\text{cm}^2$).\n\n### Area by Counting Squares\n\nOn grid paper, count the number of squares inside the shape.\n\n**Example:** A rectangle covers $4$ squares across and $3$ squares down.\n$$\\text{Area} = 4 \\times 3 = 12\\,\\text{cm}^2$$\n\n**For half squares:** Two half squares make one whole square.'),
  q(3, 'What is the perimeter of a rectangle that is $10\\,\\text{cm}$ long and $4\\,\\text{cm}$ wide?',
    ['$28\\,\\text{cm}$', '$14\\,\\text{cm}$', '$40\\,\\text{cm}$', '$20\\,\\text{cm}$'], 0,
    '$\\text{Perimeter} = 2 \\times (10 + 4) = 2 \\times 14 = 28\\,\\text{cm}$.'),
  t(4, '### Area of Rectangles and Squares\n\n**Area of a rectangle:**\n$$\\text{Area} = \\text{length} \\times \\text{width}$$\n\n**Example:** A garden is $12\\,\\text{m}$ long and $8\\,\\text{m}$ wide.\n$$\\text{Area} = 12 \\times 8 = 96\\,\\text{m}^2$$\n\n**Area of a square:**\n$$\\text{Area} = \\text{side} \\times \\text{side}$$\n\n**Example:** A square tile has sides of $5\\,\\text{cm}$.\n$$\\text{Area} = 5 \\times 5 = 25\\,\\text{cm}^2$$\n\n### Comparing Perimeter and Area\n\nTwo shapes can have the **same perimeter** but **different areas**!\n\n**Example:** Both shapes have perimeter $= 16\\,\\text{cm}$:\n- Rectangle $6 \\times 2$: Area $= 12\\,\\text{cm}^2$\n- Square $4 \\times 4$: Area $= 16\\,\\text{cm}^2$\n\nThe square has a bigger area even though both shapes have the same perimeter.'),
  q(5, 'What is the area of a square with sides of $7\\,\\text{cm}$?',
    ['$49\\,\\text{cm}^2$', '$28\\,\\text{cm}^2$', '$14\\,\\text{cm}^2$', '$21\\,\\text{cm}^2$'], 0,
    '$\\text{Area} = 7 \\times 7 = 49\\,\\text{cm}^2$.'),
  fb(6, 'The perimeter of a square with sides $9\\,\\text{cm}$ is ___ cm. The area of a rectangle $6\\,\\text{cm}$ by $3\\,\\text{cm}$ is ___ $\\text{cm}^2$.',
    ['36', '18'],
    'Perimeter of square $= 4 \\times 9 = 36\\,\\text{cm}$. Area of rectangle $= 6 \\times 3 = 18\\,\\text{cm}^2$.'),
  t(7, '### Word Problems — Perimeter and Area\n\n**Example 1:** A farmer in the Free State wants to put a fence around a rectangular field that is $50\\,\\text{m}$ long and $30\\,\\text{m}$ wide. How many metres of fencing does he need?\n$$\\text{Perimeter} = 2 \\times (50 + 30) = 2 \\times 80 = 160\\,\\text{m}$$\n\n**Example 2:** A classroom floor is $10\\,\\text{m}$ long and $8\\,\\text{m}$ wide. What is the area of the floor?\n$$\\text{Area} = 10 \\times 8 = 80\\,\\text{m}^2$$\n\n**Example 3:** Thandi wants to put ribbon around a square picture frame with sides of $15\\,\\text{cm}$. How much ribbon does she need?\n$$\\text{Perimeter} = 4 \\times 15 = 60\\,\\text{cm}$$'),
  q(8, 'A soccer field is $100\\,\\text{m}$ long and $60\\,\\text{m}$ wide. What is its perimeter?',
    ['$320\\,\\text{m}$', '$6\\,000\\,\\text{m}$', '$160\\,\\text{m}$', '$6\\,000\\,\\text{m}^2$'], 0,
    '$\\text{Perimeter} = 2 \\times (100 + 60) = 2 \\times 160 = 320\\,\\text{m}$.'),
  t(9, '### Irregular Shapes\n\nFor shapes that are not simple rectangles or squares, you can still find the perimeter by **adding all the sides**.\n\n**Example:** An L-shaped room has the following sides: $5\\,\\text{m}$, $3\\,\\text{m}$, $2\\,\\text{m}$, $4\\,\\text{m}$, $3\\,\\text{m}$, $7\\,\\text{m}$.\n$$\\text{Perimeter} = 5 + 3 + 2 + 4 + 3 + 7 = 24\\,\\text{m}$$\n\nTo find the **area** of an irregular shape, break it into rectangles, find each area, then add them together.'),
  q(10, 'A rectangle has an area of $24\\,\\text{cm}^2$ and a length of $8\\,\\text{cm}$. What is its width?',
    ['$3\\,\\text{cm}$', '$4\\,\\text{cm}$', '$16\\,\\text{cm}$', '$6\\,\\text{cm}$'], 0,
    '$\\text{Area} = \\text{length} \\times \\text{width}$, so $\\text{width} = 24 \\div 8 = 3\\,\\text{cm}$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Data Handling (Term 4) — Lesson 1
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Data Handling — Collecting and Representing Data\n\n**Data** is information we collect. It can be numbers, words, or categories.\n\n### Collecting Data with Tally Marks\n\nA **tally mark** is a quick way to count.\n- Each line is $1$: $|$\n- Every $5$th mark crosses the group: $\\cancel{||||} = 5$\n\n**Example:** A Grade 4 class votes for their favourite fruit.\n\n| Fruit | Tally | Total |\n|---|---|---|\n| Apple | $\\cancel{||||}\\;||$ | $7$ |\n| Banana | $\\cancel{||||}\\;\\cancel{||||}$ | $10$ |\n| Orange | $\\cancel{||||}$ | $5$ |\n| Grape | $|||$ | $3$ |\n\nTotal learners: $7 + 10 + 5 + 3 = 25$.'),
  t(2, '### Organising Data in a Table\n\nA table makes data easy to read.\n\n**Example:** The number of rainy days in each month:\n\n| Month | Jan | Feb | Mar | Apr | May | Jun |\n|---|---|---|---|---|---|---|\n| Rainy days | $8$ | $6$ | $5$ | $3$ | $1$ | $0$ |\n\nFrom the table we can see:\n- January had the most rainy days ($8$).\n- June had no rainy days.\n- There were $8 + 6 + 5 + 3 + 1 + 0 = 23$ rainy days in total.\n\n### Drawing a Pictograph\n\nA **pictograph** uses pictures (symbols) to show data. Each picture represents a number.\n\n**Example:** Each 🍎 represents $2$ learners.\n\n| Sport | Pictograph |\n|---|---|\n| Soccer | 🍎🍎🍎🍎 ($8$ learners) |\n| Netball | 🍎🍎🍎 ($6$ learners) |\n| Cricket | 🍎🍎 ($4$ learners) |\n\n**Key:** 🍎 $= 2$ learners. Half a picture $= 1$ learner.'),
  q(3, 'In a pictograph, each symbol represents $5$ items. If there are $4$ symbols, how many items is that?',
    ['$20$', '$9$', '$15$', '$25$'], 0,
    '$4 \\times 5 = 20$ items.'),
  t(4, '### Drawing a Bar Graph\n\nA **bar graph** uses bars to show data. The taller the bar, the bigger the number.\n\n**Steps to draw a bar graph:**\n1. Draw the horizontal axis (bottom) — label the categories.\n2. Draw the vertical axis (side) — label with numbers (the scale).\n3. Draw bars for each category.\n4. Give the graph a **title**.\n\n**Example: Favourite Colours of Grade 4B**\n\n| Colour | Learners |\n|---|---|\n| Red | $8$ |\n| Blue | $12$ |\n| Green | $6$ |\n| Yellow | $4$ |\n\nThe bar for Blue would be the tallest ($12$), and Yellow the shortest ($4$).\n\n**Remember:**\n- Leave gaps between bars.\n- Start the number scale at $0$.\n- All bars must be the same width.'),
  q(5, 'In a bar graph, the bar for "apples" reaches $15$ and the bar for "oranges" reaches $9$. How many more apples than oranges?',
    ['$6$', '$24$', '$3$', '$5$'], 0,
    '$15 - 9 = 6$ more apples than oranges.'),
  fb(6, 'In a pictograph, each picture stands for $3$ items. To show $12$ items, you need ___ pictures. A bar graph must start at ___ on the number axis.',
    ['4', '0'],
    '$12 \\div 3 = 4$ pictures. The number axis always starts at $0$.'),
  t(7, '### Reading Graphs\n\nWhen you read a graph, you can answer many questions:\n- **Which category has the most/least?**\n- **How many in a specific category?**\n- **How many more is one category than another?**\n- **What is the total?**\n\n**Example:** A bar graph shows books read by learners:\n- Sipho: $7$ books\n- Lerato: $10$ books\n- Bongani: $4$ books\n- Naledi: $8$ books\n\nQuestions you could ask:\n- Who read the most books? **Lerato** ($10$)\n- How many books did they read altogether? $7 + 10 + 4 + 8 = 29$ books\n- How many more books did Naledi read than Bongani? $8 - 4 = 4$ books'),
  q(8, 'A pictograph uses ★ $= 4$ learners. Soccer has $5$ stars. How many learners chose soccer?',
    ['$20$', '$9$', '$16$', '$24$'], 0,
    '$5 \\times 4 = 20$ learners chose soccer.'),
  t(9, '### Choosing the Right Graph\n\n- **Pictograph:** Good for small amounts of data. Easy to read.\n- **Bar graph:** Good for comparing different categories. Works well with larger numbers.\n\n**Example:** You survey $100$ learners about their favourite subjects. A bar graph would be better than a pictograph because there are large numbers.\n\n**Tip for drawing:**\n- Always give your graph a **title**.\n- Always **label** both axes.\n- Choose a sensible **scale** (count by $1$s, $2$s, $5$s, or $10$s).'),
  q(10, 'A bar graph shows that $15$ learners like maths, $12$ like English, and $8$ like art. How many learners were surveyed in total?',
    ['$35$', '$27$', '$20$', '$30$'], 0,
    '$15 + 12 + 8 = 35$ learners in total.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Data Handling (Term 4) — Lesson 2
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch14_lesson2 = [
  t(1, '## Data Handling — Reading Graphs and Chance\n\n### Reading and Interpreting Graphs\n\nGraphs help us see patterns and answer questions quickly.\n\n**Example:** A bar graph shows the number of ice creams sold at a tuck shop over five days:\n\n| Day | Monday | Tuesday | Wednesday | Thursday | Friday |\n|---|---|---|---|---|---|\n| Ice creams sold | $12$ | $8$ | $15$ | $10$ | $20$ |\n\n**Questions we can answer:**\n- On which day were the most ice creams sold? **Friday** ($20$).\n- On which day were the fewest sold? **Tuesday** ($8$).\n- How many ice creams were sold altogether? $12 + 8 + 15 + 10 + 20 = 65$.\n- How many more were sold on Friday than Monday? $20 - 12 = 8$ more.\n- On which days were more than $10$ sold? Monday ($12$), Wednesday ($15$), Friday ($20$).'),
  t(2, '### Asking Questions About Data\n\nWhen you look at data, think about what questions you can ask.\n\n**Good questions to ask:**\n- Which category has the most/least?\n- What is the total?\n- What is the difference between two categories?\n- Can you see a pattern or trend?\n\n**Example:** The number of absent learners each day:\n\n| Day | Mon | Tue | Wed | Thu | Fri |\n|---|---|---|---|---|---|\n| Absent | $5$ | $3$ | $2$ | $4$ | $6$ |\n\n**Questions:**\n1. On which day were the most learners absent? **Friday** ($6$).\n2. On which day were the fewest absent? **Wednesday** ($2$).\n3. How many learners were absent in total that week? $5 + 3 + 2 + 4 + 6 = 20$.'),
  q(3, 'A graph shows $14$ boys and $18$ girls in a class. How many learners are there altogether?',
    ['$32$', '$4$', '$28$', '$22$'], 0,
    '$14 + 18 = 32$ learners altogether.'),
  t(4, '### Chance and Probability\n\nSome things are sure to happen. Other things might happen. Some things will never happen.\n\n**Words we use to describe chance:**\n\n| Word | Meaning | Example |\n|---|---|---|\n| **Certain** | It will definitely happen | The sun will rise tomorrow |\n| **Likely** | It will probably happen | It will rain in Durban in summer |\n| **Unlikely** | It probably will not happen | It will snow in Johannesburg |\n| **Impossible** | It can never happen | A cat will fly like a bird |\n| **Even chance** | It could go either way | Flipping a coin and getting heads |\n\n**Example:** Is it certain, likely, unlikely, or impossible?\n- You will eat food today: **Certain**\n- A pig will talk to you: **Impossible**\n- You will see a car on your way home: **Likely**\n- You will find R$100$ on the ground: **Unlikely**'),
  q(5, 'You flip a coin. What is the chance of getting tails?',
    ['Even chance', 'Certain', 'Impossible', 'Unlikely'], 0,
    'A coin has two sides — heads and tails. Each side has an even (equal) chance of landing.'),
  fb(6, 'If something will definitely happen, we say it is ___. If something can never happen, we say it is ___.',
    ['certain', 'impossible'],
    'Certain means it will definitely happen. Impossible means it can never happen.'),
  t(7, '### Simple Experiments\n\n**Experiment 1: Spinning a spinner**\nImagine a spinner with $4$ equal sections coloured red, blue, green, and yellow.\n- The chance of landing on red is $1$ out of $4$ — unlikely but possible.\n- The chance of landing on a colour (any colour) is **certain**.\n\n**Experiment 2: Drawing from a bag**\nA bag has $3$ red balls and $7$ blue balls ($10$ balls total).\n- Is it more likely to draw a red ball or a blue ball? **Blue** — there are more blue balls.\n- Is it possible to draw a green ball? **No** — there are no green balls. It is **impossible**.\n\n**Experiment 3: Rolling a dice**\nA normal dice has the numbers $1, 2, 3, 4, 5, 6$.\n- The chance of rolling a $3$: $1$ out of $6$.\n- The chance of rolling an even number ($2, 4, 6$): $3$ out of $6$ — even chance.\n- The chance of rolling a $7$: **impossible** (no $7$ on a dice).'),
  q(8, 'A bag has $5$ red sweets and $5$ green sweets. You pick one without looking. What is the chance of getting a red sweet?',
    ['Even chance', 'Certain', 'Unlikely', 'Impossible'], 0,
    'There are equal numbers of red and green sweets ($5$ each), so it is an even chance.'),
  t(9, '### Making Predictions\n\n**Prediction** means using data to say what you think will happen.\n\n**Example:** A tuck shop sold these pies over $4$ days:\n- Monday: $20$ pies\n- Tuesday: $18$ pies\n- Wednesday: $22$ pies\n- Thursday: $19$ pies\n\nAbout how many pies will they sell on Friday?\nThe numbers are close to $20$ each day, so a good prediction is about $20$ pies.\n\n**Example:** It is winter in Cape Town. Is it likely or unlikely to rain?\n- Cape Town gets most of its rain in winter, so it is **likely** to rain.\n\n**Remember:** A prediction is not a guess — it is based on data and knowledge!'),
  q(10, 'You roll a dice. Is it certain, likely, unlikely, or impossible to roll a number less than $7$?',
    ['Certain', 'Likely', 'Unlikely', 'Even chance'], 0,
    'A dice has numbers $1$ to $6$. All of them are less than $7$, so it is **certain**.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION — Database insertion
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 4
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 4/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 4:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 4', schoolId: SCHOOL_ID, orderIndex: 4,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 4:', String(GRADE_ID));
  }

  // Find or create Mathematics subject
  const subjectDoc = await db.collection('subjects').findOne({
    name: /^Mathematics$/i,
    schoolId: SCHOOL_ID,
  });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Mathematics subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Mathematics',
      code: 'MATH',
      schoolId: SCHOOL_ID,
      gradeIds: [GRADE_ID],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Mathematics subject:', String(SUBJECT_ID));
  }

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
    tags: ['grade-4', 'mathematics', 'caps'],
    language: 'en',
    status: 'published',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const chapters = [
    {
      title: 'Chapter 1: Whole Numbers',
      description: 'Place value up to 4 digits (thousands), rounding to nearest 10 and 100, ordering, comparing, odd and even numbers, and expanded notation.',
      order: 1,
      lessons: [
        { title: 'Whole Numbers', description: 'Place value up to 4 digits, expanded notation, ordering and comparing numbers, rounding to nearest 10 and 100, odd and even numbers, and counting in intervals.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Addition and Subtraction',
      description: 'Addition and subtraction up to 4 digits, carrying and borrowing, estimation, checking answers with inverse operations, and word problems.',
      order: 2,
      lessons: [
        { title: 'Addition and Subtraction', description: 'Adding and subtracting whole numbers up to 4 digits, carrying and borrowing, estimation, checking with inverse operations, mental maths strategies, and word problems.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Multiplication',
      description: 'Multiplication tables (2–10), multiplying 2-digit by 1-digit numbers, doubling, multiplying by 10 and 100, and word problems.',
      order: 3,
      lessons: [
        { title: 'Multiplication', description: 'Times tables (2–10), multiplying 2-digit by 1-digit numbers, doubling, multiplying by 10 and 100, zero and identity properties, and word problems.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Division',
      description: 'Division with 1-digit divisor, remainders, halving, relationship to multiplication, sharing and grouping, and word problems.',
      order: 4,
      lessons: [
        { title: 'Division', description: 'Sharing and grouping, division with 1-digit divisor, remainders, halving, relationship between multiplication and division, fact families, and word problems.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Common Fractions',
      description: 'Halves, quarters, thirds, fifths, sixths, eighths, fractions of shapes and groups, comparing and ordering fractions, equivalent fractions, and simple addition and subtraction.',
      order: 5,
      lessons: [
        { title: 'Common Fractions', description: 'Recognising fractions (halves, quarters, thirds, fifths, sixths, eighths), fractions of shapes and groups, comparing and ordering, equivalent fractions, and adding and subtracting with same denominator.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Number Patterns',
      description: 'Counting in intervals, describing and extending patterns, input-output tables, geometric patterns, and creating patterns.',
      order: 6,
      lessons: [
        { title: 'Number Patterns', description: 'Counting in intervals, describing and extending numeric patterns, input-output tables, finding rules, geometric patterns, and real-life patterns.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Capacity and Volume',
      description: 'Litres and millilitres, estimating capacity, comparing containers, converting between units, and practical measuring problems.',
      order: 7,
      lessons: [
        { title: 'Capacity and Volume', description: 'Litres and millilitres, conversions, estimating capacity, comparing containers, practical measuring, mixing and pouring, and word problems.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Time',
      description: 'Reading analogue clocks (hours, half hours, quarter hours, 5-minute intervals), calendar reading, days, weeks, months, and elapsed time.',
      order: 8,
      lessons: [
        { title: 'Time', description: 'Reading analogue clocks, 5-minute intervals, days, weeks, months, calendars, elapsed time, timetables, and problem solving with time.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Length',
      description: 'Metres, centimetres, millimetres, measuring with a ruler, estimating length, and conversions between m, cm, and mm.',
      order: 9,
      lessons: [
        { title: 'Length', description: 'Units of length (m, cm, mm), conversions, measuring with a ruler, estimating length, adding and subtracting lengths, and real-life problems.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Mass',
      description: 'Kilograms and grams, estimating mass, reading a scale, comparing mass, and practical problems.',
      order: 10,
      lessons: [
        { title: 'Mass', description: 'Kilograms and grams, conversions, estimating mass, reading scales, comparing and ordering, and practical word problems.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Properties of 2D Shapes',
      description: 'Identifying circles, triangles, squares, rectangles, pentagons, hexagons, sides and corners, straight and curved lines, and symmetry.',
      order: 11,
      lessons: [
        { title: 'Properties of 2D Shapes', description: 'Identifying common 2D shapes, sides and corners, straight and curved lines, types of triangles, comparing shapes, symmetry, and shapes in real life.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Properties of 3D Objects',
      description: 'Identifying cubes, rectangular prisms, spheres, cylinders, cones, faces, edges, vertices, and comparing 3D objects.',
      order: 12,
      lessons: [
        { title: 'Properties of 3D Objects', description: 'Cubes, rectangular prisms, spheres, cylinders, cones, counting faces, edges and vertices, flat and curved surfaces, rolling and stacking, and 3D objects in real life.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Perimeter and Area',
      description: 'Perimeter by counting and measuring, area by counting squares, perimeter and area of rectangles and squares, and comparing shapes.',
      order: 13,
      lessons: [
        { title: 'Perimeter and Area', description: 'Perimeter by adding sides, perimeter of rectangles and squares, area by counting squares, area formula for rectangles, comparing perimeter and area, and word problems.', blocks: ch13_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 14: Data Handling',
      description: 'Collecting data with tally marks, organising in tables, drawing pictographs and bar graphs, reading and interpreting graphs, asking questions about data, and certain, unlikely, and impossible events.',
      order: 14,
      lessons: [
        { title: 'Collecting and Representing Data', description: 'Collecting data with tally marks, organising in tables, drawing pictographs and bar graphs, reading graphs, and choosing the right graph.', blocks: ch14_lesson1, term: 4 },
        { title: 'Reading Graphs and Chance', description: 'Reading and interpreting graphs, asking questions about data, chance and probability language (certain, likely, unlikely, impossible), simple experiments, and making predictions.', blocks: ch14_lesson2, term: 4 },
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

  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 4 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook for Grade 4 Mathematics covering Whole Numbers, Addition and Subtraction, Multiplication, Division, Common Fractions, Number Patterns, Capacity and Volume, Time, Length, Mass, Properties of 2D Shapes, Properties of 3D Objects, Perimeter and Area, and Data Handling.',
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
  console.log('  TEXTBOOK: Grade 4 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
