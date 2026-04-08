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
// CHAPTER 1: Drawing and Colouring (Term 1)
// ===============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Drawing and Colouring\n\nWelcome to Grade 3 Creative Arts! This year we are going to draw, paint, sing, dance, act, and make all kinds of wonderful things. Let\'s start with something you already love — **drawing**!\n\n### Lines Are Everywhere\n\nEvery drawing starts with a **line**. A line is a mark that your pencil or crayon makes as it moves across the paper. Did you know there are many different kinds of lines?\n\n| Line Type | What It Looks Like | Where You See It |\n|-----------|-------------------|------------------|\n| **Straight** | Goes in one direction, no bending | A ruler, a fence, a tall building |\n| **Curved** | Bends gently, smooth and round | A rainbow, a hill, a smile |\n| **Wavy** | Goes up and down like water | Ocean waves, a wriggly worm |\n| **Zigzag** | Sharp points up and down | Lightning, a saw, mountain tops |\n\nLook around your classroom right now — can you spot each kind of line? The edge of the door is a straight line. The clock is full of curved lines. Your teacher\'s writing on the board might have wavy and zigzag lines!'),
  q(2, 'Which type of line looks like ocean waves?',
    ['Straight', 'Curved', 'Wavy', 'Zigzag'], 2,
    'Wavy lines go up and down smoothly, just like waves rolling across the ocean on a sunny day at Durban beach.',
    ['Think about how the sea moves — up and down, up and down.']),
  t(3, '### Shapes Help Us Draw\n\nShapes are what you get when lines join up. You already know some shapes:\n- **Circle** — round like a ball, the sun, or a plate of pap\n- **Square** — four sides that are all the same, like a window\n- **Triangle** — three sides, like the roof of a house\n- **Rectangle** — like a door or a book\n\nAlmost everything you want to draw can be built from these simple shapes!\n\n### Drawing Things We See\n\nLet\'s practise drawing things from our everyday lives in South Africa:\n\n**Our House:**\n1. Draw a big rectangle for the wall\n2. Add a triangle on top for the roof\n3. Put a small rectangle in the middle for the door\n4. Draw two small squares for windows\n5. Add a circle for the door handle\n\n**Our Pet (a dog):**\n1. Draw an oval for the body\n2. Add a smaller circle for the head\n3. Four thin rectangles for the legs\n4. A wavy line for the tail\n\n**Our Family:**\n1. Circle for each person\'s head\n2. Rectangle for the body\n3. Thin rectangles for arms and legs\n4. Make taller people bigger and smaller people (like you!) a bit shorter'),
  fb(4, 'A line that has sharp points going up and down is called a ___ line. A line that bends gently and smoothly is called a ___ line.',
    ['zigzag', 'curved'],
    'Zigzag lines have sharp, pointy turns like lightning bolts. Curved lines bend gently and smoothly like a rainbow.'),
  t(5, '### Colouring Inside the Lines\n\nColouring is one of the most important art skills. Here are some tips to make your colouring look fantastic:\n\n**How to colour neatly:**\n- Hold your crayon or pencil **near the tip** for better control\n- Colour in **one direction** — go the same way each time (side to side or up and down)\n- Start from the **edge** and work your way in — this helps you stay inside the lines\n- Press **lightly** at first, then press harder to fill in the colour\n- Take your time! Rushing makes messy colouring\n\n**Colouring tricks:**\n- For a smooth look, colour in small **circles**\n- For a grass or fur look, colour in short **lines**\n- Layering two colours on top of each other makes a brand new colour!\n\nIn South Africa, the Ndebele people are famous for painting beautiful, colourful patterns on their houses. They colour every shape neatly and brightly — you can try to be just as neat!'),
  q(6, 'When colouring, where should you start to stay inside the lines?',
    ['In the middle', 'Anywhere you like', 'From the edge and work inward', 'Outside the lines first'], 2,
    'Starting from the edge of the shape and colouring inward helps you stay neatly inside the lines.',
    ['Think about what would help you not go over the border of the shape.']),
  t(7, '### Drawing Things Around Us\n\nThe best way to get better at drawing is to draw what you see! Here are some fun things to draw:\n\n- **Your school** — the buildings, the playground, the flag\n- **Your family** — mum, dad, brothers, sisters, gogo, and everyone!\n- **Your favourite food** — a plate of pap and wors, a vetkoek, or a bunny chow\n- **Animals** — a dog, a cat, chickens, or even a big elephant\n- **Nature** — a tree, flowers, the sun, clouds, and mountains\n\n**Remember:** Your drawing does not have to look exactly like the real thing. Art is about having fun and showing the world the way **you** see it. Every artist has their own special style!\n\n**Fun challenge:** Draw a picture of your family in front of your home. Use straight lines for the house, curved lines for the people, and lots of bright colours. Show it to someone you love!'),
  fb(8, 'The four basic shapes that help us draw are a circle, a ___, a triangle, and a ___.',
    ['square', 'rectangle'],
    'Circles, squares, triangles, and rectangles are the four basic shapes. Almost anything can be drawn by combining these shapes together.'),
  q(9, 'The Ndebele people are famous for painting colourful patterns on their:',
    ['Cars', 'Clothes only', 'Houses', 'Shoes'], 2,
    'The Ndebele women of Mpumalanga are famous for painting bright, geometric patterns on the outside walls of their houses.',
    ['Think about something big that you can paint bright colours on.']),
];

