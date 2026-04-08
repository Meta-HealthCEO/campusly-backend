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
// CHAPTER 1: Circular Flow (Term 1)
// =============================================================================

// --- Lesson 1: The Circular Flow Model ---
blockNum = 0;
const ch1_lesson1 = [
  t(1, "## The Circular Flow Model\n\nThe circular flow model is a simplified representation of how money, goods, and services flow between the different sectors (role players) in an economy. It helps economists understand how national income is generated, distributed, and spent.\n\n### Open vs Closed Economy\n\n| Type | Description |\n|------|-------------|\n| **Closed economy** | No trade with other countries \u2014 only households, firms, and government interact |\n| **Open economy** | Includes the foreign sector \u2014 goods and services are imported and exported |\n\nSouth Africa is an **open economy** because it trades extensively with countries like China, the USA, Germany, and other SADC member states."),
  t(2, "### Role Players in the Circular Flow\n\nThe four main sectors (role players) in an open economy are:\n\n1. **Households** \u2014 Own factors of production (land, labour, capital, entrepreneurship). They supply these to firms and receive income (rent, wages, interest, profit) in return. They spend this income on goods and services.\n\n2. **Firms (Businesses)** \u2014 Use factors of production to produce goods and services. They pay factor incomes to households and sell output in the goods market.\n\n3. **Government** \u2014 Collects taxes from households and firms, provides public goods and services (education, healthcare, infrastructure), and redistributes income through social grants.\n\n4. **Foreign sector** \u2014 Other countries that trade with SA. Exports bring money in; imports send money out."),
  q(3, "Which of the following is NOT a role player in the four-sector circular flow model?",
    ["Households", "The South African Reserve Bank", "Government", "Foreign sector"], 1,
    "The four role players are households, firms, government, and the foreign sector. The SARB is part of the financial sector/government, not a separate role player in the basic model."),
  t(4, "### Injections and Leakages (Withdrawals)\n\nMoney flows into and out of the circular flow:\n\n**Injections** (money entering the flow):\n- **Investment (I)** \u2014 Spending by firms on capital goods\n- **Government spending (G)** \u2014 Expenditure on public goods and services\n- **Exports (X)** \u2014 Foreigners buying SA goods and services\n\n**Leakages/Withdrawals** (money leaving the flow):\n- **Savings (S)** \u2014 Income not spent by households\n- **Taxes (T)** \u2014 Payments to government\n- **Imports (M)** \u2014 SA buying foreign goods and services\n\n**Equilibrium** occurs when total injections = total leakages:\n\n**I + G + X = S + T + M**"),
  fb(5, "The three injections into the circular flow are investment, ___ spending, and ___. The three leakages are savings, taxes, and ___.",
    ["government", "exports", "imports"],
    "Injections add money to the flow (investment, government spending, exports). Leakages remove money (savings, taxes, imports)."),
  t(6, "### Autonomous Consumption and the MPC/MPS\n\n**Autonomous consumption** is the minimum level of consumption that occurs regardless of income level. Even with zero income, people must eat, pay for shelter, etc. This spending is financed by borrowing or using savings.\n\n**Marginal Propensity to Consume (MPC):**\nThe fraction of each additional rand of income that is spent on consumption.\n\nMPC = Change in consumption \u00f7 Change in income\n\n**Marginal Propensity to Save (MPS):**\nThe fraction of each additional rand of income that is saved.\n\nMPS = Change in savings \u00f7 Change in income\n\n**Key relationship:** MPC + MPS = 1\n\nIf MPC = 0.75, then for every additional R1 earned, 75c is spent and 25c is saved."),
  q(7, "If the marginal propensity to consume (MPC) is 0.8, what is the marginal propensity to save (MPS)?",
    ["0.8", "0.2", "0.5", "1.2"], 1,
    "MPC + MPS = 1, so MPS = 1 - 0.8 = 0.2. For every R1 of additional income, 80c is consumed and 20c is saved."),
  t(8, "### GDP, GDI, and GDE\n\nNational income can be measured in three equivalent ways:\n\n1. **GDP (Gross Domestic Product)** \u2014 Total value of all final goods and services produced within a country in a year (production method)\n\n2. **GDI (Gross Domestic Income)** \u2014 Total income earned by all factors of production in the economy (income method): wages + rent + interest + profit\n\n3. **GDE (Gross Domestic Expenditure)** \u2014 Total spending on goods and services (expenditure method): C + I + G + (X - M)\n\nIn theory: **GDP = GDI = GDE**\n\n**Nominal vs Real GDP:**\n- **Nominal (current prices):** Not adjusted for inflation \u2014 can be misleading\n- **Real (constant prices):** Adjusted for inflation \u2014 shows true economic growth\n\nStats SA publishes quarterly GDP data. In 2023, SA real GDP grew by approximately 0.7%."),
  q(9, "GDE is calculated as C + I + G + (X - M). What does (X - M) represent?",
    ["The budget deficit", "Net exports", "Government revenue", "National savings"], 1,
    "X - M is net exports: the value of exports minus imports. A positive figure means SA exports more than it imports (trade surplus)."),
  t(10, "### The Multiplier\n\nThe multiplier effect shows how an initial injection of spending creates a larger final increase in national income.\n\n**Multiplier (k) = 1 \u00f7 MPS = 1 \u00f7 (1 - MPC)**\n\nIf MPC = 0.8:\n- k = 1 \u00f7 (1 - 0.8) = 1 \u00f7 0.2 = **5**\n\nThis means an initial injection of R10 million will ultimately increase national income by R10m \u00d7 5 = **R50 million**.\n\n**How it works:** Government spends R10m on a new school \u2192 Construction workers earn R10m \u2192 They spend R8m (MPC = 0.8) \u2192 Shopkeepers earn R8m \u2192 They spend R6.4m \u2192 And so on...\n\nThe process continues until the total additional income approaches R50m.\n\n**SA context:** The SA multiplier is estimated between 1.2 and 2.0 because of high imports and savings leakages."),
  fb(11, "If the MPC is 0.75, the multiplier is ___. An initial investment of R20 million would increase national income by R ___ million.",
    ["4", "80"],
    "Multiplier = 1 / (1 - 0.75) = 1 / 0.25 = 4. Increase = R20m x 4 = R80m.",
    ["Use the formula k = 1 / (1 - MPC)"]),
  q(12, "Which of the following would DECREASE the size of the multiplier?",
    ["A decrease in the MPS", "An increase in exports", "An increase in the tax rate", "A decrease in imports"], 2,
    "Higher taxes mean more money leaks out of the circular flow at each round, reducing the multiplier effect. The multiplier in an open economy accounts for all leakages: savings, taxes, and imports."),
];

// --- Lesson 2: National Accounts ---
blockNum = 0;
const ch1_lesson2 = [
  t(1, "## National Accounts and the Four-Sector Model\n\nThe **System of National Accounts (SNA)** is the framework used by Stats SA to measure the performance of the economy. It records all economic transactions between the four sectors.\n\n### The Four-Sector Circular Flow Diagram\n\nThe complete model includes:\n\n**Real flows** (physical) \u2014 Factors of production flow from households to firms; goods and services flow from firms to households.\n\n**Money flows** (monetary) \u2014 Factor payments (wages, rent, interest, profit) flow from firms to households; consumer spending flows from households to firms.\n\n**Financial sector** \u2014 Banks and financial institutions channel savings into investment. The SARB oversees the monetary system."),
  t(2, "### How the Sectors Interact\n\n**Households \u2192 Firms:**\n- Supply factors of production (labour, land, capital, entrepreneurship)\n- Receive factor income (wages, rent, interest, profit)\n- Spend income on goods/services (consumption expenditure)\n\n**Government involvement:**\n- Collects income tax and VAT from households\n- Collects company tax from firms\n- Provides public goods (roads, schools, hospitals)\n- Pays social grants (SASSA) to qualifying households\n- Employs public servants\n\n**Foreign sector:**\n- SA exports (e.g., gold, platinum, motor vehicles, fruit) earn foreign exchange\n- SA imports (e.g., crude oil, machinery, electronics) cost foreign exchange\n- The difference = Balance of trade"),
  q(3, "In the circular flow, factor payments flow from:",
    ["Households to firms", "Firms to households", "Government to the foreign sector", "The foreign sector to firms"], 1,
    "Firms pay factor incomes (wages, rent, interest, profit) to households in return for the use of their factors of production."),
  t(4, "### Measuring National Output\n\n**GDP at market prices** includes indirect taxes (like VAT) and subsidies.\n\n**GDP at factor cost** = GDP at market prices - indirect taxes + subsidies\n\nThis gives the income actually received by factors of production.\n\n**GNP (Gross National Product)** = GDP + income earned by SA citizens abroad - income earned by foreigners in SA\n\n**NNP (Net National Product)** = GNP - depreciation (capital consumption)\n\nDepreciation accounts for the wearing out of capital goods (machines, buildings, equipment).\n\n**Per capita GDP** = GDP \u00f7 population\n\nSA per capita GDP was approximately R84 000 in 2023, but this masks extreme inequality \u2014 SA has one of the highest Gini coefficients in the world (approximately 0.63)."),
  fb(5, "GDP at ___ cost equals GDP at market prices minus indirect ___ plus subsidies. Per capita GDP is GDP divided by ___.",
    ["factor", "taxes", "population"],
    "Factor cost removes the effect of taxes and subsidies to show what factors of production actually earned."),
  t(6, "### Shortcomings of GDP as a Measure of Welfare\n\nGDP measures the total value of economic output, but it does not capture:\n\n1. **Income inequality** \u2014 High GDP can coexist with poverty (SA is a prime example)\n2. **Informal economy** \u2014 Unrecorded economic activity (street vendors, domestic workers paid in cash)\n3. **Non-market activities** \u2014 Subsistence farming, volunteer work, household chores\n4. **Environmental degradation** \u2014 Mining boosts GDP but damages the environment\n5. **Quality of life** \u2014 GDP does not measure happiness, health, or education quality\n6. **Crime and corruption** \u2014 These reduce welfare but may not reduce GDP\n\nAlternative measures include the **Human Development Index (HDI)** which combines income, education, and life expectancy."),
  q(7, "Which of the following is a limitation of using GDP to measure the welfare of South Africans?",
    ["It measures total production accurately", "It does not account for income inequality", "It includes all informal sector activity", "It adjusts for environmental damage"], 1,
    "SA has a relatively high GDP for Africa but extreme inequality (Gini coefficient ~0.63), meaning GDP per capita overstates the wellbeing of most citizens."),
  t(8, "### The Business Cycle Connection\n\nNational accounts data reveals the **business cycle** \u2014 the recurring pattern of expansion and contraction in economic activity.\n\nWhen GDP rises \u2192 Expansion/Recovery\nWhen GDP falls for two consecutive quarters \u2192 **Recession**\nWhen GDP reaches its highest point \u2192 **Peak**\nWhen GDP reaches its lowest point \u2192 **Trough**\n\nThe SARB publishes a **composite leading business cycle indicator** that predicts future economic activity using variables like building plans approved, share prices, and money supply.\n\nSouth Africa experienced its worst recession in 2020 (COVID-19), with GDP contracting by 6.4%. Recovery has been slow, with load shedding and logistical constraints hampering growth."),
  q(9, "A recession is technically defined as:",
    ["Any decline in GDP", "Two consecutive quarters of negative GDP growth", "A rise in unemployment above 25%", "A decline in the stock market"], 1,
    "A technical recession is defined as two consecutive quarters of negative real GDP growth."),
  fb(10, "The SARB publishes a composite ___ business cycle indicator to predict future economic activity. SA GDP contracted by ___% in 2020 due to COVID-19.",
    ["leading", "6.4"],
    "Leading indicators predict turning points. SA GDP fell 6.4% in 2020, the worst contraction on record."),
];

// =============================================================================
// CHAPTER 2: Business Cycles (Term 1)
// =============================================================================

