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
// CHAPTER 1: Map Skills and Topographic Maps (Term 1)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Reading Topographic Maps\n\nA **topographic map** is a detailed representation of the Earth\'s surface showing both natural and human-made features. In South Africa, the Chief Directorate: National Geo-spatial Information produces 1:50 000 topographic maps covering the entire country.\n\n### Key Features on a Topographic Map\n\n| Feature | How It Is Shown |\n|---------|----------------|\n| **Relief (height)** | Contour lines (brown), spot heights, trigonometric beacons |\n| **Water features** | Blue lines (rivers, streams), blue areas (dams, lakes) |\n| **Vegetation** | Green shading for cultivated land, plantations |\n| **Roads** | Red (national), yellow (regional), white (minor) |\n| **Railways** | Black lines with cross-marks |\n| **Buildings/Settlements** | Black rectangles and built-up area shading |\n| **Boundaries** | Dashed or dotted lines |\n\n### Reading Map Symbols\n\nEvery topographic map has a **legend** (key) explaining the symbols used. You should become familiar with the most common conventional signs, including:\n- Churches, schools, post offices, police stations\n- Wind pumps, boreholes, dams, weirs\n- Power lines, pipelines, fences\n- Contour lines with index contours every 100 m'),
  t(2, '### Contour Lines and Relief\n\n**Contour lines** are imaginary lines joining places of equal height above sea level. On South African 1:50 000 maps, the **contour interval** is 20 metres.\n\n**Rules of contour lines:**\n1. Contour lines never cross each other.\n2. Closely spaced contours indicate a **steep slope**.\n3. Widely spaced contours indicate a **gentle slope**.\n4. Contour lines forming a V-shape pointing uphill show a **river valley**.\n5. Contour lines forming a V-shape pointing downhill show a **spur** (ridge).\n6. Concentric circles with decreasing values show a **depression** (marked with hachures).\n7. Every 5th contour is a thicker **index contour** (e.g., 1 400 m, 1 500 m).\n\n### Identifying Landforms from Contours\n\n| Contour Pattern | Landform |\n|----------------|----------|\n| Concentric circles, values increasing inward | Hill or mountain |\n| Concentric circles with hachure marks | Depression |\n| V-shape pointing upstream | Valley |\n| V-shape pointing downhill | Spur or ridge |\n| Widely spaced, roughly parallel | Gentle slope or plain |\n| Very closely spaced (almost touching) | Cliff or very steep slope |'),
  q(3, 'On a 1:50 000 topographic map of South Africa, what is the standard contour interval?',
    ['20 metres', '10 metres', '50 metres', '100 metres'], 0,
    'South African 1:50 000 topographic maps use a contour interval of 20 metres. This means each successive contour line represents a 20 m change in elevation.'),
  fb(4, 'Contour lines forming a V-shape pointing uphill indicate a ___. Contour lines forming a V-shape pointing downhill indicate a ___.',
    ['valley', 'spur'],
    'The "V points uphill" rule: V-shapes pointing upstream or uphill show valleys where streams flow. V-shapes pointing downhill show ridges or spurs extending from higher ground.'),
  t(5, '### Orthophoto Maps and Aerial Photographs\n\nAn **orthophoto map** is an aerial photograph that has been corrected so that scale is uniform (like a map). It is overlaid with map information such as contour lines, grid lines, and place names.\n\n**Advantages of orthophoto maps:**\n- Show actual ground features (buildings, vegetation, roads) as they appear from above.\n- Easier to interpret than a traditional topographic map for identifying land use.\n- Useful for identifying recent changes to the landscape.\n\n**Aerial photographs** are taken from aircraft or drones. There are two main types:\n\n| Type | Camera Angle | What It Shows |\n|------|-------------|---------------|\n| **Vertical** | Straight down (90 degrees) | Plan view, similar to a map. Used for mapping and measurement. |\n| **Oblique** | At an angle | Shows both the ground and the horizon. Easier to recognise features but scale varies across the image. |\n\n**Interpreting aerial photos:**\n- **Tone**: Dark = water, forests. Light = bare soil, sand, buildings.\n- **Texture**: Smooth = water, grassland. Rough = forest, rocky terrain.\n- **Pattern**: Regular = cultivated land, plantations. Irregular = natural vegetation.\n- **Shape**: Rectangular = buildings, fields. Irregular = natural features.'),
  q(6, 'What is the key advantage of an orthophoto map over a standard aerial photograph?',
    ['It has been corrected to have a uniform scale, making it suitable for measurement', 'It shows more colours than an aerial photograph', 'It only shows natural features', 'It is always taken from a higher altitude'], 0,
    'An orthophoto map has been geometrically corrected (orthorectified) so that the scale is uniform across the entire image. This means distances and areas can be measured accurately, unlike a raw aerial photograph where scale varies.'),
  t(7, '### Describing Settlement Patterns from Maps\n\nTopographic and orthophoto maps reveal settlement patterns:\n\n**Types of settlement patterns:**\n- **Nucleated** (clustered): Buildings are grouped closely together, often around a central point like a crossroads, church, or water source.\n- **Linear**: Buildings are arranged along a line, such as a road, river, or railway.\n- **Dispersed** (scattered): Buildings are spread out across the landscape with large gaps between them, typical of farming areas.\n\n**Describing land use from maps:**\n- Look for conventional signs (schools, churches, factories, mines).\n- Green shading indicates cultivated land or plantations.\n- Blue features show water bodies and drainage patterns.\n- Road density and building concentration indicate urban vs rural areas.\n- Contour patterns help explain why settlements are located where they are (e.g., flat land, near water, sheltered from wind).'),
  fb(8, 'A settlement where buildings are grouped closely around a central point is called ___. A settlement where buildings are spread along a road or river is called ___.',
    ['nucleated', 'linear'],
    'Nucleated settlements cluster around a central feature. Linear settlements follow a transport route or river. Dispersed settlements have buildings scattered across a wide area.'),
  q(9, 'On an aerial photograph, a large dark-toned, smooth-textured area is most likely to be:',
    ['A body of water such as a dam or lake', 'A built-up urban area', 'Cultivated farmland', 'Bare rocky ground'], 0,
    'Water appears dark on aerial photographs because it absorbs most light. Its surface is smooth, giving a uniform texture. Dams and lakes are typically the darkest, smoothest features on an aerial image.',
    ['Think about which surface reflects the least light and has the smoothest texture.']),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Scale and Distance on Maps\n\n### What is Scale?\n\n**Scale** is the ratio between a distance on the map and the corresponding actual distance on the ground.\n\n**Three ways to express scale:**\n\n| Type | Example | Description |\n|------|---------|------------|\n| **Word scale** | 1 cm represents 500 m | Easy to understand, changes when the map is resized |\n| **Representative fraction (RF)** | 1:50 000 | Universal, no units needed. 1 unit on the map = 50 000 of the same units on the ground. |\n| **Line scale (bar scale)** | A graduated line on the map | Visual, remains accurate when the map is resized |\n\n### Converting Between Scale Types\n\n**RF to word scale:**\n- 1:50 000 means 1 cm on the map = 50 000 cm on the ground = 500 m = 0.5 km.\n\n**Word scale to RF:**\n- \"1 cm represents 2 km\" = 1 cm represents 200 000 cm = 1:200 000.\n\n**Key conversion:** 1 km = 100 000 cm.'),
  t(2, '### Measuring Distance on a Map\n\n**Straight-line distance:**\n1. Measure the distance between two points on the map in centimetres using a ruler.\n2. Multiply by the scale factor to get the actual distance.\n\n**Example:** On a 1:50 000 map, a straight line measures 4.5 cm.\n- Actual distance = 4.5 cm x 50 000 = 225 000 cm = 2 250 m = **2.25 km**.\n\n**Curved (road/river) distance:**\n1. Place a piece of string along the curved route.\n2. Straighten the string and measure its length against a ruler.\n3. Multiply by the scale factor.\n\nAlternatively, use a strip of paper, marking short straight sections along the curve, then measure the total length.\n\n### Area Calculation\n\nTo find the area of a rectangular section on a map:\n1. Measure the length and width on the map.\n2. Convert both to actual distances using the scale.\n3. Multiply: Area = length x width.\n\n**Example:** A farm measures 3 cm x 2 cm on a 1:50 000 map.\n- Length = 3 x 50 000 = 150 000 cm = 1 500 m = 1.5 km\n- Width = 2 x 50 000 = 100 000 cm = 1 000 m = 1.0 km\n- Area = 1.5 km x 1.0 km = **1.5 km squared**'),
  q(3, 'On a 1:50 000 map, a river measures 6 cm in length. What is the actual distance of the river?',
    ['3 km', '300 m', '30 km', '6 km'], 0,
    'Actual distance = 6 cm x 50 000 = 300 000 cm = 3 000 m = 3 km.'),
  fb(4, 'A scale of 1:50 000 means that 1 cm on the map represents ___ cm (or ___ m) on the ground.',
    ['50 000', '500'],
    '1:50 000 means every 1 cm on the map equals 50 000 cm in reality, which is 500 m (0.5 km).'),
  t(5, '## Direction and Bearing\n\n### Compass Direction\n\nThe **16-point compass** is used to describe direction:\n- Cardinal: N, S, E, W\n- Intercardinal: NE, NW, SE, SW\n- Secondary intercardinal: NNE, ENE, ESE, SSE, SSW, WSW, WNW, NNW\n\nOn a topographic map, **north is at the top** unless otherwise indicated.\n\n### True Bearing\n\nA **bearing** is a direction measured as an angle from north, going clockwise from 0 to 360 degrees.\n\n| Compass Direction | Bearing |\n|-------------------|--------|\n| North | 000 degrees |\n| East | 090 degrees |\n| South | 180 degrees |\n| West | 270 degrees |\n| NE | 045 degrees |\n| SW | 225 degrees |\n\n### Magnetic Bearing and Declination\n\n- A **compass needle** points to **magnetic north**, not true (geographic) north.\n- The angle between true north and magnetic north is called **magnetic declination**.\n- In South Africa, magnetic declination is currently about 25 degrees W (the compass points about 25 degrees west of true north).\n- To convert: **True bearing = magnetic bearing - west declination** (or + east declination).\n- The mean annual change indicates how declination shifts over time.'),
  q(6, 'If the magnetic bearing of a feature is 130 degrees and the magnetic declination is 25 degrees W, what is the true bearing?',
    ['105 degrees', '155 degrees', '130 degrees', '25 degrees'], 0,
    'With west declination, subtract: True bearing = 130 - 25 = 105 degrees. West declination means magnetic north is west of true north, so the magnetic bearing is larger than the true bearing.'),
  t(7, '## Gradient Calculation\n\n**Gradient** measures the steepness of a slope.\n\n**Formula:** Gradient = Vertical distance / Horizontal distance\n\n**Steps:**\n1. Find the height difference between two points (higher altitude minus lower altitude).\n2. Measure the horizontal (map) distance between the same two points.\n3. Convert the map distance to actual distance using the scale.\n4. Divide: Gradient = height difference / actual horizontal distance.\n5. Simplify and express as a ratio (e.g., 1:25).\n\n**Example:**\n- Point A: 1 600 m altitude\n- Point B: 1 400 m altitude\n- Map distance between A and B: 5 cm\n- Scale: 1:50 000\n- Actual distance = 5 x 50 000 = 250 000 cm = 2 500 m\n- Gradient = (1 600 - 1 400) / 2 500 = 200 / 2 500 = 1/12.5 = **1:12.5**\n\n**Interpreting gradient:**\n- 1:5 = very steep\n- 1:10 to 1:20 = steep\n- 1:20 to 1:50 = moderate\n- Greater than 1:100 = gentle'),
  fb(8, 'Gradient is calculated by dividing the ___ distance by the ___ distance. A gradient of 1:5 indicates a ___ steep slope.',
    ['vertical', 'horizontal', 'very'],
    'Gradient = vertical distance (rise) / horizontal distance (run). The smaller the second number, the steeper the slope. 1:5 means 1 m rise for every 5 m of horizontal distance -- very steep.'),
  q(9, 'Two points on a 1:50 000 map are 4 cm apart. Point X is at 1 800 m and Point Y is at 1 600 m. What is the gradient?',
    ['1:10', '1:20', '1:5', '1:100'], 0,
    'Horizontal distance = 4 cm x 50 000 = 200 000 cm = 2 000 m. Vertical distance = 1 800 - 1 600 = 200 m. Gradient = 200/2 000 = 1/10 = 1:10.'),
  t(10, '## Cross-sections\n\nA **cross-section** is a side-view diagram showing the shape of the land along a line drawn on a map.\n\n### Drawing a Cross-section\n\n1. Place a strip of paper along the line of the cross-section on the map.\n2. Mark every contour crossing on the paper and label its height.\n3. Mark rivers, roads, and other features along the line.\n4. Transfer marks to graph paper with height on the vertical axis and distance on the horizontal axis.\n5. Plot each point at its correct height and join with a smooth curve.\n6. Label all features.\n\n### Vertical Exaggeration (VE)\n\nCross-sections usually exaggerate the vertical scale to make relief features visible.\n\n**Formula:** VE = Horizontal scale denominator / Vertical scale denominator\n\n**Example:** Map scale 1:50 000, vertical scale 1:10 000.\n- VE = 50 000 / 10 000 = **5 times**\n\n**Important:** Always state the VE on your cross-section. Remember that slopes look steeper than they really are because of VE.'),
];

