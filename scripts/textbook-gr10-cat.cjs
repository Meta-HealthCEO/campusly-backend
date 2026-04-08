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
// CHAPTER 1: Introduction to Computers (Term 1, Weeks 1-2)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## What Is a Computer?\n\nA **computer** is an electronic device that accepts data (input), processes it according to a set of instructions (program), and produces information (output).\n\n### Why Study Computers?\n\nComputers are used in almost every part of modern life. In South Africa, computers are essential for:\n- Banking (FNB, Capitec, and Standard Bank apps)\n- Shopping (Takealot, Checkers Sixty60)\n- Education (Google Classroom, online learning)\n- Communication (WhatsApp, email)\n- Government services (SARS eFiling, Home Affairs online booking)\n\n### Definitions and Key Concepts\n\n| Term | Definition |\n|------|------------|\n| **Data** | Raw, unprocessed facts and figures (e.g., 85, "Sipho", 2025-03-15) |\n| **Information** | Data that has been processed and has meaning (e.g., "Sipho scored 85% for CAT") |\n| **Hardware** | The physical parts of a computer you can touch (keyboard, screen, CPU) |\n| **Software** | Programs and instructions that tell the hardware what to do (Windows, Word, Chrome) |\n| **ICT** | Information and Communication Technology \u2014 the use of computers and networks to manage information |'),
  q(2, 'What is the difference between data and information?',
    ['Data is raw unprocessed facts; information is processed data with meaning', 'Data and information mean the same thing', 'Information is raw facts; data is processed', 'Data is only numbers; information is only text'], 0,
    'Data consists of raw, unprocessed facts like numbers or names. When data is processed and given context, it becomes meaningful information.'),
  t(3, '## Types of Computers\n\nComputers come in many shapes and sizes. Each type is suited to different tasks.\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Desktop PC** | A computer designed for a fixed location, usually on a desk | Office computer at a school |\n| **Laptop / Notebook** | Portable computer with built-in screen, keyboard, and battery | A teacher presenting lessons in class |\n| **Tablet** | A flat touchscreen device, lighter than a laptop | Reading e-textbooks or browsing the web |\n| **Smartphone** | A pocket-sized device combining phone and computer | Checking WhatsApp or doing mobile banking |\n| **Server** | A powerful computer that provides services to other computers on a network | School file server storing learner data |\n| **Mainframe** | A very large, powerful computer used by big organisations | SARS processing millions of tax returns |\n| **Supercomputer** | The most powerful type, used for complex calculations | Weather forecasting at the SA Weather Service |\n\n### Embedded Computers\n\nAn **embedded computer** is a small computer built into another device to control a specific function. You may not even realise it is there.\n\n**Examples:**\n- Traffic light controller\n- Microwave oven timer\n- ATM machine\n- Car engine management system\n- Smart TV'),
  q(4, 'An ATM machine at a Capitec branch contains a small computer that manages banking transactions. This is an example of:',
    ['An embedded computer', 'A supercomputer', 'A mainframe', 'A desktop PC'], 0,
    'An embedded computer is built into a larger device to perform a specific, dedicated function. The ATM contains a specialised computer designed only for banking.'),
  t(5, '## ICTs in Everyday Life\n\nInformation and Communication Technologies (ICTs) are everywhere in South Africa.\n\n| Area | ICT Example |\n|------|-------------|\n| **Education** | Learners use tablets, laptops, and Google Classroom |\n| **Banking** | Online banking, ATMs, mobile payment apps like SnapScan |\n| **Healthcare** | Hospitals keep electronic patient records |\n| **Retail** | Supermarkets use barcode scanners and point-of-sale systems |\n| **Transport** | e-Toll systems, Uber and Bolt apps |\n| **Entertainment** | Streaming on DStv Now, Netflix, Spotify |\n| **Government** | SARS eFiling, applying for a learner licence online |\n\n### Convergence\n\n**Convergence** means combining multiple technologies into one device. A smartphone is the best example because it replaces:\n- A camera\n- A GPS navigator\n- A music player\n- A calculator\n- A torch\n- A calendar and diary'),
  fb(6, 'A ___ is an electronic device that accepts data, processes it, and produces information. Combining multiple technologies into one device is called ___.',
    ['computer', 'convergence'],
    'A computer processes data into information. Convergence is when separate technologies merge into a single device, such as a smartphone.'),
  q(7, 'Which of the following is the BEST example of convergence?',
    ['A smartphone that includes a camera, GPS, and music player', 'A desktop computer connected to a printer', 'A keyboard and mouse used together', 'A school network with multiple computers'], 0,
    'Convergence is the merging of multiple technologies into one device. A smartphone combines phone, camera, GPS, music player, torch, and computer into a single device.'),
  t(8, '## The Desktop (GUI)\n\nWhen you switch on a computer running Windows, you see the **desktop**. This is a **Graphical User Interface (GUI)** \u2014 it uses pictures (icons) instead of typed commands.\n\n### Parts of the Desktop\n\n| Element | Description |\n|---------|-------------|\n| **Desktop icons** | Small pictures that represent programs, files, or folders |\n| **Taskbar** | The bar at the bottom of the screen showing open programs and the Start button |\n| **Start button** | Opens the Start menu where you can find all programs |\n| **System tray** | The area on the right side of the taskbar (clock, Wi-Fi, volume, battery) |\n| **Recycle Bin** | Stores deleted files so you can recover them if needed |\n| **Wallpaper** | The background image on the desktop |\n\n### Using the Keyboard and Mouse\n\n**Mouse actions:**\n- **Click** (left button): Select an item\n- **Double-click**: Open a file or program\n- **Right-click**: Open a context menu with options\n- **Drag and drop**: Move items from one place to another\n- **Scroll wheel**: Scroll up and down on a page'),
  q(9, 'What happens when you right-click on an icon on the desktop?',
    ['A context menu appears with options like Open, Rename, Delete', 'The program opens immediately', 'The icon is deleted', 'The computer shuts down'], 0,
    'Right-clicking opens a context menu (also called a shortcut menu) that shows a list of actions you can perform on the selected item.'),
  fb(10, 'The ___ is the bar at the bottom of the Windows desktop. The ___ stores deleted files so you can recover them.',
    ['taskbar', 'Recycle Bin'],
    'The taskbar shows open programs, the Start button, and the system tray. The Recycle Bin temporarily holds deleted files until you empty it.'),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Keyboard Skills\n\nLearning to type efficiently is one of the most important computer skills. Good typing saves time and reduces errors.\n\n### Keyboard Layout\n\nMost computers use a **QWERTY** keyboard, named after the first six letters on the top row.\n\n### Key Groups\n\n| Group | Keys | Purpose |\n|-------|------|---------|\n| **Alphanumeric** | A\u2013Z, 0\u20139 | Type letters and numbers |\n| **Function keys** | F1\u2013F12 | Perform special actions (F1 = Help, F2 = Rename) |\n| **Modifier keys** | Shift, Ctrl, Alt | Used in combination with other keys for shortcuts |\n| **Navigation keys** | Arrow keys, Home, End, Page Up/Down | Move around a document |\n| **Numeric keypad** | 0\u20139 on the right side | Quick number entry (Num Lock must be on) |\n| **Special keys** | Enter, Backspace, Delete, Tab, Esc, Space | Various actions |\n\n### Essential Keyboard Shortcuts\n\n| Shortcut | Action |\n|----------|--------|\n| Ctrl+C | Copy selected item |\n| Ctrl+X | Cut selected item |\n| Ctrl+V | Paste |\n| Ctrl+Z | Undo the last action |\n| Ctrl+S | Save the current file |\n| Ctrl+A | Select all |\n| Ctrl+P | Print |\n| Alt+F4 | Close the current program |\n| Alt+Tab | Switch between open programs |'),
  q(2, 'Which keyboard shortcut undoes the last action you performed?',
    ['Ctrl+Z', 'Ctrl+S', 'Ctrl+C', 'Ctrl+V'], 0,
    'Ctrl+Z is the universal undo shortcut. It reverses your most recent action. You can press it multiple times to undo several actions.'),
  t(3, '## Typing Techniques\n\n### Home Row Position\n\nPlace your fingers on the **home row** keys:\n- Left hand: A, S, D, F (index finger on F \u2014 has a raised bump)\n- Right hand: J, K, L, ; (index finger on J \u2014 has a raised bump)\n- Thumbs rest on the spacebar\n\n### Good Typing Habits\n\n| Do | Do Not |\n|----|--------|\n| Use all ten fingers | Hunt and peck with two fingers |\n| Keep your eyes on the screen | Look at the keyboard while typing |\n| Sit up straight with feet flat on the floor | Slouch or lean forward |\n| Keep wrists level (use a wrist rest) | Bend wrists up or down |\n| Take regular breaks | Type for hours without stopping |\n\n### Ergonomics and Posture\n\n**Ergonomics** is the science of designing a workspace that fits the user and reduces strain.\n\n**Correct posture:**\n- Screen at arm\u2019s length, top of monitor at eye level\n- Chair adjusted so knees are at a 90-degree angle\n- Feet flat on the floor\n- Lower back supported by the chair\n- Room lighting positioned to reduce screen glare'),
  fb(4, 'The home row keys for the left hand are A, S, D, and ___. The science of designing a comfortable workspace is called ___.',
    ['F', 'ergonomics'],
    'The left hand rests on A, S, D, F with the index finger on F (which has a raised bump for positioning). Ergonomics studies how to design workspaces that fit the human body.'),
  t(5, '## Health Risks of Computer Use\n\nUsing a computer for long periods without breaks can cause health problems.\n\n| Health Risk | Cause | Prevention |\n|-------------|-------|------------|\n| **Eye strain** | Staring at a bright screen for too long | Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet (6 metres) away for 20 seconds |\n| **Repetitive Strain Injury (RSI)** | Repeated movements like typing or clicking | Take regular breaks, use an ergonomic keyboard and mouse |\n| **Back and neck pain** | Sitting with poor posture | Adjust chair height, keep monitor at eye level |\n| **Headaches** | Screen glare or incorrect brightness | Adjust brightness, use an anti-glare screen |\n| **Obesity** | Sitting for many hours without exercise | Take breaks, exercise regularly |\n| **Carpal tunnel syndrome** | Pressure on the wrist nerve from prolonged typing | Keep wrists straight, use a wrist rest |\n\n### The 20-20-20 Rule\n\nEvery **20 minutes**, look at something **20 feet** (about 6 metres) away for **20 seconds**. This relaxes the eye muscles and reduces eye strain.'),
  q(6, 'A learner complains of sore wrists after typing for three hours. Which health risk is this?',
    ['Repetitive Strain Injury (RSI)', 'Eye strain', 'Obesity', 'Headaches'], 0,
    'Repetitive Strain Injury (RSI) is caused by repeated movements like typing or clicking. It affects the hands, wrists, and forearms. Taking breaks and using ergonomic equipment helps prevent it.'),
  q(7, 'What does the 20-20-20 rule help prevent?',
    ['Eye strain', 'Back pain', 'RSI', 'Obesity'], 0,
    'The 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds) specifically helps prevent eye strain from prolonged screen use.'),
  fb(8, 'The 20-20-20 rule says every ___ minutes, look at something 20 feet away for 20 seconds. Poor ___ while sitting causes back and neck pain.',
    ['20', 'posture'],
    'The rule uses 20 as a guide for all three measurements. Maintaining good posture with proper chair and screen height prevents back and neck pain.'),
];

// =============================================================================
// CHAPTER 2: Computer Management and File Organisation (Term 1, Weeks 2-3)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Switching On and Logging In\n\nBefore you can use a computer, you need to start it up correctly.\n\n### Steps to Start a Computer\n\n1. Check that all cables are connected (power, monitor, keyboard, mouse)\n2. Switch on the monitor\n3. Press the power button on the system unit\n4. Wait for the operating system (Windows) to load\n5. Enter your username and password at the login screen\n6. The desktop appears \u2014 you are ready to work\n\n### User Accounts and Passwords\n\n| Concept | Description |\n|---------|-------------|\n| **Username** | Your unique identity on the computer (e.g., SiphoD or learner2025) |\n| **Password** | A secret word or phrase that proves you are who you say you are |\n| **Strong password** | At least 8 characters, mixing uppercase, lowercase, numbers, and symbols |\n| **Weak password** | Easy to guess: 12345, password, your name, your birthday |\n\n### Rules for Strong Passwords\n\n- At least 8 characters long\n- Mix uppercase (A\u2013Z) and lowercase (a\u2013z) letters\n- Include numbers (0\u20139)\n- Include special characters (!@#$%)\n- Do NOT use personal information (name, birthday, school name)\n- Do NOT share your password with anyone\n- Change your password regularly'),
  q(2, 'Which of the following is the STRONGEST password?',
    ['C@t_L0ver#2025', 'password123', 'sipho', '12345678'], 0,
    'C@t_L0ver#2025 is strong because it combines uppercase, lowercase, numbers, and special characters. The other options are weak because they are common words, names, or simple sequences.'),
  fb(3, 'A ___ password should be at least 8 characters and include a mix of letters, numbers, and symbols. You should ___ share your password with others.',
    ['strong', 'never'],
    'Strong passwords are long and complex. Sharing passwords compromises security \u2014 your account could be misused.'),
  t(4, '## File Management\n\nGood file management means organising your files so you can find them quickly.\n\n### Files and Folders\n\n| Concept | Description |\n|---------|-------------|\n| **File** | A single document, picture, program, or piece of data stored on the computer |\n| **Folder (Directory)** | A container that holds files and other folders |\n| **Path** | The address showing where a file is stored (e.g., C:\\Documents\\CAT\\Notes.docx) |\n\n### Naming Files\n\n**Good file names are:**\n- Descriptive: "CAT_Term1_Notes.docx" \u2014 you know what it is\n- Consistent: Use the same naming pattern for related files\n- Without special characters: Avoid / \\ : * ? " < > | in file names\n\n**Bad file names:**\n- "Document1.docx" \u2014 you cannot tell what it contains\n- "stuff.docx" \u2014 too vague\n- "my assignment that is due on friday.docx" \u2014 too long\n\n### Organising Files\n\nCreate a logical folder structure. For example:\n\n```\nMy Documents\n  \u2514\u2500 School\n      \u2514\u2500 Grade 10\n          \u251c\u2500 CAT\n          \u2502   \u251c\u2500 Term 1\n          \u2502   \u2514\u2500 Term 2\n          \u251c\u2500 Maths\n          \u2514\u2500 English\n```'),
  q(5, 'Which file name follows good naming conventions?',
    ['CAT_Term1_Assignment.docx', 'Document1.docx', 'stuff.docx', 'my assignment that is due on friday for CAT.docx'], 0,
    'CAT_Term1_Assignment.docx is descriptive, concise, and clearly identifies the subject, term, and content type.'),
  fb(6, 'A ___ is a container that holds files and other folders. The file ___ shows the complete address of where a file is stored.',
    ['folder', 'path'],
    'Folders organise files into groups. The file path is the address, such as C:\\Documents\\CAT\\Notes.docx.'),
  t(7, '## Backing Up Files\n\n**Backing up** means making a copy of your important files and storing them in a second location.\n\n### Why Back Up?\n\n- Computers can break down or be stolen\n- Files can be accidentally deleted\n- Viruses can destroy data\n- Load-shedding in South Africa can cause data corruption\n\n### Backup Methods\n\n| Method | Description |\n|--------|-------------|\n| **USB flash drive** | Copy files to a portable drive |\n| **External hard drive** | Larger storage for bigger backups |\n| **Cloud storage** | Upload to Google Drive, OneDrive, or Dropbox |\n| **Second computer** | Copy files to another machine on the network |\n\n### Backup Rules\n\n- Back up regularly (daily or weekly)\n- Keep backups in a different location from the original\n- Test your backups by opening the files to make sure they work\n- Use the 3-2-1 rule: **3** copies, on **2** different types of storage, with **1** copy offsite (e.g., cloud)'),
  q(8, 'Why should you keep a backup in a different location from the original files?',
    ['If the original location is damaged (fire, theft, flood), the backup is safe elsewhere', 'Backups only work when stored far away', 'It makes the files load faster', 'The computer requires it'], 0,
    'If both the original and backup are in the same location, a single event (fire, theft, flood) could destroy both. Storing a backup offsite (e.g., in the cloud) ensures you can recover your data.'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## File Operations\n\nYou need to know how to manage files using basic operations.\n\n### Common File Operations\n\n| Operation | Method | Keyboard Shortcut |\n|-----------|--------|-------------------|\n| **Create** | Right-click > New > choose type | N/A |\n| **Open** | Double-click the file | Ctrl+O (inside a program) |\n| **Save** | File > Save | Ctrl+S |\n| **Save As** | File > Save As | F12 |\n| **Rename** | Right-click > Rename | F2 |\n| **Copy** | Right-click > Copy | Ctrl+C |\n| **Cut** | Right-click > Cut | Ctrl+X |\n| **Paste** | Right-click > Paste | Ctrl+V |\n| **Delete** | Right-click > Delete | Delete key |\n| **Move** | Cut and then Paste in the new location | Ctrl+X, then Ctrl+V |\n\n### Copy vs Move\n\n| Action | Result |\n|--------|--------|\n| **Copy + Paste** | The original stays; a duplicate is created in the new location |\n| **Cut + Paste** | The original is removed and placed in the new location |\n\n### Searching for Files\n\nIf you cannot find a file, use the **search** feature:\n- Click the search icon on the taskbar\n- Type part of the file name\n- Windows searches your computer and shows matching files'),
  q(2, 'What is the difference between Copy and Cut?',
    ['Copy creates a duplicate; Cut removes the original and moves it', 'Copy and Cut do the same thing', 'Copy deletes the file; Cut creates a duplicate', 'Copy moves the file; Cut creates a duplicate'], 0,
    'Copy (Ctrl+C) creates a duplicate of the file, leaving the original in place. Cut (Ctrl+X) removes the file from its current location so it can be pasted elsewhere.'),
  t(3, '## File Specifications\n\nEvery file has properties that describe it.\n\n### File Properties\n\nRight-click a file and select **Properties** to see:\n\n| Property | Description | Example |\n|----------|-------------|--------|\n| **File name** | The name you gave the file | CAT_Notes |\n| **File extension** | The type of file (after the dot) | .docx, .xlsx, .pdf |\n| **File size** | How much storage space it uses | 256 KB, 1.5 MB |\n| **Location** | The folder path where the file is stored | C:\\Documents\\CAT\\ |\n| **Date created** | When the file was first made | 2025-02-10 |\n| **Date modified** | When the file was last changed | 2025-03-15 |\n| **Attributes** | Special settings | Read-only, Hidden |\n\n### Common File Extensions\n\n| Extension | File Type | Application |\n|-----------|-----------|-------------|\n| .docx | Word document | Microsoft Word |\n| .xlsx | Spreadsheet | Microsoft Excel |\n| .pptx | Presentation | Microsoft PowerPoint |\n| .pdf | Portable Document Format | Adobe Reader, web browser |\n| .txt | Plain text | Notepad |\n| .jpg / .png | Image | Photos, Paint |\n| .mp3 | Audio | Music player |\n| .mp4 | Video | Video player |\n| .html | Web page | Web browser |\n| .csv | Comma-separated values | Excel, Notepad |'),
  q(4, 'A file called "Report.xlsx" is most likely created using which application?',
    ['Microsoft Excel', 'Microsoft Word', 'Microsoft PowerPoint', 'Notepad'], 0,
    'The .xlsx extension is used by Microsoft Excel for spreadsheet files. Word uses .docx, PowerPoint uses .pptx, and Notepad uses .txt.'),
  fb(5, 'The file ___ is the letters after the dot in a file name that indicate the file type. A .pdf file can be opened by a web ___ or Adobe Reader.',
    ['extension', 'browser'],
    'The file extension (e.g., .docx, .pdf) tells the computer which program to use to open the file. PDF files can be viewed in web browsers or dedicated readers.'),
  t(6, '## File Manager (Windows Explorer)\n\nThe **File Manager** (also called File Explorer or Windows Explorer) is the program you use to browse, organise, and manage your files.\n\n### Parts of File Explorer\n\n| Part | Description |\n|------|-------------|\n| **Navigation pane** | Left side \u2014 shows drives, folders, and Quick Access locations |\n| **Address bar** | Shows the current folder path; you can type a path here |\n| **Content area** | Centre \u2014 displays files and folders in the current location |\n| **Search bar** | Top right \u2014 search for files in the current folder |\n| **Ribbon / toolbar** | Top \u2014 buttons for common actions (copy, paste, new folder) |\n\n### View Options\n\nYou can change how files are displayed:\n- **Large icons**: Shows big thumbnails (good for pictures)\n- **Small icons**: Compact view\n- **List**: Simple list of file names\n- **Details**: Shows name, date, size, and type (most useful for organising)\n\n### Sorting Files\n\nIn Details view, click a column header to sort:\n- **Name**: Alphabetical order\n- **Date modified**: Most recent first\n- **Size**: Largest or smallest first\n- **Type**: Grouped by file extension'),
  q(7, 'In File Explorer, which view shows the most information about each file (name, date, size, type)?',
    ['Details view', 'Large icons', 'Small icons', 'List view'], 0,
    'Details view displays files with columns for Name, Date Modified, Type, and Size, giving you the most information at a glance.'),
  fb(8, 'The ___ pane on the left side of File Explorer shows drives and folders. To see the most file information, use ___ view.',
    ['navigation', 'Details'],
    'The navigation pane lets you browse the folder tree. Details view shows file properties in columns.'),
];

