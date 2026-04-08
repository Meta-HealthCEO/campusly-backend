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

// ===============================================================================
// CHAPTER 1: Tourism Sectors - Transport (Term 1)
// ===============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Tourism Sectors: Transport\n\nTransport is one of the most important sectors of the tourism industry. Without efficient transport, tourists cannot reach their destinations. In South Africa, the transport sector includes **air**, **rail**, **road** and **water** transport.\n\n### Airports in South Africa\n\nSouth Africa has three major international airports:\n\n| Airport | IATA Code | City / Province |\n|---------|-----------|----------------|\n| **OR Tambo International Airport** | JNB | Johannesburg, Gauteng |\n| **Cape Town International Airport** | CPT | Cape Town, Western Cape |\n| **King Shaka International Airport** | DUR | Durban, KwaZulu-Natal |\n\nOther significant airports include:\n- **Lanseria International Airport** (HLA) near Johannesburg\n- **Bram Fischer International Airport** (BFN) in Bloemfontein\n- **Port Elizabeth Airport** (PLZ) in Gqeberha\n- **Kruger Mpumalanga International Airport** (MQP) near Nelspruit'),
  q(2, 'What is the IATA code for OR Tambo International Airport?',
    ['JNB', 'CPT', 'DUR', 'HLA'], 0,
    'OR Tambo International Airport in Johannesburg uses the IATA code JNB.'),
  t(3, '### Airlines in South Africa\n\nSouth Africa has a range of domestic and international airlines:\n\n| Airline | Type | Hub |\n|---------|------|-----|\n| **South African Airways (SAA)** | Full-service / national carrier | OR Tambo (JNB) |\n| **FlySafair** | Low-cost carrier | Lanseria / OR Tambo |\n| **Kulula** | Low-cost carrier | Lanseria |\n| **Lift** | Low-cost carrier | OR Tambo |\n| **Airlink** | Regional carrier | OR Tambo |\n| **CemAir** | Regional carrier | OR Tambo |\n\n### Types of Flights\n\n| Flight Type | Description |\n|-------------|-------------|\n| **Domestic flights** | Within South Africa (e.g., JNB to CPT) |\n| **Regional flights** | Between SA and SADC countries (e.g., JNB to Maputo) |\n| **International flights** | Between SA and countries outside SADC (e.g., JNB to London) |\n| **Direct flights** | No stops between departure and destination |\n| **Non-stop flights** | Flies directly without landing (same as direct for short routes) |\n| **Connecting flights** | Passenger changes aircraft at an intermediate airport |\n| **Charter flights** | Hired exclusively by a group, not a scheduled service |'),
  q(4, 'Which of the following is a low-cost carrier operating in South Africa?',
    ['FlySafair', 'South African Airways', 'Airlink', 'CemAir'], 0,
    'FlySafair is a popular low-cost carrier in South Africa, offering affordable domestic flights.'),
  fb(5, 'South African Airways is the ___ carrier of South Africa. A ___ flight means the passenger must change aircraft at an intermediate airport.',
    ['national', 'connecting'],
    'SAA is the national carrier. Connecting flights require a change of aircraft at a stopover point.'),
  t(6, '### Airline Terminology\n\nKey terms used in the airline industry:\n\n| Term | Meaning |\n|------|--------|\n| **IATA** | International Air Transport Association, sets global airline standards |\n| **ICAO** | International Civil Aviation Organization, UN agency for aviation safety |\n| **Check-in** | Process of registering for a flight and receiving a boarding pass |\n| **Boarding pass** | Document allowing a passenger to board the aircraft |\n| **Baggage allowance** | Maximum weight/number of bags permitted |\n| **Carry-on / hand luggage** | Small bag taken into the cabin |\n| **Economy class** | Standard, most affordable seating class |\n| **Business class** | Premium seating with extra legroom and services |\n| **First class** | Luxury seating with top-tier services |\n| **Code share** | Two airlines sharing the same flight under different flight numbers |\n| **Layover / stopover** | Waiting time between connecting flights |\n| **Transit passenger** | Passenger passing through an airport to catch a connecting flight |'),
  q(7, 'What does IATA stand for?',
    ['International Air Transport Association', 'International Airport and Travel Authority', 'International Aviation and Tourism Alliance', 'International Air Travel Agency'], 0,
    'IATA is the International Air Transport Association, which sets standards for the airline industry worldwide.'),
  t(8, '### Airport Procedures\n\nThe steps a passenger follows at an airport:\n\n**Departure:**\n1. **Arrive** at the airport (recommended 2 hours domestic, 3 hours international)\n2. **Check-in** at the airline counter or use self-service kiosks / online check-in\n3. **Baggage drop** for checked luggage\n4. **Security screening** (X-ray machines, body scanners, metal detectors)\n5. **Passport control / immigration** (international flights only)\n6. **Proceed to departure lounge** and wait at the gate\n7. **Boarding** when flight is called\n\n**Arrival:**\n1. **Disembark** the aircraft\n2. **Passport control / immigration** (international arrivals)\n3. **Baggage claim** at the carousel\n4. **Customs** (declare goods, green or red channel)\n5. **Exit** into arrivals hall\n\n### Technology at Airports\n\n- **Self-service check-in kiosks** reduce queuing time\n- **Biometric scanning** (fingerprints, facial recognition) speeds up security\n- **Electronic boarding passes** on smartphones\n- **Automated baggage handling** with RFID tracking\n- **Flight information display systems (FIDS)** showing departures and arrivals\n- **Free Wi-Fi** in terminals for passenger convenience'),
  q(9, 'How many hours before an international flight is it recommended to arrive at the airport?',
    ['3 hours', '1 hour', '2 hours', '4 hours'], 0,
    'For international flights, passengers should arrive at least 3 hours before departure to allow time for check-in, security, and immigration.'),
  fb(10, 'At the airport, passengers pass through ___ screening where X-ray machines scan hand luggage. On international flights, passengers must also pass through ___ control.',
    ['security', 'passport'],
    'Security screening checks for prohibited items. Passport/immigration control verifies travel documents for international travel.'),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Tourism Bus and Train Industry in South Africa\n\n### Rail Transport for Tourism\n\nSouth Africa has several notable rail services that serve tourism:\n\n| Train Service | Description |\n|--------------|-------------|\n| **Shosholoza Meyl** | Long-distance passenger rail service operated by PRASA; economy option connecting major cities (JNB-CPT, JNB-DUR, JNB-East London) |\n| **The Blue Train** | World-famous luxury train travelling between Pretoria and Cape Town (approximately 27 hours); 5-star service with fine dining and butler service |\n| **Rovos Rail** | Private luxury train company; known as the most luxurious train in the world; routes include Pretoria-Cape Town, Pretoria-Durban, and cross-border journeys to Victoria Falls and Dar es Salaam |\n| **Premier Classe** | PRASA premium service offering overnight travel between JNB and CPT with comfortable sleeper compartments |\n| **Gautrain** | High-speed commuter rail in Gauteng connecting OR Tambo Airport, Sandton, Pretoria, Rosebank and other stations; modern, efficient, and safe |'),
  q(2, 'Which South African train is often described as the most luxurious train in the world?',
    ['Rovos Rail', 'The Blue Train', 'Gautrain', 'Shosholoza Meyl'], 0,
    'Rovos Rail is widely regarded as the most luxurious train in the world, offering opulent suites and fine dining.'),
  t(3, '### The Gautrain\n\nThe Gautrain is a rapid rail network in Gauteng province:\n\n**Key facts:**\n- Opened in 2010, ahead of the FIFA World Cup\n- Connects **OR Tambo International Airport** to Sandton in about 15 minutes\n- Runs between **Hatfield (Pretoria)** and **Park Station (Johannesburg)** with stops at Centurion, Midrand, Marlboro, Sandton, Rosebank, and OR Tambo\n- Maximum speed of approximately **160 km/h**\n- Uses the **Gautrain Gold Card** for ticketing\n- Offers **Gautrain bus services** connecting stations to surrounding areas\n\n**Benefits for tourism:**\n- Fast, safe, and reliable transport for tourists arriving at OR Tambo\n- Reduces congestion and road travel time in Gauteng\n- World-class public transport infrastructure\n- Easy connection between Johannesburg and Pretoria attractions'),
  q(4, 'In what year did the Gautrain begin operating?',
    ['2010', '2006', '2014', '2008'], 0,
    'The Gautrain opened in 2010, timed to serve visitors during the FIFA World Cup hosted in South Africa.'),
  fb(5, 'The Blue Train travels between ___ and Cape Town. The Gautrain uses a ___ Card for ticketing.',
    ['Pretoria', 'Gold'],
    'The Blue Train runs between Pretoria and Cape Town. The Gautrain uses the Gautrain Gold Card system.'),
  t(6, '### Bus Transport for Tourism\n\nSouth Africa has several bus companies serving tourists and long-distance travellers:\n\n| Company | Type | Routes |\n|---------|------|--------|\n| **Greyhound** | Long-distance luxury | Major city-to-city routes |\n| **Intercape** | Long-distance | Extensive network across SA and to neighbouring countries |\n| **Translux** | Long-distance luxury | Major city routes |\n| **City Sightseeing** | Hop-on hop-off tourist bus | Cape Town, Johannesburg, Durban |\n| **Baz Bus** | Backpacker shuttle | Door-to-door hostel service along the coast |\n\nBus transport is an affordable option for tourists, especially backpackers. The **Baz Bus** is unique because it picks up and drops off passengers directly at hostels.'),
  t(7, '### Car Rental\n\nCar rental is a popular transport option for tourists who want flexibility:\n\n**Major car rental companies in SA:**\n- Avis\n- Budget\n- Europcar\n- Hertz\n- First Car Rental\n- Tempest\n\n**Requirements:**\n- Valid driving licence (international visitors may need an International Driving Permit)\n- Minimum age usually 23 years\n- Credit card for deposit\n- Additional driver fees may apply\n\n**Considerations for tourists:**\n- South Africa drives on the **left side** of the road\n- Fuel prices are regulated by government\n- GPS navigation recommended\n- Be aware of toll roads (e-toll in Gauteng, toll plazas on national routes)\n- Road conditions vary; some rural roads are unpaved'),
  q(8, 'On which side of the road do vehicles drive in South Africa?',
    ['Left side', 'Right side', 'It varies by province', 'Either side'], 0,
    'South Africa follows the left-hand traffic system, meaning vehicles drive on the left side of the road.'),
  fb(9, 'The ___ Bus is a unique backpacker shuttle service that picks up and drops off passengers directly at hostels. Tourists hiring a car in South Africa need a valid driving ___ and usually a credit card.',
    ['Baz', 'licence'],
    'The Baz Bus is a door-to-door backpacker service. A valid driving licence (and sometimes an International Driving Permit) is required for car rental.'),
  q(10, 'Which of the following is NOT a long-distance bus company in South Africa?',
    ['City Sightseeing', 'Intercape', 'Greyhound', 'Translux'], 0,
    'City Sightseeing operates hop-on hop-off tourist buses in cities, not long-distance routes. Intercape, Greyhound, and Translux are long-distance operators.'),
];

