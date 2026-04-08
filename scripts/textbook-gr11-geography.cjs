const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SCHOOL_ID = new mongoose.Types.ObjectId('69ce960a98ca4ee738d25416');
const CREATED_BY = new mongoose.Types.ObjectId('69ce960b98ca4ee738d25432');
const GRADE_ID = new mongoose.Types.ObjectId('69d2c1f317b8332733f72601');

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
// CHAPTER 1: Earth's Energy Balance (Term 1)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Earth in Space\n\nThe Earth revolves around the Sun in an elliptical orbit, completing one revolution in approximately 365.25 days. The Earth is tilted on its axis at an angle of **23.5 degrees** relative to the plane of its orbit (the ecliptic plane).\n\n### Key Positions in the Earth\'s Orbit\n\n| Date | Position | Effect in Southern Hemisphere |\n|------|----------|-------------------------------|\n| **21 June** | Winter solstice | Sun directly over Tropic of Cancer (23.5 degrees N). Shortest day, longest night in SA. |\n| **22 December** | Summer solstice | Sun directly over Tropic of Capricorn (23.5 degrees S). Longest day, shortest night in SA. |\n| **21 March** | Autumn equinox | Sun directly over the equator. Day and night are approximately equal. |\n| **23 September** | Spring equinox | Sun directly over the equator. Day and night are approximately equal. |\n\nThe tilt of the Earth\'s axis remains constant (always pointing toward Polaris) as the Earth orbits the Sun. This is called the **parallelism of the axis**.'),
  t(2, '### Revolution and Its Effects\n\nThe Earth\'s revolution (orbit around the Sun) combined with the axial tilt causes the **seasons**.\n\n**Why seasons occur:**\n- The tilted axis means that during different parts of the orbit, different hemispheres are tilted toward or away from the Sun.\n- The hemisphere tilted toward the Sun receives more direct (concentrated) solar radiation and experiences longer days = **summer**.\n- The hemisphere tilted away receives more oblique (spread-out) radiation and shorter days = **winter**.\n\n**Important:** Seasons are NOT caused by the changing distance between the Earth and the Sun. In fact, the Earth is closest to the Sun (perihelion, ~147 million km) in January and farthest (aphelion, ~152 million km) in July.\n\n### Rotation\n\nThe Earth rotates on its axis once every 24 hours, causing day and night. The rotation also gives rise to the **Coriolis effect**, which deflects moving air and water to the left in the Southern Hemisphere.'),
  q(3, 'On which date is the Sun directly over the Tropic of Capricorn?',
    ['22 December', '21 June', '21 March', '23 September'], 0,
    'On 22 December (summer solstice for the Southern Hemisphere), the Sun is directly overhead at the Tropic of Capricorn (23.5 degrees S).'),
  fb(4, 'The Earth is tilted on its axis at an angle of ___ degrees. The consistent pointing of the axis is called the ___ of the axis.',
    ['23.5', 'parallelism'],
    'The axial tilt of 23.5 degrees remains constant throughout the orbit, a phenomenon called the parallelism of the axis.'),
  t(5, '### Angle of Incidence and Insolation\n\nThe **angle of incidence** is the angle at which the Sun\'s rays strike the Earth\'s surface.\n\n- At the **equator**, the Sun is nearly overhead, so rays strike at a high angle (close to 90 degrees). The energy is concentrated over a small area = **high insolation**.\n- Near the **poles**, rays strike at a low angle. The same amount of energy is spread over a larger area = **low insolation**.\n\n**Insolation** (incoming solar radiation) is the amount of solar energy received per unit area at the Earth\'s surface.\n\n**Factors affecting insolation at a location:**\n1. **Latitude** -- the most important factor\n2. **Season** -- tilt determines the angle of incidence\n3. **Time of day** -- highest at solar noon\n4. **Altitude** -- higher altitudes receive more intense radiation\n5. **Cloud cover** -- clouds reflect, absorb, and scatter radiation\n6. **Aspect** -- the direction a slope faces'),
  q(6, 'Why do the poles receive less solar energy per unit area than the equator?',
    ['The Sun\'s rays strike at a lower angle, spreading energy over a larger area', 'The poles are farther from the Sun', 'There is less atmosphere at the poles', 'The Earth\'s magnetic field deflects energy away from the poles'], 0,
    'At the poles, the Sun\'s rays strike the surface at a low angle of incidence, spreading the same beam of energy over a much larger surface area, reducing the insolation received per square metre.',
    ['Think about what happens when you tilt a torch beam -- does the circle of light get bigger or smaller?']),
  t(7, '### Unequal Heating of the Earth\n\nBecause of differences in the angle of incidence, the Earth is heated **unequally** from equator to poles.\n\n**Result of unequal heating:**\n- A surplus of energy exists in the **tropical zone** (between 35 degrees N and 35 degrees S).\n- A deficit of energy exists in the **polar zones** (poleward of 35 degrees).\n- This energy imbalance drives the **global circulation system** -- the atmosphere and oceans transfer heat from the tropics toward the poles.\n\n**Heat transfer mechanisms:**\n1. **Atmospheric circulation** -- warm air rises at the equator, moves poleward, and sinks at higher latitudes (Hadley, Ferrel, Polar cells).\n2. **Ocean currents** -- warm currents carry heat poleward; cold currents carry cool water equatorward.\n3. **Latent heat** -- energy transferred when water evaporates (absorbing heat) and later condenses (releasing heat).'),
  fb(8, 'There is a surplus of energy in the ___ zone and a deficit at the ___. This imbalance drives the global ___ system.',
    ['tropical', 'poles', 'circulation'],
    'The tropics receive more solar energy than they radiate back to space, creating a surplus, while the poles radiate more than they receive, creating a deficit. Atmospheric and oceanic circulation redistribute this energy.'),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## The Earth\'s Energy Balance\n\nThe Earth maintains a relatively stable average temperature because the total energy received from the Sun is approximately equal to the total energy radiated back to space. This is the **energy balance** (also called the heat budget).\n\n### Solar Radiation Reaching the Earth\n\nOf all the solar radiation that reaches the top of the atmosphere:\n\n| Process | Approximate Percentage |\n|---------|------------------------|\n| Reflected by clouds and atmosphere | 26% |\n| Absorbed by atmosphere (ozone, water vapour, dust) | 19% |\n| Reflected by Earth\'s surface (albedo) | 4% |\n| **Absorbed by Earth\'s surface** | **51%** |\n\nSo roughly **51%** of incoming solar radiation is absorbed by the Earth\'s surface, which heats up and then re-radiates this energy as **longwave (infrared) radiation**.'),
  t(2, '### The Greenhouse Effect\n\nThe Earth\'s surface radiates longwave (infrared) radiation upward. **Greenhouse gases** in the atmosphere (water vapour, carbon dioxide, methane, nitrous oxide) absorb some of this outgoing radiation and re-radiate it in all directions -- including back toward the surface.\n\nThis natural process keeps the Earth\'s average surface temperature at approximately **15 degrees C** instead of the **-18 degrees C** it would be without an atmosphere.\n\n**Natural greenhouse effect:** Essential for life. Without it, the Earth would be frozen.\n\n**Enhanced greenhouse effect:** Human activities (burning fossil fuels, deforestation, agriculture) are increasing greenhouse gas concentrations, trapping more heat and causing **global warming** and **climate change**.\n\n### Albedo\n\n**Albedo** is the proportion of solar radiation reflected by a surface.\n\n| Surface | Albedo |\n|---------|--------|\n| Fresh snow | 0.80 -- 0.90 (reflects 80-90%) |\n| Clouds (thick) | 0.60 -- 0.90 |\n| Desert sand | 0.30 -- 0.40 |\n| Grassland | 0.20 -- 0.25 |\n| Forest | 0.10 -- 0.20 |\n| Ocean water | 0.06 -- 0.10 (absorbs most radiation) |'),
  q(3, 'Approximately what percentage of incoming solar radiation is absorbed by the Earth\'s surface?',
    ['51%', '26%', '19%', '4%'], 0,
    'About 51% of solar radiation reaching the top of the atmosphere is absorbed by the Earth\'s surface. The rest is reflected by clouds (26%), absorbed by the atmosphere (19%), or reflected by the surface (4%).'),
  fb(4, 'The natural greenhouse effect keeps the Earth\'s average temperature at approximately ___ degrees C. Without it, the temperature would be about ___ degrees C.',
    ['15', '-18'],
    'Greenhouse gases trap outgoing longwave radiation, maintaining a liveable average temperature of about 15 degrees C rather than the -18 degrees C that would exist without an atmosphere.'),
  t(5, '### Terrestrial Radiation and Counter-radiation\n\n1. The Earth\'s surface absorbs shortwave solar radiation and heats up.\n2. The warm surface emits **longwave (terrestrial) radiation** upward.\n3. Greenhouse gases absorb this longwave radiation.\n4. They re-emit it in all directions -- some escapes to space, some is directed back to the surface as **counter-radiation**.\n5. Counter-radiation further warms the surface.\n\nThis cycle continues until a balance is reached where energy in = energy out.\n\n### Factors That Disrupt the Energy Balance\n\n- **Volcanic eruptions** -- ash and aerosols reflect solar radiation, causing temporary cooling.\n- **Changes in albedo** -- melting ice reduces reflectivity, causing more absorption (positive feedback loop).\n- **Greenhouse gas increases** -- trap more outgoing radiation, leading to warming.\n- **Deforestation** -- reduces carbon absorption by trees, changes albedo.\n- **Urbanisation** -- dark surfaces absorb more heat (urban heat island effect).'),
  q(6, 'Which of the following is an example of a positive feedback loop in the energy balance?',
    ['Melting ice reduces albedo, causing more absorption and further warming', 'Volcanic eruptions increase albedo, causing cooling', 'More clouds reflect more sunlight, causing cooling', 'Plants absorb more CO2, reducing the greenhouse effect'], 0,
    'When ice melts, it exposes darker land or ocean surfaces that absorb more radiation, causing further warming, which melts more ice -- a positive feedback loop that amplifies the original change.',
    ['A positive feedback loop amplifies the initial change rather than counteracting it.']),
  t(7, '### Latitudinal Energy Balance\n\nDifferent latitudes have different energy balances:\n\n- **Low latitudes (0-35 degrees):** Energy received > energy lost = **surplus**. Average annual temperatures are high.\n- **High latitudes (35-90 degrees):** Energy lost > energy received = **deficit**. Average annual temperatures are low.\n- The boundary at approximately **35 degrees** latitude is where incoming and outgoing radiation are equal.\n\n**Why the tropics do not keep getting hotter and the poles do not keep getting colder:**\n- Atmospheric circulation cells (Hadley, Ferrel, Polar) transfer heat poleward.\n- Warm ocean currents (e.g., Agulhas Current) carry heat toward higher latitudes.\n- Cold ocean currents (e.g., Benguela Current) carry cool water toward the equator.\n- This redistribution maintains the **global energy balance**.'),
  fb(8, 'The boundary between energy surplus and deficit zones is at approximately ___ degrees latitude. Warm ocean currents like the ___ Current carry heat poleward.',
    ['35', 'Agulhas'],
    'At approximately 35 degrees latitude, incoming solar radiation equals outgoing terrestrial radiation. The warm Agulhas Current along South Africa\'s east coast is an example of poleward heat transfer.'),
  q(9, 'What is albedo?',
    ['The proportion of solar radiation reflected by a surface', 'The total amount of solar radiation reaching the ground', 'The angle at which sunlight strikes the Earth', 'The intensity of infrared radiation from the Earth'], 0,
    'Albedo is the reflectivity of a surface, expressed as a ratio. High-albedo surfaces (like snow) reflect most radiation; low-albedo surfaces (like ocean water) absorb most.'),
  t(10, '### South African Context\n\nSouth Africa lies between approximately 22 degrees S and 35 degrees S, placing most of the country in the **energy surplus zone**.\n\n**Implications for SA:**\n- High insolation levels, especially in the Northern Cape and Free State (some of the highest solar radiation in the world).\n- This makes SA well-suited for **solar energy** generation.\n- The semi-arid interior has low cloud cover, so more radiation reaches the surface.\n- Coastal areas are moderated by ocean currents (warm Agulhas on the east, cold Benguela on the west).\n- The energy surplus drives convective thunderstorms in summer, particularly over the Highveld.\n\n**Climate change concerns:**\n- SA is warming at approximately twice the global average rate.\n- Increased temperatures mean higher evaporation, reduced water availability.\n- Western and central regions are expected to become drier; eastern regions may experience more intense rainfall events.'),
];

