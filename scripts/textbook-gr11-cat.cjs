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
// CHAPTER 1: Systems Technologies - General and Hardware (Term 1)
// =============================================================================
blockNum = 0;
const ch1_lesson1 = [
  t(1, '## The Information Processing Cycle\n\nEvery computing device follows the same fundamental cycle when working with data.\n\n### The Four Stages\n\n| Stage | Description | Example |\n|-------|-------------|--------|\n| **Input** | Data enters the system through an input device | Typing on a keyboard, scanning a barcode |\n| **Processing** | The CPU manipulates data according to instructions | Calculating a sum, sorting a list |\n| **Output** | Processed information is presented to the user | Displaying results on screen, printing a report |\n| **Storage** | Data is saved for future use | Saving a file to an SSD, uploading to cloud storage |\n\n### Communication as a Fifth Element\n\nModern computing adds **communication** to the cycle. When you send an email or upload a document to Google Drive, data moves between devices over a network. In South Africa, this happens via fibre, LTE, or satellite connections.\n\n**Practical example:** A teacher in Johannesburg captures marks (input), the system calculates averages (processing), a report card is displayed (output), marks are saved to the school database (storage), and parents receive the report via email (communication).'),
  q(2, 'Which stage of the information processing cycle involves the CPU manipulating data?',
    ['Processing', 'Input', 'Output', 'Storage'], 0,
    'Processing is the stage where the CPU performs calculations, comparisons, and logical operations on the input data.'),
  fb(3, 'In the information processing cycle, data enters through ___ devices and results are presented through ___ devices.',
    ['input', 'output'],
    'Input devices bring data into the system. Output devices present processed information to the user.'),
];

blockNum = 0;
const ch1_lesson2 = [
  t(1, '## Types of Computing Devices\n\nComputing devices range from powerful servers to tiny wearables. Understanding each type helps you recommend the right device for a given situation.\n\n### Categories of Computers\n\n| Type | Description | South African Example |\n|------|-------------|----------------------|\n| **Supercomputer** | Most powerful; used for complex scientific calculations | The Centre for High Performance Computing in Cape Town |\n| **Mainframe** | Handles massive amounts of data for large organisations | SARS processes tax returns for millions |\n| **Server** | Provides services (files, web, email) to other computers on a network | A school file server storing learner records |\n| **Desktop PC** | General-purpose computer for a fixed location | Office workstation at a law firm |\n| **Laptop / Notebook** | Portable with built-in screen, keyboard, battery | A teacher using a laptop in class |\n| **Tablet** | Touchscreen device, lighter than a laptop | Learners reading e-textbooks on a tablet |\n| **Smartphone** | Pocket-sized device combining phone, camera, and computer | Checking WhatsApp messages |\n| **Wearable** | Body-worn device (smartwatch, fitness tracker) | Tracking steps with a Garmin watch |'),
  t(2, '### Embedded Computers and Convergence\n\n**Embedded computers** are built into other devices to control specific functions. They are everywhere, even though you may not notice them.\n\nExamples:\n- Microwave oven (controls cooking time and power)\n- ATM machine (processes bank transactions)\n- Traffic lights (controls timing sequences)\n- Smart TV (runs apps and streaming services)\n- Vehicle engine management system (monitors fuel injection and emissions)\n\n**Convergence** is the merging of multiple technologies into a single device. A modern smartphone demonstrates convergence because it replaces a camera, GPS navigator, music player, torch, calculator, and computer.\n\n**South African convergence examples:**\n- Banking apps on phones replace physical bank visits\n- Smart TVs stream DStv Now, YouTube, and Netflix\n- Smartwatches make contactless payments via SnapScan or Zapper'),
  q(3, 'An ATM machine contains a computer that handles banking transactions. This is an example of a(n):',
    ['Embedded computer', 'Supercomputer', 'Mainframe', 'Desktop PC'], 0,
    'An embedded computer is built into a larger device to perform a dedicated function. The ATM contains a specialised computer designed specifically for banking transactions.'),
  t(4, '## Input Devices\n\nInput devices allow users to enter data and instructions into a computer.\n\n### Common Input Devices\n\n| Device | Type | How It Works |\n|--------|------|-------------|\n| **Keyboard** | Manual | User presses keys to enter text and commands |\n| **Mouse** | Pointing | Detects movement on a surface; buttons for clicking |\n| **Touchscreen** | Pointing / Direct | Detects finger or stylus contact on the screen |\n| **Scanner** | Optical | Converts physical documents or images into digital format |\n| **Microphone** | Audio | Converts sound waves into digital audio signals |\n| **Webcam** | Visual | Captures video for calls, recording, or security |\n| **Barcode reader** | Optical | Reads barcodes on products (used at Checkers, Pick n Pay) |\n| **Biometric scanner** | Security | Reads fingerprints, facial features, or iris patterns |\n| **Digital camera** | Visual | Captures still photos and video |\n| **Stylus / Digital pen** | Pointing | Precision input for drawing and handwriting on tablets |'),
  q(5, 'At a Checkers supermarket, the cashier scans each product. The barcode reader is classified as a(n):',
    ['Input device', 'Output device', 'Storage device', 'Processing device'], 0,
    'A barcode reader inputs product information into the computer system by reading the barcode. It is an input device because it sends data into the system.'),
  t(6, '## Output Devices\n\nOutput devices present processed information to the user.\n\n### Common Output Devices\n\n| Device | Type | Description |\n|--------|------|-------------|\n| **Monitor / Screen** | Visual | Displays text, images, and video |\n| **Printer** | Hard copy | Produces physical copies on paper |\n| **Speakers** | Audio | Produce sound output |\n| **Headphones** | Audio | Personal audio output |\n| **Projector** | Visual | Projects a large image onto a screen or wall |\n| **3D Printer** | Physical | Creates three-dimensional objects layer by layer |\n\n### Printer Types\n\n| Printer Type | Technology | Best For |\n|-------------|-----------|----------|\n| **Inkjet** | Sprays tiny droplets of ink | Photo printing, home use |\n| **Laser** | Uses toner powder and heat | High-volume office printing |\n| **Dot matrix** | Strikes ribbon with pins | Multi-part forms, invoices |\n| **3D printer** | Deposits layers of plastic/resin | Prototypes, models, custom parts |'),
  q(7, 'A school needs to print 500 copies of an exam paper quickly and cheaply. Which printer type is MOST suitable?',
    ['Laser printer', 'Inkjet printer', '3D printer', 'Dot matrix printer'], 0,
    'Laser printers are designed for high-volume printing. They are faster than inkjet printers and have a lower cost per page, making them ideal for printing large quantities.'),
  fb(8, 'A ___ printer is best for high-volume office printing, while an ___ printer is better for colour photo printing at home.',
    ['laser', 'inkjet'],
    'Laser printers are fast and cost-effective for large print jobs. Inkjet printers produce high-quality colour output suitable for photos.'),
];

blockNum = 0;
const ch1_lesson3 = [
  t(1, '## Storage: Primary and Secondary\n\n### Primary Storage (Memory)\n\nPrimary storage is directly accessible by the CPU and is used for data that is currently being processed.\n\n| Type | Description | Volatile? |\n|------|-------------|----------|\n| **RAM (Random Access Memory)** | Temporarily holds data and programs currently in use | Yes (data lost when power off) |\n| **ROM (Read Only Memory)** | Permanently stores startup instructions (BIOS/UEFI) | No (data retained without power) |\n| **Cache** | Very fast memory between CPU and RAM; stores frequently used data | Yes |\n\n**Key points:**\n- RAM is volatile: everything in RAM is lost when you switch off the computer\n- More RAM allows more programs to run simultaneously\n- ROM contains the boot instructions that start the computer\n- Cache speeds up processing by storing recently accessed data closer to the CPU'),
  t(2, '### Secondary Storage\n\nSecondary storage retains data permanently (non-volatile) even when the computer is switched off.\n\n| Type | Examples | Technology |\n|------|----------|----------|\n| **Magnetic** | Hard Disk Drive (HDD) | Spinning platters with read/write heads |\n| **Solid State** | SSD, USB flash drive, SD card | Flash memory chips, no moving parts |\n| **Optical** | CD, DVD, Blu-ray | Laser reads/writes pits on a disc surface |\n| **Cloud** | Google Drive, OneDrive, Dropbox | Data stored on remote servers via internet |\n\n### SSD vs HDD\n\n| Feature | SSD | HDD |\n|---------|-----|-----|\n| **Speed** | Very fast (500+ MB/s read) | Slower (80-160 MB/s) |\n| **Durability** | No moving parts, shock resistant | Fragile spinning platters |\n| **Noise** | Silent | Audible spinning and clicking |\n| **Power** | Low consumption | Higher consumption |\n| **Price per GB** | More expensive | Cheaper |\n| **Best for** | Operating system, programs | Bulk data storage |\n\nIn South Africa, SSDs have become more affordable and are now the recommended upgrade for any computer that still uses an HDD.'),
  q(3, 'Which type of storage loses all its data when the computer is switched off?',
    ['RAM', 'SSD', 'HDD', 'USB flash drive'], 0,
    'RAM (Random Access Memory) is volatile, meaning all data is lost when the power is turned off. SSDs, HDDs, and USB drives are non-volatile.'),
  fb(4, 'RAM is ___ storage, meaning data is lost without power. An SSD is ___ storage that retains data permanently.',
    ['volatile', 'non-volatile'],
    'Volatile means data disappears when power is removed. Non-volatile means data persists even without power.'),
  t(5, '## The System Unit\n\nThe **system unit** (or computer case) houses the main electronic components of a computer.\n\n### Components Inside the System Unit\n\n| Component | Function |\n|-----------|----------|\n| **Motherboard** | Main circuit board that connects all components together |\n| **CPU (Central Processing Unit)** | The brain of the computer; performs all calculations and logic |\n| **RAM slots** | Hold RAM modules for temporary data storage |\n| **GPU (Graphics Processing Unit)** | Processes graphics; can be integrated or a dedicated card |\n| **PSU (Power Supply Unit)** | Converts mains electricity to the correct voltages for components |\n| **Storage bays** | Hold HDDs and SSDs |\n| **Expansion slots** | Allow additional cards (graphics, sound, network) |\n| **Ports** | USB, HDMI, Ethernet, audio jacks for external connections |\n| **Cooling** | Fans and heat sinks prevent overheating |\n\n### Ports and Connectors\n\n| Port | Purpose |\n|------|---------|\n| **USB-A** | Standard USB for peripherals (keyboard, mouse, flash drive) |\n| **USB-C** | Modern reversible connector for data, video, and charging |\n| **HDMI** | High-Definition Multimedia Interface for video and audio |\n| **Ethernet (RJ-45)** | Wired network connection |\n| **3.5 mm audio jack** | Headphones or speakers |\n| **VGA / DisplayPort** | Video output to monitors |'),
  q(6, 'Which component is the main circuit board that connects the CPU, RAM, and all other components?',
    ['Motherboard', 'CPU', 'PSU', 'GPU'], 0,
    'The motherboard is the main circuit board that provides the physical connections and pathways for all components to communicate.'),
  t(7, '## Health Risks and Ergonomics\n\nUsing computers for long periods can cause health problems. Understanding these risks helps you set up a safe workspace.\n\n### Common Health Risks\n\n| Risk | Cause | Prevention |\n|------|-------|------------|\n| **Eye strain** | Staring at a screen for hours | Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds |\n| **Repetitive Strain Injury (RSI)** | Repeated hand/wrist movements (typing, mouse) | Use an ergonomic keyboard and mouse; take regular breaks |\n| **Back and neck pain** | Poor posture, incorrect chair height | Adjust chair so feet are flat on the floor; screen at eye level |\n| **Headaches** | Screen glare, incorrect brightness | Reduce glare with screen filters; adjust brightness |\n| **Obesity** | Sedentary lifestyle from long computer use | Take regular breaks; exercise |\n\n### Ergonomic Setup\n\n- Monitor at arm length, top of screen at eye level\n- Feet flat on the floor, knees at 90 degrees\n- Wrists straight when typing (use a wrist rest)\n- Chair provides lumbar (lower back) support\n- Room lighting reduces screen glare'),
  q(8, 'The 20-20-20 rule helps prevent which health risk?',
    ['Eye strain', 'RSI', 'Back pain', 'Obesity'], 0,
    'The 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds) is specifically designed to reduce eye strain from prolonged screen use.'),
  t(9, '## The Value of CAT Careers\n\nComputer Applications Technology opens doors to many career paths in South Africa.\n\n### Career Opportunities\n\n| Career | Description | Skills from CAT |\n|--------|-------------|----------------|\n| **Office administrator** | Manages documents, schedules, and communications | Word processing, spreadsheets, email |\n| **Data capturer** | Enters and manages data in databases | Database skills, accuracy, speed |\n| **Web designer** | Creates and maintains websites | HTML, design principles |\n| **IT support technician** | Helps users with hardware and software problems | Troubleshooting, hardware knowledge |\n| **Social media manager** | Manages online presence for businesses | Digital literacy, communication |\n| **Bookkeeper** | Manages financial records | Spreadsheets, data management |\n| **Teacher** | Teaches CAT or other computer-related subjects | All CAT skills |\n\n### Why CAT Matters\n\n- Digital literacy is essential in almost every modern job\n- South Africa has a growing tech sector with companies like Takealot, Naspers, and Discovery\n- Remote work opportunities require strong computer skills\n- CAT provides practical skills that are immediately useful in the workplace'),
  q(10, 'Which career would benefit MOST from the database skills learned in CAT?',
    ['Data capturer', 'Graphic designer', 'Electrician', 'Chef'], 0,
    'A data capturer works directly with databases, entering and managing information. The database skills from CAT (tables, forms, queries) are directly applicable to this career.'),
];