// ===============================================================================
// CHAPTER 2: Domestic, Regional and International Tourism (Term 2)
// ===============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Domestic, Regional and International Tourism\n\n### Definitions\n\n| Term | Meaning |\n|------|--------|\n| **Domestic tourism** | Travel within your own country for leisure, business, or other purposes |\n| **Regional tourism** | Travel between countries within the same geographic region (e.g., SADC countries) |\n| **International tourism** | Travel between countries in different regions of the world |\n| **Inbound tourism** | Foreign visitors entering a country |\n| **Outbound tourism** | Residents leaving their country to travel abroad |\n\n### Domestic Tourism Growth Strategy (DTGS)\n\nThe **Domestic Tourism Growth Strategy** is a South African government initiative to grow domestic tourism. It aims to:\n\n- Encourage South Africans to travel within their own country\n- Create a **culture of travel** among all income groups\n- Promote lesser-known destinations beyond major cities\n- Support local tourism businesses and create employment\n- Reduce the impact of fluctuations in international tourism arrivals\n\nThe DTGS recognises that domestic tourists are the **backbone** of the tourism industry, providing consistent revenue even when international arrivals decline.'),
  q(2, 'What is the main goal of the Domestic Tourism Growth Strategy (DTGS)?',
    ['To encourage South Africans to travel within their own country', 'To attract more international tourists', 'To reduce the number of domestic tourists', 'To promote outbound tourism'], 0,
    'The DTGS aims to grow domestic tourism by encouraging South Africans to explore and travel within their own country.'),
  t(3, '### Five Domestic Market Segments\n\nSA Tourism has identified five key domestic market segments:\n\n| Segment | Description | Travel Behaviour |\n|---------|-------------|------------------|\n| **Young and upcoming** | Young adults (18-24), students and early career | Budget travel, backpacking, adventure, social media-driven |\n| **Independent young couples/families** | Young professionals and young families | Self-drive holidays, child-friendly destinations |\n| **Striving families** | Middle-income families with children | Value-for-money holidays, caravan parks, visiting friends/relatives (VFR) |\n| **Well-off homely couples** | Older couples, empty nesters, higher income | Comfort-focused, cultural experiences, weekend getaways |\n| **Home-based low-income** | Lower-income households | VFR travel (visiting friends and relatives), day trips, local attractions |\n\nThe largest domestic market segment is **visiting friends and relatives (VFR)**, which accounts for the majority of domestic trips in South Africa.'),
  q(4, 'Which domestic market segment is the largest in South Africa?',
    ['Visiting friends and relatives (VFR)', 'Young and upcoming', 'Independent young couples', 'Well-off homely couples'], 0,
    'VFR (visiting friends and relatives) is the dominant form of domestic tourism in SA, accounting for the majority of trips.'),
  fb(5, 'The DTGS stands for ___. The largest category of domestic tourism in South Africa is ___ travel.',
    ['Domestic Tourism Growth Strategy', 'VFR'],
    'DTGS is the Domestic Tourism Growth Strategy. VFR (visiting friends and relatives) dominates domestic travel.'),
  t(6, '### Culture and Heritage Tourism\n\n**Culture and heritage tourism** involves travelling to experience the cultural life and history of a destination. South Africa is exceptionally rich in cultural diversity:\n\n**SA Cultural Uniqueness:**\n- Known as the **Rainbow Nation** with 11 official languages\n- Diverse cultural groups: Zulu, Xhosa, Sotho, Tswana, Pedi, Venda, Tsonga, Swazi, Ndebele, Afrikaans, English-speaking\n- Rich history including the struggle against apartheid\n- Unique cultural villages and living heritage experiences\n- Traditional cuisine, music, dance, and art\n\n**Examples of cultural and heritage attractions:**\n- Robben Island (Cape Town)\n- Apartheid Museum (Johannesburg)\n- Cradle of Humankind (Gauteng)\n- Mapungubwe Cultural Landscape (Limpopo)\n- uKhahlamba-Drakensberg San rock art (KZN)\n- Zulu cultural villages (KZN)\n- Bo-Kaap (Cape Town)'),
  q(7, 'South Africa is often called the Rainbow Nation because of its:',
    ['Cultural diversity with 11 official languages', 'Colourful landscapes', 'Rainbow-shaped coastline', 'Multi-coloured national flag'], 0,
    'South Africa is called the Rainbow Nation because of its rich cultural diversity, symbolised by its 11 official languages.'),
  t(8, '### Heritage Sites and SAHRA\n\n**SAHRA** stands for the **South African Heritage Resources Agency**. It is the national body responsible for:\n\n- Identifying, protecting, and managing heritage resources in South Africa\n- Grading heritage sites (Grade I = national, Grade II = provincial, Grade III = local)\n- Ensuring compliance with the **National Heritage Resources Act (Act 25 of 1999)**\n- Maintaining the national heritage register\n\n**South African World Heritage Sites (UNESCO):**\n\n| Site | Province | Type |\n|------|----------|------|\n| Robben Island | Western Cape | Cultural |\n| Cradle of Humankind | Gauteng / North West | Cultural |\n| Mapungubwe Cultural Landscape | Limpopo | Cultural |\n| Richtersveld Cultural and Botanical Landscape | Northern Cape | Mixed |\n| iSimangaliso Wetland Park | KwaZulu-Natal | Natural |\n| uKhahlamba-Drakensberg Park | KwaZulu-Natal | Mixed |\n| Cape Floral Region Protected Areas | Western Cape / Eastern Cape | Natural |\n| Vredefort Dome | Free State / North West | Natural |\n| Barberton Makhonjwa Mountains | Mpumalanga | Natural |\n| Khomani Cultural Landscape | Northern Cape | Cultural |'),
  q(9, 'What does SAHRA stand for?',
    ['South African Heritage Resources Agency', 'South African Historical Research Authority', 'South African Heritage and Recreation Agency', 'South African Humanities Research Agency'], 0,
    'SAHRA is the South African Heritage Resources Agency, responsible for protecting heritage resources nationally.'),
  fb(10, 'SAHRA operates under the National Heritage Resources Act of ___. Heritage sites are graded into three levels: Grade I (national), Grade II (___), and Grade III (local).',
    ['1999', 'provincial'],
    'The National Heritage Resources Act (Act 25 of 1999) governs heritage protection. Grade II sites are of provincial significance.'),
  t(11, '### Provincial Heritage Agencies\n\nEach province in South Africa has its own **Provincial Heritage Resources Authority (PHRA)** responsible for Grade II heritage sites:\n\n| Province | Heritage Agency |\n|----------|----------------|\n| Gauteng | Provincial Heritage Resources Authority Gauteng (PHRAG) |\n| Western Cape | Heritage Western Cape (HWC) |\n| KwaZulu-Natal | Amafa aKwaZulu-Natali (Amafa) |\n| Eastern Cape | Eastern Cape Provincial Heritage Resources Authority (ECPHRA) |\n| Free State | Free State Provincial Heritage Resources Authority |\n| Limpopo | Limpopo Heritage Resources Authority (LIHRA) |\n| Mpumalanga | Mpumalanga Provincial Heritage Resources Authority |\n| North West | North West Provincial Heritage Resources Authority |\n| Northern Cape | Northern Cape Provincial Heritage Resources Authority |\n\nThese agencies work alongside SAHRA to ensure that heritage resources are protected at all levels of government.'),
  q(12, 'Which heritage agency is responsible for heritage sites in KwaZulu-Natal?',
    ['Amafa aKwaZulu-Natali', 'Heritage Western Cape', 'PHRAG', 'LIHRA'], 0,
    'Amafa aKwaZulu-Natali (commonly known as Amafa) is the provincial heritage agency for KwaZulu-Natal.'),
];