// =============================================================================
// CHAPTER 2: Global Air Circulation (Term 1)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## The Tri-cellular Model\n\nThe atmosphere circulates in three pairs of large-scale convection cells, one set in each hemisphere. These cells are driven by unequal heating of the Earth\'s surface.\n\n### The Three Cells\n\n| Cell | Latitude Range | Surface Winds (Southern Hemisphere) |\n|------|---------------|-------------------------------------|\n| **Hadley Cell** | 0 - 30 degrees S | South-east trade winds |\n| **Ferrel Cell** | 30 - 60 degrees S | North-westerly winds (westerlies) |\n| **Polar Cell** | 60 - 90 degrees S | Polar easterlies |\n\n**Hadley Cell:**\n- Warm air rises at the equator (ITCZ -- Inter-Tropical Convergence Zone).\n- Rises to the tropopause and moves poleward.\n- Cools, sinks at about 30 degrees S, creating the **subtropical high-pressure belt**.\n- Returns to the equator as the **south-east trade winds** (deflected left by the Coriolis effect).\n\n**Ferrel Cell:**\n- Surface air moves poleward from 30 degrees S.\n- Deflected left to become the **prevailing westerlies**.\n- Rises at approximately 60 degrees S (sub-polar low).\n- Returns toward 30 degrees S at upper levels.\n\n**Polar Cell:**\n- Cold, dense air sinks at the poles (polar high).\n- Moves equatorward as **polar easterlies**.\n- Meets warmer air at approximately 60 degrees S (polar front).'),
  q(2, 'Which cell is responsible for the south-east trade winds in the Southern Hemisphere?',
    ['The Hadley Cell', 'The Ferrel Cell', 'The Polar Cell', 'The Walker Cell'], 0,
    'The Hadley Cell drives surface winds from the subtropical high (30 degrees S) back toward the equator. The Coriolis effect deflects these winds to the left in the Southern Hemisphere, creating south-east trade winds.'),
  t(3, '### Why the Cells Form\n\n1. **Unequal heating:** The equator receives the most intense solar radiation, creating a zone of low pressure (ITCZ) where warm air rises. The poles receive the least, creating high pressure where cold air sinks.\n2. **Convection:** Warm air rises, cools, and sinks when it becomes denser. This vertical circulation creates the cells.\n3. **Coriolis effect:** The Earth\'s rotation deflects the horizontal wind flow within each cell, preventing a simple single-cell circulation.\n\nWithout the Coriolis effect, there would be only one cell per hemisphere -- warm air rising at the equator, flowing directly to the poles, sinking, and returning along the surface. The Earth\'s rotation breaks this into three cells.\n\n### Jet Streams\n\nJet streams are narrow ribbons of very fast wind (200-400 km/h) at the tropopause:\n- **Subtropical jet stream** -- at approximately 30 degrees S, between the Hadley and Ferrel cells.\n- **Polar front jet stream** -- at approximately 60 degrees S, between the Ferrel and Polar cells.\n\nJet streams steer weather systems and influence the position of surface pressure systems.'),
  fb(4, 'The three atmospheric circulation cells are the Hadley Cell, the ___ Cell, and the Polar Cell. Without the ___ effect, there would be only one cell per hemisphere.',
    ['Ferrel', 'Coriolis'],
    'The Ferrel Cell lies between 30 and 60 degrees. The Coriolis effect (caused by the Earth\'s rotation) breaks the simple single-cell model into the three-cell system.'),
  t(5, '## World Pressure Belts\n\nThe tri-cellular model creates alternating bands of high and low pressure around the Earth:\n\n| Latitude | Pressure Belt | Type | Cause |\n|----------|--------------|------|-------|\n| 0 degrees | ITCZ (Equatorial low) | Low | Intense heating, rising air |\n| 30 degrees S/N | Subtropical high | High | Descending air from Hadley Cell |\n| 60 degrees S/N | Sub-polar low | Low | Converging air from Ferrel and Polar cells |\n| 90 degrees S/N | Polar high | High | Extremely cold, sinking air |\n\n**Seasonal shift:** These pressure belts shift north and south with the seasons, following the overhead position of the Sun. In the Southern Hemisphere summer, the belts shift southward; in winter, they shift northward.\n\nThis seasonal shift has major consequences for South Africa:\n- In summer, the ITCZ moves southward, bringing moisture to the northern parts of SA.\n- In winter, the westerly wind belt shifts northward, bringing cold fronts to the Western Cape.'),
  q(6, 'What causes the subtropical high-pressure belt at approximately 30 degrees latitude?',
    ['Descending air from the upper branch of the Hadley Cell', 'Rising warm air from the surface', 'Cold polar air pushing toward the equator', 'Oceanic cooling of the lower atmosphere'], 0,
    'Air that rises at the equator in the Hadley Cell moves poleward at upper levels, cools, and descends at approximately 30 degrees latitude, creating the subtropical high-pressure belt.'),
  t(7, '### Pressure Belts and South Africa\n\nSouth Africa lies between approximately 22 degrees S and 35 degrees S, under the influence of the subtropical high-pressure belt.\n\n**Key pressure systems affecting SA:**\n- **South Atlantic High** (west) -- drives the cold Benguela Current; brings dry conditions to the west coast.\n- **South Indian High** (east) -- drives the warm Agulhas Current; brings moisture to the east coast.\n- **Kalahari High** (interior, winter) -- creates dry, stable conditions over the interior.\n- **Continental Low** (interior, summer) -- creates unstable conditions, convective thunderstorms.\n\nThe interaction between these systems and the seasonal shift of the pressure belts determines SA\'s climate zones and rainfall patterns.'),
  fb(8, 'In summer, the ITCZ shifts ___, bringing moisture to northern SA. In winter, the westerly wind belt shifts ___, bringing cold fronts to the Western Cape.',
    ['southward', 'northward'],
    'Pressure belts follow the Sun\'s seasonal movement. Summer brings the ITCZ southward (more rain in the north), while winter shifts the westerlies northward (frontal rain in the Cape).'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Pressure and Wind\n\n### The Relationship Between Pressure and Wind\n\nWind is the horizontal movement of air from areas of **high pressure** to areas of **low pressure**. The greater the difference in pressure over a given distance (the **pressure gradient**), the stronger the wind.\n\n**Key principles:**\n1. Air always moves from high to low pressure (following the pressure gradient force).\n2. The **Coriolis effect** deflects moving air to the left in the Southern Hemisphere.\n3. **Friction** with the Earth\'s surface slows the wind and causes it to cross isobars slightly toward low pressure.\n4. At upper levels (no friction), wind blows parallel to isobars -- these are called **geostrophic winds**.\n\n### Wind Direction in the Southern Hemisphere\n\n- Around **low pressure**: air spirals **clockwise** inward.\n- Around **high pressure**: air spirals **anticlockwise** outward.\n\nThis is the opposite of the Northern Hemisphere. Remember: in the Southern Hemisphere, the Coriolis effect deflects to the **left**.'),
  q(2, 'In which direction does air spiral around a low-pressure system in the Southern Hemisphere?',
    ['Clockwise inward', 'Anticlockwise inward', 'Clockwise outward', 'Anticlockwise outward'], 0,
    'In the Southern Hemisphere, the Coriolis deflection to the left causes air to spiral clockwise into a low-pressure centre.'),
  t(3, '### Types of Wind\n\n**Planetary (global) winds:**\n- Trade winds, westerlies, polar easterlies.\n- Driven by the tri-cellular model and the Coriolis effect.\n\n**Regional/seasonal winds:**\n- **Monsoons** -- seasonal reversal of wind direction caused by differential heating of land and ocean.\n- In summer, the land heats faster than the ocean, creating low pressure over the land, drawing in moist oceanic air (wet monsoon).\n- In winter, the land cools faster, creating high pressure over the land, pushing dry air toward the ocean (dry monsoon).\n\n**Local winds:**\n- Land and sea breezes (daily cycle).\n- Berg winds (hot, dry winds descending from the interior to the coast).\n- Valley and mountain breezes (anabatic and katabatic winds).'),
  t(4, '## Monsoons\n\n### The Asian Monsoon System\n\nMonsoons are large-scale seasonal wind reversals, most dramatically seen in South and South-East Asia.\n\n**Summer monsoon (wet):**\n- The Asian landmass heats rapidly, creating an intense thermal low over central Asia.\n- Moist air from the Indian Ocean is drawn onto the land.\n- Heavy, prolonged rainfall across India, Bangladesh, and South-East Asia.\n- The ITCZ shifts northward over the continent.\n\n**Winter monsoon (dry):**\n- The Asian landmass cools, creating high pressure over central Asia (Siberian High).\n- Dry air flows outward from the continent toward the ocean.\n- Little rainfall; cool, dry conditions prevail.\n\n### Monsoon Effects on Africa\n\n- The West African monsoon brings seasonal rains to the Sahel and West Africa.\n- In East Africa, the monsoon influences rainfall patterns in Kenya, Tanzania, and Mozambique.\n- The Indian Ocean monsoon indirectly affects south-eastern Africa by modifying sea-surface temperatures and moisture availability.'),
  q(5, 'What causes the wet (summer) monsoon over Asia?',
    ['The land heats faster than the ocean, creating low pressure that draws in moist oceanic air', 'Cold air from Siberia pushes warm air upward', 'The jet stream brings moisture from the Pacific', 'Tropical cyclones bring rain to the continent'], 0,
    'In summer, the Asian continent heats faster than the surrounding oceans, creating low pressure over land. Moist oceanic air (high pressure over the ocean) is drawn inland, bringing heavy rainfall.',
    ['Think about differential heating -- which surface heats and cools faster, land or water?']),
  fb(6, 'During the summer monsoon, a thermal ___ forms over the heated landmass, drawing in ___ air from the ocean.',
    ['low', 'moist'],
    'Differential heating creates a thermal low over the land in summer. The pressure gradient draws moist oceanic air onshore, causing heavy seasonal rainfall.'),
  t(7, '## Foehn Winds\n\nA **Foehn wind** (also spelled Fohn) is a warm, dry wind that occurs on the leeward (downwind) side of a mountain range.\n\n### How Foehn Winds Form\n\n1. Moist air is forced up the **windward** side of a mountain (orographic uplift).\n2. As it rises, it cools at the **wet adiabatic lapse rate** (approximately 0.5 degrees C per 100 m) because condensation is occurring.\n3. Clouds form, and precipitation falls on the windward side.\n4. The now-dry air crosses the mountain summit and descends on the **leeward** side.\n5. As it descends, it warms at the **dry adiabatic lapse rate** (approximately 1 degree C per 100 m).\n6. The air arrives at the base of the leeward side **warmer and drier** than it was at the same altitude on the windward side.\n\nThe difference in lapse rates means the air gains more temperature descending (dry rate) than it lost ascending (wet rate). This produces the characteristic warm, dry conditions.'),
  t(8, '### Foehn Wind Effects and South African Examples\n\n**Effects of Foehn winds:**\n- Warm, dry conditions on the leeward side.\n- A **rain shadow** area develops on the leeward side (low rainfall).\n- Increased fire danger due to hot, dry air.\n- Rapid snowmelt in mountainous regions.\n- Agriculture on the leeward side may suffer from lack of moisture.\n\n**South African examples:**\n- **Berg winds**: When the interior high pressure forces air over the escarpment toward the coast, the descending air warms adiabatically, creating hot, dry berg-wind conditions along the Eastern Cape and KwaZulu-Natal coast.\n- The **Western Cape rain shadow**: The Boland mountains cause orographic rainfall on the western (windward) slopes, while areas east of the mountains (e.g., the Little Karoo) are in a rain shadow.\n- The **Drakensberg escarpment**: Moist air from the Indian Ocean is forced upward along the eastern escarpment (heavy rainfall on the seaward side, e.g., Mpumalanga Lowveld), while the Highveld interior is drier.'),
  q(9, 'Why is the air warmer at the base of the leeward side than at the same altitude on the windward side?',
    ['The air descends at the dry adiabatic lapse rate (faster warming) after losing moisture on the windward side', 'The Sun heats the leeward side more intensely', 'Friction with the mountain surface generates heat', 'The wind compresses against the mountain, releasing energy'], 0,
    'The ascending air cools at the wet adiabatic rate (0.5 degrees C/100 m) because condensation releases latent heat. After losing moisture as rain, it descends at the dry adiabatic rate (1 degree C/100 m), warming faster than it cooled.',
    ['Compare the two adiabatic lapse rates -- which is greater?']),
  fb(10, 'Air rises on the windward side at the ___ adiabatic lapse rate and descends on the leeward side at the ___ adiabatic lapse rate.',
    ['wet', 'dry'],
    'The wet (saturated) adiabatic lapse rate (about 0.5 degrees C/100 m) applies during ascent with condensation. The dry adiabatic lapse rate (about 1 degree C/100 m) applies during descent without condensation.'),
];

// =============================================================================
// CHAPTER 3: Africa's Weather and Climate (Term 1)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## El Nino and La Nina\n\n### Normal Conditions in the Pacific Ocean\n\nUnder normal conditions:\n- **Trade winds** blow from east to west across the tropical Pacific.\n- Warm surface water is pushed toward the western Pacific (Australia/Indonesia).\n- Cold, nutrient-rich water **upwells** along the coast of South America.\n- Heavy rainfall occurs over the western Pacific (warm water = evaporation = convection).\n- Dry conditions prevail over the eastern Pacific (cold water = stable air).\n\nThis circulation pattern is called the **Walker Circulation** -- an east-west atmospheric circulation cell over the tropical Pacific.'),
  t(2, '### El Nino\n\n**El Nino** (the warm phase of ENSO -- El Nino-Southern Oscillation) occurs when:\n- Trade winds **weaken** or reverse.\n- Warm surface water shifts **eastward** across the Pacific.\n- Upwelling off South America decreases or stops.\n- The Walker Circulation weakens.\n\n**Effects on southern Africa:**\n- **Drier than normal** conditions over most of southern Africa.\n- The South Indian High weakens, reducing moisture transport to the subcontinent.\n- Higher temperatures.\n- Increased **drought** risk, especially in the summer-rainfall region.\n- Reduced crop yields, water shortages.\n- Historical examples: 1991/92, 1997/98, 2015/16 El Nino events caused severe drought in SA.'),
  q(3, 'During an El Nino event, what happens to the trade winds over the Pacific?',
    ['They weaken or reverse direction', 'They strengthen significantly', 'They shift to blow from north to south', 'They remain unchanged'], 0,
    'During El Nino, the trade winds weaken or even reverse, allowing warm surface water to spread eastward across the Pacific and disrupting the normal Walker Circulation.'),
  t(4, '### La Nina\n\n**La Nina** (the cool phase of ENSO) occurs when:\n- Trade winds **strengthen**.\n- Warm water is pushed even more strongly toward the western Pacific.\n- Intense **upwelling** off South America (very cold sea surface).\n- The Walker Circulation intensifies.\n\n**Effects on southern Africa:**\n- **Wetter than normal** conditions over most of southern Africa.\n- Enhanced moisture transport from the Indian Ocean.\n- Cooler temperatures.\n- Increased **flood** risk.\n- Good agricultural seasons (if rainfall is not excessive).\n- Historical examples: 1999/2000, 2010/11, 2021/22 La Nina events brought above-average rainfall.\n\n### ENSO Cycle\n\nEl Nino and La Nina alternate every 2-7 years, with neutral conditions in between. The cycle is monitored using sea-surface temperature anomalies in the central Pacific (Nino 3.4 region).'),
  fb(5, 'El Nino causes ___ conditions in southern Africa, while La Nina causes ___ conditions.',
    ['drier', 'wetter'],
    'El Nino weakens moisture transport to southern Africa (drought), while La Nina enhances it (above-average rainfall).'),
  t(6, '## Climate Controls in Africa\n\nAfrica\'s climate is influenced by several interacting factors:\n\n### 1. Latitude\n- Africa straddles the equator, extending from about 37 degrees N to 35 degrees S.\n- The equatorial region receives the most insolation, with decreasing amounts toward the subtropics.\n- Latitude determines the basic temperature and rainfall patterns.\n\n### 2. Altitude\n- High-altitude areas (e.g., Ethiopian Highlands, East African Plateau, Drakensberg) are cooler than surrounding lowlands.\n- Every 1 000 m increase in altitude reduces temperature by approximately 6.5 degrees C (environmental lapse rate).\n- Mountains create orographic rainfall on windward slopes.\n\n### 3. Ocean Currents\n- **Warm currents** (Agulhas, Mozambique) bring moisture and warmth to eastern coasts.\n- **Cold currents** (Benguela, Canary) create dry, stable conditions on western coasts.\n- The west coasts of Africa (Namib, Sahara coast) are desert partly because cold currents suppress convection.\n\n### 4. Continentality\n- Interior areas far from the ocean have greater temperature ranges (hot summers, cold winters).\n- Coastal areas have moderated temperatures due to the ocean\'s high specific heat capacity.'),
  q(7, 'Why are the west coasts of Africa (e.g., Namib Desert) so dry?',
    ['Cold ocean currents cool the air, creating stable conditions that suppress rainfall', 'The Sahara Desert extends to the coast', 'Mountains block all rainfall from reaching the west', 'The ITCZ never reaches the west coast'], 0,
    'Cold ocean currents (Benguela, Canary) cool the lower atmosphere, creating a stable temperature inversion that suppresses convection and rainfall. This is a major factor in the formation of the Namib and coastal Sahara deserts.',
    ['Think about what cold water does to the air above it -- does cold air rise easily?']),
  fb(8, 'The cold ___ Current creates dry conditions along the south-west African coast, while the warm ___ Current brings moisture to the south-east coast.',
    ['Benguela', 'Agulhas'],
    'The cold Benguela Current flows northward along the west coast (dry conditions), while the warm Agulhas Current flows southward along the east coast (moist conditions).'),
];

blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Synoptic Weather Maps\n\nA **synoptic weather map** is a snapshot of atmospheric conditions over a large area at a specific time. In South Africa, the SA Weather Service produces synoptic maps showing conditions over southern Africa and the surrounding oceans.\n\n### Key Features on a Synoptic Map\n\n| Symbol | Meaning |\n|--------|--------|\n| **Isobars** | Lines joining places of equal atmospheric pressure (measured in hPa) |\n| **H** | High-pressure centre (anticyclone) |\n| **L** | Low-pressure centre (cyclone/depression) |\n| **Blue line with triangles** | Cold front |\n| **Red line with semicircles** | Warm front |\n| **Closely spaced isobars** | Steep pressure gradient = strong winds |\n| **Widely spaced isobars** | Gentle pressure gradient = light winds |\n\n### Pressure Values\n- Standard atmospheric pressure at sea level: **1 013 hPa**.\n- High pressure: typically above 1 020 hPa.\n- Low pressure: typically below 1 008 hPa.\n- Isobars are usually drawn at 4 hPa intervals.'),
  t(2, '### Reading and Interpreting Synoptic Maps\n\n**Step-by-step approach:**\n\n1. **Identify pressure systems** -- locate all H (high) and L (low) centres.\n2. **Determine wind direction** -- air flows clockwise around L and anticlockwise around H in the Southern Hemisphere. Wind blows roughly parallel to isobars, slightly toward low pressure.\n3. **Assess wind speed** -- closely spaced isobars = strong winds.\n4. **Locate fronts** -- cold fronts (blue with triangles), warm fronts (red with semicircles).\n5. **Predict weather** based on position relative to pressure systems and fronts.\n\n### Weather Associated with Pressure Systems\n\n**High pressure (anticyclone):**\n- Subsiding air = clear skies, dry conditions.\n- Light winds.\n- In winter: temperature inversions, frost, fog.\n\n**Low pressure (depression):**\n- Rising air = clouds, precipitation.\n- Stronger winds.\n- Often associated with frontal systems.'),
  q(3, 'If isobars on a synoptic map are very closely spaced, what does this indicate?',
    ['A steep pressure gradient and strong winds', 'A weak pressure gradient and calm conditions', 'High temperatures', 'Heavy rainfall'], 0,
    'Closely spaced isobars indicate a steep (strong) pressure gradient over a short distance. The greater the pressure gradient, the stronger the wind force that drives the air.'),
  t(4, '### Interpreting Fronts on Synoptic Maps\n\n**Cold front approaching Cape Town (typical winter scenario):**\n- A cold front trails from a low-pressure system south-west of the Cape.\n- Ahead of the front: warm, moist NW winds, increasing cloud cover.\n- As the front passes: sudden temperature drop, heavy rain, gusty SW winds, cumulonimbus clouds.\n- Behind the front: clear, cold conditions as the South Atlantic High ridges in.\n\n**Coastal low:**\n- A shallow low-pressure system that moves along the SA coast from west to east.\n- Causes berg-wind conditions ahead of it (hot, dry, offshore winds) and cool, onshore conditions behind it.\n- Most common in autumn and winter along the south coast.\n\n**Cut-off low:**\n- A closed low-pressure system that detaches from the westerly flow.\n- Can remain stationary for days, bringing prolonged heavy rainfall.\n- Often causes flooding in the Eastern Cape and KwaZulu-Natal.'),
  fb(5, 'Behind a cold front, the weather typically features ___ temperatures and the ___ Atlantic High ridges in, bringing clear conditions.',
    ['colder', 'South'],
    'After a cold front passes, temperatures drop sharply. The South Atlantic High extends (ridges) in behind the front, bringing clear, dry, and cold conditions.'),
  t(6, '### Satellite Image Interpretation\n\n**Types of satellite images:**\n- **Visible images**: Show clouds by reflected sunlight (daytime only). Thick clouds appear bright white.\n- **Infrared (IR) images**: Detect heat radiation. Cold, high cloud tops appear white; warm surfaces appear dark. Available day and night.\n- **Water vapour images**: Show moisture distribution in the upper atmosphere.\n\n**Identifying weather systems on satellite images:**\n- **Mid-latitude cyclone**: Comma-shaped cloud band. The head = low-pressure centre, the tail = cold front.\n- **Tropical cyclone**: Circular spiral of clouds with a clear eye at the centre.\n- **High-pressure cell**: Clear area with little or no cloud.\n- **ITCZ**: Band of convective clouds along the equator.\n- **Frontal cloud band**: A line of clouds marking a cold or warm front.'),
  q(7, 'Which type of satellite image is available both day and night?',
    ['Infrared (IR)', 'Visible', 'Water vapour', 'Radar'], 0,
    'Infrared images detect heat radiation emitted by surfaces and cloud tops, so they work regardless of sunlight. Visible images require reflected sunlight and only work during the day.'),
  t(8, '### Practical Skills: Reading a Synoptic Map\n\n**Example scenario:**\nA synoptic map shows a low-pressure system (L, 996 hPa) south-west of Cape Town with a cold front trailing toward the Cape. The South Indian High (H, 1 024 hPa) is east of SA. Isobars are closely spaced near the cold front.\n\n**Analysis:**\n- Wind direction in the Western Cape: NW (flowing clockwise around the low).\n- Conditions ahead of the front: warm, cloudy, light rain possible.\n- As the front passes: heavy rain, gusty SW winds, temperature drop.\n- KwaZulu-Natal: Warm, humid conditions with onshore flow from the South Indian High.\n- Interior: Under the influence of the high-pressure cell to the east -- clear and dry.\n\n**Exam tip:** Always describe the weather for a specific location by relating it to the nearest pressure system and identifying whether it is ahead of, behind, or between fronts.'),
  fb(9, 'On a synoptic map, standard atmospheric pressure at sea level is ___ hPa. Isobars are typically drawn at ___ hPa intervals.',
    ['1013', '4'],
    'Standard sea-level pressure is 1 013 hPa. Synoptic maps in South Africa typically use 4 hPa intervals between isobars.'),
];

// =============================================================================
// CHAPTER 4: Droughts and Desertification (Term 1)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Droughts\n\n### What is a Drought?\n\nA **drought** is a prolonged period of abnormally low rainfall that leads to a shortage of water, affecting ecosystems, agriculture, and human communities.\n\n**Types of drought:**\n\n| Type | Description |\n|------|------------|\n| **Meteorological** | Rainfall is significantly below the long-term average for an extended period. |\n| **Agricultural** | Soil moisture is insufficient for crop growth, even if some rainfall occurs. |\n| **Hydrological** | Water levels in rivers, dams, and groundwater drop below normal. |\n| **Socio-economic** | Water shortage affects the supply of goods and services (food, electricity from hydropower, etc.). |\n\nDroughts are **slow-onset disasters** -- they develop gradually and can persist for months or years.'),
  t(2, '### Causes of Drought\n\n**Natural causes:**\n- **El Nino events** -- weaken moisture transport to southern Africa, causing below-average rainfall.\n- **Shifts in pressure belts** -- the subtropical high may strengthen or the ITCZ may not shift far enough south.\n- **Blocking highs** -- persistent high-pressure systems that deflect rain-bearing systems away from an area.\n- **Natural climate variability** -- multi-year dry cycles.\n\n**Human-induced causes:**\n- **Climate change** -- increasing temperatures lead to higher evaporation and altered rainfall patterns.\n- **Deforestation** -- reduces evapotranspiration, which reduces moisture recycling.\n- **Overgrazing** -- exposes soil, increases runoff, reduces infiltration.\n- **Poor water management** -- over-extraction of groundwater and rivers, lack of water storage infrastructure.'),
  q(3, 'Which type of drought specifically refers to insufficient soil moisture for crop growth?',
    ['Agricultural drought', 'Meteorological drought', 'Hydrological drought', 'Socio-economic drought'], 0,
    'Agricultural drought occurs when soil moisture drops below the level needed for crops to grow, even if there has been some rainfall. It is directly related to plant water needs.'),
  t(4, '### Effects of Drought in South Africa\n\n**Environmental effects:**\n- Reduced river flows and dam levels.\n- Loss of vegetation cover, increased soil erosion.\n- Wildlife mortality and habitat degradation.\n- Increased wildfire risk.\n- Loss of biodiversity.\n\n**Social effects:**\n- Water rationing and restrictions.\n- Food insecurity -- crop failures, livestock losses.\n- Rural-to-urban migration.\n- Health impacts from poor water quality and malnutrition.\n- Conflict over scarce water resources.\n\n**Economic effects:**\n- Agricultural losses (crop failure, livestock death).\n- Increased food prices.\n- Loss of jobs in agriculture and related industries.\n- Reduced hydroelectric power generation.\n- Increased government spending on disaster relief.\n\n**Case study -- 2015-2018 Cape Town water crisis:**\nSevere drought brought Cape Town close to "Day Zero" -- the point when taps would be turned off. Dam levels dropped below 20%. Residents were limited to 50 litres per day. The crisis highlighted the vulnerability of cities dependent on surface water.'),
  fb(5, 'The 2015-2018 Cape Town drought brought the city close to "___" -- the point when municipal taps would be turned off. During the crisis, residents were limited to ___ litres per day.',
    ['Day Zero', '50'],
    'Day Zero was the projected date when Cape Town would need to shut off its municipal water supply. Strict water restrictions of 50 litres per person per day helped avert the crisis.'),
  t(6, '### Drought Management Strategies\n\n**Short-term responses:**\n- Water restrictions and rationing.\n- Emergency water supply (tankers, boreholes).\n- Food aid and livestock feed distribution.\n- Disaster declarations to access emergency funding.\n\n**Long-term strategies:**\n- **Diversifying water sources** -- desalination, groundwater, water recycling, rainwater harvesting.\n- **Improving water storage** -- building dams, maintaining existing infrastructure.\n- **Water-efficient agriculture** -- drip irrigation, drought-resistant crop varieties, conservation farming.\n- **Catchment management** -- protecting wetlands, reducing pollution, managing alien invasive plants.\n- **Climate monitoring** -- early warning systems, seasonal forecasts.\n- **Demand management** -- fixing leaks in municipal systems, tiered water pricing, public awareness campaigns.'),
  q(7, 'Which is a long-term drought management strategy rather than a short-term response?',
    ['Investing in desalination and water recycling infrastructure', 'Deploying emergency water tankers', 'Declaring a disaster area', 'Distributing animal feed to farmers'], 0,
    'Desalination and water recycling are long-term infrastructure investments that diversify water sources and reduce dependency on rainfall. The other options are emergency responses to an ongoing crisis.'),
  fb(8, 'Three strategies for diversifying water sources include desalination, ___ harvesting, and water ___.',
    ['rainwater', 'recycling'],
    'Diversifying water supply through rainwater harvesting and water recycling (treating wastewater for reuse) reduces reliance on dam-fed systems that are vulnerable to drought.'),
];

blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Desertification\n\n### What is Desertification?\n\n**Desertification** is the process by which fertile land becomes desert, typically as a result of drought, deforestation, or inappropriate agriculture. It is the degradation of land in arid, semi-arid, and dry sub-humid areas.\n\n**Important distinction:** Desertification is NOT the expansion of existing deserts. It is the degradation of previously productive land, which may occur far from any existing desert.\n\n### Where Desertification Occurs\n\n- Arid and semi-arid regions worldwide.\n- The **Sahel** region of Africa (south of the Sahara) is the most well-known example.\n- In South Africa: the Northern Cape, parts of the Eastern Cape (especially the former Ciskei), Limpopo, and North West Province are vulnerable.\n- Globally, approximately one-third of the Earth\'s land surface is at risk of desertification.'),
  t(2, '### Causes of Desertification\n\n**Natural causes:**\n- Prolonged drought reduces vegetation cover.\n- Climate change alters rainfall patterns.\n- Natural soil erosion in arid areas.\n\n**Human causes (the primary drivers):**\n\n| Activity | How It Leads to Desertification |\n|----------|----------------------------------|\n| **Overgrazing** | Livestock strip vegetation faster than it can recover. Exposed soil is eroded by wind and water. |\n| **Over-cultivation** | Planting the same crops repeatedly exhausts soil nutrients. Without fallowing or rotation, soil structure breaks down. |\n| **Deforestation** | Removing trees for fuel or clearing for crops eliminates root systems that hold soil together and reduces moisture recycling. |\n| **Poor irrigation** | Salinisation occurs when irrigated water evaporates, leaving salt deposits that poison the soil. |\n| **Population pressure** | Growing populations increase demand for food, fuel, and grazing land, intensifying all the above pressures. |'),
  q(3, 'Desertification is best defined as:',
    ['The degradation of productive land in dry areas due to human and natural factors', 'The natural expansion of the Sahara Desert', 'The flooding of desert regions', 'The creation of new sand dunes by wind'], 0,
    'Desertification is the degradation of previously productive land in arid and semi-arid areas. It is caused by human activities and climatic factors, not the natural expansion of existing deserts.'),
  t(4, '### Effects of Desertification\n\n**Environmental effects:**\n- Loss of topsoil and soil fertility.\n- Reduced vegetation cover.\n- Loss of biodiversity.\n- Increased dust storms.\n- Reduced water availability (lower infiltration, increased runoff).\n- Siltation of rivers and dams.\n\n**Social effects:**\n- Food insecurity and malnutrition.\n- Loss of livelihoods (farming and herding become impossible).\n- Forced migration and environmental refugees.\n- Conflict over remaining productive land and water.\n- Increased poverty.\n\n**Economic effects:**\n- Reduced agricultural output.\n- Loss of grazing land and livestock.\n- Increased costs for food imports.\n- Reduced national income in countries dependent on agriculture.'),
  fb(5, 'Desertification is the degradation of land in ___, semi-arid, and dry sub-humid areas. The ___ region of Africa south of the Sahara is the most well-known affected area.',
    ['arid', 'Sahel'],
    'Desertification occurs in arid, semi-arid, and dry sub-humid zones. The Sahel, stretching across Africa south of the Sahara, is a global hotspot for desertification.'),
  t(6, '### Management Strategies for Desertification\n\n**Agricultural strategies:**\n- **Crop rotation** and intercropping to maintain soil fertility.\n- **Contour ploughing** to reduce water runoff and soil erosion.\n- **Mulching** to retain soil moisture.\n- **Drought-resistant crop varieties** suited to local conditions.\n- **Controlled grazing** -- rotating livestock between paddocks.\n\n**Restoration strategies:**\n- **Reforestation and afforestation** -- planting trees to stabilise soil and restore moisture cycling.\n- **The Great Green Wall** -- Africa\'s initiative to plant a band of trees across the Sahel from Senegal to Djibouti.\n- **Terracing** on slopes to reduce erosion.\n- **Stone lines (bunds)** -- rows of stones placed along contours to slow water runoff and trap sediment.\n\n**Policy strategies:**\n- Land-use planning and zoning.\n- Education and awareness campaigns.\n- Supporting alternative livelihoods (ecotourism, craft industries).\n- International cooperation (UN Convention to Combat Desertification).'),
  q(7, 'What is the purpose of the Great Green Wall initiative in Africa?',
    ['To plant a band of trees across the Sahel to combat desertification', 'To build a wall to stop the Sahara from expanding', 'To create a new irrigation canal across Africa', 'To relocate communities away from desert areas'], 0,
    'The Great Green Wall is a pan-African initiative to plant trees in a band across the Sahel from Senegal to Djibouti, aiming to restore degraded land, improve livelihoods, and combat desertification.'),
  t(8, '### GIS Application in Drought and Desertification\n\nGeographic Information Systems (GIS) play a critical role in monitoring and managing drought and desertification:\n\n**Monitoring:**\n- Satellite imagery to track vegetation health (NDVI -- Normalised Difference Vegetation Index).\n- Mapping rainfall patterns and anomalies.\n- Monitoring dam levels and soil moisture.\n- Tracking land-use changes over time.\n\n**Analysis:**\n- Overlaying population density maps with drought-risk maps to identify vulnerable communities.\n- Modelling desertification spread under different climate scenarios.\n- Identifying optimal locations for water harvesting or reforestation projects.\n\n**Management:**\n- Creating early warning systems for drought.\n- Mapping degraded land for rehabilitation priorities.\n- Monitoring the effectiveness of restoration projects (e.g., tree planting, soil conservation).\n- Supporting decision-making for disaster response and resource allocation.'),
  fb(9, 'GIS uses the ___ (Normalised Difference Vegetation Index) from satellite imagery to monitor vegetation health and track desertification. GIS can also overlay ___ density maps with drought-risk maps.',
    ['NDVI', 'population'],
    'NDVI measures vegetation health using satellite data. GIS overlays multiple data layers (population, rainfall, soil type, etc.) to identify areas most at risk.'),
];

