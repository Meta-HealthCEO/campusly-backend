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
// CHAPTER 1: Factors of Production (Term 1)
// =============================================================================

blockNum = 0;
const ch1_lesson1 = [
  t(1, "## Factors of Production\n\nEconomics studies how scarce resources are allocated to satisfy unlimited human wants. The resources used to produce goods and services are called **factors of production**. There are four factors:\n\n| Factor | Description | Remuneration |\n|--------|-------------|-------------|\n| **Land (Natural resources)** | All natural resources used in production: soil, water, minerals, forests, climate | **Rent** |\n| **Labour** | Human physical and mental effort used in production | **Wages/Salaries** |\n| **Capital** | Man-made resources used to produce other goods: machinery, tools, buildings, technology | **Interest** |\n| **Entrepreneurship** | The ability to combine the other three factors, take risks, and innovate | **Profit** |\n\nIn South Africa, these factors are unevenly distributed, which contributes to inequality and poverty."),
  t(2, "### Land (Natural Resources)\n\nLand includes everything provided by nature that can be used in production:\n\n- **Renewable resources**: Water, timber, wind, solar energy (can be replenished)\n- **Non-renewable resources**: Coal, gold, platinum, iron ore, crude oil (finite supply)\n\nSouth Africa is rich in natural resources:\n- World leader in platinum, manganese, and chrome production\n- Significant gold, coal, and iron ore reserves\n- Agricultural land for maize, sugar cane, citrus, and wine\n\n**Accessibility of land:**\nHistorically, land ownership in SA was unequal due to apartheid policies (e.g., the 1913 Natives Land Act restricted Black South Africans to 13% of the land). Land reform remains a critical issue, with three pillars: restitution, redistribution, and tenure reform.\n\nThe remuneration for land is **rent** - payment for the use of natural resources."),
  q(3, "Which of the following is a non-renewable natural resource?",
    ["Timber", "Wind energy", "Platinum", "Solar energy"], 2,
    "Platinum is a non-renewable resource because once mined, it cannot be replenished naturally. Timber, wind, and solar energy are all renewable."),
  t(4, "### Labour\n\nLabour refers to the human effort (physical and mental) used in the production of goods and services.\n\n**Types of labour:**\n- **Skilled labour**: Requires specialised training or education (doctors, engineers, accountants)\n- **Semi-skilled labour**: Requires some training (machine operators, drivers)\n- **Unskilled labour**: Requires little or no formal training (cleaners, labourers)\n\n**Factors affecting labour quality:**\n1. **Education and training** - SA invests heavily in education (approximately 20% of the national budget)\n2. **Health** - HIV/AIDS and other diseases reduce labour productivity\n3. **Experience** - On-the-job learning improves skills over time\n4. **Motivation** - Working conditions, wages, and job security affect effort\n\n**SA labour challenges:**\n- Unemployment rate above 32% (expanded definition above 42%)\n- Skills mismatch between what the economy needs and what workers can offer\n- Brain drain as skilled workers emigrate\n\nThe remuneration for labour is **wages** (hourly/weekly) or **salaries** (monthly)."),
  fb(5, "The four factors of production are land, ___, capital, and ___. The remuneration for labour is ___ or salaries.",
    ["labour", "entrepreneurship", "wages"],
    "Each factor receives a specific form of remuneration: land earns rent, labour earns wages/salaries, capital earns interest, and entrepreneurship earns profit."),
  t(6, "### Capital\n\nCapital refers to man-made resources used in the production of other goods and services. It is NOT the same as money - money is a medium of exchange, while capital goods are physical assets.\n\n**Types of capital:**\n- **Fixed capital**: Buildings, factories, machinery, roads, dams\n- **Working capital (circulating capital)**: Raw materials, stock, semi-finished goods\n- **Social capital**: Infrastructure provided by government (roads, schools, hospitals, electricity grid)\n- **Human capital**: Knowledge, skills, and experience embodied in workers\n\n**Capital formation** is the process of increasing the stock of capital goods. South Africa needs massive capital investment to:\n- Replace ageing infrastructure (Eskom power stations, water pipes)\n- Build new infrastructure (renewable energy, digital networks)\n- Support industrialisation and job creation\n\nThe remuneration for capital is **interest** - payment for the use of capital goods or financial capital."),
  q(7, "Human capital refers to:",
    ["Money saved in a bank account", "Machinery used in factories", "The knowledge, skills, and experience of workers", "Government bonds"], 2,
    "Human capital is the economic value of a worker's experience, skills, and knowledge. It is improved through education, training, and healthcare."),
  t(8, "### Entrepreneurship\n\nEntrepreneurship is the factor that combines land, labour, and capital to produce goods and services. The entrepreneur:\n\n1. **Identifies opportunities** in the market\n2. **Takes risks** by investing time and money\n3. **Organises** the other factors of production\n4. **Innovates** by developing new products, services, or processes\n5. **Makes decisions** about what, how, and for whom to produce\n\n**SA entrepreneurs to know:**\n- Patrice Motsepe (African Rainbow Minerals)\n- Elon Musk (born in Pretoria - Tesla, SpaceX)\n- Wendy Ackerman (Pick n Pay legacy)\n\n**Challenges for SA entrepreneurs:**\n- Limited access to finance, especially for Black-owned businesses\n- Red tape and regulatory burden\n- Unreliable electricity supply (load shedding)\n- High crime rates\n- Skills shortages\n\nThe remuneration for entrepreneurship is **profit** - the reward for risk-taking."),
  fb(9, "The entrepreneur combines ___, labour, and capital to produce goods and services. The remuneration for entrepreneurship is ___.",
    ["land", "profit"],
    "The entrepreneur organises all other factors and accepts the risk of the business venture. Profit is the reward, but loss is also possible."),
  q(10, "Which factor of production earns interest as its remuneration?",
    ["Land", "Labour", "Capital", "Entrepreneurship"], 2,
    "Capital earns interest as its remuneration. Land earns rent, labour earns wages/salaries, and entrepreneurship earns profit."),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, "## Marginalised Groups and Economic Planning\n\nNot all South Africans have equal access to factors of production. **Marginalised groups** are those who are disadvantaged and excluded from mainstream economic activity.\n\n### Groups with limited access:\n\n1. **Women** - Face gender discrimination in the workplace, lower wages, limited access to credit and land ownership\n2. **Youth** - Unemployment rate above 60% for 15-24 age group; lack experience and skills\n3. **People with disabilities** - Face physical barriers, discrimination, and limited job opportunities\n4. **Rural communities** - Far from economic centres, poor infrastructure, limited services\n5. **Previously disadvantaged individuals** - Legacy of apartheid: limited education, land, and capital accumulation\n\n### Government interventions:\n- **BBBEE (Broad-Based Black Economic Empowerment)** - Promotes transformation in the economy\n- **National Development Plan (NDP) 2030** - Vision for reducing poverty and inequality\n- **SETA (Sector Education and Training Authorities)** - Skills development\n- **Youth Employment Service (YES)** - Creates work experience for youth"),
  t(2, "### Economic Planning and the Role of Government\n\nGovernment uses economic planning to address market failures and promote inclusive growth.\n\n**Key planning instruments:**\n\n| Instrument | Purpose |\n|------------|--------|\n| **National Budget** | Allocates revenue (taxes) to government priorities |\n| **Industrial Policy Action Plan (IPAP)** | Promotes manufacturing and value-adding industries |\n| **National Development Plan (NDP)** | Long-term plan to eliminate poverty by 2030 |\n| **Medium Term Strategic Framework (MTSF)** | 5-year implementation of NDP goals |\n| **Spatial planning** | Addresses geographic inequality (urban vs rural) |\n\n**Government aims through planning:**\n- Job creation and unemployment reduction\n- Infrastructure development\n- Skills development and education improvement\n- Addressing historical inequalities\n- Attracting foreign and domestic investment"),
  q(3, "Which government initiative specifically targets youth unemployment in South Africa?",
    ["BBBEE", "National Development Plan", "Youth Employment Service (YES)", "SETA"], 2,
    "The Youth Employment Service (YES) was launched to create paid work experience opportunities for young South Africans. BBBEE focuses on broad economic transformation, the NDP is a long-term plan, and SETAs focus on skills development."),
  t(4, "### Accessibility of Factors of Production\n\nAccessibility refers to how easily individuals and businesses can obtain and use the factors of production.\n\n**Barriers to accessibility:**\n\n**Land:**\n- Historical dispossession (apartheid land policies)\n- High property prices in urban areas\n- Complex land tenure systems in rural areas\n- Government land reform programme has been slow\n\n**Labour:**\n- Skills mismatch (education system does not produce the skills the economy needs)\n- Geographic mismatch (jobs in cities, people in rural areas)\n- Minimum wage laws may reduce demand for unskilled labour\n\n**Capital:**\n- Banks reluctant to lend to small businesses and entrepreneurs without collateral\n- High interest rates increase the cost of borrowing\n- Limited venture capital for start-ups\n\n**Entrepreneurship:**\n- Regulatory barriers and red tape\n- Lack of mentorship and business support\n- Corruption and crime increase business costs"),
  fb(5, "BBBEE stands for Broad-Based ___ Economic Empowerment. The NDP aims to eliminate ___ by 2030.",
    ["Black", "poverty"],
    "BBBEE promotes transformation across all levels of the economy. The National Development Plan is South Africa's long-term strategy to tackle poverty and inequality."),
  t(6, "### Improving Accessibility\n\nSouth Africa has implemented various strategies to improve access to factors of production:\n\n**For land:** Land reform programme (restitution, redistribution, tenure reform); government housing projects (RDP/BNG houses)\n\n**For labour:** National Student Financial Aid Scheme (NSFAS); Sector Education and Training Authorities (SETAs); Expanded Public Works Programme (EPWP); Community Works Programme (CWP)\n\n**For capital:** Small Enterprise Finance Agency (SEFA); Industrial Development Corporation (IDC); National Empowerment Fund (NEF); Micro-lending institutions\n\n**For entrepreneurship:** Small Enterprise Development Agency (SEDA); Technology Innovation Agency (TIA); Business incubators and hubs; Tax incentives for SMMEs\n\n**International context:** The United Nations Sustainable Development Goals (SDGs) also address inequality, poverty, and access to resources. SA has committed to achieving these goals by 2030."),
  q(7, "NSFAS provides financial assistance to improve access to which factor of production?",
    ["Land", "Labour (human capital)", "Capital", "Entrepreneurship"], 1,
    "NSFAS (National Student Financial Aid Scheme) funds higher education for students from poor families, improving the quality of labour (human capital) available in the economy."),
  q(8, "Which of the following is NOT a barrier to entrepreneurship in South Africa?",
    ["Red tape and regulations", "Unreliable electricity supply", "Unlimited access to bank loans", "High crime rates"], 2,
    "Access to bank loans is actually LIMITED for many entrepreneurs, especially those without collateral. The other options are all genuine barriers to entrepreneurship in SA."),
];

// =============================================================================
// CHAPTER 2: Circular Flow and National Accounts (Term 1)
// =============================================================================

