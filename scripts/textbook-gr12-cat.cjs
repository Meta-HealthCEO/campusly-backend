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

// =============================================================================
// CHAPTER 1: Systems Technologies - General Concepts (Term 1)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## Types of Computers\n\nComputers come in many forms, each suited to different environments and tasks. In South Africa, understanding these categories helps you recommend the right device for a home office, a school, or a large business.\n\n### Personal Computers\n\n| Type | Typical Use |\n|------|-------------|\n| **Desktop PC** | Office work, gaming, graphic design |\n| **Laptop / Notebook** | Portable work, students, travelling professionals |\n| **Tablet** | Browsing, reading, presentations, light productivity |\n| **All-in-one** | Home use where space is limited (monitor + system unit combined) |\n\n### SOHO Computers (Small Office / Home Office)\n\nA SOHO setup typically includes a mid-range desktop or laptop, a multifunction printer (print, scan, copy), an internet router, and a small UPS (uninterruptible power supply) to handle South African load-shedding.'),
  t(2, '### Mobile Devices\n\nMobile computing has transformed how South Africans access information. Many learners do homework on smartphones because they are more affordable than laptops.\n\n| Device | Key Features |\n|--------|-------------|\n| **Smartphone** | Calls, apps, camera, GPS, mobile data |\n| **Tablet** | Larger screen, stylus support, longer battery |\n| **Smartwatch / Wearable** | Fitness tracking, notifications, contactless payments |\n| **E-reader** | Optimised for reading with e-ink display |\n\n### Convergence\n\n**Convergence** means combining multiple technologies into a single device. A modern smartphone is a converged device because it replaces a camera, GPS navigator, music player, calculator, voice recorder, torch, and computer.\n\nExamples of convergence in South Africa:\n- Using your phone to make EFT payments (banking app)\n- A smart TV that streams Netflix, browses the web, and runs apps\n- A multifunction printer that prints, scans, copies, and faxes'),
  q(3, 'Which of the following BEST describes convergence?',
    ['Combining several technologies into one device', 'Connecting computers in a network', 'Converting analogue signals to digital', 'Upgrading hardware components'], 0,
    'Convergence is the merging of multiple technologies or functions into a single device, such as a smartphone that includes a camera, GPS, and computer.'),
  t(4, '### The Role and Use of Data\n\nIn the digital age, data drives decision-making across every sector.\n\n**Data vs Information:**\n- **Data** consists of raw, unprocessed facts (e.g., numbers, text, images)\n- **Information** is data that has been processed and given meaning (e.g., a sales report)\n\n**Information Management** is the process of collecting, organising, storing, retrieving, and distributing information efficiently.\n\nIn a South African school context:\n- Learner marks (data) are processed into a report card (information)\n- Attendance registers (data) are analysed to identify at-risk learners (information)\n- A tuck shop records daily sales (data) and produces a monthly profit summary (information)'),
  q(5, 'A school captures attendance every morning. This raw attendance data becomes information when it is:',
    ['Processed into a report showing absent trends per grade', 'Saved in a spreadsheet', 'Printed on paper', 'Entered by the teacher'], 0,
    'Data becomes information when it is processed and given context or meaning. Simply storing or printing raw data does not make it information.'),
  fb(6, 'Raw, unprocessed facts are called ___. When data is processed and given meaning, it becomes ___.',
    ['data', 'information'],
    'Data is raw and unprocessed. Information is data that has been organised and interpreted to have meaning.'),
  t(7, '### Input and Output Devices\n\nNew technologies continually improve how we interact with computers.\n\n**Modern Input Devices:**\n\n| Device | Description |\n|--------|-------------|\n| **Multi-touch screen** | Detects multiple finger gestures simultaneously (pinch, swipe, rotate) |\n| **Stylus / Digital pen** | Precision input for drawing, note-taking on tablets |\n| **Biometric scanner** | Fingerprint, face, or iris recognition for security |\n| **Voice input (microphone)** | Used with speech recognition software |\n| **Barcode / QR scanner** | Reads product codes or links (e.g., scanning for COVID-19 check-in) |\n\n**Modern Output Devices:**\n\n| Device | Description |\n|--------|-------------|\n| **HDMI display** | High-Definition Multimedia Interface carries video and audio in one cable |\n| **3D printer** | Creates physical objects layer by layer from a digital design |\n| **Projector** | Displays large images for presentations or classrooms |\n| **Speakers / Headphones** | Audio output for media, calls, and accessibility |'),
  q(8, 'A 3D printer is classified as a(n):',
    ['Output device', 'Input device', 'Storage device', 'Processing device'], 0,
    'A 3D printer produces a physical output (a 3D object) from a digital design, making it an output device.'),
  t(9, '### Display Devices\n\nDisplay technology has advanced significantly. Understanding these helps when advising on purchases.\n\n| Technology | Description |\n|-----------|-------------|\n| **LCD (Liquid Crystal Display)** | Uses liquid crystals and a backlight. Common in monitors and TVs |\n| **LED** | An LCD screen that uses LED backlighting for better brightness and energy efficiency |\n| **OLED (Organic LED)** | Each pixel produces its own light, giving true blacks and vivid colours |\n| **AMOLED** | Active Matrix OLED, used in premium smartphones |\n| **4K / UHD** | Resolution of 3840 x 2160 pixels (four times Full HD) |\n| **Touchscreen** | Display that also serves as an input device |\n\n**Factors when choosing a display:**\n- **Resolution** (higher = sharper image)\n- **Screen size** (measured diagonally in inches)\n- **Refresh rate** (60 Hz, 120 Hz, 144 Hz for gaming)\n- **Response time** (lower = less motion blur)\n- **Panel type** (IPS for colour accuracy, TN for speed, VA for contrast)'),
  q(10, 'Which display technology produces true blacks because each pixel emits its own light?',
    ['OLED', 'LCD', 'LED', 'TN'], 0,
    'OLED (Organic Light Emitting Diode) pixels emit their own light and can be turned off completely, producing true black.'),
  fb(11, 'HDMI stands for High-Definition ___ Interface. It carries both ___ and audio signals.',
    ['Multimedia', 'video'],
    'HDMI stands for High-Definition Multimedia Interface and transmits both video and audio through a single cable.'),
];

