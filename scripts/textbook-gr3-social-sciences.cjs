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
// CHAPTER 1 (History – Term 1): My Family History
// =============================================================================

// --- Lesson 1: Families Past and Present ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Families Past and Present\n\nEvery person in the world belongs to a **family**. Your family is the group of people who love you, take care of you, and help you grow up.\n\nFamilies come in many shapes and sizes:\n\n| Type of Family | What It Means |\n|----------------|---------------|\n| **Nuclear family** | A mom, dad, and their children living together |\n| **Extended family** | Grandparents, aunts, uncles, and cousins all living together or nearby |\n| **Single-parent family** | One parent raising the children |\n| **Child-headed family** | An older brother or sister taking care of younger children |\n| **Blended family** | Two families that have joined together |\n\nIn South Africa, **extended families** are very common. Many children grow up with their grandparents, aunts, and uncles all helping to raise them. This is a beautiful part of our culture.'),
  q(2, 'What is an extended family?',
    ['Grandparents, aunts, uncles, and cousins living together or nearby', 'Only a mom, dad, and their children', 'A family with no children', 'A family that lives in another country'], 0,
    'An extended family includes grandparents, aunts, uncles, cousins, and other relatives. In many South African cultures, the extended family plays a very important role in raising children.',
    ['Think about a family that is bigger than just parents and children.']),
  t(3, '## How Families Have Changed\n\nFamilies today are not the same as families long ago. Many things have changed over time.\n\n### Families Long Ago\n- Many generations lived together in one home or close by\n- Grandparents helped raise the children every day\n- Families grew their own food in gardens and fields\n- Children helped with chores like fetching water and looking after animals\n- Stories were told around the fire at night\n\n### Families Today\n- Many families live in cities, sometimes far from their relatives\n- Both parents often go to work during the day\n- Food is bought from shops and supermarkets\n- Children go to school and do homework\n- Families watch TV, use phones, and play computer games\n\nSome things have **stayed the same**: families still love each other, celebrate together, share meals, and help one another.'),
  fb(4, 'Long ago, families grew their own ___ in gardens. Today, most families buy food from ___ and supermarkets.',
    ['food', 'shops'],
    'In the past, most families in South Africa grew their own vegetables and kept animals for food. Today, most people buy their food from shops because they live in towns and cities.',
    ['Think about where food came from before there were big supermarkets.']),
  t(5, '## Grandparents\' Stories\n\nOne of the best ways to learn about the past is to **talk to your grandparents** or other older family members. They can tell you stories about:\n- What life was like when they were young\n- The games they played as children\n- What their school was like\n- How they travelled (many walked everywhere!)\n- Important events they remember\n\n### Why Are These Stories Important?\n\nWhen older people share their stories, we call this **oral history**. It means history that is spoken, not written down. In many South African cultures, oral history is very important. Elders pass down knowledge, wisdom, and traditions through storytelling.\n\n> **Activity idea:** Ask a grandparent or older family member to tell you about their favourite childhood memory. Listen carefully and share it with your class.'),
  q(6, 'What is oral history?',
    ['History that is spoken and passed down through storytelling', 'History that is written in a book', 'History that is shown on television', 'History that is found on the internet'], 0,
    'Oral history is when stories and knowledge are passed down by word of mouth — by speaking and listening. In South Africa, this has been an important way of keeping our history alive for thousands of years.',
    ['The word "oral" has to do with your mouth — speaking.']),
  t(7, '## Old Photographs\n\nOld photographs are like windows into the past. When we look at old family photographs, we can see:\n- What clothes people wore long ago\n- What their houses and streets looked like\n- How people celebrated special occasions\n- What tools and objects they used\n\n### Comparing Old and New Photos\n\n| Old Photographs | New Photographs |\n|-----------------|------------------|\n| Black and white | Full colour |\n| Taken with big, heavy cameras | Taken with phones and small cameras |\n| People wore formal clothes | People wear casual clothes |\n| Very few photos were taken | We take hundreds of photos! |\n\nLooking at old photos helps us understand how life has changed. Ask your family if they have any old photographs you can look at.'),
  fb(8, 'Old photographs are usually in black and ___. Today, most photos are taken with ___ and small cameras.',
    ['white', 'phones'],
    'In the past, cameras could only take black and white photos. Colour photography only became common much later. Today, almost everyone has a phone with a camera built in.'),
  q(9, 'Why are old family photographs important?',
    ['They show us what life was like in the past', 'They are worth a lot of money', 'They are always very colourful', 'They were taken by famous photographers'], 0,
    'Old photographs help us see what people wore, where they lived, and how they celebrated. They are important because they show us how life has changed over time.',
    ['Think about what you can learn by looking at a picture from long ago.']),
  t(10, '## My Family Tree\n\nA **family tree** is a drawing that shows all the people in your family and how they are related. It looks like a tree, with the oldest family members at the top and the youngest at the bottom.\n\n### How to Draw a Family Tree\n\n1. Start with **yourself** at the bottom of the page\n2. Above you, draw your **parents** (mom and dad)\n3. Above them, draw your **grandparents** (their parents)\n4. Add your **brothers and sisters** next to you\n5. Add **aunts and uncles** next to your parents\n6. Add **cousins** if you know them\n\nA family tree helps you see where you come from. Every person in your family tree is part of your history. You are connected to all of them!\n\n> **Remember:** Every family is different, and every family is special. Your family tree might look different from your friend\'s tree — and that is perfectly okay.'),
];

// --- Lesson 2: My Family Tree and Traditions ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Family Traditions\n\nA **tradition** is something that a family or community does again and again, often for many years. Traditions are passed down from older family members to younger ones.\n\nHere are some examples of family traditions in South Africa:\n\n| Tradition | What It Involves |\n|-----------|------------------|\n| **Sunday lunch** | The whole family gathers for a big meal together |\n| **Braai** | Cooking meat on a fire — a favourite South African tradition! |\n| **Storytelling** | Elders telling stories to children at bedtime or around a fire |\n| **Church or prayer** | Going to a place of worship together |\n| **Cultural ceremonies** | Celebrations like umemulo (Zulu coming-of-age), initiation, or lobola |\n| **Holidays together** | Going to the same place every December |\n\nTraditions help families stay close and remember where they come from.'),
  q(2, 'What is a tradition?',
    ['Something a family does again and again, passed down over the years', 'A new game that children play at school', 'A type of food that you eat every day', 'A rule that the government makes'], 0,
    'A tradition is a practice or custom that is repeated over time and passed down from one generation to the next. Families, communities, and cultures all have their own special traditions.',
    ['Think about something your family does every year or every week that feels special.']),
  t(3, '## Different Cultures, Different Traditions\n\nSouth Africa is called the **Rainbow Nation** because we have so many different cultures and languages. Each culture has its own beautiful traditions.\n\n### Some South African Cultural Traditions\n\n- **Zulu:** The reed dance (Umkhosi Womhlanga) where young women dance for the king\n- **Xhosa:** The practice of ulwaluko (initiation) for young men becoming adults\n- **Afrikaans:** Boerewors rolls and volkspele (folk dancing)\n- **Indian:** Diwali — the festival of lights with beautiful lamps and sweets\n- **Cape Malay:** Cooking bobotie and celebrating with the Cape Minstrel Carnival\n- **Ndebele:** Painting houses with bright, colourful geometric patterns\n- **Sotho/Tswana:** Wearing beautiful Seshoeshoe fabric for special occasions\n\nWe should **respect** everyone\'s traditions, even if they are different from our own.'),
  fb(4, 'South Africa is called the ___ Nation because of its many cultures. The Ndebele people are famous for painting their houses with bright, colourful ___ patterns.',
    ['Rainbow', 'geometric'],
    'South Africa has 11 official languages and many different cultural groups. Archbishop Desmond Tutu called South Africa the Rainbow Nation. The Ndebele people are well known around the world for their beautiful house painting using geometric shapes and bright colours.',
    ['Think about what has many beautiful colours — like after the rain.']),
  t(5, '## How Families Celebrate\n\nFamilies celebrate important events together. In South Africa, some celebrations are the same everywhere, and some are different depending on your culture.\n\n### Important Family Celebrations\n\n- **Birthdays** — A special day each year to celebrate being born\n- **Weddings** — When two people get married. Different cultures have different wedding traditions\n- **New baby** — When a baby is born, families celebrate. In Zulu culture, this is called imbeleko\n- **Religious celebrations** — Christmas, Eid, Diwali, or Passover depending on your religion\n- **Remembering loved ones** — Families remember people who have passed away. In many African cultures, ancestors are honoured and respected\n\n### How Do We Remember?\n\nFamilies keep memories alive through:\n- **Photo albums** — collections of old and new photos\n- **Heirlooms** — special objects passed down (like grandma\'s necklace or grandpa\'s hat)\n- **Recipes** — special foods that the family has always made\n- **Names** — many children are named after grandparents or other family members'),
  q(6, 'In Zulu culture, what is the celebration called when a new baby is born?',
    ['Imbeleko', 'Umkhosi', 'Lobola', 'Ulwaluko'], 0,
    'Imbeleko is a Zulu ceremony held to welcome a new baby into the family and to introduce the child to the ancestors. It is an important family celebration.',
    ['It starts with the letters "im".']),
  t(7, '## Families Helping Each Other\n\nIn South Africa, families help each other in many ways. This is an important part of the African value called **ubuntu** — which means "I am because we are."\n\n### Ways Families Help\n\n| Who Helps | How They Help |\n|-----------|---------------|\n| **Grandparents** | Look after children, share wisdom and stories |\n| **Parents** | Work to earn money, cook food, keep children safe |\n| **Aunts and uncles** | Help raise children, give advice, help in emergencies |\n| **Older children** | Help with younger siblings, do chores |\n| **Neighbours** | Watch over children, share food, help in tough times |\n\n### Stokvels and Savings Groups\n\nMany South African families belong to a **stokvel** — a savings group where families put money together each month. When one family needs money (for school fees, a funeral, or a celebration), the stokvel helps them. This is ubuntu in action!'),
  fb(8, 'The African value of ___ means "I am because we are." A ___ is a savings group where families put money together each month.',
    ['ubuntu', 'stokvel'],
    'Ubuntu is a philosophy that emphasises our connectedness — that we all depend on each other. A stokvel is a traditional South African savings club where members contribute money regularly and take turns receiving the total amount.',
    ['Think about a word that means we are all connected.']),
  q(9, 'What does ubuntu mean?',
    ['I am because we are — we are all connected', 'Every person must work alone', 'Money is the most important thing', 'Only look after yourself'], 0,
    'Ubuntu is an African philosophy that teaches us that we are all connected. It means that a person is a person through other people. When we help others, we help ourselves too.',
    ['It is about caring for each other and being part of a community.']),
  t(10, '## What We Have Learned About Families\n\n### Key Ideas\n\n- Families come in many different shapes and sizes — all are special\n- Families have changed over time, but love and caring have stayed the same\n- We can learn about the past from grandparents\' stories (oral history) and old photographs\n- A family tree shows how family members are connected\n- South Africa has many different cultural traditions and celebrations\n- Ubuntu teaches us that families and communities must help each other\n\n### Think About It\n\n- What makes your family special?\n- What traditions does your family have?\n- Who is the oldest person in your family? What stories can they tell you?\n\nYour family is part of your history. Be proud of where you come from!'),
];

// =============================================================================
// CHAPTER 2 (History – Term 1): My School
// =============================================================================

// --- Lesson 1: The History of Our School ---
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## The History of Our School\n\nEvery school has its own story. Some schools are very old — more than 100 years old! Others are brand new. But every school has a **history** — the story of how it started, who built it, and how it has changed over time.\n\n### Questions to Ask About Your School\n\n- When was our school built?\n- Who started our school?\n- What did the school look like at the beginning?\n- How many learners were there when it opened?\n- Has the school changed its name?\n- What famous people went to our school?\n\n### Finding Out About Your School\'s History\n\nYou can learn about your school\'s history by:\n- Looking at old **photographs** of the school\n- Reading **school records** and yearbooks\n- Talking to **older teachers** and people who went to the school long ago\n- Looking at **plaques** and **trophies** in the school'),
  q(2, 'Which of these is a good way to learn about your school\'s history?',
    ['Looking at old photographs and talking to older teachers', 'Only looking on the internet', 'Asking a baby', 'Guessing what happened'], 0,
    'Old photographs, school records, yearbooks, and talking to people who know the school well are all great ways to learn about your school\'s history. These are all types of historical sources.',
    ['Think about who would know the most about what happened at the school long ago.']),
  t(3, '## How Schools Have Changed\n\nSchools today look very different from schools long ago. Let us compare:\n\n### Schools Long Ago\n- Children sat on wooden benches in rows\n- The teacher wrote on a **chalkboard** with chalk\n- Children wrote on **slates** (small chalkboards) with slate pencils\n- There were very few books — sometimes one book for the whole class\n- Children walked long distances to school, often with no shoes\n- Some schools were **under trees** with no buildings at all\n- Many children, especially girls and black children, were not allowed to go to school\n\n### Schools Today\n- Children sit at desks and use chairs\n- Many classrooms have **whiteboards** or even **smartboards**\n- Children write in exercise books and sometimes use computers or tablets\n- There are libraries with many books\n- Most children travel to school by car, bus, taxi, or walking\n- **All children** have the right to go to school — it is the law!'),
  fb(4, 'Long ago, teachers wrote on a ___ with chalk. Today, all ___ have the right to go to school.',
    ['chalkboard', 'children'],
    'Chalkboards were the main way teachers shared information with the class. Today, the South African Constitution says that every child has the right to basic education — no child may be turned away from school.',
    ['Think about what was on the wall in old classrooms. Think about who can go to school now.']),
  t(5, '## Schools in South Africa\'s Past\n\nThe history of schools in South Africa is connected to the history of our country.\n\n### Before Colonisation\n\nBefore Europeans arrived, children learned from their **families and communities**. Elders taught children important skills like:\n- Farming and growing food\n- Hunting and gathering\n- Building houses\n- Making crafts like baskets and pots\n- The history and traditions of their people\n\nThis learning happened every day — not in a classroom, but in the village and the veld.\n\n### During Apartheid\n\nDuring apartheid (1948–1994), schools were **separated by race**. This was called **Bantu Education**. Black children received a much poorer education than white children. Schools for black children had:\n- Fewer teachers and bigger classes\n- Fewer books and resources\n- Old or broken buildings\n\nThis was very unfair. In **1976**, students in Soweto protested against being forced to learn in Afrikaans. This brave stand helped change South Africa.\n\n### After 1994\n\nAfter democracy, all schools were opened to **all children** regardless of race. The government has been building new schools and trying to make education equal for everyone.'),
  q(6, 'What was Bantu Education?',
    ['The unfair apartheid system that gave black children a poorer education', 'A school for teaching people how to cook', 'A university in Johannesburg', 'A type of homework'], 0,
    'Bantu Education was the apartheid government\'s system of education for black South Africans. It was designed to give them a lower quality education. Many brave people fought against this unfair system.',
    ['Think about what happened during apartheid that was unfair for schools.']),
  t(7, '## School Buildings Then and Now\n\nSchool buildings have changed a lot over the years:\n\n| Long Ago | Today |\n|----------|-------|\n| Mud walls and thatched roofs | Brick walls and metal or tile roofs |\n| One or two classrooms | Many classrooms, halls, and offices |\n| No electricity | Electric lights, fans, and plugs |\n| Outside toilets (pit latrines) | Inside bathrooms with running water |\n| No playground equipment | Jungle gyms, swings, sports fields |\n| No library or computer room | Libraries, computer labs, science labs |\n\nSome schools in South Africa still do not have good buildings. The government is working to fix this, but it takes time. Every child deserves a safe and comfortable place to learn.'),
  fb(8, 'Long ago, some schools had ___ walls and thatched roofs. Today, most schools are built with ___.',
    ['mud', 'brick'],
    'In the past, many school buildings in South Africa were very simple, made from mud, sticks, and grass. Today, most new schools are built with bricks, concrete, and proper roofing materials.',
    ['Think about what old houses and buildings were made of.']),
  q(9, 'Why did students in Soweto protest in 1976?',
    ['They were forced to learn in Afrikaans and wanted better education', 'They wanted longer school holidays', 'They did not want to wear school uniforms', 'They wanted to play more sport'], 0,
    'In June 1976, thousands of students in Soweto marched to protest against Bantu Education, especially the rule that they had to be taught in Afrikaans — a language many of them did not understand. The police fired on the students, and many young people were killed or injured.',
    ['Think about what was unfair about education during apartheid.']),
  t(10, '## Your School\'s Story\n\nEvery school is special. Your school has its own unique history and story.\n\n### Things That Make Schools Special\n\n- The **year** the school was founded\n- The **people** who started and built the school\n- **Famous** past learners or teachers\n- Important **events** that happened at the school\n- The school\'s **achievements** in sport, academics, or culture\n\n> **Activity:** Work with your teacher to find out when your school was started. See if there are any old photographs of the school. Talk to older people who went to your school and ask them what it was like.\n\nRemember: YOU are part of your school\'s history too! The things you do today will be remembered by future learners.'),
];