// =============================================================================
// CHAPTER 5: Geomorphology -- Horizontally Layered Rocks (Term 2)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Horizontally Layered Rocks\n\n### What Are Horizontally Layered Rocks?\n\nHorizontally layered rocks are **sedimentary rocks** that were deposited in flat, parallel layers (strata) and have not been significantly tilted or folded by tectonic forces.\n\n**Common rock types:**\n- **Sandstone** -- formed from cemented sand grains. Relatively resistant to erosion.\n- **Shale** -- formed from fine clay and silt particles. Soft and easily eroded.\n- **Mudstone** -- similar to shale but without the layered splitting.\n\nIn South Africa, the **Karoo Supergroup** is the most important example of horizontally layered sedimentary rocks. These rocks underlie much of the interior plateau.\n\n### Differential Erosion\n\nBecause different rock types have different resistance to weathering and erosion, horizontally layered sequences erode unevenly:\n- **Resistant layers** (e.g., sandstone, dolerite) form cap rocks and protective ledges.\n- **Weak layers** (e.g., shale) erode faster, undercutting the resistant layers above.\n\nThis differential erosion creates the characteristic flat-topped landforms of the Karoo.'),
  q(2, 'Why do horizontally layered rocks create flat-topped landforms?',
    ['Resistant cap rocks protect softer underlying layers from erosion, preserving the flat surface', 'The rocks were originally shaped by glaciers into flat surfaces', 'Wind erosion always creates flat surfaces', 'The layers were deposited on flat ocean floors and remain unchanged'], 0,
    'A resistant cap rock (like sandstone or dolerite) protects the softer layers beneath. Erosion attacks the sides but the top remains flat, creating table-like landforms.',
    ['Think about what happens when a hard layer sits on top of a soft layer -- which erodes first?']),
  t(3, '### Hilly Landscapes from Horizontally Layered Rocks\n\n**Sequence of landform development:**\n\nAs erosion progresses over millions of years, horizontally layered landscapes evolve through a series of stages:\n\n1. **Mesa (table mountain)** -- A large, flat-topped, steep-sided hill with a resistant cap rock. The flat top preserves the original land surface.\n2. **Butte** -- A smaller version of a mesa. Continued erosion reduces the flat-topped area, leaving a narrow, steep-sided remnant.\n3. **Pinnacle/kopje** -- Further erosion reduces the butte to a small, isolated hill. The cap rock may still be visible.\n4. **Plain** -- Eventually, the resistant cap rock is completely removed and the underlying soft rocks erode to a flat plain.\n\n**South African examples:**\n- The **flat-topped hills of the Karoo** (e.g., Valley of Desolation near Graaff-Reinet).\n- **Table Mountain, Cape Town** -- although more complex, it demonstrates the concept of a resistant cap rock (Table Mountain Sandstone).'),
  fb(4, 'A large flat-topped hill with steep sides and a resistant cap rock is called a ___. As erosion continues, it shrinks into a smaller ___, then a pinnacle.',
    ['mesa', 'butte'],
    'The erosion sequence is: mesa (large flat top) to butte (smaller flat top) to pinnacle/kopje (narrow remnant) to plain (cap rock removed entirely).'),
  t(5, '## Basaltic Plateaux\n\nIn parts of South Africa, horizontally layered sedimentary rocks are capped by **dolerite sills** or basalt lava flows. Dolerite is an intrusive igneous rock that is very resistant to erosion.\n\n### How Dolerite Caps Protect the Landscape\n\n- Dolerite sills (horizontal sheets of igneous rock) intruded into the Karoo sedimentary sequence during the Jurassic Period.\n- The dolerite is much harder than the surrounding shale and sandstone.\n- Where dolerite caps the landscape, it protects the underlying sedimentary rocks from erosion.\n- This creates extensive, flat-topped **basaltic plateaux**.\n\n**South African examples:**\n- The **Highveld** plateau is partly capped by dolerite sills.\n- The **Lesotho Highlands** are capped by thick basalt lavas.\n- Many Karoo kopjes have dolerite cap rocks.\n\n### Contact Metamorphism\n\nWhen hot dolerite intruded into the sedimentary rocks, it baked the surrounding rock by **contact metamorphism**:\n- Shale was metamorphosed into **hornfels** (a harder rock).\n- This hardened zone around the intrusion provides additional protection against erosion.'),
  q(6, 'What is the role of a dolerite sill in forming a basaltic plateau?',
    ['It acts as a resistant cap rock, protecting softer sedimentary layers below from erosion', 'It pushes the landscape upward through volcanic eruption', 'It fills river valleys, creating flat surfaces', 'It dissolves the overlying rocks through chemical reactions'], 0,
    'Dolerite sills are extremely resistant to erosion. When they cap horizontally layered sedimentary rocks, they protect the softer layers below, preserving the flat-topped plateau surface.'),
  t(7, '## Scarp Retreat and Back Wasting\n\n### The Escarpment\n\nSouth Africa\'s Great Escarpment is one of the best examples of scarp retreat in the world. It separates the interior plateau from the coastal lowlands.\n\n### How Scarp Retreat Works\n\n1. The escarpment face has a resistant cap rock on top (e.g., sandstone, dolerite) and softer rock below (e.g., shale).\n2. Weathering and erosion attack the exposed soft rock at the base of the scarp.\n3. The soft rock is undercut, removing support from the cap rock.\n4. The overhanging cap rock collapses due to gravity.\n5. The scarp face retreats (moves inland) while remaining steep.\n6. A gently sloping pediment develops at the base as debris accumulates.\n\nThis process is called **back wasting** -- the slope maintains its steep angle while retreating horizontally.'),
  t(8, '### Back Wasting vs Down Wasting\n\n| Process | Description | Result |\n|---------|-------------|--------|\n| **Back wasting** | Slope retreats horizontally while maintaining its steep angle. | Escarpment moves inland; flat pediment extends at base. |\n| **Down wasting** | Slope is lowered vertically; angle decreases over time. | Landscape is gradually flattened. |\n\n**South African Great Escarpment:**\n- The Drakensberg escarpment retreats through back wasting.\n- Resistant basalt cap rock protects the plateau edge.\n- Softer underlying sandstone and shale are eroded at the base.\n- The escarpment has retreated approximately 150 km inland from the coast over millions of years.\n\n**Evidence of retreat:**\n- Isolated outliers (remnant hills) in the coastal lowlands show where the escarpment once stood.\n- The gently sloping coastal plain east of the Drakensberg is the pediment formed by scarp retreat.\n- River gorges cut through the escarpment (e.g., Oribi Gorge in KZN).'),
  q(9, 'What is the key difference between back wasting and down wasting?',
    ['Back wasting maintains a steep slope angle while retreating horizontally; down wasting reduces the slope angle vertically', 'Back wasting occurs only in deserts; down wasting occurs only in forests', 'Back wasting is caused by wind; down wasting is caused by water', 'They are the same process described by different scientists'], 0,
    'Back wasting preserves the steep scarp face as it retreats inland (parallel retreat). Down wasting reduces the slope angle over time as the landscape is worn down vertically. The Great Escarpment demonstrates back wasting.'),
  fb(10, 'The process where an escarpment maintains its steep angle while retreating inland is called ___. The gentle slope that develops at the base of the escarpment is called a ___.',
    ['back wasting', 'pediment'],
    'Back wasting produces parallel retreat of the scarp face. The pediment is the gently sloping surface of accumulated debris and eroded bedrock at the base of the retreating escarpment.'),
];

// =============================================================================
// CHAPTER 6: Geomorphology -- Inclined/Tilted Rocks (Term 2)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Inclined and Tilted Rock Strata\n\n### How Rocks Become Tilted\n\nOriginally horizontal sedimentary layers can be tilted by:\n- **Tectonic forces** -- compression, tension, or faulting that tilts blocks of rock.\n- **Folding** -- compressive forces crumple rock layers into folds.\n- **Faulting** -- blocks of rock are displaced along a fault line.\n- **Igneous intrusions** -- magma pushing up can tilt overlying layers.\n\nWhen tilted layers are exposed at the surface and subjected to differential erosion, distinctive asymmetric landforms develop.\n\n### Key Concepts\n\n- **Dip** -- the angle and direction at which the rock layers slope.\n- **Strike** -- the direction of the line formed where the tilted layer meets a horizontal plane (always perpendicular to the dip).\n- **Scarp slope** -- the steep slope of a ridge, formed where resistant rock is exposed on the side opposite to the dip.\n- **Dip slope** -- the gentle slope that follows the angle of the tilted rock layer.\n- **Differential erosion** -- softer rock layers erode faster than harder layers, creating the asymmetric ridge shape.'),
  q(2, 'What is the relationship between the dip slope and the angle of the tilted rock layers?',
    ['The dip slope follows the same angle as the tilted rock layer', 'The dip slope is always steeper than the rock layer', 'The dip slope is always horizontal', 'The dip slope is perpendicular to the rock layer'], 0,
    'The dip slope is a gentle slope that conforms to the angle of the tilted resistant rock layer. It slopes in the same direction as the rock dip.'),
  t(3, '## Cuesta\n\nA **cuesta** is an asymmetric ridge formed from gently tilted rock layers (dip angle typically less than 25-30 degrees).\n\n### Characteristics of a Cuesta\n\n| Feature | Description |\n|---------|------------|\n| **Scarp slope** | Steep cliff-like slope on the side opposite the dip. Formed by erosion cutting across the resistant layer. |\n| **Dip slope** | Gentle slope following the angle of the tilted layer. Covered by a thin layer of soil and vegetation. |\n| **Cap rock** | The resistant rock layer (e.g., sandstone, quartzite) that forms the ridge crest. |\n| **Vale** | A lowland area eroded into the softer rock on the scarp-slope side. |\n\n### Formation Process\n\n1. Tilted layers of alternating hard and soft rock are exposed by erosion.\n2. The soft rock erodes faster, creating a valley.\n3. The resistant rock stands up as a ridge.\n4. The scarp slope is steep because it cuts across the rock layers.\n5. The dip slope is gentle because it follows the tilted resistant layer.\n\n**South African example:** The Magaliesberg near Pretoria is a classic cuesta formed by resistant quartzite tilted at a gentle angle.'),
  fb(4, 'A cuesta has a steep ___ slope and a gentle ___ slope. The Magaliesberg near Pretoria is a South African example of a cuesta.',
    ['scarp', 'dip'],
    'A cuesta is asymmetric: the scarp slope (steep) cuts across the resistant layer, while the dip slope (gentle) follows the tilted layer surface.'),
  t(5, '## Homoclinal Ridge\n\nA **homoclinal ridge** forms from rock layers tilted at a moderate angle (approximately 25-60 degrees). It is similar to a cuesta but with a steeper dip.\n\n### Characteristics\n\n- The scarp slope is still steeper than the dip slope, but the asymmetry is less pronounced than a cuesta.\n- The dip slope is steeper than in a cuesta (because the rock layers are tilted more steeply).\n- Both slopes are relatively distinct.\n- The ridge is narrower than a cuesta because the steeper dip means the resistant layer descends below the surface more quickly.\n\n### Comparison\n\n| Feature | Cuesta | Homoclinal Ridge |\n|---------|--------|------------------|\n| Dip angle | Less than 25-30 degrees | 25-60 degrees |\n| Asymmetry | Very pronounced | Moderate |\n| Width | Broader | Narrower |\n| Dip slope | Very gentle | Moderate |'),
  t(6, '## Hogsback\n\nA **hogsback** (or hogback) forms from steeply tilted rock layers (dip angle greater than 60 degrees, approaching vertical).\n\n### Characteristics\n\n- The scarp slope and dip slope are approximately **equal** in steepness.\n- The ridge is narrow and symmetric (or nearly so).\n- Resembles the arched back of a pig (hence the name).\n- The resistant layer is nearly vertical, so both sides are steep.\n\n**South African example:** The town of Hogsback in the Eastern Cape is named after the hogback ridges in the Amatola Mountains, formed by near-vertical quartzite layers.\n\n### Summary of Tilted Rock Landforms\n\n| Landform | Dip Angle | Shape |\n|----------|-----------|-------|\n| **Cuesta** | Less than 25-30 degrees | Strongly asymmetric (gentle dip, steep scarp) |\n| **Homoclinal ridge** | 25-60 degrees | Moderately asymmetric |\n| **Hogsback** | Greater than 60 degrees | Nearly symmetric, narrow, sharp ridge |'),
  q(7, 'A ridge where the scarp slope and dip slope are approximately equal in steepness is called a:',
    ['Hogsback', 'Cuesta', 'Mesa', 'Butte'], 0,
    'A hogsback forms from near-vertical rock layers (dip greater than 60 degrees), so both slopes are similarly steep, creating a narrow, symmetric ridge.',
    ['Think about what happens as the dip angle increases toward 90 degrees -- do the two slopes become more or less similar?']),
  fb(8, 'As the dip angle of rock layers increases, the landform changes from a ___ (gentle dip) to a homoclinal ridge to a ___ (near-vertical dip).',
    ['cuesta', 'hogsback'],
    'The progression from cuesta to homoclinal ridge to hogsback reflects increasing dip angle: less than 30 degrees, 25-60 degrees, and greater than 60 degrees respectively.'),
  t(9, '## Cuesta Basin\n\nA **cuesta basin** (or scarpland basin) forms when a series of tilted rock layers of varying resistance are eroded, creating multiple concentric cuesta ridges around a central basin.\n\n### Formation\n\n1. A dome or basin structure exposes multiple layers of alternating hard and soft rock.\n2. Differential erosion removes the soft layers more quickly.\n3. The resistant layers remain as concentric cuesta ridges.\n4. Valleys (vales) form in the softer rock between the ridges.\n\n### Characteristics\n\n- Multiple parallel or concentric cuesta ridges.\n- Valleys (vales) between the ridges in the eroded soft rock.\n- An inner lowland where the soft rock at the centre has been removed.\n- The pattern resembles a series of nested, asymmetric ridges.\n\n**Significance:** Cuesta basins provide varied landscapes with ridges suitable for settlement (higher, drier) and vales suitable for agriculture (deeper soils, moisture).'),
  q(10, 'What is the difference between a vale and a cuesta in a scarpland landscape?',
    ['A vale is the lowland valley eroded in soft rock; a cuesta is the ridge formed by resistant rock', 'A vale is the ridge; a cuesta is the valley', 'They are the same feature viewed from different angles', 'A vale forms by deposition; a cuesta forms by faulting'], 0,
    'In a scarpland, resistant rock layers stand as cuesta ridges while softer rock between them is eroded into low-lying vales (valleys). The alternation of resistant and weak layers creates the ridge-and-vale pattern.'),
];