// =============================================================================
// CHAPTER 2: The Atmosphere — Composition and the Ozone Layer (Term 1)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## The Composition of the Atmosphere\n\nThe **atmosphere** is the thin layer of gases surrounding the Earth, held in place by gravity. It extends approximately 10 000 km above the surface, but 99% of its mass is within the first 30 km.\n\n### Gases in the Atmosphere\n\n| Gas | Percentage | Importance |\n|-----|-----------|------------|\n| **Nitrogen (N2)** | 78.09% | Essential for plant growth (fixed by bacteria into soil) |\n| **Oxygen (O2)** | 20.95% | Breathing, combustion, ozone formation |\n| **Argon (Ar)** | 0.93% | Inert gas, no significant weather role |\n| **Carbon dioxide (CO2)** | 0.04% | Greenhouse gas, photosynthesis |\n| **Water vapour (H2O)** | 0 -- 4% (variable) | Greenhouse gas, clouds, precipitation |\n\n**Trace gases:** Neon, helium, methane, ozone, nitrous oxide.\n\n**Important:** Although CO2 and water vapour are present in tiny amounts, they have a massive effect on climate because they are **greenhouse gases** that trap heat.'),
  t(2, '### Layers of the Atmosphere\n\nThe atmosphere is divided into layers based on temperature changes with altitude:\n\n| Layer | Altitude | Temperature Trend | Key Features |\n|-------|----------|-------------------|-------------|\n| **Troposphere** | 0 -- 12 km | Decreases with altitude | Where weather occurs; contains 75% of atmosphere\'s mass |\n| **Stratosphere** | 12 -- 50 km | Increases with altitude | Contains the ozone layer; aircraft fly here |\n| **Mesosphere** | 50 -- 80 km | Decreases with altitude | Coldest layer (about -90 degrees C); meteors burn up here |\n| **Thermosphere** | 80 -- 700 km | Increases rapidly | Very hot but thin; auroras occur here |\n| **Exosphere** | 700 -- 10 000 km | Thins into space | Satellites orbit here; merges with outer space |\n\nThe boundary between the troposphere and the stratosphere is called the **tropopause**. The average temperature lapse rate in the troposphere is approximately **6.5 degrees C per 1 000 m**.'),
  q(3, 'In which layer of the atmosphere does weather occur?',
    ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'], 0,
    'The troposphere is the lowest layer (0-12 km) and contains about 75% of the atmosphere\'s mass. Almost all weather phenomena -- clouds, rain, wind, storms -- occur in the troposphere.'),
  fb(4, 'The atmosphere is composed of approximately ___% nitrogen and ___% oxygen. Weather occurs in the lowest layer called the ___.',
    ['78', '21', 'troposphere'],
    'Nitrogen (78%) and oxygen (21%) together make up 99% of the dry atmosphere. The troposphere is the lowest and densest layer where all weather takes place.'),
  t(5, '## The Ozone Layer\n\n### What is Ozone?\n\n**Ozone (O3)** is a molecule made of three oxygen atoms. It is found mainly in the **stratosphere** at altitudes of 15-35 km, forming the **ozone layer**.\n\n### How the Ozone Layer Protects Life\n\nThe ozone layer absorbs most of the Sun\'s harmful **ultraviolet (UV) radiation**, preventing it from reaching the Earth\'s surface.\n\n**Types of UV radiation:**\n\n| Type | Wavelength | Effect | Ozone Absorption |\n|------|-----------|--------|------------------|\n| **UV-A** | Longest | Skin ageing, some cancer risk | Not absorbed by ozone |\n| **UV-B** | Medium | Sunburn, skin cancer, cataracts | Mostly absorbed by ozone |\n| **UV-C** | Shortest, most dangerous | Would be lethal to life | Completely absorbed by ozone |\n\nWithout the ozone layer, dangerous UV-B and UV-C radiation would reach the surface, making life on land impossible.'),
  t(6, '### Ozone Depletion\n\n**Causes of ozone depletion:**\n- **Chlorofluorocarbons (CFCs)** -- synthetic chemicals once used in refrigerators, air conditioners, aerosol sprays, and foam packaging.\n- When CFCs reach the stratosphere, UV radiation breaks them down, releasing **chlorine atoms**.\n- A single chlorine atom can destroy up to **100 000 ozone molecules** before being deactivated.\n- Other ozone-depleting substances include halons (fire extinguishers), methyl bromide (pesticide), and nitrogen oxides.\n\n**The Ozone Hole:**\n- The most severe ozone depletion occurs over **Antarctica** during spring (September-October), forming the \"ozone hole.\"\n- Polar stratospheric clouds in the extremely cold Antarctic winter provide surfaces for chemical reactions that release chlorine.\n- The ozone hole was first identified in **1985** by British scientists.\n\n**Effects of ozone depletion:**\n- Increased UV-B reaching the surface.\n- Higher rates of skin cancer, cataracts, and immune system suppression.\n- Damage to marine phytoplankton (base of the ocean food chain).\n- Reduced crop yields.\n- Harm to aquatic ecosystems.'),
  q(7, 'Which chemicals are the primary cause of ozone depletion?',
    ['Chlorofluorocarbons (CFCs)', 'Carbon dioxide (CO2)', 'Methane (CH4)', 'Nitrogen (N2)'], 0,
    'CFCs release chlorine atoms in the stratosphere when broken down by UV radiation. These chlorine atoms destroy ozone molecules in a chain reaction, with each chlorine atom capable of destroying up to 100 000 ozone molecules.'),
  fb(8, 'The ozone hole occurs mainly over ___ during spring. The international agreement to phase out CFCs is the ___ Protocol, signed in 1987.',
    ['Antarctica', 'Montreal'],
    'The ozone hole is most severe over Antarctica in September-October. The Montreal Protocol (1987) is the international treaty that successfully phased out CFC production worldwide.'),
  t(9, '### Reducing Ozone Depletion\n\n**The Montreal Protocol (1987):**\n- An international agreement to phase out the production of ozone-depleting substances.\n- Signed by virtually every country in the world.\n- CFCs have been replaced by **hydrofluorocarbons (HFCs)** which do not destroy ozone (although some are greenhouse gases).\n- The protocol is considered one of the most successful environmental agreements ever.\n\n**Results:**\n- CFC concentrations in the atmosphere have been declining since the mid-1990s.\n- Scientists predict the ozone layer will recover to 1980 levels by approximately **2050-2070**.\n- The ozone hole is slowly shrinking.\n\n**South African context:**\n- South Africa ratified the Montreal Protocol and banned CFC production.\n- SA\'s latitude (22-35 degrees S) means it is not directly under the Antarctic ozone hole, but thinning of the ozone layer still increases UV exposure.\n- South Africans should use sunscreen (SPF 30+), wear hats and sunglasses, and avoid prolonged sun exposure, especially between 10:00 and 14:00.'),
  q(10, 'The Montreal Protocol aims to protect the ozone layer by:',
    ['Phasing out the production of ozone-depleting substances like CFCs', 'Reducing carbon dioxide emissions from fossil fuels', 'Increasing oxygen levels in the atmosphere', 'Banning all aerosol products worldwide'], 0,
    'The Montreal Protocol specifically targets ozone-depleting substances (primarily CFCs). It is separate from climate agreements like the Paris Agreement, which targets greenhouse gas emissions.'),
];

// =============================================================================
// CHAPTER 3: Heating of the Atmosphere (Term 1)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## How the Atmosphere Is Heated\n\nThe atmosphere is heated primarily **from below** by the Earth\'s surface, not directly by the Sun. The Sun\'s shortwave radiation passes through the atmosphere relatively easily and is absorbed by the Earth\'s surface. The heated surface then warms the air above it.\n\n### The Heating Process\n\n1. **Incoming solar radiation (insolation)** passes through the atmosphere.\n2. About **51%** of insolation is absorbed by the Earth\'s surface.\n3. The heated surface re-radiates energy as **longwave (infrared) radiation**.\n4. Greenhouse gases in the atmosphere absorb this longwave radiation and re-emit it in all directions, warming the lower atmosphere.\n\n### Three Mechanisms of Heat Transfer\n\n| Mechanism | Description | Example |\n|-----------|-------------|--------|\n| **Radiation** | Transfer of energy through electromagnetic waves. No medium needed. | The Sun heats the Earth through space. |\n| **Conduction** | Transfer of heat through direct contact between molecules. | The ground heats the air directly above it. |\n| **Convection** | Transfer of heat through the movement of heated fluid (air or water). | Warm air rises, creating convection currents. |'),
  q(2, 'The atmosphere is heated primarily by:',
    ['Longwave radiation from the Earth\'s surface warming the air from below', 'Direct absorption of sunlight by the atmosphere', 'Heat from the Earth\'s core', 'Reflected light from the Moon'], 0,
    'The Sun\'s shortwave radiation passes through the atmosphere and heats the surface. The surface re-radiates longwave (infrared) energy, which is absorbed by greenhouse gases, heating the atmosphere from below.'),
  t(3, '### The Greenhouse Effect\n\nThe **greenhouse effect** is the natural process by which certain gases in the atmosphere trap outgoing longwave radiation, keeping the Earth warm enough to support life.\n\n**How it works:**\n1. Shortwave solar radiation enters the atmosphere and heats the Earth\'s surface.\n2. The surface emits longwave (infrared) radiation upward.\n3. Greenhouse gases (water vapour, CO2, methane, nitrous oxide) absorb some of this radiation.\n4. They re-emit it in all directions, including back toward the surface (**counter-radiation**).\n5. This warms the lower atmosphere and the surface.\n\n**Without the greenhouse effect**, the Earth\'s average temperature would be about **-18 degrees C** instead of the current **15 degrees C**.\n\n### The Enhanced Greenhouse Effect\n\nHuman activities are increasing greenhouse gas concentrations:\n- **Burning fossil fuels** (coal, oil, gas) releases CO2.\n- **Deforestation** reduces CO2 absorption by trees.\n- **Agriculture** (rice paddies, livestock) releases methane.\n- **Industry** releases various greenhouse gases.\n\nThis **enhanced greenhouse effect** is causing **global warming** and **climate change**.'),
  fb(4, 'Without the greenhouse effect, Earth\'s average temperature would be about ___ degrees C instead of ___ degrees C. The main human cause of the enhanced greenhouse effect is burning ___ fuels.',
    ['-18', '15', 'fossil'],
    'The natural greenhouse effect raises Earth\'s temperature by about 33 degrees C (from -18 to 15 degrees C). Burning fossil fuels releases CO2, the primary driver of the enhanced greenhouse effect.'),
  t(5, '## Factors Affecting Temperature\n\nTemperature varies from place to place and from time to time due to several factors:\n\n### 1. Latitude\n- The most important factor.\n- Areas near the equator receive more concentrated solar radiation (higher angle of incidence) than areas near the poles.\n- As latitude increases, average temperature decreases.\n\n### 2. Altitude\n- Temperature decreases with altitude at approximately **6.5 degrees C per 1 000 m** (environmental lapse rate).\n- Johannesburg (1 753 m) is cooler than Durban (sea level), even though they are at similar latitudes.\n- This is why mountains like the Drakensberg have snow in winter.\n\n### 3. Distance from the Sea (Continentality)\n- Water heats and cools more slowly than land (**high specific heat capacity**).\n- Coastal areas have **smaller temperature ranges** (moderate/maritime climate).\n- Interior areas have **larger temperature ranges** (extreme/continental climate).\n- Example: Durban (coast) has a small annual temperature range; Pretoria (interior) has a large range.'),
  t(6, '### 4. Ocean Currents\n\n- **Warm currents** (e.g., Agulhas Current on SA\'s east coast) raise coastal temperatures and bring moisture.\n- **Cold currents** (e.g., Benguela Current on SA\'s west coast) lower coastal temperatures and reduce rainfall.\n- This explains why Durban is warmer and wetter than Cape Town\'s west coast, even at the same latitude.\n\n### 5. Cloud Cover\n- Clouds reflect incoming solar radiation during the day (cooling effect).\n- Clouds trap outgoing longwave radiation at night (warming effect).\n- Cloudy areas tend to have smaller daily temperature ranges.\n- Clear skies in the interior allow large daily temperature ranges (hot days, cold nights).\n\n### 6. Aspect\n- In the Southern Hemisphere, **north-facing slopes** receive more direct sunlight and are warmer.\n- **South-facing slopes** are cooler and often wetter.\n- This affects farming, vegetation, and settlement locations.\n\n**South African example:** Vineyards in the Cape Winelands are carefully positioned on slopes with the optimal aspect for grape growing.'),
  q(7, 'Why does Johannesburg have cooler average temperatures than Durban, despite being at a similar latitude?',
    ['Johannesburg is at a much higher altitude (1 753 m) than Durban (sea level)', 'Johannesburg is farther from the equator', 'Johannesburg receives less sunshine', 'The Benguela Current cools Johannesburg'], 0,
    'Johannesburg sits on the Highveld at 1 753 m above sea level. Temperature decreases by about 6.5 degrees C per 1 000 m, so Johannesburg is roughly 11 degrees C cooler than it would be at sea level.',
    ['Consider the environmental lapse rate: how much cooler would a city at nearly 1 800 m be compared to sea level?']),
  fb(8, 'The warm ___ Current raises temperatures on SA\'s east coast, while the cold ___ Current lowers temperatures on the west coast.',
    ['Agulhas', 'Benguela'],
    'The Agulhas Current (warm) flows southward along the east coast, making Durban and the KZN coast warm and humid. The Benguela Current (cold) flows northward along the west coast, creating cool, dry conditions.'),
  q(9, 'In the Southern Hemisphere, which slope aspect receives the most direct sunlight?',
    ['North-facing slopes', 'South-facing slopes', 'East-facing slopes', 'West-facing slopes'], 0,
    'In the Southern Hemisphere, the Sun is in the northern part of the sky for most of the day. North-facing slopes therefore receive the most direct and prolonged sunlight, making them warmer and drier.'),
  t(10, '### Temperature Inversions\n\nA **temperature inversion** occurs when a layer of warm air sits above a layer of cold air near the surface. This is the opposite of the normal situation where temperature decreases with altitude.\n\n**How inversions form:**\n- **Radiation inversions** (most common): On clear, calm winter nights, the ground loses heat rapidly through radiation. The air near the surface cools, but the air above remains warm.\n- **Subsidence inversions**: Descending air in a high-pressure system warms adiabatically, creating a warm layer above cooler surface air.\n\n**Effects of inversions:**\n- The warm air acts as a **lid**, preventing vertical mixing.\n- Pollution and smoke are trapped near the surface, causing **smog**.\n- Frost forms in valleys as cold air drains downhill and is trapped (frost hollows).\n\n**South African examples:**\n- The Highveld frequently experiences winter inversions, trapping pollution over Johannesburg and Pretoria.\n- The Vaal Triangle industrial area suffers poor air quality during inversions.\n- Frost hollows in the Free State and Mpumalanga Highveld valleys can be several degrees colder than surrounding hillsides.'),
];

