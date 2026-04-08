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
  t(1, '## Visual Literacy and the Elements of Art\n\nVisual literacy is the ability to **read**, **understand**, and **create** visual images. In Grade 8 Creative Arts, you will learn the building blocks that artists use to create artworks. These building blocks are called the **elements of art**.\n\n### Why Visual Literacy Matters\n\nEvery day you are surrounded by visual messages — advertisements, signs, social media posts, clothing designs, and artworks. Being visually literate means you can:\n- Understand what an image communicates\n- Describe artworks using correct terminology\n- Make informed decisions when creating your own art\n- Appreciate the skill and intention behind visual creations\n\n### The Seven Elements of Art\n\n| Element | Definition | Example |\n|---------|-----------|--------|\n| **Line** | A mark made by a moving point | The bold outlines in Esther Mahlangu\'s Ndebele murals |\n| **Shape** | A flat, enclosed area with height and width | Geometric triangles in Zulu beadwork |\n| **Colour** | Produced when light reflects off an object; has hue, value, and intensity | The warm ochres in San rock paintings |\n| **Texture** | The surface quality — how something feels or appears to feel | The rough charcoal marks of William Kentridge |\n| **Tone (Value)** | The lightness or darkness of a colour | Shading on a pencil drawing to show 3D form |\n| **Space** | The area around, between, or within objects | Negative space in a carved wooden mask |\n| **Form** | A three-dimensional shape with height, width, and depth | A Venda clay pot |'),
  q(2, 'Visual literacy is best described as the ability to:',
    ['Read, understand, and create visual images', 'Read books about art', 'Paint realistic pictures', 'Visit art galleries'], 0,
    'Visual literacy means being able to read (interpret), understand, and create visual images — not just written text.'),
  t(3, '### Line — The Most Basic Element\n\nEvery artwork begins with a line. A line is a mark made by a moving point — it can be drawn with a pencil, painted with a brush, scratched into a surface, or even implied.\n\n**Types of line and their character:**\n\n| Line Type | Character / Mood |\n|-----------|------------------|\n| **Horizontal** | Calm, restful, stable |\n| **Vertical** | Strength, dignity, height |\n| **Diagonal** | Movement, energy, tension |\n| **Curved** | Grace, softness, natural forms |\n| **Zigzag** | Excitement, nervousness |\n| **Thick / bold** | Strength, emphasis |\n| **Thin / fine** | Delicacy, detail |\n| **Implied** | Suggested by edges or the viewer\'s eye |\n\n**Line in South African art:**\n- **Esther Mahlangu** uses bold, straight lines in her Ndebele mural paintings to create geometric patterns with deep cultural meaning\n- **San rock art** uses fine, detailed outlines of animals and human figures painted with natural pigments\n- **William Kentridge** uses expressive, gestural charcoal lines to convey emotion and political ideas'),
  q(4, 'A diagonal line in an artwork creates a feeling of:',
    ['Movement and energy', 'Calm and rest', 'Delicacy and detail', 'Strength and dignity'], 0,
    'Diagonal lines suggest movement, energy, and tension. They feel dynamic because they appear to be falling or rising.'),
  fb(5, 'An ___ line is not physically drawn but is suggested by edges or by the viewer\'s eye connecting points. Esther Mahlangu is famous for her ___ mural paintings.',
    ['implied', 'Ndebele'],
    'Implied lines are suggested rather than physically drawn. Esther Mahlangu is celebrated for her bold, geometric Ndebele mural paintings.'),
  t(6, '### Shape: Geometric and Organic\n\nA shape is a flat, enclosed area defined by line, colour, or value.\n\n**Geometric shapes** are regular, mathematical shapes:\n- Circle, square, triangle, rectangle, diamond, hexagon\n- They appear precise, orderly, and man-made\n\n**Organic shapes** (also called free-form shapes) are irregular and natural:\n- Leaves, clouds, pebbles, puddles\n- They appear soft, flowing, and natural\n\n**Shape in South African art:**\n- **Ndebele house painting** uses bold geometric shapes — triangles, diamonds, and rectangles arranged in symmetrical patterns\n- **Zulu basket weaving** (isichumo) combines geometric shapes into complex repeating patterns\n- The **Mapungubwe Gold Rhino** uses simplified organic forms to represent a rhinoceros\n\n### Positive and Negative Shape\n\n- **Positive shape**: The main subject in the artwork\n- **Negative shape**: The empty space around and between the subject(s)\n\nGood artists think about both positive and negative shapes to create balanced compositions.'),
  q(7, 'A triangle is an example of a:',
    ['Geometric shape', 'Organic shape', 'Free-form shape', 'Natural shape'], 0,
    'A triangle is a geometric shape because it is regular and mathematical. Organic (free-form) shapes are irregular and found in nature.'),
  t(8, '### Colour Theory Basics\n\nColour is one of the most powerful elements of art.\n\n**The Colour Wheel:**\n\n| Category | Colours | How They Are Made |\n|----------|---------|-------------------|\n| **Primary** | Red, Yellow, Blue | Cannot be mixed from other colours |\n| **Secondary** | Orange, Green, Violet | Two primary colours mixed together |\n| **Tertiary** | Red-orange, Yellow-green, Blue-violet, etc. | A primary mixed with an adjacent secondary |\n\n**Colour Properties:**\n\n| Property | Meaning |\n|----------|--------|\n| **Hue** | The name of the colour (red, blue, etc.) |\n| **Value** | How light or dark the colour is |\n| **Intensity** | How bright or dull the colour is |\n\n**Colour Relationships:**\n- **Complementary** — opposite on the colour wheel (e.g., red and green); create strong contrast\n- **Analogous** — next to each other on the colour wheel (e.g., blue, blue-green, green); create harmony\n- **Warm colours** (red, orange, yellow) — feel energetic, advance towards the viewer\n- **Cool colours** (blue, green, violet) — feel calm, recede from the viewer'),
  q(9, 'Which pair of colours are complementary?',
    ['Red and green', 'Red and orange', 'Blue and green', 'Yellow and orange'], 0,
    'Red and green are complementary colours because they sit directly opposite each other on the colour wheel.',
    ['Complementary colours are found opposite each other on the colour wheel.']),
  fb(10, 'The three primary colours are ___, yellow, and blue. Mixing two primary colours together creates a ___ colour.',
    ['red', 'secondary'],
    'The primary colours are red, yellow, and blue. When two primaries are mixed, they produce a secondary colour (orange, green, or violet).'),
  t(11, '### Texture and Tone\n\n**Texture** is the surface quality of an object — how it feels or appears to feel.\n\n| Texture Type | Description | Example |\n|-------------|-------------|--------|\n| **Actual (tactile)** | Can be physically felt | The rough surface of a clay pot |\n| **Visual (implied)** | Created through drawing techniques to look like a texture | Cross-hatching to suggest rough bark |\n\n**Techniques for creating visual texture:**\n- **Stippling** — using dots\n- **Cross-hatching** — overlapping lines\n- **Scumbling** — scribbled circular marks\n- **Blending** — smooth gradual transitions\n\n**Tone (Value)** is how light or dark a colour is. Tone is essential for creating the illusion of three-dimensional form on a flat surface.\n\n| Tonal Term | Meaning |\n|------------|--------|\n| **Highlight** | Lightest area where light hits directly |\n| **Mid-tone** | Medium lightness |\n| **Shadow** | Darkest area, away from the light source |\n| **Cast shadow** | Shadow the object throws onto a nearby surface |\n\n**Creating tonal range:**\n- **Tint** = colour + white (lighter)\n- **Shade** = colour + black (darker)'),
  q(12, 'What is the difference between actual texture and visual texture?',
    ['Actual texture can be physically felt; visual texture only appears to have a surface quality', 'Visual texture is always rougher than actual texture', 'Actual texture is only found in paintings', 'There is no difference'], 0,
    'Actual (tactile) texture is physically present and can be felt. Visual (implied) texture is created by art techniques to make a surface appear textured.'),
];

