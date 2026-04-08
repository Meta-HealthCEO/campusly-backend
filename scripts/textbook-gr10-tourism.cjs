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
// CHAPTER 1: Introduction to Tourism (Term 1, Weeks 1-2)
// ===============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## What is Tourism?\n\nTourism is the activity of people travelling to and staying in places outside their usual environment for leisure, business, or other purposes for not more than one consecutive year.\n\n### Key Definitions\n\n| Term | Definition |\n|------|------------|\n| **Tourism** | The temporary movement of people to destinations outside their normal place of residence and work, including the activities they engage in and the facilities created to meet their needs |\n| **Tourist** | A person who travels away from home for at least 24 hours (overnight stay) for leisure, business, or other purposes |\n| **Excursionist / Day visitor** | A person who visits a destination for less than 24 hours without an overnight stay |\n| **Traveller** | Any person on a trip between two or more locations, regardless of purpose |\n| **Inbound tourist** | A foreign visitor entering a country |\n| **Outbound tourist** | A resident leaving their own country to visit another |\n| **Domestic tourist** | A person travelling within their own country |\n\n### The Difference Between Inbound, Outbound and Domestic Tourism\n\n- A German visitor arriving in Cape Town is an **inbound** tourist for South Africa\n- A South African travelling to Mozambique is an **outbound** tourist\n- A Johannesburg resident visiting Durban is a **domestic** tourist'),
  q(2, 'What is the minimum time a person must stay away from home to be classified as a tourist rather than a day visitor?',
    ['24 hours (overnight)', '12 hours', '48 hours', '1 week'], 0,
    'A tourist stays at least 24 hours (overnight) at the destination. A visit of less than 24 hours makes the person a day visitor or excursionist.'),
  t(3, '## Why Do People Travel?\n\nPeople travel for many different reasons. These reasons are called **travel motivations**.\n\n### Common Reasons for Travel\n\n| Reason | Examples |\n|--------|----------|\n| **Leisure and recreation** | Holidays, beach trips, sightseeing, adventure activities |\n| **Visiting friends and relatives (VFR)** | Family reunions, weddings, funerals |\n| **Business** | Conferences, meetings, trade shows |\n| **Education** | Study abroad, school trips, cultural exchanges |\n| **Religion and pilgrimage** | Visiting holy sites, religious festivals |\n| **Health and medical** | Medical procedures abroad, spa and wellness retreats |\n| **Sport** | Attending or participating in sporting events (e.g., Rugby World Cup) |\n| **Adventure** | Bungee jumping, hiking, scuba diving, safari |\n| **Cultural** | Experiencing local traditions, museums, heritage sites |\n\n### Tourist Needs, Preferences and Expectations\n\nTourists have specific **needs** (essentials like shelter and food), **preferences** (personal choices such as beach over mountains), and **expectations** (standards they anticipate, such as clean rooms and friendly service). Meeting or exceeding expectations leads to satisfied tourists who return and recommend the destination.'),
  q(4, 'A person travelling from Pretoria to visit family in East London for a weekend is classified as a:',
    ['Domestic tourist', 'Inbound tourist', 'Outbound tourist', 'Day visitor'], 0,
    'A person travelling within their own country (South Africa) and staying overnight is a domestic tourist.'),
  fb(5, 'A tourist who visits a destination for less than 24 hours is called a ___ or day visitor. Travelling within your own country is known as ___ tourism.',
    ['excursionist', 'domestic'],
    'An excursionist (day visitor) does not stay overnight. Domestic tourism is travel within one\'s own country.'),
  t(6, '## Drawing Up a Tourist Profile\n\nA **tourist profile** describes the characteristics of a typical tourist. Tourism businesses use profiles to plan services and marketing.\n\n### Elements of a Tourist Profile\n\n| Element | Examples |\n|---------|----------|\n| **Age group** | Youth (18-30), middle-aged (31-55), senior (55+) |\n| **Gender** | Male, female |\n| **Income level** | Budget, mid-range, luxury |\n| **Country of origin** | South Africa, Germany, United Kingdom, USA |\n| **Purpose of visit** | Leisure, business, VFR, education |\n| **Length of stay** | Day trip, weekend, one week, two weeks |\n| **Accommodation preference** | Hotel, B&B, backpackers, self-catering |\n| **Activities enjoyed** | Beach, safari, adventure, culture, shopping |\n| **Mode of transport** | Air, road, rail, sea |\n\n### Example Tourist Profile\n\n**Profile: Budget backpacker**\n- Age: 18-30\n- Income: Low to medium\n- Origin: Europe (UK, Germany, Netherlands)\n- Purpose: Leisure and adventure\n- Stay: 2-4 weeks\n- Accommodation: Hostels, backpackers\n- Activities: Hiking, surfing, bungee, cultural tours\n- Transport: Baz Bus, car rental, shared transport'),
  q(7, 'Which of the following is NOT typically included in a tourist profile?',
    ['The tourist\'s blood type', 'Age group', 'Country of origin', 'Accommodation preference'], 0,
    'A tourist profile includes travel-related characteristics such as age, origin, and preferences, but not medical details like blood type.'),
  t(8, '## Types of Tourism\n\nTourism can be classified into different types based on the purpose or nature of travel:\n\n| Type | Description | South African Example |\n|------|-------------|----------------------|\n| **Leisure tourism** | Travelling for relaxation and enjoyment | Beach holiday in Durban |\n| **Adventure tourism** | Seeking thrilling, physically active experiences | Bungee jumping at Bloukrans Bridge |\n| **Eco-tourism** | Nature-based travel that supports conservation | Visiting iSimangaliso Wetland Park |\n| **Cultural tourism** | Experiencing local culture, heritage, and traditions | Lesedi Cultural Village in Gauteng |\n| **Heritage tourism** | Visiting historical sites of significance | Robben Island, Apartheid Museum |\n| **Sport tourism** | Attending or participating in sporting events | Comrades Marathon in KZN |\n| **Business tourism** | Travel for work purposes, conferences | Sandton Convention Centre |\n| **Medical tourism** | Travelling to receive healthcare | Cosmetic surgery in Cape Town |\n| **Dark tourism** | Visiting sites associated with death or tragedy | Constitution Hill, District Six Museum |'),
  q(9, 'A tourist visiting Robben Island to learn about Nelson Mandela\'s imprisonment is engaging in:',
    ['Heritage tourism', 'Adventure tourism', 'Medical tourism', 'Sport tourism'], 0,
    'Visiting historical sites of significance like Robben Island is heritage tourism.'),
  fb(10, 'Eco-tourism is nature-based travel that supports ___. Tourism focused on attending events like the Comrades Marathon is called ___ tourism.',
    ['conservation', 'sport'],
    'Eco-tourism combines nature experiences with conservation efforts. Sport tourism involves travelling for sporting events.'),
];

// ===============================================================================
// CHAPTER 2: Tourism Sectors (Term 1, Weeks 2-4)
// ===============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## The Tourism Industry: Sectors Overview\n\nThe tourism industry is made up of several interconnected **sectors** that work together to provide services to tourists. No single sector can operate in isolation.\n\n### The Main Tourism Sectors\n\n| Sector | What It Provides | Examples |\n|--------|-------------------|----------|\n| **Transport** | Moving tourists from one place to another | Airlines, buses, trains, car rental, cruise ships |\n| **Accommodation** | Places for tourists to sleep and stay | Hotels, B&Bs, guest houses, lodges, hostels |\n| **Food and beverage** | Meals and drinks | Restaurants, fast food, coffee shops, bars |\n| **Attractions** | Reasons for tourists to visit a destination | National parks, museums, theme parks, beaches |\n| **Travel organisers** | Planning and booking travel | Travel agents, tour operators, online booking sites |\n| **Support services** | Services that support the tourism experience | Banks (foreign exchange), insurance, visa offices, information centres |\n\n### How Sectors Are Linked\n\nA tourist visiting Kruger National Park needs:\n- **Transport** to get there (flight to KMIA, car rental)\n- **Accommodation** in a rest camp or private lodge\n- **Food and beverage** at camp restaurants\n- The **attraction** itself (the game reserve)\n- A **travel organiser** may have booked the package\n- **Support services** like travel insurance and information guides'),
  q(2, 'Which tourism sector is responsible for providing tourists with places to sleep?',
    ['Accommodation', 'Transport', 'Attractions', 'Support services'], 0,
    'The accommodation sector provides tourists with places to stay, including hotels, B&Bs, lodges, and hostels.'),
  t(3, '## Transport Sector\n\nThe transport sector moves tourists between their home and the destination, and also within the destination itself.\n\n### Modes of Transport\n\n| Mode | Examples | Advantages | Disadvantages |\n|------|----------|------------|---------------|\n| **Road** | Car, bus, minibus taxi, coach | Flexible, door-to-door, scenic routes | Slow for long distances, road accidents, traffic |\n| **Air** | Aeroplanes, helicopters, microlights | Fastest for long distances, comfortable | Expensive, carbon emissions, airport procedures |\n| **Rail** | Trains, trams | Scenic, relaxing, large carrying capacity | Slow, limited routes, schedule-dependent |\n| **Water** | Cruise ships, ferries, boats, yachts | Luxurious, scenic, floating accommodation | Slow, weather-dependent, seasickness |\n\n### Comparing Modes of Transport\n\nWhen choosing transport, tourists consider:\n- **Cost** (budget vs luxury)\n- **Speed** (air is fastest)\n- **Comfort** (cruise ships and luxury trains score highest)\n- **Safety** (air travel is statistically the safest)\n- **Carrying capacity** (trains and ships carry the most)\n- **Reliability** (scheduled services vs weather-dependent)\n- **Flexibility** (road transport is most flexible)\n\n### Extraordinary Modes of Transport\n\nThese unusual forms of transport are sometimes used for tourism:\n- Camels (desert safaris)\n- Donkey carts (rural tourism)\n- Hot air balloons (scenic flights)\n- Bicycles (cycling tours)\n- Cable cars (Table Mountain, e.g.)'),
  q(4, 'Which mode of transport offers the most flexibility for tourists?',
    ['Road transport', 'Air transport', 'Rail transport', 'Water transport'], 0,
    'Road transport (especially self-drive car rental) is the most flexible because tourists can travel door-to-door on their own schedule.'),
  fb(5, 'Air transport is the ___ mode for long distances but is also the most ___. Cruise ships are an example of ___ transport.',
    ['fastest', 'expensive', 'water'],
    'Air travel covers long distances quickly but costs more. Cruise ships travel on water and combine transport with accommodation.'),
  t(6, '## Road Transport in South Africa\n\nRoad transport is the most common way tourists travel in South Africa.\n\n### Key Road Transport Options\n\n| Type | Description |\n|------|-------------|\n| **Private car / self-drive** | Tourists rent a car and drive themselves; SA drives on the left |\n| **Coach / luxury bus** | Long-distance services: Greyhound, Intercape, Translux |\n| **Shuttle bus** | Metered, pre-booked shuttle services between airports and destinations |\n| **Minibus taxi** | Most used public transport in SA; affordable but often overcrowded |\n| **Hop-on hop-off bus** | City Sightseeing buses in Cape Town, Johannesburg, and Durban |\n| **Baz Bus** | Backpacker-friendly shuttle service along the coast |\n\n### Car Rental Companies in SA\n\n- Avis, Budget, Europcar, Hertz, First Car Rental, Tempest\n\n### Important Road Facts for Tourists\n\n- South Africa drives on the **left side** of the road\n- Speed limits: 60 km/h (urban), 100 km/h (rural), 120 km/h (freeway)\n- Many **national routes** have toll plazas\n- International visitors need a valid driving licence (and sometimes an International Driving Permit)\n- Fuel is available at petrol stations across the country; attendants pump fuel for you'),
  q(7, 'On which side of the road do South Africans drive?',
    ['Left side', 'Right side', 'It varies by province', 'Either side'], 0,
    'South Africa follows the left-hand driving system, inherited from British colonial history.'),
  t(8, '## Air and Rail Transport in South Africa\n\n### Major Airports\n\n| Airport | IATA Code | Location |\n|---------|-----------|----------|\n| OR Tambo International | JNB | Johannesburg, Gauteng |\n| Cape Town International | CPT | Cape Town, Western Cape |\n| King Shaka International | DUR | Durban, KwaZulu-Natal |\n| Lanseria International | HLA | North of Johannesburg |\n| Kruger Mpumalanga International | MQP | Near Nelspruit |\n\n### Airlines Operating in SA\n\n- **SAA** (South African Airways) — national carrier\n- **FlySafair**, **Kulula**, **Lift** — low-cost carriers\n- **Airlink**, **CemAir** — regional carriers\n\n### Rail Services\n\n| Service | Type |\n|---------|------|\n| **Gautrain** | High-speed commuter rail in Gauteng; connects OR Tambo to Sandton and Pretoria |\n| **Shosholoza Meyl** | Long-distance economy rail |\n| **The Blue Train** | 5-star luxury, Pretoria to Cape Town |\n| **Rovos Rail** | Ultra-luxury rail experiences |\n| **Premier Classe** | Premium overnight sleeper service |'),
  q(9, 'What is the IATA code for Cape Town International Airport?',
    ['CPT', 'JNB', 'DUR', 'HLA'], 0,
    'Cape Town International Airport uses the IATA code CPT.'),
  fb(10, 'OR Tambo International Airport is located in ___ and has the IATA code ___. The Gautrain is a high-speed commuter rail system in ___ province.',
    ['Johannesburg', 'JNB', 'Gauteng'],
    'OR Tambo (JNB) is South Africa\'s busiest airport, located in Johannesburg. The Gautrain operates in Gauteng province.'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Accommodation Sector\n\nThe accommodation sector provides tourists with a place to stay during their visit. South Africa offers a wide variety of accommodation types to suit every budget.\n\n### Types of Accommodation\n\n| Type | Description | Price Range |\n|------|-------------|-------------|\n| **Hotel** | Full-service establishment with rooms, restaurant, and amenities | Medium to luxury |\n| **Guest house** | Smaller, owner-managed establishment; more personal | Medium |\n| **Bed and Breakfast (B&B)** | Overnight stay with breakfast included | Budget to medium |\n| **Self-catering** | Apartment, cottage, or chalet where guests cook for themselves | Budget to medium |\n| **Game lodge** | Accommodation in or near a game reserve; includes safari activities | Medium to luxury |\n| **Backpackers / Hostel** | Dormitory-style or budget private rooms for backpackers | Budget |\n| **Caravan and camping** | Tourists bring their own tent or caravan to a campsite | Budget |\n| **Country house / Boutique hotel** | Unique, often themed small hotels | Medium to luxury |\n| **Resort** | Large complex with extensive facilities (pools, spa, restaurants) | Medium to luxury |'),
  q(2, 'Which type of accommodation allows guests to cook their own meals?',
    ['Self-catering', 'Hotel', 'Bed and Breakfast', 'Game lodge'], 0,
    'Self-catering accommodation provides kitchen facilities so guests can prepare their own meals.'),
  t(3, '### Accommodation Concepts and Terminology\n\n| Term | Meaning |\n|------|--------|\n| **Single room** | Room for one person |\n| **Double room** | Room with a double bed for two people |\n| **Twin room** | Room with two single beds |\n| **Family room** | Larger room for parents and children |\n| **Suite** | Luxury room with separate living area |\n| **Penthouse** | Top-floor luxury suite |\n| **En suite** | Room with its own private bathroom |\n| **Per person sharing (pps)** | Price per person when sharing a room |\n| **Per person per night (pppn)** | Price per person for one night |\n| **Fully inclusive** | All meals and some activities included |\n| **Half board** | Breakfast and dinner included |\n| **Full board** | All three meals included |\n| **Room only** | No meals included |\n\n### Abbreviations\n\n- **pps** — per person sharing\n- **pppn** — per person per night\n- **B&B** — bed and breakfast\n- **DBB** — dinner, bed, and breakfast (half board)'),
  q(4, 'What does the abbreviation "pps" mean in accommodation pricing?',
    ['Per person sharing', 'Price per suite', 'Per person single', 'Premium package special'], 0,
    'PPS means "per person sharing" — the price each person pays when sharing a room with another person.'),
  fb(5, 'A room with its own private bathroom is called an ___ suite room. When breakfast and dinner are included in the price, this is known as ___ board.',
    ['en', 'half'],
    'En suite means the room has its own bathroom. Half board includes breakfast and dinner.'),
  t(6, '### The SA Star Grading System (TGCSA)\n\nThe **Tourism Grading Council of South Africa (TGCSA)** operates the official star grading system for accommodation establishments.\n\n| Stars | Standard |\n|-------|----------|\n| **1 Star** | Clean, comfortable, functional — basic standard |\n| **2 Stars** | Good, meeting guests\' basic needs with some extra amenities |\n| **3 Stars** | Very good, exceeding standard expectations with quality furnishings |\n| **4 Stars** | Excellent, superior comfort and quality |\n| **5 Stars** | Outstanding, world-class luxury and service |\n\n### Benefits of Star Grading\n\n**For tourists:**\n- Know what quality to expect before booking\n- Can compare establishments objectively\n- Gives confidence in the accommodation standards\n\n**For accommodation establishments:**\n- Provides a recognised quality benchmark\n- Helps attract more guests through credibility\n- Identifies areas for improvement\n- Can be used in marketing and advertising\n\n### How Grading Works\n\n1. The establishment applies to TGCSA\n2. A trained assessor visits and inspects the property\n3. The assessor evaluates criteria such as cleanliness, service, facilities, and safety\n4. A star rating is awarded\n5. The rating must be renewed regularly (usually every 3 years)\n6. Logos may be displayed upon grading'),
  q(7, 'How many stars represent the highest grading in the South African accommodation grading system?',
    ['5 stars', '4 stars', '6 stars', '3 stars'], 0,
    'The TGCSA star grading system awards a maximum of 5 stars, representing outstanding, world-class quality.'),
  t(8, '### Facilities and Services Offered by Accommodation\n\nDifferent accommodation types offer different facilities and services:\n\n| Facility / Service | Description |\n|-------------------|-------------|\n| **Swimming pool** | Recreational facility for guests |\n| **Gymnasium / fitness centre** | Exercise equipment for guests |\n| **Spa** | Wellness treatments, massages |\n| **Restaurant / dining room** | On-site food and beverage |\n| **Room service** | Meals delivered to the guest room |\n| **Laundry service** | Clothes washed and returned to guests |\n| **Gift shop** | Sells souvenirs and essentials |\n| **Conference facilities** | Meeting rooms for business events |\n| **Wi-Fi / internet** | Internet connectivity for guests |\n| **Shuttle service** | Transport to/from airport or attractions |\n| **24-hour security** | Safety services including CCTV |\n| **Guided walks / tours** | Organised excursions for guests |\n\n### In-Room Technology\n\n- **Smart TV** with streaming channels\n- **Electronic key cards** for room access\n- **Air conditioning** with digital controls\n- **USB charging ports** at bedside\n- **Automated mini-bar** with sensor-tracked items\n- **In-room tablet** for ordering room service'),
  q(9, 'Which of the following is a facility typically offered by hotels to support business travellers?',
    ['Conference facilities', 'Surfboard rental', 'Horse riding', 'Scuba diving'], 0,
    'Conference facilities with meeting rooms are provided by hotels to cater for business travellers attending meetings or corporate events.'),
  fb(10, 'The official star grading body in South Africa is the ___. A maximum of ___ stars can be awarded to an accommodation establishment.',
    ['TGCSA', '5'],
    'The Tourism Grading Council of South Africa (TGCSA) operates the star grading system, with 5 stars being the highest rating.'),
];