// =============================================================================
// CHAPTER 4: Moisture in the Atmosphere (Term 1)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Water in the Atmosphere\n\nWater exists in the atmosphere in three states:\n- **Gas** -- water vapour (invisible)\n- **Liquid** -- water droplets (clouds, fog, rain)\n- **Solid** -- ice crystals (high clouds, hail, snow)\n\n### Key Concepts\n\n**Evaporation:** Water changes from liquid to gas. Requires energy (latent heat of evaporation). Occurs from oceans, rivers, dams, soil, and plants (transpiration).\n\n**Condensation:** Water vapour changes to liquid. Releases latent heat. Occurs when air cools to its **dew-point temperature**.\n\n**Sublimation:** Ice changes directly to water vapour (or vice versa) without passing through the liquid stage.\n\n### Humidity\n\n**Humidity** is the amount of water vapour in the air.\n\n| Term | Definition |\n|------|------------|\n| **Absolute humidity** | The actual mass of water vapour in a given volume of air (g/m3). |\n| **Relative humidity** | The amount of water vapour in the air expressed as a percentage of the maximum the air could hold at that temperature. |\n| **Dew-point temperature** | The temperature at which air becomes saturated (100% relative humidity) and condensation begins. |\n\n**Saturated air** has a relative humidity of **100%** -- it cannot hold any more water vapour at that temperature.'),
  q(2, 'What happens when air cools to its dew-point temperature?',
    ['Condensation begins as the air becomes saturated', 'Evaporation increases rapidly', 'The air pressure rises sharply', 'Wind speed increases'], 0,
    'At the dew-point temperature, air reaches 100% relative humidity (saturation). Any further cooling causes excess water vapour to condense into liquid droplets, forming clouds, fog, or dew.'),
  t(3, '### Cloud Formation\n\nClouds form when air is forced to rise, cools to its dew-point temperature, and water vapour condenses onto tiny particles called **condensation nuclei** (dust, salt, smoke, pollen).\n\n**Four ways air is forced to rise:**\n\n| Mechanism | Description | Typical Cloud/Weather |\n|-----------|-------------|----------------------|\n| **Orographic uplift** | Air is forced over a mountain or escarpment | Heavy rain on windward side, rain shadow on leeward side |\n| **Convectional uplift** | The sun heats the ground, warm air rises | Towering cumulonimbus clouds, thunderstorms (summer on the Highveld) |\n| **Frontal uplift** | Warm air is forced over cold air along a front | Widespread cloud and rain along the front |\n| **Convergence** | Air flows together from different directions, forcing uplift | Occurs at the ITCZ; widespread cloud and rain |\n\n### Adiabatic Lapse Rates\n\nRising air cools because it expands as pressure decreases.\n\n| Lapse Rate | Value | When It Applies |\n|-----------|-------|----------------|\n| **Dry adiabatic lapse rate (DALR)** | 1 degree C per 100 m | Unsaturated air (below dew point) |\n| **Wet (saturated) adiabatic lapse rate (WALR)** | 0.5 degree C per 100 m | Saturated air (at or above dew point, condensation occurring) |\n\nThe WALR is slower because condensation releases **latent heat**, partially offsetting the cooling.'),
  fb(4, 'Air cools at the dry adiabatic lapse rate of ___ degree C per 100 m until it reaches the dew point. After that, it cools at the wet adiabatic lapse rate of ___ degree C per 100 m.',
    ['1', '0.5'],
    'The DALR (1 degree C/100 m) applies to unsaturated rising air. Once the air reaches the dew point and condensation begins, the slower WALR (0.5 degree C/100 m) applies because latent heat is released.'),
  t(5, '## Cloud Types\n\nClouds are classified by their **altitude** and **shape**:\n\n### By Altitude\n\n| Level | Altitude | Cloud Types |\n|-------|----------|------------|\n| **High clouds** | Above 6 000 m | Cirrus, cirrocumulus, cirrostratus (made of ice crystals) |\n| **Middle clouds** | 2 000 -- 6 000 m | Altocumulus, altostratus |\n| **Low clouds** | Below 2 000 m | Stratus, stratocumulus, nimbostratus |\n| **Vertical development** | Base low, top very high | Cumulus, cumulonimbus |\n\n### By Shape\n\n| Root | Meaning | Description |\n|------|---------|------------|\n| **Cirro-** | Curl/wisp | Thin, feathery, high-altitude |\n| **Cumulo-** | Heap | Puffy, vertical development |\n| **Strato-** | Layer | Flat, sheet-like, widespread |\n| **Nimbo-/nimbus** | Rain | Rain-producing |\n\n### Important Cloud Types for Weather Prediction\n\n- **Cirrus**: Fine, wispy clouds. Fair weather, but may indicate an approaching warm front.\n- **Cumulus**: Fair-weather puffy clouds on sunny days.\n- **Cumulonimbus (Cb)**: Towering thunderstorm clouds. Bring heavy rain, lightning, hail, and strong winds.\n- **Nimbostratus**: Thick, dark, low clouds. Bring continuous steady rain.\n- **Stratus**: Low, grey, uniform layer. Drizzle or overcast conditions.'),
  q(6, 'Which cloud type is associated with thunderstorms, heavy rain, lightning, and hail?',
    ['Cumulonimbus', 'Cirrus', 'Stratus', 'Altostratus'], 0,
    'Cumulonimbus clouds are massive clouds with strong vertical development, extending from low altitudes to the tropopause. They produce thunderstorms, heavy rain, lightning, hail, and sometimes tornadoes.'),
  fb(7, 'The prefix "nimbo-" or suffix "-nimbus" indicates a ___ cloud. High-altitude clouds made of ice crystals have the prefix ___.',
    ['rain-producing', 'cirro'],
    '"Nimbus/nimbo" means rain-bearing. "Cirro" indicates high-altitude clouds (above 6 000 m) composed of ice crystals, such as cirrus and cirrostratus.'),
  t(8, '## Dew, Frost, Fog, and Mist\n\nThese are forms of condensation that occur at or near the Earth\'s surface.\n\n### Dew\n- Water droplets that form on cool surfaces (grass, cars) when the surface temperature falls below the dew-point temperature.\n- Forms on clear, calm nights when radiative cooling is strong.\n\n### Frost\n- Ice crystals that form on surfaces when the temperature drops below **0 degrees C** (the dew point is also below freezing).\n- Common on the Highveld and in Free State valleys during winter.\n- Damaging to crops -- farmers may use frost blankets, smudge pots, or wind machines.\n\n### Fog\n- A cloud at ground level. Visibility is reduced to less than **1 000 m**.\n- **Radiation fog**: Forms on clear, calm nights when the ground cools rapidly (common in inland valleys).\n- **Advection fog**: Warm, moist air moves over a cold surface and is cooled below its dew point. Common along the West Coast where warm air meets the cold Benguela Current.\n\n### Mist\n- Similar to fog, but visibility is between **1 000 m and 5 000 m**.\n- Less dense than fog.'),
  q(9, 'What causes advection fog along the South African West Coast?',
    ['Warm, moist air is cooled below its dew point as it moves over the cold Benguela Current', 'Radiation cooling on clear nights', 'Smoke from factories mixing with water vapour', 'Volcanic activity releasing steam'], 0,
    'Advection fog forms when warm, moist air from the ocean is advected (moved horizontally) over the cold Benguela Current. The cold water cools the air below its dew point, causing condensation and dense fog.',
    ['Think about what happens when warm, moist air comes into contact with a very cold surface.']),
];

// =============================================================================
// CHAPTER 5: Weather Elements, Instruments, and Synoptic Maps (Term 1)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Weather Elements and Instruments\n\nWeather is the state of the atmosphere at a specific place and time. It is described using several **weather elements**, each measured by specific instruments.\n\n### Weather Elements and Their Instruments\n\n| Element | What It Measures | Instrument | Unit |\n|---------|-----------------|------------|------|\n| **Temperature** | How hot or cold the air is | Thermometer (max, min, wet-bulb, dry-bulb) | Degrees C |\n| **Atmospheric pressure** | The weight of the air above | Barometer (mercury or aneroid) | Hectopascals (hPa) or millibars (mb) |\n| **Wind direction** | Where the wind blows FROM | Wind vane | Compass points (N, SE, etc.) |\n| **Wind speed** | How fast the air moves | Anemometer (cup anemometer) | m/s or km/h |\n| **Humidity** | Moisture content of the air | Hygrometer (wet-and-dry-bulb) | % (relative humidity) |\n| **Rainfall** | Amount of precipitation | Rain gauge | Millimetres (mm) |\n| **Cloud cover** | How much sky is covered by cloud | Observation (oktas) | Oktas (0-8) |\n| **Visibility** | How far one can see | Observation | Metres or km |\n\n**Standard atmospheric pressure** at sea level is **1 013.25 hPa**.'),
  t(2, '### The Stevenson Screen\n\nA **Stevenson screen** (weather station shelter) is a white, louvred box on legs used to house thermometers at a weather station.\n\n**Design features and reasons:**\n- **White colour** -- reflects solar radiation, preventing artificial heating.\n- **Louvred sides** -- allow free air circulation while protecting instruments from direct sun and rain.\n- **Raised on legs** (1.2 m above the ground) -- at standard height for consistent readings, away from ground radiation.\n- **Double roof** -- insulates from direct overhead sunshine.\n- **Door faces south** (in Southern Hemisphere) -- so direct sunlight does not enter when readings are taken.\n\n### Measuring Temperature\n\n- **Maximum thermometer** (mercury): Records the highest temperature reached.\n- **Minimum thermometer** (alcohol): Records the lowest temperature reached.\n- **Wet-and-dry-bulb thermometer (psychrometer)**: Two thermometers side by side. The wet-bulb has a muslin wick dipped in water. The difference in readings (depression) is used to calculate relative humidity and dew point.'),
  q(3, 'Why is the Stevenson screen painted white?',
    ['To reflect solar radiation and prevent artificial heating of the instruments inside', 'To make it visible from a distance', 'Because white paint lasts longer', 'To attract insects for biological monitoring'], 0,
    'White surfaces reflect most solar radiation. If the screen were dark-coloured, it would absorb heat and artificially raise the temperature inside, giving inaccurate readings.'),
  fb(4, 'Standard atmospheric pressure at sea level is ___ hPa. Wind direction tells us the direction the wind blows ___ (from/to).',
    ['1 013.25', 'from'],
    'Standard sea-level pressure is 1 013.25 hPa. Wind direction indicates where the wind originates: a "south-east wind" blows FROM the south-east.'),
  t(5, '## Reading Synoptic Weather Maps\n\nA **synoptic weather map** shows weather conditions over a large area at a specific time. In South Africa, the SA Weather Service (SAWS) produces synoptic maps.\n\n### Key Features\n\n| Feature | Description |\n|---------|------------|\n| **Isobars** | Lines joining places of equal atmospheric pressure. Drawn at 4 hPa intervals. |\n| **H** | High-pressure system (anticyclone). Descending air, clear skies, dry. |\n| **L** | Low-pressure system (depression/cyclone). Rising air, cloud, rain. |\n| **Cold front** | Blue line with triangles. Cold air pushes under warm air. |\n| **Warm front** | Red line with semicircles. Warm air rides over cold air. |\n| **Occluded front** | Purple line with triangles and semicircles. Cold front catches warm front. |\n\n### Wind Direction from Isobars\n\nIn the **Southern Hemisphere**:\n- Wind blows **clockwise** around a low-pressure system.\n- Wind blows **anticlockwise** around a high-pressure system.\n- Wind blows nearly parallel to isobars but slightly across toward low pressure (due to friction at the surface).'),
  q(6, 'In the Southern Hemisphere, air around a high-pressure system spirals:',
    ['Anticlockwise outward', 'Clockwise inward', 'Anticlockwise inward', 'Clockwise outward'], 0,
    'In the Southern Hemisphere, the Coriolis effect deflects air to the left. Around high pressure, air moves outward and is deflected anticlockwise. Around low pressure, air spirals clockwise inward.'),
  t(7, '### Weather Associated with Pressure Systems\n\n**High-pressure systems (anticyclones):**\n- Descending (subsiding) air.\n- Clear skies, dry conditions.\n- Light winds.\n- In winter: frost, fog, temperature inversions, poor air quality.\n\n**Low-pressure systems (depressions):**\n- Rising air.\n- Cloudy skies, rain likely.\n- Stronger winds (isobars closer together).\n- Associated with frontal systems.\n\n### Weather Associated with a Cold Front\n\nCold fronts are the most common weather feature affecting the Western Cape in winter.\n\n**Ahead of the cold front:**\n- Warm northerly or north-westerly winds.\n- Increasing cloud (cirrus, then thicker cloud).\n- Warm temperatures, dropping pressure.\n\n**During passage:**\n- Sudden temperature drop.\n- Heavy rain, sometimes thunderstorms.\n- Strong gusty south-westerly winds.\n- Cumulonimbus and nimbostratus clouds.\n\n**Behind the cold front:**\n- Cool, clear conditions.\n- South-westerly winds easing.\n- Pressure rises as the high-pressure system moves in.\n- In winter: cold, clear nights with frost on the Highveld.'),
  fb(8, 'Ahead of a cold front, winds typically blow from the ___ (direction). After the front passes, the wind shifts to the ___ and temperatures drop sharply.',
    ['north-west', 'south-west'],
    'Before a cold front, warm NW winds prevail. The frontal passage brings a wind shift to SW or S with a sudden temperature drop and heavy rain, followed by clearing conditions.'),
  q(9, 'Closely spaced isobars on a synoptic map indicate:',
    ['A steep pressure gradient and strong winds', 'Calm conditions with light breezes', 'High temperatures', 'Heavy snowfall'], 0,
    'When isobars are close together, pressure changes rapidly over a short distance (steep pressure gradient). This creates a strong pressure gradient force, producing strong winds.'),
  t(10, '### South African Weather Patterns\n\n**Summer (October -- March):**\n- The South Indian High moves south-east, and a continental low develops over the heated interior.\n- Moist air from the Indian Ocean is drawn onto the land.\n- **Convectional thunderstorms** develop over the Highveld and interior most afternoons.\n- The Eastern Cape and KwaZulu-Natal receive orographic rainfall as moist air rises over the Drakensberg.\n\n**Winter (April -- September):**\n- Cold fronts associated with mid-latitude cyclones bring rain to the **Western Cape** (winter rainfall region).\n- The interior is dominated by high pressure -- cold, dry, and clear.\n- Berg winds (hot, dry foehn-type winds) occur along the east coast.\n- Frost is common on the Highveld and in the Free State.\n\n**Year-round:**\n- The narrow southern coast (Garden Route) receives rainfall in all seasons from both frontal systems and moisture from the Indian Ocean.'),
];

