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
// CHAPTER 1: Visual Arts — Colour (Term 1)
// ===============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Colour\n\nWelcome to Grade 5 Creative Arts! In this chapter we explore one of the most exciting elements of art: **colour**. Colour is everywhere around us — in the bright proteas of the Western Cape, the red soil of Limpopo, and the golden sunsets over the Karoo.\n\n### Primary Colours\n\nThe three **primary colours** are:\n- **Red**\n- **Yellow**\n- **Blue**\n\nPrimary colours are special because they **cannot be made** by mixing other colours together. Every other colour is created from these three.\n\n### Secondary Colours\n\nWhen you mix two primary colours, you get a **secondary colour**:\n\n| Mix | Result |\n|-----|--------|\n| Red + Yellow | **Orange** |\n| Yellow + Blue | **Green** |\n| Red + Blue | **Purple (Violet)** |\n\n### Tertiary Colours\n\nWhen you mix a primary colour with a secondary colour next to it on the colour wheel, you get a **tertiary colour**:\n- Red-orange, yellow-orange, yellow-green, blue-green, blue-violet, red-violet\n\nTertiary colours give us more choices and help us create richer artwork.'),
  q(2, 'What are the three primary colours?',
    ['Red, green, blue', 'Red, yellow, blue', 'Red, yellow, green', 'Orange, green, purple'], 1,
    'The three primary colours in art are red, yellow, and blue. They cannot be made by mixing other colours together.',
    ['Primary colours cannot be created by mixing.']),
  t(3, '### The Colour Wheel\n\nThe **colour wheel** is a circle that shows how colours are related to each other. It was first invented by Sir Isaac Newton over 300 years ago!\n\nOn the colour wheel:\n- **Primary colours** are spaced evenly around the wheel\n- **Secondary colours** sit between the primaries that make them\n- **Tertiary colours** sit between a primary and a secondary\n\n### Warm and Cool Colours\n\n| Warm Colours | Cool Colours |\n|-------------|-------------|\n| Red | Blue |\n| Orange | Green |\n| Yellow | Purple |\n\n**Warm colours** remind us of fire, sunshine, and heat. They feel **energetic** and seem to come **forward** in a painting.\n\n**Cool colours** remind us of water, sky, and shade. They feel **calm** and seem to go **back** into the distance.\n\nSouth African artist **Mmakgabo Helen Sebidi** uses warm earth tones — reds, oranges, and browns — in her paintings of rural life in Limpopo. The warm colours make her scenes feel alive and full of energy.'),
  fb(4, 'Warm colours like red, orange, and yellow remind us of ___ and ___. Cool colours like blue, green, and purple feel calm.',
    ['fire', 'sunshine'],
    'Warm colours are associated with heat, fire, and sunshine. They create feelings of energy and warmth in artwork.'),
  t(5, '### How South African Artists Use Colour\n\n**Esther Mahlangu** is a world-famous Ndebele artist from Mpumalanga. She paints bold geometric patterns on houses using bright primary and secondary colours — red, yellow, blue, green, and black outlines. The Ndebele tradition of house painting uses colour to celebrate identity and heritage.\n\n**Nelson Makamo** is a South African artist known for his vibrant portraits of children. He uses warm colours like yellows and oranges alongside cool blues and purples to create striking contrasts.\n\n| Artist | Colours Used | Effect |\n|--------|-------------|--------|\n| Esther Mahlangu | Bold primary and secondary colours | Celebration and cultural pride |\n| Nelson Makamo | Warm and cool contrasts | Energy and emotion |\n\n### Mixing Colours in Practice\n\nWhen mixing paint:\n- Add a **small amount** of the darker colour to the lighter one (a little blue goes a long way!)\n- To make a colour **lighter**, add white — this is called a **tint**\n- To make a colour **darker**, add black — this is called a **shade**\n- Mix on a palette, not on your paper\n- Clean your brush between colours to keep them bright'),
  q(6, 'Which Ndebele artist is famous for painting bold, colourful geometric patterns on houses?',
    ['Nelson Makamo', 'Esther Mahlangu', 'William Kentridge', 'Mmakgabo Helen Sebidi'], 1,
    'Esther Mahlangu is world-famous for her Ndebele house paintings featuring bold geometric patterns in bright primary and secondary colours.'),
  fb(7, 'Adding white to a colour creates a ___. Adding black to a colour creates a ___.',
    ['tint', 'shade'],
    'A tint is a colour lightened with white. A shade is a colour darkened with black. These help artists create variety and depth.'),
  q(8, 'What colour do you get when you mix red and yellow?',
    ['Green', 'Purple', 'Orange', 'Brown'], 2,
    'Red mixed with yellow creates orange, which is a secondary colour.'),
  t(9, '### Complementary Colours\n\nColours that are **opposite** each other on the colour wheel are called **complementary colours**:\n- Red and Green\n- Blue and Orange\n- Yellow and Purple\n\nWhen placed next to each other, complementary colours make each other look **brighter** and more vivid. Artists use this trick to make parts of their artwork stand out.\n\n**Activity idea:** Look at the South African flag. It uses red, blue, green, yellow, black, and white. Can you find any complementary colour pairs? Notice how the different colours work together to create a bold, striking design.\n\nRemember: understanding colour helps you make better choices in your artwork. Whether you want a calm, peaceful scene or an exciting, energetic picture, colour is your most powerful tool!'),
  q(10, 'Which pair of colours are complementary (opposite on the colour wheel)?',
    ['Red and orange', 'Blue and green', 'Red and green', 'Yellow and orange'], 2,
    'Red and green sit directly opposite each other on the colour wheel, making them complementary colours. They create strong contrast when placed together.',
    ['Complementary colours are found on opposite sides of the colour wheel.']),
];

// ===============================================================================
// CHAPTER 2: Visual Arts — Drawing Skills (Term 1)
// ===============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Drawing Skills\n\nDrawing is one of the most important skills an artist can learn. In Grade 5, you will practise different ways of drawing that will help you see the world more clearly.\n\n### Observational Drawing\n\n**Observational drawing** means drawing exactly what you see in front of you — not from memory or imagination, but from real life.\n\n**Tips for drawing from observation:**\n1. **Look carefully** — spend more time looking at your subject than at your paper\n2. **Start with simple shapes** — break the object into circles, rectangles, and triangles\n3. **Draw lightly first** — use soft pencil marks that you can erase or change\n4. **Check proportions** — is the top part bigger or smaller than the bottom?\n5. **Add details last** — only after the big shapes are correct\n\n### Line Drawing\n\nA **line drawing** uses only lines (no shading or colour) to show the outline and details of a subject.\n\n| Line Type | What It Shows |\n|-----------|---------------|\n| **Outline** | The outer edge of a shape |\n| **Contour line** | Lines that follow the surface and show form |\n| **Detail lines** | Small lines that show texture, patterns, or features |\n\nSouth African artist **Dumile Feni** was famous for his powerful line drawings of people. Using just a pen, he could capture emotion and movement with flowing, expressive lines.'),
  q(2, 'What does observational drawing mean?',
    ['Drawing from your imagination', 'Drawing what you actually see in front of you', 'Copying a drawing from a book', 'Drawing with your eyes closed'], 1,
    'Observational drawing means drawing directly from life — looking carefully at the real object in front of you and recording what you actually see.'),
  t(3, '### Contour Drawing\n\nA **contour drawing** follows the edges and surface lines of an object, like tracing around it with your eyes.\n\n**Blind contour drawing** is a fun exercise where you:\n1. Look only at the object (not at your paper!)\n2. Move your pencil slowly along the edges of what you see\n3. Do not lift your pencil\n4. The result will look wobbly and funny — that is fine!\n\nBlind contour drawing trains your **hand-eye coordination** and teaches you to really look at what you are drawing.\n\n### Drawing from Life\n\nDrawing from life means drawing real things around you, not from photographs.\n\n**Easy subjects to practise with:**\n- Your hand in different positions\n- A shoe or school bag\n- A cup or bottle on a table\n- A plant or flower in the garden\n- A friend sitting still for a few minutes\n\nSouth African art teacher and artist **John Koenakeefe Mohl** encouraged his students in Sophiatown to draw everyday scenes from their community — people walking, children playing, and market stalls.'),
  fb(4, 'In a ___ contour drawing, you look only at the object and not at your paper while drawing.',
    ['blind'],
    'Blind contour drawing is an exercise where you keep your eyes on the object and never look at your paper, training hand-eye coordination.'),
  t(5, '### Shading with Pencil\n\nShading makes flat drawings look **three-dimensional** by adding light and dark areas.\n\n**Shading techniques:**\n\n| Technique | How To Do It |\n|-----------|-------------|\n| **Hatching** | Draw straight lines close together — closer lines = darker |\n| **Cross-hatching** | Draw lines that cross over each other in different directions |\n| **Blending** | Rub pencil marks smoothly with your finger or a tissue |\n| **Stippling** | Make lots of small dots — more dots = darker |\n\n**Where to shade:**\n- The side of an object **facing the light** is the lightest (highlight)\n- The side **away from the light** is the darkest (shadow)\n- The **cast shadow** falls on the surface beneath the object\n\n### Pencil Grades\n\n- **HB** — medium pencil, good for general drawing\n- **2B, 4B, 6B** — soft pencils that make dark, rich marks (best for shading)\n- **2H, 4H** — hard pencils that make light, fine lines (best for details)\n\nThe higher the B number, the softer and darker the pencil mark.'),
  q(6, 'Which shading technique uses small dots to create dark and light areas?',
    ['Hatching', 'Blending', 'Cross-hatching', 'Stippling'], 3,
    'Stippling creates tone by making many small dots. More dots packed closely together create darker areas.'),
  t(7, '### Still Life Basics\n\nA **still life** is a drawing of a group of objects arranged together. The objects do not move, which makes them perfect for practising your drawing skills.\n\n**How to set up a still life:**\n1. Choose 3 to 5 objects of different sizes and shapes\n2. Place them on a table so some overlap (sit in front of each other)\n3. Add a light source from one side to create shadows\n4. Sit where you can see all the objects clearly\n\n**Good still life objects:**\n- Fruit and vegetables (apples, bananas, pumpkins)\n- Bottles, cups, and pots\n- Traditional craft items like woven baskets or clay pots\n- School supplies like books, scissors, and pencils\n\nIn South Africa, many artists have drawn still life scenes featuring items from everyday life. A clay pot from a market, a bunch of proteas, or a basket of mealies can all become beautiful artwork.\n\n**Remember:** The secret to good drawing is **practice**. Draw a little bit every day, and you will be amazed at how quickly you improve!'),
  fb(8, 'A ___ ___ is a drawing of a group of objects that do not move, arranged together on a table.',
    ['still', 'life'],
    'A still life is an arrangement of non-moving objects that artists study and draw. It is one of the best ways to practise observation skills.'),
  q(9, 'When shading an object, the lightest area is:',
    ['The side away from the light', 'The cast shadow', 'The side facing the light (highlight)', 'The area under the object'], 2,
    'The highlight is the lightest area on an object and appears on the side directly facing the light source.'),
  q(10, 'A soft pencil like 6B is best for:',
    ['Drawing fine details', 'Shading and making dark marks', 'Drawing very light lines', 'Erasing mistakes'], 1,
    'Soft B pencils (like 2B, 4B, 6B) make dark, rich marks and are ideal for shading. The higher the B number, the softer and darker the pencil.'),
];

