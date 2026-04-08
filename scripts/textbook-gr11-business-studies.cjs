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
// CHAPTER 1: Business Environments (Term 1)
// =============================================================================

// Lesson 1: The Micro Environment
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Business Environment\n\nEvery business operates within an environment that influences its success or failure. The business environment is divided into three layers:\n\n1. **Micro environment** (internal) - factors within the business that management can control\n2. **Market environment** (task/operating) - factors outside the business that directly interact with it\n3. **Macro environment** (external) - broad forces that affect all businesses in the economy\n\nUnderstanding each layer helps business owners and managers make informed decisions, plan strategically, and respond effectively to change.'),
  t(2, '### The Micro Environment\n\nThe micro environment consists of internal factors that the business CAN control or influence directly.\n\n**Components of the micro environment:**\n\n| Component | Description |\n|-----------|-------------|\n| **Vision and mission** | The long-term purpose and direction of the business |\n| **Business goals and objectives** | Specific targets the business wants to achieve |\n| **Organisational culture** | Shared values, beliefs, and norms within the business |\n| **Management and leadership** | Quality and style of decision-making |\n| **Human resources** | Employees, their skills, motivation, and productivity |\n| **Business functions** | General management, purchasing, production, marketing, finance, HR, administration, public relations |\n| **Resources** | Physical assets, finances, technology, information |'),
  t(3, '### The Eight Business Functions\n\nEvery business performs eight key functions to operate effectively:\n\n1. **General management** - Planning, organising, leading, and controlling the entire business\n2. **Purchasing** - Sourcing and buying raw materials, stock, and supplies\n3. **Production** - Converting inputs into finished products or services\n4. **Marketing** - Identifying customer needs and promoting products\n5. **Financial** - Managing the money: budgets, cash flow, financial statements\n6. **Human resources** - Recruiting, training, and managing employees\n7. **Administration** - Office management, record-keeping, and communication\n8. **Public relations** - Building and maintaining the business image and stakeholder relationships'),
  q(4, 'Which of the following is a component of the micro environment?',
    ['Interest rates', 'Competitors', 'Organisational culture', 'Government legislation'], 2,
    'Organisational culture is an internal factor that the business controls, making it part of the micro environment. Interest rates and legislation are macro factors; competitors are part of the market environment.'),
  fb(5, 'The micro environment consists of factors that the business ___ control, while the macro environment consists of factors that the business ___ control.',
    ['can', 'cannot'],
    'The micro environment is internal and controllable. The macro environment is external and largely uncontrollable.',
    ['Think about what is inside versus outside the business.']),
  t(6, '### Vision, Mission, and Goals\n\n**Vision statement:** Describes the ideal future the business wants to create.\n- Example: Woolworths vision - "To be one of the world\'s most responsible retailers"\n\n**Mission statement:** Describes the purpose of the business and how it will achieve its vision.\n- Example: Capitec - "To provide accessible, affordable, and simplified banking"\n\n**Goals and objectives:**\n- Goals are broad, long-term outcomes (e.g., increase market share)\n- Objectives are specific, measurable targets (e.g., increase market share by 5% in the next financial year)\n\n**SMART objectives:**\n- **S**pecific - clearly defined\n- **M**easurable - can track progress\n- **A**chievable - realistic given resources\n- **R**elevant - aligned with the mission\n- **T**ime-bound - has a deadline'),
  q(7, 'What does the "M" in SMART objectives stand for?',
    ['Meaningful', 'Measurable', 'Motivational', 'Manageable'], 1,
    'SMART stands for Specific, Measurable, Achievable, Relevant, and Time-bound.'),
  t(8, '### Organisational Culture and Resources\n\n**Organisational culture** is the personality of the business. It includes:\n- How employees interact with each other and customers\n- The level of innovation and risk-taking encouraged\n- Communication styles (formal vs informal)\n- Dress code and work environment\n\n**Example:** Google has a culture of innovation with open workspaces, flexible hours, and encouragement to experiment. In contrast, a law firm typically has a formal culture with strict dress codes and hierarchical communication.\n\n**Resources a business needs:**\n- **Financial resources** - capital, profits, loans\n- **Physical resources** - equipment, buildings, vehicles\n- **Human resources** - skilled workforce\n- **Technological resources** - software, systems, machinery\n- **Information resources** - data, research, market intelligence'),
  q(9, 'Which business function is responsible for managing budgets and cash flow?',
    ['Administration', 'General management', 'Financial function', 'Purchasing function'], 2,
    'The financial function manages all money-related aspects of the business including budgets, cash flow, and financial statements.'),
  t(10, '### Control Factors in the Micro Environment\n\nBecause the micro environment is internal, management can take direct action to improve it:\n\n- **Weak management?** Provide leadership training or hire experienced managers\n- **Low employee morale?** Improve working conditions, offer incentives, communicate better\n- **Outdated technology?** Invest in new systems and equipment\n- **Poor culture?** Implement team-building, revise policies, lead by example\n- **Unclear goals?** Develop a strategic plan with SMART objectives\n\nThe degree of control a business has over micro-environment factors is its greatest advantage. Businesses that actively manage these internal factors are more likely to succeed.'),
];

// Lesson 2: Market and Macro Environments
blockNum = 0;
const ch1_lesson2 = [
  t(1, '## The Market Environment\n\nThe market environment consists of external factors that directly interact with the business on a daily basis. The business has LIMITED control over these factors but can influence them through its strategies.\n\n**Components of the market environment:**\n\n| Component | Description |\n|-----------|-------------|\n| **Consumers/Customers** | People who buy the business\'s products or services |\n| **Suppliers** | Businesses that provide raw materials, stock, or services |\n| **Competitors** | Other businesses offering similar products in the same market |\n| **Intermediaries** | Agents, wholesalers, retailers who help distribute products |\n| **Trade unions** | Organisations representing worker interests |\n| **Regulators** | Industry bodies that set standards and rules |'),
  t(2, '### Consumers and Suppliers\n\n**Consumers** are the most important component of the market environment. Without customers, a business cannot survive.\n\n**Influencing consumers:**\n- Quality products at competitive prices\n- Excellent customer service\n- Effective advertising and promotions\n- Brand loyalty programmes (e.g., Pick n Pay Smart Shopper, Clicks ClubCard)\n\n**Suppliers** provide the inputs a business needs. Good supplier relationships ensure:\n- Consistent quality of materials\n- Reliable delivery schedules\n- Competitive pricing\n- Credit facilities\n\n**Example:** Nando\'s carefully selects chicken suppliers who meet their quality standards and animal welfare requirements. A disruption in the chicken supply chain (like the 2017 avian flu outbreak in SA) directly affected Nando\'s operations and prices.'),
  t(3, '### Competitors and Intermediaries\n\n**Competition** drives businesses to improve. Types of competitors:\n- **Direct competitors** - offer the same product (e.g., Shoprite vs Pick n Pay)\n- **Indirect competitors** - offer substitute products (e.g., bus service vs ride-hailing app)\n\n**Competitive strategies:**\n- Differentiation (offering something unique)\n- Cost leadership (offering the lowest prices)\n- Focus strategy (targeting a niche market)\n\n**Intermediaries** help move products from producer to consumer:\n- **Wholesalers** - buy in bulk and sell to retailers\n- **Retailers** - sell directly to consumers\n- **Agents/Brokers** - connect buyers and sellers for a commission\n- **Distributors** - handle logistics and delivery\n\n**Example:** Samsung uses intermediaries like Vodacom, MTN, Takealot, and Game to distribute their phones to South African consumers.'),
  q(4, 'Shoprite and Pick n Pay are examples of which type of competitors?',
    ['Indirect competitors', 'Direct competitors', 'Potential competitors', 'Substitute competitors'], 1,
    'Shoprite and Pick n Pay are direct competitors because they both offer the same type of product (groceries) to the same market.'),
  t(5, '## The Macro Environment\n\nThe macro environment consists of broad external forces that affect ALL businesses. Individual businesses have NO direct control over these factors but must adapt to them.\n\n**Components of the macro environment (PESTLE):**\n\n| Factor | Examples |\n|--------|----------|\n| **P**olitical | Government policies, political stability, regulations, trade policies |\n| **E**conomic | Inflation, interest rates, exchange rates, unemployment, GDP growth |\n| **S**ocial | Demographics, consumer attitudes, cultural trends, education levels, HIV/AIDS |\n| **T**echnological | New inventions, automation, internet, e-commerce, Industry 4.0 |\n| **L**egal | Labour laws, consumer protection, tax laws, environmental legislation |\n| **E**cological/Environmental | Climate change, pollution regulations, sustainability, water scarcity |'),
  t(6, '### Economic and Political Factors\n\n**Economic factors** that affect business:\n\n- **Inflation** - Rising prices reduce consumer purchasing power. Businesses face higher input costs.\n- **Interest rates** - Higher rates increase borrowing costs and reduce consumer spending on credit.\n- **Exchange rates** - A weaker rand makes imports more expensive but exports cheaper.\n- **Unemployment** - High unemployment (SA sits above 30%) reduces consumer spending power but increases the labour supply.\n\n**Political factors:**\n- Government stability affects investor confidence\n- Trade agreements (e.g., AfCFTA - African Continental Free Trade Area) open new markets\n- Load shedding (energy policy failures) disrupts production and increases costs\n- Land reform policies affect agricultural and property businesses\n\n**Example:** When the rand weakened significantly in 2023, imported fuel became more expensive, increasing transport costs for every business in South Africa.'),
  fb(7, 'PESTLE stands for Political, Economic, Social, Technological, ___, and Ecological.',
    ['Legal'],
    'The L in PESTLE stands for Legal factors such as labour laws, consumer protection, and tax regulations.',
    ['Think about the laws and regulations that affect businesses.']),
  q(8, 'Which macro-environment factor would load shedding in South Africa fall under?',
    ['Social', 'Economic', 'Political', 'Technological'], 2,
    'Load shedding is primarily a political factor as it results from government energy policy and the management of state-owned enterprises like Eskom.'),
  t(9, '### Social, Technological, and Legal Factors\n\n**Social factors:**\n- SA has a youthful population (large potential market and workforce)\n- Growing middle class with increasing spending power\n- High crime rates increase security costs\n- HIV/AIDS affects workforce productivity and healthcare costs\n- Cultural diversity requires businesses to be inclusive\n\n**Technological factors:**\n- E-commerce growth (Takealot, Mr D Food, Checkers Sixty60)\n- Mobile banking (FNB app, Capitec app)\n- Social media marketing\n- Automation replacing manual labour\n- Cybersecurity threats\n\n**Legal factors:**\n- Companies Act, Consumer Protection Act, NCA\n- Employment legislation (LRA, BCEA, EEA)\n- POPIA (Protection of Personal Information Act)\n- Environmental laws\n\n**Ecological factors:**\n- Droughts affect agriculture (e.g., 2018 Cape Town water crisis)\n- Businesses must reduce carbon footprints\n- Green consumerism is growing'),
  q(10, 'The growth of online shopping platforms like Takealot is an example of which macro-environment factor?',
    ['Economic', 'Social', 'Technological', 'Political'], 2,
    'E-commerce platforms like Takealot represent technological changes in the macro environment that are transforming how businesses operate and consumers shop.'),
];

// Lesson 3: SWOT Analysis
blockNum = 0;
const ch1_lesson3 = [
  t(1, '## SWOT Analysis\n\nSWOT analysis is a strategic planning tool that helps a business assess its position by examining internal and external factors.\n\n| | **Positive** | **Negative** |\n|---|---|---|\n| **Internal** (micro) | **S**trengths | **W**eaknesses |\n| **External** (market + macro) | **O**pportunities | **T**hreats |\n\n**Strengths and weaknesses** come from the micro environment (controllable).\n**Opportunities and threats** come from the market and macro environments (uncontrollable).'),
  t(2, '### Strengths and Weaknesses (Internal)\n\n**Strengths** are internal advantages that give the business a competitive edge:\n- Strong brand recognition\n- Skilled and motivated employees\n- Efficient production processes\n- Strong financial position\n- Good location\n- Loyal customer base\n\n**Weaknesses** are internal limitations that hinder the business:\n- High staff turnover\n- Outdated technology\n- Poor management skills\n- Limited financial resources\n- Weak brand image\n- Inefficient processes\n\n**Example - Woolworths SWOT:**\n- Strength: Premium brand image, trusted quality\n- Weakness: Higher prices than competitors, limited store locations in rural areas'),
  t(3, '### Opportunities and Threats (External)\n\n**Opportunities** are external conditions the business can exploit:\n- Growing demand for a product\n- New market segments\n- Favourable government policies\n- Weak competitors\n- Technological advances\n- Trade agreements opening new export markets\n\n**Threats** are external conditions that could harm the business:\n- New competitors entering the market\n- Economic recession\n- Rising interest rates\n- New regulations increasing costs\n- Changing consumer preferences\n- Natural disasters or pandemics\n\n**Example - Woolworths SWOT:**\n- Opportunity: Growing health-conscious consumer market, expansion into Africa\n- Threat: Competition from Checkers FreshX, load shedding increasing operating costs'),
  q(4, 'In a SWOT analysis, which TWO elements are internal factors?',
    ['Strengths and Opportunities', 'Strengths and Weaknesses', 'Opportunities and Threats', 'Weaknesses and Threats'], 1,
    'Strengths and weaknesses are internal (micro environment) factors. Opportunities and threats are external (market and macro environment) factors.'),
  t(5, '### Conducting a SWOT Analysis\n\n**Steps to perform a SWOT analysis:**\n\n1. **Gather information** about internal operations (financial data, employee surveys, production reports)\n2. **Research external factors** (market trends, competitor actions, economic indicators)\n3. **Categorise** findings into Strengths, Weaknesses, Opportunities, and Threats\n4. **Analyse** how strengths can exploit opportunities and defend against threats\n5. **Develop strategies** based on the analysis:\n   - **SO strategies** - Use strengths to take advantage of opportunities\n   - **WO strategies** - Address weaknesses to take advantage of opportunities\n   - **ST strategies** - Use strengths to minimise threats\n   - **WT strategies** - Minimise weaknesses and avoid threats'),
  fb(6, 'SWOT stands for ___, ___, Opportunities, and Threats.',
    ['Strengths', 'Weaknesses'],
    'SWOT analysis examines a business by looking at its Strengths, Weaknesses, Opportunities, and Threats.',
    ['The first two letters relate to internal factors.']),
  t(7, '### SWOT Case Study: Capitec Bank\n\n| Strengths | Weaknesses |\n|-----------|------------|\n| Simple, affordable banking products | Limited international presence |\n| Strong digital banking platform | Perception as a bank for lower-income customers |\n| Fastest-growing client base in SA | Fewer physical branches than FNB or Standard Bank |\n| Excellent customer service ratings | Limited corporate/business banking |\n\n| Opportunities | Threats |\n|---------------|----------|\n| Growing demand for digital banking | Increased competition from TymeBank and Discovery Bank |\n| Expansion into insurance and credit | Regulatory changes affecting banking fees |\n| Youth market (student accounts) | Cybersecurity risks |\n| African expansion | High unemployment reducing client growth |'),
  q(8, 'If Capitec uses its strong digital platform (strength) to capture the growing demand for online banking (opportunity), this is an example of which SWOT strategy?',
    ['WO strategy', 'ST strategy', 'SO strategy', 'WT strategy'], 2,
    'An SO strategy uses a strength to take advantage of an opportunity. Capitec would be leveraging its digital strength to exploit the digital banking opportunity.'),
];

// =============================================================================
// CHAPTER 2: Challenges of the Business Environment (Term 1)
// =============================================================================