// ===============================================================================
// CHAPTER 3: Marketing (Term 2)
// ===============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Marketing in Tourism\n\n### Marketing Concepts\n\nMarketing is the process of identifying, anticipating, and satisfying customer needs profitably. In tourism, marketing involves promoting destinations, attractions, and services to potential tourists.\n\n**The 4 Ps of Marketing (Marketing Mix):**\n\n| Element | Description | Tourism Example |\n|---------|-------------|----------------|\n| **Product** | What is being sold | A safari package, hotel stay, cultural tour |\n| **Price** | The cost to the customer | R12 000 per person for a 3-night safari |\n| **Place** | Where and how the product is distributed | Travel agencies, online booking platforms |\n| **Promotion** | How the product is communicated to customers | Advertising, social media, brochures |\n\nIn tourism, three additional Ps are often included:\n- **People** (staff quality and customer service)\n- **Process** (booking and service delivery systems)\n- **Physical evidence** (tangible elements like brochures, hotel decor, uniforms)'),
  q(2, 'The 4 Ps of marketing are Product, Price, Place, and:',
    ['Promotion', 'People', 'Process', 'Planning'], 0,
    'The 4 Ps of the marketing mix are Product, Price, Place, and Promotion.'),
  t(3, '### Target Markets\n\nA **target market** is the specific group of consumers a business aims to reach with its products and marketing efforts.\n\n**How to identify a target market:**\n- **Demographics**: Age, gender, income level, family status, occupation\n- **Geographics**: Where they live (local, regional, international)\n- **Psychographics**: Lifestyle, interests, values, personality\n- **Behavioural**: Travel habits, spending patterns, brand loyalty\n\n**Examples in tourism:**\n\n| Product | Target Market |\n|---------|---------------|\n| Luxury safari lodge | High-income international tourists, honeymooners |\n| Backpackers hostel | Young budget travellers, students |\n| Family resort | Middle-income families with children |\n| Cultural village tour | Heritage tourists, school groups |\n| Adventure bungee jumping | Young thrill-seekers, ages 18-35 |'),
  q(4, 'Identifying a target market based on lifestyle and interests falls under which category?',
    ['Psychographics', 'Demographics', 'Geographics', 'Behavioural'], 0,
    'Psychographics includes lifestyle, interests, values, and personality traits used to define a target market.'),
  t(5, '### Promotional Techniques\n\nPromotional techniques are divided into **above-the-line (ATL)** and **below-the-line (BTL)** marketing:\n\n**Above-the-line (ATL) marketing** uses mass media to reach a broad audience:\n\n| Medium | Advantage | Disadvantage |\n|--------|-----------|-------------|\n| **Television** | Wide reach, visual impact | Very expensive, not targeted |\n| **Radio** | Affordable, regional targeting | No visual element |\n| **Newspapers** | Credible, can be kept for reference | Short lifespan, declining readership |\n| **Magazines** | Glossy visually appealing, targeted readers | Long lead time, expensive |\n| **Billboards / outdoor** | High visibility, 24/7 exposure | Limited message, location-dependent |\n\n**Below-the-line (BTL) marketing** uses targeted, direct methods:\n\n| Method | Description |\n|--------|-------------|\n| **Social media** | Facebook, Instagram, TikTok campaigns; cost-effective, highly targeted |\n| **Brochures and flyers** | Distributed at travel expos, information centres |\n| **Email marketing** | Direct newsletters to customer databases |\n| **Travel expos and exhibitions** | Tourism Indaba, World Travel Market |\n| **Loyalty programmes** | Reward repeat customers (e.g., airline frequent flyer programmes) |\n| **Sponsorships** | Supporting events in exchange for brand exposure |\n| **Public relations (PR)** | Media coverage, press releases, influencer trips |'),
  q(6, 'Which of the following is an example of above-the-line marketing?',
    ['Television advertising', 'Email marketing', 'Travel expos', 'Loyalty programmes'], 0,
    'Television advertising is above-the-line because it uses mass media to reach a broad audience.'),
  fb(7, 'Marketing that uses mass media like TV and radio is called ___-the-line marketing. Marketing that uses targeted methods like social media and brochures is called ___-the-line marketing.',
    ['above', 'below'],
    'Above-the-line uses mass media. Below-the-line uses direct, targeted promotional methods.'),
  t(8, '### Marketing Budget\n\nA **marketing budget** is the amount of money allocated for all marketing activities. Key considerations:\n\n**Factors affecting the marketing budget:**\n- Size of the business\n- Target audience (local vs international reach)\n- Type of promotion chosen (ATL is more expensive than BTL)\n- Competition in the market\n- Season (more spending during off-peak to boost demand)\n- Expected return on investment (ROI)\n\n**Budget allocation principles:**\n- Larger businesses can afford ATL methods (TV, billboards)\n- Small tourism businesses often rely on BTL methods (social media, word of mouth)\n- Digital marketing offers high reach at lower cost compared to traditional media\n- Track ROI to ensure marketing spend generates bookings'),
  q(9, 'Why might a small tourism business prefer below-the-line marketing?',
    ['It is more affordable and targeted', 'It reaches the widest possible audience', 'It is required by law', 'It is the most prestigious form of marketing'], 0,
    'BTL marketing is more cost-effective and allows small businesses to target specific audiences within their budget.'),
  t(10, '### Tourism Marketing Bodies in South Africa\n\nSeveral organisations are responsible for marketing South Africa as a tourism destination:\n\n| Organisation | Role |\n|-------------|------|\n| **SA Tourism** | National tourism marketing organisation; promotes SA domestically and internationally; campaigns include Sho\'t Left |\n| **Tourism Grading Council of South Africa (TGCSA)** | Grades and rates accommodation establishments (star grading system) |\n| **TOMSA (Tourism Marketing South Africa)** | Collects a tourism marketing levy from the private sector to fund marketing |\n| **Provincial tourism authorities** | Each province has its own tourism authority promoting provincial attractions |\n| **Local tourism offices / visitor centres** | Provide information and assistance to tourists at local level |\n| **Tourism Indaba** | Annual travel trade show held in Durban, one of the largest in Africa |'),
  q(11, 'Which organisation is responsible for star-grading accommodation in South Africa?',
    ['Tourism Grading Council of South Africa (TGCSA)', 'SA Tourism', 'TOMSA', 'Tourism Indaba'], 0,
    'The TGCSA is responsible for the quality grading of tourism accommodation using the star rating system.'),
  fb(12, 'SA Tourism runs the domestic campaign called ___. TOMSA stands for ___ and collects a marketing levy from the tourism private sector.',
    ['Sho\'t Left', 'Tourism Marketing South Africa'],
    'Sho\'t Left encourages domestic travel. TOMSA collects a levy used to fund tourism marketing campaigns.'),
];