// =============================================================================
// CHAPTER 3: Hardware \u2014 System Unit, Input, Output, Storage (Term 1, Weeks 3-4)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## The System Unit\n\nThe **system unit** (or computer case) is the box that contains the main electronic components of a computer.\n\n### Components Inside the System Unit\n\n| Component | Function |\n|-----------|----------|\n| **Motherboard** | The main circuit board connecting all components |\n| **CPU (Central Processing Unit)** | The "brain" \u2014 performs all processing and calculations |\n| **RAM (Random Access Memory)** | Temporary memory for data currently being used |\n| **Hard Drive / SSD** | Permanent storage for files and programs |\n| **Power Supply Unit (PSU)** | Converts electricity from the wall plug to power the components |\n| **Graphics card (GPU)** | Processes images and video for the monitor |\n| **Cooling fans** | Prevent components from overheating |\n| **Expansion slots** | Allow extra cards to be added (graphics, sound, network) |\n\n### The CPU\n\nThe CPU is the most important component. It carries out instructions from programs.\n\n| CPU Feature | Description |\n|-------------|-------------|\n| **Clock speed** | Measured in GHz \u2014 how fast the CPU processes instructions |\n| **Cores** | Modern CPUs have multiple cores (dual-core, quad-core) to handle multiple tasks |\n| **Cache** | Very fast memory inside the CPU for frequently used data |'),
  q(2, 'Which component is considered the "brain" of the computer?',
    ['CPU (Central Processing Unit)', 'RAM', 'Hard Drive', 'Power Supply Unit'], 0,
    'The CPU performs all calculations and processes all instructions. It is called the "brain" because it controls everything the computer does.'),
  t(3, '## Ports and Connectors\n\nPorts are sockets on the outside of the system unit where you plug in external devices.\n\n| Port | Purpose | What You Plug In |\n|------|---------|------------------|\n| **USB-A** | Universal Serial Bus (standard) | Flash drive, mouse, keyboard, printer |\n| **USB-C** | Modern, reversible USB connector | Smartphones, newer laptops, chargers |\n| **HDMI** | High-Definition Multimedia Interface | Monitor, TV, projector (video + audio) |\n| **Ethernet (RJ-45)** | Wired network connection | Network cable to router or switch |\n| **3.5 mm audio jack** | Audio input/output | Headphones, speakers, microphone |\n| **VGA** | Older video connector (analogue) | Older monitors and projectors |\n| **Power port** | AC power input | Power cable from wall socket |\n\n### Peripheral Devices\n\nA **peripheral** is any external device connected to the computer through a port.\n\n**Connection methods:**\n- **Wired (cabled)**: USB cable, HDMI cable, Ethernet cable\n- **Wireless**: Bluetooth (keyboard, mouse, headphones), Wi-Fi (printer, network)'),
  fb(4, 'The ___ is the main circuit board inside the system unit. A ___ port is used to connect a monitor for high-definition video and audio.',
    ['motherboard', 'HDMI'],
    'The motherboard connects all internal components. HDMI carries both video and audio in high definition.'),
  q(5, 'A learner wants to connect a wireless mouse to their laptop. Which technology would the mouse MOST likely use?',
    ['Bluetooth', 'HDMI', 'Ethernet', 'VGA'], 0,
    'Bluetooth is a short-range wireless technology commonly used for connecting peripherals like mice, keyboards, and headphones to computers.'),
  t(6, '## Connecting Peripheral Devices\n\n### Methods of Connection\n\n| Method | How It Works | Examples |\n|--------|-------------|----------|\n| **USB cable** | Plug device into a USB port | Flash drive, printer, external hard drive |\n| **Bluetooth** | Wireless connection using radio waves (short range, ~10 m) | Wireless mouse, headphones, keyboard |\n| **Wi-Fi** | Wireless connection through a network | Network printer, smart TV |\n| **HDMI cable** | Single cable for video and audio | Monitor, projector |\n| **Ethernet cable** | Wired network connection | Desktop PC to router |\n\n### Plug and Play\n\n**Plug and Play** means a device works as soon as you connect it \u2014 no extra setup needed. Most USB devices (flash drives, mice) are plug and play.\n\nSome devices require **drivers** \u2014 small software programs that tell the computer how to communicate with the device. For example, a new printer may need its driver installed before it can print.'),
  q(7, 'What is "Plug and Play"?',
    ['A device works immediately when connected without extra setup', 'A game that runs on any computer', 'A way to charge your phone', 'A type of software update'], 0,
    'Plug and Play means the operating system automatically recognises and configures a device when it is connected, so it works without manual driver installation.'),
  fb(8, 'A ___ is a small software program that tells the computer how to communicate with a hardware device. Most USB flash drives are ___.',
    ['driver', 'plug and play'],
    'Drivers act as translators between the hardware and the operating system. USB flash drives are plug and play because they work immediately without extra software.'),
];

blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Input Devices\n\nAn **input device** sends data into the computer for processing.\n\n### Common Input Devices\n\n| Device | Type | How It Works |\n|--------|------|-------------|\n| **Keyboard** | Manual | Keys are pressed to enter text and commands |\n| **Mouse** | Pointing | Detects movement on a surface; has buttons for clicking |\n| **Touchscreen** | Direct input | Detects finger or stylus touches on the screen |\n| **Touchpad** | Pointing | Built into laptops; detects finger movement |\n| **Scanner** | Optical | Converts paper documents and photos into digital files |\n| **Microphone** | Audio | Converts sound waves into digital audio |\n| **Webcam** | Visual | Captures video for video calls or recording |\n| **Barcode reader** | Optical | Reads barcodes on products at shops like Pick n Pay |\n| **Digital camera** | Visual | Captures photos and video |\n\n### Pointing Devices\n\nA **pointing device** controls a cursor (pointer) on the screen.\n\n| Device | Description |\n|--------|-------------|\n| **Mouse** | Most common \u2014 moved on a flat surface |\n| **Touchpad** | Found on laptops \u2014 finger slides on a small pad |\n| **Touchscreen** | Tap and swipe directly on the screen |\n| **Stylus** | A pen-like tool for precise input on a tablet or touchscreen |'),
  q(2, 'At a Checkers store, the cashier scans a barcode on each product. The barcode reader is classified as a(n):',
    ['Input device', 'Output device', 'Storage device', 'Processing device'], 0,
    'A barcode reader sends product data into the computer system. Since it brings data IN, it is an input device.'),
  t(3, '## Scanning and Reading Devices\n\nThese input devices read or capture data from physical objects.\n\n| Device | What It Reads | South African Example |\n|--------|-------------|----------------------|\n| **Flatbed scanner** | Documents, photos, pages | Scanning homework to email to a teacher |\n| **Barcode reader** | Product barcodes | Scanning items at Pick n Pay or Checkers |\n| **QR code reader** | QR codes (square patterns) | Scanning a QR code on a restaurant menu or SnapScan |\n| **Biometric scanner** | Fingerprints, faces, iris | Fingerprint clock-in at work, facial unlock on a phone |\n| **Card reader** | Bank cards, access cards | Swiping a debit card at a shop, tapping an access card at a gate |\n| **OCR software** | Printed text on scanned documents | Converting a scanned page into editable text in Word |\n\n### Biometric Input\n\n**Biometrics** use unique physical characteristics for identification.\n- **Fingerprint scanner**: Found on smartphones and door access systems\n- **Facial recognition**: Unlocking a phone with your face\n- **Iris scanner**: Used in high-security facilities\n- **Voice recognition**: Voice assistants like Google Assistant'),
  fb(4, 'A ___ reader reads product barcodes at a shop. ___ scanners use unique physical features like fingerprints for identification.',
    ['barcode', 'Biometric'],
    'Barcode readers scan the printed bar patterns on products. Biometric scanners identify people using unique physical characteristics like fingerprints or facial features.'),
  t(5, '## Output Devices\n\nAn **output device** presents processed information to the user.\n\n### Common Output Devices\n\n| Device | Type | Description |\n|--------|------|-------------|\n| **Monitor / Screen** | Visual | Displays text, images, and video |\n| **Printer** | Hard copy | Produces physical copies on paper |\n| **Speakers** | Audio | Play sound and music |\n| **Headphones / Earphones** | Audio | Personal audio output |\n| **Projector** | Visual | Projects a large image onto a wall or screen |\n\n### Types of Printers\n\n| Printer Type | How It Works | Best For |\n|-------------|-------------|----------|\n| **Inkjet** | Sprays tiny droplets of liquid ink | Colour photos, home use |\n| **Laser** | Uses toner powder and heat to fuse onto paper | High-volume office printing (fast and cheap per page) |\n| **Dot matrix** | Pins strike an ink ribbon against paper | Multi-part forms, invoices (can make carbon copies) |\n\n### Audio Output\n\n| Device | Description |\n|--------|-------------|\n| **Speakers** | External devices that produce sound for everyone to hear |\n| **Headphones** | Personal sound \u2014 only the wearer can hear |\n| **Earbuds** | Small, lightweight earphones that fit inside the ear |'),
  q(6, 'A school needs to print 500 copies of a test quickly. Which printer type is MOST suitable?',
    ['Laser printer', 'Inkjet printer', 'Dot matrix printer', '3D printer'], 0,
    'Laser printers are fast, have a low cost per page, and are designed for high-volume printing. They are ideal for printing large quantities quickly.'),
  q(7, 'Which output device converts digital information into a physical paper copy?',
    ['Printer', 'Monitor', 'Speaker', 'Projector'], 0,
    'A printer produces hard copies (physical paper documents) from digital files. Monitors display visual output, speakers produce audio, and projectors display on a surface.'),
  fb(8, 'An ___ printer sprays liquid ink and is good for colour photos. A ___ printer uses toner powder and is best for fast, high-volume printing.',
    ['inkjet', 'laser'],
    'Inkjet printers use liquid ink cartridges for quality colour output. Laser printers use toner powder and heat, making them faster and cheaper per page for large print jobs.'),
];

