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
// CHAPTER 1: Plants (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Plants\n\n### Parts of a Plant\n\nPlants are living things. They grow all around us — in gardens, in parks, in the veld, and even in cracks in the pavement! Every plant has important parts that help it stay alive.\n\nLet us learn about the four main parts of a plant:\n\n| Part | What it looks like | What it does |\n|------|-------------------|-------------|\n| **Roots** | Thin strings that grow underground | Hold the plant in the soil and suck up water |\n| **Stem** | The stalk that holds the plant up | Carries water from the roots to the leaves |\n| **Leaves** | Flat, green parts that grow from the stem | Use sunlight to make food for the plant |\n| **Flowers** | The colourful part of the plant | Help the plant make seeds so new plants can grow |\n\nThink of a plant like your body:\n- The **roots** are like your feet — they keep the plant standing in one place\n- The **stem** is like your backbone — it holds everything up\n- The **leaves** are like your tummy — they make food\n- The **flowers** are like a parent — they help make new baby plants'),
  q(2, 'Which part of the plant sucks up water from the soil?',
    ['Leaves', 'Stem', 'Roots', 'Flowers'], 2,
    'The roots grow underground and suck up water and goodness from the soil. Without roots, the plant would not be able to drink!'),
  t(3, '### What Do Plants Need to Grow?\n\nPlants need four things to grow big and strong:\n\n1. **Water** — Plants drink water through their roots. If you forget to water a plant, it will wilt (go droopy) and can die.\n2. **Sunlight** — Leaves use sunlight to make food for the plant. Without sunlight, the plant cannot make food and will not grow.\n3. **Soil** — Soil holds the roots and has nutrients (goodness) that the plant needs.\n4. **Air** — Plants breathe in a gas called carbon dioxide from the air. They use it to make food.\n\n### Growing a Bean\n\nYou can grow your own plant at home! Here is how to grow a bean:\n\n1. Get a paper cup and fill it with soil\n2. Push a bean seed about 2 cm into the soil\n3. Water it gently — do not flood it!\n4. Place the cup on a sunny windowsill\n5. Water it a little bit every day\n6. Watch your bean grow over the next two weeks!\n\nFirst you will see a tiny green shoot push up through the soil. Then small leaves will appear. The stem will get taller and taller. In a few weeks, your bean plant might even grow flowers!'),
  fb(4, 'Plants need water, sunlight, ___ and air to grow. The ___ carry water from the soil up to the leaves.',
    ['soil', 'roots'],
    'Plants need four things: water, sunlight, soil, and air. The roots soak up water from the soil and the stem carries it up to the leaves, where the plant uses sunlight and air to make food.'),
  q(5, 'What will happen if you put a plant in a dark cupboard with no sunlight?',
    ['It will grow very fast', 'It will turn blue', 'It will not be able to make food and will not grow well', 'Nothing will happen'], 2,
    'Plants need sunlight to make food. Without sunlight, the plant cannot make the food it needs to grow. It will become weak, turn yellow, and might die.'),
  t(6, '### South African Indigenous Plants\n\nSouth Africa has many special plants that grow nowhere else in the world. These are called **indigenous plants** — they belong here naturally.\n\n**The Protea** — Our National Flower\n- The king protea is South Africa\'s national flower\n- It grows in the Western Cape in a special area called the fynbos\n- It has big, beautiful pink and white petals\n- You can see it on our money!\n\n**The Baobab Tree**\n- Baobab trees grow in Limpopo province\n- They have very thick trunks that store water\n- Some baobab trees are over 1 000 years old!\n- People call them "upside-down trees" because their branches look like roots sticking up into the sky\n\n**Spekboom**\n- Spekboom grows in the Eastern Cape\n- It has small, round, juicy leaves\n- It is very good at cleaning our air\n- You can even eat its leaves — they taste a little bit sour!\n\n**Aloe**\n- Aloes grow all over South Africa\n- They have thick, spiky leaves with a jelly inside\n- The jelly can help heal cuts and burns\n- Sunbirds love to drink nectar from aloe flowers'),
  q(7, 'Why is the baobab tree sometimes called an "upside-down tree"?',
    ['Because it grows underground', 'Because its branches look like roots sticking up', 'Because its leaves point downwards', 'Because it only grows in winter'], 1,
    'The baobab tree has a very fat trunk and its branches spread out at the top in a way that looks like roots sticking into the sky. This is why people say it looks like it has been planted upside-down!'),
  fb(8, 'The ___ is South Africa\'s national flower. The baobab tree stores water in its thick ___.',
    ['protea', 'trunk'],
    'The king protea is our national flower and grows in the fynbos of the Western Cape. The baobab tree has an enormously thick trunk that can store thousands of litres of water, helping it survive dry seasons in Limpopo.'),
  t(9, '### Summary\n\n- Plants have four main parts: **roots** (suck up water), **stem** (carries water), **leaves** (make food), and **flowers** (make seeds).\n- Plants need **water**, **sunlight**, **soil**, and **air** to grow.\n- You can grow a bean plant in a cup of soil on a sunny windowsill.\n- South Africa has special indigenous plants like the **protea**, **baobab tree**, **spekboom**, and **aloe**.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Animals (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Animals\n\n### Different Types of Animals\n\nThe world is full of amazing animals! Scientists sort animals into groups to help us learn about them. Here are the main groups:\n\n| Group | Body covering | How they breathe | Examples |\n|-------|-------------|-----------------|----------|\n| **Mammals** | Fur or hair | Lungs (breathe air) | Dogs, cats, elephants, whales |\n| **Birds** | Feathers | Lungs (breathe air) | Chickens, eagles, penguins |\n| **Reptiles** | Dry scales | Lungs (breathe air) | Snakes, lizards, crocodiles |\n| **Insects** | Hard outer shell | Tiny holes in body | Ants, bees, butterflies |\n| **Fish** | Wet scales | Gills (breathe in water) | Goldfish, sharks, sardines |\n\n**Mammals** are special because:\n- Mother mammals feed their babies milk\n- They have warm blood\n- Most have fur or hair on their bodies\n- You are a mammal too!'),
  q(2, 'What makes mammals different from other animals?',
    ['They can all fly', 'Mothers feed their babies milk', 'They all live in water', 'They lay eggs'], 1,
    'The special thing about mammals is that mother mammals feed their babies milk from their bodies. Mammals also have warm blood and most have fur or hair. Humans, dogs, and elephants are all mammals.'),
  t(3, '### Animal Body Parts\n\nAnimals have different body parts that help them survive:\n\n**Legs and Feet**\n- Dogs have four legs for running\n- Birds have two legs for walking and hopping\n- Insects have six legs for crawling\n- Snakes have no legs — they slither on their bellies!\n\n**Mouths and Beaks**\n- Lions have sharp teeth for tearing meat\n- Cows have flat teeth for chewing grass\n- Birds have beaks — each beak shape is good for different food\n- Butterflies have a long curly tongue for sipping nectar\n\n**Wings, Fins, and Tails**\n- Birds use wings to fly through the air\n- Fish use fins to swim through water\n- Monkeys use their tails to hold onto branches\n- Dogs wag their tails when they are happy!'),
  fb(4, 'Insects have ___ legs. Fish breathe through ___ instead of lungs.',
    ['six', 'gills'],
    'All insects have six legs — that is one way to tell if a creature is an insect. Fish live in water and breathe through gills, which take oxygen out of the water so the fish can breathe.'),
  q(5, 'How do snakes move if they have no legs?',
    ['They hop', 'They fly', 'They slither on their bellies', 'They roll'], 2,
    'Snakes have no legs at all. Instead, they move by slithering — they bend their long bodies from side to side and push against the ground to move forward. Their smooth scales help them slide along easily.'),
  t(6, '### What Animals Eat\n\nAnimals eat different kinds of food:\n\n| Type | What they eat | South African examples |\n|------|-------------|----------------------|\n| **Herbivores** | Only plants | Elephants, zebras, rabbits, springbok |\n| **Carnivores** | Only meat (other animals) | Lions, cheetahs, eagles, sharks |\n| **Omnivores** | Both plants and meat | Baboons, hadeda birds, pigs |\n\n### South African Animals\n\n**The Big Five** — These are five famous animals you can see on safari:\n1. **Lion** — the king of the bush, lives in a group called a pride\n2. **Leopard** — shy and sneaky, hides in trees\n3. **Elephant** — the biggest land animal, uses its trunk to drink and eat\n4. **Rhinoceros** — has a big horn on its nose, loves mud baths\n5. **Buffalo** — looks like a big cow, lives in large herds\n\n**Meerkats** live in the Kalahari Desert. They stand on their back legs to watch for danger. One meerkat always keeps lookout while the others eat. If it spots an eagle or a jackal, it makes a loud call and everyone hides underground!'),
  q(7, 'A springbok eats only grass and plants. What type of animal is it?',
    ['Carnivore', 'Herbivore', 'Omnivore', 'Insect'], 1,
    'An animal that eats only plants is called a herbivore. Springbok eat grass and small bushes in the South African veld. Herbivores have flat teeth that are good for chewing plants.'),
  fb(8, 'Animals that eat only meat are called ___. ___ stand on their back legs in the desert to watch for danger.',
    ['carnivores', 'Meerkats'],
    'Carnivores are meat-eaters like lions and cheetahs. They have sharp teeth for tearing meat. Meerkats live in groups in the Kalahari Desert and take turns standing guard to watch for predators like eagles and jackals.'),
  t(9, '### Summary\n\n- Animals are sorted into groups: **mammals**, **birds**, **reptiles**, **insects**, and **fish**.\n- Animals have different body parts (legs, beaks, wings, fins, tails) that help them survive.\n- **Herbivores** eat plants, **carnivores** eat meat, **omnivores** eat both.\n- South Africa\'s **Big Five** are the lion, leopard, elephant, rhinoceros, and buffalo.\n- **Meerkats** are clever animals that work together to stay safe in the Kalahari.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Animal Homes (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Animal Homes\n\n### Where Do Animals Live?\n\nJust like you live in a house, animals have homes too! An animal\'s home keeps it safe from danger and protects it from hot sun, cold wind, and rain.\n\nAnimals build or find many different types of homes:\n\n| Home | Who lives there | What it looks like |\n|------|----------------|-------------------|\n| **Nest** | Birds | Made of sticks, grass, and feathers, usually in a tree |\n| **Burrow** | Meerkats, rabbits, moles | A tunnel or hole dug underground |\n| **Hive** | Bees | Made of wax, hangs from trees or rocks |\n| **Dam** | Beavers | A wall of sticks built across a river |\n| **Web** | Spiders | Made of silk thread, used to catch food |\n| **Shell** | Tortoises, snails | A hard case the animal carries on its back |\n| **Cave** | Bats | A dark hole in a rock or mountain |\n\nSome animals do not build homes at all. Elephants, zebras, and springbok roam around the bush and sleep wherever they stop. They live in herds (big groups) for safety instead of having a fixed home.'),
  q(2, 'What kind of home does a meerkat live in?',
    ['A nest in a tree', 'A burrow underground', 'A hive made of wax', 'A web made of silk'], 1,
    'Meerkats dig burrows — tunnels and rooms underground in the Kalahari Desert sand. Their burrows keep them cool during the hot day and warm during the cold night. A meerkat family can have up to 15 entrances to their burrow system!'),
  t(3, '### Why Animals Need Shelter\n\nAnimals need homes for important reasons:\n\n1. **Protection from predators** — A rabbit hides in its burrow when a jackal is nearby. A tortoise pulls its head and legs into its shell when it senses danger.\n2. **Protection from weather** — A bird\'s nest keeps eggs dry when it rains. A mole\'s burrow stays cool when the sun is very hot.\n3. **A safe place to raise babies** — Birds lay eggs in nests and keep them warm until they hatch. Crocodiles build nests of leaves and mud near the river.\n4. **Storing food** — Squirrels hide nuts in tree holes for winter. Bees store honey in their hives.\n\n### How Animals Build Their Homes\n\n**The Weaver Bird** is one of South Africa\'s best builders. The male weaver bird:\n1. Tears long strips of grass with his beak\n2. Ties the grass around a branch to start the nest\n3. Weaves and knots the grass together using his beak and feet\n4. Makes a round nest with a small opening at the bottom\n5. The female checks the nest — if she does not like it, the male must start again!\n\nYou can see weaver bird nests hanging from trees near rivers and dams all over South Africa. They look like little grass baskets.'),
  fb(4, 'Animals need homes for protection from predators and ___. The ___ bird weaves a nest from grass that hangs from tree branches.',
    ['weather', 'weaver'],
    'Animals need shelter to stay safe from predators (animals that hunt them) and from bad weather like rain, hot sun, and cold wind. The weaver bird is famous in South Africa for building amazing hanging nests woven from strips of grass.'),
  q(5, 'Why does a tortoise pull its head and legs into its shell?',
    ['To go to sleep', 'To keep warm in winter', 'To protect itself from danger', 'To find food'], 2,
    'A tortoise\'s shell is its home AND its armour. When a tortoise senses danger — like a dog or a honey badger — it pulls its soft head and legs into the hard shell for protection. The predator cannot bite through the shell.'),
  t(6, '### Habitats in South Africa\n\nA **habitat** is the bigger area where animals live and find everything they need — food, water, and shelter. South Africa has many different habitats:\n\n**The Bushveld (Savanna)**\n- Warm grasslands with scattered trees\n- Found in Limpopo, Mpumalanga, and the Kruger National Park\n- Home to: lions, elephants, giraffes, zebras, wildebeest\n- Animals live in the open and drink from rivers and waterholes\n\n**The Ocean and Coast**\n- South Africa has over 2 500 km of coastline\n- The warm Indian Ocean (east coast) and cold Atlantic Ocean (west coast)\n- Home to: great white sharks, dolphins, seals, penguins at Boulders Beach\n\n**The Karoo (Semi-desert)**\n- Very dry, rocky area in the middle of South Africa\n- Home to: meerkats, tortoises, ostriches, bat-eared foxes\n- Animals must be very tough to survive the heat and lack of water\n\n**The Forest**\n- Cool, dark forests with tall trees\n- The Knysna Forest in the Garden Route\n- Home to: bushbuck, monkeys, beautiful birds like the Knysna turaco'),
  q(7, 'Which South African habitat would you find penguins in?',
    ['The Bushveld', 'The Karoo', 'The Forest', 'The Ocean and Coast'], 3,
    'African penguins live along the coast of South Africa, especially at Boulders Beach near Cape Town. They swim in the cold ocean water to catch fish and sardines, and come onto the rocky shore to rest and raise their chicks.'),
  fb(8, 'The Kruger National Park is in the ___ habitat. The Karoo is a very ___ area in the middle of South Africa.',
    ['bushveld', 'dry'],
    'The Kruger National Park is in the bushveld (savanna) of Limpopo and Mpumalanga, where grasslands and scattered trees provide a home for the Big Five. The Karoo is a semi-desert in central South Africa where very little rain falls.'),
  t(9, '### Summary\n\n- Animals live in different types of homes: **nests**, **burrows**, **hives**, **dams**, **webs**, **shells**, and **caves**.\n- Animals need shelter for **protection from predators**, **protection from weather**, **raising babies**, and **storing food**.\n- The **weaver bird** is an amazing nest builder in South Africa.\n- South Africa has many habitats: the **bushveld**, the **ocean and coast**, the **Karoo**, and **forests**.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Senses (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Our Senses\n\n### The Five Senses\n\nYour body has five amazing senses that help you understand the world around you. Each sense uses a special body part called a **sense organ**.\n\n| Sense | Sense organ | What it does |\n|-------|-----------|-------------|\n| **Sight** | Eyes | Let you see colours, shapes, and movement |\n| **Hearing** | Ears | Let you hear sounds — loud, soft, high, low |\n| **Touch** | Skin | Let you feel things — hot, cold, rough, smooth, soft, hard |\n| **Smell** | Nose | Let you smell things — nice smells and bad smells |\n| **Taste** | Tongue | Let you taste food — sweet, sour, salty, bitter |\n\nYour brain is like the boss! All five sense organs send messages to your brain. Your brain then tells you what you are seeing, hearing, touching, smelling, or tasting.\n\nFor example, when you bite into a juicy mango:\n- Your **eyes** see that it is orange and yellow\n- Your **nose** smells its sweet, fruity smell\n- Your **tongue** tastes that it is sweet\n- Your **skin** (fingers) feels that it is soft and slippery\n- Your **ears** hear the squelching sound as you chew!'),
  q(2, 'Which sense organ do you use to hear sounds?',
    ['Eyes', 'Nose', 'Ears', 'Tongue'], 2,
    'Your ears are the sense organs for hearing. They pick up sound waves and send messages to your brain so you can hear music, voices, birds singing, and all the other sounds around you.'),
  fb(3, 'Your ___ let you see and your ___ lets you feel things like hot, cold, and rough.',
    ['eyes', 'skin'],
    'Your eyes are the sense organs for sight — they let you see colours, shapes, and light. Your skin is the sense organ for touch — it is found all over your body and lets you feel temperature (hot or cold) and texture (rough or smooth).'),
  t(4, '### Exploring Our Senses\n\n**Taste** — Your tongue can taste four main flavours:\n- **Sweet** — sugar, honey, ripe fruit\n- **Sour** — lemon, vinegar, green apples\n- **Salty** — chips, biltong, sea water\n- **Bitter** — strong coffee, dark chocolate, some medicines\n\nTry this: hold your nose and taste a piece of apple. Then let go of your nose. Did you notice that food tastes better when you can smell it too? That is because **smell and taste work together**!\n\n**Touch** — Your skin can feel many things:\n- **Temperature** — hot (a warm cup of Rooibos tea), cold (an ice lolly on a hot day)\n- **Texture** — rough (sandpaper, tree bark), smooth (glass, a polished table)\n- **Pressure** — hard (someone squeezing your hand), soft (a gentle pat)\n\n**Sight** — Your eyes are amazing! They can:\n- See millions of different colours\n- See things that are very close and very far away\n- See in bright light and dim light (but not in the dark)\n\n**Hearing** — Your ears can tell the difference between:\n- **Loud** sounds (thunder, a drum) and **soft** sounds (a whisper, a mouse)\n- **High** sounds (a bird singing, a whistle) and **low** sounds (a lion roaring, thunder)'),
  q(5, 'If you hold your nose while eating, what happens to the taste of the food?',
    ['The food tastes better', 'The food tastes weaker because smell and taste work together', 'The food becomes spicy', 'Nothing changes'], 1,
    'When you hold your nose, you cannot smell the food. Because smell and taste work together to give you the full flavour, the food tastes much weaker and more boring without your sense of smell helping out.'),
  t(6, '### How Our Senses Keep Us Safe\n\nOur senses are not just for fun — they keep us safe every day!\n\n| Sense | How it keeps you safe | Example |\n|-------|---------------------|--------|\n| **Sight** | You see danger coming | You see a car coming and stop before crossing the road |\n| **Hearing** | You hear warning sounds | You hear a fire alarm and leave the building |\n| **Touch** | You feel pain to protect you | You touch a hot pot and pull your hand away quickly |\n| **Smell** | You smell danger | You smell smoke and know there might be a fire |\n| **Taste** | You taste when food is bad | Sour milk tastes horrible so you spit it out |\n\n**Pain** is an important feeling. When you touch something very hot, your skin sends a fast message to your brain: "OUCH! Move your hand!" This happens so quickly that you pull your hand away before you even think about it. Pain protects your body from getting badly hurt.\n\n### Taking Care of Our Sense Organs\n\n- **Eyes:** Do not look at the Sun. Read in good light. Wear sunglasses on bright days.\n- **Ears:** Do not listen to very loud music. Never push anything into your ears.\n- **Skin:** Wear sunscreen to protect from sunburn. Wear gloves when it is cold.\n- **Nose:** Do not push things up your nose. Blow your nose gently when you have a cold.\n- **Tongue:** Do not eat or drink things that are too hot. Brush your teeth to keep your mouth healthy.'),
  q(7, 'How does your sense of smell keep you safe?',
    ['It helps you see in the dark', 'It helps you smell smoke if there is a fire', 'It helps you run faster', 'It makes you stronger'], 1,
    'Your sense of smell can warn you of danger. If there is a fire, you will smell the smoke even before you see the flames. You might also smell gas leaking or food that has gone bad. These smells are warnings that help keep you safe.'),
  fb(8, 'When you touch something hot, you feel ___ which makes you pull your hand away quickly. Your tongue can taste sweet, sour, salty, and ___.',
    ['pain', 'bitter'],
    'Pain is your body\'s way of protecting you. When you touch something hot, the pain signal travels super-fast to your brain and you pull away before you get badly burned. Your tongue detects four main flavours: sweet, sour, salty, and bitter.'),
  t(9, '### Summary\n\n- We have **five senses**: sight, hearing, touch, smell, and taste.\n- Each sense uses a **sense organ**: eyes, ears, skin, nose, tongue.\n- All sense organs send messages to the **brain**.\n- **Smell and taste** work together to help us enjoy food.\n- Our senses **keep us safe** by warning us of danger (seeing cars, hearing alarms, feeling pain, smelling smoke, tasting bad food).\n- We must **take care** of our sense organs to keep them working well.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Materials (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Materials\n\n### What Are Materials?\n\nEverything you see is made from something. The "stuff" that things are made from is called a **material**. Your desk is made from wood. Your water bottle might be made from plastic. Your jersey is made from fabric.\n\nThere are many different materials around us:\n\n| Material | Where you find it |\n|----------|------------------|\n| **Wood** | Desks, doors, pencils, fences |\n| **Plastic** | Bottles, bags, toys, rulers |\n| **Metal** | Spoons, cars, coins, gates |\n| **Glass** | Windows, jars, mirrors, light bulbs |\n| **Fabric (cloth)** | Clothes, curtains, towels, bags |\n| **Rubber** | Tyres, erasers, gumboots, balloons |\n\nLook around your classroom right now — how many different materials can you spot? Your chair might be made of plastic AND metal. Your shoes have rubber soles and fabric on top. Many things are made from more than one material!'),
  q(2, 'What material is a window usually made from?',
    ['Wood', 'Plastic', 'Glass', 'Rubber'], 2,
    'Windows are made from glass because glass is transparent — you can see through it. Glass also lets sunlight come into your house while keeping the wind and rain outside.'),
  t(3, '### Properties of Materials\n\n**Properties** are the words we use to describe what a material is like. Here are some important properties:\n\n**Hard or Soft?**\n- A rock is **hard** — you cannot squash it\n- A sponge is **soft** — you can squeeze it easily\n- Your school desk is hard; your teddy bear is soft\n\n**Rough or Smooth?**\n- Sandpaper is **rough** — it feels bumpy\n- Glass is **smooth** — it feels flat and even\n- A brick wall is rough; a whiteboard is smooth\n\n**Waterproof or Not?**\n- **Waterproof** means water cannot go through it\n- Plastic is waterproof — that is why we use plastic bags\n- Rubber is waterproof — that is why we wear gumboots in the rain\n- Paper is NOT waterproof — if you pour water on paper, it gets soggy\n- Cotton is NOT waterproof — your T-shirt gets wet in the rain\n\n**Can you bend it?**\n- Rubber can bend — it is **flexible**\n- Glass cannot bend — it is **rigid** (and it will break if you try!)\n- A ruler made of plastic can bend a little, but a ruler made of metal stays straight'),
  fb(4, 'A sponge is ___ because you can squeeze it easily. Plastic is ___ because water cannot go through it.',
    ['soft', 'waterproof'],
    'Soft materials can be squeezed, bent, or squashed easily, like a sponge or cotton wool. Waterproof materials do not let water pass through them, like plastic and rubber — that is why raincoats and gumboots are made from these materials.'),
  q(5, 'Why do we wear gumboots when it rains?',
    ['Because they are soft and comfortable', 'Because rubber is waterproof and keeps our feet dry', 'Because they are very warm', 'Because they look nice'], 1,
    'Gumboots are made of rubber, and rubber is waterproof — it does not let water through. So when you walk through puddles with gumboots on, your feet stay nice and dry!'),
  t(6, '### Choosing the Right Material\n\nWhen people make things, they have to choose the right material for the job. They think about what properties they need.\n\n| Object | What property is needed | Best material |\n|--------|----------------------|---------------|\n| **Raincoat** | Waterproof, flexible | Plastic-coated fabric |\n| **Window** | See-through, hard | Glass |\n| **Blanket** | Soft, warm | Wool or fleece fabric |\n| **Cooking pot** | Hard, does not melt on heat | Metal |\n| **Eraser** | Soft, flexible | Rubber |\n| **Door** | Hard, strong | Wood or metal |\n\n**Think about it:** Why is a cooking pot NOT made from plastic? Because plastic would melt on the stove! Metal is much better because it can handle high heat without melting.\n\n**Why not make a blanket from metal?** Because metal is cold, hard, and rigid. A blanket needs to be soft, warm, and flexible so it can wrap around you.\n\n### Materials in South Africa\n\nMany homes in South Africa are made from bricks (baked clay), with metal roofs (zinc sheets) and glass windows. In the countryside, some traditional rondavels are made from **mud** (a natural material) with a grass-thatched roof. People use the materials that are easy to find nearby!'),
  q(7, 'Why would you NOT make a window from wood?',
    ['Wood is too heavy', 'Wood is not waterproof', 'You cannot see through wood', 'Wood breaks too easily'], 2,
    'Wood is opaque — you cannot see through it. A window needs to be transparent (see-through) so that light can come in and you can look outside. That is why glass is the best material for windows.'),
  fb(8, 'Materials that can bend are called ___. A cooking pot is made from ___ because it does not melt when heated.',
    ['flexible', 'metal'],
    'Flexible materials can bend without breaking, like rubber and some fabrics. Metal is used for cooking pots because it is hard, strong, and can handle very high temperatures without melting or catching fire, unlike plastic or wood.'),
  t(9, '### Summary\n\n- **Materials** are what things are made from (wood, plastic, metal, glass, fabric, rubber).\n- Materials have **properties**: hard/soft, rough/smooth, waterproof/not, flexible/rigid.\n- We choose materials based on the **properties** we need for the job.\n- A raincoat must be waterproof, a window must be see-through, a blanket must be soft.\n- Many things are made from **more than one material**.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Energy (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Energy\n\n### The Sun Gives Us Heat and Light\n\nThe **Sun** is the most important source of energy for our planet. It gives us:\n\n- **Light** — so we can see during the day\n- **Heat** — so we stay warm\n\nWithout the Sun, the Earth would be dark and freezing cold. No plants could grow, no animals could live, and there would be no food.\n\nThe Sun\'s energy is amazing:\n- It makes plants grow (plants use sunlight to make food)\n- It heats up the land and the sea\n- It makes water evaporate to form clouds (this gives us rain!)\n- It gives us sunny days to play outside\n\nBut the Sun can also be dangerous. In South Africa, the Sun is very strong, especially in summer. You must:\n- Wear a hat to protect your head\n- Put on sunscreen to protect your skin\n- Drink lots of water to stay hydrated\n- Try to stay in the shade between 11:00 and 15:00 when the Sun is strongest'),
  q(2, 'Why is the Sun so important for life on Earth?',
    ['It makes the sky blue', 'It gives us light and heat so plants can grow and we stay warm', 'It makes the wind blow', 'It gives us rain directly'], 1,
    'The Sun gives us light to see and heat to keep warm. Plants need sunlight to make food, and animals eat plants (or eat animals that eat plants). Without the Sun, there would be no light, no warmth, no plants, and no life on Earth.'),
  t(3, '### Sources of Energy\n\n**Energy** is what makes things work, move, or change. Energy comes from different places called **sources of energy**.\n\n**Food Gives Us Energy**\n- When you eat breakfast (like pap, bread, or cereal), the food gives your body energy\n- You need energy to run, jump, think, and even to breathe while you sleep!\n- Healthy food like fruit, vegetables, and mielies gives you good energy\n- Sweets and fizzy drinks give you quick energy that runs out fast\n\n**Batteries**\n- Batteries store energy inside them\n- They power your TV remote, torch, toy car, and phone\n- When a battery goes flat, it has run out of stored energy\n- We must recycle old batteries — do not throw them in the bin because they have harmful chemicals\n\n**Electricity**\n- Electricity powers lights, TVs, fridges, stoves, and heaters\n- In South Africa, most electricity comes from **Eskom** power stations that burn coal\n- Electricity travels through wires from the power station to your house\n- When the power goes off (load shedding), we cannot use electrical things'),
  fb(4, '___ gives your body the energy to run, jump, and think. In South Africa, most electricity comes from ___ power stations.',
    ['Food', 'Eskom'],
    'Food is your body\'s fuel — just like a car needs petrol, your body needs food for energy. Eskom is South Africa\'s electricity company and most of its power stations burn coal to generate electricity that travels through wires to our homes.'),
  q(5, 'What powers the remote control for your television?',
    ['Electricity from the wall', 'The Sun', 'Batteries', 'Wind'], 2,
    'A TV remote uses batteries. Batteries store energy inside them and release it slowly to power small devices. When the remote stops working, it usually means the batteries have gone flat and need to be replaced.'),
  t(6, '### Staying Safe with Electricity\n\nElectricity is very useful, but it can also be very **dangerous**. Electricity can hurt you badly or even kill you if you are not careful.\n\n**Safety Rules:**\n\n1. **NEVER** put your fingers or anything into a plug socket (wall outlet)\n2. **NEVER** touch electrical wires, especially if they are lying on the ground\n3. **NEVER** use electrical things near water (do not take your phone into the bath!)\n4. **NEVER** fly a kite near electricity power lines\n5. **NEVER** touch a switch or plug with wet hands\n6. **Tell an adult** if you see a broken plug, frayed wire, or sparks\n\n**What to do in an emergency:**\n- If someone gets an electric shock, do NOT touch them\n- Call an adult immediately\n- Call emergency services: **10111** (police) or **10177** (ambulance)\n\n### Saving Energy\n\nSouth Africa sometimes has **load shedding** — that means Eskom turns off the electricity for a few hours because there is not enough for everyone. We can all help by saving energy:\n\n- Switch off lights when you leave a room\n- Turn off the TV when nobody is watching\n- Close the fridge door quickly — do not stand there looking!\n- Use sunlight during the day instead of switching on lights'),
  q(7, 'Why should you NEVER use electrical things near water?',
    ['Because they will break', 'Because electricity and water together can give you a very dangerous shock', 'Because water makes noise', 'Because the plug will get dirty'], 1,
    'Water conducts (carries) electricity very well. If an electrical device falls into water while you are touching the water, the electricity can flow through the water and into your body, giving you a very dangerous electric shock.'),
  fb(8, 'You should NEVER put your fingers into a plug ___. We save energy by switching off ___ when we leave a room.',
    ['socket', 'lights'],
    'Plug sockets carry mains electricity, which is extremely dangerous. Putting fingers or objects into a socket can give you a terrible electric shock. Switching off lights and appliances when not in use saves electricity and helps reduce load shedding in South Africa.'),
  t(9, '### Summary\n\n- The **Sun** gives us heat and light — it is the most important energy source.\n- **Food** gives our bodies energy. **Batteries** store energy. **Electricity** powers our homes.\n- Most electricity in South Africa comes from Eskom coal power stations.\n- Electricity is **dangerous** — never touch sockets, bare wires, or use electrical things near water.\n- We must **save energy** by switching off lights and appliances we are not using.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Sound (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Sound\n\n### How Are Sounds Made?\n\nEvery sound you hear is made by something **vibrating** — that means moving back and forth very quickly.\n\n**Try this:**\n- Put your hand on your throat and hum. Can you feel the buzzing? That is your vocal cords vibrating!\n- Pluck a rubber band stretched around a box. Watch it wobble back and forth — that wobbling makes the sound.\n- Tap a desk with your pencil. The desk vibrates and makes a tapping sound.\n\nWhen something vibrates, it makes the air around it vibrate too. These vibrations travel through the air like invisible waves until they reach your ears. Your ears pick up the vibrations, and your brain tells you what sound it is.\n\n**No vibration = no sound.** If nothing is vibrating, everything is silent.\n\n### How Sound Travels\n\nSound vibrations travel through the air to our ears. But sound can also travel through other things:\n\n- **Through water** — that is how whales talk to each other in the ocean!\n- **Through solid objects** — put your ear on a desk and tap the other end. The sound is louder because it travels well through solid things.\n\nSound cannot travel through empty space (a vacuum). That is why there is no sound in outer space — if you were on the Moon, you would not hear anything!'),
  q(2, 'What must happen for a sound to be made?',
    ['Something must be coloured', 'Something must vibrate (move back and forth quickly)', 'Something must be very hot', 'Something must be very large'], 1,
    'Every single sound is made by vibrations — something moving back and forth very quickly. When you speak, your vocal cords vibrate. When you bang a drum, the drum skin vibrates. No vibration means no sound!'),
  fb(3, 'Sounds are made when something ___. Sound vibrations travel through the ___ to reach our ears.',
    ['vibrates', 'air'],
    'Vibrating means moving back and forth very quickly. When an object vibrates, it pushes the air particles next to it, and those push the next air particles, creating a wave of vibrations that travels through the air to your ears.'),
  t(4, '### Loud and Soft Sounds\n\nSome sounds are **loud** and some are **soft** (quiet).\n\n| Loud sounds | Soft sounds |\n|------------|------------|\n| A lion roaring | A cat purring |\n| Thunder during a storm | Rain gently falling |\n| A drum being banged hard | A whisper |\n| A car hooting | A clock ticking |\n| Fireworks | Turning a page |\n\n**What makes a sound loud or soft?**\n- When something vibrates **a lot** (big vibrations), the sound is **loud**\n- When something vibrates **a little** (small vibrations), the sound is **soft**\n\nTry tapping your desk gently — it makes a soft sound. Now tap it hard — the sound is much louder! That is because the bigger tap makes bigger vibrations.\n\n### High and Low Sounds\n\nSounds can also be **high** or **low**.\n\n| High sounds | Low sounds |\n|------------|------------|\n| A whistle | A drum |\n| A bird tweeting | A lion growling |\n| A baby crying | Thunder rumbling |\n| A violin | A big bass guitar |\n\n**What makes a sound high or low?**\n- When something vibrates **fast**, the sound is **high** (like a bird singing)\n- When something vibrates **slowly**, the sound is **low** (like a big drum booming)'),
  q(5, 'What makes a sound louder?',
    ['Making it higher', 'Bigger vibrations', 'Making it lower', 'Smaller vibrations'], 1,
    'Louder sounds are made by bigger vibrations. When you hit a drum harder, you create bigger vibrations in the drum skin, which push more air, and you hear a louder sound. Gentle tapping creates small vibrations and a soft, quiet sound.'),
  t(6, '### Musical Instruments\n\nMusical instruments make sounds in different ways:\n\n| How they make sound | Instrument | What vibrates |\n|-------------------|-----------|---------------|\n| **Hitting/tapping** | Drum, xylophone, marimba | The skin of the drum or the wooden bars |\n| **Plucking/strumming** | Guitar, uhadi (Xhosa bow) | The strings vibrate |\n| **Blowing** | Flute, vuvuzela, whistle | The air inside vibrates |\n| **Shaking** | Shakers, rattles, tambourine | Beads or small objects inside vibrate |\n\n### South African Instruments\n\nSouth Africa has wonderful traditional instruments:\n\n- **Vuvuzela** — the famous plastic horn that makes a loud, buzzy sound. It became world-famous during the 2010 FIFA World Cup in South Africa!\n- **Djembe drum** — a wooden drum with an animal skin top, played with your hands\n- **Uhadi** — a traditional Xhosa bow instrument played by tapping and humming\n- **Marimba** — wooden bars that you hit with mallets to make beautiful melodies\n\n### Make Your Own Instrument!\n\nYou can make instruments at home:\n- **Drum:** Stretch a plastic bag over a tin can and tap it\n- **Guitar:** Stretch rubber bands of different thicknesses around a box — thicker bands make lower sounds!\n- **Shaker:** Put dried beans in a plastic bottle and shake it\n- **Flute:** Blow across the top of an empty glass bottle'),
  q(7, 'What South African instrument became world-famous during the 2010 FIFA World Cup?',
    ['The marimba', 'The djembe drum', 'The vuvuzela', 'The uhadi'], 2,
    'The vuvuzela is a long plastic horn that makes a very loud buzzing sound. It became famous around the world during the 2010 FIFA World Cup, which was held in South Africa — the first World Cup ever held on the African continent!'),
  fb(8, 'A drum makes sound when the drum skin ___. Thick rubber bands make ___ sounds and thin rubber bands make high sounds.',
    ['vibrates', 'low'],
    'When you hit a drum, the drum skin vibrates (moves back and forth) and pushes the air to create sound waves. Thicker, heavier things vibrate more slowly and make lower sounds. Thinner, lighter things vibrate faster and make higher sounds.'),
  t(9, '### Summary\n\n- All sounds are made by **vibrations** (something moving back and forth quickly).\n- Sound travels through **air**, **water**, and **solids** — but not through empty space.\n- **Big vibrations** = loud sounds. **Small vibrations** = soft sounds.\n- **Fast vibrations** = high sounds. **Slow vibrations** = low sounds.\n- Musical instruments make sound by hitting, plucking, blowing, or shaking.\n- South African instruments include the **vuvuzela**, **djembe drum**, **uhadi**, and **marimba**.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Movement (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Movement\n\n### Push and Pull\n\nThings do not move on their own — they need a **force** to make them move. The two main forces you use every day are **push** and **pull**.\n\n**A push** moves something away from you:\n- Pushing a shopping trolley at Shoprite\n- Kicking a soccer ball\n- Pushing a friend on a swing\n- Closing a drawer\n\n**A pull** moves something towards you:\n- Pulling open a door\n- Pulling a wagon or a toy on a string\n- Pulling on your socks in the morning\n- Reeling in a fishing line\n\nForces can do three things:\n1. **Start** something moving — kick a ball that is standing still\n2. **Stop** something moving — catch a ball that is flying through the air\n3. **Change direction** — hit a tennis ball back the other way\n\nSome forces are bigger than others. It takes a small force to push a toy car, but a very big force to push a real car!'),
  q(2, 'Which of these is an example of a PULL?',
    ['Kicking a ball', 'Pushing a trolley', 'Opening a drawer', 'Closing a door'], 2,
    'Opening a drawer is a pull because you move the drawer towards you. Kicking a ball and pushing a trolley are pushes because you move them away from you. Closing a door can be either a push or a pull depending on which side you are on!'),
  fb(3, 'A ___ moves something away from you. A ___ moves something towards you.',
    ['push', 'pull'],
    'A push is a force that moves something away from you, like pushing a trolley. A pull is a force that moves something towards you, like pulling open a door or tugging on a rope. Push and pull are the two basic forces we use every day.'),
  t(4, '### Fast and Slow\n\nThings move at different speeds:\n\n**Fast movers:**\n- A cheetah running (the fastest land animal — over 100 km per hour!)\n- A car on the highway\n- A ball kicked hard\n- Lightning\n\n**Slow movers:**\n- A tortoise walking\n- A snail sliding along\n- A plant growing\n- The hour hand on a clock\n\n**What makes things go faster?**\n- A bigger push or pull makes things go faster\n- A gentle push on a swing = slow. A hard push = fast!\n- A gentle kick of a ball = slow roll. A hard kick = the ball flies!\n\n### Wheels Help Us Move\n\nWheels are one of the most important inventions ever! Wheels make it much easier to move things.\n\n**Try this:** Imagine pushing a heavy box across the floor. Now imagine putting the box on a trolley with wheels. Which is easier? The trolley, of course!\n\nWheels are everywhere:\n- Cars, buses, taxis, and trains\n- Bicycles and scooters\n- Shopping trolleys\n- Wheelbarrows\n- Wheelchairs\n- Even your school bag might have wheels!\n\nWheels work by **reducing friction** (the rubbing force that slows things down). Instead of scraping across the floor, the object rolls smoothly on wheels.'),
  q(5, 'Why is it easier to move a heavy box on a trolley with wheels?',
    ['Because the box gets lighter', 'Because wheels reduce friction and let the box roll instead of scrape', 'Because trolleys are magnetic', 'Because the box shrinks'], 1,
    'Wheels reduce friction — the rubbing force between the box and the floor. Without wheels, the box scrapes across the floor and friction makes it very hard to push. With wheels, the box rolls smoothly and you need much less force to move it.'),
  t(6, '### Ramps\n\nA **ramp** is a flat surface that is slanted (tilted). Ramps make it easier to move things up and down.\n\nImagine you need to get a heavy wheelbarrow up some steps. Very hard! But if you put a plank of wood against the steps to make a ramp, you can push the wheelbarrow up smoothly.\n\n**Where do we use ramps?**\n- Wheelchair ramps at buildings and shopping centres\n- Ramps for loading heavy things onto trucks (bakkie)\n- Slides at the playground (a slide is a ramp for fun!)\n- Driveways that go from the road up to a garage\n\n### Simple Machines Around Us\n\nPeople use **simple machines** to make work easier. You use them every day without even knowing!\n\n| Simple machine | What it does | Example |\n|---------------|-------------|--------|\n| **Ramp (inclined plane)** | Makes it easier to move things up | Wheelchair ramp, slide |\n| **Wheel** | Reduces friction, makes moving easier | Bicycle, trolley |\n| **Lever** | Helps lift heavy things | See-saw, bottle opener |\n| **Pulley** | Helps lift things up high | Flagpole rope, well bucket |\n\nA **see-saw** is a lever. When your friend sits on one end, you push down on the other end and your friend goes up. You are using a simple machine to lift your friend!'),
  q(7, 'What is a ramp used for?',
    ['To stop things from moving', 'To make it easier to move things up or down', 'To make things heavier', 'To make sounds louder'], 1,
    'A ramp is a slanted surface that makes it easier to move heavy things from a low place to a high place (or down again). Instead of lifting something straight up, you push it along the slanted surface, which takes less force.'),
  fb(8, 'A see-saw is an example of a simple machine called a ___. Ramps make it easier to move things ___ and down.',
    ['lever', 'up'],
    'A see-saw works as a lever — when one side goes down, the other side goes up, making it easier to lift a heavy person. Ramps are inclined planes that let you push heavy objects upward gradually instead of lifting them straight up.'),
  t(9, '### Summary\n\n- A **push** moves something away from you. A **pull** moves something towards you.\n- Forces can **start**, **stop**, or **change the direction** of movement.\n- A bigger force makes things move **faster**.\n- **Wheels** reduce friction and make it easier to move things.\n- **Ramps** make it easier to move things up and down.\n- **Simple machines** (wheels, ramps, levers, pulleys) make work easier.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Weather (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Weather\n\n### Types of Weather\n\n**Weather** is what it is like outside right now — is it sunny, rainy, windy, or cold? Weather changes from day to day and from place to place.\n\nHere are the main types of weather:\n\n| Weather | What it looks like | How it feels |\n|---------|-------------------|-------------|\n| **Sunny** | Bright blue sky, the Sun is shining | Warm or hot |\n| **Cloudy** | Grey clouds cover the sky | Cool, sometimes gloomy |\n| **Rainy** | Water falls from the clouds | Wet and often cool |\n| **Windy** | Trees sway, papers blow away | You can feel the air moving |\n| **Stormy** | Dark clouds, thunder, lightning, heavy rain | Scary, dangerous |\n| **Cold/Frosty** | Clear sky but very cold, sometimes frost on the grass | Freezing, shivery |\n| **Hot** | Bright Sun, no clouds | Very warm, sweaty |\n\nIn South Africa, different parts of the country can have different weather at the same time. While it might be raining in Cape Town, it could be hot and sunny in Durban!'),
  q(2, 'What type of weather has dark clouds, thunder, and lightning?',
    ['Sunny', 'Cloudy', 'Windy', 'Stormy'], 3,
    'Stormy weather brings dark clouds, thunder (the loud booming sound), lightning (bright flashes of light), and usually heavy rain. Storms can be scary and dangerous — you should always go inside during a thunderstorm.'),
  fb(3, 'Weather tells us what it is like ___. When the sky is grey and water falls from clouds, the weather is ___.',
    ['outside', 'rainy'],
    'Weather describes the conditions outside at a particular time — things like temperature (hot or cold), whether it is raining or sunny, and whether the wind is blowing. Rainy weather means water droplets are falling from the clouds.'),
  t(4, '### Measuring Weather\n\nWe can measure the weather using special tools:\n\n**Temperature** — how hot or cold it is\n- We use a **thermometer** to measure temperature\n- Temperature is measured in **degrees Celsius** (°C)\n- A hot summer day in Pretoria might be 35°C\n- A cold winter morning in Johannesburg might be 2°C\n- Water freezes at 0°C and boils at 100°C\n\n**Rainfall** — how much rain falls\n- We use a **rain gauge** to measure rainfall\n- A rain gauge is a container that catches rain so we can see how many millimetres fell\n- You can make one at home with a plastic bottle cut in half!\n\n**Wind** — how fast the air is moving\n- A **wind vane** shows which direction the wind comes from\n- A **windsock** (like you see at airports) shows wind direction and strength\n\n### You Can Be a Weather Watcher!\n\nMake a weather chart for a week:\n- Every morning, look outside and draw a picture of the weather\n- Use a thermometer to check the temperature\n- At the end of the week, count how many sunny, cloudy, rainy, and windy days you had'),
  q(5, 'What tool do we use to measure how hot or cold it is?',
    ['A rain gauge', 'A wind vane', 'A thermometer', 'A ruler'], 2,
    'A thermometer measures temperature — how hot or cold something is. Temperature is measured in degrees Celsius (°C). You might have a thermometer at home or at school, and your parents use one to check your temperature if you feel sick.'),
  t(6, '### Seasons in South Africa\n\nSouth Africa has four seasons:\n\n| Season | Months | Weather | What happens |\n|--------|--------|---------|-------------|\n| **Summer** | December, January, February | Hot, often rainy (in most of SA) | School holidays, swimming, Christmas, braais |\n| **Autumn** | March, April, May | Getting cooler, leaves change colour | Easter, back to school |\n| **Winter** | June, July, August | Cold and dry (in most of SA) | Warm clothes, fireplaces, sometimes frost |\n| **Spring** | September, October, November | Getting warmer, flowers start blooming | Jacaranda trees bloom purple in Pretoria, baby animals are born |\n\n**Important:** Seasons in South Africa are the OPPOSITE of Europe and America! When we have summer (December), they have winter. When we have winter (June), they have summer.\n\n**Different weather in different places:**\n- **Cape Town** has wet winters and dry summers (the opposite of the rest of SA!)\n- **Durban** is warm and humid (sticky) all year round\n- **Johannesburg** has warm summers with afternoon thunderstorms and cold, dry winters\n- **The Highveld** sometimes gets frost and even snow in winter'),
  q(7, 'In which months is it summer in South Africa?',
    ['June, July, August', 'September, October, November', 'December, January, February', 'March, April, May'], 2,
    'Summer in South Africa is in December, January, and February. This is the opposite of countries in the Northern Hemisphere (like England or America), where these months are winter. That is why we celebrate Christmas in the summertime!'),
  fb(8, 'South Africa has ___ seasons. When it is summer in South Africa, it is ___ in Europe.',
    ['four', 'winter'],
    'South Africa has four seasons: summer (December to February), autumn (March to May), winter (June to August), and spring (September to November). Our seasons are opposite to the Northern Hemisphere — when we enjoy summer, Europeans are having winter.'),
  t(9, '### What We Wear in Different Weather\n\nWe wear different clothes for different weather:\n\n| Weather | What to wear |\n|---------|-------------|\n| **Hot and sunny** | Light clothes (shorts, T-shirt), hat, sunglasses, sandals |\n| **Rainy** | Raincoat, gumboots, umbrella |\n| **Cold** | Warm jersey, jacket, beanie, scarf, gloves, long pants, closed shoes |\n| **Windy** | Windbreaker jacket, clothes that will not blow up! |\n\n**Remember:** It is important to dress right for the weather. Wearing a thick jersey on a hot day will make you feel sick. Not wearing a jacket on a cold day can make you catch a cold.\n\n### Summary\n\n- Weather describes what it is like outside: sunny, cloudy, rainy, windy, stormy, hot, cold.\n- We measure weather with a **thermometer** (temperature), **rain gauge** (rainfall), and **wind vane** (wind direction).\n- South Africa has **four seasons**: summer, autumn, winter, spring.\n- Different parts of South Africa have **different weather** at the same time.\n- We choose our **clothes** based on the weather.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Water (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Water\n\n### Uses of Water\n\nWater is one of the most important things on Earth. We use water every single day for many things:\n\n**At home:**\n- Drinking — your body needs about 6 to 8 glasses of water every day\n- Cooking — boiling rice, making soup, steaming vegetables\n- Washing — bathing, brushing teeth, washing hands, doing laundry\n- Cleaning — mopping floors, washing dishes, cleaning the house\n- Flushing the toilet\n\n**At school:**\n- Drinking from the water fountain\n- Washing hands before eating\n- Watering the school garden\n\n**For animals and plants:**\n- Animals drink water from rivers, dams, and water troughs\n- Plants need water through their roots to stay alive and grow\n- Fish live in water — it is their home!\n\n**For farming:**\n- South African farmers need water to grow mielies, wheat, fruit, and vegetables\n- Animals on farms need water to drink\n- Without water, crops die and there would be no food in the shops'),
  q(2, 'About how many glasses of water should you drink every day?',
    ['1 to 2', '6 to 8', '15 to 20', '100'], 1,
    'Your body needs about 6 to 8 glasses of water every day to stay healthy. Water helps your body work properly — it keeps your blood flowing, your brain thinking, your muscles working, and your body cool.'),
  t(3, '### Where Does Water Come From?\n\nThe water that comes out of your tap has been on a long journey!\n\n**Rain** is where most of our fresh water starts. Rain falls from the clouds and:\n- Flows into **rivers** — like the Vaal, Orange, and Limpopo rivers\n- Collects in **dams** — like the Vaal Dam, Gariep Dam, and Hartbeespoort Dam\n- Soaks into the ground and becomes **underground water**\n\n**From rivers and dams to your tap:**\n1. Water is collected from rivers and dams\n2. It goes to a **water treatment plant** where it is cleaned\n3. Dirt, germs, and bad things are removed\n4. Clean water travels through **pipes** under the ground\n5. It arrives at your house — ready to drink from the tap!\n\nIn some parts of South Africa, especially in rural areas, people do not have taps in their homes. They must collect water from rivers, boreholes (deep holes dug to reach underground water), or communal taps. This water may not always be clean or safe to drink.'),
  fb(4, 'Rain collects in rivers and ___. Before water reaches your tap, it is cleaned at a water ___ plant.',
    ['dams', 'treatment'],
    'Rainwater flows into rivers and is stored in large dams. Before it reaches your home, the water goes to a water treatment plant where dirt, germs, and harmful substances are removed. Then the clean water travels through underground pipes to your tap.'),
  q(5, 'What is a borehole?',
    ['A hole in a bucket', 'A deep hole dug to reach underground water', 'A type of river', 'A water bottle'], 1,
    'A borehole is a deep hole drilled into the ground to reach water that is stored underground. In many rural parts of South Africa where there are no pipes or taps, people use boreholes and hand pumps to get drinking water.'),
  t(6, '### Saving Water\n\nSouth Africa is a **water-scarce country** — that means we do not have as much water as many other countries. We must all save water!\n\n**Easy ways to save water:**\n\n1. **Turn off the tap** while brushing your teeth — do not let the water run!\n2. **Take short showers** instead of baths (a bath uses much more water)\n3. **Fix dripping taps** — a dripping tap wastes thousands of litres a year!\n4. **Water the garden** in the early morning or evening, not in the hot afternoon when water evaporates quickly\n5. **Use a bucket** to wash the car, not a hosepipe\n6. **Collect rainwater** in a tank or bucket — use it to water plants\n7. **Only flush when you need to** — remember the saying: "If it\'s yellow, let it mellow!"\n\n**Did you know?** During the 2018 water crisis in Cape Town, people were only allowed to use 50 litres of water per day. That is about one bathtub full — for ALL your drinking, washing, cooking, and flushing! Capetonians learned to save every drop.'),
  q(7, 'Why must South Africans save water?',
    ['Because water is very expensive', 'Because South Africa is a water-scarce country with less water than we need', 'Because saving water is a school rule', 'Because water tastes bad'], 1,
    'South Africa is a water-scarce country, which means we receive less rainfall than many other countries and our rivers and dams do not always have enough water for everyone. If we waste water, our dams can run dangerously low, as happened during the Cape Town water crisis in 2018.'),
  fb(8, 'South Africa is a water-___ country. A dripping tap wastes ___ of litres of water every year.',
    ['scarce', 'thousands'],
    'South Africa is water-scarce — we get less rain than the world average and must be very careful with our water. A single dripping tap can waste thousands of litres per year, which is why it is important to fix leaks as soon as possible.'),
  t(9, '### Clean and Dirty Water and the Water Cycle\n\n**Clean water** is safe to drink — it is clear, has no smell, and has no germs. Tap water that has been treated is clean water.\n\n**Dirty water** is NOT safe to drink. It can contain:\n- **Germs** that cause sickness (cholera, diarrhoea)\n- **Dirt and mud** from the ground\n- **Chemicals** from factories\n- **Litter** that people throw into rivers\n\n**Always** drink clean water from the tap or a sealed bottle. NEVER drink water from a river, pond, or puddle.\n\n### The Water Cycle (Simple)\n\nWater goes around and around in a never-ending journey called the **water cycle**:\n\n1. **The Sun heats water** in oceans, rivers, and dams\n2. **Water evaporates** — it turns into invisible water vapour and rises into the sky\n3. **Water vapour cools** high up in the sky and turns into tiny water droplets — this makes **clouds** (condensation)\n4. **Clouds get heavy** with water and the water falls back down as **rain** (precipitation)\n5. **Rain flows** into rivers and dams, and the cycle starts all over again!\n\nThe water you drink today might be the same water a dinosaur drank millions of years ago — it just keeps going around and around!\n\n### Summary\n\n- We use water for drinking, cooking, washing, cleaning, farming, and more.\n- Water comes from **rain** and is stored in **rivers**, **dams**, and **underground**.\n- South Africa is **water-scarce** — we must all save water every day.\n- **Clean water** is safe; **dirty water** has germs and can make you sick.\n- The **water cycle** moves water around: evaporation → condensation → precipitation → collection.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Database insertion
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

  // Find or create Natural Sciences subject
  const subjectDoc = await db.collection('subjects').findOne({
    name: /Natural.*Sci/i,
    schoolId: SCHOOL_ID,
  });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Natural Sciences subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Natural Sciences',
      code: 'NS',
      schoolId: SCHOOL_ID,
      gradeIds: [GRADE_ID],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Natural Sciences subject:', String(SUBJECT_ID));
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
    tags: ['grade-3', 'natural-sciences', 'caps'],
    aiModel: '',
    aiPrompt: '',
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    difficulty: 2,
    estimatedMinutes: 25,
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
      title: 'Chapter 1: Plants',
      description: 'Parts of a plant, what plants need to grow, growing a bean, South African indigenous plants.',
      order: 1,
      lessons: [
        { title: 'Plants', description: 'Parts of a plant (roots, stem, leaves, flowers), what plants need to grow (water, sunlight, soil, air), how to grow a bean, and South African indigenous plants (protea, baobab, spekboom, aloe).', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Animals',
      description: 'Types of animals (mammals, birds, reptiles, insects, fish), body parts, how they move, what they eat, SA animals.',
      order: 2,
      lessons: [
        { title: 'Animals', description: 'Different groups of animals (mammals, birds, reptiles, insects, fish), animal body parts (legs, beaks, wings, fins, tails), how animals move, what animals eat (herbivores, carnivores, omnivores), and South African animals (Big Five, meerkats).', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Animal Homes',
      description: 'Where animals live (nests, burrows, hives, webs), why animals need shelter, habitats in South Africa.',
      order: 3,
      lessons: [
        { title: 'Animal Homes', description: 'Types of animal homes (nests, burrows, hives, dams, webs, shells, caves), why animals need shelter, how the weaver bird builds its nest, and South African habitats (bushveld, ocean and coast, Karoo, forests).', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Senses',
      description: 'Five senses (sight, hearing, touch, smell, taste), sense organs, exploring our senses, how senses keep us safe.',
      order: 4,
      lessons: [
        { title: 'Our Senses', description: 'The five senses and their sense organs (eyes, ears, skin, nose, tongue), exploring taste, touch, sight, and hearing, how smell and taste work together, how senses keep us safe, and taking care of our sense organs.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Materials',
      description: 'Different materials (wood, plastic, metal, glass, fabric, rubber), properties (hard/soft, rough/smooth, waterproof), choosing the right material.',
      order: 5,
      lessons: [
        { title: 'Materials', description: 'Common materials (wood, plastic, metal, glass, fabric, rubber), material properties (hard/soft, rough/smooth, waterproof/not, flexible/rigid), choosing the right material for the job, and materials in South Africa.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Energy',
      description: 'The Sun gives us heat and light, sources of energy (food, batteries, electricity), staying safe with electricity.',
      order: 6,
      lessons: [
        { title: 'Energy', description: 'The Sun as our main energy source (light and heat), food gives our bodies energy, batteries store energy, electricity powers our homes, Eskom and load shedding, electricity safety rules, and saving energy.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Sound',
      description: 'How sounds are made (vibrations), loud/soft, high/low, musical instruments, making your own instruments.',
      order: 7,
      lessons: [
        { title: 'Sound', description: 'Sounds are made by vibrations, how sound travels through air, water, and solids, loud and soft sounds (big and small vibrations), high and low sounds (fast and slow vibrations), musical instruments, and South African instruments (vuvuzela, djembe, uhadi, marimba).', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Movement',
      description: 'Push and pull, fast and slow, wheels help us move, ramps, simple machines around us.',
      order: 8,
      lessons: [
        { title: 'Movement', description: 'Push and pull forces, what forces can do (start, stop, change direction), fast and slow movement, wheels reduce friction, ramps make lifting easier, and simple machines (wheels, ramps, levers, pulleys).', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Weather',
      description: 'Types of weather, measuring weather (temperature, rainfall), seasons in South Africa, what we wear.',
      order: 9,
      lessons: [
        { title: 'Weather', description: 'Types of weather (sunny, cloudy, rainy, windy, stormy, cold, hot), measuring weather with thermometers and rain gauges, four seasons in South Africa, different weather in different parts of SA, and dressing for the weather.', blocks: ch9_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 10: Water',
      description: 'Uses of water, where water comes from, saving water, clean and dirty water, the water cycle.',
      order: 10,
      lessons: [
        { title: 'Water', description: 'Uses of water (drinking, cooking, washing, farming), where water comes from (rain, rivers, dams, boreholes), saving water in water-scarce South Africa, clean vs dirty water, the water cycle (evaporation, condensation, precipitation, collection).', blocks: ch10_lesson1, term: 4 },
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

  // Create textbook
  const textbook = await db.collection('textbooks').insertOne({
    title: 'Grade 3 Natural Sciences \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Plants, Animals, Animal Homes, Senses, Materials, Energy, Sound, Movement, Weather, and Water for the Grade 3 Natural Sciences and Technology curriculum.',
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
  console.log('  TEXTBOOK: Grade 3 Natural Sciences');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
