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
// CHAPTER 1: Visual Literacy and the Elements of Art (Term 1)
// ===============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Visual Literacy and the Elements of Art\n\nVisual literacy is the ability to **read**, **interpret**, and **create** visual images. Just as you learn to read words, you must learn to read images. In Creative Arts, we study how artists use specific building blocks called the **elements of art** to communicate ideas, emotions, and messages.\n\n### The Seven Elements of Art\n\n| Element | Definition | Example |\n|---------|-----------|--------|\n| **Line** | A mark made by a moving point; can be straight, curved, thick, thin, diagonal, or implied | The bold outlines in Esther Mahlangu\'s Ndebele murals |\n| **Shape** | A flat, enclosed area defined by line, colour, or value; can be geometric or organic | Geometric patterns in traditional African beadwork |\n| **Colour** | Produced when light strikes an object and reflects back to the eye; has hue, value, and intensity | The warm ochres and earth tones in San rock art |\n| **Texture** | The surface quality of an object — how it feels (actual) or appears to feel (implied/visual) | The rough, layered texture of William Kentridge\'s charcoal drawings |\n| **Tone (Value)** | The lightness or darkness of a colour; created by adding white (tint) or black (shade) | Tonal shading in a pencil portrait to show three-dimensional form |\n| **Space** | The area around, between, or within objects; includes positive space (subject) and negative space (background) | The use of negative space in Dumile Feni\'s sculptures |\n| **Form** | A three-dimensional shape with height, width, and depth (e.g., sphere, cube, cylinder) | A clay pot shaped by a Venda potter |'),
  q(2, 'Which element of art refers to the lightness or darkness of a colour?',
    ['Tone (Value)', 'Texture', 'Form', 'Space'], 0,
    'Tone (also called value) describes how light or dark a colour is. Adding white creates a tint; adding black creates a shade.'),
  t(3, '### Line in Detail\n\nLine is the most basic element of art. Every drawing begins with a line.\n\n**Types of line:**\n\n| Line Type | Character / Mood |\n|-----------|------------------|\n| **Horizontal** | Calm, restful, stable (like the horizon) |\n| **Vertical** | Strength, dignity, height |\n| **Diagonal** | Movement, energy, tension |\n| **Curved** | Grace, softness, natural forms |\n| **Zigzag** | Excitement, confusion, nervousness |\n| **Thick / bold** | Strength, emphasis |\n| **Thin / fine** | Delicacy, detail |\n| **Implied** | Suggested by edges or the viewer\'s eye connecting points |\n\n**Line in South African art:**\n- **Esther Mahlangu** uses bold, straight lines in her Ndebele mural paintings, creating geometric patterns that carry cultural meaning\n- **William Kentridge** uses expressive, gestural charcoal lines that convey emotion and political commentary\n- **San rock art** features fine, detailed outlines of animals and human figures painted with natural pigments'),
  q(4, 'Horizontal lines in an artwork generally create a feeling of:',
    ['Calm and stability', 'Excitement and tension', 'Confusion and nervousness', 'Strength and height'], 0,
    'Horizontal lines echo the horizon and create feelings of calm, rest, and stability in a composition.'),
  fb(5, 'A ___ line creates a feeling of movement and energy. An ___ line is not physically drawn but is suggested by edges or the viewer\'s eye.',
    ['diagonal', 'implied'],
    'Diagonal lines convey movement and energy. Implied lines are suggested rather than physically drawn.'),
  t(6, '### Shape: Geometric and Organic\n\n**Geometric shapes** are regular, mathematical shapes such as circles, squares, triangles, and rectangles. They appear precise and orderly.\n\n**Organic shapes** (also called free-form or biomorphic shapes) are irregular and often found in nature — think of leaves, clouds, or pebbles.\n\n**Shape in South African art:**\n- **Ndebele house painting** features bold geometric shapes — triangles, diamonds, and rectangles arranged in symmetrical patterns\n- **Zulu basket weaving** combines geometric shapes into complex, repeating patterns\n- The **Mapungubwe Gold Rhino** uses simplified organic forms to represent a rhinoceros, one of South Africa\'s most iconic archaeological artefacts\n\n### Positive and Negative Shape\n\n- **Positive shape**: The main subject or figure in the artwork\n- **Negative shape**: The space around and between the subject(s)\n\nSkilled artists consider both positive and negative shapes to create balanced, visually interesting compositions.'),
  q(7, 'Which of the following is an example of an organic shape?',
    ['A leaf', 'A square', 'A triangle', 'A rectangle'], 0,
    'A leaf is an organic (free-form) shape because it has an irregular, natural outline. Squares, triangles, and rectangles are geometric shapes.'),
  t(8, '### Colour Theory\n\nColour is one of the most expressive elements of art.\n\n**The Colour Wheel:**\n\n| Category | Colours | Role |\n|----------|---------|------|\n| **Primary colours** | Red, Yellow, Blue | Cannot be mixed from other colours |\n| **Secondary colours** | Orange, Green, Violet | Made by mixing two primary colours |\n| **Tertiary colours** | Red-orange, Yellow-green, Blue-violet, etc. | Made by mixing a primary and an adjacent secondary |\n\n**Colour Properties:**\n\n| Property | Meaning |\n|----------|--------|\n| **Hue** | The name of the colour (red, blue, etc.) |\n| **Value** | How light or dark the colour is |\n| **Intensity (saturation)** | How bright or dull the colour is |\n\n**Colour relationships:**\n- **Complementary colours** are opposite each other on the colour wheel (e.g., red and green) — they create strong contrast\n- **Analogous colours** are next to each other on the colour wheel (e.g., blue, blue-green, green) — they create harmony\n- **Warm colours** (red, orange, yellow) advance and feel energetic\n- **Cool colours** (blue, green, violet) recede and feel calming'),
  q(9, 'Which pair of colours are complementary?',
    ['Red and green', 'Red and orange', 'Blue and green', 'Yellow and orange'], 0,
    'Red and green are complementary colours because they sit directly opposite each other on the colour wheel.',
    ['Complementary colours are found opposite each other on the colour wheel.']),
  fb(10, 'The three primary colours are red, yellow, and ___. Colours that sit next to each other on the colour wheel are called ___ colours.',
    ['blue', 'analogous'],
    'The primary colours are red, yellow, and blue. Analogous colours are neighbours on the colour wheel and create harmony.'),
  t(11, '### Texture and Tone\n\n**Texture** can be:\n- **Actual (tactile)**: You can physically feel it (e.g., the rough surface of a clay sculpture)\n- **Visual (implied)**: Created through drawing or painting techniques to look like a texture (e.g., cross-hatching to suggest rough bark)\n\n**Techniques for creating texture in 2D:**\n- Stippling (dots), cross-hatching (overlapping lines), scumbling (scribbled marks), blending, collage\n\n**Tone (Value)** is essential for creating the illusion of three-dimensional form on a flat surface.\n\n**Tonal scale:** A gradation from white through grey to black.\n\n| Tonal Term | Meaning |\n|------------|--------|\n| **Highlight** | Lightest area where light hits the object directly |\n| **Mid-tone** | Areas of medium lightness |\n| **Shadow** | Darkest area, farthest from the light source |\n| **Cast shadow** | Shadow thrown by the object onto a nearby surface |\n| **Reflected light** | Subtle light bouncing back onto the shadow side from a nearby surface |'),
  q(12, 'What is the difference between actual texture and visual texture?',
    ['Actual texture can be physically felt; visual texture only appears to have a surface quality', 'Visual texture is rougher than actual texture', 'Actual texture is only found in paintings', 'There is no difference between them'], 0,
    'Actual (tactile) texture is physically present and can be felt by touch. Visual (implied) texture is created by artistic techniques to make a surface appear textured.'),
];