// =============================================================================
// CHAPTER 7: Geomorphology -- Massive Igneous Rocks (Term 2)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Intrusive Igneous Landforms\n\n### Igneous Rocks: A Recap\n\n**Igneous rocks** form when molten magma cools and solidifies. They are classified based on where they cool:\n\n| Type | Where It Cools | Crystal Size | Examples |\n|------|---------------|-------------|----------|\n| **Intrusive (plutonic)** | Below the surface (slowly) | Large crystals (coarse-grained) | Granite, gabbro, diorite |\n| **Extrusive (volcanic)** | On the surface (quickly) | Small crystals (fine-grained) | Basalt, rhyolite, andesite |\n\nIntrusive igneous bodies are exposed at the surface only after millions of years of erosion have removed the overlying rock. The shapes of these bodies and their resistance to erosion create distinctive landforms.'),
  t(2, '## Batholiths\n\nA **batholith** is a massive intrusive igneous body, typically made of **granite**, that formed deep underground and has been exposed by prolonged erosion.\n\n### Characteristics\n\n- Extremely large: covering areas of **100 km squared or more**.\n- Irregular shape with no definite floor (extends deep into the crust).\n- Composed mainly of granite (coarse-grained, slow cooling).\n- Exposed at the surface after the overlying rock is eroded away.\n- Often forms the core of mountain ranges.\n\n**How a batholith is exposed:**\n1. A large magma chamber cools slowly deep underground, forming granite.\n2. Over millions of years, overlying rock is eroded away.\n3. The granite is exposed at the surface.\n4. The granite weathers to form distinctive landforms (domes, tors, castle kopjes).\n\n**South African examples:**\n- The **Cape Granite Suite** around Cape Town (e.g., visible at Paarl Rock, boulders at Boulders Beach).\n- Parts of the **Limpopo and Mpumalanga** Lowveld are underlain by ancient granite batholiths.'),
  q(3, 'What type of igneous rock typically makes up a batholith?',
    ['Granite', 'Basalt', 'Dolerite', 'Obsidian'], 0,
    'Batholiths are typically composed of granite, a coarse-grained intrusive igneous rock that formed from slowly cooling magma deep below the surface.'),
  fb(4, 'A batholith is a massive body of ___ that formed deep underground and was exposed by ___.',
    ['granite', 'erosion'],
    'Batholiths are enormous granite intrusions. They become surface features only after millions of years of erosion remove all the overlying rock.'),
  t(5, '## Laccoliths\n\nA **laccolith** is a dome-shaped intrusive igneous body formed when magma is injected between sedimentary layers, pushing the overlying layers upward into a dome.\n\n### Characteristics\n\n- Dome-shaped with a flat floor and arched roof.\n- Smaller than a batholith (typically a few km across).\n- The overlying sedimentary layers are bowed upward over the intrusion.\n- When exposed by erosion, the hard igneous rock forms a dome-shaped hill.\n\n### Formation\n\n1. Magma intrudes along a bedding plane between sedimentary layers.\n2. The pressure of the magma pushes the overlying layers upward, creating a dome.\n3. The magma cools and solidifies.\n4. Over time, erosion removes the overlying sedimentary rock, exposing the laccolith.\n\n**Appearance at the surface:**\n- A rounded, dome-shaped hill.\n- Surrounding area may show tilted sedimentary layers that were pushed up by the intrusion.'),
  t(6, '## Dykes and Sills\n\n### Dykes\n\nA **dyke** is a sheet-like intrusion that cuts **across** (discordant) the existing rock layers.\n\n**Characteristics:**\n- Vertical or near-vertical.\n- Cuts across horizontal or tilted sedimentary layers.\n- Can vary in width from a few centimetres to tens of metres.\n- Often composed of dolerite in SA.\n\n**Surface expression:**\n- If the dyke rock is **more resistant** than surrounding rock: it stands up as a **wall-like ridge**.\n- If the dyke rock is **less resistant** (or weathered): it erodes to form a **trench or gully**.\n\n### Sills\n\nA **sill** is a sheet-like intrusion that lies **parallel** (concordant) to the existing rock layers.\n\n**Characteristics:**\n- Horizontal or gently inclined.\n- Follows the bedding planes of sedimentary rock.\n- Often composed of dolerite.\n- Can act as a resistant cap rock, protecting underlying softer layers.\n\n**South African examples:**\n- Dolerite sills are extremely common in the **Karoo**.\n- They cap many flat-topped hills (kopjes) and protect the underlying shale.'),
  q(7, 'What is the key structural difference between a dyke and a sill?',
    ['A dyke cuts across rock layers (discordant); a sill lies parallel to rock layers (concordant)', 'A dyke is horizontal; a sill is vertical', 'A dyke is made of granite; a sill is made of basalt', 'They have the same orientation but different compositions'], 0,
    'A dyke is discordant -- it cuts across existing rock layers at an angle (usually near-vertical). A sill is concordant -- it intrudes parallel to the bedding planes of the surrounding rock.'),
  fb(8, 'A dyke is ___ (cuts across layers) while a sill is ___ (lies parallel to layers). In the Karoo, dolerite sills act as resistant ___ rocks.',
    ['discordant', 'concordant', 'cap'],
    'Dykes cut across bedding planes (discordant). Sills intrude along bedding planes (concordant). Karoo dolerite sills are classic cap rocks protecting underlying sedimentary layers.'),
  t(9, '## Granite Domes and Tors\n\n### Granite Domes\n\nWhen a granite batholith is exposed, the removal of overlying weight causes the granite to expand. This expansion creates curved fractures parallel to the surface called **exfoliation joints** (or sheet joints).\n\n**Exfoliation (onion-skin weathering):**\n- Curved sheets of rock peel off the surface, one layer at a time.\n- This creates smooth, rounded dome shapes.\n- The process is driven by **pressure release** (unloading) and temperature changes.\n\n**South African example:** **Paarl Rock** in the Western Cape is a classic granite dome formed by exfoliation.\n\n### Tors\n\nA **tor** is a pile of rounded granite boulders perched on a hill, resembling a stack of blocks.\n\n**Formation:**\n1. Rectangular joint blocks are created by intersecting horizontal and vertical joints in granite.\n2. **Chemical weathering** (especially along joints) rounds the corners and edges of blocks underground (subsurface weathering or **etching**).\n3. Overlying weathered material is removed by erosion, exposing the rounded core stones.\n4. The exposed rounded boulders form the tor.\n\n**South African example:** The granite tors of the **Matopos Hills** (near the SA/Zimbabwe border region) and tors in the Limpopo bushveld.'),
  q(10, 'Which weathering process is primarily responsible for the smooth, dome shape of granite inselbergs?',
    ['Exfoliation (pressure release causing curved sheets to peel off)', 'Chemical weathering by acid rain', 'Frost shattering along vertical joints', 'Wind abrasion on exposed surfaces'], 0,
    'Exfoliation occurs when overlying rock is eroded, releasing pressure on the granite. The granite expands and cracks in curved sheets parallel to the surface. These sheets peel off, creating the smooth dome shape.',
    ['Consider what happens to deeply buried rock when the weight above it is removed.']),
];

// =============================================================================
// CHAPTER 8: Slopes and Mass Movement (Term 2)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Slope Elements\n\nA slope is an inclined surface connecting higher and lower ground. Slopes are shaped by the interaction of weathering, erosion, and mass movement.\n\n### The Four Elements of a Slope\n\n| Element | Position | Gradient | Characteristics |\n|---------|----------|----------|-----------------|\n| **Waxing slope (convex crest)** | Top of the slope | Gentle, convex | Weathering dominant. Rounded summit. Soil creep common. |\n| **Free face (cliff)** | Upper slope | Vertical or near-vertical | Bare rock exposed. Rock falls occur. Steepest part. |\n| **Debris slope (talus slope)** | Below the free face | Straight, steep (30-40 degrees) | Covered by angular rock fragments fallen from the free face. |\n| **Pediment (foot slope)** | Base of slope | Gentle, concave | Transported material accumulates. Smooth, gently sloping. |\n\nNot all slopes have all four elements. In many landscapes, one or more elements may be absent or poorly developed.'),
  t(2, '### Factors Affecting Slope Form\n\nThe shape and steepness of a slope depend on several factors:\n\n1. **Rock type and structure** -- Resistant rocks maintain steep slopes; weak rocks produce gentle slopes.\n2. **Climate** -- In arid areas, slopes tend to be steep (mechanical weathering, little vegetation). In humid areas, slopes tend to be gentler (chemical weathering, soil cover).\n3. **Vegetation cover** -- Plant roots bind soil, reducing erosion and maintaining slope stability.\n4. **Human activity** -- Construction, mining, deforestation, and agriculture can destabilise slopes.\n5. **Tectonic activity** -- Uplift can steepen slopes; earthquakes can trigger mass movement.\n6. **Time** -- Slopes evolve over time through weathering and erosion.\n\n### Slope Processes\n\n- **Weathering** (mechanical and chemical) breaks down rock in place.\n- **Erosion** transports weathered material downslope.\n- **Mass movement** is the downslope movement of rock and soil under the influence of gravity.'),
  q(3, 'Which slope element is characterised by bare, near-vertical rock?',
    ['The free face', 'The waxing slope', 'The debris slope', 'The pediment'], 0,
    'The free face is the steep, bare-rock section of a slope where rock falls occur. It is the steepest element, often vertical or near-vertical.'),
  fb(4, 'The four elements of a slope from top to bottom are: waxing slope, ___, debris slope, and ___.',
    ['free face', 'pediment'],
    'From top to bottom: the convex waxing slope (crest), the vertical free face (cliff), the straight debris slope (talus), and the concave pediment (foot slope).'),
  t(5, '## Types of Mass Movement\n\nMass movement is the downslope movement of earth materials (rock, soil, debris) under the influence of **gravity**. Water often plays a role by adding weight and reducing friction.\n\n### Slow Mass Movement\n\n**1. Soil Creep**\n- Extremely slow (millimetres per year), imperceptible movement of soil downslope.\n- Caused by repeated expansion and contraction (wetting/drying, heating/cooling, freezing/thawing).\n- **Evidence:** tilted fence posts, curved tree trunks, tilted gravestones, walls bulging at the base.\n- Occurs on virtually all slopes, even gentle ones.\n\n**2. Solifluction**\n- Slow flow of waterlogged soil over a frozen or impermeable layer.\n- Common in periglacial (cold) environments where the upper soil thaws but the subsoil remains frozen (permafrost).\n- Produces lobed or terraced slopes.\n- Not common in SA\'s climate but relevant to global understanding.'),
  t(6, '### Rapid Mass Movement\n\n**3. Landslide**\n- A sudden, rapid movement of a mass of rock and/or soil down a slope along a distinct **slip plane** (surface of failure).\n- Types:\n  - **Translational slide** -- material slides along a flat slip plane (e.g., along a bedding plane).\n  - **Rotational slide (slump)** -- material slides along a curved slip plane, rotating backward. The upper part drops down while the lower part pushes outward.\n\n**4. Rock Falls**\n- Individual rocks or blocks break away from a cliff face (free face) and fall, bounce, or roll downslope.\n- Caused by frost shattering, root growth, earthquakes, or undercutting.\n- Accumulate at the base as **scree (talus)**.\n\n**5. Mud Flows**\n- Rapid flow of water-saturated fine-grained material (mud and clay).\n- Occur after heavy rainfall on slopes with fine, loose material.\n- Can travel long distances at high speed.\n- Very destructive -- buries roads, buildings, and farmland.\n\n**6. Slumps**\n- Rotational slides along a curved slip plane.\n- The slumped mass tilts backward, creating a scarp at the top.\n- Common on steep river banks, coastal cliffs, and road cuttings.'),
  q(7, 'Which type of mass movement is characterised by extremely slow, imperceptible downslope movement evidenced by tilted fence posts?',
    ['Soil creep', 'Landslide', 'Mud flow', 'Rock fall'], 0,
    'Soil creep is the slowest form of mass movement (mm/year). It is not directly observable but its effects -- tilted posts, curved trees, bulging walls -- reveal the gradual movement.',
    ['The key word is "imperceptible" -- which process is too slow to observe directly?']),
  fb(8, 'A rotational slide along a curved slip plane where the material tilts backward is called a ___. Rock fragments that accumulate at the base of a cliff are called ___ or talus.',
    ['slump', 'scree'],
    'Slumps rotate along a curved slip surface, with the top dropping and the base pushing out. Scree (talus) is the accumulation of fallen rock debris at the base of a free face.'),
  t(9, '### Causes of Mass Movement\n\n| Factor | How It Triggers Mass Movement |\n|--------|-------------------------------|\n| **Heavy rainfall** | Saturates soil, adds weight, reduces friction (pore water pressure). |\n| **Steep slopes** | Gravity\'s downslope component increases with steepness. |\n| **Removal of vegetation** | Roots no longer bind soil; interception of rainfall is lost. |\n| **Undercutting** | Rivers, waves, or construction cut into the base of a slope. |\n| **Earthquakes** | Vibrations destabilise slopes. |\n| **Rock type** | Clay-rich rocks swell when wet, becoming unstable. |\n| **Overloading** | Building on slopes, dumping waste, or adding fill material. |\n| **Weathering** | Weakens rock along joints, bedding planes, and faults. |'),
  t(10, '### South African Case Studies\n\n**1. KwaZulu-Natal landslides (April 2022)**\nExtreme rainfall caused widespread flooding and landslides across KwaZulu-Natal, killing over 400 people. Informal settlements on steep slopes and in river valleys were hardest hit. Mud flows buried homes and destroyed infrastructure.\n\n**Causes:** Record rainfall (over 300 mm in 24 hours), steep terrain, saturated soils, informal housing on unstable slopes, poor drainage.\n\n**2. Lajamanu, Northern Cape -- historical slumping**\nRiver bank slumps along the Orange River demonstrate rotational sliding where weak, clay-rich banks collapse after periods of high water followed by rapid drawdown.\n\n**Management strategies:**\n- **Land-use planning** -- avoid building on steep slopes and in known landslide zones.\n- **Drainage** -- install drains to remove water from slopes and reduce saturation.\n- **Retaining walls** -- support unstable slopes with engineered structures.\n- **Vegetation** -- plant trees and grasses to bind soil with roots.\n- **Monitoring** -- use GPS and inclinometers to detect early slope movement.\n- **Early warning systems** -- issue warnings when rainfall exceeds critical thresholds.'),
  q(11, 'In the April 2022 KwaZulu-Natal disaster, what was the primary trigger for the landslides and mud flows?',
    ['Record rainfall exceeding 300 mm in 24 hours that saturated slopes', 'An earthquake along the Drakensberg fault', 'Volcanic activity beneath the province', 'Severe drought causing soil to crack and collapse'], 0,
    'The 2022 KZN disaster was triggered by extreme rainfall (over 300 mm in 24 hours). The saturated soil on steep slopes became unstable, causing widespread landslides and mud flows.'),
];