blockNum = 0;
const ch2_lesson1 = [
  t(1, "## Business Cycles\n\nA **business cycle** is the recurring pattern of expansion and contraction in economic activity over time. It reflects the fluctuations in real GDP around the long-term growth trend.\n\n### Phases of the Business Cycle\n\n1. **Recovery/Expansion** \u2014 GDP rises, unemployment falls, consumer confidence improves, business investment increases\n2. **Peak/Boom** \u2014 Maximum economic activity, potential inflation pressure, full employment approaches\n3. **Contraction/Downturn** \u2014 GDP slows or declines, businesses cut production, unemployment rises\n4. **Trough/Depression** \u2014 Lowest point of economic activity, high unemployment, low consumer spending\n\nAfter the trough, the cycle begins again with a new recovery phase."),
  t(2, "### Features of Each Phase\n\n| Feature | Expansion | Contraction |\n|---------|-----------|-------------|\n| GDP | Rising | Falling |\n| Employment | Increasing | Decreasing |\n| Consumer spending | High | Low |\n| Business confidence | Optimistic | Pessimistic |\n| Investment | Increasing | Decreasing |\n| Inflation | Rising (demand-pull) | Falling |\n| Tax revenue | Increasing | Decreasing |\n| Government spending | May decrease | Increases (counter-cyclical) |\n\n**Structural changes:** Long-term changes in the economy (e.g., decline of mining, growth of services) can shift the nature of business cycles."),
  q(3, "During which phase of the business cycle is unemployment likely to be at its highest?",
    ["Peak", "Recovery", "Trough", "Expansion"], 2,
    "At the trough (lowest point), economic activity is at its minimum, so unemployment is at its highest. As recovery begins, jobs are gradually created."),
  t(4, "### Causes of Business Cycles\n\nEconomists identify several causes:\n\n**Demand-side factors:**\n- Changes in consumer confidence and spending\n- Changes in investment spending by firms\n- Government fiscal policy (tax and spending changes)\n- Changes in exports and imports\n\n**Supply-side factors:**\n- Changes in input costs (oil prices, wages)\n- Technological innovations\n- Natural disasters (droughts, pandemics)\n- Infrastructure constraints (load shedding in SA)\n\n**External shocks:**\n- Global financial crises (2008/09)\n- Pandemics (COVID-19 in 2020)\n- Commodity price fluctuations (gold, platinum, iron ore)\n- Geopolitical events (Russia-Ukraine conflict affecting oil and food prices)"),
  fb(5, "A business cycle has four phases: recovery, ___, contraction, and ___. A recession occurs when GDP declines for ___ consecutive quarters.",
    ["peak", "trough", "two"],
    "The four phases form a wave pattern around the long-term growth trend."),
  t(6, "### Types of Business Cycles\n\nEconomists have identified cycles of different lengths:\n\n| Cycle | Duration | Based on |\n|-------|----------|----------|\n| **Kitchin cycle** | 3\u20135 years | Inventory/stock fluctuations |\n| **Juglar cycle** | 7\u201311 years | Fixed investment (machinery, equipment) |\n| **Kuznets cycle** | 15\u201325 years | Infrastructure and building |\n| **Kondratieff (long wave)** | 40\u201360 years | Major technological innovations |\n\nIn practice, shorter cycles are superimposed on longer ones, creating complex economic patterns."),
  q(7, "The Kondratieff long wave cycle lasts approximately:",
    ["3\u20135 years", "7\u201311 years", "15\u201325 years", "40\u201360 years"], 3,
    "Kondratieff cycles span 40\u201360 years and are driven by major technological revolutions (e.g., steam power, electricity, digital technology)."),
  t(8, "### Monetary and Fiscal Policy Responses\n\n**Monetary policy** (managed by the SARB):\n- During expansion/boom \u2192 Raise interest rates to cool the economy and control inflation\n- During contraction/recession \u2192 Lower interest rates to stimulate borrowing and spending\n\n**Fiscal policy** (managed by National Treasury):\n- During expansion \u2192 Reduce government spending, increase taxes (build fiscal reserves)\n- During contraction \u2192 Increase government spending, reduce taxes (stimulate demand)\n\nThis is called **counter-cyclical policy** \u2014 government acts against the cycle to smooth fluctuations.\n\n**SA example:** During COVID-19, the SARB cut the repo rate from 6.25% to 3.5%, and government introduced the R350 Social Relief of Distress grant."),
  q(9, "Counter-cyclical fiscal policy during a recession involves:",
    ["Increasing taxes and reducing government spending", "Increasing government spending and reducing taxes", "Keeping fiscal policy unchanged", "Increasing both taxes and government spending"], 1,
    "During a recession, government increases spending and may reduce taxes to boost aggregate demand and stimulate economic recovery."),
  t(10, "### The New Economic Paradigm\n\nSome economists argue that modern economies may experience smoother business cycles due to:\n\n1. **Better information** \u2014 Real-time data allows faster policy responses\n2. **Improved monetary policy** \u2014 Inflation targeting (SA targets 3\u20136%) provides stability\n3. **Financial innovation** \u2014 Better risk management tools\n4. **Globalisation** \u2014 Diversified trade reduces dependence on single markets\n5. **Technology** \u2014 Automation and AI improve productivity and efficiency\n\n**Counter-argument:** The 2008 Global Financial Crisis and COVID-19 showed that severe shocks can still cause deep recessions. SA remains vulnerable due to structural issues (inequality, unemployment, infrastructure decay).\n\n**Forecasting:** The SARB uses leading, coincident, and lagging indicators to forecast business cycle turning points. Leading indicators include building plans, share prices, and the money supply."),
  fb(11, "The SARB uses ___ policy to manage business cycles by adjusting the ___ rate. SA targets inflation between ___% and 6%.",
    ["monetary", "repo", "3"],
    "The SARB adjusts the repo rate to influence borrowing costs and economic activity. The inflation target band is 3\u20136%."),
];

// =============================================================================
// CHAPTER 3: Public Sector (Term 1)
// =============================================================================

blockNum = 0;
const ch3_lesson1 = [
  t(1, "## The Public Sector\n\n### Composition of the Public Sector\n\nThe public sector consists of all government institutions and state-owned enterprises:\n\n**Three spheres of government:**\n1. **National government** \u2014 Parliament, Cabinet, national departments (Treasury, DHET, DBE)\n2. **Provincial government** \u2014 9 provinces, each with a premier and provincial departments\n3. **Local government** \u2014 Municipalities that deliver basic services (water, electricity, refuse removal)\n\n**State-Owned Enterprises (SOEs):**\n- Eskom (electricity)\n- Transnet (freight rail and ports)\n- SAA (airline)\n- PRASA (passenger rail)\n- Denel (defence)\n- SABC (broadcasting)\n\nSOEs have been a major fiscal burden in SA due to mismanagement, corruption, and bailouts."),
  t(2, "### Necessity of the Public Sector\n\nThe public sector exists because markets alone cannot provide:\n\n1. **Public goods** \u2014 Non-excludable and non-rivalrous (national defence, streetlights, public parks)\n2. **Merit goods** \u2014 Goods that society deems everyone should have access to (education, healthcare)\n3. **Infrastructure** \u2014 Roads, bridges, dams, power stations (too expensive for private firms alone)\n4. **Redistribution** \u2014 Reducing inequality through social grants, progressive taxation, free basic services\n5. **Regulation** \u2014 Protecting consumers, workers, and the environment\n6. **Macroeconomic stability** \u2014 Managing inflation, unemployment, and economic growth\n\nIn SA, the public sector employs about 1.3 million people and is a major driver of service delivery."),
  q(3, "Which of the following is an example of a public good?",
    ["A private hospital", "National defence", "A branded clothing item", "A university education"], 1,
    "National defence is non-excludable (you cannot prevent any citizen from benefiting) and non-rivalrous (one person benefiting does not reduce the benefit to others)."),
  t(4, "### Problems of Public Sector Provisioning\n\nSA faces significant challenges in public sector delivery:\n\n1. **Corruption and state capture** \u2014 Misuse of public funds, irregular expenditure (Auditor-General reports billions annually)\n2. **Inefficiency** \u2014 Bloated bureaucracy, slow procurement processes\n3. **Load shedding** \u2014 Eskom failure to maintain and expand capacity\n4. **Service delivery protests** \u2014 Communities demanding basic services (water, sanitation, housing)\n5. **Brain drain** \u2014 Skilled professionals leaving the public sector for better pay elsewhere\n6. **Unfunded mandates** \u2014 Responsibilities given to municipalities without adequate funding\n7. **SOE bailouts** \u2014 Taxpayer money used to rescue failing state enterprises (Eskom, SAA)\n\nThe Public Finance Management Act (PFMA) and Municipal Finance Management Act (MFMA) aim to improve financial accountability."),
  fb(5, "The three spheres of government in SA are national, ___, and ___. Eskom is an example of a State-Owned ___.",
    ["provincial", "local", "Enterprise"],
    "SA has three spheres (not levels) of government. SOEs like Eskom are government-owned corporations."),
  t(6, "### Government Budgets and Fiscal Policy\n\nThe **National Budget** is presented annually by the Minister of Finance (usually in February).\n\n**Revenue sources:**\n- Personal income tax (largest source, ~38%)\n- VAT (~25%)\n- Company income tax (~16%)\n- Fuel levy, customs duties, excise duties\n\n**Expenditure priorities:**\n- Education (largest allocation, ~20%)\n- Social protection/grants (~16%)\n- Health (~12%)\n- Debt service costs (growing rapidly, ~15%)\n- Police, defence, infrastructure\n\n**Budget outcomes:**\n- **Budget surplus:** Revenue > Expenditure (rare in SA)\n- **Budget deficit:** Expenditure > Revenue (SA has run deficits for many years)\n- **National debt:** Accumulated deficits over time (SA debt-to-GDP ratio exceeded 70% by 2023)"),
  q(7, "What is the largest source of government revenue in South Africa?",
    ["VAT", "Company income tax", "Personal income tax", "Customs duties"], 2,
    "Personal income tax (PIT) is the largest revenue source, contributing approximately 38% of total tax revenue collected by SARS."),
  t(8, "### Fiscal Policy and the Laffer Curve\n\n**Fiscal policy** uses government spending and taxation to influence the economy.\n\n**Expansionary fiscal policy:** Increase spending and/or reduce taxes \u2192 stimulates aggregate demand\n**Contractionary fiscal policy:** Reduce spending and/or increase taxes \u2192 slows the economy\n\n**The Laffer Curve:**\nShows the relationship between tax rates and tax revenue:\n- At 0% tax rate \u2192 zero revenue\n- At 100% tax rate \u2192 zero revenue (no one works)\n- There is an **optimal tax rate** that maximises revenue\n- Beyond this point, higher rates discourage work and encourage tax evasion, reducing revenue\n\nThe Laffer Curve suggests that very high tax rates can be counterproductive. SA must balance the need for revenue with the risk of discouraging economic activity and driving tax emigration."),
  q(9, "According to the Laffer Curve, what happens when tax rates increase beyond the optimal point?",
    ["Tax revenue continues to increase", "Tax revenue decreases", "Tax revenue stays constant", "The economy always grows"], 1,
    "Beyond the optimal point, excessively high tax rates discourage work, encourage evasion, and reduce the tax base, leading to lower total revenue."),
  t(10, "### Public Sector Failure\n\nPublic sector failure occurs when government intervention makes outcomes worse rather than better:\n\n1. **Government failure** \u2014 Policies that create inefficiency or unintended consequences\n2. **Crowding out** \u2014 Government borrowing raises interest rates, reducing private investment\n3. **Regulatory capture** \u2014 Regulators serving the interests of the industries they regulate\n4. **Rent-seeking** \u2014 Using political connections to gain economic benefits (tenders, contracts)\n5. **Information failure** \u2014 Government may lack the information to make optimal decisions\n6. **Time lags** \u2014 Policies take time to implement and have delayed effects\n\n**SA examples:** Eskom monopoly leading to load shedding; tender fraud; SOE bailouts diverting funds from service delivery; debt-service costs crowding out social spending."),
  fb(11, "The relationship between tax rates and tax revenue is shown by the ___ Curve. When expenditure exceeds revenue, the government runs a budget ___.",
    ["Laffer", "deficit"],
    "The Laffer Curve shows that beyond an optimal point, higher tax rates reduce revenue. SA consistently runs budget deficits."),
];

// =============================================================================
// CHAPTER 4: International Trade and Foreign Exchange (Term 1)
// =============================================================================