// ===============================================================================
// CHAPTER 2: Principles of Design (Term 1)
// ===============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Principles of Design\n\nWhile the **elements of art** are the building blocks, the **principles of design** are the rules or guidelines for arranging those elements effectively. Think of the elements as ingredients and the principles as the recipe.\n\n### The Seven Principles of Design\n\n| Principle | Definition |\n|-----------|------------|\n| **Balance** | The visual distribution of weight in a composition |\n| **Contrast** | Using differences to create visual interest (light vs dark, big vs small) |\n| **Emphasis** | Making one part of the artwork stand out as the focal point |\n| **Pattern** | A repeating element or motif |\n| **Rhythm** | Creating a sense of movement through repetition of elements |\n| **Unity (Harmony)** | All parts of the artwork work together as a whole |\n| **Proportion** | The size relationship between different parts of the artwork |'),
  q(2, 'What is the difference between the elements of art and the principles of design?',
    ['Elements are the building blocks; principles are the guidelines for arranging them', 'Elements are modern; principles are traditional', 'Elements are for painting only; principles are for sculpture', 'There is no difference'], 0,
    'The elements of art (line, shape, colour, etc.) are the basic components. The principles of design (balance, contrast, etc.) tell artists how to arrange those elements effectively.'),
  t(3, '### Balance\n\nBalance refers to how visual weight is distributed in a composition.\n\n**Types of balance:**\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Symmetrical (formal)** | Both sides are mirror images; creates stability and order | The symmetrical patterns in Ndebele house painting |\n| **Asymmetrical (informal)** | Sides are different but visually balanced; creates interest and energy | A large dark shape on one side balanced by several small light shapes on the other |\n| **Radial** | Elements radiate outward from a central point | A Zulu shield design radiating from the centre |\n\n**South African example:**\nEsther Mahlangu\'s Ndebele murals often use symmetrical balance, with identical geometric patterns on either side of a central axis. This reflects the cultural importance of order and harmony in Ndebele traditions.'),
  q(4, 'Radial balance means that elements:',
    ['Radiate outward from a central point', 'Are identical on both sides', 'Are arranged randomly', 'Are all the same size'], 0,
    'In radial balance, design elements spread outward from a central point, like the spokes of a wheel or a sunburst pattern.'),
  t(5, '### Contrast and Emphasis\n\n**Contrast** creates visual excitement by placing opposing elements together:\n- Light vs dark (tonal contrast)\n- Large vs small (scale contrast)\n- Rough vs smooth (textural contrast)\n- Warm vs cool (colour contrast)\n- Geometric vs organic (shape contrast)\n\n**Emphasis** (also called **focal point**) is the area of the artwork that draws the viewer\'s eye first. Artists create emphasis through:\n- Using a contrasting colour or tone\n- Placing the subject at a key position (e.g., rule of thirds)\n- Making the subject larger or more detailed than surrounding elements\n- Using converging lines that lead the eye to the focal point\n\n**South African example:**\nWilliam Kentridge creates strong tonal contrast in his charcoal drawings by placing bold, dark marks against white paper. The contrast draws the viewer\'s eye to key figures and scenes, creating powerful emphasis on the human condition under apartheid.'),
  fb(6, 'The area of an artwork that draws the viewer\'s eye first is called the ___. ___ is created by placing opposing elements together, such as light against dark.',
    ['focal point', 'Contrast'],
    'The focal point (emphasis) is where the eye is drawn first. Contrast involves using opposing qualities to create visual interest.'),
  t(7, '### Pattern and Rhythm\n\n**Pattern** is created when an element (motif) is repeated in a regular, predictable way.\n\n**Rhythm** is created when elements are repeated to suggest movement. Unlike pattern, rhythm can vary — it does not have to be perfectly regular.\n\n**Types of rhythm:**\n\n| Type | Description |\n|------|-------------|\n| **Regular rhythm** | The same element repeated at equal intervals (like a heartbeat) |\n| **Alternating rhythm** | Two or more elements repeated in a set sequence (ABABAB) |\n| **Progressive rhythm** | An element that gradually changes (getting bigger, changing colour) |\n| **Flowing rhythm** | Smooth, curving repetition suggesting natural movement (like waves) |\n| **Random rhythm** | Irregular repetition with no set pattern |\n\n**South African examples:**\n- **Zulu beadwork** uses complex patterns with cultural symbolism — different colour combinations communicate messages about identity, love, and social status\n- **Shweshwe fabric** (traditional South African cotton) features intricate, repeating geometric patterns\n- **Cape Dutch gable architecture** uses flowing rhythm in curved gable designs'),
  q(8, 'In alternating rhythm, elements are arranged in a:',
    ['Repeated sequence of two or more elements (e.g., ABABAB)', 'Single element repeated at equal intervals', 'Gradually changing progression', 'Completely random arrangement'], 0,
    'Alternating rhythm involves two or more elements repeated in a predictable sequence, such as ABABAB or ABCABC.'),
  t(9, '### Unity and Proportion\n\n**Unity (Harmony)** means all parts of the artwork feel like they belong together. An artwork has unity when:\n- Colours are harmonious (e.g., analogous colour scheme)\n- Elements are repeated throughout the composition\n- There is a consistent style or technique\n- The overall effect is cohesive, not chaotic\n\n**Proportion** refers to the size relationship between parts of the artwork, or between the artwork and reality.\n\n| Concept | Description |\n|---------|-------------|\n| **Realistic proportion** | Parts are sized as they appear in real life |\n| **Exaggerated proportion** | Parts are deliberately enlarged for emphasis or expression |\n| **Hierarchical proportion** | The most important figure is shown largest (common in ancient art) |\n\n**South African example:**\nIn traditional African sculpture, **hierarchical proportion** is common — the head is often enlarged because it represents wisdom, leadership, and spirituality. This is not a mistake but a deliberate artistic choice rooted in cultural values.'),
  q(10, 'Why is the head often shown larger than the body in traditional African sculpture?',
    ['Because the head represents wisdom and spiritual importance (hierarchical proportion)', 'Because African artists could not draw realistic proportions', 'Because heads are physically larger in Africa', 'Because the sculptures are unfinished'], 0,
    'Hierarchical proportion is a deliberate artistic choice. In many African traditions, the head is enlarged to symbolise wisdom, leadership, and spiritual authority.'),
  fb(11, '___ means all parts of an artwork feel like they belong together. When the most important figure is shown largest, this is called ___ proportion.',
    ['Unity', 'hierarchical'],
    'Unity (harmony) creates a cohesive artwork. Hierarchical proportion shows the most important figure largest, reflecting cultural values.'),
  q(12, 'A Zulu beadwork design that uses the same geometric motif repeated in rows is an example of:',
    ['Pattern', 'Emphasis', 'Proportion', 'Space'], 0,
    'A motif repeated in a regular, predictable way creates pattern. Zulu beadwork features highly structured repeating patterns with cultural meaning.'),
];

// ===============================================================================
// CHAPTER 3: Drawing and Painting — Portraits (Term 1)
// ===============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Drawing and Painting: Portraits\n\nA **portrait** is an artwork that represents a specific person, usually focusing on the face. Portraits can reveal personality, emotion, social status, and cultural identity.\n\n### Proportions of the Human Face\n\nUnderstanding facial proportions helps you draw realistic portraits:\n\n| Guideline | Rule |\n|-----------|------|\n| **Eye line** | The eyes sit halfway down the head (not near the top!) |\n| **Nose line** | The base of the nose sits halfway between the eyes and the chin |\n| **Mouth line** | The mouth sits roughly one-third of the way between the nose and chin |\n| **Eye spacing** | There is approximately one eye-width between the two eyes |\n| **Ear placement** | Ears align with the area from eyebrow to base of nose |\n| **Head width** | The head is approximately five eye-widths wide |\n\n### Tips for Portrait Drawing\n\n1. Start with a light oval for the head shape\n2. Draw a vertical centre line and horizontal guidelines for eyes, nose, and mouth\n3. Block in the basic shapes before adding detail\n4. Observe your subject carefully — look more than you draw\n5. Use tonal shading to create three-dimensional form\n6. Pay attention to the light source and where shadows fall'),
  q(2, 'On the human face, the eyes are located approximately:',
    ['Halfway down the head', 'One-third from the top', 'Near the top of the head', 'Two-thirds from the top'], 0,
    'A common mistake is placing the eyes too high. The eyes sit approximately halfway between the top of the head and the chin.'),
  t(3, '### Self-Portraits in Art History\n\nA **self-portrait** is a portrait that artists create of themselves. Self-portraits allow artists to explore identity, practice technique, and make personal statements.\n\n**Famous South African self-portraits and portrait artists:**\n\n| Artist | Period / Style | Contribution |\n|--------|---------------|-------------|\n| **Irma Stern** (1894-1966) | Expressionism | Known for bold, colourful portraits of people from diverse cultures across Africa; she painted with thick, energetic brushstrokes |\n| **Gerard Sekoto** (1913-1993) | Social realism | Called the father of Black South African art; painted dignified portraits of everyday people in Sophiatown and District Six |\n| **Zanele Muholi** (b. 1972) | Photography | Creates powerful self-portrait photographs exploring Black, queer identity in South Africa; uses dramatic lighting and props |\n| **Diane Victor** (b. 1964) | Realism / smoke drawings | Creates hauntingly detailed portraits, some using candle smoke on glass or paper |\n| **Dumile Feni** (1942-1991) | Expressionism | Drew powerful, emotionally charged portraits and figures protesting injustice |'),
  q(4, 'Which South African artist is known as the father of Black South African art?',
    ['Gerard Sekoto', 'William Kentridge', 'Dumile Feni', 'Irma Stern'], 0,
    'Gerard Sekoto (1913-1993) is widely regarded as the father of Black South African art. He painted everyday life in townships like Sophiatown with dignity and warmth.'),
  fb(5, 'A ___ is a portrait that an artist creates of themselves. Zanele Muholi is a South African ___ who creates striking self-portrait photographs.',
    ['self-portrait', 'photographer'],
    'A self-portrait is an artwork of the artist by the artist. Zanele Muholi uses photography to explore identity and representation.'),
  t(6, '### Painting Techniques for Portraits\n\n**Media commonly used for portraits:**\n- Pencil (graphite) — ideal for detailed tonal work\n- Charcoal — rich darks, expressive marks\n- Oil pastels — vibrant colour, blendable\n- Tempera paint — water-based, good coverage\n- Watercolour — transparent, layered effects\n- Acrylic paint — versatile, quick-drying\n\n**Colour mixing for skin tones:**\nSkin tones are not one flat colour. To mix realistic skin tones:\n1. Start with a base of yellow ochre, burnt sienna, or raw umber\n2. Add white to lighten or a small amount of blue/purple for shadows\n3. Warm areas (cheeks, nose tip) have more red/orange\n4. Cool areas (under eyes, chin) have more blue/green\n5. Observe actual colours carefully — avoid using brown straight from the tube\n\n**Brushwork:**\n- **Smooth blending** for realistic portraits\n- **Visible brushstrokes** for expressive portraits (like Irma Stern)\n- **Impasto** (thick paint) for textured, sculptural effects'),
  q(7, 'When mixing skin tones for a portrait, which colour would you most likely use as a base?',
    ['Yellow ochre or burnt sienna', 'Pure white', 'Bright red', 'Black'], 0,
    'Skin tones are typically mixed starting from earth tones like yellow ochre or burnt sienna, then adjusted with other colours for highlights and shadows.'),
  t(8, '### The Role of the Artist in Local Society\n\nArtists play important roles in their communities:\n\n| Role | Description | SA Example |\n|------|-------------|------------|\n| **Contributor** | Artists add beauty, creativity, and cultural richness to society | Esther Mahlangu beautifying buildings with Ndebele designs |\n| **Observer** | Artists notice and record what happens in society | Gerard Sekoto documenting everyday township life |\n| **Social commentator** | Artists raise awareness about social issues | William Kentridge addressing apartheid and inequality |\n| **Storyteller** | Artists preserve and share cultural narratives | San rock art recording spiritual experiences and daily life |\n| **Healer** | Art therapy and community art projects help people process trauma | Community mural projects in post-apartheid South Africa |\n\nIn **local** society, artists contribute by:\n- Creating public art (murals, sculptures) that beautify communities\n- Teaching art skills to young people\n- Preserving cultural traditions through craft and visual art\n- Providing commentary on local issues through their work\n- Building community identity and pride'),
  q(9, 'An artist who creates work that raises awareness about social issues is acting as a:',
    ['Social commentator', 'Contributor', 'Healer', 'Storyteller'], 0,
    'A social commentator uses their art to comment on, critique, or raise awareness about issues in society, such as inequality, injustice, or environmental concerns.'),
  fb(10, 'William Kentridge is known for using his art to comment on ___ and inequality. The ___ rock art of South Africa records both spiritual experiences and daily life.',
    ['apartheid', 'San'],
    'Kentridge\'s charcoal drawings and animated films address apartheid and its legacy. San rock art is among the oldest art traditions in the world.'),
  q(11, 'Esther Mahlangu is famous for her work in which art tradition?',
    ['Ndebele mural painting', 'Zulu beadwork', 'San rock art', 'Cape Dutch architecture'], 0,
    'Esther Mahlangu (b. 1935) is internationally celebrated for her bold, geometric Ndebele mural paintings, which she has applied to walls, cars, and even aeroplanes.'),
  t(12, '### Visual Literacy: Reading a Portrait\n\nWhen analysing a portrait, consider:\n\n**Formal analysis (how it looks):**\n- What elements of art are used? (line, colour, tone, texture)\n- What principles of design are applied? (balance, emphasis, contrast)\n- What medium and technique did the artist use?\n\n**Content analysis (what it shows):**\n- Who is the subject? What is their expression?\n- What do clothing, props, and background tell us?\n- What symbols or cultural references are included?\n\n**Contextual analysis (why it was made):**\n- When and where was it created?\n- What was happening in society at that time?\n- What message is the artist communicating?\n- How does it reflect the artist\'s personal experience or cultural background?\n\nWriting about art requires you to use correct **art terminology**. Instead of saying "The picture is nice," say "The artist uses warm analogous colours and smooth tonal gradations to create a harmonious, inviting portrait."'),
];

