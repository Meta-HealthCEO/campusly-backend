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

// =============================================================================
// CHAPTER 1: Impacts of Recent Legislation (Term 1)
// =============================================================================

// Lesson 1: Skills Development Act and Employment Equity Act
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Skills Development Act (SDA)\n\nThe Skills Development Act (No. 97 of 1998) was enacted to improve the skills of the South African workforce and increase productivity.\n\n### Purpose of the SDA\n\n- Develop the skills of the South African workforce to improve productivity and competitiveness\n- Increase investment in education and training\n- Encourage employers to use the workplace as a learning environment\n- Improve the employment prospects of previously disadvantaged persons\n- Ensure the quality of education and training in the workplace'),
  t(2, '### Role of SETAs (Sector Education and Training Authorities)\n\nSETAs are responsible for skills development within their specific economic sector.\n\n**Key functions of SETAs:**\n- Develop a Sector Skills Plan (SSP) within the framework of the National Skills Development Strategy\n- Implement the SSP by establishing learnerships, approving workplace skills plans, and allocating grants\n- Promote learnerships by identifying workplaces for practical work experience\n- Register learnership agreements\n- Collect and disburse skills development levies in the sector\n- Monitor education and training in the sector\n\n**Examples of SETAs:**\n| SETA | Sector |\n|------|--------|\n| BANKSETA | Banking |\n| MERSETA | Manufacturing, Engineering |\n| FASSET | Finance, Accounting |\n| W&RSETA | Wholesale and Retail |\n| CATHSSETA | Culture, Arts, Tourism, Hospitality, Sport |'),
  t(3, '### Skills Development Levy (SDL)\n\nEmployers with an annual payroll above R500 000 must pay 1% of their total payroll as a Skills Development Levy to SARS.\n\n**Distribution of the levy:**\n- 80% goes to the relevant SETA\n- 20% goes to the National Skills Fund (NSF)\n\n**Employers can claim back a portion through:**\n- Mandatory grants (submitting a Workplace Skills Plan) \u2014 up to 20%\n- Discretionary grants (for specific training projects) \u2014 up to 49.5%'),
  q(4, 'What percentage of total payroll must an employer pay as a Skills Development Levy?',
    ['0.5%', '1%', '2%', '1.5%'], 1,
    'Employers must pay 1% of their total annual payroll as a Skills Development Levy to SARS.'),
  t(5, '## Employment Equity Act (EEA) \u2014 No. 55 of 1998\n\nThe Employment Equity Act aims to achieve equity in the workplace by:\n- Promoting equal opportunity and fair treatment through the elimination of unfair discrimination\n- Implementing affirmative action measures to redress past disadvantages\n\n### Key Provisions\n\n**Designated employers** (50+ employees or turnover above a threshold) must:\n- Prepare an Employment Equity Plan\n- Report annually to the Department of Employment and Labour\n- Consult with employees on the plan\n\n**Designated groups:** Black people, women, and people with disabilities.'),
  t(6, '### Affirmative Action\n\nAffirmative action is NOT about hiring unqualified people. It means:\n- Identifying and eliminating barriers to employment for designated groups\n- Taking positive steps to promote diversity in the workforce\n- Making reasonable accommodation for people with disabilities\n- Ensuring equitable representation at all occupational levels\n\n**Example:** Shoprite has an Employment Equity Plan that sets numerical targets for representation of designated groups at management level. They provide bursaries and management trainee programmes specifically targeting previously disadvantaged individuals.\n\n**What affirmative action is NOT:**\n- It does not require employers to hire unqualified candidates\n- It does not create absolute barriers against non-designated groups\n- It does not require employers to create new positions'),
  fb(7, 'The Employment Equity Act targets three designated groups: ___, ___, and ___.',
    ['Black people', 'women', 'people with disabilities'],
    'The three designated groups under the EEA are Black people, women, and people with disabilities.',
    ['Think about which groups were historically disadvantaged in SA.']),
  q(8, 'Which of the following is NOT a function of a SETA?',
    ['Developing a Sector Skills Plan', 'Registering learnership agreements', 'Setting minimum wages for the sector', 'Collecting and disbursing skills development levies'], 2,
    'Setting minimum wages is a function of the Department of Employment and Labour, not SETAs. SETAs focus on skills development and training.'),
  t(9, '### Basic Conditions of Employment Act (BCEA) \u2014 No. 75 of 1997\n\nThe BCEA sets minimum conditions of employment:\n\n| Condition | Requirement |\n|-----------|-------------|\n| Working hours | Maximum 45 hours per week (9 hours/day for 5-day week) |\n| Overtime | Maximum 10 hours per week; paid at 1.5x normal rate |\n| Annual leave | 21 consecutive days per year (or 1 day per 17 days worked) |\n| Sick leave | 30 days over a 3-year cycle |\n| Maternity leave | 4 consecutive months (unpaid, but UIF benefits apply) |\n| Family responsibility leave | 3 days per year for birth, illness, or death of close family |\n| Notice period | 1 week (first 6 months), 2 weeks (6\u201312 months), 4 weeks (1+ year) |'),
  q(10, 'According to the BCEA, what is the maximum number of ordinary working hours per week?',
    ['40 hours', '45 hours', '48 hours', '50 hours'], 1,
    'The BCEA stipulates a maximum of 45 ordinary working hours per week.'),
];

// Lesson 2: LRA, BBBEE, NCA, CPA
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Labour Relations Act (LRA) \u2014 No. 66 of 1995\n\nThe LRA governs the relationship between employers, employees, and trade unions.\n\n### Key Provisions\n\n**Rights of employees:**\n- Right to join a trade union\n- Right to participate in lawful strike action\n- Right to fair labour practices\n- Right to not be unfairly dismissed\n- Right to refer disputes to the CCMA (Commission for Conciliation, Mediation and Arbitration)\n\n**Rights of employers:**\n- Right to join an employers\u2019 organisation\n- Right to lock out employees (under certain conditions)\n- Right to fair labour practices\n- Right to discipline employees following correct procedures'),
  t(2, '### Dispute Resolution under the LRA\n\n**Step 1:** Internal grievance procedure \u2192 try to resolve within the workplace\n**Step 2:** Referral to CCMA or Bargaining Council \u2192 conciliation (try to find agreement)\n**Step 3:** If conciliation fails \u2192 arbitration (binding decision) OR Labour Court\n\n### Compensation for Occupational Injuries and Diseases (COIDA)\n\nThe Compensation for Occupational Injuries and Diseases Act requires employers to:\n- Register with the Compensation Commissioner\n- Pay annual assessments (premiums)\n- Report any workplace injuries or diseases\n\n**Employees are entitled to:**\n- Medical expenses for work-related injuries\n- Temporary or permanent disability payments\n- Compensation for dependants in case of death'),
  t(3, '## Broad-Based Black Economic Empowerment (BBBEE) Act\n\n### BEE vs BBBEE\n\n| Aspect | BEE (original) | BBBEE (broad-based) |\n|--------|----------------|---------------------|\n| Focus | Individual black ownership | Broad economic participation |\n| Beneficiaries | A few wealthy individuals | Wide range of black South Africans |\n| Scope | Narrow \u2014 mainly ownership | Broad \u2014 multiple elements |\n| Criticism | Created a small elite | Aims for wider transformation |\n\nBBBEE was introduced because the original BEE only benefited a small group of individuals, not the broader population.'),
  t(4, '### The FIVE Pillars of BBBEE (Revised Codes)\n\n| Pillar | Weighting | Description |\n|--------|-----------|-------------|\n| **Ownership** | 25 points | % of business owned by black people |\n| **Management control** | 19 points | Black representation at senior and board level |\n| **Skills development** | 20 points | Investment in training black employees |\n| **Enterprise and supplier development** | 40 points | Procurement from black-owned businesses; supporting small black enterprises |\n| **Socio-economic development** | 5 points | Contributions to community upliftment |\n\n**Total: 109 points** (possible to exceed 100 due to bonus points)\n\n**BBBEE Levels:**\n- Level 1 (100+ points) \u2192 135% procurement recognition\n- Level 4 (65\u201374 points) \u2192 100% procurement recognition\n- Level 8 (40\u201344 points) \u2192 10% procurement recognition\n- Non-compliant (<40 points) \u2192 0% recognition'),
  q(5, 'Which BBBEE pillar carries the highest weighting?',
    ['Ownership', 'Management control', 'Enterprise and supplier development', 'Skills development'], 2,
    'Enterprise and supplier development carries 40 points, making it the highest weighted pillar under the revised BBBEE codes.'),
  fb(6, 'The main difference between BEE and BBBEE is that BEE benefited ___ individuals while BBBEE aims for ___ economic participation.',
    ['a few', 'broad'],
    'BEE was criticised for only enriching a small elite. BBBEE aims to spread the benefits of economic empowerment more broadly.',
    ['Think about why the word "Broad-Based" was added.']),
  t(7, '## National Credit Act (NCA) \u2014 No. 34 of 2005\n\nThe NCA protects consumers who borrow money or buy on credit.\n\n**Key provisions:**\n- Credit providers must conduct a thorough **affordability assessment** before granting credit\n- All fees, interest rates, and terms must be clearly disclosed in plain language\n- Consumers have a right to apply for **debt review** if they are over-indebted\n- Reckless credit granting is prohibited and can be set aside by a court\n- Maximum interest rates are regulated\n\n**Practical example:** Pick n Pay cannot issue a store card to a customer who already has excessive debt obligations. They must check the consumer\u2019s credit record and verify their income first.'),
  t(8, '## Consumer Protection Act (CPA) \u2014 No. 68 of 2008\n\nThe CPA protects the rights of consumers when purchasing goods and services.\n\n**Key rights under the CPA:**\n\n| Right | Explanation |\n|-------|-------------|\n| Right to equality | No discrimination when accessing goods/services |\n| Right to privacy | Protection from unwanted direct marketing |\n| Right to choose | Cannot be forced to buy bundled goods |\n| Right to disclosure | Must receive information in plain language |\n| Right to fair and responsible marketing | Advertising must not be misleading |\n| Right to fair and honest dealing | No bait marketing, negative option marketing |\n| Right to fair value, good quality, and safety | Goods must be safe and of acceptable quality |\n| Right to return goods | 6-month implied warranty on defective goods |\n\n**Example:** If you buy a cell phone from MTN and it stops working after 3 months due to a manufacturing defect, you can return it for a repair, replacement, or refund under the CPA.'),
  q(9, 'Under the National Credit Act, what must a credit provider do before granting credit?',
    ['Only check the applicant\u2019s ID', 'Conduct an affordability assessment', 'Get approval from the CCMA', 'Notify the consumer\u2019s employer'], 1,
    'The NCA requires credit providers to conduct a thorough affordability assessment to ensure the consumer can afford the credit.'),
  q(10, 'Under the CPA, for how long does the implied warranty on defective goods apply?',
    ['3 months', '6 months', '12 months', '30 days'], 1,
    'The CPA provides a 6-month implied warranty. If goods are defective within this period, consumers can request a repair, replacement, or refund.'),
];

// =============================================================================
// CHAPTER 2: Human Resources Function (Term 1)
// =============================================================================