// =============================================================================
// CHAPTER 9: Development Geography (Term 3)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## The Concept of Development\n\n### What is Development?\n\n**Development** is the process of improving the quality of human life through economic growth, social progress, and political stability.\n\nDevelopment is **not just about money**. It includes:\n- Access to education, healthcare, clean water, and sanitation.\n- Political freedom and human rights.\n- Equality and social justice.\n- Environmental sustainability.\n\n### Measuring Development\n\nDevelopment is measured using various indicators:\n\n**Economic indicators:**\n- **GDP (Gross Domestic Product)** -- the total value of all goods and services produced within a country in one year.\n- **GNP/GNI (Gross National Product/Income)** -- GDP plus income earned by citizens abroad, minus income earned by foreigners within the country.\n- **GDP per capita** -- GDP divided by population. Gives an average wealth per person.\n\n**Limitation of economic indicators:** They do not show how wealth is distributed. A country with high GDP per capita may still have extreme poverty if wealth is concentrated among a few.'),
  t(2, '### Social and Demographic Indicators\n\n| Indicator | What It Measures | Developed Country | Developing Country |\n|-----------|-----------------|-------------------|--------------------|\n| **Literacy rate** | % of adults who can read and write | High (>95%) | Lower (variable) |\n| **Life expectancy** | Average years a person is expected to live | High (>75 years) | Lower (variable) |\n| **Infant mortality rate** | Deaths of infants per 1 000 live births | Low (<10) | Higher |\n| **Access to clean water** | % of population with safe water | High (>99%) | Lower |\n| **Birth rate** | Births per 1 000 population | Low (<15) | Higher |\n| **Death rate** | Deaths per 1 000 population | Low | Higher |\n| **Doctors per 1 000 people** | Healthcare access | Higher | Lower |'),
  q(3, 'Why is GDP per capita alone an insufficient measure of development?',
    ['It does not show how wealth is distributed within the population', 'It does not include government spending', 'It only measures agricultural output', 'It is always inaccurate for small countries'], 0,
    'GDP per capita is an average that hides inequality. A country may have high GDP per capita, but if most wealth is held by a small elite, the majority may still live in poverty.',
    ['Think about what an "average" conceals when there are extremes.']),
  t(4, '### Composite Indices\n\n**HDI (Human Development Index)**\nDeveloped by the United Nations, the HDI combines three dimensions:\n1. **Health** -- life expectancy at birth.\n2. **Education** -- mean years of schooling and expected years of schooling.\n3. **Standard of living** -- GNI per capita (PPP, purchasing power parity).\n\nHDI ranges from 0 (low development) to 1 (high development).\n\n| Category | HDI Range | Examples |\n|----------|-----------|----------|\n| Very high | 0.800+ | Norway (0.961), Germany, Australia |\n| High | 0.700-0.799 | South Africa (0.713), Brazil, China |\n| Medium | 0.550-0.699 | India, Kenya, Ghana |\n| Low | Below 0.550 | Niger, Chad, South Sudan |\n\n**GINI Coefficient**\nMeasures **income inequality** within a country.\n- 0 = perfect equality (everyone earns the same).\n- 1 = perfect inequality (one person earns everything).\n- South Africa has one of the highest GINI coefficients in the world (~0.63), indicating extreme inequality.'),
  fb(5, 'The HDI combines three dimensions: health, ___, and standard of living. South Africa\'s GINI coefficient of approximately ___ indicates extreme income inequality.',
    ['education', '0.63'],
    'The HDI measures health (life expectancy), education (years of schooling), and standard of living (GNI per capita). SA\'s GINI of approximately 0.63 is among the highest globally.'),
  t(6, '### Developed vs Developing Countries\n\n| Characteristic | Developed Countries | Developing Countries |\n|---------------|--------------------|-----------------------|\n| GDP per capita | High | Low to moderate |\n| Industrialisation | Post-industrial (service economy) | Industrialising or primary sector dominant |\n| Infrastructure | Advanced (roads, internet, healthcare) | Limited or uneven |\n| Education | Universal, high literacy | Variable, gender gaps may exist |\n| Healthcare | Advanced, accessible | Limited access, high disease burden |\n| Population growth | Low or stable | Higher |\n| Urbanisation | High (>75%) | Rapid, often unplanned |\n\n**Important:** The developed/developing binary is an oversimplification. Many countries (including SA) have characteristics of both. Terms like "Global North" and "Global South" or "high/middle/low income" are now preferred.'),
  q(7, 'Which composite index is specifically designed to measure income inequality within a country?',
    ['GINI coefficient', 'Human Development Index (HDI)', 'GDP per capita', 'Literacy rate'], 0,
    'The GINI coefficient specifically measures income distribution. A higher value indicates greater inequality. The HDI measures overall human development but does not directly capture inequality.'),
  fb(8, 'Developed countries typically have ___ population growth and ___ levels of urbanisation.',
    ['low', 'high'],
    'Developed countries generally have low population growth rates (low birth rates) and high urbanisation (over 75% living in urban areas).'),
];

blockNum = 0;
const ch9_lesson2 = [
  t(1, '## Factors Affecting Development\n\n### Physical Factors\n\n1. **Climate** -- Extreme climates (very hot, cold, or dry) limit agriculture and economic activity. Tropical climates may increase disease burden (malaria, tropical diseases).\n2. **Natural resources** -- Countries rich in resources (oil, minerals, fertile soil) have development potential, but resource dependence can also be a curse (corruption, conflict, environmental damage).\n3. **Landlocked location** -- Countries without coastlines face higher transport costs for trade.\n4. **Natural disasters** -- Earthquakes, floods, droughts, and cyclones divert resources from development to disaster recovery.\n\n### Historical Factors\n\n1. **Colonialism** -- Many developing countries were exploited by colonial powers. Resources were extracted, borders drawn arbitrarily, and local industries suppressed. The effects persist through unequal trade relationships, debt, and political instability.\n2. **Slavery and labour exploitation** -- Stripped regions of their productive population and disrupted social structures.\n3. **Post-independence conflict** -- Many newly independent nations faced civil wars, ethnic conflict, and political instability.'),
  t(2, '### Economic Factors\n\n1. **Trade** -- Developing countries often export raw materials (low value) and import manufactured goods (high value), creating an **unfair terms of trade**.\n2. **Debt** -- Many developing countries carry enormous debts from loans taken during the Cold War era. Debt repayments consume resources that could fund health and education.\n3. **Foreign investment** -- Can bring jobs and technology but may also exploit cheap labour and repatriate profits.\n4. **Corruption** -- Diverts public funds away from development projects.\n\n### Social Factors\n\n1. **Education** -- Lack of education limits skills, innovation, and productivity.\n2. **Healthcare** -- Disease (HIV/AIDS, malaria, TB) reduces the working-age population and productivity.\n3. **Gender inequality** -- When women lack access to education and economic opportunities, half the population\'s potential is wasted.\n4. **Population growth** -- Rapid growth strains resources and services.'),
  q(3, 'What is meant by "unfair terms of trade" in the context of development?',
    ['Developing countries export low-value raw materials and import expensive manufactured goods', 'Developing countries refuse to trade with developed countries', 'All countries trade the same products at the same prices', 'Trade tariffs are identical for all nations'], 0,
    'Unfair terms of trade exist when developing countries export cheap raw materials (minerals, crops) but must import expensive manufactured goods. The value gap means they earn less from exports than they spend on imports.'),
  t(4, '## Trade and Globalisation\n\n### International Trade\n\nTrade is the exchange of goods and services between countries. It can drive development by:\n- Creating jobs in export industries.\n- Generating foreign exchange to pay for imports.\n- Transferring technology and skills.\n- Encouraging specialisation and efficiency.\n\n**Barriers to fair trade for developing countries:**\n- **Tariffs and subsidies** in developed countries protect their own industries at the expense of developing-country exporters.\n- **Commodity price fluctuations** make export income unpredictable.\n- **Lack of processing capacity** means raw materials are exported without adding value.\n\n### Fair Trade\n\n**Fair Trade** is a movement that ensures producers in developing countries receive a fair price for their products, along with social premiums for community development.\n\n- Examples: Fair Trade coffee, cocoa, tea, fruit.\n- SA produces Fair Trade wine and rooibos tea.\n- Guarantees minimum prices, safe working conditions, and environmental standards.'),
  fb(5, 'In unfair terms of trade, developing countries tend to export raw ___ and import manufactured ___. Fair Trade aims to ensure producers receive a ___ price.',
    ['materials', 'goods', 'fair'],
    'The trade imbalance means developing countries sell cheap raw materials but buy expensive finished goods. Fair Trade addresses this by guaranteeing minimum prices to producers.'),
  t(6, '### Globalisation\n\n**Globalisation** is the increasing interconnection and interdependence of the world\'s economies, cultures, and populations through trade, technology, migration, and communication.\n\n**Positive effects:**\n- Access to global markets, technology, and information.\n- Foreign direct investment creates jobs.\n- Cultural exchange and understanding.\n- Transfer of skills and knowledge.\n\n**Negative effects:**\n- Multinational corporations may exploit cheap labour.\n- Local industries may be destroyed by cheap imports.\n- Cultural homogenisation -- loss of local traditions.\n- Environmental degradation from increased production and transport.\n- Benefits are unevenly distributed -- may increase inequality between and within countries.\n\n### South Africa and Globalisation\n\n- SA is the most industrialised economy in Africa, integrated into global markets.\n- Member of BRICS (Brazil, Russia, India, China, South Africa).\n- Exports minerals (gold, platinum, chrome), agricultural products, and manufactured goods.\n- Faces challenges: high unemployment, inequality, competition from cheap Asian imports, brain drain of skilled workers.'),
  q(7, 'Which of the following is a negative effect of globalisation for developing countries?',
    ['Local industries may be destroyed by competition from cheap imported goods', 'Access to global markets always improves local economies', 'Technology transfer only benefits developed countries', 'Cultural exchange is always negative'], 0,
    'Globalisation can flood developing-country markets with cheap imports, undercutting local producers who cannot compete. This can destroy local industries and jobs, particularly in manufacturing and agriculture.'),
  fb(8, 'South Africa is a member of ___, which includes Brazil, Russia, India, China, and South Africa. SA\'s GINI coefficient of approximately 0.63 indicates that globalisation\'s benefits are ___ distributed.',
    ['BRICS', 'unevenly'],
    'SA is part of the BRICS grouping of major emerging economies. Despite economic growth, the high GINI coefficient shows that wealth and opportunities remain unevenly distributed.'),
];

// =============================================================================
// CHAPTER 10: Resources and Sustainability (Term 4)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Soil Erosion\n\n### What is Soil Erosion?\n\n**Soil erosion** is the removal of topsoil by water, wind, or human activity at a rate faster than it can be naturally replaced.\n\n**Why topsoil matters:**\n- Topsoil is the fertile upper layer (A-horizon) containing organic matter, nutrients, and micro-organisms.\n- It takes approximately 500-1 000 years to form just 2.5 cm of topsoil.\n- Once lost, it is essentially non-renewable on a human timescale.\n\n### Types of Soil Erosion\n\n| Type | Agent | Description |\n|------|-------|------------|\n| **Sheet erosion** | Water | Thin, uniform layer of topsoil removed over a wide area by surface runoff. Often unnoticed. |\n| **Rill erosion** | Water | Small channels (rills) form as runoff concentrates. Rills can be ploughed out. |\n| **Gully erosion** | Water | Rills deepen into gullies (dongas in SA) too large to plough. Very destructive. |\n| **Wind erosion** | Wind | Loose, dry topsoil is blown away. Common in arid and semi-arid areas. |'),
  t(2, '### Causes of Soil Erosion in South Africa\n\n**Natural causes:**\n- Intense summer thunderstorms with heavy rainfall (high erosivity).\n- Steep slopes, especially near the escarpment.\n- Erodible soils (sandy, low organic matter).\n\n**Human causes:**\n- **Overgrazing** -- livestock remove vegetation cover, compacting soil and reducing infiltration.\n- **Deforestation** -- removing trees exposes soil to rain impact and removes root systems.\n- **Poor farming practices** -- ploughing up and down slopes, monoculture, leaving fields bare.\n- **Overpopulation** -- pressure on land leads to over-cultivation and deforestation.\n- **Construction and mining** -- expose bare soil to erosion agents.\n\n**South African context:**\n- The former homelands (e.g., former Ciskei, Transkei) suffer severe erosion due to historical overcrowding and overgrazing.\n- The Free State and North West provinces experience wind erosion on exposed agricultural land.\n- KwaZulu-Natal is prone to gully erosion (dongas) due to steep terrain and intense rainfall.'),
  q(3, 'Which type of erosion creates deep channels (dongas) too large to be removed by ploughing?',
    ['Gully erosion', 'Sheet erosion', 'Rill erosion', 'Wind erosion'], 0,
    'Gully erosion creates deep, incised channels called dongas in South Africa. They are too large and deep to be filled or ploughed out and represent severe land degradation.'),
  fb(4, 'It takes approximately ___-1 000 years to form 2.5 cm of topsoil. In South Africa, deep erosion channels are called ___.',
    ['500', 'dongas'],
    'Topsoil formation is extremely slow (500-1 000 years for 2.5 cm). South African gullies are locally called dongas, particularly common in KZN and the Eastern Cape.'),
  t(5, '## Energy Resources\n\n### Conventional Energy Sources\n\n| Source | Type | % of SA energy | Advantages | Disadvantages |\n|--------|------|---------------|------------|---------------|\n| **Coal** | Fossil fuel | ~77% of electricity | Abundant in SA, cheap, reliable | CO2 emissions, air pollution, acid mine drainage, finite |\n| **Nuclear** | Nuclear fission | ~5% | Low CO2, reliable baseload | Radioactive waste, high cost, safety concerns |\n| **Oil** | Fossil fuel | Transport fuel | High energy density, versatile | Imported (SA has little oil), CO2 emissions, finite |\n| **Natural gas** | Fossil fuel | Small % | Cleaner than coal, versatile | Imported, finite, methane leaks |\n\n### South Africa and Coal\n\n- SA is the **7th largest coal producer** globally.\n- Most coal is mined in Mpumalanga (Witbank/eMalahleni coalfield).\n- Eskom generates approximately 77% of electricity from coal.\n- Coal burning is the primary source of SA\'s greenhouse gas emissions.\n- Acid mine drainage from abandoned mines pollutes waterways.'),
  t(6, '### Non-conventional (Renewable) Energy Sources\n\n| Source | How It Works | SA Potential | Challenges |\n|--------|-------------|-------------|------------|\n| **Solar** | Photovoltaic panels or concentrated solar power | Excellent -- SA has some of the highest solar irradiance globally, especially in Northern Cape | Intermittent (no sun at night), high initial cost, land use |\n| **Wind** | Turbines convert kinetic energy of wind to electricity | Good -- Eastern Cape and Western Cape coastlines are ideal | Intermittent, visual impact, noise, bird strikes |\n| **Hydroelectric** | Water flow drives turbines | Limited -- SA is water-scarce; some small-hydro potential | Requires reliable water supply, dams impact ecosystems |\n| **Biomass** | Organic matter (wood, crop waste, biogas) burned or converted | Moderate -- sugarcane bagasse used in KZN | Deforestation risk, low efficiency, air pollution |\n| **Geothermal** | Heat from the Earth\'s interior | Very limited in SA | Not viable in most locations in SA |'),
  q(7, 'What percentage of South Africa\'s electricity is generated from coal?',
    ['Approximately 77%', 'Approximately 50%', 'Approximately 30%', 'Approximately 90%'], 0,
    'Coal accounts for approximately 77% of South Africa\'s electricity generation, making the country heavily dependent on fossil fuels and a significant greenhouse gas emitter.'),
  fb(8, 'South Africa\'s primary coal mining region is ___ (province). The Northern Cape has excellent potential for ___ energy due to high solar irradiance.',
    ['Mpumalanga', 'solar'],
    'Mpumalanga hosts the bulk of SA\'s coal mines (eMalahleni/Witbank coalfield). The Northern Cape receives some of the world\'s highest solar irradiance, making it ideal for solar power.'),
];