// ===============================================================================
// CHAPTER 4: South African Sculpture and 3D Art (Term 2)
// ===============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## South African Sculpture and 3D Art\n\nIn Term 2, you will create a **3D artwork** — a marquette (small-scale model) of a South African sculpture for public space. This chapter explores 3D art-making and South African sculptural traditions.\n\n### Understanding 3D Art\n\n**3D art** (three-dimensional art) has **height**, **width**, and **depth**. Unlike a painting or drawing, you can walk around a sculpture and view it from multiple angles.\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Relief sculpture** | Attached to a background; projects outward | Carved wooden panels, coin designs |\n| **Free-standing sculpture** | Can be viewed from all sides (in the round) | A bronze statue in a park |\n| **Installation** | Art designed for a specific space or environment | A gallery-filling immersive artwork |\n| **Assemblage** | 3D art made from found or recycled objects | Sculptures from scrap metal and wire |\n| **Kinetic sculpture** | Sculpture that moves | Mobiles, wind-driven artworks |\n\n### Form and Space in 3D Art\n\n- **Positive space**: The solid parts of the sculpture\n- **Negative space**: The empty spaces within or around the sculpture\n- **Volume**: The amount of space the sculpture occupies\n- Both positive and negative space are equally important in creating a successful 3D artwork'),
  q(2, 'What is the difference between relief sculpture and free-standing sculpture?',
    ['Relief sculpture is attached to a background; free-standing can be viewed from all sides', 'Relief sculpture is larger than free-standing', 'Free-standing sculptures are always made of metal', 'There is no difference'], 0,
    'Relief sculpture projects from a flat background surface and is viewed from the front. Free-standing (in-the-round) sculpture can be walked around and viewed from every angle.'),
  t(3, '### South African Public Sculpture\n\nPublic sculpture is artwork placed in open, accessible spaces for the community to experience.\n\n**Notable South African public sculptures:**\n\n| Sculpture | Artist | Location | Significance |\n|-----------|--------|----------|-------------|\n| **Nelson Mandela statue** | Various | Union Buildings, Pretoria | 9-metre bronze statue honouring democracy and freedom |\n| **Arch for Arch** | Various | Cape Town | Honouring Archbishop Desmond Tutu; uses geometric forms |\n| **Dias Cross** | Historical | Kwaaihoek, Eastern Cape | Portuguese stone cross marking early exploration |\n| **Anglo-Boer War memorials** | Various | Across SA | Historical monuments in public squares |\n| **Freedom Park** | Various artists | Pretoria | Memorial to those who fought for freedom; integrates sculpture, architecture, and landscape |\n| **Owl House** | Helen Martins | Nieu-Bethesda, Eastern Cape | Cement and glass sculptures filling a home and garden; outsider art |\n\n**Purpose of public sculpture:**\n- Commemorates important events and people\n- Creates community identity and pride\n- Beautifies public spaces\n- Provokes thought and discussion\n- Preserves cultural heritage'),
  q(4, 'The Owl House in Nieu-Bethesda was created by:',
    ['Helen Martins', 'Esther Mahlangu', 'William Kentridge', 'Dumile Feni'], 0,
    'Helen Martins (1897-1976) created the Owl House, filling her home and garden in Nieu-Bethesda with cement and crushed glass sculptures. It is now a museum and cultural landmark.'),
  fb(5, 'A sculpture that can be viewed from all sides is called ___-standing. The 9-metre bronze statue of Nelson Mandela is located at the ___ Buildings in Pretoria.',
    ['free', 'Union'],
    'Free-standing sculpture (in the round) can be walked around. The iconic Mandela statue stands at the Union Buildings, the seat of government.'),
  t(6, '### Construction and Modelling Techniques for 3D Art\n\n**Construction techniques** (building up from separate parts):\n\n| Technique | Description |\n|-----------|-------------|\n| **Pasting** | Joining materials with adhesive (glue, papier-mache paste) |\n| **Cutting** | Removing material with scissors, craft knife, or saw |\n| **Modelling** | Shaping pliable material (clay, papier-mache, plaster) by hand |\n| **Wrapping** | Covering an armature with material (wire wrapped with newspaper, fabric) |\n| **Tying / stitching** | Joining materials with string, wire, or thread |\n| **Joining** | Connecting pieces with slots, tabs, tape, or fasteners |\n| **Scoring** | Making shallow cuts to fold or bend material |\n\n**Armature**: An internal skeleton or framework that supports a sculpture. Often made from wire, sticks, or rolled newspaper.\n\n**Materials for your marquette:**\n- Paper mache (newspaper + flour-and-water paste)\n- Off-cut cardboard and boxes\n- Wire (for armature)\n- Recyclable containers and objects\n- Clay or plasticine\n- String, fabric scraps, foil'),
  q(7, 'What is an armature in sculpture?',
    ['An internal framework or skeleton that supports the sculpture', 'A type of paint used on sculptures', 'The base that a sculpture stands on', 'A tool for carving stone'], 0,
    'An armature is the internal support structure (skeleton) of a sculpture, typically made from wire, wood, or other rigid materials. The sculptor builds the form around it.'),
  t(8, '### Art Elements and Design Principles in 3D\n\nThe same elements and principles apply to 3D art, but with additional considerations:\n\n| Element / Principle | Application in 3D |\n|--------------------|-------------------|\n| **Form** | The primary element — the 3D shape of the sculpture |\n| **Space** | Both positive (solid) and negative (empty) space create interest |\n| **Texture** | Surface quality is actual, not just visual; can be smooth, rough, bumpy |\n| **Colour** | Applied through paint, patina, or inherent material colour |\n| **Balance** | The sculpture must be physically stable as well as visually balanced |\n| **Proportion** | Size relationships between parts must be considered from all viewpoints |\n| **Unity** | All parts must work together as a cohesive whole |\n\n### Spatial Awareness\n\nWhen creating 3D art, you must develop **spatial awareness** — understanding how your work looks from multiple angles:\n- Front view\n- Side views (left and right)\n- Back view\n- Top view (bird\'s eye)\n\nRotate your sculpture regularly while working to check all views.'),
  fb(9, 'In 3D art, ___ space refers to the solid parts of the sculpture, while ___ space refers to the empty areas within or around it.',
    ['positive', 'negative'],
    'Positive space is the occupied, solid form. Negative space is the open, empty area. Both contribute to the visual impact of a sculpture.'),
  q(10, 'Why is it important to view a sculpture from multiple angles while working on it?',
    ['To ensure it looks balanced and complete from all viewpoints', 'Because the teacher requires photos from every angle', 'To decide which side to paint first', 'It is not important; only the front matters'], 0,
    'Free-standing sculpture is experienced from all angles, so the artist must check every viewpoint to ensure the work is balanced, proportional, and visually interesting throughout.'),
  t(11, '### Concern for the Environment: Recycled Art\n\nThe CAPS curriculum emphasises concern for the environment. Many South African artists create powerful work from **recycled and found materials**.\n\n**South African recycled-art artists:**\n\n| Artist | Medium | Work |\n|--------|--------|------|\n| **Willie Bester** | Scrap metal, found objects | Assemblage sculptures commenting on apartheid and poverty |\n| **Mbongeni Buthelezi** | Melted plastic waste | Paintings and sculptures from recycled plastics |\n| **Wire artists** (many anonymous) | Telephone wire, fencing wire | Intricate toy cars, animals, and vessels |\n| **El Anatsui** (Ghanaian, exhibited in SA) | Bottle caps, aluminium | Massive shimmering tapestries from recycled metal |\n\n**Benefits of using recycled materials in art:**\n- Reduces waste going to landfill\n- Makes art accessible (materials are free or cheap)\n- Sends a message about environmental responsibility\n- Creates unique textures and forms\n- Connects art to real-world issues'),
  q(12, 'Which South African artist creates artworks from melted plastic waste?',
    ['Mbongeni Buthelezi', 'Willie Bester', 'Helen Martins', 'Irma Stern'], 0,
    'Mbongeni Buthelezi uses discarded plastic packaging, which he melts and applies to surfaces to create colourful, textured artworks that highlight waste and recycling.'),
];