// =============================================================================
// CHAPTER 2: Systems Technologies - Software (Term 1)
// =============================================================================
blockNum = 0;
const ch2_lesson1 = [
  t(1, '## Computer Management\n\nManaging your computer effectively means understanding how to organise files, maintain software, and keep your system running smoothly.\n\n### File Management\n\n**Good file management** saves time and prevents data loss.\n\n| Practice | Description |\n|----------|-------------|\n| **Logical folder structure** | Create folders by subject, project, or date |\n| **Meaningful file names** | Use descriptive names: "CAT_Term1_Notes.docx" not "Document1.docx" |\n| **File extensions** | Know common types: .docx (Word), .xlsx (Excel), .pptx (PowerPoint), .pdf, .jpg, .html |\n| **Regular backups** | Copy important files to a second location (USB, cloud) |\n| **Delete unnecessary files** | Free up storage by removing old downloads and temp files |\n\n### File Properties\n\nRight-clicking a file and selecting Properties shows:\n- File name and type\n- Location (folder path)\n- Size (in KB, MB, or GB)\n- Date created, modified, and last accessed\n- Attributes (read-only, hidden)'),
  t(2, '### Compression and File Formats\n\n**Compression** reduces file size for easier storage and sharing.\n\n| Concept | Explanation |\n|---------|-------------|\n| **ZIP file** | A compressed archive that can contain multiple files and folders |\n| **Why compress?** | Smaller files are faster to upload, download, and email |\n| **How to compress** | Right-click > Send to > Compressed (zipped) folder |\n| **How to extract** | Right-click ZIP file > Extract All |\n\n**Common file formats:**\n\n| Format | Type | Application |\n|--------|------|-------------|\n| .docx | Word processing | Microsoft Word, LibreOffice Writer |\n| .xlsx | Spreadsheet | Microsoft Excel, LibreOffice Calc |\n| .pptx | Presentation | Microsoft PowerPoint, LibreOffice Impress |\n| .accdb / .odb | Database | Microsoft Access, LibreOffice Base |\n| .pdf | Portable document | Adobe Reader, any browser |\n| .csv | Comma-separated values | Any spreadsheet or text editor |\n| .html | Web page | Any web browser |\n| .txt | Plain text | Notepad, any text editor |'),
  q(3, 'A learner needs to email a folder containing 15 photos to their teacher. The email has a 10 MB attachment limit. What should the learner do?',
    ['Compress (ZIP) the folder to reduce its size before attaching', 'Send 15 separate emails with one photo each', 'Print the photos and hand them in', 'Delete some photos to make the folder smaller'], 0,
    'Compressing the folder into a ZIP file reduces the total size and combines all files into a single attachment, making it easier to send within the size limit.'),
  fb(4, 'A ___ file is a compressed archive that can contain multiple files. The file extension for a Word document is ___.',
    ['ZIP', '.docx'],
    'ZIP files compress and bundle multiple files together. Microsoft Word documents use the .docx extension.'),
];

blockNum = 0;
const ch2_lesson2 = [
  t(1, '## System Requirements\n\nBefore installing software, you must check that your computer meets the **system requirements** specified by the software developer.\n\n### Minimum vs Recommended Requirements\n\n| Component | Minimum | Recommended |\n|-----------|---------|-------------|\n| **Operating System** | Windows 10 | Windows 11 |\n| **Processor (CPU)** | 1 GHz dual-core | 2 GHz quad-core or better |\n| **RAM** | 4 GB | 8 GB or more |\n| **Storage** | 2 GB free | 5 GB free on SSD |\n| **Graphics** | Integrated | Dedicated GPU |\n\n**Minimum requirements** = the software will run, but may be slow or limited\n**Recommended requirements** = the software runs smoothly with all features\n\n### Why System Requirements Matter\n\n- Installing software on a computer that does not meet minimum requirements may cause crashes, freezes, or errors\n- Checking requirements before purchasing software prevents wasting money\n- If your computer is below minimum specs, consider upgrading RAM or storage before buying new software'),
  t(2, '### Hardware and Software Compatibility\n\n**Compatibility** means that hardware and software work together correctly.\n\n**Common compatibility issues:**\n\n| Issue | Example | Solution |\n|-------|---------|----------|\n| **OS version** | Software requires Windows 11 but you have Windows 10 | Upgrade OS or find compatible version |\n| **32-bit vs 64-bit** | 64-bit software will not run on 32-bit Windows | Install 64-bit OS |\n| **Driver missing** | New printer has no driver for your OS | Download driver from manufacturer website |\n| **RAM insufficient** | Video editor needs 16 GB but you have 4 GB | Upgrade RAM |\n| **File format** | Older Word cannot open .docx files | Save as .doc or install compatibility pack |\n\n**How to check your system specs:**\n1. Right-click This PC > Properties (shows CPU, RAM, Windows version)\n2. Open Task Manager > Performance tab (shows real-time usage)\n3. Settings > System > About (shows device specifications)'),
  q(3, 'A user tries to install a game that requires 8 GB of RAM, but their computer only has 4 GB. What will MOST likely happen?',
    ['The game will not install or will run very poorly with crashes', 'The game will run perfectly', 'The monitor will not display the game', 'The keyboard will stop working'], 0,
    'When a computer does not meet the minimum RAM requirement, the software may fail to install, crash frequently, or run extremely slowly because there is not enough memory for it to operate.'),
  fb(4, 'The ___ requirements are the bare minimum for software to run. A ___ operating system can run 32-bit software, but not the other way around.',
    ['minimum', '64-bit'],
    'Minimum requirements define the lowest acceptable specifications. A 64-bit OS can run both 32-bit and 64-bit programs, but a 32-bit OS cannot run 64-bit software.'),
];

blockNum = 0;
const ch2_lesson3 = [
  t(1, '## The Start-Up Process (Booting)\n\nWhen you press the power button, your computer goes through a specific sequence of steps before you can use it.\n\n### The Boot Process\n\n| Step | What Happens |\n|------|--------------|\n| 1. **Power on** | PSU sends electricity to components |\n| 2. **POST (Power-On Self-Test)** | BIOS/UEFI checks that essential hardware is working (CPU, RAM, storage, keyboard) |\n| 3. **BIOS/UEFI loads** | Firmware stored in ROM initialises hardware and looks for a boot device |\n| 4. **Boot loader runs** | A small program on the storage device loads the operating system |\n| 5. **OS loads** | Windows, macOS, or Linux loads into RAM |\n| 6. **Login screen** | User enters credentials to access the desktop |\n| 7. **Desktop ready** | Startup programs load and the computer is ready to use |\n\n### BIOS vs UEFI\n\n| Feature | BIOS (Basic Input/Output System) | UEFI (Unified Extensible Firmware Interface) |\n|---------|------|------|\n| **Age** | Legacy (1980s) | Modern replacement |\n| **Interface** | Text-based, keyboard only | Graphical, supports mouse |\n| **Boot speed** | Slower | Faster |\n| **Drive support** | Up to 2 TB (MBR) | Over 2 TB (GPT) |\n| **Security** | Basic | Secure Boot prevents malware loading at startup |'),
  q(2, 'What is the purpose of the POST during the boot process?',
    ['To test that essential hardware components are working correctly', 'To load the operating system into RAM', 'To connect to the internet', 'To install software updates'], 0,
    'POST (Power-On Self-Test) checks critical hardware (CPU, RAM, keyboard, storage) to ensure everything is functioning before the operating system loads. If POST fails, the computer may beep or display an error.'),
  t(3, '### Operating System Functions\n\nThe **operating system (OS)** is the most important software on a computer. It manages hardware and provides a platform for application software.\n\n**Key OS functions:**\n\n| Function | Description |\n|----------|-------------|\n| **User interface** | Provides GUI (graphical) or CLI (command line) for user interaction |\n| **File management** | Organises files in folders, handles copying, moving, deleting |\n| **Memory management** | Allocates RAM to running programs, uses virtual memory when RAM is full |\n| **Processor management** | Decides which programs get CPU time (multitasking) |\n| **Device management** | Communicates with hardware through drivers |\n| **Security** | User accounts, passwords, permissions, firewall |\n| **Networking** | Manages network connections and sharing |\n\n**Common operating systems:**\n- **Windows** (most common on desktops/laptops in SA schools)\n- **macOS** (Apple computers)\n- **Linux** (free, open-source, used on servers)\n- **Android** (most smartphones in SA)\n- **iOS** (Apple mobile devices)'),
  fb(4, 'The ___ is the first test performed when a computer starts up. The operating system is loaded into ___ during booting.',
    ['POST', 'RAM'],
    'POST (Power-On Self-Test) runs first to check hardware. The operating system is then loaded from storage into RAM where it runs.'),
  t(5, '## Basic Concepts of Virtualisation\n\n**Virtualisation** is a technology that creates a virtual (simulated) version of something, such as a computer, operating system, storage device, or network.\n\n### Virtual Machines\n\nA **virtual machine (VM)** is a software-based computer that runs inside your physical computer. It behaves like a real computer with its own CPU, RAM, storage, and operating system.\n\n**How it works:**\n- A **hypervisor** (software layer) manages virtual machines on the host computer\n- Each VM runs its own operating system independently\n- Multiple VMs can run on one physical machine simultaneously\n\n**Benefits of virtualisation:**\n\n| Benefit | Explanation |\n|---------|-------------|\n| **Test software safely** | Try new software or OS without affecting your main system |\n| **Run multiple OS** | Use Windows and Linux on the same computer |\n| **Save hardware costs** | One powerful server can run many virtual servers |\n| **Easy backup** | A VM can be copied or saved as a snapshot |\n| **Isolation** | If a VM gets a virus, it does not affect the host computer |\n\n**Example:** A South African IT support technician uses VirtualBox to run a Windows 10 VM inside Windows 11 to test whether old school software still works.'),
  q(6, 'What is a virtual machine?',
    ['A software-based computer that runs inside a physical computer', 'A computer connected to the internet', 'A special type of hard drive', 'A backup copy of a file'], 0,
    'A virtual machine is a software emulation of a complete computer system that runs inside a physical host computer, with its own operating system and applications.'),
  t(7, '### Cloud Computing and Virtualisation\n\n**Cloud computing** relies heavily on virtualisation. When you use Google Docs, Microsoft 365 online, or store files on Dropbox, you are using virtualised servers in a data centre.\n\n**Types of cloud services:**\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **SaaS (Software as a Service)** | Software accessed via web browser | Google Docs, Microsoft 365 online, Gmail |\n| **IaaS (Infrastructure as a Service)** | Virtual hardware (servers, storage) rented online | Amazon Web Services, Microsoft Azure |\n| **PaaS (Platform as a Service)** | Platform for developing and hosting applications | Google App Engine |\n\n**Cloud storage advantages for SA learners:**\n- Access files from any device with internet\n- Automatic backups protect against load-shedding data loss\n- Collaborate with classmates in real time\n- No need to carry USB flash drives that can be lost or stolen'),
  q(8, 'A school stores all learner records on Google Drive instead of a local server. This is an example of:',
    ['Cloud storage', 'Virtualisation of the CPU', 'A virtual machine', 'An embedded system'], 0,
    'Cloud storage means data is stored on remote servers accessed via the internet. Google Drive is a cloud storage service.'),
  fb(9, 'A ___ manages virtual machines on a host computer. ___ as a Service means using software through a web browser.',
    ['hypervisor', 'Software'],
    'A hypervisor is the software layer that creates and manages virtual machines. SaaS (Software as a Service) delivers applications over the internet via a browser.'),
];

// =============================================================================
// CHAPTER 3: Word Processing (Term 1)
// =============================================================================
blockNum = 0;
const ch3_lesson1 = [
  t(1, '## File Management in Word Processing\n\nEffective file management is the foundation of productive document work.\n\n### Saving and File Formats\n\n| Action | Shortcut | Description |\n|--------|----------|-------------|\n| **Save** | Ctrl+S | Saves changes to the current file |\n| **Save As** | F12 | Saves a copy with a new name, location, or format |\n| **Export as PDF** | File > Export/Save As > PDF | Creates a non-editable, shareable document |\n\n**Common formats for saving:**\n\n| Format | Extension | Use Case |\n|--------|-----------|----------|\n| Word Document | .docx | Default editable format |\n| Word 97-2003 | .doc | Compatibility with older versions |\n| PDF | .pdf | Sharing documents that should not be edited |\n| Rich Text Format | .rtf | Cross-platform compatibility |\n| Plain Text | .txt | Simple text without formatting |\n| Web Page | .html | Viewing in a web browser |\n\n**Import and Export:** You can open (import) files from other formats and save (export) your document in different formats to share with users who have different software.'),
  t(2, '### Input Data Formats\n\nWord processors can handle various types of data input:\n\n| Input Type | Example |\n|-----------|--------|\n| **Text** | Typing from keyboard, pasting from clipboard |\n| **Images** | Insert > Pictures (from file, online, or screenshot) |\n| **Tables** | Insert > Table or paste from Excel |\n| **Charts** | Insert > Chart or paste from Excel |\n| **Objects** | Insert > Object (embed Excel spreadsheet, PDF, etc.) |\n| **Text from file** | Insert > Object > Text from File (merges another document) |\n\n**Clipboard operations:**\n- **Cut** (Ctrl+X): Removes selected content and places it on the clipboard\n- **Copy** (Ctrl+C): Copies selected content to the clipboard\n- **Paste** (Ctrl+V): Inserts clipboard content at the cursor\n- **Paste Special**: Paste with options (unformatted text, linked object, picture)'),
  q(3, 'A learner needs to send their assignment to a teacher who does not have Microsoft Word. Which format should they save in?',
    ['PDF', '.docx', '.pptx', '.accdb'], 0,
    'PDF (Portable Document Format) can be opened on any device using free software. It preserves the layout and does not require Microsoft Word to view.'),
  fb(4, 'The shortcut ___ saves the current document. To save in a different format, use ___.',
    ['Ctrl+S', 'Save As'],
    'Ctrl+S performs a quick save. Save As (F12) allows you to change the file name, location, or format.'),
];

blockNum = 0;
const ch3_lesson2 = [
  t(1, '## Paragraphs and Page Layout\n\n### Paragraph Formatting\n\n| Feature | Description | How to Set |\n|---------|-------------|------------|\n| **Alignment** | Left, Centre, Right, Justify | Home tab > Paragraph group |\n| **Line spacing** | Space between lines (1.0, 1.15, 1.5, 2.0) | Home > Paragraph > Line Spacing |\n| **Paragraph spacing** | Space before and after a paragraph (in points) | Layout > Spacing > Before/After |\n| **Indentation** | First line indent, hanging indent, left/right indent | Layout > Indent or ruler |\n| **Tab stops** | Align text at specific positions using the Tab key | Click on ruler or Paragraph > Tabs |\n| **Bullets and numbering** | Create unordered or ordered lists | Home > Paragraph > Bullets/Numbering |\n| **Borders and shading** | Add lines around or background colour to paragraphs | Home > Paragraph > Borders |\n\n### Indentation Types\n\n| Type | Effect |\n|------|--------|\n| **First line** | Only the first line is indented (common in essays) |\n| **Hanging** | All lines except the first are indented (used in bibliographies) |\n| **Left / Right** | Entire paragraph moved inward from the margin |'),
  t(2, '### Page Layout Settings\n\n| Feature | Location | Purpose |\n|---------|----------|--------|\n| **Margins** | Layout > Margins | Set space between text and page edge |\n| **Orientation** | Layout > Orientation | Portrait (tall) or Landscape (wide) |\n| **Paper size** | Layout > Size | A4 (standard in SA), Letter |\n| **Columns** | Layout > Columns | Split text into newspaper-style columns |\n| **Page breaks** | Insert > Page Break or Ctrl+Enter | Force content to the next page |\n| **Section breaks** | Layout > Breaks > Section Breaks | Different formatting in different parts |\n| **Headers and footers** | Insert > Header/Footer | Information repeated on every page |\n| **Page numbers** | Insert > Page Number | Automatic page numbering |\n\n### Themes and Templates\n\n**Theme:** A set of colours, fonts, and effects applied to the entire document. Change via Design > Themes.\n\n**Template:** A pre-designed document with placeholder text and formatting. Examples: letter template, CV template, invoice template. Access via File > New > search for templates.\n\n**Difference:** A theme changes the appearance of an existing document. A template provides a starting layout and structure for a new document.'),
  q(3, 'A teacher wants every page of a document to show the school name at the top and the page number at the bottom. Which features should they use?',
    ['Header for the school name and footer for the page number', 'Text boxes on every page', 'Watermarks', 'Bookmarks'], 0,
    'Headers appear at the top of every page and footers at the bottom. They are the correct features for repeating information like school names and page numbers across all pages.'),
  fb(4, 'A ___ is a pre-designed document used as a starting point. A ___ is a set of colours, fonts, and effects applied to a document.',
    ['template', 'theme'],
    'Templates provide structure and layout for new documents. Themes control the visual appearance (colours, fonts, effects).'),
];