// =============================================================================
// CHAPTER 2: Systems Technologies - Hardware (Term 1)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Storage Devices\n\nStorage devices keep your data safe when the computer is switched off. Understanding storage is crucial for managing files and making purchase decisions.\n\n### Types of Storage\n\n| Type | Examples | How It Works |\n|------|----------|-------------|\n| **Magnetic** | HDD (Hard Disk Drive) | Spinning platters with a read/write head |\n| **Solid State** | SSD, USB flash drive, SD card | No moving parts; uses flash memory chips |\n| **Optical** | CD, DVD, Blu-ray | Laser reads/writes data on a disc |\n| **Cloud** | Google Drive, OneDrive, Dropbox | Data stored on remote servers accessed via internet |\n\n### SSD vs HDD\n\n| Feature | SSD | HDD |\n|---------|-----|-----|\n| Speed | Very fast (500+ MB/s) | Slower (80-160 MB/s) |\n| Durability | No moving parts, shock resistant | Fragile spinning platters |\n| Noise | Silent | Audible spinning/clicking |\n| Power usage | Low | Higher |\n| Price per GB | More expensive | Cheaper |\n| Lifespan | Limited write cycles | Mechanical wear |'),
  t(2, '### Card Readers and Portable Storage\n\nA **card reader** is a device (built-in or external USB) that reads memory cards such as:\n- **SD / microSD** cards (cameras, phones, Raspberry Pi)\n- **CompactFlash** (professional cameras)\n- **Memory Stick** (older Sony devices)\n\n**Why card readers matter:**\n- Transfer photos from a camera to a computer\n- Expand storage on laptops without an internal drive upgrade\n- Share files between devices quickly\n\n### Storage Capacity Guide\n\n| Unit | Size | Example |\n|------|------|---------|\n| 1 KB | 1 024 bytes | A short text message |\n| 1 MB | 1 024 KB | A high-resolution photo |\n| 1 GB | 1 024 MB | About 250 MP3 songs |\n| 1 TB | 1 024 GB | About 500 hours of video |'),
  q(3, 'Which storage device has no moving parts and is therefore more resistant to physical shock?',
    ['SSD', 'HDD', 'CD-ROM', 'Floppy disk'], 0,
    'An SSD (Solid State Drive) uses flash memory chips with no moving parts, making it more durable and shock-resistant than an HDD.'),
  t(4, '## Factors Influencing Computer Performance\n\nWhen a computer runs slowly, understanding the cause helps you troubleshoot effectively.\n\n| Factor | Effect on Performance |\n|--------|----------------------|\n| **Processor (CPU) speed** | Faster GHz = quicker calculations |\n| **Number of cores** | More cores = better multitasking |\n| **RAM (memory)** | More RAM = more programs open simultaneously |\n| **Storage type** | SSD boots and loads programs much faster than HDD |\n| **Graphics card (GPU)** | Dedicated GPU improves gaming, video editing |\n| **Available disk space** | Less than 10% free space slows the system |\n| **Background programs** | Too many running programs consume CPU and RAM |\n| **Malware / viruses** | Can consume resources and slow performance |\n| **Fragmentation (HDD)** | Scattered file fragments slow down reading |\n| **Operating system updates** | Outdated OS may have performance bugs |'),
  q(5, 'A user complains their computer is slow. Task Manager shows 95% RAM usage. The BEST upgrade would be:',
    ['Install more RAM', 'Replace the monitor', 'Add a second hard drive', 'Install a faster printer'], 0,
    'When RAM usage is consistently at or near 100%, adding more RAM allows the system to handle more programs without relying on slower virtual memory (swap file).'),
  fb(6, 'The CPU speed is measured in ___. More ___ allow a CPU to handle multiple tasks simultaneously.',
    ['GHz', 'cores'],
    'CPU speed is measured in gigahertz (GHz). Multiple cores enable parallel processing of tasks.'),
  t(7, '## Troubleshooting Common Problems\n\nBasic troubleshooting saves time and money. Follow a systematic approach.\n\n### Common Issues and Solutions\n\n| Problem | Possible Cause | Solution |\n|---------|---------------|----------|\n| Computer will not start | Power cable loose, PSU failure | Check connections, test with another cable |\n| Blue screen / crash | Driver conflict, faulty RAM | Update drivers, run memory diagnostic |\n| Slow performance | Too many startup programs | Disable unnecessary startup items in Task Manager |\n| No internet | Router issue, cable unplugged | Restart router, check cables, run network troubleshooter |\n| Printer not working | Offline, out of paper/ink, driver issue | Set printer online, replace consumables, update driver |\n| No display | Loose cable, wrong input source | Re-seat HDMI/VGA cable, select correct input on monitor |\n\n### New Technologies\n\nTechnology evolves rapidly. Current trends include:\n- **NVMe SSDs** (faster than SATA SSDs, connect directly to the motherboard)\n- **USB-C / Thunderbolt** (high-speed, reversible connector for data, video, and charging)\n- **Wi-Fi 6 / 6E** (faster wireless speeds and better handling of many devices)\n- **DDR5 RAM** (faster and more efficient than DDR4)'),
  q(8, 'A user reports that their laptop screen is blank but the power light is on. What should you check FIRST?',
    ['Whether an external monitor is set as primary display or brightness is turned down', 'Whether the hard drive is full', 'Whether the printer is connected', 'Whether the speakers work'], 0,
    'A blank screen with power on often means the display output is set incorrectly (e.g., external monitor mode) or the brightness is at zero. These are the simplest causes to rule out first.'),
  t(9, '## Software Concepts\n\nSoftware makes hardware useful. It can be broadly divided into system software and application software.\n\n### How Software Enhances Productivity\n\n| Category | Examples | Benefit |\n|----------|---------|--------|\n| **Accessibility** | Screen readers, magnifiers, voice control, on-screen keyboard | Enables people with disabilities to use computers |\n| **Efficiency** | Macros in Excel, templates in Word, keyboard shortcuts | Reduces repetitive tasks |\n| **Productivity** | Office suites, project management tools, cloud collaboration | Enables teamwork and output |\n\n### Web-based vs Installed Applications\n\n| Feature | Web-based (e.g., Google Docs) | Installed (e.g., MS Office) |\n|---------|-------------------------------|----------------------------|\n| Installation | None (runs in browser) | Must be installed on device |\n| Internet needed | Yes (mostly) | No (works offline) |\n| Updates | Automatic (server-side) | Manual or scheduled |\n| Storage | Cloud | Local |\n| Cost | Often free or subscription | Purchase or subscription |\n| Performance | Depends on connection | Depends on hardware |\n| Collaboration | Real-time sharing built in | Requires extra tools |'),
  q(10, 'A teacher in a rural South African school with unreliable internet needs to create a test. Which option is MOST suitable?',
    ['An installed word processor like LibreOffice Writer', 'Google Docs in a web browser', 'An online quiz tool', 'A cloud-based spreadsheet'], 0,
    'With unreliable internet, an installed (offline) application is the most reliable choice. Web-based tools require a stable connection.'),
  t(11, '### System Requirements and Upgrades\n\n**System requirements** are the minimum hardware and software specifications needed to run a program.\n\nExample system requirements for a modern application:\n\n| Component | Minimum | Recommended |\n|-----------|---------|-------------|\n| OS | Windows 10 64-bit | Windows 11 64-bit |\n| CPU | Intel i3 or equivalent | Intel i5 or better |\n| RAM | 4 GB | 8 GB |\n| Storage | 2 GB free space | SSD with 5 GB free |\n| Graphics | Integrated | Dedicated GPU |\n\n**When to upgrade vs buy new:**\n- Upgrade RAM or swap HDD for SSD if the CPU is still adequate\n- Buy new if the motherboard or CPU is too old to support modern software\n- Always check compatibility (e.g., DDR4 RAM will not fit in a DDR3 slot)'),
  fb(12, 'The ___ requirements tell you the minimum hardware needed to run software. Replacing an HDD with an ___ is one of the most effective upgrades for speed.',
    ['system', 'SSD'],
    'System requirements specify the minimum hardware and software needed. An SSD dramatically improves boot and load times compared to an HDD.'),
];

// =============================================================================
// CHAPTER 3: Network Technologies (Term 2)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## Wide Area Networks (WAN)\n\nA **WAN** connects computers over a large geographical area, such as across cities, provinces, or countries.\n\n### WAN vs LAN\n\n| Feature | LAN | WAN |\n|---------|-----|-----|\n| **Area** | Single building or campus | Cities, countries, worldwide |\n| **Speed** | Very fast (1 Gbps+) | Varies (slower due to distance) |\n| **Ownership** | Private (owned by organisation) | Often uses public infrastructure |\n| **Cost** | Lower setup cost | Higher (leased lines, ISP fees) |\n| **Example** | School computer lab network | The Internet |\n\n### The Internet as a WAN\n\nThe **Internet** is the largest WAN in the world. It connects billions of devices using standardised protocols (TCP/IP). In South Africa, major ISPs (Internet Service Providers) include Telkom, Vodacom, MTN, and Rain.\n\n**How you connect to the Internet:**\n- **Fibre** (fastest, available in urban areas)\n- **LTE / 5G** (wireless, good for areas without fibre)\n- **ADSL** (older, uses telephone lines)\n- **Satellite** (for remote/rural areas, higher latency)'),
  t(2, '### Internet Services\n\nThe Internet provides many services beyond browsing websites.\n\n| Service | Description | Example |\n|---------|-------------|--------|\n| **WWW** | Web pages accessed via browsers | www.gov.za |\n| **Email** | Electronic messages | Gmail, Outlook |\n| **FTP** | File Transfer Protocol for uploading/downloading files | Uploading a website to a server |\n| **VoIP** | Voice over Internet Protocol (calls via internet) | WhatsApp calls, Zoom |\n| **Streaming** | Real-time audio/video delivery | YouTube, Spotify, DSTV Now |\n| **Cloud storage** | Storing files on remote servers | Google Drive, OneDrive |\n| **E-commerce** | Buying and selling online | Takealot, Amazon |\n| **Social media** | Online platforms for communication | Facebook, Instagram, TikTok |\n| **Online banking** | Managing finances via internet | FNB App, Capitec |\n| **IoT** | Internet of Things (smart devices connected online) | Smart home systems, fitness trackers |'),
  q(3, 'Which internet connection type would be MOST suitable for a farm school in a remote area of the Eastern Cape?',
    ['Satellite', 'Fibre', 'ADSL', 'Ethernet cable'], 0,
    'Remote rural areas often lack fibre and telephone infrastructure. Satellite internet provides connectivity anywhere with a clear view of the sky, making it the most suitable option.'),
  t(4, '## Social Implications of Networks\n\n### Computer Crimes\n\nAs more South Africans go online, cybercrime has increased dramatically.\n\n| Crime | Description |\n|-------|-------------|\n| **Phishing** | Fake emails or messages that trick you into revealing personal information (passwords, banking details). Often looks like it comes from a bank or trusted organisation |\n| **Pharming** | Redirects you from a legitimate website to a fake one without your knowledge (DNS poisoning) |\n| **DDoS (Distributed Denial of Service)** | Overwhelms a website or server with traffic from thousands of compromised computers, making it unavailable |\n| **Ransomware** | Malware that encrypts your files and demands payment (usually cryptocurrency) to unlock them |\n| **Clickjacking** | Invisible buttons or frames placed over legitimate web content, tricking you into clicking something you did not intend |\n| **Identity theft** | Using someone else\"s personal information to commit fraud |\n| **Hacking** | Unauthorised access to computer systems or networks |'),
  q(5, 'Thandi receives an SMS from what appears to be her bank, asking her to click a link and verify her account details. This is most likely an example of:',
    ['Phishing', 'Pharming', 'Ransomware', 'Clickjacking'], 0,
    'Phishing uses fake messages (email, SMS, WhatsApp) that appear to come from trusted organisations to trick people into revealing personal information.',
    ['Look for the key indicator: a message pretending to be from a trusted source asking for personal details.']),
  t(6, '### Security Technologies\n\nProtecting yourself and your devices requires multiple layers of security.\n\n| Technology | Purpose |\n|-----------|--------|\n| **VPN (Virtual Private Network)** | Encrypts your internet connection, creating a secure tunnel. Hides your browsing activity from your ISP and protects data on public Wi-Fi |\n| **Firewall** | Monitors and controls incoming and outgoing network traffic based on security rules. Can be hardware (router-based) or software (Windows Defender Firewall) |\n| **Screen lock** | PIN, password, pattern, fingerprint, or face recognition to prevent unauthorised physical access to your device |\n| **Two-factor authentication (2FA)** | Requires two forms of verification (e.g., password + OTP sent to your phone) |\n| **Antivirus software** | Detects and removes malware, viruses, spyware |\n| **Encryption** | Scrambles data so only authorised parties can read it. HTTPS uses encryption for websites |\n| **Strong passwords** | At least 8 characters, mix of uppercase, lowercase, numbers, symbols |'),
  fb(7, 'A ___ encrypts your internet connection and creates a secure tunnel. A ___ monitors network traffic and blocks unauthorised access.',
    ['VPN', 'firewall'],
    'A VPN (Virtual Private Network) encrypts data in transit. A firewall filters network traffic based on predefined rules.'),
  t(8, '### Social Media Footprint\n\nYour **digital footprint** is the trail of data you leave when you use the internet.\n\n**Active footprint:** Information you deliberately share (posts, comments, profile details)\n**Passive footprint:** Information collected without your direct input (cookies, browsing history, location tracking)\n\n**Why your digital footprint matters:**\n- Future employers may search your social media profiles\n- Universities may review your online presence\n- Information posted online is extremely difficult to remove permanently\n- Scammers can use personal details for identity theft\n\n**Tips for managing your digital footprint in SA:**\n- Review privacy settings on all social media accounts\n- Think before you post: would you be comfortable if a teacher or employer saw this?\n- Use different, strong passwords for each account\n- Be cautious about sharing your location, school name, or home address\n- Regularly Google your own name to see what information is publicly available'),
  q(9, 'Which of the following is an example of a PASSIVE digital footprint?',
    ['A website tracking your browsing history using cookies', 'Posting a photo on Instagram', 'Sending an email to a friend', 'Commenting on a YouTube video'], 0,
    'A passive footprint is data collected without your deliberate action. Cookies track your browsing activity in the background without you explicitly choosing to share that information.'),
  t(10, '### Cyber Wellness, Safety, and Bullying\n\n**Cyberbullying** is the use of digital devices to deliberately and repeatedly harass, threaten, or humiliate someone.\n\nForms of cyberbullying:\n- Sending threatening or hurtful messages\n- Spreading rumours online\n- Sharing embarrassing photos without permission\n- Excluding someone from online groups deliberately\n- Creating fake profiles to impersonate someone\n\n**What to do if you are cyberbullied:**\n1. Do not respond or retaliate\n2. Save evidence (screenshots)\n3. Block the bully\n4. Report to a trusted adult, teacher, or school counsellor\n5. Report to the platform (Facebook, Instagram, etc.)\n6. In serious cases, report to the South African Police Service (SAPS)\n\n**South African law:** The Cybercrimes Act (2020) makes cyberbullying, data theft, and hacking criminal offences.'),
  q(11, 'Under which South African law is cyberbullying a criminal offence?',
    ['The Cybercrimes Act', 'The POPI Act', 'The Consumer Protection Act', 'The Electronic Communications Act'], 0,
    'The Cybercrimes Act (Act 19 of 2020) criminalises cyberbullying, unlawful access to data, and various other cybercrimes in South Africa.'),
];

