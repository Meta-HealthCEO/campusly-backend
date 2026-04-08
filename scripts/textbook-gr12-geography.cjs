const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642');

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
// CHAPTER 1: Climate and Weather \u2014 Mid-latitude Cyclones
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Global Air Circulation\n\nThe Earth\u2019s atmosphere circulates in three distinct cells in each hemisphere, driven by differential heating between the equator and the poles.\n\n### The Three-Cell Model\n\n| Cell | Latitude Range | Surface Winds |\n|------|---------------|---------------|\n| **Hadley Cell** | 0\u00b0 \u2013 30\u00b0 | Trade winds (SE in Southern Hemisphere) |\n| **Ferrel Cell** | 30\u00b0 \u2013 60\u00b0 | Westerlies (NW in Southern Hemisphere) |\n| **Polar Cell** | 60\u00b0 \u2013 90\u00b0 | Polar easterlies |\n\nAt the boundaries of these cells, important pressure belts form:\n- **ITCZ (Inter-Tropical Convergence Zone)** at the equator \u2014 low pressure\n- **Subtropical High-Pressure Belt** at \u00b130\u00b0 \u2014 high pressure (descending air)\n- **Sub-polar Low-Pressure Belt** at \u00b160\u00b0 \u2014 low pressure (converging air)\n\nThe Coriolis effect deflects winds to the **left** in the Southern Hemisphere and to the right in the Northern Hemisphere.'),
  t(2, '### Jet Streams\n\nJet streams are narrow bands of very strong winds (200\u2013400 km/h) found at the tropopause, approximately 10\u201312 km above the Earth\u2019s surface.\n\n**Key jet streams:**\n- **Subtropical jet stream** \u2014 found at approximately 30\u00b0S, between the Hadley and Ferrel cells\n- **Polar front jet stream** \u2014 found at approximately 60\u00b0S, between the Ferrel and Polar cells\n\nThe polar front jet stream is particularly important for South Africa because it steers **mid-latitude cyclones** across the southern tip of the country, especially in winter.\n\n### The Polar Front\n\nThe polar front is the boundary where cold polar air meets warmer subtropical air at approximately 60\u00b0S. This convergence zone is where mid-latitude cyclones (frontal depressions) develop.'),
  q(3, 'In which pressure belt does the descending air of the Hadley Cell create high pressure?',
    ['Subtropical high-pressure belt at \u00b130\u00b0', 'ITCZ at the equator', 'Sub-polar low at \u00b160\u00b0', 'Polar high at \u00b190\u00b0'], 0,
    'The Hadley Cell\u2019s descending limb is at approximately 30\u00b0 latitude, creating the subtropical high-pressure belt where hot, dry conditions prevail.'),
  fb(4, 'The Coriolis effect deflects winds to the ___ in the Southern Hemisphere. The jet stream that steers mid-latitude cyclones is the ___ jet stream.',
    ['left', 'polar front'],
    'The Coriolis effect deflects moving air to the left in the Southern Hemisphere. The polar front jet stream at approximately 60\u00b0S steers mid-latitude cyclones.'),
  t(5, '### Mid-latitude Cyclones: Formation and Structure\n\nMid-latitude cyclones (also called **frontal depressions** or **extra-tropical cyclones**) are large, low-pressure weather systems that form along the polar front.\n\n**Areas of formation:**\n- Between 30\u00b0S and 60\u00b0S over the Southern Ocean\n- Where cold polar air converges with warmer subtropical air\n\n**Conditions needed:**\n- Temperature contrast between two air masses\n- The presence of the polar front\n- Upper-air divergence (the polar front jet stream)\n\n**Characteristics:**\n- Diameter: 1 000\u20133 000 km\n- Move from west to east (steered by the Westerlies)\n- Contain a cold front and a warm front\n- Associated with the characteristic comma-shaped cloud pattern visible on satellite images'),
  t(6, '### Stages of Development\n\n| Stage | Description |\n|-------|------------|\n| **1. Initial (wave)** | A wave develops along the polar front where warm and cold air meet. A small low-pressure cell begins to form. |\n| **2. Open (mature)** | Distinct cold front (trailing) and warm front (leading) develop. The warm sector separates the two fronts. Strongest winds and heaviest rain occur. |\n| **3. Occluded** | The cold front catches up to the warm front, lifting the warm air off the ground entirely. The warm sector narrows and the system begins to weaken. |\n| **4. Dissolving** | The warm sector is completely lifted. The fronts merge, the pressure gradient weakens, and the system dissipates. |\n\nA typical mid-latitude cyclone takes **3\u20137 days** to progress through all stages.'),
  q(7, 'During which stage of a mid-latitude cyclone does the cold front catch up to the warm front?',
    ['Occluded stage', 'Initial (wave) stage', 'Open (mature) stage', 'Dissolving stage'], 0,
    'During the occluded stage, the faster-moving cold front overtakes the warm front, lifting the warm sector off the ground and forming an occluded front.',
    ['Think about which front moves faster \u2014 cold fronts are steeper and advance more rapidly.']),
  t(8, '### Weather Associated with Mid-latitude Cyclones in South Africa\n\n**Ahead of the warm front:**\n- Cirrus clouds appear first, followed by cirrostratus, altostratus, and nimbostratus\n- Steady, prolonged rain or drizzle\n- Gradual drop in pressure\n- Winds from the NW sector\n\n**In the warm sector (between fronts):**\n- Warm, humid conditions\n- Stratus clouds, possible light rain or drizzle\n- Brief clearing\n\n**Behind the cold front:**\n- Sudden temperature drop\n- Cumulonimbus clouds \u2014 heavy rain, possible thunderstorms and hail\n- Sharp rise in pressure\n- Strong, gusty SW winds\n- Rapid clearing with cold, crisp conditions\n\nIn South Africa, mid-latitude cyclones bring **winter rainfall** to the Western Cape and cold fronts that sweep across the southern and south-eastern coastal regions.'),
  q(9, 'Which cloud type is associated with the passage of a cold front in a mid-latitude cyclone?',
    ['Cumulonimbus', 'Cirrus', 'Stratus', 'Altostratus'], 0,
    'Cold fronts are steep and force warm air up rapidly, producing towering cumulonimbus clouds with heavy rain, thunder, and sometimes hail.'),
  fb(10, 'Mid-latitude cyclones move from ___ to ___ across South Africa, steered by the prevailing ___ winds.',
    ['west', 'east', 'westerly'],
    'Mid-latitude cyclones are embedded in the westerly wind belt and travel from west to east across the Southern Hemisphere.'),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Synoptic Weather Maps and Satellite Images\n\n### Reading a Synoptic Weather Map\n\nSynoptic weather maps show atmospheric conditions over a large area at a specific time.\n\n**Key features to identify:**\n\n| Symbol | Meaning |\n|--------|--------|\n| **Isobars** | Lines joining places of equal atmospheric pressure (in hPa) |\n| **L** | Low-pressure centre (cyclone) |\n| **H** | High-pressure centre (anticyclone) |\n| **Blue line with triangles** | Cold front (triangles point in direction of movement) |\n| **Red line with semicircles** | Warm front (semicircles point in direction of movement) |\n| **Purple line with both** | Occluded front |\n\n**Pressure gradient:**\n- Isobars close together = strong pressure gradient = strong winds\n- Isobars far apart = weak pressure gradient = light winds'),
  t(2, '### Interpreting Wind Direction and Speed\n\nIn the Southern Hemisphere:\n- Air flows **clockwise** around a **low-pressure** system\n- Air flows **anticlockwise** around a **high-pressure** system\n- Wind blows roughly parallel to the isobars, slightly deflected towards low pressure due to friction\n\n**Wind speed** is estimated from the spacing of isobars \u2014 the closer together, the stronger the winds.\n\n### Station Models\n\nWeather stations on synoptic maps display:\n- Wind direction (a line showing where wind blows FROM)\n- Wind speed (barbs on the line: half barb = 5 knots, full barb = 10 knots, pennant = 50 knots)\n- Cloud cover (circle fill: clear, partly cloudy, overcast)\n- Temperature, dew point, and pressure tendency'),
  q(3, 'On a synoptic map, closely spaced isobars indicate:',
    ['Strong winds and a steep pressure gradient', 'Light winds and calm conditions', 'High temperatures', 'Low humidity'], 0,
    'Closely spaced isobars mean a steep (large) pressure gradient over a short distance, which drives strong winds.'),
  t(4, '### Satellite Images for Mid-latitude Cyclones\n\n**Types of satellite images:**\n- **Visible images** \u2014 show clouds as they reflect sunlight (only available during daytime)\n- **Infrared (IR) images** \u2014 detect heat radiation from cloud tops; cold (high) clouds appear white, warm (low) surfaces appear dark; available day and night\n- **Water vapour images** \u2014 show moisture content in the upper atmosphere\n\n**Identifying a mid-latitude cyclone on satellite images:**\n- Look for the characteristic **comma-shaped cloud band**\n- The head of the comma is the low-pressure centre\n- The tail of the comma is the cold front trailing south-westward\n- The warm front appears as a broad band of cloud ahead (east) of the low\n- Clear skies behind the cold front (to the west/south-west)'),
  t(5, '### Impact of Mid-latitude Cyclones on South Africa\n\n**Positive impacts:**\n- Bring essential rainfall to the Western Cape (winter rainfall region)\n- Replenish dams and groundwater supplies\n- Support agriculture in the winter-rainfall region (wheat, canola, wine grapes)\n\n**Negative impacts:**\n- Flooding of low-lying areas, especially in the Cape Flats\n- Storm surges along the southern coast\n- Disruption to shipping and fishing in the Southern Ocean\n- Strong winds damaging infrastructure (roofs, power lines)\n- Cold snaps and snow on mountain passes (e.g., Du Toitskloof, Hex River)\n- Coastal erosion along the Garden Route\n\n**Case study \u2014 Cape Town winter storms:**\nSevere cold fronts regularly bring destructive winds and flooding to informal settlements in Cape Town, displacing thousands of residents and causing millions of rand in damage.'),
  q(6, 'Which satellite image type can detect mid-latitude cyclone cloud patterns at night?',
    ['Infrared (IR)', 'Visible', 'Water vapour only', 'None \u2014 satellites only work during the day'], 0,
    'Infrared images detect heat radiation emitted by cloud tops and the Earth\u2019s surface, making them available both day and night.'),
  fb(7, 'On satellite images, a mid-latitude cyclone appears as a characteristic ___-shaped cloud band. The ___ front forms the tail of this pattern.',
    ['comma', 'cold'],
    'The distinctive comma shape has the low-pressure centre at the head and the cold front trailing as the tail.'),
  q(8, 'Why does the Western Cape receive most of its rainfall in winter?',
    ['Mid-latitude cyclones shift northward in winter, bringing cold fronts over the Cape', 'Tropical cyclones bring rain in winter', 'The Kalahari High weakens in winter', 'Convective uplift is strongest in winter'], 0,
    'In winter, the westerly wind belt and associated mid-latitude cyclones shift equatorward (northward in the SH), bringing cold fronts and rainfall to the Western Cape.',
    ['Consider how global circulation patterns shift with the seasons.']),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Climate and Weather \u2014 Tropical Cyclones
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Tropical Cyclones: Characteristics and Formation\n\n### General Characteristics\n\nA tropical cyclone is an intense, rotating low-pressure weather system that forms over warm tropical oceans.\n\n| Feature | Detail |\n|---------|--------|\n| **Diameter** | 200\u2013800 km (much smaller than mid-latitude cyclones) |\n| **Wind speed** | >119 km/h (Category 1+); can exceed 250 km/h |\n| **Central pressure** | Very low, often below 950 hPa |\n| **Eye** | Calm centre, 20\u201340 km diameter, clear skies |\n| **Eye wall** | Ring of tallest cumulonimbus clouds, strongest winds and heaviest rain |\n| **Spiral rain bands** | Bands of thunderstorms spiralling outward from the eye |\n| **Rotation** | Clockwise in the Southern Hemisphere (due to the Coriolis effect) |'),
  t(2, '### Areas of Formation\n\nTropical cyclones form over warm ocean water in the tropics, typically between **5\u00b0** and **20\u00b0** latitude (not at the equator because the Coriolis effect is too weak there).\n\n**In the Southern Hemisphere, they form in:**\n- The South-West Indian Ocean (affects Mozambique, Madagascar, and occasionally South Africa)\n- Off the north-west coast of Australia\n- The South Pacific Ocean\n\n**For South Africa**, tropical cyclones form in the **Mozambique Channel** and the warm waters of the South-West Indian Ocean, typically between November and April.\n\n### Factors Required for Formation\n\n1. **Warm ocean water** \u2014 sea surface temperature \u2265 26\u00b0C to a depth of at least 50 m\n2. **Atmospheric instability** \u2014 warm, moist air must be able to rise freely\n3. **Sufficient Coriolis effect** \u2014 at least 5\u00b0 from the equator\n4. **Low wind shear** \u2014 winds at different altitudes must not vary too much in speed or direction\n5. **Pre-existing low-pressure disturbance** \u2014 a tropical wave or cluster of thunderstorms'),
  q(3, 'Why do tropical cyclones NOT form directly on the equator?',
    ['The Coriolis effect is zero at the equator, so rotation cannot develop', 'The ocean is too cold at the equator', 'There is too much wind shear at the equator', 'High pressure prevents uplift at the equator'], 0,
    'The Coriolis effect is needed to give the storm its spin. At the equator (0\u00b0 latitude), the Coriolis effect is zero, so the system cannot develop rotation.',
    ['Consider what causes air to spiral rather than simply rising straight up.']),
  fb(4, 'Tropical cyclones require a sea surface temperature of at least ___ \u00b0C. In the Southern Hemisphere, they rotate in a ___ direction.',
    ['26', 'clockwise'],
    'Warm ocean water (\u226526\u00b0C) provides the energy through evaporation. The Coriolis effect causes clockwise rotation in the Southern Hemisphere.'),
  t(5, '### Stages of Development\n\n| Stage | Wind Speed | Characteristics |\n|-------|-----------|----------------|\n| **1. Tropical disturbance** | < 37 km/h | Cluster of thunderstorms, slight rotation |\n| **2. Tropical depression** | 37\u201362 km/h | Closed isobars, definite rotation, low pressure deepens |\n| **3. Tropical storm** | 63\u2013118 km/h | Eye begins to form, system is named |\n| **4. Tropical cyclone** | > 119 km/h | Well-defined eye, eye wall with extreme winds and rain |\n\n**Saffir-Simpson Scale (intensity):**\n\n| Category | Wind Speed | Damage |\n|----------|-----------|--------|\n| 1 | 119\u2013153 km/h | Minimal |\n| 2 | 154\u2013177 km/h | Moderate |\n| 3 | 178\u2013208 km/h | Extensive |\n| 4 | 209\u2013251 km/h | Extreme |\n| 5 | > 251 km/h | Catastrophic |'),
  t(6, '### Cross-section of a Tropical Cyclone\n\nImagine slicing through a tropical cyclone from one side to the other:\n\n```\n  Rain bands    Eye wall    EYE    Eye wall    Rain bands\n  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500   \u2502\u2588\u2588\u2588\u2588\u2588\u2588\u2502   \u2502  \u2502   \u2502\u2588\u2588\u2588\u2588\u2588\u2588\u2502   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  \u2191 moderate    \u2191 extreme   calm   \u2191 extreme    \u2191 moderate\n    winds         winds    clear     winds        winds\n```\n\n- **Eye**: Calm, clear, warm (sinking air), 20\u201340 km diameter\n- **Eye wall**: Tallest cumulonimbus towers (up to 15 km), strongest winds, heaviest rainfall\n- **Spiral rain bands**: Bands of cumulonimbus clouds spiralling outward, with alternating rain and clearer gaps\n- **Outflow**: At the top of the storm, air diverges outward (visible as high cirrus clouds on satellite images)\n\nThe storm draws energy from warm ocean water through evaporation. Warm, moist air rises in the eye wall, releasing latent heat, which further intensifies the uplift.'),
  q(7, 'Which part of a tropical cyclone experiences the strongest winds and heaviest rainfall?',
    ['The eye wall', 'The eye', 'The outer rain bands', 'The outflow at the top'], 0,
    'The eye wall surrounds the eye and contains the tallest cumulonimbus clouds, the most intense updrafts, the strongest winds, and the heaviest rainfall.'),
  t(8, '### Impact on South Africa and Precautionary Measures\n\n**Impacts when a tropical cyclone makes landfall near SA:**\n- Torrential rainfall \u2192 severe flooding (rivers, informal settlements)\n- Storm surge \u2192 coastal flooding and erosion\n- Destructive winds \u2192 damage to buildings, trees, power lines\n- Displacement of communities, loss of crops, damage to infrastructure\n- Disruption of transport, communication, and water supply\n- Risk of waterborne diseases after flooding\n\n**Precautionary measures:**\n- SA Weather Service issues watches and warnings\n- Evacuation of low-lying and coastal areas\n- Reinforcing roofs and securing loose objects\n- Stocking emergency supplies (water, food, first aid, torches)\n- Avoiding rivers and floodplains during and after the storm\n- Disaster management teams on standby'),
  q(9, 'What happens to a tropical cyclone once it moves over land?',
    ['It weakens because it is cut off from its warm ocean energy source', 'It intensifies due to friction', 'It maintains its strength indefinitely', 'It converts into a mid-latitude cyclone immediately'], 0,
    'Tropical cyclones derive their energy from warm ocean water. Once over land, this energy supply is cut off and friction slows the winds, causing the system to weaken rapidly.'),
  fb(10, 'The calm centre of a tropical cyclone is called the ___. A tropical storm is officially classified as a tropical cyclone when wind speeds exceed ___ km/h.',
    ['eye', '119'],
    'The eye is the calm centre with clear skies and sinking air. A tropical storm becomes a tropical cyclone at wind speeds above 119 km/h (Category 1).'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Case Study: Tropical Cyclone Freddy (February\u2013March 2023)\n\nTropical Cyclone Freddy was one of the longest-lasting tropical cyclones ever recorded, with a lifespan of over **five weeks**.\n\n### Formation and Track\n- Formed in the **South-West Indian Ocean** near north-western Australia in early February 2023\n- Crossed the entire Indian Ocean, making landfall in **Madagascar** twice\n- Made final landfall in **Mozambique** on 11 March 2023\n- Tracked westward and inland, affecting **Malawi** severely\n\n### Intensity\n- Reached Category 4\u20135 intensity multiple times during its long track\n- Peak winds exceeded 250 km/h\n- Extremely low central pressure (below 920 hPa at peak intensity)'),
  t(2, '### Impacts\n\n**Mozambique:**\n- Widespread flooding in Zambezia and Sofala provinces\n- Destruction of homes, schools, and health facilities\n- Over 180 deaths in Mozambique\n- Displacement of hundreds of thousands of people\n- Damage to agricultural land and livelihoods\n\n**Malawi:**\n- Worst-affected country \u2014 over 500 deaths\n- Massive flooding and landslides, particularly around Blantyre\n- Cholera outbreak following the flooding\n- Infrastructure severely damaged\n\n**South Africa:**\n- Remnants of Freddy brought heavy rainfall to KwaZulu-Natal, Mpumalanga, and Limpopo\n- Flood warnings issued for north-eastern regions\n- Minor flooding and localised damage\n- Served as a reminder of SA\u2019s vulnerability to Indian Ocean tropical cyclones'),
  q(3, 'What made Tropical Cyclone Freddy historically significant?',
    ['Its exceptionally long lifespan of over five weeks', 'It was the first cyclone to reach Category 5', 'It formed at the equator', 'It struck Johannesburg directly'], 0,
    'Freddy\u2019s lifespan of more than five weeks made it one of the longest-lasting tropical cyclones in recorded history, crossing the entire Indian Ocean.'),
  t(4, '### Lessons Learned from Cyclone Freddy\n\n1. **Early warning systems** are critical \u2014 communities with advance notice were able to evacuate\n2. **Climate change** may be increasing the intensity and duration of tropical cyclones due to warmer ocean waters\n3. **Vulnerable communities** (informal settlements, floodplains) suffer disproportionately\n4. **International cooperation** is essential for disaster response across borders\n5. **Infrastructure resilience** \u2014 bridges, roads, and buildings must be designed to withstand extreme weather\n6. **Post-disaster recovery** must address waterborne diseases (cholera, typhoid) from contaminated water supplies'),
  q(5, 'Which country was worst affected by Tropical Cyclone Freddy in terms of deaths?',
    ['Malawi', 'Mozambique', 'South Africa', 'Madagascar'], 0,
    'Malawi suffered over 500 deaths, making it the worst-affected country, particularly around Blantyre where flooding and landslides were devastating.'),
  fb(6, 'Tropical Cyclone Freddy formed in the ___-West Indian Ocean and made final landfall in ___.',
    ['South', 'Mozambique'],
    'Freddy formed in the South-West Indian Ocean and made its final and most destructive landfall in Mozambique before moving inland.'),
  t(7, '### Comparing Mid-latitude and Tropical Cyclones\n\n| Feature | Mid-latitude Cyclone | Tropical Cyclone |\n|---------|---------------------|------------------|\n| **Energy source** | Temperature contrast between air masses | Warm ocean water (latent heat) |\n| **Latitude of formation** | 30\u00b0\u201360\u00b0 | 5\u00b0\u201320\u00b0 |\n| **Size** | 1 000\u20133 000 km | 200\u2013800 km |\n| **Fronts** | Cold front, warm front | No fronts |\n| **Eye** | No distinct eye | Clear, calm eye |\n| **Season (SA)** | Winter (May\u2013August) | Summer (November\u2013April) |\n| **Associated weather** | Prolonged rain, cold snaps | Torrential rain, storm surge, extreme winds |\n| **Movement** | West to east (Westerlies) | East to west, then curving poleward |\n| **Duration** | 3\u20137 days | Days to weeks |'),
  q(8, 'What is the primary energy source for a tropical cyclone?',
    ['Latent heat released from condensation of warm, moist ocean air', 'Temperature contrast between two air masses', 'Solar radiation directly heating the eye', 'Friction with the ocean surface'], 0,
    'Tropical cyclones are fuelled by latent heat released when warm, moist air rises from the ocean surface and condenses into cumulonimbus clouds.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Climate and Weather \u2014 Subtropical Anticyclones
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## South Africa\u2019s Three High-Pressure Cells\n\nSouth Africa\u2019s weather and climate are strongly influenced by three semi-permanent subtropical high-pressure cells (anticyclones).\n\n| High-Pressure Cell | Location | Key Influence |\n|-------------------|----------|---------------|\n| **South Atlantic High** | Over the South Atlantic Ocean, west of SA | Controls weather along the west coast; brings cold Benguela Current |\n| **South Indian High** | Over the South Indian Ocean, east of SA | Brings warm, moist air via the Agulhas Current to the east coast |\n| **Kalahari High** | Over the interior plateau of SA (winter) | Creates dry, stable conditions over the interior in winter |\n\nThese highs are part of the **subtropical high-pressure belt** at approximately 30\u00b0S, created by the descending limb of the Hadley Cell.'),
  t(2, '### The South Atlantic High\n\n- Located semi-permanently over the South Atlantic Ocean\n- Drives the cold **Benguela Current** northward along the west coast of SA\n- The Benguela Current cools the air along the west coast, causing:\n  - **Fog and low stratus clouds** along the Namib coast and West Coast\n  - **Low rainfall** along the west coast (cold air holds less moisture)\n  - Cool sea temperatures unsuitable for tropical cyclone formation\n- The South Atlantic High **ridges** (extends) over the southern Cape in winter, bringing clear, dry weather ahead of a cold front\n\n### The South Indian High\n\n- Located semi-permanently over the South Indian Ocean\n- Drives the warm **Agulhas Current** southward along the east coast of SA\n- The warm Agulhas Current warms the air, causing:\n  - High evaporation and **moisture-laden onshore winds** along the east coast\n  - Higher rainfall along the KwaZulu-Natal coast and Eastern Cape\n  - Warm, humid conditions favourable for convective thunderstorms in summer'),
  q(3, 'Which ocean current is driven by the South Atlantic High and causes fog along the west coast?',
    ['The cold Benguela Current', 'The warm Agulhas Current', 'The Mozambique Current', 'The Antarctic Circumpolar Current'], 0,
    'The South Atlantic High drives the cold Benguela Current northward along the west coast. Cold water cools the air, causing condensation and coastal fog.'),
  fb(4, 'The warm ___ Current flows along the east coast of SA, driven by the South ___ High.',
    ['Agulhas', 'Indian'],
    'The South Indian High drives the warm Agulhas Current southward along the east coast, bringing warm, moist conditions.'),
  t(5, '### The Kalahari High\n\n- Forms over the **interior plateau** of SA during **winter** (June\u2013August)\n- Created by intense radiative cooling of the land surface under clear skies\n- Produces:\n  - Dry, stable, cloud-free conditions over the interior\n  - Very cold nights (frost, especially on the Highveld)\n  - Temperature inversions that trap pollution (e.g., Johannesburg, Vaal Triangle)\n- The Kalahari High is **stronger in winter** and weakens/disappears in summer when the interior heats up and develops low pressure (heat low)'),
  t(6, '### Influence on SA Weather: Integration\n\n**Inversion Layer:**\nThe subsiding (descending) air in a high-pressure system creates a **temperature inversion** \u2014 a layer where temperature increases with altitude rather than decreasing. This inversion:\n- Acts as a lid, preventing vertical air movement\n- Traps pollutants, smoke, and dust below the inversion layer\n- Causes hazy conditions over the Highveld in winter\n- Prevents cloud formation, resulting in clear, dry weather\n\n**The Plateau Effect:**\nSA\u2019s interior plateau (average elevation ~1 200 m) means:\n- The high-pressure cells have greater influence because the land surface is already at a high altitude\n- The escarpment acts as a barrier to moisture moving inland from the coasts\n- Orographic rainfall occurs on the seaward side of the escarpment'),
  q(7, 'Why does the Kalahari High trap pollution over the Highveld in winter?',
    ['The subsiding air creates a temperature inversion that acts as a lid', 'Strong winds blow pollution from factories', 'Heavy rain washes pollutants into the air', 'The Kalahari desert produces dust storms'], 0,
    'The descending air in the Kalahari High warms as it sinks, creating a temperature inversion. This inversion traps cold surface air (and pollutants) beneath the warmer layer, preventing dispersion.'),
  t(8, '### Ridging of High-Pressure Cells\n\n**Ridging** occurs when a high-pressure cell extends a tongue (ridge) of high pressure towards another area.\n\n**South Atlantic High ridging behind a cold front:**\n- After a cold front passes over the Cape, the South Atlantic High ridges in behind it\n- This brings clear, cool conditions and berg (hot, dry) winds ahead of the next cold front\n\n**South Indian High ridging south of SA:**\n- The South Indian High may ridge south of the country\n- This pushes warm, moist air onshore along the east coast\n- Can cause heavy rainfall and flooding along the KwaZulu-Natal coast, especially when combined with a cut-off low\n\n**Berg winds:**\nWhen the Kalahari High or a ridging Atlantic High forces air from the interior toward the coast, the air descends the escarpment and warms adiabatically, creating hot, dry **berg wind** conditions. This is common along the Eastern Cape and KZN coasts in winter.'),
  q(9, 'What causes berg winds along the SA coast?',
    ['Air descending from the interior plateau warms adiabatically as it drops', 'The Agulhas Current heats the air', 'Cold fronts push warm air ahead of them', 'Tropical cyclones bring hot winds'], 0,
    'Berg winds occur when high pressure over the interior forces air down from the plateau. As it descends the escarpment, it warms by adiabatic compression, arriving at the coast as hot, dry wind.',
    ['Think about what happens to temperature when air descends in altitude.']),
  fb(10, 'A temperature ___ is created by subsiding air in a high-pressure cell, where temperature ___ with altitude instead of decreasing.',
    ['inversion', 'increases'],
    'A temperature inversion is an abnormal condition where temperature increases with altitude, trapping cooler air (and pollutants) near the surface.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Climate and Weather \u2014 Valley and Urban Climates
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Valley Climates\n\nValleys create their own microclimates due to topography, slope aspect, and differential heating.\n\n### Slope Aspect\n\nIn the Southern Hemisphere:\n- **North-facing slopes** receive more direct solar radiation \u2192 warmer, drier, used for agriculture (e.g., vineyards in the Western Cape)\n- **South-facing slopes** receive less direct sunlight \u2192 cooler, moister, often forested or shaded\n\nThis has practical implications:\n- Wine farms in Stellenbosch and Franschhoek prefer north-facing slopes\n- Settlement and farming tend to favour the warmer, north-facing side of valleys'),
  t(2, '### Temperature Distribution in Valleys\n\n**Anabatic winds (daytime):**\n- During the day, valley slopes heat up faster than the valley floor\n- Warm air rises up the slopes, creating an **upslope breeze** (anabatic wind)\n- Cumulus clouds may form over the mountain peaks in the afternoon\n\n**Katabatic winds (nighttime):**\n- At night, the slopes cool quickly by radiation\n- Cold, dense air flows downslope under gravity, collecting on the valley floor\n- This is a **downslope breeze** (katabatic wind)\n\n```\n  DAY (Anabatic)         NIGHT (Katabatic)\n       \u2191  \u2191                   \u2193  \u2193\n      /    \\                /    \\\n     / warm \\              / cold \\\n    /        \\            /        \\\n   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500          \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n    valley floor          cold pool\n```'),
  q(3, 'Which type of valley wind blows upslope during the day?',
    ['Anabatic wind', 'Katabatic wind', 'Berg wind', 'Trade wind'], 0,
    'Anabatic winds blow upslope during the day when the valley slopes heat up faster than the valley floor, causing warm air to rise along the slopes.'),
  t(4, '### Frost Pockets and Radiation Fog\n\n**Frost pockets:**\n- At night, katabatic winds carry cold air to the valley floor\n- The cold air is trapped by the surrounding valley walls \u2014 forming a **cold pool**\n- Temperatures drop to below 0\u00b0C, and frost forms on the ground\n- These valley floor locations are called **frost pockets** or frost hollows\n- Farmers avoid planting frost-sensitive crops on valley floors (e.g., citrus in the Limpopo valleys)\n\n**Radiation fog:**\n- On calm, clear nights, the valley floor cools rapidly by radiation\n- If the air cools to its **dew point**, water vapour condenses into tiny droplets \u2192 fog\n- **Radiation fog** is common in SA valleys in winter (e.g., Mpumalanga Lowveld, KZN Midlands)\n- It typically forms in the early hours and burns off by mid-morning as the sun heats the air\n\n**Temperature inversion in valleys:**\n- The cold pool on the valley floor is overlaid by warmer air higher up\n- This creates a **temperature inversion** similar to the one under the Kalahari High\n- Smoke, mist, and pollutants are trapped below the inversion'),
  fb(5, 'Cold air that flows downslope at night forms a ___ on the valley floor. If temperatures drop below 0\u00b0C, this area becomes a frost ___.',
    ['cold pool', 'pocket'],
    'Katabatic winds carry cold, dense air downslope at night. It collects on the valley floor as a cold pool, and if cold enough, the area becomes a frost pocket.'),
  q(6, 'Radiation fog in valleys forms when:',
    ['The valley floor cools to the dew point on a calm, clear night', 'Strong winds push moisture into the valley', 'A cold front passes through the valley', 'The sun heats the valley floor during the day'], 0,
    'Radiation fog forms when the ground cools by longwave radiation on calm, clear nights, chilling the air to its dew point so that water vapour condenses into fog.'),
  t(7, '## Urban Climates\n\n### Urban Heat Island (UHI)\n\n**Definition:** An urban heat island is a metropolitan area that is significantly warmer than its surrounding rural areas, particularly at night.\n\n**Causes of the UHI effect:**\n1. **Dark surfaces** (tar roads, rooftops) absorb more solar radiation than vegetation\n2. **Concrete and brick** store heat during the day and release it slowly at night\n3. **Reduced vegetation** means less cooling by evapotranspiration\n4. **Waste heat** from vehicles, air conditioners, factories, and buildings\n5. **Canyon effect** \u2014 tall buildings trap heat and reduce wind flow through streets\n6. **Reduced albedo** \u2014 urban surfaces reflect less solar radiation than natural surfaces\n\n**Temperature difference:** Urban areas can be **2\u20138\u00b0C warmer** than surrounding rural areas, especially on calm, clear nights.'),
  t(8, '### Effects and Strategies for UHI\n\n**Effects of urban heat islands:**\n- Higher energy consumption (more air conditioning)\n- Increased thermal discomfort, especially for the elderly and vulnerable\n- Higher concentrations of air pollutants (ozone forms faster in heat)\n- More intense convective thunderstorms over cities (heated air rises rapidly)\n- Altered rainfall patterns \u2014 more rain downwind of the city\n\n**Strategies to reduce UHI:**\n- **Green roofs and walls** \u2014 vegetation cools buildings through evapotranspiration\n- **Urban tree planting** \u2014 provides shade and reduces surface temperatures\n- **Cool pavements and roofs** \u2014 high-albedo (reflective) surfaces reduce heat absorption\n- **Parks and green spaces** \u2014 act as cool islands within the city\n- **Water features** \u2014 fountains and ponds provide evaporative cooling\n- **Reducing vehicle emissions** \u2014 public transport, cycling lanes\n\n**SA examples:**\n- Johannesburg\u2019s urban forest (~10 million trees) significantly moderates the UHI effect\n- Cape Town\u2019s Green Infrastructure Plan includes rooftop gardens and cool roofs'),
  q(9, 'Which of the following is NOT a cause of the urban heat island effect?',
    ['Increased vegetation in urban areas', 'Dark surfaces absorbing solar radiation', 'Waste heat from vehicles and buildings', 'The canyon effect of tall buildings'], 0,
    'Increased vegetation would actually REDUCE the UHI effect through shading and evapotranspiration. The other options are all causes of UHI.'),
  fb(10, 'A pollution ___ forms over a city when calm conditions trap pollutants under a temperature inversion. The urban heat ___ effect means cities are warmer than surrounding rural areas.',
    ['dome', 'island'],
    'A pollution dome forms when pollutants are trapped over a city under an inversion layer. The urban heat island effect describes the higher temperatures found in urban areas.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Geomorphology \u2014 Drainage Systems
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Drainage Basin Concepts\n\n### Key Terminology\n\n| Term | Definition |\n|------|------------|\n| **Drainage basin** | The entire area drained by a river and all its tributaries |\n| **Catchment area** | Same as drainage basin \u2014 the area from which a river collects water |\n| **Watershed (water divide)** | The ridge or highland boundary separating two adjacent drainage basins |\n| **Source** | The point where a river begins (often a spring, wetland, or mountain) |\n| **Mouth** | The point where a river enters the sea, a lake, or another river |\n| **Tributary** | A smaller stream that flows into a larger river |\n| **Confluence** | The point where two rivers meet |\n| **Interfluves** | The higher ground between two river valleys |\n\nSouth Africa\u2019s major drainage basins include the **Orange-Vaal** system (largest), the **Limpopo**, the **Tugela**, and the **Breede** river systems.'),
  t(2, '### Types of Rivers\n\n| Type | Description | SA Example |\n|------|------------|------------|\n| **Permanent** | Flows throughout the year; reliable water supply | Vaal River, Tugela River |\n| **Periodic** | Flows only during the wet season; dry for part of the year | Molopo River |\n| **Episodic** | Flows only after heavy rainfall events; dry most of the time | Rivers in the Karoo and Northern Cape |\n| **Exotic** | Originates in a wet area and flows through a dry area; sustained by upstream rainfall | Orange River (rises in Lesotho highlands, flows through the arid Northern Cape) |\n\nSouth Africa is a **water-scarce country** \u2014 most rivers are periodic or episodic, and the exotic Orange River is critical for irrigation in the arid west.'),
  q(3, 'The Orange River is classified as an exotic river because:',
    ['It rises in the wet Lesotho highlands but flows through the arid Northern Cape', 'It flows underground for most of its course', 'It is the longest river in Africa', 'It flows in the opposite direction to other SA rivers'], 0,
    'An exotic river originates in a region of higher rainfall and sustains its flow through a dry area. The Orange River is fed by rainfall and snowmelt in the Lesotho mountains and maintains flow through the semi-arid to arid interior of South Africa.'),
  fb(4, 'The boundary between two drainage basins is called a ___. The point where two rivers meet is called a ___.',
    ['watershed', 'confluence'],
    'A watershed (water divide) is the ridge separating drainage basins. A confluence is the junction where two rivers join.'),
  t(5, '### Drainage Patterns\n\nThe pattern formed by rivers and their tributaries is influenced by **underlying geology** and **slope**.\n\n| Pattern | Description | Formed When |\n|---------|------------|-------------|\n| **Dendritic** | Tree-like branching pattern | Uniform rock type and gentle slope (most common) |\n| **Trellis** | Rectangular grid with main rivers joined at right angles by tributaries | Alternating hard and soft rock bands (folded mountains) |\n| **Rectangular** | Right-angle bends in rivers | Jointed or faulted rock (rivers follow cracks) |\n| **Radial** | Rivers flow outward from a central high point | Volcanic cone or dome-shaped hill |\n| **Centripetal** | Rivers flow inward toward a central low point | Basin or depression (e.g., an inland pan) |\n| **Deranged** | No clear pattern; irregular, disconnected | Recently glaciated or disturbed landscape |\n| **Parallel** | Rivers flow side by side in the same direction | Steep, uniform slope |'),
  q(6, 'A trellis drainage pattern develops in an area with:',
    ['Alternating bands of hard and soft rock (folded mountains)', 'Uniform rock type', 'A volcanic cone', 'A central basin or depression'], 0,
    'Trellis drainage forms where tributaries follow the softer rock bands and join the main river at approximately right angles, creating a rectangular grid pattern. This is typical of the Cape Fold Mountains in the Western Cape.'),
  t(7, '### Drainage Density\n\nDrainage density is the total length of all streams in a drainage basin divided by the basin area.\n\n$$\\text{Drainage density} = \\frac{\\text{Total stream length (km)}}{\\text{Basin area (km}^2\\text{)}}$$\n\n**Factors affecting drainage density:**\n\n| Factor | High Drainage Density | Low Drainage Density |\n|--------|----------------------|---------------------|\n| **Rock type** | Impermeable rock (clay, shale) | Permeable rock (sandstone, limestone) |\n| **Soil type** | Clay soils (poor infiltration) | Sandy soils (good infiltration) |\n| **Rainfall** | Heavy, intense rainfall | Light, gentle rainfall |\n| **Vegetation** | Sparse vegetation | Dense vegetation (slows runoff) |\n| **Slope** | Steep slopes (fast runoff) | Gentle slopes (slow runoff) |\n\nAreas with **high drainage density** have many closely spaced streams \u2014 common in the Eastern Cape badlands on shale. Areas with **low drainage density** have few, widely spaced streams \u2014 common on the Table Mountain sandstone.'),
  fb(8, 'Drainage density is ___ in areas with impermeable rock and sparse vegetation because water cannot infiltrate and runs off into many small ___.',
    ['high', 'streams'],
    'Impermeable rock and lack of vegetation promote surface runoff, creating many closely spaced streams and high drainage density.'),
  q(9, 'Which drainage pattern would you expect to find around a volcano?',
    ['Radial', 'Dendritic', 'Trellis', 'Centripetal'], 0,
    'A radial drainage pattern develops when rivers flow outward in all directions from a central high point such as a volcanic cone or dome.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Geomorphology \u2014 Fluvial Processes
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Stream Order and Discharge\n\n### Stream Order (Strahler Method)\n\nStream ordering classifies rivers by their position in the drainage network:\n- **Order 1**: A headwater stream with no tributaries\n- **Order 2**: Formed when two Order 1 streams join\n- **Order 3**: Formed when two Order 2 streams join\n- The order only increases when **two streams of the same order** join\n- When streams of different orders join, the higher order continues\n\n### Discharge\n\nDischarge is the volume of water passing a point in a given time.\n\n$$Q = A \\times V$$\n\nWhere: Q = discharge (m\u00b3/s), A = cross-sectional area (m\u00b2), V = velocity (m/s)\n\n**Factors affecting discharge:**\n- Rainfall intensity and duration\n- Size of catchment area\n- Slope gradient\n- Soil and rock permeability\n- Vegetation cover\n- Urbanisation (impermeable surfaces increase runoff)'),
  t(2, '## River Profiles\n\n### Types of River Profiles\n\n**Longitudinal profile** \u2014 a side view from source to mouth, showing how the gradient decreases downstream. The profile is typically **concave** (steep near the source, gentle near the mouth).\n\n**Cross-profile (transverse profile)** \u2014 a view across the valley at a specific point:\n- **Upper course**: V-shaped valley, narrow channel\n- **Middle course**: Wider valley, broader floodplain\n- **Lower course**: Very wide, flat valley, extensive floodplain\n\n**Plan view** \u2014 a bird\u2019s-eye view showing the river\u2019s channel pattern (straight, meandering, braided).\n\n### The Three Stages of a River\n\n| Stage | Gradient | Dominant Process | Valley Shape | Landforms |\n|-------|----------|-----------------|-------------|----------|\n| **Upper (youth)** | Steep | Erosion (vertical) | V-shaped, steep sides | Waterfalls, rapids, gorges, interlocking spurs |\n| **Middle (maturity)** | Moderate | Transport; lateral erosion | Wider valley, floodplain | Meanders, oxbow lakes |\n| **Lower (old age)** | Gentle | Deposition | Flat, wide floodplain | Deltas, natural levees, floodplains, braided channels |'),
  q(3, 'A V-shaped valley with interlocking spurs is characteristic of which stage of a river?',
    ['Upper course', 'Middle course', 'Lower course', 'Estuary'], 0,
    'The upper course has steep gradient and dominant vertical erosion, carving a narrow V-shaped valley. Interlocking spurs form because the river winds around resistant rock outcrops.'),
  t(4, '### Fluvial Landforms: Erosional Features\n\n**Waterfall:**\n- Forms where a river flows over a band of hard rock overlying softer rock\n- The softer rock erodes faster, undercutting the hard cap rock\n- The hard rock overhangs and eventually collapses\n- A **plunge pool** forms at the base from the force of falling water\n- The waterfall gradually **retreats upstream**, forming a **gorge**\n- SA example: **Tugela Falls** in the Drakensberg (948 m, second highest in the world)\n\n**Rapids:**\n- Formed where the river flows over alternating bands of hard and soft rock\n- The soft rock erodes faster, creating steps and turbulent water\n- Common in the upper course\n\n**Gorge:**\n- A deep, narrow valley with steep sides\n- Formed by waterfall retreat or vertical downcutting\n- SA example: **Oribi Gorge** in KwaZulu-Natal'),
  t(5, '### Fluvial Landforms: Meanders and Oxbow Lakes\n\n**Meanders:**\n- Sinuous (S-shaped) bends in a river channel\n- The water flows fastest on the **outside of the bend** (deeper, more erosion \u2192 **river cliff**)\n- The water flows slowest on the **inside of the bend** (shallower, deposition \u2192 **slip-off slope / point bar**)\n- Over time, meanders **migrate laterally** across the floodplain and downstream\n\n**Oxbow lake:**\n- Forms when a meander loop becomes so extreme that the river **cuts through the neck**\n- The meander is bypassed; the river takes the shorter, straighter route\n- Deposition seals off the old meander loop from the main channel\n- The abandoned loop becomes an **oxbow lake** (crescent-shaped)\n- Over time, the oxbow lake fills with sediment and vegetation, becoming a **meander scar**'),
  q(6, 'On which side of a meander bend does erosion occur?',
    ['The outer bank (river cliff)', 'The inner bank (slip-off slope)', 'Both banks equally', 'Neither \u2014 meanders are formed by deposition only'], 0,
    'Erosion occurs on the outer bank where water velocity is highest, creating a steep river cliff. Deposition occurs on the inner bank where velocity is lowest, forming a gentle slip-off slope (point bar).'),
  fb(7, 'An oxbow lake forms when a meander loop is cut off from the main channel. The steep, eroded outer bank of a meander is called a river ___.',
    ['cliff'],
    'When the river cuts through the neck of a tight meander, the abandoned loop becomes an oxbow lake. The outer bank where erosion dominates is the river cliff.'),
  t(8, '### Fluvial Landforms: Depositional Features\n\n**Floodplain:**\n- A flat area of land on either side of a river, formed by repeated flooding and deposition of alluvium (fine sediment)\n- The floodplain widens as meanders migrate laterally\n- SA example: The Vaal River floodplain\n\n**Natural levees:**\n- Raised banks along the river channel, formed when the river floods\n- During flooding, water overflows the banks; the heaviest sediment is deposited immediately beside the channel\n- Over many floods, these deposits build up into natural levees\n\n**Delta:**\n- Forms where a river enters a calm body of water (sea or lake)\n- The river velocity suddenly drops, and sediment is deposited\n- The channel splits into distributaries\n- SA example: The **Okavango Delta** in Botswana (the Okavango River originates in Angola)\n\n**Braided stream:**\n- A river that splits into multiple channels separated by temporary islands (bars)\n- Common where rivers carry a heavy sediment load and have variable discharge\n- SA example: Rivers descending from the Drakensberg into the KZN lowlands'),
  q(9, 'Natural levees form because:',
    ['The heaviest sediment is deposited closest to the channel during flooding', 'Humans build embankments along rivers', 'Erosion cuts away the floodplain except near the river', 'Vegetation traps sediment at the river mouth'], 0,
    'When a river floods, it overflows its banks. The heavier, coarser sediment settles closest to the channel (where velocity drops first), gradually building up natural levees with each flood event.'),
  fb(10, 'A ___ forms where a river enters a calm body of water and deposits its sediment load. The channel splits into multiple ___.',
    ['delta', 'distributaries'],
    'A delta forms when the river loses velocity as it enters the sea or a lake, depositing sediment. Distributaries are the branching channels within the delta.'),
];

blockNum = 0;
const ch6_lesson2 = [
  t(1, '## River Grading\n\nA **graded river** (or river at grade) is one in which the slope of the channel has been adjusted to provide exactly the velocity needed to transport the sediment supplied from the drainage basin, given the available discharge.\n\n### Characteristics of a Graded Profile\n\n- The longitudinal profile is a smooth, **concave curve** from source to mouth\n- There is a balance between erosion and deposition\n- The river neither deepens its channel significantly nor deposits excessive sediment\n- Any disruption (e.g., tectonic uplift, change in base level) will cause the river to adjust\n\n### Base Level\n\n**Base level** is the lowest level to which a river can erode.\n- **Ultimate base level**: Sea level\n- **Temporary (local) base level**: A resistant rock band, lake, or dam that temporarily prevents further downcutting\n\nWhen base level changes (e.g., sea level drops), the river adjusts its profile through renewed erosion \u2014 this is called **rejuvenation**.'),
  q(2, 'A graded river is one where:',
    ['The channel slope is adjusted so erosion and deposition are in balance', 'The river flows in a perfectly straight line', 'The river has reached sea level at every point', 'Deposition exceeds erosion throughout'], 0,
    'A graded river has achieved an equilibrium where its slope provides just enough velocity to transport the sediment supplied, with no net erosion or deposition.'),
  t(3, '### Processes of River Erosion\n\n| Process | Description |\n|---------|------------|\n| **Hydraulic action** | The sheer force of flowing water dislodges loose material from the bed and banks |\n| **Abrasion (corrasion)** | The river\u2019s sediment load grinds against the bed and banks like sandpaper |\n| **Attrition** | Rock fragments carried by the river collide and break into smaller, rounder pieces |\n| **Solution (corrosion)** | Chemical dissolution of soluble rock (e.g., limestone) by slightly acidic river water |\n\n### Processes of River Transportation\n\n| Process | Description |\n|---------|------------|\n| **Traction** | Large boulders rolled along the river bed |\n| **Saltation** | Pebbles and gravel bounced along the bed |\n| **Suspension** | Fine silt and clay carried within the water (gives the river a muddy colour) |\n| **Solution** | Dissolved minerals carried invisibly in the water |'),
  fb(4, 'The process where a river\u2019s sediment load grinds against the bed and banks is called ___. When rock fragments collide and become smaller and rounder, this is ___.',
    ['abrasion', 'attrition'],
    'Abrasion (corrasion) is mechanical wearing by sediment grinding against rock. Attrition is the wearing down of transported particles as they collide with each other.'),
  t(5, '### The Hjulstr\u00f6m Curve\n\nThe Hjulstr\u00f6m curve shows the relationship between river velocity and the size of particles that can be:\n- **Eroded** (picked up from the bed)\n- **Transported** (kept moving)\n- **Deposited** (dropped)\n\n**Key points from the Hjulstr\u00f6m curve:**\n1. **Clay and silt** require surprisingly high velocities to erode because their small size makes them cohesive (they stick together)\n2. **Sand** is the easiest particle to erode \u2014 it requires the least velocity\n3. **Boulders** require the highest velocity to be transported\n4. **Deposition velocity** is always less than erosion velocity for any given particle size\n5. Once in motion, particles can be transported by lower velocities than were needed to erode them'),
  q(6, 'According to the Hjulstr\u00f6m curve, which particle size requires the least velocity to erode?',
    ['Sand (medium)', 'Clay (finest)', 'Boulders (coarsest)', 'Gravel'], 0,
    'Sand requires the least velocity to erode because it is not cohesive (like clay) and not too heavy (like boulders). Clay particles stick together and need surprisingly high velocities to dislodge.'),
  t(7, '### Factors Affecting River Velocity\n\n| Factor | Effect on Velocity |\n|--------|-------------------|\n| **Gradient (slope)** | Steeper gradient \u2192 higher velocity |\n| **Channel shape** | Deep, narrow channels are more efficient (less friction) \u2192 higher velocity |\n| **Roughness** | Smooth bed \u2192 less friction \u2192 higher velocity; rocky bed \u2192 more friction |\n| **Discharge** | Higher discharge \u2192 deeper water \u2192 proportionally less friction \u2192 higher velocity |\n| **Wetted perimeter** | The length of bed and banks in contact with water; smaller ratio of wetted perimeter to cross-section = more efficient |\n\n**Hydraulic radius** measures channel efficiency:\n$$\\text{Hydraulic radius} = \\frac{\\text{Cross-sectional area}}{\\text{Wetted perimeter}}$$\n\nA **larger hydraulic radius** means a more efficient channel (less friction per unit of water).'),
  q(8, 'A river channel with a large hydraulic radius is more efficient because:',
    ['A smaller proportion of the water is in contact with the bed and banks, reducing friction', 'The river has a steeper gradient', 'The river carries less sediment', 'The river is wider and shallower'], 0,
    'A large hydraulic radius means the cross-sectional area is large relative to the wetted perimeter. Less of the water touches the friction-causing surfaces, so more energy drives the flow forward.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Geomorphology \u2014 River Rejuvenation and Capture
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## River Rejuvenation\n\n### Definition\n\n**Rejuvenation** is the renewal of a river\u2019s erosive power, caused by a **drop in base level** or **uplift of the land**. The river receives a new burst of energy and begins to erode vertically into its existing floodplain.\n\n### Causes of Rejuvenation\n\n1. **Fall in sea level** \u2014 the river must erode downward to reach the new, lower base level (e.g., during ice ages when sea level dropped)\n2. **Tectonic uplift** \u2014 the land surface is raised, increasing the gradient (e.g., the Drakensberg escarpment uplift)\n3. **Capture of a stream** \u2014 adding discharge from a captured stream increases erosive power\n\nWhen rejuvenation occurs, the river begins to cut a new, steeper profile. The adjustment starts at the mouth and migrates upstream as a **knickpoint**.'),
  t(2, '### Features of Rejuvenation\n\n**Knickpoint:**\n- The point on the river\u2019s longitudinal profile where the old, gentle gradient meets the new, steeper gradient\n- Often marked by a waterfall or rapids\n- Migrates upstream over time as the river erodes backward\n- SA example: Augrabies Falls on the Orange River \u2014 a major knickpoint where the river drops 56 m\n\n**River terraces:**\n- When a river cuts down into its old floodplain, the former floodplain is left as a flat bench above the new channel\n- These abandoned floodplain remnants are called **terraces**\n- **Paired terraces**: Found at the same height on both sides of the valley (one period of rejuvenation)\n- **Unpaired terraces**: At different heights on opposite sides (multiple periods of rejuvenation)\n- Terraces are evidence of past rejuvenation events'),
  q(3, 'A knickpoint on a river\u2019s longitudinal profile is:',
    ['The break in slope where the old gradient meets the new, steeper gradient', 'The point where two rivers meet', 'The deepest part of the river', 'The location of the river\u2019s source'], 0,
    'A knickpoint marks the boundary between the old, adjusted profile and the new, steeper profile caused by rejuvenation. It often appears as a waterfall or rapids and migrates upstream over time.'),
  t(4, '### Entrenched (Incised) Meanders\n\n**Definition:** When a rejuvenated river cuts vertically into its existing meanders, the meanders become deeply incised into the landscape.\n\n**Types:**\n- **Ingrown meanders**: Asymmetric cross-section \u2014 the outside of the bend has a steep cliff, the inside has a gentler slope. The river had time for some lateral erosion while cutting down.\n- **Entrenched meanders**: Symmetric cross-section \u2014 both sides of the meander are equally steep. Rapid downcutting with minimal lateral erosion.\n\n**SA example:** The Blyde River Canyon in Mpumalanga is one of the largest green canyons in the world, formed by the Blyde River cutting deeply into its meanders following tectonic uplift of the Drakensberg escarpment.\n\n**Significance:**\n- Entrenched meanders prove that the river once flowed across a flat floodplain at a higher level\n- The uplift or drop in base level caused the river to cut downward while maintaining its meandering pattern'),
  fb(5, 'When a rejuvenated river cuts into its existing meanders, forming deep gorges, these features are called ___ meanders. The Blyde River Canyon in ___ is an example.',
    ['entrenched', 'Mpumalanga'],
    'Entrenched (incised) meanders form when rejuvenation causes a river to cut vertically into its old meandering course. The Blyde River Canyon in Mpumalanga is a famous South African example.'),
  t(6, '## River Capture (Stream Piracy)\n\n### Definition\n\nRiver capture (stream piracy) occurs when one river diverts the headwaters of a neighbouring river into its own drainage basin.\n\n### How River Capture Occurs\n\n1. **Two rivers** flow in adjacent valleys, separated by a watershed\n2. One river (the **captor**) has more erosive power (steeper gradient, more discharge, softer rock)\n3. The captor erodes **headward** (backward) through the watershed by headward erosion\n4. Eventually, the captor breaches the watershed and diverts the upper course of the other river\n5. The diverted river\u2019s water now flows into the captor\u2019s basin\n\n### Key Terms\n\n| Term | Definition |\n|------|------------|\n| **Captor stream** | The river that captures the headwaters of another river |\n| **Captured (beheaded) stream** | The river that loses its headwaters \u2014 it becomes a **misfit stream** (too small for its valley) |\n| **Elbow of capture** | The sharp bend where the captured stream changes direction to flow into the captor |\n| **Wind gap** | The dry valley or col on the old watershed where the captured stream once crossed |'),
  q(7, 'After river capture, the captured stream becomes a misfit stream because:',
    ['It has lost its headwaters and is too small for its valley', 'It flows in the wrong direction', 'It has been dammed by sediment', 'It has been captured by the sea'], 0,
    'The captured stream loses its headwaters to the captor. Its discharge is greatly reduced, but it still flows in the same valley (which was carved when it had much more water). The stream is now too small for the valley it occupies \u2014 hence a misfit stream.'),
  t(8, '### Evidence of River Capture\n\n1. **Elbow of capture** \u2014 a sharp, almost right-angle bend in the river course\n2. **Wind gap** \u2014 a dry gap in the watershed that once carried the captured stream\n3. **Misfit stream** \u2014 a small stream in an oversized valley downstream of the capture point\n4. **Knickpoint** \u2014 at the point of capture, a waterfall or rapids may develop\n5. **Change in drainage pattern** \u2014 the captured stream now flows in a different direction\n6. **River terrace** evidence \u2014 abandoned terraces at different levels suggest disrupted flow\n\n### SA Example: The Karoo Rivers\n\nRiver capture is common in the Karoo and along the Great Escarpment, where rivers on the steep seaward side of the escarpment erode headward more rapidly than the rivers on the gently sloping interior plateau. The coastal rivers capture headwaters from the interior rivers, gradually extending the coastal drainage basins at the expense of the interior.'),
  fb(9, 'The sharp bend where a captured stream changes direction to join the captor is called the ___ of capture. The dry valley left behind on the old watershed is called a ___ gap.',
    ['elbow', 'wind'],
    'The elbow of capture is the distinctive sharp bend at the point of capture. The wind gap is the abandoned, dry valley on the original watershed where the captured stream used to flow.'),
  q(10, 'Along the Great Escarpment, which rivers are more likely to capture headwaters from interior rivers?',
    ['Coastal rivers \u2014 because the steep escarpment gives them more erosive power', 'Interior rivers \u2014 because they are longer', 'Coastal rivers \u2014 because they have less rainfall', 'Both erode at the same rate'], 0,
    'Rivers on the steep, seaward side of the escarpment have greater gradients and erosive power, enabling them to erode headward through the escarpment and capture headwaters from the more gently sloping interior rivers.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Settlement Geography \u2014 Rural Settlements
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Rural Settlements\n\n### Definition and Classification\n\nA **rural settlement** is a community located outside of cities and large towns, where people are primarily engaged in agriculture, forestry, or fishing.\n\n**Classification criteria:**\n\n| Criterion | Examples |\n|-----------|----------|\n| **Size** | Farmstead (1 family), hamlet (few families), village (larger community) |\n| **Complexity** | Simple (few services) to complex (school, clinic, shops) |\n| **Pattern** | Dispersed (scattered) or nucleated (clustered) |\n| **Function** | Agricultural, mining, fishing, forestry |\n\n### Settlement Patterns\n\n- **Dispersed** \u2014 buildings spread out over a wide area with no clear centre (e.g., commercial farms in the Free State)\n- **Nucleated** \u2014 buildings clustered together around a central point (e.g., a church, water source, or crossroads)'),
  t(2, '### Types of Rural Settlement Plans\n\n| Type | Description | SA Example |\n|------|------------|------------|\n| **Round (kraal)** | Circular layout around a central livestock pen or meeting area | Traditional Zulu homesteads in KZN |\n| **Linear** | Houses arranged along a road, river, or railway line | Farming communities along the N1 or N2 |\n| **T-shaped** | Settlement at the junction of a main road and a side road | Small Karoo dorps at road junctions |\n| **Crossroad** | Settlement at the intersection of two routes | Towns like Three Sisters at the N1/N12 junction |\n\n### Rural Land Use\n\n- **Subsistence farming** \u2014 growing food for the household (common in former homelands of the Eastern Cape, KZN, Limpopo)\n- **Commercial farming** \u2014 producing crops or livestock for sale (Free State maize, Western Cape wine, Mpumalanga forestry)\n- **Mixed land use** \u2014 combination of farming, small businesses, and residential areas'),
  q(3, 'A traditional Zulu homestead arranged in a circular layout around a central cattle pen is an example of:',
    ['A round (kraal) settlement', 'A linear settlement', 'A T-shaped settlement', 'A crossroad settlement'], 0,
    'The round settlement pattern, often called a kraal, features homes arranged in a circle around a central area used for livestock or communal activities. This is characteristic of traditional Zulu and Ndebele homesteads.'),
  t(4, '### Rural-Urban Migration\n\n**Push factors** (reasons people leave rural areas):\n- Poverty and unemployment\n- Lack of services (healthcare, education, electricity)\n- Soil degradation and drought\n- Land shortages and overcrowding in former homelands\n- Lack of social opportunities and entertainment\n\n**Pull factors** (reasons people move to urban areas):\n- Job opportunities in factories, services, construction\n- Better schools, hospitals, and infrastructure\n- Higher wages and standard of living\n- Social opportunities and cultural attractions\n- Perception of a better life (not always realised)\n\n**Consequences of rural-urban migration:**\n- **For rural areas**: Loss of working-age people, ageing population, abandoned farms, decline in services\n- **For urban areas**: Overcrowding, growth of informal settlements, strain on services (water, electricity, sanitation), unemployment, crime'),
  fb(5, 'People leave rural areas due to ___ factors such as poverty and lack of services. They are attracted to cities by ___ factors such as job opportunities.',
    ['push', 'pull'],
    'Push factors drive people away from rural areas (poverty, lack of services). Pull factors attract people to urban areas (jobs, education, healthcare).'),
  t(6, '### Rural Depopulation\n\n**Rural depopulation** is the decline in the population of rural areas over time.\n\n**Causes in South Africa:**\n- Ongoing rural-urban migration (especially young people aged 18\u201335)\n- Mechanisation of farming (fewer workers needed)\n- Drought and environmental degradation\n- Legacy of apartheid homeland system (overcrowded, unproductive land)\n- Decline of mining in some rural areas (e.g., Mpumalanga coal towns)\n\n**Social justice issues:**\n- Unequal land distribution (legacy of the 1913 Natives Land Act)\n- Former homelands remain underdeveloped with poor infrastructure\n- Farm workers lack security of tenure and face evictions\n- Women and elderly disproportionately affected by depopulation\n- Traditional leaders vs democratic governance tensions'),
  q(7, 'Which factor contributes to rural depopulation in South Africa?',
    ['Mechanisation of farming reducing the need for farm labourers', 'Increasing rainfall in rural areas', 'Construction of new schools in rural villages', 'Improved rural road networks'], 0,
    'Mechanisation replaces human labour with machines, reducing employment opportunities in farming communities and driving people to seek work in cities.'),
  t(8, '### Land Reform in South Africa\n\nSouth Africa\u2019s land reform programme addresses the historical injustice of unequal land distribution under colonialism and apartheid.\n\n**Three pillars of land reform:**\n\n1. **Restitution** \u2014 Returning land (or providing compensation) to people dispossessed after 1913\n2. **Redistribution** \u2014 Providing land to the landless poor for residential and productive use (willing buyer, willing seller principle)\n3. **Tenure reform** \u2014 Securing the land rights of farm workers, labour tenants, and people in former homelands\n\n**Challenges:**\n- Slow pace of land transfer (target of 30% redistribution largely unmet)\n- Inadequate post-settlement support (new farmers lack capital, training, equipment)\n- Debates around expropriation without compensation (Constitutional amendment)\n- Land claims backlog in the Land Claims Court\n- Some redistributed farms have become unproductive'),
  fb(9, 'The three pillars of South Africa\u2019s land reform programme are restitution, redistribution, and ___ reform.',
    ['tenure'],
    'Tenure reform aims to secure the land rights of farm workers, labour tenants, and people living in former homelands.'),
  q(10, 'The Natives Land Act of 1913 is significant in the context of land reform because:',
    ['It restricted Black South Africans to only 7% of the land, creating extreme inequality', 'It gave all South Africans equal access to land', 'It established the homeland system', 'It introduced mechanised farming'], 0,
    'The 1913 Natives Land Act confined Black ownership to scheduled reserves (about 7% of the land), laying the foundation for the extreme land inequality that land reform now seeks to address.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Settlement Geography \u2014 Urban Settlements
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Urban Settlements: Origin and Classification\n\n### Urbanisation\n\n**Urbanisation** is the process by which an increasing proportion of a country\u2019s population lives in urban areas.\n\n**South Africa\u2019s urbanisation:**\n- Approximately **68%** of South Africans live in urban areas (and growing)\n- Key urban centres: Gauteng (Johannesburg-Pretoria), Cape Town, Durban, Port Elizabeth (Gqeberha), Bloemfontein\n- Rapid urbanisation is driven by rural-urban migration and natural population growth\n\n### Classification by Function\n\n| Type | Function | SA Example |\n|------|---------|------------|\n| **Central places** | Provide goods and services to surrounding areas | Nelspruit, Polokwane |\n| **Trade/transport towns** | Located on major routes; function as trading hubs | Beaufort West (N1), Colesberg |\n| **Specialised towns** | Dominated by one function | Sasolburg (industrial), Stellenbosch (university/wine), Sun City (resort) |\n| **Mining towns** | Developed around mineral extraction | Kimberley (diamonds), Witbank/eMalahleni (coal), Rustenburg (platinum) |'),
  t(2, '### Central Place Theory (Walter Christaller)\n\nChristaller\u2019s Central Place Theory explains the **size, spacing, and distribution** of settlements.\n\n**Key concepts:**\n\n| Term | Definition |\n|------|------------|\n| **Central place** | A settlement that provides goods and services to its surrounding area |\n| **Sphere of influence** | The area served by a central place (larger settlements have larger spheres) |\n| **Threshold population** | The minimum number of people needed to support a particular good or service |\n| **Range** | The maximum distance people are willing to travel for a good or service |\n\n**Principles:**\n- Higher-order goods (e.g., hospital, university) have large thresholds and ranges\n- Lower-order goods (e.g., bread, milk) have small thresholds and ranges\n- Larger settlements provide both higher-order and lower-order goods\n- Smaller settlements provide only lower-order goods\n\n**The hexagonal pattern:**\nIn theory, spheres of influence form hexagonal shapes to cover an area without overlap or gaps.'),
  q(3, 'According to Central Place Theory, a city like Johannesburg provides:',
    ['Both higher-order and lower-order goods and services', 'Only higher-order goods', 'Only lower-order goods', 'No goods \u2014 it is purely residential'], 0,
    'Larger central places (like Johannesburg) provide the full range of goods and services, from daily necessities (lower-order) to specialised services like international airports and specialist hospitals (higher-order).'),
  t(4, '### Urban Hierarchies\n\nSettlements can be ranked into a hierarchy based on their **size, function, and sphere of influence**.\n\n| Level | Settlement Type | Population (approx.) | Services | SA Example |\n|-------|----------------|---------------------|----------|------------|\n| 1 (lowest) | Hamlet/village | < 5 000 | Basic shop, primary school | Rural villages |\n| 2 | Small town | 5 000 \u2013 50 000 | Secondary school, clinic, bank | Graaff-Reinet |\n| 3 | Large town | 50 000 \u2013 250 000 | Hospital, magistrate court | Polokwane |\n| 4 | City | 250 000 \u2013 1 million | University, specialised shops | Bloemfontein |\n| 5 (highest) | Metropolis | > 1 million | International services, stock exchange | Johannesburg |\n\n**Key relationship:** There are **many small settlements** and **few large settlements** \u2014 this forms a pyramid shape.'),
  fb(5, 'The minimum number of customers needed to support a business is called the ___ population. The maximum distance people will travel for a service is called its ___.',
    ['threshold', 'range'],
    'Threshold population is the minimum market needed for a service to be viable. Range is the maximum distance consumers will travel to access that service.'),
  t(6, '### Urban Land Use Zones\n\n| Zone | Characteristics |\n|------|----------------|\n| **CBD (Central Business District)** | Commercial heart; tall buildings, offices, banks, retail; highest land values; accessible by transport routes; few residents |\n| **Transition zone (inner city)** | Mixed use; older buildings, warehouses converted to apartments, light industry; signs of decay and renewal |\n| **Industrial zone** | Factories, warehousing; located along railway lines and highways for transport access |\n| **Residential zones** | Low-density suburbs (outer), medium-density (middle), high-density (inner); quality and size of housing increases outward |\n| **Rural-urban fringe** | Edge of the city; mix of urban and rural land uses; new housing developments, shopping centres, small holdings |\n\n### Factors Influencing Land Use\n\n- **Accessibility** \u2014 the CBD is the most accessible point (convergence of transport routes)\n- **Land value** \u2014 highest in the CBD, decreasing outward (bid-rent theory)\n- **Zoning regulations** \u2014 municipal rules determine permitted land use\n- **Historical patterns** \u2014 apartheid planning still shapes SA cities'),
  q(7, 'In the bid-rent theory, which land use can afford the highest rents and therefore occupies the CBD?',
    ['Commercial (retail and offices)', 'Residential', 'Industrial', 'Agricultural'], 0,
    'Commercial activities (shops, offices, banks) generate the highest revenue per square metre and can outbid other land uses for the most accessible CBD locations.'),
  t(8, '### The South African City Model\n\nSouth African cities have a unique structure shaped by **apartheid planning** (Group Areas Act, 1950).\n\n**Key features of the apartheid city:**\n- White residential areas closest to the CBD and best amenities\n- Buffer zones (industrial areas, railways, highways) separating racial groups\n- Black townships located far from the CBD (e.g., Soweto 25 km from Johannesburg CBD)\n- Indian and Coloured group areas in intermediate locations\n- Informal settlements on the urban periphery\n\n**Post-apartheid changes:**\n- Desegregation of residential areas (slow and uneven)\n- Growth of gated communities and security estates\n- Expansion of informal settlements\n- Development of new economic nodes outside the CBD (e.g., Sandton in Johannesburg)\n- RDP housing programmes to address housing backlog\n- Improved public transport (e.g., Gautrain, MyCiti bus, Rea Vaya BRT)'),
  fb(9, 'Under apartheid, the Group ___ Act (1950) forced racial segregation in cities. Black townships were located ___ from the CBD.',
    ['Areas', 'far'],
    'The Group Areas Act mandated separate residential areas for different racial groups. Black townships were deliberately located far from the CBD and economic opportunities.'),
  q(10, 'Which of the following is a post-apartheid change in South African cities?',
    ['Development of new economic nodes like Sandton outside the traditional CBD', 'Strict enforcement of the Group Areas Act', 'Removal of all informal settlements', 'Decline in urbanisation rates'], 0,
    'Post-apartheid, new economic nodes like Sandton have developed, drawing commercial activity away from the traditional CBD. The Group Areas Act was repealed, but spatial inequality persists.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Settlement Geography \u2014 Urban Structure and Issues
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Urban Structure Models\n\n### Harris and Ullman Multiple-Nuclei Model (1945)\n\nUnlike earlier models (Burgess concentric zones, Hoyt sector model), Harris and Ullman argued that cities develop around **multiple centres (nuclei)**, not just the CBD.\n\n**Key principles:**\n1. Certain activities require **specialised facilities** (e.g., industry needs transport links)\n2. Similar activities **cluster together** for mutual benefit (e.g., retail agglomeration)\n3. Some activities are **incompatible** and repel each other (e.g., heavy industry and luxury housing)\n4. Some activities cannot afford **high rents** in the CBD and locate elsewhere\n\n**Nuclei in a modern SA city (e.g., Johannesburg):**\n- Johannesburg CBD (original core)\n- Sandton (financial and commercial node)\n- Rosebank (retail and entertainment)\n- OR Tambo Airport area (logistics and industry)\n- Soweto (residential township, now with its own commercial centres)'),
  t(2, '### Western City vs South African City\n\n| Feature | Western City Model | South African City |\n|---------|-------------------|-------------------|\n| **CBD** | Strong, dominant centre | Declining original CBD; new nodes emerging |\n| **Transition zone** | Gentrification, mixed use | Deteriorating inner city, some regeneration |\n| **Residential segregation** | By income class | By race (apartheid legacy) AND income |\n| **Suburbs** | Gradual transition outward | Sharp contrasts (affluent suburbs next to townships) |\n| **Informal settlements** | Rare | Extensive, on periphery |\n| **Transport** | Private car dominant | Fragmented; taxis, buses, trains, new BRT systems |\n| **Gated communities** | Exist but less common | Very common (security concerns) |\n\nThe South African city is characterised by **spatial inequality** \u2014 the legacy of apartheid planning means that race and class still strongly determine where people live.'),
  q(3, 'The Harris and Ullman Multiple-Nuclei Model differs from the Burgess Model because:',
    ['It recognises that cities grow around multiple centres, not just one CBD', 'It places industry in the centre', 'It applies only to South African cities', 'It ignores residential areas'], 0,
    'Harris and Ullman recognised that modern cities develop around several distinct nuclei (centres of activity), rather than growing outward in concentric rings from a single CBD.'),
  t(4, '### Changing Urban Patterns in South Africa\n\n**CBD decline and decentralisation:**\n- Many businesses have moved from traditional CBDs to suburban nodes (e.g., Sandton, Umhlanga, Century City)\n- Causes: crime, congestion, parking shortages, building decay, perception of insecurity\n- Response: Urban renewal projects (e.g., Johannesburg inner city regeneration, Cape Town Foreshore development)\n\n**Growth of informal settlements:**\n- An estimated 1.2 million households live in informal settlements\n- Causes: housing backlog (~2.1 million units), rural-urban migration, poverty, slow delivery of RDP housing\n- Found on urban periphery, along roads, near industrial areas, on flood-prone land\n- Challenges: lack of sanitation, clean water, electricity, and fire risk\n\n**Gentrification:**\n- Wealthier residents move into previously neglected inner-city areas, renovating properties\n- Raises property values but can displace lower-income residents\n- SA examples: Maboneng Precinct (Johannesburg), Woodstock (Cape Town)'),
  fb(5, 'When businesses move from the CBD to suburban areas like Sandton, this process is called ___. The upgrading of inner-city areas that can displace poorer residents is called ___.',
    ['decentralisation', 'gentrification'],
    'Decentralisation is the movement of economic activities from the CBD to suburban nodes. Gentrification is the renovation and upgrading of deteriorated inner-city neighbourhoods, often displacing original lower-income residents.'),
  t(6, '### Urban Issues in South Africa\n\n| Issue | Description | SA Example |\n|-------|------------|------------|\n| **Air pollution** | Vehicle emissions, industrial pollution, coal burning | Johannesburg, Vaal Triangle, Mpumalanga Highveld |\n| **Traffic congestion** | Inadequate public transport, car dependence | N1/N3 highways in Gauteng, M3 in Cape Town |\n| **Housing shortage** | ~2.1 million unit backlog | Informal settlements nationwide |\n| **Overcrowding** | Too many people in too little space | Alexandra township (Johannesburg) |\n| **Inadequate services** | Lack of water, electricity, sanitation | Many informal settlements |\n| **Crime and safety** | High crime rates in urban areas | Widespread concern across all SA cities |\n| **Waste management** | Illegal dumping, overflowing landfills | Cape Town, eThekwini |'),
  t(7, '### Strategies to Address Urban Issues\n\n**Government strategies:**\n1. **RDP/BNG housing** \u2014 subsidised housing for low-income households (Breaking New Ground policy)\n2. **Integrated Development Plans (IDPs)** \u2014 municipalities must plan for sustainable development\n3. **Public transport** \u2014 Gautrain, MyCiti, Rea Vaya BRT, PRASA rail upgrades\n4. **Urban renewal** \u2014 inner-city regeneration programmes\n5. **Service delivery** \u2014 extension of water, electricity, and sanitation to underserved areas\n\n**Community and private sector:**\n- Community-based organisations (CBOs) address local needs\n- PPPs (Public-Private Partnerships) for infrastructure development\n- NGOs providing education, healthcare, and skills training\n- Social housing institutions providing affordable rental accommodation\n\n**Sustainability initiatives:**\n- Green building standards (Green Star rating)\n- Waste recycling programmes and waste-to-energy projects\n- Urban agriculture projects (food gardens in townships)\n- Water conservation and demand management (especially in Cape Town after the 2018 Day Zero crisis)'),
  q(8, 'What was the significance of Cape Town\u2019s "Day Zero" crisis in 2018?',
    ['The city nearly ran out of water due to severe drought, highlighting the need for water conservation', 'The city experienced a major earthquake', 'The CBD was permanently closed', 'All informal settlements were relocated'], 0,
    'Cape Town\u2019s Day Zero crisis (2018) was a severe water shortage caused by drought. The city came close to shutting off municipal water supply, prompting strict water restrictions and highlighting the urgent need for sustainable water management in SA cities.'),
  fb(9, 'South Africa\u2019s housing backlog is approximately ___ million units. The government\u2019s subsidised housing programme is called ___ (Breaking New Ground).',
    ['2.1', 'BNG'],
    'The housing backlog of approximately 2.1 million units is addressed through the BNG (Breaking New Ground) programme, which replaced the earlier RDP housing programme.'),
  q(10, 'Which urban model best describes the spatial structure of modern Johannesburg?',
    ['Multiple-nuclei model \u2014 multiple centres like Sandton, Rosebank, and the original CBD', 'Concentric zone model \u2014 neat rings around the CBD', 'Sector model \u2014 activities arranged in wedge-shaped sectors', 'No model applies \u2014 it is completely random'], 0,
    'Modern Johannesburg has grown around multiple centres (nuclei) including the original CBD, Sandton, Rosebank, Midrand, and OR Tambo, making the multiple-nuclei model the best fit.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: GIS and Map Skills
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Geographic Information Systems (GIS)\n\n### What is GIS?\n\nA **Geographic Information System (GIS)** is a computer-based system that captures, stores, analyses, manages, and presents **spatial data** (data linked to a location on Earth).\n\n### Components of a GIS\n\n| Component | Description |\n|-----------|------------|\n| **Hardware** | Computers, GPS receivers, digitisers, scanners, printers |\n| **Software** | GIS programmes (e.g., ArcGIS, QGIS, Google Earth) |\n| **Data** | Spatial and attribute data (see below) |\n| **People** | Trained operators who collect, manage, and analyse the data |\n| **Methods** | Procedures and techniques for data collection and analysis |\n\n### Applications of GIS\n\n- **Urban planning** \u2014 zoning, infrastructure planning, service delivery\n- **Disaster management** \u2014 flood mapping, fire risk assessment, evacuation routes\n- **Environmental management** \u2014 biodiversity mapping, deforestation monitoring\n- **Health** \u2014 disease outbreak tracking, hospital accessibility analysis\n- **Agriculture** \u2014 crop monitoring, soil mapping, precision farming\n- **Transport** \u2014 route planning, traffic analysis, GPS navigation'),
  t(2, '### Remote Sensing\n\n**Remote sensing** is the collection of information about an object or area from a distance, typically using satellites or aircraft.\n\n**Key concepts:**\n\n| Term | Definition |\n|------|------------|\n| **Sensor** | A device that detects electromagnetic energy (e.g., camera, radar, infrared detector) |\n| **Resolution** | The level of detail captured by the sensor |\n| **Pixel** | The smallest unit in a digital image; each pixel represents an area on the ground |\n| **Spectral bands** | Different wavelengths of energy detected (visible, infrared, microwave) |\n\n**Types of resolution:**\n- **Spatial resolution** \u2014 the size of the smallest feature that can be detected (e.g., 1 m resolution means each pixel represents 1 m\u00b2)\n- **Spectral resolution** \u2014 the number of wavelength bands the sensor can detect\n- **Temporal resolution** \u2014 how often the sensor revisits the same area (e.g., every 16 days)\n- **Radiometric resolution** \u2014 the sensitivity of the sensor to differences in energy'),
  q(3, 'A satellite image with 10 m spatial resolution means:',
    ['Each pixel represents an area of 10 m \u00d7 10 m on the ground', 'The satellite orbits at 10 m altitude', 'The image contains only 10 pixels', 'The satellite revisits every 10 days'], 0,
    'Spatial resolution refers to the ground area represented by each pixel. At 10 m resolution, each pixel covers 10 m \u00d7 10 m = 100 m\u00b2 on the ground.'),
  t(4, '### Data Types in GIS\n\n**Spatial data** (WHERE things are):\n\n| Type | Description | Example |\n|------|------------|--------|\n| **Vector data** | Points, lines, and polygons | School = point; road = line; farm boundary = polygon |\n| **Raster data** | Grid of cells (pixels), each with a value | Satellite image, elevation model, rainfall map |\n\n**Attribute data** (WHAT things are):\n- Non-spatial information linked to spatial features\n- Stored in a database table\n- Example: A polygon representing a farm might have attributes: owner name, crop type, area (hectares), soil type\n\n**Combining spatial and attribute data** is the power of GIS \u2014 you can ask questions like: "Show me all farms larger than 100 ha that grow maize within 5 km of the N1 highway."'),
  fb(5, 'In GIS, ___ data uses points, lines, and polygons to represent features, while ___ data uses a grid of cells (pixels).',
    ['vector', 'raster'],
    'Vector data represents geographic features as discrete points, lines, and polygons. Raster data represents the world as a continuous grid of cells, each with a numerical value.'),
  t(6, '### GIS Data Manipulation Techniques\n\n| Technique | Description | Example |\n|-----------|------------|--------|\n| **Buffering** | Creating a zone of specified distance around a feature | 500 m buffer around a school to identify households within walking distance |\n| **Querying** | Selecting features based on attribute or spatial criteria | Select all roads where speed limit > 80 km/h |\n| **Overlay (data layering)** | Combining two or more layers to create new information | Overlay soil type map with rainfall map to identify suitable farming areas |\n| **Statistical analysis** | Calculating statistics from attribute data | Average household income per ward |\n| **Data integration** | Combining data from different sources into one system | Merging census data with satellite imagery |\n\n### Example GIS Analysis\n\n**Question:** Where should a new clinic be built?\n\n**Layers used:**\n1. Population density (raster)\n2. Existing clinics (points)\n3. Roads (lines)\n4. Suitable land parcels (polygons)\n\n**Process:** Buffer existing clinics by 5 km \u2192 identify areas NOT within 5 km of a clinic \u2192 overlay with high population density \u2192 select only parcels within 500 m of a road \u2192 result = optimal locations.'),
  q(7, 'A GIS buffer of 500 m around all rivers would help identify:',
    ['Areas at risk of flooding within 500 m of a river', 'The depth of each river', 'The direction of river flow', 'The water quality of each river'], 0,
    'Buffering creates a zone around a feature. A 500 m buffer around rivers would highlight all land within 500 m of a river, which is useful for flood risk assessment, conservation planning, or development restrictions.'),
  t(8, '### Map Skills: Gradient, Bearing, and Cross-sections\n\n**Gradient calculation:**\n$$\\text{Gradient} = \\frac{\\text{Vertical difference (rise)}}{\\text{Horizontal distance (run)}}$$\nExpressed as 1:x (e.g., 1:50 means 1 m rise for every 50 m horizontal distance)\n\n**Magnetic declination:**\n- The angle between **true north** (geographic) and **magnetic north** (compass reading)\n- In SA, magnetic declination varies by location and changes over time\n- **True bearing** = Magnetic bearing \u00b1 declination\n- If declination is west: True bearing = Magnetic bearing \u2013 declination\n- If declination is east: True bearing = Magnetic bearing + declination\n\n**Cross-section from a contour map:**\n1. Draw a straight line between two points on the map\n2. Note where each contour line crosses your line and record its altitude\n3. Transfer these values onto graph paper (x-axis = distance, y-axis = altitude)\n4. Connect the points to show the profile of the terrain'),
  fb(9, 'If the vertical difference between two points is 100 m and the horizontal distance is 5 000 m, the gradient is 1:___.',
    ['50'],
    'Gradient = 100/5000 = 1/50, written as 1:50. This means the land rises 1 m for every 50 m of horizontal distance.'),
  q(10, 'The magnetic bearing of a feature is 065\u00b0. If the magnetic declination is 25\u00b0W, the true bearing is:',
    ['040\u00b0', '090\u00b0', '065\u00b0', '025\u00b0'], 0,
    'When declination is west, true bearing = magnetic bearing \u2013 declination. True bearing = 065\u00b0 \u2013 25\u00b0 = 040\u00b0.',
    ['Remember: west declination means magnetic north is west of true north, so subtract.']),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Revision and Exam Preparation
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Exam Structure: Grade 12 Geography\n\n### Paper 1: Climate and Weather + Geomorphology (3 hours, 150 marks)\n\n| Question | Topic | Marks |\n|----------|-------|-------|\n| 1 | Multiple choice and short definitions | 30 |\n| 2 | Mid-latitude cyclones | 30 |\n| 3 | Tropical cyclones OR Subtropical anticyclones | 30 |\n| 4 | Valley and urban climates | 30 |\n| 5 | Drainage systems and fluvial processes | 30 |\n| 6 | River rejuvenation and capture | (part of Q5 or standalone) |\n\n### Paper 2: Settlement Geography + Economic Geography + GIS (3 hours, 150 marks)\n\n| Question | Topic | Marks |\n|----------|-------|-------|\n| 1 | Multiple choice and short definitions | 30 |\n| 2 | Rural and urban settlements | 30 |\n| 3 | Urban structure and issues | 30 |\n| 4 | GIS and map skills | 30 |\n| 5 | Integration and application | 30 |\n\n**Note:** GIS and map skills can be examined in either paper as integrated questions.'),
  t(2, '### Key Terms to Know\n\n**Climate and Weather:**\n- Coriolis effect, jet stream, ITCZ, isobars, isotherms\n- Cold front, warm front, occluded front, air mass\n- Anticyclone, cyclone, ridging, inversion layer\n- Anabatic, katabatic, berg wind, urban heat island\n- Latitude, altitude, continentality, ocean currents\n\n**Geomorphology:**\n- Erosion, weathering, deposition, transportation\n- Hydraulic action, abrasion, attrition, solution\n- Drainage basin, watershed, catchment, confluence\n- Knickpoint, rejuvenation, base level, graded profile\n- Elbow of capture, wind gap, misfit stream\n- Meander, oxbow lake, floodplain, delta, levee\n\n**Settlement Geography:**\n- Urbanisation, rural depopulation, rural-urban migration\n- CBD, transition zone, rural-urban fringe\n- Threshold, range, sphere of influence, hierarchy\n- Gentrification, decentralisation, informal settlement\n- Land reform, restitution, redistribution, tenure'),
  t(3, '### Key Terms to Know (continued)\n\n**GIS and Map Skills:**\n- GIS, remote sensing, GPS, spatial data, attribute data\n- Vector, raster, pixel, resolution (spatial, temporal, spectral)\n- Buffering, querying, overlay, data integration\n- Scale, gradient, bearing, magnetic declination\n- Contour lines, cross-section, intervisibility\n\n### Answering Techniques\n\n**For "discuss" questions (higher marks):**\n- Provide a balanced argument with points for AND against\n- Use specific examples (preferably South African)\n- Link causes to effects\n- Draw annotated diagrams where relevant\n\n**For map/GIS questions:**\n- Always state the scale and show your working\n- Use correct units in your answer\n- When interpreting satellite images, describe cloud patterns, front positions, and associated weather\n- For GIS, explain the data layers and techniques step by step'),
  q(4, 'The following features are evidence of river capture EXCEPT:',
    ['A floodplain', 'An elbow of capture', 'A wind gap', 'A misfit stream'], 0,
    'A floodplain is a normal depositional feature of a river in its middle or lower course. An elbow of capture, wind gap, and misfit stream are all diagnostic evidence of river capture (stream piracy).'),
  q(5, 'Which GIS technique would you use to identify all households within 1 km of a new school?',
    ['Buffering', 'Querying attributes only', 'Changing the map scale', 'Adjusting spectral resolution'], 0,
    'Buffering creates a zone of specified distance (1 km) around a feature (the school). All households falling within this buffer are then identified through overlay analysis.'),
  t(6, '### Exam Tips for Geography\n\n1. **Draw diagrams** \u2014 labelled diagrams earn marks (cross-section of a cyclone, meander formation, valley winds, GIS workflow)\n2. **Use South African examples** \u2014 examiners reward local context (Tugela Falls, Cape Town floods, Sandton node, Blyde River Canyon)\n3. **Define before you explain** \u2014 always start with a clear definition, then elaborate\n4. **Maps and satellite images** \u2014 practise reading synoptic weather maps, topographic maps, and satellite images\n5. **GIS questions** \u2014 name the data layers, the manipulation technique, and the expected output\n6. **Time management** \u2014 150 marks in 3 hours = roughly 1.2 minutes per mark\n7. **Command words:**\n   - "Describe" = say what you see/know\n   - "Explain" = give reasons WHY\n   - "Discuss" = present different viewpoints\n   - "Evaluate" = weigh pros and cons and give a judgement\n   - "Account for" = explain the causes'),
  fb(7, 'Paper 1 covers Climate/Weather and ___. Paper 2 covers Settlement Geography, Economic Geography, and ___.',
    ['Geomorphology', 'GIS'],
    'Paper 1 focuses on physical geography: Climate and Weather (cyclones, anticyclones, valley/urban climates) and Geomorphology (drainage, fluvial processes, rejuvenation/capture). Paper 2 covers human geography and GIS.'),
  q(8, 'An examiner asks you to "account for" the declining population in rural South Africa. This means you should:',
    ['Explain the causes and reasons for rural depopulation', 'Simply list the rural population figures', 'Draw a map of rural South Africa', 'Compare rural and urban populations without explanation'], 0,
    'The command word "account for" requires you to explain the causes and reasons behind a phenomenon. You should discuss push factors, mechanisation, drought, legacy of apartheid land policy, and other causes of rural depopulation.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

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
      title: 'Chapter 1: Climate and Weather \u2014 Mid-latitude Cyclones',
      description: 'Global air circulation, mid-latitude cyclones, fronts, synoptic weather maps, satellite images, and impacts on South Africa.',
      order: 1,
      lessons: [
        { title: 'Global Circulation and Mid-latitude Cyclone Formation', description: 'The three-cell model, jet streams, polar front, cyclone stages, fronts, and associated weather in SA.', blocks: ch1_lesson1, term: 1 },
        { title: 'Synoptic Maps, Satellite Images, and Cyclone Impacts', description: 'Reading synoptic weather maps, satellite image interpretation, wind direction, and impacts on South Africa.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Climate and Weather \u2014 Tropical Cyclones',
      description: 'Formation, stages, structure, impacts, precautionary measures, and a recent case study of a tropical cyclone.',
      order: 2,
      lessons: [
        { title: 'Tropical Cyclone Formation, Structure, and Impacts', description: 'Characteristics, formation factors, stages of development, cross-section, impacts on SA, and precautions.', blocks: ch2_lesson1, term: 1 },
        { title: 'Case Study: Tropical Cyclone Freddy and Cyclone Comparison', description: 'Cyclone Freddy case study, lessons learned, and comparison of mid-latitude and tropical cyclones.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Climate and Weather \u2014 Subtropical Anticyclones',
      description: 'South Atlantic, South Indian, and Kalahari high-pressure cells, their influence on SA weather, inversions, ridging, and berg winds.',
      order: 3,
      lessons: [
        { title: 'South Africa\u2019s Three High-Pressure Cells', description: 'South Atlantic, South Indian, and Kalahari highs; ocean currents; inversions; ridging; berg winds.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Climate and Weather \u2014 Valley and Urban Climates',
      description: 'Valley climates (slope aspect, anabatic/katabatic winds, frost pockets, radiation fog), urban heat islands, pollution domes.',
      order: 4,
      lessons: [
        { title: 'Valley Climates and Urban Heat Islands', description: 'Slope aspect, anabatic and katabatic winds, frost pockets, radiation fog, UHI causes, effects, and strategies.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Geomorphology \u2014 Drainage Systems',
      description: 'Drainage basin concepts, types of rivers, drainage patterns, and drainage density.',
      order: 5,
      lessons: [
        { title: 'Drainage Basins, River Types, and Drainage Patterns', description: 'Catchment area, watershed, permanent/periodic/episodic/exotic rivers, drainage patterns, density factors.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Geomorphology \u2014 Fluvial Processes',
      description: 'Stream order, discharge, river profiles, river stages, erosional and depositional landforms, river grading.',
      order: 6,
      lessons: [
        { title: 'River Profiles, Stages, and Fluvial Landforms', description: 'Stream order, discharge, longitudinal and cross profiles, waterfalls, meanders, oxbow lakes, deltas, levees.', blocks: ch6_lesson1, term: 1 },
        { title: 'River Grading, Erosion Processes, and the Hjulstrom Curve', description: 'Graded profiles, base level, erosion and transportation processes, Hjulstrom curve, hydraulic radius.', blocks: ch6_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 7: Geomorphology \u2014 River Rejuvenation and Capture',
      description: 'Rejuvenation features (knickpoint, terraces, entrenched meanders), river capture (stream piracy, elbow of capture, wind gap).',
      order: 7,
      lessons: [
        { title: 'Rejuvenation and River Capture', description: 'Causes and features of rejuvenation, knickpoints, terraces, entrenched meanders, stream piracy, elbow of capture, wind gap.', blocks: ch7_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 8: Settlement Geography \u2014 Rural Settlements',
      description: 'Classification, settlement patterns, rural-urban migration, rural depopulation, land reform in SA.',
      order: 8,
      lessons: [
        { title: 'Rural Settlements, Migration, and Land Reform', description: 'Settlement types and patterns, push/pull factors, rural depopulation, social justice, and land reform in SA.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Settlement Geography \u2014 Urban Settlements',
      description: 'Urbanisation, classification by function, central place theory, urban hierarchies, land use zones, the SA city model.',
      order: 9,
      lessons: [
        { title: 'Urban Classification, Central Place Theory, and Land Use', description: 'Urbanisation in SA, functional classification, Christaller, urban hierarchy, land use zones, apartheid city model.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Settlement Geography \u2014 Urban Structure and Issues',
      description: 'Harris-Ullman model, western vs SA city, urban issues (pollution, housing, crime), strategies, and social justice.',
      order: 10,
      lessons: [
        { title: 'Urban Models, Issues, and Strategies', description: 'Multiple-nuclei model, SA city structure, urban issues, government strategies, Day Zero, and sustainability.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: GIS and Map Skills',
      description: 'GIS concepts, remote sensing, data types, manipulation techniques, gradient, bearing, magnetic declination, cross-sections.',
      order: 11,
      lessons: [
        { title: 'GIS Concepts, Remote Sensing, and Map Calculations', description: 'GIS components and applications, remote sensing, vector/raster data, buffering, querying, overlay, gradient, bearing.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Revision and Exam Preparation',
      description: 'Exam structure, key terms, answering techniques, and exam tips for Paper 1 and Paper 2.',
      order: 12,
      lessons: [
        { title: 'Revision: Exam Structure, Key Terms, and Tips', description: 'Paper 1 and Paper 2 structure, key definitions, command words, and answering strategies.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 12 Geography \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Climate and Weather, Geomorphology, Settlement Geography, GIS, and Map Skills for the Grade 12 Geography examination.',
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
  console.log('  TEXTBOOK: Grade 12 Geography');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
