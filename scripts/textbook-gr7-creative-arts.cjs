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
// CHAPTER 1: Introduction to Visual Literacy (Term 1)
// ===============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## What is Visual Literacy?\n\nWelcome to Grade 7 Creative Arts (Visual Art)! This year you will learn to **see** the world like an artist. Visual literacy is the ability to **read**, **interpret**, and **create** visual images.\n\n### Why Visual Literacy Matters\n\nYou see hundreds of images every day — on TV, on your phone, on signs, on clothing, and in the world around you. Being visually literate means you can:\n- Understand what an image is trying to say\n- Describe what you see using the correct art words\n- Make your own art that communicates a message\n- Appreciate art from your own culture and from other cultures\n\n### How Artists Communicate\n\nArtists use **visual language** — just like writers use words, artists use lines, shapes, colours, and textures to tell stories and share ideas.\n\n| Writer\'s Tool | Artist\'s Tool |\n|--------------|---------------|\n| Words | Lines and shapes |\n| Sentences | Compositions |\n| Paragraphs | Areas of colour and tone |\n| Punctuation | Emphasis and contrast |\n| Story structure | Design principles |\n\nIn South Africa, visual communication has a very long history. The **San people** created rock paintings thousands of years ago to record their experiences, beliefs, and the animals around them. Today, South African artists continue to use visual language to express identity, culture, and social messages.'),
  q(2, 'Visual literacy is best described as the ability to:',
    ['Read, interpret, and create visual images', 'Only draw realistic pictures', 'Read books about famous artists', 'Take photographs with a camera'], 0,
    'Visual literacy means being able to read (interpret), understand, and create visual images — it goes far beyond just drawing.'),
  t(3, '### Looking at Art: What to Notice\n\nWhen you look at an artwork, ask yourself these questions:\n\n| Question | What It Helps You See |\n|----------|----------------------|\n| **What do I see?** | The subject matter — people, animals, objects, shapes |\n| **What colours are used?** | The colour choices and how they make you feel |\n| **What materials were used?** | The medium — paint, pencil, clay, fabric |\n| **How does it make me feel?** | The mood or atmosphere of the artwork |\n| **What message is the artist sharing?** | The meaning or story behind the artwork |\n\n### Art in Your Everyday Life\n\nArt and design are everywhere around you:\n- **School uniform** — someone designed the colours, badge, and style\n- **Food packaging** — a designer chose the colours, images, and lettering\n- **Your home** — the patterns on curtains, plates, and blankets are all designed\n- **Road signs** — simple shapes and colours communicate important messages\n- **Cell phone icons** — tiny visual designs that you understand instantly\n\nBy learning visual literacy, you will start to notice design and art in places you never thought to look before.'),
  q(4, 'Which of the following is an example of visual art in everyday life?',
    ['The design on food packaging', 'The taste of food', 'The sound of music', 'The temperature outside'], 0,
    'Food packaging uses visual design — colours, images, typography, and layout — to attract buyers and communicate information. This is visual art in everyday life.'),
  fb(5, 'The ___ people of Southern Africa created some of the oldest art in the world in the form of rock ___.',
    ['San', 'paintings'],
    'The San people created rock paintings that are among the oldest artworks in the world, dating back tens of thousands of years.'),
  t(6, '### South African Art Heritage\n\nSouth Africa has a rich and diverse art heritage. Here are some important art traditions you will explore this year:\n\n| Art Tradition | Description |\n|--------------|-------------|\n| **San rock art** | Ancient paintings on rock surfaces using natural pigments — ochre, charcoal, and animal fat. Found across South Africa, especially in the Drakensberg mountains |\n| **Ndebele house painting** | Bold, colourful geometric patterns painted on the walls of homes by Ndebele women. Each pattern has cultural meaning |\n| **Zulu beadwork** | Intricate beaded jewellery and decorations where different colours carry specific messages |\n| **Venda pottery** | Hand-built clay pots decorated with geometric patterns, made by Venda women |\n| **Sotho blanket traditions** | The Basotho blanket is worn as a garment and features symbolic patterns |\n\n**Famous South African artist — Esther Mahlangu:**\nEsther Mahlangu is a Ndebele artist famous around the world for her bold, geometric mural paintings. She was the first woman to paint a BMW Art Car, and her work has been exhibited in galleries across the globe. She learned the art of Ndebele wall painting from her mother and grandmother, keeping the tradition alive.'),
  q(7, 'San rock art is found especially in which South African mountain range?',
    ['The Drakensberg mountains', 'Table Mountain', 'The Magaliesberg', 'The Swartberg'], 0,
    'The Drakensberg mountains in KwaZulu-Natal contain some of the richest collections of San rock art in the world, with thousands of painted rock shelters.'),
  fb(8, 'Esther Mahlangu is famous for her bold, geometric ___ mural paintings. She was the first woman to paint a BMW Art ___.',
    ['Ndebele', 'Car'],
    'Esther Mahlangu brought Ndebele art to the world stage. She painted a BMW Art Car in 1991, becoming the first woman to do so.'),
  t(9, '### The Building Blocks of Art\n\nTo become visually literate, you need to learn the **elements of art** and the **principles of design**.\n\n**Elements of art** — the basic building blocks:\n- **Line** — a mark made by a moving point\n- **Shape** — a flat area with height and width\n- **Colour** — produced when light reflects off a surface\n- **Texture** — how a surface feels or looks like it feels\n- **Tone (value)** — how light or dark something is\n- **Space** — the area around, between, and within objects\n\n**Principles of design** — the rules for arranging the elements:\n- **Balance** — even distribution of visual weight\n- **Contrast** — using differences to create interest\n- **Emphasis** — making one part stand out\n- **Pattern** — repeating an element\n- **Proportion** — the size relationship between parts\n\nThink of the **elements** as your art ingredients and the **principles** as the recipe that tells you how to combine them.'),
  q(10, 'The elements of art are best described as:',
    ['The basic building blocks used to create artwork', 'The rules for arranging artwork', 'Types of paint and brushes', 'Different art careers'], 0,
    'The elements of art (line, shape, colour, texture, tone, space) are the basic building blocks that artists use. The principles of design are the guidelines for arranging them.'),
  fb(11, 'The elements of art are like the ___ and the principles of design are like the ___ that tells you how to combine them.',
    ['ingredients', 'recipe'],
    'Just as a cook needs ingredients (elements) and a recipe (principles), an artist needs the elements of art and the principles of design to create successful artwork.'),
  q(12, 'Which of the following is an element of art?',
    ['Texture', 'Balance', 'Emphasis', 'Pattern'], 0,
    'Texture is an element of art (a building block). Balance, emphasis, and pattern are principles of design (guidelines for arrangement).',
    ['Elements are the building blocks; principles are the guidelines for arranging them.']),
];

// ===============================================================================
// CHAPTER 2: The Elements of Art — Line, Shape, and Space (Term 1)
// ===============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Line — The Starting Point of All Art\n\nEvery mark you make begins with a line. A line is created when a point moves across a surface. It can be drawn with a pencil, painted with a brush, scratched into a surface, or even suggested without being physically drawn.\n\n### Types of Line\n\n| Line Type | What It Looks Like | Mood / Feeling |\n|-----------|--------------------|----------------|\n| **Horizontal** | Flat, side to side | Calm, restful, peaceful |\n| **Vertical** | Straight up and down | Tall, strong, dignified |\n| **Diagonal** | Slanting | Movement, energy, action |\n| **Curved** | Bending, flowing | Soft, graceful, natural |\n| **Zigzag** | Sharp back and forth | Excitement, nervousness, danger |\n| **Spiral** | Curving inward or outward | Growth, movement, energy |\n\n### Line Quality\n\nThe **quality** of a line describes how it looks:\n\n| Line Quality | Effect |\n|-------------|--------|\n| **Thick / bold** | Strong, heavy, powerful |\n| **Thin / fine** | Delicate, light, detailed |\n| **Broken / dashed** | Uncertain, suggested, invisible edges |\n| **Smooth** | Controlled, calm, precise |\n| **Rough / jagged** | Wild, energetic, emotional |\n\n### Line in South African Art\n\n- **Ndebele wall art** — bold, straight lines create geometric patterns with deep cultural meaning\n- **San rock paintings** — fine, detailed outlines of animals like eland, elephants, and human figures\n- **Zulu beadwork** — lines of coloured beads form patterns that carry messages'),
  q(2, 'A diagonal line creates a feeling of:',
    ['Movement and energy', 'Calm and rest', 'Strength and dignity', 'Delicacy and detail'], 0,
    'Diagonal lines suggest movement and energy because they appear to be falling or rising. They create a dynamic, active feeling in artwork.'),
  fb(3, 'A ___ line runs flat from side to side and creates a feeling of calm. A ___ line goes straight up and down and suggests strength.',
    ['horizontal', 'vertical'],
    'Horizontal lines are calm and restful (like a flat horizon). Vertical lines suggest strength and dignity (like a tall tree or building).'),
  t(4, '### Shape — Flat Areas in Art\n\nA **shape** is a flat, enclosed area with height and width. Shapes are created when lines meet or when areas of colour or tone define an edge.\n\n**Two main types of shape:**\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Geometric shapes** | Regular, mathematical, precise | Circle, square, triangle, rectangle, diamond, hexagon |\n| **Organic shapes** | Irregular, natural, free-form | Leaves, clouds, puddles, pebbles, amoeba shapes |\n\n### Positive and Negative Shape\n\n- **Positive shape** — the main subject or object in the artwork (the thing you drew)\n- **Negative shape** — the empty space around and between the subjects\n\nGood artists pay attention to **both** positive and negative shapes. The space around an object is just as important as the object itself.\n\n### Shape in South African Art\n\n- **Ndebele house painting** — uses bold **geometric shapes** (triangles, rectangles, diamonds) arranged in symmetrical patterns\n- **Zulu shields** — the oval shield shape is one of the most recognisable shapes in South African history\n- **Traditional clay pots** — use rounded, **organic shapes** inspired by natural forms'),
  q(5, 'A leaf shape is an example of:',
    ['An organic (free-form) shape', 'A geometric shape', 'A mathematical shape', 'A regular shape'], 0,
    'Leaves have irregular, natural outlines — they are organic (free-form) shapes. Geometric shapes like circles and triangles are regular and mathematical.'),
  t(6, '### Space — Creating Depth\n\n**Space** in art refers to the area around, between, and within objects.\n\n**Types of space:**\n\n| Type | Description |\n|------|-------------|\n| **Positive space** | The area occupied by the subject |\n| **Negative space** | The empty area around and between subjects |\n| **Foreground** | The area closest to the viewer (front) |\n| **Middle ground** | The area between foreground and background |\n| **Background** | The area farthest from the viewer (back) |\n\n**Creating the illusion of depth on a flat surface:**\n\n| Technique | How It Works |\n|-----------|-------------|\n| **Overlapping** | Objects in front partially cover objects behind |\n| **Size** | Objects that are closer appear larger; objects far away appear smaller |\n| **Placement** | Objects lower on the page appear closer; objects higher appear farther |\n| **Detail** | Close objects show more detail; distant objects show less |\n| **Colour** | Close objects have brighter colours; distant objects appear lighter and bluer |\n\nEven though a piece of paper is flat, artists use these techniques to make you feel like you are looking into a deep space.'),
  q(7, 'If you want to show that one object is in front of another in a drawing, you should:',
    ['Overlap the objects so the front one partially covers the back one', 'Draw both objects the same size', 'Place the front object higher on the page', 'Make the back object brighter'], 0,
    'Overlapping is the simplest way to show depth. When one object partially covers another, we understand that the covered object is behind.'),
  fb(8, 'The area occupied by the subject in an artwork is called ___ space. The empty area around and between objects is called ___ space.',
    ['positive', 'negative'],
    'Positive space is where the subject sits. Negative space is the area around it. Both are important in creating a balanced composition.'),
  t(9, '### Drawing from Observation\n\nDrawing from **observation** means looking carefully at a real object and drawing what you actually see — not what you think it looks like.\n\n**Tips for drawing from observation:**\n\n1. **Look more than you draw** — spend most of your time looking at the object\n2. **Start with big shapes** — draw the overall shape before adding details\n3. **Use light lines first** — you can always make them darker later\n4. **Compare sizes** — how big is one part compared to another?\n5. **Check angles** — hold your pencil up to compare the angle of an edge\n6. **Add details last** — only after the big shapes are correct\n\n**Observation exercise: Drawing your hand**\n\nYour hand is always available as a drawing subject! Try these exercises:\n- Draw the outline (contour) of your hand without looking at your paper\n- Draw your hand holding an object (pencil, cup, ball)\n- Draw your hand from different angles\n\nObservation is the most important skill in art. The more you practise looking carefully, the better your drawings will become.'),
  q(10, 'When drawing from observation, you should:',
    ['Spend more time looking at the object than drawing', 'Draw as fast as possible without looking', 'Copy a photograph from the internet', 'Draw from memory'], 0,
    'Observational drawing means looking carefully at a real subject. Spending most of your time looking ensures accuracy — most drawing mistakes come from not looking enough.'),
  t(11, '### Create in 2D: Line and Shape Composition\n\nFor your first practical activity, you will create a **2D artwork** that explores line and shape.\n\n**Materials you might use:**\n\n| Material | What It Does |\n|----------|-------------|\n| **Pencil (graphite)** | Fine lines, shading, easy to erase |\n| **Wax crayons** | Bold, bright colours, waxy texture |\n| **Colour inks** | Vibrant, flowing colour |\n| **Oil pastels** | Thick, rich colour, blendable |\n| **Charcoal** | Bold, dark marks, dramatic effects |\n\n**Your task:**\n1. Choose objects to observe (e.g., leaves, shells, stones, shoes, fruit)\n2. Make at least 4 thumbnail sketches exploring different arrangements\n3. Select your best composition\n4. Create a final artwork using line and shape\n5. Consider both geometric and organic shapes\n6. Think about positive and negative space'),
  q(12, 'Small, quick drawings used to explore different ideas before starting a final artwork are called:',
    ['Thumbnail sketches', 'Final drawings', 'Tracings', 'Photographs'], 0,
    'Thumbnail sketches are small, quick exploratory drawings. Artists use them to try out different compositions and ideas before committing to a final artwork.'),
];