// Lesson 1: Recruitment, Selection, Induction
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## The Human Resources Function\n\nHuman Resources (HR) is responsible for managing the most valuable asset of any business \u2014 its people.\n\n### Key HR Activities\n\n1. **Recruitment** \u2014 Attracting suitable candidates for vacancies\n2. **Selection** \u2014 Choosing the best candidate from applicants\n3. **Induction** \u2014 Orienting new employees to the workplace\n4. **Placement** \u2014 Assigning employees to the right positions\n5. **Training and development** \u2014 Improving employee skills\n6. **Compensation** \u2014 Managing salaries and benefits\n7. **Performance management** \u2014 Evaluating employee performance'),
  t(2, '### Recruitment: Internal vs External\n\n| Factor | Internal Recruitment | External Recruitment |\n|--------|---------------------|----------------------|\n| **Source** | Current employees (promotions, transfers) | Outside the organisation (advertisements, agencies) |\n| **Cost** | Lower (no advertising costs) | Higher (adverts, recruitment agencies) |\n| **Time** | Faster | Slower |\n| **Morale** | Boosts employee motivation | May demotivate current staff |\n| **Fresh ideas** | Limited \u2014 same mindset | Brings new perspectives |\n| **Risk** | Known performance record | Unknown quantity |\n| **Training** | Less training needed | May need more training |\n\n**Example:** When Sasol needs a new plant manager, they may first advertise internally through their intranet, noticeboards, and newsletters. If no suitable internal candidate is found, they advertise externally in newspapers, LinkedIn, and through recruitment agencies.'),
  q(3, 'Which is an advantage of external recruitment over internal recruitment?',
    ['Lower cost', 'Faster process', 'Brings fresh ideas and new perspectives', 'Known performance record'], 2,
    'External recruitment brings new perspectives and fresh ideas from outside the organisation, which is its key advantage over internal recruitment.'),
  t(4, '### The Selection Process\n\n**Step 1: Screening** \u2014 Review CVs and applications against job requirements. Eliminate candidates who do not meet minimum criteria.\n\n**Step 2: Short-listing** \u2014 Create a shortlist of the most suitable candidates based on qualifications, experience, and skills.\n\n**Step 3: Interviewing** \u2014 Conduct structured interviews using the same questions for all candidates. May include:\n- Panel interviews (multiple interviewers)\n- Competency-based questions\n- Situational/behavioural questions\n\n**Step 4: Testing** \u2014 May include psychometric tests, skills assessments, or medical examinations.\n\n**Step 5: Reference checks** \u2014 Verify information from referees provided by the candidate.\n\n**Step 6: Final selection** \u2014 Choose the best candidate and make a formal job offer.'),
  t(5, '### Induction and Placement\n\n**Induction** (orientation) is the process of introducing new employees to the organisation.\n\n**An effective induction programme covers:**\n- Company history, mission, vision, and values\n- Organisational structure and key personnel\n- Policies and procedures (leave, discipline, safety)\n- Tour of the workplace and facilities\n- Introduction to colleagues and supervisors\n- Job-specific training\n- Health and safety regulations\n\n**Why induction is important:**\n- Reduces anxiety and uncertainty for new employees\n- Helps employees become productive faster\n- Reduces early turnover (employees leaving within the first few months)\n- Ensures compliance with legal requirements (e.g., OHS Act)\n\n**Placement** ensures employees are assigned to positions that match their skills, qualifications, and interests. Poor placement leads to low productivity, frustration, and high staff turnover.'),
  fb(6, 'The process of attracting suitable candidates is called ___. The process of choosing the best candidate is called ___.',
    ['recruitment', 'selection'],
    'Recruitment is about attracting candidates; selection is about choosing from among them.'),
  q(7, 'During the selection process, which step comes AFTER short-listing?',
    ['Screening of CVs', 'Interviewing', 'Advertising the position', 'Placement'], 1,
    'The selection process follows: screening \u2192 short-listing \u2192 interviewing \u2192 testing \u2192 reference checks \u2192 final selection.'),
  t(8, '### Salary Determination and Fringe Benefits\n\n**Factors affecting salary determination:**\n- Market rates for the position\n- Employee qualifications and experience\n- Complexity and responsibility of the job\n- Industry and sector norms\n- Company financial position\n- Collective bargaining agreements\n- Government regulations (minimum wage)\n\n**Fringe benefits (perks):**\n\n| Benefit | Description |\n|---------|-------------|\n| Medical aid | Employer contributes to employee\u2019s medical scheme |\n| Pension/provident fund | Retirement savings with employer contribution |\n| Company car | Vehicle provided for business and personal use |\n| Housing allowance | Subsidy towards accommodation costs |\n| Cell phone allowance | Company pays for mobile communication |\n| Performance bonuses | Additional pay linked to performance |\n| Study assistance | Employer funds further education |\n| Gym membership | Health and wellness benefit |'),
  q(9, 'Which legislation primarily governs the minimum conditions of employment such as working hours and leave?',
    ['Employment Equity Act', 'Labour Relations Act', 'Basic Conditions of Employment Act', 'Skills Development Act'], 2,
    'The BCEA sets minimum conditions of employment including working hours, leave, and overtime.'),
  t(10, '### Impact of Legislation on HR\n\n| Legislation | Impact on HR Function |\n|-------------|----------------------|\n| **LRA** | Must follow fair disciplinary and dismissal procedures; recognise trade unions; handle disputes through CCMA |\n| **BCEA** | Must comply with minimum working hours, leave, overtime pay; keep accurate attendance records |\n| **EEA** | Must develop and implement Employment Equity Plans; report to Department of Labour; promote affirmative action |\n| **SDA** | Must pay Skills Development Levy; submit Workplace Skills Plans; provide training opportunities |\n| **COIDA** | Must register with Compensation Commissioner; report workplace injuries; maintain safe working environment |\n\n**Example:** When Woolworths restructures and retrenches staff, HR must follow the LRA\u2019s Section 189 procedures: consult with employee representatives, explore alternatives to retrenchment, apply fair criteria (e.g., LIFO \u2014 Last In, First Out), and provide severance pay (at least 1 week per completed year of service).'),
];

// =============================================================================
// CHAPTER 3: Professionalism and Ethics (Term 1)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Professionalism and Ethics in Business\n\n### Ethical vs Unethical Behaviour\n\n**Ethics** refers to a set of moral principles that guide behaviour and decision-making in business.\n\n| Ethical Behaviour | Unethical Behaviour |\n|-------------------|--------------------|\n| Honest advertising | False/misleading advertising |\n| Fair pricing | Price fixing with competitors |\n| Paying taxes fully | Tax evasion |\n| Respecting employee rights | Exploiting workers |\n| Transparent financial reporting | Cooking the books |\n| Protecting customer data | Selling customer information |\n| Sustainable environmental practices | Illegal dumping of waste |'),
  t(2, '### Professional vs Unprofessional Behaviour\n\n| Professional Behaviour | Unprofessional Behaviour |\n|-----------------------|-------------------------|\n| Punctuality and reliability | Consistent lateness and absenteeism |\n| Respecting confidentiality | Gossiping about colleagues or clients |\n| Dressing appropriately | Ignoring dress code |\n| Meeting deadlines | Missing deadlines without communication |\n| Taking responsibility for mistakes | Blaming others |\n| Treating all stakeholders with respect | Rudeness and discrimination |\n| Continuous self-development | Refusal to learn or adapt |\n| Following organisational policies | Ignoring company rules |'),
  t(3, '### King IV Code of Corporate Governance\n\nThe King Code provides principles for good corporate governance in South Africa. King IV (2016) applies to all organisations, not just listed companies.\n\n**THREE Key Principles of King IV:**\n\n**1. Ethical Leadership:**\n- The board must lead ethically and set the tone for the organisation\n- Directors must act with integrity, competence, responsibility, and fairness\n- An ethical culture must be promoted throughout the organisation\n\n**2. Good Corporate Citizenship:**\n- Organisations must consider their impact on society, the economy, and the environment\n- Must contribute to sustainable development\n- Triple bottom line: People, Planet, Profit\n\n**3. Stakeholder Inclusivity:**\n- The legitimate interests of ALL stakeholders must be considered\n- Transparent communication with stakeholders\n- Stakeholders include shareholders, employees, customers, suppliers, communities, and government'),
  q(4, 'Which version of the King Code is currently applicable in South Africa?',
    ['King II', 'King III', 'King IV', 'King V'], 2,
    'King IV was released in 2016 and is the current version of the King Code of Corporate Governance in South Africa.'),
  t(5, '### Types of Unethical Business Practices\n\n**1. Unfair advertising:** Making false claims about products (e.g., a slimming product that does not work as advertised)\n\n**2. Insider trading:** Using confidential company information to trade shares on the JSE for personal gain\n\n**3. Tax evasion:** Illegally avoiding tax obligations (different from legal tax avoidance/tax planning)\n\n**4. Bribery and corruption:** Offering or accepting gifts/money to influence business decisions\n\n**5. Nepotism:** Hiring family members or friends regardless of their qualifications\n\n**6. Fraud and window dressing:** Manipulating financial statements to appear more profitable (e.g., Steinhoff scandal)\n\n**7. Exploitation of workers:** Paying below minimum wage, unsafe working conditions\n\n**8. Environmental irresponsibility:** Illegal dumping, excessive pollution without mitigation'),
  t(6, '### The Steinhoff Scandal \u2014 A South African Case Study\n\nSteinhoff International, a major SA retailer, collapsed in December 2017 when it was revealed that senior management had inflated profits by approximately R250 billion through fraudulent transactions.\n\n**What happened:**\n- Fictitious revenue from fake transactions between related parties\n- Share price crashed from R60 to R1\n- Pension funds, individual investors, and employees lost billions\n\n**Ethical violations:**\n- Fraudulent financial reporting\n- Breach of fiduciary duty by directors\n- Failure of corporate governance\n- Auditors failed to detect the fraud\n\n**Lessons for business:**\n- Strong governance structures are essential\n- Independent audits must be truly independent\n- Whistleblower protection is vital\n- The board must ensure ethical leadership'),
  q(7, 'Hiring a family member for a position they are not qualified for is an example of:',
    ['Insider trading', 'Nepotism', 'Window dressing', 'Tax evasion'], 1,
    'Nepotism is the practice of favouring relatives or friends in employment, regardless of their qualifications.'),
  t(8, '### Strategies to Deal with Unethical Behaviour\n\n1. **Develop a Code of Ethics/Conduct** \u2014 A written document outlining acceptable and unacceptable behaviour for all employees\n\n2. **Ethics committee** \u2014 Establish a committee to oversee ethical compliance and handle ethical dilemmas\n\n3. **Whistleblower protection** \u2014 Encourage reporting of unethical behaviour without fear of victimisation (Protected Disclosures Act)\n\n4. **Ethics training** \u2014 Regular training programmes to educate employees on ethical standards\n\n5. **Lead by example** \u2014 Management must demonstrate ethical behaviour (tone from the top)\n\n6. **Reward ethical behaviour** \u2014 Recognise and reward employees who act ethically\n\n7. **Disciplinary action** \u2014 Consistent consequences for unethical behaviour\n\n8. **Independent audits** \u2014 Regular external audits to verify financial integrity'),
  fb(9, 'The three key principles of King IV are ethical ___, good corporate ___, and stakeholder ___.',
    ['leadership', 'citizenship', 'inclusivity'],
    'King IV is built on ethical leadership, good corporate citizenship, and stakeholder inclusivity.',
    ['Think about who leads, what the company does for society, and who has an interest in the business.']),
  q(10, 'Which Act protects employees who report unethical behaviour in the workplace?',
    ['Labour Relations Act', 'Consumer Protection Act', 'Protected Disclosures Act', 'Companies Act'], 2,
    'The Protected Disclosures Act (2000) protects whistleblowers from occupational detriment for reporting unlawful or irregular conduct.'),
];