// ===============================================================================
// CHAPTER 3: Performing Arts — Music and Rhythm (Term 1)
// ===============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Music and Rhythm\n\nMusic is all around us — from the birds singing in the morning to the rhythms of a marabi band. In this chapter, you will learn the building blocks of music.\n\n### Beat and Rhythm\n\nThe **beat** is the steady pulse in music, like a heartbeat: *thump, thump, thump, thump*. It never speeds up or slows down (unless the music changes tempo).\n\n**Rhythm** is the pattern of long and short sounds that sit on top of the beat. Think of the beat as the ticking of a clock and the rhythm as the words of a song.\n\n| Term | What It Means | Example |\n|------|--------------|--------|\n| **Beat** | The steady pulse | Clap evenly: clap, clap, clap, clap |\n| **Rhythm** | The pattern of sounds | Clap the words: *Sho-sho-lo-za* (short-short-long-short) |\n\n### Tempo\n\n**Tempo** is how fast or slow the beat goes.\n\n| Italian Word | Meaning | Example |\n|-------------|---------|--------|\n| **Largo** | Very slow | A slow hymn at church |\n| **Andante** | Walking pace | A calm folk song |\n| **Allegro** | Fast | A lively gumboot dance |\n| **Presto** | Very fast | An exciting race finish |\n\nIn South African music, tempo can change to match the mood. The song *Shosholoza* starts at a steady walking pace (andante) but can speed up when people clap and sing more enthusiastically.'),
  q(2, 'What is the difference between beat and rhythm?',
    ['They mean the same thing', 'Beat is the steady pulse; rhythm is the pattern of sounds', 'Rhythm is the pulse; beat is the pattern', 'Beat is fast and rhythm is slow'], 1,
    'The beat is the steady, unchanging pulse in music (like a heartbeat). The rhythm is the pattern of long and short sounds that flows over the beat.'),
  t(3, '### Dynamics (Loud and Soft)\n\n**Dynamics** describe how loud or soft music is.\n\n| Symbol | Italian Word | Meaning |\n|--------|-------------|--------|\n| **pp** | Pianissimo | Very soft |\n| **p** | Piano | Soft |\n| **mp** | Mezzo piano | Medium soft |\n| **mf** | Mezzo forte | Medium loud |\n| **f** | Forte | Loud |\n| **ff** | Fortissimo | Very loud |\n\nDynamics make music interesting. A song that is loud the whole time can be tiring, but changing from soft to loud creates excitement and emotion.\n\n### South African Songs and Rhythms\n\nSouth Africa has incredibly rich musical traditions:\n\n- **Shosholoza** — a Ndebele folk song sung by mine workers; it has a steady, powerful rhythm\n- **Nkosi Sikelel\'i iAfrika** — part of our national anthem, with a slow, dignified tempo\n- **Click Song (Qongqothwane)** — a Xhosa song made famous by Miriam Makeba, featuring the Xhosa click sounds\n- **Mbube** — a Zulu a cappella singing style (the song "The Lion Sleeps Tonight" started as the Zulu song "Mbube")'),
  fb(4, 'The Italian word for loud is ___. The Italian word for soft is ___.',
    ['forte', 'piano'],
    'Forte means loud and piano means soft in musical dynamics. These Italian terms are used by musicians around the world.'),
  t(5, '### Body Percussion\n\n**Body percussion** means using your own body to make sounds. You do not need any instruments!\n\n| Action | Sound |\n|--------|-------|\n| **Clap** hands | Sharp, bright sound |\n| **Stamp** feet | Deep, heavy sound |\n| **Click** fingers | Light, crisp sound |\n| **Pat** thighs | Medium, warm sound |\n| **Tap** chest | Soft, hollow sound |\n\nBody percussion is an important part of South African culture:\n- **Gumboot dancing** (isicathulo) was created by gold mine workers who used boot slapping and foot stamping to communicate in the noisy mines\n- Many SA children\'s games use clapping patterns (like *Amashu* and *Intonga*)\n\n### Clapping Patterns\n\nTry these clapping patterns (C = clap, R = rest):\n\n**Pattern 1 (simple):** C C C R | C C C R\n\n**Pattern 2 (syncopated):** C R C C | R C R C\n\n**Pattern 3 (layered):** One group claps Pattern 1 while another group claps Pattern 2 at the same time. This creates a **polyrhythm** — two different rhythms played together.'),
  q(6, 'Gumboot dancing was created by:',
    ['Farmers in the Western Cape', 'Gold mine workers in South Africa', 'Traditional healers in KwaZulu-Natal', 'School children in Johannesburg'], 1,
    'Gumboot dancing (isicathulo) was created by gold mine workers who used boot slapping and foot stamping to communicate and entertain in the noisy mines.'),
  fb(7, 'A ___ is when two different rhythms are played at the same time.',
    ['polyrhythm'],
    'A polyrhythm occurs when two or more different rhythmic patterns are performed simultaneously, creating a layered effect common in African music.'),
  q(8, 'Which of these is NOT a body percussion action?',
    ['Clapping hands', 'Stamping feet', 'Strumming a guitar', 'Clicking fingers'], 2,
    'Strumming a guitar requires an instrument. Body percussion only uses your body — clapping, stamping, clicking, patting, and tapping.'),
  t(9, '### Tempo and Dynamics Together\n\nMusicians combine tempo and dynamics to create mood and feeling:\n\n| Mood | Tempo | Dynamics |\n|------|-------|----------|\n| Peaceful | Slow (largo or andante) | Soft (piano) |\n| Exciting | Fast (allegro or presto) | Loud (forte) |\n| Scary | Slow | Starts soft, gets loud suddenly |\n| Happy | Medium to fast | Medium to loud |\n\n**Activity idea:** Choose a South African song you know (like *Shosholoza*, *Nkosi Sikelel\'i iAfrika*, or a song from your culture). Clap the rhythm while a friend claps the beat. Then try changing the tempo — what happens when you make it faster? Slower? Try changing the dynamics too — sing it softly, then loudly. How does the mood change?'),
  q(10, 'If a piece of music is marked *allegro* and *forte*, it should be played:',
    ['Slowly and softly', 'Fast and loud', 'Very slowly and very softly', 'At walking pace and medium loud'], 1,
    'Allegro means fast and forte means loud. Together they create music that feels energetic and powerful.'),
];