// ===============================================================================
// CHAPTER 3: The Elements of Art — Colour Theory (Term 1)
// ===============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Colour Theory: Understanding the Colour Wheel\n\nColour is one of the most powerful elements of art. Understanding how colours work together will help you make better choices in your artwork.\n\n### The Colour Wheel\n\nThe colour wheel is a circular diagram that shows the relationships between colours.\n\n| Category | Colours | How They Are Made |\n|----------|---------|-------------------|\n| **Primary colours** | Red, Yellow, Blue | Cannot be made by mixing other colours — they are the starting point |\n| **Secondary colours** | Orange, Green, Violet (purple) | Made by mixing two primary colours together |\n| **Tertiary colours** | Red-orange, Yellow-orange, Yellow-green, Blue-green, Blue-violet, Red-violet | Made by mixing a primary colour with the secondary colour next to it |\n\n### Mixing Secondary Colours\n\n| Mix | Result |\n|-----|--------|\n| Red + Yellow | **Orange** |\n| Yellow + Blue | **Green** |\n| Blue + Red | **Violet (purple)** |\n\n### Colour Properties\n\nEvery colour has three properties:\n\n| Property | Meaning | Example |\n|----------|---------|--------|\n| **Hue** | The name of the colour | Red, blue, yellow-green |\n| **Value** | How light or dark the colour is | Light blue vs dark blue |\n| **Intensity** | How bright or dull the colour is | Bright red vs dull red |'),
  q(2, 'What do you get when you mix blue and yellow together?',
    ['Green', 'Orange', 'Violet', 'Brown'], 0,
    'Blue + yellow = green. Green is a secondary colour made by mixing two primary colours.'),
  fb(3, 'The three primary colours are red, ___, and blue. A secondary colour is made by mixing two ___ colours together.',
    ['yellow', 'primary'],
    'The primary colours are red, yellow, and blue. Secondary colours (orange, green, violet) are each made by mixing two primaries.'),
  t(4, '### Warm and Cool Colours\n\nColours can be divided into two groups based on the feelings they create:\n\n| Group | Colours | Feeling | Examples in Nature |\n|-------|---------|---------|-------------------|\n| **Warm colours** | Red, Orange, Yellow | Energy, heat, excitement, happiness | Fire, sunset, autumn leaves |\n| **Cool colours** | Blue, Green, Violet | Calm, peace, sadness, coolness | Water, sky, grass, shadows |\n\n**How artists use warm and cool colours:**\n- A painting with mostly warm colours feels **energetic and inviting**\n- A painting with mostly cool colours feels **calm and peaceful**\n- Using warm and cool colours together creates **contrast** and visual interest\n\n### Complementary Colours\n\nComplementary colours sit **directly opposite** each other on the colour wheel:\n\n| Complementary Pair | Effect When Used Together |\n|-------------------|-------------------------|\n| **Red** and **Green** | Strong contrast, vibrant |\n| **Blue** and **Orange** | Bold, eye-catching |\n| **Yellow** and **Violet** | Dramatic, striking |\n\nWhen complementary colours are placed next to each other, they make each other look **brighter and more vivid**. Artists use this to create emphasis and focal points.\n\n**South African example:**\nThe vibrant colour combinations in Ndebele house painting often use near-complementary colour pairs to create bold, eye-catching designs that can be seen from far away.'),
  q(5, 'Which pair of colours are complementary (opposite on the colour wheel)?',
    ['Blue and orange', 'Blue and green', 'Red and orange', 'Yellow and green'], 0,
    'Blue and orange are complementary colours — they sit directly opposite each other on the colour wheel. When placed together, they create strong visual contrast.',
    ['Complementary colours are found opposite each other on the colour wheel.']),
  q(6, 'Warm colours make a viewer feel:',
    ['Energetic and excited', 'Calm and peaceful', 'Sad and lonely', 'Confused and lost'], 0,
    'Warm colours (red, orange, yellow) are associated with energy, heat, and excitement. They remind us of fire, sunlight, and warmth.'),
  t(7, '### Tints, Shades, and Tones\n\nYou can change the value (lightness or darkness) of any colour:\n\n| Term | How to Make It | Result |\n|------|---------------|--------|\n| **Tint** | Add **white** to a colour | A lighter version (e.g., red + white = pink) |\n| **Shade** | Add **black** to a colour | A darker version (e.g., blue + black = navy blue) |\n| **Tone** | Add **grey** to a colour | A duller, more muted version |\n\n### Creating a Tonal Range\n\nA **tonal range** (also called a value scale) shows a colour going from its lightest tint to its darkest shade in smooth steps.\n\nTo paint a tonal range:\n1. Start with pure white on one end\n2. Add a tiny bit of colour — this is the lightest tint\n3. Gradually add more colour\n4. In the middle, use the pure colour\n5. Gradually add black to create darker shades\n6. End with the darkest shade\n\nA good tonal range has at least **5-7 steps** from light to dark.\n\n**Why tonal range matters:**\nUsing a full range of tones (from light tints to dark shades) makes your artwork look more realistic and three-dimensional. A drawing that uses only one tone looks flat.'),
  fb(8, 'Adding white to a colour creates a lighter version called a ___. Adding black to a colour creates a darker version called a ___.',
    ['tint', 'shade'],
    'A tint is a colour mixed with white (lighter). A shade is a colour mixed with black (darker). These are essential colour-mixing skills.'),
  q(9, 'Pink is an example of a:',
    ['Tint of red', 'Shade of red', 'Primary colour', 'Complementary colour'], 0,
    'Pink is created by adding white to red — this makes it a tint. Tints are lighter versions of a colour.'),
  t(10, '### Colour in South African Art\n\n**Colour symbolism in Zulu beadwork:**\n\nIn Zulu culture, each colour in beadwork carries a specific meaning:\n\n| Colour | Meaning |\n|--------|--------|\n| **White** | Purity, true love, virginity |\n| **Black** | Marriage, darkness, sorrow |\n| **Red** | Strong emotion, passion, anger |\n| **Blue** | Faithfulness, loyalty |\n| **Yellow** | Wealth, fertility, garden (earth) |\n| **Green** | Contentment, domestic happiness |\n| **Pink** | Poverty, laziness (a promise not kept) |\n\nThe colours are arranged in specific patterns to send messages — a form of visual communication that has been used for generations.\n\n**Colour in San rock art:**\nThe San used natural pigments to create their paintings:\n- **Red and brown** — from iron oxide (ochre)\n- **White** — from zinc oxide or bird droppings\n- **Black** — from charcoal or manganese oxide\n- **Yellow** — from yellow ochre\n\nThese natural colours give San rock art its distinctive warm, earthy palette.'),
  q(11, 'In Zulu beadwork, the colour blue symbolises:',
    ['Faithfulness and loyalty', 'Wealth and fertility', 'Purity and love', 'Passion and anger'], 0,
    'Blue in Zulu beadwork represents faithfulness and loyalty. Each colour carries a specific meaning, making beadwork a form of visual communication.'),
  q(12, 'The red and brown colours in San rock art come from a natural pigment called:',
    ['Ochre (iron oxide)', 'Plant juice', 'Crushed berries', 'Synthetic dye'], 0,
    'The San used ochre (iron oxide), a natural earth pigment, to create the red and brown colours in their rock paintings. These pigments have lasted thousands of years.'),
];