// =============================================================================
// CHAPTER 4: Creative Thinking and Problem Solving (Term 1)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Creative Thinking and Problem Solving\n\n### The Problem-Solving Process\n\nProblem solving is a systematic approach to finding solutions to challenges in business.\n\n**Steps in the Problem-Solving Process:**\n\n1. **Identify the problem** \u2014 Clearly define what the problem is. Distinguish between symptoms and root causes.\n2. **Gather information** \u2014 Collect relevant data and facts about the problem.\n3. **Generate possible solutions** \u2014 Use creative thinking techniques to brainstorm alternatives.\n4. **Evaluate options** \u2014 Assess each option against criteria (cost, feasibility, time, impact).\n5. **Choose the best solution** \u2014 Select the option that best addresses the problem.\n6. **Implement the solution** \u2014 Put the chosen solution into action with a clear plan.\n7. **Evaluate the outcome** \u2014 Monitor results and adjust if necessary.'),
  t(2, '### Decision Making\n\nDecision making is closely related to problem solving but involves choosing between alternatives.\n\n**Types of decisions:**\n- **Strategic decisions** \u2014 Long-term, made by top management (e.g., entering a new market)\n- **Tactical decisions** \u2014 Medium-term, made by middle management (e.g., hiring additional staff for peak season)\n- **Operational decisions** \u2014 Day-to-day, made by lower management (e.g., scheduling shifts)\n\n**Factors influencing decisions:**\n- Available resources (budget, staff, time)\n- Risk involved\n- Stakeholder interests\n- Legal and ethical considerations\n- Urgency of the problem\n- Available information'),
  t(3, '### Problem-Solving Technique 1: Brainstorming\n\n**What it is:** A group technique where participants freely generate as many ideas as possible without criticism.\n\n**Rules of brainstorming:**\n- No criticism or evaluation during the idea-generation phase\n- Wild and creative ideas are encouraged\n- Build on the ideas of others\n- Quantity is valued over quality initially\n- Record all ideas\n\n**Application:** A retail business like Pick n Pay wants to increase foot traffic. A brainstorming session might generate ideas like: loyalty programmes, in-store events, social media campaigns, partnerships with local businesses, extended trading hours, free Wi-Fi, play areas for children.\n\n**Advantages:** Generates many ideas quickly, encourages creative thinking, involves team members\n**Disadvantages:** Can be dominated by louder individuals, may produce impractical ideas, requires a skilled facilitator'),
  q(4, 'During a brainstorming session, which rule should be followed?',
    ['Only managers should contribute ideas', 'All ideas must be evaluated immediately', 'Criticism of ideas should be withheld until later', 'Only practical ideas should be recorded'], 2,
    'A key rule of brainstorming is that no criticism or evaluation should occur during the idea-generation phase.'),
  t(5, '### Problem-Solving Technique 2: Mind Mapping\n\n**What it is:** A visual diagram that starts with a central idea and branches out into related subtopics and details.\n\n**How to create a mind map:**\n1. Write the central problem or topic in the middle of the page\n2. Draw branches for main categories or themes\n3. Add sub-branches for details, ideas, or solutions\n4. Use colours, symbols, and images to enhance memory\n\n**Application:** A school tuck shop wants to improve sales. The central topic would be "Increase Tuck Shop Sales" with branches for: menu changes, pricing, marketing, operating hours, customer feedback, competition analysis.\n\n**Advantages:** Visual representation aids understanding, shows relationships between ideas, stimulates creative thinking, easy to expand\n**Disadvantages:** Can become cluttered with complex problems, not suitable for all thinking styles, requires artistic effort'),
  t(6, '### Problem-Solving Technique 3: Force Field Analysis\n\n**What it is:** A technique developed by Kurt Lewin that identifies the forces FOR (driving forces) and AGAINST (restraining forces) a proposed change.\n\n**How it works:**\n1. Define the proposed change or goal\n2. List all driving forces (factors supporting the change)\n3. List all restraining forces (factors opposing the change)\n4. Rate each force on a scale (e.g., 1\u20135)\n5. Develop strategies to strengthen driving forces and weaken restraining forces\n\n**Example:** MTN wants to launch a new data bundle:\n\n| Driving Forces | Score | Restraining Forces | Score |\n|---------------|-------|--------------------|-------|\n| Growing demand for data | 5 | Price competition from Vodacom | 4 |\n| Existing customer base | 4 | Infrastructure investment needed | 3 |\n| Brand recognition | 4 | Regulatory requirements (ICASA) | 2 |\n| **Total** | **13** | **Total** | **9** |\n\nDriving forces outweigh restraining forces \u2192 proceed with the launch.'),
  q(7, 'In a Force Field Analysis, what are the forces that oppose a proposed change called?',
    ['Driving forces', 'Push forces', 'Restraining forces', 'Negative forces'], 2,
    'Restraining forces are the factors that resist or oppose a proposed change. Driving forces support the change.'),
  t(8, '### Problem-Solving Technique 4: SCAMPER\n\n**SCAMPER** is an acronym for seven ways to modify an existing product, service, or process:\n\n| Letter | Meaning | Question to Ask |\n|--------|---------|----------------|\n| **S** | Substitute | What can you replace? (materials, people, process) |\n| **C** | Combine | What can you merge or combine? |\n| **A** | Adapt | What can you adjust or modify? |\n| **M** | Modify/Magnify | What can you enlarge, reduce, or change? |\n| **P** | Put to other use | What else can it be used for? |\n| **E** | Eliminate | What can you remove or simplify? |\n| **R** | Reverse/Rearrange | What if you did it in a different order? |\n\n**Example:** A restaurant applying SCAMPER:\n- **Substitute:** Replace paper menus with digital tablets\n- **Combine:** Combine restaurant and cooking class experiences\n- **Adapt:** Adapt the menu for dietary needs (vegan, halal, gluten-free)\n- **Modify:** Modify portion sizes for different price points\n- **Put to other use:** Use the venue for private events after hours\n- **Eliminate:** Remove items that don\u2019t sell well\n- **Rearrange:** Change the seating layout to increase capacity'),
  fb(9, 'SCAMPER stands for Substitute, Combine, Adapt, ___, Put to other use, Eliminate, and ___.',
    ['Modify', 'Reverse'],
    'SCAMPER: Substitute, Combine, Adapt, Modify (or Magnify), Put to other use, Eliminate, Reverse (or Rearrange).',
    ['The M and R are the trickiest to remember.']),
  q(10, 'A business wants to identify factors supporting and opposing a new strategy. Which technique should they use?',
    ['Brainstorming', 'Mind mapping', 'Force Field Analysis', 'SCAMPER'], 2,
    'Force Field Analysis specifically identifies driving forces (supporting) and restraining forces (opposing) a proposed change.'),
  t(11, '### Advantages of Creative Thinking in Business\n\n- Generates innovative solutions to complex problems\n- Helps businesses gain a competitive advantage\n- Encourages employee engagement and ownership\n- Leads to improved products, services, and processes\n- Helps adapt to changing market conditions\n- Encourages risk-taking and experimentation\n- Creates a culture of continuous improvement'),
];

// =============================================================================
// CHAPTER 5: Business Strategies and the Macro Environment (Term 1)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Business Strategies and the Macro Environment\n\n### Steps in Developing a Strategy\n\n1. **Environmental analysis** \u2014 Analyse the micro, market, and macro environments\n2. **Set objectives** \u2014 Define SMART goals (Specific, Measurable, Achievable, Realistic, Time-bound)\n3. **Develop strategies** \u2014 Create plans to achieve the objectives\n4. **Implement strategies** \u2014 Put plans into action with clear responsibilities and timelines\n5. **Evaluate and control** \u2014 Monitor progress and make adjustments\n\n### The Strategic Management Process\n\nStrategic management is an ongoing process of planning, monitoring, and evaluating all that an organisation needs to achieve its goals.\n\n**Three levels of strategy:**\n- **Corporate strategy** \u2014 Overall direction of the business (e.g., growth, stability, retrenchment)\n- **Business strategy** \u2014 How to compete in each market (e.g., cost leadership, differentiation)\n- **Functional strategy** \u2014 Department-level plans (e.g., marketing strategy, HR strategy)'),
  t(2, '### Porter\u2019s Five Forces Model\n\nMichael Porter\u2019s model analyses the competitive forces in an industry:\n\n**1. Threat of new entrants** \u2014 How easy is it for new businesses to enter the market?\n- High barriers to entry (capital, regulation, brand loyalty) = low threat\n- Example: Banking has high barriers; food trucks have low barriers\n\n**2. Bargaining power of suppliers** \u2014 Can suppliers dictate terms and prices?\n- Few suppliers = high power; many suppliers = low power\n- Example: Eskom is the only electricity supplier \u2192 very high bargaining power\n\n**3. Bargaining power of buyers** \u2014 Can customers demand lower prices or better quality?\n- Many alternatives = high buyer power\n- Example: Consumers can easily switch between Vodacom, MTN, and Telkom \u2192 high buyer power\n\n**4. Threat of substitutes** \u2014 Can customers switch to alternative products?\n- Example: Uber is a substitute for traditional metered taxis\n\n**5. Rivalry among existing competitors** \u2014 How intense is competition?\n- Example: Shoprite vs Pick n Pay vs Checkers vs Woolworths \u2192 very high rivalry'),
  q(3, 'According to Porter\u2019s Five Forces, Eskom\u2019s monopoly on electricity supply gives it:',
    ['Low bargaining power', 'High bargaining power as a supplier', 'High threat of substitutes', 'Low rivalry'], 1,
    'As the sole electricity supplier in South Africa, Eskom has very high bargaining power because customers have no alternative supplier.'),
  t(4, '### PESTLE Analysis\n\nPESTLE analyses the MACRO environment \u2014 external factors a business cannot control.\n\n| Factor | Description | Example |\n|--------|-------------|--------|\n| **P**olitical | Government policies, stability, corruption | BBBEE requirements, load shedding policy |\n| **E**conomic | GDP growth, inflation, interest rates, exchange rates, unemployment | SA\u2019s high unemployment rate (~33%) |\n| **S**ocial | Demographics, culture, health, education levels | HIV/AIDS impact on workforce; urbanisation |\n| **T**echnological | Innovation, automation, digital transformation | 4IR, e-commerce growth, mobile banking |\n| **L**egal | Legislation, regulations, compliance requirements | NCA, CPA, POPIA (data protection) |\n| **E**nvironmental | Climate change, sustainability, resource scarcity | Carbon tax, water restrictions, renewable energy |\n\n**Example:** A new restaurant in Cape Town would need to consider: political stability (P), consumer spending power (E), food preferences and dietary trends (S), online ordering platforms (T), health and safety regulations (L), and water restrictions (E).'),
  fb(5, 'PESTLE stands for Political, ___, Social, ___, Legal, and Environmental.',
    ['Economic', 'Technological'],
    'PESTLE: Political, Economic, Social, Technological, Legal, Environmental.',
    ['Think about the factors outside a business that it cannot control.']),
  t(6, '### Types of Business Strategies\n\n**1. Cost Leadership Strategy**\n- Aim to be the lowest-cost producer in the industry\n- Example: Shoprite offers the lowest prices to attract price-sensitive consumers\n- Advantage: Large market share, economies of scale\n\n**2. Differentiation Strategy**\n- Offer unique products/services that justify premium prices\n- Example: Woolworths differentiates through quality and organic/ethical products\n- Advantage: Customer loyalty, higher profit margins\n\n**3. Focus Strategy (Niche)**\n- Target a specific market segment\n- Example: Nando\u2019s focuses specifically on flame-grilled chicken\n- Advantage: Deep understanding of target market, strong brand in the niche\n\n**4. Growth Strategies:**\n- **Market penetration** \u2014 Sell more of existing products in existing markets\n- **Market development** \u2014 Enter new markets with existing products\n- **Product development** \u2014 Develop new products for existing markets\n- **Diversification** \u2014 New products in new markets (highest risk)'),
  q(7, 'Woolworths\u2019 strategy of offering premium-quality products at higher prices is an example of:',
    ['Cost leadership', 'Differentiation', 'Focus strategy', 'Market penetration'], 1,
    'Woolworths differentiates through quality, ethical sourcing, and premium products, justifying higher prices.'),
  t(8, '### SWOT Analysis Integration\n\nA SWOT analysis combines internal and external analysis:\n\n| | Positive | Negative |\n|---|----------|----------|\n| **Internal** | **Strengths** (what we do well) | **Weaknesses** (where we need to improve) |\n| **External** | **Opportunities** (what we can exploit) | **Threats** (what could harm us) |\n\n**Example: SWOT for Pick n Pay:**\n\n| Strengths | Weaknesses |\n|-----------|------------|\n| Strong brand recognition | Smaller market share than Shoprite |\n| Smart Shopper loyalty programme | Limited presence in rural areas |\n| Online shopping platform | Higher prices than competitors |\n\n| Opportunities | Threats |\n|--------------|--------|\n| Growing demand for online grocery delivery | Intense competition from Checkers Sixty60 |\n| Expansion into African markets | Economic downturn reducing consumer spending |\n| Sustainable/organic product trends | Load shedding increasing operational costs |'),
  q(9, 'In a SWOT analysis, "load shedding increasing operational costs" would be classified as:',
    ['A strength', 'A weakness', 'An opportunity', 'A threat'], 3,
    'Load shedding is an external factor that could harm the business, making it a threat.'),
  t(10, '### Steps in Strategy Evaluation\n\n1. **Set performance standards** \u2014 Define measurable benchmarks (KPIs)\n2. **Measure actual performance** \u2014 Collect data on what is actually happening\n3. **Compare actual vs planned** \u2014 Identify variances\n4. **Analyse deviations** \u2014 Determine why differences exist\n5. **Take corrective action** \u2014 Adjust strategies if performance is below expectations\n6. **Feedback** \u2014 Communicate results to relevant stakeholders\n\n**Example:** Sasol sets a target to reduce carbon emissions by 10% annually. After 12 months, actual reduction is only 4%. Corrective action: invest in cleaner technology, set interim quarterly targets, appoint a dedicated sustainability manager.'),
];