// ===============================================================================
// CHAPTER 2: Principles of Design (Term 1)
// ===============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Principles of Design\n\nThe **elements of art** are the building blocks of any artwork. The **principles of design** are the guidelines for arranging those elements effectively. Think of the elements as ingredients and the principles as the recipe.\n\n### The Key Principles of Design\n\n| Principle | Definition |\n|-----------|------------|\n| **Balance** | The visual distribution of weight in a composition |\n| **Contrast** | Using differences to create visual interest |\n| **Emphasis** | Making one part of the artwork stand out as the focal point |\n| **Proportion** | The size relationship between parts of the artwork |\n| **Pattern** | A repeating element or motif |\n| **Rhythm** | A sense of movement through repetition of elements |\n| **Unity (Harmony)** | All parts of the artwork work together as a whole |'),
  q(2, 'The principles of design are best described as:',
    ['Guidelines for arranging the elements of art', 'The building blocks of art', 'Types of paint and brushes', 'Colours on the colour wheel'], 0,
    'The principles of design (balance, contrast, emphasis, etc.) are guidelines that tell artists how to arrange the elements of art (line, shape, colour, etc.) effectively.'),
  t(3, '### Balance\n\nBalance refers to how visual weight is distributed in a composition.\n\n**Types of balance:**\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Symmetrical (formal)** | Both sides are mirror images; creates stability | The symmetrical patterns in Ndebele house painting |\n| **Asymmetrical (informal)** | Sides are different but visually balanced; creates energy | A large dark shape balanced by several smaller light shapes |\n| **Radial** | Elements radiate outward from a central point | A Zulu shield design radiating from the centre |\n\n### Contrast\n\nContrast creates visual excitement by placing opposing elements together:\n\n| Type of Contrast | Example |\n|-----------------|--------|\n| **Light vs dark** | Tonal contrast in a charcoal drawing |\n| **Large vs small** | A large figure next to a small one |\n| **Rough vs smooth** | Textured areas next to smooth areas |\n| **Warm vs cool** | Warm reds beside cool blues |\n| **Geometric vs organic** | Sharp squares beside flowing curves |'),
  q(4, 'Asymmetrical balance means the two sides of a composition are:',
    ['Different but visually balanced', 'Identical mirror images', 'Completely random', 'Always the same colour'], 0,
    'Asymmetrical (informal) balance uses different elements on each side, arranged so they feel visually equal without being mirror images.'),
  fb(5, 'When both sides of a composition are mirror images, this is called ___ balance. ___ creates visual excitement by placing opposing elements together.',
    ['symmetrical', 'Contrast'],
    'Symmetrical (formal) balance has identical halves. Contrast uses differences (light/dark, big/small, rough/smooth) to create visual interest.'),
  t(6, '### Emphasis and Proportion\n\n**Emphasis** (also called **focal point**) is the area of the artwork that draws the viewer\'s eye first. Artists create emphasis through:\n- Using a contrasting colour or tone\n- Making the subject larger or more detailed\n- Placing the subject at a key position\n- Using lines that lead the eye to the focal point\n\n**Proportion** refers to the size relationship between parts of an artwork.\n\n| Proportion Type | Description |\n|----------------|------------|\n| **Realistic** | Parts are sized as they appear in real life |\n| **Exaggerated** | Parts are deliberately enlarged for emphasis |\n| **Hierarchical** | The most important figure is shown largest |\n\n**South African example:**\nIn traditional African sculpture, the head is often shown larger than realistic proportion. This is **hierarchical proportion** — a deliberate artistic choice showing that the head represents wisdom, leadership, and spiritual importance.'),
  q(7, 'The area of an artwork that draws the viewer\'s eye first is called the:',
    ['Focal point (emphasis)', 'Background', 'Frame', 'Texture'], 0,
    'The focal point is the area of emphasis that attracts the viewer\'s eye first. Artists use contrast, size, colour, and placement to create it.'),
  t(8, '### Pattern and Rhythm\n\n**Pattern** is created when a motif (design element) is repeated in a regular, predictable way.\n\n**Rhythm** is created when elements are repeated to suggest movement. Unlike pattern, rhythm can vary.\n\n**Types of rhythm:**\n\n| Type | Description |\n|------|-------------|\n| **Regular** | Same element at equal intervals (like a heartbeat) |\n| **Alternating** | Two or more elements in a set sequence (ABABAB) |\n| **Progressive** | An element that gradually changes (getting bigger) |\n| **Flowing** | Smooth, curving repetition (like waves) |\n| **Random** | Irregular repetition with no set pattern |\n\n**South African examples of pattern:**\n- **Zulu beadwork** (ubuhlalu) uses complex patterns where different colours carry specific meanings — white for purity, red for passion, blue for faithfulness\n- **Shweshwe fabric** features intricate, repeating geometric patterns and is a traditional South African cotton textile\n- **Ndebele wall painting** uses geometric patterns with cultural significance'),
  q(9, 'In Zulu beadwork, different colours carry:',
    ['Specific symbolic meanings', 'No particular meaning', 'The same meaning', 'Meanings that change every year'], 0,
    'Zulu beadwork uses a colour-coding system. Each colour has a symbolic meaning: white for purity and love, red for passion and strong emotion, blue for faithfulness, and so on.'),
  fb(10, 'A motif repeated in a regular, predictable way creates ___. Rhythm that involves two or more elements repeated in a sequence like ABABAB is called ___ rhythm.',
    ['pattern', 'alternating'],
    'Pattern comes from regular repetition of a motif. Alternating rhythm repeats two or more elements in a predictable sequence.'),
  t(11, '### Unity\n\n**Unity (Harmony)** means all parts of the artwork feel like they belong together. An artwork has unity when:\n- Colours are harmonious (e.g., analogous colour scheme)\n- Elements are repeated throughout the composition\n- There is a consistent style or technique\n- The overall effect is cohesive, not chaotic\n\n**How to achieve unity in your artwork:**\n1. Use a limited colour palette (3-5 colours work well)\n2. Repeat shapes, lines, or textures throughout the composition\n3. Use consistent line quality\n4. Ensure all parts relate to the overall theme\n\n**South African example:**\nA traditional Ndebele mural achieves unity through the consistent use of bold black outlines, a limited palette of primary colours, and the repetition of geometric shapes across the entire wall surface.'),
  q(12, 'An artwork has unity when:',
    ['All parts feel like they belong together', 'Every element is a different style', 'The colours clash with each other', 'There is no focal point'], 0,
    'Unity (harmony) means all parts of the artwork work together cohesively. This is achieved through consistent colour, style, repetition, and a clear overall theme.'),
];

// ===============================================================================
// CHAPTER 3: Creative Lettering and Popular Culture (Term 1)
// ===============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Creative Lettering in Popular Culture\n\nLettering is everywhere in the visual world — on shop signs, posters, album covers, clothing brands, street art, and social media. In this chapter, you learn how artists use lettering as a creative visual element, especially in **popular culture**.\n\n### What is Popular Culture?\n\nPopular culture (pop culture) refers to the ideas, images, and products that are widely shared in everyday life:\n- Music and album art\n- Social media and memes\n- Advertising and branding\n- Street art and graffiti\n- Fashion and clothing design\n- Cell phone graphics and app design\n\n### Lettering as Art\n\nLettering is not just about writing words — it is about using letters as **visual elements** that communicate meaning through their style, size, colour, and arrangement.\n\n| Lettering Style | Character |\n|----------------|----------|\n| **Bold / block letters** | Strong, powerful, attention-grabbing |\n| **Script / cursive** | Elegant, flowing, personal |\n| **Serif** | Traditional, formal, authoritative |\n| **Sans-serif** | Modern, clean, minimal |\n| **Hand-drawn** | Personal, unique, creative |\n| **Graffiti style** | Urban, energetic, rebellious |'),
  q(2, 'In visual art, lettering is important because:',
    ['Letters can communicate meaning through their style, size, and arrangement', 'Lettering is the only element of art', 'Lettering replaces the need for images', 'Letters always look the same'], 0,
    'Creative lettering treats letters as visual elements. The style, size, colour, and arrangement of letters communicate mood and meaning beyond the words themselves.'),
  t(3, '### Graffiti as Visual Culture\n\nGraffiti is a form of visual art made in public spaces. While illegal graffiti (vandalism) is a crime, many cities around the world — including in South Africa — have embraced **legal graffiti and street art** as a way to beautify communities and express cultural identity.\n\n**Key graffiti and street art terms:**\n\n| Term | Meaning |\n|------|--------|\n| **Tag** | A stylised signature or name |\n| **Throw-up** | A quick, simple two-colour design |\n| **Piece** | A large, elaborate, multi-coloured graffiti work |\n| **Mural** | A large painting on a wall, often commissioned |\n| **Stencil** | A design cut from a template and sprayed |\n| **Wheatpaste** | A poster glued to a wall |\n\n**South African street artists:**\n- **Faith47** — large-scale murals in Cape Town and Johannesburg exploring social justice and identity\n- **Falko One** — playful, colourful animal characters painted on township walls in Cape Town\n- **Freddy Sam** — painterly murals celebrating community and heritage\n- The **Maboneng Precinct** in Johannesburg features extensive street art that has revitalised the neighbourhood'),
  q(4, 'A large, elaborate, multi-coloured graffiti artwork is called a:',
    ['Piece', 'Tag', 'Throw-up', 'Stencil'], 0,
    'A "piece" (short for masterpiece) is a large, detailed, multi-coloured graffiti work that demonstrates high skill and creativity.'),
  fb(5, 'A ___ is a stylised signature or name used in graffiti art. The South African street artist ___ is known for painting playful animal characters on township walls.',
    ['tag', 'Falko One'],
    'A tag is the artist\'s stylised name — the most basic form of graffiti. Falko One creates whimsical, colourful animal characters in Cape Town townships.'),
  t(6, '### Values Development Through Visual Culture\n\nWhen we study lettering, graffiti, and visual culture, we also explore **values** — the beliefs and attitudes that guide behaviour.\n\n**Important values in art and society:**\n\n| Value | How It Connects to Art |\n|-------|----------------------|\n| **Respect** | Respecting other people\'s artwork, opinions, and property |\n| **Responsibility** | Taking care of shared art materials; not vandalising public spaces |\n| **Freedom of expression** | Expressing ideas and opinions through art |\n| **Cultural sensitivity** | Appreciating and respecting art from all cultures |\n| **Environmental awareness** | Using recycled materials; not littering with art supplies |\n\n**Discussion: Graffiti — Art or Vandalism?**\n\nGraffiti raises important questions about values:\n- Is graffiti on someone else\'s property without permission acceptable?\n- When does graffiti become art?\n- How can street art benefit a community?\n- What is the difference between a commissioned mural and illegal tagging?\n\nIn South Africa, many communities have embraced legal street art projects that give artists a space to express themselves while beautifying public areas.'),
  q(7, 'The main difference between legal street art and vandalism is:',
    ['Legal street art has permission from the property owner', 'Legal street art uses more colours', 'Vandalism is always more creative', 'There is no difference'], 0,
    'The key distinction is permission. Legal street art and murals are created with the consent of the property owner or community, while vandalism involves defacing property without permission.'),
  t(8, '### Personal Expression Through Lettering\n\nLettering in popular culture is used to express identity, mood, and messages. Your task is to engage with these ideas through looking, talking, and making.\n\n**Steps for creating creative lettering:**\n\n1. **Choose your word or phrase** — something meaningful to you\n2. **Research lettering styles** — look at posters, logos, album covers, and graffiti art\n3. **Thumbnail sketches** — create at least 8-10 small, quick ideas\n4. **Select and refine** — develop your best 2-3 ideas in more detail\n5. **Apply art elements** — consider line quality, shape, colour, and texture\n6. **Apply design principles** — think about balance, emphasis, contrast, and unity\n7. **Final artwork** — create a polished lettering piece using pencil, colour, and media of your choice\n\n**Tips for effective lettering design:**\n- The style of the letters should match the mood of the word (e.g., sharp angular letters for "DANGER")\n- Use contrast to make your lettering stand out (dark on light or light on dark)\n- Consider positive and negative space around your letters\n- Add decoration, patterns, or images that enhance the meaning'),
  fb(9, 'Small, quick preliminary drawings used to explore ideas are called ___ sketches. The style of lettering should match the ___ of the word it spells.',
    ['thumbnail', 'mood'],
    'Thumbnail sketches are small, fast exploratory drawings. Matching the lettering style to the word\'s mood strengthens the visual message.'),
  t(10, '### Lettering and Media Exploration\n\nFor your Term 1 practical activities, you will explore different media for creating lettering and artwork:\n\n| Medium | Characteristics |\n|--------|----------------|\n| **Pencil (graphite)** | Fine detail, tonal range, easy to erase and refine |\n| **Charcoal** | Bold, dark marks; expressive and dramatic |\n| **Wax crayons** | Bright colours, waxy resist effect |\n| **Colour pencils** | Controlled colour application, blendable |\n| **Oil pastels** | Vibrant, thick colour, blendable |\n| **Marker pens** | Bold, graphic lines; good for lettering |\n| **Collage** | Cut and pasted paper, magazines, fabric |\n\n**Mark-making techniques to explore:**\n- Drawing, cutting, pasting, sticking shapes in series\n- Pattern-making using repeated shapes and lines\n- Combining text with images in compositions\n\n**Assessment focus:**\nYour Term 1 practical assessment (2D artwork, 25 marks) should demonstrate your understanding of art elements and design principles applied to creative lettering or a composition inspired by popular culture.'),
  q(11, 'Which medium would be most effective for creating bold, graphic lettering?',
    ['Marker pens', 'Watercolour', 'Light pencil', 'Chalk pastel'], 0,
    'Marker pens produce bold, graphic lines with strong contrast, making them ideal for lettering work. Their consistent, opaque lines create clear, readable designs.'),
  q(12, 'In your Term 1 practical, your artwork should demonstrate understanding of:',
    ['Art elements and design principles', 'Only colour mixing', 'Only pencil drawing', 'Copying another artist\'s work exactly'], 0,
    'Your practical assessment is evaluated on how well you apply art elements (line, shape, colour, texture, tone) and design principles (balance, contrast, emphasis, unity, proportion) in your artwork.'),
];