// =============================================================================
// CHAPTER 4: Databases (Term 1-2)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Database Concepts Review\n\nA **database** is an organised collection of related data stored electronically. In Grade 12 CAT, you work with relational databases using software like Microsoft Access or LibreOffice Base.\n\n### Key Terminology\n\n| Term | Definition |\n|------|------------|\n| **Table** | Stores data in rows and columns (like a spreadsheet) |\n| **Record** | A single row in a table (one complete set of data) |\n| **Field** | A single column in a table (one category of data) |\n| **Primary key** | A unique field that identifies each record (e.g., ID number) |\n| **Foreign key** | A field in one table that links to the primary key of another table |\n| **Data type** | The kind of data a field stores (text, number, date, currency, yes/no) |\n| **Relationship** | A link between two tables using primary and foreign keys |'),
  t(2, '## Forms\n\nA **form** provides a user-friendly interface for entering and editing data in a table. Instead of typing directly into the table view, users interact with a designed layout.\n\n**Advantages of forms:**\n- Easier for non-technical users to enter data\n- Can include validation to prevent errors\n- Can show one record at a time (less overwhelming)\n- Can include combo boxes, list boxes, and command buttons\n\n**Form controls:**\n\n| Control | Purpose |\n|---------|---------|\n| **Text box** | Enter or display text/number data |\n| **Combo box** | Dropdown list to select from predefined options |\n| **List box** | Displays a list of options (multiple visible) |\n| **Check box** | Yes/No (Boolean) selections |\n| **Command button** | Triggers an action (save, close, navigate) |\n| **Subform** | Displays related records from another table within the form |'),
  q(3, 'Why is a combo box on a form better than a plain text box for entering a province name?',
    ['It limits input to valid options and prevents spelling errors', 'It uses less storage space', 'It makes the form load faster', 'It allows longer text entries'], 0,
    'A combo box restricts input to predefined values, ensuring data consistency and preventing typos (e.g., "Guateng" instead of "Gauteng").'),
  t(4, '## Queries\n\nA **query** retrieves specific data from one or more tables based on criteria you define.\n\n### Query Features for Grade 12\n\n**Calculations in queries:**\nYou can create calculated fields in a query using expressions.\n\n| Expression | Result |\n|-----------|--------|\n| `[Price] * 1.15` | Adds 15% VAT to the price |\n| `[Quantity] * [UnitPrice]` | Calculates line total |\n| `[EndDate] - [StartDate]` | Calculates duration in days |\n| `Year([DateOfBirth])` | Extracts the year from a date |\n| `DateDiff("yyyy", [DOB], Date())` | Calculates age in years |\n\n**Aliases (column headings):**\n`TotalWithVAT: [Price] * 1.15` creates a new column called "TotalWithVAT"'),
  t(5, '### Wildcards and Operators in Queries\n\n**Wildcard characters** let you search for patterns:\n\n| Wildcard | Meaning | Example |\n|----------|---------|--------|\n| `*` | Any number of characters | `Like "Jo*"` matches Johannesburg, John |\n| `?` | Any single character | `Like "b?t"` matches bat, bet, bit, bot, but |\n| `#` | Any single digit | `Like "0#1"` matches 001, 011, 021, etc. |\n\n**IS NULL operator:**\n- `IS NULL` finds records where a field is empty (has no value)\n- `IS NOT NULL` finds records where a field contains any value\n\nExample: To find learners who have not provided an email address:\n`Criteria for Email field: Is Null`\n\n**Comparison operators:**\n`>`, `<`, `>=`, `<=`, `<>` (not equal), `BETWEEN ... AND ...`'),
  q(6, 'In a query, which criteria would find all surnames starting with "Van"?',
    ['Like "Van*"', 'Like "Van?"', '= "Van"', 'Like "#Van"'], 0,
    'The asterisk (*) wildcard matches any number of characters after "Van", so Like "Van*" finds Van der Merwe, Van Wyk, Vandenberg, etc.',
    ['The * wildcard represents zero or more characters.']),
  fb(7, 'The ___ operator finds records where a field is empty. The wildcard ___ represents any single character.',
    ['IS NULL', '?'],
    'IS NULL checks for empty (blank) fields. The question mark (?) wildcard matches exactly one character.'),
  t(8, '## Reports\n\n**Reports** present query or table data in a formatted, printable layout.\n\n### Report Sections\n\n| Section | Purpose |\n|---------|--------|\n| **Report header** | Appears once at the very top (title, logo, date) |\n| **Page header** | Appears at the top of every page (column headings) |\n| **Group header** | Appears before each group (e.g., province name) |\n| **Detail** | Shows individual records |\n| **Group footer** | Summary calculations for each group (subtotals) |\n| **Page footer** | Appears at the bottom of every page (page numbers) |\n| **Report footer** | Appears once at the very end (grand totals) |\n\n### Grouped Reports\n\nGrouping organises records by a common field. For example, grouping a sales report by province shows all Gauteng sales together, then all Western Cape sales, etc.\n\n**Calculations in report footers:**\n- `=Sum([Amount])` in a group footer gives the subtotal for that group\n- `=Sum([Amount])` in the report footer gives the grand total\n- `=Count(*)` counts the number of records\n- `=Avg([Mark])` calculates the average'),
  q(9, 'In a grouped report, where would you place a calculation to show the subtotal for each group?',
    ['Group footer', 'Report header', 'Detail section', 'Page header'], 0,
    'The group footer appears after all records in a group and is the correct place for subtotals and group-level calculations.'),
  t(10, '### Data Validation Techniques\n\nValidation rules help ensure data integrity by preventing incorrect data from being entered.\n\n| Validation Type | Example | Purpose |\n|----------------|---------|--------|\n| **Required field** | A primary key field cannot be left empty | Ensures essential data is captured |\n| **Input mask** | `000-000-0000` for phone numbers | Forces data into a specific format |\n| **Validation rule** | `>=0 AND <=100` for a mark field | Restricts values to a valid range |\n| **Validation text** | "Mark must be between 0 and 100" | User-friendly error message |\n| **Default value** | `Date()` for a date field | Automatically fills in a value |\n| **Field size** | Text field limited to 13 characters for SA ID number | Prevents entries that are too long |\n| **Data type** | Setting a field as "Number" | Prevents text from being entered in a numeric field |\n\nNote: Validation checks that data is **reasonable and in the correct format**, but cannot guarantee the data is **accurate** (e.g., entering a valid but wrong ID number).'),
  q(11, 'What is the difference between validation and verification?',
    ['Validation checks format and range; verification checks accuracy against the source', 'They are the same thing', 'Verification checks format; validation checks accuracy', 'Validation is only for numbers'], 0,
    'Validation ensures data is reasonable, within range, and correctly formatted. Verification confirms that data matches the original source (e.g., double-entry, proofreading).'),
];