// =============================================================================
// CHAPTER 6: Business Sectors and Quality of Performance (Term 2)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Business Sectors\n\n### Three Types of Business Sectors\n\n| Sector | Activities | Examples |\n|--------|-----------|----------|\n| **Primary** | Extraction of raw materials from nature | Mining (Anglo American), farming, fishing, forestry |\n| **Secondary** | Processing raw materials into finished goods | Manufacturing (Toyota SA), construction, food processing |\n| **Tertiary** | Providing services | Banking (FNB), retail (Shoprite), transport, tourism |\n\n### Classification of Businesses\n\nBusinesses can also be classified by:\n- **Size:** Micro, small, medium, large\n- **Ownership:** Sole trader, partnership, company, state-owned\n- **Sector:** Public sector (government), private sector, non-profit sector'),
  t(2, '### Challenges in the THREE Business Environments\n\n**Micro environment (internal):**\n- Staff shortages and skills gaps\n- Inadequate management skills\n- Limited financial resources\n- Outdated equipment/technology\n- Poor organisational culture\n\n**Market environment:**\n- Intense competition from rivals\n- Changing consumer preferences\n- Supplier unreliability\n- Intermediary requirements (distributors, retailers)\n- Bargaining power of unions\n\n**Macro environment (external):**\n- Economic recession and high unemployment\n- Political instability and policy uncertainty\n- Load shedding and infrastructure failures\n- Changes in legislation (BBBEE compliance costs)\n- Technological disruption (e.g., online shopping replacing physical stores)\n- Environmental regulations (carbon tax)'),
  q(3, 'Toyota South Africa\u2019s manufacturing plant in Durban belongs to which business sector?',
    ['Primary', 'Secondary', 'Tertiary', 'Quaternary'], 1,
    'Manufacturing is a secondary sector activity because it processes raw materials (steel, rubber, etc.) into finished goods (vehicles).'),
  t(4, '## Quality Concepts\n\n### What is Quality?\n\nQuality means consistently meeting or exceeding customer expectations. It involves:\n- **Product quality** \u2014 Durability, reliability, performance, appearance\n- **Service quality** \u2014 Responsiveness, accuracy, professionalism, friendliness\n\n### Benefits of a Good Quality Management System\n\n- Increased customer satisfaction and loyalty\n- Reduced waste and rework (cost savings)\n- Improved reputation and brand image\n- Higher employee morale and pride in work\n- Competitive advantage over rivals\n- Compliance with industry standards (ISO 9001)\n- Fewer customer complaints and returns\n\n### Quality Indicators\n\n- Customer satisfaction surveys and ratings\n- Number of returns, complaints, and defects\n- On-time delivery rates\n- Employee turnover rates\n- Waste and rework percentages\n- Compliance with standards (ISO certification)'),
  t(5, '### Total Quality Management (TQM)\n\n**TQM** is a management approach where every employee at every level is committed to maintaining high standards of quality in all aspects of the business.\n\n**FIVE TQM Elements and Their Impact:**\n\n**1. Continuous improvement (Kaizen):**\n- Small, ongoing improvements to processes\n- Impact: Reduces waste, increases efficiency, keeps the business competitive\n\n**2. Employee empowerment:**\n- Employees are trained and given authority to make quality decisions\n- Impact: Faster problem resolution, higher morale, sense of ownership\n\n**3. Customer focus:**\n- All activities are aimed at meeting customer needs\n- Impact: Increased satisfaction, loyalty, repeat business, positive word-of-mouth\n\n**4. Benchmarking:**\n- Comparing your processes with industry best practices\n- Impact: Identifies gaps, sets improvement targets, learns from market leaders\n\n**5. Teamwork:**\n- Quality circles and cross-functional teams work together\n- Impact: Better communication, shared responsibility, combined expertise'),
  q(6, 'Which TQM element involves comparing your business processes with industry best practices?',
    ['Kaizen', 'Employee empowerment', 'Benchmarking', 'Customer focus'], 2,
    'Benchmarking involves comparing your processes, products, or services against those of recognised industry leaders to identify areas for improvement.'),
  t(7, '### The PDCA Cycle (Deming Cycle)\n\nThe PDCA cycle is a continuous improvement model used in TQM:\n\n**Plan \u2192 Do \u2192 Check \u2192 Act**\n\n| Stage | Activity | Example |\n|-------|----------|--------|\n| **Plan** | Identify the problem and plan a solution | Shoprite notices long checkout queues and plans to add self-service kiosks |\n| **Do** | Implement the solution on a small scale (pilot) | Install 4 self-service kiosks in one store |\n| **Check** | Measure and evaluate the results | Track queue times, customer feedback, and error rates over 3 months |\n| **Act** | If successful, implement widely; if not, revise | Roll out kiosks to all stores OR modify the system based on feedback |\n\nThe cycle then repeats \u2014 continuous improvement never stops.'),
  fb(8, 'TQM stands for ___. The PDCA cycle stands for Plan, ___, Check, ___.',
    ['Total Quality Management', 'Do', 'Act'],
    'TQM = Total Quality Management. PDCA = Plan, Do, Check, Act.',
    ['The PDCA cycle is also called the Deming Cycle.']),
  q(9, 'Which of the following is NOT one of the five TQM elements?',
    ['Continuous improvement', 'Cost reduction through staff layoffs', 'Customer focus', 'Employee empowerment'], 1,
    'Staff layoffs are not a TQM element. The five elements are: continuous improvement, employee empowerment, customer focus, benchmarking, and teamwork.'),
  t(10, '### Impact of TQM on Businesses\n\n| TQM Element | Positive Impact | Example |\n|-------------|----------------|--------|\n| Continuous improvement | Lower costs, higher efficiency | Toyota\u2019s Kaizen system reduces defects |\n| Employee empowerment | Better decisions, higher morale | Woolworths staff can resolve complaints on the spot |\n| Customer focus | Higher satisfaction, loyalty | FNB\u2019s customer-centric banking innovations |\n| Benchmarking | Competitive awareness, goal-setting | Shoprite benchmarks against Walmart |\n| Teamwork | Innovation, shared responsibility | Sasol\u2019s cross-functional project teams |'),
];

// =============================================================================
// CHAPTER 7: Management and Leadership (Term 2)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Management and Leadership\n\n### Differences Between Management and Leadership\n\n| Management | Leadership |\n|-----------|------------|\n| Plans, organises, controls | Inspires, motivates, guides |\n| Focuses on systems and processes | Focuses on people and vision |\n| Maintains stability and order | Drives change and innovation |\n| Works within existing structures | Challenges the status quo |\n| Uses formal authority (position) | Uses personal influence (charisma, trust) |\n| Short-to-medium term focus | Long-term, visionary focus |\n| Risk-averse | Willing to take calculated risks |\n| Says "How and when?" | Says "What and why?" |\n\n**Key insight:** Good businesses need BOTH management and leadership. A person can be a manager without being a leader, and vice versa. The best managers are also strong leaders.'),
  t(2, '### FIVE Leadership Styles\n\n**1. Autocratic Leadership**\n- Leader makes all decisions alone, without consulting employees\n- Communication is one-way (top-down)\n- Employees follow instructions without question\n- **When effective:** Crisis situations, unskilled workers, time pressure\n- **Drawback:** Low morale, no creativity, high staff turnover\n- **Example:** A military commander during combat operations\n\n**2. Democratic (Participative) Leadership**\n- Leader involves employees in decision-making\n- Two-way communication is encouraged\n- Final decision rests with the leader\n- **When effective:** Skilled teams, complex problems, building commitment\n- **Drawback:** Slower decisions, not suitable for emergencies\n- **Example:** Google\u2019s collaborative work culture'),
  t(3, '**3. Laissez-faire (Free Rein) Leadership**\n- Leader provides minimal direction; employees manage themselves\n- Team members make their own decisions\n- Leader is available for guidance but does not interfere\n- **When effective:** Highly skilled, experienced, and motivated professionals\n- **Drawback:** Lack of direction, potential chaos, some employees may slack off\n- **Example:** Research teams at universities\n\n**4. Charismatic Leadership**\n- Leader inspires through personality, vision, and enthusiasm\n- Creates strong emotional bonds with followers\n- Leads by personal example and passion\n- **When effective:** Transformational periods, building a new culture\n- **Drawback:** Over-dependence on one person; organisation may struggle without them\n- **Example:** Nelson Mandela\u2019s leadership during SA\u2019s transition to democracy\n\n**5. Transactional Leadership**\n- Based on a system of rewards and punishments\n- Clear structure: meet targets = rewards; fail = consequences\n- Focuses on routine, supervision, and performance\n- **When effective:** Sales teams, production environments with clear targets\n- **Drawback:** Limited creativity, employees only do the minimum required\n- **Example:** A call centre manager who pays bonuses for meeting call targets'),
  q(4, 'Which leadership style involves minimal interference from the leader and allows team members to make their own decisions?',
    ['Autocratic', 'Democratic', 'Laissez-faire', 'Transactional'], 2,
    'Laissez-faire (free rein) leadership provides minimal direction, allowing team members to manage themselves.'),
  q(5, 'Nelson Mandela\u2019s ability to inspire through vision and personality is an example of which leadership style?',
    ['Transactional', 'Autocratic', 'Democratic', 'Charismatic'], 3,
    'Nelson Mandela is a classic example of charismatic leadership \u2014 inspiring through personality, vision, and emotional connection.'),
  fb(6, 'The leadership style based on rewards and punishments is called ___ leadership. The style where the leader makes all decisions alone is called ___ leadership.',
    ['transactional', 'autocratic'],
    'Transactional leadership uses rewards for meeting targets and consequences for failure. Autocratic leadership centralises all decisions with the leader.'),
  t(7, '### Impact of Management and Leadership on Business Success\n\n| Impact Area | Good Management & Leadership | Poor Management & Leadership |\n|------------|------------------------------|------------------------------|\n| Employee morale | High motivation, commitment | Low morale, high absenteeism |\n| Productivity | Efficient use of resources | Waste, delays, poor output |\n| Innovation | Encourages new ideas | Stagnation, resistance to change |\n| Staff turnover | Low \u2014 employees want to stay | High \u2014 talented people leave |\n| Customer service | Excellent, consistent service | Complaints, lost customers |\n| Profitability | Growing profits | Declining financial performance |\n| Reputation | Strong employer brand | Negative public perception |'),
  t(8, '### Role of Personal Attitude in Leadership\n\nA leader\u2019s personal attitude directly affects the entire organisation:\n\n**Positive attitudes that drive success:**\n- **Optimism** \u2014 Believing in possibilities inspires the team\n- **Integrity** \u2014 Honesty builds trust and credibility\n- **Resilience** \u2014 Bouncing back from setbacks sets an example\n- **Empathy** \u2014 Understanding employees\u2019 needs improves relationships\n- **Accountability** \u2014 Taking responsibility encourages others to do the same\n- **Openness to learning** \u2014 Continuous development inspires the team\n\n**Negative attitudes that cause failure:**\n- Arrogance and unwillingness to listen\n- Blame-shifting and lack of accountability\n- Micromanagement (not trusting employees)\n- Favouritism and inconsistency\n- Resistance to change'),
  q(9, 'A sales manager who offers bonuses for exceeding targets and issues warnings for underperformance is using which leadership style?',
    ['Charismatic', 'Laissez-faire', 'Democratic', 'Transactional'], 3,
    'Transactional leadership is based on a system of rewards (bonuses) for meeting/exceeding targets and punishments (warnings) for underperformance.'),
  q(10, 'Which of the following is a characteristic of management rather than leadership?',
    ['Inspiring employees with a vision', 'Driving change and innovation', 'Planning, organising, and controlling', 'Challenging the status quo'], 2,
    'Management focuses on planning, organising, leading, and controlling. Leadership focuses on vision, inspiration, and change.'),
];

// =============================================================================
// CHAPTER 8: Investment \u2014 Securities (Term 2)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Investment \u2014 Securities\n\n### Functions of the JSE (Johannesburg Stock Exchange)\n\nThe JSE is Africa\u2019s largest stock exchange, located in Sandton, Johannesburg.\n\n**Functions of the JSE:**\n1. **Raising capital** \u2014 Companies sell shares to raise money for expansion\n2. **Providing a marketplace** \u2014 A regulated platform for buying and selling shares\n3. **Price discovery** \u2014 Share prices are determined by supply and demand\n4. **Investor protection** \u2014 Strict listing requirements and regulations protect investors\n5. **Economic barometer** \u2014 JSE performance indicates the health of the economy\n6. **Liquidity** \u2014 Investors can easily convert shares to cash\n\n**Key JSE indices:**\n- JSE All Share Index (ALSI) \u2014 Overall market performance\n- JSE Top 40 \u2014 The 40 largest companies by market capitalisation'),
  t(2, '### Types of Shares\n\n| Feature | Ordinary Shares | Preference Shares |\n|---------|----------------|-------------------|\n| **Dividends** | Variable \u2014 depends on profits | Fixed dividend rate |\n| **Voting rights** | Yes \u2014 can vote at AGM | Usually no voting rights |\n| **Risk** | Higher risk, higher potential return | Lower risk, lower but guaranteed return |\n| **Dividend priority** | Paid AFTER preference shareholders | Paid FIRST before ordinary shareholders |\n| **Capital growth** | Share price can increase significantly | Limited price growth |\n| **Liquidation** | Paid LAST if company closes | Paid BEFORE ordinary shareholders |\n| **Suitability** | Investors seeking growth and control | Conservative investors seeking steady income |'),
  q(3, 'Which type of share receives dividends FIRST?',
    ['Ordinary shares', 'Preference shares', 'Both at the same time', 'Neither \u2014 dividends are optional'], 1,
    'Preference shareholders receive their fixed dividends before ordinary shareholders receive any dividend payment.'),
  t(4, '### FOUR Forms of Investment\n\n**1. Shares (Equities)**\n- Buying ownership in companies listed on the JSE\n- High risk, high potential return\n- Suitable for long-term investors (5+ years)\n- Example: Buying Naspers shares \u2014 R100 invested in 2004 would be worth over R10 000 today\n\n**2. Unit Trusts (Collective Investment Schemes)**\n- Money from many investors is pooled and managed by a fund manager\n- Diversified \u2014 spread across many shares, bonds, or property\n- Medium risk (depending on the type of fund)\n- Suitable for investors who lack expertise to pick individual shares\n- Example: Allan Gray Balanced Fund, Coronation Top 20\n\n**3. Fixed Deposits**\n- Deposit money with a bank for a fixed period at a guaranteed interest rate\n- Low risk \u2014 capital is guaranteed\n- Returns are lower than shares but predictable\n- Suitable for risk-averse investors and short-term savings\n- Example: FNB 12-month fixed deposit at 8.5% per annum\n\n**4. Retirement Annuities (RAs)**\n- Long-term investment specifically for retirement\n- Contributions are tax-deductible (up to 27.5% of taxable income, max R350 000 per year)\n- Cannot withdraw before age 55 (except in extreme cases)\n- Suitable for self-employed people and as supplementary retirement savings\n- Example: Sanlam, Old Mutual, and Discovery retirement annuity products'),
  fb(5, 'The type of investment where money from many investors is pooled and managed by a professional fund manager is called a ___.',
    ['unit trust'],
    'Unit trusts (collective investment schemes) pool money from many investors and are managed by a professional fund manager.',
    ['This investment type provides diversification without needing to pick individual shares.']),
  t(6, '### Investment Decision Factors\n\nWhen choosing investments, consider:\n\n| Factor | Explanation |\n|--------|-------------|\n| **Risk tolerance** | How much risk can you afford/handle? |\n| **Return expectation** | How much return do you expect? (Higher risk = potentially higher return) |\n| **Time horizon** | How long can you invest? (Longer = more risk acceptable) |\n| **Liquidity needs** | How quickly might you need the money? |\n| **Diversification** | Spread investments to reduce risk |\n| **Tax implications** | Consider tax on interest, dividends, capital gains |\n| **Inflation** | Returns must beat inflation or you lose purchasing power |'),
  t(7, '### Simple and Compound Interest Calculations\n\n**Simple Interest:** A = P(1 + i \u00d7 n)\n**Compound Interest:** A = P(1 + i)^n\n\n**Example 1 (Simple):** R20 000 invested at 9% simple interest for 4 years\nA = 20 000(1 + 0.09 \u00d7 4) = 20 000 \u00d7 1.36 = R27 200\nInterest earned = R27 200 \u2013 R20 000 = R7 200\n\n**Example 2 (Compound):** R20 000 invested at 9% compound interest for 4 years\nA = 20 000(1 + 0.09)^4 = 20 000 \u00d7 1.41158 = R28 231.63\nInterest earned = R28 231.63 \u2013 R20 000 = R8 231.63\n\n**Compound interest earned R1 031.63 MORE** because interest earns interest.'),
  q(8, 'R15 000 is invested at 7.5% compound interest per year for 3 years. What is the final amount?',
    ['R18 375.00', 'R18 627.17', 'R18 150.00', 'R18 503.42'], 1,
    'A = 15 000(1.075)^3 = 15 000 \u00d7 1.242297 = R18 634.45. Closest is R18 627.17.',
    ['Use the formula A = P(1 + i)^n']),
  q(9, 'A 25-year-old starting their career wants a long-term investment with high growth potential. Which investment is most suitable?',
    ['Fixed deposit', 'Ordinary shares or equity unit trust', 'Preference shares', 'Money market account'], 1,
    'A young investor with a long time horizon can tolerate higher risk for higher returns, making ordinary shares or equity unit trusts the most suitable choice.'),
  t(10, '### Recommending Investments Based on Scenarios\n\n| Investor Profile | Recommended Investment | Reason |\n|-----------------|----------------------|--------|\n| Young professional (25), long-term | Shares, equity unit trusts, RA | Long time horizon, can handle risk |\n| Retiree (65), needs income | Preference shares, fixed deposits | Steady income, low risk |\n| Family saving for holiday (1 year) | Fixed deposit, money market | Short term, capital preservation |\n| Self-employed (40), no pension | Retirement annuity | Tax-deductible, enforced retirement savings |\n| Beginner investor, moderate risk | Balanced unit trust | Diversified, professionally managed |'),
];

