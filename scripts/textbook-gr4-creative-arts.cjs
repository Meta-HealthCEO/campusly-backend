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

// ===============================================================================
// CHAPTER 1: Visual Arts — Lines and Shapes (Term 1)
// ===============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Lines and Shapes\n\nWelcome to Grade 4 Creative Arts! Art is all around us — in the colourful houses of Bo-Kaap in Cape Town, the beadwork of Zulu crafts, and the patterns on Ndebele walls. Today we start by learning about **lines** and **shapes**, the building blocks of every drawing and painting.\n\n### What Is a Line?\n\nA **line** is a mark made by a pencil, crayon, or paintbrush as it moves across the page. Lines can look very different depending on how you draw them.\n\n### Types of Lines\n\n| Line Type | What It Looks Like | Where You See It |\n|-----------|-------------------|------------------|\n| **Straight** | Goes in one direction without bending | The edge of a ruler, a fence post |\n| **Curved** | Bends gently like a smile | A rainbow, the top of a hill |\n| **Wavy** | Goes up and down like the sea | Ocean waves, a snake moving |\n| **Zigzag** | Sharp points going up and down | Mountains, a saw blade |\n| **Thick** | A wide, heavy line | The trunk of a tree |\n| **Thin** | A narrow, light line | A spider web, a strand of hair |\n\nWhen you look at the world around you, lines are everywhere! The branches of a thorn tree make zigzag lines. The hills of KwaZulu-Natal make curved lines against the sky.'),
  q(2, 'Which type of line bends gently like a rainbow?',
    ['Straight', 'Zigzag', 'Curved', 'Wavy'], 2,
    'A curved line bends smoothly without sharp corners, just like a rainbow arching across the sky.',
    ['Think about the shape of a rainbow.']),
  t(3, '### Lines Can Show Feelings\n\nDifferent lines can make people feel different things:\n- **Straight lines** feel calm and strong — like a tall building or a flagpole\n- **Curved lines** feel soft and gentle — like rolling hills or a river\n- **Zigzag lines** feel exciting and sharp — like lightning in a thunderstorm\n- **Wavy lines** feel relaxed and flowing — like the ocean on a warm day\n\nArtists choose their lines carefully to create a mood in their artwork.\n\n### Shapes All Around Us\n\nA **shape** is a flat area with edges. When lines connect and close up, they make shapes.\n\n**Basic shapes you should know:**\n\n| Shape | How Many Sides? | What It Looks Like |\n|-------|-----------------|-------------------|\n| **Circle** | 0 (no straight sides) | A ball, the sun, a coin |\n| **Square** | 4 equal sides | A window, a dice face |\n| **Triangle** | 3 sides | A roof, a slice of pizza |\n| **Rectangle** | 4 sides (2 long, 2 short) | A door, a book, a brick |\n| **Oval** | 0 (no straight sides) | An egg, a rugby ball |\n\nThese are called **geometric shapes** because they have neat, even edges.'),
  fb(4, 'A shape with three sides is called a ___. A shape that looks like an egg is called an ___.',
    ['triangle', 'oval'],
    'A triangle has exactly three sides and three corners. An oval is a stretched circle that looks like an egg.'),
  t(5, '### Shapes in South African Art\n\nSouth African artists use shapes in amazing ways:\n\n**Ndebele house painting** uses bold geometric shapes — rectangles, triangles, and diamonds — painted in bright colours. The Ndebele women of Mpumalanga are famous for decorating their homes with these beautiful patterns.\n\n**Zulu shields** are oval-shaped and are an important part of Zulu culture and history.\n\n**San rock art** found in the Drakensberg mountains shows people and animals made from simple shapes. Some of these drawings are thousands of years old!\n\n### Drawing with Lines and Shapes\n\nYou can draw almost anything by combining simple shapes:\n- A **house**: rectangle + triangle on top + small square windows\n- A **tree**: rectangle trunk + circle or oval for leaves\n- A **person**: circle head + rectangle body + thin rectangles for arms and legs\n- A **flower**: circle centre + oval petals around it\n\n**Activity idea:** Look at an animal, like a cow or a dog. Can you see the shapes that make up its body? The body might be an oval, the head a circle, and the legs rectangles.'),
  q(6, 'Ndebele house painting from Mpumalanga uses which kinds of shapes?',
    ['Only circles', 'Only wavy lines', 'Bold geometric shapes like rectangles and triangles', 'No shapes at all — only colours'], 2,
    'Ndebele women paint their homes with bold geometric shapes including rectangles, triangles, and diamond shapes in bright colours.',
    ['Think about the patterns on Ndebele houses — are they made of circles or straight-edged shapes?']),
  t(7, '### Free-Form Shapes\n\nNot all shapes are neat and even. **Free-form shapes** (also called organic shapes) have uneven, natural edges:\n- The shape of a leaf\n- A cloud in the sky\n- A puddle of water\n- The outline of Africa on a map\n\nFree-form shapes are found in nature, while geometric shapes are often found in buildings and man-made objects.\n\n### Lines and Shapes Together\n\nWhen you combine different lines and shapes, you can create wonderful artwork. Try these ideas:\n1. Draw a picture using **only straight lines** — what does it look like?\n2. Draw the same picture using **only curved lines** — how does it feel different?\n3. Fill a page with different shapes and colour each one a different colour\n4. Draw your school using rectangles, squares, and triangles\n\nRemember: every great artist started by practising lines and shapes. The more you draw, the better you get!'),
  fb(8, 'Shapes found in nature with uneven edges are called ___-___ shapes. Shapes with neat, even edges like squares and circles are called ___ shapes.',
    ['free-form', 'geometric'],
    'Free-form (or organic) shapes have irregular, natural edges like leaves and clouds. Geometric shapes have regular, even edges like squares, circles, and triangles.'),
  q(9, 'Which of these is an example of a free-form shape?',
    ['A square', 'A triangle', 'A leaf', 'A rectangle'], 2,
    'A leaf has an uneven, natural shape that is not perfectly regular. This makes it a free-form or organic shape.',
    ['Free-form shapes come from nature.']),
  q(10, 'Zigzag lines make people feel:',
    ['Calm and gentle', 'Sad and quiet', 'Excited and sharp', 'Sleepy and bored'], 2,
    'Zigzag lines have sharp points that create a feeling of energy, excitement, and sharpness — like lightning!'),
];

