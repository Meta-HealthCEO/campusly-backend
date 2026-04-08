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
// CHAPTER 1: Goal-Setting and Lifestyle Choices (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Goal-Setting Skills\n\nAs a Grade 9 learner you are approaching the end of the Senior Phase. The decisions you make now — about your habits, your goals, and how you respond to pressure — will shape your future. This chapter helps you develop goal-setting skills and make informed personal lifestyle choices.\n\n### Why Set Goals?\n\nGoal-setting gives your life direction and purpose. Without goals you may drift through school without a clear plan. Goals help you:\n\n- Focus your time and energy on what matters\n- Measure your progress\n- Build self-confidence when you achieve milestones\n- Make better decisions because you know what you are working toward\n- Stay motivated during difficult times'),
  t(2, '### SMART Goals\n\nEffective goals follow the SMART framework:\n\n| Letter | Meaning | Example |\n|--------|---------|--------|\n| **S** | Specific — clearly state what you want to achieve | "I want to improve my Mathematics mark" |\n| **M** | Measurable — include a way to track progress | "I want to improve from 55% to 70%" |\n| **A** | Achievable — realistic given your abilities and resources | A 15% improvement in one term is challenging but possible |\n| **R** | Relevant — aligned with your bigger life plans | Better Maths opens doors for Science and Commerce careers |\n| **T** | Time-bound — set a deadline | "By the end of Term 2" |\n\n**SMART goal example:** "I will improve my Mathematics mark from 55% to 70% by the end of Term 2 by completing 30 minutes of extra practice every weekday and attending the after-school Maths tutorial on Wednesdays."'),
  q(3, 'Which of the following is a SMART goal?',
    ['I will read one English novel per month for the next three months to improve my vocabulary', 'I want to do better at school', 'I will try harder this year', 'I hope to become successful one day'], 0,
    'The first option is specific (read one novel), measurable (per month), achievable (one book is manageable), relevant (vocabulary improvement), and time-bound (three months). The other options are vague wishes, not SMART goals.'),
  t(4, '### Short-Term, Medium-Term, and Long-Term Goals\n\nGoals can be grouped by time frame:\n\n| Type | Time frame | Examples |\n|------|-----------|----------|\n| **Short-term** | Days to weeks | Complete my LO project by Friday; study Chapter 3 for tomorrow\'s test |\n| **Medium-term** | Months to a year | Achieve 70% in Mathematics by end of Term 2; make the school netball team |\n| **Long-term** | Years | Complete matric with a bachelor\'s pass; study medicine at university; start a business |\n\n**How they connect:**\nLong-term goals are achieved by working through medium-term goals, which are achieved by completing short-term goals. Think of it as climbing a staircase — each step brings you closer to the top.\n\n**Action plan:** Break every medium- or long-term goal into small, daily actions. For example, the long-term goal of "pass matric with a bachelor\'s pass" requires the daily action of "attend all classes and complete homework."'),
  fb(5, 'The letter S in SMART goals stands for ___. Goals that span several years are called ___-term goals.',
    ['Specific', 'long'],
    'S stands for Specific — your goal must clearly state what you want to achieve. Long-term goals cover a period of several years.'),
  t(6, '### Personal Lifestyle Choices\n\nA lifestyle choice is a decision you make about how you live your daily life. Your choices affect your physical health, mental well-being, relationships, and future opportunities.\n\n**Healthy lifestyle choices:**\n- Eating a balanced diet with fruits, vegetables, and whole grains\n- Exercising regularly (at least 60 minutes of activity per day for teenagers)\n- Getting 8–10 hours of sleep each night\n- Drinking enough water\n- Avoiding tobacco, alcohol, and drugs\n- Managing stress through healthy activities (sport, hobbies, talking to someone)\n\n**Unhealthy lifestyle choices:**\n- Eating mostly fast food and sugary snacks\n- Being physically inactive (spending all free time on screens)\n- Not getting enough sleep\n- Using alcohol, tobacco, or drugs\n- Engaging in risky sexual behaviour\n- Isolating yourself and not seeking help when struggling'),
  q(7, 'Sipho spends most of his free time playing video games, eats mostly chips and cool drink, and sleeps only 5 hours a night. Which combination of changes would BEST improve his lifestyle?',
    ['Reduce screen time, eat more fruits and vegetables, and sleep 8–10 hours', 'Play video games for one extra hour per day', 'Skip meals to save money for new games', 'Sleep even less to have more time for homework'], 0,
    'Reducing screen time allows for physical activity, eating fruits and vegetables provides essential nutrients, and sleeping 8–10 hours supports physical and mental development during adolescence.'),
  t(8, '### Influences on Personal Lifestyle Choices\n\nMany factors influence the choices you make. Some are positive; others are negative.\n\n| Influence | Positive example | Negative example |\n|-----------|-----------------|------------------|\n| **Media** | Health campaigns promoting exercise | Adverts normalising alcohol and junk food |\n| **Environment** | Access to parks and sports facilities | Living in an area with high crime and few safe spaces |\n| **Friends and peers** | Friends who encourage studying | Peer pressure to smoke, drink, or bunk school |\n| **Family** | Parents who model healthy habits | Family members who smoke or abuse alcohol |\n| **Culture** | Cultural practices that promote community | Cultural practices that discourage open discussion of health |\n| **Religion** | Faith communities offering support | Religious teachings misused to justify discrimination |\n| **Community** | Community sports leagues and libraries | Drug dealers and gangs operating in the neighbourhood |'),
  q(9, 'Thandi\'s friends pressure her to try cigarettes at a party. She refuses firmly. Which skill is Thandi demonstrating?',
    ['Assertiveness — making a confident decision and standing by it', 'Aggression — being rude to her friends', 'Passivity — going along with the group', 'Avoidance — running away from problems'], 0,
    'Assertiveness means expressing your position clearly and confidently without being aggressive. Thandi is standing firm in her decision while respecting herself and others.'),
  t(10, '### Decision-Making Skills\n\nGood decisions follow a process:\n\n1. **Identify the decision** — What choice do you need to make?\n2. **Gather information** — What are the facts? Who can you ask?\n3. **Identify your options** — What are the possible choices?\n4. **Weigh the consequences** — What are the pros and cons of each option?\n5. **Make the decision** — Choose the option with the best outcome\n6. **Act on it** — Put your decision into practice\n7. **Reflect** — Did it work? What would you do differently next time?\n\n**Informed decision-making** means using facts, values, and careful thought rather than acting on impulse or peer pressure. Every decision has consequences — positive or negative — and you are responsible for the choices you make.'),
  fb(11, 'Making decisions based on facts and careful thought rather than impulse is called ___ decision-making. The ability to say no confidently without being aggressive is called ___.',
    ['informed', 'assertiveness'],
    'Informed decision-making involves gathering facts and weighing consequences before choosing. Assertiveness is the skill of standing firm in your decisions while remaining respectful.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Sexual Behaviour and Health (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Sexual Behaviour and Sexual Health\n\nThis chapter deals with important health topics that affect young people in South Africa. Understanding the risks of unhealthy sexual behaviour, the consequences of teenage pregnancy, and how to protect yourself is essential for making responsible choices.\n\n### Risk Factors Leading to Unhealthy Sexual Behaviour\n\nSeveral factors can push young people toward risky sexual decisions:\n\n- **Peer pressure** — friends boasting about sexual activity or daring you to "prove" yourself\n- **Low self-esteem** — seeking validation or love through sexual activity\n- **Alcohol and drug use** — substances impair judgement and lower inhibitions\n- **Lack of information** — not understanding the risks or how to protect yourself\n- **Media influence** — movies, music, and social media that glamorise sex\n- **Emotional scars** — past abuse or trauma that affects how you view relationships\n- **Poverty** — transactional sex (sex in exchange for money, gifts, or food) driven by economic desperation'),
  t(2, '### Unwanted Results of Unhealthy Sexual Behaviour\n\nUnhealthy sexual behaviour can have life-changing consequences:\n\n**Teenage pregnancy:**\n- South Africa has one of the highest teenage pregnancy rates in Africa\n- Pregnant learners often drop out of school, limiting their future opportunities\n- Teen mothers face health risks: complications during pregnancy and childbirth\n- Children born to teenage parents may face poverty, neglect, and developmental challenges\n- The South African Schools Act allows pregnant learners to remain in school, but many still leave due to stigma, lack of support, or financial pressure\n\n**Sexually transmitted infections (STIs):**\n- Chlamydia, gonorrhoea, syphilis, herpes, and HPV\n- Many STIs have no visible symptoms at first but cause serious damage if untreated\n- STIs increase the risk of contracting HIV\n\n**HIV/AIDS:**\n- South Africa has the largest HIV epidemic in the world\n- Young women aged 15–24 are disproportionately affected\n- HIV weakens the immune system, making the body vulnerable to other infections\n- While antiretroviral therapy (ART) allows people to live longer, there is currently no cure'),
  q(3, 'Which of the following is a risk factor that may lead to unhealthy sexual behaviour among teenagers?',
    ['Peer pressure and substance abuse that impair judgement', 'Attending health education classes', 'Having supportive parents who discuss sexuality openly', 'Being involved in sports and community activities'], 0,
    'Peer pressure and substance abuse are well-known risk factors. Health education, supportive parents, and community involvement are protective factors that reduce risky behaviour.'),
  t(4, '### HIV/AIDS — What You Must Know\n\nHIV (Human Immunodeficiency Virus) attacks the immune system. If untreated, it progresses to AIDS (Acquired Immunodeficiency Syndrome).\n\n**How HIV is transmitted:**\n- Unprotected sexual intercourse (vaginal, anal, or oral)\n- Sharing needles or sharp objects contaminated with infected blood\n- Mother to child during pregnancy, birth, or breastfeeding (without treatment)\n- Contact with infected blood through open wounds\n\n**How HIV is NOT transmitted:**\n- Hugging, shaking hands, or sharing food\n- Mosquito bites\n- Using the same toilet or swimming pool\n- Coughing or sneezing\n\n**Prevention:**\n- Abstain from sexual activity (the safest choice for young people)\n- Use condoms correctly and consistently\n- Never share needles or razor blades\n- Get tested regularly and know your status\n- PrEP (pre-exposure prophylaxis) is available for people at high risk\n- Free condoms and HIV testing are available at government clinics'),
  fb(5, 'HIV stands for Human ___ Virus. The safest way for teenagers to prevent HIV infection and pregnancy is ___.',
    ['Immunodeficiency', 'abstinence'],
    'HIV stands for Human Immunodeficiency Virus — it attacks the immune system. Abstinence (not having sex) is the only 100% effective prevention method for both HIV and pregnancy.'),
  t(6, '### Consequences of Teenage Pregnancy\n\nTeenage pregnancy affects the young mother, the baby, and the broader community:\n\n**For the teenage mother:**\n- Interrupted education — many drop out and never return\n- Limited career prospects and economic independence\n- Health risks: high blood pressure, anaemia, complications during delivery\n- Social stigma and isolation\n- Emotional stress, anxiety, and depression\n\n**For the child:**\n- Higher risk of low birth weight and health problems\n- May grow up in poverty with limited resources\n- May lack a stable two-parent household\n- Increased risk of developmental delays if proper care is not available\n\n**For the community:**\n- Cycle of poverty continues\n- Greater demand on social services (grants, clinics)\n- Lost potential — a learner who could have become a doctor, teacher, or engineer\n\n**Support available in SA:**\n- Child Support Grant from SASSA (R530/month)\n- Government clinics provide free ante-natal care\n- The SA Schools Act protects pregnant learners\' right to education'),
  q(7, 'Nomsa discovers she is pregnant in Grade 9. According to the South African Schools Act, what are her rights?',
    ['She has the right to remain in school and continue her education', 'She must leave school immediately', 'She can only return after the baby is one year old', 'The school principal decides whether she can stay'], 0,
    'The South African Schools Act protects the right of pregnant learners to remain in school. No learner may be expelled because of pregnancy. Schools must support pregnant learners to continue their education.'),
  t(8, '### Strategies to Deal with Unhealthy Sexual Behaviour\n\nYoung people can protect themselves through:\n\n**Abstinence:** Choosing not to engage in sexual activity. This is the safest and most effective strategy for preventing pregnancy, STIs, and HIV.\n\n**Change of behaviour:** If you have been sexually active, you can choose to stop or to practise safer sex going forward.\n\n**Protective factors — community structures that reduce risk:**\n- Youth groups at churches, mosques, and community centres\n- Sports clubs and after-school programmes that keep young people busy\n- Peer education programmes (like loveLife\'s groundBREAKERS)\n- School-based health services and counselling\n- Supportive family relationships where parents discuss sexuality openly\n\n**Where to find help:**\n- loveLife: 0800 121 900 (free youth helpline)\n- Childline: 0800 055 555\n- National AIDS Helpline: 0800 012 322\n- Local government clinics (free condoms, testing, counselling)'),
  q(9, 'Which of the following is a protective factor that helps young people avoid risky sexual behaviour?',
    ['Involvement in sports clubs and community youth programmes', 'Spending most time alone with no adult supervision', 'Watching movies that glamorise sexual activity', 'Associating with peers who pressure others into sexual activity'], 0,
    'Protective factors include structured activities, supportive relationships, and community involvement. These keep young people engaged, build self-esteem, and provide positive role models.'),
  fb(10, 'Community structures that reduce risky behaviour among young people are called ___ factors. The free youth helpline run by loveLife is ___.',
    ['protective', '0800 121 900'],
    'Protective factors are conditions or resources that help shield young people from risky behaviour. loveLife\'s helpline (0800 121 900) provides free, confidential support for young South Africans.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: World of Work — Time Management and Study Skills (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Time Management and Study Skills\n\nGrade 9 is a critical year — your results determine your subject choices for Grade 10 and the FET phase. Strong time-management and study skills will help you succeed academically and prepare for the demands of high school.\n\n### Why Time Management Matters\n\nTime is a resource you cannot get back. Managing it well means you:\n\n- Complete tasks and assignments on time\n- Reduce stress and last-minute panic\n- Have time for both studying and relaxation\n- Build a habit that will serve you throughout your career\n\n### The Time-Management Matrix\n\n| | **Urgent** | **Not urgent** |\n|---|-----------|----------------|\n| **Important** | Test tomorrow — study now! Assignment due today | Long-term revision, personal development, exercise |\n| **Not important** | Replying to every message immediately | Scrolling social media, watching random videos |\n\n**Key insight:** Spend most of your time on tasks that are important but not yet urgent. This prevents crises and reduces stress.'),
  t(2, '### How to Organise Your Time\n\n**Step 1: Use a planner or diary**\n- Write down all due dates for tests, assignments, and projects at the start of each term\n- Break large tasks into smaller steps with mini-deadlines\n\n**Step 2: Create a weekly study timetable**\n- Allocate specific time slots for each subject\n- Study your most difficult subjects when you are most alert (usually morning or early afternoon)\n- Include short breaks — the brain needs rest to consolidate learning\n\n**Step 3: Prioritise**\n- Use the ABC method: A = must do today, B = should do this week, C = can wait\n- Do the hardest or most important task first (do not leave it for last when you are tired)\n\n**Step 4: Eliminate time wasters**\n- Put your phone on silent or in another room while studying\n- Set a specific time for social media rather than checking it constantly\n- Say no to distractions — friends can wait until your study session is over'),
  q(3, 'Lerato has a test on Friday, an assignment due next Wednesday, and wants to watch a new series. Using the time-management matrix, which task is "important and urgent"?',
    ['The test on Friday — it requires immediate preparation', 'Watching the new series', 'The assignment due next Wednesday', 'All three are equally urgent'], 0,
    'The Friday test is both important (it affects her marks) and urgent (it is happening soon). The assignment is important but not yet urgent. The series is neither important nor urgent in terms of academics.'),
  t(4, '### Accountability in Carrying Out Responsibilities\n\nAccountability means taking ownership of your actions and their outcomes:\n\n**At school:**\n- Attend all classes on time\n- Complete homework and assignments by the due date\n- Participate actively in group work — do your fair share\n- If you fall behind, speak to your teacher rather than making excuses\n\n**At home:**\n- Complete your chores without being reminded\n- Help younger siblings with homework\n- Manage your own study schedule\n\n**In your community:**\n- Follow through on commitments (if you volunteer, show up)\n- Treat public spaces with respect\n\n**The accountability cycle:**\n1. Accept the task\n2. Plan how you will complete it\n3. Do the work\n4. Check the quality\n5. Submit or deliver on time\n6. Reflect on what you could improve'),
  fb(5, 'Taking ownership of your actions and their outcomes is called ___. In time management, you should spend most of your time on tasks that are important but not yet ___.',
    ['accountability', 'urgent'],
    'Accountability means accepting responsibility for what you do and its results. Focusing on important-but-not-urgent tasks prevents last-minute crises and reduces stress.'),
  t(6, '### Reading and Writing for Different Purposes\n\nIn Grade 9, you are expected to read and write at a higher level. These skills are essential for every subject and for your future career.\n\n**Reading skills:**\n\n| Purpose | Technique |\n|---------|----------|\n| **Skimming** | Quickly reading headings, bold text, and first sentences to get the main idea |\n| **Scanning** | Looking for specific information (a date, a name, a number) |\n| **Detailed reading** | Reading carefully for full understanding, taking notes as you go |\n| **Critical reading** | Evaluating what you read — is it factual? Is the source reliable? What is the author\'s purpose? |\n\n**Writing skills:**\n\n| Purpose | Format |\n|---------|--------|\n| **Summarising** | Condense key points into your own words (usually one-third of the original) |\n| **Keeping a journal** | Reflect on what you have learned; record feelings, questions, and goals |\n| **Essay writing** | Introduction, body paragraphs (each with a topic sentence), conclusion |\n| **Note-taking** | Use abbreviations, bullet points, and headings to organise information quickly |'),
  q(7, 'You need to find the year South Africa became a democracy in a 20-page document. Which reading technique is most appropriate?',
    ['Scanning — looking specifically for the date 1994', 'Detailed reading of every page from start to finish', 'Skimming for the general theme of the document', 'Critical reading to evaluate the author\'s bias'], 0,
    'Scanning is used when you need to find specific information quickly. You look for key words (like "1994" or "democracy") without reading every word.'),
  t(8, '### How to Use Time Effectively and Efficiently\n\n**Effective** means doing the right things. **Efficient** means doing things in the best way with the least waste of time.\n\nTips for Grade 9 learners:\n\n- **Batch similar tasks:** Do all your reading for different subjects in one sitting, then switch to written work\n- **Use dead time:** Revise flashcards while waiting for transport or standing in a queue\n- **Set a timer:** Challenge yourself to finish a task within a set time — this builds focus\n- **Review daily:** Spend 10 minutes each evening reviewing what you learned that day — this is more effective than cramming before tests\n- **Ask for help early:** If you do not understand something, ask your teacher the next day — do not wait until the test is near\n- **Avoid multitasking:** Studying while watching TV or chatting means you do neither well. Focus on one task at a time.'),
  q(9, 'What is the difference between being effective and being efficient?',
    ['Effective means doing the right things; efficient means doing things with the least waste of time', 'They mean exactly the same thing', 'Effective means working fast; efficient means working slowly', 'Effective applies only to studying; efficient applies only to sport'], 0,
    'Effectiveness is about choosing the right tasks (doing what matters). Efficiency is about completing tasks with the least waste of time and resources. Ideally, you should be both effective and efficient.'),
  fb(10, 'Doing the right things is called being ___. Doing things with the least waste of time is called being ___.',
    ['effective', 'efficient'],
    'Effectiveness = doing the right tasks. Efficiency = doing tasks in the best way. A good student is both effective (studying the right topics) and efficient (using study time wisely).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Constitutional Rights and Responsibilities (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Constitutional Rights and Responsibilities\n\nSouth Africa\'s Constitution is the supreme law of the country. It protects the rights of every person and places responsibilities on citizens and the state. As a Grade 9 learner and future voter, you need to understand these rights and how they apply to real life.\n\n### Citizens\' Rights and Responsibilities\n\nThe Bill of Rights (Chapter 2 of the Constitution) guarantees fundamental rights to everyone in South Africa:\n\n| Right | Section | What it means |\n|-------|---------|---------------|\n| **Equality** | 9 | Everyone is equal before the law; no unfair discrimination |\n| **Human dignity** | 10 | Everyone has inherent dignity that must be respected |\n| **Life** | 11 | Everyone has the right to life |\n| **Freedom and security of the person** | 12 | No one may be tortured, treated cruelly, or subjected to violence |\n| **Privacy** | 14 | Your home, belongings, and communications are private |\n| **Freedom of expression** | 16 | You may express opinions, but not hate speech or incitement to violence |\n| **Education** | 29 | Everyone has the right to basic education |\n| **Environment** | 24 | Everyone has the right to a clean, healthy environment |'),
  t(2, '### Respect for Others\' Rights — People Living with Disabilities and HIV/AIDS\n\nThe Bill of Rights protects everyone, including people living with disabilities and people living with HIV/AIDS:\n\n**People with disabilities:**\n- Have the right to dignity, equality, and access to education\n- The Constitution forbids unfair discrimination on the basis of disability (Section 9)\n- Schools must make reasonable accommodations (ramps, extra time in exams, assistive devices)\n- Disability is not inability — people with disabilities have the same potential to learn, work, and contribute\n\n**People living with HIV/AIDS:**\n- Have the right to privacy — no one may disclose their status without consent\n- Have the right to non-discrimination — they may not be excluded from school, work, or social activities\n- Have the right to medical treatment — free ARVs are available at government clinics\n- Stigma and discrimination drive people away from testing and treatment\n\n**Your responsibility:**\n- Treat all people with dignity and respect regardless of disability or health status\n- Challenge discriminatory language and behaviour when you see it\n- Educate yourself and others — ignorance fuels stigma'),
  q(3, 'A school refuses to admit a learner who is HIV-positive. Which constitutional right is being violated?',
    ['The right to equality (Section 9) and the right to education (Section 29)', 'The right to freedom of expression (Section 16)', 'The right to privacy (Section 14)', 'No rights are being violated because schools can set their own rules'], 0,
    'Refusing to admit an HIV-positive learner is unfair discrimination (violating Section 9) and denies the right to basic education (Section 29). Schools cannot override constitutional rights.'),
  t(4, '### Constitutional Values as Stated in the South African Constitution\n\nThe Constitution is built on foundational values:\n\n**Human dignity:** Every person has worth and must be treated with respect, regardless of race, gender, religion, or economic status.\n\n**Equality:** Everyone is equal before the law. This does not mean everyone is the same — it means everyone deserves fair treatment and equal opportunities.\n\n**Non-racialism and non-sexism:** South Africa rejects all forms of racial and gender discrimination. Apartheid was built on racism; the Constitution ensures this can never happen again.\n\n**Supremacy of the Constitution and the rule of law:** No person — not even the President — is above the law. All laws must comply with the Constitution.\n\n**Democracy and accountability:** The government is elected by the people and must answer to the people. Citizens participate through voting, public comment, and holding leaders accountable.\n\n**Ubuntu:** The African philosophy of shared humanity — "I am because we are." It emphasises compassion, community, and mutual care.'),
  fb(5, 'The founding value that means "I am because we are" is called ___. Section 9 of the Bill of Rights protects the right to ___.',
    ['ubuntu', 'equality'],
    'Ubuntu is the African philosophy emphasising shared humanity and community. Section 9 of the Bill of Rights guarantees equality and prohibits unfair discrimination.'),
  t(6, '### Positive and Negative Role Models\n\nRole models are people whose behaviour and values you admire and may want to follow:\n\n**Positive role models uphold constitutional values:**\n- Nelson Mandela — fought for equality and reconciliation\n- Desmond Tutu — championed human dignity and ubuntu\n- Teachers, parents, and community leaders who treat others with respect\n- Young South Africans who serve their communities through volunteer work\n\n**Negative role models undermine constitutional values:**\n- Public figures involved in corruption, fraud, or dishonesty\n- Celebrities who promote substance abuse or violence\n- People who discriminate against others based on race, gender, or disability\n- Leaders who do not take accountability for their actions\n\n**Applying constitutional values in daily life:**\n- Stand up against bullying (defending dignity and equality)\n- Include classmates who are different from you (non-racialism, non-sexism)\n- Follow school rules and the law (rule of law)\n- Treat everyone — regardless of background — with respect (ubuntu)'),
  q(7, 'Which of the following actions demonstrates the constitutional value of ubuntu?',
    ['Helping a struggling classmate with their homework because you believe in shared responsibility', 'Ignoring a new learner because they are from a different province', 'Only helping people who belong to your friend group', 'Reporting someone to the teacher to get them into trouble'], 0,
    'Ubuntu — "I am because we are" — means caring for others and recognising our shared humanity. Helping a struggling classmate reflects this value of collective support and compassion.'),
  t(8, '### Celebrations of National and International Days\n\nSouth Africa celebrates several days that reinforce constitutional values:\n\n| Day | Date | Significance |\n|-----|------|--------------|\n| **Human Rights Day** | 21 March | Remembers the Sharpeville massacre (1960); celebrates our Bill of Rights |\n| **Freedom Day** | 27 April | Marks the first democratic election (1994) |\n| **Heritage Day** | 24 September | Celebrates South Africa\'s cultural diversity |\n| **Youth Day** | 16 June | Commemorates the Soweto uprising (1976) when learners protested against Bantu Education |\n| **Reconciliation Day** | 16 December | Promotes reconciliation among all South Africans |\n| **Women\'s Day** | 9 August | Honours the women who marched against pass laws in 1956 |\n| **Nelson Mandela Day** | 18 July | Encourages 67 minutes of community service |\n| **Africa Day** | 25 May | Celebrates African unity and the founding of the OAU (now AU) |\n| **World Refugee Day** | 20 June | Raises awareness about the rights of refugees globally |\n| **National Health Days** | Various | World AIDS Day (1 Dec), World TB Day (24 Mar), etc. |'),
  q(9, 'Youth Day on 16 June commemorates which historical event?',
    ['The Soweto uprising of 1976, when learners protested against Bantu Education', 'The release of Nelson Mandela from prison in 1990', 'The first democratic election in 1994', 'The adoption of the Constitution in 1996'], 0,
    'On 16 June 1976, thousands of learners in Soweto marched against the forced use of Afrikaans as a medium of instruction under Bantu Education. Police opened fire, killing Hector Pieterson and many others.'),
  fb(10, 'Youth Day commemorates the ___ uprising of 1976. Freedom Day on 27 April marks South Africa\'s first ___ election.',
    ['Soweto', 'democratic'],
    'The Soweto uprising on 16 June 1976 was a turning point in the struggle against apartheid. Freedom Day celebrates the first democratic election held on 27 April 1994.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: World of Work — Career Options and the Workplace (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Career Options After Grade 9\n\nGrade 9 is a gateway year. At the end of this year you will choose subjects for the FET phase (Grades 10–12). These choices affect which careers are open to you. This chapter explores your options and the world of work.\n\n### Options After Completing Grade 9\n\nAfter Grade 9, South African learners can follow two main pathways:\n\n**1. National Senior Certificate (NSC) — Grades 10–12 at a school**\n- Also called "matric"\n- Choose 7 subjects: 4 compulsory (Home Language, First Additional Language, Mathematics or Mathematical Literacy, Life Orientation) and 3 electives\n- Three types of passes:\n  - **Bachelor\'s pass** — qualifies for university degree study\n  - **Diploma pass** — qualifies for diploma study at a university of technology\n  - **Higher Certificate pass** — qualifies for higher certificate programmes\n\n**2. National Certificate Vocational (NCV) — at a TVET college**\n- Practical, hands-on training in specific fields\n- Programmes include engineering, business studies, hospitality, IT, agriculture\n- Can enter after Grade 9 (NCV Level 2 = Grade 10 equivalent)\n- Leads to employment or further study'),
  t(2, '### Implications of Choosing Between NSC and NCV\n\nYour choice between school (NSC) and a TVET college (NCV) has important implications:\n\n| Factor | NSC (School) | NCV (TVET College) |\n|--------|-------------|--------------------|\n| **Focus** | Academic — theory and examinations | Vocational — practical skills and workplace experience |\n| **Path to university** | Direct access with the right pass | Possible but requires additional qualifications |\n| **Duration** | 3 years (Grades 10–12) | 3 years (NCV Levels 2–4) |\n| **Career direction** | Broader range of career options | Specific career fields (engineering, business, etc.) |\n| **Cost** | Free at public schools | NSFAS bursaries available for qualifying learners |\n\n**Important:** Neither path is "better" — the right choice depends on your interests, abilities, and career goals. A learner who loves working with their hands may thrive at a TVET college, while a learner aiming for medicine needs the NSC route.\n\n**Tip:** Research careers you are interested in and check what qualifications they require BEFORE choosing your subjects.'),
  q(3, 'Bongani wants to become a mechanical engineer. Which pathway would be most appropriate for him?',
    ['Either NSC with Mathematics and Physical Science, or NCV in Engineering — both can lead to engineering qualifications', 'NCV in Hospitality', 'NSC with Mathematical Literacy and Tourism', 'Drop out after Grade 9 and look for work immediately'], 0,
    'Mechanical engineering can be accessed through the NSC route (with Maths and Physical Science for university entry) or the NCV engineering route (leading to practical qualifications). The key is choosing the right subjects/programme.'),
  t(4, '### Knowledge of the World of Work\n\nUnderstanding the workplace prepares you for your future career:\n\n**Rights in the workplace:**\n- Right to fair labour practices (Section 23 of the Bill of Rights)\n- Right to a written employment contract\n- Right to the national minimum wage\n- Right to safe and healthy working conditions\n- Right to join a trade union\n- Protection against unfair dismissal\n- Protection against unfair discrimination\n\n**Responsibilities in the workplace:**\n- Arrive on time and be reliable\n- Complete tasks to the best of your ability\n- Follow workplace rules and procedures\n- Treat colleagues and clients with respect\n- Act ethically and honestly\n- Continue learning and developing your skills\n\n**Key laws protecting workers:**\n- Basic Conditions of Employment Act (BCEA) — working hours, leave, minimum wage\n- Labour Relations Act (LRA) — unfair dismissal, trade unions, dispute resolution\n- Employment Equity Act (EEA) — fair treatment and affirmative action'),
  fb(5, 'The two main pathways after Grade 9 are the National Senior Certificate (NSC) and the National Certificate ___. The right to fair labour practices is protected by Section ___ of the Bill of Rights.',
    ['Vocational', '23'],
    'The NCV (National Certificate Vocational) is offered at TVET colleges as an alternative to the school-based NSC. Section 23 of the Bill of Rights protects fair labour practices.'),
  t(6, '### Opportunities in the Workplace\n\nThe world of work is changing rapidly. New opportunities are emerging:\n\n**Growing career fields in South Africa:**\n- Information technology (coding, cybersecurity, data science)\n- Renewable energy (solar and wind installation, green engineering)\n- Healthcare (nurses, pharmacists, allied health professionals)\n- Agriculture and food security\n- Tourism and hospitality\n- Entrepreneurship and small business\n- Digital marketing and e-commerce\n\n**Skills employers value:**\n- Problem-solving and critical thinking\n- Communication (written and verbal)\n- Teamwork and collaboration\n- Digital literacy (basic computer skills at minimum)\n- Adaptability — willingness to learn new things\n- Creativity and innovation\n\n**The Fourth Industrial Revolution (4IR):**\n- Technology is automating many traditional jobs\n- New jobs are being created that did not exist 10 years ago\n- Learners who develop strong thinking, communication, and digital skills will be best prepared\n- Lifelong learning is essential — your education does not end with matric'),
  q(7, 'Which of the following skills is LEAST likely to be replaced by technology in the Fourth Industrial Revolution?',
    ['Critical thinking and creative problem-solving', 'Data entry and filing', 'Repetitive factory assembly work', 'Basic calculations and record-keeping'], 0,
    'Critical thinking and creativity are uniquely human skills that technology cannot easily replace. Routine tasks like data entry, assembly, and basic calculations are most vulnerable to automation.'),
  t(8, '### Choosing Subjects for Grade 10\n\nYour subject choices for the FET phase are one of the most important decisions you will make this year:\n\n**Compulsory subjects (all learners):**\n1. Home Language\n2. First Additional Language\n3. Mathematics OR Mathematical Literacy\n4. Life Orientation\n\n**Choosing your 3 electives — consider:**\n- What careers interest you? Check subject requirements\n- What are you good at? Choose subjects that match your strengths\n- What do you enjoy? You will study these for 3 years\n- Keep your options open — Mathematics (not Maths Lit) keeps more doors open\n\n**Common subject-career links:**\n\n| Career field | Recommended subjects |\n|-------------|---------------------|\n| Medicine, engineering, science | Mathematics, Physical Science, Life Sciences |\n| Law, journalism, social work | History, languages, Business Studies |\n| Accounting, finance, banking | Mathematics, Accounting, Economics |\n| IT, programming, data science | Mathematics, IT, Physical Science |\n| Art, design, architecture | Visual Arts, Mathematics, IT |\n| Teaching | Subjects related to what you want to teach |'),
  q(9, 'Ayanda wants to study medicine at university. Which subject combination would be MOST appropriate for Grade 10?',
    ['Mathematics, Physical Science, and Life Sciences', 'Mathematical Literacy, Tourism, and Visual Arts', 'History, Geography, and Business Studies', 'Consumer Studies, EMS, and Drama'], 0,
    'Medicine requires Mathematics (not Maths Lit), Physical Science, and Life Sciences. These are non-negotiable entry requirements at all South African medical schools.'),
  fb(10, 'In the FET phase, learners must take 4 compulsory subjects and ___ elective subjects. Mathematics (not Mathematical Literacy) is required for careers in medicine, engineering, and ___.',
    ['3', 'science'],
    'The NSC requires 7 subjects: 4 compulsory and 3 electives. Mathematics is essential for science-based careers including medicine, engineering, and information technology.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Career and Subject Choices (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Career and Subject Choices\n\nThis chapter deepens your understanding of how to align your abilities and interests with the right career, and introduces the concept of volunteerism as a way to develop skills and serve your community.\n\n### Subjects in Grade 10, 11, and 12\n\nUnderstanding what each subject involves helps you choose wisely:\n\n| Subject | What you learn | Careers it leads to |\n|---------|---------------|--------------------|\n| **Mathematics** | Algebra, geometry, trigonometry, calculus, probability | Engineering, medicine, IT, accounting, science |\n| **Mathematical Literacy** | Financial maths, measurement, maps, data handling | Administration, policing, nursing, retail management |\n| **Physical Science** | Physics and chemistry | Engineering, pharmacy, medicine, research |\n| **Life Sciences** | Biology, human anatomy, ecology, genetics | Medicine, nursing, veterinary science, environmental science |\n| **Accounting** | Financial statements, recording transactions | Accounting, auditing, banking, financial management |\n| **Business Studies** | Business operations, entrepreneurship | Business management, marketing, HR |\n| **History** | Past events and their causes and effects | Law, journalism, diplomacy, teaching |\n| **Geography** | Physical and human geography, GIS | Urban planning, environmental management, meteorology |'),
  t(2, '### Careers Related to Different Subjects\n\nEvery subject opens doors to specific career paths. Here are additional links:\n\n| Subject | Career examples |\n|---------|----------------|\n| **Economics** | Economist, financial analyst, policy advisor, banker |\n| **Consumer Studies** | Food technologist, chef, nutritionist, fashion designer |\n| **Information Technology** | Software developer, network administrator, cybersecurity analyst |\n| **Visual Arts** | Graphic designer, animator, architect, art teacher |\n| **Tourism** | Tour guide, hotel manager, travel agent, event planner |\n| **Agricultural Science** | Farmer, agricultural engineer, food scientist, environmental consultant |\n| **Dramatic Arts** | Actor, director, scriptwriter, arts administrator |\n| **Engineering Graphics and Design** | Civil engineer, draughtsperson, industrial designer |\n\n**Remember:** Many careers require a combination of subjects. Research your dream career\'s requirements before choosing. Visit the National Career Advice Portal at www.careerhelp.org.za or call 086 999 0123.'),
  q(3, 'Zanele is interested in cybersecurity. Which subject combination would best prepare her?',
    ['Mathematics, Information Technology, and Physical Science', 'Mathematical Literacy, Tourism, and History', 'Consumer Studies, Visual Arts, and Drama', 'Life Sciences, Geography, and Music'], 0,
    'Cybersecurity requires strong mathematical and logical thinking (Mathematics), programming skills (IT), and understanding of systems (Physical Science). These subjects provide the foundation for a career in cybersecurity.'),
  t(4, '### Qualities Relating to Careers: Strengths and Weaknesses\n\nChoosing a career that matches your strengths increases your chance of success and satisfaction:\n\n**How to identify your strengths:**\n- What subjects do you find easiest?\n- What activities do you enjoy and lose track of time doing?\n- What compliments do you receive from teachers, family, or friends?\n- What tasks do you volunteer for?\n\n**How to identify your weaknesses:**\n- What subjects do you struggle with despite trying?\n- What tasks do you avoid or procrastinate on?\n- What makes you feel frustrated or exhausted?\n\n**Strengths vs. interests:**\n- A strength is something you are good at (ability)\n- An interest is something you enjoy (passion)\n- The ideal career combines both — you are good at it AND you enjoy it\n\n**Addressing weaknesses:**\n- Weaknesses are not permanent — many can be improved with practice\n- Choose a career that plays to your strengths\n- Work on weaknesses that are essential for your chosen career\n- Do not let one weakness discourage you from pursuing your goals'),
  fb(5, 'Something you are good at is called a ___. Something you enjoy doing is called an ___.',
    ['strength', 'interest'],
    'A strength is an ability or skill you perform well. An interest is something you are passionate about and enjoy. The best career combines both.'),
  t(6, '### Decision-Making Skills for Choosing Subjects\n\nChoosing your Grade 10 subjects is a major decision. Use these steps:\n\n1. **Self-assessment:** What are my strengths, interests, and values?\n2. **Career research:** What careers am I interested in? What subjects do they require?\n3. **Talk to people:** Ask teachers, parents, older learners, and career counsellors for advice\n4. **Consider the future:** Will this subject keep my options open? Is the career field growing?\n5. **Be realistic:** Do my marks in the subject support my choice? Can I cope with the workload?\n6. **Avoid common mistakes:**\n   - Do not choose a subject just because your friend chose it\n   - Do not avoid a subject because you think it is "too hard" without trying\n   - Do not choose Mathematical Literacy if you might need Mathematics for your career\n   - Do not choose based on which teacher you like — teachers change\n\n**If you are unsure:** Keep Mathematics (not Maths Lit) and include at least one science subject. This keeps the widest range of careers open to you.'),
  q(7, 'What is the BIGGEST mistake a Grade 9 learner can make when choosing FET subjects?',
    ['Choosing subjects based on what friends choose rather than personal strengths and career goals', 'Researching career requirements before making a choice', 'Talking to teachers and career counsellors for guidance', 'Choosing Mathematics to keep career options open'], 0,
    'Choosing subjects based on friendships rather than your own abilities and career goals is the most common and costly mistake. Your friends will not write your exams or build your career for you.'),
  t(8, '### Volunteerism\n\nVolunteerism means giving your time and skills to help others without expecting payment:\n\n**Types of volunteer organisations:**\n\n| Type | Examples |\n|------|----------|\n| **Community-based** | Soup kitchens, neighbourhood clean-ups, tutoring younger learners |\n| **Non-profit organisations** | Gift of the Givers, Habitat for Humanity, SPCA |\n| **Health and support** | Hospice volunteers, HIV/AIDS awareness campaigns, hospital visits |\n| **Environmental** | Beach clean-ups, tree planting, Working for Water |\n| **Faith-based** | Church, mosque, or temple community outreach programmes |\n\n**Individual and community responsibility:**\n- Volunteers strengthen communities by filling gaps where government cannot reach\n- Helping those less privileged builds empathy and social awareness\n- Assisting people affected by HIV/AIDS and terminal illnesses provides comfort and dignity\n\n**Benefits of volunteering:**\n- Develop skills: leadership, teamwork, communication\n- Build your CV — universities and employers value community service\n- Expand your network and meet new people\n- Gain a sense of purpose and fulfilment\n- Learn about different communities and challenges'),
  q(9, 'How does volunteering benefit a Grade 9 learner\'s future career?',
    ['It develops skills, builds a CV, and demonstrates community responsibility to future employers', 'It guarantees a high-paying job immediately', 'It replaces the need for academic qualifications', 'It has no career benefit — it is just free labour'], 0,
    'Volunteering develops transferable skills (leadership, teamwork, communication), adds value to your CV, and shows universities and employers that you are a responsible, community-minded person.'),
  fb(10, 'Giving your time and skills to help others without payment is called ___. The types of volunteer organisations include community-based, non-profit, health and support, environmental, and ___-based.',
    ['volunteerism', 'faith'],
    'Volunteerism is unpaid service for the benefit of others and the community. Faith-based organisations (churches, mosques, temples) are one of the key types of volunteer organisations.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Health, Safety, and Violence (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Health and Safety Issues Related to Violence\n\nViolence is a major social and health challenge in South Africa. This chapter examines common acts of violence, their causes and impact, and how to find help and protection.\n\n### Common Acts of Violence\n\nViolence occurs at home, in schools, and in communities:\n\n| Setting | Types of violence |\n|---------|------------------|\n| **At home** | Domestic violence, child abuse (physical, emotional, sexual, neglect), intimate partner violence |\n| **At school** | Bullying (physical, verbal, cyberbullying), gang violence, sexual harassment, corporal punishment |\n| **In the community** | Murder, assault, robbery, gender-based violence, xenophobic attacks, gang violence |\n\n**South African statistics (awareness):**\n- SA has one of the highest murder rates in the world\n- Gender-based violence (GBV) is a national crisis — women and children are disproportionately affected\n- School violence affects learners\' ability to learn and feel safe\n- Many acts of violence go unreported due to fear, shame, or distrust of authorities'),
  t(2, '### Reasons Why Violence Occurs\n\nViolence does not happen in a vacuum. Multiple factors contribute:\n\n**In families and communities:**\n- Poverty and inequality — desperation and frustration\n- Substance abuse — alcohol and drugs impair judgement and increase aggression\n- Normalisation of violence — growing up in a violent home teaches that violence is acceptable\n- Unemployment — idle time and lack of purpose\n- Easy access to weapons (legal and illegal firearms, knives)\n\n**Among friends and peers:**\n- Gang recruitment and pressure to prove loyalty\n- Unresolved conflicts that escalate\n- Social media fuelling arguments and challenges\n- Substance use among friend groups\n\n**Broader factors:**\n- Legacy of apartheid — systemic inequality and unresolved trauma\n- Weak law enforcement and slow justice system\n- Toxic masculinity — the belief that "real men" are aggressive and dominant\n- Lack of safe spaces for young people (parks, community centres)'),
  q(3, 'Which of the following is a root cause of violence in South African communities?',
    ['Poverty, inequality, and substance abuse', 'Too many community centres and sports programmes', 'High levels of education and employment', 'Strong relationships between neighbours'], 0,
    'Poverty, inequality, and substance abuse are among the most significant root causes of violence. Community programmes, education, and strong relationships are protective factors that reduce violence.'),
  t(4, '### Impact of Violence on Individuals and Communities\n\nViolence has devastating effects:\n\n**On individuals:**\n- Physical injuries (some permanent)\n- Psychological trauma: PTSD, anxiety, depression, difficulty trusting others\n- Poor academic performance — learners who experience violence struggle to concentrate\n- Low self-esteem and feelings of hopelessness\n- Substance abuse as a way of coping with pain\n- Death in the most extreme cases\n\n**On families:**\n- Breakdown of family relationships\n- Financial burden of medical treatment and legal costs\n- Children who witness domestic violence are more likely to become victims or perpetrators\n- Loss of a breadwinner through murder or imprisonment\n\n**On communities:**\n- Climate of fear — people afraid to go outside, children afraid to walk to school\n- Economic decline — businesses close, property values drop\n- Brain drain — skilled people leave violent areas\n- Mistrust between community members and law enforcement\n- Cycle of violence — hurt people hurt people'),
  fb(5, 'The psychological condition that can develop after experiencing or witnessing violence is called ___ (abbreviation). Children who witness domestic violence are more likely to become victims or ___ of violence.',
    ['PTSD', 'perpetrators'],
    'PTSD (Post-Traumatic Stress Disorder) is a mental health condition triggered by experiencing or witnessing a traumatic event. Research shows that exposure to violence in childhood increases the risk of both experiencing and committing violence later.'),
  t(6, '### Alternatives to Violence: Problem-Solving Skills and Conflict Management\n\nViolence is never the answer. There are better ways to resolve conflict:\n\n**Conflict resolution steps:**\n1. **Cool down** — walk away until you are calm. Never try to resolve conflict when you are angry.\n2. **Listen** — hear the other person\'s perspective without interrupting\n3. **Express yourself** — use "I" statements: "I feel angry when..." rather than "You always..."\n4. **Find common ground** — look for something you both agree on\n5. **Brainstorm solutions** — think of options that work for both sides\n6. **Agree on a solution** — choose the fairest option and commit to it\n7. **Follow up** — check that the solution is working\n\n**Mediation:** A neutral third party (teacher, counsellor, peer mediator) helps both sides reach an agreement.\n\n**Peer mediation programmes:** Some South African schools train learners to mediate conflicts between other learners. This reduces violence and builds leadership skills.'),
  q(7, 'Two Grade 9 learners are about to fight over a misunderstanding. What is the BEST first step?',
    ['Both should cool down and walk away until they are calm', 'One should hit first to establish dominance', 'They should post about it on social media and let their followers decide', 'They should involve as many friends as possible to choose sides'], 0,
    'Cooling down is always the first step in conflict resolution. Trying to resolve a conflict when emotions are running high leads to escalation, not resolution. Walking away takes courage and is a sign of strength.'),
  t(8, '### Protecting Yourself and Others from Violence\n\nYou have the right to feel safe. Here is how to protect yourself:\n\n**At school:**\n- Report bullying, threats, or violence to a teacher or principal immediately\n- Do not confront an aggressor alone\n- Walk with friends rather than alone, especially after school\n- Avoid areas where violence is likely to occur\n\n**At home:**\n- If you are being abused, tell a trusted adult (teacher, neighbour, relative, social worker)\n- You are never to blame for the abuse — the abuser is responsible\n- Know your emergency numbers\n\n**In the community:**\n- Avoid walking alone at night\n- Stay away from people who carry weapons or are involved in gangs\n- Do not accept lifts from strangers\n- Trust your instincts — if something feels wrong, leave\n\n**Where to get help:**\n- SAPS Emergency: 10111\n- Childline: 0800 055 555\n- GBV Command Centre: 0800 428 428 (0800 GBV GBV)\n- Lifeline SA: 0861 322 322\n- Crime Stop: 08600 10111'),
  t(9, '### National Health and Safety Promotion Programmes\n\nSouth Africa has various programmes to address violence and promote safety:\n\n**Government programmes:**\n- National Strategic Plan on Gender-Based Violence and Femicide (NSP on GBVF)\n- School Safety Programme (Department of Basic Education)\n- Community Policing Forums (CPFs)\n- Safer Schools Call Centre: 0800 455 455\n\n**Non-governmental programmes:**\n- Sonke Gender Justice — works with men and boys to address GBV and promote gender equality\n- Childline South Africa — protects children from abuse\n- Soul City Institute — uses media to promote health and social change\n- NICRO (National Institute for Crime Prevention and the Reintegration of Offenders)\n\n**What you can do:**\n- Be part of the solution, not the problem\n- Speak out against violence — silence enables it\n- Support victims rather than blaming them\n- Join school or community safety programmes\n- Challenge harmful attitudes about gender, power, and violence'),
  q(10, 'What should you do if a friend tells you they are being abused at home?',
    ['Believe them, reassure them it is not their fault, and help them report it to a trusted adult or helpline', 'Tell them to keep it a secret because it is a family matter', 'Confront the abuser yourself', 'Post about it on social media to raise awareness'], 0,
    'When someone discloses abuse, the correct response is to believe them, reassure them that the abuse is not their fault, and help them access support through a trusted adult or helpline like Childline (0800 055 555). Keeping abuse secret allows it to continue.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Religions, Peace, and Sport Ethics (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Contributions of Religions to Peace and Sport Ethics\n\nSouth Africa is a multi-faith society. Different religions coexist side by side, and the Constitution protects the right to freedom of religion (Section 15). This chapter explores how religions contribute to promoting peace, and how ethical conduct applies to sport.\n\n### Major Religions in South Africa\n\n| Religion | Key beliefs related to peace |\n|----------|----------------------------|\n| **Christianity** | "Love your neighbour as yourself"; forgiveness and reconciliation |\n| **Islam** | "Salaam" (peace) is a core greeting; justice, charity (zakaat), and compassion |\n| **Hinduism** | Ahimsa (non-violence); respect for all living things |\n| **Judaism** | "Shalom" (peace); tikkun olam (repairing the world through good deeds) |\n| **Buddhism** | Non-violence and compassion for all beings; inner peace through meditation |\n| **African Traditional Religion** | Ubuntu, respect for ancestors, community harmony, and reconciliation rituals |\n| **Bahá\'í Faith** | Unity of humanity; world peace as a central teaching |'),
  t(2, '### How Religions Promote Peace\n\nDespite their differences, all major religions share common values that promote peace:\n\n**Shared values:**\n- Respect for human dignity\n- Compassion and care for the vulnerable\n- Justice and fairness\n- Forgiveness and reconciliation\n- Community service and charity\n\n**Examples of religious peace-building in South Africa:**\n- Archbishop Desmond Tutu led the Truth and Reconciliation Commission, guided by Christian principles of forgiveness\n- The Muslim community\'s disaster relief through organisations like Gift of the Givers\n- Hindu organisations running feeding schemes and community clinics\n- Interfaith dialogues that bring different religious communities together to resolve conflict\n- African traditional leaders using mediation and ubuntu to restore harmony\n\n**The Constitution and religion:**\n- Section 15 protects freedom of religion, belief, and opinion\n- No religion may dominate the state — SA is a secular state with religious freedom\n- Religious practices must comply with the Bill of Rights (e.g., no forced marriage of children)\n- Schools may have religious observances but must respect learners of all faiths'),
  q(3, 'Which of the following BEST describes South Africa\'s constitutional approach to religion?',
    ['SA is a secular state that protects freedom of religion for all faiths equally', 'SA has an official state religion that all citizens must follow', 'Religion is banned in public spaces', 'Only one religion is allowed to operate in South Africa'], 0,
    'The South African Constitution establishes a secular state — no religion has official status. Section 15 protects the right of every person to freedom of religion, belief, and opinion.'),
  t(4, '### Sport Ethics\n\nSport plays an important role in South African society. Ethical behaviour in sport builds character and promotes fair competition.\n\n**Key principles of sport ethics:**\n\n| Principle | What it means |\n|-----------|---------------|\n| **Fair play** | Following the rules, competing honestly, respecting the referee\'s decisions |\n| **Respect** | Treating opponents, teammates, coaches, and officials with dignity |\n| **Sportsmanship** | Being gracious in victory and dignified in defeat |\n| **Inclusion** | Welcoming players of all backgrounds, abilities, genders, and races |\n| **Anti-doping** | Not using banned substances to gain an unfair advantage |\n| **Safety** | Following safety rules to protect yourself and others |\n\n**Unethical behaviour in sport:**\n- Doping (using performance-enhancing drugs)\n- Match-fixing (deliberately losing or manipulating results for money)\n- Cheating (diving, time-wasting, deliberate fouls)\n- Racism, sexism, or homophobia directed at players or officials\n- Violence on or off the field'),
  fb(5, 'Competing honestly and following the rules is called fair ___. Using banned substances to gain an unfair advantage in sport is called ___.',
    ['play', 'doping'],
    'Fair play means competing within the rules and with integrity. Doping involves using prohibited performance-enhancing drugs, which is both unethical and illegal in sport.'),
  t(6, '### Sport Ethics in All Physical Activities\n\nEthical behaviour is not just for professional athletes — it applies to every physical activity you do:\n\n**In PE class:**\n- Give your best effort, even if sport is not your strength\n- Encourage classmates who struggle rather than mocking them\n- Follow the rules and accept the teacher\'s decisions\n- Include everyone in team activities — no one should be left out\n\n**In school sport:**\n- Represent your school with pride and integrity\n- Shake hands with opponents before and after the game\n- Accept defeat without blaming teammates or the referee\n- Celebrate victory without taunting the losing team\n\n**In community sport:**\n- Support local teams and events\n- Volunteer to coach or referee for younger players\n- Promote non-racialism and inclusion in your sports club\n\n**The role of sport in SA society:**\n- Nelson Mandela said: "Sport has the power to change the world"\n- The 1995 Rugby World Cup united a divided nation\n- Transformation policies aim to make sport accessible and representative of all South Africans\n- Sport provides opportunities for scholarships, career development, and international exposure'),
  q(7, 'A netball player deliberately trips an opponent when the umpire is not looking. Which sport ethics principle is she violating?',
    ['Fair play — she is cheating by breaking the rules deliberately', 'Inclusion — she is excluding her opponent from the game', 'Anti-doping — she is using banned substances', 'Safety — she is wearing the wrong shoes'], 0,
    'Deliberately tripping an opponent is a violation of fair play — it is intentional cheating. It also shows a lack of respect for the opponent and disregard for safety.'),
  t(8, '### Connecting Religion, Peace, and Sport\n\nReligion, peace, and sport intersect in powerful ways:\n\n**Sport as a peace-building tool:**\n- Brings people from different backgrounds together around a shared passion\n- Teaches conflict resolution skills (dealing with disagreements on the field)\n- Creates opportunities for cross-cultural interaction\n- Provides a positive outlet for energy and frustration\n\n**Religious values in sport:**\n- Ubuntu (teamwork, shared humanity)\n- Compassion (supporting an injured opponent)\n- Integrity (playing honestly even when no one is watching)\n- Humility (winning without arrogance)\n\n**Examples in South Africa:**\n- Churches and mosques running community sports leagues that bring diverse groups together\n- Faith-based organisations sponsoring young athletes from disadvantaged communities\n- Sports events that raise funds for humanitarian causes\n- School sports teams that model respect and inclusion across racial and cultural lines'),
  q(9, 'How did Nelson Mandela use sport to promote peace and unity in South Africa?',
    ['He used the 1995 Rugby World Cup to unite a racially divided nation by wearing the Springbok jersey', 'He banned all sports to focus the country on politics', 'He only supported one racial group in sports', 'He had no interest in sport'], 0,
    'Nelson Mandela famously wore a Springbok jersey at the 1995 Rugby World Cup final, a powerful symbolic act that helped bridge the racial divide. Rugby had been seen as a "white sport," and Mandela\'s gesture showed the nation could unite through sport.'),
  fb(10, 'Nelson Mandela said: "Sport has the power to change the ___." The principle of ubuntu emphasises shared ___ and community.',
    ['world', 'humanity'],
    'Mandela recognised sport\'s unique ability to transcend barriers. Ubuntu — meaning "I am because we are" — emphasises our interconnected humanity and mutual responsibility.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Depression, Grief, and Coping (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Challenging Situations: Depression, Grief, Loss, and Coping\n\nLife brings difficult experiences — the loss of a loved one, family problems, academic pressure, or feelings of hopelessness. This chapter helps you understand depression and grief, recognise when you or someone else needs help, and develop healthy coping strategies.\n\n### Understanding Depression\n\nDepression is more than feeling sad. It is a mental health condition that affects how you think, feel, and function:\n\n**Signs of depression:**\n- Persistent sadness or emptiness lasting more than two weeks\n- Loss of interest in activities you used to enjoy\n- Changes in appetite (eating too much or too little)\n- Sleep problems (insomnia or sleeping too much)\n- Difficulty concentrating or making decisions\n- Fatigue and lack of energy\n- Feelings of worthlessness or excessive guilt\n- Withdrawal from friends and family\n- In severe cases, thoughts of self-harm or suicide\n\n**Important:** Depression is a medical condition, not a weakness. It can affect anyone regardless of age, gender, or background. It is treatable with professional help.'),
  t(2, '### Causes of Depression\n\nDepression is usually caused by a combination of factors:\n\n| Factor | Examples |\n|--------|----------|\n| **Biological** | Chemical imbalances in the brain, family history of depression |\n| **Psychological** | Low self-esteem, negative thinking patterns, perfectionism |\n| **Social** | Bullying, isolation, relationship problems, social media pressure |\n| **Situational** | Loss of a loved one, parents\' divorce, moving to a new school, academic failure |\n| **Environmental** | Poverty, violence, unstable home environment |\n\n**Depression in South African youth:**\n- Academic pressure (especially in Grade 9 when subject choices must be made)\n- Poverty and food insecurity\n- Exposure to violence and crime\n- Loss of parents or caregivers to HIV/AIDS\n- Substance abuse\n- Cyberbullying and social media comparison'),
  q(3, 'Thabo has been feeling sad and empty for three weeks. He no longer plays soccer, struggles to concentrate in class, and sleeps most of the day. What might Thabo be experiencing?',
    ['Depression — his symptoms have persisted for more than two weeks and affect his daily life', 'Normal teenage moodiness that will pass on its own', 'Laziness and a lack of willpower', 'A physical illness with no mental health component'], 0,
    'Persistent sadness lasting more than two weeks, loss of interest in activities, concentration problems, and excessive sleeping are key signs of depression. This is a medical condition requiring professional support, not simply laziness or moodiness.'),
  t(4, '### Grief and Loss\n\nGrief is the natural emotional response to losing someone or something important to you:\n\n**Common causes of grief:**\n- Death of a family member, friend, or pet\n- Parents\' separation or divorce\n- Moving away from friends and a familiar community\n- Loss of health (illness or disability)\n- End of a friendship or relationship\n\n**The stages of grief (Kübler-Ross model):**\n1. **Denial** — "This cannot be happening"\n2. **Anger** — "This is so unfair!"\n3. **Bargaining** — "If only I had done something differently..."\n4. **Depression** — Deep sadness and withdrawal\n5. **Acceptance** — Coming to terms with the loss\n\n**Important notes:**\n- Not everyone goes through every stage or in this order\n- Grief is not a linear process — you may move back and forth between stages\n- There is no "correct" timeline for grief — everyone processes loss differently\n- Cultural and religious practices (funerals, memorial services, rituals) help many people process grief\n- In some South African cultures, mourning periods and ancestral rituals play an important role'),
  fb(5, 'The five stages of grief are denial, anger, bargaining, depression, and ___. Grief is the natural emotional response to ___.',
    ['acceptance', 'loss'],
    'The Kübler-Ross model identifies five stages: denial, anger, bargaining, depression, and acceptance. Grief is a natural response to losing someone or something important.'),
  t(6, '### Trauma\n\nTrauma results from experiencing or witnessing a deeply distressing event:\n\n**Common sources of trauma for South African youth:**\n- Witnessing or experiencing violence (domestic violence, community violence, school violence)\n- Sexual abuse or assault\n- Car accidents\n- Natural disasters\n- Loss of a caregiver\n- Living in a chronically unsafe environment\n\n**Signs of trauma in young people:**\n- Flashbacks or nightmares about the event\n- Being easily startled or always on edge\n- Avoiding people, places, or situations that remind them of the event\n- Emotional numbness or detachment\n- Angry outbursts or aggressive behaviour\n- Difficulty sleeping or concentrating\n- Regression (behaving younger than their age)\n\n**Trauma is NOT the person\'s fault.** No one chooses to be traumatised, and healing requires support and professional help.'),
  q(7, 'Which of the following is a healthy way to cope with grief or loss?',
    ['Talking to a trusted person about your feelings and allowing yourself time to grieve', 'Pretending nothing happened and refusing to talk about it', 'Using alcohol or drugs to numb the pain', 'Isolating yourself completely from everyone'], 0,
    'Healthy coping involves acknowledging your feelings, talking to someone you trust, and giving yourself time. Suppressing emotions, substance abuse, and isolation are unhealthy coping strategies that can lead to further problems.'),
  t(8, '### Counterproductive Coping Strategies\n\nSome coping strategies may feel good in the moment but make things worse over time:\n\n**Using alcohol and drugs:**\n- Substances numb pain temporarily but do not solve the problem\n- They can lead to addiction, worsening depression, and risky behaviour\n- Alcohol is a depressant — it actually makes depression worse\n- In SA, alcohol abuse among young people is a major concern\n\n**Other counterproductive strategies:**\n- Self-harm (cutting, burning) — provides temporary relief but causes physical damage and shame\n- Binge eating or starving yourself\n- Withdrawing completely from all social contact\n- Aggressive behaviour or taking anger out on others\n- Denial — pretending the problem does not exist\n- Excessive screen time or gaming as an escape from reality\n\n**Why these do not work:**\n- They avoid the real issue rather than addressing it\n- They create new problems (addiction, health issues, damaged relationships)\n- They prevent you from developing real coping skills\n- They can lead to a downward spiral that is harder to break'),
  t(9, '### Healthy Coping Strategies and Where to Find Help\n\n**Healthy coping strategies:**\n- **Talk to someone** — a parent, teacher, school counsellor, religious leader, or friend\n- **Exercise** — physical activity releases endorphins that improve mood\n- **Creative expression** — writing, drawing, music, or dance can help process emotions\n- **Maintain a routine** — structure provides stability during difficult times\n- **Get enough sleep** — sleep is essential for emotional regulation\n- **Practise deep breathing and relaxation** — calms the nervous system\n- **Limit social media** — comparison and negativity online worsen mental health\n- **Join a support group** — connecting with others who understand your experience\n\n**Where to find help in South Africa:**\n- SADAG (SA Depression and Anxiety Group): 0800 567 567 (24-hour helpline)\n- Childline: 0800 055 555\n- Lifeline SA: 0861 322 322\n- Suicide Crisis Helpline: 0800 567 567\n- School counsellors and teachers\n- Government clinic psychologists and social workers\n\n**Remember:** Asking for help is a sign of strength, not weakness. You do not have to face difficult times alone.'),
  q(10, 'Why is using alcohol to cope with depression considered counterproductive?',
    ['Alcohol is a depressant that worsens depression, can lead to addiction, and prevents real healing', 'Alcohol is expensive and learners cannot afford it', 'Alcohol has no effect on mental health', 'Alcohol only becomes counterproductive after age 40'], 0,
    'Alcohol is a central nervous system depressant. While it may temporarily numb emotional pain, it worsens depression, impairs judgement, can lead to addiction, and prevents the person from developing healthy coping skills.'),
  fb(11, 'The organisation that operates South Africa\'s 24-hour depression helpline is ___ (abbreviation). Alcohol is classified as a ___, meaning it slows down the nervous system and worsens depression.',
    ['SADAG', 'depressant'],
    'SADAG (South African Depression and Anxiety Group) operates the 24-hour helpline 0800 567 567. Alcohol is a central nervous system depressant — it slows brain activity and can worsen symptoms of depression.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Study and Career Funding / Lifelong Learning (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Study and Career Funding and Lifelong Learning\n\nAs you approach the end of Grade 9 and begin thinking about your future, understanding how to fund your studies and the importance of lifelong learning will help you plan ahead.\n\n### Study and Career Funding Providers\n\nFunding for further studies is available from various sources:\n\n| Provider | What they offer |\n|----------|----------------|\n| **NSFAS** (National Student Financial Aid Scheme) | Bursaries for qualifying students at public universities and TVET colleges — covers tuition, accommodation, meals, books, and transport |\n| **Funza Lushaka** | Bursary for students who want to become teachers — pays for the full cost of study in exchange for teaching at a public school |\n| **SETAs** (Sector Education and Training Authorities) | Bursaries and learnerships in specific industries (e.g., MICT SETA for IT, CETA for construction) |\n| **Corporate bursaries** | Companies like Sasol, Eskom, AngloGold, MTN, and banks offer bursaries in fields they need skills in |\n| **University bursaries** | Universities offer merit-based and need-based scholarships |\n| **Provincial government** | Provincial education departments offer bursaries for scarce skills |\n| **Private foundations** | Allan Gray Orbis Foundation, Ikusasa Student Financial Aid Programme (ISFAP) |'),
  t(2, '### How to Apply for Funding\n\nApplying for bursaries and financial aid requires planning and organisation:\n\n**General requirements:**\n- South African identity document (or birth certificate for minors)\n- Academic records (school reports)\n- Proof of household income (payslips, SASSA letter, affidavit)\n- Proof of registration or acceptance at a higher education institution\n- Completed application form\n\n**NSFAS application tips:**\n- Apply online at www.nsfas.org.za\n- Applications usually open in September/October for the following year\n- You do not need to be accepted at a university first — you can apply while still in Grade 12\n- NSFAS is for students from households earning below R350 000 per year\n- Keep copies of all documents submitted\n\n**General bursary application tips:**\n- Start searching early — many bursaries close months before the academic year\n- Apply to multiple bursaries — do not rely on one\n- Read the requirements carefully — each bursary has different criteria\n- Write a strong motivational letter explaining why you deserve the bursary\n- Proofread your application — errors create a bad impression\n- Check your email regularly for responses'),
  q(3, 'Sipho comes from a household that earns R200 000 per year. He wants to study engineering at a public university. Which funding source should he apply to FIRST?',
    ['NSFAS — because his household income is below the R350 000 threshold', 'He should take a bank loan at high interest', 'He should not study because he cannot afford it', 'He should wait for someone to offer him a bursary without applying'], 0,
    'NSFAS is the primary funding source for students from low-income households (below R350 000/year) at public universities and TVET colleges. Sipho qualifies and should apply online at www.nsfas.org.za.'),
  t(4, '### Goal-Setting for Lifelong Learning\n\nLearning does not end when you finish school or university. Lifelong learning is the continuous pursuit of knowledge and skills throughout your life:\n\n**Why lifelong learning matters:**\n- The world of work is changing rapidly — new technologies, new industries, new job roles\n- Skills that are valuable today may be outdated in 10 years\n- People who keep learning stay employable and can adapt to change\n- Learning keeps your mind sharp and improves quality of life\n\n**Forms of lifelong learning:**\n- Formal education (degrees, diplomas, certificates)\n- Short courses and online learning (Coursera, edX, FutureLearn, Google Certificates)\n- Workplace training and professional development\n- Self-directed learning (reading, YouTube tutorials, podcasts)\n- Mentorship and coaching\n- Community workshops and seminars\n\n**Setting a lifelong learning plan:**\n1. Identify your career goals for the next 5, 10, and 20 years\n2. Determine what skills and qualifications you need for each stage\n3. Research where and how you can gain those skills\n4. Create a timeline with milestones\n5. Review and update your plan regularly as your goals evolve'),
  fb(5, 'The continuous pursuit of knowledge and skills throughout life is called ___ learning. The government funding scheme for university and TVET students is called ___.',
    ['lifelong', 'NSFAS'],
    'Lifelong learning means continuously developing your knowledge and skills throughout your entire life, not just during formal schooling. NSFAS (National Student Financial Aid Scheme) is South Africa\'s main government funding source for higher education.'),
  t(6, '### Planning for Your Own Lifelong Learning\n\nAs a Grade 9 learner, you are at the start of your lifelong learning journey. Here is how to plan:\n\n**Short-term (Grade 9–12):**\n- Choose the right FET subjects to keep career doors open\n- Develop strong study habits and time-management skills\n- Participate in extracurricular activities that develop leadership and teamwork\n- Volunteer in your community to build experience\n- Research careers and post-school options\n\n**Medium-term (after matric):**\n- Apply for bursaries and financial aid well in advance\n- Choose a field of study that matches your strengths and interests\n- Gain practical experience through internships, learnerships, or part-time work\n- Develop digital literacy — learn to use computers, the internet, and relevant software\n\n**Long-term (throughout your career):**\n- Stay current with developments in your field\n- Take short courses to upgrade your skills\n- Network with professionals and mentors\n- Be open to career changes — the average person changes careers several times\n- Give back by mentoring younger people'),
  q(7, 'Why is lifelong learning especially important in the 21st century?',
    ['Because technology and job markets change rapidly, requiring continuous skill development', 'Because school education is completely useless', 'Because employers do not value formal qualifications anymore', 'Because everyone must have a university degree to find work'], 0,
    'The 21st century is characterised by rapid technological change, globalisation, and evolving job markets. Skills that are in demand today may be obsolete tomorrow, making continuous learning essential for career success.'),
  t(8, '### Bringing It All Together: Your Plan for the Future\n\nAs you finish Grade 9, take time to reflect on what you have learned in Life Orientation this year:\n\n**About yourself:**\n- Your strengths, interests, and values\n- Your goals (short-term, medium-term, long-term)\n- How to make informed decisions and resist peer pressure\n- How to manage your time and study effectively\n\n**About your health:**\n- The importance of healthy lifestyle choices\n- How to protect yourself from HIV, STIs, and teenage pregnancy\n- How to recognise and cope with depression and grief\n- Where to find help when you need it\n\n**About your rights:**\n- Your constitutional rights and responsibilities\n- How to respect the rights of others, including people with disabilities and HIV/AIDS\n- How to deal with violence and protect yourself\n\n**About your future:**\n- Career options and subject choices for Grade 10\n- How to fund your studies after matric\n- The importance of lifelong learning\n- Your role as a responsible South African citizen'),
  q(9, 'What is the MOST important thing a Grade 9 learner should do to prepare for a successful future?',
    ['Make informed subject choices based on career research, and develop strong study and life skills', 'Choose the easiest subjects to get the highest marks', 'Wait until Grade 12 to start thinking about the future', 'Focus only on sport and social life during high school'], 0,
    'Making informed subject choices based on career research is critical because these choices determine which careers are accessible. Combined with strong study habits and life skills, this gives the best foundation for future success.'),
  fb(10, 'The Funza Lushaka bursary is specifically for learners who want to become ___. When applying for bursaries, you should always write a strong ___ letter.',
    ['teachers', 'motivational'],
    'Funza Lushaka funds students studying to become teachers at public schools. A motivational letter explains why you deserve the bursary and demonstrates your commitment and passion.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create Grade 9
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

  // Look up or create the Life Orientation subject
  let subjectDoc = await db.collection('subjects').findOne({ name: /Life.*Orient/i, schoolId: SCHOOL_ID });
  let SUBJECT_ID;

  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Life Orientation subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Life Orientation',
      code: 'LO',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Life Orientation subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Goal-Setting and Lifestyle Choices',
      description: 'SMART goal-setting, short/medium/long-term goals, personal lifestyle choices, influences on lifestyle choices (media, environment, peers, family, culture, religion, community), assertiveness, and informed decision-making skills.',
      order: 1,
      lessons: [
        { title: 'Goal-Setting and Lifestyle Choices', description: 'SMART goal-setting, types of goals, healthy and unhealthy lifestyle choices, influences on personal choices, assertiveness skills, and informed decision-making.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Sexual Behaviour and Sexual Health',
      description: 'Risk factors leading to unhealthy sexual behaviour, consequences including teenage pregnancy, STIs, and HIV/AIDS, protective factors, and community support structures.',
      order: 2,
      lessons: [
        { title: 'Sexual Behaviour and Sexual Health', description: 'Risk factors for unhealthy sexual behaviour, teenage pregnancy, STIs, HIV/AIDS transmission and prevention, protective factors, and community support resources.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Time Management and Study Skills',
      description: 'Time-management skills, accountability in carrying out responsibilities, reading and writing for different purposes, and using time effectively and efficiently.',
      order: 3,
      lessons: [
        { title: 'Time Management and Study Skills', description: 'The time-management matrix, organising time, accountability, reading techniques (skimming, scanning, detailed, critical), writing skills, and effectiveness vs. efficiency.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Constitutional Rights and Responsibilities',
      description: 'Citizens\' rights and responsibilities, respect for people with disabilities and HIV/AIDS, constitutional values, positive and negative role models, and celebrations of national and international days.',
      order: 4,
      lessons: [
        { title: 'Constitutional Rights and Responsibilities', description: 'Bill of Rights, respecting rights of people with disabilities and HIV/AIDS, constitutional values (dignity, equality, ubuntu), role models, and national/international days.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Career Options After Grade 9',
      description: 'Options after Grade 9 (NSC and NCV pathways), implications of choices, rights and responsibilities in the workplace, opportunities in the world of work, and choosing subjects for Grade 10.',
      order: 5,
      lessons: [
        { title: 'Career Options After Grade 9', description: 'NSC vs NCV pathways, implications of each choice, workplace rights and responsibilities, key labour laws, growing career fields, 4IR, and FET subject choices.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Career and Subject Choices',
      description: 'Subjects in Grades 10–12 and related careers, strengths and weaknesses, decision-making for subject choices, and volunteerism.',
      order: 6,
      lessons: [
        { title: 'Career and Subject Choices', description: 'FET subjects and career links, identifying strengths and interests, decision-making for subject choices, volunteerism and community responsibility.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Health and Safety Issues Related to Violence',
      description: 'Common acts of violence at home, school, and community, causes and impact of violence, conflict resolution and problem-solving skills, protection from violence, and national safety programmes.',
      order: 7,
      lessons: [
        { title: 'Health and Safety Issues Related to Violence', description: 'Types of violence, causes of violence in SA, impact on individuals and communities, conflict resolution, protecting yourself, and national health and safety programmes.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Religions, Peace, and Sport Ethics',
      description: 'Contributions of different religions to promoting peace, constitutional protection of religious freedom, sport ethics and fair play in all physical activities.',
      order: 8,
      lessons: [
        { title: 'Religions, Peace, and Sport Ethics', description: 'Major religions in SA and their peace values, interfaith dialogue, sport ethics principles (fair play, respect, inclusion, anti-doping), and sport as a peace-building tool.', blocks: ch8_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 9: Depression, Grief, and Coping',
      description: 'Understanding depression, grief and the stages of loss, trauma, counterproductive coping strategies (substance abuse), healthy coping strategies, and where to find help.',
      order: 9,
      lessons: [
        { title: 'Depression, Grief, and Coping', description: 'Signs and causes of depression, stages of grief, trauma, counterproductive coping (alcohol, drugs, self-harm), healthy coping strategies, and SA helplines and support.', blocks: ch9_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 10: Study and Career Funding and Lifelong Learning',
      description: 'Study and career funding providers (NSFAS, Funza Lushaka, SETAs, corporate bursaries), how to apply for funding, goal-setting for lifelong learning, and planning for the future.',
      order: 10,
      lessons: [
        { title: 'Study and Career Funding and Lifelong Learning', description: 'Funding sources (NSFAS, Funza Lushaka, SETAs, corporate bursaries), application process, lifelong learning, and planning short/medium/long-term education and career goals.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 9 Life Orientation \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Goal-Setting, Sexual Health, Time Management, Constitutional Rights, Career Options, Subject Choices, Violence, Religions and Sport Ethics, Depression and Coping, and Study Funding for the Grade 9 Life Orientation curriculum.',
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
  console.log('  TEXTBOOK: Grade 9 Life Orientation');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