blockNum = 0;
const ch4_lesson1 = [
  t(1, "## International Trade\n\n### Why Countries Trade\n\nNo country can produce everything it needs efficiently. Countries trade because of:\n\n1. **Unequal distribution of resources** \u2014 SA has gold and platinum; Saudi Arabia has oil\n2. **Differences in climate and geography** \u2014 SA grows citrus; Norway catches fish\n3. **Cost advantages** \u2014 Some countries produce goods more cheaply\n4. **Variety** \u2014 Trade gives consumers access to a wider range of goods\n5. **Economies of scale** \u2014 Producing for a larger market lowers per-unit costs\n6. **Technology transfer** \u2014 Trade facilitates the spread of knowledge and innovation\n\nSA major exports: minerals (gold, platinum, iron ore, coal), motor vehicles, fruit, wine\nSA major imports: crude oil, machinery, electronics, vehicles, pharmaceutical products"),
  t(2, "### Absolute and Comparative Advantage\n\n**Absolute advantage:** A country can produce a good using fewer resources than another country.\n\n**Comparative advantage** (David Ricardo): A country should specialise in producing goods where it has the **lowest opportunity cost**, even if it does not have an absolute advantage.\n\n**Example:**\n\n| Country | Cars per worker | Wine per worker |\n|---------|----------------|----------------|\n| SA | 2 | 6 |\n| Germany | 10 | 5 |\n\nGermany has an absolute advantage in cars. SA has an absolute advantage in wine.\n\nOpportunity costs:\n- SA: 1 car costs 3 wine; 1 wine costs 1/3 car\n- Germany: 1 car costs 0.5 wine; 1 wine costs 2 cars\n\nSA has a comparative advantage in wine (lower opportunity cost). Germany has a comparative advantage in cars. Both benefit if SA exports wine and Germany exports cars."),
  q(3, "Comparative advantage is based on:",
    ["Which country can produce the most output", "Which country has the lowest opportunity cost", "Which country has the most workers", "Which country charges the lowest price"], 1,
    "Comparative advantage is determined by which country has the lowest opportunity cost in producing a good, not the absolute quantity produced."),
  t(4, "### Balance of Payments (BOP)\n\nThe BOP records all economic transactions between SA and the rest of the world over a period.\n\n**Current account:**\n- Trade balance (exports - imports of goods)\n- Services balance (tourism, transport, insurance)\n- Income (dividends, interest earned abroad)\n- Current transfers (remittances, foreign aid)\n\n**Financial account:**\n- Direct investment (foreign firms building factories in SA)\n- Portfolio investment (foreign purchases of SA shares/bonds)\n- Other investment (loans)\n\n**BOP surplus:** More money flowing in than out (currency tends to strengthen)\n**BOP deficit:** More money flowing out than in (currency tends to weaken)\n\nSA has historically run a **current account deficit** (imports > exports) funded by capital inflows on the financial account."),
  fb(5, "The balance of payments has two main accounts: the ___ account and the ___ account. SA historically runs a current account ___.",
    ["current", "financial", "deficit"],
    "The current account records trade in goods and services. The financial account records investment flows."),
  t(6, "### The IMF and Correcting Disequilibria\n\nThe **International Monetary Fund (IMF)** was established in 1944 to:\n- Promote international monetary cooperation\n- Facilitate balanced growth of international trade\n- Provide temporary financial assistance to countries with BOP problems\n- Promote exchange rate stability\n\n**Correcting a BOP deficit:**\n1. **Expenditure-reducing policies** \u2014 Tight monetary/fiscal policy to reduce demand for imports\n2. **Expenditure-switching policies** \u2014 Devaluation/depreciation makes imports expensive and exports cheaper\n3. **Direct controls** \u2014 Tariffs, quotas, exchange controls\n4. **Structural reforms** \u2014 Improving productivity and competitiveness\n\nSA has used exchange controls historically (now largely relaxed) and relies primarily on market-determined exchange rates and monetary policy."),
  q(7, "Which organisation provides temporary financial assistance to countries with balance of payments problems?",
    ["World Bank", "IMF", "WTO", "United Nations"], 1,
    "The International Monetary Fund (IMF) provides financial assistance to member countries experiencing BOP difficulties, often with conditions for economic reform."),
  t(8, "### Foreign Exchange Markets\n\nThe foreign exchange (forex) market is where currencies are bought and sold.\n\n**Exchange rate determination:**\nSA uses a **free-floating exchange rate** \u2014 the rand value is determined by supply and demand.\n\n**Factors affecting the rand:**\n- Interest rate differentials (higher SA rates attract foreign investment)\n- Inflation differentials (lower inflation strengthens the currency)\n- Political stability and policy certainty\n- Commodity prices (SA is a commodity exporter)\n- Global risk appetite (risk-off sentiment weakens emerging market currencies)\n- Credit ratings (downgrades weaken the rand)\n\n**Appreciation:** Rand strengthens (e.g., R15/$1 \u2192 R14/$1) \u2192 imports cheaper, exports more expensive\n**Depreciation:** Rand weakens (e.g., R15/$1 \u2192 R18/$1) \u2192 imports expensive, exports cheaper"),
  q(9, "If the rand depreciates from R16/$1 to R19/$1, which of the following is true?",
    ["SA imports become cheaper", "SA exports become more competitive internationally", "Foreign tourists find SA more expensive", "SA importers benefit"], 1,
    "A weaker rand makes SA goods cheaper in foreign currency, boosting export competitiveness. However, imports become more expensive."),
  fb(10, "SA uses a free-___ exchange rate system. When the rand ___, imports become more expensive and exports become cheaper.",
    ["floating", "depreciates"],
    "A free-floating rate is determined by market supply and demand. Depreciation means each rand buys less foreign currency."),
];

// =============================================================================
// CHAPTER 5: Perfect Markets (Term 2)
// =============================================================================

blockNum = 0;
const ch5_lesson1 = [
  t(1, "## Perfect Competition\n\nA market structure describes the competitive environment in which firms operate. **Perfect competition** is a theoretical market structure that serves as a benchmark against which real-world markets are compared.\n\n### Characteristics of Perfect Competition\n\n1. **Many buyers and sellers** \u2014 No single firm can influence the market price\n2. **Homogeneous products** \u2014 Products are identical (e.g., wheat, maize)\n3. **Free entry and exit** \u2014 No barriers to entering or leaving the market\n4. **Perfect information** \u2014 All participants have complete knowledge of prices and quality\n5. **Price takers** \u2014 Firms must accept the market-determined price\n6. **No transport costs** \u2014 Products can be moved freely\n\nPerfect competition does not truly exist, but agricultural markets (maize, wheat) come closest in SA."),
  t(2, "### The Industry vs the Individual Firm\n\nIn perfect competition, we distinguish between the **industry** (all firms combined) and the **individual firm**.\n\n**The industry:**\n- Market price is determined by total supply and demand\n- The supply curve is the sum of all individual firms supply curves\n- Equilibrium price is where industry supply = industry demand\n\n**The individual firm:**\n- Is a price taker (accepts the market price)\n- The demand curve facing the firm is perfectly elastic (horizontal) at the market price\n- The firm can sell any quantity at the market price\n- AR (average revenue) = MR (marginal revenue) = Price\n\nThis is because the firm is too small relative to the market to affect the price by changing its output."),
  q(3, "In perfect competition, the demand curve facing an individual firm is:",
    ["Downward sloping", "Upward sloping", "Perfectly elastic (horizontal)", "Perfectly inelastic (vertical)"], 2,
    "Because the firm is a price taker, it can sell any quantity at the market price. The demand curve is therefore a horizontal line at the market price."),
  t(4, "### Output Decisions: Profits and Losses\n\nA firm maximises profit where **MR = MC** (marginal revenue equals marginal cost).\n\n**Economic profit** occurs when: Price > ATC (average total cost)\n- The firm earns above-normal returns\n- In the long run, new firms enter \u2192 supply increases \u2192 price falls \u2192 profits return to normal\n\n**Normal profit** occurs when: Price = ATC\n- The firm covers all costs including opportunity cost\n- No incentive for entry or exit\n\n**Economic loss** occurs when: Price < ATC\n- The firm does not cover all costs\n- In the long run, firms exit \u2192 supply decreases \u2192 price rises \u2192 losses eliminated\n\n**Shutdown rule:** A firm should shut down in the short run if: Price < AVC (average variable cost) \u2014 it cannot even cover its variable costs."),
  fb(5, "A firm in perfect competition maximises profit where ___ = MC. If price is below ATC but above AVC, the firm makes a ___ but continues to produce in the short run.",
    ["MR", "loss"],
    "MR = MC is the profit-maximising condition. A firm continues operating as long as it covers variable costs, even if making a loss."),
  t(6, "### Long-Run Equilibrium\n\nIn the long run, perfect competition leads to:\n\n**Allocative efficiency:** Price = MC \u2014 resources are allocated to produce what consumers want most\n**Productive efficiency:** Firms produce at minimum ATC \u2014 no waste\n**Normal profit only** \u2014 No economic profit or loss\n\nThis outcome is considered ideal for consumer welfare because:\n- Prices are as low as possible\n- Output is at the socially optimal level\n- There is no deadweight loss\n\nHowever, perfect competition has limitations:\n- No incentive for research and development (no economic profit)\n- Identical products mean no variety\n- In practice, barriers to entry always exist to some degree"),
  q(7, "In long-run equilibrium under perfect competition, firms earn:",
    ["Economic profit", "Normal profit only", "Economic loss", "Supernormal profit"], 1,
    "Free entry and exit ensures that in the long run, economic profits are competed away and losses are eliminated. Firms earn only normal profit (P = ATC)."),
  t(8, "### Competition Policy in SA\n\nSA competition policy aims to promote competitive markets and prevent anti-competitive behaviour.\n\n**Key institutions:**\n- **Competition Commission** \u2014 Investigates mergers and anti-competitive practices\n- **Competition Tribunal** \u2014 Adjudicates cases referred by the Commission\n- **Competition Appeal Court** \u2014 Hears appeals from the Tribunal\n\n**Key legislation:** Competition Act 89 of 1998\n\n**Types of anti-competitive behaviour:**\n- Price fixing (cartels)\n- Market allocation\n- Abuse of dominant position\n- Predatory pricing\n\n**Notable SA cases:**\n- Bread price-fixing cartel (Pioneer Foods, Tiger Brands fined)\n- Construction sector collusion (World Cup stadium contracts)\n- Banking sector inquiry into excessive fees"),
  q(9, "The Competition Commission in South Africa is responsible for:",
    ["Setting prices for all goods", "Investigating anti-competitive practices and mergers", "Collecting taxes from businesses", "Determining interest rates"], 1,
    "The Competition Commission investigates mergers, price fixing, cartels, and other anti-competitive behaviour to promote fair competition."),
  fb(10, "In long-run equilibrium, perfect competition achieves allocative efficiency (P = ___) and productive efficiency (firms produce at minimum ___). SA competition policy is governed by the Competition Act of ___.",
    ["MC", "ATC", "1998"],
    "P = MC means resources are optimally allocated. Minimum ATC means no productive waste. The Competition Act was passed in 1998."),
];

// =============================================================================
// CHAPTER 6: Imperfect Markets (Term 2)
// =============================================================================

blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Imperfect Markets\n\nMost real-world markets are imperfectly competitive. Imperfect markets deviate from perfect competition in various ways.\n\n### Monopoly\n\nA **monopoly** is a market with a single seller and no close substitutes.\n\n**Characteristics:**\n- Single seller controls the entire market\n- Unique product with no close substitutes\n- High barriers to entry (legal, natural, or strategic)\n- Price maker \u2014 the monopolist sets the price\n- Demand curve is the market demand curve (downward sloping)\n\n**Types of monopoly:**\n- **Natural monopoly** \u2014 One firm can supply the whole market at lower cost than two or more (e.g., Eskom for electricity transmission)\n- **Legal monopoly** \u2014 Government-granted exclusive rights (patents, licences)\n- **Strategic monopoly** \u2014 Created through mergers or anti-competitive behaviour"),
  t(2, "### Monopoly Output and Pricing\n\nA monopolist maximises profit where **MR = MC**, but unlike perfect competition:\n- Price is ABOVE marginal cost (P > MC)\n- Output is BELOW the socially optimal level\n- This creates a **deadweight loss** \u2014 a loss of economic welfare\n\n**Consequences of monopoly:**\n- Higher prices for consumers\n- Lower output than under competition\n- Potential for **X-inefficiency** (no competitive pressure to minimise costs)\n- Economic profit in the long run (barriers prevent entry)\n- May lead to **rent-seeking** behaviour\n\n**Advantages of monopoly:**\n- Economies of scale (lower average costs)\n- Profits can fund research and development\n- Natural monopolies avoid wasteful duplication of infrastructure\n\n**SA example:** Eskom holds a virtual monopoly on electricity generation (though IPPs are increasing)."),
  q(3, "A key characteristic of a monopoly is that the firm is a:",
    ["Price taker", "Price maker", "Quantity taker", "Cost minimiser"], 1,
    "A monopolist is a price maker because it is the sole supplier and can set the price by choosing its output level."),
  t(4, "### Oligopoly\n\nAn **oligopoly** is a market dominated by a few large firms.\n\n**Characteristics:**\n- Few large firms dominate\n- Products may be homogeneous (steel, cement) or differentiated (cars, cell phones)\n- High barriers to entry\n- **Interdependence** \u2014 Each firm considers rivals reactions when making decisions\n- **Non-price competition** \u2014 Advertising, branding, loyalty programmes\n\n**Behaviour in oligopoly:**\n- **Collusion** \u2014 Firms may secretly agree on prices (illegal cartel)\n- **Price leadership** \u2014 One dominant firm sets the price, others follow\n- **Kinked demand curve** \u2014 Firms are reluctant to change prices (competitors match price cuts but not increases)\n\n**SA examples:**\n- Banking: FNB, Standard Bank, Absa, Nedbank, Capitec dominate\n- Cell phones: Vodacom, MTN, Cell C, Telkom\n- Supermarkets: Shoprite/Checkers, Pick n Pay, Woolworths, Spar"),
  t(5, "### Duopoly\n\nA **duopoly** is a special case of oligopoly with exactly two dominant firms.\n\n**Key features:**\n- Extremely high interdependence between the two firms\n- Pricing and output decisions by one firm directly affect the other\n- May lead to collusion or intense competition\n\n**Models of duopoly behaviour:**\n- **Cournot model** \u2014 Each firm chooses output simultaneously, assuming the other firm output is fixed\n- **Bertrand model** \u2014 Each firm sets prices, leading to price competition\n- **Stackelberg model** \u2014 One firm (leader) moves first, the other (follower) responds\n\n**SA example:** Coca-Cola and Pepsi in the soft drink market; SAB (now AB InBev) and Heineken in beer."),
  q(6, "In an oligopoly, firms are interdependent. This means:",
    ["They cooperate on all decisions", "Each firm must consider how rivals will react to its decisions", "They always set the same price", "They ignore competitor behaviour"], 1,
    "Interdependence is the defining feature of oligopoly. Each firm strategic decision must account for the likely responses of its few competitors."),
  t(7, "### Monopolistic Competition\n\nMonopolistic competition combines features of both perfect competition and monopoly.\n\n**Characteristics:**\n- **Many firms** (but fewer than perfect competition)\n- **Differentiated products** \u2014 Similar but not identical (restaurants, clothing brands)\n- **Low barriers to entry and exit**\n- Some **price-making ability** due to product differentiation\n- Non-price competition (advertising, branding, service quality)\n\n**Short run:** Firms can earn economic profit or make losses\n**Long run:** Entry/exit drives profit to zero (only normal profit), similar to perfect competition\n\n**SA examples:** Restaurants, hair salons, clothing shops, guest houses, mechanics"),
  fb(8, "An oligopoly has ___ large firms. Monopolistic competition has many firms selling ___ products. A monopoly has a ___ seller.",
    ["few", "differentiated", "single"],
    "These are the key structural differences between the three imperfect market structures."),
  t(9, "### Comparison of Market Structures\n\n| Feature | Perfect competition | Monopolistic competition | Oligopoly | Monopoly |\n|---------|-------------------|------------------------|-----------|----------|\n| Number of firms | Very many | Many | Few | One |\n| Product | Homogeneous | Differentiated | Homogeneous or differentiated | Unique |\n| Barriers to entry | None | Low | High | Very high |\n| Price determination | Price taker | Some price-making power | Price leadership/interdependence | Price maker |\n| Long-run profit | Normal | Normal | Above normal possible | Above normal |\n| Examples (SA) | Agriculture | Restaurants | Banks, cell networks | Eskom |"),
  q(10, "Which market structure is most likely to result in the highest prices for consumers?",
    ["Perfect competition", "Monopolistic competition", "Oligopoly", "Monopoly"], 3,
    "A monopoly, with no competition and high barriers to entry, can charge the highest prices because consumers have no alternatives."),
];