// ===============================================================================
// CHAPTER 5: 2D Art — Still Life, Logos, and South African Motifs (Term 2)
// ===============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## 2D Art: Still Life, Logos, and South African Motifs\n\nIn the second half of Term 2, you focus on **2D (two-dimensional) art-making**, including still life painting, logo design, and creating artworks using South African motifs.\n\n### Still Life Art\n\nA **still life** is an artwork depicting inanimate (non-living) objects — fruit, flowers, bottles, fabric, and everyday items.\n\n**Why practise still life?**\n- Develops observational skills\n- Teaches tonal rendering (light and shadow)\n- Allows practice of colour mixing\n- Improves understanding of form, space, and composition\n- No model needed — you arrange the objects yourself\n\n**Composing a still life:**\n1. Choose objects with variety in shape, size, and texture\n2. Arrange objects in an overlapping group (not in a straight line)\n3. Consider the background and any fabric/draping\n4. Set up a single light source for clear shadows\n5. Choose a viewpoint — slightly above eye level often works well'),
  q(2, 'A still life artwork depicts:',
    ['Inanimate (non-living) objects', 'A landscape with mountains', 'A portrait of a person', 'An action scene with movement'], 0,
    'A still life is a composition of non-living objects such as fruit, bottles, flowers, and household items.'),
  t(3, '### Painting a Still Life: Techniques\n\n**Steps for painting a still life:**\n\n1. **Rough sketch**: Lightly draw the shapes and positions of objects\n2. **Block in shapes**: Fill in the basic colour areas without detail\n3. **Establish tonal values**: Identify light, mid-tone, and dark areas\n4. **Build up layers**: Add more colour and detail gradually\n5. **Refine edges**: Sharpen some edges (near objects) and soften others (distant objects)\n6. **Add highlights and deepest shadows last**: These create the strongest contrast\n\n**Colour mixing for still life:**\n\n| Technique | Purpose |\n|-----------|--------|\n| **Tinting** | Adding white to a colour to lighten it |\n| **Shading** | Adding black (or a dark complement) to darken a colour |\n| **Greying / muting** | Mixing a colour with its complement to reduce intensity |\n| **Wet-on-wet** | Blending colours directly on the paper while still wet |\n| **Dry brush** | Using a nearly dry brush for textured effects |\n\n**Observation tip:** Squint your eyes when looking at the still life arrangement. This simplifies the tonal values and helps you see the big shapes of light and dark.'),
  fb(4, 'Adding white to a colour to make it lighter is called ___. Adding black or a dark complement to darken a colour is called ___.',
    ['tinting', 'shading'],
    'Tinting lightens a colour by adding white. Shading darkens a colour by adding black or a complementary dark colour.'),
  t(5, '### Logo Design Using South African Motifs\n\nA **logo** is a graphic symbol that represents an organisation, brand, or idea. Good logo design requires understanding of art elements and design principles.\n\n**Characteristics of an effective logo:**\n- **Simple** — easy to recognise at a glance\n- **Memorable** — makes a lasting impression\n- **Versatile** — works at different sizes and in different contexts\n- **Appropriate** — suits the organisation it represents\n- **Timeless** — does not look dated quickly\n\n**South African motifs for logo design:**\n\n| Motif Source | Visual Elements |\n|-------------|----------------|\n| **Ndebele patterns** | Bold geometric shapes, vibrant primary colours, thick black outlines |\n| **Zulu beadwork** | Triangles, diamonds, repeating patterns, symbolic colour use |\n| **Adinkra symbols** (West African, used across the continent) | Stylised symbols representing concepts (e.g., unity, strength) |\n| **Rock art** | Simplified animal and human figures, ochre and brown tones |\n| **Protea** (national flower) | Organic form, layered petals |\n| **Springbok** | Leaping antelope form, movement, national identity |\n| **African wildlife** | Simplified silhouettes of the Big Five |'),
  q(6, 'Which of the following is NOT a characteristic of a good logo?',
    ['Complicated and highly detailed', 'Simple and recognisable', 'Memorable', 'Versatile at different sizes'], 0,
    'A good logo should be simple, not complicated. Complex, highly detailed designs do not reproduce well at small sizes and are harder to remember.'),
  t(7, '### Steps to Design a Logo\n\n1. **Research**: Understand the organisation / concept the logo represents\n2. **Brainstorm**: List words, images, and symbols associated with the concept\n3. **Thumbnail sketches**: Draw many small, quick sketches (at least 10-15 ideas)\n4. **Select and refine**: Choose the strongest 2-3 ideas and develop them larger\n5. **Apply art elements**: Consider line, shape, colour, balance, and unity\n6. **Finalise**: Create a clean, finished version using appropriate media\n7. **Test**: Check it works in different sizes (large poster, small stamp)\n\n### Design Principles in Logo Design\n\n| Principle | Application |\n|-----------|------------|\n| **Balance** | Symmetrical logos feel stable and trustworthy |\n| **Unity** | All parts must work together as one cohesive image |\n| **Emphasis** | The most important element should dominate |\n| **Contrast** | Ensures readability (dark on light or light on dark) |\n| **Proportion** | Elements must be correctly sized relative to each other |\n| **Rhythm / pattern** | Can be used if the logo has repeating elements |'),
  fb(8, 'The first step in designing a logo is to ___ the organisation it will represent. Small, quick preliminary drawings used to explore ideas are called ___ sketches.',
    ['research', 'thumbnail'],
    'Research helps you understand the purpose and audience. Thumbnail sketches are small, fast exploratory drawings used to generate and compare many ideas.'),
  t(9, '### Lettering and Typography in Design\n\nMany logos incorporate text. Understanding **lettering** and **typography** is essential for design.\n\n**Key typography terms:**\n\n| Term | Meaning |\n|------|--------|\n| **Font / typeface** | The style and design of text characters |\n| **Serif** | Fonts with small decorative strokes at the ends of letters (e.g., Times New Roman) — formal, traditional |\n| **Sans-serif** | Fonts without serifs (e.g., Helvetica, Arial) — modern, clean |\n| **Hand lettering** | Letters drawn by hand for a unique, personal feel |\n| **Hierarchy** | Varying font size and weight to show importance |\n| **Kerning** | Adjusting the space between individual letters |\n| **Leading** | The vertical space between lines of text |\n\n**Tips for incorporating text in your logo:**\n- Choose a font style that matches the mood (formal, playful, bold)\n- Ensure text is legible at all sizes\n- Consider integrating the text with the image, not just placing it alongside\n- Hand lettering can give a uniquely South African feel'),
  q(10, 'A serif font has:',
    ['Small decorative strokes at the ends of letters', 'No decorative strokes at all', 'Only capital letters', 'Curved letters only'], 0,
    'Serif fonts have small decorative lines (serifs) at the ends of letter strokes. Sans-serif fonts lack these decorations and appear more modern.'),
  q(11, 'When designing a logo, why should you create many thumbnail sketches first?',
    ['To explore different ideas quickly before committing to one', 'Because the teacher requires at least 15 sketches', 'To use up your pencil', 'To make the final design look messier'], 0,
    'Thumbnail sketches allow you to experiment with many different concepts and compositions rapidly. This helps you find the strongest idea before investing time in a detailed final version.'),
  fb(12, 'The national flower of South Africa is the ___. Fonts without small decorative strokes at the ends of letters are called ___-serif.',
    ['protea', 'sans'],
    'The protea (Protea cynaroides) is South Africa\'s national flower. Sans-serif means "without serifs" — clean, modern typefaces.'),
];