// =============================================================================
// CHAPTER 5: Spreadsheets (Term 2)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Advanced Spreadsheet Functions\n\nGrade 12 CAT requires mastery of advanced functions in Microsoft Excel or LibreOffice Calc.\n\n### ROUNDDOWN Function\n\n`=ROUNDDOWN(number, num_digits)`\n\nRounds a number DOWN (towards zero) to a specified number of decimal places.\n\n| Formula | Result | Explanation |\n|---------|--------|-------------|\n| `=ROUNDDOWN(3.789, 2)` | 3.78 | Rounds down to 2 decimal places |\n| `=ROUNDDOWN(5.999, 0)` | 5 | Rounds down to whole number |\n| `=ROUNDDOWN(-3.7, 0)` | -3 | Rounds towards zero |\n\nUseful when you need to always round down (e.g., calculating how many full items you can buy with a budget).'),
  t(2, '### COUNTIFS and SUMIFS Functions\n\nThese functions apply multiple criteria.\n\n**COUNTIFS** counts cells that meet multiple conditions:\n`=COUNTIFS(range1, criteria1, range2, criteria2, ...)`\n\nExample: Count learners in Grade 12 who scored above 60:\n`=COUNTIFS(B2:B100, "Grade 12", C2:C100, ">60")`\n\n**SUMIFS** adds values that meet multiple conditions:\n`=SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2, ...)`\n\nExample: Sum sales in Gauteng for January:\n`=SUMIFS(D2:D100, B2:B100, "Gauteng", C2:C100, "January")`\n\n**Important:** In SUMIFS, the sum_range comes FIRST. In COUNTIFS, there is no sum_range.'),
  q(3, 'What is the key difference between SUMIF and SUMIFS?',
    ['SUMIFS can apply multiple criteria while SUMIF only applies one', 'SUMIFS is faster than SUMIF', 'SUMIF works with text and SUMIFS only with numbers', 'There is no difference'], 0,
    'SUMIF uses a single condition to filter data. SUMIFS (with an S) supports multiple criteria ranges and conditions.'),
  t(4, '### RANDBETWEEN Function\n\n`=RANDBETWEEN(bottom, top)`\n\nGenerates a random whole number between the specified bottom and top values (inclusive).\n\n| Formula | Possible Results |\n|---------|------------------|\n| `=RANDBETWEEN(1, 6)` | 1, 2, 3, 4, 5, or 6 (like rolling a die) |\n| `=RANDBETWEEN(100, 999)` | Any 3-digit number |\n| `=RANDBETWEEN(0, 1)` | 0 or 1 (coin flip) |\n\n**Note:** RANDBETWEEN recalculates every time the spreadsheet changes. To keep a value, copy and Paste Special > Values.\n\n### Nested IF\n\nA nested IF places one IF inside another to test multiple conditions:\n\n`=IF(A1>=80, "A", IF(A1>=60, "B", IF(A1>=40, "C", "F")))`\n\nThis checks:\n1. Is the mark 80 or above? Return "A"\n2. Otherwise, is it 60 or above? Return "B"\n3. Otherwise, is it 40 or above? Return "C"\n4. Otherwise, return "F"'),
  q(5, 'What will `=IF(B2>=75, "Distinction", IF(B2>=50, "Pass", "Fail"))` return if B2 contains 62?',
    ['Pass', 'Distinction', 'Fail', 'Error'], 0,
    '62 is not >= 75, so the first condition is false. The nested IF checks if 62 >= 50, which is true, so it returns "Pass".'),
  t(6, '### VLOOKUP and HLOOKUP\n\n**VLOOKUP** (Vertical Lookup) searches for a value in the first column of a range and returns a value from a specified column.\n\n`=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])`\n\n| Parameter | Meaning |\n|-----------|--------|\n| `lookup_value` | The value to search for |\n| `table_array` | The range containing the data |\n| `col_index_num` | Which column to return (1 = first column) |\n| `range_lookup` | FALSE for exact match, TRUE for approximate |\n\nExample: Look up a product price:\n`=VLOOKUP(A2, Products!A:C, 3, FALSE)`\n\n**HLOOKUP** works the same way but searches horizontally (across the first row).\n\n### Error Indicators\n\n| Error | Cause |\n|-------|-------|\n| `#N/A` | VLOOKUP could not find the value (check spelling or use FALSE for exact match) |\n| `#REF!` | Invalid cell reference (column deleted or col_index exceeds range) |\n| `#VALUE!` | Wrong data type in a formula |\n| `#DIV/0!` | Division by zero |\n| `#NAME?` | Unrecognised function name or text without quotes |'),
  fb(7, 'The error ___ appears when VLOOKUP cannot find the lookup value. The 4th argument should be set to ___ for an exact match.',
    ['#N/A', 'FALSE'],
    '#N/A means the lookup value was not found. Using FALSE as the fourth argument ensures an exact match rather than an approximate one.'),
  t(8, '### SUBTOTAL Function\n\n`=SUBTOTAL(function_num, range)`\n\nSUBTOTAL performs a calculation on visible (filtered) data only, ignoring hidden rows.\n\n| function_num | Function |\n|-------------|----------|\n| 1 | AVERAGE |\n| 2 | COUNT |\n| 3 | COUNTA |\n| 4 | MAX |\n| 5 | MIN |\n| 9 | SUM |\n\nExample: Sum only the visible values in a filtered list:\n`=SUBTOTAL(9, D2:D100)` gives the sum of visible rows in D2:D100.\n\nThis is useful when you filter a large dataset and want totals that update automatically to reflect only the displayed records.'),
  q(9, 'After applying a filter to a data set, which function should you use instead of SUM to only add the visible values?',
    ['SUBTOTAL', 'SUMIF', 'COUNT', 'AVERAGE'], 0,
    'SUBTOTAL ignores hidden (filtered-out) rows, so it gives you the correct total for only the visible data. SUM would include all rows regardless of the filter.'),
  t(10, '### Date and Time Functions\n\nExcel provides functions to extract parts of dates and perform date arithmetic.\n\n| Function | Returns | Example |\n|----------|---------|--------|\n| `YEAR(date)` | Year number | `=YEAR(A1)` returns 2025 |\n| `MONTH(date)` | Month number (1-12) | `=MONTH(A1)` returns 4 |\n| `DAY(date)` | Day of month (1-31) | `=DAY(A1)` returns 15 |\n| `HOUR(time)` | Hour (0-23) | `=HOUR(B1)` returns 14 |\n| `MINUTE(time)` | Minute (0-59) | `=MINUTE(B1)` returns 30 |\n| `SECOND(time)` | Second (0-59) | `=SECOND(B1)` returns 0 |\n| `TODAY()` | Current date | Updates automatically |\n| `NOW()` | Current date and time | Updates automatically |\n\n**Calculating age:**\n`=YEAR(TODAY()) - YEAR(A1)` gives approximate age\n`=DATEDIF(A1, TODAY(), "y")` gives exact age in complete years\n\n### Edit Group on Home Tab\n\nThe **Edit group** on the Home tab includes:\n- **Find & Replace** (Ctrl+H) to search and replace text\n- **Go To** to navigate to specific cells\n- **Sort & Filter** to organise data\n- **Clear** to remove content, formatting, or both'),
  fb(11, 'The function ___ returns the current date without the time. The function ___ returns both the current date and time.',
    ['TODAY()', 'NOW()'],
    'TODAY() returns the current date only. NOW() returns the current date and time.'),
  q(12, 'A cell contains the date 15/03/2025. What does =MONTH(A1) return?',
    ['3', '15', '2025', 'March'], 0,
    'The MONTH function extracts the month number from a date. March is the 3rd month, so it returns 3 (not the name "March").'),
];