// ===============================================================================
// CHAPTER 2: Visual Arts — Colours (Term 1)
// ===============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Colours\n\nColour makes the world beautiful! Imagine if everything was only black and white — how boring that would be. In this chapter, we learn about different kinds of colours and how to mix them.\n\n### Primary Colours\n\nThe three **primary colours** are:\n- **Red**\n- **Yellow**\n- **Blue**\n\nThese colours are special because you **cannot make them** by mixing other colours together. They are the starting point for all other colours.\n\nYou can see primary colours everywhere in South Africa:\n- **Red** — the soil of the Limpopo bushveld, ripe tomatoes at a market\n- **Yellow** — sunflowers in the Free State, the golden sun\n- **Blue** — the ocean at Durban beach, a clear winter sky\n\n### Secondary Colours\n\nWhen you mix two primary colours together, you get a **secondary colour**:\n\n| Mix These | To Get This |\n|-----------|-------------|\n| Red + Yellow | **Orange** |\n| Yellow + Blue | **Green** |\n| Red + Blue | **Purple** |\n\nSo there are three secondary colours: **orange**, **green**, and **purple**.\n\n**Fun fact:** The South African flag has six colours — red, blue, green, yellow, black, and white. It includes all three primary colours!'),
  q(2, 'What colour do you get when you mix red and blue?',
    ['Orange', 'Green', 'Purple', 'Brown'], 2,
    'Mixing the primary colours red and blue together makes the secondary colour purple.',
    ['Think about which secondary colour is NOT orange or green.']),
  t(3, '### Warm and Cool Colours\n\nColours can be sorted into two groups:\n\n**Warm colours** — Red, Orange, Yellow\n- These colours remind us of warm things like fire, the sun, and hot sand\n- They feel cheerful and full of energy\n- South African sunsets are full of warm colours!\n\n**Cool colours** — Blue, Green, Purple\n- These colours remind us of cool things like water, grass, and shade under a tree\n- They feel calm and peaceful\n- The cool green of the Tsitsikamma forest or the blue of the Indian Ocean\n\n### Why Warm and Cool Colours Matter\n\nArtists use warm and cool colours on purpose:\n- A painting with lots of **warm colours** feels hot and lively — like a busy market in Soweto\n- A painting with lots of **cool colours** feels quiet and restful — like a misty morning in the Drakensberg\n\nYou can use both warm and cool colours in one painting. The warm parts will seem to jump forward, and the cool parts will seem far away.'),
  fb(4, 'Red, orange, and yellow are called ___ colours because they remind us of fire and the sun. Blue, green, and purple are called ___ colours.',
    ['warm', 'cool'],
    'Warm colours (red, orange, yellow) remind us of heat and energy. Cool colours (blue, green, purple) remind us of water and calm.'),
  t(5, '### Painting with Colour\n\nHere are some tips for painting at school:\n\n**How to mix colours:**\n1. Start with the **lighter colour** on your palette\n2. Add a **tiny bit** of the darker colour\n3. Mix well with your brush\n4. Add more of the darker colour slowly until you get the shade you want\n\n**Important rules:**\n- Always **wash your brush** between colours so they stay clean and bright\n- Use a **palette** (a plate or tray) for mixing — do not mix on your paper\n- If you want a colour to be lighter, add a little **white** paint\n- If you want a colour to be darker, add a tiny bit of **black** paint\n\n### South African Artists and Colour\n\n**Esther Mahlangu** is a famous Ndebele artist from Mpumalanga. She paints bright geometric patterns using bold primary and secondary colours. Her work has been shown all over the world — she even painted a BMW car!\n\n**Walter Battiss** was a South African artist who loved bright, playful colours. He painted pictures of people, animals, and imaginary lands using warm reds, oranges, and yellows.'),
  q(6, 'When mixing paint colours, which colour should you start with?',
    ['The darker colour', 'The lighter colour', 'It does not matter', 'Always start with black'], 1,
    'You should start with the lighter colour and slowly add the darker one. A small amount of dark colour goes a long way!',
    ['A little bit of dark paint changes a light colour a lot.']),
  q(7, 'Which famous Ndebele artist painted bold, colourful patterns and even decorated a BMW car?',
    ['Walter Battiss', 'Nelson Mandela', 'Esther Mahlangu', 'William Kentridge'], 2,
    'Esther Mahlangu is a world-famous Ndebele artist known for her bold geometric patterns. In 1991, she became the first African artist to decorate a BMW Art Car.'),
  fb(8, 'The three primary colours are red, ___, and blue. When you mix red and yellow you get ___.',
    ['yellow', 'orange'],
    'The three primary colours are red, yellow, and blue. Mixing red and yellow produces the secondary colour orange.'),
  t(9, '### Colours in Nature\n\nLook at the colours in nature around you:\n- A **chameleon** changes colour to match its surroundings\n- A **sunbird** has shiny green and blue feathers\n- **Proteas** (our national flower) come in pink, red, yellow, and white\n- The **African sunset** shows warm oranges, reds, pinks, and purples\n\nNature is the best colour teacher! Artists often look at nature to choose which colours to put together.\n\n**Activity idea:** Go outside and find five different colours in nature. Draw each thing you found and use crayons or paint to match the colours as closely as you can. You might be surprised at how many different greens you can find in one garden!'),
  q(10, 'Which of these is NOT a secondary colour?',
    ['Orange', 'Green', 'Blue', 'Purple'], 2,
    'Blue is a primary colour, not a secondary colour. The three secondary colours are orange (red + yellow), green (yellow + blue), and purple (red + blue).',
    ['Secondary colours are made by mixing two primary colours.']),
];

// ===============================================================================
// CHAPTER 3: Performing Arts — Music and Sound (Term 1)
// ===============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Music and Sound\n\nMusic is one of the most wonderful things about being human! People in South Africa have been making music for thousands of years. In this chapter, we learn about different kinds of sounds and how they come together to make music.\n\n### Sounds Around Us\n\nClose your eyes and listen. What can you hear? You might hear:\n- Birds singing outside\n- Cars driving past\n- Children laughing and talking\n- The wind blowing through the trees\n- A dog barking in the distance\n\nAll of these are **sounds**. Sound happens when something **vibrates** (shakes very quickly). When you pluck a guitar string, it vibrates and makes a sound. When you hit a drum, the drum skin vibrates.\n\n### High and Low Sounds\n\nSounds can be **high** or **low**. This is called **pitch**.\n\n| High sounds | Low sounds |\n|------------|------------|\n| A bird singing | A lion roaring |\n| A whistle blowing | Thunder rumbling |\n| A little bell ringing | A big drum beating |\n| A child\'s voice | A dad\'s deep voice |\n\nSmall, thin things usually make **high** sounds. Big, thick things usually make **low** sounds. Think about it — a tiny penny whistle makes a high sound, but a big bass drum makes a deep, low sound.'),
  q(2, 'What is pitch?',
    ['How fast a sound is', 'How loud a sound is', 'How high or low a sound is', 'How long a sound lasts'], 2,
    'Pitch describes how high or low a sound is. A bird singing has a high pitch, while thunder rumbling has a low pitch.',
    ['Think about the difference between a bird and a lion.']),
  t(3, '### Loud and Soft Sounds\n\nSounds can also be **loud** or **soft**. This is called **dynamics** in music.\n\n| Loud sounds | Soft sounds |\n|------------|-------------|\n| A vuvuzela at a soccer match | A whisper |\n| Thunder in a storm | Raindrops on a roof |\n| Banging on a drum | Tapping gently with your finger |\n| A crowd cheering at Ellis Park | A lullaby |\n\nIn music, we can play notes loudly or softly to make the music more interesting. A song that is the same volume all the way through can be boring, but a song that gets louder and softer is exciting to listen to!\n\n### Fast and Slow Beats\n\nMusic has a **beat** — like a heartbeat that keeps the music going. The speed of the beat is called **tempo**.\n\n- **Fast tempo** — makes you want to dance and move quickly (like gumboot dancing)\n- **Slow tempo** — feels calm and gentle (like a lullaby your grandmother sings)\n\nYou can feel the beat by clapping along to a song. Try clapping along to "Shosholoza" — can you feel the steady beat?'),
  fb(4, 'How loud or soft a sound is, is called ___. The speed of the beat in music is called ___.',
    ['dynamics', 'tempo'],
    'Dynamics describes the loudness or softness of music. Tempo describes how fast or slow the beat is.'),
  t(5, '### Body Percussion\n\n**Body percussion** means making sounds using your own body — no instruments needed!\n\nWays to make body percussion:\n- **Clap** your hands — a sharp, bright sound\n- **Stomp** your feet — a deep, heavy sound\n- **Pat** your knees — a soft, tapping sound\n- **Snap** your fingers — a light, clicking sound\n- **Tap** your chest — a hollow, booming sound\n\nSouth African **gumboot dancers** are famous for their body percussion. Miners in the gold mines could not talk to each other because of the noise, so they invented a way to communicate by slapping their gumboots and stomping their feet. Today, gumboot dancing is performed all over the world!\n\n**Activity idea:** Try this body percussion pattern:\n1. Clap, clap, stomp (repeat 4 times)\n2. Pat knees, pat knees, clap, stomp (repeat 4 times)\n3. Try it faster and then slower — how does the feeling change?'),
  q(6, 'Why did South African miners first start gumboot dancing?',
    ['To entertain tourists', 'To communicate because the mines were too noisy to talk', 'To exercise after work', 'To scare away animals'], 1,
    'Gumboot dancing started in South African gold mines where miners could not talk because of the loud noise. They created a way to communicate using rhythmic boot slapping and stomping.',
    ['Think about what the mines were like — very noisy!']),
  t(7, '### Simple South African Songs\n\nSouth Africa has many beautiful songs that people of all ages love to sing:\n\n**"Shosholoza"** — This song was first sung by miners travelling by train to the gold mines of Johannesburg. The word "Shosholoza" means "go forward" or "make way." It is now sung at rugby and soccer matches and is sometimes called South Africa\'s second national anthem.\n\n**"Nkosi Sikelel\' iAfrika"** — This means "God Bless Africa." It was written by Enoch Sontonga in 1897 and is part of our national anthem.\n\n**"Siyahamba"** — This means "We are marching in the light of God." It is a joyful song that is sung in churches and schools across South Africa.\n\nAll of these songs have a clear beat that you can clap along to. They also show how music brings people together — when thousands of people sing "Shosholoza" at a stadium, it gives everyone goosebumps!'),
  q(8, 'What does the word "Shosholoza" mean?',
    ['We are happy', 'God bless Africa', 'Go forward / make way', 'Good morning'], 2,
    '"Shosholoza" means "go forward" or "make way." The song was first sung by miners on trains heading to the gold mines.',
    ['This song is about movement — moving forward.']),
  fb(9, '"Nkosi Sikelel\' iAfrika" means "God ___ Africa." It was written by Enoch ___ in 1897.',
    ['Bless', 'Sontonga'],
    '"Nkosi Sikelel\' iAfrika" means "God Bless Africa." It was composed by Enoch Sontonga, a teacher from the Eastern Cape, in 1897.'),
  q(10, 'Which of these is an example of body percussion?',
    ['Playing a guitar', 'Blowing a whistle', 'Clapping your hands and stomping your feet', 'Shaking a maraca'], 2,
    'Body percussion means making rhythmic sounds using your own body — clapping, stomping, patting, and snapping — without any instruments.'),
];