blockNum = 0;
const ch3_lesson3 = [
  t(1, '## Storage Devices\n\nStorage devices save data permanently so it is available even after the computer is switched off.\n\n### Primary Storage vs Secondary Storage\n\n| Feature | Primary Storage | Secondary Storage |\n|---------|----------------|------------------|\n| **Speed** | Very fast | Slower |\n| **Capacity** | Small (4\u201332 GB RAM) | Large (256 GB to several TB) |\n| **Volatile?** | RAM is volatile (loses data without power) | Non-volatile (keeps data without power) |\n| **Purpose** | Holds data currently being processed | Stores files, programs, and the OS permanently |\n| **Examples** | RAM, ROM, Cache | HDD, SSD, USB flash drive, SD card |\n\n### RAM vs ROM\n\n| Feature | RAM | ROM |\n|---------|-----|-----|\n| **Full name** | Random Access Memory | Read Only Memory |\n| **Volatile?** | Yes \u2014 data lost when power off | No \u2014 data stays permanently |\n| **Purpose** | Holds running programs and data | Stores startup instructions (BIOS/UEFI) |\n| **User can write?** | Yes | No (read only) |\n| **Typical size** | 4 GB, 8 GB, 16 GB | Very small (a few MB) |'),
  q(2, 'Which type of memory loses all its data when the computer is switched off?',
    ['RAM', 'ROM', 'SSD', 'USB flash drive'], 0,
    'RAM (Random Access Memory) is volatile \u2014 it only holds data while the computer has power. When you switch off, everything in RAM is lost.'),
  t(3, '## Secondary Storage Devices\n\nSecondary storage keeps data permanently.\n\n| Device | Technology | Description |\n|--------|-----------|-------------|\n| **Hard Disk Drive (HDD)** | Magnetic | Spinning metal discs read by a moving arm; high capacity, slower |\n| **Solid State Drive (SSD)** | Flash memory | No moving parts; very fast, more durable, but more expensive |\n| **USB flash drive** | Flash memory | Small, portable stick that plugs into a USB port |\n| **SD / micro-SD card** | Flash memory | Tiny card used in cameras, tablets, and phones |\n| **CD / DVD** | Optical | Laser reads data from a spinning disc; becoming less common |\n| **External hard drive** | Magnetic or SSD | Portable storage with large capacity; connects via USB |\n\n### Storage Capacity Units\n\n| Unit | Abbreviation | Size |\n|------|-------------|------|\n| **Byte** | B | 1 character of text |\n| **Kilobyte** | KB | ~1 000 bytes (a short text document) |\n| **Megabyte** | MB | ~1 000 KB (a photo or MP3 song) |\n| **Gigabyte** | GB | ~1 000 MB (a movie or many photos) |\n| **Terabyte** | TB | ~1 000 GB (a large hard drive) |'),
  fb(4, 'RAM is ___ storage, meaning data is lost without power. A USB flash drive uses ___ memory and keeps data permanently.',
    ['volatile', 'flash'],
    'Volatile means data disappears when power is removed. Flash memory (used in USB drives, SSDs, and SD cards) retains data without power.'),
  t(5, '## Cloud Storage\n\n**Cloud storage** means saving your files on remote servers accessed via the internet, instead of on your own computer.\n\n### Popular Cloud Storage Services\n\n| Service | Free Space | Provider |\n|---------|-----------|----------|\n| **Google Drive** | 15 GB | Google |\n| **OneDrive** | 5 GB | Microsoft |\n| **Dropbox** | 2 GB | Dropbox Inc. |\n| **iCloud** | 5 GB | Apple |\n\n### Advantages of Cloud Storage\n\n- Access your files from any device with internet\n- Automatic backups protect against data loss\n- Easy to share files and collaborate with others\n- No risk of losing a USB drive\n- Files survive if your computer is stolen or damaged\n\n### Disadvantages of Cloud Storage\n\n- Requires an internet connection\n- Free storage is limited; more space costs money\n- Privacy concerns \u2014 your data is on someone else\u2019s server\n- Upload and download speeds depend on your internet connection\n- In South Africa, data costs can be expensive on mobile networks'),
  q(6, 'A learner saves their assignment to Google Drive instead of a USB flash drive. What is one advantage of this?',
    ['They can access the file from any device with internet', 'The file will be larger', 'The file will open faster', 'They do not need a password'], 0,
    'Cloud storage lets you access your files from any device (phone, tablet, computer) as long as you have an internet connection. A USB drive only works when physically plugged in.'),
  q(7, 'Which storage unit is the LARGEST?',
    ['Terabyte', 'Gigabyte', 'Megabyte', 'Kilobyte'], 0,
    'From smallest to largest: Byte < Kilobyte (KB) < Megabyte (MB) < Gigabyte (GB) < Terabyte (TB). One terabyte is approximately 1 000 gigabytes.'),
  fb(8, 'One ___ (GB) is approximately 1 000 megabytes. ___ storage saves files on remote servers accessed via the internet.',
    ['gigabyte', 'Cloud'],
    'A gigabyte is 1 000 MB. Cloud storage uses internet-connected servers to store files remotely.'),
];

// =============================================================================
// CHAPTER 4: Software (Term 1, Week 5 / Term 2, Weeks 1-2)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## What Is Software?\n\n**Software** is a set of instructions (programs) that tells the hardware what to do. Without software, a computer is just a collection of electronic parts.\n\n### Two Main Categories of Software\n\n| Category | Description | Examples |\n|----------|-------------|----------|\n| **System software** | Controls and manages the computer hardware | Windows, macOS, Linux, Android |\n| **Application software** | Helps the user perform specific tasks | Word, Excel, Chrome, WhatsApp |\n\n### System Software\n\nSystem software includes the **operating system (OS)** and **utility programs**.\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Operating System** | Manages hardware, files, programs, and user interface | Windows 10/11, macOS, Linux, Android, iOS |\n| **Device drivers** | Small programs that let the OS communicate with hardware | Printer driver, graphics card driver |\n| **Utility programs** | Tools that maintain and optimise the computer | Antivirus, disk cleanup, file compression |\n\n### Operating System Functions\n\n| Function | What It Does |\n|----------|-------------|\n| **User interface** | Provides the desktop, icons, menus (GUI) |\n| **File management** | Organises files and folders |\n| **Memory management** | Controls how RAM is used by programs |\n| **Multitasking** | Allows multiple programs to run at the same time |\n| **Security** | User accounts, passwords, firewall |\n| **Device management** | Communicates with hardware through drivers |'),
  q(2, 'What is the MAIN purpose of an operating system?',
    ['To manage hardware and provide a platform for application software', 'To create documents and spreadsheets', 'To connect to the internet', 'To protect against viruses'], 0,
    'The operating system manages all hardware, controls memory, handles files, and provides the environment (user interface) in which application software runs.'),
  fb(3, '___ software manages the computer hardware and includes the operating system. ___ software helps the user perform specific tasks like word processing.',
    ['System', 'Application'],
    'System software controls the computer itself. Application software is what users interact with to get work done.'),
  t(4, '## Application Software\n\nApplication software helps you do specific jobs.\n\n### Types of Application Software\n\n| Type | Purpose | Examples |\n|------|---------|----------|\n| **Word processor** | Create and edit text documents | Microsoft Word, Google Docs |\n| **Spreadsheet** | Work with numbers, calculations, and charts | Microsoft Excel, Google Sheets |\n| **Presentation** | Create slideshows | Microsoft PowerPoint, Google Slides |\n| **Database** | Organise and manage large amounts of data | Microsoft Access |\n| **Web browser** | View websites on the internet | Chrome, Firefox, Edge |\n| **Email client** | Send and receive emails | Outlook, Gmail |\n| **Graphics editor** | Edit images and photos | Paint, Canva, Photoshop |\n| **Media player** | Play music and videos | VLC, Windows Media Player |\n| **Antivirus** | Protect against malware | Windows Defender, Kaspersky, AVG |\n\n### Software Suites\n\nA **software suite** is a collection of related programs sold together.\n\n| Suite | Programs Included |\n|-------|-------------------|\n| **Microsoft Office** | Word, Excel, PowerPoint, Access, Outlook |\n| **Google Workspace** | Docs, Sheets, Slides, Forms, Gmail |\n| **LibreOffice** | Writer, Calc, Impress, Base (free and open-source) |'),
  q(5, 'Which of the following is an example of application software?',
    ['Microsoft Word', 'Windows 11', 'A printer driver', 'Disk cleanup utility'], 0,
    'Microsoft Word is application software because it helps users perform a specific task (word processing). Windows 11 is system software, and drivers and utilities are also system software.'),
  t(6, '## Utility Programs\n\n**Utility programs** perform maintenance and housekeeping tasks to keep the computer running smoothly.\n\n| Utility | Purpose |\n|---------|---------|\n| **Antivirus** | Scans for and removes malware (viruses, spyware) |\n| **Disk Cleanup** | Deletes temporary files and frees up storage space |\n| **Disk Defragmenter** | Reorganises data on a hard drive for faster access (HDDs only, not SSDs) |\n| **Backup software** | Creates copies of files for data recovery |\n| **File compression** | Reduces file size for easier sharing (ZIP files) |\n| **Firewall** | Blocks unauthorised network access |\n| **System restore** | Returns the computer to an earlier working state |\n\n### Auto-Configuration\n\nWindows can automatically set up new hardware and software through:\n- **Plug and Play**: Automatically installs drivers for new devices\n- **Windows Update**: Automatically downloads and installs patches and drivers\n- **Default programs**: Windows opens files with the correct application based on the file extension'),
  q(7, 'Which utility program should you use to free up storage space by removing temporary files?',
    ['Disk Cleanup', 'Antivirus', 'Disk Defragmenter', 'Firewall'], 0,
    'Disk Cleanup scans for and removes unnecessary temporary files, system cache, and other items to free up storage space.'),
  fb(8, 'A ___ program scans for and removes viruses and malware. ___ reduces file size by compressing files into a ZIP archive.',
    ['antivirus', 'File compression'],
    'Antivirus software detects and removes malicious programs. File compression reduces the size of files, making them easier to store and share.'),
];

blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Licensing and Software Types\n\nSoftware is protected by licences that define how you can use it.\n\n### Types of Software Licences\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **Commercial / Proprietary** | You must pay to use it; source code is hidden | Microsoft Office, Adobe Photoshop |\n| **Freeware** | Free to use; source code is hidden | Adobe Reader, VLC Player |\n| **Shareware** | Free trial for a limited time, then you must pay | WinRAR (30-day trial) |\n| **Open-source** | Free to use; source code is available for anyone to view and modify | LibreOffice, Linux, Firefox |\n| **Public domain** | No copyright restrictions; completely free | Very old software or content donated to public |\n\n### Licensing Agreements\n\nWhen you install software, you agree to an **End-User Licence Agreement (EULA)**. This is a legal contract that tells you:\n- How many computers you can install the software on\n- Whether you can copy or share the software\n- What you are not allowed to do with the software\n\n### Software Piracy\n\n**Software piracy** is the illegal copying, distributing, or using of software without permission or payment.\n\n**Types of piracy:**\n- Installing one licence on multiple computers\n- Downloading cracked software from illegal websites\n- Sharing your software with friends who have not paid\n- Using counterfeit copies'),
  q(2, 'LibreOffice is free and its source code is available for anyone to modify. This type of software is called:',
    ['Open-source', 'Commercial', 'Shareware', 'Freeware'], 0,
    'Open-source software is free to use, and the source code is publicly available so anyone can view, modify, and distribute it. Freeware is free but the source code is hidden.'),
  fb(3, 'Software ___ is the illegal copying or distribution of software. An ___ is the legal agreement you accept when installing software.',
    ['piracy', 'EULA'],
    'Software piracy violates copyright law. The End-User Licence Agreement (EULA) sets the terms and conditions for using the software.'),
  t(4, '## Installing and Uninstalling Software\n\n### Installing Software\n\n| Step | Description |\n|------|-------------|\n| 1. | Check system requirements (does your computer meet the minimum specs?) |\n| 2. | Download or insert the installation media (CD/DVD, USB, download) |\n| 3. | Run the setup file (usually called setup.exe or install.exe) |\n| 4. | Follow the installation wizard (accept EULA, choose location, options) |\n| 5. | Wait for installation to complete |\n| 6. | Restart if prompted |\n\n### Uninstalling Software\n\n**Correct way:** Settings > Apps > Find the program > Click Uninstall\n\n**Wrong way:** Simply deleting the program folder (this leaves behind settings, temporary files, and registry entries that can slow down your computer)\n\n### System Requirements\n\nBefore installing software, check that your computer meets the **minimum system requirements**:\n\n| Requirement | Example |\n|-------------|--------|\n| **Operating system** | Windows 10 or later |\n| **Processor** | 1 GHz or faster |\n| **RAM** | 4 GB minimum |\n| **Storage** | 2 GB free space |\n| **Display** | 1024 x 768 resolution |'),
  q(5, 'What should you check BEFORE installing new software?',
    ['That your computer meets the minimum system requirements', 'That the software is the most expensive available', 'That you have a printer connected', 'That your speakers are working'], 0,
    'Checking system requirements ensures the software will run on your computer. If your hardware does not meet the minimum specs, the software may not install or may run poorly.'),
  t(6, '## Basic Security\n\n### Protecting Your Computer\n\n| Threat | What It Does | Protection |\n|--------|-------------|------------|\n| **Virus** | Attaches to files and spreads when opened | Antivirus software |\n| **Malware** | General term for harmful software | Antivirus and anti-malware |\n| **Spyware** | Secretly collects your personal information | Anti-spyware software |\n| **Phishing** | Fake emails or websites that trick you into sharing personal data | Be cautious of suspicious emails and links |\n\n### Basic Security Measures\n\n- Keep your operating system and antivirus up to date\n- Use strong passwords and do not share them\n- Do not download from untrusted websites\n- Be careful with email attachments from unknown senders\n- Lock your computer when leaving it (Windows key + L)\n- Back up important files regularly\n\n### Physical Security\n\n- Lock the computer lab door\n- Use a cable lock to secure laptops\n- Do not leave devices unattended in public\n- Keep drinks away from the keyboard to prevent damage'),
  q(7, 'A learner receives an email from an unknown sender with an attachment called "Free_Game.exe". What should they do?',
    ['Do NOT open the attachment \u2014 it could be malware', 'Open it immediately to check', 'Forward it to friends', 'Save it to their flash drive'], 0,
    'Attachments from unknown senders, especially .exe files, may contain viruses or malware. Never open suspicious attachments.'),
  fb(8, 'A ___ is harmful software that attaches to files and spreads. You should press Windows key + ___ to lock your computer when leaving it.',
    ['virus', 'L'],
    'A virus attaches to files and spreads when those files are opened or shared. Windows key + L instantly locks the screen.'),
];

// =============================================================================
// CHAPTER 5: Word Processing Basics (Term 1, Weeks 6-11)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## Getting Started with Word Processing\n\nA **word processor** is an application used to create, edit, format, and print text documents.\n\n### First Look at the Word Processor\n\n| Element | Description |\n|---------|-------------|\n| **Title bar** | Shows the document name at the top |\n| **Ribbon** | Toolbar area with tabs (Home, Insert, Layout, etc.) |\n| **Tabs** | Groups of related commands on the ribbon |\n| **Workspace** | The white area where you type your document |\n| **Status bar** | Bottom bar showing page number, word count, zoom |\n| **Scroll bar** | Vertical bar on the right for scrolling through pages |\n| **Cursor** | The blinking line showing where text will appear |\n| **Ruler** | Shows margins and tab stops at the top of the workspace |\n\n### Essential Shortcuts\n\n| Shortcut | Action |\n|----------|--------|\n| Ctrl+N | New document |\n| Ctrl+O | Open existing document |\n| Ctrl+S | Save |\n| Ctrl+P | Print |\n| Ctrl+Z | Undo |\n| Ctrl+Y | Redo |\n| Ctrl+A | Select all text |\n| Ctrl+F | Find text |\n| Ctrl+H | Find and Replace |'),
  q(2, 'Which keyboard shortcut opens the Find and Replace dialog?',
    ['Ctrl+H', 'Ctrl+F', 'Ctrl+S', 'Ctrl+P'], 0,
    'Ctrl+H opens Find and Replace. Ctrl+F opens Find only. Find and Replace lets you search for text and replace it with different text throughout the document.'),
  t(3, '## Entering and Editing Text\n\n### Typing Text\n\n- Just start typing \u2014 the text appears at the cursor position\n- Press **Enter** only to start a new paragraph (not at the end of every line \u2014 word wrap handles that)\n- Press **Tab** to indent the first line of a paragraph\n\n### Selecting Text\n\n| To Select | Do This |\n|-----------|---------|\n| A word | Double-click the word |\n| A line | Click in the left margin next to the line |\n| A sentence | Hold Ctrl and click anywhere in the sentence |\n| A paragraph | Triple-click anywhere in the paragraph |\n| All text | Ctrl+A |\n| Custom range | Click at the start, hold Shift, click at the end |\n\n### Editing Operations\n\n| Operation | Shortcut | Description |\n|-----------|----------|-------------|\n| **Cut** | Ctrl+X | Remove selected text and place it on the clipboard |\n| **Copy** | Ctrl+C | Copy selected text to the clipboard |\n| **Paste** | Ctrl+V | Insert clipboard content at the cursor |\n| **Undo** | Ctrl+Z | Reverse the last action |\n| **Redo** | Ctrl+Y | Repeat an undone action |\n| **Delete** | Delete key | Delete character to the right of the cursor |\n| **Backspace** | Backspace | Delete character to the left of the cursor |'),
  fb(4, 'To select all text in a document, press ___. To start a new paragraph, press the ___ key.',
    ['Ctrl+A', 'Enter'],
    'Ctrl+A selects everything in the document. Enter creates a new paragraph. Do not press Enter at the end of every line \u2014 the word processor wraps text automatically.'),
  t(5, '## Basic Punctuation and Formatting Marks\n\nCorrect punctuation makes your documents easier to read.\n\n### Basic Punctuation Rules\n\n| Rule | Example |\n|------|---------|\n| One space after a full stop | "Hello. How are you?" |\n| Capital letter after a full stop | "...end. The next sentence..." |\n| No space before a comma or full stop | "apples, oranges, and bananas." |\n| One space after a comma | "red, blue, green" |\n| Capital letter at the start of a sentence | "The learner opened Word." |\n\n### Formatting Marks (Non-Printing Characters)\n\nFormatting marks show invisible characters in your document. Toggle them with the \u00b6 button on the Home tab.\n\n| Mark | Represents |\n|------|------------|\n| \u00b7 (dot) | A space |\n| \u00b6 (pilcrow) | A paragraph break (Enter) |\n| \u2192 (arrow) | A tab |\n| \u2014 (dotted line) | A page break |\n\nShowing formatting marks helps you find:\n- Extra spaces between words\n- Extra paragraph breaks\n- Incorrect tab usage'),
  q(6, 'Why would you turn on formatting marks (\u00b6) in a document?',
    ['To see invisible characters like spaces, tabs, and paragraph breaks', 'To add special characters to the document', 'To change the font style', 'To print the document'], 0,
    'Formatting marks reveal invisible characters such as spaces, tabs, and paragraph breaks. This helps you find and fix spacing problems.'),
  q(7, 'How many spaces should you type after a full stop?',
    ['One', 'Two', 'Three', 'None'], 0,
    'Modern typing convention uses one space after a full stop. Using two spaces is an older convention from typewriter days and is no longer standard.'),
  fb(8, 'The ___ key deletes the character to the left of the cursor. The \u00b6 symbol represents a ___ break.',
    ['Backspace', 'paragraph'],
    'Backspace deletes to the left; Delete removes to the right. The pilcrow (\u00b6) marks where you pressed Enter to create a new paragraph.'),
];

blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Font Formatting\n\nFormatting changes the appearance of text to make it more readable and attractive.\n\n### Font Properties\n\n| Property | Description | Example |\n|----------|-------------|--------|\n| **Font (typeface)** | The design style of letters | Arial, Times New Roman, Calibri |\n| **Font size** | How large the text appears (measured in points) | 11pt for body text, 16pt for headings |\n| **Bold** | Makes text thicker and darker | **Bold text** |\n| **Italic** | Slants text to the right | *Italic text* |\n| **Underline** | Adds a line under the text | Underlined text |\n| **Font colour** | Changes the colour of the text | Red, blue, green |\n| **Highlight** | Adds a background colour behind the text | Yellow highlight |\n| **Strikethrough** | Draws a line through the text | ~~Deleted text~~ |\n\n### Keyboard Shortcuts for Formatting\n\n| Shortcut | Effect |\n|----------|--------|\n| Ctrl+B | Bold |\n| Ctrl+I | Italic |\n| Ctrl+U | Underline |\n| Ctrl+Shift+> | Increase font size |\n| Ctrl+Shift+< | Decrease font size |'),
  q(2, 'Which keyboard shortcut makes selected text bold?',
    ['Ctrl+B', 'Ctrl+I', 'Ctrl+U', 'Ctrl+S'], 0,
    'Ctrl+B toggles bold on and off for selected text. Ctrl+I is italic, Ctrl+U is underline, and Ctrl+S is save.'),
  t(3, '## Paragraph Formatting\n\n### Alignment\n\n| Alignment | Description | Shortcut |\n|-----------|-------------|----------|\n| **Left** | Text lines up on the left margin (default) | Ctrl+L |\n| **Centre** | Text is centred between margins | Ctrl+E |\n| **Right** | Text lines up on the right margin | Ctrl+R |\n| **Justify** | Text spreads evenly between both margins | Ctrl+J |\n\n### Line Spacing\n\nLine spacing is the vertical distance between lines of text.\n\n| Spacing | Description |\n|---------|-------------|\n| **Single (1.0)** | Lines are close together |\n| **1.15** | Default in newer versions of Word |\n| **1.5** | More space \u2014 often required for school assignments |\n| **Double (2.0)** | Wide spacing \u2014 used for drafts and editing |\n\n### Paragraph Spacing\n\n**Spacing before** and **spacing after** a paragraph adds extra space between paragraphs without pressing Enter multiple times. Set this in Layout > Spacing.'),
  fb(4, 'The keyboard shortcut to centre text is ___. ___ alignment spreads text evenly between both margins.',
    ['Ctrl+E', 'Justify'],
    'Ctrl+E centres text. Justify alignment stretches text so that both the left and right edges are even.'),
  t(5, '## Formatting Text and Paragraphs\n\n### Using Quick Styles\n\n**Styles** are pre-set combinations of formatting. Using styles ensures consistency.\n\n| Style | Use For |\n|-------|---------|\n| **Normal** | Regular body text |\n| **Heading 1** | Main headings |\n| **Heading 2** | Sub-headings |\n| **Heading 3** | Sub-sub-headings |\n| **Title** | Document title |\n\n### Bullets and Numbering\n\n**Bullets** create an unordered list:\n- First item\n- Second item\n- Third item\n\n**Numbering** creates an ordered list:\n1. First step\n2. Second step\n3. Third step\n\nAccess these from the Home tab > Paragraph group.\n\n### Borders and Shading\n\n| Feature | Description |\n|---------|-------------|\n| **Borders** | Lines around a paragraph or selected text |\n| **Shading** | Background colour behind a paragraph |\n| **Page border** | A decorative border around the entire page |\n\nAccess borders and shading from Home > Paragraph > Borders dropdown.'),
  q(6, 'Why should you use Heading styles instead of manually making text bigger and bold?',
    ['Styles ensure consistent formatting and allow automatic Table of Contents generation', 'Styles make the text smaller', 'Styles change the page orientation', 'Styles are only for printing'], 0,
    'Heading styles ensure all headings look consistent throughout the document. They also enable automatic Table of Contents generation and improve document navigation.'),
  q(7, 'Which list type should you use for steps that must be followed in a specific order?',
    ['Numbered list', 'Bulleted list', 'Table', 'Heading list'], 0,
    'Numbered lists indicate a sequence or order. Bulleted lists are for items where the order does not matter.'),
  fb(8, 'A ___ list is used when items have a specific order. ___ are pre-set formatting combinations that ensure consistency.',
    ['numbered', 'Styles'],
    'Numbered lists show sequence. Styles group formatting settings (font, size, colour) into named presets for consistent document formatting.'),
];

blockNum = 0;
const ch5_lesson3 = [
  t(1, '## Page Layout\n\n### Page Setup\n\n| Setting | Description | Location |\n|---------|-------------|----------|\n| **Margins** | Space between text and page edges | Layout > Margins |\n| **Orientation** | Portrait (tall) or Landscape (wide) | Layout > Orientation |\n| **Paper size** | A4 is standard in South Africa | Layout > Size |\n| **Page colour** | Background colour for the page | Design > Page Color |\n\n### Standard Margin Sizes\n\n| Type | Top | Bottom | Left | Right |\n|------|-----|--------|------|-------|\n| **Normal** | 2.54 cm | 2.54 cm | 2.54 cm | 2.54 cm |\n| **Narrow** | 1.27 cm | 1.27 cm | 1.27 cm | 1.27 cm |\n| **Wide** | 2.54 cm | 2.54 cm | 3.18 cm | 3.18 cm |\n\n### Headers and Footers\n\n| Feature | Description |\n|---------|-------------|\n| **Header** | Text that appears at the TOP of every page |\n| **Footer** | Text that appears at the BOTTOM of every page |\n| **Page numbers** | Automatic numbering (usually in footer) |\n\nAccess via Insert > Header / Footer / Page Number.\n\n**Common uses:**\n- Header: Document title, author name, school name\n- Footer: Page numbers, date, file name'),
  q(2, 'What is the standard paper size used in South African schools and offices?',
    ['A4', 'Letter', 'Legal', 'A3'], 0,
    'A4 (210 mm x 297 mm) is the standard paper size used in South Africa, following the ISO international standard used in most countries outside the USA.'),
  t(3, '## Tables\n\n### Creating Tables\n\nTables organise information in rows and columns.\n\nInsert a table: **Insert > Table** > select the number of columns and rows.\n\n### Table Features\n\n| Feature | Description |\n|---------|-------------|\n| **Row** | A horizontal line of cells |\n| **Column** | A vertical line of cells |\n| **Cell** | A single box where a row and column intersect |\n| **Merge cells** | Combine multiple cells into one |\n| **Split cells** | Divide one cell into multiple cells |\n| **Table styles** | Pre-designed formatting for tables |\n| **Borders** | Lines around cells |\n| **Shading** | Background colour in cells |\n\n### Working with Tables\n\n| Action | How |\n|--------|-----|\n| Add a row | Click at the end of the last row and press Tab |\n| Delete a row/column | Select it, right-click > Delete Rows/Columns |\n| Resize a column | Drag the column border |\n| Sort data | Table Tools > Layout > Sort |\n| AutoFit | Table Tools > Layout > AutoFit (adjusts column widths) |'),
  fb(4, 'A ___ is where a row and column meet in a table. To combine two cells into one, you use the ___ cells feature.',
    ['cell', 'merge'],
    'A cell is the intersection of a row and column. Merge cells combines two or more cells into a single larger cell.'),
  t(5, '## Inserting Objects\n\n### Objects You Can Insert\n\n| Object | How to Insert | Purpose |\n|--------|--------------|--------|\n| **Picture** | Insert > Pictures | Add photos or images |\n| **Online Picture** | Insert > Online Pictures | Search for images online |\n| **Shape** | Insert > Shapes | Add arrows, boxes, circles |\n| **Text Box** | Insert > Text Box | Add movable text containers |\n| **WordArt** | Insert > WordArt | Create decorative text |\n| **SmartArt** | Insert > SmartArt | Create diagrams and process flows |\n| **Screenshot** | Insert > Screenshot | Capture part of the screen |\n| **Chart** | Insert > Chart | Add bar, pie, or line charts |\n\n### Working with Images\n\nAfter inserting an image, you can:\n- **Resize**: Drag a corner handle (hold Shift to keep proportions)\n- **Move**: Drag the image to a new position\n- **Text wrapping**: Choose how text flows around the image (In Line, Square, Tight, Behind Text)\n- **Crop**: Remove parts of the image you do not need'),
  q(6, 'When resizing an image, what should you do to keep the proportions correct?',
    ['Drag a corner handle while holding Shift', 'Drag a side handle', 'Type a new width only', 'Right-click and select Resize'], 0,
    'Dragging a corner handle while holding Shift maintains the image proportions (aspect ratio). Dragging a side handle stretches the image and distorts it.'),
  q(7, 'Which feature controls how text flows around an inserted image?',
    ['Text wrapping', 'Font size', 'Line spacing', 'Margins'], 0,
    'Text wrapping determines how text behaves around an image. Options include In Line with Text, Square, Tight, and Behind Text.'),
  fb(8, '___ creates decorative stylised text. ___ controls how text flows around an image in a document.',
    ['WordArt', 'Text wrapping'],
    'WordArt transforms text into stylised, decorative designs. Text wrapping settings determine the relationship between images and surrounding text.'),
];

// =============================================================================
// CHAPTER 6: Networks (Term 2, Weeks 3 / Term 3, Week 1)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## What Is a Network?\n\nA **computer network** is two or more computers connected together to share resources and communicate.\n\n### Why Use Networks?\n\n| Reason | Description |\n|--------|-------------|\n| **Share files** | Send and receive files between computers without USB drives |\n| **Share hardware** | Multiple computers can use one printer |\n| **Share internet** | One internet connection shared by all computers |\n| **Communication** | Send emails, messages, and video calls |\n| **Centralised data** | Store files on a server where everyone can access them |\n| **Backup** | Important data can be backed up centrally |\n\n### Types of Networks\n\n| Network Type | Coverage | Example |\n|-------------|---------|--------|\n| **PAN (Personal Area Network)** | Within arm reach (~10 m) | Phone connected to Bluetooth headphones |\n| **LAN (Local Area Network)** | One building or campus | School computer lab |\n| **WAN (Wide Area Network)** | Large geographic area, even worldwide | The internet |\n| **HAN (Home Area Network)** | A single home | Home Wi-Fi connecting phones, laptop, smart TV |\n\n### South African Example\n\nIn a school:\n- All computers in the lab are connected as a **LAN**\n- The school LAN connects to the **internet** (a WAN)\n- Teachers connect their phones to the Wi-Fi (joining the LAN wirelessly)'),
  q(2, 'A school computer lab has 25 computers connected to one printer and one internet connection. This is an example of a:',
    ['LAN (Local Area Network)', 'WAN (Wide Area Network)', 'PAN (Personal Area Network)', 'Satellite network'], 0,
    'A LAN connects computers within a small area like a building or campus. The school lab computers sharing a printer and internet form a Local Area Network.'),
  fb(3, 'A ___ connects computers within a single building. The ___ is the largest example of a WAN.',
    ['LAN', 'internet'],
    'A LAN (Local Area Network) covers a small area. The internet is a global Wide Area Network connecting millions of networks worldwide.'),
  t(4, '## Network Devices\n\n| Device | Function |\n|--------|----------|\n| **Modem** | Converts signals between your network and your Internet Service Provider (ISP) |\n| **Router** | Connects different networks and directs data to the right destination |\n| **Switch** | Connects multiple devices within a LAN and sends data only to the correct device |\n| **Access Point** | Creates a wireless (Wi-Fi) connection for devices |\n| **NIC (Network Interface Card)** | Hardware inside each device that enables network connection |\n| **Ethernet cable** | Physical cable (with RJ-45 connector) for wired connections |\n\n### How Data Travels on a Network\n\n1. Your computer sends data through its **NIC**\n2. The data travels along the **Ethernet cable** (or wirelessly via Wi-Fi)\n3. A **switch** directs the data to the correct device on the LAN\n4. If the data needs to go to the internet, the **router** forwards it to the **modem**\n5. The **modem** sends the data to your **ISP** (Internet Service Provider)\n6. The ISP delivers it to the destination'),
  q(5, 'Which device connects your home network to your Internet Service Provider?',
    ['Modem', 'Switch', 'Access Point', 'NIC'], 0,
    'A modem modulates and demodulates signals to connect your local network to the ISP. It converts between the signals used on your network and the signals used by the ISP.'),
  t(6, '## Wired vs Wireless Networks\n\n| Feature | Wired | Wireless |\n|---------|-------|----------|\n| **Connection** | Ethernet cable | Wi-Fi radio waves |\n| **Speed** | Faster, more consistent | Slower, varies with distance |\n| **Security** | More secure (physical access needed) | Less secure (radio waves can be intercepted) |\n| **Mobility** | No mobility \u2014 devices must be plugged in | Full mobility within range |\n| **Setup** | More difficult (running cables) | Easier (no cables needed) |\n| **Reliability** | Very reliable | Can suffer interference |\n\n### Internet Service Providers (ISPs)\n\nAn **ISP** provides internet access to homes and businesses.\n\n**South African ISPs:**\n- Telkom\n- Afrihost\n- Rain\n- Vodacom\n- MTN\n\n**Connection types in South Africa:**\n\n| Type | Speed | Description |\n|------|-------|-------------|\n| **Fibre** | Very fast (50\u2013200+ Mbps) | Glass cables; available in many urban areas |\n| **LTE / 4G / 5G** | Fast (10\u2013100+ Mbps) | Wireless cellular network |\n| **ADSL** | Slow (4\u201310 Mbps) | Uses old phone lines; being phased out |'),
  q(7, 'Which internet connection type is generally the FASTEST available in South African homes?',
    ['Fibre', 'ADSL', 'Dial-up', 'Satellite'], 0,
    'Fibre optic connections offer the highest speeds (50 Mbps to over 200 Mbps) and are the fastest commonly available connection type in South African urban areas.'),
  fb(8, 'A ___ network uses cables while a ___ network uses radio waves. An ISP provides ___ access to homes and businesses.',
    ['wired', 'wireless', 'internet'],
    'Wired networks use physical cables. Wireless networks use Wi-Fi radio signals. ISPs (Internet Service Providers) connect users to the internet.'),
];