// ===============================================================================
// CHAPTER 4: Drawing and Painting — Societal Issues (Term 2)
// ===============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Drawing and Painting: Societal Issues\n\nIn Term 2, you will create **2D artworks** (drawings and paintings) inspired by **societal issues** — topics that affect communities in South Africa and the world. You will practise using art elements and design principles to communicate powerful visual messages.\n\n### Art and Society\n\nArt has always been used to respond to what is happening in society. South African art, in particular, has a strong tradition of addressing real-world issues.\n\n**Societal issues that artists explore:**\n\n| Issue | How Artists Respond |\n|-------|--------------------|\n| **Poverty and inequality** | Depicting the reality of life in disadvantaged communities |\n| **Environmental destruction** | Showing the impact of pollution, deforestation, and climate change |\n| **Gender-based violence** | Raising awareness and supporting survivors |\n| **Cultural heritage** | Preserving and celebrating traditional art, language, and customs |\n| **Education** | Highlighting the importance of access to quality education |\n| **Xenophobia** | Promoting tolerance and understanding across cultures |\n| **Water and food security** | Drawing attention to these basic human needs |\n\n### South African Artists Who Address Societal Issues\n\n| Artist | Medium | Issue Addressed |\n|--------|--------|----------------|\n| **William Kentridge** | Charcoal drawing, animation | Apartheid, memory, inequality |\n| **Willie Bester** | Assemblage (scrap metal) | Poverty, displacement, apartheid |\n| **Diane Victor** | Drawing, smoke art | Social injustice, identity |\n| **Mary Sibande** | Sculpture, photography | Domestic worker identity, race |\n| **Zanele Muholi** | Photography | LGBTQ+ identity, representation |'),
  q(2, 'South African art has a strong tradition of:',
    ['Addressing real-world societal issues', 'Only painting landscapes', 'Avoiding controversial topics', 'Copying European art styles'], 0,
    'South African art has a powerful tradition of engaging with societal issues, from apartheid resistance art to contemporary works addressing inequality, identity, and social justice.'),
  t(3, '### Planning Your 2D Artwork on a Societal Issue\n\nBefore you start drawing or painting, you must plan carefully.\n\n**Step 1: Choose your issue**\nSelect a societal issue that is important to you and your community.\n\n**Step 2: Research and collect resources**\n- Gather photographs, magazine images, and information about your topic\n- Look at how other artists have represented similar issues\n- Collect visual references for your composition\n\n**Step 3: Make preliminary drawings and sketches**\n- Create thumbnail sketches exploring different compositions\n- Experiment with how to represent your message visually\n- Consider the use of symbols, metaphors, and visual storytelling\n\n**Step 4: Select and develop your final composition**\n- Choose your strongest idea and create a larger, more detailed sketch\n- Decide on your colour palette and media\n- Plan where the focal point will be\n\n**Step 5: Create the final artwork**\n- Work from large shapes to small details\n- Apply the art elements and design principles you have learned\n- Use a full range of tonal values'),
  q(4, 'Why should an artist create preliminary sketches before starting a final artwork?',
    ['To explore different ideas and find the strongest composition', 'Because the teacher demands it', 'To waste time', 'Because final artworks always fail'], 0,
    'Preliminary sketches allow the artist to experiment with different compositions, ideas, and arrangements before committing to a final version. This leads to stronger, more considered artworks.'),
  fb(5, 'Small, quick sketches used to explore different composition ideas are called ___ sketches. The area of an artwork that first attracts the viewer\'s eye is the ___ point.',
    ['thumbnail', 'focal'],
    'Thumbnail sketches are small, rapid exploratory drawings. The focal point (emphasis) is where the viewer\'s eye is drawn first.'),
  t(6, '### Art Elements in Drawing on Societal Issues\n\nWhen creating a 2D artwork about a societal issue, use the elements of art deliberately to strengthen your message:\n\n| Element | Application for Social Comment |\n|---------|-------------------------------|\n| **Line** | Bold, aggressive lines can show anger; soft, broken lines can show vulnerability |\n| **Shape** | Sharp, angular shapes suggest conflict; rounded organic shapes suggest harmony |\n| **Colour** | Dark, muted colours suggest sadness; bright colours suggest hope or energy |\n| **Tone** | Strong tonal contrast creates drama and draws attention |\n| **Texture** | Rough textures suggest harshness; smooth textures suggest calm |\n| **Space** | Crowded compositions suggest chaos; open space suggests freedom or loneliness |\n\n**Complementary colour for mood:**\n- Warm earth tones (ochres, siennas, umbers) connect to the African landscape\n- Cool blues and greys suggest sadness, isolation\n- Bright, saturated colours suggest energy, hope, celebration\n- Monochromatic (one-colour) schemes create unity and focus'),
  q(7, 'Dark, muted colours in an artwork about a societal issue typically suggest:',
    ['Sadness or seriousness', 'Happiness and celebration', 'Humour and playfulness', 'Confusion and chaos'], 0,
    'Dark, muted colours are often associated with sadness, seriousness, and gravity. Artists choose colours deliberately to reinforce the emotional message of their work.'),
  t(8, '### Images as Symbols\n\nArtists use **symbols** — visual images that represent ideas or concepts — to communicate meaning in their artworks.\n\n**Common symbols in art:**\n\n| Symbol | Common Meaning |\n|--------|----------------|\n| **Dove** | Peace |\n| **Broken chain** | Freedom from oppression |\n| **Raised fist** | Solidarity, resistance, power |\n| **Tree / plant** | Growth, life, the environment |\n| **Barbed wire** | Imprisonment, restriction |\n| **Open hands** | Giving, receiving, welcome |\n| **Bridge** | Connection, overcoming barriers |\n| **Water** | Life, renewal, cleansing |\n| **Fire** | Destruction, passion, transformation |\n| **Sun** | Hope, new beginnings, warmth |\n\n**How to use symbols in your artwork:**\n- Choose symbols that relate directly to your chosen societal issue\n- Combine symbols with realistic imagery for a layered message\n- Consider cultural context — some symbols have different meanings in different cultures\n- You can create your own personal symbols that carry meaning for you'),
  fb(9, 'A visual image that represents an idea or concept is called a ___. A dove is a widely recognised symbol of ___.',
    ['symbol', 'peace'],
    'Symbols are visual images with deeper meaning. The dove is internationally recognised as a symbol of peace.'),
  q(10, 'When using symbols in artwork, it is important to:',
    ['Consider cultural context because symbols can mean different things in different cultures', 'Use as many symbols as possible regardless of relevance', 'Only use symbols from European art', 'Avoid symbols entirely'], 0,
    'Cultural context matters because the same symbol can carry different meanings in different cultures. Choose symbols that are relevant and appropriate for your audience and message.'),
  t(11, '### Design Principles for Social Comment Artworks\n\nApply the principles of design to make your societal-issue artwork more effective:\n\n| Principle | How to Apply |\n|-----------|-------------|\n| **Emphasis** | Make the main subject or message the clear focal point |\n| **Contrast** | Use strong tonal or colour contrast to create drama |\n| **Balance** | Decide whether symmetrical balance (order) or asymmetrical balance (tension) better suits your message |\n| **Unity** | Ensure all elements work together to support one clear message |\n| **Proportion** | Exaggerate the size of important elements for impact |\n\n**Assessment: Term 2 — 2D Artwork (25 marks)**\n\nYour 2D practical artwork about a societal issue will be assessed on:\n- Understanding and application of art elements\n- Application of design principles\n- Quality of craftsmanship and technique\n- Effective communication of your chosen message\n- Evidence of planning (thumbnail sketches and preliminary drawings)'),
  q(12, 'Using exaggerated proportion in an artwork about poverty could mean:',
    ['Making the most important figure or element much larger than realistic size', 'Drawing everything the same size', 'Only drawing small objects', 'Leaving the composition empty'], 0,
    'Exaggerated proportion deliberately enlarges key elements to draw attention and create emotional impact. This is a powerful technique for social comment art.'),
];