// ===============================================================================
// CHAPTER 4: Tourism Attractions - SADC Countries (Term 2)
// ===============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Tourism Attractions: SADC Countries\n\n### Regional Tourism and SADC\n\nThe **Southern African Development Community (SADC)** is a regional economic bloc that promotes cooperation among member states, including tourism development.\n\n### SADC Member Countries\n\nThere are **16 SADC member states**:\n\n| Country | Capital | Gateway Attraction |\n|---------|---------|--------------------|\n| **Angola** | Luanda | Kalandula Falls |\n| **Botswana** | Gaborone | Okavango Delta, Chobe National Park |\n| **Comoros** | Moroni | Volcanic islands, marine biodiversity |\n| **DRC (Congo)** | Kinshasa | Virunga National Park (mountain gorillas) |\n| **Eswatini** | Mbabane | Hlane Royal National Park, Swazi culture |\n| **Lesotho** | Maseru | Maloti Mountains, Sani Pass |\n| **Madagascar** | Antananarivo | Unique lemurs and biodiversity |\n| **Malawi** | Lilongwe | Lake Malawi (UNESCO site) |\n| **Mauritius** | Port Louis | Beaches, Le Morne Cultural Landscape |\n| **Mozambique** | Maputo | Bazaruto Archipelago, beaches |\n| **Namibia** | Windhoek | Sossusvlei, Etosha, Fish River Canyon |\n| **Seychelles** | Victoria | Vallee de Mai, pristine beaches |\n| **South Africa** | Pretoria | Kruger NP, Table Mountain, Cape Winelands |\n| **Tanzania** | Dodoma | Serengeti, Kilimanjaro, Zanzibar |\n| **Zambia** | Lusaka | Victoria Falls, South Luangwa NP |\n| **Zimbabwe** | Harare | Victoria Falls, Great Zimbabwe, Hwange NP |'),
  q(2, 'How many member states does SADC have?',
    ['16', '12', '14', '18'], 0,
    'SADC has 16 member states across southern and eastern Africa.'),
  t(3, '### World Heritage Sites in SADC\n\nSeveral SADC countries have UNESCO World Heritage Sites that serve as major tourism gateways:\n\n| Country | World Heritage Site | Type |\n|---------|-------------------|------|\n| **Botswana** | Okavango Delta | Natural |\n| **Botswana** | Tsodilo Hills | Cultural |\n| **DRC** | Virunga National Park | Natural |\n| **Madagascar** | Tsingy de Bemaraha | Natural |\n| **Malawi** | Lake Malawi National Park | Natural |\n| **Mauritius** | Le Morne Cultural Landscape | Cultural |\n| **Mozambique** | Island of Mozambique | Cultural |\n| **Namibia** | Twyfelfontein | Cultural |\n| **Tanzania** | Serengeti National Park | Natural |\n| **Tanzania** | Mount Kilimanjaro | Natural |\n| **Tanzania** | Ruins of Kilwa Kisiwani and Songo Mnara | Cultural |\n| **Zambia / Zimbabwe** | Mosi-oa-Tunya / Victoria Falls | Natural |\n| **Zimbabwe** | Great Zimbabwe National Monument | Cultural |\n| **Zimbabwe** | Mana Pools National Park | Natural |'),
  q(4, 'Victoria Falls is a shared World Heritage Site between which two countries?',
    ['Zambia and Zimbabwe', 'Botswana and Namibia', 'Mozambique and Tanzania', 'Malawi and Zambia'], 0,
    'Victoria Falls (Mosi-oa-Tunya) is shared between Zambia and Zimbabwe as a transboundary World Heritage Site.'),
  fb(5, 'The Okavango Delta, a UNESCO World Heritage Site, is located in ___. Mount Kilimanjaro, the tallest mountain in Africa, is found in ___.',
    ['Botswana', 'Tanzania'],
    'The Okavango Delta is in Botswana. Mount Kilimanjaro (5,895 m) is in Tanzania.'),
  t(6, '### Locating SADC Countries on a Map\n\nFor the Tourism exam, you must be able to locate all SADC countries on a map of Africa.\n\n**Key geographic facts:**\n\n- **Island states**: Madagascar, Mauritius, Comoros, Seychelles (all in the Indian Ocean)\n- **Landlocked countries**: Botswana, Lesotho, Eswatini, Malawi, Zambia, Zimbabwe\n- **Countries bordering SA**: Namibia, Botswana, Zimbabwe, Mozambique, Eswatini, Lesotho\n- **Lesotho** is completely surrounded by South Africa (an enclave)\n\n**Tourism corridors in SADC:**\n- **Maputo Development Corridor**: Johannesburg to Maputo (Mozambique)\n- **Trans-Kalahari Corridor**: Gauteng to Walvis Bay (Namibia)\n- **North-South Corridor**: Durban to Dar es Salaam (Tanzania)\n\nRegional tourism is growing as SADC countries work together to create multi-destination travel packages and simplify border crossing procedures through initiatives like the **UNIVISA** concept.'),
  q(7, 'Which SADC country is completely surrounded by South Africa?',
    ['Lesotho', 'Eswatini', 'Botswana', 'Mozambique'], 0,
    'Lesotho is an enclave, completely surrounded by South Africa on all sides.'),
  t(8, '### Benefits of Regional Tourism in SADC\n\n**Economic benefits:**\n- Creates employment across the region\n- Generates foreign exchange earnings\n- Develops infrastructure (roads, airports, hotels)\n- Supports small businesses and community tourism\n\n**Social benefits:**\n- Cultural exchange and understanding\n- Preservation of cultural heritage sites\n- Skills development and training\n- Improved quality of life for host communities\n\n**Environmental benefits:**\n- Conservation of natural areas through tourism revenue\n- Trans-frontier conservation areas (e.g., Great Limpopo Transfrontier Park: SA, Mozambique, Zimbabwe)\n- Awareness of environmental issues\n\n**Challenges:**\n- Visa requirements and border delays\n- Safety and security concerns\n- Poor infrastructure in some areas\n- Limited marketing budgets\n- Political instability in certain countries'),
  q(9, 'The Great Limpopo Transfrontier Park spans which three countries?',
    ['South Africa, Mozambique, and Zimbabwe', 'Botswana, Namibia, and Zambia', 'Tanzania, Malawi, and Mozambique', 'South Africa, Botswana, and Zimbabwe'], 0,
    'The Great Limpopo Transfrontier Park links Kruger (SA), Limpopo (Mozambique), and Gonarezhou (Zimbabwe).'),
  fb(10, 'SADC has ___ island member states in the Indian Ocean. The UNIVISA concept aims to simplify ___ crossing procedures for tourists travelling in the SADC region.',
    ['four', 'border'],
    'The four island states are Madagascar, Mauritius, Comoros, and Seychelles. The UNIVISA simplifies border crossings for regional tourists.'),
];