blockNum = 0;
const ch2_lesson1 = [
  t(1, "## The Circular Flow Model\n\nThe circular flow model is a simplified diagram showing how money, goods, and services flow between different participants (role players) in the economy.\n\n### Two-Sector Model (Closed Economy)\n\nThe simplest model has only two participants:\n\n**Households** provide factors of production (land, labour, capital, entrepreneurship) to **Firms**, and receive factor payments (rent, wages, interest, profit) in return.\n\nFirms use these factors to produce goods and services, which they sell to households.\n\nTwo types of flows:\n- **Real flows**: Physical movement of factors of production and goods/services\n- **Money flows**: Payments for factors (factor income) and payments for goods (consumer spending)\n\nTwo markets connect them:\n- **Factor market**: Where factors of production are bought and sold\n- **Goods market**: Where final goods and services are bought and sold"),
  t(2, "### Three-Sector Model\n\nAdding **Government** creates a three-sector model:\n\n**Government interactions with households:**\n- Collects income tax, estate duty, donations tax\n- Pays social grants (SASSA grants: old age, child support, disability)\n- Provides public services (education, healthcare, policing)\n- Employs public servants (teachers, nurses, police officers)\n\n**Government interactions with firms:**\n- Collects company tax, VAT, excise duties\n- Provides infrastructure (roads, ports, railways)\n- Buys goods and services from firms\n- Regulates business activity\n\n**Government spending (G)** is an injection into the circular flow.\n**Taxes (T)** are a leakage from the circular flow.\n\nIn SA, the National Treasury manages fiscal policy (taxing and spending), guided by the annual National Budget presented by the Minister of Finance each February."),
  q(3, "In the circular flow model, taxes represent:",
    ["An injection into the economy", "A leakage from the economy", "A real flow", "A transfer payment"], 1,
    "Taxes are a leakage (withdrawal) because money leaves the circular flow when households and firms pay taxes to government. Government spending is the corresponding injection."),
  t(4, "### Four-Sector Model (Open Economy)\n\nAdding the **Foreign sector** creates the complete four-sector model, which describes South Africa as an open economy.\n\n**Exports (X):** SA sells goods and services to other countries (gold, platinum, motor vehicles, fruit, wine, tourism). Exports are an **injection** - foreign money enters the economy.\n\n**Imports (M):** SA buys goods and services from other countries (crude oil, electronics, machinery, pharmaceuticals). Imports are a **leakage** - money leaves the economy.\n\n**Balance of Trade** = Exports - Imports\n- Surplus: X > M (more earned from exports than spent on imports)\n- Deficit: X < M (more spent on imports than earned from exports)\n\nSA has frequently experienced a trade deficit, particularly due to high demand for imported oil and manufactured goods.\n\n**The financial sector** channels savings (S) from households into investment (I) by firms through banks and financial markets. Savings are a leakage; investment is an injection."),
  fb(5, "The three injections into the circular flow are investment (I), government spending (G), and ___ (X). The three leakages are savings (S), ___ (T), and imports (M).",
    ["exports", "taxes"],
    "Injections add money to the flow while leakages remove money. Equilibrium occurs when total injections equal total leakages: I + G + X = S + T + M."),
  t(6, "### Equilibrium in the Circular Flow\n\nThe economy is in equilibrium when:\n\n**Total Injections = Total Leakages**\n\n**I + G + X = S + T + M**\n\nIf injections > leakages: The economy expands (GDP increases)\nIf leakages > injections: The economy contracts (GDP decreases)\n\n**The Multiplier Effect:**\n\nAn initial injection creates a ripple effect through the economy. The size depends on the Marginal Propensity to Consume (MPC).\n\n- **MPC** = fraction of each extra rand spent on consumption\n- **MPS** = fraction of each extra rand saved\n- MPC + MPS = 1\n\n**Multiplier (k) = 1 / (1 - MPC) = 1 / MPS**\n\nExample: If MPC = 0.8, then k = 1 / 0.2 = 5\nAn injection of R10 million increases national income by R10m x 5 = R50 million.\n\nSA has a relatively small multiplier (estimated 1.2-2.0) because of high imports, savings, and tax leakages."),
  q(7, "If the MPC is 0.75, what is the value of the multiplier?",
    ["0.75", "0.25", "4", "3"], 2,
    "Multiplier = 1 / (1 - MPC) = 1 / (1 - 0.75) = 1 / 0.25 = 4. Each rand injected will ultimately generate R4 of additional national income."),
  fb(8, "The multiplier formula is k = 1 / (1 - ___). If the MPC is 0.6, the multiplier equals ___.",
    ["MPC", "2.5"],
    "k = 1 / (1 - 0.6) = 1 / 0.4 = 2.5. A smaller MPC means a smaller multiplier because more income leaks out at each round."),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, "## National Accounts\n\nThe **System of National Accounts (SNA)** is the international framework used by Stats SA to measure the total economic activity of the country.\n\n### Consumption Expenditure (C)\n\nConsumption expenditure is spending by households on goods and services. It is the largest component of total spending in most economies.\n\n**Types of consumer goods:**\n- **Durable goods**: Last a long time (cars, appliances, furniture)\n- **Semi-durable goods**: Last a moderate time (clothing, shoes)\n- **Non-durable goods**: Used up quickly (food, fuel, toiletries)\n- **Services**: Intangible (education, healthcare, transport, entertainment)\n\nIn SA, consumption expenditure accounts for approximately 60% of GDP. Consumer spending is influenced by:\n- Income levels\n- Interest rates (higher rates discourage borrowing and spending)\n- Consumer confidence\n- Inflation (higher prices reduce purchasing power)"),
  t(2, "### Government Expenditure (G)\n\nGovernment expenditure includes all spending by national, provincial, and local government on goods and services.\n\n**Categories:**\n- **Current expenditure**: Day-to-day spending (salaries, grants, maintenance)\n- **Capital expenditure**: Investment in infrastructure (roads, schools, hospitals, dams)\n- **Transfer payments**: Redistribution (social grants, subsidies) - not counted in GDP because no production occurs\n\n**SA government spending priorities (from the national budget):**\n1. Education (largest share)\n2. Social protection (grants)\n3. Health\n4. Community development\n5. Defence and public order\n\n**The government wage bill** consumes a large portion of the budget, limiting capital expenditure on infrastructure."),
  q(3, "Transfer payments such as social grants are NOT included in GDP calculations because:",
    ["They are too small to measure", "No production of goods or services takes place", "They are paid in cash", "They only benefit the poor"], 1,
    "GDP measures the value of goods and services produced. Transfer payments are simply a redistribution of income from taxpayers to grant recipients - no new production occurs."),
  t(4, "### Gross Fixed Capital Formation (I) - Investment\n\nGross Fixed Capital Formation (GFCF) measures spending on capital goods that will be used in future production.\n\n**Components:**\n- Residential buildings (houses, flats)\n- Non-residential buildings (offices, factories, shopping centres)\n- Construction (roads, bridges, dams)\n- Transport equipment (vehicles, trains, aircraft)\n- Machinery and other equipment\n- Transfer costs (legal fees on property transactions)\n\n**GFCF as a percentage of GDP** is an important indicator:\n- SA GFCF is approximately 14-16% of GDP\n- The NDP targets 30% of GDP to achieve faster growth\n- High-growth economies (China, India) invest 25-40% of GDP\n\n**Net investment** = GFCF - Depreciation (consumption of fixed capital)\n\nDepreciation accounts for the wearing out of capital goods. If depreciation exceeds gross investment, the capital stock is shrinking."),
  fb(5, "Stats SA uses the System of ___ Accounts to measure economic activity. Consumption expenditure accounts for approximately ___% of South African GDP.",
    ["National", "60"],
    "The SNA is the international standard for measuring economic performance. Household consumption is the largest component of aggregate spending."),
  t(6, "### Gross Value Added (GVA) and GDP\n\n**Gross Value Added (GVA)** measures the value added by each industry to the economy.\n\nGVA = Output value - Input costs (intermediate goods)\n\nExample: A bakery buys flour for R100 and sells bread for R250. The GVA is R150.\n\n**GDP can be measured three ways:**\n\n1. **Production method**: Sum of GVA of all industries + taxes on products - subsidies\n   GDP = Total GVA + Product taxes - Subsidies\n\n2. **Income method (GDI)**: Sum of all factor incomes\n   GDI = Wages + Rent + Interest + Profit\n\n3. **Expenditure method (GDE)**: Sum of all spending\n   GDE = C + I + G + (X - M)\n\nIn theory: **GDP = GDI = GDE**\n\n**Nominal GDP** = measured at current prices (includes inflation)\n**Real GDP** = measured at constant prices (adjusted for inflation)\n\nReal GDP is the better measure of actual economic growth."),
  q(7, "A furniture maker buys wood for R2 000 and sells tables for R8 000. The Gross Value Added is:",
    ["R2 000", "R6 000", "R8 000", "R10 000"], 1,
    "GVA = Output value - Input costs = R8 000 - R2 000 = R6 000. This is the value the furniture maker adds to the economy."),
  t(8, "### Per Capita Income and Limitations of GDP\n\n**Per capita GDP** = GDP / Population\n\nThis gives the average income per person but does NOT reflect how income is actually distributed.\n\nSA per capita GDP is approximately R84 000, but the Gini coefficient of 0.63 shows extreme inequality.\n\n**Limitations of GDP as a welfare measure:**\n1. Does not account for income distribution (inequality)\n2. Excludes the informal economy (estimated at 5-12% of GDP in SA)\n3. Ignores non-market activities (housework, subsistence farming)\n4. Does not measure environmental damage\n5. Excludes quality of life factors (crime, health, education quality)\n6. Does not capture the underground economy (illegal activities)\n\n**Alternative measures:**\n- **Human Development Index (HDI)**: Combines income, education, and life expectancy\n- **Gini coefficient**: Measures income inequality (0 = perfect equality, 1 = perfect inequality)\n- **Genuine Progress Indicator (GPI)**: Adjusts GDP for social and environmental factors"),
  fb(9, "Per capita GDP equals GDP divided by ___. The ___ coefficient measures income inequality on a scale of 0 to 1.",
    ["population", "Gini"],
    "Per capita GDP averages GDP across all citizens. The Gini coefficient shows how unevenly income is distributed; SA has one of the highest Gini coefficients globally."),
  q(10, "Which of the following is included in GDP calculations?",
    ["A mother caring for her own children at home", "A street vendor selling food for cash (unregistered)", "A nurse employed at a government hospital", "A teenager mowing a neighbours lawn for free"], 2,
    "The nurse's work is part of formal economic activity and is measured in GDP. Unpaid housework, informal unregistered activity, and free labour are typically excluded."),
];

// =============================================================================
// CHAPTER 3: Economic Systems (Term 1)
// =============================================================================

blockNum = 0;
const ch3_lesson1 = [
  t(1, "## Economic Systems\n\nEvery society must answer three fundamental economic questions:\n1. **What** to produce? (Which goods and services?)\n2. **How** to produce? (Which combination of factors?)\n3. **For whom** to produce? (How is output distributed?)\n\nThe way a society answers these questions defines its **economic system**.\n\n### Types of Economic Systems\n\n| System | Ownership | Decision-making | Price mechanism |\n|--------|-----------|----------------|----------------|\n| **Free market (Capitalism)** | Private ownership | Individual firms and consumers | Prices determined by supply and demand |\n| **Centrally planned (Command)** | State ownership | Central government authority | Prices set by the state |\n| **Mixed economy** | Both private and state | Both market forces and government | Combination of market and regulation |"),
  t(2, "### Free Market Economy (Capitalism)\n\n**Key features:**\n- Private ownership of factors of production\n- Freedom of choice for consumers and producers\n- Profit motive drives production decisions\n- Prices determined by supply and demand (the price mechanism)\n- Limited government intervention\n- Competition among producers\n\n**Advantages:**\n- Efficient allocation of resources through the price mechanism\n- Consumer sovereignty (producers respond to consumer demand)\n- Innovation and technological development driven by profit motive\n- Wide variety of goods and services available\n- Freedom of enterprise and individual liberty\n\n**Disadvantages:**\n- Leads to income inequality (the rich get richer)\n- Market failures: public goods not provided, externalities ignored\n- Monopolies may develop, reducing competition\n- Instability: business cycles cause unemployment and recessions\n- Social needs (healthcare, education) may be underprovided\n- Environmental damage not automatically accounted for"),
  q(3, "In a free market economy, the allocation of resources is primarily determined by:",
    ["Government planning boards", "The price mechanism (supply and demand)", "International organisations", "A committee of business leaders"], 1,
    "The free market uses the price mechanism to allocate resources. Prices signal what consumers want and what producers should supply. High prices signal scarcity and attract more production."),
  t(4, "### Centrally Planned Economy (Command/Socialism/Communism)\n\n**Key features:**\n- State (government) ownership of factors of production\n- Central planning authority makes all economic decisions\n- Prices, wages, and output levels set by the state\n- Aims for equal distribution of income\n- No private profit motive\n\n**Advantages:**\n- More equal distribution of income and wealth\n- Basic needs (food, housing, healthcare, education) provided to all\n- No unemployment in theory (state employs all workers)\n- Economic stability (no business cycles in theory)\n- Can mobilise resources quickly for national projects\n\n**Disadvantages:**\n- Lack of individual freedom and choice\n- No incentive to innovate or work hard (no profit motive)\n- Inefficient allocation of resources (no price signals)\n- Shortages and surpluses common due to poor planning\n- Bureaucracy and corruption\n- Limited variety of consumer goods\n\n**Historical examples:** The Soviet Union (collapsed 1991), Cuba, North Korea. China has moved toward a mixed system with significant market reforms."),
  fb(5, "In a free market economy, the ___ mechanism allocates resources. In a centrally planned economy, the ___ makes all major economic decisions.",
    ["price", "government"],
    "The price mechanism uses supply and demand to signal how resources should be allocated. In command economies, a central authority replaces the market with planning."),
  t(6, "### Mixed Economy\n\nA **mixed economy** combines elements of both the free market and centrally planned systems. Most modern economies are mixed economies.\n\n**Key features:**\n- Both private and public ownership of resources\n- Market forces operate alongside government regulation\n- Government provides public goods and services\n- Government corrects market failures\n- Social safety nets for the poor\n\n### South Africa as a Mixed Economy\n\nSA is a mixed economy with:\n\n**Market elements:**\n- Private businesses operate freely (Shoprite, Naspers, Sasol)\n- Consumers choose what to buy\n- Prices mostly determined by supply and demand\n- JSE (Johannesburg Stock Exchange) operates as a free capital market\n\n**Government elements:**\n- State-Owned Enterprises (Eskom, Transnet, SAA, SABC)\n- Progressive taxation (higher earners pay more tax)\n- Social grants (SASSA: old age, child support, disability)\n- Minimum wage legislation (R27.58/hour in 2024)\n- BBBEE policies to address historical inequality\n- Competition Commission to prevent monopolies"),
  q(7, "South Africa is best described as a:",
    ["Pure free market economy", "Centrally planned economy", "Mixed economy", "Traditional economy"], 2,
    "SA combines private enterprise with significant government intervention through SOEs, taxation, grants, minimum wages, and BBBEE. This makes it a mixed economy."),
  t(8, "### Comparing Economic Systems - Summary\n\n| Criterion | Free Market | Centrally Planned | Mixed (SA) |\n|-----------|------------|-------------------|------------|\n| Who owns resources? | Private individuals | The state | Both private and state |\n| Who decides what to produce? | Consumers (demand) | Central planners | Both market and government |\n| What motivates producers? | Profit | State directives | Profit and social goals |\n| How are prices set? | Supply and demand | Government | Mostly market, some regulated |\n| Income distribution | Very unequal | More equal | Unequal, but government redistributes |\n| Efficiency | Generally efficient | Often inefficient | Mixed results |\n| Freedom | High economic freedom | Limited freedom | Moderate freedom |\n\n**The global trend** is toward mixed economies, as pure capitalism leads to too much inequality and pure communism leads to too little freedom and innovation. The challenge is finding the right balance between market freedom and government intervention."),
  q(9, "Which of the following is a state-owned enterprise (SOE) in South Africa?",
    ["Shoprite", "Naspers", "Eskom", "Discovery"], 2,
    "Eskom is a state-owned enterprise responsible for generating and distributing most of South Africa's electricity. Shoprite, Naspers, and Discovery are all private companies listed on the JSE."),
  fb(10, "South Africa's national minimum wage is R___/hour. The ___ Stock Exchange is where shares in SA companies are traded.",
    ["27.58", "Johannesburg"],
    "The national minimum wage was set at R27.58/hour in 2024. The JSE is Africa's largest stock exchange and one of the top 20 globally."),
];