// ===============================================================================
// CHAPTER 4: Performing Arts — Movement and Dance (Term 2)
// ===============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Movement and Dance\n\nDance is one of the oldest art forms in the world. In South Africa, dance is part of celebration, storytelling, and cultural identity. In this chapter, you will explore how your body moves through space.\n\n### Exploring Space\n\nWhen you dance, you use **space** in different ways:\n\n| Space Concept | What It Means |\n|--------------|---------------|\n| **Personal space** | The area around your body that belongs to you (your "bubble") |\n| **General space** | The whole room or stage area you share with others |\n| **Pathways** | The patterns you make on the floor as you move (straight, curved, zigzag) |\n| **Directions** | Forward, backward, sideways, diagonal, up, down |\n\n### Levels\n\nDancers use three **levels** to make their movements interesting:\n\n| Level | Description | Example |\n|-------|------------|--------|\n| **High level** | Standing tall, jumping, reaching up | Leaping in the air |\n| **Medium level** | Normal standing, walking, bending slightly | Walking in a circle |\n| **Low level** | Crouching, sitting, lying on the floor | Rolling on the ground |\n\nChanging levels makes dance more exciting to watch. Many South African dances use dramatic level changes — like the Zulu **indlamu** war dance, where dancers leap high into the air and then stamp down hard.'),
  q(2, 'What are the three levels used in dance?',
    ['Fast, medium, slow', 'High, medium, low', 'Left, centre, right', 'Front, middle, back'], 1,
    'The three levels in dance are high (jumping, reaching up), medium (normal standing), and low (crouching, on the floor). Changing levels adds variety to dance.'),
  t(3, '### Locomotor and Non-Locomotor Movements\n\n**Locomotor movements** take you from one place to another:\n- Walking, running, skipping, hopping, galloping, sliding, leaping, crawling\n\n**Non-locomotor movements** happen in one spot (your feet stay in place):\n- Bending, stretching, twisting, turning, swaying, pushing, pulling, swinging\n\n| Type | Definition | Examples |\n|------|-----------|----------|\n| **Locomotor** | Travelling movements | Walk, run, skip, hop, gallop, leap |\n| **Non-locomotor** | Movements on the spot | Bend, stretch, twist, turn, sway |\n\nA good dance uses **both** types. You might walk across the floor (locomotor), then stop and twist and stretch in place (non-locomotor).\n\n### Dance Elements: Body, Space, Time, Energy\n\nEvery dance uses four elements:\n\n| Element | Question It Answers |\n|---------|--------------------|\n| **Body** | What body parts are moving? |\n| **Space** | Where are you moving? |\n| **Time** | How fast or slow? What rhythm? |\n| **Energy** | How are you moving? (Sharp, smooth, heavy, light) |'),
  fb(4, '___ movements take you from one place to another, while non-___ movements happen in one spot.',
    ['Locomotor', 'locomotor'],
    'Locomotor movements are travelling movements like walking, running, and skipping. Non-locomotor movements happen on the spot, like bending, stretching, and twisting.'),
  t(5, '### South African Traditional Dances\n\nSouth Africa has a rich heritage of traditional dances, each with its own cultural meaning:\n\n**Indlamu (Zulu War Dance)**\nPerformed by Zulu men, this powerful dance features high leg kicks, stamping, and rhythmic movements with traditional shields and sticks. It celebrates bravery and strength.\n\n**Umxhentso (Xhosa Dance)**\nXhosa women perform this dance with graceful hip movements and rhythmic stamping. Dancers wear traditional beaded clothing and the dance often accompanies celebrations.\n\n**Tshikona (Venda Pipe Dance)**\nEach dancer plays a single note on a pipe (made from bamboo or reed) while dancing in a circle. Together, the group creates a melody — showing that everyone has an important part to play.\n\n**Riel Dance (Nama/Khoisan)**\nOriginating from the Northern Cape, the Riel is a fast, energetic dance with quick footwork. Dancers move to the rhythm of guitar and drum music, and the dance celebrates community and joy.\n\n| Dance | People | Key Feature |\n|-------|--------|-------------|\n| Indlamu | Zulu | High kicks and stamping |\n| Umxhentso | Xhosa | Graceful hip movements |\n| Tshikona | Venda | Each dancer plays one pipe note |\n| Riel | Nama/Khoisan | Fast, energetic footwork |'),
  q(6, 'In the Venda Tshikona pipe dance, what makes it special?',
    ['One dancer plays a full melody alone', 'Each dancer plays a single note and together they create the melody', 'Dancers do not move their feet', 'It is performed sitting down'], 1,
    'In Tshikona, each dancer plays just one note on a pipe. When all the dancers play together, their individual notes combine to create a complete melody. It shows teamwork and community.'),
  t(7, '### Creative Dance\n\nCreative dance is about expressing your own ideas through movement. There are no set steps — you choose how to move based on a theme, feeling, or piece of music.\n\n**Ways to create your own dance:**\n1. **Choose a theme** — for example, "the ocean" or "a thunderstorm"\n2. **Explore movements** — what movements match your theme? (flowing for water, sharp for lightning)\n3. **Use levels** — start low and rise up, or start high and sink down\n4. **Change tempo** — move slowly, then speed up\n5. **Add a pathway** — move in curves (like waves) or zigzags (like lightning)\n6. **Find a beginning, middle, and end** — every dance tells a little story\n\n**Energy qualities:**\n\n| Quality | Movement feels... | Example |\n|---------|-------------------|--------|\n| **Smooth** | Flowing, gentle | A river or a bird gliding |\n| **Sharp** | Quick, sudden, strong | Lightning or a karate chop |\n| **Heavy** | Weighty, powerful | An elephant walking |\n| **Light** | Delicate, airy | A butterfly or a feather |'),
  fb(8, 'In creative dance, ___ energy feels flowing and gentle, while ___ energy feels quick and sudden.',
    ['smooth', 'sharp'],
    'Smooth energy creates flowing, gentle movements, while sharp energy produces quick, sudden, strong movements. Dancers use both to create variety.'),
  q(9, 'Which South African dance features high leg kicks and stamping with shields and sticks?',
    ['Riel dance', 'Tshikona', 'Indlamu (Zulu war dance)', 'Umxhentso'], 2,
    'Indlamu is the Zulu war dance featuring powerful high leg kicks, stamping, and the use of traditional shields and sticks.'),
  q(10, 'A dance that uses walking, running, and leaping is using:',
    ['Non-locomotor movements only', 'Locomotor movements', 'Only the low level', 'Dynamics'], 1,
    'Walking, running, and leaping are all locomotor movements because they travel from one place to another.'),
];