// =============================================================================
// CHAPTER 6: Precipitation (Term 1)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Types of Precipitation\n\n**Precipitation** is any form of water that falls from the atmosphere to the Earth\'s surface.\n\n### Forms of Precipitation\n\n| Type | Description | Formation |\n|------|-------------|----------|\n| **Rain** | Liquid water droplets (>0.5 mm diameter) | Cloud droplets grow by collision and coalescence or the Bergeron process |\n| **Drizzle** | Very fine droplets (<0.5 mm) | Light precipitation from stratus clouds |\n| **Snow** | Ice crystals or snowflakes | Water vapour deposits directly as ice in cold clouds |\n| **Sleet** | Mix of rain and ice or frozen raindrops | Rain falls through a cold layer and partially freezes |\n| **Hail** | Balls of ice (5 mm to >10 cm) | Updrafts in cumulonimbus clouds carry ice pellets up and down through freezing and supercooled zones, adding layers |\n| **Frost** | Ice crystals on surfaces | Sublimation or freezing of dew when temperature is below 0 degrees C |\n\n### How Rain Forms\n\n**Collision-coalescence process** (warm clouds):\n- Large droplets fall faster and collide with smaller ones.\n- They merge (coalesce) and grow until heavy enough to fall as rain.\n\n**Bergeron (ice crystal) process** (cold clouds):\n- Ice crystals and supercooled water droplets coexist.\n- Ice crystals grow at the expense of droplets (ice attracts vapour more readily).\n- Crystals grow heavy enough to fall; they melt into rain if passing through warm air below.'),
  q(2, 'Hailstones grow larger because:',
    ['Updrafts carry ice pellets up and down through freezing zones, adding layers of ice', 'They absorb rain as they fall', 'Cold air at the surface freezes raindrops into balls', 'Ground-level frost combines into ice balls'], 0,
    'Strong updrafts in cumulonimbus clouds carry hailstones upward repeatedly. Each pass through the supercooled zone adds a new layer of ice, creating the layered structure visible when a hailstone is cut open.',
    ['Think about what kind of cloud has strong enough updrafts to support ice pellets being carried up and down multiple times.']),
  t(3, '## Types of Rainfall\n\nRainfall is classified by what causes the air to rise.\n\n### 1. Convectional Rainfall\n\n- **Cause:** Intense surface heating causes air to rise rapidly (convection).\n- **Process:** Hot ground heats the air above it. The warm air rises, cools adiabatically, reaches the dew point, and condensation forms cumulus and cumulonimbus clouds.\n- **Characteristics:** Heavy, short bursts of rain, often with thunder and lightning. Usually in the afternoon/evening.\n- **Where in SA:** Most common rainfall type on the **Highveld** and interior in **summer**. Afternoon thunderstorms in Gauteng are classic examples.\n\n### 2. Orographic (Relief) Rainfall\n\n- **Cause:** Moist air is forced to rise over mountains or escarpments.\n- **Process:** Air rises on the windward side, cools, condenses, and produces rain. On the leeward side, the air descends, warms, and produces dry conditions (**rain shadow**).\n- **Where in SA:** The eastern slopes of the **Drakensberg** receive heavy orographic rainfall from moist Indian Ocean air. The Mpumalanga escarpment near Sabie and Graskop receives over 1 500 mm per year.'),
  t(4, '### 3. Frontal (Cyclonic) Rainfall\n\n- **Cause:** Two air masses of different temperatures meet at a front. Warm air is forced to rise over the cold air.\n- **Process:** Along a cold front, cold air pushes under warm air, forcing it upward rapidly. Along a warm front, warm air rides gently over cold air.\n- **Characteristics:** Cold fronts bring heavy, short-lived rain; warm fronts bring lighter, prolonged rain.\n- **Where in SA:** The **Western Cape** receives most of its rainfall from cold fronts in **winter**.\n\n### Rainfall Distribution in South Africa\n\n| Region | Rainfall Pattern | Amount | Cause |\n|--------|-----------------|--------|-------|\n| **Western Cape** | Winter rainfall | 500 -- 600 mm | Cold fronts from the mid-latitude cyclone belt |\n| **Interior (Highveld)** | Summer rainfall | 500 -- 700 mm | Convectional thunderstorms |\n| **Eastern coast (KZN)** | Summer rainfall, some all year | 800 -- 1 200 mm | Orographic and convectional |\n| **Southern Cape (Garden Route)** | All-year rainfall | 700 -- 1 000 mm | Frontal in winter, orographic in summer |\n| **Northern Cape (interior)** | Low summer rainfall | Less than 250 mm | Semi-arid, far from moisture sources |'),
  fb(5, 'The three types of rainfall are convectional, ___, and frontal. The Western Cape receives rainfall mainly in ___ from cold fronts.',
    ['orographic', 'winter'],
    'Convectional (surface heating), orographic (mountain uplift), and frontal (air mass interaction) are the three rainfall types. The Western Cape\'s winter rainfall comes from cold fronts in the westerly wind belt.'),
  q(6, 'Why does the area east of the Drakensberg receive high rainfall while the interior is drier?',
    ['Moist Indian Ocean air is forced to rise over the Drakensberg, creating a rain shadow on the interior side', 'The interior is closer to the equator', 'The Benguela Current brings rain only to the east', 'Frontal systems only affect the eastern coast'], 0,
    'Moist air from the Indian Ocean hits the Drakensberg and is forced upward (orographic uplift), producing heavy rainfall on the eastern slopes. The air descends on the western (leeward) side, warming and drying, creating a rain shadow over the interior.',
    ['Think about what happens to moist air when it is forced over a mountain range.']),
  t(7, '## Weather Station Models and Synoptic Data\n\nOn synoptic maps, data from weather stations is plotted using a **station model** -- a standardised diagram showing multiple weather elements at a single point.\n\n### Reading a Station Model\n\n- **Centre circle:** Cloud cover (filled sections indicate oktas).\n- **Wind shaft:** A line extending from the circle shows wind direction (points in the direction FROM which the wind blows).\n- **Wind barbs/feathers:** Short lines or flags on the wind shaft indicate speed:\n  - Short barb = 5 knots\n  - Long barb = 10 knots\n  - Triangle/pennant = 50 knots\n- **Temperature:** Written to the upper left of the circle (degrees C).\n- **Dew point:** Written to the lower left.\n- **Pressure:** Written to the upper right (last three digits, e.g., 132 = 1 013.2 hPa).\n- **Weather symbol:** Between temperature and dew point, indicating current weather (rain, fog, snow, etc.).\n\n### Cloud Cover Symbols\n\n| Symbol | Oktas | Description |\n|--------|-------|-----------|\n| Empty circle | 0 | Clear sky |\n| Quarter filled | 2 | Few clouds |\n| Half filled | 4 | Scattered clouds |\n| Three-quarter filled | 6 | Broken cloud |\n| Fully filled | 8 | Overcast |'),
  fb(8, 'On a station model, a long barb on the wind shaft represents ___ knots and a short barb represents ___ knots. Cloud cover is measured in ___.',
    ['10', '5', 'oktas'],
    'Wind barbs indicate speed: short = 5 knots, long = 10 knots, pennant = 50 knots. Cloud cover uses the oktas scale from 0 (clear) to 8 (overcast).'),
  q(9, 'On a station model, the wind shaft points in the direction:',
    ['From which the wind blows', 'Toward which the wind blows', 'Of the nearest pressure system', 'Of the Sun at midday'], 0,
    'The wind shaft extends from the station circle in the direction from which the wind originates. A shaft pointing from the south-east means the wind is a south-east wind, blowing FROM the south-east.'),
];

// =============================================================================
// CHAPTER 7: The Structure of the Earth and Plate Tectonics (Term 2)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## The Internal Structure of the Earth\n\nThe Earth is made up of several concentric layers, each with different composition and physical properties.\n\n### Layers of the Earth\n\n| Layer | Depth | Composition | State | Density |\n|-------|-------|-------------|-------|--------|\n| **Crust** | 0 -- 70 km | Silicates | Solid | Lowest (2.7 -- 3.0 g/cm3) |\n| **Mantle** | 70 -- 2 900 km | Iron-magnesium silicates | Semi-solid (plastic) | Medium (3.3 -- 5.5 g/cm3) |\n| **Outer core** | 2 900 -- 5 100 km | Iron and nickel | Liquid | High (10 -- 12 g/cm3) |\n| **Inner core** | 5 100 -- 6 370 km | Iron and nickel | Solid (extreme pressure) | Highest (13 g/cm3) |\n\n### Two Types of Crust\n\n| Feature | Continental Crust | Oceanic Crust |\n|---------|-------------------|---------------|\n| **Thickness** | 25 -- 70 km | 5 -- 10 km |\n| **Composition** | Mainly granite (SiAl -- silica and alumina) | Mainly basalt (SiMa -- silica and magnesia) |\n| **Density** | Lower (2.7 g/cm3) | Higher (3.0 g/cm3) |\n| **Age** | Up to 4 billion years | Usually less than 200 million years |\n\nThe **lithosphere** (crust + upper rigid mantle) sits on top of the **asthenosphere** (a partially molten, plastic layer in the upper mantle where convection currents flow).'),
  q(2, 'The asthenosphere is important for plate tectonics because:',
    ['It is a partially molten, plastic layer where convection currents drive plate movement', 'It is the solid inner core of the Earth', 'It is where earthquakes originate', 'It contains all the Earth\'s water'], 0,
    'The asthenosphere is a semi-plastic zone in the upper mantle. Heat from the core creates convection currents in this layer, which drag the rigid lithospheric plates, causing them to move.'),
  fb(3, 'The Earth\'s crust and upper rigid mantle form the ___. This sits on the semi-plastic ___.',
    ['lithosphere', 'asthenosphere'],
    'The lithosphere is the rigid outer shell (crust + uppermost mantle) that is broken into tectonic plates. These plates "float" on the plastic asthenosphere below.'),
  t(4, '## Plate Tectonics\n\n### What is Plate Tectonics?\n\nThe theory of **plate tectonics** states that the Earth\'s lithosphere is broken into large, rigid pieces called **tectonic plates** that move slowly over the asthenosphere.\n\n### Evidence for Continental Drift and Plate Tectonics\n\nAlfred Wegener proposed **continental drift** in 1912. Key evidence includes:\n\n1. **Continental fit**: The coastlines of South America and Africa fit together like jigsaw pieces.\n2. **Fossil evidence**: The same fossils of land-dwelling animals (Mesosaurus, Lystrosaurus) are found on continents now separated by oceans. They could not have swum across.\n3. **Rock and mountain matches**: Mountain chains and rock formations of the same age and type align across continents (e.g., Cape Fold Belt in SA matches mountains in Argentina).\n4. **Glacial evidence**: Scratches on rocks (striations) and glacial deposits (tillite) from the same ancient ice age are found in Africa, South America, India, Australia, and Antarctica -- all were once part of **Gondwana**.\n5. **Paleomagnetism**: Rocks on the ocean floor show alternating magnetic stripes, recording magnetic pole reversals as new crust forms at mid-ocean ridges.'),
  q(5, 'Which of the following is evidence that Africa and South America were once joined?',
    ['Matching fossils of Mesosaurus, a freshwater reptile, are found on both continents', 'Both continents have tropical rainforests', 'They have the same weather patterns today', 'They are at the same latitude'], 0,
    'Mesosaurus was a small freshwater reptile that could not have crossed the Atlantic Ocean. Its fossils are found in both southern Africa and eastern South America, indicating these landmasses were once connected as part of Gondwana.'),
  t(6, '### Driving Force: Convection Currents\n\nTectonic plates move because of **convection currents** in the semi-plastic asthenosphere:\n\n1. **Radioactive decay** in the Earth\'s core and mantle generates intense heat.\n2. Hot material in the lower mantle rises slowly toward the surface.\n3. At the top of the mantle, the material moves sideways, dragging the overlying plate.\n4. As the material cools, it sinks back down, completing the convection cell.\n\nThis process is very slow -- plates move at speeds of **2 -- 15 cm per year** (about the rate your fingernails grow).\n\n### Major Tectonic Plates\n\nThe Earth\'s lithosphere is divided into approximately 15 major plates, including:\n- African Plate\n- South American Plate\n- Eurasian Plate\n- North American Plate\n- Pacific Plate (mostly oceanic)\n- Antarctic Plate\n- Indo-Australian Plate\n- Nazca Plate (oceanic, Pacific)\n\nSouth Africa sits in the interior of the **African Plate**, far from any plate boundary, making it relatively stable geologically.'),
  fb(7, 'Tectonic plates move due to ___ currents in the asthenosphere, driven by heat from ___ decay in the Earth\'s interior.',
    ['convection', 'radioactive'],
    'Convection currents in the semi-plastic asthenosphere are powered by heat from radioactive decay. Hot material rises, moves laterally (dragging plates), cools, and sinks.'),
  t(8, '### Types of Plate Boundaries\n\n| Boundary Type | Movement | What Happens | Examples |\n|---------------|----------|-------------|----------|\n| **Divergent (constructive)** | Plates move apart | New crust forms as magma rises to fill the gap (mid-ocean ridges, rift valleys) | Mid-Atlantic Ridge; East African Rift Valley |\n| **Convergent (destructive)** | Plates move together | Crust is destroyed by subduction or compressed into fold mountains | Andes (Nazca under South American); Himalayas (India into Eurasia) |\n| **Transform (conservative)** | Plates slide past each other | Crust is neither created nor destroyed; friction causes earthquakes | San Andreas Fault (California) |\n\n**Subduction:** When oceanic crust collides with continental crust, the denser oceanic plate is forced under (subducted beneath) the lighter continental plate. This creates a **deep ocean trench**, a **volcanic arc**, and earthquakes.\n\n**Continental collision:** When two continental plates collide, neither subducts (both are too light). Instead, the crust crumples upward to form **fold mountains** (e.g., the Himalayas).'),
  q(9, 'At a divergent plate boundary, what occurs?',
    ['Plates move apart and new crust forms as magma rises', 'Plates collide and one is pushed under the other', 'Plates slide horizontally past each other', 'Plates are compressed into fold mountains'], 0,
    'At divergent boundaries, plates separate. Magma from the asthenosphere rises to fill the gap, solidifying as new oceanic crust. This occurs at mid-ocean ridges (e.g., Mid-Atlantic Ridge) and continental rift zones (e.g., East African Rift).'),
  fb(10, 'When oceanic crust collides with continental crust, the denser ___ plate is forced under the lighter ___ plate. This process is called ___.',
    ['oceanic', 'continental', 'subduction'],
    'Oceanic crust (basalt, ~3.0 g/cm3) is denser than continental crust (granite, ~2.7 g/cm3). The denser plate sinks into the mantle in a process called subduction, creating trenches and volcanic activity.'),
];