// ===============================================================================
// CHAPTER 2: Colours and Painting (Term 1)
// ===============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Colours and Painting\n\nColours make the world beautiful and exciting! Imagine if everything was grey — how boring would that be? In this chapter, we will learn about special colours and how to paint with them.\n\n### The Three Primary Colours\n\nThere are three very special colours called **primary colours**:\n- **Red** — like a juicy tomato or a fire engine\n- **Yellow** — like the sunshine or a banana\n- **Blue** — like the sky on a clear day or the sea\n\nThese three colours are special because you **cannot** make them by mixing other colours. But here is the magic — you can mix primary colours together to make NEW colours!\n\n### Mixing Colours\n\nWatch what happens when we mix two primary colours:\n\n| Mix These | You Get |\n|-----------|--------|\n| Red + Yellow | **Orange** (like a carrot or a sunset!) |\n| Blue + Yellow | **Green** (like grass or a tree!) |\n| Red + Blue | **Purple** (like grapes or a Jacaranda tree!) |\n\nOrange, green, and purple are called **secondary colours** because they are made by mixing two primary colours.\n\nLook at the South African flag — it has red, blue, green, yellow, black, and white. Can you spot the primary colours in our flag?'),
  q(2, 'What colour do you get when you mix blue and yellow?',
    ['Orange', 'Green', 'Purple', 'Brown'], 1,
    'Mixing the primary colours blue and yellow together makes the secondary colour green — like the beautiful green grass in a park!',
    ['Think of something in nature that is this colour — like leaves and grass.']),
  t(3, '### Finger Painting Fun\n\n**Finger painting** is one of the most fun ways to paint! Here is how to do it:\n\n1. Put on an old shirt or apron so you don\'t get paint on your clothes\n2. Spread a big piece of paper on the table\n3. Squeeze blobs of paint onto a plate — start with just the primary colours\n4. Dip your fingers into the paint and start making marks on the paper!\n\n**Things to try with finger painting:**\n- Use your **fingertip** to make dots and small marks\n- Use your **whole finger** to make thick lines\n- Use your **palm** to make big prints — like handprints!\n- Press two paint colours together with your fingers and watch them MIX\n\n**Important:** Always wash your hands with soap and water when you are done.\n\n### Painting with a Brush\n\nAs you get more practice, you will use a paintbrush too. Here are the rules for using a paintbrush:\n\n- Hold the brush like a **fat pencil**, not too tight\n- Dip only the **tip** of the brush in the paint — not the whole brush!\n- **Wipe** extra paint on the edge of the container\n- Use the **tip** for thin lines and the **side** for thick lines\n- **Never** leave your brush standing in the water — it bends the bristles'),
  fb(4, 'The three primary colours are red, ___, and ___.',
    ['yellow', 'blue'],
    'Red, yellow, and blue are the three primary colours. They cannot be made by mixing other colours together, but you can mix them to create new colours!'),
  t(5, '### Keeping Things Clean\n\nPainting can be messy, but a good artist always keeps things tidy! Here are the rules:\n\n**Before painting:**\n- Cover the table with old newspaper or plastic\n- Wear an old shirt, apron, or a bin bag with holes for your arms and head\n- Fill a cup with clean water for washing your brush\n- Have paper towels or old cloths ready\n\n**While painting:**\n- Wash your brush in the water **every time** you change colours — this keeps your colours bright and clean\n- If your water gets dirty, ask your teacher for fresh water\n- Wipe up any spills straight away\n\n**After painting:**\n- Wash your brush carefully with soap and water\n- Clean your palette and water cup\n- Wipe down the table\n- Wash your hands well\n- Let your painting dry flat — do not touch it while it is wet!\n\nIn South Africa, many artists paint outdoors. Street artists in cities like Johannesburg, Cape Town, and Durban paint huge, colourful murals on walls. They always clean up after themselves too!'),
  q(6, 'Why must you wash your paintbrush when changing colours?',
    ['Because the teacher says so', 'To keep the colours bright and clean', 'Because brushes like water', 'To make the painting dry faster'], 1,
    'Washing your brush between colours stops the paints from getting muddy and mixed together. This keeps each colour looking bright and beautiful!',
    ['Think about what would happen if you dipped a red brush straight into yellow paint.']),
  t(7, '### Colours and Feelings\n\nDid you know that colours can make you feel things?\n\n- **Red** can feel exciting, bold, and warm — like a campfire\n- **Blue** can feel calm, peaceful, and cool — like a quiet lake\n- **Yellow** can feel happy, sunny, and cheerful — like a bright morning\n- **Green** can feel fresh and natural — like walking in the bush\n- **Orange** can feel friendly and warm — like a cosy blanket\n- **Purple** can feel magical and special — like the Jacaranda trees blooming in Pretoria\n\nWhen you paint, think about how you want people to feel when they look at your picture. If you want them to feel happy, use lots of yellows and oranges. If you want them to feel calm, use blues and greens.\n\n**Fun activity:** Paint two pictures of the same thing — maybe a tree. Paint one with warm colours (red, orange, yellow) and one with cool colours (blue, green, purple). See how different they feel!'),
  fb(8, 'Red, orange, and yellow are called ___ colours. Blue, green, and purple are called ___ colours.',
    ['warm', 'cool'],
    'Warm colours (red, orange, yellow) remind us of warm things like fire and sunshine. Cool colours (blue, green, purple) remind us of cool things like water and shade.'),
  q(9, 'Which of these is NOT a primary colour?',
    ['Red', 'Green', 'Yellow', 'Blue'], 1,
    'Green is a secondary colour made by mixing blue and yellow. The three primary colours are red, yellow, and blue.',
    ['Primary colours cannot be made by mixing. Which one of these CAN be made by mixing two others?']),
];