// ===============================================================================
// CHAPTER 4: Performing Arts — Moving Our Bodies (Term 2)
// ===============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Moving Our Bodies\n\nDancing and moving is one of the best ways to express yourself! In South Africa, dance is part of celebrations, storytelling, and everyday life. In this chapter, we learn about how our bodies can move in different ways.\n\n### Movement in Space\n\nWhen you dance or move, you use the **space** around you.\n\n**Personal space** is the area right around your body — imagine a bubble around you. You can move your arms, legs, and body inside your bubble without touching anyone else.\n\n**General space** is the bigger area — the whole room, playground, or stage. When you travel across the floor (walking, running, skipping), you are moving through general space.\n\n**Rules for moving safely in general space:**\n- Keep your eyes open and watch where you are going\n- Do not bump into other people\n- Use all the space in the room, not just one corner\n- Stop when the teacher says "freeze!"\n\n### Pathways\n\nWhen you move through space, you follow a **pathway** — like the trail you would leave if your feet had paint on them:\n- **Straight pathway** — walking in a line like a soldier\n- **Curved pathway** — moving in circles or S-shapes like a river\n- **Zigzag pathway** — changing direction sharply like a buck running from a lion'),
  q(2, 'What is the difference between personal space and general space?',
    ['Personal space is your bubble; general space is the whole room', 'They are the same thing', 'Personal space is bigger than general space', 'General space is only for the teacher'], 0,
    'Personal space is the area right around your body (like a bubble). General space is the larger area that everyone shares — the whole room or stage.',
    ['Think of personal space as your own bubble.']),
  t(3, '### Levels of Movement\n\nYour body can move at three different **levels**:\n\n| Level | Where Your Body Is | Examples |\n|-------|-------------------|----------|\n| **High level** | Standing tall, on tiptoes, jumping | Reaching for the sky, leaping, spinning on tiptoes |\n| **Medium level** | Normal standing or bending slightly | Walking, swaying, bending at the waist |\n| **Low level** | Close to the ground | Crawling, rolling, crouching, lying flat |\n\nGood dancers change levels during their dance — going from low to high makes the movement exciting and interesting.\n\n### Fast and Slow\n\nYou can move at different speeds:\n- **Fast movements** feel exciting and full of energy — like chasing your friend on the playground\n- **Slow movements** feel smooth and controlled — like a cat creeping up on a bird\n\nTry walking across the room as slowly as you can. Now try walking as fast as you can without running. How does each feel different?'),
  fb(4, 'The three levels of movement are high, ___, and low. Your own body bubble is called ___ space.',
    ['medium', 'personal'],
    'The three levels of movement are high (up tall), medium (normal height), and low (close to the ground). Personal space is the area immediately around your body.'),
  t(5, '### Freeze and Move\n\n**Freeze** means stopping your whole body completely — like a statue. You hold whatever position you are in.\n\n**Freeze and move** is a fun game:\n1. The teacher plays music — you dance and move freely\n2. When the music stops — FREEZE! Hold your position\n3. When the music starts again — move!\n\nThis game teaches you to **listen**, **control your body**, and make interesting shapes when you freeze.\n\n### South African Children\'s Games and Dances\n\nSouth African children have played movement games for generations:\n\n**Drie Stokkies (Three Sticks):** Players jump over sticks held at different heights — practising high-level movement and timing.\n\n**Kennetjie:** A stick game played by two teams, involving fast running and throwing — full of quick direction changes.\n\n**Umlabalaba:** While this is a board game, children often celebrate winning with a little victory dance!\n\n**Traditional children\'s dances:** In many South African cultures, children learn simple dances from a young age. Zulu children learn basic steps of the Indlamu (warrior dance), while Xhosa children practise rhythmic clapping and stomping songs.'),
  q(6, 'In the "freeze and move" game, what do you do when the music stops?',
    ['Keep dancing', 'Sit down', 'Stop your whole body like a statue', 'Run to the wall'], 2,
    'When the music stops in "freeze and move," you freeze your whole body in whatever position you are in, like a statue. This teaches body control.',
    ['A statue does not move at all!']),
  t(7, '### Creative Dance\n\nCreative dance is when you make up your own movements to express a feeling or tell a story. There are no right or wrong moves — the important thing is that you **try** and have fun!\n\n**Ideas for creative dance:**\n- Dance like an **animal**: How would a giraffe move? A frog? An elephant? A bird?\n- Dance like the **weather**: Show rain (tapping fingers), wind (swaying), a storm (big, fast movements), sunshine (opening up slowly)\n- Dance a **story**: One person is a tree (standing tall), another is the wind (blowing), another is a bird (flying around the tree)\n\n**Movement words to try:**\n- **Stretch** — make your body as long as possible\n- **Curl** — make your body as small as possible\n- **Twist** — turn your body from the middle\n- **Swing** — let your arms or legs move back and forth\n- **Shake** — wiggle your body quickly\n\nRemember: dance is for EVERYONE. You do not need to be "good" at dancing — you just need to enjoy moving your body!'),
  q(8, 'Which of these is a LOW-level movement?',
    ['Jumping high', 'Standing on tiptoes', 'Crawling on the floor', 'Reaching for the sky'], 2,
    'Crawling on the floor is a low-level movement because your body is close to the ground.',
    ['Low level means your body is near the ground.']),
  fb(9, 'Moving in circles or S-shapes is called a ___ pathway. The South African children\'s game where you jump over sticks is called ___ Stokkies.',
    ['curved', 'Drie'],
    'A curved pathway follows circles or S-shapes. Drie Stokkies (Three Sticks) is a traditional South African game where players jump over sticks at different heights.'),
  q(10, 'Creative dance is about:',
    ['Following exact steps that the teacher shows you', 'Only dancing if you are very good at it', 'Making up your own movements to express feelings or tell a story', 'Sitting still and watching others dance'], 2,
    'Creative dance is about using your imagination to create your own movements. There are no wrong answers — it is about self-expression and having fun!'),
];