blockNum = 0;
const ch3_lesson3 = [
  t(1, '## Electronic Forms and Legacy Controls\n\n**Electronic forms** allow users to fill in specific fields in a document without changing the overall layout.\n\n### Why Use Electronic Forms?\n\n- Replace paper forms (saves printing costs)\n- Ensure consistent data entry\n- Can be emailed and filled in digitally\n- Reduce errors through restricted input options\n\n### Legacy Form Controls\n\nLegacy controls are found on the **Developer** tab (must be enabled in File > Options > Customize Ribbon).\n\n| Control | Icon | Purpose |\n|---------|------|---------|\n| **Text Form Field** | ab | User types text, numbers, or dates |\n| **Check Box Form Field** | A box | User ticks or unticks (yes/no choices) |\n| **Drop-Down Form Field** | A list | User selects from predefined options |\n\n### Setting Properties\n\nDouble-click a form field to set its properties:\n- **Text field:** Type (regular text, number, date), maximum length, default text, format\n- **Check box:** Default value (checked or unchecked), size\n- **Drop-down:** Add items to the selection list, set order'),
  t(2, '### Creating and Protecting a Form\n\n**Step-by-step process:**\n\n1. **Design the layout** - Create the form structure with labels, tables, and formatting\n2. **Enable Developer tab** - File > Options > Customize Ribbon > tick Developer\n3. **Insert controls** - Place text fields, checkboxes, and dropdowns where users need to enter data\n4. **Set properties** - Double-click each control to configure options\n5. **Protect the form** - Developer > Restrict Editing > Allow only Filling in forms > Yes, Start Enforcing Protection\n\n**Why protect the form?**\nWithout protection, users can modify the entire document layout. Protection ensures they can only interact with form fields.\n\n**South African use case:** A school creates a registration form with:\n- Text fields for learner name, surname, ID number\n- Drop-down for grade selection (Grade 8, 9, 10, 11, 12)\n- Drop-down for home language (English, Afrikaans, isiZulu, etc.)\n- Checkboxes for extra-mural activities\n- Text field for parent contact number'),
  q(3, 'Which legacy form control should be used when a user needs to select their province from a list of nine options?',
    ['Drop-down form field', 'Text form field', 'Check box form field', 'Command button'], 0,
    'A drop-down form field presents a list of predefined options that the user can select from, which is ideal for a fixed set like South African provinces.'),
  fb(4, 'A form must be ___ to prevent users from changing the document layout. The ___ tab contains the legacy form controls.',
    ['protected', 'Developer'],
    'Protecting the form restricts editing to form fields only. The Developer tab (which must be enabled manually) contains the form controls.'),
  t(5, '## Import and Export\n\n### Importing Content\n\nYou can bring content from other applications into a Word document:\n\n| Import From | Method |\n|-------------|--------|\n| **Excel table** | Copy in Excel > Paste Special in Word (choose paste option) |\n| **Text file** | Insert > Object > Text from File |\n| **Image** | Insert > Pictures > From File |\n| **PDF text** | Open PDF in Word (converts to editable text, may lose formatting) |\n| **Web content** | Copy from browser > Paste Special > Unformatted Text |\n\n### Exporting Content\n\n| Export To | Method |\n|-----------|--------|\n| **PDF** | File > Save As > PDF or File > Export |\n| **HTML** | File > Save As > Web Page (.html) |\n| **Plain text** | File > Save As > Plain Text (.txt) |\n| **Older Word format** | File > Save As > Word 97-2003 (.doc) |\n\n**Paste Special options:**\n- **Formatted Text (RTF):** Keeps most formatting\n- **Unformatted Text:** Strips all formatting (useful for pasting from web)\n- **Picture:** Pastes as an image\n- **Link:** Pastes a live link that updates when the source changes'),
  q(6, 'A learner copies text from a website and pastes it into Word, but the formatting looks messy. What should they use instead?',
    ['Paste Special > Unformatted Text', 'Paste Special > Picture', 'Paste Special > Link', 'Regular Paste'], 0,
    'Pasting as Unformatted Text strips all web formatting (colours, fonts, backgrounds) and applies the Word document formatting instead.'),
];

// =============================================================================
// CHAPTER 4: Spreadsheets (Term 1-2)
// =============================================================================
blockNum = 0;
const ch4_lesson1 = [
  t(1, '## Reinforcing Grade 10 Spreadsheet Skills\n\nBefore learning new functions, ensure you have mastered the basics from Grade 10.\n\n### Essential Concepts Review\n\n| Concept | Description |\n|---------|-------------|\n| **Cell reference** | A cell address like A1, B5, C12 |\n| **Formula** | Starts with = and performs a calculation (e.g., =A1+B1) |\n| **Function** | A predefined formula (e.g., =SUM, =AVERAGE, =MAX, =MIN) |\n| **Range** | A group of cells (e.g., A1:A10 means A1 through A10) |\n| **Data types** | Numbers, text, dates, currency, percentages |\n| **Formatting** | Number format, font, borders, alignment, cell colour |\n| **Charts** | Bar, column, line, pie charts to visualise data |\n| **Sorting** | Arranging data in ascending or descending order |\n| **Filtering** | Showing only rows that meet specific criteria |\n\n### Basic Functions Review\n\n| Function | Purpose | Example |\n|----------|---------|--------|\n| =SUM(range) | Adds values | =SUM(B2:B10) |\n| =AVERAGE(range) | Calculates mean | =AVERAGE(C2:C20) |\n| =MAX(range) | Finds highest value | =MAX(D2:D50) |\n| =MIN(range) | Finds lowest value | =MIN(D2:D50) |\n| =COUNT(range) | Counts cells with numbers | =COUNT(A1:A100) |\n| =COUNTA(range) | Counts non-empty cells | =COUNTA(A1:A100) |\n| =IF(test, true, false) | Makes a decision | =IF(B2>=50, "Pass", "Fail") |'),
  q(2, 'What is the difference between COUNT and COUNTA?',
    ['COUNT counts only numbers; COUNTA counts all non-empty cells including text', 'COUNT counts text; COUNTA counts numbers', 'They are the same function', 'COUNT counts empty cells; COUNTA counts full cells'], 0,
    'COUNT only counts cells containing numeric values. COUNTA counts all cells that are not empty, including text, numbers, dates, and errors.'),
  fb(3, 'The function ___ finds the highest value in a range. The function ___ counts all non-empty cells regardless of data type.',
    ['MAX', 'COUNTA'],
    'MAX returns the largest number in a range. COUNTA counts every cell that contains any type of data.'),
];

blockNum = 0;
const ch4_lesson2 = [
  t(1, '## Absolute Cell Referencing\n\nUnderstanding cell references is crucial for building correct formulas.\n\n### Types of Cell References\n\n| Type | Example | Behaviour When Copied |\n|------|---------|----------------------|\n| **Relative** | A1 | Changes based on new position (default) |\n| **Absolute** | $A$1 | Always refers to the same cell (locked) |\n| **Mixed** | $A1 or A$1 | Column or row is locked, the other adjusts |\n\n### The $ Sign\n\nThe dollar sign ($) locks a row, column, or both:\n- **$A$1** = Column A is locked AND Row 1 is locked\n- **$A1** = Column A is locked, row adjusts when copied down\n- **A$1** = Row 1 is locked, column adjusts when copied across\n\n**Shortcut:** Press **F4** while editing a cell reference to cycle through reference types.\n\n### When to Use Absolute References\n\nUse absolute references when a formula refers to a **fixed value** such as:\n- A VAT rate in a single cell (e.g., $B$1 = 15%)\n- An exchange rate\n- A discount percentage\n- A tax threshold'),
  t(2, '### Practical Example: VAT Calculation\n\nSuppose cell B1 contains the VAT rate (15%) and column A contains prices:\n\n| | A | B |\n|---|---|---|\n| 1 | **Price** | **VAT Rate: 15%** |\n| 2 | R100.00 | =A2*$B$1 |\n| 3 | R250.00 | =A3*$B$1 |\n| 4 | R89.99 | =A4*$B$1 |\n\nWhen you copy the formula from B2 down to B3 and B4:\n- A2 changes to A3, A4 (relative - correct, each row needs its own price)\n- $B$1 stays as $B$1 (absolute - correct, always the same VAT rate)\n\n**Without the $ signs:** B3 would become =A3*B2 (wrong cell for VAT rate) and give incorrect results.\n\n### Auto Fill\n\n**Auto Fill** copies content or patterns to adjacent cells by dragging the fill handle (small square at the bottom-right corner of a cell).\n\n**Auto Fill recognises patterns:**\n- Numbers: 1, 2, 3 becomes 4, 5, 6...\n- Dates: Jan, Feb, Mar becomes Apr, May, Jun...\n- Days: Monday, Tuesday becomes Wednesday, Thursday...\n- Formulas: =A1*2, =A2*2 continues the pattern'),
  q(3, 'A formula in cell C2 is =A2*$B$1. When this formula is copied to cell C5, it becomes:',
    ['=A5*$B$1', '=A2*$B$4', '=A5*$B$4', '=A2*$B$1'], 0,
    'A2 is a relative reference, so it adjusts to A5 when copied down 3 rows. $B$1 is absolute, so it stays as $B$1 regardless of where the formula is copied.',
    ['The $ sign locks the reference. A relative reference changes when copied.']),
  fb(4, 'The shortcut key ___ cycles through reference types. The symbol ___ locks a cell reference so it does not change when copied.',
    ['F4', '$'],
    'Pressing F4 while editing a reference toggles between relative, absolute, and mixed references. The $ sign makes a reference absolute.'),
];

blockNum = 0;
const ch4_lesson3 = [
  t(1, '## Spreadsheet Functions: SUMIF, COUNTIF, RAND, SMALL, LARGE\n\n### SUMIF Function\n\n`=SUMIF(range, criteria, [sum_range])`\n\nAdds values in a range that meet a single condition.\n\n| Parameter | Description |\n|-----------|-------------|\n| range | Cells to evaluate against the criteria |\n| criteria | The condition to match (number, text, or expression) |\n| sum_range | The cells to add up (optional; if omitted, the range is summed) |\n\n**Examples:**\n\n| Formula | What It Does |\n|---------|--------------|\n| =SUMIF(B2:B20, "Gauteng", C2:C20) | Sums column C where column B is "Gauteng" |\n| =SUMIF(D2:D100, ">1000") | Sums values in D that are greater than 1000 |\n| =SUMIF(A2:A50, "Fees", B2:B50) | Sums column B where column A contains "Fees" |'),
  t(2, '### COUNTIF Function\n\n`=COUNTIF(range, criteria)`\n\nCounts cells that meet a single condition.\n\n**Examples:**\n\n| Formula | What It Does |\n|---------|--------------|\n| =COUNTIF(B2:B100, "Pass") | Counts how many cells contain "Pass" |\n| =COUNTIF(C2:C50, ">75") | Counts values greater than 75 |\n| =COUNTIF(A2:A200, "Female") | Counts cells containing "Female" |\n\n### RAND Function\n\n`=RAND()`\n\nGenerates a random decimal number between 0 (inclusive) and 1 (exclusive). The value changes every time the spreadsheet recalculates.\n\n**Useful applications:**\n- Randomise a list: Add a column of =RAND() values, then sort by that column\n- Generate random percentages: =RAND()*100\n- Simulate probability: =IF(RAND()<0.5, "Heads", "Tails")\n\n**Note:** To keep random values, copy and Paste Special > Values.'),
  t(3, '### SMALL and LARGE Functions\n\n`=SMALL(range, k)` returns the k-th smallest value in a range.\n`=LARGE(range, k)` returns the k-th largest value in a range.\n\n| Formula | Result |\n|---------|--------|\n| =SMALL(A1:A10, 1) | The smallest value (same as MIN) |\n| =SMALL(A1:A10, 2) | The 2nd smallest value |\n| =SMALL(A1:A10, 3) | The 3rd smallest value |\n| =LARGE(A1:A10, 1) | The largest value (same as MAX) |\n| =LARGE(A1:A10, 2) | The 2nd largest value |\n\n**South African classroom example:**\nA teacher has marks in B2:B40 and wants to find:\n- The top 3 marks: =LARGE(B2:B40, 1), =LARGE(B2:B40, 2), =LARGE(B2:B40, 3)\n- The bottom 3 marks: =SMALL(B2:B40, 1), =SMALL(B2:B40, 2), =SMALL(B2:B40, 3)'),
  q(4, 'Which function would you use to find the 3rd highest mark in a range of test scores?',
    ['=LARGE(range, 3)', '=SMALL(range, 3)', '=MAX(range, 3)', '=RANK(range, 3)'], 0,
    'LARGE(range, k) returns the k-th largest value. LARGE(range, 3) gives the 3rd highest value.'),
  fb(5, 'The function ___ adds values that meet a condition. The function ___ returns the k-th smallest value in a range.',
    ['SUMIF', 'SMALL'],
    'SUMIF conditionally sums values. SMALL returns the k-th smallest number from a data set.'),
];