// =============================================================================
// CHAPTER 7: Social Implications and Ethics (Term 1, Week 5 / Term 2, Week 4)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## Ethical Use of Computers\n\nUsing computers responsibly means understanding right and wrong in the digital world.\n\n### What Are Ethics?\n\n**Ethics** are moral principles that guide behaviour \u2014 knowing right from wrong.\n\n**Computer ethics** include:\n- Not accessing other people\u2019s accounts without permission\n- Not copying someone else\u2019s work (plagiarism)\n- Not using pirated software\n- Being respectful online\n- Protecting other people\u2019s privacy\n\n### Green Computing / Ergonomics\n\n**Green computing** means using computers in an environmentally responsible way.\n\n| Practice | Benefit |\n|----------|--------|\n| Switch off monitors when not in use | Saves electricity |\n| Use power-saving sleep mode | Reduces energy consumption |\n| Recycle old computers and parts (e-waste) | Reduces landfill pollution |\n| Print only when necessary | Saves paper and ink |\n| Use cloud storage instead of physical media | Less plastic waste |\n| Use energy-efficient hardware | Lower electricity costs |\n\n**South African context:** With load-shedding affecting power supply, green computing practices like using sleep mode and switching off idle devices help conserve electricity.'),
  q(2, 'Which of the following is an example of green computing?',
    ['Switching off your monitor when not in use to save electricity', 'Printing every email you receive', 'Leaving your computer on 24 hours a day', 'Throwing old computers in the dustbin'], 0,
    'Switching off monitors when not in use reduces electricity consumption, which is a green computing practice. Old computers should be recycled, not thrown away.'),
  fb(3, '___ computing means using computers in an environmentally responsible way. Old computers should be ___ instead of thrown in the dustbin.',
    ['Green', 'recycled'],
    'Green computing reduces energy use and environmental impact. Electronic waste (e-waste) contains harmful materials and should be recycled through proper channels.'),
  t(4, '## Social Issues Linked to Technology\n\n### Economic Reasons for Using Computers\n\n| Reason | Example |\n|--------|--------|\n| **Increased productivity** | One person can do the work of many with the right software |\n| **Cost savings** | Email is cheaper than posting letters |\n| **Remote work** | Employees can work from home, saving transport costs |\n| **E-commerce** | Buy and sell online (Takealot, Gumtree) |\n| **Better record-keeping** | Digital records are easier to search and manage |\n\n### Health and Ergonomics Issues\n\n| Issue | Impact | Prevention |\n|-------|--------|------------|\n| **RSI** | Pain in hands, wrists, arms | Ergonomic equipment, regular breaks |\n| **Eye strain** | Tired, dry, sore eyes | 20-20-20 rule, adjust screen brightness |\n| **Posture problems** | Back and neck pain | Correct chair height, monitor at eye level |\n| **Sedentary lifestyle** | Weight gain, health issues | Regular exercise, standing breaks |\n\n### Authentication Methods\n\n| Method | Description |\n|--------|-------------|\n| **Password** | Something you know |\n| **PIN** | A short number you know (ATM, phone) |\n| **Biometrics** | Something you are (fingerprint, face) |\n| **Smart card / Key card** | Something you have (access card at a gate) |\n| **Two-factor authentication (2FA)** | Combines two methods (password + SMS code) |'),
  q(5, 'Using a fingerprint scanner to unlock a phone is an example of:',
    ['Biometric authentication', 'Password authentication', 'Two-factor authentication', 'Smart card authentication'], 0,
    'Biometric authentication uses unique physical characteristics (fingerprint, face, iris) to verify identity. It is classified as "something you are."'),
  fb(6, 'Two-factor authentication combines ___ different methods to verify identity. Biometrics use something you ___.',
    ['two', 'are'],
    '2FA requires two separate verification methods for extra security (e.g., password + SMS code). Biometrics use physical features unique to you, like fingerprints.'),
  t(7, '## Copyright and Piracy\n\n### Copyright\n\n**Copyright** is the legal right that protects the creator of original work.\n\n| What Is Protected | Examples |\n|-------------------|----------|\n| **Written work** | Books, articles, essays, poetry |\n| **Software** | Programs, apps, games |\n| **Music** | Songs, compositions, recordings |\n| **Images** | Photographs, drawings, logos |\n| **Videos** | Films, YouTube content, TV shows |\n\n### Software Piracy\n\n**Software piracy** is using, copying, or distributing software without the owner\u2019s permission.\n\n| Type of Piracy | Description |\n|---------------|-------------|\n| **Counterfeiting** | Making and selling fake copies of software |\n| **Illegal downloading** | Downloading software from unauthorised websites |\n| **Over-licensing** | Installing software on more computers than the licence allows |\n| **Sharing** | Giving copies of paid software to friends |\n\n**Why piracy is wrong:**\n- It is illegal (South African Copyright Act)\n- Developers lose income\n- Pirated software may contain viruses\n- You receive no updates or support\n- It undermines the software industry'),
  q(8, 'A learner downloads a cracked version of Microsoft Office from an illegal website. This is an example of:',
    ['Software piracy', 'Open-source software', 'Freeware', 'Shareware'], 0,
    'Downloading cracked software from illegal websites is software piracy. It violates copyright law and may also expose the computer to malware.'),
];

// =============================================================================
// CHAPTER 8: Spreadsheets (Term 2, Weeks 8-9 / Term 3, Weeks 4-5)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Introduction to Spreadsheets\n\nA **spreadsheet** is an application used to organise, calculate, and analyse data using rows and columns.\n\n### The Spreadsheet Interface\n\n| Element | Description |\n|---------|-------------|\n| **Cell** | A single box where a row and column intersect (e.g., A1, B5, C12) |\n| **Row** | A horizontal line of cells, numbered 1, 2, 3... |\n| **Column** | A vertical line of cells, labelled A, B, C... |\n| **Active cell** | The currently selected cell (has a dark border) |\n| **Cell reference** | The address of a cell (column letter + row number, e.g., B3) |\n| **Name Box** | Shows the reference of the active cell (top-left corner) |\n| **Formula Bar** | Shows the contents or formula of the active cell |\n| **Worksheet tab** | Tabs at the bottom for different sheets (Sheet1, Sheet2...) |\n| **Workbook** | The entire file, which can contain multiple worksheets |\n\n### Data Types in Cells\n\n| Data Type | Description | Example |\n|-----------|-------------|--------|\n| **Number** | Numeric values for calculations | 42, 99.5, -10 |\n| **Text (Label)** | Letters, words, or mixed content (not for calculations) | "Sipho", "Grade 10" |\n| **Date** | Calendar dates | 15/03/2025 |\n| **Formula** | Starts with = and calculates a result | =A1+B1 |\n| **Currency** | Monetary values | R150.00 |'),
  q(2, 'The cell at column C, row 7 has the cell reference:',
    ['C7', '7C', 'C:7', 'Row7ColC'], 0,
    'A cell reference is the column letter followed by the row number. Column C, Row 7 = C7.'),
  fb(3, 'A single spreadsheet file is called a ___. A single box where a row and column meet is called a ___.',
    ['workbook', 'cell'],
    'A workbook is the file that contains one or more worksheets. A cell is the intersection of a row and column, identified by its reference like A1.'),
  t(4, '## Entering and Formatting Data\n\n### Entering Data\n\n- Click a cell, type the data, and press **Enter** (moves down) or **Tab** (moves right)\n- To edit a cell, double-click it or click the formula bar\n- To delete cell content, select the cell and press **Delete**\n\n### Number Formatting\n\n| Format | Example | Use |\n|--------|---------|-----|\n| **Number** | 1,250.00 | General numbers with decimal places |\n| **Currency** | R1,250.00 | Money values |\n| **Percentage** | 75% | Proportions and ratios |\n| **Date** | 15/03/2025 | Calendar dates |\n| **Text** | 0821234567 | Phone numbers (preserves leading zeros) |\n\nFormat cells via Home > Number group > dropdown menu.\n\n### Cell Formatting\n\n| Feature | Description | Location |\n|---------|-------------|----------|\n| **Font** | Change typeface, size, bold, italic | Home > Font |\n| **Alignment** | Left, centre, right, top, middle, bottom | Home > Alignment |\n| **Borders** | Add lines around cells | Home > Borders |\n| **Fill colour** | Background colour of cells | Home > Fill Color |\n| **Merge cells** | Combine cells into one (used for headings) | Home > Merge & Center |\n| **Wrap text** | Shows all text in a cell by increasing row height | Home > Wrap Text |'),
  q(5, 'A learner types a phone number "0821234567" into a cell formatted as Number. The leading zero disappears. How should they fix this?',
    ['Format the cell as Text before typing the number', 'Type the number twice', 'Add a space before the number', 'Use a formula'], 0,
    'Number format removes leading zeros because they have no mathematical value. Text format preserves the number exactly as typed, including leading zeros.'),
  fb(6, 'To display R1,250.00, you should format the cell as ___. ___ text makes all content visible by increasing the row height.',
    ['Currency', 'Wrap'],
    'Currency format adds the R symbol and decimal places. Wrap text breaks long text into multiple lines within the cell.'),
  t(7, '## Working with Multiple Worksheets\n\nA workbook can contain multiple **worksheets** (tabs at the bottom of the screen).\n\n### Worksheet Operations\n\n| Action | How |\n|--------|-----|\n| **Add a new worksheet** | Click the + icon next to the last tab |\n| **Rename a worksheet** | Double-click the tab and type a new name |\n| **Delete a worksheet** | Right-click the tab > Delete |\n| **Move a worksheet** | Drag the tab to a new position |\n| **Copy a worksheet** | Right-click the tab > Move or Copy > tick "Create a copy" |\n\n### Why Use Multiple Worksheets?\n\n- Organise data by category (e.g., one sheet per term)\n- Keep raw data separate from summaries and charts\n- A class list on one sheet, marks on another, averages on a third\n\n**Referencing another sheet:** To refer to cell A1 on a sheet called "Term1", use:\n`=Term1!A1`'),
  q(8, 'To rename a worksheet tab, you should:',
    ['Double-click the tab and type a new name', 'Right-click and select Delete', 'Press Ctrl+S', 'Click the + button'], 0,
    'Double-clicking a worksheet tab makes the name editable, allowing you to type a new, descriptive name such as "Term1 Marks" instead of "Sheet1".'),
];

blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Basic Formulas and Functions\n\n### Writing Formulas\n\nEvery formula starts with an **equals sign (=)**.\n\n| Operator | Meaning | Example |\n|----------|---------|--------|\n| + | Addition | =A1+B1 |\n| - | Subtraction | =A1-B1 |\n| * | Multiplication | =A1*B1 |\n| / | Division | =A1/B1 |\n| ^ | Exponent (power) | =A1^2 (A1 squared) |\n\n### Order of Operations (BODMAS)\n\nSpreadsheets follow BODMAS for calculations:\n\n| Order | Operation |\n|-------|-----------|\n| 1. | **B**rackets first |\n| 2. | **O**f / Orders (exponents) |\n| 3. | **D**ivision and **M**ultiplication (left to right) |\n| 4. | **A**ddition and **S**ubtraction (left to right) |\n\n**Example:** =2+3*4 = 14 (not 20, because multiplication comes before addition)\n**To change order:** =(2+3)*4 = 20 (brackets force addition first)'),
  q(2, 'What is the result of the formula =2+3*4 in a spreadsheet?',
    ['14', '20', '24', '10'], 0,
    'Following BODMAS, multiplication is done before addition: 3*4=12, then 2+12=14. To get 20, you would need =(2+3)*4.'),
  t(3, '## Basic Functions\n\nA **function** is a predefined formula that performs a specific calculation.\n\n### Essential Functions\n\n| Function | Purpose | Example |\n|----------|---------|--------|\n| =SUM(range) | Adds all values in a range | =SUM(B2:B10) |\n| =AVERAGE(range) | Calculates the mean | =AVERAGE(C2:C20) |\n| =MAX(range) | Finds the highest value | =MAX(D2:D50) |\n| =MIN(range) | Finds the lowest value | =MIN(D2:D50) |\n| =COUNT(range) | Counts cells containing numbers | =COUNT(A1:A100) |\n| =COUNTA(range) | Counts all non-empty cells | =COUNTA(A1:A100) |\n\n### Range Notation\n\nA **range** is a group of cells defined by the first and last cell, separated by a colon.\n\n| Range | Meaning |\n|-------|---------|\n| A1:A10 | Cells A1 through A10 (column A, rows 1-10) |\n| A1:D1 | Cells A1 through D1 (row 1, columns A-D) |\n| A1:D10 | A block of cells from A1 to D10 |\n\n### South African Classroom Example\n\nA teacher has test marks in cells B2:B30:\n- **Total marks:** =SUM(B2:B30)\n- **Class average:** =AVERAGE(B2:B30)\n- **Highest mark:** =MAX(B2:B30)\n- **Lowest mark:** =MIN(B2:B30)\n- **Number of learners:** =COUNT(B2:B30)'),
  q(4, 'Which function calculates the average of values in cells B2 through B20?',
    ['=AVERAGE(B2:B20)', '=SUM(B2:B20)', '=MAX(B2:B20)', '=COUNT(B2:B20)'], 0,
    'AVERAGE calculates the mean (sum divided by count). SUM adds values, MAX finds the highest, and COUNT counts how many numbers are in the range.'),
  fb(5, 'The function ___ adds all values in a range. A range like A1:A10 means cells A1 ___ A10.',
    ['SUM', 'through'],
    'SUM adds up all numeric values in the specified range. The colon (:) means "through" \u2014 it includes all cells between the two references.'),
  t(6, '## The IF Function\n\nThe **IF function** makes decisions based on a condition.\n\n`=IF(condition, value_if_true, value_if_false)`\n\n| Part | Description |\n|------|-------------|\n| condition | A test that is either TRUE or FALSE |\n| value_if_true | The result if the condition is TRUE |\n| value_if_false | The result if the condition is FALSE |\n\n### Examples\n\n| Formula | Result |\n|---------|---------|\n| =IF(B2>=50, "Pass", "Fail") | If B2 is 50 or more, shows "Pass"; otherwise "Fail" |\n| =IF(C2>100, "Over budget", "Within budget") | Checks if C2 exceeds 100 |\n| =IF(A2="Yes", 100, 0) | If A2 is "Yes", returns 100; otherwise 0 |\n\n### South African Example\n\nA teacher uses the CAPS rating scale:\n- =IF(B2>=80, "Outstanding", IF(B2>=70, "Substantial", IF(B2>=50, "Moderate", IF(B2>=30, "Elementary", "Not achieved"))))\n\nThis is called a **nested IF** \u2014 an IF function inside another IF function.'),
  q(7, 'What will =IF(75>=50, "Pass", "Fail") display?',
    ['Pass', 'Fail', '75', 'TRUE'], 0,
    'The condition 75>=50 is TRUE, so the function returns the value_if_true, which is "Pass".'),
  fb(8, 'The IF function has three parts: the ___, the value if true, and the value if false. An IF inside another IF is called a ___ IF.',
    ['condition', 'nested'],
    'The condition is the test (TRUE or FALSE). Nested IFs place one IF function inside another to handle multiple outcomes.'),
];