blockNum = 0;
const ch10_lesson2 = [
  t(1, '## Energy Management and Sustainability\n\n### The Need for Energy Transition\n\nSouth Africa faces a critical energy challenge:\n- Heavy dependence on coal (climate change, air pollution, health impacts).\n- Eskom\'s ageing fleet of coal power stations (frequent breakdowns, load shedding).\n- International pressure to reduce carbon emissions (Paris Agreement commitments).\n- Growing energy demand from population and economic growth.\n\n### Energy Management Strategies\n\n**Supply-side strategies:**\n- **Diversifying the energy mix** -- investing in renewable energy (solar, wind) to reduce coal dependence.\n- **REIPPPP (Renewable Energy Independent Power Producer Procurement Programme)** -- SA\'s programme to procure renewable energy from private producers. Has attracted billions in investment.\n- **Gas as a transition fuel** -- natural gas produces less CO2 than coal; LNG imports being explored.\n- **Maintaining nuclear capacity** -- Koeberg power station near Cape Town provides baseload power.'),
  t(2, '### Demand-side Strategies\n\n- **Energy efficiency** -- using less energy to achieve the same output. LED lighting, efficient appliances, insulation.\n- **Smart grids** -- technology to manage electricity distribution efficiently.\n- **Time-of-use tariffs** -- charging more for electricity during peak demand to encourage shifting usage to off-peak.\n- **Education and awareness** -- encouraging behaviour change (switch off lights, use solar geysers).\n\n### Just Energy Transition\n\nTransitioning away from coal has social implications:\n- Coal mining employs approximately 90 000 workers in SA, mostly in Mpumalanga.\n- Coal-dependent communities face job losses and economic decline.\n- A **Just Energy Transition** ensures that workers and communities are supported through retraining, new economic opportunities, and social safety nets.\n- The Presidential Climate Commission guides SA\'s transition plan.\n- International financing (e.g., Just Energy Transition Partnership -- JETP) provides funds to support the shift.'),
  q(3, 'What does the Just Energy Transition aim to achieve?',
    ['Ensure that coal workers and communities are supported with retraining and new opportunities during the shift to clean energy', 'Close all coal mines immediately regardless of social impact', 'Replace all coal with nuclear energy only', 'Increase coal production to fund renewable projects'], 0,
    'The Just Energy Transition recognises that moving away from coal affects workers and communities. It ensures the transition is fair, with support for retraining, alternative livelihoods, and community investment.'),
  t(4, '## Nuclear Energy Case Study: Koeberg Power Station\n\n### Background\n\n- **Location:** Melkbosstrand, near Cape Town, Western Cape.\n- **Type:** Pressurised Water Reactor (PWR), 2 units.\n- **Capacity:** 1 860 MW (about 5% of SA\'s total electricity).\n- **Operational since:** 1984.\n- **Operator:** Eskom.\n- **Africa\'s only nuclear power station.**\n\n### How It Works\n\n1. Nuclear **fission** -- uranium-235 atoms are split by neutrons in the reactor core.\n2. This releases enormous heat energy.\n3. The heat converts water to steam.\n4. The steam drives turbines connected to generators, producing electricity.\n5. The steam is cooled (condensed) using seawater and recycled.'),
  fb(5, 'Koeberg power station is located near ___ and is Africa\'s ___ nuclear power station.',
    ['Cape Town', 'only'],
    'Koeberg, situated at Melkbosstrand near Cape Town, is the only nuclear power station on the African continent, providing approximately 5% of SA\'s electricity.'),
  t(6, '### Advantages of Nuclear Energy\n\n- **Low carbon emissions** during operation (no CO2 from the fission process).\n- **Reliable baseload power** -- runs continuously, unaffected by weather.\n- **High energy density** -- a small amount of uranium produces a large amount of energy.\n- **Long operational life** -- Koeberg has been running for over 40 years.\n- **Energy security** -- reduces dependence on imported fossil fuels.\n\n### Disadvantages and Concerns\n\n- **Radioactive waste** -- spent fuel remains dangerous for thousands of years. Storage is a major challenge.\n- **Safety risks** -- accidents (Chernobyl 1986, Fukushima 2011) demonstrate catastrophic potential. Koeberg is near a major city.\n- **High construction costs** -- new nuclear plants are extremely expensive and often delayed.\n- **Water usage** -- requires large volumes of cooling water.\n- **Decommissioning** -- dismantling old reactors is complex and costly.\n- **Seismic risk** -- Koeberg is near the Milnerton Fault; seismic studies are ongoing.\n- **Public opposition** -- communities near nuclear facilities often oppose expansion.'),
  q(7, 'What is the main environmental advantage of nuclear power compared to coal?',
    ['Very low carbon dioxide emissions during electricity generation', 'Nuclear power uses no water', 'Nuclear waste is completely harmless', 'Nuclear power stations are cheaper to build'], 0,
    'Nuclear fission does not produce CO2 during electricity generation. This makes nuclear power a low-carbon energy source compared to coal, which emits large quantities of greenhouse gases.'),
  t(8, '### The Debate: Should SA Expand Nuclear?\n\n**Arguments for expansion:**\n- SA needs reliable baseload power to complement intermittent renewables.\n- Nuclear produces minimal CO2, helping meet climate commitments.\n- Existing expertise from Koeberg can be leveraged.\n\n**Arguments against expansion:**\n- Cost: new nuclear plants are extremely expensive (hundreds of billions of rand).\n- Renewables (solar, wind) with battery storage are becoming cheaper.\n- Waste storage remains unsolved.\n- SA\'s water scarcity limits cooling options for inland sites.\n- Public distrust and governance concerns.\n\n**Current status:** SA is investing primarily in renewable energy through the REIPPPP while maintaining Koeberg. The Koeberg life extension programme aims to keep the station running until the 2040s.'),
  fb(9, 'Koeberg uses ___ water reactors and has been operational since ___. SA\'s REIPPPP programme focuses on procuring ___ energy from private producers.',
    ['pressurised', '1984', 'renewable'],
    'Koeberg operates two Pressurised Water Reactors, running since 1984. The REIPPPP (Renewable Energy Independent Power Producer Procurement Programme) is SA\'s primary vehicle for adding renewable capacity.'),
];

// =============================================================================
// CHAPTER 11: GIS and Map Skills (integrated)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Cross-sections\n\nA **cross-section** (or profile) is a side view of the landscape along a straight line between two points. It shows the shape of the terrain (hills, valleys, plateaux) as if you cut through the Earth along that line.\n\n### How to Draw a Cross-section\n\n1. Place the straight edge of a piece of paper along the line of the cross-section on the topographic map.\n2. Mark every point where a contour line crosses the edge of the paper. Write the contour value at each mark.\n3. Also mark rivers, roads, peaks, and other features along the line.\n4. Transfer the marks to graph paper, using the vertical axis for altitude and the horizontal axis for distance.\n5. Plot each point at the correct altitude and join them with a smooth curve.\n6. Label features (peaks, rivers, slopes, flat areas).\n\n### Interpreting a Cross-section\n\n- **Steep slopes** appear as closely spaced contour crossings (and steep sections on the profile).\n- **Gentle slopes** have widely spaced contour crossings.\n- **Flat areas** (plateaux, valley floors) have no contour crossings.\n- **Concave slopes** curve inward (steeper at top, gentler at base).\n- **Convex slopes** curve outward (gentler at top, steeper at base).'),
  q(2, 'On a cross-section, how would a steep slope appear?',
    ['As a steeply rising line with closely spaced contour marks', 'As a flat horizontal line', 'As a widely spaced series of gentle steps', 'As a depression below the baseline'], 0,
    'A steep slope has many contour lines in a short horizontal distance. On a cross-section, this translates to a steeply rising or falling line.'),
  t(3, '## Gradient\n\n**Gradient** is a measure of the steepness of a slope.\n\n### Calculating Gradient\n\n**Formula:** Gradient = Rise / Run\n\nOr, expressed as a ratio:\n\nGradient = Vertical distance (height difference) / Horizontal distance (map distance converted to actual distance)\n\n**Steps:**\n1. Find the height difference between the two points (subtract the lower altitude from the higher).\n2. Measure the horizontal distance between the two points on the map.\n3. Convert the map distance to actual distance using the map scale.\n4. Divide the height difference by the horizontal distance.\n5. Express as a ratio (e.g., 1:50 means 1 m rise for every 50 m horizontal distance).\n\n**Example:**\n- Point A: altitude 1 400 m\n- Point B: altitude 1 200 m\n- Horizontal distance on map: 4 cm\n- Map scale: 1:50 000\n- Actual distance: 4 cm x 50 000 = 200 000 cm = 2 000 m\n- Gradient = (1 400 - 1 200) / 2 000 = 200 / 2 000 = 1/10 = **1:10**'),
  fb(4, 'Gradient is calculated as the ___ distance divided by the ___ distance. A gradient of 1:10 means a 1 m rise for every ___ m of horizontal distance.',
    ['vertical', 'horizontal', '10'],
    'Gradient = vertical distance (rise) / horizontal distance (run). A gradient of 1:10 is a relatively steep slope -- 1 metre of altitude gain for every 10 metres travelled horizontally.'),
  t(5, '## Vertical Exaggeration\n\nWhen drawing a cross-section, the vertical scale is often made larger than the horizontal scale to make the relief features more visible. This is called **vertical exaggeration (VE)**.\n\n### Calculating Vertical Exaggeration\n\n**Formula:** VE = Horizontal scale denominator / Vertical scale denominator\n\nOr equivalently: VE = Vertical scale / Horizontal scale (when both are expressed as representative fractions)\n\n**Example:**\n- Map (horizontal) scale: 1:50 000\n- Vertical scale used for cross-section: 1:10 000\n- VE = 50 000 / 10 000 = **5 times**\n\nThis means vertical distances on the cross-section appear 5 times greater relative to horizontal distances.\n\n**Effects of vertical exaggeration:**\n- Slopes appear steeper than they actually are.\n- Valleys and ridges appear more pronounced.\n- Necessary for readability, but remember that the true landscape is much flatter than the cross-section suggests.\n\n**Exam tip:** Always state the vertical exaggeration when drawing a cross-section.'),
  q(6, 'If the map scale is 1:50 000 and the vertical scale of a cross-section is 1:5 000, what is the vertical exaggeration?',
    ['10 times', '5 times', '2 times', '50 times'], 0,
    'VE = 50 000 / 5 000 = 10 times. The vertical distances are exaggerated by a factor of 10 compared to the horizontal distances.'),
  t(7, '## Contour Patterns and Landforms\n\n### Reading Contour Lines\n\n| Pattern | Landform |\n|---------|----------|\n| **Concentric circles, decreasing inward** | Hill or peak |\n| **Concentric circles with hachures** | Depression or crater |\n| **V-shapes pointing uphill (upstream)** | River valley or stream |\n| **V-shapes pointing downhill** | Spur (ridge extending from a mountain) |\n| **Closely spaced contours** | Steep slope (cliff if almost touching) |\n| **Widely spaced contours** | Gentle slope or flat area |\n| **Even spacing** | Uniform slope |\n| **Spacing increases downslope** | Concave slope |\n| **Spacing decreases downslope** | Convex slope |\n\n### Contour Interval\n\nThe **contour interval** is the vertical distance between successive contour lines. On South African 1:50 000 maps, it is typically **20 metres**.'),
  fb(8, 'On a topographic map, V-shaped contours pointing upstream indicate a ___. The contour interval on SA 1:50 000 maps is typically ___ metres.',
    ['river valley', '20'],
    'Contour V-shapes point upstream in river valleys (the "V points uphill" rule). The standard contour interval for SA 1:50 000 topographic maps is 20 metres.'),
  t(9, '## GIS Concepts\n\n### What is GIS?\n\n**GIS (Geographic Information System)** is a computer-based system for capturing, storing, analysing, managing, and displaying spatial (geographic) data.\n\n### Components of a GIS\n\n1. **Hardware** -- computers, GPS receivers, scanners, printers.\n2. **Software** -- GIS applications (e.g., ArcGIS, QGIS).\n3. **Data** -- spatial data (location) and attribute data (characteristics).\n4. **People** -- analysts, technicians, decision-makers.\n5. **Methods** -- procedures for data collection, analysis, and output.\n\n### Data Types\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Vector data** | Points, lines, and polygons representing features | Points: weather stations. Lines: rivers, roads. Polygons: farm boundaries, dams. |\n| **Raster data** | Grid of cells (pixels), each with a value | Satellite images, elevation models (DEM), land-use maps. |\n\n### Key GIS Operations\n\n- **Buffering** -- creating a zone of a specified distance around a feature (e.g., 500 m buffer around a river for flood risk).\n- **Querying** -- asking the GIS to find features meeting specific criteria (e.g., all farms within 10 km of a road).\n- **Overlay** -- combining two or more data layers to find spatial relationships (e.g., overlaying soil type and rainfall maps to identify best farming areas).'),
  q(10, 'In GIS, what is the purpose of a buffer operation?',
    ['To create a zone of specified distance around a feature for spatial analysis', 'To delete unwanted data from the map', 'To increase the resolution of a satellite image', 'To convert vector data to raster data'], 0,
    'Buffering creates a new polygon at a set distance from a feature. For example, a 1 km buffer around a school shows all areas within 1 km, useful for planning catchment areas or safety zones.'),
  fb(11, 'The two main types of spatial data in GIS are ___ data (points, lines, polygons) and ___ data (grid of cells/pixels).',
    ['vector', 'raster'],
    'Vector data represents features as discrete geometric shapes (points, lines, polygons). Raster data uses a continuous grid of cells, each storing a value (e.g., elevation, temperature, land use).'),
];