// ===============================================================================
// CHAPTER 5: Foreign Exchange (Term 3)
// ===============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Foreign Exchange\n\n### Currencies: Local and Foreign\n\nEvery country has its own currency. Tourists must exchange their home currency for the currency of the country they are visiting.\n\n**South African currency:** South African Rand (ZAR), symbol **R**\n\n**Important world currencies:**\n\n| Country / Region | Currency | Symbol / Code |\n|-----------------|----------|---------------|\n| South Africa | Rand | R / ZAR |\n| United States | Dollar | $ / USD |\n| United Kingdom | Pound Sterling | GBP |\n| European Union | Euro | EUR |\n| Japan | Yen | JPY |\n| China | Yuan / Renminbi | CNY |\n| Botswana | Pula | BWP |\n| Mozambique | Metical | MZN |\n| Kenya | Shilling | KES |\n| India | Rupee | INR |\n| Australia | Dollar | AUD |\n| Brazil | Real | BRL |'),
  q(2, 'What is the currency of Botswana?',
    ['Pula', 'Rand', 'Dollar', 'Shilling'], 0,
    'The currency of Botswana is the Pula (BWP).'),
  t(3, '### Exchange Rate Concepts\n\nThe **exchange rate** is the value of one currency expressed in terms of another currency.\n\n**Key concepts:**\n\n| Term | Definition |\n|------|------------|\n| **Exchange rate** | The price of one currency in terms of another |\n| **Bank Selling Rate (BSR)** | The rate at which the bank SELLS foreign currency to you (higher rate, more expensive for you) |\n| **Bank Buying Rate (BBR)** | The rate at which the bank BUYS foreign currency from you (lower rate, less money for you) |\n| **Spread** | The difference between BSR and BBR (this is the bank profit) |\n| **Commission** | A fee charged by the bank for the transaction |\n\n**Remember:**\n- When you are **leaving SA** (buying foreign currency), the bank uses the **BSR** (selling to you) - you get fewer foreign units\n- When you are **returning to SA** (selling foreign currency), the bank uses the **BBR** (buying from you) - you get fewer Rands back\n- The bank ALWAYS profits from the spread'),
  q(4, 'If you are a South African tourist buying US Dollars for a trip abroad, which rate will the bank use?',
    ['Bank Selling Rate (BSR)', 'Bank Buying Rate (BBR)', 'The average of BSR and BBR', 'The official government rate'], 0,
    'When you buy foreign currency from a bank, they use the BSR (Bank Selling Rate), which is the higher rate.'),
  fb(5, 'The rate at which a bank sells foreign currency to a customer is the ___. The difference between the BSR and BBR is called the ___, which represents the bank profit.',
    ['Bank Selling Rate', 'spread'],
    'BSR is the rate the bank sells foreign currency at. The spread (BSR minus BBR) is how the bank makes its profit.'),
  t(6, '### Converting Currencies\n\n**Buying foreign currency (leaving SA):**\nYou divide by the BSR to find how much foreign currency you receive.\n\nFormula: Foreign amount = Rand amount / BSR\n\n**Example:** You have R10 000 and the BSR for USD is R18.50.\nUSD received = R10 000 / R18.50 = $540.54\n\n**Selling foreign currency (returning to SA):**\nYou multiply by the BBR to find how many Rands you receive.\n\nFormula: Rand amount = Foreign amount x BBR\n\n**Example:** You return with $200 and the BBR for USD is R17.80.\nRands received = $200 x R17.80 = R3 560\n\n**Key calculation steps:**\n1. Identify whether you are BUYING or SELLING foreign currency\n2. Use BSR (buying foreign) or BBR (selling foreign)\n3. Apply the correct formula\n4. Subtract commission if applicable'),
  q(7, 'A tourist returns to SA with 500 Euros. The BBR for Euros is R19.20. How many Rands will the tourist receive (before commission)?',
    ['R9 600', 'R26.04', 'R9 200', 'R10 000'], 0,
    'Selling foreign currency: Rands = Foreign amount x BBR = 500 x R19.20 = R9 600.'),
  fb(8, 'When buying foreign currency, you ___ the Rand amount by the BSR. When selling foreign currency back to Rands, you ___ the foreign amount by the BBR.',
    ['divide', 'multiply'],
    'Buying: divide Rands by BSR. Selling: multiply foreign amount by BBR.'),
  t(9, '### Strong Rand vs Weak Rand\n\nThe value of the Rand relative to other currencies has significant implications for tourism:\n\n| Scenario | Exchange Rate Example | Impact |\n|----------|----------------------|--------|\n| **Strong Rand** | $1 = R14 | SA tourists benefit (cheaper to travel abroad). Fewer international tourists come (SA becomes expensive for them) |\n| **Weak Rand** | $1 = R20 | SA tourists suffer (expensive to travel abroad). More international tourists come (SA becomes a bargain destination) |\n\n**Impact on South African tourism:**\n- A **weak Rand** is generally GOOD for inbound tourism (international visitors get more value)\n- A **weak Rand** is BAD for outbound tourism (South Africans pay more abroad)\n- A **strong Rand** benefits South Africans travelling abroad but makes SA expensive for foreign visitors\n\n**Current context:** The Rand has been relatively weak against major currencies, which has helped make South Africa an attractive and affordable destination for international tourists.'),
  q(10, 'A weak Rand is generally good for which type of tourism in South Africa?',
    ['Inbound tourism (international visitors coming to SA)', 'Outbound tourism (South Africans travelling abroad)', 'Domestic tourism within SA', 'None of the above'], 0,
    'A weak Rand makes SA affordable for international tourists, boosting inbound tourism.'),
  t(11, '### The Multiplier Effect\n\nThe **multiplier effect** explains how money spent by tourists circulates through the economy, creating a ripple effect that multiplies the original spending.\n\n**How it works:**\n1. A tourist pays **R1 000** at a hotel\n2. The hotel uses part of that to pay **staff wages** (R400)\n3. Staff spend their wages at local **shops and restaurants** (R300)\n4. The shops pay their **suppliers** (R200)\n5. Suppliers pay their **workers**, who spend at local businesses\n6. And so on...\n\nThe original R1 000 generates far more than R1 000 in total economic activity.\n\n**Benefits of the multiplier effect:**\n- Creates employment at multiple levels\n- Supports businesses beyond the tourism sector\n- Generates tax revenue for government\n- Develops local economies\n- Reduces poverty through income distribution\n\n**Leakage** occurs when tourist money leaves the local economy (e.g., paying for imported goods, foreign-owned hotels repatriating profits). This reduces the multiplier effect.'),
  q(12, 'What is leakage in the context of the tourism multiplier effect?',
    ['When tourist spending leaves the local economy', 'When tourists avoid paying entrance fees', 'When a hotel has a water leak', 'When currency loses value'], 0,
    'Leakage occurs when money spent by tourists leaves the local economy, such as through imports or foreign-owned businesses repatriating profits.'),
];