// ===============================================================================
// CHAPTER 6: Printmaking and Social Comment in Art (Term 3)
// ===============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Printmaking and Social Comment in Art\n\nIn Term 3, you explore **printmaking** — one of the most important art forms in South African history — and learn how artists use visual art to make **social comment**.\n\n### What is Printmaking?\n\nPrintmaking is the process of creating artworks by transferring an image from a prepared surface (the matrix) onto paper or another material. Unlike painting, printmaking allows the artist to create **multiple copies** of the same image.\n\n### Types of Printmaking\n\n| Method | Description | Surface |\n|--------|-------------|--------|\n| **Linocut** | Image carved into linoleum; ink rolled onto raised areas; pressed onto paper | Linoleum sheet |\n| **Woodcut** | Similar to linocut but carved into a wooden block | Wooden block |\n| **Etching** | Image scratched into a metal plate; ink fills the scratches | Metal plate |\n| **Monoprint** | One-of-a-kind print; paint or ink applied to a smooth surface and paper pressed on | Glass, plastic, or metal |\n| **Scraperboard** | Black-coated board scratched with a sharp tool to reveal white underneath | Prepared scraperboard |\n| **Collagraph** | Textured collage glued to a base, inked and printed | Cardboard with collaged materials |\n\n**Note:** For Grade 9, the focus is on **linocut**, **scraperboard**, and simple **etching** techniques that can be done safely in the classroom.'),
  q(2, 'What is the key advantage of printmaking over painting?',
    ['Multiple copies of the same image can be produced', 'It is always cheaper than painting', 'It does not require any tools', 'The prints are always larger than paintings'], 0,
    'Printmaking\'s defining feature is that the artist can produce multiple identical (or near-identical) prints from a single prepared surface.'),
  t(3, '### Linocut Printmaking — Step by Step\n\nLinocut is the most common printmaking method used in South African schools.\n\n**Materials needed:**\n- Linoleum sheet (or rubber/vinyl alternative)\n- Lino cutting tools (V-gouge, U-gouge)\n- Printing ink (water-based or oil-based)\n- Roller (brayer)\n- Paper for printing\n- Pencil and tracing paper for design transfer\n\n**Steps:**\n\n1. **Design**: Create your image on paper (remember it will print in reverse/mirror image!)\n2. **Transfer**: Trace the design onto the lino surface (use carbon paper or rub pencil on the back)\n3. **Carve**: Cut away areas you want to remain white (unprinted). The raised areas will receive ink\n4. **Ink**: Roll ink evenly onto the roller, then roll ink onto the lino surface\n5. **Print**: Place paper on the inked lino and press firmly (by hand, spoon, or printing press)\n6. **Peel**: Carefully lift the paper to reveal your print\n7. **Edition**: Repeat steps 4-6 to create multiple copies\n\n**Safety rules:**\n- Always cut AWAY from your body\n- Keep fingers behind the cutting tool\n- Use a bench hook to hold the lino steady\n- Handle sharp tools with care'),
  q(4, 'Why must a linocut design be drawn in reverse?',
    ['Because the printed image will be a mirror image of the carved block', 'Because linocut tools only work in one direction', 'Because paper absorbs ink backwards', 'It does not need to be reversed'], 0,
    'In printmaking, the image transfers in reverse. If you carve text or a specific directional image, you must design it as a mirror image so it prints correctly.'),
  fb(5, 'In linocut printing, you cut away the areas that will remain ___ (unprinted). The tool used to roll ink evenly onto the lino surface is called a ___ (or brayer).',
    ['white', 'roller'],
    'The carved-away areas do not receive ink and remain white. A roller (brayer) is used to apply ink evenly across the raised surface.'),
  t(6, '### South African Printmakers\n\nSouth Africa has a rich tradition of printmaking, particularly linocut, which became a powerful tool for social and political commentary.\n\n**Important SA printmakers:**\n\n| Artist | Period | Contribution |\n|--------|--------|-------------|\n| **John Muafangejo** (1943-1987) | Resistance art era | Namibian-born, trained at Rorke\'s Drift Art Centre in KZN; powerful black-and-white linocuts depicting daily life, history, and biblical narratives |\n| **Azaria Mbatha** (b. 1941) | Rorke\'s Drift school | Linocuts combining Zulu traditions with Christian imagery |\n| **Cyprian Shilakoe** (1946-1972) | Rorke\'s Drift school | Etchings and linocuts exploring themes of oppression and identity |\n| **Walter Battiss** (1906-1982) | Modernism | Inspired by San rock art; created prints celebrating South African landscapes and people |\n| **William Kentridge** (b. 1955) | Contemporary | Known for animated charcoal drawings, but also creates powerful linocuts and etchings |\n\n**Rorke\'s Drift Art Centre** (KZN) was a mission-run art school that trained many of South Africa\'s greatest printmakers during the apartheid era. It gave Black artists access to printmaking facilities and training that was otherwise unavailable.'),
  q(7, 'Rorke\'s Drift Art Centre was significant because:',
    ['It trained many important Black South African printmakers during apartheid', 'It was the only art gallery in KwaZulu-Natal', 'It sold the most expensive artworks in Africa', 'It was a government-funded museum'], 0,
    'Rorke\'s Drift Art Centre in KZN was a mission-run art school that provided crucial training and facilities for Black artists during apartheid, producing some of SA\'s greatest printmakers including Muafangejo and Mbatha.'),
  t(8, '### Art as Social Comment\n\n**Social comment** in art means using visual images to express opinions about issues affecting society — inequality, poverty, violence, environmental destruction, identity, and human rights.\n\n**Why do artists make social comment?**\n- To raise awareness about injustice\n- To challenge the viewer to think critically\n- To document historical events\n- To give voice to the voiceless\n- To inspire change\n\n**South African art has a strong tradition of social comment:**\n\n| Period | Context | Art Response |\n|--------|---------|-------------|\n| **Apartheid era (1948-1994)** | Racial segregation, forced removals, inequality | Resistance art — protest posters, prints, murals |\n| **Transition (1990s)** | Negotiations, TRC, nation-building | Art reflecting hope, reconciliation, and new identity |\n| **Post-apartheid** | Ongoing inequality, gender-based violence, land reform | Contemporary artists continue to address unresolved social issues |\n\n**Resistance art** was art created to oppose the apartheid government. It was often produced as prints, posters, and banners because these could be reproduced quickly and distributed widely.'),
  q(9, 'Resistance art during apartheid was often produced as prints and posters because:',
    ['They could be reproduced quickly and distributed widely', 'They were more expensive than paintings', 'The government preferred this format', 'Printing was the only art form allowed'], 0,
    'Prints and posters could be mass-produced cheaply and distributed to a wide audience, making them ideal for spreading anti-apartheid messages.'),
  fb(10, 'Art that expresses opinions about issues in society is called social ___. During the apartheid era, art created to oppose the government was known as ___ art.',
    ['comment', 'resistance'],
    'Social comment art addresses societal issues. Resistance art specifically opposed the apartheid system through visual protest.'),
  t(11, '### Creating a Social Comment Artwork\n\nFor your Term 3 practical, you may create a **2D artwork** (e.g., flyer, leaflet, handout, or print) that makes a social comment about an issue relevant to your community.\n\n**Steps for creating a social comment artwork:**\n\n1. **Choose your issue**: Select a topic you feel strongly about (e.g., bullying, pollution, water conservation, gender equality, food security)\n2. **Research**: Gather information, images, and different perspectives on the issue\n3. **Develop your message**: What do you want the viewer to think, feel, or do?\n4. **Plan your composition**: Create thumbnail sketches combining text and image\n5. **Choose your technique**: Linocut, drawing, mixed media, collage, or digital\n6. **Apply art elements and principles**: Use contrast, emphasis, and colour strategically\n7. **Create the artwork**: Execute your plan with care and craftsmanship\n8. **Reflect**: Write a statement explaining your artistic choices and message\n\n**Symbolic language in art:**\n\n| Symbol | Common Meaning |\n|--------|----------------|\n| **Dove** | Peace |\n| **Broken chain** | Freedom from oppression |\n| **Raised fist** | Solidarity, resistance |\n| **Tree / plant** | Growth, life, environment |\n| **Barbed wire** | Imprisonment, restriction |\n| **Open hands** | Giving, receiving, welcome |'),
  q(12, 'Which of the following symbols is commonly associated with peace?',
    ['A dove', 'A raised fist', 'Barbed wire', 'A broken chain'], 0,
    'The dove is a widely recognised symbol of peace and is often used in artworks addressing conflict resolution and harmony.'),
];

// ===============================================================================
// CHAPTER 7: Design for Popular Culture (Term 3)
// ===============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Design for Popular Culture\n\nIn the second half of Term 3, you explore how art elements and design principles are used in **popular culture** — the visual world of everyday life including CD covers, cell phone wallpapers, posters, computer screensavers, and social media graphics.\n\n### What is Popular Culture?\n\nPopular culture (pop culture) refers to the cultural products, images, and ideas that are widely shared and consumed by many people. In the visual arts, pop culture includes:\n\n- Album and playlist cover art\n- Movie and game posters\n- Fashion and clothing design\n- Graffiti and street art\n- Social media graphics and memes\n- Advertising and packaging design\n- Digital illustrations and fan art\n\n### Art and Design in Everyday Life\n\nDesign is not only found in galleries — it surrounds you:\n\n| Context | Design Application |\n|---------|--------------------|\n| **Cell phone** | Wallpapers, app icons, interface design |\n| **Music** | Album covers, concert posters, merchandise |\n| **Fashion** | Textile patterns, brand logos, lookbooks |\n| **Social media** | Profile pictures, post templates, stories |\n| **Gaming** | Character design, environment art, loading screens |\n| **Public spaces** | Billboards, bus stop ads, murals |'),
  q(2, 'Which of the following is an example of art in popular culture?',
    ['Album cover design', 'A sculpture in a museum vault', 'An ancient cave painting', 'A private art collection'], 0,
    'Album cover design is a form of art in popular culture because it is widely distributed and consumed by many people as part of everyday media.'),
  t(3, '### South African Pop Culture Art\n\nSouth Africa has a vibrant pop culture art scene:\n\n| Artist / Movement | Medium | Description |\n|-------------------|--------|------------|\n| **Faith47** | Street art, murals | Large-scale murals in Cape Town and Johannesburg exploring identity and inequality |\n| **Falko One** | Graffiti art | Whimsical animal characters painted on township walls in Cape Town |\n| **Karabo Poppy Moletsane** | Digital illustration | Bold, colourful illustrations celebrating Black women; her work has been featured on Google Doodles |\n| **Laduma Ngxokolo** | Fashion / textile design | MaXhosa knitwear — fashion designs inspired by Xhosa beadwork patterns |\n| **Shweshwe design** | Textile / fabric | Traditional South African printed cotton fabric used in modern fashion |\n| **Kwaito / Hip Hop visuals** | Music graphics | Album covers and music video aesthetics blending African and global urban culture |\n\n**The artist in global popular culture:**\nSouth African artists increasingly influence global pop culture. Esther Mahlangu\'s Ndebele patterns have appeared on BMW cars and international fashion collaborations, while SA musicians and designers bring local visual traditions to world stages.'),
  q(4, 'MaXhosa knitwear by Laduma Ngxokolo draws inspiration from:',
    ['Xhosa beadwork patterns', 'European fashion houses', 'Japanese kimono designs', 'American sportswear'], 0,
    'Laduma Ngxokolo\'s MaXhosa brand uses traditional Xhosa beadwork patterns as the basis for contemporary fashion knitwear, blending heritage and modern design.'),
  fb(5, 'The South African street artist ___ is known for painting whimsical animal characters on township walls. Esther Mahlangu\'s Ndebele patterns have appeared on ___ cars.',
    ['Falko One', 'BMW'],
    'Falko One creates colourful, playful animal characters in Cape Town townships. Esther Mahlangu famously painted a BMW Art Car using Ndebele geometric patterns.'),
  t(6, '### Creating a CD Cover or Wallpaper Design\n\nFor your Term 3 project, you may design a **CD cover, cell phone wallpaper, computer screensaver**, or similar popular culture product.\n\n**Design process:**\n\n1. **Brief**: Define the purpose, audience, and mood of your design\n2. **Research**: Study existing designs in the same category; collect visual references\n3. **Concept development**: Create mind maps and mood boards\n4. **Thumbnail sketches**: Generate multiple quick layout ideas (at least 8-10)\n5. **Select and refine**: Choose the strongest concept and develop it\n6. **Final execution**: Create the finished design using your chosen media\n7. **Evaluate**: Assess your design against the brief\n\n**Layout principles for graphic design:**\n\n| Principle | Application |\n|-----------|------------|\n| **Visual hierarchy** | The most important information should be largest/boldest |\n| **White space** | Empty areas give the design room to breathe; avoid clutter |\n| **Alignment** | Text and images should be aligned consistently |\n| **Repetition** | Repeat colours, fonts, or shapes for consistency |\n| **Proximity** | Related items should be grouped together |'),
  q(7, 'In graphic design, "white space" refers to:',
    ['Empty areas that give the design room to breathe', 'Areas painted white', 'Mistakes in the design', 'The border around the design'], 0,
    'White space (also called negative space) is the empty area in a design. It is intentional and helps prevent visual clutter, making the design easier to read and more elegant.'),
  t(8, '### Etching and Scraperboard Techniques\n\n**Simple etching** (suitable for Grade 9):\n\nUsing scraperboard (a board coated with a layer of black ink over white):\n1. Plan your design on paper first\n2. Transfer the design lightly onto the scraperboard\n3. Use a sharp etching tool, nail, or compass point to scratch through the black surface\n4. The scratched lines reveal the white underneath\n5. The result is a high-contrast black-and-white image\n\n**Creating tonal effects in scraperboard:**\n\n| Technique | Result |\n|-----------|--------|\n| **Fine parallel lines** | Light grey tone |\n| **Cross-hatching** | Darker grey tone |\n| **Stippling (dots)** | Textured grey tone |\n| **Wide scratches** | Bold white highlights |\n| **Leaving areas unscratched** | Solid black |\n\n**Tips:**\n- Work from light areas to dark (scratch where you want light)\n- Be careful — scratches cannot be undone\n- Practice on a small test piece first\n- Use varying pressure for different line widths'),
  fb(9, 'In scraperboard etching, you scratch through the ___ surface to reveal the white underneath. Fine parallel lines create a light ___ tone.',
    ['black', 'grey'],
    'Scraperboard has a black-coated surface. Scratching through it reveals white, and varying the density of scratches creates different grey tonal values.'),
  t(10, '### The Role of the Artist in Global Society\n\nBuilding on the role of the artist in local society (Term 1), we now consider the artist\'s role on a **global** scale.\n\n| Role | Global Context |\n|------|----------------|\n| **Cultural ambassador** | Artists represent their country\'s culture to the world (e.g., Esther Mahlangu exhibiting Ndebele art internationally) |\n| **Global commentator** | Artists address worldwide issues like climate change, migration, and human rights |\n| **Bridge builder** | Art crosses language barriers and connects people from different cultures |\n| **Change maker** | Art campaigns influence public opinion globally (e.g., protest art shared on social media) |\n| **Preserver of heritage** | Artists keep traditional knowledge alive in a globalised world |\n\n**South African artists on the global stage:**\n- **William Kentridge** — exhibited in museums worldwide (MoMA, Tate, Louvre); his animated films address history and memory\n- **Zanele Muholi** — photographs exhibited internationally; challenges global perceptions of gender and identity\n- **Robin Rhode** — performance and street art exhibited in major international galleries\n- **Mary Sibande** — sculpture and installation exploring domestic worker identity; exhibited globally'),
  q(11, 'An artist who represents their country\'s culture on an international stage is acting as a:',
    ['Cultural ambassador', 'Gallery owner', 'Art critic', 'Museum curator'], 0,
    'A cultural ambassador shares their country\'s artistic traditions and cultural identity with international audiences through exhibitions, collaborations, and public artworks.'),
  q(12, 'Which South African artist is known for performance and street art exhibited in major international galleries?',
    ['Robin Rhode', 'Irma Stern', 'Gerard Sekoto', 'Walter Battiss'], 0,
    'Robin Rhode (b. 1976) is a South African artist known for his performance art and wall drawings that have been exhibited in major international galleries and museums.'),
];