// ===============================================================================
// CHAPTER 5: Visual Arts — Texture and Pattern (Term 2)
// ===============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Texture and Pattern\n\nHave you ever touched a tree trunk and felt how rough it is? Or stroked a cat and felt how soft its fur is? That feeling is called **texture**. In this chapter, we explore texture and patterns — two important parts of art.\n\n### What Is Texture?\n\n**Texture** is how something feels when you touch it — or how it looks like it would feel.\n\n| Texture | Examples |\n|---------|----------|\n| **Rough** | Tree bark, sandpaper, a brick wall, a pineapple |\n| **Smooth** | A pebble from the river, glass, a boiled egg |\n| **Soft** | Cotton wool, a kitten\'s fur, a feather |\n| **Hard** | A rock, a coin, a wooden desk |\n| **Bumpy** | A mielie cob, a crocodile\'s back, bubble wrap |\n| **Fuzzy** | A peach skin, a teddy bear, moss on a wall |\n\n### Real Texture and Visual Texture\n\n- **Real texture** is texture you can actually feel with your fingers (like touching sandpaper)\n- **Visual texture** is texture that looks real in a picture but is flat (like a photograph of sandpaper)\n\nArtists are clever at making flat pictures look like they have real texture!'),
  q(2, 'What is texture?',
    ['The colour of an object', 'The size of an object', 'How something feels when you touch it', 'The shape of an object'], 2,
    'Texture is how something feels when you touch it — rough, smooth, soft, hard, bumpy, or fuzzy.',
    ['Think about what your fingers feel.']),
  t(3, '### Making Texture with Crayon Rubbing\n\n**Crayon rubbing** is a fun way to capture real textures on paper:\n\n**How to do it:**\n1. Find an interesting surface — a coin, a leaf, tree bark, a woven mat\n2. Place a thin piece of paper over it\n3. Rub the side of a crayon gently over the paper\n4. Watch the texture appear like magic!\n\nThe bumps and lines from the surface underneath push through the paper and show up as marks on your drawing.\n\n**Good things to rub:**\n- Coins (you can see the pictures and words!)\n- Leaves (the veins show up beautifully)\n- Woven baskets (the criss-cross pattern appears)\n- Bricks or rough walls\n- The sole of your shoe\n\n### Patterns in Nature\n\nA **pattern** is a design that repeats. Nature is full of amazing patterns:\n- The **stripes** on a zebra\n- The **spots** on a leopard or giraffe\n- The **spiral** of a snail shell\n- The **veins** in a leaf\n- The **hexagons** in a beehive\n- The **rings** inside a tree trunk\n\nThese patterns happen naturally — nobody painted them. South African wildlife is full of the most beautiful patterns in the world!'),
  fb(4, 'A design that repeats is called a ___. Using the side of a crayon over a textured surface to make marks on paper is called crayon ___.',
    ['pattern', 'rubbing'],
    'A pattern is a design that repeats in a regular way. Crayon rubbing is a technique where you place paper over a textured surface and rub with a crayon to capture the texture.'),
  t(5, '### Repeating Patterns\n\nA **repeating pattern** is when the same design appears over and over again:\n- Circle, square, circle, square, circle, square...\n- Red, blue, red, blue, red, blue...\n- Big, small, big, small, big, small...\n\nPatterns can repeat using:\n- **Shapes** (triangle, circle, triangle, circle)\n- **Colours** (green, yellow, green, yellow)\n- **Sizes** (big, small, big, small)\n- **Lines** (thick, thin, thick, thin)\n\nYou can even combine them: red circle, blue square, red circle, blue square!\n\n### African Bead Patterns\n\nBeadwork is an important tradition in many South African cultures.\n\n**Zulu beadwork** uses tiny colourful beads threaded into beautiful patterns. Each colour has a special meaning:\n\n| Colour | Meaning |\n|--------|--------|\n| White | Purity and love |\n| Blue | Faithfulness |\n| Green | Contentment and happiness |\n| Yellow | Wealth |\n| Red | Strong emotion and love |\n| Black | Marriage and sorrow |\n\nZulu love letters (**ucu**) are beaded messages where the colour pattern tells a story. A young woman would make a beaded love letter to give to a young man, and he would understand the message by reading the colours!'),
  q(6, 'In Zulu beadwork, what does the colour white represent?',
    ['Wealth', 'Marriage', 'Purity and love', 'Happiness'], 2,
    'In traditional Zulu beadwork, white represents purity and love.',
    ['Think about what colour is clean and pure.']),
  q(7, 'Which of these is a repeating pattern?',
    ['A random mix of shapes with no order', 'Circle, square, circle, square, circle, square', 'One big triangle on its own', 'A blank page'], 1,
    'A repeating pattern has the same design appearing over and over in a regular sequence — like circle, square, circle, square.',
    ['Patterns repeat in a regular order.']),
  t(8, '### Making Your Own Patterns\n\nYou can create your own patterns easily:\n\n**Simple pattern ideas:**\n1. Draw a row of shapes that repeat (star, heart, star, heart...)\n2. Use two colours and alternate them in a row of circles\n3. Draw a border around your page using a repeating pattern\n4. Make a stamped pattern using a potato cut into a shape, dipped in paint\n\n**Creating texture in your artwork:**\n1. Glue sand, fabric scraps, or dried leaves onto paper for real texture\n2. Use dots, lines, and cross-hatching to draw visual texture\n3. Scrunch up newspaper and dip it in paint, then press it on paper for a rough texture\n4. Drag a comb through wet paint for a lined texture\n\nSouth African crafts are full of beautiful patterns — from Ndebele wall paintings to Venda pottery to Zulu baskets. Look at the patterns around you and let them inspire your own art!'),
  fb(9, 'A Zulu beaded love letter is called an ___. In Zulu beadwork, the colour yellow represents ___.',
    ['ucu', 'wealth'],
    'An ucu is a Zulu beaded love letter where colours carry specific meanings. Yellow represents wealth in Zulu bead colour symbolism.'),
  q(10, 'Which of these is a good surface for crayon rubbing?',
    ['A smooth mirror', 'A flat piece of glass', 'A textured leaf with veins', 'A sheet of paper'], 2,
    'A leaf has raised veins and a textured surface that will show up beautifully in a crayon rubbing. Smooth surfaces would not create any marks.',
    ['You need something with bumps and lines.']),
];

// ===============================================================================
// CHAPTER 6: Performing Arts — Acting and Pretending (Term 2)
// ===============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Acting and Pretending\n\nHave you ever played make-believe? Pretended to be a superhero, a doctor, or a lion? That is the beginning of acting! In this chapter, we learn how to use our imagination and our bodies to become different characters.\n\n### Pretend Play\n\n**Pretend play** (also called make-believe or imaginative play) is when you act like you are someone or something else. You have been doing this since you were very little!\n\nWhen you pretend, you use:\n- Your **body** — to move like the character\n- Your **voice** — to sound like the character\n- Your **face** — to show the character\'s feelings\n- Your **imagination** — to create the world of the story\n\n### Using Your Imagination\n\nYour imagination is like a superpower. It lets you:\n- Be anywhere — on a mountain, under the sea, in space, in the African bush\n- Be anyone — a king, a farmer, a nurse, an explorer\n- Be anything — a tree blowing in the wind, a river flowing, a rock in the sun\n\n**Imagination warm-up game:** The teacher holds up an object (like a ruler). Everyone takes turns pretending it is something else — a sword, a telescope, a fishing rod, a magic wand, a snake. The sillier, the better!'),
  q(2, 'When you act and pretend, what do you use?',
    ['Only your voice', 'Only your body', 'Your body, voice, face, and imagination', 'Only a costume'], 2,
    'Acting uses your whole self — your body to move, your voice to speak, your face to show emotions, and your imagination to create the character and story.',
    ['Good actors use their whole body, not just one part.']),
  t(3, '### Being Different Characters\n\nTo play a character, think about:\n\n**How do they move?**\n- An old person moves slowly and carefully\n- A child skips and runs\n- A king walks tall and proudly\n- A scared mouse creeps along quietly\n\n**How do they talk?**\n- A giant has a deep, booming voice\n- A fairy has a light, soft voice\n- An angry person speaks loudly and quickly\n- A sleepy person talks slowly with lots of yawns\n\n**How do they feel?**\n- Happy characters smile, stand tall, and speak brightly\n- Sad characters hunch over, speak softly, and move slowly\n- Excited characters bounce around and talk fast\n- Scared characters shake, look around nervously, and whisper\n\n**Activity idea:** Walk around the room as yourself. Then the teacher calls out a character — "You are a robot!" — and you change how you walk, move, and sound. Try: a robot, a monkey, a ballet dancer, a very old person, a baby learning to walk, a brave warrior.'),
  fb(4, 'To play a character, you should think about how they move, how they ___, and how they feel.',
    ['talk'],
    'When playing a character, you need to think about three things: how they move (body), how they talk (voice), and how they feel (emotions/face).'),
  t(5, '### Telling Stories Through Acting\n\nActing is a way to tell stories without reading from a book. Instead of using words on a page, you use your body and voice to bring the story to life.\n\n**Mime** is acting without any words — using only your body and face to tell a story. Try miming these actions:\n- Eating a very sour lemon\n- Carrying a very heavy box\n- Walking through sticky mud\n- Opening a present and being surprised by what is inside\n\n**Tableau** (say "tab-LOW") is a frozen picture made by actors. Like pressing pause on a video! The actors freeze in a position that shows a moment from a story. The audience tries to guess what is happening.\n\n### South African Animal Stories\n\nSouth Africa has many wonderful animal stories called **fables**. A fable is a story where animals talk and behave like people, and the story teaches a lesson.\n\n**Famous SA fables:**\n- **How the Zebra Got Its Stripes** — A story about a zebra and a baboon who fight over a waterhole. The zebra falls into the fire and gets burn marks that become its stripes. Lesson: do not be greedy.\n- **The Tortoise and the Hare** — The slow tortoise beats the fast hare in a race because the hare is too proud. Lesson: slow and steady wins the race.\n- **Jackal and the Sun** — The clever jackal tricks other animals but sometimes his tricks backfire. Lesson: being too clever can get you in trouble.'),
  q(6, 'What is mime?',
    ['Acting with loud singing', 'Acting without any words — using only body and face', 'Reading a story out loud', 'Dancing to music'], 1,
    'Mime is a form of acting where you use only your body and facial expressions to tell a story — no words are spoken at all.',
    ['In mime, your mouth stays closed!']),
  q(7, 'What is a fable?',
    ['A true story about real people', 'A scary story told at night', 'A story where animals act like people and it teaches a lesson', 'A song about nature'], 2,
    'A fable is a story in which animals talk and behave like people. Fables always teach a lesson or moral at the end.',
    ['Think about stories where animals can talk.']),
  t(8, '### Working Together in Drama\n\nActing is even more fun when you work with others!\n\n**Partner activities:**\n- **Mirror game:** Face a partner. One person moves slowly, and the other copies them exactly — like a mirror reflection\n- **Storytelling in pairs:** One person starts a story, the other continues it. Take turns adding to the story\n- **Character swap:** Act out a scene, then swap characters with your partner\n\n**Group activities:**\n- **Group tableau:** The whole group makes a frozen picture together\n- **Sound and movement circle:** One person makes a sound and movement, everyone copies it, then the next person adds a new one\n- **Improvised scenes:** The teacher gives a situation and the group acts it out without a script\n\n**Rules for drama class:**\n1. Listen to each other — do not talk when someone else is performing\n2. Respect everyone\'s ideas — there are no silly ideas in drama\n3. Be kind — never laugh at someone\'s acting in a mean way\n4. Try your best — you do not need to be perfect\n5. Have fun — drama is about enjoying yourself!'),
  fb(9, 'A frozen picture made by actors is called a ___. Acting without words using only your body and face is called ___.',
    ['tableau', 'mime'],
    'A tableau is a frozen picture where actors hold a position to show a moment from a story. Mime is acting without speaking, using only body language and facial expressions.'),
  q(10, 'In the story "How the Zebra Got Its Stripes," what lesson does the fable teach?',
    ['Be brave', 'Do not be greedy', 'Always run fast', 'Sleep early'], 1,
    'The fable teaches that greed leads to trouble. The zebra and baboon fight over the waterhole because of greed, and the zebra ends up with burn marks (stripes) as a result.',
    ['The story is about two animals fighting over something.']),
];