// --- Lesson 2: School Rules and Symbols ---
blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Why Do We Have School Rules?\n\nEvery school has **rules**. Rules are important because they help keep everyone safe and make sure that learning can happen.\n\n### Some Common School Rules\n\n- Be on time for school\n- Wear your school uniform neatly\n- Listen when the teacher is speaking\n- Raise your hand before you speak\n- Be kind and respectful to everyone\n- Do not bully or hurt others\n- Keep the school clean — use the dustbin\n- Do your homework\n- Walk, don\'t run, in the corridors\n\n### Why Are Rules Important?\n\n| Without Rules | With Rules |\n|---------------|------------|\n| Everyone talks at the same time | We take turns to speak |\n| Some children get hurt | Everyone is safe |\n| The school is messy and dirty | The school is clean and neat |\n| Nobody learns anything | Everyone can learn |\n| Children are mean to each other | Everyone is treated with respect |'),
  q(2, 'Why do schools have rules?',
    ['To keep everyone safe and make sure learning can happen', 'To make children unhappy', 'Because teachers like making rules', 'To stop children from having fun'], 0,
    'School rules exist to create a safe and fair environment where everyone can learn. Without rules, there would be chaos and nobody would be able to concentrate or feel safe.',
    ['Think about what would happen if there were no rules at school.']),
  t(3, '## How School Rules Have Changed\n\nSchool rules today are very different from school rules long ago.\n\n### Rules Long Ago\n- Children had to stand up when a teacher entered the room\n- Boys and girls were often separated — they could not play together\n- **Corporal punishment** was allowed — teachers could hit children with a cane or ruler\n- Children had to be completely silent in class\n- Left-handed children were sometimes forced to write with their right hand\n\n### Rules Today\n- Corporal punishment is **against the law** in South Africa (banned in 1996)\n- Children have **rights** — the right to be treated with dignity\n- Rules focus on **respect**, not fear\n- Boys and girls learn and play together\n- Children are encouraged to ask questions and participate\n\nThe South African Schools Act says that every child must be treated fairly and with respect. No teacher is allowed to hit a child.'),
  fb(4, 'Corporal punishment was banned in South African schools in ___. Today, school rules focus on ___, not fear.',
    ['1996', 'respect'],
    'The South African Schools Act of 1996 made it illegal for teachers to use corporal punishment (hitting, caning, or any physical punishment). Schools now use other ways to discipline children that respect their dignity.',
    ['Think about the year — it was two years after our first democratic election in 1994.']),
  t(5, '## School Symbols\n\nEvery school has **symbols** that make it special and different from other schools. Symbols help us feel proud of our school and show that we belong.\n\n### Common School Symbols\n\n| Symbol | What It Is |\n|--------|------------|\n| **School badge** | A special picture or design that represents the school |\n| **School colours** | The colours used on the uniform, badge, and sports kit |\n| **School motto** | A short phrase that tells what the school believes in (e.g., "Knowledge is power") |\n| **School song** | A song that the whole school sings at special occasions |\n| **School uniform** | The special clothes that show you belong to the school |\n| **School flag** | Some schools have their own flag |\n\n### Why Do We Have School Symbols?\n\nSchool symbols help us:\n- Feel **proud** of our school\n- Feel like we **belong** to a group\n- Show **respect** for our school\n- Be **recognised** as part of our school community'),
  q(6, 'What is a school motto?',
    ['A short phrase that tells what the school believes in', 'The school\'s address', 'The principal\'s name', 'A type of school uniform'], 0,
    'A motto is a short saying or phrase that captures the values and beliefs of the school. For example, a school might have the motto "Together We Grow" or "Strive for Excellence."',
    ['It is a short saying — like a message about what the school stands for.']),
  t(7, '## The School Uniform\n\nIn South Africa, most schools require children to wear a **school uniform**. This has been a tradition for a very long time.\n\n### Why Do We Wear Uniforms?\n\n- **Equality** — Everyone looks the same, so nobody is teased for their clothes\n- **Identity** — It shows which school you belong to\n- **Pride** — Wearing your uniform neatly shows respect for your school\n- **Safety** — Teachers and other adults can easily identify school children\n\n### How Uniforms Have Changed\n\n- **Long ago:** Boys wore shorts and blazers, girls wore long dresses with pinafores. Uniforms were very strict.\n- **Today:** Uniforms are more comfortable. Many schools allow girls to wear trousers. Some schools have tracksuits for sports days.\n\n### Taking Care of Your Uniform\n\n- Wash it regularly\n- Iron it before school\n- Repair any tears or missing buttons\n- Wear it with pride!'),
  fb(8, 'One reason for wearing a school uniform is ___ — everyone looks the same so nobody is teased. Another reason is ___ — it shows which school you belong to.',
    ['equality', 'identity'],
    'School uniforms help create equality because children are not judged by what they wear. The uniform also gives learners an identity — when you wear your school\'s colours and badge, people know which school you attend.',
    ['Think about why it is good when everyone looks the same at school.']),
  q(9, 'How have school uniforms changed over time?',
    ['They have become more comfortable, and many schools now allow girls to wear trousers', 'They have become more expensive', 'Children do not wear uniforms anymore', 'Uniforms are exactly the same as 100 years ago'], 0,
    'School uniforms have become more comfortable and practical over the years. In the past, uniforms were very strict and formal. Today, many schools offer more options, including allowing girls to wear trousers and having tracksuits for physical education.',
    ['Think about how clothes in general have become more comfortable.']),
  t(10, '## What We Have Learned About Schools\n\n### Key Ideas\n\n- Every school has its own history — when it was built, who started it, and how it has changed\n- Schools have changed a lot over time — from learning under trees to modern classrooms\n- During apartheid, education was unfair. After 1994, all children got the right to go to school\n- School rules keep us safe and help us learn. Corporal punishment is now against the law\n- School symbols (badge, colours, motto, uniform, song) help us feel proud and show we belong\n\n### Remember\n\n- Schools long ago were very different from schools today\n- The Soweto Uprising of 1976 was about fighting for fair education\n- Today, every child has the RIGHT to go to school\n- Your school has a history — and you are part of it!\n\n> Be proud of your school. Follow the rules, wear your uniform with pride, and always try your best.'),
];

// =============================================================================
// CHAPTER 3 (History – Term 2): How We Lived Long Ago
// =============================================================================

// --- Lesson 1: Life Before Electricity and Cars ---
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Life Before Electricity\n\nImagine a world with **no electricity**. No lights, no TV, no fridge, no phone charger! That is how people in South Africa lived for thousands of years — and some people in rural areas still live without electricity today.\n\n### How Did People Manage Without Electricity?\n\n| What We Use Today | What People Used Long Ago |\n|-------------------|-------------------------|\n| Electric lights | **Candles**, oil lamps, and fire |\n| Fridge | Kept food in a **cool place** underground or in a stream |\n| Stove | Cooked on an **open fire** or a wood-burning stove |\n| Washing machine | Washed clothes **by hand** in a river or tub |\n| Iron | Used a **flat iron** heated on the fire |\n| Television | Told **stories** and played games around the fire |\n| Phone | Sent **messages** by word of mouth or with drums |\n\nPeople were very clever at finding ways to do things without electricity. They used the sun, fire, water, and wind to help them.'),
  q(2, 'How did people keep food fresh before there were fridges?',
    ['They kept food in cool places underground or in cold streams', 'They used a microwave', 'They put food in a plastic bag', 'They did not eat any food'], 0,
    'Before fridges, people kept food cool by storing it underground in cellars or in cool streams. They also dried meat to make biltong, salted food, or smoked it so it would last longer without going bad.',
    ['Think about where is naturally cool — under the ground or in cold water.']),
  t(3, '## Old Tools and Objects\n\nPeople long ago used tools and objects that were very different from what we use today. Many of these old objects can be found in museums.\n\n### Everyday Objects from the Past\n\n- **Grinding stone (imbokodo)** — Used to grind mealies into mealie meal for cooking\n- **Three-legged pot (potjie)** — A heavy iron pot used for cooking over a fire\n- **Wooden bucket** — Used to carry water from the river\n- **Oil lamp** — A lamp that burned paraffin or animal fat for light\n- **Hand plough** — Used to dig the soil for planting crops\n- **Broom made of grass** — Used to sweep the floor and yard\n\n### Tools for Special Jobs\n\n| Job | Tool Used |\n|-----|----------|\n| Sewing clothes | **Bone needle** and thread made from animal sinew |\n| Building a house | **Mud**, sticks, grass, and bare hands |\n| Carrying water | **Clay pot** balanced on the head |\n| Hunting | **Spears** and **bow and arrow** |\n| Starting a fire | **Fire sticks** rubbed together quickly |'),
  fb(4, 'The imbokodo is a ___ stone used to grind mealies. A potjie is a heavy ___ pot used for cooking over a fire.',
    ['grinding', 'iron'],
    'The imbokodo (grinding stone) was one of the most important tools in a traditional home. Women used it to grind maize into mealie meal. The potjie (three-legged pot) was perfect for cooking over an open fire and is still used today for potjiekos.',
    ['Think about what you do with maize to make mealie meal.']),
  t(5, '## Old Houses\n\nPeople long ago built their houses from materials they found in nature — mud, sticks, grass, and stones.\n\n### Types of Traditional Houses in South Africa\n\n- **Rondavel** — A round house with mud walls and a grass (thatched) roof. Used by many African communities including Zulu, Xhosa, and Sotho people\n- **Matjieshuise** — Houses made from reed mats by the Khoikhoi people. They could be taken apart and moved\n- **Cape Dutch houses** — Built by Dutch settlers with whitewashed walls and curved gables\n- **Wattle and daub** — A frame of sticks (wattle) filled in with mud (daub)\n\n### How Houses Have Changed\n\n| Houses Long Ago | Houses Today |\n|-----------------|-------------|\n| Mud walls | Brick or concrete walls |\n| Thatched grass roofs | Metal or tile roofs |\n| Small windows (or none) | Big glass windows |\n| Earth floors | Tile or concrete floors |\n| No running water | Taps and bathrooms inside |\n| Heated by fire | Electric heaters and stoves |'),
  q(6, 'What is a rondavel?',
    ['A round house with mud walls and a thatched grass roof', 'A type of car used long ago', 'A big shopping centre', 'A round swimming pool'], 0,
    'A rondavel is a traditional round house found in many parts of southern Africa. It has walls made from mud and a cone-shaped roof made from thatched grass. Rondavels are still built and used today in many rural areas.',
    ['The name sounds like "round" — think about the shape of the house.']),
  t(7, '## Games from the Past\n\nChildren long ago did not have TV, video games, or tablets. But they had lots of fun playing games outside with their friends!\n\n### Traditional South African Games\n\n| Game | How to Play |\n|------|------------|\n| **Diketo (jacks)** | Throw small stones in the air and catch them on the back of your hand |\n| **Morabaraba** | A board game played with stones on a pattern drawn in the sand — like chess! |\n| **Drie stokkies** | A running and hiding game (like tip) played with three sticks |\n| **Kgati (rope skipping)** | Jumping over a long rope while singing songs |\n| **Kennetjie** | A game played with a bat and a short stick — like cricket |\n| **Racing and wrestling** | Boys often competed in running races and friendly wrestling |\n\nMany of these games are still played today! They teach children important skills like counting, strategy, teamwork, and fitness.\n\n> **Fun fact:** Morabaraba is so popular that it is now a recognised sport in South Africa!'),
  fb(8, 'Diketo is a traditional game played with small ___. Morabaraba is a board game played with stones on a pattern drawn in the ___.',
    ['stones', 'sand'],
    'Diketo (also called jacks or magaliesberg) is one of the oldest games in southern Africa. Morabaraba is a strategy game similar to checkers or chess, played on a pattern of lines and circles drawn in the sand or on a board.',
    ['Think about what small things you might find outside to play with.']),
  q(9, 'Why are traditional games important?',
    ['They teach skills like counting, strategy, teamwork, and fitness', 'They cost a lot of money', 'They can only be played indoors', 'They are not important at all'], 0,
    'Traditional games are important because they teach children valuable skills while having fun. They also connect us to our history and culture. Many of these games have been played for hundreds of years.',
    ['Think about what you learn when you play games with friends.']),
  t(10, '## Changes Over Time\n\nLife has changed a lot over time. Some changes happened slowly, and some happened very quickly.\n\n### A Timeline of Big Changes in South Africa\n\n| When | What Changed |\n|------|--------------|\n| **Long, long ago** | People lived in caves, hunted animals, and gathered plants |\n| **Hundreds of years ago** | People built villages, farmed the land, and kept cattle |\n| **About 370 years ago (1652)** | Europeans arrived and started building towns |\n| **About 160 years ago (1860s)** | Diamonds and gold were discovered — cities grew fast |\n| **About 100 years ago** | Cars, trains, and telephones arrived |\n| **About 30 years ago (1994)** | South Africa became a democracy |\n| **Today** | We have computers, smartphones, and the internet |\n\nChange is a normal part of life. Some things change for the better, and sometimes we miss the old ways. The important thing is to remember our past while looking forward to the future.'),
];