// ===============================================================================
// CHAPTER 3: Music and Singing (Term 2)
// ===============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Music and Singing\n\nMusic is all around us — birds singing in the garden, rain tapping on the roof, people clapping and singing at a rugby match. In South Africa, we LOVE music! Let\'s learn more about it.\n\n### Singing Together\n\nSinging is one of the best things you can do! When we sing together as a class, it sounds beautiful because all our voices join up.\n\n**How to sing well:**\n- Stand up tall and straight — this helps your voice come out strong\n- Take a deep breath before you start — breathe from your tummy, not just your chest\n- Open your mouth wide so the words come out clearly\n- Listen to the people around you — try to sing at the same speed\n- Smile! It actually makes your singing sound better\n\n### South African Songs We Love\n\n**Nkosi Sikelel\' iAfrika** — This is part of our national anthem. It means "God Bless Africa." It was written by Enoch Sontonga in 1897 and is sung in five of South Africa\'s languages! When we sing it at school assembly, we stand up straight and put our hand on our heart.\n\n**Shosholoza** — This famous song was sung by workers on the trains and in the mines. It means "go forward" or "push on." You might hear it at a Springbok rugby match or a Bafana Bafana soccer game! Everyone sings it together.\n\n**Thula Baba** — This is a gentle Zulu lullaby that mamas sing to their babies. "Thula" means "be quiet" or "hush." It is soft and soothing.'),
  q(2, 'What does the song "Shosholoza" mean?',
    ['Good morning', 'Go forward / push on', 'Sleep well', 'Happy birthday'], 1,
    'Shosholoza means "go forward" or "push on." It was first sung by workers on the trains and mines and is now sung all over South Africa, especially at sports matches.',
    ['Think about what workers would want to say to encourage each other — keep going!']),
  t(3, '### Loud and Soft\n\nMusic can be **loud** or **soft**:\n\n- **Loud** (we call this **forte** in music) — like a drum at a festival, thunder in a storm, or a crowd cheering at a stadium\n- **Soft** (we call this **piano** in music) — like a whisper, a lullaby, or rain falling gently\n\nA good singer knows when to be loud and when to be soft. Think about "Thula Baba" — should we sing it loudly or softly? Softly, of course, because it is a lullaby for a sleeping baby!\n\nAnd when we sing "Shosholoza" at a big sports match, should we sing loudly or softly? LOUDLY, because we want everyone to hear and feel the energy!\n\n### Fast and Slow\n\nMusic also moves at different speeds. We call this **tempo**:\n- **Fast tempo** — like when you run, dance at a party, or clap quickly\n- **Slow tempo** — like when you walk slowly, rest, or listen to a gentle song\n\nSome songs start slow and get faster — that builds excitement! Some songs start fast and then slow down at the end.'),
  fb(4, 'When music is loud, we call it ___. When music is soft, we call it ___.',
    ['forte', 'piano'],
    'In music, "forte" means loud and "piano" means soft. Yes — the piano instrument was named because it could play both soft and loud!'),
  t(5, '### Clapping Rhythms\n\nA **rhythm** is a pattern of sounds. You can make rhythms by clapping your hands!\n\n**Try these rhythms:**\n\n1. **Steady beat:** Clap — Clap — Clap — Clap (like a clock ticking, all the same)\n2. **Long-short:** Claaap — Clap — Claaap — Clap (one long, one short)\n3. **Call and response:** The teacher claps a pattern, and you clap it back! This is very popular in African music.\n\n**Call and response** is a big part of South African music. One person (the leader) sings or claps a part, and the group answers. You hear this in church, at celebrations, and in traditional Zulu and Xhosa songs.\n\n### Body Percussion\n\nYou do not need an instrument to make music — your body IS an instrument!\n\n- **Clap** your hands\n- **Stomp** your feet\n- **Pat** your knees\n- **Snap** your fingers\n- **Tap** your chest\n\nIn South Africa, **gumboot dancers** make amazing rhythms by slapping their Wellington boots and stamping their feet. This started with gold miners who were not allowed to talk, so they made music with their boots instead!'),
  q(6, 'What is "call and response" in music?',
    ['Everyone sings at the same time', 'One person sings and the group answers back', 'Only the teacher sings', 'You sing quietly by yourself'], 1,
    'Call and response is when a leader sings or plays a part (the call) and the group copies or answers back (the response). It is a very important part of African music!',
    ['Think about a teacher saying something and the class saying it back.']),
  t(7, '### Making Music with Everyday Things\n\nYou can make music with things you find at home or school:\n\n- **Dried beans in a bottle** — shake it for a shaker sound\n- **Two sticks** — tap them together for a rhythm\n- **Pots and wooden spoons** — tap them for a drum sound\n- **A ruler on a desk** — twang it for a funny vibrating sound\n\nIn many South African communities, people make beautiful music with homemade instruments. Tin can guitars, oil drum drums, and plastic pipe marimbas can be found all over the country!\n\n**Fun challenge:** Make your own shaker at home. Find a small plastic bottle, put some dried beans or rice inside, put the lid on tightly, and decorate it with paint or stickers. Now you have your very own instrument!'),
  fb(8, 'A pattern of sounds is called a ___. Gumboot dancers make rhythms by slapping their ___ and stamping their feet.',
    ['rhythm', 'boots'],
    'A rhythm is a pattern of sounds — long and short, loud and soft. Gumboot dancers slap their Wellington boots to create amazing rhythms. This tradition started in the gold mines of South Africa.'),
  q(9, 'Why did gold miners start making music with their boots?',
    ['Because they loved dancing', 'Because they were not allowed to talk', 'Because they had no radio', 'Because their boots were too big'], 1,
    'The gold miners were not allowed to talk underground, so they invented a way to communicate and make music by slapping and stamping their gumboots. This became the art of gumboot dancing!',
    ['Think about what the miners needed because they could not use words.']),
];