// ===============================================================================
// CHAPTER 4: The Elements of Art — Texture and Tone (Term 1)
// ===============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Texture — How Surfaces Feel and Look\n\nTexture is the surface quality of an object — how it feels when you touch it, or how it appears to feel when you look at it.\n\n### Two Types of Texture\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Actual (tactile) texture** | The real surface that you can physically feel by touching | The rough surface of tree bark, the smooth surface of glass, the bumpy surface of a clay pot |\n| **Visual (implied) texture** | A texture that the artist creates so it **looks like** a surface, even though the paper is smooth | Drawing tiny lines to make something look furry, or dots to make something look rough |\n\n### Techniques for Creating Visual Texture\n\nYou can make flat paper look textured using these drawing techniques:\n\n| Technique | How to Do It | Effect |\n|-----------|-------------|--------|\n| **Hatching** | Draw many parallel lines close together | Smooth, directional texture |\n| **Cross-hatching** | Draw parallel lines crossing over each other at different angles | Denser, darker texture |\n| **Stippling** | Make many small dots | Grainy, dotted texture |\n| **Scumbling** | Make small circular scribble marks | Rough, tangled texture |\n| **Rubbing (frottage)** | Place paper over a textured surface and rub with a crayon | Captures the actual texture of the surface below |\n\n**Texture activity — Texture collection:**\nGo around your school and home and collect **rubbings** (frottage) of different textures: tree bark, brick wall, coin, leaf, fabric, sole of a shoe. Arrange them in your workbook as a texture library.'),
  q(2, 'What is the difference between actual texture and visual texture?',
    ['Actual texture can be felt by touch; visual texture only appears to have texture', 'Visual texture is always rougher than actual texture', 'There is no difference between them', 'Actual texture is only found in paintings'], 0,
    'Actual (tactile) texture is real — you can feel it by touching the surface. Visual (implied) texture is created by an artist to look like a texture, even though the surface is smooth.'),
  fb(3, 'A technique where you place paper over a textured surface and rub with a crayon is called ___ or frottage. Drawing many small dots to create texture is called ___.',
    ['rubbing', 'stippling'],
    'Rubbing (frottage) captures real textures from surfaces. Stippling uses many small dots to build up a visual texture effect.'),
  t(4, '### Tone (Value) — Light and Dark\n\nTone is how light or dark a colour or area is. Tone is essential for making flat drawings look three-dimensional.\n\n### The Tonal Scale\n\nA tonal scale shows a range of values from white to black:\n\n| Value | Description |\n|-------|------------|\n| **White (highlight)** | The very lightest area, where light hits directly |\n| **Light grey** | Lighter areas, receiving plenty of light |\n| **Mid-tone** | The middle grey — neither light nor dark |\n| **Dark grey** | Darker areas receiving less light |\n| **Black (deep shadow)** | The very darkest area, farthest from the light |\n\n### How Tone Creates 3D Effects\n\nWhen light hits an object, it creates a pattern of light and dark:\n\n| Term | Where You See It |\n|------|------------------|\n| **Highlight** | Where the light hits the object directly |\n| **Mid-tone** | Where the light hits at an angle |\n| **Shadow** | The dark area on the side away from the light |\n| **Cast shadow** | The shadow the object throws onto the surface below it |\n| **Reflected light** | A faint light area within the shadow, caused by light bouncing off nearby surfaces |\n\nBy drawing these different tones carefully, you can make a flat circle look like a three-dimensional sphere!'),
  q(5, 'A cast shadow is:',
    ['The shadow an object throws onto the surface below or behind it', 'The lightest area on an object', 'The colour of the object', 'The outline of the object'], 0,
    'A cast shadow is the shadow that an object projects onto a nearby surface (the table, the floor, or another object). It helps ground the object and show where the light comes from.'),
  t(6, '### Creating Tone with Pencil\n\nYour pencil is a powerful tool for creating tone. Here is how to control it:\n\n**Pencil grades:**\n\n| Grade | Hardness | Mark | Best For |\n|-------|----------|------|----------|\n| **H, 2H, 3H** | Hard | Light, fine lines | Detailed outlines, light tones |\n| **HB** | Medium | Medium line | General drawing, mid-tones |\n| **B, 2B, 3B** | Soft | Dark, rich lines | Shading, dark tones, expression |\n| **4B, 6B, 8B** | Very soft | Very dark, broad marks | Deep shadows, bold marks |\n\n**Tips for smooth shading:**\n1. Hold the pencil on its side for broad, even shading\n2. Build up tone gradually — many light layers are better than pressing hard\n3. Shade in one direction for smooth results\n4. Use a blending stump or tissue to smooth pencil marks\n5. Leave the white of the paper for the brightest highlights\n6. Use your softest pencil (6B or 8B) only for the very darkest darks'),
  q(7, 'Which pencil grade would you use for creating the darkest shadows in a drawing?',
    ['6B or 8B (very soft)', '3H (hard)', 'HB (medium)', 'H (hard)'], 0,
    'Soft pencils like 6B and 8B produce the darkest, richest marks. Hard pencils (H, 2H) produce light, fine lines that are better for details and outlines.'),
  fb(8, 'An HB pencil is considered ___ hardness. Building up tone gradually with many ___ layers gives the smoothest shading results.',
    ['medium', 'light'],
    'HB is the medium grade pencil. Layering many light strokes creates smoother, more controlled shading than pressing hard with a single stroke.'),
  t(9, '### Texture and Tone in South African Art\n\n**William Kentridge — Master of Tone:**\nWilliam Kentridge is one of South Africa\'s most famous artists. He works mainly in **charcoal** — a medium that is perfect for creating rich, dramatic tones from the lightest grey to the deepest black. His drawings and animated films explore themes of memory, inequality, and the history of South Africa.\n\n**Texture in South African craft:**\n\n| Craft | Texture |\n|-------|--------|\n| **Zulu basket weaving (isichumo)** | The woven grass creates a natural, tactile texture |\n| **Venda clay pottery** | Rough, earthy texture from hand-building with clay |\n| **Ndebele beadwork** | Smooth, raised bumps of glass beads |\n| **Wire art (township craft)** | Twisted wire creates intricate, metallic textures |\n| **African print fabric (shweshwe)** | Printed geometric patterns on smooth cotton |\n\n### Create in 2D and 3D: Texture and Tone Project\n\nYour Term 1 assessment includes both a 2D and a 3D artwork:\n- **2D artwork**: A drawing or painting that demonstrates your understanding of texture and tone techniques\n- **3D artwork**: A simple paper construction (folding, cutting, and pasting) that explores shape, space, and texture'),
  q(10, 'William Kentridge mainly works in which medium?',
    ['Charcoal', 'Watercolour', 'Oil paint', 'Digital art'], 0,
    'William Kentridge is famous for his charcoal drawings and animations. Charcoal allows him to create dramatic tonal contrasts — from light grey to deep black.'),
  q(11, 'Shweshwe is a traditional South African:',
    ['Printed cotton fabric with geometric patterns', 'Type of clay pottery', 'Painting style', 'Musical instrument'], 0,
    'Shweshwe is a printed cotton fabric featuring intricate geometric patterns. Originally brought by German settlers, it has become a distinctly South African textile tradition.'),
  fb(12, 'Charcoal is perfect for creating a wide range of ___ from light grey to deep black. Zulu basket weaving creates a natural, ___ texture from woven grass.',
    ['tones', 'tactile'],
    'Charcoal produces rich tonal range. Zulu baskets have actual (tactile) texture — you can feel the woven grass surface.'),
];

// ===============================================================================
// CHAPTER 5: Principles of Design — Balance, Contrast, and Emphasis (Term 1)
// ===============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Principles of Design\n\nNow that you know the **elements of art** (line, shape, colour, texture, tone, space), you need to learn how to **arrange** them. The **principles of design** are the guidelines artists use to organise the elements into a successful composition.\n\n### Balance — Visual Weight\n\nBalance is how visual weight is distributed in a composition. Just like a see-saw needs weight on both sides, an artwork needs visual balance.\n\n**Types of balance:**\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Symmetrical (formal)** | Both sides of the artwork are the same or nearly the same — a mirror image | The front of a butterfly, Ndebele house painting patterns |\n| **Asymmetrical (informal)** | The two sides are different, but the artwork still feels balanced | A large dark shape on one side balanced by two smaller shapes on the other |\n| **Radial** | Everything radiates outward from a central point, like the spokes of a wheel | A flower, a Zulu shield design, a mandala |\n\n**How to check balance in your artwork:**\n- Step back and look at it from a distance\n- Squint your eyes — does one side feel heavier?\n- Cover one half — does the other half feel empty?\n- Turn it upside down — does it still feel balanced?'),
  q(2, 'In symmetrical balance, the two sides of the composition are:',
    ['The same or nearly the same (mirror images)', 'Completely different', 'Random and unplanned', 'Always empty on one side'], 0,
    'Symmetrical (formal) balance means both sides are mirror images or nearly identical. This creates a stable, orderly feeling, like the patterns in Ndebele house painting.'),
  t(3, '### Contrast — Creating Visual Interest\n\nContrast means using **differences** to create visual excitement and interest. Without contrast, an artwork looks flat and boring.\n\n**Types of contrast:**\n\n| Type of Contrast | Example |\n|-----------------|--------|\n| **Light vs dark** | A white shape on a black background |\n| **Big vs small** | A large tree next to a small person |\n| **Rough vs smooth** | A textured area next to a smooth area |\n| **Warm vs cool** | Red and orange next to blue and green |\n| **Thick vs thin** | Bold lines next to fine, delicate lines |\n| **Geometric vs organic** | A sharp square next to a flowing curve |\n\n**Why contrast matters:**\n- It makes your artwork more **interesting** to look at\n- It draws the viewer\'s **attention** to important areas\n- It creates a sense of **drama** and energy\n- Without contrast, everything blends together and nothing stands out\n\n**South African example:**\nIn Ndebele house painting, strong contrast is achieved by using **thick black outlines** against **bright, flat colours**. The contrast between the dark lines and vivid colours makes the patterns visible from far away.'),
  q(4, 'Why is contrast important in an artwork?',
    ['It creates visual interest and draws attention to important areas', 'It makes the artwork simpler', 'It uses fewer materials', 'It removes all differences'], 0,
    'Contrast — the use of differences — creates visual interest, drama, and focus. Without contrast, an artwork would be flat and monotonous.'),
  fb(5, 'Placing a large shape next to a small shape creates contrast of ___. Ndebele house painting creates contrast between thick black ___ and bright colours.',
    ['size', 'outlines'],
    'Size contrast (big vs small) and the contrast between black outlines and bright colours are both effective ways to create visual interest.'),
  t(6, '### Emphasis — The Focal Point\n\n**Emphasis** is the principle of making one part of your artwork stand out as the most important area — the **focal point**. Your eye should be drawn to this area first.\n\n**How to create emphasis:**\n\n| Method | How It Works |\n|--------|-------------|\n| **Contrast** | Make the focal point a different colour, tone, or texture from the rest |\n| **Size** | Make the most important thing bigger than everything else |\n| **Placement** | Place the focal point near the centre or at a key position |\n| **Isolation** | Place the focal point away from other elements |\n| **Detail** | Add more detail to the focal point area |\n| **Leading lines** | Use lines that point towards the focal point |\n\n### The Rule of Thirds\n\nA simple way to place your focal point is the **rule of thirds**:\n1. Imagine dividing your page into 9 equal rectangles (3 across, 3 down)\n2. Place your focal point where two lines cross (an intersection point)\n3. This creates a more interesting composition than placing the subject in the exact centre\n\nThe rule of thirds is a guideline, not a strict rule. Sometimes placing the subject in the centre is the right choice — especially for symmetrical designs.'),
  q(7, 'The area of an artwork that the viewer\'s eye is drawn to first is called the:',
    ['Focal point', 'Background', 'Negative space', 'Border'], 0,
    'The focal point (emphasis) is the area that attracts the viewer\'s eye first. Artists create it using contrast, size, placement, and other techniques.'),
  fb(8, 'The guideline that suggests dividing a composition into nine equal parts is called the rule of ___. The area that draws the viewer\'s eye first is the ___ point.',
    ['thirds', 'focal'],
    'The rule of thirds divides the composition into a 3x3 grid. Placing the focal point at an intersection of the grid lines creates a dynamic composition.'),
  t(9, '### Pattern and Proportion\n\n**Pattern** is created when a motif (a design element) is repeated in a regular way.\n\nSouth Africa is rich in pattern traditions:\n- **Zulu beadwork** — geometric patterns where each colour carries meaning\n- **Shweshwe fabric** — intricate repeating geometric prints\n- **Ndebele wall art** — symmetrical geometric patterns repeated across wall surfaces\n- **Basket weaving** — patterns created by weaving different coloured grasses\n\n**Proportion** is the size relationship between different parts of an artwork.\n\n| Proportion Type | Description |\n|----------------|------------|\n| **Realistic** | Parts are the correct size compared to each other |\n| **Exaggerated** | A part is deliberately made bigger for emphasis |\n| **Hierarchical** | The most important figure is drawn the largest |\n\nIn many traditional African artworks, the **head** is shown larger than realistic proportion. This is called **hierarchical proportion** — the head represents wisdom, thought, and leadership, so it is given more importance by being drawn bigger.'),
  q(10, 'In traditional African sculpture, the head is often shown larger than realistic proportion because:',
    ['The head represents wisdom and leadership (hierarchical proportion)', 'The artist made a mistake', 'African heads are naturally larger', 'It is easier to carve a large head'], 0,
    'Hierarchical proportion is a deliberate artistic choice. Making the head larger emphasises its importance as the seat of wisdom, thought, and leadership.'),
  t(11, '### Create in 2D and 3D: Applying Design Principles\n\nFor your Term 1 practical assessment, apply the design principles you have learned.\n\n**2D project — Observational drawing with design principles:**\n1. Set up a simple still life (2-3 objects)\n2. Create thumbnail sketches exploring balance and emphasis\n3. Choose your best composition\n4. Draw from observation using pencil, crayon, or colour media\n5. Apply contrast (light vs dark, big vs small)\n6. Create a clear focal point (emphasis)\n\n**3D project — Simple paper construction:**\n1. Use paper folding, cutting, and pasting to create a 3D form\n2. Explore geometric shapes in three dimensions\n3. Consider balance — does your construction stand up?\n4. Add pattern and texture to the surface\n5. Consider the work from all angles\n\n**Assessment criteria:**\n- Use of art elements (line, shape, colour, texture, tone)\n- Application of design principles (balance, contrast, emphasis)\n- Quality of observation and craftsmanship\n- Evidence of planning (thumbnail sketches)'),
  q(12, 'Which of the following demonstrates contrast in a 2D artwork?',
    ['A dark shape placed against a light background', 'Everything drawn in the same shade of grey', 'No variation in line thickness', 'All shapes the same size'], 0,
    'A dark shape on a light background is an example of tonal contrast (light vs dark). Contrast requires differences — the greater the difference, the stronger the contrast.'),
];