// ===============================================================================
// CHAPTER 5: Visual Arts — Patterns and Printing (Term 2)
// ===============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Patterns and Printing\n\nPatterns are all around us — in nature, in fabric, in buildings, and in art. In this chapter, you will learn how to create patterns and use simple printing techniques.\n\n### What Is a Pattern?\n\nA **pattern** is created when a shape, line, colour, or design is **repeated** in an organised way. The smallest unit that repeats is called the **motif**.\n\n**Examples of patterns in everyday life:**\n- The bricks in a wall\n- The stripes on a zebra\n- The checks on a tablecloth\n- The beadwork on a Zulu necklace\n\n### Types of Patterns\n\n| Type | Description | Example |\n|------|-----------|--------|\n| **Repeating pattern** | The same motif repeats over and over | ABABABAB |\n| **Alternating pattern** | Two or more motifs take turns | ABCABCABC |\n| **Symmetrical pattern** | The pattern is the same on both sides of a line | A butterfly\'s wings |\n| **Random pattern** | Elements are repeated but not in a regular way | Spots on a leopard |\n\n### Tessellation\n\nA **tessellation** is a pattern of shapes that fit together perfectly with **no gaps and no overlaps**, like tiles on a floor. Triangles, squares, and hexagons can all tessellate.\n\nIn South Africa, you can see tessellation in traditional floor tiles, woven mats, and the geometric patterns of Ndebele art.'),
  q(2, 'What is a motif?',
    ['A type of paint', 'The smallest unit that repeats in a pattern', 'A drawing tool', 'A kind of frame'], 1,
    'A motif is the smallest design element that is repeated to create a pattern. It can be a shape, symbol, or small design.'),
  t(3, '### Printing Techniques\n\nPrinting is a way of making **multiple copies** of an image. Instead of drawing the same picture again and again, you create a printing block and press it onto paper.\n\n**Potato Printing:**\n1. Cut a potato in half\n2. Carve a simple shape into the flat surface (a star, circle, or triangle)\n3. Dip the potato into paint\n4. Press it firmly onto paper\n5. Repeat to create a pattern!\n\n**Leaf Printing:**\n1. Find leaves with interesting shapes and textures\n2. Paint one side of the leaf with a thin layer of paint\n3. Press the painted side onto paper\n4. Carefully lift the leaf to reveal the print\n5. The veins of the leaf create beautiful natural textures\n\n**Cardboard Printing:**\n1. Cut shapes from thick cardboard\n2. Glue the shapes onto another piece of cardboard to make a printing plate\n3. Roll paint over the raised shapes using a roller or brush\n4. Press paper onto the plate and rub gently\n5. Peel off the paper to see your print\n\n| Technique | What You Need | Best For |\n|-----------|-------------|----------|\n| Potato printing | Potatoes, knife, paint | Simple shapes and patterns |\n| Leaf printing | Leaves, paint | Natural textures |\n| Cardboard printing | Cardboard, glue, paint | More detailed designs |'),
  fb(4, 'In leaf printing, the ___ of the leaf create beautiful natural textures on the paper.',
    ['veins'],
    'The veins (the thin lines running through a leaf) create an interesting textured pattern when printed, showing the natural structure of the leaf.'),
  t(5, '### African Patterns\n\nAfrica has some of the most beautiful and meaningful patterns in the world:\n\n**Ndebele Art (South Africa)**\nThe Ndebele people of Mpumalanga and Gauteng are famous for painting bold, geometric patterns on their houses. The patterns use:\n- Bright primary colours (red, blue, yellow) with black outlines\n- Symmetrical designs\n- Geometric shapes: triangles, rectangles, diamonds, and chevrons\n- Cultural symbols representing homes, fields, and fertility\n\nTraditionally, Ndebele women paint these patterns. The art is passed down from mothers to daughters.\n\n**Zulu Beadwork**\nZulu beadwork uses patterns made from tiny glass beads. Different colours carry different meanings:\n\n| Colour | Positive Meaning |\n|--------|------------------|\n| White | Purity, love |\n| Blue | Faithfulness |\n| Green | Contentment |\n| Yellow | Wealth |\n| Red | Strong emotion |\n| Black | Marriage, sorrow |\n\nThe arrangement of colours in patterns sends messages — a love letter can be written entirely in beads!'),
  q(6, 'In Zulu beadwork, which colour represents faithfulness?',
    ['Red', 'White', 'Blue', 'Yellow'], 2,
    'In Zulu beadwork colour symbolism, blue represents faithfulness. Each colour carries specific meanings, and patterns can communicate messages.'),
  t(7, '### Shweshwe Fabric\n\n**Shweshwe** is a traditional South African printed cotton fabric, originally from the Eastern Cape. It features:\n- Small, intricate geometric patterns\n- Traditionally indigo blue, but now also comes in red, brown, and other colours\n- Repeating motifs arranged in symmetrical designs\n\nShweshwe fabric is named after King Moshoeshoe I of Lesotho, who received printed cloth as a gift in the 1840s. Today it is used for traditional clothing, modern fashion, and home decorations.\n\n**Activity idea:** Create your own pattern using one of these printing techniques:\n1. Choose a motif (a simple shape that represents something about your culture or community)\n2. Carve it into a potato or cut it from cardboard\n3. Print it in a repeating or alternating pattern\n4. Use colours that have meaning to you\n\nRemember to think about:\n- **Spacing** — how far apart are your prints?\n- **Colour** — are you using one colour or several?\n- **Direction** — do your motifs all face the same way, or do they alternate?'),
  fb(8, 'Shweshwe is a traditional South African printed cotton fabric named after King ___ I of Lesotho.',
    ['Moshoeshoe'],
    'Shweshwe fabric is named after King Moshoeshoe I of Lesotho, who received printed cloth as a gift from European traders in the 1840s.'),
  q(9, 'A tessellation is a pattern where shapes:',
    ['Overlap each other', 'Leave big gaps between them', 'Fit together with no gaps and no overlaps', 'Are all different sizes'], 2,
    'A tessellation is a pattern of shapes that fit together perfectly with no gaps and no overlaps, like tiles on a floor.'),
  q(10, 'Ndebele house painting traditionally uses which type of pattern?',
    ['Random, organic shapes', 'Bold geometric patterns with bright colours', 'Only black and white', 'Tiny dots and circles'], 1,
    'Ndebele house painting features bold geometric patterns using bright primary colours (red, blue, yellow) with black outlines, arranged in symmetrical designs.'),
];

// ===============================================================================
// CHAPTER 6: Performing Arts — Drama and Storytelling (Term 2)
// ===============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Drama and Storytelling\n\nDrama is the art of telling stories through acting. In South Africa, storytelling is one of our oldest and most treasured traditions. In this chapter, you will learn how to use your voice, body, and imagination to bring stories to life.\n\n### Imagination Games\n\nBefore you can act, you need to warm up your imagination! Here are some drama games:\n\n**Mirror Game:** Stand facing a partner. One person moves slowly, and the other copies their movements exactly, like a mirror. Then swap.\n\n**Freeze Frame:** Act out a scene, and when someone calls "Freeze!", everyone stops completely still like a photograph. This is also called a **tableau**.\n\n**Hot Seating:** One person sits in a chair and pretends to be a character from a story. The rest of the class asks them questions, and they answer in character.\n\n### Role Play\n\n**Role play** means pretending to be someone else. When you role play, you think about:\n- **Who** is my character? (name, age, personality)\n- **Where** are they? (setting)\n- **What** do they want? (motivation)\n- **How** do they speak and move? (voice and body language)\n\nRole play helps us understand other people\'s feelings and perspectives. It is an important life skill, not just a drama skill!'),
  q(2, 'In the drama game "Freeze Frame" (tableau), performers:',
    ['Keep moving at all times', 'Stop completely still like a photograph', 'Close their eyes', 'Speak as loudly as possible'], 1,
    'In a freeze frame (tableau), performers stop completely still, creating a frozen picture that captures a moment in the scene.'),
  t(3, '### Puppets\n\nPuppets are a wonderful way to tell stories, especially if you feel shy about performing in front of others.\n\n**Types of puppets you can make:**\n\n| Puppet Type | How to Make It |\n|------------|----------------|\n| **Sock puppet** | Put a sock on your hand, add button eyes and yarn hair |\n| **Stick puppet** | Draw a character on cardboard, cut it out, and tape it to a stick |\n| **Paper bag puppet** | Decorate a paper bag — the fold becomes the mouth |\n| **Shadow puppet** | Cut a flat shape from card and hold it behind a lit sheet |\n| **Finger puppet** | Make tiny characters that fit on your fingers |\n\nShadow puppetry has a long history in many cultures. In South Africa, the **Handspring Puppet Company** from Cape Town is world-famous. They created the life-size horse puppets for the stage show *War Horse* that performed in London and around the world!\n\n### South African Folktales and Stories\n\nSouth Africa has a rich tradition of oral storytelling. Stories were passed from generation to generation by word of mouth, long before they were written down.'),
  fb(4, 'The ___ Puppet Company from Cape Town is world-famous for creating life-size puppets, including the horse puppets in the show War Horse.',
    ['Handspring'],
    'Handspring Puppet Company, based in Cape Town, South Africa, gained worldwide fame for their innovative puppetry, especially the life-size horse puppets in the stage show War Horse.'),
  t(5, '### Famous South African Folktales\n\n**Anansi the Spider** (originally from West Africa, also told in SA)\nAnansi is a clever spider who uses his wits to outsmart bigger, stronger animals. His stories teach that intelligence is more powerful than physical strength.\n\n**The Story of the Rain Queen (Modjadji)**\nThe Balobedu people of Limpopo have a tradition of Rain Queens — women leaders believed to have the power to bring rain. The stories of the Rain Queen teach about the connection between people and nature.\n\n**How the Zebra Got Its Stripes**\nIn this !Xam (San) tale, the zebra was once plain white. After a fight with a baboon near a fire, the zebra fell into the flames and got burn marks — its black stripes!\n\n**Kwasukasukela...**\nThis is the traditional Zulu way to begin a story, meaning "once upon a time" or "a long, long time ago." The audience replies: *"Cosi!"* (meaning "we are listening!"). This call-and-response creates a connection between the storyteller and the audience.\n\n| Story | Origin | Lesson |\n|-------|--------|--------|\n| Anansi the Spider | West African/SA | Intelligence beats strength |\n| The Rain Queen | Balobedu (Limpopo) | Connection to nature |\n| How Zebra Got Stripes | San (!Xam) | Actions have consequences |'),
  q(6, 'What does the Zulu word "Kwasukasukela" mean?',
    ['Goodbye', 'Once upon a time', 'Listen carefully', 'The end'], 1,
    'Kwasukasukela is the traditional Zulu way to start a story, meaning "once upon a time" or "a long, long time ago." The audience responds with "Cosi!" (we are listening!).'),
  t(7, '### Creating Characters\n\nTo create a believable character, think about:\n\n**Voice:**\n- Is the voice high or low?\n- Does the character speak fast or slow?\n- Do they have a particular way of talking? (formal, slang, nervous stuttering)\n- How loud or soft do they speak?\n\n**Body:**\n- How do they walk? (big steps, shuffling, bouncing)\n- How do they stand? (tall and proud, hunched over, hands on hips)\n- What gestures do they use? (waving hands, pointing, fidgeting)\n\n**Personality:**\n- Are they brave or fearful?\n- Kind or selfish?\n- Funny or serious?\n- Honest or tricky?\n\n### Performing a Short Play\n\n**Steps to create a short play:**\n1. **Choose a story** — a folktale, a scene from your life, or something you make up\n2. **Create characters** — decide who is in the story and what they are like\n3. **Write a simple script** — include dialogue (what characters say) and stage directions (what they do)\n4. **Rehearse** — practise until you know your lines and movements\n5. **Perform** — speak clearly, face the audience, and have fun!'),
  fb(8, 'When creating a character, you should think about their ___, their body language, and their ___.',
    ['voice', 'personality'],
    'A believable character is created by thinking about how they sound (voice), how they move (body language), and what kind of person they are (personality).'),
  q(9, 'In "Hot Seating," one person:',
    ['Sits on a hot chair', 'Pretends to be a character and answers questions from the class', 'Reads a story aloud', 'Draws a character on the board'], 1,
    'In hot seating, one person sits in a chair as a character and answers questions from the audience while staying in character. It is a great way to explore characters deeply.'),
  q(10, 'Which South African puppet company created the life-size horse puppets for War Horse?',
    ['Puppet Palace', 'Handspring Puppet Company', 'Cape Town Puppeteers', 'Joburg Puppet Theatre'], 1,
    'Handspring Puppet Company from Cape Town created the innovative life-size horse puppets for the internationally acclaimed stage production War Horse.'),
];

