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
// CHAPTER 1: Domestic, Regional and International Tourism
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Domestic, Regional and International Tourism\n\nTourism is one of the fastest-growing economic sectors globally and plays a vital role in South Africa. Understanding the different types of tourism and their impact is essential for Grade 12 Tourism.\n\n### Definitions\n\n| Term | Meaning |\n|------|--------|\n| **Domestic tourism** | People travelling within their own country for leisure, business, or other purposes |\n| **Regional tourism** | Travel between countries within the same geographic region (e.g., SADC countries) |\n| **International tourism** | Travel between countries in different regions of the world |\n| **Inbound tourism** | Foreign visitors coming into a country |\n| **Outbound tourism** | Residents travelling to another country |'),
  t(2, '### South Africa in Context\n\nSouth Africa is a member of the **Southern African Development Community (SADC)**, which includes 16 member states. Key regional tourism markets for SA include:\n\n- **Zimbabwe** (largest source of regional arrivals)\n- **Mozambique**\n- **Lesotho**\n- **Eswatini (Swaziland)**\n- **Botswana**\n\nSA also attracts significant international tourists from:\n- **United Kingdom** (largest long-haul market)\n- **Germany**\n- **United States**\n- **France**\n- **Netherlands**\n\nDomestic tourism is actively promoted through campaigns like **Sho\'t Left** (SA Tourism) to encourage South Africans to explore their own country.'),
  q(3, 'Which of the following best describes regional tourism in the South African context?',
    ['Travel between SADC member states', 'Travel within South Africa only', 'Travel between continents', 'Travel for business purposes only'], 0,
    'Regional tourism refers to travel between countries in the same geographic region. For South Africa, this means travel within the SADC region.'),
  t(4, '### Global Events of International Significance\n\nMajor global events can have a profound impact on tourism:\n\n| Event | Description | Tourism Impact |\n|-------|------------|----------------|\n| **FIFA World Cup** | Held every 4 years; SA hosted in 2010 | Massive infrastructure development, global media exposure, increased arrivals |\n| **Olympic Games** | Summer and Winter Games held every 4 years | Host city receives billions in investment, tourism boost during and after |\n| **G8/G20 Summits** | Meetings of world leaders | Security concerns but also media exposure for host country |\n| **Rugby World Cup** | SA hosted in 1995 and won in 2023 | National pride, international media coverage, tourism boost |\n| **EXPO (World Fair)** | Showcases innovation and culture | Millions of visitors over several months |\n\nSouth Africa hosted the **2010 FIFA World Cup**, which attracted approximately 310 000 foreign visitors and generated an estimated R93 billion in economic activity.'),
  q(5, 'Which major global sporting event did South Africa host in 2010?',
    ['FIFA World Cup', 'Olympic Games', 'Commonwealth Games', 'Rugby World Cup'], 0,
    'South Africa hosted the 2010 FIFA World Cup, becoming the first African nation to do so.'),
  fb(6, 'South Africa is a member of ___, which stands for Southern African Development Community. The SA Tourism domestic campaign encouraging locals to travel is called ___.',
    ['SADC', 'Sho\'t Left'],
    'SADC is the regional body for southern African countries. Sho\'t Left is SA Tourism campaign promoting domestic travel.'),
  t(7, '### Impact of Global Events on Tourism\n\n**Positive impacts:**\n- Increased visitor numbers and tourism revenue\n- Infrastructure development (stadiums, airports, roads, hotels)\n- International media exposure and destination marketing\n- Job creation in construction, hospitality, and services\n- Improved global image and reputation of host country\n- Legacy infrastructure benefits the country long after the event\n\n**Negative impacts:**\n- Enormous hosting costs (often billions of Rands)\n- Potential displacement of local communities\n- Environmental damage from construction\n- Overcrowding and strain on infrastructure during the event\n- Security risks and costs\n- Post-event economic decline (the so-called "white elephant" stadiums)'),
  q(8, 'What is a "white elephant" stadium in the context of global events?',
    ['A venue built for a major event that is underused afterwards', 'A stadium painted white for the Olympics', 'A stadium reserved for elephant conservation events', 'The largest stadium in the world'], 0,
    'A "white elephant" refers to expensive infrastructure (like stadiums) built for a mega-event that becomes costly to maintain and is rarely used afterwards.'),
  t(9, '### Political Situations and Unforeseen Occurrences\n\nTourism is highly sensitive to political stability and safety. Events that negatively affect tourism include:\n\n| Event Type | Examples | Impact on Tourism |\n|-----------|----------|-------------------|\n| **Civil war / conflict** | Syria, Yemen, Ukraine-Russia conflict | Near-total collapse of tourism |\n| **Terrorism** | 9/11 attacks (USA), Bali bombings, Paris attacks | Travel advisories, decreased arrivals, airline security changes |\n| **Natural disasters** | Tsunamis, earthquakes, hurricanes, volcanic eruptions | Destruction of infrastructure, travel warnings |\n| **Pandemics** | COVID-19 (2020-2022) | Global tourism decline of 73% in 2020 |\n| **Political instability** | Coups, protests, xenophobia | Negative media coverage, travel advisories |\n\nThe **COVID-19 pandemic** was the most devastating event for global tourism in modern history, with international arrivals dropping from 1.5 billion in 2019 to 400 million in 2020.'),
  q(10, 'Which event caused the largest decline in global tourism in modern history?',
    ['COVID-19 pandemic', '9/11 terrorist attacks', '2004 Indian Ocean tsunami', '2008 global financial crisis'], 0,
    'COVID-19 caused an unprecedented 73% decline in international tourist arrivals in 2020, far exceeding any other single event.'),
  fb(11, 'When a country experiences political instability, foreign governments may issue ___ advising citizens not to travel there. The COVID-19 pandemic caused international tourist arrivals to drop by approximately ___ % in 2020.',
    ['travel advisories', '73'],
    'Travel advisories warn citizens about unsafe destinations. COVID-19 caused a 73% decline in 2020 arrivals compared to 2019.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Map Work and Tour Planning
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Map Work and Tour Planning\n\n### Tour Itinerary Concepts\n\nA **tour itinerary** is a detailed plan of a trip, listing all activities, transport, accommodation, and attractions in chronological order.\n\n### Types of Tours\n\n| Tour Type | Description |\n|-----------|------------|\n| **Package tour** | Pre-arranged tour where transport, accommodation, meals, and activities are bundled together |\n| **Scheduled tour** | Fixed-date tour with a set itinerary that departs regardless of group size |\n| **Charter tour** | A group hires transport exclusively for their trip |\n| **Tailor-made tour** | Custom-designed tour based on individual preferences and budget |\n| **Self-drive tour** | Tourist plans and drives their own route |\n| **Adventure tour** | Focused on outdoor/active experiences (hiking, rafting, safari) |'),
  t(2, '### Factors to Consider When Planning a Tour\n\nEffective tour planning requires consideration of multiple factors:\n\n**1. Purpose of the tour**\n- Leisure, business, educational, cultural, or adventure\n\n**2. Target market**\n- Age group, physical abilities, interests, budget\n\n**3. Duration**\n- Number of days and nights\n- Time of year (peak vs off-peak season)\n\n**4. Budget**\n- Transport costs, accommodation, meals, entrance fees, tips\n- Foreign exchange if international\n\n**5. Logistics**\n- Distance between attractions\n- Road conditions and travel time\n- Availability of accommodation\n- Visa and passport requirements for international travel\n\n**6. Safety considerations**\n- Health risks (malaria areas, altitude sickness)\n- Travel advisories\n- Travel insurance'),
  q(3, 'Which type of tour involves a pre-arranged package where transport, accommodation, and activities are all included?',
    ['Package tour', 'Self-drive tour', 'Charter tour', 'Adventure tour'], 0,
    'A package tour bundles all components together at a single price, making it convenient for tourists.'),
  t(4, '### Logical Tour Planning and Route Planning\n\nWhen planning a route for a tour:\n\n**Key principles:**\n- Plan a **logical route** that avoids unnecessary backtracking\n- Consider **driving distances** and realistic travel times\n- Allow for **rest stops** on long drives (every 2-3 hours)\n- Factor in **border crossing times** for regional tours\n- Include **buffer time** for unexpected delays\n\n**South African route examples:**\n\n| Route | Distance | Approx. Time |\n|-------|----------|---------------|\n| Johannesburg to Durban (N3) | 570 km | 6 hours |\n| Cape Town to Garden Route (N2) | 380 km | 4.5 hours |\n| Johannesburg to Kruger (Phalaborwa) | 530 km | 5.5 hours |\n| Durban to Drakensberg | 250 km | 3 hours |\n| Cape Town to Stellenbosch | 50 km | 45 minutes |'),
  t(5, '### Different Types of Itineraries\n\n| Itinerary Type | Description | Example |\n|---------------|-------------|--------|\n| **Skeleton itinerary** | Brief outline showing only major stops and dates | Day 1: Cape Town. Day 2: Hermanus. Day 3: Garden Route |\n| **Detailed itinerary** | Full breakdown with times, activities, costs | 08:00 Depart hotel. 09:30 Arrive Table Mountain. Cost: R380 pp |\n| **Day-by-day itinerary** | Comprehensive daily plan with all arrangements | Complete schedule with transport, meals, attractions per day |\n\n### Writing an Itinerary\n\nA good itinerary must include:\n- **Date and day number** (Day 1: Monday, 15 June 2026)\n- **Times** for departure, arrival, activities\n- **Transport details** (mode, route, distance)\n- **Accommodation** (name, type, location)\n- **Meals** included (B = Breakfast, L = Lunch, D = Dinner)\n- **Activities and attractions** with entrance fees\n- **Total estimated cost**'),
  q(6, 'What is a skeleton itinerary?',
    ['A brief outline showing only major stops and dates', 'A detailed plan with exact times and costs', 'An itinerary for adventure tourism only', 'A last-minute travel plan'], 0,
    'A skeleton itinerary provides a basic overview of the tour route without detailed timing or costs.'),
  fb(7, 'When planning a tour route, you should avoid unnecessary ___. It is recommended to plan rest stops every ___ hours on long drives.',
    ['backtracking', '2-3'],
    'Logical route planning avoids backtracking (retracing the same road). Rest stops every 2-3 hours help prevent driver fatigue.'),
  t(8, '### Reading Maps for Tourism\n\n**Key map skills for tourism:**\n\n- **Scale**: Understanding the relationship between map distance and real distance\n  - Scale 1:1 000 000 means 1 cm on map = 10 km in reality\n- **Compass directions**: N, S, E, W, NE, NW, SE, SW\n- **Map symbols**: Tourist attractions, national parks, airports, borders\n- **Road types**: National routes (N1, N2), regional routes (R44), local roads\n- **Latitude and longitude**: Used to locate places precisely\n  - Latitude: distance north/south of equator (0 degrees)\n  - Longitude: distance east/west of Prime Meridian (0 degrees)\n  - South Africa lies between approximately 22 degrees S and 35 degrees S latitude, and 17 degrees E and 33 degrees E longitude'),
  q(9, 'If a map has a scale of 1:500 000, what real distance does 3 cm on the map represent?',
    ['15 km', '150 km', '1.5 km', '50 km'], 0,
    '3 cm on map = 3 x 500 000 cm = 1 500 000 cm = 15 000 m = 15 km.'),
  q(10, 'South Africa lies in which hemisphere(s)?',
    ['Southern and Eastern hemispheres', 'Northern and Western hemispheres', 'Southern and Western hemispheres', 'Northern and Eastern hemispheres'], 0,
    'South Africa is south of the equator (Southern hemisphere) and east of the Prime Meridian (Eastern hemisphere).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Compiling a Day-by-Day Itinerary
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Compiling a Day-by-Day Itinerary\n\n### Main Aspects of an Itinerary\n\nA comprehensive day-by-day itinerary covers five main aspects:\n\n| Aspect | Details to Include |\n|--------|-------------------|\n| **Transport** | Mode (flight, bus, car hire), departure/arrival times, route, distance, cost |\n| **Accommodation** | Type (hotel, B&B, guesthouse, lodge), name, location, star rating, cost per night |\n| **Attractions** | Name, type (natural, cultural, man-made), entrance fees, operating hours |\n| **Activities** | Description, duration, level of difficulty, cost, booking requirements |\n| **Meals** | Which meals are included (B, L, D), restaurant recommendations, dietary options |'),
  t(2, '### Types of Accommodation in South Africa\n\n| Type | Description | Typical Cost (per night) |\n|------|------------|------------------------|\n| **Backpackers/Hostel** | Budget, dormitory-style or private rooms | R200 - R500 |\n| **Bed & Breakfast (B&B)** | Private homes offering rooms with breakfast | R500 - R1 200 |\n| **Guesthouse** | Similar to B&B but more rooms, often upmarket | R800 - R2 000 |\n| **Hotel (3-star)** | Standard hotel with restaurant and amenities | R800 - R1 500 |\n| **Hotel (4-5 star)** | Luxury hotel with full services | R2 000 - R8 000+ |\n| **Game lodge** | Located in/near game reserves, includes game drives | R3 000 - R15 000+ |\n| **Self-catering** | Apartment or cottage with kitchen facilities | R600 - R2 500 |\n| **Camping** | Tent or caravan sites in parks or caravan parks | R150 - R500 |'),
  q(3, 'Which type of accommodation would be most suitable for a budget-conscious backpacker travelling the Garden Route?',
    ['Backpackers/Hostel', '5-star hotel', 'Game lodge', 'Luxury guesthouse'], 0,
    'Backpackers or hostels are the most budget-friendly accommodation option, typically costing R200-R500 per night.'),
  t(4, '### Factors Influencing the Tour Budget\n\nWhen developing a tour budget, consider:\n\n**Fixed costs (do not change with group size):**\n- Vehicle hire\n- Tour guide fees\n- Fuel\n\n**Variable costs (change with number of tourists):**\n- Accommodation per person\n- Meals per person\n- Entrance fees per person\n- Travel insurance per person\n\n**Seasonal factors:**\n- **Peak season** (Dec-Jan, Easter, school holidays): Higher prices, advance booking essential\n- **Off-peak/shoulder season**: Lower prices, more availability\n- **Special events**: Rugby tests, music festivals can increase prices locally\n\n**Other budget considerations:**\n- Gratuities/tips (usually 10-15% at restaurants)\n- Emergency fund (5-10% of total budget)\n- Currency fluctuations for international components'),
  t(5, '### Developing a Basic Tour Budget\n\n**Example: 3-Day Cape Town Tour for 2 people**\n\n| Item | Cost per person | Total (2 pax) |\n|------|----------------|----------------|\n| **Transport** | | |\n| Car hire (3 days at R450/day) | | R1 350 |\n| Fuel (estimated 500 km) | | R900 |\n| **Accommodation** | | |\n| B&B (2 nights at R850 pp sharing) | R1 700 | R3 400 |\n| **Activities** | | |\n| Table Mountain cableway (return) | R395 | R790 |\n| Robben Island tour | R600 | R1 200 |\n| Cape Point entrance | R376 | R752 |\n| **Meals** | | |\n| Lunches (3 days at R180 pp) | R540 | R1 080 |\n| Dinners (2 nights at R350 pp) | R700 | R1 400 |\n| **Subtotal** | | **R10 872** |\n| Emergency fund (10%) | | R1 087 |\n| **Grand Total** | | **R11 959** |\n| **Per person** | **R5 980** | |'),
  q(6, 'In the budget above, which category has the highest cost?',
    ['Accommodation', 'Transport', 'Activities', 'Meals'], 0,
    'Accommodation totals R3 400 (2 nights B&B for 2 people), which is the highest single category.'),
  fb(7, 'Peak season in South Africa is during ___ and ___ (months). During peak season, prices are generally higher and ___ booking is essential.',
    ['December', 'January', 'advance'],
    'Peak season runs over the South African summer holidays (December-January). Advance booking is critical due to high demand.'),
  t(8, '### Drawing Up Itineraries for Different Scenarios\n\n**Scenario: Educational school trip to Gauteng (3 days)**\n\n**Day 1 (Monday)**\n- 07:00 Depart school by bus\n- 11:00 Arrive Johannesburg, check in at City Lodge Hotel\n- 12:00 Lunch at hotel (included)\n- 14:00 Visit Apartheid Museum (R120 per learner)\n- 16:30 Return to hotel\n- 18:00 Dinner at hotel (included)\n\n**Day 2 (Tuesday)**\n- 07:00 Breakfast at hotel (included)\n- 08:30 Depart for Pretoria\n- 09:30 Visit Voortrekker Monument (R90 per learner)\n- 11:30 Visit Union Buildings (free)\n- 12:30 Lunch at Hatfield Square (R120 per learner)\n- 14:30 Visit Freedom Park (R75 per learner)\n- 16:30 Return to hotel\n- 18:00 Dinner (included)\n\n**Day 3 (Wednesday)**\n- 07:00 Breakfast and check out\n- 08:30 Visit Gold Reef City (R250 per learner)\n- 13:00 Lunch (own account)\n- 14:00 Depart for home'),
  q(9, 'In the educational trip itinerary above, which attraction has no entrance fee?',
    ['Union Buildings', 'Apartheid Museum', 'Voortrekker Monument', 'Gold Reef City'], 0,
    'The Union Buildings in Pretoria are free to visit, as they are a government building and national landmark.'),
  t(10, '### Practical Tips for Tour Budgets\n\n- Always get **quotations** from at least 3 suppliers for accommodation and transport\n- Include **VAT (15%)** if prices are quoted excluding VAT\n- Consider **group discounts** available at many attractions (usually 10+ people)\n- Factor in **toll fees** for national routes (e.g., N1 Johannesburg to Polokwane, N3 to Durban)\n- Include **parking fees** at major attractions\n- For international tours, use the **current exchange rate** and add a **5% buffer** for fluctuations\n- Remember that some accommodation prices are **per person sharing** and others are **per room**'),
  q(11, 'Why should a tour budget include a 5% buffer for exchange rate fluctuations on international components?',
    ['Exchange rates change daily and can increase costs unexpectedly', 'It is required by law', 'To pay for travel insurance', 'To cover airport taxes'], 0,
    'Exchange rates are volatile and can change between the time of budgeting and the time of payment. A buffer protects against unexpected increases.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Health and Safety
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Health and Safety in Tourism\n\n### The World Health Organization (WHO)\n\nThe **WHO** is a specialised agency of the United Nations responsible for international public health. In tourism, WHO:\n- Issues international health regulations\n- Provides information on disease outbreaks and health risks\n- Recommends vaccinations for travellers\n- Publishes lists of countries with specific health risks\n- Issues pandemic guidelines that affect global travel\n\n### Health Certificates\n\nA **health certificate** (also called International Certificate of Vaccination or ICV) is an official document proving that a traveller has received specific vaccinations. It is:\n- Required for entry into certain countries\n- Issued by authorised medical practitioners\n- Must be carried with your passport\n- Valid for specific periods depending on the vaccination'),
  t(2, '### Required Vaccinations for Travellers\n\n| Vaccination | Required When | Validity |\n|------------|--------------|----------|\n| **Yellow fever** | Travelling to/through parts of Africa and South America (e.g., Kenya, Tanzania, Brazil) | Lifetime (since 2016, previously 10 years) |\n| **Cholera** | Travelling to areas with active outbreaks | 2 years |\n| **Hepatitis A & B** | Recommended for most African and Asian destinations | Hep A: 1 year (booster gives lifetime). Hep B: Lifetime |\n| **Typhoid** | Parts of Africa, Asia, Central America | 3 years |\n| **Rabies** | Areas with high risk of animal exposure | 2-3 years |\n\n**Important:** South Africa requires a **yellow fever certificate** from travellers who have been in a yellow fever endemic area within the last 6 days before arrival.'),
  q(3, 'Which vaccination certificate does South Africa require from travellers arriving from endemic areas?',
    ['Yellow fever', 'Cholera', 'Typhoid', 'Hepatitis A'], 0,
    'South Africa requires a valid yellow fever vaccination certificate from travellers who have been in a yellow fever endemic area.'),
  t(4, '### Precautions for High-Risk Destinations\n\n**Malaria:**\n- Caused by parasites transmitted through mosquito bites\n- Risk areas in SA: Limpopo (northern), Mpumalanga (Kruger area), KwaZulu-Natal (northern)\n- Precautions:\n  - Take prophylactic (preventive) medication before, during, and after travel\n  - Use insect repellent containing DEET\n  - Sleep under mosquito nets\n  - Wear long sleeves and trousers after dusk\n  - Use plug-in mosquito repellent devices in rooms\n\n**Bilharzia (Schistosomiasis):**\n- Caused by parasites found in freshwater (rivers, dams) in tropical areas\n- Risk areas in SA: KwaZulu-Natal, Mpumalanga, Limpopo\n- Precautions:\n  - Avoid swimming in or drinking untreated fresh water\n  - Use only treated/chlorinated swimming pools\n  - If exposed, seek medical treatment within 6 weeks'),
  q(5, 'Which of the following is NOT a recommended malaria precaution?',
    ['Swimming in freshwater rivers', 'Taking prophylactic medication', 'Using insect repellent with DEET', 'Sleeping under mosquito nets'], 0,
    'Swimming in freshwater rivers is a precaution against bilharzia, not malaria. Malaria precautions focus on avoiding mosquito bites.'),
  fb(6, 'Malaria-risk areas in South Africa include parts of Limpopo, ___, and northern KwaZulu-Natal. Travellers should take ___ medication as a preventive measure.',
    ['Mpumalanga', 'prophylactic'],
    'The Kruger National Park area in Mpumalanga is a well-known malaria-risk area. Prophylactic medication helps prevent malaria infection.'),
  t(7, '### Tourist Safety\n\n**Why tourist safety is important:**\n- Tourists are a country\'s "guests" and their safety reflects on the destination\n- Negative safety incidents receive international media coverage\n- Travel advisories from foreign governments can devastate tourism numbers\n- Word-of-mouth and online reviews spread quickly\n- Tourism contributes significantly to SA GDP (approximately 3.7% directly, 8.6% total contribution)\n\n### General Safety Precautions for Tourists\n\n| Category | Precautions |\n|----------|------------|\n| **Personal safety** | Avoid walking alone at night, keep valuables hidden, use hotel safes |\n| **Transport safety** | Use reputable transport companies, lock car doors, avoid isolated parking areas |\n| **Financial safety** | Carry minimal cash, use cards where possible, be aware of ATM scams |\n| **Health safety** | Drink bottled water in unfamiliar areas, carry prescription medication details, have travel insurance |\n| **Beach safety** | Swim between the flags, be aware of currents, follow lifeguard instructions |\n| **Wildlife safety** | Follow park rules, stay in vehicle during game drives, keep safe distance from animals |'),
  q(8, 'Why is tourist safety particularly important for South Africa?',
    ['Tourism contributes significantly to GDP and negative incidents receive global media coverage', 'Tourists pay more taxes than locals', 'South Africa has no safety challenges', 'Only international tourists matter for the economy'], 0,
    'Tourism contributes about 8.6% to SA GDP (total contribution). Negative safety incidents are amplified by global media and can trigger travel advisories.'),
  t(9, '### Travel Insurance\n\n**Travel insurance** protects tourists against unforeseen events:\n\n| Cover Type | What It Covers |\n|-----------|----------------|\n| **Medical** | Hospital costs, emergency evacuation, repatriation |\n| **Trip cancellation** | Costs if trip is cancelled due to illness, death, or emergency |\n| **Baggage** | Lost, stolen, or damaged luggage and personal belongings |\n| **Travel delay** | Accommodation and meal costs due to flight delays |\n| **Personal liability** | If you accidentally damage property or injure someone |\n\n**Key points:**\n- Travel insurance is **not compulsory** for SA domestic travel but **strongly recommended** for international travel\n- Some countries (e.g., Schengen area in Europe) **require proof of travel insurance** for visa applications\n- Pre-existing medical conditions may not be covered\n- Read the fine print for exclusions (e.g., extreme sports may need additional cover)'),
  q(10, 'Which type of travel insurance cover would help a tourist who needs emergency hospitalisation abroad?',
    ['Medical cover', 'Trip cancellation cover', 'Baggage cover', 'Personal liability cover'], 0,
    'Medical travel insurance covers hospital costs, emergency evacuation, and repatriation, which are essential when travelling internationally.'),
  fb(11, 'Some European countries in the ___ area require proof of travel insurance for visa applications. Travel insurance for ___ covers costs if a trip must be cancelled due to unforeseen circumstances.',
    ['Schengen', 'trip cancellation'],
    'The Schengen area requires travel insurance as part of visa requirements. Trip cancellation cover reimburses costs when trips are cancelled.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Travel Documentation
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Travel Documentation\n\n### Passport Requirements\n\nA **passport** is an official government document that certifies the identity and nationality of the holder for international travel.\n\n**South African passport facts:**\n- Issued by the Department of Home Affairs\n- Valid for 10 years (adults) or 5 years (children under 16)\n- Must have at least **2 blank pages** for visa stamps when travelling\n- Many countries require your passport to be valid for at least **6 months beyond your travel date**\n- Machine-readable (biometric) passport is now standard\n\n**Important:** Children travelling internationally from SA need:\n- Their own passport\n- Unabridged birth certificate (showing both parents)\n- If travelling with one parent: consent letter from the other parent (affidavit)'),
  t(2, '### Visa Requirements\n\nA **visa** is an official endorsement in a passport permitting the holder to enter, leave, or stay in a country for a specified period.\n\n| Visa Type | Purpose |\n|----------|--------|\n| **Tourist visa** | Short-term leisure travel (usually 30-90 days) |\n| **Business visa** | Attending meetings, conferences, or business activities |\n| **Transit visa** | Passing through a country en route to another destination |\n| **Student visa** | Studying in a foreign country |\n| **Work visa** | Employment in a foreign country |\n\n**SA passport holders can travel visa-free to many countries**, including:\n- Most SADC countries (Botswana, Mozambique, Namibia, etc.)\n- Many Caribbean and South American countries\n\n**Visas required for popular destinations:**\n- USA, Canada, UK, Australia, Schengen area (most of Europe), China'),
  q(3, 'How long must a South African passport be valid beyond the travel date for most international destinations?',
    ['At least 6 months', 'At least 3 months', 'At least 1 year', 'Until the return date only'], 0,
    'Most countries require a passport to be valid for at least 6 months beyond the intended date of travel.'),
  t(4, '### Customs Regulations\n\n**Duty-free allowances** for travellers entering South Africa (per person over 18):\n\n| Item | Allowance |\n|------|----------|\n| Cigarettes | 200 |\n| Cigars | 20 |\n| Cigarette tobacco | 250 g |\n| Wine | 2 litres |\n| Spirits/liquor | 1 litre |\n| Perfume | 50 ml |\n| Eau de toilette | 250 ml |\n| Other new goods | Up to R5 000 in value |\n\n**Prohibited goods** (may NOT be brought into SA):\n- Illegal drugs and narcotics\n- Unlicensed firearms and ammunition\n- Counterfeit goods\n- Certain plants, animals, and animal products without permits (CITES regulations)\n- Pornographic material\n- Goods from sanctioned countries'),
  q(5, 'A tourist returning to South Africa has 300 cigarettes. How many cigarettes exceed the duty-free allowance?',
    ['100 cigarettes', '200 cigarettes', '300 cigarettes', 'None, 300 is within the allowance'], 0,
    'The duty-free allowance is 200 cigarettes. 300 - 200 = 100 cigarettes exceed the allowance and attract customs duty.'),
  t(6, '### Green and Red Channels at Customs\n\nAt international airports, travellers choose between two channels:\n\n**Green Channel ("Nothing to Declare"):**\n- Use this if you have nothing above the duty-free allowance\n- You may still be randomly selected for inspection\n- Choosing green channel when you have excess goods is an offence\n\n**Red Channel ("Goods to Declare"):**\n- Use this if you have goods exceeding the duty-free allowance\n- Officials will calculate and collect customs duty\n- You may need to provide receipts for purchased items\n\n**Customs duty** is the tax paid on goods exceeding your allowance. The rate varies by item type. Declaring goods honestly avoids fines, confiscation, or criminal charges.'),
  fb(7, 'At international airports, the ___ channel is for travellers with nothing to declare, while the ___ channel is for those with goods exceeding duty-free allowances.',
    ['green', 'red'],
    'The green channel is "Nothing to Declare" and the red channel is "Goods to Declare".'),
  t(8, '### Travel Allowances\n\nThe **South African Reserve Bank (SARB)** regulates how much money South Africans can take out of the country:\n\n| Allowance Type | Amount |\n|---------------|--------|\n| **Single Discretionary Allowance (SDA)** | R1 million per calendar year (no tax clearance needed) |\n| **Foreign Investment Allowance (FIA)** | R10 million per calendar year (tax clearance required) |\n| **Travel allowance for children under 18** | R200 000 per calendar year |\n\n**Key points:**\n- The SDA can be used for travel, gifts, donations, or maintenance\n- You may carry up to **R25 000 in South African banknotes** when leaving/entering SA\n- Foreign currency can be purchased from authorised dealers (banks, forex bureaus)\n- Keep all foreign exchange receipts for reconversion on return'),
  q(9, 'What is the maximum amount of South African banknotes you may physically carry when leaving the country?',
    ['R25 000', 'R1 million', 'R10 million', 'R5 000'], 0,
    'The limit for carrying South African banknotes out of the country is R25 000 per person.'),
  q(10, 'Which document would a child need, in addition to their passport, when travelling internationally from South Africa with one parent?',
    ['Unabridged birth certificate and consent letter from the other parent', 'Only a visa', 'School identity card', 'Vaccination certificate only'], 0,
    'Children travelling with one parent need an unabridged birth certificate (showing both parents) and a consent affidavit from the absent parent.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: World Time Zones
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## World Time Zones\n\n### Key Concepts\n\n| Term | Definition |\n|------|----------|\n| **UTC (Coordinated Universal Time)** | The primary time standard by which the world regulates clocks. Same as GMT (Greenwich Mean Time) |\n| **Greenwich / Prime Meridian** | The 0-degree line of longitude passing through Greenwich, London. Divides the world into Eastern and Western hemispheres |\n| **Equator** | The 0-degree line of latitude. Divides the world into Northern and Southern hemispheres |\n| **International Date Line (IDL)** | Approximately follows the 180-degree meridian in the Pacific Ocean. Crossing it changes the date by one day |\n| **Hemisphere** | Half of the Earth. Four hemispheres: Northern, Southern, Eastern, Western |\n\nSouth Africa is in the **UTC+2** time zone (South Africa Standard Time, SAST). SA does NOT observe daylight saving time.'),
  t(2, '### World Time Zone Map\n\nThe Earth is divided into **24 time zones**, each representing approximately 15 degrees of longitude (360 degrees / 24 hours = 15 degrees per hour).\n\n**Key time zones for Tourism exams:**\n\n| City/Country | UTC Offset | Hours ahead/behind SA |\n|-------------|------------|----------------------|\n| London (UK) | UTC+0 (UTC+1 in summer) | 2 hours behind (1 in summer) |\n| Paris/Berlin | UTC+1 (UTC+2 in summer) | 1 hour behind (same in summer) |\n| Dubai (UAE) | UTC+4 | 2 hours ahead |\n| Mumbai (India) | UTC+5:30 | 3.5 hours ahead |\n| Bangkok (Thailand) | UTC+7 | 5 hours ahead |\n| Beijing/Hong Kong | UTC+8 | 6 hours ahead |\n| Tokyo (Japan) | UTC+9 | 7 hours ahead |\n| Sydney (Australia) | UTC+10 (UTC+11 in summer) | 8 hours ahead (9 in summer) |\n| New York (USA) | UTC-5 (UTC-4 in summer) | 7 hours behind (6 in summer) |\n| Los Angeles (USA) | UTC-8 (UTC-7 in summer) | 10 hours behind (9 in summer) |\n| Rio de Janeiro | UTC-3 | 5 hours behind |'),
  q(3, 'South Africa is in which time zone?',
    ['UTC+2', 'UTC+0', 'UTC+1', 'UTC+3'], 0,
    'South Africa is in the UTC+2 time zone, known as South Africa Standard Time (SAST).'),
  t(4, '### Time Calculations\n\n**Rule:** Moving EAST = ADD time. Moving WEST = SUBTRACT time.\n\n**Example 1: Determining arrival time**\nA flight departs Johannesburg at 21:00 SAST and takes 11 hours to reach London.\n- Johannesburg is UTC+2, London is UTC+0 (winter)\n- Arrival in Johannesburg time: 21:00 + 11 hours = 08:00 (next day) SAST\n- Convert to London time: 08:00 - 2 hours = **06:00 London time (next day)**\n\n**Example 2: Determining departure time**\nYou need to arrive in Dubai at 14:00 local time. Flight duration is 8 hours.\n- Dubai is UTC+4, Johannesburg is UTC+2\n- What time must you depart from Johannesburg?\n- 14:00 Dubai time in SA time: 14:00 - 2 hours = 12:00 SAST\n- Subtract flight time: 12:00 - 8 hours = **04:00 SAST departure**'),
  q(5, 'A flight leaves Cape Town (UTC+2) at 18:00 and takes 14 hours to reach New York (UTC-5). What is the local arrival time in New York?',
    ['01:00 the next day', '08:00 the next day', '15:00 the same day', '22:00 the next day'], 0,
    'Arrival in SA time: 18:00 + 14h = 08:00 next day (SAST). Time difference: UTC+2 to UTC-5 = 7 hours behind. New York time: 08:00 - 7 = 01:00 next day.'),
  fb(6, 'Moving east you ___ time and moving west you ___ time. The Earth has ___ time zones.',
    ['add', 'subtract', '24'],
    'Moving east means adding hours (time is later), moving west means subtracting (time is earlier). 24 zones cover the full 360 degrees.'),
  t(7, '### Daylight Saving Time (DST)\n\n**What is DST?**\nDaylight Saving Time is the practice of advancing clocks by 1 hour during warmer months so that evenings have more daylight.\n\n**Reasons for DST:**\n- Extends usable daylight hours in the evening\n- Reduces electricity consumption (less artificial lighting needed)\n- Encourages outdoor activities and tourism\n- Was originally introduced to save energy during World War I\n\n**Important for calculations:**\n- Countries in the **Northern Hemisphere** observe DST from approximately March to October\n- Countries in the **Southern Hemisphere** (e.g., Australia, New Zealand) observe DST from approximately October to March\n- South Africa does **NOT** observe DST\n- Not all countries observe DST (e.g., most of Africa, most of Asia)\n\n**Exam tip:** Always check whether DST is in effect when calculating time differences with countries that observe it.'),
  q(8, 'Does South Africa observe Daylight Saving Time?',
    ['No, SA uses SAST (UTC+2) year-round', 'Yes, SA moves to UTC+3 in summer', 'Yes, SA moves to UTC+1 in winter', 'Only in the Western Cape'], 0,
    'South Africa does not observe Daylight Saving Time. SAST remains UTC+2 throughout the year.'),
  t(9, '### Jet Lag\n\n**Jet lag** is a temporary sleep disorder that occurs when your body\'s internal clock (circadian rhythm) is out of sync with the time zone you have travelled to.\n\n**Symptoms of jet lag:**\n- Fatigue and drowsiness during the day\n- Difficulty sleeping at night\n- Difficulty concentrating\n- Headaches\n- Irritability and mood changes\n- Digestive problems (loss of appetite, nausea)\n\n**How to minimise jet lag:**\n- Adjust your sleep schedule a few days before travel\n- Stay hydrated during the flight (drink water, avoid alcohol and caffeine)\n- Set your watch to the destination time zone when boarding\n- Expose yourself to natural sunlight at the destination\n- Take short naps (no longer than 30 minutes) if needed\n- Exercise lightly upon arrival\n- Eat meals according to the local time\n\n**Rule of thumb:** It takes approximately 1 day per time zone crossed to fully recover from jet lag.'),
  q(10, 'A tourist travelling from Johannesburg (UTC+2) to Tokyo (UTC+9) crosses 7 time zones. Approximately how many days will it take to recover from jet lag?',
    ['7 days', '2 days', '14 days', '1 day'], 0,
    'The rule of thumb is approximately 1 day per time zone crossed. Crossing 7 time zones means about 7 days for full recovery.'),
  fb(11, 'Jet lag occurs when your body\'s internal clock, called the ___ rhythm, is out of sync with the local time. To minimise jet lag, travellers should avoid ___ and caffeine during the flight.',
    ['circadian', 'alcohol'],
    'The circadian rhythm is your body\'s internal clock. Alcohol and caffeine worsen dehydration and disrupt sleep, making jet lag worse.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Tourist Attractions - World Heritage Sites
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Tourist Attractions: World Heritage Sites\n\n### Concept of World Heritage\n\nA **World Heritage Site** is a place of outstanding universal value that is recognised by **UNESCO** (United Nations Educational, Scientific and Cultural Organization) under the **World Heritage Convention** (1972).\n\n**Purpose:**\n- To identify, protect, and preserve cultural and natural heritage of outstanding universal value\n- To encourage international cooperation in conservation\n- To provide emergency assistance for sites in danger\n\n**Types of World Heritage Sites:**\n\n| Type | Description | Example |\n|------|------------|--------|\n| **Natural** | Outstanding natural features, geological formations, habitats | iSimangaliso Wetland Park |\n| **Cultural** | Monuments, buildings, sites of historical/artistic significance | Robben Island |\n| **Mixed** | Both natural and cultural significance | Maloti-Drakensberg Park |'),
  t(2, '### South African World Heritage Sites\n\nSouth Africa has **10 World Heritage Sites** (as of the exam syllabus):\n\n| Site | Province | Type | Reason for Listing |\n|------|----------|------|--------------------|\n| **Fossil Hominid Sites (Cradle of Humankind)** | Gauteng | Cultural | Fossils revealing human evolution (Mrs Ples, Little Foot) |\n| **Robben Island** | Western Cape | Cultural | Symbol of triumph of democracy over oppression |\n| **iSimangaliso Wetland Park** | KwaZulu-Natal | Natural | Exceptional biodiversity, interconnected ecosystems |\n| **Maloti-Drakensberg Park** | KwaZulu-Natal / Lesotho | Mixed | San rock art, mountain biodiversity |\n| **Mapungubwe Cultural Landscape** | Limpopo | Cultural | Evidence of first indigenous kingdom in southern Africa |\n| **Cape Floral Region** | Western Cape / Eastern Cape | Natural | Richest plant kingdom per area, unique fynbos biome |\n| **Vredefort Dome** | Free State | Natural | Largest verified impact crater on Earth |\n| **Richtersveld Cultural and Botanical Landscape** | Northern Cape | Cultural | Nama people transhumance practices, succulent flora |\n| **Barberton Makhonjwa Mountains** | Mpumalanga | Natural | Oldest exposed geological structures on Earth (3.6 billion years) |\n| **Khomani Cultural Landscape** | Northern Cape | Cultural | San people cultural practices and knowledge systems |'),
  q(3, 'Which South African World Heritage Site is classified as a mixed (both natural and cultural) site?',
    ['Maloti-Drakensberg Park', 'Robben Island', 'Vredefort Dome', 'iSimangaliso Wetland Park'], 0,
    'Maloti-Drakensberg Park is the only mixed World Heritage Site in SA, recognised for both its San rock art (cultural) and mountain biodiversity (natural).'),
  t(4, '### Locating SA World Heritage Sites on a Map\n\n**Geographic distribution:**\n\n- **Gauteng:** Cradle of Humankind (northwest of Johannesburg)\n- **Western Cape:** Robben Island (Table Bay, Cape Town), Cape Floral Region (stretches along the coast)\n- **KwaZulu-Natal:** iSimangaliso (northeast coast, near St Lucia), Maloti-Drakensberg (western border with Lesotho)\n- **Limpopo:** Mapungubwe (far north, at the confluence of Limpopo and Shashe rivers, near Zimbabwe/Botswana border)\n- **Free State:** Vredefort Dome (near Parys)\n- **Northern Cape:** Richtersveld (far northwest, along the Orange River near Namibia border), Khomani (Kalahari region, near Botswana border)\n- **Mpumalanga:** Barberton Makhonjwa Mountains (near Barberton/Eswatini border)\n\n**Exam tip:** You must be able to locate all 10 sites on a map of South Africa and identify which province each is in.'),
  fb(5, 'The Cradle of Humankind is located in ___ province. The ___ is the largest verified impact crater on Earth, located in the Free State near Parys.',
    ['Gauteng', 'Vredefort Dome'],
    'The Cradle of Humankind is in Gauteng (northwest of Johannesburg). The Vredefort Dome in the Free State is the world\'s largest verified impact crater.'),
  t(6, '### Famous World Icons and Their Significance\n\n| Icon | Location | Significance |\n|------|----------|-------------|\n| **Eiffel Tower** | Paris, France | Symbol of France, built 1889 for World Fair, most visited paid monument |\n| **Statue of Liberty** | New York, USA | Gift from France (1886), symbol of freedom and democracy |\n| **Taj Mahal** | Agra, India | Mughal emperor built for his wife (1632-1653), masterpiece of Islamic architecture |\n| **Great Wall of China** | China | Defensive wall spanning 21 196 km, built over 2 000 years |\n| **Machu Picchu** | Peru | 15th-century Inca citadel, "Lost City of the Incas" |\n| **Pyramids of Giza** | Egypt | Ancient Egyptian tombs, one of the Seven Wonders of the Ancient World |\n| **Colosseum** | Rome, Italy | Roman amphitheatre (AD 70-80), could hold 50 000 spectators |\n| **Christ the Redeemer** | Rio de Janeiro, Brazil | 30 m Art Deco statue, one of the New Seven Wonders of the World |\n| **Sydney Opera House** | Sydney, Australia | Iconic 20th-century building, expressionist modern design |\n| **Table Mountain** | Cape Town, SA | One of the New 7 Wonders of Nature, flat-topped mountain, cableway since 1929 |'),
  q(7, 'Which famous world icon is considered one of the Seven Wonders of the Ancient World?',
    ['Pyramids of Giza', 'Colosseum', 'Taj Mahal', 'Machu Picchu'], 0,
    'The Great Pyramid of Giza is the oldest and only remaining structure of the original Seven Wonders of the Ancient World.'),
  q(8, 'Table Mountain in Cape Town was named as one of the:',
    ['New 7 Wonders of Nature', 'Original Seven Wonders of the World', 'UNESCO World Heritage Sites', 'New Seven Wonders of the World (man-made)'], 0,
    'Table Mountain was voted as one of the New 7 Wonders of Nature in 2011.'),
  t(9, '### The Importance of World Heritage Sites for Tourism\n\n**Benefits:**\n- Attract international tourists specifically interested in heritage tourism\n- UNESCO listing provides global recognition and marketing\n- Conservation efforts protect sites for future generations\n- Create employment in surrounding communities (guides, hospitality, crafts)\n- Generate revenue through entrance fees and tourist spending\n- Encourage infrastructure development in the area\n\n**Challenges:**\n- Balancing conservation with tourist access\n- Overcrowding can damage sensitive sites\n- Funding for maintenance and conservation\n- Climate change threatens natural sites\n- Illegal activities (poaching, looting of archaeological sites)'),
  fb(10, 'UNESCO stands for United Nations ___, Scientific and Cultural Organization. South Africa has ___ World Heritage Sites.',
    ['Educational', '10'],
    'UNESCO is the United Nations Educational, Scientific and Cultural Organization. SA has 10 World Heritage Sites.'),
  q(11, 'Which South African World Heritage Site contains evidence of the first indigenous kingdom in southern Africa?',
    ['Mapungubwe Cultural Landscape', 'Cradle of Humankind', 'Robben Island', 'Richtersveld'], 0,
    'Mapungubwe in Limpopo province contains evidence of the first indigenous kingdom in southern Africa, dating to around AD 900-1300.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Tourism Attractions and Marketing
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Tourism Attractions and Marketing\n\n### Factors Contributing to the Success of a Tourist Attraction\n\n| Factor | Explanation |\n|--------|------------|\n| **Accessibility** | Easy to reach by road, air, or public transport |\n| **Affordability** | Entrance fees and surrounding costs are reasonable for the target market |\n| **Amenities/Facilities** | Clean restrooms, parking, restaurants, shops, information centre |\n| **Activities** | Variety of things to do for different age groups and interests |\n| **Accommodation** | Range of nearby accommodation options |\n| **Attractions** | Unique or compelling reasons to visit (the "pull factor") |\n| **Atmosphere/Ambience** | Clean, safe, well-maintained, welcoming |\n| **Awareness** | Effective marketing that reaches the target market |\n\nThese are sometimes called the **8 As of tourism**.'),
  t(2, '### Tourist Attraction Characteristics\n\n**Natural attractions:**\n- Beaches, mountains, wildlife, natural landscapes\n- SA examples: Kruger National Park, Table Mountain, Wild Coast, Drakensberg\n\n**Cultural/Heritage attractions:**\n- Museums, historical sites, cultural villages\n- SA examples: Apartheid Museum, Robben Island, Cradle of Humankind\n\n**Man-made attractions:**\n- Theme parks, shopping centres, entertainment venues\n- SA examples: Sun City, V&A Waterfront, Gold Reef City, uShaka Marine World\n\n**Events and festivals:**\n- Sporting events, music festivals, food markets\n- SA examples: Cape Town Jazz Festival, National Arts Festival (Makhanda), Comrades Marathon'),
  q(3, 'Which of the following is an example of a man-made tourist attraction in South Africa?',
    ['V&A Waterfront', 'Table Mountain', 'Blyde River Canyon', 'Drakensberg Mountains'], 0,
    'The V&A Waterfront in Cape Town is a man-made attraction (shopping, dining, entertainment complex). The other options are natural attractions.'),
  t(4, '### Tourism Statistics\n\n**Key statistics for SA tourism (exam context):**\n\n**Domestic tourism:**\n- South Africans take approximately 40-50 million domestic trips per year\n- Main purposes: visiting friends and relatives (VFR), leisure, business\n- Most popular domestic provinces: KwaZulu-Natal, Gauteng, Limpopo\n\n**Regional tourism:**\n- Approximately 75% of all foreign arrivals to SA come from African countries\n- Top source markets: Zimbabwe, Mozambique, Lesotho, Eswatini, Botswana\n\n**International tourism (long-haul):**\n- Approximately 25% of foreign arrivals are from overseas\n- Top overseas markets: UK, Germany, USA, France, Netherlands\n- SA competes with other African destinations: Kenya, Tanzania, Egypt, Morocco\n\n**Foreign market share:**\n- Africa receives about 5-6% of global international tourist arrivals\n- SA is the leading tourism destination in sub-Saharan Africa'),
  q(5, 'What percentage of foreign arrivals to South Africa come from African countries?',
    ['Approximately 75%', 'Approximately 25%', 'Approximately 50%', 'Approximately 90%'], 0,
    'About 75% of all foreign arrivals to SA are from other African countries (regional tourism), with only about 25% from overseas markets.'),
  t(6, '### Marketing SA as a Tourism Destination\n\n| Organisation | Role |\n|-------------|------|\n| **SA Tourism** | National tourism marketing organisation. Markets SA domestically (Sho\'t Left) and internationally. Reports to the Department of Tourism |\n| **TOMSA (Tourism Marketing South Africa)** | Collects a voluntary tourism marketing levy from the industry to fund marketing initiatives |\n| **Tourism Indaba** | Africa\'s largest tourism marketing event, held annually in Durban. Brings together buyers (tour operators) and sellers (SA tourism businesses) |\n| **Getaway Show** | Consumer travel exhibition where the public can explore tourism options, book trips, and get travel inspiration |\n\n### Branding South Africa\n\n- SA\'s tourism brand emphasises diversity: "Alive with possibility"\n- Key selling points: Big Five, beautiful coastline, cultural diversity, world-class wine, adventure activities, value for money (weak Rand advantage)\n- Brand SA works with SA Tourism to promote the country image globally'),
  fb(7, 'Africa\'s largest tourism marketing event is called the Tourism ___, held annually in ___.',
    ['Indaba', 'Durban'],
    'The Tourism Indaba is held in Durban and is Africa\'s largest travel trade show.'),
  q(8, 'What is the role of TOMSA in South African tourism?',
    ['Collects a voluntary levy from the tourism industry to fund marketing', 'Regulates hotel star ratings', 'Issues travel visas to foreign tourists', 'Manages national parks'], 0,
    'TOMSA (Tourism Marketing South Africa) collects a voluntary tourism marketing levy from tourism businesses to fund marketing initiatives.'),
  t(9, '### The Importance of Domestic Tourism\n\n**Why domestic tourism matters:**\n- Less affected by exchange rates and international events\n- Provides a stable base of tourist numbers year-round\n- Distributes economic benefits across all provinces\n- Creates jobs in rural and less-visited areas\n- Builds a culture of travel and appreciation for SA heritage\n\n**Barriers to domestic tourism in SA:**\n- High cost of transport and accommodation for many South Africans\n- Limited leave days for formal sector workers\n- Safety concerns\n- Lack of awareness of tourism offerings\n- Many South Africans prefer VFR (visiting friends and relatives) over paid tourism experiences'),
  q(10, 'Which of the following is a barrier to domestic tourism in South Africa?',
    ['High cost of transport and accommodation for many South Africans', 'Too many tourists visiting SA already', 'Lack of tourism attractions in SA', 'SA has too many public holidays'], 0,
    'The high cost of travel and accommodation is a significant barrier for many South Africans who would otherwise travel domestically.'),
  fb(11, 'SA Tourism\'s domestic campaign encouraging South Africans to explore their own country is called ___. The top overseas source market for SA tourism is the ___.',
    ['Sho\'t Left', 'United Kingdom'],
    'Sho\'t Left encourages South Africans to take affordable domestic trips. The UK is SA\'s largest overseas (long-haul) tourism market.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Foreign Exchange
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Foreign Exchange\n\n### GDP and Tourism\n\n**Gross Domestic Product (GDP)** is the total value of all goods and services produced in a country in a given period (usually one year).\n\n**Tourism\'s contribution to SA GDP:**\n- Direct contribution: approximately 3-4% of GDP (accommodation, transport, attractions)\n- Total contribution (including indirect): approximately 7-9% of GDP\n- Tourism employs approximately 1.5 million people in SA (direct and indirect)\n\n**The link between tourism and GDP:**\n- Inbound tourists spend foreign currency in SA, increasing GDP\n- Tourism creates employment, which increases consumer spending\n- Tourism stimulates investment in infrastructure\n- A stronger tourism sector strengthens the overall economy'),
  t(2, '### Bank Selling Rate (BSR) vs Bank Buying Rate (BBR)\n\nWhen you exchange currency at a bank or forex bureau:\n\n| Rate | Meaning | When It Applies |\n|------|---------|----------------|\n| **Bank Selling Rate (BSR)** | The rate at which the bank SELLS foreign currency TO you | When you BUY foreign currency (going overseas) |\n| **Bank Buying Rate (BBR)** | The rate at which the bank BUYS foreign currency FROM you | When you SELL foreign currency (returning from overseas) |\n\n**Key rule:** BSR is always HIGHER than BBR. The difference is the bank\'s profit (called the **spread**).\n\n**Example:**\n\n| Currency | BSR (Bank sells to you) | BBR (Bank buys from you) |\n|---------|------------------------|-------------------------|\n| US Dollar (USD) | R18,75 | R18,10 |\n| British Pound (GBP) | R23,50 | R22,80 |\n| Euro (EUR) | R20,25 | R19,60 |\n\nThe spread on USD = R18,75 - R18,10 = R0,65 per dollar.'),
  q(3, 'You are travelling to London and need to buy British pounds. Which rate will the bank use?',
    ['Bank Selling Rate (BSR)', 'Bank Buying Rate (BBR)', 'The average of BSR and BBR', 'The international exchange rate'], 0,
    'When you BUY foreign currency from the bank, they use the Bank Selling Rate (BSR), which is always the higher rate.'),
  t(4, '### Currency Conversions\n\n**Converting Rand to foreign currency (buying forex):**\n$$\\text{Foreign amount} = \\frac{\\text{Rand amount}}{\\text{BSR}}$$\n\n**Converting foreign currency to Rand (selling forex):**\n$$\\text{Rand amount} = \\text{Foreign amount} \\times \\text{BBR}$$\n\n**Example 1 (Buying):** You have R15 000 and the BSR for USD is R18,75.\nUSD received = R15 000 / R18,75 = **$800,00**\n\n**Example 2 (Selling):** You return from the UK with 120 GBP and the BBR is R22,80.\nRand received = 120 x R22,80 = **R2 736,00**\n\n**Example 3 (Total cost):** A tourist needs EUR 2 500 for a trip to Europe. BSR is R20,25.\nRand needed = 2 500 x R20,25 = **R50 625,00**'),
  q(5, 'A tourist returns from the USA with $350. The BBR is R18,10. How many Rand will they receive?',
    ['R6 335,00', 'R6 562,50', 'R19,32', 'R5 143,00'], 0,
    'When selling foreign currency back to the bank: Rand = $350 x R18,10 = R6 335,00. We use the BBR because the bank is buying dollars from you.'),
  fb(6, 'The bank ___ rate is always higher than the bank ___ rate. The difference between these rates is called the ___.',
    ['selling', 'buying', 'spread'],
    'BSR > BBR always. The spread is how banks make profit on currency exchange transactions.'),
  t(7, '### Strong Rand vs Weak Rand\n\n| Scenario | Effect on Tourism |\n|----------|------------------|\n| **Strong Rand** (e.g., R14 per USD) | SA is more expensive for foreign tourists (fewer inbound). SA travellers get more foreign currency (outbound travel cheaper) |\n| **Weak Rand** (e.g., R20 per USD) | SA is cheaper for foreign tourists (more inbound). SA travellers get less foreign currency (outbound travel more expensive) |\n\n**Example:**\nA hotel charges R2 000 per night.\n- At R14/USD: Foreign tourist pays $143 per night (expensive)\n- At R20/USD: Foreign tourist pays $100 per night (cheaper)\n\n**For SA inbound tourism, a weaker Rand is generally GOOD** because it makes SA a more affordable and competitive destination.'),
  q(8, 'A weak Rand benefits South African inbound tourism because:',
    ['SA becomes cheaper for foreign tourists to visit', 'SA becomes more expensive for foreign tourists', 'It reduces the number of tourists', 'It makes domestic travel cheaper'], 0,
    'A weaker Rand means foreign currencies buy more in SA, making the country more affordable for international tourists.'),
  t(9, '### The Multiplier Effect\n\nThe **multiplier effect** describes how tourist spending circulates through the economy, creating a much larger economic impact than the original spend.\n\n**How it works:**\n1. A tourist pays R2 000 for a hotel room\n2. The hotel uses that money to:\n   - Pay staff wages (R600)\n   - Buy food from local suppliers (R400)\n   - Pay electricity (R200)\n   - Pay maintenance (R300)\n   - Keep profit (R500)\n3. Hotel staff spend their wages on rent, food, transport\n4. Local food suppliers pay their farmers\n5. Each Rand circulates multiple times through the economy\n\n**The multiplier effect means that every R1 spent by a tourist generates approximately R2-R3 of economic activity in the broader economy.**\n\nThis is why tourism is considered such a powerful economic driver, especially for developing countries like South Africa.'),
  q(10, 'The tourism multiplier effect means that:',
    ['Every Rand spent by tourists generates additional economic activity as it circulates', 'Tourists always spend more than planned', 'Tourism income is doubled by the government', 'Hotels charge tourists double the local rate'], 0,
    'The multiplier effect describes how tourist spending creates a ripple effect through the economy as money circulates between businesses, workers, and suppliers.'),
  t(11, '### Exchange Rate Fluctuations\n\n**Factors causing exchange rate changes:**\n- Interest rate changes (higher rates attract foreign investment, strengthening the Rand)\n- Political stability (instability weakens the currency)\n- Economic performance (strong GDP growth strengthens the currency)\n- Commodity prices (SA exports gold, platinum; higher prices strengthen Rand)\n- Global events (pandemics, wars create uncertainty, weakening emerging market currencies)\n- Trade balance (more exports than imports strengthens the currency)\n\n**Impact on tourism planning:**\n- Tour operators may set prices in USD or EUR to protect against Rand volatility\n- Tourists may delay or advance bookings based on exchange rate trends\n- SA inbound tour prices become more competitive when the Rand weakens\n- International tourists benefit from locking in exchange rates early when the Rand is weak'),
  fb(12, 'Tourism contributes approximately ___% to South Africa GDP directly. Every R1 spent by a tourist generates approximately R___-R___ of economic activity through the multiplier effect.',
    ['3-4', '2', '3'],
    'Tourism directly contributes about 3-4% to GDP. The multiplier effect means each Rand of tourist spending generates R2-R3 of total economic activity.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Sustainable and Responsible Tourism
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Sustainable and Responsible Tourism\n\n### The Three Pillars of Sustainability\n\nSustainable tourism balances three interconnected pillars:\n\n| Pillar | Also Called | Focus |\n|--------|-----------|-------|\n| **People** | Social sustainability | Benefits to local communities, cultural preservation, fair employment |\n| **Profit** | Economic sustainability | Long-term economic viability, fair distribution of tourism revenue |\n| **Planet** | Environmental sustainability | Conservation of natural resources, minimising environmental impact |\n\nThese three pillars are often called the **Triple Bottom Line (TBL)** or the **3 Ps**: People, Planet, Profit.\n\nSustainable tourism aims to meet the needs of present tourists and host regions while protecting and enhancing opportunities for the future.'),
  t(2, '### Responsible Tourism in South Africa\n\nSouth Africa adopted a **Responsible Tourism Policy** (the White Paper on Tourism, 1996) which emphasises:\n\n- Tourism should benefit local communities economically\n- Tourism should be culturally sensitive and respectful\n- Tourism should minimise environmental degradation\n- Tourism should involve local communities in decision-making\n\n**Codes of Conduct:**\n\n| For Tourists | For Tourism Businesses |\n|-------------|----------------------|\n| Respect local customs and traditions | Employ local people and pay fair wages |\n| Do not litter or damage the environment | Source supplies locally where possible |\n| Support local businesses and artisans | Implement energy and water saving measures |\n| Follow park rules and regulations | Reduce waste and recycle |\n| Do not buy products made from endangered species | Contribute to community development projects |\n| Learn a few words of the local language | Provide accurate information about local culture |'),
  q(3, 'The Triple Bottom Line in sustainable tourism refers to:',
    ['People, Planet, Profit', 'Past, Present, Future', 'Price, Product, Promotion', 'Policy, Planning, Practice'], 0,
    'The Triple Bottom Line (3 Ps) considers the social (People), environmental (Planet), and economic (Profit) impacts of tourism.'),
  t(4, '### Environmental Practices: Reduce, Reuse, Recycle\n\n**Reduce:**\n- Use less water (shorter showers, reuse hotel towels)\n- Use less electricity (energy-efficient lighting, solar power)\n- Reduce food waste in restaurants and hotels\n- Reduce use of single-use plastics (no straws, no plastic bags)\n\n**Reuse:**\n- Reuse towels and linen in hotels (not washing daily unless requested)\n- Reuse packaging materials\n- Donate leftover food to shelters or composting\n- Refill water bottles at water stations\n\n**Recycle:**\n- Separate waste (paper, glass, plastic, organic)\n- Use recycled materials in construction and furnishings\n- Recycle greywater for garden irrigation\n- Compost organic waste\n\n**Additional environmental practices:**\n- Carbon offset programmes for air travel\n- Solar panels and rainwater harvesting\n- Green building design (natural ventilation, insulation)\n- Using electric or hybrid vehicles for tourist transport'),
  q(5, 'Which of the following is an example of "reduce" in sustainable tourism?',
    ['Using energy-efficient LED lighting in hotels', 'Recycling glass bottles', 'Reusing hotel towels', 'Composting food waste'], 0,
    'LED lighting reduces electricity consumption. Recycling and composting fall under "recycle", and reusing towels falls under "reuse".'),
  fb(6, 'The three Rs of environmental sustainability are ___, ___, and ___. Hotels can practice "reuse" by not washing ___ daily unless guests request it.',
    ['reduce', 'reuse', 'recycle', 'towels'],
    'Reduce, Reuse, Recycle are the three Rs. Hotels save water and energy by reusing towels (the towel card system).'),
  t(7, '### Responsible Tourism Examples in South Africa\n\n| Example | Description |\n|---------|------------|\n| **Grootbos Private Nature Reserve** (Western Cape) | Conservation, community upliftment, sustainable farming |\n| **Phinda Private Game Reserve** (KZN) | Community partnerships, anti-poaching, local employment |\n| **Bulungula Lodge** (Eastern Cape) | 40% community-owned, employs locals, eco-friendly design |\n| **Fair Trade Tourism certified businesses** | Independently verified as responsible tourism operators |\n| **Responsible Tourism awards** (Indaba) | Annual awards recognising SA businesses practising responsible tourism |\n\n### Fair Trade Tourism\n\nFair Trade Tourism is a non-profit that certifies tourism businesses in Southern Africa that meet criteria for:\n- Fair wages and working conditions\n- Fair distribution of benefits\n- Respect for human rights, culture, and the environment\n- Ethical business practices\n\nLook for the **Fair Trade Tourism logo** when choosing responsible tourism experiences.'),
  q(8, 'What does Fair Trade Tourism certification indicate about a tourism business?',
    ['It meets standards for fair wages, ethical practices, and environmental respect', 'It offers the cheapest prices', 'It is government-owned', 'It only operates internationally'], 0,
    'Fair Trade Tourism certifies businesses that demonstrate fair employment, ethical practices, environmental responsibility, and fair distribution of benefits.'),
  t(9, '### CSI (Corporate Social Investment) in Tourism\n\nMany large tourism companies invest in community development through CSI programmes:\n\n**Examples of tourism CSI:**\n- Building schools and clinics in communities near tourism areas\n- Providing bursaries for local students to study hospitality and tourism\n- Supporting local craft cooperatives and small businesses\n- Funding wildlife conservation and anti-poaching initiatives\n- Providing clean water and sanitation in rural tourism areas\n- Running environmental education programmes for local communities\n\n**Benefits of CSI for tourism businesses:**\n- Improved relationship with local communities\n- Positive brand image and marketing advantage\n- Reduced community conflict and resentment\n- Skilled local workforce for future employment\n- Contribution to sustainable development goals'),
  q(10, 'Which of the following is an example of CSI in the tourism industry?',
    ['Providing bursaries for local students to study hospitality', 'Increasing hotel room prices', 'Reducing staff numbers to cut costs', 'Building luxury resorts for international tourists only'], 0,
    'CSI involves investing in community upliftment. Providing educational bursaries for local students is a direct community investment.'),
  fb(11, 'CSI stands for Corporate ___ Investment. Fair Trade Tourism is a non-profit that ___ tourism businesses meeting ethical and sustainability standards.',
    ['Social', 'certifies'],
    'CSI is Corporate Social Investment. Fair Trade Tourism certifies businesses that meet their standards for ethical and sustainable tourism.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Communication and Customer Care
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Communication and Customer Care\n\n### Methods of Obtaining Customer Feedback\n\nTourism businesses need customer feedback to improve service quality. Common methods include:\n\n| Method | Description | Advantages | Disadvantages |\n|--------|------------|-----------|----------------|\n| **Comment cards** | Paper cards left in rooms or at reception | Easy to use, anonymous | Low response rate, limited detail |\n| **Surveys/Questionnaires** | Structured questions (rating scales, open-ended) | Detailed data, can compare over time | Takes time to complete, may bore customers |\n| **Online reviews** | TripAdvisor, Google Reviews, Booking.com | Reaches wide audience, honest feedback | Can be manipulated, public criticism |\n| **SMS/WhatsApp feedback** | Short survey via text message after visit | Quick, high response rate | Limited detail, may annoy customers |\n| **Web-based surveys** | Email link to online survey (SurveyMonkey, Google Forms) | Easy to analyse, reach many customers | Low open rates, spam filters |\n| **Social media** | Facebook, Instagram, Twitter comments | Real-time, reaches young market | Public, can go viral if negative |\n| **Focus groups** | Small group discussions with customers | In-depth insights, can probe further | Expensive, time-consuming, small sample |'),
  t(2, '### Analysing Customer Feedback\n\n**Steps in analysing feedback:**\n\n1. **Collect** feedback from all channels (cards, online, surveys)\n2. **Organise** feedback by category (service, cleanliness, food, facilities)\n3. **Quantify** where possible (e.g., 85% rated service as "excellent")\n4. **Identify trends** (are complaints increasing? Are there recurring issues?)\n5. **Prioritise** issues based on frequency and severity\n6. **Report** findings to management with recommendations\n\n**Example feedback analysis:**\n\n| Category | Positive (%) | Negative (%) | Main Issues |\n|----------|-------------|-------------|-------------|\n| Room cleanliness | 92% | 8% | Bathroom not cleaned properly |\n| Food quality | 78% | 22% | Limited vegetarian options |\n| Staff friendliness | 95% | 5% | Slow check-in process |\n| Facilities | 85% | 15% | Pool maintenance, WiFi speed |\n| Value for money | 70% | 30% | High minibar prices |'),
  q(3, 'Which feedback method reaches the widest audience but carries the risk of public negative criticism?',
    ['Online reviews (TripAdvisor, Google)', 'Comment cards', 'Focus groups', 'SMS surveys'], 0,
    'Online reviews on platforms like TripAdvisor and Google reach millions of potential customers, but negative reviews are publicly visible.'),
  t(4, '### Customer Satisfaction\n\nCustomer satisfaction is the degree to which a product or service meets or exceeds customer expectations.\n\n**Factors affecting customer satisfaction in tourism:**\n\n| Factor | Example |\n|--------|--------|\n| **Service quality** | Friendly, efficient, knowledgeable staff |\n| **Value for money** | Price matches the quality of experience |\n| **Reliability** | Services delivered as promised (confirmed bookings honoured) |\n| **Responsiveness** | Quick response to requests and problems |\n| **Tangibles** | Clean facilities, modern equipment, attractive environment |\n| **Empathy** | Understanding individual needs, personalised service |\n| **Assurance** | Staff competence inspires confidence and trust |\n\n**Measuring satisfaction:**\n- Net Promoter Score (NPS): "How likely are you to recommend us?" (0-10 scale)\n- Customer Satisfaction Score (CSAT): Overall satisfaction rating\n- Return visitor rate: Percentage of guests who visit again'),
  q(5, 'A hotel guest rates their stay as a 9 out of 10 on the Net Promoter Score. This guest is classified as a:',
    ['Promoter', 'Passive', 'Detractor', 'Neutral'], 0,
    'In NPS, scores of 9-10 are Promoters (loyal enthusiasts), 7-8 are Passives, and 0-6 are Detractors.'),
  t(6, '### Handling Complaints\n\n**Steps for handling customer complaints (LEARN method):**\n\n| Step | Action |\n|------|--------|\n| **L - Listen** | Let the customer explain without interrupting |\n| **E - Empathise** | Show you understand their frustration |\n| **A - Apologise** | Offer a sincere apology, even if you are not at fault |\n| **R - React** | Take immediate action to resolve the problem |\n| **N - Notify** | Follow up to ensure the customer is satisfied with the resolution |\n\n**Important principles:**\n- Never argue with the customer\n- Remain calm and professional at all times\n- Offer a solution, not excuses\n- Empower staff to resolve minor complaints without management approval\n- Document all complaints for future analysis\n- Thank the customer for bringing the issue to your attention'),
  fb(7, 'The LEARN method for handling complaints stands for Listen, ___, Apologise, React, and ___.',
    ['Empathise', 'Notify'],
    'LEARN: Listen, Empathise, Apologise, React, Notify. This structured approach ensures complaints are handled professionally.'),
  t(8, '### Action Plans for Improvement\n\nAfter analysing feedback and identifying problems, tourism businesses create action plans:\n\n**Example action plan:**\n\n| Issue | Action | Responsible | Deadline | Budget |\n|-------|--------|------------|----------|--------|\n| Slow check-in | Implement online check-in system | IT Manager | 30 June | R45 000 |\n| Limited vegetarian menu | Hire consultant, redesign menu | Head Chef | 15 May | R12 000 |\n| WiFi speed | Upgrade internet package | Operations Manager | Immediately | R3 500/month |\n| Pool maintenance | Hire dedicated pool service company | Facilities Manager | 1 May | R5 000/month |\n\n**Key elements of an action plan:**\n- Specific issue identified\n- Clear action to address it\n- Person responsible\n- Deadline for implementation\n- Budget allocation\n- Method of measuring success'),
  q(9, 'Why should tourism businesses document and analyse all customer complaints?',
    ['To identify recurring issues and improve service quality', 'To blame specific staff members', 'To increase prices', 'To reduce the number of customers'], 0,
    'Documenting complaints helps identify patterns and recurring problems, allowing businesses to make targeted improvements to service quality.'),
  q(10, 'In the LEARN method, what does the "R" stand for?',
    ['React (take action to resolve the problem)', 'Refuse (reject unreasonable complaints)', 'Record (write down the complaint)', 'Redirect (send to another department)'], 0,
    'R stands for React: take immediate action to resolve the customer\'s problem.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Tourism Sectors and Employment
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Tourism Sectors and Employment\n\n### Job and Career Opportunities in Tourism Sectors\n\n| Sector | Examples of Careers |\n|--------|--------------------|\n| **Airlines/Aviation** | Pilot, flight attendant, ground crew, check-in agent, airport manager, air traffic controller |\n| **Hotels/Accommodation** | Hotel manager, receptionist, concierge, housekeeper, chef, food and beverage manager |\n| **Travel agencies/Tour operators** | Travel consultant, tour guide, tour manager, product manager, reservations agent |\n| **National parks/Conservation** | Game ranger, field guide, conservation officer, park manager, researcher |\n| **Restaurants/Catering** | Chef, waiter, sommelier, restaurant manager, barista, event caterer |\n| **Transport** | Bus driver, car rental agent, cruise ship crew, transfer driver |\n| **Events and conferences** | Event planner, conference organiser, exhibition manager |\n| **Tourism marketing** | Marketing manager, social media manager, content creator, PR officer |\n| **Government/Tourism bodies** | Tourism officer, policy analyst, inspector, tourism ambassador |'),
  t(2, '### Conditions of Employment\n\n**Basic Conditions of Employment Act (BCEA):**\n\nThe BCEA sets minimum standards for employment in South Africa:\n\n| Condition | Minimum Standard |\n|----------|------------------|\n| **Working hours** | Maximum 45 hours per week (9 hours/day for 5-day week, 8 hours/day for 6-day week) |\n| **Overtime** | Maximum 10 hours per week, paid at 1.5x normal rate (2x on Sundays/public holidays) |\n| **Annual leave** | 21 consecutive days (15 working days) per year |\n| **Sick leave** | 30 days in a 3-year cycle (6 weeks) |\n| **Maternity leave** | 4 consecutive months (unpaid under BCEA, UIF provides some payment) |\n| **Family responsibility leave** | 3 days per year (for birth of child, illness/death of family) |\n| **Notice period** | 1 week (0-6 months), 2 weeks (6-12 months), 4 weeks (1+ year) |\n| **Minimum wage** | Set annually by government (R27.58 per hour as per 2024 rate) |'),
  q(3, 'According to the BCEA, what is the maximum number of normal working hours per week?',
    ['45 hours', '40 hours', '48 hours', '50 hours'], 0,
    'The BCEA stipulates a maximum of 45 ordinary working hours per week.'),
  t(4, '### Job Contract Elements\n\nAn employment contract must include:\n\n| Element | Details |\n|---------|--------|\n| **Parties** | Full names of employer and employee |\n| **Job title and description** | Clear description of duties and responsibilities |\n| **Workplace** | Physical address where work will be performed |\n| **Working hours** | Days and hours of work, overtime arrangements |\n| **Remuneration** | Salary/wage amount, payment frequency, deductions |\n| **Leave** | Annual leave, sick leave, family responsibility leave entitlements |\n| **Benefits** | Medical aid, pension, UIF contributions, bonuses |\n| **Probation period** | Duration and conditions of probationary period |\n| **Notice period** | Required notice for resignation or dismissal |\n| **Start date** | When employment begins |\n| **Signatures** | Both employer and employee must sign |'),
  fb(5, 'The BCEA stands for Basic Conditions of ___ Act. The minimum annual leave entitlement is ___ consecutive days per year.',
    ['Employment', '21'],
    'The Basic Conditions of Employment Act (BCEA) requires a minimum of 21 consecutive days (15 working days) of annual leave.'),
  t(6, '### Labour Laws\n\n**Labour Relations Act (LRA):**\n- Regulates the relationship between employers, employees, and trade unions\n- Protects the right to strike and to lock out\n- Establishes the CCMA (Commission for Conciliation, Mediation and Arbitration) to resolve disputes\n- Protects against unfair dismissal and unfair labour practices\n\n**Employment Equity Act (EEA):**\n- Promotes equal opportunity and fair treatment in the workplace\n- Eliminates unfair discrimination based on race, gender, disability, etc.\n- Requires designated employers to implement affirmative action\n- Aims to achieve a workforce that broadly represents the demographics of South Africa\n\n**Skills Development Act (SDA):**\n- Requires employers to contribute to skills development (1% of payroll as Skills Development Levy)\n- Funded through SETAs (Sector Education and Training Authorities)\n- CATHSSETA is the relevant SETA for tourism and hospitality'),
  q(7, 'Which body resolves labour disputes in South Africa?',
    ['CCMA (Commission for Conciliation, Mediation and Arbitration)', 'SAPS (South African Police Service)', 'SARS (South African Revenue Service)', 'SARB (South African Reserve Bank)'], 0,
    'The CCMA was established under the Labour Relations Act to resolve disputes between employers and employees through conciliation, mediation, and arbitration.'),
  t(8, '### Work Ethics and Professional Image\n\n**Work ethics in tourism:**\n\n| Ethic | Description |\n|-------|------------|\n| **Punctuality** | Arrive on time, meet deadlines, deliver services as scheduled |\n| **Reliability** | Be dependable, follow through on commitments |\n| **Honesty/Integrity** | Be truthful with customers and colleagues, do not steal |\n| **Respect** | Treat all people with dignity regardless of background |\n| **Teamwork** | Cooperate with colleagues, support each other |\n| **Confidentiality** | Protect customer personal information and business secrets |\n| **Initiative** | Anticipate customer needs, go the extra mile |\n| **Positive attitude** | Be enthusiastic, friendly, and solution-oriented |\n\n**Professional image:**\n- Clean, neat appearance and appropriate dress code\n- Good personal hygiene\n- Name badge worn visibly\n- Polite and courteous communication\n- Good posture and body language\n- Knowledge of products and services offered'),
  q(9, 'Which of the following demonstrates good work ethics in the tourism industry?',
    ['Anticipating customer needs and going the extra mile', 'Arriving late because the shift is long', 'Sharing customer personal information with friends', 'Ignoring colleagues who need help'], 0,
    'Good work ethics include initiative (anticipating needs), punctuality, honesty, and teamwork. Sharing personal information violates confidentiality.'),
  t(10, '### Code of Conduct in Tourism\n\nA **code of conduct** is a set of rules and guidelines that govern the behaviour of employees and businesses in the tourism industry.\n\n**Key elements of a tourism code of conduct:**\n- Provide honest and accurate information to tourists\n- Do not overcharge or mislead customers\n- Respect cultural diversity and local customs\n- Protect the environment and natural resources\n- Maintain safety standards\n- Handle customer data with confidentiality\n- Report unethical behaviour\n- Comply with all applicable laws and regulations\n\n**UNWTO Global Code of Ethics for Tourism** (key principles):\n1. Tourism contributes to mutual understanding and respect\n2. Tourism is a vehicle for individual and collective fulfilment\n3. Tourism is a factor of sustainable development\n4. Tourism is a user of cultural heritage and contributor to its enhancement\n5. Tourism is a beneficial activity for host communities'),
  fb(11, 'CATHSSETA is the ___ for the tourism and hospitality industry. The CCMA resolves disputes through conciliation, ___, and arbitration.',
    ['SETA', 'mediation'],
    'CATHSSETA is the Sector Education and Training Authority for culture, arts, tourism, hospitality, and sport. The CCMA uses conciliation, mediation, and arbitration.'),
  q(12, 'The Employment Equity Act aims to:',
    ['Promote equal opportunity and eliminate unfair discrimination in the workplace', 'Set minimum wages for all industries', 'Regulate working hours and overtime', 'Establish trade unions'], 0,
    'The EEA promotes equal opportunity, fair treatment, and the elimination of unfair discrimination in employment.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Revision and Exam Preparation
// ═══════════════════════════════════════════════════════════════════════════════
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\n### Paper Structure\n\nThe Grade 12 Tourism final examination is a single paper:\n\n| Aspect | Detail |\n|--------|--------|\n| **Total marks** | 200 |\n| **Duration** | 3 hours |\n| **Number of sections** | 4 sections |\n\n### Section Breakdown\n\n| Section | Content | Marks | Question Type |\n|---------|---------|-------|---------------|\n| **Section A** | Short questions covering all topics | 40 | Multiple choice, matching columns, true/false |\n| **Section B** | Map work and tour planning | 50 | Map interpretation, itinerary analysis, calculations |\n| **Section C** | Tourism sectors, marketing, culture | 60 | Short paragraphs, data analysis, case studies |\n| **Section D** | Sustainable tourism, current affairs | 50 | Essay-type, problem-solving, critical thinking |\n\n**Important:** All sections are compulsory. There is no choice of questions.'),
  t(2, '### Map Work Skills for the Exam\n\n**Essential map skills you must master:**\n\n1. **Reading a world time zone map** - Calculating time differences, arrival/departure times\n2. **Reading a map of South Africa** - Locating provinces, World Heritage Sites, attractions\n3. **Interpreting a world map** - Identifying countries, continents, oceans, hemispheres\n4. **Scale calculations** - Converting map distances to real distances\n5. **Compass directions** - Describing relative positions using cardinal and intercardinal directions\n6. **Route planning** - Identifying logical routes between destinations\n\n**Common map-based exam questions:**\n- "Using the time zone map, calculate the arrival time in London if..."\n- "Identify the World Heritage Site marked X on the map of South Africa"\n- "Describe the location of destination A relative to destination B"\n- "Calculate the actual distance between two points using the scale"'),
  q(3, 'The Grade 12 Tourism examination is worth how many marks in total?',
    ['200 marks', '150 marks', '300 marks', '100 marks'], 0,
    'The Grade 12 Tourism final paper is worth 200 marks and is written over 3 hours.'),
  t(4, '### Key Tourism Terminology\n\n| Term | Definition |\n|------|----------|\n| **Inbound tourism** | Foreign visitors entering a country |\n| **Outbound tourism** | Residents leaving their country to visit another |\n| **Domestic tourism** | Residents travelling within their own country |\n| **Ecotourism** | Responsible travel to natural areas that conserves the environment |\n| **Heritage tourism** | Tourism focused on cultural, historical, and archaeological sites |\n| **Adventure tourism** | Tourism involving physical activity and outdoor experiences |\n| **Sustainable tourism** | Tourism that considers environmental, social, and economic impacts |\n| **Carrying capacity** | Maximum number of tourists an area can support without degradation |\n| **Leakage** | Tourism revenue that leaves the host country (e.g., profits going to foreign-owned hotels) |\n| **Multiplier effect** | The circulation of tourist spending through the economy |'),
  t(5, '### More Key Terms\n\n| Term | Definition |\n|------|----------|\n| **Infrastructure** | Roads, airports, water supply, electricity needed for tourism |\n| **Superstructure** | Hotels, restaurants, attractions built on infrastructure |\n| **Pull factor** | Attraction that draws tourists to a destination (e.g., wildlife, beaches) |\n| **Push factor** | Reason tourists want to leave home (e.g., cold weather, stress) |\n| **Tourist profile** | Description of a tourist (age, income, preferences, origin) |\n| **Seasonality** | Fluctuation in tourist numbers across different times of year |\n| **Niche tourism** | Specialised tourism (medical, culinary, dark, volunteerism) |\n| **SMME** | Small, Medium, and Micro Enterprise |\n| **BEE/B-BBEE** | Broad-Based Black Economic Empowerment (transformation policy) |\n| **CATHSSETA** | Culture, Arts, Tourism, Hospitality and Sport SETA |'),
  fb(6, '___ factors attract tourists to a destination, while ___ factors motivate tourists to leave home. Revenue that leaves the host country is called ___.',
    ['Pull', 'push', 'leakage'],
    'Pull factors draw tourists to a destination (attractions), push factors motivate them to travel (escape routine). Leakage is money leaving the local economy.'),
  t(7, '### Exam Tips for Grade 12 Tourism\n\n**General tips:**\n- Read each question carefully and underline key words\n- Pay attention to the mark allocation (1 mark = 1 point/fact, 2 marks = 2 points or 1 point with explanation)\n- Manage your time: approximately 1.5 minutes per mark\n- Answer ALL questions - never leave a question blank\n- For map questions, use the map legend and key provided\n\n**Section-specific tips:**\n\n**Section A (40 marks):**\n- Do not spend more than 30 minutes\n- Read all options before choosing in multiple choice\n- In matching columns, cross off answers as you use them\n\n**Section B (50 marks):**\n- Show all calculations clearly\n- Include units in answers (Rand, hours, km)\n- For time calculations, clearly show time zone conversions\n\n**Section C (60 marks):**\n- Use tourism terminology in your answers\n- Support statements with examples from South African tourism\n- Structure paragraph answers with an introduction, body, and conclusion\n\n**Section D (50 marks):**\n- Plan essay answers briefly before writing\n- Give balanced arguments (advantages AND disadvantages)\n- Use current examples and case studies\n- Conclude with your own opinion supported by facts'),
  q(8, 'How should you allocate your time in the Tourism exam?',
    ['Approximately 1.5 minutes per mark', '1 minute per mark', '2 minutes per mark', 'Spend equal time on each section'], 0,
    'With 200 marks in 180 minutes, you have approximately 0.9 minutes per mark, but allowing for reading time, 1.5 minutes per mark is a practical guide.'),
  t(9, '### Common Exam Mistakes to Avoid\n\n| Mistake | How to Avoid |\n|---------|-------------|\n| Confusing BSR and BBR | BSR = bank sells TO you (higher rate). BBR = bank buys FROM you (lower rate) |\n| Wrong time zone direction | East = ADD time, West = SUBTRACT time |\n| Forgetting DST | Check if the question specifies summer/winter for countries with DST |\n| Confusing domestic and regional tourism | Domestic = within your country. Regional = within your region (e.g., SADC) |\n| Mixing up push and pull factors | Push = why you LEAVE home. Pull = why you GO TO a destination |\n| Not using SA examples | Always include South African examples where possible |\n| Ignoring mark allocation | 4-mark question needs at least 4 valid points |\n| Not showing calculations | Always show working, not just the answer |'),
  q(10, 'A student writes that the BBR should be used when buying US Dollars for a trip to America. Is this correct?',
    ['No, the BSR (Bank Selling Rate) should be used when buying foreign currency', 'Yes, BBR is always used', 'It depends on the amount', 'Both rates are the same'], 0,
    'The BSR is used when the bank sells foreign currency to you. The BBR is used when the bank buys foreign currency back from you.'),
  fb(11, 'In the Tourism exam, Section B focuses on ___ work and tour planning. The exam is worth ___ marks in total, to be completed in ___ hours.',
    ['map', '200', '3'],
    'Section B (50 marks) tests map skills, time calculations, and tour planning. The full paper is 200 marks in 3 hours.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create Tourism subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Tourism/i, schoolId: SCHOOL_ID });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Tourism subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Tourism',
      code: 'TOU',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Tourism subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Domestic, Regional and International Tourism',
      description: 'Types of tourism, global events, political situations, unforeseen occurrences, and their impact on tourism.',
      order: 1,
      lessons: [
        { title: 'Domestic, Regional and International Tourism', description: 'Tourism types, global events (FIFA World Cup, Olympics), political situations, natural disasters, and their impact on tourism.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Map Work and Tour Planning',
      description: 'Tour itinerary concepts, route planning, types of itineraries, and map skills for tourism.',
      order: 2,
      lessons: [
        { title: 'Map Work and Tour Planning', description: 'Tour types, factors in planning, logical routes, itinerary types, map reading, and scale calculations.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Compiling a Day-by-Day Itinerary',
      description: 'Transport, accommodation, attractions, activities, meals, budget development, and practical itinerary compilation.',
      order: 3,
      lessons: [
        { title: 'Compiling a Day-by-Day Itinerary', description: 'Main aspects of itineraries, accommodation types, budget factors, developing tour budgets, and drawing up itineraries.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Health and Safety',
      description: 'WHO, vaccinations, malaria and bilharzia precautions, tourist safety, and travel insurance.',
      order: 4,
      lessons: [
        { title: 'Health and Safety in Tourism', description: 'WHO, health certificates, vaccinations, high-risk destination precautions, tourist safety, and travel insurance.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Travel Documentation',
      description: 'Passports, visas, customs regulations, duty-free allowances, green/red channels, and travel allowances.',
      order: 5,
      lessons: [
        { title: 'Travel Documentation', description: 'Passport and visa requirements, customs regulations, prohibited goods, green/red channels, and SARB travel allowances.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: World Time Zones',
      description: 'UTC, International Date Line, time zone calculations, daylight saving time, and jet lag.',
      order: 6,
      lessons: [
        { title: 'World Time Zones', description: 'UTC, Greenwich, hemispheres, time zone map, arrival/departure calculations, DST, and jet lag.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Tourist Attractions - World Heritage Sites',
      description: 'UNESCO, types of World Heritage Sites, SA World Heritage Sites, and famous world icons.',
      order: 7,
      lessons: [
        { title: 'World Heritage Sites and Famous Icons', description: 'UNESCO, natural/cultural/mixed sites, all 10 SA World Heritage Sites, map locations, and famous world icons.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Tourism Attractions and Marketing',
      description: 'Success factors for attractions, tourism statistics, marketing organisations, and branding SA.',
      order: 8,
      lessons: [
        { title: 'Tourism Attractions and Marketing', description: '8 As of tourism, domestic/regional/international statistics, SA Tourism, TOMSA, Tourism Indaba, and branding.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Foreign Exchange',
      description: 'GDP and tourism, BSR vs BBR, strong/weak Rand, multiplier effect, currency conversions, and exchange rate fluctuations.',
      order: 9,
      lessons: [
        { title: 'Foreign Exchange', description: 'GDP link to tourism, bank selling and buying rates, currency conversions, strong/weak Rand, and multiplier effect.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Sustainable and Responsible Tourism',
      description: 'Three pillars of sustainability, codes of conduct, environmental practices, responsible tourism, and CSI.',
      order: 10,
      lessons: [
        { title: 'Sustainable and Responsible Tourism', description: 'People/planet/profit, triple bottom line, reduce/reuse/recycle, Fair Trade Tourism, and CSI in tourism.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Communication and Customer Care',
      description: 'Customer feedback methods, analysing feedback, satisfaction, handling complaints, and action plans.',
      order: 11,
      lessons: [
        { title: 'Communication and Customer Care', description: 'Feedback methods (surveys, online reviews, SMS), analysing feedback, LEARN method for complaints, and action plans.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Tourism Sectors and Employment',
      description: 'Career opportunities, BCEA, employment contracts, labour laws, work ethics, and professional image.',
      order: 12,
      lessons: [
        { title: 'Tourism Sectors and Employment', description: 'Careers in tourism sectors, BCEA conditions, contract elements, LRA, EEA, work ethics, and code of conduct.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Revision and Exam Preparation',
      description: 'Paper structure, section breakdown, map work skills, key terminology, and exam tips.',
      order: 13,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Exam structure (200 marks, 3 hours), section breakdown, map skills, key terminology, and exam strategies.', blocks: ch13_lesson1, term: 4 },
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
    title: 'Grade 12 Tourism \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Domestic/Regional/International Tourism, Map Work, Tour Planning, Health and Safety, Travel Documentation, World Time Zones, World Heritage Sites, Marketing, Foreign Exchange, Sustainable Tourism, Customer Care, and Employment for the Grade 12 Tourism examination.',
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
  console.log('  TEXTBOOK: Grade 12 Tourism');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