// =============================================================================
// CHAPTER 7: Market Failures (Term 2)
// =============================================================================

blockNum = 0;
const ch7_lesson1 = [
  t(1, "## Market Failures\n\n### The Concept of Market Failure\n\n**Market failure** occurs when the free market fails to allocate resources efficiently, leading to a loss of economic welfare. The market outcome is not socially optimal.\n\n**Types of market failure:**\n\n1. **Public goods** \u2014 Non-excludable and non-rivalrous goods that the market will not provide (free-rider problem)\n2. **Externalities** \u2014 Costs or benefits that affect third parties not involved in the transaction\n3. **Merit and demerit goods** \u2014 Goods that are under- or over-consumed relative to the social optimum\n4. **Monopoly power** \u2014 Single firms restricting output and raising prices\n5. **Information failure** \u2014 Buyers or sellers lacking complete information\n6. **Inequality** \u2014 Markets may produce socially unacceptable distributions of income"),
  t(2, "### Externalities and Misallocation of Resources\n\n**Negative externalities** (external costs):\n- Pollution from factories affecting nearby communities\n- Traffic congestion from private car use\n- Noise from construction or mining\n- Social costs of alcohol and tobacco\n\n**Positive externalities** (external benefits):\n- Education benefits society (lower crime, higher productivity)\n- Healthcare (vaccination protects others through herd immunity)\n- Research and development benefits many beyond the innovator\n\n**The problem:** Private costs/benefits differ from social costs/benefits:\n- Goods with negative externalities are **overproduced** (price is too low)\n- Goods with positive externalities are **underproduced** (price is too high)\n\nGovernment can correct this through taxes (on negative externalities) and subsidies (on positive externalities)."),
  q(3, "A factory polluting a river that affects downstream farmers is an example of:",
    ["A positive externality", "A negative externality", "A public good", "A merit good"], 1,
    "The pollution is an external cost imposed on third parties (farmers) who are not involved in the factory production or sales."),
  t(4, "### Consequences of Market Failure\n\nWhen markets fail, the consequences include:\n\n1. **Overproduction of harmful goods** \u2014 Pollution, congestion, obesity-causing foods\n2. **Underproduction of beneficial goods** \u2014 Education, healthcare, public transport\n3. **Environmental degradation** \u2014 Deforestation, water pollution, biodiversity loss\n4. **Inequality** \u2014 Concentration of wealth, poverty traps\n5. **Inefficient resource allocation** \u2014 Resources not used where they generate the most value\n\n**SA context:**\n- Acid mine drainage polluting water sources in Gauteng\n- Deforestation for subsistence farming\n- Carbon emissions from coal-fired power stations\n- Under-investment in public education quality despite high spending"),
  fb(5, "Market failure occurs when the free market fails to allocate resources ___. Goods with negative externalities tend to be ___ by the market.",
    ["efficiently", "overproduced"],
    "Efficiency means resources are allocated to maximise social welfare. Negative externalities mean social cost exceeds private cost, so too much is produced."),
  t(6, "### Cost-Benefit Analysis\n\n**Cost-benefit analysis (CBA)** is a systematic approach to evaluating whether a project or policy should proceed by comparing total costs and total benefits.\n\n**Steps:**\n1. Identify all costs (private + external)\n2. Identify all benefits (private + external)\n3. Assign monetary values to costs and benefits\n4. Compare: If total benefits > total costs \u2192 proceed\n\n**Conserving vs using resources:**\n\n| Using resources | Conserving resources |\n|----------------|---------------------|\n| Creates jobs and income | Preserves biodiversity |\n| Generates tax revenue | Protects ecosystem services |\n| Supports economic growth | Maintains resources for future generations |\n| May cause pollution/depletion | Limits current economic opportunities |\n\n**SA example:** Mining in ecologically sensitive areas (Xolobeni titanium mine controversy) \u2014 economic benefits vs environmental and cultural costs."),
  q(7, "Cost-benefit analysis considers:",
    ["Only private costs and benefits", "Only social costs and benefits", "Both private and social (external) costs and benefits", "Only monetary costs"], 2,
    "CBA includes both private and external (social) costs and benefits to determine whether a project is worthwhile for society as a whole."),
  t(8, "### Public vs Private Expenditure\n\n**Public expenditure** (government spending):\n- Funded by taxes\n- Aims to correct market failures and provide public/merit goods\n- Subject to political processes and accountability\n- Examples: Schools, hospitals, roads, social grants, police\n\n**Private expenditure** (household and business spending):\n- Funded by private income and profits\n- Driven by self-interest and profit motive\n- Guided by market prices and demand\n- Examples: Groceries, clothing, entertainment, business investment\n\n**The debate:** Should government spend more (correcting market failures) or less (avoiding government failure, crowding out)?\n\nIn SA, public expenditure is approximately 33% of GDP \u2014 higher than many developing countries. Critics argue this crowds out private investment; supporters argue it is necessary to address deep inequality and poverty."),
  q(9, "Public expenditure differs from private expenditure in that public expenditure is:",
    ["Always more efficient", "Funded by taxation and aimed at correcting market failures", "Driven by the profit motive", "Always less than private expenditure"], 1,
    "Public expenditure is funded through taxes and borrowing, with the aim of providing public goods and correcting market failures, rather than maximising profit."),
  fb(10, "SA public expenditure is approximately ___% of GDP. Cost-benefit analysis compares total ___ with total costs to evaluate a project.",
    ["33", "benefits"],
    "Government spending as a share of GDP is a key indicator. CBA provides a framework for rational decision-making about resource use."),
];

// =============================================================================
// CHAPTER 8: Protectionism and Free Trade (Term 2)
// =============================================================================

blockNum = 0;
const ch8_lesson1 = [
  t(1, "## Protectionism and Free Trade\n\n### Protection vs Free Trade\n\n**Free trade:** International trade without government-imposed barriers. Goods and services move freely between countries based on comparative advantage.\n\n**Protectionism:** Government policies that restrict imports to protect domestic industries.\n\n**Instruments of protection:**\n\n| Instrument | Description |\n|-----------|-------------|\n| **Tariffs** | Taxes on imported goods (most common) |\n| **Quotas** | Limits on the quantity of imports |\n| **Subsidies** | Government payments to domestic producers to reduce costs |\n| **Embargoes** | Complete ban on trade with a country |\n| **Administrative barriers** | Excessive paperwork, health/safety regulations |\n| **Exchange controls** | Restrictions on currency conversion |"),
  t(2, "### Arguments For and Against Free Trade\n\n**Arguments for free trade:**\n- Increased consumer choice and lower prices\n- Promotes efficiency through competition\n- Exploits comparative advantage\n- Economies of scale from larger markets\n- Facilitates technology transfer\n- Encourages innovation\n\n**Arguments for protectionism:**\n- **Infant industry argument** \u2014 New industries need temporary protection to grow\n- **Job protection** \u2014 Preventing job losses in vulnerable sectors\n- **National security** \u2014 Maintaining strategic industries (defence, food)\n- **Anti-dumping** \u2014 Preventing foreign firms selling below cost to destroy local competitors\n- **Revenue** \u2014 Tariffs generate government income\n- **Balance of payments** \u2014 Reducing imports to correct a deficit\n\nIn SA, industries like clothing, textiles, and poultry have sought protection from cheap Chinese imports."),
  q(3, "The infant industry argument suggests that:",
    ["All industries should be permanently protected", "New industries need temporary protection until they can compete", "Only large industries need protection", "Protection always leads to efficiency"], 1,
    "The infant industry argument states that new domestic industries may need temporary protection from established foreign competitors until they achieve economies of scale and competitiveness."),
  t(4, "### Globalisation\n\nGlobalisation is the increasing integration of economies worldwide through trade, investment, technology, and cultural exchange.\n\n**Drivers of globalisation:**\n- Advances in transport and communication technology\n- Trade liberalisation (reduction of tariffs and barriers)\n- Growth of multinational corporations\n- Internet and digital commerce\n\n**Benefits for SA:**\n- Access to foreign investment\n- Technology and skills transfer\n- Wider export markets\n- Consumer choice\n\n**Challenges for SA:**\n- Competition from cheap imports (manufacturing job losses)\n- Vulnerability to global economic shocks\n- Capital flight during crises\n- Brain drain (skilled workers emigrating)\n- Widening inequality"),
  fb(5, "Tariffs are ___ on imported goods. The ___ industry argument suggests new industries need temporary protection. Globalisation is the increasing ___ of economies worldwide.",
    ["taxes", "infant", "integration"],
    "Tariffs are the most common form of trade protection. Infant industries may not survive without initial protection."),
  t(6, "### Trade Liberalisation and the WTO\n\nThe **World Trade Organisation (WTO)** promotes free trade by:\n- Setting rules for international trade\n- Resolving trade disputes between countries\n- Negotiating reductions in trade barriers\n- Monitoring national trade policies\n\nSA is a founding member of the WTO (1995).\n\n**Export promotion vs Import substitution:**\n\n| Export promotion | Import substitution |\n|-----------------|--------------------|\n| Encourage production for export markets | Produce locally what was previously imported |\n| Subsidise exporters, trade agreements | Protect with tariffs, quotas |\n| Examples: SA motor industry exports | SA clothing industry protection |\n| Exposes firms to global competition | May create inefficient, protected firms |\n\nSA has pursued a combination of both strategies, with the **Motor Industry Development Programme (MIDP)** and later the **Automotive Production and Development Programme (APDP)** being key export promotion successes."),
  q(7, "The WTO main function is to:",
    ["Provide loans to developing countries", "Promote free trade and resolve trade disputes", "Set exchange rates between countries", "Regulate multinational corporations"], 1,
    "The WTO sets the rules for international trade, facilitates trade negotiations, and resolves disputes between member countries."),
  t(8, "### Forms of Economic Integration\n\n| Level | Description | Example |\n|-------|-------------|---------|\n| **Free trade area** | No tariffs between members | SADC Free Trade Area |\n| **Customs union** | Free trade area + common external tariff | SACU (SA, Botswana, Lesotho, Eswatini, Namibia) |\n| **Common market** | Customs union + free movement of factors | EU (European Union) |\n| **Economic union** | Common market + harmonised economic policies | Eurozone |\n\n**African organisations:**\n- **AU (African Union)** \u2014 54 member states promoting unity and development. Agenda 2063 is Africa long-term vision.\n- **SADC** \u2014 Southern African Development Community (16 members). Promotes regional economic integration.\n- **NEPAD** \u2014 New Partnership for Africa Development. Focuses on infrastructure, agriculture, health, education.\n- **AfCFTA** \u2014 African Continental Free Trade Area (2021). Aims to create the largest free trade area by number of countries."),
  q(9, "SACU is an example of a:",
    ["Free trade area", "Customs union", "Common market", "Economic union"], 1,
    "SACU (Southern African Customs Union) is a customs union \u2014 member states have free trade between them and a common external tariff on imports from non-members."),
  fb(10, "The African Continental Free Trade Area is known by the abbreviation ___. SACU stands for Southern African ___ Union.",
    ["AfCFTA", "Customs"],
    "AfCFTA launched in 2021 and aims to boost intra-African trade. SACU is the oldest customs union in the world (1910)."),
];