// ===============================================================================
// CHAPTER 4: Dance and Movement (Term 2)
// ===============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Dance and Movement\n\nDancing is one of the most fun things you can do! When you hear music, does your body want to move? That is because music and movement go together like pap and gravy!\n\n### Moving to Music\n\nWhen we dance, we move our bodies in time with the music. Here are the basic ways to move:\n\n- **Walking** — step to the beat, one foot then the other\n- **Running** — quick small steps when the music is fast\n- **Skipping** — a happy, bouncy step (step-hop, step-hop)\n- **Jumping** — both feet leave the ground at the same time\n- **Galloping** — one foot leads, the other catches up (like a horse!)\n- **Swaying** — rocking gently from side to side, like a tree in the wind\n\n**Tip:** Listen to the music first before you start moving. Is it fast or slow? Loud or soft? Happy or gentle? Let the music tell your body what to do!\n\n### High and Low\n\nYour body can move at different **levels**:\n\n- **High level** — standing on your tiptoes, reaching your arms up to the sky, jumping\n- **Medium level** — standing normally, walking, gentle arm movements\n- **Low level** — crouching down, crawling, rolling on the ground\n\nTry this: Start at a low level (crouching down small like a seed). Slowly rise up to a medium level (growing like a plant). Then stretch up to a high level (reaching for the sun like a tall tree)!'),
  q(2, 'Which movement level means crouching down low to the ground?',
    ['High level', 'Medium level', 'Low level', 'Super level'], 2,
    'Low level means your body is close to the ground — crouching, crawling, sitting, or lying down.',
    ['Think about which level is closest to the floor.']),
  t(3, '### Fast and Slow\n\nJust like music has a tempo, dance can be fast or slow:\n\n- **Fast dancing** — quick feet, energetic jumping, spinning around. Think of the fast drumming at a Zulu dance!\n- **Slow dancing** — gentle steps, flowing arms, smooth movements. Think of swaying slowly to a lullaby.\n\nA good dancer can switch between fast and slow. Try this: move as fast as you can for 10 seconds, then when the teacher says "SLOW," move in slow motion like a snail. It is harder than you think!\n\n### Freeze Dance\n\n**Freeze dance** is a game that helps you control your body:\n\n1. The teacher plays music — everyone dances!\n2. When the music STOPS — everyone FREEZES like a statue!\n3. You must hold your pose perfectly still — no wobbling!\n4. When the music starts again — dance!\n5. If you move during a freeze, you sit out for one round\n\n**Tip:** When you freeze, try to make an interesting shape with your body. Can you freeze at a high level? A low level? Can you balance on one foot?'),
  fb(4, 'When music is playing, you ___. When the music stops, you ___ like a statue.',
    ['dance', 'freeze'],
    'In freeze dance, you move and dance when the music plays, and you must freeze completely still like a statue the moment the music stops!'),
  t(5, '### Gumboot Dancing\n\n**Gumboot dancing** (isicathulo) is one of South Africa\'s most famous dances! Here is its story:\n\nLong ago, gold miners in Johannesburg worked deep underground in wet, dark tunnels. They wore tall rubber boots called **gumboots** (Wellington boots) to keep their feet dry. The miners were not allowed to talk, so they invented a way to communicate by:\n- **Slapping** their boots with their hands\n- **Stamping** their feet on the ground\n- **Clapping** their hands\n- Making **rhythmic patterns** together\n\nToday, gumboot dancing is performed all over the world! The dancers wear colourful gumboots and make incredible rhythms.\n\n**Basic gumboot moves you can try:**\n1. Stomp your right foot — STOMP\n2. Stomp your left foot — STOMP\n3. Slap your right boot with your right hand — SLAP\n4. Slap your left boot with your left hand — SLAP\n5. Clap your hands together — CLAP\n6. Now put it together: STOMP-STOMP-SLAP-SLAP-CLAP!'),
  q(6, 'Where did gumboot dancing first start?',
    ['At a school', 'In the gold mines of Johannesburg', 'On the beach', 'At a shopping mall'], 1,
    'Gumboot dancing started with the gold miners in Johannesburg. They invented it because they were not allowed to talk underground, so they made music and communicated through stamping and slapping their boots.',
    ['Think about who wears gumboots for their work — workers in wet, underground places.']),
  t(7, '### Creative Movement\n\nCreative movement means using your body to show ideas and feelings without using words. Try these:\n\n- **Be a melting ice cream:** Start standing tall, then slowly droop and melt all the way down to the floor\n- **Be a popcorn kernel:** Start crouched small, then suddenly POP up and jump around!\n- **Be a robot:** Move with stiff, jerky movements — arms straight, legs stiff\n- **Be a butterfly:** Move softly and gently, flapping your arms like wings\n- **Be a thunderstorm:** Start with gentle rain (finger tapping), get louder (clapping), then BOOM (stomping) and back to gentle rain\n\n### Warming Up\n\nBefore we dance, we always **warm up** our bodies. This stops us from getting hurt.\n\n**A fun warm-up:**\n1. Shake your right hand — 1, 2, 3, 4!\n2. Shake your left hand — 1, 2, 3, 4!\n3. Shake your right foot — 1, 2, 3, 4!\n4. Shake your left foot — 1, 2, 3, 4!\n5. Now do it with 3 shakes, then 2, then 1!\n6. End with a big jump and shout "HEY!"'),
  fb(8, 'Before we dance, we always ___ our bodies to stop us from getting hurt. Gumboot dancing is also called ___.',
    ['warm up', 'isicathulo'],
    'Warming up prepares your muscles for dancing and helps prevent injuries. Gumboot dancing is called "isicathulo" in Zulu, named after the boots the dancers wear.'),
  q(9, 'In creative movement, if you are pretending to be a melting ice cream, you should:',
    ['Jump up and down quickly', 'Stand very still like a statue', 'Start tall and slowly droop down to the floor', 'Run around the room'], 2,
    'A melting ice cream starts standing tall and slowly droops, sags, and melts all the way down to the floor — from high level to low level!',
    ['Think about what happens to an ice cream on a hot day — it slowly slides down!']),
];

// ===============================================================================
// CHAPTER 5: Cutting and Pasting (Term 2)
// ===============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Cutting and Pasting\n\nUsing scissors and glue is a big part of making art! In this chapter, we will learn how to cut safely, paste neatly, and make beautiful things from paper.\n\n### Using Scissors Safely\n\nScissors are tools, not toys. Here are the important safety rules:\n\n**Safety rules:**\n1. Always **walk** when carrying scissors — never run!\n2. When walking with scissors, hold them by the **closed blades** pointing down\n3. Only cut **paper and card** — never cut hair, clothes, or anything else\n4. Keep your fingers **away from the blades** — hold the paper with one hand and cut with the other\n5. Always use scissors with the **pointy tip** going away from your body\n6. When you are done, put scissors down on the table with the blades **closed**\n7. If you drop your scissors, **let them fall** — do not try to catch them!\n\n**How to hold scissors:**\n- Put your thumb in the small hole\n- Put your middle finger in the big hole\n- Rest your pointer finger on the outside of the handle for control\n- Open and close gently — let the scissors do the work!'),
  q(2, 'When walking with scissors, how should you hold them?',
    ['Open and pointing up', 'By the blades, pointing down', 'Hidden behind your back', 'Swinging at your side'], 1,
    'When walking with scissors, always hold them by the closed blades pointing downward. This keeps you and everyone around you safe.',
    ['Think about the safest way — where should the sharp parts point?']),
  t(3, '### Cutting Shapes\n\nLet\'s practise cutting different shapes:\n\n**Cutting a straight line:**\n- Draw a line with a ruler first\n- Cut slowly along the line\n- Keep the scissors straight\n\n**Cutting a circle:**\n- Draw around something round (a cup or a lid)\n- Turn the **paper**, not the scissors, as you cut\n- Go slowly around the curves\n\n**Cutting a triangle:**\n- Cut three straight lines that join up\n- Turn the paper at each corner\n\n**Cutting a zigzag:**\n- Cut a straight line, then turn the paper sharply and cut in the other direction\n- Keep turning back and forth\n\n**Tip:** It is easier to cut if you hold the paper up slightly instead of flat on the table.\n\n### Paper Tearing\n\nSometimes we do not need scissors at all! **Tearing paper** is a special art technique:\n- Tear slowly for a rough, interesting edge\n- Torn paper makes great mountains, clouds, trees, and animals in a collage\n- It is easier to tear paper if you fold it first along where you want to tear'),
  fb(4, 'When cutting a circle, you should turn the ___ and not the scissors. Tearing paper gives you a rough, interesting ___.',
    ['paper', 'edge'],
    'When cutting a circle, turn the paper slowly while keeping the scissors steady — this gives you a smooth curve. Torn paper has a rough, textured edge that looks great in collages and art projects.'),
  t(5, '### Making a Collage\n\nA **collage** is a picture made by sticking different pieces of paper, fabric, or other materials onto a background.\n\n**How to make a collage:**\n1. Choose a background — a big piece of card or paper\n2. Collect materials — old magazines, coloured paper, newspaper, fabric scraps, sweet wrappers\n3. Cut or tear your materials into shapes\n4. **Plan first!** Lay all your pieces down before gluing — move them around until you like the arrangement\n5. Glue each piece down, starting with the background pieces first (things at the back) and finishing with the front pieces on top\n6. Press each piece down firmly so it sticks well\n\n**Fun collage ideas:**\n- A South African sunset — tear orange, red, and yellow paper for the sky, and cut out a black silhouette of a thorn tree\n- An underwater scene — cut out fish, seaweed, and bubbles from coloured paper\n- A collage of your favourite things — cut pictures from old magazines'),
  q(6, 'Before gluing pieces in a collage, what should you do first?',
    ['Glue everything down quickly', 'Lay all pieces down and plan the arrangement', 'Throw away the pieces you don\'t like', 'Colour all the pieces first'], 1,
    'Always plan your collage before gluing! Lay all the pieces out on the paper first and move them around until you are happy with how they look. Then start gluing.',
    ['Think about what happens if you glue something in the wrong place — it is hard to fix!']),
  t(7, '### Making a Card for Someone Special\n\nOne of the nicest things you can make with cutting and pasting is a **card for someone you love** — your mum, dad, gogo, teacher, or friend.\n\n**How to make a card:**\n1. Fold a piece of card in half\n2. Decorate the **front** with cut-out shapes, drawings, or a collage\n3. Write a message **inside** — like "I love you, Mama" or "Thank you, Teacher"\n4. You could add a cut-out heart, flower, or star\n\n**Ideas for cards:**\n- **Mother\'s Day card** — cut out flowers and hearts\n- **Birthday card** — cut out a cake shape and add candles (thin paper strips)\n- **Get well card** — bright, cheerful colours and a big smiley face\n- **Thank you card** — decorate with the person\'s favourite colours\n\nIn South Africa, we celebrate Heritage Day on 24 September. You could make a beautiful Heritage Day card with pictures of SA flags, animals, or traditional clothing!'),
  fb(8, 'A picture made by sticking pieces of paper and other materials onto a background is called a ___. When making a card, you fold the paper in ___.',
    ['collage', 'half'],
    'A collage is an artwork made by cutting or tearing different materials and gluing them onto a background. Cards are made by folding paper or card in half to create a front cover and an inside.'),
  q(9, 'Which of these is a safety rule for using scissors?',
    ['Run with them so you finish faster', 'Try to catch them if you drop them', 'Only cut paper and card, not hair or clothes', 'Hold them by the open blades'], 2,
    'Scissors should only be used to cut paper and card. Never cut hair, clothes, or other things. And never try to catch falling scissors — let them fall!',
    ['Think about what could go wrong if you cut something other than paper.']),
  t(10, '### Recycled Art\n\nIn South Africa, many artists make amazing art from things that other people throw away! This is called **recycled art**.\n\n- Old magazines become beautiful collages\n- Plastic bags can be woven into baskets and bags\n- Bottle caps can be glued together to make pictures\n- Toilet rolls become binoculars, animals, or castles\n\nUsing recycled materials for art is good for our planet because we reuse things instead of throwing them in the rubbish. Next time you finish a cereal box or cool drink bottle, think: "Can I make art with this?"'),
];