// ===============================================================================
// CHAPTER 7: Visual Arts — Collage and Mixed Media (Term 3)
// ===============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Collage and Mixed Media\n\nA **collage** is an artwork made by sticking different materials onto a surface. The word "collage" comes from the French word *coller*, meaning "to glue." In this chapter, you will explore how to create art using cutting, tearing, layering, and combining different materials.\n\n### What Is Collage?\n\nInstead of drawing or painting an image, in collage you **build** it from pieces of paper, fabric, photographs, and other materials.\n\n**Collage techniques:**\n\n| Technique | Description |\n|-----------|-------------|\n| **Cutting** | Use scissors to cut neat, precise shapes |\n| **Tearing** | Tear paper by hand for rough, natural edges |\n| **Layering** | Place pieces on top of each other for depth |\n| **Overlapping** | Let pieces sit partly on top of each other |\n| **Arranging** | Plan where everything goes before gluing |\n\n### Texture in Collage\n\n**Texture** is how a surface feels or looks like it would feel. Collage is great for exploring texture because you can combine many different materials:\n\n| Material | Texture |\n|----------|--------|\n| Newspaper | Smooth, thin |\n| Corrugated cardboard | Ridged, bumpy |\n| Fabric (cotton, felt) | Soft, woven |\n| Sandpaper | Rough, gritty |\n| Foil | Smooth, shiny |\n| Tissue paper | Thin, crinkly |\n| Wool or string | Fuzzy, textured |'),
  q(2, 'The word "collage" comes from the French word *coller*, which means:',
    ['To cut', 'To paint', 'To glue', 'To draw'], 2,
    'Collage comes from the French word "coller" meaning "to glue." Collage artworks are made by gluing different materials onto a surface.'),
  t(3, '### Using Recycled Materials\n\nArt does not have to be expensive! Some of the most creative artworks are made from **recycled** and **found** materials — things that would otherwise be thrown away.\n\n**Materials you can recycle for art:**\n- Old magazines and newspapers (for cutting out images and colours)\n- Cardboard boxes and packaging\n- Bottle caps and lids\n- Fabric scraps and old clothes\n- Sweet wrappers and chip packets\n- Wire and string\n- Buttons and beads\n- Leaves, seeds, and sticks from nature\n\n**Why recycle for art?**\n- It is **free** — you do not need to buy supplies\n- It is **good for the environment** — you give waste a new life\n- It creates **interesting textures** — recycled materials add variety\n- It develops **creativity** — you have to think differently about ordinary objects\n\n### Planning Your Collage\n\n**Steps:**\n1. Choose a theme or subject (an animal, a landscape, a portrait, an abstract design)\n2. Collect materials that match your theme (colours, textures, images)\n3. Cut or tear your materials into the shapes you need\n4. **Arrange everything on your surface BEFORE gluing** — move pieces around until you are happy\n5. Glue everything down, starting with the background layer\n6. Add final details on top'),
  fb(4, 'Using ___ materials for art is good for the environment because you give waste a new ___.',
    ['recycled', 'life'],
    'Recycled materials give waste a new purpose and are free, environmentally friendly, and add interesting textures to artwork.'),
  t(5, '### South African Artists Who Use Mixed Media\n\n**Willie Bester** is a Cape Town artist famous for using recycled materials in his art. He creates powerful sculptures and assemblages from scrap metal, wire, old tools, and found objects. His work tells stories about life in South Africa — poverty, inequality, and resilience.\n\n**Mary Sibande** is a Johannesburg artist who combines sculpture, fabric, and photography. Her life-size fabric sculptures of a domestic worker character called Sophie explore themes of identity, dreams, and South African history. The flowing purple fabric in her work symbolises imagination and power.\n\n**Jane Alexander** creates mixed-media sculptures using fibreglass, bone, oil paint, and found objects. Her haunting figures comment on human behaviour and social issues in South Africa.\n\n| Artist | Materials Used | Themes |\n|--------|---------------|--------|\n| Willie Bester | Scrap metal, wire, found objects | Poverty, inequality, resilience |\n| Mary Sibande | Fabric, sculpture, photography | Identity, dreams, history |\n| Jane Alexander | Fibreglass, bone, found objects | Human behaviour, social issues |'),
  q(6, 'Which South African artist is famous for creating art from scrap metal and recycled found objects?',
    ['Mary Sibande', 'Jane Alexander', 'Willie Bester', 'Esther Mahlangu'], 2,
    'Willie Bester from Cape Town creates powerful sculptures and assemblages from scrap metal, wire, old tools, and other found objects, addressing themes of poverty and resilience.'),
  t(7, '### Creating a Collage — Project Guide\n\n**Theme ideas for your collage:**\n- **My Community** — buildings, people, plants, and activities from where you live\n- **South African Wildlife** — animals and landscapes using torn paper and natural materials\n- **My Dream** — an imaginary scene about what you hope for the future\n- **Abstract Colours** — a design based purely on colour, shape, and texture\n\n**Tips for a successful collage:**\n- Use at least **three different materials** for variety\n- Think about **contrast** — combine rough and smooth, dark and light\n- Create **depth** by layering — background first, middle ground, then foreground\n- Let some edges be **neat** (cut) and some **rough** (torn) for visual interest\n- Consider your **colour scheme** — warm colours, cool colours, or complementary colours\n- Fill the whole surface — avoid leaving large empty spaces unless it is intentional\n\n**Mixed media** means combining different art-making methods in one artwork. You can add drawing, painting, or printing on top of your collage to create a truly unique piece.'),
  fb(8, '___ ___ means combining different art-making methods, such as collage, drawing, and painting, in one artwork.',
    ['Mixed', 'media'],
    'Mixed media artwork combines two or more different art-making techniques or materials in a single piece, such as collage with painting or drawing.'),
  q(9, 'Mary Sibande\'s art features a character called Sophie who is a:',
    ['Teacher', 'Domestic worker', 'Dancer', 'Farmer'], 1,
    'Mary Sibande\'s life-size fabric sculptures feature Sophie, a domestic worker character, exploring themes of identity, dreams, and South African history through flowing purple fabric.'),
  q(10, 'When making a collage, you should arrange all pieces on the surface BEFORE:',
    ['Cutting them out', 'Choosing your materials', 'Gluing them down', 'Taking a photo'], 2,
    'Always arrange your collage pieces on the surface before gluing. This lets you move things around and find the best composition without making mistakes.'),
];