// --- Lesson 2: Comparing Past and Present ---
blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Then and Now\n\nLet us compare how people did things long ago with how we do things today.\n\n### Getting Around\n\n| Long Ago | Today |\n|----------|-------|\n| Walking | Cars, buses, taxis, trains |\n| Riding horses or donkeys | Motorbikes and bicycles |\n| Ox wagons | Trucks and delivery vans |\n| Sailing ships | Aeroplanes and cruise ships |\n\nLong ago, a trip from Johannesburg to Cape Town could take **weeks** by ox wagon. Today, you can fly there in about **two hours**!\n\n### Communicating\n\n| Long Ago | Today |\n|----------|-------|\n| Talking face to face | Phone calls and video calls |\n| Sending a letter (took days or weeks) | Email and WhatsApp (instant!) |\n| Drum signals | Radio and television |\n| Smoke signals | Social media and the internet |\n\nThe biggest change has been in **communication**. Today, we can talk to someone on the other side of the world instantly. Long ago, a letter from England to South Africa took months by ship!'),
  q(2, 'How long would a trip from Johannesburg to Cape Town take by ox wagon long ago?',
    ['Weeks', 'Two hours', 'One day', 'Ten minutes'], 0,
    'By ox wagon, the journey from Johannesburg to Cape Town took several weeks because oxen walk slowly and the roads were rough dirt tracks. Today, the same trip takes about two hours by aeroplane or about 14 hours by car.',
    ['Oxen are big, slow animals that pull heavy wagons.']),
  t(3, '## How Shopping Has Changed\n\nThe way people get their food and other things they need has changed a lot.\n\n### Long Ago\n- People grew their own vegetables and kept their own chickens and cows\n- They made their own clothes, soap, and candles\n- They **traded** with neighbours — swapping things they had for things they needed\n- Small **trading stores** sold basic items like sugar, salt, fabric, and paraffin\n- There was no money at first — people used **barter** (swapping goods)\n\n### Today\n- We buy most things from **supermarkets** and **shopping centres**\n- Food comes from farms all over South Africa and even other countries\n- We can buy things on the **internet** and have them delivered\n- We pay with **money**, bank cards, or even our phones\n\n### Fun Comparison\n\n| Item | Long Ago | Today |\n|------|----------|-------|\n| Bread | Baked at home in a fire | Bought from a bakery or shop |\n| Milk | From the family cow | From a carton in the fridge |\n| Clothes | Sewn by hand at home | Bought from a shop or online |\n| Toys | Made from sticks, wire, and clay | Bought from a toy shop |'),
  fb(4, 'Long ago, people swapped goods with each other — this was called ___. Today, most people buy food from ___.',
    ['barter', 'supermarkets'],
    'Barter is the oldest form of trade — people exchanged things they had for things they needed, without using money. Today, supermarkets and shops are where most people buy their food and household items.',
    ['Think about a word for swapping things without using money.']),
  t(5, '## How Clothes Have Changed\n\nThe clothes people wear have changed a lot over time.\n\n### Traditional Clothes in South Africa\n\nDifferent cultures in South Africa have their own traditional clothing:\n\n- **Zulu:** Animal skins, beaded jewellery, isicholo (married women\'s hat)\n- **Xhosa:** Red-dyed blankets, beadwork, white face paint for ceremonies\n- **Ndebele:** Bright beaded necklaces, leg rings, and colourful blankets\n- **Sotho/Tswana:** Seshoeshoe fabric dresses and blankets\n- **Afrikaans:** Kappie (sun bonnet) and long dresses for women, suits for men\n\n### Everyday Clothes — Then and Now\n\n| Long Ago | Today |\n|----------|-------|\n| Made from animal skins and hand-woven fabric | Made in factories from cotton, polyester, and other materials |\n| Sewn by hand | Made by machines |\n| Very few outfits — maybe one or two | Many outfits in the wardrobe |\n| Mended and patched many times | Often thrown away and replaced |\n\nToday, many South Africans still wear traditional clothing for special occasions like weddings, funerals, and cultural ceremonies.'),
  q(6, 'What kind of clothing are the Ndebele people famous for?',
    ['Bright beaded necklaces, leg rings, and colourful blankets', 'Animal skin jackets', 'Red-dyed blankets', 'Top hats and bow ties'], 0,
    'The Ndebele people are world-famous for their beautiful beadwork. Women wear colourful beaded necklaces, arm and leg rings, and blankets. The bright geometric patterns are a key part of Ndebele culture.',
    ['Think about the Ndebele people — they are known for very colourful decorations.']),
  t(7, '## How Entertainment Has Changed\n\nWhat people do for fun has changed a lot!\n\n### Entertainment Long Ago\n- **Storytelling** around the fire in the evening\n- **Singing and dancing** at gatherings and celebrations\n- **Playing games** outside with friends (diketo, morabaraba, kgati)\n- **Making music** with drums, marimbas, and hand-made instruments\n- **Listening to the radio** (when it became available)\n\n### Entertainment Today\n- Watching **television** and streaming movies\n- Playing **video games** on phones, tablets, and consoles\n- Listening to **music** on phones and speakers\n- Using **social media** like TikTok, YouTube, and Instagram\n- Still singing, dancing, and playing outside!\n\n### What Stayed the Same?\n\nSome things have not changed:\n- People still love **music and dancing**\n- People still enjoy **stories** (now in books, movies, and TV shows)\n- People still play **games** (now also on screens)\n- People still **gather together** for celebrations'),
  fb(8, 'Long ago, people told ___ around the fire for entertainment. Today, many people watch ___ and stream movies for fun.',
    ['stories', 'television'],
    'Storytelling was one of the most important forms of entertainment long ago. Elders would share folktales, legends, and histories around the fire. Today, television, streaming services, and social media are popular, but storytelling is still alive in many communities.',
    ['Think about what people did around the fire at night.']),
  q(9, 'Which form of entertainment has stayed the same from long ago to today?',
    ['Singing and dancing', 'Playing video games', 'Watching YouTube', 'Using a smartphone'], 0,
    'Singing and dancing have been part of human life for thousands of years. While we now have many new forms of entertainment like video games and social media, people still love to sing and dance — at parties, ceremonies, concerts, and at home.',
    ['Think about what people have always done to celebrate and have fun together.']),
  t(10, '## Why We Study the Past\n\nLearning about how people lived long ago helps us in many ways:\n\n### Reasons to Study the Past\n\n1. **Appreciate what we have** — When you know people used to walk for days to get somewhere, you appreciate having a car or bus\n2. **Learn from mistakes** — Knowing about unfair things like apartheid helps us make sure they never happen again\n3. **Understand our culture** — Traditional food, clothes, games, and stories connect us to our ancestors\n4. **Solve problems** — Old ways of doing things can teach us new solutions (like traditional medicine and indigenous crops)\n5. **Feel connected** — Knowing your family and community\'s history makes you feel part of something bigger\n\n### Remember\n\n- Life has changed enormously, but some important things have stayed the same\n- People have always loved their families, told stories, played games, and helped each other\n- We should be proud of our past and excited about the future\n- Every day, YOU are making history!\n\n> The past is not gone — it lives on in our traditions, our languages, our food, and our stories.'),
];

// =============================================================================
// CHAPTER 4 (History – Term 2): Important People in Our Past
// =============================================================================

// --- Lesson 1: Nelson Mandela and Freedom ---
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Nelson Mandela — Father of Our Nation\n\nNelson Mandela is the most famous South African who ever lived. He spent his life fighting for **freedom and equality** for all South Africans.\n\n### Mandela\'s Life\n\n| Date | What Happened |\n|------|---------------|\n| **18 July 1918** | Born in Mvezo, Eastern Cape. His Xhosa name was **Rolihlahla**, meaning "troublemaker" |\n| **1944** | Joined the ANC (African National Congress) to fight against unfair laws |\n| **1962** | Arrested and put in prison for fighting against apartheid |\n| **1964–1990** | Spent **27 years** in prison, mostly on Robben Island |\n| **11 February 1990** | Released from prison — the whole world watched and celebrated |\n| **1994** | Became South Africa\'s **first Black president** in the first democratic election |\n| **5 December 2013** | Passed away at age 95 |\n\nMandela is loved around the world because he chose **forgiveness** instead of revenge. After spending 27 years in prison, he did not want to punish the people who put him there. Instead, he wanted all South Africans to live together in peace.'),
  q(2, 'How many years did Nelson Mandela spend in prison?',
    ['27 years', '10 years', '5 years', '50 years'], 0,
    'Nelson Mandela was imprisoned for 27 years — from 1964 to 1990. Most of this time was spent on Robben Island, near Cape Town. Despite this, he came out of prison without bitterness and worked to unite all South Africans.',
    ['Think of a number close to 30.']),
  t(3, '## Why Was Mandela in Prison?\n\nDuring **apartheid**, the South African government made unfair laws that separated people by the colour of their skin.\n\n### Apartheid Laws\n- Black people could not vote\n- Black people could not live where they wanted\n- Black people had to carry a **pass book** (dompas) everywhere\n- Schools, hospitals, beaches, and buses were separated by race\n- Black people were forced to live in **townships** and **homelands**\n\nNelson Mandela and many other brave South Africans said: **"This is wrong! All people are equal!"**\n\nMandela helped organise protests and marches against these unfair laws. The government called him a criminal and put him in prison. But millions of people around the world knew that Mandela was right.\n\n### Robben Island\n\nMandela spent most of his time in prison on **Robben Island**, a small island in the cold Atlantic Ocean near Cape Town. He was given:\n- A tiny cell with only a thin mat to sleep on\n- Hard labour — breaking rocks in a lime quarry\n- Very little food\n\nBut Mandela never gave up hope. He studied, read books, and even helped other prisoners get educated.'),
  fb(4, 'During apartheid, Black people had to carry a ___ book everywhere they went. Mandela spent most of his prison time on ___ Island.',
    ['pass', 'Robben'],
    'The pass book (also called a dompas) was one of the most hated symbols of apartheid. Black South Africans had to carry it at all times and show it to police. Robben Island, off the coast of Cape Town, held many political prisoners including Nelson Mandela.',
    ['Think about a small book people had to carry. Think about an island near Cape Town.']),
  t(5, '## Freedom Day — 27 April\n\nOn **27 April 1994**, something amazing happened: **all South Africans** voted in an election for the very first time. It did not matter what colour your skin was — everyone was equal.\n\n### What Happened on That Day\n\n- People queued for **hours** to vote — some waited the whole day\n- Many people were crying with joy — they had waited their whole lives for this moment\n- Old people who had never voted before were especially emotional\n- Nelson Mandela voted for the first time in his life, at age 75\n- The ANC won the election, and Mandela became president\n\n### Why We Celebrate Freedom Day\n\nEvery year on **27 April**, we celebrate **Freedom Day** to remember:\n- The day all South Africans became truly free and equal\n- The sacrifice of people who fought for freedom\n- That democracy is precious and must be protected\n\n> **Mandela said:** "For to be free is not merely to cast off one\'s chains, but to live in a way that respects and enhances the freedom of others."'),
  q(6, 'When is Freedom Day celebrated in South Africa?',
    ['27 April', '16 June', '24 September', '25 December'], 0,
    'Freedom Day is on 27 April every year. It marks the day in 1994 when all South Africans voted in the first democratic election. It is one of the most important public holidays in South Africa.',
    ['Think about what month comes after March.']),
  t(7, '## Other People Who Fought for Freedom\n\nNelson Mandela was not alone. Many brave men and women fought against apartheid.\n\n### Heroes of the Struggle\n\n| Person | What They Did |\n|--------|---------------|\n| **Albertina Sisulu** | Called the "Mother of the Nation" — she never stopped fighting for justice, even when her husband Walter was in prison |\n| **Desmond Tutu** | Archbishop who won the Nobel Peace Prize for fighting apartheid peacefully |\n| **Oliver Tambo** | Led the ANC from outside South Africa while Mandela was in prison |\n| **Winnie Madikizela-Mandela** | Kept the struggle alive while her husband was in prison, despite being banned and arrested herself |\n| **Helen Suzman** | A white Member of Parliament who spoke out against apartheid in government for 36 years |\n| **Steve Biko** | A young leader of the Black Consciousness Movement who believed in Black pride. He was killed by police in 1977 |\n\nThese people, and thousands of ordinary South Africans, made sacrifices so that all of us could be free today.'),
  fb(8, 'Archbishop Desmond Tutu won the Nobel ___ Prize. Steve Biko was a leader of the Black ___ Movement.',
    ['Peace', 'Consciousness'],
    'Desmond Tutu received the Nobel Peace Prize in 1984 for his non-violent efforts to end apartheid. Steve Biko founded the Black Consciousness Movement, which encouraged Black South Africans to be proud of their identity and culture.',
    ['Think about the prize for people who work for peace. Think about a word that means being aware of who you are.']),
  q(9, 'Who was called the "Mother of the Nation"?',
    ['Albertina Sisulu', 'Winnie Madikizela-Mandela', 'Helen Suzman', 'Desmond Tutu'], 0,
    'Albertina Sisulu was known as the "Mother of the Nation" because of her tireless work fighting for justice and freedom. She continued the struggle even when her husband, Walter Sisulu, was imprisoned on Robben Island alongside Mandela.',
    ['Her surname starts with S.']),
  t(10, '## What Mandela Taught Us\n\nNelson Mandela taught us many important lessons:\n\n1. **Forgiveness** — Even after 27 years in prison, Mandela chose to forgive\n2. **Equality** — All people deserve to be treated the same, no matter their skin colour\n3. **Education** — Mandela said: "Education is the most powerful weapon which you can use to change the world"\n4. **Hope** — Never give up, even when things seem impossible\n5. **Unity** — We are stronger when we work together\n\n### Mandela Day — 18 July\n\nEvery year on **18 July** (Mandela\'s birthday), South Africans celebrate **Mandela Day**. On this day, people spend at least **67 minutes** helping others — one minute for each year Mandela spent serving South Africa.\n\n> **Think about it:** What can YOU do for 67 minutes to help someone else? You could clean your school, help an elderly neighbour, or donate clothes to someone in need.\n\nNelson Mandela showed that one person CAN change the world. And you can too!'),
];