blockNum = 0;
const ch8_lesson3 = [
  t(1, '## Cell Referencing\n\n### Relative References\n\nA **relative reference** (like A1) changes when the formula is copied to another cell.\n\n**Example:** If cell C1 contains =A1+B1, and you copy it to C2, it becomes =A2+B2. The references adjust relative to the new position.\n\n### Absolute References\n\nAn **absolute reference** (like $A$1) does NOT change when copied. The dollar sign ($) locks the reference.\n\n| Reference | What Happens When Copied |\n|-----------|------------------------|\n| A1 (relative) | Changes to match the new position |\n| $A$1 (absolute) | Always stays as $A$1 |\n| $A1 (mixed) | Column stays as A; row changes |\n| A$1 (mixed) | Row stays as 1; column changes |\n\n**Shortcut:** Press **F4** while editing a reference to toggle between relative and absolute.\n\n### When to Use Absolute References\n\nUse absolute references when a formula refers to a **fixed value** that should not change:\n- A VAT rate in one cell (e.g., 15% in cell B1)\n- An exchange rate\n- A discount percentage'),
  t(2, '### Practical Example: VAT Calculation\n\nSuppose cell B1 contains the VAT rate (15%):\n\n| | A | B | C |\n|---|---|---|---|\n| 1 | **Item** | **VAT Rate: 15%** | |\n| 2 | Textbook | R200.00 | =B2*$B$1 |\n| 3 | Calculator | R150.00 | =B3*$B$1 |\n| 4 | Ruler | R25.00 | =B4*$B$1 |\n\nWhen you copy the formula from C2 down:\n- B2 changes to B3, B4 (relative \u2014 correct, each row has its own price)\n- $B$1 stays as $B$1 (absolute \u2014 correct, same VAT rate for all)\n\n**Without the $ signs:** C3 would become =B3*B2, which would use the wrong cell for the VAT rate.\n\n### Auto Fill\n\n**Auto Fill** copies content or recognises patterns by dragging the **fill handle** (small square at the bottom-right corner of a cell).\n\n**Patterns Auto Fill recognises:**\n- Numbers: 1, 2, 3 \u2192 4, 5, 6...\n- Months: Jan, Feb, Mar \u2192 Apr, May, Jun...\n- Days: Monday, Tuesday \u2192 Wednesday, Thursday...\n- Formulas: Adjusts cell references automatically'),
  q(3, 'A formula in cell D2 is =C2*$E$1. When copied to D5, the formula becomes:',
    ['=C5*$E$1', '=C2*$E$4', '=C5*$E$4', '=C2*$E$1'], 0,
    'C2 is relative, so it adjusts to C5 when copied down 3 rows. $E$1 is absolute, so it stays the same.',
    ['The $ sign locks a reference. Relative references change when copied.']),
  fb(4, 'The ___ sign makes a cell reference absolute. Press ___ to toggle between relative and absolute references.',
    ['$', 'F4'],
    'The dollar sign ($) locks the row, column, or both in a cell reference. The F4 key cycles through all reference types while editing a formula.'),
  t(5, '## Sorting and Filtering\n\n### Sorting Data\n\n**Sorting** arranges data in a specific order.\n\n| Sort Type | Order | Example |\n|-----------|-------|--------|\n| **Ascending (A\u2013Z)** | Smallest to largest, A to Z | 1, 2, 3 or Apple, Banana, Cherry |\n| **Descending (Z\u2013A)** | Largest to smallest, Z to A | 3, 2, 1 or Cherry, Banana, Apple |\n\n**To sort:** Select the data range > Data tab > Sort (or click A\u2192Z / Z\u2192A buttons)\n\n**Important:** When sorting, make sure ALL columns are included so related data stays together.\n\n### Filtering Data\n\n**Filtering** shows only the rows that match specific criteria, hiding the rest.\n\n**To filter:** Select the header row > Data tab > Filter. Dropdown arrows appear on each column header. Click an arrow to choose which values to show.\n\n**Example:** A teacher has a class list with marks. They filter to show only learners who scored below 50% to identify learners who need extra help.'),
  q(6, 'What is the difference between sorting and filtering?',
    ['Sorting rearranges data order; filtering hides rows that do not match criteria', 'Sorting and filtering are the same thing', 'Sorting hides data; filtering rearranges it', 'Sorting deletes data; filtering copies it'], 0,
    'Sorting changes the order of all visible data. Filtering temporarily hides rows that do not match your criteria, showing only relevant data.'),
  fb(7, '___ arranges data from A to Z or smallest to largest. ___ shows only rows that match specific criteria.',
    ['Sorting', 'Filtering'],
    'Sorting reorders data. Filtering hides non-matching rows while keeping the data intact.'),
  t(8, '## Charts and Graphs\n\n### Common Chart Types\n\n| Chart Type | Best For | Example |\n|-----------|---------|--------|\n| **Column chart** | Comparing values across categories | Comparing test marks for different subjects |\n| **Bar chart** | Similar to column but horizontal | Comparing populations of SA provinces |\n| **Pie chart** | Showing parts of a whole (percentages) | Home language distribution in a class |\n| **Line chart** | Showing trends over time | Temperature changes over a week |\n\n### Creating a Chart\n\n1. Select the data (including headers)\n2. Insert tab > Chart > Choose chart type\n3. Customise with Chart Tools (title, labels, legend, colours)\n\n### Chart Elements\n\n| Element | Description |\n|---------|-------------|\n| **Title** | Describes what the chart shows |\n| **Legend** | Explains what each colour or pattern represents |\n| **Axis labels** | Titles for the X-axis (horizontal) and Y-axis (vertical) |\n| **Data labels** | Numbers shown on or near bars/points |\n| **Gridlines** | Horizontal lines to help read values |'),
  q(9, 'Which chart type is BEST for showing how a class budget is divided among different expenses?',
    ['Pie chart', 'Line chart', 'Column chart', 'Bar chart'], 0,
    'A pie chart shows parts of a whole as slices, making it ideal for showing how a total (budget) is divided among categories (expenses). Each slice represents a proportion.'),
  fb(10, 'A ___ chart shows trends over time. A ___ chart shows parts of a whole as slices.',
    ['line', 'pie'],
    'Line charts connect data points to show changes over time. Pie charts divide a circle into proportional slices representing parts of a whole.'),
];

// =============================================================================
// CHAPTER 9: Internet, Email, and Communication (Term 2, Week 2 / Term 3, Weeks 1-3)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## The Internet and World Wide Web\n\n### What Is the Internet?\n\nThe **internet** is a global network of interconnected computer networks. It allows billions of devices worldwide to communicate.\n\n### What Is the World Wide Web (WWW)?\n\nThe **World Wide Web** is a collection of web pages and websites accessed through the internet using a web browser. The WWW is part of the internet, but they are not the same thing.\n\n| Concept | Description |\n|---------|-------------|\n| **Internet** | The physical infrastructure (cables, routers, servers) connecting networks worldwide |\n| **WWW** | Web pages accessed via a browser using HTTP/HTTPS |\n| **Web browser** | Software used to view web pages (Chrome, Firefox, Edge) |\n| **Website** | A collection of related web pages |\n| **Web page** | A single page of content on a website |\n| **URL** | Uniform Resource Locator \u2014 the address of a web page (e.g., www.education.gov.za) |\n| **Search engine** | A tool that helps you find web pages (Google, Bing) |\n| **Hyperlink** | Clickable text or image that takes you to another page |\n\n### Parts of a URL\n\n`https://www.education.gov.za/Curriculum/NCS.aspx`\n\n| Part | Meaning |\n|------|---------|\n| https:// | Protocol (secure connection) |\n| www | World Wide Web subdomain |\n| education | Domain name |\n| .gov.za | Domain extension (.gov = government, .za = South Africa) |'),
  q(2, 'What is the difference between the internet and the World Wide Web?',
    ['The internet is the physical network; the WWW is web pages accessed through it', 'They are the same thing', 'The WWW is the physical network; the internet is web pages', 'The internet is a search engine'], 0,
    'The internet is the global network of connected computers. The WWW is a service that runs on the internet, consisting of web pages accessed through browsers.'),
  fb(3, 'A ___ is the address of a web page (e.g., www.google.com). A ___ engine helps you find information on the internet.',
    ['URL', 'search'],
    'URL (Uniform Resource Locator) is the web address. Search engines like Google index web pages and help users find relevant information.'),
  t(4, '## Web Browsers and Search Engines\n\n### Web Browsers\n\nA **web browser** is software that displays web pages.\n\n| Browser | Developer |\n|---------|----------|\n| **Google Chrome** | Google |\n| **Mozilla Firefox** | Mozilla Foundation |\n| **Microsoft Edge** | Microsoft |\n| **Safari** | Apple |\n| **Opera** | Opera Software |\n\n### Browser Features\n\n| Feature | Description |\n|---------|-------------|\n| **Tabs** | Open multiple web pages in one window |\n| **Bookmarks / Favourites** | Save links to pages you visit often |\n| **History** | List of previously visited pages |\n| **Downloads** | Files you have downloaded from the internet |\n| **Address bar** | Type a URL to go to a website |\n| **Back / Forward** | Navigate between pages you have visited |\n| **Refresh** | Reload the current page |\n\n### Search Engines\n\nA **search engine** finds web pages that match your search terms.\n\n**Effective searching tips:**\n- Use specific keywords: "Grade 10 CAT notes" instead of "computers"\n- Use quotation marks for exact phrases: "information processing cycle"\n- Use a minus sign to exclude words: python -snake (finds the programming language, not the animal)'),
  q(5, 'Which browser feature allows you to save a link to a page you visit often?',
    ['Bookmarks / Favourites', 'History', 'Downloads', 'Tabs'], 0,
    'Bookmarks (also called Favourites) save web page links for quick access later. History shows pages you have already visited. Tabs let you open multiple pages.'),
  fb(6, 'To find an exact phrase on the internet, put your search terms in ___ marks. The ___ bar is where you type a website address.',
    ['quotation', 'address'],
    'Quotation marks tell the search engine to find the exact phrase. The address bar (also called the URL bar) is where you type web addresses.'),
  t(7, '## Domain Extensions\n\nThe **domain extension** (also called a top-level domain) is the last part of a web address. It tells you about the type or origin of the website.\n\n### Common Domain Extensions\n\n| Extension | Meaning | Example |\n|-----------|---------|--------|\n| **.com** | Commercial (international) | www.google.com |\n| **.co.za** | Commercial (South Africa) | www.takealot.co.za |\n| **.gov.za** | South African government | www.gov.za |\n| **.ac.za** | South African academic institutions | www.uct.ac.za |\n| **.edu** | International education | www.harvard.edu |\n| **.org** | Non-profit organisations | www.wikipedia.org |\n| **.net** | Network services | www.example.net |\n\n### Understanding .za Domains\n\nThe **.za** at the end indicates a South African website. Within .za:\n- **.co.za** = companies and businesses\n- **.gov.za** = government departments\n- **.ac.za** = universities and colleges\n- **.school.za** = South African schools\n- **.org.za** = non-profit organisations'),
  q(8, 'The website www.education.gov.za belongs to:',
    ['The South African government', 'A commercial business', 'A non-profit organisation', 'A university'], 0,
    'The .gov.za domain extension is reserved for South African government departments and agencies. "education" indicates the Department of Education.'),
];

blockNum = 0;
const ch9_lesson2 = [
  t(1, '## Email\n\nEmail (electronic mail) is a method of sending and receiving digital messages over the internet.\n\n### Parts of an Email\n\n| Field | Description |\n|-------|-------------|\n| **To** | The recipient\u2019s email address |\n| **CC (Carbon Copy)** | Additional recipients who receive a copy (visible to all) |\n| **BCC (Blind Carbon Copy)** | Additional recipients whose addresses are hidden from others |\n| **Subject** | A brief description of the email topic |\n| **Body** | The main message content |\n| **Attachment** | A file sent along with the email |\n| **Signature** | Automatic text at the end (name, contact details) |\n\n### Email Addresses\n\nFormat: `username@domain.extension`\n\nExample: `sipho.dlamini@gmail.com`\n- sipho.dlamini = username\n- gmail = domain\n- .com = extension\n\n### Popular Email Services\n\n| Service | Provider | Address |\n|---------|----------|--------|\n| **Gmail** | Google | name@gmail.com |\n| **Outlook** | Microsoft | name@outlook.com |\n| **Yahoo Mail** | Yahoo | name@yahoo.com |'),
  q(2, 'If you want to send a copy of an email to someone without the other recipients knowing, you should use:',
    ['BCC (Blind Carbon Copy)', 'CC (Carbon Copy)', 'To field', 'Subject field'], 0,
    'BCC (Blind Carbon Copy) hides the recipient from all other recipients. CC shows the address to everyone. BCC is used for privacy.'),
  t(3, '## Netiquette and Safe Email Practices\n\n**Netiquette** means internet etiquette \u2014 good manners when communicating online.\n\n### Email Netiquette Rules\n\n| Rule | Why |\n|------|-----|\n| Use a clear, descriptive subject line | Helps the recipient know what the email is about |\n| Use proper greeting and sign-off | Shows respect (Dear Sir/Madam... Regards, Sipho) |\n| Do NOT type in ALL CAPITALS | This is considered SHOUTING |\n| Check spelling and grammar before sending | Shows professionalism |\n| Reply promptly | Shows you value the communication |\n| Keep messages concise | Respect the recipient\u2019s time |\n| Do not forward chain emails or spam | They waste time and may contain malware |\n\n### Safe Email Practices\n\n| Risk | Prevention |\n|------|------------|\n| **Spam** | Mark as spam; do not reply to spam emails |\n| **Phishing** | Do not click links in suspicious emails; check the sender address |\n| **Malware attachments** | Do not open attachments from unknown senders |\n| **Identity theft** | Never share passwords, ID numbers, or banking details via email |\n\n### Social Media Netiquette\n\n- Think before you post \u2014 once online, it may be permanent\n- Respect others\u2019 privacy \u2014 do not share their photos without permission\n- Do not engage in cyberbullying\n- Be kind and constructive in comments\n- Verify information before sharing (avoid spreading fake news)'),
  q(4, 'Typing an entire email in CAPITAL LETTERS is considered:',
    ['Shouting and is bad netiquette', 'Professional and formal', 'Required for business emails', 'A way to make text easier to read'], 0,
    'In online communication, typing in ALL CAPS is interpreted as shouting and is considered rude. Use normal capitalisation for professional communication.'),
  fb(5, '___ is good manners when communicating online. ___ emails try to trick you into revealing personal information.',
    ['Netiquette', 'Phishing'],
    'Netiquette (internet etiquette) guides polite online behaviour. Phishing emails pretend to be from legitimate organisations to steal personal data.'),
  t(6, '## Downloading and Uploading\n\n| Term | Meaning | Example |\n|------|---------|--------|\n| **Downloading** | Copying a file FROM the internet TO your computer | Downloading a PDF worksheet from Google Classroom |\n| **Uploading** | Copying a file FROM your computer TO the internet | Uploading an assignment to Google Drive |\n\n### File Compression\n\n**Compression** makes files smaller so they are faster to upload, download, and email.\n\n| Concept | Description |\n|---------|-------------|\n| **ZIP file** | A compressed archive that can contain multiple files |\n| **Compress** | Right-click files/folder > Send to > Compressed (zipped) folder |\n| **Extract** | Right-click a ZIP file > Extract All |\n| **Why compress?** | Smaller files are faster to send and use less storage |\n\n### Attachment Tips\n\n- Check attachment size limits (most email services limit to 20\u201325 MB)\n- Compress large files or folders before attaching\n- Use cloud links (Google Drive, OneDrive) for very large files\n- Always double-check you have attached the correct file before sending'),
  q(7, 'A learner needs to email a folder of 20 photos to their teacher. The total size is 45 MB and the email limit is 25 MB. What should they do?',
    ['Compress the folder into a ZIP file or share via Google Drive link', 'Send 20 separate emails with one photo each', 'Delete most of the photos', 'Print the photos instead'], 0,
    'Compressing into a ZIP reduces file size. If still too large, use a cloud sharing link. Sending 20 separate emails is inefficient.'),
  fb(8, '___ means copying a file from the internet to your computer. A ___ file is a compressed archive containing one or more files.',
    ['Downloading', 'ZIP'],
    'Downloading transfers files from the internet to your device. ZIP files compress and bundle multiple files for easier sharing.'),
];

// =============================================================================
// CHAPTER 10: Presentations (Term 3, Week 7)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Introduction to Presentations\n\nA **presentation** is a visual tool used to communicate information to an audience using slides.\n\n### The Presentation Interface\n\n| Element | Description |\n|---------|-------------|\n| **Slide** | A single page in a presentation |\n| **Slide pane** | Shows the current slide you are editing |\n| **Slide panel** | Thumbnail list of all slides (left side) |\n| **Notes pane** | Area below the slide for speaker notes (audience cannot see these) |\n| **Ribbon** | Tabs and commands (Home, Insert, Design, Animations, Slide Show) |\n\n### Creating a Presentation\n\n1. Open Microsoft PowerPoint or Google Slides\n2. Choose a template or blank presentation\n3. Add slides: Home > New Slide\n4. Type your content on each slide\n5. Save your work (Ctrl+S)\n\n### Slide Layouts\n\n| Layout | Use For |\n|--------|---------|\n| **Title Slide** | The first slide with the presentation title |\n| **Title and Content** | A heading with bullet points |\n| **Two Content** | Two columns of content |\n| **Blank** | Custom arrangement of objects |\n| **Section Header** | Dividing major sections |'),
  q(2, 'What is the purpose of the Notes pane in a presentation program?',
    ['To write speaker notes that the audience cannot see during the presentation', 'To type the main content of the slide', 'To add animations', 'To change the slide design'], 0,
    'The Notes pane is for the presenter\u2019s own reference notes. The audience sees only the slides during the presentation, not the notes.'),
  t(3, '## Designing Effective Slides\n\n### Design Rules\n\n| Rule | Do | Do Not |\n|------|-----|--------|\n| **Text amount** | Use short bullet points (6 words per line, 6 lines per slide) | Write full paragraphs |\n| **Font size** | Minimum 24pt for body text, 32pt+ for headings | Use font smaller than 20pt |\n| **Font choice** | Use 2\u20133 clear fonts maximum | Use many different fonts |\n| **Colours** | Use high contrast (dark text on light background) | Use clashing or low-contrast colours |\n| **Images** | Use relevant, high-quality images | Use blurry, stretched, or irrelevant images |\n| **Animations** | Use sparingly to emphasise key points | Overuse animations (distracting) |\n| **Consistency** | Same fonts, colours, and layout on every slide | Change the design on every slide |\n\n### Adding Content to Slides\n\n| Content Type | How to Insert |\n|-------------|---------------|\n| **Text** | Click text placeholder and type |\n| **Image** | Insert > Pictures |\n| **Shape** | Insert > Shapes |\n| **Table** | Insert > Table |\n| **Chart** | Insert > Chart |\n| **Video** | Insert > Video |\n| **Audio** | Insert > Audio |\n| **Hyperlink** | Insert > Link (links to websites or other slides) |'),
  fb(4, 'The minimum font size for body text on a slide should be ___ points. You should use a maximum of ___ different fonts.',
    ['24', '3'],
    'Font below 24pt is hard to read from the back of a room. Using more than 2\u20133 fonts creates a cluttered, unprofessional look.'),
  t(5, '## Slide Transitions and Animations\n\n### Slide Transitions\n\nA **transition** is the visual effect that occurs when moving from one slide to the next.\n\n| Transition Type | Description |\n|----------------|-------------|\n| **None** | Instant switch (no effect) |\n| **Fade** | Current slide fades out, next fades in |\n| **Push** | Next slide pushes the current one off screen |\n| **Wipe** | Next slide wipes across the current one |\n\n**Best practice:** Use one subtle transition consistently throughout. Avoid using different transitions on every slide.\n\n### Animations\n\n**Animations** add movement to individual objects on a slide.\n\n| Animation Type | Effect |\n|---------------|--------|\n| **Entrance** | Object appears on the slide (e.g., Fade In, Fly In) |\n| **Emphasis** | Object changes while on the slide (e.g., Grow, Pulse) |\n| **Exit** | Object leaves the slide (e.g., Fade Out, Fly Out) |\n| **Motion Path** | Object moves along a defined path |\n\n### Presenting a Slide Show\n\n| Action | Shortcut |\n|--------|----------|\n| Start from beginning | F5 |\n| Start from current slide | Shift+F5 |\n| Next slide | Click, Enter, or Right Arrow |\n| Previous slide | Backspace or Left Arrow |\n| End show | Esc |'),
  q(6, 'Which keyboard shortcut starts a presentation from the beginning?',
    ['F5', 'Ctrl+S', 'Ctrl+P', 'Shift+F5'], 0,
    'F5 starts the slide show from the first slide. Shift+F5 starts from the current slide.'),
  q(7, 'What is the BEST approach to using animations in a presentation?',
    ['Use them sparingly to emphasise key points', 'Add an animation to every object on every slide', 'Use a different animation for each bullet point', 'Never use any animations'], 0,
    'Animations should enhance understanding, not distract. Use them sparingly to draw attention to key information. Too many animations are distracting and unprofessional.'),
  fb(8, 'A ___ is the visual effect between slides. Press ___ to end a slide show presentation.',
    ['transition', 'Esc'],
    'Transitions control how one slide moves to the next. The Esc key immediately ends the slide show and returns to editing mode.'),
];