// ===============================================================================
// CHAPTER 6: Drama and Storytelling (Term 3)
// ===============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Drama and Storytelling\n\nHave you ever pretended to be a superhero, a teacher, or an animal? Then you have already been doing **drama**! Drama is when we act out stories and pretend to be different characters.\n\n### Acting Out Stories\n\nWhen we act out a story, we use three things:\n1. **Our body** — how we move, stand, and use our hands\n2. **Our voice** — how we speak (loud, soft, fast, slow, high, low)\n3. **Our face** — how we show feelings (happy, sad, scared, angry, surprised)\n\n**Try this:** Without saying a word, show your class these feelings using only your face and body:\n- **Happy** — big smile, arms up, bouncing on your toes\n- **Sad** — mouth turned down, shoulders drooping, head hanging\n- **Scared** — eyes wide, mouth open, body shaking, pulling back\n- **Angry** — eyebrows down, fists clenched, stomping feet\n- **Surprised** — eyebrows up, mouth in a big O, hands on cheeks\n\nThis is called **mime** — acting without words. Mime is a great way to practise using your body to tell a story.'),
  q(2, 'What is it called when you act without using any words?',
    ['Singing', 'Dancing', 'Mime', 'Drawing'], 2,
    'Mime is when you act out a scene using only your body, face, and movements — no words at all! It is a very old form of drama.',
    ['Think about acting that uses only movement, not talking.']),
  t(3, '### Pretending to Be Animals\n\nOne of the most fun drama activities is pretending to be animals! South Africa has the most amazing animals in the world.\n\n**Try to move like these animals:**\n\n- **Elephant** — walk slowly with heavy stomping feet, swing your arm like a trunk, be big and proud\n- **Lion** — walk low and slowly like you are sneaking up on something, then ROAR!\n- **Monkey** — jump around, scratch your head, make cheeky faces, climb imaginary trees\n- **Snake** — lie on the ground and slither, keep your body close to the floor, hissssss\n- **Flamingo** — stand on one leg, tuck one arm behind you like a wing, be very still and elegant\n- **Frog** — crouch low, then JUMP with both feet, croak!\n\n**Game: Animal Parade**\nThe teacher calls out an animal name, and everyone moves around the room pretending to be that animal. When the teacher says "FREEZE," everyone stops. Then a new animal is called!'),
  fb(4, 'When we act, we use our body, our ___, and our face. Acting without words is called ___.',
    ['voice', 'mime'],
    'The three tools of an actor are the body (movement), the voice (how we speak), and the face (showing feelings). When we act without any words at all, it is called mime.'),
  t(5, '### Using Our Voices\n\nYour voice is like a musical instrument — it can do many things!\n\n**Volume:**\n- **Loud** — like a lion roaring or a teacher calling the class\n- **Soft** — like a mouse squeaking or telling a secret\n\n**Pitch:**\n- **High** — like a tiny bird chirping or a baby crying\n- **Low** — like a big bear growling or a drum booming\n\n**Speed:**\n- **Fast** — like an excited child telling a story\n- **Slow** — like a sleepy tortoise talking\n\n**Try this exercise:** Say the sentence "I am going to the shop" in these different ways:\n1. Like you are VERY excited\n2. Like you are very sad\n3. Like you are a tiny mouse\n4. Like you are a big, scary giant\n5. Like you are in a big hurry\n6. Like you are very, very sleepy\n\nNotice how the same words sound completely different depending on HOW you say them!'),
  q(6, 'If you speak with a high pitch, you sound like a:',
    ['Big bear growling', 'Tiny bird chirping', 'Drum booming', 'Car engine'], 1,
    'A high-pitched voice sounds like a small, light thing — like a bird chirping, a mouse squeaking, or a whistle blowing.',
    ['Think about small animals — do they make high sounds or low sounds?']),
  t(7, '### South African Animal Stories and Folktales\n\nSouth Africa has wonderful stories that have been told for hundreds and hundreds of years. Here are two favourites:\n\n**Why Tortoise Has a Cracked Shell (Zulu folktale):**\nLong ago, Tortoise was invited to a party in the sky. But Tortoise cannot fly! So he tricked the birds into carrying him up. At the party, greedy Tortoise ate all the food and made the birds angry. They took back the feathers they had lent him, and Tortoise fell all the way down — CRASH! — and cracked his shell. That is why, to this day, Tortoise\'s shell has cracks all over it.\n\n**Jackal and the Sun (Khoisan story):**\nSly Jackal saw the Sun resting on the ground one morning and wanted to steal its warmth. He grabbed the Sun, but it was too hot! Jackal burned his paws and dropped the Sun back into the sky, where it has stayed ever since.\n\n**Activity:** Get into groups of four or five. Choose one of these stories and act it out for the class. Remember to use your body, voice, and face!'),
  fb(8, 'In the Zulu folktale, Tortoise fell from the sky and ___ his shell. In the Khoisan story, Jackal tried to steal the ___ but it was too hot.',
    ['cracked', 'Sun'],
    'Tortoise cracked his shell when he fell from the sky party — that is why tortoise shells have cracks! Jackal burned his paws trying to steal the Sun in the Khoisan story.'),
  q(9, 'What are the three things we use when acting?',
    ['Pencil, paper, and crayons', 'Body, voice, and face', 'Running, jumping, and swimming', 'Singing, clapping, and stamping'], 1,
    'The three main tools of an actor are the body (movement and gestures), the voice (how you speak), and the face (showing emotions and expressions).',
    ['Think about what parts of yourself you use to pretend to be someone else.']),
];