// =============================================================================
// CHAPTER 6: Word Processing (Term 2-3)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Advanced Word Processing\n\nGrade 12 CAT requires you to use advanced features of word processors like Microsoft Word or LibreOffice Writer.\n\n### Page Layout\n\nPage layout settings control the overall appearance of your document.\n\n| Feature | Purpose |\n|---------|--------|\n| **Margins** | Space between text and page edge (Normal, Narrow, Wide, Custom) |\n| **Orientation** | Portrait (tall) or Landscape (wide) |\n| **Paper size** | A4 (standard in SA), Letter, Legal |\n| **Columns** | Split text into newspaper-style columns |\n| **Page borders** | Decorative border around the page |\n| **Watermark** | Background text or image (e.g., "DRAFT", "CONFIDENTIAL") |\n| **Page colour** | Background colour for the page |\n| **Section breaks** | Allow different formatting in different parts of the document |'),
  t(2, '### Styles\n\n**Styles** apply consistent formatting throughout a document with a single click.\n\n**Built-in styles:** Heading 1, Heading 2, Normal, Title, Subtitle, etc.\n\n**Benefits of using styles:**\n- Consistent formatting across the entire document\n- Automatically generates a Table of Contents from heading styles\n- Easy to change the look of the entire document by modifying one style\n- Helps with accessibility (screen readers use heading levels for navigation)\n\n**Modifying a style:**\n1. Right-click the style in the Styles gallery\n2. Choose "Modify"\n3. Change font, size, colour, spacing, etc.\n4. All text using that style updates immediately\n\n**Creating a new style:**\n1. Format a paragraph the way you want\n2. Select it and click "Create a Style" in the Styles pane\n3. Give it a descriptive name'),
  q(3, 'What is the MAIN advantage of using heading styles instead of manually formatting headings?',
    ['An automatic Table of Contents can be generated from heading styles', 'Headings appear in a different colour', 'The file size is smaller', 'The document prints faster'], 0,
    'When you use built-in heading styles (Heading 1, Heading 2, etc.), Word can automatically generate a Table of Contents that updates with page numbers.'),
  t(4, '## Mail Merge\n\nMail merge creates personalised documents (letters, labels, envelopes) by combining a template with a data source.\n\n### The Mail Merge Process\n\n1. **Create the main document** (letter template with placeholders)\n2. **Select/connect the data source** (where the personalised data comes from)\n3. **Insert merge fields** (placeholders like <<FirstName>>, <<Address>>)\n4. **Preview results** (check how each letter will look)\n5. **Complete the merge** (generate individual documents or print)\n\n### Data Sources for Mail Merge\n\n| Source | Description |\n|--------|-------------|\n| **Database table** | Access or Base table with contact details |\n| **Word table** | A table within a Word document |\n| **Spreadsheet** | Excel or Calc file (first row must be column headings) |\n| **CSV file** | Comma-separated values file (plain text) |\n\nAll data sources must have a header row with field names that become the merge field names.'),
  q(5, 'A teacher wants to send personalised report letters to 150 parents. Which feature should they use?',
    ['Mail merge', 'Track Changes', 'Find and Replace', 'AutoCorrect'], 0,
    'Mail merge allows you to create a single template letter and automatically insert each parent and learner details from a data source, producing 150 personalised letters.'),
  fb(6, 'In mail merge, the template document is called the ___ document. The file containing names and addresses is called the ___.',
    ['main', 'data source'],
    'The main document contains the fixed text and merge field placeholders. The data source provides the variable information for each recipient.'),
  t(7, '### Links in Documents\n\n| Link Type | Purpose | How to Insert |\n|-----------|---------|---------------|\n| **Bookmark** | Marks a specific location in the document that you can jump to | Insert > Bookmark > Name it > Add |\n| **Hyperlink** | Links to a website, email, file, or bookmark | Insert > Hyperlink > Enter URL or select bookmark |\n| **Cross-reference** | Links to another part of the same document (heading, figure, table) and updates automatically | Insert > Cross-reference > Select type |\n\n**Difference between hyperlink to bookmark and cross-reference:**\n- A hyperlink to a bookmark is static text (you type the display text)\n- A cross-reference updates automatically if the heading text or page number changes'),
  t(8, '### Reviewing and Proofing\n\n**Tracking Changes** lets multiple people edit a document while keeping a record of every change.\n\n**How to use Track Changes:**\n1. Turn on: Review > Track Changes\n2. Make edits (insertions shown in colour, deletions shown as strikethrough)\n3. Add comments: Review > New Comment\n4. Accept or reject changes: Review > Accept / Reject\n\n**Proofing tools:**\n- **Spell check** (F7): Finds spelling errors\n- **Grammar check**: Finds grammar issues\n- **Thesaurus** (Shift+F7): Suggests synonyms\n- **Word count**: Displays statistics (words, characters, paragraphs)\n\n### Line Breaks and Pagination\n\n| Break Type | Shortcut / Location | Purpose |\n|-----------|--------------------|---------|\n| **Line break** | Shift+Enter | Start a new line without starting a new paragraph |\n| **Page break** | Ctrl+Enter | Force content to the next page |\n| **Section break** | Layout > Breaks | Start a new section with different formatting |\n| **Column break** | Layout > Breaks > Column | Move to the top of the next column |'),
  q(9, 'What is the difference between a line break (Shift+Enter) and a paragraph break (Enter)?',
    ['A line break starts a new line without creating a new paragraph; paragraph spacing is not added', 'They are the same thing', 'A line break creates more space between lines', 'A paragraph break does not move to a new line'], 0,
    'A line break (Shift+Enter) moves to the next line within the same paragraph, so paragraph spacing and formatting are not applied. A paragraph break (Enter) creates a new paragraph.'),
  t(10, '### Electronic Forms and Legacy Controls\n\n**Electronic forms** allow users to fill in a document digitally without changing the layout.\n\n**Legacy form controls** (from the Developer tab):\n\n| Control | Purpose |\n|---------|---------|\n| **Text form field** | User types text into a fixed area |\n| **Check box form field** | User ticks a box (yes/no) |\n| **Drop-down form field** | User selects from a list of options |\n\n**Steps to create a form:**\n1. Enable the Developer tab (File > Options > Customize Ribbon)\n2. Design the form layout with labels and formatting\n3. Insert legacy controls where users need to enter data\n4. Set properties for each control (e.g., maximum length, default value, dropdown items)\n5. **Protect the form** (Developer > Restrict Editing > Filling in forms only)\n\nProtecting the form ensures users can only fill in the form fields and cannot change the rest of the document.'),
  q(11, 'Why must you protect a form before distributing it to users?',
    ['To ensure users can only fill in form fields and cannot change the document layout', 'To add a password to the document', 'To reduce the file size', 'To enable spell check'], 0,
    'Protecting the form restricts editing so that users can only interact with the form fields (text fields, checkboxes, dropdowns) and cannot modify the rest of the document.'),
];

// =============================================================================
// CHAPTER 7: HTML and Web Design (Term 2-3)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## HTML Fundamentals for Grade 12\n\nHTML (HyperText Markup Language) is the standard language for creating web pages. In Grade 12 CAT, you must be able to write and understand HTML code.\n\n### Basic HTML Structure\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n  <p>This is a paragraph.</p>\n</body>\n</html>\n```\n\n### Essential HTML Tags\n\n| Tag | Purpose |\n|-----|---------|\n| `<html>` | Root element of the page |\n| `<head>` | Contains metadata (title, links to CSS) |\n| `<title>` | Page title (shown in browser tab) |\n| `<body>` | Visible content of the page |\n| `<h1>` to `<h6>` | Headings (h1 largest, h6 smallest) |\n| `<p>` | Paragraph |\n| `<br>` | Line break (self-closing) |\n| `<hr>` | Horizontal rule / line |\n| `<b>` or `<strong>` | Bold text |\n| `<i>` or `<em>` | Italic text |\n| `<u>` | Underlined text |'),
  t(2, '### HTML Lists and Images\n\n**Unordered list** (bullets):\n```html\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>\n```\n\n**Ordered list** (numbers):\n```html\n<ol>\n  <li>First step</li>\n  <li>Second step</li>\n</ol>\n```\n\n**Images:**\n```html\n<img src="photo.jpg" alt="Description of image" width="300">\n```\n\n| Attribute | Purpose |\n|-----------|--------|\n| `src` | Path to the image file |\n| `alt` | Alternative text (displayed if image cannot load; important for accessibility) |\n| `width` / `height` | Size in pixels or percentage |'),
  q(3, 'What is the purpose of the alt attribute in an image tag?',
    ['To provide descriptive text if the image cannot be displayed and for screen readers', 'To set the alignment of the image', 'To change the image file format', 'To add a border around the image'], 0,
    'The alt attribute provides alternative text that is shown when the image cannot load and is read aloud by screen readers, making web pages more accessible.'),
  t(4, '## HTML Tables\n\nTables organise data into rows and columns on a web page.\n\n### Table Syntax\n\n```html\n<table border="1" cellpadding="5">\n  <tr>\n    <th>Name</th>\n    <th>Grade</th>\n    <th>Mark</th>\n  </tr>\n  <tr>\n    <td>Sipho</td>\n    <td>12A</td>\n    <td>78</td>\n  </tr>\n  <tr>\n    <td>Naledi</td>\n    <td>12B</td>\n    <td>85</td>\n  </tr>\n</table>\n```\n\n### Table Tags and Attributes\n\n| Tag/Attribute | Purpose |\n|--------------|--------|\n| `<table>` | Creates the table |\n| `<tr>` | Table row |\n| `<th>` | Table header cell (bold, centred by default) |\n| `<td>` | Table data cell |\n| `border="1"` | Adds a visible border (1 pixel) |\n| `cellpadding="5"` | Space between cell content and cell border (5 pixels) |\n| `cellspacing="2"` | Space between cells |\n| `colspan="2"` | Merges a cell across 2 columns |\n| `rowspan="3"` | Merges a cell across 3 rows |\n| `bgcolor="#FFCC00"` | Sets background colour of a cell or table |\n| `width="100%"` | Sets table width |'),
  q(5, 'What does the attribute `cellpadding="10"` do in a table tag?',
    ['Adds 10 pixels of space between the cell content and the cell border', 'Adds 10 pixels between each cell', 'Makes the table 10 pixels wide', 'Adds 10 rows to the table'], 0,
    'Cellpadding controls the spacing between the content inside a cell and the cell wall (border). Cellspacing controls the gap between cells.'),
  t(6, '### HTML Attributes\n\nAttributes provide additional information about HTML elements. They are placed inside the opening tag.\n\n**Common attributes:**\n\n| Attribute | Used With | Purpose |\n|-----------|----------|--------|\n| `id` | Any element | Unique identifier for CSS/JavaScript |\n| `class` | Any element | Groups elements for styling |\n| `style` | Any element | Inline CSS styling |\n| `href` | `<a>` | URL for hyperlinks |\n| `src` | `<img>` | Source file for images |\n| `target` | `<a>` | Where to open the link (`_blank` = new tab) |\n| `align` | Various | Text/content alignment |\n| `bgcolor` | `<body>`, `<table>`, `<td>` | Background colour |\n| `color` | `<font>` | Text colour (deprecated, use CSS instead) |\n\n**Colour values:**\n- Named colours: `red`, `blue`, `green`, `black`, `white`\n- Hex codes: `#FF0000` (red), `#00FF00` (green), `#0000FF` (blue), `#FFFFFF` (white)'),
  t(7, '### Creating Links\n\n**External link** (to another website):\n```html\n<a href="https://www.education.gov.za">Department of Education</a>\n```\n\n**Internal link** (to another page on the same site):\n```html\n<a href="contact.html">Contact Us</a>\n```\n\n**Email link:**\n```html\n<a href="mailto:info@school.co.za">Email Us</a>\n```\n\n**Link that opens in a new tab:**\n```html\n<a href="https://www.google.co.za" target="_blank">Google</a>\n```\n\n**Link to a specific section on the same page (anchor):**\n```html\n<!-- Create the anchor -->\n<h2 id="section2">Section 2</h2>\n\n<!-- Link to it -->\n<a href="#section2">Jump to Section 2</a>\n```'),
  fb(8, 'The tag used to create a hyperlink is ___. The attribute that specifies the URL is ___.',
    ['<a>', 'href'],
    'The anchor tag <a> creates hyperlinks. The href attribute specifies the destination URL.'),
  t(9, '### Developing a Web Page for a Scenario\n\nIn the CAT exam, you may be asked to create or modify a web page for a given scenario (e.g., a school website, a business page, a sports club).\n\n**Checklist for building a web page:**\n\n1. **Structure:** Use proper HTML structure (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)\n2. **Title:** Set the page title in `<title>` tags\n3. **Headings:** Use `<h1>` for main heading, `<h2>` for sub-headings\n4. **Text:** Use `<p>` for paragraphs, `<br>` for line breaks\n5. **Lists:** Use `<ul>` or `<ol>` for lists\n6. **Images:** Include `<img>` with alt text\n7. **Links:** Add navigation links between pages\n8. **Tables:** Organise data in tables where appropriate\n9. **Formatting:** Apply bold, italic, colours where needed\n10. **Accessibility:** Always include alt text for images\n\n### Grade 12 NSC CAT HTML Tag List\n\nAll tags on the official CAPS tag list: `html`, `head`, `title`, `body`, `h1`-`h6`, `p`, `br`, `hr`, `b`/`strong`, `i`/`em`, `u`, `a`, `img`, `ul`, `ol`, `li`, `table`, `tr`, `th`, `td`, `font`, `center`, `div`, `span`, `style`, `bgcolor`, `colspan`, `rowspan`.'),
  q(10, 'Which HTML code correctly creates a table with a border and a header row?',
    ['<table border="1"><tr><th>Name</th><th>Age</th></tr><tr><td>Lerato</td><td>17</td></tr></table>', '<table><tr><td><b>Name</b></td><td><b>Age</b></td></tr></table>', '<table border="1"><th>Name</th><th>Age</th><td>Lerato</td><td>17</td></table>', '<table><tr><th>Name</th></tr><td>Age</td></table>'], 0,
    'The correct structure uses <table border="1"> for the border, <tr> to create rows, <th> for header cells, and <td> for data cells, all properly nested.'),
];