// ===============================================================================
// CHAPTER 3: Food & Beverage and Attractions Sectors (Term 1, Weeks 5-7)
// ===============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Food and Beverage Sector\n\nThe food and beverage sector provides tourists with meals, snacks, and drinks during their stay. This sector is one of the largest employers in the tourism industry.\n\n### Types of Food and Beverage Establishments\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Fine-dining restaurant** | Upscale, full-service, high-quality cuisine | The Test Kitchen (Cape Town) |\n| **Family restaurant** | Casual, family-friendly atmosphere | Spur, Wimpy |\n| **Fast food** | Quick-service, affordable | KFC, Nando\'s, McDonald\'s |\n| **Coffee shop / café** | Light meals, beverages, relaxed setting | Vida e Caffè, Mugg & Bean |\n| **Quick-service / takeaway** | Meals prepared for take-away | Fish & chips shop, pie shop |\n| **Bar / pub** | Focuses on drinks, may serve light meals | Local pub, sports bar |\n| **Shebeen** | Informal drinking establishment, often in townships | Township shebeens |\n| **Street market / street food** | Informal food stalls and vendors | Neighbourgoods Market |\n| **Tavern** | Informal bar-style establishment | Local taverns |\n| **Ice-cream parlour / dessert bar** | Specialises in sweet treats | Creamery, Waffle House |'),
  q(2, 'Which of the following is an example of a fast-food establishment in South Africa?',
    ['Nando\'s', 'The Test Kitchen', 'Vida e Caffè', 'A township shebeen'], 0,
    'Nando\'s is a well-known fast-food restaurant chain in South Africa, specialising in flame-grilled chicken.'),
  t(3, '### Meal Plans and Service Styles\n\n| Meal Plan | What Is Included |\n|-----------|------------------|\n| **Room only** | No meals |\n| **B&B (Bed and Breakfast)** | Overnight stay + breakfast |\n| **Half board (DBB)** | Breakfast and dinner |\n| **Full board** | Breakfast, lunch, and dinner |\n| **All-inclusive** | All meals, drinks, and sometimes activities |\n\n### Types of Breakfast\n\n| Type | Description |\n|------|-------------|\n| **Continental breakfast** | Light — rolls, croissants, juice, coffee, fruit |\n| **English / Full breakfast** | Cooked — eggs, bacon, sausage, toast, grilled tomato, beans |\n| **Buffet breakfast** | Self-service selection of hot and cold items |\n| **À la carte** | Guests order individual items from a menu |\n\n### Service Styles\n\n| Style | Description |\n|-------|-------------|\n| **Table d\'hôte** | Set menu with limited choices, fixed price |\n| **À la carte** | Guests choose individual items from a full menu |\n| **Buffet** | Self-service from a display of dishes |\n| **Room service** | Meals delivered to the guest\'s room |'),
  q(4, 'A continental breakfast typically includes:',
    ['Light items like rolls, croissants, juice, and coffee', 'Cooked eggs, bacon, and sausage', 'A full buffet with hot dishes', 'Only cereal and milk'], 0,
    'A continental breakfast is a light meal featuring pastries, bread, juice, coffee, and fruit — not a cooked meal.'),
  fb(5, 'A meal plan that includes breakfast and dinner is called ___ board. A ___ breakfast includes cooked items like eggs, bacon, and sausage.',
    ['half', 'Full / English'],
    'Half board (DBB) includes breakfast and dinner. A full English breakfast is a cooked meal with eggs, bacon, sausage, and toast.'),
  t(6, '## The Attractions Sector\n\nAttractions are the primary reasons tourists visit a destination. They are what draw visitors and create the appeal of a place.\n\n### Types of Tourist Attractions\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Natural attractions** | Created by nature, not humans | Beaches, mountains, waterfalls, wildlife |\n| **Man-made (cultural) attractions** | Created by people | Museums, theme parks, monuments, dams |\n| **Primary attractions** | The main reason tourists visit a destination | Table Mountain, Kruger National Park |\n| **Secondary attractions** | Additional attractions tourists visit while at a destination | Shopping malls, local restaurants, craft markets |\n\n### Understanding Primary vs Secondary Attractions\n\nA **primary attraction** is the main drawcard — the reason a tourist plans a trip. For example:\n- A tourist flies to Cape Town specifically to see **Table Mountain** (primary)\n- While in Cape Town, they also visit the **V&A Waterfront** (secondary)\n\nA **secondary attraction** adds value to the trip but is not the main reason for visiting.'),
  q(7, 'Table Mountain is an example of a:',
    ['Natural primary attraction', 'Man-made secondary attraction', 'Natural secondary attraction', 'Man-made primary attraction'], 0,
    'Table Mountain is a natural attraction (created by nature) and a primary attraction (the main reason many tourists visit Cape Town).'),
  t(8, '### Attraction Subsectors\n\nAttractions can be further categorised into subsectors:\n\n| Subsector | Examples |\n|-----------|----------|\n| **Gaming and entertainment** | Casinos (Sun City, GrandWest), cinemas, theatres |\n| **Leisure and recreation** | Theme parks (Gold Reef City, uShaka Marine World), water parks |\n| **Conservation** | National parks (Kruger, Table Mountain NP), nature reserves |\n| **Sport** | Stadiums (FNB Stadium), sporting events (Comrades Marathon) |\n| **Events and conferences** | Music festivals (Oppikoppi), conferences (CTICC) |\n| **Lotteries** | National lottery, scratch cards |\n\n### Activities Offered at Tourist Attractions\n\nThe type of attraction determines the activities available:\n\n| Attraction | Activities |\n|------------|------------|\n| **Drakensberg Mountains** | Hiking, rock climbing, bird-watching, horse riding |\n| **Durban beachfront** | Swimming, surfing, sunbathing, promenade walks |\n| **Kruger National Park** | Game drives, bush walks, bird-watching, photography |\n| **Robben Island** | Guided tours, historical education |\n| **Sun City** | Golf, casino, Valley of Waves water park, shows |\n\nNote: An attraction like Drakensberg is a **natural** attraction, but the **activities** (hiking, horse riding) are what the tourist experiences there.'),
  q(9, 'Which of the following is a man-made tourist attraction?',
    ['Gold Reef City theme park', 'Table Mountain', 'Blyde River Canyon', 'The Drakensberg Mountains'], 0,
    'Gold Reef City is a man-made theme park in Johannesburg. The others are natural attractions.'),
  fb(10, 'The main reason a tourist visits a destination is the ___ attraction. An attraction created by nature, such as a waterfall or mountain, is a ___ attraction.',
    ['primary', 'natural'],
    'Primary attractions are the main drawcard for visitors. Natural attractions are not man-made — they are created by nature.'),
];