// ===============================================================================
// CHAPTER 7: Visual Arts — Cutting, Folding, and Sticking (Term 3)
// ===============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Cutting, Folding, and Sticking\n\nArt is not only about drawing and painting — you can also make amazing things by **cutting**, **folding**, and **sticking** paper and other materials. In this chapter, we learn how to work with our hands to create fun art projects.\n\n### Working with Paper\n\nPaper is one of the best art materials because it is easy to find, cheap, and you can do so many things with it!\n\n**Types of paper for art:**\n- **Newspaper** — great for papier-mache and collage\n- **Magazine pages** — colourful pictures for cutting and sticking\n- **Coloured paper** — for decorating and making shapes\n- **Cardboard** — thicker and stronger for building and folding\n- **Tissue paper** — thin and see-through for layering colours\n- **Crepe paper** — stretchy and good for flowers and decorations\n\n### Cutting Safely with Scissors\n\n**Safety rules for using scissors:**\n1. Always carry scissors with the **blades closed** and **pointing down**\n2. Pass scissors to a friend **handle first** — never blade first!\n3. Cut **away** from your body, never towards yourself\n4. Keep your fingers **out of the way** of the blades\n5. Put scissors **down** when you are not using them — do not wave them around\n6. Use scissors only for cutting paper and craft materials — never for hair, clothes, or other people\'s belongings!'),
  q(2, 'How should you pass scissors to a friend?',
    ['Blade first', 'Throw them across the table', 'Handle first', 'Open and pointing at them'], 2,
    'You should always pass scissors handle first so that your friend can grab the safe end and you are holding the blade end.',
    ['The handle is the safe end to give to someone.']),
  t(3, '### Folding Paper\n\nFolding paper can create amazing shapes and designs:\n\n**Basic folds:**\n- **Half fold** — fold paper in half to make a card or a book\n- **Fan fold** (accordion fold) — fold back and forth to make a fan or a zigzag\n- **Triangle fold** — fold a corner across to make a triangle shape\n\n**Fun folding projects:**\n- **Paper fan:** Fan-fold a piece of paper, pinch one end together, and spread the other end out. Decorate it with patterns!\n- **Paper hat:** Fold newspaper into a hat — a pirate hat, a crown, or a soldier\'s cap\n- **Paper airplane:** Fold paper into a plane and see how far it flies\n- **Origami animals:** Fold paper into birds, frogs, or butterflies using special folding steps\n\n### Collage\n\nA **collage** is a picture made by sticking different materials onto paper or cardboard.\n\n**How to make a collage:**\n1. Decide on a picture or theme (animals, nature, your family, your school)\n2. Collect materials — magazine pictures, coloured paper, fabric scraps, leaves, buttons\n3. Cut or tear the materials into shapes you need\n4. Arrange them on your paper before sticking — move things around until you are happy\n5. Glue everything down carefully\n\nTearing paper gives a softer, more natural edge than cutting. Try both and see which you like!'),
  fb(4, 'A picture made by sticking different materials onto paper is called a ___. Folding paper back and forth like a zigzag is called a ___ fold.',
    ['collage', 'fan'],
    'A collage is artwork created by gluing different materials (paper, fabric, leaves, etc.) onto a background. A fan fold (also called accordion fold) creates a zigzag by folding paper back and forth.'),
  t(5, '### Making Masks\n\nMasks are used in many South African cultures for ceremonies, dances, and celebrations.\n\n**How to make a simple paper plate mask:**\n1. Take a paper plate (or cut a circle from cardboard)\n2. Hold it up to your face and mark where your eyes are\n3. Cut out eye holes (ask your teacher for help with this part)\n4. Decorate your mask with paint, crayons, feathers, wool, buttons, or beads\n5. Attach string or a stick to hold it up\n\n**Mask ideas:**\n- An **animal mask** — a lion with a wool mane, a leopard with spots, a springbok with cardboard horns\n- A **traditional mask** — based on the patterns and colours you see in African art\n- A **character mask** — for a play or story you are performing\n\n### Creating Art from Recycled Materials\n\nYou do not need to buy expensive art supplies! You can make amazing art from things people usually throw away:\n\n| Recycled Material | What You Can Make |\n|-------------------|------------------|\n| Toilet rolls | Animals, binoculars, castles |\n| Plastic bottles | Flower vases, pencil holders, wind spinners |\n| Old magazines | Collage pictures, paper beads |\n| Egg cartons | Caterpillars, flowers, paint palettes |\n| Cardboard boxes | Houses, cars, robots, puppet theatres |\n| Bottle tops | Mosaics, counting games, decorations |\n\nIn South Africa, many artists use recycled materials to create beautiful art. This is good for the environment because it means less waste in landfills!'),
  q(6, 'Why is making art from recycled materials a good idea?',
    ['Because it costs a lot of money', 'Because it is bad for the environment', 'Because it reduces waste and is good for the environment', 'Because only expensive materials make good art'], 2,
    'Using recycled materials for art reduces waste that would otherwise go to landfills. It is also free, creative, and teaches us to be resourceful!',
    ['Think about what happens to rubbish when we throw it away.']),
  t(7, '### Paper Weaving\n\nPaper weaving is a simple way to make beautiful patterns:\n\n**How to paper weave:**\n1. Take a piece of coloured paper and fold it in half\n2. Cut slits from the folded edge — but stop about 2cm from the open edge!\n3. Open the paper flat — you now have your "loom" with slits\n4. Cut strips of a different coloured paper\n5. Weave the strips over and under through the slits\n6. Alternate each row: if the first row goes over-under, the next row goes under-over\n7. Glue the ends to keep everything in place\n\nThis is how traditional basket weaving works too! South African Zulu baskets (called **isichumo**) are woven from grass and palm leaves using a similar over-under pattern. Some Zulu baskets are so tightly woven that they can hold water!'),
  fb(8, 'In paper weaving, you alternate going ___ and under through the slits. A traditional Zulu woven basket is called an ___.',
    ['over', 'isichumo'],
    'Paper weaving uses an over-under pattern, alternating each row. A traditional Zulu basket used for carrying items is called an isichumo.'),
  q(9, 'What is the first safety rule when carrying scissors?',
    ['Run with them quickly', 'Keep the blades open', 'Keep the blades closed and point them down', 'Hold them by the blades'], 2,
    'When carrying scissors, always close the blades and point them downward to avoid accidentally hurting yourself or others.',
    ['Think about how to make scissors as safe as possible when walking.']),
  q(10, 'When making a collage, what should you do BEFORE sticking materials down?',
    ['Glue everything immediately', 'Arrange the materials first and move them around until you are happy', 'Throw them onto the paper randomly', 'Cut everything into the same shape'], 1,
    'Before gluing, you should arrange all your materials on the paper and move things around until you are happy with the design. This way you can change your mind before the glue makes it permanent!'),
];