// =============================================================================
// CHAPTER 8: Social Implications and Communications (Term 2-3)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Impact of Social Networking\n\nSocial networking has transformed communication, business, and society in South Africa and globally.\n\n### Positive Impacts\n\n| Impact | Example |\n|--------|---------|\n| **Communication** | Stay connected with friends and family across distances |\n| **Business marketing** | Small SA businesses use Instagram and Facebook to reach customers |\n| **Information sharing** | News spreads quickly; awareness campaigns reach millions |\n| **Education** | Study groups on WhatsApp, educational YouTube channels |\n| **Job opportunities** | LinkedIn for professional networking and job hunting |\n| **Activism** | #FeesMustFall movement organised largely through social media |\n\n### Negative Impacts\n\n| Impact | Example |\n|--------|---------|\n| **Cyberbullying** | Harassment, threats, and public humiliation online |\n| **Fake news / Misinformation** | False health claims shared on WhatsApp during COVID-19 |\n| **Addiction** | Excessive screen time affecting sleep, studies, and relationships |\n| **Privacy violations** | Personal information shared without consent |\n| **Identity theft** | Scammers using personal details from social media profiles |\n| **Mental health** | Social comparison, FOMO (fear of missing out), anxiety |'),
  q(2, 'Which of the following is a POSITIVE impact of social networking?',
    ['Small businesses can market their products affordably to a wide audience', 'Increased spread of fake news', 'Cyberbullying among learners', 'Excessive screen time'], 0,
    'Social media provides small businesses with affordable marketing tools to reach a large audience, which is especially valuable in the South African context where traditional advertising can be expensive.'),
  t(3, '## Legal and Ethical Issues\n\n### South African Laws Relating to ICT\n\n| Law | Purpose |\n|-----|--------|\n| **POPIA (Protection of Personal Information Act)** | Protects personal data; organisations must get consent before collecting, storing, or sharing personal information |\n| **Cybercrimes Act** | Criminalises hacking, data theft, cyberbullying, and spreading harmful messages |\n| **Copyright Act** | Protects original creative works (text, music, software, images) from being copied without permission |\n| **ECT Act (Electronic Communications and Transactions)** | Governs electronic contracts, digital signatures, and online consumer protection |\n\n### Ethical Issues\n\n| Issue | Description |\n|-------|-------------|\n| **Plagiarism** | Copying someone else work and presenting it as your own |\n| **Software piracy** | Using unlicensed or cracked software |\n| **Digital divide** | The gap between those with access to technology and those without |\n| **Privacy** | Respecting others right to keep personal information private |\n| **Netiquette** | Online etiquette: being polite, not typing in ALL CAPS, respecting others |'),
  fb(4, 'The ___ Act protects personal information in South Africa. The ___ Act makes hacking and cyberbullying criminal offences.',
    ['POPIA', 'Cybercrimes'],
    'POPIA (Protection of Personal Information Act) governs data privacy. The Cybercrimes Act deals with online criminal offences.'),
  t(5, '## Emerging Technologies\n\n### Virtual Reality (VR), Augmented Reality (AR), and Artificial Intelligence (AI)\n\n| Technology | Description | Example |\n|-----------|-------------|--------|\n| **VR (Virtual Reality)** | Creates a completely immersive digital environment using a headset | Virtual lab experiments, virtual tours of universities |\n| **AR (Augmented Reality)** | Overlays digital content onto the real world | Pokemon Go, IKEA furniture placement app, educational anatomy overlays |\n| **AI (Artificial Intelligence)** | Machines that learn and make decisions | Chatbots, self-driving cars, recommendation algorithms on Netflix/Spotify |\n\n**AI in South Africa:**\n- Banks use AI for fraud detection\n- Chatbots assist customers on websites and WhatsApp\n- AI-powered tools help teachers generate assessments\n- Concerns: job displacement, bias in algorithms, privacy\n\n**Mixed Reality (MR):** Combines VR and AR, allowing digital and real objects to interact.'),
  q(6, 'A learner uses a phone app that overlays the names of constellations when they point the camera at the night sky. This is an example of:',
    ['Augmented Reality (AR)', 'Virtual Reality (VR)', 'Artificial Intelligence (AI)', 'Cloud computing'], 0,
    'AR overlays digital information onto the real world viewed through a device camera. The app adds constellation names to the actual sky view.'),
  t(7, '## E-learning, M-learning, and Blended Learning\n\n| Mode | Description | Example |\n|------|-------------|--------|\n| **E-learning** | Learning using electronic devices and the internet | Online courses on Coursera, Khan Academy, Siyavula |\n| **M-learning** | Learning via mobile devices (phones, tablets) | Educational apps, WhatsApp study groups, podcasts |\n| **Blended learning** | Combines traditional face-to-face teaching with online learning | Attending class and completing online assignments at home |\n\n**Benefits of e-learning and m-learning in SA:**\n- Access to quality education in remote areas\n- Learning at your own pace\n- Affordable (many free resources available)\n- Interactive multimedia content\n\n**Challenges:**\n- Requires internet access and devices (digital divide)\n- Load-shedding interrupts online learning\n- Self-discipline needed for independent learning\n- Data costs can be prohibitive'),
  t(8, '### How Technology Benefits and Harms Society\n\n**Benefits:**\n- Improved healthcare (telemedicine, electronic health records)\n- Better education access (online learning platforms)\n- Economic opportunities (e-commerce, remote work, gig economy)\n- Faster communication (instant messaging, video calls)\n- Convenience (online banking, e-government services like SARS eFiling)\n\n**Harms:**\n- Job losses due to automation and AI\n- Health issues (eye strain, repetitive strain injury, poor posture, sedentary lifestyle)\n- Environmental impact (e-waste, energy consumption of data centres)\n- Social isolation (reduced face-to-face interaction)\n- Technology dependence (inability to function without devices)\n\n### Information Overload\n\n**Information overload** occurs when a person receives more information than they can process, leading to stress, poor decision-making, and reduced productivity.\n\n**Causes:** Too many emails, notifications, social media feeds, news sources\n**Solutions:** Turn off unnecessary notifications, schedule specific times for email, use filters, practise digital detox'),
  q(9, 'Which of the following is a negative effect of technology on health?',
    ['Repetitive strain injury from excessive keyboard and mouse use', 'Access to telemedicine', 'Online fitness tracking', 'Availability of health information'], 0,
    'Repetitive strain injury (RSI) is caused by repetitive movements (typing, clicking) over long periods, causing pain in wrists, hands, and arms. The other options are health benefits of technology.'),
  t(10, '### Digital Communications\n\n**Video Conferencing:**\nVideo conferencing allows real-time face-to-face communication over the internet.\n\n| Platform | Use Case |\n|---------|----------|\n| Zoom | Meetings, online classes, webinars |\n| Microsoft Teams | Business collaboration, school classes |\n| Google Meet | Quick meetings, integrated with Google Workspace |\n\n**Requirements:** Camera, microphone, speakers/headphones, stable internet connection.\n\n**Types of Digital Communication:**\n\n| Type | Description | Examples |\n|------|-------------|--------|\n| **Synchronous** | Real-time, both parties online at the same time | Video calls, phone calls, live chat |\n| **Asynchronous** | Not real-time, parties communicate at different times | Email, WhatsApp messages, forum posts |\n| **Broadcast** | One-to-many communication | Webinars, podcasts, live streaming |\n| **Collaborative** | Multiple people work together | Shared documents, project management tools |'),
  q(11, 'Email is an example of which type of digital communication?',
    ['Asynchronous', 'Synchronous', 'Broadcast', 'Real-time'], 0,
    'Email is asynchronous because the sender and receiver do not need to be online at the same time. The message is stored until the recipient reads it.'),
];