// =============================================================================
// CHAPTER 9: Insurance (Term 2)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Insurance\n\n### Non-Compulsory Insurance\n\nNon-compulsory insurance is insurance that individuals and businesses choose to take out voluntarily.\n\n**Short-term insurance** (renewed annually):\n\n| Type | What it covers |\n|------|---------------|\n| **Vehicle insurance** | Damage to/theft of vehicles (comprehensive, third-party, third-party fire & theft) |\n| **Household insurance** | Contents of your home (furniture, appliances, electronics) against theft, fire, flood |\n| **Homeowners insurance** | Structure of the building itself |\n| **Business insurance** | Business assets, stock, liability, business interruption |\n\n**Long-term insurance** (over many years):\n\n| Type | What it covers |\n|------|---------------|\n| **Life insurance** | Pays a lump sum to beneficiaries upon death of the insured |\n| **Endowment policy** | Savings + insurance; pays out after a set period or on death (whichever comes first) |\n| **Disability insurance** | Monthly income if you become permanently disabled |\n| **Funeral cover** | Pays out on death to cover funeral expenses |'),
  t(2, '### Compulsory Insurance\n\nCompulsory insurance is required by law.\n\n**1. Unemployment Insurance Fund (UIF)**\n- Employer and employee each contribute 1% of the employee\u2019s salary\n- Provides benefits when employees become unemployed, ill, or take maternity leave\n- Maximum benefit period: 238 days (based on years of contribution)\n\n**2. COIDA (Compensation for Occupational Injuries and Diseases Act)**\n- Employer pays premiums to the Compensation Fund\n- Compensates employees who are injured or contract diseases at work\n- No employee contribution required\n\n**3. Road Accident Fund (RAF)**\n- Funded through a fuel levy (included in the price of petrol/diesel)\n- Compensates victims of road accidents for medical expenses, loss of income, and loss of support\n- Applies regardless of who caused the accident'),
  q(3, 'Which of the following is a compulsory form of insurance in South Africa?',
    ['Vehicle insurance', 'Life insurance', 'Unemployment Insurance Fund (UIF)', 'Household insurance'], 2,
    'UIF is compulsory \u2014 both employer and employee must contribute. Vehicle insurance, life insurance, and household insurance are non-compulsory.'),
  t(4, '### Differences Between Compulsory and Non-Compulsory Insurance\n\n| Aspect | Compulsory | Non-Compulsory |\n|--------|-----------|----------------|\n| **Choice** | Required by law | Voluntary |\n| **Consequences** | Penalties/fines for non-compliance | No legal penalty |\n| **Provider** | Government agencies (UIF, RAF, COIDA) | Private insurers (Sanlam, Discovery, Old Mutual) |\n| **Premiums** | Set by law/regulation | Based on risk assessment |\n| **Purpose** | Social protection for all workers | Individual/business risk management |\n| **Examples** | UIF, COIDA, RAF | Life, vehicle, household, business |'),
  t(5, '### FOUR Insurance Concepts\n\n**1. Insurable Interest**\n- You must have a financial interest in the item or person you insure\n- You must stand to lose financially if the insured event occurs\n- Example: You can insure your own car because you would suffer a financial loss if it is damaged, but you cannot insure a stranger\u2019s car\n\n**2. Utmost Good Faith (Uberrima Fides)**\n- Both parties must be completely honest\n- The insured must disclose all material facts when applying\n- The insurer must clearly explain all terms and conditions\n- Example: When applying for life insurance, you must disclose pre-existing health conditions. If you hide a heart condition, the claim may be rejected\n\n**3. Indemnity**\n- The insurer will compensate you for the actual financial loss, nothing more\n- You cannot profit from an insurance claim\n- You are restored to the financial position you were in before the loss\n- Example: If your R150 000 car is written off, the insurer pays the market value at the time of loss, not the original purchase price\n\n**4. Subrogation**\n- After paying a claim, the insurer takes over your right to claim from the third party who caused the loss\n- Example: If another driver crashes into your car and your insurer pays for repairs, your insurer can then claim the repair costs from the other driver or their insurer'),
  q(6, 'The insurance concept that prevents you from profiting from a claim is called:',
    ['Insurable interest', 'Utmost good faith', 'Indemnity', 'Subrogation'], 2,
    'Indemnity means the insurer will compensate you for the actual loss only \u2014 you cannot receive more than the loss suffered.'),
  fb(7, 'The insurance concept where the insurer takes over your right to claim from a third party is called ___. The concept requiring both parties to be completely honest is called ___.',
    ['subrogation', 'utmost good faith'],
    'Subrogation allows the insurer to claim from the responsible third party. Utmost good faith requires complete honesty from both parties.',
    ['Think about what happens AFTER a claim is paid, and what is required BEFORE a policy is issued.']),
  t(8, '### Insurance Calculations\n\n**Calculating premiums:**\nPremiums are based on risk factors such as age, location, driving record, and the value of the insured item.\n\n**Example: Vehicle insurance**\nInsured value of car: R250 000\nAnnual premium rate: 3.2%\nAnnual premium = R250 000 \u00d7 0.032 = R8 000\nMonthly premium = R8 000 \u00f7 12 = R666.67\n\n**Over-insurance vs Under-insurance:**\n- **Over-insurance:** Insured for more than the value \u2014 you still only receive the actual value (indemnity)\n- **Under-insurance:** Insured for less than the value \u2014 the average clause applies:\n\nPayout = (Sum insured / Actual value) \u00d7 Loss\n\n**Example:** Contents worth R500 000 insured for R300 000. Fire causes R100 000 damage.\nPayout = (R300 000 / R500 000) \u00d7 R100 000 = R60 000 (not the full R100 000!)'),
  q(9, 'Business contents worth R800 000 are insured for R500 000. A theft causes R200 000 in losses. What is the payout under the average clause?',
    ['R200 000', 'R125 000', 'R160 000', 'R100 000'], 1,
    'Payout = (R500 000 / R800 000) \u00d7 R200 000 = 0.625 \u00d7 R200 000 = R125 000. Under-insurance means the full loss is not covered.'),
  t(10, '### Advantages of Insurance for Businesses\n\n- **Financial protection** against unexpected losses (fire, theft, natural disasters)\n- **Business continuity** \u2014 business interruption insurance covers lost income during recovery\n- **Employee welfare** \u2014 group life and disability insurance attracts and retains talent\n- **Legal compliance** \u2014 some insurance is legally required (COIDA, UIF)\n- **Peace of mind** \u2014 management can focus on business operations, not worry about potential losses\n- **Credit access** \u2014 banks may require insurance as a condition for loans'),
];

// =============================================================================
// CHAPTER 10: Team Performance and Conflict Management (Term 2)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Team Performance\n\n### Four Criteria for Successful Teams\n\n1. **Clear goals** \u2014 Every team member understands the objectives and their role\n2. **Effective communication** \u2014 Open, honest, and respectful two-way communication\n3. **Mutual trust and respect** \u2014 Members trust each other\u2019s abilities and intentions\n4. **Complementary skills** \u2014 Team members bring different strengths that complement each other\n\n### Characteristics of Successful Teams\n\n- Shared vision and common purpose\n- Accountability \u2014 each member takes responsibility\n- Constructive conflict resolution\n- Celebration of successes\n- Continuous learning and improvement\n- Strong but flexible leadership'),
  t(2, '### Tuckman\u2019s Five Stages of Team Development\n\n| Stage | Description | Leader\u2019s Role |\n|-------|-------------|---------------|\n| **1. Forming** | Team members meet; polite, cautious, uncertain about roles | Provide direction, set clear goals |\n| **2. Storming** | Conflict emerges; power struggles, disagreements about approach | Mediate conflicts, encourage open dialogue |\n| **3. Norming** | Team establishes rules, roles are accepted, cooperation develops | Step back, facilitate team processes |\n| **4. Performing** | Team works effectively; high productivity, trust, and collaboration | Delegate, focus on strategic issues |\n| **5. Adjourning** | Task is complete; team disbands; members may feel loss | Celebrate achievements, ensure knowledge transfer |\n\n**Example:** A project team at Standard Bank is formed to develop a new mobile banking feature:\n- **Forming:** Team meets, introductions, unclear about expectations\n- **Storming:** Developers disagree with designers about user interface\n- **Norming:** Team agrees on design principles and workflow\n- **Performing:** Feature is developed efficiently with great collaboration\n- **Adjourning:** Feature launches, team members return to their departments'),
  q(3, 'During which stage of Tuckman\u2019s model does conflict typically emerge?',
    ['Forming', 'Storming', 'Norming', 'Performing'], 1,
    'Storming is the stage where conflicts and disagreements emerge as team members assert themselves and push boundaries.'),
  fb(4, 'Tuckman\u2019s five stages in order are: Forming, ___, Norming, Performing, and ___.',
    ['Storming', 'Adjourning'],
    'The five stages are: Forming, Storming, Norming, Performing, and Adjourning.',
    ['Remember the rhyming pattern of the stage names.']),
  t(5, '### Team Dynamics: Belbin\u2019s Team Roles\n\nMeredith Belbin identified nine roles that contribute to effective team performance:\n\n| Category | Role | Contribution |\n|----------|------|--------------|\n| **Action-oriented** | Shaper | Drives the team, challenges complacency |\n| | Implementer | Turns ideas into practical actions |\n| | Completer-Finisher | Ensures thoroughness and accuracy |\n| **People-oriented** | Coordinator | Clarifies goals, delegates effectively |\n| | Teamworker | Builds cooperation, resolves friction |\n| | Resource Investigator | Explores opportunities, builds external contacts |\n| **Thinking-oriented** | Plant | Creative, generates original ideas |\n| | Monitor-Evaluator | Analyses options, makes sound judgements |\n| | Specialist | Provides expert knowledge in a specific area |\n\nA balanced team has a mix of these roles. Too many of one type creates problems (e.g., all Plants and no Implementers means lots of ideas but no action).'),
  t(6, '### Conflict Resolution\n\n**Common Causes of Conflict in the Workplace:**\n- Unclear roles and responsibilities\n- Scarce resources (budget, equipment)\n- Personality clashes\n- Poor communication\n- Differences in values or priorities\n- Unfair treatment or favouritism\n- Resistance to change\n\n**Conflict Resolution Techniques:**\n\n1. **Negotiation** \u2014 Parties discuss and find a mutually acceptable solution\n2. **Mediation** \u2014 A neutral third party helps parties reach an agreement (not binding)\n3. **Arbitration** \u2014 A neutral third party makes a binding decision\n4. **Conciliation** \u2014 A third party helps restore the relationship and find compromise\n5. **Problem-solving approach** \u2014 Focus on the issue, not the person; find win-win solutions'),
  q(7, 'In which conflict resolution method does a neutral third party make a BINDING decision?',
    ['Negotiation', 'Mediation', 'Arbitration', 'Conciliation'], 2,
    'Arbitration involves a neutral third party (arbitrator) who listens to both sides and makes a binding decision that both parties must accept.'),
  t(8, '### Dealing with Grievances\n\n**A grievance** is a formal complaint by an employee about a workplace issue.\n\n**Grievance procedure steps:**\n1. Employee raises the issue with their immediate supervisor (verbally)\n2. If unresolved, employee submits a written grievance\n3. Meeting with HR and management to discuss the grievance\n4. Investigation into the facts\n5. Decision communicated in writing within a reasonable timeframe\n6. If unhappy, employee can appeal to a higher level\n7. If still unresolved, refer to the CCMA\n\n**Important:** Employers must have a grievance policy in place and follow it consistently to avoid unfair labour practice disputes.'),
  t(9, '### Dealing with SIX Types of Difficult Personalities\n\n| Personality Type | Behaviour | Strategy |\n|-----------------|-----------|----------|\n| **The Bully** | Intimidates, shouts, threatens | Stand firm, document incidents, involve HR |\n| **The Complainer** | Constantly negative, nothing is ever right | Acknowledge concerns, redirect to solutions |\n| **The Gossip** | Spreads rumours, creates division | Don\u2019t engage, confront privately, set boundaries |\n| **The Know-it-all** | Dominates discussions, dismisses others\u2019 ideas | Acknowledge expertise, ask for evidence, involve others |\n| **The Slacker** | Does minimum work, avoids responsibility | Set clear expectations, document performance, use progressive discipline |\n| **The Passive-Aggressive** | Appears agreeable but undermines work indirectly | Address behaviour directly, be specific, document examples |'),
  q(10, 'An employee who appears agreeable in meetings but deliberately misses deadlines and undermines colleagues is exhibiting which personality type?',
    ['The Bully', 'The Gossip', 'The Passive-Aggressive', 'The Complainer'], 2,
    'Passive-aggressive individuals appear cooperative on the surface but express resistance indirectly through missed deadlines, subtle sabotage, and undermining.'),
];