// =============================================================================
// CHAPTER 9: Economic Growth and Development (Term 3)
// =============================================================================

blockNum = 0;
const ch9_lesson1 = [
  t(1, "## Economic Growth and Development\n\n### Growth vs Development\n\n**Economic growth:** An increase in real GDP over time. It is a **quantitative** measure \u2014 it tells us how much more the economy is producing.\n\n**Economic development:** An improvement in the quality of life and living standards of the population. It is a **qualitative** measure that includes:\n- Improved education and healthcare\n- Reduced poverty and inequality\n- Better infrastructure\n- Clean environment\n- Political freedom and human rights\n- Greater life expectancy\n\n**Key insight:** Growth does not automatically lead to development. SA has experienced periods of growth while poverty and inequality remained stubbornly high.\n\n**Example:** SA GDP may grow by 2%, but if this growth benefits only a small elite, most citizens see no improvement in their living standards."),
  t(2, "### Demand-Side vs Supply-Side Approaches\n\n**Demand-side approach (Keynesian):**\n- Government increases aggregate demand through spending and tax cuts\n- Works best during recessions (idle resources)\n- SA examples: Expanded Public Works Programme (EPWP), social grants, infrastructure spending\n\n**Limitations:** Can cause inflation if economy is at full capacity; increases government debt\n\n**Supply-side approach:**\n- Focuses on increasing the productive capacity of the economy\n- Reduce regulations, improve education, invest in infrastructure, promote innovation\n- SA examples: Special Economic Zones, skills development, Operation Vulindlela\n\n**Limitations:** Takes longer to show results; benefits may not be equally distributed\n\n**Evaluation:** Most economists agree that SA needs a combination of both \u2014 demand stimulus to address unemployment in the short run, and supply-side reforms for long-term growth."),
  q(3, "The key difference between economic growth and economic development is:",
    ["Growth is always faster than development", "Growth is quantitative while development is qualitative", "Development can occur without growth", "There is no difference"], 1,
    "Growth measures the increase in GDP (quantity of output), while development measures improvements in quality of life, including health, education, and living standards."),
  t(4, "### South Africa Development Endeavours\n\n**Key programmes:**\n\n1. **National Development Plan (NDP) 2030** \u2014 SA long-term vision to eliminate poverty and reduce inequality by 2030. Key targets: unemployment below 6%, GDP growth of 5.4% per year.\n\n2. **BBBEE (Broad-Based Black Economic Empowerment)** \u2014 Redressing apartheid-era economic exclusion through ownership, management, skills development, and procurement targets.\n\n3. **EPWP (Expanded Public Works Programme)** \u2014 Creates temporary jobs in infrastructure, environment, and social sectors.\n\n4. **Operation Vulindlela** \u2014 Joint initiative by Presidency and Treasury to fast-track structural reforms (energy, transport, water, digital communications).\n\n5. **Youth Employment Service (YES)** \u2014 Business-government partnership to create work experiences for unemployed youth.\n\n**Challenge:** SA unemployment remains above 30% (expanded definition above 40%), making the NDP 2030 targets extremely difficult to achieve."),
  fb(5, "The National Development Plan aims to eliminate ___ and reduce inequality by ___. BBBEE stands for Broad-Based ___ Economic Empowerment.",
    ["poverty", "2030", "Black"],
    "The NDP 2030 is SA overarching development framework. BBBEE aims to redress the economic legacy of apartheid."),
  t(6, "### The North-South Divide\n\nThe world is broadly divided into:\n\n**Developed countries (Global North):**\n- High GDP per capita, advanced infrastructure\n- Low poverty rates, high literacy, high life expectancy\n- Examples: USA, Germany, Japan, UK, Australia\n\n**Developing countries (Global South):**\n- Lower GDP per capita, inadequate infrastructure\n- Higher poverty, lower literacy, lower life expectancy\n- Examples: SA, Nigeria, India, Bangladesh, Brazil\n\n**Common characteristics of developing countries:**\n1. High population growth rates\n2. Low levels of industrialisation\n3. Dependence on primary sector (agriculture, mining)\n4. Low savings and investment rates\n5. High unemployment\n6. Inadequate healthcare and education systems\n7. Brain drain and skills shortages\n8. Corruption and weak institutions\n9. High inequality\n10. Debt burden"),
  q(7, "Which of the following is NOT a common characteristic of developing countries?",
    ["High population growth", "Dependence on primary sector", "Advanced industrial base", "High unemployment"], 2,
    "Developing countries typically have low levels of industrialisation, not advanced industrial bases. They often depend on primary sector activities like agriculture and mining."),
  t(8, "### Development Strategies\n\n**Methods used to promote development:**\n\n1. **Industrialisation** \u2014 Moving from primary to secondary/tertiary sectors\n2. **Foreign direct investment (FDI)** \u2014 Attracting foreign companies to invest in the country\n3. **Human capital development** \u2014 Education, training, healthcare\n4. **Land reform** \u2014 Redistributing land for productive use (highly contentious in SA)\n5. **Microfinance** \u2014 Small loans to entrepreneurs in poor communities\n6. **Foreign aid** \u2014 Assistance from developed countries or international organisations\n7. **Fair trade** \u2014 Ensuring producers in developing countries receive fair prices\n8. **Tourism development** \u2014 Leveraging natural and cultural assets\n\n**SA approach:** A mixed strategy combining industrialisation, FDI attraction, skills development, social grants, and infrastructure spending. The Economic Reconstruction and Recovery Plan (ERRP) post-COVID focuses on infrastructure, energy, and job creation."),
  q(9, "Which development strategy involves attracting foreign companies to invest directly in a country?",
    ["Foreign aid", "Fair trade", "Foreign direct investment (FDI)", "Import substitution"], 2,
    "FDI involves foreign companies establishing operations (factories, offices) in a country, bringing capital, technology, and jobs."),
  fb(10, "The North-South divide refers to the gap between ___ and developing countries. SA Economic Reconstruction and Recovery Plan focuses on infrastructure, ___, and job creation.",
    ["developed", "energy"],
    "The Global North represents developed nations and the Global South represents developing ones. ERRP targets SA key constraints."),
];

// =============================================================================
// CHAPTER 10: Industrial Development (Term 3)
// =============================================================================

blockNum = 0;
const ch10_lesson1 = [
  t(1, "## Industrial Development in South Africa\n\n### The Importance of Industrialisation\n\nIndustrialisation is the process of transforming an economy from primarily agricultural/mining to one based on manufacturing and services.\n\n**Benefits:**\n- Creates employment opportunities\n- Adds value to raw materials (beneficiation)\n- Reduces dependence on commodity exports\n- Generates higher incomes and tax revenue\n- Promotes technological development\n- Diversifies the economy\n\n**SA industrial history:**\n- Pre-1994: Protected, inward-looking industrialisation (import substitution)\n- Post-1994: Trade liberalisation exposed SA industry to global competition\n- Many manufacturing jobs lost as firms could not compete with imports\n- SA shifted towards services (finance, tourism) as key growth sectors"),
  t(2, "### South Africa Industrial Development Strategies\n\n**Key policies and programmes:**\n\n1. **Industrial Policy Action Plan (IPAP)** \u2014 Identifies priority sectors for industrial support\n2. **Special Economic Zones (SEZs)** \u2014 Designated areas with tax incentives and infrastructure to attract investment (e.g., Coega in Eastern Cape, Dube TradePort in KZN)\n3. **Automotive Production and Development Programme (APDP)** \u2014 Supports the motor industry through production incentives\n4. **Beneficiation strategy** \u2014 Processing raw materials locally rather than exporting them unprocessed (e.g., turning iron ore into steel)\n5. **Black Industrialists Programme** \u2014 Supporting black-owned manufacturing enterprises\n6. **Renewable energy (REIPPPP)** \u2014 Private investment in wind and solar power\n\n**Challenges:** Load shedding, transport infrastructure decay (Transnet), policy uncertainty, skills shortages, competition from Asian manufacturers."),
  q(3, "Beneficiation in South Africa refers to:",
    ["Importing finished goods", "Processing raw materials locally to add value before export", "Exporting raw materials directly", "Reducing industrial output"], 1,
    "Beneficiation means adding value to raw materials locally. For example, instead of exporting iron ore, SA would produce steel. This creates more jobs and earns more export revenue."),
  t(4, "### Regional Industrial Landscape\n\n**Major industrial regions in SA:**\n\n| Region | Key industries |\n|--------|----------------|\n| **Gauteng** (Johannesburg, Pretoria) | Financial services, manufacturing, mining headquarters |\n| **eThekwini** (Durban) | Automotive, petrochemical, port logistics, Toyota SA |\n| **Nelson Mandela Bay** (PE/Gqeberha) | Automotive (VW, Ford), Coega IDZ |\n| **Cape Town** | Tourism, tech sector, agriculture processing, film |\n| **Richards Bay** | Aluminium smelting (Hillside), mining exports |\n| **Secunda** | Petrochemicals (Sasol), coal-to-liquid fuels |\n\n**Spatial inequality:** Industrial activity is concentrated in Gauteng and coastal metros. Rural areas and former homelands remain underdeveloped. SEZs aim to spread industrial development more evenly."),
  fb(5, "Special ___ Zones offer tax incentives to attract investment. The Coega SEZ is located in the ___ Cape. Beneficiation means adding ___ to raw materials locally.",
    ["Economic", "Eastern", "value"],
    "SEZs provide infrastructure and tax benefits to attract industrial investment to specific regions."),
  t(6, "### South Africa Role in African Economic Development\n\n**SA is Africa largest and most industrialised economy and plays a key role in continental development:**\n\n**African Union (AU):**\n- SA is a member and has hosted the Pan-African Parliament in Midrand\n- Agenda 2063 is the AU long-term development framework\n- SA contributes to peacekeeping and conflict resolution\n\n**SADC (Southern African Development Community):**\n- SA is the dominant economy in the region\n- SADC Free Trade Area reduces trade barriers between 16 member states\n- SA trade with SADC has grown significantly since 1994\n- Infrastructure corridors (Maputo Corridor, North-South Corridor)\n\n**SACU (Southern African Customs Union):**\n- Oldest customs union in the world (1910)\n- SA, Botswana, Lesotho, Eswatini, Namibia\n- SA dominates trade within SACU (both exports and imports)"),
  q(7, "South Africa plays a dominant economic role in SADC because:",
    ["It is the smallest economy", "It is the largest and most industrialised economy in the region", "It does not trade with other SADC members", "It only exports agricultural products"], 1,
    "SA GDP is significantly larger than all other SADC members combined, making it the economic powerhouse of the region."),
  t(8, "### Appropriateness of SA Industrial Strategies\n\n**Successes:**\n- Automotive industry has become a major exporter (BMW, Mercedes, Toyota, VW all produce in SA)\n- Renewable energy programme attracted billions in investment\n- Financial services sector is world-class\n- Agricultural exports (wine, citrus, nuts) growing\n\n**Failures and challenges:**\n- Textile and clothing industry lost thousands of jobs to cheap imports\n- Eskom crisis undermines all industrial activity\n- Rail and port inefficiency (Transnet) hampers exports\n- Land reform uncertainty discourages agricultural investment\n- Youth unemployment remains above 60%\n- Skills mismatch between education output and industry needs\n\n**Way forward:** SA needs to focus on sectors where it has natural advantages (mining beneficiation, renewable energy, agriculture, tourism), while urgently fixing infrastructure (energy, transport, water) and improving education quality."),
  q(9, "Which industry is a notable success story of SA industrial policy?",
    ["Textile manufacturing", "Automotive industry", "Coal mining", "Retail sector"], 1,
    "The automotive sector, supported by MIDP and APDP incentives, has become one of SA top export earners, with multiple global manufacturers producing vehicles locally."),
  fb(10, "SA oldest customs union is ___ (formed in 1910). The AU long-term development framework is called Agenda ___.",
    ["SACU", "2063"],
    "SACU is the world oldest customs union. Agenda 2063 is the AU 50-year development plan launched in 2013."),
];

// =============================================================================
// CHAPTER 11: Economic and Social Indicators (Term 3)
// =============================================================================