// ===============================================================================
// CHAPTER 8: 3D Puppet-Making and Life Drawing (Term 4)
// ===============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## 3D Art: Puppet-Making\n\nIn Term 4, you create a **3D puppet** (such as a ventriloquist puppet, rod puppet, shadow puppet, or hand puppet) that can be used for **public commentary** — telling stories or sharing messages about issues in your community.\n\n### Types of Puppets\n\n| Puppet Type | Description | Mechanism |\n|------------|-------------|----------|\n| **Hand puppet (glove puppet)** | Fits over the hand; fingers control head and arms | Puppeteer\'s hand inside |\n| **Rod puppet** | Controlled from below by rods attached to the head and limbs | Sticks / dowels |\n| **Marionette (string puppet)** | Controlled from above by strings attached to a cross-bar | Strings from above |\n| **Shadow puppet** | Flat, cut-out figure held between a light source and a screen | Rods behind a translucent screen |\n| **Ventriloquist puppet** | Operated while puppeteer speaks without moving lips | Hand inside with mouth mechanism |\n| **Sock puppet** | Simple puppet made from a sock | Hand inside the sock |\n\n### Puppetry in South African Culture\n\nSouth Africa has a rich puppetry tradition:\n- **Handspring Puppet Company** (Cape Town) — world-famous; created the life-size horse puppets for the stage show *War Horse*\n- **Ukwanda Puppet and Design** — community puppet theatre in Johannesburg\n- Township puppet shows — used for health education, storytelling, and entertainment\n- Puppetry is used in SA television (e.g., educational children\'s programmes)'),
  q(2, 'Which South African puppet company created the horse puppets for the stage show War Horse?',
    ['Handspring Puppet Company', 'Ukwanda Puppet and Design', 'The Baxter Theatre', 'Market Theatre'], 0,
    'Handspring Puppet Company, founded in Cape Town by Adrian Kohler and Basil Jones, created the celebrated life-size horse puppets for the internationally acclaimed stage production War Horse.'),
  t(3, '### Planning and Making Your Puppet\n\n**Design considerations:**\n- What character will your puppet represent?\n- What message or story will it communicate?\n- What type of puppet suits your character and purpose?\n- What materials are available?\n\n**Construction techniques:**\n\n| Stage | Process |\n|-------|--------|\n| **1. Design** | Sketch your puppet from the front, side, and back. Include colour notes |\n| **2. Armature** | Build the internal structure (wire frame, cardboard tube, bottle) |\n| **3. Form** | Add bulk using papier-mache, fabric padding, foam, or newspaper |\n| **4. Features** | Create facial features, hands, and details |\n| **5. Surface** | Paint and decorate; add fabric for clothing |\n| **6. Mechanism** | Attach rods, strings, or create hand openings for operation |\n| **7. Test** | Practise operating the puppet to check movement and expression |\n\n**Materials (recycled and affordable):**\n- Boxes, toilet rolls, polystyrene containers\n- Paper mache (newspaper + flour paste)\n- Fabric scraps, wool, string\n- Wire, tin foil, bottle caps\n- Paint, markers, glue'),
  fb(4, 'The internal structure that supports a puppet is called an ___. Papier-mache is made by layering ___ with paste.',
    ['armature', 'newspaper'],
    'An armature is the internal skeleton or framework. Papier-mache uses strips of newspaper soaked in paste (flour and water or PVA glue) layered over a form.'),
  t(5, '### Puppets as Social Commentary\n\nPuppetry has a long history of being used for **social commentary** — addressing issues in a way that is engaging, accessible, and sometimes able to say things that people cannot.\n\n**Why puppets are effective for social commentary:**\n- Audiences of all ages relate to puppet characters\n- Serious topics can be presented in an accessible way\n- Puppets can represent ideas symbolically (e.g., a giant puppet representing "Greed")\n- Live performance creates immediate connection with the audience\n- Puppet shows can be performed in any space — no theatre needed\n\n**Topics for your puppet commentary:**\n- Environmental conservation (e.g., a puppet that represents a polluted river)\n- Anti-bullying (e.g., characters showing the impact of bullying)\n- Health awareness (e.g., nutrition, exercise, hygiene)\n- Cultural pride and heritage\n- Community safety\n- Substance abuse awareness\n\n**Performance skills:**\n- Give your puppet a distinct voice and personality\n- Use clear, exaggerated movements (puppets need bigger gestures than humans)\n- Maintain eye line — the puppet should "look at" who it is speaking to\n- Practice operating the puppet smoothly'),
  q(6, 'Puppetry is particularly effective for social commentary because:',
    ['Audiences of all ages relate to puppet characters, and serious topics can be made accessible', 'Puppets are always more expensive than other artworks', 'Only professional artists can make puppets', 'Puppets can only be used for children\'s entertainment'], 0,
    'Puppetry engages audiences of all ages and allows serious social issues to be addressed in an accessible, engaging way. Puppet characters can symbolise ideas and emotions effectively.'),
  t(7, '### Spatial Awareness and 3D Form in Puppet-Making\n\nWhen constructing a puppet, you must apply your understanding of 3D art concepts:\n\n| Concept | Application |\n|---------|------------|\n| **Form** | The puppet must have convincing three-dimensional shape |\n| **Proportion** | Head, body, and limbs should be in correct or deliberately exaggerated proportion |\n| **Texture** | Surface textures communicate character (rough = rugged; smooth = refined) |\n| **Colour** | Colours express personality (warm = friendly; dark = mysterious) |\n| **Balance** | The puppet must be physically balanced for operation |\n| **Movement** | Consider how joints will articulate — where does the puppet bend? |\n\n**Working safely:**\n- Use a craft knife on a cutting mat (not on the desk)\n- Handle wire with pliers; tape sharp ends\n- Allow papier-mache to dry completely between layers\n- Work in a ventilated area when painting\n- Clean up tools and workspace after each session'),
  fb(8, 'When making a puppet, you should view it from ___ angles to check its 3D form. The ___ of the puppet must be physically balanced so it can be operated effectively.',
    ['multiple', 'weight'],
    'Checking from multiple angles ensures the 3D form is convincing. Physical weight balance is essential for smooth puppet operation.'),
  q(9, 'Which art element is most important in puppet-making since the puppet exists in three-dimensional space?',
    ['Form', 'Line', 'Colour', 'Pattern'], 0,
    'Form is the primary element in any 3D artwork, including puppets. The puppet must have convincing three-dimensional shape that works from all viewing angles.'),
];

blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Life Drawing and Symbolic Personal Expression\n\nIn the second half of Term 4, you create **2D artworks** including life drawing (drawing from direct observation of a model or scene) and artwork expressing your **personal identity and belonging in the global world**.\n\n### Life Drawing Fundamentals\n\nLife drawing is drawing from observation of a live subject — a person, animal, or scene observed directly rather than from a photograph.\n\n**Why life drawing is important:**\n- Develops accurate observation skills\n- Teaches proportion, anatomy, and movement\n- Improves hand-eye coordination\n- Builds confidence in drawing ability\n- Connects the artist directly to the subject\n\n**Basic human body proportions:**\n\n| Guideline | Proportion |\n|-----------|------------|\n| **Total height** | Approximately 7-8 head lengths |\n| **Shoulder width** | Approximately 2-3 head widths |\n| **Arms** | Fingertips reach to mid-thigh when arms hang at sides |\n| **Elbow** | Aligns roughly with the waist |\n| **Knee** | Halfway between hip and foot |\n| **Feet** | Approximately one head length long |'),
  q(2, 'How many head lengths tall is the average human body?',
    ['7-8 head lengths', '3-4 head lengths', '10-12 head lengths', '5-6 head lengths'], 0,
    'The average adult human body is approximately 7-8 head lengths tall. This proportion guide helps artists draw figures accurately.'),
  t(3, '### Drawing from Observation\n\n**Techniques for life drawing:**\n\n| Technique | Description | Purpose |\n|-----------|-------------|--------|\n| **Gesture drawing** | Very quick sketches (30 seconds to 2 minutes) capturing the overall movement and pose | Captures energy and flow |\n| **Contour drawing** | Slow, continuous line following the edges of the subject | Develops careful observation |\n| **Blind contour** | Drawing without looking at the paper, eyes only on the subject | Strengthens hand-eye connection |\n| **Tonal study** | Focus on light and shadow rather than outlines | Understands 3D form |\n| **Extended study** | Detailed drawing over 30+ minutes | Develops all skills together |\n\n**Tips for drawing from observation:**\n- Look at the subject more than at your paper (ratio of 70:30)\n- Start with the largest shapes, then add smaller details\n- Measure proportions using your pencil held at arm\'s length\n- Draw what you actually SEE, not what you think you know\n- Use a full range of tones — from the lightest highlight to the darkest shadow'),
  fb(4, 'A very quick sketch that captures the overall movement of a pose is called a ___ drawing. In life drawing, you should look at the subject ___ than at your paper.',
    ['gesture', 'more'],
    'Gesture drawings are rapid sketches (30 seconds to 2 minutes) that capture movement and energy. Looking at the subject more than the paper ensures accurate observation.'),
  t(5, '### Mixed Media and Experimentation\n\nFor your final artworks, you are encouraged to experiment with **mixed media** — combining different materials and techniques in one artwork.\n\n**Possible combinations:**\n\n| Combination | Effect |\n|-------------|--------|\n| Pencil + watercolour | Detailed drawing with soft colour washes |\n| Collage + drawing | Layered textures with precise line work |\n| Oil pastel + ink wash | Resist effect (oil pastel resists water-based ink) |\n| Printmaking + painting | Printed base with painted additions |\n| Photography + drawing | Real images combined with illustrated elements |\n| Found materials + paint | Textured surface with added colour |\n\n**Experimentation is about:**\n- Trying new combinations without fear of failure\n- Embracing unexpected results\n- Developing a personal artistic style\n- Pushing beyond your comfort zone\n- Learning what different materials can do'),
  q(6, 'An artwork that combines pencil drawing with collage and watercolour paint is an example of:',
    ['Mixed media', 'Monoprint', 'Linocut', 'Scraperboard'], 0,
    'Mixed media is an artwork that combines two or more different materials or techniques, such as drawing, collage, and painting together.'),
  t(7, '### Symbolic Personal Expression: Belonging in the Global World\n\nYour final Grade 9 artwork should express your **personal identity** and sense of **belonging** in both your local community and the wider world.\n\n**Questions to explore through your art:**\n- What makes you who you are? (culture, language, family, interests)\n- How do you connect to your community?\n- How do you connect to the broader global world?\n- What values and beliefs are important to you?\n- What aspects of your identity would you like to celebrate or explore?\n\n**Visual symbols for personal expression:**\n\n| Symbol Category | Examples |\n|----------------|----------|\n| **Cultural identity** | Traditional patterns, national colours, heritage objects |\n| **Personal interests** | Music, sport, nature, technology |\n| **Family and community** | Home, gathering places, family objects |\n| **Global connection** | Maps, communication technology, shared symbols |\n| **Values** | Peace symbols, environmental icons, justice imagery |\n| **Dreams and aspirations** | Stars, pathways, horizons, open doors |\n\n**South African context:**\nSouth Africa\'s identity as the Rainbow Nation means your personal expression can draw on a rich diversity of cultural traditions — Zulu, Xhosa, Sotho, Tswana, Ndebele, Afrikaans, English, Indian, Coloured, and many more communities contribute to the nation\'s visual culture.'),
  q(8, 'An artwork expressing personal identity and belonging would most likely include:',
    ['Symbols representing the artist\'s culture, values, and connections', 'A copy of a famous painting', 'Random shapes with no personal meaning', 'Only text with no images'], 0,
    'Personal expression artworks use symbols, colours, and imagery that represent the artist\'s unique identity, cultural background, values, and sense of belonging.'),
  fb(9, 'South Africa is known as the ___ Nation because of its cultural diversity. An artwork that expresses personal identity might include symbols of the artist\'s ___, values, and connections to the world.',
    ['Rainbow', 'culture'],
    'South Africa is the Rainbow Nation, celebrating its diverse cultural heritage. Personal expression art draws on symbols of culture, identity, and belonging.'),
  t(10, '### Careers in the Visual Arts\n\nStudying Creative Arts opens doors to many career paths:\n\n| Career | Description |\n|--------|-------------|\n| **Fine artist** | Creates paintings, sculptures, and installations for exhibition and sale |\n| **Graphic designer** | Designs logos, posters, websites, and visual communications |\n| **Illustrator** | Creates images for books, magazines, and digital media |\n| **Animator** | Creates animated films, series, and digital content |\n| **Art teacher / lecturer** | Teaches art at schools, colleges, or universities |\n| **Fashion designer** | Designs clothing, textiles, and accessories |\n| **Interior designer** | Plans and decorates interior spaces |\n| **Architect** | Designs buildings and public spaces |\n| **Art curator** | Manages collections and exhibitions in galleries and museums |\n| **Art therapist** | Uses art to help people heal from trauma and mental health challenges |\n| **Film / set designer** | Creates visual environments for film, TV, and theatre |\n| **Photographer** | Captures images for artistic, commercial, or editorial purposes |\n\nSouth Africa has growing creative industries, and the skills you develop in Creative Arts — observation, problem-solving, visual communication, creativity — are valuable in many fields.'),
  q(11, 'An art therapist uses art to:',
    ['Help people heal from trauma and mental health challenges', 'Sell artworks for the highest price', 'Grade students\' artwork', 'Decorate hospital walls'], 0,
    'Art therapy is a recognised field where trained therapists use creative processes to help people process trauma, manage stress, and address mental health challenges.'),
  q(12, 'Critical reflection on your own artwork requires you to:',
    ['Evaluate your artistic choices using correct art terminology', 'Simply say whether you like it or not', 'Copy what other learners have done', 'Avoid discussing your work publicly'], 0,
    'Critical reflection means thoughtfully evaluating your work — discussing which elements and principles you used, why you made specific choices, and how effectively your artwork communicates your intended message.'),
];