blockNum = 0;
const ch4_lesson4 = [
  t(1, '## Conditional Formatting\n\nConditional formatting changes the appearance of cells based on their values, making important data stand out visually.\n\n### Common Conditional Formatting Rules\n\n| Rule Type | What It Does | Example |\n|-----------|-------------|--------|\n| **Highlight Cell Rules** | Colours cells based on value | Highlight marks below 50 in red |\n| **Top/Bottom Rules** | Highlights top or bottom values | Highlight top 10 values in green |\n| **Data Bars** | Adds bars inside cells proportional to value | Longer bar = higher number |\n| **Colour Scales** | Applies a gradient (e.g., red-yellow-green) | Low values red, high values green |\n| **Icon Sets** | Adds icons (arrows, traffic lights, stars) | Green arrow for above average |\n\n### How to Apply\n\n1. Select the range of cells\n2. Home > Conditional Formatting > Choose rule type\n3. Set the condition and format\n4. Click OK\n\n**South African school example:**\nA teacher formats a mark sheet:\n- Marks below 30: Red fill (not achieved)\n- Marks 30-49: Orange fill (elementary)\n- Marks 50-69: Yellow fill (moderate)\n- Marks 70-79: Light green fill (substantial)\n- Marks 80-100: Green fill (outstanding)'),
  t(2, '### Creating Custom Rules\n\n**Steps for a custom conditional formatting rule:**\n1. Select the data range\n2. Home > Conditional Formatting > New Rule\n3. Choose "Use a formula to determine which cells to format"\n4. Enter a formula that returns TRUE or FALSE\n5. Set the formatting (fill colour, font colour, bold, etc.)\n\n**Example formulas:**\n\n| Formula | Condition |\n|---------|-----------|\n| =$B2>80 | Value in column B is greater than 80 |\n| =$C2="Pass" | Text in column C is exactly "Pass" |\n| =TODAY()-$D2>30 | Date in column D is more than 30 days ago |\n| =MOD(ROW(),2)=0 | Alternate row shading (even rows) |\n\n### Managing Rules\n\n- **Edit rules:** Home > Conditional Formatting > Manage Rules\n- **Rule priority:** Rules are applied in order; the first matching rule takes effect\n- **Clear rules:** Home > Conditional Formatting > Clear Rules from Selected Cells'),
  q(3, 'A teacher wants marks below 50 to appear in red text automatically. Which feature should they use?',
    ['Conditional formatting', 'Find and Replace', 'Data validation', 'Sorting'], 0,
    'Conditional formatting automatically changes cell appearance based on values. It can highlight marks below 50 in red without manually formatting each cell.'),
  fb(4, 'Conditional formatting changes cell appearance based on ___. ___ bars show the relative size of values using horizontal bars inside cells.',
    ['values', 'Data'],
    'Conditional formatting applies visual formatting based on cell values or conditions. Data bars are a type of conditional formatting that displays proportional bars.'),
  t(5, '## Error Indicators in Spreadsheets\n\nWhen a formula goes wrong, the spreadsheet displays an error code to help you diagnose the problem.\n\n| Error | Cause | Fix |\n|-------|-------|-----|\n| **#DIV/0!** | Division by zero | Check the divisor is not empty or zero; use =IF(B1=0, 0, A1/B1) |\n| **#VALUE!** | Wrong data type in formula | Ensure cells contain numbers, not text that looks like numbers |\n| **#REF!** | Invalid cell reference (deleted row/column) | Undo the deletion or fix the formula |\n| **#NAME?** | Unrecognised function name or missing quotes around text | Check spelling; put text criteria in quotes |\n| **#N/A** | Lookup value not found | Check spelling of lookup value; use IFERROR to handle |\n| **#NUM!** | Invalid numeric value | Check for impossible calculations (e.g., square root of negative) |\n| **#NULL!** | Incorrect range operator | Use colon (:) for ranges, not space |\n| **Circular reference** | Formula refers to its own cell | Rework the formula so it does not reference itself |\n\n### IFERROR Function\n\n`=IFERROR(value, value_if_error)`\n\nReturns a custom result if a formula produces an error.\n\nExample: `=IFERROR(A1/B1, "N/A")` displays "N/A" instead of #DIV/0! when B1 is zero.'),
  q(6, 'A formula shows #NAME? error. What is the MOST likely cause?',
    ['The function name is misspelled or text is not in quotes', 'A cell was deleted', 'The formula divides by zero', 'The lookup value was not found'], 0,
    '#NAME? appears when the spreadsheet does not recognise a function name (e.g., =SUMM instead of =SUM) or when text criteria are not enclosed in quotation marks.'),
];

// =============================================================================
// CHAPTER 5: Network Technologies (Term 2)
// =============================================================================
blockNum = 0;
const ch5_lesson1 = [
  t(1, '## LAN and WLAN\n\n### Local Area Network (LAN)\n\nA **LAN** connects computers and devices within a small area such as a school, office, or home.\n\n| Feature | Detail |\n|---------|--------|\n| **Coverage** | Single building or campus |\n| **Speed** | High (100 Mbps to 10 Gbps) |\n| **Ownership** | Private (owned by the organisation) |\n| **Medium** | Ethernet cables (Cat5e, Cat6) |\n| **Cost** | Relatively low to set up |\n\n### Wireless LAN (WLAN)\n\nA **WLAN** is a LAN that uses wireless (Wi-Fi) instead of cables.\n\n| Feature | Detail |\n|---------|--------|\n| **Coverage** | Typically 30-50 metres per access point |\n| **Speed** | Varies (Wi-Fi 5: up to 3.5 Gbps; Wi-Fi 6: up to 9.6 Gbps) |\n| **Medium** | Radio waves (2.4 GHz and 5 GHz bands) |\n| **Security** | Must use encryption (WPA2 or WPA3) |\n| **Advantage** | No cables, mobility for users |\n| **Disadvantage** | Slower than wired, signal interference, security risks |'),
  t(2, '### Basic Network Components\n\n| Component | Function |\n|-----------|----------|\n| **Router** | Connects different networks (e.g., your LAN to the internet), assigns IP addresses |\n| **Switch** | Connects devices within a LAN, forwards data to the correct device |\n| **Access Point (AP)** | Provides Wi-Fi connectivity, extends wireless range |\n| **Modem** | Converts signals between your network and ISP (fibre, ADSL, LTE) |\n| **NIC (Network Interface Card)** | Hardware in each device that enables network connection (wired or wireless) |\n| **Ethernet cable** | Physical cable (RJ-45 connector) for wired connections |\n| **Firewall** | Hardware or software that filters network traffic for security |\n\n### Network Diagram\n\nA typical South African school network:\n- **ISP** provides fibre connection to the **modem**\n- Modem connects to the **router** (which may include a firewall)\n- Router connects to a **switch** for wired devices (office PCs, servers)\n- Router connects to **access points** for wireless devices (tablets, laptops)\n- A **file server** stores shared documents and learner records'),
  q(3, 'What is the MAIN difference between a switch and a router?',
    ['A switch connects devices within a LAN; a router connects different networks', 'A switch is wireless; a router uses cables', 'A switch is faster than a router', 'A router can only connect two devices'], 0,
    'A switch operates within a single network (LAN), directing data between devices. A router connects separate networks, such as your LAN to the internet.'),
  fb(4, 'A ___ connects devices within a single network. A ___ connects different networks and assigns IP addresses.',
    ['switch', 'router'],
    'Switches work within a LAN to forward data to the correct device. Routers connect networks and manage traffic between them.'),
];

blockNum = 0;
const ch5_lesson2 = [
  t(1, '## Wired vs Wireless Networks\n\n| Feature | Wired | Wireless |\n|---------|-------|----------|\n| **Speed** | Faster and more consistent | Slower, varies with distance and interference |\n| **Security** | Harder to intercept (physical access needed) | Vulnerable to interception if not encrypted |\n| **Mobility** | None (device must stay plugged in) | Full mobility within range |\n| **Installation** | Requires running cables through walls/ceilings | Quick setup, no cables |\n| **Cost** | Higher installation cost (cables, labour) | Lower installation but AP costs |\n| **Reliability** | Very reliable, no signal drops | Can suffer interference from walls, other devices |\n| **Maintenance** | Cable damage requires physical repair | Firmware updates, channel management |\n\n### Intranet\n\nAn **intranet** is a private network within an organisation that uses internet technologies (web pages, email) but is only accessible to authorised members.\n\n**South African school intranet example:**\n- Teachers access shared resources (lesson plans, mark sheets)\n- Learners view homework assignments and class schedules\n- The principal distributes circulars and notices\n- Only people connected to the school network can access it'),
  t(2, '## IoT, Big Data, and Emerging Technologies\n\n### Internet of Things (IoT)\n\n**IoT** refers to everyday objects connected to the internet that can send and receive data.\n\n**Examples in South Africa:**\n\n| Device | IoT Function |\n|--------|-------------|\n| Smart electricity meter | Reports usage to Eskom/municipality in real time |\n| Fitness tracker | Sends health data to your phone app |\n| Smart home system | Controls lights, security cameras, and door locks remotely |\n| GPS tracker on delivery vehicle | Fleet management for Takealot or Aramex |\n| Smart irrigation system | Waters crops based on soil moisture sensors |\n\n### Big Data\n\n**Big data** refers to extremely large datasets that are too complex for traditional software to process.\n\n**The 3 Vs of Big Data:**\n- **Volume** - Enormous amounts of data\n- **Velocity** - Data arrives at high speed\n- **Variety** - Data comes in many formats (text, images, video, sensor readings)\n\n**South African example:** Discovery Vitality collects big data from fitness trackers, medical claims, and driving behaviour to calculate insurance premiums.'),
  q(3, 'A smart electricity meter that automatically reports usage to the municipality is an example of:',
    ['IoT (Internet of Things)', 'Big Data', 'Cloud computing', 'Virtual reality'], 0,
    'An IoT device is an everyday object connected to the internet that collects and transmits data. A smart meter communicates usage data automatically.'),
  t(4, '### Cryptocurrency and Blockchain\n\n**Cryptocurrency** is digital money that uses encryption for secure transactions. It is not controlled by any bank or government.\n\n| Term | Description |\n|------|-------------|\n| **Bitcoin** | The first and most well-known cryptocurrency |\n| **Blockchain** | A digital ledger (record) shared across many computers; each block contains transactions and links to the previous block |\n| **Mining** | Using powerful computers to verify transactions and earn cryptocurrency |\n| **Wallet** | A digital application that stores your cryptocurrency |\n| **Decentralised** | No single authority controls it; shared across a network |\n\n**Key features of blockchain:**\n- Transparent: all transactions are publicly visible\n- Immutable: once recorded, a transaction cannot be changed\n- Secure: uses advanced cryptography\n- Decentralised: no single point of failure\n\n**South African context:** The South African Reserve Bank (SARB) has warned that cryptocurrency is not legal tender in SA. However, platforms like Luno (a Cape Town startup) allow South Africans to buy and sell Bitcoin.'),
  q(5, 'What is the fundamental technology behind Bitcoin?',
    ['Blockchain', 'Cloud computing', 'Virtual reality', 'Artificial intelligence'], 0,
    'Blockchain is the underlying technology of Bitcoin and other cryptocurrencies. It is a decentralised digital ledger that records all transactions securely.'),
  t(6, '### Privacy Issues and BYOD\n\n**Privacy concerns in the digital age:**\n\n| Issue | Description |\n|-------|-------------|\n| **Data collection** | Websites and apps collect personal data (location, browsing habits, contacts) |\n| **Cookies** | Small files stored by websites to track your online activity |\n| **Targeted advertising** | Companies use your data to show personalised ads |\n| **Data breaches** | Hackers steal personal information from databases |\n| **Location tracking** | GPS and cell towers track where you go |\n\n**POPIA (Protection of Personal Information Act):** South African law that protects personal information. Organisations must get consent before collecting data, keep it secure, and allow you to request its deletion.\n\n### BYOD (Bring Your Own Device)\n\n**BYOD** allows employees or learners to use their personal devices (laptops, tablets, phones) for work or school.\n\n| Advantage | Disadvantage |\n|-----------|-------------|\n| Saves organisation money on devices | Security risk (personal devices may lack antivirus) |\n| Users prefer their own devices | Difficult to manage many different devices |\n| Always available (users have device with them) | Distraction (games, social media) |\n| Learners develop real-world tech skills | Not all learners can afford a device (inequality) |'),
  fb(7, 'The South African law that protects personal information is called ___. ___ allows learners to use their own devices at school.',
    ['POPIA', 'BYOD'],
    'POPIA (Protection of Personal Information Act) governs how personal data is collected and used. BYOD (Bring Your Own Device) is a policy allowing personal devices in organisations.'),
  q(8, 'Which is a disadvantage of BYOD in a South African school context?',
    ['Not all learners can afford a device, creating inequality', 'It makes the internet faster', 'It reduces the number of computers needed', 'Learners learn better on their own devices'], 0,
    'In South Africa, economic inequality means not all learners can afford their own devices. BYOD policies can widen the digital divide between wealthier and poorer learners.'),
];

// =============================================================================
// CHAPTER 6: Social Implications (Term 2)
// =============================================================================
blockNum = 0;
const ch6_lesson1 = [
  t(1, '## Unauthorised Access\n\n**Unauthorised access** means gaining access to a computer system, network, or data without permission.\n\n### Types of Unauthorised Access\n\n| Type | Description |\n|------|-------------|\n| **Hacking** | Breaking into a system by exploiting weaknesses |\n| **Password cracking** | Using software to guess or decode passwords |\n| **Social engineering** | Manipulating people into revealing confidential information |\n| **Shoulder surfing** | Looking over someone shoulder to see their password or PIN |\n| **Piggybacking** | Following an authorised person through a secure door |\n| **Phishing** | Sending fake emails to trick people into revealing personal data |\n\n### Prevention Methods\n\n| Method | Description |\n|--------|-------------|\n| **Strong passwords** | At least 8 characters, mix of uppercase, lowercase, numbers, symbols |\n| **Two-factor authentication (2FA)** | Password plus a second verification (SMS code, fingerprint) |\n| **Biometric access** | Fingerprint, face recognition, iris scan |\n| **Encryption** | Scrambles data so it is unreadable without the key |\n| **Access control levels** | Different users have different permissions (admin, teacher, learner) |\n| **Firewalls** | Block unauthorised network access |'),
  q(2, 'A hacker sends an email pretending to be from FNB, asking a user to click a link and enter their banking details. This is an example of:',
    ['Phishing', 'Hacking', 'Shoulder surfing', 'Piggybacking'], 0,
    'Phishing uses fraudulent emails or messages that impersonate trusted organisations to trick people into revealing sensitive information.'),
  fb(3, 'Using software to guess passwords is called password ___. Looking at someone screen to see their PIN is called ___ surfing.',
    ['cracking', 'shoulder'],
    'Password cracking uses automated tools to determine passwords. Shoulder surfing involves physically observing someone entering confidential information.'),
];

blockNum = 0;
const ch6_lesson2 = [
  t(1, '## Network Safety and Security\n\n### Malware Types\n\n| Malware | How It Works |\n|---------|-------------|\n| **Virus** | Attaches to files and spreads when the file is opened or shared |\n| **Worm** | Spreads automatically across networks without needing a host file |\n| **Trojan** | Disguises itself as legitimate software to trick you into installing it |\n| **Spyware** | Secretly monitors your activity and collects personal information |\n| **Adware** | Displays unwanted advertisements, often bundled with free software |\n| **Ransomware** | Encrypts your files and demands payment to unlock them |\n| **Keylogger** | Records every keystroke to capture passwords and sensitive data |\n| **Rootkit** | Hides deep in the system to give attackers persistent access |\n\n### Protection Strategies\n\n| Strategy | Implementation |\n|----------|----------------|\n| **Antivirus software** | Install and keep updated (e.g., Windows Defender, Kaspersky, AVG) |\n| **Firewall** | Enable Windows Firewall or use a hardware firewall on the router |\n| **Software updates** | Install OS and application updates promptly (patches security holes) |\n| **Email caution** | Do not open attachments from unknown senders |\n| **Safe browsing** | Look for HTTPS and the padlock icon; avoid suspicious websites |\n| **Backup regularly** | Keep copies of important files on a separate drive or cloud |'),
  q(2, 'Which type of malware can spread across a network WITHOUT a user opening or running a file?',
    ['Worm', 'Virus', 'Trojan', 'Adware'], 0,
    'A worm is self-replicating malware that spreads automatically across networks without needing a host file or user action. Viruses require a host file to be executed.'),
  t(3, '## Social Media\n\n### Benefits and Risks\n\n| Benefits | Risks |\n|----------|-------|\n| Stay connected with friends and family | Cyberbullying and harassment |\n| Share achievements and creativity | Privacy invasion (oversharing personal details) |\n| Access news and information quickly | Fake news and misinformation |\n| Networking for jobs and education | Identity theft from shared personal data |\n| Support communities and causes | Addiction and screen time issues |\n| Marketing opportunities for small businesses | Reputation damage from inappropriate posts |\n\n### Digital Footprint\n\nYour **digital footprint** is the trail of data you leave online.\n\n**Active footprint:** Information you deliberately post (status updates, photos, comments)\n**Passive footprint:** Information collected without your direct action (cookies, IP address logs, location data)\n\n**Why it matters in South Africa:**\n- Employers and university admissions may check your social media\n- The POPIA Act gives you the right to know what data organisations hold about you\n- Personal information shared online can be used for identity theft'),
  fb(4, 'A(n) ___ footprint is data you deliberately share online. A(n) ___ footprint is data collected without your direct knowledge.',
    ['active', 'passive'],
    'Active footprint = deliberate sharing. Passive footprint = background data collection by websites and apps.'),
  q(5, 'Why should you be careful about what you post on social media?',
    ['Future employers and universities may review your online presence', 'Social media companies will pay you for your posts', 'Posts are automatically deleted after 24 hours', 'Only your friends can ever see your posts'], 0,
    'Social media posts can be permanent and publicly visible. Employers and universities increasingly review online profiles during their selection processes.'),
];