blockNum = 0;
const ch11_lesson1 = [
  t(1, "## Economic and Social Indicators\n\n### Measuring Economic Performance\n\nEconomists use various indicators to assess how well an economy is performing:\n\n**Key economic indicators:**\n\n| Indicator | What it measures | SA status (approx.) |\n|-----------|-----------------|--------------------|\n| Real GDP growth | Change in output | ~1\u20132% (sluggish) |\n| Unemployment rate | Joblessness | ~33% (official) |\n| Inflation rate (CPI) | Price increases | ~5\u20136% |\n| Interest rate (repo) | Cost of borrowing | ~8% |\n| Exchange rate | Rand value | ~R18/$1 |\n| Gini coefficient | Income inequality | ~0.63 (very high) |\n| Debt-to-GDP ratio | Government debt burden | ~70%+ |\n| Current account balance | Trade position | Deficit |"),
  t(2, "### Money Supply and Banking\n\nThe **money supply** is the total amount of money circulating in the economy.\n\n**Categories of money supply:**\n- **M1** \u2014 Notes, coins, and demand deposits (cheque accounts)\n- **M2** \u2014 M1 + short-term deposits (savings accounts)\n- **M3** \u2014 M2 + long-term deposits (broadest measure)\n\n**The banking system:**\n- **SARB (South African Reserve Bank)** \u2014 Central bank, manages monetary policy, lender of last resort\n- **Commercial banks** \u2014 FNB, Standard Bank, Absa, Nedbank, Capitec (accept deposits, make loans)\n- **Investment banks** \u2014 Specialise in corporate finance, trading\n\n**How banks create money:**\nWhen a bank lends money, it creates new deposits. The **credit multiplier** = 1 / reserve ratio. If banks must keep 10% in reserve, the multiplier is 10 \u2014 a R100 deposit can support R1 000 in total deposits through successive lending."),
  q(3, "The broadest measure of money supply in South Africa is:",
    ["M1", "M2", "M3", "M0"], 2,
    "M3 includes notes, coins, demand deposits, short-term deposits, and long-term deposits \u2014 it is the broadest measure of money in the economy."),
  t(4, "### Interest Rates\n\nInterest rates are the price of borrowing money.\n\n**Key rates in SA:**\n- **Repo rate** \u2014 Rate at which SARB lends to commercial banks (the base rate)\n- **Prime rate** \u2014 Rate banks charge their best clients (usually repo + 3.5%)\n- **Lending rate** \u2014 Rate charged to ordinary borrowers (varies based on risk)\n\n**How interest rates affect the economy:**\n\n| Higher interest rates | Lower interest rates |\n|----------------------|---------------------|\n| Borrowing more expensive | Borrowing cheaper |\n| Saving more attractive | Saving less attractive |\n| Consumer spending falls | Consumer spending rises |\n| Rand tends to strengthen | Rand tends to weaken |\n| Inflation tends to fall | Inflation tends to rise |\n| Economic growth slows | Economic growth stimulated |\n\n**The SARB Monetary Policy Committee (MPC)** meets every two months to decide on the repo rate, guided by the inflation target of 3\u20136%."),
  fb(5, "The prime interest rate in SA is usually the ___ rate plus 3.5%. The MPC meets every ___ months to decide on interest rates. The broadest money supply measure is ___.",
    ["repo", "two", "M3"],
    "The repo rate is the base rate set by the SARB. Commercial banks add a margin (3.5%) to determine the prime rate."),
  t(6, "### Social Indicators\n\n**Human Development Index (HDI):**\nCombines three dimensions:\n1. Health (life expectancy at birth)\n2. Education (mean years of schooling and expected years of schooling)\n3. Income (GNI per capita)\n\nSA HDI is approximately 0.71 (medium human development) \u2014 lower than expected for its income level due to inequality, HIV/AIDS, and education quality.\n\n**Other social indicators:**\n- **Gini coefficient** (0 = perfect equality, 1 = perfect inequality) \u2014 SA at ~0.63 is one of the most unequal countries\n- **Poverty headcount** \u2014 Approximately 55% of SA population lives below the upper-bound poverty line\n- **Life expectancy** \u2014 ~65 years (impacted by HIV/AIDS)\n- **Literacy rate** \u2014 ~95% adult literacy\n- **Access to basic services** \u2014 Electricity (~85%), piped water (~80%), sanitation (~75%)"),
  q(7, "South Africa Gini coefficient of approximately 0.63 indicates:",
    ["Low inequality", "Moderate inequality", "Very high inequality", "Perfect equality"], 2,
    "A Gini coefficient of 0.63 indicates very high inequality. SA is one of the most unequal countries in the world, a legacy of apartheid spatial and economic policies."),
  t(8, "### Globalisation, the IMF, and World Bank\n\n**International Monetary Fund (IMF):**\n- Promotes global monetary cooperation\n- Provides financial assistance to countries with BOP problems\n- Conducts economic surveillance and policy advice\n- SA has not needed an IMF loan since the 1990s\n\n**World Bank:**\n- Provides loans and grants for development projects in developing countries\n- Focuses on poverty reduction, infrastructure, education, healthcare\n- SA receives World Bank support for specific projects\n\n**Impact of globalisation on SA:**\n- Increased trade and investment opportunities\n- Technology transfer and innovation\n- Vulnerability to global shocks (2008 crisis, COVID-19)\n- Competition destroying local industries\n- Capital flow volatility affecting the rand\n\nSA is a member of BRICS (Brazil, Russia, India, China, SA), G20, and the African Union \u2014 giving it a voice in global economic governance."),
  q(9, "The World Bank primarily focuses on:",
    ["Setting exchange rates", "Resolving trade disputes", "Providing loans for development projects", "Controlling inflation"], 2,
    "The World Bank provides financial and technical assistance to developing countries for projects aimed at reducing poverty and promoting sustainable development."),
  fb(10, "SA is a member of ___ (along with Brazil, Russia, India, and China). The HDI combines health, education, and ___ to measure development.",
    ["BRICS", "income"],
    "SA joined BRICS in 2010. The HDI is a composite measure that goes beyond GDP to capture broader human development."),
];

// =============================================================================
// CHAPTER 12: Inflation (Term 3)
// =============================================================================

blockNum = 0;
const ch12_lesson1 = [
  t(1, "## Inflation\n\n### The Concept of Inflation\n\n**Inflation** is a sustained increase in the general price level of goods and services over time. It reduces the purchasing power of money.\n\n**Key terms:**\n- **Inflation rate** \u2014 The percentage change in the price level over a period (usually 12 months)\n- **Consumer Price Index (CPI)** \u2014 Measures price changes for a basket of goods and services bought by typical households (Stats SA publishes this monthly)\n- **Producer Price Index (PPI)** \u2014 Measures price changes at the factory/farm gate level (leading indicator for CPI)\n- **Deflation** \u2014 A sustained decrease in the general price level\n- **Disinflation** \u2014 A decrease in the rate of inflation (prices still rising, but more slowly)\n- **Stagflation** \u2014 High inflation combined with high unemployment and stagnant growth"),
  t(2, "### Types of Inflation\n\n**Demand-pull inflation:**\n- Caused by excess aggregate demand (too much money chasing too few goods)\n- Occurs when the economy is near or at full capacity\n- Example: Excessive government spending or credit expansion\n\n**Cost-push inflation:**\n- Caused by increases in production costs\n- Firms pass higher costs onto consumers as higher prices\n- Causes: Rising oil prices, wage increases above productivity, rand depreciation (making imports expensive), drought\n\n**Imported inflation:**\n- Rising prices of imported goods due to currency depreciation or global price increases\n- SA is vulnerable because it imports oil (priced in US dollars)\n- A weak rand makes all imports more expensive\n\n**SA context:** SA inflation is driven by a mix of all three types. Food and fuel prices are particularly important for lower-income households."),
  q(3, "Stagflation refers to a situation where:",
    ["Prices are falling and growth is high", "High inflation occurs with high unemployment and stagnant growth", "Inflation is zero", "Only demand-pull inflation exists"], 1,
    "Stagflation is a particularly difficult problem because policies to reduce inflation (higher interest rates) worsen unemployment, and policies to boost growth worsen inflation."),
  t(4, "### Causes and Consequences of Inflation\n\n**Causes in SA:**\n- Administered prices (electricity, water, rates \u2014 Eskom tariff increases have been huge)\n- Rand depreciation (weak rand raises import costs)\n- Food prices (drought, climate change)\n- Fuel costs (global oil prices)\n- Wage demands above productivity\n- Government spending and deficit financing\n\n**Consequences:**\n1. **Reduced purchasing power** \u2014 Money buys less; hardest on the poor\n2. **Uncertainty** \u2014 Businesses hesitate to invest\n3. **Redistribution effects** \u2014 Debtors benefit (repay in cheaper rands); savers lose\n4. **Wage-price spiral** \u2014 Workers demand higher wages, firms raise prices\n5. **International competitiveness** \u2014 If SA inflation exceeds trading partners, exports become expensive\n6. **Menu costs** \u2014 Costs of frequently changing prices\n7. **Bracket creep** \u2014 Inflation pushes earners into higher tax brackets"),
  fb(5, "The CPI measures price changes for a basket of goods bought by typical ___. Demand-pull inflation is caused by excess aggregate ___ in the economy.",
    ["households", "demand"],
    "Stats SA calculates CPI monthly. Demand-pull inflation occurs when total spending exceeds total output."),
  t(6, "### Measures to Combat Inflation\n\n**Monetary policy (SARB):**\n- **Inflation targeting** \u2014 SARB targets CPI inflation of 3\u20136%\n- **Raising the repo rate** \u2014 Makes borrowing expensive, reduces spending, cools demand\n- **Open market operations** \u2014 Selling government bonds to reduce money supply\n- **Reserve requirements** \u2014 Requiring banks to hold more reserves, limiting lending\n\n**Fiscal policy (Treasury):**\n- Reducing government spending to lower demand\n- Not financing deficits by printing money\n- Efficient public spending to avoid waste\n\n**Supply-side measures:**\n- Improving productivity through education and technology\n- Reducing input costs (cheaper energy, better logistics)\n- Promoting competition (lower prices)\n- Exchange rate stability\n\n**SA challenge:** SARB must balance controlling inflation with supporting economic growth in an economy with 33%+ unemployment."),
  q(7, "The SARB inflation target range is:",
    ["0\u20133%", "3\u20136%", "4\u20137%", "5\u20138%"], 1,
    "The SARB targets consumer price inflation within the range of 3\u20136%. When inflation exceeds 6%, the MPC typically raises the repo rate."),
  t(8, "### The Phillips Curve\n\nThe **Phillips Curve** shows an inverse relationship between inflation and unemployment:\n\n- When unemployment is low \u2192 wages rise \u2192 costs increase \u2192 prices rise (higher inflation)\n- When unemployment is high \u2192 less wage pressure \u2192 costs stable \u2192 lower inflation\n\n**Short-run Phillips Curve:** The inverse relationship holds \u2014 policymakers can trade off lower unemployment for higher inflation.\n\n**Long-run Phillips Curve:** Vertical at the natural rate of unemployment \u2014 in the long run, there is no trade-off (expectations adjust).\n\n**SA problem:** SA appears to have both high inflation AND high unemployment simultaneously (stagflation), which contradicts the simple Phillips Curve. This is because SA unemployment is largely **structural** (skills mismatch, spatial inequality) rather than cyclical."),
  q(9, "The Phillips Curve traditionally shows:",
    ["A direct relationship between inflation and growth", "An inverse relationship between inflation and unemployment", "No relationship between inflation and unemployment", "A direct relationship between interest rates and growth"], 1,
    "The original Phillips Curve showed that when unemployment falls, inflation tends to rise (and vice versa). However, the long-run relationship is more complex."),
  fb(10, "The Phillips Curve shows an inverse relationship between ___ and unemployment. In the long run, the Phillips Curve is ___ at the natural rate of unemployment.",
    ["inflation", "vertical"],
    "In the short run there is a trade-off. In the long run, expectations adjust and the curve becomes vertical."),
  q(11, "Consumer inflation in SA is measured by the ___ while producer inflation is measured by the PPI. Which is published by Stats SA?",
    ["Both CPI and PPI", "Only CPI", "Only PPI", "Neither"], 0,
    "Stats SA publishes both the Consumer Price Index (CPI) and the Producer Price Index (PPI) on a monthly basis."),
];

// =============================================================================
// CHAPTER 13: Tourism (Term 3)
// =============================================================================