// --- Lesson 2: Heroes in Our Community ---
blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Heroes Are Everywhere\n\nWhen we think of heroes, we often think of famous people like Nelson Mandela. But heroes are everywhere — in our families, schools, and communities.\n\n### What Makes Someone a Hero?\n\nA hero is someone who:\n- Helps other people, even when it is difficult\n- Stands up for what is right\n- Is brave in the face of danger or trouble\n- Makes sacrifices for others\n- Sets a good example\n\n### Everyday Heroes\n\n| Hero | Why They Are Heroes |\n|------|--------------------|\n| **Parents and grandparents** | They work hard to give us food, a home, and love |\n| **Teachers** | They teach us and help us grow, even when it is tough |\n| **Nurses and doctors** | They take care of us when we are sick, sometimes working all day and night |\n| **Firefighters** | They risk their lives to save people from fires |\n| **Police officers** | They keep our communities safe |\n| **Community workers** | They help people who are hungry, sick, or in trouble |\n\nYou do not need to be famous to be a hero. Ordinary people do heroic things every single day.'),
  q(2, 'What makes someone a hero?',
    ['They help other people, stand up for what is right, and make sacrifices', 'They are very tall and strong', 'They have a lot of money', 'They are on television'], 0,
    'A hero is someone who helps others, especially when it is hard or dangerous to do so. Heroes can be anyone — your mom, your teacher, a firefighter, or even a friend who stands up to a bully.',
    ['Think about the things a person does that make them special.']),
  t(3, '## People Who Made South Africa Better\n\nMany people have worked hard to make South Africa a better place for everyone. Let us learn about a few more of them.\n\n### Nkosi Johnson (1989–2001)\n\nNkosi Johnson was a brave boy from Johannesburg who was born with **HIV/AIDS**. At a time when many people were afraid of the disease, Nkosi spoke out:\n- He fought for the right of children with HIV to go to school\n- At just **11 years old**, he gave a famous speech at an AIDS conference, saying: *"Care for us and accept us. We are all human beings."*\n- He started **Nkosi\'s Haven**, a home for mothers and children with HIV\n- He sadly passed away at age 12, but his bravery changed how South Africa treats people with HIV\n\n### Mama Albertina Sisulu (1918–2011)\n\nAlbertina Sisulu was a nurse who spent her whole life fighting for justice:\n- She helped sick people in Soweto for many years\n- She was banned, arrested, and watched by police, but never gave up\n- She believed in education and made sure children could learn\n- She showed that women are powerful leaders'),
  fb(4, 'Nkosi Johnson was born with ___ and fought for the rights of children with the disease. He gave his famous speech when he was just ___ years old.',
    ['HIV', '11'],
    'Nkosi Johnson was one of the bravest young South Africans in history. Despite being very sick, he spoke up for other children with HIV/AIDS and helped change how people thought about the disease. He was only 11 when he addressed thousands of people at an international conference.',
    ['Think about a disease that affects many people in South Africa. Think about a young age.']),
  t(5, '## More South African Heroes\n\n### Mahatma Gandhi (1869–1948)\n\nGandhi came from India to South Africa as a young lawyer. In South Africa, he experienced racism and decided to fight against it:\n- He lived in South Africa for **21 years** (1893–1914)\n- He developed the idea of **peaceful protest** — fighting injustice without violence\n- He was thrown off a train in Pietermaritzburg because he was not white — this changed his life\n- Later, he returned to India and led India to independence using the same peaceful methods\n\nGandhi showed that you can fight for justice **without violence**.\n\n### Miriam Makeba (1932–2008)\n\nMiriam Makeba, known as **"Mama Africa"**, was a famous singer from Johannesburg:\n- She used her beautiful voice to tell the world about apartheid\n- She was **banned** from South Africa for 31 years for speaking out\n- Her most famous song was **"Pata Pata"**\n- She showed that music can be a powerful weapon against injustice'),
  q(6, 'What idea did Mahatma Gandhi develop while living in South Africa?',
    ['Peaceful protest — fighting injustice without violence', 'Building more railways', 'Teaching children to cook', 'Opening a shop in Durban'], 0,
    'While living in South Africa, Gandhi developed the idea of satyagraha — peaceful resistance or non-violent protest. He believed that you could fight injustice through peaceful means like marches, boycotts, and refusing to obey unfair laws.',
    ['Think about fighting for what is right, but without hurting anyone.']),
  t(7, '## Heroes in Our Schools and Communities\n\nHeroes are not only famous people from history books. There are heroes in your school and community right now.\n\n### School Heroes\n\n- The **teacher** who stays late to help a struggling learner\n- The **learner** who stands up to a bully and protects a smaller child\n- The **cleaning staff** who keep the school clean every day\n- The **school feeding scheme workers** who make sure hungry children get a meal\n\n### Community Heroes\n\n- The **gogos (grandmothers)** who raise their grandchildren when parents cannot\n- The **street committee** members who keep the neighbourhood safe\n- The **volunteers** who clean up parks and streets\n- The **coach** who teaches children sport for free on weekends\n- The **social workers** who help families in trouble\n\n### Being a Hero Yourself\n\nYou can be a hero too! Here is how:\n- Help someone who is being bullied\n- Pick up litter, even if it is not yours\n- Be kind to someone who is sad or lonely\n- Share what you have with someone who has less\n- Work hard at school — education is your superpower'),
  fb(8, 'School ___ scheme workers make sure hungry children get a meal. Many ___ raise their grandchildren when parents cannot.',
    ['feeding', 'gogos'],
    'The National School Nutrition Programme provides meals to millions of children in South African schools every day. Many grandmothers (gogos) in South Africa take on the role of raising their grandchildren, showing incredible love and sacrifice.',
    ['Think about the programme at school that gives food to children.']),
  q(9, 'Which of these is an example of being a hero in your community?',
    ['Helping someone who is being bullied and picking up litter', 'Only thinking about yourself', 'Making fun of other children', 'Breaking the school rules'], 0,
    'You do not need special powers to be a hero. Simple acts of kindness — like helping someone being bullied, picking up litter, or being friendly to someone who is lonely — make you a hero in your community.',
    ['Think about kind things you can do for other people.']),
  t(10, '## What We Have Learned About Important People\n\n### Key Ideas\n\n- **Nelson Mandela** spent 27 years in prison and became our first democratic president. He taught us forgiveness and equality.\n- **Freedom Day (27 April)** celebrates the day all South Africans could vote for the first time in 1994\n- Many brave people fought against apartheid: Albertina Sisulu, Desmond Tutu, Oliver Tambo, Steve Biko, and many more\n- **Nkosi Johnson** was a brave boy who fought for the rights of children with HIV\n- **Mahatma Gandhi** developed peaceful protest while living in South Africa\n- **Miriam Makeba** used music to fight against apartheid\n- Heroes are everywhere — in our families, schools, and communities\n- YOU can be a hero by being kind, brave, and helpful\n\n### Important Dates to Remember\n\n| Date | What We Celebrate |\n|------|-------------------|\n| **21 March** | Human Rights Day |\n| **27 April** | Freedom Day |\n| **16 June** | Youth Day |\n| **18 July** | Mandela Day |\n| **24 September** | Heritage Day |\n\n> **Remember:** "It always seems impossible until it is done." — Nelson Mandela'),
];

// =============================================================================
// CHAPTER 5 (Geography – Term 3): Where I Live
// =============================================================================

// --- Lesson 1: My Home and Neighbourhood ---
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## My Home\n\nEveryone needs a place to live. Your home is the place where you sleep, eat, play, and spend time with your family. Homes can look very different from one another.\n\n### Parts of a Home\n\nMost homes have these parts:\n- **Rooms** — bedrooms for sleeping, a kitchen for cooking, a living room for sitting together\n- **A roof** — to protect us from rain and sun\n- **Walls** — to keep us safe and warm\n- **A door** — to go in and out, and to keep the home secure\n- **Windows** — to let in light and fresh air\n\n### Why Do We Need Homes?\n\nOur homes protect us from:\n- **Rain and storms** — we stay dry inside\n- **Hot sun** — we have shade\n- **Cold weather** — we keep warm\n- **Danger** — we are safe inside\n\nA home is also a place where we feel **loved and happy**. It is where our family is.'),
  q(2, 'Why do we need a home?',
    ['To protect us from rain, sun, cold, and danger, and to be with our family', 'Only to store our toys', 'Because the government says we must have one', 'To show off to our friends'], 0,
    'A home gives us shelter from the weather and keeps us safe. But it is also much more than that — it is where our family lives, where we feel loved, and where we belong.',
    ['Think about what your home protects you from every day.']),
  t(3, '## Types of Homes in South Africa\n\nSouth Africa has many different types of homes because our country has people with different cultures, incomes, and needs.\n\n| Type of Home | Description |\n|-------------|-------------|\n| **House** | A building with rooms, a garden, and often a garage. Found in suburbs and towns |\n| **Flat (apartment)** | A home in a tall building with many other homes. Common in cities like Johannesburg and Cape Town |\n| **Rondavel** | A traditional round house with mud walls and a thatched roof. Found in rural areas |\n| **Townhouse** | A house that shares walls with the house next to it |\n| **Shack** | A home built from corrugated iron, wood, and other materials. Found in informal settlements |\n| **RDP house** | A small house built by the government for people who need homes |\n| **Farm house** | A house on a farm, often surrounded by fields and animals |\n\nEvery type of home is someone\'s special place. We must **respect** all homes and never judge people by where they live.'),
  fb(4, 'A ___ is a traditional round house with mud walls and a thatched roof. An ___ house is a small house built by the government for people who need homes.',
    ['rondavel', 'RDP'],
    'Rondavels have been built in southern Africa for hundreds of years. They are cool in summer and warm in winter because of their thick mud walls. RDP houses are part of the government\'s Reconstruction and Development Programme to provide housing for people who need it.',
    ['Think about the round traditional house. Think about the programme the government uses to build houses.']),
  t(5, '## My Neighbourhood\n\nA **neighbourhood** is the area around your home. It includes the streets, buildings, and people near where you live.\n\n### Things You Might Find in a Neighbourhood\n\n| Place | What Happens There |\n|-------|-------------------|\n| **School** | Where children learn |\n| **Shop or spaza** | Where people buy food and supplies |\n| **Church, mosque, or temple** | Where people worship |\n| **Clinic** | Where people go when they are sick |\n| **Park or playground** | Where people relax and children play |\n| **Library** | Where people borrow books |\n| **Police station** | Where police officers keep the community safe |\n| **Community hall** | Where people meet for events |\n\n### Different Types of Neighbourhoods\n\n- **Urban (city/town)** — Many buildings close together, busy streets, shops, and services nearby\n- **Suburban** — Quieter areas with houses and gardens, usually near a city\n- **Rural (countryside)** — Open spaces, farms, and villages. Fewer services nearby\n- **Township** — Communities that were created during apartheid. Often near cities. Very busy and vibrant, but sometimes with fewer services'),
  q(6, 'What is a neighbourhood?',
    ['The area around your home, including streets, buildings, and people nearby', 'A very large country', 'The inside of your house', 'A place very far from your home'], 0,
    'A neighbourhood is the local area surrounding your home. It includes the streets you walk on, the shops you visit, the school you attend, and the people who live near you.',
    ['Think about what is right around where you live.']),
  t(7, '## Finding My Way\n\nIt is important to know your way around your neighbourhood so you can get to school, to the shops, and back home safely.\n\n### Your Address\n\nYour **address** is the exact place where your home is. It usually includes:\n- Your **house number** or stand number\n- Your **street name**\n- Your **suburb or township** name\n- Your **city or town**\n- Your **province**\n\nFor example: *15 Protea Street, Soweto, Johannesburg, Gauteng*\n\n### Why Is Your Address Important?\n\n- The **post office** needs it to deliver letters\n- **Emergency services** need it to find you if you call for help\n- **Friends** need it to visit you\n- **Delivery services** need it to bring packages\n\n> **Important:** You should know your home address by heart. Ask a parent or guardian to help you learn it.'),
  fb(8, 'Your ___ is the exact place where your home is. Emergency ___ need your address to find you if you call for help.',
    ['address', 'services'],
    'Your address is like your home\'s name — it tells people exactly where to find you. Emergency services like ambulances, fire engines, and police need your address to help you quickly in an emergency.',
    ['Think about what you tell someone so they can find your house.']),
  q(9, 'Why is it important to know your home address?',
    ['So that emergency services, the post office, and friends can find your home', 'So you can tell it to strangers', 'Because your teacher will test you on it', 'It is not important at all'], 0,
    'Knowing your address is very important for your safety. If there is an emergency and you need to call for help, you must be able to tell the ambulance or police exactly where you live so they can get to you quickly.',
    ['Think about what would happen if you needed help but could not tell anyone where you live.']),
  t(10, '## Taking Care of My Neighbourhood\n\nA good neighbourhood is one where people take care of their surroundings and look after each other.\n\n### Things We Can Do\n\n| Action | Why It Helps |\n|--------|-------------|\n| Pick up litter | Keeps streets clean and prevents blocked drains |\n| Plant trees and flowers | Makes the neighbourhood beautiful and provides shade |\n| Report broken streetlights | Keeps streets safe at night |\n| Greet your neighbours | Builds a friendly, caring community |\n| Watch out for each other | Keeps everyone safe |\n| Do not vandalise | Keeps buildings and parks in good condition |\n\n### Ubuntu in Our Neighbourhood\n\nRemember ubuntu — "I am because we are." When we take care of our neighbourhood, we take care of each other. A clean, safe, and friendly neighbourhood makes everyone happy.\n\n> **Activity:** Walk around your neighbourhood with a parent or guardian. Draw a simple map showing your home, your school, the nearest shop, and one other important place. Use arrows to show which way you walk to school.'),
];