// ===============================================================================
// CHAPTER 8: Performing Arts — Singing Together (Term 3)
// ===============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Singing Together\n\nSinging is one of the most joyful things you can do! In South Africa, singing brings people together — at school assemblies, sports events, church, and family gatherings. In this chapter, we learn how to use our voices and sing with others.\n\n### Using Our Voices\n\nYour voice is an amazing instrument that you carry with you everywhere!\n\n**Taking care of your voice:**\n- Drink plenty of **water** to keep your throat moist\n- Do not **shout** or scream too much — it hurts your vocal cords\n- **Warm up** your voice before singing — hum gently, do lip trills (brrrr), and say tongue twisters\n- Stand or sit up **straight** so air can flow freely\n- **Breathe from your tummy** (diaphragm), not from your chest\n\n**Breathing tip:** Put your hand on your tummy. When you breathe in, your tummy should push your hand OUT (like blowing up a balloon). When you breathe out, your tummy goes IN. This is called **diaphragmatic breathing** and it gives you more air for singing.\n\n### Singing in Unison\n\n**Unison** means everyone singing the same thing at the same time — the same words, the same tune, at the same speed.\n\n**Tips for singing in unison:**\n- Listen to the people around you — do not sing louder than everyone else\n- Watch the teacher or conductor for when to start and stop\n- Try to match the people next to you\n- Sing with a clear, open voice — not squeezed or tight'),
  q(2, 'What does it mean to sing in unison?',
    ['Everyone sings a different tune', 'Only one person sings', 'Everyone sings the same thing at the same time', 'People take turns singing alone'], 2,
    'Unison means everyone sings the same melody, the same words, at the same time — like one big voice together.',
    ['Uni means "one" — one voice, all together.']),
  t(3, '### Call and Response\n\n**Call and response** is a very important style of singing in Africa. One person (the leader or caller) sings a line, and then the group (the chorus) sings back.\n\n**How it works:**\n- Leader sings: "Shosholoza..."\n- Group responds: "Ku lezontaba..."\n- Leader sings: "Stimela siphume..."\n- Group responds: "South Africa..."\n\nCall and response is found in:\n- Traditional African songs\n- Church gospel music\n- Work songs (sung by miners and farmers)\n- Children\'s playground songs\n\nThis style of singing is special because **everyone gets to take part**. Even if you do not know the whole song, you can join in on the response part!\n\n### South African Songs We Love\n\n**"Shosholoza"**\nThis song was first sung by workers on trains going to the mines. "Shosholoza" means "go forward." Today it is sung at rugby and soccer matches across the country. The whole stadium sings together — it gives you goosebumps!\n\n**"Nkosi Sikelel\' iAfrika"**\nOur national anthem begins with this beautiful hymn meaning "God Bless Africa." It was written by Enoch Sontonga in 1897. When we sing it at school or at events, we show love for our country.'),
  fb(4, 'In call and response singing, the leader sings a line and then the ___ sings back. "Shosholoza" means "go ___."',
    ['group', 'forward'],
    'In call and response, the leader sings first and the group (or chorus) answers. "Shosholoza" means "go forward" or "make way" — it was originally a train song.'),
  t(5, '### More South African Songs\n\n**"Siyahamba"**\nThis joyful song means "We are marching in the light of God." It is sung in churches, schools, and at celebrations. It has a strong, walking beat that makes you want to march along.\n\n**"Nkosi Sikelel\' iAfrika" — Our National Anthem**\nOur national anthem is sung in five of South Africa\'s languages:\n1. **Xhosa** — "Nkosi sikelel\' iAfrika"\n2. **Zulu** — "Maluphakanyisw\' uphondo lwayo"\n3. **Sesotho** — "Morena boloka setjhaba sa heso"\n4. **Afrikaans** — "Uit die blou van onse hemel"\n5. **English** — "Sounds the call to come together"\n\nLearning our national anthem shows respect for all the people and languages of South Africa.\n\n**"Thula Baba"**\nThis gentle Zulu lullaby means "Hush, baby." Mothers and grandmothers have sung it to their children for generations. It has a slow, soft tune that helps babies fall asleep.\n\nSinging these songs connects us to our history and to each other!'),
  q(6, 'Our national anthem "Nkosi Sikelel\' iAfrika" is sung in how many languages?',
    ['Two', 'Three', 'Five', 'Eleven'], 2,
    'The South African national anthem is sung in five languages: Xhosa, Zulu, Sesotho, Afrikaans, and English.',
    ['Count the languages listed: Xhosa, Zulu, Sesotho, Afrikaans, English.']),
  t(7, '### Simple Rounds\n\nA **round** is a song where groups start singing at different times but sing the same tune.\n\nThe most famous example is "Frere Jacques" (or "Are You Sleeping?"):\n- Group 1 starts singing\n- When Group 1 reaches the second line, Group 2 starts from the beginning\n- When Group 2 reaches the second line, Group 3 starts\n- All groups sing the same song — but they are at different places in it!\n\nThis creates a beautiful layered sound — like voices weaving together.\n\n**Tips for singing rounds:**\n- Keep singing YOUR part — do not get pulled into the other group\'s part!\n- Listen to the other groups while singing your own line\n- Keep a steady speed — do not speed up or slow down\n- Start with just 2 groups, then try 3\n\nSinging rounds teaches you to **listen** and **keep going** even when you hear something different. It takes concentration and teamwork!'),
  q(8, 'In a round, what do the different groups sing?',
    ['Different songs at the same time', 'The same song but starting at different times', 'The same song at the same time', 'Only the chorus part'], 1,
    'In a round, all groups sing the same song, but they start at different times. This creates a layered, harmonious sound.',
    ['Think about "Frere Jacques" — everyone sings the same song.']),
  fb(9, 'Breathing from your tummy for singing is called ___ breathing. A song where groups start at different times but sing the same tune is called a ___.',
    ['diaphragmatic', 'round'],
    'Diaphragmatic breathing means breathing deeply using your diaphragm (tummy) instead of shallow chest breathing. A round is a song where groups enter at different times but sing the same melody.'),
  q(10, '"Thula Baba" is a Zulu:',
    ['War dance', 'Work song', 'Lullaby', 'National anthem'], 2,
    '"Thula Baba" means "Hush, baby" and is a gentle Zulu lullaby sung by mothers and grandmothers to help children fall asleep.',
    ['Think about what kind of song you sing to a baby.']),
];