// =============================================================================
// CHAPTER 8: Folding, Faulting, and Earthquakes (Term 2)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Folding\n\nWhen tectonic plates collide, the compressive forces can cause rock layers to bend and crumple. This process is called **folding**.\n\n### Parts of a Fold\n\n| Term | Definition |\n|------|------------|\n| **Anticline** | An upward arch (like an inverted U). The oldest rocks are in the centre. |\n| **Syncline** | A downward trough (like a U). The youngest rocks are in the centre. |\n| **Limb** | The side of a fold (connects the anticline crest to the syncline trough). |\n| **Axis (hinge line)** | The imaginary line along the crest of an anticline or the trough of a syncline. |\n| **Axial plane** | An imaginary surface connecting the axes of an anticline and syncline. |\n\n### Types of Folds\n\n| Type | Description |\n|------|------------|\n| **Symmetrical fold** | Both limbs dip at equal angles. |\n| **Asymmetrical fold** | One limb dips more steeply than the other. |\n| **Overturned fold** | One limb is pushed beyond vertical, so both limbs dip in the same direction. |\n| **Recumbent fold** | An extreme overturned fold where the axial plane is nearly horizontal. |\n| **Nappe** | A recumbent fold that has been pushed forward along a thrust fault. |'),
  q(2, 'In an anticline, the oldest rocks are found:',
    ['In the centre (core) of the fold', 'At the edges of the fold', 'Only at the surface', 'Beneath the fold'], 0,
    'In an anticline (upward arch), erosion exposes the oldest rocks at the centre because the folding pushes them up. The youngest rocks are on the outer limbs. In a syncline, it is the opposite.'),
  t(3, '### Fold Mountains\n\n**Fold mountains** are formed when tectonic plates converge and compress sedimentary layers, folding them into mountain ranges.\n\n**Formation process:**\n1. Sediments accumulate in a **geosyncline** (a basin between converging plates, often a sea).\n2. Convergent plate movement compresses the sediments.\n3. The layers are folded, faulted, and uplifted to form mountains.\n4. The process takes millions of years.\n\n**South African example -- The Cape Fold Belt:**\n- Formed approximately 250 -- 330 million years ago during the late Palaeozoic.\n- Created when Gondwana was assembling and compressive forces folded the sedimentary rocks.\n- Extends from the Cedarberg through the Boland mountains to the Outeniqua and Swartberg ranges.\n- Made of folded **Table Mountain Sandstone** (quartzite) and **Bokkeveld shale**.\n- The sandstone forms the ridges (anticlines), and the shale erodes to form the valleys (synclines).\n\n**Other examples:**\n- Himalayas (India colliding with Eurasia -- still rising)\n- Andes (Nazca Plate subducting under South America)\n- Alps (Africa pushing into Europe)'),
  fb(4, 'An upward arch in folded rock is called an ___. A downward trough is called a ___. The Cape Fold Belt in South Africa is an example of ___ mountains.',
    ['anticline', 'syncline', 'fold'],
    'Anticlines arch upward, synclines trough downward. The Cape Fold Belt (extending from the Cedarberg to the Swartberg) was formed by compression during Gondwana\'s assembly.'),
  t(5, '## Faulting\n\n**Faulting** occurs when rocks are subjected to stress and fracture along a plane. The rocks on either side of the **fault plane** move relative to each other.\n\n### Types of Faults\n\n| Fault Type | Stress | Movement | Associated Landform |\n|-----------|--------|----------|--------------------|\n| **Normal fault** | Tension (stretching) | Hanging wall moves DOWN relative to footwall | Rift valleys, escarpments |\n| **Reverse fault** | Compression (pushing together) | Hanging wall moves UP relative to footwall | Uplifted blocks, thrust sheets |\n| **Thrust fault** | Extreme compression | Low-angle reverse fault; older rocks pushed over younger | Nappes in fold mountains |\n| **Strike-slip (lateral) fault** | Shear (side-by-side) | Horizontal movement | Linear valleys, offset features |\n\n### Landforms from Faulting\n\n- **Horst**: A raised block between two normal faults (e.g., a block mountain).\n- **Graben**: A dropped block between two normal faults (forms a rift valley).\n- **Rift valley**: A long, narrow depression formed by a series of grabens.\n\n**South African examples:**\n- The **Great Rift Valley** of East Africa is the world\'s largest rift system, extending from Mozambique through East Africa to the Red Sea. It is a divergent plate boundary where the African Plate is splitting.\n- The **Tulbagh Fault** in the Western Cape caused a damaging earthquake in 1969.'),
  q(6, 'A horst is best described as:',
    ['A raised block of land between two normal faults', 'A sunken block forming a valley', 'A lateral movement along a fault', 'A folded mountain range'], 0,
    'A horst is an uplifted block bounded by normal faults on both sides. The blocks on either side have dropped down, leaving the horst standing higher. It forms a flat-topped block mountain or plateau.'),
  fb(7, 'A dropped block between two normal faults is called a ___. A raised block between two normal faults is called a ___.',
    ['graben', 'horst'],
    'A graben (German for "ditch") is the down-dropped block forming a rift valley. A horst (German for "eyrie") is the raised block standing between two down-faulted blocks.'),
  t(8, '## Earthquakes\n\n### What is an Earthquake?\n\nAn **earthquake** is a sudden release of energy in the Earth\'s crust or upper mantle, producing seismic waves that shake the ground.\n\n### Key Terms\n\n| Term | Definition |\n|------|------------|\n| **Focus (hypocentre)** | The point underground where the earthquake originates. |\n| **Epicentre** | The point on the Earth\'s surface directly above the focus. |\n| **Seismic waves** | Vibrations that travel outward from the focus through the Earth. |\n| **Fault line** | The fracture along which movement occurs. |\n| **Aftershocks** | Smaller earthquakes that follow the main event as rocks settle. |\n\n### Types of Seismic Waves\n\n| Wave Type | Description | Damage Potential |\n|-----------|------------|------------------|\n| **P-waves (Primary)** | Fastest; compression waves; travel through solids, liquids, and gases | Low |\n| **S-waves (Secondary)** | Slower; shear waves; travel through solids only | Moderate |\n| **Surface waves (L-waves)** | Slowest; travel along the surface; two types (Love and Rayleigh) | Highest -- cause most damage |'),
  q(9, 'The point on the Earth\'s surface directly above an earthquake\'s focus is called the:',
    ['Epicentre', 'Focus', 'Fault line', 'Seismic zone'], 0,
    'The epicentre is the point on the surface directly above the focus (the underground point of origin). The most intense shaking is usually felt at the epicentre.'),
  fb(10, 'The underground point where an earthquake originates is the ___. The point on the surface directly above it is the ___.',
    ['focus', 'epicentre'],
    'The focus (hypocentre) is where the energy is released below ground. The epicentre is the surface point directly above the focus, where shaking is usually strongest.'),
  t(11, '### Measuring Earthquakes\n\n| Scale | What It Measures | Details |\n|-------|-----------------|--------|\n| **Richter Scale** | Magnitude (energy released) | Logarithmic: each whole number = 10x more ground motion, ~32x more energy. |\n| **Mercalli Scale** | Intensity (effects on people and structures) | Ranges from I (not felt) to XII (total destruction). Varies with distance from epicentre. |\n\n### Effects of Earthquakes\n\n**Primary effects** (direct):\n- Ground shaking, surface rupture.\n- Building collapse, infrastructure damage.\n- Death and injury.\n\n**Secondary effects** (indirect):\n- **Tsunamis** -- triggered by underwater earthquakes displacing water.\n- **Landslides** -- shaking destabilises slopes.\n- **Fires** -- from broken gas pipes and electrical lines.\n- **Liquefaction** -- saturated soil behaves like a liquid.\n\n**South African earthquakes:**\n- **Tulbagh earthquake (1969)**: Magnitude 6.3, the most damaging in SA\'s recorded history. Destroyed buildings, killed 12 people.\n- **Orkney earthquake (2014)**: Magnitude 5.5, induced by deep gold mining activities in the North West Province.\n- SA is relatively stable (mid-plate), but mining-induced seismicity is a growing concern on the Witwatersrand.'),
];

// =============================================================================
// CHAPTER 9: Volcanoes (Term 2)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Volcanoes\n\n### What is a Volcano?\n\nA **volcano** is an opening in the Earth\'s crust through which **magma** (molten rock), ash, and gases are expelled. When magma reaches the surface, it is called **lava**.\n\n### Where Volcanoes Occur\n\nMost volcanoes are found along **plate boundaries**, particularly:\n\n1. **Convergent boundaries** (subduction zones) -- e.g., the Pacific Ring of Fire, Andes.\n2. **Divergent boundaries** -- e.g., Mid-Atlantic Ridge, East African Rift.\n3. **Hotspots** -- plumes of magma rising from deep in the mantle, independent of plate boundaries (e.g., Hawaiian Islands, Yellowstone).\n\nThe **Pacific Ring of Fire** contains approximately 75% of the world\'s active volcanoes, encircling the Pacific Ocean where the Pacific Plate meets surrounding plates.\n\n### Volcanic Materials\n\n| Material | Description |\n|----------|------------|\n| **Lava** | Molten rock on the surface. Can be runny (basaltic) or thick and sticky (andesitic/rhyolitic). |\n| **Ash** | Fine particles of pulverised rock and glass blown into the air. |\n| **Pyroclastic fragments** | Larger pieces: volcanic bombs (>64 mm), lapilli (2-64 mm), ash (<2 mm). |\n| **Gases** | Water vapour, CO2, sulphur dioxide, hydrogen sulphide. |'),
  q(2, 'Approximately what percentage of the world\'s active volcanoes are found along the Pacific Ring of Fire?',
    ['75%', '50%', '25%', '90%'], 0,
    'The Pacific Ring of Fire contains about 75% of the world\'s active volcanoes. It encircles the Pacific Ocean along subduction zones where the Pacific Plate meets other plates.'),
  t(3, '### Types of Volcanoes\n\n| Type | Shape | Eruption Style | Lava Type | Example |\n|------|-------|---------------|-----------|--------|\n| **Shield volcano** | Broad, gently sloping dome | Quiet, effusive (flowing lava) | Basaltic (low viscosity, runny) | Mauna Loa, Hawaii |\n| **Composite (stratovolcano)** | Steep, symmetrical cone | Alternating explosive and effusive | Andesitic (medium viscosity) | Mount Fuji, Japan; Kilimanjaro |\n| **Cinder cone** | Small, steep-sided cone | Explosive, throwing out cinders and ash | Variable | Paricutin, Mexico |\n| **Caldera** | Large, basin-shaped depression | Catastrophic eruption empties the magma chamber; the summit collapses inward | Variable | Yellowstone, USA; Ngorongoro, Tanzania |\n\n### Viscosity and Eruption Style\n\n- **Low viscosity (runny) lava** (basaltic): Flows easily, gases escape gently. Produces **quiet eruptions** and shield volcanoes.\n- **High viscosity (thick, sticky) lava** (andesitic/rhyolitic): Traps gases. Pressure builds until it is released in **violent, explosive eruptions** with pyroclastic flows and ash clouds.'),
  fb(4, 'Shield volcanoes have ___ (runny/sticky) lava and quiet eruptions. Composite volcanoes have ___ (runny/sticky) lava and more explosive eruptions.',
    ['runny', 'sticky'],
    'Shield volcanoes produce basaltic lava with low viscosity (runny), allowing gases to escape gently. Composite volcanoes produce andesitic/rhyolitic lava with high viscosity (sticky), trapping gases and causing explosive eruptions.'),
  t(5, '### Effects of Volcanic Eruptions\n\n**Negative effects:**\n- **Loss of life** from lava flows, pyroclastic flows, lahars (volcanic mudflows), ash fall, and toxic gases.\n- **Destruction of property and infrastructure** -- buildings, roads, farmland buried.\n- **Climate effects** -- volcanic ash and sulphur dioxide reflect sunlight, causing temporary **global cooling** (e.g., Mount Pinatubo, 1991, cooled global temperatures by ~0.5 degrees C for 2 years).\n- **Air travel disruption** -- volcanic ash damages jet engines (e.g., Eyjafjallajokull, Iceland, 2010).\n- **Tsunamis** -- underwater eruptions or flank collapses can trigger tsunamis.\n\n**Positive effects:**\n- **Fertile volcanic soils** -- weathered volcanic rock produces extremely productive soil (e.g., Java, Indonesia).\n- **Geothermal energy** -- heat from volcanic activity can be used for electricity and heating (e.g., Iceland, Kenya).\n- **Mineral deposits** -- volcanic activity creates deposits of gold, silver, copper, and diamonds.\n- **Tourism** -- volcanic landscapes attract visitors (e.g., Kilimanjaro, Table Mountain -- though not an active volcano, it is of volcanic origin).\n- **New land** -- lava flows create new land (e.g., Hawaii).'),
  q(6, 'How can volcanic eruptions cause temporary global cooling?',
    ['Ash and sulphur dioxide in the upper atmosphere reflect incoming solar radiation', 'Lava absorbs sunlight before it reaches the ground', 'Volcanic gases increase the ozone layer', 'Eruptions create more cloud cover over the entire planet'], 0,
    'Large eruptions inject ash and sulphur dioxide into the stratosphere. These particles reflect incoming solar radiation back to space, reducing the amount reaching the surface and causing measurable cooling for 1-3 years.'),
  t(7, '### Reducing the Impact of Volcanic Eruptions\n\n**Prediction and monitoring:**\n- **Seismographs** detect increased earthquake activity around the volcano.\n- **Tiltmeters** measure ground swelling as magma rises.\n- **Gas monitoring** -- increases in sulphur dioxide emissions signal rising magma.\n- **Satellite monitoring** -- thermal imaging detects hotspots and ash clouds.\n- **Historical records** -- studying past eruptions helps predict future behaviour.\n\n**Preparedness:**\n- **Hazard mapping** -- identifying zones at risk from lava flows, pyroclastic flows, lahars, and ash fall.\n- **Evacuation plans** -- clear routes and procedures for moving people to safety.\n- **Building codes** -- stronger roofs to withstand ash accumulation.\n- **Education** -- teaching communities to recognise warning signs.\n- **Land-use planning** -- avoiding settlement in high-risk zones.\n\n**South African context:**\n- South Africa has no active volcanoes because it is in the interior of the African Plate, far from any plate boundary.\n- However, the East African Rift System, which is a divergent boundary, extends into Mozambique and could eventually affect the region over millions of years.\n- Ancient volcanic activity created features like the Pilanesberg (an ancient volcanic complex) and the Karoo dolerite intrusions.'),
  fb(8, 'South Africa has no active volcanoes because it is located in the ___ of the African Plate, far from plate ___.',
    ['interior', 'boundaries'],
    'Active volcanoes are concentrated along plate boundaries. South Africa sits in the stable interior of the African Plate, far from convergent, divergent, or transform boundaries.'),
  q(9, 'Which instrument measures ground swelling caused by rising magma beneath a volcano?',
    ['Tiltmeter', 'Seismograph', 'Barometer', 'Anemometer'], 0,
    'Tiltmeters measure tiny changes in the angle of the ground surface. As magma rises inside a volcano, the mountain swells outward and the tiltmeters detect this deformation, providing an early warning of possible eruption.',
    ['The name of the instrument gives a clue -- it measures the "tilt" of the ground.']),
];

