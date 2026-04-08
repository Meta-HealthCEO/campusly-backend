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
// CHAPTER 1: Visual Arts — Elements of Art (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Elements of Art\n\nWelcome to Grade 6 Creative Arts! This year you will explore how artists use the **elements of art** to create beautiful and meaningful work. The elements of art are the basic building blocks that every artist uses.\n\n### The Seven Elements\n\n| Element | What It Is | Example |\n|---------|-----------|----------|\n| **Line** | A mark that moves across a surface | The outline of a mountain against the sky |\n| **Shape** | A flat area enclosed by lines | A circle, triangle, or the shape of a leaf |\n| **Colour** | What we see when light reflects off a surface | The bright reds and yellows of a sunset |\n| **Texture** | How a surface feels or looks like it feels | The roughness of tree bark or the smoothness of glass |\n| **Tone** | How light or dark something is | The shadow under a tree compared to bright sunlight |\n| **Form** | A 3D object with height, width, and depth | A ball, a box, or a clay pot |\n| **Space** | The area around, between, and within objects | The sky behind a building or the gap between two trees |\n\nThink of these elements as the **ingredients** an artist uses. Just like a cook combines flour, sugar, and eggs to bake a cake, an artist combines line, shape, colour, and the other elements to create artwork.'),
  q(2, 'How many elements of art are there?',
    ['Five', 'Six', 'Seven', 'Eight'], 2,
    'There are seven elements of art: line, shape, colour, texture, tone, form, and space.',
    ['Count the elements listed in the table above.']),
  t(3, '### How Artists Use the Elements\n\nEvery artwork, from a simple pencil sketch to a huge mural, uses the elements of art. Artists make **choices** about which elements to emphasise.\n\n- A **pencil drawing** focuses on **line** and **tone** — the artist uses light and dark shading to create depth\n- A **painting** might focus on **colour** — choosing warm or cool colours to create a mood\n- A **sculpture** focuses on **form** and **texture** — the 3D shape and the feel of the surface\n- A **photograph** uses **space** and **tone** — arranging objects and using light and shadow\n\n### Elements Working Together\n\nThe elements never work alone. Even a simple drawing of a flower uses:\n- **Line** to draw the outline\n- **Shape** for the petals and leaves\n- **Tone** for the shadows and highlights\n- **Texture** to show the rough stem or soft petals\n\nAs you study each element, you will learn to see them in everyday life and in the artworks of South African artists.'),
  fb(4, 'The elements of art are the basic ___ ___ that every artist uses to create artwork.',
    ['building', 'blocks'],
    'The elements of art are often called the building blocks of art because all artwork is made from combinations of these basic elements.'),
  t(5, '### South African Artists and the Elements\n\n**Esther Mahlangu** is a world-famous Ndebele artist from Mpumalanga. She paints bold, colourful geometric patterns that use strong **lines**, bright **colours**, and flat **shapes**. Her patterns come from the Ndebele tradition of decorating house walls. Esther has painted murals around the world and even decorated a BMW Art Car!\n\n**William Kentridge** is a Johannesburg-born artist known for his charcoal drawings and animated films. He focuses on **tone** — using dark charcoal marks and erasure to create powerful black-and-white images. His work often tells stories about South Africa\'s history.\n\n| Artist | Key Elements Used | Style |\n|--------|-------------------|-------|\n| Esther Mahlangu | Line, colour, shape | Bold geometric Ndebele patterns |\n| William Kentridge | Tone, line, space | Dark charcoal drawings and animation |\n\nBoth artists show us that you don\'t need to use every element equally. You can choose the elements that best express your ideas.'),
  q(6, 'Which South African artist is famous for bold, geometric Ndebele patterns?',
    ['William Kentridge', 'Esther Mahlangu', 'Nelson Makamo', 'Gerard Sekoto'], 1,
    'Esther Mahlangu is famous for her Ndebele-style geometric paintings using bold lines and bright colours. She learned the tradition from her mother and grandmother.'),
  fb(7, 'William Kentridge is known for his ___ drawings that use tone to create powerful black-and-white images about South Africa\'s ___.',
    ['charcoal', 'history'],
    'William Kentridge uses charcoal as his main medium and his work often explores South Africa\'s history, including the apartheid era.'),
  q(8, 'Which element of art describes how light or dark something is?',
    ['Colour', 'Texture', 'Tone', 'Form'], 2,
    'Tone (also called value) describes how light or dark something is. It helps create depth, shadow, and the illusion of three dimensions.'),
  t(9, '### Seeing the Elements Around You\n\nNow that you know the seven elements, start looking for them everywhere!\n\n| Where to Look | Elements You Might See |\n|--------------|----------------------|\n| A Ndebele house | Line, shape, colour |\n| A clay pot from the market | Form, texture |\n| A tree in the school yard | Line (branches), shape (leaves), texture (bark), form (trunk) |\n| A sunset over the veld | Colour, tone, space |\n| A beaded necklace | Colour, shape, texture, line |\n\n**Activity idea:** Choose one object in your classroom and list all the elements of art you can see in it. Which element is the strongest?'),
  q(10, 'A 3D clay pot uses which element of art most strongly?',
    ['Line', 'Form', 'Colour', 'Space'], 1,
    'Form is the element that describes three-dimensional objects with height, width, and depth — like a clay pot, a ball, or a sculpture.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Visual Arts — Drawing and Painting (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Drawing and Painting\n\nDrawing and painting are two of the most important skills in Visual Arts. In this chapter, you will learn how to observe carefully and record what you see.\n\n### Observational Drawing\n\nObservational drawing means drawing **what you actually see**, not what you think something looks like. This is harder than it sounds! Our brains often try to draw symbols instead of real shapes.\n\n**Tips for observational drawing:**\n1. **Look more than you draw** — spend 70% of your time looking at the object and only 30% drawing\n2. **Start with big shapes** — sketch the overall shape lightly before adding details\n3. **Measure with your pencil** — hold your pencil at arm\'s length to compare sizes\n4. **Draw what you see, not what you know** — if a circle looks like an oval from your angle, draw an oval\n5. **Use light lines first** — you can always make lines darker later\n\n### Drawing Materials\n\n| Material | What It\'s Good For |\n|----------|-------------------|\n| **HB pencil** | General drawing, outlines |\n| **2B–6B pencil** | Soft, dark marks — good for shading |\n| **Charcoal** | Bold, expressive marks — easy to blend |\n| **Eraser** | Correcting mistakes and creating highlights |\n| **Blending stump** | Smoothing pencil or charcoal for soft tones |'),
  q(2, 'When doing observational drawing, you should:',
    ['Draw from memory', 'Draw what you actually see in front of you', 'Copy a photograph', 'Only draw with paint'], 1,
    'Observational drawing means drawing directly from life — looking carefully at the real object in front of you and recording what you actually see.'),
  t(3, '### Still Life Drawing\n\nA **still life** is a drawing or painting of a group of objects arranged together. The objects don\'t move, so you have time to study them carefully.\n\n**Common still life objects:**\n- Fruit and vegetables (apples, bananas, pumpkins)\n- Bottles, jugs, and cups\n- Flowers in a vase\n- Shoes, hats, or school bags\n- Traditional items like clay pots, woven baskets, or beaded jewellery\n\n**Setting up a still life:**\n1. Choose 3–5 objects of different sizes and shapes\n2. Arrange them on a table so they overlap slightly\n3. Place a single light source (lamp or window) to one side to create interesting shadows\n4. Position yourself so you can see the arrangement clearly\n\n### Landscape Drawing\n\nA **landscape** is a drawing or painting of outdoor scenery — mountains, rivers, fields, trees, and sky. South Africa has incredible landscapes to draw, from the Drakensberg mountains to the Karoo plains.\n\n**Tips for landscape drawing:**\n- Objects far away look **smaller** and **lighter** in tone\n- Objects close to you look **larger** and **darker** in tone\n- The horizon line divides the sky from the land\n- Use **overlapping** to show depth — a tree in front of a mountain'),
  fb(4, 'A ___ ___ is a drawing or painting of a group of objects arranged together that do not move.',
    ['still', 'life'],
    'A still life is an arrangement of non-moving objects like fruit, bottles, flowers, or everyday items that artists study and draw.'),
  t(5, '### Shading Techniques\n\nShading adds **tone** (light and dark values) to your drawings, making flat shapes look three-dimensional.\n\n| Technique | How To Do It | Effect |\n|-----------|-------------|--------|\n| **Hatching** | Draw parallel lines close together | Creates tone using direction of lines |\n| **Cross-hatching** | Layer lines in different directions | Builds up darker tones |\n| **Blending** | Rub pencil marks with finger or stump | Creates smooth, gradual tones |\n| **Stippling** | Make lots of tiny dots | Creates tone using density of dots |\n| **Scumbling** | Make small circular marks | Creates soft, textured tones |\n\n### Pencil Grades\n\nPencils come in different grades (hardness levels):\n- **H pencils** (2H, 4H, 6H) — hard, light marks, good for fine lines\n- **HB** — medium, good for general drawing\n- **B pencils** (2B, 4B, 6B) — soft, dark marks, good for shading\n\nThe higher the B number, the softer and darker the pencil. Use a range of pencils to create a full **tonal scale** from light to dark.'),
  q(6, 'Which shading technique uses tiny dots to create tone?',
    ['Hatching', 'Cross-hatching', 'Blending', 'Stippling'], 3,
    'Stippling creates tone by making many small dots — the closer together the dots are, the darker the area appears.'),
  t(7, '### Painting Basics\n\nPainting adds **colour** to your artwork. In Grade 6, you will work with poster paint or watercolour.\n\n**Colour mixing reminders:**\n\n| Mix These | To Get |\n|-----------|--------|\n| Red + Yellow | Orange |\n| Blue + Yellow | Green |\n| Red + Blue | Purple/Violet |\n| Any colour + White | A lighter tint |\n| Any colour + Black | A darker shade |\n\n**Painting tips:**\n- Start with large areas of colour, then add details\n- Let each layer dry before adding the next\n- Clean your brush between colours to keep them bright\n- Mix colours on a palette, not on the paper\n- Use thick paint for bold marks and thin (watery) paint for soft washes\n\n### Perspective Basics\n\nTo make your drawings look realistic, you need to understand **perspective** — the way things appear to get smaller as they move further away.\n\n- **Foreground** — the part closest to you (objects are large and detailed)\n- **Middle ground** — the area in between\n- **Background** — the part furthest away (objects are small and less detailed)'),
  fb(8, 'Adding white to a colour makes a lighter ___. Adding black to a colour makes a darker ___.',
    ['tint', 'shade'],
    'A tint is made by adding white to lighten a colour. A shade is made by adding black to darken a colour.'),
  q(9, 'In a landscape drawing, objects in the background should appear:',
    ['Larger and darker', 'Smaller and lighter', 'The same size as foreground objects', 'Brighter in colour'], 1,
    'Due to perspective and atmospheric effects, distant objects appear smaller and lighter in tone compared to objects in the foreground.'),
  q(10, 'Cross-hatching is a technique where you:',
    ['Make small dots', 'Layer lines in different directions', 'Rub pencil marks to blend them', 'Use only curved lines'], 1,
    'Cross-hatching builds tone by drawing sets of parallel lines that cross over each other in different directions. More layers create darker values.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Performing Arts — Rhythm and Music (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Rhythm and Music\n\nMusic is made up of organised sounds. To understand music, we need to learn its basic building blocks: **beat**, **rhythm**, **tempo**, **pitch**, and **melody**.\n\n### Beat and Rhythm\n\n| Term | What It Means | Example |\n|------|--------------|----------|\n| **Beat** | The steady pulse in music — like a heartbeat | Clapping steadily: clap, clap, clap, clap |\n| **Rhythm** | The pattern of long and short sounds over the beat | Clap-clap-claaap, clap-clap-claaap |\n| **Tempo** | How fast or slow the beat goes | A slow ballad vs a fast dance song |\n| **Pitch** | How high or low a sound is | A whistle (high) vs a drum (low) |\n| **Melody** | A series of pitches that form a tune | The tune you can sing or hum |\n\nThink of the **beat** as the ticking of a clock — it is always steady. The **rhythm** is the pattern of words or sounds that sits on top of the beat, like a poem recited over the ticking.\n\n### Body Percussion\n\nYou don\'t need instruments to make music! **Body percussion** uses your own body to create sounds:\n- **Clap** your hands\n- **Stamp** your feet\n- **Click** your fingers\n- **Pat** your thighs\n- **Tap** your chest\n\nSouth African music often uses body percussion. In **gumboot dancing**, miners stamp their feet and slap their boots to create complex rhythms.'),
  q(2, 'What is the difference between beat and rhythm?',
    ['They are the same thing', 'Beat is the steady pulse; rhythm is the pattern of sounds', 'Rhythm is the pulse; beat is the pattern', 'Beat is loud and rhythm is soft'], 1,
    'The beat is the steady, unchanging pulse (like a heartbeat). The rhythm is the pattern of long and short sounds that flows over the beat.'),
  fb(3, 'Body ___ is when you use your own body to create sounds, such as clapping, stamping, and clicking your ___.',
    ['percussion', 'fingers'],
    'Body percussion means making musical sounds using your body — clapping, stamping, patting, clicking, and tapping are all forms of body percussion.'),
  t(4, '### South African Music Styles\n\nSouth Africa has a rich variety of music styles. Here are three important ones:\n\n**Marabi** (1920s–1930s)\nMarabi developed in the townships of Johannesburg. It uses a repeating piano pattern with a strong, danceable beat. Marabi was played in shebeens (informal bars) and is the foundation of South African jazz.\n\n**Kwela** (1950s)\nKwela is a happy, upbeat style played on the **penny whistle** (tin flute). It started as street music in Johannesburg and became famous around the world. The word "kwela" means "get up" or "climb on" in Zulu. Spokes Mashiyane was one of the most famous kwela musicians.\n\n**Maskandi** (Traditional Zulu)\nMaskandi is traditional Zulu folk music played on guitar, concertina, or violin. It tells stories about everyday life, love, and Zulu culture. Phuzekhemisi and Shwi noMtekhala are well-known maskandi artists.\n\n| Style | Era | Key Instrument | Character |\n|-------|-----|---------------|----------|\n| Marabi | 1920s–30s | Piano | Repeating patterns, danceable |\n| Kwela | 1950s | Penny whistle | Happy, upbeat, street music |\n| Maskandi | Traditional | Guitar | Storytelling, Zulu folk |'),
  q(5, 'Kwela music is most associated with which instrument?',
    ['Piano', 'Drums', 'Penny whistle', 'Guitar'], 2,
    'Kwela music is famous for its penny whistle (tin flute) melodies. It started as street music in 1950s Johannesburg.'),
  t(6, '### Reading Simple Rhythm Notation\n\nMusicians write rhythm using **notes** of different lengths:\n\n| Note | Name | Beats | How to Count |\n|------|------|-------|-------------|\n| ○ | Semibreve (whole note) | 4 beats | ta-a-a-a |\n| 𝅗𝅥 | Minim (half note) | 2 beats | ta-a |\n| ♩ | Crotchet (quarter note) | 1 beat | ta |\n| ♪♪ | Quavers (eighth notes) | ½ beat each | ti-ti |\n\nA **bar** (or measure) is a group of beats. In most music you hear, each bar has **4 beats**.\n\n**Example rhythm (4 beats per bar):**\nta ta ti-ti ta | ta-a ta-a |\n♩ ♩ ♪♪ ♩ | 𝅗𝅥 𝅗𝅥 |\n\nYou can clap these rhythms using body percussion. Try clapping the crotchets (ta) and tapping your thighs for the quavers (ti-ti).'),
  q(7, 'A crotchet (quarter note) lasts for how many beats?',
    ['Half a beat', 'One beat', 'Two beats', 'Four beats'], 1,
    'A crotchet (quarter note) lasts for one beat. Two quavers (eighth notes) fit into one beat, and a minim lasts for two beats.'),
  fb(8, 'Marabi music developed in the ___ of Johannesburg and is considered the foundation of South African ___.',
    ['townships', 'jazz'],
    'Marabi originated in Johannesburg townships in the 1920s–1930s and is regarded as the foundation of South African jazz music.'),
  q(9, 'Tempo refers to:',
    ['How high or low a sound is', 'How fast or slow the music goes', 'The pattern of long and short sounds', 'The type of instrument being played'], 1,
    'Tempo describes the speed of the music — how fast or slow the beat goes. A fast tempo creates energetic music, while a slow tempo creates calm music.'),
  t(10, '### Listening and Responding\n\nWhen listening to music, pay attention to:\n- **Beat** — Can you feel the steady pulse? Tap along.\n- **Rhythm** — What patterns do you hear? Are they simple or complex?\n- **Tempo** — Is the music fast, slow, or in between?\n- **Pitch** — Are the sounds high, low, or a mixture?\n- **Instruments** — What instruments can you hear? Voices? Drums? Whistles?\n- **Mood** — How does the music make you feel? Happy? Calm? Excited?\n\n**Listening tip:** Close your eyes and focus on one element at a time. First listen for the beat, then the rhythm, then the melody. This helps you hear each part clearly.\n\nSouth African music is rich and diverse — from the harmonies of **isicathamiya** (Ladysmith Black Mambazo) to the driving beats of **kwaito** and **amapiano**. Every style uses these same building blocks in different ways.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Performing Arts — Dance (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Dance\n\nDance is the art of moving your body in a planned and expressive way. It is one of the oldest art forms — people have been dancing for thousands of years to celebrate, tell stories, worship, and express emotions.\n\n### The Elements of Dance\n\nJust as visual art has elements (line, shape, colour), dance has its own elements:\n\n| Element | What It Means | Example |\n|---------|--------------|----------|\n| **Body** | The instrument — what body parts you use | Arms, legs, head, torso, fingers |\n| **Space** | Where you move — direction, level, pathway | Moving forward, backwards, in a circle, high or low |\n| **Time** | When you move — speed, rhythm, duration | Fast, slow, on the beat, syncopated |\n| **Energy** | How you move — force, flow, quality | Sharp, smooth, heavy, light, explosive, sustained |\n\nThese four elements combine in endless ways to create different styles of dance.\n\n### Warming Up\n\nBefore any dance activity, you must **warm up** your body. This prevents injury and prepares your muscles.\n\n**A simple warm-up routine:**\n1. Gentle jogging on the spot (1 minute)\n2. Arm circles — forward and backward\n3. Head rolls — slowly left and right\n4. Torso twists — keeping hips facing forward\n5. Leg swings — forward, backward, and sideways\n6. Ankle rolls and wrist circles\n7. Full-body stretch — reach up high, then bend down to touch your toes'),
  q(2, 'The four elements of dance are:',
    ['Beat, rhythm, tempo, pitch', 'Body, space, time, energy', 'Line, shape, colour, texture', 'Music, costume, stage, lights'], 1,
    'The four elements of dance are body (what moves), space (where you move), time (when you move), and energy (how you move).'),
  fb(3, 'Before any dance activity, you must ___ ___ your body to prevent injury and prepare your muscles.',
    ['warm', 'up'],
    'Warming up is essential before dance. It increases blood flow to muscles, improves flexibility, and reduces the risk of injury.'),
  t(4, '### South African Traditional Dances\n\nSouth Africa has many powerful traditional dance forms. Each reflects the culture and history of its community.\n\n**Gumboot Dancing (Isicathulo)**\nGumboot dancing was created by gold miners in Johannesburg. The miners worked in dark, flooded tunnels wearing rubber gumboots. They invented a way of communicating through rhythmic stamping, slapping, and clapping — because talking was forbidden. Today, gumboot dancing is performed around the world as a symbol of South African creativity and resilience.\n\n**Zulu Dance (Indlamu)**\nIndlamu is a traditional Zulu war dance performed by men. The dancers lift their legs high and stamp the ground with great force. It is powerful, energetic, and shows strength and courage. It is still performed at Zulu ceremonies and cultural events.\n\n**Venda Domba (Python Dance)**\nThe domba is a sacred dance performed by young Venda women as part of their coming-of-age ceremony. The dancers form a long, winding chain and move together like a python snake. It symbolises unity and the transition from girlhood to womanhood.\n\n| Dance | Community | Key Features |\n|-------|-----------|-------------|\n| Gumboot (Isicathulo) | Mine workers | Stamping boots, slapping, clapping |\n| Indlamu | Zulu | High leg lifts, powerful stamping |\n| Domba | Venda | Chain formation, snake-like movement |'),
  q(5, 'Gumboot dancing was originally created by:',
    ['Zulu warriors', 'Gold miners in Johannesburg', 'Venda women', 'School children'], 1,
    'Gumboot dancing was invented by gold miners who worked in dark, flooded tunnels. They created a system of rhythmic communication by stamping and slapping their rubber boots.'),
  q(6, 'In the Venda domba dance, the dancers move like a:',
    ['Lion', 'Eagle', 'Python snake', 'Springbok'], 2,
    'The domba (python dance) is a Venda coming-of-age ceremony where young women form a chain and move together in a winding, snake-like pattern.'),
  t(7, '### Choreography Basics\n\n**Choreography** is the art of creating dance. A choreographer plans the movements, patterns, and formations for a dance.\n\n**Steps to create a simple dance:**\n1. **Choose your music** — listen to it several times and find the beat\n2. **Plan your movements** — decide on 4–8 movements that match the music\n3. **Organise the order** — arrange the movements into a sequence\n4. **Add levels** — include some high movements (jumping, reaching) and low movements (crouching, rolling)\n5. **Add pathways** — move in different directions (forward, backward, diagonal, circular)\n6. **Practise and refine** — repeat until the movements flow smoothly\n\n### Dance Vocabulary\n\n| Term | Meaning |\n|------|--------|\n| **Choreography** | The planned sequence of dance movements |\n| **Formation** | The arrangement of dancers in space (line, circle, V-shape) |\n| **Unison** | Everyone doing the same movement at the same time |\n| **Canon** | The same movement performed one after another (like a wave) |\n| **Levels** | High (jumping), medium (standing), low (crouching) |'),
  fb(8, '___ is the art of creating and planning dance movements. When all dancers do the same movement at the same time, it is called dancing in ___.',
    ['Choreography', 'unison'],
    'Choreography is the art of designing dance sequences. Unison means all dancers perform the same movements at the same time, creating a powerful visual effect.'),
  q(9, 'Which level of dance involves jumping and reaching upward?',
    ['Low level', 'Medium level', 'High level', 'Ground level'], 2,
    'High level in dance includes jumping, leaping, and reaching upward. Medium level is standing, and low level is crouching, crawling, or lying on the floor.'),
  t(10, '### Dance and Expression\n\nDance is not just about steps — it is about **expression**. Good dancers use their faces, their energy, and their whole bodies to communicate feelings.\n\n**Ways to express different moods through dance:**\n\n| Mood | Movements | Energy |\n|------|-----------|--------|\n| Joy | Jumping, spinning, wide arms | Light, quick, bouncy |\n| Sadness | Slow walks, drooping, curling inward | Heavy, slow, sustained |\n| Anger | Stamping, sharp punches, strong stances | Explosive, sharp, forceful |\n| Peace | Gentle sways, flowing arms, smooth turns | Smooth, slow, flowing |\n\nIn South African dance, expression is central. Gumboot dancers show pride and defiance. Zulu warriors show strength and courage. Domba dancers show grace and unity. The movements carry meaning far beyond entertainment — they connect people to their history and culture.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Visual Arts — Printmaking and Pattern (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Printmaking and Pattern\n\nPrintmaking is a way of creating art by transferring an image from one surface to another. Instead of drawing one picture, you can make **many copies** (prints) of the same design.\n\n### Types of Printmaking\n\n| Type | How It Works | Materials |\n|------|-------------|----------|\n| **Block printing** | Carve a design into a flat surface (block), apply ink, press onto paper | Polystyrene, lino, wood, potato |\n| **Stencil printing** | Cut a shape out of card or paper, dab paint through the opening | Card, sponge, paint |\n| **Mono printing** | Paint on a smooth surface, place paper on top and rub | Glass, plastic, paint |\n| **Rubbing (frottage)** | Place paper over a textured surface and rub with crayon | Paper, crayon, textured objects |\n\n### Making a Simple Block Print\n\n1. **Design** — draw your pattern on paper first\n2. **Transfer** — draw the design onto a polystyrene tile (remember, it will print in reverse!)\n3. **Carve** — press into the polystyrene to create grooves (the grooves will not print)\n4. **Ink** — roll ink evenly over the surface with a brayer (roller)\n5. **Print** — place paper on top and rub firmly with a spoon or clean roller\n6. **Peel** — carefully lift the paper to reveal your print\n\n**Important:** Your design will print as a **mirror image**, so any letters or numbers must be drawn backwards on the block.'),
  q(2, 'When making a block print, the design will print as a:',
    ['Darker version', 'Lighter version', 'Mirror image', 'Smaller copy'], 2,
    'Block prints create a mirror image (reversed left to right) of the original design. This is why text must be carved backwards on the block.'),
  fb(3, 'In block printing, the grooves you carve into the surface will ___ print, while the raised areas will be covered with ___.',
    ['not', 'ink'],
    'The carved grooves sit below the surface so the ink roller passes over them. Only the raised (uncarved) areas pick up ink and transfer it to the paper.'),
  t(4, '### Pattern Design\n\nA **pattern** is created when a shape or motif is repeated in an organised way. Patterns are everywhere — in nature, in architecture, and in art.\n\n**Key pattern concepts:**\n\n| Concept | What It Means | Example |\n|---------|--------------|----------|\n| **Motif** | The basic unit that is repeated | A single flower, triangle, or zigzag |\n| **Repetition** | Using the same motif again and again | A row of identical triangles |\n| **Symmetry** | A balanced arrangement that is the same on both sides | A butterfly\'s wings |\n| **Translation** | Sliding the motif along without rotating it | A border of repeating circles |\n| **Rotation** | Turning the motif around a centre point | A pinwheel or sunflower |\n| **Reflection** | Flipping the motif to create a mirror image | A zigzag pattern |\n\n### Creating Your Own Pattern\n\n1. Design a simple **motif** (keep it simple — 2 or 3 shapes)\n2. Decide on a **grid** (square grid, triangular grid, or free-form)\n3. **Repeat** the motif using translation, rotation, or reflection\n4. Choose **colours** — limit yourself to 2–3 colours for a strong effect\n5. Fill the entire space — patterns should have no gaps'),
  q(5, 'A motif in pattern design is:',
    ['The background colour', 'The basic unit that is repeated', 'A type of paint', 'The border around a pattern'], 1,
    'A motif is the basic design element or unit that is repeated to create a pattern. It can be a shape, symbol, or image.'),
  t(6, '### African Pattern Traditions\n\nAfrica has some of the most beautiful pattern traditions in the world.\n\n**Ndebele Patterns**\nNdebele women paint bold, geometric patterns on their homes using bright primary colours. The patterns feature:\n- Symmetrical arrangements\n- Bold black outlines\n- Bright colours — blue, green, red, yellow, pink\n- Geometric shapes — triangles, rectangles, diamonds, chevrons\n- Each pattern has cultural and spiritual meaning\n\n**African Textile Patterns**\nMany African communities create patterned fabrics:\n\n| Textile | Origin | Pattern Style |\n|---------|--------|---------------|\n| **Shweshwe** | South Africa (Lesotho origin) | Small geometric prints in indigo, red, brown |\n| **Kente** | Ghana/West Africa | Bold strips of woven colour |\n| **Ankara** | West Africa | Bright, large-scale printed patterns |\n| **Basotho blankets** | Lesotho/South Africa | Distinctive patterns with symbolic meanings |\n\n**Shweshwe** fabric is a proudly South African textile. Originally brought to South Africa in the 1800s, it became deeply embedded in South African culture. The small, intricate geometric patterns are used for traditional clothing, especially by Sotho, Xhosa, and Tswana communities.'),
  fb(7, 'Ndebele women paint bold, geometric ___ on their homes using bright colours and black ___.',
    ['patterns', 'outlines'],
    'Ndebele house painting features geometric patterns with bold black outlines and bright colours. This tradition is passed from mother to daughter.'),
  q(8, 'Shweshwe fabric is originally associated with which South African communities?',
    ['Zulu and Swazi', 'Sotho, Xhosa, and Tswana', 'Venda and Tsonga', 'San and Khoi'], 1,
    'Shweshwe fabric, with its small geometric prints, became deeply embedded in the cultures of Sotho, Xhosa, and Tswana communities, though it is now widely used across South Africa.'),
  q(9, 'Symmetry in pattern design means:',
    ['Using only one colour', 'Making a pattern as large as possible', 'A balanced arrangement that is the same on both sides', 'Repeating a motif in random places'], 2,
    'Symmetry means the design is balanced and looks the same (or mirrored) on both sides of a central line, like a butterfly\'s wings.'),
  t(10, '### Printmaking and Pattern Together\n\nPrintmaking is the perfect technique for creating patterns because once you carve your motif onto a block, you can print it over and over again.\n\n**Steps to create a printed pattern:**\n1. Design a motif inspired by Ndebele patterns or Shweshwe designs\n2. Carve the motif into a polystyrene block\n3. Choose 2–3 colours of ink\n4. Print the motif in a grid or border pattern on paper\n5. Let each colour dry before printing the next\n\n**Remember:** Great pattern design uses **repetition** (the motif appears many times), **consistency** (each print looks the same), and **colour harmony** (the colours work well together). Look at the patterns around you — on your clothes, on tiles, on fabrics — and notice how they use these principles.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Performing Arts — Drama (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Drama\n\nDrama is the performing art of telling stories through action. Actors use their **bodies**, **voices**, and **imaginations** to bring characters and stories to life.\n\n### Key Drama Skills\n\n| Skill | What It Means |\n|-------|---------------|\n| **Storytelling** | Sharing a story using voice, gesture, and expression |\n| **Characterisation** | Creating a believable character — how they walk, talk, and behave |\n| **Improvisation** | Making up a scene on the spot, without a script |\n| **Mime** | Telling a story using only body movements — no words |\n| **Tableaux** | A frozen picture made by actors — like a photograph come to life |\n| **Voice projection** | Speaking loudly and clearly so the audience can hear you |\n\n### Using Your Voice\n\nYour voice is your most important tool in drama. You can change it in many ways:\n\n| Voice Element | How to Change It | Effect |\n|--------------|-----------------|--------|\n| **Volume** | Louder or softer | A whisper creates suspense; a shout shows anger |\n| **Pitch** | Higher or lower | A high pitch can show fear; a low pitch shows authority |\n| **Pace** | Faster or slower | Fast speech shows excitement; slow speech shows importance |\n| **Tone** | Friendly, angry, sad, scared | Shows the emotion of the character |\n| **Pause** | Stopping briefly | Creates tension or emphasis |\n\n**Voice projection** means speaking loudly enough for the audience to hear without shouting. Breathe deeply from your diaphragm (tummy), open your mouth wide, and direct your voice to the back of the room.'),
  q(2, 'Improvisation in drama means:',
    ['Reading from a script', 'Making up a scene on the spot without a script', 'Wearing a costume', 'Building a stage set'], 1,
    'Improvisation means creating a scene spontaneously — making up the dialogue, actions, and story as you go, without a written script.'),
  fb(3, '___ is when actors create a frozen picture using their bodies, like a photograph come to life. ___ is telling a story using only body movements and no words.',
    ['Tableaux', 'Mime'],
    'A tableau (plural: tableaux) is a frozen scene where actors hold still positions to create a picture. Mime uses body movements and facial expressions to tell a story without words.'),
  t(4, '### Characterisation\n\nTo create a believable character, think about:\n\n| Aspect | Questions to Ask |\n|--------|------------------|\n| **Physical** | How does the character walk? Stand? Sit? What gestures do they use? |\n| **Voice** | How do they speak? Fast? Slow? High? Low? What accent? |\n| **Emotions** | What does the character feel? Happiness? Fear? Anger? Sadness? |\n| **Motivation** | What does the character want? What are they trying to achieve? |\n| **Background** | Where are they from? How old are they? What is their job? |\n\n**Hot-seating** is a drama exercise where you sit in a chair as your character and the class asks you questions. You must answer as the character would — not as yourself!\n\n### Storytelling in South African Culture\n\nStory telling is one of the oldest traditions in Africa. Before books and writing, stories were passed down **orally** — from one generation to the next through speaking and performing.\n\n**Features of South African oral storytelling:**\n- The storyteller uses different voices for each character\n- The audience participates — responding, clapping, or repeating phrases\n- Stories often have a **moral** — a lesson about right and wrong\n- Animal characters represent human qualities (tortoise = wisdom, hare = trickery)\n- A common opening phrase: "Kwasukasukela..." (Once upon a time, in Zulu)'),
  q(5, 'The Zulu phrase "Kwasukasukela" is used to:',
    ['End a story', 'Begin a story (once upon a time)', 'Introduce a character', 'Ask the audience to be quiet'], 1,
    '"Kwasukasukela" is the Zulu equivalent of "Once upon a time" — it signals the beginning of a traditional story.'),
  t(6, '### South African Stories and Folktales\n\nSouth African oral tradition is rich with stories that teach important life lessons:\n\n**The Story of the Hare and the Tortoise (African version)**\nThis well-known tale appears in many African cultures. The clever but lazy hare loses a race to the slow but steady tortoise. The moral: hard work and persistence beat laziness and overconfidence.\n\n**Anansi Stories**\nAnansi is a spider character from West African folklore who also appears in Southern African stories. Anansi is a trickster — clever but sometimes too cunning for his own good. His stories teach lessons about honesty, greed, and the consequences of deception.\n\n**Why the Zebra Has Stripes**\nA popular Southern African folktale explaining how the zebra got its stripes — usually involving a fight near a fire where the zebra was burned by the flames, leaving permanent stripe marks.\n\nThese stories have been told for hundreds of years and continue to be shared today. When you perform a folktale in drama, you are keeping this living tradition alive.'),
  fb(7, 'Before books and writing, stories in Africa were passed down ___ — from one generation to the next through speaking and ___.',
    ['orally', 'performing'],
    'Oral tradition means passing stories, history, and knowledge from generation to generation through spoken word and performance, rather than through writing.'),
  q(8, 'In South African folktales, the tortoise character usually represents:',
    ['Speed and agility', 'Wisdom and persistence', 'Trickery and cunning', 'Strength and power'], 1,
    'In many African folktales, the tortoise represents wisdom, patience, and persistence. The tortoise succeeds through steady effort rather than speed or trickery.'),
  t(9, '### Creating a Drama Performance\n\nWhen you create a drama performance with your class, follow these steps:\n\n1. **Choose or create a story** — pick a South African folktale or write your own\n2. **Assign characters** — decide who plays each role\n3. **Plan the scenes** — break the story into 3–5 scenes (beginning, middle, end)\n4. **Rehearse** — practise the dialogue, movements, and expressions\n5. **Add stagecraft** — think about where actors stand, enter, and exit\n6. **Perform** — share your work with an audience\n\n**Stage positions:**\n\n| Position | Where It Is |\n|----------|------------|\n| Centre stage | The middle of the performing area |\n| Stage left | The actor\'s left (audience\'s right) |\n| Stage right | The actor\'s right (audience\'s left) |\n| Upstage | Towards the back (away from audience) |\n| Downstage | Towards the front (closer to audience) |'),
  q(10, 'Stage left refers to:',
    ['The audience\'s left', 'The actor\'s left', 'The centre of the stage', 'Behind the curtain'], 1,
    'Stage directions are always given from the actor\'s perspective facing the audience. So stage left is the actor\'s left, which is the audience\'s right.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Visual Arts — Sculpture and 3D Art (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Sculpture and 3D Art\n\nSculpture is art you can walk around and sometimes touch. Unlike a flat drawing or painting (which is **2D** — height and width only), sculpture is **3D** — it has height, width, and **depth**.\n\n### Types of Sculpture Techniques\n\n| Technique | What It Means | Materials |\n|-----------|--------------|----------|\n| **Modelling** | Building up a form by adding material | Clay, papier-mâché, playdough |\n| **Carving** | Removing material to reveal a form | Wood, soap, soft stone |\n| **Constructing** | Joining pieces together | Wire, cardboard, found objects |\n| **Assemblage** | Combining found objects into a 3D artwork | Bottles, tins, fabric, scrap metal |\n\n### Working with Clay\n\nClay is one of the oldest and most popular sculpture materials. South African communities have worked with clay for thousands of years.\n\n**Basic clay techniques:**\n\n| Technique | How To Do It |\n|-----------|-------------|\n| **Pinch pot** | Push your thumb into a ball of clay and pinch the walls thin |\n| **Coil building** | Roll clay into long sausage shapes and stack them in rings |\n| **Slab building** | Roll clay flat and cut it into shapes to join together |\n| **Scoring and slipping** | Scratch the surface (score) and add water/slip to join clay pieces |\n\n**Important:** When joining clay, always **score and slip** — scratch both surfaces with a fork and apply water or liquid clay (slip). If you just press pieces together, they will crack apart when they dry.'),
  q(2, 'What is the difference between 2D and 3D art?',
    ['2D uses colour; 3D does not', '2D is flat (height and width); 3D has depth as well', '2D is old; 3D is modern', '2D is small; 3D is large'], 1,
    '2D (two-dimensional) art has height and width only — it is flat, like a drawing or painting. 3D (three-dimensional) art also has depth — you can walk around it.'),
  fb(3, 'When joining pieces of clay, you must ___ both surfaces and add water or ___ to make a strong bond.',
    ['score', 'slip'],
    'Scoring means scratching the surfaces to be joined. Slip is liquid clay (or water) applied to the scored surfaces. This creates a strong bond that won\'t crack when the clay dries.'),
  t(4, '### Papier-Mâché\n\nPapier-mâché (French for "chewed paper") is made by layering strips of newspaper soaked in paste over a form.\n\n**How to make papier-mâché:**\n1. Create a **form** — scrunch newspaper into a shape, or use a balloon or bottle as a base\n2. Tear (don\'t cut) newspaper into strips about 3 cm wide\n3. Mix **paste** — combine flour and water into a smooth mixture, or use PVA glue mixed with water\n4. Dip each strip into the paste and smooth it onto the form\n5. Apply at least **3–4 layers**, letting each layer dry between applications\n6. Once fully dry, paint and decorate your sculpture\n\n**Tips:**\n- Tear the paper, don\'t cut it — torn edges blend better and create a smoother surface\n- Each layer should go in a different direction (horizontal, then vertical) for strength\n- Allow 24 hours of drying time between layers\n\n### Found Object Art (Assemblage)\n\nAssemblage is creating 3D art from **found objects** — things that were not originally meant to be art materials. This includes bottle caps, wire, tins, fabric scraps, broken toys, and old packaging.\n\nAssemblage is popular in South Africa because it:\n- Uses materials that are free and available\n- Recycles waste into beautiful objects\n- Makes an environmental statement\n- Celebrates creativity and resourcefulness'),
  q(5, 'When making papier-mâché, you should tear the newspaper strips rather than cut them because:',
    ['Cut strips are too expensive', 'Torn edges blend better and create a smoother surface', 'Scissors are dangerous', 'Cutting takes too long'], 1,
    'Torn strips have rough, feathered edges that overlap and blend together more smoothly than the sharp, straight edges of cut strips.'),
  t(6, '### South African Sculpture Traditions\n\n**Venda and Tsonga Wood Carving**\nCarvers in Limpopo province create beautiful wooden sculptures of animals, people, and spiritual figures. These carvings are made from indigenous woods and are often decorated with beads and paint.\n\n**Wire Art**\nSouth African wire art is famous around the world. Artists twist and bend wire to create:\n- Toy cars, bicycles, and helicopters\n- Animals — rhinos, elephants, giraffes\n- Beaded wire bowls and baskets\n- Decorative figures and sculptures\n\nWire art started as children\'s toy-making in rural communities. Today, wire artists sell their work at markets across South Africa and internationally. The craft shows incredible skill — creating detailed 3D forms from simple wire.\n\n**Willie Bester**\nWillie Bester is a South African artist who creates powerful assemblage sculptures from scrap metal, machine parts, and found objects. His work comments on poverty, inequality, and the effects of apartheid. Bester turns rubbish into meaningful art.\n\n| Tradition | Material | Significance |\n|-----------|----------|-------------|\n| Venda/Tsonga carving | Wood | Cultural and spiritual expression |\n| Wire art | Wire, beads | Resourceful toy-making turned fine art |\n| Willie Bester | Scrap metal | Social commentary through assemblage |'),
  fb(7, 'South African ___ art involves twisting and bending wire to create toys, animals, and sculptures. Willie Bester creates assemblage sculptures from scrap ___ and found objects.',
    ['wire', 'metal'],
    'Wire art is a distinctly South African craft tradition. Willie Bester uses scrap metal and found objects to create assemblage sculptures that comment on social issues.'),
  q(8, 'Assemblage is a sculpture technique that involves:',
    ['Carving a shape from a block of stone', 'Combining found objects into a 3D artwork', 'Painting a canvas', 'Drawing with charcoal'], 1,
    'Assemblage means creating art by combining found objects — items not originally intended as art materials — into a three-dimensional composition.'),
  q(9, 'Which of the following is a clay technique where you roll clay into long sausage shapes and stack them?',
    ['Pinch pot', 'Slab building', 'Coil building', 'Carving'], 2,
    'Coil building involves rolling clay into long, sausage-like coils and stacking them in rings to build up the walls of a pot or sculpture.'),
  t(10, '### Planning a 3D Artwork\n\nBefore you start building, always plan your sculpture:\n\n1. **Sketch** your idea from the front, side, and top\n2. Choose your **materials** — clay, papier-mâché, wire, or found objects\n3. Think about **structure** — how will it stand up? Does it need an armature (internal skeleton)?\n4. Consider **balance** — will it be stable or tip over?\n5. Decide on **surface treatment** — will you paint it, leave it natural, or add texture?\n\n**Armature:** For larger sculptures, you may need an **armature** — an internal framework (made from wire, sticks, or scrunched newspaper) that supports the sculpture from inside, like a skeleton supports your body.\n\nRemember: sculpture is about **form** (the 3D shape) and **space** (the areas around and through the sculpture). A sculpture with a hole through it uses **negative space** in an interesting way. Look at how South African artists like Edoardo Villa and Anton van Wouw used form and space in their sculptures.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Performing Arts — Group Performance (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Group Performance\n\nIn the performing arts, some of the most powerful moments happen when people perform **together**. A group performance combines the skills of many individuals into a single, unified experience.\n\n### Working as an Ensemble\n\nAn **ensemble** is a group of performers who work together. In an ensemble:\n- Everyone is equally important — there are no "small parts"\n- Performers must **listen** to each other and be aware of what others are doing\n- Timing is crucial — everyone must be in sync\n- Trust and respect between performers are essential\n\n### Ensemble Skills\n\n| Skill | Why It Matters |\n|-------|---------------|\n| **Listening** | You must hear the music, hear your fellow performers, and respond |\n| **Watching** | Be aware of others\' movements and positions |\n| **Timing** | Move, speak, or play at exactly the right moment |\n| **Cooperation** | Work together, share ideas, and compromise |\n| **Focus** | Concentrate on the performance, not distractions |\n| **Spatial awareness** | Know where you are in relation to other performers and the audience |\n\n### Combining Art Forms\n\nA group performance can combine different performing arts:\n- **Music** — singing, playing instruments, body percussion\n- **Dance** — choreographed movement, traditional dance\n- **Drama** — acting, storytelling, mime, spoken word\n\nSouth African performances often blend all three. Think of a traditional ceremony where storytelling, singing, dancing, and drumming all happen together.'),
  q(2, 'An ensemble in performing arts is:',
    ['A solo performer', 'A group of performers who work together', 'A type of musical instrument', 'A stage setting'], 1,
    'An ensemble is a group of performers (actors, dancers, musicians, or a combination) who collaborate to create a unified performance.'),
  fb(3, 'In a group performance, performers must ___ to each other and have good ___ awareness to know where they are on stage.',
    ['listen', 'spatial'],
    'Listening helps performers stay in sync with each other. Spatial awareness means knowing where you are in relation to other performers and the audience.'),
  t(4, '### Rehearsal Techniques\n\nGreat performances don\'t just happen — they require careful **rehearsal** (practice). Here is how to rehearse effectively:\n\n**Types of rehearsal:**\n\n| Rehearsal Type | What You Do |\n|---------------|-------------|\n| **Blocking rehearsal** | Work out where everyone stands, moves, enters, and exits |\n| **Run-through** | Perform the whole piece from start to finish without stopping |\n| **Technical rehearsal** | Practise with props, costumes, music, and lighting |\n| **Dress rehearsal** | A final full rehearsal exactly as the real performance |\n| **Sectional rehearsal** | Focus on one section or scene that needs extra work |\n\n**Good rehearsal habits:**\n- Start on time and be prepared\n- Warm up your body and voice\n- Listen to the director\'s instructions\n- Take notes and remember corrections\n- Be supportive of other performers\n- Repeat difficult sections until they are smooth\n\n### The Role of the Director\n\nThe **director** leads the group, making decisions about:\n- How scenes should be performed\n- Where performers should stand and move (blocking)\n- The overall mood and style of the performance\n- How music, dance, and drama work together\n\nIn class, you may take turns being the director. A good director listens to everyone\'s ideas and makes clear decisions.'),
  q(5, 'A blocking rehearsal is used to:',
    ['Practise with full costumes', 'Work out where performers stand and move', 'Memorise lines', 'Check the sound equipment'], 1,
    'Blocking is the process of planning and practising stage movement — where actors stand, walk, enter, and exit during a performance.'),
  t(6, '### Staging Your Performance\n\nStaging is how you arrange the performance space for the audience.\n\n**Stage types:**\n\n| Stage Type | Layout | Best For |\n|-----------|--------|----------|\n| **Proscenium** | Audience sits in front | Formal performances, plays |\n| **Thrust** | Audience sits on three sides | Closer audience connection |\n| **In the round** | Audience sits all around | Intimate, immersive performances |\n| **Open space** | No fixed stage — can be anywhere | Outdoor events, school performances |\n\n**Using the space effectively:**\n- **Don\'t bunch up** — spread out so the audience can see everyone\n- **Face the audience** — avoid turning your back unless it\'s intentional\n- **Use levels** — some performers can stand, some kneel, some sit for visual interest\n- **Enter and exit cleanly** — know exactly where and when to come on and off\n\n### Audience Awareness\n\n**Good audience members:**\n- Watch quietly and attentively\n- Laugh, clap, or respond at appropriate moments\n- Don\'t talk, use phones, or distract performers\n- Applaud at the end to show appreciation\n\n**Good performers:**\n- Maintain focus even if something goes wrong\n- Never break character to laugh or chat\n- Make eye contact with the audience when appropriate\n- Project their voices so everyone can hear'),
  fb(7, 'In a ___ stage layout, the audience sits all around the performers. In a ___ stage, the audience sits only in front.',
    ['round', 'proscenium'],
    'In-the-round staging places the audience on all sides, creating an intimate feel. A proscenium stage has the audience only in front, like a traditional theatre.'),
  q(8, 'Which of the following is NOT a good rehearsal habit?',
    ['Starting on time', 'Listening to the director', 'Talking while others are rehearsing', 'Repeating difficult sections'], 2,
    'Talking during rehearsal is disruptive and disrespectful to other performers. Good rehearsal habits include being on time, listening, and practising difficult parts.'),
  t(9, '### Combining Music, Dance, and Drama — A South African Tradition\n\nSouth African cultural performances naturally combine all three performing arts:\n\n**Isicathamiya** — A cappella singing with choreographed dance moves, made famous by Ladysmith Black Mambazo. The performers sing in harmony while performing smooth, synchronised steps.\n\n**Pantsula** — A high-energy street dance from the townships, performed to kwaito and house music. Groups (crews) perform in perfect unison with sharp, precise movements.\n\n**Umkhosi woMhlanga (Reed Dance)** — A Zulu ceremony where thousands of young women sing, dance, and present reeds to the king. It combines music, dance, and cultural storytelling.\n\nThese traditions show that in South African culture, music, dance, and drama are not separate art forms — they are parts of a single, powerful experience.'),
  q(10, 'Isicathamiya is a South African performance style that combines:',
    ['Oil painting and sculpture', 'A cappella singing and choreographed dancing', 'Solo guitar playing', 'Computer animation'], 1,
    'Isicathamiya combines harmonised a cappella (unaccompanied) singing with choreographed dance movements. Ladysmith Black Mambazo is the most famous isicathamiya group.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Visual Arts — Design and Craft (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Design and Craft\n\nDesign is the process of planning and creating something with a purpose. While fine art (like painting and sculpture) is made to be admired, **design** is made to be **used**.\n\n### What is Design?\n\n| Concept | Fine Art | Design |\n|---------|---------|--------|\n| **Purpose** | Express ideas and emotions | Solve a problem or serve a function |\n| **Audience** | Art lovers, gallery visitors | Everyday people (users, customers) |\n| **Examples** | Paintings, sculptures | Posters, logos, packaging, furniture |\n| **Judgement** | Is it meaningful? | Does it work? Is it clear? |\n\n### Graphic Design Basics\n\nGraphic design is the art of visual communication using text and images.\n\n**Key graphic design elements:**\n\n| Element | What It Is | Example |\n|---------|-----------|----------|\n| **Typography** | The style and arrangement of letters | Bold headlines, neat body text |\n| **Imagery** | Pictures, photos, illustrations | A photo on a poster |\n| **Colour** | Colour choices that create a mood | Red for urgency, blue for calm |\n| **Layout** | How elements are arranged on the page | Where the title, image, and text go |\n| **White space** | Empty areas that give the design room to breathe | Margins and gaps between elements |\n\nGood design is **clear**, **attractive**, and **easy to understand**. If someone looks at your poster and doesn\'t know what it\'s about within 3 seconds, the design needs improvement.'),
  q(2, 'The main difference between fine art and design is:',
    ['Design uses colour; fine art does not', 'Fine art is made to express ideas; design is made to serve a function', 'Fine art is modern; design is traditional', 'There is no difference'], 1,
    'Fine art is primarily about expression and meaning, while design is about function — solving a problem or communicating a message to a specific audience.'),
  fb(3, 'In graphic design, ___ is the style and arrangement of letters. ___ ___ is the empty area that gives a design room to breathe.',
    ['typography', 'White', 'space'],
    'Typography covers font choices, sizes, and letter arrangement. White space (negative space) is the empty area around elements that makes a design feel clean and readable.'),
  t(4, '### Poster Design\n\nA poster must communicate a message quickly and clearly. Here are the key principles:\n\n**The hierarchy of information:**\n1. **What** — the main event, product, or message (the biggest, boldest text)\n2. **When and Where** — the date, time, and place\n3. **Why** — why should someone care? What\'s in it for them?\n4. **How** — how to get involved (contact details, website, directions)\n\n**Design tips for a great poster:**\n- Use a **maximum of 2–3 fonts** — too many looks messy\n- Choose **contrasting colours** — dark text on a light background (or vice versa)\n- Include **one strong image** — a photo, illustration, or graphic\n- Leave **white space** — don\'t fill every centimetre\n- Make the most important information **biggest**\n- Keep text **short and punchy** — a poster is not an essay\n\n### Typography Tips\n\n| Font Type | Best Used For | Example |\n|-----------|-------------|----------|\n| **Serif** (with small strokes at letter ends) | Body text, formal designs | Times New Roman |\n| **Sans-serif** (without strokes) | Headlines, modern designs | Arial, Helvetica |\n| **Display/Decorative** | Headings only — never body text | Fun, artistic fonts |\n\n**Rule:** Never use more than 3 different fonts in one design. One for headings, one for body text, and (optionally) one for accent text.'),
  q(5, 'On a poster, the most important information should be:',
    ['In the smallest text', 'Hidden in the corner', 'The biggest and boldest text', 'In a decorative font that is hard to read'], 2,
    'The most important information (the main message) should be the most visually prominent — biggest, boldest, and most visible — so viewers see it first.'),
  t(6, '### South African Craft Traditions\n\nSouth Africa has a rich tradition of handmade crafts that are both **functional** (useful) and **decorative** (beautiful).\n\n**Beadwork**\nZulu, Ndebele, and Xhosa communities have long traditions of beadwork. Small glass beads are threaded and woven into jewellery, clothing, and decorative items. In Zulu tradition, different colours carry different messages:\n\n| Colour | Meaning |\n|--------|--------|\n| White | Purity, love |\n| Blue | Faithfulness |\n| Green | Contentment |\n| Yellow | Wealth |\n| Red | Strong emotion, longing |\n| Black | Marriage, maturity |\n\n**Weaving**\nBasket weaving is practised across South Africa, particularly by Zulu communities. Ilala palm leaves are woven into beautiful, functional baskets with intricate patterns. Zulu woven baskets are collected by art lovers worldwide.\n\n**Pottery**\nVenda, Sotho, and Zulu women have made clay pots for centuries. The pots are hand-built (without a potter\'s wheel), decorated with geometric patterns, and burnished (polished) to a smooth finish. They are used for cooking, storing water, and brewing traditional beer.'),
  fb(7, 'In Zulu beadwork, the colour white represents purity and ___, while black represents marriage and ___.',
    ['love', 'maturity'],
    'Zulu beadwork uses a colour code where each colour carries a specific meaning. White represents purity and love, while black represents marriage and maturity.'),
  q(8, 'Zulu woven baskets are traditionally made from:',
    ['Cotton thread', 'Copper wire', 'Ilala palm leaves', 'Wool yarn'], 2,
    'Zulu basket weavers traditionally use ilala palm leaves, which are dried and then woven into baskets with intricate geometric patterns.'),
  t(9, '### Functional vs Decorative Art\n\nCraft objects can be:\n\n| Type | Purpose | Examples |\n|------|---------|----------|\n| **Functional** | Made to be used | A clay cooking pot, a woven storage basket, a beaded belt |\n| **Decorative** | Made to be admired | A wall hanging, a display plate, a beaded ornament |\n| **Both** | Useful AND beautiful | A decorated clay water jug, a patterned blanket |\n\nIn many South African craft traditions, objects are **both** functional and decorative. A Zulu beer pot is designed to hold liquid (functional), but it is also beautifully shaped and decorated with patterns (decorative). This shows that everyday objects can be art.\n\n### Design Your Own\n\nTry designing a product that is both functional and decorative:\n1. Choose an everyday object (pencil holder, bookmark, phone stand)\n2. Sketch 3 different designs\n3. Incorporate patterns inspired by South African craft (Ndebele geometry, Zulu colour symbolism, or woven patterns)\n4. Choose your best design and build it from available materials\n5. Evaluate: Does it work? Is it attractive? Would someone want to use it?'),
  q(10, 'A decorated clay cooking pot is an example of:',
    ['Only functional art', 'Only decorative art', 'Both functional and decorative art', 'Neither functional nor decorative'], 2,
    'A decorated cooking pot serves a practical function (holding and cooking food) while also being beautiful (decorated with patterns). It is both functional and decorative.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Creative Arts Portfolio and Reflection (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Portfolio and Reflection\n\nIn this final chapter, you will learn how to review your own artwork, give and receive feedback, and build a **portfolio** — a collection of your best work from the year.\n\n### What is a Portfolio?\n\nA portfolio is an organised collection of your artwork that shows your skills, creativity, and growth over time.\n\n**What to include:**\n\n| Item | Why Include It |\n|------|---------------|\n| **Your best finished artworks** | Shows your highest skill level |\n| **Process work** (sketches, drafts) | Shows how you develop ideas |\n| **Photographs** of 3D work | Documents sculptures and crafts that can\'t be stored flat |\n| **Written reflections** | Explains your thinking and what you learned |\n| **Artist research** | Shows you can learn from other artists |\n\n**Organising your portfolio:**\n1. Select your best 6–8 pieces from the year\n2. Arrange them in order — either by date or by theme\n3. Write a short description for each piece (title, medium, what you were exploring)\n4. Include at least one piece from each term\n5. Add a cover page with your name, class, and the year\n\n### Self-Assessment\n\nBefore presenting your work, assess yourself honestly:\n- What am I **most proud of** in this portfolio?\n- Which piece shows the **most improvement**?\n- What was the **most challenging** project and how did I handle it?\n- What would I do **differently** if I could do it again?\n- What **skills** did I develop this year?'),
  q(2, 'A portfolio should include:',
    ['Only your very first artworks', 'Only written text, no images', 'Your best finished artworks, process work, and reflections', 'Only photographs'], 2,
    'A well-rounded portfolio includes finished artworks (showing skill), process work (showing development), and written reflections (showing understanding and growth).'),
  fb(3, 'A ___ is an organised collection of your best artwork that shows your skills, creativity, and ___ over time.',
    ['portfolio', 'growth'],
    'A portfolio documents your artistic journey. It should show not just your best work, but also how you have grown and improved as an artist.'),
  t(4, '### Peer Feedback\n\nGiving and receiving feedback is an important part of being an artist. Good feedback helps you improve, and learning to critique others\' work helps you see your own more clearly.\n\n**How to give good feedback:**\n\n| Do | Don\'t |\n|----|------|\n| Start with something positive | Only point out flaws |\n| Be specific ("The shading on the right side is smooth") | Be vague ("It\'s nice") |\n| Suggest improvements gently ("You could try adding more contrast") | Be harsh ("This part is bad") |\n| Focus on the work, not the person | Make personal comments |\n| Use art vocabulary | Use everyday words only |\n\n**How to receive feedback:**\n- Listen without defending yourself\n- Ask questions if you don\'t understand\n- Remember: feedback on your art is not criticism of you as a person\n- Decide which suggestions you agree with and want to use\n- Thank the person for their time and thoughts\n\n**The "compliment sandwich":**\nA helpful structure for feedback:\n1. 🍞 Start with something you like\n2. 🥬 Give a suggestion for improvement\n3. 🍞 End with another positive observation'),
  q(5, 'When giving feedback on a classmate\'s artwork, you should:',
    ['Only say negative things to help them improve', 'Be specific and use art vocabulary', 'Say "it\'s nice" and move on', 'Focus on the person, not the artwork'], 1,
    'Good feedback is specific (pointing to particular elements), uses proper art terminology, and balances positive observations with constructive suggestions.'),
  t(6, '### Art Criticism Vocabulary\n\nWhen discussing art — your own or others\' — use this four-step process:\n\n| Step | What You Do | Example |\n|------|-----------|----------|\n| **1. Describe** | Say what you see — just the facts | "I see a landscape with mountains, trees, and a river" |\n| **2. Analyse** | Identify the elements and principles used | "The artist used warm colours and diagonal lines to create energy" |\n| **3. Interpret** | Explain what you think the artwork means | "I think the artist is showing the beauty of the South African landscape" |\n| **4. Evaluate** | Give your opinion — is it successful? Why? | "The painting is effective because the warm colours create a feeling of a hot summer day" |\n\n### Key Art Vocabulary\n\n| Term | Meaning |\n|------|--------|\n| **Composition** | How elements are arranged in an artwork |\n| **Medium** | The material used (pencil, paint, clay, wire) |\n| **Technique** | The method or skill used (hatching, coil building, block printing) |\n| **Focal point** | The part of the artwork your eye is drawn to first |\n| **Contrast** | Differences that create interest (light/dark, big/small) |\n| **Harmony** | Elements that work well together |\n| **Mood** | The feeling or atmosphere of the artwork |'),
  fb(7, 'The four steps of art criticism are: describe, ___, interpret, and ___.',
    ['analyse', 'evaluate'],
    'Art criticism follows four steps: describe (what you see), analyse (elements and principles used), interpret (what it means), and evaluate (your judgement of its success).'),
  q(8, 'In the art criticism process, "analyse" means:',
    ['Say what you see in the artwork', 'Identify the elements and principles the artist used', 'Give your personal opinion', 'Research the artist\'s biography'], 1,
    'Analysis is the second step of art criticism. It involves identifying which art elements (line, colour, texture) and design principles (balance, contrast, emphasis) the artist used.'),
  t(9, '### Reflecting on Your Year\n\nLook back at everything you have learned in Grade 6 Creative Arts:\n\n**Visual Arts:**\n- Elements of art (line, shape, colour, texture, tone, form, space)\n- Drawing and painting techniques (observational drawing, shading, colour mixing)\n- Printmaking and pattern (block printing, motif, repetition, Ndebele patterns)\n- Sculpture and 3D art (clay, papier-mâché, wire art, assemblage)\n- Design and craft (poster design, typography, beadwork, weaving, pottery)\n\n**Performing Arts:**\n- Rhythm and music (beat, rhythm, tempo, pitch, melody, marabi, kwela, maskandi)\n- Dance (body, space, time, energy, gumboot dancing, Zulu dance, Venda domba)\n- Drama (storytelling, characterisation, improvisation, mime, tableaux, SA folktales)\n- Group performance (ensemble, rehearsal, staging, combining art forms, isicathamiya)\n\n**South African Artists You Studied:**\n- Esther Mahlangu — Ndebele geometric painting\n- William Kentridge — Charcoal drawings and animation\n- Willie Bester — Assemblage from found objects\n- Spokes Mashiyane — Kwela penny whistle musician\n- Ladysmith Black Mambazo — Isicathamiya performers'),
  q(10, 'Which step of art criticism asks "What do you think the artwork means?"',
    ['Describe', 'Analyse', 'Interpret', 'Evaluate'], 2,
    'Interpretation is the third step, where you explain what you think the artwork communicates — its message, story, or meaning based on what you have described and analysed.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — insert into MongoDB
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 6
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
    tags: ['grade-6', 'creative-arts', 'caps'],
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
      title: 'Chapter 1: Visual Arts — Elements of Art',
      description: 'The seven elements of art (line, shape, colour, texture, tone, form, space), how artists use the elements, and South African artists Esther Mahlangu and William Kentridge.',
      order: 1,
      lessons: [
        { title: 'Elements of Art', description: 'The seven elements of art, how artists use and combine them, Esther Mahlangu (Ndebele painting), William Kentridge (charcoal drawing), and spotting elements in everyday life.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Visual Arts — Drawing and Painting',
      description: 'Observational drawing, still life, landscape, drawing materials, shading techniques (hatching, cross-hatching, blending, stippling), painting basics, and perspective.',
      order: 2,
      lessons: [
        { title: 'Drawing and Painting', description: 'Observational drawing tips, still life setup, landscape drawing, shading techniques, pencil grades, colour mixing, painting basics, and perspective (foreground, middle ground, background).', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Performing Arts — Rhythm and Music',
      description: 'Beat, rhythm, tempo, pitch, melody, body percussion, South African music styles (marabi, kwela, maskandi), and reading simple rhythm notation.',
      order: 3,
      lessons: [
        { title: 'Rhythm and Music', description: 'Beat vs rhythm, tempo, pitch, melody, body percussion, gumboot dancing, marabi (township piano), kwela (penny whistle), maskandi (Zulu folk), and simple notation (semibreve, minim, crotchet, quaver).', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Performing Arts — Dance',
      description: 'Elements of dance (body, space, time, energy), South African traditional dances (gumboot, Zulu indlamu, Venda domba), choreography basics, and warming up.',
      order: 4,
      lessons: [
        { title: 'Dance', description: 'Four elements of dance, warm-up routine, gumboot dancing (isicathulo), Zulu indlamu, Venda domba (python dance), choreography steps, dance vocabulary (formation, unison, canon, levels), and expression through movement.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Visual Arts — Printmaking and Pattern',
      description: 'Block printing, stencil printing, pattern design (motif, repetition, symmetry), Ndebele patterns, and African textile patterns (Shweshwe, Kente).',
      order: 5,
      lessons: [
        { title: 'Printmaking and Pattern', description: 'Types of printmaking (block, stencil, mono, rubbing), block printing steps, pattern concepts (motif, repetition, symmetry, translation, rotation, reflection), Ndebele house patterns, and African textiles (Shweshwe, Kente, Ankara, Basotho blankets).', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Performing Arts — Drama',
      description: 'Storytelling, characterisation, improvisation, mime, tableaux, voice projection, South African stories and folktales, and oral traditions.',
      order: 6,
      lessons: [
        { title: 'Drama', description: 'Key drama skills, voice elements (volume, pitch, pace, tone, pause), characterisation, hot-seating, South African oral tradition, Kwasukasukela, folktales (Anansi, Hare and Tortoise, Zebra stripes), stage positions, and creating a drama performance.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Visual Arts — Sculpture and 3D Art',
      description: 'Working with clay (pinch, coil, slab), papier-mâché, found object assemblage, South African sculpture traditions (Venda carving, wire art, Willie Bester).',
      order: 7,
      lessons: [
        { title: 'Sculpture and 3D Art', description: 'Sculpture techniques (modelling, carving, constructing, assemblage), clay techniques (pinch, coil, slab, score and slip), papier-mâché, found object art, Venda wood carving, wire art, Willie Bester, and planning a 3D artwork.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Performing Arts — Group Performance',
      description: 'Working as an ensemble, rehearsal techniques, staging, audience awareness, and combining music, dance, and drama in performance.',
      order: 8,
      lessons: [
        { title: 'Group Performance', description: 'Ensemble skills (listening, watching, timing, cooperation, focus, spatial awareness), rehearsal types (blocking, run-through, technical, dress, sectional), staging (proscenium, thrust, in-the-round), audience awareness, and SA combined performances (isicathamiya, pantsula, Reed Dance).', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Visual Arts — Design and Craft',
      description: 'Graphic design basics, poster design, typography, South African craft traditions (beadwork, weaving, pottery), and functional vs decorative art.',
      order: 9,
      lessons: [
        { title: 'Design and Craft', description: 'Fine art vs design, graphic design elements (typography, imagery, colour, layout, white space), poster design and hierarchy, font types, Zulu beadwork colour symbolism, Zulu basket weaving, Venda/Sotho pottery, and functional vs decorative art.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Creative Arts Portfolio and Reflection',
      description: 'Reviewing your work, self-assessment, peer feedback, building a portfolio, and art criticism vocabulary (describe, analyse, interpret, evaluate).',
      order: 10,
      lessons: [
        { title: 'Portfolio and Reflection', description: 'What is a portfolio, selecting and organising work, self-assessment questions, giving and receiving peer feedback, art criticism four-step process (describe, analyse, interpret, evaluate), key art vocabulary, and year-in-review of all Grade 6 Creative Arts topics.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 6 Creative Arts \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Elements of Art, Drawing and Painting, Rhythm and Music, Dance, Printmaking and Pattern, Drama, Sculpture and 3D Art, Group Performance, Design and Craft, and Portfolio and Reflection for the Grade 6 Creative Arts curriculum.',
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
  console.log('  TEXTBOOK: Grade 6 Creative Arts');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(function(err) { console.error(err); process.exit(1); });