// --- Lesson 2: Types of Homes and Finding My Way ---
blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Why Homes Look Different\n\nHomes in South Africa look different in different places. This is because of:\n\n### Climate (Weather)\n- In **hot areas** (like Limpopo), homes have big windows and open spaces to let in cool air\n- In **cold areas** (like the Drakensberg mountains), homes have thick walls and small windows to keep warmth in\n- In **rainy areas** (like KwaZulu-Natal), homes have steep roofs so rain slides off easily\n- In **dry areas** (like the Karoo), homes are built to keep cool with thick walls\n\n### Building Materials Available\n- In rural areas, people use **mud, sticks, and thatch** because these materials are found nearby\n- In cities, people use **bricks, cement, steel, and glass** from factories\n- In informal settlements, people use **corrugated iron, wood, and plastic** — whatever they can find\n\n### How Much Money the Family Has\n- Wealthy families can afford big houses with many rooms\n- Some families live in small RDP houses or shacks\n- Many families share their home with extended family members\n\nRemember: A home is not about how big or fancy it is. A home is about the **love** inside it.'),
  q(2, 'Why do homes in hot areas often have big windows?',
    ['To let in cool air and keep the home comfortable', 'Because big windows are cheaper', 'To see the neighbours', 'Because there is no glass in hot areas'], 0,
    'In hot parts of South Africa, homes are designed to stay cool. Big windows and open spaces allow air to flow through the home, which helps cool it down naturally. This is a clever way of dealing with the heat without needing an electric fan or air conditioner.',
    ['Think about what happens when you open a window on a hot day.']),
  t(3, '## Homes in Different Parts of South Africa\n\nLet us take a tour of homes across South Africa:\n\n### Cape Town (Western Cape)\n- Many **colourful houses** in the Bo-Kaap neighbourhood, painted bright pink, green, blue, and yellow by the Cape Malay community\n- **Flats** in the city centre for people who work nearby\n- Big houses in suburbs like Constantia\n- Informal settlements like Khayelitsha\n\n### Durban (KwaZulu-Natal)\n- **Beehive-shaped** traditional Zulu homes called **indlu** made from grass and woven sticks\n- Beach houses and flats along the coast\n- Township houses in areas like Umlazi\n\n### Johannesburg (Gauteng)\n- Old mine houses in areas like Fordsburg\n- Big houses and estates in Sandton\n- Township matchbox houses in Soweto (built during apartheid, all looking the same)\n- Modern townhouses and apartments\n\n### Rural Limpopo\n- Traditional **rondavels** made from mud and thatch\n- Small brick houses\n- Homes often surrounded by fields and animals'),
  fb(4, 'The colourful houses in Bo-Kaap, Cape Town, were painted by the Cape ___ community. Traditional Zulu homes called ___ are beehive-shaped.',
    ['Malay', 'indlu'],
    'The Bo-Kaap neighbourhood in Cape Town is famous for its brightly painted houses. The Cape Malay community painted them in vibrant colours as a celebration of freedom after apartheid. The indlu is a traditional Zulu dwelling made from a woven frame of sticks covered with grass.',
    ['Think about the Muslim community in Cape Town. Think about the Zulu name for their traditional home.']),
  t(5, '## Directions — Left, Right, Near, and Far\n\nTo find your way around, you need to know about **directions**.\n\n### Basic Directions\n\n- **Left** — the side of your body where your heart is\n- **Right** — the other side\n- **Forward (straight)** — the direction you are facing\n- **Behind (back)** — the opposite of forward\n- **Near** — close to you\n- **Far** — a long way from you\n\n### Giving Directions\n\nWhen someone asks you how to get somewhere, you can give directions like this:\n\n> "Walk straight along Mandela Road. Turn **left** at the big tree. The school is on your **right**, next to the church."\n\n### Using Landmarks\n\nA **landmark** is something big or special that helps you find your way. Examples:\n- A big tree\n- A church or mosque\n- A shop or petrol station\n- A school or hospital\n- A bridge or river\n\n> **Activity:** Give directions from your classroom to the school office. Use words like left, right, straight, next to, and past.'),
  q(6, 'What is a landmark?',
    ['Something big or special that helps you find your way', 'A type of house', 'A person who gives directions', 'A road sign'], 0,
    'A landmark is a feature that is easy to see and recognise, like a big tree, a church, or a shop. Landmarks help us describe where places are and give directions to other people.',
    ['Think about something you can see from far away that helps you know where you are.']),
  t(7, '## Simple Maps\n\nA **map** is a drawing that shows us what a place looks like from above — like a bird flying over and looking down.\n\n### What Maps Show\n\n- **Roads and streets** — drawn as lines\n- **Buildings** — drawn as squares or rectangles\n- **Parks and fields** — drawn as green areas\n- **Rivers and dams** — drawn as blue lines or shapes\n\n### Drawing a Simple Map of Your Street\n\n1. Start by drawing your **street** as a long line across the page\n2. Draw your **home** on the correct side of the street\n3. Add your **neighbours\' homes** next to yours\n4. Draw important places like the **shop**, **school**, or **park**\n5. Add a **title** at the top (e.g., "My Street")\n6. Add **labels** to show what each building is\n\n### Map Key (Legend)\n\nA map key tells you what the symbols on the map mean:\n\n| Symbol | Meaning |\n|--------|---------|\n| 🏠 | House |\n| 🏫 | School |\n| 🏪 | Shop |\n| 🌳 | Tree or park |\n| ⛪ | Church |'),
  fb(8, 'A ___ is a drawing that shows what a place looks like from above. The map ___ tells you what the symbols on a map mean.',
    ['map', 'key'],
    'A map is like a bird\'s eye view of a place — it shows us the layout from above. The map key (also called a legend) explains what each symbol or colour on the map represents.',
    ['Think about a drawing of your neighbourhood from above. Think about what explains the symbols.']),
  q(9, 'When drawing a simple map, what should you draw first?',
    ['The street as a long line across the page', 'The sky and clouds', 'Your favourite toy', 'A picture of yourself'], 0,
    'When drawing a simple map of your street, start with the main feature — the street itself. Draw it as a line across your page. Then add buildings, your home, and other landmarks on the correct sides of the street.',
    ['Think about what is the most important thing on a street map.']),
  t(10, '## Staying Safe in My Neighbourhood\n\nKnowing your way around your neighbourhood helps keep you safe. Here are some important safety tips:\n\n### Safety Tips\n\n| Tip | Why It Matters |\n|-----|---------------|\n| Always walk with a friend or adult | You are safer in a group |\n| Know your home address and phone number | You can call for help if needed |\n| Use pedestrian crossings to cross the road | Cars will stop for you |\n| Do not talk to strangers | Not everyone has good intentions |\n| Tell a trusted adult if you feel unsafe | They can help you |\n| Avoid dark or empty streets | Walk on busy, well-lit roads |\n\n### Emergency Numbers in South Africa\n\n| Service | Number |\n|---------|--------|\n| **Police** | 10111 |\n| **Ambulance** | 10177 |\n| **Fire** | (local number varies) |\n| **ChildLine** | 116 |\n\n> **Important:** Learn these numbers! If you are ever in danger, call one of these numbers from any phone — even without airtime.\n\nYour neighbourhood is your community. Know it, love it, and help take care of it.'),
];

// =============================================================================
// CHAPTER 6 (Geography – Term 3): My Country South Africa
// =============================================================================

// --- Lesson 1: South Africa on the Map ---
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## South Africa — Our Beautiful Country\n\nSouth Africa is a country at the very bottom of the African continent. It is surrounded by water on three sides and shares borders with six countries.\n\n### Where Is South Africa?\n\n- South Africa is on the **southern tip** of Africa\n- The **Atlantic Ocean** is on the west coast\n- The **Indian Ocean** is on the east and south coast\n- The two oceans meet near **Cape Agulhas** — the most southern point of Africa\n\n### Our Neighbouring Countries\n\n| Country | Where It Is |\n|---------|-------------|\n| **Namibia** | To the north-west |\n| **Botswana** | To the north |\n| **Zimbabwe** | To the north-east |\n| **Mozambique** | To the east |\n| **Eswatini (Swaziland)** | A small country inside our eastern border |\n| **Lesotho** | A small country completely surrounded by South Africa! |\n\n> **Fun fact:** Lesotho is one of only a few countries in the world that is completely inside another country!'),
  q(2, 'Which two oceans surround South Africa?',
    ['The Atlantic Ocean and the Indian Ocean', 'The Pacific Ocean and the Arctic Ocean', 'The Indian Ocean and the Pacific Ocean', 'The Atlantic Ocean and the Arctic Ocean'], 0,
    'South Africa has the Atlantic Ocean on its west coast and the Indian Ocean on its east and south coast. The two oceans meet near Cape Agulhas, the southernmost point of Africa.',
    ['One is named after India, and the other after the lost city of Atlantis.']),
  t(3, '## The Nine Provinces\n\nSouth Africa is divided into **nine provinces**. Each province has its own capital city and special features.\n\n| Province | Capital City | Something Special |\n|----------|-------------|-------------------|\n| **Gauteng** | Johannesburg | Smallest province, but most people live here |\n| **Western Cape** | Cape Town | Table Mountain and the oldest city |\n| **Eastern Cape** | Bhisho | Where Nelson Mandela was born |\n| **KwaZulu-Natal** | Pietermaritzburg | Beautiful beaches and the Drakensberg |\n| **Free State** | Bloemfontein | Wide open farmlands |\n| **Limpopo** | Polokwane | The Kruger National Park |\n| **Mpumalanga** | Mbombela | Blyde River Canyon and God\'s Window |\n| **North West** | Mahikeng | Sun City and platinum mines |\n| **Northern Cape** | Kimberley | Biggest province, diamonds, and the Kalahari |\n\n### Three Capital Cities!\n\nSouth Africa is special because it has **three** capital cities:\n- **Pretoria** — where the President works\n- **Cape Town** — where Parliament meets\n- **Bloemfontein** — where the highest court is'),
  fb(4, 'South Africa has ___ provinces. The biggest province by size is the ___ Cape.',
    ['nine', 'Northern'],
    'South Africa has nine provinces, which were created when we became a democracy in 1994. The Northern Cape is the largest province by area — it is nearly as big as Germany! — but it has the fewest people.',
    ['Count the provinces in the table. Which Cape province is the biggest?']),
  t(5, '## The South African Flag\n\nOur flag is one of the most colourful flags in the world! It was designed for the **new South Africa** in 1994 and has **six colours**.\n\n### The Colours of Our Flag\n\n| Colour | What It Represents |\n|--------|-------------------|\n| **Black** | The Black people of South Africa |\n| **White** | The White people of South Africa |\n| **Green** | The land and farming |\n| **Gold/Yellow** | The mineral wealth (gold and diamonds) |\n| **Red** | The blood shed during the struggle for freedom |\n| **Blue** | The sky and the oceans around South Africa |\n\n### The Shape\n\nThe flag has a **Y-shape** (like the letter Y on its side). This shape represents different groups coming together and moving forward as one nation.\n\n### Flag Rules\n\n- The flag must be treated with **respect**\n- It must never touch the ground\n- It flies at government buildings, schools, and sports events\n- When a leader dies, the flag is flown at **half-mast** (halfway down the pole) to show sadness'),
  q(6, 'What does the Y-shape on the South African flag represent?',
    ['Different groups coming together and moving forward as one nation', 'The letter Y for "yes"', 'A river flowing through the country', 'The shape of South Africa on a map'], 0,
    'The Y-shape on the South African flag symbolises the coming together of different groups in South African society. The two arms of the Y join into one, showing how we all move forward together as a united nation.',
    ['Think about different paths joining together into one.']),
  t(7, '## National Symbols of South Africa\n\nBesides our flag, South Africa has many other national symbols that represent our country.\n\n### Our National Symbols\n\n| Symbol | What It Is |\n|--------|------------|\n| **National anthem** | "Nkosi Sikelel\' iAfrika" combined with "Die Stem" — sung in **five languages** (Xhosa, Zulu, Sesotho, Afrikaans, and English) |\n| **Coat of arms** | A special badge with a protea, a secretary bird, elephant tusks, and the motto |\n| **Motto** | !ke e: /xarra //ke — meaning "Diverse people unite" in the San language |\n| **National flower** | The **King Protea** |\n| **National bird** | The **Blue Crane** |\n| **National fish** | The **Galjoen** |\n| **National animal** | The **Springbok** |\n| **National tree** | The **Real Yellowwood** |\n\n### The National Anthem\n\nOur national anthem is special because it is sung in five of our 11 official languages:\n1. It starts in **Xhosa**: "Nkosi sikelel\' iAfrika"\n2. Then **Zulu**: "Maluphakanyisw\' uphondo lwayo"\n3. Then **Sesotho**: "Morena boloka setjhaba sa heso"\n4. Then **Afrikaans**: "Uit die blou van onse hemel"\n5. Then **English**: "Sounds the call to come together"'),
  fb(8, 'The national flower of South Africa is the King ___. Our motto "!ke e: /xarra //ke" is written in the ___ language.',
    ['Protea', 'San'],
    'The King Protea is a beautiful flower found in the fynbos of the Western Cape. Our national motto is written in the Khoisan language of the San people — the first people of South Africa. It means "Diverse people unite."',
    ['Think about a large, beautiful flower. Think about the first people of South Africa.']),
  q(9, 'How many official languages does South Africa have?',
    ['11', '5', '9', '3'], 0,
    'South Africa has 11 official languages: Zulu, Xhosa, Afrikaans, English, Northern Sotho, Tswana, Sotho, Tsonga, Swati, Venda, and Ndebele. This makes South Africa one of the most multilingual countries in the world!',
    ['Think about one more than 10.']),
  t(10, '## Our Many Languages\n\nSouth Africa has **11 official languages**. This makes our country one of the most diverse in the world.\n\n### The 11 Official Languages\n\n| Language | Where It Is Mostly Spoken |\n|----------|-------------------------|\n| **isiZulu** | KwaZulu-Natal, Gauteng |\n| **isiXhosa** | Eastern Cape, Western Cape |\n| **Afrikaans** | Western Cape, Northern Cape |\n| **English** | All provinces (business, government) |\n| **Sepedi (Northern Sotho)** | Limpopo |\n| **Setswana** | North West |\n| **Sesotho** | Free State |\n| **Xitsonga** | Limpopo, Mpumalanga |\n| **siSwati** | Mpumalanga |\n| **Tshivenda** | Limpopo |\n| **isiNdebele** | Mpumalanga, Gauteng |\n\n### Saying "Hello" in Different Languages\n\n- **Zulu:** Sawubona\n- **Xhosa:** Molo\n- **Afrikaans:** Hallo\n- **Sesotho:** Dumela\n- **Tswana:** Dumelang\n\nOur many languages are a treasure. When you learn to greet someone in their language, you show them respect. Try to learn a greeting in a language you do not speak!'),
];