// =============================================================================
// CHAPTER 4: Economic Structure of SA (Term 1)
// =============================================================================

blockNum = 0;
const ch4_lesson1 = [
  t(1, "## The Economic Structure of South Africa\n\nAn economy is divided into **sectors** based on the type of economic activity. Understanding the structure helps identify strengths, weaknesses, and areas for development.\n\n### The Three Main Sectors\n\n| Sector | Activity | Examples |\n|--------|----------|----------|\n| **Primary sector** | Extraction of raw materials from nature | Mining, agriculture, fishing, forestry |\n| **Secondary sector** | Manufacturing and processing of raw materials | Factories, construction, electricity generation |\n| **Tertiary sector** | Services | Banking, retail, transport, tourism, government, IT |\n\nAs economies develop, they typically shift from primary to tertiary activities. This is called **structural change**.\n\n**SA sectoral contribution to GDP (approximate):**\n- Primary sector: 10-12% (mining ~7%, agriculture ~3%)\n- Secondary sector: 20-22% (manufacturing ~12%, construction ~3%)\n- Tertiary sector: 65-70% (finance ~22%, government ~17%, trade ~15%)"),
  t(2, "### Primary Sector\n\n**Mining:**\nSA is one of the world's leading mining countries:\n- Platinum (world's largest producer)\n- Gold (historically world's largest; production declining)\n- Manganese, chrome, vanadium (major global producer)\n- Coal (primary energy source, also exported)\n- Iron ore, diamonds\n\nChallenges: Deep-level mining is expensive and dangerous; electricity shortages; declining ore grades; labour unrest; regulatory uncertainty.\n\n**Agriculture:**\n- Commercial farming: Maize (staple food), sugar cane, citrus, wine grapes, deciduous fruit\n- Livestock: Cattle, sheep, poultry\n- SA is a net exporter of agricultural products\n- Challenges: Drought, climate change, land reform uncertainty, rising input costs\n\nThe primary sector employs a significant portion of unskilled and semi-skilled workers, especially in rural areas. Its decline as a share of GDP has contributed to structural unemployment."),
  q(3, "South Africa is the world's largest producer of:",
    ["Gold", "Diamonds", "Platinum", "Coal"], 2,
    "SA is the world's largest platinum producer, with deposits mainly in the Bushveld Igneous Complex (Limpopo, North West). While SA was historically the top gold producer, production has declined significantly."),
  t(4, "### Secondary Sector\n\n**Manufacturing:**\nThe manufacturing sector processes raw materials into finished goods:\n- Motor vehicles and components (BMW, Toyota, Mercedes-Benz have plants in SA)\n- Food and beverages processing\n- Chemicals and petrochemicals (Sasol)\n- Iron and steel (ArcelorMittal)\n- Clothing and textiles\n\nSA manufacturing has struggled due to:\n- Competition from cheap Chinese imports\n- High electricity costs and load shedding\n- Strong rand periods making exports expensive\n- High labour costs relative to productivity\n\n**Construction:**\n- Builds infrastructure (roads, buildings, dams)\n- Employment-intensive sector\n- Linked to government capital expenditure\n- Has contracted significantly since the 2010 FIFA World Cup building boom\n\n**Electricity, gas, and water:**\n- Eskom generates approximately 90% of SA electricity\n- Load shedding has been a major constraint on economic growth\n- Transition to renewable energy (solar, wind) is accelerating"),
  fb(5, "The primary sector contributes approximately ___% to SA GDP, while the tertiary sector contributes approximately ___%. SA is the world's largest producer of ___.",
    ["10", "65", "platinum"],
    "SA has undergone structural change from a mining-dependent economy to a service-dominated one. The tertiary sector now generates the most GDP."),
  t(6, "### Tertiary Sector\n\nThe tertiary (services) sector is the largest and fastest-growing sector in SA.\n\n**Key sub-sectors:**\n\n**Finance, real estate, and business services (~22% of GDP):**\n- SA has a world-class financial sector\n- Major banks: Standard Bank, FirstRand, Absa, Nedbank, Capitec\n- Johannesburg is Africa's financial hub\n\n**Government services (~17% of GDP):**\n- Education, healthcare, defence, policing, administration\n- Largest employer in the economy\n\n**Trade, catering, and accommodation (~15% of GDP):**\n- Retail: Shoprite, Pick n Pay, Woolworths, Spar\n- Tourism: Major foreign exchange earner\n\n**Transport and communication (~9% of GDP):**\n- Transnet (freight rail, ports), SANRAL (roads)\n- Telecoms: Vodacom, MTN, Telkom\n\n**The quaternary sector** is sometimes identified separately: knowledge-based services (ICT, research, consulting, education technology). This is the fastest-growing area globally."),
  q(7, "Which sub-sector contributes the most to SA GDP?",
    ["Mining", "Manufacturing", "Finance, real estate, and business services", "Agriculture"], 2,
    "Finance, real estate, and business services contribute approximately 22% of GDP, making it the largest sub-sector. SA's financial sector is considered world-class."),
  t(8, "### Infrastructure and Service Provisioning\n\n**Infrastructure** refers to the basic physical structures needed for the economy to function:\n\n**Economic infrastructure:**\n- Transport: Roads (SANRAL), rail (Transnet), ports, airports\n- Energy: Power stations (Eskom), transmission lines, fuel pipelines\n- Water: Dams, treatment plants, pipe networks\n- ICT: Fibre optic cables, mobile networks, data centres\n\n**Social infrastructure:**\n- Schools, universities, TVET colleges\n- Hospitals and clinics\n- Community halls, sports facilities\n- Social housing\n\n**SA infrastructure challenges:**\n- Ageing infrastructure (many assets are 30-50 years old)\n- Eskom capacity constraints and load shedding\n- Deteriorating rail network affecting mining exports\n- Water infrastructure failures (pipe bursts, treatment plant breakdowns)\n- The Infrastructure Fund aims to leverage private investment\n\n**Service provisioning** by government includes education, healthcare, social grants, water, sanitation, housing, and electricity to households."),
  fb(9, "Economic infrastructure includes transport, energy, ___, and ICT. Social infrastructure includes schools, ___, and housing.",
    ["water", "hospitals"],
    "Economic infrastructure supports business activity while social infrastructure supports human development and quality of life."),
  q(10, "Load shedding is primarily caused by constraints in which type of infrastructure?",
    ["Transport", "Water", "Energy", "ICT"], 2,
    "Load shedding is caused by insufficient electricity generation capacity, mainly due to Eskom's ageing coal-fired power stations, maintenance backlogs, and inadequate new capacity."),
];

// =============================================================================
// CHAPTER 5: Market Dynamics (Term 2)
// =============================================================================

blockNum = 0;
const ch5_lesson1 = [
  t(1, "## Demand\n\n**Demand** is the quantity of a good or service that consumers are willing and able to buy at various prices during a specific period.\n\n### The Law of Demand\n\nAs the price of a good increases, the quantity demanded decreases (and vice versa), ceteris paribus (all other things being equal).\n\nThis creates a **downward-sloping demand curve**.\n\n**Reasons for the downward slope:**\n1. **Income effect**: When price rises, consumers can afford less (real income falls)\n2. **Substitution effect**: When price rises, consumers switch to cheaper alternatives\n3. **Diminishing marginal utility**: Each additional unit gives less satisfaction, so consumers will only buy more at lower prices\n\n**Individual demand** = one consumer's demand\n**Market demand** = sum of all individual demands at each price"),
  t(2, "### Factors that Shift the Demand Curve\n\nA change in price causes movement **along** the demand curve. Other factors shift the **entire curve**:\n\n| Factor | Increase in demand (shift right) | Decrease in demand (shift left) |\n|--------|----------------------------------|----------------------------------|\n| **Income** | Income rises (normal goods) | Income falls |\n| **Price of substitutes** | Price of substitute rises | Price of substitute falls |\n| **Price of complements** | Price of complement falls | Price of complement rises |\n| **Tastes/Preferences** | Good becomes fashionable | Good falls out of favour |\n| **Population** | Population increases | Population decreases |\n| **Expectations** | Expected price increase (buy now) | Expected price decrease (wait) |\n| **Season** | Good is in season | Good is out of season |\n\n**Substitutes** are goods that can replace each other (Coca-Cola and Pepsi).\n**Complements** are goods used together (cars and petrol, bread and butter)."),
  q(3, "If the price of Coca-Cola increases, what will happen to the demand for Pepsi?",
    ["Demand for Pepsi decreases", "Demand for Pepsi increases", "Demand for Pepsi stays the same", "Supply of Pepsi decreases"], 1,
    "Coca-Cola and Pepsi are substitutes. When the price of a substitute rises, consumers switch to the alternative, increasing demand for Pepsi (shift right)."),
  t(4, "## Supply\n\n**Supply** is the quantity of a good or service that producers are willing and able to offer for sale at various prices during a specific period.\n\n### The Law of Supply\n\nAs the price of a good increases, the quantity supplied increases (and vice versa), ceteris paribus.\n\nThis creates an **upward-sloping supply curve**.\n\n**Reason:** Higher prices mean higher profits, which motivates producers to supply more.\n\n### Factors that Shift the Supply Curve\n\n| Factor | Increase in supply (shift right) | Decrease in supply (shift left) |\n|--------|----------------------------------|----------------------------------|\n| **Input costs** | Costs decrease | Costs increase (e.g., fuel, wages) |\n| **Technology** | Improved technology | Technology breakdown |\n| **Government policy** | Subsidies, deregulation | Taxes, regulations |\n| **Number of producers** | More firms enter market | Firms exit market |\n| **Natural conditions** | Good weather (agriculture) | Drought, floods |\n| **Expectations** | Expected lower future prices | Expected higher future prices |"),
  fb(5, "The law of demand states that price and quantity demanded are ___ related. The law of supply states that price and quantity supplied are ___ related.",
    ["inversely", "directly"],
    "Demand slopes downward (inverse relationship) while supply slopes upward (direct relationship). This is shown on a standard supply-demand diagram."),
  t(6, "### Market Equilibrium\n\n**Market equilibrium** occurs where the demand curve intersects the supply curve. At this point:\n- **Equilibrium price (Pe)**: The price at which quantity demanded equals quantity supplied\n- **Equilibrium quantity (Qe)**: The quantity traded at the equilibrium price\n\n**What happens away from equilibrium?**\n\n**If price is above equilibrium (P > Pe):**\n- Quantity supplied > Quantity demanded\n- This creates a **surplus** (excess supply)\n- Producers lower prices to sell excess stock\n- Price falls back toward equilibrium\n\n**If price is below equilibrium (P < Pe):**\n- Quantity demanded > Quantity supplied\n- This creates a **shortage** (excess demand)\n- Consumers bid up prices to secure scarce goods\n- Price rises back toward equilibrium\n\nThe market automatically adjusts toward equilibrium through the **price mechanism**. This is Adam Smith's concept of the **invisible hand**."),
  q(7, "A surplus in a market occurs when:",
    ["Quantity demanded exceeds quantity supplied", "The price is below equilibrium", "Quantity supplied exceeds quantity demanded", "The demand curve shifts right"], 2,
    "A surplus means there is excess supply - producers have made more than consumers want to buy at the current price. This happens when the price is above equilibrium."),
  t(8, "### Shifts in Equilibrium\n\nWhen demand or supply shifts, a new equilibrium is established:\n\n**Increase in demand (demand shifts right):**\n- Equilibrium price increases\n- Equilibrium quantity increases\n- Example: Increased demand for face masks during COVID-19\n\n**Decrease in demand (demand shifts left):**\n- Equilibrium price decreases\n- Equilibrium quantity decreases\n- Example: Decreased demand for air travel during lockdowns\n\n**Increase in supply (supply shifts right):**\n- Equilibrium price decreases\n- Equilibrium quantity increases\n- Example: Good harvest reduces food prices\n\n**Decrease in supply (supply shifts left):**\n- Equilibrium price increases\n- Equilibrium quantity decreases\n- Example: Load shedding reduces manufacturing output, pushing up prices\n\n**Simultaneous shifts:** When both curves shift, the effect on either price or quantity is uncertain depending on the relative magnitude of the shifts."),
  q(9, "If a drought destroys half of the maize crop in South Africa, what happens to the price and quantity of maize?",
    ["Price rises, quantity rises", "Price falls, quantity falls", "Price rises, quantity falls", "Price falls, quantity rises"], 2,
    "A drought decreases supply (supply curve shifts left). At the new equilibrium, the price is higher and the quantity traded is lower."),
  fb(10, "Market equilibrium occurs where the demand curve ___ the supply curve. At prices above equilibrium, there is a ___ (excess supply).",
    ["intersects", "surplus"],
    "The intersection point determines both the equilibrium price and equilibrium quantity. The market naturally adjusts toward this point through the price mechanism."),
];