blockNum = 0;
const ch13_lesson1 = [
  t(1, "## Tourism\n\n### The Concept of Tourism\n\n**Tourism** involves people travelling to and staying in places outside their usual environment for leisure, business, or other purposes.\n\n**Types of tourism:**\n- **Domestic tourism** \u2014 SA residents travelling within SA\n- **International (inbound) tourism** \u2014 Foreign visitors coming to SA\n- **Outbound tourism** \u2014 SA residents travelling abroad\n\n**Types of tourists:**\n- Leisure tourists (holidays, sightseeing)\n- Business tourists (conferences, meetings)\n- Eco-tourists (nature-based experiences)\n- Cultural tourists (heritage, festivals, cuisine)\n- Medical tourists (healthcare procedures)\n- Adventure tourists (bungee jumping, shark diving, hiking)"),
  t(2, "### Reasons for Growth in Tourism\n\n**Global factors:**\n- Rising disposable incomes worldwide\n- Cheaper air travel (budget airlines)\n- Internet and social media marketing\n- Improved transport infrastructure\n- Greater cultural awareness and desire for new experiences\n\n**SA-specific factors:**\n- Post-1994 democratic transition opened SA to the world\n- Diverse natural beauty (Table Mountain, Kruger National Park, Garden Route, Drakensberg)\n- Rich cultural heritage and history (Robben Island, Apartheid Museum, Cradle of Humankind)\n- Weak rand makes SA affordable for foreign visitors\n- 2010 FIFA World Cup showcased SA globally\n- Good tourism infrastructure (hotels, game lodges, restaurants)\n- Pleasant climate and long coastline\n- Wine regions (Stellenbosch, Franschhoek)"),
  q(3, "Which of the following is a reason why a weak rand benefits SA tourism industry?",
    ["It makes SA more expensive for foreigners", "It makes SA more affordable for foreign visitors", "It discourages domestic tourism", "It has no effect on tourism"], 1,
    "When the rand is weak, foreign visitors get more rands for their currency, making SA accommodation, food, and activities cheaper for them."),
  t(4, "### Effects and Benefits of Tourism\n\n**Economic benefits:**\n- Creates jobs (hospitality, transport, guiding, crafts)\n- Generates foreign exchange earnings\n- Stimulates small business development\n- Increases government tax revenue\n- Multiplier effect (tourist spending circulates through the economy)\n- Infrastructure development benefits residents too\n\n**Social and cultural benefits:**\n- Preserves cultural heritage and traditions\n- Promotes cross-cultural understanding\n- Supports conservation (eco-tourism funds wildlife protection)\n\n**Costs/challenges:**\n- Seasonal employment (peak vs off-peak)\n- Environmental damage (littering, habitat disturbance)\n- Crime deters tourists\n- Infrastructure strain (water, roads)\n- Cultural commodification (traditions reduced to performances)\n- Leakage (profits leaving to foreign-owned hotel chains)\n\nTourism contributes approximately 3\u20134% of SA GDP and supports over 700 000 direct jobs."),
  fb(5, "Tourism contributes approximately ___% of SA GDP. The ___ effect means tourist spending circulates and creates additional income in the economy.",
    ["4", "multiplier"],
    "Tourism is a significant economic sector. The multiplier effect amplifies the impact of tourist spending throughout the economy.",
    ["Think about how money spent at a hotel flows to food suppliers, cleaners, and beyond."]),
  t(6, "### South Africa Tourism Profile and IKS\n\n**SA unique selling points:**\n- Big Five wildlife (lion, elephant, rhino, buffalo, leopard)\n- UNESCO World Heritage Sites (Robben Island, iSimangaliso, Cradle of Humankind, Mapungubwe)\n- Adventure tourism (shark cage diving, bungee jumping at Bloukrans Bridge)\n- Wine routes and gastronomy\n- Diverse cultures and 11 official languages\n\n**Indigenous Knowledge Systems (IKS) and tourism:**\n- Traditional healing practices and medicinal plants\n- San rock art (Drakensberg) \u2014 oldest art in southern Africa\n- Zulu, Xhosa, Sotho cultural villages and traditions\n- Traditional music, dance, and storytelling\n- Indigenous cuisine (biltong, potjiekos, umqombothi)\n- Craft markets (beadwork, pottery, weaving)\n\nIKS enriches the tourism experience and provides income for rural communities. However, it must be shared respectfully, with benefits flowing back to the communities."),
  q(7, "Which of the following is an example of Indigenous Knowledge Systems (IKS) contributing to tourism?",
    ["Imported luxury hotel chains", "San rock art tours in the Drakensberg", "International fast-food restaurants", "Foreign airline routes"], 1,
    "San rock art is an example of IKS that attracts tourists and showcases SA rich cultural heritage. The Drakensberg paintings are thousands of years old."),
  t(8, "### Tourism Policy Suggestions\n\n**To grow SA tourism sector:**\n\n1. **Safety and security** \u2014 Reduce crime (tourists perception of SA as unsafe is a major barrier)\n2. **Infrastructure** \u2014 Improve roads, airports, public transport\n3. **Marketing** \u2014 Brand SA campaigns targeting key markets (Europe, USA, Asia, Africa)\n4. **Skills development** \u2014 Hospitality training, language skills, guide qualifications\n5. **Visa reform** \u2014 Simplify visa processes for key tourist markets (e.g., e-visas)\n6. **Community-based tourism** \u2014 Ensure rural and township communities benefit\n7. **Sustainability** \u2014 Promote eco-tourism and responsible tourism practices\n8. **Domestic tourism** \u2014 Encourage South Africans to explore their own country (Sho't Left campaign)\n9. **SMME support** \u2014 Help small tourism businesses (guest houses, tour operators) with funding and training\n\nSA Tourism and the Department of Tourism lead national tourism policy and promotion."),
  q(9, "The biggest barrier to growing international tourism to SA is widely considered to be:",
    ["Lack of natural attractions", "High prices", "Safety and security concerns", "Too many airports"], 2,
    "Crime and safety perceptions remain the single biggest deterrent for international tourists considering SA as a destination."),
  fb(10, "SA unique wildlife offering is called the Big ___. The Sho't Left campaign promotes ___ tourism within SA.",
    ["Five", "domestic"],
    "The Big Five (lion, elephant, rhino, buffalo, leopard) are SA iconic wildlife attraction. Sho't Left encourages South Africans to travel locally."),
];

// =============================================================================
// CHAPTER 14: Environmental Sustainability (Term 3)
// =============================================================================

blockNum = 0;
const ch14_lesson1 = [
  t(1, "## Environmental Sustainability\n\n### The Concept of Sustainability\n\n**Sustainable development** is development that meets the needs of the present without compromising the ability of future generations to meet their own needs (Brundtland Commission, 1987).\n\n**Three pillars of sustainability:**\n1. **Economic** \u2014 Sustainable economic growth without depleting resources\n2. **Social** \u2014 Equitable access to resources, healthcare, education\n3. **Environmental** \u2014 Protecting ecosystems, biodiversity, and natural resources\n\n**The challenge:** Economic growth often comes at an environmental cost. SA relies heavily on coal for electricity (Eskom) and mining for exports \u2014 both environmentally damaging activities. Balancing economic development with environmental protection is one of SA greatest challenges."),
  t(2, "### State of the Environment\n\n**Global environmental challenges:**\n- **Climate change** \u2014 Rising temperatures due to greenhouse gas emissions (CO2, methane)\n- **Biodiversity loss** \u2014 Species extinction at unprecedented rates\n- **Deforestation** \u2014 Loss of forests for agriculture and development\n- **Water scarcity** \u2014 Growing demand, pollution, and climate change\n- **Pollution** \u2014 Air, water, and soil contamination\n- **Ozone depletion** \u2014 Thinning of the protective ozone layer\n\n**South Africa specific issues:**\n- Heavy reliance on coal (Eskom generates ~80% from coal)\n- Water scarcity (semi-arid country, 2018 Cape Town drought)\n- Acid mine drainage from old gold mines in Gauteng\n- Deforestation and land degradation\n- Poaching (rhino and elephant)\n- Waste management (illegal dumping, inadequate recycling)\n- Air pollution in industrial areas (Mpumalanga Highveld)"),
  q(3, "South Africa greatest environmental challenge related to energy is:",
    ["Too much wind energy", "Heavy reliance on coal-fired power stations", "Excessive solar panel waste", "Too many nuclear power stations"], 1,
    "SA depends on coal for approximately 80% of electricity generation. Eskom coal plants are among the largest CO2 emitters globally, contributing to climate change and local air pollution."),
  t(4, "### Measures to Ensure Sustainability\n\n**SA government measures:**\n1. **National Environmental Management Act (NEMA)** \u2014 Framework legislation for environmental protection\n2. **Carbon tax** \u2014 Introduced in 2019 to incentivise reduction in greenhouse gas emissions\n3. **Renewable Energy Independent Power Producer Procurement Programme (REIPPPP)** \u2014 Encouraging wind, solar, and other renewable energy\n4. **National Climate Change Response Policy** \u2014 SA climate adaptation and mitigation strategy\n5. **Working for Water programme** \u2014 Removing invasive alien plants to conserve water\n6. **Waste management legislation** \u2014 Extended producer responsibility for packaging, plastic bag levy\n\n**Private sector and civil society:**\n- Corporate sustainability reporting\n- Green building (GBCSA certifications)\n- Community-based natural resource management\n- Environmental education and awareness\n- Just Energy Transition (JET) \u2014 Transitioning from coal while protecting affected workers and communities"),
  fb(5, "Sustainable development meets the needs of the present without compromising ___ generations. SA introduced a ___ tax in 2019 to reduce greenhouse gas emissions.",
    ["future", "carbon"],
    "The Brundtland definition emphasises intergenerational equity. The carbon tax puts a price on pollution to incentivise cleaner production."),
  t(6, "### International Measures and Agreements\n\n**Key international agreements:**\n\n| Agreement | Year | Key provisions |\n|-----------|------|----------------|\n| **Kyoto Protocol** | 1997 | Binding emission reduction targets for developed countries |\n| **Paris Agreement** | 2015 | All countries commit to limit warming to 1.5\u20132\u00b0C above pre-industrial levels |\n| **Montreal Protocol** | 1987 | Phase-out of ozone-depleting substances (CFCs) |\n| **SDGs** | 2015 | 17 Sustainable Development Goals for 2030 |\n| **COP conferences** | Annual | Conference of the Parties to the UN climate convention |\n\n**SA commitments:**\n- SA signed the Paris Agreement and committed to peak, plateau, and decline emissions trajectory\n- SA hosted COP17 in Durban (2011)\n- Just Energy Transition Partnership (JETP) \u2014 $8.5 billion from developed nations to help SA transition from coal\n- SA National Determined Contribution (NDC) targets emission reductions by 2030"),
  q(7, "The Paris Agreement aims to limit global temperature rise to:",
    ["0.5\u00b0C", "1.5\u20132\u00b0C", "3\u20134\u00b0C", "5\u00b0C"], 1,
    "The Paris Agreement (2015) set the goal of limiting global warming to well below 2\u00b0C, preferably 1.5\u00b0C, compared to pre-industrial levels."),
  t(8, "### Global and Local Impact on South Africa\n\n**Climate change impacts on SA:**\n- Increased drought frequency and severity (Western Cape, Eastern Cape)\n- Higher temperatures (agriculture vulnerability)\n- Rising sea levels (coastal cities)\n- More extreme weather events (floods in KZN, 2022)\n- Water scarcity affecting food production and industry\n\n**Economic impacts:**\n- Agricultural output at risk (maize, wheat, fruit)\n- Insurance costs rising from extreme weather\n- Tourism potentially affected by environmental degradation\n- Energy transition costs (moving from coal to renewables)\n- Carbon border adjustment mechanisms (EU) could affect SA exports\n\n**Opportunities:**\n- SA has excellent solar and wind resources for renewable energy\n- Green economy could create new jobs (installation, maintenance, manufacturing)\n- Eco-tourism and sustainable agriculture markets growing\n- Carbon trading markets\n\nSA must balance the urgent need for economic growth and job creation with the imperative of environmental sustainability."),
  q(9, "The Just Energy Transition Partnership (JETP) for SA involves:",
    ["SA investing in new coal power stations", "Developed nations providing $8.5 billion to help SA transition from coal", "SA stopping all electricity generation", "Only private sector investment"], 1,
    "The JETP involves $8.5 billion from developed nations (USA, UK, EU, France, Germany) to help SA transition away from coal while managing social impacts on workers and communities."),
  fb(10, "The ___ Protocol (1987) successfully phased out ozone-depleting substances. SA was offered $8.5 billion through the ___ to transition from coal energy.",
    ["Montreal", "JETP"],
    "The Montreal Protocol is considered one of the most successful environmental agreements. JETP supports SA just energy transition."),
];

// =============================================================================
// CHAPTER 15: Revision and Exam Preparation (Term 4)
// =============================================================================