// --- Lesson 2: The South African Flag and National Symbols ---
blockNum = 0;
const ch6_lesson2 = [
  t(1, '## Provinces Up Close\n\nLet us take a closer look at some of our nine provinces and what makes each one special.\n\n### Gauteng — Place of Gold\n\n- **Capital:** Johannesburg (and Pretoria nearby)\n- **Population:** The most people of any province — over 15 million!\n- **Size:** The smallest province\n- **Famous for:** Gold mining, the Cradle of Humankind, Soweto, the Apartheid Museum\n- **Languages:** isiZulu, English, Afrikaans, Sesotho, Setswana\n\n### Western Cape — Where the Oceans Meet\n\n- **Capital:** Cape Town\n- **Famous for:** Table Mountain, Robben Island, the V&A Waterfront, wine farms, the Garden Route\n- **Languages:** Afrikaans, isiXhosa, English\n- **Fun fact:** Cape Town is the oldest city in South Africa — it was founded in 1652\n\n### KwaZulu-Natal — The Zulu Kingdom\n\n- **Capital:** Pietermaritzburg\n- **Famous for:** The Drakensberg mountains, warm beaches in Durban, the Zulu kingdom, Shakaland\n- **Languages:** isiZulu, English\n- **Fun fact:** The Drakensberg is a UNESCO World Heritage Site with ancient San rock art'),
  q(2, 'Which province is the smallest in size but has the most people?',
    ['Gauteng', 'Northern Cape', 'Western Cape', 'KwaZulu-Natal'], 0,
    'Gauteng is the smallest province by area, but more people live there than in any other province — over 15 million! This is because Johannesburg and Pretoria attract many people who come looking for work.',
    ['Think about the province where Johannesburg is.']),
  t(3, '## More Provinces to Explore\n\n### Eastern Cape — Birthplace of Heroes\n\n- **Capital:** Bhisho\n- **Famous for:** Birthplace of Nelson Mandela (Mvezo), the Wild Coast, Addo Elephant Park\n- **Languages:** isiXhosa, Afrikaans, English\n\n### Free State — Wide Open Spaces\n\n- **Capital:** Bloemfontein (also the judicial capital of SA)\n- **Famous for:** Golden Gate Highlands National Park, sunflower and maize farms, wide open plains\n- **Languages:** Sesotho, Afrikaans, isiXhosa\n\n### Limpopo — Land of Legends\n\n- **Capital:** Polokwane\n- **Famous for:** The Kruger National Park, Mapungubwe (ancient kingdom), the baobab tree\n- **Languages:** Sepedi, Tshivenda, Xitsonga\n- **Fun fact:** The ancient kingdom of Mapungubwe had a golden rhinoceros — it is now a national treasure!\n\n### Mpumalanga — Place Where the Sun Rises\n\n- **Capital:** Mbombela (Nelspruit)\n- **Famous for:** Blyde River Canyon (one of the largest green canyons in the world), God\'s Window, Bourke\'s Luck Potholes\n- **Languages:** siSwati, isiZulu, Xitsonga'),
  fb(4, 'Nelson Mandela was born in the ___ Cape province. The Kruger National Park is in the ___ province.',
    ['Eastern', 'Limpopo'],
    'Nelson Mandela was born in the small village of Mvezo in the Eastern Cape on 18 July 1918. The Kruger National Park in Limpopo is one of the largest game reserves in Africa and is home to the Big Five (lion, leopard, elephant, buffalo, and rhino).',
    ['Think about which Cape province is on the right side of South Africa. Think about the province in the far north.']),
  t(5, '## The Last Two Provinces\n\n### North West — Sun City and Platinum\n\n- **Capital:** Mahikeng\n- **Famous for:** Sun City resort, Pilanesberg National Park, the biggest platinum mines in the world\n- **Languages:** Setswana, Afrikaans, isiXhosa\n- **Fun fact:** More platinum comes from North West than from anywhere else on Earth!\n\n### Northern Cape — The Big Dry\n\n- **Capital:** Kimberley\n- **Famous for:** The Big Hole (an old diamond mine you can visit), the Kalahari Desert, the Namaqualand flowers in spring, the Square Kilometre Array (SKA) radio telescope\n- **Languages:** Afrikaans, Setswana\n- **Fun fact:** It is the largest province but has the fewest people — because most of it is dry semi-desert\n\n### Every Province Is Special\n\nOur nine provinces are all different, and that is what makes South Africa so wonderful. From the busy streets of Johannesburg to the quiet beauty of the Namaqualand flowers, every part of our country is worth exploring.'),
  q(6, 'What is the Northern Cape famous for?',
    ['The Big Hole diamond mine, the Kalahari Desert, and the Namaqualand flowers', 'Table Mountain and Robben Island', 'The Zulu Kingdom and warm beaches', 'Gold mining and the Apartheid Museum'], 0,
    'The Northern Cape is famous for its diamond history (the Big Hole in Kimberley), the vast Kalahari Desert, and the incredible Namaqualand flower display that happens every spring when millions of wildflowers bloom in the desert.',
    ['Think about the province where diamonds were found.']),
  t(7, '## Interesting Facts About South Africa\n\nHere are some amazing facts about our country:\n\n| Fact | Detail |\n|------|--------|\n| **Full name** | Republic of South Africa |\n| **Population** | About 62 million people |\n| **Size** | 1,221,037 square kilometres |\n| **Highest point** | Mafadi Peak in the Drakensberg (3,450 metres) |\n| **Longest river** | The Orange River (2,200 km) |\n| **Biggest city** | Johannesburg |\n| **Oldest city** | Cape Town (1652) |\n| **National sport** | Rugby, cricket, and soccer are all very popular |\n| **Currency** | The South African Rand (R) |\n| **Time zone** | South African Standard Time (UTC+2) |\n\n### Amazing South African Records\n\n- South Africa has the **third-highest biodiversity** in the world\n- The **Tugela Falls** in KwaZulu-Natal is the second-tallest waterfall in the world\n- South Africa is the only country with **three capital cities**\n- The **Cradle of Humankind** near Johannesburg is one of the most important fossil sites in the world'),
  fb(8, 'The longest river in South Africa is the ___ River. South Africa\'s currency is called the ___.',
    ['Orange', 'Rand'],
    'The Orange River stretches about 2,200 km from the Drakensberg mountains in Lesotho all the way to the Atlantic Ocean on the west coast. The South African Rand (R) is named after the Witwatersrand — the ridge in Gauteng where gold was discovered.',
    ['Think about a colour that is also a fruit. Think about the letter R on our money.']),
  q(9, 'How many capital cities does South Africa have?',
    ['Three', 'One', 'Two', 'Nine'], 0,
    'South Africa is unique because it has three capital cities: Pretoria (executive — where the President works), Cape Town (legislative — where Parliament meets), and Bloemfontein (judicial — where the highest court sits).',
    ['Think about a number between two and four.']),
  t(10, '## Being a Proud South African\n\nSouth Africa is a special country with an incredible history, beautiful landscapes, and wonderful people.\n\n### What Makes Us Proud\n\n- Our **diversity** — 11 languages, many cultures, one nation\n- Our **history** — we overcame apartheid and chose peace\n- Our **nature** — mountains, oceans, deserts, and amazing wildlife\n- Our **people** — hard-working, friendly, and resilient\n- Our **sport** — the Springboks, Bafana Bafana, the Proteas\n- Our **food** — braai, bobotie, bunny chow, biltong, koeksisters\n\n### Ways to Show You Are Proud\n\n- Learn the national anthem — all five parts!\n- Know your province and its capital\n- Respect our flag and national symbols\n- Learn to greet people in different South African languages\n- Take care of our environment\n- Treat all people with respect, no matter their background\n\n> **Remember:** South Africa belongs to ALL who live in it, united in our diversity. Be proud of who you are and where you come from!\n\n"South Africa is a country of many colours. Each colour is beautiful, and together they make a rainbow." — Archbishop Desmond Tutu'),
];

// =============================================================================
// CHAPTER 7 (Geography – Term 4): Caring for Our Environment
// =============================================================================

// --- Lesson 1: Keeping Our Places Clean ---
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## What Is the Environment?\n\nThe **environment** is everything around us — the air we breathe, the water we drink, the soil we grow food in, and all the plants and animals that share our planet.\n\n### Parts of Our Environment\n\n| Part | Examples |\n|------|----------|\n| **Air** | The air we breathe, wind, clouds |\n| **Water** | Rivers, dams, oceans, rain |\n| **Land** | Soil, mountains, fields, forests |\n| **Plants** | Trees, grass, flowers, vegetables |\n| **Animals** | Birds, insects, fish, lions, dogs |\n\nWe depend on our environment for everything:\n- **Air** to breathe\n- **Water** to drink\n- **Food** from plants and animals\n- **Materials** to build homes (wood, stone, sand)\n- **Medicine** from plants\n\nIf we do not take care of our environment, we will not have clean air, clean water, or enough food. That is why it is so important to look after it.'),
  q(2, 'Why must we take care of our environment?',
    ['Because we depend on it for air, water, food, and shelter', 'Because our teacher told us to', 'Because it looks pretty', 'Because we might get a reward'], 0,
    'We depend on our environment for everything we need to survive — clean air to breathe, clean water to drink, food to eat, and materials to build our homes. If we damage the environment, we damage ourselves.',
    ['Think about what you need every day to stay alive.']),
  t(3, '## What Is Pollution?\n\n**Pollution** is when harmful things are put into the environment, making it dirty and unhealthy.\n\n### Types of Pollution\n\n| Type | What It Is | Examples |\n|------|-----------|----------|\n| **Litter** | Rubbish thrown on the ground | Sweet wrappers, chip packets, plastic bottles |\n| **Air pollution** | Dirty air caused by smoke and fumes | Smoke from fires, car exhaust, factory fumes |\n| **Water pollution** | Dirty water that is unsafe to use | Sewage in rivers, chemicals, litter in streams |\n| **Soil pollution** | Harmful chemicals in the ground | Pesticides, oil spills, buried rubbish |\n| **Noise pollution** | Too much loud noise | Loud music, traffic noise, construction |\n\n### How Pollution Hurts Us\n\n- **Dirty air** makes it hard to breathe and can cause asthma and lung problems\n- **Dirty water** can make people very sick with cholera and diarrhoea\n- **Litter** blocks drains and causes flooding. It also hurts animals\n- **Soil pollution** means crops cannot grow properly and food may not be safe\n\nPollution is a big problem in South Africa, but we can all help to fix it!'),
  fb(4, '___ is rubbish thrown on the ground, like sweet wrappers and plastic bottles. Dirty ___ can make people sick with cholera and diarrhoea.',
    ['Litter', 'water'],
    'Litter is one of the most visible forms of pollution. When people throw rubbish on the ground instead of in a bin, it makes our streets and neighbourhoods dirty and can block drains. Water pollution happens when harmful things like sewage and chemicals get into our rivers and dams.',
    ['Think about the word for rubbish on the ground. Think about what we drink that can be polluted.']),
  t(5, '## Litter — A Big Problem\n\nLitter is one of the biggest pollution problems in South Africa. Walk down any street and you will probably see chip packets, plastic bottles, and other rubbish on the ground.\n\n### Where Does Litter Come From?\n\n- People throwing rubbish out of car windows\n- People not using dustbins\n- Overflowing rubbish bins that are not emptied\n- Wind blowing rubbish from open dumps\n- People littering in parks, beaches, and rivers\n\n### What Happens to Litter?\n\n| Type of Litter | How Long It Takes to Break Down |\n|----------------|-------------------------------|\n| Banana peel | 2–5 weeks |\n| Paper | 2–5 months |\n| Tin can | 50–100 years |\n| Plastic bag | 10–20 years |\n| Plastic bottle | 450 years |\n| Glass bottle | 1 million years! |\n\nThat plastic bottle you throw away today could still be there when your great-great-great-grandchildren are alive!\n\n### What Can YOU Do?\n\n- Always use a **dustbin**\n- **Pick up** litter, even if it is not yours\n- **Reduce** the amount of rubbish you make\n- **Reuse** things instead of throwing them away'),
  q(6, 'How long does it take for a plastic bottle to break down?',
    ['About 450 years', 'About 2 weeks', 'About 1 year', 'About 10 years'], 0,
    'A plastic bottle takes about 450 years to decompose (break down). That means a bottle thrown away today will still exist in the year 2475! This is why it is so important to recycle plastic instead of throwing it in the rubbish.',
    ['Think of a very, very long time — hundreds of years.']),
  t(7, '## Air and Water Pollution in South Africa\n\n### Air Pollution\n\nIn South Africa, air pollution is a big problem, especially in:\n- **Cities** — because of cars, trucks, buses, and factories\n- **Townships** — because many people cook and heat with **paraffin, coal, and wood**\n- **Mining areas** — because of dust from mines\n- **Veld fires** — especially in winter in the grassland provinces\n\n### How Air Pollution Affects Health\n- Coughing and difficulty breathing\n- **Asthma** (a breathing disease)\n- Eye irritation\n- Headaches\n\n### Water Pollution\n\nSouth Africa\'s rivers and dams are under threat from pollution:\n- **Sewage** leaking into rivers (broken pipes)\n- **Mining waste** — acid mine drainage makes water orange and poisonous\n- **Litter** — plastic bags and bottles in rivers\n- **Chemicals** — from factories and farms\n\n### The Vaal River\n\nThe **Vaal River** in Gauteng provides drinking water to millions of people. Sadly, it has become polluted by sewage and mining waste. People are working hard to clean it up.'),
  fb(8, 'Many people in townships cook and heat with paraffin, coal, and ___, which causes air pollution. The ___ River in Gauteng is an important but polluted river.',
    ['wood', 'Vaal'],
    'In many South African townships, people use wood, coal, and paraffin for cooking and heating because they cannot afford electricity. The smoke from these fuels causes serious air pollution. The Vaal River is vital for Gauteng\'s water supply but has been badly polluted.',
    ['Think about a fuel that comes from trees. Think about a famous river near Johannesburg.']),
  q(9, 'What is one cause of water pollution in South African rivers?',
    ['Sewage leaking from broken pipes', 'Fish swimming in the river', 'Rain falling from the sky', 'People drinking the water'], 0,
    'One of the main causes of water pollution in South Africa is sewage leaking into rivers from broken or poorly maintained pipes. This makes the water unsafe to drink and can spread diseases like cholera.',
    ['Think about what happens when waste pipes break near a river.']),
  t(10, '## Keeping Our Places Clean\n\nWe can all help keep our environment clean. Here are some things that communities do:\n\n### Community Clean-Up Actions\n\n| Action | What Happens |\n|--------|-------------|\n| **Clean-up days** | People gather to pick up litter in streets and parks |\n| **Beach clean-ups** | Volunteers remove rubbish from beaches |\n| **River clean-ups** | Groups remove litter and invasive plants from rivers |\n| **Anti-littering campaigns** | Signs and education to stop people from littering |\n| **Recycling centres** | Places where people can bring recyclable materials |\n\n### What YOU Can Do Every Day\n\n1. **Use a dustbin** — never throw litter on the ground\n2. **Carry a bag** — pick up litter you see\n3. **Tell others** — encourage friends and family not to litter\n4. **Clean your yard** — keep your home and school neat\n5. **Join a clean-up** — help your community\n\n> **Remember:** "If not me, then who? If not now, then when?" Every piece of litter you pick up makes a difference. You are helping to save our environment!'),
];