// ===============================================================================
// CHAPTER 4: Structure of the SA Tourism Industry (Term 1, Week 8)
// ===============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## The Structure of the South African Tourism Industry\n\nThe South African tourism industry involves both the **public sector** (government) and the **private sector** (businesses and individuals). Tourism is a partnership between these two sectors.\n\n### The Public Sector (Government)\n\nGovernment plays a crucial role in tourism through policy, regulation, and promotion.\n\n**National level:**\n\n| Body | Role |\n|------|------|\n| **Department of Tourism** | Develops tourism policy, promotes growth, oversees the industry nationally |\n| **SA Tourism** | Markets South Africa as a tourist destination both domestically and internationally |\n| **Tourism Grading Council of SA (TGCSA)** | Grades and rates accommodation establishments using the star system |\n| **South African Heritage Resources Agency (SAHRA)** | Protects and manages heritage resources |\n| **SANParks (South African National Parks)** | Manages national parks such as Kruger, Table Mountain, and Addo |\n\n**Other government departments involved in tourism:**\n- Department of Home Affairs (visas, passports)\n- Department of Environmental Affairs (conservation)\n- South African Police Service (tourist safety)\n- Department of Transport (transport infrastructure)'),
  q(2, 'Which government body is responsible for marketing South Africa as a tourist destination?',
    ['SA Tourism', 'Department of Tourism', 'TGCSA', 'SANParks'], 0,
    'SA Tourism is the national tourism marketing organisation responsible for promoting South Africa domestically and internationally.'),
  t(3, '### Provincial and Local Government\n\n**Provincial level:**\n\nEach of South Africa\'s **nine provinces** has its own tourism authority:\n\n| Province | Tourism Authority |\n|----------|-------------------|\n| Gauteng | Gauteng Tourism Authority (GTA) |\n| Western Cape | Wesgro |\n| KwaZulu-Natal | Tourism KwaZulu-Natal (TKZN) |\n| Eastern Cape | Eastern Cape Parks and Tourism Agency (ECPTA) |\n| Free State | Free State Tourism Authority |\n| Limpopo | Limpopo Tourism Agency (LTA) |\n| Mpumalanga | Mpumalanga Tourism and Parks Agency (MTPA) |\n| North West | North West Parks Board |\n| Northern Cape | Northern Cape Tourism Authority (NCTA) |\n\n**Local level:**\n- Local municipalities support tourism through:\n  - **Local tourism offices / visitor information centres**\n  - Maintaining local attractions and infrastructure\n  - Hosting local events and festivals\n  - Signage and wayfinding for tourists'),
  q(4, 'Which provincial tourism authority is responsible for promoting tourism in KwaZulu-Natal?',
    ['Tourism KwaZulu-Natal (TKZN)', 'Wesgro', 'GTA', 'ECPTA'], 0,
    'Tourism KwaZulu-Natal (TKZN) is the provincial body responsible for marketing and developing tourism in KZN.'),
  fb(5, 'South Africa has ___ provinces, each with its own tourism authority. SANParks manages ___ parks such as Kruger and Table Mountain.',
    ['nine', 'national'],
    'South Africa has nine provinces. SANParks (South African National Parks) manages national parks across the country.'),
  t(6, '### The Private Sector\n\nThe private sector includes all businesses and organisations that are privately owned and operated for profit.\n\n**Types of private sector tourism businesses:**\n\n| Category | Examples |\n|----------|----------|\n| **Product owners** | Hotels, game lodges, restaurants, tour companies |\n| **Local communities** | Community-based tourism projects, craft sellers, home-stay hosts |\n| **Professional associations** | FEDHASA (hospitality), ASATA (travel agents), SATSA (tourism services) |\n| **International communities** | Foreign tour operators, international hotel chains |\n\n### Key Industry Associations\n\n| Association | Full Name | Role |\n|-------------|-----------|------|\n| **FEDHASA** | Federated Hospitality Association of Southern Africa | Represents hotels, restaurants, and hospitality businesses |\n| **ASATA** | Association of Southern African Travel Agents | Represents travel agents |\n| **SATSA** | Southern Africa Tourism Services Association | Represents tourism service providers |\n| **TBCSA** | Tourism Business Council of South Africa | Umbrella body for private sector tourism |\n| **TOMSA** | Tourism Marketing South Africa | Collects a marketing levy from private sector businesses |'),
  q(7, 'FEDHASA represents which part of the tourism industry?',
    ['Hotels, restaurants, and hospitality businesses', 'Travel agents', 'Airlines', 'National parks'], 0,
    'FEDHASA (Federated Hospitality Association of Southern Africa) represents the hospitality industry including hotels and restaurants.'),
  t(8, '### State-Owned Enterprises and Parastatals\n\nSome tourism-related entities are **state-owned enterprises (SOEs)** or **parastatals** — they are owned or partly owned by the government but operate as businesses.\n\n| Entity | Type | Role |\n|--------|------|------|\n| **SAA (South African Airways)** | State-owned enterprise | National airline |\n| **SANParks** | Parastatal | Manages 21+ national parks |\n| **ACSA (Airports Company South Africa)** | Partly state-owned | Operates and manages major SA airports |\n| **PRASA** | State-owned | Passenger Rail Agency (Shosholoza Meyl, Premier Classe) |\n| **Transnet** | State-owned | Freight rail and port operations |\n\n### Public-Private Partnerships\n\nThe public and private sectors work together through:\n- **Joint marketing campaigns** (e.g., SA Tourism partnering with private lodges)\n- **Infrastructure development** (government builds roads, private sector builds hotels)\n- **Training and skills development** (government funds tourism training programmes)\n- **Conservation** (SANParks works with private game reserves on wildlife management)'),
  q(9, 'ACSA is responsible for:',
    ['Operating and managing major South African airports', 'Marketing South Africa internationally', 'Grading accommodation', 'Training tourism staff'], 0,
    'ACSA (Airports Company South Africa) operates and manages the major airports in South Africa.'),
  fb(10, 'ASATA represents ___ in the tourism industry. TOMSA collects a marketing ___ from private sector tourism businesses to fund tourism promotion.',
    ['travel agents', 'levy'],
    'ASATA is the Association of Southern African Travel Agents. TOMSA collects a levy to fund tourism marketing campaigns.'),
];

// ===============================================================================
// CHAPTER 5: Map Work and Tour Planning (Term 2, Weeks 1-4)
// ===============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Map Work: Terminology and Symbols\n\nMaps are essential tools in tourism for planning trips, locating destinations, and understanding distances.\n\n### Map Terminology\n\n| Term | Meaning |\n|------|--------|\n| **Scale** | The ratio between the distance on the map and the actual distance on the ground (e.g., 1:50 000 means 1 cm on the map = 50 000 cm = 500 m in reality) |\n| **Legend / Key** | A box on the map explaining what the symbols and colours represent |\n| **Direction** | Maps are oriented with north at the top; a compass rose shows N, S, E, W |\n| **Distance** | The measurement between two points, shown in km or miles |\n| **Grid references** | Numbered lines on a map used to pinpoint exact locations |\n| **Latitude** | Imaginary horizontal lines measuring distance north or south of the equator (0°) |\n| **Longitude** | Imaginary vertical lines measuring distance east or west of the prime meridian (0° — Greenwich) |\n| **Equator** | The imaginary line at 0° latitude, dividing the earth into northern and southern hemispheres |\n| **Prime meridian** | The imaginary line at 0° longitude, passing through Greenwich, England |\n| **International Date Line (IDL)** | The imaginary line at approximately 180° longitude where the calendar date changes |'),
  q(2, 'What does the scale 1:50 000 mean on a map?',
    ['1 cm on the map equals 50 000 cm (500 m) on the ground', '1 km on the map equals 50 000 km on the ground', 'The map shows 50 000 attractions', 'The map was made in the year 50 000'], 0,
    'A scale of 1:50 000 means every 1 unit on the map represents 50 000 of the same units in real life. So 1 cm on the map = 500 m on the ground.'),
  t(3, '### Types of Maps Used in Tourism\n\n| Map Type | Description | Tourism Use |\n|----------|-------------|-------------|\n| **Road map** | Shows roads, highways, and routes | Planning self-drive trips |\n| **Topographic map** | Shows physical features (mountains, rivers, contours) | Hiking, adventure tourism |\n| **Street map / city map** | Detailed map of a town or city | Navigating within a destination |\n| **Tourist map** | Highlights attractions, accommodation, and amenities | General tourism planning |\n| **Airline route map** | Shows flight routes between cities | Planning air travel |\n| **Theme park map** | Layout of a theme park or resort | Navigating attractions at a park |\n| **Electronic / GPS map** | Digital maps on smartphones and GPS devices | Real-time navigation |\n\n### Map Symbols\n\nMaps use symbols to represent features. Common tourism-related symbols include:\n\n| Symbol Meaning | Typical Representation |\n|----------------|------------------------|\n| Airport | Aeroplane icon |\n| Hospital | White H on a blue background |\n| Information centre | Letter \"i\" in a circle |\n| Accommodation | Bed icon |\n| Petrol station | Fuel pump icon |\n| Restaurant | Knife and fork icon |\n| National park | Green shaded area |\n| Heritage site | Brown monument icon |'),
  q(4, 'Which type of map would be most useful for a tourist planning a hiking trip in the Drakensberg?',
    ['Topographic map', 'Airline route map', 'Street map', 'Theme park map'], 0,
    'A topographic map shows physical features like mountains, rivers, and contour lines, which are essential for planning hiking routes.'),
  fb(5, 'Lines of ___ run horizontally and measure distance north or south of the equator. Lines of ___ run vertically and measure distance east or west of the prime meridian.',
    ['latitude', 'longitude'],
    'Latitude lines are horizontal (think "lat" = "flat"). Longitude lines are vertical, running from pole to pole.'),
  t(6, '### Time Zones and the International Date Line\n\nThe world is divided into **24 time zones**, each covering approximately 15° of longitude.\n\n**Key concepts:**\n\n| Concept | Explanation |\n|---------|-------------|\n| **UTC (Coordinated Universal Time)** | The world\'s time standard, based on the prime meridian (Greenwich) |\n| **South African Standard Time (SAST)** | UTC+2 (South Africa is 2 hours ahead of Greenwich) |\n| **Time zone calculation** | Moving east = add hours; moving west = subtract hours |\n| **International Date Line (IDL)** | At approximately 180° longitude; crossing it changes the calendar date by one day |\n\n### Calculating Time Differences\n\n**Example:** If it is 14:00 in South Africa (UTC+2), what time is it in London (UTC+0)?\n- South Africa is 2 hours ahead of London\n- London time = 14:00 - 2 = **12:00**\n\n**Example:** If it is 10:00 in South Africa (UTC+2), what time is it in New York (UTC-5)?\n- Difference = 2 - (-5) = 7 hours\n- New York is 7 hours behind South Africa\n- New York time = 10:00 - 7 = **03:00**'),
  q(7, 'South African Standard Time (SAST) is:',
    ['UTC+2', 'UTC+0', 'UTC-2', 'UTC+5'], 0,
    'South Africa is in the UTC+2 time zone, meaning it is 2 hours ahead of Coordinated Universal Time (Greenwich).'),
  fb(8, 'The world is divided into ___ time zones. South Africa is ___ hours ahead of Greenwich / UTC.',
    ['24', '2'],
    'There are 24 time zones worldwide. South Africa (SAST) is UTC+2, meaning 2 hours ahead of Greenwich.'),
  t(9, '### Locating South Africa on a Map\n\n**South Africa\'s position:**\n- Located at the **southern tip of Africa**\n- Latitude: approximately 22°S to 35°S\n- Longitude: approximately 17°E to 33°E\n- Bordered by Namibia, Botswana, Zimbabwe, Mozambique, Eswatini, and Lesotho\n- Surrounded by the **Atlantic Ocean** (west) and **Indian Ocean** (east)\n- The two oceans meet at **Cape Agulhas** (the southernmost point of Africa)\n\n**South Africa\'s nine provinces:**\n\n| Province | Capital |\n|----------|--------|\n| **Gauteng** | Johannesburg (economic) / Pretoria (administrative national capital) |\n| **Western Cape** | Cape Town (legislative national capital) |\n| **KwaZulu-Natal** | Pietermaritzburg |\n| **Eastern Cape** | Bhisho |\n| **Free State** | Bloemfontein (judicial national capital) |\n| **Limpopo** | Polokwane |\n| **Mpumalanga** | Mbombela (Nelspruit) |\n| **North West** | Mahikeng |\n| **Northern Cape** | Kimberley |'),
  q(10, 'What is the southernmost point of Africa, where the Atlantic and Indian oceans meet?',
    ['Cape Agulhas', 'Cape Town', 'Cape Point', 'Cape of Good Hope'], 0,
    'Cape Agulhas in the Western Cape (Overberg region) is the southernmost point of the African continent.'),
];

blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Distance Tables and Indicators\n\nDistance tables show the distances (in kilometres) between major cities and towns. Tourists use these to plan road trips and estimate travel times.\n\n### How to Read a Distance Table\n\nA distance table is a grid where cities are listed on both axes. To find the distance between two cities, locate the row of one city and the column of the other — the number where they intersect is the distance in km.\n\n### Example Distance Table (approximate km)\n\n| | Johannesburg | Cape Town | Durban | Bloemfontein | Port Elizabeth |\n|---|---|---|---|---|---|\n| **Johannesburg** | — | 1 400 | 570 | 400 | 1 050 |\n| **Cape Town** | 1 400 | — | 1 660 | 1 000 | 770 |\n| **Durban** | 570 | 1 660 | — | 630 | 960 |\n| **Bloemfontein** | 400 | 1 000 | 630 | — | 650 |\n| **Port Elizabeth** | 1 050 | 770 | 960 | 650 | — |\n\n### Calculating Travel Time\n\nTravel time = Distance / Average speed\n\n**Example:** Johannesburg to Durban (570 km) at an average speed of 100 km/h:\n- Travel time = 570 / 100 = **5 hours 42 minutes**\n\nRemember to add time for:\n- Fuel stops\n- Rest breaks\n- Toll plazas\n- Traffic congestion near cities'),
  q(2, 'According to the distance table, how far is it from Cape Town to Durban?',
    ['1 660 km', '570 km', '1 400 km', '770 km'], 0,
    'The distance from Cape Town to Durban is approximately 1 660 km by road.'),
  t(3, '### Distance Indicators on Maps\n\nDistance indicators are markers on maps that show distances between places:\n\n| Indicator | Description |\n|-----------|-------------|\n| **Distance markers** | Numbers along routes showing km between towns |\n| **Scale bar** | A visual ruler on the map used to measure distances |\n| **Grid squares** | Can be used to estimate distances using the known size of each square |\n\n### Linking Distance and Travel Time\n\nWhen planning a tour, tourists must consider:\n\n| Factor | Impact on Travel Time |\n|--------|----------------------|\n| **Road condition** | Gravel or dirt roads are slower than tar roads |\n| **Speed limits** | Urban areas (60 km/h) are slower than freeways (120 km/h) |\n| **Traffic** | Peak hours and holiday traffic slow travel |\n| **Mountain passes** | Winding roads reduce speed significantly |\n| **Weather** | Rain, fog, or wind can slow travel |\n| **Toll roads** | Stopping at toll plazas adds time |\n| **Altitude** | High-altitude passes may have reduced visibility |'),
  q(4, 'A tourist drives 300 km at an average speed of 100 km/h. How long will the trip take?',
    ['3 hours', '30 hours', '300 hours', '1.5 hours'], 0,
    'Travel time = Distance / Speed = 300 km / 100 km/h = 3 hours.'),
  fb(5, 'Travel time is calculated by dividing ___ by average speed. The speed limit on South African freeways is ___ km/h.',
    ['distance', '120'],
    'Travel time = distance / speed. The national speed limit on freeways in South Africa is 120 km/h.'),
  t(6, '## Tour Planning\n\nPlanning a tour involves selecting a route, identifying attractions, booking accommodation and transport, and creating a day-by-day itinerary.\n\n### Steps in Tour Planning\n\n1. **Identify the destination** — Where does the tourist want to go?\n2. **Determine the budget** — How much can the tourist spend?\n3. **Choose transport** — Will they fly, drive, or take a bus?\n4. **Select accommodation** — Hotel, B&B, self-catering, camping?\n5. **Plan the route** — Use maps and distance tables to map the journey\n6. **Identify attractions and activities** — What will they see and do?\n7. **Create an itinerary** — Day-by-day plan with times, places, and activities\n8. **Check travel documents** — Passport, visa, travel insurance\n9. **Book in advance** — Especially during peak season\n10. **Prepare for emergencies** — First aid kit, emergency numbers, roadside assistance'),
  q(7, 'What is an itinerary in the context of tour planning?',
    ['A day-by-day plan of the tour with times, places, and activities', 'A list of all tourist attractions in South Africa', 'A map showing road distances', 'A receipt for hotel bookings'], 0,
    'An itinerary is a detailed day-by-day plan outlining where the tourist will be, what they will do, and when, throughout the tour.'),
  t(8, '### South Africa\'s Location in the World\n\nFor exam purposes, you must be able to locate the following on a world map:\n\n**South Africa and its neighbours:**\n- **SADC countries** — the 16 member states of the Southern African Development Community\n\n**Continents:**\n- Africa, Europe, Asia, North America, South America, Australia/Oceania, Antarctica\n\n**Oceans:**\n- Atlantic Ocean (west of Africa), Indian Ocean (east of Africa), Pacific Ocean\n\n**Key reference points:**\n\n| Feature | Location |\n|---------|----------|\n| Equator | 0° latitude, divides Northern and Southern hemispheres |\n| Prime Meridian | 0° longitude, passes through Greenwich, England |\n| Tropic of Cancer | 23.5°N |\n| Tropic of Capricorn | 23.5°S (passes through northern SA) |\n| IDL | ~180° longitude |\n\n**Island groups in the Indian Ocean:**\n- Madagascar, Mauritius, Seychelles, Comoros, Maldives, Réunion\n\n**South Africa is in the Southern Hemisphere** (below the equator) and the **Eastern Hemisphere** (east of the prime meridian).'),
  q(9, 'The Tropic of Capricorn passes through which part of South Africa?',
    ['Northern part (through Limpopo province)', 'Southern tip at Cape Town', 'The middle at Bloemfontein', 'It does not pass through South Africa'], 0,
    'The Tropic of Capricorn (23.5°S) passes through the northern part of South Africa, crossing Limpopo province.'),
  fb(10, 'South Africa is in the ___ Hemisphere (south of the equator). The Atlantic Ocean is on the ___ coast of South Africa.',
    ['Southern', 'west'],
    'South Africa lies south of the equator in the Southern Hemisphere. The Atlantic Ocean is along the western coast.'),
];

// ===============================================================================
// CHAPTER 6: Domestic, Regional and International Tourism (Term 2, Weeks 5-8)
// ===============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Domestic Tourism\n\nDomestic tourism is when people travel within their own country for leisure, business, or other purposes.\n\n### Benefits of Domestic Tourism\n\n**For the economy:**\n- Creates jobs in tourism and hospitality\n- Generates income for local communities\n- Reduces reliance on international tourism\n- Money stays within the country\n- Supports small businesses and SMMEs\n\n**For communities:**\n- Develops infrastructure (roads, facilities)\n- Promotes cultural exchange between regions\n- Encourages pride in local heritage\n- Reduces poverty in tourism areas\n\n**For the environment:**\n- Tourism revenue funds conservation\n- Awareness of environmental issues increases\n- Protected areas generate income through tourism\n\n### The Sho\'t Left Campaign\n\nSA Tourism launched the **Sho\'t Left** campaign to encourage South Africans to explore their own country. The name comes from South African taxi language, meaning "it\'s just around the corner." The campaign promotes affordable, short trips to destinations across all nine provinces.'),
  q(2, 'What is the main purpose of the Sho\'t Left campaign?',
    ['To encourage South Africans to travel within their own country', 'To attract international tourists', 'To promote air travel', 'To sell travel insurance'], 0,
    'Sho\'t Left is a SA Tourism campaign designed to encourage domestic tourism by promoting affordable trips for South Africans.'),
  t(3, '### Payment Methods for Tourism in South Africa\n\nTourists use various methods to pay for goods and services:\n\n| Payment Method | Description | Advantages | Disadvantages |\n|---------------|-------------|------------|---------------|\n| **Cash (Rands)** | Physical notes and coins | Widely accepted, no technology needed | Risk of theft, no record of spending |\n| **Credit cards** | Visa, MasterCard, American Express, Diners Club | Convenient, secure, spend now pay later | Interest charges, not accepted everywhere |\n| **Debit cards** | Linked to bank account, money deducted immediately | No interest, widely accepted | Needs available funds, card fees |\n| **Internet / online payments** | EFT, online banking, payment gateways | Convenient, can book from anywhere | Needs internet, risk of fraud |\n| **ATM withdrawals** | Cash from ATM machines | Widely available, convenient | Fees, daily limits, safety risks |\n| **Cell phone payments** | Mobile wallets, SnapScan, Zapper | Quick, contactless, convenient | Needs smartphone and data |\n| **Speed Point machines** | Card machines at point of sale (POS) | Quick, secure, widespread | Needs electricity, connection |\n| **Travel cards / pre-paid cards** | Pre-loaded cards in foreign currency | Budget control, secure | Limited acceptance, loading fees |'),
  q(4, 'Which payment method allows a tourist to spend now and pay later?',
    ['Credit card', 'Debit card', 'Cash', 'SnapScan'], 0,
    'A credit card allows the user to make purchases and pay for them later, usually at the end of the month, though interest may be charged.'),
  fb(5, 'The Sho\'t Left campaign was launched by ___. A credit card allows tourists to spend now and pay ___, but interest charges may apply.',
    ['SA Tourism', 'later'],
    'SA Tourism runs the Sho\'t Left campaign. Credit cards offer a "buy now, pay later" facility, with interest on outstanding balances.'),
  t(6, '## Regional and International Tourism\n\n### Regional Tourism\n\n**Regional tourism** refers to travel between countries in the same geographic region. For South Africa, this means travel within the **SADC** (Southern African Development Community) region.\n\n**Benefits of regional tourism:**\n- Shorter travel distances and cheaper transport\n- Cultural similarities make travel comfortable\n- Shared tourism marketing (multi-destination packages)\n- Economic growth for the entire region\n\n### International Tourism\n\n**International tourism** involves travel between countries in different regions of the world.\n\n**South Africa\'s main international source markets:**\n- United Kingdom\n- Germany\n- United States of America\n- France\n- Netherlands\n- China (growing market)\n- India (growing market)\n\n**Why tourists visit South Africa:**\n- Value for money (favourable exchange rate)\n- Wildlife and safari experiences\n- Diverse landscapes and natural beauty\n- Rich cultural heritage\n- World-class infrastructure\n- Adventure activities\n- Wine regions and cuisine'),
  q(7, 'Which of the following is one of South Africa\'s main international source markets for tourism?',
    ['United Kingdom', 'Brazil', 'Japan', 'Russia'], 0,
    'The United Kingdom is consistently one of the top source markets for international tourists visiting South Africa.'),
  t(8, '### Domestic Tourism Statistics\n\nTourism statistics help the industry understand trends, plan services, and make decisions.\n\n**Key statistical concepts:**\n\n| Concept | Meaning |\n|---------|--------|\n| **Arrivals** | The number of tourists entering a destination |\n| **Bed nights** | Total number of nights spent by tourists (arrivals x average stay) |\n| **Average length of stay** | The average number of nights a tourist stays |\n| **Expenditure per tourist** | Average amount spent per tourist per trip |\n| **Occupancy rate** | Percentage of available rooms that are occupied |\n| **Seasonality** | Variation in tourist numbers by season (peak vs off-peak) |\n| **Most visited provinces** | Provinces receiving the highest number of tourists |\n\n**Interpreting tourism statistics:**\n- **Peak season** (December-January) has the highest domestic travel\n- **Gauteng** generates the most domestic tourists (outbound from Gauteng)\n- **KwaZulu-Natal** and **Limpopo** are top destinations for domestic tourists\n- **VFR (visiting friends and relatives)** is the most common purpose for domestic travel\n- The domestic tourism market is **larger** than the international market in terms of trip numbers'),
  q(9, 'Which province generates the most domestic tourists in South Africa?',
    ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Limpopo'], 0,
    'Gauteng, as the economic hub and most populous province, generates the most domestic tourists who travel to other provinces.'),
  fb(10, 'The most common purpose for domestic travel in South Africa is ___ (visiting friends and relatives). The ___ rate measures the percentage of available hotel rooms that are occupied.',
    ['VFR', 'occupancy'],
    'VFR travel dominates domestic tourism in SA. Occupancy rate = (occupied rooms / total available rooms) x 100.'),
];

// ===============================================================================
// CHAPTER 7: Tourist Attractions in South Africa (Term 3, Weeks 1-3)
// ===============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Tourist Attractions in South Africa\n\nSouth Africa is one of the most diverse tourist destinations in the world, offering a unique blend of natural beauty, cultural richness, and world-class infrastructure.\n\n### South Africa\'s World Heritage Sites (UNESCO)\n\nUNESCO (United Nations Educational, Scientific and Cultural Organization) designates sites of outstanding universal value.\n\n| Site | Province | Type |\n|------|----------|------|\n| **Robben Island** | Western Cape | Cultural |\n| **Cradle of Humankind** | Gauteng / North West | Cultural |\n| **Mapungubwe Cultural Landscape** | Limpopo | Cultural |\n| **Richtersveld Cultural and Botanical Landscape** | Northern Cape | Mixed |\n| **iSimangaliso Wetland Park** | KwaZulu-Natal | Natural |\n| **uKhahlamba-Drakensberg Park** | KwaZulu-Natal | Mixed |\n| **Cape Floral Region Protected Areas** | Western Cape / Eastern Cape | Natural |\n| **Vredefort Dome** | Free State / North West | Natural |\n| **Barberton Makhonjwa Mountains** | Mpumalanga | Natural |\n| **ǁKhomani Cultural Landscape** | Northern Cape | Cultural |\n\nSouth Africa has **10 UNESCO World Heritage Sites** — a mix of natural, cultural, and mixed sites.'),
  q(2, 'How many UNESCO World Heritage Sites does South Africa have?',
    ['10', '8', '12', '5'], 0,
    'South Africa has 10 UNESCO World Heritage Sites, covering natural, cultural, and mixed categories.'),
  t(3, '### Tourist Attractions by Province\n\nFor the Grade 10 CAPS exam, you must study attractions in at least **three provinces** (your own province plus two others).\n\n**Gauteng:**\n- Apartheid Museum, Johannesburg\n- Cradle of Humankind (Sterkfontein Caves, Maropeng)\n- Constitution Hill, Johannesburg\n- Gold Reef City theme park\n- Soweto (Vilakazi Street, Hector Pieterson Museum)\n\n**Western Cape:**\n- Table Mountain (New7Wonders of Nature)\n- Robben Island\n- V&A Waterfront\n- Cape Winelands (Stellenbosch, Franschhoek, Paarl)\n- Kirstenbosch National Botanical Garden\n- Cape Point and the Cape of Good Hope\n\n**KwaZulu-Natal:**\n- uKhahlamba-Drakensberg Park\n- iSimangaliso Wetland Park\n- Durban beachfront and Golden Mile\n- uShaka Marine World\n- Hluhluwe-iMfolozi Game Reserve\n- Battlefields Route (Isandlwana, Rorke\'s Drift)'),
  q(4, 'Table Mountain was named one of the New7Wonders of Nature. In which province is it located?',
    ['Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape'], 0,
    'Table Mountain is located in Cape Town, Western Cape, and was voted one of the New7Wonders of Nature in 2012.'),
  fb(5, 'The Cradle of Humankind is located in ___ province and is a UNESCO World Heritage Site. The Drakensberg Mountains are in ___ province.',
    ['Gauteng', 'KwaZulu-Natal'],
    'The Cradle of Humankind (with Sterkfontein Caves) is in Gauteng. The uKhahlamba-Drakensberg is in KwaZulu-Natal.'),
  t(6, '### More Provincial Attractions\n\n**Mpumalanga:**\n- Kruger National Park (largest game reserve in SA)\n- Blyde River Canyon (one of the largest green canyons in the world)\n- God\'s Window, Bourke\'s Luck Potholes\n- Barberton Makhonjwa Mountains (UNESCO)\n- Panorama Route\n\n**Eastern Cape:**\n- Addo Elephant National Park\n- Tsitsikamma National Park (Garden Route)\n- Wild Coast\n- Nelson Mandela Museum (Mthatha and Qunu)\n- Port Elizabeth (Gqeberha) beaches\n\n**Limpopo:**\n- Mapungubwe National Park (UNESCO)\n- Kruger National Park (northern section)\n- Waterberg Biosphere Reserve\n- Modjadji Cycad Forest\n\n**Free State:**\n- Vredefort Dome (UNESCO)\n- Golden Gate Highlands National Park\n- Clarens (the "Jewel of the Free State")\n\n**North West:**\n- Sun City and the Palace of the Lost City\n- Pilanesberg National Park\n- Hartbeespoort Dam\n\n**Northern Cape:**\n- Richtersveld (UNESCO)\n- ǁKhomani Cultural Landscape (UNESCO)\n- Augrabies Falls National Park\n- Big Hole (Kimberley Mine Museum)\n- Namaqualand flower season'),
  q(7, 'Kruger National Park is mainly located in which province?',
    ['Mpumalanga (and extending into Limpopo)', 'Gauteng', 'KwaZulu-Natal', 'North West'], 0,
    'Kruger National Park spans Mpumalanga and Limpopo provinces and is South Africa\'s largest and most famous game reserve.'),
  t(8, '### Tourist Information for Each Province\n\nFor each province studied, learners should know:\n\n| Information | Why It Matters |\n|-------------|----------------|\n| **Climate and rainfall** | Determines the best time to visit |\n| **Capital city** | Key urban tourism hub |\n| **Main languages** | Helps tourists communicate |\n| **Nearest airport** | How to access the province by air |\n| **Key attractions** | What to see and do |\n| **Location** | Where the province is in relation to others |\n\n### Climate Overview\n\n| Province | Climate |\n|----------|--------|\n| **Gauteng** | Warm summers with afternoon thunderstorms, mild dry winters |\n| **Western Cape** | Mediterranean: warm dry summers, cool wet winters |\n| **KwaZulu-Natal** | Subtropical: hot humid summers, mild winters |\n| **Mpumalanga** | Subtropical lowveld, cooler highveld |\n| **Northern Cape** | Semi-arid to arid, very hot summers, cold winters |\n| **Limpopo** | Hot and dry, warmest province |'),
  q(9, 'Which South African province has a Mediterranean climate with warm dry summers and cool wet winters?',
    ['Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Limpopo'], 0,
    'The Western Cape has a Mediterranean climate, making it unique among South African provinces — it receives most of its rainfall in winter.'),
  fb(10, 'Kruger National Park is the ___ game reserve in South Africa. Namaqualand in the ___ Cape province is famous for its annual wildflower season.',
    ['largest', 'Northern'],
    'Kruger is SA\'s largest game reserve. Namaqualand in the Northern Cape displays spectacular wildflower blooms in spring (August-September).'),
];