// ===============================================================================
// CHAPTER 7: Making Things (Term 3)
// ===============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Making Things\n\nHave you ever squished playdough between your fingers or built a tower from boxes? Making things with your hands is one of the most fun parts of Creative Arts!\n\n### Working with Clay and Playdough\n\n**Clay** and **playdough** are soft materials that you can squish, roll, press, and shape into anything you can imagine!\n\n**Basic techniques:**\n\n| Technique | How to Do It | What It Makes |\n|-----------|-------------|---------------|\n| **Rolling** | Roll between your hands to make a ball, or on the table to make a sausage | Round shapes, long shapes |\n| **Pinching** | Squeeze small pieces with your thumb and fingers | Ears, noses, beaks, thin edges |\n| **Pressing** | Push your thumb or a tool into the clay to make a hole | Bowls, cups, eyes |\n| **Smoothing** | Rub gently with a wet finger | Smooth, neat surfaces |\n| **Joining** | Scratch both surfaces, add a bit of water, and press together | Attaching arms, legs, tails |\n\n**Homemade playdough recipe (ask a grown-up to help):**\n- 2 cups flour\n- 1 cup salt\n- 1 cup water\n- 2 tablespoons cooking oil\n- Food colouring (if you have some)\n- Mix it all together until it is smooth and soft!'),
  q(2, 'Which technique should you use to make a bowl shape from clay?',
    ['Rolling', 'Pressing your thumb into the clay', 'Cutting with scissors', 'Tearing the clay'], 1,
    'To make a bowl, start with a ball of clay and press your thumb into the middle. Then slowly press and turn to make the hole bigger — this is called a pinch pot!',
    ['Think about how a bowl is shaped — it has a hole in the middle.']),
  t(3, '### Making Animals\n\nLet\'s make a clay animal! Here is how to make a **tortoise** (a favourite South African animal):\n\n1. Roll a big ball for the **shell**\n2. Flatten the bottom slightly so it does not roll\n3. Roll a small ball for the **head** and four tiny sausages for the **legs**\n4. Roll a tiny thin piece for the **tail**\n5. Scratch the places where you want to attach the head, legs, and tail\n6. Wet the scratched areas slightly and press the pieces on firmly\n7. Use a pencil to draw the pattern on the shell — circles and lines\n8. Make two tiny dots for **eyes**\n\n**Other easy animals to make:**\n- **Snake** — just one long sausage rolled into a coil, with two dot eyes\n- **Caterpillar** — lots of small balls pressed together in a line\n- **Bird** — one ball for the body, a small ball for the head, pinch out a beak and a tail\n\n### Making People\n\nTo make a simple person:\n1. Roll a ball for the head\n2. Roll a bigger shape for the body\n3. Roll four sausages for the arms and legs\n4. Scratch and wet to join the pieces\n5. Add details — eyes, mouth, hair, clothes'),
  fb(4, 'Before attaching two pieces of clay together, you should ___ both surfaces and add a bit of water. Making a bowl by pressing your thumb into a ball of clay is called a ___ pot.',
    ['scratch', 'pinch'],
    'Scratching both surfaces and adding water helps clay pieces stick together firmly. A pinch pot is made by pushing your thumb into a ball of clay and pinching the sides to make them thinner.'),
  t(5, '### Building with Boxes\n\nYou can build amazing things from old boxes and packaging! This is a great way to **recycle**.\n\n**Things you can build:**\n- **Robot** — stack boxes of different sizes, add bottle cap eyes and a yoghurt tub head\n- **Car** — a shoebox body, bottle cap wheels, a small box glued on top for the driver\'s seat\n- **Castle** — cereal boxes for towers, a shoebox for the wall, cut out a door and windows\n- **City** — lots of different boxes painted to look like buildings, with roads drawn on big paper\n\n**Tips for building with boxes:**\n- Use **masking tape** to hold boxes together before gluing — it holds better than sticky tape\n- **Paint** your boxes with thick paint or cover them with coloured paper\n- Let each layer **dry** before adding more\n- Collect boxes, toilet rolls, egg cartons, and lids for a few weeks before starting a big project\n\nIn many South African townships, artists build incredible sculptures and art from recycled materials. They show that you do not need expensive materials to make beautiful art — creativity and imagination are what matter most!'),
  q(6, 'What is a good way to hold boxes together before gluing?',
    ['Staples', 'Masking tape', 'String only', 'Wishing very hard'], 1,
    'Masking tape is great for holding boxes together while you build. It holds well and you can paint over it. It is much stronger than regular sticky tape for art projects.',
    ['Think about a type of tape that builders and painters use.']),
  t(7, '### Making a Puppet\n\n**Sock puppet:**\n1. Put a clean old sock on your hand\n2. Push the toe part between your fingers and thumb — that is the **mouth**!\n3. Glue on button **eyes** (or draw them on paper and glue those on)\n4. Add wool or string for **hair**\n5. You can add a felt or paper **tongue** inside the mouth\n6. Give your puppet a name and a funny voice!\n\n**Paper bag puppet:**\n1. Take a brown or white paper bag\n2. The **flap** at the bottom becomes the face\n3. Draw or glue eyes, a nose, and a mouth on the flap\n4. Put your hand inside and use the flap to make the puppet "talk"\n5. Add paper ears, a hat, or wool hair\n\n**Activity:** Make a puppet and create a short show with a friend. Each person uses their puppet to have a conversation. What will your puppets talk about? Maybe they are neighbours arguing about a noisy dog, or friends planning a trip to the Kruger Park!'),
  fb(8, 'To make a sock puppet, push the toe part between your fingers and thumb to make a ___. Building with old boxes is a great way to ___.',
    ['mouth', 'recycle'],
    'The sock puppet\'s mouth is made by pushing the toe of the sock between your fingers and thumb — open and close your hand to make it "talk!" Using old boxes for art is recycling, which is good for our planet.'),
  q(9, 'What do South African township artists show us about making art?',
    ['You need expensive materials', 'You need to go to art school first', 'Creativity matters more than expensive materials', 'Only grown-ups can make art'], 2,
    'South African township artists show that you do not need expensive materials to create beautiful art. With creativity and imagination, you can make amazing things from recycled and everyday materials.',
    ['Think about what matters more — the materials or the idea?']),
];