// =============================================================================
// CHAPTER 11: HTML and Web Design Basics (Term 3, Week 8)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Introduction to HTML\n\n**HTML** (HyperText Markup Language) is the standard language used to create web pages. Every website you visit is built with HTML.\n\n### What Is HTML?\n\n- HTML uses **tags** to structure content on a web page\n- Tags are written in angle brackets: `<tagname>`\n- Most tags come in pairs: an **opening tag** and a **closing tag**\n- The closing tag has a forward slash: `</tagname>`\n\n### HTML Document Structure\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Web Page</title>\n</head>\n<body>\n  <h1>Welcome!</h1>\n  <p>This is my first web page.</p>\n</body>\n</html>\n```\n\n### Structural Tags\n\n| Tag | Purpose |\n|-----|---------|\n| `<!DOCTYPE html>` | Declares the document as HTML5 |\n| `<html>` | Root element \u2014 wraps everything |\n| `<head>` | Contains metadata (title, character set) |\n| `<title>` | Page title shown in the browser tab |\n| `<body>` | Contains all visible content |'),
  q(2, 'In HTML, the visible content of a web page is placed inside which tag?',
    ['<body>', '<head>', '<title>', '<html>'], 0,
    'The <body> tag contains all the content that is visible on the web page. The <head> section contains metadata like the title and CSS links.'),
  t(3, '## Basic HTML Tags\n\n### Text Tags\n\n| Tag | Purpose | Example |\n|-----|---------|---------|\n| `<h1>` to `<h6>` | Headings (h1 = largest, h6 = smallest) | `<h1>Main Heading</h1>` |\n| `<p>` | Paragraph | `<p>This is a paragraph.</p>` |\n| `<br>` | Line break (no closing tag needed) | Forces text to the next line |\n| `<hr>` | Horizontal line (no closing tag needed) | Draws a line across the page |\n| `<b>` or `<strong>` | Bold text | `<b>Bold text</b>` |\n| `<i>` or `<em>` | Italic text | `<i>Italic text</i>` |\n| `<u>` | Underlined text | `<u>Underlined</u>` |\n\n### The Font Tag\n\n```html\n<font face="Arial" size="4" color="blue">Styled text</font>\n```\n\n| Attribute | Purpose |\n|-----------|---------|\n| face | Sets the font name (Arial, Times New Roman, etc.) |\n| size | Sets text size (1\u20137, where 3 is default) |\n| color | Sets text colour (colour name or hex code) |\n\n**Note:** The `<font>` tag is older HTML. Modern web design uses CSS for styling, but the `<font>` tag is still part of the CAPS syllabus.'),
  fb(4, 'The ___ tag creates a paragraph in HTML. The `<br>` tag creates a line ___ without starting a new paragraph.',
    ['<p>', 'break'],
    '<p> defines a paragraph with automatic spacing. <br> forces a line break within existing content without paragraph spacing.'),
  t(5, '## Lists, Images, and Links\n\n### HTML Lists\n\n**Unordered list (bullet points):**\n```html\n<ul>\n  <li>English</li>\n  <li>Maths</li>\n  <li>CAT</li>\n</ul>\n```\n\n**Ordered list (numbered):**\n```html\n<ol>\n  <li>First step</li>\n  <li>Second step</li>\n  <li>Third step</li>\n</ol>\n```\n\n### Images\n\n```html\n<img src="photo.jpg" alt="School photo" width="300">\n```\n\n| Attribute | Purpose |\n|-----------|---------|\n| src | Path to the image file |\n| alt | Description of the image (for accessibility and if image fails to load) |\n| width / height | Size in pixels |\n\n### Links (Hyperlinks)\n\n```html\n<a href="https://www.google.com">Visit Google</a>\n<a href="page2.html">Go to Page 2</a>\n<a href="mailto:info@school.co.za">Email Us</a>\n```\n\n| Attribute | Purpose |\n|-----------|---------|\n| href | The destination URL or file |\n| target="_blank" | Opens the link in a new tab |'),
  q(6, 'Which HTML tag creates a bulleted (unordered) list?',
    ['<ul>', '<ol>', '<li>', '<bl>'], 0,
    '<ul> creates an unordered (bulleted) list. <ol> creates an ordered (numbered) list. <li> is the list item tag used inside both.'),
  q(7, 'In an `<img>` tag, what does the "alt" attribute do?',
    ['Provides a text description of the image for accessibility', 'Sets the image width', 'Links the image to another page', 'Changes the image colour'], 0,
    'The alt attribute provides alternative text that describes the image. Screen readers use it for visually impaired users, and it displays if the image fails to load.'),
  fb(8, 'The ___ tag creates a hyperlink in HTML. The ___ attribute specifies the destination URL of a link.',
    ['<a>', 'href'],
    'The anchor tag <a> creates clickable links. The href (hypertext reference) attribute contains the web address or file the link points to.'),
];

blockNum = 0;
const ch11_lesson2 = [
  t(1, '## HTML Tables\n\nTables organise data into rows and columns on a web page.\n\n### Table Structure\n\n```html\n<table border="1">\n  <tr>\n    <th>Name</th>\n    <th>Subject</th>\n    <th>Mark</th>\n  </tr>\n  <tr>\n    <td>Sipho</td>\n    <td>CAT</td>\n    <td>78</td>\n  </tr>\n  <tr>\n    <td>Naledi</td>\n    <td>CAT</td>\n    <td>85</td>\n  </tr>\n</table>\n```\n\n### Table Tags\n\n| Tag | Purpose |\n|-----|---------|\n| `<table>` | Creates the table |\n| `<tr>` | Table Row |\n| `<th>` | Table Header cell (bold and centred by default) |\n| `<td>` | Table Data cell (regular cell) |\n\n### Table Attributes\n\n| Attribute | Effect |\n|-----------|--------|\n| border | Sets border thickness (border="1") |\n| cellpadding | Space between cell content and border |\n| cellspacing | Space between cells |\n| bgcolor | Background colour of table or cell |\n| width | Table width in pixels or percentage |\n| align | Horizontal alignment (left, center, right) |'),
  q(2, 'In HTML, which tag is used for a table header cell?',
    ['<th>', '<td>', '<tr>', '<thead>'], 0,
    '<th> creates a table header cell, which is bold and centred by default. <td> creates a regular data cell. <tr> creates a row.'),
  t(3, '## Web Page Design with Background and Colour\n\n### Body Attributes\n\n```html\n<body bgcolor="#FFFFFF" text="#000000">\n```\n\n| Attribute | Purpose |\n|-----------|---------|\n| bgcolor | Background colour of the page |\n| text | Default text colour |\n| background | Background image |\n\n### Colour Formats\n\n| Format | Example | Description |\n|--------|---------|-------------|\n| **Colour name** | color="red" | Limited set of named colours |\n| **Hex code** | color="#FF0000" | Six-digit code (2 digits each for Red, Green, Blue) |\n\n### Common Hex Codes\n\n| Colour | Hex Code |\n|--------|----------|\n| Black | #000000 |\n| White | #FFFFFF |\n| Red | #FF0000 |\n| Green | #00FF00 |\n| Blue | #0000FF |\n| Yellow | #FFFF00 |\n\n### Hex Code Explained\n\nThe format is #RRGGBB:\n- First two digits = Red (00 to FF)\n- Middle two digits = Green (00 to FF)\n- Last two digits = Blue (00 to FF)\n\n**Example:** #FF8000 = Full Red (FF) + Half Green (80) + No Blue (00) = Orange'),
  fb(4, 'A hex colour code uses ___ digits in the format #RRGGBB. The hex code #0000FF represents the colour ___.',
    ['six', 'blue'],
    'Hex codes use 6 hexadecimal digits (two per colour channel). #0000FF has no Red (00), no Green (00), and full Blue (FF).'),
  t(5, '## Creating a Simple Web Page\n\n### Step-by-Step Process\n\n1. Open a text editor (Notepad or Notepad++)\n2. Type your HTML code\n3. Save the file with a .html extension (e.g., mypage.html)\n4. Open the file in a web browser to view it\n\n### Good Web Design Principles\n\n| Principle | Description |\n|-----------|-------------|\n| **Navigation** | Users should find any page easily; use clear links |\n| **Consistency** | Same fonts, colours, and layout on every page |\n| **Readability** | Clear fonts, good contrast, appropriate text size |\n| **Simplicity** | Clean layout; avoid clutter |\n| **Images** | Use relevant images with alt text for accessibility |\n| **Loading speed** | Optimise image sizes; do not use huge files |\n\n### Common HTML Mistakes\n\n| Mistake | Fix |\n|---------|-----|\n| Missing closing tag | Every `<tag>` needs `</tag>` (except self-closing like `<br>` and `<img>`) |\n| Wrong attribute | Links use href; images use src |\n| Forgetting alt text on images | Always include alt for accessibility |\n| No `<!DOCTYPE html>` | Always start with the DOCTYPE declaration |\n| Incorrect file extension | Save as .html, not .txt |'),
  q(6, 'A learner saves their HTML file as "mypage.txt" and opens it in a browser. Instead of a formatted page, they see the raw HTML code. What went wrong?',
    ['The file should be saved with a .html extension, not .txt', 'They forgot the <body> tag', 'The browser is broken', 'They need to install HTML software'], 0,
    'Browsers interpret .html files as web pages and render them. A .txt file is treated as plain text, so the browser shows the raw code instead of a formatted page.'),
  q(7, 'Which HTML attribute should you use on links but NOT on images?',
    ['href', 'src', 'alt', 'width'], 0,
    'Links (<a>) use the href attribute for the destination URL. Images (<img>) use src for the image source file. This is a common exam mistake.'),
  fb(8, 'HTML files should be saved with the ___ extension. Links use href, while images use ___.',
    ['.html', 'src'],
    'The .html extension tells the browser to render the file as a web page. The src (source) attribute in <img> specifies the path to the image file.'),
];

// =============================================================================
// CHAPTER 12: Information Management (Term 2, Week 10 / Term 3, Weeks 9-10)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## What Is Information Management?\n\n**Information management** is the process of finding, organising, evaluating, and using information effectively.\n\n### Why Is It Important?\n\n- School assignments require research from reliable sources\n- Not all information online is accurate or trustworthy\n- You need to give credit to the original authors (avoid plagiarism)\n- You need to know how to present information clearly\n\n### Data vs Information vs Knowledge\n\n| Concept | Description | Example |\n|---------|-------------|--------|\n| **Data** | Raw, unprocessed facts | 25, 30, 18, 27 |\n| **Information** | Processed data with meaning | "The average temperature this week was 25\u00b0C" |\n| **Knowledge** | Information applied and understood | "Knowing to wear a jacket when temperatures drop below 15\u00b0C" |\n\n### Sources of Information\n\n| Source | Type | Example |\n|--------|------|--------|\n| **Books / Textbooks** | Secondary | School library, public library |\n| **Websites** | Secondary | education.gov.za, Wikipedia |\n| **Newspapers** | Secondary | Daily Maverick, News24 |\n| **Interviews** | Primary | Asking an expert questions |\n| **Surveys** | Primary | Questionnaire answered by classmates |\n| **Observations** | Primary | Watching and recording events |\n\n**Primary source:** Information you collect yourself (first-hand)\n**Secondary source:** Information collected by someone else (second-hand)'),
  q(2, 'A learner creates a questionnaire and asks 30 classmates to complete it. This is an example of:',
    ['A primary source', 'A secondary source', 'An unreliable source', 'A textbook'], 0,
    'Primary sources involve collecting information first-hand. The learner directly gathered data through the questionnaire. A secondary source would be reading someone else\u2019s research.'),
  fb(3, '___ sources are information you collect yourself. ___ sources are information collected by someone else.',
    ['Primary', 'Secondary'],
    'Primary = first-hand data you gather (surveys, interviews, experiments). Secondary = information from other researchers (books, articles, reports).'),
  t(4, '## Evaluating Information\n\nNot all information is reliable. You need to evaluate whether a source is trustworthy.\n\n### How to Evaluate a Website\n\n| Question | What to Check |\n|----------|---------------|\n| **Who wrote it?** | Is there a named author with qualifications? |\n| **When was it published?** | Is the information current or outdated? |\n| **Why was it created?** | To inform, to sell, to persuade, to entertain? |\n| **Is it accurate?** | Are there references? Does it match other sources? |\n| **What is the domain?** | .gov.za and .ac.za are more trustworthy than random .com sites |\n\n### Trustworthy Domain Extensions\n\n| Domain | Type |\n|--------|------|\n| .gov.za | South African government |\n| .ac.za | South African academic institutions |\n| .edu | International education |\n| .org | Non-profit organisations |\n| .co.za | South African commercial |\n| .com | International commercial |\n\n### Signs of an Unreliable Website\n\n- No author name\n- No date\n- Many spelling and grammar errors\n- Lots of popup ads\n- Extreme or biased claims without evidence\n- No references or sources cited'),
  q(5, 'Which domain extension is MOST likely to have reliable information about South African education?',
    ['.gov.za', '.com', '.net', '.info'], 0,
    '.gov.za is the official domain for South African government websites, making it a trusted source for education policy and official information.'),
  fb(6, 'The domain ___ indicates a South African government website. An unreliable website often has no ___ name and no date.',
    ['.gov.za', 'author'],
    'Government domains are official and authoritative. Anonymous, undated content with no sources cited is likely unreliable.'),
  t(7, '## Plagiarism and Referencing\n\n### What Is Plagiarism?\n\n**Plagiarism** is using someone else\u2019s words or ideas and presenting them as your own, without giving credit.\n\n**Types of plagiarism:**\n- Copying text directly without quotation marks or reference\n- Paraphrasing without citing the source\n- Submitting someone else\u2019s work as your own\n- Using images without permission or credit\n\n### How to Avoid Plagiarism\n\n| Method | Description |\n|--------|-------------|\n| **Quotation marks** | Use " " around directly copied words |\n| **Paraphrase** | Rewrite in your own words (still cite the source) |\n| **Reference** | List all sources you used at the end of your work |\n| **Bibliography** | A list of all sources consulted (books, websites, etc.) |\n\n### Basic Referencing Format\n\n**Book:** Author surname, Initial. (Year). *Title*. Publisher.\nExample: Smith, J. (2023). *Understanding Computers*. Oxford University Press.\n\n**Website:** Author. (Year). Title. URL\nExample: Department of Education. (2024). CAPS Document. https://www.education.gov.za/caps'),
  q(8, 'A learner copies a paragraph from Wikipedia and puts it in their assignment without any reference. This is:',
    ['Plagiarism', 'Good research', 'Referencing', 'Paraphrasing'], 0,
    'Using someone else\u2019s words without giving credit is plagiarism, regardless of the source. The learner should have used quotation marks and cited Wikipedia.'),
  fb(9, '___ is using someone else\u2019s work without giving credit. A ___ is a list of all sources used in your research.',
    ['Plagiarism', 'bibliography'],
    'Plagiarism is an academic offence. A bibliography (or reference list) credits all sources you used, showing academic honesty.'),
];