// ===============================================================================
// CHAPTER 5: Fashion Design — 3D Art (Term 2)
// ===============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Fashion Design: 3D Art\n\nIn the second part of Term 2, you create a **3D artwork** inspired by **fashion design**. Fashion is a form of visual art that combines art elements and design principles with functional purpose — clothing, accessories, and textiles that people wear.\n\n### Understanding Fashion as Art\n\nFashion design uses the same elements and principles as fine art:\n\n| Art Element | Fashion Application |\n|------------|--------------------|\n| **Line** | Seam lines, hemlines, necklines, decorative stitching |\n| **Shape** | Silhouette of the garment (A-line, fitted, flared) |\n| **Colour** | Fabric colour, colour combinations, seasonal palettes |\n| **Texture** | Fabric texture (silk = smooth; denim = rough; lace = delicate) |\n| **Pattern** | Printed or woven patterns on fabric |\n\n| Design Principle | Fashion Application |\n|-----------------|--------------------|\n| **Balance** | Symmetrical or asymmetrical garment design |\n| **Emphasis** | Focal point (a bold neckline, a bright belt) |\n| **Proportion** | Relationship between bodice length and skirt length |\n| **Unity** | All parts of the outfit work together |\n| **Contrast** | Mixing textures, colours, or styles |'),
  q(2, 'Which art element in fashion design relates to the overall outline of a garment?',
    ['Shape (silhouette)', 'Colour', 'Texture', 'Tone'], 0,
    'The shape or silhouette of a garment is its overall outline — A-line, fitted, flared, or oversized. This is one of the most important design decisions in fashion.'),
  t(3, '### South African Fashion Design\n\nSouth Africa has a vibrant and growing fashion industry that blends traditional heritage with modern design.\n\n**Important South African fashion designers and textile traditions:**\n\n| Designer / Tradition | Description |\n|---------------------|------------|\n| **Laduma Ngxokolo (MaXhosa)** | Knitwear inspired by Xhosa beadwork patterns; shown at international fashion weeks |\n| **Thebe Magugu** | Won the prestigious LVMH Prize (2019); blends African identity with contemporary fashion |\n| **Shweshwe fabric** | Traditional indigo-dyed cotton fabric with geometric patterns; originally German, now distinctly South African |\n| **Ndebele beadwork** | Colourful beaded garments worn for ceremonies; geometric patterns with cultural meaning |\n| **Zulu beadwork** | Intricate beaded accessories and garments; colour symbolism communicates messages |\n| **Xhosa blankets** | Traditional blankets worn as garments; patterns and colours indicate status and life stage |\n| **Venda thavha** | Traditional skirts and accessories with symbolic meaning |\n\n**The fashion industry offers many career paths:**\n- Fashion designer, textile designer, fashion illustrator, stylist, pattern-maker, costume designer, fashion journalist, fashion buyer'),
  q(4, 'Which South African designer won the LVMH Prize in 2019?',
    ['Thebe Magugu', 'Laduma Ngxokolo', 'Esther Mahlangu', 'David Tlale'], 0,
    'Thebe Magugu became the first African designer to win the prestigious LVMH Prize in 2019, bringing international recognition to South African fashion design.'),
  fb(5, 'MaXhosa knitwear by Laduma Ngxokolo is inspired by ___ beadwork patterns. Shweshwe is a traditional South African ___ fabric with geometric patterns.',
    ['Xhosa', 'cotton'],
    'Laduma Ngxokolo draws on Xhosa beadwork traditions for his MaXhosa knitwear designs. Shweshwe is a printed cotton fabric that has become a distinctly South African textile.'),
  t(6, '### Creating a 3D Fashion Object\n\nFor your Term 2 3D practical, you will create a **functional container** inspired by fashion design — such as a pinch pot with a lid, decorated using art elements and design principles.\n\n**3D construction techniques:**\n\n| Technique | Description |\n|-----------|-------------|\n| **Pinching** | Shaping clay by pressing and pinching with fingers |\n| **Coiling** | Building up form using rolls (coils) of clay |\n| **Slab building** | Constructing from flat sheets of clay |\n| **Joining** | Connecting clay pieces using the score-and-slip method |\n| **Rolling** | Creating even sheets with a rolling pin |\n| **Surface decoration** | Adding texture, pattern, and colour to the surface |\n\n**Craft skills to develop:**\n- Modelling techniques: pinching, rolling, joining\n- Surface decoration: scratching, stamping, impressing patterns\n- Painting and glazing\n- Good craftsmanship: neat, controlled, well-finished work'),
  q(7, 'The score-and-slip method is used to:',
    ['Join two pieces of clay together', 'Smooth the surface of clay', 'Add colour to clay', 'Dry clay faster'], 0,
    'Score-and-slip involves scratching (scoring) the surfaces to be joined and applying liquid clay (slip) as an adhesive. This creates a strong bond between clay pieces.'),
  t(8, '### The Role of the Artist in Society: Fashion\n\nFashion designers are artists who contribute to society in many ways:\n\n| Role | Description |\n|------|-------------|\n| **Cultural preserver** | Designers who incorporate traditional patterns and techniques keep cultural heritage alive |\n| **Social commentator** | Fashion can make statements about social issues (e.g., sustainable fashion challenges fast fashion) |\n| **Identity builder** | Fashion helps people express who they are |\n| **Economic contributor** | The fashion industry creates jobs and economic growth |\n| **Innovator** | Designers push boundaries with new materials, technologies, and concepts |\n\n**Careers in fashion and design:**\n\n| Career | Description |\n|--------|-------------|\n| **Fashion designer** | Designs clothing and accessories |\n| **Textile designer** | Creates fabric patterns and prints |\n| **Fashion illustrator** | Draws fashion designs and concepts |\n| **Stylist** | Selects and coordinates outfits |\n| **Costume designer** | Designs clothing for film, TV, and theatre |\n| **Pattern-maker** | Creates technical patterns for garment construction |'),
  fb(9, 'A fashion designer who uses traditional African patterns in modern clothing is acting as a cultural ___. The fashion industry in South Africa creates many ___ and contributes to economic growth.',
    ['preserver', 'jobs'],
    'Designers who incorporate traditional patterns preserve cultural heritage for future generations. The fashion industry is a significant employer and economic contributor.'),
  q(10, 'Why is sustainable fashion important?',
    ['It reduces waste and environmental damage caused by fast fashion', 'It is always more expensive', 'It only uses synthetic materials', 'It is less creative than fast fashion'], 0,
    'Sustainable fashion addresses the environmental damage caused by fast fashion — overproduction, textile waste, and pollution. It promotes responsible design, production, and consumption.'),
  t(11, '### Spatial Awareness in 3D Fashion Objects\n\nWhen creating a 3D fashion-inspired object, you must develop **spatial awareness** — understanding how your work looks from all angles.\n\n**Checklist for your 3D artwork:**\n- Does it have a clear form (shape) from the front?\n- Does the back view look finished and intentional?\n- Are the proportions correct from all angles?\n- Is the surface decoration consistent around the entire object?\n- Is it physically stable (balanced) and will not tip over?\n- Have you considered both positive space (the solid object) and negative space (the openings and spaces around it)?\n\n**Assessment: Term 2 — 3D Artwork (25 marks)**\n\nYour 3D practical will be assessed on:\n- Application of art elements and design principles to a three-dimensional form\n- Quality of construction and craftsmanship\n- Creative interpretation of the fashion design theme\n- Surface decoration and finishing\n- Evidence of planning (preliminary sketches and drawings)'),
  q(12, 'When creating a 3D artwork, spatial awareness means:',
    ['Understanding how the work looks from multiple angles', 'Only looking at the front of the artwork', 'Making the artwork as flat as possible', 'Ignoring the back of the artwork'], 0,
    'Spatial awareness in 3D art means considering how the work appears from all viewpoints — front, back, sides, and top. A successful 3D artwork is visually interesting from every angle.'),
];

// ===============================================================================
// CHAPTER 6: Figure Drawing and Body Templates (Term 3)
// ===============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Figure Drawing and Body Templates\n\nIn Term 3, you focus on drawing the human figure. You will learn to observe and draw the body accurately using proportional guidelines and body templates.\n\n### Why Learn Figure Drawing?\n\nThe human figure is one of the most important subjects in art. Learning to draw figures helps you:\n- Develop observation skills\n- Understand proportion and anatomy\n- Express human emotion and movement\n- Create artworks that connect with viewers on a personal level\n\n### Basic Body Proportions\n\n| Guideline | Proportion |\n|-----------|------------|\n| **Total height** | Approximately 7-8 head lengths |\n| **Shoulder width** | Approximately 2 head widths |\n| **Waist** | Approximately at 3 head lengths from the top |\n| **Hips** | Approximately halfway down the total height |\n| **Knees** | About 2 head lengths from the feet |\n| **Arms** | Fingertips reach mid-thigh when arms hang at sides |\n| **Elbows** | Align roughly with the waist |\n| **Feet** | Approximately 1 head length long |\n\n**Common mistakes in figure drawing:**\n- Drawing the head too large (making the body look short)\n- Making arms too short\n- Placing the eyes too high on the head\n- Drawing hands too small\n- Ignoring the curve of the spine'),
  q(2, 'How many head lengths tall is the average human body?',
    ['7-8 head lengths', '3-4 head lengths', '10-12 head lengths', '5 head lengths'], 0,
    'The average adult body is approximately 7-8 head lengths tall. This proportional guideline helps artists draw figures accurately.'),
  t(3, '### Body Templates (Croquis)\n\nA **body template** (also called a croquis) is a basic outline of the human figure that artists use as a starting point for drawing.\n\n**How to create a body template:**\n\n1. Draw a vertical line for the centre of the body\n2. Divide the line into 8 equal sections (head lengths)\n3. Mark the key landmarks:\n   - Section 1: Head (oval shape)\n   - Section 2: Shoulders and upper chest\n   - Section 3: Waist and elbows\n   - Section 4: Hips and wrists\n   - Sections 5-6: Upper and lower legs\n   - Section 7: Knees to lower calves\n   - Section 8: Ankles and feet\n4. Block in the basic shapes (ovals for head and torso, cylinders for limbs)\n5. Refine the outline to create a natural body shape\n\n**Using the template:**\n- The template is a **guide**, not a rigid rule\n- Trace or draw your template lightly, then draw clothing, details, and expression over it\n- Fashion illustrators use elongated templates (9-10 heads tall) for a stylised look\n- Standard templates (7-8 heads) are used for realistic figure drawing'),
  fb(4, 'A basic outline of the human figure used as a starting point for drawing is called a body template or ___. Fashion illustrators often use ___ templates that are taller than realistic proportions.',
    ['croquis', 'elongated'],
    'A croquis is a body template used as a drawing guide. Fashion illustrators use elongated figures (9-10 heads tall) for a stylised, dramatic effect.'),
  t(5, '### Observation and Interpretation of the Figure\n\nDrawing from **observation** means looking carefully at a real subject and drawing what you actually see — not what you think you know.\n\n**Tips for observational figure drawing:**\n\n1. **Look more than you draw** — spend 70% of your time looking, 30% drawing\n2. **Start with the gesture** — capture the overall pose and movement first\n3. **Use simple shapes** — block in the head, torso, and limbs as basic shapes before adding detail\n4. **Measure proportions** — use your pencil held at arm\'s length to compare sizes\n5. **Draw lightly at first** — use light lines so you can adjust easily\n6. **Add detail last** — only after the overall proportions are correct\n\n**Types of figure drawing exercises:**\n\n| Exercise | Duration | Purpose |\n|----------|----------|--------|\n| **Gesture drawing** | 30 seconds - 2 minutes | Captures movement and energy |\n| **Contour drawing** | 5-10 minutes | Follows the edges carefully |\n| **Tonal study** | 15-30 minutes | Focuses on light and shadow |\n| **Extended study** | 30+ minutes | Full detailed drawing |'),
  q(6, 'When drawing from observation, what percentage of your time should you spend looking at the subject?',
    ['About 70%', 'About 20%', 'About 50%', 'About 10%'], 0,
    'Spending about 70% of your time looking at the subject and only 30% drawing ensures accurate observation. Most drawing mistakes come from not looking carefully enough.'),
  t(7, '### Art Elements in Figure Drawing\n\nApply the elements of art to create expressive figure drawings:\n\n| Element | Application in Figure Drawing |\n|---------|------------------------------|\n| **Line** | Contour lines define the figure; line quality (thick/thin, smooth/rough) adds expression |\n| **Shape** | The body is built from basic shapes — ovals, cylinders, triangles |\n| **Tone** | Shading creates the illusion of 3D form; observe where light falls and where shadows form |\n| **Texture** | Suggest the texture of hair, clothing, and skin through drawing techniques |\n| **Space** | Consider the negative space around the figure as well as the positive space of the body |\n\n**Tonal rendering of the figure:**\n\nTo make a flat drawing look three-dimensional, observe:\n- Where the light hits the figure directly (highlight)\n- Areas of medium tone (mid-tone)\n- Where shadows form (shadow)\n- The shadow cast by the figure onto the ground (cast shadow)'),
  fb(8, 'The body is built from basic shapes such as ovals and ___. To create the illusion of 3D form in a drawing, you need to observe where the ___ falls on the figure.',
    ['cylinders', 'light'],
    'Cylinders, ovals, and triangles are the basic shapes used to construct the body. Observing how light falls on the figure allows you to add accurate tonal shading.'),
  t(9, '### Exploring Wet Media\n\nIn Term 3, you may also experiment with **wet media** for drawing:\n\n| Medium | Characteristics |\n|--------|----------------|\n| **Ink** | Bold, permanent lines; can be diluted with water for washes |\n| **Watercolour** | Transparent, luminous washes; layers build up colour gradually |\n| **Tempera paint** | Opaque, water-based paint; good for bold flat areas of colour |\n| **Ink wash** | Diluted ink creating tonal washes from light grey to black |\n\n**Variation of paper size and format:**\n- Experiment with different paper sizes (A4, A3, A2)\n- Try portrait format (vertical), landscape format (horizontal), and square\n- Different sizes encourage different approaches — small for quick studies, large for expressive work\n- Different paper textures (smooth, rough, textured) affect how media behaves\n\n**Degrees of detail:**\n- Quick gesture sketches capture movement with minimal detail\n- Studies focus on specific aspects (hands, face, folds of clothing)\n- Extended works include full detail and tonal rendering'),
  q(10, 'Watercolour paint is described as:',
    ['Transparent with luminous washes', 'Opaque and thick', 'Always dark in colour', 'Only for professional artists'], 0,
    'Watercolour is transparent — you can see through each layer to the paper below. This creates a luminous, glowing quality unique to watercolour painting.'),
  q(11, 'Why should you experiment with different paper sizes when doing figure drawing?',
    ['Different sizes encourage different drawing approaches and skills', 'Because only large paper is correct', 'To waste paper', 'Because the teacher said so'], 0,
    'Small paper encourages quick, confident marks (gesture drawing). Large paper allows for expressive, whole-body movement. Experimenting builds different drawing skills.'),
  fb(12, 'A quick drawing lasting 30 seconds to 2 minutes that captures the overall movement of a pose is called a ___ drawing. Ink that has been diluted with water to create tonal washes is called an ink ___.',
    ['gesture', 'wash'],
    'Gesture drawings are rapid sketches capturing movement and energy. An ink wash uses diluted ink to create a range of grey tones.'),
];