// ===============================================================================
// CHAPTER 6: Still Life Drawing and Painting (Term 2)
// ===============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Still Life: Drawing and Painting from Observation\n\nIn Term 2, you will create a **still life artwork** — a composition of everyday objects arranged and drawn or painted from direct observation.\n\n### What is a Still Life?\n\nA still life is an artwork showing a group of **non-living objects** arranged by the artist. Common still life objects include:\n- Fruit and vegetables\n- Bottles, jars, and containers\n- Flowers in a vase\n- Books, tools, or household items\n- Musical instruments\n- Shells, stones, and natural objects\n\n### Setting Up a Still Life\n\n| Step | What to Do |\n|------|------------|\n| **1. Choose objects** | Select 3-5 objects with interesting shapes, textures, and sizes |\n| **2. Arrange them** | Overlap some objects; vary heights; create an interesting group |\n| **3. Consider background** | Use a plain cloth or paper behind the objects |\n| **4. Set up lighting** | Place a single light source (lamp or window) to one side |\n| **5. Position yourself** | Sit where you can see the arrangement clearly |\n\n### Why Still Life Is Important\n\nStill life drawing teaches you:\n- How to **observe** carefully — drawing what you see, not what you think\n- How to use **tone** to create the illusion of 3D form\n- How to arrange a **composition** using design principles\n- How to apply **colour theory** in a real painting\n- How to render different **textures** (shiny glass, rough fabric, smooth fruit)'),
  q(2, 'A still life is an artwork that shows:',
    ['A group of non-living objects arranged by the artist', 'A landscape with trees and mountains', 'A portrait of a person', 'Animals in their natural habitat'], 0,
    'A still life depicts non-living objects (fruit, bottles, flowers, etc.) that the artist has deliberately arranged into a composition.'),
  t(3, '### Art Elements in Still Life\n\nApply the elements of art to your still life drawing:\n\n| Element | Application in Still Life |\n|---------|-------------------------|\n| **Line** | Outline the shapes of objects; vary line quality (thick for near edges, thin for far edges) |\n| **Shape** | Observe the shapes of objects carefully — are they geometric or organic? |\n| **Colour** | Observe the actual colours; notice how light changes colour |\n| **Texture** | Show the difference between smooth, rough, shiny, and matte surfaces |\n| **Tone** | Use a full tonal range — from highlight to deep shadow — to make objects look 3D |\n| **Space** | Use overlapping and size to show which objects are in front and which are behind |\n\n### Composition Tips for Still Life\n\n1. **Do not centre everything** — use the rule of thirds\n2. **Overlap objects** — this creates depth and connection\n3. **Vary heights** — create an interesting silhouette\n4. **Leave some negative space** — do not fill every corner\n5. **Create a focal point** — one object should be the main focus\n6. **Think about the edges** — objects should not be cut off awkwardly at the page edge'),
  q(4, 'When setting up a still life, why should you overlap some objects?',
    ['To create depth and show which objects are in front of others', 'To hide objects you do not like', 'Because all objects must touch each other', 'To make the drawing easier'], 0,
    'Overlapping creates the illusion of depth — it shows spatial relationships between objects and connects them into a unified composition.'),
  fb(5, 'Varying ___ quality means using thick lines for near edges and thin lines for far edges. The design principle of ___ ensures one object becomes the main focus of the still life.',
    ['line', 'emphasis'],
    'Line quality (thick vs thin) helps show depth. Emphasis creates a focal point — the most important or eye-catching object in the arrangement.'),
  t(6, '### Painting Your Still Life\n\nIn Term 2, you will also explore **colour mixing** and **painting techniques**.\n\n**Colour mixing for still life painting:**\n\n| Skill | Description |\n|-------|------------|\n| **Tonal range with paint** | Mix tints (add white) and shades (add black) of each colour |\n| **Colour matching** | Look at the actual colour of the object and mix paint to match it |\n| **Complementary colour shadows** | Shadows often contain the complementary colour of the object |\n| **Warm and cool** | Use warm colours for lit areas, cool colours for shadows |\n\n**Painting step by step:**\n1. Draw lightly in pencil first — get the composition right\n2. Block in the **background colour** first\n3. Paint the **mid-tones** of each object (the main colour)\n4. Add the **shadows** (darker tones) while paint is still wet for blending\n5. Add the **highlights** (lighter tones) last\n6. Refine edges and add small details\n\n**Media you can use:**\n- **Tempera paint** — water-based, opaque, dries quickly\n- **Watercolour** — transparent, luminous washes\n- **Colour pencils** — for a dry colour approach\n- **Oil pastels** — rich, vibrant colour that blends well'),
  q(7, 'When painting a still life, what should you paint first?',
    ['The background colour', 'The smallest details', 'The highlights', 'The frame'], 0,
    'Painting the background first establishes the overall composition. Then work from mid-tones to shadows and finally highlights, building up the image from general to specific.'),
  fb(8, 'Adding white to a colour creates a lighter ___. Shadows in a painting often contain the ___ colour of the object (the colour opposite on the colour wheel).',
    ['tint', 'complementary'],
    'Tints are lighter versions of a colour (colour + white). Adding a touch of the complementary colour to shadows makes them richer and more natural.'),
  t(9, '### Simple Etching Techniques\n\nIn Term 2, you also explore **simple etching** — a technique where you scratch into a surface to create a design.\n\n**Wax resist etching (sgraffito):**\n1. Cover your paper with a thick layer of **wax crayon** (use bright colours)\n2. Paint over the entire surface with **black paint or ink** (let it dry completely)\n3. Use a sharp tool (compass point, used ballpoint pen, or wooden skewer) to **scratch through** the black layer\n4. The bright crayon colours are revealed underneath\n\nThis creates a dramatic, high-contrast artwork where bright lines appear against a dark background.\n\n**Other simple etching methods:**\n\n| Method | Description |\n|--------|-------------|\n| **Foam board printing** | Scratch a design into a flat piece of polystyrene foam, apply paint, and press paper on top to make a print |\n| **Card scratch** | Paint a thick layer of acrylic on card, then scratch a design while the paint is still slightly wet |\n| **Scraperboard** | A commercially made board with white under black — scratch to reveal white |\n\n**Assessment: Term 2 — 2D Artwork (25 marks)**\nYour still life artwork will be assessed on use of art elements, design principles, colour mixing (tonal range), and quality of observation.'),
  q(10, 'In sgraffito (wax resist etching), you create an image by:',
    ['Scratching through a dark top layer to reveal bright colours underneath', 'Painting bright colours on top of dark colours', 'Drawing with a pencil on white paper', 'Gluing coloured paper together'], 0,
    'Sgraffito involves covering wax crayon with black paint or ink, then scratching through the dark layer to reveal the colourful crayon beneath.'),
  q(11, 'When painting a tonal range of a single colour, you need to mix at least:',
    ['5-7 steps from light to dark', '2 steps only', '1 step', '20 steps'], 0,
    'A good tonal range has at least 5-7 steps, moving smoothly from the lightest tint to the darkest shade. This shows control and understanding of colour mixing.'),
  fb(12, 'The technique of scratching through a dark surface to reveal colour or white underneath is related to a technique called ___. A board with white underneath a black coating is called a ___.',
    ['sgraffito', 'scraperboard'],
    'Sgraffito (from the Italian word for "scratch") involves scratching through a top layer. Scraperboard is a pre-made version with white under black.'),
];

// ===============================================================================
// CHAPTER 7: Design Principles in 2D — Contrast, Proportion, Emphasis (Term 2)
// ===============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Design Principles in Still Life and 2D Art\n\nIn Term 2 you deepen your understanding of three key design principles — **contrast**, **proportion**, and **emphasis** — and apply them to your still life and other 2D artworks.\n\n### Contrast Revisited\n\nContrast is one of the most important tools for creating effective artworks. In your still life, you can use contrast in many ways:\n\n| Type of Contrast | Still Life Example |\n|-----------------|--------------------|\n| **Tonal contrast** | A dark bottle against a light cloth |\n| **Colour contrast** | A red apple against green leaves |\n| **Texture contrast** | A shiny metal jug next to rough fabric |\n| **Size contrast** | A large pot next to a small cup |\n| **Shape contrast** | Round fruit next to angular books |\n\n### Using Complementary Colour for Contrast\n\nRemember that **complementary colours** (opposites on the colour wheel) create the strongest colour contrast:\n- Red next to green\n- Blue next to orange\n- Yellow next to violet\n\nIn your still life, look for natural complementary colour relationships. A red apple on a green cloth is a classic example of complementary colour contrast in a still life.'),
  q(2, 'A red apple placed on green leaves is an example of:',
    ['Complementary colour contrast', 'Analogous colour harmony', 'Monochromatic colour', 'No contrast'], 0,
    'Red and green are complementary colours (opposite on the colour wheel). When placed together they create strong colour contrast, making both colours appear more vivid.'),
  t(3, '### Proportion in Art\n\nProportion is the **size relationship** between different parts of an artwork or between different objects.\n\n**Getting proportion right in still life:**\n\n| Tip | How to Do It |\n|-----|-------------|\n| **Measure with your pencil** | Hold your pencil at arm\'s length and use your thumb to mark sizes; compare one object to another |\n| **Start with the biggest shape** | Draw the largest object first, then draw smaller objects in relation to it |\n| **Check relationships** | Is the bottle twice as tall as the cup? Is the apple half the width of the book? |\n| **Stand back often** | View your drawing from a distance to check if proportions look right |\n\n### Proportion Mistakes to Avoid\n\n| Common Mistake | Why It Happens | How to Fix It |\n|---------------|----------------|---------------|\n| Objects too small on the page | Fear of making mistakes | Start bigger — fill at least ⅔ of the page |\n| One object too big or too small | Not comparing sizes | Measure and compare before drawing |\n| Objects floating | Not grounding objects on a surface | Draw the surface (table edge) and shadows |'),
  q(4, 'To check the proportion of objects in a still life, you can:',
    ['Hold your pencil at arm\'s length and use your thumb to compare sizes', 'Guess without measuring', 'Trace each object individually', 'Only draw objects you have memorised'], 0,
    'Pencil measuring is a classic artist technique. Holding the pencil at arm\'s length and marking with your thumb lets you compare the relative sizes of objects accurately.'),
  fb(5, 'The size relationship between different parts of an artwork is called ___. You should fill at least ___ of the page to avoid drawing objects too small.',
    ['proportion', 'two-thirds'],
    'Proportion is about relative sizes. Filling at least two-thirds of the page ensures your drawing has presence and is not lost in empty space.'),
  t(6, '### Emphasis in Composition\n\nEvery successful composition has a **focal point** — the area where the viewer\'s eye goes first.\n\n**Creating emphasis in your still life:**\n\n1. **Strongest tonal contrast** at the focal point — the lightest light next to the darkest dark\n2. **Most detail** at the focal point — less detail in surrounding areas\n3. **Complementary colour** at the focal point — it stands out against its surroundings\n4. **Leading lines** — arrange objects so edges or shadows point towards the focal point\n5. **Isolation** — place the key object slightly apart from the group\n\n### Visual Literacy: Describing Artworks\n\nIn Term 2, you also develop your ability to **describe artworks** using correct terminology.\n\n**Framework for describing an artwork:**\n\n| Step | What to Do | Example |\n|------|------------|--------|\n| **1. Identify** | Name what you see | "I see a painting of three bottles and a bowl of fruit" |\n| **2. Describe** | List the art elements used | "The artist uses warm colours, strong tonal contrast, and smooth texture" |\n| **3. Analyse** | Explain how the principles are used | "The red apple is the focal point because of its bright colour against the cool background" |\n| **4. Interpret** | Suggest what the artwork means | "The simple objects suggest the beauty of everyday things" |'),
  q(7, 'The step in artwork analysis where you explain what the artwork might mean is called:',
    ['Interpret', 'Identify', 'Describe', 'Analyse'], 0,
    'Interpretation is where you suggest the deeper meaning or message of an artwork. It goes beyond describing what you see to explaining what the artist might be communicating.'),
  fb(8, 'The strongest colour emphasis is created by using a ___ colour at the focal point. The four steps of analysing art are: identify, describe, ___, and interpret.',
    ['complementary', 'analyse'],
    'Complementary colour creates the strongest contrast and draws the eye. The analysis framework moves from simple identification to deeper interpretation.'),
  t(9, '### South African Artists and Still Life\n\nStill life has a rich history in South African art:\n\n| Artist | Description |\n|--------|-------------|\n| **Irma Stern (1894-1966)** | One of South Africa\'s most celebrated painters. She painted bold, colourful still lifes of flowers, fruit, and South African objects with thick, expressive brushwork |\n| **Maggie Laubser (1886-1973)** | An important early modern South African artist who painted simplified, colourful still lifes and landscapes |\n| **Alexis Preller (1911-1975)** | Known for luminous still lifes featuring South African and African objects arranged with symbolic meaning |\n| **Contemporary SA artists** | Many current South African artists use still life to comment on everyday life, identity, and culture |\n\n**Irma Stern** is particularly important because she helped bring modern art to South Africa. Her thick paint application (called **impasto**) and bold colours were influenced by German Expressionism but always celebrated South African subjects.'),
  q(10, 'Irma Stern is famous for her bold painting technique of applying thick paint, which is called:',
    ['Impasto', 'Sgraffito', 'Stippling', 'Watercolour wash'], 0,
    'Impasto is a painting technique where paint is applied in thick, textured layers. The brushstrokes and even palette knife marks remain visible, giving the surface a tactile quality.'),
  t(11, '### Assessment Preparation: Term 2\n\nYour Term 2 assessment includes a **2D still life artwork** and a **written test**.\n\n**Practical assessment — Still life artwork (25 marks):**\n- Set up and draw/paint a still life from observation\n- Demonstrate colour mixing (tonal range — tints and shades)\n- Apply art elements effectively (line, shape, colour, texture, tone)\n- Apply design principles (contrast, proportion, emphasis)\n- Show quality craftsmanship\n\n**Written test (25 marks) includes:**\n- Art terminology\n- Art elements and their definitions\n- Design principles and their application\n- Colour theory (colour wheel, warm/cool, complementary)\n- Symbolic language in art\n- South African artists and art traditions\n\n**Cognitive levels in the test:**\n\n| Level | Percentage | Type |\n|-------|-----------|------|\n| Lower order | 30% | Name, list, identify, define |\n| Middle order | 40% | Describe, explain, compare |\n| Higher order | 30% | Analyse, interpret, evaluate, discuss |'),
  q(12, 'In the Term 2 practical assessment, you must demonstrate your ability to mix:',
    ['A tonal range showing tints and shades of colour', 'Only primary colours', 'Black and white only', 'Colours from tubes without mixing'], 0,
    'The practical assessment requires you to show colour mixing skills — creating a tonal range from light tints (colour + white) to dark shades (colour + black).'),
];