// =============================================================================
// CHAPTER 6: Costs and Revenue (Term 2)
// =============================================================================

blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Short-Run Costs\n\nIn the **short run**, at least one factor of production is fixed (usually capital - factory size, machinery). The firm can vary labour and raw materials but cannot change its plant size.\n\n### Types of Short-Run Costs\n\n**Fixed Costs (FC):** Costs that do NOT change with output. They must be paid even if nothing is produced.\n- Examples: Rent, insurance, salaries of permanent staff, loan repayments, depreciation\n\n**Variable Costs (VC):** Costs that change directly with the level of output.\n- Examples: Raw materials, packaging, electricity for production, wages of temporary workers\n\n**Total Cost (TC) = Fixed Costs + Variable Costs**\n\nTC = FC + VC\n\n| Output | FC (R) | VC (R) | TC (R) |\n|--------|--------|--------|--------|\n| 0 | 1 000 | 0 | 1 000 |\n| 1 | 1 000 | 400 | 1 400 |\n| 2 | 1 000 | 700 | 1 700 |\n| 3 | 1 000 | 900 | 1 900 |\n| 4 | 1 000 | 1 200 | 2 200 |\n| 5 | 1 000 | 1 600 | 2 600 |"),
  t(2, "### Average Costs\n\n**Average Fixed Cost (AFC)** = FC / Output\n- AFC always decreases as output increases (fixed costs are spread over more units)\n- This is why mass production is cheaper per unit\n\n**Average Variable Cost (AVC)** = VC / Output\n- AVC first decreases, then increases (due to diminishing returns)\n\n**Average Total Cost (ATC)** = TC / Output = AFC + AVC\n- ATC is U-shaped: first decreases, reaches a minimum, then increases\n\n| Output | AFC (R) | AVC (R) | ATC (R) |\n|--------|---------|---------|--------|\n| 1 | 1 000 | 400 | 1 400 |\n| 2 | 500 | 350 | 850 |\n| 3 | 333 | 300 | 633 |\n| 4 | 250 | 300 | 550 |\n| 5 | 200 | 320 | 520 |\n\nThe point where ATC is at its minimum is the most efficient level of production."),
  q(3, "Average Fixed Cost (AFC) always decreases as output increases because:",
    ["Variable costs are spread over more units", "Fixed costs remain constant and are divided by increasing output", "Total costs decrease with output", "Marginal cost is falling"], 1,
    "AFC = FC / Output. Since FC is constant (e.g., R1 000), dividing by an increasing number of units gives a smaller AFC. This is the principle behind economies of scale."),
  t(4, "### Marginal Cost\n\n**Marginal Cost (MC)** is the additional cost of producing one more unit of output.\n\nMC = Change in TC / Change in Output\n\nOr equivalently: MC = Change in VC / Change in Output (since FC does not change)\n\n| Output | TC (R) | MC (R) |\n|--------|--------|--------|\n| 0 | 1 000 | - |\n| 1 | 1 400 | 400 |\n| 2 | 1 700 | 300 |\n| 3 | 1 900 | 200 |\n| 4 | 2 200 | 300 |\n| 5 | 2 600 | 400 |\n\n**Key relationships:**\n- MC first falls, then rises (U-shaped curve)\n- MC intersects AVC and ATC at their lowest points\n- When MC < ATC, ATC is falling\n- When MC > ATC, ATC is rising\n- When MC = ATC, ATC is at its minimum\n\nThis is like your grade average: if your next test mark (MC) is below your average (ATC), your average falls. If it is above, your average rises."),
  fb(5, "Total Cost equals ___ Costs plus Variable Costs. Marginal Cost is the additional cost of producing ___ more unit of output.",
    ["Fixed", "one"],
    "TC = FC + VC. Marginal cost helps firms decide whether producing an additional unit is worthwhile."),
  t(6, "### Long-Run Costs\n\nIn the **long run**, all factors of production are variable. The firm can change its plant size, buy new machinery, or relocate.\n\n**Long-Run Average Cost (LRAC):**\n\nThe LRAC curve is formed by the envelope (lower boundary) of all possible short-run ATC curves.\n\n**Economies of Scale** (LRAC decreasing):\nAs the firm grows, average costs fall due to:\n- Bulk buying discounts on raw materials\n- Specialisation of labour\n- Better use of technology\n- Financial economies (lower interest rates for larger firms)\n- Managerial economies (specialist managers)\n\n**Diseconomies of Scale** (LRAC increasing):\nIf the firm grows too large, average costs rise due to:\n- Communication problems\n- Coordination difficulties\n- Worker alienation and low morale\n- Bureaucracy and red tape\n- Loss of control by management\n\n**Constant returns to scale:** The flat section of the LRAC where costs remain stable."),
  q(7, "Economies of scale occur when:",
    ["Average costs increase as output increases", "Average costs decrease as the firm grows larger", "Marginal costs are constant", "Fixed costs increase with output"], 1,
    "Economies of scale mean that as a firm increases its scale of production, the average cost per unit falls. This gives larger firms a cost advantage over smaller competitors."),
  t(8, "### Revenue\n\n**Total Revenue (TR)** = Price x Quantity sold\n\n**Average Revenue (AR)** = TR / Quantity = Price\n\n**Marginal Revenue (MR)** = Change in TR / Change in quantity sold\n\n| Quantity | Price (R) | TR (R) | AR (R) | MR (R) |\n|----------|-----------|--------|--------|--------|\n| 1 | 100 | 100 | 100 | 100 |\n| 2 | 100 | 200 | 100 | 100 |\n| 3 | 100 | 300 | 100 | 100 |\n| 4 | 100 | 400 | 100 | 100 |\n\nIn **perfect competition**, the firm is a price taker, so P = AR = MR (all constant).\n\nIn **imperfect competition**, the firm must lower price to sell more, so MR < AR and both decrease."),
  t(9, "### Profit and Loss\n\n**Profit** = Total Revenue - Total Cost\n\n**Economic profit** = TR - TC (including opportunity cost)\n**Normal profit** = The minimum profit needed to keep the firm in business (TR = TC)\n**Supernormal (economic) profit** = TR > TC (above-normal returns)\n**Loss** = TR < TC (costs exceed revenue)\n\n**Profit maximisation rule:** A firm maximises profit where **MR = MC**\n\nIf MR > MC: Producing more increases profit (each additional unit adds more to revenue than cost)\nIf MR < MC: Producing more decreases profit (each additional unit costs more than it adds to revenue)\nAt MR = MC: Profit is maximised\n\n**Shutdown point:** A firm should shut down in the short run if price falls below AVC (it cannot even cover variable costs). In the long run, it should exit if price falls below ATC."),
  q(10, "A firm maximises profit where:",
    ["Total Revenue is greatest", "Average Cost is lowest", "Marginal Revenue equals Marginal Cost", "Price equals Average Fixed Cost"], 2,
    "The profit-maximisation rule is MR = MC. At this output level, the additional revenue from selling one more unit exactly equals the additional cost of producing it."),
  fb(11, "Profit equals Total ___ minus Total Cost. A firm should shut down in the short run if price falls below Average ___ Cost.",
    ["Revenue", "Variable"],
    "If price is below AVC, the firm cannot cover even its variable costs and loses more money by operating than by shutting down."),
];

// =============================================================================
// CHAPTER 7: Price Elasticity (Term 2)
// =============================================================================