// ===============================================================================
// CHAPTER 7: Surface Design and 3D Construction (Term 3)
// ===============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Surface Design and 3D Construction\n\nIn the second half of Term 3, you explore **surface design** and create a **3D artwork** applying art elements and design principles to three-dimensional forms. You will explore themes such as surface decoration, fashion design, interior design, and corporate design.\n\n### What is Surface Design?\n\nSurface design is the art of decorating and enhancing the surface of objects. It includes:\n\n| Surface Design Area | Examples |\n|--------------------|----------|\n| **Textile / fabric design** | Printed patterns, embroidery, applique |\n| **Interior design** | Wallpaper, tile patterns, upholstery |\n| **Product design** | Packaging, phone cases, stationery |\n| **Corporate design** | Business identity, branded materials |\n| **Fashion accessories** | Jewellery, bags, belts, shoes |\n\n### Applying Art Elements to Surface Design\n\n| Element | Surface Design Application |\n|---------|---------------------------|\n| **Line** | Decorative lines, borders, outlines |\n| **Shape** | Repeated geometric or organic motifs |\n| **Colour** | Colour schemes that create mood and appeal |\n| **Texture** | Actual surface texture or printed texture effects |\n| **Pattern** | Repeating motifs that cover a surface |'),
  q(2, 'Surface design involves:',
    ['Decorating and enhancing the surface of objects', 'Only painting on canvas', 'Drawing in a sketchbook', 'Making sculptures from clay only'], 0,
    'Surface design is the art of decorating the surfaces of objects — fabrics, products, walls, accessories, and more. It applies art elements and design principles to three-dimensional surfaces.'),
  t(3, '### Design Principles in Surface Decoration\n\nWhen decorating a 3D surface, consider:\n\n| Principle | Application |\n|-----------|------------|\n| **Pattern** | Create repeating motifs that flow around the surface of the object |\n| **Rhythm** | Arrange elements to create visual movement across the surface |\n| **Balance** | Distribute decorative elements evenly around all sides |\n| **Unity** | Use a consistent colour scheme and style throughout |\n| **Contrast** | Use colour or tonal contrast to make patterns visible |\n| **Emphasis** | Create a focal point on one side or area of the object |\n\n**South African surface design traditions:**\n\n| Tradition | Description |\n|-----------|------------|\n| **Ndebele wall painting** | Bold geometric patterns painted on house walls using earth pigments and bright acrylics |\n| **Zulu pottery** | Clay vessels decorated with incised (scratched) geometric patterns and coloured with plant-based pigments |\n| **Tsonga woodcarving** | Carved wooden objects with geometric surface patterns |\n| **Sotho blanket design** | Basotho blankets with distinctive patterns indicating status and identity |\n| **Venda pottery** | Decorated clay pots with symbolic patterns |'),
  q(4, 'Ndebele wall painting is characterised by:',
    ['Bold geometric patterns with bright colours and thick black outlines', 'Soft watercolour washes', 'Realistic landscapes', 'Random splashes of paint'], 0,
    'Ndebele wall painting features bold, geometric patterns using bright primary colours with thick black outlines. These patterns carry cultural meaning and are painted by women.'),
  fb(5, 'Ndebele wall painting uses bold ___ patterns with thick black outlines. Basotho blankets feature distinctive patterns that indicate ___ and identity.',
    ['geometric', 'status'],
    'Ndebele art is defined by its geometric patterns. Basotho blankets are more than clothing — their patterns communicate the wearer\'s social status and identity.'),
  t(6, '### 3D Construction Techniques\n\nFor your Term 3 3D artwork, you will use construction and modelling techniques to build a three-dimensional design project.\n\n**Construction techniques:**\n\n| Technique | Description |\n|-----------|-------------|\n| **Pasting** | Joining materials with adhesive (glue, tape) |\n| **Cutting** | Removing material with scissors or craft knife |\n| **Modelling** | Shaping pliable material by hand (clay, papier-mache) |\n| **Wrapping** | Covering an armature with material (fabric, paper, wire) |\n| **Tying / stitching** | Joining with string, wire, or thread |\n| **Scoring and folding** | Making shallow cuts to fold cardboard or paper |\n| **Joining** | Connecting pieces with slots, tabs, or fasteners |\n\n**Materials you can use:**\n- Cardboard, paper, newspaper\n- Clay, plasticine, papier-mache\n- Wire, string, fabric scraps\n- Recyclable containers and packaging\n- Beads, buttons, found objects\n- Paint, markers, coloured paper'),
  q(7, 'Scoring a piece of cardboard before folding it will:',
    ['Create a clean, precise fold line', 'Cut the cardboard in half', 'Make the cardboard waterproof', 'Add colour to the surface'], 0,
    'Scoring means making a shallow cut along the fold line (without cutting all the way through). This weakens the cardboard along the line, allowing a clean, precise fold.'),
  t(8, '### Spatial Awareness and the Construction Process\n\nWorking in 3D requires you to think about your artwork from all directions.\n\n**The construction process:**\n\n1. **Design and plan** — create detailed sketches from front, side, and top views\n2. **Select materials** — choose appropriate materials for your design\n3. **Build the basic form** — construct the underlying structure (armature)\n4. **Add surface detail** — apply decoration, texture, and colour\n5. **Refine and finish** — clean edges, touch up paint, ensure stability\n6. **Evaluate** — check from all angles; does it communicate your design intention?\n\n**Safety in the art classroom:**\n\n| Tool / Material | Safety Rule |\n|----------------|------------|\n| **Craft knife** | Always cut on a cutting mat; cut away from your body |\n| **Scissors** | Pass scissors handle-first; keep closed when not in use |\n| **Wire** | Use pliers to bend; tape sharp ends |\n| **Glue gun** | Teacher supervision required; do not touch the nozzle |\n| **Paint** | Cover your workspace; wash hands after use |\n| **Clay** | Keep workspace clean; wash hands; store unused clay wrapped in plastic |'),
  fb(9, 'Before folding cardboard, you should ___ it by making a shallow cut along the fold line. When using a craft knife, always cut ___ from your body.',
    ['score', 'away'],
    'Scoring creates a clean fold line. Always cutting away from your body prevents injuries if the knife slips.'),
  q(10, 'When constructing a 3D artwork, the first step should be to:',
    ['Create detailed sketches and plans', 'Start gluing materials immediately', 'Paint the surface first', 'Choose a random shape'], 0,
    'Planning and sketching should always come first. Detailed drawings from multiple views help you understand the form before you start building.'),
  t(11, '### Art Careers: Design Fields\n\nThe skills you learn in surface design and 3D construction connect to many career paths:\n\n| Career | Description |\n|--------|-------------|\n| **Interior designer** | Plans and decorates interior spaces — homes, offices, restaurants |\n| **Product designer** | Designs everyday objects — furniture, appliances, packaging |\n| **Textile designer** | Creates fabric patterns and prints for fashion, interiors, and industry |\n| **Jewellery designer** | Designs and makes jewellery and accessories |\n| **Ceramic artist** | Creates functional or decorative pottery and ceramics |\n| **Set designer** | Designs sets for film, television, and theatre productions |\n| **Exhibition designer** | Plans museum and gallery exhibition spaces |\n\n**Assessment: Term 3 — Practical (2D + 3D, 25 marks each)**\n\nThe 2D assessment focuses on figure drawing/body templates. The 3D assessment focuses on surface design applied to a constructed three-dimensional object. Both should demonstrate strong application of art elements and design principles.'),
  q(12, 'An interior designer would need to understand:',
    ['Art elements and design principles as applied to living and working spaces', 'Only painting techniques', 'Only sculpture methods', 'Only fashion design'], 0,
    'Interior designers apply colour theory, balance, proportion, texture, and other art elements and principles to create functional, aesthetically pleasing interior spaces.'),
];