blockNum = 0;
const ch6_lesson3 = [
  t(1, '## Cyber Wellness\n\n**Cyber wellness** refers to the positive well-being of internet users, including healthy and responsible online behaviour.\n\n### Cyberbullying\n\n**Cyberbullying** is the use of digital devices to deliberately harass, threaten, embarrass, or target another person.\n\n**Forms:**\n- Sending threatening or insulting messages\n- Spreading rumours or lies online\n- Sharing embarrassing photos or videos without consent\n- Deliberately excluding someone from online groups\n- Creating fake profiles to impersonate or mock someone\n- Repeatedly posting hurtful comments on social media\n\n### What To Do If Cyberbullied\n\n1. **Do not respond** or retaliate (this often makes it worse)\n2. **Save evidence** (take screenshots of messages, posts, and profiles)\n3. **Block the bully** on all platforms\n4. **Report** to the social media platform\n5. **Tell a trusted adult** (parent, teacher, school counsellor)\n6. **Report to authorities** if threats are serious (SAPS, school management)\n\n### South African Law\n\nThe **Cybercrimes Act (Act 19 of 2020)** makes the following criminal offences:\n- Cyberbullying\n- Unlawful access to data\n- Cyber fraud\n- Malicious communications\n- Theft of data'),
  t(2, '### Online Safety Tips\n\n| Category | Tips |\n|----------|------|\n| **Passwords** | Use unique, strong passwords for each account; enable 2FA |\n| **Personal info** | Never share your ID number, home address, or banking details online |\n| **Photos** | Think before posting; once online, images are difficult to remove |\n| **Location** | Disable location sharing on social media; do not check in at home |\n| **Strangers** | Do not accept friend requests from people you do not know |\n| **Downloads** | Only download from official app stores and trusted websites |\n| **Public Wi-Fi** | Avoid banking or shopping on open Wi-Fi; use a VPN if necessary |\n| **Verification** | Verify unusual requests (e.g., if a friend asks for money via message, call them) |\n\n### Screen Time and Digital Wellness\n\n**Negative effects of excessive screen time:**\n- Eye strain and headaches\n- Poor sleep quality (blue light disrupts melatonin)\n- Reduced physical activity\n- Social isolation (replacing face-to-face interaction)\n- Anxiety and depression from social media comparison\n\n**Managing screen time:**\n- Use built-in screen time trackers (iOS Screen Time, Android Digital Wellbeing)\n- Set daily limits for social media apps\n- Follow the 20-20-20 rule for eye health\n- Establish device-free times (meals, bedtime)'),
  q(3, 'Under South African law, which Act specifically criminalises cyberbullying?',
    ['The Cybercrimes Act', 'The POPIA Act', 'The Consumer Protection Act', 'The National Education Policy Act'], 0,
    'The Cybercrimes Act (Act 19 of 2020) specifically criminalises cyberbullying, along with other cybercrimes like data theft and cyber fraud.'),
  fb(4, 'The ___ rule helps reduce eye strain by looking away from the screen regularly. The ___ Act protects personal information in South Africa.',
    ['20-20-20', 'POPIA'],
    'The 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. POPIA (Protection of Personal Information Act) regulates data privacy.'),
];

// =============================================================================
// CHAPTER 7: Information Management (Term 2)
// =============================================================================
blockNum = 0;
const ch7_lesson1 = [
  t(1, '## The Information Management Process\n\nInformation management is the systematic process of finding, organising, and using information effectively.\n\n### Step 1: Task Definition\n\nBefore searching for information, clearly define what you need:\n\n| Question | Purpose |\n|----------|---------|\n| **What do I need to find out?** | Define the topic clearly |\n| **What information is needed?** | Identify specific facts, figures, or viewpoints |\n| **How will I present the information?** | Report, presentation, poster, or database |\n| **How much detail is needed?** | Brief overview or in-depth analysis |\n| **What is the deadline?** | Plan your time |\n\n### Step 2: Information Seeking Strategies\n\nIdentify the best sources for your information:\n\n| Source Type | Examples | Best For |\n|-------------|---------|----------|\n| **Books / Textbooks** | School library, public library | Reliable, detailed background information |\n| **Websites** | .gov.za, .edu, Wikipedia, news sites | Current information, statistics |\n| **Databases** | School records, online academic databases | Structured, organised data |\n| **Interviews / Surveys** | Speaking to experts, questionnaires | Primary data, personal insights |\n| **Media** | Newspapers, TV, radio, podcasts | Current events, different perspectives |'),
  t(2, '### Step 3: Data Gathering\n\n**How to search effectively online:**\n\n| Technique | Example |\n|-----------|--------|\n| **Use specific keywords** | "Grade 11 CAT syllabus" not "computers" |\n| **Use quotation marks** | "information processing cycle" finds the exact phrase |\n| **Use minus sign** | CAT -animal (excludes results about cats) |\n| **Use site: operator** | site:gov.za education policy (searches only .gov.za) |\n| **Use filetype: operator** | filetype:pdf Grade 11 CAT notes (finds PDF files) |\n| **Check multiple sources** | Do not rely on just one website |\n\n### Step 4: Quality Control\n\n**Evaluating information quality using the CRAAP Test:**\n\n| Criterion | Question to Ask |\n|-----------|----------------|\n| **Currency** | When was it published or last updated? Is it still relevant? |\n| **Relevance** | Does it relate to your topic? Is it at the right level? |\n| **Authority** | Who wrote it? Are they qualified? Is the publisher reputable? |\n| **Accuracy** | Is the information supported by evidence? Are there references? |\n| **Purpose** | Why was it written? To inform, sell, entertain, or persuade? |'),
  q(3, 'A learner finds an article on a website with no author name, no date, and several spelling errors. Using the CRAAP test, this source is likely:',
    ['Unreliable and should not be used', 'The best source available', 'Suitable for academic work', 'A primary source'], 0,
    'The CRAAP test evaluates Currency, Relevance, Authority, Accuracy, and Purpose. Missing author and date (poor authority and currency) combined with errors (poor accuracy) indicate an unreliable source.'),
  fb(4, 'The ___ test evaluates information quality based on Currency, Relevance, Authority, Accuracy, and Purpose. Using ___ marks in a search finds an exact phrase.',
    ['CRAAP', 'quotation'],
    'CRAAP is a framework for evaluating information sources. Quotation marks around search terms tell the search engine to find that exact phrase.'),
  t(5, '### Step 5: Evaluating Websites\n\n**Not all websites are equally trustworthy.** Use these indicators:\n\n| Indicator | Trustworthy | Suspicious |\n|-----------|-------------|------------|\n| **Domain** | .gov.za, .edu, .ac.za, .org | Random or unusual domains |\n| **Author** | Named, with credentials | Anonymous or no author listed |\n| **Date** | Recently updated | No date or very old |\n| **Design** | Professional, well-organised | Cluttered, many pop-up ads |\n| **References** | Links to credible sources | No sources cited |\n| **Contact** | Physical address, phone number | Only a contact form or nothing |\n| **Bias** | Presents multiple viewpoints | One-sided, emotionally charged |\n\n### Plagiarism and Copyright\n\n**Plagiarism** is presenting someone else work as your own. It is a serious academic offence.\n\n**How to avoid plagiarism:**\n- Always reference your sources (author, title, date, URL)\n- Use quotation marks for direct quotes\n- Paraphrase in your own words and still cite the source\n- Use a referencing style (Harvard, APA) consistently\n- Keep a bibliography of all sources used'),
  q(6, 'Which website domain is MOST likely to contain reliable, official information about South African education policy?',
    ['.gov.za', '.com', '.net', '.co.za'], 0,
    '.gov.za is the official domain for South African government websites. Government sites are authoritative sources for policy information.'),
];

// =============================================================================
// CHAPTER 8: Database (Term 2-3)
// =============================================================================
blockNum = 0;
const ch8_lesson1 = [
  t(1, '## Relational Database Concepts\n\nA **relational database** organises data into related tables that are linked together.\n\n### Key Terminology\n\n| Term | Definition | Example |\n|------|------------|--------|\n| **Table** | A collection of related data organised in rows and columns | A "Learners" table |\n| **Record (row)** | A single entry in a table | One learner details |\n| **Field (column)** | A category of data | Surname, Grade, DateOfBirth |\n| **Primary key** | A unique identifier for each record | LearnerID (e.g., L001) |\n| **Foreign key** | A field that links to the primary key of another table | ClassID in the Learners table |\n| **Relationship** | A link between two tables via primary and foreign keys | Learners linked to Classes |\n\n### Why Relational Databases?\n\n**Advantages over flat files (single table / spreadsheet):**\n- Reduces data redundancy (data is not repeated)\n- Ensures data integrity (one change updates everywhere)\n- Allows complex queries across multiple tables\n- Supports multiple users simultaneously\n- Enforces data validation rules'),
  t(2, '### Types of Relationships\n\n| Type | Description | Example |\n|------|-------------|--------|\n| **One-to-One** | One record in Table A relates to exactly one record in Table B | One learner has one ID photo |\n| **One-to-Many** | One record in Table A relates to many records in Table B | One class has many learners |\n| **Many-to-Many** | Many records in A relate to many records in B (uses a junction table) | Learners take many subjects; subjects have many learners |\n\n### Data Types\n\n| Data Type | Stores | Example |\n|-----------|--------|--------|\n| **Text / Short Text** | Letters, numbers, symbols (not for calculations) | Name, address, phone number |\n| **Number** | Numeric values for calculations | Quantity, age |\n| **Currency** | Monetary values with currency symbol | R150.00, R2 500.50 |\n| **Date/Time** | Dates and/or times | 15/03/2025, 14:30 |\n| **Yes/No (Boolean)** | True/False values | Paid (Yes/No) |\n| **AutoNumber** | Automatically generated unique number | ID field |\n| **Memo / Long Text** | Large amounts of text | Comments, descriptions |\n| **Attachment** | Files (images, documents) | Profile photo |\n| **Hyperlink** | URLs or email addresses | www.school.co.za |'),
  q(3, 'A school database has a Classes table and a Learners table. Each class has many learners, but each learner belongs to only one class. What type of relationship is this?',
    ['One-to-Many', 'One-to-One', 'Many-to-Many', 'No relationship'], 0,
    'One class has many learners (one-to-many). The ClassID in the Learners table is a foreign key linking to the primary key in the Classes table.'),
  fb(4, 'A ___ key uniquely identifies each record in a table. A ___ key creates a link to the primary key of another table.',
    ['primary', 'foreign'],
    'The primary key is unique for each record. A foreign key references the primary key of a related table to create a relationship.'),
];

blockNum = 0;
const ch8_lesson2 = [
  t(1, '## Forms\n\nA **form** provides a user-friendly interface for viewing, entering, and editing records in a table.\n\n### Why Use Forms Instead of Tables?\n\n| Advantage | Explanation |\n|-----------|-------------|\n| **User-friendly** | Non-technical users find forms easier than raw table view |\n| **One record at a time** | Less overwhelming than seeing hundreds of rows |\n| **Validation** | Can restrict input to prevent errors |\n| **Controls** | Combo boxes, buttons, and checkboxes guide the user |\n| **Navigation** | Built-in buttons to move between records |\n| **Design** | Can include logos, colours, and organised layouts |\n\n### Form Controls\n\n| Control | Purpose | When to Use |\n|---------|---------|-------------|\n| **Text box** | Display or enter text/number data | Names, numbers, dates |\n| **Combo box** | Dropdown list of predefined options | Province, gender, class |\n| **List box** | Displays multiple visible options | Subject selection |\n| **Check box** | Yes/No selection | Paid fees, consent given |\n| **Command button** | Triggers an action | Save, Print, Close, Navigate |\n| **Label** | Static text (not editable by user) | Field descriptions, instructions |'),
  t(2, '### Creating a Form\n\n**Using the Form Wizard (Access / Base):**\n1. Select the table or query the form is based on\n2. Choose which fields to include\n3. Select a layout (columnar, tabular, justified)\n4. Apply a style/theme\n5. Name and open the form\n\n**Design View modifications:**\n- Move and resize controls\n- Add logos and images to the header\n- Change colours and fonts\n- Set tab order (the order fields are visited when pressing Tab)\n- Add validation rules to individual controls\n- Create calculated controls (e.g., display age from date of birth)\n\n**South African school example:**\nA registration form for new learners:\n- Text boxes: First Name, Surname, ID Number\n- Combo box: Grade (8, 9, 10, 11, 12)\n- Combo box: Home Language (English, Afrikaans, isiZulu, isiXhosa, etc.)\n- Check boxes: Transport Required, After-care Required\n- Command button: Save Record'),
  q(3, 'Which form control is BEST suited for selecting a learner grade (8, 9, 10, 11, or 12)?',
    ['Combo box', 'Text box', 'Check box', 'Label'], 0,
    'A combo box presents a dropdown list of predefined options. Since there are a fixed set of grade options, a combo box ensures the user selects a valid grade.'),
  fb(4, 'A ___ box displays a dropdown list of options. A ___ button triggers an action such as saving or printing.',
    ['combo', 'command'],
    'Combo boxes provide predefined selections. Command buttons execute actions when clicked.'),
];