// Lesson 1: Challenges of Micro and Market Environments
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Challenges of the Micro Environment\n\nBusinesses face internal challenges that can threaten their success if not managed effectively.\n\n**Key micro-environment challenges:**\n\n1. **Poor management** - Managers who lack planning, organising, leading, or controlling skills make poor decisions that affect the entire business.\n\n2. **Lack of skilled employees** - South Africa has a significant skills shortage in many sectors. Businesses struggle to find qualified workers, especially in technical fields.\n\n3. **Outdated technology** - Businesses that do not invest in modern technology fall behind competitors who use automation, digital systems, and data analytics.\n\n4. **Insufficient capital** - Many small businesses fail because they run out of money. Poor financial management leads to cash flow problems.\n\n5. **Negative organisational culture** - A toxic work environment leads to low productivity, high staff turnover, and poor customer service.'),
  t(2, '### Overcoming Micro-Environment Challenges\n\n| Challenge | Strategy |\n|-----------|----------|\n| Poor management | Invest in management training; hire experienced leaders; implement mentorship programmes |\n| Skills shortage | Partner with SETAs for learnerships; offer bursaries; provide in-house training |\n| Outdated technology | Budget for regular technology upgrades; adopt cloud-based systems; invest in digital transformation |\n| Insufficient capital | Improve cash flow management; explore funding options (SEFA, NEF, bank loans); reduce unnecessary expenses |\n| Negative culture | Lead by example; develop clear values; reward positive behaviour; address conflict promptly |\n\n**Example:** A small restaurant in Johannesburg was struggling because the owner had no formal management training. After enrolling in a SETA-funded short course in business management, the owner implemented proper stock control, staff scheduling, and financial record-keeping, turning the business around within six months.'),
  q(3, 'Which of the following is a challenge of the MICRO environment?',
    ['Increasing competition', 'Rising interest rates', 'Lack of skilled employees', 'New government regulations'], 2,
    'Lack of skilled employees is an internal (micro) challenge. Competition is a market challenge, while interest rates and regulations are macro challenges.'),
  t(4, '## Challenges of the Market Environment\n\nThe market environment presents challenges that directly affect the business\'s ability to compete and serve customers.\n\n**Key market-environment challenges:**\n\n1. **Intense competition** - Price wars reduce profit margins. New entrants constantly enter markets.\n\n2. **Changing consumer preferences** - Consumers constantly change what they want. Businesses that fail to adapt lose market share.\n\n3. **Unreliable suppliers** - Late deliveries, poor quality, or price increases disrupt operations.\n\n4. **Powerful trade unions** - Strikes and wage demands increase costs and disrupt production.\n\n5. **Changing intermediary landscape** - The rise of e-commerce bypasses traditional wholesalers and retailers.'),
  t(5, '### Overcoming Market-Environment Challenges\n\n| Challenge | Strategy |\n|-----------|----------|\n| Intense competition | Differentiate through quality, service, or innovation; build brand loyalty; find niche markets |\n| Changing consumer preferences | Conduct regular market research; stay on top of trends; be agile and responsive |\n| Unreliable suppliers | Diversify supplier base; build long-term relationships; negotiate contracts with penalties for late delivery |\n| Powerful trade unions | Maintain open communication; negotiate in good faith; ensure fair wages and conditions proactively |\n| E-commerce disruption | Develop online sales channels; offer omnichannel experiences; partner with delivery platforms |\n\n**Example:** Checkers adapted to changing consumer preferences by launching Sixty60 (delivery in 60 minutes), offering online shopping, and rebranding stores with the FreshX concept. This allowed them to compete effectively against Woolworths and Pick n Pay.'),
  q(6, 'Checkers launching the Sixty60 app is an example of adapting to which challenge?',
    ['Poor management', 'Skills shortage', 'Changing consumer preferences', 'Government regulations'], 2,
    'Checkers Sixty60 was a response to changing consumer preferences for convenience, fast delivery, and online shopping options.'),
  fb(7, 'The market environment includes consumers, suppliers, competitors, ___, and regulators.',
    ['intermediaries'],
    'Intermediaries (wholesalers, retailers, agents, distributors) are a key component of the market environment.',
    ['Think about the businesses that help distribute products from producer to consumer.']),
  t(8, '### Impact of Competition on Business Strategy\n\nSouth African businesses face intense competition in most sectors:\n\n**Retail grocery:**\n- Shoprite, Checkers, Pick n Pay, Woolworths, SPAR all compete for the same consumers\n- Price is the main competitive factor in the lower-income segment\n- Quality and experience differentiate in the premium segment\n\n**Telecommunications:**\n- Vodacom, MTN, Cell C, Telkom, and Rain compete on data prices and network coverage\n- Competition has driven data prices down significantly\n\n**Banking:**\n- Traditional banks (FNB, Standard Bank, ABSA, Nedbank) face new challengers (Capitec, TymeBank, Discovery Bank)\n- Digital banking has become a key competitive battleground\n\nBusinesses must continuously monitor competitors and adjust their strategies to maintain their market position.'),
];

// Lesson 2: Challenges of the Macro Environment and Adapting
blockNum = 0;
const ch2_lesson2 = [
  t(1, '## Challenges of the Macro Environment\n\nMacro-environment challenges affect ALL businesses in the economy. Individual businesses cannot control these factors but must develop strategies to cope.\n\n**Key macro-environment challenges in South Africa:**\n\n1. **Economic challenges:**\n   - High inflation increasing input costs\n   - High interest rates making borrowing expensive\n   - Rand depreciation increasing import costs\n   - Slow economic growth limiting market expansion\n   - High unemployment reducing consumer spending\n\n2. **Political challenges:**\n   - Load shedding disrupting operations\n   - Policy uncertainty discouraging investment\n   - Corruption undermining business confidence\n   - Municipal service failures (water, roads)'),
  t(2, '### Social, Technological, Legal, and Environmental Challenges\n\n**3. Social challenges:**\n- High crime rate increases security costs\n- HIV/AIDS and other health issues affect workforce productivity\n- Skills gap between education system output and business needs\n- Income inequality creating unstable social environment\n- Xenophobia affecting certain businesses\n\n**4. Technological challenges:**\n- Digital disruption making traditional business models obsolete\n- Cybercrime and data breaches\n- High cost of technology adoption for small businesses\n- Need for constant upskilling of employees\n\n**5. Legal challenges:**\n- Compliance costs for new legislation\n- POPIA requiring data protection measures\n- Changing tax regulations\n\n**6. Environmental challenges:**\n- Water scarcity (especially Western and Northern Cape)\n- Pressure to reduce carbon footprint\n- Strict environmental regulations increasing production costs'),
  t(3, '### Adapting to Macro-Environment Challenges\n\n**Economic strategies:**\n- Reduce costs without reducing quality\n- Diversify revenue streams\n- Export to earn foreign currency when rand is weak\n- Negotiate better terms with suppliers\n\n**Load shedding strategies:**\n- Invest in generators, solar panels, battery systems (e.g., Shoprite invested R3 billion in renewable energy)\n- Adjust operating hours to avoid peak load shedding times\n- Implement energy-efficient equipment\n- Develop business continuity plans\n\n**Technological strategies:**\n- Embrace digital transformation\n- Invest in cybersecurity\n- Upskill employees in digital tools\n- Partner with tech companies'),
  q(4, 'Which of the following is a strategy for a business to adapt to load shedding?',
    ['Reduce employee salaries', 'Invest in solar panels and generators', 'Close the business during load shedding', 'Move the business to another country'], 1,
    'Investing in alternative energy sources like solar panels and generators allows businesses to continue operating during load shedding.'),
  t(5, '### Case Study: How SA Businesses Adapted to Challenges\n\n**Shoprite Group (adapting to economic and energy challenges):**\n- Invested R3 billion in solar panels, reducing energy dependence on Eskom\n- Launched Checkers Sixty60 to adapt to changing consumer preferences\n- Expanded into African markets to diversify beyond SA\'s slow economy\n- Used technology to improve supply chain efficiency\n\n**Discovery (adapting to technological disruption):**\n- Launched Discovery Bank using behavioural economics and technology\n- Used Vitality programme to differentiate from traditional insurers\n- Continuously innovates with data analytics and AI\n\n**Mr Price (adapting to competition):**\n- Focused on affordability during economic downturn\n- Expanded online presence significantly\n- Diversified into homeware, sport, and cellular segments'),
  fb(6, 'Macro-environment challenges can be analysed using the ___ framework, which examines Political, Economic, Social, Technological, Legal, and Ecological factors.',
    ['PESTLE'],
    'PESTLE is the framework used to analyse macro-environment factors affecting businesses.',
    ['The acronym uses the first letter of each factor.']),
  q(7, 'Why does a weak rand INCREASE costs for South African businesses?',
    ['It reduces export earnings', 'It makes imports more expensive', 'It increases employee wages', 'It reduces government spending'], 1,
    'A weak rand means more rands are needed to buy foreign currency, making imported goods, raw materials, and equipment more expensive for South African businesses.'),
  t(8, '### Summary: Levels of Control\n\n| Environment | Level of Control | Examples |\n|-------------|-----------------|----------|\n| Micro | **Full control** - business can directly change these factors | Management quality, employee skills, technology, organisational culture |\n| Market | **Limited influence** - business can take actions to affect these | Customer relationships, supplier agreements, competitive strategies |\n| Macro | **No control** - business must ADAPT | Interest rates, government policy, pandemics, climate change |\n\n**Key insight:** The best businesses are those that maximise their micro-environment strengths, actively manage market-environment relationships, and proactively adapt to macro-environment changes instead of just reacting.'),
  q(9, 'A business has FULL control over factors in which environment?',
    ['Market environment', 'Macro environment', 'Micro environment', 'All environments equally'], 2,
    'The micro environment consists of internal factors that the business has full control over, such as management, employees, and resources.'),
];

// =============================================================================
// CHAPTER 3: Contemporary Socio-Economic Issues (Term 1)
// =============================================================================

// Lesson 1: Socio-Economic Issues and Their Impact
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Contemporary Socio-Economic Issues\n\nSocio-economic issues are social and economic problems that affect businesses, workers, and communities. These issues create challenges AND opportunities for businesses.\n\n**Key socio-economic issues affecting SA businesses:**\n\n1. Piracy and counterfeiting\n2. Strikes and industrial action\n3. Intellectual property rights violations\n4. Impact of HIV/AIDS on the workforce\n5. Income inequality and poverty\n6. Crime and corruption\n7. Skills shortage\n8. Substance abuse in the workplace'),
  t(2, '### Impact on Business Operations\n\n**Piracy** (illegal copying of products):\n- Reduces revenue for legitimate businesses\n- Discourages innovation and creativity\n- Costs the SA economy billions of rands annually\n- Affects music, film, software, fashion, and pharmaceutical industries\n- **Example:** Illegal copies of textbooks cost publishers millions in lost sales, reducing their ability to invest in new educational content\n\n**Counterfeiting** (producing fake copies of branded goods):\n- Undermines brand reputation and consumer trust\n- Poses safety risks (fake medicines, electrical goods, car parts)\n- Leads to job losses in legitimate manufacturing\n- **Example:** Fake branded clothing sold at informal markets costs the SA fashion industry an estimated R7 billion per year'),
  t(3, '### Strikes and Industrial Action\n\n**Types of industrial action:**\n- **Strike** - employees refuse to work to put pressure on employer\n- **Go-slow** - employees work at a deliberately slow pace\n- **Work-to-rule** - employees do only the absolute minimum required\n- **Lockout** - employer prevents employees from entering the workplace\n\n**Impact of strikes on businesses:**\n- Loss of production and revenue\n- Damage to property and equipment\n- Loss of customers to competitors\n- Increased costs (security, catch-up production)\n- Damaged employer-employee relationships\n\n**Impact on the economy:**\n- Reduced GDP growth\n- Reduced investor confidence\n- Supply chain disruptions\n\n**Example:** The 2014 platinum mining strike lasted five months and cost the economy an estimated R24 billion. Workers lost R10.6 billion in wages, and several mines never reopened.'),
  q(4, 'Which type of industrial action involves employees deliberately working at a slower pace?',
    ['Strike', 'Go-slow', 'Work-to-rule', 'Lockout'], 1,
    'A go-slow is when employees deliberately reduce their work rate to put pressure on the employer without fully stopping work.'),
  t(5, '### Intellectual Property Rights\n\nIntellectual property (IP) refers to creations of the mind that are legally protected.\n\n**Types of IP protection:**\n\n| Type | What it Protects | Duration | Example |\n|------|-----------------|----------|----------|\n| **Copyright** | Original literary, musical, artistic works, software | Life of author + 50 years | A novel, a song, computer code |\n| **Patent** | Inventions and new processes | 20 years | A new medicine, a machine design |\n| **Trademark** | Brand names, logos, slogans | 10 years (renewable) | Nike swoosh, Coca-Cola logo |\n| **Design** | The appearance of a product | 15 years | Shape of a Coca-Cola bottle |\n\n**Why IP protection matters for business:**\n- Protects investment in research and development\n- Encourages innovation by guaranteeing returns\n- Prevents competitors from copying unique products\n- Adds value to the business (IP is an asset)'),
  fb(6, 'A ___ protects inventions for 20 years, while a ___ protects brand names and logos for 10 years (renewable).',
    ['patent', 'trademark'],
    'Patents protect inventions and new processes. Trademarks protect brand identifiers like names, logos, and slogans.',
    ['One protects new inventions, the other protects brand identity.']),
  q(7, 'Copyright protection in South Africa lasts for how long?',
    ['20 years', '50 years', 'Life of the author plus 50 years', '10 years renewable'], 2,
    'In South Africa, copyright protection lasts for the life of the author plus 50 years after their death.'),
  t(8, '### Copyright in Detail\n\nCopyright automatically protects original works when they are created in material form. Unlike patents and trademarks, copyright does NOT need to be registered in South Africa.\n\n**Works protected by copyright:**\n- Literary works (books, articles, computer programs)\n- Musical works and sound recordings\n- Artistic works (paintings, photographs, sculptures)\n- Cinematograph films (movies, documentaries)\n- Broadcasts (TV and radio programmes)\n\n**Rights of the copyright holder:**\n- Reproduce the work\n- Publish the work\n- Perform the work in public\n- Broadcast the work\n- Adapt or translate the work\n\n**Copyright infringement:** Using copyrighted material without permission. This includes photocopying textbooks, downloading pirated music, or using images from the internet without a licence.'),
  q(9, 'Which of the following does NOT require formal registration for protection in South Africa?',
    ['Patent', 'Trademark', 'Copyright', 'Design'], 2,
    'Copyright protection is automatic in South Africa. It applies as soon as an original work is created in material form. Patents, trademarks, and designs must be formally registered.'),
];