// ===============================================================================
// CHAPTER 9: Revision and Exam Preparation (Term 4)
// ===============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\n### Grade 9 Creative Arts Exam Overview\n\nThe Grade 9 Creative Arts written exam tests your knowledge of:\n\n| Topic Area | What You Need to Know |\n|-----------|----------------------|\n| **Art terminology** | Elements of art, principles of design, and correct vocabulary |\n| **Art elements** | Line, shape, colour, texture, tone, space, form — definitions and application |\n| **Design principles** | Balance, contrast, emphasis, pattern, rhythm, unity, proportion |\n| **Art history** | South African artists, art movements, and the role of the artist in society |\n| **Visual literacy** | Interpreting and analysing artworks using formal, content, and contextual analysis |\n| **Symbolic language** | Understanding symbols and symbolic meaning in art |\n| **Careers in art** | Different career paths in the visual arts |\n\n### Cognitive Levels in the Exam\n\n| Level | Percentage | Type of Question |\n|-------|-----------|------------------|\n| **Lower order** | 30% | Recall facts, identify elements, name artists |\n| **Middle order** | 40% | Explain, compare, describe, apply knowledge |\n| **Higher order** | 30% | Analyse, evaluate, interpret, give personal opinion with justification |'),
  q(2, 'What percentage of the Creative Arts exam consists of higher-order questions?',
    ['30%', '40%', '50%', '20%'], 0,
    'Higher-order questions (analyse, evaluate, interpret) make up 30% of the exam. Middle-order questions are the largest group at 40%.'),
  t(3, '### Revision: Elements of Art Summary\n\n| Element | Key Points |\n|---------|------------|\n| **Line** | Types: horizontal (calm), vertical (strength), diagonal (movement), curved (grace), zigzag (excitement). SA example: Esther Mahlangu\'s bold Ndebele lines |\n| **Shape** | Geometric (regular, mathematical) vs organic (irregular, natural). Positive shape = subject; negative shape = background |\n| **Colour** | Primary (R, Y, B), secondary (O, G, V), tertiary. Properties: hue, value, intensity. Complementary = opposite on wheel; analogous = neighbours |\n| **Texture** | Actual (can be felt) vs visual/implied (appears to have texture). Techniques: stippling, cross-hatching, scumbling, blending |\n| **Tone** | Lightness/darkness. Tint = colour + white. Shade = colour + black. Tonal scale from highlight to cast shadow |\n| **Space** | Positive (occupied) and negative (empty). In 3D: volume. Overlapping, size change, and placement suggest depth in 2D |\n| **Form** | 3D shape with height, width, depth. Sphere, cube, cylinder, cone. Created in 2D through tonal shading |'),
  fb(4, 'A tint is created by adding ___ to a colour. Complementary colours are found ___ each other on the colour wheel.',
    ['white', 'opposite'],
    'Adding white creates a tint (lighter version). Complementary colours sit directly opposite each other on the colour wheel.'),
  t(5, '### Revision: Principles of Design Summary\n\n| Principle | Key Points |\n|-----------|------------|\n| **Balance** | Symmetrical (mirror image), asymmetrical (different but visually equal), radial (from centre outward) |\n| **Contrast** | Differences that create interest: light/dark, big/small, rough/smooth, warm/cool |\n| **Emphasis** | Focal point; created through contrast, size, colour, placement, or converging lines |\n| **Pattern** | A motif repeated regularly; found in Zulu beadwork, Ndebele painting, Shweshwe fabric |\n| **Rhythm** | Regular, alternating, progressive, flowing, or random repetition suggesting movement |\n| **Unity** | All parts belong together; achieved through consistent colour, style, and repetition |\n| **Proportion** | Realistic, exaggerated, or hierarchical (most important = largest). Head = 1/8 body height |'),
  q(6, 'In asymmetrical balance, the two sides of a composition are:',
    ['Different but visually balanced', 'Identical mirror images', 'Always the same colour', 'Always the same size'], 0,
    'Asymmetrical (informal) balance uses different elements on each side that are arranged to create a sense of visual equilibrium without being mirror images.'),
  t(7, '### Revision: South African Artists\n\n| Artist | Medium | Known For |\n|--------|--------|----------|\n| **Esther Mahlangu** | Mural painting | Ndebele geometric patterns; painted BMW Art Car; international exhibitions |\n| **William Kentridge** | Charcoal drawing, animation | Apartheid commentary; animated films; global museum exhibitions |\n| **Gerard Sekoto** | Painting | Father of Black SA art; Sophiatown scenes; social realism |\n| **Irma Stern** | Painting | Expressionist portraits; bold colours; African subjects |\n| **Zanele Muholi** | Photography | Self-portraits exploring Black queer identity |\n| **Dumile Feni** | Drawing, sculpture | Expressive figures; political commentary |\n| **John Muafangejo** | Linocut | Powerful black-and-white prints; trained at Rorke\'s Drift |\n| **Helen Martins** | Sculpture (cement, glass) | Owl House in Nieu-Bethesda; outsider art |\n| **Willie Bester** | Assemblage | Sculptures from scrap metal; apartheid themes |\n| **Mbongeni Buthelezi** | Melted plastic | Recycled plastic artworks |\n| **Diane Victor** | Drawing, smoke art | Detailed portraits; smoke drawings on glass |\n| **Mary Sibande** | Sculpture, installation | Domestic worker identity; exhibited globally |'),
  q(8, 'Which artist is known for creating artworks from scrap metal and found objects to comment on apartheid?',
    ['Willie Bester', 'Irma Stern', 'Walter Battiss', 'Gerard Sekoto'], 0,
    'Willie Bester creates assemblage sculptures from scrap metal and found objects, addressing themes of apartheid, poverty, and social inequality.'),
  fb(9, 'Gerard Sekoto is known as the father of ___ South African art. John Muafangejo trained at the ___ Art Centre in KwaZulu-Natal.',
    ['Black', 'Rorke\'s Drift'],
    'Gerard Sekoto is called the father of Black South African art. Rorke\'s Drift Art Centre trained many important Black printmakers during apartheid.'),
  t(10, '### Revision: The Role of the Artist\n\n**In local society:**\n- Contributor (adds beauty and culture)\n- Observer (notices and records)\n- Social commentator (raises awareness)\n- Storyteller (preserves narratives)\n- Healer (art therapy, community projects)\n\n**In global society:**\n- Cultural ambassador (represents national culture internationally)\n- Global commentator (addresses worldwide issues)\n- Bridge builder (connects cultures across language barriers)\n- Change maker (influences public opinion)\n- Preserver of heritage (keeps traditions alive)\n\n### Exam Tips\n\n1. **Use correct art terminology** — not "The colours are nice" but "The artist uses warm analogous colours to create a harmonious mood"\n2. **Refer to specific elements and principles** when analysing artwork\n3. **Name artists and artworks** to support your points\n4. **Give your personal opinion** AND justify it with evidence from the artwork\n5. **Write in full sentences** for longer questions\n6. **Manage your time** — do not spend too long on one question\n7. **Read the question carefully** — underline key instruction words (describe, compare, analyse, evaluate)'),
  q(11, 'Which instruction word requires you to identify similarities AND differences between two artworks?',
    ['Compare', 'Describe', 'Name', 'List'], 0,
    '"Compare" requires you to identify both similarities and differences. "Describe" asks you to say what you see. "Name" and "list" only require identification.'),
  q(12, 'When writing about an artwork in an exam, you should:',
    ['Use correct art terminology and justify your opinion with evidence from the artwork', 'Simply say whether you like it or not', 'Only describe what you see without giving an opinion', 'Copy the question in your answer'], 0,
    'Strong exam answers use correct art terminology (elements, principles, techniques) and back up personal opinions with specific evidence observed in the artwork.'),
];

// ===============================================================================
// MAIN — insert into MongoDB
// ===============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 9
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 9/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 9:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 9', schoolId: SCHOOL_ID, orderIndex: 9,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 9:', String(GRADE_ID));
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
      title: 'Chapter 1: Visual Literacy and the Elements of Art',
      description: 'The seven elements of art (line, shape, colour, texture, tone, space, form), colour theory, and their application in South African art.',
      order: 1,
      lessons: [
        { title: 'Visual Literacy and the Elements of Art', description: 'Line types and expression, geometric and organic shape, colour theory, texture (actual and visual), tone, space, and form with South African art examples.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Principles of Design',
      description: 'The seven principles of design (balance, contrast, emphasis, pattern, rhythm, unity, proportion) and their use in South African art and craft.',
      order: 2,
      lessons: [
        { title: 'Principles of Design', description: 'Balance (symmetrical, asymmetrical, radial), contrast, emphasis, pattern, rhythm, unity, and proportion with SA examples including Ndebele art and Zulu beadwork.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Drawing and Painting — Portraits',
      description: 'Portrait drawing proportions, self-portraits, painting techniques, SA portrait artists, and the role of the artist in local society.',
      order: 3,
      lessons: [
        { title: 'Drawing and Painting: Portraits', description: 'Facial proportions, self-portraits in art history, painting techniques for skin tones, SA artists (Stern, Sekoto, Muholi, Victor, Feni), and the role of the artist in local society.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: South African Sculpture and 3D Art',
      description: 'Three-dimensional art concepts, SA public sculpture, construction and modelling techniques, spatial awareness, and recycled art.',
      order: 4,
      lessons: [
        { title: 'South African Sculpture and 3D Art', description: 'Relief vs free-standing sculpture, SA public sculpture, construction techniques, armature, art elements in 3D, spatial awareness, and recycled art (Bester, Buthelezi).', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: 2D Art — Still Life, Logos, and South African Motifs',
      description: 'Still life composition and technique, logo design, South African motifs, lettering and typography, and design processes.',
      order: 5,
      lessons: [
        { title: 'Still Life, Logos, and South African Motifs', description: 'Still life painting techniques, colour mixing, logo design principles, SA motifs (Ndebele, Zulu, protea), lettering, typography, and the design process.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Printmaking and Social Comment in Art',
      description: 'Printmaking techniques (linocut, scraperboard, etching), SA printmakers and Rorke\'s Drift, resistance art, and creating social commentary artworks.',
      order: 6,
      lessons: [
        { title: 'Printmaking and Social Comment in Art', description: 'Linocut step-by-step, SA printmakers (Muafangejo, Mbatha, Shilakoe), Rorke\'s Drift Art Centre, resistance art, symbolic language, and creating social comment artworks.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Design for Popular Culture',
      description: 'Art in everyday life, SA pop culture art, CD cover and wallpaper design, scraperboard technique, and the role of the artist in global society.',
      order: 7,
      lessons: [
        { title: 'Design for Popular Culture', description: 'Pop culture and visual art, SA artists in pop culture (Faith47, Falko One, Moletsane, Ngxokolo), graphic design principles, scraperboard technique, and the artist in global society.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: 3D Puppet-Making and Life Drawing',
      description: 'Puppet types and construction, puppetry as social commentary, life drawing fundamentals, mixed media, symbolic personal expression, and art careers.',
      order: 8,
      lessons: [
        { title: '3D Art: Puppet-Making', description: 'Types of puppets, SA puppetry (Handspring Puppet Company), puppet construction techniques, puppets as social commentary, and spatial awareness in 3D.', blocks: ch8_lesson1, term: 4 },
        { title: 'Life Drawing and Symbolic Personal Expression', description: 'Life drawing techniques, human body proportions, mixed media experimentation, symbolic personal expression, belonging in the global world, and careers in visual arts.', blocks: ch8_lesson2, term: 4 },
      ],
    },
    {
      title: 'Chapter 9: Revision and Exam Preparation',
      description: 'Comprehensive revision of all Grade 9 Creative Arts (Visual Art) topics: elements, principles, SA artists, art history, visual literacy, and exam technique.',
      order: 9,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Full revision covering elements of art, principles of design, South African artists, the role of the artist, visual literacy analysis, and exam writing tips.', blocks: ch9_lesson1, term: 4 },
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
    title: 'Grade 9 Creative Arts \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Visual Literacy, Elements of Art, Principles of Design, Portraits, South African Sculpture, Still Life and Logo Design, Printmaking and Social Comment, Design for Popular Culture, Puppet-Making, Life Drawing, and Symbolic Personal Expression for the Grade 9 Creative Arts (Visual Art) curriculum.',
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
  console.log('  TEXTBOOK: Grade 9 Creative Arts');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