// =============================================================================
// CHAPTER 10: Population Distribution, Density, and Structure (Term 3)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Population Distribution and Density\n\n### Key Concepts\n\n**Population distribution** describes how people are spread across an area. The distribution is **uneven** -- some areas are densely populated while others are sparsely populated or uninhabited.\n\n**Population density** is the average number of people per unit area (usually per km squared).\n\n**Formula:** Population density = Total population / Total area (km squared)\n\n**Example:** If South Africa has approximately 62 million people and an area of 1 221 037 km squared:\n- Population density = 62 000 000 / 1 221 037 = approximately **51 people per km squared**.\n\nHowever, this average hides huge variation -- Gauteng is extremely densely populated, while the Northern Cape is very sparsely populated.\n\n### Factors Affecting Population Distribution\n\n| Factor | Dense Population | Sparse Population |\n|--------|-----------------|-------------------|\n| **Climate** | Moderate rainfall, mild temperatures | Extreme heat, cold, aridity |\n| **Relief** | Flat or gently undulating land | Steep mountains, rugged terrain |\n| **Water supply** | Near rivers, lakes, reliable rainfall | Dry interior, desert |\n| **Soil fertility** | Fertile soils for farming | Poor or thin soils |\n| **Resources** | Near minerals, fishing, ports | Remote from resources |\n| **Transport** | Good road/rail access | Inaccessible areas |\n| **Employment** | Near cities, industries, mines | Few economic opportunities |'),
  q(2, 'Population density is calculated by:',
    ['Dividing total population by total area in km squared', 'Multiplying population by area', 'Dividing area by population', 'Adding births and subtracting deaths'], 0,
    'Population density = total population / total area. It gives the average number of people per square kilometre, allowing comparison between different areas.'),
  fb(3, 'Population ___ describes how people are spread across an area. Population ___ is the number of people per km squared.',
    ['distribution', 'density'],
    'Distribution is the spatial pattern (where people live). Density is a numerical measure of how many people live in a given area.'),
  t(4, '### Population Distribution in South Africa\n\n**Densely populated areas:**\n- **Gauteng** -- the economic hub (Johannesburg, Pretoria). South Africa\'s smallest province by area but most populous.\n- **KwaZulu-Natal** -- Durban metro and surrounding areas.\n- **Western Cape** -- Cape Town metro.\n- Mining towns and industrial centres.\n\n**Sparsely populated areas:**\n- **Northern Cape** -- South Africa\'s largest province by area but least populous. Arid climate, limited water.\n- **Parts of Limpopo and North West** -- rural, limited infrastructure.\n- Mountainous areas (Drakensberg, parts of Eastern Cape highlands).\n\n### Factors Specific to SA\n\n- **Apartheid legacy**: Forced removals and homeland policies concentrated Black South Africans in specific areas (former homelands like Transkei, Ciskei, Venda, Bophuthatswana). These areas became overpopulated and under-resourced.\n- **Post-1994 urbanisation**: Freedom of movement led to massive migration to cities, especially Gauteng.\n- **Mining**: Gold (Witwatersrand), platinum (Bushveld Complex), diamonds (Kimberley) attracted dense settlement.\n- **Water availability**: Settlement follows river valleys and rainfall patterns.'),
  t(5, '## Population Structure\n\n### Population Pyramids\n\nA **population pyramid** (age-sex pyramid) is a bar graph showing the age and sex composition of a population. Males are on the left, females on the right. Age groups are stacked from youngest (bottom) to oldest (top).\n\n### Three Basic Pyramid Shapes\n\n| Shape | Description | Indicates | Example |\n|-------|-------------|-----------|--------|\n| **Expansive (wide base, narrow top)** | Many young people, few elderly | High birth rate, high death rate, low life expectancy. Rapid population growth. | Nigeria, Mozambique |\n| **Constrictive (narrow base, wider middle)** | Fewer young people, more working-age and elderly | Low birth rate, low death rate, ageing population. Slow growth or decline. | Germany, Japan |\n| **Stationary (roughly even sides)** | Similar numbers in each age group | Birth rate approximately equals death rate. Stable population. | Sweden, Australia |\n\n### Reading a Population Pyramid\n\n- A **wide base** indicates high birth rates and a young population.\n- A **narrow top** indicates few elderly people (low life expectancy).\n- **Indentations** (sudden narrowing) may show the effects of war, disease (e.g., HIV/AIDS), or emigration.\n- **Bulges** may indicate a baby boom or immigration of working-age people.\n- The **dependency ratio** can be estimated: a large proportion of young and old compared to working-age indicates a high dependency ratio.'),
  q(6, 'A population pyramid with a very wide base and a narrow top indicates:',
    ['High birth rates, high death rates, and rapid population growth', 'Low birth rates, low death rates, and an ageing population', 'A stable population with equal births and deaths', 'Mass immigration of elderly people'], 0,
    'An expansive pyramid (wide base, narrow top) shows many young people being born (high birth rate) but few surviving to old age (high death rate/low life expectancy). This pattern is typical of developing countries.'),
  fb(7, 'A population pyramid with a wide base is called ___. A population pyramid with a narrow base and wider middle is called ___.',
    ['expansive', 'constrictive'],
    'Expansive pyramids (wide base) indicate rapid growth typical of developing countries. Constrictive pyramids (narrow base) indicate ageing populations typical of developed countries.'),
  t(8, '### South Africa\'s Population Structure\n\nSouth Africa\'s population pyramid has distinctive features:\n\n- **Moderately wide base** -- birth rates have decreased but remain higher than in developed countries.\n- **Indentation in the 25-49 age group** -- reflects the impact of **HIV/AIDS**, which has particularly affected the working-age population.\n- **More females than males in older age groups** -- women tend to live longer.\n- **Youth bulge** -- a large proportion of the population is under 25 years old.\n\n**Implications of SA\'s population structure:**\n\n| Feature | Implication |\n|---------|------------|\n| Youth bulge | High demand for education, training, and youth employment |\n| HIV/AIDS impact | Loss of economically active adults, orphans, healthcare costs |\n| High dependency ratio | Working-age population must support many dependants |\n| Declining birth rate | Gradual shift toward an older population structure |\n\n**Dependency ratio** = (Population 0-14 + Population 65+) / Population 15-64 x 100\n\nA high dependency ratio means more pressure on the working-age population to support dependants through taxes and social services.'),
  q(9, 'The indentation in South Africa\'s population pyramid in the 25-49 age group is primarily caused by:',
    ['The impact of HIV/AIDS on the working-age population', 'Mass emigration of young adults', 'A sudden drop in birth rates in the 1980s', 'War losses in the region'], 0,
    'HIV/AIDS has disproportionately affected South Africa\'s working-age population (15-49 years). The disease caused higher mortality in this age group, creating a visible indentation in the population pyramid.'),
];

// =============================================================================
// CHAPTER 11: Population Growth and Movements (Term 3)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Population Growth\n\n### Key Population Indicators\n\n| Indicator | Definition | Formula |\n|-----------|-----------|--------|\n| **Birth rate (BR)** | Number of live births per 1 000 people per year | (Births / Total population) x 1 000 |\n| **Death rate (DR)** | Number of deaths per 1 000 people per year | (Deaths / Total population) x 1 000 |\n| **Natural increase (NI)** | The difference between births and deaths | BR - DR |\n| **Growth rate** | Annual percentage change in population | ((BR - DR) / 10) + net migration effect |\n| **Fertility rate (TFR)** | Average number of children a woman has in her lifetime | Replacement level = ~2.1 |\n| **Infant mortality rate (IMR)** | Deaths of infants under 1 year per 1 000 live births | (Infant deaths / Live births) x 1 000 |\n| **Life expectancy** | Average number of years a person is expected to live | Calculated from mortality data |\n\n### Factors Influencing Population Growth\n\n**Factors increasing growth:** High birth rate, improved healthcare, better nutrition, immigration.\n\n**Factors decreasing growth:** Low birth rate, high death rate, emigration, disease (e.g., HIV/AIDS), war, famine.'),
  q(2, 'If a country has a birth rate of 25 per 1 000 and a death rate of 8 per 1 000, what is the natural increase?',
    ['17 per 1 000', '33 per 1 000', '3.125 per 1 000', '200 per 1 000'], 0,
    'Natural increase = Birth rate - Death rate = 25 - 8 = 17 per 1 000. This means for every 1 000 people, the population grows by 17 each year (from births and deaths alone, not counting migration).'),
  t(3, '### The Demographic Transition Model (DTM)\n\nThe **Demographic Transition Model** describes how a country\'s population changes as it develops economically.\n\n| Stage | Birth Rate | Death Rate | Growth | Description | Example |\n|-------|-----------|-----------|--------|------------|--------|\n| **Stage 1** | High | High | Low/stable | Pre-industrial. High BR and DR cancel out. | Few countries today |\n| **Stage 2** | High | Falling | Rapid growth | Healthcare improves, DR falls, but BR stays high. | Some parts of sub-Saharan Africa |\n| **Stage 3** | Falling | Low | Slowing growth | Urbanisation, education, family planning reduce BR. | South Africa, Brazil |\n| **Stage 4** | Low | Low | Low/stable | Post-industrial. BR and DR roughly equal. | UK, France, Australia |\n| **Stage 5** | Very low | Low | Decline | BR falls below DR. Population shrinks. Ageing population. | Japan, Germany, Italy |\n\n**South Africa\'s position:**\n- SA is generally placed in **Stage 3** -- birth rates are declining but still moderate, death rates are low (though elevated by HIV/AIDS).\n- Population is still growing but the rate of growth is slowing.\n- Urbanisation and education are driving the transition.'),
  fb(4, 'In Stage 2 of the Demographic Transition Model, death rates ___ while birth rates remain ___, causing rapid population growth.',
    ['fall', 'high'],
    'Stage 2 sees falling death rates (due to improved healthcare, sanitation, nutrition) while birth rates remain high (cultural norms, lack of family planning). This gap causes the fastest population growth.'),
  t(5, '### Overpopulation and Its Consequences\n\n**Overpopulation** occurs when the population exceeds the area\'s carrying capacity -- the ability of the environment and economy to support the people living there.\n\n**Consequences of overpopulation:**\n- Depletion of natural resources (water, soil, forests).\n- Environmental degradation (deforestation, pollution, loss of biodiversity).\n- Unemployment and poverty.\n- Housing shortages and growth of informal settlements.\n- Strain on services (schools, hospitals, sanitation).\n- Food insecurity.\n\n**Managing population growth:**\n- **Family planning programmes** -- access to contraception and reproductive health services.\n- **Education** -- especially girls\' education, which strongly correlates with lower birth rates.\n- **Economic development** -- as countries develop, birth rates tend to fall naturally.\n- **Government policies** -- incentives for smaller families, social security systems (so parents don\'t rely on children for old-age support).\n- **Healthcare** -- when child survival improves, parents have fewer children.'),
  q(6, 'Which factor has the strongest correlation with reduced birth rates in developing countries?',
    ['Educating girls and women', 'Building more hospitals', 'Increasing mining activity', 'Improving road infrastructure'], 0,
    'Research consistently shows that girls\' education is the single most effective factor in reducing birth rates. Educated women tend to marry later, use family planning, and have fewer children.',
    ['Think about what empowers women to make choices about family size.']),
  t(7, '## Population Movements (Migration)\n\n### Types of Migration\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Internal migration** | Movement within a country | Rural-to-urban migration in SA |\n| **International migration** | Movement between countries | Zimbabweans moving to SA |\n| **Temporary migration** | Moving for a limited time (intending to return) | Migrant mine workers |\n| **Permanent migration** | Moving with no intention to return | Emigration to Australia |\n| **Forced migration** | Compelled to move by circumstances | Refugees fleeing conflict |\n| **Voluntary migration** | Choosing to move for better opportunities | Job seekers moving to cities |\n\n### Push and Pull Factors\n\n**Push factors** (reasons to leave):\n- Poverty, unemployment, low wages.\n- Conflict, war, political instability.\n- Natural disasters (drought, floods).\n- Lack of services (schools, hospitals).\n- Discrimination, persecution.\n\n**Pull factors** (reasons to arrive):\n- Employment opportunities, higher wages.\n- Better services (education, healthcare).\n- Safety, political freedom.\n- Family reunification.\n- Better quality of life.'),
  fb(8, 'Reasons people leave an area are called ___ factors. Reasons people are attracted to a new area are called ___ factors.',
    ['push', 'pull'],
    'Push factors drive people away from their origin (poverty, conflict, disaster). Pull factors attract people to a destination (jobs, safety, services).'),
  t(9, '### Migration in South Africa\n\n**Historical migration:**\n- **Apartheid forced removals**: Millions of Black South Africans were relocated to homelands, disrupting communities and creating poverty.\n- **Migrant labour system**: Workers from homelands and neighbouring countries were recruited to work in mines and factories, living in hostels away from their families.\n\n**Post-1994 migration:**\n- **Rural-to-urban migration**: Freedom of movement led to massive urbanisation, especially to Gauteng, Cape Town, and Durban. Informal settlements (\"shack settlements\") grew rapidly.\n- **International immigration**: South Africa attracts migrants from Zimbabwe, Mozambique, Nigeria, DRC, and other African countries seeking economic opportunities.\n- **Brain drain**: Skilled South Africans (doctors, engineers, teachers) emigrating to the UK, Australia, Canada, and other countries.\n\n**Effects of migration on SA:**\n\n| On origin areas | On destination areas |\n|----------------|---------------------|\n| Loss of working-age population | Growing workforce |\n| Reduced pressure on resources | Strain on housing, water, services |\n| Remittances sent home (positive) | Cultural diversity |\n| Skills loss (brain drain) | Increased competition for jobs |\n| Family separation | Growth of informal settlements |'),
  q(10, 'What is the term for the loss of skilled workers through emigration?',
    ['Brain drain', 'Push migration', 'Forced removal', 'Natural decrease'], 0,
    'Brain drain refers to the emigration of skilled, educated workers (doctors, engineers, teachers) to other countries. This deprives the origin country of valuable human capital needed for development.'),
  fb(11, 'South Africa\'s post-1994 ___ migration caused rapid growth of informal settlements in cities. The loss of skilled workers through emigration is called ___.',
    ['rural-to-urban', 'brain drain'],
    'Freedom of movement after 1994 triggered massive rural-to-urban migration. Brain drain describes the emigration of skilled professionals to countries like the UK and Australia.'),
];