blockNum = 0;
const ch7_lesson1 = [
  t(1, "## Price Elasticity of Demand\n\n**Price Elasticity of Demand (PED)** measures how responsive the quantity demanded of a good is to a change in its price.\n\n### Formula:\n\nPED = Percentage change in quantity demanded / Percentage change in price\n\nPED = (%Change Qd) / (%Change P)\n\n**Note:** PED is always negative (due to the inverse relationship between price and quantity demanded), but we often use the absolute value.\n\n### Categories:\n\n| PED Value | Type | Meaning |\n|-----------|------|--------|\n| PED > 1 | **Elastic** | Quantity demanded changes by a larger percentage than price |\n| PED = 1 | **Unitary elastic** | Quantity demanded changes by the same percentage as price |\n| PED < 1 | **Inelastic** | Quantity demanded changes by a smaller percentage than price |\n| PED = 0 | **Perfectly inelastic** | Quantity demanded does not change at all |\n| PED = infinity | **Perfectly elastic** | Any price increase causes demand to drop to zero |"),
  t(2, "### Calculating Price Elasticity of Demand\n\n**Example:** The price of a loaf of bread increases from R20 to R22. Quantity demanded falls from 1 000 to 950 loaves.\n\n%Change in Qd = ((950 - 1 000) / 1 000) x 100 = -5%\n%Change in P = ((22 - 20) / 20) x 100 = 10%\n\nPED = -5% / 10% = -0.5 (absolute value = 0.5)\n\nSince PED < 1, demand for bread is **inelastic** - a 10% price rise only reduces demand by 5%.\n\n**Another example:** The price of a luxury handbag increases from R5 000 to R5 500. Quantity demanded falls from 200 to 150.\n\n%Change in Qd = ((150 - 200) / 200) x 100 = -25%\n%Change in P = ((5 500 - 5 000) / 5 000) x 100 = 10%\n\nPED = -25% / 10% = -2.5 (absolute value = 2.5)\n\nSince PED > 1, demand is **elastic** - a 10% price rise reduces demand by 25%."),
  q(3, "The price of petrol increases from R25/litre to R27.50/litre. Quantity demanded falls from 10 000 litres to 9 500 litres. What is the PED?",
    ["0.5", "1.0", "2.0", "0.05"], 0,
    "%Change Qd = ((9 500 - 10 000)/10 000) x 100 = -5%. %Change P = ((27.50 - 25)/25) x 100 = 10%. PED = 5%/10% = 0.5. Demand is inelastic because petrol has few substitutes."),
  t(4, "### Factors Determining Price Elasticity of Demand\n\n1. **Availability of substitutes** - More substitutes = more elastic. Coca-Cola has many substitutes (elastic). Electricity has few (inelastic).\n\n2. **Necessity vs luxury** - Necessities are inelastic (bread, medicine, petrol). Luxuries are elastic (designer clothing, holidays abroad).\n\n3. **Proportion of income spent** - Goods taking a large share of income are more elastic (cars, houses). Cheap goods are inelastic (salt, matches).\n\n4. **Time period** - Demand is more elastic in the long run (consumers find alternatives over time). In the short run, people are stuck with habits.\n\n5. **Habit/Addiction** - Addictive goods are inelastic (cigarettes, alcohol). Consumers continue buying despite price increases.\n\n6. **Definition of the market** - Broadly defined markets are inelastic (food). Narrowly defined markets are elastic (a specific brand of cereal).\n\n**SA examples:**\n- Petrol: Inelastic (few alternatives for transport, especially in areas without public transport)\n- Electricity: Inelastic (Eskom is the dominant supplier, no substitutes for most users)\n- Luxury imported cars: Elastic (many alternatives)"),
  fb(5, "If PED is greater than 1, demand is said to be ___. If PED is less than 1, demand is ___.",
    ["elastic", "inelastic"],
    "Elastic demand means consumers are very responsive to price changes. Inelastic demand means consumers are not very responsive."),
  t(6, "### Price Elasticity and Total Revenue\n\nUnderstanding PED helps firms make pricing decisions:\n\n**Elastic demand (PED > 1):**\n- Price increase leads to proportionally larger decrease in quantity\n- Total Revenue DECREASES when price rises\n- Total Revenue INCREASES when price falls\n- Strategy: Lower prices to increase revenue\n\n**Inelastic demand (PED < 1):**\n- Price increase leads to proportionally smaller decrease in quantity\n- Total Revenue INCREASES when price rises\n- Total Revenue DECREASES when price falls\n- Strategy: Raise prices to increase revenue\n\n**Example:** Eskom has inelastic demand, so electricity tariff increases lead to higher total revenue (consumers cannot easily stop using electricity). This is why regulated prices matter - without regulation, Eskom could exploit consumers."),
  q(7, "If demand for a product is elastic, a price increase will cause total revenue to:",
    ["Increase", "Decrease", "Stay the same", "Double"], 1,
    "With elastic demand, the percentage fall in quantity demanded exceeds the percentage rise in price. The loss from selling fewer units outweighs the gain from the higher price, so total revenue falls."),
  t(8, "## Price Elasticity of Supply\n\n**Price Elasticity of Supply (PES)** measures how responsive the quantity supplied is to a change in price.\n\nPES = Percentage change in quantity supplied / Percentage change in price\n\n### Categories:\n\n| PES Value | Type | Meaning |\n|-----------|------|--------|\n| PES > 1 | **Elastic** | Supply responds strongly to price changes |\n| PES = 1 | **Unitary elastic** | Supply changes proportionally to price |\n| PES < 1 | **Inelastic** | Supply responds weakly to price changes |\n| PES = 0 | **Perfectly inelastic** | Supply cannot change at all |\n\n### Factors Determining PES:\n\n1. **Time period** - Supply is more elastic in the long run (firms can build new factories)\n2. **Spare capacity** - Firms with unused capacity can respond quickly (elastic)\n3. **Ease of storage** - Storable goods have more elastic supply\n4. **Ease of factor substitution** - If factors are easily interchangeable, supply is more elastic\n5. **Nature of the good** - Agricultural goods are inelastic in the short run (crops take months to grow)"),
  q(9, "Supply of fresh strawberries in the short run is likely to be:",
    ["Elastic", "Perfectly elastic", "Inelastic", "Unitary elastic"], 2,
    "Fresh strawberries take time to grow and cannot be stored for long. In the short run, farmers cannot significantly increase supply even if prices rise, making supply inelastic."),
  fb(10, "Price Elasticity of Supply equals percentage change in ___ supplied divided by percentage change in ___. Supply is more elastic in the ___ run.",
    ["quantity", "price", "long"],
    "In the long run, firms have time to adjust all factors of production, making supply more responsive to price changes."),
];

// =============================================================================
// CHAPTER 8: Economic Growth (Term 3)
// =============================================================================

blockNum = 0;
const ch8_lesson1 = [
  t(1, "## Economic Growth and Wealth Creation\n\n**Economic growth** is the increase in the real GDP of a country over time. It indicates that the economy is producing more goods and services.\n\n**Measuring economic growth:**\nGrowth rate = ((Real GDP current year - Real GDP previous year) / Real GDP previous year) x 100\n\n**SA economic growth:**\n- SA needs growth of 5-6% per year to significantly reduce unemployment (NDP target)\n- Actual growth has averaged 1-2% in recent years\n- The economy contracted 6.4% in 2020 (COVID-19)\n\n### Wealth Creation\n\nWealth is created when the economy produces goods and services that have value. Methods of wealth creation include:\n- Increasing productivity (producing more with the same inputs)\n- Investment in capital goods and infrastructure\n- Improving human capital through education and training\n- Innovation and technological advancement\n- Expanding trade (exports)"),
  t(2, "### Distribution of Income and Wealth\n\nEconomic growth alone does not ensure that everyone benefits. **Distribution** refers to how income and wealth are shared among the population.\n\n**Measuring inequality:**\n\n**The Lorenz Curve:**\n- A graph showing the cumulative percentage of income earned by cumulative percentage of the population\n- The 45-degree line represents perfect equality (everyone earns the same)\n- The further the Lorenz curve bows away from the line of equality, the greater the inequality\n\n**The Gini Coefficient:**\n- Calculated from the Lorenz Curve\n- Ranges from 0 (perfect equality) to 1 (perfect inequality)\n- SA Gini coefficient: approximately 0.63 (one of the highest in the world)\n- Nordic countries: approximately 0.25-0.30\n- Brazil: approximately 0.48\n\n**SA inequality facts:**\n- The top 10% of earners receive approximately 65% of total income\n- The bottom 50% receive approximately 8% of total income\n- Inequality has racial, gender, and geographic dimensions"),
  q(3, "A Gini coefficient of 0.63 indicates:",
    ["Perfect income equality", "Low inequality", "High inequality", "No income distribution"], 2,
    "The Gini coefficient ranges from 0 (perfect equality) to 1 (perfect inequality). SA's 0.63 indicates very high inequality - one of the worst in the world."),
  t(4, "### Redistribution\n\nGovernment uses various tools to redistribute income and reduce inequality:\n\n**Progressive taxation:**\n- Higher earners pay a higher percentage of income in tax\n- SA income tax rates range from 18% to 45%\n- The top rate (45%) applies to taxable income above R1 817 000\n\n**Social grants (SASSA):**\n- Old age grant, child support grant, disability grant\n- Over 18 million South Africans receive social grants\n- Social grants reduce the poverty gap significantly\n\n**Free basic services:**\n- Free basic water (6 kilolitres per household per month)\n- Free basic electricity (50 kWh per month)\n- No-fee schools\n- Free primary healthcare\n\n**BBBEE and affirmative action:**\n- Promote economic participation by previously disadvantaged groups\n- Ownership, management, skills development, enterprise development targets\n\n**Challenges:** Redistribution can reduce incentives to work and invest if taxes are too high. The balance between growth and redistribution is a key policy debate."),
  fb(5, "The ___ Curve is a graph showing income distribution. SA has a Gini coefficient of approximately ___, indicating very high inequality.",
    ["Lorenz", "0.63"],
    "The Lorenz Curve visually shows inequality, while the Gini coefficient gives a single number. Both show that SA has extreme income inequality."),
  t(6, "### Methods of Achieving Economic Growth\n\n**Demand-side methods:**\n- Increasing government spending (G)\n- Reducing taxes to boost consumer spending (C)\n- Lowering interest rates to encourage borrowing and investment\n- Increasing exports through trade promotion\n\n**Supply-side methods:**\n- Investment in infrastructure (roads, energy, ports)\n- Education and skills development (improving human capital)\n- Reducing red tape and regulatory burden\n- Promoting competition and deregulation\n- Encouraging research, development, and innovation\n- Attracting foreign direct investment (FDI)\n- Land reform and agricultural development\n\n**SA-specific growth strategies:**\n- National Development Plan (NDP) 2030\n- Economic Reconstruction and Recovery Plan (ERRP)\n- Operation Vulindlela (structural reforms)\n- Renewable energy programme (reducing load shedding)\n- Special Economic Zones (SEZs) to attract investment"),
  q(7, "Which of the following is a supply-side method of promoting economic growth?",
    ["Increasing government spending", "Reducing interest rates", "Investing in education and skills development", "Increasing social grants"], 2,
    "Education and skills development improve the quality of the labour force (supply side). The other options work through increasing demand (spending)."),
  t(8, "### South Africa's Growth Challenges\n\nDespite significant potential, SA faces serious structural obstacles to growth:\n\n1. **Unemployment** - Over 32% (narrow definition); youth unemployment above 60%\n2. **Load shedding** - Unreliable electricity supply costs the economy billions\n3. **Infrastructure decay** - Rail, water, and road infrastructure deteriorating\n4. **Education quality** - Despite high spending, outcomes are poor (low literacy and numeracy scores)\n5. **Crime and corruption** - State capture, fraud, and high crime rates deter investment\n6. **Inequality** - Extreme inequality limits the domestic consumer market\n7. **Skills shortage** - Mismatch between education output and economic needs\n8. **Brain drain** - Skilled professionals emigrating\n9. **Global competition** - Other emerging markets are growing faster\n10. **Fiscal constraints** - High debt (approximately 74% of GDP) limits government spending\n\n**Positive factors:** Strong financial sector, established institutions, natural resource wealth, young population, growing digital economy."),
  fb(9, "The NDP targets economic growth of ___% per year to reduce unemployment. SA government debt is approximately ___% of GDP.",
    ["5", "74"],
    "SA needs 5-6% growth to create enough jobs, but has been achieving only 1-2%. High debt limits the government's ability to spend on growth-promoting investment."),
  q(10, "Which of the following is NOT a structural obstacle to economic growth in South Africa?",
    ["Load shedding", "A strong financial sector", "High unemployment", "Skills mismatch"], 1,
    "A strong financial sector is actually a positive factor for SA growth. Load shedding, unemployment, and skills mismatch are all structural obstacles."),
];

// =============================================================================
// CHAPTER 9: Economic Development (Term 3)
// =============================================================================

