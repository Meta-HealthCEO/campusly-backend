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

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 1: Systems Technologies (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 1.1: Motherboard Components and CPU
blockNum = 0;
const ch1_lesson1 = [
  t(1, "## Motherboard Components\n\nThe **motherboard** is the main circuit board inside a computer that connects all hardware components together.\n\n### Key Motherboard Components\n\n| Component | Function |\n|-----------|----------|\n| **CPU socket** | Holds the processor; connects it to the motherboard |\n| **RAM slots (DIMM)** | Hold the memory modules |\n| **Chipset (Northbridge/Southbridge)** | Controls data flow between the CPU, RAM, and peripherals |\n| **BIOS/UEFI chip** | Stores firmware that starts the computer before the OS loads |\n| **CMOS battery** | Powers the BIOS settings and real-time clock when the PC is off |\n| **Expansion slots (PCIe)** | Allow graphics cards, sound cards, and other add-on cards |\n| **SATA connectors** | Connect storage devices (HDDs, SSDs) |\n| **Power connectors (24-pin, 8-pin)** | Deliver power from the PSU to the motherboard |\n| **I/O ports** | USB, HDMI, Ethernet, audio jacks on the back panel |"),
  t(2, "## The Central Processing Unit (CPU)\n\nThe CPU is the brain of the computer. It processes all instructions.\n\n### How the CPU Works \u2014 The Fetch-Decode-Execute Cycle\n\n1. **Fetch:** The CPU retrieves the next instruction from RAM using the address in the Program Counter (PC).\n2. **Decode:** The Control Unit interprets the instruction to determine what operation is needed.\n3. **Execute:** The ALU (Arithmetic Logic Unit) carries out the operation (calculation or comparison).\n4. **Store:** The result is written back to a register or to RAM.\n\n### CPU Components\n\n| Component | Role |\n|-----------|------|\n| **ALU** | Performs arithmetic (+, -, *, /) and logic (AND, OR, NOT) operations |\n| **Control Unit (CU)** | Directs and coordinates all CPU operations |\n| **Registers** | Tiny, ultra-fast storage locations inside the CPU |\n| **Cache** | Small, fast memory on or near the CPU that stores frequently used data |\n| **Clock** | Generates pulses (measured in GHz) that synchronise operations |"),
  q(3, 'Which CPU component performs arithmetic calculations and logical comparisons?',
    ['ALU', 'Control Unit', 'Cache', 'Register'], 0,
    'The Arithmetic Logic Unit (ALU) performs all arithmetic and logic operations inside the CPU.'),
  t(4, "### CPU Performance Factors\n\n| Factor | Description |\n|--------|------------|\n| **Clock speed (GHz)** | Higher clock speed = more instructions per second |\n| **Number of cores** | Multi-core CPUs can process multiple tasks simultaneously |\n| **Cache size (L1, L2, L3)** | Larger cache = faster access to frequently used data |\n| **Bus speed** | Determines how fast data travels between the CPU and other components |\n| **Word size (32-bit vs 64-bit)** | 64-bit CPUs can handle larger chunks of data per cycle |\n| **Instruction set** | CISC (complex, fewer instructions needed) vs RISC (simple, more instructions but faster per instruction) |\n\n**Multi-core processors:** A dual-core CPU has 2 processing units; a quad-core has 4. More cores allow better multitasking and parallel processing, but software must be designed to use multiple cores (multi-threaded)."),
  fb(5, 'The CPU clock speed is measured in ___. A CPU with 4 processing units is called a ___-core processor.',
    ['GHz', 'quad'],
    'Clock speed is measured in gigahertz (GHz). Four processing cores = quad-core.'),
  q(6, 'Which of the following would NOT directly improve CPU performance?',
    ['Increasing the size of the hard drive', 'Increasing the clock speed', 'Adding more cache memory', 'Upgrading from dual-core to quad-core'], 0,
    'Hard drive size affects storage capacity, not CPU processing speed. Clock speed, cache size, and core count directly affect CPU performance.'),
  t(7, "### CPU Architecture: CISC vs RISC\n\n| Feature | CISC | RISC |\n|---------|------|------|\n| **Full name** | Complex Instruction Set Computer | Reduced Instruction Set Computer |\n| **Instructions** | Many complex instructions | Fewer, simpler instructions |\n| **Execution time** | Variable (some instructions take multiple clock cycles) | Fixed (each instruction takes one clock cycle) |\n| **Examples** | Intel x86, AMD | ARM (mobile devices, Raspberry Pi) |\n| **Power usage** | Higher | Lower (better for mobile devices) |\n| **Use case** | Desktop PCs, laptops | Smartphones, tablets, embedded systems |"),
  q(8, 'Which CPU architecture is commonly used in smartphones due to its low power consumption?',
    ['RISC (ARM)', 'CISC (x86)', 'Both equally', 'Neither'], 0,
    'RISC architecture (specifically ARM) is used in smartphones and tablets because it consumes less power and generates less heat than CISC.'),
];

// Lesson 1.2: Operating Systems, Memory, and Hardware Choices
blockNum = 0;
const ch1_lesson2 = [
  t(1, "## Types of Operating Systems\n\nAn **operating system (OS)** is system software that manages hardware and provides a platform for applications.\n\n### OS Categories\n\n| Type | Description | Examples |\n|------|-------------|----------|\n| **Desktop OS** | For personal computers and laptops | Windows, macOS, Linux |\n| **Mobile OS** | For smartphones and tablets | Android, iOS |\n| **Server OS** | Manages network resources and services | Windows Server, Ubuntu Server |\n| **Embedded OS** | Built into devices (limited, specialised) | Smart TVs, ATMs, routers |\n| **Real-time OS (RTOS)** | Must respond within strict time limits | Medical devices, industrial controllers |\n\n### Open Source vs Proprietary\n\n| Feature | Open Source | Proprietary |\n|---------|-------------|-------------|\n| **Source code** | Freely available | Hidden/closed |\n| **Cost** | Usually free | Paid licence |\n| **Customisation** | Fully customisable | Limited |\n| **Support** | Community-driven | Official vendor support |\n| **Examples** | Linux, Android | Windows, macOS |"),
  q(2, 'Which type of operating system would be most suitable for controlling a heart-rate monitor that must respond instantly?',
    ['Real-time OS (RTOS)', 'Desktop OS', 'Server OS', 'Mobile OS'], 0,
    'A real-time operating system (RTOS) is designed for devices that must respond within strict, predictable time limits, such as medical equipment.'),
  t(3, "## Computer Memory\n\n### RAM (Random Access Memory)\n\nRAM is **volatile** (loses data when power is off) and is used to store data and programs currently in use.\n\n| Type | Description |\n|------|------------|\n| **DRAM (Dynamic RAM)** | Must be constantly refreshed; cheaper; used for main system RAM |\n| **SRAM (Static RAM)** | Does not need refreshing; faster but more expensive; used for cache |\n| **DDR4 / DDR5** | Generations of SDRAM; DDR5 is faster and more energy-efficient than DDR4 |\n\n**How RAM affects performance:** More RAM allows more programs to run simultaneously without slowing down. If RAM is full, the OS uses virtual memory (slower)."),
  t(4, "### Cache Memory\n\nCache is a small amount of very fast memory located on or near the CPU.\n\n| Level | Location | Speed | Size |\n|-------|----------|-------|------|\n| **L1** | Inside each CPU core | Fastest | Smallest (32\u2013128 KB) |\n| **L2** | Inside each CPU core | Fast | Medium (256 KB\u20131 MB) |\n| **L3** | Shared across all cores | Slower than L1/L2 | Largest (4\u201364 MB) |\n\nCache stores frequently accessed data so the CPU does not have to fetch it from the slower RAM every time.\n\n### Virtual Memory\n\nWhen RAM is full, the OS temporarily moves inactive data from RAM to a section of the hard drive called a **swap file** (or page file). This area acts as extra RAM.\n\n**Disadvantages of virtual memory:**\n- Much slower than physical RAM (especially on HDDs)\n- Excessive use causes **thrashing** \u2014 the computer spends more time swapping data than doing actual work\n- Reduces the lifespan of SSDs due to frequent read/write operations"),
  fb(5, 'RAM is ___ memory, meaning it loses its contents when the power is turned off. When RAM is full, the OS uses ___ memory on the hard drive.',
    ['volatile', 'virtual'],
    'RAM is volatile (temporary). Virtual memory uses hard drive space as overflow when RAM is full.'),
  q(6, 'Which level of CPU cache is the fastest but smallest?',
    ['L1', 'L2', 'L3', 'RAM'], 0,
    'L1 cache is located directly inside each CPU core, making it the fastest but also the smallest (typically 32-128 KB).'),
  t(7, "## Choosing Hardware: Key Factors\n\nWhen choosing a computer or components, consider:\n\n| Factor | Explanation |\n|--------|------------|\n| **Size/Form factor** | Desktop (powerful, upgradeable) vs laptop (portable) vs tablet (lightweight) |\n| **Cost** | Balance between budget and performance needs |\n| **Platform** | Windows (widest software support), macOS (creative work), Linux (free, servers) |\n| **Purpose** | Gaming needs a powerful GPU; office work needs less power; servers need reliability |\n| **Expandability** | Can you upgrade RAM, storage, GPU later? Desktops are most expandable |\n| **Compatibility** | Will the hardware work with your existing software and peripherals? |\n\n### Computer Performance Factors (Summary)\n\n- **CPU:** Clock speed, cores, cache size\n- **RAM:** Amount (8 GB minimum for modern use; 16 GB+ recommended)\n- **Storage:** SSD (fast) vs HDD (slow, cheap, high capacity)\n- **GPU:** Dedicated GPU for gaming/design; integrated GPU for basic use\n- **Bus speed:** Data transfer rate between components\n- **OS optimisation:** A well-optimised OS uses fewer resources"),
  q(8, 'A graphic designer needs a new computer. Which component should they prioritise?',
    ['A powerful dedicated GPU (graphics card)', 'The largest hard drive available', 'The most USB ports', 'A real-time operating system'], 0,
    'Graphic design software relies heavily on GPU rendering. A dedicated GPU with sufficient VRAM is the most important component for a designer.'),
  fb(9, 'An SSD is ___ than an HDD but typically costs more per gigabyte. A computer that can have RAM and storage upgraded later has good ___.',
    ['faster', 'expandability'],
    'SSDs have no moving parts and use flash memory, making them significantly faster than mechanical HDDs. Expandability refers to the ability to upgrade components.'),
  q(10, 'What is thrashing in the context of virtual memory?',
    ['The computer spends more time swapping data between RAM and disk than doing useful work', 'A type of virus that destroys the hard drive', 'When the CPU overheats due to excessive processing', 'When too many USB devices are connected'], 0,
    'Thrashing occurs when the system is constantly swapping data between RAM and the swap file, causing severe performance degradation.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Solution Development — Programming Basics (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 2.1: Arrays (1D), Loops, and Nested Loops
blockNum = 0;
const ch2_lesson1 = [
  t(1, "## Arrays (One-Dimensional)\n\nAn **array** is a data structure that stores a fixed number of elements of the same data type under a single variable name.\n\n### Declaring Arrays in Delphi\n\n```pascal\nvar\n  arrNames: array[1..5] of string;\n  arrMarks: array[1..30] of integer;\n  arrPrices: array[0..9] of real;\n```\n\n**Key properties:**\n- Arrays have a fixed size (declared at compile time in Delphi)\n- All elements must be the same data type\n- Elements are accessed using an index: `arrNames[1]`, `arrNames[2]`, etc.\n- In Delphi, the index range is defined by the programmer (e.g. `1..5` or `0..9`)"),
  t(2, "### Working with Arrays\n\n**Populating an array from user input:**\n```pascal\nvar\n  arrScores: array[1..5] of integer;\n  i: integer;\nbegin\n  for i := 1 to 5 do\n  begin\n    arrScores[i] := StrToInt(InputBox('Score', 'Enter score ' + IntToStr(i) + ':', ''));\n  end;\nend;\n```\n\n**Displaying array contents:**\n```pascal\nvar\n  sOutput: string;\n  i: integer;\nbegin\n  sOutput := '';\n  for i := 1 to 5 do\n    sOutput := sOutput + IntToStr(arrScores[i]) + #13;\n  ShowMessage(sOutput);\nend;\n```\n\n**Common array operations:**\n- **Sum:** Loop through and add each element\n- **Average:** Sum divided by the number of elements\n- **Maximum/Minimum:** Track the largest/smallest value while looping\n- **Count:** Count elements that meet a condition"),
  q(3, 'What will happen if you try to access arrNames[6] when the array is declared as array[1..5]?',
    ['A runtime error (index out of bounds)', 'It returns an empty string', 'It automatically extends the array', 'It returns the last element'], 0,
    'Accessing an index outside the declared range causes a runtime error (ERangeError) in Delphi. The array has indices 1 to 5 only.'),
  t(4, "### Loops in Delphi\n\n**For loop** \u2014 used when you know how many times to repeat:\n```pascal\nfor i := 1 to 10 do\n  // executes 10 times\n```\n\n**While loop** \u2014 condition tested BEFORE the loop body:\n```pascal\nwhile iCount < 10 do\nbegin\n  // executes as long as iCount < 10\n  Inc(iCount);\nend;\n```\n\n**Repeat-Until loop** \u2014 condition tested AFTER the loop body (executes at least once):\n```pascal\nrepeat\n  sInput := InputBox('Password', 'Enter password:', '');\nuntil sInput = 'secret123';\n```\n\n| Loop Type | Condition Check | Minimum Executions |\n|-----------|----------------|--------------------|\n| **For** | N/A (counter-based) | Known count |\n| **While** | Before each iteration | 0 (may never execute) |\n| **Repeat-Until** | After each iteration | 1 (always runs at least once) |"),
  fb(5, 'A ___ loop always executes at least once because the condition is checked after the loop body. A ___ loop may never execute if the condition is false initially.',
    ['repeat-until', 'while'],
    'Repeat-until checks the condition at the end (post-test). While checks at the beginning (pre-test).'),
  t(6, "### Nested Loops\n\nA **nested loop** is a loop inside another loop. The inner loop completes all its iterations for each single iteration of the outer loop.\n\n**Example \u2014 Multiplication table:**\n```pascal\nvar\n  i, j: integer;\n  sOutput: string;\nbegin\n  sOutput := '';\n  for i := 1 to 5 do          // outer loop (rows)\n  begin\n    for j := 1 to 5 do        // inner loop (columns)\n      sOutput := sOutput + IntToStr(i * j) + #9;\n    sOutput := sOutput + #13;  // new line after each row\n  end;\n  ShowMessage(sOutput);\nend;\n```\n\n**How many times does the inner code execute?**\nOuter loop runs 5 times. For each outer iteration, the inner loop runs 5 times.\nTotal = 5 x 5 = **25 times**."),
  q(7, 'If the outer loop runs 4 times and the inner loop runs 3 times, how many times does the code inside the inner loop execute?',
    ['12', '7', '4', '3'], 0,
    'In nested loops, the total iterations = outer x inner = 4 x 3 = 12.'),
  t(8, "### Common Array Algorithms Using Loops\n\n**Finding the maximum value:**\n```pascal\nvar\n  arrValues: array[1..10] of integer;\n  i, iMax: integer;\nbegin\n  iMax := arrValues[1];  // assume first is max\n  for i := 2 to 10 do\n    if arrValues[i] > iMax then\n      iMax := arrValues[i];\n  ShowMessage('Maximum: ' + IntToStr(iMax));\nend;\n```\n\n**Counting elements that meet a condition:**\n```pascal\nvar\n  iCount, i: integer;\nbegin\n  iCount := 0;\n  for i := 1 to 10 do\n    if arrValues[i] >= 50 then\n      Inc(iCount);\n  ShowMessage(IntToStr(iCount) + ' values are 50 or above');\nend;\n```"),
  q(9, 'When finding the maximum value in an array, why do we initialise iMax to the first element rather than to 0?',
    ['Because all values could be negative, making 0 an incorrect starting maximum', 'Because Delphi requires it', 'To save memory', 'It makes no difference'], 0,
    'If all array values are negative (e.g. -5, -3, -8), starting iMax at 0 would incorrectly report 0 as the maximum. Initialising to the first element ensures correctness.'),
  fb(10, 'To find the sum of all elements in an array, initialise a total variable to ___ and then ___ each element to it inside a loop.',
    ['0', 'add'],
    'Start the total at 0, then add each array element to the running total as you loop through.'),
];

// Lesson 2.2: Searching and Sorting
blockNum = 0;
const ch2_lesson2 = [
  t(1, "## Searching Algorithms\n\n### Linear Search (Sequential Search)\n\nLinear search checks each element one by one from the beginning until the target is found or the end is reached.\n\n```pascal\nfunction LinearSearch(arr: array of integer;\n  iTarget: integer): integer;\nvar\n  i: integer;\nbegin\n  Result := -1;  // not found\n  for i := Low(arr) to High(arr) do\n    if arr[i] = iTarget then\n    begin\n      Result := i;\n      Exit;  // found, stop searching\n    end;\nend;\n```\n\n**Characteristics:**\n- Works on both sorted and unsorted arrays\n- Checks each element sequentially\n- **Best case:** Target is the first element \u2014 O(1)\n- **Worst case:** Target is last or not present \u2014 O(n)\n- Simple to implement but slow for large datasets"),
  t(2, "### Binary Search\n\nBinary search works only on **sorted** arrays. It repeatedly divides the search range in half.\n\n**Algorithm:**\n1. Set Low = first index, High = last index\n2. Calculate Mid = (Low + High) div 2\n3. If arr[Mid] = target, found!\n4. If target < arr[Mid], search the left half (High = Mid - 1)\n5. If target > arr[Mid], search the right half (Low = Mid + 1)\n6. Repeat until found or Low > High (not found)\n\n```pascal\nfunction BinarySearch(arr: array of integer;\n  iTarget: integer): integer;\nvar\n  iLow, iHigh, iMid: integer;\nbegin\n  Result := -1;\n  iLow := Low(arr);\n  iHigh := High(arr);\n  while iLow <= iHigh do\n  begin\n    iMid := (iLow + iHigh) div 2;\n    if arr[iMid] = iTarget then\n    begin\n      Result := iMid;\n      Exit;\n    end\n    else if iTarget < arr[iMid] then\n      iHigh := iMid - 1\n    else\n      iLow := iMid + 1;\n  end;\nend;\n```"),
  q(3, 'What is the main requirement for using binary search?',
    ['The array must be sorted', 'The array must contain integers only', 'The array must have an even number of elements', 'The array must be small'], 0,
    'Binary search relies on the array being sorted so it can eliminate half the remaining elements at each step. It does not work on unsorted data.'),
  fb(4, 'Linear search has a worst-case time complexity of O(___). Binary search has a worst-case time complexity of O(___).',
    ['n', 'log n'],
    'Linear search checks up to n elements. Binary search halves the search space each time, giving O(log n).'),
  t(5, "### Comparing Linear and Binary Search\n\n| Feature | Linear Search | Binary Search |\n|---------|--------------|---------------|\n| **Requires sorted data?** | No | Yes |\n| **Speed (worst case)** | O(n) | O(log n) |\n| **Simplicity** | Very simple | More complex |\n| **Best for** | Small or unsorted arrays | Large sorted arrays |\n| **Example:** 1000 elements | Up to 1000 comparisons | Up to ~10 comparisons |\n\n**Why is binary search so much faster?**\nWith 1,000,000 elements:\n- Linear search: up to 1,000,000 comparisons\n- Binary search: up to ~20 comparisons (log2 of 1,000,000 is about 20)"),
  t(6, "## Sorting Algorithms\n\n### Bubble Sort\n\nBubble sort repeatedly compares adjacent elements and swaps them if they are in the wrong order. After each pass, the largest unsorted element \"bubbles\" to its correct position.\n\n```pascal\nprocedure BubbleSort(var arr: array of integer);\nvar\n  i, j, iTemp: integer;\nbegin\n  for i := High(arr) downto Low(arr) + 1 do\n    for j := Low(arr) to i - 1 do\n      if arr[j] > arr[j + 1] then\n      begin\n        iTemp := arr[j];\n        arr[j] := arr[j + 1];\n        arr[j + 1] := iTemp;\n      end;\nend;\n```\n\n**Trace example:** Sort [5, 3, 8, 1]\n- Pass 1: [3, 5, 1, **8**] \u2014 8 bubbles to the end\n- Pass 2: [3, 1, **5**, 8] \u2014 5 in place\n- Pass 3: [**1**, **3**, 5, 8] \u2014 sorted!"),
  q(7, 'After the first complete pass of bubble sort on [7, 2, 5, 1, 3], which element is guaranteed to be in its correct position?',
    ['7 (the largest element, now at the end)', '1 (the smallest element)', '3 (the last element)', 'None'], 0,
    'In bubble sort, after each pass, the largest unsorted element bubbles to the end. After pass 1, the largest value (7) is at index 5 in its final position.'),
  t(8, "### Selection Sort\n\nSelection sort finds the smallest element in the unsorted portion and swaps it with the first unsorted position.\n\n```pascal\nprocedure SelectionSort(var arr: array of integer);\nvar\n  i, j, iMinIdx, iTemp: integer;\nbegin\n  for i := Low(arr) to High(arr) - 1 do\n  begin\n    iMinIdx := i;\n    for j := i + 1 to High(arr) do\n      if arr[j] < arr[iMinIdx] then\n        iMinIdx := j;\n    // Swap\n    if iMinIdx <> i then\n    begin\n      iTemp := arr[i];\n      arr[i] := arr[iMinIdx];\n      arr[iMinIdx] := iTemp;\n    end;\n  end;\nend;\n```\n\n**Trace example:** Sort [4, 2, 7, 1]\n- Pass 1: Find min (1 at index 3), swap with index 0 \u2192 [**1**, 2, 7, 4]\n- Pass 2: Find min in remaining (2 at index 1), already in place \u2192 [1, **2**, 7, 4]\n- Pass 3: Find min in remaining (4 at index 3), swap with index 2 \u2192 [1, 2, **4**, **7**]"),
  q(9, 'How does selection sort differ from bubble sort?',
    ['Selection sort finds the minimum and places it, while bubble sort swaps adjacent elements', 'Selection sort is always faster', 'Bubble sort cannot sort in ascending order', 'They are identical algorithms'], 0,
    'Selection sort scans for the minimum element and places it at the front. Bubble sort compares and swaps adjacent pairs, moving the largest to the end.'),
  fb(10, 'Both bubble sort and selection sort have a worst-case time complexity of O(___). Binary search is faster than linear search because it ___ the search space with each comparison.',
    ['n squared', 'halves'],
    'Both bubble sort and selection sort are O(n^2). Binary search divides the remaining elements in half each step.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Networks (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 3.1: Wireless Technologies and Data Transmission
blockNum = 0;
const ch3_lesson1 = [
  t(1, "## Wireless Communication Technologies\n\n### Wi-Fi (Wireless Fidelity)\n\nWi-Fi allows devices to connect to a local area network (LAN) wirelessly.\n\n| Standard | Speed | Frequency | Notes |\n|----------|-------|-----------|-------|\n| **Wi-Fi 4 (802.11n)** | Up to 600 Mbps | 2.4 GHz / 5 GHz | Older standard |\n| **Wi-Fi 5 (802.11ac)** | Up to 3.5 Gbps | 5 GHz | Common in most routers |\n| **Wi-Fi 6 (802.11ax)** | Up to 9.6 Gbps | 2.4 GHz / 5 GHz | Better for many devices |\n\n**Range:** Typically 30\u201350 metres indoors; affected by walls, interference.\n\n### WiMAX (Worldwide Interoperability for Microwave Access)\n\nWiMAX provides wireless broadband over long distances (up to 50 km).\n- Used in areas without wired infrastructure\n- Slower than fibre but covers wide areas\n- Alternative to DSL in rural areas"),
  t(2, "### Mobile Network Technologies: 4G LTE and 5G\n\n| Feature | 4G LTE | 5G |\n|---------|--------|----|\n| **Speed** | 100\u2013300 Mbps | 1\u201310 Gbps |\n| **Latency** | ~30\u201350 ms | ~1\u201310 ms |\n| **Use cases** | Streaming, browsing, apps | IoT, autonomous vehicles, AR/VR, smart cities |\n| **Coverage** | Wide, well-established | Growing, mainly urban areas |\n| **Frequency** | 700 MHz\u20132.5 GHz | Sub-6 GHz and mmWave (24\u201339 GHz) |\n\n**5G advantages:**\n- Massively faster speeds for downloading and streaming\n- Ultra-low latency (critical for real-time applications)\n- Can connect millions of IoT devices simultaneously\n\n**5G challenges:**\n- Shorter range (especially mmWave), needs more cell towers\n- Expensive infrastructure rollout\n- Not yet available everywhere in South Africa"),
  q(3, 'Which wireless technology provides coverage over the longest distance?',
    ['WiMAX (up to 50 km)', 'Wi-Fi 6 (up to 50 m indoors)', '5G mmWave (up to 300 m)', 'Bluetooth (up to 10 m)'], 0,
    'WiMAX can cover distances up to 50 km, making it suitable for rural areas without wired infrastructure. Wi-Fi and 5G mmWave have much shorter ranges.'),
  fb(4, '5G offers much lower ___ (response time) than 4G, which is critical for real-time applications like autonomous driving. WiMAX is designed for ___ area networks.',
    ['latency', 'wide'],
    '5G has latency as low as 1 ms compared to 30-50 ms for 4G. WiMAX covers wide metropolitan areas.'),
  t(5, "## Data Transmission\n\n### Bandwidth and Throughput\n\n- **Bandwidth:** The maximum amount of data that can be transmitted per second (measured in Mbps or Gbps). Think of it as the width of a highway.\n- **Throughput:** The actual amount of data successfully transmitted per second. Always less than or equal to bandwidth due to congestion, errors, and overhead.\n\n### Types of Data Transmission\n\n| Type | Description |\n|------|------------|\n| **Simplex** | One-way only (e.g. TV broadcast, keyboard to PC) |\n| **Half-duplex** | Two-way, but only one direction at a time (e.g. walkie-talkie) |\n| **Full-duplex** | Two-way simultaneously (e.g. telephone call, Ethernet) |\n\n### Serial vs Parallel Transmission\n\n| Type | How it works | Speed | Distance | Example |\n|------|-------------|-------|----------|--------|\n| **Serial** | Bits sent one after another on a single channel | Slower but reliable over distance | Long | USB, Ethernet |\n| **Parallel** | Multiple bits sent simultaneously on multiple channels | Faster over short distance | Short | Old printer cables (now rare) |"),
  q(6, 'A walkie-talkie allows communication in both directions but not at the same time. What type of data transmission is this?',
    ['Half-duplex', 'Full-duplex', 'Simplex', 'Parallel'], 0,
    'Half-duplex allows two-way communication, but only one party can transmit at a time, like a walkie-talkie where you press a button to talk.'),
  t(7, "## VoIP (Voice over Internet Protocol)\n\nVoIP transmits voice calls over the internet instead of traditional phone lines.\n\n**How it works:**\n1. Your voice is captured by a microphone\n2. The analogue sound is converted to digital data\n3. Data is compressed and broken into packets\n4. Packets travel over the internet to the recipient\n5. Packets are reassembled and converted back to sound\n\n**Advantages:**\n- Much cheaper than traditional phone calls (especially international)\n- Video calling, conferencing, screen sharing\n- Integrates with other internet services\n- Works from any internet-connected device\n\n**Disadvantages:**\n- Requires a reliable internet connection\n- Call quality depends on bandwidth and latency\n- Does not work during power outages (unless backup power)\n- Emergency services may not be able to locate you\n\n**Examples:** Skype, WhatsApp calls, Zoom, Microsoft Teams, Google Meet"),
  q(8, 'Which is a disadvantage of VoIP compared to traditional landline calls?',
    ['VoIP calls fail during power or internet outages', 'VoIP is always more expensive', 'VoIP cannot make international calls', 'VoIP cannot transmit video'], 0,
    'VoIP requires electricity and an internet connection to work. During power outages or internet failures, VoIP calls are not possible, whereas traditional landlines often still work.'),
];

// Lesson 3.2: Internet, Intranet, Extranet, VPN, and Location-Based Computing
blockNum = 0;
const ch3_lesson2 = [
  t(1, "## Internet vs Intranet vs Extranet\n\n| Network | Access | Scope | Example |\n|---------|--------|-------|---------|\n| **Internet** | Public; anyone can access | Global | Google, YouTube, Wikipedia |\n| **Intranet** | Private; only organisation members | Internal to one organisation | Company HR portal, school admin system |\n| **Extranet** | Extended private; selected external users | Organisation + partners/clients | Supplier order system, parent school portal |\n\n### Key Differences\n\n- **Internet:** The worldwide public network connecting billions of devices.\n- **Intranet:** A private network within an organisation. Uses the same technology as the internet (web browsers, HTTP) but is not accessible from outside. Used for internal communication, policies, shared files.\n- **Extranet:** An extension of the intranet that allows specific external users (suppliers, clients, parents) controlled access to certain resources.\n\n**Security:** Intranets and extranets use firewalls, authentication, and access control to prevent unauthorised access."),
  q(2, 'A school allows parents to log in to a private portal to view their children s reports and attendance. This is an example of:',
    ['An extranet', 'The internet', 'An intranet', 'A VPN'], 0,
    'An extranet extends a private network to selected external users (in this case, parents). The school staff use the intranet internally; parents access a controlled portion via the extranet.'),
  t(3, "## VPN (Virtual Private Network)\n\nA VPN creates a secure, encrypted tunnel over a public network (the internet), allowing users to access a private network remotely.\n\n### How a VPN Works\n\n1. Your device connects to a VPN server\n2. All data is encrypted before leaving your device\n3. The encrypted data travels through the internet\n4. The VPN server decrypts it and forwards it to the destination\n5. Responses follow the same encrypted path back\n\n### VPN Uses\n\n| Use | Description |\n|-----|------------|\n| **Remote work** | Employees access the company intranet securely from home |\n| **Privacy** | Hides your IP address and browsing activity from ISPs and hackers |\n| **Bypass geo-restrictions** | Access content blocked in your region |\n| **Public Wi-Fi protection** | Encrypts data on insecure networks (coffee shops, airports) |\n\n### VPN Advantages & Disadvantages\n\n**Advantages:** Secure communication, privacy, remote access, cost-effective vs dedicated leased lines\n\n**Disadvantages:** Slower speeds (due to encryption overhead), VPN server can be a single point of failure, may be blocked by some services"),
  fb(4, 'A VPN creates an encrypted ___ over the internet to securely connect to a private network. The technology hides your ___ address from third parties.',
    ['tunnel', 'IP'],
    'A VPN uses encryption to create a secure tunnel. It masks your real IP address by routing traffic through the VPN server.'),
  t(5, "## Location-Based Computing\n\nLocation-based computing uses a device s geographical position to provide relevant services and information.\n\n### Technologies Used\n\n| Technology | How it works |\n|-----------|-------------|\n| **GPS (Global Positioning System)** | Uses satellites to determine location (accurate to a few metres) |\n| **Cell tower triangulation** | Estimates location based on signals from nearby cell towers |\n| **Wi-Fi positioning** | Uses known Wi-Fi access point locations to estimate position |\n| **Bluetooth beacons** | Short-range transmitters in specific locations (e.g. in shops) |\n\n### Applications\n\n- **Navigation:** Google Maps, Waze\n- **Geotagging:** Adding location data to photos and social media posts\n- **Location-based services:** Finding nearby restaurants, shops, petrol stations\n- **Tracking:** Fleet management, delivery tracking, find-my-phone\n- **Augmented reality:** Pokemon Go, AR navigation overlays\n- **Marketing:** Sending offers when customers are near a store (geofencing)"),
  q(6, 'Which location technology works by measuring signals from multiple cell towers to estimate a device s position?',
    ['Cell tower triangulation', 'GPS', 'Bluetooth beacons', 'Wi-Fi positioning'], 0,
    'Cell tower triangulation estimates location by measuring signal strength and timing from multiple nearby cell towers. It is less accurate than GPS but works indoors.'),
  t(7, "### Privacy Concerns with Location-Based Computing\n\n**Risks:**\n- Companies can track your movements and build location profiles\n- Location data can reveal sensitive information (medical visits, political meetings)\n- Geotagged photos may reveal your home address or daily routine\n- Stalking or harassment using location-sharing apps\n- Data breaches could expose historical location data\n\n**Protection measures:**\n- Turn off location services when not needed\n- Disable geotagging on your camera/social media\n- Review which apps have permission to access your location\n- Use a VPN to mask your approximate location online\n- Be cautious about sharing your location on social media\n- Understand the privacy policy of apps that request location access"),
  q(8, 'Which of the following is a valid privacy concern related to geotagging?',
    ['Photos may reveal your home address or daily routine to strangers', 'Geotagging causes photos to use too much storage', 'Geotagging makes your phone battery drain faster', 'Geotagging only works on expensive devices'], 0,
    'Geotagged photos contain embedded GPS coordinates. If shared publicly, anyone can extract the location, potentially revealing your home address or frequently visited places.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: String Manipulation (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, "## String Manipulation in Delphi\n\nStrings are sequences of characters. Delphi provides built-in functions to manipulate strings.\n\n### Key String Functions\n\n| Function | Purpose | Example | Result |\n|----------|---------|---------|--------|\n| `Length(s)` | Returns the number of characters | `Length('Hello')` | 5 |\n| `Copy(s, start, count)` | Extracts a substring | `Copy('Delphi', 2, 3)` | `'elp'` |\n| `Pos(sub, s)` | Finds position of substring | `Pos('lp', 'Delphi')` | 3 |\n| `UpperCase(s)` | Converts to uppercase | `UpperCase('hello')` | `'HELLO'` |\n| `LowerCase(s)` | Converts to lowercase | `LowerCase('HELLO')` | `'hello'` |\n| `Trim(s)` | Removes leading/trailing spaces | `Trim('  hi  ')` | `'hi'` |\n| `Concat(s1, s2)` | Joins strings (or use `+`) | `Concat('Hi', ' there')` | `'Hi there'` |\n| `StringReplace(s, old, new, [flags])` | Replaces occurrences | See below | See below |"),
  t(2, "### Insert and Delete\n\n**Insert(source, target, position)** \u2014 inserts a string into another at the specified position:\n```pascal\nvar\n  s: string;\nbegin\n  s := 'Helo World';\n  Insert('l', s, 4);    // s is now 'Hello World'\nend;\n```\n\n**Delete(s, start, count)** \u2014 removes characters from a string:\n```pascal\nvar\n  s: string;\nbegin\n  s := 'Hello World';\n  Delete(s, 6, 6);       // s is now 'Hello'\nend;\n```\n\n**StringReplace example:**\n```pascal\nvar\n  s: string;\nbegin\n  s := 'I like cats and cats like me';\n  s := StringReplace(s, 'cats', 'dogs', [rfReplaceAll]);\n  // s is now 'I like dogs and dogs like me'\nend;\n```\n\nThe `[rfReplaceAll]` flag replaces ALL occurrences. Without it, only the first occurrence is replaced."),
  q(3, 'What is the result of Copy(\"Information\", 1, 4)?',
    ['Info', 'nfor', 'Inform', 'tion'], 0,
    'Copy extracts characters starting at position 1, taking 4 characters: I-n-f-o = \"Info\".'),
  fb(4, 'The function ___ returns the position of a substring within a string. The function ___ returns the number of characters in a string.',
    ['Pos', 'Length'],
    'Pos finds the starting index of a substring. Length returns the total character count.'),
  t(5, "### Character-Level Operations\n\nYou can access individual characters in a string using square brackets:\n\n```pascal\nvar\n  s: string;\n  ch: char;\nbegin\n  s := 'Delphi';\n  ch := s[1];    // ch = 'D'\n  ch := s[4];    // ch = 'p'\nend;\n```\n\n**Character functions:**\n\n| Function | Purpose | Example |\n|----------|---------|--------|\n| `Ord(ch)` | Returns the ASCII value of a character | `Ord('A')` = 65 |\n| `Chr(n)` | Returns the character for an ASCII value | `Chr(65)` = `'A'` |\n| `UpCase(ch)` | Converts a single character to uppercase | `UpCase('a')` = `'A'` |\n\n**Useful ASCII ranges:**\n- `'A'` to `'Z'`: 65\u201390\n- `'a'` to `'z'`: 97\u2013122\n- `'0'` to `'9'`: 48\u201357\n\n**Checking character type:**\n```pascal\nif (ch >= 'A') and (ch <= 'Z') then\n  // ch is an uppercase letter\nif (ch >= '0') and (ch <= '9') then\n  // ch is a digit\n```"),
  q(6, 'What is the ASCII value of the character \"A\"?',
    ['65', '97', '48', '90'], 0,
    'The uppercase letter A has ASCII value 65. Lowercase a is 97. The digit 0 is 48.'),
  t(7, "### Practical String Manipulation Examples\n\n**Reversing a string:**\n```pascal\nfunction ReverseStr(s: string): string;\nvar\n  i: integer;\nbegin\n  Result := '';\n  for i := Length(s) downto 1 do\n    Result := Result + s[i];\nend;\n```\n\n**Counting vowels:**\n```pascal\nfunction CountVowels(s: string): integer;\nvar\n  i: integer;\nbegin\n  Result := 0;\n  s := UpperCase(s);\n  for i := 1 to Length(s) do\n    if s[i] in ['A', 'E', 'I', 'O', 'U'] then\n      Inc(Result);\nend;\n```\n\n**Extracting initials:**\n```pascal\n// Input: 'Nelson Rolihlahla Mandela'\n// Output: 'NRM'\nfunction GetInitials(sFullName: string): string;\nvar\n  i: integer;\nbegin\n  Result := sFullName[1];  // first character is always an initial\n  for i := 2 to Length(sFullName) do\n    if sFullName[i - 1] = ' ' then\n      Result := Result + UpCase(sFullName[i]);\nend;\n```"),
  q(8, 'What does the ReverseStr function return when called with \"Delphi\"?',
    ['ihpleD', 'Delphi', 'IHPLED', 'delphi'], 0,
    'The function loops from the last character to the first, building the reversed string: i-h-p-l-e-D = \"ihpleD\".'),
  t(9, "## Date and Time in Delphi\n\nDelphi provides functions for working with dates and times.\n\n### Key Date/Time Functions\n\n| Function | Purpose | Example |\n|----------|---------|--------|\n| `Now` | Returns current date and time | `Now` |\n| `Date` | Returns current date only | `Date` |\n| `Time` | Returns current time only | `Time` |\n| `DateToStr(d)` | Converts date to string | `DateToStr(Date)` = `'2026/04/05'` |\n| `TimeToStr(t)` | Converts time to string | `TimeToStr(Time)` = `'14:30:15'` |\n| `StrToDate(s)` | Converts string to date | `StrToDate('2026/04/05')` |\n| `FormatDateTime(fmt, d)` | Custom date formatting | `FormatDateTime('dd/mm/yyyy', Date)` |\n| `EncodeDate(y, m, d)` | Creates a date from parts | `EncodeDate(2026, 4, 5)` |\n| `DecodeDate(d, y, m, d)` | Extracts year, month, day | Fills variables |\n| `DayOfWeek(d)` | Returns day number (1=Sunday) | `DayOfWeek(Date)` |\n| `DaysBetween(d1, d2)` | Days between two dates | Requires `DateUtils` unit |\n\n**Calculating age:**\n```pascal\nuses DateUtils;\nvar\n  dBirthDate: TDateTime;\n  iAge: integer;\nbegin\n  dBirthDate := StrToDate('2008/06/15');\n  iAge := YearsBetween(Date, dBirthDate);\n  ShowMessage('Age: ' + IntToStr(iAge));\nend;\n```"),
  fb(10, 'The function ___ returns the current date and time. To calculate the number of days between two dates, use the ___ function from the DateUtils unit.',
    ['Now', 'DaysBetween'],
    'Now returns the current TDateTime value. DaysBetween (from the DateUtils unit) calculates the whole number of days between two dates.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Social Implications (Term 1-2)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 5.1: Safety, Threats, and Remedies
blockNum = 0;
const ch5_lesson1 = [
  t(1, "## Safety and Threats to ICT Systems\n\n### Physical Threats\n\n| Threat | Description | Prevention |\n|--------|-------------|------------|\n| **Theft** | Hardware or data stolen | Locks, security cameras, cable locks, GPS tracking |\n| **Fire/Flood** | Natural disasters destroying equipment | Offsite backups, fireproof safes, insurance |\n| **Power surges/outages** | Sudden voltage changes | UPS (Uninterruptible Power Supply), surge protectors |\n| **Environmental damage** | Dust, humidity, extreme heat | Air conditioning, dust covers, proper ventilation |\n| **Vandalism** | Deliberate damage to equipment | Physical security, access control, CCTV |\n\n### Hardware Threats\n\n| Threat | Description | Prevention |\n|--------|-------------|------------|\n| **Hard drive failure** | Mechanical or electronic failure of storage | Regular backups, RAID arrays, use SSDs |\n| **Component overheating** | CPU/GPU overheating causing shutdowns | Adequate cooling, clean fans, thermal paste |\n| **Wear and tear** | Components degrading over time | Regular maintenance, replacement schedules |"),
  t(2, "### Network Threats\n\n| Threat | Description |\n|--------|------------|\n| **Virus** | Self-replicating program that attaches to other files and spreads |\n| **Worm** | Self-replicating program that spreads across networks without user action |\n| **Trojan horse** | Malware disguised as legitimate software |\n| **Ransomware** | Encrypts files and demands payment for decryption key |\n| **Spyware** | Secretly monitors user activity and collects personal data |\n| **Adware** | Displays unwanted advertisements; may track browsing habits |\n| **Phishing** | Fake emails/websites that trick users into revealing personal information |\n| **DoS/DDoS attack** | Overwhelms a server with requests to make it unavailable |\n| **Man-in-the-middle** | Attacker intercepts communication between two parties |\n| **SQL injection** | Inserting malicious SQL code into input fields to access databases |\n| **Brute force attack** | Trying every possible password combination until one works |\n| **Social engineering** | Manipulating people into revealing confidential information |"),
  q(3, 'Which type of malware encrypts your files and demands payment to unlock them?',
    ['Ransomware', 'Spyware', 'Adware', 'Trojan horse'], 0,
    'Ransomware encrypts files and displays a ransom demand, typically requesting payment in cryptocurrency for the decryption key.'),
  t(4, "### Remedies and Protection\n\n| Remedy | Protects against |\n|--------|------------------|\n| **Antivirus/Anti-malware software** | Viruses, trojans, worms, spyware |\n| **Firewall** | Unauthorised network access, DoS attacks |\n| **Strong passwords** | Brute force attacks, unauthorised access |\n| **Two-factor authentication (2FA)** | Account compromise even if password is stolen |\n| **Encryption** | Data theft (data is unreadable without the key) |\n| **Regular updates/patches** | Known software vulnerabilities |\n| **Regular backups (3-2-1 rule)** | Data loss from any cause |\n| **User education/awareness** | Phishing, social engineering |\n| **Access control (permissions)** | Unauthorised access to files and systems |\n| **VPN** | Man-in-the-middle attacks, snooping on public Wi-Fi |\n| **SSL/TLS certificates** | Insecure web communication |\n| **Intrusion Detection System (IDS)** | Detecting suspicious network activity |\n\n**The 3-2-1 Backup Rule:**\n- **3** copies of your data\n- **2** different storage media (e.g. external HDD + cloud)\n- **1** copy stored offsite"),
  fb(5, 'A ___ is software/hardware that monitors and controls incoming and outgoing network traffic. The 3-2-1 backup rule recommends keeping ___ copies of your data.',
    ['firewall', '3'],
    'A firewall acts as a barrier between your network and the internet. The 3-2-1 rule says keep 3 copies on 2 different media with 1 offsite.'),
  q(6, 'Which security measure would BEST protect against a phishing attack?',
    ['User education and awareness training', 'Installing a faster CPU', 'Using a bigger hard drive', 'Increasing RAM'], 0,
    'Phishing relies on tricking users. The best defence is education: teaching users to recognise fake emails, suspicious links, and social engineering tactics.'),
  t(7, "### Strong Passwords\n\nA strong password should:\n- Be at least 12 characters long\n- Include uppercase and lowercase letters, numbers, and symbols\n- Not contain personal information (name, birthday, etc.)\n- Not be a common word or phrase\n- Be unique for each account\n\n**Password management:**\n- Use a password manager to generate and store unique passwords\n- Enable two-factor authentication (2FA) wherever possible\n- Never share passwords or write them on sticky notes\n- Change passwords regularly, especially after a data breach\n\n**Two-Factor Authentication (2FA):**\nRequires two different forms of verification:\n1. Something you **know** (password)\n2. Something you **have** (phone for OTP) or something you **are** (fingerprint, face scan)\n\nEven if an attacker steals your password, they cannot access your account without the second factor."),
  q(8, 'Which of the following is the strongest password?',
    ['R#7kP!m2@Lz9', 'password123', 'JohnSmith1990', 'qwerty'], 0,
    'R#7kP!m2@Lz9 is strong because it uses uppercase, lowercase, numbers, and symbols with no recognisable pattern. The others are all common or contain personal information.'),
];

// Lesson 5.2: Social, Ethical, and Legal Issues
blockNum = 0;
const ch5_lesson2 = [
  t(1, "## Social Issues Related to ICTs\n\n### The Digital Divide\n\nThe **digital divide** refers to the gap between people who have access to technology and the internet, and those who do not.\n\n**Causes in South Africa:**\n- Poverty: Many families cannot afford devices or data\n- Rural areas: Poor infrastructure, limited internet connectivity\n- Education: Lack of digital literacy skills\n- Language: Much online content is in English\n\n**Effects:**\n- Unequal access to education (e-learning, online resources)\n- Limited job opportunities (many jobs require computer skills)\n- Social exclusion from digital services (online banking, government portals)\n\n**Solutions:**\n- Government initiatives to provide free Wi-Fi in public spaces\n- School computer labs and tablet programmes\n- Mobile-first design (many South Africans access the internet via smartphones)\n- Community digital literacy programmes"),
  t(2, "### Health Issues from ICT Use\n\n| Health Issue | Cause | Prevention |\n|-------------|-------|------------|\n| **Eye strain (CVS)** | Prolonged screen time | 20-20-20 rule (every 20 min, look 20 feet away for 20 sec) |\n| **Repetitive Strain Injury (RSI)** | Repeated motions (typing, clicking) | Ergonomic keyboard/mouse, regular breaks |\n| **Back/neck pain** | Poor posture while sitting | Ergonomic chair, screen at eye level |\n| **Obesity** | Sedentary lifestyle | Regular exercise, standing desk |\n| **Sleep disruption** | Blue light from screens before bed | Blue light filter, no screens 1 hour before sleep |\n| **Addiction** | Excessive gaming or social media | Screen time limits, digital detox |\n| **Cyberbullying** | Harassment through digital platforms | Report, block, speak to trusted adults |\n\n**Ergonomics:** The science of designing workspaces and equipment to fit the human body. An ergonomic setup reduces strain and injury."),
  q(3, 'What is the 20-20-20 rule for preventing eye strain?',
    ['Every 20 minutes, look at something 20 feet away for 20 seconds', 'Use a screen for only 20 minutes per day', 'Set brightness to 20%', 'Take a 20-minute break every hour'], 0,
    'The 20-20-20 rule helps prevent Computer Vision Syndrome: every 20 minutes, look at something 20 feet (6 metres) away for at least 20 seconds.'),
  t(4, "## Ethical and Legal Issues\n\n### Intellectual Property and Copyright\n\n**Copyright** protects original creative works (software, music, art, writing) from being copied or distributed without permission.\n\n| Concept | Meaning |\n|---------|---------|\n| **Copyright** | Legal right of the creator to control how their work is used |\n| **Piracy** | Illegal copying or distribution of copyrighted material |\n| **Plagiarism** | Presenting someone else s work as your own |\n| **Open source** | Software where the source code is freely available |\n| **Freeware** | Software that is free to use but source code is not available |\n| **Shareware** | Software that is free to try but requires payment for full use |\n| **Creative Commons** | Licences that allow creators to specify how their work may be used |\n\n**In South Africa:** The Copyright Act (No. 98 of 1978) and the Electronic Communications and Transactions (ECT) Act (No. 25 of 2002) govern digital content and electronic transactions."),
  fb(5, 'Illegal copying or distribution of copyrighted software is called ___. Software with freely available source code is called ___ source.',
    ['piracy', 'open'],
    'Software piracy violates copyright law. Open source software makes its code publicly available for anyone to use, modify, and distribute.'),
  t(6, "### Privacy and Data Protection\n\n**POPIA (Protection of Personal Information Act, 2013):**\n\nSouth Africa s data protection law, similar to the EU s GDPR.\n\n**Key principles:**\n- **Accountability:** The organisation collecting data is responsible for compliance\n- **Processing limitation:** Only collect data for a specific, lawful purpose\n- **Purpose specification:** Data must only be used for the stated purpose\n- **Information quality:** Data must be accurate, complete, and up to date\n- **Openness:** People must be told what data is collected and why\n- **Security safeguards:** Reasonable measures to protect data from loss, theft, or unauthorised access\n- **Data subject participation:** People can request to see, correct, or delete their data\n\n**Consequences of non-compliance:** Fines up to R10 million, imprisonment up to 10 years, or both."),
  q(7, 'Under POPIA, which of the following is a right of the data subject (the person whose data is collected)?',
    ['The right to request access to, correction of, or deletion of their personal data', 'The right to sell their personal data to other companies', 'The right to access any company s database', 'The right to collect other people s personal information'], 0,
    'POPIA gives data subjects the right to access their personal data, request corrections, and request deletion. It does not give them rights to access other people s data or sell their own.'),
  t(8, "### Capabilities and Limitations of ICTs\n\n**Capabilities:**\n- Instant global communication (email, video calls, social media)\n- Access to vast information and educational resources\n- Automation of repetitive tasks (AI, robotics)\n- Remote work and learning\n- Medical advances (telemedicine, AI diagnostics)\n- E-commerce and online banking\n\n**Limitations:**\n- Technology cannot replace human judgement, empathy, or creativity (yet)\n- AI can be biased based on training data\n- Dependence on electricity and internet connectivity\n- Job displacement due to automation\n- Cannot solve social problems (poverty, inequality) on its own\n- Digital systems can fail, be hacked, or malfunction\n\n**Artificial Intelligence in everyday life:**\n- Voice assistants (Siri, Google Assistant)\n- Recommendation systems (Netflix, Spotify)\n- Spam filters and fraud detection\n- Self-driving car technology\n- Medical image analysis"),
  q(9, 'Which of the following is a limitation of ICTs?',
    ['Technology can displace workers through automation', 'Computers can send emails', 'The internet provides access to information', 'AI can analyse medical images'], 0,
    'Job displacement through automation is a significant limitation/concern of ICTs. The other options are capabilities, not limitations.'),
  fb(10, 'South Africa s data protection law is called ___ (abbreviation). A key limitation of AI is that it can be ___ based on the data it was trained on.',
    ['POPIA', 'biased'],
    'POPIA (Protection of Personal Information Act) is South Africa s data protection legislation. AI systems can exhibit bias if their training data is unrepresentative or skewed.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Electronic Communication (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Mobile and Wireless Technology\n\n### Uses of Mobile Technology\n\n| Category | Examples |\n|----------|----------|\n| **Communication** | Calls, SMS, WhatsApp, email, video calls |\n| **Education** | E-books, educational apps, online courses |\n| **Entertainment** | Streaming (Netflix, Spotify), gaming, social media |\n| **Banking** | Mobile banking apps, EFT, USSD banking (*120*) |\n| **Navigation** | GPS, Google Maps, Waze |\n| **Health** | Fitness trackers, telemedicine, health apps |\n| **Commerce** | Online shopping, QR code payments, food delivery apps |\n| **Government** | E-filing (SARS), licence renewals, grant applications |\n\n### Mobile Device Features\n\n- **Touchscreen:** Capacitive (multi-touch) screens for intuitive interaction\n- **Sensors:** Accelerometer (motion), gyroscope (orientation), proximity, ambient light\n- **Cameras:** High-resolution with AI features (portrait mode, night mode)\n- **Biometrics:** Fingerprint scanner, facial recognition for security\n- **NFC (Near Field Communication):** Contactless payments (tap-to-pay)\n- **Bluetooth:** Short-range wireless for peripherals (earphones, speakers)"),
  t(2, "### Tethering and Mobile Hotspot\n\n**Tethering** allows you to share your mobile device s internet connection with other devices.\n\n| Method | How it works |\n|--------|-------------|\n| **Wi-Fi hotspot** | Phone acts as a wireless router; other devices connect via Wi-Fi |\n| **USB tethering** | Phone connects to a computer via USB cable; shares internet |\n| **Bluetooth tethering** | Shares internet via Bluetooth (slower, shorter range) |\n\n**Considerations:**\n- Uses mobile data (can be expensive if data is limited)\n- Drains the phone battery quickly\n- Multiple connected devices reduce speed for each\n\n### SIM vs eSIM\n\n| Feature | Physical SIM | eSIM |\n|---------|-------------|------|\n| **Form** | Removable card | Built into the device |\n| **Switching networks** | Swap the SIM card | Download a new profile remotely |\n| **Dual SIM** | Needs two SIM slots | Can store multiple profiles |\n| **Security** | Can be removed or stolen | Cannot be physically removed |"),
  q(3, 'What is the main disadvantage of using your phone as a Wi-Fi hotspot?',
    ['It uses your mobile data and drains battery quickly', 'It is completely free', 'It provides faster internet than fibre', 'It works without a cellular signal'], 0,
    'Tethering uses your mobile data allocation and creates significant battery drain. It is not free (uses data) and is typically slower than fibre.'),
  t(4, "## Communication Protocols\n\nA **protocol** is a set of rules that govern how data is transmitted and received over a network.\n\n### Key Protocols\n\n| Protocol | Purpose |\n|----------|--------|\n| **HTTP/HTTPS** | Transferring web pages. HTTPS adds encryption (SSL/TLS) |\n| **FTP/SFTP** | File Transfer Protocol. SFTP adds encryption |\n| **SMTP** | Sending emails (Simple Mail Transfer Protocol) |\n| **POP3** | Receiving emails (downloads to device, typically deletes from server) |\n| **IMAP** | Receiving emails (syncs across devices, keeps emails on server) |\n| **TCP/IP** | Foundation of all internet communication. TCP ensures reliable delivery; IP handles addressing |\n| **DNS** | Translates domain names (google.com) to IP addresses |\n| **DHCP** | Automatically assigns IP addresses to devices on a network |\n| **VoIP (SIP/RTP)** | Protocols for voice and video calls over the internet |\n\n### IMAP vs POP3\n\n| Feature | IMAP | POP3 |\n|---------|------|------|\n| **Emails stored on** | Server (synced) | Downloaded to device |\n| **Multi-device access** | Yes (same view everywhere) | No (emails on one device) |\n| **Storage** | Uses server space | Frees server space |\n| **Offline access** | Limited | Full (emails are local) |"),
  fb(5, 'The protocol ___ encrypts web traffic, while plain ___ does not. To send emails, devices use the ___ protocol.',
    ['HTTPS', 'HTTP', 'SMTP'],
    'HTTPS adds SSL/TLS encryption to HTTP for secure web browsing. SMTP (Simple Mail Transfer Protocol) handles sending emails.'),
  q(6, 'If you want to access your emails on both your phone and laptop and see the same inbox on both, which protocol should you use?',
    ['IMAP', 'POP3', 'SMTP', 'FTP'], 0,
    'IMAP keeps emails on the server and synchronises across all devices, so you see the same inbox everywhere. POP3 downloads emails to one device.'),
  t(7, "## Data Security in Electronic Communication\n\n### Encryption\n\n**Encryption** converts readable data (plaintext) into unreadable data (ciphertext) using an algorithm and a key.\n\n**Types:**\n- **Symmetric encryption:** Same key used to encrypt and decrypt (e.g. AES). Fast but the key must be shared securely.\n- **Asymmetric encryption:** Two keys \u2014 a public key (encrypts) and a private key (decrypts). Slower but more secure for communication (e.g. RSA).\n\n**End-to-end encryption (E2EE):**\nUsed by WhatsApp, Signal, etc. Only the sender and recipient can read the messages. Not even the service provider can decrypt them.\n\n### Digital Certificates and SSL/TLS\n\n- A **digital certificate** verifies the identity of a website\n- Issued by a **Certificate Authority (CA)**\n- When you see the padlock icon in your browser, the site uses SSL/TLS\n- SSL/TLS encrypts data between your browser and the web server\n\n### Email Security\n\n- Use strong, unique passwords for email accounts\n- Enable 2FA\n- Be cautious of attachments and links from unknown senders\n- Use encrypted email services for sensitive communication\n- Check sender addresses carefully (phishing often uses look-alike addresses)"),
  q(8, 'In asymmetric encryption, which key does the sender use to encrypt a message?',
    ['The recipient s public key', 'The sender s private key', 'The recipient s private key', 'A shared symmetric key'], 0,
    'In asymmetric encryption, the sender encrypts using the recipient s public key. Only the recipient s private key can decrypt it, ensuring only the intended recipient can read the message.'),
  fb(9, 'Encryption that uses the same key for encrypting and decrypting is called ___ encryption. WhatsApp uses ___-to-___ encryption so only the sender and recipient can read messages.',
    ['symmetric', 'end', 'end'],
    'Symmetric encryption uses one shared key. End-to-end encryption ensures no intermediary (not even the service provider) can read the messages.'),
  q(10, 'What does the padlock icon in your browser s address bar indicate?',
    ['The website uses SSL/TLS encryption and has a valid digital certificate', 'The website is free of viruses', 'The website is owned by the government', 'The website will not show advertisements'], 0,
    'The padlock indicates the connection is encrypted using SSL/TLS and the website has a valid digital certificate issued by a trusted Certificate Authority.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Text File Handling (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch7_lesson1 = [
  t(1, "## Text File Handling in Delphi\n\nText files store data as lines of human-readable text. Delphi uses `TextFile` and `AssignFile` for file operations.\n\n### Reading from a Text File\n\n```pascal\nvar\n  tf: TextFile;\n  sLine: string;\nbegin\n  AssignFile(tf, 'data.txt');  // Link variable to file\n  Reset(tf);                    // Open file for reading\n  while not Eof(tf) do          // Loop until End Of File\n  begin\n    Readln(tf, sLine);          // Read one line\n    memOutput.Lines.Add(sLine); // Display in a memo\n  end;\n  CloseFile(tf);                // Always close the file\nend;\n```\n\n### Writing to a Text File\n\n```pascal\nvar\n  tf: TextFile;\nbegin\n  AssignFile(tf, 'output.txt');\n  Rewrite(tf);                   // Create/overwrite file\n  Writeln(tf, 'First line');     // Write a line\n  Writeln(tf, 'Second line');\n  CloseFile(tf);\nend;\n```\n\n### Appending to a Text File\n\n```pascal\nAssignFile(tf, 'log.txt');\nAppend(tf);                      // Open for appending (adds to end)\nWriteln(tf, 'New entry: ' + DateTimeToStr(Now));\nCloseFile(tf);\n```"),
  t(2, "### Key File Operations\n\n| Operation | Function | Description |\n|-----------|----------|------------|\n| **AssignFile** | `AssignFile(tf, filename)` | Links a TextFile variable to a physical file |\n| **Reset** | `Reset(tf)` | Opens an existing file for reading |\n| **Rewrite** | `Rewrite(tf)` | Creates a new file (or overwrites existing) for writing |\n| **Append** | `Append(tf)` | Opens an existing file to add data at the end |\n| **Readln** | `Readln(tf, s)` | Reads one line into a string variable |\n| **Writeln** | `Writeln(tf, s)` | Writes a string followed by a newline |\n| **Eof** | `Eof(tf)` | Returns True if the end of file is reached |\n| **CloseFile** | `CloseFile(tf)` | Closes the file (ALWAYS do this!) |\n\n**Important:** Always close files after use! Forgetting to call `CloseFile` can cause data loss or file corruption."),
  q(3, 'What is the difference between Rewrite and Append when opening a text file for writing?',
    ['Rewrite creates/overwrites the file; Append adds to the end of an existing file', 'They are the same', 'Append overwrites the file; Rewrite adds to the end', 'Rewrite is for reading; Append is for writing'], 0,
    'Rewrite creates a new file or erases the contents of an existing file. Append opens an existing file and positions the cursor at the end, preserving existing content.'),
  t(4, "## Exception Handling\n\nExceptions are runtime errors that can crash your program if not handled. Delphi uses `try..except` and `try..finally` blocks.\n\n### try..except (Handle errors)\n\n```pascal\ntry\n  // Code that might cause an error\n  AssignFile(tf, 'data.txt');\n  Reset(tf);\n  // ... read file ...\n  CloseFile(tf);\nexcept\n  on E: EInOutError do\n    ShowMessage('File error: ' + E.Message);\n  on E: EConvertError do\n    ShowMessage('Conversion error: ' + E.Message);\n  on E: Exception do\n    ShowMessage('Unexpected error: ' + E.Message);\nend;\n```\n\n### try..finally (Ensure cleanup)\n\n```pascal\nAssignFile(tf, 'data.txt');\nReset(tf);\ntry\n  // ... read file ...\nfinally\n  CloseFile(tf);  // This ALWAYS runs, even if an error occurs\nend;\n```\n\n**Best practice \u2014 combine both:**\n```pascal\ntry\n  AssignFile(tf, 'data.txt');\n  Reset(tf);\n  try\n    // ... process file ...\n  finally\n    CloseFile(tf);\n  end;\nexcept\n  on E: Exception do\n    ShowMessage('Error: ' + E.Message);\nend;\n```"),
  fb(5, 'The ___ block catches and handles runtime errors. The ___ block ensures cleanup code runs whether or not an error occurred.',
    ['except', 'finally'],
    'try..except handles specific exceptions. try..finally guarantees that cleanup code (like CloseFile) always executes.'),
  t(6, "### Checking if a File Exists\n\nBefore opening a file for reading, always check that it exists:\n\n```pascal\nif FileExists('data.txt') then\nbegin\n  AssignFile(tf, 'data.txt');\n  Reset(tf);\n  // ... read file ...\n  CloseFile(tf);\nend\nelse\n  ShowMessage('File not found: data.txt');\n```\n\n### Common Exception Types in Delphi\n\n| Exception | Cause |\n|-----------|-------|\n| `EInOutError` | File not found, access denied, disk full |\n| `EConvertError` | Invalid type conversion (e.g. StrToInt on non-numeric string) |\n| `ERangeError` | Array index out of bounds |\n| `EDivByZero` | Division by zero |\n| `EAccessViolation` | Accessing invalid memory (often nil object) |\n| `EInvalidOp` | Invalid floating-point operation |"),
  q(7, 'Why should you call FileExists before Reset?',
    ['Reset will raise an EInOutError if the file does not exist', 'FileExists creates the file', 'Reset deletes the file if it exists', 'It is optional and makes no difference'], 0,
    'Calling Reset on a non-existent file raises an EInOutError exception. FileExists lets you check first and handle the case gracefully.'),
  t(8, "## Generating Text-Based Reports\n\nText files can be used to generate simple reports from data.\n\n**Example: Student marks report**\n```pascal\nvar\n  tf: TextFile;\n  i: integer;\n  arrNames: array[1..5] of string;\n  arrMarks: array[1..5] of integer;\n  sStatus: string;\nbegin\n  // Assume arrays are populated\n  AssignFile(tf, 'report.txt');\n  Rewrite(tf);\n  Writeln(tf, 'STUDENT MARKS REPORT');\n  Writeln(tf, '===================');\n  Writeln(tf, Format('%-20s %-10s %-10s',\n    ['Name', 'Mark', 'Status']));\n  Writeln(tf, '-----------------------------------');\n  for i := 1 to 5 do\n  begin\n    if arrMarks[i] >= 50 then\n      sStatus := 'Pass'\n    else\n      sStatus := 'Fail';\n    Writeln(tf, Format('%-20s %-10d %-10s',\n      [arrNames[i], arrMarks[i], sStatus]));\n  end;\n  Writeln(tf, '-----------------------------------');\n  CloseFile(tf);\n  ShowMessage('Report saved to report.txt');\nend;\n```\n\n**The `Format` function** uses placeholders:\n- `%-20s` = left-aligned string, 20 characters wide\n- `%-10d` = left-aligned integer, 10 characters wide\n- `%8.2f` = right-aligned float, 8 wide, 2 decimal places"),
  q(9, 'What does the Eof(tf) function return?',
    ['True when the end of the file has been reached', 'The last line of the file', 'The file size in bytes', 'True when the file is empty'], 0,
    'Eof (End of File) returns True when there are no more lines to read. It is used in a while loop condition to read until the file ends.'),
  fb(10, 'To write data to the end of an existing file without erasing it, use the ___ procedure. The ___ function checks whether a file exists before attempting to open it.',
    ['Append', 'FileExists'],
    'Append opens a file for writing at the end, preserving existing content. FileExists returns True if the specified file is present on disk.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Software Engineering (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, "## Software Engineering\n\nSoftware engineering is the disciplined approach to designing, developing, testing, and maintaining software.\n\n### The Software Development Life Cycle (SDLC)\n\nThe SDLC is a structured process for developing software.\n\n| Phase | Activities |\n|-------|------------|\n| **1. Analysis** | Identify the problem, gather requirements, define scope |\n| **2. Design** | Plan the solution: flowcharts, pseudocode, UI mockups, data structures |\n| **3. Implementation** | Write the actual code based on the design |\n| **4. Testing** | Verify the software works correctly; find and fix bugs |\n| **5. Documentation** | Create user manuals, technical docs, help files |\n| **6. Maintenance** | Fix bugs discovered after release, add features, adapt to changes |\n\n### SDLC Models\n\n| Model | Description | Best for |\n|-------|-------------|----------|\n| **Waterfall** | Sequential phases; each phase completes before the next begins | Well-defined, stable requirements |\n| **Iterative** | Repeats phases in cycles; each cycle produces a working version | Large projects with evolving requirements |\n| **Agile** | Short sprints (2-4 weeks); continuous feedback and adaptation | Fast-changing requirements, teamwork |"),
  q(2, 'Which SDLC model is best suited for a project where requirements are likely to change frequently?',
    ['Agile', 'Waterfall', 'Sequential', 'None of the above'], 0,
    'Agile uses short development sprints with continuous feedback and adaptation, making it ideal for projects with changing requirements.'),
  t(3, "## Planning Solutions\n\n### Algorithms\n\nAn **algorithm** is a step-by-step set of instructions to solve a problem.\n\n**Characteristics of a good algorithm:**\n- Clear and unambiguous\n- Has defined inputs and outputs\n- Finite (terminates after a number of steps)\n- Effective (each step can be carried out)\n\n### Pseudocode\n\nPseudocode is a structured, English-like description of an algorithm. It is not tied to any programming language.\n\n**Example \u2014 Find the largest of three numbers:**\n```\nINPUT num1, num2, num3\nSET largest = num1\nIF num2 > largest THEN\n  SET largest = num2\nENDIF\nIF num3 > largest THEN\n  SET largest = num3\nENDIF\nOUTPUT largest\n```\n\n### Flowcharts\n\n| Symbol | Shape | Purpose |\n|--------|-------|---------|\n| **Terminal** | Rounded rectangle | Start / End |\n| **Process** | Rectangle | An action or calculation |\n| **Decision** | Diamond | Yes/No question (branching) |\n| **Input/Output** | Parallelogram | Read input or display output |\n| **Flow arrow** | Arrow | Shows the direction of flow |"),
  fb(4, 'A step-by-step set of instructions to solve a problem is called an ___. In a flowchart, a ___ shape represents a decision or condition.',
    ['algorithm', 'diamond'],
    'An algorithm is a finite, step-by-step procedure. Diamonds in flowcharts represent decision points (Yes/No or True/False branching).'),
  t(5, "## Software Development Principles\n\n### Modular Design\n\nBreak a large program into smaller, manageable **modules** (procedures, functions, units). Each module handles one specific task.\n\n**Benefits:**\n- Easier to develop and test individual parts\n- Easier to maintain and debug\n- Code reuse (modules can be used in other programs)\n- Team development (different people work on different modules)\n\n### Top-Down Design (Stepwise Refinement)\n\nStart with the main problem and break it down into sub-problems, then break those into smaller sub-problems until each can be coded directly.\n\n**Example:**\n```\nStudent Report System\n  |\n  |-- Input student data\n  |     |-- Read name\n  |     |-- Read marks\n  |\n  |-- Process data\n  |     |-- Calculate average\n  |     |-- Determine pass/fail\n  |\n  |-- Output results\n        |-- Display on screen\n        |-- Save to file\n```"),
  t(6, "### Testing Strategies\n\n| Testing Type | Description |\n|-------------|------------|\n| **Unit testing** | Testing individual modules/functions in isolation |\n| **Integration testing** | Testing how modules work together |\n| **System testing** | Testing the complete system as a whole |\n| **Acceptance testing** | End users test to confirm the system meets their needs |\n| **Alpha testing** | Internal testing by the development team |\n| **Beta testing** | External testing by a limited group of real users |\n\n### Types of Test Data\n\n| Type | Purpose | Example (Age field, range 5-100) |\n|------|---------|----------------------------------|\n| **Normal data** | Valid, expected input | 25 |\n| **Boundary data** | Values at the edge of valid range | 5, 100 |\n| **Extreme data** | Values just outside the valid range | 4, 101 |\n| **Abnormal/Erroneous data** | Invalid input that should be rejected | \"abc\", -5, 999 |"),
  q(7, 'For a marks field that accepts values 0 to 100, which of the following is an example of boundary test data?',
    ['0 and 100', '50', '-1 and 101', 'abc'], 0,
    'Boundary data tests the edges of the valid range. For 0-100, the boundary values are 0 and 100. Values like -1 and 101 are extreme/abnormal data.'),
  t(8, "### Documentation\n\n**Types of documentation:**\n\n| Type | Audience | Content |\n|------|----------|---------|\n| **User manual** | End users | How to install, use, and troubleshoot the software |\n| **Technical documentation** | Developers/maintainers | Code comments, design documents, API references |\n| **In-code comments** | Developers | Explanations within the source code |\n| **Help files** | End users | Context-sensitive help accessible from within the software |\n\n### Maintenance\n\n| Type | When | Example |\n|------|------|---------|\n| **Corrective** | Fixing bugs found after release | Fixing a calculation error |\n| **Adaptive** | Changing software for new environments | Supporting a new OS version |\n| **Perfective** | Improving performance or adding features | Optimising slow queries |\n| **Preventive** | Restructuring code to prevent future problems | Refactoring for readability |"),
  fb(9, 'Testing that is done by end users to verify the system meets their requirements is called ___ testing. Maintenance done to fix bugs after release is called ___ maintenance.',
    ['acceptance', 'corrective'],
    'Acceptance testing involves real users confirming the software meets their needs. Corrective maintenance addresses defects found in production.'),
  q(10, 'Which software development principle involves breaking a large program into smaller, reusable modules?',
    ['Modular design', 'Waterfall model', 'Beta testing', 'Corrective maintenance'], 0,
    'Modular design divides a program into self-contained modules, each handling a specific task. This improves readability, testability, and reuse.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Data and Information Management (Term 2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch9_lesson1 = [
  t(1, "## Database Concepts\n\n### What is a Database?\n\nA **database** is an organised collection of related data stored electronically.\n\n### Database Management System (DBMS)\n\nA **DBMS** is software that manages the creation, storage, retrieval, and security of data in a database.\n\n**Functions of a DBMS:**\n- Create and modify database structures (tables, fields, relationships)\n- Store, retrieve, update, and delete data\n- Enforce data integrity and validation rules\n- Control access (user authentication and permissions)\n- Handle concurrent access (multiple users at the same time)\n- Backup and recovery\n\n**Examples of DBMS software:**\n- Microsoft Access (small-scale, desktop)\n- MySQL (open source, web applications)\n- PostgreSQL (open source, enterprise)\n- Microsoft SQL Server (enterprise)\n- Oracle (large enterprise)\n- SQLite (embedded, mobile apps)"),
  t(2, "### Data vs Information\n\n| Concept | Definition | Example |\n|---------|-----------|--------|\n| **Data** | Raw, unprocessed facts and figures | 85, 72, 91, 68 |\n| **Information** | Data that has been processed and given meaning | The class average is 79% |\n| **Knowledge** | Information combined with experience and understanding | Students scoring below 70% need extra support |\n\n### Data Hierarchy\n\n| Level | Description | Example |\n|-------|-----------|--------|\n| **Bit** | Smallest unit (0 or 1) | 1 |\n| **Byte** | 8 bits; represents one character | 01000001 = A |\n| **Field** | One piece of data | Surname: Mokoena |\n| **Record** | Collection of related fields | All data for one student |\n| **Table** | Collection of related records | All students in a class |\n| **Database** | Collection of related tables | School database |"),
  q(3, 'What is the main difference between data and information?',
    ['Data is raw facts; information is data that has been processed and given context', 'They are the same thing', 'Information is always numeric', 'Data is always stored in databases'], 0,
    'Data consists of raw, unprocessed facts (numbers, text). Information is data that has been processed, organised, and given meaning within a context.'),
  t(4, "## Types of Databases\n\n### Flat-File Database\n\nAll data is stored in a single table or file.\n\n**Advantages:** Simple, easy to set up\n**Disadvantages:** Data redundancy, limited searching, not suitable for complex data\n\n**Example:** A single spreadsheet tracking student names and marks.\n\n### Relational Database\n\nData is stored in multiple related tables, linked by keys.\n\n**Advantages:**\n- Reduces data redundancy\n- Maintains data integrity through relationships\n- Supports complex queries (SQL)\n- Multiple users can access simultaneously\n\n**Disadvantages:** More complex to design and maintain\n\n### Other Database Types\n\n| Type | Description | Use Case |\n|------|-----------|----------|\n| **NoSQL** | Non-relational; stores data as documents, key-value pairs, or graphs | Big data, real-time web apps |\n| **Cloud database** | Hosted on cloud platforms | Scalable web/mobile apps |\n| **Distributed database** | Spread across multiple locations | Global organisations |"),
  fb(5, 'A ___ database stores all data in a single table, while a ___ database uses multiple linked tables to reduce redundancy.',
    ['flat-file', 'relational'],
    'Flat-file databases use one table (simple but redundant). Relational databases use multiple tables with relationships (more complex but efficient).'),
  t(6, "## Database-Related Careers\n\n| Career | Role |\n|--------|------|\n| **Database Administrator (DBA)** | Manages, maintains, and secures databases; handles backups, performance tuning, and user access |\n| **Data Analyst** | Analyses data to find patterns, trends, and insights; creates reports and visualisations |\n| **Data Scientist** | Uses statistics, machine learning, and programming to extract knowledge from large datasets |\n| **Database Developer** | Designs and builds database structures; writes stored procedures and queries |\n| **Data Engineer** | Builds and maintains data pipelines and infrastructure |\n| **Business Intelligence Analyst** | Transforms data into actionable business insights using dashboards |\n\n**Skills needed for database careers:**\n- SQL (essential for all database roles)\n- Understanding of database design and normalisation\n- Programming (Python, Java, or C# for data science and development)\n- Data visualisation tools (Power BI, Tableau)\n- Problem-solving and analytical thinking"),
  q(7, 'Which career involves managing database security, backups, and performance tuning?',
    ['Database Administrator (DBA)', 'Data Scientist', 'Web Designer', 'Network Technician'], 0,
    'A Database Administrator (DBA) is responsible for the overall management, security, backup, recovery, and performance optimisation of databases.'),
  t(8, "## Database Design\n\n### Steps in Database Design\n\n1. **Identify entities:** What things need to be stored? (e.g. Students, Classes, Teachers)\n2. **Identify attributes:** What data do we need for each entity? (e.g. Student: Name, Surname, Grade)\n3. **Identify relationships:** How are entities related? (e.g. A Student belongs to a Class)\n4. **Draw an ERD:** Visual diagram showing entities, attributes, and relationships\n5. **Assign keys:** Primary keys, foreign keys, composite keys\n6. **Normalise:** Apply 1NF, 2NF, 3NF to remove redundancy\n7. **Choose data types:** Select appropriate types for each field\n8. **Add constraints:** NOT NULL, UNIQUE, CHECK, DEFAULT values\n\n### Entity-Relationship Diagrams (ERDs)\n\nAn ERD visually represents the structure of a database.\n\n**Notation:**\n- **Rectangle:** Entity (table)\n- **Oval:** Attribute (field)\n- **Diamond:** Relationship between entities\n- **Lines:** Connect entities with cardinality (1:1, 1:M, M:M)\n\n**Example:** A School database might have entities: Student, Class, Teacher, Subject with relationships:\n- A Class HAS MANY Students (1:M)\n- A Teacher TEACHES MANY Classes (1:M)\n- A Student TAKES MANY Subjects (M:M \u2014 needs junction table)"),
  q(9, 'Why is a junction table needed for a many-to-many relationship?',
    ['To break it into two one-to-many relationships since databases cannot directly implement M:M', 'To speed up queries', 'To reduce the number of tables', 'It is optional and not required'], 0,
    'Relational databases cannot directly represent many-to-many relationships. A junction (bridge) table sits between the two entities, creating two one-to-many relationships.'),
  fb(10, 'The first step in database design is to identify the ___ (things to be stored). A visual diagram showing entities and their relationships is called an ___.',
    ['entities', 'ERD'],
    'Entities are the real-world things or concepts represented as tables. An ERD (Entity-Relationship Diagram) shows the structure and relationships visually.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Solution Development — Database Programming (Term 2-3)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 10.1: SQL Basics
blockNum = 0;
const ch10_lesson1 = [
  t(1, "## SQL (Structured Query Language)\n\nSQL is the standard language for communicating with relational databases.\n\n### SQL Categories\n\n| Category | Commands | Purpose |\n|----------|----------|---------|\n| **DML (Data Manipulation)** | SELECT, INSERT, UPDATE, DELETE | Work with data |\n| **DDL (Data Definition)** | CREATE, ALTER, DROP | Define database structure |\n| **DCL (Data Control)** | GRANT, REVOKE | Control access permissions |\n\n### SELECT \u2014 Retrieving Data\n\n**Basic syntax:**\n```sql\nSELECT column1, column2\nFROM tableName\nWHERE condition\nORDER BY column ASC|DESC;\n```\n\n**Examples:**\n```sql\n-- Select all columns and all rows\nSELECT * FROM tblStudents;\n\n-- Select specific columns\nSELECT Name, Surname, Grade\nFROM tblStudents;\n\n-- Select with a condition\nSELECT Name, Surname\nFROM tblStudents\nWHERE Grade = 11;\n\n-- Select with ordering\nSELECT Name, Surname, Mark\nFROM tblStudents\nORDER BY Mark DESC;\n```"),
  t(2, "### WHERE Clause Operators\n\n| Operator | Meaning | Example |\n|----------|---------|--------|\n| `=` | Equal to | `WHERE Grade = 11` |\n| `<>` or `!=` | Not equal to | `WHERE Status <> 'Absent'` |\n| `>`, `<`, `>=`, `<=` | Comparison | `WHERE Mark >= 50` |\n| `BETWEEN` | Range (inclusive) | `WHERE Mark BETWEEN 50 AND 100` |\n| `LIKE` | Pattern matching | `WHERE Name LIKE 'S%'` (starts with S) |\n| `IN` | Matches any in a list | `WHERE Grade IN (10, 11, 12)` |\n| `IS NULL` | Checks for NULL | `WHERE Phone IS NULL` |\n| `IS NOT NULL` | Checks for non-NULL | `WHERE Email IS NOT NULL` |\n| `AND` | Both conditions true | `WHERE Grade = 11 AND Mark >= 50` |\n| `OR` | Either condition true | `WHERE Grade = 10 OR Grade = 11` |\n| `NOT` | Negates a condition | `WHERE NOT Grade = 12` |\n\n**LIKE wildcards:**\n- `%` = any number of characters: `'S%'` matches Sipho, Sarah, Sam\n- `_` = exactly one character: `'_a%'` matches Sam, Jan (second letter is a)"),
  q(3, 'Which SQL query finds all students whose surname starts with \"M\" and who are in Grade 11?',
    ['SELECT * FROM tblStudents WHERE Surname LIKE \"M%\" AND Grade = 11', 'SELECT * FROM tblStudents WHERE Surname = \"M\" AND Grade = 11', 'SELECT * FROM tblStudents WHERE Surname LIKE \"M\" OR Grade = 11', 'SELECT * FROM tblStudents WHERE Surname LIKE \"%M\" AND Grade = 11'], 0,
    'LIKE \"M%\" matches any surname starting with M (% means any characters after). AND ensures both conditions must be true.'),
  t(4, "### Aggregate Functions\n\nAggregate functions perform calculations on a set of values and return a single result.\n\n| Function | Purpose | Example |\n|----------|---------|--------|\n| `COUNT(*)` | Counts rows | `SELECT COUNT(*) FROM tblStudents` |\n| `SUM(col)` | Adds all values | `SELECT SUM(Amount) FROM tblPayments` |\n| `AVG(col)` | Calculates average | `SELECT AVG(Mark) FROM tblMarks` |\n| `MIN(col)` | Finds minimum | `SELECT MIN(Mark) FROM tblMarks` |\n| `MAX(col)` | Finds maximum | `SELECT MAX(Mark) FROM tblMarks` |\n\n### GROUP BY and HAVING\n\n```sql\n-- Average mark per subject\nSELECT Subject, AVG(Mark) AS AverageMark\nFROM tblMarks\nGROUP BY Subject;\n\n-- Only show subjects with average above 60\nSELECT Subject, AVG(Mark) AS AverageMark\nFROM tblMarks\nGROUP BY Subject\nHAVING AVG(Mark) > 60;\n```\n\n**Key rule:** `WHERE` filters individual rows BEFORE grouping. `HAVING` filters groups AFTER grouping."),
  fb(5, 'The ___ clause filters rows before grouping, while the ___ clause filters groups after aggregation.',
    ['WHERE', 'HAVING'],
    'WHERE operates on individual rows before GROUP BY. HAVING operates on the grouped/aggregated results.'),
  q(6, 'Which SQL query returns the total number of students in each grade?',
    ['SELECT Grade, COUNT(*) FROM tblStudents GROUP BY Grade', 'SELECT Grade, COUNT(*) FROM tblStudents', 'SELECT COUNT(*) FROM tblStudents WHERE Grade', 'SELECT Grade, SUM(*) FROM tblStudents GROUP BY Grade'], 0,
    'COUNT(*) counts rows, and GROUP BY Grade groups the results by grade. Without GROUP BY, you get only one total count.'),
  t(7, "### INSERT, UPDATE, DELETE\n\n**INSERT \u2014 Add a new record:**\n```sql\nINSERT INTO tblStudents (Name, Surname, Grade)\nVALUES ('Thabo', 'Nkosi', 11);\n```\n\n**UPDATE \u2014 Modify existing records:**\n```sql\n-- Update one student s grade\nUPDATE tblStudents\nSET Grade = 12\nWHERE StudentID = 15;\n\n-- Increase all marks by 5 (dangerous without WHERE!)\nUPDATE tblMarks\nSET Mark = Mark + 5\nWHERE Subject = 'Maths';\n```\n\n**DELETE \u2014 Remove records:**\n```sql\n-- Delete a specific student\nDELETE FROM tblStudents\nWHERE StudentID = 15;\n\n-- Delete all students with no grade (careful!)\nDELETE FROM tblStudents\nWHERE Grade IS NULL;\n```\n\n**WARNING:** `UPDATE` and `DELETE` without a `WHERE` clause affect ALL rows in the table! Always include a `WHERE` clause to target specific records."),
  q(8, 'What happens if you execute DELETE FROM tblStudents without a WHERE clause?',
    ['All records in the table are deleted', 'Only the first record is deleted', 'Nothing happens', 'An error is thrown'], 0,
    'DELETE without WHERE deletes every row in the table. This is one of the most dangerous SQL mistakes. Always include a WHERE clause to target specific records.'),
];

// Lesson 10.2: Connecting Delphi to Databases
blockNum = 0;
const ch10_lesson2 = [
  t(1, "## Connecting Delphi to a Database\n\nDelphi uses **ADO (ActiveX Data Objects)** components to connect to databases.\n\n### Required Components\n\n| Component | Purpose |\n|-----------|--------|\n| **TADOConnection** | Establishes the connection to the database |\n| **TADOQuery** | Executes SQL queries |\n| **TADOTable** | Accesses a table directly (without SQL) |\n| **TDataSource** | Links data components to visual controls |\n| **TDBGrid** | Displays data in a grid (table format) |\n| **TDBNavigator** | Navigation buttons (First, Previous, Next, Last, Add, Delete) |\n\n### Setting Up a Connection\n\n```pascal\n// Set the connection string (typically done at design time)\nADOConnection1.ConnectionString :=\n  'Provider=Microsoft.Jet.OLEDB.4.0;' +\n  'Data Source=school.mdb;' +\n  'Persist Security Info=False';\nADOConnection1.LoginPrompt := False;\nADOConnection1.Connected := True;\n\n// Link the query to the connection\nADOQuery1.Connection := ADOConnection1;\n```"),
  t(2, "### Executing SQL Queries in Delphi\n\n**For SELECT (returns data):**\n```pascal\nprocedure TForm1.btnSearchClick(Sender: TObject);\nbegin\n  ADOQuery1.Close;\n  ADOQuery1.SQL.Clear;\n  ADOQuery1.SQL.Add('SELECT * FROM tblStudents');\n  ADOQuery1.SQL.Add('WHERE Grade = 11');\n  ADOQuery1.SQL.Add('ORDER BY Surname');\n  ADOQuery1.Open;  // Open for SELECT\nend;\n```\n\n**For INSERT/UPDATE/DELETE (modifies data):**\n```pascal\nprocedure TForm1.btnDeleteClick(Sender: TObject);\nvar\n  sID: string;\nbegin\n  sID := edtID.Text;\n  ADOQuery1.Close;\n  ADOQuery1.SQL.Clear;\n  ADOQuery1.SQL.Add('DELETE FROM tblStudents');\n  ADOQuery1.SQL.Add('WHERE StudentID = ' + sID);\n  ADOQuery1.ExecSQL;  // ExecSQL for INSERT/UPDATE/DELETE\nend;\n```\n\n**Key difference:**\n- `ADOQuery1.Open` \u2014 for SELECT queries (returns a result set)\n- `ADOQuery1.ExecSQL` \u2014 for INSERT, UPDATE, DELETE (modifies data)"),
  q(3, 'Which method should you use to execute a DELETE query in Delphi?',
    ['ExecSQL', 'Open', 'Close', 'SQL.Add'], 0,
    'ExecSQL is used for SQL statements that modify data (INSERT, UPDATE, DELETE). Open is used for SELECT queries that return a result set.'),
  t(4, "### Accessing Records from a Query Result\n\n**Using FieldByName:**\n```pascal\n// After ADOQuery1.Open\nvar\n  sName: string;\n  iMark: integer;\nbegin\n  sName := ADOQuery1.FieldByName('Name').AsString;\n  iMark := ADOQuery1.FieldByName('Mark').AsInteger;\n  ShowMessage(sName + ': ' + IntToStr(iMark));\nend;\n```\n\n**Looping through all records:**\n```pascal\nvar\n  sOutput: string;\nbegin\n  ADOQuery1.First;  // Go to first record\n  sOutput := '';\n  while not ADOQuery1.Eof do\n  begin\n    sOutput := sOutput +\n      ADOQuery1.FieldByName('Name').AsString + ' - ' +\n      ADOQuery1.FieldByName('Mark').AsString + #13;\n    ADOQuery1.Next;  // Move to next record\n  end;\n  ShowMessage(sOutput);\nend;\n```\n\n**Navigation methods:**\n- `First` \u2014 move to the first record\n- `Last` \u2014 move to the last record\n- `Next` \u2014 move to the next record\n- `Prior` \u2014 move to the previous record\n- `Eof` \u2014 True if past the last record\n- `Bof` \u2014 True if before the first record"),
  fb(5, 'To read a field value from a query result, use the ___ method. To check if you have passed the last record, use the ___ property.',
    ['FieldByName', 'Eof'],
    'FieldByName accesses a specific column by name and can return .AsString, .AsInteger, etc. Eof (End of File) is True when there are no more records.'),
  t(6, "### Simple Database Transactions in Delphi\n\n**Adding a new student:**\n```pascal\nprocedure TForm1.btnAddClick(Sender: TObject);\nvar\n  sName, sSurname: string;\n  iGrade: integer;\nbegin\n  sName := edtName.Text;\n  sSurname := edtSurname.Text;\n  iGrade := StrToInt(edtGrade.Text);\n\n  ADOQuery1.Close;\n  ADOQuery1.SQL.Clear;\n  ADOQuery1.SQL.Add('INSERT INTO tblStudents (Name, Surname, Grade)');\n  ADOQuery1.SQL.Add('VALUES (\"' + sName + '\", \"' +\n    sSurname + '\", ' + IntToStr(iGrade) + ')');\n  ADOQuery1.ExecSQL;\n\n  ShowMessage('Student added successfully!');\n\n  // Refresh the grid\n  ADOQuery1.Close;\n  ADOQuery1.SQL.Clear;\n  ADOQuery1.SQL.Add('SELECT * FROM tblStudents ORDER BY Surname');\n  ADOQuery1.Open;\nend;\n```\n\n**Note:** In real applications, you should use **parameterised queries** to prevent SQL injection. This will be covered in Grade 12."),
  q(7, 'Why is it important to refresh the grid (re-run the SELECT query) after an INSERT operation?',
    ['So the new record appears in the displayed data', 'To prevent errors', 'Because INSERT deletes existing records', 'It is not necessary'], 0,
    'After modifying data with INSERT, UPDATE, or DELETE, the grid still shows the old data. Re-running the SELECT query refreshes the display to include the changes.'),
  t(8, "### Updating and Deleting Records\n\n**Updating a record:**\n```pascal\nprocedure TForm1.btnUpdateClick(Sender: TObject);\nvar\n  sID, sNewGrade: string;\nbegin\n  sID := edtID.Text;\n  sNewGrade := edtNewGrade.Text;\n\n  ADOQuery1.Close;\n  ADOQuery1.SQL.Clear;\n  ADOQuery1.SQL.Add('UPDATE tblStudents');\n  ADOQuery1.SQL.Add('SET Grade = ' + sNewGrade);\n  ADOQuery1.SQL.Add('WHERE StudentID = ' + sID);\n  ADOQuery1.ExecSQL;\n\n  ShowMessage('Record updated!');\nend;\n```\n\n**Deleting a record with confirmation:**\n```pascal\nprocedure TForm1.btnDeleteClick(Sender: TObject);\nvar\n  sID: string;\nbegin\n  sID := edtID.Text;\n  if MessageDlg('Delete this student?',\n    mtConfirmation, [mbYes, mbNo], 0) = mrYes then\n  begin\n    ADOQuery1.Close;\n    ADOQuery1.SQL.Clear;\n    ADOQuery1.SQL.Add('DELETE FROM tblStudents');\n    ADOQuery1.SQL.Add('WHERE StudentID = ' + sID);\n    ADOQuery1.ExecSQL;\n    ShowMessage('Record deleted.');\n  end;\nend;\n```\n\n**Always confirm before deleting!** Use `MessageDlg` to ask the user before permanently removing data."),
  q(9, 'What is the purpose of using MessageDlg before a DELETE operation?',
    ['To confirm with the user before permanently removing data', 'To display the deleted record', 'To prevent SQL errors', 'To speed up the deletion'], 0,
    'MessageDlg asks the user to confirm the action. This prevents accidental deletion of records, which could cause data loss.'),
  fb(10, 'For SELECT queries, use ADOQuery1.___. For INSERT, UPDATE, and DELETE queries, use ADOQuery1.___.',
    ['Open', 'ExecSQL'],
    'Open retrieves data into a result set for display. ExecSQL executes data modification statements without returning a result set.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 11: User-Defined Methods (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 11.1: Procedures and Functions
blockNum = 0;
const ch11_lesson1 = [
  t(1, "## User-Defined Methods\n\nA **method** is a named block of code that performs a specific task. In Delphi, methods are either **procedures** (no return value) or **functions** (return a value).\n\n### Why Use Methods?\n\n- **Code reuse:** Write once, call many times\n- **Modularity:** Break complex problems into manageable parts\n- **Readability:** Main code is cleaner and easier to follow\n- **Maintainability:** Fix a bug in one place, fixed everywhere\n- **Testing:** Test individual methods independently\n\n### Procedures\n\nA procedure performs an action but does NOT return a value.\n\n```pascal\nprocedure DisplayGreeting(sName: string);\nbegin\n  ShowMessage('Hello, ' + sName + '!');\nend;\n\n// Calling the procedure:\nDisplayGreeting('Sipho');  // Shows: Hello, Sipho!\nDisplayGreeting('Naledi'); // Shows: Hello, Naledi!\n```"),
  t(2, "### Functions\n\nA function performs a task and RETURNS a value.\n\n```pascal\nfunction CalculateAverage(iTotal, iCount: integer): real;\nbegin\n  if iCount > 0 then\n    Result := iTotal / iCount\n  else\n    Result := 0;\nend;\n\n// Calling the function:\nvar\n  rAvg: real;\nbegin\n  rAvg := CalculateAverage(450, 6);\n  ShowMessage('Average: ' + FloatToStrF(rAvg, ffFixed, 10, 2));\n  // Shows: Average: 75.00\nend;\n```\n\n**Key difference:**\n- **Procedure:** Does something (displays, modifies) \u2014 no return value\n- **Function:** Calculates and RETURNS a value using `Result :=`\n\n```pascal\n// More function examples:\nfunction IsPass(iMark: integer): boolean;\nbegin\n  Result := iMark >= 50;\nend;\n\nfunction GetGrade(iMark: integer): string;\nbegin\n  if iMark >= 80 then Result := 'A'\n  else if iMark >= 70 then Result := 'B'\n  else if iMark >= 60 then Result := 'C'\n  else if iMark >= 50 then Result := 'D'\n  else Result := 'F';\nend;\n```"),
  q(3, 'What is the key difference between a procedure and a function in Delphi?',
    ['A function returns a value; a procedure does not', 'A procedure is faster', 'Functions cannot accept parameters', 'Procedures can only be called once'], 0,
    'The fundamental difference is that a function returns a value (using Result :=), while a procedure performs an action without returning a value.'),
  fb(4, 'A method that returns a value is called a ___. A method that performs an action without returning a value is called a ___.',
    ['function', 'procedure'],
    'Functions return values (used in expressions, assignments). Procedures execute actions (display messages, modify variables).'),
  t(5, "## Parameter Passing\n\n### Value Parameters (Pass by Value)\n\nThe default. A COPY of the value is passed. Changes inside the method do NOT affect the original variable.\n\n```pascal\nprocedure DoubleValue(iNum: integer);\nbegin\n  iNum := iNum * 2;  // Only changes the local copy\nend;\n\nvar\n  x: integer;\nbegin\n  x := 5;\n  DoubleValue(x);\n  ShowMessage(IntToStr(x));  // Still shows 5!\nend;\n```\n\n### Reference Parameters (Pass by Reference)\n\nThe `var` keyword passes the actual variable. Changes inside the method DO affect the original.\n\n```pascal\nprocedure DoubleValue(var iNum: integer);\nbegin\n  iNum := iNum * 2;  // Changes the original variable\nend;\n\nvar\n  x: integer;\nbegin\n  x := 5;\n  DoubleValue(x);\n  ShowMessage(IntToStr(x));  // Shows 10!\nend;\n```\n\n**The only difference is the `var` keyword in the parameter declaration.**"),
  q(6, 'After calling DoubleValue(x) where x = 5, what is the value of x if the parameter is passed by value (no var keyword)?',
    ['5 (unchanged)', '10', '0', 'An error occurs'], 0,
    'With pass by value, only a copy of x is modified inside the procedure. The original x remains 5.'),
  t(7, "### When to Use Value vs Reference Parameters\n\n| Scenario | Use | Reason |\n|----------|-----|--------|\n| Input only (method reads but does not change) | **Value** | Protects the original |\n| Method needs to modify the original variable | **Reference (var)** | Changes propagate back |\n| Returning multiple values | **Reference (var)** | Functions can only return one value |\n| Large data (arrays, objects) | **Reference (var or const)** | Avoids copying large amounts of data |\n\n**The `const` keyword** \u2014 a read-only reference parameter:\n```pascal\nprocedure PrintName(const sName: string);\nbegin\n  ShowMessage(sName);\n  // sName := 'test';  // ERROR! Cannot modify a const parameter\nend;\n```\n\n`const` passes by reference (no copy) but prevents modification. Best for large read-only parameters like strings and arrays."),
  fb(8, 'Pass by ___ sends a copy of the value, protecting the original. Pass by ___ (using the var keyword) sends the actual variable, allowing the method to modify it.',
    ['value', 'reference'],
    'Value parameters create a copy (safe, original unchanged). Reference parameters (var) give direct access to the original variable.'),
  t(9, "### Practical Examples\n\n**Function with multiple calculations:**\n```pascal\nfunction CalculateDiscount(rPrice: real;\n  iQty: integer): real;\nvar\n  rTotal, rDiscount: real;\nbegin\n  rTotal := rPrice * iQty;\n  if rTotal > 1000 then\n    rDiscount := rTotal * 0.10  // 10% discount\n  else if rTotal > 500 then\n    rDiscount := rTotal * 0.05  // 5% discount\n  else\n    rDiscount := 0;\n  Result := rTotal - rDiscount;\nend;\n```\n\n**Procedure that modifies multiple values via var parameters:**\n```pascal\nprocedure SwapValues(var iA, iB: integer);\nvar\n  iTemp: integer;\nbegin\n  iTemp := iA;\n  iA := iB;\n  iB := iTemp;\nend;\n\n// Usage:\nvar\n  x, y: integer;\nbegin\n  x := 10; y := 20;\n  SwapValues(x, y);\n  // Now x = 20, y = 10\nend;\n```"),
  q(10, 'Why does the SwapValues procedure need var parameters?',
    ['Because it needs to modify the original variables, not copies', 'Because integers cannot be passed by value', 'Because Delphi requires var for all parameters', 'To make the procedure run faster'], 0,
    'Without var, SwapValues would only swap copies of the values, leaving the original variables unchanged. var parameters ensure the actual variables are modified.'),
];

// Lesson 11.2: Advanced Method Concepts
blockNum = 0;
const ch11_lesson2 = [
  t(1, "## Scope and Lifetime of Variables\n\n### Local Variables\n\nDeclared inside a method. Only accessible within that method. Created when the method is called and destroyed when it ends.\n\n```pascal\nprocedure CalculateArea;\nvar\n  iLength, iWidth, iArea: integer;  // local variables\nbegin\n  iLength := 10;\n  iWidth := 5;\n  iArea := iLength * iWidth;\n  ShowMessage(IntToStr(iArea));\nend;\n// iLength, iWidth, iArea no longer exist here\n```\n\n### Global Variables\n\nDeclared at the top of the unit (outside any method). Accessible from any method in the unit. Exist for the entire program runtime.\n\n```pascal\nvar\n  iTotalStudents: integer;  // global variable\n\nprocedure AddStudent;\nbegin\n  Inc(iTotalStudents);  // accessible from any method\nend;\n\nprocedure ShowTotal;\nbegin\n  ShowMessage(IntToStr(iTotalStudents));\nend;\n```\n\n**Best practice:** Minimise global variables. Pass data through parameters instead. Global variables make code harder to test and debug."),
  t(2, "### Overloading Methods\n\nDelphi allows multiple methods with the same name but different parameter lists. This is called **overloading**.\n\n```pascal\nfunction FormatOutput(iValue: integer): string; overload;\nbegin\n  Result := IntToStr(iValue);\nend;\n\nfunction FormatOutput(rValue: real): string; overload;\nbegin\n  Result := FloatToStrF(rValue, ffFixed, 10, 2);\nend;\n\nfunction FormatOutput(sValue: string): string; overload;\nbegin\n  Result := UpperCase(sValue);\nend;\n\n// Usage:\nShowMessage(FormatOutput(42));       // Calls integer version: '42'\nShowMessage(FormatOutput(3.14));     // Calls real version: '3.14'\nShowMessage(FormatOutput('hello'));  // Calls string version: 'HELLO'\n```\n\nDelphi determines which version to call based on the argument types at compile time."),
  q(3, 'What is method overloading?',
    ['Having multiple methods with the same name but different parameter types or counts', 'Having a method call itself', 'Declaring a method inside another method', 'Using a method more than once in a program'], 0,
    'Overloading allows multiple versions of a method with the same name. The compiler selects the correct version based on the arguments passed.'),
  t(4, "### Returning Arrays from Functions\n\nDelphi requires a type declaration for array return types:\n\n```pascal\ntype\n  TIntArray = array of integer;\n\nfunction GetEvenNumbers(iMax: integer): TIntArray;\nvar\n  i, iCount: integer;\nbegin\n  iCount := 0;\n  SetLength(Result, iMax div 2);\n  for i := 1 to iMax do\n    if i mod 2 = 0 then\n    begin\n      Result[iCount] := i;\n      Inc(iCount);\n    end;\n  SetLength(Result, iCount);  // Trim to actual size\nend;\n\n// Usage:\nvar\n  arrEvens: TIntArray;\n  i: integer;\nbegin\n  arrEvens := GetEvenNumbers(20);\n  for i := Low(arrEvens) to High(arrEvens) do\n    memOutput.Lines.Add(IntToStr(arrEvens[i]));\nend;\n```\n\n**Dynamic arrays** (declared with `array of type`) can change size using `SetLength`. Unlike static arrays (e.g. `array[1..10]`), dynamic arrays are zero-indexed and resizable."),
  fb(5, 'Variables declared inside a method are called ___ variables and only exist while the method is executing. Variables declared outside all methods are called ___ variables.',
    ['local', 'global'],
    'Local variables have limited scope (inside the method). Global variables are accessible throughout the unit but should be used sparingly.'),
  t(6, "### Practical Application: Building a Complete Solution\n\n**Problem:** Create a program that reads student marks, calculates statistics, and generates a report.\n\n**Using methods for modularity:**\n\n```pascal\n// Function: Calculate average\nfunction CalcAverage(arrMarks: array of integer;\n  iCount: integer): real;\nvar\n  i, iSum: integer;\nbegin\n  iSum := 0;\n  for i := 0 to iCount - 1 do\n    iSum := iSum + arrMarks[i];\n  if iCount > 0 then\n    Result := iSum / iCount\n  else\n    Result := 0;\nend;\n\n// Function: Find highest mark\nfunction FindMax(arrMarks: array of integer;\n  iCount: integer): integer;\nvar\n  i: integer;\nbegin\n  Result := arrMarks[0];\n  for i := 1 to iCount - 1 do\n    if arrMarks[i] > Result then\n      Result := arrMarks[i];\nend;\n\n// Procedure: Count passes and fails\nprocedure CountResults(arrMarks: array of integer;\n  iCount: integer; var iPass, iFail: integer);\nvar\n  i: integer;\nbegin\n  iPass := 0;\n  iFail := 0;\n  for i := 0 to iCount - 1 do\n    if arrMarks[i] >= 50 then\n      Inc(iPass)\n    else\n      Inc(iFail);\nend;\n```"),
  q(7, 'In the CountResults procedure, why are iPass and iFail declared as var parameters?',
    ['Because the procedure needs to return two values to the caller', 'Because integers must always be passed by reference', 'To make the procedure run faster', 'Because they are global variables'], 0,
    'Since a procedure cannot return a value (and a function can return only one), var parameters allow CountResults to send back both iPass and iFail to the calling code.'),
  t(8, "### Method Design Tips\n\n**Good method design:**\n\n1. **Single responsibility:** Each method should do ONE thing well\n2. **Descriptive names:** `CalculateAverage` not `DoStuff` or `Proc1`\n3. **Reasonable parameter count:** If you need more than 4-5 parameters, consider using a record type\n4. **Validate input:** Check parameters before processing\n5. **Consistent return types:** Functions should return meaningful values\n\n**Example of input validation:**\n```pascal\nfunction SafeDivide(rNumerator, rDenominator: real): real;\nbegin\n  if rDenominator = 0 then\n  begin\n    ShowMessage('Error: Division by zero');\n    Result := 0;\n  end\n  else\n    Result := rNumerator / rDenominator;\nend;\n```\n\n**When to use a procedure vs function:**\n- Use a **function** when you need to return a calculated value\n- Use a **procedure** when you need to perform an action (display, save, modify)\n- Use **var parameters** when you need to return multiple values"),
  q(9, 'Which of the following is the best method name?',
    ['CalculateStudentAverage', 'DoIt', 'Proc1', 'x'], 0,
    'Good method names clearly describe what the method does. CalculateStudentAverage immediately tells the reader its purpose. Vague names like DoIt or Proc1 make code harder to understand.'),
  fb(10, 'A method should follow the ___ responsibility principle, meaning it should do one thing well. When a method needs to return multiple values, use ___ parameters.',
    ['single', 'var'],
    'Single responsibility keeps methods focused and testable. Var (reference) parameters allow passing back multiple results from a single method call.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 12: Revision (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch12_lesson1 = [
  t(1, "## Grade 11 IT Revision \u2014 Paper 1 (Theory)\n\n### Systems Technologies Summary\n\n**CPU:** ALU (calculations), Control Unit (coordination), Registers (fast storage), Cache (L1/L2/L3).\n**Performance factors:** Clock speed (GHz), cores, cache size, bus speed, word size (32/64-bit).\n**Memory:** RAM (volatile, DRAM/SRAM, DDR4/DDR5), cache (L1 > L2 > L3 speed), virtual memory (swap file on disk).\n**OS types:** Desktop, mobile, server, embedded, real-time. Open source vs proprietary.\n**Hardware choices:** Size, cost, platform, purpose, expandability, compatibility."),
  t(2, "### Networks Summary\n\n**Wireless:** Wi-Fi (LAN, 30-50m), WiMAX (50km), 4G LTE (100-300 Mbps), 5G (1-10 Gbps, low latency).\n**Data transmission:** Simplex, half-duplex, full-duplex. Serial vs parallel. Bandwidth vs throughput.\n**VoIP:** Voice over internet. Cheap, needs reliable internet.\n**Internet/Intranet/Extranet:** Public / private / extended private. VPN: encrypted tunnel over public network.\n**Location-based computing:** GPS, cell triangulation, Wi-Fi positioning, Bluetooth beacons. Privacy concerns."),
  t(3, "### Social Implications Summary\n\n**Threats:** Physical (theft, fire), hardware (failure, overheating), network (viruses, ransomware, phishing, DDoS, social engineering).\n**Remedies:** Antivirus, firewall, strong passwords, 2FA, encryption, backups (3-2-1 rule), user education.\n**Social issues:** Digital divide, health (RSI, eye strain, ergonomics), cyberbullying.\n**Ethical/Legal:** Copyright, piracy, plagiarism, open source. POPIA (data protection). Capabilities and limitations of ICTs."),
  q(4, 'Which of the following correctly describes the 3-2-1 backup rule?',
    ['3 copies of data, on 2 different media types, with 1 copy stored offsite', '3 backups per day, 2 copies on cloud, 1 on USB', 'Back up every 3 hours on 2 drives with 1 password', 'Use 3 antivirus programs on 2 computers with 1 firewall'], 0,
    'The 3-2-1 rule: 3 total copies of your data, stored on 2 different types of media, with 1 copy kept offsite (or in the cloud) for disaster recovery.'),
  t(5, "### Electronic Communication Summary\n\n**Protocols:** HTTP/HTTPS, FTP/SFTP, SMTP (send email), POP3 (download email), IMAP (sync email), TCP/IP, DNS, DHCP.\n**Encryption:** Symmetric (same key) vs asymmetric (public/private key pair). End-to-end encryption.\n**Digital certificates:** Verify website identity. SSL/TLS encrypts browser-server communication.\n**Mobile technology:** Tethering, SIM vs eSIM, NFC, sensors."),
  t(6, "### Programming Summary\n\n**Arrays:** Fixed-size, same data type, indexed. Algorithms: sum, average, max, min, count.\n**Loops:** For (known count), while (pre-test, may not execute), repeat-until (post-test, executes at least once). Nested loops: total = outer x inner.\n**Searching:** Linear O(n) on any array. Binary O(log n) on sorted arrays only.\n**Sorting:** Bubble sort (adjacent swaps). Selection sort (find min, place it). Both O(n squared).\n**Strings:** Length, Copy, Pos, Insert, Delete, UpperCase, LowerCase, Trim. Character: Ord, Chr.\n**Date/Time:** Now, Date, Time, FormatDateTime, DaysBetween."),
  q(7, 'Which searching algorithm requires the data to be sorted?',
    ['Binary search', 'Linear search', 'Both', 'Neither'], 0,
    'Binary search divides the search space in half each step, which only works if the data is sorted. Linear search works on any data, sorted or not.'),
  t(8, "### Database and SQL Summary\n\n**DBMS:** Software that manages databases. Data vs information vs knowledge.\n**Database types:** Flat-file (single table), relational (linked tables), NoSQL, cloud.\n**Design:** Entities, attributes, relationships, ERDs, keys (primary, foreign, composite), normalisation (1NF, 2NF, 3NF).\n**SQL:** SELECT (with WHERE, ORDER BY, LIKE, BETWEEN, IN, IS NULL), aggregate functions (COUNT, SUM, AVG, MIN, MAX), GROUP BY, HAVING, INSERT, UPDATE, DELETE.\n**Delphi + DB:** ADOConnection, ADOQuery. Open for SELECT, ExecSQL for DML. FieldByName for reading values."),
  t(9, "### Methods and File Handling Summary\n\n**Procedures:** No return value. **Functions:** Return a value (Result :=).\n**Parameters:** Value (copy, original unchanged), reference (var, original modified), const (read-only reference).\n**Scope:** Local (inside method) vs global (unit-wide). Minimise globals.\n**Overloading:** Same name, different parameters.\n**File handling:** AssignFile, Reset (read), Rewrite (create/overwrite), Append (add to end), Readln, Writeln, Eof, CloseFile.\n**Exception handling:** try..except (catch errors), try..finally (ensure cleanup). FileExists to check before opening.\n**Software engineering:** SDLC (analysis, design, implementation, testing, documentation, maintenance). Testing types: unit, integration, system, acceptance. Test data: normal, boundary, extreme, abnormal."),
  fb(10, 'In Delphi, use ___ to open a query that returns data (SELECT) and ___ to execute a query that modifies data (INSERT/UPDATE/DELETE).',
    ['Open', 'ExecSQL'],
    'ADOQuery.Open executes SELECT and returns a result set. ADOQuery.ExecSQL executes INSERT, UPDATE, or DELETE and returns no data.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Insert into MongoDB
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Find or create IT subject
  const subjectDoc = await db.collection('subjects').findOne({ name: /Information Technology/i });
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
      title: 'Chapter 1: Systems Technologies',
      description: 'Motherboard components, CPU architecture (CISC vs RISC), fetch-decode-execute cycle, types of OS, hardware choices (size, cost, platform), memory (RAM, cache, virtual memory), and computer performance factors.',
      order: 1,
      lessons: [
        { title: 'Motherboard Components and CPU', description: 'Motherboard components, CPU architecture, fetch-decode-execute cycle, ALU, registers, cache, clock speed, cores, CISC vs RISC.', blocks: ch1_lesson1, term: 1 },
        { title: 'Operating Systems, Memory, and Hardware Choices', description: 'Types of OS, open source vs proprietary, RAM (DRAM, SRAM, DDR), cache levels, virtual memory, thrashing, and hardware selection factors.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Solution Development \u2014 Programming Basics',
      description: 'Arrays (1D), loops (for, while, repeat-until), nested loops, searching (linear, binary), sorting (bubble, selection), and algorithmic thinking.',
      order: 2,
      lessons: [
        { title: 'Arrays, Loops, and Nested Loops', description: 'One-dimensional arrays, for/while/repeat-until loops, nested loops, array algorithms (sum, average, max, min, count).', blocks: ch2_lesson1, term: 1 },
        { title: 'Searching and Sorting Algorithms', description: 'Linear search O(n), binary search O(log n), bubble sort, selection sort, algorithm comparison and tracing.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: Networks',
      description: 'Wireless technologies (Wi-Fi, WiMAX, 5G, LTE), data transmission, VoIP, internet vs intranet vs extranet, VPN, and location-based computing.',
      order: 3,
      lessons: [
        { title: 'Wireless Technologies and Data Transmission', description: 'Wi-Fi standards, WiMAX, 4G LTE vs 5G, bandwidth, throughput, simplex/half-duplex/full-duplex, serial vs parallel, VoIP.', blocks: ch3_lesson1, term: 1 },
        { title: 'Internet, Intranet, Extranet, VPN, and Location-Based Computing', description: 'Internet vs intranet vs extranet, VPN encryption and uses, GPS, cell triangulation, geotagging, privacy concerns.', blocks: ch3_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 4: String Manipulation',
      description: 'String functions (Insert, Delete, Pos, Copy, Length), character operations (Ord, Chr), date/time objects and functions in Delphi.',
      order: 4,
      lessons: [
        { title: 'String Functions, Character Operations, and Date/Time', description: 'Length, Copy, Pos, Insert, Delete, UpperCase, LowerCase, Trim, StringReplace, Ord, Chr, ASCII, reversing strings, counting vowels, date/time functions.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Social Implications',
      description: 'Safety, threats (physical, hardware, network), remedies, social issues (digital divide, health), ethical and legal issues (copyright, POPIA), capabilities and limitations of ICTs.',
      order: 5,
      lessons: [
        { title: 'Safety, Threats, and Remedies', description: 'Physical threats, hardware threats, network threats (malware, phishing, DDoS), remedies (antivirus, firewall, 2FA, encryption, 3-2-1 backups), strong passwords.', blocks: ch5_lesson1, term: 1 },
        { title: 'Social, Ethical, and Legal Issues', description: 'Digital divide, health issues and ergonomics, copyright, piracy, POPIA, data protection, capabilities and limitations of ICTs.', blocks: ch5_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 6: Electronic Communication',
      description: 'Mobile/wireless technology, uses of mobile devices, communication protocols (HTTP, SMTP, POP3, IMAP), data security and encryption.',
      order: 6,
      lessons: [
        { title: 'Mobile Technology, Protocols, and Data Security', description: 'Mobile device features, tethering, SIM vs eSIM, HTTP/HTTPS, FTP, SMTP, POP3, IMAP, TCP/IP, DNS, symmetric vs asymmetric encryption, SSL/TLS, digital certificates.', blocks: ch6_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 7: Text File Handling',
      description: 'Reading and writing text files in Delphi, exception handling (try..except, try..finally), checking file existence, generating text-based reports.',
      order: 7,
      lessons: [
        { title: 'File Operations, Exception Handling, and Reports', description: 'AssignFile, Reset, Rewrite, Append, Readln, Writeln, Eof, CloseFile, try..except, try..finally, FileExists, Format function, generating reports.', blocks: ch7_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 8: Software Engineering',
      description: 'Planning and implementing solutions, SDLC (waterfall, iterative, agile), algorithms, pseudocode, flowcharts, modular design, testing strategies, documentation, maintenance.',
      order: 8,
      lessons: [
        { title: 'SDLC, Planning, Testing, and Documentation', description: 'Software development life cycle, algorithms, pseudocode, flowcharts, modular design, top-down design, testing types, test data, documentation, maintenance types.', blocks: ch8_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 9: Data and Information Management',
      description: 'Database concepts (DBMS), data vs information, database types (flat-file, relational, NoSQL), database-related careers, and database design (ERDs, keys, normalisation).',
      order: 9,
      lessons: [
        { title: 'Database Concepts, Types, Careers, and Design', description: 'DBMS functions, data hierarchy, flat-file vs relational vs NoSQL databases, database careers, design steps, ERDs, keys, constraints.', blocks: ch9_lesson1, term: 2 },
      ],
    },
    {
      title: 'Chapter 10: Solution Development \u2014 Database Programming',
      description: 'SQL basics (SELECT, INSERT, UPDATE, DELETE), WHERE clause, aggregate functions, GROUP BY, HAVING, connecting Delphi to databases, ADO components, accessing records.',
      order: 10,
      lessons: [
        { title: 'SQL: SELECT, Aggregates, INSERT, UPDATE, DELETE', description: 'SELECT with WHERE, LIKE, BETWEEN, IN, IS NULL, ORDER BY. Aggregate functions (COUNT, SUM, AVG, MIN, MAX). GROUP BY, HAVING. INSERT, UPDATE, DELETE.', blocks: ch10_lesson1, term: 2 },
        { title: 'Connecting Delphi to Databases', description: 'ADO components, TADOConnection, TADOQuery, Open vs ExecSQL, FieldByName, navigating records, database transactions in Delphi.', blocks: ch10_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 11: User-Defined Methods',
      description: 'Procedures and functions, parameter passing (value and reference), return values, scope, overloading, and practical applications.',
      order: 11,
      lessons: [
        { title: 'Procedures, Functions, and Parameter Passing', description: 'Procedures vs functions, value vs reference (var) parameters, const parameters, return values, SwapValues example, practical calculations.', blocks: ch11_lesson1, term: 3 },
        { title: 'Advanced Method Concepts', description: 'Local vs global variables, method overloading, dynamic arrays, modular solution design, method design best practices.', blocks: ch11_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 12: Revision',
      description: 'Comprehensive revision of all Grade 11 IT topics: systems technologies, networks, social implications, electronic communication, programming, databases, SQL, methods, and file handling.',
      order: 12,
      lessons: [
        { title: 'Grade 11 IT Comprehensive Revision', description: 'Full revision covering systems technologies, networks, social implications, electronic communication, programming (arrays, sorting, searching), databases, SQL, methods, and file handling.', blocks: ch12_lesson1, term: 4 },
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
    title: 'Grade 11 Information Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Systems Technologies, Programming Basics, Networks, String Manipulation, Social Implications, Electronic Communication, Text File Handling, Software Engineering, Data Management, Database Programming, User-Defined Methods, and Revision for Grade 11 Information Technology.',
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
  console.log('  TEXTBOOK: Grade 11 Information Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