// =============================================================================
// CHAPTER 12: Water Management in South Africa (Term 4)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Water Resources in South Africa\n\n### South Africa\'s Water Situation\n\nSouth Africa is classified as a **water-scarce country**. The average rainfall is approximately **464 mm per year**, well below the world average of about 860 mm.\n\n### Water Sources\n\n| Source | Description | SA Context |\n|--------|-------------|------------|\n| **Rivers** | Surface water from flowing rivers | Major rivers: Orange, Vaal, Limpopo, Tugela, Breede |\n| **Dams** | Reservoirs storing river water | Over 4 800 registered dams; Gariep Dam (largest), Vaal Dam, Sterkfontein Dam |\n| **Groundwater** | Water stored underground in aquifers | Important in dry areas (Northern Cape, parts of Eastern Cape) |\n| **Springs** | Natural outflows of groundwater | Found along the Drakensberg and other geological formations |\n| **Rainfall** | Direct collection (rainwater harvesting) | Variable and unreliable in much of SA |\n\n### Why SA is Water-Scarce\n\n- Low average rainfall, unevenly distributed (wet east, dry west).\n- High evaporation rates due to warm temperatures and sunshine.\n- Few natural lakes.\n- Growing population and economy increase demand.\n- Pollution reduces usable water.\n- Climate change is making rainfall patterns less predictable.'),
  q(2, 'South Africa\'s average annual rainfall is approximately:',
    ['464 mm, well below the world average', '860 mm, equal to the world average', '1 200 mm, above the world average', '200 mm, making it a desert country'], 0,
    'South Africa\'s average rainfall of about 464 mm is roughly half the world average of 860 mm. This, combined with high evaporation, makes SA a water-scarce country.'),
  fb(3, 'South Africa\'s largest dam is the ___ Dam on the Orange River. The country receives approximately ___ mm of rain per year on average.',
    ['Gariep', '464'],
    'The Gariep Dam (formerly Hendrik Verwoerd Dam) on the Orange River in the Free State/Eastern Cape border is SA\'s largest reservoir. The 464 mm average rainfall classifies SA as water-scarce.'),
  t(4, '### Rivers and Drainage Basins of South Africa\n\nA **drainage basin** (catchment area) is the area of land drained by a river and its tributaries. It is separated from neighbouring basins by a **watershed** (the ridge or high ground dividing them).\n\n### Major Rivers of South Africa\n\n| River | Length | Flows Into | Key Facts |\n|-------|--------|------------|----------|\n| **Orange River** | 2 200 km | Atlantic Ocean | SA\'s longest river. Rises in Lesotho (as the Senqu). The Gariep and Vanderkloof dams provide water and hydropower. |\n| **Vaal River** | 1 210 km | Orange River (tributary) | Supplies water to Gauteng (SA\'s economic hub) via the Vaal Dam and Sterkfontein Dam. |\n| **Limpopo River** | 1 750 km | Indian Ocean | Forms SA\'s northern border with Botswana and Zimbabwe. |\n| **Tugela River** | 502 km | Indian Ocean | KZN\'s major river. Tugela Falls (948 m) is the world\'s second-highest waterfall. |\n| **Breede River** | 337 km | Indian Ocean (via estuary) | Western Cape\'s main river for irrigation. |\n\n### Inter-basin Water Transfers\n\nBecause water supply and demand are geographically mismatched (most water is in the east, most demand is in Gauteng), SA transfers water between basins:\n- **Lesotho Highlands Water Project (LHWP)**: Transfers water from Lesotho\'s highlands (Katse Dam, Mohale Dam) to the Vaal system via tunnels. One of the world\'s largest water transfer schemes.'),
  q(5, 'Why does South Africa need inter-basin water transfer schemes like the Lesotho Highlands Water Project?',
    ['Water supply and demand are geographically mismatched -- most water is in the east but demand is highest in Gauteng', 'To export water to neighbouring countries', 'Because all SA rivers flow in the wrong direction', 'To generate electricity only'], 0,
    'Gauteng (SA\'s economic hub with the most people) is in a relatively dry area. Most of SA\'s water originates in the eastern highlands and Lesotho. Transfer schemes move water from surplus to deficit areas.',
    ['Think about where most people live in SA versus where most rain falls.']),
  t(6, '### Water Supply Challenges\n\n**Providing clean water to all:**\n- The South African Constitution (Section 27) guarantees the right to access sufficient water.\n- Significant progress since 1994: millions who lacked clean water now have access.\n- However, many rural areas and informal settlements still lack reliable piped water.\n\n**Key challenges:**\n\n| Challenge | Description |\n|-----------|------------|\n| **Ageing infrastructure** | Many municipal water systems are old and poorly maintained, causing leaks and losses. Up to 40% of treated water is lost to leaks in some municipalities. |\n| **Pollution** | Mining (acid mine drainage), industry, agriculture (fertilisers, pesticides), and untreated sewage pollute rivers and groundwater. |\n| **Invasive alien plants** | Species like black wattle, eucalyptus, and pine trees consume large amounts of water. The Working for Water programme removes these plants. |\n| **Climate change** | More droughts, changing rainfall patterns, increased evaporation. |\n| **Population growth** | More people = more demand for water. |\n| **Poor governance** | Some municipalities lack technical skills and financial resources to manage water systems. |'),
  fb(7, 'Up to ___% of treated water is lost to leaks in some South African municipalities. The ___ for Water programme removes invasive alien plants that consume excessive water.',
    ['40', 'Working'],
    'Leaking pipes and poor infrastructure waste up to 40% of treated water in some areas. Working for Water is a government programme that removes alien invasive plants (like black wattle and eucalyptus) to increase water availability in catchments.'),
  t(8, '### Strategies for Sustainable Water Management\n\n**Government strategies:**\n- **Water restrictions** during drought -- limiting garden watering, car washing.\n- **Tiered pricing** -- basic water is cheap; heavy users pay more.\n- **Free basic water** -- every household receives 6 000 litres (6 kl) per month free.\n- **Working for Water** -- clearing invasive alien vegetation.\n- **Blue Drop and Green Drop programmes** -- monitoring drinking water quality and wastewater treatment.\n- **Inter-basin transfers** -- moving water from surplus to deficit areas.\n\n**Individual and community strategies:**\n- **Rainwater harvesting** -- collecting roof runoff in tanks (JoJo tanks).\n- **Grey water recycling** -- reusing bath, shower, and laundry water for gardens.\n- **Water-efficient fixtures** -- low-flow taps, dual-flush toilets.\n- **Fixing leaks** -- a dripping tap wastes thousands of litres per year.\n- **Mulching gardens** -- reduces evaporation from soil.\n- **Indigenous gardens** -- planting water-wise, drought-tolerant plants instead of lawns.'),
  q(9, 'South Africa\'s Free Basic Water policy provides each household with:',
    ['6 000 litres (6 kl) per month', '1 000 litres per month', '10 000 litres per day', '100 litres per person per day'], 0,
    'The Free Basic Water policy provides 6 kilolitres (6 000 litres) per household per month at no charge. This aims to ensure that even the poorest households have access to a basic supply of clean water.'),
];

// =============================================================================
// CHAPTER 13: Floods (Term 4)
// =============================================================================
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Floods\n\n### What is a Flood?\n\nA **flood** is an overflow of water onto land that is normally dry. Floods occur when rivers, lakes, or dams overflow their banks, or when excessive rainfall causes surface water to accumulate.\n\n### Types of Floods\n\n| Type | Description | Characteristics |\n|------|-------------|----------------|\n| **River (fluvial) flood** | River overflows its banks after prolonged or heavy rainfall upstream | May take hours or days to develop; affects floodplains |\n| **Flash flood** | Sudden, rapid flooding from intense rainfall over a short period | Very dangerous; little warning time; common in urban areas and narrow valleys |\n| **Coastal flood** | Sea level rises temporarily due to storms, high tides, or tsunamis | Affects low-lying coastal areas |\n| **Urban flood** | Excess water in built-up areas where drainage is overwhelmed | Impermeable surfaces prevent infiltration; common in cities |\n\n### Causes of Floods\n\n**Natural causes:**\n- Prolonged or intense rainfall.\n- Tropical cyclones bringing heavy rain.\n- La Nina events (above-average rainfall in southern Africa).\n- Snowmelt (in highland areas).\n- Steep slopes causing rapid runoff.\n\n**Human causes:**\n- **Urbanisation** -- impermeable surfaces (roads, buildings, parking lots) prevent infiltration, increasing runoff.\n- **Deforestation** -- trees no longer intercept rainfall or slow runoff.\n- **Poor drainage systems** -- blocked or undersized stormwater drains.\n- **Settlement on floodplains** -- people build in areas naturally prone to flooding.\n- **Climate change** -- increasing the intensity and frequency of extreme rainfall events.'),
  q(2, 'Why does urbanisation increase the risk of flooding?',
    ['Impermeable surfaces like roads and buildings prevent water from soaking into the ground, increasing surface runoff', 'Cities are always built at sea level', 'Urban areas receive more rainfall than rural areas', 'Buildings block wind and prevent evaporation'], 0,
    'In natural landscapes, rainfall infiltrates into the soil. In urban areas, impermeable surfaces (concrete, tar, roofs) prevent infiltration, channelling all rainfall into surface runoff. This overwhelms drainage systems and causes flooding.',
    ['Think about the difference between rain falling on grass versus rain falling on a tarred road.']),
  fb(3, 'A sudden, rapid flood from intense short-duration rainfall is called a ___ flood. Human-caused flooding is often worsened by ___ surfaces that prevent water infiltration.',
    ['flash', 'impermeable'],
    'Flash floods develop within minutes to hours, with little warning time, making them particularly dangerous. Impermeable surfaces (tar, concrete) in urban areas dramatically increase runoff and flood risk.'),
  t(4, '### Understanding Flood Hydrographs\n\nA **flood hydrograph** shows the **discharge** (volume of water flowing past a point per second, measured in cumecs or m3/s) of a river over time during and after a rainfall event.\n\n### Key Features of a Hydrograph\n\n| Feature | Description |\n|---------|------------|\n| **Rising limb** | The section where discharge increases as rainfall reaches the river |\n| **Peak discharge** | The highest point -- the maximum flow of the river |\n| **Falling limb (recession limb)** | The section where discharge decreases after the peak |\n| **Lag time** | The time between peak rainfall and peak discharge |\n| **Base flow** | The normal flow of the river fed by groundwater |\n\n### Interpreting Lag Time\n\n- **Short lag time** = water reaches the river quickly = higher flood risk. Caused by impermeable surfaces, steep slopes, little vegetation, urban areas.\n- **Long lag time** = water takes longer to reach the river = lower flood risk. Caused by permeable soil, gentle slopes, dense vegetation, rural areas.\n\nA **steep rising limb** and **high peak discharge** indicate a flashy response with high flood risk. A **gentle rising limb** and **low peak** indicate a slower, less flood-prone response.'),
  q(5, 'On a flood hydrograph, a short lag time indicates:',
    ['Water reaches the river quickly, increasing flood risk', 'Water is absorbed slowly into the ground', 'The river has dried up', 'Rainfall was very light'], 0,
    'A short lag time means rainfall reaches the river rapidly (due to impermeable surfaces, steep slopes, or lack of vegetation). This creates a quick, high peak -- a flashy response associated with higher flood risk.'),
  t(6, '### Effects of Floods\n\n**Negative effects:**\n\n| Category | Effects |\n|----------|--------|\n| **Human** | Loss of life (drowning), displacement, injuries, disease (contaminated water), psychological trauma |\n| **Economic** | Damage to buildings, roads, bridges, crops, livestock losses, business disruption, insurance costs |\n| **Environmental** | Soil erosion, water pollution, destruction of habitats, siltation of dams, spread of invasive species |\n\n**Positive effects:**\n- Floods deposit **fertile silt** on floodplains, enriching agricultural soil.\n- Recharge **groundwater** supplies.\n- Fill **wetlands** that support biodiversity.\n- Flush pollutants from rivers.\n\n### South African Flood Case Studies\n\n**KwaZulu-Natal floods (April 2022):**\n- Over 300 mm of rain fell in 24 hours.\n- More than 440 people died; thousands displaced.\n- Infrastructure damage exceeded R17 billion.\n- Informal settlements on steep slopes and in flood zones were worst affected.\n- eThekwini Municipality\'s drainage systems were overwhelmed.\n\n**Causes:** Extreme rainfall (linked to a cut-off low-pressure system), steep terrain, urbanisation, informal settlements in flood-prone areas, climate change increasing rainfall intensity.'),
  fb(7, 'The April 2022 KwaZulu-Natal floods killed over ___ people. More than ___ mm of rain fell in 24 hours, overwhelming drainage systems.',
    ['440', '300'],
    'The 2022 KZN floods were among the deadliest natural disasters in SA\'s history. Over 300 mm of rain in 24 hours (five times the monthly average) caused catastrophic flooding and landslides.'),
  t(8, '### Flood Management Strategies\n\n**Structural (engineering) measures:**\n- **Dams and reservoirs** -- store floodwater and release it slowly.\n- **Levees (flood walls)** -- raised banks along rivers to contain floodwater.\n- **Diversion channels** -- redirect excess water away from vulnerable areas.\n- **Stormwater drainage** -- adequate systems to handle runoff in urban areas.\n- **Retention ponds** -- temporary storage areas for excess water.\n\n**Non-structural measures:**\n- **Flood zoning** -- identifying flood-prone areas and restricting development.\n- **Early warning systems** -- monitoring rainfall and river levels, issuing alerts.\n- **Community education** -- teaching people how to respond to flood warnings.\n- **Wetland protection** -- wetlands act as natural sponges, absorbing floodwater.\n- **Insurance** -- financial protection for property owners.\n- **Permeable surfaces** -- using porous paving and green roofs in urban areas to increase infiltration.\n\n**South African context:**\n- Many informal settlements are in flood zones because residents cannot afford safer land.\n- Municipal infrastructure is often inadequate or poorly maintained.\n- The SA Weather Service issues flood warnings, but reaching vulnerable communities remains a challenge.\n- Climate change adaptation requires integrating flood risk into all urban planning.'),
  q(9, 'Which non-structural flood management strategy involves preserving natural features that absorb excess water?',
    ['Wetland protection', 'Building higher levees', 'Constructing diversion channels', 'Deepening river channels'], 0,
    'Wetlands act as natural sponges, absorbing and slowly releasing floodwater. Protecting wetlands from development and drainage is a cost-effective, sustainable flood management strategy.',
    ['Think about natural landscapes that can store water -- what features act like sponges?']),
  fb(10, 'Structural flood measures include dams, levees, and ___ channels. Non-structural measures include flood zoning, early warning systems, and ___ protection.',
    ['diversion', 'wetland'],
    'Structural measures are physical constructions (dams, levees, diversion channels). Non-structural measures use planning and natural systems (zoning, warnings, wetland conservation) to reduce flood impact.'),
];