// ===============================================================================
// CHAPTER 8: Performing Arts — Singing and Instruments (Term 3)
// ===============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Singing and Instruments\n\nSinging is the most natural form of music — your voice is an instrument you carry with you everywhere! In this chapter, you will learn about caring for your voice, singing together, and exploring South African instruments.\n\n### Voice Care\n\nYour voice is precious. To keep it healthy:\n\n| Do | Do Not |\n|----|--------|\n| Drink plenty of water | Shout or scream |\n| Warm up before singing | Whisper for long periods (strains the voice) |\n| Stand or sit up straight | Drink very cold water before singing |\n| Breathe from your diaphragm | Clear your throat harshly |\n| Rest your voice when it is tired | Sing when you have a sore throat |\n\n### Breathing for Singing\n\nGood breathing is the foundation of good singing.\n\n**Diaphragmatic breathing:**\n1. Place your hand on your tummy (below your ribs)\n2. Breathe in through your nose — feel your tummy push out\n3. Breathe out slowly through your mouth — feel your tummy pull in\n4. The air should go deep into your lungs, not just into your chest\n\nPractise by breathing in for 4 counts and breathing out for 8 counts. This gives you enough air to sing longer phrases.\n\n### Singing in Unison\n\n**Unison** means everyone sings the same melody at the same time. It creates a powerful, united sound. Many South African songs are sung in unison before adding harmony parts.'),
  q(2, 'What does "singing in unison" mean?',
    ['Singing different melodies at the same time', 'Everyone sings the same melody at the same time', 'Singing very loudly', 'Singing without instruments'], 1,
    'Unison means everyone sings the same melody together at the same time, creating a powerful, united sound.'),
  t(3, '### South African Songs\n\nSouth Africa has a wonderful tradition of group singing. Here are some songs you may know:\n\n**Traditional Songs:**\n- **Shosholoza** — a Ndebele folk song about train workers; often sung at rugby matches and national events\n- **Click Song (Qongqothwane)** — a Xhosa wedding song made world-famous by Miriam Makeba\n- **Siyahamba (We Are Marching)** — a Zulu hymn that has been translated and sung around the world\n- **Senzenina (What Have We Done?)** — a protest song from the anti-apartheid movement\n\n**Modern South African Songs:**\n- **Pata Pata** by Miriam Makeba — a joyful dance song in Xhosa\n- **Jerusalema** by Master KG — a modern song that inspired a global dance challenge\n- **Asimbonanga** by Johnny Clegg — a song about Nelson Mandela written while he was still in prison\n\n| Song | Language/Origin | Type |\n|------|----------------|------|\n| Shosholoza | Ndebele | Folk/work song |\n| Qongqothwane | Xhosa | Wedding song |\n| Siyahamba | Zulu | Hymn |\n| Senzenina | Multi-lingual | Protest song |\n| Pata Pata | Xhosa | Dance song |'),
  fb(4, 'The song "Shosholoza" is a ___ folk song originally sung by ___ workers.',
    ['Ndebele', 'train'],
    'Shosholoza is a Ndebele folk song that was originally sung by migrant workers travelling by train to the mines. It is now sung at many South African events.'),
  t(5, '### South African Instruments\n\nSouth Africa has a rich tradition of musical instruments, both traditional and modern.\n\n**Drums:**\n\n| Drum | Description |\n|------|------------|\n| **Djembe** | A goblet-shaped drum played with bare hands; originally from West Africa, widely used in SA |\n| **Ngoma** | A large Zulu drum made from cowhide stretched over a wooden frame |\n| **Uhadi** | A Xhosa musical bow that can also be struck like a drum |\n\n**Melodic Instruments:**\n\n| Instrument | Description |\n|-----------|------------|\n| **Marimba** | A wooden xylophone with resonating tubes; very popular in SA school music |\n| **Uhadi** | A Xhosa bow instrument; the player changes notes by moving a gourd against their body |\n| **Penny whistle (tin whistle)** | A simple metal flute that became central to kwela music in the 1950s |\n| **Recorder** | A wooden or plastic wind instrument; easy to learn and common in schools |\n\n**Rhythm Instruments:**\n- Shakers (made from gourds filled with seeds)\n- Rainstick (a long tube filled with pebbles that sounds like falling rain)\n- Claves (two wooden sticks clicked together)'),
  q(6, 'The penny whistle became central to which South African music style in the 1950s?',
    ['Mbube', 'Kwela', 'Maskandi', 'Kwaito'], 1,
    'Kwela is a happy, upbeat South African music style from the 1950s that featured the penny whistle (tin whistle) as its main instrument. Young musicians played on street corners.'),
  t(7, '### The Marimba\n\nThe **marimba** is one of the most popular instruments in South African schools. It is a type of xylophone with wooden bars arranged like a piano keyboard.\n\n**Playing the marimba:**\n- Hold the mallets loosely — let them bounce off the bars\n- Strike the centre of each bar for the best sound\n- The longer bars make lower notes; the shorter bars make higher notes\n- You can play melody (the tune), harmony (chords), or rhythm (repeated patterns)\n\n**Marimba bands** are popular in South African schools. In a marimba band:\n- **Soprano marimba** — plays the melody (highest notes)\n- **Alto marimba** — plays harmony and counter-melodies\n- **Tenor marimba** — plays lower harmony parts\n- **Bass marimba** — plays the bass line (lowest notes)\n- **Drums and shakers** — keep the rhythm\n\nWhen all parts play together, the sound is rich and layered — each person plays a simple part, but together they create something beautiful. This is the same principle as the Venda Tshikona pipe dance!'),
  fb(8, 'In a marimba band, the ___ marimba plays the melody (highest notes) and the ___ marimba plays the lowest notes.',
    ['soprano', 'bass'],
    'The soprano marimba plays the highest notes and melody, while the bass marimba plays the lowest notes, providing the foundation of the sound.'),
  q(9, 'Which Xhosa instrument is a musical bow where the player changes notes by moving a gourd?',
    ['Ngoma', 'Djembe', 'Uhadi', 'Marimba'], 2,
    'The uhadi is a Xhosa musical bow. The player holds a gourd (calabash) against their body and changes the pitch by moving the gourd closer to or further from their body.'),
  q(10, 'When breathing for singing, the air should go deep into your lungs using your:',
    ['Chest only', 'Throat', 'Diaphragm (tummy area)', 'Nose only'], 2,
    'Diaphragmatic breathing means breathing deeply so that your diaphragm (the muscle below your ribs) pushes your tummy out. This gives you more air and better breath control for singing.'),
];