blockNum = 0;
const ch9_lesson1 = [
  t(1, "## Economic Development\n\n**Economic development** is a broader concept than economic growth. While growth measures only the increase in GDP, development includes improvements in the quality of life, living standards, and well-being of the population.\n\n### Growth vs Development\n\n| Economic Growth | Economic Development |\n|----------------|---------------------|\n| Increase in real GDP | Improvement in quality of life |\n| Quantitative measure | Qualitative measure |\n| Can occur without development | Requires growth AND better distribution |\n| Measured by GDP growth rate | Measured by HDI and other indicators |\n\nA country can have high economic growth but low development if the benefits only reach a small elite (e.g., oil-rich countries with widespread poverty)."),
  t(2, "### Measuring Development: The Human Development Index (HDI)\n\nThe **HDI** is a composite index published by the United Nations Development Programme (UNDP). It measures three dimensions:\n\n1. **Health (long and healthy life):** Life expectancy at birth\n2. **Education (knowledge):** Mean years of schooling and expected years of schooling\n3. **Income (decent standard of living):** GNI per capita (PPP US$)\n\n**HDI ranges from 0 to 1:**\n- Very high: 0.800 and above (Norway ~0.961, Switzerland ~0.962)\n- High: 0.700 - 0.799\n- Medium: 0.550 - 0.699\n- Low: Below 0.550\n\n**South Africa HDI: approximately 0.713** (ranked around 109 out of 191 countries)\n\nSA falls in the \"high\" category, but:\n- Life expectancy is low (approximately 65 years) due to HIV/AIDS\n- Education quality is poor despite relatively high enrolment\n- Income inequality means the average masks deep poverty"),
  q(3, "The Human Development Index (HDI) measures all of the following EXCEPT:",
    ["Life expectancy", "Education levels", "Income per capita", "Crime rates"], 3,
    "The HDI combines health (life expectancy), education (years of schooling), and income (GNI per capita). Crime rates are not part of the HDI, although they affect quality of life."),
  t(4, "### Common Characteristics of Developing Countries\n\nDeveloping countries (including SA in many respects) share these features:\n\n1. **Low per capita income** - Average income is low (though SA is upper-middle income, inequality makes most citizens poor)\n2. **High population growth** - More people to feed, house, educate, and employ\n3. **Unemployment and underemployment** - Large informal sector\n4. **Dual economy** - Modern formal sector alongside a large informal/subsistence sector\n5. **Dependence on primary commodities** - Exports of raw materials rather than manufactured goods\n6. **Low levels of industrialisation** - Limited manufacturing capacity\n7. **Poor infrastructure** - Inadequate transport, energy, water, and communication systems\n8. **Low savings and investment** - Limited capital accumulation\n9. **Health challenges** - HIV/AIDS, TB, malaria (in some regions)\n10. **Brain drain** - Skilled workers emigrate to developed countries\n11. **Political instability and corruption** - Weak governance in some cases"),
  fb(5, "The Human Development Index measures health, education, and ___. South Africa's HDI is approximately ___, placing it in the high development category.",
    ["income", "0.713"],
    "Despite being in the high HDI category, SA faces serious challenges including HIV/AIDS (reducing life expectancy), poor education quality, and extreme income inequality."),
  t(6, "### Development Strategies\n\nCountries use various strategies to promote development:\n\n**Import substitution industrialisation (ISI):**\n- Replace imported goods with domestically produced ones\n- Protect local industries with tariffs and quotas\n- SA tried this during apartheid (sanctions forced self-sufficiency)\n- Risk: inefficient industries protected from competition\n\n**Export-oriented growth:**\n- Focus on producing goods for export markets\n- Take advantage of competitive advantages\n- Success stories: China, South Korea, Taiwan\n- SA exports: minerals, vehicles, fruit, wine\n\n**Foreign Direct Investment (FDI):**\n- Attract multinational companies to invest in the country\n- Brings capital, technology, skills, and jobs\n- SA competes with other emerging markets for FDI\n\n**Human capital development:**\n- Invest in education, health, and training\n- Critical for long-term development\n- SA spends ~20% of budget on education but outcomes are poor"),
  q(7, "Import substitution industrialisation aims to:",
    ["Increase imports of manufactured goods", "Replace imported goods with locally produced ones", "Export only primary commodities", "Eliminate all government involvement in the economy"], 1,
    "ISI protects local industries so they can produce goods domestically instead of importing them. This reduces dependence on imports and develops the manufacturing sector."),
  t(8, "### Indigenous Knowledge Systems (IKS)\n\nIKS refers to the knowledge developed by indigenous communities over centuries through experience and observation.\n\n**Examples in SA:**\n- Traditional medicine (muti): Knowledge of indigenous plants for healing\n- Sustainable farming practices: Crop rotation, intercropping used by indigenous farmers\n- Water management: Traditional methods of water harvesting and conservation\n- Architecture: Building methods suited to local climates and materials\n- Food preservation: Traditional methods (drying, fermenting, smoking)\n\n**Role in development:**\n- Can complement modern scientific approaches\n- Promotes biodiversity conservation\n- Creates economic opportunities (traditional medicine market, eco-tourism)\n- Preserves cultural heritage\n\n**Challenges:**\n- Often not documented (oral tradition)\n- Biopiracy risk (exploitation of traditional knowledge by corporations)\n- Need for legal protection of indigenous intellectual property\n- Integration with modern systems can be difficult\n\nThe Indigenous Knowledge Systems Act aims to protect and promote IKS in SA."),
  fb(9, "IKS stands for Indigenous ___ Systems. Import ___ industrialisation aims to replace imported goods with locally produced ones.",
    ["Knowledge", "substitution"],
    "IKS offers valuable traditional knowledge that can complement modern development strategies. ISI was widely used by developing countries in the 20th century."),
  q(10, "Which development strategy was most successfully used by South Korea, China, and Taiwan?",
    ["Import substitution", "Export-oriented growth", "Subsistence agriculture", "Reliance on foreign aid"], 1,
    "The Asian Tiger economies achieved rapid development through export-oriented growth, focusing on manufacturing goods for export. This brought foreign exchange, technology, and jobs."),
];

// =============================================================================
// CHAPTER 10: Money and Banking (Term 3)
// =============================================================================

blockNum = 0;
const ch10_lesson1 = [
  t(1, "## Functions and Characteristics of Money\n\n**Money** is anything generally accepted as a medium of exchange for goods and services.\n\n### Functions of Money:\n\n1. **Medium of exchange** - Money eliminates the need for barter (double coincidence of wants). You can buy goods without finding someone who wants what you have.\n\n2. **Unit of account (measure of value)** - Money provides a common standard to measure and compare the value of different goods and services.\n\n3. **Store of value** - Money can be saved and used in the future (though inflation reduces its purchasing power over time).\n\n4. **Standard of deferred payment** - Money allows for credit transactions and payment in the future (loans, hire purchase).\n\n### Characteristics of Good Money:\n- **Durability** - Must last in circulation\n- **Portability** - Easy to carry\n- **Divisibility** - Can be divided into smaller units\n- **Uniformity** - Each unit is identical\n- **Limited supply** - Scarcity gives it value\n- **Acceptability** - Everyone must accept it as payment"),
  t(2, "### The South African Monetary System\n\nThe monetary system consists of all the institutions, instruments, and markets involved in the creation and circulation of money.\n\n**Types of money in SA:**\n- **Coins**: R5, R2, R1, 50c, 20c, 10c (minted by the SA Mint)\n- **Bank notes**: R10, R20, R50, R100, R200 (printed by the SA Bank Note Company)\n- **Bank deposits**: Current accounts, savings accounts, fixed deposits (the largest component of money supply)\n- **Electronic money**: EFTs, debit/credit cards, mobile payments (SnapScan, Zapper)\n\n**Money supply measures:**\n| Measure | Components |\n|---------|------------|\n| **M1** | Coins + notes + cheque/current account deposits |\n| **M2** | M1 + short-term savings and time deposits |\n| **M3** | M2 + long-term deposits (broadest measure) |\n\nThe SARB monitors M3 as the broadest measure of money supply in the economy."),
  q(3, "Which is the broadest measure of money supply in South Africa?",
    ["M1", "M2", "M3", "M0"], 2,
    "M3 is the broadest measure, including all coins, notes, and deposits of all terms. The SARB uses M3 to monitor money supply growth, which affects inflation."),
  t(4, "### The South African Reserve Bank (SARB)\n\nThe SARB is South Africa's **central bank**, established in 1921. It is independent from government.\n\n**Functions of the SARB:**\n\n1. **Monetary policy** - Controls inflation by adjusting interest rates (primary function)\n2. **Bank of banks** - Provides services to commercial banks (clearing, settlement, lender of last resort)\n3. **Bank of government** - Manages government accounts and national debt\n4. **Custodian of gold and foreign exchange reserves** - Holds SA gold and currency reserves\n5. **Issuing bank notes and coins** - Only the SARB can issue SA currency\n6. **Supervising the banking system** - Ensures banks are financially sound (prudential authority)\n7. **Managing foreign exchange** - Monitors and manages the exchange rate\n\n**Inflation targeting:**\nThe SARB targets an inflation rate of **3-6%** using the Consumer Price Index (CPI). The primary tool is the **repo rate** - the interest rate at which the SARB lends money to commercial banks."),
  fb(5, "The SARB targets inflation between ___% and 6% using the ___ rate as its primary tool.",
    ["3", "repo"],
    "The repo rate influences all other interest rates in the economy. When the SARB raises the repo rate, banks raise their lending rates, which reduces borrowing and spending, cooling inflation."),
  t(6, "### Commercial Banks and Credit Creation\n\n**Commercial banks** accept deposits and make loans. Major SA banks: Standard Bank, FirstRand (FNB), Absa, Nedbank, Capitec.\n\n**How banks create money (credit creation):**\n\nBanks do not keep all deposits in vaults. They are required to keep a **minimum reserve requirement** (cash reserve ratio) set by the SARB, and lend out the rest.\n\nExample (simplified): Cash reserve ratio = 10%\n1. Customer deposits R1 000\n2. Bank keeps R100 (10%) as reserve, lends R900\n3. Borrower spends R900, which is deposited in another bank\n4. That bank keeps R90, lends R810\n5. This process continues...\n\n**Credit multiplier = 1 / Cash reserve ratio**\nWith 10% reserve: 1 / 0.10 = 10\n\nThe initial R1 000 deposit creates up to R10 000 in total deposits (money supply).\n\n**This is how most money in the economy is created** - not by printing notes, but through bank lending."),
  q(7, "If the cash reserve ratio is 8%, the credit multiplier is:",
    ["8", "0.08", "12.5", "80"], 2,
    "Credit multiplier = 1 / reserve ratio = 1 / 0.08 = 12.5. Each R1 of reserves can support R12.50 of deposits. A lower reserve ratio means more money creation."),
  t(8, "### Interest Rates\n\n**The repo rate** is the rate at which the SARB lends money to commercial banks. It is the anchor for all interest rates in the economy.\n\n**Prime rate** = Repo rate + 3.5%\nThis is the rate banks charge their best (lowest risk) customers.\n\nIf repo rate = 8.25%, then prime rate = 11.75%\n\n**How interest rates affect the economy:**\n\n| Interest rate increase | Interest rate decrease |\n|-----------------------|----------------------|\n| Borrowing more expensive | Borrowing cheaper |\n| Consumer spending decreases | Consumer spending increases |\n| Saving more attractive | Saving less attractive |\n| Investment decreases | Investment increases |\n| Inflation pressure decreases | Inflation pressure increases |\n| Currency strengthens (attracts foreign capital) | Currency weakens |\n| Economic growth slows | Economic growth stimulated |\n\nThe SARB Monetary Policy Committee (MPC) meets six times a year to decide on the repo rate."),
  fb(9, "The prime interest rate equals the repo rate plus ___%. Commercial banks create money through the process of ___ creation.",
    ["3.5", "credit"],
    "The 3.5% margin between repo and prime is the base profit margin for banks. Credit creation through fractional reserve banking is how most money enters the economy."),
  t(10, "### Monetary Policy\n\n**Monetary policy** is the SARB's use of interest rates and other tools to control inflation and stabilise the economy.\n\n**Expansionary monetary policy** (during recession):\n- Lower the repo rate\n- Reduce cash reserve requirements\n- Buy government bonds (inject money into the economy)\n- Effect: More lending, spending, and investment\n\n**Contractionary monetary policy** (during inflation):\n- Raise the repo rate\n- Increase cash reserve requirements\n- Sell government bonds (withdraw money from the economy)\n- Effect: Less lending, spending, and investment\n\n**Limitations of monetary policy:**\n- Time lag between changing rates and economic effects (6-18 months)\n- Cannot address supply-side problems (load shedding, drought)\n- Interest rate changes affect different sectors unevenly\n- Global factors (oil prices, international capital flows) may overwhelm domestic policy"),
  q(11, "During a recession, the SARB would most likely:",
    ["Increase the repo rate", "Decrease the repo rate", "Increase cash reserve requirements", "Sell government bonds"], 1,
    "Lowering the repo rate makes borrowing cheaper, encouraging spending and investment. This is expansionary monetary policy, used to stimulate economic activity during a downturn."),
  t(12, "### Bank Failures\n\nA bank fails when it cannot meet its financial obligations (cannot pay depositors or other creditors).\n\n**Causes of bank failure:**\n- Bad loans (borrowers default, bank loses money)\n- Liquidity crisis (cannot convert assets to cash quickly enough)\n- Bank run (many depositors withdraw simultaneously, often due to panic)\n- Fraud and mismanagement\n- Economic recession reducing asset values\n\n**SA examples:**\n- African Bank (2014): Failed due to excessive unsecured lending; placed under curatorship\n- VBS Mutual Bank (2018): Collapsed due to fraud and looting by management and politicians\n\n**Protection mechanisms:**\n- **SARB as lender of last resort**: Can provide emergency liquidity\n- **Deposit insurance**: Being implemented to protect small depositors\n- **Prudential regulation**: The SARB monitors banks' capital adequacy and risk management\n- **Basel III requirements**: International standards for bank capital and liquidity\n\nBank failures can have a domino effect on the entire financial system, which is why regulation is critical."),
  fb(12, "African Bank failed in 2014 due to excessive ___ lending. VBS Mutual Bank collapsed in 2018 due to ___ and mismanagement.",
    ["unsecured", "fraud"],
    "Both failures highlighted weaknesses in SA banking regulation. African Bank lent too aggressively without collateral; VBS was looted by insiders."),
];

// =============================================================================
// CHAPTER 11: Globalisation (Term 4)
// =============================================================================