// =============================================================================
// CHAPTER 14: Revision and Exam Preparation (Term 4)
// =============================================================================
blockNum = 0;
const ch14_lesson1 = [
  t(1, '## Exam Structure for Grade 10 Geography\n\n### Paper Overview\n\n| Paper | Content | Duration | Marks |\n|-------|---------|----------|-------|\n| **Paper 1** | The Atmosphere (60 marks), Geomorphology (60 marks), Mapwork (30 marks) | 3 hours | 150 |\n| **Paper 2** | Population Geography (60 marks), Water Resources of SA (60 marks), Mapwork (30 marks) | 3 hours | 150 |\n\n### Question Types\n\n- **Multiple choice** -- select the correct answer from four options.\n- **True or false** -- identify whether a statement is correct.\n- **Short structured questions** -- definitions, lists, explanations.\n- **Data response** -- analyse maps, graphs, photographs, statistics, hydrographs.\n- **Map skills and calculations** -- gradient, distance, area, bearing, cross-sections.\n- **Paragraph/essay questions** -- longer responses requiring discussion, evaluation, and examples (usually 8 marks).\n\n### Key Command Words\n\n| Word | What It Requires |\n|------|------------------|\n| **Define** | Give the exact meaning of a term. |\n| **Describe** | Say what something is like (features, characteristics). |\n| **Explain** | Give reasons WHY something happens (cause and effect). |\n| **Discuss** | Present a balanced view with different perspectives. |\n| **Distinguish** | Highlight differences between two things. |\n| **Calculate** | Work out a numerical answer showing all steps. |\n| **Account for** | Explain why something is the case (similar to explain). |'),
  q(2, 'If an exam question asks you to "distinguish" between two concepts, you must:',
    ['Identify the differences between the two concepts', 'Define both concepts and give examples', 'Only describe one of the concepts', 'Draw a diagram of both concepts'], 0,
    '"Distinguish" requires you to highlight the differences between two or more concepts. You should compare them directly, showing how they differ from each other.'),
  t(3, '### Key Definitions to Revise -- The Atmosphere\n\n| Term | Definition |\n|------|------------|\n| **Atmosphere** | The layer of gases surrounding the Earth, held in place by gravity. |\n| **Troposphere** | The lowest atmospheric layer (0-12 km) where weather occurs. |\n| **Ozone layer** | A zone of concentrated ozone in the stratosphere that absorbs UV radiation. |\n| **Greenhouse effect** | The warming of Earth by greenhouse gases trapping outgoing longwave radiation. |\n| **Insolation** | Incoming solar radiation received at the Earth\'s surface. |\n| **Lapse rate** | The rate at which temperature decreases with altitude. |\n| **Dew point** | The temperature at which air becomes saturated and condensation begins. |\n| **Relative humidity** | The amount of water vapour in air as a percentage of the maximum at that temperature. |\n| **Isobar** | A line on a map joining places of equal atmospheric pressure. |\n| **Convection** | Heat transfer through the movement of heated fluid (air or water). |\n| **Precipitation** | Any form of water falling from the atmosphere to the surface. |\n| **Temperature inversion** | A layer of warm air above cooler air, trapping pollution near the surface. |'),
  t(4, '### Key Definitions to Revise -- Geomorphology\n\n| Term | Definition |\n|------|------------|\n| **Lithosphere** | The rigid outer shell of the Earth (crust + upper mantle). |\n| **Asthenosphere** | The semi-plastic layer of the upper mantle where convection currents flow. |\n| **Tectonic plates** | Large rigid pieces of the lithosphere that move over the asthenosphere. |\n| **Convergent boundary** | Where plates move toward each other (destructive boundary). |\n| **Divergent boundary** | Where plates move apart (constructive boundary). |\n| **Subduction** | When a denser plate is forced under a lighter plate at a convergent boundary. |\n| **Anticline** | An upward arch in folded rock layers. |\n| **Syncline** | A downward trough in folded rock layers. |\n| **Horst** | A raised block between two normal faults. |\n| **Graben** | A dropped block between two normal faults (rift valley). |\n| **Focus** | The underground point where an earthquake originates. |\n| **Epicentre** | The surface point directly above the earthquake focus. |'),
  fb(5, 'The command word "___" requires you to give reasons why something happens. The command word "___" requires you to present a balanced view with different perspectives.',
    ['explain', 'discuss'],
    '"Explain" needs cause-and-effect reasoning (WHY). "Discuss" needs a balanced presentation considering multiple viewpoints, advantages and disadvantages, or different perspectives.'),
  t(6, '### Key Definitions to Revise -- Population and Water\n\n| Term | Definition |\n|------|------------|\n| **Population density** | The average number of people per km squared. |\n| **Population distribution** | How people are spread across an area. |\n| **Birth rate** | Number of live births per 1 000 people per year. |\n| **Death rate** | Number of deaths per 1 000 people per year. |\n| **Natural increase** | Birth rate minus death rate. |\n| **Demographic transition** | The shift from high birth/death rates to low birth/death rates as a country develops. |\n| **Migration** | The movement of people from one place to another. |\n| **Push factors** | Reasons people leave an area (poverty, war, drought). |\n| **Pull factors** | Reasons people are attracted to a new area (jobs, safety). |\n| **Brain drain** | Loss of skilled workers through emigration. |\n| **Drainage basin** | The area of land drained by a river and its tributaries. |\n| **Flood** | An overflow of water onto normally dry land. |\n| **Lag time** | Time between peak rainfall and peak discharge on a hydrograph. |'),
  t(7, '### Exam Tips for Grade 10 Geography\n\n1. **Read each question twice** -- underline command words and key terms.\n2. **Allocate time wisely** -- approximately 1 minute per mark. Don\'t spend too long on a single question.\n3. **Answer all questions** -- no question is optional.\n4. **Use geographical terminology** -- examiners reward correct use of subject-specific language.\n5. **Include South African examples** -- use real SA examples (rivers, mountains, cities, events).\n6. **Show all calculations** -- write the formula, show working, include units.\n7. **For map questions** -- always use map evidence (contour values, symbols, distances) to support your answer.\n8. **For graph questions** -- quote specific values from the data.\n9. **For paragraph questions** -- structure your answer with an introduction, body, and conclusion.\n10. **Practise past papers** -- the format is consistent year to year. Focus on the 2019-2023 papers.\n\n### Common Mistakes to Avoid\n\n- Confusing weather (short-term, specific) with climate (long-term, average).\n- Mixing up anticlines and synclines.\n- Forgetting to convert map measurements to actual distances using the scale.\n- Confusing push and pull factors.\n- Not using South African examples when asked.\n- Writing \"explain\" answers that only describe (you must say WHY, not just WHAT).'),
  q(8, 'What is the difference between weather and climate?',
    ['Weather is the short-term state of the atmosphere at a specific time and place; climate is the long-term average of weather conditions over many years', 'Weather only refers to temperature; climate includes all elements', 'They are the same thing with different names', 'Weather is measured indoors; climate is measured outdoors'], 0,
    'Weather describes atmospheric conditions at a specific time and place (today\'s temperature, rainfall). Climate is the average of weather conditions over at least 30 years for a region. Weather changes daily; climate changes over decades.'),
];


// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Grade 10
  let gradeDoc = await db.collection('grades').findOne({ name: /Grade 10/i, schoolId: SCHOOL_ID });
  let GRADE_ID;
  if (gradeDoc) {
    GRADE_ID = gradeDoc._id;
    console.log('Found Grade 10:', String(GRADE_ID));
  } else {
    const result = await db.collection('grades').insertOne({
      name: 'Grade 10', schoolId: SCHOOL_ID, orderIndex: 10,
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    GRADE_ID = result.insertedId;
    console.log('Created Grade 10:', String(GRADE_ID));
  }

  // Find or create Geography subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Geography/i, schoolId: SCHOOL_ID });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Geography subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Geography',
      code: 'GEO',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Geography subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Map Skills and Topographic Maps',
      description: 'Reading topographic maps, contour lines, orthophoto maps, aerial photographs, settlement patterns, scale, distance, direction, bearing, gradient, and cross-sections.',
      order: 1,
      lessons: [
        { title: 'Reading Topographic Maps, Orthophotos, and Aerial Photographs', description: 'Conventional signs, contour lines, relief interpretation, orthophoto maps, aerial photographs, and settlement patterns.', blocks: ch1_lesson1, term: 1 },
        { title: 'Scale, Distance, Direction, Bearing, and Gradient', description: 'Map scale types and conversions, measuring distance, compass direction, true and magnetic bearing, gradient calculation, and cross-sections.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: The Atmosphere — Composition and the Ozone Layer',
      description: 'Atmospheric composition, layers of the atmosphere, the ozone layer, UV radiation, ozone depletion, CFCs, and the Montreal Protocol.',
      order: 2,
      lessons: [
        { title: 'Atmospheric Composition, Layers, and the Ozone Layer', description: 'Gases in the atmosphere, troposphere to exosphere, ozone layer function, ozone depletion, CFCs, and the Montreal Protocol.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Heating of the Atmosphere',
      description: 'How the atmosphere is heated, radiation, conduction, convection, the greenhouse effect, factors affecting temperature, and temperature inversions.',
      order: 3,
      lessons: [
        { title: 'Heat Transfer, Greenhouse Effect, and Temperature Factors', description: 'Radiation, conduction, convection, greenhouse effect, latitude, altitude, continentality, ocean currents, cloud cover, aspect, and temperature inversions.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Moisture in the Atmosphere',
      description: 'Water vapour, humidity, condensation, cloud formation, adiabatic lapse rates, cloud types, dew, frost, fog, and mist.',
      order: 4,
      lessons: [
        { title: 'Humidity, Cloud Formation, Cloud Types, and Surface Condensation', description: 'Evaporation, condensation, humidity concepts, mechanisms of uplift, adiabatic lapse rates, cloud classification, dew, frost, fog, and mist.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Weather Elements, Instruments, and Synoptic Maps',
      description: 'Weather elements, measuring instruments, the Stevenson screen, synoptic weather maps, pressure systems, fronts, station models, and SA weather patterns.',
      order: 5,
      lessons: [
        { title: 'Weather Instruments, Synoptic Maps, and SA Weather Patterns', description: 'Thermometers, barometers, anemometers, rain gauges, Stevenson screen, isobars, fronts, station models, and seasonal weather in South Africa.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Precipitation',
      description: 'Types of precipitation, how rain forms, convectional, orographic, and frontal rainfall, SA rainfall distribution, and station models.',
      order: 6,
      lessons: [
        { title: 'Precipitation Types, Rainfall Mechanisms, and Station Models', description: 'Rain, hail, snow, and frost formation; convectional, orographic, and frontal rainfall; SA rainfall regions; and reading weather station models.', blocks: ch6_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 7: The Structure of the Earth and Plate Tectonics',
      description: 'Internal structure of the Earth, continental drift evidence, convection currents, tectonic plates, and plate boundary types.',
      order: 7,
      lessons: [
        { title: 'Earth\'s Layers, Continental Drift, and Plate Boundaries', description: 'Crust, mantle, core, lithosphere, asthenosphere, Wegener\'s evidence, convection currents, divergent, convergent, and transform boundaries.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Folding, Faulting, and Earthquakes',
      description: 'Fold types and fold mountains, fault types and landforms, earthquake causes, measurement, effects, and SA examples.',
      order: 8,
      lessons: [
        { title: 'Folding, Faulting, Earthquake Measurement, and Effects', description: 'Anticlines, synclines, Cape Fold Belt, normal and reverse faults, horsts, grabens, seismic waves, Richter and Mercalli scales, and SA earthquakes.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Volcanoes',
      description: 'Volcanic activity, types of volcanoes, eruption styles, effects of eruptions, prediction and management, and SA volcanic history.',
      order: 9,
      lessons: [
        { title: 'Volcanic Types, Eruptions, Effects, and Management', description: 'Shield, composite, and cinder cone volcanoes, lava viscosity, eruption effects, monitoring techniques, and SA\'s volcanic history.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Population Distribution, Density, and Structure',
      description: 'Population distribution and density in SA, factors affecting distribution, population pyramids, and SA\'s demographic profile.',
      order: 10,
      lessons: [
        { title: 'Population Distribution, Density, and Pyramids', description: 'Population density calculations, factors affecting distribution, SA distribution patterns, population pyramid types, and HIV/AIDS impact.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Population Growth and Movements',
      description: 'Population indicators, the Demographic Transition Model, overpopulation, migration types, push and pull factors, and migration in SA.',
      order: 11,
      lessons: [
        { title: 'Population Growth, DTM, Migration, and Brain Drain', description: 'Birth rate, death rate, natural increase, DTM stages, overpopulation, migration types, push/pull factors, and SA migration patterns.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Water Management in South Africa',
      description: 'SA water resources, major rivers and drainage basins, inter-basin transfers, water supply challenges, and sustainable management strategies.',
      order: 12,
      lessons: [
        { title: 'Water Resources, Rivers, Challenges, and Management', description: 'SA\'s water scarcity, major rivers, Gariep Dam, Lesotho Highlands Water Project, pollution, invasive plants, and water conservation strategies.', blocks: ch12_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 13: Floods',
      description: 'Flood types and causes, flood hydrographs, effects of floods, KZN 2022 case study, and flood management strategies.',
      order: 13,
      lessons: [
        { title: 'Flood Causes, Hydrographs, Effects, and Management', description: 'River, flash, coastal, and urban floods; hydrograph interpretation; lag time; KZN 2022 floods; and structural and non-structural flood management.', blocks: ch13_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 14: Revision and Exam Preparation',
      description: 'Exam structure, key definitions, command words, answering strategies, and study tips for Grade 10 Geography.',
      order: 14,
      lessons: [
        { title: 'Revision: Exam Structure, Key Definitions, and Tips', description: 'Paper 1 and Paper 2 structure, key Geography definitions across all topics, command words, answering strategies, and exam tips.', blocks: ch14_lesson1, term: 4 },
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
    title: 'Grade 10 Geography \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Map Skills, The Atmosphere, Geomorphology (Plate Tectonics, Volcanoes, Earthquakes), Population Geography, Water Resources, and Floods for the Grade 10 Geography curriculum.',
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
  console.log('  TEXTBOOK: Grade 10 Geography');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