// ===============================================================================
// CHAPTER 9: Visual Arts — Modelling (Term 3)
// ===============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Modelling\n\nSo far, most of your art has been flat on paper — that is called **2D** (two-dimensional) art. Now we are going to learn about making art you can hold in your hands — **3D** (three-dimensional) art! Modelling means shaping materials like clay and playdough to create objects.\n\n### Working with Clay and Playdough\n\n**Clay** is a natural material that comes from the earth. When it dries, it becomes hard. If you fire it in a kiln (a very hot oven), it becomes even harder and can last forever!\n\n**Playdough** is softer and easier to use for practice. You can even make it at home!\n\n**Homemade playdough recipe:**\n- 2 cups flour\n- 1 cup salt\n- 1 cup water\n- 2 tablespoons cooking oil\n- Mix everything together and knead until smooth\n\n### Basic Modelling Techniques\n\n| Technique | How To Do It | What You Can Make |\n|-----------|-------------|------------------|\n| **Rolling** | Roll clay between your palms or on a table to make a ball or a sausage shape | Beads, snake, worm, log |\n| **Pinching** | Squeeze and pinch the clay with your fingers | A bowl (pinch pot), ears on an animal |\n| **Pulling** | Gently pull a piece of clay out from the main shape | Legs, arms, a nose, a tail |\n| **Smoothing** | Rub the surface with your fingers or a little water | A smooth finish on your sculpture |\n| **Pressing** | Push objects into the clay to make patterns | Decorating with a fork, pencil, or leaf |'),
  q(2, 'What is the difference between 2D art and 3D art?',
    ['2D art is bigger than 3D art', '2D art is flat (like a drawing) and 3D art has depth (like a sculpture)', '3D art is only made with clay', 'There is no difference'], 1,
    '2D (two-dimensional) art is flat, like a drawing or painting on paper. 3D (three-dimensional) art has height, width, AND depth — you can hold it and see it from all sides.',
    ['2D is flat like a photo. 3D is something you can pick up.']),
  t(3, '### Making Animals from Clay\n\nAnimals are one of the most fun things to model! Here is how to make a simple clay animal:\n\n**Easy clay animal (tortoise):**\n1. Roll a big ball for the body (the shell)\n2. Flatten the bottom slightly so it sits without rolling\n3. Roll a smaller ball for the head and four tiny sausage shapes for legs\n4. Press the head and legs gently onto the body\n5. Use a pencil to make eyes and a little mouth\n6. Press patterns into the shell with a fork (to look like a tortoise shell pattern)\n\n**Other animals to try:**\n- **Snake:** Roll a long sausage and curl it up. Add eyes with a pencil.\n- **Bird:** Make a body ball, pinch a beak, and flatten two small pieces for wings.\n- **Elephant:** Large body ball, four thick leg sausages, a long trunk pulled from the head.\n- **Springbok:** Body oval, thin legs, tiny horns pulled from the head.\n\n**Tip:** To make two pieces of clay stick together, scratch the surfaces with a pencil (this is called **scoring**), add a tiny bit of water, and press them together. This is called **score and slip** — the oldest trick in pottery!'),
  fb(4, 'Squeezing clay with your fingers to make a bowl shape is called ___. Scratching clay surfaces and adding water to join pieces is called score and ___.',
    ['pinching', 'slip'],
    'Pinching is when you use your thumb and fingers to squeeze and shape clay, especially to make a bowl (pinch pot). Score and slip is a technique where you scratch both surfaces and add water to make pieces of clay stick together firmly.'),
  t(5, '### Making Pots\n\n**Pinch pot:**\n1. Roll a ball of clay the size of a tennis ball\n2. Push your thumb into the centre (but do not go through the bottom!)\n3. Pinch the sides gently, turning the pot as you go\n4. Keep pinching and turning until the walls are even\n5. Smooth the rim (top edge) with wet fingers\n\nThis is one of the oldest ways to make a pot — people have been making pinch pots for thousands of years!\n\n**Coil pot:**\n1. Roll long sausage shapes (coils) of clay\n2. Make a flat circle for the base\n3. Stack the coils on top of each other, going round and round\n4. Smooth the inside and outside with your fingers\n5. The pot grows taller with each coil\n\n### South African Clay Traditions\n\nClay pottery is an important tradition in South Africa:\n\n- **Venda pottery** — Women in Limpopo make beautiful clay pots with geometric patterns. These pots are used for storing water and grain.\n- **Zulu beer pots (ukhamba)** — Round, black pots used for traditional beer. They are polished until they shine.\n- **Sotho pottery** — Decorated with comb-like marks and used for cooking and storage.\n\nIn many cultures, it is the women who are the potters. The skills are passed from mothers and grandmothers to daughters and granddaughters.'),
  q(6, 'What is a pinch pot?',
    ['A pot made by pouring clay into a shape', 'A pot made by pushing your thumb in and pinching the sides', 'A pot made with a machine', 'A pot you buy from a shop'], 1,
    'A pinch pot is made by pressing your thumb into a ball of clay and gently pinching the sides to create a bowl shape. It is one of the oldest pottery techniques in the world.',
    ['Think about what your thumb and fingers do.']),
  t(7, '### Decorating Your Clay Work\n\nYou can make your clay models look even more amazing by adding decoration:\n\n**Texture patterns:**\n- Press a fork, comb, or pencil into the clay to make lines and dots\n- Press a leaf into the clay and gently peel it off — the leaf pattern stays!\n- Roll a textured object (like a rough stone) over the clay\n\n**Shape details:**\n- Add tiny balls of clay for eyes, buttons, or decorations\n- Use a pencil to draw patterns, faces, or words\n- Pinch the edges to make a wavy or zigzag rim\n\n**After decorating:**\n- Let your clay dry slowly (fast drying can cause cracks)\n- Once dry, you can paint it with poster paint or acrylic paint\n- Cover with a layer of PVA glue mixed with water for a shiny finish\n\nRemember: clay is patient. If something goes wrong, just squish it up and start again. The more you practise, the better your modelling skills will become!'),
  fb(8, 'A pot made by stacking rolled sausage shapes of clay on top of each other is called a ___ pot. A traditional Zulu beer pot is called an ___.',
    ['coil', 'ukhamba'],
    'A coil pot is built by stacking coils (long rolled sausage shapes) of clay on top of each other in circles. An ukhamba is a traditional round Zulu pot used for traditional beer, polished to a dark shine.'),
  q(9, 'Why do we use the "score and slip" method when joining clay pieces?',
    ['To make the clay softer', 'To make pieces stick together strongly', 'To make the clay dry faster', 'To add colour to the clay'], 1,
    'Score and slip helps two pieces of clay stick together firmly. Scoring (scratching) creates a rough surface, and slip (water) acts like glue between the pieces.',
    ['Think about why scratching and water would help two pieces join.']),
  q(10, 'In which South African province are Venda women known for making beautiful clay pots?',
    ['Western Cape', 'Gauteng', 'Limpopo', 'KwaZulu-Natal'], 2,
    'Venda pottery is made by women in Limpopo province. They create pots with geometric patterns used for storing water and grain.',
    ['The Venda people live in the north of South Africa.']),
];

// ===============================================================================
// CHAPTER 10: Creative Arts — Our Show (Term 4)
// ===============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Our Show\n\nCongratulations — you have learned so much about Creative Arts this year! Now it is time to put everything together and prepare a class show. This chapter is about combining art, music, drama, and dance to create something amazing as a team.\n\n### Preparing a Class Performance\n\nA class performance is when you and your classmates show your creative work to an audience — it could be other classes, your parents, or the whole school.\n\n**Steps to prepare a show:**\n1. **Choose a theme** — What is your show about? Animals? South African stories? The seasons? Friendship?\n2. **Plan what to include** — Will you have songs, dances, a short play, and art on display?\n3. **Assign roles** — Who will act? Who will sing? Who will dance? Who will make art for the stage?\n4. **Practise** — Rehearse your parts so everyone knows what to do\n5. **Make props and decorations** — Use what you learned about cutting, folding, and modelling\n6. **Perform** — Do your best and have fun!\n\n### Combining Art, Music, Drama, and Dance\n\nA great show uses ALL the creative arts together:\n\n| Creative Art | How It Fits in the Show |\n|-------------|------------------------|\n| **Visual Arts** | Painted backdrops, masks, costumes, posters |\n| **Music** | Songs, body percussion, instruments |\n| **Drama** | Acting out a story, speaking parts, mime |\n| **Dance** | Creative movement, traditional dance, choreography |'),
  q(2, 'What is the first step in preparing a class performance?',
    ['Start performing immediately', 'Choose a theme for the show', 'Make costumes', 'Invite the audience'], 1,
    'The first step is to choose a theme. This gives your whole show a focus and helps you decide what songs, dances, plays, and artwork to include.',
    ['Before you can plan, you need to know what the show is about.']),
  t(3, '### Working as a Team\n\nA show only works when everyone helps! This is called **teamwork** or **collaboration**.\n\n**Important teamwork skills:**\n- **Listening** — pay attention to other people\'s ideas\n- **Sharing** — take turns and share materials and roles\n- **Encouraging** — say positive things like "great idea!" or "you are doing well!"\n- **Compromising** — sometimes you need to meet in the middle. You might not get your first choice of role, but the show needs everyone.\n- **Responsibility** — do your part properly. If you do not learn your lines or finish your artwork, the whole team is affected.\n\n**Everyone has something to offer:**\n- If you are shy, you can help with art, props, or backstage\n- If you love singing, you can lead a song\n- If you are a good speaker, you can do narration or acting\n- If you are organised, you can help plan and keep everyone on track\n\nThe best shows happen when the whole class works together with respect and kindness. Nobody is more important than anyone else — every role matters, from the lead actor to the person handing out programmes.'),
  fb(4, 'Working together to create a show is called ___ or collaboration. If you do not get your first choice of role, you need to show ___.',
    ['teamwork', 'compromise'],
    'Teamwork (or collaboration) means working together towards a shared goal. Compromise means accepting something different from what you first wanted so that the group can succeed.'),
  t(5, '### Making Props, Costumes, and Backdrops\n\nYou can use all the skills you learned this year to make things for your show:\n\n**From Chapter 1 (Lines and Shapes):** Draw bold shapes and patterns on cardboard for backdrops and signs.\n\n**From Chapter 2 (Colours):** Paint backdrops and posters using warm and cool colours to set the mood.\n\n**From Chapter 5 (Texture and Pattern):** Add beadwork-style patterns to costumes or masks.\n\n**From Chapter 7 (Cutting, Folding, Sticking):** Make masks, paper flowers, collage posters, and props from recycled materials.\n\n**From Chapter 9 (Modelling):** Make clay animals, pots, or other objects as part of the stage set.\n\n**Simple costume ideas using everyday items:**\n- An animal — ears made from cardboard, a tail from fabric or rope, face painted\n- A king or queen — a crown from card, a cape from a bed sheet\n- A tree — brown clothes with green paper leaves pinned on\n- A traditional outfit — fabric wrapped in traditional style, beaded jewellery from painted pasta\n\nRemember: props do not have to be perfect. A cardboard box painted gold can be a treasure chest. A stick with green paper leaves becomes a tree. Use your imagination!'),
  q(6, 'Which skills from earlier chapters can help you make a painted backdrop for a show?',
    ['Only the singing skills from Chapter 8', 'The colour mixing and painting skills from Chapter 2', 'Only the clay modelling skills from Chapter 9', 'Only the acting skills from Chapter 6'], 1,
    'The colour mixing and painting skills from Chapter 2 (Colours) teach you how to mix colours, use warm and cool colours, and paint effectively — perfect for creating a backdrop.',
    ['Think about which chapter was about painting and colours.']),
  t(7, '### Audience Manners\n\nBeing a good **audience member** is just as important as being a good performer!\n\n**How to be a great audience:**\n- **Sit quietly** during the performance — do not talk or make noise\n- **Watch and listen** carefully — the performers worked hard!\n- **Clap** at the end of each piece to show appreciation\n- **Do not** use your phone, fidget loudly, or distract others\n- **Be kind** — even if something goes wrong, do not laugh in a mean way\n- **Show respect** — every performer is brave for getting up on stage\n\n**How to be a great performer:**\n- **Practise** your part before the show\n- **Speak clearly** and loudly enough for the audience to hear\n- **Face the audience** — do not turn your back to them\n- **Keep going** if you make a mistake — the audience probably will not notice!\n- **Smile** and enjoy yourself — the audience feels your energy\n- **Bow** at the end to say thank you for watching\n\n**Stage fright:** It is perfectly normal to feel nervous before performing. Take deep breaths, remember your practice, and know that your class is right there with you. Once you start, the nerves usually go away!'),
  fb(8, 'A good audience member should sit ___ during the performance and ___ at the end to show appreciation.',
    ['quietly', 'clap'],
    'Being a good audience member means sitting quietly and listening respectfully during the performance, then clapping at the end to show that you enjoyed it.'),
  q(9, 'What should you do if you make a mistake during a performance?',
    ['Stop and start crying', 'Run off the stage', 'Keep going — the audience probably will not notice', 'Shout at the audience'], 2,
    'If you make a mistake, just keep going! Most of the time the audience does not even notice. Stopping or drawing attention to the mistake makes it worse.',
    ['Think about what a professional actor would do.']),
  t(10, '### Celebrating Our Creativity\n\nThis year in Creative Arts, you have learned so many amazing skills:\n\n- **Drawing** with different lines and shapes\n- **Painting** with primary, secondary, warm, and cool colours\n- **Listening** to sounds and making music with your body\n- **Moving** your body at different levels and speeds\n- **Feeling** textures and creating beautiful patterns\n- **Acting** and pretending to be different characters\n- **Making** things from paper, recycled materials, and clay\n- **Singing** South African songs together\n- **Working** as a team to create a performance\n\nCreative Arts is not just a school subject — it is a way of seeing and experiencing the world. When you draw, dance, sing, or act, you are expressing who you are inside.\n\nSouth Africa is one of the most creative countries in the world. From the ancient rock art of the San people to the colourful Ndebele houses, from the powerful gumboot dances of the miners to the joyful songs at a rugby stadium — creativity is in our blood.\n\nKeep drawing, keep dancing, keep singing, and keep creating. The world needs your art!\n\n**Well done, Grade 4!** 🎨🎵🎭'),
];