// ===============================================================================
// CHAPTER 8: Create in 3D — Buildings and Craftwork (Term 3)
// ===============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Create in 3D: Buildings and Craftwork\n\nIn Term 3, you will create **3D artworks** inspired by **buildings** and **craftwork**. You will learn construction and modelling techniques, and explore how art elements and design principles apply to three-dimensional forms.\n\n### What is 3D Art?\n\nA **2D artwork** (like a drawing or painting) is flat — it has height and width.\nA **3D artwork** has height, width, **and depth** — it exists in real space and can be viewed from all sides.\n\n| 2D Art | 3D Art |\n|--------|--------|\n| Drawing | Sculpture |\n| Painting | Clay pottery |\n| Print | Wire art |\n| Collage | Paper construction |\n| Photograph | Architecture (buildings) |\n\n### Architecture as Art\n\nArchitecture — the design and construction of buildings — is one of the oldest forms of art. In South Africa, you can see many different architectural traditions:\n\n| Building Style | Description |\n|---------------|-------------|\n| **Ndebele homes** | Rectangular homes with bold geometric painted walls |\n| **Zulu beehive huts (iQukwane)** | Dome-shaped grass structures |\n| **Cape Dutch homesteads** | White-washed buildings with ornamental gables |\n| **Township architecture** | Practical buildings, often creatively decorated |\n| **Modern city buildings** | Glass, steel, and concrete skyscrapers and public buildings |\n| **Heritage buildings** | Historical buildings preserved for their cultural value |'),
  q(2, 'What is the main difference between 2D and 3D art?',
    ['3D art has depth in addition to height and width', '2D art is always larger', '3D art uses only pencil', '2D art is more colourful'], 0,
    'The key difference is depth. 2D art is flat (height and width only), while 3D art occupies real space with height, width, and depth.'),
  fb(3, 'A traditional Zulu beehive hut is called an ___. Cape Dutch homesteads are known for their white-washed walls and ornamental ___.',
    ['iQukwane', 'gables'],
    'The iQukwane is the dome-shaped Zulu grass hut. Cape Dutch architecture features distinctive ornamental gables (decorative upper walls).'),
  t(4, '### Art Elements in 3D Construction\n\nAll the art elements apply to 3D work, but some are used differently:\n\n| Element | Application in 3D |\n|---------|-------------------|\n| **Shape** | Becomes **form** — 3D shapes: cube, sphere, cylinder, cone, pyramid |\n| **Line** | Edges of the form, decorative lines, seams, and joints |\n| **Colour** | Surface colour and decoration |\n| **Texture** | Actual (tactile) texture is very important in 3D — rough, smooth, bumpy surfaces |\n| **Tone** | Light and shadow naturally fall on 3D forms |\n| **Space** | The space inside (enclosed space), around, and between parts of the artwork |\n\n### Design Principles in 3D\n\n| Principle | Application |\n|-----------|------------|\n| **Balance** | The object must be physically stable (not tip over) and visually balanced |\n| **Proportion** | Parts must relate correctly in size (e.g., door height vs wall height) |\n| **Emphasis** | One area can be the focal point through colour, decoration, or size |\n| **Contrast** | Mix rough and smooth surfaces, or dark and light colours |\n| **Pattern** | Repeat decorative motifs across the surface |'),
  q(5, 'In 3D art, the element of shape becomes:',
    ['Form — three-dimensional shapes like cubes, spheres, and cylinders', 'Line — edges and borders', 'Colour — surface decoration', 'Space — the area around objects'], 0,
    'When a flat shape gains depth, it becomes a form. A circle becomes a sphere, a square becomes a cube, a triangle becomes a pyramid.'),
  t(6, '### 3D Construction Techniques\n\nYou will use a variety of techniques to build your 3D buildings and craftwork:\n\n| Technique | Description |\n|-----------|-------------|\n| **Cutting** | Removing material with scissors or craft knife to create shapes |\n| **Folding** | Bending paper or card along scored lines to create 3D forms |\n| **Pasting/gluing** | Joining pieces together with adhesive |\n| **Wrapping** | Covering a structure with paper, fabric, or other material |\n| **Tying** | Joining with string, wire, or elastic |\n| **Stitching** | Sewing materials together with needle and thread |\n| **Modelling** | Shaping pliable materials (clay, papier-mache) by hand |\n| **Scoring** | Making a shallow cut along a fold line for a clean, precise fold |\n\n**Materials for 3D construction:**\n- Cardboard boxes and tubes\n- Paper (different weights and colours)\n- Recyclable materials (bottles, containers, packaging)\n- Clay or plasticine\n- Wire\n- Fabric scraps\n- Glue, tape, string\n\n**Safety rules:**\n- Always cut **away** from your body\n- Use a cutting mat when using a craft knife\n- Ask your teacher for help with sharp tools\n- Keep your workspace clean and organised'),
  q(7, 'Before folding a piece of cardboard, you should:',
    ['Score it — make a shallow cut along the fold line', 'Wet it with water', 'Paint it first', 'Tear it in half'], 0,
    'Scoring creates a shallow groove along the fold line, allowing the cardboard to fold cleanly and precisely without cracking.'),
  fb(8, 'When using a craft knife, always cut ___ from your body. Covering a structure with paper or fabric is called ___.',
    ['away', 'wrapping'],
    'Cutting away from your body prevents injuries if the knife slips. Wrapping covers a structure\'s surface with decorative or protective material.'),
  t(9, '### Craftsmanship and Surface Decoration\n\n**Good craftsmanship** means your work is neat, well-made, and carefully finished. It shows that you took your time and paid attention to quality.\n\n**Signs of good craftsmanship:**\n- Clean, straight cuts\n- Neat, invisible glue joins\n- Smooth surfaces where intended\n- Consistent surface decoration\n- Stable construction (does not fall apart)\n- Finished from all sides, not just the front\n\n**Surface decoration for your 3D building:**\n\n| Technique | Description |\n|-----------|-------------|\n| **Painting** | Apply colour using tempera, acrylic, or poster paint |\n| **Collage** | Paste cut paper, fabric, or magazine images onto surfaces |\n| **Drawing** | Draw patterns or details directly onto the surface |\n| **Stamping** | Press painted objects onto the surface to create patterns |\n| **Patternmaking** | Repeat motifs across the surface (inspired by SA traditions) |\n\n**Inspiration from South African craft:**\n- **Ndebele wall patterns** — bold geometric designs\n- **Wire and bead art** — township craft traditions using recycled wire\n- **Reclaimers\' art** — artists who transform waste materials into beautiful artworks\n- **Township signage** — hand-painted shop signs with bold lettering'),
  q(10, 'Good craftsmanship in a 3D artwork means:',
    ['The work is neat, stable, well-made, and carefully finished from all sides', 'The work is done as quickly as possible', 'Only the front of the work is decorated', 'The glue is visible everywhere'], 0,
    'Good craftsmanship shows care and skill — clean cuts, invisible joins, smooth finishes, and attention to all sides of the work, not just the front.'),
  q(11, 'When creating a 3D model of a building, you should consider it from:',
    ['All angles — front, back, sides, and top', 'Only the front', 'Only the top', 'Only one side'], 0,
    'A 3D artwork exists in real space and can be viewed from any direction. Successful 3D work is considered and finished from all angles.'),
  fb(12, 'Repeating decorative motifs across a surface is called ___. Artists who transform waste materials into beautiful artworks practise ___ art.',
    ['patternmaking', 'reclaimers\''],
    'Patternmaking creates visual rhythm through repetition. Reclaimers\' art (recycled art) transforms discarded materials into creative works — an important tradition in South African townships.'),
];