blockNum = 0;
const ch7_lesson2 = [
  t(1, '## South African Fauna and Flora as a Tourist Attraction\n\nSouth Africa is one of the most biodiverse countries in the world. Its unique wildlife and plant life are major reasons tourists visit.\n\n### Biodiversity in South Africa\n\n**Key facts:**\n- South Africa is the **third most biodiverse** country in the world\n- Home to **the Big Five**: lion, leopard, elephant, rhinoceros, buffalo\n- Contains the **Cape Floral Kingdom** — the smallest but richest of the world\'s six floral kingdoms\n- Has over **20 000 plant species** (about 10% of the world\'s total)\n- Home to approximately **300 mammal species**, **850 bird species**, and **8 000 plant species** found nowhere else on earth (endemic species)\n\n### The Big Five\n\n| Animal | Where to See Them |\n|--------|-------------------|\n| **Lion** | Kruger, Hluhluwe-iMfolozi, Kgalagadi, Addo |\n| **Leopard** | Kruger, Sabi Sands, Londolozi |\n| **Elephant** | Kruger, Addo Elephant NP, Tembe |\n| **Rhinoceros** (Black and White) | Kruger, Hluhluwe-iMfolozi |\n| **Buffalo** | Kruger, Hluhluwe-iMfolozi, Addo |'),
  q(2, 'Which of the following animals is NOT part of the Big Five?',
    ['Cheetah', 'Lion', 'Elephant', 'Buffalo'], 0,
    'The Big Five are lion, leopard, elephant, rhinoceros, and buffalo. The cheetah is not included, though it is a popular safari animal.'),
  t(3, '### Conservation and the Red Data List\n\nSouth Africa faces conservation challenges that threaten its biodiversity:\n\n**Red Data List categories:**\n\n| Category | Meaning |\n|----------|--------|\n| **Extinct** | No longer exists anywhere in the world (e.g., quagga, blue antelope) |\n| **Extinct in the wild** | Exists only in captivity |\n| **Critically Endangered** | Extremely high risk of extinction (e.g., riverine rabbit) |\n| **Endangered** | Very high risk of extinction (e.g., African penguin, black rhino) |\n| **Vulnerable** | High risk of extinction (e.g., cheetah, white rhino) |\n| **Near Threatened** | Close to being endangered |\n| **Least Concern** | Not currently at risk |\n\n### Threats to Biodiversity\n\n| Threat | Description |\n|--------|-------------|\n| **Poaching** | Illegal killing of animals, especially rhino (for horns) and elephant (for ivory) |\n| **Habitat destruction** | Clearing land for farming, mining, and urban development |\n| **Pollution** | Water, air, and soil pollution harming ecosystems |\n| **Over-consumption** | Harvesting plants or animals faster than they can reproduce |\n| **Alien invasive species** | Non-native plants and animals that outcompete indigenous species |\n| **Climate change** | Rising temperatures alter habitats and migration patterns |\n| **Culling** | Controlled killing to manage population sizes (controversial) |\n| **Hunting** | Legal trophy hunting (debated — some argue it funds conservation) |\n| **Mass tourism** | Too many tourists damaging fragile environments |'),
  q(4, 'What is the primary reason rhinos are poached in South Africa?',
    ['For their horns', 'For their meat', 'For their skin', 'For their tusks'], 0,
    'Rhinos are poached primarily for their horns, which are illegally sold on the black market, especially in Asia.'),
  fb(5, 'South Africa is the ___ most biodiverse country in the world. Species that exist nowhere else on earth are called ___ species.',
    ['third', 'endemic'],
    'SA ranks third globally for biodiversity. Endemic species are unique to a particular area and found nowhere else.'),
  t(6, '### Indigenous, Endemic, Alien and Exotic Species\n\n| Term | Meaning | Example |\n|------|---------|--------|\n| **Indigenous** | Native to a particular area; occurs naturally there | Yellowwood tree, protea |\n| **Endemic** | Found ONLY in a specific area, nowhere else in the world | King protea (SA\'s national flower), Cape sugarbird |\n| **Alien / invasive** | Not native; introduced from another area and causes harm | Port Jackson willow, water hyacinth, lantana |\n| **Exotic** | From another country, introduced intentionally (e.g., for gardens) | Jacaranda tree, palm trees |\n\n### The Cape Floral Kingdom (Fynbos)\n\nThe **Cape Floral Kingdom** is a UNESCO World Heritage Site and the smallest of the world\'s six floral kingdoms:\n\n- Located mainly in the **Western Cape** and **Eastern Cape**\n- Contains **fynbos** vegetation — a unique shrubland found nowhere else\n- Over **9 000 plant species**, of which about **70%** are endemic\n- Includes the **protea** (SA\'s national flower), ericas, and restios\n- Threatened by urban development, alien invasive plants, and climate change\n\nThe **Kirstenbosch National Botanical Garden** in Cape Town is one of the best places to experience fynbos and indigenous flora.'),
  q(7, 'The King Protea is South Africa\'s:',
    ['National flower', 'National tree', 'National bird', 'National animal'], 0,
    'The King Protea (Protea cynaroides) is South Africa\'s national flower and part of the unique fynbos vegetation.'),
  t(8, '### Conservation Bodies and Protected Areas\n\n| Organisation | Role |\n|-------------|------|\n| **SANParks** | Manages 21+ national parks across SA |\n| **Provincial conservation agencies** | Manage provincial nature reserves |\n| **WWF-SA** | World Wildlife Fund South Africa; conservation projects |\n| **SANBI** | SA National Biodiversity Institute; research and botanical gardens |\n| **EWT** | Endangered Wildlife Trust; protects threatened species |\n\n### Major National Parks\n\n| Park | Province | Key Feature |\n|------|----------|-------------|\n| **Kruger National Park** | Mpumalanga / Limpopo | Big Five, largest park |\n| **Table Mountain National Park** | Western Cape | Fynbos, scenic beauty |\n| **Addo Elephant National Park** | Eastern Cape | Large elephant herds |\n| **iSimangaliso Wetland Park** | KwaZulu-Natal | Wetlands, hippos, marine life |\n| **Kgalagadi Transfrontier Park** | Northern Cape / Botswana | Desert wildlife, black-maned lion |\n| **Garden Route National Park** | Western Cape / Eastern Cape | Tsitsikamma, Knysna forests |\n| **Golden Gate Highlands NP** | Free State | Sandstone cliffs, mountain scenery |'),
  q(9, 'Which organisation manages South Africa\'s national parks?',
    ['SANParks', 'SANBI', 'WWF-SA', 'EWT'], 0,
    'SANParks (South African National Parks) is the government body responsible for managing all national parks in South Africa.'),
  fb(10, 'Alien invasive species are plants or animals that are not ___ to South Africa and cause harm to local ecosystems. The Cape Floral Kingdom contains unique ___ vegetation.',
    ['native', 'fynbos'],
    'Alien invasive species come from other regions. Fynbos is the unique shrubland vegetation of the Cape Floral Kingdom.'),
];

// ===============================================================================
// CHAPTER 8: Sustainable and Responsible Tourism (Term 3, Weeks 4-7)
// ===============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Sustainable Tourism\n\nSustainable tourism meets the needs of present tourists and host communities while protecting and enhancing opportunities for the future.\n\n### The Concept of Sustainability\n\nSustainability means using resources in a way that meets today\'s needs without compromising the ability of future generations to meet their own needs.\n\n### The Three Pillars of Sustainable Tourism\n\n| Pillar | Focus | Tourism Example |\n|--------|-------|------------------|\n| **Environmental** (Planet) | Protecting natural resources | Reducing waste, saving water, protecting wildlife |\n| **Social** (People) | Benefiting local communities | Employing locals, respecting culture, community projects |\n| **Economic** (Profit) | Financial viability and fair distribution | Fair wages, supporting local businesses, sustainable revenue |\n\n### Sustainable Tourism Practices\n\n**For tourism businesses:**\n- Use **solar energy** and energy-efficient lighting\n- Install **rainwater harvesting** and greywater recycling systems\n- **Reduce, reuse, recycle** (waste management)\n- Buy food and supplies from **local producers**\n- Employ people from **surrounding communities**\n- Use **eco-friendly cleaning products**\n- Educate guests about **responsible behaviour**'),
  q(2, 'The three pillars of sustainable tourism are:',
    ['Environmental, Social, Economic', 'Transport, Accommodation, Attractions', 'Domestic, Regional, International', 'Marketing, Finance, Operations'], 0,
    'Sustainable tourism rests on three pillars: Environmental (planet), Social (people), and Economic (profit).'),
  t(3, '### Environmental Impact of Tourism\n\nTourism can have both **positive** and **negative** impacts on the environment:\n\n**Positive impacts:**\n- Revenue from tourism funds conservation and parks management\n- Tourist awareness leads to environmental protection\n- Nature-based tourism gives economic value to wild areas\n- Rehabilitation of degraded areas for tourism use\n\n**Negative impacts:**\n\n| Impact | Example |\n|--------|--------|\n| **Pollution** | Litter, vehicle emissions, noise pollution |\n| **Resource depletion** | Excessive water use by hotels and golf courses |\n| **Habitat destruction** | Clearing land for resorts and roads |\n| **Wildlife disturbance** | Vehicles too close to animals, feeding wildlife |\n| **Carbon footprint** | Air travel contributes to greenhouse gas emissions |\n| **Coral reef damage** | Snorkelling and diving damage fragile reefs |\n| **Erosion** | Foot traffic on hiking trails and dunes |'),
  q(4, 'Which of the following is a NEGATIVE environmental impact of tourism?',
    ['Air travel contributes to greenhouse gas emissions', 'Tourism revenue funds conservation', 'Nature reserves gain economic value', 'Tourists learn about environmental protection'], 0,
    'Air travel is a major source of carbon emissions, contributing to climate change. This is a significant negative impact of tourism.'),
  fb(5, 'Tourism revenue from national park entrance fees helps fund ___. The carbon ___ refers to the total greenhouse gas emissions caused by tourism activities.',
    ['conservation', 'footprint'],
    'Park fees support conservation programmes. Carbon footprint measures the greenhouse gases produced by travel and tourism activities.'),
  t(6, '### Social and Economic Impact of Tourism\n\n**Social impacts:**\n\n| Positive | Negative |\n|----------|----------|\n| Cultural exchange and understanding | Loss of cultural identity (commercialisation of traditions) |\n| Preservation of heritage sites | Overcrowding at popular sites |\n| Improved infrastructure (roads, clinics) | Increased cost of living for locals |\n| Community pride and identity | Social problems (crime, substance abuse) |\n| Skills development and training | Displacement of communities for tourism development |\n\n**Economic impacts:**\n\n| Positive | Negative |\n|----------|----------|\n| Job creation (direct and indirect) | Jobs may be seasonal (temporary) |\n| Foreign exchange earnings | Leakage — profits leaving the community |\n| Infrastructure development | Over-dependence on tourism |\n| Support for local businesses | Rising property prices push out locals |\n| Tax revenue for government | Exploitation of cheap labour |'),
  q(7, 'What is "leakage" in the context of tourism economics?',
    ['Tourism profits leaving the local community or country', 'Water leaking from hotel pipes', 'Tourists leaving the country', 'Loss of natural resources'], 0,
    'Leakage occurs when tourism revenue leaves the local economy, for example when foreign-owned hotels send profits back to their home country.'),
  t(8, '## Responsible Tourism\n\n### What is Responsible Tourism?\n\nResponsible tourism makes better places for people to live in and better places for people to visit. It asks every stakeholder to take responsibility for the impacts of tourism.\n\n### Rules for Responsible Tourist Behaviour\n\n**In nature reserves and parks:**\n- Stay on marked paths and roads\n- Do not feed or disturb animals\n- Keep noise levels low\n- Take all litter with you ("leave only footprints")\n- Do not pick plants or remove natural objects\n- Follow the speed limits on park roads\n- Keep a safe distance from wild animals\n\n**In communities:**\n- Ask permission before photographing people\n- Respect local customs and dress codes\n- Buy from local craft sellers and markets\n- Learn a few words of the local language\n- Do not give sweets or money to children (encourages begging)\n- Support community-based tourism initiatives\n\n**General:**\n- Conserve water and electricity at your accommodation\n- Choose eco-friendly accommodation and tour operators\n- Use reusable water bottles and shopping bags\n- Offset your carbon footprint where possible'),
  q(9, 'Why should tourists not feed wild animals in nature reserves?',
    ['It changes their natural behaviour and can make them dangerous to humans', 'Animals do not like human food', 'It is too expensive for tourists', 'Animals only eat at night'], 0,
    'Feeding wild animals changes their natural foraging behaviour, makes them dependent on humans, and can make them aggressive and dangerous.'),
  fb(10, 'The motto "leave only ___" reminds tourists to take all litter with them. Responsible tourists should buy crafts from ___ sellers to support the community economy.',
    ['footprints', 'local'],
    '"Leave only footprints" means tourists should not leave litter or damage the environment. Buying from local sellers keeps money in the community.'),
];

blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Global Warming and Tourism\n\nGlobal warming is a critical environmental issue that directly affects the tourism industry.\n\n### What is Global Warming?\n\nGlobal warming is the gradual increase in the earth\'s average surface temperature, primarily caused by human activities that release **greenhouse gases** into the atmosphere.\n\n### The Greenhouse Effect\n\n1. The sun\'s energy passes through the atmosphere and warms the earth\n2. The earth radiates heat back toward space\n3. **Greenhouse gases** (CO2, methane, nitrous oxide) trap some of this heat\n4. The trapped heat warms the atmosphere — this is the **greenhouse effect**\n5. Human activities (burning fossil fuels, deforestation) increase greenhouse gases\n6. More greenhouse gases = more trapped heat = **global warming**\n\n### Causes of Global Warming\n\n| Cause | How It Contributes |\n|-------|--------------------|\n| **Burning fossil fuels** | Coal, oil, and gas power stations and vehicles release CO2 |\n| **Deforestation** | Trees absorb CO2; fewer trees = more CO2 in atmosphere |\n| **Agriculture** | Livestock produce methane; rice paddies release methane |\n| **Industry** | Manufacturing processes release various greenhouse gases |\n| **Transport** | Cars, aeroplanes, ships burn fossil fuels |\n| **Waste** | Landfills produce methane as rubbish decomposes |'),
  q(2, 'Which greenhouse gas is most commonly produced by burning fossil fuels?',
    ['Carbon dioxide (CO2)', 'Oxygen (O2)', 'Nitrogen (N2)', 'Hydrogen (H2)'], 0,
    'Burning fossil fuels (coal, oil, gas) releases carbon dioxide (CO2), the most significant greenhouse gas contributing to global warming.'),
  t(3, '### Consequences of Climate Change on Tourism\n\n| Consequence | Impact on Tourism |\n|-------------|-------------------|\n| **Rising sea levels** | Coastal resorts and beaches may flood or erode |\n| **More severe weather** | Storms, floods, and droughts disrupt travel and damage infrastructure |\n| **Coral reef bleaching** | Reduced marine tourism (snorkelling, diving) |\n| **Melting glaciers** | Loss of ski resorts and scenic ice landscapes |\n| **Changed rainfall patterns** | Droughts affect wildlife, waterfalls, and green landscapes |\n| **Biodiversity loss** | Species extinction reduces wildlife tourism appeal |\n| **Heat waves** | Uncomfortable conditions for outdoor tourism activities |\n| **Spread of diseases** | Warmer climates allow tropical diseases to spread to new areas |\n\n### How Tourism Contributes to Global Warming\n\n- **Air travel** is the largest contributor (aviation accounts for about 2-3% of global CO2 emissions)\n- **Road transport** (cars, buses) burns petrol and diesel\n- **Accommodation** uses electricity (often from coal-fired power stations in SA)\n- **Activities** such as motorised water sports, quad biking, helicopter rides'),
  q(4, 'Which tourism activity contributes the most to global warming?',
    ['Air travel', 'Walking tours', 'Bird-watching', 'Visiting museums'], 0,
    'Air travel is the single largest contributor to tourism-related carbon emissions, accounting for a significant portion of the industry\'s carbon footprint.'),
  fb(5, 'Global warming is caused by the build-up of ___ gases in the atmosphere. Rising sea levels threaten ___ resorts and beaches.',
    ['greenhouse', 'coastal'],
    'Greenhouse gases trap heat in the atmosphere. Rising sea levels due to melting ice threaten low-lying coastal tourism areas.'),
  t(6, '### Reducing Tourism\'s Carbon Footprint\n\nTourism businesses and tourists can take steps to reduce their carbon footprint:\n\n**For accommodation establishments:**\n- Install **solar panels** and solar water heaters\n- Use **energy-efficient LED lighting**\n- Implement **towel and linen reuse programmes** (guests reuse towels)\n- Use **motion-sensor lights** in corridors and bathrooms\n- Install **water-saving devices** (low-flow showers, dual-flush toilets)\n- Grow **vegetable gardens** to reduce food transport emissions\n- Build with **sustainable materials** (timber, recycled materials)\n\n**For tourists:**\n- Choose **direct flights** (take-off and landing use the most fuel)\n- Use **public transport** or cycle at the destination\n- Stay at **eco-certified accommodation**\n- Offset carbon emissions through **carbon offset programmes**\n- Reduce, reuse, and recycle during travel\n- Eat **local, seasonal food** to reduce food miles\n\n**Carbon offsetting:** Tourists can calculate their trip\'s carbon emissions and pay to fund projects (like tree planting) that absorb an equivalent amount of CO2.'),
  q(7, 'Why are direct flights better for the environment than connecting flights?',
    ['Take-off and landing use the most fuel, so fewer stops means less fuel', 'Direct flights carry fewer passengers', 'Connecting flights are faster', 'Direct flights fly at lower altitudes'], 0,
    'Take-off and landing consume the most aviation fuel. Direct flights avoid extra take-offs and landings, reducing overall fuel consumption and emissions.'),
  t(8, '### Green Certification in Tourism\n\nVarious certification programmes recognise tourism businesses that operate sustainably:\n\n| Certification | Description |\n|--------------|-------------|\n| **Fair Trade Tourism** | Certifies businesses that are fair, ethical, and responsible in their practices |\n| **Green Tourism** | Recognises environmentally sustainable tourism businesses |\n| **Heritage Environmental Rating Programme** | Rates accommodation on environmental management |\n| **Blue Flag** | International award for beaches, marinas, and boats meeting environmental and safety standards |\n\n### Blue Flag Beaches in South Africa\n\nSouth Africa has numerous **Blue Flag beaches**, mainly in the Western Cape, Eastern Cape, and KwaZulu-Natal. A Blue Flag beach meets strict criteria for:\n- Water quality\n- Environmental management\n- Safety and services\n- Environmental education\n\nExamples: Clifton 4th Beach (Cape Town), Margate (KZN), Nahoon Beach (East London)'),
  q(9, 'What does a Blue Flag status indicate about a beach?',
    ['It meets international standards for water quality, safety, and environmental management', 'It is the most popular beach in the area', 'It allows dogs on the beach', 'It has the warmest water temperature'], 0,
    'Blue Flag is an international certification for beaches that meet strict standards for water quality, environmental management, safety, and education.'),
  fb(10, 'Carbon ___ allows tourists to pay for projects that absorb CO2 to compensate for their travel emissions. ___ Flag is an international award for beaches meeting environmental and safety standards.',
    ['offsetting', 'Blue'],
    'Carbon offsetting funds projects like tree planting to compensate for emissions. Blue Flag certifies beaches meeting international environmental standards.'),
];

// ===============================================================================
// CHAPTER 9: Marketing in Tourism (Term 3, Week 8)
// ===============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Marketing in Tourism\n\nMarketing is the process of identifying, anticipating, and satisfying customer needs in a way that is profitable for the business.\n\n### Why Marketing is Important in Tourism\n\n- Tourism products are **intangible** (you cannot touch or test them before buying)\n- Tourists must be **persuaded** to choose one destination over another\n- Competition between destinations and businesses is intense\n- Marketing creates **awareness** of what is available\n- Effective marketing increases **visitor numbers** and **revenue**\n\n### The Marketing Mix (4 Ps)\n\n| Element | Description | Tourism Example |\n|---------|-------------|------------------|\n| **Product** | What the business sells | A safari package, hotel stay, guided tour |\n| **Price** | What the customer pays | R8 500 per person for a 3-night safari |\n| **Place** | Where and how the product is sold | Travel agency, website, online platforms (Booking.com) |\n| **Promotion** | How the product is communicated | Advertising, social media posts, brochures |\n\nIn tourism, three additional Ps are often added:\n- **People** — the quality and attitude of staff\n- **Process** — how the service is delivered (booking, check-in, etc.)\n- **Physical evidence** — tangible proof of quality (brochures, clean facilities, uniforms)'),
  q(2, 'Why are tourism products described as "intangible"?',
    ['You cannot touch, see, or test them before purchasing', 'They are very expensive', 'They are only available online', 'They do not really exist'], 0,
    'Tourism products are intangible because you cannot physically touch or try a hotel room, safari, or flight before buying — you rely on descriptions, photos, and reviews.'),
  t(3, '### Target Markets\n\nA **target market** is the specific group of people a business wants to reach with its marketing efforts.\n\n**Ways to identify a target market:**\n\n| Method | Description | Example |\n|--------|-------------|--------|\n| **Demographics** | Age, gender, income, family status | Young adults 18-30, families with children |\n| **Geographics** | Where they live | Gauteng residents, European tourists |\n| **Psychographics** | Lifestyle, interests, values | Adventure seekers, luxury travellers, eco-conscious |\n| **Behavioural** | Spending habits, travel frequency, brand loyalty | Frequent flyers, budget travellers |\n\n### Market Research\n\nBefore marketing, businesses must research their target market:\n- **Surveys and questionnaires** — ask potential customers what they want\n- **Focus groups** — small groups discuss their travel preferences\n- **Online analytics** — track website visits, social media engagement\n- **Competitor analysis** — study what competitors offer and charge\n- **Tourism statistics** — use data from SA Tourism and Stats SA'),
  q(4, 'Segmenting a market based on lifestyle and interests is called:',
    ['Psychographic segmentation', 'Demographic segmentation', 'Geographic segmentation', 'Behavioural segmentation'], 0,
    'Psychographic segmentation divides the market based on lifestyle, interests, values, and personality traits.'),
  fb(5, 'The 4 Ps of the marketing mix are Product, Price, Place, and ___. The specific group of people a business wants to reach is called the ___ market.',
    ['Promotion', 'target'],
    'The 4 Ps include Product, Price, Place, and Promotion. Businesses identify a target market to focus their marketing efforts effectively.'),
  t(6, '### Marketing Strategies for Tourism Products and Services\n\n**Advertising channels:**\n\n| Channel | Strengths | Best For |\n|---------|-----------|----------|\n| **Television** | Wide reach, visual and audio impact | Large tourism bodies (SA Tourism) |\n| **Radio** | Affordable, reaches commuters | Provincial tourism, local events |\n| **Newspapers / magazines** | Detailed information, can be kept | Travel supplements, niche magazines |\n| **Billboards / signage** | Visible 24/7, high traffic areas | Roadside attractions, route marketing |\n| **Social media** | Cost-effective, highly targeted, interactive | All tourism businesses |\n| **Websites** | Available 24/7, global reach, bookings | Hotels, tour operators, attractions |\n| **Brochures / pamphlets** | Tangible, detailed, can be shared | Visitor centres, travel expos |\n| **Word of mouth** | Most trusted form of marketing | All businesses (earned through good service) |\n\n### The Role of Social Media in Tourism Marketing\n\nSocial media platforms are now the most important marketing tool for tourism:\n- **Instagram** — visual platform ideal for sharing destination photos\n- **Facebook** — community building, event promotion, reviews\n- **TikTok** — short videos reaching young travellers\n- **YouTube** — destination videos, virtual tours, travel vlogs\n- **Twitter/X** — real-time updates, customer service\n- **Pinterest** — travel inspiration boards'),
  q(7, 'Which form of marketing is generally considered the most trusted by consumers?',
    ['Word of mouth', 'Television advertising', 'Billboards', 'Social media ads'], 0,
    'Word of mouth is the most trusted form of marketing because people trust recommendations from friends and family more than any form of advertising.'),
  t(8, '### Marketing Tourism Products, Services and Sites\n\n**Tourism products** include packages, experiences, and tangible items:\n- Safari packages, city tours, wine-tasting experiences\n- Souvenirs, local crafts, food products\n\n**Tourism services** include hospitality and support:\n- Hotel accommodation, restaurant dining, car rental\n- Tour guiding, travel insurance, currency exchange\n\n**Tourism sites** include destinations and attractions:\n- National parks, heritage sites, beaches, cultural villages\n\n### Competitive Edge and Niche Markets\n\nA **competitive edge** is what makes a business stand out from competitors:\n- **Unique selling point (USP)** — what makes you different\n- **Quality of service** — exceeding customer expectations\n- **Value for money** — offering more for the same price\n- **Location** — being in a prime position\n\nA **niche market** is a small, specialised segment of the market:\n- Bird-watching tourism\n- Battlefield tourism\n- Wine tourism\n- Dark tourism\n- Voluntourism (volunteer + tourism)'),
  q(9, 'A "niche market" in tourism refers to:',
    ['A small, specialised segment of the tourism market', 'The largest tourism market', 'All international tourists', 'Government tourism departments'], 0,
    'A niche market is a small, specialised segment — for example, bird-watching tourists form a niche market with specific interests and needs.'),
  fb(10, 'A business\'s ___ selling point (USP) is what makes it different from competitors. ___ media platforms like Instagram and TikTok are now critical tools for tourism marketing.',
    ['unique', 'Social'],
    'A USP (unique selling point) differentiates a business from competitors. Social media is essential for modern tourism marketing.'),
];