// ===============================================================================
// CHAPTER 8: Tonal Drawing and Observational Projects (Term 4)
// ===============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Tonal Drawing: Crumpled Fabric and Chosen Themes\n\nIn Term 4, you focus on **tonal drawing** — creating artworks that show a full range of tones from light to dark. Your subject will be **crumpled fabric or visuals from a chosen theme**, drawn from direct observation.\n\n### What is Tonal Drawing?\n\nTonal drawing focuses on **light and dark values** rather than outlines. Instead of drawing lines around shapes, you build up areas of light, mid-tone, and dark to create the illusion of three-dimensional form.\n\n### The Tonal Scale\n\n| Value | Description |\n|-------|------------|\n| **White (highlight)** | The lightest area where light hits the surface directly |\n| **Light grey** | Areas receiving plenty of light but not direct highlight |\n| **Mid-tone** | Average lightness — the middle of the tonal range |\n| **Dark grey** | Areas receiving less light, beginning of shadow |\n| **Black (deep shadow)** | Darkest area, farthest from the light source |\n\nA good tonal drawing uses **at least 5-7 different values** from white to black.\n\n### Why Draw Crumpled Fabric?\n\nCrumpled or draped fabric is an excellent subject for practising tonal drawing because:\n- It creates complex patterns of light and shadow\n- The folds create a range of tones from highlight to deep shadow\n- It teaches you to observe carefully rather than draw from memory\n- It does not require a model — you can arrange it yourself\n- It develops skills transferable to figure drawing, still life, and portrait work'),
  q(2, 'A tonal drawing focuses primarily on:',
    ['Light and dark values to create the illusion of 3D form', 'Bold outlines around shapes', 'Bright, flat colours', 'Only the background of a scene'], 0,
    'Tonal drawing builds form through values (light and dark) rather than relying on outlines. This creates a more realistic, three-dimensional appearance.'),
  t(3, '### Observing and Drawing Crumpled Fabric\n\n**Setting up your still life:**\n1. Choose a piece of plain fabric (white or light-coloured works best)\n2. Crumple or drape it on a surface to create interesting folds\n3. Set up a single light source (desk lamp) from one side to create clear shadows\n4. Position yourself comfortably so you can see both the fabric and your paper\n\n**Drawing steps:**\n\n1. **Observe first** — look at the fabric carefully for at least 2 minutes before drawing\n2. **Lightly sketch the main shapes** — draw the large areas of light and dark as simple shapes\n3. **Establish the lightest and darkest values** — identify where the highlights and deepest shadows are\n4. **Build up the mid-tones** — gradually fill in the middle values\n5. **Refine transitions** — blend the transitions between light and dark areas\n6. **Add the darkest darks and brightest highlights last** — these create the strongest impact\n\n**Shading techniques for tonal drawing:**\n\n| Technique | Description |\n|-----------|-------------|\n| **Hatching** | Parallel lines placed close together; more lines = darker |\n| **Cross-hatching** | Overlapping sets of parallel lines at different angles |\n| **Blending** | Smoothly rubbing pencil marks together (use a blending stump or finger) |\n| **Stippling** | Dots placed close together; more dots = darker |\n| **Scumbling** | Circular scribbling marks layered to build tone |'),
  q(4, 'When drawing crumpled fabric, you should set up the light source from:',
    ['One side, to create clear shadows', 'Directly above for even lighting', 'Behind the fabric', 'There is no need for a specific light source'], 0,
    'A single light source from one side creates clear, dramatic shadows and highlights. This makes the tonal values easier to observe and draws attention to the folds of the fabric.'),
  fb(5, 'Parallel lines placed close together to create tone are called ___. When two sets of parallel lines overlap at different angles, this is called ___.',
    ['hatching', 'cross-hatching'],
    'Hatching uses parallel lines to build tone. Cross-hatching adds a second (or third) layer of parallel lines at a different angle, creating darker values.'),
  t(6, '### Observational Projects on Chosen Themes\n\nIn addition to crumpled fabric, you may create observational artworks based on a **chosen theme** connected to the social world. Possible themes include:\n\n| Theme | Visual Ideas |\n|-------|-------------|\n| **Current events** | Scenes from daily life, news, local happenings |\n| **Art, craft, and design** | Artists at work, craft markets, design objects |\n| **Popular culture** | Music, fashion, social media, sport |\n| **The natural world** | Landscapes, animals, plants, environmental issues |\n| **Community and identity** | Family, friends, neighbourhood, cultural traditions |\n\n**Interpretation of crumpled fabric/visuals from a chosen theme:**\n\nYou may work from:\n- **Direct observation** of crumpled fabric arranged in your classroom\n- **Photographs** from life relating to your chosen theme\n- **Testples** (visual examples) provided by your teacher\n\n**The key requirement is observation** — drawing what you see, not what you imagine. Even when working from photographs, observe carefully rather than copying mechanically.'),
  q(7, 'What does "drawing from observation" mean?',
    ['Drawing what you actually see by looking carefully at a real subject', 'Drawing from your imagination', 'Copying another artist\'s work', 'Drawing with your eyes closed'], 0,
    'Drawing from observation means carefully looking at a real subject (object, photograph, or scene) and accurately recording what you see. It develops visual accuracy and hand-eye coordination.'),
  t(8, '### Art Elements in Tonal Drawing\n\nApply the elements of art to strengthen your tonal drawing:\n\n| Element | Application |\n|---------|------------|\n| **Line** | Use line quality (thick/thin) to emphasise edges and folds |\n| **Shape** | See the folds of fabric as abstract shapes of light and dark |\n| **Tone** | The primary focus — use a full range from white to black |\n| **Texture** | Suggest the surface quality of the fabric (smooth silk vs rough hessian) |\n| **Space** | Use overlapping folds and tonal recession to create depth |\n\n### Design Principles in Tonal Drawing\n\n| Principle | Application |\n|-----------|------------|\n| **Contrast** | Strong tonal contrast between highlights and shadows creates drama |\n| **Balance** | Distribute light and dark areas to create visual equilibrium |\n| **Proportion** | Draw the folds and shapes in correct relative size |\n| **Harmony** | Consistent shading technique creates visual unity |'),
  fb(9, 'The primary element of art in a tonal drawing is ___. Strong contrast between highlights and shadows creates visual ___.',
    ['tone', 'drama'],
    'Tone (value) is the central element in tonal drawing. High contrast between light and dark areas creates drama, depth, and visual impact.'),
  q(10, 'When viewing crumpled fabric, you should see the folds as:',
    ['Abstract shapes of light and dark', 'Simple straight lines', 'Perfect circles', 'Only one shade of grey'], 0,
    'Training yourself to see folds as abstract shapes of light and dark (rather than "wrinkles") helps you draw them more accurately and expressively.'),
];

blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Simple Etching and Scraperboard Techniques\n\nIn Term 4, you also explore **simple etching techniques** using scraperboard and other scratch-based methods. These techniques create dramatic black-and-white artworks with fine detail.\n\n### What is Scraperboard?\n\nScraperboard (also called scratchboard) is a board coated with a layer of **black ink over a white surface**. You scratch through the black layer to reveal the white beneath, creating images made of white lines on a black background.\n\n### Scraperboard Techniques\n\n| Technique | Result |\n|-----------|--------|\n| **Fine parallel lines** | Light grey tone |\n| **Cross-hatching (scratched)** | Medium grey tone |\n| **Stippling (dots)** | Textured grey tone |\n| **Wide scratches** | Bold white highlights |\n| **Leaving areas unscratched** | Solid black |\n| **Dense scratching** | Near-white areas |\n\n### Tools for Scraperboard\n\n- Sharp etching tool or nib\n- Compass point\n- Craft knife tip\n- Nail\n- Any sharp, pointed instrument\n\n**Important:** Always scratch away from your fingers. Work on a stable surface.'),
  q(2, 'In scraperboard, you create an image by:',
    ['Scratching through the black surface to reveal white underneath', 'Painting white on a black surface', 'Drawing with black pencil on white paper', 'Printing ink onto paper'], 0,
    'Scraperboard works by scratching through a black-coated surface to reveal the white layer below. The image is created in reverse — you remove black to create light.'),
  t(3, '### Creating a Scraperboard Artwork\n\n**Step-by-step process:**\n\n1. **Plan your design on paper first** — create a detailed drawing\n2. **Transfer your design** — lightly trace or draw the main outlines onto the scraperboard using a white pencil or by lightly scratching guide lines\n3. **Work from light areas to dark** — scratch the areas you want to be lightest first\n4. **Build up tonal range** — use different densities of scratching for different grey values\n5. **Add fine detail last** — delicate lines and textures\n6. **Handle carefully** — scratches cannot be undone, so work slowly and deliberately\n\n**Tips for success:**\n- Plan thoroughly before you scratch — mistakes are permanent\n- Practice on a small test piece first\n- Use varying pressure for different line widths\n- Rotate the board to find comfortable scratching angles\n- Keep your tools sharp for clean lines\n\n**Alternative etching methods:**\n\n| Method | Description |\n|--------|-------------|\n| **Wax resist scratch** | Cover paper with wax crayon, paint over with black ink or paint, scratch through when dry |\n| **Foam board etching** | Scratch a design into a foam board, ink it, and print |\n| **Card etching** | Scratch designs into thick card painted with acrylic paint |'),
  fb(4, 'When working on scraperboard, you should work from ___ areas to dark. Scratches on scraperboard cannot be ___, so careful planning is essential.',
    ['light', 'undone'],
    'Working light to dark means scratching the lightest areas first. Since scratches are permanent, thorough planning prevents mistakes.'),
  t(5, '### Applying Art Elements to Scraperboard\n\nScraperboard uses a limited palette (black and white) but all art elements still apply:\n\n| Element | Scraperboard Application |\n|---------|-------------------------|\n| **Line** | Scratched lines create the entire image — vary width and direction |\n| **Shape** | Areas of black and white define shapes |\n| **Tone** | Density of scratched lines creates a tonal range |\n| **Texture** | Different scratching techniques create different textures |\n| **Space** | Contrast between black and white creates depth |\n| **Pattern** | Repetitive scratching creates patterned areas |\n\n### Design Principles in Scraperboard\n\n| Principle | Application |\n|-----------|------------|\n| **Contrast** | The inherent black-and-white contrast is very strong |\n| **Balance** | Distribute black and white areas for visual equilibrium |\n| **Emphasis** | The lightest area on a mostly dark image becomes the focal point |\n| **Harmony** | Consistent line quality creates unity |'),
  q(6, 'In a scraperboard artwork, the focal point is typically created by:',
    ['The lightest (most scratched) area on the dark background', 'The darkest area', 'The edges of the board', 'The unscratched areas only'], 0,
    'Because scraperboard is predominantly black, the lightest (most heavily scratched) area naturally draws the eye and becomes the focal point.'),
  t(7, '### Themes for Scraperboard Artworks\n\nScraperboard is particularly effective for:\n\n| Subject | Why It Works |\n|---------|-------------|\n| **Animals** | Fur and feather textures are created beautifully with fine scratching |\n| **Landscapes** | Strong contrast between sky, land, and water |\n| **Portraits** | Dramatic lighting effects on faces |\n| **Crumpled fabric** | Connecting to your tonal drawing study |\n| **Chosen theme** | Social, cultural, or environmental subjects from your observations |\n\n**Connecting scraperboard to your chosen theme:**\n\nYour scraperboard artwork can depict a subject from your observational studies or chosen theme. The dramatic black-and-white contrast can add emotional power to social commentary — many South African resistance artists used high-contrast black-and-white imagery to create powerful visual statements.\n\n**South African printmaker connection:**\nJohn Muafangejo (1943-1987) created powerful black-and-white linocut prints with a similar aesthetic to scraperboard. His bold contrasts and detailed line work told stories of daily life, history, and spiritual experience.'),
  fb(8, 'John Muafangejo is known for his powerful black-and-white ___ prints. The dramatic contrast of scraperboard makes it effective for ___ commentary artworks.',
    ['linocut', 'social'],
    'John Muafangejo created bold linocut prints at Rorke\'s Drift Art Centre. High-contrast black-and-white imagery has a long tradition in social commentary art.'),
  q(9, 'Scraperboard is particularly good for depicting animals because:',
    ['Fine scratching can create realistic fur and feather textures', 'Animals are always black and white', 'Scraperboard is only used for animal drawings', 'Animals are easy to draw'], 0,
    'The fine, controlled scratching possible on scraperboard is ideal for creating the detailed textures of fur, feathers, and scales, resulting in highly realistic animal images.'),
  t(10, '### Reflection and Self-Assessment\n\nAt the end of your practical work, you must **reflect** on your artistic process and final artwork.\n\n**Questions for self-reflection:**\n\n1. What art elements did I use most effectively in my artwork?\n2. Which design principles are evident in my composition?\n3. What worked well in my artwork? Why?\n4. What would I do differently next time?\n5. How does my artwork communicate my chosen theme or message?\n6. What new skills did I develop through this project?\n7. How did my preliminary sketches help me plan my final artwork?\n\n**Using correct art terminology in reflection:**\n\n| Instead of saying... | Say... |\n|--------------------|--------|\n| "I used nice colours" | "I used warm analogous colours to create a harmonious mood" |\n| "The picture is dark" | "I used strong tonal contrast with deep shadows to create a dramatic atmosphere" |\n| "I drew some lines" | "I used varied line quality — thick contour lines for emphasis and fine hatching for tonal gradation" |'),
  q(11, 'When reflecting on your artwork, you should:',
    ['Use correct art terminology to describe your artistic choices', 'Simply say whether you like it or not', 'Avoid discussing your work', 'Only describe what others think of it'], 0,
    'Effective reflection uses correct art terminology (elements, principles, techniques) to analyse and evaluate your work. This demonstrates understanding, not just preference.'),
  q(12, 'Which phrase uses correct art terminology?',
    ['"I used strong tonal contrast to create a dramatic atmosphere"', '"The picture looks nice"', '"I used some dark and light bits"', '"It is a good drawing"'], 0,
    '"Strong tonal contrast" and "dramatic atmosphere" are correct art terminology. Using specific terms shows understanding of art elements and design principles.'),
];