// =============================================================================
// CHAPTER 9: Information Management (Term 3)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## File Management\n\nEffective file management saves time and prevents data loss.\n\n### Password-Protected Files\n\nSensitive documents should be protected with passwords.\n\n**In Microsoft Word / Excel:**\n1. File > Info > Protect Document > Encrypt with Password\n2. Enter a strong password\n3. Save the file\n\n**In LibreOffice:**\n1. File > Save As > tick "Save with password"\n2. Enter a password\n3. Click Save\n\n**Types of file protection:**\n\n| Protection | What it Does |\n|-----------|-------------|\n| **Password to open** | File cannot be opened without the correct password |\n| **Password to modify** | File can be opened in read-only mode but cannot be edited without the password |\n| **Mark as Final** | Indicates the document is complete (can still be edited if user chooses) |\n| **Restrict Editing** | Limits what changes can be made (e.g., allow only comments) |\n\n**Tips for strong passwords:**\n- At least 8 characters\n- Mix of uppercase, lowercase, numbers, and symbols\n- Do not use personal information (name, birthday)\n- Different password for each important file/account'),
  q(2, 'What is the difference between "password to open" and "password to modify"?',
    ['Password to open prevents opening the file entirely; password to modify allows read-only access', 'They are the same thing', 'Password to modify is stronger than password to open', 'Password to open only works on PDFs'], 0,
    'A "password to open" means the file cannot be accessed at all without the password. A "password to modify" allows the file to be opened in read-only mode, but editing requires the password.'),
  t(3, '## Operating System Management\n\n### Scheduled Tasks\n\nThe OS allows you to schedule tasks to run automatically.\n\n**Windows Task Scheduler:**\n- Run virus scans at midnight\n- Perform backups every Friday\n- Run disk cleanup weekly\n- Install updates during off-hours\n\n**Why schedule tasks?**\n- Ensures important maintenance happens regularly\n- Does not interrupt the user during work hours\n- Reduces the risk of forgetting critical tasks\n\n### Updating the Operating System\n\n**Why updates are important:**\n- **Security patches** fix vulnerabilities that hackers exploit\n- **Bug fixes** resolve known problems\n- **New features** improve functionality\n- **Driver updates** improve hardware compatibility\n\n**Windows Update settings:**\n- Automatic (recommended) or manual\n- Active hours: tell Windows when you use the computer so updates install outside those times\n- Restart options: schedule when the computer restarts after an update'),
  t(4, '### Security Features of the Operating System\n\n| Feature | Purpose |\n|---------|--------|\n| **Windows Defender / Antivirus** | Real-time protection against malware |\n| **Windows Firewall** | Monitors incoming/outgoing network traffic |\n| **User Account Control (UAC)** | Asks for permission before making system changes |\n| **BitLocker** | Encrypts the entire drive to protect data if the device is stolen |\n| **Windows Hello** | Biometric login (fingerprint, face recognition) |\n| **User accounts** | Separate profiles for different users with different permission levels |\n| **Administrator vs Standard user** | Admins can install software and change settings; standard users cannot |\n\n### Account Types\n\n| Type | Permissions |\n|------|------------|\n| **Administrator** | Full control: install/remove software, change settings, manage other users |\n| **Standard** | Use programs and change personal settings only |\n| **Guest** | Very limited: temporary access with minimal permissions |'),
  q(5, 'Why should a learner use a Standard user account instead of an Administrator account for daily use?',
    ['It prevents accidental installation of malware or system changes', 'It makes the computer faster', 'Standard accounts have more features', 'There is no difference'], 0,
    'A Standard account limits what changes can be made to the system. If malware tries to install itself, it will be blocked because standard users cannot install software without admin permission.'),
  fb(6, 'The ___ feature encrypts an entire drive in Windows. The acronym UAC stands for User ___ Control.',
    ['BitLocker', 'Account'],
    'BitLocker encrypts the entire drive for data protection. UAC (User Account Control) prompts for permission before allowing system-level changes.'),
  t(7, '### Backup Strategies\n\nBackups protect against data loss from hardware failure, theft, ransomware, or accidental deletion.\n\n**Types of Backup:**\n\n| Type | What It Backs Up | Speed | Storage |\n|------|-----------------|-------|--------|\n| **Full backup** | Everything | Slowest | Most space |\n| **Incremental** | Only files changed since the last backup | Fastest | Least space |\n| **Differential** | All files changed since the last full backup | Medium | Medium |\n\n**Backup destinations:**\n- External hard drive (kept off-site)\n- Cloud storage (Google Drive, OneDrive, Dropbox)\n- Network Attached Storage (NAS)\n- USB flash drive (small files only)\n\n**3-2-1 Backup Rule:**\n- **3** copies of your data\n- **2** different storage media\n- **1** copy stored off-site or in the cloud'),
  t(8, '### Factors Influencing OS Performance\n\n| Factor | Effect | Solution |\n|--------|--------|----------|\n| **Too many startup programs** | Slow boot time | Disable unnecessary startup items |\n| **Disk fragmentation (HDD)** | Slower file access | Run defragmentation tool |\n| **Low disk space** | System instability | Delete temp files, uninstall unused programs |\n| **Outdated drivers** | Hardware not working properly | Update drivers from manufacturer website |\n| **Background processes** | CPU/RAM consumed | Check Task Manager, end unnecessary processes |\n| **Malware infection** | Unpredictable behaviour, slowness | Run full antivirus scan |\n| **Too many browser tabs** | High RAM usage | Close unused tabs, use tab management extensions |\n| **Visual effects** | Use extra GPU/CPU | Reduce visual effects in System Settings |\n\n**Windows Tools for Maintenance:**\n- **Task Manager** (Ctrl+Shift+Esc): Monitor running processes\n- **Disk Cleanup**: Remove temporary files\n- **Defragment and Optimize Drives**: Improve HDD performance\n- **System Restore**: Roll back to a previous working state\n- **Resource Monitor**: Detailed view of CPU, memory, disk, network usage'),
  q(9, 'A computer takes 5 minutes to start up. The MOST likely cause and solution is:',
    ['Too many startup programs; disable unnecessary ones in Task Manager', 'The monitor is too small; buy a larger one', 'The keyboard is wireless; use a wired one', 'The printer is offline; set it online'], 0,
    'Excessive startup programs all try to load when the computer boots, dramatically increasing startup time. Disabling unnecessary ones in Task Manager > Startup tab is the fastest fix.'),
  t(10, '### Practical Assessment Task (PAT) Skills\n\nThe PAT is a practical project completed during the year, usually involving:\n\n**Phase 1: Find and access data**\n- Use search engines effectively (Boolean operators: AND, OR, NOT)\n- Evaluate website reliability (author, date, domain, bias)\n- Save and organise research files\n\n**Phase 2: Process data**\n- Use spreadsheet functions to analyse data\n- Create database queries and reports\n- Format documents professionally\n\n**Phase 3: Present findings**\n- Create a word processing report with table of contents\n- Include charts, tables, and screenshots\n- Proper referencing and bibliography\n\n**Assessment criteria:**\n- Correct use of software features\n- Accuracy of data processing\n- Quality of presentation\n- Following instructions precisely'),
  fb(11, 'The ___ backup type only copies files that have changed since the last backup. The 3-2-1 rule says keep 3 copies on ___ different media with 1 off-site.',
    ['incremental', '2'],
    'Incremental backups only copy changed files since the last backup. The 3-2-1 rule recommends 3 copies, 2 different storage media, and 1 off-site.'),
];