// ===============================================================================
// CHAPTER 10: Culture and Heritage (Term 4, Week 1)
// ===============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Culture and Heritage in Tourism\n\n### Key Concepts\n\n| Term | Definition |\n|------|------------|\n| **Culture** | The shared beliefs, customs, arts, language, food, dress, and traditions of a group of people |\n| **Heritage** | The traditions, monuments, objects, and culture inherited from past generations |\n| **Cultural diversity** | The variety of different cultures within a society or country |\n| **Cultural tourism** | Travelling to experience the culture, traditions, and heritage of a destination |\n| **Heritage tourism** | Visiting historical sites, monuments, and places of historical significance |\n\n### Elements of Culture\n\nCulture includes many aspects of how people live:\n\n| Element | Examples |\n|---------|----------|\n| **Arts and crafts** | Beadwork (Zulu/Ndebele), pottery, weaving, woodcarving |\n| **Cuisine / food** | Biltong, bobotie, bunny chow, pap and vleis, potjiekos |\n| **Music and dance** | Gumboot dancing, traditional Zulu dancing, Maskandi music, Cape Minstrels |\n| **Language** | 11 official languages in South Africa |\n| **Dress / clothing** | Traditional Xhosa dress, Ndebele beaded aprons, Venda musisi |\n| **Customs and rituals** | Lobola (bride price), initiation ceremonies, harvest festivals |\n| **Religion** | Christianity, Islam, Hinduism, traditional African religions, Judaism |\n| **Architecture** | Ndebele painted houses, Cape Dutch architecture, Zulu beehive huts |'),
  q(2, 'South Africa has how many official languages?',
    ['11', '9', '7', '13'], 0,
    'South Africa recognises 11 official languages, reflecting its rich cultural diversity as the Rainbow Nation.'),
  t(3, '### The Importance of Conserving Heritage\n\nHeritage must be conserved (protected and maintained) so that future generations can learn from and appreciate it.\n\n**Why conserve heritage?**\n- Preserves the **identity** and **history** of communities\n- Provides **educational value** for learners and researchers\n- Generates **tourism revenue** through heritage attractions\n- Creates **employment** (guides, curators, maintenance staff)\n- Promotes **cultural pride** and **national unity**\n- Contributes to **global knowledge** (UNESCO World Heritage Sites)\n\n### Heritage Sites in South Africa\n\n| Site | Province | Significance |\n|------|----------|-------------|\n| **Robben Island** | Western Cape | Political prison where Nelson Mandela was held |\n| **Apartheid Museum** | Gauteng | Documents the history of apartheid |\n| **Hector Pieterson Museum** | Gauteng (Soweto) | Remembers the 1976 Soweto Uprising |\n| **District Six Museum** | Western Cape | Tells the story of forced removals |\n| **Constitution Hill** | Gauteng | Former prison, now home to the Constitutional Court |\n| **Cradle of Humankind** | Gauteng | Fossils of early human ancestors |\n| **Mapungubwe** | Limpopo | Ancient southern African kingdom |\n| **Freedom Park** | Gauteng (Pretoria) | Honours those who fought for freedom and democracy |'),
  q(4, 'Robben Island is significant in South Africa\'s history because:',
    ['It was a political prison where Nelson Mandela was held for 18 years', 'It is the site of the first European settlement', 'It is South Africa\'s largest island', 'It is a popular beach resort'], 0,
    'Robben Island is a World Heritage Site and former prison where Nelson Mandela and other political prisoners were held during apartheid.'),
  fb(5, 'Heritage conservation preserves the ___ and history of communities for future generations. South Africa is called the Rainbow ___ because of its cultural diversity.',
    ['identity', 'Nation'],
    'Conservation protects cultural identity. South Africa\'s name "Rainbow Nation" celebrates its diverse cultural groups.'),
  t(6, '### Heritage Sites in Your Own Province\n\nFor the CAPS exam, learners must be able to identify and describe heritage sites in their own province. Consider:\n\n**For each heritage site, know:**\n- **Name** of the site\n- **Location** (nearest city or town)\n- **Short description** (what is it and why is it significant?)\n- **Type of attraction** (cultural, natural, or mixed)\n\n### South Africa\'s Public Holidays with Heritage Significance\n\n| Date | Public Holiday | Heritage Significance |\n|------|---------------|----------------------|\n| 21 March | Human Rights Day | Commemorates the Sharpeville Massacre (1960) |\n| 27 April | Freedom Day | First democratic elections (1994) |\n| 1 May | Workers\' Day | Honours the labour movement |\n| 16 June | Youth Day | Commemorates the 1976 Soweto Uprising |\n| 9 August | National Women\'s Day | 1956 Women\'s March to the Union Buildings |\n| 24 September | Heritage Day | Celebrates cultural diversity and heritage |\n| 16 December | Day of Reconciliation | Promotes unity between all South Africans |'),
  q(7, 'Heritage Day in South Africa is celebrated on:',
    ['24 September', '27 April', '16 June', '9 August'], 0,
    'Heritage Day is celebrated on 24 September each year, encouraging all South Africans to celebrate their cultural heritage.'),
  t(8, '### Cultural Sensitivity in Tourism\n\nTourists and tourism workers must be **culturally sensitive** — respectful and aware of cultural differences.\n\n**Guidelines for cultural sensitivity:**\n- Learn about the culture of the destination before visiting\n- Dress appropriately, especially at religious or traditional sites\n- Ask before photographing people or sacred places\n- Do not mock or trivialise cultural practices\n- Eat local food and show appreciation for traditions\n- Be patient with language differences\n- Avoid stereotyping or making assumptions about cultures\n\n**The danger of cultural commercialisation:**\n- Some cultural practices are "performed" for tourists in an inauthentic way\n- This can trivialise sacred traditions\n- Communities may lose the true meaning of their rituals\n- Balance is needed between sharing culture and protecting its integrity\n\nAuthentic cultural tourism allows visitors to genuinely experience and appreciate different ways of life, while the community maintains control over how their culture is presented.'),
  q(9, 'What is a risk of cultural commercialisation in tourism?',
    ['Sacred traditions may be trivialised or lose their authentic meaning', 'More tourists will visit the area', 'The community will earn more money', 'International awareness will increase'], 0,
    'Cultural commercialisation risks reducing sacred, meaningful traditions to superficial tourist performances, losing their authentic significance.'),
  fb(10, 'Being aware of and respectful towards cultural differences is called cultural ___. Heritage Day encourages South Africans to celebrate their cultural ___ and heritage.',
    ['sensitivity', 'diversity'],
    'Cultural sensitivity means being respectful of different cultures. Heritage Day (24 September) celebrates South Africa\'s rich cultural diversity.'),
];

// ===============================================================================
// CHAPTER 11: Communication and Customer Care (Term 4, Weeks 2-4)
// ===============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Communication Technology in Tourism\n\nTechnology has transformed how the tourism industry operates and communicates with customers.\n\n### Types of Communication Technology\n\n| Technology | Use in Tourism |\n|-----------|----------------|\n| **Landline telephone** | Making reservations, customer enquiries |\n| **Cell phone / smartphone** | Bookings, apps, GPS navigation, social media |\n| **Fax machine** | Sending documents (declining in use) |\n| **Email** | Booking confirmations, enquiries, newsletters |\n| **Computer / internet** | Online bookings, research, marketing |\n| **Video conferencing** | Virtual meetings (Zoom, Teams) — reduced business travel |\n| **Teleconferencing** | Audio-only group calls for meetings |\n| **Photocopying machine** | Duplicating documents, tickets, vouchers |\n| **Printer** | Printing itineraries, boarding passes, invoices |\n| **Social media** | Marketing, customer engagement, reviews (Facebook, Instagram, TikTok) |\n\n### Functions of Communication Technology\n\nEach technology serves specific functions:\n\n| Function | Technology Used |\n|----------|----------------|\n| **Reservations / bookings** | Phone, email, websites, apps |\n| **Marketing and advertising** | Social media, websites, email newsletters |\n| **Information sharing** | Websites, brochures (digital), tourism apps |\n| **Customer feedback** | Online reviews, survey apps, social media |\n| **Navigation and directions** | GPS, Google Maps, tourism apps |'),
  q(2, 'Which technology has largely replaced the fax machine for sending documents in the tourism industry?',
    ['Email', 'Landline telephone', 'Fax machine upgrades', 'Telegram'], 0,
    'Email has largely replaced fax machines for sending documents, as it is faster, more reliable, and can include attachments.'),
  t(3, '### Advantages and Disadvantages of Communication Technology\n\n| Technology | Advantages | Disadvantages |\n|-----------|-----------|---------------|\n| **Email** | Fast, written record, can attach documents, free | Spam, requires internet, may be missed |\n| **Cell phone** | Portable, immediate, multifunctional | Battery dependent, costs data, theft risk |\n| **Social media** | Free, wide reach, interactive, visual | Negative reviews visible, needs constant updating |\n| **Video conferencing** | Face-to-face without travel, saves time and money | Needs good internet, technical glitches |\n| **Website** | Available 24/7, global reach, online bookings | Costs to build and maintain, needs updates |\n| **Landline** | Reliable, clear sound, no data needed | Not portable, limited to one location |\n\n### Tourism Road and Information Signs\n\nRoad and information signs are important communication tools in tourism:\n\n| Sign Type | Description |\n|-----------|-------------|\n| **Brown tourism signs** | Direct tourists to attractions (with tourism symbols) |\n| **Green road signs** | Show directions and distances on national routes |\n| **Blue information signs** | Indicate services like petrol stations, hospitals, rest areas |\n| **i-signs** | Tourist information centres marked with a white \"i\" on blue |\n\nThese signs help tourists navigate and find attractions, services, and facilities.'),
  q(4, 'What colour are the road signs that direct tourists to attractions in South Africa?',
    ['Brown', 'Green', 'Blue', 'Red'], 0,
    'Brown road signs in South Africa indicate tourist attractions and points of interest, helping visitors navigate to destinations.'),
  fb(5, 'Video conferencing tools like Zoom allow face-to-face meetings without ___. Brown road signs in South Africa direct tourists to ___.',
    ['travel', 'attractions'],
    'Video conferencing saves travel time and costs. Brown tourism signs guide tourists to attractions along South African roads.'),
  t(6, '## Verbal and Written Communication\n\n### Verbal Communication\n\nVerbal communication is spoken interaction — either face-to-face or over the phone.\n\n**Skills for effective verbal communication in tourism:**\n- Speak clearly and at a comfortable pace\n- Use a **friendly, professional tone**\n- **Listen actively** — give full attention, do not interrupt\n- Use the customer\'s name where appropriate\n- Avoid slang and jargon\n- Be patient with **language barriers**\n- Use **positive body language** (smile, eye contact, open posture)\n\n### Written Communication\n\nWritten communication includes emails, letters, reports, social media posts, and signage.\n\n**Principles of good written communication:**\n- Correct grammar, spelling, and punctuation\n- Clear and concise language\n- Professional and polite tone\n- Include all necessary information\n- Proofread before sending\n- Use the appropriate format (formal letter vs casual email)'),
  q(7, 'Which of the following demonstrates positive body language when serving a tourist?',
    ['Smiling and maintaining eye contact', 'Crossing arms and looking away', 'Checking your phone while talking', 'Chewing gum while serving'], 0,
    'Smiling and maintaining eye contact show the customer you are engaged, friendly, and ready to help — key elements of positive body language.'),
  t(8, '## Service Excellence\n\nService excellence means consistently delivering outstanding service that **exceeds** customer expectations.\n\n### Why Service Excellence Matters\n\n- Creates **loyal, repeat customers** who return\n- Generates positive **word-of-mouth** recommendations\n- Produces good **online reviews** (TripAdvisor, Google)\n- Gives a **competitive advantage** over other businesses\n- Justifies **premium pricing**\n- Builds a strong **brand reputation**\n\n### Characteristics of Excellent Service\n\n| Characteristic | Meaning |\n|----------------|--------|\n| **Reliability** | Delivering what was promised, consistently |\n| **Responsiveness** | Quick and willing to help |\n| **Competence** | Staff who are knowledgeable and skilled |\n| **Courtesy** | Polite, respectful, and friendly |\n| **Communication** | Keeping customers informed |\n| **Credibility** | Honest and trustworthy |\n| **Security** | Customers feel safe (physically and financially) |\n| **Tangibles** | Clean facilities, neat appearance, quality equipment |\n\n### Benefits for a Tourism Business\n\n- Satisfied tourists spend more\n- Positive reviews attract new customers\n- Staff morale improves when service standards are high\n- Fewer complaints and refunds\n- Increased profitability'),
  q(9, 'Delivering what was promised to the customer, every single time, is an example of:',
    ['Reliability', 'Responsiveness', 'Courtesy', 'Credibility'], 0,
    'Reliability means consistently delivering on promises — if a hotel advertises free Wi-Fi, it must always provide free Wi-Fi.'),
  fb(10, 'Service excellence creates loyal ___ customers who visit again. Positive word-of-___ is one of the most powerful marketing tools in tourism.',
    ['repeat', 'mouth'],
    'Excellent service turns visitors into repeat customers. Word-of-mouth recommendations from satisfied tourists are extremely influential.'),
];