// Lesson 2: Trade Unions and Labour Relations Act
blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Trade Unions\n\nA trade union is an organisation formed by workers to protect their interests and improve their working conditions.\n\n**Functions of trade unions:**\n- Negotiate wages and working conditions (collective bargaining)\n- Represent members in disputes with employers\n- Protect members against unfair dismissal\n- Lobby government for favourable labour legislation\n- Provide legal advice and representation\n- Educate members about their rights\n\n**Major SA trade union federations:**\n\n| Federation | Full Name | Membership |\n|------------|-----------|------------|\n| COSATU | Congress of South African Trade Unions | Largest, allied with ANC |\n| FEDUSA | Federation of Unions of South Africa | Independent, diverse sectors |\n| SAFTU | SA Federation of Trade Unions | Formed 2017, led by NUMSA |'),
  t(2, '### The Role of Trade Unions in the Workplace\n\n**Collective bargaining** is the process where trade unions negotiate with employers on behalf of workers.\n\n**Issues negotiated:**\n- Wages and salary increases\n- Working hours and overtime\n- Leave benefits\n- Health and safety conditions\n- Retrenchment procedures\n- Training and development opportunities\n\n**Organisational rights** (when a union represents a majority):\n- Access to the workplace to recruit members\n- Deduction of union fees from salaries (stop-order facility)\n- Election of shop stewards\n- Disclosure of relevant information for negotiations\n\n**Example:** SADTU (SA Democratic Teachers Union) negotiates annually with the Department of Education on teacher salaries, class sizes, and working conditions. When negotiations break down, teachers may engage in protected strike action.'),
  t(3, '### The Labour Relations Act (LRA)\n\nThe LRA (Act 66 of 1995) is the primary legislation governing the relationship between employers, employees, and trade unions.\n\n**Purpose of the LRA:**\n- Promote economic development and social justice\n- Promote fair labour practices\n- Promote orderly collective bargaining\n- Establish the CCMA (Commission for Conciliation, Mediation and Arbitration)\n- Establish the Labour Court and Labour Appeal Court\n\n**Key provisions:**\n\n1. **Freedom of association** - Workers have the right to join trade unions; employers can join employer organisations\n2. **Collective bargaining** - Framework for wage negotiations between unions and employers\n3. **Dispute resolution** - Step-by-step process through CCMA before strike/lockout\n4. **Protection against unfair dismissal** - Employers must follow fair procedures\n5. **Protected strikes and lockouts** - Legal procedures for industrial action'),
  q(4, 'What is the primary function of the CCMA?',
    ['Setting minimum wages', 'Resolving labour disputes through conciliation, mediation, and arbitration', 'Registering trade unions', 'Enforcing health and safety laws'], 1,
    'The CCMA (Commission for Conciliation, Mediation and Arbitration) was established by the LRA to resolve labour disputes outside the courts.'),
  t(5, '### Dispute Resolution Process\n\nWhen a dispute arises between an employer and employees/union:\n\n**Step 1: Internal grievance procedure**\n- Try to resolve the issue within the workplace\n- Follow the company\'s grievance policy\n\n**Step 2: Referral to CCMA or Bargaining Council**\n- If internal process fails, the dispute is referred to the CCMA\n- **Conciliation** - A commissioner helps both parties reach an agreement (30 days)\n- Most disputes are resolved at this stage\n\n**Step 3: If conciliation fails**\n- **Interest disputes** (wages, conditions) - Parties may strike or lock out AFTER a certificate of non-resolution AND 30 days notice\n- **Rights disputes** (unfair dismissal, discrimination) - Referred to arbitration (binding decision) or the Labour Court\n\n**Important:** A strike is ONLY protected (legal) if the proper procedures have been followed. An unprotected strike can lead to dismissal of employees.'),
  fb(6, 'Before employees can legally strike, the dispute must first go through ___ at the CCMA, and if that fails, they must give ___ days notice.',
    ['conciliation', '30'],
    'The LRA requires disputes to go through conciliation at the CCMA. If conciliation fails, employees must give 30 days written notice before striking.',
    ['Think about the dispute resolution steps before a strike becomes protected.']),
  q(7, 'Which of the following makes a strike UNPROTECTED?',
    ['It is about wages', 'The employer refuses to negotiate', 'The required procedures were not followed', 'More than 50% of workers participate'], 2,
    'A strike is unprotected if the legal procedures (conciliation at CCMA, certificate of non-resolution, 30 days notice) were not followed.'),
  t(8, '### Unfair Dismissal and Unfair Labour Practices\n\n**Types of dismissal:**\n\n| Type | Description | Requirement |\n|------|-------------|-------------|\n| **Misconduct** | Employee breaks workplace rules | Fair procedure (verbal warning, written warnings, hearing) |\n| **Incapacity** | Employee cannot perform duties (illness, poor performance) | Counselling, training, alternative position before dismissal |\n| **Operational requirements** | Retrenchment due to economic/structural reasons | Section 189 consultation, fair criteria, severance pay |\n\n**Automatically unfair dismissals** (ALWAYS illegal regardless of procedure):\n- Dismissal for joining a trade union\n- Dismissal for pregnancy\n- Dismissal for refusing to do illegal work\n- Dismissal for exercising a legal right\n- Dismissal based on race, gender, religion\n\n**Remedy for unfair dismissal:**\n- Reinstatement (get the job back)\n- Re-employment (placed in a different position)\n- Compensation (up to 12 months salary, or 24 months for automatically unfair dismissal)'),
  q(9, 'Dismissing an employee because she is pregnant is an example of which type of dismissal?',
    ['Fair dismissal for misconduct', 'Fair dismissal for incapacity', 'Automatically unfair dismissal', 'Dismissal for operational requirements'], 2,
    'Dismissal for pregnancy is automatically unfair under the LRA, regardless of any procedure followed. It is always illegal.'),
  t(10, '### Impact of Socio-Economic Issues on Business: Summary\n\n| Issue | Impact on Business |\n|-------|-------------------|\n| Piracy | Lost revenue, reduced innovation investment |\n| Strikes | Lost production, damaged relationships, increased costs |\n| IP violations | Unfair competition, brand damage |\n| Crime | Increased security costs, insurance premiums |\n| Skills shortage | Difficulty filling positions, higher wage demands |\n| HIV/AIDS | Absenteeism, reduced productivity, training costs |\n\n**How businesses can contribute to solving these issues:**\n- Invest in employee wellness programmes\n- Support education and skills development\n- Practice ethical business conduct\n- Engage with communities through CSI (Corporate Social Investment)\n- Comply with legislation and encourage others to do so'),
];

// =============================================================================
// CHAPTER 4: Business Sectors (Term 1)
// =============================================================================

blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Business Sectors\n\nThe economy is divided into three main sectors based on the type of economic activity performed.\n\n### The Primary Sector\n\nThe primary sector involves the extraction of raw materials directly from nature.\n\n**Industries in the primary sector:**\n- **Mining** - Gold, platinum, coal, diamonds, iron ore, manganese\n- **Agriculture** - Crops (maize, wheat, sugarcane, fruit), livestock farming\n- **Fishing** - Commercial fishing (hake, sardines, tuna)\n- **Forestry** - Timber production, paper pulp\n\n**Importance to South Africa:**\n- Mining contributes approximately 8% of GDP and employs over 450 000 people\n- Agriculture employs about 900 000 people, mostly in rural areas\n- South Africa is the world\'s largest producer of platinum and a major gold producer\n\n**Example:** Anglo American Platinum mines raw platinum in Limpopo and North West provinces, which is then processed and sold globally.'),
  t(2, '### The Secondary Sector\n\nThe secondary sector involves the processing and manufacturing of raw materials into finished or semi-finished products.\n\n**Industries in the secondary sector:**\n- **Manufacturing** - Food processing, textiles, chemicals, electronics, vehicles\n- **Construction** - Buildings, roads, bridges, dams\n- **Electricity and gas** - Power generation and distribution\n\n**Importance to South Africa:**\n- Manufacturing contributes about 13% of GDP\n- Vehicle manufacturing is a major export industry (BMW, Mercedes-Benz, Toyota all have factories in SA)\n- Food processing is the largest sub-sector (Tiger Brands, Pioneer Foods, RCL Foods)\n\n**Example:** SAPPI takes raw wood (primary sector) and processes it into paper and packaging materials (secondary sector) at its mills in Mpumalanga and KwaZulu-Natal.'),
  t(3, '### The Tertiary Sector\n\nThe tertiary sector involves the provision of services rather than physical products.\n\n**Industries in the tertiary sector:**\n- **Retail and wholesale** - Shoprite, Pick n Pay, Makro\n- **Financial services** - Banks, insurance companies, investment firms\n- **Transport and logistics** - Airlines, freight companies, Uber\n- **Telecommunications** - Vodacom, MTN, Telkom\n- **Tourism and hospitality** - Hotels, restaurants, tour operators\n- **Healthcare** - Hospitals, clinics, pharmacies\n- **Education** - Schools, universities, training providers\n- **Professional services** - Legal, accounting, consulting\n\n**Importance to South Africa:**\n- The tertiary sector is the LARGEST sector, contributing over 65% of GDP\n- It employs the most people in the economy\n- Financial services and tourism are major contributors\n\n**Example:** Discovery Limited provides health insurance, life insurance, and banking services to millions of South Africans.'),
  q(4, 'Which sector contributes the LARGEST percentage to South Africa\'s GDP?',
    ['Primary sector', 'Secondary sector', 'Tertiary sector', 'All sectors contribute equally'], 2,
    'The tertiary (services) sector is the largest contributor to South Africa\'s GDP, accounting for over 65% of economic output.'),
  t(5, '### Links Between Sectors\n\nThe three sectors are interdependent. No sector can function in isolation.\n\n**How sectors link together (value chain):**\n\n**Example 1: From farm to table**\n1. **Primary:** A farmer in the Free State grows maize\n2. **Secondary:** Tiger Brands processes the maize into maize meal at their factory\n3. **Tertiary:** Shoprite sells the maize meal to consumers in their stores\n\n**Example 2: From mine to car**\n1. **Primary:** Anglo American mines iron ore in the Northern Cape\n2. **Secondary:** ArcelorMittal smelts iron ore into steel; Toyota assembles cars in Durban using the steel\n3. **Tertiary:** McCarthy Motor Group sells the Toyota cars through their dealerships\n\n**Example 3: From forest to news**\n1. **Primary:** SAPPI harvests timber from forests in Mpumalanga\n2. **Secondary:** The timber is processed into paper\n3. **Tertiary:** Media24 prints newspapers and magazines on the paper'),
  fb(6, 'The primary sector extracts ___, the secondary sector ___ raw materials, and the tertiary sector provides ___.',
    ['raw materials', 'processes', 'services'],
    'Primary = extraction, Secondary = processing/manufacturing, Tertiary = services.',
    ['Think about what each sector DOES with resources.']),
  t(7, '### Sector Trends in South Africa\n\n**Shifts between sectors over time:**\n\nHistorically, the primary sector (mining, agriculture) dominated South Africa\'s economy. Over the past few decades, the economy has shifted towards the tertiary sector.\n\n**Reasons for the shift:**\n- Mining output has declined (deeper, more expensive extraction)\n- Mechanisation in agriculture reduced employment\n- Growth in financial services, IT, and telecommunications\n- Tourism has become a major income earner\n- E-commerce and digital services are growing rapidly\n\n**Challenges:**\n- The shift leaves many low-skilled workers unemployed\n- Primary sector communities (mining towns) face economic decline\n- The skills gap widens as the economy demands more service-sector skills\n\n**South Africa\'s GDP by sector (approximate):**\n- Primary: 10%\n- Secondary: 22%\n- Tertiary: 68%'),
  q(8, 'Which of the following demonstrates the correct link between all three sectors?',
    ['Bank lends money to a consumer', 'Farmer grows wheat, bakery makes bread, supermarket sells bread', 'Telecoms company provides internet to a school', 'A construction company builds a road'], 1,
    'Farmer (primary) grows wheat, bakery (secondary) processes it into bread, supermarket (tertiary) sells it to consumers. This shows the interdependence of all three sectors.'),
  q(9, 'Why has the South African economy shifted from the primary to the tertiary sector?',
    ['Mining has been banned', 'Service industries have grown while mining output declined', 'The government mandated the shift', 'There are no more raw materials'], 1,
    'The shift is due to declining mining output, mechanisation in agriculture, and the growth of financial services, IT, telecommunications, and tourism.'),
  t(10, '### The Informal Sector\n\nThe informal sector operates outside formal regulations and tax systems. It is significant in South Africa.\n\n**Characteristics:**\n- Not registered with SARS or CIPC\n- Often cash-based transactions\n- May not comply with labour laws\n- Includes street vendors, spaza shops, minibus taxis, domestic workers\n\n**Contribution:**\n- Provides income for an estimated 2.5 million South Africans\n- Serves as an entry point for entrepreneurs\n- Provides affordable goods and services to low-income communities\n\n**Challenges:**\n- No worker protection (no UIF, COIDA, minimum wage enforcement)\n- No access to formal business support and finance\n- Difficulty growing into formal businesses\n- Competition from large formal businesses'),
];

// =============================================================================
// CHAPTER 5: Forms of Ownership (Term 1)
// =============================================================================

// Lesson 1: Sole Trader, Partnership, Close Corporation
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Forms of Business Ownership\n\nChoosing the right form of ownership is one of the most important decisions an entrepreneur makes. It affects liability, taxation, management control, and the ability to raise capital.\n\n### Sole Proprietor (Sole Trader)\n\nA sole proprietor is a business owned and managed by ONE person.\n\n**Characteristics:**\n- Simplest and most common form of ownership in SA\n- The owner and the business are legally the SAME entity (no separate legal personality)\n- The owner makes all decisions and keeps all profits\n- **Unlimited liability** - the owner is personally responsible for ALL business debts\n\n**Formation:**\n- No formal registration required (but must register with SARS for tax)\n- May need a business licence depending on the industry\n- Quick and easy to set up'),
  t(2, '### Advantages and Disadvantages of a Sole Proprietor\n\n| Advantages | Disadvantages |\n|------------|---------------|\n| Easy and cheap to start | Unlimited liability (personal assets at risk) |\n| Owner makes all decisions (quick decision-making) | Limited capital (only owner\'s funds) |\n| Owner keeps all profits | Limited skills (owner must do everything) |\n| Minimal legal requirements | Business dies with the owner (no continuity) |\n| Privacy (not required to publish financial statements) | Difficulty raising finance (banks view as risky) |\n| Direct motivation (own effort = own reward) | Heavy workload and long hours |\n\n**Example:** Many South African spaza shops, hairdressers, and plumbers operate as sole proprietors. The owner runs the business independently but carries all the risk personally.'),
  t(3, '### Partnership\n\nA partnership is a business owned by 2 to 20 people who agree to carry on business together.\n\n**Characteristics:**\n- Governed by a **Partnership Agreement** (oral or written, but written is recommended)\n- Partners share profits, losses, and management responsibilities\n- No separate legal personality (partners are personally liable)\n- **Unlimited liability** for all partners (each partner is liable for the FULL debt of the partnership)\n\n**The Partnership Agreement should cover:**\n- Name of the partnership\n- Capital contribution of each partner\n- Profit and loss sharing ratios\n- Duties and responsibilities of each partner\n- Procedures for admitting new partners or dissolving the partnership\n- Decision-making processes\n- What happens if a partner dies or withdraws'),
  q(4, 'What is the MAXIMUM number of partners allowed in a partnership?',
    ['5', '10', '20', '50'], 2,
    'A partnership can have between 2 and 20 partners. If more than 20 people want to go into business together, they must register a company.'),
  t(5, '### Advantages and Disadvantages of a Partnership\n\n| Advantages | Disadvantages |\n|------------|---------------|\n| More capital available than sole trader | Unlimited liability for ALL partners |\n| Shared skills, knowledge, and workload | Disagreements between partners |\n| Easy to form (no formal registration) | Profits must be shared |\n| Better decision-making (combined expertise) | Slow decision-making if partners disagree |\n| Tax advantage (each partner taxed individually) | Actions of one partner bind ALL partners |\n| Privacy (no published financial statements) | Partnership dissolves on death of a partner |\n\n**Example:** Many law firms and accounting practices in South Africa operate as partnerships. Firms like ENSafrica and Webber Wentzel are large legal partnerships where partners share profits and liability.'),
  t(6, '### Close Corporation (CC)\n\nA close corporation is a legal entity with 1 to 10 members. **NOTE: Since 2011 (new Companies Act), no NEW close corporations can be registered.** Existing CCs may continue to operate.\n\n**Characteristics:**\n- Separate legal personality (the CC and its members are different entities)\n- Members have **limited liability** (personal assets are generally protected)\n- Managed by members directly (no board of directors)\n- Must have a founding statement registered with CIPC\n- Simpler compliance requirements than companies\n\n| Advantages | Disadvantages |\n|------------|---------------|\n| Limited liability | Cannot register new CCs since 2011 |\n| Separate legal personality | Maximum 10 members limits growth |\n| Simpler than a company | Difficult to transfer membership interests |\n| Continuity (does not die with members) | Less credibility than a Pty Ltd company |\n| Members manage directly | Still requires annual returns to CIPC |'),
  fb(7, 'A sole proprietor has ___ liability, meaning personal assets are at risk. A close corporation provides ___ liability to its members.',
    ['unlimited', 'limited'],
    'Sole proprietors face unlimited liability (no separation between owner and business). CCs provide limited liability (members\' personal assets are generally protected).',
    ['Think about whether the owner is personally responsible for business debts.']),
  q(8, 'Why can no new close corporations be registered in South Africa?',
    ['They were found to be unprofitable', 'The Companies Act of 2008 prohibited new registrations from 2011', 'Close corporations are illegal', 'They must first become partnerships'], 1,
    'The Companies Act 71 of 2008 (effective from 2011) stopped the registration of new close corporations. Existing CCs can continue operating or convert to private companies.'),
];