blockNum = 0;
const ch8_lesson3 = [
  t(1, '## Queries\n\nA **query** extracts specific data from one or more tables based on criteria you define.\n\n### Simple Queries with Conditions\n\n**Creating a query in Design View:**\n1. Add the table(s) you need\n2. Select the fields to display\n3. Set criteria (conditions) for filtering\n4. Set sort order if needed\n5. Run the query\n\n### Using IF Expressions in Queries\n\nYou can create calculated fields using the IIF function:\n\n`=IIF(condition, value_if_true, value_if_false)`\n\n| Query Expression | Result |\n|-----------------|--------|\n| Result: IIF([Mark]>=50, "Pass", "Fail") | Displays "Pass" or "Fail" |\n| Category: IIF([Age]>=18, "Adult", "Minor") | Categorises by age |\n| Fee: IIF([Transport]="Yes", 500, 0) | Calculates transport fee |\n\n### Comparison Operators\n\n| Operator | Meaning | Example Criteria |\n|----------|---------|------------------|\n| = | Equal to | ="Gauteng" |\n| <> | Not equal to | <>"Absent" |\n| > | Greater than | >100 |\n| < | Less than | <50 |\n| >= | Greater than or equal to | >=18 |\n| <= | Less than or equal to | <=1000 |\n| BETWEEN...AND | Range of values | BETWEEN 50 AND 100 |\n| LIKE | Pattern match | LIKE "Jo*" |\n| IN | List of values | IN("GP","WC","KZN") |\n| IS NULL | Empty field | IS NULL |\n| IS NOT NULL | Not empty | IS NOT NULL |'),
  q(2, 'In a query, what does the criteria IS NULL find?',
    ['Records where the field is empty (has no value)', 'Records where the field contains the word NULL', 'Records where the field equals zero', 'Records where the field contains a number'], 0,
    'IS NULL finds records where a field is blank (empty). It does not mean zero or the text "NULL" - it means no value has been entered.'),
  t(3, '### Logical Operators: AND vs OR\n\n| Operator | Effect | Placement in Query Grid |\n|----------|--------|------------------------|\n| **AND** | Both conditions must be true | Criteria on the **same row** |\n| **OR** | At least one condition must be true | Criteria on **different rows** |\n\n**Example: AND**\nFind learners in Grade 11 AND in Gauteng:\n- Grade criteria: "11" (same row)\n- Province criteria: "Gauteng" (same row)\n\n**Example: OR**\nFind learners in Gauteng OR Western Cape:\n- Province criteria row 1: "Gauteng"\n- Province criteria row 2: "Western Cape"\n\n### Wildcard Characters\n\n| Wildcard | Matches | Example |\n|----------|---------|--------|\n| * (asterisk) | Any number of characters | Like "Van*" matches Van der Merwe, Vanderberg |\n| ? (question mark) | Any single character | Like "b?t" matches bat, bet, bit, but |\n| # (hash) | Any single digit | Like "0#1" matches 001, 011, 021 |'),
  fb(4, 'In a query, AND conditions go on the ___ row. OR conditions go on ___ rows.',
    ['same', 'different'],
    'When criteria are on the same row, both must be true (AND logic). When on different rows, either can be true (OR logic).'),
  q(5, 'A query needs to find all learners whose surnames start with "Nko". Which criteria should be used?',
    ['Like "Nko*"', 'Like "?Nko"', '= "Nko"', 'Like "#Nko"'], 0,
    'The asterisk (*) wildcard matches any number of characters. Like "Nko*" finds Nkosi, Nkomo, Nkoana, etc.'),
];

blockNum = 0;
const ch8_lesson4 = [
  t(1, '## Reports\n\nA **report** presents data from a table or query in a formatted, printable layout.\n\n### Report Sections\n\n| Section | Appears | Purpose |\n|---------|---------|--------|\n| **Report Header** | Once at the very top | Title, logo, date |\n| **Page Header** | Top of every page | Column headings |\n| **Group Header** | Before each group | Group label (e.g., province name) |\n| **Detail** | Once per record | Individual data rows |\n| **Group Footer** | After each group | Subtotals, counts for the group |\n| **Page Footer** | Bottom of every page | Page numbers |\n| **Report Footer** | Once at the very end | Grand totals |\n\n### Grouping and Sorting\n\nGrouping organises records by a common field value.\n\n**Example:** A learner report grouped by Class:\n- **Group Header:** Class 11A\n  - Detail: Sipho Dlamini, 78%\n  - Detail: Naledi Mthembu, 85%\n  - **Group Footer:** Average: 81.5%\n- **Group Header:** Class 11B\n  - Detail: Johan van Wyk, 62%\n  - Detail: Amina Patel, 91%\n  - **Group Footer:** Average: 76.5%\n- **Report Footer:** Overall Average: 79%'),
  t(2, '### Calculations in Reports\n\nYou can add calculations to group footers and report footers:\n\n| Expression | What It Does | Where to Place |\n|-----------|-------------|----------------|\n| =Sum([Amount]) | Adds all values | Group footer (subtotal) or Report footer (grand total) |\n| =Count(*) | Counts records | Group footer or Report footer |\n| =Avg([Mark]) | Calculates average | Group footer or Report footer |\n| =Max([Mark]) | Finds highest value | Group footer or Report footer |\n| =Min([Mark]) | Finds lowest value | Group footer or Report footer |\n| =Now() | Shows current date and time | Report header or footer |\n\n### Report Design Tips\n\n- Use consistent fonts and colours\n- Align numbers to the right, text to the left\n- Add gridlines or alternating row colours for readability\n- Include a title, date, and page numbers\n- Set appropriate column widths so data is not cut off\n- Preview before printing to check layout'),
  q(3, 'In a grouped report, where should you place =Sum([Amount]) to show the subtotal for each province?',
    ['Group footer', 'Report header', 'Detail section', 'Page header'], 0,
    'The group footer appears after all records in a group. Placing =Sum([Amount]) here calculates the subtotal for each group (e.g., each province).'),
  fb(4, 'The ___ section appears once per record and shows individual data. The ___ footer shows grand totals at the end of the entire report.',
    ['detail', 'report'],
    'The detail section repeats for every record. The report footer appears once at the very end and typically contains grand totals.'),
  t(5, '## Database Design\n\n### Designing a Database\n\nGood database design follows these steps:\n\n1. **Identify the purpose** - What will the database track?\n2. **Identify the tables** - What main entities need their own tables?\n3. **Identify the fields** - What data does each table need?\n4. **Choose data types** - What type of data will each field store?\n5. **Set primary keys** - Choose or create a unique identifier for each table\n6. **Define relationships** - Link tables using foreign keys\n7. **Apply validation** - Set rules to ensure data integrity\n8. **Create forms** - Design user-friendly input interfaces\n9. **Build queries** - Create queries for common data retrieval needs\n10. **Design reports** - Format output for printing or display\n\n### South African School Database Example\n\n**Tables:**\n- **Learners** (LearnerID, FirstName, Surname, DOB, Gender, ClassID, ParentID)\n- **Classes** (ClassID, ClassName, TeacherID, Grade)\n- **Parents** (ParentID, Title, FirstName, Surname, Phone, Email)\n- **Subjects** (SubjectID, SubjectName, Department)\n\n**Relationships:**\n- Classes to Learners: One-to-Many (one class has many learners)\n- Parents to Learners: One-to-Many (one parent may have multiple children at the school)'),
  q(6, 'In the school database design above, the ClassID field in the Learners table is a:',
    ['Foreign key', 'Primary key', 'Data type', 'Calculated field'], 0,
    'ClassID in the Learners table is a foreign key because it references the primary key (ClassID) of the Classes table, creating a relationship between the two tables.'),
];

// =============================================================================
// CHAPTER 9: HTML and Web Design (Term 2-3)
// =============================================================================
blockNum = 0;
const ch9_lesson1 = [
  t(1, '## Basic HTML Tags\n\nHTML (HyperText Markup Language) is the standard language for creating web pages. Every web page you visit is built with HTML.\n\n### HTML Document Structure\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello, South Africa!</h1>\n  <p>This is my first web page.</p>\n</body>\n</html>\n```\n\n### Essential Tags\n\n| Tag | Purpose | Example |\n|-----|---------|---------|\n| `<html>` | Root element of the page | Wraps entire document |\n| `<head>` | Contains metadata | Title, CSS links |\n| `<title>` | Page title (shown in browser tab) | `<title>My Page</title>` |\n| `<body>` | Visible content | All displayed content goes here |\n| `<h1>` to `<h6>` | Headings (h1 = largest) | `<h1>Main Heading</h1>` |\n| `<p>` | Paragraph | `<p>Some text here.</p>` |\n| `<br>` | Line break (no closing tag) | Forces new line |\n| `<hr>` | Horizontal line (no closing tag) | Divides sections |\n| `<b>` or `<strong>` | Bold text | `<b>Bold</b>` |\n| `<i>` or `<em>` | Italic text | `<i>Italic</i>` |\n| `<u>` | Underlined text | `<u>Underline</u>` |'),
  t(2, '### Lists and Images\n\n**Unordered list (bullets):**\n```html\n<ul>\n  <li>Maths</li>\n  <li>English</li>\n  <li>CAT</li>\n</ul>\n```\n\n**Ordered list (numbers):**\n```html\n<ol>\n  <li>Open the program</li>\n  <li>Create a new file</li>\n  <li>Save your work</li>\n</ol>\n```\n\n**Images:**\n```html\n<img src="logo.jpg" alt="School Logo" width="200">\n```\n\n| Attribute | Purpose |\n|-----------|--------|\n| src | Path to the image file |\n| alt | Alternative text (accessibility; shown if image fails to load) |\n| width / height | Size in pixels or percentage |\n\n**Note:** The `<img>` tag is self-closing (no `</img>` needed). The alt attribute is important for visually impaired users who rely on screen readers.'),
  q(3, 'In HTML, which tag creates a numbered list?',
    ['<ol>', '<ul>', '<li>', '<nl>'], 0,
    '<ol> (ordered list) creates a numbered list. <ul> (unordered list) creates a bulleted list. <li> is the list item tag used inside both.'),
  fb(4, 'The ___ tag creates a paragraph in HTML. The ___ attribute in an image tag provides text for screen readers.',
    ['<p>', 'alt'],
    'The <p> tag defines a paragraph. The alt attribute provides alternative text that describes the image for accessibility.'),
];

blockNum = 0;
const ch9_lesson2 = [
  t(1, '## Page Structure and Formatting\n\n### HTML Tables\n\nTables organise data in rows and columns on a web page.\n\n```html\n<table border="1">\n  <tr>\n    <th>Name</th>\n    <th>Grade</th>\n    <th>Mark</th>\n  </tr>\n  <tr>\n    <td>Sipho</td>\n    <td>11</td>\n    <td>78</td>\n  </tr>\n  <tr>\n    <td>Naledi</td>\n    <td>11</td>\n    <td>85</td>\n  </tr>\n</table>\n```\n\n| Tag | Purpose |\n|-----|---------|\n| `<table>` | Creates the table |\n| `<tr>` | Table row |\n| `<th>` | Table header cell (bold, centred by default) |\n| `<td>` | Table data cell |\n| border="1" | Adds visible borders |\n\n### Common Table Attributes\n\n| Attribute | Effect |\n|-----------|--------|\n| border | Border thickness in pixels |\n| cellpadding | Space between cell content and border |\n| cellspacing | Space between cells |\n| bgcolor | Background colour |\n| width | Table width (pixels or percentage) |\n| colspan | Merge cells across columns |\n| rowspan | Merge cells across rows |'),
  t(2, '### Links in HTML\n\nLinks connect web pages together and are the foundation of the World Wide Web.\n\n**Types of links:**\n\n```html\n<!-- Link to another website -->\n<a href="https://www.education.gov.za">SA Education</a>\n\n<!-- Link to another page on your site -->\n<a href="about.html">About Us</a>\n\n<!-- Link to email -->\n<a href="mailto:info@school.co.za">Email Us</a>\n\n<!-- Link that opens in a new tab -->\n<a href="https://www.google.com" target="_blank">Google</a>\n\n<!-- Link to a specific part of the page (anchor) -->\n<a href="#section2">Jump to Section 2</a>\n...\n<h2 id="section2">Section 2</h2>\n```\n\n| Attribute | Purpose |\n|-----------|--------|\n| href | The destination URL or file |\n| target="_blank" | Opens link in a new browser tab |\n| id | Marks a spot on the page for anchor links |'),
  q(3, 'Which HTML code creates a link that opens in a new browser tab?',
    ['<a href="page.html" target="_blank">Link</a>', '<a href="page.html" new>Link</a>', '<a href="page.html" tab="new">Link</a>', '<a src="page.html">Link</a>'], 0,
    'The target="_blank" attribute tells the browser to open the link in a new tab. Without it, the link opens in the current tab.'),
  fb(4, 'The ___ tag creates a hyperlink in HTML. The ___ attribute specifies where the link goes.',
    ['<a>', 'href'],
    'The anchor tag <a> creates links. The href (hypertext reference) attribute contains the destination URL.'),
];

blockNum = 0;
const ch9_lesson3 = [
  t(1, '## Good Website Design Principles\n\n### Key Design Principles\n\n| Principle | Description |\n|-----------|-------------|\n| **Navigation** | Users must be able to find any page easily. Use a clear menu bar, consistent layout |\n| **Consistency** | Same fonts, colours, and layout on every page |\n| **Readability** | Use appropriate font sizes, sufficient contrast between text and background |\n| **Accessibility** | Alt text on images, logical heading structure, keyboard navigation |\n| **Loading speed** | Optimise images (compress, resize), minimise large files |\n| **Mobile-friendly** | Design should work on phones and tablets, not just desktops |\n| **Content** | Clear, concise, relevant information. Break up long text with headings |\n| **White space** | Avoid cluttered pages; give elements room to breathe |\n\n### Bad Design Practices to Avoid\n\n- Too many different fonts (use 2-3 maximum)\n- Clashing colours that make text hard to read\n- Auto-playing music or video\n- Excessive animations or flashing text\n- Broken links (pages that lead to 404 errors)\n- No navigation menu or confusing navigation\n- Text that is too small to read\n- Images without alt text (accessibility issue)'),
  t(2, '### Colour in Web Design\n\n**Colour plays a crucial role** in user experience and accessibility.\n\n### HTML Colour Formats\n\n| Format | Example | Description |\n|--------|---------|-------------|\n| **Colour name** | color="red" | Limited set of named colours |\n| **Hex code** | color="#FF0000" | Six-digit hexadecimal (2 digits each for Red, Green, Blue) |\n| **RGB** | rgb(255, 0, 0) | Red, Green, Blue values from 0-255 |\n\n**Common hex codes:**\n\n| Colour | Hex Code |\n|--------|----------|\n| Black | #000000 |\n| White | #FFFFFF |\n| Red | #FF0000 |\n| Green | #00FF00 |\n| Blue | #0000FF |\n| Yellow | #FFFF00 |\n| South African flag green | #007A4D |\n\n### Colour Design Guidelines\n\n- Ensure sufficient contrast between text and background (dark text on light background)\n- Use colour consistently (same colour for all links, same colour for headings)\n- Do not rely on colour alone to convey information (consider colour-blind users)\n- Use a limited palette (3-5 main colours)\n- Test your design on different screens (colours appear differently)'),
  q(3, 'The hex colour code #0000FF represents:',
    ['Blue', 'Red', 'Green', 'White'], 0,
    'In hex colour codes, the format is #RRGGBB. #0000FF means 00 Red, 00 Green, FF (255) Blue - which is pure blue.'),
  fb(4, 'A hex colour code uses ___ digits to represent Red, Green, and Blue values. Good web design limits the number of ___ to 2-3 for consistency.',
    ['six', 'fonts'],
    'Hex codes are 6 hexadecimal digits (2 per colour channel). Using too many fonts creates a cluttered, unprofessional appearance.'),
];

