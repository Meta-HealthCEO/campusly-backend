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
// CHAPTER 1: Self-Concept and Self-Motivation (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Self-Concept and Self-Motivation\n\nAs you enter Grade 8 and the Senior Phase, you are going through many changes — physically, emotionally, and socially. Understanding who you are and what motivates you is the first step towards making good choices and building a successful life.\n\n### What Is Self-Concept?\n\nSelf-concept is the image or idea you have of yourself. It includes:\n\n- **Physical self-concept** — how you see your body and appearance\n- **Social self-concept** — how you see yourself in relation to others (popular, shy, friendly, lonely)\n- **Academic self-concept** — how you see yourself as a learner (clever, struggling, hard-working)\n- **Emotional self-concept** — how you see your own feelings and ability to cope\n\nYour self-concept is shaped by your experiences, the people around you, and what you tell yourself. It is not fixed — you can change and improve the way you see yourself.'),
  t(2, '### Self-Esteem\n\nSelf-esteem is how much you value and respect yourself. It is closely linked to self-concept.\n\n| High self-esteem | Low self-esteem |\n|-----------------|----------------|\n| Confident in your abilities | Doubt your abilities |\n| Willing to try new things | Afraid to try in case you fail |\n| Accept mistakes as part of learning | See mistakes as proof you are not good enough |\n| Stand up for yourself | Allow others to mistreat you |\n| Set goals and work towards them | Feel that goals are pointless |\n| Handle criticism constructively | Take all criticism personally |\n\n**Building self-esteem:**\n- Recognise your strengths and achievements — no matter how small\n- Set realistic goals and celebrate when you reach them\n- Surround yourself with supportive people\n- Replace negative self-talk with positive self-talk\n- Help others — it builds a sense of purpose\n- Accept that nobody is perfect — making mistakes is normal'),
  q(3, 'Naledi always tells herself "I am useless at everything." She avoids trying new things because she is afraid of failing. What does Naledi most likely have?',
    ['Low self-esteem — she does not value her own abilities', 'High self-esteem — she is confident', 'A physical illness', 'Too many friends'], 0,
    'Naledi\'s negative self-talk and fear of failure are signs of low self-esteem. She does not value herself or believe in her abilities. Building self-esteem involves changing negative thinking patterns and recognising her strengths.'),
  t(4, '### Factors That Influence Self-Concept Formation\n\nMany factors shape how you see yourself:\n\n| Factor | How it influences self-concept |\n|--------|------------------------------|\n| **Media** | Unrealistic beauty standards, comparison with influencers, advertising that makes you feel "not good enough" |\n| **Environment** | A safe, supportive home builds positive self-concept; an unsafe, unstable environment can damage it |\n| **Friends and peers** | Supportive friends boost self-concept; bullying and exclusion damage it |\n| **Family** | Encouragement and love build confidence; criticism and neglect undermine it |\n| **Culture** | Cultural values and expectations shape your identity |\n| **Religion** | Religious beliefs can give a sense of purpose and belonging |\n| **Community** | Being part of a community creates a sense of identity and belonging |\n\n**Social media and self-concept:**\nSocial media can be especially harmful to self-concept. People post only their best moments, making it seem like everyone else has a perfect life. Comparing yourself to these filtered images can make you feel inadequate. Remember: what you see online is rarely the full truth.'),
  fb(5, 'The image or idea you have of yourself is called your ___. How much you value and respect yourself is called your self-___.',
    ['self-concept', 'esteem'],
    'Self-concept is the overall picture you have of who you are. Self-esteem is specifically about how much value and respect you place on yourself.'),
  t(6, '### Positive Self-Talk and Personal Achievements\n\nPositive self-talk is the practice of deliberately replacing negative thoughts with encouraging ones:\n\n| Negative self-talk | Positive self-talk |\n|-------------------|-------------------|\n| "I am stupid" | "I am still learning and improving" |\n| "Nobody likes me" | "I have people who care about me" |\n| "I will never be good enough" | "I am doing my best, and that is enough" |\n| "I always fail" | "I learn something every time I try" |\n| "I can\'t do this" | "I can\'t do this YET, but I will keep trying" |\n\n**Recognising your uniqueness:**\nEvery person has unique qualities, talents, and strengths. Your individuality is something to celebrate, not hide. Make a list of:\n- Things you are good at (even small things like being a good listener)\n- Achievements you are proud of (passing a test, helping someone, learning a new skill)\n- Qualities others appreciate about you\n\n**Strategies to extend personal potential:**\n- Try new activities — join a club, learn an instrument, volunteer\n- Ask for feedback from people you trust\n- Read widely and learn new skills\n- Set small challenges for yourself and build up gradually'),
  q(7, 'Which of the following is an example of positive self-talk?',
    ['"I cannot do this YET, but I will keep trying"', '"I am useless and will never improve"', '"Everyone is better than me"', '"There is no point in trying"'], 0,
    'Positive self-talk acknowledges difficulty while maintaining hope and effort. The word "yet" is powerful — it recognises that abilities can grow with practice and persistence.'),
  t(8, '### Self-Motivation\n\nSelf-motivation is the ability to push yourself to take action and achieve goals without needing others to tell you what to do.\n\n**Types of motivation:**\n- **Intrinsic motivation** — doing something because it is personally rewarding (you enjoy reading, so you read)\n- **Extrinsic motivation** — doing something because of an external reward or to avoid punishment (studying to pass a test, working to earn money)\n\nBoth types are useful, but intrinsic motivation is more powerful and lasting.\n\n**How to stay motivated:**\n- Set clear, achievable goals\n- Break big tasks into smaller steps\n- Reward yourself when you reach milestones\n- Visualise success — imagine how it will feel to achieve your goal\n- Find a study partner or accountability buddy\n- Remember your "why" — why does this goal matter to you?\n- Do not compare yourself to others — compare yourself to who you were yesterday'),
  q(9, 'Kagiso studies hard because he genuinely loves learning about science and wants to understand how the world works. What type of motivation is this?',
    ['Intrinsic motivation — he is driven by personal interest and enjoyment', 'Extrinsic motivation — he is motivated by an external reward', 'Peer pressure — his friends told him to study', 'No motivation — he studies by accident'], 0,
    'Intrinsic motivation comes from within — Kagiso studies because he finds science interesting and personally rewarding, not because of external rewards or pressure.'),
  fb(10, 'Motivation that comes from personal enjoyment and interest is called ___ motivation. Motivation driven by external rewards or punishments is called ___ motivation.',
    ['intrinsic', 'extrinsic'],
    'Intrinsic motivation comes from inside you — you do it because you enjoy it. Extrinsic motivation comes from outside — you do it for a reward or to avoid a consequence.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Sexuality and Relationships (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Understanding Sexuality\n\nSexuality is a natural part of being human. As a Grade 8 learner, you are entering adolescence — a time of significant physical and emotional change. Understanding your sexuality and how it develops helps you make informed, responsible decisions.\n\n### What Is Sexuality?\n\nSexuality is more than just physical changes. It includes:\n\n- **Physical aspects** — body changes during puberty\n- **Emotional aspects** — new feelings, attractions, and emotions\n- **Social aspects** — how you relate to others, friendships, and romantic interests\n- **Psychological aspects** — your attitudes, values, and beliefs about relationships\n\n### Personal Feelings About Sexuality\n\nIt is normal during adolescence to:\n- Feel curious about your changing body\n- Experience new emotions and mood swings\n- Develop attractions to others\n- Feel awkward or self-conscious about body changes\n- Have questions about sex and relationships\n\nThese feelings are part of growing up. What matters is how you manage them — through informed choices, open communication with trusted adults, and respect for yourself and others.'),
  t(2, '### Influences on Sexuality\n\nMany factors shape how you understand and express your sexuality:\n\n**Friends and peers:**\n- Peers may share information about sex — but this information is often incorrect or exaggerated\n- Peer pressure can push young people into sexual activity before they are ready\n- True friends respect your boundaries and decisions\n\n**Family and community norms:**\n- Families teach values about relationships, respect, and appropriate behaviour\n- Cultural and religious norms influence attitudes towards sexuality\n- Some communities discuss sexuality openly; others consider it taboo\n\n**Media and social media:**\n- Movies, music, and TV often portray sex unrealistically\n- Social media can expose young people to inappropriate content\n- Advertising uses sexuality to sell products\n- Media rarely shows the consequences of irresponsible sexual behaviour\n\n**Important:** Not everything you see in the media or hear from friends is accurate. Trusted sources of information include parents, teachers, school counsellors, nurses at clinics, and reputable health websites.'),
  q(3, 'Themba\'s friends tell him that "everyone our age is already sexually active." Which of the following is the BEST response?',
    ['"That is not true — many learners our age are not sexually active, and I will make my own decision"', '"You are right, I should try it too"', '"I will pretend I am also experienced so they accept me"', '"I do not care what you think" (and walk away angrily)'], 0,
    'The best response is assertive and factual. Many Grade 8 learners are NOT sexually active, despite what peers may claim. Making your own informed decision based on facts — not peer pressure — is a sign of maturity and self-respect.'),
  t(4, '### Relationships and Friendships\n\nHealthy relationships are essential for well-being at home, at school, and in the community.\n\n**Qualities of a healthy relationship:**\n- Mutual respect — you value each other\'s opinions and boundaries\n- Trust — you can rely on each other\n- Honesty — you are truthful with each other\n- Good communication — you listen and express feelings openly\n- Support — you encourage each other\'s goals\n- Equality — neither person dominates or controls the other\n\n**Types of relationships:**\n\n| Type | Examples |\n|------|----------|\n| **Family** | Parents, siblings, grandparents, extended family |\n| **Friendships** | School friends, neighbourhood friends, online friends |\n| **Romantic** | Boyfriend/girlfriend relationships (age-appropriate) |\n| **Community** | Neighbours, teachers, coaches, religious leaders |\n\n**Appropriate ways to initiate a relationship:**\n- Be yourself — do not pretend to be someone you are not\n- Show genuine interest in the other person\n- Respect their boundaries and feelings\n- Build trust gradually through consistent, kind behaviour'),
  fb(5, 'A healthy relationship is built on mutual ___, trust, and good communication. It is normal during adolescence to experience new emotions and develop ___ to others.',
    ['respect', 'attractions'],
    'Mutual respect means valuing each other as equals. Developing attractions during adolescence is a normal part of growing up.'),
  t(6, '### Sustaining and Ending Relationships\n\n**How to sustain a healthy relationship:**\n- Communicate openly — share your feelings and listen to theirs\n- Spend quality time together\n- Resolve conflicts calmly — do not let small issues grow into big problems\n- Support each other through difficult times\n- Respect each other\'s need for space and independence\n\n**How to end a relationship appropriately:**\nSometimes relationships need to end. This is normal and healthy when:\n- The relationship is no longer making you happy\n- There is abuse, manipulation, or disrespect\n- You have grown apart and want different things\n\n**Appropriate ways to end a relationship:**\n- Be honest but kind — explain your reasons without being cruel\n- Do it in person, not by text or social media\n- Do not gossip about the other person\n- Allow yourself and the other person time to heal\n- Remain respectful even after the relationship ends\n\n**Inappropriate ways to end a relationship:**\n- Ghosting (suddenly stopping all communication)\n- Humiliating the other person publicly\n- Spreading rumours or private information\n- Getting someone else to break up for you'),
  q(7, 'Lindiwe wants to end her friendship with Buhle because Buhle constantly criticises her and makes her feel bad about herself. What should Lindiwe do?',
    ['Talk to Buhle honestly, explain how her behaviour is hurtful, and if it does not change, end the friendship respectfully', 'Stay in the friendship because ending it would be mean', 'Spread rumours about Buhle to get back at her', 'Ghost Buhle without any explanation'], 0,
    'The healthiest approach is to communicate honestly first. If the behaviour does not change, ending the friendship respectfully is the right choice. Staying in a toxic relationship damages self-esteem.'),
  t(8, '### Problem-Solving Skills in Relationships\n\nConflicts are a normal part of any relationship. What matters is how you handle them:\n\n**Steps for resolving relationship conflicts:**\n1. **Identify the problem** — What exactly is the issue?\n2. **Cool down** — Do not try to solve problems when you are angry\n3. **Listen actively** — Let the other person share their side without interrupting\n4. **Express your feelings** — Use "I" statements: "I feel hurt when..." instead of "You always..."\n5. **Look for solutions** — Brainstorm ideas that work for both people\n6. **Agree and act** — Choose a solution and put it into practice\n7. **Follow up** — Check that the solution is working\n\n**Communication skills for disagreeing constructively:**\n- Be assertive, not aggressive — express yourself clearly without attacking\n- Focus on the behaviour, not the person — "That action hurt me" not "You are a terrible person"\n- Be willing to compromise — you will not always get everything you want\n- Know when to walk away — some arguments are not worth having'),
  q(9, 'Two friends disagree about where to sit at lunch. One gets angry and starts shouting. What is the BEST first step to resolve this conflict?',
    ['Both should cool down before trying to discuss the problem calmly', 'The louder person should get their way since they feel more strongly', 'They should ask other friends to take sides', 'They should never speak to each other again'], 0,
    'Cooling down is always the first step. Trying to solve a conflict when emotions are high leads to escalation. Once both people are calm, they can discuss the issue and find a compromise.'),
  fb(10, 'Using "I feel hurt when..." instead of "You always..." is an example of using ___ statements. The ability to express yourself clearly without attacking is called being ___.',
    ['"I"', 'assertive'],
    '"I" statements focus on your own feelings rather than blaming the other person, which keeps communication constructive. Assertiveness means expressing yourself clearly and confidently without being aggressive.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: World of Work — Learning Styles and Study Skills (Term 1–2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Learning Styles and Study Skills\n\nEvery person learns differently. Understanding your own learning style helps you study more effectively and achieve better results. As a Grade 8 learner entering the Senior Phase, developing strong study skills now will benefit you throughout your school career.\n\n### Different Learning Styles\n\nThere are four main learning styles:\n\n| Learning style | How you learn best | Study strategies |\n|---------------|-------------------|------------------|\n| **Visual** | Seeing — pictures, diagrams, charts, colours | Use mind maps, highlight notes in different colours, watch educational videos, draw diagrams |\n| **Aural (auditory)** | Hearing — listening, discussing, explaining | Read notes aloud, record lessons and listen again, discuss with study partners, use rhymes or songs |\n| **Kinaesthetic** | Doing — hands-on activities, movement | Use flashcards, act out processes, build models, take breaks to move around |\n| **Reading and writing** | Words — reading texts, writing notes | Rewrite notes, make lists and summaries, read textbooks, write practice essays |\n\n**Most people use a combination** of learning styles, but one or two styles usually dominate. Knowing your preferred style helps you choose study methods that work for you.'),
  t(2, '### Identifying Your Learning Style\n\nAsk yourself these questions to identify your learning style:\n\n**You might be a visual learner if:**\n- You remember information better when you see it written down\n- You prefer diagrams and charts to long explanations\n- You can picture things clearly in your mind\n- You notice details in your environment\n\n**You might be an aural learner if:**\n- You remember things better when you hear them\n- You enjoy discussions and group work\n- You can follow verbal instructions easily\n- You often hum or talk to yourself while studying\n\n**You might be a kinaesthetic learner if:**\n- You learn best by doing, touching, or moving\n- You find it hard to sit still for long periods\n- You prefer practical activities over theory\n- You use your hands a lot when explaining things\n\n**You might be a reading/writing learner if:**\n- You enjoy reading and writing\n- You take detailed notes in class\n- You prefer written instructions over verbal ones\n- You learn well from textbooks and handouts'),
  q(3, 'Zanele learns best when she draws diagrams, uses mind maps, and highlights her notes in different colours. What is her dominant learning style?',
    ['Visual — she learns best by seeing and using visual tools', 'Aural — she learns best by listening', 'Kinaesthetic — she learns best by doing', 'Reading/writing — she learns best from text'], 0,
    'Visual learners process information best through seeing. Diagrams, mind maps, colour-coding, and charts are all visual learning strategies.'),
  t(4, '### Self-Management Skills\n\nSelf-management means taking responsibility for your own learning and behaviour:\n\n**Key self-management skills for Grade 8:**\n\n| Skill | What it means | How to develop it |\n|-------|--------------|-------------------|\n| **Organisation** | Keeping your work, books, and schedule in order | Use a school diary, keep your bag packed the night before, file notes by subject |\n| **Time management** | Using your time wisely | Create a study timetable, set deadlines, avoid procrastination |\n| **Goal-setting** | Knowing what you want to achieve and planning how | Set specific goals for each subject, break them into weekly targets |\n| **Self-discipline** | Doing what needs to be done even when you do not feel like it | Study before watching TV, complete homework on time, limit social media |\n| **Responsibility** | Accepting that your results depend on YOUR effort | Do not blame teachers or friends — take ownership of your learning |\n\n**Basic hygiene principles:**\nSelf-management also includes personal hygiene — bathing daily, wearing clean clothes, brushing teeth, and using deodorant. Good hygiene shows self-respect and helps you feel confident at school.'),
  fb(5, 'The four main learning styles are visual, aural, kinaesthetic, and ___. Taking responsibility for your own learning and behaviour is called self-___.',
    ['reading and writing', 'management'],
    'The four learning styles are visual (seeing), aural (hearing), kinaesthetic (doing), and reading/writing (words). Self-management means taking charge of your own learning, behaviour, and well-being.'),
  t(6, '### Effective Study Methods\n\nStudying is not just reading your notes over and over. Effective study uses active learning methods:\n\n**Active study techniques:**\n- **Summarising** — condense a chapter into key points in your own words\n- **Teaching others** — if you can explain it, you understand it\n- **Practice questions** — test yourself with past papers or make up your own questions\n- **Mind maps** — organise ideas visually to show connections\n- **Flashcards** — write a question on one side and the answer on the other\n- **Spaced repetition** — review material at increasing intervals (today, tomorrow, next week)\n\n**Avoiding common study mistakes:**\n- Do not just read passively — engage with the material\n- Do not study for hours without breaks — take a 10-minute break every 45 minutes\n- Do not leave everything to the last minute — start preparing early\n- Do not study with your phone next to you — it is the biggest distraction\n- Do not study in a noisy or uncomfortable environment\n- Do not skip subjects you find difficult — spend MORE time on them, not less'),
  q(7, 'Sipho reads through his notes five times before a test but still does badly. What should he do differently?',
    ['Use active study methods like summarising, practice questions, and teaching others instead of passive reading', 'Read his notes ten times instead of five', 'Study with the TV on for background noise', 'Give up studying because it does not work for him'], 0,
    'Passive reading is one of the least effective study methods. Active techniques like summarising, doing practice questions, and teaching others force the brain to process information more deeply, leading to better understanding and recall.'),
  t(8, '### Creating a Study Timetable\n\nA study timetable helps you manage your time and cover all subjects:\n\n**Steps to create a timetable:**\n1. List all your subjects and upcoming tests or assignments\n2. Identify your most productive time of day (morning, afternoon, evening)\n3. Allocate more time to difficult subjects\n4. Include short breaks (10 minutes every 45 minutes)\n5. Include time for sport, hobbies, and relaxation\n6. Stick to your timetable — consistency is key\n\n**Sample daily study plan:**\n\n| Time | Activity |\n|------|----------|\n| 15:00–15:30 | Arrive home, snack, relax |\n| 15:30–16:15 | Subject 1 (difficult subject — study when alert) |\n| 16:15–16:25 | Break |\n| 16:25–17:10 | Subject 2 |\n| 17:10–17:20 | Break |\n| 17:20–18:00 | Homework and revision |\n| 18:00 onwards | Dinner, family time, relax |\n\n**Remember:** Quality matters more than quantity. Forty-five minutes of focused study is worth more than two hours of distracted study.'),
  q(9, 'Why should you study your most difficult subject first in your study timetable?',
    ['Because your concentration and energy are highest at the start, making it easier to tackle hard material', 'Because difficult subjects take less time', 'Because you should always do hard things last', 'Because it does not matter what order you study in'], 0,
    'Your brain is freshest and most alert at the start of a study session. Tackling your hardest subject first means you have the most energy and concentration available for the most demanding work.'),
  fb(10, 'Reviewing material at increasing intervals (today, tomorrow, next week) is called spaced ___. A focused 45-minute study session is worth more than two hours of ___ study.',
    ['repetition', 'distracted'],
    'Spaced repetition strengthens memory by reviewing material at gradually increasing intervals. Distracted study (with phone, TV, or noise) wastes time because the brain cannot process information properly.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Career Awareness and the World of Work (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Career Awareness and the World of Work\n\nIt is never too early to start thinking about your future career. In Grade 8, you begin exploring different career categories, the skills they require, and how your school subjects connect to the world of work.\n\n### Six Career Categories\n\nCareers can be grouped into six broad categories based on the type of work involved:\n\n| Category | What it involves | Career examples |\n|----------|-----------------|----------------|\n| **Investigative** | Research, analysis, problem-solving, scientific inquiry | Scientist, doctor, researcher, detective, analyst |\n| **Enterprising** | Leading, persuading, managing, selling | Business owner, lawyer, politician, sales manager |\n| **Realistic** | Hands-on work, building, fixing, operating machinery | Mechanic, farmer, electrician, chef, builder |\n| **Artistic** | Creating, designing, performing, expressing ideas | Musician, graphic designer, writer, actor, architect |\n| **Conventional** | Organising, recording, managing data, following procedures | Accountant, secretary, bank teller, data capturer |\n| **Social** | Helping, teaching, counselling, caring for others | Teacher, nurse, social worker, psychologist, pastor |'),
  t(2, '### Interests and Abilities Related to Career Categories\n\nChoosing the right career starts with understanding your own interests and abilities:\n\n**How to identify your interests:**\n- What activities do you enjoy doing in your free time?\n- Which school subjects do you look forward to?\n- What topics do you voluntarily read about or watch videos on?\n- What kind of problems do you enjoy solving?\n\n**How to identify your abilities:**\n- What subjects do you perform well in?\n- What tasks come naturally to you?\n- What do teachers and family members say you are good at?\n- What skills have you developed through hobbies or activities?\n\n**Matching interests and abilities to career categories:**\n\n| If you enjoy... | You may suit the... | Career examples |\n|----------------|--------------------|-----------------|\n| Science experiments and puzzles | Investigative category | Engineer, pharmacist, IT specialist |\n| Leading groups and debating | Enterprising category | Entrepreneur, manager, advocate |\n| Building and fixing things | Realistic category | Plumber, pilot, paramedic |\n| Drawing, music, and creative writing | Artistic category | Animator, fashion designer, journalist |\n| Organising and working with numbers | Conventional category | Bookkeeper, administrator, auditor |\n| Helping people and volunteering | Social category | Counsellor, doctor, community worker |'),
  q(3, 'Mpho enjoys leading group projects, debating in class, and has started a small business selling snacks at school. Which career category best matches her interests?',
    ['Enterprising — she enjoys leading, persuading, and managing', 'Realistic — she enjoys hands-on work', 'Conventional — she enjoys organising data', 'Artistic — she enjoys creative expression'], 0,
    'Mpho\'s love of leadership, debate, and entrepreneurship points clearly to the enterprising career category. Enterprising people enjoy persuading others, taking initiative, and managing projects or businesses.'),
  t(4, '### Thinking and Learning Skills for Different Careers\n\nDifferent careers require different thinking skills. School subjects help you develop these skills:\n\n| Thinking skill | How school develops it | Careers that need it |\n|---------------|----------------------|---------------------|\n| **Critical thinking** | Analysing texts, evaluating evidence, solving problems | Lawyer, journalist, scientist, doctor |\n| **Creative thinking** | Art projects, creative writing, design tasks | Architect, marketing manager, game developer |\n| **Logical thinking** | Mathematics, coding, science experiments | Engineer, programmer, accountant, pilot |\n| **Communication** | Languages, oral presentations, debates | Teacher, journalist, counsellor, salesperson |\n| **Practical skills** | Technology, life skills, science practicals | Mechanic, chef, electrician, surgeon |\n| **Teamwork** | Group projects, sport, school committees | Almost every career requires teamwork |\n\n**The role of school subjects:**\nEvery subject you take in school develops skills that employers value. Even if you do not use the specific content (like quadratic equations), the thinking skills you develop (problem-solving, logical reasoning) are valuable in any career.'),
  fb(5, 'The six career categories are investigative, enterprising, realistic, artistic, conventional, and ___. A career as a teacher falls under the ___ career category.',
    ['social', 'social'],
    'The six career categories cover all types of work. Teaching is a social career because it involves helping, educating, and caring for others.'),
  t(6, '### The Role of Work in South Africa\n\nWork is essential for individuals, families, and the country:\n\n**For individuals:**\n- Provides income to meet basic needs (food, shelter, clothing)\n- Gives a sense of purpose and achievement\n- Develops skills and builds experience\n- Creates social connections and community\n\n**For South Africa\'s social and economic needs:**\n- Employment reduces poverty and inequality\n- Skilled workers drive economic growth\n- Tax revenue from workers funds public services (schools, clinics, roads)\n- South Africa has a skills shortage in many fields — the country NEEDS skilled workers\n\n**Challenges in the South African workplace:**\n- High unemployment rate (especially among youth)\n- Skills mismatch — many graduates cannot find jobs in their field\n- Inequality — some groups have fewer opportunities than others\n- The need for transformation to correct historical imbalances\n\n**How you can prepare:**\n- Take school seriously — education is the foundation of a successful career\n- Develop both academic and practical skills\n- Stay informed about career opportunities in South Africa\n- Consider careers in high-demand fields (healthcare, IT, engineering, education)'),
  q(7, 'Why is it important for South Africa to develop more skilled workers?',
    ['Because skilled workers drive economic growth, reduce poverty, and fill critical shortages in the country', 'Because having qualifications guarantees wealth', 'Because unskilled workers are not needed in the economy', 'Because education is only important for getting a university degree'], 0,
    'South Africa faces a significant skills shortage in many sectors. Skilled workers contribute to economic growth, help reduce poverty and inequality, and fill critical roles in healthcare, engineering, education, and technology.'),
  t(8, '### Needs in the Community and Country\n\nUnderstanding community and country needs helps you identify careers where you can make a difference:\n\n**Critical needs in South Africa:**\n\n| Need | Career opportunity |\n|------|-------------------|\n| **Healthcare** | Doctors, nurses, pharmacists, community health workers |\n| **Education** | Teachers (especially in Maths, Science, and languages) |\n| **Infrastructure** | Civil engineers, electricians, plumbers, builders |\n| **Technology** | Software developers, data scientists, cybersecurity experts |\n| **Agriculture** | Farmers, agricultural scientists, food technologists |\n| **Safety** | Police officers, firefighters, paramedics |\n| **Social services** | Social workers, psychologists, community developers |\n\n**How work can meet social and economic needs:**\n- A nurse in a rural clinic serves hundreds of community members\n- A teacher shapes the future of learners for generations\n- An engineer builds infrastructure that creates jobs and connects communities\n- A farmer produces food that feeds the nation\n\nYour career choice is not just about earning money — it is about contributing to your community and country.'),
  q(9, 'Which career field has one of the biggest shortages in South African schools?',
    ['Mathematics and Science teachers — there is a critical shortage in these subjects', 'Professional athletes', 'Social media influencers', 'Fashion models'], 0,
    'South Africa has a severe shortage of qualified Mathematics and Science teachers, especially in rural and township schools. This shortage affects learners\' performance and limits their career options.'),
  fb(10, 'South Africa has a critical shortage of qualified ___ and Science teachers. Your career choice should consider both your interests and the ___ of your community and country.',
    ['Mathematics', 'needs'],
    'The shortage of Maths and Science teachers is one of South Africa\'s biggest educational challenges. Choosing a career that aligns with community needs means you can earn a living while making a real difference.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Substance Abuse (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Substance Abuse\n\nSubstance abuse is one of the most serious health and social problems facing young people in South Africa. This chapter examines the social factors that contribute to substance abuse, the consequences of addiction, and where to find help.\n\n### What Is Substance Abuse?\n\nSubstance abuse is the harmful use of substances such as alcohol, tobacco, and drugs. It includes:\n\n- Using illegal drugs (dagga/marijuana, tik/methamphetamine, nyaope, cocaine, heroin)\n- Misusing legal substances (alcohol, over-the-counter medication, prescription drugs)\n- Using tobacco products (cigarettes, hubbly bubbly/hookah, e-cigarettes/vapes)\n- Inhaling harmful substances (glue, petrol, aerosols — known as "sniffing" or "huffing")\n\n**Key terms:**\n- **Use** — trying a substance once or occasionally\n- **Misuse** — using a substance in a way that is harmful (e.g., binge drinking)\n- **Abuse** — regular, harmful use despite negative consequences\n- **Dependence/addiction** — being unable to stop using the substance even though you want to'),
  t(2, '### Social Factors Contributing to Substance Abuse\n\nMany social factors push young people towards substance abuse:\n\n| Factor | How it contributes |\n|--------|-------------------|\n| **Peer pressure** | Friends dare you to try substances or make you feel excluded if you refuse |\n| **Community and media** | Alcohol advertising, music videos, and social media glamorise drinking and drug use |\n| **Family problems** | Domestic violence, absent parents, or family members who abuse substances |\n| **Poverty and unemployment** | Desperation, boredom, and lack of opportunities |\n| **Easy access** | Taverns near schools, illegal drug dealers in communities, unsupervised homes with alcohol |\n| **Low self-esteem** | Using substances to fit in or escape feelings of worthlessness |\n| **Stress and trauma** | Using substances to cope with pain, violence, or emotional distress |\n| **Lack of education** | Not understanding the real dangers of substances |\n\n**South African context:**\n- South Africa has one of the highest rates of alcohol consumption in Africa\n- Dagga is the most commonly used illegal drug among SA youth\n- Tik (methamphetamine) is a major problem in the Western Cape\n- Nyaope (a heroin-based mixture) is devastating communities in Gauteng and other provinces'),
  q(3, 'Which social factor is the MOST common reason Grade 8 learners first try alcohol or drugs?',
    ['Peer pressure — friends pressure them to try substances to fit in', 'Medical necessity — a doctor prescribed it', 'Academic achievement — substances help them study better', 'Financial gain — they can earn money from substance use'], 0,
    'Peer pressure is the most common reason young people first experiment with substances. The desire to fit in, be accepted, or appear "cool" is powerful during adolescence.'),
  t(4, '### Consequences of Substance Abuse\n\nSubstance abuse has devastating effects on every aspect of life:\n\n**Physical consequences:**\n- Brain damage — especially harmful during adolescence when the brain is still developing\n- Organ damage — liver disease (alcohol), lung disease (smoking), heart problems\n- Weakened immune system — more likely to get sick\n- Addiction — the body becomes dependent on the substance\n- Overdose — can lead to death\n\n**Psychological consequences:**\n- Depression, anxiety, and paranoia\n- Impaired judgement leading to risky decisions\n- Memory loss and difficulty concentrating\n- Psychosis (losing touch with reality, especially with tik and dagga)\n- Suicidal thoughts\n\n**Social consequences:**\n- Damaged relationships with family and friends\n- Poor academic performance and school dropout\n- Criminal behaviour (stealing to fund addiction, violence)\n- Loss of employment and future opportunities\n- Stigma and social isolation\n\n**Educational consequences:**\n- Cannot concentrate in class\n- Absent from school frequently\n- Drop in marks\n- Possible expulsion'),
  fb(5, 'Being unable to stop using a substance even though you want to is called ___. The most commonly used illegal drug among South African youth is ___.',
    ['addiction', 'dagga'],
    'Addiction (dependence) occurs when the body and brain become dependent on a substance. Dagga (marijuana/cannabis) is the most widely used illegal substance among young people in South Africa.'),
  t(6, '### Appropriate Behaviour to Stop and Avoid Substance Abuse\n\nYou have the power to say no and protect yourself:\n\n**Refusal skills — how to say NO:**\n- Be direct and firm: "No thanks, I do not use drugs"\n- Give a reason: "No, it will affect my sport performance"\n- Suggest an alternative: "Let\'s go play soccer instead"\n- Walk away — you do not owe anyone an explanation\n- Use the "broken record" technique: keep repeating "No, I am not interested"\n\n**Decision-making skills:**\n1. Identify the situation — someone is offering you a substance\n2. Think about consequences — what could happen if you say yes?\n3. Consider your values — what matters most to you?\n4. Make your decision — choose based on facts, not pressure\n5. Act on your decision — follow through with confidence\n\n**Building protective factors:**\n- Stay involved in sport, clubs, and positive activities\n- Choose friends who respect your decisions\n- Spend time with family and trusted adults\n- Set goals — people with clear goals are less likely to abuse substances\n- Learn healthy ways to deal with stress (exercise, talking, creative outlets)'),
  q(7, 'At a party, someone offers Thandi a cigarette. She says "No thanks" but they keep pressuring her. What technique should she use?',
    ['The broken record technique — keep calmly repeating "No, I am not interested" until they stop', 'Take the cigarette to avoid conflict', 'Get angry and start a fight', 'Pretend to smoke but not inhale'], 0,
    'The broken record technique involves calmly and firmly repeating your refusal without getting angry or giving in. It shows that you have made your decision and will not be pressured.'),
  t(8, '### Long-Term and Short-Term Consequences of Substance Abuse\n\n| Substance | Short-term effects | Long-term effects |\n|-----------|-------------------|-------------------|\n| **Alcohol** | Impaired judgement, slurred speech, nausea, risky behaviour | Liver disease, brain damage, addiction, heart disease |\n| **Tobacco/vaping** | Bad breath, coughing, reduced fitness | Lung cancer, emphysema, heart disease, addiction |\n| **Dagga (marijuana)** | Altered perception, slow reactions, memory problems | Lung damage, mental health issues, reduced motivation |\n| **Tik (methamphetamine)** | Euphoria, hyperactivity, loss of appetite | Severe brain damage, psychosis, tooth decay, extreme weight loss |\n| **Nyaope** | Euphoria, drowsiness | Severe addiction, organ failure, risk of HIV (shared needles) |\n\n**Link to crime, violence, and educational outcomes:**\n- Substance abuse is linked to higher rates of crime — theft, assault, domestic violence\n- Learners who abuse substances are more likely to drop out of school\n- Substance abuse impairs judgement, increasing the risk of unsafe sexual behaviour and teenage pregnancy'),
  q(9, 'Why is substance abuse ESPECIALLY dangerous for teenagers compared to adults?',
    ['Because the teenage brain is still developing, making it more vulnerable to damage and addiction', 'Because teenagers have stronger bodies than adults', 'Because the law does not apply to teenagers', 'Because substances are weaker when used by teenagers'], 0,
    'The adolescent brain continues developing until approximately age 25. Substance use during this period can cause permanent damage to brain development, impair decision-making, and lead to stronger addiction than if the same person started using as an adult.'),
  fb(10, 'Calmly repeating your refusal when someone pressures you is called the ___ record technique. Substance abuse during adolescence is especially dangerous because the brain is still ___.',
    ['broken', 'developing'],
    'The broken record technique is an effective refusal strategy. The adolescent brain continues developing until about age 25, making it particularly vulnerable to the harmful effects of substances.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Environmental Health (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Environmental Health\n\nThe environment directly affects our health and well-being. In South Africa, environmental issues such as pollution, water scarcity, and poor waste management contribute to disease and lower quality of life. This chapter explores environmental health issues and what you can do to make a difference.\n\n### What Is Environmental Health?\n\nEnvironmental health is the branch of public health concerned with how the environment affects human health. It includes:\n\n- Air quality (pollution from factories, vehicles, fires)\n- Water quality (contaminated water, lack of clean water)\n- Waste management (littering, illegal dumping, recycling)\n- Sanitation (access to clean toilets and sewage systems)\n- Food safety (safe food handling, prevention of food-borne diseases)\n- Climate change and its impact on health\n\n### Environmental Health Issues in South Africa\n\n| Issue | Impact on health |\n|-------|------------------|\n| **Air pollution** | Respiratory diseases (asthma, bronchitis), especially in communities near mines and factories |\n| **Water pollution** | Cholera, diarrhoea, typhoid — especially in areas without clean water |\n| **Poor waste management** | Breeding ground for rats, flies, and mosquitoes that spread disease |\n| **Lack of sanitation** | Waterborne diseases, unsafe conditions for women and girls |\n| **Deforestation** | Loss of natural resources, soil erosion, flooding |\n| **Climate change** | Droughts, heat waves, severe storms, food insecurity |'),
  t(2, '### Laws and Policies to Protect the Environment\n\nSouth Africa has strong environmental laws to protect both the environment and human health:\n\n**Constitutional protection:**\n- Section 24 of the Bill of Rights: "Everyone has the right to an environment that is not harmful to their health or well-being"\n- The government must take reasonable measures to prevent pollution, promote conservation, and secure sustainable development\n\n**Key environmental laws:**\n\n| Law | What it does |\n|-----|-------------|\n| **National Environmental Management Act (NEMA)** | Sets principles for environmental management and sustainable development |\n| **National Water Act** | Manages and protects water resources |\n| **National Environmental Management: Air Quality Act** | Regulates air pollution and sets air quality standards |\n| **National Environmental Management: Waste Act** | Regulates waste management and promotes recycling |\n\n**Earth Day:**\nEarth Day (22 April) is an international day of action to honour the Earth and raise awareness about environmental protection. Many South African schools participate through clean-up campaigns, tree planting, and environmental projects.'),
  q(3, 'Which section of the South African Bill of Rights protects the right to a healthy environment?',
    ['Section 24 — the right to an environment not harmful to health or well-being', 'Section 9 — the right to equality', 'Section 29 — the right to education', 'Section 16 — the right to freedom of expression'], 0,
    'Section 24 of the Bill of Rights specifically protects environmental rights. It states that everyone has the right to an environment that is not harmful to their health or well-being.'),
  t(4, '### Ways to Protect the Environment\n\nEveryone has a role to play in protecting the environment:\n\n**At school:**\n- Participate in clean-up campaigns and recycling programmes\n- Do not litter — use bins and encourage others to do the same\n- Save water — report dripping taps, do not waste water\n- Save electricity — switch off lights and devices when not in use\n- Start or join an eco-club\n\n**At home:**\n- Separate waste for recycling (paper, plastic, glass, metal)\n- Compost food waste instead of throwing it away\n- Use water wisely — shorter showers, fix leaks, reuse grey water\n- Plant indigenous trees and gardens\n- Reduce single-use plastics\n\n**In your community:**\n- Organise neighbourhood clean-ups\n- Report illegal dumping to your municipality\n- Support environmental organisations\n- Educate others about environmental protection\n\n**The three Rs:**\n1. **Reduce** — use less (buy only what you need)\n2. **Reuse** — find new uses for items instead of throwing them away\n3. **Recycle** — send materials to be processed into new products'),
  fb(5, 'Section ___ of the Bill of Rights protects the right to a healthy environment. The three Rs of environmental protection are reduce, reuse, and ___.',
    ['24', 'recycle'],
    'Section 24 protects the right to a safe and healthy environment. The three Rs — reduce, reuse, recycle — are practical steps everyone can take to protect the environment.'),
  t(6, '### Developing and Implementing an Environmental Health Programme\n\nAs a Grade 8 learner, you can take action to improve environmental health in your school or community:\n\n**Steps to develop an environmental programme:**\n1. **Identify the problem** — What environmental issue affects your school or community? (e.g., littering, water waste, no recycling)\n2. **Research** — Learn about the causes and effects of the problem\n3. **Set goals** — What do you want to achieve? (e.g., "Reduce litter in the school grounds by 50%")\n4. **Plan actions** — What steps will you take? Who will be involved? What resources do you need?\n5. **Implement** — Put your plan into action\n6. **Monitor and evaluate** — Is the programme working? What needs to change?\n\n**Example: School recycling programme**\n- Place labelled recycling bins in each classroom (paper, plastic, glass)\n- Create posters to educate learners about what can be recycled\n- Organise weekly collection and take recyclables to a recycling depot\n- Track the amount of waste reduced each month\n- Celebrate successes and adjust the programme as needed'),
  q(7, 'Your school has a serious littering problem. What is the BEST first step in addressing this issue?',
    ['Identify the problem clearly — where does litter accumulate? Why are learners littering?', 'Immediately punish all learners', 'Ignore it because it is not your responsibility', 'Remove all bins so there is nowhere to throw rubbish'], 0,
    'The first step in any environmental programme is identifying the problem clearly. Understanding where litter accumulates and why learners litter helps you design effective solutions.'),
  t(8, '### Earth Day and Preservation of the Environment\n\nEarth Day is celebrated on 22 April each year. It began in 1970 in the United States and is now observed worldwide.\n\n**Ways to honour Earth Day:**\n- Plant trees — indigenous trees help restore ecosystems and absorb carbon dioxide\n- Clean up your school grounds, neighbourhood, or local park\n- Learn about endangered species and ecosystems in South Africa\n- Reduce your carbon footprint for the day (walk instead of driving, save electricity)\n- Share environmental awareness on social media\n\n**South African environmental challenges:**\n- Water scarcity — South Africa is a water-scarce country, and droughts are increasing\n- Biodiversity loss — unique species are threatened by habitat destruction\n- Acid mine drainage — polluted water from old mines contaminates rivers\n- Coal-fired power stations — contribute to air pollution and climate change\n- Deforestation — clearing indigenous forests for agriculture and development\n\n**Being kind to the Earth is being kind to future generations.** The choices you make today — reducing waste, saving water, planting trees — will determine the quality of life for your children and grandchildren.'),
  q(9, 'Why is South Africa described as a "water-scarce" country?',
    ['Because South Africa has limited freshwater resources and faces increasing droughts due to climate change', 'Because South Africa has too many rivers', 'Because it rains every day in South Africa', 'Because South Africans do not use water'], 0,
    'South Africa is one of the 30 driest countries in the world. Limited rainfall, growing population, pollution of water sources, and climate change all contribute to water scarcity.'),
  fb(10, 'Earth Day is celebrated on ___ April each year. South Africa is described as a water-___ country because it has limited freshwater resources.',
    ['22', 'scarce'],
    'Earth Day on 22 April raises global awareness about environmental protection. South Africa\'s water scarcity is a serious challenge that requires responsible water use by everyone.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: HIV/AIDS, Health, and Coping with Grief (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## HIV/AIDS, Health Decisions, and Coping with Grief\n\nSouth Africa has the largest HIV epidemic in the world. Understanding HIV/AIDS, making responsible health decisions, and knowing how to cope with loss and grief are essential life skills for every Grade 8 learner.\n\n### HIV/AIDS — Prevention and Safety\n\nHIV (Human Immunodeficiency Virus) attacks the immune system. If untreated, it leads to AIDS (Acquired Immunodeficiency Syndrome).\n\n**Prevention and safety issues:**\n- **Abstinence** — not having sex is the most effective way to prevent sexual transmission of HIV\n- **Condoms** — using condoms correctly and consistently reduces risk significantly\n- **Avoid sharing needles** — never share needles, razor blades, or any items contaminated with blood\n- **Get tested** — know your HIV status; free testing is available at government clinics\n- **PMTCT** (Prevention of Mother-to-Child Transmission) — pregnant women can take medication to prevent passing HIV to their babies\n- **PrEP** (Pre-Exposure Prophylaxis) — medication taken by HIV-negative people at high risk\n- **ARVs** (Antiretroviral therapy) — treatment that helps people with HIV live long, healthy lives\n\n**Myths vs. facts:**\n\n| Myth | Fact |\n|------|------|\n| You can get HIV from hugging someone | HIV cannot be transmitted through casual contact |\n| HIV is a death sentence | With ARV treatment, people with HIV can live long, healthy lives |\n| Only certain groups get HIV | Anyone can contract HIV regardless of age, gender, or background |\n| You can tell if someone has HIV by looking at them | Many people with HIV look and feel healthy |'),
  t(2, '### Informed Decision-Making About Health\n\nMaking responsible health decisions requires knowledge, critical thinking, and the courage to act on what you know:\n\n**Informed decision-making about HIV/AIDS:**\n- Know the facts about how HIV is transmitted and how it is NOT transmitted\n- Understand your right to say no to sexual activity\n- Know where to access testing, treatment, and support\n- Challenge myths and misinformation\n\n**Managing with medication, diet, and a positive attitude:**\nPeople living with HIV can lead full, healthy lives by:\n- Taking ARV medication as prescribed (every day, same time)\n- Eating a balanced diet rich in fruits, vegetables, and protein\n- Exercising regularly\n- Getting enough sleep\n- Avoiding alcohol and drugs (which weaken the immune system)\n- Maintaining a positive attitude and strong support network\n- Attending regular clinic appointments\n\n**Caring for people living with HIV/AIDS:**\n- Treat them with dignity and respect\n- Do not discriminate or spread stigma\n- Support them in taking their medication\n- Include them in all activities — HIV is not transmitted through everyday contact\n- Maintain confidentiality — do not disclose someone\'s status without their permission'),
  q(3, 'Jabu discovers that a classmate is HIV-positive. What is the correct way to respond?',
    ['Treat the classmate with respect, maintain confidentiality about their status, and include them in all activities', 'Avoid sitting near them in class', 'Tell other learners about their status', 'Refuse to share food with them'], 0,
    'HIV cannot be transmitted through casual contact, sharing food, or sitting near someone. The correct response is to treat the person with dignity, keep their status confidential, and include them in all activities.'),
  t(4, '### Coping with Grief, Trauma, Loss, and Crises\n\nMany young people in South Africa experience loss and grief — losing a parent or caregiver, experiencing violence, or facing family crises.\n\n**Common causes of grief and loss:**\n- Death of a parent, grandparent, sibling, or friend\n- Loss of a caregiver to HIV/AIDS or other illness\n- Parents\' divorce or separation\n- Moving to a new school or community\n- Loss of a pet\n- Experiencing or witnessing violence\n\n**Signs of grief in young people:**\n- Sadness, crying, and withdrawal\n- Anger, irritability, or aggressive behaviour\n- Difficulty concentrating at school\n- Changes in eating and sleeping patterns\n- Physical symptoms (headaches, stomachaches)\n- Loss of interest in activities they used to enjoy\n\n**The stages of grief (Elisabeth Kübler-Ross):**\n1. **Denial** — "This cannot be happening"\n2. **Anger** — "It is not fair!"\n3. **Bargaining** — "If only I had done something differently..."\n4. **Depression** — Deep sadness and withdrawal\n5. **Acceptance** — Coming to terms with the loss\n\nGrief is not a straight line — you may move back and forth between stages. There is no "right" way or timeline for grieving.'),
  fb(5, 'ARV stands for ___. The five stages of grief are denial, anger, bargaining, depression, and ___.',
    ['antiretroviral', 'acceptance'],
    'ARV stands for antiretroviral — these are medications that suppress the HIV virus and allow people to live healthy lives. The Kübler-Ross model identifies five stages of grief, ending with acceptance.'),
  t(6, '### Healthy and Unhealthy Ways of Coping\n\n**Healthy coping strategies:**\n- Talk about your feelings with a trusted adult (parent, teacher, counsellor)\n- Write in a journal to express your emotions\n- Exercise and stay physically active — movement releases feel-good chemicals\n- Maintain a routine — school, meals, and sleep at regular times\n- Spend time with supportive friends and family\n- Allow yourself to cry — crying is a natural release\n- Join a support group\n- Engage in creative activities (drawing, music, poetry)\n\n**Unhealthy coping strategies to avoid:**\n- Using alcohol or drugs to numb the pain\n- Isolating yourself completely from everyone\n- Self-harm (cutting, burning)\n- Suppressing emotions — pretending everything is fine when it is not\n- Taking anger out on others (bullying, fighting)\n- Skipping school and neglecting responsibilities\n- Overeating or refusing to eat\n\n**Why unhealthy coping does not work:**\nThese strategies may provide temporary relief but create additional problems — addiction, damaged relationships, health issues, and deeper emotional pain.'),
  q(7, 'Palesa\'s grandmother recently passed away. Palesa has stopped attending school and refuses to talk to anyone. What should a concerned friend do?',
    ['Gently let Palesa know they care, listen without judging, and encourage her to talk to a counsellor or trusted adult', 'Leave her completely alone because grief is private', 'Tell her to stop being sad and move on', 'Post about her situation on social media to get support'], 0,
    'When a friend is grieving, showing you care through gentle, non-judgmental support is the best approach. Encouraging professional help (counsellor or trusted adult) is important because Palesa\'s withdrawal and school absence suggest she needs more support.'),
  t(8, '### Where to Find Help\n\nNo one should face grief, trauma, or health crises alone. Help is available:\n\n**Helplines (free and confidential):**\n\n| Organisation | Number | What they help with |\n|-------------|--------|--------------------|\n| **Childline** | 0800 055 555 | Abuse, neglect, emotional distress, any child issue |\n| **SADAG** | 0800 567 567 | Depression, anxiety, suicide — 24-hour helpline |\n| **Lifeline SA** | 0861 322 322 | Crisis counselling and emotional support |\n| **National AIDS Helpline** | 0800 012 322 | HIV/AIDS information, testing, and support |\n| **loveLife** | 0800 121 900 | Youth health, relationships, and sexual health |\n| **SAPS Emergency** | 10111 | Crime and emergencies |\n\n**Other sources of help:**\n- School counsellors and teachers\n- Social workers at government offices\n- Religious leaders (pastors, imams, priests)\n- Community health clinics\n- Non-profit organisations (Hospice, NICRO, Gift of the Givers)\n\n**Remember:** Asking for help is a sign of strength, not weakness. You are not alone, and you do not have to cope by yourself.'),
  q(9, 'Which helpline provides 24-hour support for depression and anxiety in South Africa?',
    ['SADAG — 0800 567 567', 'Childline — 0800 055 555', 'SAPS — 10111', 'loveLife — 0800 121 900'], 0,
    'SADAG (South African Depression and Anxiety Group) operates a 24-hour helpline at 0800 567 567 for anyone experiencing depression, anxiety, or suicidal thoughts.'),
  fb(10, 'The free, 24-hour helpline for depression and anxiety is operated by ___ (abbreviation). Asking for help when you are struggling is a sign of ___, not weakness.',
    ['SADAG', 'strength'],
    'SADAG (South African Depression and Anxiety Group) provides 24-hour support at 0800 567 567. Seeking help takes courage and is a sign of strength and self-awareness.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Nation-Building and Constitutional Rights (Term 3–4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Nation-Building and Constitutional Rights\n\nSouth Africa is a diverse country with many different cultures, languages, and religions. The Constitution provides a framework for all South Africans to live together peacefully. This chapter explores nation-building, human rights, and the importance of respecting diversity.\n\n### What Is Nation-Building?\n\nNation-building is the process of creating a sense of unity and shared identity among all the people of a country. In South Africa, this is especially important because of the divisions caused by apartheid.\n\n**Nation-building means:**\n- Working together despite differences in race, culture, language, and religion\n- Building a shared sense of South African identity\n- Promoting equality and fighting discrimination\n- Contributing positively to your community and country\n\n### Different Ways to Promote Nation-Building\n\n| Context | How to promote nation-building |\n|---------|-------------------------------|\n| **Community** | Participate in community events, volunteer, support neighbours regardless of background |\n| **School** | Include learners from different backgrounds, participate in Heritage Day celebrations, learn about other cultures |\n| **Home** | Teach children respect for diversity, discuss South African history, practise ubuntu |'),
  t(2, '### Contributions to Nation-Building\n\n**Contributions of women and men:**\n- Women have played a vital role in building the South African nation — from the 1956 Women\'s March against pass laws to women in leadership positions today\n- Men contribute by rejecting toxic masculinity, supporting gender equality, and being positive role models\n- Both women and men contribute through education, community service, entrepreneurship, and leadership\n\n**Contributions of individuals and groups:**\n\n| Type | Examples |\n|------|----------|\n| **Political leaders** | Nelson Mandela (reconciliation), Albertina Sisulu (activism), Desmond Tutu (peace) |\n| **Community organisations** | Neighbourhood watch, sports clubs, cultural groups |\n| **Faith organisations** | Churches, mosques, and temples providing social services |\n| **Youth organisations** | Student representative councils (SRCs), youth clubs, volunteer groups |\n| **Business leaders** | Creating jobs, supporting education, investing in communities |\n\n**Your role in nation-building:**\n- Learn about South African history and understand why the Constitution exists\n- Respect people from all backgrounds — race, culture, gender, disability, religion\n- Stand up against discrimination and unfairness\n- Participate in school and community activities\n- Use your right to vote when you turn 18'),
  q(3, 'Which of the following is the BEST example of nation-building?',
    ['A school organises a Heritage Day event where learners from all cultures share their traditions and food', 'A group of learners excludes others because they speak a different language', 'Someone refuses to learn about other cultures because they only value their own', 'A community only helps people who belong to the same racial group'], 0,
    'Nation-building involves bringing people from diverse backgrounds together to build unity and understanding. A Heritage Day event that celebrates all cultures demonstrates inclusion, respect, and shared South African identity.'),
  t(4, '### Human Rights Violations\n\nDespite the Constitution, human rights violations still occur in South Africa:\n\n**Types of human rights violations:**\n\n| Violation | Examples |\n|-----------|----------|\n| **Discrimination** | Treating someone unfairly because of race, gender, disability, HIV status, or religion |\n| **Gender-based violence (GBV)** | Physical, sexual, or emotional abuse directed at someone because of their gender |\n| **Xenophobia** | Hatred or fear of foreign nationals — leading to attacks on African migrants |\n| **Child abuse** | Physical, emotional, or sexual abuse of children; child labour; neglect |\n| **Denial of education** | Preventing children from attending school |\n| **Hate speech** | Speech that promotes hatred, discrimination, or violence against a group |\n\n**Counterstrategies to human rights violations:**\n- Report violations to the police, Human Rights Commission, or school authorities\n- Educate yourself and others about human rights\n- Challenge discriminatory language and behaviour\n- Support victims and help them access help\n- Participate in human rights awareness campaigns\n- Know your rights — read the Bill of Rights (Chapter 2 of the Constitution)'),
  fb(5, 'The process of creating unity and shared identity among all South Africans is called ___. Hatred or fear of foreign nationals is called ___.',
    ['nation-building', 'xenophobia'],
    'Nation-building aims to create unity among South Africa\'s diverse population. Xenophobia — the hatred or fear of foreigners — is a serious human rights violation in South Africa.'),
  t(6, '### Gender-Based Violence\n\nGender-based violence (GBV) is a national crisis in South Africa. It affects women, men, and children, but women and girls are disproportionately affected.\n\n**What is gender-based violence?**\nGBV is any harmful act directed at a person based on their gender. It includes:\n- Physical violence (hitting, slapping, kicking)\n- Sexual violence (rape, sexual assault, sexual harassment)\n- Emotional/psychological violence (threats, insults, controlling behaviour)\n- Economic violence (withholding money, preventing someone from working)\n\n**Defining gender-based violence:**\n- It is about power and control, not love\n- It happens in all communities — rich and poor, all races, all religions\n- It is a crime — perpetrators can be arrested and prosecuted\n- The victim is NEVER to blame\n\n**Emotional, health, and social impact of GBV:**\n- Physical injuries (broken bones, bruises, permanent damage)\n- PTSD, depression, anxiety, and suicidal thoughts\n- Loss of self-esteem and confidence\n- Isolation from family and friends\n- Poor academic performance\n- Cycle of violence — children who witness GBV may repeat the pattern\n\n**Prevention of violence against women:**\n- Challenge harmful gender stereotypes\n- Teach boys and girls about respect and equality\n- Speak out against violence — silence enables it\n- Support survivors rather than blaming them\n- Report GBV to the police (10111) or GBV Command Centre (0800 428 428)'),
  q(7, 'Which statement about gender-based violence is TRUE?',
    ['GBV is about power and control, happens in all communities, and the victim is never to blame', 'GBV only happens in poor communities', 'Victims of GBV usually deserve what happens to them', 'GBV is a private family matter and should not be reported'], 0,
    'GBV is rooted in unequal power relations and happens across all socioeconomic levels, races, and cultures. The victim is never to blame — the perpetrator is always responsible. GBV is a crime and must be reported.'),
  t(8, '### Sources of Help for Victims of Gender-Based Violence\n\nVictims of GBV can access help from many sources:\n\n**Government services:**\n- SAPS: 10111 (report violence as a crime)\n- GBV Command Centre: 0800 428 428\n- Thuthuzela Care Centres — one-stop centres at hospitals for rape and sexual assault survivors\n- Department of Social Development offices — social workers and counselling\n- Court protection orders — a victim can apply for a protection order against an abuser\n\n**Non-governmental organisations:**\n- People Opposing Women Abuse (POWA)\n- Rape Crisis Cape Town Trust\n- Sonke Gender Justice\n- Childline: 0800 055 555\n- Lifeline: 0861 322 322\n\n**At school:**\n- Report to a teacher, principal, or school counsellor\n- The school has a duty to protect learners and report abuse\n\n**Safety tips for girls and boys:**\n- Never walk alone at night or in unsafe areas\n- Trust your instincts — if something feels wrong, leave\n- Tell a trusted adult if anyone makes you feel uncomfortable\n- Save emergency numbers on your phone\n- Remember: it is NEVER your fault if someone hurts you'),
  q(9, 'The GBV Command Centre helpline number in South Africa is:',
    ['0800 428 428', '0800 055 555', '0800 567 567', '10111'], 0,
    'The GBV Command Centre can be reached at 0800 428 428 (0800 GBV GBV). It provides counselling, referrals to shelters, and assistance with reporting gender-based violence.'),
  fb(10, 'Gender-based violence is about ___ and control, not love. Thuthuzela Care Centres are one-stop centres at hospitals that support survivors of ___ and sexual assault.',
    ['power', 'rape'],
    'GBV is fundamentally about power and control. Thuthuzela Care Centres provide medical care, counselling, police support, and court preparation for survivors of rape and sexual assault in one location.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Cultural Diversity and Respect (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Cultural Diversity in South Africa\n\nSouth Africa is called the "Rainbow Nation" because of its rich cultural diversity. With 11 official languages, many religions, and a wide range of cultural practices, South Africa is one of the most diverse countries in the world. This chapter explores how to celebrate diversity while respecting everyone\'s rights.\n\n### Understanding Diverse Cultural Norms and Values\n\nCultural norms are the shared rules and expectations that guide behaviour within a cultural group. Values are the beliefs that a culture considers important.\n\n**Examples of cultural diversity in South Africa:**\n\n| Aspect | Examples of diversity |\n|--------|----------------------|\n| **Languages** | isiZulu, isiXhosa, Afrikaans, English, Sesotho, Setswana, Sepedi, Xitsonga, siSwati, Tshivenda, isiNdebele |\n| **Religions** | Christianity, Islam, Hinduism, Judaism, African Traditional Religion, Bahá\'í |\n| **Cultural practices** | Lobola, initiation ceremonies, traditional dress, food customs, dance, music |\n| **Family structures** | Nuclear families, extended families, child-headed households, blended families |\n\n**Influence of cultural norms on individual behaviour:**\n- Culture shapes how you greet people, show respect, dress, eat, and celebrate\n- Cultural norms influence attitudes towards gender roles, education, and relationships\n- Some cultural practices promote unity and identity; others may conflict with human rights'),
  t(2, '### Respect for Difference: Culture, Religion, and Gender\n\nRespecting diversity does not mean agreeing with everything — it means treating all people with dignity regardless of differences:\n\n**Respect for cultural differences:**\n- Learn about cultures different from your own\n- Do not mock or make fun of other people\'s cultural practices\n- Celebrate similarities while respecting differences\n- Remember that no culture is "better" or "worse" than another\n\n**Respect for religious differences:**\n- Everyone has the right to practise their religion (Section 15 of the Constitution)\n- Do not force your religious beliefs on others\n- Learn about different religions to build understanding\n- Interfaith dialogue promotes peace and tolerance\n\n**Respect for gender differences:**\n- The Constitution guarantees equality between men and women (Section 9)\n- Challenge gender stereotypes — boys can be caregivers; girls can be engineers\n- GBV is not a cultural right — no culture justifies violence\n- Support equal opportunities for all genders in education and the workplace\n\n**When cultural practices conflict with human rights:**\nThe Constitution is the supreme law. Any cultural practice that violates human rights (e.g., forced child marriage, ukuthwala used for kidnapping, harmful initiation practices) is illegal and must be challenged.'),
  q(3, 'When a cultural practice conflicts with the South African Constitution, which takes priority?',
    ['The Constitution — it is the supreme law and no cultural practice may violate human rights', 'The cultural practice — culture is more important than law', 'Neither — both are equally important', 'It depends on which culture is involved'], 0,
    'The South African Constitution is the supreme law of the country. All cultural practices must comply with the Bill of Rights. No cultural practice may justify violations of human rights such as forced marriage, violence, or discrimination.'),
  t(4, '### Celebrating Unity in Diversity\n\nSouth Africa celebrates diversity through several national days and initiatives:\n\n| Day | Date | Significance |\n|-----|------|--------------|\n| **Heritage Day** | 24 September | Celebrates South Africa\'s cultural diversity — traditions, food, music, dance |\n| **Human Rights Day** | 21 March | Remembers the Sharpeville massacre; celebrates the Bill of Rights |\n| **Freedom Day** | 27 April | Marks the first democratic election in 1994 |\n| **Youth Day** | 16 June | Commemorates the Soweto uprising of 1976 |\n| **Women\'s Day** | 9 August | Honours the women who marched against pass laws in 1956 |\n| **Reconciliation Day** | 16 December | Promotes unity and reconciliation among all South Africans |\n| **Africa Day** | 25 May | Celebrates African unity and continental cooperation |\n\n**The Constitution and diversity:**\n- The Constitution was written to protect ALL South Africans equally\n- It replaced apartheid laws that divided people by race\n- It guarantees freedom of religion, language, and culture\n- It prohibits unfair discrimination on any ground\n- Its values include human dignity, equality, non-racialism, and non-sexism'),
  fb(5, 'South Africa has ___ official languages. Heritage Day, celebrated on ___ September, celebrates South Africa\'s cultural diversity.',
    ['11', '24'],
    'South Africa\'s Constitution recognises 11 official languages, reflecting the country\'s rich linguistic diversity. Heritage Day on 24 September is a day to celebrate all of South Africa\'s diverse cultural traditions.'),
  t(6, '### Contributions of Diverse Cultures to South Africa\n\nSouth Africa\'s strength lies in its diversity. Each cultural group has enriched the nation:\n\n**Contributions of diverse cultures:**\n- **African cultures** — ubuntu philosophy, traditional music and dance (gumboot dance, maskandi), indigenous knowledge of plants and medicine, traditional governance systems\n- **Afrikaans culture** — literature, music (boeremusiek, Afrikaans pop), cuisine (bobotie, biltong, potjiekos)\n- **Indian/Asian cultures** — cuisine (bunny chow, curry, samoosas), Bollywood influence, trade and business heritage\n- **English-speaking cultures** — education, media, legal traditions, international business links\n- **Coloured cultures** — Cape Malay cuisine, Kaapse Klopse carnival, unique music traditions (goema)\n- **Immigrant communities** — diverse foods, skills, cultural practices, and new perspectives\n\n**Understanding diverse cultures:**\n- Attend cultural festivals and events\n- Try food from different cultures\n- Learn greetings in different South African languages\n- Read books and watch films by people from different backgrounds\n- Ask respectful questions — most people enjoy sharing their culture'),
  q(7, 'Which philosophy, rooted in African culture, emphasises shared humanity and is a foundational value of the South African Constitution?',
    ['Ubuntu — "I am because we are"', 'Capitalism — "Every person for themselves"', 'Individualism — "I succeed alone"', 'Materialism — "Wealth defines worth"'], 0,
    'Ubuntu is an African philosophical concept meaning "I am because we are." It emphasises interconnected humanity, compassion, and community responsibility, and is a foundational value of the South African Constitution.'),
  t(8, '### Social Development by Organisations from Various Religions\n\nReligious organisations make significant contributions to social development in South Africa:\n\n| Religion | Organisation/contribution |\n|----------|-------------------------|\n| **Christianity** | Churches run feeding schemes, orphanages, schools, and hospitals; Salvation Army shelters |\n| **Islam** | Gift of the Givers (SA\'s largest disaster relief organisation), mosque-based feeding programmes, zakaat (charitable giving) |\n| **Hinduism** | Hindu temples run community clinics, feeding schemes, and educational programmes |\n| **Judaism** | Jewish community runs welfare organisations, old-age homes, and youth programmes |\n| **African Traditional Religion** | Community elders provide guidance, conflict resolution, and cultural preservation |\n| **Multi-faith** | Interfaith organisations bring religions together for community development |\n\n**The role of religion in social development:**\n- Providing care for the vulnerable (orphans, elderly, homeless, sick)\n- Offering counselling and emotional support\n- Running educational programmes and bursaries\n- Disaster relief and poverty alleviation\n- Promoting peace, reconciliation, and moral values\n- Building community cohesion across cultural divides'),
  q(9, 'Gift of the Givers, South Africa\'s largest disaster relief organisation, was founded by which religious community?',
    ['The Muslim community — founded by Dr Imtiaz Sooliman', 'The Christian community', 'The Hindu community', 'It is a government organisation'], 0,
    'Gift of the Givers was founded in 1992 by Dr Imtiaz Sooliman, a South African Muslim. It has become the largest disaster relief organisation of African origin, providing humanitarian assistance regardless of race, religion, or culture.'),
  fb(10, 'The African philosophy that means "I am because we are" is called ___. Gift of the Givers is South Africa\'s largest ___ relief organisation.',
    ['ubuntu', 'disaster'],
    'Ubuntu means "I am because we are" — it is a core South African value. Gift of the Givers provides disaster relief, food, water, and medical assistance to people in need across South Africa and internationally.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: World of Work — Career Planning and Decision-Making (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Career Planning and Decision-Making\n\nIn Grade 8, you are beginning to make important choices about your future. Understanding the relationship between school subjects and careers, and developing decision-making skills, will help you plan a pathway to success.\n\n### Relationships Between School Subjects and Careers\n\nEvery school subject develops skills and knowledge that connect to specific careers:\n\n| Subject | Skills developed | Related careers |\n|---------|-----------------|----------------|\n| **Mathematics** | Logical thinking, problem-solving, calculation | Engineering, accounting, architecture, IT, science |\n| **Natural Sciences** | Scientific method, investigation, analysis | Medicine, pharmacy, environmental science, agriculture |\n| **Social Sciences** | Research, empathy, understanding society | Law, journalism, social work, politics, teaching |\n| **English/Languages** | Communication, reading, writing, critical thinking | Journalism, law, teaching, marketing, diplomacy |\n| **Technology** | Design, planning, practical skills | Engineering, IT, manufacturing, construction |\n| **Life Orientation** | Self-awareness, decision-making, life skills | Any career — LO develops skills needed in all fields |\n| **Creative Arts** | Creativity, expression, design | Graphic design, architecture, performing arts, media |\n| **Economic and Management Sciences** | Financial literacy, business understanding | Business management, economics, banking, entrepreneurship |'),
  t(2, '### Types of Learning Activities and Career Connections\n\nDifferent types of learning activities in school prepare you for different career demands:\n\n**Practical activities:**\n- Science experiments → laboratory work in research or healthcare\n- Technology projects → engineering and manufacturing\n- Art projects → design and creative industries\n- Physical Education → sports coaching, physiotherapy, military\n\n**Theoretical activities:**\n- Reading and analysis → law, journalism, research\n- Mathematics calculations → accounting, engineering, data science\n- Essay writing → legal profession, publishing, communications\n\n**Individual activities:**\n- Independent research → scientists, writers, analysts\n- Self-study → entrepreneurs, freelancers\n\n**Group activities:**\n- Team projects → any career requiring collaboration\n- Debates and presentations → law, politics, management, teaching\n- Sports → teamwork, leadership, discipline — valued in every career\n\n**Remember:** The way you approach school activities reflects the kind of worker you will be. If you are lazy, unreliable, or careless at school, you will likely carry those habits into the workplace. Build good habits now.'),
  q(3, 'Busisiwe enjoys Science experiments and is curious about how medicines work. Which career path might suit her?',
    ['Pharmacy or medical research — these combine investigative skills with healthcare', 'Fashion design', 'Professional sport', 'Accounting'], 0,
    'Busisiwe\'s interest in science experiments and medicine suggests she is suited for an investigative and healthcare-oriented career such as pharmacy, medical research, or biochemistry.'),
  t(4, '### Demands of Different Subjects\n\nEach subject has specific demands. Understanding these helps you choose subjects wisely when you reach Grade 10:\n\n**Mathematics:**\n- Requires daily practice and logical thinking\n- Opens doors to the widest range of careers\n- Cannot be replaced later — choose it over Maths Lit if at all possible\n\n**Sciences:**\n- Require practical skills and theoretical understanding\n- Need consistent study — you cannot cram science\n- Essential for healthcare, engineering, and technology careers\n\n**Languages:**\n- Require regular reading and writing practice\n- Home Language and First Additional Language are compulsory in the FET phase\n- Strong language skills are essential for EVERY career\n\n**Creative and practical subjects:**\n- Require creativity, dedication, and practice\n- Portfolios and practical assessments are important\n- Lead to careers in design, media, and the arts\n\n**Key advice for Grade 8 learners:**\n- Take ALL subjects seriously — your Grade 8 and 9 marks guide your Grade 10 subject choices\n- Identify subjects where you need extra help and get it NOW\n- Do not limit yourself — explore all subjects before making choices'),
  fb(5, 'The subject that opens doors to the widest range of careers is ___. Home Language and First Additional Language are ___ in the FET phase.',
    ['Mathematics', 'compulsory'],
    'Mathematics provides the foundation for the widest variety of careers. Home Language and First Additional Language are among the four compulsory subjects in the FET phase (Grades 10-12).'),
  t(6, '### Decision-Making Skills for Career Planning\n\nMaking good career decisions requires a structured approach:\n\n**The decision-making process:**\n1. **Know yourself** — What are your interests, strengths, and values?\n2. **Explore options** — What careers are available? What do they involve? What qualifications do they require?\n3. **Gather information** — Talk to people in careers that interest you, visit career exhibitions, use online resources\n4. **Consider factors** — Salary, job availability, working conditions, growth potential, location\n5. **Make a choice** — Select the career path that best matches your interests, abilities, and goals\n6. **Plan your pathway** — What subjects do you need? What qualifications are required? What steps must you take?\n7. **Take action** — Start preparing now through your school performance and extracurricular activities\n\n**Factors to consider in choosing a career:**\n- Your individual strengths, abilities, interests, and passions\n- Job availability — is there demand for this career in South Africa?\n- Education and training required — how long will it take and what will it cost?\n- Salary and working conditions\n- Alignment with your values and life goals'),
  q(7, 'What is the MOST important first step in career planning?',
    ['Knowing yourself — understanding your own interests, strengths, and values', 'Choosing the career that pays the most money', 'Doing what your parents want you to do', 'Choosing the same career as your friends'], 0,
    'Self-knowledge is the foundation of career planning. Understanding your own interests, strengths, values, and personality helps you choose a career that will bring both success and satisfaction.'),
  t(8, '### Steps in Choosing a Career\n\nHere is a practical guide for Grade 8 learners starting their career planning journey:\n\n**Step 1: Self-assessment**\n- List your top 3 subjects and why you enjoy them\n- Identify your top 5 strengths and skills\n- Think about your values — what matters most to you in a career? (helping people, earning money, creativity, independence, teamwork)\n\n**Step 2: Career research**\n- Use the Department of Higher Education\'s career guide (free at schools)\n- Visit www.careerhelp.org.za or call 086 999 0123\n- Attend career exhibitions and talks\n- Shadow someone in a career that interests you\n- Ask family members and community members about their careers\n\n**Step 3: Match and plan**\n- Match your interests and strengths to career categories (investigative, enterprising, realistic, artistic, conventional, social)\n- Identify the subjects and qualifications required\n- Set academic goals for Grade 8 and 9 to keep your options open\n- Start building skills through volunteering, clubs, and activities\n\n**Important:** You do not need to decide your exact career now. Grade 8 is about exploring, learning about yourself, and keeping your options open.'),
  q(9, 'Andile is interested in many careers and cannot decide on one. What advice would you give him?',
    ['"It is okay not to decide now — Grade 8 is about exploring. Focus on keeping your options open by doing well in all subjects"', '"You must decide immediately or your future is ruined"', '"Just choose whatever pays the most"', '"Ask your teacher to choose for you"'], 0,
    'Grade 8 is a time for exploration, not final decisions. Learners should focus on doing well in all subjects, trying different activities, and learning about themselves. Career choices can be refined as they grow and learn more.'),
  fb(10, 'The South African career helpline number is ___. The decision-making process starts with knowing ___ — your interests, strengths, and values.',
    ['086 999 0123', 'yourself'],
    'The national career helpline at 086 999 0123 provides free career guidance. Self-knowledge is the essential first step in career planning because it ensures your career choice aligns with who you are.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create Grade 8
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 8/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 8:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 8', schoolId: SCHOOL_ID, orderIndex: 8,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 8:', String(GRADE_ID));
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
      title: 'Chapter 1: Self-Concept and Self-Motivation',
      description: 'Self-concept, self-esteem, factors that influence self-concept (media, environment, peers, family, culture, religion, community), positive self-talk, individuality and personal achievements, self-motivation, and intrinsic vs extrinsic motivation.',
      order: 1,
      lessons: [
        { title: 'Self-Concept and Self-Motivation', description: 'Self-concept and self-esteem, factors influencing self-concept formation, positive self-talk, recognising uniqueness and personal achievements, strategies to extend personal potential, and types of motivation.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Sexuality and Relationships',
      description: 'Understanding sexuality, personal feelings about sexuality, influences on sexuality (peers, family, media), healthy relationships and friendships, initiating, sustaining, and ending relationships, problem-solving and communication skills.',
      order: 2,
      lessons: [
        { title: 'Sexuality and Relationships', description: 'Understanding sexuality during adolescence, influences on sexuality, qualities of healthy relationships, appropriate ways to initiate, sustain, and end relationships, and constructive communication and problem-solving skills.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Learning Styles and Study Skills',
      description: 'Different learning styles (visual, aural, kinaesthetic, reading/writing), self-management skills, effective study methods, creating a study timetable, and basic hygiene principles.',
      order: 3,
      lessons: [
        { title: 'Learning Styles and Study Skills', description: 'The four learning styles, identifying your preferred style, self-management skills, active study techniques, avoiding common study mistakes, and creating a study timetable.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Career Awareness and the World of Work',
      description: 'Six career categories (investigative, enterprising, realistic, artistic, conventional, social), interests and abilities, thinking and learning skills, the role of work in South Africa, and community and country needs.',
      order: 4,
      lessons: [
        { title: 'Career Awareness and the World of Work', description: 'Six career categories and matching them to interests and abilities, thinking and learning skills for different careers, the role of work in meeting social and economic needs, and career shortages in South Africa.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Substance Abuse',
      description: 'Social factors contributing to substance abuse, consequences of substance abuse (physical, psychological, social, educational), appropriate behaviour to stop and avoid substance abuse, refusal and decision-making skills.',
      order: 5,
      lessons: [
        { title: 'Substance Abuse', description: 'What is substance abuse, social factors contributing to abuse in SA, short-term and long-term consequences, refusal skills including the broken record technique, and decision-making strategies.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Environmental Health',
      description: 'Environmental health issues in South Africa, laws and policies to protect the environment, ways to protect the environment (reduce, reuse, recycle), developing environmental health programmes, and Earth Day.',
      order: 6,
      lessons: [
        { title: 'Environmental Health', description: 'Environmental health issues, Section 24 of the Bill of Rights, key environmental laws, practical steps to protect the environment, developing school environmental programmes, and Earth Day.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: HIV/AIDS, Health, and Coping with Grief',
      description: 'HIV/AIDS prevention and safety, informed health decision-making, managing with medication and diet, caring for people with HIV/AIDS, coping with grief and trauma, healthy and unhealthy coping strategies, and helplines.',
      order: 7,
      lessons: [
        { title: 'HIV/AIDS, Health, and Coping with Grief', description: 'HIV/AIDS prevention and myths vs facts, informed health decisions, managing HIV with ARVs and lifestyle, stages of grief, healthy vs unhealthy coping strategies, and South African helplines.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Nation-Building and Constitutional Rights',
      description: 'Nation-building in South Africa, contributions of women, men, individuals, and groups, human rights violations and counterstrategies, gender-based violence, and sources of help for GBV victims.',
      order: 8,
      lessons: [
        { title: 'Nation-Building and Constitutional Rights', description: 'What is nation-building, promoting nation-building in community, school, and home, human rights violations, gender-based violence as a national crisis, and sources of help for victims.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Cultural Diversity and Respect',
      description: 'Diverse cultural norms and values in South Africa, respect for differences in culture, religion, and gender, celebrating unity in diversity, contributions of diverse cultures, and social development by religious organisations.',
      order: 9,
      lessons: [
        { title: 'Cultural Diversity and Respect', description: 'Understanding diverse cultural norms, respecting differences in culture, religion, and gender, national days celebrating diversity, contributions of diverse cultures to SA, and social development by religious organisations.', blocks: ch9_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 10: Career Planning and Decision-Making',
      description: 'Relationships between school subjects and careers, types of learning activities and career connections, demands of different subjects, decision-making skills for career planning, and steps in choosing a career.',
      order: 10,
      lessons: [
        { title: 'Career Planning and Decision-Making', description: 'How school subjects connect to careers, practical vs theoretical activities, demands of different subjects, the decision-making process for career planning, and practical steps for Grade 8 career exploration.', blocks: ch10_lesson1, term: 3 },
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
    title: 'Grade 8 Life Orientation \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Self-Concept, Sexuality and Relationships, Learning Styles, Career Awareness, Substance Abuse, Environmental Health, HIV/AIDS and Grief, Nation-Building, Cultural Diversity, and Career Planning for the Grade 8 Life Orientation curriculum.',
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
  console.log('  TEXTBOOK: Grade 8 Life Orientation');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