// ===============================================================================
// CHAPTER 9: The Role of the Artist and Careers in Visual Art (Term 4)
// ===============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## The Role of the Artist in Society\n\nThroughout the year, you have explored how artists contribute to their communities and the wider world. In this chapter, we bring together everything you have learned about the artist\'s role.\n\n### The Artist as Contributor to Society\n\n| Role | Description | South African Example |\n|------|-------------|----------------------|\n| **Beautifier** | Creates art that enhances public spaces | Esther Mahlangu painting Ndebele murals on public buildings |\n| **Observer** | Notices and records what happens in society | Gerard Sekoto painting daily life in Sophiatown |\n| **Social commentator** | Raises awareness about social issues | William Kentridge addressing apartheid and inequality |\n| **Storyteller** | Preserves and shares cultural narratives | San rock art recording spiritual and daily experiences |\n| **Cultural preserver** | Keeps traditions alive through art and craft | Zulu beadwork artists passing skills to younger generations |\n| **Educator** | Teaches art skills and visual literacy | Art teachers, community workshop leaders |\n| **Healer** | Uses art to help people process difficult experiences | Community art therapy projects |\n| **Innovator** | Pushes creative boundaries and imagines new possibilities | Designers creating new solutions to social problems |'),
  q(2, 'An artist who documents everyday life in their community is acting as a/an:',
    ['Observer', 'Healer', 'Innovator', 'Beautifier'], 0,
    'An observer artist notices and records what happens around them. Gerard Sekoto, for example, painted the daily life of people in Sophiatown and District Six with dignity and warmth.'),
  t(3, '### Art in Popular Culture and Daily Life\n\nArt is not only found in galleries — it is everywhere:\n\n| Context | Art / Design You See |\n|---------|---------------------|\n| **Walking down the street** | Signs, posters, murals, graffiti, building design |\n| **Using your phone** | App icons, wallpapers, social media graphics, emoji design |\n| **Watching TV / films** | Set design, costume design, animation, special effects |\n| **Shopping** | Packaging design, store layout, fashion, advertising |\n| **At school** | Posters, textbook illustrations, uniforms, classroom decoration |\n| **In your home** | Furniture design, textile patterns, wall art, kitchen utensils |\n\n**Values and art in popular culture:**\n- Art in advertising can influence what people buy and believe\n- Social media images shape how young people see themselves and others\n- Public art can build community pride or raise awareness\n- Fashion expresses cultural identity and personal values\n\nBeing **visually literate** means you can think critically about the visual messages around you — not just accepting them but questioning who made them, why, and what message they carry.'),
  fb(4, 'Being visually ___ means you can think critically about the visual messages around you. Art is found everywhere in daily life, not only in ___.',
    ['literate', 'galleries'],
    'Visual literacy is the ability to critically read and interpret visual messages. Art and design surround us in daily life, far beyond the walls of art galleries.'),
  t(5, '### Careers in the Visual Arts and Design\n\nStudying Creative Arts opens doors to many career paths. The skills you develop — observation, creativity, problem-solving, visual communication — are valuable in many fields.\n\n| Career | Description |\n|--------|-------------|\n| **Fine artist** | Creates paintings, sculptures, and installations for exhibition and sale |\n| **Graphic designer** | Designs logos, posters, websites, and visual communications |\n| **Illustrator** | Creates images for books, magazines, and digital media |\n| **Fashion designer** | Designs clothing, textiles, and accessories |\n| **Interior designer** | Plans and decorates interior spaces |\n| **Architect** | Designs buildings and public spaces |\n| **Animator** | Creates animated films, series, and digital content |\n| **Art teacher** | Teaches art at schools or community centres |\n| **Photographer** | Captures images for artistic or commercial purposes |\n| **Ceramic artist** | Creates functional or decorative pottery |\n| **Jewellery designer** | Designs and creates jewellery and accessories |\n| **Art curator** | Manages collections and exhibitions in galleries and museums |\n| **Set / costume designer** | Creates visual environments and clothing for film and theatre |\n| **Art therapist** | Uses art to support mental health and healing |'),
  q(6, 'Which career involves designing visual communications such as logos, posters, and websites?',
    ['Graphic designer', 'Ceramic artist', 'Art therapist', 'Architect'], 0,
    'Graphic designers create visual communications — logos, posters, websites, social media graphics, packaging, and more. It is one of the most in-demand art careers.'),
  t(7, '### South African Creative Industries\n\nSouth Africa has growing creative industries that offer exciting career opportunities:\n\n| Industry | Opportunities |\n|----------|---------------|\n| **Film and television** | Cape Town is a major film production hub; set designers, animators, and costume designers are in demand |\n| **Fashion** | SA Fashion Week, designers like Thebe Magugu and Laduma Ngxokolo gaining international recognition |\n| **Advertising and marketing** | Major agencies in Johannesburg and Cape Town need graphic designers and illustrators |\n| **Gaming and digital media** | Growing industry creating games, apps, and digital content |\n| **Art and craft markets** | Markets like Rosebank, Greenmarket Square, and community craft centres sell SA art globally |\n| **Public art programmes** | Government and private initiatives commissioning murals and sculptures |\n\n**Skills from Creative Arts that employers value:**\n- Creative problem-solving\n- Visual communication\n- Attention to detail\n- Ability to work to a brief (design requirements)\n- Understanding of colour, composition, and design\n- Self-discipline and project management'),
  fb(8, 'Cape Town is a major film ___ hub in South Africa. Thebe Magugu and Laduma Ngxokolo are South African ___ designers gaining international recognition.',
    ['production', 'fashion'],
    'Cape Town\'s film production industry attracts international and local filmmakers. Both Thebe Magugu and Laduma Ngxokolo have brought South African fashion to the world stage.'),
  q(9, 'Which of the following is a skill developed in Creative Arts that employers in many industries value?',
    ['Creative problem-solving', 'Memorising facts', 'Working alone without feedback', 'Avoiding new challenges'], 0,
    'Creative problem-solving is a highly valued skill across industries. Creative Arts teaches you to find innovative solutions, think visually, and approach challenges from different angles.'),
  t(10, '### Research Skills for Art\n\nResearching art and artists is an important skill for your studies and career.\n\n**How to find information:**\n- Books and art resource books in the library\n- Websites of galleries and museums (e.g., Iziko Museums, Johannesburg Art Gallery)\n- Interviews and documentaries about artists\n- Visiting galleries, exhibitions, and craft markets\n- Online databases and artist portfolios\n\n**How to process and present information:**\n- Take notes using your own words (do not copy)\n- Compare different artists or artworks\n- Evaluate artworks using art terminology\n- Present your research through written responses, oral presentations, or visual displays\n\n**Research presentation formats:**\n- Written essay or report\n- Oral presentation to the class\n- Visual poster with images and text\n- Digital presentation (PowerPoint, Canva, etc.)\n- Group discussion and debate'),
  q(11, 'When researching an artist for a project, you should:',
    ['Take notes in your own words and use art terminology', 'Copy information directly from the internet', 'Only look at one source', 'Avoid forming your own opinion'], 0,
    'Good research involves taking notes in your own words, consulting multiple sources, and using correct art terminology to discuss and evaluate artworks.'),
  q(12, 'The Iziko Museums are located in:',
    ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'], 0,
    'The Iziko Museums of South Africa are located in Cape Town and include the South African National Gallery, the South African Museum, and other important cultural institutions.'),
];