// =============================================================================
// CHAPTER 10: Systems Technologies - Internet and Communications (Term 3)
// =============================================================================
blockNum = 0;
const ch10_lesson1 = [
  t(1, '## Role of Application Software\n\nApplication software helps users perform specific tasks. Understanding the different types helps you choose the right tool.\n\n### Categories of Application Software\n\n| Category | Examples | Purpose |\n|----------|---------|--------|\n| **Productivity** | MS Office, LibreOffice, Google Workspace | Documents, spreadsheets, presentations |\n| **Communication** | Outlook, Gmail, WhatsApp, Teams | Email, messaging, video calls |\n| **Creative** | Photoshop, Canva, Audacity | Graphics, video, audio editing |\n| **Educational** | Khan Academy, Google Classroom | Learning and teaching |\n| **Financial** | Sage, QuickBooks, Excel | Accounting, budgeting |\n| **Database** | MS Access, LibreOffice Base | Data management |\n| **Web browser** | Chrome, Firefox, Edge | Accessing websites |\n| **Security** | Norton, Kaspersky, Windows Defender | Antivirus and firewall |\n\n### Application Software Enhancing Productivity\n\n**Automation features:**\n- **Templates** reduce setup time for common documents\n- **Macros** automate repetitive tasks (e.g., formatting 100 worksheets)\n- **Mail merge** generates personalised letters automatically\n- **Formulas and functions** calculate instantly in spreadsheets\n- **Spell check and grammar check** improve document quality'),
  t(2, '## Online vs Installed Applications\n\n| Feature | Online (Web-based) | Installed (Desktop) |\n|---------|-------------------|--------------------|\n| **Installation** | None (runs in browser) | Must be installed |\n| **Internet** | Required | Not required |\n| **Updates** | Automatic (server-side) | Manual or scheduled |\n| **Storage** | Cloud | Local hard drive |\n| **Collaboration** | Real-time (multiple users) | Requires file sharing |\n| **Performance** | Depends on internet speed | Depends on hardware |\n| **Cost** | Often free or subscription | Purchase or subscription |\n| **Examples** | Google Docs, Canva, Outlook.com | MS Word, Photoshop, VLC |\n\n### Compatibility and File Formats\n\n**Compatibility issues arise when:**\n- Different versions of the same software (Word 2010 vs Word 2021)\n- Different software for the same task (Word vs Google Docs)\n- Different operating systems (Windows vs macOS vs Linux)\n\n**Solutions:**\n- Save in universal formats (PDF, CSV, RTF)\n- Use cross-platform software (LibreOffice, Google Workspace)\n- Check file format compatibility before sharing\n- Save in older formats when sending to users with older software'),
  q(3, 'A group of learners needs to collaborate on a presentation in real time. Which option is BEST?',
    ['Google Slides (online)', 'Microsoft PowerPoint installed on one computer', 'Printing the slides and passing them around', 'Using a desktop publishing program'], 0,
    'Google Slides is an online application that allows multiple users to edit the same presentation simultaneously, making it ideal for real-time collaboration.'),
  fb(4, 'Online applications run in a ___ and require an internet connection. Installed applications run directly on the computer ___.',
    ['browser', 'hardware'],
    'Web-based apps run in a web browser. Installed apps run on the local hardware and typically work offline.'),
];

blockNum = 0;
const ch10_lesson2 = [
  t(1, '## Updating and Portable Applications\n\n### Why Software Updates Matter\n\n| Reason | Explanation |\n|--------|-------------|\n| **Security patches** | Fix vulnerabilities that hackers could exploit |\n| **Bug fixes** | Correct errors and crashes in the software |\n| **New features** | Add functionality and improve user experience |\n| **Compatibility** | Ensure software works with new hardware and other updated programs |\n| **Performance** | Optimise speed and resource usage |\n\n**Updating in South Africa:**\n- Updates can consume large amounts of data (use Wi-Fi, not mobile data)\n- Schedule updates during off-peak hours\n- Enable automatic updates for security software\n- Schools should have an IT policy for managing updates\n\n### Portable Applications\n\n**Portable apps** run from a USB flash drive without installing on the computer.\n\n**Advantages:**\n- No installation required\n- Carry your programs and settings on a flash drive\n- Leave no traces on the host computer\n- Useful when you cannot install software (e.g., school or library computers)\n\n**Examples:** Portable Firefox, Portable LibreOffice, Portable VLC Player'),
  t(2, '### Web Applications\n\n**Web applications (web apps)** run in a browser and require an internet connection.\n\n| Web App | Purpose |\n|---------|--------|\n| **Google Docs** | Word processing |\n| **Google Sheets** | Spreadsheets |\n| **Canva** | Graphic design |\n| **Outlook.com** | Email |\n| **Trello** | Project management |\n| **Scratch** | Programming for beginners |\n\n## e-Learning and m-Learning\n\n**e-Learning** (electronic learning): Using electronic devices and the internet for education.\n- Online courses (e.g., Coursera, Khan Academy)\n- Learning Management Systems (e.g., Google Classroom, Moodle)\n- Educational videos (YouTube, TED-Ed)\n\n**m-Learning** (mobile learning): Learning using mobile devices (smartphones, tablets).\n- Educational apps on phones and tablets\n- Learning via WhatsApp groups (common in SA schools)\n- Accessing study materials on the go\n\n**Benefits for South African education:**\n- Reaches learners in remote areas\n- More affordable than traditional textbooks\n- Allows learning at your own pace\n- Teachers can share resources instantly via WhatsApp or Google Classroom'),
  q(3, 'What is the MAIN advantage of portable applications?',
    ['They run from a USB drive without installation', 'They are always faster than installed software', 'They have more features', 'They update automatically'], 0,
    'Portable apps do not require installation on the host computer. They run directly from a USB flash drive, making them ideal for use on shared or restricted computers.'),
  fb(4, 'e-Learning uses ___ devices for education. m-Learning specifically refers to learning using ___ devices.',
    ['electronic', 'mobile'],
    'e-Learning is the broader term for any electronic learning. m-Learning is the subset that specifically involves mobile devices like smartphones and tablets.'),
  t(5, '## Introduction to Artificial Intelligence\n\n**Artificial Intelligence (AI)** refers to computer systems that can perform tasks that normally require human intelligence.\n\n### Types of AI Applications\n\n| Application | How It Works | Example |\n|-------------|-------------|--------|\n| **Virtual assistants** | Process natural language to answer questions | Siri, Google Assistant, Alexa |\n| **Chatbots** | Simulate conversation to help customers | Banking chatbots (FNB, Capitec) |\n| **Recommendation systems** | Analyse your behaviour to suggest content | Netflix suggesting shows, Spotify playlists |\n| **Image recognition** | Identify objects, faces, or text in images | Unlocking phone with face recognition |\n| **Self-driving vehicles** | Use sensors and AI to navigate | Testing in various countries worldwide |\n| **Language translation** | Translate between languages in real time | Google Translate |\n| **Smart search** | Understand your search intent, not just keywords | Google search predictions |\n\n### AI in South Africa\n\n- Banks use AI for fraud detection\n- Insurance companies use AI to assess claims\n- Farms use AI-powered drones for crop monitoring\n- Healthcare uses AI for diagnostic assistance\n- Education platforms use AI to personalise learning paths\n\n**Ethical concerns:**\n- AI may replace certain jobs\n- Bias in AI systems (trained on biased data)\n- Privacy concerns (AI analyses personal data)\n- Accountability (who is responsible when AI makes a mistake?)'),
  q(6, 'Which is an example of AI in everyday use?',
    ['Netflix recommending shows based on what you have watched', 'Using a calculator to add numbers', 'Saving a file to a USB drive', 'Printing a document'], 0,
    'Netflix uses AI algorithms to analyse your viewing history and preferences to recommend content you might enjoy. This is a recommendation system powered by AI.'),
];

// =============================================================================
// CHAPTER 11: Solution Development Integration (Term 3-4)
// =============================================================================
blockNum = 0;
const ch11_lesson1 = [
  t(1, '## Integrated Document Solutions\n\nIn the real world, projects require using multiple applications together. Grade 11 CAT teaches you to integrate word processing, spreadsheets, databases, and presentations.\n\n### Word Processing Integration\n\n| Integration | Method |\n|-------------|--------|\n| **Excel chart in Word** | Copy chart in Excel > Paste Special in Word (linked or embedded) |\n| **Excel table in Word** | Copy cells in Excel > Paste in Word as a table |\n| **Database data in Word** | Mail merge using Access/Base as data source |\n| **Image in Word** | Insert > Pictures or copy/paste from any source |\n\n### Linked vs Embedded Objects\n\n| Feature | Linked | Embedded |\n|---------|--------|----------|\n| **Connection** | Maintains a live link to the source file | Independent copy inside the document |\n| **Updates** | Changes in source automatically update | Must be updated manually |\n| **File size** | Smaller (stores only link reference) | Larger (stores full copy of object) |\n| **Moving files** | Link breaks if source file is moved | No issues (data is inside document) |\n\n**When to link:** When the source data changes frequently and you want the document to stay current.\n**When to embed:** When you need the document to be self-contained and portable.'),
  t(2, '### Spreadsheet Integration\n\n**Importing data into spreadsheets:**\n\n| Source | Method |\n|--------|--------|\n| **CSV file** | File > Open > Select CSV > Text Import Wizard (choose delimiter) |\n| **Text file** | Data > Get External Data > From Text |\n| **Database query** | Data > Get External Data > From Database |\n| **Web data** | Data > Get External Data > From Web |\n\n**Exporting from spreadsheets:**\n\n| Destination | Method |\n|-------------|--------|\n| **PDF** | File > Save As > PDF |\n| **CSV** | File > Save As > CSV (comma-separated) |\n| **Web page** | File > Save As > Web Page (.html) |\n| **Word document** | Copy cells > Paste in Word |\n\n### Using Charts Across Applications\n\nCharts created in Excel can be used in:\n- **Word documents** (reports with visual data)\n- **PowerPoint presentations** (slides with data visualisation)\n- **Web pages** (saved as images then inserted in HTML)\n\n**Best practice:** Create the chart in Excel where the data lives, then link or embed it in other documents.'),
  q(3, 'A teacher creates a chart in Excel showing class performance. They want the chart in a Word report to update automatically when marks change. Should they link or embed?',
    ['Link', 'Embed', 'Copy as picture', 'Retype the data in Word'], 0,
    'A linked object maintains a live connection to the source. When the Excel data changes, the chart in Word updates automatically. An embedded chart would need manual updating.'),
  fb(4, 'A ___ object maintains a live connection to the source file. An ___ object is an independent copy stored inside the document.',
    ['linked', 'embedded'],
    'Linked objects update automatically when the source changes. Embedded objects are self-contained copies that must be updated manually.'),
];

blockNum = 0;
const ch11_lesson2 = [
  t(1, '## Database and Presentation Integration\n\n### Database Integration\n\nDatabases often work with other applications:\n\n| Integration | Description |\n|-------------|-------------|\n| **Export to Excel** | Export query results to a spreadsheet for further analysis |\n| **Export to Word** | Export reports to Word for additional formatting |\n| **Mail merge** | Use database tables as data sources for personalised letters |\n| **Import from Excel** | Import spreadsheet data into a database table |\n| **Forms from queries** | Create forms based on specific queries, not just tables |\n\n### Presentation Integration\n\n**PowerPoint / Impress presentations can include:**\n\n| Element | Source | Method |\n|---------|--------|--------|\n| **Charts** | Excel | Copy > Paste Special (linked or embedded) |\n| **Tables** | Excel or Word | Copy > Paste |\n| **Images** | Any source | Insert > Picture |\n| **Videos** | Local file or YouTube | Insert > Video |\n| **Links** | Web or other files | Insert > Hyperlink |\n| **Audio** | Local file | Insert > Audio |\n\n### Effective Presentation Design\n\n| Do | Do Not |\n|----|--------|\n| Use bullet points (short phrases) | Write full paragraphs on slides |\n| Use high-quality images | Use blurry or stretched images |\n| Maintain consistent font and colour scheme | Use many different fonts and colours |\n| Use animations sparingly for emphasis | Overuse animations (distracting) |\n| Ensure text is readable from the back of the room | Use font smaller than 24pt for body text |\n| Include a clear title slide and conclusion | Jump straight into content |'),
  q(2, 'Which font size is generally recommended as the MINIMUM for body text in a presentation?',
    ['24pt', '8pt', '12pt', '48pt'], 0,
    '24pt is the generally accepted minimum for body text in presentations to ensure readability from a distance. 8pt and 12pt are too small for projected content.'),
  t(3, '## Practical Assessment Task (PAT)\n\nThe PAT is a major integrated project that counts towards your final CAT mark. It requires you to apply skills from all application areas.\n\n### PAT Structure\n\n| Phase | Tasks |\n|-------|-------|\n| **Phase 1: Research** | Define the problem, gather information, plan the solution |\n| **Phase 2: Data collection** | Create surveys/questionnaires, collect data |\n| **Phase 3: Processing** | Enter data in spreadsheet, create database, analyse data |\n| **Phase 4: Presentation** | Create a report (Word), presentation (PowerPoint), and supporting spreadsheets/database |\n\n### PAT Tips for Success\n\n- **Follow the marking rubric** exactly - do not add unnecessary work\n- **Name files correctly** as specified in the instructions\n- **Save frequently** (use Ctrl+S as a habit)\n- **Keep backups** on a flash drive AND in the cloud\n- **Check all formulas** and queries before submitting\n- **Proofread** all documents for spelling and grammar\n- **Format consistently** across all documents\n- **Include references** for any online information used\n- **Meet deadlines** for each phase (late submissions lose marks)\n- **Ask for help early** if you are stuck, not the day before the deadline'),
  fb(4, 'The PAT is divided into ___ major phases. The final presentation typically includes a Word report, spreadsheets, and a ___.',
    ['four', 'PowerPoint presentation'],
    'The PAT has four phases: Research, Data Collection, Processing, and Presentation. The final deliverable includes documents from multiple applications working together.'),
  q(5, 'During the PAT, you collect survey data from 50 learners. Which application is BEST for analysing the numerical data?',
    ['Spreadsheet (Excel / Calc)', 'Word processor', 'Database', 'Presentation software'], 0,
    'Spreadsheets are ideal for numerical analysis because they offer functions (SUM, AVERAGE, COUNTIF), charts, and statistical tools that make analysing survey data efficient.'),
];