blockNum = 0;
const ch15_lesson1 = [
  t(1, "## Revision and Exam Preparation\n\n### NSC Economics Examination Structure\n\n**Paper 1: Macro-economics and Economic Pursuits (150 marks, 2 hours)**\n\n| Section | Format | Marks |\n|---------|--------|-------|\n| A | Short questions (multiple choice, matching, give term) | 30 |\n| B | Data response (answer questions based on given data/graphs) | 40 |\n| C | Essay questions (choose 2 from 3) | 80 |\n\n**Paper 1 topics:** Circular flow, business cycles, public sector, foreign exchange, economic growth and development, industrial development, economic indicators.\n\n**Paper 2: Micro-economics and Contemporary Issues (150 marks, 2 hours)**\n\n| Section | Format | Marks |\n|---------|--------|-------|\n| A | Short questions | 30 |\n| B | Data response | 40 |\n| C | Essay questions (choose 2 from 3) | 80 |\n\n**Paper 2 topics:** Perfect and imperfect markets, market failures, protectionism and free trade, inflation, tourism, environmental sustainability."),
  t(2, "### Key Economic Terms to Know\n\n| Term | Definition |\n|------|------------|\n| Aggregate demand | Total demand for goods and services in an economy |\n| Aggregate supply | Total supply of goods and services in an economy |\n| Autonomous consumption | Consumption that occurs regardless of income level |\n| Balance of payments | Record of all economic transactions with the rest of the world |\n| Budget deficit | Government expenditure exceeds revenue |\n| Comparative advantage | Ability to produce at a lower opportunity cost |\n| Crowding out | Government borrowing reduces private investment |\n| Deadweight loss | Loss of economic efficiency from monopoly or tax |\n| Depreciation (currency) | Fall in the value of the rand |\n| Fiscal policy | Government use of taxation and spending |\n| Gini coefficient | Measure of income inequality (0 to 1) |\n| Inflation targeting | SARB policy of keeping inflation within 3\u20136% |\n| Monetary policy | SARB use of interest rates and money supply |\n| Multiplier | Factor by which an injection increases national income |\n| Oligopoly | Market dominated by a few large firms |"),
  q(3, "A deadweight loss occurs when:",
    ["Markets are perfectly competitive", "There is a loss of economic efficiency, such as from monopoly or taxation", "Government revenue increases", "Consumers benefit from lower prices"], 1,
    "Deadweight loss represents the loss of total welfare that occurs when market outcomes are not allocatively efficient, such as under monopoly or excessive taxation."),
  t(4, "### Essential Graphs and Diagrams\n\n**Graphs you MUST be able to draw and explain:**\n\n1. **Supply and demand** \u2014 Equilibrium, shifts, surplus, shortage\n2. **Circular flow diagram** \u2014 Four-sector model with injections and leakages\n3. **Business cycle** \u2014 Phases around the trend line\n4. **Phillips Curve** \u2014 Short-run inverse relationship between inflation and unemployment\n5. **Laffer Curve** \u2014 Tax rate vs tax revenue (inverted U-shape)\n6. **Perfect competition** \u2014 Industry equilibrium and individual firm (P = MR = AR)\n7. **Monopoly** \u2014 MR below demand curve, profit-maximising output at MR = MC\n8. **Cost curves** \u2014 MC, ATC, AVC for the firm\n9. **Balance of payments** \u2014 Current account and financial account components\n10. **Externalities** \u2014 Social cost vs private cost, welfare loss/gain\n\n**Graph tips:** Label ALL axes, curves, equilibrium points, and shaded areas. Use arrows to show shifts. Write a brief explanation next to each graph."),
  fb(5, "Paper 1 covers ___-economics (150 marks). Paper 2 covers ___-economics and contemporary issues (150 marks). The essay section in each paper is worth ___ marks.",
    ["macro", "micro", "80"],
    "Paper 1 is macro (big picture: GDP, business cycles, public sector). Paper 2 is micro (markets, market failures) plus contemporary issues (inflation, tourism, environment)."),
  t(6, "### Essay Writing Tips\n\n**Structure for an 8-mark essay body paragraph:**\n1. State your point clearly (topic sentence)\n2. Explain the concept\n3. Give a relevant SA example\n4. Link back to the question\n\n**For a 40-mark essay (Section C):**\n- Introduction (define key terms, outline what you will discuss) \u2014 2\u20133 marks\n- Body (6\u20138 well-developed paragraphs) \u2014 up to 32 marks\n- Conclusion (summarise and give your own opinion/evaluation) \u2014 2 marks\n- Additional marks for insight, originality, and current examples \u2014 max 4 marks\n\n**Common mistakes:**\n- Not answering the actual question asked\n- Providing lists instead of explaining\n- Forgetting to include SA examples\n- Not drawing required graphs\n- Poor time management (spending too long on Section A)\n\n**Time allocation (2 hours = 120 minutes):**\n- Section A: 20 minutes\n- Section B: 30 minutes\n- Section C: 70 minutes (35 per essay)"),
  q(7, "In the NSC Economics exam, what is the maximum marks available for a Section C essay?",
    ["20 marks", "30 marks", "40 marks", "80 marks"], 2,
    "Each essay in Section C is worth 40 marks. You choose 2 from 3, making Section C worth 80 marks in total."),
  t(8, "### Quick Revision: Macro-economics (Paper 1)\n\n**Circular flow:** Four sectors \u2192 injections (I, G, X) and leakages (S, T, M) \u2192 equilibrium when I + G + X = S + T + M \u2192 multiplier k = 1/(1-MPC)\n\n**Business cycles:** Peak \u2192 contraction \u2192 trough \u2192 recovery. Counter-cyclical monetary (SARB) and fiscal (Treasury) policy.\n\n**Public sector:** Three spheres of government. Budget (revenue vs expenditure). Laffer Curve. SOE challenges.\n\n**International trade:** Comparative advantage. BOP (current + financial account). IMF. Free-floating rand. Appreciation vs depreciation.\n\n**Growth and development:** Growth (GDP) vs development (HDI). NDP 2030. North-South divide. BBBEE. EPWP.\n\n**Industrial development:** Beneficiation. SEZs. APDP. SA role in SADC/SACU/AU.\n\n**Economic indicators:** GDP, unemployment, inflation, interest rates, Gini coefficient. M1/M2/M3. SARB and MPC."),
  t(9, "### Quick Revision: Micro-economics and Contemporary (Paper 2)\n\n**Perfect competition:** Many firms, homogeneous product, price taker, P = MR = MC. Allocative + productive efficiency in long run.\n\n**Imperfect markets:** Monopoly (price maker, barriers, deadweight loss), oligopoly (few firms, interdependence, kinked demand), monopolistic competition (differentiated products, free entry).\n\n**Market failures:** Externalities, public goods, merit goods. CBA. Government intervention.\n\n**Protectionism and free trade:** Tariffs, quotas, subsidies. WTO. Infant industry argument. SADC, SACU, AU, AfCFTA. Globalisation.\n\n**Inflation:** CPI and PPI. Demand-pull, cost-push, imported. Phillips Curve. SARB targets 3\u20136%. Repo rate.\n\n**Tourism:** Types, benefits, challenges. Big Five. IKS. Safety concerns.\n\n**Environmental sustainability:** Climate change, Paris Agreement, JETP, carbon tax, NEMA, renewable energy."),
  q(10, "Which of the following is a supply-side policy to promote economic growth?",
    ["Increasing social grants", "Lowering the repo rate", "Investing in education and skills development", "Raising government spending on infrastructure only"], 2,
    "Supply-side policies aim to increase the productive capacity of the economy. Investing in education and skills development improves human capital and long-term productivity."),
  fb(11, "The SARB targets inflation between 3% and ___%. In perfect competition, long-run equilibrium price equals both marginal cost and average ___ cost.",
    ["6", "total"],
    "The inflation target band is 3\u20136%. In long-run equilibrium under perfect competition, P = MC = minimum ATC (allocative and productive efficiency)."),
];

// =============================================================================
// INSERT EVERYTHING
// =============================================================================

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or determine Grade 12 grade ID
  const gradeDoc = await db.collection('grades').findOne({ name: /12/i });
  const GRADE_ID = gradeDoc ? gradeDoc._id : new mongoose.Types.ObjectId('69d0c1241d8a9f6a83801642');
  console.log('Grade 12 ID:', String(GRADE_ID));

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
      title: 'Chapter 1: Circular Flow',
      description: 'Open vs closed economy, role players, injections and leakages, GDP/GDI/GDE, the multiplier.',
      order: 1,
      lessons: [
        { title: 'The Circular Flow Model and the Multiplier', description: 'Four-sector model, injections and leakages, MPC/MPS, GDP measurement, and the multiplier effect.', blocks: ch1_lesson1, term: 1 },
        { title: 'National Accounts and the Four-Sector Model', description: 'System of National Accounts, GDP at factor cost vs market prices, GNP, NNP, shortcomings of GDP.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Business Cycles',
      description: 'Phases, causes, types, monetary and fiscal policy responses, forecasting.',
      order: 2,
      lessons: [
        { title: 'Business Cycles and Policy Responses', description: 'Phases of the business cycle, causes, Kitchin/Juglar/Kondratieff cycles, counter-cyclical policy, and the new economic paradigm.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Public Sector',
      description: 'Composition, budgets, fiscal policy, Laffer Curve, public sector failure.',
      order: 3,
      lessons: [
        { title: 'The Public Sector and Fiscal Policy', description: 'Three spheres of government, SOEs, government budgets, revenue and expenditure, the Laffer Curve, and public sector failure.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: International Trade and Foreign Exchange',
      description: 'Comparative advantage, balance of payments, IMF, exchange rate determination.',
      order: 4,
      lessons: [
        { title: 'International Trade and Foreign Exchange Markets', description: 'Reasons for trade, absolute and comparative advantage, balance of payments, IMF, forex markets, and exchange rate determination.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Perfect Markets',
      description: 'Perfect competition, market structure, output decisions, competition policy.',
      order: 5,
      lessons: [
        { title: 'Perfect Competition and Competition Policy', description: 'Characteristics of perfect competition, price takers, profit maximisation, long-run equilibrium, and SA competition policy.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Imperfect Markets',
      description: 'Monopoly, oligopoly, duopoly, monopolistic competition, market structures comparison.',
      order: 6,
      lessons: [
        { title: 'Imperfect Market Structures', description: 'Monopoly, oligopoly, duopoly, monopolistic competition, and comparison of all market structures.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Market Failures',
      description: 'Externalities, public goods, cost-benefit analysis, public vs private expenditure.',
      order: 7,
      lessons: [
        { title: 'Market Failures and Government Intervention', description: 'Types of market failure, externalities, misallocation of resources, cost-benefit analysis, and public vs private expenditure.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Protectionism and Free Trade',
      description: 'Trade protection, globalisation, WTO, economic integration, AU, SADC.',
      order: 8,
      lessons: [
        { title: 'Protectionism, Free Trade, and Economic Integration', description: 'Trade barriers, arguments for and against free trade, globalisation, WTO, export promotion, and African economic organisations.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Economic Growth and Development',
      description: 'Growth vs development, demand/supply side approaches, North-South divide, development strategies.',
      order: 9,
      lessons: [
        { title: 'Economic Growth, Development, and SA Endeavours', description: 'Growth vs development, policy approaches, NDP 2030, the North-South divide, and development strategies.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Industrial Development',
      description: 'SA industrial strategies, regional landscape, SA role in Africa.',
      order: 10,
      lessons: [
        { title: 'Industrial Development and SA Role in Africa', description: 'Industrialisation, beneficiation, SEZs, APDP, SA industrial regions, and SA role in SADC/SACU/AU.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Economic and Social Indicators',
      description: 'Economic indicators, money supply, interest rates, globalisation, IMF/World Bank.',
      order: 11,
      lessons: [
        { title: 'Economic and Social Performance Indicators', description: 'Key economic indicators, money supply, banking system, interest rates, HDI, Gini coefficient, and global institutions.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Inflation',
      description: 'Types, causes, consequences, Phillips Curve, measures to combat inflation.',
      order: 12,
      lessons: [
        { title: 'Inflation and the Phillips Curve', description: 'Types of inflation, causes, consequences, SARB inflation targeting, measures to combat inflation, and the Phillips Curve.', blocks: ch12_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 13: Tourism',
      description: 'Tourism concept, growth, effects, SA profile, IKS, policy suggestions.',
      order: 13,
      lessons: [
        { title: 'Tourism in South Africa', description: 'Types of tourism, reasons for growth, economic and social effects, IKS, and tourism policy suggestions.', blocks: ch13_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 14: Environmental Sustainability',
      description: 'Sustainability, state of the environment, international agreements, SA impact.',
      order: 14,
      lessons: [
        { title: 'Environmental Sustainability and Climate Change', description: 'Sustainable development, environmental challenges, SA measures, international agreements, and the Just Energy Transition.', blocks: ch14_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 15: Revision and Exam Preparation',
      description: 'Exam structure, key terms, essential graphs, study and essay-writing tips.',
      order: 15,
      lessons: [
        { title: 'Revision and Exam Preparation', description: 'NSC exam structure, key economic terms, essential graphs, essay writing tips, and quick revision summaries.', blocks: ch15_lesson1, term: 4 },
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
    title: 'Grade 12 Economics \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Macro-economics, Micro-economics, and Contemporary Economic Issues for the Grade 12 Economics NSC examination.',
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
  console.log('  TEXTBOOK: Grade 12 Economics');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