// =============================================================================
// CHAPTER 13: Revision and Exam Preparation (Term 4)
// =============================================================================
blockNum = 0;
const ch13_lesson1 = [
  t(1, '## Grade 10 CAT Exam Preparation\n\n### Exam Structure\n\nThe Grade 10 CAT exam typically consists of two papers:\n\n| Paper | Type | Duration | Content |\n|-------|------|----------|--------|\n| **Paper 1** | Theory (written) | 2.5\u20133 hours | Hardware, software, networks, internet, social implications, information management |\n| **Paper 2** | Practical (computer-based) | 2.5\u20133 hours | Word processing, spreadsheets, HTML |\n\n### Paper 1 Study Guide\n\n| Topic | Key Areas to Revise |\n|-------|--------------------|\n| **Hardware** | System unit components (CPU, RAM, motherboard), input/output devices, storage (RAM vs ROM, HDD vs SSD), ports, peripherals |\n| **Software** | System vs application software, OS functions, utilities, licensing, piracy |\n| **Networks** | LAN/WAN, network devices (router, switch, modem), wired vs wireless, ISPs |\n| **Internet** | WWW, browsers, search engines, URLs, email, netiquette, downloading/uploading |\n| **Social Implications** | Ethics, green computing, copyright, piracy, health risks, ergonomics, authentication |\n| **Information Management** | Data vs information, primary vs secondary sources, evaluating websites, plagiarism, referencing |'),
  t(2, '### Paper 2 Practical Tips\n\n| Application | Key Skills to Practice |\n|-------------|----------------------|\n| **Word Processing** | Text formatting (font, size, bold, italic, underline), paragraph formatting (alignment, spacing, bullets, numbering), page layout (margins, orientation, headers/footers), tables (insert, merge, borders), inserting images and objects |\n| **Spreadsheets** | Entering data, formatting cells, formulas (+, -, *, /), functions (SUM, AVERAGE, MAX, MIN, COUNT, IF), cell referencing (relative and absolute), sorting and filtering, creating charts |\n| **HTML** | Document structure, headings, paragraphs, bold/italic, lists (ul, ol), images, links, tables, background colour, font tag |\n\n### Exam Strategies\n\n**For Paper 1 (Theory):**\n- Read each question carefully \u2014 underline key words\n- Use proper CAT terminology in your answers\n- Answer in full sentences where required\n- Manage your time \u2014 do not spend too long on one question\n- If unsure, eliminate obviously wrong answers first\n\n**For Paper 2 (Practical):**\n- Read ALL instructions before starting\n- Save your work every few minutes (Ctrl+S)\n- Name files exactly as instructed\n- Check formulas by verifying results manually\n- Do not skip questions \u2014 attempt everything for partial marks\n- Use Print Preview to check layouts'),
  q(3, 'Which keyboard shortcut should you use regularly during the practical exam?',
    ['Ctrl+S (Save)', 'Ctrl+P (Print)', 'Alt+F4 (Close)', 'Ctrl+Z (Undo)'], 0,
    'Ctrl+S saves your work. Saving frequently during a practical exam protects against data loss from crashes, power failures, or load-shedding.'),
  t(4, '### Common Mistakes to Avoid\n\n| Area | Common Mistake | Correct Approach |\n|------|---------------|------------------|\n| **Hardware** | Confusing RAM and ROM | RAM = temporary, volatile; ROM = permanent, non-volatile |\n| **Hardware** | Calling a monitor an output AND input device | A standard monitor is output only; a touchscreen is both |\n| **Software** | Confusing system and application software | System = manages hardware (Windows); Application = user tasks (Word) |\n| **Spreadsheets** | Forgetting = at the start of a formula | Every formula MUST start with = |\n| **Spreadsheets** | Confusing relative and absolute references | Use $ to lock a reference; press F4 to toggle |\n| **HTML** | Missing closing tags | Every opening tag needs a closing tag (except br, hr, img) |\n| **HTML** | Using src instead of href in links | Links use href; images use src |\n| **Email** | Confusing CC and BCC | CC = visible to all; BCC = hidden from other recipients |\n| **General** | Not reading questions carefully | Underline key words in each question |'),
  fb(5, 'RAM is ___ memory (data lost without power). ROM is ___ memory (data retained permanently).',
    ['volatile', 'non-volatile'],
    'Volatile means data disappears when power is off (RAM). Non-volatile means data stays even without power (ROM, SSD, HDD).'),
  t(6, '### Revision Checklist\n\nUse this checklist to ensure you have covered all Grade 10 topics:\n\n**Hardware:**\n- [ ] System unit components (CPU, RAM, motherboard, PSU, GPU)\n- [ ] Ports and connectors (USB, HDMI, Ethernet, audio)\n- [ ] Input devices (keyboard, mouse, scanner, microphone, barcode reader, biometric)\n- [ ] Output devices (monitor, printer types, speakers, projector)\n- [ ] Storage (RAM vs ROM, HDD vs SSD, USB flash, SD card, cloud)\n- [ ] Storage capacity units (KB, MB, GB, TB)\n- [ ] Peripheral devices and connection methods\n\n**Software:**\n- [ ] System vs application software\n- [ ] Operating system functions\n- [ ] Utility programs\n- [ ] Software licensing (commercial, freeware, shareware, open-source)\n- [ ] Installing and uninstalling software\n- [ ] Basic security (antivirus, firewall, strong passwords)\n\n**Practical Applications:**\n- [ ] Word processing (formatting, tables, images, page layout)\n- [ ] Spreadsheets (formulas, functions, charts, referencing)\n- [ ] HTML (tags, tables, lists, links, images, colours)\n- [ ] Presentations (design rules, transitions, animations)\n\n**Networks and Internet:**\n- [ ] Network types (PAN, LAN, WAN)\n- [ ] Network devices (router, switch, modem, access point)\n- [ ] Wired vs wireless, ISPs\n- [ ] Internet vs WWW, browsers, search engines, URLs\n- [ ] Email (parts, CC/BCC, netiquette, attachments)\n\n**Social and Information:**\n- [ ] Ethics, green computing, copyright, piracy\n- [ ] Health risks and ergonomics\n- [ ] Authentication methods\n- [ ] Data vs information, primary vs secondary sources\n- [ ] Evaluating websites, plagiarism, referencing'),
  q(7, 'Which data type should be used for a phone number in a spreadsheet?',
    ['Text', 'Number', 'Currency', 'Date'], 0,
    'Phone numbers should be stored as Text because they may contain leading zeros (like 082...) that would be removed in Number format. You also do not perform calculations on phone numbers.'),
  q(8, 'What is the FIRST step you should take when installing new software?',
    ['Check that your computer meets the minimum system requirements', 'Delete all your files first', 'Disconnect from the internet', 'Turn off your antivirus'], 0,
    'Always check system requirements first. If your computer does not meet them, the software may not install or may run poorly. Never turn off your antivirus.'),
];

// =============================================================================
// INSERT EVERYTHING
// =============================================================================

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Look up or create Grade 10
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

  // Look up or create the CAT subject
  const subjectDoc = await db.collection('subjects').findOne({
    $or: [
      { name: /Comp.*App.*Tech/i },
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
      title: 'Chapter 1: Introduction to Computers',
      description: 'What a computer is, types of computers, embedded computers, convergence, ICTs in everyday life, the desktop GUI, and keyboard and mouse basics.',
      order: 1,
      lessons: [
        { title: 'What Is a Computer?', description: 'Definitions of data, information, hardware, software, and ICT. Types of computers from desktops to supercomputers. Embedded computers, convergence, ICTs in South Africa, and the desktop GUI.', blocks: ch1_lesson1, term: 1 },
        { title: 'Keyboard Skills, Ergonomics, and Health Risks', description: 'Keyboard layout, QWERTY, keyboard shortcuts, home row position, good typing habits, ergonomics, health risks (RSI, eye strain), and the 20-20-20 rule.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Computer Management and File Organisation',
      description: 'Switching on and logging in, user accounts, passwords, file management, naming conventions, file operations, file properties, extensions, and File Explorer.',
      order: 2,
      lessons: [
        { title: 'Logging In, Passwords, and File Organisation', description: 'Starting a computer, user accounts, strong vs weak passwords, files and folders, naming conventions, and creating a logical folder structure.', blocks: ch2_lesson1, term: 1 },
        { title: 'File Operations, Properties, and File Explorer', description: 'Copy, cut, paste, rename, delete, file specifications (name, extension, size, path, dates), common file extensions, and using File Explorer.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Hardware \u2014 System Unit, Input, Output, and Storage',
      description: 'System unit components, CPU, ports, peripheral devices, input devices, output devices, printer types, storage (primary vs secondary), RAM vs ROM, SSD vs HDD, cloud storage.',
      order: 3,
      lessons: [
        { title: 'The System Unit, Ports, and Peripherals', description: 'Components inside the system unit (motherboard, CPU, RAM, PSU, GPU), ports and connectors (USB, HDMI, Ethernet), peripheral devices, and connection methods.', blocks: ch3_lesson1, term: 1 },
        { title: 'Input and Output Devices', description: 'Input devices (keyboard, mouse, scanner, barcode reader, biometric), pointing devices, output devices (monitor, printer, speakers), and printer types (inkjet, laser, dot matrix).', blocks: ch3_lesson2, term: 2 },
        { title: 'Storage Devices and Cloud Storage', description: 'Primary vs secondary storage, RAM vs ROM, HDD, SSD, USB flash drive, SD card, optical media, storage capacity units (KB, MB, GB, TB), and cloud storage services.', blocks: ch3_lesson3, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Software',
      description: 'System software vs application software, operating system functions, utility programs, application types, software suites, licensing, piracy, installing/uninstalling software, and basic security.',
      order: 4,
      lessons: [
        { title: 'System Software, Application Software, and Utilities', description: 'Two main categories of software, operating system functions, device drivers, utility programs (antivirus, disk cleanup, compression), and application software types.', blocks: ch4_lesson1, term: 1 },
        { title: 'Licensing, Installation, and Basic Security', description: 'Software licences (commercial, freeware, shareware, open-source), EULA, software piracy, installing and uninstalling software, system requirements, and basic security measures.', blocks: ch4_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Word Processing Basics',
      description: 'The word processor interface, entering and editing text, punctuation, font formatting, paragraph formatting, page layout, tables, and inserting objects.',
      order: 5,
      lessons: [
        { title: 'Getting Started: Interface, Text Entry, and Punctuation', description: 'The word processor interface, essential shortcuts, entering and editing text, selecting text, clipboard operations, punctuation rules, and formatting marks.', blocks: ch5_lesson1, term: 1 },
        { title: 'Font and Paragraph Formatting', description: 'Font properties (typeface, size, bold, italic), keyboard shortcuts, alignment, line spacing, paragraph spacing, styles, bullets and numbering, and borders.', blocks: ch5_lesson2, term: 1 },
        { title: 'Page Layout, Tables, and Inserting Objects', description: 'Page setup (margins, orientation, paper size), headers and footers, creating and formatting tables, and inserting pictures, shapes, WordArt, SmartArt, and text wrapping.', blocks: ch5_lesson3, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Networks',
      description: 'What a network is, types of networks (PAN, LAN, WAN), network devices (router, switch, modem), wired vs wireless, ISPs, and internet connection types in South Africa.',
      order: 6,
      lessons: [
        { title: 'Network Basics, Devices, and Connections', description: 'Why use networks, PAN/LAN/WAN, network devices (modem, router, switch, access point, NIC), wired vs wireless, ISPs, and South African connection types (fibre, LTE, ADSL).', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Social Implications and Ethics',
      description: 'Computer ethics, green computing, economic reasons for computers, health and ergonomics, authentication methods, copyright, and software piracy.',
      order: 7,
      lessons: [
        { title: 'Ethics, Green Computing, Authentication, and Copyright', description: 'Computer ethics, green computing, economic reasons for using computers, health and ergonomics, authentication methods (password, PIN, biometrics, 2FA), copyright, and software piracy.', blocks: ch7_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 8: Spreadsheets',
      description: 'Spreadsheet interface, data types, entering and formatting data, formulas, basic functions (SUM, AVERAGE, MAX, MIN, COUNT, IF), cell referencing, sorting, filtering, and charts.',
      order: 8,
      lessons: [
        { title: 'The Spreadsheet Interface and Formatting', description: 'Spreadsheet elements (cell, row, column, workbook, worksheet), data types, entering data, number formatting, cell formatting, merge cells, and wrap text.', blocks: ch8_lesson1, term: 2 },
        { title: 'Formulas, Functions, and IF', description: 'Writing formulas with operators, BODMAS order of operations, basic functions (SUM, AVERAGE, MAX, MIN, COUNT, COUNTA), ranges, and the IF function with nested IFs.', blocks: ch8_lesson2, term: 2 },
        { title: 'Cell Referencing, Sorting, Filtering, and Charts', description: 'Relative, absolute, and mixed references, the dollar sign, F4 shortcut, VAT calculation example, auto fill, sorting, filtering, chart types, and chart elements.', blocks: ch8_lesson3, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Internet, Email, and Communication',
      description: 'The internet vs WWW, web browsers, search engines, URLs, email basics, netiquette, safe email practices, downloading, uploading, and file compression.',
      order: 9,
      lessons: [
        { title: 'The Internet, WWW, Browsers, and Search Engines', description: 'Internet vs World Wide Web, web browsers, search engines, URLs and their parts, effective searching tips, and browser features.', blocks: ch9_lesson1, term: 3 },
        { title: 'Email, Netiquette, and File Management Online', description: 'Parts of an email, CC vs BCC, email addresses, netiquette rules, safe email practices, social media netiquette, downloading vs uploading, and file compression (ZIP).', blocks: ch9_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Presentations',
      description: 'Creating presentations, slide layouts, design rules, adding content, slide transitions, animations, and presenting a slide show.',
      order: 10,
      lessons: [
        { title: 'Creating and Designing Presentations', description: 'The presentation interface, creating slides, slide layouts, design rules (fonts, colours, text amount), adding content, transitions, animations, and presenting with keyboard shortcuts.', blocks: ch10_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: HTML and Web Design Basics',
      description: 'Introduction to HTML, document structure, basic tags, text formatting, lists, images, links, tables, colour codes, and web design principles.',
      order: 11,
      lessons: [
        { title: 'HTML Structure, Tags, Lists, Images, and Links', description: 'What HTML is, document structure, structural tags, text formatting tags, the font tag, unordered and ordered lists, images with alt text, and hyperlinks.', blocks: ch11_lesson1, term: 3 },
        { title: 'HTML Tables, Colours, and Web Design Principles', description: 'Creating tables with rows and cells, table attributes, body background colour, hex colour codes, creating a simple web page, and good design principles.', blocks: ch11_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Information Management',
      description: 'Data vs information vs knowledge, sources of information (primary and secondary), evaluating websites, domain extensions, plagiarism, and referencing.',
      order: 12,
      lessons: [
        { title: 'Finding, Evaluating, and Referencing Information', description: 'Data vs information vs knowledge, primary vs secondary sources, evaluating website reliability, domain extensions, signs of unreliable sources, plagiarism, and basic referencing.', blocks: ch12_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 13: Revision and Exam Preparation',
      description: 'Comprehensive revision covering Paper 1 theory and Paper 2 practical exam structure, strategies, common mistakes, and a full topic checklist for Grade 10 CAT.',
      order: 13,
      lessons: [
        { title: 'Exam Structure, Strategies, and Revision Checklist', description: 'Paper 1 and Paper 2 structure, study guides by topic, practical tips, common mistakes to avoid, and a complete revision checklist for all Grade 10 CAT topics.', blocks: ch13_lesson1, term: 4 },
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
    title: 'Grade 10 Computer Applications Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Introduction to Computers, Computer Management, Hardware (system unit, input, output, storage), Software, Word Processing, Networks, Social Implications, Spreadsheets, Internet and Email, Presentations, HTML and Web Design, Information Management, and Revision for Grade 10 CAT.',
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
  console.log('  TEXTBOOK: Grade 10 Computer Applications Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