// ===============================================================================
// CHAPTER 8: Our Concert (Term 4)
// ===============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Our Concert\n\nIt is the end of the year, and it is time for the most exciting event — **our class concert!** This is when we put everything we have learned together and perform for our families. Let\'s get ready!\n\n### Practising for a Show\n\nA good concert needs lots of practise. Here is how to prepare:\n\n**Step 1: Choose what to perform**\nAs a class, decide what your concert will include:\n- A **song** — maybe Shosholoza or another SA song you have learned\n- A **dance** — perhaps a gumboot dance or a creative dance\n- A short **play** — maybe acting out a South African folktale like "Why Tortoise Has a Cracked Shell"\n\n**Step 2: Give everyone a job**\nEvery person in the class should have something to do:\n- Some children will **sing**\n- Some children will **dance**\n- Some children will **act**\n- Some children will help **backstage** (moving things, holding props)\n- A **narrator** can tell the story while others act it out\n\n**Step 3: Practise, practise, practise!**\n- Practise your words so you do not forget them\n- Practise the dance moves so everyone does the same thing\n- Practise singing together so your voices blend\n- Do a **dress rehearsal** — a full practice with costumes, just like the real thing'),
  q(2, 'What is a dress rehearsal?',
    ['Wearing fancy clothes to school', 'A full practice with costumes, just like the real show', 'A rehearsal where you only practise getting dressed', 'A show just for teachers'], 1,
    'A dress rehearsal is a full practice run of the show where everyone wears their costumes and performs exactly as they will on the real day. It helps you feel prepared and confident!',
    ['Think about what the word "rehearsal" means and why you would wear your "dress" (costume).']),
  t(3, '### Singing, Dancing, and Acting Together\n\nIn our concert, we combine all three performing arts:\n\n**Singing together:**\n- Stand in rows so everyone can be seen by the audience\n- The tallest children stand at the **back**, the shortest at the **front**\n- Look at the audience, not at the floor!\n- Watch your teacher for cues to start and stop\n- Smile — even if you feel nervous!\n\n**Dancing together:**\n- Stay in your position — do not bump into others\n- Count the beats in your head so you stay in time\n- Make your movements **big** so the audience can see them, even from the back of the room\n- Remember to use different **levels** — high, medium, and low\n\n**Acting together:**\n- Speak loudly and clearly — your gogo at the back needs to hear you!\n- Face the audience when you speak\n- Wait for your turn — do not talk over other actors\n- If someone forgets their line, help them quietly\n- Keep going even if something goes wrong!'),
  fb(4, 'In a choir, the tallest children stand at the ___ and the shortest stand at the ___.',
    ['back', 'front'],
    'Tallest at the back and shortest at the front means that every child can be seen by the audience. This is how choirs all around the world are arranged!'),
  t(5, '### Making Costumes and Decorations\n\nYou do not need to buy fancy costumes. You can make amazing things from simple materials!\n\n**Easy costume ideas:**\n- **Animal ears** — cut ear shapes from card, colour them, and staple to a strip of card that fits around your head\n- **Crown** — cut a zigzag strip of gold or yellow card and fit it around your head\n- **Cape** — use an old pillowcase or a piece of fabric tied around your neck\n- **Tail** — stuff a leg from old tights with newspaper and pin it to your pants\n- **Face paint** — use face paint crayons (not regular paint!) to draw whiskers, spots, or stripes\n\n**Easy decorations for the stage:**\n- **Backdrop** — paint a big scene on large sheets of paper and tape them to the wall\n- **Stars** — cut star shapes from card, wrap them in foil, and hang them from string\n- **Flowers** — make tissue paper flowers and arrange them along the front of the stage\n- **Bunting** — cut triangles from coloured paper and string them across the room\n\nRemember: the costumes and decorations use skills you learned in the cutting and pasting chapter, and the painting chapter!'),
  q(6, 'Which chapters\' skills would help you make decorations for the concert?',
    ['Music and Dance', 'Drawing and Colouring, Colours and Painting, and Cutting and Pasting', 'Only the Drama chapter', 'No other chapters — decorations are new'], 1,
    'Making decorations uses drawing and colouring skills (chapter 1), painting skills (chapter 2), and cutting and pasting skills (chapter 5) — everything you have learned this year comes together!',
    ['Think about what you need to do to make decorations — draw, paint, cut, paste...']),
  t(7, '### Performing for Parents\n\nThe big day is here! Performing in front of an audience is exciting and a little bit scary — that is completely normal.\n\n**Before the show:**\n- Take **deep breaths** — in through your nose, out through your mouth\n- Remember: your family is there because they **love you** and want to see you shine\n- Do some **warm-up** stretches and vocal exercises\n- Have a drink of **water** so your throat is not dry\n\n**During the show:**\n- Smile at the audience — they will smile back!\n- If you forget a word, just keep going — most people will not notice\n- Enjoy yourself — if you are having fun, the audience will have fun too\n- Look out at the audience sometimes, not just at the floor\n- Support your friends — if someone makes a mistake, do not laugh\n\n**After the show:**\n- **Bow** when the audience claps — this means "thank you for watching"\n- Feel **proud** of yourself! You were brave enough to perform on stage\n- Thank your teacher for helping you prepare'),
  fb(8, 'Before performing, you should take deep ___ to calm your nerves. After the show, you should ___ when the audience claps.',
    ['breaths', 'bow'],
    'Taking deep breaths helps calm your nerves and gives you confidence before performing. Bowing after the show is how performers say "thank you" to the audience for watching.'),
  q(9, 'What should you do if someone forgets their line during the concert?',
    ['Laugh at them loudly', 'Stop the whole show', 'Help them quietly or just keep going', 'Walk off the stage'], 2,
    'If someone forgets their line, help them quietly by whispering the words, or just keep the show going. The audience probably will not even notice! Being kind to each other is the most important thing.',
    ['Think about how you would want your friends to treat you if YOU forgot your line.']),
  t(10, '### Being a Good Audience\n\nSometimes YOU are the one watching, not performing. Being a **good audience member** is just as important as being a good performer!\n\n**Good audience manners:**\n- **Sit still** and watch — do not fidget, talk, or play\n- **Listen** to the performers — they worked very hard\n- **Clap** at the end of each item — this shows you liked it\n- Be **kind** — even if something goes wrong, do not laugh in a mean way\n- **No phones** — watch with your eyes, not a screen!\n- Say something **nice** to the performers afterwards — "Well done!" or "I liked your singing!"\n\n**Well done, Grade 3!** This year you have learned to draw, paint, sing, dance, cut, paste, act, build, and perform. You are a true **creative artist**! Remember — creativity is not about being perfect. It is about expressing yourself, trying new things, and having fun. Keep creating, keep imagining, and keep shining!\n\nHappy holidays! 🎨🎵🎭'),
];