// ===============================================================================
// CHAPTER 9: Create in 2D — Paper-Cut Collage and Heritage (Term 3)
// ===============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Paper-Cut Collage: Buildings as Heritage\n\nIn the second part of Term 3, you will create a **2D artwork** — a **paper-cut collage** of buildings, exploring the theme of **buildings as heritage** in South Africa.\n\n### What is Collage?\n\n**Collage** comes from the French word "coller" meaning "to glue." It is an art technique where you create an image by cutting and pasting pieces of paper, fabric, photographs, or other flat materials onto a surface.\n\n### What is Heritage?\n\n**Heritage** means the traditions, buildings, objects, and values passed down from one generation to the next. Heritage buildings are important because they tell us about our history, culture, and identity.\n\n**Examples of heritage buildings in South Africa:**\n\n| Building | Location | Why It Matters |\n|----------|----------|----------------|\n| **Castle of Good Hope** | Cape Town | The oldest surviving building in South Africa (1666-1679) |\n| **Union Buildings** | Pretoria | Seat of government; site of Nelson Mandela\'s inauguration |\n| **Constitutional Court** | Johannesburg | Built on the site of the Old Fort Prison; symbolises justice |\n| **Ndebele homesteads** | Mpumalanga | Living heritage — painted walls preserve cultural tradition |\n| **District Six Museum** | Cape Town | Preserves the memory of a community destroyed by apartheid |\n| **Voortrekker Monument** | Pretoria | Historical monument to Afrikaner heritage |'),
  q(2, 'The word "collage" comes from the French word meaning:',
    ['To glue', 'To paint', 'To cut', 'To draw'], 0,
    'Collage comes from the French word "coller" which means "to glue" or "to paste." The technique involves gluing materials together to create an artwork.'),
  fb(3, 'The oldest surviving building in South Africa is the ___ in Cape Town. Heritage buildings are important because they tell us about our history, culture, and ___.',
    ['Castle of Good Hope', 'identity'],
    'The Castle of Good Hope (1666-1679) is South Africa\'s oldest existing building. Heritage buildings connect us to our past and help shape our identity.'),
  t(4, '### Techniques for Paper-Cut Collage\n\n**Step-by-step process:**\n\n1. **Research** — find photographs or draw sketches of heritage buildings\n2. **Plan your composition** — create thumbnail sketches showing the layout\n3. **Select your papers** — choose colours that work together\n4. **Cut shapes** — cut building shapes, windows, doors, roofs, and details\n5. **Arrange before gluing** — lay out all pieces on your background first\n6. **Paste from back to front** — glue background elements first, foreground last\n7. **Add details** — draw or paint small details on top of the collage\n\n**Cutting techniques:**\n\n| Technique | Result |\n|-----------|--------|\n| **Straight cuts** | Clean edges for buildings and geometric shapes |\n| **Curved cuts** | Rounded forms like arches, domes, and trees |\n| **Torn edges** | Rough, textured edges for natural elements |\n| **Layering** | Building up layers for depth and overlap |\n| **Folding before cutting** | Symmetrical shapes (fold paper in half, cut, unfold) |\n\n**Colour considerations:**\n- Use **monochromatic colour** (one colour in different tints and shades) for a unified look\n- Use **complementary colours** for strong contrast\n- Limit your palette to 3-5 colours for unity'),
  q(5, 'When creating a paper-cut collage, you should paste elements in which order?',
    ['Background first, foreground last (back to front)', 'Foreground first, then background', 'All at once', 'It does not matter'], 0,
    'Working from back to front ensures that foreground elements overlap background ones correctly, creating the illusion of depth.'),
  t(6, '### Art Elements and Design Principles in Collage\n\n| Element/Principle | Application in Collage |\n|-------------------|----------------------|\n| **Shape** | The cut shapes of buildings, windows, doors, roofs |\n| **Colour** | Paper colour choices create mood (warm earth tones for heritage, bright colours for celebration) |\n| **Texture** | Different papers have different textures (smooth, rough, corrugated, patterned) |\n| **Space** | Overlapping and size create depth — larger buildings in front, smaller ones behind |\n| **Balance** | Distribute buildings and elements evenly across the composition |\n| **Contrast** | Light buildings against dark sky, or dark buildings against light background |\n| **Proportion** | Buildings should be the correct relative size (a door should not be bigger than the building) |\n| **Harmony** | Using a limited colour palette creates a unified, cohesive artwork |\n\n### The Role of the Artist in Society\n\nBy creating art about heritage buildings, you are acting as a **visual storyteller** — an artist who helps preserve and celebrate South Africa\'s history through visual images.\n\nArtists play many roles in society:\n\n| Role | Description |\n|------|-------------|\n| **Storyteller** | Shares stories and histories through art |\n| **Preserver** | Keeps traditions and memories alive |\n| **Observer** | Records what they see in the world |\n| **Commentator** | Raises awareness about social issues |\n| **Beautifier** | Makes public spaces more attractive |'),
  q(7, 'An artist who creates artworks about heritage buildings is acting as a:',
    ['Visual storyteller and preserver', 'Architect', 'Builder', 'Photographer only'], 0,
    'Creating art about heritage buildings preserves and celebrates history visually. The artist acts as both a storyteller (sharing the building\'s story) and a preserver (keeping its memory alive).'),
  fb(8, 'Using a limited colour ___ (3-5 colours) creates a unified, cohesive artwork. An artist who keeps traditions and memories alive through art is a cultural ___.',
    ['palette', 'preserver'],
    'A limited palette creates harmony. Cultural preservers use art to keep traditions alive for future generations.'),
  t(9, '### Symbolic Language in Art\n\nArtists use **symbols** — visual images that represent ideas or deeper meanings.\n\n**Common symbols in art:**\n\n| Symbol | Common Meaning |\n|--------|----------------|\n| **House / building** | Shelter, safety, belonging, home |\n| **Bridge** | Connection, overcoming obstacles |\n| **Door** | Opportunity, welcome, entering something new |\n| **Window** | Vision, insight, looking out at the world |\n| **Tree** | Growth, life, roots, family |\n| **Sun** | Hope, new beginnings, warmth |\n| **Broken wall** | Division, destruction, loss |\n| **Open road** | Journey, freedom, possibilities |\n\n**Using symbols in your collage:**\nYou can add symbolic meaning to your heritage buildings collage. For example:\n- An **open door** could symbolise welcome and inclusivity\n- A **broken wall** could represent the destruction of District Six\n- A **bridge** connecting buildings could symbolise unity between communities\n- **Bright colours** could celebrate the living heritage of Ndebele homesteads'),
  q(10, 'In art, an open door is often a symbol of:',
    ['Welcome and opportunity', 'Danger and fear', 'Boredom', 'Sadness'], 0,
    'An open door symbolises welcome, opportunity, and the invitation to enter something new. Artists use it to convey openness and inclusivity.'),
  t(11, '### Assessment: Term 3\n\nTerm 3 has two practical assessments:\n\n**3D Artwork — Building or craftwork (25 marks):**\n- Create a 3D model using construction techniques (cutting, pasting, wrapping, tying, modelling)\n- Apply art elements (shape/form, colour, texture, line)\n- Apply design principles (proportion, emphasis, contrast, balance)\n- Demonstrate good craftsmanship\n- Show evidence of planning (sketches)\n\n**2D Artwork — Paper-cut collage of buildings as heritage (25 marks):**\n- Create a collage depicting heritage buildings\n- Use effective cutting and layering techniques\n- Apply art elements and design principles\n- Use monochromatic or limited colour palette\n- Demonstrate understanding of buildings as heritage\n\n**Visual literacy component:**\n- Identify art elements and design principles in examples of local craft\n- Research and describe artworks by local artists or crafters\n- Use correct art terminology in written and verbal descriptions'),
  q(12, 'A monochromatic colour scheme uses:',
    ['One colour in different tints, shades, and tones', 'All the colours of the rainbow', 'Only black and white', 'Only complementary colours'], 0,
    'Monochromatic means "one colour." A monochromatic colour scheme uses a single hue in various tints (lighter), shades (darker), and tones (duller) for a harmonious, unified look.'),
];

// ===============================================================================
// CHAPTER 10: Drawing Life — The Human Figure (Term 4)
// ===============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Drawing Life: The Human Figure\n\nIn Term 4, you will learn to draw the **human figure** — one of the most exciting and challenging subjects in art. You will draw people who are **stationary** (still) and **in motion** (moving).\n\n### Why Draw the Human Figure?\n\nThe human body is the subject that viewers connect with most strongly. Learning to draw figures helps you:\n- Develop sharp observation skills\n- Understand proportion (how parts relate in size)\n- Capture movement and expression\n- Tell stories with your art\n\n### Basic Body Proportions\n\nThe human body can be measured in **head lengths** — using the head as a unit of measurement:\n\n| Body Part | Approximate Position |\n|-----------|---------------------|\n| **Head** | 1 head length from the top |\n| **Shoulders** | About 1.5 head lengths from the top |\n| **Elbows and waist** | About 3 head lengths from the top |\n| **Hips and wrists** | About 4 head lengths (halfway point) |\n| **Fingertips** | About 5 head lengths from the top |\n| **Knees** | About 6 head lengths from the top |\n| **Feet** | About 7-8 head lengths (total height) |\n\n**Important proportion facts:**\n- The average body is **7-8 head lengths** tall\n- The **halfway point** of the body is at the hips (not the waist)\n- **Arms** hang down to mid-thigh when relaxed\n- The **foot** is about the same length as the forearm'),
  q(2, 'The average adult human body is approximately how many head lengths tall?',
    ['7-8 head lengths', '3-4 head lengths', '10-12 head lengths', '5 head lengths'], 0,
    'The average adult body measures about 7-8 head lengths from the top of the head to the soles of the feet. This is a key proportional guideline for figure drawing.'),
  fb(3, 'The halfway point of the human body is at the ___, not the waist. When arms hang relaxed at the sides, the fingertips reach approximately to ___.',
    ['hips', 'mid-thigh'],
    'Many people mistakenly think the waist is the halfway point, but it is actually the hips. Fingertips reach to about mid-thigh when arms hang naturally.'),
  t(4, '### Drawing the Figure Step by Step\n\n**Step 1: Gesture drawing (30 seconds - 2 minutes)**\nCapture the overall pose — the direction and movement of the body — using quick, loose lines. Do not worry about details.\n\n**Step 2: Basic shapes**\nBuild the body using simple shapes:\n- **Oval** for the head\n- **Rectangle or trapezoid** for the torso\n- **Cylinders** for arms and legs\n- **Circles** for joints (shoulders, elbows, knees)\n- **Triangles** for hands and feet (simplified)\n\n**Step 3: Refine the outline**\nConnect the shapes with smooth contour lines to create a natural body shape.\n\n**Step 4: Add clothing and details**\nDraw clothing over the body shape. Clothing follows the form of the body underneath.\n\n**Step 5: Add tone**\nUse shading to show light and shadow on the figure.\n\n### Drawing a Model Draped in Fabric\n\nIn your Term 4 project, you will draw a figure draped in a **shawl, sheet, or blanket**. This combines your figure drawing skills with the tonal and texture skills you have developed.\n\nWhen drawing draped fabric on a figure:\n- Notice where the fabric pulls tight across the body\n- Observe where it hangs in loose folds\n- Shade the folds carefully (light on the ridges, dark in the valleys)'),
  q(5, 'A gesture drawing should take approximately:',
    ['30 seconds to 2 minutes', '30 minutes to 1 hour', '5 to 10 hours', 'Less than 5 seconds'], 0,
    'Gesture drawings are very quick (30 seconds to 2 minutes). They capture the overall pose, movement, and energy of the figure, not details.'),
  t(6, '### Drawing Figures in Motion\n\nDrawing a moving figure is more challenging than drawing a still one. Here are key tips:\n\n**How the body moves:**\n\n| Movement | What the Body Does |\n|----------|--------------------|\n| **Walking** | Arms swing opposite to legs; body leans slightly forward |\n| **Running** | More extreme arm and leg positions; body leans forward more |\n| **Bending** | The spine curves; one side compresses, the other stretches |\n| **Reaching** | One arm extends; the torso stretches on that side |\n| **Sitting** | The body folds at the hips and knees; the spine may curve |\n\n**The line of action:**\nEvery pose has an imaginary **line of action** — a single curved line that captures the main direction and energy of the pose. Always start your figure drawing with this line.\n\n| Pose | Line of Action |\n|------|----------------|\n| Standing straight | Vertical |\n| Leaning | Diagonal |\n| Running | Strong diagonal, leaning forward |\n| Dancing | Curved, flowing, dynamic |\n| Sitting | Angled, bent |\n\n**Practice exercise:**\nAsk a classmate to hold a pose for 2 minutes. Draw the line of action first, then build the figure using basic shapes. Repeat with 5-10 different poses.'),
  q(7, 'The imaginary line that captures the main direction and energy of a pose is called the:',
    ['Line of action', 'Contour line', 'Horizon line', 'Diagonal line'], 0,
    'The line of action is a single flowing line that captures the overall direction, movement, and energy of a figure\'s pose. It is always the first mark you make.'),
  fb(8, 'When a person walks, their arms swing ___ to their legs. Every pose has an imaginary line of ___ that captures its main direction and energy.',
    ['opposite', 'action'],
    'Arms and legs swing in opposition during walking (right arm with left leg). The line of action is the first mark you draw to capture a pose\'s energy.'),
  t(9, '### Art Elements in Figure Drawing\n\n| Element | Application |\n|---------|------------|\n| **Line** | Contour lines define the figure; thick lines for near edges, thin for far edges |\n| **Shape** | The body is built from basic shapes (ovals, cylinders, rectangles) |\n| **Tone** | Shading creates the illusion of 3D form — observe highlights and shadows |\n| **Texture** | Show the difference between skin, hair, and fabric |\n| **Space** | Consider the negative space around the figure; it defines the pose |\n\n### Design Principles in Figure Drawing\n\n| Principle | Application |\n|-----------|------------|\n| **Proportion** | Correct size relationships between body parts |\n| **Balance** | The figure must look like it could stand/sit without falling |\n| **Emphasis** | The face or hands often become the focal point |\n| **Contrast** | Use tonal contrast to define form — light against dark |\n| **Direction** | The line of action creates a sense of direction and movement |\n\n**Common mistakes to avoid:**\n- Drawing the head too large (the most common error)\n- Making arms too short\n- Forgetting that the body has thickness (it is not flat)\n- Drawing stiff, lifeless poses (use the line of action to add energy)\n- Placing eyes too high on the head (eyes are at the midpoint of the head)'),
  q(10, 'The most common mistake in figure drawing is:',
    ['Drawing the head too large', 'Drawing the feet too large', 'Making the arms too long', 'Drawing the body too thin'], 0,
    'Drawing the head too large is the most common figure drawing error. This makes the body look too short. Using the head-length measuring system helps avoid this.'),
  t(11, '### Materials for Figure Drawing\n\nDifferent materials create different effects in figure drawing:\n\n| Material | Effect | Best For |\n|----------|--------|----------|\n| **Pencil (2B-6B)** | Fine to broad marks, full tonal range | Detailed studies, tonal drawing |\n| **Charcoal** | Bold, expressive, easy to blend | Gesture drawings, dramatic tonal studies |\n| **Wax crayons** | Bold colour, resistant to water | Quick colour studies |\n| **Pencil crayons** | Controlled colour, blendable | Careful colour rendering |\n\n**Paper sizes and formats:**\n- **A4** — good for quick gesture drawings and studies\n- **A3** — good for detailed figure drawings\n- **A1** — for large, expressive drawings (whole-body gestures)\n\nExperimenting with different paper sizes encourages different drawing approaches. Large paper requires big, confident arm movements. Small paper focuses attention on essential shapes.'),
  q(12, 'Which drawing material is best for quick, expressive gesture drawings?',
    ['Charcoal', 'Fine-tip pen', 'Ruler and compass', 'Coloured pencils'], 0,
    'Charcoal is ideal for gesture drawing because it makes bold, expressive marks quickly and is easy to smudge and blend. Its broad marks capture movement and energy.'),
];

