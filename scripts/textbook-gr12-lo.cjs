const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642');

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
// CHAPTER 1: Stress and Crisis Management (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Stress and Crisis Management\n\nStress is the body and mind\'s response to demands, threats, or changes in life. As a Grade 12 learner in South Africa, you face unique pressures: NSC exams, career decisions, financial pressures, load-shedding disruptions, and community challenges. Learning to manage stress is a critical life skill.\n\n### What Is Stress?\n\nStress is the physical and emotional reaction that occurs when the demands placed on you exceed your ability to cope. It triggers a "fight or flight" response in the body, releasing hormones like cortisol and adrenaline.'),
  t(2, '### Types of Stressors\n\nStressors are events or conditions that cause stress. They fall into four categories:\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Physical** | Stressors affecting the body | Illness, lack of sleep, poor nutrition, substance abuse, excessive exercise |\n| **Emotional** | Stressors affecting feelings and mental health | Fear of failure, grief, low self-esteem, anxiety about the future |\n| **Social** | Stressors arising from relationships and community | Peer pressure, bullying, family conflict, breakups, social media comparison |\n| **Environmental** | Stressors from surroundings | Poverty, crime, overcrowding, noise, load-shedding, lack of resources at school |'),
  q(3, 'Sipho is anxious about his matric results affecting his NSFAS application. What type of stressor is this?',
    ['Emotional', 'Physical', 'Social', 'Environmental'], 0,
    'Anxiety about the future and fear of failure are emotional stressors. They affect Sipho\'s feelings and mental state rather than his body or relationships.'),
  t(4, '### Positive and Negative Stress\n\n**Eustress (positive stress):**\n- Motivates you to prepare and perform\n- Gives you energy and focus before an exam or sports match\n- Is short-term and feels manageable\n- Example: The butterflies before presenting your CAT at school\n\n**Distress (negative stress):**\n- Overwhelms your ability to cope\n- Causes physical symptoms (headaches, insomnia, stomach problems)\n- Can lead to anxiety, depression, or burnout\n- Example: Feeling paralysed by the volume of matric work\n\nThe same event can cause eustress for one person and distress for another. The difference lies in how you **perceive** the situation and what **coping resources** you have.'),
  fb(5, 'Positive stress that motivates you is called ___. Negative stress that overwhelms you is called ___.',
    ['eustress', 'distress'],
    'Eustress is healthy stress that drives performance. Distress is harmful stress that impairs functioning.'),
  t(6, '### Signs and Symptoms of Stress\n\n| Physical signs | Emotional signs | Behavioural signs | Cognitive signs |\n|---------------|----------------|-------------------|----------------|\n| Headaches | Irritability | Withdrawal from friends | Difficulty concentrating |\n| Muscle tension | Feeling overwhelmed | Change in eating habits | Forgetfulness |\n| Fatigue | Mood swings | Substance use or increase | Negative thinking |\n| Stomach problems | Anxiety | Aggression | Poor decision-making |\n| Sleep problems | Sadness | Neglecting responsibilities | Racing thoughts |\n| Rapid heartbeat | Low motivation | Excessive sleeping | Inability to focus on studies |\n\nRecognising these signs early is the first step toward managing stress effectively.'),
  q(7, 'Which of the following is a cognitive sign of stress?',
    ['Difficulty concentrating', 'Stomach problems', 'Withdrawal from friends', 'Irritability'], 0,
    'Difficulty concentrating is a cognitive (thinking-related) sign. Stomach problems are physical, withdrawal is behavioural, and irritability is emotional.'),
  t(8, '### Coping Mechanisms and Management Techniques\n\n**Healthy coping strategies:**\n- **Physical activity:** Exercise releases endorphins that reduce stress\n- **Time management:** Create a study timetable, break tasks into smaller steps\n- **Social support:** Talk to trusted friends, family, or a school counsellor\n- **Relaxation techniques:** Deep breathing, meditation, progressive muscle relaxation\n- **Positive self-talk:** Replace "I can not do this" with "I will take it one step at a time"\n- **Balanced lifestyle:** Adequate sleep (8 hours), healthy eating, leisure activities\n\n**Unhealthy coping strategies (to avoid):**\n- Substance abuse (alcohol, drugs)\n- Avoidance and procrastination\n- Aggression or taking stress out on others\n- Isolation and withdrawal\n- Overeating or undereating'),
  t(9, '### Developing Your Own Stress Management Strategy\n\nA personal stress management plan should include:\n\n1. **Identify your stressors:** Write down what causes you the most stress (exams, finances, relationships)\n2. **Recognise your signs:** Know your personal warning signs (headaches, irritability, etc.)\n3. **Choose your techniques:** Pick 3-4 healthy strategies that work for you\n4. **Build a support network:** Identify 2-3 people you can turn to\n5. **Set boundaries:** Learn to say no to excessive demands\n6. **Review and adjust:** Your plan should evolve as your circumstances change\n\n**South African support resources:**\n- SADAG (SA Depression and Anxiety Group): 0800 567 567\n- Childline: 0800 055 555\n- Lifeline SA: 0861 322 322\n- Your school counsellor or Life Orientation teacher'),
  q(10, 'Which of the following is an unhealthy way of coping with matric exam stress?',
    ['Using alcohol to relax before studying', 'Creating a study timetable', 'Talking to a school counsellor', 'Practising deep breathing exercises'], 0,
    'Using alcohol is an unhealthy coping mechanism. It may provide temporary relief but worsens stress, impairs memory, and can lead to dependence.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Conflict Resolution (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Conflict Resolution\n\nConflict is a disagreement or struggle between two or more parties with opposing needs, ideas, or values. Conflict is a normal part of life, but how you handle it determines whether it is constructive (leads to growth) or destructive (causes harm).\n\n### Interpersonal vs Intrapersonal Conflict\n\n| Type | Definition | Examples |\n|------|-----------|----------|\n| **Interpersonal** | Conflict between two or more people | Arguments with friends, family disputes, disagreements with teachers, workplace conflict |\n| **Intrapersonal** | Conflict within yourself | Choosing between studying and socialising, moral dilemmas, value conflicts, career indecision |'),
  t(2, '### Conflict Resolution Styles\n\nThomas-Kilmann identified five main approaches to handling conflict:\n\n| Style | Description | When appropriate | Drawback |\n|-------|------------|-----------------|----------|\n| **Competing** | Asserting your position at the expense of others | Emergencies, when rights are at stake | Damages relationships, creates resentment |\n| **Compromising** | Each party gives up something to reach a middle ground | When time is limited, when both sides have equal power | Neither side is fully satisfied |\n| **Accommodating** | Giving in to the other person\'s needs | When the issue matters more to the other person, preserving harmony | Your own needs are neglected |\n| **Collaborating** | Working together to find a win-win solution | Complex issues, when relationships matter, when time allows | Time-consuming |\n| **Avoiding** | Withdrawing from or postponing the conflict | When emotions are high and time is needed to cool down | Issues remain unresolved |'),
  q(3, 'Thandi and Lerato both want to be the group leader for a school project. They decide that Thandi will lead the research phase and Lerato will lead the presentation phase. Which conflict resolution style is this?',
    ['Collaborating', 'Compromising', 'Accommodating', 'Competing'], 0,
    'This is collaboration because both parties worked together to find a solution where both get their needs met (a win-win). Compromising would mean one gives up being leader entirely in exchange for something else.'),
  t(4, '### The Role of Communication in Conflict Resolution\n\nEffective communication is the foundation of resolving conflict:\n\n**Active listening:**\n- Give the speaker your full attention\n- Do not interrupt\n- Reflect back what you heard: "So what you are saying is..."\n- Ask clarifying questions\n\n**"I" statements vs "You" statements:**\n- **Wrong:** "You never listen to me!" (accusatory, triggers defensiveness)\n- **Right:** "I feel unheard when I am interrupted" (expresses your feelings without blaming)\n\n**Non-verbal communication:**\n- Maintain appropriate eye contact\n- Keep an open body posture (uncrossed arms)\n- Use a calm, respectful tone of voice\n- Be aware of cultural differences in non-verbal communication in South Africa\'s diverse society'),
  fb(5, 'A conflict within yourself about a difficult decision is called ___ conflict. A conflict between two people is called ___ conflict.',
    ['intrapersonal', 'interpersonal'],
    'Intrapersonal = within one person (intra = within). Interpersonal = between people (inter = between).'),
  t(6, '### Beliefs, Attitudes, and Values in Conflict\n\nConflict often arises from differences in:\n\n- **Beliefs:** What you accept as true (religious beliefs, political views, cultural practices)\n- **Attitudes:** Your feelings and dispositions toward people or situations (prejudice, stereotypes)\n- **Values:** What you consider important (honesty, respect, freedom, equality)\n\nIn South Africa, with its diverse cultures, languages, and histories, understanding and respecting different beliefs and values is essential. The Constitution (Section 15) protects freedom of religion, belief, and opinion, while also prohibiting unfair discrimination.\n\n**How values affect conflict:**\n- When people have different values, they may interpret the same situation differently\n- Respecting diversity does not mean agreeing with everything, but it means engaging respectfully\n- Ubuntu ("I am because we are") encourages resolving conflict through community and shared humanity'),
  q(7, 'In the context of conflict resolution, what is the main benefit of using "I" statements?',
    ['They express your feelings without blaming the other person', 'They help you win the argument faster', 'They show the other person they are wrong', 'They avoid the conflict entirely'], 0,
    '"I" statements focus on your own feelings and needs rather than accusing or blaming the other person, which reduces defensiveness and opens up constructive dialogue.'),
  t(8, '### Personality Types and Conflict\n\nYour personality influences how you handle conflict:\n\n- **Assertive personality:** Expresses needs clearly and respectfully, listens to others. Best for collaboration.\n- **Aggressive personality:** Dominates, intimidates, dismisses others. Tends toward competing.\n- **Passive personality:** Avoids confrontation, gives in easily. Tends toward accommodating or avoiding.\n- **Passive-aggressive personality:** Appears to agree but undermines through indirect actions.\n\nThe goal is to develop **assertiveness** \u2014 standing up for your rights while respecting others. Assertiveness is a skill that can be learned and practised.'),
  t(9, '### Steps for Resolving Conflict Constructively\n\n1. **Cool down:** Take time to manage your emotions before engaging\n2. **Define the problem:** What is the actual issue? Separate the person from the problem\n3. **Listen to all sides:** Use active listening to understand each perspective\n4. **Identify shared goals:** Find common ground\n5. **Brainstorm solutions:** Generate multiple options together\n6. **Agree on a solution:** Choose the option that best meets everyone\'s needs\n7. **Follow through:** Implement the solution and check that it is working\n\nIf you cannot resolve the conflict yourselves, seek **mediation** from a neutral third party (teacher, counsellor, community elder). In South Africa, the Commission for Conciliation, Mediation and Arbitration (CCMA) handles workplace disputes.'),
  q(10, 'Which conflict resolution style would be MOST appropriate when a group of learners needs to quickly decide on a topic for a project due tomorrow?',
    ['Compromising', 'Collaborating', 'Avoiding', 'Accommodating'], 0,
    'Compromising is best when time is limited. Collaborating would be ideal but takes too long when the deadline is tomorrow. A quick compromise ensures everyone gives a little and the group can move forward.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Relationships and Change (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Relationships and Change\n\nAs a Grade 12 learner, you are at a pivotal transition point. You are moving from the structured world of school into adulthood \u2014 whether that means university, college, the workplace, or entrepreneurship. This transition affects every relationship in your life.\n\n### The Importance of Positive Relationships\n\nPositive relationships:\n- Provide emotional support during stressful times\n- Help build self-esteem and confidence\n- Offer practical help and advice\n- Create a sense of belonging\n- Improve mental and physical health\n\nResearch shows that people with strong social connections are more resilient, perform better academically, and cope better with life changes.'),
  t(2, '### Initiating, Building, and Sustaining Relationships\n\n**Initiating relationships:**\n- Be approachable and show genuine interest in others\n- Find common ground (shared interests, goals, experiences)\n- Take the first step \u2014 introduce yourself, ask questions, offer help\n\n**Building relationships:**\n- Invest time and effort\n- Be reliable and keep your promises\n- Share experiences and be vulnerable\n- Show appreciation and gratitude\n\n**Sustaining relationships:**\n- Communicate regularly and honestly\n- Resolve conflicts constructively (see Chapter 2)\n- Adapt to changes in each other\'s lives\n- Respect boundaries and personal space\n- Support each other\'s growth, even when it means growing apart'),
  q(3, 'Which of the following best describes how to sustain a healthy friendship during the transition from school to post-school life?',
    ['Communicate regularly and adapt to changes in each other\'s lives', 'Insist on seeing each other every day as before', 'Avoid discussing feelings about the changes ahead', 'Only maintain friendships with people going to the same institution'], 0,
    'Sustaining relationships during transition requires adapting to change, maintaining communication, and accepting that the nature of the relationship may evolve.'),
  t(4, '### The Transition from School to Post-School Life\n\nThis transition brings major changes in:\n\n| Area | School life | Post-school life |\n|------|-----------|------------------|\n| **Structure** | Timetable provided, teachers guide you | You create your own schedule and manage your time |\n| **Relationships** | Daily contact with school friends | Friends may scatter to different cities or institutions |\n| **Responsibility** | Parents/guardians make many decisions | You make your own decisions and face consequences |\n| **Identity** | Defined by school roles (prefect, sportsperson) | Must discover new roles and sense of self |\n| **Finances** | Dependent on parents | May need to manage NSFAS funds, part-time work income, or budget independently |\n| **Support** | Immediate access to teachers and counsellors | Must seek out support services proactively |'),
  t(5, '### Adapting to Growth and Change\n\n**Personal growth:**\n- Your values, interests, and goals will evolve\n- Growth sometimes means outgrowing old patterns or relationships\n- Self-reflection helps you understand who you are becoming\n\n**Social change:**\n- Friendship groups may shift as people follow different paths\n- Romantic relationships face new pressures (distance, different environments)\n- Family dynamics change as you become more independent\n\n**Work-related change:**\n- The world of work is constantly evolving (technology, globalisation)\n- Adaptability and willingness to learn are more important than any single qualification\n- South Africa\'s high unemployment rate (especially among youth) means you may need to be creative and resilient in finding opportunities'),
  fb(6, 'The ability to recover from setbacks and adapt to change is called ___. The South African philosophy of shared humanity is called ___.',
    ['resilience', 'ubuntu'],
    'Resilience is the capacity to bounce back from adversity. Ubuntu is the Nguni philosophy meaning "I am because we are," emphasising community and interconnectedness.'),
  t(7, '### Communicating Feelings Effectively\n\nOpen communication about feelings is essential during times of change:\n\n**Why people struggle to communicate feelings:**\n- Fear of being judged or rejected\n- Cultural norms that discourage emotional expression (e.g., "men do not cry")\n- Lack of vocabulary for emotions\n- Past negative experiences when being vulnerable\n\n**How to communicate feelings effectively:**\n- Name the emotion specifically: "I feel anxious" is more useful than "I feel bad"\n- Explain the trigger: "I feel anxious when I think about leaving home"\n- Express what you need: "I need reassurance that we will stay in touch"\n- Choose the right time and place for serious conversations\n- Be open to hearing the other person\'s feelings too'),
  q(8, 'Bongani is struggling with the idea of moving to a new city for university. His friends tell him to "just be strong." Why is this response unhelpful?',
    ['It dismisses his feelings and discourages him from seeking proper support', 'It is good advice that will help him cope', 'It shows that his friends do not care about him at all', 'It means he should not go to university'], 0,
    'Telling someone to "just be strong" invalidates their emotions and creates a barrier to seeking help. A better response would be to acknowledge his feelings and offer support.'),
  t(9, '### Understanding Others\n\nEmpathy is the ability to understand and share another person\'s feelings. It is different from sympathy (feeling sorry for someone).\n\n**Building empathy:**\n- Listen without judgement\n- Try to see the situation from the other person\'s perspective\n- Ask: "How would I feel in their position?"\n- Acknowledge cultural and socio-economic differences that shape people\'s experiences\n- Remember that everyone has their own struggles, even if they are not visible\n\nIn South Africa\'s diverse society, empathy across cultures, languages, and socio-economic backgrounds is especially important. Understanding the different realities faced by people in urban vs rural areas, different economic situations, and different cultural backgrounds strengthens social cohesion.'),
  q(10, 'What is the key difference between empathy and sympathy?',
    ['Empathy means understanding and sharing someone\'s feelings; sympathy means feeling sorry for them from a distance', 'They mean the same thing', 'Sympathy is deeper than empathy', 'Empathy only applies to close friends'], 0,
    'Empathy involves truly understanding another person\'s experience by putting yourself in their shoes. Sympathy is feeling pity or sorrow for someone without necessarily understanding their experience.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Study Skills (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Study Skills for the NSC\n\nThe National Senior Certificate (NSC) examinations are the culmination of your school career. Success requires not just knowledge but effective study strategies, time management, and exam-writing skills.\n\n### Developing a Study Plan\n\nA study plan helps you:\n- Cover all subjects systematically\n- Avoid last-minute cramming\n- Balance study with rest and recreation\n- Track your progress\n\n**Steps to create your study plan:**\n1. List all your subjects and the dates of each exam\n2. Work backwards from each exam date\n3. Prioritise subjects where you need the most improvement\n4. Allocate specific time slots for each subject\n5. Include breaks (every 45-60 minutes, take a 10-minute break)\n6. Build in revision days before each exam\n7. Be realistic \u2014 do not overload yourself'),
  t(2, '### Study Strategies and Styles\n\nDifferent learners have different learning styles. Knowing yours helps you study more effectively:\n\n| Learning style | Characteristics | Best strategies |\n|---------------|----------------|------------------|\n| **Visual** | Learn best by seeing | Mind maps, diagrams, colour-coding, flashcards, videos |\n| **Auditory** | Learn best by hearing | Reading aloud, recording notes and listening, group discussions, teaching others |\n| **Reading/Writing** | Learn best through text | Summarising notes, rewriting key concepts, making lists, reading textbooks |\n| **Kinaesthetic** | Learn best by doing | Practice exercises, role-play, hands-on activities, walking while revising |\n\nMost people use a combination of styles. Experiment to find what works best for you.'),
  q(3, 'Which study strategy would be MOST effective for a visual learner revising Life Orientation?',
    ['Creating mind maps of key concepts with colour-coded branches', 'Listening to a recording of their notes', 'Writing out summaries repeatedly', 'Walking around while reading aloud'], 0,
    'Visual learners benefit most from strategies that involve seeing and organising information visually, such as mind maps, diagrams, and colour-coding.'),
  t(4, '### Effective Study Techniques\n\n**Active recall:** Test yourself on the material rather than just re-reading it. Cover your notes and try to recall key points.\n\n**Spaced repetition:** Review material at increasing intervals (Day 1, Day 3, Day 7, Day 14) rather than cramming everything the night before.\n\n**The Pomodoro Technique:** Study for 25 minutes, take a 5-minute break. After 4 sessions, take a longer 15-30 minute break.\n\n**SQ3R Method:**\n1. **Survey:** Skim the chapter headings and summaries\n2. **Question:** Turn headings into questions\n3. **Read:** Read actively, looking for answers to your questions\n4. **Recite:** Close the book and summarise what you read\n5. **Review:** Go back and check your understanding'),
  t(5, '### Time Management\n\nPoor time management is one of the biggest reasons learners underperform:\n\n**Time management tips:**\n- Use a planner or calendar (physical or digital)\n- Set specific goals for each study session ("Complete 3 past papers on conflict resolution")\n- Identify your peak focus times (morning, afternoon, evening) and study difficult subjects then\n- Eliminate distractions: put your phone on silent, close social media\n- Use the "two-minute rule": if a task takes less than two minutes, do it now\n- Avoid multitasking \u2014 focus on one subject at a time\n\n**Common time wasters for Grade 12 learners:**\n- Social media scrolling\n- Disorganised study materials (time spent looking for notes)\n- Studying without a plan (reading aimlessly)\n- Procrastination disguised as "preparation" (sharpening pencils, organising desk)'),
  fb(6, 'The study technique where you test yourself instead of re-reading notes is called ___. Reviewing material at increasing intervals is called ___ repetition.',
    ['active recall', 'spaced'],
    'Active recall forces your brain to retrieve information, which strengthens memory. Spaced repetition leverages the spacing effect to improve long-term retention.'),
  t(7, '### Examination Writing Skills\n\n**Before the exam:**\n- Get a good night\'s sleep (at least 7-8 hours)\n- Eat a balanced breakfast\n- Arrive early with all required materials\n- Read through the entire paper before starting\n\n**During the exam:**\n- **Read the question carefully:** Underline key words (discuss, explain, evaluate, compare)\n- **Plan your response:** For longer questions, jot down a brief outline\n- **Answer the question asked:** Do not write everything you know about the topic\n- **Manage your time:** Allocate time based on marks (roughly 1 minute per mark)\n- **Start with questions you know best** to build confidence and secure marks\n- **Use subject terminology** in your answers\n- **For LO specifically:** Link answers to the South African context (Constitution, Bill of Rights, current affairs)'),
  q(8, 'The exam question says "Evaluate the effectiveness of community campaigns to reduce substance abuse." The command word "evaluate" requires you to:',
    ['Weigh up the strengths and weaknesses and reach a conclusion', 'Simply list the campaigns', 'Define what substance abuse means', 'Describe one campaign in detail'], 0,
    '"Evaluate" is a higher-order command word that requires you to assess the value or effectiveness of something, considering both positives and negatives, and reaching a reasoned conclusion.'),
  t(9, '### Key Command Words for LO Exams\n\n| Command word | What it requires |\n|-------------|------------------|\n| **Define** | Give a clear, concise meaning |\n| **Describe** | Give a detailed account |\n| **Explain** | Make clear by giving reasons or causes |\n| **Discuss** | Present different viewpoints or aspects |\n| **Evaluate** | Weigh up pros/cons, strengths/weaknesses, reach a conclusion |\n| **Analyse** | Break down into parts and examine each |\n| **Compare** | Show similarities and differences |\n| **Suggest** | Offer practical ideas or solutions |\n| **Critically discuss** | Discuss with a focus on questioning and evaluating evidence |\n| **Recommend** | Suggest what should be done, with reasons |'),
  q(10, 'A learner studies for six hours without any breaks the night before an LO exam. Why is this approach likely to be ineffective?',
    ['The brain needs regular breaks to consolidate information; cramming leads to fatigue and poor recall', 'Six hours is too little time to study', 'Studying the night before is always effective', 'LO does not require any studying'], 0,
    'Marathon study sessions without breaks lead to diminishing returns. The brain consolidates information during rest periods. Cramming also causes fatigue and anxiety, which impair exam performance.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Careers and Career Choices (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Careers and Career Choices\n\nGrade 12 is the year of final action \u2014 applying for courses, jobs, bursaries, and funding. This chapter focuses on the practical skills you need to navigate the transition from school to your chosen career path.\n\n### Post-School Options in South Africa\n\n| Option | Description | Entry requirement |\n|--------|-----------|-------------------|\n| **University degree** | 3-6 years, academic focus | Bachelor\'s pass (NSC with specific subject requirements) |\n| **Diploma (University of Technology)** | 3 years, practical focus | Diploma pass (NSC) |\n| **Higher Certificate** | 1-2 years, vocational | Higher Certificate pass (NSC) |\n| **TVET College** | NC(V) or NATED programmes, skills-focused | Grade 9 or Grade 12 |\n| **Learnership/Apprenticeship** | Work-based learning with a qualification | Varies (Grade 10-12) |\n| **Gap year** | Volunteering, travel, or work experience | No formal requirement |\n| **Direct employment** | Enter the workforce | Varies by employer |'),
  t(2, '### Admission Requirements\n\nUnderstanding the NSC pass levels:\n\n| Pass type | Requirements | Allows entry to |\n|-----------|-------------|----------------|\n| **Bachelor\'s pass** | 50% in 4 designated subjects (one must be an official language at Home Language level) | University degree programmes |\n| **Diploma pass** | 40% in 4 recognised subjects | Diploma programmes at universities of technology |\n| **Higher Certificate pass** | NSC with required credits | Higher certificate programmes |\n| **NSC pass** | Complete all 7 subjects, meet minimum requirements | TVET colleges, learnerships |\n\n**Important:** Each university and programme has its own **Admission Point Score (APS)** requirements. Check the specific institution\'s website for exact requirements.\n\n**Calculating your APS:**\n- Each subject score converts to a point value (typically 7 = 80-100%, 6 = 70-79%, 5 = 60-69%, etc.)\n- Add up the points for your best 6 subjects (excluding LO)\n- Compare your total to the programme\'s minimum APS'),
  q(3, 'Nomsa has a Diploma pass but wants to study for a Bachelor\'s degree at university. What should she do?',
    ['Apply to a diploma programme first and potentially transfer, or upgrade her matric results', 'Give up on university entirely', 'Apply for the degree anyway as the pass type does not matter', 'Only consider TVET colleges'], 0,
    'With a Diploma pass, Nomsa cannot directly enter a degree programme. She can register for a diploma, perform well, and then apply to transfer to a degree. Alternatively, she can upgrade specific subjects through supplementary exams or adult matric.'),
  t(4, '### Researching Study Opportunities\n\n**Where to research:**\n- University and TVET college websites\n- DHET (Department of Higher Education and Training) website\n- Career guidance offices at schools\n- Open days and career expos\n- SAQA (South African Qualifications Authority) for checking qualification accreditation\n\n**What to research:**\n- Programme content and duration\n- Specific entry requirements and APS\n- Application deadlines (most universities close applications by September of Grade 12)\n- Campus location and accommodation\n- Whether the institution is accredited\n- Career prospects after completing the qualification\n- Student support services available'),
  t(5, '### Funding Opportunities\n\n**NSFAS (National Student Financial Aid Scheme):**\n- Government-funded financial aid for students from low-income families\n- Covers tuition, accommodation, meals, books, and a personal allowance\n- Household income must be below R350 000 per year (or R600 000 for persons with disabilities)\n- Apply online at www.nsfas.org.za\n- Applications typically open in September/October for the following year\n- NSFAS is a bursary for university students and TVET students (no repayment required for those who complete)\n\n**Bursaries:**\n- Funded by companies, organisations, or government departments\n- Often require you to work for the sponsor after graduating\n- Examples: Sasol, Eskom, MTN Foundation, Allan Gray Orbis Foundation\n- Search on databases like FundzaLushaka (for teaching), or bursary portals\n\n**Scholarships:**\n- Merit-based (academic or sports excellence)\n- Often cover full costs\n- Highly competitive'),
  fb(6, 'The government funding scheme for students from low-income families is called ___. The minimum household income threshold is R___ per year.',
    ['NSFAS', '350 000'],
    'NSFAS (National Student Financial Aid Scheme) provides funding to students whose household income is below R350 000 per year.'),
  t(7, '### Skills for Final Action: Applications\n\n**Writing a CV (Curriculum Vitae):**\n- Personal details (name, contact info, ID number)\n- Education (school, subjects, expected results)\n- Skills (computer literacy, languages, interpersonal skills)\n- Work experience (if any, including volunteer work)\n- References (teachers, community leaders)\n- Keep it to 1-2 pages, neat and professional\n\n**Writing a cover letter:**\n- Address it to the specific person/institution\n- State what you are applying for\n- Highlight why you are a good fit\n- Be concise and professional\n- Proofread for errors\n\n**Completing application forms:**\n- Read all instructions before starting\n- Use black ink if handwriting\n- Answer every question (write "N/A" if not applicable)\n- Attach all required documents (certified copies of ID, results, etc.)'),
  q(8, 'When applying for a bursary, which of the following would MOST strengthen your application?',
    ['A well-written motivational letter explaining your goals and how the bursary will help you achieve them', 'Including a photo of yourself', 'Mentioning that many of your friends are also applying', 'Writing the application in pencil'], 0,
    'A strong motivational letter that clearly articulates your goals, financial need, and how the bursary aligns with your career plans is the most impactful element of a bursary application.'),
  t(9, '### Interview Skills\n\n**Preparing for an interview:**\n- Research the institution or company\n- Prepare answers to common questions: "Tell me about yourself," "Why do you want this position/course?"\n- Prepare questions to ask the interviewer\n- Plan your outfit (neat, professional, appropriate)\n- Plan your route and arrive 15 minutes early\n\n**During the interview:**\n- Greet with a firm handshake and make eye contact\n- Sit up straight and avoid fidgeting\n- Listen carefully to each question before answering\n- Speak clearly and confidently\n- Be honest \u2014 do not exaggerate or fabricate\n- Thank the interviewer at the end\n\n**After the interview:**\n- Send a thank-you email or message\n- Follow up if you have not heard back within the stated timeframe'),
  q(10, 'A TVET college offers an NC(V) programme in Information Technology. What does "NC(V)" stand for?',
    ['National Certificate (Vocational)', 'National Course (Verified)', 'Non-Curricular (Vocational)', 'National College (Verified)'], 0,
    'NC(V) stands for National Certificate (Vocational). It is a vocational qualification offered at TVET colleges as an alternative to the traditional academic pathway.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Unemployment and Entrepreneurship (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Unemployment and Entrepreneurship\n\nSouth Africa faces one of the highest unemployment rates in the world. According to Statistics South Africa, youth unemployment (ages 15-34) exceeds 45%. Understanding the causes, impact, and innovative solutions to unemployment is critical for every Grade 12 learner.\n\n### Reasons for Unemployment in South Africa\n\n- **Skills mismatch:** The education system does not always produce the skills the economy needs\n- **Lack of experience:** Employers often require experience, creating a catch-22 for new graduates\n- **Slow economic growth:** The economy is not growing fast enough to create sufficient jobs\n- **Structural inequality:** Apartheid\'s legacy continues to affect access to quality education and opportunities\n- **Technological change:** Automation and AI are replacing certain jobs\n- **Limited access to information:** Many young people in rural areas do not know about available opportunities\n- **Poor infrastructure:** Lack of reliable transport and internet in some areas limits job access'),
  t(2, '### Impact of Unemployment\n\n| Level | Impact |\n|-------|--------|\n| **Individual** | Loss of income, poverty, low self-esteem, depression, substance abuse, loss of skills |\n| **Family** | Financial strain, family conflict, inability to afford education/healthcare, child-headed households |\n| **Community** | Increased crime, substance abuse, social instability, brain drain (skilled people emigrate) |\n| **Country** | Reduced GDP, increased government spending on grants, social unrest, reduced tax revenue |\n\nThe ripple effect of unemployment touches every aspect of South African society. The government\'s social grant system (SASSA) provides a safety net, but it is not a long-term solution.'),
  q(3, 'How does youth unemployment in South Africa contribute to the "brain drain"?',
    ['Skilled young people emigrate to countries with better job opportunities, reducing SA\'s talent pool', 'Young people stop studying because of unemployment', 'The brain drain only affects older professionals', 'Unemployment has no effect on emigration'], 0,
    'Brain drain occurs when skilled and educated individuals leave South Africa for better economic opportunities abroad. High youth unemployment is a major push factor driving this trend.'),
  t(4, '### Innovative Solutions to Unemployment\n\nWhile waiting for formal employment, young people can take proactive steps:\n\n- **Volunteering:** Gain experience and build networks while contributing to your community\n- **Part-time work:** Build skills and earn income, even if the work is not in your desired field\n- **Community work programmes:** Government-funded initiatives like the EPWP (Expanded Public Works Programme) and CWP (Community Work Programme)\n- **Informal sector jobs:** Street trading, services (hairdressing, gardening, tutoring), and artisan work\n- **Online freelancing:** Graphic design, writing, coding, virtual assistance through platforms like Upwork or Fiverr\n- **Further education and training:** Use the time to upskill through short courses, online learning, or TVET programmes'),
  t(5, '### Entrepreneurship as an Innovative Strategy\n\nEntrepreneurship means identifying an opportunity and creating a business to address it. In South Africa, entrepreneurship is increasingly seen as a viable alternative to formal employment.\n\n**Characteristics of a successful entrepreneur:**\n- **Creativity and innovation:** Sees problems as opportunities\n- **Risk-taking:** Willing to take calculated risks\n- **Resilience:** Bounces back from failures\n- **Self-discipline:** Manages time and resources effectively\n- **Passion:** Driven by purpose, not just profit\n- **Networking:** Builds relationships that support the business\n- **Financial literacy:** Understands budgets, cash flow, and profit\n\n**Finding a niche:**\n- Identify a gap in the market (unmet need in your community)\n- Leverage your unique skills and passions\n- Research your competitors\n- Start small, test your idea, and grow'),
  fb(6, 'The government programme that provides temporary work for unemployed people is called the ___ (abbreviated). An entrepreneur who starts a business that aims to solve social problems while generating income runs a ___ enterprise.',
    ['EPWP', 'social'],
    'EPWP stands for the Expanded Public Works Programme. A social enterprise uses business strategies to address social, cultural, or environmental issues.'),
  t(7, '### Types of Business Ventures\n\n| Type | Description | Example |\n|------|-----------|----------|\n| **Small business** | Traditional business selling goods/services | Spaza shop, salon, mechanic, catering |\n| **Social enterprise** | Business that addresses a social problem | Recycling co-op, community food garden, after-school tutoring centre |\n| **E-business** | Online-based business | E-commerce store, digital marketing agency, app development |\n| **Innovative venture** | Business based on a new product or technology | Solar energy solutions, agri-tech, educational apps |\n| **Cultural venture** | Business rooted in cultural heritage | Traditional crafts, cultural tourism, traditional food business |\n\n### Financial Viability\n\nBefore starting a business, assess:\n- **Start-up costs:** What do you need to invest upfront?\n- **Operating costs:** Monthly expenses (rent, stock, transport, data)\n- **Revenue projections:** How much can you realistically earn?\n- **Break-even point:** When will income cover costs?\n- **Funding sources:** Personal savings, loans, government grants (SEDA, NYDA, NEF)'),
  q(8, 'Ayanda wants to start a business selling handmade jewellery online. What type of venture is this?',
    ['E-business combined with a cultural venture', 'Only a social enterprise', 'Only a small business', 'An EPWP project'], 0,
    'Selling handmade jewellery online combines e-business (online sales platform) with elements of a cultural venture (handmade crafts). It could also be classified as a small business.'),
  t(9, '### SARS Tax Obligations for Entrepreneurs\n\nEvery person earning income in South Africa must comply with tax laws:\n\n**Key obligations:**\n- **Register as a taxpayer:** Get a tax reference number from SARS\n- **Register for Income Tax:** If your annual income exceeds the tax threshold (R95 750 for under 65s)\n- **Register for VAT:** If your business turnover exceeds R1 million per year\n- **Submit tax returns:** File annually, declaring all income and claiming deductions\n- **Pay provisional tax:** If you earn income that is not subject to PAYE (employees\' tax), you must pay provisional tax twice a year\n- **Keep records:** Maintain records of all income, expenses, invoices, and receipts for at least 5 years\n\n**Turnover tax:** Small businesses with turnover below R1 million can register for the simplified turnover tax system instead of normal income tax.\n\n**Consequences of non-compliance:** Penalties, interest charges, and potential criminal prosecution.'),
  q(10, 'A young entrepreneur has a small catering business earning R80 000 per year. Which of the following is TRUE?',
    ['She does not need to register for VAT as her turnover is below R1 million', 'She must register for VAT immediately', 'She does not need to register as a taxpayer at all', 'She must pay corporate income tax'], 0,
    'VAT registration is only compulsory when annual turnover exceeds R1 million. However, she may still need to register as an income taxpayer and should keep proper records. As a sole proprietor, she pays personal income tax, not corporate tax.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Fraud and Corruption (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Fraud and Corruption\n\nFraud and corruption undermine democracy, erode public trust, and deprive citizens of essential services. In South Africa, these issues have had devastating effects on service delivery, the economy, and public confidence in institutions.\n\n### Key Concepts\n\n| Term | Definition |\n|------|------------|\n| **Fraud** | Deliberate deception to gain an unfair or unlawful advantage |\n| **Corruption** | Misuse of power or position for personal gain |\n| **Embezzlement** | Theft of funds entrusted to your care (e.g., a treasurer stealing from an organisation) |\n| **Bribery** | Offering, giving, or accepting something of value to influence a decision |\n| **Nepotism** | Favouring family members in appointments or contracts |\n| **Cronyism** | Favouring friends and associates in appointments or contracts |\n| **Money laundering** | Disguising the origins of illegally obtained money |\n| **Tender fraud** | Manipulating the procurement process to award contracts unfairly |'),
  t(2, '### Causes of Fraud and Corruption\n\n**Individual causes:**\n- Greed and desire for personal enrichment\n- Lack of ethical values and integrity\n- Sense of entitlement\n- Financial pressure or desperation\n\n**Systemic causes:**\n- Weak institutions and poor oversight\n- Lack of accountability and consequences\n- Culture of impunity ("everyone does it")\n- Inadequate whistleblower protection\n- Complex regulations that create loopholes\n- Low public sector salaries encouraging bribery\n\n**Historical causes:**\n- Legacy of apartheid-era corruption and inequality\n- Rapid transition created opportunities for exploitation\n- "Cadre deployment" placing loyalty above competence'),
  q(3, 'A municipal official awards a R5 million water infrastructure contract to his brother-in-law\'s company without following proper tender procedures. This is an example of:',
    ['Nepotism and tender fraud', 'Fair procurement', 'Bribery only', 'Embezzlement only'], 0,
    'This involves nepotism (favouring a family member) and tender fraud (not following proper procurement procedures). The brother-in-law gets the contract based on family connection, not merit.'),
  t(4, '### Impact of Fraud and Corruption\n\n**On individuals:**\n- Loss of trust in institutions\n- Victims of corruption lose access to services they are entitled to\n- Whistleblowers face intimidation and retaliation\n\n**On companies:**\n- Unfair competition (honest businesses lose out)\n- Increased costs of doing business\n- Reputational damage\n- Legal consequences\n\n**On communities:**\n- Poor service delivery (water, electricity, roads, housing)\n- Schools and hospitals lack resources\n- Increased poverty and inequality\n- Social unrest and protests\n\n**On the country:**\n- Reduced foreign investment\n- Brain drain as skilled people leave\n- Weakened democracy and rule of law\n- Reduced economic growth\n- South Africa\'s international reputation is damaged'),
  fb(5, 'Stealing money that was entrusted to your care is called ___. Favouring friends when awarding contracts is called ___.',
    ['embezzlement', 'cronyism'],
    'Embezzlement is theft by someone in a position of trust (e.g., an accountant stealing company funds). Cronyism is favouring friends and close associates in decisions like hiring or awarding tenders.'),
  t(6, '### Strategies to Prevent and Combat Fraud and Corruption\n\n**At the individual level:**\n- Develop strong personal ethics and integrity\n- Refuse to participate in corrupt activities\n- Report corruption through proper channels\n- Support honest leaders and organisations\n\n**At the institutional level:**\n- Strong internal controls and auditing\n- Transparent procurement processes\n- Effective whistleblower protection policies\n- Regular rotation of officials in sensitive positions\n- Code of conduct enforcement\n\n**At the national level:**\n- Independent judiciary and prosecution services\n- Chapter 9 institutions: Public Protector, Auditor General, Human Rights Commission\n- Legislation: Prevention and Combating of Corrupt Activities Act (PRECCA)\n- Whistleblower protection: Protected Disclosures Act\n- Civil society watchdogs: Corruption Watch, OUTA, Section27'),
  q(7, 'Which Chapter 9 institution is specifically responsible for auditing government spending and reporting on irregular expenditure?',
    ['The Auditor General', 'The Public Protector', 'The Human Rights Commission', 'The Electoral Commission'], 0,
    'The Auditor General (AG) audits all government departments, municipalities, and public entities, and reports to Parliament on how public money is spent. The Public Protector investigates complaints about government conduct.'),
  t(8, '### Whistleblowing\n\nA whistleblower is someone who reports illegal, unethical, or corrupt activities within an organisation.\n\n**Protected Disclosures Act (PDA):**\n- Protects employees who report wrongdoing from being dismissed, disciplined, or harassed\n- The disclosure must be made in good faith\n- Can be reported to employer, legal adviser, or relevant authority\n\n**How to report corruption in South Africa:**\n- Presidential hotline: 17737\n- Corruption Watch: www.corruptionwatch.org.za\n- Public Protector: www.pprotect.org\n- Anonymous tip-offs: Crime Stop 08600 10111\n- Your organisation\'s internal reporting channels\n\n**Challenges for whistleblowers:**\n- Fear of retaliation and job loss\n- Intimidation and threats\n- Slow legal processes\n- Inadequate protection despite the PDA'),
  q(9, 'Why is whistleblower protection important in fighting corruption?',
    ['Without protection, people fear retaliation and will not report corrupt activities they witness', 'Whistleblowers always receive financial rewards', 'Protection is only needed in private companies', 'Whistleblowing is illegal in South Africa'], 0,
    'Whistleblower protection is essential because people who witness corruption need assurance that they will not lose their jobs or face retaliation. Without such protection, corruption goes unreported and persists.'),
  t(10, '### Case Studies in South African Context\n\nSouth Africa has experienced numerous high-profile cases of fraud and corruption:\n\n- **State Capture:** The Zondo Commission (2018-2022) investigated allegations of systemic corruption involving state institutions and private interests. The commission found widespread corruption at Eskom, Transnet, PRASA, and other SOEs.\n- **VBS Mutual Bank:** Senior officials and politicians looted over R2 billion from a bank that served rural communities.\n- **PPE procurement scandals:** During COVID-19, irregular procurement of Personal Protective Equipment resulted in overcharging and fraud.\n\nThese cases demonstrate why vigilance, strong institutions, and active citizenship are essential. Every citizen has a role to play in holding leaders accountable and building a corruption-free South Africa.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Democracy and Human Rights (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Democracy and Human Rights\n\nSouth Africa\'s democracy, achieved in 1994, is built on the foundation of human rights. The Constitution of the Republic of South Africa (1996) is the supreme law of the land and contains the Bill of Rights (Chapter 2), which protects the rights of all people.\n\n### The Bill of Rights\n\nThe Bill of Rights (Sections 7-39) guarantees fundamental rights including:\n\n| Right | Section | Description |\n|-------|---------|-------------|\n| Equality | 9 | No unfair discrimination on any ground |\n| Human dignity | 10 | Everyone has inherent dignity |\n| Life | 11 | Right to life |\n| Freedom and security | 12 | Freedom from violence, torture |\n| Privacy | 14 | Right to privacy |\n| Freedom of expression | 16 | Right to express opinions (with limitations) |\n| Education | 29 | Right to basic education |\n| Healthcare, food, water | 27 | Right to access |\n| Housing | 26 | Right to access adequate housing |'),
  t(2, '### Discrimination and Violation of Human Rights\n\n**Forms of discrimination:**\n- **Racism:** Discrimination based on race or skin colour\n- **Sexism:** Discrimination based on gender\n- **Homophobia:** Discrimination based on sexual orientation\n- **Xenophobia:** Hostility toward foreign nationals\n- **Ableism:** Discrimination against people with disabilities\n- **Ageism:** Discrimination based on age\n\n**Unfair discrimination is prohibited by Section 9 of the Constitution** on the grounds of race, gender, sex, pregnancy, marital status, ethnic or social origin, colour, sexual orientation, age, disability, religion, conscience, belief, culture, language, and birth.\n\n**The Equality Court** was established under the Promotion of Equality and Prevention of Unfair Discrimination Act (PEPUDA) to hear cases of unfair discrimination, hate speech, and harassment.'),
  q(3, 'Section 9 of the South African Constitution deals with:',
    ['Equality and the right not to be unfairly discriminated against', 'The right to education', 'Freedom of expression', 'The right to housing'], 0,
    'Section 9 is the Equality clause. It states that everyone is equal before the law and has the right to equal protection. It prohibits unfair discrimination on various grounds.'),
  t(4, '### Campaigns and Events Addressing Human Rights\n\nSouth Africa has a rich history of campaigns to promote human rights:\n\n**Historical campaigns:**\n- Anti-apartheid movement (1948-1994)\n- The Defiance Campaign (1952)\n- Women\'s March to the Union Buildings (1956)\n- Black Consciousness Movement (Steve Biko)\n\n**Contemporary campaigns:**\n- 16 Days of Activism for No Violence Against Women and Children (25 November - 10 December)\n- Human Rights Day (21 March) \u2014 commemorating the Sharpeville Massacre\n- Youth Day (16 June) \u2014 commemorating the 1976 Soweto Uprising\n- Heritage Day (24 September) \u2014 celebrating cultural diversity\n\n**Evaluating campaign effectiveness:**\n- Has awareness increased? (surveys, media coverage)\n- Have laws or policies changed as a result?\n- Has the target behaviour actually decreased?\n- Are the right audiences being reached?\n- Is there sustained impact or just short-term attention?'),
  fb(5, 'Human Rights Day on 21 March commemorates the ___ Massacre. The 16 Days of Activism campaign focuses on ending violence against ___ and children.',
    ['Sharpeville', 'women'],
    'On 21 March 1960, police opened fire on peaceful protesters in Sharpeville, killing 69 people. The 16 Days of Activism campaign runs from 25 November to 10 December to raise awareness about gender-based violence.'),
  t(6, '### Role of Media in a Democratic Society\n\nMedia plays a crucial role in democracy:\n\n**Functions of media:**\n- **Informing citizens:** Reporting on government actions, service delivery, and current events\n- **Watchdog role:** Investigating and exposing corruption, fraud, and abuse of power\n- **Platform for debate:** Providing space for diverse viewpoints\n- **Holding government accountable:** Questioning leaders and policies\n\n**Media freedom in South Africa:**\n- Section 16 of the Constitution protects freedom of expression, including freedom of the press\n- The Press Council and Broadcasting Complaints Commission regulate media ethics\n- Media freedom is essential but not absolute \u2014 it excludes propaganda for war, incitement to violence, and hate speech\n\n**Challenges:**\n- Media ownership concentration\n- Threats to journalists\n- Disinformation and fake news\n- Political pressure on public broadcaster (SABC)'),
  t(7, '### Social Media, Digital Footprint, and Cyber Wellness\n\n**Social media\'s role:**\n- Amplifies voices and enables citizen journalism\n- Organises campaigns and activism (#FeesMustFall, #AmINext)\n- Spreads information rapidly \u2014 both accurate and false\n\n**Digital footprint:**\n- Everything you post, share, like, or comment on creates a permanent record\n- Future employers, universities, and bursary providers may check your online presence\n- Think before you post: "Would I be comfortable if my teacher or a future employer saw this?"\n\n**Cyber safety and bullying:**\n- Cyberbullying is using technology to harass, threaten, or humiliate someone\n- It is a criminal offence under the Cybercrimes Act (2020)\n- Never share personal information (ID numbers, addresses, banking details) online\n- Report cyberbullying to parents, teachers, or the police'),
  q(8, 'A learner creates a fake social media profile to post hateful comments about a classmate. Under which South African law could this be prosecuted?',
    ['The Cybercrimes Act (2020)', 'The Labour Relations Act', 'The Companies Act', 'The Consumer Protection Act'], 0,
    'The Cybercrimes Act (2020) criminalises cyberbullying, online harassment, and the distribution of harmful messages. Creating a fake profile to harass someone falls under this legislation.'),
  t(9, '### Cyber Wellness\n\nCyber wellness refers to the positive well-being of internet users:\n\n**Principles of cyber wellness:**\n- **Respect yourself and others online:** Treat others as you would in person\n- **Protect yourself:** Use strong passwords, enable two-factor authentication, be cautious with links\n- **Be critical:** Verify information before sharing; check multiple sources\n- **Balance screen time:** Excessive social media use is linked to anxiety, depression, and sleep problems\n- **Know your rights:** POPIA (Protection of Personal Information Act) protects your personal data\n\n**Identifying fake news:**\n- Check the source: Is it a reputable news organisation?\n- Read beyond the headline\n- Check the date \u2014 old stories are often recirculated\n- Look for supporting evidence from other sources\n- Be suspicious of content that triggers strong emotions'),
  q(10, 'POPIA (Protection of Personal Information Act) in South Africa primarily protects:',
    ['Your personal data and how organisations collect, store, and use it', 'Your right to free internet access', 'Companies from being sued by customers', 'The government\'s right to monitor citizens'], 0,
    'POPIA regulates how personal information is processed by organisations. It gives individuals the right to know what data is held about them and to request correction or deletion.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Sports and Nation Building (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Sports and Nation Building\n\nSport has played a powerful role in South Africa\'s journey toward national unity. From the 1995 Rugby World Cup to the 2010 FIFA World Cup, sport has brought diverse South Africans together across racial, cultural, and economic divides.\n\n### Sports Personalities and Their Coverage\n\nSouth African sports figures receive vastly different levels of media attention:\n\n| Sport | Examples | Media coverage |\n|-------|---------|----------------|\n| **Rugby** | Siya Kolisi, Eben Etzebeth | Extensive, especially during World Cup |\n| **Cricket** | Temba Bavuma, Kagiso Rabada | Good but less than rugby |\n| **Soccer** | Percy Tau, Thembi Kgatlana | Massive following, less corporate sponsorship |\n| **Athletics** | Wayde van Niekerk, Caster Semenya | High during Olympics, drops off between events |\n| **Swimming** | Tatjana Schoenmaker, Chad le Clos | Peaks during Olympics |\n| **Netball** | Bongi Msomi | Minimal despite world-class players |'),
  t(2, '### Unequal Coverage and Representation\n\n**Issues in sports coverage:**\n- **Gender inequality:** Women\'s sport receives significantly less coverage, sponsorship, and airtime than men\'s sport\n- **Racial patterns:** Historically, rugby and cricket received more corporate sponsorship linked to their predominantly white audiences\n- **Class and access:** Many talented athletes from disadvantaged backgrounds lack access to facilities, coaching, and equipment\n- **Disability sport:** Paralympic athletes and athletes with disabilities receive minimal media coverage despite outstanding achievements\n\n**Transformation in South African sport:**\n- Government has pushed for racial transformation through quotas and development programmes\n- The 2019 Rugby World Cup win, captained by Siya Kolisi (first Black Springbok captain), was a landmark moment\n- Debate continues: Do quotas promote inclusion or undermine merit?'),
  q(3, 'Why was Siya Kolisi\'s captaincy of the Springboks during the 2019 Rugby World Cup significant for nation building?',
    ['As the first Black captain, his leadership symbolised transformation and unity in a historically divided sport', 'He was the youngest captain ever', 'He scored the most tries in the tournament', 'It was South Africa\'s first World Cup appearance'], 0,
    'Siya Kolisi\'s captaincy was historically significant because rugby had long been associated with white South Africa. His leadership of a diverse team to World Cup victory symbolised the potential for transformation and unity.'),
  t(4, '### Ideologies, Beliefs, and Worldviews in Sport\n\nSport is influenced by and reflects broader societal beliefs:\n\n- **Gender norms:** Certain sports are still seen as "masculine" (boxing, rugby) or "feminine" (netball, gymnastics), limiting participation\n- **Cultural beliefs:** Some cultures prioritise education over sport, or restrict women\'s participation\n- **Religious considerations:** Dress codes, dietary requirements, and observance of holy days affect athletes\n- **Socio-economic factors:** Poverty limits access to equipment, travel, and coaching\n- **Political ideologies:** Sport has been used as a tool for both oppression (apartheid-era isolation) and liberation (international sports boycotts pressured the apartheid government)'),
  t(5, '### Recreational and Physical Activity Across Cultures and Genders\n\n**Benefits of physical activity:**\n- Physical: Reduces risk of lifestyle diseases, improves fitness\n- Mental: Reduces stress, anxiety, and depression\n- Social: Builds teamwork, discipline, and friendships\n- Nation building: Creates shared experiences across divides\n\n**Indigenous South African games and activities:**\n- Morabaraba (strategy board game)\n- Dibeke (similar to baseball, played with a ball and stick)\n- Ntimo (singing and rhythm games)\n- Stick fighting (umshiza) among Zulu and Xhosa youth\n\n**Barriers to participation:**\n- Lack of facilities in rural and township areas\n- Safety concerns (crime prevents outdoor activity)\n- Financial costs of organised sport\n- Gender stereotypes limiting girls\' and women\'s participation\n- Disability and lack of inclusive infrastructure'),
  fb(6, 'The international sports boycott during apartheid aimed to pressure the South African government by ___ the country from international competitions. The 2010 FIFA World Cup was significant because South Africa was the first ___ country to host it.',
    ['isolating', 'African'],
    'The sports boycott isolated South Africa from international competition, putting economic and political pressure on the apartheid regime. The 2010 World Cup made South Africa the first African nation to host the tournament.'),
  q(7, 'Which of the following is an example of how sport contributes to nation building in South Africa?',
    ['People from different backgrounds supporting the same national team creates a sense of shared identity', 'Sport creates division between different cultural groups', 'Only wealthy people benefit from sport', 'Sport is purely about physical fitness and has no social impact'], 0,
    'When South Africans of all races, languages, and backgrounds unite behind a national team (like Bafana Bafana or the Springboks), it creates a powerful sense of shared national identity that transcends everyday divisions.'),
  t(8, '### Freedom of Expression in Sport\n\nSection 16 of the Constitution protects freedom of expression, but this right has limitations:\n\n**Allowed:**\n- Criticising sports administrators and policies\n- Peaceful protests against unfair selection or governance\n- Media reporting on corruption in sport\n- Athletes expressing personal views on social media\n\n**Limited/Not allowed:**\n- Hate speech targeting athletes based on race, gender, or religion\n- Incitement to violence (e.g., threatening match officials)\n- Racial abuse in stadiums or online\n\n**Examples:**\n- Fans have been banned from stadiums for racial slurs\n- The #ProteasFire movement highlighted racial tensions in Cricket South Africa\n- Athletes like Caster Semenya have faced discrimination based on gender identity, sparking global debate about fairness and human rights in sport'),
  q(9, 'A sports fan posts racial slurs about a player on social media after a match. Is this protected by freedom of expression?',
    ['No, hate speech based on race is specifically excluded from the right to freedom of expression', 'Yes, fans can say whatever they want about public figures', 'Only if the player does not see the post', 'It depends on whether the team won or lost'], 0,
    'Section 16(2) of the Constitution explicitly excludes hate speech from the protection of freedom of expression. Racial abuse, whether in a stadium or online, is not protected speech and may be prosecuted.'),
  t(10, '### Promoting Inclusivity in Sport\n\nBuilding an inclusive sporting culture requires:\n\n- Equal investment in women\'s sport (facilities, coaching, media coverage)\n- Development programmes in disadvantaged communities\n- Accessible facilities for athletes with disabilities\n- Culturally sensitive policies (allowing religious dress, accommodating dietary needs)\n- Anti-discrimination policies with real consequences\n- Using sport as a vehicle for social cohesion (community tournaments, inter-school leagues)\n- Celebrating diversity through sport (Heritage Day events, cultural games)\n\nEvery young person should have the opportunity to participate in sport and physical activity, regardless of gender, race, ability, or socio-economic background. This is not just about producing elite athletes \u2014 it is about building a healthier, more united South Africa.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Social and Environmental Responsibility (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Social and Environmental Responsibility\n\nEvery individual, community, and level of government has a responsibility to promote safe and healthy living and to protect the environment for future generations.\n\n### Responsibilities of Different Levels of Government\n\n| Level | Responsibilities |\n|-------|------------------|\n| **National government** | Setting policy and legislation (e.g., National Environmental Management Act), allocating budgets, coordinating between provinces |\n| **Provincial government** | Implementing national policies, managing provincial healthcare, education, and environmental programmes |\n| **Local government (municipalities)** | Service delivery: water, sanitation, electricity, waste removal, road maintenance, housing, local environmental management |\n\nThe Constitution (Schedule 4 and 5) outlines which functions belong to which level of government. Citizens can hold government accountable through elections, public participation, petitions, and the courts.'),
  t(2, '### Community Services Promoting Safe and Healthy Living\n\n**Types of community services:**\n- **Healthcare:** Clinics, community health workers, immunisation programmes, TB/HIV treatment\n- **Education:** Schools, libraries, adult literacy programmes, ECD (Early Childhood Development) centres\n- **Safety:** Community policing forums (CPFs), neighbourhood watches, street committees\n- **Social development:** Social workers, SASSA grants, feeding schemes, old age homes\n- **Environmental:** Recycling programmes, clean-up campaigns, community gardens, water conservation projects\n\n**Examples of community-based programmes in South Africa:**\n- Zibambele Road Maintenance Programme (KZN)\n- Working on Fire (wildfire management)\n- War on Leaks (plumber training for youth)\n- LoveLife and HEAIDS (HIV prevention in youth and students)'),
  q(3, 'Which level of government is primarily responsible for waste removal and water supply in your area?',
    ['Local government (municipality)', 'National government', 'Provincial government', 'The private sector'], 0,
    'Local government (municipalities) is responsible for basic service delivery including water, sanitation, electricity, and waste removal, as outlined in the Constitution.'),
  t(4, '### Educational and Intervention Programmes\n\n**Types of programmes:**\n\n| Programme type | Purpose | Examples |\n|---------------|---------|----------|\n| **Prevention** | Stop problems before they start | Drug education at schools, road safety campaigns |\n| **Intervention** | Address existing problems | Rehabilitation centres, domestic violence shelters |\n| **Awareness** | Inform the public about issues | 16 Days of Activism, World AIDS Day |\n| **Development** | Build skills and capacity | Learnerships, youth development programmes |\n\n**Evaluating programme effectiveness:**\n- What was the programme\'s stated goal?\n- How was success measured? (Quantitative: numbers, statistics; Qualitative: stories, feedback)\n- Did the programme reach its target audience?\n- Were there unintended consequences (positive or negative)?\n- Is the impact sustainable or only short-term?\n- What was the cost-effectiveness?'),
  fb(5, 'A programme that aims to stop drug abuse before it starts is a ___ programme. A programme that helps existing drug users recover is an ___ programme.',
    ['prevention', 'intervention'],
    'Prevention programmes aim to stop problems before they occur. Intervention programmes address problems that already exist.'),
  t(6, '### Impact Studies\n\nImpact studies evaluate the effect of a programme or policy on a community:\n\n**Steps in evaluating an impact study:**\n1. **Identify the objective:** What was the programme trying to achieve?\n2. **Examine the methodology:** How was the study conducted? (surveys, interviews, data analysis)\n3. **Analyse the findings:** What were the results? Did the programme achieve its goals?\n4. **Consider limitations:** Were there biases? Was the sample representative?\n5. **Assess sustainability:** Will the impact last after the programme ends?\n\n**Example: Evaluating a school feeding scheme**\n- Objective: Reduce hunger and improve concentration\n- Methodology: Compare attendance and grades of participants vs non-participants\n- Findings: 15% improvement in attendance, 8% improvement in test scores\n- Limitations: Other factors (new textbooks, new teachers) may have contributed\n- Sustainability: Depends on continued government funding'),
  q(7, 'When evaluating the effectiveness of a community health programme, which question is MOST important?',
    ['Did the programme achieve measurable improvements in the health outcomes it targeted?', 'How much did the programme cost?', 'Was the programme manager qualified?', 'Was the programme on television?'], 0,
    'The most important evaluation criterion is whether the programme achieved its stated health outcomes. Cost, management, and publicity matter, but outcomes are the primary measure of effectiveness.'),
  t(8, '### Environmental Responsibility\n\n**Key environmental challenges in South Africa:**\n- Water scarcity (SA is a water-stressed country)\n- Air pollution (industrial and vehicle emissions)\n- Land degradation and soil erosion\n- Deforestation and loss of biodiversity\n- Climate change (increasing temperatures, more extreme weather events)\n- Waste management (illegal dumping, limited recycling)\n\n**Individual actions:**\n- Reduce, reuse, recycle\n- Conserve water (fix leaks, shorter showers, rainwater harvesting)\n- Use energy efficiently (switch off lights, use LED bulbs)\n- Use public transport or carpool\n- Support environmentally responsible businesses\n- Participate in community clean-up campaigns'),
  t(9, '### Formulating a Personal Mission and Vision Statement\n\n**Personal vision statement:** Describes who you want to become and what you want to achieve in the long term.\n- Example: "I envision myself as a qualified social worker making a positive difference in my community, advocating for the rights of vulnerable children."\n\n**Personal mission statement:** Describes what you will do daily to work toward your vision.\n- Example: "I commit to studying diligently, volunteering at my local community centre, and treating every person with dignity and respect."\n\n**Steps to create yours:**\n1. Identify your core values (what matters most to you?)\n2. Identify your strengths and passions\n3. Define your long-term goals (5-10 years)\n4. Write a vision statement (1-2 sentences about who you want to be)\n5. Write a mission statement (1-2 sentences about how you will live daily)\n6. Review and revise regularly as you grow'),
  q(10, 'What is the main difference between a personal vision statement and a personal mission statement?',
    ['A vision describes who you want to become; a mission describes what you will do daily to get there', 'They are the same thing with different names', 'A vision is only about career goals; a mission is about personal life', 'A mission is long-term; a vision is short-term'], 0,
    'Your vision is the destination (who you want to become), while your mission is the journey (the daily actions and commitments that will take you there).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Lifestyle Diseases and Health (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Lifestyle Diseases and Health\n\nLifestyle diseases are conditions primarily caused by human factors and everyday habits. In South Africa, these diseases place enormous strain on the healthcare system and reduce quality of life for millions.\n\n### Human Factors Causing Ill-Health\n\n| Factor | Description | Health consequences |\n|--------|-----------|---------------------|\n| **Poor eating habits** | Excessive sugar, fat, processed foods; skipping meals | Obesity, diabetes, heart disease, malnutrition |\n| **Lack of physical activity** | Sedentary lifestyle, excessive screen time | Obesity, cardiovascular disease, poor mental health |\n| **Smoking** | Tobacco use (cigarettes, hookah, vaping) | Lung cancer, COPD, heart disease, stroke |\n| **Substance abuse** | Alcohol, drugs (nyaope, tik, marijuana) | Liver disease, brain damage, addiction, accidents |\n| **Unsafe sexual behaviour** | Unprotected sex, multiple partners | HIV/AIDS, STIs, unplanned pregnancy |\n| **Stress** | Chronic unmanaged stress | Hypertension, weakened immune system, mental illness |'),
  t(2, '### Lifestyle Diseases in South Africa\n\n**Cancer:**\n- Leading types: breast, cervical, prostate, lung, colorectal\n- Risk factors: smoking, poor diet, lack of exercise, genetics, UV exposure\n- Prevention: Regular screening, healthy lifestyle, HPV vaccination for cervical cancer\n\n**Tuberculosis (TB):**\n- South Africa has one of the highest TB rates in the world\n- Linked to HIV (TB-HIV co-infection is common)\n- Spread through airborne droplets (coughing, sneezing)\n- Prevention: BCG vaccine, good ventilation, completing full treatment course\n\n**Hypertension (high blood pressure):**\n- Often called "the silent killer" because symptoms may not be obvious\n- Risk factors: stress, high salt intake, obesity, alcohol, smoking, genetics\n- Complications: Stroke, heart attack, kidney failure'),
  q(3, 'Why is tuberculosis (TB) particularly prevalent in South Africa?',
    ['High HIV rates weaken immune systems, overcrowded living conditions aid spread, and poverty limits access to healthcare', 'TB is only found in South Africa', 'TB is caused by poor diet alone', 'TB is not a serious health concern in SA'], 0,
    'South Africa\'s high TB rates are driven by the HIV epidemic (weakened immune systems increase susceptibility), overcrowded living conditions in informal settlements, and poverty-related barriers to accessing healthcare and completing treatment.'),
  t(4, '### Cardiovascular Disease, STIs, and HIV/AIDS\n\n**Cardiovascular disease (CVD):**\n- Includes heart attacks and strokes\n- SA\'s leading cause of death after HIV/AIDS\n- Risk factors: hypertension, smoking, diabetes, obesity, high cholesterol\n- Prevention: Regular exercise, healthy diet, stress management, no smoking\n\n**Sexually Transmitted Infections (STIs):**\n- Common STIs: chlamydia, gonorrhoea, syphilis, herpes, HPV\n- Often have no symptoms initially, causing silent spread\n- Prevention: Consistent condom use, reducing number of partners, regular testing\n\n**HIV/AIDS:**\n- South Africa has the largest HIV epidemic in the world (approximately 7.8 million people)\n- Antiretroviral treatment (ART) is available free at public clinics\n- Prevention: Condom use, PrEP (pre-exposure prophylaxis), voluntary male medical circumcision, knowing your status\n- Stigma remains a major barrier to testing and treatment'),
  fb(5, 'Hypertension is often called "the ___" because it frequently has no obvious symptoms. South Africa has the ___ HIV epidemic in the world.',
    ['silent killer', 'largest'],
    'Hypertension shows few visible symptoms but causes serious damage to organs over time. South Africa has approximately 7.8 million people living with HIV, making it the world\'s largest epidemic.'),
  t(6, '### Prevention Strategies\n\n**Healthy lifestyle choices:**\n- Eat a balanced diet: fruits, vegetables, whole grains, lean protein\n- Exercise regularly: at least 150 minutes of moderate activity per week\n- Get adequate sleep: 7-9 hours per night\n- Manage stress: relaxation techniques, social support, professional help\n- Avoid tobacco and limit alcohol\n- Practise safe sex: consistent condom use\n\n**Health screenings:**\n- Know your HIV status (test regularly)\n- Blood pressure checks annually\n- Blood sugar testing (especially if family history of diabetes)\n- Pap smears for women (cervical cancer screening)\n- Breast self-examination monthly\n\n**Vaccination:**\n- HPV vaccine for cervical cancer prevention\n- Flu vaccine annually for vulnerable groups\n- COVID-19 vaccination\n- Childhood immunisation schedule (measles, polio, TB)'),
  q(7, 'Which prevention strategy addresses MULTIPLE lifestyle diseases simultaneously?',
    ['Regular physical exercise (reduces risk of obesity, CVD, diabetes, hypertension, and improves mental health)', 'Taking vitamin supplements', 'Drinking herbal tea', 'Avoiding all social contact'], 0,
    'Regular physical exercise is the single most impactful lifestyle change because it simultaneously reduces the risk of obesity, cardiovascular disease, type 2 diabetes, hypertension, certain cancers, and depression.'),
  t(8, '### Action Plan for Treatment, Care, and Support\n\nIf you or someone you know is affected by a lifestyle disease:\n\n**Treatment:**\n- Visit a clinic or doctor for professional diagnosis\n- Follow the prescribed treatment plan (medication, therapy, lifestyle changes)\n- Attend follow-up appointments\n- Do not rely on unproven traditional remedies alone\n\n**Care:**\n- Provide emotional support \u2014 listen without judgement\n- Help with practical needs (transport to clinic, medication reminders)\n- Educate yourself about the condition\n- Respect the person\'s dignity and privacy\n\n**Support resources in South Africa:**\n- Public clinics and hospitals (free healthcare for many conditions)\n- CANSA (Cancer Association of South Africa)\n- Heart and Stroke Foundation SA\n- SA National AIDS Council (SANAC)\n- SANCA (SA National Council on Alcoholism and Drug Dependence)'),
  t(9, '### Benefits of Long-Term Physical Engagement\n\nRegular physical activity over a lifetime provides:\n\n**Physical benefits:**\n- Reduced risk of heart disease, stroke, and type 2 diabetes\n- Stronger bones and muscles (prevents osteoporosis)\n- Healthy body weight maintenance\n- Improved immune function\n- Increased energy levels and physical stamina\n\n**Mental benefits:**\n- Reduced symptoms of anxiety and depression\n- Improved concentration and cognitive function\n- Better sleep quality\n- Increased self-esteem and body confidence\n\n**Social benefits:**\n- Opportunities to build friendships and community connections\n- Teamwork and leadership skills through team sport\n- Sense of achievement and purpose\n\nThe World Health Organisation recommends at least 150 minutes of moderate-intensity activity per week for adults. For children and adolescents, at least 60 minutes of moderate-to-vigorous activity daily.'),
  q(10, 'A friend tells you they do not need to test for HIV because they feel healthy. How should you respond?',
    ['Explain that HIV often has no symptoms for years, so testing is the only way to know your status', 'Agree that feeling healthy means they are not at risk', 'Tell them testing is only for people who are already sick', 'Avoid the topic because it is too personal'], 0,
    'HIV can be asymptomatic for many years. The only way to know your status is through testing. Early detection allows access to ART, which helps maintain health and prevents transmission to others.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Labour Laws and Work Ethics (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Labour Laws and Work Ethics\n\nSouth Africa has a comprehensive framework of labour laws that protect workers\' rights while balancing the needs of employers. Understanding these laws is essential as you enter the world of work.\n\n### Elements of a Job Contract\n\nAn employment contract must include:\n\n| Element | Description |\n|---------|-------------|\n| **Parties** | Full names and details of employer and employee |\n| **Job title and description** | Clear outline of duties and responsibilities |\n| **Start date** | When employment begins |\n| **Place of work** | Where the employee will work |\n| **Working hours** | Normal hours per day and per week |\n| **Remuneration** | Salary/wage amount, payment frequency, deductions |\n| **Leave entitlement** | Annual leave, sick leave, family responsibility leave, maternity leave |\n| **Notice period** | How much notice must be given to terminate employment |\n| **Probation period** | If applicable, the duration and conditions |'),
  t(2, '### Worker Rights and Obligations\n\n**Employee rights:**\n- Fair labour practices (Section 23 of the Constitution)\n- Fair remuneration (at least the national minimum wage)\n- Safe and healthy working conditions\n- Reasonable working hours\n- Leave entitlements (annual, sick, maternity, family responsibility)\n- Protection against unfair dismissal\n- Freedom to join a trade union\n- Protection against unfair discrimination in the workplace\n\n**Employee obligations:**\n- Perform duties as outlined in the contract\n- Be punctual and reliable\n- Follow workplace rules and policies\n- Act honestly and with integrity\n- Treat colleagues and clients with respect\n- Protect the employer\'s property and confidential information\n- Give reasonable notice before resigning'),
  q(3, 'According to South African law, what is the current national minimum wage?',
    ['R27,58 per hour (as of 2025)', 'R15,00 per hour', 'R50,00 per hour', 'There is no minimum wage in SA'], 0,
    'The national minimum wage was introduced in 2019 and is adjusted annually. As of 2025, it is R27,58 per hour. It applies to most workers, with some exceptions for domestic workers and farm workers who have specific rates.'),
  t(4, '### Key Labour Laws\n\n**Labour Relations Act (LRA), 1995:**\n- Regulates the relationship between employers, employees, and trade unions\n- Establishes the CCMA (Commission for Conciliation, Mediation and Arbitration) to resolve disputes\n- Protects the right to strike and to lock out\n- Defines unfair dismissal and unfair labour practices\n- Sets procedures for retrenchment\n\n**Employment Equity Act (EEA), 1998:**\n- Promotes equal opportunity and fair treatment\n- Prohibits unfair discrimination in the workplace\n- Requires designated employers (50+ employees) to implement affirmative action\n- Aims to ensure the workforce reflects the demographics of South Africa\n\n**Basic Conditions of Employment Act (BCEA), 1997:**\n- Sets minimum conditions: working hours (max 45 per week), overtime, leave, notice periods\n- Annual leave: 21 consecutive days per year\n- Sick leave: 30 days over a 3-year cycle\n- Maternity leave: 4 months (at least 6 weeks before and after birth)\n- Family responsibility leave: 3 days per year'),
  fb(5, 'The CCMA stands for the Commission for ___, Mediation and Arbitration. The Act that sets minimum working conditions like leave and working hours is the ___ Act.',
    ['Conciliation', 'Basic Conditions of Employment'],
    'The CCMA resolves labour disputes through conciliation (trying to reach agreement), mediation, and arbitration (making a binding decision). The BCEA sets the minimum standards for working conditions.'),
  t(6, '### Equity and Redress\n\nThe Employment Equity Act aims to address historical workplace inequality:\n\n**Affirmative action:**\n- Measures to ensure equitable representation of designated groups (Black people, women, people with disabilities)\n- Not about hiring unqualified people \u2014 about removing barriers and creating opportunities\n- Includes: preferential hiring, training programmes, mentorship, removal of discriminatory practices\n\n**Debates around affirmative action:**\n- Supporters: It is necessary to correct apartheid\'s legacy and create a representative workforce\n- Critics: It can lead to "reverse discrimination" and appointments based on race rather than merit\n- The Constitutional Court has ruled that affirmative action is lawful when implemented fairly\n\n**BBBEE (Broad-Based Black Economic Empowerment):**\n- Aims to transform the economy by increasing Black ownership, management, and skills development\n- Companies are rated on a scorecard system\n- Affects government tender eligibility'),
  t(7, '### Trade Unions\n\n**Role of trade unions:**\n- Negotiate wages and working conditions on behalf of members (collective bargaining)\n- Protect workers from unfair labour practices\n- Represent workers in disputes with employers\n- Advocate for changes to labour legislation\n\n**Major trade union federations in South Africa:**\n- COSATU (Congress of South African Trade Unions)\n- FEDUSA (Federation of Unions of South Africa)\n- SAFTU (South African Federation of Trade Unions)\n\n**The right to strike:**\n- Protected by Section 23 of the Constitution and the LRA\n- Must follow proper procedures (attempt negotiation first, give notice)\n- Unprotected strikes can result in dismissal\n- Employers have the right to lock out during a dispute'),
  q(8, 'An employer fires an employee without following proper disciplinary procedures. This is an example of:',
    ['Unfair dismissal under the Labour Relations Act', 'A fair dismissal', 'Constructive dismissal', 'Retrenchment'], 0,
    'Dismissal without following proper disciplinary procedures (written warnings, hearings) constitutes unfair dismissal under the LRA. The employee can refer the matter to the CCMA for conciliation or arbitration.'),
  t(9, '### The Recruitment Process and Work Ethics\n\n**Typical recruitment process:**\n1. Job advertisement (newspapers, online portals, company website)\n2. Application (CV, cover letter, application form)\n3. Shortlisting of candidates\n4. Interviews (telephonic, panel, competency-based)\n5. Background and reference checks\n6. Job offer and contract negotiation\n7. Induction and onboarding\n\n**Work ethics and societal expectations:**\n- **Professionalism:** Dress code, punctuality, meeting deadlines\n- **Integrity:** Honesty, transparency, keeping commitments\n- **Accountability:** Taking responsibility for your work and mistakes\n- **Respect:** Treating all colleagues with dignity, regardless of position\n- **Teamwork:** Collaborating effectively with diverse colleagues\n- **Continuous learning:** Staying updated and willing to develop new skills\n\n**The value of work:**\n- Provides income and financial independence\n- Builds self-esteem and purpose\n- Contributes to the economy and community\n- Develops skills and experience\n- Creates social connections'),
  q(10, 'Which Act specifically aims to ensure that the South African workforce reflects the country\'s demographics through affirmative action?',
    ['The Employment Equity Act (EEA)', 'The Basic Conditions of Employment Act (BCEA)', 'The Labour Relations Act (LRA)', 'The Skills Development Act'], 0,
    'The Employment Equity Act (1998) specifically mandates affirmative action measures to ensure equitable representation of designated groups in the workplace.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Revision and Exam Preparation (Term 3-4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\nThe Life Orientation Common Assessment Task (CAT) and final exam require thorough preparation. This chapter consolidates key concepts and equips you with exam strategies specific to LO.\n\n### LO Common Assessment Task (CAT) Structure\n\nThe CAT is a standardised task completed during school time:\n\n| Component | Weighting | Focus |\n|-----------|-----------|-------|\n| **Task 1 (written)** | 50 marks | Application of knowledge to real-life scenarios |\n| **Task 2 (portfolio/project)** | 50 marks | Research, analysis, and personal reflection |\n\n**LO Final Mark:**\n- Year mark (SBA): 75%\n- CAT: 25%\n\n**Note:** LO does not have a final written exam in the NSC. The CAT replaces the exam. However, LO counts toward your NSC certificate but is NOT included in your APS calculation for university admission.'),
  t(2, '### Key Action/Command Words\n\nUnderstanding command words is essential for answering questions correctly:\n\n| Command word | What you must do | Example |\n|-------------|-----------------|----------|\n| **Define** | Give a clear, concise meaning | "Define the term nepotism" |\n| **Describe** | Give a detailed account with relevant facts | "Describe THREE causes of stress" |\n| **Explain** | Give reasons, make clear | "Explain how unemployment affects communities" |\n| **Discuss** | Present various perspectives or aspects in detail | "Discuss the role of media in democracy" |\n| **Evaluate** | Assess strengths and weaknesses, give a judgement | "Evaluate the effectiveness of the 16 Days of Activism" |\n| **Distinguish** | Point out differences between two things | "Distinguish between interpersonal and intrapersonal conflict" |\n| **Suggest** | Provide practical recommendations | "Suggest ways to manage exam stress" |\n| **Analyse** | Break down into parts and examine | "Analyse the impact of corruption on service delivery" |\n| **Critically discuss** | Discuss with evidence, question assumptions | "Critically discuss affirmative action in South Africa" |'),
  q(3, 'A question asks you to "evaluate" a government programme. Which approach is correct?',
    ['Assess both the strengths and weaknesses of the programme and reach a reasoned conclusion', 'Simply define what the programme is', 'List everything you know about government programmes', 'Only mention the positive aspects of the programme'], 0,
    '"Evaluate" requires you to weigh up the positives and negatives (strengths and weaknesses) and then reach a conclusion about the overall value or effectiveness.'),
  t(4, '### Key Definitions to Know\n\n| Term | Definition |\n|------|------------|\n| **Eustress** | Positive stress that motivates performance |\n| **Distress** | Negative stress that overwhelms coping ability |\n| **Interpersonal conflict** | Conflict between two or more people |\n| **Intrapersonal conflict** | Conflict within yourself |\n| **Empathy** | Understanding and sharing another person\'s feelings |\n| **Resilience** | Ability to recover from setbacks and adapt to change |\n| **Ubuntu** | "I am because we are" \u2014 philosophy of shared humanity |\n| **NSFAS** | National Student Financial Aid Scheme |\n| **APS** | Admission Point Score for university entry |\n| **Nepotism** | Favouring family members in appointments |\n| **Cronyism** | Favouring friends in appointments |\n| **Embezzlement** | Theft of entrusted funds |\n| **CCMA** | Commission for Conciliation, Mediation and Arbitration |\n| **BBBEE** | Broad-Based Black Economic Empowerment |\n| **POPIA** | Protection of Personal Information Act |'),
  fb(5, 'The LO Common Assessment Task has two components worth ___ marks each. LO is worth ___% of the SBA (year mark) and 25% for the CAT.',
    ['50', '75'],
    'The CAT consists of two tasks of 50 marks each. The final LO mark is 75% SBA and 25% CAT.'),
  t(6, '### Exam Tips Specific to Life Orientation\n\n**1. Use South African examples:**\n- Reference the Constitution, Bill of Rights, and specific sections\n- Mention specific organisations (SADAG, SARS, NSFAS, CCMA)\n- Use current SA events and campaigns (16 Days of Activism, Human Rights Day)\n- Name relevant legislation (LRA, EEA, BCEA, Cybercrimes Act)\n\n**2. Structure your answers:**\n- For "discuss" questions: use paragraphs with clear topic sentences\n- For "explain" questions: state the point, then elaborate with a reason or example\n- For "evaluate" questions: present positives, then negatives, then a conclusion\n\n**3. Answer in full sentences:**\n- Do not use bullet points unless the question format allows it\n- Use subject-specific terminology\n- Link your answers to the broader South African context\n\n**4. Time management:**\n- Read the entire question paper first\n- Allocate time based on marks\n- Do not spend too long on one question'),
  q(7, 'When answering an LO exam question about human rights, what will strengthen your answer MOST?',
    ['Referring to specific sections of the South African Constitution and relevant legislation', 'Writing as much as possible, even if some content is off-topic', 'Giving only your personal opinion without referencing any sources', 'Copying the question back into your answer'], 0,
    'LO answers are strengthened by specific references to the Constitution (e.g., Section 9 for equality), legislation (e.g., PEPUDA, Cybercrimes Act), and South African organisations and campaigns.'),
  t(8, '### Topic Summary for Quick Revision\n\n**Term 1 Topics:**\n- Stress and crisis management (types of stressors, eustress/distress, coping strategies)\n- Conflict resolution (5 styles, communication, beliefs, values, personality)\n- Relationships and change (initiating/building/sustaining, transition from school)\n- Study skills (study plan, learning styles, exam writing, command words)\n- Careers and career choices (post-school options, NSFAS, applications, CVs)\n- Unemployment and entrepreneurship (causes, impact, solutions, SARS obligations)\n- Fraud and corruption (concepts, causes, impact, prevention, whistleblowing)\n\n**Term 2 Topics:**\n- Democracy and human rights (Bill of Rights, discrimination, media, digital citizenship)\n- Sports and nation building (coverage, transformation, inclusion, freedom of expression)\n- Social and environmental responsibility (government levels, community services, vision/mission)\n\n**Term 3 Topics:**\n- Lifestyle diseases and health (risk factors, prevention, HIV/AIDS, treatment/care)\n- Labour laws and work ethics (contracts, LRA, EEA, BCEA, trade unions, recruitment)'),
  t(9, '### Practice: Applying What You Have Learned\n\nWhen preparing for the CAT, practise applying your knowledge to scenarios:\n\n**Scenario approach:**\n1. Read the scenario carefully\n2. Identify which topic(s) it relates to\n3. Identify the command word (explain, discuss, evaluate, etc.)\n4. Plan your answer briefly before writing\n5. Include specific terminology and SA context\n6. Proofread your answer\n\n**Example scenario:**\n"Thabo lives in a rural area with no internet access. He has a Diploma pass and wants to study engineering at a university of technology. His family earns R200 000 per year."\n\n- **Career choice question:** Thabo qualifies for a Diploma at a university of technology, which aligns with engineering programmes\n- **Funding question:** His family income is below R350 000, so he qualifies for NSFAS\n- **Access to information question:** He faces barriers due to lack of internet \u2014 suggest he visits a local library, DHET office, or contacts universities by phone'),
  q(10, 'Which of the following statements about Life Orientation in Grade 12 is TRUE?',
    ['LO does not have a final written exam; the CAT is the standardised assessment component', 'LO counts toward your APS for university admission', 'The CAT is worth 75% of the final LO mark', 'LO is an optional subject in Grade 12'], 0,
    'LO is unique in that it does not have a final written exam paper. The CAT replaces the exam component. While LO is compulsory and appears on your NSC certificate, it is NOT included in the APS calculation used by universities.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create the Life Orientation subject
  let subjectDoc = await db.collection('subjects').findOne({ name: /Life Orientation/i, schoolId: SCHOOL_ID });
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
      title: 'Chapter 1: Stress and Crisis Management',
      description: 'Apply life skills to adapt to change, understand stressors, signs and symptoms of stress, positive/negative stress, coping mechanisms, and develop a personal strategy.',
      order: 1,
      lessons: [
        { title: 'Stress and Crisis Management', description: 'Types of stressors (physical, emotional, social, environmental), eustress and distress, signs and symptoms, coping mechanisms, and developing your own stress management strategy.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Conflict Resolution',
      description: 'Distinguish between interpersonal and intrapersonal conflict, resolution styles, communication, beliefs, attitudes, personality and values.',
      order: 2,
      lessons: [
        { title: 'Conflict Resolution', description: 'Interpersonal and intrapersonal conflict, five conflict resolution styles, the role of communication, beliefs, attitudes, personality types, and constructive resolution steps.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Relationships and Change',
      description: 'Initiating, building, and sustaining positive relationships, transition from school to post-school, adapting to growth and change, communicating feelings.',
      order: 3,
      lessons: [
        { title: 'Relationships and Change', description: 'Building positive relationships, transition from school to post-school life, adapting to personal, social and work-related change, communicating feelings, understanding others.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Study Skills',
      description: 'Developing a study plan for the NSC, study strategies and styles, time management, examination writing skills, and command words.',
      order: 4,
      lessons: [
        { title: 'Study Skills for the NSC', description: 'Study plans, learning styles, active recall, spaced repetition, time management, exam writing skills, and understanding command words.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Careers and Career Choices',
      description: 'Skills for final action (job/course applications), researching study opportunities, admission requirements, and funding (NSFAS, bursaries, scholarships).',
      order: 5,
      lessons: [
        { title: 'Careers and Career Choices', description: 'Post-school options, NSC pass levels, APS, researching study opportunities, NSFAS and bursaries, CV writing, cover letters, and interview skills.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Unemployment and Entrepreneurship',
      description: 'Reasons and impact of unemployment, innovative solutions, entrepreneurship as a strategy, types of ventures, financial viability, and SARS tax obligations.',
      order: 6,
      lessons: [
        { title: 'Unemployment and Entrepreneurship', description: 'Causes and impact of unemployment, innovative solutions (volunteering, part-time, EPWP), characteristics of entrepreneurs, types of ventures, financial viability, and SARS obligations.', blocks: ch6_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 7: Fraud and Corruption',
      description: 'Related concepts (embezzlement, cronyism, nepotism, bribery), causes and impact, strategies to prevent and combat, whistleblowing.',
      order: 7,
      lessons: [
        { title: 'Fraud and Corruption', description: 'Key concepts (fraud, corruption, embezzlement, bribery, nepotism, cronyism), causes, impact on individuals, companies, communities and country, prevention strategies, and whistleblowing.', blocks: ch7_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 8: Democracy and Human Rights',
      description: 'Discrimination and human rights violations, Bill of Rights, campaigns, role of media, social media, digital footprint, and cyber wellness.',
      order: 8,
      lessons: [
        { title: 'Democracy and Human Rights', description: 'Bill of Rights, forms of discrimination, human rights campaigns, the role of media in democracy, social media and digital footprint, cyber safety, bullying, and POPIA.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Sports and Nation Building',
      description: 'Sports personalities coverage, ideologies and beliefs, recreational activity across cultures and genders, freedom of expression and limitations.',
      order: 9,
      lessons: [
        { title: 'Sports and Nation Building', description: 'Sports coverage and representation, ideologies and worldviews in sport, indigenous games, barriers to participation, freedom of expression, and promoting inclusivity.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Social and Environmental Responsibility',
      description: 'Government responsibilities, community services, educational and intervention programmes, impact studies, personal mission and vision.',
      order: 10,
      lessons: [
        { title: 'Social and Environmental Responsibility', description: 'Levels of government and their responsibilities, community services, prevention and intervention programmes, evaluating impact studies, environmental responsibility, and personal mission/vision statements.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: Lifestyle Diseases and Health',
      description: 'Human factors causing ill-health, lifestyle diseases (cancer, TB, hypertension, CVD, STIs, HIV/AIDS), prevention strategies, treatment/care/support, benefits of physical activity.',
      order: 11,
      lessons: [
        { title: 'Lifestyle Diseases and Health', description: 'Human factors causing ill-health, lifestyle diseases in South Africa, prevention strategies, action plan for treatment/care/support, and benefits of long-term physical engagement.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Labour Laws and Work Ethics',
      description: 'Job contracts, worker rights and obligations, LRA, EEA, BCEA, equity and redress, trade unions, recruitment, work ethics, and the value of work.',
      order: 12,
      lessons: [
        { title: 'Labour Laws and Work Ethics', description: 'Employment contracts, worker rights and obligations, Labour Relations Act, Employment Equity Act, Basic Conditions of Employment Act, trade unions, recruitment process, and work ethics.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Revision and Exam Preparation',
      description: 'LO CAT structure, key action/command words, definition of concepts, exam tips, and topic summaries across all terms.',
      order: 13,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'LO CAT structure, command words, key definitions, exam tips, topic summaries, and scenario-based practice.', blocks: ch13_lesson1, term: 3 },
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
    title: 'Grade 12 Life Orientation \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Development of the Self in Society, Social and Environmental Responsibility, Democracy and Human Rights, Careers and Career Choices, and Study Skills for the Grade 12 Life Orientation curriculum.',
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
  console.log('  TEXTBOOK: Grade 12 Life Orientation');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
