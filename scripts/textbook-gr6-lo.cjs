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
// CHAPTER 1: Development of the Self (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Development of the Self\n\nAs a Grade 6 learner, you are growing up fast. You are becoming more aware of who you are, what you enjoy, and what makes you special. Understanding yourself is one of the most important things you can do — it helps you make good decisions, build strong friendships, and feel confident.\n\n### What Is Self-Concept?\n\nSelf-concept is the way you think about yourself. It includes:\n\n- **Your abilities** — what you believe you can do well (sport, art, reading, helping others)\n- **Your personality** — the kind of person you think you are (shy, brave, kind, funny)\n- **Your appearance** — how you feel about the way you look\n- **Your values** — what matters most to you (honesty, fairness, family)\n\nA positive self-concept means you generally feel good about who you are. You know you are not perfect, but you accept yourself and believe you can learn and grow.'),
  t(2, '### Self-Esteem and Positive Self-Image\n\nSelf-esteem is how much you value yourself. It is like a measuring stick for how you feel about who you are.\n\n| High self-esteem | Low self-esteem |\n|-----------------|----------------|\n| "I can try new things even if I make mistakes" | "I will fail, so why bother trying?" |\n| "I have good qualities" | "There is nothing special about me" |\n| "My friends like me for who I am" | "Nobody really cares about me" |\n| "I can ask for help when I need it" | "Asking for help means I am weak" |\n\n**Building a positive self-image:**\n- Celebrate small wins — finishing homework, helping a friend, learning something new\n- Write down three things you like about yourself\n- Replace negative thoughts with positive ones: "I can\'t do this" becomes "I can\'t do this YET"\n- Surround yourself with people who encourage you\n- Accept compliments — do not brush them off!'),
  q(3, 'Ayanda tells herself, "I always mess things up. I am useless." What does this tell us about Ayanda\'s self-esteem?',
    ['She has low self-esteem because she focuses on her weaknesses and uses negative self-talk', 'She has high self-esteem because she is being honest', 'She has no self-concept', 'She is being humble which is always a good thing'], 0,
    'Constantly saying negative things about yourself is a sign of low self-esteem. Ayanda needs to practise positive self-talk and focus on her strengths. Everyone makes mistakes — that does not make you useless.'),
  t(4, '### Unique Qualities, Talents, and Interests\n\nEvery person has unique qualities — things that make them who they are. No two people are exactly the same, not even twins!\n\n**Discovering your unique qualities:**\n- What do people often compliment you on?\n- What activities make you feel happy and energised?\n- What do you do better than most of your classmates?\n- What would your best friend say is special about you?\n\n**Common talents and interests among Grade 6 learners:**\n\n| Talent area | Examples |\n|------------|----------|\n| **Academic** | Reading, writing stories, solving maths problems, science experiments |\n| **Sport** | Soccer, netball, athletics, swimming, cricket |\n| **Creative** | Drawing, painting, singing, dancing, playing an instrument |\n| **Social** | Making friends easily, helping others, leading a group |\n| **Practical** | Building things, cooking, gardening, fixing things |\n\n**Remember:** A talent is something you are naturally good at. A skill is something you develop through practice. You can turn your talents into strong skills by working hard!'),
  fb(5, 'The way you think about yourself is called your ___. How much you value yourself is called your ___.',
    ['self-concept', 'self-esteem'],
    'Self-concept is the overall picture you have of yourself — your abilities, personality, and values. Self-esteem is specifically about how much you value and respect yourself.'),
  t(6, '### Dealing with Change — Moving to High School\n\nAs a Grade 6 learner, you may already be thinking about the big change ahead: moving to Grade 7 and eventually to high school. Change can feel exciting, but it can also feel scary.\n\n**Common feelings about change:**\n- Excitement about being older and having more freedom\n- Worry about making new friends\n- Fear of harder schoolwork\n- Sadness about leaving your primary school friends and teachers\n\n**Tips for coping with change:**\n1. **Talk about your feelings** — share your worries with a parent, teacher, or friend\n2. **Focus on what you CAN control** — your attitude, your effort, your kindness\n3. **Stay connected** — you can still be friends with people even when you change schools\n4. **Be open to new experiences** — new school means new opportunities\n5. **Ask for help** — it is brave to ask, not weak\n\n**In South Africa**, many learners move from smaller primary schools to larger secondary schools. This is a normal part of growing up, and millions of learners have done it successfully before you.'),
  q(7, 'Thabo is nervous about moving to a new school next year. He is worried about making friends. Which strategy would BEST help him?',
    ['Talk to a trusted adult about his feelings and remind himself that feeling nervous about change is normal', 'Avoid thinking about it and hope for the best', 'Decide to stay at his current school forever', 'Tell himself that he should not feel nervous because it is silly'], 0,
    'Talking about feelings with a trusted adult is one of the best ways to cope with change. It is completely normal to feel nervous about big changes. Ignoring feelings or telling yourself not to feel them usually makes things worse.'),
  fb(8, 'A talent is something you are naturally ___ at. A skill is something you develop through ___.',
    ['good', 'practice'],
    'Talents are natural abilities you are born with or discover early in life. Skills are developed through practice, effort, and dedication over time.'),
  q(9, 'Which of the following is an example of positive self-talk?',
    ['"I can\'t do this YET, but I will keep trying"', '"I always fail at everything"', '"Other people are better than me"', '"I should just give up"'], 0,
    'Positive self-talk involves replacing negative thoughts with encouraging ones. Saying "I can\'t do this YET" shows growth mindset — you believe you can improve with effort.'),
  t(10, '### Summary: Developing the Self\n\n**Key ideas from this chapter:**\n- Your self-concept is how you see yourself — it can be improved!\n- Self-esteem is how much you value yourself — build it by focusing on your strengths\n- Everyone has unique qualities, talents, and interests\n- Change is a normal part of life — talk about your feelings and stay positive\n- Replace negative self-talk with positive self-talk\n\n**Activity:** Write down five things that make you unique. Share two of them with a partner. Notice how it feels to talk about your strengths!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Healthy Lifestyle Choices (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Healthy Lifestyle Choices\n\nMaking healthy choices every day helps you grow strong, think clearly, and feel good about yourself. As a Grade 6 learner, you are old enough to start taking responsibility for your own health.\n\n### Nutrition Basics\n\nYour body needs the right fuel to grow and work properly. The food you eat provides energy, builds muscles and bones, and helps your brain work.\n\n**The food groups:**\n\n| Food group | What it does | South African examples |\n|-----------|-------------|----------------------|\n| **Carbohydrates** | Give you energy | Pap, bread, rice, potatoes, samp |\n| **Proteins** | Build and repair muscles | Chicken, fish, beans, lentils, eggs, amasi |\n| **Fats** | Store energy, protect organs | Avocado, nuts, cooking oil, peanut butter |\n| **Vitamins & minerals** | Keep your body healthy | Spinach (morogo), oranges, carrots, tomatoes |\n| **Water** | Keeps your body working | Drink at least 6–8 glasses per day |\n\n**Tip:** Try to eat a variety of colourful fruits and vegetables every day. The more colours on your plate, the more nutrients you get!'),
  t(2, '### Exercise and Hygiene\n\n**Why exercise matters:**\nChildren your age should be physically active for at least 60 minutes every day. Exercise:\n- Makes your heart and lungs stronger\n- Builds strong bones and muscles\n- Helps you concentrate at school\n- Improves your mood and reduces stress\n- Helps you sleep better at night\n\n**Easy ways to be active:**\n- Walk to school instead of getting a lift\n- Play outside during break — soccer, skipping, tag\n- Help with physical chores at home — sweeping, carrying water, gardening\n- Join a school sports team or do exercises at home\n\n**Personal hygiene:**\nKeeping your body clean prevents illness and helps you feel confident.\n\n| Hygiene habit | How often |\n|--------------|----------|\n| Bathing or showering | Every day |\n| Brushing teeth | Twice a day (morning and night) |\n| Washing hands | Before eating, after using the toilet, after playing |\n| Wearing clean clothes | Every day |\n| Cutting nails | Once a week |\n| Washing hair | At least twice a week |'),
  q(3, 'How many minutes of physical activity should a Grade 6 learner get each day?',
    ['At least 60 minutes', 'At least 15 minutes', 'At least 120 minutes', 'Exercise is not important for children'], 0,
    'The World Health Organisation recommends at least 60 minutes of moderate-to-vigorous physical activity every day for children aged 5–17. This can include walking, playing sport, dancing, or helping with physical chores.'),
  t(4, '### Substance Abuse Awareness\n\nSubstance abuse means using harmful substances that damage your body and mind. As a Grade 6 learner, it is important to understand the dangers so you can make smart choices.\n\n**Dangerous substances and their effects:**\n\n| Substance | What it does to your body |\n|-----------|-------------------------|\n| **Cigarettes/tobacco** | Damages lungs, causes cancer, makes it hard to breathe, stains teeth, bad breath |\n| **Alcohol** | Damages the liver and brain, causes poor decisions, leads to accidents and violence |\n| **Dagga (cannabis)** | Harms the developing brain, causes memory problems, affects schoolwork, is illegal in SA for minors |\n| **Tik (methamphetamine)** | Extremely addictive, destroys teeth, causes hallucinations, damages the brain permanently |\n| **Glue/petrol sniffing** | Kills brain cells, damages lungs, can cause sudden death |\n\n**Why young people start using substances:**\n- Peer pressure — friends dare them or say it is cool\n- Curiosity — wanting to try something new\n- Stress — trying to escape problems at home or school\n- Boredom — nothing else to do\n- Advertising — seeing smoking and drinking made to look glamorous'),
  fb(5, 'Children aged 5–17 should get at least ___ minutes of physical activity every day. Substance ___ means using harmful substances that damage your body and mind.',
    ['60', 'abuse'],
    'The WHO recommends at least 60 minutes of daily physical activity for children. Substance abuse refers to using harmful substances like alcohol, tobacco, and drugs.'),
  t(6, '### Making Healthy Choices\n\nEvery day you face choices about your health. Here is how to make good ones:\n\n**The STOP method:**\n1. **S**top — before you act, pause for a moment\n2. **T**hink — what could happen if I do this? Is it safe? Is it healthy?\n3. **O**ptions — what are my other choices?\n4. **P**roceed — choose the healthiest option\n\n**Saying NO to harmful substances:**\n- "No thanks, I don\'t do that."\n- "I need to go — my parents are expecting me."\n- "That stuff is bad for you. Let\'s do something else."\n- Simply walk away — you do not need to explain yourself\n\n**Where to get help in South Africa:**\n- **SANCA** (South African National Council on Alcoholism and Drug Dependence): 011 892 3829\n- **Childline:** 0800 055 555 (free, 24 hours)\n- Talk to your teacher, parent, or school counsellor'),
  q(7, 'Mpho\'s older cousin offers him a cigarette and says, "Just try one, it won\'t hurt you." What should Mpho do?',
    ['Say no firmly and walk away — even one cigarette is harmful and can lead to addiction', 'Try one cigarette because his cousin said it is fine', 'Take the cigarette but not smoke it to avoid offending his cousin', 'Smoke it to look cool in front of his cousin'], 0,
    'Mpho should say no firmly. Even one cigarette is harmful — it contains over 7 000 chemicals. Peer pressure from family members can be hard to resist, but protecting your health is more important than pleasing someone else.'),
  fb(8, 'The STOP method stands for Stop, Think, ___, and Proceed. Childline\'s free helpline number is ___.',
    ['Options', '0800 055 555'],
    'The STOP method helps you make healthy decisions by pausing to consider your options before acting. Childline (0800 055 555) is a free, confidential 24-hour helpline for children in South Africa.'),
  q(9, 'Which food group gives your body energy and includes foods like pap, bread, and rice?',
    ['Carbohydrates', 'Proteins', 'Fats', 'Vitamins'], 0,
    'Carbohydrates are the body\'s main source of energy. In South Africa, common carbohydrate-rich foods include pap (maize meal), bread, rice, potatoes, and samp.'),
  t(10, '### Summary: Healthy Lifestyle Choices\n\n**Key ideas from this chapter:**\n- Eat a balanced diet with foods from all food groups\n- Be physically active for at least 60 minutes every day\n- Practise good personal hygiene daily\n- Stay away from cigarettes, alcohol, dagga, and all other drugs\n- Use the STOP method to make healthy decisions\n- Know where to get help: Childline 0800 055 555\n\n**Remember:** The choices you make now about your health will affect you for the rest of your life. Choose wisely!'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Dealing with Emotions (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Dealing with Emotions\n\nEmotions are feelings that everyone experiences. They are a normal part of being human. As you grow older, your emotions become more complex, and learning to manage them is an important life skill.\n\n### Understanding Emotions\n\nEmotions can be pleasant or unpleasant, but none of them are "bad." All emotions are valid — it is how you ACT on them that matters.\n\n**Common emotions:**\n\n| Emotion | What it feels like | When you might feel it |\n|---------|-------------------|---------------------|\n| **Happiness** | Light, warm, energised | When you achieve something or spend time with loved ones |\n| **Sadness** | Heavy, tired, like crying | When you lose something or someone, or feel disappointed |\n| **Anger** | Hot, tense, wanting to shout | When something unfair happens or someone hurts you |\n| **Fear** | Heart racing, shaky, wanting to run | When you face danger or something unknown |\n| **Jealousy** | Uncomfortable, resentful | When someone has something you want |\n| **Embarrassment** | Face going hot, wanting to hide | When you make a mistake in front of others |'),
  t(2, '### Managing Anger and Sadness\n\n**Anger management:**\nAnger is a normal emotion, but it can lead to problems if you do not manage it well.\n\n**Healthy ways to deal with anger:**\n- **Count to ten** slowly before reacting\n- **Take deep breaths** — breathe in for 4 counts, hold for 4, breathe out for 4\n- **Walk away** from the situation until you calm down\n- **Talk about it** — tell someone how you feel using "I" statements: "I feel angry because..."\n- **Exercise** — run, kick a ball, do star jumps to release the energy\n- **Write it down** — put your feelings in a journal\n\n**Unhealthy ways to deal with anger (AVOID these):**\n- Hitting, pushing, or kicking someone\n- Shouting, swearing, or name-calling\n- Breaking things\n- Keeping it bottled up until you explode\n\n**Dealing with sadness:**\n- Let yourself feel sad — it is okay to cry\n- Talk to someone you trust about why you are sad\n- Do something you enjoy — listen to music, draw, play outside\n- Help someone else — it can lift your mood\n- If sadness lasts a very long time, ask an adult for help'),
  q(3, 'Lerato feels angry because her friend said something hurtful. What is the BEST first step for Lerato to take?',
    ['Take deep breaths and count to ten before reacting', 'Shout at her friend immediately', 'Post something mean about her friend on social media', 'Pretend she is not angry and ignore it forever'], 0,
    'Taking deep breaths and counting to ten gives Lerato time to calm down before she says or does something she might regret. Once she is calm, she can use "I" statements to explain how she feels.'),
  t(4, '### Expressing Feelings Appropriately\n\nExpressing your feelings in a healthy way is an important skill. It helps you build strong relationships and avoid conflict.\n\n**Using "I" statements:**\nInstead of blaming others, describe how YOU feel.\n\n| Blaming ("You" statement) | Expressing feelings ("I" statement) |\n|--------------------------|------------------------------------|\n| "You are so mean!" | "I feel hurt when you say things like that." |\n| "You never listen to me!" | "I feel ignored when I am not heard." |\n| "You always take my things!" | "I feel frustrated when my things are taken without asking." |\n\n**Why "I" statements work better:**\n- They do not attack the other person\n- They explain how you feel clearly\n- They open the door for a calm conversation\n- They help the other person understand your perspective'),
  fb(5, 'When expressing feelings, you should use "___ " statements instead of blaming others. A healthy way to release anger physically is to ___.',
    ['I', 'exercise'],
    '"I" statements help you express your feelings without attacking the other person, which leads to better communication. Exercise is a healthy way to release the physical energy that builds up when you feel angry.'),
  t(6, '### Empathy — Understanding How Others Feel\n\nEmpathy means understanding and sharing the feelings of another person. It is the ability to "put yourself in someone else\'s shoes."\n\n**How to show empathy:**\n- **Listen** carefully when someone is talking about their feelings\n- **Acknowledge** their feelings: "That sounds really difficult"\n- **Do not judge** or say things like "You should not feel that way"\n- **Offer support**: "Is there anything I can do to help?"\n- **Be present** — sometimes people just need someone to sit with them\n\n**Empathy in action:**\n\n| Situation | Empathetic response |\n|-----------|-------------------|\n| A friend failed a test | "I know you studied hard. That must be really disappointing." |\n| A classmate\'s pet died | "I am so sorry. Losing a pet is really painful." |\n| Someone is being left out | Go and include them — ask them to join your group |\n| A new learner is alone | "Hi, I am [name]. Would you like to sit with us?" |'),
  q(7, 'Sipho notices that his classmate Naledi is sitting alone at break and looks like she has been crying. What is the most empathetic thing Sipho can do?',
    ['Go to Naledi, ask if she is okay, and offer to sit with her', 'Ignore her because it is not his problem', 'Tell everyone that Naledi was crying', 'Laugh and say she is being dramatic'], 0,
    'Empathy means recognising when someone is hurting and offering support. Going to Naledi and asking if she is okay shows kindness and compassion. Sometimes just sitting with someone is enough to make them feel better.'),
  t(8, '### Coping Strategies\n\nCoping strategies are healthy ways to deal with difficult emotions. Different strategies work for different people — find what works for you.\n\n**Coping strategies for Grade 6 learners:**\n\n| Strategy | How it helps |\n|----------|------------|\n| **Talking to someone** | Sharing feelings makes them feel less heavy |\n| **Physical activity** | Running, dancing, or playing sport releases feel-good chemicals |\n| **Creative expression** | Drawing, writing, singing, or building something |\n| **Deep breathing** | Calms your body and mind quickly |\n| **Spending time in nature** | Walking outside, sitting in a garden |\n| **Helping others** | Volunteering or doing something kind lifts your mood |\n| **Routine** | Keeping a regular schedule gives a sense of control |\n\n**When to ask for help:**\nIf you feel sad, angry, or worried for a long time and nothing seems to help, talk to:\n- A parent or guardian\n- Your teacher or school counsellor\n- Childline: 0800 055 555 (free, 24 hours)'),
  fb(9, 'The ability to understand and share the feelings of another person is called ___. When expressing feelings, "I feel hurt when you say things like that" is an example of an ___ statement.',
    ['empathy', '"I"'],
    'Empathy is the ability to understand and share another person\'s feelings. "I" statements help you express your emotions without blaming others.'),
  q(10, 'Which of the following is an UNHEALTHY way to deal with anger?',
    ['Keeping it bottled up inside until you eventually explode', 'Taking deep breaths and counting to ten', 'Writing your feelings in a journal', 'Going for a run to release energy'], 0,
    'Bottling up anger is unhealthy because the feelings build up over time and eventually come out in a much bigger, often harmful way. It is better to express anger calmly using words, writing, or physical activity.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Social Responsibility (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Social Responsibility\n\nSocial responsibility means understanding that your actions affect other people and the world around you. As a Grade 6 learner and a young South African citizen, you have a role to play in making your community and country a better place.\n\n### Being a Responsible Citizen\n\nA responsible citizen:\n- Follows the rules and laws of the country\n- Respects other people\'s rights and property\n- Takes care of public spaces — schools, parks, libraries\n- Helps people who are in need\n- Speaks up when they see something wrong\n- Does not litter, vandalise, or waste resources\n\n**At school, being responsible means:**\n- Arriving on time and being prepared\n- Completing your homework and classwork\n- Treating teachers and classmates with respect\n- Looking after school property — desks, books, toilets, sports equipment\n- Following school rules, even when no one is watching'),
  t(2, '### Community Involvement and Volunteer Work\n\nGetting involved in your community makes it stronger and helps you grow as a person.\n\n**Ways Grade 6 learners can help their community:**\n\n| Activity | Impact |\n|---------|--------|\n| Picking up litter in your neighbourhood | A cleaner, healthier environment |\n| Helping elderly neighbours with chores | Showing ubuntu and respect for elders |\n| Tutoring younger learners | Helping them succeed in school |\n| Planting a school or community garden | Fresh food and a greener space |\n| Collecting clothes or food for those in need | Supporting families who are struggling |\n| Visiting a children\'s home or old age home | Bringing joy to people who may feel lonely |\n\n**What is volunteering?**\nVolunteering means doing something helpful without being paid. In South Africa, many organisations rely on volunteers:\n- Mandela Day (18 July) — 67 minutes of service to honour Nelson Mandela\n- SPCA — helping animals in need\n- Food banks — collecting and distributing food to hungry families\n- Beach and river clean-ups — protecting our environment'),
  q(3, 'On Mandela Day, South Africans are encouraged to spend 67 minutes helping others. Why is it 67 minutes?',
    ['To honour the 67 years Nelson Mandela spent fighting for human rights and justice', 'Because Mandela\'s birthday is on the 6th of July', 'Because 67 is a lucky number in South Africa', 'Because that is how long a school period lasts'], 0,
    'Mandela Day is celebrated on 18 July (Mandela\'s birthday). The 67 minutes represent the 67 years he spent in public service, fighting against apartheid and working for equality and human rights in South Africa.'),
  t(4, '### Caring for the Environment\n\nSouth Africa has beautiful natural resources — from the Kruger National Park to the oceans along our coastline. It is our responsibility to protect them.\n\n**Environmental problems in South Africa:**\n- **Litter and pollution** — plastic waste in rivers and oceans, air pollution from factories\n- **Water shortage** — South Africa is a water-scarce country; droughts are common\n- **Deforestation** — cutting down trees for firewood and building\n- **Poaching** — illegal hunting of rhinos, elephants, and other wildlife\n\n**What you can do:**\n\n| Action | Why it matters |\n|--------|---------------|\n| **Reduce** — use less electricity, water, and plastic | Saves resources for the future |\n| **Reuse** — use containers and bags again | Less waste in landfills |\n| **Recycle** — sort your waste (paper, plastic, glass, metal) | Materials can be made into new products |\n| **Save water** — take shorter showers, fix dripping taps | South Africa needs every drop |\n| **Plant trees** — in your garden, school, or community | Trees clean the air and provide shade |'),
  fb(5, 'Mandela Day is celebrated on 18 July with ___ minutes of community service. South Africa is a water-___ country, so we must save every drop.',
    ['67', 'scarce'],
    'Mandela Day\'s 67 minutes honour Mandela\'s 67 years of public service. South Africa is classified as a water-scarce country, meaning we have limited freshwater resources.'),
  t(6, '### Respecting Diversity\n\nSouth Africa is called the "Rainbow Nation" because of the many different cultures, languages, and traditions that make up our country.\n\n**South Africa has:**\n- 12 official languages (Sepedi, Sesotho, Setswana, siSwati, Tshivenda, Xitsonga, Afrikaans, English, isiNdebele, isiXhosa, isiZulu, and SA Sign Language)\n- Many different religions — Christianity, Islam, Hinduism, Judaism, African Traditional Religion, and others\n- Diverse cultures and traditions\n\n**Respecting diversity means:**\n- Learning about cultures different from your own\n- Not making fun of someone\'s language, food, or customs\n- Including everyone, regardless of their background\n- Celebrating Heritage Day (24 September) by sharing your culture with others\n- Standing against racism, xenophobia, and discrimination\n\n**Ubuntu:** The philosophy of ubuntu — "I am because we are" — teaches us that we are all connected. When we respect diversity, we strengthen our communities.'),
  q(7, 'How many official languages does South Africa have?',
    ['12', '9', '11', '15'], 0,
    'South Africa has 12 official languages: Sepedi, Sesotho, Setswana, siSwati, Tshivenda, Xitsonga, Afrikaans, English, isiNdebele, isiXhosa, isiZulu, and South African Sign Language (added in 2023).'),
  fb(8, 'South Africa is called the "___ Nation" because of its diverse cultures. The philosophy of ___ teaches that "I am because we are."',
    ['Rainbow', 'ubuntu'],
    'Archbishop Desmond Tutu coined the term "Rainbow Nation" to describe South Africa\'s diverse population. Ubuntu is an African philosophy emphasising that our humanity is connected to others.'),
  q(9, 'Which of the following is an example of social responsibility at school?',
    ['Looking after school property and reporting damage when you see it', 'Throwing litter on the floor because the cleaners will pick it up', 'Only helping your close friends and ignoring others', 'Ignoring school rules when teachers are not watching'], 0,
    'Social responsibility means taking care of shared spaces and resources. Looking after school property and reporting damage shows that you understand your actions affect everyone.'),
  t(10, '### Summary: Social Responsibility\n\n**Key ideas from this chapter:**\n- A responsible citizen follows rules, respects others, and helps the community\n- Volunteering — like on Mandela Day — makes your community stronger\n- Protect the environment by reducing, reusing, and recycling\n- South Africa is a water-scarce country — save water every day\n- Respect diversity — we are a Rainbow Nation with 12 official languages\n- Ubuntu means "I am because we are" — we are all connected'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Democracy and Human Rights (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Democracy and Human Rights\n\nSouth Africa is a democratic country. This means that the people have the power to choose their leaders and that everyone has certain rights that are protected by law.\n\n### What Is Democracy?\n\nDemocracy comes from the Greek words "demos" (people) and "kratos" (power). It means "power of the people."\n\n**Key features of democracy in South Africa:**\n- **Free and fair elections** — every citizen over 18 can vote\n- **The Constitution** — the highest law of the land, protects everyone\'s rights\n- **Separation of powers** — Parliament makes laws, the President leads the government, and courts enforce laws\n- **Freedom of speech** — people can express their opinions\n- **Equality** — all people are treated equally before the law\n\n**South Africa\'s first democratic election:**\nOn 27 April 1994, South Africa held its first democratic election where ALL South Africans could vote, regardless of race. This day is now celebrated as Freedom Day. Nelson Mandela became the first democratically elected president.'),
  t(2, '### Children\'s Rights in South Africa\n\nThe South African Constitution has a special section — Section 28 — that protects the rights of children.\n\n**Your rights as a child in South Africa:**\n\n| Right | What it means |\n|-------|-------------|\n| **Name and nationality** | Every child has the right to a name and to be a South African citizen |\n| **Family care** | Every child has the right to be cared for by a family or guardian |\n| **Basic nutrition** | Every child has the right to food and clean water |\n| **Shelter** | Every child has the right to a safe place to live |\n| **Basic health care** | Every child has the right to medical care |\n| **Education** | Every child has the right to go to school |\n| **Protection from abuse** | Every child has the right to be protected from physical, emotional, and sexual abuse |\n| **Protection from child labour** | Children should not be made to do work that is dangerous or that keeps them from school |\n| **Not to be detained** | A child may only be detained as a last resort and for the shortest appropriate time |'),
  q(3, 'Which section of the South African Constitution specifically protects the rights of children?',
    ['Section 28', 'Section 9', 'Section 15', 'Section 24'], 0,
    'Section 28 of the Constitution is dedicated to children\'s rights. It ensures that every child has the right to a name, family care, nutrition, shelter, health care, education, and protection from abuse and exploitation.'),
  t(4, '### The Children\'s Act and Responsibilities\n\n**The Children\'s Act (Act 38 of 2005):**\nThis law gives more detail on how children\'s rights should be protected. It covers:\n- Who can take care of a child if parents cannot\n- How children should be protected from abuse and neglect\n- Rules about adoption and foster care\n- The role of social workers in protecting children\n\n**Responsibilities that go with rights:**\nEvery right comes with a responsibility. You cannot demand your rights while ignoring your duties.\n\n| Right | Responsibility |\n|-------|---------------|\n| Right to education | Attend school, do your homework, respect your teachers |\n| Right to be safe | Do not bully or harm others |\n| Right to express yourself | Listen to others and respect their opinions |\n| Right to be cared for | Respect and help your family |\n| Right to a clean environment | Do not litter, save water and electricity |\n\n**Remember:** Rights and responsibilities work together. You have the right to be treated with respect, AND you have the responsibility to treat others with respect.'),
  fb(5, 'South Africa\'s first democratic election was held on 27 April ___. The Children\'s Act is Act ___ of 2005.',
    ['1994', '38'],
    'The first democratic election was on 27 April 1994, now celebrated as Freedom Day. The Children\'s Act (Act 38 of 2005) provides detailed protection for children\'s rights.'),
  t(6, '### Reporting Abuse\n\nEvery child has the right to be safe. If you or someone you know is being abused, it is important to tell a trusted adult.\n\n**Types of abuse:**\n- **Physical abuse** — being hit, kicked, burned, or hurt on purpose\n- **Emotional abuse** — being shouted at, insulted, threatened, or made to feel worthless\n- **Sexual abuse** — any sexual contact or behaviour with a child\n- **Neglect** — not being given food, clothing, shelter, or medical care when needed\n\n**Where to report abuse:**\n- **Childline:** 0800 055 555 (free, 24 hours, confidential)\n- **SAPS:** 10111 (South African Police Service)\n- **A teacher or school counsellor**\n- **A social worker**\n- **Any trusted adult** — parent, relative, neighbour, religious leader\n\n**Important facts:**\n- It is NEVER the child\'s fault\n- Telling someone is brave, not "tattling"\n- Adults have a legal duty to report abuse when they know about it\n- You can report anonymously (without giving your name)'),
  q(7, 'Zanele notices that her friend Buhle comes to school with bruises and seems afraid to go home. What should Zanele do?',
    ['Tell a trusted adult like a teacher or school counsellor about what she has noticed', 'Ignore it because it is not her business', 'Confront Buhle\'s parents herself', 'Post about it on social media to get attention'], 0,
    'If Zanele suspects her friend is being abused, the best thing she can do is tell a trusted adult like a teacher or counsellor. They are trained to handle these situations and can get help for Buhle. It is never a child\'s job to confront the abuser.'),
  fb(8, 'Every right comes with a ___. Childline\'s free helpline number for reporting abuse is ___.',
    ['responsibility', '0800 055 555'],
    'Rights and responsibilities go together — you cannot have one without the other. Childline (0800 055 555) is available 24 hours a day for any child who needs help.'),
  q(9, 'What happened on 27 April 1994 in South Africa?',
    ['The first democratic election was held where all South Africans could vote regardless of race', 'The Constitution was signed', 'Nelson Mandela was released from prison', 'South Africa became a republic'], 0,
    'On 27 April 1994, South Africa held its first democratic election. For the first time, ALL citizens could vote regardless of their race. Nelson Mandela was elected president. This date is now celebrated as Freedom Day.'),
  t(10, '### Summary: Democracy and Human Rights\n\n**Key ideas from this chapter:**\n- Democracy means "power of the people" — South Africa is a constitutional democracy\n- 27 April 1994 was our first democratic election — now celebrated as Freedom Day\n- Section 28 of the Constitution protects children\'s rights\n- The Children\'s Act (Act 38 of 2005) details how children must be protected\n- Every right comes with a responsibility\n- Report abuse to Childline (0800 055 555), SAPS (10111), or a trusted adult\n- It is NEVER the child\'s fault — telling someone is brave'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Safety in the Environment (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Safety in the Environment\n\nBeing safe means knowing how to protect yourself and others from danger. Whether you are at home, at school, or out in your community, there are important safety rules to follow.\n\n### Road Safety\n\nRoad accidents are one of the biggest causes of death and injury in South Africa, especially among children and pedestrians.\n\n**Road safety rules for pedestrians:**\n- Always walk on the pavement (sidewalk). If there is no pavement, walk facing oncoming traffic\n- Cross at pedestrian crossings, traffic lights, or scholar patrols\n- **STOP, LOOK, LISTEN** — stop at the kerb, look left-right-left, listen for vehicles, then cross\n- Never run across the road\n- Never use your phone while crossing — it distracts you\n- Wear bright or reflective clothing when walking at night\n- Never play in the road\n\n**Road safety as a cyclist:**\n- Wear a helmet\n- Ride on the left side of the road, with traffic\n- Use hand signals to show when you are turning\n- Make sure your bicycle has reflectors and a bell'),
  t(2, '### Fire Safety and Water Safety\n\n**Fire safety:**\nFires are a serious risk in South Africa, especially in informal settlements during winter when people use paraffin stoves and candles.\n\n**Fire safety rules:**\n- Never play with matches, lighters, or candles\n- Keep flammable materials away from stoves and heaters\n- Make sure your home has a working fire escape plan\n- If your clothes catch fire: STOP, DROP, and ROLL\n- If there is a fire: get out, stay out, and call for help\n- Know where the fire extinguisher is at school\n- Emergency number: **10177** (fire and ambulance)\n\n**Water safety:**\nDrowning is a leading cause of death among South African children.\n\n| Rule | Why it matters |\n|------|---------------|\n| Never swim alone | Someone must be able to help if you get into trouble |\n| Only swim in safe areas | Avoid rivers with strong currents, dams, and unsupervised pools |\n| Do not dive into unknown water | You could hit rocks or the ground if the water is shallow |\n| Learn to swim | Ask at your local pool or community centre |\n| Do not push people into water | They may not be able to swim |\n| Stay away from flooded rivers | Flood water is fast and dangerous |'),
  q(3, 'What should you do if your clothes catch fire?',
    ['STOP where you are, DROP to the ground, and ROLL to smother the flames', 'Run as fast as you can to find water', 'Take off all your clothes immediately', 'Stand still and call for help'], 0,
    'STOP, DROP, and ROLL is the correct response if your clothes catch fire. Running fans the flames and makes them worse. Dropping to the ground and rolling smothers the flames.'),
  t(4, '### Natural Disasters in South Africa\n\nSouth Africa experiences several types of natural disasters. Knowing what to do can save your life.\n\n**Common natural disasters in SA:**\n\n| Disaster | Where in SA | What to do |\n|----------|------------|------------|\n| **Floods** | KwaZulu-Natal, Eastern Cape, Limpopo | Move to higher ground, never walk through flood water, listen to weather warnings |\n| **Droughts** | Northern Cape, Free State, Limpopo | Save water, use water wisely, report leaking taps |\n| **Wildfires (veld fires)** | Western Cape, grasslands | Stay away, close windows, listen to evacuation orders |\n| **Severe storms** | Gauteng (thunderstorms), coastal areas (cyclones) | Stay indoors, away from windows, unplug electronics, avoid open spaces |\n\n**The 2022 KZN floods:**\nIn April 2022, devastating floods in KwaZulu-Natal killed over 400 people and destroyed thousands of homes. This disaster showed how important it is to:\n- Listen to early warning systems\n- Have an emergency plan\n- Help your community recover'),
  fb(5, 'The emergency number for fire and ambulance services in South Africa is ___. If your clothes catch fire, you should Stop, Drop, and ___.',
    ['10177', 'Roll'],
    '10177 is the emergency number for fire and ambulance services in South Africa. STOP, DROP, and ROLL is the correct technique to put out flames on your clothing.'),
  t(6, '### Emergency Plans and Being Safe at Home and School\n\n**Creating an emergency plan:**\nEvery family and school should have an emergency plan. Here is how to create one:\n\n1. **Identify risks** — what disasters could happen in your area?\n2. **Know the exits** — learn all the exits from your home and school\n3. **Choose a meeting point** — where will your family meet if you are separated?\n4. **Keep emergency numbers** — write them down and keep them somewhere safe\n5. **Practise your plan** — do fire drills at school and at home\n\n**Important emergency numbers:**\n\n| Service | Number |\n|---------|--------|\n| Police (SAPS) | 10111 |\n| Ambulance / Fire | 10177 |\n| Childline | 0800 055 555 |\n| From a cellphone | 112 |\n\n**Safety at home:**\n- Lock doors and windows at night\n- Never open the door to strangers\n- Know your home address and a parent\'s phone number by heart\n- Be careful with electricity — never touch exposed wires\n- Keep medicines and cleaning chemicals out of reach of younger children'),
  q(7, 'During the 2022 KZN floods, what was the most important thing people needed to do?',
    ['Listen to early warning systems and move to higher ground', 'Stay at home and wait for the water to go down', 'Try to swim through the flood water to reach safety', 'Ignore the warnings because floods never last long'], 0,
    'During floods, the most important actions are to listen to weather warnings, move to higher ground, and NEVER walk or drive through flood water. Just 30 cm of moving water can knock you off your feet.'),
  fb(8, 'South Africa\'s police emergency number is ___. When crossing the road, you should Stop, Look, and ___.',
    ['10111', 'Listen'],
    'The SAPS emergency number is 10111. When crossing the road, always STOP at the kerb, LOOK left-right-left, and LISTEN for approaching vehicles before crossing.'),
  q(9, 'Why should you NEVER walk through flood water?',
    ['Flood water can be much deeper and faster than it looks, and can sweep you away', 'Flood water is always shallow', 'Walking through water is good exercise', 'Flood water is always clean'], 0,
    'Flood water is extremely dangerous. It can be deeper than it looks, contain hidden hazards (open drains, debris), carry diseases, and even 30 cm of fast-moving water can knock an adult off their feet.'),
  t(10, '### Summary: Safety in the Environment\n\n**Key ideas from this chapter:**\n- Road safety: STOP, LOOK, LISTEN before crossing\n- Fire safety: STOP, DROP, ROLL if your clothes catch fire\n- Water safety: never swim alone, avoid flooded rivers\n- Natural disasters: floods, droughts, and veld fires affect South Africa\n- Have an emergency plan and know emergency numbers\n- Police: 10111 | Ambulance/Fire: 10177 | Childline: 0800 055 555 | Cellphone: 112'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Physical Fitness and Health (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Physical Fitness and Health\n\nPhysical fitness means your body is strong, flexible, and has enough energy to do daily activities without getting too tired. Being physically fit helps you perform better in sport, concentrate at school, and feel good about yourself.\n\n### Components of Fitness\n\nPhysical fitness has several components:\n\n| Component | What it means | Example activity |\n|-----------|-------------|------------------|\n| **Cardiovascular endurance** | How long your heart and lungs can keep working during exercise | Running, swimming, cycling |\n| **Muscular strength** | How much force your muscles can produce | Push-ups, carrying heavy bags |\n| **Muscular endurance** | How long your muscles can keep working | Holding a plank, doing many sit-ups |\n| **Flexibility** | How well your joints and muscles can stretch | Touching your toes, doing splits |\n| **Speed** | How fast you can move | Sprinting, quick direction changes |\n| **Balance** | Keeping your body steady | Standing on one foot, gymnastics |\n| **Coordination** | Using different body parts together smoothly | Catching a ball, skipping rope |'),
  t(2, '### Measuring Fitness\n\nYou can test your fitness levels with simple tests. Try these at school or at home:\n\n**Simple fitness tests:**\n\n| Test | What it measures | How to do it |\n|------|-----------------|-------------|\n| **12-minute run** | Cardiovascular endurance | Run as far as you can in 12 minutes |\n| **Push-ups** | Muscular strength and endurance | Do as many proper push-ups as you can |\n| **Sit-and-reach** | Flexibility | Sit with legs straight, reach for your toes |\n| **30-metre sprint** | Speed | Run 30 metres as fast as you can, time it |\n| **Standing long jump** | Leg power | Jump forward as far as you can from standing |\n| **Plank hold** | Core endurance | Hold a plank position as long as you can |\n\n**What your results mean:**\nDo not compare yourself to others — compare yourself to your OWN past results. The goal is to improve over time. Test yourself at the start of the term and again at the end to see your progress.'),
  q(3, 'Which component of fitness describes how long your heart and lungs can keep working during exercise?',
    ['Cardiovascular endurance', 'Muscular strength', 'Flexibility', 'Speed'], 0,
    'Cardiovascular endurance is the ability of your heart and lungs to supply oxygen to your muscles during sustained physical activity. It is improved through activities like running, swimming, and cycling.'),
  t(4, '### Target Games\n\nTarget games are activities where you aim at a target or try to get as close to a target as possible. They help develop:\n- **Accuracy** — hitting what you aim at\n- **Concentration** — focusing on the target\n- **Hand-eye coordination** — using your eyes and hands together\n\n**Examples of target games:**\n\n| Game | How to play |\n|------|------------|\n| **Bocce / Jukskei** | Throw objects to get closest to a target — jukskei is a traditional SA game |\n| **Darts** | Throw darts at a target board (use soft-tip darts for safety) |\n| **Bowling** | Roll a ball to knock down pins |\n| **Beanbag toss** | Throw beanbags into hoops or buckets at different distances |\n| **Archery** | Shoot arrows at a target (with supervision) |\n\n**Jukskei** is a traditional South African game played by Voortrekkers. Two teams take turns throwing wooden pins (skeis) at a peg in a sandpit. It is a fun way to practise accuracy and enjoy our SA heritage!'),
  fb(5, 'The component of fitness that describes how well your joints and muscles can stretch is called ___. Jukskei is a traditional South African ___ game.',
    ['flexibility', 'target'],
    'Flexibility is the ability of your joints and muscles to move through their full range of motion. Jukskei is a traditional SA target game where players throw wooden pins at a peg.'),
  t(6, '### Nutrition for Active Learners\n\nWhat you eat affects how well you perform in sport and physical activity.\n\n**Before exercise:**\n- Eat a light meal 1–2 hours before activity\n- Good options: banana, peanut butter on bread, oats\n- Drink water to stay hydrated\n\n**During exercise:**\n- Sip water regularly, especially on hot days\n- If exercising for more than an hour, have a small snack (fruit, energy bar)\n\n**After exercise:**\n- Eat within 30 minutes to help your muscles recover\n- Good options: fruit, yoghurt, a balanced meal with protein\n- Drink plenty of water to replace what you lost through sweat\n\n**Affordable, healthy SA foods for active learners:**\n- Bananas (energy boost)\n- Peanuts and peanut butter (protein and energy)\n- Amasi (protein and calcium)\n- Morogo/spinach (iron and vitamins)\n- Sweet potatoes (energy)\n- Eggs (protein)\n- Beans and lentils (protein and energy)'),
  q(7, 'When is the best time to eat after exercise?',
    ['Within 30 minutes, to help your muscles recover', 'You should not eat after exercise', 'Wait at least 3 hours before eating', 'Only eat if you feel dizzy'], 0,
    'Eating within 30 minutes after exercise helps your muscles recover and rebuild. A combination of protein and carbohydrates is best — for example, fruit with yoghurt, or a balanced meal.'),
  fb(8, 'You should eat a light meal ___ to 2 hours before exercise. The 12-minute run test measures your ___ endurance.',
    ['1', 'cardiovascular'],
    'Eating 1–2 hours before exercise gives your body time to digest and convert food into energy. The 12-minute run (Cooper test) measures cardiovascular endurance — how efficiently your heart and lungs work during sustained activity.'),
  q(9, 'Which of the following is a good affordable source of protein for active learners in South Africa?',
    ['Beans and lentils', 'Sweets and fizzy drinks', 'White bread only', 'Crisps and chips'], 0,
    'Beans and lentils are excellent, affordable sources of protein that are widely available in South Africa. They also provide energy and fibre, making them ideal for active learners.'),
  t(10, '### Summary: Physical Fitness and Health\n\n**Key ideas from this chapter:**\n- Physical fitness includes cardiovascular endurance, strength, flexibility, speed, balance, and coordination\n- Test your fitness and aim to improve YOUR own results over time\n- Target games like jukskei develop accuracy and concentration\n- Eat well before, during, and after exercise\n- Affordable SA foods like bananas, peanuts, beans, amasi, and eggs support an active lifestyle\n- Drink plenty of water, especially on hot days'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Peer Pressure (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Peer Pressure\n\nPeer pressure is the influence that people your own age have on your behaviour, thoughts, and decisions. As a Grade 6 learner, peer pressure becomes stronger because you care more about what your friends think of you.\n\n### Positive and Negative Peer Pressure\n\nNot all peer pressure is bad! It depends on what your peers are encouraging you to do.\n\n**Positive peer pressure:**\n- Friends encourage you to study harder\n- A classmate inspires you to join a sports team\n- Your group decides to stop gossiping about others\n- Friends remind you to do your homework\n\n**Negative peer pressure:**\n- Friends dare you to bunk school\n- Someone says you are a "baby" if you do not try a cigarette\n- A group bullies another learner and expects you to join in\n- Friends pressure you to steal from a shop\n- Someone shares inappropriate content and wants you to look at it\n\n**The difference:**\nPositive peer pressure pushes you to be BETTER. Negative peer pressure pushes you to do things that are HARMFUL, dangerous, or wrong.'),
  t(2, '### Saying No — Refusal Skills\n\nSaying no to friends can be hard, especially when you want to fit in. But learning to say no is one of the most important skills you will ever develop.\n\n**Refusal techniques:**\n\n| Technique | Example |\n|-----------|--------|\n| **Say NO clearly** | "No, I am not going to do that." |\n| **Give a reason** | "No thanks — I have a test tomorrow." |\n| **Suggest something else** | "Let\'s play soccer instead of going there." |\n| **Walk away** | Just leave — you do not owe anyone an explanation |\n| **Broken record** | Keep repeating: "No." "I said no." "Still no." |\n| **Use humour** | "Ha! My mom would ground me until I am 30!" |\n| **Blame someone else** | "My parents check my phone" or "My teacher will find out." |\n| **Strength in numbers** | Stick with friends who also want to say no |\n\n**Remember:** Real friends respect your decisions. If someone pressures you after you say no, they are not being a true friend.'),
  q(3, 'Nosipho\'s friends want her to copy answers during a test. They say, "Everyone does it — don\'t be boring." What refusal technique should Nosipho use?',
    ['Say NO clearly: "No, cheating is wrong and I don\'t want to get into trouble. I studied and I want to do it myself."', 'Copy the answers because everyone is doing it', 'Say nothing and just go along with it', 'Get angry and shout at her friends'], 0,
    'Nosipho should say no clearly and give a reason. Cheating is dishonest and can lead to serious consequences like getting zero for the test or being disciplined. Real friends would not pressure her to cheat.'),
  t(4, '### Making Your Own Decisions\n\nAs you grow older, you need to learn to think for yourself and make your own decisions, even when others disagree.\n\n**Decision-making steps:**\n1. **Identify the choice** — what exactly am I being asked to do?\n2. **Think about consequences** — what could happen if I do this? What could happen if I don\'t?\n3. **Check your values** — does this go against what I believe is right?\n4. **Consider the law** — is this legal? Could I get in trouble?\n5. **Trust your gut** — if something feels wrong, it probably IS wrong\n6. **Decide and act** — make your choice and stand by it\n\n**Thinking about consequences:**\n\n| Decision | Short-term consequence | Long-term consequence |\n|----------|----------------------|---------------------|\n| Bunking school | Fun afternoon with friends | Falling behind in work, getting suspended |\n| Trying a cigarette | Feeling grown-up for a moment | Addiction, damaged lungs, wasted money |\n| Standing up to a bully | It might feel scary | You help someone and build your own courage |\n| Studying for a test | Missing out on play time | Better marks, more options for the future |'),
  fb(5, 'Repeating your refusal calmly over and over is called the ___ record technique. If something feels wrong, it probably ___ wrong.',
    ['broken', 'IS'],
    'The broken record technique means calmly repeating your refusal until the other person accepts it. Trusting your instinct is important — if something feels wrong, it usually is.'),
  t(6, '### Standing Up for What Is Right\n\nSometimes peer pressure is not about what people ask you to do — it is about what they expect you to WATCH and accept.\n\n**Bystander effect:**\nWhen someone is being bullied or treated unfairly, people often do nothing because they think someone else will step in. This is called the bystander effect.\n\n**How to be an upstander (not a bystander):**\n- Speak up: "Stop it, that is not okay."\n- Support the victim: "Come sit with us."\n- Report it: tell a teacher or trusted adult\n- Do not laugh or share — if someone is being cyberbullied, do not share the post or video\n- Include people who are being left out\n\n**Role-playing scenarios:**\nPractising what to say and do helps you feel ready when real situations happen.\n\n| Scenario | What you could say or do |\n|----------|-------------------------|\n| Friends are teasing a learner about their weight | "That is not funny. How would you feel if someone said that to you?" |\n| Someone dares you to vandalise school property | "No thanks, I am not going to get expelled for a dare." |\n| A friend sends you a mean message about someone | "I am not going to forward this. Please stop sending things like that." |'),
  q(7, 'What is the "bystander effect"?',
    ['When people do nothing to help because they think someone else will step in', 'When a bystander runs away from danger', 'When a teacher does not notice bullying', 'When a learner stands up to a bully'], 0,
    'The bystander effect happens when people witness something wrong but do nothing because they assume someone else will act. The more people watching, the less likely any one person is to help. That is why it is important to be an UPSTANDER — the first person to speak up.'),
  fb(8, 'A person who speaks up when they see something wrong is called an ___. Real friends respect your ___.',
    ['upstander', 'decisions'],
    'An upstander is someone who takes action when they see bullying or unfairness, instead of being a passive bystander. True friends respect your right to make your own decisions.'),
  q(9, 'Which of the following is an example of POSITIVE peer pressure?',
    ['Your friend encourages you to join the school athletics team', 'A classmate dares you to steal from the tuck shop', 'Friends tell you that studying is boring and you should bunk', 'Someone says you are a baby for not trying alcohol'], 0,
    'Positive peer pressure encourages you to do something good for yourself or others. Being encouraged to join a sports team helps your fitness, builds friendships, and develops your skills.'),
  t(10, '### Summary: Peer Pressure\n\n**Key ideas from this chapter:**\n- Peer pressure can be positive (encourages good behaviour) or negative (pushes harmful behaviour)\n- Use refusal techniques: say no, give a reason, walk away, broken record\n- Make your own decisions — think about consequences before you act\n- Be an upstander, not a bystander — speak up when you see something wrong\n- Real friends respect your choices\n- If something feels wrong, it probably IS wrong'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Study Skills and Exam Preparation (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Study Skills and Exam Preparation\n\nGood study habits help you learn better, remember more, and feel less stressed about tests and exams. As a Grade 6 learner, developing these skills now will prepare you for the bigger challenges of high school.\n\n### Time Management\n\nTime management means using your time wisely so that you can fit in everything you need to do.\n\n**Why time management matters:**\n- Less stress — you are not rushing to finish at the last minute\n- Better results — you have time to study properly\n- More free time — when you plan well, you actually have MORE time for fun\n\n**Tips for managing your time:**\n- Use a diary or planner to write down homework, tests, and activities\n- Do homework as soon as you get home (before you forget)\n- Break big tasks into smaller steps\n- Set a timer — study for 25 minutes, then take a 5-minute break (this is called the Pomodoro technique)\n- Avoid distractions — put your phone away, turn off the TV\n- Prioritise — do the hardest or most urgent task first'),
  t(2, '### Creating a Study Timetable\n\nA study timetable helps you organise your study time so you cover all your subjects.\n\n**How to create a study timetable:**\n\n| Step | What to do |\n|------|----------|\n| 1. List your subjects | Write down all the subjects you need to study |\n| 2. Note test dates | Mark all upcoming tests and exams on a calendar |\n| 3. Block out fixed time | School, meals, sport, and sleep are not negotiable |\n| 4. Assign study slots | Give each subject a time slot — harder subjects get more time |\n| 5. Include breaks | Study for 25–30 minutes, then take a 5–10 minute break |\n| 6. Be realistic | Do not try to study 5 hours straight — it will not work |\n\n**Sample after-school routine for a Grade 6 learner:**\n\n| Time | Activity |\n|------|----------|\n| 14:30–15:00 | Arrive home, have a snack, relax |\n| 15:00–15:45 | Homework |\n| 15:45–16:00 | Break (stretch, get water) |\n| 16:00–16:30 | Study subject 1 |\n| 16:30–17:00 | Play outside / sport |\n| 17:00–17:30 | Study subject 2 |\n| 17:30 onwards | Family time, dinner, reading, bed |'),
  q(3, 'The Pomodoro technique involves studying for 25 minutes and then taking a short break. Why is this effective?',
    ['Your brain can focus better in short bursts, and regular breaks prevent tiredness and boredom', 'It is easier to cheat when you study in small chunks', 'The break is long enough to watch a full TV show', 'It only works for Mathematics'], 0,
    'The Pomodoro technique works because the brain can maintain deep focus for about 25 minutes. Short breaks allow your brain to rest and consolidate what you have learned, so you remember more.'),
  t(4, '### Note-Taking and Mind Maps\n\nGood notes help you remember what you learned in class and make revision easier.\n\n**Effective note-taking tips:**\n- Write in your OWN words — do not just copy from the board\n- Use headings and bullet points to organise information\n- Highlight or underline key words\n- Leave space to add extra notes later\n- Write neatly — messy notes are hard to revise from\n\n**Mind maps:**\nA mind map is a visual way to organise information. It helps you see how ideas connect.\n\n**How to create a mind map:**\n1. Write the main topic in the centre of a blank page\n2. Draw branches for each sub-topic\n3. Add details to each branch\n4. Use colours, pictures, and key words (not full sentences)\n5. Keep it simple and clear\n\n**Why mind maps work:**\n- They use both sides of your brain (logical AND creative)\n- They show connections between ideas\n- They are easier to remember than long pages of notes\n- They help you see the "big picture"'),
  fb(5, 'The study technique where you focus for 25 minutes and then take a 5-minute break is called the ___ technique. A visual way to organise information using branches and key words is called a ___ map.',
    ['Pomodoro', 'mind'],
    'The Pomodoro technique was invented by Francesco Cirillo in the 1980s and is named after a tomato-shaped kitchen timer. Mind maps use visual connections to help you understand and remember information.'),
  t(6, '### Exam Strategies\n\nExam time can be stressful, but good preparation makes it much easier.\n\n**Before the exam:**\n- Start studying early — at least 2 weeks before exams begin\n- Use your study timetable to cover all subjects\n- Practise with past exam papers if available\n- Get enough sleep the night before — your brain needs rest to work well\n- Eat a healthy breakfast on exam morning\n\n**During the exam:**\n\n| Strategy | Why it helps |\n|----------|------------|\n| Read ALL the instructions carefully | You do not want to answer the wrong question |\n| Plan your time | Divide the total time by the number of questions |\n| Answer easy questions first | Build confidence and save harder ones for later |\n| Read each question twice | Make sure you understand what is being asked |\n| Show your working | You can earn marks for method even if the answer is wrong |\n| Check your answers | Use any extra time to review your work |'),
  q(7, 'Thandi has an exam in two days but she has not started studying. What should she do NOW?',
    ['Make a quick study plan focusing on the most important topics, study in focused 25-minute sessions, and get a good night\'s sleep', 'Stay up all night before the exam trying to learn everything', 'Panic and not study at all because it is too late', 'Copy notes from a friend during the exam'], 0,
    'While Thandi should have started earlier, it is not too late. She should focus on the most important topics, use the Pomodoro technique for focused study sessions, and make sure she sleeps well. Pulling an all-nighter is a bad idea because a tired brain cannot think clearly.'),
  t(8, '### Managing Test Anxiety\n\nFeelings of worry or nervousness before tests are called test anxiety. A little bit of nervousness is normal and can even help you focus, but too much can make it hard to think.\n\n**Signs of test anxiety:**\n- Stomach ache or feeling sick before a test\n- Mind going "blank" during the test\n- Difficulty sleeping the night before\n- Sweaty palms or racing heart\n- Negative thoughts: "I am going to fail"\n\n**How to manage test anxiety:**\n- **Prepare well** — the best cure for anxiety is knowing you studied\n- **Breathe deeply** — 4 counts in, 4 counts hold, 4 counts out\n- **Positive self-talk** — replace "I am going to fail" with "I have prepared and I will do my best"\n- **Visualise success** — imagine yourself calmly answering questions\n- **Arrive early** — rushing increases stress\n- **Do not compare** — focus on YOUR paper, not what others are doing'),
  fb(9, 'You should start studying for exams at least ___ weeks before they begin. Feelings of worry before a test are called test ___.',
    ['2', 'anxiety'],
    'Starting at least two weeks before exams gives you enough time to cover all subjects without cramming. Test anxiety is common and can be managed with good preparation, deep breathing, and positive self-talk.'),
  q(10, 'Which of the following is the BEST study strategy?',
    ['Study for 25–30 minutes, take a short break, then continue', 'Study for 4 hours without stopping', 'Read through your notes once the night before', 'Only study subjects you enjoy'], 0,
    'Studying in short, focused bursts with breaks is far more effective than marathon study sessions. Your brain retains information better when it has time to process and rest between study periods.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Financial Literacy (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Financial Literacy\n\nFinancial literacy means understanding how money works. Learning about money as a Grade 6 learner helps you make smart decisions about saving, spending, and planning for the future.\n\n### Needs vs Wants\n\nUnderstanding the difference between needs and wants is the first step to being smart with money.\n\n**Needs** are things you MUST have to survive and live a healthy life:\n- Food and clean water\n- Shelter (a safe place to live)\n- Clothing\n- Education\n- Healthcare\n- Transport to school\n\n**Wants** are things you would LIKE to have but can live without:\n- The latest smartphone\n- Branded clothing (like Nike or Adidas)\n- Sweets and fizzy drinks\n- Video games\n- Expensive haircuts\n\n| Category | Need or want? | Why? |\n|----------|-------------|------|\n| School uniform | Need | Required for education |\n| Designer sneakers | Want | Regular shoes serve the same purpose |\n| Healthy lunch | Need | Your body needs nutrition |\n| Chips and cold drink | Want | Not necessary for health |\n| Textbooks | Need | Essential for learning |\n| Latest cellphone | Want | A basic phone does the same job |'),
  t(2, '### Saving Money and Budgeting Pocket Money\n\nEven if you only get a small amount of pocket money, learning to manage it is an important skill.\n\n**Why saving matters:**\n- You can buy something bigger later (saving up for a goal)\n- You have money for emergencies\n- You develop self-discipline\n- You learn to delay gratification (waiting for what you want)\n\n**The 50-30-20 rule (simplified for Grade 6):**\n\n| Portion | How much | What for |\n|---------|----------|----------|\n| **50%** | Half your money | Needs — school supplies, transport |\n| **30%** | About a third | Wants — treats, small purchases |\n| **20%** | One fifth | Savings — put away for the future |\n\n**Example:** If you receive R50 pocket money per week:\n- R25 for needs (school lunch, stationery)\n- R15 for wants (a treat or small purchase)\n- R10 into savings\n\n**Tips for saving:**\n- Use a piggy bank or savings jar at home\n- Set a savings goal — what are you saving for?\n- Do not spend money just because you have it\n- Wait 24 hours before buying something expensive — you might change your mind'),
  q(3, 'Bongani receives R100 pocket money for the month. Using the 50-30-20 rule, how much should he save?',
    ['R20', 'R50', 'R30', 'R10'], 0,
    'The 50-30-20 rule says you should save 20% of your money. 20% of R100 = R20. This R20 goes into savings for the future, while R50 covers needs and R30 covers wants.'),
  t(4, '### Income and Expenses\n\n**Income** is money coming IN. For adults, this is usually a salary. For Grade 6 learners, it might be:\n- Pocket money from parents\n- Money earned from chores\n- Gift money (birthdays, holidays)\n- Money from selling things you make\n\n**Expenses** are money going OUT — things you spend money on.\n\n**Creating a simple budget:**\nA budget is a plan for how you will spend your money.\n\n| Item | Income (R) | Expenses (R) |\n|------|-----------|-------------|\n| Pocket money | 80 | — |\n| Birthday gift | 50 | — |\n| School lunch | — | 40 |\n| Stationery | — | 20 |\n| Sweets | — | 15 |\n| Savings | — | 30 |\n| **Total** | **130** | **105** |\n| **Left over** | | **R25** |\n\n**Golden rule:** Your expenses should NEVER be more than your income. If they are, you are spending too much and need to cut back on wants.'),
  fb(5, 'Money coming in is called ___. Money going out (what you spend) is called ___.',
    ['income', 'expenses'],
    'Income is all the money you receive, whether from pocket money, gifts, or earning it. Expenses are everything you spend money on, from needs to wants.'),
  t(6, '### The Role of Banks and Advertising Awareness\n\n**What banks do:**\nBanks are places that keep your money safe and help it grow.\n\n| Bank service | What it means |\n|-------------|-------------|\n| **Savings account** | A safe place to keep your money; the bank pays you interest (extra money) for keeping it there |\n| **Current account** | For everyday transactions (deposits, withdrawals, payments) |\n| **Debit card** | A card linked to your bank account for payments |\n| **ATM** | A machine where you can withdraw cash |\n| **Interest** | Extra money the bank pays you for saving with them |\n\n**Major banks in South Africa:** ABSA, Standard Bank, FNB, Nedbank, Capitec, TymeBank.\n\n**Advertising awareness:**\nCompanies spend millions of rands on advertising to make you want to buy their products. Be aware of these tricks:\n- Using celebrities to promote products\n- Making products look better than they are\n- "Limited time offers" that pressure you to buy NOW\n- "Buy one get one free" — you still spend money on the first item\n- Targeting children with colourful packaging and cartoon characters'),
  q(7, 'Why do banks pay you interest on your savings?',
    ['Because they use your money to lend to other people, and share some of the profit with you', 'Because they feel sorry for you', 'Because the government forces them to', 'Interest is a fee you pay the bank'], 0,
    'Banks pay you interest because they lend your savings to other people and businesses, charging them higher interest. The bank then shares a portion of that profit with you as a reward for saving your money with them.'),
  fb(8, 'The 50-30-20 rule says you should save ___% of your money. The extra money a bank pays you for saving with them is called ___.',
    ['20', 'interest'],
    'The 50-30-20 rule recommends saving 20% of your income. Interest is the money a bank pays you for keeping your savings in an account with them.'),
  q(9, 'A TV advert shows a famous soccer player drinking a new energy drink and says, "Be like your hero — buy it now!" What advertising trick is being used?',
    ['Using a celebrity to make the product seem cool and desirable', 'Giving you honest information about the product', 'Offering the product for free', 'Telling you not to buy the product'], 0,
    'This is celebrity endorsement — companies pay famous people to promote their products because fans want to copy their heroes. Just because a celebrity uses a product does not mean it is good for you.'),
  t(10, '### Summary: Financial Literacy\n\n**Key ideas from this chapter:**\n- Needs are essentials (food, shelter, education); wants are nice-to-haves\n- Use the 50-30-20 rule: 50% needs, 30% wants, 20% savings\n- A budget helps you plan your spending — expenses should never exceed income\n- Banks keep your money safe and pay interest on savings\n- Be aware of advertising tricks — companies try to make you spend money on things you do not need\n- Start saving now, even small amounts — it builds a good habit for life'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Careers and the World of Work (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Careers and the World of Work\n\nIt is never too early to start thinking about what you want to be when you grow up. Understanding different careers helps you make good choices about your education and future.\n\n### Different Types of Jobs\n\nJobs can be grouped into sectors (areas of work):\n\n| Sector | Examples | Skills needed |\n|--------|---------|---------------|\n| **Health** | Doctor, nurse, paramedic, pharmacist | Science, caring, working under pressure |\n| **Education** | Teacher, principal, lecturer, tutor | Communication, patience, knowledge |\n| **Technology** | Programmer, IT technician, data analyst | Maths, problem-solving, computer skills |\n| **Business** | Accountant, manager, entrepreneur | Maths, planning, leadership |\n| **Creative** | Graphic designer, musician, writer, photographer | Creativity, imagination, technical skills |\n| **Trades** | Electrician, plumber, mechanic, builder | Practical skills, maths, physical fitness |\n| **Public service** | Police officer, firefighter, social worker | Courage, caring, communication |\n| **Agriculture** | Farmer, vet, agricultural scientist | Nature knowledge, science, hard work |'),
  t(2, '### Skills Needed for the World of Work\n\nNo matter what career you choose, there are certain skills that every employer values:\n\n**Essential skills for any job:**\n- **Communication** — speaking and writing clearly\n- **Problem-solving** — finding solutions when things go wrong\n- **Teamwork** — working well with other people\n- **Time management** — being on time and meeting deadlines\n- **Numeracy** — basic maths skills (budgets, measurements, calculations)\n- **Literacy** — reading and writing well\n- **Digital skills** — using computers, email, and the internet\n\n**How school prepares you for work:**\n\n| School subject | Career link |\n|---------------|------------|\n| Mathematics | Engineering, accounting, science, technology |\n| English | Law, journalism, teaching, business |\n| Natural Sciences | Medicine, agriculture, environmental science |\n| Technology | Engineering, IT, manufacturing |\n| Creative Arts | Design, music, film, advertising |\n| Life Orientation | Social work, counselling, HR |'),
  q(3, 'Which skill is important for EVERY career, no matter what job you do?',
    ['Communication — being able to speak and write clearly', 'Playing a musical instrument', 'Knowing how to cook', 'Being able to run fast'], 0,
    'Communication is essential for every career. Whether you are a doctor explaining a diagnosis, a builder reading plans, or a teacher giving a lesson, you need to communicate clearly with others.'),
  t(4, '### Entrepreneurship\n\nAn entrepreneur is someone who starts and runs their own business. South Africa needs entrepreneurs because they create jobs and solve problems in communities.\n\n**Famous South African entrepreneurs:**\n- **Elon Musk** — grew up in Pretoria, founded SpaceX and Tesla\n- **Patrice Motsepe** — mining businessman, first Black African billionaire on the Forbes list\n- **Wendy Memory Memory Memory Memory Luhabe** — businesswoman and author\n- **DJ Sbu** — music artist who started MoFaya energy drink\n\n**How Grade 6 learners can be entrepreneurs:**\n- Sell homemade snacks or crafts at school\n- Offer to wash cars or do garden work in your neighbourhood\n- Tutor younger learners for a small fee\n- Make and sell greeting cards or jewellery\n\n**Qualities of a good entrepreneur:**\n- Creative — thinks of new ideas\n- Determined — does not give up easily\n- Organised — plans and manages money well\n- Risk-taker — willing to try new things\n- Problem-solver — finds solutions to challenges'),
  fb(5, 'A person who starts and runs their own business is called an ___. One essential skill needed for every job is ___.',
    ['entrepreneur', 'communication'],
    'An entrepreneur creates and manages a business, taking on financial risk in hopes of making a profit. Communication — the ability to speak, write, and listen clearly — is needed in every profession.'),
  t(6, '### Planning for the Future\n\nEven though you are only in Grade 6, the choices you make now affect your future opportunities.\n\n**Steps for planning your future:**\n1. **Discover your interests** — What do you enjoy doing? What subjects do you like?\n2. **Identify your strengths** — What are you good at? (Ask teachers, family, friends)\n3. **Research careers** — Learn about careers that match your interests and strengths\n4. **Set goals** — Use SMART goals to plan your path\n5. **Work hard at school** — Good marks keep all doors open\n\n**Subject choices matter:**\nIn Grade 10, you will choose subjects that determine which careers you can pursue.\n\n| Career goal | Important subjects to keep |\n|------------|-------------------------|\n| Doctor or nurse | Mathematics, Life Sciences, Physical Sciences |\n| Lawyer | English, History, languages |\n| Engineer | Mathematics, Physical Sciences, Technology |\n| Teacher | Any strong subjects + good communication |\n| Graphic designer | Creative Arts, Technology, English |\n| Accountant | Mathematics, Accounting, Business Studies |'),
  q(7, 'Why is it important for Grade 6 learners to already think about their future career?',
    ['Because the choices they make now — like working hard at school — affect their options in the future', 'Because they must decide their career right now', 'Because there are no jobs in South Africa', 'It is not important — they can think about it later'], 0,
    'While you do not need to decide your exact career in Grade 6, working hard at school and exploring your interests now ensures you have more options later. Good marks and strong skills open doors.'),
  t(8, '### Career Day Ideas\n\nA career day at school is a great way to learn about different jobs. Here are some ideas:\n\n**How to organise a career day:**\n- Invite parents or community members to talk about their jobs\n- Set up stations for different career sectors\n- Let learners "interview" the guest speakers\n- Create career posters showing different jobs and what they involve\n\n**Questions to ask at a career day:**\n- What do you do every day at work?\n- What qualifications did you need?\n- What do you enjoy most about your job?\n- What advice would you give to a Grade 6 learner?\n- How did you decide on this career?\n\n**In South Africa**, there are many growing career fields:\n- **Renewable energy** — solar panel installers, wind farm technicians\n- **Technology** — app developers, cybersecurity experts, data scientists\n- **Healthcare** — nurses, community health workers (especially after COVID-19)\n- **Tourism** — tour guides, hotel managers, chefs\n- **Agriculture** — farmers, food scientists, agricultural engineers'),
  fb(9, 'In Grade ___, learners choose subjects that determine which careers they can pursue. South Africa needs ___ because they create jobs and solve community problems.',
    ['10', 'entrepreneurs'],
    'Grade 10 is when learners choose their FET subjects, which directly affect university entrance and career options. Entrepreneurs are crucial for South Africa\'s economy as they create employment and drive innovation.'),
  q(10, 'Lindiwe loves drawing and is good at using computers. Which career field would BEST match her interests and strengths?',
    ['Graphic design — it combines creativity with digital technology skills', 'Mining — because South Africa has many mines', 'Farming — because South Africa needs food', 'Law — because lawyers earn a lot of money'], 0,
    'Graphic design combines artistic creativity with computer skills, making it a perfect match for Lindiwe\'s interests and strengths. It is important to choose a career that aligns with what you enjoy and what you are good at.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Transition to High School (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Transition to High School\n\nMoving from primary school to high school is one of the biggest changes in your life so far. It is exciting, but it can also feel overwhelming. This chapter will help you prepare for what is ahead.\n\n### What to Expect in Grade 7 and Beyond\n\nGrade 7 is the final year of primary school and the bridge to high school. Here is what changes:\n\n**Academic changes:**\n- More subjects and more homework\n- Harder content — work builds on what you learn now\n- More tests and formal exams\n- Teachers expect more independence and responsibility\n- You may have different teachers for different subjects\n\n**Social changes:**\n- You will meet many new people\n- Friend groups may change\n- You will have more freedom, but also more responsibility\n- There may be older learners who seem intimidating at first\n- Extra-curricular activities (sport, clubs, cultural activities) become more important\n\n**Physical changes:**\n- You are going through or about to go through puberty\n- Your body and emotions are changing\n- You may feel more self-conscious about your appearance'),
  t(2, '### New Subjects and Time Management\n\n**New subjects you may encounter in high school:**\n\n| Subject | What you learn |\n|---------|---------------|\n| **Accounting** | Managing money, financial statements, bookkeeping |\n| **Business Studies** | How businesses work, entrepreneurship, marketing |\n| **Consumer Studies** | Nutrition, food preparation, consumer rights |\n| **Computer Applications Technology (CAT)** | Using software like spreadsheets, databases, presentations |\n| **Engineering & Graphics Design** | Drawing technical plans, understanding structures |\n| **Dramatic Arts** | Acting, performance, theatre |\n\n**Time management becomes essential:**\nIn high school, you will have more subjects, more homework, and more activities. Managing your time well is key to success.\n\n**Tips:**\n- Use a homework diary EVERY day\n- Do not leave assignments until the last minute\n- Balance schoolwork with sport, friends, and rest\n- Ask for help early if you are struggling — do not wait until you are failing\n- Create a weekly study timetable (see Chapter 9 for tips)'),
  q(3, 'Which of the following is a change learners can expect when moving to high school?',
    ['More subjects, more homework, and different teachers for different subjects', 'Less homework and easier work', 'The same number of subjects as primary school', 'No tests or exams in the first year'], 0,
    'High school brings more academic demands — more subjects, more homework, more tests, and different teachers for different subjects. Learners need to be more organised and independent.'),
  t(4, '### Making New Friends and Coping with a Bigger School\n\nStarting at a new school means meeting lots of new people. This can be exciting but also nerve-wracking.\n\n**Tips for making new friends:**\n- **Be yourself** — do not pretend to be someone you are not\n- **Smile and say hello** — simple friendliness goes a long way\n- **Join a club or sport** — shared activities are the easiest way to make friends\n- **Ask questions** — people love talking about themselves ("Where are you from?" "What sport do you play?")\n- **Be kind to everyone** — you never know who might become your best friend\n- **Give it time** — strong friendships take time to develop\n\n**Coping with a bigger school:**\n- Walk around the school before classes start to find your classrooms\n- Ask older learners or teachers for directions — they expect new learners to ask\n- Buddy up with someone so you are not walking alone\n- Keep your timetable with you until you memorise it\n- Remember: EVERY Grade 8 learner is new — you are not alone!'),
  fb(5, 'In high school, learners have ___ teachers for different subjects. EVERY Grade ___ learner is new to the high school, so you are not alone.',
    ['different', '8'],
    'Unlike primary school where you often have one main teacher, high school has specialist teachers for each subject. All Grade 8 learners are new, so everyone is in the same boat.'),
  t(6, '### Setting Goals for the Future\n\nThe transition to high school is a great time to set goals for yourself.\n\n**Academic goals:**\n- "I will achieve at least 60% in all my subjects"\n- "I will complete all homework on time"\n- "I will ask for help within one week if I do not understand something"\n\n**Social goals:**\n- "I will join at least one extra-curricular activity"\n- "I will make at least three new friends in my first term"\n- "I will be kind to everyone, including people who are different from me"\n\n**Personal goals:**\n- "I will manage my time using a study timetable"\n- "I will read one book per month for fun"\n- "I will stay active by playing sport or exercising regularly"\n\n**Remember the SMART goal framework:**\n- **S**pecific — clearly state what you want\n- **M**easurable — how will you know you achieved it?\n- **A**chievable — realistic for your situation\n- **R**elevant — matters for your future\n- **T**ime-bound — set a deadline'),
  q(7, 'Which of the following is a SMART goal for a new high school learner?',
    ['"I will achieve at least 60% in all my subjects by the end of Term 1 by studying for 30 minutes each day"', '"I want to be the smartest person in school"', '"I will try harder"', '"I hope my teachers are nice"'], 0,
    'The first option is SMART: Specific (60% in all subjects), Measurable (percentage), Achievable (with daily study), Relevant (academic success), and Time-bound (end of Term 1). The other options are vague wishes, not measurable goals.'),
  t(8, '### Coping Strategies for the Transition\n\nIt is completely normal to feel a mix of excitement and worry about high school. Here is how to cope:\n\n**Emotional coping:**\n- Talk about your feelings with parents, friends, or a teacher\n- Write in a journal about your hopes and fears\n- Remember that everyone feels nervous — you are not the only one\n- Focus on the exciting parts — new friends, new subjects, more freedom\n\n**Practical coping:**\n- Visit the high school before you start (open days, orientation)\n- Get your uniform, stationery, and bag ready early\n- Practise the route to school — walk it or use public transport before the first day\n- Pack your bag the night before\n\n**Building resilience:**\nResilience means being able to bounce back when things are tough.\n- If you have a bad day, tomorrow is a fresh start\n- If you fail a test, learn from it and study differently next time\n- If a friendship does not work out, be open to new friendships\n- If you feel overwhelmed, ask for help — it is a sign of strength, not weakness\n\n**Support systems:**\n- Parents or guardians\n- Teachers and school counsellors\n- Friends and siblings who have already been through the transition\n- Childline: 0800 055 555'),
  fb(9, 'The ability to bounce back when things are tough is called ___. SMART goals must be Specific, Measurable, Achievable, Relevant, and ___-bound.',
    ['resilience', 'Time'],
    'Resilience is the ability to recover from difficulties and keep going. The T in SMART stands for Time-bound — every goal needs a deadline to keep you on track.'),
  q(10, 'What is the BEST thing you can do if you feel overwhelmed during your transition to high school?',
    ['Talk to a trusted adult like a parent, teacher, or counsellor about how you feel', 'Keep your feelings to yourself and hope they go away', 'Skip school to avoid the stress', 'Pretend everything is fine and never ask for help'], 0,
    'Talking to a trusted adult is always the best first step when you feel overwhelmed. They can offer practical advice, emotional support, and help you develop a plan. Asking for help is a sign of strength.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create Grade 6
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 6/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 6:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 6', schoolId: SCHOOL_ID, orderIndex: 6,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 6:', String(GRADE_ID));
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

  // Find the CAPS framework
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
    status: 'approved',
    tags: ['grade-6', 'life-orientation', 'caps'],
    aiModel: '',
    aiPrompt: '',
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    difficulty: 2,
    estimatedMinutes: 30,
    prerequisites: [],
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: '',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  const chapters = [
    {
      title: 'Chapter 1: Development of the Self',
      description: 'Self-concept, self-esteem, positive self-image, unique qualities, talents and interests, dealing with change, and preparing for the transition to high school.',
      order: 1,
      lessons: [
        { title: 'Development of the Self', description: 'Understanding self-concept and self-esteem, building a positive self-image, discovering unique qualities, talents and interests, dealing with change, and positive self-talk.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Healthy Lifestyle Choices',
      description: 'Nutrition basics, exercise, personal hygiene, substance abuse awareness, making healthy choices using the STOP method, and helplines for support.',
      order: 2,
      lessons: [
        { title: 'Healthy Lifestyle Choices', description: 'The food groups with SA examples, daily exercise requirements, personal hygiene habits, dangers of cigarettes, alcohol, dagga, and drugs, the STOP method for decision-making, and Childline helpline.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Dealing with Emotions',
      description: 'Understanding emotions, managing anger and sadness, expressing feelings using "I" statements, empathy, and coping strategies for difficult feelings.',
      order: 3,
      lessons: [
        { title: 'Dealing with Emotions', description: 'Common emotions, healthy and unhealthy ways to manage anger, expressing feelings with "I" statements, developing empathy, coping strategies, and when to ask for help.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Social Responsibility',
      description: 'Being a responsible citizen, community involvement, volunteer work, Mandela Day, caring for the environment, the three Rs, respecting diversity, and ubuntu.',
      order: 4,
      lessons: [
        { title: 'Social Responsibility', description: 'Responsible citizenship at school and in the community, volunteering and Mandela Day, environmental care (reduce, reuse, recycle), water conservation, respecting diversity in the Rainbow Nation, and ubuntu.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Democracy and Human Rights',
      description: 'What is democracy, Freedom Day, children\'s rights (Section 28), the Children\'s Act, responsibilities that go with rights, and reporting abuse.',
      order: 5,
      lessons: [
        { title: 'Democracy and Human Rights', description: 'Democracy in South Africa, the first democratic election (1994), children\'s rights under Section 28, the Children\'s Act (Act 38 of 2005), matching rights with responsibilities, types of abuse, and reporting abuse.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Safety in the Environment',
      description: 'Road safety, fire safety, water safety, natural disasters in South Africa, emergency numbers, emergency plans, and safety at home and school.',
      order: 6,
      lessons: [
        { title: 'Safety in the Environment', description: 'Road safety rules, STOP DROP ROLL for fire, water safety, floods, droughts, and veld fires in SA, the 2022 KZN floods, emergency plans, and emergency numbers (10111, 10177, 112).', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Physical Fitness and Health',
      description: 'Components of fitness, measuring fitness, target games including jukskei, nutrition for active learners, and affordable South African foods.',
      order: 7,
      lessons: [
        { title: 'Physical Fitness and Health', description: 'Components of fitness (endurance, strength, flexibility, speed, balance, coordination), simple fitness tests, target games and jukskei, nutrition before/during/after exercise, and affordable SA foods for active learners.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Peer Pressure',
      description: 'Positive and negative peer pressure, refusal skills, making your own decisions, standing up for what is right, the bystander effect, and role-playing scenarios.',
      order: 8,
      lessons: [
        { title: 'Peer Pressure', description: 'Types of peer pressure, refusal techniques (broken record, walk away, humour), decision-making steps, thinking about consequences, being an upstander vs bystander, and scenario-based practice.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Study Skills and Exam Preparation',
      description: 'Time management, the Pomodoro technique, study timetables, note-taking, mind maps, exam strategies, and managing test anxiety.',
      order: 9,
      lessons: [
        { title: 'Study Skills and Exam Preparation', description: 'Time management tips, the Pomodoro technique, creating a study timetable, effective note-taking, mind maps, exam strategies, and managing test anxiety with deep breathing and positive self-talk.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Financial Literacy',
      description: 'Needs vs wants, saving money, the 50-30-20 rule, budgeting pocket money, income and expenses, the role of banks, and advertising awareness.',
      order: 10,
      lessons: [
        { title: 'Financial Literacy', description: 'Distinguishing needs from wants, saving money, the 50-30-20 budgeting rule, creating a simple budget, income vs expenses, how banks and interest work, and recognising advertising tricks.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Careers and the World of Work',
      description: 'Different types of jobs and sectors, skills needed for work, entrepreneurship, planning for the future, subject choices, and career day ideas.',
      order: 11,
      lessons: [
        { title: 'Careers and the World of Work', description: 'Career sectors (health, education, technology, business, creative, trades), essential workplace skills, entrepreneurship in SA, planning for future subject choices, and career day activities.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Transition to High School',
      description: 'What to expect in Grade 7 and beyond, new subjects, time management, making new friends, coping with a bigger school, setting SMART goals, and building resilience.',
      order: 12,
      lessons: [
        { title: 'Transition to High School', description: 'Academic, social, and physical changes in high school, new subjects, time management, making friends, coping strategies, SMART goals for high school, building resilience, and support systems.', blocks: ch12_lesson1, term: 4 },
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
      resources: resourceIds.map(function(id, i) { return { resourceId: id, order: i }; }),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 6 Life Orientation \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Development of the Self, Healthy Lifestyle Choices, Dealing with Emotions, Social Responsibility, Democracy and Human Rights, Safety in the Environment, Physical Fitness and Health, Peer Pressure, Study Skills and Exam Preparation, Financial Literacy, Careers and the World of Work, and Transition to High School for the Grade 6 Life Orientation curriculum.',
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
  console.log('  TEXTBOOK: Grade 6 Life Orientation');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