// =============================================================================
// CHAPTER 10: Revision and Exam Preparation (Term 4)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## NSC CAT Exam Structure\n\n### Paper 1: Theory (150 marks, 3 hours)\n\nPaper 1 tests your theoretical knowledge of CAT concepts. You write in an exam venue without a computer.\n\n| Section | Topic | Marks |\n|---------|-------|-------|\n| A | Systems Technologies | 25 |\n| B | Communications and Network Technologies | 25 |\n| C | Data and Information Management | 25 |\n| D | Solution Development | 25 |\n| E | Integrated Scenario | 30 |\n| | **Total** | **150** |\n\n**Section A: Systems Technologies (25 marks)**\n- Types of computers, SOHO, mobile devices\n- Hardware components and functions\n- Input, output, storage devices\n- Performance factors and troubleshooting\n- Software concepts (web-based vs installed, system requirements)\n- Emerging hardware technologies'),
  t(2, '**Section B: Communications and Network Technologies (25 marks)**\n- LAN, WAN, Internet concepts\n- Internet services and connectivity options\n- Network hardware (router, switch, modem, access point)\n- Security technologies (VPN, firewall, encryption)\n- Computer crimes (phishing, pharming, DDoS, ransomware, clickjacking)\n- Social media, digital footprint\n- Cyber wellness and bullying\n\n**Section C: Data and Information Management (25 marks)**\n- File management and OS maintenance\n- Backup types and strategies\n- Security features (passwords, encryption, user accounts)\n- Data vs information\n- Information overload\n- Legal issues (POPIA, Cybercrimes Act, Copyright)\n- Ethical issues (plagiarism, piracy, digital divide)'),
  t(3, '**Section D: Solution Development (25 marks)**\n- Spreadsheet functions and formulae\n- Database concepts, queries, reports, validation\n- Word processing features\n- HTML tags and web design\n- Problem-solving using applications\n\n**Section E: Integrated Scenario (30 marks)**\n- A real-world scenario that combines concepts from multiple sections\n- You must apply knowledge from Systems Technologies, Networks, Information Management, and Solution Development to answer scenario-based questions\n- Example: A new business is setting up their IT infrastructure. Questions may cover hardware selection, network setup, security measures, and software choices'),
  q(4, 'In the NSC CAT Paper 1, which section carries the most marks?',
    ['Section E: Integrated Scenario (30 marks)', 'Section A: Systems Technologies (25 marks)', 'Section D: Solution Development (25 marks)', 'All sections carry equal marks'], 0,
    'Section E (Integrated Scenario) is worth 30 marks, making it the highest-weighted section. Sections A through D are each worth 25 marks.'),
  t(5, '### Paper 2: Practical (150 marks, 3 hours)\n\nPaper 2 tests your practical skills using actual software on a computer.\n\n| Section | Application | Typical Marks |\n|---------|------------|---------------|\n| A | Word Processing | 25-35 |\n| B | Spreadsheets | 40-50 |\n| C | Database | 30-40 |\n| D | HTML / Web Design | 20-30 |\n| | **Total** | **150** |\n\n**What to expect:**\n- You receive data files (documents, spreadsheets, databases, HTML files)\n- Each question asks you to perform specific tasks on these files\n- Save your work regularly (use Ctrl+S frequently)\n- Name files exactly as instructed\n- Check that you have answered all parts of each question before moving on'),
  t(6, '### Exam Tips for Paper 1 (Theory)\n\n**General strategies:**\n\n1. **Read each question carefully** \u2014 pay attention to keywords like "explain", "distinguish", "give an example"\n2. **Answer in context** \u2014 if the scenario mentions a school, relate your answer to a school environment\n3. **Use correct terminology** \u2014 "RAM" not "memory", "phishing" not "hacking an email"\n4. **Give examples when asked** \u2014 South African examples earn credit\n5. **Do not leave blanks** \u2014 an attempt can earn partial marks\n\n**Keywords in questions:**\n\n| Keyword | What to Do |\n|---------|------------|\n| **Name/State** | Give the answer briefly |\n| **Describe** | Give a detailed explanation |\n| **Explain** | Give reasons, say WHY |\n| **Distinguish** | Show differences between two concepts |\n| **Suggest** | Give a practical recommendation |\n| **Justify** | Give reasons to support your answer |'),
  q(7, 'A CAT exam question asks you to "distinguish between phishing and pharming". What does the keyword "distinguish" require?',
    ['Explain the differences between the two concepts', 'Give a definition of both', 'Give an example of phishing', 'Name two types of cyber crime'], 0,
    'The keyword "distinguish" requires you to highlight the differences between two concepts, often by comparing them side by side.'),
  t(8, '### Exam Tips for Paper 2 (Practical)\n\n**Spreadsheet tips:**\n- Check whether formulas should use absolute references ($A$1) or relative references (A1)\n- Read whether a function needs to work on filtered data (use SUBTOTAL)\n- Always check if VLOOKUP needs exact match (FALSE) or approximate (TRUE)\n- For nested IF, work from the highest condition down\n- COUNTIFS/SUMIFS: remember the sum_range comes first in SUMIFS\n\n**Database tips:**\n- In queries, calculated fields use the format `NewFieldName: [Field1] * [Field2]`\n- Wildcards: * for multiple characters, ? for single character\n- IS NULL for empty fields, IS NOT NULL for non-empty\n- In reports, place group calculations in the group footer, grand totals in the report footer\n- Check if the query should be sorted (ORDER BY equivalent in design view)\n\n**Word processing tips:**\n- Use styles for headings (do not manually format)\n- Mail merge: check the data source connection is correct\n- Track Changes: accept/reject individually or all at once\n- Form controls are on the Developer tab (enable it first)'),
  t(9, '### Common Mistakes to Avoid\n\n| Mistake | Why It Loses Marks |\n|---------|-----------|\n| Confusing phishing and pharming | Phishing uses fake messages; pharming redirects websites |\n| Saying "memory" instead of "RAM" or "storage" | These are different things; be specific |\n| Not reading the scenario | Your answers must relate to the given context |\n| Mixing up VR and AR | VR is fully immersive; AR overlays on the real world |\n| Forgetting POPIA vs Cybercrimes Act | POPIA = privacy of data; Cybercrimes Act = online criminal offences |\n| Using SUMIF instead of SUMIFS | SUMIFS supports multiple criteria |\n| Forgetting FALSE in VLOOKUP | Without it, approximate match may give wrong results |\n| Not saving work in practical exam | Save every few minutes using Ctrl+S |'),
  q(10, 'In a VLOOKUP function, what happens if you omit the fourth argument (range_lookup)?',
    ['It defaults to TRUE (approximate match), which may return incorrect results', 'It defaults to FALSE (exact match)', 'The function returns an error', 'Nothing, it works the same either way'], 0,
    'If the fourth argument is omitted, VLOOKUP defaults to TRUE (approximate match). This can return incorrect results if the first column is not sorted in ascending order. Always use FALSE for exact matches.'),
  fb(11, 'In the NSC CAT exam, Paper 1 is the ___ paper worth ___ marks. Paper 2 is the practical paper also worth 150 marks.',
    ['theory', '150'],
    'Paper 1 is the theory (written) paper worth 150 marks. Paper 2 is the practical (computer-based) paper, also worth 150 marks.'),
  q(12, 'A question asks: "Suggest TWO ways the school can improve network security." The keyword "suggest" means you should:',
    ['Give practical recommendations with brief explanations', 'Define what network security is', 'List every security technology you know', 'Describe the history of network security'], 0,
    'The keyword "suggest" requires you to give practical, relevant recommendations. Give exactly TWO (as requested) with brief explanations of how each improves security.'),
];

// =============================================================================
// INSERT EVERYTHING
// =============================================================================

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create the CAT subject
  const subjectDoc = await db.collection('subjects').findOne({
    $or: [
      { name: /Computer Applications Technology/i },
      { code: 'CAT' },
    ],
  });

  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found CAT subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Computer Applications Technology',
      code: 'CAT',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created CAT subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Systems Technologies \u2014 General Concepts',
      description: 'Types of computers (personal, SOHO, mobile), role of data, information management, convergence, input/output devices, and display technologies.',
      order: 1,
      lessons: [
        { title: 'Types of Computers, Convergence, Data, and Devices', description: 'Personal computers, SOHO setups, mobile devices, convergence, data vs information, modern input/output devices, and display technologies.', blocks: ch1_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Systems Technologies \u2014 Hardware',
      description: 'Storage devices, performance factors, troubleshooting, new technologies, software concepts, web-based vs installed applications, and upgrades.',
      order: 2,
      lessons: [
        { title: 'Storage, Performance, Troubleshooting, and Software', description: 'SSD vs HDD, card readers, performance factors, troubleshooting, software accessibility and productivity, web-based vs installed applications, system requirements, and upgrades.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Network Technologies',
      description: 'WAN, Internet services, computer crimes, security technologies, social media footprint, and cyber wellness.',
      order: 3,
      lessons: [
        { title: 'Networks, Internet, Cybercrime, and Online Safety', description: 'WAN concepts, internet services, phishing, pharming, DDoS, ransomware, clickjacking, VPN, firewall, digital footprint, and cyber wellness.', blocks: ch3_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Databases',
      description: 'Forms, queries with calculations and wildcards, reports with grouping and calculations, and data validation techniques.',
      order: 4,
      lessons: [
        { title: 'Forms, Queries, Reports, and Validation', description: 'Database forms and controls, queries with calculations, wildcards, IS NULL, grouped reports with headers/footers, and data validation techniques.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Spreadsheets',
      description: 'ROUNDDOWN, COUNTIFS, SUMIFS, RANDBETWEEN, nested IF, VLOOKUP/HLOOKUP, SUBTOTAL, date/time functions, and the Edit group.',
      order: 5,
      lessons: [
        { title: 'Advanced Functions, Lookups, and Date Calculations', description: 'ROUNDDOWN, COUNTIFS, SUMIFS, RANDBETWEEN, nested IF, VLOOKUP, HLOOKUP, error indicators, SUBTOTAL, date/time functions, and the Edit group on the Home tab.', blocks: ch5_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Word Processing',
      description: 'Page layout, styles, mail merge from multiple data sources, links, reviewing, tracking changes, pagination, electronic forms, and legacy controls.',
      order: 6,
      lessons: [
        { title: 'Advanced Word Processing Features', description: 'Page layout, styles, mail merge from databases, Word tables, spreadsheets, and CSV files, bookmarks, hyperlinks, cross-references, tracking changes, line breaks, pagination, electronic forms, and legacy controls.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: HTML and Web Design',
      description: 'HTML tables, attributes, links, developing web pages, and the Grade 12 NSC CAT tag list.',
      order: 7,
      lessons: [
        { title: 'HTML Tables, Links, and Web Page Development', description: 'HTML tables with border and cellpadding, essential attributes, creating hyperlinks, email links, anchors, and developing a web page for a given scenario.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Social Implications and Communications',
      description: 'Social networking impact, legal and ethical issues, VR/AR/AI, e-learning, m-learning, blended learning, technology in society, and digital communications.',
      order: 8,
      lessons: [
        { title: 'Social Impact, Emerging Tech, and Digital Communication', description: 'Impact of social networking, POPIA, Cybercrimes Act, VR, AR, AI, e-learning, m-learning, blended learning, benefits and harms of technology, information overload, and video conferencing.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Information Management',
      description: 'File management, password protection, OS maintenance, security features, backup strategies, performance factors, and PAT skills.',
      order: 9,
      lessons: [
        { title: 'File Management, OS Security, Backups, and PAT Skills', description: 'Password-protected files, scheduled tasks, OS updates, security features, backup types, 3-2-1 rule, OS performance factors, and practical assessment task skills.', blocks: ch9_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Revision and Exam Preparation',
      description: 'Paper 1 Theory (150 marks, 3 hours) and Paper 2 Practical (150 marks, 3 hours) structure, exam tips, and common mistakes.',
      order: 10,
      lessons: [
        { title: 'Exam Structure, Tips, and Revision', description: 'NSC CAT Paper 1 and Paper 2 structure, section breakdown, exam strategies for theory and practical papers, common mistakes to avoid.', blocks: ch10_lesson1, term: 4 },
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
    title: 'Grade 12 Computer Applications Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Systems Technologies, Network Technologies, Databases, Spreadsheets, Word Processing, HTML, Social Implications, and Information Management for the Grade 12 CAT examination.',
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
  console.log('  TEXTBOOK: Grade 12 Computer Applications Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