// =============================================================================
// CHAPTER 12: Revision (Term 4)
// =============================================================================
blockNum = 0;
const ch12_lesson1 = [
  t(1, '## Grade 11 CAT Exam Preparation\n\n### Exam Structure\n\nThe Grade 11 CAT exam typically consists of two papers:\n\n| Paper | Type | Duration | Content |\n|-------|------|----------|--------|\n| **Paper 1** | Theory (written) | 3 hours | Systems Technologies, Networks, Social Implications, Information Management |\n| **Paper 2** | Practical (computer-based) | 3 hours | Word Processing, Spreadsheets, Database, HTML |\n\n### Paper 1 Study Guide\n\n| Topic | Key Areas to Revise |\n|-------|--------------------|\n| **Systems Technologies** | Information processing cycle, hardware, storage (SSD vs HDD), system unit, ports, boot process, OS functions, virtualisation |\n| **Network Technologies** | LAN/WLAN, components, wired vs wireless, IoT, big data, cryptocurrency, BYOD |\n| **Social Implications** | Unauthorised access, malware types, security measures, social media, digital footprint, cyberbullying, POPIA, Cybercrimes Act |\n| **Information Management** | Research process, CRAAP test, evaluating websites, plagiarism |\n| **Internet and Communications** | Online vs installed apps, compatibility, e-learning, m-learning, AI |'),
  t(2, '### Paper 2 Practical Tips\n\n| Application | Key Skills to Practice |\n|-------------|----------------------|\n| **Word Processing** | Formatting (styles, themes, templates), mail merge, electronic forms, import/export, headers/footers, page layout |\n| **Spreadsheets** | Absolute referencing, SUMIF, COUNTIF, SMALL, LARGE, RAND, conditional formatting, charts, error handling |\n| **Database** | Creating tables with correct data types, forms, queries (criteria, IIF, wildcards, AND/OR), reports with grouping |\n| **HTML** | Tags, tables, links, images, page structure, colour codes |\n\n### Exam Strategies\n\n**For Paper 1 (Theory):**\n- Read each question carefully - underline key words\n- Answer in full sentences where required\n- Use technical terminology correctly\n- Manage your time (do not spend too long on one question)\n- If unsure, eliminate obviously wrong answers first\n\n**For Paper 2 (Practical):**\n- Read ALL instructions before starting\n- Save your work every few minutes (Ctrl+S)\n- Name files exactly as instructed\n- Check formulas by verifying results manually\n- Do not skip questions - attempt everything for partial marks\n- Use Print Preview to check layouts before finalising'),
  q(3, 'Which keyboard shortcut should you use regularly during the practical exam to prevent data loss?',
    ['Ctrl+S', 'Ctrl+Z', 'Ctrl+P', 'Ctrl+A'], 0,
    'Ctrl+S saves the current file. During a practical exam, saving frequently prevents data loss from crashes, power failures, or accidental changes.'),
  t(4, '### Common Mistakes to Avoid\n\n| Area | Common Mistake | Correct Approach |\n|------|---------------|------------------|\n| **Spreadsheets** | Forgetting $ for absolute references | Press F4 to toggle reference types |\n| **Spreadsheets** | Writing criteria without quotes in SUMIF/COUNTIF | Text criteria need quotes: "Pass" |\n| **Database** | Wrong data type for a field | Phone numbers = Text (not Number), Currency for money |\n| **Database** | Forgetting to set primary key | Every table needs a unique primary key |\n| **Queries** | AND vs OR placement in criteria grid | AND = same row, OR = different rows |\n| **HTML** | Missing closing tags | Every opening tag (except br, hr, img) needs a closing tag |\n| **HTML** | Using src instead of href in links | Links use href; images use src |\n| **Word Processing** | Not using styles for headings | Use Heading 1, 2, 3 styles for proper structure |\n| **General** | Not reading instructions carefully | Underline key action words in each question |\n| **General** | Not saving with correct file name | Name files exactly as specified |'),
  fb(5, 'In spreadsheets, text criteria in SUMIF/COUNTIF must be enclosed in ___. In HTML, the ___ attribute is used for link destinations while src is used for images.',
    ['quotes', 'href'],
    'Functions like SUMIF and COUNTIF require text criteria to be in quotation marks. In HTML, href (hypertext reference) specifies where a link goes, while src specifies the source of an image.'),
  t(6, '### Revision Checklist\n\nUse this checklist to ensure you have covered all topics:\n\n**Systems Technologies:**\n- [ ] Information processing cycle (input, processing, output, storage, communication)\n- [ ] Types of computing devices (desktop, laptop, tablet, smartphone, embedded)\n- [ ] Input and output devices\n- [ ] Primary storage (RAM, ROM, Cache) vs Secondary storage (HDD, SSD, optical, cloud)\n- [ ] System unit components and ports\n- [ ] Health risks and ergonomics\n- [ ] Boot process (POST, BIOS/UEFI, OS loading)\n- [ ] Operating system functions\n- [ ] Virtualisation and cloud computing\n- [ ] Software types (online vs installed, portable, web apps)\n- [ ] e-Learning, m-Learning, and AI\n\n**Practical Applications:**\n- [ ] Word processing (formatting, forms, mail merge, import/export)\n- [ ] Spreadsheets (functions, absolute referencing, conditional formatting)\n- [ ] Database (tables, forms, queries, reports, design)\n- [ ] HTML (tags, tables, links, images, design principles)\n\n**Social and Network Topics:**\n- [ ] LAN/WLAN, network components, wired vs wireless\n- [ ] IoT, big data, cryptocurrency, blockchain, BYOD\n- [ ] Security (malware types, prevention, passwords, encryption)\n- [ ] Social media, digital footprint, cyberbullying\n- [ ] POPIA and Cybercrimes Act\n- [ ] Information management and the CRAAP test'),
  q(7, 'Which data type should be used for a phone number field in a database?',
    ['Text', 'Number', 'Currency', 'AutoNumber'], 0,
    'Phone numbers should be stored as Text because they may contain leading zeros (e.g., 0821234567), spaces, or dashes that would be lost in a Number field. You also do not perform calculations on phone numbers.'),
  q(8, 'In a spreadsheet, what does the formula =COUNTIF(B2:B50, ">75") calculate?',
    ['The number of values in B2:B50 that are greater than 75', 'The sum of values greater than 75', 'The average of values greater than 75', 'The largest value in the range'], 0,
    'COUNTIF counts cells that meet a condition. Here it counts how many cells in B2:B50 contain values greater than 75.'),
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
      title: 'Chapter 1: Systems Technologies \u2014 General and Hardware',
      description: 'Information processing cycle, types of computing devices, input/output devices, storage (primary/secondary, SSD), system unit, ports, health risks and ergonomics, CAT career opportunities.',
      order: 1,
      lessons: [
        { title: 'The Information Processing Cycle', description: 'The four stages of information processing (input, processing, output, storage) and communication as a fifth element.', blocks: ch1_lesson1, term: 1 },
        { title: 'Computing Devices, Input, and Output', description: 'Types of computing devices, embedded computers, convergence, input devices, output devices, and printer types.', blocks: ch1_lesson2, term: 1 },
        { title: 'Storage, System Unit, Health Risks, and Careers', description: 'Primary and secondary storage, SSD vs HDD, system unit components, ports, ergonomics, health risks, and CAT career paths.', blocks: ch1_lesson3, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Systems Technologies \u2014 Software',
      description: 'Computer management, file management, system requirements, compatibility, the start-up process, OS functions, and basic virtualisation concepts.',
      order: 2,
      lessons: [
        { title: 'Computer and File Management', description: 'File management best practices, compression, common file formats, and organising digital files effectively.', blocks: ch2_lesson1, term: 1 },
        { title: 'System Requirements and Compatibility', description: 'Minimum vs recommended system requirements, hardware and software compatibility, checking system specs.', blocks: ch2_lesson2, term: 1 },
        { title: 'Boot Process, OS Functions, and Virtualisation', description: 'The start-up process, BIOS vs UEFI, operating system functions, virtual machines, hypervisors, and cloud computing.', blocks: ch2_lesson3, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Word Processing',
      description: 'File management, input data formats, paragraph and page layout, themes, templates, electronic forms with legacy controls, and import/export.',
      order: 3,
      lessons: [
        { title: 'File Management and Input Data Formats', description: 'Saving in different formats, file properties, importing and exporting, clipboard operations, and data input types.', blocks: ch3_lesson1, term: 1 },
        { title: 'Paragraphs, Page Layout, Themes, and Templates', description: 'Paragraph formatting, indentation, page layout settings, headers and footers, themes, and templates.', blocks: ch3_lesson2, term: 1 },
        { title: 'Electronic Forms, Legacy Controls, and Import/Export', description: 'Creating electronic forms with text fields, checkboxes, and dropdowns, protecting forms, and Paste Special options.', blocks: ch3_lesson3, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: Spreadsheets',
      description: 'Reinforcing Grade 10 skills, absolute cell referencing, auto fill, SUMIF, COUNTIF, RAND, SMALL, LARGE, conditional formatting, and error indicators.',
      order: 4,
      lessons: [
        { title: 'Reviewing Grade 10 Fundamentals', description: 'Cell references, formulas, basic functions (SUM, AVERAGE, MAX, MIN, COUNT, COUNTA, IF), data types, and chart basics.', blocks: ch4_lesson1, term: 1 },
        { title: 'Absolute Cell Referencing and Auto Fill', description: 'Relative, absolute, and mixed references, the dollar sign, F4 shortcut, VAT calculation example, and auto fill patterns.', blocks: ch4_lesson2, term: 1 },
        { title: 'SUMIF, COUNTIF, RAND, SMALL, and LARGE', description: 'Conditional sum and count functions, random number generation, and finding the k-th smallest or largest values.', blocks: ch4_lesson3, term: 2 },
        { title: 'Conditional Formatting and Error Indicators', description: 'Highlight rules, data bars, colour scales, icon sets, custom rules, spreadsheet error codes, and the IFERROR function.', blocks: ch4_lesson4, term: 2 },
      ],
    },
    {
      title: 'Chapter 5: Network Technologies',
      description: 'LAN/WLAN, basic network components, wired vs wireless, intranet, IoT, big data, cryptocurrency/blockchain, privacy issues, and BYOD.',
      order: 5,
      lessons: [
        { title: 'LAN, WLAN, and Network Components', description: 'Local area networks, wireless LANs, routers, switches, access points, modems, NICs, and network diagrams.', blocks: ch5_lesson1, term: 2 },
        { title: 'Wired vs Wireless, IoT, Big Data, Crypto, and BYOD', description: 'Comparing wired and wireless, intranets, Internet of Things, big data, cryptocurrency, blockchain, POPIA, and Bring Your Own Device.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Social Implications',
      description: 'Unauthorised access, network safety and security, malware, social media, digital footprint, cyberbullying, and cyber wellness.',
      order: 6,
      lessons: [
        { title: 'Unauthorised Access and Prevention', description: 'Types of unauthorised access (hacking, phishing, social engineering), strong passwords, 2FA, biometrics, and encryption.', blocks: ch6_lesson1, term: 2 },
        { title: 'Network Security and Social Media', description: 'Malware types, protection strategies, social media benefits and risks, and digital footprint management.', blocks: ch6_lesson2, term: 2 },
        { title: 'Cyber Wellness and Online Safety', description: 'Cyberbullying forms and responses, the Cybercrimes Act, online safety tips, screen time, and digital wellness.', blocks: ch6_lesson3, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Information Management',
      description: 'Task definition, data gathering, search techniques, quality control using the CRAAP test, evaluating websites, and avoiding plagiarism.',
      order: 7,
      lessons: [
        { title: 'Research Process, CRAAP Test, and Website Evaluation', description: 'The five-step information management process, effective search techniques, the CRAAP test for quality control, evaluating websites, and avoiding plagiarism.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Database',
      description: 'Relational database concepts, tables/records/fields, data types, relationships, forms, queries (simple IF, operators, wildcards), reports, and design.',
      order: 8,
      lessons: [
        { title: 'Relational Database Concepts and Data Types', description: 'Tables, records, fields, primary and foreign keys, relationships (one-to-one, one-to-many, many-to-many), and data types.', blocks: ch8_lesson1, term: 2 },
        { title: 'Forms and Form Controls', description: 'Creating forms, text boxes, combo boxes, list boxes, checkboxes, command buttons, Form Wizard, and Design View.', blocks: ch8_lesson2, term: 2 },
        { title: 'Queries: Criteria, IIF, Operators, and Wildcards', description: 'Simple queries, IIF expressions, comparison operators, AND vs OR logic, wildcard characters, and IS NULL.', blocks: ch8_lesson3, term: 3 },
        { title: 'Reports and Database Design', description: 'Report sections, grouping and sorting, calculations in footers, and the ten-step database design process.', blocks: ch8_lesson4, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: HTML and Web Design',
      description: 'Basic HTML tags, page structure, lists, images, tables, links, good website design principles, and colour in web design.',
      order: 9,
      lessons: [
        { title: 'Basic HTML Tags, Lists, and Images', description: 'HTML document structure, essential tags, headings, paragraphs, unordered and ordered lists, and images with alt text.', blocks: ch9_lesson1, term: 2 },
        { title: 'HTML Tables and Links', description: 'Creating tables with rows, headers, and data cells, table attributes, hyperlinks, email links, anchors, and target="_blank".', blocks: ch9_lesson2, term: 3 },
        { title: 'Website Design Principles and Colour', description: 'Navigation, consistency, readability, accessibility, colour formats (names, hex, RGB), and common design mistakes.', blocks: ch9_lesson3, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Systems Technologies \u2014 Internet and Communications',
      description: 'Application software types, online vs installed, compatibility, updating, portable/web applications, e-learning/m-learning, and introduction to AI.',
      order: 10,
      lessons: [
        { title: 'Application Software: Online vs Installed', description: 'Categories of application software, comparing online and installed applications, file format compatibility, and productivity features.', blocks: ch10_lesson1, term: 3 },
        { title: 'Updates, Portable Apps, e-Learning, and AI', description: 'Software updates, portable applications, web apps, e-learning, m-learning, and introduction to artificial intelligence.', blocks: ch10_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: Solution Development Integration',
      description: 'Integrating word processing, spreadsheets, database, and presentations, linked vs embedded objects, and PAT completion.',
      order: 11,
      lessons: [
        { title: 'Integrating Word Processing and Spreadsheets', description: 'Linking and embedding objects, importing and exporting data, using charts across applications, and data exchange between programs.', blocks: ch11_lesson1, term: 3 },
        { title: 'Database, Presentation Integration, and PAT', description: 'Database integration with other applications, effective presentation design, and Practical Assessment Task structure and tips.', blocks: ch11_lesson2, term: 4 },
      ],
    },
    {
      title: 'Chapter 12: Revision',
      description: 'Comprehensive revision covering Paper 1 theory and Paper 2 practical exam structure, strategies, common mistakes, and a full topic checklist.',
      order: 12,
      lessons: [
        { title: 'Exam Structure, Strategies, and Revision Checklist', description: 'Paper 1 and Paper 2 structure, exam strategies for theory and practical, common mistakes to avoid, and a complete revision checklist.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 11 Computer Applications Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Systems Technologies (hardware, software, internet), Word Processing, Spreadsheets, Network Technologies, Social Implications, Information Management, Databases, HTML and Web Design, Solution Development Integration, and Revision for Grade 11 CAT.',
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
  console.log('  TEXTBOOK: Grade 11 Computer Applications Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