blockNum = 0;
const ch11_lesson1 = [
  t(1, "## Globalisation\n\n**Globalisation** is the increasing integration and interdependence of the world's economies through trade, investment, technology, and the movement of people and ideas.\n\n### Meaning and Dimensions\n\n**Economic globalisation:** Increased trade, investment, and financial flows across borders\n**Political globalisation:** International cooperation through organisations (UN, WTO, AU)\n**Social/Cultural globalisation:** Spread of ideas, values, languages, and cultural practices\n**Technological globalisation:** Spread of technology, internet, and digital communication\n\n### Key features of globalisation:\n- Free movement of goods, services, and capital across borders\n- Growth of multinational corporations (MNCs)\n- International trade agreements and organisations\n- Rapid spread of technology and information (internet, social media)\n- Migration of workers across borders\n- Increasing cultural exchange and homogenisation"),
  t(2, "### Causes of Globalisation\n\n1. **Advances in technology:**\n   - Internet and digital communication enable instant global connectivity\n   - Containerisation reduced shipping costs dramatically\n   - Air travel made international business faster\n   - Social media connects people across borders\n\n2. **Trade liberalisation:**\n   - Reduction of tariffs and trade barriers\n   - World Trade Organisation (WTO) promotes free trade\n   - Regional trade agreements (AfCFTA, AGOA)\n   - SA rejoined the global economy after apartheid ended (1994)\n\n3. **Financial liberalisation:**\n   - Deregulation of financial markets\n   - Free flow of capital across borders\n   - Growth of international banking\n\n4. **Multinational corporations (MNCs):**\n   - Operate in multiple countries\n   - Seek cheap labour, raw materials, and new markets\n   - Examples in SA: Toyota, BMW, Coca-Cola, Samsung, Unilever\n\n5. **Political changes:**\n   - End of the Cold War opened new markets\n   - End of apartheid reintegrated SA into the global economy\n   - Formation of economic blocs (EU, BRICS, AU)"),
  q(3, "Which of the following is the most significant technological driver of globalisation?",
    ["Steam engines", "The printing press", "The internet and digital communication", "Nuclear power"], 2,
    "The internet enables instant global communication, e-commerce, digital services, and social media, making it the most significant technological driver of modern globalisation."),
  t(4, "### Consequences of Globalisation\n\n**Positive consequences:**\n1. Increased trade creates economic growth and jobs\n2. Access to a wider variety of goods and services at lower prices\n3. Technology transfer from developed to developing countries\n4. Foreign Direct Investment (FDI) brings capital, skills, and jobs\n5. Increased competition improves quality and efficiency\n6. Cultural exchange and understanding\n7. Access to global markets for SA exporters\n\n**Negative consequences:**\n1. Income inequality between and within countries may increase\n2. Local industries may be destroyed by cheap imports (e.g., SA textile industry)\n3. Environmental degradation (race to the bottom in regulations)\n4. Cultural homogenisation (loss of local cultures, dominance of Western culture)\n5. Exploitation of workers in developing countries (sweatshops)\n6. Tax avoidance by MNCs (profit shifting to low-tax countries)\n7. Financial contagion (crises spread quickly - 2008 GFC)\n8. Brain drain from developing to developed countries"),
  fb(5, "Globalisation is the increasing ___ and interdependence of the world's economies. The ___ Trade Organisation promotes free trade globally.",
    ["integration", "World"],
    "Globalisation connects economies through trade, investment, technology, and people movement. The WTO sets rules for international trade."),
  t(6, "### Globalisation and South Africa\n\n**SA in the global economy:**\n- Member of BRICS (Brazil, Russia, India, China, South Africa)\n- Member of the African Union (AU) and SADC\n- Participant in AfCFTA (African Continental Free Trade Area)\n- Beneficiary of AGOA (African Growth and Opportunity Act - preferential access to US markets)\n- Major exporter of minerals, vehicles, fruit, and wine\n\n**Benefits for SA:**\n- Access to global markets and investment\n- Technology transfer and skills development\n- Foreign companies create jobs (Toyota, BMW, Samsung)\n- Tourism growth from international visitors\n- Integration into global supply chains\n\n**Challenges for SA:**\n- Competition from cheap Chinese imports harming local manufacturers\n- Volatile capital flows affecting the rand exchange rate\n- Brain drain of skilled professionals\n- Exposure to global economic shocks\n- Increasing income inequality\n- Environmental concerns from mining exports"),
  q(7, "BRICS is an economic grouping that includes South Africa and:",
    ["Brazil, Russia, India, China", "Britain, Russia, Indonesia, Canada", "Belgium, Romania, Ireland, Chile", "Botswana, Rwanda, Israel, Colombia"], 0,
    "BRICS consists of Brazil, Russia, India, China, and South Africa. It represents major emerging economies and has expanded to include other members."),
  t(8, "### The North-South Divide\n\nThe **North-South divide** refers to the economic gap between:\n\n**The North (Developed countries):**\n- High income, high HDI\n- Industrialised, service-based economies\n- North America, Europe, Japan, Australia\n- Control most global trade, finance, and technology\n\n**The South (Developing countries):**\n- Low to middle income, lower HDI\n- Dependent on primary commodities\n- Africa, most of Asia, Latin America\n- Face poverty, inequality, and infrastructure challenges\n\n**Key issues:**\n1. **Unequal terms of trade** - Developing countries export cheap raw materials and import expensive manufactured goods\n2. **Debt burden** - Many developing countries owe huge debts to Northern banks and institutions\n3. **Trade barriers** - Northern countries often protect their own industries (agricultural subsidies in EU and USA)\n4. **Technology gap** - North has a massive advantage in innovation and patents\n5. **Brain drain** - Skilled workers migrate from South to North\n\nOrganisations like the IMF, World Bank, and WTO are often criticised for favouring Northern interests."),
  q(9, "The North-South divide refers to:",
    ["The temperature difference between hemispheres", "The economic gap between developed and developing countries", "The cultural difference between Eastern and Western countries", "The political divide during the Cold War"], 1,
    "The North-South divide is the economic inequality between wealthy developed countries (mostly in the Northern hemisphere) and poorer developing countries (mostly in the Southern hemisphere)."),
  fb(10, "SA is a member of ___, an economic grouping of major emerging economies. The North-South ___ refers to the economic gap between developed and developing countries.",
    ["BRICS", "divide"],
    "BRICS membership gives SA a voice among major emerging economies. The North-South divide highlights structural inequality in the global economic system."),
];

// =============================================================================
// CHAPTER 12: Environmental Sustainability (Term 4)
// =============================================================================

blockNum = 0;
const ch12_lesson1 = [
  t(1, "## The Environment and the Economy\n\nThe **environment** provides essential inputs for the economy:\n\n1. **Resources for production** - Raw materials (minerals, timber, water, soil)\n2. **Energy sources** - Coal, oil, gas, solar, wind, hydro\n3. **Waste absorption** - The environment absorbs pollution and waste\n4. **Life support** - Clean air, water, food, and a stable climate\n\nThe economy depends on the environment, but economic activity often **damages** the environment. This creates a conflict between economic growth and environmental protection.\n\n### Environmental Challenges\n\n**Global challenges:**\n- Climate change (rising temperatures, extreme weather events)\n- Air pollution (carbon emissions, smog)\n- Water pollution (industrial waste, sewage)\n- Deforestation (loss of forests for agriculture and development)\n- Biodiversity loss (species extinction)\n- Ozone layer depletion\n\n**SA-specific challenges:**\n- Heavy reliance on coal for electricity (Eskom)\n- Water scarcity (semi-arid country)\n- Mining pollution (acid mine drainage)\n- Deforestation and soil erosion\n- Air pollution in industrial areas (Mpumalanga, Gauteng)"),
  t(2, "### Protecting the Environment\n\n**Market-based approaches:**\n\n1. **Carbon tax** - Tax on carbon emissions to discourage fossil fuel use. SA introduced a carbon tax in 2019 (R159 per tonne of CO2 equivalent, increasing over time)\n\n2. **Emissions trading (cap and trade)** - Government sets a cap on total emissions. Firms can buy and sell emission permits. Those that reduce emissions can profit by selling unused permits.\n\n3. **Subsidies for green technology** - Government financial support for renewable energy, electric vehicles, energy-efficient technology\n\n4. **Polluter pays principle** - Those who cause pollution must pay for the damage\n\n**Regulatory approaches:**\n\n1. **Environmental laws** - National Environmental Management Act (NEMA)\n2. **Environmental Impact Assessments (EIAs)** - Required before major developments\n3. **Emission standards** - Limits on how much pollution industries can emit\n4. **Protected areas** - National parks, marine protected areas\n5. **Waste management regulations** - Requirements for recycling and proper disposal"),
  q(3, "South Africa introduced a carbon tax in 2019. Its primary purpose is to:",
    ["Increase government revenue", "Discourage the use of fossil fuels and reduce carbon emissions", "Fund the building of coal power stations", "Subsidise petrol prices"], 1,
    "The carbon tax makes carbon emissions more expensive, encouraging firms to reduce pollution and switch to cleaner energy sources. While it does raise revenue, its primary purpose is environmental."),
  t(4, "### Approaches to Sustainability\n\n**Sustainable development** means meeting the needs of the present without compromising the ability of future generations to meet their own needs.\n\n**The three pillars of sustainability:**\n1. **Economic sustainability** - Maintaining economic growth and prosperity\n2. **Social sustainability** - Ensuring social equity, inclusion, and quality of life\n3. **Environmental sustainability** - Protecting natural resources and ecosystems\n\n**SA approaches:**\n\n**Renewable energy:**\n- Renewable Energy Independent Power Producer Programme (REIPPP)\n- SA has excellent solar and wind resources\n- Renewable energy capacity has grown significantly\n- Just Energy Transition (JET) Investment Plan to move away from coal\n\n**Green economy:**\n- Creating jobs in renewable energy, waste recycling, conservation\n- National Green Economy Strategy\n- SEFA (Small Enterprise Finance Agency) supports green businesses\n\n**Conservation:**\n- SANParks manages national parks\n- Working for Water and Working on Fire programmes (create jobs while protecting the environment)\n- Marine protected areas"),
  fb(5, "Sustainable development means meeting present needs without compromising ___ generations. SA introduced a ___ tax in 2019 to discourage fossil fuel use.",
    ["future", "carbon"],
    "Sustainability requires balancing economic growth with environmental protection. The carbon tax puts a price on pollution to change behaviour."),
  t(6, "### Global Environmental Agreements\n\n**Key international agreements:**\n\n1. **Paris Agreement (2015):** Countries committed to keeping global warming below 2 degrees Celsius (ideally 1.5 degrees). SA committed to reducing emissions and transitioning away from coal.\n\n2. **Kyoto Protocol (1997):** First binding agreement to reduce greenhouse gas emissions. Developed countries had specific targets.\n\n3. **Montreal Protocol (1987):** Successfully phased out ozone-depleting substances (CFCs). Often cited as the most successful environmental agreement.\n\n4. **UN Sustainable Development Goals (SDGs):** 17 goals to be achieved by 2030, including:\n   - Goal 7: Affordable and clean energy\n   - Goal 12: Responsible consumption and production\n   - Goal 13: Climate action\n   - Goal 14: Life below water\n   - Goal 15: Life on land\n\n**SA's Just Energy Transition:**\nSA secured R130 billion in international climate finance at COP26 (2021) to support the transition from coal to renewable energy. This is critical because coal accounts for approximately 80% of SA electricity generation."),
  q(7, "The Paris Agreement aims to keep global warming below:",
    ["1 degree Celsius", "2 degrees Celsius", "5 degrees Celsius", "10 degrees Celsius"], 1,
    "The Paris Agreement (2015) set the target of limiting global warming to well below 2 degrees Celsius above pre-industrial levels, with efforts to limit it to 1.5 degrees."),
  t(8, "### Local Impact and SA's Responsibility\n\n**SA's carbon footprint:**\n- SA is the 12th-largest emitter of greenhouse gases globally\n- Heavily dependent on coal (Eskom, Sasol)\n- Mining industry contributes to pollution and environmental degradation\n- Transport sector is a growing source of emissions\n\n**Impact on South Africans:**\n- Water scarcity (droughts in Western Cape, 2018 Day Zero crisis)\n- Air pollution causes respiratory diseases (especially near coal plants)\n- Rising temperatures affect agriculture (maize yields, livestock)\n- Extreme weather events (floods in KZN, 2022)\n- Rising sea levels threaten coastal communities\n\n**SA opportunities:**\n- Abundant solar radiation (among the best in the world)\n- Strong wind resources (Eastern Cape, Northern Cape)\n- Green hydrogen potential (using renewable energy to produce hydrogen)\n- Eco-tourism (biodiversity, national parks)\n- Circular economy (recycling, waste reduction)\n\nThe transition to a low-carbon economy is both a challenge and an opportunity for SA. It requires significant investment but can create jobs and improve energy security."),
  fb(9, "SA is the ___th-largest emitter of greenhouse gases globally. The Just Energy Transition aims to move SA away from ___ to renewable energy.",
    ["12", "coal"],
    "SA's high emissions are mainly due to coal-dependent electricity generation. The JET plan provides international finance to support the transition."),
  q(10, "Which environmental agreement is often considered the most successful in history?",
    ["The Paris Agreement", "The Kyoto Protocol", "The Montreal Protocol", "The Johannesburg Declaration"], 2,
    "The Montreal Protocol (1987) successfully phased out ozone-depleting substances (CFCs), leading to the recovery of the ozone layer. It is the only UN environmental treaty ratified by all 198 member states."),
];

