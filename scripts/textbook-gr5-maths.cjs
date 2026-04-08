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
  t(1, '## Whole Numbers\n\nWhole numbers are $0, 1, 2, 3, 4, 5, \\ldots$ They continue forever.\n\nIn Grade 5 we work with whole numbers up to **6 digits** (hundreds of thousands).\n\n### Place Value up to 6 Digits\n\nEvery digit has a **place value** depending on its position in the number.\n\n| Hundred-thousands | Ten-thousands | Thousands | Hundreds | Tens | Ones |\n|---|---|---|---|---|---|\n| 100 000 | 10 000 | 1 000 | 100 | 10 | 1 |\n\n**Example:** In the number $347\\,582$:\n- The digit $3$ is in the hundred-thousands place — its value is $300\\,000$\n- The digit $4$ is in the ten-thousands place — its value is $40\\,000$\n- The digit $5$ is in the hundreds place — its value is $500$\n\n### Ordering and Comparing\n\nUse the symbols $<$ (less than), $>$ (greater than), and $=$ (equals).\n\n**Example:** Arrange in ascending order: $45\\,230$; $45\\,320$; $45\\,203$\n$$45\\,203 < 45\\,230 < 45\\,320$$\n\n### Odd and Even Numbers\n- **Even numbers** end in $0, 2, 4, 6, 8$. They are divisible by $2$.\n- **Odd numbers** end in $1, 3, 5, 7, 9$. They are not divisible by $2$.'),
  t(2, '### Rounding Off\n\nRounding makes numbers simpler to work with.\n\n**Rules:**\n- Look at the digit to the **right** of the rounding position.\n- If it is **5 or more**, round **up**.\n- If it is **less than 5**, round **down**.\n\n**Examples:**\n- Round $3\\,467$ to the nearest $5$: $3\\,465$ (the $7$ rounds down to $5$) — actually $3\\,467$ is closer to $3\\,465$ than $3\\,470$ — wait, $3\\,467$ rounds to $3\\,465$ to the nearest $5$.\n- Round $1\\,348$ to the nearest $10$: $1\\,350$ (the $8$ rounds up)\n- Round $26\\,540$ to the nearest $100$: $26\\,500$ (the $4$ rounds down)\n- Round $247\\,500$ to the nearest $1\\,000$: $248\\,000$ (the $5$ rounds up)\n\n### Properties of Operations\n\n| Property | Addition | Multiplication |\n|----------|----------|----------------|\n| Commutative | $a + b = b + a$ | $a \\times b = b \\times a$ |\n| Associative | $(a + b) + c = a + (b + c)$ | $(a \\times b) \\times c = a \\times (b \\times c)$ |\n| Distributive | $a \\times (b + c) = a \\times b + a \\times c$ | |\n| Identity | $a + 0 = a$ | $a \\times 1 = a$ |\n\nThe number $0$ is the **additive identity** and $1$ is the **multiplicative identity**.\n\n**Division by zero is undefined** — you can never divide by $0$.'),
  q(3, 'What is the value of the digit $6$ in $162\\,435$?',
    ['$60\\,000$', '$6\\,000$', '$600$', '$600\\,000$'], 0,
    'The $6$ is in the ten-thousands place, so its value is $60\\,000$.'),
  t(4, '### BODMAS — Order of Operations\n\nWhen a calculation has more than one operation, follow the correct order:\n\n1. **B**rackets\n2. **O**rders (powers and roots)\n3. **D**ivision and **M**ultiplication (left to right)\n4. **A**ddition and **S**ubtraction (left to right)\n\n**Example 1:** $5 + 3 \\times 4 = 5 + 12 = 17$ (NOT $32$)\n\n**Example 2:** $(6 + 2) \\times 3 - 1 = 8 \\times 3 - 1 = 24 - 1 = 23$\n\n**Example 3:** $20 - 8 \\div 2 + 3 = 20 - 4 + 3 = 19$\n\n**Common mistake:** Adding before multiplying. Always do multiplication and division before addition and subtraction, unless brackets say otherwise.'),
  q(5, 'Calculate using BODMAS: $4 + 6 \\times 3 - 2$.',
    ['$20$', '$28$', '$22$', '$10$'], 0,
    'Multiplication first: $6 \\times 3 = 18$. Then left to right: $4 + 18 - 2 = 20$.'),
  fb(6, 'The number $438\\,271$ rounded to the nearest thousand is ___. The multiplicative identity is ___.',
    ['438 000', '1'],
    'The hundreds digit is $2$ (less than 5), so round down: $438\\,000$. Multiplying any number by $1$ gives the same number.'),
  t(7, '### Estimation\n\nEstimation helps you check whether your answer is reasonable.\n\n**To estimate:** Round each number, then calculate.\n\n**Example:** Estimate $482 + 319$.\n- Round: $500 + 300 = 800$\n- Exact answer: $482 + 319 = 801$\n- The estimate is close — the answer is reasonable.\n\n**Example:** A school in Soweto orders $23$ cricket bats at R$48$ each. Estimate the total cost.\n- Round: $20 \\times 50 = R1\\,000$\n- Exact: $23 \\times 48 = R1\\,104$\n\n**Estimation is NOT guessing** — it is a careful calculation using rounded numbers.'),
  q(8, 'Is the number $53\\,784$ odd or even?',
    ['Even', 'Odd'], 0,
    'The last digit is $4$, which is even. Therefore $53\\,784$ is an even number.'),
  t(9, '### Problem Solving with Whole Numbers\n\n**Example 1:** The Kruger National Park covers $19\\,485$ square kilometres. Round this to the nearest ten thousand.\n$$20\\,000 \\text{ km}^2$$\n\n**Example 2:** A school in Durban has $1\\,245$ learners. If $648$ are girls, how many are boys?\n$$1\\,245 - 648 = 597 \\text{ boys}$$\n\n**Example 3:** Arrange in descending order: $304\\,560$; $340\\,560$; $304\\,065$\n$$340\\,560 > 304\\,560 > 304\\,065$$'),
  q(10, 'Round $75\\,450$ to the nearest hundred.',
    ['$75\\,500$', '$75\\,400$', '$75\\,000$', '$76\\,000$'], 0,
    'The tens digit is $5$ (5 or more), so round up: $75\\,500$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Addition and Subtraction (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Addition and Subtraction\n\nIn Grade 5 we add and subtract whole numbers up to **5 digits**.\n\n### Addition of Whole Numbers\n\nWhen adding, line up the digits by place value and add from right to left. **Carry** when a column total is 10 or more.\n\n**Example 1:** $34\\,567 + 12\\,345$\n$$34\\,567 + 12\\,345 = 46\\,912$$\n\n**Example 2:** $48\\,756 + 23\\,489$\n$$48\\,756 + 23\\,489 = 72\\,245$$\n\n### Subtraction of Whole Numbers\n\nWhen subtracting, line up the digits and subtract from right to left. **Borrow** when needed.\n\n**Example:** $52\\,403 - 17\\,856$\n$$52\\,403 - 17\\,856 = 34\\,547$$'),
  t(2, '### Inverse Operations\n\nAddition and subtraction are **inverse operations** — they undo each other.\n\n**Checking with inverse:**\n- If $2\\,345 + 1\\,678 = 4\\,023$, then $4\\,023 - 1\\,678 = 2\\,345$ ✓\n- If $8\\,500 - 3\\,200 = 5\\,300$, then $5\\,300 + 3\\,200 = 8\\,500$ ✓\n\n### Estimation for Addition and Subtraction\n\nRound each number, then add or subtract.\n\n**Example:** Estimate $3\\,478 + 2\\,651$\n- Round to nearest thousand: $3\\,000 + 3\\,000 = 6\\,000$\n- Exact: $3\\,478 + 2\\,651 = 6\\,129$\n- The estimate $6\\,000$ is close, so the answer is reasonable.\n\n### Adding More Than Two Numbers\n\n**Example:** $1\\,234 + 2\\,567 + 3\\,199$\n$$= 1\\,234 + 2\\,567 + 3\\,199 = 7\\,000$$'),
  q(3, 'Calculate: $23\\,456 + 14\\,378$.',
    ['$37\\,834$', '$38\\,834$', '$37\\,734$', '$38\\,734$'], 0,
    'Add column by column: $23\\,456 + 14\\,378 = 37\\,834$.'),
  t(4, '### Word Problems — Addition and Subtraction\n\n**Key words for addition:** total, sum, altogether, combined, more than, increase\n\n**Key words for subtraction:** difference, less than, decrease, remain, left over, take away\n\n**Example 1:** A shop in Cape Town sold $12\\,345$ loaves of bread in January and $14\\,567$ loaves in February. How many loaves were sold altogether?\n$$12\\,345 + 14\\,567 = 26\\,912 \\text{ loaves}$$\n\n**Example 2:** A farmer in the Free State has $25\\,000$ hectares. He sells $8\\,750$ hectares. How many hectares remain?\n$$25\\,000 - 8\\,750 = 16\\,250 \\text{ hectares}$$\n\n**Example 3:** A school fundraiser raised R$15\\,680$ on Friday, R$22\\,340$ on Saturday, and R$18\\,475$ on Sunday. What was the total?\n$$15\\,680 + 22\\,340 + 18\\,475 = R56\\,495$$'),
  q(5, 'A library has $42\\,500$ books. If $13\\,875$ books are borrowed, how many remain?',
    ['$28\\,625$', '$29\\,625$', '$28\\,525$', '$56\\,375$'], 0,
    '$42\\,500 - 13\\,875 = 28\\,625$ books remain.'),
  fb(6, 'Addition and subtraction are ___ operations. If $5\\,340 + 2\\,460 = 7\\,800$ then $7\\,800 - 2\\,460 = ___.',
    ['inverse', '5 340'],
    'They undo each other (inverse). Subtracting $2\\,460$ from the sum gives back $5\\,340$.'),
  t(7, '### Breaking Down Numbers (Strategies)\n\nSometimes it helps to break numbers apart.\n\n**Strategy 1: Break apart and add**\n$$2\\,345 + 1\\,567 = 2\\,000 + 1\\,000 + 300 + 500 + 45 + 67 = 3\\,000 + 800 + 112 = 3\\,912$$\n\n**Strategy 2: Add to a round number, then adjust**\n$$4\\,998 + 3\\,456 = 5\\,000 + 3\\,456 - 2 = 8\\,456 - 2 = 8\\,454$$\n\n**Strategy 3: Compensation for subtraction**\n$$7\\,003 - 2\\,997 = 7\\,003 - 3\\,000 + 3 = 4\\,003 + 3 = 4\\,006$$\n\nChoose the strategy that makes the calculation easiest for you.'),
  q(8, 'Calculate: $50\\,000 - 27\\,368$.',
    ['$22\\,632$', '$23\\,632$', '$22\\,732$', '$23\\,732$'], 0,
    '$50\\,000 - 27\\,368 = 22\\,632$. You can check: $22\\,632 + 27\\,368 = 50\\,000$ ✓'),
  t(9, '### Multi-Step Problems\n\n**Example 1:** Thabo has R$5\\,000$. He spends R$1\\,350$ on school shoes and R$2\\,475$ on a school uniform. How much money does he have left?\n$$5\\,000 - 1\\,350 - 2\\,475 = 5\\,000 - 3\\,825 = R1\\,175$$\n\n**Example 2:** A baker in Pretoria bakes $2\\,450$ rolls on Monday and $3\\,120$ on Tuesday. He sells $4\\,380$ rolls during those two days. How many are left?\n$$2\\,450 + 3\\,120 - 4\\,380 = 5\\,570 - 4\\,380 = 1\\,190 \\text{ rolls}$$'),
  q(10, 'Estimate $6\\,789 - 2\\,345$ by rounding to the nearest thousand.',
    ['$5\\,000$', '$4\\,000$', '$4\\,500$', '$3\\,000$'], 0,
    'Round: $7\\,000 - 2\\,000 = 5\\,000$. Exact answer: $6\\,789 - 2\\,345 = 4\\,444$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Multiplication (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Multiplication\n\nIn Grade 5 we multiply **3-digit numbers by 2-digit numbers**.\n\n### Multiplying by 10, 100, and 1 000\n\nThese are the simplest multiplications:\n- Multiply by $10$: write one zero at the end.\n- Multiply by $100$: write two zeros at the end.\n- Multiply by $1\\,000$: write three zeros at the end.\n\n**Examples:**\n$$47 \\times 10 = 470$$\n$$47 \\times 100 = 4\\,700$$\n$$47 \\times 1\\,000 = 47\\,000$$\n$$235 \\times 100 = 23\\,500$$\n\n### Long Multiplication\n\n**Example:** $345 \\times 23$\n\nBreak $23$ into $20 + 3$:\n$$345 \\times 23 = 345 \\times 20 + 345 \\times 3$$\n$$= 6\\,900 + 1\\,035 = 7\\,935$$'),
  t(2, '### Multiplication Strategies\n\n**Strategy 1: Distributive property**\n$$248 \\times 15 = 248 \\times 10 + 248 \\times 5$$\n$$= 2\\,480 + 1\\,240 = 3\\,720$$\n\n**Strategy 2: Doubling and halving**\n$$125 \\times 16 = 250 \\times 8 = 500 \\times 4 = 1\\,000 \\times 2 = 2\\,000$$\n\n**Strategy 3: Rounding and adjusting**\n$$199 \\times 12 = 200 \\times 12 - 1 \\times 12 = 2\\,400 - 12 = 2\\,388$$\n\n### Estimation for Multiplication\n\n**Example:** Estimate $312 \\times 48$.\n- Round: $300 \\times 50 = 15\\,000$\n- Exact: $312 \\times 48 = 14\\,976$\n- The estimate is close — the answer is reasonable.'),
  q(3, 'Calculate: $256 \\times 30$.',
    ['$7\\,680$', '$7\\,580$', '$7\\,780$', '$768$'], 0,
    '$256 \\times 30 = 256 \\times 3 \\times 10 = 768 \\times 10 = 7\\,680$.'),
  t(4, '### Word Problems — Multiplication\n\n**Example 1:** A school in Bloemfontein orders $24$ boxes of pencils. Each box has $144$ pencils. How many pencils in total?\n$$144 \\times 24 = 144 \\times 20 + 144 \\times 4 = 2\\,880 + 576 = 3\\,456 \\text{ pencils}$$\n\n**Example 2:** A minibus taxi from Johannesburg to Polokwane charges R$285$ per passenger. If $15$ passengers travel, how much does the taxi earn?\n$$285 \\times 15 = 285 \\times 10 + 285 \\times 5 = 2\\,850 + 1\\,425 = R4\\,275$$\n\n**Example 3:** A farmer plants $175$ rows of mielies with $32$ plants per row. How many plants altogether?\n$$175 \\times 32 = 175 \\times 30 + 175 \\times 2 = 5\\,250 + 350 = 5\\,600 \\text{ plants}$$'),
  q(5, 'A concert hall has $126$ rows with $45$ seats each. How many seats altogether?',
    ['$5\\,670$', '$5\\,760$', '$5\\,570$', '$5\\,470$'], 0,
    '$126 \\times 45 = 126 \\times 40 + 126 \\times 5 = 5\\,040 + 630 = 5\\,670$ seats.'),
  fb(6, '$347 \\times 100 = $ ___. When we multiply $250 \\times 16$ using doubling and halving, we get $500 \\times$ ___.',
    ['34 700', '8'],
    'Multiply by $100$: add two zeros. Doubling $250$ gives $500$; halving $16$ gives $8$.'),
  t(7, '### Multiplying with Zero and One\n\nRemember these special rules:\n- **Any number $\\times$ 0 = 0** (the zero property)\n- **Any number $\\times$ 1 = the number itself** (the identity property)\n\n**Example:** $456 \\times 0 = 0$\n\n**Example:** $789 \\times 1 = 789$\n\n### The Commutative Property\n\nThe order of multiplication does not matter:\n$$12 \\times 35 = 35 \\times 12 = 420$$\n\nThis is useful when one order is easier to calculate than the other.'),
  q(8, 'Estimate $489 \\times 21$ by rounding to the nearest ten.',
    ['$10\\,000$', '$9\\,000$', '$10\\,500$', '$9\\,500$'], 0,
    'Round: $490 \\times 20 = 9\\,800$. Or $500 \\times 20 = 10\\,000$. Exact: $489 \\times 21 = 10\\,269$. The closest estimate is $10\\,000$.'),
  t(9, '### More Practice\n\n**Example 1:** Calculate $365 \\times 12$.\n$$365 \\times 12 = 365 \\times 10 + 365 \\times 2 = 3\\,650 + 730 = 4\\,380$$\nThis is the number of days in $12$ non-leap years.\n\n**Example 2:** A school tuck shop sells $135$ packets of chips per day. How many packets in a $22$-day school month?\n$$135 \\times 22 = 135 \\times 20 + 135 \\times 2 = 2\\,700 + 270 = 2\\,970 \\text{ packets}$$'),
  q(10, 'Calculate: $408 \\times 25$.',
    ['$10\\,200$', '$10\\,000$', '$10\\,100$', '$10\\,300$'], 0,
    '$408 \\times 25 = 408 \\times 100 \\div 4 = 40\\,800 \\div 4 = 10\\,200$. Or: $400 \\times 25 + 8 \\times 25 = 10\\,000 + 200 = 10\\,200$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Division (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Division\n\nIn Grade 5 we divide **3-digit numbers by 2-digit numbers**.\n\nDivision is the inverse of multiplication. If $12 \\times 5 = 60$, then $60 \\div 5 = 12$ and $60 \\div 12 = 5$.\n\n### Division with Remainders\n\nWhen a number does not divide evenly, there is a **remainder**.\n\n**Example:** $157 \\div 12$\n$$12 \\times 13 = 156$$\n$$157 \\div 12 = 13 \\text{ remainder } 1$$\nWe write: $157 = 12 \\times 13 + 1$\n\n**Check:** $12 \\times 13 + 1 = 156 + 1 = 157$ ✓\n\n### Long Division\n\n**Example:** $864 \\div 24$\n- $24 \\times 3 = 72$ (into $86$), remainder $14$\n- Bring down $4$: $144$\n- $24 \\times 6 = 144$, remainder $0$\n- Answer: $36$'),
  t(2, '### Relationship Between Multiplication and Division\n\nEvery multiplication fact gives two division facts:\n$$15 \\times 8 = 120$$\n$$120 \\div 8 = 15$$\n$$120 \\div 15 = 8$$\n\nYou can use multiplication to check your division.\n\n### Dividing by 10, 100, and 1 000\n\nThese are the simplest divisions:\n- Divide by $10$: remove one zero from the end.\n- Divide by $100$: remove two zeros.\n- Divide by $1\\,000$: remove three zeros.\n\n**Examples:**\n$$4\\,500 \\div 10 = 450$$\n$$23\\,000 \\div 100 = 230$$\n$$56\\,000 \\div 1\\,000 = 56$$\n\n**What if there are no zeros?** Use long division.\n$$475 \\div 10 = 47 \\text{ remainder } 5 \\quad \\text{or} \\quad 47{,}5$$'),
  q(3, 'Calculate: $756 \\div 18$.',
    ['$42$', '$43$', '$41$', '$44$'], 0,
    '$18 \\times 42 = 756$. So $756 \\div 18 = 42$.'),
  t(4, '### Word Problems — Division\n\n**Example 1:** A school in Mpumalanga has $672$ learners shared equally among $21$ classes. How many learners per class?\n$$672 \\div 21 = 32 \\text{ learners per class}$$\n\n**Example 2:** Gogo bakes $250$ koeksisters for a church bazaar. She packs them in bags of $12$. How many full bags can she make? How many are left over?\n$$250 \\div 12 = 20 \\text{ remainder } 10$$\nShe makes $20$ full bags with $10$ koeksisters left over.\n\n**Example 3:** A farmer earns R$9\\,450$ for selling mielies. He shares the money equally among $15$ workers. How much does each worker get?\n$$R9\\,450 \\div 15 = R630 \\text{ per worker}$$'),
  q(5, 'Thandi has $945$ stickers to share equally among $27$ friends. How many stickers does each friend get?',
    ['$35$', '$34$', '$36$', '$33$'], 0,
    '$945 \\div 27 = 35$. Check: $27 \\times 35 = 945$ ✓'),
  fb(6, '$480 \\div 16 = $ ___. Division is the inverse of ___.',
    ['30', 'multiplication'],
    '$16 \\times 30 = 480$, so $480 \\div 16 = 30$. Division undoes multiplication.'),
  t(7, '### Division Strategies\n\n**Strategy 1: Halving**\nIf the divisor is even, halve both numbers:\n$$800 \\div 32 = 400 \\div 16 = 200 \\div 8 = 25$$\n\n**Strategy 2: Using known facts**\n$$525 \\div 25 = ?$$\nWe know $25 \\times 4 = 100$, so $25 \\times 20 = 500$.\n$525 - 500 = 25$, and $25 \\div 25 = 1$.\nSo $525 \\div 25 = 21$.\n\n**Strategy 3: Estimation first**\n$$891 \\div 33$$\nEstimate: $900 \\div 30 = 30$. Try $33 \\times 27 = 891$. So the answer is $27$.'),
  q(8, 'A bus carries $52$ passengers. How many buses are needed for $780$ passengers?',
    ['$15$', '$14$', '$16$', '$13$'], 0,
    '$780 \\div 52 = 15$ buses exactly.'),
  t(9, '### Remainders in Context\n\nThe remainder changes how you answer the question:\n\n**Example 1 — Round up:** $170$ learners need to cross a river. Each boat holds $24$ learners. How many boats?\n$$170 \\div 24 = 7 \\text{ remainder } 2$$\nYou need **8 boats** (7 full + 1 for the remaining 2).\n\n**Example 2 — Round down:** A baker has $500$g of flour. Each scone uses $35$g. How many scones can she make?\n$$500 \\div 35 = 14 \\text{ remainder } 10$$\nShe can make **14 scones** (the leftover flour is not enough for another).\n\n**Think about what the remainder means in the real world!**'),
  q(10, '$850 \\div 40$ equals:',
    ['$21$ remainder $10$', '$22$ remainder $10$', '$21$ remainder $20$', '$20$ remainder $50$'], 0,
    '$40 \\times 21 = 840$. $850 - 840 = 10$. So $850 \\div 40 = 21$ remainder $10$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Common Fractions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Common Fractions\n\nA **fraction** shows a part of a whole. It is written as $\\frac{a}{b}$, where:\n- $a$ is the **numerator** (how many parts you have)\n- $b$ is the **denominator** (how many equal parts the whole is divided into)\n\n### Recognising Fractions\n\nIf a pizza is cut into $8$ equal slices and you eat $3$, you have eaten $\\frac{3}{8}$ of the pizza.\n\n### Comparing Fractions\n\n**Same denominator:** Compare the numerators.\n$$\\frac{5}{8} > \\frac{3}{8} \\quad \\text{(because } 5 > 3\\text{)}$$\n\n**Different denominators:** Find a common denominator.\n$$\\frac{2}{3} \\text{ and } \\frac{3}{5}$$\nCommon denominator: $15$.\n$$\\frac{2}{3} = \\frac{10}{15} \\quad \\text{and} \\quad \\frac{3}{5} = \\frac{9}{15}$$\nSo $\\frac{2}{3} > \\frac{3}{5}$.'),
  t(2, '### Equivalent Fractions\n\nEquivalent fractions have the **same value**. Multiply or divide both numerator and denominator by the same number.\n\n$$\\frac{1}{2} = \\frac{2}{4} = \\frac{3}{6} = \\frac{4}{8} = \\frac{5}{10}$$\n\n**Example:** Write three fractions equivalent to $\\frac{3}{4}$:\n$$\\frac{3}{4} = \\frac{6}{8} = \\frac{9}{12} = \\frac{12}{16}$$\n\n### Addition and Subtraction with the Same Denominator\n\nWhen fractions have the **same denominator**, just add or subtract the numerators.\n\n$$\\frac{2}{7} + \\frac{3}{7} = \\frac{5}{7}$$\n$$\\frac{5}{9} - \\frac{2}{9} = \\frac{3}{9} = \\frac{1}{3}$$\n\n**Always simplify** your answer if possible!'),
  q(3, 'Which fraction is equivalent to $\\frac{2}{5}$?',
    ['$\\frac{6}{15}$', '$\\frac{4}{15}$', '$\\frac{3}{5}$', '$\\frac{2}{10}$'], 0,
    '$\\frac{2}{5} = \\frac{2 \\times 3}{5 \\times 3} = \\frac{6}{15}$.'),
  t(4, '### Fractions of Whole Numbers\n\nTo find a fraction of a whole number, **multiply**.\n\n**Example 1:** What is $\\frac{3}{4}$ of R$80$?\n$$\\frac{3}{4} \\times 80 = \\frac{3 \\times 80}{4} = \\frac{240}{4} = R60$$\n\n**Example 2:** A class in Nelspruit has $36$ learners. $\\frac{2}{3}$ of them play soccer. How many play soccer?\n$$\\frac{2}{3} \\times 36 = \\frac{72}{3} = 24 \\text{ learners}$$\n\n**Example 3:** Mama buys $500$g of biltong. She gives $\\frac{1}{5}$ to her neighbour. How much does she give?\n$$\\frac{1}{5} \\times 500 = 100\\text{g}$$'),
  q(5, 'Calculate: $\\frac{4}{9} + \\frac{2}{9}$.',
    ['$\\frac{6}{9}$', '$\\frac{6}{18}$', '$\\frac{2}{3}$', '$\\frac{8}{9}$'], 0,
    '$\\frac{4}{9} + \\frac{2}{9} = \\frac{6}{9} = \\frac{2}{3}$. Both answers $\\frac{6}{9}$ and $\\frac{2}{3}$ are correct, but simplified is $\\frac{2}{3}$.', ['Add the numerators and keep the denominator the same.']),
  fb(6, 'In the fraction $\\frac{5}{8}$, the numerator is ___ and the denominator is ___.',
    ['5', '8'],
    'The top number ($5$) is the numerator; the bottom number ($8$) is the denominator.'),
  t(7, '### Ordering Fractions\n\nTo arrange fractions in order, convert them to the same denominator.\n\n**Example:** Arrange from smallest to largest: $\\frac{1}{2}, \\frac{2}{5}, \\frac{3}{10}$\n\nCommon denominator: $10$.\n$$\\frac{1}{2} = \\frac{5}{10}, \\quad \\frac{2}{5} = \\frac{4}{10}, \\quad \\frac{3}{10} = \\frac{3}{10}$$\n\nOrder: $\\frac{3}{10} < \\frac{2}{5} < \\frac{1}{2}$\n\n### Unit Fractions\n\nA **unit fraction** has $1$ as the numerator: $\\frac{1}{2}, \\frac{1}{3}, \\frac{1}{4}, \\frac{1}{5}, \\ldots$\n\nThe bigger the denominator, the **smaller** the fraction:\n$$\\frac{1}{2} > \\frac{1}{3} > \\frac{1}{4} > \\frac{1}{5} > \\frac{1}{10}$$'),
  q(8, 'What is $\\frac{2}{5}$ of $R150$?',
    ['$R60$', '$R75$', '$R30$', '$R50$'], 0,
    '$\\frac{2}{5} \\times 150 = \\frac{300}{5} = R60$.'),
  t(9, '### Subtraction with Same Denominator — Word Problems\n\n**Example 1:** Sipho drinks $\\frac{5}{8}$ of a litre of juice. His sister drinks $\\frac{2}{8}$. How much more did Sipho drink?\n$$\\frac{5}{8} - \\frac{2}{8} = \\frac{3}{8} \\text{ of a litre}$$\n\n**Example 2:** A recipe needs $\\frac{7}{10}$ of a cup of sugar. Naledi has already added $\\frac{4}{10}$. How much more does she need?\n$$\\frac{7}{10} - \\frac{4}{10} = \\frac{3}{10} \\text{ of a cup}$$'),
  q(10, 'Which is the smallest fraction: $\\frac{1}{3}$, $\\frac{1}{6}$, or $\\frac{1}{4}$?',
    ['$\\frac{1}{6}$', '$\\frac{1}{3}$', '$\\frac{1}{4}$', 'They are all equal'], 0,
    'For unit fractions, the larger the denominator, the smaller the fraction. $\\frac{1}{6}$ is the smallest.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Decimal Fractions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Decimal Fractions\n\nA **decimal fraction** uses a comma (in South Africa) to separate the whole-number part from the fraction part.\n\n### Place Value to Hundredths\n\n| Tens | Ones | , | Tenths | Hundredths |\n|------|------|---|--------|------------|\n| 10 | 1 | , | $\\frac{1}{10}$ | $\\frac{1}{100}$ |\n\n**Example:** The number $23{,}45$ means:\n$$23{,}45 = 20 + 3 + \\frac{4}{10} + \\frac{5}{100} = 23 + 0{,}4 + 0{,}05$$\n\n### Writing Fractions as Decimals\n\n$$\\frac{1}{10} = 0{,}1 \\qquad \\frac{3}{10} = 0{,}3 \\qquad \\frac{7}{10} = 0{,}7$$\n$$\\frac{1}{100} = 0{,}01 \\qquad \\frac{25}{100} = 0{,}25 \\qquad \\frac{50}{100} = 0{,}50 = 0{,}5$$\n\n### Writing Decimals as Fractions\n\n$$0{,}6 = \\frac{6}{10} = \\frac{3}{5} \\qquad 0{,}75 = \\frac{75}{100} = \\frac{3}{4}$$'),
  t(2, '### Ordering Decimals\n\nCompare digit by digit from left to right.\n\n**Example:** Arrange in ascending order: $3{,}45$; $3{,}54$; $3{,}05$\n- All have $3$ ones\n- Tenths: $0 < 4 < 5$\n$$3{,}05 < 3{,}45 < 3{,}54$$\n\n**Tip:** Add zeros to make the same number of decimal places:\n$3{,}5 = 3{,}50$ and $3{,}05$ — now compare $50$ and $05$.\n\n### Addition and Subtraction of Decimals\n\nLine up the decimal commas!\n\n**Example 1:** $4{,}35 + 2{,}48$\n$$4{,}35 + 2{,}48 = 6{,}83$$\n\n**Example 2:** $10{,}00 - 3{,}67$\n$$10{,}00 - 3{,}67 = 6{,}33$$\n\n**Example 3:** $15{,}8 + 3{,}25$\nFirst write $15{,}80$:\n$$15{,}80 + 3{,}25 = 19{,}05$$'),
  q(3, 'What is $0{,}3 + 0{,}45$?',
    ['$0{,}75$', '$0{,}48$', '$0{,}35$', '$0{,}8$'], 0,
    'Write $0{,}3$ as $0{,}30$. Then $0{,}30 + 0{,}45 = 0{,}75$.'),
  t(4, '### Conversions Between Fractions, Decimals, and Percentages\n\nPercentage means "out of $100$".\n\n| Fraction | Decimal | Percentage |\n|----------|---------|------------|\n| $\\frac{1}{2}$ | $0{,}5$ | $50\\%$ |\n| $\\frac{1}{4}$ | $0{,}25$ | $25\\%$ |\n| $\\frac{3}{4}$ | $0{,}75$ | $75\\%$ |\n| $\\frac{1}{5}$ | $0{,}2$ | $20\\%$ |\n| $\\frac{1}{10}$ | $0{,}1$ | $10\\%$ |\n\n**Fraction → Decimal:** Divide the numerator by the denominator.\n$$\\frac{3}{4} = 3 \\div 4 = 0{,}75$$\n\n**Decimal → Percentage:** Multiply by $100$.\n$$0{,}35 \\times 100 = 35\\%$$\n\n**Percentage → Decimal:** Divide by $100$.\n$$60\\% = 60 \\div 100 = 0{,}6$$'),
  q(5, 'Convert $\\frac{3}{5}$ to a decimal.',
    ['$0{,}6$', '$0{,}35$', '$0{,}53$', '$0{,}06$'], 0,
    '$3 \\div 5 = 0{,}6$.'),
  fb(6, 'The decimal $0{,}75$ written as a fraction is ___. Written as a percentage it is ___.',
    ['3/4', '75%'],
    '$0{,}75 = \\frac{75}{100} = \\frac{3}{4}$. As a percentage: $0{,}75 \\times 100 = 75\\%$.'),
  t(7, '### Money and Decimals\n\nSouth African Rands use decimals:\n$$R25{,}50 = 25 \\text{ rand and } 50 \\text{ cents}$$\n\n**Example 1:** Sipho buys a pen for R$12{,}95$ and a ruler for R$8{,}50$. How much does he pay?\n$$R12{,}95 + R8{,}50 = R21{,}45$$\n\n**Example 2:** Naledi has R$50{,}00$. She buys juice for R$14{,}75$. How much change?\n$$R50{,}00 - R14{,}75 = R35{,}25$$\n\n**Example 3:** Three friends share a bill of R$87{,}60$ equally. How much each?\n$$R87{,}60 \\div 3 = R29{,}20$$'),
  q(8, 'Arrange in ascending order: $2{,}09$; $2{,}9$; $2{,}19$.',
    ['$2{,}09 < 2{,}19 < 2{,}9$', '$2{,}9 < 2{,}19 < 2{,}09$', '$2{,}09 < 2{,}9 < 2{,}19$', '$2{,}19 < 2{,}09 < 2{,}9$'], 0,
    'Write as $2{,}09$; $2{,}90$; $2{,}19$. Compare hundredths: $09 < 19 < 90$.'),
  t(9, '### Problem Solving with Decimals\n\n**Example 1:** A runner in the Comrades Marathon completes $10{,}5$ km in the first hour and $9{,}75$ km in the second hour. How far has she run?\n$$10{,}50 + 9{,}75 = 20{,}25 \\text{ km}$$\n\n**Example 2:** A bottle holds $1{,}5$ litres of cooldrink. After pouring out $0{,}65$ litres, how much remains?\n$$1{,}50 - 0{,}65 = 0{,}85 \\text{ litres}$$'),
  q(10, 'What is $7{,}2 - 3{,}85$?',
    ['$3{,}35$', '$3{,}45$', '$4{,}35$', '$3{,}25$'], 0,
    'Write $7{,}2$ as $7{,}20$. Then $7{,}20 - 3{,}85 = 3{,}35$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Number Patterns (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Number Patterns\n\nA **number pattern** (or **sequence**) is a list of numbers that follows a rule.\n\n### Constant Difference\n\nIf the same number is added or subtracted each time, the pattern has a **constant difference**.\n\n**Example 1:** $5, 9, 13, 17, 21, \\ldots$\n- Rule: Start at $5$, add $4$ each time.\n- Constant difference: $+4$\n- Next terms: $25, 29, 33$\n\n**Example 2:** $80, 73, 66, 59, \\ldots$\n- Rule: Start at $80$, subtract $7$ each time.\n- Constant difference: $-7$\n- Next terms: $52, 45, 38$\n\n### Finding the Rule\n\n1. Find the difference between consecutive terms.\n2. Check if the difference is always the same.\n3. Describe: "Start at ___, add/subtract ___ each time."'),
  t(2, '### Input-Output Tables\n\nA rule connects **input** values to **output** values.\n\n**Example:** Find the rule.\n\n| Input | 1 | 2 | 3 | 4 | 5 |\n|-------|---|---|---|---|---|\n| Output | 5 | 8 | 11 | 14 | 17 |\n\nDifference between outputs: $3$.\nWhen input $= 1$: output $= 5 = 3 \\times 1 + 2$.\n\n**Rule:** Output $= 3 \\times \\text{input} + 2$\n\n**Check:** Input $= 4$: $3 \\times 4 + 2 = 14$ ✓\n\n### Creating Your Own Patterns\n\nYou can make a pattern with any starting number and rule:\n- Start at $100$, subtract $8$: $100, 92, 84, 76, 68, \\ldots$\n- Start at $3$, add $5$: $3, 8, 13, 18, 23, \\ldots$'),
  q(3, 'What is the next number in the pattern $12, 19, 26, 33, \\ldots$?',
    ['$40$', '$39$', '$41$', '$38$'], 0,
    'The constant difference is $+7$. Next: $33 + 7 = 40$.'),
  t(4, '### Extending Patterns\n\n**Example:** The pattern is $4, 7, 10, 13, \\ldots$\n\nFind the 10th term.\n\n**Method 1 — List all terms:** $4, 7, 10, 13, 16, 19, 22, 25, 28, 31$. The 10th term is $31$.\n\n**Method 2 — Use a formula:**\n- Start at $4$, add $3$ each time.\n- Term $n = 4 + (n - 1) \\times 3 = 4 + 3n - 3 = 3n + 1$\n- Term $10 = 3 \\times 10 + 1 = 31$ ✓\n\n### Patterns in Real Life\n\n**Example:** A taxi rank in Tshwane has rows of seats. Row 1 has $8$ seats, Row 2 has $11$ seats, Row 3 has $14$ seats.\n- Rule: Start at $8$, add $3$.\n- Row $7$: $8 + (7 - 1) \\times 3 = 8 + 18 = 26$ seats.'),
  q(5, 'Find the rule: Input $1 \\to 4$, Input $2 \\to 7$, Input $3 \\to 10$, Input $4 \\to 13$.',
    ['Output $= 3 \\times$ input $+ 1$', 'Output $= 4 \\times$ input', 'Output $= 2 \\times$ input $+ 2$', 'Output $= 3 \\times$ input $- 1$'], 0,
    'Difference is $3$. When input $= 1$: $3 \\times 1 + 1 = 4$ ✓. When input $= 2$: $3 \\times 2 + 1 = 7$ ✓.'),
  fb(6, 'In the pattern $50, 44, 38, 32, \\ldots$ the constant difference is ___. The next term is ___.',
    ['-6', '26'],
    'Each term decreases by $6$. Next: $32 - 6 = 26$.'),
  t(7, '### Patterns That Are Not Constant Difference\n\nSome patterns do not have a constant difference.\n\n**Example 1 — Doubling:** $2, 4, 8, 16, 32, \\ldots$\n- Rule: Multiply by $2$ each time.\n- Next: $64, 128$\n\n**Example 2 — Square numbers:** $1, 4, 9, 16, 25, \\ldots$\n- These are $1^2, 2^2, 3^2, 4^2, 5^2, \\ldots$\n- Next: $36, 49$\n\n**Example 3 — Triangular numbers:** $1, 3, 6, 10, 15, 21, \\ldots$\n- Differences: $+2, +3, +4, +5, +6, \\ldots$ (increasing by $1$)\n\nAlways check whether the difference is constant. If not, look for another pattern.'),
  q(8, 'What is the 8th term in the pattern $2, 4, 8, 16, \\ldots$?',
    ['$256$', '$128$', '$64$', '$512$'], 0,
    'Each term doubles. Terms: $2, 4, 8, 16, 32, 64, 128, 256$. The 8th term is $256$.'),
  t(9, '### Completing Input-Output Tables\n\n**Example:** Complete the table. Rule: Output $= 2 \\times$ input $+ 5$.\n\n| Input | 3 | 5 | 8 | 10 | 15 |\n|-------|---|---|---|----|----|---|\n| Output | $11$ | $15$ | $21$ | $25$ | $35$ |\n\nCheck: $2 \\times 3 + 5 = 11$ ✓, $2 \\times 15 + 5 = 35$ ✓\n\n**Finding the input from the output:**\nIf Output $= 2 \\times$ input $+ 5$ and Output $= 19$:\n$$19 = 2 \\times \\text{input} + 5$$\n$$2 \\times \\text{input} = 14$$\n$$\\text{input} = 7$$'),
  q(10, 'The pattern is: $3, 8, 13, 18, \\ldots$ What is the 7th term?',
    ['$33$', '$28$', '$38$', '$35$'], 0,
    'Rule: Start at $3$, add $5$. Term $7 = 3 + (7 - 1) \\times 5 = 3 + 30 = 33$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Capacity and Volume (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Capacity and Volume\n\n**Volume** is the amount of space an object takes up.\n\n**Capacity** is how much liquid a container can hold.\n\n### Units of Capacity\n\n| Unit | Symbol | Equivalent |\n|------|--------|------------|\n| Litre | $\\ell$ | $1\\,\\ell = 1\\,000\\,\\text{m}\\ell$ |\n| Millilitre | $\\text{m}\\ell$ | $1\\,\\text{m}\\ell = \\frac{1}{1\\,000}$ of a litre |\n\n### Conversions\n\n$$\\text{litres} \\to \\text{millilitres: multiply by } 1\\,000$$\n$$\\text{millilitres} \\to \\text{litres: divide by } 1\\,000$$\n\n**Examples:**\n$$2{,}5\\,\\ell = 2{,}5 \\times 1\\,000 = 2\\,500\\,\\text{m}\\ell$$\n$$750\\,\\text{m}\\ell = 750 \\div 1\\,000 = 0{,}75\\,\\ell$$'),
  t(2, '### Estimating Capacity\n\nIt helps to know common capacities:\n- A teaspoon: about $5\\,\\text{m}\\ell$\n- A cup: about $250\\,\\text{m}\\ell$\n- A cooldrink can: $340\\,\\text{m}\\ell$\n- A water bottle: $500\\,\\text{m}\\ell$ or $1\\,\\ell$\n- A large milk carton: $2\\,\\ell$\n- A bucket: about $10\\,\\ell$\n- A bath: about $150\\,\\ell$\n\n### Choosing the Right Unit\n\n- Use **millilitres** for small amounts (medicine, a spoon, a cup).\n- Use **litres** for large amounts (a pool, a tank, a bucket).\n\n**Example:** Would you use $\\text{m}\\ell$ or $\\ell$ to measure:\n- The water in a swimming pool? → $\\ell$ (or kilolitres)\n- Medicine in a syringe? → $\\text{m}\\ell$'),
  q(3, 'Convert $3{,}25\\,\\ell$ to millilitres.',
    ['$3\\,250\\,\\text{m}\\ell$', '$325\\,\\text{m}\\ell$', '$32\\,500\\,\\text{m}\\ell$', '$32{,}5\\,\\text{m}\\ell$'], 0,
    '$3{,}25 \\times 1\\,000 = 3\\,250\\,\\text{m}\\ell$.'),
  t(4, '### Practical Problems\n\n**Example 1:** A recipe for vetkoek needs $500\\,\\text{m}\\ell$ of milk. How many litres is that?\n$$500 \\div 1\\,000 = 0{,}5\\,\\ell$$\n\n**Example 2:** Mama buys three $2\\,\\ell$ bottles of cooldrink for a braai. How many $250\\,\\text{m}\\ell$ cups can she fill?\n$$3 \\times 2\\,\\ell = 6\\,\\ell = 6\\,000\\,\\text{m}\\ell$$\n$$6\\,000 \\div 250 = 24 \\text{ cups}$$\n\n**Example 3:** A water tank holds $500\\,\\ell$. If a family uses $85\\,\\ell$ per day, how many full days will the water last?\n$$500 \\div 85 = 5 \\text{ remainder } 75$$\nThe water lasts **5 full days**.'),
  q(5, 'How many $500\\,\\text{m}\\ell$ bottles can be filled from a $10\\,\\ell$ container?',
    ['$20$', '$10$', '$50$', '$5$'], 0,
    '$10\\,\\ell = 10\\,000\\,\\text{m}\\ell$. $10\\,000 \\div 500 = 20$ bottles.'),
  fb(6, '$4\\,500\\,\\text{m}\\ell = $ ___ $\\ell$. A standard cup holds about ___ $\\text{m}\\ell$.',
    ['4,5', '250'],
    '$4\\,500 \\div 1\\,000 = 4{,}5\\,\\ell$. A standard measuring cup is $250\\,\\text{m}\\ell$.'),
  t(7, '### Volume of Rectangular Containers\n\nThe volume of a rectangular container (box shape) can be found by counting layers of cubes or using the formula:\n\n$$\\text{Volume} = \\text{length} \\times \\text{width} \\times \\text{height}$$\n\n**Example:** A fish tank is $50\\,\\text{cm}$ long, $30\\,\\text{cm}$ wide, and $40\\,\\text{cm}$ high.\n$$\\text{Volume} = 50 \\times 30 \\times 40 = 60\\,000\\,\\text{cm}^3$$\n\n**Connection:** $1\\,000\\,\\text{cm}^3 = 1\\,\\ell$\n\nSo the fish tank holds: $60\\,000 \\div 1\\,000 = 60\\,\\ell$\n\n**Note:** Volume uses **cubic** units ($\\text{cm}^3$), while capacity uses $\\ell$ and $\\text{m}\\ell$.'),
  q(8, 'A box is $10\\,\\text{cm}$ long, $8\\,\\text{cm}$ wide, and $5\\,\\text{cm}$ high. What is its volume?',
    ['$400\\,\\text{cm}^3$', '$200\\,\\text{cm}^3$', '$800\\,\\text{cm}^3$', '$46\\,\\text{cm}^3$'], 0,
    'Volume $= 10 \\times 8 \\times 5 = 400\\,\\text{cm}^3$.'),
  t(9, '### More Practice\n\n**Example 1:** A jug holds $1{,}5\\,\\ell$. Thabo fills $3$ glasses of $200\\,\\text{m}\\ell$ each. How much is left in the jug?\n$$1{,}5\\,\\ell = 1\\,500\\,\\text{m}\\ell$$\n$$3 \\times 200 = 600\\,\\text{m}\\ell$$\n$$1\\,500 - 600 = 900\\,\\text{m}\\ell = 0{,}9\\,\\ell$$\n\n**Example 2:** A rectangular container is $20\\,\\text{cm} \\times 15\\,\\text{cm} \\times 10\\,\\text{cm}$. How many litres does it hold?\n$$20 \\times 15 \\times 10 = 3\\,000\\,\\text{cm}^3 = 3\\,\\ell$$'),
  q(10, 'Which is more: $2{,}3\\,\\ell$ or $2\\,250\\,\\text{m}\\ell$?',
    ['$2{,}3\\,\\ell$', '$2\\,250\\,\\text{m}\\ell$', 'They are equal', 'Cannot compare'], 0,
    '$2{,}3\\,\\ell = 2\\,300\\,\\text{m}\\ell$. Since $2\\,300 > 2\\,250$, $2{,}3\\,\\ell$ is more.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Time (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Time\n\n### Analogue and Digital Clocks\n\nAn **analogue clock** has hands (hour, minute, sometimes second). A **digital clock** shows the time as numbers.\n\n**Reading analogue time:**\n- The **short** hand shows the hour.\n- The **long** hand shows the minutes.\n- Each number on the clock face represents $5$ minutes.\n\n**Example:** If the minute hand points to $3$ and the hour hand is between $7$ and $8$, the time is $7$:$15$ or "quarter past seven".\n\n### 24-Hour Time\n\nThe 24-hour clock runs from $00$:$00$ (midnight) to $23$:$59$.\n\n| 12-hour | 24-hour |\n|---------|----------|\n| 12:00 a.m. (midnight) | 00:00 |\n| 7:30 a.m. | 07:30 |\n| 12:00 p.m. (noon) | 12:00 |\n| 3:45 p.m. | 15:45 |\n| 9:15 p.m. | 21:15 |\n| 11:59 p.m. | 23:59 |\n\n**To convert p.m. to 24-hour:** Add $12$ to the hour.\n**To convert 24-hour to p.m.:** Subtract $12$ from the hour.'),
  t(2, '### Elapsed Time\n\n**Elapsed time** is the time that passes between two events.\n\n**Method:** Count forward from the start time to the end time.\n\n**Example 1:** A movie starts at $14$:$30$ and ends at $16$:$45$. How long is it?\n- From $14$:$30$ to $16$:$30$ = $2$ hours\n- From $16$:$30$ to $16$:$45$ = $15$ minutes\n- Total: $2$ hours $15$ minutes\n\n**Example 2:** Thabo leaves home at $06$:$45$ and arrives at school at $07$:$20$. How long is his journey?\n- From $06$:$45$ to $07$:$00$ = $15$ minutes\n- From $07$:$00$ to $07$:$20$ = $20$ minutes\n- Total: $35$ minutes\n\n### Units of Time\n\n| Unit | Equivalent |\n|------|------------|\n| 1 minute | 60 seconds |\n| 1 hour | 60 minutes |\n| 1 day | 24 hours |\n| 1 week | 7 days |\n| 1 year | 365 days (366 in a leap year) |\n| 1 year | 12 months |'),
  q(3, 'Convert $3$:$45$ p.m. to 24-hour time.',
    ['$15$:$45$', '$03$:$45$', '$14$:$45$', '$16$:$45$'], 0,
    'Add $12$ to the hour: $3 + 12 = 15$. So $3$:$45$ p.m. $= 15$:$45$.'),
  t(4, '### Calendars\n\n**Days in each month (use the knuckle method):**\n\n| Month | Days |\n|-------|------|\n| January | 31 |\n| February | 28 (29 in a leap year) |\n| March | 31 |\n| April | 30 |\n| May | 31 |\n| June | 30 |\n| July | 31 |\n| August | 31 |\n| September | 30 |\n| October | 31 |\n| November | 30 |\n| December | 31 |\n\n**Leap years** happen every $4$ years (2024, 2028, ...). February has $29$ days in a leap year.\n\n**Example:** How many days from 15 March to 10 April?\n- March: $31 - 15 = 16$ days remaining\n- April: $10$ days\n- Total: $16 + 10 = 26$ days'),
  q(5, 'A cricket match starts at $10$:$15$ and lasts $3$ hours $40$ minutes. When does it end?',
    ['$13$:$55$', '$14$:$05$', '$13$:$45$', '$14$:$15$'], 0,
    'Start: $10$:$15$. Add $3$ hours: $13$:$15$. Add $40$ minutes: $13$:$55$.'),
  fb(6, 'There are ___ minutes in an hour. The 24-hour time for $8$:$30$ p.m. is ___.',
    ['60', '20:30'],
    '$1$ hour $= 60$ minutes. $8 + 12 = 20$, so $8$:$30$ p.m. $= 20$:$30$.'),
  t(7, '### Timetables\n\nA **timetable** shows scheduled times for events.\n\n**Example — School timetable:**\n\n| Period | Start | End | Subject |\n|--------|-------|-----|---------|\n| 1 | 07:45 | 08:30 | Mathematics |\n| 2 | 08:30 | 09:15 | English |\n| Break | 09:15 | 09:45 | — |\n| 3 | 09:45 | 10:30 | Life Skills |\n| 4 | 10:30 | 11:15 | Afrikaans |\n\nEach period lasts $45$ minutes. Break is $30$ minutes.\n\n**Example — Bus timetable:**\n\n| Stop | Depart |\n|------|--------|\n| Pretoria Station | 06:00 |\n| Centurion | 06:25 |\n| Midrand | 06:50 |\n| Sandton | 07:10 |\n\nTravel time from Pretoria to Sandton: $07$:$10 - 06$:$00 = 1$ hour $10$ minutes.'),
  q(8, 'How many days are in September, October, and November combined?',
    ['$91$', '$90$', '$92$', '$89$'], 0,
    'September: $30$ + October: $31$ + November: $30$ = $91$ days.'),
  t(9, '### Problem Solving with Time\n\n**Example 1:** The Gautrain from Pretoria to OR Tambo Airport takes $42$ minutes. If Sipho catches the $16$:$10$ train, when does he arrive?\n$$16\\text{:}10 + 42 \\text{ min} = 16\\text{:}52$$\n\n**Example 2:** A school concert starts at $18$:$30$ on Friday. Naledi needs to arrive $45$ minutes early to set up. What time must she arrive?\n$$18\\text{:}30 - 45 \\text{ min} = 17\\text{:}45$$\n\n**Example 3:** How many weeks and days are in $100$ days?\n$$100 \\div 7 = 14 \\text{ weeks and } 2 \\text{ days}$$'),
  q(10, 'What is the elapsed time from $09$:$40$ to $12$:$15$?',
    ['$2$ hours $35$ minutes', '$2$ hours $45$ minutes', '$3$ hours $35$ minutes', '$3$ hours $25$ minutes'], 0,
    'From $09$:$40$ to $12$:$00$ = $2$ hours $20$ minutes. From $12$:$00$ to $12$:$15$ = $15$ minutes. Total: $2$ hours $35$ minutes.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Length (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Length\n\n### Units of Length\n\n| Unit | Symbol | Equivalent |\n|------|--------|------------|\n| Kilometre | km | $1\\,\\text{km} = 1\\,000\\,\\text{m}$ |\n| Metre | m | $1\\,\\text{m} = 100\\,\\text{cm}$ |\n| Centimetre | cm | $1\\,\\text{cm} = 10\\,\\text{mm}$ |\n| Millimetre | mm | $1\\,\\text{mm} = \\frac{1}{10}\\,\\text{cm}$ |\n\n### Conversions\n\n**Bigger → Smaller: MULTIPLY**\n$$3{,}5\\,\\text{km} = 3{,}5 \\times 1\\,000 = 3\\,500\\,\\text{m}$$\n$$2{,}4\\,\\text{m} = 2{,}4 \\times 100 = 240\\,\\text{cm}$$\n$$5{,}6\\,\\text{cm} = 5{,}6 \\times 10 = 56\\,\\text{mm}$$\n\n**Smaller → Bigger: DIVIDE**\n$$4\\,500\\,\\text{m} = 4\\,500 \\div 1\\,000 = 4{,}5\\,\\text{km}$$\n$$350\\,\\text{cm} = 350 \\div 100 = 3{,}5\\,\\text{m}$$\n$$45\\,\\text{mm} = 45 \\div 10 = 4{,}5\\,\\text{cm}$$'),
  t(2, '### Estimating and Measuring Length\n\nUseful benchmarks:\n- The width of your little finger: about $1\\,\\text{cm}$\n- The length of a ruler: $30\\,\\text{cm}$\n- One big step (stride): about $1\\,\\text{m}$\n- A soccer field: about $100\\,\\text{m}$\n- From Johannesburg to Pretoria: about $60\\,\\text{km}$\n\n### Choosing the Right Unit\n\n- **mm**: thickness of a coin, width of a pencil lead\n- **cm**: length of a pencil, width of a book\n- **m**: height of a door, length of a classroom\n- **km**: distance between towns\n\n**Example:** What unit would you use to measure the distance from Cape Town to Durban?\nAnswer: **km** (it is about $1\\,660\\,\\text{km}$).'),
  q(3, 'Convert $2\\,750\\,\\text{m}$ to kilometres.',
    ['$2{,}75\\,\\text{km}$', '$27{,}5\\,\\text{km}$', '$275\\,\\text{km}$', '$0{,}275\\,\\text{km}$'], 0,
    '$2\\,750 \\div 1\\,000 = 2{,}75\\,\\text{km}$.'),
  t(4, '### Perimeter\n\n**Perimeter** is the total distance around a shape.\n\n**Rectangle:**\n$$P = 2 \\times (\\ell + w)$$\n\n**Example:** A school playground is $45\\,\\text{m}$ long and $30\\,\\text{m}$ wide.\n$$P = 2 \\times (45 + 30) = 2 \\times 75 = 150\\,\\text{m}$$\n\n**Square:**\n$$P = 4 \\times s$$\n\n**Example:** A classroom notice board is $1{,}2\\,\\text{m}$ on each side.\n$$P = 4 \\times 1{,}2 = 4{,}8\\,\\text{m}$$\n\n**Irregular shapes:** Add up all the sides.\n\n**Example:** A triangle has sides $5\\,\\text{cm}$, $7\\,\\text{cm}$, and $9\\,\\text{cm}$.\n$$P = 5 + 7 + 9 = 21\\,\\text{cm}$$'),
  q(5, 'A rectangular garden is $12\\,\\text{m}$ long and $8\\,\\text{m}$ wide. What is its perimeter?',
    ['$40\\,\\text{m}$', '$96\\,\\text{m}$', '$20\\,\\text{m}$', '$32\\,\\text{m}$'], 0,
    '$P = 2 \\times (12 + 8) = 2 \\times 20 = 40\\,\\text{m}$.'),
  fb(6, '$1\\,\\text{km} = $ ___ $\\text{m}$. The perimeter of a square with side $6\\,\\text{cm}$ is ___ $\\text{cm}$.',
    ['1 000', '24'],
    '$1\\,\\text{km} = 1\\,000\\,\\text{m}$. Perimeter of square $= 4 \\times 6 = 24\\,\\text{cm}$.'),
  t(7, '### Word Problems — Length\n\n**Example 1:** A fence around a school field costs R$85$ per metre. The field is $120\\,\\text{m}$ long and $65\\,\\text{m}$ wide. How much will the fence cost?\n$$P = 2 \\times (120 + 65) = 370\\,\\text{m}$$\n$$\\text{Cost} = 370 \\times R85 = R31\\,450$$\n\n**Example 2:** Sipho runs $2{,}5\\,\\text{km}$ every morning. How many metres does he run in $5$ days?\n$$2{,}5\\,\\text{km} = 2\\,500\\,\\text{m}$$\n$$2\\,500 \\times 5 = 12\\,500\\,\\text{m} = 12{,}5\\,\\text{km}$$\n\n**Example 3:** A piece of rope is $3\\,\\text{m}$ long. Naledi cuts off $85\\,\\text{cm}$. How much rope is left?\n$$3\\,\\text{m} = 300\\,\\text{cm}$$\n$$300 - 85 = 215\\,\\text{cm} = 2{,}15\\,\\text{m}$$'),
  q(8, 'How many centimetres in $4{,}6\\,\\text{m}$?',
    ['$460\\,\\text{cm}$', '$46\\,\\text{cm}$', '$4\\,600\\,\\text{cm}$', '$0{,}046\\,\\text{cm}$'], 0,
    '$4{,}6 \\times 100 = 460\\,\\text{cm}$.'),
  t(9, '### Mixed Length Problems\n\n**Example 1:** A bookshelf is $1\\,\\text{m}\\,20\\,\\text{cm}$ tall. How many millimetres is that?\n$$1\\,\\text{m}\\,20\\,\\text{cm} = 120\\,\\text{cm} = 1\\,200\\,\\text{mm}$$\n\n**Example 2:** The distance from Johannesburg to Cape Town is $1\\,400\\,\\text{km}$. A truck driver has completed $875\\,\\text{km}$. How far is left?\n$$1\\,400 - 875 = 525\\,\\text{km}$$\n\n**Example 3:** Three pieces of ribbon measure $45\\,\\text{cm}$, $1{,}2\\,\\text{m}$, and $780\\,\\text{mm}$. What is the total length in centimetres?\n$$45 + 120 + 78 = 243\\,\\text{cm}$$'),
  q(10, 'Add: $1{,}5\\,\\text{m} + 75\\,\\text{cm}$. Give your answer in metres.',
    ['$2{,}25\\,\\text{m}$', '$2{,}55\\,\\text{m}$', '$1{,}575\\,\\text{m}$', '$90\\,\\text{m}$'], 0,
    '$75\\,\\text{cm} = 0{,}75\\,\\text{m}$. $1{,}5 + 0{,}75 = 2{,}25\\,\\text{m}$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Mass (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Mass\n\n**Mass** is the amount of matter in an object. We measure mass using a scale (or balance).\n\n### Units of Mass\n\n| Unit | Symbol | Equivalent |\n|------|--------|------------|\n| Kilogram | kg | $1\\,\\text{kg} = 1\\,000\\,\\text{g}$ |\n| Gram | g | $1\\,\\text{g} = 1\\,000\\,\\text{mg}$ |\n\n### Conversions\n\n**Bigger → Smaller: MULTIPLY**\n$$2{,}5\\,\\text{kg} = 2{,}5 \\times 1\\,000 = 2\\,500\\,\\text{g}$$\n$$3{,}4\\,\\text{g} = 3{,}4 \\times 1\\,000 = 3\\,400\\,\\text{mg}$$\n\n**Smaller → Bigger: DIVIDE**\n$$4\\,750\\,\\text{g} = 4\\,750 \\div 1\\,000 = 4{,}75\\,\\text{kg}$$\n$$500\\,\\text{mg} = 500 \\div 1\\,000 = 0{,}5\\,\\text{g}$$'),
  t(2, '### Estimating and Measuring Mass\n\nUseful benchmarks:\n- A sugar packet: $1\\,\\text{kg}$ or $2\\,\\text{kg}$\n- A loaf of bread: about $700\\,\\text{g}$\n- An apple: about $200\\,\\text{g}$\n- A paperclip: about $1\\,\\text{g}$\n- A Grade 5 learner: about $30$–$40\\,\\text{kg}$\n- A car: about $1\\,000$–$1\\,500\\,\\text{kg}$\n\n### Choosing the Right Unit\n\n- **mg**: medicine tablet, a grain of sand\n- **g**: food items, coins, stationery\n- **kg**: people, animals, furniture, vehicles\n\n**Example:** What unit would you use to measure a bag of potatoes?\nAnswer: **kg** (a bag of potatoes might be $5$ or $10\\,\\text{kg}$).'),
  q(3, 'Convert $3\\,250\\,\\text{g}$ to kilograms.',
    ['$3{,}25\\,\\text{kg}$', '$32{,}5\\,\\text{kg}$', '$325\\,\\text{kg}$', '$0{,}325\\,\\text{kg}$'], 0,
    '$3\\,250 \\div 1\\,000 = 3{,}25\\,\\text{kg}$.'),
  t(4, '### Practical Problems\n\n**Example 1:** A recipe for bobotie needs $750\\,\\text{g}$ of mince. Mama buys $2\\,\\text{kg}$. How much mince is left after making the bobotie?\n$$2\\,\\text{kg} = 2\\,000\\,\\text{g}$$\n$$2\\,000 - 750 = 1\\,250\\,\\text{g} = 1{,}25\\,\\text{kg}$$\n\n**Example 2:** A farmer sells oranges in bags of $5\\,\\text{kg}$. He has $48\\,\\text{kg}$ of oranges. How many full bags can he sell? How much is left over?\n$$48 \\div 5 = 9 \\text{ bags remainder } 3\\,\\text{kg}$$\n\n**Example 3:** Each learner\'s school bag has a mass of about $4{,}5\\,\\text{kg}$. What is the total mass of $28$ school bags?\n$$4{,}5 \\times 28 = 126\\,\\text{kg}$$'),
  q(5, 'A watermelon has a mass of $3{,}8\\,\\text{kg}$. How many grams is that?',
    ['$3\\,800\\,\\text{g}$', '$380\\,\\text{g}$', '$38\\,000\\,\\text{g}$', '$38\\,\\text{g}$'], 0,
    '$3{,}8 \\times 1\\,000 = 3\\,800\\,\\text{g}$.'),
  fb(6, '$1\\,\\text{kg} = $ ___ g. A bag of sugar that is $2{,}5\\,\\text{kg}$ has a mass of ___ g.',
    ['1 000', '2 500'],
    '$1\\,\\text{kg} = 1\\,000\\,\\text{g}$. $2{,}5 \\times 1\\,000 = 2\\,500\\,\\text{g}$.'),
  t(7, '### Comparing and Ordering Mass\n\nTo compare masses, convert to the **same unit** first.\n\n**Example:** Which is heavier: $1{,}2\\,\\text{kg}$ or $1\\,150\\,\\text{g}$?\n$$1{,}2\\,\\text{kg} = 1\\,200\\,\\text{g}$$\nSince $1\\,200 > 1\\,150$, the $1{,}2\\,\\text{kg}$ item is heavier.\n\n**Example:** Arrange in ascending order: $500\\,\\text{g}$, $0{,}75\\,\\text{kg}$, $1\\,200\\,\\text{g}$, $0{,}4\\,\\text{kg}$.\nConvert all to grams: $500\\,\\text{g}$, $750\\,\\text{g}$, $1\\,200\\,\\text{g}$, $400\\,\\text{g}$.\nOrder: $400\\,\\text{g} < 500\\,\\text{g} < 750\\,\\text{g} < 1\\,200\\,\\text{g}$.\n$$0{,}4\\,\\text{kg} < 500\\,\\text{g} < 0{,}75\\,\\text{kg} < 1\\,200\\,\\text{g}$$'),
  q(8, 'Which is heavier: $2{,}3\\,\\text{kg}$ or $2\\,350\\,\\text{g}$?',
    ['$2\\,350\\,\\text{g}$', '$2{,}3\\,\\text{kg}$', 'They are equal', 'Cannot compare'], 0,
    '$2{,}3\\,\\text{kg} = 2\\,300\\,\\text{g}$. Since $2\\,350 > 2\\,300$, $2\\,350\\,\\text{g}$ is heavier.'),
  t(9, '### More Mass Problems\n\n**Example 1:** A recipe needs $250\\,\\text{g}$ of flour, $100\\,\\text{g}$ of sugar, and $150\\,\\text{g}$ of butter. What is the total mass of ingredients?\n$$250 + 100 + 150 = 500\\,\\text{g} = 0{,}5\\,\\text{kg}$$\n\n**Example 2:** A delivery truck in Johannesburg carries $3\\,500\\,\\text{kg}$ of goods. It delivers $1\\,275\\,\\text{kg}$ at the first stop. How much remains?\n$$3\\,500 - 1\\,275 = 2\\,225\\,\\text{kg}$$\n\n**Example 3:** Each brick has a mass of $3{,}2\\,\\text{kg}$. What is the mass of $25$ bricks?\n$$3{,}2 \\times 25 = 80\\,\\text{kg}$$'),
  q(10, 'Add: $1{,}5\\,\\text{kg} + 800\\,\\text{g}$. Give your answer in kilograms.',
    ['$2{,}3\\,\\text{kg}$', '$2{,}03\\,\\text{kg}$', '$9{,}5\\,\\text{kg}$', '$1{,}58\\,\\text{kg}$'], 0,
    '$800\\,\\text{g} = 0{,}8\\,\\text{kg}$. $1{,}5 + 0{,}8 = 2{,}3\\,\\text{kg}$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Properties of 2D Shapes (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Properties of 2D Shapes\n\nA **2D (two-dimensional) shape** is flat. It has length and width but no thickness.\n\n### Triangles\n\nA **triangle** has $3$ sides and $3$ angles. The angles always add up to $180°$.\n\n**Types by sides:**\n| Type | Sides | Angles |\n|------|-------|--------|\n| Equilateral | All $3$ sides equal | All angles $= 60°$ |\n| Isosceles | $2$ sides equal | $2$ angles equal |\n| Scalene | No sides equal | No angles equal |\n\n**Types by angles:**\n| Type | Description |\n|------|-------------|\n| Acute | All angles less than $90°$ |\n| Right-angled | One angle exactly $90°$ |\n| Obtuse | One angle greater than $90°$ |\n\n**Example:** A triangle has sides $5\\,\\text{cm}$, $5\\,\\text{cm}$, and $8\\,\\text{cm}$. It is **isosceles** (two equal sides).'),
  t(2, '### Quadrilaterals\n\nA **quadrilateral** has $4$ sides and $4$ angles. The angles always add up to $360°$.\n\n| Shape | Properties |\n|-------|------------|\n| **Square** | All sides equal, all angles $= 90°$, $2$ pairs of parallel sides |\n| **Rectangle** | Opposite sides equal, all angles $= 90°$, $2$ pairs of parallel sides |\n| **Parallelogram** | Opposite sides equal and parallel, opposite angles equal |\n| **Rhombus** | All sides equal, opposite sides parallel, opposite angles equal |\n| **Trapezium** | Exactly $1$ pair of parallel sides |\n\n**Key relationships:**\n- A **square** is a special rectangle (with all sides equal).\n- A **square** is a special rhombus (with all angles $90°$).\n- A **rectangle** is a special parallelogram (with all angles $90°$).\n- A **rhombus** is a special parallelogram (with all sides equal).'),
  q(3, 'A shape has $4$ sides, all sides are equal, but the angles are NOT all $90°$. What is it?',
    ['Rhombus', 'Square', 'Rectangle', 'Trapezium'], 0,
    'A rhombus has all sides equal. If the angles were all $90°$, it would be a square.'),
  t(4, '### Circles\n\nA **circle** is a round shape where every point on the edge is the same distance from the centre.\n\n**Parts of a circle:**\n- **Centre**: the middle point\n- **Radius** ($r$): distance from centre to edge\n- **Diameter** ($d$): distance across the circle through the centre\n- **Circumference**: the distance around the circle\n\n**Important relationship:**\n$$d = 2 \\times r \\quad \\text{(diameter is twice the radius)}$$\n\n**Example:** If the radius of a circle is $7\\,\\text{cm}$:\n- Diameter $= 2 \\times 7 = 14\\,\\text{cm}$\n\n### Angles\n\nAngles are measured in **degrees** (°).\n- **Right angle**: $90°$\n- **Acute angle**: less than $90°$\n- **Obtuse angle**: between $90°$ and $180°$\n- **Straight angle**: $180°$\n- **Reflex angle**: between $180°$ and $360°$'),
  q(5, 'A triangle has angles of $50°$ and $70°$. What is the third angle?',
    ['$60°$', '$80°$', '$40°$', '$120°$'], 0,
    'Angles in a triangle add to $180°$. Third angle $= 180° - 50° - 70° = 60°$.'),
  fb(6, 'A shape with exactly one pair of parallel sides is a ___. The angles of a triangle add up to ___.',
    ['trapezium', '180°'],
    'A trapezium has exactly one pair of parallel sides. Triangle angle sum $= 180°$.'),
  t(7, '### Identifying Shapes in Real Life\n\n**Examples from South Africa:**\n- The **Voortrekker Monument** in Pretoria is shaped like a large rectangle when viewed from the front.\n- A **stop sign** is an octagon ($8$ sides).\n- A **R5 coin** is a circle.\n- A **soccer field** is a rectangle.\n- The **roof of a rondavel** (from above) is a circle.\n\n### Symmetry in 2D Shapes\n\nA **line of symmetry** divides a shape into two matching halves.\n\n| Shape | Lines of symmetry |\n|-------|--------------------|\n| Equilateral triangle | $3$ |\n| Isosceles triangle | $1$ |\n| Scalene triangle | $0$ |\n| Square | $4$ |\n| Rectangle | $2$ |\n| Circle | Infinite |'),
  q(8, 'How many lines of symmetry does a rectangle have?',
    ['$2$', '$4$', '$1$', '$0$'], 0,
    'A rectangle has $2$ lines of symmetry — one horizontal and one vertical through the centre.'),
  t(9, '### Properties Summary\n\n**Quick reference:**\n\n| Shape | Sides | Parallel pairs | Equal sides | All angles $90°$? |\n|-------|-------|----------------|-------------|-------------------|\n| Square | 4 | 2 | All 4 | Yes |\n| Rectangle | 4 | 2 | Opposite pairs | Yes |\n| Parallelogram | 4 | 2 | Opposite pairs | No (in general) |\n| Rhombus | 4 | 2 | All 4 | No (in general) |\n| Trapezium | 4 | 1 | Varies | No (in general) |\n| Equilateral triangle | 3 | 0 | All 3 | No |\n\n**Example:** A shape has $2$ pairs of parallel sides and all angles are $90°$, but not all sides are equal. What is it?\nAnswer: **Rectangle**.'),
  q(10, 'Which quadrilateral has all sides equal AND all angles equal to $90°$?',
    ['Square', 'Rhombus', 'Rectangle', 'Parallelogram'], 0,
    'A square has all $4$ sides equal and all $4$ angles $= 90°$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Properties of 3D Objects (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Properties of 3D Objects\n\nA **3D (three-dimensional) object** has length, width, and height. It takes up space.\n\n### Types of 3D Objects\n\n| Object | Description |\n|--------|-------------|\n| **Rectangular prism** (box) | $6$ rectangular faces |\n| **Cube** | $6$ square faces (special rectangular prism) |\n| **Triangular prism** | $2$ triangular faces, $3$ rectangular faces |\n| **Cylinder** | $2$ circular faces, $1$ curved surface |\n| **Cone** | $1$ circular face, $1$ curved surface, $1$ apex (point) |\n| **Sphere** | $0$ flat faces, $1$ curved surface |\n| **Square pyramid** | $1$ square base, $4$ triangular faces |\n| **Triangular pyramid** | $4$ triangular faces |\n\n### Faces, Edges, and Vertices\n\n- **Face**: a flat surface\n- **Edge**: where two faces meet (a line)\n- **Vertex** (plural: vertices): where edges meet (a point)'),
  t(2, '### Counting Faces, Edges, and Vertices\n\n| 3D Object | Faces | Edges | Vertices |\n|-----------|-------|-------|----------|\n| Cube | $6$ | $12$ | $8$ |\n| Rectangular prism | $6$ | $12$ | $8$ |\n| Triangular prism | $5$ | $9$ | $6$ |\n| Square pyramid | $5$ | $8$ | $5$ |\n| Triangular pyramid | $4$ | $6$ | $4$ |\n| Cylinder | $2$ (+ curved) | $0$ (+ $2$ curved) | $0$ |\n| Cone | $1$ (+ curved) | $0$ (+ $1$ curved) | $1$ (apex) |\n| Sphere | $0$ (all curved) | $0$ | $0$ |\n\n### Prisms vs Pyramids\n\n**Prisms** have two identical parallel bases connected by rectangular faces. They are named after their base shape.\n\n**Pyramids** have one base and triangular faces that meet at a single point (apex). They are named after their base shape.'),
  q(3, 'How many faces does a triangular prism have?',
    ['$5$', '$6$', '$4$', '$3$'], 0,
    'A triangular prism has $2$ triangular faces (top and bottom) and $3$ rectangular faces = $5$ faces total.'),
  t(4, '### Nets of 3D Objects\n\nA **net** is a flat pattern that folds up to make a 3D object.\n\n**Cube net:** $6$ connected squares. There are $11$ different nets for a cube.\n\n**Rectangular prism net:** $6$ connected rectangles (3 pairs of identical rectangles).\n\n**Triangular prism net:** $2$ triangles and $3$ rectangles.\n\n**Square pyramid net:** $1$ square and $4$ triangles.\n\n**How to check a net:**\n1. Count the faces — does the number match?\n2. Check that the faces are the right shapes.\n3. Check that they connect correctly (no overlaps when folded).\n\n**Example:** A net has $1$ square and $4$ identical triangles arranged around it. This folds into a **square pyramid**.'),
  q(5, 'Which 3D object has $1$ circular face, $1$ curved surface, and $1$ apex?',
    ['Cone', 'Cylinder', 'Sphere', 'Pyramid'], 0,
    'A cone has a circular base, a curved surface, and comes to a point (apex) at the top.'),
  fb(6, 'A rectangular prism has ___ faces and ___ edges.',
    ['6', '12'],
    'A rectangular prism (box shape) has $6$ faces and $12$ edges.'),
  t(7, '### 3D Objects in Real Life\n\n**Examples from South Africa:**\n- A **tin of baked beans**: cylinder\n- A **dice**: cube\n- A **soccer ball**: sphere\n- An **ice cream cone**: cone\n- A **Toblerone box**: triangular prism\n- The **Great Pyramid of Giza** (studied in Social Sciences): square pyramid\n- A **shoebox**: rectangular prism\n- A **tent** (A-frame): triangular prism\n\n### Recognising 3D Objects from Different Views\n\nWhen you look at a 3D object from different angles:\n- **Front view**: what you see from the front\n- **Side view**: what you see from the side\n- **Top view**: what you see looking down from above\n\n**Example:** A cylinder from the front looks like a rectangle. From the top, it looks like a circle.'),
  q(8, 'What shape does a cube look like when viewed from the top?',
    ['Square', 'Rectangle', 'Triangle', 'Circle'], 0,
    'Looking down on a cube from above, you see a square (the top face).'),
  t(9, '### Building 3D Models\n\nYou can build 3D objects from:\n- **Nets** cut from paper or cardboard\n- **Straws and clay** (straws = edges, clay balls = vertices)\n- **Unit cubes** stacked together\n\n**Example:** To build a rectangular prism from straws:\n- You need $12$ straws ($4$ groups of $3$ different lengths)\n- You need $8$ clay balls for the vertices\n\n**Example:** To build a square pyramid:\n- You need $8$ straws ($4$ for the square base + $4$ for the triangular sides)\n- You need $5$ clay balls for the vertices'),
  q(10, 'A 3D object has $4$ triangular faces and $0$ rectangular faces. What is it?',
    ['Triangular pyramid (tetrahedron)', 'Square pyramid', 'Triangular prism', 'Cube'], 0,
    'A triangular pyramid has $4$ triangular faces — $1$ triangular base and $3$ triangular sides. It is also called a tetrahedron.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Data Handling (Term 4) — Lesson 1
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Data Handling — Collecting and Representing Data\n\n**Data** is information, usually in the form of numbers or words.\n\n### The Data Handling Cycle\n\n1. **Pose a question** — What do you want to find out?\n2. **Collect data** — Survey, observation, experiment\n3. **Organise data** — Tables, lists, tally marks\n4. **Represent data** — Graphs, charts\n5. **Interpret data** — What does the data tell us?\n\n### Organising Data in Tables\n\n**Example:** A Grade 5 class surveyed favourite sports:\n\n| Sport | Tally | Frequency |\n|-------|-------|-----------|\n| Soccer | \\|\\|\\|\\| \\|\\|\\| | $8$ |\n| Cricket | \\|\\|\\|\\| | $5$ |\n| Netball | \\|\\|\\|\\| \\| | $6$ |\n| Rugby | \\|\\|\\| | $3$ |\n| Swimming | \\|\\|\\|\\| \\|\\|\\|\\| | $10$ |\n| **Total** | | **$32$** |\n\nThe most popular sport is **swimming** ($10$ votes).'),
  t(2, '### Bar Graphs\n\nA **bar graph** uses bars to show data. The height (or length) of each bar represents the frequency.\n\n**Rules for drawing a bar graph:**\n1. Give the graph a **title**.\n2. Label the **horizontal axis** (categories) and **vertical axis** (frequency).\n3. Choose a **scale** for the vertical axis (e.g., $1$ square $= 2$).\n4. Draw bars of **equal width** with **equal gaps**.\n5. Bars do NOT touch each other.\n\n### Pictographs\n\nA **pictograph** uses pictures or symbols to represent data. A **key** tells you what each symbol stands for.\n\n**Example:** If $\\bigstar = 4$ learners:\n- Soccer: $\\bigstar\\bigstar$ means $8$ learners.\n- Cricket: $\\bigstar$ and a half means $6$ learners.\n\n**Tip:** Always include the key when drawing a pictograph!'),
  q(3, 'In a bar graph, the bar for "Apples" reaches $15$ on the vertical axis and "Bananas" reaches $10$. How many more learners chose apples?',
    ['$5$', '$15$', '$10$', '$25$'], 0,
    'Difference $= 15 - 10 = 5$ more learners chose apples.'),
  t(4, '### Reading and Interpreting Graphs\n\nWhen you read a graph, ask yourself:\n- What is the **title**?\n- What do the **axes** represent?\n- What is the **scale**?\n- Which category has the **most** / **least**?\n- What is the **total**?\n\n**Example:** A bar graph shows the number of rainy days per month in Durban:\n\n| Month | Jan | Feb | Mar | Apr | May | Jun |\n|-------|-----|-----|-----|-----|-----|-----|\n| Rainy days | $12$ | $10$ | $9$ | $7$ | $4$ | $3$ |\n\n**Questions:**\n- Which month had the most rainy days? **January** ($12$)\n- How many rainy days in the first quarter (Jan–Mar)? $12 + 10 + 9 = 31$\n- What is the difference between January and June? $12 - 3 = 9$ days'),
  q(5, 'A pictograph uses $\\bigstar = 5$ books. If a library shows $\\bigstar\\bigstar\\bigstar$ and a half star for fiction, how many fiction books are there?',
    ['$17$', '$15$', '$18$', '$20$'], 0,
    '$3$ full stars $= 3 \\times 5 = 15$. Half a star $= \\frac{5}{2} = 2{,}5$. Total $= 17{,}5$. Rounding: $17$ or $18$. Since the answer choices show $17$, the answer is $17$ (the half star represents about $2$–$3$ books).', ['Each star is 5 books, so half a star is about 2-3 books.']),
  fb(6, 'In a bar graph, the ___ axis usually shows the categories and the ___ axis shows the frequency.',
    ['horizontal', 'vertical'],
    'Categories go on the horizontal axis (bottom); frequency goes on the vertical axis (side).'),
  t(7, '### Drawing Your Own Graphs\n\n**Example:** Draw a bar graph for the following data about trees planted by schools in Gauteng:\n\n| School | Trees planted |\n|--------|---------------|\n| Thuto Primary | $25$ |\n| Lesedi Primary | $40$ |\n| Bophelo Primary | $30$ |\n| Naledi Primary | $35$ |\n\n**Steps:**\n1. Title: "Trees Planted by Schools"\n2. Horizontal axis: School names\n3. Vertical axis: Number of trees (scale: $0, 5, 10, 15, 20, 25, 30, 35, 40$)\n4. Draw $4$ bars at the correct heights\n\n**From the graph we can see:**\n- Lesedi Primary planted the most trees ($40$).\n- Thuto Primary planted the fewest ($25$).\n- Total trees: $25 + 40 + 30 + 35 = 130$.'),
  q(8, 'A survey of $40$ Grade 5 learners shows: $15$ walk to school, $12$ take a taxi, $8$ cycle, and the rest are driven. How many are driven?',
    ['$5$', '$10$', '$8$', '$15$'], 0,
    'Driven $= 40 - 15 - 12 - 8 = 5$ learners.'),
  t(9, '### Double Bar Graphs\n\nA **double bar graph** compares two sets of data side by side.\n\n**Example:** Test scores for boys and girls:\n\n| Subject | Boys | Girls |\n|---------|------|-------|\n| Maths | $65$ | $70$ |\n| English | $58$ | $72$ |\n| Life Skills | $75$ | $68$ |\n\nDraw two bars for each subject — one colour for boys, one for girls. Include a **legend** (key).\n\n**From the graph:**\n- Girls scored higher in Maths and English.\n- Boys scored higher in Life Skills.\n- The biggest difference is in English: $72 - 58 = 14$ marks.'),
  q(10, 'What is the total number of learners surveyed if the frequencies in a table are: $12, 8, 15, 5$?',
    ['$40$', '$35$', '$30$', '$45$'], 0,
    'Total $= 12 + 8 + 15 + 5 = 40$ learners.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 14: Data Handling (Term 4) — Lesson 2
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch14_lesson2 = [
  t(1, '## Data Handling — Mode, Median, and Chance\n\n### Mode\n\nThe **mode** is the value that appears **most often** in a data set.\n\n**Example:** Test marks of $10$ learners: $5, 7, 8, 5, 9, 5, 6, 8, 7, 5$.\n\nArrange in order: $5, 5, 5, 5, 6, 7, 7, 8, 8, 9$.\n\nThe mode is **$5$** (it appears $4$ times, more than any other value).\n\n**No mode:** If all values appear equally often, there is no mode.\n\n**Two modes:** If two values tie for most frequent, the data is **bimodal**.\n\n### Median\n\nThe **median** is the **middle value** when data is arranged in order.\n\n**Odd number of values:** The median is the middle one.\n- $3, 5, 7, 9, 11$ → Median $= 7$ (the 3rd of 5 values)\n\n**Even number of values:** The median is the average of the two middle values.\n- $4, 6, 8, 10$ → Median $= \\frac{6 + 8}{2} = 7$'),
  t(2, '### Finding the Median — Step by Step\n\n**Example:** Shoe sizes of $9$ Grade 5 learners: $4, 5, 3, 6, 4, 5, 5, 3, 7$.\n\n**Step 1:** Arrange in order: $3, 3, 4, 4, 5, 5, 5, 6, 7$.\n\n**Step 2:** Count the values: $9$ (odd number).\n\n**Step 3:** Find the middle position: $(9 + 1) \\div 2 = 5$th value.\n\n**Step 4:** The 5th value is $5$. So the **median $= 5$**.\n\n### When to Use Mode vs Median\n\n- Use the **mode** when you want the most popular or common value (e.g., most popular shoe size to stock in a shop).\n- Use the **median** when you want the typical middle value (e.g., typical test score). The median is not affected by very high or very low values.'),
  q(3, 'Find the mode of: $12, 15, 12, 18, 15, 12, 20$.',
    ['$12$', '$15$', '$18$', '$20$'], 0,
    '$12$ appears $3$ times, which is more than any other value. Mode $= 12$.'),
  t(4, '### Chance Events — Probability Language\n\nWe use special words to describe how likely something is to happen:\n\n| Word | Meaning | Example |\n|------|---------|---------|\n| **Impossible** | Cannot happen | Rolling a $7$ on a normal die |\n| **Unlikely** | Probably will not happen | Snow in Durban |\n| **Even chance** | Equally likely to happen or not | Flipping heads on a coin |\n| **Likely** | Probably will happen | Rain during summer in Mpumalanga |\n| **Certain** | Will definitely happen | The sun rising tomorrow |\n\n### Probability Scale\n\n$$\\text{Impossible} \\longleftrightarrow \\text{Unlikely} \\longleftrightarrow \\text{Even chance} \\longleftrightarrow \\text{Likely} \\longleftrightarrow \\text{Certain}$$'),
  q(5, 'A bag contains $3$ red balls and $3$ blue balls. What describes the chance of picking a red ball?',
    ['Even chance', 'Certain', 'Likely', 'Unlikely'], 0,
    'There are $3$ red and $3$ blue — exactly half are red. The chance is **even** (equally likely to be red or blue).'),
  fb(6, 'The value that appears most often in a data set is the ___. The middle value when data is arranged in order is the ___.',
    ['mode', 'median'],
    'The mode is the most frequent value. The median is the middle value in an ordered list.'),
  t(7, '### Predicting Outcomes\n\nWe can use probability language to predict events.\n\n**Example 1:** A spinner has $4$ equal sections: $2$ red, $1$ blue, $1$ green.\n- Chance of red: **likely** ($2$ out of $4$ — but since it\'s exactly half, it\'s actually **even chance**)\n- Actually: $2$ out of $4 = \\frac{1}{2}$, so it is **even chance**.\n- Chance of blue: **unlikely** ($1$ out of $4$)\n- Chance of yellow: **impossible** (no yellow section)\n\n**Example 2:** In a class of $30$ learners in Limpopo, $18$ prefer summer. If you ask a random learner:\n- Chance they prefer summer: **likely** ($18$ out of $30$ — more than half)\n- Chance they prefer winter: **unlikely** ($12$ out of $30$ — less than half)\n\n**Important:** Probability tells us what is **likely** to happen, not what **will** happen every time.'),
  q(8, 'Find the median of: $8, 3, 5, 10, 7$.',
    ['$7$', '$5$', '$8$', '$3$'], 0,
    'Arrange in order: $3, 5, 7, 8, 10$. The middle (3rd) value is $7$. Median $= 7$.'),
  t(9, '### Experiments and Outcomes\n\n**An experiment** is an activity where we observe what happens.\n\n**Example 1 — Tossing a coin:**\n- Possible outcomes: Heads, Tails\n- Each outcome has an **even chance** ($\\frac{1}{2}$)\n\n**Example 2 — Rolling a die:**\n- Possible outcomes: $1, 2, 3, 4, 5, 6$\n- Chance of rolling a $4$: unlikely ($\\frac{1}{6}$ — less than half)\n- Chance of rolling an even number ($2, 4, 6$): even chance ($\\frac{3}{6} = \\frac{1}{2}$)\n\n**Example 3 — Drawing from a bag:**\nA bag has $5$ red, $2$ blue, and $1$ green marble.\n- Most likely colour: **red** ($5$ out of $8$)\n- Least likely colour: **green** ($1$ out of $8$)\n\n**Note:** The more times you repeat an experiment, the closer the results get to the expected probabilities.'),
  q(10, 'A die is rolled. What word describes the chance of rolling a number less than $5$?',
    ['Likely', 'Even chance', 'Unlikely', 'Certain'], 0,
    'Numbers less than $5$: $1, 2, 3, 4$ — that is $4$ out of $6$, which is more than half. So it is **likely**.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION — Database insertion
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
    tags: ['grade-5', 'mathematics', 'caps'],
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
      description: 'Place value up to 6 digits, rounding to nearest 5/10/100/1000, ordering, comparing, odd/even, properties of operations, and BODMAS.',
      order: 1,
      lessons: [
        { title: 'Whole Numbers', description: 'Place value up to 6 digits, rounding, ordering, comparing, odd and even numbers, properties of operations, BODMAS, estimation, and problem solving.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Addition and Subtraction',
      description: 'Addition and subtraction of whole numbers up to 5 digits, estimation, inverse operations, strategies, and word problems.',
      order: 2,
      lessons: [
        { title: 'Addition and Subtraction', description: 'Adding and subtracting whole numbers up to 5 digits, estimation, inverse operations, strategies for mental computation, and multi-step word problems.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Multiplication',
      description: 'Multiplication of 3-digit by 2-digit numbers, multiplication by 10/100/1000, strategies, estimation, and word problems.',
      order: 3,
      lessons: [
        { title: 'Multiplication', description: 'Multiplying 3-digit by 2-digit numbers, multiplication by powers of 10, distributive property, doubling and halving, estimation, and word problems.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Division',
      description: 'Division of 3-digit by 2-digit numbers, remainders, relationship between multiplication and division, strategies, and word problems.',
      order: 4,
      lessons: [
        { title: 'Division', description: 'Dividing 3-digit by 2-digit numbers, long division, remainders in context, inverse relationship with multiplication, division strategies, and word problems.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Common Fractions',
      description: 'Recognising and comparing fractions, equivalent fractions, addition and subtraction of fractions with same denominator, and fractions of whole numbers.',
      order: 5,
      lessons: [
        { title: 'Common Fractions', description: 'Recognising fractions, comparing and ordering, equivalent fractions, addition and subtraction with same denominator, fractions of whole numbers, and unit fractions.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Decimal Fractions',
      description: 'Place value to hundredths, ordering decimals, addition and subtraction of decimals, conversions between fractions, decimals, and percentages.',
      order: 6,
      lessons: [
        { title: 'Decimal Fractions', description: 'Place value to hundredths, reading and writing decimals, ordering, addition and subtraction, conversions between fractions, decimals, and percentages, and money problems.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Number Patterns',
      description: 'Describing and extending numeric patterns, input-output tables, finding rules, creating patterns, and non-constant patterns.',
      order: 7,
      lessons: [
        { title: 'Number Patterns', description: 'Constant difference patterns, extending sequences, input-output tables, finding and applying rules, creating own patterns, and non-constant patterns.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Capacity and Volume',
      description: 'Litres, millilitres, conversions, estimating and measuring capacity, volume of rectangular containers, and practical problems.',
      order: 8,
      lessons: [
        { title: 'Capacity and Volume', description: 'Units of capacity (litres, millilitres), conversions, estimating capacity, choosing appropriate units, volume of rectangular containers, and practical problems.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Time',
      description: 'Reading analogue and digital clocks, 24-hour time, elapsed time, calendars, and timetables.',
      order: 9,
      lessons: [
        { title: 'Time', description: 'Analogue and digital clocks, 24-hour time, elapsed time calculations, calendars, months and days, timetables, and problem solving with time.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Length',
      description: 'Conversions between km, m, cm, and mm, estimating and measuring length, and perimeter of shapes.',
      order: 10,
      lessons: [
        { title: 'Length', description: 'Units of length (km, m, cm, mm), conversions, estimating and measuring, choosing appropriate units, perimeter of rectangles, squares, and irregular shapes, and word problems.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Mass',
      description: 'Kilograms, grams, conversions, estimating and measuring mass, comparing mass, and practical problems.',
      order: 11,
      lessons: [
        { title: 'Mass', description: 'Units of mass (kg, g), conversions, estimating and measuring, choosing appropriate units, comparing and ordering, and practical word problems.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Properties of 2D Shapes',
      description: 'Triangles (equilateral, isosceles, scalene), quadrilaterals (square, rectangle, parallelogram, trapezium, rhombus), circles, and angles.',
      order: 12,
      lessons: [
        { title: 'Properties of 2D Shapes', description: 'Classifying triangles by sides and angles, properties of quadrilaterals, circles and their parts, types of angles, symmetry, and identifying shapes in real life.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Properties of 3D Objects',
      description: 'Recognising prisms, pyramids, cylinders, cones, spheres, faces/edges/vertices, and nets of 3D objects.',
      order: 13,
      lessons: [
        { title: 'Properties of 3D Objects', description: 'Prisms and pyramids, cylinders, cones, spheres, counting faces, edges and vertices, nets of 3D objects, and recognising 3D objects in real life.', blocks: ch13_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 14: Data Handling',
      description: 'Collecting and organising data in tables, bar graphs, pictographs, reading and interpreting graphs, mode, median, predicting outcomes, and chance events.',
      order: 14,
      lessons: [
        { title: 'Collecting and Representing Data', description: 'Data handling cycle, organising data in tables with tally marks, bar graphs, pictographs, double bar graphs, reading and interpreting graphs, and drawing graphs.', blocks: ch14_lesson1, term: 4 },
        { title: 'Mode, Median, and Chance', description: 'Mode and median of data sets, probability language (impossible, unlikely, even chance, likely, certain), predicting outcomes, experiments, and chance events.', blocks: ch14_lesson2, term: 4 },
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
    title: 'Grade 5 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook for Grade 5 Mathematics covering Whole Numbers, Addition and Subtraction, Multiplication, Division, Common Fractions, Decimal Fractions, Number Patterns, Capacity and Volume, Time, Length, Mass, Properties of 2D Shapes, Properties of 3D Objects, and Data Handling.',
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
  console.log('  TEXTBOOK: Grade 5 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