// ===============================================================================
// CHAPTER 10: Revision and Exam Preparation (Term 4)
// ===============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\n### Grade 8 Creative Arts Exam Overview\n\nYour written exam tests your knowledge of all the theory covered during the year.\n\n| Topic Area | What You Need to Know |\n|-----------|----------------------|\n| **Art terminology** | Correct names for elements, principles, tools, and techniques |\n| **Elements of art** | Line, shape, colour, texture, tone, space, form — definitions and examples |\n| **Principles of design** | Balance, contrast, emphasis, pattern, rhythm, unity, proportion |\n| **Colour theory** | Primary, secondary, tertiary; complementary, analogous; warm, cool; hue, value, intensity |\n| **South African art** | Key SA artists, art traditions, and cultural heritage |\n| **Visual literacy** | Reading, interpreting, and describing artworks |\n| **Symbolic language** | Symbols in art and their meanings |\n| **Role of the artist** | How artists contribute to local and global society |\n| **Careers** | Career paths in the visual arts and design |\n\n### Cognitive Levels in the Exam\n\n| Level | Percentage | Type of Question |\n|-------|-----------|------------------|\n| **Lower order** | 30% | Name, list, identify, define, recall |\n| **Middle order** | 40% | Describe, explain, compare, apply |\n| **Higher order** | 30% | Analyse, evaluate, interpret, discuss, justify your opinion |'),
  q(2, 'What percentage of the Creative Arts exam involves middle-order questions?',
    ['40%', '30%', '50%', '20%'], 0,
    'Middle-order questions (describe, explain, compare, apply) make up 40% of the exam — the largest portion. Lower and higher order each account for 30%.'),
  t(3, '### Revision: Elements of Art Summary\n\n| Element | Key Points |\n|---------|------------|\n| **Line** | Types: horizontal (calm), vertical (strength), diagonal (movement), curved (grace), zigzag (excitement). SA example: Esther Mahlangu\'s Ndebele lines |\n| **Shape** | Geometric (circle, square, triangle) vs organic (leaf, cloud). Positive shape = subject; negative shape = background |\n| **Colour** | Primary (R, Y, B), secondary (O, G, V), tertiary. Complementary = opposite on wheel; analogous = neighbours. Hue, value, intensity |\n| **Texture** | Actual (can be felt) vs visual (appears textured). Techniques: stippling, hatching, cross-hatching, scumbling, blending |\n| **Tone** | Lightness/darkness. Tint = colour + white. Shade = colour + black. Highlight → mid-tone → shadow → cast shadow |\n| **Space** | Positive (occupied) and negative (empty). Overlapping and size change suggest depth in 2D |\n| **Form** | 3D shape: sphere, cube, cylinder, cone. Created in 2D through tonal shading |'),
  fb(4, 'A tint is created by adding ___ to a colour. A shade is created by adding ___ to a colour.',
    ['white', 'black'],
    'A tint is a lighter version of a colour (add white). A shade is a darker version (add black).'),
  t(5, '### Revision: Principles of Design Summary\n\n| Principle | Key Points |\n|-----------|------------|\n| **Balance** | Symmetrical (mirror image), asymmetrical (different but equal), radial (from centre). SA example: Ndebele symmetrical patterns |\n| **Contrast** | Differences that create interest: light/dark, big/small, rough/smooth, warm/cool |\n| **Emphasis** | Focal point — created through contrast, size, colour, placement, or converging lines |\n| **Pattern** | A motif repeated regularly. SA examples: Zulu beadwork, Shweshwe fabric |\n| **Rhythm** | Regular, alternating, progressive, flowing, or random repetition. Creates a sense of movement |\n| **Unity** | All parts work together cohesively. Achieved through consistent colour, style, and repetition |\n| **Proportion** | Size relationships — realistic, exaggerated, or hierarchical (most important = largest) |'),
  q(6, 'In Zulu beadwork, pattern is created by:',
    ['Repeating geometric motifs in a regular arrangement', 'Random placement of beads', 'Using only one colour', 'Making each bead a different size'], 0,
    'Zulu beadwork creates pattern through the regular repetition of geometric motifs — triangles, diamonds, and stripes arranged in structured sequences. Each colour carries symbolic meaning.'),
  t(7, '### Revision: South African Artists and Art Traditions\n\n| Artist / Tradition | Key Facts |\n|-------------------|----------|\n| **Esther Mahlangu** | Ndebele mural painting; bold geometric patterns; painted BMW Art Car; international exhibitions |\n| **William Kentridge** | Charcoal drawings and animated films; addresses apartheid, memory, and inequality |\n| **Gerard Sekoto** | Father of Black South African art; painted everyday life in Sophiatown and District Six |\n| **Zanele Muholi** | Photography; self-portraits exploring Black queer identity in South Africa |\n| **Willie Bester** | Assemblage sculptures from scrap metal; comments on apartheid and poverty |\n| **Faith47** | Street art and murals; social justice themes |\n| **Falko One** | Playful animal characters on township walls |\n| **Thebe Magugu** | Fashion designer; LVMH Prize winner (2019) |\n| **Laduma Ngxokolo** | MaXhosa knitwear; Xhosa beadwork-inspired fashion |\n| **John Muafangejo** | Black-and-white linocut prints; trained at Rorke\'s Drift |\n| **San rock art** | Oldest art tradition in Southern Africa; natural pigments on rock surfaces |\n| **Ndebele art** | Geometric wall paintings by women; cultural identity |\n| **Zulu beadwork** | Symbolic colour-coded beadwork; communicates messages |'),
  q(8, 'Esther Mahlangu is internationally known for which art tradition?',
    ['Ndebele mural painting', 'Zulu beadwork', 'San rock art', 'Fashion design'], 0,
    'Esther Mahlangu is celebrated worldwide for her bold, geometric Ndebele mural paintings. She has painted BMW Art Cars and exhibited in major international galleries.'),
  fb(9, 'Gerard Sekoto is called the ___ of Black South African art. San rock art is the ___ art tradition in Southern Africa.',
    ['father', 'oldest'],
    'Gerard Sekoto (1913-1993) is widely recognised as the father of Black South African art. San rock art dates back tens of thousands of years.'),
  t(10, '### Exam Tips and Study Strategies\n\n**How to prepare:**\n1. **Review your workbook** — read through notes, worksheets, and reflections from all four terms\n2. **Study the elements and principles** — know definitions, examples, and how to apply them\n3. **Know your artists** — be able to name SA artists, their medium, and what they are known for\n4. **Practise visual analysis** — describe artworks using correct terminology\n5. **Understand symbols** — know common symbols and their meanings\n6. **Review career information** — know different art and design careers\n\n**Exam writing tips:**\n\n| Tip | Why It Matters |\n|-----|---------------|\n| **Read each question carefully** | Underline key instruction words (name, describe, compare, analyse) |\n| **Use art terminology** | Shows your understanding of the subject |\n| **Give examples** | Refer to specific artists, artworks, or traditions |\n| **Justify your opinion** | Do not just say "I like it" — explain why, using art terminology |\n| **Manage your time** | Do not spend too long on one question |\n| **Write in full sentences** | For longer questions, use complete sentences |'),
  q(11, 'The instruction word "analyse" requires you to:',
    ['Break the artwork into parts and examine each in detail', 'Simply name what you see', 'Give a one-word answer', 'Copy the question'], 0,
    '"Analyse" requires you to break something into its component parts (elements, principles, techniques) and examine each in detail. It is a higher-order cognitive skill.'),
  q(12, 'When writing about art in an exam, a strong answer will:',
    ['Use correct art terminology, give specific examples, and justify opinions', 'Simply say whether the artwork is nice or not', 'Avoid mentioning any artists by name', 'Only describe the colours used'], 0,
    'Strong exam answers demonstrate knowledge through correct terminology, support points with specific examples (artists, artworks), and justify personal opinions with evidence from the artwork.'),
];

// ===============================================================================
// MAIN — insert into MongoDB
// ===============================================================================
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 8
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
      description: 'Introduction to visual literacy and the seven elements of art (line, shape, colour, texture, tone, space, form) with South African art examples.',
      order: 1,
      lessons: [
        { title: 'Visual Literacy and the Elements of Art', description: 'Line types and expression, geometric and organic shape, colour theory basics, texture (actual and visual), tone, and form with South African art examples including Ndebele, San, and Kentridge.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Principles of Design',
      description: 'The key principles of design (balance, contrast, emphasis, proportion, pattern, rhythm, unity) and their application in South African art and craft.',
      order: 2,
      lessons: [
        { title: 'Principles of Design', description: 'Balance (symmetrical, asymmetrical, radial), contrast, emphasis, proportion, pattern, rhythm types, and unity with SA examples including Zulu beadwork and Ndebele painting.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Creative Lettering and Popular Culture',
      description: 'Creative lettering in popular culture, graffiti as visual art, values development, and personal expression through lettering and media exploration.',
      order: 3,
      lessons: [
        { title: 'Creative Lettering in Popular Culture', description: 'Lettering as art, graffiti and street art (Faith47, Falko One), values in visual culture, personal expression through lettering, and media exploration.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Drawing and Painting — Societal Issues',
      description: 'Creating 2D artworks on societal issues, using art elements for social comment, symbolic imagery, and SA artists who address social themes.',
      order: 4,
      lessons: [
        { title: 'Drawing and Painting: Societal Issues', description: 'Art and society, planning compositions on societal issues, images as symbols, applying art elements and design principles for visual social comment.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Fashion Design — 3D Art',
      description: 'Fashion as visual art, South African fashion designers and textile traditions, 3D construction techniques, and careers in fashion and design.',
      order: 5,
      lessons: [
        { title: 'Fashion Design: 3D Art', description: 'Art elements in fashion, SA fashion designers (Ngxokolo, Magugu), textile traditions (Shweshwe, Ndebele, Zulu), 3D construction, and the role of the fashion artist in society.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Figure Drawing and Body Templates',
      description: 'Human body proportions, body templates (croquis), observational figure drawing techniques, and exploring wet media.',
      order: 6,
      lessons: [
        { title: 'Figure Drawing and Body Templates', description: 'Body proportions, body templates (croquis), observation and interpretation of the figure, gesture and contour drawing, art elements in figure drawing, and wet media exploration.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Surface Design and 3D Construction',
      description: 'Surface design principles, SA surface design traditions, 3D construction techniques, spatial awareness, safety, and careers in design.',
      order: 7,
      lessons: [
        { title: 'Surface Design and 3D Construction', description: 'Surface design for textiles, interiors, and products; SA traditions (Ndebele, Zulu pottery, Sotho blankets); 3D construction techniques; safety; and careers in design.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Tonal Drawing and Etching Techniques',
      description: 'Tonal drawing of crumpled fabric, observational projects on chosen themes, and simple etching/scraperboard techniques.',
      order: 8,
      lessons: [
        { title: 'Tonal Drawing: Crumpled Fabric and Chosen Themes', description: 'Tonal scale, observing and drawing crumpled fabric, shading techniques (hatching, cross-hatching, blending, stippling), and observational projects on chosen themes.', blocks: ch8_lesson1, term: 4 },
        { title: 'Simple Etching and Scraperboard Techniques', description: 'Scraperboard techniques, creating tonal range through scratching, applying art elements and principles to etching, themes for scraperboard, and self-reflection.', blocks: ch8_lesson2, term: 4 },
      ],
    },
    {
      title: 'Chapter 9: The Role of the Artist and Careers in Visual Art',
      description: 'The artist as contributor to society, art in popular culture and daily life, careers in visual arts and design, and South African creative industries.',
      order: 9,
      lessons: [
        { title: 'The Role of the Artist and Careers in Visual Art', description: 'The artist in society (beautifier, observer, commentator, storyteller, preserver), art in daily life, careers in visual arts and design, SA creative industries, and research skills.', blocks: ch9_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 10: Revision and Exam Preparation',
      description: 'Comprehensive revision of all Grade 8 Creative Arts (Visual Art) topics: elements, principles, SA artists, visual literacy, and exam technique.',
      order: 10,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Full revision covering elements of art, principles of design, South African artists and traditions, visual analysis, symbolic language, careers, and exam writing strategies.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 8 Creative Arts \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Visual Literacy, Elements of Art, Principles of Design, Creative Lettering and Popular Culture, Drawing on Societal Issues, Fashion Design, Figure Drawing, Surface Design and 3D Construction, Tonal Drawing, Scraperboard Techniques, and Careers in Visual Art for the Grade 8 Creative Arts (Visual Art) curriculum.',
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
  console.log('  TEXTBOOK: Grade 8 Creative Arts');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