// --- Lesson 2: Recycling and Saving Resources ---
blockNum = 0;
const ch7_lesson2 = [
  t(1, '## What Is Recycling?\n\n**Recycling** means taking old things and turning them into new things instead of throwing them away.\n\n### The Three R\'s\n\n| R | What It Means | Example |\n|---|--------------|--------|\n| **Reduce** | Use less | Turn off the tap while brushing your teeth |\n| **Reuse** | Use again | Use a shopping bag again instead of getting a new one |\n| **Recycle** | Make something new from something old | Turn old paper into new paper |\n\n### Why Recycle?\n\n- It **reduces rubbish** in landfills (rubbish dumps)\n- It **saves resources** — we do not need to dig up as many raw materials\n- It **saves energy** — making things from recycled materials uses less energy\n- It **protects the environment** — less pollution and less harm to animals\n\n### What Can Be Recycled?\n\n| Material | Examples |\n|----------|----------|\n| **Paper** | Newspapers, magazines, cardboard boxes |\n| **Plastic** | Bottles, containers, bags |\n| **Glass** | Jars, bottles |\n| **Metal** | Tin cans, aluminium cans |\n| **Organic** | Food scraps, garden waste (for compost) |'),
  q(2, 'What does it mean to recycle?',
    ['To take old things and turn them into new things', 'To throw things in the dustbin', 'To buy new things every day', 'To burn rubbish in a fire'], 0,
    'Recycling means collecting used materials (like paper, plastic, glass, and metal) and processing them to make new products. This reduces the amount of rubbish going to landfills and helps protect our environment.',
    ['Think about making something new from something old.']),
  t(3, '## How Recycling Works in South Africa\n\nMany South Africans make a living from recycling. **Waste pickers** collect recyclable materials from bins and streets and sell them to recycling companies.\n\n### Recycling Colours\n\nIn South Africa, different coloured bins are used for different materials:\n\n| Bin Colour | Material |\n|------------|----------|\n| **Blue** | Paper and cardboard |\n| **Yellow** | Plastic and metal (tins and cans) |\n| **Green** | Glass |\n| **Brown/Orange** | Organic waste (food scraps, garden waste) |\n| **Black** | General waste (things that cannot be recycled) |\n\n### Waste Pickers — Unsung Heroes\n\nWaste pickers (sometimes called *reclaimers*) are people who collect recyclable materials to sell. They:\n- Keep tonnes of recyclable material out of landfills\n- Help the environment\n- Earn a living for their families\n- Deserve our respect and thanks\n\nIn South Africa, waste pickers save our cities from being buried in rubbish. They are environmental heroes!'),
  fb(4, 'Paper and cardboard go in the ___ recycling bin. People who collect recyclable materials to sell are called waste ___.',
    ['blue', 'pickers'],
    'In South Africa\'s recycling system, blue bins are for paper and cardboard. Waste pickers (also called reclaimers) play a vital role in South Africa\'s recycling system — they collect materials that would otherwise end up in landfills.',
    ['Think about the colour of the sky — that is the colour of the paper bin.']),
  t(5, '## Saving Water\n\nSouth Africa is a **dry country**. We get much less rain than most other countries in the world. That means we must be very careful with our water.\n\n### The Cape Town Water Crisis\n\nIn **2018**, Cape Town nearly ran out of water! After three years of very little rain, the dams were almost empty. The city set a target called **"Day Zero"** — the day the taps would be turned off.\n\nPeople had to:\n- Use only **50 litres** of water per person per day (normally we use 200-300 litres!)\n- Take very short showers (90 seconds!)\n- Stop watering gardens\n- Reuse bath water for flushing toilets\n\nThanks to everyone saving water, **Day Zero never came**. But it was a scary warning.\n\n### How to Save Water at Home\n\n| Action | Water Saved |\n|--------|------------|\n| Turn off the tap while brushing teeth | 6 litres per minute |\n| Take a short shower (2 minutes) | 100 litres saved vs. a bath |\n| Fix dripping taps | Up to 10,000 litres per year! |\n| Use a bucket to wash the car, not a hose | 300 litres saved |\n| Collect rainwater for the garden | Hundreds of litres |'),
  q(6, 'What was "Day Zero" in Cape Town?',
    ['The day the taps would be turned off because the dams were almost empty', 'A special holiday', 'The first day of school', 'The day a new dam was built'], 0,
    'Day Zero was the predicted date when Cape Town\'s water supply would run so low that the city would have to turn off most taps. People would have had to queue for water. Thanks to everyone saving water, Day Zero was avoided.',
    ['Think about a crisis — when something almost runs out.']),
  t(7, '## Saving Electricity\n\nElectricity is another resource we must use wisely. In South Africa, we sometimes have **load shedding** — when Eskom turns off the electricity because there is not enough for everyone.\n\n### Where Does Our Electricity Come From?\n\nMost of South Africa\'s electricity comes from **coal-burning power stations**. This is a problem because:\n- Burning coal creates **air pollution** and smoke\n- Coal is running out — it is not infinite\n- It contributes to **climate change** (global warming)\n\n### Better Sources of Energy\n\n| Source | How It Works |\n|--------|-------------|\n| **Solar power** | Uses the sun\'s energy — South Africa has lots of sunshine! |\n| **Wind power** | Uses wind turbines — you can see them in the Eastern Cape |\n| **Hydropower** | Uses flowing water to make electricity |\n\n### How to Save Electricity at Home\n\n- **Turn off** lights when you leave a room\n- **Unplug** chargers when not in use\n- Use **energy-saving light bulbs**\n- Do not leave the fridge door open\n- Dry clothes on a washing line, not in a dryer\n- Use a **solar geyser** to heat water'),
  fb(8, 'In South Africa, ___ shedding happens when there is not enough electricity. Most of our electricity comes from burning ___.',
    ['load', 'coal'],
    'Load shedding is when Eskom intentionally cuts power to different areas in rotation because the electricity supply cannot meet the demand. Most of South Africa\'s electricity is generated by burning coal, which is harmful to the environment.',
    ['Think about what happens when Eskom cuts the power. Think about a black rock that burns.']),
  q(9, 'Which of these is a way to save electricity at home?',
    ['Turn off lights when you leave a room', 'Leave all the lights on all day', 'Keep the fridge door open', 'Leave your phone charger plugged in all the time'], 0,
    'Turning off lights when you leave a room is one of the simplest ways to save electricity. Other ways include unplugging chargers, using energy-saving bulbs, and drying clothes on a line instead of in a tumble dryer.',
    ['Think about what uses electricity when nobody needs it.']),
  t(10, '## You Can Make a Difference!\n\nTaking care of our environment is everyone\'s job — including yours!\n\n### Your Environmental Action Plan\n\n| At Home | At School | In Your Community |\n|---------|-----------|-------------------|\n| Save water — short showers | Pick up litter | Join a clean-up day |\n| Save electricity — turn off lights | Recycle paper | Tell others about pollution |\n| Recycle — sort your rubbish | Start a school garden | Plant a tree |\n| Reduce — use less plastic | Use both sides of paper | Report pollution |\n| Reuse — fix things instead of throwing them away | Compost food waste | Support waste pickers |\n\n### A Pledge for the Environment\n\n> "I promise to take care of our environment. I will save water, save electricity, and reduce, reuse, and recycle. I will not litter, and I will pick up litter when I see it. I will help make South Africa clean and green for future generations."\n\nEvery small action adds up. If every child in South Africa does their part, we can make a huge difference!\n\n> **Remember:** We do not inherit the Earth from our parents — we borrow it from our children. Let us give it back in good condition.'),
];

// =============================================================================
// CHAPTER 8 (Geography – Term 4): Seasons and Weather
// =============================================================================

// --- Lesson 1: The Four Seasons ---
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## What Are Seasons?\n\nA **season** is a time of year with its own type of weather. South Africa has **four seasons**:\n\n| Season | Months | What It Is Like |\n|--------|--------|-----------------|\n| **Summer** | December, January, February | Hot, lots of rain in most places |\n| **Autumn** | March, April, May | Cooler, leaves change colour and fall |\n| **Winter** | June, July, August | Cold, dry in most places |\n| **Spring** | September, October, November | Warmer, flowers bloom, baby animals are born |\n\n### Why Do We Have Seasons?\n\nThe Earth travels around the Sun once every year. The Earth is slightly **tilted**, which means:\n- When our part of the Earth is **tilted towards the Sun** = summer (more sunlight, longer days)\n- When our part is **tilted away from the Sun** = winter (less sunlight, shorter days)\n\n### Opposite Seasons!\n\nSouth Africa is in the **Southern Hemisphere** (the bottom half of the world). This means our seasons are the **opposite** of countries in the Northern Hemisphere:\n- When it is summer in South Africa, it is winter in Europe and America\n- Our Christmas is in summer — with braais and swimming!'),
  q(2, 'When is summer in South Africa?',
    ['December, January, and February', 'June, July, and August', 'March, April, and May', 'September, October, and November'], 0,
    'Summer in South Africa is December, January, and February. This is the opposite of countries in the Northern Hemisphere (like Europe and America) where these months are winter. That is why we have a warm Christmas!',
    ['Think about when it is the hottest and when you go on December holiday.']),
  t(3, '## Summer in South Africa\n\n**Summer** is the hottest season. It runs from **December to February**.\n\n### What Happens in Summer\n\n| Feature | Detail |\n|---------|--------|\n| **Temperature** | Very hot — often above 30°C, sometimes above 40°C in some places |\n| **Rain** | Lots of thunderstorms in the afternoon, especially in Gauteng and KwaZulu-Natal |\n| **Days** | Long — the sun rises early and sets late |\n| **Nature** | Everything is green, gardens are full of flowers, rivers are full |\n| **Activities** | Swimming, braais, cricket, going to the beach |\n\n### What We Wear in Summer\n- T-shirts and shorts\n- Sandals or flip-flops\n- Hats and sunscreen (very important!)\n- Light, cool fabrics\n\n### Summer in Different Parts of SA\n\n- **Gauteng:** Very hot (30–35°C) with afternoon thunderstorms and lightning\n- **Durban:** Hot AND humid (sticky) with rain\n- **Cape Town:** Hot and dry — very little rain in summer!\n- **Limpopo:** Extremely hot — temperatures can reach 40°C or more'),
  fb(4, 'In summer, temperatures in South Africa can go above ___°C. Cape Town is unusual because it gets very little ___ in summer.',
    ['30', 'rain'],
    'South African summers are very hot, with temperatures regularly above 30°C and sometimes reaching 40°C in places like Limpopo. Cape Town is unusual because it has a Mediterranean climate — it gets most of its rain in winter, not summer.',
    ['Think about a hot temperature number. Think about what usually falls from the sky in summer.']),
  t(5, '## Winter in South Africa\n\n**Winter** is the coldest season. It runs from **June to August**.\n\n### What Happens in Winter\n\n| Feature | Detail |\n|---------|--------|\n| **Temperature** | Cold — can drop below 0°C in some places (frost and ice!) |\n| **Rain** | Dry in most of SA, but the Western Cape gets rain in winter |\n| **Days** | Short — the sun rises late and sets early |\n| **Nature** | Some trees lose their leaves, grass turns brown |\n| **Activities** | Staying warm by the fire, drinking hot chocolate, wearing jerseys |\n\n### What We Wear in Winter\n- Warm jerseys and jackets\n- Long trousers and warm socks\n- Beanies and scarves\n- Closed shoes or boots\n\n### Winter in Different Parts of SA\n\n- **Gauteng:** Cold mornings and evenings (can go below 0°C!), but sunny during the day\n- **Western Cape:** Cold and rainy — this is when Cape Town gets most of its rain\n- **Drakensberg:** Freezing cold! Snow falls on the mountains\n- **Durban:** Mild and warm — many Gauteng people visit Durban in winter to escape the cold!'),
  q(6, 'Which part of South Africa gets rain mostly in winter?',
    ['The Western Cape (Cape Town area)', 'Gauteng (Johannesburg)', 'Limpopo (Polokwane)', 'KwaZulu-Natal (Durban)'], 0,
    'The Western Cape has a Mediterranean climate, which means it gets most of its rain in winter (June to August) and has dry summers. This is different from most of South Africa, where rain falls mainly in summer.',
    ['Think about the province at the bottom-left of South Africa, where Table Mountain is.']),
  t(7, '## Autumn and Spring\n\n### Autumn (March, April, May)\n\nAutumn is the season between summer and winter. It is a time of change.\n\n- The weather gets **cooler**\n- Some trees lose their leaves — they turn **yellow, orange, and red** before falling\n- The days get **shorter**\n- Farmers begin to **harvest** (pick) their crops\n- It is time to start wearing warmer clothes\n\n> **Fun fact:** In South Africa, we do not see as many colourful autumn leaves as in Europe because many of our trees are **evergreen** (they keep their green leaves all year).\n\n### Spring (September, October, November)\n\nSpring is the season between winter and summer. It is a time of new life.\n\n- The weather gets **warmer**\n- **Flowers bloom** — especially the famous Namaqualand daisies in the Northern Cape\n- Baby animals are born — lambs, chicks, and calves\n- The days get **longer**\n- People start doing more outdoor activities\n- In the Western Cape, the rain stops and the dry season begins\n\n> **Spring Day** is celebrated on **1 September** in South Africa.'),
  fb(8, 'In autumn, some tree leaves turn yellow, orange, and ___ before falling. In spring, the famous ___ daisies bloom in the Northern Cape.',
    ['red', 'Namaqualand'],
    'During autumn, the chemical changes in leaves cause them to change colour from green to beautiful shades of yellow, orange, and red. Every spring, millions of daisies and wildflowers bloom in Namaqualand, creating one of the most spectacular flower shows in the world.',
    ['Think about the warm colours of autumn leaves. Think about the flower area in the Northern Cape.']),
  q(9, 'What happens during spring in South Africa?',
    ['The weather gets warmer, flowers bloom, and baby animals are born', 'It snows everywhere', 'The days get shorter', 'All the leaves fall off the trees'], 0,
    'Spring is a time of new life and growth. The weather warms up after winter, flowers start to bloom, and baby animals are born. The days get longer and people spend more time outdoors.',
    ['Think about what "spring" means — new life and growth.']),
  t(10, '## What We Wear in Each Season\n\nThe clothes we wear change with the seasons because the weather changes.\n\n| Season | What to Wear | Why |\n|--------|-------------|-----|\n| **Summer** | T-shirts, shorts, sandals, hats, sunscreen | To stay cool and protect from the sun |\n| **Autumn** | Light jerseys, long pants, closed shoes | The weather is cooling down |\n| **Winter** | Thick jerseys, jackets, scarves, beanies, boots | To stay warm in the cold |\n| **Spring** | Light layers you can take off | The weather changes quickly — warm then cool |\n\n### Dressing in Layers\n\nA clever trick for autumn and spring is to wear **layers** — like a T-shirt with a jersey on top. If it gets warm, you can take the jersey off. If it gets cold, you put it back on.\n\n### Important Safety Tips\n\n- In summer, always wear **sunscreen** and a **hat** to protect from the sun\n- In winter, keep warm to avoid getting sick with colds and flu\n- Always wear **shoes** to protect your feet\n- Carry a **raincoat** or umbrella when rain is expected'),
];