// =============================================================================
// CHAPTER 11: Human Rights, Inclusivity and Environmental Issues (Term 3)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Human Rights in the Workplace\n\nThe South African Constitution (Bill of Rights) protects fundamental human rights. These apply in the workplace.\n\n### SIX Human Rights Relevant to the Workplace\n\n**1. Right to equality (Section 9)**\n- No unfair discrimination based on race, gender, religion, disability, etc.\n- Equal pay for equal work\n- EEA enforces this right\n\n**2. Right to human dignity (Section 10)**\n- Employees must be treated with respect\n- No verbal abuse, humiliation, or degrading treatment\n- Applies to disciplinary processes too\n\n**3. Right to fair labour practices (Section 23)**\n- Right to join a trade union\n- Right to collective bargaining\n- Right to strike (within legal framework)\n- Right to not be unfairly dismissed'),
  t(2, '**4. Right to a safe working environment (Section 24)**\n- Occupational Health and Safety (OHS) Act requires employers to maintain safe workplaces\n- Employees have the right to refuse dangerous work\n- Employers must provide protective equipment (PPE)\n\n**5. Right to privacy (Section 14)**\n- Employees have a reasonable expectation of privacy\n- POPIA (Protection of Personal Information Act) protects personal data\n- Employer monitoring (email, CCTV) must be reasonable and disclosed\n\n**6. Right to freedom of association (Section 18)**\n- Employees can join trade unions without victimisation\n- Employers can join employer organisations\n- Collective bargaining is protected'),
  t(3, '### Roles of Health and Safety Representatives\n\n- Identify potential hazards in the workplace\n- Report unsafe conditions to management\n- Investigate incidents and accidents\n- Conduct regular workplace inspections\n- Attend health and safety committee meetings\n- Make recommendations for improving safety\n- Ensure compliance with OHS Act\n- Assist in educating employees about safety procedures\n\n**Note:** Employers with 20+ employees must have health and safety representatives. Employers with 100+ employees must have a health and safety committee.'),
  q(4, 'According to the OHS Act, how many employees must a business have before it is required to appoint health and safety representatives?',
    ['10', '20', '50', '100'], 1,
    'The OHS Act requires businesses with 20 or more employees to designate health and safety representatives.'),
  t(5, '### Diversity in the Workplace\n\n**Meaning:** Diversity refers to the variety of differences among people in an organisation, including race, gender, age, disability, culture, religion, language, and sexual orientation.\n\n**SEVEN Diversity Issues:**\n1. **Race** \u2014 Ensuring racial representation at all levels\n2. **Gender** \u2014 Equal opportunities for men and women; addressing the gender pay gap\n3. **Age** \u2014 Respecting and valuing employees of all ages; no age discrimination\n4. **Disability** \u2014 Reasonable accommodation for people with disabilities\n5. **Culture and religion** \u2014 Respecting cultural practices and religious observances\n6. **Language** \u2014 South Africa has 12 official languages; ensure inclusive communication\n7. **Sexual orientation** \u2014 SA\u2019s Constitution protects against discrimination based on sexual orientation\n\n**Benefits of Diversity:**\n- Broader range of perspectives and ideas\n- Better understanding of diverse customer base\n- Increased creativity and innovation\n- Improved employee morale and retention\n- Enhanced company reputation\n- Legal compliance with EEA'),
  fb(6, 'South Africa has ___ official languages. The Act that protects personal information in the workplace is called ___.',
    ['12', 'POPIA'],
    'South Africa has 12 official languages. POPIA (Protection of Personal Information Act) protects personal data.',
    ['Previously there were 11, but South African Sign Language was added as the 12th.']),
  t(7, '### Environmental Factors and Responsibilities\n\n**Responsibilities of Employers:**\n- Comply with environmental legislation (NEMA \u2014 National Environmental Management Act)\n- Minimise pollution and waste\n- Use resources efficiently (water, energy)\n- Conduct environmental impact assessments for new projects\n- Implement recycling programmes\n- Report environmental incidents\n- Invest in cleaner production technologies\n\n**Responsibilities of Employees:**\n- Follow company environmental policies\n- Report environmental hazards or spills\n- Minimise personal waste\n- Participate in recycling programmes\n- Suggest environmental improvements\n- Use resources responsibly'),
  t(8, '### Strategies to Protect the Environment\n\n1. **Reduce, Reuse, Recycle** \u2014 Minimise waste at source\n2. **Energy efficiency** \u2014 Use LED lighting, solar panels, energy-efficient equipment\n3. **Water conservation** \u2014 Install water-saving devices, harvest rainwater\n4. **Sustainable sourcing** \u2014 Use responsibly sourced materials\n5. **Carbon footprint reduction** \u2014 Use renewable energy, reduce travel\n6. **Environmental audits** \u2014 Regular assessments of environmental impact\n7. **Green procurement** \u2014 Buy from environmentally responsible suppliers\n8. **Paperless operations** \u2014 Digitise documents and processes\n\n**SA Example:** Woolworths\u2019 "Good Business Journey" includes targets for zero packaging waste to landfill, water stewardship, energy reduction, and sustainable farming practices.'),
  q(9, 'Which South African law is the primary legislation governing environmental management?',
    ['Consumer Protection Act', 'NEMA (National Environmental Management Act)', 'POPIA', 'Labour Relations Act'], 1,
    'NEMA (National Environmental Management Act) is the framework legislation for environmental management in South Africa.'),
  q(10, 'Which of the following is a benefit of workplace diversity?',
    ['Reduced costs', 'Broader range of perspectives and ideas', 'Simpler communication', 'Fewer policies needed'], 1,
    'A diverse workforce brings a broader range of perspectives, experiences, and ideas, which enhances creativity and innovation.'),
];

// =============================================================================
// CHAPTER 12: Social Responsibility and CSR (Term 3)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Social Responsibility\n\n### Meaning of Social Responsibility\n\nSocial responsibility is the obligation of a business to act in ways that benefit society, not just shareholders. It goes beyond legal compliance to include ethical, social, and environmental considerations.\n\n### The Triple Bottom Line (TBL)\n\nSocial responsibility is directly linked to the triple bottom line:\n\n| Pillar | Focus | Example |\n|--------|-------|--------|\n| **People** | Social well-being of employees, communities | Fair wages, safe working conditions, community development |\n| **Planet** | Environmental sustainability | Reducing emissions, recycling, water conservation |\n| **Profit** | Financial performance | Generating revenue while being socially and environmentally responsible |\n\n**Key insight:** Businesses that only focus on profit at the expense of people and planet are not sustainable in the long term. The triple bottom line approach ensures balanced development.'),
  t(2, '### THREE Socio-Economic Issues Businesses Deal With\n\n**1. HIV/AIDS**\n- South Africa has one of the highest HIV prevalence rates globally\n- Impact on business: absenteeism, loss of skilled workers, increased healthcare costs\n- Business response: workplace wellness programmes, free testing and counselling, anti-retroviral (ARV) support, education campaigns\n- Example: Anglo American provides free ARV treatment to all employees and their families\n\n**2. Unemployment**\n- SA\u2019s unemployment rate is approximately 33% (expanded definition: ~42%)\n- Impact: reduced consumer spending, increased crime, social instability\n- Business response: create jobs, support SME development, invest in training and skills development, learnerships\n\n**3. Poverty and Inequality**\n- SA has one of the highest Gini coefficients (measure of inequality) in the world\n- Impact: limited market, social unrest, crime\n- Business response: BBBEE compliance, community development, enterprise development, bursaries'),
  q(3, 'Which measure indicates the level of inequality in a country?',
    ['GDP', 'Inflation rate', 'Gini coefficient', 'Consumer Price Index'], 2,
    'The Gini coefficient measures inequality. A Gini coefficient of 0 means perfect equality; 1 means perfect inequality. South Africa\u2019s is among the highest in the world.'),
  t(4, '### Ways Businesses Contribute to Community and Employee Well-being\n\n**For communities:**\n- Building schools, clinics, and community centres\n- Sponsoring education (bursaries and scholarships)\n- Supporting local sports teams and cultural events\n- Food gardens and feeding schemes\n- Small business development and mentorship\n- Infrastructure development (roads, water, electricity)\n\n**For employees:**\n- Employee wellness programmes (physical and mental health)\n- Skills development and career advancement opportunities\n- Work-life balance policies (flexible hours, remote work)\n- Employee assistance programmes (EAPs) for personal challenges\n- Retirement and savings support\n- Education subsidies for employees and their children'),
  t(5, '### Corporate Social Investment (CSI)\n\n**Meaning:** CSI is the voluntary contribution of resources (money, time, expertise) by a business to community development projects.\n\n**Purpose of CSI:**\n- Address socio-economic challenges in communities\n- Build goodwill and positive brand image\n- Fulfil ethical and moral obligations\n- Contribute to sustainable development\n\n**Focus areas of CSI:**\n- Education and skills development\n- Health and HIV/AIDS\n- Environmental conservation\n- Social and community development\n- Arts, culture, and sport\n- Food security'),
  t(6, '### CSR vs CSI \u2014 Differences\n\n| Aspect | CSR (Corporate Social Responsibility) | CSI (Corporate Social Investment) |\n|--------|---------------------------------------|-----------------------------------|\n| **Scope** | Broad \u2014 covers ALL business operations | Narrow \u2014 specific projects and initiatives |\n| **Integration** | Embedded in business strategy | Separate budget/department |\n| **Focus** | How the business operates responsibly | What the business gives back to the community |\n| **Duration** | Ongoing, continuous | Project-based, may be time-limited |\n| **Measurement** | Triple bottom line, sustainability reporting | Project outcomes, impact assessment |\n| **Examples** | Ethical supply chain, fair wages, environmental policy | Bursary programmes, building schools, sponsoring events |\n\n**Example:**\n- **Shoprite\u2019s CSR:** Fair wages, ethical sourcing, energy efficiency in stores\n- **Shoprite\u2019s CSI:** Mobile soup kitchens feeding vulnerable communities, bursaries for students'),
  fb(7, 'CSR stands for Corporate Social ___. CSI stands for Corporate Social ___.',
    ['Responsibility', 'Investment'],
    'CSR = Corporate Social Responsibility (how the business operates). CSI = Corporate Social Investment (what the business gives to the community).',
    ['One is about how you run your business; the other is about specific giving projects.']),
  q(8, 'Which of the following is an example of CSI rather than CSR?',
    ['Paying employees fair wages', 'Reducing carbon emissions in factories', 'Building a school in a rural community', 'Using ethically sourced materials'], 2,
    'Building a school is a specific community investment project (CSI). The other options are about responsible business operations (CSR).'),
  t(9, '### Impact of Social Responsibility on Businesses\n\n**Positive impacts:**\n- Enhanced brand image and reputation\n- Increased customer loyalty\n- Attracts and retains talented employees\n- Improved community relations\n- Tax benefits (Section 18A donations are tax-deductible)\n- Long-term sustainability\n- BBBEE scorecard improvement\n\n**Negative considerations:**\n- Costs money that could be used for business growth\n- May reduce short-term profits\n- Risk of "greenwashing" (appearing responsible without genuine commitment)\n- Difficult to measure direct ROI'),
  q(10, 'A business that appears environmentally responsible in marketing but does not actually implement green practices is guilty of:',
    ['CSR', 'Greenwashing', 'Corporate citizenship', 'Sustainable development'], 1,
    'Greenwashing is when a company makes misleading claims about its environmental practices to appear more socially responsible than it actually is.'),
];

