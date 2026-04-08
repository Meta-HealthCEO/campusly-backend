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
// CHAPTER 1: Numbers and Counting (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Numbers and Counting\n\nIn Grade 3 we work with numbers up to **$1\\,000$**.\n\n### Place Value\n\nEvery digit in a number has a **place value** — it depends on where the digit sits.\n\n| Hundreds | Tens | Ones |\n|---|---|---|\n| 100 | 10 | 1 |\n\n**Example:** Look at the number $463$.\n- The $4$ is in the hundreds place — its value is $400$\n- The $6$ is in the tens place — its value is $60$\n- The $3$ is in the ones place — its value is $3$\n\nSo $463 = 400 + 60 + 3$. This is called **expanded form**.'),
  t(2, '### Counting Forwards and Backwards\n\nWe can skip-count in different ways:\n\n**Count in 1s:** $997, 998, 999, 1\\,000$\n\n**Count in 2s:** $2, 4, 6, 8, 10, 12, \\ldots$\n\n**Count in 5s:** $5, 10, 15, 20, 25, 30, \\ldots$\n\n**Count in 10s:** $10, 20, 30, 40, 50, \\ldots$\n\n**Count backwards in 10s from 200:** $200, 190, 180, 170, 160, \\ldots$\n\n**Count backwards in 5s from 50:** $50, 45, 40, 35, 30, \\ldots$\n\nSkip-counting helps us see **patterns** in numbers.'),
  q(3, 'What comes next? $345, 350, 355, 360, \\ldots$',
    ['$365$', '$370$', '$361$', '$355$'], 0,
    'We are counting in $5$s. The next number after $360$ is $360 + 5 = 365$.'),
  t(4, '### Number Names\n\nWe must know how to write numbers in words:\n\n| Number | In words |\n|---|---|\n| $256$ | two hundred and fifty-six |\n| $409$ | four hundred and nine |\n| $710$ | seven hundred and ten |\n| $1\\,000$ | one thousand |\n\n### Comparing Numbers\n\nWe use $<$ (less than), $>$ (greater than), and $=$ (equals).\n\nTo compare, look at the **hundreds** first, then tens, then ones.\n\n**Example:** Which is bigger: $538$ or $583$?\n- Hundreds: both are $5$ — the same.\n- Tens: $3$ versus $8$ — $8$ is bigger.\n\nSo $583 > 538$.'),
  q(5, 'Put these numbers in order from smallest to biggest: $672$, $627$, $726$.',
    ['$627, 672, 726$', '$672, 627, 726$', '$726, 672, 627$', '$627, 726, 672$'], 0,
    'Compare hundreds first: $627$ and $672$ both start with $6$, but $627 < 672$ (look at the tens). $726$ has $7$ hundreds, so it is the biggest. Order: $627 < 672 < 726$.'),
  fb(6, 'The number $835$ in expanded form is $800 + ___ + 5$. In words, $409$ is four hundred and ___.',
    ['30', 'nine'],
    'The tens digit of $835$ is $3$, so its value is $30$. The number $409$ has $9$ ones, so in words it is four hundred and nine.'),
  t(7, '### Ordering Numbers\n\n**Ascending order** means smallest to biggest: $125 < 251 < 512$\n\n**Descending order** means biggest to smallest: $512 > 251 > 125$\n\n**Example:** Arrange in descending order: $308$, $380$, $803$\n$$803 > 380 > 308$$\n\n### Real-Life Example\n\nA school in Pretoria has $478$ learners. A school in Soweto has $521$ learners. Which school has more?\n\n$521 > 478$, so the school in Soweto has more learners.'),
  q(8, 'Count backwards in $10$s: $430, 420, 410, \\ldots$ What is the next number?',
    ['$400$', '$405$', '$310$', '$401$'], 0,
    'We are counting backwards in $10$s. $410 - 10 = 400$.'),
  fb(9, 'When we count in 2s starting from 2, the first five numbers are: $2, 4, ___, 8, ___$.',
    ['6', '10'],
    'Counting in $2$s: $2, 4, 6, 8, 10$.'),
  q(10, 'What is the place value of the digit $7$ in $375$?',
    ['$70$', '$7$', '$700$', '$75$'], 0,
    'The $7$ is in the tens place, so its value is $70$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Addition and Subtraction (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Addition and Subtraction\n\nIn Grade 3 we add and subtract numbers up to **$999$**.\n\n### Addition — Putting Numbers Together\n\nWhen we add, we find the **total** or **sum**.\n\n**Example 1:** $345 + 231$\n- Ones: $5 + 1 = 6$\n- Tens: $4 + 3 = 7$\n- Hundreds: $3 + 2 = 5$\n$$345 + 231 = 576$$\n\n**Example 2:** $467 + 258$ (with carrying)\n- Ones: $7 + 8 = 15$ — write $5$, carry $1$\n- Tens: $6 + 5 + 1 = 12$ — write $2$, carry $1$\n- Hundreds: $4 + 2 + 1 = 7$\n$$467 + 258 = 725$$'),
  t(2, '### Number Bonds\n\nNumber bonds help us see how numbers fit together.\n\n**Bonds of $100$:**\n$$30 + 70 = 100$$\n$$45 + 55 = 100$$\n$$82 + 18 = 100$$\n\n**Breaking down numbers makes adding easier:**\n$$356 + 123 = 300 + 100 + 50 + 20 + 6 + 3 = 400 + 70 + 9 = 479$$\n\n### Subtraction — Taking Away\n\nSubtraction finds the **difference** between two numbers.\n\n**Example:** $586 - 243$\n- Ones: $6 - 3 = 3$\n- Tens: $8 - 4 = 4$\n- Hundreds: $5 - 2 = 3$\n$$586 - 243 = 343$$'),
  q(3, 'Calculate: $325 + 148$.',
    ['$473$', '$463$', '$573$', '$373$'], 0,
    'Ones: $5 + 8 = 13$, write $3$, carry $1$. Tens: $2 + 4 + 1 = 7$. Hundreds: $3 + 1 = 4$. Answer: $473$.'),
  t(4, '### Subtraction with Borrowing\n\nSometimes the top digit is smaller than the bottom digit. Then we must **borrow**.\n\n**Example:** $532 - 278$\n- Ones: $2 - 8$? We cannot! Borrow from the tens: $12 - 8 = 4$\n- Tens: $2 - 7$? We cannot! Borrow from the hundreds: $12 - 7 = 5$\n- Hundreds: $4 - 2 = 2$\n$$532 - 278 = 254$$\n\n### Checking with Inverse Operations\n\nAddition and subtraction **undo** each other.\n\nIf $532 - 278 = 254$, then $254 + 278 = 532$ ✓'),
  q(5, 'A fruit shop in Durban has $450$ oranges. It sells $186$ oranges. How many are left?',
    ['$264$', '$274$', '$364$', '$246$'], 0,
    '$450 - 186 = 264$ oranges left.'),
  fb(6, 'The number bond: $65 + ___ = 100$. Calculate: $700 - 350 = ___.',
    ['35', '350'],
    '$65 + 35 = 100$. $700 - 350 = 350$.'),
  t(7, '### Word Problems\n\n**Key words for adding:** total, sum, altogether, how many in all\n**Key words for subtracting:** difference, how many left, remain, take away, fewer\n\n**Example 1:** Thabo has $235$ marbles. Sipho gives him $148$ more. How many does Thabo have now?\n$$235 + 148 = 383 \\text{ marbles}$$\n\n**Example 2:** A bakery in Cape Town makes $500$ koeksisters. It sells $317$. How many are left?\n$$500 - 317 = 183 \\text{ koeksisters}$$'),
  q(8, 'What is $99 + 99$?',
    ['$198$', '$188$', '$199$', '$208$'], 0,
    '$99 + 99 = 198$. Tip: $99 + 99 = 100 + 100 - 2 = 198$.'),
  fb(9, 'If $365 + 214 = 579$, then $579 - 214 = ___$. Addition and subtraction are ___ operations.',
    ['365', 'inverse'],
    'Inverse operations undo each other: $579 - 214 = 365$.'),
  q(10, 'Lerato has R$500$. She buys a book for R$125$ and a pen for R$48$. How much money does she have left?',
    ['R$327$', 'R$337$', 'R$427$', 'R$227$'], 0,
    '$500 - 125 = 375$, then $375 - 48 = 327$. Lerato has R$327$ left.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Multiplication (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Multiplication\n\nMultiplication is a fast way of **adding equal groups**.\n\n### Repeated Addition\n\n$3$ groups of $4$ means: $4 + 4 + 4 = 12$\n\nWe write this as: $3 \\times 4 = 12$\n\n**Example:** $5$ bags with $2$ apples in each bag.\n$$5 \\times 2 = 2 + 2 + 2 + 2 + 2 = 10 \\text{ apples}$$\n\n### Arrays\n\nAn array is objects arranged in **rows** and **columns**.\n\n$3$ rows of $5$:\n$$\\bullet\\;\\bullet\\;\\bullet\\;\\bullet\\;\\bullet$$\n$$\\bullet\\;\\bullet\\;\\bullet\\;\\bullet\\;\\bullet$$\n$$\\bullet\\;\\bullet\\;\\bullet\\;\\bullet\\;\\bullet$$\n\nThis shows $3 \\times 5 = 15$.'),
  t(2, '### Times Tables\n\n**The 2 times table:**\n$$2 \\times 1 = 2, \\quad 2 \\times 2 = 4, \\quad 2 \\times 3 = 6, \\quad 2 \\times 4 = 8, \\quad 2 \\times 5 = 10$$\n\n**The 5 times table:**\n$$5 \\times 1 = 5, \\quad 5 \\times 2 = 10, \\quad 5 \\times 3 = 15, \\quad 5 \\times 4 = 20, \\quad 5 \\times 5 = 25$$\n\n**The 10 times table:**\n$$10 \\times 1 = 10, \\quad 10 \\times 2 = 20, \\quad 10 \\times 3 = 30, \\quad 10 \\times 4 = 40$$\n\n**Tip:** When you multiply by $10$, just add a zero at the end!\n$$7 \\times 10 = 70 \\qquad 12 \\times 10 = 120$$'),
  q(3, 'What is $4 \\times 5$?',
    ['$20$', '$25$', '$15$', '$9$'], 0,
    '$4 \\times 5 = 5 + 5 + 5 + 5 = 20$.'),
  t(4, '### The 3 and 4 Times Tables\n\n**The 3 times table:**\n$$3 \\times 1 = 3, \\quad 3 \\times 2 = 6, \\quad 3 \\times 3 = 9, \\quad 3 \\times 4 = 12, \\quad 3 \\times 5 = 15$$\n$$3 \\times 6 = 18, \\quad 3 \\times 7 = 21, \\quad 3 \\times 8 = 24, \\quad 3 \\times 9 = 27, \\quad 3 \\times 10 = 30$$\n\n**The 4 times table:**\n$$4 \\times 1 = 4, \\quad 4 \\times 2 = 8, \\quad 4 \\times 3 = 12, \\quad 4 \\times 4 = 16, \\quad 4 \\times 5 = 20$$\n$$4 \\times 6 = 24, \\quad 4 \\times 7 = 28, \\quad 4 \\times 8 = 32, \\quad 4 \\times 9 = 36, \\quad 4 \\times 10 = 40$$\n\n**Trick:** The 4 times table is double the 2 times table!\n$$2 \\times 6 = 12 \\quad \\Rightarrow \\quad 4 \\times 6 = 24$$'),
  q(5, 'There are $3$ classrooms. Each classroom has $10$ desks. How many desks altogether?',
    ['$30$', '$13$', '$33$', '$20$'], 0,
    '$3 \\times 10 = 30$ desks.'),
  fb(6, '$5 \\times 3 = ___$. Doubling $7$ means $2 \\times 7 = ___$.',
    ['15', '14'],
    '$5 \\times 3 = 15$. Doubling means multiplying by $2$: $2 \\times 7 = 14$.'),
  t(7, '### Doubling\n\n**Doubling** means multiplying by $2$.\n\n$$\\text{Double } 8 = 2 \\times 8 = 16$$\n$$\\text{Double } 15 = 2 \\times 15 = 30$$\n$$\\text{Double } 50 = 2 \\times 50 = 100$$\n\n### Word Problems\n\n**Example 1:** A packet of chips costs R$5$. Mama buys $4$ packets. How much does she pay?\n$$4 \\times 5 = \\text{R}20$$\n\n**Example 2:** In a garden in Johannesburg, there are $3$ rows of sunflowers with $5$ sunflowers in each row. How many sunflowers?\n$$3 \\times 5 = 15 \\text{ sunflowers}$$'),
  q(8, 'What is double $25$?',
    ['$50$', '$45$', '$55$', '$27$'], 0,
    'Double $25$ means $2 \\times 25 = 50$.'),
  q(9, 'A tray holds $4$ cupcakes. There are $5$ trays. How many cupcakes in total?',
    ['$20$', '$9$', '$24$', '$15$'], 0,
    '$5 \\times 4 = 20$ cupcakes.'),
  fb(10, '$10 \\times 8 = ___$. We call multiplication the same as repeated ___.',
    ['80', 'addition'],
    '$10 \\times 8 = 80$. Multiplication is a quick way of doing repeated addition.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Division (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Division\n\nDivision means **sharing equally** or **grouping**.\n\n### Sharing Equally\n\nIf you share $12$ sweets equally among $3$ friends, each friend gets:\n$$12 \\div 3 = 4 \\text{ sweets}$$\n\n### Grouping\n\nIf you have $12$ sweets and put them in groups of $4$, you get:\n$$12 \\div 4 = 3 \\text{ groups}$$\n\n### Division and Multiplication are Opposites\n\nIf $3 \\times 4 = 12$, then:\n$$12 \\div 3 = 4 \\quad \\text{and} \\quad 12 \\div 4 = 3$$\n\nKnowing your times tables helps you divide!'),
  t(2, '### Halving\n\n**Halving** means dividing by $2$.\n\n$$\\text{Half of } 10 = 10 \\div 2 = 5$$\n$$\\text{Half of } 18 = 18 \\div 2 = 9$$\n$$\\text{Half of } 50 = 50 \\div 2 = 25$$\n\nHalving is the opposite of doubling.\n\n### Simple Division Facts\n\nUsing your $2$, $3$, $4$, $5$, and $10$ times tables:\n\n$$20 \\div 5 = 4 \\qquad 30 \\div 10 = 3 \\qquad 24 \\div 4 = 6$$\n$$15 \\div 3 = 5 \\qquad 16 \\div 2 = 8 \\qquad 40 \\div 5 = 8$$'),
  q(3, 'What is $20 \\div 4$?',
    ['$5$', '$4$', '$6$', '$8$'], 0,
    'Think: $4 \\times ? = 20$. $4 \\times 5 = 20$, so $20 \\div 4 = 5$.'),
  t(4, '### Remainders\n\nSometimes things do not share equally. The amount left over is called a **remainder**.\n\n**Example:** Share $13$ apples among $4$ children.\n- Each child gets $3$ apples ($4 \\times 3 = 12$)\n- There is $1$ apple left over\n$$13 \\div 4 = 3 \\text{ remainder } 1$$\n\nWe write: $13 \\div 4 = 3 \\text{ r } 1$\n\n**Example:** $17 \\div 5$\n- $5 \\times 3 = 15$ (not enough for one more group)\n- $17 - 15 = 2$ left over\n$$17 \\div 5 = 3 \\text{ r } 2$$'),
  q(5, 'Gogo has $14$ biscuits to share equally among $3$ grandchildren. How many does each child get, and how many are left over?',
    ['$4$ each, $2$ left over', '$5$ each, $1$ left over', '$4$ each, $1$ left over', '$3$ each, $5$ left over'], 0,
    '$3 \\times 4 = 12$, so each child gets $4$. $14 - 12 = 2$ biscuits left over.'),
  fb(6, 'Half of $16$ is ___. $30 \\div 5 = ___$.',
    ['8', '6'],
    '$16 \\div 2 = 8$. $30 \\div 5 = 6$ because $5 \\times 6 = 30$.'),
  t(7, '### Word Problems\n\n**Example 1:** A teacher in Bloemfontein has $24$ pencils. She gives $4$ pencils to each learner. How many learners get pencils?\n$$24 \\div 4 = 6 \\text{ learners}$$\n\n**Example 2:** $35$ children sit in rows of $5$. How many rows?\n$$35 \\div 5 = 7 \\text{ rows}$$\n\n**Example 3:** Busi has $22$ stickers to share equally among $5$ friends. How many does each friend get?\n$$22 \\div 5 = 4 \\text{ r } 2$$\nEach friend gets $4$ stickers. $2$ stickers are left over.'),
  q(8, 'What is $40 \\div 10$?',
    ['$4$', '$5$', '$3$', '$10$'], 0,
    '$10 \\times 4 = 40$, so $40 \\div 10 = 4$.'),
  q(9, '$19 \\div 4 = ?$',
    ['$4$ r $3$', '$5$ r $1$', '$4$ r $1$', '$3$ r $7$'], 0,
    '$4 \\times 4 = 16$. $19 - 16 = 3$. So $19 \\div 4 = 4$ remainder $3$.'),
  fb(10, 'If $5 \\times 6 = 30$, then $30 \\div 6 = ___$. Division is the ___ of multiplication.',
    ['5', 'inverse'],
    '$30 \\div 6 = 5$. Division undoes multiplication — they are inverse operations.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Common Fractions (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Common Fractions\n\nA **fraction** is a part of a whole.\n\nThe **top number** (numerator) tells how many parts we have.\nThe **bottom number** (denominator) tells how many equal parts in total.\n\n$$\\frac{1}{2} = \\text{one half} \\qquad \\frac{1}{4} = \\text{one quarter} \\qquad \\frac{1}{3} = \\text{one third}$$\n\n### Fractions of Shapes\n\nIf you cut a pizza into $4$ equal slices and eat $1$ slice, you have eaten $\\frac{1}{4}$ of the pizza.\n\nIf you colour $3$ out of $8$ equal parts of a rectangle, you have coloured $\\frac{3}{8}$.'),
  t(2, '### Equal Parts Are Important!\n\nFractions only work when the parts are **equal**.\n\nIf a chocolate bar is broken into $2$ pieces that are not the same size, those are NOT halves.\n\n### More Fraction Names\n\n$$\\frac{1}{5} = \\text{one fifth} \\qquad \\frac{1}{8} = \\text{one eighth}$$\n\n$$\\frac{2}{3} = \\text{two thirds} \\qquad \\frac{3}{4} = \\text{three quarters}$$\n\n### Fractions of a Group\n\nYou can find a fraction of a group of objects.\n\n**Example:** Find $\\frac{1}{3}$ of $12$ sweets.\n$$12 \\div 3 = 4$$\nSo $\\frac{1}{3}$ of $12 = 4$ sweets.'),
  q(3, 'What is $\\frac{1}{4}$ of $20$?',
    ['$5$', '$4$', '$10$', '$8$'], 0,
    '$\\frac{1}{4}$ of $20$ means $20 \\div 4 = 5$.'),
  t(4, '### Comparing Fractions\n\nWhen we cut a cake into more pieces, each piece is **smaller**.\n\n$$\\frac{1}{2} > \\frac{1}{4} > \\frac{1}{8}$$\n\nOne half is bigger than one quarter, which is bigger than one eighth.\n\n### Equal Sharing and Fractions\n\n**Example:** $3$ children share $2$ pies equally. How much does each child get?\n\nEach child gets $\\frac{2}{3}$ of a pie.\n\n**Example:** $4$ friends share $3$ chocolates equally.\nEach friend gets $\\frac{3}{4}$ of a chocolate.'),
  q(5, 'Which fraction is bigger: $\\frac{1}{3}$ or $\\frac{1}{5}$?',
    ['$\\frac{1}{3}$', '$\\frac{1}{5}$', 'They are the same', 'You cannot compare them'], 0,
    'When the top number is the same, the fraction with the smaller bottom number is bigger. $\\frac{1}{3} > \\frac{1}{5}$.'),
  fb(6, '$\\frac{1}{2}$ of $18 = ___$. In the fraction $\\frac{3}{5}$, the denominator is ___.',
    ['9', '5'],
    '$18 \\div 2 = 9$. The denominator (bottom number) of $\\frac{3}{5}$ is $5$.'),
  t(7, '### Fractions in Everyday Life\n\n**Example 1:** Mama cuts a loaf of bread into $8$ equal slices. The family eats $5$ slices. What fraction is left?\n$$\\frac{8 - 5}{8} = \\frac{3}{8} \\text{ of the loaf is left}$$\n\n**Example 2:** Thandi picks $15$ flowers. She gives $\\frac{1}{5}$ to her teacher. How many flowers does the teacher get?\n$$15 \\div 5 = 3 \\text{ flowers}$$\n\n**Example 3:** A farmer in Mpumalanga has $20$ cows. $\\frac{1}{4}$ of them are brown. How many are brown?\n$$20 \\div 4 = 5 \\text{ brown cows}$$'),
  q(8, 'A pizza is cut into $8$ equal slices. You eat $3$ slices. What fraction did you eat?',
    ['$\\frac{3}{8}$', '$\\frac{8}{3}$', '$\\frac{3}{5}$', '$\\frac{5}{8}$'], 0,
    'You ate $3$ out of $8$ equal slices, so you ate $\\frac{3}{8}$ of the pizza.'),
  fb(9, '$\\frac{1}{2}$ of $10 = ___$. $\\frac{1}{5}$ of $10 = ___$.',
    ['5', '2'],
    '$10 \\div 2 = 5$. $10 \\div 5 = 2$.'),
  q(10, '$6$ friends share $4$ pies equally. What fraction of a pie does each friend get?',
    ['$\\frac{4}{6}$', '$\\frac{6}{4}$', '$\\frac{2}{3}$', '$\\frac{1}{6}$'], 0,
    '$4$ pies shared among $6$ friends means each gets $\\frac{4}{6}$. (This is the same as $\\frac{2}{3}$, but $\\frac{4}{6}$ is correct.)'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Money (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Money\n\nIn South Africa we use **Rand** (R) and **cents** (c).\n\n$$\\text{R}1 = 100 \\text{ cents}$$\n\n### SA Coins and Notes\n\n**Coins:** 10c, 20c, 50c, R1, R2, R5\n\n**Notes:** R10, R20, R50, R100, R200\n\n### Counting Money\n\nAlways start with the biggest coin or note and add the rest.\n\n**Example:** You have: R50 note + R20 note + R5 coin + R2 coin + 50c coin\n$$50 + 20 + 5 + 2 + 0{,}50 = \\text{R}77{,}50$$'),
  t(2, '### Making Amounts\n\nThere are different ways to make the same amount.\n\n**Make R15:**\n- One R10 note + one R5 coin\n- Three R5 coins\n- One R10 note + two R2 coins + one R1 coin\n\n### Adding Money\n\n**Example:** A bread roll costs R$4{,}50$ and milk costs R$12{,}00$. What is the total?\n$$4{,}50 + 12{,}00 = \\text{R}16{,}50$$\n\n**Example:** A rubber costs R$3{,}50$. A pencil costs R$2{,}50$. A ruler costs R$5{,}00$.\n$$3{,}50 + 2{,}50 + 5{,}00 = \\text{R}11{,}00$$'),
  q(3, 'How many R$2$ coins make R$10$?',
    ['$5$', '$4$', '$6$', '$8$'], 0,
    '$10 \\div 2 = 5$, so you need $5$ coins of R$2$ to make R$10$.'),
  t(4, '### Buying and Getting Change\n\nWhen you pay more than the price, you get **change** back.\n\n$$\\text{Change} = \\text{Money paid} - \\text{Price}$$\n\n**Example 1:** You buy a drink for R$8{,}50$. You pay with a R$10$ note. Your change is:\n$$10{,}00 - 8{,}50 = \\text{R}1{,}50$$\n\n**Example 2:** At a tuck shop in Polokwane, Jabu buys a pie for R$15$ and a juice for R$7$. He pays with a R$50$ note.\n- Total cost: $15 + 7 = \\text{R}22$\n- Change: $50 - 22 = \\text{R}28$'),
  q(5, 'Naledi buys a pencil case for R$35$ and crayons for R$18$. She pays with a R$100$ note. How much change does she get?',
    ['R$47$', 'R$53$', 'R$57$', 'R$43$'], 0,
    'Total: $35 + 18 = \\text{R}53$. Change: $100 - 53 = \\text{R}47$.'),
  fb(6, 'R$1$ = ___ cents. If a sweet costs R$1{,}50$ and you buy $2$, the total is R___.',
    ['100', '3,00'],
    'R$1$ is $100$ cents. Two sweets: $1{,}50 + 1{,}50 = \\text{R}3{,}00$.'),
  t(7, '### Word Problems with Money\n\n**Example 1:** Mama gives each of her $3$ children R$5$ for the tuck shop. How much does she give altogether?\n$$3 \\times 5 = \\text{R}15$$\n\n**Example 2:** A book at the school fair costs R$25$. Sipho has R$18$. How much more does he need?\n$$25 - 18 = \\text{R}7$$\n\n**Example 3:** Gogo buys $4$ litres of milk at R$16$ each. How much does she pay?\n$$4 \\times 16 = \\text{R}64$$'),
  q(8, 'A loaf of bread costs R$18$ and butter costs R$32$. How much do you pay for both?',
    ['R$50$', 'R$40$', 'R$60$', 'R$48$'], 0,
    '$18 + 32 = \\text{R}50$.'),
  fb(9, 'You have two R$20$ notes and three R$5$ coins. The total amount is R___.',
    ['55'],
    '$20 + 20 + 5 + 5 + 5 = \\text{R}55$.'),
  q(10, 'Thabo has R$50$. He buys a sandwich for R$22{,}50$. How much change does he get?',
    ['R$27{,}50$', 'R$28{,}50$', 'R$27{,}00$', 'R$22{,}50$'], 0,
    '$50{,}00 - 22{,}50 = \\text{R}27{,}50$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Time (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Time\n\n### Reading an Analogue Clock\n\nAn analogue clock has a **short hand** (hours) and a **long hand** (minutes).\n\n- When the long hand points to $12$, it is **o\'clock**.\n- When the long hand points to $6$, it is **half past**.\n- When the long hand points to $3$, it is **quarter past**.\n- When the long hand points to $9$, it is **quarter to**.\n\n**Examples:**\n- Short hand on $3$, long hand on $12$: **3 o\'clock**\n- Short hand between $7$ and $8$, long hand on $6$: **half past 7**\n- Short hand just past $10$, long hand on $3$: **quarter past 10**'),
  t(2, '### Days of the Week and Months of the Year\n\n**Days of the week:** Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday\n\nThere are $7$ days in a week.\n\n**Months of the year:**\n| Month | Days |\n|---|---|\n| January | 31 |\n| February | 28 (or 29) |\n| March | 31 |\n| April | 30 |\n| May | 31 |\n| June | 30 |\n| July | 31 |\n| August | 31 |\n| September | 30 |\n| October | 31 |\n| November | 30 |\n| December | 31 |\n\nThere are $12$ months in a year.'),
  q(3, 'If the short hand is on $9$ and the long hand is on $6$, what time is it?',
    ['Half past 9', 'Quarter past 9', '9 o\'clock', 'Quarter to 10'], 0,
    'The long hand on $6$ means half past. So it is half past $9$.'),
  t(4, '### Calendars\n\nA calendar shows the days of each month.\n\n**Yesterday, today, tomorrow:**\n- If today is Wednesday, then yesterday was Tuesday and tomorrow is Thursday.\n\n**Example:** If today is Friday $15$ March, what is the date next Monday?\n- Saturday $16$, Sunday $17$, Monday $18$ March.\n\n### How Many Days?\n\nTo find the number of days between dates, count on from the first day.\n\n**Example:** From $3$ April to $10$ April is $10 - 3 = 7$ days.'),
  q(5, 'How many days are in the month of June?',
    ['$30$', '$31$', '$28$', '$29$'], 0,
    'June has $30$ days. Remember: "30 days have September, April, June, and November."'),
  fb(6, 'There are ___ days in a week. There are ___ months in a year.',
    ['7', '12'],
    'A week has $7$ days and a year has $12$ months.'),
  t(7, '### Quarter Hours\n\n**Quarter past** means $15$ minutes after the hour.\n**Quarter to** means $15$ minutes before the next hour.\n\n**Example:**\n- Quarter past $2$ = 2:15\n- Quarter to $5$ = 4:45\n- Half past $11$ = 11:30\n\n### Time in Daily Life\n\n**Example:** School starts at $8$ o\'clock. Break is at half past $10$. How long from school start to break?\n- From $8$:$00$ to $10$:$30$ is $2$ hours and $30$ minutes.'),
  q(8, 'What does "quarter to $3$" mean in numbers?',
    ['2:45', '3:15', '3:45', '2:15'], 0,
    'Quarter to $3$ means $15$ minutes before $3$ o\'clock, which is $2$:$45$.'),
  fb(9, 'Quarter past $6$ in numbers is ___. Half past $12$ in numbers is ___.',
    ['6:15', '12:30'],
    'Quarter past $6 = 6$:$15$. Half past $12 = 12$:$30$.'),
  q(10, 'If today is Thursday, what day was it $3$ days ago?',
    ['Monday', 'Tuesday', 'Wednesday', 'Sunday'], 0,
    'Count backwards $3$ days from Thursday: Wednesday, Tuesday, Monday.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Length (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Length\n\nLength tells us how **long** or **short** something is.\n\n### Units of Length\n\n- We measure short things in **centimetres** (cm).\n- We measure long things in **metres** (m).\n\n$$1 \\text{ metre} = 100 \\text{ centimetres}$$\n$$1 \\text{ m} = 100 \\text{ cm}$$\n\n**Examples of lengths:**\n- A pencil is about $17$ cm long.\n- A ruler is $30$ cm long.\n- A classroom door is about $2$ m tall.\n- A soccer field is about $100$ m long.'),
  t(2, '### Measuring with a Ruler\n\nTo measure with a ruler:\n1. Line up one end of the object with the $0$ mark.\n2. Read the number at the other end.\n\n**Important:** Start at $0$, not at $1$!\n\n### Comparing Lengths\n\nWe use the words **longer**, **shorter**, and **the same length**.\n\n**Example:** A crayon is $9$ cm. A pen is $14$ cm.\n- The pen is **longer** ($14 > 9$).\n- The crayon is **shorter**.\n- The difference is $14 - 9 = 5$ cm.'),
  q(3, 'How many centimetres are in $1$ metre?',
    ['$100$', '$10$', '$1\\,000$', '$50$'], 0,
    '$1$ metre $= 100$ centimetres.'),
  t(4, '### Estimating Length\n\nBefore measuring, you can **estimate** (make a good guess).\n\n**Tips for estimating:**\n- Your thumb is about $1$ cm wide.\n- Your hand span is about $15$ cm.\n- A big step is about $1$ m.\n\n**Example:** Estimate the length of your desk, then measure it with a ruler.\n- Estimate: about $60$ cm\n- Measured: $58$ cm\n- Good estimate!\n\n### Metres and Centimetres Together\n\nWe can write lengths using both units.\n\n**Example:** $1$ m $35$ cm means $135$ cm.\n**Example:** $250$ cm $= 2$ m $50$ cm.'),
  q(5, 'A piece of ribbon is $1$ m $20$ cm long. How many centimetres is that?',
    ['$120$ cm', '$12$ cm', '$102$ cm', '$1\\,020$ cm'], 0,
    '$1$ m $= 100$ cm, so $1$ m $20$ cm $= 100 + 20 = 120$ cm.'),
  fb(6, 'A pencil is $18$ cm long and a pen is $15$ cm long. The pencil is ___ cm longer. $2$ m $= $ ___ cm.',
    ['3', '200'],
    '$18 - 15 = 3$ cm. $2$ m $= 2 \\times 100 = 200$ cm.'),
  t(7, '### Real-Life Length Problems\n\n**Example 1:** Sipho walks $3$ m to the gate and then $5$ m to the road. How far does he walk?\n$$3 + 5 = 8 \\text{ m}$$\n\n**Example 2:** A table is $1$ m $50$ cm long. A bookshelf is $90$ cm long. How much longer is the table?\n$$150 - 90 = 60 \\text{ cm longer}$$\n\n**Example 3:** Thandi has a piece of string that is $80$ cm long. She cuts off $25$ cm. How long is the remaining piece?\n$$80 - 25 = 55 \\text{ cm}$$'),
  q(8, 'Which is longer: $95$ cm or $1$ m?',
    ['$1$ m', '$95$ cm', 'They are the same', 'You cannot compare them'], 0,
    '$1$ m $= 100$ cm. Since $100 > 95$, $1$ m is longer.'),
  fb(9, 'Your hand span is about ___ cm. A big step is about ___ m.',
    ['15', '1'],
    'A hand span is roughly $15$ cm and a big step is roughly $1$ m.'),
  q(10, 'A garden path is $4$ m long. How many centimetres is that?',
    ['$400$ cm', '$40$ cm', '$4\\,000$ cm', '$44$ cm'], 0,
    '$4$ m $= 4 \\times 100 = 400$ cm.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Mass (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Mass\n\nMass tells us how **heavy** or **light** something is.\n\n### Units of Mass\n\nWe measure mass in **kilograms** (kg).\n\n**Examples:**\n- A bag of sugar is $1$ kg.\n- A bag of potatoes is about $5$ kg.\n- A small child weighs about $20$ kg.\n- A grown-up weighs about $70$ kg.\n\n### Heavy and Light\n\nWe can compare objects using the words **heavier**, **lighter**, and **the same mass**.'),
  t(2, '### Measuring Mass with a Balance Scale\n\nA **balance scale** has two sides. We put the object on one side and weights on the other.\n\n- If the sides are level, the mass is **equal**.\n- If one side is lower, that side is **heavier**.\n\n**Example:** You put an apple on one side and a $200$ g weight on the other side. The sides are level. The apple has a mass of $200$ g.\n\n### Kilograms and Grams\n\n$$1 \\text{ kg} = 1\\,000 \\text{ g}$$\n\n**Example:** A packet of chips has a mass of $125$ g. You need $8$ packets to make $1$ kg ($8 \\times 125 = 1\\,000$ g).'),
  q(3, 'Which is heavier: a $2$ kg bag of rice or a $500$ g tin of beans?',
    ['The $2$ kg bag of rice', 'The $500$ g tin of beans', 'They are the same', 'You cannot tell'], 0,
    '$2$ kg $= 2\\,000$ g, which is much more than $500$ g. The bag of rice is heavier.'),
  t(4, '### Comparing and Ordering by Mass\n\nTo compare, make sure both amounts are in the same unit.\n\n**Example:** Arrange from lightest to heaviest: $3$ kg, $500$ g, $1$ kg $200$ g\n- $500$ g $= 0{,}5$ kg\n- $1$ kg $200$ g $= 1\\,200$ g $= 1{,}2$ kg\n- $3$ kg\n\nOrder: $500$ g, $1$ kg $200$ g, $3$ kg\n\n### Estimating Mass\n\nHolding objects helps you estimate. Pick them up and compare to something you know.\n\n- A litre of water has a mass of about $1$ kg.\n- An egg has a mass of about $60$ g.'),
  q(5, 'A watermelon has a mass of $3$ kg. A pineapple has a mass of $1$ kg. How much heavier is the watermelon?',
    ['$2$ kg', '$3$ kg', '$4$ kg', '$1$ kg'], 0,
    '$3 - 1 = 2$ kg heavier.'),
  fb(6, '$1$ kg $= $ ___ g. A bag of flour is usually ___ kg.',
    ['1 000', '2,5'],
    '$1$ kg $= 1\\,000$ g. A standard bag of flour is $2{,}5$ kg.'),
  t(7, '### Real-Life Mass Problems\n\n**Example 1:** Mama buys $2$ kg of chicken and $1$ kg of mince at the butcher in Nelspruit. What is the total mass?\n$$2 + 1 = 3 \\text{ kg}$$\n\n**Example 2:** A school bag weighs $4$ kg when full. After taking out books weighing $1$ kg $500$ g, how heavy is the bag?\n$$4\\,000 - 1\\,500 = 2\\,500 \\text{ g} = 2 \\text{ kg } 500 \\text{ g}$$\n\n**Example 3:** Each brick has a mass of $3$ kg. What is the mass of $5$ bricks?\n$$5 \\times 3 = 15 \\text{ kg}$$'),
  q(8, 'A packet of sweets is $250$ g. How many packets do you need to make $1$ kg?',
    ['$4$', '$2$', '$5$', '$10$'], 0,
    '$1$ kg $= 1\\,000$ g. $1\\,000 \\div 250 = 4$ packets.'),
  fb(9, 'A tomato has a mass of about $100$ g. You need ___ tomatoes to make $1$ kg.',
    ['10'],
    '$1\\,000 \\div 100 = 10$ tomatoes.'),
  q(10, 'Which unit would you use to measure the mass of a cat: grams or kilograms?',
    ['Kilograms', 'Grams', 'Metres', 'Litres'], 0,
    'A cat is quite heavy (about $4$–$5$ kg), so we use kilograms.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Capacity (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Capacity\n\nCapacity tells us how much liquid a container can **hold**.\n\n### Full, Half Full, and Empty\n\n- A **full** glass has no room for more water.\n- A **half full** glass is filled to the middle.\n- An **empty** glass has no water at all.\n\n### Units of Capacity\n\nWe measure capacity in **litres** ($\\ell$).\n\n**Examples:**\n- A cup holds about $250$ m$\\ell$ (millilitres).\n- A cool-drink bottle holds $2$ $\\ell$.\n- A bucket holds about $10$ $\\ell$.\n- A bath holds about $150$ $\\ell$.\n\n$$1 \\text{ litre} = 1\\,000 \\text{ millilitres}$$'),
  t(2, '### Measuring Capacity\n\nWe can measure capacity by **pouring** from one container to another.\n\n**Example:** How many cups of water fill a $1$-litre bottle?\n- A cup holds $250$ m$\\ell$.\n- $1\\,000 \\div 250 = 4$ cups.\n- So $4$ cups fill a $1$-litre bottle.\n\n### Comparing Capacity\n\nWe use the words **more than**, **less than**, and **the same capacity**.\n\n**Example:** A teapot holds $1$ $\\ell$. A jug holds $2$ $\\ell$.\n- The jug holds **more**.\n- The teapot holds **less**.\n- The jug holds $2 - 1 = 1$ $\\ell$ more.'),
  q(3, 'How many millilitres are in $1$ litre?',
    ['$1\\,000$', '$100$', '$10$', '$500$'], 0,
    '$1$ litre $= 1\\,000$ millilitres.'),
  t(4, '### Ordering by Capacity\n\nArrange from smallest to biggest capacity:\n- A cup ($250$ m$\\ell$)\n- A bottle ($1$ $\\ell$)\n- A bucket ($10$ $\\ell$)\n\nOrder: cup, bottle, bucket.\n\n### Estimating Capacity\n\n**Tips:**\n- A teaspoon is about $5$ m$\\ell$.\n- A glass is about $250$ m$\\ell$.\n- A juice box is about $200$ m$\\ell$.\n\n**Example:** Does a sink hold about $5$ $\\ell$, $15$ $\\ell$, or $50$ $\\ell$?\n- A sink holds about $15$ $\\ell$ (bigger than a bucket but smaller than a bath).'),
  q(5, 'A water bottle holds $500$ m$\\ell$. How many bottles fill a $2$-litre container?',
    ['$4$', '$2$', '$5$', '$3$'], 0,
    '$2$ $\\ell$ $= 2\\,000$ m$\\ell$. $2\\,000 \\div 500 = 4$ bottles.'),
  fb(6, '$1$ litre $= $ ___ millilitres. A cool-drink bottle usually holds ___ litres.',
    ['1 000', '2'],
    '$1$ litre $= 1\\,000$ millilitres. A standard cool-drink bottle holds $2$ litres.'),
  t(7, '### Real-Life Capacity Problems\n\n**Example 1:** Gogo makes $5$ litres of juice for a party in KwaZulu-Natal. She pours it into glasses of $250$ m$\\ell$. How many glasses can she fill?\n$$5\\,000 \\div 250 = 20 \\text{ glasses}$$\n\n**Example 2:** A fish tank holds $20$ $\\ell$. It is half full. How much water is in the tank?\n$$20 \\div 2 = 10 \\text{ litres}$$\n\n**Example 3:** Dad fills $3$ buckets with $10$ $\\ell$ each to wash the car. How much water does he use?\n$$3 \\times 10 = 30 \\text{ litres}$$'),
  q(8, 'Which holds more: a teaspoon ($5$ m$\\ell$) or a tablespoon ($15$ m$\\ell$)?',
    ['A tablespoon', 'A teaspoon', 'They hold the same', 'Neither holds liquid'], 0,
    '$15$ m$\\ell$ is more than $5$ m$\\ell$, so a tablespoon holds more.'),
  fb(9, 'A swimming pool holds much more than $1\\,000$ litres. A glass holds about ___ m$\\ell$.',
    ['250'],
    'A standard drinking glass holds about $250$ millilitres.'),
  q(10, 'If you pour $3$ cups of $250$ m$\\ell$ into a bowl, how much is in the bowl?',
    ['$750$ m$\\ell$', '$500$ m$\\ell$', '$1\\,000$ m$\\ell$', '$250$ m$\\ell$'], 0,
    '$3 \\times 250 = 750$ m$\\ell$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: 2D Shapes and 3D Objects (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch11_lesson1 = [
  t(1, '## 2D Shapes and 3D Objects\n\n### 2D Shapes (Flat Shapes)\n\n**2D** means two-dimensional — flat shapes that have **length** and **width** but no thickness.\n\n| Shape | Sides | Corners |\n|---|---|---|\n| Circle | 0 (curved) | 0 |\n| Triangle | 3 | 3 |\n| Square | 4 (all equal) | 4 |\n| Rectangle | 4 (opposite sides equal) | 4 |\n\n**A square is a special rectangle** — all four sides are the same length.\n\n### Shapes in Our World\n\n- A **clock** is a circle.\n- A **window** is usually a rectangle.\n- A **slice of pizza** looks like a triangle.\n- A **tile** on the floor is often a square.'),
  t(2, '### 3D Objects (Solid Objects)\n\n**3D** means three-dimensional — objects that have **length**, **width**, and **height**.\n\n| Object | Shape of faces |\n|---|---|\n| Cube | 6 square faces |\n| Sphere (ball) | No flat faces (all curved) |\n| Cylinder (tin) | 2 circle faces + 1 curved surface |\n| Cone (ice cream) | 1 circle face + 1 curved surface |\n\n**Examples in real life:**\n- A **dice** is a cube.\n- A **soccer ball** is a sphere.\n- A **tin of beans** is a cylinder.\n- An **ice-cream cone** is a cone.'),
  q(3, 'How many sides does a triangle have?',
    ['$3$', '$4$', '$2$', '$5$'], 0,
    'A triangle has $3$ sides. The word "tri" means three.'),
  t(4, '### Sorting Shapes\n\nWe can sort shapes by:\n- **Number of sides** (3, 4, 5, ...)\n- **Straight or curved lines**\n- **Flat faces or curved surfaces**\n\n**Straight sides:** triangles, squares, rectangles\n**Curved:** circles\n\n### Faces, Edges, and Corners of 3D Objects\n\nA **face** is a flat surface.\nAn **edge** is where two faces meet.\nA **corner** (vertex) is where edges meet.\n\n| Object | Faces | Edges | Corners |\n|---|---|---|---|\n| Cube | 6 | 12 | 8 |\n| Cylinder | 2 flat + 1 curved | 2 | 0 |\n| Cone | 1 flat + 1 curved | 1 | 1 (the tip) |'),
  q(5, 'Which 3D object has no flat faces at all?',
    ['Sphere', 'Cube', 'Cylinder', 'Cone'], 0,
    'A sphere (like a ball) has no flat faces — it is curved all around.'),
  fb(6, 'A square has ___ equal sides. A cube has ___ faces.',
    ['4', '6'],
    'A square has $4$ equal sides. A cube has $6$ square faces.'),
  t(7, '### Recognising Shapes Around Us\n\n**At school in South Africa, you can find:**\n- The **chalkboard** is a rectangle.\n- The **wheels** on a bicycle are circles.\n- A **box of crayons** is shaped like a rectangular prism.\n- A **party hat** is a cone.\n- A **tennis ball** is a sphere.\n\n### Flat vs. Solid\n\nA 2D shape is like a **drawing** on paper. You can see it but you cannot pick it up.\n\nA 3D object is something you can **hold** in your hand. It takes up space.'),
  q(8, 'What shape are the faces of a dice (cube)?',
    ['Squares', 'Circles', 'Triangles', 'Rectangles'], 0,
    'A cube has $6$ faces and each one is a square.'),
  fb(9, 'A cylinder has ___ circular faces. A cone has ___ circular face.',
    ['2', '1'],
    'A cylinder has $2$ circle faces (top and bottom). A cone has $1$ circle face (the base).'),
  q(10, 'Which shape has $4$ sides where opposite sides are equal but not all sides are the same length?',
    ['Rectangle', 'Square', 'Triangle', 'Circle'], 0,
    'A rectangle has $4$ sides. Opposite sides are equal, but the length and width can be different.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Data Handling (Term 4) — Lesson 1
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Data Handling — Collecting and Showing Data\n\n### What Is Data?\n\n**Data** is information that we collect. In Grade 3, we collect data by **asking questions** and **counting**.\n\n**Example question:** "What is your favourite fruit?"\n\nWe ask our classmates and write down their answers.\n\n### Tally Marks\n\nWe use **tally marks** to count answers. Every fifth tally crosses the first four:\n\n| | | | | means $4$ \n\n| | | | ~~|~~ means $5$\n\n**Example:**\n| Fruit | Tally | Total |\n|---|---|---|\n| Apple | ~~||||~~ | 5 |\n| Banana | |||| | 4 |\n| Orange | ~~||||~~ || | 7 |\n| Grape | ||| | 3 |'),
  t(2, '### Pictographs\n\nA **pictograph** uses pictures to show data. Each picture stands for a number.\n\n**Example:** Favourite sport in a Grade 3 class (each ⚽ = $2$ children)\n\n| Sport | Pictures | Total |\n|---|---|---|\n| Soccer | ⚽⚽⚽⚽ | 8 |\n| Netball | ⚽⚽⚽ | 6 |\n| Cricket | ⚽⚽ | 4 |\n| Swimming | ⚽ | 2 |\n\n**Reading the pictograph:** Soccer has $4$ pictures, and each picture means $2$ children, so $4 \\times 2 = 8$ children like soccer.\n\n### Bar Graphs\n\nA **bar graph** uses bars to show data. Taller bars mean bigger numbers.\n\nThe bars must all be the **same width** with **equal spaces** between them.'),
  q(3, 'In the fruit tally table above, which fruit is the most popular?',
    ['Orange', 'Apple', 'Banana', 'Grape'], 0,
    'Orange has $7$ tallies, which is the highest. Orange is the most popular fruit.'),
  t(4, '### Making a Bar Graph\n\n**Steps to draw a bar graph:**\n1. Draw the two axes (lines) — one going across, one going up.\n2. Write the **categories** (e.g., fruit names) along the bottom.\n3. Write the **numbers** up the side.\n4. Draw a bar for each category up to the correct number.\n5. Give the graph a **title**.\n\n**Example:** Using the fruit data:\n- Apple: bar up to $5$\n- Banana: bar up to $4$\n- Orange: bar up to $7$\n- Grape: bar up to $3$\n\nThe tallest bar is for orange — it is the favourite.'),
  q(5, 'In a pictograph, each picture stands for $2$ children. If netball has $5$ pictures, how many children chose netball?',
    ['$10$', '$5$', '$7$', '$12$'], 0,
    '$5$ pictures $\\times 2 = 10$ children.'),
  fb(6, 'We use ___ marks to count data quickly. In a bar graph, the tallest bar shows the ___ popular choice.',
    ['tally', 'most'],
    'Tally marks help us count. The tallest bar in a bar graph represents the most popular choice.'),
  t(7, '### Collecting Your Own Data\n\n**Activity idea:** Ask $20$ classmates: "What is your favourite colour?"\n\n1. Write down each answer using tally marks.\n2. Count the tallies and write the totals.\n3. Draw a bar graph to show the results.\n4. Write a sentence about what you found.\n\n**Example sentence:** "Blue is the most popular colour in our class because it has the tallest bar."'),
  q(8, 'You ask $15$ friends about their favourite animal. $6$ say dog, $4$ say cat, $3$ say bird, and $2$ say fish. Which animal is least popular?',
    ['Fish', 'Bird', 'Cat', 'Dog'], 0,
    'Fish was chosen by only $2$ friends, which is the smallest number.'),
  fb(9, 'A pictograph uses ___ to represent data. A bar graph uses ___ to represent data.',
    ['pictures', 'bars'],
    'Pictographs use small pictures and bar graphs use rectangular bars.'),
  q(10, 'In a tally, how many marks does ~~||||~~ represent?',
    ['$5$', '$4$', '$6$', '$10$'], 0,
    'Four vertical lines with one line crossing through them equals $5$.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Data Handling (Term 4) — Lesson 2
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch12_lesson2 = [
  t(1, '## Data Handling — Reading Graphs and Chance\n\n### Reading and Answering Questions About Graphs\n\nWhen you look at a graph, you can answer questions like:\n- Which category has the **most**?\n- Which has the **least**?\n- How many **more** does one have than another?\n- How many **altogether**?\n\n**Example:** A bar graph shows favourite juice flavours:\n| Flavour | Number of children |\n|---|---|\n| Orange | 8 |\n| Apple | 5 |\n| Grape | 3 |\n| Mango | 6 |\n\n- Most popular: **Orange** ($8$)\n- Least popular: **Grape** ($3$)\n- How many more chose orange than grape? $8 - 3 = 5$\n- Total: $8 + 5 + 3 + 6 = 22$ children'),
  t(2, '### Favourite Things Surveys\n\nA **survey** is when you ask people questions and collect their answers.\n\n**Good survey questions for Grade 3:**\n- "What is your favourite school subject?"\n- "What is your favourite weekend activity?"\n- "How do you get to school?"\n\n**Steps for a survey:**\n1. Choose a question.\n2. Ask at least $15$ people.\n3. Record answers with tally marks.\n4. Make a table with totals.\n5. Draw a pictograph or bar graph.\n6. Write $2$ sentences about what you found.'),
  q(3, 'Look at the juice data above. How many children were asked altogether?',
    ['$22$', '$20$', '$18$', '$24$'], 0,
    '$8 + 5 + 3 + 6 = 22$ children.'),
  t(4, '### Certain, Uncertain, and Impossible\n\nSome things are **sure to happen**, some **might happen**, and some can **never happen**.\n\n**Certain** (will definitely happen):\n- The sun will rise tomorrow.\n- If you drop a ball, it will fall down.\n\n**Uncertain** (might or might not happen):\n- It might rain tomorrow.\n- You might pick a red sweet from a bag of mixed sweets.\n\n**Impossible** (can never happen):\n- A dog can fly.\n- You will roll a $7$ on a normal dice (it only has $1$ to $6$).'),
  q(5, 'Is it certain, uncertain, or impossible that you will see a flying car today?',
    ['Impossible', 'Certain', 'Uncertain', 'Likely'], 0,
    'Cars cannot fly, so it is impossible.'),
  fb(6, 'If you flip a coin, getting heads is ___. Rolling a $7$ on a normal dice is ___.',
    ['uncertain', 'impossible'],
    'A coin can land on heads or tails — uncertain. A normal dice only has $1$–$6$, so $7$ is impossible.'),
  t(7, '### More About Chance\n\n**Likely** means something will probably happen.\n**Unlikely** means something probably will not happen.\n\n**Example:** A bag has $8$ red balls and $2$ blue balls.\n- Picking a red ball is **likely** (there are more red).\n- Picking a blue ball is **unlikely** (there are fewer blue).\n- Picking a green ball is **impossible** (there are none).\n\n**Example:** In South Africa in December, it is **likely** to be warm and sunny. It is **unlikely** to snow in Durban.'),
  q(8, 'A bag has $5$ red sweets and $1$ yellow sweet. If you pick one without looking, which colour are you more likely to pick?',
    ['Red', 'Yellow', 'Both are equally likely', 'Neither'], 0,
    'There are $5$ red and only $1$ yellow, so red is much more likely.'),
  fb(9, 'The sun rising tomorrow is ___. Getting a $6$ when you roll a dice is ___.',
    ['certain', 'uncertain'],
    'The sun always rises — certain. You might or might not roll a $6$ — uncertain.'),
  q(10, 'A class of $24$ children vote for their favourite season. Spring gets $9$ votes, Summer gets $7$, Autumn gets $5$, Winter gets $3$. How many more votes did Spring get than Winter?',
    ['$6$', '$5$', '$7$', '$4$'], 0,
    '$9 - 3 = 6$ more votes.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 3
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 3/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 3:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 3', schoolId: SCHOOL_ID, orderIndex: 3,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 3:', String(GRADE_ID));
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
    tags: ['grade-3', 'mathematics', 'caps'],
    language: 'en',
    status: 'published',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const chapters = [
    {
      title: 'Chapter 1: Numbers and Counting',
      description: 'Counting forwards and backwards in 1s, 2s, 5s, 10s up to 1000, number names, place value (hundreds, tens, ones), comparing and ordering numbers.',
      order: 1,
      lessons: [
        { title: 'Numbers and Counting', description: 'Counting in 1s, 2s, 5s, 10s up to 1000, number names, place value (hundreds, tens, ones), expanded form, comparing and ordering numbers.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Addition and Subtraction',
      description: 'Adding and subtracting up to 999, number bonds, breaking down numbers, checking with inverse operations, and word problems.',
      order: 2,
      lessons: [
        { title: 'Addition and Subtraction', description: 'Adding and subtracting up to 999, carrying and borrowing, number bonds of 100, checking with inverse operations, and word problems.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Multiplication',
      description: 'Repeated addition, groups of, multiplication tables (2, 3, 4, 5, 10), arrays, and doubling.',
      order: 3,
      lessons: [
        { title: 'Multiplication', description: 'Repeated addition, groups of, arrays, times tables (2, 3, 4, 5, 10), doubling, and word problems with equal groups.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Division',
      description: 'Sharing equally, grouping, halving, division as inverse of multiplication, and simple remainders.',
      order: 4,
      lessons: [
        { title: 'Division', description: 'Sharing equally, grouping, halving, division as the inverse of multiplication, simple remainders, and word problems.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Common Fractions',
      description: 'Halves, quarters, thirds, fifths, eighths, fractions of shapes, fractions of groups, and equal sharing.',
      order: 5,
      lessons: [
        { title: 'Common Fractions', description: 'Halves, quarters, thirds, fifths, eighths, fractions of shapes and groups, comparing unit fractions, and equal sharing problems.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Money',
      description: 'SA coins and notes, counting money, making amounts, buying and getting change, and simple word problems with Rand and cents.',
      order: 6,
      lessons: [
        { title: 'Money', description: 'South African coins and notes, counting money, making amounts, buying and getting change, and word problems with Rand and cents.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Time',
      description: 'Reading analogue clocks (hours, half hours, quarter hours), days of the week, months of the year, calendars, and yesterday/today/tomorrow.',
      order: 7,
      lessons: [
        { title: 'Time', description: 'Reading analogue clocks (o\'clock, half past, quarter past, quarter to), days of the week, months of the year, calendars, and time in daily life.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Length',
      description: 'Measuring in centimetres with a ruler, comparing lengths (longer/shorter), estimating length, metres and centimetres.',
      order: 8,
      lessons: [
        { title: 'Length', description: 'Measuring in centimetres with a ruler, metres and centimetres, comparing and estimating lengths, and real-life problems.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Mass',
      description: 'Heavy and light, kilograms, measuring with a balance scale, comparing mass, and ordering objects by mass.',
      order: 9,
      lessons: [
        { title: 'Mass', description: 'Heavy and light, kilograms and grams, measuring with a balance scale, comparing and ordering mass, and real-life problems.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Capacity',
      description: 'Full, half full, empty, litres, measuring with containers, comparing capacity, and ordering by capacity.',
      order: 10,
      lessons: [
        { title: 'Capacity', description: 'Full, half full, empty, litres and millilitres, measuring with containers, comparing and ordering capacity, and real-life problems.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: 2D Shapes and 3D Objects',
      description: 'Circles, triangles, squares, rectangles, recognising shapes in the environment, cubes, spheres, cylinders, cones, and sorting shapes.',
      order: 11,
      lessons: [
        { title: '2D Shapes and 3D Objects', description: 'Circles, triangles, squares, rectangles, cubes, spheres, cylinders, cones, faces, edges, corners, sorting shapes, and shapes in real life.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Data Handling',
      description: 'Collecting data by asking questions, tally marks, pictographs, bar graphs, reading and interpreting graphs, favourite things surveys, and certain/uncertain/impossible.',
      order: 12,
      lessons: [
        { title: 'Collecting and Showing Data', description: 'Collecting data by asking questions, tally marks, making pictographs and bar graphs, and organising data.', blocks: ch12_lesson1, term: 4 },
        { title: 'Reading Graphs and Chance', description: 'Reading and answering questions about graphs, favourite things surveys, and certain, uncertain, and impossible events.', blocks: ch12_lesson2, term: 4 },
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
    title: 'Grade 3 Mathematics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook for Grade 3 Mathematics covering Numbers and Counting, Addition and Subtraction, Multiplication, Division, Common Fractions, Money, Time, Length, Mass, Capacity, 2D Shapes and 3D Objects, and Data Handling.',
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
  console.log('  TEXTBOOK: Grade 3 Mathematics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