// Lesson 2: Companies, Co-operatives, Franchises
blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Private Company (Pty) Ltd\n\nA private company is registered under the Companies Act 71 of 2008 and designated as "(Pty) Ltd".\n\n**Characteristics:**\n- Separate legal personality\n- **Limited liability** for shareholders\n- Minimum 1 director, no maximum for shareholders\n- Cannot offer shares to the public\n- Shares can only be transferred with consent of other shareholders\n- Must have a **Memorandum of Incorporation (MOI)** - the founding document\n- Must be registered with CIPC (Companies and Intellectual Property Commission)\n\n**The MOI must include:**\n- Company name and registration number\n- Type of company\n- Rights, duties, and responsibilities of shareholders and directors\n- Rules for issuing and transferring shares\n- Procedures for meetings and decision-making'),
  t(2, '### Public Company (Ltd)\n\nA public company is designated as "Ltd" and can offer its shares to the general public.\n\n**Characteristics:**\n- Separate legal personality and limited liability\n- Minimum 3 directors\n- Shares traded on the JSE (Johannesburg Stock Exchange)\n- Must publish annual financial statements (audited)\n- Must comply with JSE listing requirements and King IV governance\n- Subject to stricter regulation than private companies\n\n**Advantages over private companies:**\n- Access to large amounts of capital by selling shares to the public\n- Greater credibility and prestige\n- Easier to attract skilled directors and managers\n\n**Disadvantages:**\n- Complex and expensive to set up and maintain\n- Shareholders may lose control as ownership is spread widely\n- Must disclose financial information publicly\n- Subject to strict regulation and compliance costs\n\n**Examples of JSE-listed public companies:** Naspers, Shoprite, Discovery, Sasol, MTN, Standard Bank'),
  q(3, 'What is the main difference between a private company (Pty) Ltd and a public company (Ltd)?',
    ['Private companies have unlimited liability', 'Public companies can sell shares to the general public', 'Private companies must have 3 directors', 'Public companies have fewer regulations'], 1,
    'The main difference is that a public company can offer its shares to the general public (typically through the JSE), while a private company cannot.'),
  t(4, '### The Companies Act 71 of 2008\n\nThe Companies Act is the primary legislation governing companies in South Africa.\n\n**Key provisions relevant to Grade 11:**\n\n- **Registration:** All companies must register with CIPC and file an MOI\n- **Directors:** Must act in good faith and in the best interest of the company\n- **Company secretary:** Public companies must appoint a company secretary\n- **Financial statements:** Public companies must have audited financial statements\n- **Business rescue:** Companies in financial distress can apply for business rescue (similar to bankruptcy protection)\n- **Personal liability:** Directors can be held personally liable for reckless or fraudulent trading\n\n**CIPC (Companies and Intellectual Property Commission):**\n- Registers companies and close corporations\n- Registers trademarks, patents, and designs\n- Maintains a public register of company information\n- Enforces compliance with the Companies Act'),
  t(5, '## Co-operative\n\nA co-operative is a business owned and managed by a group of people with common interests who share the benefits equally.\n\n**Types of co-operatives:**\n- **Consumer co-operative** - members buy goods in bulk at lower prices\n- **Producer co-operative** - members (usually farmers) combine resources to process and market products\n- **Worker co-operative** - owned and managed by the workers themselves\n- **Financial co-operative** - members pool savings to provide loans (stokvels, credit unions)\n\n**Characteristics:**\n- Democratic management (one member, one vote)\n- Members share profits equally (or based on participation)\n- Minimum 5 members\n- Must register with CIPC under the Co-operatives Act\n\n**Example:** Many farming co-operatives in South Africa help small-scale farmers by providing shared equipment, bulk purchasing of seeds and fertiliser, and collective marketing of produce.'),
  q(6, 'In a co-operative, how are decisions typically made?',
    ['By the largest shareholder', 'By the board of directors only', 'Democratically - one member, one vote', 'By the government'], 2,
    'Co-operatives are governed by the principle of democratic member control, where each member has one vote regardless of their contribution.'),
  t(7, '## Franchise\n\nA franchise is a business model where a franchisor grants the right to use their brand, systems, and products to a franchisee in exchange for fees.\n\n**Key terms:**\n- **Franchisor** - The owner of the brand/system who grants the franchise\n- **Franchisee** - The person who buys the right to operate under the franchise\n- **Franchise fee** - Initial payment to join the franchise\n- **Royalty fee** - Ongoing percentage of sales paid to the franchisor\n\n| Advantages for Franchisee | Disadvantages for Franchisee |\n|--------------------------|-----------------------------|\n| Established brand recognition | High initial franchise fee |\n| Proven business model | Ongoing royalty payments |\n| Training and support provided | Limited freedom to make decisions |\n| Group purchasing power | Must follow franchisor rules strictly |\n| Lower risk of failure | Reputation depends on ALL franchisees |\n\n**Popular SA franchises:** Steers, Debonairs Pizza, Spur, Pick n Pay Express, Kumon'),
  fb(8, 'In a franchise, the ___ owns the brand and system, while the ___ operates a branch using the established brand.',
    ['franchisor', 'franchisee'],
    'The franchisor is the brand owner; the franchisee is the operator who pays for the right to use the brand.',
    ['Think about who creates the brand and who buys the right to use it.']),
  q(9, 'Which form of ownership provides limited liability AND allows shares to be sold to the public?',
    ['Sole proprietor', 'Partnership', 'Private company (Pty) Ltd', 'Public company (Ltd)'], 3,
    'Only a public company (Ltd) can offer shares to the general public, typically through the JSE. A private company also has limited liability but cannot sell shares publicly.'),
  t(10, '### Comparison of Forms of Ownership\n\n| Feature | Sole Trader | Partnership | Pty Ltd | Ltd | Co-operative | Franchise |\n|---------|-------------|-------------|---------|-----|-------------|----------|\n| Legal personality | No | No | Yes | Yes | Yes | Varies |\n| Liability | Unlimited | Unlimited | Limited | Limited | Limited | Limited |\n| Max members | 1 | 20 | No max | No max | No max | N/A |\n| Decision speed | Fast | Medium | Medium | Slow | Slow | Limited |\n| Capital access | Low | Medium | Medium | High | Medium | Medium |\n| Continuity | None | None | Yes | Yes | Yes | Contractual |\n| Formation cost | Low | Low | Medium | High | Medium | High |\n| Privacy | High | High | Medium | Low | Medium | Low |\n\nWhen choosing a form of ownership, consider: how much capital is needed, the level of risk acceptable, the desired level of control, the number of owners, and the long-term growth plans.'),
];

// =============================================================================
// CHAPTER 6: Creative Thinking and Problem Solving (Term 2)
// =============================================================================

blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Creative Thinking in Business\n\nCreative thinking is the ability to generate new and original ideas, approaches, or solutions. In business, creative thinking drives innovation, competitive advantage, and problem solving.\n\n### Creative vs Routine Thinking\n\n| Creative Thinking | Routine Thinking |\n|-------------------|------------------|\n| Generates new, original ideas | Follows established patterns and procedures |\n| Explores multiple possibilities | Uses tried-and-tested methods |\n| Challenges the status quo | Maintains the status quo |\n| Involves risk-taking | Minimises risk |\n| Divergent (many possible answers) | Convergent (one correct answer) |\n| Used for innovation and new strategies | Used for daily operations and repetitive tasks |\n\n**Both types are important:** A business needs creative thinking for strategy and innovation, but routine thinking for efficient daily operations.'),
  t(2, '### Barriers to Creative Thinking\n\n**Common barriers:**\n\n1. **Fear of failure** - Employees afraid to suggest new ideas because they might be rejected\n2. **Rigid organisational culture** - "We have always done it this way" mentality\n3. **Groupthink** - Desire for harmony leads everyone to agree without critical evaluation\n4. **Functional fixedness** - Only seeing objects/processes in their traditional use\n5. **Time pressure** - No time allocated for thinking creatively\n6. **Lack of diversity** - Homogeneous teams produce similar ideas\n\n**How businesses can encourage creative thinking:**\n- Create a safe environment for sharing ideas (no punishment for mistakes)\n- Allocate dedicated time for brainstorming\n- Reward innovation and creativity\n- Bring together diverse teams\n- Provide training in creative thinking techniques\n- Allow flexible working arrangements'),
  t(3, '### The Delphi Technique\n\nThe Delphi technique is a structured communication method for gathering expert opinions to make decisions or forecasts.\n\n**Steps:**\n\n1. **Identify the problem** or question that needs expert input\n2. **Select a panel of experts** (they do not meet face-to-face)\n3. **Round 1:** Each expert independently provides their opinion/answer via questionnaire\n4. **Compile and summarise** all responses anonymously\n5. **Round 2:** Share the summary with all experts; each expert revises their answer based on the group feedback\n6. **Repeat** rounds until a consensus or stable range of opinions is reached\n7. **Final report** summarises the group consensus\n\n**Advantages:**\n- Avoids groupthink and dominance by one personality\n- Experts can be geographically dispersed\n- Anonymity encourages honest opinions\n- Structured process reduces bias\n\n**Disadvantages:**\n- Time-consuming (multiple rounds)\n- Depends on quality of experts selected\n- May not reach consensus'),
  q(4, 'What is a key advantage of the Delphi technique over a face-to-face brainstorming session?',
    ['It is faster', 'It avoids groupthink because experts respond anonymously', 'It requires fewer people', 'It always reaches consensus'], 1,
    'The Delphi technique uses anonymous responses, which prevents dominant personalities from influencing others and avoids groupthink.'),
  t(5, '### Force-Field Analysis\n\nForce-field analysis (developed by Kurt Lewin) is a decision-making tool that identifies the forces FOR and AGAINST a proposed change.\n\n**Steps:**\n\n1. **Define the proposed change** (e.g., "Should we open a second branch?")\n2. **Identify driving forces** (forces pushing FOR the change)\n3. **Identify restraining forces** (forces pushing AGAINST the change)\n4. **Rate the strength** of each force (e.g., 1 = weak, 5 = strong)\n5. **Analyse** whether driving forces outweigh restraining forces\n6. **Develop strategies** to strengthen driving forces and weaken restraining forces\n\n**Example: Opening a new store in Soweto**\n\n| Driving Forces (FOR) | Score | Restraining Forces (AGAINST) | Score |\n|---------------------|-------|------------------------------|-------|\n| Large untapped market | 5 | High crime in the area | 3 |\n| Growing middle class | 4 | Load shedding disruptions | 4 |\n| Less competition locally | 3 | Capital required for setup | 4 |\n| Brand recognition | 4 | Finding skilled local staff | 2 |\n| **Total** | **16** | **Total** | **13** |\n\nDriving forces (16) outweigh restraining forces (13), suggesting the change should proceed.'),
  fb(6, 'Force-field analysis identifies ___ forces (pushing for change) and ___ forces (pushing against change).',
    ['driving', 'restraining'],
    'Kurt Lewin\'s force-field analysis examines driving forces (for) and restraining forces (against) a proposed change.',
    ['Think about what pushes for and what holds back a change.']),
  t(7, '### Problem-Solving Steps\n\nBusinesses face problems daily. A structured approach to problem solving leads to better outcomes.\n\n**Steps in the problem-solving process:**\n\n1. **Identify and define the problem** - What exactly is wrong? Gather facts and data.\n2. **Analyse the problem** - What are the causes? Use tools like root cause analysis.\n3. **Generate possible solutions** - Brainstorm multiple options. Do not judge ideas yet.\n4. **Evaluate alternatives** - Assess each solution against criteria (cost, feasibility, time, impact).\n5. **Select the best solution** - Choose the option that best addresses the problem within constraints.\n6. **Implement the solution** - Create an action plan with responsibilities, timelines, and resources.\n7. **Evaluate the outcome** - Did the solution work? Are there any unintended consequences? Adjust if needed.\n\n**Important:** Steps 1-2 are about understanding the problem. Steps 3-5 are about finding solutions. Steps 6-7 are about taking action and reviewing.'),
  q(8, 'What should be done IMMEDIATELY after brainstorming possible solutions?',
    ['Implement the most popular idea', 'Evaluate each alternative against criteria', 'Go back and redefine the problem', 'Ask the manager to choose'], 1,
    'After generating possible solutions (brainstorming), the next step is to evaluate each alternative against criteria such as cost, feasibility, time, and impact.'),
  t(9, '### Creative Thinking Techniques\n\n**Brainstorming:**\n- Generate as many ideas as possible in a group setting\n- No criticism or judgment during idea generation\n- Build on others\' ideas\n- Quantity over quality initially\n\n**Mind mapping:**\n- Visual diagram connecting related ideas around a central concept\n- Helps see relationships and generate new connections\n\n**SCAMPER technique:**\n- **S**ubstitute - What can be substituted?\n- **C**ombine - What can be combined?\n- **A**dapt - What can be adapted from elsewhere?\n- **M**odify - What can be modified, magnified, or minimised?\n- **P**ut to other use - Can it be used differently?\n- **E**liminate - What can be removed?\n- **R**everse/Rearrange - What can be reversed or rearranged?\n\n**Example:** Uber used SCAMPER to disrupt transport: they SUBSTITUTED traditional taxis with private cars, COMBINED GPS technology with a payment system, and ELIMINATED the need to hail a taxi on the street.'),
  q(10, 'Which creative thinking technique uses the letters S, C, A, M, P, E, R?',
    ['Delphi technique', 'Force-field analysis', 'SCAMPER', 'SWOT analysis'], 2,
    'SCAMPER stands for Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, and Reverse/Rearrange.'),
];

// =============================================================================
// CHAPTER 7: Marketing Function (Term 2)
// =============================================================================