// =============================================================================
// CHAPTER 13: Presentation and Data Response (Term 3)
// =============================================================================
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Presentation Skills\n\n### Factors for Effective Presentations\n\n**BEFORE the Presentation:**\n- Research the topic thoroughly\n- Know your audience (age, knowledge level, expectations)\n- Plan the structure: introduction, body, conclusion\n- Prepare visual aids (slides, charts, handouts)\n- Practise delivery and timing\n- Check equipment (projector, laptop, microphone)\n- Prepare for possible questions\n- Arrive early to set up\n\n**DURING the Presentation:**\n- Make eye contact with the audience\n- Speak clearly and at an appropriate pace\n- Use confident body language (stand straight, use hand gestures purposefully)\n- Engage the audience (ask questions, use examples)\n- Refer to visual aids without reading directly from slides\n- Manage time effectively\n- Show enthusiasm for the topic'),
  t(2, '**AFTER the Presentation:**\n- Allow time for questions\n- Answer questions honestly and professionally\n- If you don\u2019t know an answer, say so and offer to follow up\n- Thank the audience for their time\n- Reflect on what went well and areas for improvement\n- Follow up with materials or answers promised\n\n### Responding to Questions Professionally\n\n**Tips:**\n- Listen carefully to the entire question before answering\n- Repeat or paraphrase the question so everyone hears it\n- Stay calm and composed, even if the question is challenging\n- Answer concisely and stay on topic\n- If the question is off-topic, acknowledge it and offer to discuss afterwards\n- Never belittle or dismiss a question\n- Use phrases like: "That\u2019s an excellent question\u2026", "Let me clarify that point\u2026"'),
  t(3, '### Non-Verbal Communication\n\nNon-verbal communication includes all messages sent without words:\n\n| Type | Positive Signal | Negative Signal |\n|------|----------------|----------------|\n| **Eye contact** | Confidence, engagement | Avoiding eye contact = nervousness, dishonesty |\n| **Facial expressions** | Smile = friendliness, openness | Frowning = disapproval, confusion |\n| **Posture** | Standing tall = confidence | Slouching = disinterest, low energy |\n| **Hand gestures** | Open palms = honesty, inclusion | Pointing = aggression; crossed arms = defensiveness |\n| **Personal space** | Appropriate distance = respect | Too close = invasion; too far = detachment |\n| **Tone of voice** | Varied pitch = interesting | Monotone = boring; too loud = aggressive |\n\n**Key insight:** Research suggests 55% of communication is body language, 38% is tone of voice, and only 7% is the actual words (Albert Mehrabian\u2019s 7-38-55 rule).'),
  q(4, 'According to Mehrabian\u2019s communication model, what percentage of communication is attributed to body language?',
    ['7%', '38%', '55%', '93%'], 2,
    'Mehrabian\u2019s model suggests 55% body language, 38% tone of voice, and 7% actual words.'),
  t(5, '### Designing Effective Multimedia Presentations\n\n**Slide Design Principles:**\n- **6 \u00d7 6 Rule:** Maximum 6 bullet points per slide, maximum 6 words per bullet\n- Use a consistent colour scheme and font throughout\n- Font size: minimum 24pt for body text, 36pt for headings\n- Use high-quality images and graphics\n- Avoid cluttered slides \u2014 white space is your friend\n- One key message per slide\n\n**Common Mistakes to Avoid:**\n- Reading every word from the slides\n- Too much text on one slide\n- Distracting animations and transitions\n- Inconsistent formatting\n- Using Comic Sans or other unprofessional fonts\n- Poor colour contrast (light text on light background)'),
  t(6, '### Visual Aids and Their Effectiveness\n\n| Visual Aid | When to Use | Advantages |\n|-----------|-------------|------------|\n| **PowerPoint slides** | Formal presentations | Professional, multimedia capabilities |\n| **Bar/column charts** | Comparing quantities | Easy to compare categories |\n| **Pie charts** | Showing proportions | Clearly shows parts of a whole |\n| **Line graphs** | Showing trends over time | Clearly shows patterns and changes |\n| **Tables** | Presenting detailed data | Organises large amounts of information |\n| **Infographics** | Summarising complex information | Visual, engaging, easy to understand |\n| **Videos** | Demonstrations, case studies | Engaging, shows real-world examples |\n| **Handouts** | Reference material | Audience can review later |'),
  q(7, 'Which type of visual aid is BEST for showing how a company\u2019s revenue has changed over the past 5 years?',
    ['Pie chart', 'Bar chart', 'Line graph', 'Table'], 2,
    'A line graph is best for showing trends over time, making it ideal for displaying revenue changes over a 5-year period.'),
  fb(8, 'The 6 \u00d7 6 rule states that slides should have a maximum of ___ bullet points per slide and a maximum of ___ words per bullet.',
    ['6', '6'],
    'The 6 \u00d7 6 rule is a guideline for keeping presentations clean and readable.',
    ['The name of the rule gives away the answer!']),
  q(9, 'Which of the following is NOT good practice during a presentation?',
    ['Making eye contact with the audience', 'Speaking at an appropriate pace', 'Reading every word from the slides', 'Using hand gestures purposefully'], 2,
    'Reading every word from slides is a common mistake. Presenters should use slides as visual aids and speak naturally about the content.'),
  t(10, '### Data Response Skills\n\nIn exams, you may be given data (graphs, tables, case studies) and asked to respond.\n\n**Tips for data response questions:**\n1. Read the data carefully before answering\n2. Identify trends, patterns, and anomalies\n3. Use specific figures from the data to support your answers\n4. Show calculations where required\n5. Relate your answer to the business context\n6. Use correct business terminology\n7. Answer in the format required (discuss, explain, evaluate, recommend)'),
];

// =============================================================================
// CHAPTER 14: Forms of Ownership (Term 3)
// =============================================================================
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Forms of Ownership\n\n### Overview of Business Forms\n\n| Form | Key Feature | Liability |\n|------|------------|----------|\n| **Sole Trader** | One owner, simplest form | Unlimited |\n| **Partnership** | 2\u201320 partners | Unlimited (general partners) |\n| **Close Corporation** | 1\u201310 members (no longer registrable, but existing ones continue) | Limited |\n| **Private Company (Pty Ltd)** | 1+ shareholders, most popular for SMEs | Limited |\n| **Public Company (Ltd)** | Shares traded on the JSE | Limited |\n| **Franchise** | Licence to use a brand | Depends on structure |\n| **NPO (Non-Profit Organisation)** | Serves social purpose, not profit | Limited |'),
  t(2, '### Sole Trader (Sole Proprietorship)\n\n**Characteristics:**\n- Owned and managed by one person\n- No separate legal entity (owner IS the business)\n- Unlimited liability \u2014 personal assets are at risk\n- All profits belong to the owner\n- No legal formalities to start (only business registration)\n- Owner makes all decisions\n\n**Advantages:** Easy to start, full control, all profits to owner, minimal regulations\n**Disadvantages:** Unlimited liability, limited capital, limited skills, no continuity if owner dies\n\n**Example:** A plumber operating as "John\u2019s Plumbing Services"\n\n### Partnership\n\n**Characteristics:**\n- 2 to 20 partners\n- Governed by a Partnership Agreement (should be in writing)\n- Unlimited liability for general partners\n- Partners share profits, losses, and management\n- No separate legal entity\n\n**Advantages:** More capital, shared skills and workload, easy to form\n**Disadvantages:** Unlimited liability, disagreements, one partner\u2019s actions bind all others'),
  t(3, '### Private Company (Pty Ltd)\n\n**Characteristics:**\n- Separate legal entity (can own property, sue, be sued)\n- Limited liability \u2014 shareholders risk only their investment\n- Minimum 1 director, 1 shareholder\n- Cannot sell shares to the public\n- Must comply with the Companies Act (2008)\n- Name ends in "(Pty) Ltd"\n\n**Advantages:** Limited liability, separate legal entity, easier to raise capital, continuity\n**Disadvantages:** More regulations, audit requirements, more expensive to set up\n\n### Public Company (Ltd)\n\n**Characteristics:**\n- Shares traded publicly on the JSE\n- Limited liability for shareholders\n- Minimum 3 directors\n- Must publish annual financial statements\n- Subject to strict governance (King IV, JSE rules)\n- Name ends in "Ltd"\n\n**Advantages:** Can raise large amounts of capital, transferable shares, prestige\n**Disadvantages:** Expensive to set up, strict regulations, risk of hostile takeover, complex reporting'),
  q(4, 'Which form of business ownership has the simplest structure and no separate legal entity?',
    ['Private company', 'Sole trader', 'Public company', 'Close corporation'], 1,
    'A sole trader is the simplest form of ownership with no separate legal entity \u2014 the owner and the business are one and the same.'),
  t(5, '### Franchise\n\n**Characteristics:**\n- A franchisor grants a franchisee the right to use their brand, systems, and support\n- Franchisee pays a franchise fee and ongoing royalties\n- Must follow the franchisor\u2019s operational standards\n- Governed by a franchise agreement\n\n**SA Examples:** McDonald\u2019s, Spur, Debonairs Pizza, Wimpy, Pick n Pay Express\n\n**Advantages:** Proven business model, brand recognition, training and support, group buying power\n**Disadvantages:** Franchise fees reduce profits, limited autonomy, bound by franchisor\u2019s rules\n\n### Non-Profit Organisation (NPO)\n\n**Characteristics:**\n- Exists to serve a social, community, or charitable purpose\n- Does not distribute profits to members\n- Registered under the NPO Act (No. 71 of 1997)\n- Can still generate revenue (but surpluses are reinvested)\n\n**SA Examples:** Gift of the Givers, Habitat for Humanity SA, SPCA\n\n**Advantages:** Tax benefits, access to donations and grants, serves the community\n**Disadvantages:** Limited funding, depends on donors, difficult to attract skilled staff'),
  fb(6, 'Limited liability means shareholders can only lose ___. Unlimited liability means the owner\u2019s ___ assets are at risk.',
    ['their investment', 'personal'],
    'Limited liability protects personal assets. Unlimited liability means personal assets can be seized to pay business debts.'),
  t(7, '### Six Criteria That Contribute to Success or Failure\n\n| Criterion | Success Factor | Failure Factor |\n|-----------|---------------|----------------|\n| **Capital** | Adequate funding and reserves | Undercapitalisation, poor cash flow |\n| **Management** | Skilled, experienced management | Poor decision-making, lack of skills |\n| **Planning** | Strategic planning, budgets, forecasts | No planning, reactive management |\n| **Marketing** | Understanding the market, strong brand | Ignoring customer needs, poor marketing |\n| **Location** | Accessible, visible, appropriate location | Poor location with low foot traffic |\n| **Human resources** | Skilled, motivated employees | High turnover, poor training |'),
  q(8, 'A business where shares are traded publicly on the JSE is called a:',
    ['Close Corporation', 'Private Company (Pty Ltd)', 'Public Company (Ltd)', 'Partnership'], 2,
    'A public company (Ltd) has its shares listed and traded on the JSE, allowing the public to buy and sell them.'),
  q(9, 'Which of the following is a disadvantage of a franchise?',
    ['No brand recognition', 'No training provided', 'Limited autonomy due to franchisor\u2019s rules', 'No proven business model'], 2,
    'A key disadvantage of franchising is that the franchisee must follow the franchisor\u2019s strict operational guidelines, limiting their independence.'),
  t(10, '### Impact of Forms of Ownership on Business\n\n| Form | Tax Treatment | Continuity | Capital Raising |\n|------|--------------|------------|----------------|\n| Sole trader | Personal income tax | Ends with owner | Limited to personal savings |\n| Partnership | Partners pay income tax | Ends if a partner leaves/dies (unless agreed otherwise) | Partners\u2019 combined resources |\n| Private company | Company tax (27%) + dividend tax (20%) | Perpetual succession | Share sales, loans, retained earnings |\n| Public company | Company tax + dividend tax | Perpetual succession | Share issues on JSE, bonds, loans |\n| NPO | Tax exempt (if registered) | Continues beyond founders | Donations, grants, fundraising |'),
];