// ===============================================================================
// CHAPTER 9: Visual Arts — Modelling and Sculpture (Term 3)
// ===============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Modelling and Sculpture\n\nSo far in Visual Arts, you have mostly worked in **2D** (flat surfaces — drawing, painting, collage). Now it is time to work in **3D** — creating objects that have height, width, AND depth. This is called **sculpture**.\n\n### 2D vs 3D\n\n| Dimension | Description | Example |\n|-----------|-----------|--------|\n| **2D (two-dimensional)** | Flat — has height and width only | A drawing, a painting, a photograph |\n| **3D (three-dimensional)** | Solid — has height, width, and depth | A clay pot, a wire sculpture, a building |\n\n### Sculpture Techniques\n\n| Technique | What It Means | Example |\n|-----------|-------------|--------|\n| **Modelling** | Building up a form by adding material | Adding clay to make a figure |\n| **Carving** | Removing material to reveal a form | Carving wood or soap |\n| **Constructing** | Joining pieces together | Building with cardboard or wire |\n| **Casting** | Pouring liquid material into a mould | Pouring plaster into a clay mould |\n\nIn Grade 5, you will focus on **modelling** (adding material) and **constructing** (joining pieces together).\n\n### Working with Clay\n\nClay is one of the oldest art materials in the world. South African communities have been making clay pots and figures for thousands of years.'),
  q(2, 'What is the main difference between 2D and 3D art?',
    ['2D uses colour and 3D does not', '2D is flat (height and width); 3D has depth too', '3D is always bigger than 2D', '2D is harder to make'], 1,
    '2D art is flat and has only height and width (like a drawing). 3D art has height, width, and depth — you can walk around it and see it from different angles.'),
  t(3, '### Clay Techniques\n\n**Pinch Pot:**\n1. Roll clay into a ball the size of your fist\n2. Push your thumb into the centre\n3. Pinch the walls between your thumb and fingers, turning the pot as you go\n4. Keep the walls an even thickness\n5. Smooth the surface with wet fingers\n\n**Coil Building:**\n1. Roll clay into long, thin "sausages" (coils)\n2. Stack the coils on top of each other in a circle\n3. Smooth the coils together on the inside (and outside if you want a smooth finish)\n4. You can build pots, bowls, and tall vases using coils\n\n**Slab Building:**\n1. Roll clay flat with a rolling pin (like making pastry)\n2. Cut the flat clay into shapes\n3. Join the shapes together using **score and slip** (scratch the edges and add watery clay)\n4. Good for making boxes, houses, and flat-sided forms\n\n| Technique | Best For | Key Tip |\n|-----------|---------|--------|\n| Pinch pot | Small bowls and cups | Keep walls even |\n| Coil building | Tall pots and vases | Smooth coils together firmly |\n| Slab building | Boxes and flat-sided forms | Score and slip to join pieces |'),
  fb(4, 'To join two pieces of clay together, you scratch the edges and add watery clay. This technique is called ___ and ___.',
    ['score', 'slip'],
    'Score and slip is the clay joining technique: you scratch (score) both surfaces and apply liquid clay (slip) to glue them together firmly.'),
  t(5, '### Playdough and Papier-Mache\n\n**Playdough** is a soft modelling material that is perfect for practising sculpture techniques. You can even make your own:\n- 2 cups flour\n- 1 cup salt\n- 1 cup water\n- 2 tablespoons cooking oil\n- Mix together and knead until smooth!\n\n**Papier-mache** (say: PAP-yay mash-AY) uses strips of newspaper soaked in a paste of flour and water. It is great for making larger sculptures.\n\n**How to make papier-mache:**\n1. Create a base shape using scrunched-up newspaper, balloons, or cardboard\n2. Mix flour and water to make a smooth paste (about 1:1 ratio)\n3. Tear newspaper into strips (about 2cm wide)\n4. Dip strips in the paste and lay them over your base shape\n5. Add 3-4 layers, letting each layer dry before adding the next\n6. When completely dry, paint and decorate your sculpture\n\n**Tips:**\n- Tear (do not cut) newspaper strips — torn edges blend better\n- Make sure each layer is smooth — press out air bubbles\n- Let it dry completely before painting (this can take 1-2 days)\n- Use at least 3 layers for strength'),
  q(6, 'When making papier-mache, why should you tear the newspaper strips rather than cut them?',
    ['It is faster', 'Torn edges blend together more smoothly', 'Cut strips do not stick', 'The paint does not work on cut strips'], 1,
    'Torn newspaper strips have soft, feathered edges that blend smoothly into each other, creating a smoother surface. Cut edges leave visible, hard lines.'),
  t(7, '### South African Craft Traditions\n\nSouth Africa has rich 3D art and craft traditions that have been passed down for generations:\n\n**Clay Pots (Venda and Zulu)**\nVenda and Zulu women are master potters. They create beautiful clay pots without a potter\'s wheel, using coil-building techniques. The pots are used for storing water, beer brewing, and cooking. They are often decorated with geometric patterns and burnished (polished) to a smooth shine.\n\n**Wire Toys and Sculptures**\nIn townships across South Africa, children and artists create amazing toys from wire — cars, bicycles, animals, and even moving figures. This tradition turned necessity into art. Today, wire art is sold in galleries and craft markets around the world.\n\n**Beaded Dolls and Figures**\nZulu and Ndebele artists create dolls and figures covered in colourful beadwork. These dolls represent cultural identity and are both toys and works of art.\n\n| Craft | People | Material | Use |\n|-------|--------|----------|-----|\n| Clay pots | Venda, Zulu | Clay | Storage, cooking, decoration |\n| Wire toys | Township artists | Wire | Toys, art, decoration |\n| Beaded dolls | Zulu, Ndebele | Beads, fabric | Cultural expression, art |'),
  fb(8, 'Venda and Zulu women create clay pots without a potter\'s wheel, using the ___ building technique.',
    ['coil'],
    'Traditional Venda and Zulu potters use the coil-building technique — rolling clay into long coils and stacking them in circles — to create pots without a potter\'s wheel.'),
  q(9, 'Wire toy-making in South Africa originated in:',
    ['Art schools', 'Townships, where children turned necessity into art', 'European craft traditions', 'Ancient San culture'], 1,
    'Wire toy-making originated in South African townships where children creatively used available materials (wire) to make toys. This tradition of turning necessity into art has become recognised worldwide.'),
  q(10, 'The sculpture technique where you remove material to reveal a form is called:',
    ['Modelling', 'Constructing', 'Carving', 'Casting'], 2,
    'Carving is the technique of removing material (like wood, stone, or soap) to reveal a form. It is the opposite of modelling, where you add material.'),
];

// ===============================================================================
// CHAPTER 10: Creative Arts Celebration (Term 4)
// ===============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Creative Arts Celebration\n\nCongratulations! You have spent the whole year learning about Visual Arts and Performing Arts. Now it is time to **celebrate** your creativity by combining everything you have learned.\n\n### Putting On a Show\n\nA **Creative Arts showcase** is an event where you share your best work with others — your classmates, teachers, parents, and community.\n\n**What to include in your showcase:**\n\n| Visual Arts | Performing Arts |\n|------------|----------------|\n| Your best drawings and paintings | A song or group singing performance |\n| Collages and mixed-media artworks | A dance (traditional or creative) |\n| Clay sculptures or papier-mache models | A short drama or puppet show |\n| Printed patterns and designs | A rhythm performance (body percussion) |\n\n### Planning a Group Project\n\nWorking in a group means combining everyone\'s strengths:\n\n**Steps:**\n1. **Choose a theme** — for example: "Our South Africa," "Dreams for the Future," or "Celebrating Our Cultures"\n2. **Divide tasks** based on strengths — artists can create visual art, singers can prepare songs, dancers can choreograph, actors can write scripts\n3. **Create a timeline** — what needs to be ready by when?\n4. **Rehearse** — practise performing arts pieces until everyone is confident\n5. **Set up** — arrange visual art displays and prepare the performance space\n6. **Perform and celebrate!**'),
  q(2, 'What is a Creative Arts showcase?',
    ['A written test about art', 'An event where you share your best creative work with others', 'A competition between schools', 'A field trip to a museum'], 1,
    'A Creative Arts showcase is an event where learners display their best visual art and perform songs, dances, or dramas for an audience, celebrating their learning throughout the year.'),
  t(3, '### Combining Visual Arts with Performing Arts\n\nThe most exciting performances combine **visual** and **performing** arts together:\n\n**Ideas for combining arts:**\n\n| Combination | How It Works |\n|------------|-------------|\n| **Painted backdrop + drama** | Paint a large background scene for your play |\n| **Costumes + dance** | Design and make costumes using collage and fabric techniques |\n| **Puppets + storytelling** | Create puppets and use them to tell a South African folktale |\n| **Masks + movement** | Make papier-mache masks and perform a creative dance |\n| **Printed patterns + singing** | Create a patterned banner to display while your group sings |\n| **Clay instruments + music** | Make simple clay shakers or drums and use them in a rhythm piece |\n\nIn many South African cultures, arts are already combined naturally. Think about:\n- A **wedding ceremony** — there is singing, dancing, beadwork, and special clothing all at once\n- **Carnival (Cape Town)** — colourful costumes, painted floats, singing, dancing, and music all together\n- **Reed Dance (Umhlanga)** — traditional dress, beadwork, singing, and dance\n\nThe arts are most powerful when they work together!'),
  fb(4, 'In the Cape Town ___, arts are naturally combined — colourful costumes, painted floats, singing, dancing, and music all come together.',
    ['Carnival'],
    'The Cape Town Carnival (also known as the Cape Town Minstrel Carnival or Kaapse Klopse) is a vibrant event combining colourful costumes, music, singing, and dance.'),
  t(5, '### Group Projects: Skills Checklist\n\nHere is a checklist of skills you have learned this year. Which ones will your group use in your project?\n\n**Visual Arts Skills:**\n- Mixing primary, secondary, and tertiary colours\n- Using warm and cool colours for mood\n- Observational drawing and still life\n- Shading techniques (hatching, cross-hatching, blending, stippling)\n- Creating patterns and using printing techniques\n- Making collages from recycled materials\n- Building with clay (pinch, coil, slab) and papier-mache\n\n**Performing Arts Skills:**\n- Keeping a steady beat and clapping rhythms\n- Singing in unison\n- Using dynamics (loud and soft) and tempo (fast and slow)\n- Performing body percussion\n- Using dance levels (high, medium, low) and pathways\n- Locomotor and non-locomotor movements\n- Creating characters with voice and body\n- Role play and storytelling\n- Working with puppets\n\nEvery person in your group has **different strengths**. Some people are amazing singers but shy about drawing. Others love painting but feel nervous about dancing. A great group project finds a role for everyone!'),
  q(6, 'Why is it important to divide tasks based on each group member\'s strengths?',
    ['So that some people do not have to work', 'Because everyone has different skills and the project benefits from using each person\'s strengths', 'So the teacher can give individual marks', 'Because group projects are too hard for one person'], 1,
    'Dividing tasks based on strengths means each person contributes what they are best at, making the final project stronger and more creative than any one person could achieve alone.'),
  t(7, '### Self-Reflection\n\nAt the end of the year, it is important to look back at your creative journey. **Self-reflection** helps you understand what you have learned and how you have grown.\n\n**Questions to ask yourself:**\n\n| Question | Why It Matters |\n|---------|----------------|\n| What was my favourite project this year? | Identifies your strengths and interests |\n| Which skill did I improve the most? | Shows your growth |\n| What was the most challenging thing I did? | Challenges help us grow |\n| What would I do differently? | Helps you learn from experience |\n| What do I want to learn more about? | Sets goals for the future |\n\n### Giving and Receiving Feedback\n\n**When giving feedback to others:**\n- Start with something **positive** — "I really liked how you..."\n- Be **specific** — "The colours in your painting create a warm feeling" (not just "it\'s nice")\n- Offer a **suggestion** — "You could try adding more contrast to make the main figure stand out"\n- Be **kind** and **respectful** — remember that sharing creative work takes courage\n\n**When receiving feedback:**\n- **Listen** without interrupting\n- Say **thank you** — even if you disagree\n- Think about the feedback — you do not have to change everything, but consider the suggestions\n- Remember: feedback helps you **grow** as an artist'),
  fb(8, 'When giving feedback, you should start with something ___, be specific, and offer a helpful ___.',
    ['positive', 'suggestion'],
    'Good feedback starts with a positive comment, is specific about what works, and includes a helpful suggestion for improvement. This approach is respectful and constructive.'),
  q(9, 'Self-reflection at the end of the year helps you:',
    ['Get a better mark', 'Understand what you learned and how you have grown', 'Forget about difficult projects', 'Copy other people\'s work'], 1,
    'Self-reflection helps you identify your strengths, recognise your growth, learn from challenges, and set goals for the future. It is an important part of being a creative learner.'),
  q(10, 'Which of the following is the BEST example of specific feedback?',
    ['"It is nice"', '"I do not like it"', '"The warm colours in your background create a sunset feeling"', '"You should start over"'], 2,
    '"The warm colours in your background create a sunset feeling" is specific because it names exactly what works (warm colours, background) and explains the effect (sunset feeling). Vague feedback like "it is nice" does not help the artist improve.'),
];