// --- Lesson 2: Weather and Farming ---
blockNum = 0;
const ch8_lesson2 = [
  t(1, '## What Is Weather?\n\n**Weather** is what is happening in the air around us right now — is it hot or cold? Is it raining or sunny? Is there wind?\n\n### Parts of Weather\n\n| Part | What It Means | How We Measure It |\n|------|--------------|-------------------|\n| **Temperature** | How hot or cold the air is | Thermometer (in degrees Celsius — °C) |\n| **Rainfall** | How much rain falls | Rain gauge (in millimetres — mm) |\n| **Wind** | Moving air | Wind vane (direction) and anemometer (speed) |\n| **Clouds** | Water droplets high in the sky | By looking up! (clear, partly cloudy, overcast) |\n| **Sunshine** | Light and warmth from the sun | Sunshine recorder |\n\n### Weather vs Seasons\n\n- **Weather** changes every day — it might be sunny today and rainy tomorrow\n- **Seasons** are the general weather pattern over several months\n\nFor example: Winter in Gauteng is generally cold and dry, but you might get a warm, sunny day in the middle of winter!'),
  q(2, 'What is the difference between weather and seasons?',
    ['Weather changes every day, but seasons are the general pattern over several months', 'They are exactly the same thing', 'Weather is about the sun and seasons are about the moon', 'There is no difference'], 0,
    'Weather refers to the day-to-day conditions — whether it is sunny, rainy, hot, or cold right now. A season is the overall pattern of weather over a few months. You can have a warm day in winter (that is weather), but winter is generally cold (that is the season).',
    ['Think about what changes every day versus what stays the same for months.']),
  t(3, '## Summer Rain and Winter Rain Areas\n\nDifferent parts of South Africa get their rain at different times of the year.\n\n### Summer Rainfall Areas (Most of South Africa)\n\nMost of South Africa gets rain in **summer** (October to March):\n- **Gauteng** — Famous for afternoon thunderstorms with lightning\n- **KwaZulu-Natal** — Heavy rain, especially along the coast\n- **Limpopo** — Summer thunderstorms bring relief from the heat\n- **Mpumalanga** — Lots of rain, which makes it very green\n- **Free State, North West** — Summer storms water the farmlands\n\n### Winter Rainfall Area (Western Cape)\n\nThe **Western Cape** is different! It gets rain in **winter** (May to August):\n- Cold fronts blow in from the Atlantic Ocean\n- It can rain for days in a row\n- Summers are hot and dry\n\n### All-Year Rainfall\n\nSome areas get rain **all year round**:\n- The **Garden Route** (between the Western Cape and Eastern Cape)\n- Parts of the **Eastern Cape** coast\n\n### Dry Areas\n\nSome parts get very little rain at all:\n- The **Northern Cape** (Kalahari Desert)\n- The **Karoo** (semi-desert in the middle of SA)'),
  fb(4, 'Most of South Africa gets rain in ___, but the Western Cape gets rain in ___.',
    ['summer', 'winter'],
    'South Africa has two main rainfall patterns. Most of the country receives summer rainfall (October to March), often in the form of afternoon thunderstorms. The Western Cape is unusual because it receives its rain in winter (May to August) from cold fronts that blow in from the ocean.',
    ['Think about when most of South Africa gets its storms. Think about when Cape Town gets its rain.']),
  t(5, '## Weather and Farming\n\nFarming depends on the weather more than almost anything else. Farmers need to know about the seasons and weather patterns to grow food.\n\n### What Farmers Need\n\n| Need | Why |\n|------|-----|\n| **Rain** | Crops need water to grow |\n| **Sunshine** | Plants need sunlight to make food (photosynthesis) |\n| **Warm temperatures** | Most crops grow best in warm weather |\n| **Good soil** | Nutrients in the soil feed the plants |\n\n### What South African Farmers Grow\n\n| Season | Crops |\n|--------|-------|\n| **Summer** | Maize (mealies), sunflowers, soya beans, cotton, sugar cane |\n| **Winter** | Wheat, canola, oats, barley |\n| **All year** | Fruit (oranges, apples, grapes), vegetables |\n\n### The Maize Triangle\n\nThe **Maize Triangle** is an area in the Free State, North West, and Mpumalanga where most of South Africa\'s **maize (mealies)** is grown. Maize is our most important crop — it is used to make **pap**, which is eaten by millions of South Africans every day!'),
  q(6, 'What is the Maize Triangle?',
    ['The area in the Free State, North West, and Mpumalanga where most maize is grown', 'A triangle-shaped maize field', 'A type of maths problem about maize', 'A maize-flavoured snack'], 0,
    'The Maize Triangle is a large farming region stretching across the Free State, North West, and Mpumalanga provinces. It is the heartland of South Africa\'s maize production, and maize (used to make pap) is the most important staple food in the country.',
    ['Think about where in South Africa most mealies are grown.']),
  t(7, '## When Weather Goes Wrong\n\nSometimes the weather can be dangerous and cause problems.\n\n### Dangerous Weather\n\n| Weather Event | What Happens | Where in SA |\n|--------------|-------------|-------------|\n| **Drought** | No rain for a long time — crops die, animals and people have no water | Anywhere, but especially the Northern Cape and Eastern Cape |\n| **Floods** | Too much rain — water covers roads and homes | KwaZulu-Natal, Gauteng |\n| **Hailstorms** | Balls of ice fall from the sky — damage crops and cars | Gauteng (especially in summer) |\n| **Lightning** | Electrical strikes during thunderstorms — can start fires and hurt people | Most of SA in summer |\n| **Very strong wind** | Can blow roofs off houses and knock down trees | Western Cape (the "Cape Doctor" wind) |\n\n### The KwaZulu-Natal Floods of 2022\n\nIn April 2022, KwaZulu-Natal experienced terrible floods:\n- More than **400 people** lost their lives\n- Thousands of homes were destroyed\n- Roads and bridges were washed away\n- It was one of the worst natural disasters in South Africa\'s history\n\nThis showed us how powerful and dangerous weather can be.'),
  fb(8, 'A ___ happens when there is no rain for a long time and crops die. In April 2022, terrible ___ hit KwaZulu-Natal and caused great destruction.',
    ['drought', 'floods'],
    'A drought is a long period without rain, which can devastate farming and leave people without water. The KwaZulu-Natal floods of April 2022 were caused by extremely heavy rainfall over several days, which caused rivers to overflow and hillsides to collapse.',
    ['Think about what happens when it does not rain for a very long time. Think about too much rain.']),
  q(9, 'Why is weather important for farmers?',
    ['Farmers need the right amount of rain, sunshine, and warmth to grow crops', 'Farmers like to talk about the weather', 'Weather only affects people in cities', 'Farmers do not care about the weather'], 0,
    'Farmers depend on the weather to grow crops and raise animals. They need enough rain (but not too much), plenty of sunshine, and the right temperatures. When the weather goes wrong — drought, floods, or hail — it can destroy crops and cause food shortages.',
    ['Think about what plants need to grow.']),
  t(10, '## Weather in Our Daily Lives\n\nWeather affects our daily lives in many ways:\n\n### How Weather Affects Us\n\n| Activity | How Weather Matters |\n|----------|--------------------|\n| **Getting dressed** | We choose clothes based on whether it is hot or cold |\n| **Going to school** | Rain might make us late, or very hot days might make it hard to concentrate |\n| **Playing outside** | We play outside in good weather, stay inside when it rains |\n| **Eating** | In winter we eat hot food like soup; in summer we eat cool food like ice cream |\n| **Sleeping** | We use extra blankets in winter and fewer in summer |\n\n### Checking the Weather\n\nToday, we can check the weather forecast on:\n- **Television** — news channels show weather maps\n- **Radio** — weather updates throughout the day\n- **Phone apps** — weather apps on smartphones\n- **Newspapers** — weather page\n\n### What We Have Learned\n\n- South Africa has four seasons: summer, autumn, winter, spring\n- Most of SA gets summer rain, but the Western Cape gets winter rain\n- Weather affects farming — farmers need the right conditions to grow food\n- Dangerous weather like droughts, floods, and hailstorms can cause big problems\n- We can prepare for weather by dressing right and checking the forecast\n\n> **Remember:** Weather shapes our lives every day. Pay attention to the seasons and weather around you — it will help you understand your environment better!'),
];

// =============================================================================
// DATABASE INSERTION
// =============================================================================

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

  // Find or create the Social Sciences subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Social.*Sci/i, schoolId: SCHOOL_ID });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Social Sciences subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Social Sciences',
      code: 'SS',
      schoolId: SCHOOL_ID,
      gradeIds: [GRADE_ID],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Social Sciences subject:', String(SUBJECT_ID));
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
    tags: ['grade-3', 'social-sciences', 'caps'],
    aiModel: '',
    aiPrompt: '',
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    difficulty: 3,
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
      title: 'Chapter 1: My Family History (History)',
      description: 'Families past and present, types of families in South Africa, how families have changed over time, grandparents\' stories and oral history, old photographs, family trees, family traditions, cultural celebrations, ubuntu, and stokvels.',
      order: 1,
      lessons: [
        { title: 'Families Past and Present', description: 'Types of families (nuclear, extended, single-parent, child-headed, blended), how families have changed over time, grandparents\' stories and oral history, old photographs then and now, and drawing a family tree.', blocks: ch1_lesson1, term: 1 },
        { title: 'My Family Tree and Traditions', description: 'Family traditions and customs, South African cultural traditions (Zulu, Xhosa, Afrikaans, Indian, Cape Malay, Ndebele, Sotho/Tswana), family celebrations, heirlooms, ubuntu, stokvels, and how families help each other.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: My School (History)',
      description: 'History of schools, how schools have changed over time, schools during apartheid and Bantu Education, the Soweto Uprising, school buildings then and now, school rules, corporal punishment, school symbols, uniforms, and badges.',
      order: 2,
      lessons: [
        { title: 'The History of Our School', description: 'Finding out about your school\'s history, how schools have changed, schools before colonisation, Bantu Education during apartheid, the Soweto Uprising of 1976, democracy and education after 1994, and school buildings then and now.', blocks: ch2_lesson1, term: 1 },
        { title: 'School Rules and Symbols', description: 'Why we have school rules, how rules have changed over time, corporal punishment ban of 1996, school symbols (badge, colours, motto, song, flag), school uniforms and their purpose, and how uniforms have changed.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: How We Lived Long Ago (History)',
      description: 'Life before electricity, old tools and objects (imbokodo, potjie, oil lamp), traditional houses (rondavel, matjieshuise), traditional games (diketo, morabaraba, kgati), comparing past and present in transport, shopping, clothes, and entertainment.',
      order: 3,
      lessons: [
        { title: 'Life Before Electricity and Cars', description: 'How people managed without electricity, old tools and objects like the imbokodo and potjie, traditional houses (rondavel, matjieshuise, wattle and daub), traditional South African games (diketo, morabaraba, kgati), and a timeline of big changes.', blocks: ch3_lesson1, term: 2 },
        { title: 'Comparing Past and Present', description: 'Then and now in transport, communication, shopping (barter to supermarkets), traditional and modern clothing, how entertainment has changed, storytelling to television, and why we study the past.', blocks: ch3_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Important People in Our Past (History)',
      description: 'Nelson Mandela, apartheid and pass laws, Robben Island, Freedom Day (27 April 1994), other struggle heroes (Albertina Sisulu, Desmond Tutu, Oliver Tambo, Steve Biko, Helen Suzman), Nkosi Johnson, Mahatma Gandhi, Miriam Makeba, and everyday heroes.',
      order: 4,
      lessons: [
        { title: 'Nelson Mandela and Freedom', description: 'Nelson Mandela\'s life, apartheid laws and pass books, Robben Island, Freedom Day 27 April 1994, other heroes of the struggle (Albertina Sisulu, Desmond Tutu, Oliver Tambo, Steve Biko, Helen Suzman), Mandela Day, and lessons of forgiveness and equality.', blocks: ch4_lesson1, term: 2 },
        { title: 'Heroes in Our Community', description: 'What makes a hero, everyday heroes (parents, teachers, nurses, firefighters), Nkosi Johnson and HIV/AIDS, Mahatma Gandhi and peaceful protest, Miriam Makeba, heroes in schools and communities, and being a hero yourself.', blocks: ch4_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Where I Live (Geography)',
      description: 'My home and its parts, types of homes in South Africa (house, flat, rondavel, shack, RDP house), neighbourhoods (urban, suburban, rural, township), addresses, landmarks, directions, simple maps, and safety in the neighbourhood.',
      order: 5,
      lessons: [
        { title: 'My Home and Neighbourhood', description: 'Why we need homes, types of homes in South Africa (house, flat, rondavel, townhouse, shack, RDP house, farm house), what a neighbourhood is, types of neighbourhoods (urban, suburban, rural, township), finding your way, addresses, and taking care of your neighbourhood.', blocks: ch5_lesson1, term: 3 },
        { title: 'Types of Homes and Finding My Way', description: 'Why homes look different (climate, materials, income), homes in different parts of South Africa (Cape Town, Durban, Johannesburg, rural Limpopo), directions (left, right, near, far), landmarks, drawing simple maps, map keys, and neighbourhood safety.', blocks: ch5_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: My Country South Africa (Geography)',
      description: 'South Africa on the map, neighbouring countries, the nine provinces and their capitals, the South African flag and its colours, national symbols (anthem, coat of arms, motto, protea, blue crane, springbok), 11 official languages, and being a proud South African.',
      order: 6,
      lessons: [
        { title: 'South Africa on the Map', description: 'South Africa\'s location on the African continent, Atlantic and Indian Oceans, neighbouring countries (Namibia, Botswana, Zimbabwe, Mozambique, Eswatini, Lesotho), the nine provinces and their capitals, three capital cities, the SA flag and its six colours, and national symbols.', blocks: ch6_lesson1, term: 3 },
        { title: 'Our Provinces and National Pride', description: 'A closer look at each of the nine provinces, special features and famous places, interesting facts about South Africa (population, rivers, records), the 11 official languages, saying hello in different languages, and being a proud South African.', blocks: ch6_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Caring for Our Environment (Geography)',
      description: 'What the environment is, types of pollution (litter, air, water, soil, noise), how long litter takes to break down, air and water pollution in South Africa, recycling and the three R\'s, saving water (Day Zero), saving electricity (load shedding), and taking action.',
      order: 7,
      lessons: [
        { title: 'Keeping Our Places Clean', description: 'What the environment is and why we depend on it, types of pollution (litter, air, water, soil, noise), how long different litter takes to break down, air pollution in cities and townships, water pollution in rivers, the Vaal River, and community clean-up actions.', blocks: ch7_lesson1, term: 4 },
        { title: 'Recycling and Saving Resources', description: 'What recycling is, the three R\'s (reduce, reuse, recycle), recycling bin colours, waste pickers as environmental heroes, saving water (the Cape Town Day Zero crisis), saving electricity (load shedding and coal), renewable energy, and making an environmental pledge.', blocks: ch7_lesson2, term: 4 },
      ],
    },
    {
      title: 'Chapter 8: Seasons and Weather (Geography)',
      description: 'The four seasons in South Africa (summer, autumn, winter, spring), what happens in each season, what we wear, summer rain vs winter rain areas, weather and farming, the Maize Triangle, dangerous weather (drought, floods, hailstorms), and weather in daily life.',
      order: 8,
      lessons: [
        { title: 'The Four Seasons', description: 'Why we have seasons (Earth\'s tilt), opposite seasons in the Southern Hemisphere, summer in South Africa, winter and its features, autumn and spring, the Namaqualand flowers, what to wear in each season, and dressing in layers.', blocks: ch8_lesson1, term: 4 },
        { title: 'Weather and Farming', description: 'What weather is and how we measure it, weather vs seasons, summer rain and winter rain areas, what farmers need, South African crops, the Maize Triangle, dangerous weather (drought, floods, hailstorms, lightning), the 2022 KZN floods, and weather in daily life.', blocks: ch8_lesson2, term: 4 },
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
      resources: resourceIds.map(function (id, i) { return { resourceId: id, order: i }; }),
    });
  }

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 3 Social Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering History (My Family History, My School, How We Lived Long Ago, Important People in Our Past) and Geography (Where I Live, My Country South Africa, Caring for Our Environment, Seasons and Weather) for the Grade 3 Social Sciences curriculum.',
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
  console.log('  TEXTBOOK: Grade 3 Social Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function (err) { console.error(err); process.exit(1); });