// =============================================================================
// CHAPTER 15: Revision and Exam Preparation (Term 4)
// =============================================================================
blockNum = 0;
const ch15_lesson1 = [
  t(1, '## NSC Business Studies Exam Structure\n\n### Paper 1: Business Environments and Business Operations (150 marks, 2 hours)\n\n| Section | Content | Marks | Question Type |\n|---------|---------|-------|---------------|\n| **A** | Compulsory short questions | 30 | MCQ, matching, fill-in |\n| **B** | THREE questions (answer TWO) | 80 (40 each) | Direct/indirect |\n| **C** | ONE essay question (choose 1 of 2) | 40 | Extended writing |\n\n**Paper 1 Topics:**\n- Business environments (micro, market, macro)\n- Business operations (HR, production, finance, marketing, general management, purchasing)\n- Legislation (LRA, BCEA, EEA, SDA, BBBEE, NCA, CPA)\n- Ethics and professionalism\n- Creative thinking and problem solving'),
  t(2, '### Paper 2: Business Ventures and Business Roles (150 marks, 2 hours)\n\n| Section | Content | Marks | Question Type |\n|---------|---------|-------|---------------|\n| **A** | Compulsory short questions | 30 | MCQ, matching, fill-in |\n| **B** | THREE questions (answer TWO) | 80 (40 each) | Direct/indirect |\n| **C** | ONE essay question (choose 1 of 2) | 40 | Extended writing |\n\n**Paper 2 Topics:**\n- Business ventures (forms of ownership, sectors, location)\n- Business roles (professionalism, ethics, social responsibility, CSI)\n- Investment and insurance\n- Management and leadership\n- Team performance and conflict management\n- Human rights, inclusivity, environmental issues\n- Presentations and data response'),
  t(3, '### Key Action Verbs \u2014 What the Examiner Expects\n\n| Action Verb | What to Do | Marks Implication |\n|------------|-----------|-------------------|\n| **Name/List/State** | Give the term or fact only | 1 mark per point |\n| **Describe** | Give characteristics or features | 2 marks per point (fact + detail) |\n| **Explain** | Show HOW or WHY something works | 2 marks per point (fact + elaboration) |\n| **Discuss** | Present arguments for and against, or multiple perspectives | 2 marks per point |\n| **Differentiate/Distinguish** | Show differences between two concepts | 2 marks per comparison |\n| **Evaluate** | Make a judgement about value or effectiveness | 2 marks (fact + judgement) |\n| **Recommend** | Suggest a solution with reasons | 2 marks (suggestion + justification) |\n| **Analyse** | Break down into parts and examine relationships | 2 marks per point |\n| **Motivate** | Give reasons to support a viewpoint | 2 marks (viewpoint + reason) |'),
  q(4, 'If a question asks you to "evaluate" a business strategy, what should you do?',
    ['Simply name the strategy', 'Describe the strategy in detail', 'Make a judgement about the strategy\u2019s effectiveness', 'List the steps of the strategy'], 2,
    '"Evaluate" requires you to make a judgement about the value, effectiveness, or suitability of something, supported by evidence and reasoning.'),
  t(5, '### Essay Writing Tips (Section C \u2014 40 marks)\n\n**Structure of a Business Studies essay:**\n\n**Introduction (max 2 marks):**\n- Define the main concept\n- Briefly state what you will discuss\n\n**Body (max 32 marks):**\n- Use headings and subheadings\n- Write in full sentences (not just bullet points)\n- Each point = fact + explanation/example\n- Use business terminology\n- Use South African examples where possible\n- Each well-developed point scores 2 marks\n- Aim for 16 well-developed points\n\n**Conclusion (max 2 marks):**\n- Summarise the key argument\n- Give a recommendation or personal opinion with a reason\n\n**Layout (4 marks):**\n- Logical structure with headings\n- Neat, legible handwriting\n- Good use of business terminology\n- Coherent argument from start to finish'),
  t(6, '### Section A Tips (Compulsory \u2014 30 marks)\n\n**Multiple choice (MCQ):**\n- Read ALL options before choosing\n- Eliminate obviously wrong answers first\n- If unsure, go with your first instinct\n- Never leave a question blank\n\n**Matching columns:**\n- Match the easiest ones first\n- Cross out used answers to avoid duplication\n\n**Fill-in / Choose the correct word:**\n- Look for context clues in the sentence\n- Check that your answer makes grammatical sense\n\n**True/False:**\n- Look for absolute words like "always", "never", "all" \u2014 these are often FALSE\n- If any part of the statement is false, the entire statement is FALSE'),
  q(7, 'In a Section B question worth 40 marks, how many well-developed points should you aim for?',
    ['10 points', '20 points', '15\u201316 points', '40 points'], 2,
    'Section B questions are worth 40 marks with each well-developed point scoring 2 marks. Aim for 15\u201316 well-developed points to maximise marks.'),
  fb(8, 'Paper 1 covers Business Environments and Business ___. Paper 2 covers Business Ventures and Business ___.',
    ['Operations', 'Roles'],
    'Paper 1 = Business Environments & Business Operations. Paper 2 = Business Ventures & Business Roles.'),
  t(9, '### Common Exam Mistakes to Avoid\n\n1. **Not reading the question carefully** \u2014 Underline the action verb and topic\n2. **Writing lists instead of discussions** \u2014 Always elaborate on points\n3. **Repeating the same point in different words** \u2014 The examiner will not credit this\n4. **Not using examples** \u2014 SA business examples earn extra marks\n5. **Poor time management** \u2014 Allocate time per section: Section A (20 min), Section B (60 min), Section C (40 min)\n6. **Not attempting all sections** \u2014 It is easier to get the first 20% of marks for a question than the last 20%\n7. **Mixing up similar concepts** \u2014 e.g., CSR vs CSI, management vs leadership, BEE vs BBBEE\n8. **Ignoring the case study** \u2014 If a scenario is given, your answer MUST refer to it'),
  t(10, '### Key Topics to Prioritise for Revision\n\n**High-frequency exam topics:**\n- Legislation (almost always appears in Paper 1)\n- Ethics and professionalism (popular Section C essay topic)\n- Management and leadership styles\n- BBBEE pillars and application\n- Human rights in the workplace\n- Creative thinking techniques\n- Investment and insurance concepts\n- TQM elements and PDCA cycle\n- Team development stages (Tuckman)\n- Social responsibility and triple bottom line\n\n**Study strategy:**\n1. Make summary notes for each chapter\n2. Practise past papers (at least 3 years)\n3. Time yourself strictly\n4. Review the marking guidelines to understand how marks are allocated\n5. Study with a partner to test each other\n6. Focus on understanding, not memorisation'),
];

// =============================================================================
// INSERT EVERYTHING
// =============================================================================

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or determine Grade/Subject IDs
  const gradeDoc = await db.collection('grades').findOne({ name: /12/i });
  const subjectDoc = await db.collection('subjects').findOne({ name: /Business Studies/i });

  const GRADE_ID = gradeDoc ? gradeDoc._id : new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642');

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Business Studies subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Business Studies',
      code: 'BST',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Business Studies subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Impacts of Recent Legislation',
      description: 'Skills Development Act, Employment Equity Act, Labour Relations Act, BBBEE Act, National Credit Act, and Consumer Protection Act.',
      order: 1,
      lessons: [
        { title: 'Skills Development Act and Employment Equity Act', description: 'Role of SETAs, Skills Development Levy, EEA provisions, affirmative action, and Basic Conditions of Employment Act.', blocks: ch1_lesson1, term: 1 },
        { title: 'LRA, BBBEE, National Credit Act, and Consumer Protection Act', description: 'Labour Relations Act, COIDA, five BBBEE pillars, NCA affordability assessments, and CPA consumer rights.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Human Resources Function',
      description: 'Recruitment, selection, induction, placement, salary determination, and the impact of legislation on HR.',
      order: 2,
      lessons: [
        { title: 'Recruitment, Selection, Induction, and Compensation', description: 'Internal vs external recruitment, the selection process, induction programmes, salary determination, fringe benefits, and legislative impact on HR.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Professionalism and Ethics',
      description: 'Ethical vs unethical behaviour, King IV principles, types of unethical practices, and strategies to deal with unethical behaviour.',
      order: 3,
      lessons: [
        { title: 'Ethics, Professionalism, and King IV', description: 'Ethical vs unethical behaviour, professional conduct, King IV principles, the Steinhoff scandal, and strategies to combat unethical practices.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Creative Thinking and Problem Solving',
      description: 'Problem-solving process, brainstorming, mind mapping, force field analysis, and SCAMPER.',
      order: 4,
      lessons: [
        { title: 'Problem Solving Techniques', description: 'Steps in problem solving, decision making, brainstorming, mind mapping, force field analysis, and SCAMPER technique.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Business Strategies and the Macro Environment',
      description: 'Strategic management, Porter\u2019s Five Forces, PESTLE analysis, business strategies, and SWOT analysis.',
      order: 5,
      lessons: [
        { title: 'Strategy, Porter\u2019s Five Forces, PESTLE, and SWOT', description: 'Steps in developing a strategy, Porter\u2019s Five Forces model, PESTLE analysis, types of business strategies, and SWOT analysis.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Business Sectors and Quality of Performance',
      description: 'Primary, secondary, and tertiary sectors, TQM, PDCA cycle, and quality management.',
      order: 6,
      lessons: [
        { title: 'Business Sectors, TQM, and Quality Management', description: 'Three business sectors, challenges in micro/market/macro environments, TQM elements, PDCA cycle, and quality indicators.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Management and Leadership',
      description: 'Differences between management and leadership, five leadership styles, and the role of personal attitude.',
      order: 7,
      lessons: [
        { title: 'Leadership Styles and Management', description: 'Management vs leadership, autocratic, democratic, laissez-faire, charismatic, and transactional leadership styles.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Investment \u2014 Securities',
      description: 'Functions of the JSE, types of shares, forms of investment, and interest calculations.',
      order: 8,
      lessons: [
        { title: 'JSE, Shares, Investment, and Interest Calculations', description: 'Functions of the JSE, ordinary vs preference shares, unit trusts, fixed deposits, retirement annuities, and simple/compound interest.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Insurance',
      description: 'Compulsory and non-compulsory insurance, four insurance concepts, and insurance calculations.',
      order: 9,
      lessons: [
        { title: 'Types of Insurance and Insurance Concepts', description: 'Short-term and long-term insurance, UIF, COIDA, RAF, insurable interest, utmost good faith, indemnity, subrogation, and the average clause.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Team Performance and Conflict Management',
      description: 'Team development stages, Belbin\u2019s team roles, conflict resolution, and dealing with difficult personalities.',
      order: 10,
      lessons: [
        { title: 'Team Development, Conflict Resolution, and Difficult Personalities', description: 'Tuckman\u2019s five stages, Belbin\u2019s team roles, conflict resolution techniques, grievance procedures, and six difficult personality types.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: Human Rights, Inclusivity, and Environmental Issues',
      description: 'Human rights in the workplace, diversity, health and safety, and environmental responsibilities.',
      order: 11,
      lessons: [
        { title: 'Human Rights, Diversity, and Environmental Responsibility', description: 'Six workplace human rights, health and safety representatives, seven diversity issues, and strategies to protect the environment.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Social Responsibility and CSR',
      description: 'Triple bottom line, socio-economic issues, CSR vs CSI, and community contributions.',
      order: 12,
      lessons: [
        { title: 'Social Responsibility, Triple Bottom Line, and CSI', description: 'Social responsibility, triple bottom line, HIV/AIDS, unemployment, poverty, CSR vs CSI, and business impact on communities.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Presentation and Data Response',
      description: 'Effective presentation skills, non-verbal communication, visual aids, and data response techniques.',
      order: 13,
      lessons: [
        { title: 'Presentation Skills and Data Response', description: 'Preparing and delivering presentations, non-verbal communication, multimedia design, visual aids, and responding to data.', blocks: ch13_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 14: Forms of Ownership',
      description: 'Sole trader, partnership, private and public companies, franchises, NPOs, and success/failure factors.',
      order: 14,
      lessons: [
        { title: 'Forms of Business Ownership', description: 'Characteristics, advantages, and disadvantages of sole traders, partnerships, companies, franchises, and NPOs.', blocks: ch14_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 15: Revision and Exam Preparation',
      description: 'Paper 1 and Paper 2 structure, action verbs, essay writing tips, and revision strategies.',
      order: 15,
      lessons: [
        { title: 'Exam Structure, Essay Techniques, and Revision Strategies', description: 'NSC exam structure, action verbs, essay writing tips, Section A strategies, and key topics for revision.', blocks: ch15_lesson1, term: 4 },
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
    title: 'Grade 12 Business Studies \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Legislation, Human Resources, Ethics, Strategy, Quality, Leadership, Investment, Insurance, Team Management, Human Rights, Social Responsibility, Presentations, Forms of Ownership, and Exam Preparation for the Grade 12 Business Studies examination.',
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
  console.log('  TEXTBOOK: Grade 12 Business Studies');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