// ===============================================================================
// CHAPTER 11: Create in 3D — Metamorphosis of Recyclable Objects (Term 4)
// ===============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Metamorphosis: Transforming Recyclable Objects into Art\n\nIn Term 4, you also create a **3D artwork** by transforming a common recyclable object into something new and unexpected. This process is called **metamorphosis** — a complete change of form.\n\n### What is Metamorphosis in Art?\n\nIn nature, metamorphosis means a transformation (like a caterpillar becoming a butterfly). In art, metamorphosis means **transforming an ordinary object into something it was never meant to be**.\n\nExamples:\n- A plastic bottle becomes a flower vase\n- Tin cans become musical instruments\n- Old shoes become plant pots\n- Wire becomes animal sculptures\n- Newspaper becomes papier-mache masks\n\n### Why Use Recyclable Materials?\n\n| Reason | Explanation |\n|--------|------------|\n| **Environmental** | Reduces waste and keeps materials out of landfills |\n| **Creative** | Limitations inspire creative problem-solving |\n| **Accessible** | Recyclable materials are free and available to everyone |\n| **Cultural** | South Africa has a strong tradition of recycled art |\n| **Meaningful** | The transformation itself carries a message about value and potential |\n\n### South African Recycled Art Traditions\n\nSouth African artists have a rich history of creating art from found and recycled materials:\n- **Wire art** — artists in townships create intricate animal and vehicle models from telephone wire\n- **Tin can art** — toys, containers, and decorative objects made from recycled tins\n- **Willie Bester** — a famous South African artist who creates powerful assemblage sculptures from scrap metal and found objects to comment on poverty and inequality\n- **Mbongeni Buthelezi** — creates paintings by melting recycled plastic strips onto canvas'),
  q(2, 'Metamorphosis in art means:',
    ['Transforming an ordinary object into something it was never meant to be', 'Copying an existing artwork', 'Drawing from memory', 'Using only brand-new materials'], 0,
    'Metamorphosis means transformation. In art, it refers to changing an everyday object into something unexpected and creative — giving it a new identity and purpose.'),
  fb(3, 'South African township artists create intricate models from recycled telephone ___. Willie Bester creates assemblage sculptures from scrap ___ and found objects.',
    ['wire', 'metal'],
    'Wire art is a distinctive South African township craft tradition. Willie Bester uses scrap metal and found objects to make powerful social commentary sculptures.'),
  t(4, '### Planning Your Metamorphosis Project\n\n**Step 1: Choose your recyclable object**\nSelect a common recyclable item:\n- Plastic bottle or container\n- Cardboard box or tube\n- Tin can\n- Old newspaper or magazines\n- Egg carton\n- Yoghurt tub\n\n**Step 2: Brainstorm transformation ideas**\nAsk yourself: What else could this object become?\n- Think about the shape — what does it remind you of?\n- Turn it upside down, sideways, and at angles\n- Combine two or more recyclable objects\n- Create at least 5 different ideas in your sketchbook\n\n**Step 3: Design your final artwork**\n- Create detailed sketches from front, side, and top views\n- Plan what additional materials you will need\n- Decide on colours and surface decoration\n- Consider how the artwork relates to the Marionette of the figure (connecting to your life drawing theme)\n\n**Step 4: Construct**\n- Build the basic form first\n- Add surface detail and decoration\n- Paint or colour the surface\n- Ensure good craftsmanship throughout'),
  q(5, 'When brainstorming ideas for metamorphosis, a good strategy is to:',
    ['Turn the object upside down and sideways to see new possibilities', 'Use the object exactly as it is without changing anything', 'Only think of one idea', 'Copy someone else\'s design'], 0,
    'Looking at an object from unusual angles helps you see new possibilities. Turning it upside down or sideways can spark creative ideas for transformation.'),
  t(6, '### Applying Art Elements to Your 3D Metamorphosis\n\n| Element | Application |\n|---------|------------|\n| **Shape/Form** | Transform the shape of the original object into a new form |\n| **Line** | Add decorative lines, edges, and details |\n| **Colour** | Paint or cover the object to disguise its original identity |\n| **Texture** | Add actual texture through wrapping, pasting, modelling |\n| **Space** | Consider enclosed space (inside the object) and the space it occupies |\n\n### Applying Design Principles to Your 3D Metamorphosis\n\n| Principle | Application |\n|-----------|------------|\n| **Balance** | Ensure physical stability — it must stand on its own |\n| **Contrast** | Combine different textures and colours |\n| **Emphasis** | Create a focal point through colour or decoration |\n| **Harmony** | All parts should look like they belong together |\n| **Proportion** | Parts should relate correctly in size |\n\n### Concern for the Environment\n\nUsing recyclable materials in art teaches important values:\n- **Reduce** — use fewer new materials\n- **Reuse** — give old objects a new life\n- **Recycle** — transform waste into something valuable\n- **Respect** — care for the environment and share resources\n- **Responsibility** — each person can make a difference'),
  q(7, 'When transforming a recyclable object, painting or covering it serves to:',
    ['Disguise its original identity and create a new appearance', 'Make it heavier', 'Prevent it from being recycled', 'Show that it is a bottle or can'], 0,
    'Painting or covering the object hides its original identity, helping complete the metamorphosis from ordinary recyclable item to artwork.'),
  fb(8, 'The three R\'s of environmental responsibility are reduce, reuse, and ___. A 3D artwork must have physical ___ so that it can stand on its own.',
    ['recycle', 'stability'],
    'Reduce, reuse, and recycle are the three R\'s of environmental responsibility. Physical stability (balance) is essential — a 3D artwork must stand independently.'),
  t(9, '### Spatial Awareness in 3D Work\n\nWorking in three dimensions requires **spatial awareness** — understanding how your artwork looks from every angle.\n\n**Checklist for your 3D metamorphosis artwork:**\n\n| Check | Question |\n|-------|----------|\n| **Front view** | Does it look interesting from the front? |\n| **Back view** | Is the back finished and not bare? |\n| **Side views** | Do the sides contribute to the overall form? |\n| **Top view** | Is the top considered (if visible)? |\n| **Stability** | Does it stand firmly without falling? |\n| **Scale** | Is it an appropriate size for the intended purpose? |\n| **Surface** | Is the entire surface decorated consistently? |\n| **Quality** | Is the craftsmanship neat and careful? |\n\n### Sharing Resources\n\nIn the art classroom, we share materials and tools. This teaches important social values:\n- **Sharing** — making sure everyone has what they need\n- **Respect** — treating other people\'s materials and artwork with care\n- **Cooperation** — working together and helping each other\n- **Responsibility** — cleaning up after yourself and returning shared tools'),
  q(10, 'Spatial awareness in 3D art means:',
    ['Understanding how your artwork looks from every angle', 'Only considering the front view', 'Making the artwork as flat as possible', 'Working with your eyes closed'], 0,
    'Spatial awareness means considering your 3D artwork from all viewpoints — front, back, sides, and top. A successful 3D work looks complete and intentional from every angle.'),
  t(11, '### Assessment: Term 4\n\n**Practical assessment — 2D artwork: Life drawing (25 marks)**\n- Draw a figure from observation (stationary or in motion)\n- May include a draped model (shawl/blanket)\n- Demonstrate correct body proportions\n- Apply art elements (line, tone, texture, shape)\n- Apply design principles (proportion, balance, emphasis, contrast, direction)\n\n**Practical assessment — 3D artwork: Metamorphosis (25 marks)**\n- Transform a recyclable object into a creative artwork\n- Apply art elements and design principles to the 3D form\n- Demonstrate good craftsmanship (cutting, modelling, wrapping, tying, stitching, joining, scoring)\n- Show concern for the environment through use of recyclable materials\n- Evidence of planning and spatial awareness\n\n**Written test (25 marks):**\n- Terminology, art elements, design principles\n- Symbolic language in art\n- The role of the artist in society\n- Visual literacy skills\n- Reflection on personal artwork'),
  q(12, 'In the Term 4 practical exam, the 2D artwork requires you to draw:',
    ['A human figure from observation', 'A still life of fruit', 'A landscape', 'An abstract pattern'], 0,
    'The Term 4 2D practical focuses on life drawing — observing and drawing the human figure, either stationary or in motion, possibly draped in fabric.'),
];