// =============================================================================
// CHAPTER 13: Revision (Term 4)
// =============================================================================

blockNum = 0;
const ch13_lesson1 = [
  t(1, "## Revision: Key Concepts and Definitions\n\n### Term 1 Concepts\n\n**Factors of Production:**\n- Land (rent), Labour (wages/salaries), Capital (interest), Entrepreneurship (profit)\n- Marginalised groups: Women, youth, disabled, rural communities, previously disadvantaged\n- Government planning: NDP 2030, BBBEE, SETAs, EPWP\n\n**Circular Flow:**\n- Four sectors: Households, firms, government, foreign sector\n- Injections: I + G + X\n- Leakages: S + T + M\n- Equilibrium: Injections = Leakages\n- Multiplier: k = 1 / (1 - MPC)\n\n**National Accounts:**\n- GDP = GDI = GDE\n- GDE = C + I + G + (X - M)\n- GVA = Output - Intermediate inputs\n- Nominal vs Real GDP\n- Limitations of GDP as welfare measure"),
  t(2, "### Term 1 Concepts (continued)\n\n**Economic Systems:**\n- Free market: Private ownership, price mechanism, profit motive\n- Centrally planned: State ownership, central planning, equality goal\n- Mixed economy: Combination of market and government (SA)\n\n**Economic Structure of SA:**\n- Primary sector (~10%): Mining, agriculture\n- Secondary sector (~22%): Manufacturing, construction\n- Tertiary sector (~65%): Services, finance, government\n- Infrastructure challenges: Load shedding, water, transport\n\n### Term 2 Concepts\n\n**Market Dynamics:**\n- Law of Demand: Price up, quantity demanded down\n- Law of Supply: Price up, quantity supplied up\n- Equilibrium: Where supply meets demand\n- Surplus: Price above equilibrium\n- Shortage: Price below equilibrium\n- Substitutes and complements"),
  t(3, "### Term 2 Concepts (continued)\n\n**Costs and Revenue:**\n- TC = FC + VC\n- AFC = FC / Q (always falling)\n- AVC = VC / Q (U-shaped)\n- ATC = TC / Q = AFC + AVC (U-shaped)\n- MC = Change in TC / Change in Q (U-shaped, intersects AVC and ATC at minimum)\n- TR = P x Q\n- Profit maximisation: MR = MC\n- Shutdown point: P < AVC\n\n**Price Elasticity:**\n- PED = %Change Qd / %Change P\n- PES = %Change Qs / %Change P\n- Elastic (E > 1): Responsive to price changes\n- Inelastic (E < 1): Unresponsive to price changes\n- Factors: substitutes, necessity vs luxury, proportion of income, time\n- Elastic demand: Price increase reduces total revenue\n- Inelastic demand: Price increase increases total revenue"),
  t(4, "### Term 3 Concepts\n\n**Economic Growth:**\n- Real GDP growth rate\n- Lorenz Curve and Gini Coefficient (SA ~0.63)\n- Redistribution: Progressive taxes, grants, BBBEE\n- Demand-side vs supply-side growth methods\n- NDP targets 5-6% growth\n\n**Economic Development:**\n- HDI: Health, education, income (SA ~0.713)\n- Developing country characteristics\n- ISI vs export-oriented growth\n- IKS (Indigenous Knowledge Systems)\n\n**Money and Banking:**\n- Functions of money: Medium of exchange, unit of account, store of value, standard of deferred payment\n- Money supply: M1, M2, M3\n- SARB: Central bank, inflation targeting (3-6%), repo rate\n- Credit creation: Multiplier = 1 / reserve ratio\n- Prime rate = Repo + 3.5%\n- Monetary policy: Expansionary (lower rates) vs contractionary (higher rates)"),
  q(5, "Match the correct remuneration: Land earns ___, Labour earns ___, Capital earns ___, and Entrepreneurship earns ___.",
    ["Rent, Wages, Interest, Profit", "Wages, Rent, Profit, Interest", "Interest, Profit, Rent, Wages", "Profit, Interest, Wages, Rent"], 0,
    "Land = Rent, Labour = Wages/Salaries, Capital = Interest, Entrepreneurship = Profit. This is a fundamental concept tested frequently in exams."),
  t(6, "### Term 4 Concepts\n\n**Globalisation:**\n- Integration of world economies through trade, investment, technology\n- Causes: Technology, trade liberalisation, MNCs, political changes\n- Positive: Growth, variety, FDI, technology transfer\n- Negative: Inequality, local industry destruction, brain drain\n- North-South divide: Economic gap between developed and developing countries\n- SA: BRICS member, AfCFTA, AGOA\n\n**Environmental Sustainability:**\n- Three pillars: Economic, social, environmental\n- Market approaches: Carbon tax, emissions trading, polluter pays\n- Regulatory approaches: NEMA, EIAs, emission standards\n- Paris Agreement: Below 2 degrees Celsius warming\n- Montreal Protocol: Ozone layer (most successful)\n- SA: 12th-largest emitter, JET plan, renewable energy potential"),
  q(7, "The multiplier is 4. Government injects R50 million into the economy. The total increase in national income is:",
    ["R50 million", "R100 million", "R200 million", "R250 million"], 2,
    "Total increase = Initial injection x Multiplier = R50m x 4 = R200m. If k = 4, then MPS = 0.25 and MPC = 0.75."),
  fb(8, "The three pillars of sustainability are economic, ___, and environmental. The SARB Monetary Policy Committee meets ___ times per year.",
    ["social", "six"],
    "Sustainability requires balance across all three pillars. The MPC meets regularly to review economic conditions and decide on the repo rate."),
  q(9, "In a mixed economy like South Africa, which statement is TRUE?",
    ["Only the government makes economic decisions", "Only the private sector makes economic decisions", "Both the market and government play roles in economic decisions", "There is no government intervention in the economy"], 2,
    "A mixed economy combines private enterprise with government intervention. In SA, private businesses operate freely alongside SOEs, regulation, social grants, and BBBEE policies."),
  t(10, "### Exam Tips\n\n**For Section A (Multiple choice and matching):**\n- Read every option carefully before answering\n- Eliminate obviously wrong answers first\n- Watch for absolute words (always, never) which are often incorrect\n\n**For Section B (Data response and short questions):**\n- Quote from the source material where possible\n- Use economic terminology correctly\n- Show calculations clearly with formulas first\n\n**For Section C (Essays):**\n- Structure: Introduction, body (with headings), conclusion\n- Use the PEEL method: Point, Explain, Example, Link\n- Include SA examples wherever possible\n- Draw and label diagrams where relevant\n- Address both advantages and disadvantages if asked to discuss\n\n**Key formulas to memorise:**\n- GDP (expenditure) = C + I + G + (X - M)\n- Multiplier = 1 / (1 - MPC) = 1 / MPS\n- PED = %Change Qd / %Change P\n- TC = FC + VC\n- Profit maximisation: MR = MC\n- Credit multiplier = 1 / Reserve ratio"),
];

// =============================================================================
// INSERT EVERYTHING
// =============================================================================

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or determine Grade 11 grade ID
  const gradeDoc = await db.collection('grades').findOne({ name: /11/i });
  const GRADE_ID = gradeDoc ? gradeDoc._id : new mongoose.Types.ObjectId('69d2c1f317b8332733f72601');
  console.log('Grade 11 ID:', String(GRADE_ID));

  // Find or create Economics subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Economics/i, schoolId: SCHOOL_ID });
  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Economics subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Economics',
      code: 'ECO',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Economics subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Factors of Production',
      description: 'Land, labour, capital, entrepreneurship, remuneration, accessibility, marginalised groups, economic planning.',
      order: 1,
      lessons: [
        { title: 'The Four Factors of Production', description: 'Land (natural resources), labour, capital, and entrepreneurship with their remuneration, SA context and challenges.', blocks: ch1_lesson1, term: 1 },
        { title: 'Marginalised Groups and Economic Planning', description: 'Groups with limited access to factors, BBBEE, NDP 2030, government interventions, accessibility barriers and solutions.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Circular Flow and National Accounts',
      description: 'Circular flow model, injections and leakages, multiplier, national accounts, GDP, GDI, GDE, GVA.',
      order: 2,
      lessons: [
        { title: 'The Circular Flow Model', description: 'Two-sector to four-sector model, injections and leakages, equilibrium, MPC/MPS, the multiplier effect.', blocks: ch2_lesson1, term: 1 },
        { title: 'National Accounts', description: 'Consumption expenditure, government expenditure, GFCF, GVA, GDP measurement methods, per capita income, limitations.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Economic Systems',
      description: 'Free market (capitalism), centrally planned (socialism/communism), mixed economy, SA as a mixed economy.',
      order: 3,
      lessons: [
        { title: 'Economic Systems', description: 'Free market, centrally planned, and mixed economies compared. SA as a mixed economy with SOEs, social grants, BBBEE, and free enterprise.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Economic Structure of SA',
      description: 'Primary, secondary, tertiary sectors, structural change, infrastructure, service provisioning.',
      order: 4,
      lessons: [
        { title: 'The Economic Structure of South Africa', description: 'Primary (mining, agriculture), secondary (manufacturing, construction), tertiary (services) sectors, infrastructure challenges, service provisioning.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Market Dynamics',
      description: 'Demand and supply, relative prices, substitutes, complements, market equilibrium, shifts.',
      order: 5,
      lessons: [
        { title: 'Demand, Supply, and Market Equilibrium', description: 'Laws of demand and supply, determinants, substitutes and complements, equilibrium, surplus and shortage, shifts in equilibrium.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Costs and Revenue',
      description: 'Short-run costs (total, average, marginal), long-run costs, revenue calculations, profit/loss, market structures.',
      order: 6,
      lessons: [
        { title: 'Costs, Revenue, and Profit', description: 'Fixed and variable costs, average and marginal costs, long-run costs, economies of scale, revenue, profit maximisation (MR=MC).', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Price Elasticity',
      description: 'Price elasticity of demand and supply, calculating values, factors determining elasticity.',
      order: 7,
      lessons: [
        { title: 'Price Elasticity of Demand and Supply', description: 'PED and PES formulas, calculating elasticity, elastic vs inelastic, factors determining elasticity, total revenue relationship.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Economic Growth',
      description: 'Wealth creation, distribution, Gini coefficient, Lorenz curve, redistribution, inequality, growth methods, SA endeavours.',
      order: 8,
      lessons: [
        { title: 'Economic Growth and Inequality', description: 'Wealth creation, Lorenz Curve, Gini coefficient, redistribution tools, demand-side and supply-side growth methods, SA challenges.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Economic Development',
      description: 'Measuring development, HDI, developing country characteristics, strategies, IKS, SA endeavours.',
      order: 9,
      lessons: [
        { title: 'Economic Development and the HDI', description: 'Growth vs development, HDI, characteristics of developing countries, ISI, export-oriented growth, FDI, Indigenous Knowledge Systems.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Money and Banking',
      description: 'Functions of money, monetary system, SARB, commercial banks, credit creation, interest rates, monetary policy, bank failures.',
      order: 10,
      lessons: [
        { title: 'Money, Banking, and Monetary Policy', description: 'Functions of money, SA monetary system, SARB, commercial banks, credit creation, interest rates, monetary policy, bank failures.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Globalisation',
      description: 'Meaning, causes, consequences, North-South divide, SA in the global economy.',
      order: 11,
      lessons: [
        { title: 'Globalisation and the North-South Divide', description: 'Meaning and dimensions of globalisation, causes, positive and negative consequences, North-South divide, SA and BRICS.', blocks: ch11_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Environmental Sustainability',
      description: 'The environment, protecting it, approaches to sustainability, global and local impact.',
      order: 12,
      lessons: [
        { title: 'Environmental Sustainability', description: 'Environment and economy, market-based and regulatory approaches, sustainability pillars, global agreements, SA carbon footprint and JET plan.', blocks: ch12_lesson1, term: 4 },
      ],
    },
    {
      title: 'Chapter 13: Revision',
      description: 'Comprehensive revision of all Grade 11 Economics topics, key formulas, exam preparation tips.',
      order: 13,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'Key concepts from all terms, essential formulas, exam tips for multiple choice, data response, and essay questions.', blocks: ch13_lesson1, term: 4 },
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
    title: 'Grade 11 Economics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Micro-economics, Macro-economics, and Contemporary Economic Issues for Grade 11 Economics.',
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
  console.log('  TEXTBOOK: Grade 11 Economics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