// ===============================================================================
// CHAPTER 12: Revision and Exam Preparation (Term 4)
// ===============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Revision and Exam Preparation\n\n### Grade 10 Tourism Exam Structure\n\nThe Grade 10 Tourism exam typically consists of:\n\n| Component | Details |\n|-----------|--------|\n| **Paper 1** | 3 hours, 200 marks |\n| **Section A** | Short questions (multiple choice, matching columns, true/false) |\n| **Section B** | Map work and tour planning |\n| **Section C** | Longer paragraph and essay-type questions covering all topics |\n\n### Key Topics per Term\n\n| Term | Topics Covered |\n|------|----------------|\n| **Term 1** | Introduction to tourism, tourism sectors (transport, accommodation, food & beverage, attractions), structure of SA tourism industry (public & private sector) |\n| **Term 2** | Map work and tour planning, distance tables, time zones, domestic/regional/international tourism, payment methods, tourism statistics |\n| **Term 3** | Tourist attractions in SA (by province, UNESCO sites, fauna & flora, biodiversity), sustainable and responsible tourism, global warming, marketing |\n| **Term 4** | Culture and heritage, communication technology, verbal/written communication, service excellence |'),
  q(2, 'How many marks is the Grade 10 Tourism Paper 1 typically worth?',
    ['200 marks', '150 marks', '100 marks', '300 marks'], 0,
    'The Grade 10 Tourism Paper 1 is typically worth 200 marks and is written over 3 hours.'),
  t(3, '### Term 1 Revision: Tourism Sectors\n\n**Key definitions:**\n- Tourist = overnight visitor (24+ hours)\n- Excursionist = day visitor (less than 24 hours)\n- Domestic tourism = within own country\n- Inbound = foreigners coming in; Outbound = locals going abroad\n\n**Tourism sectors:**\n- Transport (road, air, rail, water)\n- Accommodation (hotels, B&Bs, lodges, hostels, self-catering)\n- Food and beverage (restaurants, fast food, coffee shops)\n- Attractions (natural vs man-made, primary vs secondary)\n- Travel organisers and support services\n\n**Accommodation:**\n- TGCSA star grading: 1-star (basic) to 5-star (world-class)\n- Key terms: pps, pppn, en suite, half board, full board, all-inclusive\n\n**Structure of SA tourism:**\n- Public sector: Department of Tourism, SA Tourism, TGCSA, SANParks, SAHRA\n- Private sector: product owners, associations (FEDHASA, ASATA, SATSA, TBCSA)\n- SOEs: SAA, ACSA, PRASA'),
  t(4, '### Term 2 Revision: Maps and Tourism\n\n**Map terminology:**\n- Scale, legend, latitude (horizontal), longitude (vertical)\n- Equator (0° latitude), Prime Meridian (0° longitude)\n- SAST = UTC+2\n\n**Time zone calculation:** 24 time zones, 15° each\n- Moving east = add time; moving west = subtract time\n\n**Distance:** Travel time = Distance / Speed\n- Freeway speed limit = 120 km/h; urban = 60 km/h\n\n**SA provinces and capitals:** Nine provinces, each with tourism authority\n- Cape Agulhas = southernmost point of Africa\n\n**Domestic tourism:** Sho\'t Left campaign, VFR as dominant purpose\n**Payment methods:** Cash, credit/debit cards, ATM, cell phone, speed point\n**Statistics:** Arrivals, bed nights, occupancy rate, seasonality'),
  q(5, 'South African Standard Time (SAST) is how many hours ahead of UTC?',
    ['2 hours', '1 hour', '3 hours', '5 hours'], 0,
    'SAST is UTC+2, meaning South Africa is 2 hours ahead of Coordinated Universal Time (Greenwich).'),
  t(6, '### Term 3 Revision: Attractions and Sustainability\n\n**SA World Heritage Sites:** 10 UNESCO sites (know the name, province, and type)\n\n**Provincial attractions:** Study your own province + two others\n- Know: climate, capital, languages, airport, key attractions\n\n**Biodiversity:**\n- SA = third most biodiverse country\n- Big Five: lion, leopard, elephant, rhino, buffalo\n- Cape Floral Kingdom: smallest floral kingdom, fynbos, protea (national flower)\n- Conservation bodies: SANParks, SANBI, WWF-SA, EWT\n\n**Sustainability:** Three pillars — Planet, People, Profit\n- Environmental impacts: pollution, carbon footprint, resource depletion\n- Social impacts: cultural exchange vs cultural commercialisation\n- Economic impacts: job creation vs leakage\n\n**Global warming:** Greenhouse gases, causes, consequences for tourism\n- Carbon footprint reduction: solar energy, direct flights, eco-certification\n- Green certifications: Fair Trade Tourism, Blue Flag, Heritage Rating\n\n**Marketing:** 4 Ps (Product, Price, Place, Promotion), 7 Ps\n- Target markets: demographics, geographics, psychographics, behavioural\n- USP, competitive edge, niche markets'),
  fb(7, 'South Africa\'s national flower is the ___. The three pillars of sustainability are People, ___, and Profit.',
    ['protea', 'Planet'],
    'The King Protea is South Africa\'s national flower. The sustainability pillars are People (social), Planet (environmental), and Profit (economic).'),
  t(8, '### Term 4 Revision: Culture, Communication, and Service\n\n**Culture and heritage:**\n- Culture = shared beliefs, customs, traditions of a group\n- Heritage = traditions and monuments inherited from the past\n- 11 official languages in SA\n- Heritage Day = 24 September\n- Cultural sensitivity: respect differences, avoid stereotypes\n- Risk of cultural commercialisation: trivialising traditions\n\n**Communication technology:**\n- Types: landline, cell phone, email, fax, video conferencing, social media\n- Tourism signs: brown (attractions), green (directions), blue (services), i (information)\n- Verbal communication: speak clearly, listen actively, positive body language\n- Written communication: correct grammar, professional tone, proofread\n\n**Service excellence:**\n- Characteristics: reliability, responsiveness, competence, courtesy, communication, credibility, security, tangibles\n- Benefits: repeat customers, word-of-mouth, online reviews, competitive advantage\n- Intangibility of tourism: cannot test before buying, so service quality is crucial'),
  q(9, 'Which of the following is a characteristic of service excellence?',
    ['Reliability — delivering what was promised, consistently', 'Only hiring foreign staff', 'Charging the highest prices', 'Ignoring customer complaints'], 0,
    'Reliability means consistently keeping promises and delivering the expected level of service every time.'),
  fb(10, 'Brown road signs direct tourists to ___. Tourism products are described as ___ because you cannot touch or test them before purchase.',
    ['attractions', 'intangible'],
    'Brown tourism signs guide visitors to attractions. Tourism products are intangible — they must be experienced, not handled.'),
];

// ===============================================================================
// MAIN — insert into MongoDB
// ===============================================================================
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
      title: 'Chapter 1: Introduction to Tourism',
      description: 'What is tourism, key definitions, why people travel, tourist profiles, types of tourism, tourist needs and expectations.',
      order: 1,
      lessons: [
        { title: 'What is Tourism?', description: 'Key definitions (tourist, excursionist, inbound, outbound, domestic), reasons for travel, tourist profiles, and types of tourism.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Tourism Sectors',
      description: 'Overview of tourism sectors, transport (road, air, rail, water), accommodation types and star grading, facilities and services.',
      order: 2,
      lessons: [
        { title: 'Tourism Sectors and Transport', description: 'The six tourism sectors, modes of transport, road/air/rail transport in SA, airports, airlines, and comparing transport options.', blocks: ch2_lesson1, term: 1 },
        { title: 'Accommodation Sector', description: 'Types of accommodation, terminology, pricing concepts, TGCSA star grading system, and facilities offered.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Food & Beverage and Attractions',
      description: 'Food and beverage establishments, meal plans, service styles, types of tourist attractions, primary vs secondary attractions.',
      order: 3,
      lessons: [
        { title: 'Food & Beverage and Attractions Sectors', description: 'Types of F&B establishments, meal plans, breakfast types, service styles, attraction types, and subsectors.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Structure of the SA Tourism Industry',
      description: 'Public sector (government), private sector, provincial tourism authorities, industry associations, state-owned enterprises, and partnerships.',
      order: 4,
      lessons: [
        { title: 'Public and Private Sectors in Tourism', description: 'Department of Tourism, SA Tourism, TGCSA, SANParks, provincial tourism authorities, FEDHASA, ASATA, SATSA, SOEs, and public-private partnerships.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Map Work and Tour Planning',
      description: 'Map terminology, types of maps, map symbols, time zones, SA provinces, distance tables, travel time calculations, and tour planning.',
      order: 5,
      lessons: [
        { title: 'Map Terminology and Time Zones', description: 'Map terms, types of maps, symbols, latitude, longitude, time zones, SAST, locating SA on a map, and nine provinces.', blocks: ch5_lesson1, term: 2 },
        { title: 'Distance Tables and Tour Planning', description: 'Reading distance tables, calculating travel time, distance indicators, tour planning steps, and SA in the world.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Domestic, Regional and International Tourism',
      description: 'Benefits of domestic tourism, Sho\'t Left campaign, payment methods, regional and international tourism, source markets, and tourism statistics.',
      order: 6,
      lessons: [
        { title: 'Domestic, Regional and International Tourism', description: 'Domestic tourism benefits, Sho\'t Left, payment methods, regional/international tourism, source markets, and statistics.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Tourist Attractions in South Africa',
      description: 'UNESCO World Heritage Sites, attractions by province, climate, South African fauna and flora, biodiversity, conservation, and protected areas.',
      order: 7,
      lessons: [
        { title: 'Tourist Attractions by Province', description: 'UNESCO World Heritage Sites, attractions across all nine provinces, climate overview, and provincial tourist information.', blocks: ch7_lesson1, term: 3 },
        { title: 'South African Fauna and Flora', description: 'Biodiversity, Big Five, Red Data List, conservation threats, indigenous/endemic/alien species, Cape Floral Kingdom, SANParks.', blocks: ch7_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Sustainable and Responsible Tourism',
      description: 'Three pillars of sustainability, environmental/social/economic impacts, responsible tourist behaviour, global warming, carbon footprint, green certifications.',
      order: 8,
      lessons: [
        { title: 'Sustainable and Responsible Tourism', description: 'Sustainability pillars, impacts of tourism (environmental, social, economic), responsible behaviour rules, and leakage.', blocks: ch8_lesson1, term: 3 },
        { title: 'Global Warming and Green Tourism', description: 'Greenhouse effect, causes and consequences of climate change, reducing carbon footprint, and green certifications.', blocks: ch8_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Marketing in Tourism',
      description: 'Marketing concepts, 4 Ps and 7 Ps, target markets, market research, advertising channels, social media, competitive edge, and niche markets.',
      order: 9,
      lessons: [
        { title: 'Marketing in Tourism', description: 'The marketing mix, target markets, market research, advertising channels, social media marketing, USPs, and niche markets.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Culture and Heritage',
      description: 'Culture concepts, elements of culture, heritage conservation, heritage sites in SA, public holidays, and cultural sensitivity.',
      order: 10,
      lessons: [
        { title: 'Culture and Heritage in Tourism', description: 'Culture, heritage, cultural diversity, elements of culture, heritage conservation, heritage sites, public holidays, and cultural sensitivity.', blocks: ch10_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 11: Communication and Customer Care',
      description: 'Communication technology, advantages and disadvantages, tourism road signs, verbal and written communication, and service excellence.',
      order: 11,
      lessons: [
        { title: 'Communication and Service Excellence', description: 'Communication technology in tourism, tourism signs, verbal/written communication, and characteristics of service excellence.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Revision and Exam Preparation',
      description: 'Comprehensive revision of all Grade 10 Tourism topics across Terms 1-4, exam structure, and key summaries per term.',
      order: 12,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Full revision covering all Grade 10 Tourism topics: sectors, maps, domestic tourism, attractions, sustainability, marketing, culture, communication, and service.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 10 Tourism \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Introduction to Tourism, Tourism Sectors, Food & Beverage, Attractions, SA Tourism Industry Structure, Map Work, Domestic/Regional/International Tourism, Provincial Attractions, Biodiversity, Sustainable Tourism, Marketing, Culture & Heritage, Communication, and Service Excellence for the Grade 10 Tourism curriculum.',
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
  console.log('  TEXTBOOK: Grade 10 Tourism');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
