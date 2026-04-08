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

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 1: Basic Concepts of Computing (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 1.1: What Is a Computer and ICT System?
blockNum = 0;
const ch1_lesson1 = [
  t(1, "## What Is a Computer?\n\nA **computer** is an electronic device that accepts data as input, processes it according to a set of instructions (a program), and produces information as output.\n\n### Basic Functions of a Computer\n\n| Function | Description | Example |\n|----------|-------------|--------|\n| **Input** | Accepting data from the user or environment | Typing on a keyboard, clicking a mouse |\n| **Processing** | Performing calculations or logical operations on data | Calculating a total, sorting a list |\n| **Output** | Presenting results to the user | Displaying text on a screen, printing a document |\n| **Storage** | Saving data or information for later use | Saving a file to a hard drive |\n\n### Data vs Information\n\n- **Data** consists of raw, unprocessed facts and figures (e.g. 85, 72, 91).\n- **Information** is data that has been processed and given meaning (e.g. \"The class average is 82.7%\")."),
  t(2, "## What Is an ICT System?\n\n**ICT** stands for **Information and Communication Technology**. An ICT system uses hardware, software, and communication technologies to input, process, store, and output data.\n\n### Components of an ICT System\n\n| Component | Description | Examples |\n|-----------|-------------|----------|\n| **Hardware** | Physical, tangible parts of a computer | Monitor, keyboard, CPU, RAM |\n| **Software** | Programs and instructions that tell hardware what to do | Windows, Microsoft Word, Chrome |\n| **Data** | Raw facts entered into the system | Names, numbers, images |\n| **People** | Users who operate and interact with the system | Teachers, students, administrators |\n| **Procedures** | Rules and guidelines for using the system | Login policies, backup schedules |\n| **Communication** | Networks and connectivity that link systems | Wi-Fi, Ethernet, the internet |\n\n### Why Are ICT Systems Important?\n\n- They automate repetitive tasks (e.g. calculating marks)\n- They improve communication (e.g. email, video calls)\n- They store and organise large amounts of data (e.g. school databases)\n- They enable access to information worldwide (e.g. the internet)"),
  q(3, 'What is the difference between data and information?',
    ['Data is raw, unprocessed facts; information is data that has been processed and given meaning', 'They are the same thing', 'Data is always numeric; information is always text', 'Information is entered by the user; data is produced by the computer'], 0,
    'Data consists of raw facts (like numbers or names). Information is the meaningful result obtained after data has been processed, organised, or given context.'),
  t(4, "## Types of Computers\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Supercomputer** | Most powerful; used for complex calculations | Weather forecasting, scientific research |\n| **Mainframe** | Large, powerful; handles many users simultaneously | Banks, airlines, government |\n| **Desktop PC** | Personal computer for home or office use | Dell, HP, custom-built PCs |\n| **Laptop/Notebook** | Portable computer with built-in screen and keyboard | MacBook, Lenovo ThinkPad |\n| **Tablet** | Touchscreen device; lighter than a laptop | iPad, Samsung Galaxy Tab |\n| **Smartphone** | Mobile phone with computing capabilities | iPhone, Samsung Galaxy |\n| **Embedded computer** | Built into another device; performs a specific task | ATM, smart TV, car computer, traffic light |\n\n### Purpose and Uses of Computers\n\nComputers are used in almost every field:\n- **Education:** E-learning, research, educational software\n- **Business:** Accounting, communication, inventory management\n- **Medicine:** Patient records, medical imaging, research\n- **Entertainment:** Gaming, streaming, music production\n- **Government:** Service delivery, record-keeping, e-filing (e.g. SARS eFiling in South Africa)"),
  fb(5, 'A computer that is built into another device to perform a specific task is called an ___ computer. The most powerful type of computer used for scientific research is a ___.',
    ['embedded', 'supercomputer'],
    'Embedded computers are integrated into devices like ATMs, smart TVs, and car systems. Supercomputers handle complex calculations like weather modelling.'),
  q(6, 'Which type of computer is most suitable for a bank that needs to process millions of transactions daily from thousands of branches?',
    ['Mainframe', 'Tablet', 'Desktop PC', 'Smartphone'], 0,
    'Mainframes are designed to handle very large volumes of data and support many simultaneous users, making them ideal for banking and airline reservation systems.'),
  t(7, "## Overview of a General Computer System\n\nA computer system follows the **Input-Processing-Output-Storage (IPOS)** cycle.\n\n### Input Devices\n\nInput devices allow users to enter data into the computer.\n\n| Device | Type of Input |\n|--------|---------------|\n| **Keyboard** | Text and commands |\n| **Mouse** | Pointing and clicking |\n| **Microphone** | Sound/voice |\n| **Scanner** | Printed images and documents |\n| **Webcam** | Video and images |\n| **Touchscreen** | Touch gestures |\n| **Barcode reader** | Product codes |\n| **Biometric scanner** | Fingerprints, facial features |\n\n### Output Devices\n\nOutput devices present processed data to the user.\n\n| Device | Type of Output |\n|--------|----------------|\n| **Monitor/Screen** | Visual display |\n| **Printer** | Hard copy (paper) |\n| **Speakers** | Sound/audio |\n| **Headphones** | Personal audio |\n| **Projector** | Large-screen display |\n| **Plotter** | Large technical drawings |"),
  q(8, 'A barcode reader at a supermarket checkout is an example of:',
    ['An input device', 'An output device', 'A processing device', 'A storage device'], 0,
    'A barcode reader inputs data (the product code) into the computer system. The system then processes this data to look up the product name and price.'),
  t(9, "### Processing and Storage\n\n**The CPU (Central Processing Unit)** is the \"brain\" of the computer. It processes all instructions and data.\n\n**Storage devices** save data for later use:\n\n| Type | Volatile? | Speed | Capacity | Examples |\n|------|-----------|-------|----------|----------|\n| **Primary storage (RAM)** | Yes (volatile) | Very fast | Small (8\u201332 GB typical) | DDR4, DDR5 RAM |\n| **Primary storage (ROM)** | No (non-volatile) | Fast | Very small | BIOS/UEFI chip |\n| **Secondary storage** | No (non-volatile) | Slower than RAM | Large (256 GB\u20134 TB+) | HDD, SSD, USB flash drive |\n| **Tertiary/Backup** | No (non-volatile) | Slowest | Very large | External HDD, cloud storage, tape |\n\n**Volatile** means the data is lost when power is switched off. **Non-volatile** means data is retained without power.\n\n**RAM vs ROM:**\n- **RAM (Random Access Memory):** Temporary, read/write, stores currently running programs\n- **ROM (Read Only Memory):** Permanent, read-only, stores start-up instructions (BIOS)"),
  fb(10, 'RAM is ___ memory, meaning data is lost when the computer is switched off. ROM is ___ memory that stores the start-up instructions.',
    ['volatile', 'non-volatile'],
    'RAM is volatile (temporary). ROM is non-volatile (permanent) and contains the BIOS/UEFI firmware used to start the computer.'),
];

// Lesson 1.2: Hardware Components
blockNum = 0;
const ch1_lesson2 = [
  t(1, "## The System Unit\n\nThe **system unit** (also called the computer case or tower) houses the main internal components of a computer.\n\n### Key Internal Components\n\n| Component | Function |\n|-----------|----------|\n| **Motherboard** | Main circuit board that connects all components together |\n| **CPU (Processor)** | Processes all instructions; the \"brain\" of the computer |\n| **RAM** | Temporary working memory for currently running programs |\n| **Power Supply Unit (PSU)** | Converts AC power from the wall outlet to DC power for components |\n| **Hard drive (HDD) or SSD** | Long-term storage for the operating system, programs, and files |\n| **Graphics card (GPU)** | Processes and outputs visual display to the monitor |\n| **Optical drive** | Reads/writes CDs, DVDs, Blu-ray discs (becoming less common) |\n| **Cooling fans** | Prevent components from overheating |\n\n### The Motherboard\n\nThe motherboard is the main printed circuit board (PCB). All other components plug into it.\n\n**Key parts of the motherboard:**\n- **CPU socket** \u2014 holds the processor\n- **RAM slots (DIMM)** \u2014 hold memory modules\n- **Expansion slots (PCIe)** \u2014 for graphics cards, sound cards, etc.\n- **SATA connectors** \u2014 connect storage devices\n- **Power connectors** \u2014 receive power from the PSU\n- **I/O ports** \u2014 USB, HDMI, Ethernet, audio jacks"),
  t(2, "## Ports and Connectors\n\nPorts are sockets on the outside of the computer used to connect peripherals.\n\n| Port | Purpose | Notes |\n|------|---------|-------|\n| **USB (Type-A)** | Connect mice, keyboards, flash drives | Most common port |\n| **USB (Type-C)** | Connect modern devices, charge phones | Reversible plug; faster |\n| **HDMI** | Connect monitors, TVs, projectors | Carries video and audio |\n| **VGA** | Connect older monitors | Analogue video only; being phased out |\n| **DisplayPort** | Connect high-end monitors | Higher refresh rates than HDMI |\n| **Ethernet (RJ-45)** | Wired network connection | Faster and more stable than Wi-Fi |\n| **3.5 mm audio jack** | Headphones, microphones, speakers | Analogue audio |\n| **Power port** | Connect the power cable | AC power input |\n\n### USB Generations\n\n| Standard | Speed | Notes |\n|----------|-------|-------|\n| **USB 2.0** | 480 Mbps | Older, common for mice/keyboards |\n| **USB 3.0** | 5 Gbps | Blue-coloured port; 10x faster |\n| **USB 3.1/3.2** | 10\u201320 Gbps | High-speed data transfer |\n| **USB4 / Thunderbolt** | 40 Gbps+ | Fastest; used with Type-C |"),
  q(3, 'Which port is used to connect a computer to a wired network?',
    ['Ethernet (RJ-45)', 'HDMI', 'USB Type-A', 'VGA'], 0,
    'An Ethernet (RJ-45) port provides a wired connection to a local area network or the internet. It is faster and more stable than Wi-Fi.'),
  t(4, "## Storage Devices\n\n### Hard Disk Drive (HDD)\n\nAn HDD uses spinning magnetic platters and a read/write head to store data.\n\n**Advantages:** Large capacity (1\u20134 TB common), cheap per GB\n**Disadvantages:** Slower, fragile (moving parts), heavier, uses more power\n\n### Solid State Drive (SSD)\n\nAn SSD uses flash memory chips (no moving parts) to store data.\n\n**Advantages:** Much faster, durable, silent, light, uses less power\n**Disadvantages:** More expensive per GB, smaller capacities\n\n### Comparison\n\n| Feature | HDD | SSD |\n|---------|-----|-----|\n| **Speed** | Slower (read: ~100 MB/s) | Much faster (read: 500\u20137000 MB/s) |\n| **Moving parts** | Yes (spinning platters) | No |\n| **Durability** | Fragile (shock damage) | Durable |\n| **Noise** | Audible spinning | Silent |\n| **Cost per GB** | Cheaper | More expensive |\n| **Typical capacity** | 1\u20134 TB | 256 GB\u20132 TB |\n| **Best for** | Bulk storage, backups | Operating system, programs, gaming |\n\n### Other Storage Media\n\n- **USB flash drive:** Portable, small, 8\u2013256 GB\n- **SD card:** Used in cameras, phones\n- **Cloud storage:** Online storage (Google Drive, Dropbox, OneDrive)\n- **Optical discs:** CD (~700 MB), DVD (~4.7 GB), Blu-ray (~25\u201350 GB)"),
  fb(5, 'An SSD is ___ than an HDD because it has no moving parts. An HDD is ___ per gigabyte, making it better for bulk storage.',
    ['faster', 'cheaper'],
    'SSDs use flash memory, which provides much faster read/write speeds. HDDs use spinning platters, which are slower but more affordable for large storage.'),
  q(6, 'A student wants to carry a 2 GB assignment file between home and school. Which storage device is most practical?',
    ['USB flash drive', 'External HDD', 'Blu-ray disc', 'Magnetic tape'], 0,
    'A USB flash drive is small, portable, affordable, and can easily store 2 GB. It plugs into any USB port and requires no special software or hardware.'),
  t(7, "## Printers\n\n| Type | How It Works | Best For |\n|------|-------------|----------|\n| **Inkjet** | Sprays tiny droplets of liquid ink onto paper | Home use, colour photos, small volumes |\n| **Laser** | Uses toner (powder) and heat to fuse text/images onto paper | Office use, high-volume printing, fast |\n| **3D printer** | Builds physical objects layer by layer from plastic/resin | Prototyping, manufacturing, education |\n| **Dot matrix** | Strikes ink ribbon with pins to create characters | Multi-part forms (e.g. invoices) |\n\n### Inkjet vs Laser\n\n| Feature | Inkjet | Laser |\n|---------|--------|-------|\n| **Purchase cost** | Cheaper | More expensive |\n| **Running cost** | Higher (ink is expensive) | Lower (toner lasts longer) |\n| **Speed** | Slower | Faster |\n| **Print quality (text)** | Good | Excellent (sharp) |\n| **Print quality (photos)** | Excellent | Good |\n| **Volume** | Low to medium | Medium to high |"),
  q(8, 'A busy school office needs to print 500 pages of text documents daily. Which printer type is most suitable?',
    ['Laser printer', 'Inkjet printer', '3D printer', 'Dot matrix printer'], 0,
    'Laser printers are designed for high-volume text printing. They are faster, produce sharp text, and have a lower cost per page than inkjet printers.'),
  t(9, "## Choosing Hardware\n\nWhen selecting hardware, consider these factors:\n\n| Factor | Questions to Ask |\n|--------|------------------|\n| **Purpose** | What will the computer be used for? (Office work, gaming, design, programming?) |\n| **Budget** | How much can you spend? |\n| **Performance** | Do you need a fast CPU, lots of RAM, or a powerful GPU? |\n| **Portability** | Do you need to carry it around? (Desktop vs laptop vs tablet) |\n| **Expandability** | Can you upgrade components later? |\n| **Compatibility** | Will it work with your existing software and peripherals? |\n| **Warranty and support** | Is technical support available? |\n\n### Minimum Specifications for Common Tasks\n\n| Task | CPU | RAM | Storage | GPU |\n|------|-----|-----|---------|-----|\n| **Basic office work** | Dual-core | 4\u20138 GB | 256 GB SSD | Integrated |\n| **Programming (Delphi)** | Quad-core | 8 GB | 256 GB SSD | Integrated |\n| **Gaming** | Quad-core+ | 16 GB+ | 512 GB SSD + HDD | Dedicated GPU |\n| **Graphic design** | Quad-core+ | 16 GB+ | 512 GB SSD | Dedicated GPU |"),
  fb(10, 'A ___ computer is the best choice if you need portability. When choosing hardware, you should consider purpose, budget, performance, and ___.',
    ['laptop', 'compatibility'],
    'Laptops offer portability with built-in screens, keyboards, and batteries. Compatibility ensures the hardware works with your existing software and peripherals.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Data Representation and Storage (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 2.1: Number Systems and Character Codes
blockNum = 0;
const ch2_lesson1 = [
  t(1, "## Number Systems\n\nComputers store and process all data as binary (base-2) numbers. Understanding number systems helps you understand how data is stored.\n\n### Decimal (Base 10)\n\nThe number system humans use daily. Uses digits 0\u20139.\n\nExample: 253 = (2 \u00d7 100) + (5 \u00d7 10) + (3 \u00d7 1)\n\n### Binary (Base 2)\n\nComputers use binary. Only two digits: **0** and **1**. Each digit is called a **bit** (binary digit).\n\n| Binary place values | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |\n|---------------------|-----|----|----|----|---|---|---|---|\n| Example: 11001010 | 1 | 1 | 0 | 0 | 1 | 0 | 1 | 0 |\n\n11001010 in binary = 128 + 64 + 8 + 2 = **202** in decimal\n\n### Why Binary?\n\nComputers use electronic circuits that have two states:\n- **ON** (electricity flowing) = 1\n- **OFF** (no electricity) = 0\n\nThis two-state system maps perfectly to binary digits."),
  t(2, "## Converting Between Decimal and Binary\n\n### Decimal to Binary (Repeated Division)\n\nDivide by 2 and record the remainder. Read the remainders from bottom to top.\n\n**Example: Convert 45 to binary**\n\n| Division | Quotient | Remainder |\n|----------|----------|----------|\n| 45 \u00f7 2 | 22 | 1 |\n| 22 \u00f7 2 | 11 | 0 |\n| 11 \u00f7 2 | 5 | 1 |\n| 5 \u00f7 2 | 2 | 1 |\n| 2 \u00f7 2 | 1 | 0 |\n| 1 \u00f7 2 | 0 | 1 |\n\nRead bottom to top: **101101**\n\n### Binary to Decimal (Place Values)\n\nWrite the binary place values and add up where there is a 1.\n\n**Example: Convert 101101 to decimal**\n\n| 32 | 16 | 8 | 4 | 2 | 1 |\n|----|----|---|---|---|---|\n| 1 | 0 | 1 | 1 | 0 | 1 |\n\n32 + 8 + 4 + 1 = **45**"),
  q(3, 'What is the decimal value of the binary number 1101?',
    ['13', '14', '11', '15'], 0,
    'Binary 1101: place values are 8, 4, 2, 1. Calculate: 8 + 4 + 0 + 1 = 13.'),
  fb(4, 'The binary number system uses only two digits: ___ and ___. Each binary digit is called a bit.',
    ['0', '1'],
    'Binary uses only 0 and 1. Computers use binary because electronic circuits have two states: on (1) and off (0).'),
  t(5, "## Units of Data Storage\n\n| Unit | Size | Approximate Equivalent |\n|------|------|------------------------|\n| **Bit** | 1 binary digit (0 or 1) | Smallest unit |\n| **Nibble** | 4 bits | Half a byte |\n| **Byte** | 8 bits | One character (e.g. the letter A) |\n| **Kilobyte (KB)** | 1 024 bytes | A short text document |\n| **Megabyte (MB)** | 1 024 KB | A photo, a short song |\n| **Gigabyte (GB)** | 1 024 MB | A movie, many photos |\n| **Terabyte (TB)** | 1 024 GB | A large hard drive |\n| **Petabyte (PB)** | 1 024 TB | Large data centres |\n\n**Conversions:**\n- 1 Byte = 8 bits\n- 1 KB = 1 024 Bytes\n- 1 MB = 1 024 KB\n- 1 GB = 1 024 MB\n- 1 TB = 1 024 GB"),
  q(6, 'How many bits are in 1 byte?',
    ['8', '4', '16', '1024'], 0,
    'One byte consists of 8 bits. A byte can represent a single character (like a letter or digit) in the ASCII character set.'),
  t(7, "## Character Encoding\n\n### ASCII (American Standard Code for Information Interchange)\n\nASCII assigns a unique 7-bit number to each character. Extended ASCII uses 8 bits (1 byte) per character, allowing 256 characters.\n\n| Character | ASCII Code |\n|-----------|------------|\n| A\u2013Z | 65\u201390 |\n| a\u2013z | 97\u2013122 |\n| 0\u20139 | 48\u201357 |\n| Space | 32 |\n| ! | 33 |\n\n**Limitations of ASCII:**\n- Only 256 characters (extended ASCII)\n- Cannot represent characters from many world languages (Chinese, Arabic, Hindi, isiZulu diacritics)\n\n### Unicode\n\nUnicode is a universal character encoding standard that can represent characters from all world languages.\n\n| Feature | ASCII | Unicode |\n|---------|-------|--------|\n| **Characters** | 256 (extended) | Over 149 000 |\n| **Bytes per character** | 1 byte | 1\u20134 bytes (UTF-8) |\n| **Languages** | English mainly | All world languages |\n| **Special symbols** | Limited | Emojis, mathematical symbols, etc. |\n| **Used by** | Older systems | Modern systems, websites, apps |"),
  fb(8, 'The ASCII code for the uppercase letter A is ___. Unicode can represent over ___ characters from all world languages.',
    ['65', '149 000'],
    'A has ASCII value 65. Unicode supports over 149 000 characters, including symbols, emojis, and characters from every writing system.'),
  q(9, 'Why was Unicode developed to replace ASCII?',
    ['ASCII cannot represent characters from most world languages', 'ASCII is too slow', 'ASCII uses too much storage', 'Unicode is older than ASCII'], 0,
    'ASCII only supports 256 characters, which is insufficient for representing Chinese, Arabic, Hindi, and many other writing systems. Unicode solves this by supporting over 149 000 characters.'),
  t(10, "## How Computers Store Different Types of Data\n\nAll data in a computer is stored as binary numbers, but different types of data are encoded differently:\n\n| Data Type | How It Is Stored |\n|-----------|------------------|\n| **Text** | Each character is stored as a binary code (ASCII or Unicode) |\n| **Numbers** | Stored as binary integers or floating-point values |\n| **Images** | Made up of pixels; each pixel's colour is stored as binary values (e.g. RGB) |\n| **Sound** | Analogue sound waves are sampled and converted to binary values |\n| **Video** | A sequence of images (frames) with accompanying sound |\n\n**Example:** The letter \"B\" is stored as binary 01000010 (ASCII 66).\n\n**Pixel colour (RGB):** Each pixel has a Red, Green, and Blue value (0\u2013255 each).\n- Red = (255, 0, 0)\n- White = (255, 255, 255)\n- Black = (0, 0, 0)"),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: System Software (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 3.1: Operating Systems and System Software
blockNum = 0;
const ch3_lesson1 = [
  t(1, "## What Is Software?\n\nSoftware is a set of instructions (programs) that tells the hardware what to do. There are two main categories:\n\n| Category | Purpose | Examples |\n|----------|---------|----------|\n| **System software** | Manages the computer hardware and provides a platform for applications | Windows, Linux, device drivers |\n| **Application software** | Performs specific tasks for the user | Word processor, web browser, game |\n\n### Types of System Software\n\n| Type | Description |\n|------|------------|\n| **Operating System (OS)** | Manages all hardware and software; provides the user interface |\n| **Utility programs** | Perform maintenance tasks (antivirus, disk cleanup, backup) |\n| **Device drivers** | Allow the OS to communicate with specific hardware devices |\n| **Firmware** | Permanent software stored on ROM (e.g. BIOS/UEFI) |"),
  t(2, "## The Operating System\n\nThe **operating system (OS)** is the most important system software. It acts as an intermediary between the user and the hardware.\n\n### Functions of an Operating System\n\n| Function | Description |\n|----------|------------|\n| **Processor management** | Allocates CPU time to running programs (multitasking) |\n| **Memory management** | Manages RAM: allocates memory to programs, uses virtual memory when needed |\n| **File management** | Organises files into folders; handles creating, saving, deleting, and finding files |\n| **Device management** | Communicates with hardware through device drivers |\n| **User interface** | Provides a way for users to interact with the computer (GUI or CLI) |\n| **Security** | User accounts, passwords, permissions, and access control |\n| **Networking** | Manages network connections and communication |\n\n### Types of User Interface\n\n| Interface | Description | Example |\n|-----------|-------------|--------|\n| **GUI (Graphical User Interface)** | Uses icons, windows, menus, and mouse clicks | Windows, macOS |\n| **CLI (Command Line Interface)** | Uses typed text commands | Command Prompt, Linux Terminal |\n| **Touch interface** | Uses touch gestures on a screen | iOS, Android |"),
  q(3, 'Which operating system function is responsible for allocating CPU time to running programs?',
    ['Processor management', 'File management', 'Device management', 'Memory management'], 0,
    'Processor management (also called process management or CPU scheduling) decides which program gets CPU time and for how long, enabling multitasking.'),
  t(4, "## Common Operating Systems\n\n### Desktop Operating Systems\n\n| OS | Developer | Key Features |\n|----|-----------|-------------|\n| **Microsoft Windows** | Microsoft | Most widely used desktop OS; large software library; familiar GUI |\n| **macOS** | Apple | Runs only on Apple hardware; popular for creative work; sleek design |\n| **Linux** | Open-source community | Free; open source; many distributions (Ubuntu, Fedora); popular for servers |\n\n### Mobile Operating Systems\n\n| OS | Developer | Key Features |\n|----|-----------|-------------|\n| **Android** | Google (open source) | Most popular mobile OS worldwide; runs on many devices |\n| **iOS** | Apple | Runs only on iPhones; known for security and smooth performance |\n\n### Open Source vs Proprietary Software\n\n| Feature | Open Source | Proprietary |\n|---------|-------------|-------------|\n| **Source code** | Freely available to view and modify | Hidden; owned by the company |\n| **Cost** | Usually free | Requires a paid licence |\n| **Customisation** | Can be modified by anyone | Cannot be modified by users |\n| **Support** | Community forums and documentation | Official technical support |\n| **Examples** | Linux, LibreOffice, Firefox, VLC | Windows, Microsoft Office, Adobe Photoshop |"),
  fb(5, 'Linux is an example of ___ source software because its source code is freely available. Windows is ___ software because its source code is hidden and users must pay for a licence.',
    ['open', 'proprietary'],
    'Open-source software shares its source code freely. Proprietary software keeps its code secret and typically requires a paid licence.'),
  q(6, 'Which mobile operating system is open source and runs on devices from many different manufacturers?',
    ['Android', 'iOS', 'macOS', 'Windows'], 0,
    'Android is developed by Google and is open source. It runs on Samsung, Huawei, Xiaomi, and many other manufacturers\' devices. iOS runs only on Apple devices.'),
  t(7, "## Utility Programs\n\nUtility programs are system software tools that help maintain and optimise the computer.\n\n| Utility | Purpose |\n|---------|--------|\n| **Antivirus/Anti-malware** | Scans for and removes viruses, trojans, spyware, and other malware |\n| **Disk cleanup** | Removes temporary files, cache, and unnecessary data to free up space |\n| **Disk defragmenter** | Reorganises fragmented files on an HDD to improve read speed (not needed for SSDs) |\n| **Backup software** | Creates copies of files for recovery in case of data loss |\n| **File compression** | Reduces file size for storage or sharing (e.g. ZIP, RAR) |\n| **Firewall** | Monitors and controls incoming and outgoing network traffic |\n| **Task manager** | Shows running programs and resource usage; allows ending unresponsive programs |\n\n### Device Drivers\n\nA **device driver** is software that allows the operating system to communicate with a specific hardware device (e.g. a printer, graphics card, or Wi-Fi adapter).\n\n- When you plug in new hardware, the OS needs the correct driver to use it\n- Drivers are often installed automatically (Plug and Play) or downloaded from the manufacturer's website\n- Outdated drivers can cause hardware to malfunction or not work at all"),
  q(8, 'Why should you NOT run a disk defragmenter on a solid state drive (SSD)?',
    ['SSDs have no moving parts; defragmentation provides no benefit and can reduce SSD lifespan', 'SSDs cannot be defragmented', 'Defragmentation makes SSDs slower', 'SSDs automatically defragment themselves'], 0,
    'Defragmentation rearranges data on spinning platters (HDDs) for faster access. SSDs access data electronically regardless of physical location, so defragmentation is unnecessary and the extra write operations can shorten the SSD\'s lifespan.'),
  fb(9, 'A ___ is software that allows the OS to communicate with a specific hardware device. ___ software creates copies of files for recovery in case of data loss.',
    ['device driver', 'Backup'],
    'Device drivers act as translators between the OS and hardware. Backup software protects against data loss by creating copies of important files.'),
  t(10, "## Application Software\n\nApplication software performs specific tasks for the user.\n\n### Types of Application Software\n\n| Category | Examples |\n|----------|----------|\n| **Word processor** | Microsoft Word, Google Docs, LibreOffice Writer |\n| **Spreadsheet** | Microsoft Excel, Google Sheets, LibreOffice Calc |\n| **Database** | Microsoft Access, MySQL, LibreOffice Base |\n| **Presentation** | Microsoft PowerPoint, Google Slides |\n| **Web browser** | Chrome, Firefox, Edge, Safari |\n| **Email client** | Outlook, Thunderbird, Gmail (web) |\n| **Graphics/Design** | Adobe Photoshop, GIMP, Canva |\n| **Programming IDE** | Delphi, Visual Studio, VS Code |\n| **Communication** | WhatsApp, Zoom, Microsoft Teams |\n\n### Installing and Removing Software\n\n- **Install from disc or download:** Run the setup/installer file\n- **Install from app store:** Microsoft Store, Google Play, Apple App Store\n- **Uninstall properly:** Use the OS uninstall feature (Settings > Apps in Windows) rather than just deleting the folder, to remove all associated files and registry entries"),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Algorithms and Problem Solving (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, "## What Is an Algorithm?\n\nAn **algorithm** is a step-by-step set of instructions to solve a problem or complete a task. Algorithms must be:\n\n- **Clear** \u2014 each step is unambiguous\n- **Finite** \u2014 the algorithm eventually ends\n- **Effective** \u2014 each step can actually be carried out\n- **Input** \u2014 it accepts zero or more inputs\n- **Output** \u2014 it produces at least one output\n\n### Everyday Algorithm Example\n\n**Making a cup of tea:**\n1. Boil water in the kettle\n2. Place a tea bag in a cup\n3. Pour boiling water into the cup\n4. Wait 3 minutes for the tea to brew\n5. Remove the tea bag\n6. Add milk and sugar if desired\n7. Stir and serve\n\nThis is an algorithm because it has clear, ordered steps with a defined start and end."),
  t(2, "## Flowcharts\n\nA **flowchart** is a visual diagram that represents an algorithm using standard symbols.\n\n### Flowchart Symbols\n\n| Symbol | Shape | Purpose |\n|--------|-------|---------|\n| **Terminal** | Rounded rectangle (oval) | Marks the Start or End of the algorithm |\n| **Process** | Rectangle | Represents an action or calculation |\n| **Decision** | Diamond | Asks a Yes/No or True/False question |\n| **Input/Output** | Parallelogram | Represents reading input or displaying output |\n| **Flow lines** | Arrows | Show the direction of flow between steps |\n\n### Example Flowchart: Is a Number Positive or Negative?\n\n```\n[Start]\n  |\n  v\n/Enter a number/\n  |\n  v\n<Is number >= 0?>\n  /         \\\nYes          No\n  |            |\n  v            v\n/Display      /Display\n\"Positive\"/   \"Negative\"/\n  |            |\n  v            v\n[End]        [End]\n```"),
  q(3, 'In a flowchart, which shape represents a decision (Yes/No question)?',
    ['Diamond', 'Rectangle', 'Oval', 'Parallelogram'], 0,
    'A diamond shape in a flowchart represents a decision point where the flow branches based on a Yes/No or True/False condition.'),
  t(4, "## Pseudocode\n\n**Pseudocode** is a structured, English-like way of writing an algorithm. It is not a real programming language, so it has no strict syntax rules.\n\n### Common Pseudocode Keywords\n\n| Keyword | Purpose |\n|---------|--------|\n| `INPUT` / `READ` | Get data from the user |\n| `OUTPUT` / `DISPLAY` / `PRINT` | Show results to the user |\n| `SET` / `=` / `:=` | Assign a value to a variable |\n| `IF ... THEN ... ELSE ... ENDIF` | Make a decision |\n| `WHILE ... DO ... ENDWHILE` | Repeat while a condition is true |\n| `FOR ... TO ... DO ... ENDFOR` | Repeat a fixed number of times |\n\n### Example: Calculate the Average of Three Numbers\n\n```\nINPUT num1, num2, num3\nSET total = num1 + num2 + num3\nSET average = total / 3\nOUTPUT \"The average is: \" + average\n```\n\n### Example: Determine Pass or Fail\n\n```\nINPUT mark\nIF mark >= 50 THEN\n  OUTPUT \"Pass\"\nELSE\n  OUTPUT \"Fail\"\nENDIF\n```"),
  fb(5, 'A step-by-step set of instructions to solve a problem is called an ___. A visual diagram that uses symbols to represent an algorithm is called a ___.',
    ['algorithm', 'flowchart'],
    'An algorithm is a sequence of clear, finite steps. A flowchart is the visual representation using standard shapes (ovals, rectangles, diamonds, parallelograms).'),
  t(6, "## Trace Tables\n\nA **trace table** is used to track the values of variables as an algorithm executes step by step. It helps you understand what the algorithm does and find errors.\n\n### Example: Trace this algorithm\n\n```\nSET x = 2\nSET y = 5\nSET z = x + y\nSET x = z * 2\nOUTPUT x, y, z\n```\n\n| Step | x | y | z | Output |\n|------|---|---|---|--------|\n| SET x = 2 | 2 | - | - | |\n| SET y = 5 | 2 | 5 | - | |\n| SET z = x + y | 2 | 5 | 7 | |\n| SET x = z * 2 | 14 | 5 | 7 | |\n| OUTPUT | 14 | 5 | 7 | 14, 5, 7 |\n\nTrace tables are especially useful when working with loops and conditional statements, where the values change with each iteration."),
  q(7, 'What is the purpose of a trace table?',
    ['To track the values of variables as an algorithm executes step by step', 'To convert decimal numbers to binary', 'To design the user interface', 'To store data permanently'], 0,
    'Trace tables help you follow an algorithm\'s execution by recording how variable values change at each step. They are invaluable for debugging and understanding algorithms.'),
  t(8, "## Comparing Algorithms\n\nAlgorithms can be compared based on:\n\n| Criterion | Description |\n|-----------|------------|\n| **Correctness** | Does it produce the right output for all valid inputs? |\n| **Efficiency** | Does it solve the problem using fewer steps or less time? |\n| **Clarity** | Is it easy to understand and follow? |\n| **Precision** | Are the steps exact and unambiguous? |\n\n### Sequence, Selection, and Iteration\n\nAll algorithms are built from three basic structures:\n\n| Structure | Description | Example |\n|-----------|-------------|--------|\n| **Sequence** | Steps execute one after another in order | Step 1, Step 2, Step 3 |\n| **Selection** | A decision determines which path to follow | IF mark >= 50 THEN Pass ELSE Fail |\n| **Iteration** | Steps are repeated (looped) | WHILE count < 10 DO ... |\n\nThese three structures can be combined to create any algorithm, no matter how complex."),
  fb(9, 'The three basic building blocks of all algorithms are sequence, ___, and iteration. The structure where a decision determines which path to follow is called ___.',
    ['selection', 'selection'],
    'Sequence (steps in order), selection (branching based on a condition), and iteration (looping/repeating) are the three fundamental algorithm structures.'),
  q(10, 'Which algorithm structure would you use to repeatedly ask a user for input until they enter a valid value?',
    ['Iteration (loop)', 'Sequence', 'Selection (decision)', 'None of the above'], 0,
    'Iteration (looping) repeats a block of steps. You would use a loop that keeps asking for input until the user enters a valid value (e.g. WHILE input is invalid DO ask again).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Introduction to Programming (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 5.1: The Delphi Environment, Variables, and Data Types
blockNum = 0;
const ch5_lesson1 = [
  t(1, "## Introduction to Programming\n\nA **program** is a set of instructions written in a programming language that tells a computer what to do.\n\n### The Programming Development Environment\n\nIn Grade 10 IT, we use **Delphi** (also known as RAD Studio or Lazarus for the free version). Delphi uses the **Object Pascal** language.\n\n### The Delphi IDE (Integrated Development Environment)\n\n| Component | Purpose |\n|-----------|--------|\n| **Form Designer** | Visual canvas where you design the user interface (GUI) by placing components |\n| **Code Editor** | Where you write Pascal code |\n| **Object Inspector** | View and change properties of selected components |\n| **Component Palette** | Contains buttons, labels, text boxes, and other GUI components |\n| **Project Manager** | Manages all files in your project |\n| **Compiler** | Translates your Pascal code into machine code that the computer can execute |\n| **Debugger** | Helps you find and fix errors in your code |\n\n### Common GUI Components\n\n| Component | Prefix | Purpose |\n|-----------|--------|--------|\n| **TButton** | btn | A clickable button |\n| **TEdit** | edt | A single-line text input field |\n| **TLabel** | lbl | Displays text (read-only) |\n| **TMemo** | mem | Multi-line text area |\n| **TListBox** | lst | A list of selectable items |\n| **TComboBox** | cmb | A drop-down list |\n| **TCheckBox** | chk | A tick box (on/off) |\n| **TRadioButton** | rb | A single-choice option button |"),
  t(2, "## Variables and Data Types\n\nA **variable** is a named storage location in memory that holds a value which can change during program execution.\n\n### Declaring Variables in Delphi\n\n```pascal\nvar\n  sName: string;      // text\n  iAge: integer;       // whole number\n  rPrice: real;        // decimal number\n  bPassed: boolean;    // true or false\n  cGrade: char;        // single character\n```\n\n### Data Types in Delphi\n\n| Data Type | Description | Example Values |\n|-----------|-------------|---------------|\n| **Integer** | Whole numbers (no decimals) | 5, -3, 0, 1000 |\n| **Real** | Numbers with decimal points | 3.14, -0.5, 99.99 |\n| **String** | A sequence of characters (text) | 'Hello', 'Grade 10' |\n| **Char** | A single character | 'A', '5', '#' |\n| **Boolean** | True or False | True, False |\n\n### Naming Conventions\n\n- Variable names must start with a letter or underscore\n- They cannot contain spaces or special characters (except underscore)\n- They are **not** case-sensitive in Delphi (iAge = iAGE)\n- Use a prefix to indicate the data type: `s` for string, `i` for integer, `r` for real, `b` for boolean, `c` for char"),
  q(3, 'Which data type should you use to store a student\'s name in Delphi?',
    ['String', 'Integer', 'Real', 'Boolean'], 0,
    'A name is text (a sequence of characters), so the String data type is correct. Integer is for whole numbers, Real for decimals, and Boolean for True/False.'),
  fb(4, 'A variable of type ___ stores whole numbers without decimals. A variable of type ___ stores True or False values.',
    ['integer', 'boolean'],
    'Integers store whole numbers like 5 or -3. Booleans store logical values: True or False.'),
  t(5, "## Constants\n\nA **constant** is like a variable, but its value cannot change during the program.\n\n```pascal\nconst\n  VAT_RATE = 0.15;         // 15% VAT in South Africa\n  SCHOOL_NAME = 'Campusly High School';\n  MAX_STUDENTS = 40;\n```\n\nConstants are written in UPPERCASE by convention. Use constants for values that should never change (like VAT rate or maximum class size).\n\n## Operators\n\n### Arithmetic Operators\n\n| Operator | Operation | Example | Result |\n|----------|-----------|---------|--------|\n| `+` | Addition | `5 + 3` | 8 |\n| `-` | Subtraction | `10 - 4` | 6 |\n| `*` | Multiplication | `6 * 7` | 42 |\n| `/` | Real division | `7 / 2` | 3.5 |\n| `div` | Integer division (whole part) | `7 div 2` | 3 |\n| `mod` | Modulus (remainder) | `7 mod 2` | 1 |\n\n### Order of Operations (BODMAS)\n\n1. **B**rackets\n2. **O**rders (powers)\n3. **D**ivision and **M**ultiplication (left to right)\n4. **A**ddition and **S**ubtraction (left to right)\n\nExample: `3 + 4 * 2` = `3 + 8` = **11** (not 14)"),
  q(6, 'What is the result of 17 mod 5 in Delphi?',
    ['2', '3', '3.4', '5'], 0,
    'The mod operator returns the remainder after integer division. 17 \u00f7 5 = 3 remainder 2, so 17 mod 5 = 2.'),
  t(7, "## Type Conversion\n\nDelphi is a **strongly typed** language, meaning you must convert between data types explicitly.\n\n### Conversion Functions\n\n| Function | From | To | Example |\n|----------|------|----|---------|\n| `IntToStr(i)` | Integer | String | `IntToStr(42)` \u2192 `'42'` |\n| `StrToInt(s)` | String | Integer | `StrToInt('42')` \u2192 `42` |\n| `FloatToStr(r)` | Real | String | `FloatToStr(3.14)` \u2192 `'3.14'` |\n| `StrToFloat(s)` | String | Real | `StrToFloat('3.14')` \u2192 `3.14` |\n| `FloatToStrF(r, fmt, p, d)` | Real | Formatted string | `FloatToStrF(3.14159, ffFixed, 10, 2)` \u2192 `'3.14'` |\n\n### Why Is Conversion Needed?\n\nGUI components like `TEdit` store text (strings). If the user types a number, you must convert it to an integer or real before doing calculations.\n\n```pascal\nvar\n  iNum1, iNum2, iSum: integer;\nbegin\n  iNum1 := StrToInt(edtNum1.Text);   // Convert string to integer\n  iNum2 := StrToInt(edtNum2.Text);\n  iSum := iNum1 + iNum2;\n  lblResult.Caption := IntToStr(iSum); // Convert integer to string\nend;\n```"),
  q(8, 'What function converts a string to an integer in Delphi?',
    ['StrToInt', 'IntToStr', 'FloatToStr', 'StrToFloat'], 0,
    'StrToInt converts a string (text) to an integer (whole number). IntToStr does the opposite: integer to string.'),
  t(9, "## Input and Output in Delphi\n\n### Output (Displaying Results)\n\n```pascal\n// Display in a label\nlblOutput.Caption := 'Hello, World!';\n\n// Display in a memo (multi-line)\nmemOutput.Lines.Add('Line 1');\nmemOutput.Lines.Add('Line 2');\n\n// Display in a message box\nShowMessage('The total is ' + IntToStr(iTotal));\n```\n\n### Input (Getting Data from the User)\n\n```pascal\n// Read from a text field\nvar\n  sName: string;\n  iAge: integer;\nbegin\n  sName := edtName.Text;              // Read text directly\n  iAge := StrToInt(edtAge.Text);      // Convert text to integer\nend;\n\n// Read using an input dialog\nvar\n  sInput: string;\nbegin\n  sInput := InputBox('Enter Name', 'What is your name?', '');\n  lblGreeting.Caption := 'Hello, ' + sInput + '!';\nend;\n```\n\n### Events\n\nIn Delphi, code runs in response to **events** (things that happen).\n\n| Event | When It Fires |\n|-------|---------------|\n| `OnClick` | When a button or component is clicked |\n| `OnChange` | When the text in a TEdit changes |\n| `OnCreate` | When the form first loads |\n| `OnKeyPress` | When a key is pressed in a component |"),
  fb(10, 'To read text from a TEdit component, use the property ___. To display text in a TLabel component, set its ___ property.',
    ['.Text', 'Caption'],
    'TEdit stores user input in its Text property. TLabel displays output through its Caption property.'),
];

// Lesson 5.2: Selection Structures
blockNum = 0;
const ch5_lesson2 = [
  t(1, "## Selection Structures\n\nSelection structures allow the program to make decisions and execute different code depending on a condition.\n\n### The IF Statement\n\nThe simplest decision structure:\n\n```pascal\nif condition then\n  // do something if condition is True;\n```\n\n**Example:**\n```pascal\nvar\n  iMark: integer;\nbegin\n  iMark := StrToInt(edtMark.Text);\n  if iMark >= 50 then\n    lblResult.Caption := 'You passed!';\nend;\n```\n\n### IF...ELSE Statement\n\n```pascal\nif condition then\n  // do this if True\nelse\n  // do this if False;\n```\n\n**Example:**\n```pascal\nvar\n  iMark: integer;\nbegin\n  iMark := StrToInt(edtMark.Text);\n  if iMark >= 50 then\n    lblResult.Caption := 'Pass'\n  else\n    lblResult.Caption := 'Fail';\nend;\n```\n\n**Important Delphi syntax rule:** There is NO semicolon before `else`. A semicolon ends the entire if-statement, so putting one before `else` causes a compiler error."),
  t(2, "### IF...ELSE IF (Nested IF)\n\nFor multiple conditions:\n\n```pascal\nvar\n  iMark: integer;\n  sSymbol: string;\nbegin\n  iMark := StrToInt(edtMark.Text);\n  if iMark >= 80 then\n    sSymbol := 'A (Outstanding)'\n  else if iMark >= 70 then\n    sSymbol := 'B (Meritorious)'\n  else if iMark >= 60 then\n    sSymbol := 'C (Substantial)'\n  else if iMark >= 50 then\n    sSymbol := 'D (Adequate)'\n  else if iMark >= 40 then\n    sSymbol := 'E (Elementary)'\n  else if iMark >= 30 then\n    sSymbol := 'F (Not Achieved)'\n  else\n    sSymbol := 'FF (Not Achieved)';\n  lblResult.Caption := sSymbol;\nend;\n```\n\n**Using begin...end for multiple statements:**\n\nIf you need to execute more than one statement in a branch, wrap them in `begin...end`:\n\n```pascal\nif iMark >= 50 then\nbegin\n  lblResult.Caption := 'Pass';\n  lblResult.Font.Color := clGreen;\nend\nelse\nbegin\n  lblResult.Caption := 'Fail';\n  lblResult.Font.Color := clRed;\nend;\n```"),
  q(3, 'What happens if you place a semicolon before the else keyword in Delphi?',
    ['A compiler error occurs because the semicolon ends the if-statement prematurely', 'Nothing; it works normally', 'The else block always executes', 'The if block is skipped'], 0,
    'In Delphi, a semicolon terminates the if-statement. Placing one before else means the compiler sees else as a standalone keyword, which causes a syntax error.'),
  t(4, "## Comparison Operators\n\n| Operator | Meaning | Example |\n|----------|---------|--------|\n| `=` | Equal to | `iAge = 18` |\n| `<>` | Not equal to | `sName <> ''` |\n| `>` | Greater than | `iMark > 50` |\n| `<` | Less than | `iPrice < 100` |\n| `>=` | Greater than or equal to | `iMark >= 50` |\n| `<=` | Less than or equal to | `iAge <= 21` |\n\n## Logical Operators\n\nCombine multiple conditions:\n\n| Operator | Meaning | Example |\n|----------|---------|--------|\n| `and` | Both conditions must be True | `(iAge >= 18) and (iAge <= 65)` |\n| `or` | At least one condition must be True | `(sDay = 'Saturday') or (sDay = 'Sunday')` |\n| `not` | Reverses the condition | `not bFinished` |\n\n**Example:**\n```pascal\nif (iMark >= 50) and (iAttendance >= 80) then\n  lblResult.Caption := 'Pass and Good Attendance'\nelse\n  lblResult.Caption := 'Check requirements';\n```"),
  fb(5, 'The operator ___ requires both conditions to be True. The operator ___ requires at least one condition to be True.',
    ['and', 'or'],
    'AND is True only when both conditions are True. OR is True when at least one condition is True.'),
  q(6, 'What is the result of (5 > 3) and (10 < 8)?',
    ['False', 'True', 'Error', '5'], 0,
    '(5 > 3) is True, but (10 < 8) is False. With AND, both conditions must be True for the result to be True. Since one is False, the result is False.'),
  t(7, "## The CASE Statement\n\nThe **case** statement is used when you need to compare a single variable against multiple possible values. It is cleaner than writing many if...else if statements.\n\n```pascal\nvar\n  iDay: integer;\nbegin\n  iDay := StrToInt(edtDay.Text);\n  case iDay of\n    1: lblResult.Caption := 'Monday';\n    2: lblResult.Caption := 'Tuesday';\n    3: lblResult.Caption := 'Wednesday';\n    4: lblResult.Caption := 'Thursday';\n    5: lblResult.Caption := 'Friday';\n    6: lblResult.Caption := 'Saturday';\n    7: lblResult.Caption := 'Sunday';\n  else\n    lblResult.Caption := 'Invalid day number';\n  end;\nend;\n```\n\n### Case with Ranges\n\n```pascal\ncase iMark of\n  80..100: sSymbol := 'A';\n  70..79:  sSymbol := 'B';\n  60..69:  sSymbol := 'C';\n  50..59:  sSymbol := 'D';\n  40..49:  sSymbol := 'E';\n  30..39:  sSymbol := 'F';\n  0..29:   sSymbol := 'FF';\nelse\n  sSymbol := 'Invalid';\nend;\n```\n\n**Note:** The case statement works with ordinal types (integer, char, boolean) but NOT with strings."),
  q(8, 'Which data type can NOT be used as the selector in a Delphi case statement?',
    ['String', 'Integer', 'Char', 'Boolean'], 0,
    'The case statement in Delphi only works with ordinal types (integer, char, boolean, enumerated types). Strings are not ordinal types, so they cannot be used as the selector.'),
  t(9, "## Input Validation\n\nAlways validate user input before processing it. Invalid input can cause runtime errors.\n\n### Common Validations\n\n| Check | Purpose | Example |\n|-------|---------|--------|\n| **Empty field** | Ensure the user entered something | `if edtName.Text = '' then ShowMessage('Enter a name');` |\n| **Numeric check** | Ensure the input is a valid number | Use `TryStrToInt` or `TryStrToFloat` |\n| **Range check** | Ensure the value is within an acceptable range | `if (iMark < 0) or (iMark > 100) then ShowMessage('Invalid mark');` |\n\n### Safe Conversion with TryStrToInt\n\n```pascal\nvar\n  iValue: integer;\nbegin\n  if TryStrToInt(edtInput.Text, iValue) then\n  begin\n    // iValue now contains the converted number\n    lblResult.Caption := 'Valid: ' + IntToStr(iValue);\n  end\n  else\n    ShowMessage('Please enter a valid whole number.');\nend;\n```\n\n`TryStrToInt` returns True if the conversion succeeds and False if it fails \u2014 without crashing the program. This is safer than `StrToInt`, which raises an error on invalid input."),
  fb(10, 'The function ___ safely converts a string to an integer without crashing the program if the input is invalid. Always ___ user input before processing it.',
    ['TryStrToInt', 'validate'],
    'TryStrToInt returns True/False instead of throwing an error. Input validation prevents crashes and ensures data integrity.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Social Implications (Term 1\u20132)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 6.1: Software Licensing and the Digital Divide
blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Software Licensing\n\nA **software licence** is a legal agreement that specifies how software may be used, distributed, and modified.\n\n### Types of Software Licences\n\n| Licence Type | Description | Example |\n|-------------|-------------|--------|\n| **Proprietary** | Paid licence; source code is hidden; restrictions on copying | Microsoft Office, Adobe Photoshop |\n| **Open source** | Source code is freely available; can be modified and shared | Linux, LibreOffice, Firefox |\n| **Freeware** | Free to use but source code is not available | Skype (basic), Adobe Acrobat Reader |\n| **Shareware** | Free to try for a limited time; payment required for continued use | WinRAR, some games |\n| **Public domain** | No copyright restrictions; completely free to use and modify | Very old software |\n| **Creative Commons** | Creator specifies permitted uses (e.g. may share but not sell) | Images, music, educational content |\n\n### Software Piracy\n\n**Piracy** is the illegal copying, distribution, or use of software without a valid licence.\n\n**Forms of piracy:**\n- Downloading cracked software from the internet\n- Copying a friend's installation disc\n- Using one licence on more computers than allowed\n- Selling counterfeit copies"),
  t(2, "### Consequences of Software Piracy\n\n| Impact | Description |\n|--------|------------|\n| **Legal** | Criminal prosecution; fines; imprisonment |\n| **Financial** | Developers lose revenue; reduces investment in new software |\n| **Security** | Pirated software often contains malware, viruses, or backdoors |\n| **No updates** | Pirated copies do not receive security updates or patches |\n| **No support** | Users cannot get official technical support |\n| **Ethical** | Stealing someone else's work is morally wrong |\n\n### Why Use Licensed Software?\n\n- Legal compliance \u2014 avoids prosecution\n- Security updates and patches\n- Official technical support\n- Reliability and stability\n- Supporting developers encourages innovation\n\n### South African Law\n\nThe **Copyright Act (No. 98 of 1978)** protects software as a literary work. The **Electronic Communications and Transactions (ECT) Act (No. 25 of 2002)** addresses digital crimes including software piracy. Penalties include fines and imprisonment."),
  q(3, 'Which type of software licence allows users to view and modify the source code?',
    ['Open source', 'Proprietary', 'Freeware', 'Shareware'], 0,
    'Open-source software provides the source code freely. Users can view, modify, and distribute it. Freeware is free but does not provide source code. Proprietary software hides its source code.'),
  fb(4, 'Illegal copying or distribution of software is called ___. In South Africa, the ___ Act protects software as a creative work.',
    ['piracy', 'Copyright'],
    'Software piracy violates copyright law. The South African Copyright Act (No. 98 of 1978) provides legal protection for software creators.'),
  t(5, "## The Digital Divide\n\nThe **digital divide** is the gap between people who have access to computers and the internet, and those who do not.\n\n### Causes of the Digital Divide in South Africa\n\n| Factor | Explanation |\n|--------|------------|\n| **Poverty** | Many families cannot afford computers, smartphones, or data/internet |\n| **Infrastructure** | Rural areas often lack electricity, cell towers, and fibre connections |\n| **Education** | Many people lack the digital literacy skills to use technology |\n| **Language** | Most online content is in English, which is not everyone's first language |\n| **Age** | Older generations may not be comfortable with technology |\n| **Gender** | In some communities, girls and women have less access to technology |\n\n### Impact of the Digital Divide\n\n- **Education:** Students without internet cannot access e-learning or online resources\n- **Employment:** Many jobs require computer skills; those without access are disadvantaged\n- **Healthcare:** Telemedicine and online health information are inaccessible\n- **Government services:** Online services like SARS eFiling or NSFAS applications require internet access"),
  t(6, "### Bridging the Digital Divide\n\n| Solution | Description |\n|----------|------------|\n| **Government free Wi-Fi** | Public Wi-Fi hotspots in libraries, community centres, and post offices |\n| **School computer labs** | Government-funded labs give learners access to computers |\n| **Mobile-first approach** | Designing websites and services for smartphones (most accessible device in SA) |\n| **Zero-rated websites** | Some sites (e.g. Wikipedia Zero) can be accessed without using mobile data |\n| **Digital literacy programmes** | Community training to teach basic computer skills |\n| **Affordable devices** | Government tablet programmes for schools |\n| **Infrastructure development** | Expanding cell towers, fibre, and electricity to rural areas |\n\n### Economic Reasons for Using Computers\n\n| Reason | Explanation |\n|--------|------------|\n| **Increased productivity** | Computers automate tasks, saving time and labour |\n| **Cost reduction** | Digital communication is cheaper than postal mail or phone calls |\n| **Global market access** | Small businesses can sell online worldwide |\n| **Better record-keeping** | Digital records are easier to search, update, and back up |\n| **Job creation** | IT sector creates new types of jobs (developer, data analyst, etc.) |\n| **Improved communication** | Email, video calls, and messaging are fast and cheap |"),
  q(7, 'Which of the following is NOT a cause of the digital divide in South Africa?',
    ['Too many free Wi-Fi hotspots', 'Poverty', 'Lack of infrastructure in rural areas', 'Limited digital literacy'], 0,
    'Too many free Wi-Fi hotspots would actually help bridge the digital divide. Poverty, lack of infrastructure, and limited digital literacy are all genuine causes of the divide.'),
  fb(8, 'The gap between people with and without access to technology is called the ___. South Africa uses ___ Wi-Fi hotspots in public places to help bridge this gap.',
    ['digital divide', 'free'],
    'The digital divide separates those with and without technology access. Government-funded free Wi-Fi in public spaces helps provide internet access to underserved communities.'),
  t(9, "## Ethical and Social Issues\n\n### Copyright and Plagiarism\n\n- **Copyright** gives creators legal control over how their work is used\n- **Plagiarism** is presenting someone else's work as your own \u2014 this is academic dishonesty\n- Always **cite sources** when using others' work (text, images, code)\n- Use **Creative Commons** licensed material where possible, following the licence terms\n\n### Health Issues from Computer Use\n\n| Issue | Cause | Prevention |\n|-------|-------|------------|\n| **Eye strain** | Prolonged screen time | 20-20-20 rule; adjust brightness |\n| **RSI (Repetitive Strain Injury)** | Repeated typing/mouse movements | Ergonomic equipment; take breaks |\n| **Back and neck pain** | Poor posture | Ergonomic chair; screen at eye level |\n| **Obesity** | Sedentary lifestyle | Exercise regularly; take movement breaks |\n\n### Ergonomics\n\n**Ergonomics** is the science of designing workspaces to fit the human body. A good ergonomic setup includes:\n- Monitor at arm's length, top of screen at eye level\n- Feet flat on the floor\n- Arms at a 90-degree angle when typing\n- Chair supporting the lower back"),
  q(10, 'What is the 20-20-20 rule for reducing eye strain?',
    ['Every 20 minutes, look at something 20 feet away for 20 seconds', 'Use a screen for only 20 minutes per day', 'Set brightness to 20%', 'Take a 20-minute break after 20 hours'], 0,
    'The 20-20-20 rule helps prevent eye strain: every 20 minutes, look at something 20 feet (about 6 metres) away for at least 20 seconds.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Networking Fundamentals (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 7.1: Networks and Communication
blockNum = 0;
const ch7_lesson1 = [
  t(1, "## What Is a Network?\n\nA **computer network** is two or more computers connected together to share resources (files, printers, internet access) and communicate.\n\n### Advantages of Networks\n\n- **Resource sharing:** Share printers, scanners, and internet connections\n- **File sharing:** Access files from any computer on the network\n- **Communication:** Send emails and messages within the organisation\n- **Centralised data:** Store data on a server for easy backup and management\n- **Cost savings:** Share software licences and hardware\n\n### Disadvantages of Networks\n\n- **Security risks:** Viruses and hackers can spread through the network\n- **Cost of setup:** Hardware (routers, switches, cables) and technical expertise needed\n- **Dependence on server:** If the server fails, all users may be affected\n- **Maintenance:** Requires ongoing management and technical support\n\n### Network Components\n\n| Component | Function |\n|-----------|----------|\n| **NIC (Network Interface Card)** | Hardware that connects a computer to a network (built-in or add-on) |\n| **Switch** | Connects multiple devices on a LAN; sends data to the correct device |\n| **Router** | Connects different networks; directs data between them (e.g. LAN to internet) |\n| **Modem** | Converts digital data to analogue signals (and vice versa) for telephone/cable lines |\n| **Access point** | Provides wireless connectivity (Wi-Fi) to devices |\n| **Network cable** | Physical connection (e.g. Ethernet/Cat5e/Cat6) |"),
  t(2, "## Types of Networks\n\n| Type | Range | Example |\n|------|-------|--------|\n| **PAN (Personal Area Network)** | Within a few metres | Bluetooth connection between phone and earphones |\n| **LAN (Local Area Network)** | A single building or campus | School computer lab, office network |\n| **WLAN (Wireless LAN)** | A LAN using Wi-Fi | Wi-Fi network at home or school |\n| **MAN (Metropolitan Area Network)** | A city or large campus | City-wide government network |\n| **WAN (Wide Area Network)** | Across countries or continents | The internet |\n\n### The Internet as a WAN\n\nThe **internet** is the largest WAN in the world. It connects billions of devices across the globe using standardised protocols (TCP/IP).\n\n### Client-Server vs Peer-to-Peer Networks\n\n| Feature | Client-Server | Peer-to-Peer |\n|---------|--------------|---------------|\n| **Central server** | Yes; server manages resources | No; all computers are equal |\n| **Security** | Centralised, stronger | Each user manages their own |\n| **Backup** | Centralised on server | Each user backs up own files |\n| **Cost** | Higher (server hardware and OS) | Lower |\n| **Best for** | Businesses, schools (10+ PCs) | Small home networks (2\u20135 PCs) |\n| **Example** | School network with a file server | Two laptops sharing files at home |"),
  q(3, 'Which network device connects different networks and directs data between them?',
    ['Router', 'Switch', 'NIC', 'Modem'], 0,
    'A router connects different networks (e.g. your home LAN to the internet) and directs (routes) data packets to the correct destination network.'),
  fb(4, 'A ___ connects multiple devices on a local network and sends data to the correct device. A ___ connects different networks and directs data between them.',
    ['switch', 'router'],
    'A switch operates within a single LAN, forwarding data frames to specific devices. A router connects separate networks and routes packets between them.'),
  t(5, "## Network Communication Media\n\n### Wired Media\n\n| Cable Type | Description | Speed | Use |\n|-----------|-------------|-------|-----|\n| **Twisted pair (Cat5e/Cat6)** | Most common LAN cable; copper wires twisted in pairs | Up to 10 Gbps (Cat6a) | LANs, Ethernet |\n| **Coaxial cable** | Central copper core surrounded by insulation and shielding | Moderate | Cable TV, older networks |\n| **Fibre optic** | Thin glass/plastic strands carrying light signals | Very fast (100+ Gbps) | Long-distance, backbone |\n\n### Fibre Optic vs Copper Cable\n\n| Feature | Fibre Optic | Copper (Twisted Pair) |\n|---------|-------------|----------------------|\n| **Speed** | Very fast | Slower |\n| **Distance** | Long (kilometres) | Short (100m for Ethernet) |\n| **Interference** | Immune to electromagnetic interference | Susceptible |\n| **Cost** | More expensive | Cheaper |\n| **Security** | Harder to tap | Easier to tap |\n\n### Wireless Media\n\n| Technology | Range | Speed |\n|-----------|-------|-------|\n| **Wi-Fi** | 30\u201350 m indoors | Up to 9.6 Gbps (Wi-Fi 6) |\n| **Bluetooth** | Up to 10 m | Low (for peripherals) |\n| **Infrared** | Line of sight, few metres | Low (remote controls) |"),
  q(6, 'Which type of network cable is immune to electromagnetic interference and can carry data over long distances?',
    ['Fibre optic', 'Twisted pair (Cat5e)', 'Coaxial cable', 'USB cable'], 0,
    'Fibre optic cables use light signals through glass/plastic strands. Light is immune to electromagnetic interference, and fibre can carry data over kilometres at very high speeds.'),
  t(7, "## Electronic Communication (e-Communication)\n\n### Types of e-Communication\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Email** | Electronic messages sent over the internet | Gmail, Outlook |\n| **Instant messaging** | Real-time text conversations | WhatsApp, Telegram |\n| **Video conferencing** | Live video and audio calls with multiple participants | Zoom, Microsoft Teams |\n| **VoIP** | Voice calls over the internet | WhatsApp calls, Skype |\n| **Social media** | Platforms for sharing content and interacting | Facebook, Instagram, Twitter/X |\n| **Forums/Discussion boards** | Online spaces for topic-based discussions | Reddit, Stack Overflow |\n\n### Email Best Practices\n\n- Use a clear, descriptive subject line\n- Address the recipient formally in professional emails\n- Keep messages concise and to the point\n- Proofread before sending\n- Do not open attachments from unknown senders\n- Use CC (Carbon Copy) for information; BCC (Blind Carbon Copy) to hide recipients\n- Do not use ALL CAPS (it is considered shouting)\n- Reply promptly to professional emails"),
  q(8, 'What is the difference between CC and BCC when sending an email?',
    ['CC recipients can see each other; BCC recipients are hidden from all others', 'CC is for attachments; BCC is for text only', 'CC sends immediately; BCC sends with a delay', 'There is no difference'], 0,
    'CC (Carbon Copy) recipients are visible to all recipients. BCC (Blind Carbon Copy) recipients are hidden \u2014 no one else can see who was BCC\'d.'),
  t(9, "### Communication Styles and Netiquette\n\n**Netiquette** (internet etiquette) refers to the rules of polite behaviour when communicating online.\n\n**Key netiquette rules:**\n- Be respectful and courteous\n- Do not type in ALL CAPITALS (it implies shouting)\n- Think before you post \u2014 once online, it is hard to take back\n- Do not share others' private information without permission\n- Give credit when using someone else's work\n- Do not spam (send unwanted mass messages)\n- Respect people's time \u2014 keep messages relevant and concise\n- Use appropriate language for the platform (formal for email, more casual for messaging)\n\n### Accuracy, Time, Distance, and Cost Considerations\n\n| Factor | Traditional Communication | Electronic Communication |\n|--------|--------------------------|-------------------------|\n| **Speed** | Slow (days for postal mail) | Instant or near-instant |\n| **Distance** | Limited by physical delivery | Global; no distance barrier |\n| **Cost** | Postage, printing, phone charges | Often free or very cheap |\n| **Accuracy** | Physical copies may degrade | Digital copies remain perfect |\n| **Record-keeping** | Paper files; hard to search | Digital; easy to search and back up |"),
  fb(10, 'The rules of polite behaviour when communicating online are called ___. VoIP stands for Voice over ___ Protocol.',
    ['netiquette', 'Internet'],
    'Netiquette is a combination of \"internet\" and \"etiquette.\" VoIP (Voice over Internet Protocol) transmits voice calls over the internet instead of traditional phone lines.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Internet Technologies (Term 2\u20133)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 8.1: The Internet and the World Wide Web
blockNum = 0;
const ch8_lesson1 = [
  t(1, "## The Internet\n\nThe **internet** is a global network of interconnected computer networks that communicate using standardised protocols (TCP/IP).\n\n### What You Need to Connect to the Internet\n\n| Requirement | Description |\n|-------------|------------|\n| **Device** | Computer, laptop, tablet, or smartphone |\n| **Network interface** | Wired (Ethernet) or wireless (Wi-Fi) adapter |\n| **ISP** | Internet Service Provider (e.g. Telkom, Vodacom, MTN, Rain) |\n| **Modem/Router** | Connects your network to the ISP |\n| **Web browser** | Software to view websites (Chrome, Firefox, Edge) |\n\n### Internet Connection Types in South Africa\n\n| Type | Technology | Speed | Notes |\n|------|-----------|-------|-------|\n| **ADSL** | Copper phone lines | Up to 10 Mbps | Older; being phased out |\n| **Fibre** | Fibre optic cables | 10\u20131000 Mbps | Fast; growing coverage |\n| **Mobile data (4G/LTE)** | Cell towers | 10\u2013100 Mbps | Widely available |\n| **Mobile data (5G)** | Cell towers | 100\u20131000+ Mbps | New; limited coverage |\n| **Fixed wireless** | Radio signals | 10\u201350 Mbps | For areas without fibre |\n| **Satellite** | Satellites | 10\u201350 Mbps | For very remote areas; high latency |"),
  t(2, "## The World Wide Web (WWW)\n\nThe **World Wide Web** is a collection of websites and web pages accessible through the internet using web browsers.\n\n**Important:** The internet and the World Wide Web are NOT the same thing:\n- The **internet** is the physical network infrastructure (cables, routers, servers)\n- The **WWW** is a service that runs ON the internet (one of many services, along with email, FTP, etc.)\n\n### Key Web Concepts\n\n| Concept | Description |\n|---------|------------|\n| **Website** | A collection of related web pages under one domain |\n| **Web page** | A single page of content, written in HTML |\n| **URL (Uniform Resource Locator)** | The address of a web page (e.g. `https://www.google.co.za`) |\n| **Domain name** | The human-readable name of a website (e.g. `google.co.za`) |\n| **Web server** | A computer that stores and serves web pages to browsers |\n| **Web browser** | Software that requests and displays web pages |\n| **HTTP/HTTPS** | Protocols for transferring web pages. HTTPS adds encryption for security |\n| **HTML** | HyperText Markup Language \u2014 the language used to create web pages |\n\n### Parts of a URL\n\n`https://www.campusly.co.za/about`\n\n| Part | Meaning |\n|------|---------|\n| `https://` | Protocol (secure HTTP) |\n| `www` | Subdomain (World Wide Web) |\n| `campusly` | Domain name |\n| `.co.za` | Top-level domain (South Africa, commercial) |\n| `/about` | Path (specific page) |"),
  q(3, 'What is the difference between the internet and the World Wide Web?',
    ['The internet is the physical network; the WWW is a service (websites) that runs on the internet', 'They are the same thing', 'The WWW is the physical network; the internet is a service', 'The internet is only for email; the WWW is for everything else'], 0,
    'The internet is the global network of connected computers. The WWW is a service that runs on the internet, allowing users to access websites via web browsers.'),
  t(4, "## Browsing and Searching the Internet\n\n### Web Browsers\n\nA **web browser** is software that displays web pages. It sends requests to web servers and renders the HTML, CSS, and JavaScript response.\n\n**Popular browsers:** Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari\n\n### Browser Features\n\n| Feature | Description |\n|---------|------------|\n| **Tabs** | View multiple web pages at once |\n| **Bookmarks/Favourites** | Save frequently visited sites |\n| **History** | Record of recently visited websites |\n| **Downloads** | Manage downloaded files |\n| **Extensions/Add-ons** | Extra features (ad blockers, password managers) |\n| **Private/Incognito mode** | Browse without saving history or cookies |\n\n### Search Engines\n\nA **search engine** indexes websites and allows users to find content by entering keywords.\n\n**Popular search engines:** Google, Bing, DuckDuckGo\n\n### Effective Searching Tips\n\n- Use **specific keywords** (not full sentences)\n- Use **quotation marks** for exact phrases: `\"climate change South Africa\"`\n- Use **minus sign** to exclude words: `jaguar -car` (finds the animal, not the car)\n- Use **site:** to search within a specific site: `site:gov.za water`\n- Check multiple sources to verify information\n- Look for reliable sources (educational sites .edu, government .gov, established news)"),
  fb(5, 'The acronym URL stands for Uniform Resource ___. A ___ engine indexes websites and helps users find content by entering keywords.',
    ['Locator', 'search'],
    'A URL (Uniform Resource Locator) is the address of a web page. Search engines like Google crawl and index web pages so users can find them with keyword searches.'),
  q(6, 'Which top-level domain indicates a South African commercial website?',
    ['.co.za', '.com', '.org', '.za.com'], 0,
    'The .co.za top-level domain is used for South African commercial organisations. .com is international, .org is for organisations, and .za.com is not standard.'),
  t(7, "## Internet Services\n\n### Common Internet Services\n\n| Service | Protocol | Description |\n|---------|----------|------------|\n| **World Wide Web** | HTTP/HTTPS | Browsing websites |\n| **Email** | SMTP/POP3/IMAP | Sending and receiving electronic mail |\n| **File Transfer** | FTP/SFTP | Uploading and downloading files to/from servers |\n| **Streaming** | RTSP/HLS | Watching video or listening to music in real time |\n| **Cloud storage** | HTTPS | Storing files online (Google Drive, OneDrive, Dropbox) |\n| **Online shopping** | HTTPS | Buying goods and services via websites |\n| **Social networking** | HTTPS | Connecting with others (Facebook, Instagram) |\n| **Online banking** | HTTPS | Managing finances online |\n\n### Cloud Computing\n\n**Cloud computing** means using services (storage, software, processing) hosted on remote servers accessed over the internet, rather than on your local computer.\n\n**Advantages:** Access from anywhere, automatic backups, no hardware costs, scalable\n**Disadvantages:** Requires internet connection, privacy concerns, ongoing subscription costs\n\n**Examples:** Google Drive, Microsoft 365 Online, iCloud, Dropbox"),
  q(8, 'What is cloud computing?',
    ['Using services hosted on remote servers, accessed over the internet', 'Computing that only works during cloudy weather', 'A type of computer hardware', 'A programming language'], 0,
    'Cloud computing provides services (storage, software, processing power) from remote servers via the internet, instead of running everything on your local computer.'),
  t(9, "## Online Safety and Security\n\n### Online Threats\n\n| Threat | Description |\n|--------|------------|\n| **Phishing** | Fake emails or websites that trick you into revealing personal information |\n| **Malware** | Malicious software (viruses, worms, trojans, ransomware, spyware) |\n| **Identity theft** | Someone steals your personal information to impersonate you |\n| **Cyberbullying** | Harassment, threats, or abuse through digital platforms |\n| **Scams** | Fraudulent schemes to steal money (e.g. fake competitions, Nigerian prince emails) |\n\n### Staying Safe Online\n\n- Use **strong, unique passwords** for each account\n- Enable **two-factor authentication (2FA)** where available\n- Do not click on suspicious links or open unknown attachments\n- Keep your software and antivirus **updated**\n- Do not share personal information (ID number, address, banking details) on social media\n- Verify websites are secure (look for **https://** and the padlock icon)\n- Be cautious of public Wi-Fi \u2014 avoid accessing banking or sensitive accounts\n- **Report** cyberbullying and inappropriate content to the platform and a trusted adult\n- Remember: what you post online is **permanent** \u2014 future employers may see it"),
  fb(10, 'Fake emails or websites designed to trick users into revealing personal information are called ___ attacks. Always look for ___ and the padlock icon in the browser to verify a website is secure.',
    ['phishing', 'https://'],
    'Phishing uses fake emails/websites that mimic legitimate ones to steal credentials. HTTPS and the padlock icon indicate the connection is encrypted.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Loops and Iteration (Term 2\u20133)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 9.1: For, While, and Repeat-Until Loops
blockNum = 0;
const ch9_lesson1 = [
  t(1, "## Iteration (Loops)\n\nIteration means repeating a block of code multiple times. Delphi provides three types of loops.\n\n### The FOR Loop\n\nUse a for loop when you **know in advance** how many times to repeat.\n\n```pascal\nfor counter := startValue to endValue do\nbegin\n  // code to repeat\nend;\n```\n\n**Example: Display numbers 1 to 10**\n```pascal\nvar\n  i: integer;\nbegin\n  for i := 1 to 10 do\n    memOutput.Lines.Add(IntToStr(i));\nend;\n```\n\n**Example: Count down from 10 to 1**\n```pascal\nvar\n  i: integer;\nbegin\n  for i := 10 downto 1 do\n    memOutput.Lines.Add(IntToStr(i));\n  memOutput.Lines.Add('Liftoff!');\nend;\n```\n\n**Key rules for the FOR loop:**\n- The counter variable must be an ordinal type (integer, char)\n- Do NOT change the counter inside the loop body\n- Use `to` to count up, `downto` to count down\n- The loop includes both the start and end values"),
  t(2, "### Practical FOR Loop Examples\n\n**Calculate the sum of numbers 1 to 100:**\n```pascal\nvar\n  i, iSum: integer;\nbegin\n  iSum := 0;\n  for i := 1 to 100 do\n    iSum := iSum + i;\n  ShowMessage('Sum = ' + IntToStr(iSum));  // 5050\nend;\n```\n\n**Display a times table:**\n```pascal\nvar\n  i, iNumber: integer;\nbegin\n  iNumber := StrToInt(edtNumber.Text);\n  memOutput.Lines.Clear;\n  for i := 1 to 12 do\n    memOutput.Lines.Add(\n      IntToStr(iNumber) + ' x ' + IntToStr(i) +\n      ' = ' + IntToStr(iNumber * i));\nend;\n```\n\n**Generate a string of stars:**\n```pascal\nvar\n  i, iCount: integer;\n  sStars: string;\nbegin\n  iCount := StrToInt(edtCount.Text);\n  sStars := '';\n  for i := 1 to iCount do\n    sStars := sStars + '*';\n  lblOutput.Caption := sStars;  // e.g. '****'\nend;\n```"),
  q(3, 'How many times does the following loop execute? for i := 3 to 7 do',
    ['5', '4', '7', '3'], 0,
    'The loop runs from 3 to 7 inclusive: 3, 4, 5, 6, 7 = 5 iterations. Count: 7 - 3 + 1 = 5.'),
  t(4, "## The WHILE Loop\n\nUse a while loop when you **do not know** how many times to repeat, and you want to check the condition **before** each iteration.\n\n```pascal\nwhile condition do\nbegin\n  // code to repeat\nend;\n```\n\n**Important:** The condition is checked BEFORE each iteration. If the condition is False initially, the loop body **never executes**.\n\n**Example: Keep asking until the user enters a positive number**\n```pascal\nvar\n  iNum: integer;\nbegin\n  iNum := StrToInt(InputBox('Input', 'Enter a positive number:', ''));\n  while iNum <= 0 do\n  begin\n    ShowMessage('Number must be positive. Try again.');\n    iNum := StrToInt(InputBox('Input', 'Enter a positive number:', ''));\n  end;\n  lblResult.Caption := 'You entered: ' + IntToStr(iNum);\nend;\n```\n\n**Warning:** If the condition never becomes False, the loop runs forever (an **infinite loop**). Always ensure the loop body changes something that will eventually make the condition False."),
  fb(5, 'A ___ loop checks the condition before each iteration and may never execute. If the condition never becomes False, the result is an ___ loop.',
    ['while', 'infinite'],
    'The while loop is a pre-test loop: it checks the condition first. If the condition is always True, the loop never stops, creating an infinite loop.'),
  t(6, "## The REPEAT-UNTIL Loop\n\nUse a repeat-until loop when you want the code to execute **at least once** before checking the condition.\n\n```pascal\nrepeat\n  // code to repeat\nuntil condition;  // exits when condition is True\n```\n\n**Important:** The condition is checked AFTER each iteration. The loop body always executes **at least once**.\n\n**Example: Password validation**\n```pascal\nvar\n  sPassword: string;\nbegin\n  repeat\n    sPassword := InputBox('Login', 'Enter password:', '');\n    if sPassword <> 'secret123' then\n      ShowMessage('Incorrect password. Try again.');\n  until sPassword = 'secret123';\n  ShowMessage('Access granted!');\nend;\n```\n\n**Note:** The repeat-until loop exits when the condition is **True** (opposite of while, which continues while the condition is True).\n\n**Example: Menu system**\n```pascal\nvar\n  sChoice: string;\nbegin\n  repeat\n    sChoice := InputBox('Menu', '1=Add  2=View  3=Exit', '');\n    case StrToInt(sChoice) of\n      1: ShowMessage('Add selected');\n      2: ShowMessage('View selected');\n    end;\n  until sChoice = '3';\nend;\n```"),
  q(7, 'Which loop always executes its body at least once?',
    ['Repeat-until', 'While', 'For', 'None of the above'], 0,
    'The repeat-until loop checks the condition AFTER the loop body executes. This guarantees the body runs at least once, even if the condition is True immediately.'),
  t(8, "## Comparing the Three Loops\n\n| Feature | FOR | WHILE | REPEAT-UNTIL |\n|---------|-----|-------|-------------|\n| **Condition check** | N/A (counter-based) | Before (pre-test) | After (post-test) |\n| **Minimum executions** | Known count | 0 (may not execute) | 1 (always runs once) |\n| **Best for** | Known number of iterations | Unknown iterations; may skip | Unknown iterations; must run once |\n| **Counter management** | Automatic | Manual | Manual |\n| **Exits when** | Counter exceeds end value | Condition is False | Condition is True |\n\n### Choosing the Right Loop\n\n| Scenario | Best Loop |\n|----------|-----------|\n| Display numbers 1 to 100 | FOR |\n| Read lines from a file until end | WHILE |\n| Ask for a password (must ask at least once) | REPEAT-UNTIL |\n| Process each item in a list of known size | FOR |\n| Keep running until user types \"quit\" | REPEAT-UNTIL |\n| Sum numbers while total < 1000 | WHILE |"),
  fb(9, 'A for loop is best when the number of iterations is ___. A repeat-until loop exits when the condition becomes ___.',
    ['known', 'True'],
    'For loops use a counter with a known start and end. Repeat-until loops continue running until the condition becomes True (opposite of while).'),
  q(10, 'What is wrong with this code?\nwhile True do\n  ShowMessage(\"Hello\");',
    ['It creates an infinite loop because the condition is always True', 'There is no error', 'True is not a valid condition', 'ShowMessage cannot be used in a loop'], 0,
    'The condition is always True and nothing inside the loop can change it, so the loop will run forever. This is an infinite loop and will freeze the program.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: String Handling Basics (Term 2\u20133)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch10_lesson1 = [
  t(1, "## String Handling in Delphi\n\nA **string** is a sequence of characters (text). In Delphi, strings are enclosed in single quotes: `'Hello World'`.\n\n### Basic String Operations\n\n| Function | Purpose | Example | Result |\n|----------|---------|---------|--------|\n| `Length(s)` | Returns the number of characters | `Length('Hello')` | 5 |\n| `Copy(s, start, count)` | Extracts a substring | `Copy('Delphi', 2, 3)` | `'elp'` |\n| `Pos(sub, s)` | Finds position of a substring | `Pos('ph', 'Delphi')` | 4 |\n| `UpperCase(s)` | Converts to UPPERCASE | `UpperCase('hello')` | `'HELLO'` |\n| `LowerCase(s)` | Converts to lowercase | `LowerCase('HELLO')` | `'hello'` |\n| `Trim(s)` | Removes leading and trailing spaces | `Trim('  hi  ')` | `'hi'` |\n| `Concat(s1, s2)` | Joins two strings (same as `+`) | `Concat('Hi', ' there')` | `'Hi there'` |\n\n### String Concatenation\n\nJoining strings together using the `+` operator:\n\n```pascal\nvar\n  sFirst, sSurname, sFull: string;\nbegin\n  sFirst := 'Thabo';\n  sSurname := 'Mokoena';\n  sFull := sFirst + ' ' + sSurname;  // 'Thabo Mokoena'\nend;\n```"),
  t(2, "### Using Copy and Pos\n\n**Copy(s, start, count)** extracts characters from a string:\n\n```pascal\nvar\n  s, sResult: string;\nbegin\n  s := 'Information Technology';\n  sResult := Copy(s, 1, 11);   // 'Information'\n  sResult := Copy(s, 13, 10);  // 'Technology'\nend;\n```\n\n**Pos(substring, string)** finds where a substring starts:\n\n```pascal\nvar\n  s: string;\n  iPos: integer;\nbegin\n  s := 'Hello World';\n  iPos := Pos('World', s);   // iPos = 7\n  iPos := Pos('xyz', s);     // iPos = 0 (not found)\nend;\n```\n\n**If the substring is not found, Pos returns 0.**\n\n### Practical Example: Extract First Name and Surname\n\n```pascal\nvar\n  sFull, sFirst, sSurname: string;\n  iSpace: integer;\nbegin\n  sFull := edtName.Text;  // e.g. 'Naledi Dlamini'\n  iSpace := Pos(' ', sFull);\n  if iSpace > 0 then\n  begin\n    sFirst := Copy(sFull, 1, iSpace - 1);         // 'Naledi'\n    sSurname := Copy(sFull, iSpace + 1, Length(sFull)); // 'Dlamini'\n  end;\nend;\n```"),
  q(3, 'What is the result of Copy(\"Technology\", 1, 4)?',
    ['Tech', 'Techno', 'echnology', 'nolo'], 0,
    'Copy starts at position 1 and takes 4 characters: T-e-c-h = \"Tech\".'),
  fb(4, 'The function ___ returns the number of characters in a string. The function ___ returns the position of a substring, or 0 if not found.',
    ['Length', 'Pos'],
    'Length counts all characters in a string. Pos searches for a substring and returns its starting position (or 0 if the substring does not exist).'),
  t(5, "## Accessing Individual Characters\n\nYou can access individual characters in a string using square brackets and an index:\n\n```pascal\nvar\n  s: string;\n  ch: char;\nbegin\n  s := 'Delphi';\n  ch := s[1];    // 'D' (first character)\n  ch := s[3];    // 'l' (third character)\n  ch := s[6];    // 'i' (last character)\nend;\n```\n\n**String indexing in Delphi starts at 1** (not 0 like some other languages).\n\n### Looping Through a String\n\n```pascal\nvar\n  s: string;\n  i: integer;\nbegin\n  s := 'Hello';\n  for i := 1 to Length(s) do\n    memOutput.Lines.Add('Character ' + IntToStr(i) +\n      ': ' + s[i]);\nend;\n```\n\n**Output:**\n```\nCharacter 1: H\nCharacter 2: e\nCharacter 3: l\nCharacter 4: l\nCharacter 5: o\n```"),
  q(6, 'In Delphi, what index does the first character of a string have?',
    ['1', '0', '-1', 'It depends on the string'], 0,
    'Delphi strings are 1-indexed, meaning the first character is at position 1. This is different from languages like Python or Java, which use 0-based indexing.'),
  t(7, "## Basic String Concatenation and Formatting\n\n### Building Output Strings\n\n```pascal\nvar\n  sName: string;\n  iAge: integer;\n  sOutput: string;\nbegin\n  sName := 'Sipho';\n  iAge := 16;\n  sOutput := 'Name: ' + sName + ', Age: ' + IntToStr(iAge);\n  // Result: 'Name: Sipho, Age: 16'\nend;\n```\n\n### Formatting Numbers for Output\n\n**FloatToStrF** gives control over decimal places:\n\n```pascal\nvar\n  rPrice: real;\nbegin\n  rPrice := 149.9;\n  // Display with 2 decimal places\n  lblPrice.Caption := 'R ' +\n    FloatToStrF(rPrice, ffFixed, 10, 2);\n  // Output: 'R 149.90'\nend;\n```\n\n### Currency Formatting (South African Rand)\n\n```pascal\nvar\n  rTotal: real;\nbegin\n  rTotal := 1250.5;\n  lblTotal.Caption := 'Total: R ' +\n    FloatToStrF(rTotal, ffFixed, 10, 2);\n  // Output: 'Total: R 1250.50'\nend;\n```\n\n### Including VAT Calculation\n\n```pascal\nconst\n  VAT_RATE = 0.15;\nvar\n  rPrice, rVAT, rTotal: real;\nbegin\n  rPrice := StrToFloat(edtPrice.Text);\n  rVAT := rPrice * VAT_RATE;\n  rTotal := rPrice + rVAT;\n  lblResult.Caption :=\n    'Price: R ' + FloatToStrF(rPrice, ffFixed, 10, 2) + #13 +\n    'VAT (15%): R ' + FloatToStrF(rVAT, ffFixed, 10, 2) + #13 +\n    'Total: R ' + FloatToStrF(rTotal, ffFixed, 10, 2);\nend;\n```"),
  fb(8, 'To format a real number with 2 decimal places in Delphi, use the ___ function. String indexing in Delphi starts at position ___.',
    ['FloatToStrF', '1'],
    'FloatToStrF with ffFixed format and 2 as the last parameter displays exactly 2 decimal places. Delphi uses 1-based string indexing.'),
  q(9, 'If rPrice = 200 and VAT_RATE = 0.15, what is rPrice * VAT_RATE?',
    ['30', '30.0', '200.15', '2000'], 0,
    '200 multiplied by 0.15 = 30. This represents the 15% VAT on a R200 item, which would make the total R230.'),
  t(10, "## String Comparison\n\nStrings can be compared using comparison operators. Delphi compares strings based on ASCII values (alphabetical order).\n\n```pascal\nif sName1 = sName2 then\n  ShowMessage('Names are the same');\n\nif sName1 < sName2 then\n  ShowMessage(sName1 + ' comes before ' + sName2 + ' alphabetically');\n```\n\n**How string comparison works:**\n- Characters are compared one by one using their ASCII values\n- 'A' (65) < 'B' (66) < ... < 'Z' (90)\n- 'a' (97) < 'b' (98) < ... < 'z' (122)\n- Uppercase letters come before lowercase: 'A' < 'a'\n\n**Case-insensitive comparison:**\n```pascal\nif UpperCase(sInput) = UpperCase(sAnswer) then\n  ShowMessage('Correct!');\n```\n\nConverting both strings to uppercase (or lowercase) before comparing removes case sensitivity, so 'Hello', 'hello', and 'HELLO' would all match."),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: Computer Management and Maintenance (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch11_lesson1 = [
  t(1, "## Computer Management\n\nComputer management involves maintaining, optimising, and protecting a computer system to ensure it runs efficiently.\n\n### File and Folder Management\n\n**Organising files properly** is essential for productivity:\n\n| Practice | Description |\n|----------|------------|\n| **Use descriptive names** | `Grade10_IT_Assignment1.docx` not `doc1.docx` |\n| **Create a folder structure** | Organise by subject, year, or project |\n| **Use consistent naming** | Follow a naming convention across all files |\n| **Delete unnecessary files** | Remove duplicates, temporary files, and old downloads |\n| **Back up regularly** | Copy important files to an external drive or cloud storage |\n\n### File Extensions\n\n| Extension | Type | Application |\n|-----------|------|------------|\n| `.docx` | Word document | Microsoft Word |\n| `.xlsx` | Spreadsheet | Microsoft Excel |\n| `.pptx` | Presentation | Microsoft PowerPoint |\n| `.pdf` | Portable document | Adobe Acrobat, any PDF reader |\n| `.txt` | Plain text | Notepad, any text editor |\n| `.jpg / .png` | Image | Image viewer, Paint |\n| `.mp3 / .mp4` | Audio / Video | Media player |\n| `.exe` | Executable program | Windows |\n| `.pas / .dpr` | Delphi source code | Delphi IDE |\n| `.zip / .rar` | Compressed archive | WinRAR, 7-Zip |"),
  t(2, "## Computer Maintenance\n\n### Software Maintenance\n\n| Task | Purpose | How Often |\n|------|---------|----------|\n| **Update the operating system** | Install security patches and bug fixes | Monthly or when prompted |\n| **Update applications** | Get new features and security fixes | Monthly |\n| **Update antivirus definitions** | Protect against the latest threats | Daily (usually automatic) |\n| **Run disk cleanup** | Remove temporary and unnecessary files | Monthly |\n| **Run disk defragmenter** | Optimise file layout on HDDs (not SSDs) | Every 3\u20136 months (HDD only) |\n| **Uninstall unused software** | Free up space and reduce clutter | As needed |\n| **Clear browser cache and cookies** | Free space and fix website issues | Monthly |\n\n### Hardware Maintenance\n\n| Task | Purpose | How Often |\n|------|---------|----------|\n| **Clean dust from fans and vents** | Prevent overheating | Every 6 months |\n| **Clean keyboard and mouse** | Hygiene and functionality | Monthly |\n| **Clean monitor screen** | Better visibility | Weekly |\n| **Check cables and connections** | Ensure secure connections | Monthly |\n| **Inspect for physical damage** | Identify problems early | Monthly |"),
  q(3, 'Why should you regularly update your operating system?',
    ['To install security patches and bug fixes that protect against threats', 'To make the computer look different', 'To delete all files', 'To make the computer slower'], 0,
    'Operating system updates include security patches that fix vulnerabilities, bug fixes that improve stability, and sometimes new features. Without updates, your computer is vulnerable to known exploits.'),
  t(4, "## Data Backup Strategies\n\nA **backup** is a copy of your data stored separately from the original, used for recovery if the original is lost or damaged.\n\n### Why Back Up?\n\n- Hardware failure (hard drive crash)\n- Malware or ransomware attack\n- Accidental deletion\n- Theft of the device\n- Natural disasters (fire, flood)\n\n### The 3-2-1 Backup Rule\n\n- **3** copies of your data (1 original + 2 backups)\n- **2** different storage types (e.g. external hard drive + cloud)\n- **1** copy stored offsite (e.g. cloud storage or at a different location)\n\n### Backup Methods\n\n| Method | Description |\n|--------|------------|\n| **Full backup** | Copies ALL data every time; slow but complete |\n| **Incremental backup** | Copies only files changed since the last backup; fast but needs all previous backups to restore |\n| **Differential backup** | Copies files changed since the last FULL backup; faster restore than incremental |\n\n### Backup Storage Options\n\n| Option | Pros | Cons |\n|--------|------|------|\n| **External HDD** | Large capacity, affordable | Can be lost, stolen, or damaged |\n| **USB flash drive** | Portable, affordable | Small capacity, easy to lose |\n| **Cloud storage** | Accessible anywhere, offsite | Requires internet, subscription cost |\n| **Network drive (NAS)** | Centralised, automatic | Expensive initial setup |"),
  fb(5, 'The 3-2-1 backup rule recommends keeping ___ copies of data on ___ different storage types, with one copy stored offsite.',
    ['3', '2'],
    'The 3-2-1 rule: 3 total copies, on 2 different media types, with 1 stored offsite (cloud or separate physical location) for disaster recovery.'),
  q(6, 'Which backup method copies only files that have changed since the last backup?',
    ['Incremental backup', 'Full backup', 'Differential backup', 'Mirror backup'], 0,
    'Incremental backup copies only files changed since the LAST backup (full or incremental). This makes it fast but requires all previous backups to restore.'),
  t(7, "## Troubleshooting Common Problems\n\n| Problem | Possible Cause | Solution |\n|---------|---------------|----------|\n| **Computer is slow** | Too many programs running; low RAM; malware | Close programs; add RAM; scan for malware |\n| **Computer won't turn on** | Power issue; loose cable | Check power cable; check outlet; test with different cable |\n| **Blue Screen of Death (BSOD)** | Hardware or driver issue | Update drivers; check for hardware faults |\n| **No internet connection** | Router issue; cable disconnected; ISP outage | Restart router; check cables; contact ISP |\n| **Printer not working** | Not connected; no paper; wrong driver | Check connections; add paper; reinstall driver |\n| **Software crashes** | Bug in software; incompatibility | Update software; reinstall; check system requirements |\n| **Running out of storage** | Too many files; large downloads | Delete unnecessary files; use cloud storage; add storage |\n\n### Problem-Solving Steps\n\n1. **Identify** the problem (what is happening?)\n2. **Investigate** possible causes\n3. **Plan** a solution\n4. **Implement** the fix\n5. **Test** whether the problem is resolved\n6. **Document** what you did (for future reference)"),
  q(8, 'A computer is running very slowly. Which of the following is the BEST first step?',
    ['Check if too many programs are running and close unnecessary ones', 'Immediately buy a new computer', 'Delete the operating system', 'Disconnect from the internet'], 0,
    'Too many running programs is the most common cause of slowness and the easiest to fix. Open Task Manager to see which programs are using the most CPU and memory, and close unnecessary ones.'),
  fb(9, 'A recurring error screen on Windows caused by hardware or driver issues is called the ___ Screen of Death. The first step in troubleshooting is to ___ the problem.',
    ['Blue', 'identify'],
    'The Blue Screen of Death (BSOD) indicates a critical Windows error. Troubleshooting always starts with clearly identifying what the problem actually is.'),
  t(10, "## Responsible Use of Computers\n\n### POPIA (Protection of Personal Information Act)\n\nSouth Africa's data protection law that regulates how organisations collect, store, and use personal information.\n\n**Key principles:**\n- Only collect data you actually need\n- Tell people what data you are collecting and why\n- Keep data accurate and up to date\n- Protect data with reasonable security measures\n- People have the right to access, correct, and delete their data\n\n### Responsible Digital Citizenship\n\n- **Respect** others online (no cyberbullying, no hate speech)\n- **Protect** your personal information and privacy\n- **Think** before you post (it may be permanent)\n- **Report** inappropriate content and behaviour\n- **Balance** screen time with physical activity and social interaction\n- **Credit** original creators when using their work\n- **Use strong passwords** and enable 2FA\n- **Keep** your devices and software updated"),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Software Engineering Principles (Term 2 & 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch12_lesson1 = [
  t(1, "## Problem Solving with Computers\n\n### What Is Problem Solving?\n\n**Problem solving** is the process of identifying a problem, planning a solution, implementing it, and testing it.\n\n### Problem-Solving Steps\n\n1. **Understand the problem** \u2014 What are the inputs? What output is expected? What are the constraints?\n2. **Plan the solution** \u2014 Write pseudocode, draw a flowchart, or describe the algorithm\n3. **Code the solution** \u2014 Write the program in Delphi\n4. **Test and debug** \u2014 Run the program with different inputs to find and fix errors\n5. **Evaluate** \u2014 Does it solve the problem correctly? Is it efficient?\n\n### Types of Errors\n\n| Error Type | When Detected | Description | Example |\n|-----------|--------------|-------------|--------|\n| **Syntax error** | At compile time | Violates language rules | Missing semicolon, misspelled keyword |\n| **Logic error** | At runtime (wrong results) | Code runs but produces incorrect output | Using `+` instead of `*` |\n| **Runtime error** | At runtime (crash) | Code compiles but crashes during execution | Division by zero, file not found |"),
  t(2, "### Debugging Techniques\n\n| Technique | Description |\n|-----------|------------|\n| **Read error messages** | The compiler tells you the line number and type of error |\n| **Trace the code** | Walk through the code line by line with sample values |\n| **Use ShowMessage** | Display variable values at key points to check them |\n| **Use breakpoints** | Pause execution at specific lines in the IDE |\n| **Step through code** | Execute one line at a time using the debugger (F7 or F8 in Delphi) |\n| **Comment out code** | Temporarily disable sections to isolate the problem |\n| **Check brackets** | Ensure every `begin` has a matching `end` |\n| **Check semicolons** | Ensure no semicolon before `else` |\n\n### Common Syntax Errors in Delphi\n\n| Error | Correct Code |\n|-------|-------------|\n| Missing semicolon | `x := 5;` (not `x := 5`) |\n| Semicolon before else | `...then x := 5 else...` (no `;` before `else`) |\n| Missing `begin...end` | Wrap multiple statements in `begin...end` |\n| Wrong assignment operator | `:=` for assignment (not `=`, which is comparison) |\n| Undeclared variable | Declare all variables in the `var` section |\n| Wrong case in string comparisons | Use `UpperCase()` for case-insensitive comparisons |"),
  q(3, 'A program compiles successfully but produces incorrect results. What type of error is this?',
    ['Logic error', 'Syntax error', 'Runtime error', 'Compiler error'], 0,
    'A logic error means the code is syntactically correct (it compiles) and runs without crashing, but the output is wrong because the logic or formula is incorrect.'),
  fb(4, 'An error that occurs when code violates the language rules and prevents compilation is a ___ error. An error that occurs during execution (e.g. division by zero) is a ___ error.',
    ['syntax', 'runtime'],
    'Syntax errors are detected by the compiler before the program runs. Runtime errors occur during execution when the program encounters an impossible operation.'),
  t(5, "## The Software Development Life Cycle (SDLC)\n\nThe SDLC is a structured process for developing software.\n\n| Phase | Activities |\n|-------|------------|\n| **1. Analysis** | Understand the problem; gather requirements; define inputs, outputs, and processes |\n| **2. Design** | Plan the solution using pseudocode, flowcharts, and UI mockups |\n| **3. Implementation** | Write the actual code in the chosen programming language |\n| **4. Testing** | Test with different data to verify correctness; fix bugs |\n| **5. Documentation** | Write user guides, help files, and code comments |\n| **6. Maintenance** | Fix bugs found after release; add new features; adapt to changes |\n\n### PAT (Practical Assessment Task)\n\nYour Grade 10 PAT follows the SDLC:\n1. **Task definition:** Understand the requirements from the task description\n2. **Design:** Plan the user interface (screens) and algorithms\n3. **Coding:** Implement the solution in Delphi\n4. **Testing:** Test with normal, boundary, and abnormal data\n5. **Documentation:** Write a user manual\n6. **Submission:** Submit all files (code, executable, documentation)"),
  t(6, "## Testing Your Programs\n\n### Types of Test Data\n\n| Type | Purpose | Example (Age field, valid range 5\u201318) |\n|------|---------|--------------------------------------|\n| **Normal data** | Valid, typical input | 10, 14, 16 |\n| **Boundary data** | Values at the edge of valid range | 5, 18 |\n| **Abnormal/Erroneous data** | Invalid input that should be rejected | -3, 200, 'abc' |\n\n### Example Test Plan\n\n**Program:** Calculate whether a student passes or fails (pass mark = 50)\n\n| Test # | Input | Expected Output | Type |\n|--------|-------|----------------|------|\n| 1 | 75 | Pass | Normal |\n| 2 | 30 | Fail | Normal |\n| 3 | 50 | Pass | Boundary |\n| 4 | 49 | Fail | Boundary |\n| 5 | 0 | Fail | Boundary |\n| 6 | 100 | Pass | Boundary |\n| 7 | -5 | Error message | Abnormal |\n| 8 | 150 | Error message | Abnormal |\n| 9 | 'abc' | Error message | Abnormal |\n\nAlways test **all paths** through your code. If you have an if...else, test inputs that go through both branches."),
  q(7, 'For an input field that accepts marks from 0 to 100, which value is an example of boundary test data?',
    ['0', '50', '-5', '75'], 0,
    'Boundary data tests the edges of the valid range. For 0-100, the boundary values are 0, 100, and values just outside (like -1 and 101). 50 is normal data; -5 is abnormal data.'),
  t(8, "## Documentation\n\n### Internal Documentation (In-Code Comments)\n\nComments explain your code to other programmers (and your future self).\n\n```pascal\n// This is a single-line comment\n\n{ This is a\n  multi-line comment }\n\n(* This is also a\n   multi-line comment *)\n```\n\n**What to comment:**\n- The purpose of each procedure/function\n- Complex calculations or logic\n- Variables that need explanation\n- Important decisions or workarounds\n\n**Example:**\n```pascal\n// Calculate the final price including 15% VAT\nrVAT := rPrice * 0.15;\nrTotal := rPrice + rVAT;  // Total with VAT included\n```\n\n### External Documentation\n\n| Type | Audience | Content |\n|------|----------|---------|\n| **User manual** | End users | How to install, use, and troubleshoot the program |\n| **Technical documentation** | Developers | Design decisions, code structure, algorithms used |\n| **Help file** | End users | Context-sensitive help within the application |\n| **README** | Anyone | Brief overview of the project, setup instructions |"),
  fb(9, 'Comments in Delphi code are called ___ documentation. A document that explains how to use the software for end users is called a ___.',
    ['internal', 'user manual'],
    'Internal documentation (comments) is written inside the code. A user manual is external documentation written for the people who will use the software.'),
  q(10, 'Which SDLC phase involves fixing bugs found after the software has been released to users?',
    ['Maintenance', 'Testing', 'Implementation', 'Analysis'], 0,
    'Maintenance is the final SDLC phase, where bugs discovered after release are fixed, new features may be added, and the software is adapted to changing requirements.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 13: Revision (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch13_lesson1 = [
  t(1, "## Grade 10 IT Revision \u2014 Hardware and Systems\n\n### Hardware Summary\n\n**Computer components:** Motherboard (main circuit board), CPU (processor), RAM (temporary memory), ROM (permanent, BIOS), PSU (power supply), HDD/SSD (storage), GPU (graphics).\n**Input devices:** Keyboard, mouse, microphone, scanner, webcam, touchscreen, barcode reader.\n**Output devices:** Monitor, printer, speakers, headphones, projector.\n**Storage:** HDD (slow, cheap, large), SSD (fast, durable, expensive). USB flash drive, SD card, cloud storage.\n**Ports:** USB (Type-A, Type-C), HDMI, Ethernet (RJ-45), VGA, audio jack.\n\n### System Software Summary\n\n**Operating System functions:** Processor management, memory management, file management, device management, user interface, security.\n**OS types:** Desktop (Windows, macOS, Linux), mobile (Android, iOS). Open source vs proprietary.\n**Utility programs:** Antivirus, disk cleanup, defragmenter (HDD only), backup, file compression, firewall.\n**Device drivers:** Software that allows the OS to communicate with specific hardware."),
  t(2, "### Data Representation Summary\n\n**Number systems:** Decimal (base 10, digits 0-9), binary (base 2, digits 0-1).\n**Conversion:** Decimal to binary (repeated division by 2), binary to decimal (add place values).\n**Storage units:** Bit < Nibble (4 bits) < Byte (8 bits) < KB (1024 B) < MB < GB < TB.\n**Character encoding:** ASCII (256 characters, 1 byte), Unicode (149 000+ characters, 1-4 bytes). ASCII codes: A=65, a=97, 0=48.\n**Data types:** All data stored as binary. Text (character codes), numbers (binary integers/floats), images (pixel RGB values), sound (sampled waveforms)."),
  t(3, "### Programming Summary\n\n**Delphi IDE:** Form Designer, Code Editor, Object Inspector, Component Palette.\n**Variables:** Named storage; declared with `var`. Types: integer, real, string, char, boolean.\n**Constants:** Fixed values; declared with `const`. Named in UPPERCASE.\n**Operators:** + - * / div mod. BODMAS order.\n**Type conversion:** IntToStr, StrToInt, FloatToStr, StrToFloat, FloatToStrF, TryStrToInt.\n**Input:** edtName.Text, InputBox. **Output:** lblResult.Caption, ShowMessage, memOutput.Lines.Add.\n**Selection:** if...then, if...then...else, if...else if, case...of.\n**Comparison:** = <> > < >= <=. **Logical:** and, or, not.\n**Validation:** TryStrToInt, range checks, empty field checks."),
  q(4, 'What is the decimal value of binary 10110?',
    ['22', '10110', '16', '11'], 0,
    'Binary 10110: place values 16, 8, 4, 2, 1. Calculate: 16 + 0 + 4 + 2 + 0 = 22.'),
  t(5, "### Loops and Strings Summary\n\n**Loops:** For (known count, automatic counter), while (pre-test, may not execute), repeat-until (post-test, always executes once).\n**Loop comparison:** For = known iterations; while = check before; repeat-until = check after.\n**Strings:** Length (character count), Copy (extract substring), Pos (find substring), UpperCase, LowerCase, Trim, Concat (+).\n**String indexing:** Starts at 1 in Delphi. Access characters with s[i].\n**String comparison:** Uses ASCII values; use UpperCase() for case-insensitive comparison.\n**Formatting:** FloatToStrF(value, ffFixed, width, decimals) for controlled decimal output."),
  t(6, "### Networks and Internet Summary\n\n**Networks:** PAN, LAN, WLAN, MAN, WAN. Components: NIC, switch, router, modem, access point.\n**Network types:** Client-server (central server, stronger security) vs peer-to-peer (all equal, small networks).\n**Cables:** Twisted pair (LAN), coaxial (TV), fibre optic (fast, long distance, no interference).\n**Internet:** Global WAN using TCP/IP. WWW is a service ON the internet.\n**Web:** URL, domain name, HTTP/HTTPS, HTML, web browser, web server.\n**Search:** Use specific keywords, quotes for exact phrases, minus to exclude.\n**e-Communication:** Email, IM, video conferencing, VoIP, social media.\n**Cloud computing:** Services hosted on remote servers, accessed via internet."),
  q(7, 'Which loop in Delphi checks the condition AFTER the loop body executes?',
    ['Repeat-until', 'While', 'For', 'Case'], 0,
    'Repeat-until is a post-test loop: it executes the body first, then checks the condition. It always runs at least once. While is pre-test (checks before).'),
  t(8, "### Social Implications and Safety Summary\n\n**Software licences:** Proprietary (paid, closed), open source (free, open code), freeware (free, closed code), shareware (try before buy), Creative Commons.\n**Piracy:** Illegal copying/distribution of software. Consequences: legal, security, ethical.\n**Digital divide:** Gap between those with and without technology access. Causes: poverty, infrastructure, education.\n**Health:** Eye strain (20-20-20 rule), RSI, back pain. Solution: ergonomics.\n**Online safety:** Strong passwords, 2FA, avoid phishing, verify HTTPS, update software.\n**POPIA:** South Africa's data protection law \u2014 collect only what you need, keep it safe, respect people's rights.\n**Computer maintenance:** Update OS and software, run antivirus, backup data (3-2-1 rule), clean hardware.\n**SDLC:** Analysis \u2192 Design \u2192 Implementation \u2192 Testing \u2192 Documentation \u2192 Maintenance.\n**Testing:** Normal, boundary, and abnormal data. Debug with trace tables, ShowMessage, breakpoints.\n**Errors:** Syntax (compile time), logic (wrong results), runtime (crash)."),
  fb(9, 'The three types of errors in programming are syntax, ___, and runtime. To safely convert a string to an integer without crashing, use the ___ function.',
    ['logic', 'TryStrToInt'],
    'Syntax errors prevent compilation; logic errors produce wrong results; runtime errors crash the program during execution. TryStrToInt returns True/False instead of raising an exception.'),
  q(10, 'A teacher wants to store each learner\'s name. Which Delphi data type should be used?',
    ['String', 'Integer', 'Boolean', 'Real'], 0,
    'A learner\'s name is text (a sequence of characters), so the String data type is appropriate. Integer is for whole numbers, Boolean for True/False, and Real for decimal numbers.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Insert into MongoDB
// ═══════════════════════════════════════════════════════════════════════════════

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

  // Find or create IT subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Info.*Tech/i });
  let SUBJECT_ID;
  if (subjectDoc) {
    SUBJECT_ID = subjectDoc._id;
    console.log('Found IT subject:', String(SUBJECT_ID));
  } else {
    const result = await db.collection('subjects').insertOne({
      name: 'Information Technology',
      code: 'IT',
      schoolId: SCHOOL_ID,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    SUBJECT_ID = result.insertedId;
    console.log('Created IT subject:', String(SUBJECT_ID));
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
      title: 'Chapter 1: Basic Concepts of Computing',
      description: 'What is a computer, ICT systems, types of computers, IPOS cycle, input/output/processing/storage devices, data vs information, RAM vs ROM.',
      order: 1,
      lessons: [
        { title: 'What Is a Computer and ICT System?', description: 'Computers defined, ICT system components, types of computers, input/output devices, processing and storage, RAM vs ROM, volatile vs non-volatile.', blocks: ch1_lesson1, term: 1 },
        { title: 'Hardware Components', description: 'System unit, motherboard, ports and connectors, USB standards, storage devices (HDD vs SSD), printers (inkjet vs laser), choosing hardware.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Data Representation and Storage',
      description: 'Binary number system, decimal-binary conversions, data storage units, ASCII and Unicode character encoding, how computers store different data types.',
      order: 2,
      lessons: [
        { title: 'Number Systems and Character Codes', description: 'Decimal and binary number systems, conversions, storage units (bit to terabyte), ASCII codes, Unicode, how text/images/sound are stored as binary.', blocks: ch2_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: System Software',
      description: 'System vs application software, operating system functions and types, GUI vs CLI, open source vs proprietary, utility programs, device drivers, application software.',
      order: 3,
      lessons: [
        { title: 'Operating Systems and System Software', description: 'Software categories, OS functions (processor/memory/file/device management), desktop and mobile OS, open source vs proprietary, utility programs, device drivers, application software.', blocks: ch3_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Algorithms and Problem Solving',
      description: 'Algorithm concepts, flowchart symbols, pseudocode, trace tables, sequence/selection/iteration structures, comparing algorithms.',
      order: 4,
      lessons: [
        { title: 'Algorithms, Flowcharts, and Pseudocode', description: 'What is an algorithm, flowchart symbols, pseudocode keywords, trace tables, sequence/selection/iteration, comparing algorithms for correctness and efficiency.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Introduction to Programming',
      description: 'The Delphi IDE, GUI components, variables and data types, constants, operators (arithmetic, comparison, logical), type conversion, input/output, selection structures (if, case), input validation.',
      order: 5,
      lessons: [
        { title: 'The Delphi Environment, Variables, and Data Types', description: 'Delphi IDE components, GUI controls, variables, data types (integer, real, string, char, boolean), constants, arithmetic operators, type conversion, input/output, events.', blocks: ch5_lesson1, term: 1 },
        { title: 'Selection Structures', description: 'If...then, if...else, nested if, begin...end blocks, comparison and logical operators (and, or, not), case statement, input validation with TryStrToInt.', blocks: ch5_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Social Implications',
      description: 'Software licensing (proprietary, open source, freeware, shareware), piracy, digital divide in South Africa, economic reasons for using computers, health issues, ergonomics, copyright, ethical issues.',
      order: 6,
      lessons: [
        { title: 'Software Licensing and the Digital Divide', description: 'Software licence types, piracy and its consequences, the digital divide in South Africa, bridging the divide, economic reasons for computing, health issues, ergonomics, copyright.', blocks: ch6_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 7: Networking Fundamentals',
      description: 'Network concepts, advantages/disadvantages, components (NIC, switch, router, modem), network types (PAN, LAN, WAN), client-server vs peer-to-peer, communication media, e-communication, netiquette.',
      order: 7,
      lessons: [
        { title: 'Networks and Communication', description: 'Network definition, advantages/disadvantages, components, PAN/LAN/WLAN/MAN/WAN, client-server vs peer-to-peer, wired vs wireless media, fibre optic, e-communication types, email best practices, netiquette.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Internet Technologies',
      description: 'The internet and WWW, connecting to the internet, ISPs, URLs, domain names, web browsers, search engines, internet services, cloud computing, online safety and security.',
      order: 8,
      lessons: [
        { title: 'The Internet and the World Wide Web', description: 'Internet vs WWW, connection types in South Africa, URLs and domain names, web browsers and search engines, internet services, cloud computing, online threats and safety.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Loops and Iteration',
      description: 'For loops, while loops, repeat-until loops, comparing loop types, choosing the right loop, infinite loops, practical loop examples.',
      order: 9,
      lessons: [
        { title: 'For, While, and Repeat-Until Loops', description: 'For loop (counter-based, to/downto), while loop (pre-test), repeat-until loop (post-test), comparing loops, choosing the right loop, infinite loops, practical examples.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: String Handling Basics',
      description: 'String functions (Length, Copy, Pos, UpperCase, LowerCase, Trim), string concatenation, accessing individual characters, formatting numbers, string comparison.',
      order: 10,
      lessons: [
        { title: 'String Functions and Formatting', description: 'Length, Copy, Pos, UpperCase, LowerCase, Trim, Concat, string indexing, character access, FloatToStrF formatting, VAT calculation, string comparison.', blocks: ch10_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 11: Computer Management and Maintenance',
      description: 'File management, file extensions, software and hardware maintenance, data backup strategies (3-2-1 rule), troubleshooting, POPIA, responsible digital citizenship.',
      order: 11,
      lessons: [
        { title: 'Maintenance, Backups, and Responsible Use', description: 'File management, file extensions, software/hardware maintenance, backup methods (full, incremental, differential), 3-2-1 rule, troubleshooting, POPIA, digital citizenship.', blocks: ch11_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Software Engineering Principles',
      description: 'Problem solving steps, types of errors (syntax, logic, runtime), debugging techniques, SDLC phases, testing with normal/boundary/abnormal data, documentation types, PAT process.',
      order: 12,
      lessons: [
        { title: 'Problem Solving, SDLC, Testing, and Documentation', description: 'Problem-solving steps, error types, debugging techniques, SDLC phases, PAT process, test data types, test plans, internal and external documentation.', blocks: ch12_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 13: Revision',
      description: 'Comprehensive revision of all Grade 10 IT topics: hardware, data representation, system software, algorithms, programming, social implications, networks, internet, loops, strings, maintenance, and software engineering.',
      order: 13,
      lessons: [
        { title: 'Grade 10 IT Comprehensive Revision', description: 'Full revision covering hardware, data representation, system software, algorithms, Delphi programming (variables, selection, loops, strings), networks, internet, social implications, maintenance, and software engineering.', blocks: ch13_lesson1, term: 4 },
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
    title: 'Grade 10 Information Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Basic Concepts of Computing, Data Representation, System Software, Algorithms, Introduction to Programming, Social Implications, Networking Fundamentals, Internet Technologies, Loops, String Handling, Computer Management, Software Engineering, and Revision for Grade 10 Information Technology.',
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
  console.log('  TEXTBOOK: Grade 10 Information Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