// ===============================================================================
// MAIN — Database insertion
// ===============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 5
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 5/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 5:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 5', schoolId: SCHOOL_ID, orderIndex: 5,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 5:', String(GRADE_ID));
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
    tags: ['grade-5', 'creative-arts', 'caps'],
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
      title: 'Chapter 1: Visual Arts — Colour',
      description: 'Primary, secondary, and tertiary colours, warm and cool colours, the colour wheel, complementary colours, colour mixing, tints and shades, and how SA artists like Esther Mahlangu and Nelson Makamo use colour.',
      order: 1,
      lessons: [
        { title: 'Colour', description: 'Primary, secondary, and tertiary colours, warm and cool colours, colour wheel, complementary colours, tints and shades, Esther Mahlangu (Ndebele colour), Nelson Makamo (warm and cool contrast), Mmakgabo Helen Sebidi (warm earth tones), and the SA flag.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Visual Arts — Drawing Skills',
      description: 'Observational drawing, line drawing, contour drawing, shading techniques (hatching, cross-hatching, blending, stippling), pencil grades, still life basics, and SA artists Dumile Feni and John Koenakeefe Mohl.',
      order: 2,
      lessons: [
        { title: 'Drawing Skills', description: 'Observational drawing tips, line and contour drawing, blind contour exercise, drawing from life, shading techniques (hatching, cross-hatching, blending, stippling), pencil grades, still life setup, Dumile Feni (expressive line), and John Koenakeefe Mohl (community scenes).', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Performing Arts — Music and Rhythm',
      description: 'Beat and rhythm, tempo (largo, andante, allegro, presto), dynamics (piano to fortissimo), body percussion, clapping patterns, polyrhythm, gumboot dancing, and SA songs (Shosholoza, Click Song, Siyahamba, Senzenina).',
      order: 3,
      lessons: [
        { title: 'Music and Rhythm', description: 'Beat vs rhythm, tempo markings (largo, andante, allegro, presto), dynamics (pp to ff), body percussion, gumboot dancing, clapping patterns, polyrhythm, SA songs (Shosholoza, Qongqothwane, Siyahamba, Senzenina), and combining tempo with dynamics.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Performing Arts — Movement and Dance',
      description: 'Exploring space (personal, general, pathways), dance levels (high, medium, low), locomotor and non-locomotor movements, SA traditional dances (Indlamu, Umxhentso, Tshikona, Riel), and creative dance with energy qualities.',
      order: 4,
      lessons: [
        { title: 'Movement and Dance', description: 'Space concepts (personal, general, pathways, directions), three levels (high, medium, low), locomotor vs non-locomotor movements, four dance elements (body, space, time, energy), Indlamu (Zulu), Umxhentso (Xhosa), Tshikona (Venda), Riel (Nama/Khoisan), and creative dance energy qualities.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Visual Arts — Patterns and Printing',
      description: 'Repeating, alternating, and symmetrical patterns, tessellation, printing techniques (potato, leaf, cardboard), Ndebele art, Zulu beadwork colour symbolism, and Shweshwe fabric.',
      order: 5,
      lessons: [
        { title: 'Patterns and Printing', description: 'Pattern types (repeating, alternating, symmetrical, random), motif, tessellation, potato printing, leaf printing, cardboard printing, Ndebele house painting, Zulu beadwork colour meanings, and Shweshwe fabric history.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Performing Arts — Drama and Storytelling',
      description: 'Imagination games (mirror, freeze frame, hot seating), role play, puppet types (sock, stick, shadow, finger), Handspring Puppet Company, SA folktales (Anansi, Rain Queen, Zebra stripes), Kwasukasukela, and creating characters.',
      order: 6,
      lessons: [
        { title: 'Drama and Storytelling', description: 'Imagination games (mirror, freeze frame/tableau, hot seating), role play, puppet types (sock, stick, paper bag, shadow, finger), Handspring Puppet Company (War Horse), SA folktales (Anansi, Rain Queen, How Zebra Got Stripes), Kwasukasukela, creating characters (voice, body, personality), and performing a short play.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Visual Arts — Collage and Mixed Media',
      description: 'Collage techniques (cutting, tearing, layering), texture in collage, using recycled materials, SA mixed-media artists (Willie Bester, Mary Sibande, Jane Alexander), and creating a mixed-media artwork.',
      order: 7,
      lessons: [
        { title: 'Collage and Mixed Media', description: 'Collage techniques (cutting, tearing, layering, overlapping), texture exploration, recycled materials for art, planning a collage, Willie Bester (scrap metal), Mary Sibande (fabric sculpture), Jane Alexander (mixed media), and combining art-making methods.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Performing Arts — Singing and Instruments',
      description: 'Voice care, breathing for singing, singing in unison, SA songs (Shosholoza, Pata Pata, Jerusalema), SA instruments (djembe, ngoma, uhadi, marimba, penny whistle, recorder), and marimba bands.',
      order: 8,
      lessons: [
        { title: 'Singing and Instruments', description: 'Voice care tips, diaphragmatic breathing, singing in unison, SA traditional songs (Shosholoza, Qongqothwane, Siyahamba, Senzenina), modern SA songs (Pata Pata, Jerusalema, Asimbonanga), SA instruments (djembe, ngoma, uhadi, marimba, penny whistle), kwela music, and marimba band roles.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Visual Arts — Modelling and Sculpture',
      description: '2D vs 3D art, sculpture techniques (modelling, carving, constructing, casting), clay techniques (pinch, coil, slab, score and slip), playdough, papier-mache, and SA craft traditions (clay pots, wire toys, beaded dolls).',
      order: 9,
      lessons: [
        { title: 'Modelling and Sculpture', description: '2D vs 3D, sculpture techniques (modelling, carving, constructing, casting), clay techniques (pinch pot, coil building, slab building, score and slip), homemade playdough, papier-mache method, Venda and Zulu clay pots, township wire toys, and Zulu/Ndebele beaded dolls.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Creative Arts Celebration',
      description: 'Putting on a showcase, combining visual and performing arts, group projects, skills checklist, self-reflection, giving and receiving feedback, and celebrating the year\'s creative work.',
      order: 10,
      lessons: [
        { title: 'Creative Arts Celebration', description: 'Planning a Creative Arts showcase, combining visual and performing arts (backdrops, costumes, puppets, masks, instruments), group project planning, skills checklist for the year, self-reflection questions, giving and receiving constructive feedback, and celebrating creativity.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 5 Creative Arts \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Colour, Drawing Skills, Music and Rhythm, Movement and Dance, Patterns and Printing, Drama and Storytelling, Collage and Mixed Media, Singing and Instruments, Modelling and Sculpture, and Creative Arts Celebration for the Grade 5 Creative Arts curriculum.',
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
  console.log('  TEXTBOOK: Grade 5 Creative Arts');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