// Lesson 1: Marketing Activities and the Marketing Mix
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## The Marketing Function\n\nMarketing is the business function responsible for identifying, anticipating, and satisfying customer needs profitably.\n\n### Marketing Activities\n\n1. **Market research** - Gathering information about consumer needs, preferences, and behaviour\n2. **Product development** - Creating products that meet identified needs\n3. **Pricing** - Setting prices that cover costs and attract customers\n4. **Distribution** - Getting products to where customers can buy them\n5. **Promotion** - Communicating with customers about products\n6. **Branding** - Creating a recognisable identity for products\n7. **Customer relationship management** - Building long-term relationships with customers\n\n**The marketing concept:** The business starts by identifying customer needs, then develops products to meet those needs, rather than making products first and trying to sell them.'),
  t(2, '### The Marketing Mix (4 Ps)\n\nThe marketing mix is the combination of four controllable elements that a business uses to satisfy customer needs.\n\n**1. Product** - What is being sold\n**2. Price** - How much customers pay\n**3. Place (Distribution)** - Where and how customers can access the product\n**4. Promotion (Communication)** - How customers learn about the product\n\nAll four Ps must work together. Changing one P affects the others.\n\n**Example: Woolworths Food**\n- **Product:** Premium quality, often organic food products\n- **Price:** Higher than competitors (premium pricing)\n- **Place:** Woolworths stores, Woolworths online, Woolies Dash\n- **Promotion:** In-store displays, loyalty programme (WRewards), social media, TV advertising'),
  t(3, '### Product Policy\n\nProduct policy covers all decisions about what the business sells.\n\n**Product decisions include:**\n- Product range (how many different products)\n- Product quality and features\n- Branding and packaging\n- Product lifecycle management\n- New product development\n\n**The Product Life Cycle:**\n1. **Introduction** - New product launched. Sales are low, costs are high, profits may be negative.\n2. **Growth** - Sales increase rapidly. Competitors may enter. Profits grow.\n3. **Maturity** - Sales peak and level off. Competition is intense. Profits start to decline.\n4. **Decline** - Sales and profits fall. Business must decide: revive the product, maintain it, or discontinue it.\n\n**Example:** Smartphones are in the maturity stage in SA. Sales growth has slowed, competition is intense (Samsung, Apple, Huawei, Xiaomi), and prices have stabilised.'),
  q(4, 'During which stage of the product life cycle are sales growing rapidly and competitors start entering the market?',
    ['Introduction', 'Growth', 'Maturity', 'Decline'], 1,
    'The growth stage is characterised by rapidly increasing sales, growing profits, and the entry of competitors who see the market opportunity.'),
  t(5, '### Pricing Policy\n\nPricing policy determines how the business sets prices for its products.\n\n**Pricing strategies:**\n\n| Strategy | Description | Example |\n|----------|-------------|----------|\n| **Cost-plus pricing** | Add a mark-up to the cost of production | A bakery adds 50% to ingredient costs |\n| **Competitive pricing** | Set prices based on competitors | Vodacom matches MTN data prices |\n| **Penetration pricing** | Set low initial price to gain market share | TymeBank offering free banking |\n| **Skimming pricing** | Set high initial price for new/unique products | Apple iPhone launch price |\n| **Psychological pricing** | Prices that seem lower (R99.99 instead of R100) | Most retailers |\n| **Bundle pricing** | Package products together at a discount | DStv packages |\n| **Loss-leader pricing** | Sell one product below cost to attract customers | Supermarket bread and milk specials |'),
  t(6, '### Distribution (Place) Policy\n\nDistribution policy covers how products get from the producer to the consumer.\n\n**Distribution channels:**\n\n1. **Direct distribution:** Producer sells directly to consumer\n   - Factory shops, company websites, door-to-door sales\n   - Example: Woolworths sells directly through their own stores and website\n\n2. **Indirect distribution:** Uses intermediaries\n   - Producer > Wholesaler > Retailer > Consumer\n   - Producer > Agent > Retailer > Consumer\n   - Example: Coca-Cola uses distributors and wholesalers to get products to thousands of retailers\n\n**Factors affecting distribution choice:**\n- Nature of the product (perishable goods need short channels)\n- Target market location and size\n- Cost of different distribution methods\n- Level of control desired over the selling process\n- Competitor distribution strategies'),
  fb(7, 'The four Ps of the marketing mix are Product, ___, Place, and ___.',
    ['Price', 'Promotion'],
    'The marketing mix consists of Product, Price, Place (distribution), and Promotion (communication).',
    ['Think about the four controllable elements of marketing.']),
  q(8, 'TymeBank offers free banking to attract customers. Which pricing strategy is this?',
    ['Skimming pricing', 'Cost-plus pricing', 'Penetration pricing', 'Psychological pricing'], 2,
    'Penetration pricing involves setting a low initial price (or even free) to quickly gain market share. Once customers are locked in, prices may gradually increase.'),
  t(9, '### Communication (Promotion) Policy\n\nPromotion involves communicating with customers to inform, persuade, and remind them about products.\n\n**Elements of the promotional mix:**\n\n| Element | Description | Example |\n|---------|-------------|----------|\n| **Advertising** | Paid, non-personal communication through media | TV ads (DStv), billboards, Google ads |\n| **Sales promotion** | Short-term incentives to boost sales | Buy-one-get-one-free, competitions, coupons |\n| **Personal selling** | Face-to-face interaction with customers | Car salespeople, insurance brokers |\n| **Public relations (PR)** | Managing the business image and reputation | Press releases, sponsorships, events |\n| **Direct marketing** | Communicating directly with targeted individuals | Email newsletters, SMS marketing |\n| **Digital marketing** | Using online platforms | Social media ads, influencer marketing, SEO |\n\n**Example:** Nando\'s is famous for its clever, topical social media campaigns (digital marketing and PR) that generate free publicity through shares and media coverage.'),
  q(10, 'Which element of the promotional mix involves face-to-face interaction with customers?',
    ['Advertising', 'Sales promotion', 'Personal selling', 'Public relations'], 2,
    'Personal selling involves direct, face-to-face interaction between a salesperson and a potential customer, allowing for personalised communication and relationship building.'),
];

// =============================================================================
// CHAPTER 8: Production Function (Term 2)
// =============================================================================

blockNum = 0;
const ch8_lesson1 = [
  t(1, '## The Production Function\n\nThe production function is responsible for converting inputs (raw materials, labour, capital) into outputs (finished goods or services) that satisfy customer needs.\n\n### Production Planning\n\nProduction planning ensures that the right products are produced in the right quantities, at the right time, at the right cost.\n\n**Key elements of production planning:**\n\n1. **Demand forecasting** - Predicting how many products customers will want\n2. **Capacity planning** - Ensuring the business has enough machinery, workers, and space\n3. **Scheduling** - Creating a timetable for production activities\n4. **Materials planning** - Ensuring raw materials are available when needed\n5. **Quality planning** - Setting quality standards and inspection procedures\n6. **Cost planning** - Budgeting for production expenses'),
  t(2, '### Types of Production\n\n| Type | Description | Example |\n|------|-------------|----------|\n| **Job production** | Custom-made, one product at a time to specific order | Tailor-made suit, wedding cake |\n| **Batch production** | A group of identical products made together, then the next batch | Bakery producing 100 loaves, then 50 pies |\n| **Mass production** | Continuous production of large quantities of identical products | SAB bottling beer, Toyota assembling cars |\n| **Continuous production** | 24/7 non-stop production (too costly to stop and restart) | Sasol oil refinery, Eskom power generation |\n\n**Factors affecting choice of production method:**\n- Nature and complexity of the product\n- Size of the market (demand)\n- Available capital and technology\n- Need for customisation\n- Cost considerations'),
  t(3, '### Quality Management\n\nQuality management ensures products meet or exceed customer expectations consistently.\n\n**Key quality concepts:**\n\n- **Quality control (QC)** - Inspecting finished products to find and remove defects AFTER production\n- **Quality assurance (QA)** - Preventing defects by managing the production PROCESS\n- **Total Quality Management (TQM)** - Company-wide commitment to quality involving ALL employees at EVERY level\n\n**TQM principles:**\n- Customer focus (quality is defined by the customer)\n- Continuous improvement (kaizen)\n- Employee involvement (quality is everyone\'s responsibility)\n- Process approach (focus on improving processes, not just outputs)\n- Data-driven decision making\n\n**Example:** Toyota uses TQM extensively. Any worker on the assembly line can stop the production line if they spot a quality problem. This prevents defective cars from reaching customers.'),
  q(4, 'What is the key difference between quality control and quality assurance?',
    ['QC is cheaper than QA', 'QC inspects after production; QA prevents defects during production', 'QA is only for large businesses', 'QC involves all employees; QA involves only managers'], 1,
    'Quality control (QC) focuses on inspecting finished products to detect defects. Quality assurance (QA) focuses on preventing defects by managing the production process itself.'),
  t(5, '### SABS (South African Bureau of Standards)\n\nThe SABS is the national institution responsible for developing and maintaining standards for products and services in South Africa.\n\n**Role of SABS:**\n- Develops South African National Standards (SANS)\n- Tests and certifies products against standards\n- Issues the SABS mark of quality\n- Protects consumers from substandard and dangerous products\n- Promotes quality and competitiveness in SA industry\n\n**The SABS Mark:**\n- Products carrying the SABS mark have been tested and meet SA standards\n- It is VOLUNTARY for most products, but COMPULSORY for certain products (e.g., electrical appliances, helmets, gas appliances)\n- Consumers can trust that SABS-certified products are safe and of acceptable quality\n\n**Example:** All electrical plugs and sockets sold in South Africa must carry the SABS mark. This ensures they meet safety standards and will not cause fires or electrocution.'),
  fb(6, 'The ___ is responsible for setting product standards in South Africa and issues a quality mark that ensures products meet safety requirements.',
    ['SABS'],
    'The South African Bureau of Standards (SABS) develops standards, tests products, and issues the SABS mark of quality.',
    ['Think about the organisation that certifies product quality in South Africa.']),
  t(7, '### Occupational Health and Safety (OHS) Act\n\nThe OHS Act (Act 85 of 1993) ensures a safe and healthy working environment for all employees.\n\n**Employer responsibilities:**\n- Provide a safe working environment\n- Identify and manage workplace hazards\n- Provide necessary safety equipment (PPE)\n- Train employees on safety procedures\n- Appoint safety representatives and a safety committee\n- Report workplace injuries and diseases to the Department of Labour\n- Keep records of all incidents\n\n**Employee responsibilities:**\n- Follow all safety rules and procedures\n- Use safety equipment provided\n- Report any hazards, unsafe conditions, or incidents\n- Not endanger themselves or others\n- Co-operate with safety representatives'),
  t(8, '### OHS Act: Practical Application\n\n**Workplace safety measures:**\n\n| Industry | Safety Measures |\n|----------|----------------|\n| Mining | Hard hats, safety boots, ventilation, rock fall netting, regular safety drills |\n| Manufacturing | Machine guards, safety goggles, ear protection, fire extinguishers |\n| Construction | Hard hats, harnesses for working at heights, safety nets, reflective clothing |\n| Office | Ergonomic furniture, fire escape routes, first aid kits, proper lighting |\n| Restaurant | Non-slip floors, fire suppression systems, food handling training |\n\n**Safety representatives:**\n- Must be appointed if workplace has 20+ employees\n- Elected by employees (not appointed by employer)\n- Conduct regular safety inspections\n- Investigate incidents and complaints\n- Report findings to the safety committee\n\n**Penalties for non-compliance:**\n- Fines for the employer\n- Criminal charges in serious cases\n- Closure of the business by the Department of Labour'),
  q(9, 'According to the OHS Act, who must appoint safety representatives?',
    ['All businesses', 'Businesses with 10 or more employees', 'Businesses with 20 or more employees', 'Only mining companies'], 2,
    'The OHS Act requires businesses with 20 or more employees to appoint safety representatives who are elected by the employees.'),
  q(10, 'Which quality approach involves a company-wide commitment where ALL employees are responsible for quality?',
    ['Quality control', 'Quality assurance', 'Total Quality Management', 'SABS certification'], 2,
    'Total Quality Management (TQM) is a company-wide approach where every employee at every level is responsible for maintaining and improving quality.'),
];

// =============================================================================
// CHAPTER 9: Professionalism and Ethics (Term 2)
// =============================================================================

blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Professionalism and Ethics\n\n### What is Professionalism?\n\nProfessionalism refers to the conduct, behaviour, and attitude expected of someone in a professional setting. It goes beyond technical skills to include how a person presents themselves and interacts with others.\n\n**Characteristics of a professional person:**\n- Punctual and reliable\n- Honest and trustworthy\n- Respectful of others\n- Well-groomed and appropriately dressed\n- Competent and knowledgeable\n- Takes responsibility for their actions\n- Communicates effectively\n- Maintains confidentiality\n- Committed to continuous learning'),
  t(2, '### Theories of Professionalism\n\n**1. Trait theory:**\n- Professionalism is defined by specific characteristics (traits) such as integrity, competence, confidentiality, and service orientation\n- A professional possesses these traits consistently\n\n**2. Functionalist theory:**\n- Professionals serve a specific function in society\n- They possess specialised knowledge and skills that benefit the public\n- Society grants professionals certain privileges (self-regulation) in exchange for ethical service\n- Example: Doctors, lawyers, and accountants serve essential societal functions\n\n**3. Power theory:**\n- Professions maintain their status through controlling access (entry requirements, examinations)\n- Professional bodies act as gatekeepers\n- Example: To practise as a CA(SA), you must complete a degree, articles, and pass the ITC and APC examinations through SAICA'),
  t(3, '### Principles of Professionalism\n\n**Key principles that guide professional behaviour:**\n\n1. **Integrity** - Being honest and transparent in all dealings\n2. **Accountability** - Taking responsibility for your actions and decisions\n3. **Confidentiality** - Protecting sensitive information of clients and the organisation\n4. **Competence** - Maintaining and updating your knowledge and skills\n5. **Objectivity** - Making decisions based on facts, not personal bias\n6. **Respect** - Treating all people with dignity regardless of their position\n7. **Service orientation** - Putting the needs of clients and the public first\n\n**Professional bodies in South Africa:**\n\n| Body | Profession |\n|------|------------|\n| SAICA | Chartered Accountants |\n| LSSA | Lawyers |\n| HPCSA | Doctors and health professionals |\n| ECSA | Engineers |\n| SAICA | Auditors |'),
  q(4, 'Which principle of professionalism requires protecting sensitive information about clients?',
    ['Integrity', 'Accountability', 'Confidentiality', 'Competence'], 2,
    'Confidentiality is the professional principle that requires protecting sensitive information about clients and the organisation from unauthorised disclosure.'),
  t(5, '### Ethical vs Unethical Behaviour\n\n**Ethics** are moral principles that guide right and wrong behaviour in business.\n\n| Ethical Behaviour | Unethical Behaviour |\n|-------------------|--------------------|\n| Honest advertising | Misleading or false advertising |\n| Fair wages and working conditions | Exploiting workers with unfair pay |\n| Transparent financial reporting | Fraudulent financial statements |\n| Respecting customer privacy (POPIA) | Selling customer data without consent |\n| Paying suppliers on time | Deliberately delaying payments |\n| Environmental responsibility | Illegal dumping of waste |\n| Fair competition | Price fixing with competitors |\n| Declaring conflicts of interest | Nepotism and favouritism |'),
  t(6, '### Ethical Dilemmas in Business\n\nAn ethical dilemma occurs when a person must choose between two options, both of which have ethical implications.\n\n**Example 1:** A pharmaceutical company discovers that one of its drugs has minor side effects. Recalling the drug would cost millions and may bankrupt the company, leaving employees jobless. But keeping it on the market risks consumer health.\n\n**Example 2:** A manager discovers that the company\'s best-performing salesperson has been exaggerating product benefits to customers. Firing the salesperson would reduce sales significantly.\n\n**Example 3:** A South African company can reduce costs by 40% by moving production to a country with no minimum wage laws. This would result in retrenching 500 local workers.\n\n**How to resolve ethical dilemmas:**\n1. Identify the ethical issue\n2. Gather all relevant facts\n3. Consider the impact on ALL stakeholders\n4. Evaluate options against ethical principles\n5. Make a decision and take responsibility for it'),
  fb(7, 'Ethics are ___ principles that guide right and wrong behaviour, while professionalism refers to the ___ and attitude expected in a professional setting.',
    ['moral', 'conduct'],
    'Ethics = moral principles guiding behaviour. Professionalism = conduct, behaviour, and attitude in a professional context.',
    ['Think about what guides decisions vs how a person acts.']),
  q(8, 'A company deliberately reports inflated profits in its financial statements. This is an example of:',
    ['Poor management', 'Unethical behaviour', 'Creative accounting', 'Market competition'], 1,
    'Reporting inflated or false profits is fraudulent and unethical. It deceives shareholders, creditors, and regulators, and is also illegal.'),
  t(9, '### Benefits of Ethical Business Practices\n\n| Benefit | Explanation |\n|---------|-------------|\n| Enhanced reputation | Ethical businesses attract more customers and investors |\n| Customer loyalty | Consumers prefer to support businesses they trust |\n| Employee retention | Workers prefer ethical employers; lower turnover |\n| Fewer legal problems | Ethical practices reduce the risk of lawsuits and fines |\n| Sustainable growth | Long-term success built on trust and integrity |\n| Investor confidence | Ethical companies attract investment more easily |\n| Better stakeholder relationships | Suppliers, communities, and government prefer ethical partners |\n\n**Example:** Discovery\'s Vitality programme rewards healthy behaviour, which is both ethical (promoting wellness) and profitable (healthier clients cost less). This ethical approach has become their biggest competitive advantage.'),
  q(10, 'Which of the following is NOT a benefit of ethical business practices?',
    ['Enhanced reputation', 'Higher short-term profits through cutting corners', 'Better employee retention', 'Increased investor confidence'], 1,
    'Cutting corners for short-term profit is NOT a benefit of ethical practices. In fact, it is the opposite of ethical behaviour and leads to long-term problems.'),
];