// ===============================================================================
// MAIN — Database insertion
// ===============================================================================
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
    tags: ['grade-3', 'creative-arts', 'caps'],
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
      title: 'Chapter 1: Drawing and Colouring',
      description: 'Lines (straight, curved, wavy, zigzag), shapes (circle, square, triangle, rectangle), colouring inside the lines, drawing things we see (our house, our pet, our family), Ndebele house patterns.',
      order: 1,
      lessons: [
        { title: 'Drawing and Colouring', description: 'Types of lines (straight, curved, wavy, zigzag), basic shapes, colouring tips and techniques, drawing things from everyday life (house, pet, family), Ndebele patterns.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Colours and Painting',
      description: 'Primary colours (red, yellow, blue), mixing colours to make secondary colours (orange, green, purple), finger painting, painting with a brush, keeping things clean, warm and cool colours.',
      order: 2,
      lessons: [
        { title: 'Colours and Painting', description: 'Primary colours (red, yellow, blue), mixing secondary colours (orange, green, purple), finger painting techniques, paintbrush skills, cleaning up, warm and cool colours, colours and feelings, SA flag colours.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Music and Singing',
      description: 'Singing together, SA children\'s songs (Nkosi Sikelel\' iAfrika, Shosholoza, Thula Baba), loud and soft (forte and piano), fast and slow (tempo), clapping rhythms, call and response, gumboot dancing.',
      order: 3,
      lessons: [
        { title: 'Music and Singing', description: 'Singing techniques, SA songs (Nkosi Sikelel\' iAfrika, Shosholoza, Thula Baba), dynamics (loud/forte, soft/piano), tempo (fast and slow), rhythm and clapping, call and response, body percussion, gumboot dancing history, making instruments.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Dance and Movement',
      description: 'Moving to music, high and low levels, fast and slow, freeze dance, gumboot dancing (isicathulo), creative movement, warming up.',
      order: 4,
      lessons: [
        { title: 'Dance and Movement', description: 'Basic movement (walking, running, skipping, jumping, galloping, swaying), high/medium/low levels, fast and slow movement, freeze dance game, gumboot dancing (isicathulo) history and steps, creative movement activities, warming up exercises.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Cutting and Pasting',
      description: 'Using scissors safely, cutting shapes (straight, circle, triangle, zigzag), pasting, making a collage, paper tearing, making a card for someone special, recycled art.',
      order: 5,
      lessons: [
        { title: 'Cutting and Pasting', description: 'Scissors safety rules, cutting techniques for different shapes, paper tearing, collage making, planning before gluing, making cards for special people, Heritage Day card, recycled art and township artists.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Drama and Storytelling',
      description: 'Acting out stories, pretending to be animals, using our voices (loud, soft, high, low), mime, SA animal stories and folktales (Why Tortoise Has a Cracked Shell, Jackal and the Sun).',
      order: 6,
      lessons: [
        { title: 'Drama and Storytelling', description: 'Acting using body, voice, and face, showing feelings, mime, pretending to be SA animals (elephant, lion, monkey, snake, flamingo, frog), voice skills (volume, pitch, speed), Zulu folktale (Why Tortoise Has a Cracked Shell), Khoisan story (Jackal and the Sun), group acting.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Making Things',
      description: 'Working with clay and playdough, making animals and people, building with boxes, making a puppet from a sock or paper bag, recycled art.',
      order: 7,
      lessons: [
        { title: 'Making Things', description: 'Clay and playdough techniques (rolling, pinching, pressing, smoothing, joining), homemade playdough recipe, making a tortoise and other animals, making people, building with recycled boxes (robot, car, castle), sock puppets, paper bag puppets, township recycled art.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Our Concert',
      description: 'Practising for a show, singing, dancing, and acting together, making costumes and decorations, performing for parents, being a good audience.',
      order: 8,
      lessons: [
        { title: 'Our Concert', description: 'Preparing for a class concert, choosing songs/dances/plays, giving everyone a job, dress rehearsal, singing/dancing/acting together, making costumes and decorations from simple materials, performing for parents, dealing with nerves, being a good audience, celebrating the year.', blocks: ch8_lesson1, term: 4 },
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
    title: 'Grade 3 Creative Arts \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Drawing and Colouring, Colours and Painting, Music and Singing, Dance and Movement, Cutting and Pasting, Drama and Storytelling, Making Things, and Our Concert for the Grade 3 Creative Arts curriculum.',
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
  console.log('  TEXTBOOK: Grade 3 Creative Arts');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