// ===============================================================================
// CHAPTER 6: Communication and Customer Care (Term 3)
// ===============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Communication and Customer Care\n\n### Communication Technology in Tourism\n\nTechnology has transformed how the tourism industry communicates with customers:\n\n| Technology | Use in Tourism |\n|-----------|----------------|\n| **Websites** | Online booking, destination information, virtual tours |\n| **Social media** | Marketing (Instagram, Facebook, TikTok), customer engagement, reviews |\n| **Email** | Booking confirmations, newsletters, customer correspondence |\n| **Mobile apps** | Airline check-in, hotel booking, navigation, translation |\n| **GDS (Global Distribution System)** | Amadeus, Galileo, Sabre - used by travel agents to book flights, hotels, car hire |\n| **CRS (Computer Reservation System)** | Internal booking systems used by airlines and hotels |\n| **GPS / navigation** | Route planning, location-based services |\n| **Virtual reality (VR)** | Virtual destination previews, virtual hotel room tours |\n| **Chatbots / AI** | Automated customer service, 24/7 query handling |'),
  q(2, 'Amadeus, Galileo, and Sabre are examples of:',
    ['Global Distribution Systems (GDS)', 'Social media platforms', 'Airline companies', 'Mobile applications'], 0,
    'Amadeus, Galileo, and Sabre are Global Distribution Systems used by travel agents for booking flights, hotels, and car hire.'),
  t(3, '### Verbal and Written Communication\n\n**Verbal communication** involves spoken interaction:\n\n**Skills for effective verbal communication in tourism:**\n- Speak clearly and at an appropriate pace\n- Use a friendly, professional tone\n- Listen actively (give full attention, do not interrupt)\n- Use the customer name where possible\n- Avoid jargon and slang\n- Be patient with language barriers\n- Maintain positive body language (smile, eye contact, open posture)\n\n**Written communication** includes emails, letters, reports, and social media posts:\n\n**Principles of good written communication:**\n- Use correct grammar, spelling, and punctuation\n- Be clear and concise\n- Use a professional and polite tone\n- Include all necessary information\n- Proofread before sending\n- Use appropriate format (formal letter for complaints, informal for social media)'),
  q(4, 'Which of the following is NOT an example of positive body language in customer interaction?',
    ['Crossing arms and avoiding eye contact', 'Smiling', 'Maintaining eye contact', 'Open posture'], 0,
    'Crossing arms and avoiding eye contact conveys defensiveness and disinterest, which is negative body language.'),
  t(5, '### Customer Complaints: The Six-Step Process\n\nHandling customer complaints effectively is critical in tourism. Follow these six steps:\n\n**Step 1: LISTEN**\n- Give the customer your full attention\n- Do not interrupt or argue\n- Show empathy and understanding\n\n**Step 2: APOLOGISE**\n- Say sorry for the inconvenience (even if it is not your fault)\n- Acknowledge the customer feelings\n\n**Step 3: FIND A SOLUTION**\n- Ask the customer what outcome they expect\n- Offer realistic solutions or alternatives\n- Involve a manager if necessary\n\n**Step 4: ACT QUICKLY**\n- Resolve the issue as fast as possible\n- Do not pass the customer from person to person unnecessarily\n\n**Step 5: FOLLOW UP**\n- Contact the customer to confirm they are satisfied\n- Ensure the solution was implemented\n\n**Step 6: RECORD AND LEARN**\n- Document the complaint for future reference\n- Analyse complaints to identify recurring issues\n- Use feedback to improve service'),
  q(6, 'What is the first step in handling a customer complaint?',
    ['Listen to the customer', 'Apologise immediately', 'Find a solution', 'Call the manager'], 0,
    'The first step is to listen to the customer fully, giving them your undivided attention without interrupting.'),
  fb(7, 'When handling a complaint, the second step after listening is to ___. The final step is to ___ the complaint and learn from it to improve future service.',
    ['apologise', 'record'],
    'Step 2 is to apologise sincerely. Step 6 is to record the complaint and use it to improve service delivery.'),
  t(8, '### Service Excellence\n\nService excellence means consistently delivering outstanding service that exceeds customer expectations.\n\n**Characteristics of service excellence:**\n- **Reliability**: Delivering what was promised, every time\n- **Responsiveness**: Quick and willing to help\n- **Competence**: Knowledgeable and skilled staff\n- **Courtesy**: Polite, respectful, friendly service\n- **Communication**: Keeping customers informed\n- **Credibility**: Honest and trustworthy\n- **Security**: Customers feel safe (physical and financial)\n- **Tangibles**: Clean facilities, professional appearance, modern equipment\n\n**Why service excellence matters in tourism:**\n- Satisfied customers become **repeat visitors**\n- Positive **word-of-mouth** recommendations\n- Good online **reviews and ratings** attract new customers\n- Creates a **competitive advantage** over other businesses\n- Builds **brand loyalty** and reputation\n- Justifies **premium pricing**'),
  q(9, 'Why is word-of-mouth particularly powerful in the tourism industry?',
    ['People trust personal recommendations from friends and family more than advertising', 'It is the cheapest form of advertising', 'It is required by law', 'It only affects domestic tourism'], 0,
    'Word-of-mouth is powerful because tourists trust personal recommendations from people they know more than any form of advertising.'),
  fb(10, 'Service excellence in tourism creates ___ customers who return again. Good service also generates positive ___-of-mouth recommendations that attract new visitors.',
    ['repeat', 'word'],
    'Excellent service creates loyal repeat visitors and generates positive word-of-mouth, which is a powerful marketing tool.'),
  t(11, '### Measuring Customer Satisfaction\n\nTourism businesses use various methods to measure customer satisfaction:\n\n| Method | Description |\n|--------|-------------|\n| **Customer satisfaction surveys** | Questionnaires completed after the experience |\n| **Comment cards** | Short feedback forms at hotels, restaurants |\n| **Online reviews** | TripAdvisor, Google Reviews, Booking.com ratings |\n| **Social media monitoring** | Tracking mentions, comments, and sentiment online |\n| **Mystery shoppers** | Undercover assessors who evaluate service quality |\n| **Net Promoter Score (NPS)** | Asks customers how likely they are to recommend (0-10 scale) |\n| **Complaint tracking** | Analysing the number and nature of complaints received |\n\nRegular measurement allows businesses to identify strengths, address weaknesses, and continuously improve service delivery.'),
  q(12, 'What is a mystery shopper in the tourism industry?',
    ['An undercover assessor who evaluates service quality', 'A tourist who shops for souvenirs', 'A shoplifter at a hotel gift shop', 'A travel agent who books anonymously'], 0,
    'A mystery shopper is an undercover assessor hired to evaluate the quality of service at a tourism business by posing as a regular customer.'),
];

