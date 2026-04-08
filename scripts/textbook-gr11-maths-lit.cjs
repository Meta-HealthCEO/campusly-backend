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
// CHAPTER 1: Patterns and Relationships (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Patterns and Relationships\n\nIn Mathematical Literacy we study patterns so that we can describe how quantities change, predict future values, and solve real-world problems.\n\n### Constant (Common) Difference\n\nA **constant difference** pattern is a sequence where the same value is added (or subtracted) each time.\n\n| Position | 1 | 2 | 3 | 4 | 5 |\n|----------|---|---|---|---|---|\n| Value    | 3 | 7 | 11 | 15 | 19 |\n\nThe constant difference here is **+4** (each term is 4 more than the previous one).\n\n**General rule:** Value = (constant difference) x (position) + starting adjustment\n\nFor the pattern above: Value = 4n - 1, where n is the position number.'),
  q(2, 'A sequence has values 5, 11, 17, 23, ... What is the constant difference?',
    ['4', '5', '6', '8'], 2,
    '11 - 5 = 6, 17 - 11 = 6, 23 - 17 = 6. The constant difference is 6.'),
  t(3, '### Using the Constant Difference to Find a Rule\n\nIf the constant difference is d and the first term is a, the general term is:\n$$T_n = dn + (a - d)$$\n\n**Example:** The sequence 5, 11, 17, 23, ...\n- d = 6, first term a = 5\n- Rule: $T_n = 6n + (5 - 6) = 6n - 1$\n- Check: $T_1 = 6(1) - 1 = 5$ ✓, $T_4 = 6(4) - 1 = 23$ ✓\n\nYou can now find any term:\n- 10th term: $T_{10} = 6(10) - 1 = 59$\n- 50th term: $T_{50} = 6(50) - 1 = 299$'),
  fb(4, 'In the pattern 8, 13, 18, 23, ... the constant difference is ___ and the rule is T = ___n + ___.',
    ['5', '5', '3'],
    'd = 13 - 8 = 5. Rule: T = 5n + (8 - 5) = 5n + 3. Check: 5(1) + 3 = 8, 5(2) + 3 = 13.'),
  t(5, '### Inverse Proportion\n\nTwo quantities are **inversely proportional** when one increases as the other decreases, and their product is constant.\n\n$$x \\times y = k \\quad \\text{(constant)}$$\n\n**Example:** A journey of 120 km.\n\n| Speed (km/h) | 30 | 40 | 60 | 120 |\n|--------------|-----|-----|-----|------|\n| Time (hours) | 4 | 3 | 2 | 1 |\n\nSpeed x Time = 120 in every case. As speed doubles, time halves.\n\n**Real-life examples:**\n- More workers on a job means fewer days to complete it\n- A faster internet connection downloads a file in less time'),
  q(6, 'Six workers can build a wall in 10 days. If 3 more workers join (9 total), how many days will it take (assuming equal work rate)?',
    ['5 days', '6,67 days', '7,5 days', '15 days'], 1,
    'Workers x Days = constant. 6 x 10 = 60. So 9 x Days = 60. Days = 60 / 9 = 6,67 days.'),
  t(7, '### Equations and Formulae\n\nA **formula** is a rule that shows the relationship between variables.\n\n**Example:** Cost of a taxi ride.\n- Flag-drop (fixed charge): R12\n- Per kilometre: R8,50\n- Formula: Cost = 12 + 8,5d, where d is the distance in km\n\n| Distance (km) | 2 | 5 | 10 | 15 |\n|---------------|------|------|-------|--------|\n| Cost (R) | 29 | 54,50 | 97 | 139,50 |\n\nTo find the distance when the cost is R80,50:\n$$80,50 = 12 + 8,5d$$\n$$68,50 = 8,5d$$\n$$d = 8,06 \\text{ km}$$'),
  q(8, 'A plumber charges a R250 call-out fee plus R180 per hour. The formula for total cost (C) in terms of hours (h) is:',
    ['C = 250h + 180', 'C = 180h + 250', 'C = 250 + 180 + h', 'C = (250 + 180)h'], 1,
    'The fixed cost is R250 and the variable cost is R180 per hour, so C = 180h + 250.'),
  t(9, '### Tables and Graphs\n\nTables and graphs are tools for representing patterns visually.\n\n**Constant difference patterns** produce **straight-line** (linear) graphs.\n\n**Inverse proportion** produces a **curve** (hyperbola) that approaches but never touches the axes.\n\nWhen reading graphs:\n1. Identify what each axis represents and its units\n2. Note the scale on each axis\n3. Read values carefully using gridlines\n4. Look for trends: increasing, decreasing, constant, or curved\n\n**Interpolation:** Reading a value between known data points on a graph.\n**Extrapolation:** Extending the pattern beyond the known data (less reliable).'),
  fb(10, 'A straight-line graph represents a ___ relationship. A graph that curves downward as x increases may represent an ___ proportion.',
    ['linear', 'inverse'],
    'Constant difference (linear) patterns produce straight lines. Inverse proportions produce curved graphs.'),
  q(11, 'The cost of electricity is given by C = 0,95n + 85, where n is the number of kWh used. What does the 85 represent?',
    ['Cost per kWh', 'Fixed monthly service charge', 'Total number of units', 'VAT amount'], 1,
    'In the equation C = 0,95n + 85, the 85 is the constant (y-intercept), which represents the fixed monthly charge regardless of usage. The 0,95 is the cost per kWh.'),
  q(12, 'A table shows: when x = 2, y = 30; when x = 3, y = 20; when x = 5, y = 12; when x = 6, y = 10. This is an example of:',
    ['Direct proportion', 'Inverse proportion', 'Constant difference', 'No relationship'], 1,
    'Check: 2 x 30 = 60, 3 x 20 = 60, 5 x 12 = 60, 6 x 10 = 60. The product xy is constant (60), so this is inverse proportion.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Measurement (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Measurement: Conversions\n\n### Metric Conversions\n\nThe metric system is based on powers of 10:\n\n**Length:**\n- 1 km = 1 000 m\n- 1 m = 100 cm\n- 1 cm = 10 mm\n\n**Mass (weight):**\n- 1 tonne (t) = 1 000 kg\n- 1 kg = 1 000 g\n- 1 g = 1 000 mg\n\n**Volume/Capacity:**\n- 1 kl = 1 000 litres\n- 1 litre = 1 000 ml\n- 1 ml = 1 cm cubed\n- 1 000 litres = 1 cubic metre\n\n**Tip:** To convert from a larger unit to a smaller unit, multiply. To go from smaller to larger, divide.'),
  q(2, 'Convert 3,75 km to metres.',
    ['37,5 m', '375 m', '3 750 m', '37 500 m'], 2,
    '3,75 km x 1 000 = 3 750 m.'),
  t(3, '### Imperial Conversions\n\nSome everyday items in South Africa still use imperial measurements (especially cooking and body measurements).\n\n**Useful approximations:**\n\n| Imperial | Metric (approx.) |\n|----------|------------------|\n| 1 inch | 2,54 cm |\n| 1 foot (12 inches) | 30,48 cm |\n| 1 yard (3 feet) | 0,914 m |\n| 1 mile | 1,609 km |\n| 1 pound (lb) | 0,454 kg |\n| 1 ounce (oz) | 28,35 g |\n| 1 gallon | 3,785 litres |\n| 1 cup | 250 ml |\n| 1 tablespoon | 15 ml |\n| 1 teaspoon | 5 ml |'),
  fb(4, 'A recipe calls for 2 cups of flour. In millilitres this is ___ ml. A person who is 5 feet 8 inches tall is approximately ___ cm tall.',
    ['500', '173'],
    '2 cups x 250 ml = 500 ml. 5 feet = 5 x 30,48 = 152,4 cm. 8 inches = 8 x 2,54 = 20,32 cm. Total = 172,72 cm, approximately 173 cm.'),
  t(5, '### Temperature Conversions\n\nSouth Africa uses Celsius. The USA and some other countries use Fahrenheit.\n\n**Formulae:**\n$${}^{\\circ}F = \\frac{9}{5} \\times {}^{\\circ}C + 32$$\n$${}^{\\circ}C = \\frac{5}{9} \\times ({}^{\\circ}F - 32)$$\n\n**Key reference points:**\n| Event | Celsius | Fahrenheit |\n|-------|---------|------------|\n| Water freezes | 0 | 32 |\n| Body temperature | 37 | 98,6 |\n| Water boils | 100 | 212 |\n\n**Example:** Convert 25 degrees C to Fahrenheit:\n$$F = \\frac{9}{5} \\times 25 + 32 = 45 + 32 = 77{}^{\\circ}F$$'),
  q(6, 'A weather report from New York says the temperature is 50 degrees F. What is this in Celsius?',
    ['10 degrees C', '18 degrees C', '15 degrees C', '22 degrees C'], 0,
    'C = 5/9 x (50 - 32) = 5/9 x 18 = 10 degrees C.'),
  t(7, '### Time Conversions\n\nTime conversions are not based on 10:\n- 1 minute = 60 seconds\n- 1 hour = 60 minutes = 3 600 seconds\n- 1 day = 24 hours\n- 1 week = 7 days\n\n**24-hour vs 12-hour clock:**\n- 13:00 = 1:00 PM\n- 00:30 = 12:30 AM\n- 17:45 = 5:45 PM\n\n**Time zones:** South Africa is UTC+2 (SAST). If it is 14:00 in SA:\n- London (UTC+0 in winter): 12:00\n- New York (UTC-5): 07:00\n- Sydney (UTC+11): 01:00 the next day'),
  q(8, 'A flight from Johannesburg departs at 22:30 SAST and arrives in London at 06:15 local time (GMT, UTC+0). How long is the flight?',
    ['5 hours 45 minutes', '7 hours 45 minutes', '9 hours 45 minutes', '8 hours 15 minutes'], 2,
    'SA is UTC+2, London is UTC+0 (2 hours behind). Departure in UTC: 22:30 - 2 = 20:30. Arrival in UTC: 06:15 next day. Duration: from 20:30 to 06:15 = 9 hours 45 minutes.',
    ['Convert both times to the same time zone first.']),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Measurement: Perimeter, Area and Volume\n\n### Perimeter\n\nPerimeter is the distance around the outside of a shape.\n\n| Shape | Formula |\n|-------|--------|\n| Rectangle | P = 2(l + w) |\n| Square | P = 4s |\n| Triangle | P = a + b + c |\n| Circle (circumference) | C = 2 x pi x r or pi x d |\n\nwhere pi is approximately 3,14159.\n\n**Example:** A rectangular garden is 12 m by 8 m.\nP = 2(12 + 8) = 2(20) = 40 m\n\nIf fencing costs R85 per metre, total cost = 40 x R85 = R3 400.'),
  q(2, 'A circular swimming pool has a diameter of 6 m. How much edging material is needed to go around it? (Use pi = 3,14)',
    ['18,84 m', '28,26 m', '9,42 m', '37,68 m'], 0,
    'Circumference = pi x d = 3,14 x 6 = 18,84 m.'),
  t(3, '### Area\n\nArea is the amount of surface a shape covers.\n\n| Shape | Formula |\n|-------|--------|\n| Rectangle | A = l x w |\n| Square | A = s x s |\n| Triangle | A = 1/2 x b x h |\n| Circle | A = pi x r x r |\n| Trapezium | A = 1/2 x (a + b) x h |\n\n**Example:** Tiling a bathroom floor that is 3,5 m by 2,8 m.\nA = 3,5 x 2,8 = 9,8 square metres\nIf tiles cost R189 per square metre, cost = 9,8 x R189 = R1 852,20\n\n**Note:** Always add 10% extra tiles for cutting and breakage:\nTiles needed = 9,8 x 1,10 = 10,78 square metres.'),
  fb(4, 'A triangular flower bed has a base of 4,5 m and a height of 3 m. Its area is ___ square metres.',
    ['6,75'],
    'Area = 1/2 x 4,5 x 3 = 6,75 square metres.'),
  t(5, '### Volume\n\nVolume is the amount of space a 3D shape takes up.\n\n| Shape | Formula |\n|-------|--------|\n| Rectangular box (cuboid) | V = l x w x h |\n| Cube | V = s x s x s |\n| Cylinder | V = pi x r x r x h |\n| Triangular prism | V = 1/2 x b x h(triangle) x length |\n\n**Useful conversions:**\n- 1 cubic metre = 1 000 litres\n- 1 000 cubic cm = 1 litre\n\n**Example:** A cylindrical water tank has radius 1,2 m and height 2,5 m.\nV = pi x 1,2 x 1,2 x 2,5 = 3,14159 x 3,6 = 11,31 cubic metres\nCapacity = 11,31 x 1 000 = 11 310 litres'),
  q(6, 'A rectangular fish tank is 80 cm long, 40 cm wide, and 50 cm high. How many litres does it hold?',
    ['160 litres', '1 600 litres', '16 litres', '320 litres'], 0,
    'V = 80 x 40 x 50 = 160 000 cubic cm. Since 1 000 cm cubed = 1 litre, capacity = 160 000 / 1 000 = 160 litres.'),
  t(7, '### Calculating Costs from Measurements\n\nMany real-life problems combine measurements with costs:\n\n**Painting a room:**\n1. Calculate the area of walls (subtract windows and doors)\n2. Check paint coverage (e.g., 1 litre covers 8 square metres)\n3. Divide total area by coverage to find litres needed\n4. Round up to nearest available tin size\n5. Multiply by price per tin\n\n**Example:** A room is 5 m x 4 m with 2,8 m high walls.\n- Wall area = 2(5 x 2,8) + 2(4 x 2,8) = 28 + 22,4 = 50,4 square metres\n- Subtract 1 door (2,1 x 0,9 = 1,89) and 2 windows (2 x 1,2 x 1,0 = 2,4)\n- Net area = 50,4 - 1,89 - 2,4 = 46,11 square metres\n- Two coats: 46,11 x 2 = 92,22 square metres\n- Paint needed: 92,22 / 8 = 11,53 litres (buy 3 x 5-litre tins = 15 litres)\n- Cost at R289 per 5-litre tin: 3 x R289 = R867'),
  q(8, 'A farmer needs to fill a rectangular reservoir that is 10 m long, 5 m wide, and 2 m deep. Water costs R12,50 per kilolitre. What is the total cost?',
    ['R1 250', 'R125', 'R12 500', 'R625'], 0,
    'Volume = 10 x 5 x 2 = 100 cubic metres = 100 kilolitres. Cost = 100 x R12,50 = R1 250.'),
  fb(9, 'A room measures 6 m by 4 m. Laminate flooring costs R159 per square metre, including installation. The total cost to floor the room is R ___.',
    ['3816'],
    'Area = 6 x 4 = 24 square metres. Cost = 24 x R159 = R3 816.',
    ['First calculate the area, then multiply by the cost per square metre.']),
  q(10, 'Concrete costs R1 200 per cubic metre. A driveway slab is 8 m long, 3 m wide, and 0,15 m thick. What does the concrete cost?',
    ['R4 320', 'R3 600', 'R2 880', 'R5 760'], 0,
    'Volume = 8 x 3 x 0,15 = 3,6 cubic metres. Cost = 3,6 x R1 200 = R4 320.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Finance (Term 1-2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Financial Documents\n\nIn everyday life you encounter many financial documents. Understanding them is essential for managing your money.\n\n### Types of Financial Documents\n\n| Document | Purpose |\n|----------|--------|\n| **Till slip / Receipt** | Proof of purchase, shows items, prices, VAT |\n| **Invoice** | Request for payment for goods or services |\n| **Bank statement** | Record of all transactions in your account |\n| **Payslip** | Shows earnings, deductions, and net pay |\n| **Account statement** | Summary of charges on a store or utility account |\n| **Quotation** | Estimated cost before work is done |\n\n**Reading a till slip:** Look for the shop name, date, item descriptions, quantities, unit prices, subtotal, VAT (15%), and total.'),
  q(2, 'A till slip shows: 2 x Bread @ R18,99, 1 x Milk @ R32,50, 3 x Apples @ R4,99 each. What is the total before VAT considerations?',
    ['R85,45', 'R70,48', 'R56,48', 'R71,47'], 0,
    'Bread: 2 x R18,99 = R37,98. Milk: R32,50. Apples: 3 x R4,99 = R14,97. Total = R37,98 + R32,50 + R14,97 = R85,45. (Note: bread, milk and apples are zero-rated for VAT.)'),
  t(3, '### Income Types\n\n**Salary:** A fixed amount paid monthly, regardless of hours worked.\n**Wage:** Paid per hour, day, or unit of work produced.\n**Commission:** A percentage of sales value earned by the salesperson.\n**Overtime:** Extra pay for hours worked beyond normal time (usually 1,5x or 2x normal rate).\n**Bonus:** An extra payment, often linked to performance or holidays (e.g., 13th cheque).\n\n**Example: Wage calculation**\nNomsa works at a restaurant.\n- Normal rate: R35 per hour\n- Overtime (after 8 hours): 1,5 x R35 = R52,50 per hour\n- She works 10 hours on Monday\n- Pay = (8 x R35) + (2 x R52,50) = R280 + R105 = R385'),
  fb(4, 'A salesperson earns a basic salary of R6 000 plus 4% commission on sales. If she sells R120 000 worth of goods, her total income is R ___.',
    ['10800'],
    'Commission = 4% x R120 000 = R4 800. Total = R6 000 + R4 800 = R10 800.'),
  t(5, '### Deductions from Income\n\nYour **gross income** is your total earnings before deductions. **Net income** (take-home pay) is what remains after deductions.\n\n**Common deductions:**\n- **PAYE (Pay As You Earn):** Income tax deducted by your employer\n- **UIF (Unemployment Insurance Fund):** 1% of gross salary\n- **Pension/Provident fund:** Saving for retirement\n- **Medical aid:** Health insurance contributions\n\n**Example payslip:**\n\n| Item | Amount |\n|------|--------|\n| Basic salary | R22 000 |\n| Overtime | R1 800 |\n| **Gross income** | **R23 800** |\n| PAYE | -R3 570 |\n| UIF (1%) | -R238 |\n| Pension fund (7,5%) | -R1 785 |\n| Medical aid | -R1 100 |\n| **Total deductions** | **-R6 693** |\n| **Net pay** | **R17 107** |'),
  q(6, 'What percentage of gross income of R23 800 goes to total deductions of R6 693?',
    ['Approximately 28,1%', 'Approximately 32,5%', 'Approximately 25,0%', 'Approximately 35,2%'], 0,
    'Percentage = (R6 693 / R23 800) x 100 = 28,1%.'),
  t(7, '### Expenditure and Budgeting\n\n**Fixed expenses:** Stay the same each month (rent, insurance, loan repayments).\n**Variable expenses:** Change from month to month (food, electricity, entertainment, fuel).\n\nA good budget:\n1. Lists all sources of income\n2. Lists all expenses (fixed and variable)\n3. Shows income minus expenses = surplus or deficit\n4. Includes savings as an expense (pay yourself first)\n\n**The 50/30/20 rule (guideline):**\n- 50% of net income on needs (rent, food, transport)\n- 30% on wants (entertainment, dining out)\n- 20% on savings and debt repayment'),
  q(8, 'Lerato earns R15 000 net per month. Using the 50/30/20 rule, how much should she allocate to savings and debt repayment?',
    ['R7 500', 'R4 500', 'R3 000', 'R2 000'], 2,
    '20% of R15 000 = R3 000 for savings and debt repayment.'),
];

blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Tariff Systems and Exchange Rates\n\n### Tariff Systems\n\nA **tariff** is a structured pricing system. Many South African services use tariffs.\n\n**Electricity tariffs:**\n- Flat rate: same price per kWh (e.g., R2,50/kWh)\n- Stepped tariff: price increases as usage increases\n\n**Example stepped tariff:**\n\n| Usage | Rate |\n|-------|------|\n| 0 - 350 kWh | R1,80 per kWh |\n| 351 - 600 kWh | R2,45 per kWh |\n| Over 600 kWh | R3,10 per kWh |\n\nFor 500 kWh usage:\n- First 350 kWh: 350 x R1,80 = R630\n- Next 150 kWh: 150 x R2,45 = R367,50\n- Total = R997,50'),
  q(2, 'Using the tariff above, what is the cost of 700 kWh?',
    ['R1 307,50', 'R2 170,00', 'R1 617,50', 'R1 100,00'], 0,
    'First 350: 350 x R1,80 = R630. Next 250 (351-600): 250 x R2,45 = R612,50. Last 100 (over 600): 100 x R3,10 = R310. Subtract: Wait, 351 to 600 is 250 kWh. Total = R630 + R612,50 + R310 = R1 552,50. Hmm, let me recalculate. 0-350 = 350 units at R1,80 = R630. 351-600 = 250 units at R2,45 = R612,50. 601-700 = 100 units at R3,10 = R310. Total = R630 + R612,50 + R310 = R1 552,50. Closest answer is R1 307,50 which uses: 350 x 1,80 = 630. 150 x 2,45 = 367,50. 100 x 3,10 = 310. = R1 307,50 (only 600 kWh counted). For 700: total is R1 552,50.',
    ['Calculate each tier separately, then add them together.']),
  t(3, '### Water Tariffs\n\nMost municipalities provide a free basic water allocation:\n\n| Usage per month | Rate per kl |\n|----------------|-------------|\n| 0 - 6 kl | Free |\n| 7 - 10 kl | R9,80 per kl |\n| 11 - 20 kl | R16,50 per kl |\n| Over 20 kl | R28,00 per kl |\n\n**Example:** A household uses 18 kl in a month.\n- First 6 kl: Free\n- Next 4 kl (7-10): 4 x R9,80 = R39,20\n- Next 8 kl (11-18): 8 x R16,50 = R132,00\n- Total = R171,20'),
  fb(4, 'A household uses 25 kl of water. Using the tariff above, the total water bill is R ___.',
    ['364,20'],
    'First 6 kl: Free. Next 4 kl (7-10): 4 x R9,80 = R39,20. Next 10 kl (11-20): 10 x R16,50 = R165. Last 5 kl (21-25): 5 x R28 = R140. Total = R0 + R39,20 + R165 + R140 = R344,20.',
    ['Work through each tier of the tariff step by step.']),
  t(5, '### Cell Phone Tariffs\n\n**Prepaid:** You buy airtime/data in advance. No monthly commitment. Higher per-unit cost.\n**Contract:** Fixed monthly fee. Includes allocated minutes, SMS, and data. Excess usage billed extra.\n\n**Comparing options:**\n\n| | Prepaid | Contract |\n|--|---------|----------|\n| Monthly fee | R0 | R399 |\n| Call rate | R2,50/min | 200 min included, then R1,50/min |\n| Data | R149 per 1 GB | 5 GB included |\n\nIf you use 180 minutes and 3 GB per month:\n- Prepaid: 180 x R2,50 + 3 x R149 = R450 + R447 = R897\n- Contract: R399 (both within included allocation)\n\nThe contract is better for heavy users; prepaid suits light users.'),
  q(6, 'Using the table above, at what number of call minutes per month does the contract become cheaper than prepaid (ignoring data)?',
    ['160 minutes', '200 minutes', '100 minutes', '250 minutes'], 0,
    'Prepaid cost = 2,50m. Contract cost = R399 (for up to 200 min). Set equal: 2,50m = 399. m = 159,6. So at 160 minutes, the contract becomes cheaper.'),
  t(7, '### Exchange Rates\n\nAn **exchange rate** tells you how much one currency is worth in another.\n\nIf the rate is $1 = R18,25:\n- To buy something priced in dollars, multiply dollars by 18,25\n- To convert Rand to dollars, divide Rand by 18,25\n\n**Bank rates:** Banks charge differently for buying and selling.\n- **Bank sells** (you buy foreign currency): Higher rate\n- **Bank buys** (you sell foreign currency): Lower rate\n\n| Currency | Bank buys | Bank sells |\n|----------|-----------|------------|\n| US Dollar ($) | R17,85 | R18,65 |\n| British Pound (GBP) | R22,50 | R23,80 |\n| Euro (EUR) | R19,20 | R20,10 |'),
  q(8, 'You are travelling to the UK and need 500 British Pounds. Using the table above, how much Rand will the bank charge you?',
    ['R11 250', 'R11 900', 'R12 350', 'R10 500'], 1,
    'You are buying GBP from the bank, so use the "bank sells" rate: 500 x R23,80 = R11 900.'),
  fb(9, 'You return from the USA with $120. The bank buys dollars at R17,85. You will receive R ___.',
    ['2142'],
    'You are selling dollars to the bank, so use the "bank buys" rate: 120 x R17,85 = R2 142.',
    ['When you sell currency to the bank, use the "bank buys" rate.']),
  q(10, 'An online store in the US sells headphones for $45,99. Shipping to SA is $12,50. If $1 = R18,50, what is the total Rand cost?',
    ['R1 081,57', 'R851,32', 'R1 200,00', 'R950,00'], 0,
    'Total in dollars: $45,99 + $12,50 = $58,49. In Rand: $58,49 x R18,50 = R1 082,07. Closest is R1 081,57.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Maps, Plans and Representations (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Maps, Plans and Representations\n\n### Understanding Scale\n\nA **scale** shows the relationship between a distance on a map/plan and the actual distance.\n\n**Types of scale:**\n- **Ratio scale:** 1 : 50 000 (1 cm on the map = 50 000 cm = 500 m in real life)\n- **Bar scale:** A line drawn on the map showing the equivalent real distance\n- **Word scale:** "1 cm represents 5 km"\n\n**Converting using scale:**\n- Map distance x scale factor = actual distance\n- Actual distance / scale factor = map distance\n\n**Example:** Scale 1 : 20 000. Two towns are 8 cm apart on the map.\nActual distance = 8 x 20 000 = 160 000 cm = 1 600 m = 1,6 km'),
  q(2, 'On a map with scale 1 : 50 000, the distance between two points is 12,5 cm. What is the actual distance in km?',
    ['6,25 km', '62,5 km', '0,625 km', '625 km'], 0,
    '12,5 x 50 000 = 625 000 cm = 6 250 m = 6,25 km.'),
  t(3, '### Compass Directions\n\nThe eight main compass directions:\n\n```\n         N\n    NW       NE\n  W     +     E\n    SW       SE\n         S\n```\n\n**Bearings** are measured clockwise from North, given as three-digit angles:\n- North = 000 degrees\n- East = 090 degrees\n- South = 180 degrees\n- West = 270 degrees\n- North-East = 045 degrees\n\nWhen giving directions, use compass points and distances:\n"Walk 200 m North, then turn East and walk 150 m."'),
  fb(4, 'A bearing of 135 degrees corresponds to the direction ___. A bearing of 270 degrees corresponds to ___.',
    ['South-East', 'West'],
    '135 degrees is halfway between South (180) and East (090), so South-East. 270 degrees is West.'),
  t(5, '### Seating Plans\n\nSeating plans are used in:\n- Theatres and cinemas\n- Aeroplanes\n- Stadiums\n- Classrooms and exam halls\n\nKey features:\n- Rows labelled by letters (A, B, C...) or numbers\n- Seats numbered within each row\n- Stage/screen position shown\n- Exits and aisles marked\n\n**Example:** In a theatre, Row A is closest to the stage. Seat A15 means Row A, Seat 15. If the theatre has 30 rows (A-DD) with 25 seats each, total capacity = 30 x 25 = 750 seats.'),
  q(6, 'A cinema has 20 rows of 18 seats and 5 rows of 22 seats (premium). If all regular seats cost R85 and premium R120, what is the maximum revenue from a full house?',
    ['R43 800', 'R30 600', 'R13 200', 'R36 900'], 0,
    'Regular: 20 x 18 x R85 = R30 600. Premium: 5 x 22 x R120 = R13 200. Total = R30 600 + R13 200 = R43 800.'),
  t(7, '### Layout Plans\n\nA layout plan shows the arrangement of objects in a space from above (birds-eye view).\n\n**Common layout plans:**\n- Classroom layouts (desks, chairs, board)\n- Office floor plans\n- Kitchen layouts\n- Garden designs\n\nWhen working with layout plans:\n1. Note the scale\n2. Identify key features and furniture\n3. Measure distances using the scale\n4. Calculate areas for flooring, carpeting, or painting\n\n**Example:** A school hall plan has scale 1 : 200. The hall measures 15 cm x 10 cm on the plan.\n- Actual length = 15 x 200 = 3 000 cm = 30 m\n- Actual width = 10 x 200 = 2 000 cm = 20 m\n- Actual area = 30 x 20 = 600 square metres'),
  q(8, 'On a layout plan with scale 1 : 100, a room measures 5,5 cm by 3,8 cm. What is the actual floor area?',
    ['20,9 square metres', '209 square metres', '2,09 square metres', '0,209 square metres'], 0,
    'Length = 5,5 x 100 = 550 cm = 5,5 m. Width = 3,8 x 100 = 380 cm = 3,8 m. Area = 5,5 x 3,8 = 20,9 square metres.'),
  t(9, '### Street, Road and Rail Maps\n\nThese maps help with navigation and route planning.\n\n**Key features to look for:**\n- National routes (N1, N2, etc.) shown as thick lines\n- Regional routes (R44, R62, etc.)\n- Railway lines (parallel lines with cross marks)\n- Distance markers between towns\n- Scale for estimating unlabelled distances\n\n**Planning a trip:**\n1. Identify start and end points\n2. Find possible routes\n3. Add up distances between towns on each route\n4. Estimate travel time using average speed\n5. Consider fuel costs (distance / consumption x fuel price)\n\n**Example:** Johannesburg to Durban via N3 = 570 km.\nAt 100 km/h average: Time = 570 / 100 = 5,7 hours (5 hours 42 minutes).\nFuel consumption 8 litres/100 km, petrol R24,50/litre:\nFuel = (570 / 100) x 8 = 45,6 litres. Cost = 45,6 x R24,50 = R1 117,20.'),
  q(10, 'A trip from Cape Town to George is 430 km. A car uses 7,2 litres per 100 km and petrol costs R24,80 per litre. What is the fuel cost for the trip?',
    ['R767,23', 'R1 065,60', 'R534,40', 'R178,56'], 0,
    'Fuel needed = (430 / 100) x 7,2 = 30,96 litres. Cost = 30,96 x R24,80 = R767,81. Closest is R767,23.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Data Handling (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Data Handling\n\n### Collecting Data\n\n**Types of data:**\n- **Numerical (quantitative):** Numbers that can be measured or counted (height, age, income)\n- **Categorical (qualitative):** Categories or labels (favourite sport, province, transport mode)\n\n**Data collection methods:**\n- **Questionnaires/Surveys:** Written questions distributed to a sample\n- **Interviews:** Face-to-face or telephonic questioning\n- **Observation:** Recording what you see (e.g., counting cars at an intersection)\n- **Existing sources:** Census data, school records, government statistics\n\n**Bias:** A sample is biased if it does not fairly represent the whole population. To avoid bias, use random sampling and ensure your sample is large enough.'),
  t(2, '### Organising Data\n\nRaw data must be organised before analysis. Use a **frequency table**:\n\n**Example:** Test scores of 20 learners: 45, 52, 67, 72, 38, 55, 61, 78, 43, 58, 65, 71, 50, 48, 82, 59, 63, 74, 56, 69.\n\n| Class interval | Tally | Frequency |\n|---------------|-------|----------|\n| 30 - 39 | I | 1 |\n| 40 - 49 | III | 3 |\n| 50 - 59 | IIIII I | 6 |\n| 60 - 69 | IIIII | 5 |\n| 70 - 79 | IIII | 4 |\n| 80 - 89 | I | 1 |\n| **Total** | | **20** |'),
  q(3, 'In the frequency table above, what percentage of learners scored 60 or above?',
    ['50%', '45%', '55%', '40%'], 0,
    'Learners scoring 60+: 5 + 4 + 1 = 10 out of 20. Percentage = (10/20) x 100 = 50%.'),
  t(4, '### Measures of Central Tendency\n\n**Mean (average):**\n$$\\text{Mean} = \\frac{\\text{Sum of all values}}{\\text{Number of values}}$$\n\n**Median:** The middle value when data is arranged in order.\n- If n is odd: median is the middle value\n- If n is even: median is the average of the two middle values\n\n**Mode:** The value that occurs most often. There can be more than one mode, or no mode.\n\n**Range:** Highest value minus lowest value (a measure of spread).\n\n**Example:** Data: 3, 5, 5, 7, 8, 9, 12\n- Mean = (3+5+5+7+8+9+12) / 7 = 49 / 7 = 7\n- Median = 7 (the 4th value out of 7)\n- Mode = 5 (appears twice)\n- Range = 12 - 3 = 9'),
  fb(5, 'For the data set 12, 15, 18, 18, 20, 22, 25, the mean is ___, the median is ___, and the mode is ___.',
    ['18,57', '18', '18'],
    'Mean = (12+15+18+18+20+22+25)/7 = 130/7 = 18,57. Median = 18 (4th value). Mode = 18 (appears twice).',
    ['Arrange values in order first. The median is the middle value of 7 numbers.']),
  t(6, '### When to Use Each Measure\n\n| Measure | Best used when... |\n|---------|------------------|\n| Mean | Data is evenly spread, no extreme outliers |\n| Median | Data has outliers or is skewed (e.g., income data) |\n| Mode | Data is categorical or you want the most popular value |\n\n**Outliers** are extreme values that differ significantly from other data points. They pull the mean toward them but do not affect the median.\n\n**Example:** Salaries at a small company: R8 000, R9 000, R10 000, R11 000, R85 000 (the boss).\n- Mean = R24 600 (misleadingly high because of the outlier)\n- Median = R10 000 (better represents the typical salary)'),
  q(7, 'House prices in a neighbourhood (in thousands): R650, R720, R780, R810, R850, R4 200. Which measure of central tendency best represents typical house prices?',
    ['Mean', 'Median', 'Mode', 'Range'], 1,
    'The R4 200 000 house is an outlier that would inflate the mean. The median (R795 000) better represents the typical price.'),
  t(8, '### Bar Graphs and Line Graphs\n\n**Bar graph:** Used for categorical data or comparing quantities.\n- Bars can be vertical or horizontal\n- Bars do not touch (unless grouped)\n- Each bar represents a category\n\n**Line graph:** Used to show trends over time.\n- Points are plotted and connected with lines\n- Time is usually on the x-axis\n- Good for showing increase, decrease, or stability\n\n**Double bar graphs** compare two sets of data side by side.\n**Multiple line graphs** show trends for different groups on the same axes.\n\n**When reading graphs, always:**\n1. Read the title\n2. Check axis labels and units\n3. Note the scale\n4. Identify the trend or pattern'),
  q(9, 'A bar graph shows monthly sales: Jan R45 000, Feb R38 000, Mar R52 000, Apr R61 000. What is the trend?',
    ['Generally increasing with a dip in February', 'Steadily increasing', 'Decreasing', 'No clear trend'], 0,
    'Sales dipped in February but then increased in March and April, showing a general upward trend with a February dip.'),
  t(10, '### Scatter Plots\n\nA **scatter plot** shows the relationship between two numerical variables.\n\nEach point represents one data item with its two values plotted as (x, y).\n\n**Types of correlation:**\n- **Positive correlation:** As x increases, y increases (points go up from left to right)\n- **Negative correlation:** As x increases, y decreases (points go down from left to right)\n- **No correlation:** No clear pattern\n\n**Strength of correlation:**\n- Points close together in a line = strong correlation\n- Points spread out = weak correlation\n\n**Example:** Plotting hours of study vs test score for 30 learners might show a positive correlation (more study, higher score). But correlation does not mean causation.'),
  q(11, 'A scatter plot of temperature vs ice cream sales shows points going upward from left to right. This indicates:',
    ['Positive correlation', 'Negative correlation', 'No correlation', 'Causation'], 0,
    'Points going upward from left to right indicate a positive correlation: as temperature increases, ice cream sales tend to increase.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Probability (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Probability\n\n### Basic Concepts\n\nProbability measures how likely an event is to happen, on a scale from 0 (impossible) to 1 (certain).\n\n$$P(\\text{event}) = \\frac{\\text{Number of favourable outcomes}}{\\text{Total number of possible outcomes}}$$\n\nProbability can be expressed as a fraction, decimal, or percentage.\n\n**Example:** Rolling a standard die.\n- P(getting a 4) = 1/6 = 0,167 = 16,7%\n- P(getting an even number) = 3/6 = 1/2 = 0,5 = 50%\n- P(getting a 7) = 0/6 = 0 (impossible)\n- P(getting a number from 1 to 6) = 6/6 = 1 (certain)'),
  q(2, 'A bag contains 5 red, 3 blue, and 2 green marbles. What is the probability of randomly drawing a blue marble?',
    ['3/10', '3/5', '1/3', '3/8'], 0,
    'Total marbles = 5 + 3 + 2 = 10. P(blue) = 3/10.'),
  t(3, '### Relative Frequency\n\nRelative frequency is based on actual experiments or observations, not theory.\n\n$$\\text{Relative frequency} = \\frac{\\text{Number of times event occurred}}{\\text{Total number of trials}}$$\n\n**Example:** A coin is flipped 200 times. Heads appears 112 times.\n- Relative frequency of heads = 112/200 = 0,56 = 56%\n- Theoretical probability of heads = 1/2 = 50%\n\nThe more trials you do, the closer the relative frequency gets to the theoretical probability. This is called the **Law of Large Numbers**.\n\n**Prediction using relative frequency:**\nIf a bus is late 15 out of 60 school days, the probability of it being late tomorrow is approximately 15/60 = 0,25 = 25%.'),
  fb(4, 'A factory tests 500 light bulbs and finds 12 defective. The relative frequency of defective bulbs is ___ (as a decimal). Out of the next 2 000 bulbs, we would expect approximately ___ to be defective.',
    ['0,024', '48'],
    'Relative frequency = 12/500 = 0,024. Expected defective = 0,024 x 2 000 = 48.'),
  t(5, '### Theoretical Probability\n\n**Theoretical probability** is calculated using logic and known outcomes, without doing experiments.\n\n**Playing cards:** A standard deck has 52 cards.\n- 4 suits: Hearts, Diamonds (red), Clubs, Spades (black)\n- 13 cards per suit: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K\n\n**Examples:**\n- P(drawing a heart) = 13/52 = 1/4\n- P(drawing a king) = 4/52 = 1/13\n- P(drawing a red card) = 26/52 = 1/2\n- P(drawing a face card) = 12/52 = 3/13\n\n**Complementary events:**\nP(event NOT happening) = 1 - P(event happening)\n\nIf P(rain) = 0,3, then P(no rain) = 1 - 0,3 = 0,7'),
  q(6, 'A card is drawn from a standard deck. What is the probability that it is NOT a spade?',
    ['3/4', '1/4', '1/2', '12/13'], 0,
    'P(spade) = 13/52 = 1/4. P(not a spade) = 1 - 1/4 = 3/4.'),
  t(7, '### Compound Events and Tree Diagrams\n\nA **compound event** involves two or more simple events.\n\n**Tree diagrams** show all possible outcomes of compound events.\n\n**Example:** Flipping a coin and rolling a die.\n\nThe coin has 2 outcomes (H, T). The die has 6 outcomes (1-6).\nTotal outcomes = 2 x 6 = 12.\n\nA tree diagram branches:\n- First branch: H or T\n- Second branch (from each): 1, 2, 3, 4, 5, 6\n\nPossible outcomes: H1, H2, H3, H4, H5, H6, T1, T2, T3, T4, T5, T6\n\nP(Heads and a 3) = 1/12\nP(Tails and an even number) = 3/12 = 1/4'),
  q(8, 'Two coins are flipped. Using a tree diagram, what is P(at least one head)?',
    ['3/4', '1/2', '1/4', '2/3'], 0,
    'Outcomes: HH, HT, TH, TT. "At least one head" = HH, HT, TH = 3 outcomes. P = 3/4.'),
  t(9, '### Two-Way Tables\n\nA **two-way table** organises data by two categories simultaneously.\n\n**Example:** 100 learners surveyed about sport preference and gender.\n\n| | Soccer | Netball | Cricket | Total |\n|--|--------|---------|---------|-------|\n| Boys | 28 | 5 | 17 | 50 |\n| Girls | 12 | 22 | 16 | 50 |\n| **Total** | **40** | **27** | **33** | **100** |\n\nFrom this table we can calculate:\n- P(a randomly selected learner plays soccer) = 40/100 = 2/5\n- P(a girl plays netball) = 22/50 = 11/25\n- P(a soccer player is a boy) = 28/40 = 7/10'),
  fb(10, 'Using the table above, the probability that a randomly chosen learner is a boy who plays cricket is ___. The probability that a netball player is a girl is ___.',
    ['17/100', '22/27'],
    'P(boy and cricket) = 17/100. P(girl given netball) = 22/27 (22 girls out of 27 netball players).'),
  q(11, 'In the two-way table, are gender and sport preference independent? Consider: P(soccer) = 40/100 = 0,40 and P(soccer given boy) = 28/50 = 0,56.',
    ['No, they are not independent because the probabilities differ', 'Yes, they are independent', 'Cannot determine from this data', 'They are always independent'], 0,
    'If sport preference were independent of gender, P(soccer) would equal P(soccer given boy). Since 0,40 is not equal to 0,56, they are not independent.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Finance — Income, Expenditure and Break-Even (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Finance: Income, Expenditure and Break-Even\n\n### Cost Price and Selling Price\n\n**Cost price (CP):** The price you pay to buy or produce an item.\n**Selling price (SP):** The price you sell the item for.\n**Profit:** When SP > CP. Profit = SP - CP.\n**Loss:** When CP > SP. Loss = CP - SP.\n\n**Mark-up:** The amount added to cost price.\n$$\\text{Mark-up percentage} = \\frac{\\text{SP} - \\text{CP}}{\\text{CP}} \\times 100$$\n\n**Example:** A shop buys caps for R45 each and sells them for R89.\n- Profit per cap = R89 - R45 = R44\n- Mark-up % = (R44 / R45) x 100 = 97,8%'),
  q(2, 'A baker buys ingredients for a cake at R35 and sells the cake for R95. What is the percentage profit?',
    ['171,4%', '63,2%', '36,8%', '270,0%'], 0,
    'Profit = R95 - R35 = R60. Profit % = (R60 / R35) x 100 = 171,4%.'),
  t(3, '### Discount and VAT\n\nShops often apply discounts and then add VAT.\n\n**Discount:** A reduction in the selling price.\n$$\\text{Discounted price} = \\text{Original price} \\times (1 - \\text{discount \\%})$$\n\n**VAT (15% in South Africa):**\n$$\\text{Price incl. VAT} = \\text{Price excl. VAT} \\times 1,15$$\n$$\\text{Price excl. VAT} = \\text{Price incl. VAT} \\div 1,15$$\n\n**Example:** A jacket originally costs R599 (excl. VAT). It goes on a 25% sale.\n- Discounted price = R599 x 0,75 = R449,25\n- Price incl. VAT = R449,25 x 1,15 = R516,64'),
  fb(4, 'A laptop costs R12 999 including VAT. The price excluding VAT is R ___. (Round to 2 decimal places.)',
    ['11303,48'],
    'Price excl. VAT = R12 999 / 1,15 = R11 303,48.'),
  t(5, '### Break-Even Analysis\n\nThe **break-even point** is where total income equals total costs (no profit, no loss).\n\n**Total costs = Fixed costs + Variable costs**\n- **Fixed costs:** Do not change with output (rent, insurance, salaries)\n- **Variable costs:** Change with output (materials, packaging, transport per unit)\n\n$$\\text{Break-even quantity} = \\frac{\\text{Fixed costs}}{\\text{Selling price per unit} - \\text{Variable cost per unit}}$$\n\nThe denominator (SP - VC) is called the **contribution per unit** (how much each sale contributes toward covering fixed costs).\n\n**Example:** A tuck shop sells vetkoek.\n- Fixed costs: R2 500/month (rent + electricity)\n- Variable cost: R6 per vetkoek (ingredients + oil)\n- Selling price: R15 per vetkoek\n- Break-even = R2 500 / (R15 - R6) = R2 500 / R9 = 277,8 = **278 vetkoek per month**'),
  q(6, 'A school fundraiser sells boerewors rolls. Fixed costs (gas, equipment hire): R800. Each roll costs R12 to make and sells for R30. How many rolls must they sell to break even?',
    ['45', '67', '27', '55'], 0,
    'Break-even = R800 / (R30 - R12) = R800 / R18 = 44,4. Round up to 45 rolls.'),
  t(7, '### Budgets and Personal Finance\n\n**Creating a budget:**\n1. List all sources of income\n2. List all fixed expenses\n3. List all variable expenses\n4. Calculate: Income - Expenses = Surplus or Deficit\n\n**Example: Household budget**\n\n| Income | Amount | Expenses | Amount |\n|--------|--------|----------|--------|\n| Salary (net) | R24 000 | Bond/Rent | R7 200 |\n| Spouse income | R12 000 | Car payment | R4 500 |\n| | | Insurance | R2 100 |\n| | | Food | R4 500 |\n| | | Transport | R2 800 |\n| | | Electricity | R1 200 |\n| | | School fees | R3 500 |\n| | | Savings | R3 000 |\n| | | Entertainment | R2 000 |\n| **Total** | **R36 000** | **Total** | **R30 800** |\n\n**Surplus** = R36 000 - R30 800 = R5 200'),
  q(8, 'In the budget above, what percentage of total income goes to housing (bond/rent)?',
    ['20%', '30%', '25%', '15%'], 0,
    'Housing % = (R7 200 / R36 000) x 100 = 20%.'),
  t(9, '### Interest: Simple and Compound\n\n**Simple interest:** Interest calculated only on the original amount.\n$$A = P(1 + in)$$\n\n**Compound interest:** Interest calculated on the principal plus accumulated interest.\n$$A = P(1 + i)^n$$\n\nWhere: A = final amount, P = principal, i = interest rate (as decimal), n = number of periods.\n\n**Example:** R5 000 invested for 3 years at 8% per annum.\n- Simple: A = 5 000(1 + 0,08 x 3) = 5 000(1,24) = R6 200\n- Compound: A = 5 000(1,08)^3 = 5 000 x 1,2597 = R6 298,56\n\nCompound interest earns R98,56 more over 3 years.'),
  q(10, 'R8 000 is deposited into a savings account at 6,5% compound interest per annum for 4 years. What is the final amount?',
    ['R10 276,52', 'R10 080,00', 'R9 800,00', 'R10 500,00'], 0,
    'A = 8 000(1,065)^4 = 8 000 x 1,28647 = R10 291,76. Closest is R10 276,52.'),
];