// =============================================================================
// CHAPTER 10: Entrepreneurship (Term 3)
// =============================================================================

// Lesson 1: Entrepreneurial Qualities and Business Plans
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Entrepreneurship\n\n### What is Entrepreneurship?\n\nEntrepreneurship is the process of identifying a business opportunity, gathering resources, and taking the risk to start and manage a business venture.\n\n**An entrepreneur is someone who:**\n- Identifies opportunities that others miss\n- Takes calculated risks\n- Innovates and creates value\n- Organises resources (capital, labour, materials)\n- Bears the financial risk of failure\n\n**Entrepreneurship vs Employment:**\n\n| Entrepreneurship | Employment |\n|-----------------|------------|\n| Creates own income | Receives a salary |\n| Bears all financial risk | Limited financial risk |\n| Makes own decisions | Follows instructions |\n| Uncertain income | Regular, predictable income |\n| Unlimited earning potential | Earning limited by salary scale |\n| Must be self-motivated | Motivated by manager/structure |'),
  t(2, '### Entrepreneurial Qualities\n\nSuccessful entrepreneurs share common qualities and characteristics:\n\n| Quality | Description |\n|---------|-------------|\n| **Creativity and innovation** | Ability to think of new ideas and solutions |\n| **Risk-taking** | Willingness to take calculated risks (not reckless risks) |\n| **Self-confidence** | Belief in own abilities and decisions |\n| **Perseverance** | Continuing despite setbacks and failures |\n| **Leadership** | Ability to inspire, motivate, and guide others |\n| **Decision-making** | Making timely decisions with available information |\n| **Opportunity recognition** | Seeing gaps in the market that others miss |\n| **Adaptability** | Adjusting plans when circumstances change |\n| **Financial management** | Managing money wisely and understanding finances |\n| **Networking** | Building relationships that create business opportunities |\n\n**Example:** Elon Musk (born in Pretoria, SA) demonstrated risk-taking by investing his PayPal earnings into SpaceX and Tesla, perseverance when both companies nearly went bankrupt, and innovation by disrupting multiple industries.'),
  t(3, '### The Business Plan\n\nA business plan is a written document that describes the business, its objectives, strategies, and financial projections.\n\n**Why a business plan is important:**\n- Guides the entrepreneur in starting and growing the business\n- Helps secure funding from banks, investors, or government\n- Identifies potential problems before they occur\n- Sets clear targets and milestones\n- Serves as a communication tool for stakeholders\n\n**Sections of a business plan:**\n\n1. **Executive summary** - Brief overview of the entire plan\n2. **Business description** - What the business does, mission, vision, values\n3. **Market analysis** - Target market, customer profile, competitors, SWOT\n4. **Marketing plan** - Product, pricing, distribution, promotion strategies\n5. **Operations plan** - Location, production process, suppliers, technology\n6. **Management team** - Key people, qualifications, roles\n7. **Financial plan** - Start-up costs, projected income, cash flow, break-even\n8. **Funding request** - How much capital is needed and how it will be used'),
  q(4, 'Which section of a business plan provides a brief overview of the entire plan?',
    ['Business description', 'Executive summary', 'Market analysis', 'Financial plan'], 1,
    'The executive summary is the first section of a business plan and provides a concise overview of the entire plan. It is often the most important section as it determines whether a reader will continue.'),
  t(5, '### Action Plans and Implementation\n\nAn action plan breaks down the business plan into specific tasks with timelines, responsibilities, and resources.\n\n**Components of an action plan:**\n- **Tasks** - What needs to be done (specific activities)\n- **Responsible person** - Who will do each task\n- **Timeline** - Start date, end date, and milestones\n- **Resources needed** - Money, materials, people, equipment\n- **Success criteria** - How you will know the task is complete\n\n**Example action plan for opening a coffee shop:**\n\n| Task | Person | Timeline | Resources |\n|------|--------|----------|-----------|\n| Register business with CIPC | Owner | Week 1-2 | R175 registration fee |\n| Secure lease for premises | Owner | Week 1-4 | Deposit + 2 months rent |\n| Purchase equipment | Manager | Week 3-6 | R150 000 budget |\n| Hire and train staff | Owner | Week 5-8 | 4 staff members |\n| Marketing and signage | Marketing | Week 6-8 | R20 000 budget |\n| Stock initial inventory | Manager | Week 7-8 | R30 000 budget |\n| Grand opening | All | Week 9 | R10 000 budget |'),
  t(6, '### Gantt Charts\n\nA Gantt chart is a visual project management tool that shows tasks, timelines, and progress in a bar chart format.\n\n**How to read a Gantt chart:**\n- Each task is shown as a horizontal bar\n- The length of the bar represents the duration of the task\n- The position of the bar shows when the task starts and ends\n- Tasks can overlap (showing parallel activities)\n- Milestones are shown as diamonds or markers\n\n**Advantages of Gantt charts:**\n- Easy to see the overall timeline at a glance\n- Shows which tasks can run in parallel\n- Identifies bottlenecks and delays\n- Helps allocate resources efficiently\n- Enables progress tracking\n\n**Limitations of Gantt charts:**\n- Can become complex for large projects\n- Do not show dependencies between tasks clearly\n- Must be updated regularly to remain useful'),
  fb(7, 'A ___ chart shows tasks as horizontal bars on a timeline, while a ___ (Work Breakdown Structure) breaks a project into smaller, manageable components.',
    ['Gantt', 'WBS'],
    'Gantt charts visualise the project schedule. A WBS breaks the project into smaller deliverables and tasks.',
    ['One is a visual timeline tool, the other breaks work into components.']),
  q(8, 'What is the main advantage of a Gantt chart?',
    ['It calculates costs automatically', 'It shows the overall project timeline and task durations visually', 'It eliminates the need for a business plan', 'It assigns responsibilities to team members'], 1,
    'The main advantage of a Gantt chart is that it provides a clear visual representation of the project timeline, showing when tasks start, how long they take, and which tasks overlap.'),
];

// Lesson 2: WBS, Funding, and Starting a Venture
blockNum = 0;
const ch10_lesson2 = [
  t(1, '### Work Breakdown Structure (WBS)\n\nA Work Breakdown Structure breaks a project into smaller, manageable deliverables and tasks.\n\n**Structure of a WBS:**\n- **Level 1:** The overall project (e.g., "Open Coffee Shop")\n- **Level 2:** Major deliverables (e.g., "Premises", "Equipment", "Staff", "Marketing")\n- **Level 3:** Specific tasks under each deliverable (e.g., under "Staff": recruit baristas, train staff, create work schedule)\n\n**Example WBS for Opening a Coffee Shop:**\n\n```\nOpen Coffee Shop\n|-- Premises\n|   |-- Find suitable location\n|   |-- Negotiate lease\n|   |-- Renovate space\n|-- Equipment\n|   |-- Research coffee machines\n|   |-- Purchase equipment\n|   |-- Install and test\n|-- Staffing\n|   |-- Advertise positions\n|   |-- Interview candidates\n|   |-- Train selected staff\n|-- Marketing\n|   |-- Design logo and branding\n|   |-- Create social media pages\n|   |-- Plan grand opening event\n```'),
  t(2, '### Funding and Capital\n\nStarting a business requires capital (money). There are various sources of funding available.\n\n**Sources of funding:**\n\n| Source | Description | Advantages | Disadvantages |\n|--------|-------------|------------|---------------|\n| **Personal savings** | Owner\'s own money | No interest or repayment | Limited amount |\n| **Bank loan** | Borrowed from a bank | Large amounts available | Interest charges; collateral needed |\n| **Government grants** | Funding from SEDA, NEF, SEFA | No repayment required | Competitive application process |\n| **Venture capital** | Investment from VC firms | Large amounts; expertise | Must give up equity (ownership) |\n| **Angel investors** | Wealthy individuals investing | Mentorship and connections | Must give up equity |\n| **Crowdfunding** | Many small investors online | No repayment; marketing | Uncertain; must meet targets |\n| **Micro-loans** | Small loans for small businesses | Accessible for informal businesses | Higher interest rates |'),
  t(3, '### Government Support for Entrepreneurs\n\nThe South African government provides several agencies to support small businesses:\n\n**SEDA (Small Enterprise Development Agency):**\n- Provides free business advice and mentoring\n- Helps with business plan development\n- Offers training programmes\n- Has offices throughout South Africa\n\n**SEFA (Small Enterprise Finance Agency):**\n- Provides loans to small businesses that cannot access bank finance\n- Offers micro-loans, direct lending, and wholesale lending through intermediaries\n\n**NEF (National Empowerment Fund):**\n- Provides funding specifically for black-owned businesses\n- Supports BBBEE objectives\n\n**IDC (Industrial Development Corporation):**\n- Provides funding for industrial and manufacturing projects\n- Supports businesses that create jobs\n\n**NYDA (National Youth Development Agency):**\n- Supports young entrepreneurs (18-35)\n- Provides grants, loans, and mentorship'),
  q(4, 'Which government agency specifically provides free business advice and mentoring to small businesses?',
    ['SEFA', 'SEDA', 'NEF', 'IDC'], 1,
    'SEDA (Small Enterprise Development Agency) provides free business advice, mentoring, business plan development assistance, and training programmes.'),
  t(5, '### Steps to Starting a Business Venture\n\n**Step 1: Identify an opportunity**\n- Look for gaps in the market\n- Identify unmet customer needs\n- Research trends and emerging markets\n\n**Step 2: Conduct market research**\n- Determine the size of the target market\n- Analyse competitors\n- Understand customer preferences\n\n**Step 3: Write a business plan**\n- Use the sections outlined earlier\n- Be realistic in financial projections\n\n**Step 4: Secure funding**\n- Calculate start-up costs accurately\n- Approach appropriate funding sources\n- Prepare a strong pitch/presentation\n\n**Step 5: Legal requirements**\n- Register with CIPC (company or CC)\n- Register with SARS for tax\n- Obtain necessary licences and permits\n- Register for UIF and COIDA if employing staff\n\n**Step 6: Set up operations**\n- Secure premises, purchase equipment, hire staff\n- Set up financial systems (bank account, bookkeeping)\n\n**Step 7: Launch and market**\n- Execute marketing plan\n- Open for business'),
  fb(6, 'Before starting a business, an entrepreneur must register with ___ (for company registration) and ___ (for tax registration).',
    ['CIPC', 'SARS'],
    'CIPC (Companies and Intellectual Property Commission) handles company registration. SARS (South African Revenue Service) handles tax registration.',
    ['One handles company registration, the other handles tax.']),
  t(7, '### Challenges Facing South African Entrepreneurs\n\n| Challenge | Description |\n|-----------|-------------|\n| Access to finance | Banks require collateral; high interest rates; limited government funding |\n| Load shedding | Disrupts operations; increases costs (generators, solar) |\n| Crime and theft | High security costs; stock losses; personal safety risks |\n| Skills shortage | Difficulty finding skilled employees |\n| Red tape | Complex registration processes; multiple compliance requirements |\n| Competition | Large established businesses dominate markets |\n| Economic conditions | High inflation, weak consumer spending, slow growth |\n| Infrastructure | Poor roads, unreliable water supply in some areas |\n\n**Despite these challenges, entrepreneurship is crucial for South Africa:**\n- Small businesses contribute about 40% of GDP\n- They create employment opportunities (especially for youth)\n- They drive innovation and competition\n- They reduce dependence on large corporations\n- They promote economic inclusion'),
  q(8, 'What is the MAIN reason many small businesses in South Africa fail within the first few years?',
    ['Too much competition', 'Lack of access to finance and poor financial management', 'Load shedding', 'Government regulations'], 1,
    'Lack of access to finance and poor financial management are consistently cited as the main reasons for small business failure in South Africa. Many entrepreneurs run out of cash before the business becomes profitable.'),
  t(9, '### Business Opportunity Assessment\n\nBefore starting a venture, an entrepreneur must assess the opportunity:\n\n**Questions to ask:**\n1. Is there a real need for this product or service?\n2. Who is the target customer and how large is the market?\n3. What makes this different from existing offerings?\n4. Can I produce/deliver it at a profit?\n5. Do I have (or can I get) the necessary skills and resources?\n6. What are the main risks and how can I manage them?\n7. Is the timing right?\n\n**Feasibility study:** A detailed analysis of whether a business idea is viable. It examines:\n- Market feasibility (is there demand?)\n- Technical feasibility (can we produce it?)\n- Financial feasibility (will it be profitable?)\n- Organisational feasibility (do we have the team?)'),
  q(10, 'What is the purpose of a feasibility study?',
    ['To register the business with CIPC', 'To determine whether a business idea is viable before investing', 'To apply for government funding', 'To create a marketing plan'], 1,
    'A feasibility study analyses whether a business idea is viable by examining market demand, technical capability, financial viability, and organisational capacity before the entrepreneur invests time and money.'),
];

// =============================================================================
// CHAPTER 11: Presentation Skills (Term 3)
// =============================================================================

blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Presentation Skills\n\n### Types of Presentations\n\nPresentation skills are essential in business for communicating ideas, selling products, training staff, and reporting to stakeholders.\n\n**Types of business presentations:**\n- **Informative** - Sharing facts and information (e.g., quarterly sales report)\n- **Persuasive** - Convincing the audience to take action (e.g., investor pitch)\n- **Instructional** - Teaching or training (e.g., new employee orientation)\n- **Motivational** - Inspiring and encouraging (e.g., team rally)\n\n**Key elements of an effective presentation:**\n1. Clear purpose and objective\n2. Well-organised structure (introduction, body, conclusion)\n3. Engaging content relevant to the audience\n4. Confident delivery\n5. Effective use of visual aids\n6. Audience interaction'),
  t(2, '### Verbal Presentation Skills\n\nVerbal communication is what you SAY and HOW you say it.\n\n**Effective verbal techniques:**\n\n| Technique | Description |\n|-----------|-------------|\n| **Clarity** | Speak clearly and use simple, understandable language |\n| **Pace** | Not too fast (audience cannot follow) or too slow (audience loses interest) |\n| **Volume** | Loud enough for everyone to hear; vary volume for emphasis |\n| **Tone** | Vary your tone to maintain interest and convey emotion |\n| **Pausing** | Use pauses to emphasise key points and allow audience to absorb information |\n| **Vocabulary** | Use language appropriate for the audience (avoid jargon with non-experts) |\n| **Structure** | Use signposting ("Firstly...", "In conclusion...") to guide the audience |\n\n**Common verbal mistakes:**\n- Using filler words ("um", "like", "you know")\n- Speaking in a monotone voice\n- Reading directly from slides or notes\n- Using too much technical jargon\n- Going off-topic or rambling'),
  t(3, '### Non-Verbal Presentation Skills\n\nNon-verbal communication is HOW you present yourself physically. Research shows that up to 55% of communication is non-verbal.\n\n**Body language:**\n- **Eye contact** - Look at different sections of the audience; avoid staring at one spot\n- **Posture** - Stand straight and confident; avoid slouching or leaning\n- **Gestures** - Use natural hand gestures to emphasise points; avoid fidgeting\n- **Movement** - Move purposefully; avoid pacing nervously\n- **Facial expressions** - Smile when appropriate; show enthusiasm\n\n**Appearance:**\n- Dress appropriately for the audience and occasion\n- Neat and professional grooming\n- Avoid distracting accessories or clothing\n\n**Confidence indicators:**\n- Firm handshake when meeting audience\n- Open body posture (arms not crossed)\n- Calm, controlled movements\n- Natural smiling'),
  q(4, 'What percentage of communication is estimated to be non-verbal?',
    ['10%', '25%', '55%', '75%'], 2,
    'Research suggests that up to 55% of communication is non-verbal (body language and facial expressions), about 38% is vocal tone, and only 7% is the actual words.'),
  t(5, '### Visual Aids in Presentations\n\nVisual aids support your message and help the audience understand and remember information.\n\n**Types of visual aids:**\n\n| Visual Aid | Best Used For |\n|-----------|---------------|\n| **PowerPoint/Google Slides** | Most business presentations; combining text, images, and data |\n| **Charts and graphs** | Displaying numerical data and trends |\n| **Videos** | Demonstrating processes or showing real-life examples |\n| **Handouts** | Providing detailed information for reference after the presentation |\n| **Physical props/samples** | Product demonstrations |\n| **Whiteboards/flipcharts** | Interactive discussions and brainstorming |\n| **Infographics** | Summarising complex information visually |\n\n**Rules for effective slides:**\n- Maximum 6 lines of text per slide\n- Use large, readable fonts (minimum 24pt)\n- One main idea per slide\n- Use images and diagrams more than text\n- Consistent colour scheme and design\n- Do NOT read slides word-for-word'),
  fb(6, 'The two main categories of presentation skills are ___ (what you say) and ___ (how you present yourself physically).',
    ['verbal', 'non-verbal'],
    'Verbal skills relate to spoken communication. Non-verbal skills relate to body language, gestures, and physical presence.',
    ['One relates to words, the other to body language.']),
  t(7, '### Responding to Questions\n\nHandling questions from the audience is a critical part of any presentation.\n\n**Techniques for handling questions effectively:**\n\n1. **Listen carefully** - Let the person finish their question before responding\n2. **Repeat or paraphrase** - "So you are asking whether..." (ensures you understood correctly)\n3. **Answer directly** - Give a clear, concise answer; do not ramble\n4. **Be honest** - If you do not know the answer, say so: "That is a great question. I will research that and get back to you."\n5. **Stay calm** - If faced with a hostile or challenging question, remain professional\n6. **Bridge back** - Connect your answer to your main message\n7. **Involve the audience** - "Does anyone else have experience with this?"\n\n**Dealing with difficult situations:**\n- **Off-topic questions:** Acknowledge and offer to discuss after the presentation\n- **Multiple questions at once:** Address one at a time\n- **No questions:** Have a few discussion points prepared to fill the silence'),
  q(8, 'What should you do if you do not know the answer to a question during a presentation?',
    ['Make up an answer that sounds convincing', 'Ignore the question and move on', 'Admit you do not know and offer to research it', 'Ask the audience to answer instead'], 2,
    'Honesty is the best approach. Admit that you do not know, thank the person for the question, and commit to finding the answer and following up. This builds credibility.'),
  t(9, '### Planning and Preparing a Presentation\n\n**Before the presentation:**\n1. Know your audience (who are they? what do they need?)\n2. Define your purpose (inform, persuade, instruct, motivate)\n3. Research your topic thoroughly\n4. Organise content logically (introduction, body, conclusion)\n5. Prepare visual aids\n6. Practise multiple times (time yourself)\n7. Check venue and equipment in advance\n\n**Structure of a presentation:**\n- **Introduction (10%):** Hook the audience, introduce yourself, state the purpose, outline what you will cover\n- **Body (80%):** Main content organised in 3-5 key points, supported by evidence, examples, and visuals\n- **Conclusion (10%):** Summarise key points, call to action, thank the audience, invite questions\n\n**The "Tell them" rule:**\n- Tell them what you are going to tell them (introduction)\n- Tell them (body)\n- Tell them what you told them (conclusion)'),
  q(10, 'What is the recommended proportion of a presentation that should be spent on the main body (content)?',
    ['50%', '60%', '70%', '80%'], 3,
    'The recommended structure is: Introduction 10%, Body 80%, Conclusion 10%. The body should contain the majority of the content.'),
];

// =============================================================================
// CHAPTER 12: Team Dynamics and Conflict (Term 3)
// =============================================================================

// Lesson 1: Tuckman and Team Dynamics
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Team Dynamics\n\n### What is a Team?\n\nA team is a group of people working together towards a common goal. Effective teamwork is essential in business.\n\n**Difference between a group and a team:**\n\n| Group | Team |\n|-------|------|\n| Individuals with a shared interest | Individuals with a shared goal and accountability |\n| May work independently | Work interdependently |\n| Individual goals may differ | Aligned towards a common objective |\n| Success measured individually | Success measured collectively |\n| Leadership may be unclear | Clear leadership and roles |\n\n**Benefits of effective teamwork:**\n- Combines diverse skills and perspectives\n- Increases productivity and efficiency\n- Improves problem-solving through collaboration\n- Builds employee morale and motivation\n- Fosters innovation through idea-sharing\n- Distributes workload and reduces burnout'),
  t(2, '### Tuckman\'s Stages of Team Development\n\nBruce Tuckman (1965) identified four stages that teams go through as they develop. He later added a fifth stage.\n\n**Stage 1: Forming**\n- Team members meet and get to know each other\n- Roles and responsibilities are unclear\n- Members are polite but cautious\n- Reliance on the leader for direction\n- Low productivity (still finding their feet)\n\n**Stage 2: Storming**\n- Conflicts emerge as members assert their ideas\n- Power struggles and personality clashes\n- Some members may resist the leader or challenge the task\n- Frustration and tension are common\n- This is the most difficult and critical stage\n- Many teams fail at this stage if conflict is not managed'),
  t(3, '### Tuckman\'s Stages (continued)\n\n**Stage 3: Norming**\n- Team establishes norms, rules, and working methods\n- Conflicts are resolved and relationships strengthen\n- Members accept their roles and respect each other\n- Cooperation and collaboration increase\n- Productivity starts to improve\n\n**Stage 4: Performing**\n- Team is highly functional and effective\n- Members work independently AND together seamlessly\n- Strong focus on achieving the goal\n- Creativity and innovation flourish\n- Minimal supervision needed\n- Peak productivity\n\n**Stage 5: Adjourning (Mourning)**\n- Team disbands after achieving its goal\n- Members may feel sadness or loss\n- Recognition and celebration of achievements\n- Lessons learned are documented\n- Temporary project teams often experience this stage'),
  q(4, 'According to Tuckman, during which stage do conflicts and power struggles typically emerge?',
    ['Forming', 'Storming', 'Norming', 'Performing'], 1,
    'The storming stage is characterised by conflicts, power struggles, and personality clashes as team members assert their ideas and compete for roles.'),
  t(5, '### Team Roles\n\nEffective teams need members who play different roles:\n\n**Common team roles:**\n- **Leader/Coordinator** - Guides the team, facilitates meetings, makes final decisions\n- **Innovator/Creative** - Generates new ideas and creative solutions\n- **Implementer** - Turns ideas into practical plans and actions\n- **Researcher** - Gathers information and explores opportunities\n- **Monitor/Evaluator** - Analyses ideas critically and objectively\n- **Team worker** - Builds relationships, resolves conflicts, supports others\n- **Completer/Finisher** - Ensures tasks are completed on time and to standard\n- **Specialist** - Provides expert knowledge in a specific area\n\n**A balanced team** has members covering different roles. If everyone is a creative thinker but no one implements, nothing gets done. If everyone implements but no one innovates, the team stagnates.'),
  fb(6, 'Tuckman\'s five stages of team development are Forming, ___, Norming, Performing, and ___.',
    ['Storming', 'Adjourning'],
    'The five stages are: Forming (meeting), Storming (conflict), Norming (establishing rules), Performing (productive), and Adjourning (disbanding).',
    ['The second stage involves conflict. The fifth stage involves the team breaking up.']),
  t(7, '### Characteristics of Effective Teams\n\n| Characteristic | Description |\n|---------------|-------------|\n| Clear goals | Everyone understands and agrees on what the team is trying to achieve |\n| Defined roles | Each member knows their responsibility |\n| Open communication | Members share information freely and listen to each other |\n| Mutual trust | Members trust each other\'s intentions and abilities |\n| Shared accountability | The team succeeds or fails together |\n| Constructive conflict | Disagreements are handled respectfully and lead to better solutions |\n| Strong leadership | Leader facilitates, motivates, and removes obstacles |\n| Diversity | Different skills, perspectives, and backgrounds enrich the team |\n| Commitment | All members are dedicated to the team\'s success |\n\n**Example:** The Springboks\' 2019 Rugby World Cup victory is often cited as an example of effective teamwork. Captain Siya Kolisi led a diverse team with clear goals, mutual trust, and strong commitment. The team went through all of Tuckman\'s stages before performing at their peak.'),
  q(8, 'Which Tuckman stage is characterised by the team establishing rules, resolving conflicts, and building cooperation?',
    ['Forming', 'Storming', 'Norming', 'Performing'], 2,
    'The norming stage is when the team establishes norms and working methods, conflicts are resolved, and cooperation increases.'),
];

// Lesson 2: Conflict Management
blockNum = 0;
const ch12_lesson2 = [
  t(1, '## Conflict in the Workplace\n\n### What is Conflict?\n\nConflict occurs when two or more parties have incompatible goals, interests, or values. Conflict in the workplace is NORMAL and can be either positive or negative.\n\n**Positive conflict (constructive):**\n- Leads to better ideas through healthy debate\n- Encourages creative problem solving\n- Prevents groupthink\n- Highlights issues that need attention\n- Strengthens relationships when resolved well\n\n**Negative conflict (destructive):**\n- Reduces productivity and morale\n- Creates a hostile work environment\n- Leads to absenteeism and staff turnover\n- Damages working relationships\n- Can result in legal disputes'),
  t(2, '### Causes of Conflict in the Workplace\n\n| Cause | Description |\n|-------|-------------|\n| **Poor communication** | Misunderstandings, unclear instructions, lack of information sharing |\n| **Personality clashes** | Different working styles, values, or temperaments |\n| **Competition for resources** | Limited budgets, equipment, or space |\n| **Role ambiguity** | Unclear job descriptions and overlapping responsibilities |\n| **Unfair treatment** | Favouritism, discrimination, unequal workloads |\n| **Change management** | Resistance to new processes, structures, or technology |\n| **Cultural differences** | Different cultural norms and expectations |\n| **Unmet expectations** | Broken promises, missed deadlines, unmet targets |\n| **Power struggles** | Competition for promotions or influence |\n\n**Example:** In a South African workplace, conflict may arise when long-serving employees feel threatened by Employment Equity appointments, believing the new appointments are based on demographics rather than merit.'),
  t(3, '### Conflict Resolution Strategies\n\n**Thomas-Kilmann Conflict Model** identifies five strategies:\n\n| Strategy | Description | When to Use |\n|----------|-------------|-------------|\n| **Competing** | Win-lose; one party forces their position | Emergencies; when quick action is needed |\n| **Accommodating** | Giving in to the other party | When the issue is more important to the other person; preserving relationships |\n| **Avoiding** | Ignoring or postponing the conflict | When the issue is trivial; when emotions need to cool down |\n| **Compromising** | Both parties give up something | When a quick, temporary solution is needed; equal power |\n| **Collaborating** | Win-win; both parties work together for a mutually beneficial solution | When the issue is too important for compromise; long-term solution needed |\n\n**Collaborating is generally the BEST strategy** because both parties feel heard and the solution addresses everyone\'s needs. However, it takes more time and effort.'),
  q(4, 'Which conflict resolution strategy results in a WIN-WIN outcome?',
    ['Competing', 'Compromising', 'Avoiding', 'Collaborating'], 3,
    'Collaborating is the win-win strategy where both parties work together to find a mutually beneficial solution that addresses everyone\'s needs.'),
  t(5, '### Steps to Resolve Conflict\n\n**Step 1: Identify the conflict**\n- Recognise that a conflict exists\n- Define the issue clearly\n- Determine who is involved\n\n**Step 2: Understand all perspectives**\n- Listen to each party without judgment\n- Ask open-ended questions\n- Identify the underlying interests (not just positions)\n\n**Step 3: Find common ground**\n- Identify shared goals and interests\n- Focus on the problem, not the people\n- Separate emotions from facts\n\n**Step 4: Generate solutions**\n- Brainstorm options together\n- Evaluate each option against criteria\n- Select the solution both parties can support\n\n**Step 5: Implement and follow up**\n- Document the agreement\n- Assign responsibilities and timelines\n- Schedule a follow-up meeting to check progress\n- Adjust if the solution is not working'),
  fb(6, 'The five conflict resolution strategies in the Thomas-Kilmann model are Competing, Accommodating, ___, Compromising, and ___.',
    ['Avoiding', 'Collaborating'],
    'The five strategies are: Competing (win-lose), Accommodating (lose-win), Avoiding (lose-lose), Compromising (partial win-win), and Collaborating (win-win).',
    ['One involves ignoring the conflict, the other involves working together.']),
  t(7, '### The Role of Mediation and Grievance Procedures\n\n**Internal grievance procedure:**\n1. Employee raises the issue with their direct supervisor\n2. If unresolved, escalated to HR department\n3. If still unresolved, referred to senior management\n4. If internal processes fail, referred externally (CCMA)\n\n**Mediation:**\n- A neutral third party helps the conflicting parties reach an agreement\n- The mediator does not impose a solution\n- Both parties must agree to participate\n- More flexible and less formal than arbitration\n- Preserves relationships better than legal proceedings\n\n**When to use external dispute resolution:**\n- Internal processes have failed\n- The conflict involves potential unfair dismissal or discrimination\n- Legal rights are at stake\n- The parties are unable to communicate constructively'),
  q(8, 'What is the key difference between mediation and arbitration?',
    ['Mediation is more expensive', 'In mediation the third party suggests a solution but does not impose it; in arbitration the decision is binding', 'Arbitration is always internal', 'Mediation requires lawyers'], 1,
    'In mediation, a neutral third party facilitates discussion but the parties decide the outcome. In arbitration, the arbitrator makes a binding decision that both parties must accept.'),
  t(9, '### Diversity and Conflict Management in South Africa\n\nSouth Africa\'s diverse workforce (11 official languages, multiple cultures, historical inequalities) creates unique conflict dynamics.\n\n**Cultural considerations:**\n- Different communication styles (direct vs indirect)\n- Different attitudes to authority and hierarchy\n- Language barriers in multilingual workplaces\n- Historical tensions related to apartheid legacy\n- Generational differences (Baby Boomers vs Millennials vs Gen Z)\n\n**Strategies for managing diversity-related conflict:**\n- Diversity and inclusion training\n- Clear anti-discrimination policies\n- Multilingual communication where possible\n- Cultural awareness programmes\n- Celebrate different cultural events and heritage days\n- Ensure EE policies are implemented with sensitivity\n- Create safe spaces for open dialogue\n\n**Example:** Many large SA companies (like Standard Bank, Nedbank, MTN) have dedicated diversity and inclusion departments that run ongoing programmes to build understanding and reduce conflict.'),
  q(10, 'Why is conflict management particularly important in South African workplaces?',
    ['Because SA workers are more confrontational', 'Because of the diverse workforce with different languages, cultures, and historical backgrounds', 'Because SA has more trade unions than other countries', 'Because conflict is illegal in SA workplaces'], 1,
    'South Africa\'s diverse workforce (languages, cultures, historical inequalities) creates unique conflict dynamics that require sensitive and skilled management.'),
];