// ===============================================================================
// CHAPTER 7: Responsible Tourism (Term 3)
// ===============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Responsible Tourism\n\n### What is Responsible Tourism?\n\nResponsible tourism means making better places for people to live in and better places for people to visit. It requires tourism stakeholders (tourists, businesses, communities, governments) to take responsibility for the impact of their actions.\n\n### The Three Pillars of Sustainability\n\n| Pillar | Focus | Examples in Tourism |\n|--------|-------|--------------------|\n| **Economic** (Profit) | Financial sustainability and benefit sharing | Fair wages, supporting local suppliers, employing local people |\n| **Social** (People) | Community well-being and cultural preservation | Respecting local customs, community-based tourism, cultural sensitivity |\n| **Environmental** (Planet) | Protecting natural resources | Reducing waste, conserving water, protecting wildlife, minimising carbon footprint |\n\nThis is often called the **Triple Bottom Line**: People, Planet, Profit.'),
  q(2, 'What are the three pillars of sustainable tourism?',
    ['Economic, Social, Environmental', 'Transport, Accommodation, Attractions', 'Marketing, Finance, Operations', 'Domestic, Regional, International'], 0,
    'The three pillars of sustainable tourism are Economic (profit), Social (people), and Environmental (planet).'),
  t(3, '### Managing Quality Service Concepts\n\nQuality management in responsible tourism involves setting and maintaining standards:\n\n**Quality management principles:**\n- **Customer focus**: Understanding and meeting tourist needs\n- **Leadership**: Management commitment to quality\n- **Employee involvement**: All staff contribute to quality\n- **Process approach**: Systematic management of activities\n- **Continuous improvement**: Always seeking to improve\n- **Evidence-based decisions**: Using data and feedback to make changes\n\n**Quality assurance in SA tourism:**\n- **TGCSA star grading system**: 1-star (basic) to 5-star (luxury) for accommodation\n- **Fair Trade Tourism certification**: Ensures responsible and ethical practices\n- **Green Tourism certification**: Recognises environmentally sustainable businesses\n- **Lilizela Tourism Awards**: Annual awards recognising service excellence in SA tourism'),
  q(4, 'What does the TGCSA star grading system rate?',
    ['Accommodation quality from 1-star to 5-star', 'Airline safety standards', 'Restaurant food quality', 'Tourist attraction popularity'], 0,
    'The TGCSA (Tourism Grading Council of South Africa) rates accommodation establishments from 1-star (basic) to 5-star (luxury).'),
  t(5, '### Responsible Tourism Practices for Businesses\n\n**Environmental practices:**\n- Reduce, reuse, recycle (waste management)\n- Use energy-efficient lighting and appliances\n- Install solar panels and water-saving devices\n- Use biodegradable cleaning products\n- Source food locally to reduce transport emissions\n- Protect indigenous vegetation and wildlife\n\n**Social practices:**\n- Employ local community members\n- Support local schools and community projects\n- Respect and promote local culture and traditions\n- Ensure accessibility for people with disabilities\n- Prevent exploitation of local communities\n\n**Economic practices:**\n- Buy from local suppliers and craftspeople\n- Pay fair wages to employees\n- Reinvest profits in the local community\n- Support small, medium, and micro enterprises (SMMEs)'),
  fb(6, 'The Triple Bottom Line focuses on three areas: People, ___, and Profit. The TGCSA uses a ___ grading system to rate accommodation quality.',
    ['Planet', 'star'],
    'The Triple Bottom Line is People, Planet, Profit. TGCSA uses star ratings (1 to 5 stars) for accommodation.'),
  t(7, '### Responsible Tourism Practices for Tourists\n\n**Environmental responsibility:**\n- Do not litter or disturb wildlife\n- Stay on marked trails in nature reserves\n- Conserve water and electricity at accommodation\n- Choose eco-friendly accommodation and tours\n- Avoid buying products made from endangered species\n\n**Social responsibility:**\n- Respect local customs, traditions, and dress codes\n- Learn basic greetings in the local language\n- Ask permission before photographing local people\n- Support community-based tourism initiatives\n- Bargain fairly at local markets\n\n**Economic responsibility:**\n- Buy local products and souvenirs (not mass-produced imports)\n- Eat at local restaurants rather than international chains\n- Use local guides and tour operators\n- Tip fairly for good service'),
  q(8, 'Which of the following is an example of a tourist acting responsibly?',
    ['Buying handmade crafts from local artisans', 'Feeding wild animals in a game reserve', 'Taking coral from a reef as a souvenir', 'Photographing people without permission'], 0,
    'Buying from local artisans supports the local economy and is a form of responsible economic behaviour for tourists.'),
  t(9, '### Codes of Conduct in Tourism\n\nA **code of conduct** is a set of guidelines for acceptable behaviour. In tourism:\n\n**For tourism businesses:**\n- Adhere to Fair Trade Tourism principles\n- Follow the **UNWTO Global Code of Ethics for Tourism**\n- Be transparent about pricing\n- Ensure health and safety standards\n- Minimise environmental impact\n\n**For tourists:**\n- Respect wildlife viewing distance rules\n- Follow national park regulations\n- Dress appropriately at religious and cultural sites\n- Do not buy illegal products (ivory, endangered species products)\n- Report illegal activities\n\n**The UNWTO Global Code of Ethics for Tourism** (10 principles) promotes responsible, sustainable, and universally accessible tourism. Key principles include mutual understanding, respect for human rights, environmental protection, and benefit sharing with host communities.'),
  q(10, 'The UNWTO Global Code of Ethics for Tourism promotes:',
    ['Responsible, sustainable, and universally accessible tourism', 'Maximum profit for tourism businesses', 'Limiting tourism to wealthy countries', 'Reducing the number of international tourists'], 0,
    'The UNWTO Global Code of Ethics promotes responsible and sustainable tourism that is accessible to all while respecting human rights and the environment.'),
  fb(11, 'Fair Trade Tourism certification ensures tourism businesses follow ___ and ethical practices. The UNWTO stands for the United Nations ___ Tourism Organization.',
    ['responsible', 'World'],
    'Fair Trade Tourism promotes responsible and ethical tourism practices. UNWTO is the United Nations World Tourism Organization.'),
];