// ===============================================================================
// CHAPTER 12: The Role of the Artist and Revision (Term 4)
// ===============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## The Role of the Artist in Society\n\nThroughout the year, you have explored how artists contribute to South African society. Let us bring together everything you have learned.\n\n### Artists as Contributors to Society\n\n| Role | Description | South African Example |\n|------|-------------|----------------------|\n| **Beautifier** | Makes spaces more attractive and uplifting | Esther Mahlangu painting Ndebele murals on public buildings |\n| **Storyteller** | Shares stories and histories through visual images | San rock art recording daily life and spiritual experiences |\n| **Cultural preserver** | Keeps traditions alive for future generations | Zulu beadwork artists passing skills from mother to daughter |\n| **Observer** | Records what happens in society | Gerard Sekoto painting everyday life in Sophiatown |\n| **Social commentator** | Raises awareness about important issues | William Kentridge addressing inequality through charcoal drawings |\n| **Educator** | Teaches visual literacy and art skills | Art teachers, community workshop leaders |\n| **Entrepreneur** | Creates livelihoods through craft and design | Township wire artists selling their work at markets |\n\n### The Arts as Heritage\n\nThe arts are an important part of South Africa\'s cultural heritage. When artists practise traditional techniques — Ndebele painting, Zulu beadwork, Venda pottery — they keep these ancient skills alive. This is called **intangible cultural heritage** — skills and knowledge passed from one generation to the next.'),
  q(2, 'An artist who records what happens in society through their artwork is acting as a/an:',
    ['Observer', 'Beautifier', 'Entrepreneur', 'Educator'], 0,
    'An observer artist watches and records society through their work. Gerard Sekoto observed and painted the daily life of people in Sophiatown and District Six.'),
  fb(3, 'Skills and knowledge passed from one generation to the next are called ___ cultural heritage. Gerard Sekoto is known for painting everyday life in ___.',
    ['intangible', 'Sophiatown'],
    'Intangible cultural heritage includes traditional skills like Ndebele painting and Zulu beadwork. Sekoto documented life in Sophiatown before its forced removal.'),
  t(4, '### Communication Skills in Art\n\nVisual art is a form of communication. Throughout Grade 7, you have developed these communication skills:\n\n| Skill | What It Means |\n|-------|---------------|\n| **Express** | Sharing your own ideas, feelings, and experiences through art |\n| **Identify/name** | Recognising and naming art elements and principles correctly |\n| **Question** | Asking thoughtful questions about artworks and art-making |\n| **Reflect** | Thinking deeply about your own artwork and artistic choices |\n| **Looking** | Observing carefully — seeing details that others miss |\n| **Talking** | Discussing art with others using correct terminology |\n| **Listening** | Hearing and considering other people\'s ideas about art |\n| **Writing** | Writing descriptions and analyses of artworks |\n\n### Using Correct Art Terminology\n\nWhen you write or talk about art, use the correct words:\n\n| Instead of... | Say... |\n|--------------|--------|\n| "Nice colours" | "Warm analogous colours create a harmonious mood" |\n| "It looks real" | "The artist used a full tonal range to create the illusion of three-dimensional form" |\n| "I like the lines" | "The bold contour lines and expressive line quality create energy and movement" |\n| "It is pretty" | "The symmetrical balance and vibrant complementary colours create visual impact" |'),
  q(5, 'Which phrase uses correct art terminology?',
    ['"The artist used complementary colours to create strong contrast"', '"The picture has nice colours"', '"I like the drawing"', '"It looks good"'], 0,
    'Using specific art terminology — "complementary colours" and "contrast" — shows understanding. Vague words like "nice" and "good" do not demonstrate knowledge.'),
  t(6, '### Careers in Visual Art and Design\n\nStudying Creative Arts opens doors to many career paths:\n\n| Career | What You Do |\n|--------|------------|\n| **Graphic designer** | Designs logos, posters, websites, and digital media |\n| **Fine artist** | Creates paintings, sculptures, and installations |\n| **Fashion designer** | Designs clothing and accessories |\n| **Architect** | Designs buildings and public spaces |\n| **Interior designer** | Plans and decorates rooms and indoor spaces |\n| **Illustrator** | Creates images for books, magazines, and apps |\n| **Art teacher** | Teaches art at schools and community centres |\n| **Photographer** | Captures images for artistic or commercial purposes |\n| **Animator** | Creates animated films, games, and digital content |\n| **Ceramic artist** | Makes pottery and ceramic artworks |\n| **Jewellery designer** | Designs and makes jewellery |\n\n**Skills from Creative Arts that help in any career:**\n- Creative problem-solving\n- Observation and attention to detail\n- Visual communication\n- Planning and project management\n- Self-discipline and perseverance'),
  q(7, 'Which career involves designing logos, posters, and websites?',
    ['Graphic designer', 'Architect', 'Ceramic artist', 'Fine artist'], 0,
    'Graphic designers create visual communications — logos, posters, websites, social media graphics, packaging, and more.'),
  fb(8, 'An ___ designs buildings and public spaces. Skills developed in Creative Arts include creative ___, which helps in many careers.',
    ['architect', 'problem-solving'],
    'Architects design the built environment. Creative problem-solving — the ability to find innovative solutions — is a core Creative Arts skill valued across all careers.'),
  t(9, '### Revision: Elements of Art\n\n| Element | Key Points |\n|---------|------------|\n| **Line** | Types: horizontal (calm), vertical (strength), diagonal (movement), curved (grace), zigzag (excitement). Quality: thick, thin, broken, smooth, rough |\n| **Shape** | Geometric (circle, square, triangle) vs organic (leaf, cloud). Positive = subject; negative = space around |\n| **Colour** | Primary (R, Y, B), secondary (O, G, V), tertiary. Complementary = opposite on wheel. Warm = energetic; cool = calm. Tint = +white; shade = +black |\n| **Texture** | Actual (can be felt) vs visual (appears textured). Techniques: hatching, cross-hatching, stippling, scumbling, rubbing |\n| **Tone** | Lightness/darkness. Highlight → mid-tone → shadow → cast shadow. Use a range of 5-7 values. Pencil grades: H = hard/light, B = soft/dark |\n| **Space** | Positive (occupied) and negative (empty). Foreground, middle ground, background. Depth through overlapping, size, and placement |'),
  q(10, 'Hatching, cross-hatching, stippling, and scumbling are all techniques for creating:',
    ['Visual texture and tone', 'Three-dimensional sculpture', 'Collage effects', 'Colour mixing'], 0,
    'Hatching (parallel lines), cross-hatching (overlapping lines), stippling (dots), and scumbling (circular marks) are all techniques for creating visual texture and tonal values.'),
  t(11, '### Revision: Principles of Design\n\n| Principle | Key Points |\n|-----------|------------|\n| **Balance** | Symmetrical (mirror image), asymmetrical (different but equal), radial (from centre). SA example: Ndebele symmetrical patterns |\n| **Contrast** | Differences create interest: light/dark, big/small, rough/smooth, warm/cool. SA example: black outlines on bright Ndebele colours |\n| **Emphasis** | Focal point — created through contrast, size, colour, placement, or leading lines. Rule of thirds for placement |\n| **Pattern** | A motif repeated regularly. SA examples: Zulu beadwork, Shweshwe fabric, Ndebele wall art |\n| **Proportion** | Size relationships — realistic, exaggerated, or hierarchical (most important = largest). Body proportions: 7-8 head lengths |\n\n### Exam Tips\n\n1. **Know your art terminology** — use correct words for elements and principles\n2. **Know South African artists** — Esther Mahlangu, William Kentridge, Gerard Sekoto, Irma Stern, Willie Bester\n3. **Know SA art traditions** — San rock art, Ndebele painting, Zulu beadwork, Shweshwe, Venda pottery\n4. **Practise describing artworks** — use the four steps: identify, describe, analyse, interpret\n5. **Understand symbols** — know common symbols and their meanings\n6. **Review colour theory** — colour wheel, complementary, warm/cool, tints and shades'),
  q(12, 'Which South African artist is known for creating art from scrap metal and found objects?',
    ['Willie Bester', 'Esther Mahlangu', 'Irma Stern', 'Gerard Sekoto'], 0,
    'Willie Bester creates powerful assemblage sculptures from scrap metal and found objects. His work comments on poverty, displacement, and the legacy of apartheid.'),
];

// ===============================================================================
// MAIN — insert into MongoDB
// ===============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 7
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 7/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 7:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 7', schoolId: SCHOOL_ID, orderIndex: 7,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 7:', String(GRADE_ID));
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
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Creative Arts subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Introduction to Visual Literacy',
      description: 'What visual literacy is, why it matters, South African art heritage (San rock art, Ndebele painting, Zulu beadwork), and the building blocks of art.',
      order: 1,
      lessons: [
        { title: 'Introduction to Visual Literacy', description: 'Visual literacy, visual communication, South African art heritage (San rock art, Ndebele, Zulu, Venda, Sotho), Esther Mahlangu, and the elements and principles overview.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: The Elements of Art — Line, Shape, and Space',
      description: 'Line types and quality, geometric and organic shapes, positive and negative space, creating depth, and drawing from observation.',
      order: 2,
      lessons: [
        { title: 'Line, Shape, and Space', description: 'Line types (horizontal, vertical, diagonal, curved, zigzag), line quality, geometric and organic shapes, positive and negative space, creating depth, and observational drawing.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: The Elements of Art — Colour Theory',
      description: 'The colour wheel, primary/secondary/tertiary colours, warm and cool colours, complementary colours, tints, shades, and colour symbolism in South African art.',
      order: 3,
      lessons: [
        { title: 'Colour Theory', description: 'Colour wheel, mixing secondary colours, colour properties (hue, value, intensity), warm and cool colours, complementary colours, tints, shades, tonal range, and colour symbolism in Zulu beadwork and San rock art.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: The Elements of Art — Texture and Tone',
      description: 'Actual and visual texture, techniques for creating texture (hatching, stippling, rubbing), tonal scale, pencil grades, and shading techniques.',
      order: 4,
      lessons: [
        { title: 'Texture and Tone', description: 'Actual vs visual texture, texture techniques (hatching, cross-hatching, stippling, scumbling, rubbing), tonal scale, creating 3D effects with tone, pencil grades, and texture in SA art (Kentridge, Zulu baskets, Venda pottery).', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Principles of Design — Balance, Contrast, and Emphasis',
      description: 'Balance (symmetrical, asymmetrical, radial), contrast, emphasis and focal point, rule of thirds, pattern, and proportion in South African art.',
      order: 5,
      lessons: [
        { title: 'Balance, Contrast, and Emphasis', description: 'Types of balance, contrast types, emphasis and focal point, rule of thirds, pattern in SA traditions, proportion (realistic, exaggerated, hierarchical), and practical application.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Still Life Drawing and Painting',
      description: 'Setting up and drawing a still life from observation, colour mixing, painting techniques, and simple etching (sgraffito).',
      order: 6,
      lessons: [
        { title: 'Still Life Drawing and Painting', description: 'What is a still life, setting up a composition, art elements in still life, painting step by step, colour mixing (tonal range), simple etching (sgraffito), and media exploration.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Design Principles in 2D Art',
      description: 'Deepening understanding of contrast, proportion, and emphasis in still life; visual literacy and describing artworks; South African still life artists.',
      order: 7,
      lessons: [
        { title: 'Contrast, Proportion, and Emphasis in 2D', description: 'Complementary colour contrast, proportion techniques, emphasis in composition, visual literacy framework (identify, describe, analyse, interpret), SA artists (Irma Stern, Maggie Laubser), and Term 2 assessment preparation.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Create in 3D — Buildings and Craftwork',
      description: 'Three-dimensional art, architecture as art, South African building traditions, 3D construction techniques, craftsmanship, and surface decoration.',
      order: 8,
      lessons: [
        { title: 'Buildings and Craftwork in 3D', description: '2D vs 3D art, SA architecture (Ndebele, Zulu, Cape Dutch), art elements in 3D, construction techniques (cutting, folding, pasting, wrapping, tying, stitching, modelling), craftsmanship, and surface decoration.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Paper-Cut Collage — Buildings as Heritage',
      description: 'Creating paper-cut collage artworks depicting heritage buildings, collage techniques, symbolic language in art, and the role of the artist in society.',
      order: 9,
      lessons: [
        { title: 'Paper-Cut Collage: Buildings as Heritage', description: 'Collage technique, SA heritage buildings (Castle of Good Hope, Union Buildings, Constitutional Court), cutting and layering, art elements in collage, symbolic language, and the role of the artist.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Drawing Life — The Human Figure',
      description: 'Human body proportions, gesture drawing, drawing the figure step by step, figures in motion, line of action, and materials for figure drawing.',
      order: 10,
      lessons: [
        { title: 'Drawing Life: The Human Figure', description: 'Body proportions (head lengths), gesture drawing, building the figure with basic shapes, drawing draped figures, figures in motion, line of action, art elements in figure drawing, and drawing materials.', blocks: ch10_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 11: Metamorphosis — Transforming Recyclable Objects',
      description: 'Creating 3D artworks by transforming recyclable materials, South African recycled art traditions, environmental responsibility, and spatial awareness.',
      order: 11,
      lessons: [
        { title: 'Metamorphosis of Recyclable Objects', description: 'Metamorphosis concept, recyclable materials in art, SA recycled art traditions (wire art, Willie Bester, Mbongeni Buthelezi), planning and constructing, art elements and principles in 3D, spatial awareness, and environmental values.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: The Role of the Artist and Revision',
      description: 'The artist as contributor to society, communication skills in art, careers in visual art, and comprehensive revision of all Grade 7 topics.',
      order: 12,
      lessons: [
        { title: 'The Role of the Artist and Revision', description: 'Artists as contributors (beautifier, storyteller, preserver, observer, commentator), intangible cultural heritage, communication skills, correct art terminology, careers in visual art, and full revision of elements, principles, and SA artists.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 7 Creative Arts \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Visual Literacy, Elements of Art (line, shape, colour, texture, tone, space), Principles of Design (balance, contrast, emphasis, pattern, proportion), Colour Theory, Still Life Drawing and Painting, 3D Construction (Buildings and Craftwork), Paper-Cut Collage (Heritage), Life Drawing (Human Figure), Metamorphosis of Recyclable Objects, and Careers in Visual Art for the Grade 7 Creative Arts (Visual Art) curriculum.',
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
  console.log('  TEXTBOOK: Grade 7 Creative Arts');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