// =============================================================================
// CHAPTER 13: Revision (Term 4)
// =============================================================================

blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Grade 11 Business Studies Revision\n\n### Exam Structure\n\nThe Grade 11 Business Studies examination typically consists of two papers:\n\n**Paper 1 (Business Environments):** 2 hours, 150 marks\n- Section A: Short questions (compulsory) - 30 marks\n- Section B: THREE direct/indirect questions (answer TWO) - 60 marks\n- Section C: ONE essay (choose from TWO options) - 40 marks\n\n**Paper 2 (Business Operations):** 2 hours, 150 marks\n- Section A: Short questions (compulsory) - 30 marks\n- Section B: THREE direct/indirect questions (answer TWO) - 60 marks\n- Section C: ONE essay (choose from TWO options) - 40 marks\n\n**Paper 1 topics:** Business environments, challenges, contemporary issues, business sectors, forms of ownership\n**Paper 2 topics:** Creative thinking, marketing, production, ethics, entrepreneurship, presentations, team dynamics'),
  t(2, '### Key Action Verbs in Business Studies\n\nUnderstanding action verbs helps you answer questions correctly:\n\n| Verb | What to Do | Marks Guide |\n|------|-----------|-------------|\n| **Name/State** | Give the name only; no explanation | 1 mark each |\n| **List** | Write items one below the other | 1 mark each |\n| **Define** | Give the meaning of the concept | 2 marks |\n| **Describe** | Give a detailed account | 2 marks per point |\n| **Explain** | Make clear by giving reasons or examples | 2 marks per point |\n| **Discuss** | Present different aspects with supporting detail | 2 marks per point |\n| **Distinguish** | Point out the differences between concepts | 2 marks per point |\n| **Evaluate** | Judge the value/effectiveness; give pros and cons | 2 marks per point |\n| **Recommend** | Suggest solutions with reasons | 2 marks per point |\n| **Analyse** | Break down into parts and examine in detail | 2 marks per point |'),
  t(3, '### Essay Writing Tips\n\n**Structure of a Business Studies essay (40 marks):**\n\n**Introduction (max 2 marks):**\n- Define the topic or provide context\n- Keep it brief (2-3 sentences)\n\n**Body (max 32 marks):**\n- Organise content under clear sub-headings\n- Use bullet points for clarity\n- Provide examples (especially South African examples)\n- Cover all aspects of the question\n- Aim for 8-10 well-developed points\n\n**Conclusion (max 2 marks):**\n- Summarise the main points\n- Give a personal opinion or recommendation where appropriate\n\n**Layout/Insight marks (max 4 marks):**\n- Neat, logical presentation\n- Relevant sub-headings used\n- Originality and depth of understanding\n- Real-world application'),
  q(4, 'If a question asks you to "evaluate" a concept, what should you do?',
    ['Simply define it', 'List the main points', 'Judge the value or effectiveness, including pros and cons', 'Describe it in detail'], 2,
    'Evaluate means to judge the value or effectiveness of something. You should present advantages and disadvantages, or strengths and weaknesses, and come to a conclusion.'),
  t(5, '### Term 1 Key Revision Topics\n\n**Business Environments:**\n- Three environments: micro, market, macro\n- Components of each environment\n- PESTLE analysis for macro environment\n- SWOT analysis (internal vs external factors)\n- Control factors: full control (micro), limited influence (market), no control (macro)\n\n**Challenges of the Business Environment:**\n- Challenges in each environment\n- Strategies to overcome challenges\n- SA-specific challenges (load shedding, crime, skills shortage)\n\n**Contemporary Socio-Economic Issues:**\n- Piracy and counterfeiting\n- Strikes and industrial action\n- IP rights: copyright, patent, trademark, design\n- Trade unions and collective bargaining\n- LRA and dispute resolution\n- Unfair dismissal (misconduct, incapacity, operational requirements)\n\n**Business Sectors:**\n- Primary (extraction), secondary (manufacturing), tertiary (services)\n- Links between sectors (value chain examples)\n- The informal sector'),
  t(6, '### Term 1 Key Revision Topics (continued)\n\n**Forms of Ownership:**\n- Sole proprietor: unlimited liability, no legal personality\n- Partnership: 2-20 members, unlimited liability, partnership agreement\n- Close Corporation: limited liability, max 10 members, no new registrations since 2011\n- Private Company (Pty) Ltd: limited liability, MOI, registered with CIPC\n- Public Company (Ltd): shares sold on JSE, strict regulation, limited liability\n- Co-operative: democratic, one member one vote, minimum 5 members\n- Franchise: franchisor/franchisee relationship, fees and royalties\n\n**Key comparison factors:**\n- Legal personality (separate entity or not?)\n- Liability (limited or unlimited?)\n- Continuity (what happens when owner dies?)\n- Capital access (how much funding can be raised?)\n- Formation cost and complexity'),
  t(7, '### Term 2 Key Revision Topics\n\n**Creative Thinking and Problem Solving:**\n- Creative vs routine thinking\n- Delphi technique (anonymous expert rounds)\n- Force-field analysis (driving vs restraining forces)\n- Problem-solving steps (7 steps)\n- SCAMPER technique\n\n**Marketing Function:**\n- Marketing mix (4 Ps: Product, Price, Place, Promotion)\n- Product life cycle (introduction, growth, maturity, decline)\n- Pricing strategies (cost-plus, penetration, skimming, etc.)\n- Distribution channels (direct vs indirect)\n- Promotional mix elements\n\n**Production Function:**\n- Types of production (job, batch, mass, continuous)\n- Quality management (QC vs QA vs TQM)\n- SABS and product standards\n- OHS Act (employer and employee responsibilities)'),
  fb(8, 'The Grade 11 Business Studies exam has two papers: Paper 1 covers Business ___ and Paper 2 covers Business ___.',
    ['Environments', 'Operations'],
    'Paper 1 focuses on Business Environments topics (environments, challenges, socio-economic issues, sectors, forms of ownership). Paper 2 covers Business Operations topics (marketing, production, ethics, entrepreneurship, presentations, teamwork).',
    ['Think about the two broad themes of Grade 11 Business Studies.']),
  t(9, '### Term 3 Key Revision Topics\n\n**Professionalism and Ethics:**\n- Theories of professionalism (trait, functionalist, power)\n- Principles of professionalism (integrity, accountability, confidentiality, etc.)\n- Ethical vs unethical behaviour\n- Ethical dilemmas and how to resolve them\n- Benefits of ethical business practices\n\n**Entrepreneurship:**\n- Entrepreneurial qualities\n- Business plan sections\n- Action plans, Gantt charts, WBS\n- Sources of funding (personal, bank, government, VC, angel investors)\n- Government support agencies (SEDA, SEFA, NEF, IDC, NYDA)\n- Steps to starting a business\n- Challenges facing SA entrepreneurs\n\n**Presentation Skills:**\n- Verbal and non-verbal skills\n- Visual aids (types and rules for effective slides)\n- Responding to questions\n- Planning and structure (introduction, body, conclusion)\n\n**Team Dynamics and Conflict:**\n- Tuckman\'s stages (forming, storming, norming, performing, adjourning)\n- Team roles and characteristics of effective teams\n- Causes of conflict\n- Conflict resolution strategies (Thomas-Kilmann model)\n- Mediation vs arbitration'),
  q(10, 'Which of the following is the correct order of Tuckman\'s stages of team development?',
    ['Forming, Norming, Storming, Performing', 'Storming, Forming, Norming, Performing', 'Forming, Storming, Norming, Performing', 'Norming, Storming, Forming, Performing'], 2,
    'Tuckman\'s stages follow the sequence: Forming (meeting), Storming (conflict), Norming (establishing rules), Performing (productive work), and Adjourning (disbanding).'),
];

// =============================================================================
// INSERT EVERYTHING
// =============================================================================

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or determine Grade/Subject IDs
  const gradeDoc = await db.collection('grades').findOne({ name: /11/i });
  const subjectDoc = await db.collection('subjects').findOne({ name: /Business Studies/i });

  const GRADE_ID = gradeDoc ? gradeDoc._id : new mongoose.Types.ObjectId('69d2c1f317b8332733f72601');

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found Business Studies subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Business Studies',
      code: 'BST',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created Business Studies subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Business Environments',
      description: 'Micro, market, and macro environments, their components, control factors, PESTLE framework, and SWOT analysis.',
      order: 1,
      lessons: [
        { title: 'The Micro Environment', description: 'Components of the micro environment, eight business functions, vision, mission, goals, organisational culture, and control factors.', blocks: ch1_lesson1, term: 1 },
        { title: 'Market and Macro Environments', description: 'Market environment components (consumers, suppliers, competitors, intermediaries), macro PESTLE factors, and their impact on business.', blocks: ch1_lesson2, term: 1 },
        { title: 'SWOT Analysis', description: 'Strengths, weaknesses, opportunities, and threats; conducting a SWOT analysis; SO, WO, ST, and WT strategies.', blocks: ch1_lesson3, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Challenges of the Business Environment',
      description: 'Challenges facing businesses in the micro, market, and macro environments, and strategies for adapting.',
      order: 2,
      lessons: [
        { title: 'Challenges of Micro and Market Environments', description: 'Internal and market-level challenges including skills shortage, competition, changing consumer preferences, and overcoming strategies.', blocks: ch2_lesson1, term: 1 },
        { title: 'Challenges of the Macro Environment and Adapting', description: 'PESTLE challenges in SA including load shedding, economic conditions, and crime; adaptation strategies and case studies.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Contemporary Socio-Economic Issues',
      description: 'Impact on business operations, piracy, strikes, intellectual property rights, trade unions, and the Labour Relations Act.',
      order: 3,
      lessons: [
        { title: 'Socio-Economic Issues and Their Impact', description: 'Piracy, counterfeiting, strikes, industrial action, and intellectual property rights (copyright, patent, trademark, design).', blocks: ch3_lesson1, term: 1 },
        { title: 'Trade Unions and the Labour Relations Act', description: 'Role of trade unions, collective bargaining, LRA provisions, CCMA dispute resolution, unfair dismissal, and unfair labour practices.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Business Sectors',
      description: 'Primary, secondary, and tertiary sectors, their characteristics, importance, and the links between sectors.',
      order: 4,
      lessons: [
        { title: 'Primary, Secondary, and Tertiary Sectors', description: 'Characteristics and examples of each sector, links between sectors through value chains, sector trends, and the informal sector.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Forms of Ownership',
      description: 'Sole trader, partnership, close corporation, private and public companies, co-operatives, franchises, Companies Act, and MOI.',
      order: 5,
      lessons: [
        { title: 'Sole Trader, Partnership, and Close Corporation', description: 'Characteristics, advantages, and disadvantages of sole proprietors, partnerships, and close corporations.', blocks: ch5_lesson1, term: 1 },
        { title: 'Companies, Co-operatives, and Franchises', description: 'Private and public companies, MOI, Companies Act, co-operatives, franchises, and comparison of all forms of ownership.', blocks: ch5_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Creative Thinking and Problem Solving',
      description: 'Creative vs routine thinking, Delphi technique, force-field analysis, problem-solving steps, and SCAMPER.',
      order: 6,
      lessons: [
        { title: 'Creative Thinking and Problem Solving', description: 'Creative vs routine thinking, barriers, Delphi technique, force-field analysis, seven-step problem-solving process, and SCAMPER.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Marketing Function',
      description: 'Marketing activities, the marketing mix (4 Ps), product/pricing/distribution/communication policy.',
      order: 7,
      lessons: [
        { title: 'Marketing Activities and the Marketing Mix', description: 'Marketing activities, 4 Ps, product life cycle, pricing strategies, distribution channels, and promotional mix.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Production Function',
      description: 'Production planning, types of production, quality management, SABS standards, and the OHS Act.',
      order: 8,
      lessons: [
        { title: 'Production Planning, Quality, and Safety', description: 'Types of production, quality control vs assurance vs TQM, SABS mark, and OHS Act employer and employee responsibilities.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Professionalism and Ethics',
      description: 'Theories and principles of professionalism, ethical vs unethical behaviour, ethical dilemmas, and benefits of ethics.',
      order: 9,
      lessons: [
        { title: 'Professionalism and Ethics', description: 'Theories of professionalism, principles, ethical vs unethical behaviour, ethical dilemmas, and benefits of ethical business practices.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Entrepreneurship',
      description: 'Entrepreneurial qualities, business plans, action plans, Gantt charts, WBS, funding sources, and starting a venture.',
      order: 10,
      lessons: [
        { title: 'Entrepreneurial Qualities and Business Plans', description: 'Entrepreneurship definition, qualities, business plan sections, action plans, and Gantt charts.', blocks: ch10_lesson1, term: 3 },
        { title: 'WBS, Funding, and Starting a Venture', description: 'Work breakdown structure, sources of funding, government support agencies, steps to starting a business, and challenges facing SA entrepreneurs.', blocks: ch10_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Presentation Skills',
      description: 'Verbal and non-verbal presentation skills, visual aids, responding to questions, and planning presentations.',
      order: 11,
      lessons: [
        { title: 'Presentation Skills', description: 'Types of presentations, verbal and non-verbal skills, visual aids, handling questions, and structuring a presentation.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Team Dynamics and Conflict',
      description: 'Tuckman stages of team development, team roles, conflict causes, and resolution strategies.',
      order: 12,
      lessons: [
        { title: 'Team Dynamics and Tuckman Model', description: 'Groups vs teams, Tuckman stages (forming, storming, norming, performing, adjourning), team roles, and characteristics of effective teams.', blocks: ch12_lesson1, term: 3 },
        { title: 'Conflict Management', description: 'Causes of workplace conflict, Thomas-Kilmann resolution strategies, mediation vs arbitration, and diversity management.', blocks: ch12_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Revision',
      description: 'Exam structure, action verbs, essay writing tips, and revision of all Term 1-3 topics.',
      order: 13,
      lessons: [
        { title: 'Exam Preparation and Revision', description: 'Exam structure, action verbs, essay writing tips, and comprehensive revision of all Grade 11 Business Studies topics.', blocks: ch13_lesson1, term: 4 },
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
    title: 'Grade 11 Business Studies \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Business Environments, Challenges, Contemporary Socio-Economic Issues, Business Sectors, Forms of Ownership, Creative Thinking, Marketing, Production, Professionalism and Ethics, Entrepreneurship, Presentation Skills, Team Dynamics, and Revision for the Grade 11 Business Studies examination.',
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
  console.log('  TEXTBOOK: Grade 11 Business Studies');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