// =============================================================================
// CHAPTER 12: Revision (Term 4)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Exam Structure for Grade 11 Geography\n\n### Paper Overview\n\n| Paper | Content | Duration | Marks |\n|-------|---------|----------|-------|\n| **Paper 1** | The Atmosphere (Climate and Weather), Geomorphology | 3 hours | 225 |\n| **Paper 2** | Development Geography, Resources, GIS and Map Skills | 3 hours | 225 |\n\n### Question Types\n\n- **Multiple choice** -- select the correct answer from four options.\n- **Short structured questions** -- provide specific answers (definitions, lists, explanations).\n- **Data response** -- analyse maps, graphs, diagrams, satellite images, or statistics.\n- **Extended writing (essay)** -- longer responses requiring discussion, evaluation, and examples. Usually 8-10 marks.\n\n### Key Command Words\n\n| Word | What It Requires |\n|------|------------------|\n| **Define** | Give the exact meaning of a term. |\n| **Describe** | Say what something is like (features, characteristics). |\n| **Explain** | Give reasons WHY something happens (cause and effect). |\n| **Discuss** | Give a balanced view with advantages/disadvantages or different perspectives. |\n| **Evaluate** | Make a judgement based on evidence. |\n| **Compare** | Identify similarities AND differences. |\n| **Distinguish** | Highlight differences between two or more things. |'),
  q(2, 'If an exam question asks you to "explain" a geographic process, what must your answer include?',
    ['Reasons WHY the process happens, with cause-and-effect links', 'Only a definition of the process', 'A list of features without explanation', 'A personal opinion without evidence'], 0,
    '"Explain" requires you to give reasons (causes and effects). A description alone is not sufficient -- you must show WHY something happens, not just WHAT happens.'),
  t(3, '### Answering Strategies\n\n**For map and diagram questions:**\n- Read the question carefully -- note whether it asks about a specific location or area.\n- Use map evidence (contour values, symbols, scale) to support your answer.\n- Always include compass directions and distances where relevant.\n- For synoptic maps: identify pressure systems first, then winds, then weather.\n\n**For essay questions:**\n- Plan your answer briefly before writing.\n- Start with a clear introduction that defines key terms.\n- Organise your answer into clear paragraphs with topic sentences.\n- Use specific examples (especially South African examples).\n- End with a conclusion that summarises your argument.\n- Aim for depth, not just length.\n\n**For data response questions:**\n- Read all the data before answering.\n- Quote specific values from the data to support your answer.\n- Show calculations clearly with correct units.\n- Round answers appropriately (usually to one decimal place unless told otherwise).'),
  t(4, '### Key Definitions to Revise -- Climatology\n\n| Term | Definition |\n|------|------------|\n| **Insolation** | Incoming solar radiation received at the Earth\'s surface. |\n| **Angle of incidence** | The angle at which the Sun\'s rays strike the Earth\'s surface. |\n| **Albedo** | The proportion of solar radiation reflected by a surface. |\n| **Greenhouse effect** | The warming of the Earth\'s surface by greenhouse gases trapping outgoing longwave radiation. |\n| **Energy balance** | The state where incoming solar energy equals outgoing terrestrial energy. |\n| **ITCZ** | Inter-Tropical Convergence Zone -- where trade winds from both hemispheres meet near the equator. |\n| **Pressure gradient** | The rate of pressure change over a given horizontal distance. |\n| **Coriolis effect** | The deflection of moving air and water due to the Earth\'s rotation (left in SH). |\n| **Foehn wind** | A warm, dry wind on the leeward side of a mountain range. |\n| **El Nino** | Warm phase of ENSO -- weakened trade winds, warm water shifts eastward in the Pacific. |\n| **Desertification** | Degradation of productive land in arid and semi-arid areas. |'),
  t(5, '### Key Definitions to Revise -- Geomorphology\n\n| Term | Definition |\n|------|------------|\n| **Differential erosion** | Different rates of erosion caused by varying rock resistance. |\n| **Mesa** | A large, flat-topped hill with a resistant cap rock and steep sides. |\n| **Butte** | A smaller version of a mesa, further reduced by erosion. |\n| **Scarp slope** | The steep slope on the side of a cuesta opposite the dip direction. |\n| **Dip slope** | The gentle slope following the angle of tilted rock layers. |\n| **Cuesta** | An asymmetric ridge formed from gently tilted rock layers. |\n| **Hogsback** | A symmetric, narrow ridge formed from steeply tilted rock layers. |\n| **Batholith** | A massive intrusive body of granite exposed by erosion. |\n| **Exfoliation** | The peeling of curved sheets from granite due to pressure release. |\n| **Tor** | A pile of rounded granite boulders formed by subsurface weathering. |\n| **Back wasting** | Horizontal retreat of a slope while maintaining its steep angle. |\n| **Mass movement** | Downslope movement of rock and soil under the influence of gravity. |'),
  fb(6, 'The command word "___ " requires you to give a balanced view with different perspectives. The command word "___" requires you to highlight differences between concepts.',
    ['discuss', 'distinguish'],
    '"Discuss" means present multiple viewpoints or advantages/disadvantages. "Distinguish" means identify the differences between two or more concepts.'),
  t(7, '### Key Definitions to Revise -- Development and Resources\n\n| Term | Definition |\n|------|------------|\n| **Development** | The process of improving the quality of human life through economic, social, and political progress. |\n| **GDP** | Gross Domestic Product -- total value of goods and services produced within a country annually. |\n| **HDI** | Human Development Index -- composite measure of health, education, and living standards (0-1). |\n| **GINI coefficient** | A measure of income inequality within a country (0 = equal, 1 = totally unequal). |\n| **Globalisation** | Increasing interconnection of economies, cultures, and populations worldwide. |\n| **Fair Trade** | A movement ensuring producers in developing countries receive fair prices and conditions. |\n| **Soil erosion** | Removal of topsoil by water, wind, or human activity faster than it can be replaced. |\n| **Renewable energy** | Energy from sources that are naturally replenished (solar, wind, hydro, biomass). |\n| **Just Energy Transition** | A shift from fossil fuels to clean energy that supports affected workers and communities. |\n| **GIS** | Geographic Information System -- computer-based system for spatial data analysis. |'),
  q(8, 'What is the difference between GDP and GNI?',
    ['GDP measures production within a country; GNI includes income earned by citizens abroad minus foreigners\' income within the country', 'GDP includes international income; GNI only counts domestic production', 'They are exactly the same measure with different names', 'GDP is adjusted for inflation; GNI is not'], 0,
    'GDP counts all production within national borders regardless of who produces it. GNI adds income earned by the country\'s citizens abroad and subtracts income earned by foreigners within the country, giving a better picture of national income.'),
  t(9, '### Final Exam Tips\n\n1. **Read the question twice** before answering. Underline command words and key terms.\n2. **Allocate time per mark** -- approximately 1.5 minutes per mark (for a 3-hour, 225-mark paper).\n3. **Answer all questions** -- there is no choice; everything is compulsory.\n4. **Use geographical terminology** -- examiners look for correct use of subject-specific language.\n5. **Draw neat, labelled diagrams** where appropriate (cross-sections, annotated sketches, flow charts).\n6. **Include South African examples** -- these earn marks and show application of concepts.\n7. **Show all calculations** clearly with units and correct rounding.\n8. **Review your paper** -- if time allows, check for silly mistakes and unanswered parts.\n9. **Practise past papers** -- the format is consistent from year to year.\n10. **Manage your stress** -- arrive early, bring all required materials, and start with questions you know well.'),
];


// =============================================================================
// MAIN FUNCTION
// =============================================================================

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
      title: 'Chapter 1: Earth\'s Energy Balance',
      description: 'Earth\'s axis and revolution, seasons, angle of incidence, insolation, unequal heating, latitudinal energy balance, greenhouse effect, and albedo.',
      order: 1,
      lessons: [
        { title: 'The Earth in Space: Axis, Revolution, and Seasons', description: 'Axial tilt, revolution, solstices, equinoxes, angle of incidence, insolation, and unequal heating of the Earth.', blocks: ch1_lesson1, term: 1 },
        { title: 'Energy Balance, Greenhouse Effect, and Albedo', description: 'Incoming and outgoing radiation, greenhouse effect, albedo, terrestrial radiation, counter-radiation, and SA context.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Global Air Circulation',
      description: 'The tri-cellular model, world pressure belts, air circulation patterns, pressure-wind relationship, monsoons, and Foehn winds.',
      order: 2,
      lessons: [
        { title: 'The Tri-cellular Model and World Pressure Belts', description: 'Hadley, Ferrel, and Polar cells, jet streams, global pressure belts, and their influence on South Africa.', blocks: ch2_lesson1, term: 1 },
        { title: 'Pressure and Wind, Monsoons, and Foehn Winds', description: 'Pressure-wind relationship, wind direction in the Southern Hemisphere, monsoons, and Foehn wind formation.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Africa\'s Weather and Climate',
      description: 'El Nino and La Nina, climate controls in Africa, synoptic weather maps, satellite image interpretation.',
      order: 3,
      lessons: [
        { title: 'El Nino, La Nina, and Climate Controls in Africa', description: 'Walker Circulation, ENSO effects on southern Africa, latitude, altitude, ocean currents, and continentality.', blocks: ch3_lesson1, term: 1 },
        { title: 'Synoptic Weather Maps and Satellite Images', description: 'Reading synoptic maps, interpreting pressure systems, fronts, satellite images, and practical map skills.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Droughts and Desertification',
      description: 'Drought types, causes, and effects; desertification processes; management strategies; GIS applications.',
      order: 4,
      lessons: [
        { title: 'Droughts: Causes, Effects, and Management', description: 'Types of drought, natural and human causes, effects on SA, Cape Town water crisis, and management strategies.', blocks: ch4_lesson1, term: 1 },
        { title: 'Desertification and GIS Application', description: 'Desertification causes and effects, the Great Green Wall, management strategies, and GIS monitoring tools.', blocks: ch4_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Geomorphology -- Horizontally Layered Rocks',
      description: 'Hilly landscapes from horizontal strata, differential erosion, mesas, buttes, basaltic plateaux, scarp retreat, and back wasting.',
      order: 5,
      lessons: [
        { title: 'Horizontal Strata, Basaltic Plateaux, and Scarp Retreat', description: 'Differential erosion, mesa-butte sequence, dolerite caps, Great Escarpment, back wasting, and pediment formation.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Geomorphology -- Inclined/Tilted Rocks',
      description: 'Scarp slope, dip slope, cuesta, homoclinal ridge, hogsback, and cuesta basin landforms.',
      order: 6,
      lessons: [
        { title: 'Cuesta, Homoclinal Ridge, Hogsback, and Cuesta Basin', description: 'Tilted rock strata, scarp and dip slopes, asymmetric ridges, and the Magaliesberg as a South African example.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Geomorphology -- Massive Igneous Rocks',
      description: 'Batholiths, laccoliths, dykes, sills, granite domes, tors, and exfoliation.',
      order: 7,
      lessons: [
        { title: 'Intrusive Igneous Landforms: Batholiths to Tors', description: 'Batholiths, laccoliths, dykes, sills, granite domes, exfoliation, and tors with SA examples.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Slopes and Mass Movement',
      description: 'Slope elements, types of mass movement (soil creep, solifluction, landslide, rock falls, mud flows, slumps), causes, and SA case studies.',
      order: 8,
      lessons: [
        { title: 'Slope Elements and Mass Movement Types', description: 'Four slope elements, slow and rapid mass movement types, causes, and the 2022 KZN disaster case study.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Development Geography',
      description: 'Concept of development, economic and social indicators, GNP/GDP/HDI/GINI, developed vs developing, trade, and globalisation.',
      order: 9,
      lessons: [
        { title: 'Measuring Development: Indicators and Indices', description: 'Economic, social, and demographic indicators, HDI, GINI coefficient, and developed vs developing countries.', blocks: ch9_lesson1, term: 3 },
        { title: 'Factors Affecting Development, Trade, and Globalisation', description: 'Physical, historical, economic, and social factors, international trade, Fair Trade, and globalisation effects.', blocks: ch9_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Resources and Sustainability',
      description: 'Soil erosion, conventional and non-conventional energy, energy management, Koeberg nuclear case study.',
      order: 10,
      lessons: [
        { title: 'Soil Erosion and Energy Resources', description: 'Soil erosion types and causes, conventional and renewable energy sources, and SA energy mix.', blocks: ch10_lesson1, term: 4 },
        { title: 'Energy Management and Nuclear Energy Case Study', description: 'Energy transition, Just Energy Transition, REIPPPP, and the Koeberg power station case study.', blocks: ch10_lesson2, term: 4 },
      ],
    },
    {
      title: 'Chapter 11: GIS and Map Skills',
      description: 'Cross-sections, gradient, vertical exaggeration, contour patterns, GIS concepts, vector and raster data, buffering, querying, overlay.',
      order: 11,
      lessons: [
        { title: 'Map Skills and GIS Concepts', description: 'Drawing cross-sections, calculating gradient and vertical exaggeration, contour interpretation, and GIS fundamentals.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Revision and Exam Preparation',
      description: 'Exam structure, key definitions, command words, answering strategies, and study tips for Grade 11 Geography.',
      order: 12,
      lessons: [
        { title: 'Revision: Exam Structure, Key Definitions, and Tips', description: 'Paper 1 and Paper 2 structure, key Geography definitions, command words, answering strategies, and exam tips.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 11 Geography \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Climatology, Geomorphology, Development Geography, Resources and Sustainability, GIS, and Map Skills for the Grade 11 Geography curriculum.',
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
  console.log('  TEXTBOOK: Grade 11 Geography');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