// ===============================================================================
// CHAPTER 8: Revision (Term 4)
// ===============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\n### Grade 11 Tourism Exam Structure\n\nThe Grade 11 Tourism exam typically consists of the following:\n\n| Component | Details |\n|-----------|--------|\n| **Paper 1** | 3 hours, 200 marks |\n| **Section A** | Short questions (multiple choice, matching, true/false) |\n| **Section B** | Map work and tour planning |\n| **Section C** | Longer questions covering all topics |\n\n### Key Topics per Term\n\n| Term | Topics |\n|------|--------|\n| **Term 1** | Tourism sectors: Transport (air, rail, road, car rental) |\n| **Term 2** | Domestic/Regional/International tourism, DTGS, Culture and heritage, Marketing, SADC countries |\n| **Term 3** | Foreign exchange, Communication and customer care, Responsible tourism |\n| **Term 4** | Revision and examinations |'),
  q(2, 'How many marks is the Grade 11 Tourism Paper 1 typically worth?',
    ['200 marks', '150 marks', '100 marks', '300 marks'], 0,
    'The Grade 11 Tourism Paper 1 is typically worth 200 marks, written over 3 hours.'),
  t(3, '### Transport Revision Summary\n\n**Air transport:**\n- Three major SA airports: OR Tambo (JNB), Cape Town (CPT), King Shaka (DUR)\n- Airlines: SAA (national carrier), FlySafair, Kulula, Lift (low-cost)\n- Flight types: domestic, regional, international, direct, connecting, charter\n- Airport procedures: check-in, security, immigration, boarding\n- Technology: self-service kiosks, biometric scanning, e-boarding passes\n\n**Rail transport:**\n- Shosholoza Meyl (economy long-distance)\n- Blue Train (luxury, Pretoria-Cape Town)\n- Rovos Rail (most luxurious train in the world)\n- Premier Classe (premium overnight)\n- Gautrain (high-speed commuter, Gauteng, opened 2010)\n\n**Road transport:**\n- Long-distance: Greyhound, Intercape, Translux\n- Tourist: City Sightseeing, Baz Bus\n- Car rental: Avis, Budget, Europcar, Hertz\n- Drive on the left side in SA'),
  t(4, '### Domestic and Regional Tourism Revision\n\n**Key concepts:**\n- DTGS: Domestic Tourism Growth Strategy\n- Five market segments: Young and upcoming, Independent young couples/families, Striving families, Well-off homely couples, Home-based low-income\n- VFR (visiting friends and relatives) is the largest domestic category\n- Rainbow Nation: 11 official languages, diverse cultural groups\n\n**Heritage:**\n- SAHRA: South African Heritage Resources Agency\n- National Heritage Resources Act (Act 25 of 1999)\n- Heritage grading: Grade I (national), Grade II (provincial), Grade III (local)\n- 10 UNESCO World Heritage Sites in South Africa\n- Provincial heritage agencies (e.g., Amafa in KZN, HWC in Western Cape)'),
  q(5, 'How many UNESCO World Heritage Sites does South Africa have?',
    ['10', '8', '12', '6'], 0,
    'South Africa has 10 UNESCO World Heritage Sites, including natural, cultural, and mixed sites.'),
  t(6, '### Marketing Revision\n\n**The 4 Ps:** Product, Price, Place, Promotion (extended to 7 Ps with People, Process, Physical evidence)\n\n**Target markets:** Demographics, Geographics, Psychographics, Behavioural\n\n**Promotional techniques:**\n- ATL (above-the-line): TV, radio, newspapers, magazines, billboards\n- BTL (below-the-line): Social media, brochures, email, travel expos, loyalty programmes\n\n**Marketing bodies:**\n- SA Tourism (national marketing, Sho\'t Left campaign)\n- TGCSA (star grading)\n- TOMSA (Tourism Marketing South Africa, collects marketing levy)\n- Tourism Indaba (annual trade show in Durban)'),
  fb(7, 'The 4 Ps of marketing are Product, Price, Place, and ___. The annual tourism trade show held in Durban is called ___.',
    ['Promotion', 'Tourism Indaba'],
    'The 4 Ps include Product, Price, Place, and Promotion. Tourism Indaba is the major annual tourism trade show in Durban.'),
  t(8, '### SADC and Foreign Exchange Revision\n\n**SADC:** 16 member states, 4 island nations (Madagascar, Mauritius, Comoros, Seychelles)\n- Key WHS: Okavango Delta (Botswana), Victoria Falls (Zambia/Zimbabwe), Kilimanjaro (Tanzania)\n- Lesotho is an enclave within SA\n- Great Limpopo Transfrontier Park: SA, Mozambique, Zimbabwe\n\n**Foreign exchange:**\n- BSR (Bank Selling Rate): used when you BUY foreign currency (higher rate)\n- BBR (Bank Buying Rate): used when you SELL foreign currency (lower rate)\n- Buying: Foreign amount = Rand / BSR\n- Selling: Rand amount = Foreign amount x BBR\n- Weak Rand = good for inbound tourism, bad for outbound\n- Strong Rand = good for outbound tourism, bad for inbound\n- Multiplier effect: tourist spending circulates through the economy\n- Leakage: money leaving the local economy'),
  q(9, 'If the BSR for British Pounds is R23.50, how many Pounds can you buy with R5 000?',
    ['212.77 Pounds', '117 500 Pounds', '235 Pounds', '21.28 Pounds'], 0,
    'Buying foreign currency: Pounds = R5 000 / R23.50 = 212.77 Pounds (rounded to 2 decimal places).'),
  t(10, '### Communication, Customer Care and Responsible Tourism Revision\n\n**Communication technology:** Websites, social media, GDS (Amadeus, Galileo, Sabre), CRS, GPS, VR, chatbots\n\n**Six steps for handling complaints:**\n1. Listen\n2. Apologise\n3. Find a solution\n4. Act quickly\n5. Follow up\n6. Record and learn\n\n**Service excellence:** Reliability, Responsiveness, Competence, Courtesy, Communication, Credibility, Security, Tangibles\n\n**Responsible tourism:**\n- Triple Bottom Line: People, Planet, Profit\n- Quality assurance: TGCSA star grading, Fair Trade Tourism, Green Tourism certification\n- UNWTO Global Code of Ethics for Tourism\n- Tourist responsibility: respect culture, buy local, conserve environment'),
  q(11, 'What does the Triple Bottom Line in responsible tourism refer to?',
    ['People, Planet, Profit', 'Transport, Accommodation, Attractions', 'Domestic, Regional, International', 'Air, Rail, Road'], 0,
    'The Triple Bottom Line refers to the three pillars of sustainability: People (social), Planet (environmental), and Profit (economic).'),
  fb(12, 'The six complaint-handling steps begin with ___ and end with record and ___. The three pillars of sustainability are also called the ___ Bottom Line.',
    ['listen', 'learn', 'Triple'],
    'Complaint handling starts with listening and ends with recording and learning. The three sustainability pillars form the Triple Bottom Line.'),
];

// ===============================================================================
// MAIN — insert into MongoDB
// ===============================================================================
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
      title: 'Chapter 1: Tourism Sectors - Transport',
      description: 'SA airports and airlines, flight types, airline terminology, airport procedures, technology, bus and train industry, car rental.',
      order: 1,
      lessons: [
        { title: 'Air Transport in South Africa', description: 'SA airports, airlines, types of flights, airline terminology, airport procedures, and technology at airports.', blocks: ch1_lesson1, term: 1 },
        { title: 'Bus, Train and Car Rental Transport', description: 'Shosholoza Meyl, Blue Train, Rovos Rail, Premier Classe, Gautrain, bus companies, and car rental in SA.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Domestic, Regional and International Tourism',
      description: 'DTGS, five domestic market segments, culture and heritage tourism, SA cultural uniqueness, SAHRA, and provincial heritage agencies.',
      order: 2,
      lessons: [
        { title: 'Domestic, Regional and International Tourism', description: 'DTGS, five market segments, VFR, culture and heritage tourism, SAHRA, World Heritage Sites, and provincial heritage agencies.', blocks: ch2_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 3: Marketing',
      description: 'Marketing concepts, target markets, promotional techniques (ATL and BTL), marketing budget, and tourism marketing bodies.',
      order: 3,
      lessons: [
        { title: 'Marketing in Tourism', description: 'The 4 Ps, target markets, above/below-the-line promotion, marketing budgets, SA Tourism, TGCSA, TOMSA, and Tourism Indaba.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Tourism Attractions - SADC Countries',
      description: 'Regional tourism, SADC member countries, gateways and World Heritage Sites in SADC, and map location.',
      order: 4,
      lessons: [
        { title: 'Tourism Attractions in SADC Countries', description: 'SADC member states, gateways, World Heritage Sites in SADC, locating countries on a map, and benefits of regional tourism.', blocks: ch4_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Foreign Exchange',
      description: 'Local and foreign currencies, exchange rate concepts, BSR/BBR, converting currencies, strong/weak Rand, and the multiplier effect.',
      order: 5,
      lessons: [
        { title: 'Foreign Exchange', description: 'Currencies, exchange rates, BSR and BBR, currency conversions, strong/weak Rand impact on tourism, and the multiplier effect.', blocks: ch5_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 6: Communication and Customer Care',
      description: 'Communication technology in tourism, verbal and written communication, customer complaints (six steps), and service excellence.',
      order: 6,
      lessons: [
        { title: 'Communication and Customer Care', description: 'Technology in tourism, verbal/written communication, six-step complaint handling, service excellence, and measuring satisfaction.', blocks: ch6_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 7: Responsible Tourism',
      description: 'Three pillars of sustainability, quality management, Fair Trade Tourism, codes of conduct, and responsible practices.',
      order: 7,
      lessons: [
        { title: 'Responsible Tourism', description: 'Triple Bottom Line, quality management, TGCSA star grading, responsible practices for businesses and tourists, UNWTO Code of Ethics.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Revision',
      description: 'Comprehensive revision of all Grade 11 Tourism topics: transport, domestic/regional tourism, marketing, SADC, foreign exchange, communication, and responsible tourism.',
      order: 8,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Full revision covering transport, domestic tourism, marketing, SADC countries, foreign exchange, customer care, and responsible tourism.', blocks: ch8_lesson1, term: 4 },
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
    title: 'Grade 11 Tourism \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Tourism Sectors (Transport), Domestic/Regional/International Tourism, Marketing, SADC Countries, Foreign Exchange, Communication and Customer Care, Responsible Tourism, and Revision for the Grade 11 Tourism curriculum.',
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
  console.log('  TEXTBOOK: Grade 11 Tourism');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