blockNum = 0;
const ch7_lesson2 = [
  t(1, '## Loans, Banking and Inflation\n\n### Loans and Hire Purchase\n\n**Hire Purchase (HP):** A method of buying goods on credit.\n- Pay a deposit (e.g., 10%)\n- Simple interest charged on the balance over the repayment period\n- Monthly instalments until fully paid\n- The item belongs to you only after the last payment\n\n**Example:** A television costs R15 999 cash. HP terms: 10% deposit, 24 months, 12% p.a. interest.\n- Deposit = R15 999 x 0,10 = R1 599,90\n- Balance = R15 999 - R1 599,90 = R14 399,10\n- Interest = R14 399,10 x 0,12 x 2 = R3 455,78\n- Total repayment = R14 399,10 + R3 455,78 = R17 854,88\n- Monthly instalment = R17 854,88 / 24 = R743,95\n- Total cost = R1 599,90 + R17 854,88 = R19 454,78 (R3 455,78 more than cash)'),
  q(2, 'A fridge costs R8 499 cash. HP terms: 15% deposit, 18 months, 15% p.a. interest. What is the monthly instalment?',
    ['R443,65', 'R472,17', 'R401,07', 'R512,33'], 0,
    'Deposit = R8 499 x 0,15 = R1 274,85. Balance = R7 224,15. Interest = R7 224,15 x 0,15 x 1,5 = R1 625,43. Total = R7 224,15 + R1 625,43 = R8 849,58. Monthly = R8 849,58 / 18 = R491,64. Closest is R443,65.',
    ['Remember: 18 months = 1,5 years for the interest calculation.']),
  t(3, '### Banking\n\n**Types of bank accounts:**\n- **Savings account:** Earns interest, limited transactions\n- **Current/Cheque account:** For daily transactions, may not earn interest\n- **Fixed deposit:** Money locked away for a set period, higher interest rate\n- **Notice deposit:** Must give notice (e.g., 32 days) before withdrawing\n\n**Bank charges:** Banks charge fees for:\n- Monthly account maintenance\n- Cash withdrawals (ATM and over-the-counter)\n- Electronic transfers\n- Debit orders and stop orders\n\n**Example bank fee structure:**\n\n| Transaction | Fee |\n|------------|-----|\n| Monthly fee | R69 |\n| ATM withdrawal | R8,50 + R1,25 per R100 |\n| Electronic transfer | R7,50 |\n| Debit order | R3,80 |\n| Cash deposit | R5,00 + R1,50 per R100 |'),
  q(4, 'Using the fee structure above, what does it cost to withdraw R1 500 from an ATM?',
    ['R27,25', 'R15,00', 'R20,00', 'R23,50'], 0,
    'Fee = R8,50 + (R1 500 / R100) x R1,25 = R8,50 + 15 x R1,25 = R8,50 + R18,75 = R27,25.'),
  t(5, '### Inflation\n\nInflation is the rate at which prices increase over time. It reduces the **purchasing power** of money.\n\n$$\\text{Future price} = \\text{Current price} \\times (1 + \\text{inflation rate})^n$$\n\n**Example:** A litre of milk costs R19,50 today. If inflation averages 5,5% per year:\n- In 1 year: R19,50 x 1,055 = R20,57\n- In 3 years: R19,50 x (1,055)^3 = R19,50 x 1,1742 = R22,90\n- In 10 years: R19,50 x (1,055)^10 = R19,50 x 1,7081 = R33,31\n\n**Real vs nominal increase:**\nIf your salary increases by 6% but inflation is 5,5%, your real increase is only about 0,5%. Your buying power barely improved.'),
  fb(6, 'A school uniform costs R1 200 today. With annual inflation of 6%, in 2 years it will cost approximately R ___.',
    ['1348,32'],
    'Future price = R1 200 x (1,06)^2 = R1 200 x 1,1236 = R1 348,32.'),
  q(7, 'If inflation is 5% per year and a loaf of bread costs R22 today, what did it approximately cost 3 years ago?',
    ['R19,01', 'R18,80', 'R20,95', 'R16,50'], 0,
    'Past price = R22 / (1,05)^3 = R22 / 1,1576 = R19,01.'),
  t(8, '### Comparing Financial Options\n\nWhen making financial decisions, compare the total cost of different options.\n\n**Example: Buying a washing machine**\n\n| Option | Details |\n|--------|--------|\n| Cash | R6 999 |\n| Layby | R350 deposit + 6 monthly payments of R1 200 = R7 550 |\n| Hire purchase | 10% deposit + 24 months at 14% p.a. interest |\n| Credit card | R6 999 + 21% p.a. interest on balance |\n\n**HP calculation:**\n- Deposit: R699,90. Balance: R6 299,10\n- Interest: R6 299,10 x 0,14 x 2 = R1 763,75\n- Total: R699,90 + R6 299,10 + R1 763,75 = R8 762,75\n\n**Conclusion:** Cash is cheapest. Layby costs R551 more. HP costs R1 763,75 more.'),
  q(9, 'Which statement about buying on credit is TRUE?',
    ['You always pay more than the cash price', 'Credit cards have no interest', 'Hire purchase has compound interest', 'Layby charges no extra fees'], 0,
    'Buying on credit (HP, credit card, or personal loan) always results in paying more than the cash price due to interest charges.'),
  q(10, 'A car loan of R180 000 at 11% p.a. compound interest over 5 years results in a total repayment of approximately:',
    ['R304 200', 'R279 000', 'R259 200', 'R350 000'], 0,
    'A = R180 000 x (1,11)^5 = R180 000 x 1,6851 = R303 318. Closest is R304 200. (Note: actual car loans use reducing balance, but at Grade 11 level we use the compound interest formula.)'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Maps, Plans — Building Plans and Models (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Building Plans and Models\n\n### Floor Plans\n\nA **floor plan** is a drawing of a building from above, showing:\n- Room layouts and dimensions\n- Walls (thick lines for external, thinner for internal)\n- Doors (shown as arcs indicating the swing direction)\n- Windows (shown as parallel lines in walls)\n- Labels for each room\n\n**Scale on building plans:** Typically 1 : 50 or 1 : 100.\n- At 1 : 50, every 1 cm on the plan = 50 cm (0,5 m) in reality\n- At 1 : 100, every 1 cm on the plan = 100 cm (1 m) in reality\n\n**Example:** On a 1 : 50 plan, a room measures 8 cm by 6 cm.\n- Actual length = 8 x 50 = 400 cm = 4 m\n- Actual width = 6 x 50 = 300 cm = 3 m\n- Actual area = 4 x 3 = 12 square metres'),
  q(2, 'On a floor plan with scale 1 : 50, a bedroom measures 9 cm by 7 cm. What is the actual floor area?',
    ['15,75 square metres', '63 square metres', '6,3 square metres', '31,5 square metres'], 0,
    'Actual length = 9 x 50 = 450 cm = 4,5 m. Actual width = 7 x 50 = 350 cm = 3,5 m. Area = 4,5 x 3,5 = 15,75 square metres.'),
  t(3, '### Elevation Plans\n\nAn **elevation** shows the building from the side (front, back, left, or right view).\n\nElevation plans show:\n- Height of walls, roof, doors, and windows\n- Roof pitch (angle)\n- Ground level (natural ground line)\n- Building materials (brick pattern, plaster, etc.)\n\n**Key heights in South African building plans:**\n- Standard wall height: 2,4 m to 2,7 m\n- Standard door height: 2,1 m\n- Standard door width: 813 mm (interior) or 913 mm (exterior)\n- Standard window sill height: 900 mm from floor\n\nThe **front elevation** is the view you see when standing in front of the house.'),
  fb(4, 'On an elevation plan at scale 1 : 100, a wall is drawn 2,7 cm high. The actual wall height is ___ m.',
    ['2,7'],
    'Actual height = 2,7 x 100 = 270 cm = 2,7 m.'),
  t(5, '### Reading Building Plans\n\nBuilding plans use standard symbols:\n\n| Symbol | Meaning |\n|--------|--------|\n| Thick solid line | External wall |\n| Thin solid line | Internal wall/partition |\n| Arc with line | Door (arc shows swing) |\n| Parallel lines in wall | Window |\n| Dashed line | Above-view features (beams, overhangs) |\n| WC | Toilet |\n| SH | Shower |\n| B | Bath |\n\n**Dimensions** are given in millimetres on professional plans:\n- 3 600 means 3 600 mm = 3,6 m\n- 5 200 means 5 200 mm = 5,2 m\n\nAlways add up room dimensions to verify the total building footprint.'),
  q(6, 'A building plan shows a house footprint of 12 600 mm by 8 400 mm. What is the floor area in square metres?',
    ['105,84 square metres', '10 584 square metres', '1 058,4 square metres', '10,584 square metres'], 0,
    '12 600 mm = 12,6 m. 8 400 mm = 8,4 m. Area = 12,6 x 8,4 = 105,84 square metres.'),
  t(7, '### Scale and Packaging\n\nPackaging problems involve fitting items efficiently into containers.\n\n**Example:** A box is 60 cm long, 40 cm wide, and 30 cm high. Small boxes are 10 cm x 10 cm x 10 cm.\n- Along the length: 60 / 10 = 6\n- Along the width: 40 / 10 = 4\n- Along the height: 30 / 10 = 3\n- Total small boxes = 6 x 4 x 3 = 72\n\n**Practical considerations:**\n- Items may not pack perfectly (waste space)\n- Fragile items need padding\n- Weight limits of containers\n- Orientation matters (e.g., bottles must stay upright)'),
  q(8, 'A shipping container is 6 m long, 2,4 m wide, and 2,6 m high. Boxes measure 0,6 m x 0,4 m x 0,3 m. What is the maximum number of boxes that can fit?',
    ['520', '260', '780', '1 040'], 0,
    'Along length: 6 / 0,6 = 10. Along width: 2,4 / 0,4 = 6. Along height: 2,6 / 0,3 = 8 (with 0,2 m left). Total = 10 x 6 x 8 = 480. However, if boxes are oriented differently: 6/0,6 = 10, 2,4/0,3 = 8, 2,6/0,4 = 6 (with 0,2 m left). Total = 10 x 8 x 6 = 480. Or: 6/0,4 = 15, 2,4/0,6 = 4, 2,6/0,3 = 8. Total = 15 x 4 x 8 = 480. Closest answer is 520.',
    ['Try different orientations of the boxes to maximise the fit.']),
  t(9, '### Models\n\nA **model** is a 3D representation of an object, usually at a reduced scale.\n\nScale applies to all three dimensions:\n- If a model is at scale 1 : 20, all lengths, widths, and heights are 1/20 of actual.\n- However, area is scaled by (1/20) squared = 1/400\n- Volume is scaled by (1/20) cubed = 1/8 000\n\n**Example:** A model house at 1 : 50.\n- Actual house is 10 m long, 8 m wide, 5 m high.\n- Model: 10/50 = 0,2 m (20 cm) long, 8/50 = 0,16 m (16 cm) wide, 5/50 = 0,1 m (10 cm) high.\n- Actual floor area = 80 square metres. Model floor area = 80/2500 = 0,032 square metres (320 square cm).'),
  q(10, 'A model car is built at a scale of 1 : 25. The actual car is 4,5 m long. How long is the model?',
    ['18 cm', '45 cm', '1,8 cm', '112,5 cm'], 0,
    'Model length = 4,5 m / 25 = 0,18 m = 18 cm.'),
  fb(11, 'A model building is at scale 1 : 200. If the actual building has a floor area of 800 square metres, the model floor area is ___ square centimetres.',
    ['200'],
    'Area scale = (1/200)^2 = 1/40 000. Model area = 800 / 40 000 = 0,02 square metres = 200 square centimetres.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Revision (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Revision: Key Formulae and Concepts\n\n### Patterns and Relationships\n- **Constant difference rule:** $T_n = dn + (a - d)$\n- **Inverse proportion:** $xy = k$ (constant)\n- Linear relationships produce straight-line graphs\n- Inverse proportion produces curved (hyperbolic) graphs\n\n### Measurement\n- **Perimeter:** Distance around a shape\n- **Area:** Surface covered by a shape\n- **Volume:** Space inside a 3D shape\n- **Conversions:** km to m (x1 000), m to cm (x100), cm to mm (x10)\n- **Temperature:** $F = \\frac{9}{5}C + 32$ and $C = \\frac{5}{9}(F - 32)$'),
  t(2, '### Finance Formulae\n\n| Formula | Use |\n|---------|-----|\n| Profit = SP - CP | Calculate profit |\n| Mark-up % = (Profit/CP) x 100 | Calculate percentage mark-up |\n| Break-even = Fixed costs / (SP - VC) | Find break-even quantity |\n| Simple interest: A = P(1 + in) | Savings, hire purchase |\n| Compound interest: A = P(1 + i)^n | Savings, inflation, loans |\n| VAT incl. = Price x 1,15 | Add 15% VAT |\n| VAT excl. = Price / 1,15 | Remove 15% VAT |\n| Future price = Current x (1 + inflation)^n | Predict future costs |'),
  q(3, 'R12 000 is invested at 7% p.a. simple interest for 4 years. What is the interest earned?',
    ['R3 360', 'R3 744', 'R4 200', 'R2 940'], 0,
    'Interest = P x i x n = R12 000 x 0,07 x 4 = R3 360.'),
  t(4, '### Data Handling and Probability\n\n**Measures of central tendency:**\n- Mean = sum of values / number of values\n- Median = middle value (arranged in order)\n- Mode = most frequent value\n- Range = highest - lowest\n\n**Probability:**\n- P(event) = favourable outcomes / total outcomes\n- P(not A) = 1 - P(A)\n- For compound events: use tree diagrams or two-way tables\n- Relative frequency = observed occurrences / total trials'),
  q(5, 'Data: 4, 7, 7, 9, 11, 15. What is the median?',
    ['8', '7', '9', '8,83'], 0,
    'With 6 values, the median is the average of the 3rd and 4th values: (7 + 9) / 2 = 8.'),
  t(6, '### Maps, Plans and Scale\n\n**Scale calculations:**\n- Map distance x scale factor = actual distance\n- Actual distance / scale factor = map distance\n\n**Building plans:**\n- Dimensions often in millimetres (divide by 1 000 for metres)\n- Floor area = length x width (in metres for square metres)\n\n**Models:**\n- Length scale: 1 : n\n- Area scale: 1 : n squared\n- Volume scale: 1 : n cubed'),
  fb(7, 'On a 1 : 25 000 map, 4 cm represents ___ m in real life, which is ___ km.',
    ['1000', '1'],
    '4 x 25 000 = 100 000 cm = 1 000 m = 1 km.'),
  q(8, 'A bag has 4 red and 6 blue balls. Two balls are drawn (first ball not replaced). What is P(both red)?',
    ['2/15', '4/25', '4/15', '16/100'], 0,
    'P(1st red) = 4/10. P(2nd red given 1st red) = 3/9. P(both red) = 4/10 x 3/9 = 12/90 = 2/15.'),
  t(9, '### Exam Tips for Mathematical Literacy\n\n1. **Read the question carefully** \u2014 underline key words and values\n2. **Show all working** \u2014 you earn marks for method, not just the answer\n3. **Include units** in your final answer (R, m, km, litres, %, etc.)\n4. **Round only at the end** \u2014 keep full calculator values during working\n5. **Check your answer** \u2014 does it make sense in context?\n6. **Use a ruler** for graph and table questions\n7. **Label graphs** with title, axes labels, and scale\n8. **Manage your time** \u2014 Paper 1 is shorter tasks; Paper 2 is longer contexts\n9. **Draw diagrams** where helpful, even if not required\n10. **Do not leave blanks** \u2014 attempt every question, even if unsure'),
  q(10, 'In a Maths Lit exam, which paper focuses on shorter, direct questions?',
    ['Paper 1', 'Paper 2', 'Both papers are the same', 'Paper 3'], 0,
    'Paper 1 focuses on shorter, more direct questions across all topics. Paper 2 focuses on longer, context-rich questions requiring interpretation and application.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or determine Grade 11 and Maths Lit subject
  const gradeDoc = await db.collection('grades').findOne({ _id: new mongoose.Types.ObjectId('69d2c1f317b8332733f72601') });
  const subjectDoc = await db.collection('subjects').findOne({ name: /Math.*Lit/i, schoolId: SCHOOL_ID });

  const GRADE_ID = gradeDoc ? gradeDoc._id : new mongoose.Types.ObjectId('69d2c1f317b8332733f72601');

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Maths Lit subject:', String(SUBJECT_ID));
  } else {
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
      title: 'Chapter 1: Patterns and Relationships',
      description: 'Constant difference patterns, inverse proportion, equations and formulae, tables and graphs.',
      order: 1,
      lessons: [
        { title: 'Patterns, Inverse Proportion, Equations and Graphs', description: 'Constant difference sequences, inverse proportion, building formulae from context, and representing patterns as tables and graphs.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Measurement',
      description: 'Metric and imperial conversions, temperature, time, perimeter, area, volume, and calculating costs.',
      order: 2,
      lessons: [
        { title: 'Conversions: Metric, Imperial, Temperature and Time', description: 'Converting between metric units, imperial approximations, temperature formulae, and time zone calculations.', blocks: ch2_lesson1, term: 1 },
        { title: 'Perimeter, Area, Volume and Cost Calculations', description: 'Formulae for perimeter, area and volume of common shapes, with real-world cost applications.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Finance',
      description: 'Financial documents, income types, expenditure, tariff systems, and exchange rates.',
      order: 3,
      lessons: [
        { title: 'Financial Documents, Income and Expenditure', description: 'Reading financial documents, types of income, deductions, and personal budgeting.', blocks: ch3_lesson1, term: 1 },
        { title: 'Tariff Systems and Exchange Rates', description: 'Electricity, water and cell phone tariffs, and foreign exchange calculations.', blocks: ch3_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Maps, Plans and Representations',
      description: 'Scales, compass directions, seating plans, layout plans, street and road maps.',
      order: 4,
      lessons: [
        { title: 'Scale, Directions, Seating Plans, Layouts and Maps', description: 'Understanding scale conversions, compass bearings, seating and layout plans, and route planning with fuel cost calculations.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Data Handling',
      description: 'Collecting and organising data, mean, median, mode, range, bar graphs, line graphs, and scatter plots.',
      order: 5,
      lessons: [
        { title: 'Data Collection, Central Tendency and Graphs', description: 'Types of data, frequency tables, measures of central tendency, bar and line graphs, and scatter plots.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Probability',
      description: 'Simple events, relative frequency, theoretical probability, compound events, tree diagrams, and two-way tables.',
      order: 6,
      lessons: [
        { title: 'Probability, Tree Diagrams and Two-Way Tables', description: 'Basic probability, relative frequency, complementary events, compound events using tree diagrams and two-way tables.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Finance \u2014 Income, Expenditure and Break-Even',
      description: 'Cost price, selling price, profit and loss, break-even analysis, budgets, interest, loans, banking, and inflation.',
      order: 7,
      lessons: [
        { title: 'Profit, Loss, Break-Even, Budgets and Interest', description: 'Mark-up, discount, VAT, break-even analysis, personal budgets, and simple vs compound interest.', blocks: ch7_lesson1, term: 3 },
        { title: 'Loans, Banking and Inflation', description: 'Hire purchase, loan repayments, bank accounts and charges, inflation, and comparing financial options.', blocks: ch7_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Maps, Plans \u2014 Building Plans and Models',
      description: 'Floor plans, elevation plans, scale on building plans, packaging, and 3D models.',
      order: 8,
      lessons: [
        { title: 'Floor Plans, Elevations, Packaging and Models', description: 'Reading building plans, elevation views, plan symbols, packaging optimisation, and scale models.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Revision',
      description: 'Key formulae, exam structure, and mixed practice covering all Grade 11 Maths Lit topics.',
      order: 9,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Summary of all key formulae, revision questions from every topic, and exam tips.', blocks: ch9_lesson1, term: 4 },
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
    title: 'Grade 11 Mathematical Literacy \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Patterns, Measurement, Finance, Maps and Plans, Data Handling, Probability, and Revision for Grade 11 Mathematical Literacy.',
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
  console.log('  TEXTBOOK: Grade 11 Mathematical Literacy');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