// ===============================================================================
// MAIN — Database insertion
// ===============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 4
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 4/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 4:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 4', schoolId: SCHOOL_ID, orderIndex: 4,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 4:', String(GRADE_ID));
  }

  // Find or create Creative Arts subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Creative.*Art/i, schoolId: SCHOOL_ID });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Creative Arts subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Creative Arts',
      code: 'CA',
      schoolId: SCHOOL_ID,
      gradeIds: [GRADE_ID],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Creative Arts subject:', String(SUBJECT_ID));
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
    tags: ['grade-4', 'creative-arts', 'caps'],
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
      title: 'Chapter 1: Visual Arts — Lines and Shapes',
      description: 'Different types of lines (straight, curved, wavy, zigzag, thick, thin), geometric and free-form shapes, drawing with lines and shapes, Ndebele house painting, San rock art.',
      order: 1,
      lessons: [
        { title: 'Lines and Shapes', description: 'Types of lines (straight, curved, wavy, zigzag, thick, thin), lines and feelings, basic shapes (circle, square, triangle, rectangle, oval), geometric vs free-form shapes, Ndebele house painting, San rock art, and drawing with lines and shapes.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Visual Arts — Colours',
      description: 'Primary colours (red, yellow, blue), mixing secondary colours (orange, green, purple), warm and cool colours, painting tips, SA artists Esther Mahlangu and Walter Battiss.',
      order: 2,
      lessons: [
        { title: 'Colours', description: 'Primary colours (red, yellow, blue), secondary colours (orange, green, purple), warm and cool colours, colour mixing tips, Esther Mahlangu (Ndebele art, BMW car), Walter Battiss, colours in nature, and the SA flag.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Performing Arts — Music and Sound',
      description: 'Different sounds around us, pitch (high and low), dynamics (loud and soft), tempo (fast and slow), body percussion, gumboot dancing, SA songs (Shosholoza, Nkosi Sikelel\' iAfrika).',
      order: 3,
      lessons: [
        { title: 'Music and Sound', description: 'Sounds around us, vibrations, pitch (high and low sounds), dynamics (loud and soft), tempo (fast and slow beats), body percussion (clap, stomp, pat, snap), gumboot dancing, Shosholoza, Nkosi Sikelel\' iAfrika, and Siyahamba.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Performing Arts — Moving Our Bodies',
      description: 'Personal and general space, pathways (straight, curved, zigzag), movement levels (high, medium, low), fast and slow, freeze and move, creative dance, SA children\'s games.',
      order: 4,
      lessons: [
        { title: 'Moving Our Bodies', description: 'Personal space and general space, pathways (straight, curved, zigzag), movement levels (high, medium, low), fast and slow movement, freeze and move game, Drie Stokkies, Kennetjie, Indlamu, creative dance and expression.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Visual Arts — Texture and Pattern',
      description: 'Rough and smooth textures, real and visual texture, crayon rubbing, patterns in nature, repeating patterns, African bead patterns, Zulu beadwork colour symbolism.',
      order: 5,
      lessons: [
        { title: 'Texture and Pattern', description: 'Types of texture (rough, smooth, soft, hard, bumpy, fuzzy), real vs visual texture, crayon rubbing technique, patterns in nature (stripes, spots, spirals), repeating patterns, Zulu beadwork colours and meanings, ucu (love letters), and creating patterns.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Performing Arts — Acting and Pretending',
      description: 'Pretend play, using imagination, being different characters (body, voice, face), mime, tableau, SA animal fables, mirror game, group drama activities.',
      order: 6,
      lessons: [
        { title: 'Acting and Pretending', description: 'Pretend play, using body, voice, face, and imagination, character creation (movement, voice, feelings), mime, tableau, SA animal fables (Zebra stripes, Tortoise and Hare, Jackal and Sun), mirror game, partner and group drama activities.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Visual Arts — Cutting, Folding, and Sticking',
      description: 'Types of paper, scissors safety, folding techniques, collage, making masks, paper weaving, recycled art, Zulu baskets (isichumo).',
      order: 7,
      lessons: [
        { title: 'Cutting, Folding, and Sticking', description: 'Types of paper for art, scissors safety rules, basic folds (half, fan, triangle), collage technique, mask making, art from recycled materials (toilet rolls, bottles, egg cartons), paper weaving, and Zulu baskets (isichumo).', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Performing Arts — Singing Together',
      description: 'Voice care, diaphragmatic breathing, singing in unison, call and response, SA songs (Shosholoza, Nkosi Sikelel\' iAfrika, Siyahamba, Thula Baba), simple rounds.',
      order: 8,
      lessons: [
        { title: 'Singing Together', description: 'Voice care and warm-ups, diaphragmatic breathing, singing in unison, call and response, SA songs (Shosholoza, Nkosi Sikelel\' iAfrika in five languages, Siyahamba, Thula Baba lullaby), and singing rounds.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Visual Arts — Modelling',
      description: '2D vs 3D art, clay and playdough, rolling, pinching, pulling, smoothing, making animals and pots (pinch pot, coil pot), score and slip, SA clay traditions (Venda, Zulu, Sotho).',
      order: 9,
      lessons: [
        { title: 'Modelling', description: '2D vs 3D art, clay and playdough (homemade recipe), modelling techniques (rolling, pinching, pulling, smoothing, pressing), making animals, pinch pot, coil pot, score and slip, decorating clay, Venda pottery, Zulu ukhamba, and Sotho pottery.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Creative Arts — Our Show',
      description: 'Preparing a class performance, combining visual arts, music, drama, and dance, teamwork, props and costumes, audience manners, stage fright, celebrating creativity.',
      order: 10,
      lessons: [
        { title: 'Our Show', description: 'Planning a class performance, combining all creative arts (backdrops, masks, songs, dances, acting), teamwork and collaboration, making props and costumes from everyday items, audience manners, performer tips, dealing with stage fright, and celebrating the year.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 4 Creative Arts \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Lines and Shapes, Colours, Music and Sound, Moving Our Bodies, Texture and Pattern, Acting and Pretending, Cutting Folding and Sticking, Singing Together, Modelling, and Our Show for the Grade 4 Creative Arts curriculum.',
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
  console.log('  TEXTBOOK: Grade 4 Creative Arts');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
