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

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 1: Database Design (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 1.1: Relational Database Design
blockNum = 0;
const ch1_lesson1 = [
  t(1, "## Relational Database Design\n\nA **relational database** stores data in tables (also called relations) that are linked to each other through common fields.\n\n### Key Terminology\n\n| Term | Definition |\n|------|------------|\n| **Table (Relation)** | A structured collection of related data organised in rows and columns |\n| **Record (Row/Tuple)** | A single entry in a table, e.g. one student |\n| **Field (Column/Attribute)** | A single piece of data stored for each record, e.g. Surname |\n| **Primary Key** | A field (or combination of fields) that uniquely identifies each record |\n| **Foreign Key** | A field in one table that refers to the primary key of another table |\n| **Composite Key** | A primary key made up of two or more fields combined |\n| **Candidate Key** | Any field that could serve as a primary key |"),
  t(2, "### Entity-Relationship Diagrams (ERDs)\n\nAn ERD shows the tables in a database and the relationships between them.\n\n**Relationship types:**\n- **One-to-One (1:1):** Each record in Table A relates to exactly one record in Table B. Example: Each learner has one student number.\n- **One-to-Many (1:M):** One record in Table A can relate to many records in Table B. Example: One teacher teaches many classes.\n- **Many-to-Many (M:M):** Records in both tables can relate to many records in the other. Example: Students enrol in many subjects; each subject has many students.\n\n**Note:** Many-to-many relationships require a **junction table** (also called a bridge or link table) to resolve them into two one-to-many relationships."),
  q(3, 'Which type of relationship exists between a School table and a Learner table?',
    ['One-to-Many', 'One-to-One', 'Many-to-Many', 'No relationship'], 0,
    'One school has many learners, but each learner belongs to one school. This is a one-to-many (1:M) relationship.'),
  t(4, "### Referential Integrity\n\nReferential integrity is a rule that ensures relationships between tables remain consistent.\n\n**Rules:**\n1. A foreign key value must match an existing primary key value in the related table, or be NULL.\n2. You cannot delete a record from a parent table if related records exist in a child table (unless cascading delete is enabled).\n3. You cannot add a record to a child table with a foreign key value that does not exist in the parent table.\n\n**Example:** If a `tblOrders` table has a `CustomerID` foreign key referencing `tblCustomers`, you cannot:\n- Add an order for CustomerID 999 if no customer with that ID exists\n- Delete a customer who still has orders in the system"),
  fb(5, 'A ___ key uniquely identifies each record in a table. A ___ key links one table to another by referencing the primary key of the related table.',
    ['primary', 'foreign'],
    'The primary key is unique per record. The foreign key creates the link between related tables.'),
  t(6, "### Data Types in Databases\n\nChoosing the correct data type for each field is essential for data integrity and storage efficiency.\n\n| Data Type | Use | Example |\n|-----------|-----|--------|\n| **Integer (INT)** | Whole numbers | Age, Quantity |\n| **Real/Float/Double** | Decimal numbers | Price, Average |\n| **Char(n)** | Fixed-length text | ID code (always 13 chars) |\n| **Varchar(n)** | Variable-length text | Name, Address |\n| **Boolean** | True/False values | IsActive, HasPaid |\n| **Date** | Calendar dates | DateOfBirth, EnrolmentDate |\n| **DateTime** | Date and time | OrderTimestamp |\n| **Currency** | Monetary amounts | UnitPrice, TotalCost |\n| **AutoNumber** | Auto-incrementing ID | OrderID, InvoiceNo |\n\n**Tip:** Use `Char` for fields with a fixed length (e.g. SA ID number is always 13 digits). Use `Varchar` when the length varies (e.g. names)."),
  q(7, 'A South African ID number (e.g. 0201015009088) should be stored as which data type?',
    ['Char(13)', 'Integer', 'Varchar(50)', 'AutoNumber'], 0,
    'An SA ID number is always exactly 13 characters. It should be stored as Char(13), not Integer, because it may start with 0 and is not used for calculations.'),
  t(8, "### Data Validation and Verification\n\n**Validation** ensures data meets certain rules before it is accepted:\n- **Range check:** Value must be within a specified range (e.g. age between 5 and 100)\n- **Type check:** Ensures correct data type (e.g. only numbers in a phone field)\n- **Presence check:** Field cannot be left empty (NOT NULL)\n- **Format check:** Data must follow a pattern (e.g. email must contain @)\n- **Length check:** Data must be a specific length (e.g. ID number = 13 digits)\n- **Lookup/List check:** Value must be from a predefined list (e.g. Province must be one of the 9 SA provinces)\n\n**Verification** ensures data was entered correctly:\n- **Double entry:** Data is entered twice and compared\n- **Visual check:** The user checks the data on screen before confirming"),
  q(9, 'Which validation check would prevent a user from entering \"abc\" in a Quantity field?',
    ['Type check', 'Range check', 'Length check', 'Presence check'], 0,
    'A type check ensures only numeric values can be entered in a numeric field.'),
  fb(10, 'A check that ensures a value falls between 1 and 100 is called a ___ check. A check that requires a field to be filled in is called a ___ check.',
    ['range', 'presence'],
    'Range check limits values to a specified range. Presence check (NOT NULL) prevents empty fields.'),
];

// Lesson 1.2: Normalisation
blockNum = 0;
const ch1_lesson2 = [
  t(1, "## Normalisation\n\nNormalisation is the process of organising data in a database to reduce **redundancy** (duplicate data) and improve **data integrity**.\n\n### Why Normalise?\n\n| Problem | Description |\n|---------|------------|\n| **Data redundancy** | Same data stored multiple times, wasting space |\n| **Update anomaly** | Changing data in one place but not another leads to inconsistency |\n| **Insert anomaly** | Cannot add data without unrelated data being present |\n| **Delete anomaly** | Deleting a record accidentally removes unrelated data |\n\n### The Normal Forms\n\n- **1NF (First Normal Form):** No repeating groups; each field contains only one value; each record is unique (has a primary key)\n- **2NF (Second Normal Form):** In 1NF + every non-key field depends on the entire primary key (eliminates partial dependency)\n- **3NF (Third Normal Form):** In 2NF + no non-key field depends on another non-key field (eliminates transitive dependency)"),
  t(2, "### Example: Unnormalised to 3NF\n\n**Unnormalised table (UNF):**\n\n| OrderID | Date | CustName | CustPhone | Product1 | Qty1 | Product2 | Qty2 |\n|---------|------|----------|-----------|----------|------|----------|------|\n| 101 | 2025-03-01 | Thabo M. | 082... | Laptop | 1 | Mouse | 2 |\n\n**Problem:** Repeating groups (Product1, Product2). Limited to 2 products per order.\n\n**1NF:** Remove repeating groups. Each product gets its own row.\n\n| OrderID | Date | CustName | CustPhone | Product | Qty |\n|---------|------|----------|-----------|---------|-----|\n| 101 | 2025-03-01 | Thabo M. | 082... | Laptop | 1 |\n| 101 | 2025-03-01 | Thabo M. | 082... | Mouse | 2 |\n\nComposite primary key: (OrderID, Product). Data is still redundant (CustName/CustPhone repeated)."),
  t(3, "### Continuing to 2NF and 3NF\n\n**2NF:** Remove partial dependencies. CustName and CustPhone depend only on OrderID, not on the full composite key (OrderID + Product).\n\n**tblOrders:**\n\n| OrderID (PK) | Date | CustName | CustPhone |\n|-------------|------|----------|----------|\n| 101 | 2025-03-01 | Thabo M. | 082... |\n\n**tblOrderDetails:**\n\n| OrderID (FK) | Product | Qty |\n|-------------|---------|-----|\n| 101 | Laptop | 1 |\n| 101 | Mouse | 2 |\n\n**3NF:** Remove transitive dependencies. CustPhone depends on CustName (not directly on OrderID).\n\n**tblOrders:** OrderID (PK), Date, CustID (FK)\n**tblCustomers:** CustID (PK), CustName, CustPhone\n**tblOrderDetails:** OrderID (FK), ProductID (FK), Qty\n\nNow each piece of data is stored exactly once."),
  q(4, 'A table is in 1NF but a non-key field depends on only part of the composite primary key. Which normal form is violated?',
    ['2NF', '1NF', '3NF', 'None'], 0,
    'Partial dependency (a non-key field depending on part of the composite key) violates Second Normal Form (2NF).'),
  fb(5, 'When a non-key field depends on another non-key field, this is called a ___ dependency and violates ___.',
    ['transitive', '3NF'],
    'Transitive dependency means A depends on B which depends on C. This violates Third Normal Form.'),
  t(6, "### Transaction Processing\n\nA **transaction** is a unit of work performed on a database that must be completed in full or not at all.\n\n**ACID Properties:**\n\n| Property | Meaning |\n|----------|--------|\n| **Atomicity** | All operations in a transaction succeed, or none do (all-or-nothing) |\n| **Consistency** | The database moves from one valid state to another |\n| **Isolation** | Concurrent transactions do not interfere with each other |\n| **Durability** | Once committed, changes are permanent even if the system crashes |\n\n**Example:** Transferring R500 from Account A to Account B:\n1. Deduct R500 from Account A\n2. Add R500 to Account B\n\nIf step 2 fails, step 1 must be rolled back. Both steps must succeed or neither happens."),
  q(7, 'Which ACID property ensures that if a power failure occurs during a bank transfer, the partially completed transfer is rolled back?',
    ['Atomicity', 'Consistency', 'Isolation', 'Durability'], 0,
    'Atomicity ensures that either all parts of a transaction complete successfully, or none of them do. A partial transfer would be rolled back.'),
  t(8, "### Characteristics of Good Database Design\n\n1. **No data redundancy:** Each fact stored only once\n2. **Data integrity:** Accurate and consistent data enforced through constraints\n3. **Referential integrity:** Foreign keys always point to valid records\n4. **Appropriate data types:** Each field uses the most suitable type\n5. **Meaningful field names:** e.g. `DateOfBirth` not `DOB` or `Field3`\n6. **Primary key on every table:** Unique identifier for each record\n7. **Normalised to at least 3NF:** Eliminates redundancy and anomalies\n8. **Input validation:** Rules prevent invalid data entry\n9. **Security:** User access rights, encryption, audit trails"),
  q(9, 'Which of the following is NOT a characteristic of good database design?',
    ['Storing customer names in both the Orders and Customers tables', 'Using appropriate data types for each field', 'Enforcing referential integrity', 'Having a primary key on every table'], 0,
    'Storing the same data in multiple tables is data redundancy, which is the opposite of good database design.'),
  t(10, "### Caring for and Managing Data\n\n**Threats to data:**\n- Hardware failure (hard drive crash)\n- Software bugs or corruption\n- Human error (accidental deletion)\n- Malicious attacks (hacking, ransomware)\n- Natural disasters (fire, flood)\n\n**Protection strategies:**\n- **Regular backups:** Daily, weekly, and offsite/cloud backups\n- **RAID storage:** Redundant disk arrays that survive drive failure\n- **Encryption:** Scrambles data so only authorised users can read it\n- **Access control:** User roles, passwords, and permissions\n- **Audit trails:** Logs showing who accessed or changed data and when\n- **Disaster recovery plan:** Documented steps to restore systems after failure\n\n**Hacking:** Unauthorised access to a computer system. Types include phishing, brute force attacks, SQL injection, and social engineering. Prevented through firewalls, strong passwords, two-factor authentication, and keeping software updated."),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: Object-Oriented Programming (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 2.1: OOP Fundamentals
blockNum = 0;
const ch2_lesson1 = [
  t(1, "## Object-Oriented Programming (OOP)\n\nOOP is a programming paradigm that organises code around **objects** rather than procedures. In Delphi, OOP is central to how programs are built.\n\n### Core Concepts\n\n| Concept | Definition |\n|---------|------------|\n| **Class** | A blueprint or template that defines the attributes (fields) and behaviours (methods) of an object |\n| **Object** | An instance of a class; a specific entity created from the blueprint |\n| **Attribute/Field** | A variable that holds data about the object (e.g. Name, Age) |\n| **Method** | A procedure or function that defines what the object can do |\n| **Encapsulation** | Bundling data and methods together, and hiding internal details from outside code |\n| **Inheritance** | A class can inherit fields and methods from a parent class |\n| **Polymorphism** | Different classes can respond to the same method name in different ways |"),
  t(2, "### Defining a Class in Delphi\n\n```pascal\ntype\n  TLearner = class(TObject)\n  private\n    fName: string;\n    fSurname: string;\n    fAge: integer;\n    fGrade: integer;\n  public\n    constructor Create(sName, sSurname: string; iAge, iGrade: integer);\n    function GetName: string;\n    function GetSurname: string;\n    function GetAge: integer;\n    procedure SetAge(iNewAge: integer);\n    function ToString: string; override;\n  end;\n```\n\n**Key points:**\n- `private` fields are only accessible within the class itself (encapsulation)\n- `public` methods provide controlled access to the private fields\n- `TObject` is the base class that all Delphi classes inherit from\n- The `f` prefix is a Delphi naming convention for private fields"),
  q(3, 'Why are fields (attributes) declared as private in a class?',
    ['To enforce encapsulation and prevent direct external access', 'To make the program run faster', 'Because Delphi requires all fields to be private', 'To save memory'], 0,
    'Declaring fields as private enforces encapsulation. External code must use public methods (getters/setters) to access or modify the data, which allows the class to validate changes.'),
  t(4, "### Constructors\n\nA **constructor** is a special method that initialises an object when it is created.\n\n**Parameterised constructor** (receives values):\n```pascal\nconstructor TLearner.Create(sName, sSurname: string;\n  iAge, iGrade: integer);\nbegin\n  fName := sName;\n  fSurname := sSurname;\n  fAge := iAge;\n  fGrade := iGrade;\nend;\n```\n\n**Non-parameterised (default) constructor:**\n```pascal\nconstructor TLearner.Create;\nbegin\n  fName := \\x27\\x27;\n  fSurname := \\x27\\x27;\n  fAge := 0;\n  fGrade := 0;\nend;\n```\n\n**Creating objects:**\n```pascal\nvar\n  objLearner: TLearner;\nbegin\n  // Using parameterised constructor\n  objLearner := TLearner.Create(\\x27Sipho\\x27, \\x27Dlamini\\x27, 17, 12);\n  \n  // Using default constructor\n  objLearner := TLearner.Create;\nend;\n```"),
  fb(5, 'A constructor that accepts parameters is called a ___ constructor. A constructor that takes no parameters is called a ___ constructor.',
    ['parameterised', 'non-parameterised'],
    'A parameterised constructor receives initial values for the fields. A non-parameterised (default) constructor sets fields to default values.'),
  t(6, "### Accessor and Mutator Methods\n\n**Accessor methods (Getters)** allow reading private field values:\n```pascal\nfunction TLearner.GetName: string;\nbegin\n  Result := fName;\nend;\n\nfunction TLearner.GetAge: integer;\nbegin\n  Result := fAge;\nend;\n```\n\n**Mutator methods (Setters)** allow modifying private field values with validation:\n```pascal\nprocedure TLearner.SetAge(iNewAge: integer);\nbegin\n  if (iNewAge >= 5) and (iNewAge <= 25) then\n    fAge := iNewAge\n  else\n    ShowMessage(\\x27Age must be between 5 and 25\\x27);\nend;\n```\n\n**Why use getters and setters?**\n- **Validation:** Setters can check values before accepting them\n- **Read-only fields:** Provide only a getter, no setter\n- **Flexibility:** Internal representation can change without affecting external code"),
  q(7, 'What is the main advantage of using a mutator (setter) method instead of allowing direct access to a field?',
    ['The setter can validate the new value before storing it', 'Setters use less memory', 'Direct access is not possible in Delphi', 'Setters execute faster than direct assignment'], 0,
    'Mutator methods can include validation logic to ensure only valid data is stored, for example checking that an age is within an acceptable range.'),
  t(8, "### The ToString Method\n\nThe `ToString` method returns a string representation of an object. In Delphi, you override the inherited `ToString` from `TObject`.\n\n```pascal\nfunction TLearner.ToString: string;\nbegin\n  Result := fName + \\x27 \\x27 + fSurname +\n    \\x27 (Age: \\x27 + IntToStr(fAge) +\n    \\x27, Grade: \\x27 + IntToStr(fGrade) + \\x27)\\x27;\nend;\n```\n\n**Usage:**\n```pascal\nvar\n  objLearner: TLearner;\nbegin\n  objLearner := TLearner.Create(\\x27Naledi\\x27, \\x27Mokoena\\x27, 18, 12);\n  ShowMessage(objLearner.ToString);\n  // Output: Naledi Mokoena (Age: 18, Grade: 12)\nend;\n```\n\nThe `override` keyword tells Delphi that this method replaces the inherited version from `TObject`."),
  q(9, 'What does the keyword \"override\" indicate when used with the ToString method?',
    ['The method replaces the inherited version from the parent class', 'The method creates a new, unrelated method', 'The method can only be called once', 'The method is private'], 0,
    'The override keyword indicates that the method replaces (overrides) the inherited version of ToString from the parent class TObject.'),
  fb(10, 'Methods that return field values are called ___ methods. Methods that change field values are called ___ methods.',
    ['accessor', 'mutator'],
    'Accessor (getter) methods read data. Mutator (setter) methods write/change data.'),
];

// Lesson 2.2: Inheritance and Polymorphism
blockNum = 0;
const ch2_lesson2 = [
  t(1, "## Inheritance\n\nInheritance allows a new class (child/subclass) to inherit the fields and methods of an existing class (parent/superclass).\n\n```pascal\ntype\n  TPerson = class(TObject)\n  private\n    fName: string;\n    fSurname: string;\n    fIDNumber: string;\n  public\n    constructor Create(sName, sSurname, sID: string);\n    function GetName: string;\n    function GetSurname: string;\n    function ToString: string; override;\n  end;\n\n  TEmployee = class(TPerson)\n  private\n    fEmployeeNo: string;\n    fSalary: real;\n  public\n    constructor Create(sName, sSurname, sID,\n      sEmpNo: string; rSalary: real);\n    function GetSalary: real;\n    function ToString: string; override;\n  end;\n```\n\n`TEmployee` inherits `fName`, `fSurname`, `fIDNumber`, `GetName`, and `GetSurname` from `TPerson` without rewriting them."),
  t(2, "### Implementing Inherited Constructors\n\nThe child constructor calls the parent constructor using `inherited`:\n\n```pascal\nconstructor TEmployee.Create(sName, sSurname, sID,\n  sEmpNo: string; rSalary: real);\nbegin\n  inherited Create(sName, sSurname, sID);\n  fEmployeeNo := sEmpNo;\n  fSalary := rSalary;\nend;\n```\n\n**Benefits of inheritance:**\n- **Code reuse:** Common fields and methods are written once in the parent\n- **Logical hierarchy:** Reflects real-world relationships (an Employee IS A Person)\n- **Maintainability:** Changes to the parent automatically apply to all children\n- **Extensibility:** New child classes can be added without modifying existing code"),
  q(3, 'In the code above, what does the keyword \"inherited\" do in the TEmployee constructor?',
    ['Calls the constructor of the parent class (TPerson)', 'Creates a copy of the parent object', 'Makes the child class private', 'Deletes the parent object'], 0,
    'The \"inherited\" keyword calls the parent class constructor, passing the shared parameters (sName, sSurname, sID) so the parent can initialise its own fields.'),
  t(4, "## Polymorphism\n\nPolymorphism means \"many forms.\" It allows different classes to respond to the same method call in their own way.\n\n```pascal\nfunction TPerson.ToString: string;\nbegin\n  Result := fName + \\x27 \\x27 + fSurname +\n    \\x27 [ID: \\x27 + fIDNumber + \\x27]\\x27;\nend;\n\nfunction TEmployee.ToString: string;\nbegin\n  Result := inherited ToString +\n    \\x27 | Emp#: \\x27 + fEmployeeNo +\n    \\x27 | Salary: R\\x27 + FloatToStrF(fSalary, ffFixed, 10, 2);\nend;\n```\n\n**Usage demonstrating polymorphism:**\n```pascal\nvar\n  arrPeople: array[1..2] of TPerson;\nbegin\n  arrPeople[1] := TPerson.Create(\\x27Zanele\\x27, \\x27Nkosi\\x27, \\x270103...\\x27);\n  arrPeople[2] := TEmployee.Create(\\x27David\\x27, \\x27Smith\\x27,\n    \\x278507...\\x27, \\x27EMP042\\x27, 35000);\n  \n  // Same method call, different output\n  ShowMessage(arrPeople[1].ToString);\n  // Zanele Nkosi [ID: 0103...]\n  ShowMessage(arrPeople[2].ToString);\n  // David Smith [ID: 8507...] | Emp#: EMP042 | Salary: R35000.00\nend;\n```"),
  q(5, 'What is polymorphism in OOP?',
    ['Different classes respond to the same method name in different ways', 'A class can only have one method', 'All objects must be the same type', 'Methods cannot be overridden'], 0,
    'Polymorphism allows objects of different classes to respond to the same method call (e.g. ToString) with their own specific implementation.'),
  t(6, "### Auxiliary (Helper) Methods\n\nAuxiliary methods are additional methods in a class that perform supporting tasks. They often help other methods do their work.\n\n```pascal\ntype\n  TProduct = class(TObject)\n  private\n    fDescription: string;\n    fCostPrice: real;\n    fMarkupPercent: real;\n    function CalcVAT(rAmount: real): real;  // auxiliary\n  public\n    constructor Create(sDesc: string;\n      rCost, rMarkup: real);\n    function GetSellingPrice: real;\n    function GetPriceInclVAT: real;\n    function ToString: string; override;\n  end;\n\nfunction TProduct.CalcVAT(rAmount: real): real;\nbegin\n  Result := rAmount * 0.15;  // 15% VAT\nend;\n\nfunction TProduct.GetSellingPrice: real;\nbegin\n  Result := fCostPrice * (1 + fMarkupPercent / 100);\nend;\n\nfunction TProduct.GetPriceInclVAT: real;\nvar\n  rSP: real;\nbegin\n  rSP := GetSellingPrice;\n  Result := rSP + CalcVAT(rSP);\nend;\n```\n\n`CalcVAT` is a private auxiliary method used internally by `GetPriceInclVAT`. External code cannot call it directly."),
  q(7, 'Why is the CalcVAT method declared as private?',
    ['It is a helper method used only internally by other methods in the class', 'Private methods run faster', 'Delphi requires all calculations to be private', 'It prevents the VAT rate from changing'], 0,
    'CalcVAT is an auxiliary (helper) method. It is private because it is only needed by other methods within the class, not by external code.'),
  fb(8, 'When a child class replaces a parent method with its own version, this is called ___. The child constructor uses the keyword ___ to call the parent constructor.',
    ['overriding', 'inherited'],
    'Overriding replaces an inherited method with a new implementation. The inherited keyword calls the parent version.'),
  t(9, "### Summary: OOP Concepts at a Glance\n\n| Concept | Description | Delphi Keyword |\n|---------|-------------|----------------|\n| **Class** | Blueprint for objects | `type TMyClass = class` |\n| **Object** | Instance of a class | `obj := TMyClass.Create` |\n| **Encapsulation** | Hiding internal details | `private` / `public` |\n| **Constructor** | Initialises a new object | `constructor Create(...)` |\n| **Accessor** | Returns a field value | `function GetX: type` |\n| **Mutator** | Changes a field value | `procedure SetX(value)` |\n| **Inheritance** | Child extends parent | `TChild = class(TParent)` |\n| **Polymorphism** | Same method, different behaviour | `override` |\n| **ToString** | String representation | `function ToString: string; override` |\n| **Auxiliary** | Internal helper method | Typically `private` |"),
  q(10, 'Which OOP principle is demonstrated when a TEmployee object is stored in a TPerson variable and its ToString method still produces employee-specific output?',
    ['Polymorphism', 'Encapsulation', 'Abstraction', 'Data hiding'], 0,
    'This demonstrates polymorphism: the object responds according to its actual type (TEmployee), not the variable type (TPerson).'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: SQL (Terms 1-2)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 3.1: SELECT Queries
blockNum = 0;
const ch3_lesson1 = [
  t(1, "## SQL: SELECT Queries\n\nSQL (Structured Query Language) is used to communicate with relational databases. The `SELECT` statement retrieves data.\n\n### Basic SELECT Syntax\n\n```sql\nSELECT column1, column2\nFROM tableName\nWHERE condition\nORDER BY column ASC|DESC;\n```\n\n**Examples using a `tblLearners` table:**\n\n```sql\n-- Select all columns for all learners\nSELECT *\nFROM tblLearners;\n\n-- Select specific columns\nSELECT Name, Surname, Grade\nFROM tblLearners;\n\n-- Select with alias\nSELECT Name, Surname, Grade AS GradeLevel\nFROM tblLearners;\n```"),
  t(2, "### Calculated Fields\n\nYou can perform calculations in a SELECT statement:\n\n```sql\n-- Calculate total cost\nSELECT ProductName, Quantity, UnitPrice,\n       Quantity * UnitPrice AS TotalCost\nFROM tblOrderDetails;\n\n-- Calculate VAT-inclusive price\nSELECT ProductName, Price,\n       Price * 1.15 AS PriceInclVAT\nFROM tblProducts;\n\n-- Calculate age from date of birth\nSELECT Name, Surname,\n       YEAR(CURDATE()) - YEAR(DateOfBirth) AS Age\nFROM tblLearners;\n```\n\n### DISTINCT\n\nRemoves duplicate values from results:\n\n```sql\n-- List all unique towns where learners live\nSELECT DISTINCT Town\nFROM tblLearners;\n```"),
  q(3, 'What does the DISTINCT keyword do in a SELECT query?',
    ['Removes duplicate values from the result set', 'Sorts the results in ascending order', 'Limits the number of results returned', 'Selects only numeric fields'], 0,
    'DISTINCT eliminates duplicate rows from the result. For example, if 10 learners live in Pretoria, the town \"Pretoria\" appears only once.'),
  t(4, "### WHERE Clause\n\nThe `WHERE` clause filters records based on conditions.\n\n**Comparison operators:**\n\n| Operator | Meaning | Example |\n|----------|---------|--------|\n| `=` | Equal to | `WHERE Grade = 12` |\n| `<>` or `!=` | Not equal to | `WHERE Province <> 'Gauteng'` |\n| `>` `<` `>=` `<=` | Greater/Less than | `WHERE Age >= 18` |\n| `BETWEEN` | Range (inclusive) | `WHERE Mark BETWEEN 50 AND 75` |\n| `LIKE` | Pattern matching | `WHERE Surname LIKE 'M%'` |\n| `IN` | Match any in a list | `WHERE Town IN ('Durban', 'Pretoria')` |\n| `IS NULL` | Check for no value | `WHERE Phone IS NULL` |\n| `IS NOT NULL` | Has a value | `WHERE Email IS NOT NULL` |\n\n**LIKE wildcards:**\n- `%` matches zero or more characters: `LIKE 'Jo%'` matches \"John\", \"Johannesburg\"\n- `_` matches exactly one character: `LIKE '_ohn'` matches \"John\" but not \"Johnn\""),
  fb(5, "To find all surnames starting with \"Van\", use: WHERE Surname LIKE ___. To check if a field has no value, use: WHERE FieldName IS ___.",
    ["Van%", 'NULL'],
    "LIKE with Van% matches any surname starting with \"Van\". IS NULL checks for empty/missing values."),
  t(6, "### Combining Conditions: AND, OR, NOT\n\n```sql\n-- AND: Both conditions must be true\nSELECT * FROM tblLearners\nWHERE Grade = 12 AND Province = 'Gauteng';\n\n-- OR: At least one condition must be true\nSELECT * FROM tblLearners\nWHERE Province = 'KZN' OR Province = 'WC';\n\n-- NOT: Reverses the condition\nSELECT * FROM tblLearners\nWHERE NOT Grade = 8;\n\n-- Combined with brackets (order of evaluation)\nSELECT * FROM tblProducts\nWHERE (Category = 'Electronics' OR Category = 'Books')\n  AND Price > 100;\n```\n\n**Important:** Use brackets to clarify the order of evaluation when mixing AND and OR. Without brackets, AND is evaluated before OR."),
  q(7, "Given: WHERE Category = 'A' OR Category = 'B' AND Price > 50, which records are selected?",
    ['All Category A records, plus Category B records over R50', 'Only records in Category A or B that are over R50', 'All records over R50', 'No records are selected'], 0,
    "AND is evaluated before OR. So this selects: (Category = A) OR (Category = B AND Price > 50). To select both categories with price > 50, use brackets: (Category = A OR Category = B) AND Price > 50."),
  t(8, "### ORDER BY\n\nSorts the result set by one or more columns:\n\n```sql\n-- Ascending (A-Z, smallest first) - default\nSELECT * FROM tblLearners\nORDER BY Surname ASC;\n\n-- Descending (Z-A, largest first)\nSELECT * FROM tblProducts\nORDER BY Price DESC;\n\n-- Multiple sort columns\nSELECT * FROM tblLearners\nORDER BY Grade ASC, Surname ASC;\n\n-- Sort by calculated field\nSELECT ProductName, Quantity * UnitPrice AS Total\nFROM tblOrderDetails\nORDER BY Total DESC;\n```\n\n**Note:** `ASC` is the default. If you omit the direction, results sort in ascending order."),
  q(9, 'Write the SQL to select all learners in Grade 12 from tblLearners, sorted by Surname alphabetically.',
    ['SELECT * FROM tblLearners WHERE Grade = 12 ORDER BY Surname ASC', 'SELECT * FROM tblLearners ORDER BY Surname WHERE Grade = 12', 'SELECT * WHERE Grade = 12 FROM tblLearners ORDER BY Surname', 'SELECT ALL FROM tblLearners WHERE Grade = 12 SORT BY Surname'], 0,
    'The correct order is: SELECT ... FROM ... WHERE ... ORDER BY. The WHERE clause comes before ORDER BY.'),
  fb(10, 'The keyword ___ sorts results from highest to lowest. The default sort order is ___.',
    ['DESC', 'ASC'],
    'DESC sorts in descending order (Z-A or largest first). ASC (ascending) is the default.'),
];

// Lesson 3.2: Aggregate Functions and JOINs
blockNum = 0;
const ch3_lesson2 = [
  t(1, "## Aggregate Functions\n\nAggregate functions perform calculations on a set of values and return a single result.\n\n| Function | Purpose | Example |\n|----------|---------|--------|\n| `COUNT(*)` | Counts the number of records | `SELECT COUNT(*) FROM tblLearners` |\n| `COUNT(column)` | Counts non-NULL values in a column | `SELECT COUNT(Phone) FROM tblLearners` |\n| `SUM(column)` | Adds up all values | `SELECT SUM(Amount) FROM tblPayments` |\n| `AVG(column)` | Calculates the average | `SELECT AVG(Mark) FROM tblResults` |\n| `MIN(column)` | Finds the smallest value | `SELECT MIN(Price) FROM tblProducts` |\n| `MAX(column)` | Finds the largest value | `SELECT MAX(Mark) FROM tblResults` |\n\n```sql\n-- How many learners are in Grade 12?\nSELECT COUNT(*) AS TotalGr12\nFROM tblLearners\nWHERE Grade = 12;\n\n-- What is the average mark for IT?\nSELECT AVG(Mark) AS AverageMark\nFROM tblResults\nWHERE SubjectCode = 'IT';\n```"),
  t(2, "### GROUP BY\n\nGroups records that share a value, so aggregate functions can be applied to each group.\n\n```sql\n-- Count learners per grade\nSELECT Grade, COUNT(*) AS NumLearners\nFROM tblLearners\nGROUP BY Grade;\n\n-- Average mark per subject\nSELECT SubjectCode, AVG(Mark) AS AvgMark\nFROM tblResults\nGROUP BY SubjectCode;\n\n-- Total sales per product\nSELECT ProductID, SUM(Quantity * UnitPrice) AS TotalSales\nFROM tblOrderDetails\nGROUP BY ProductID;\n```\n\n**Rule:** Every column in the SELECT that is NOT an aggregate function MUST appear in the GROUP BY clause."),
  q(3, 'What is the purpose of the GROUP BY clause?',
    ['To group records with the same value so aggregate functions apply to each group', 'To sort the results', 'To remove duplicates', 'To filter records before selection'], 0,
    'GROUP BY divides records into groups based on one or more columns. Aggregate functions then calculate a result for each group.'),
  t(4, "### HAVING\n\nThe `HAVING` clause filters groups created by `GROUP BY`. It is like `WHERE` but for groups.\n\n```sql\n-- Show only grades with more than 100 learners\nSELECT Grade, COUNT(*) AS NumLearners\nFROM tblLearners\nGROUP BY Grade\nHAVING COUNT(*) > 100;\n\n-- Subjects with average mark below 50\nSELECT SubjectCode, AVG(Mark) AS AvgMark\nFROM tblResults\nGROUP BY SubjectCode\nHAVING AVG(Mark) < 50;\n```\n\n**WHERE vs HAVING:**\n- `WHERE` filters individual records BEFORE grouping\n- `HAVING` filters groups AFTER grouping\n\n```sql\n-- Grade 12 subjects where avg mark > 60\nSELECT SubjectCode, AVG(Mark) AS AvgMark\nFROM tblResults\nWHERE Grade = 12          -- filters records first\nGROUP BY SubjectCode\nHAVING AVG(Mark) > 60;    -- then filters groups\n```"),
  fb(5, 'The ___ clause filters individual records before grouping. The ___ clause filters groups after grouping.',
    ['WHERE', 'HAVING'],
    'WHERE filters rows before GROUP BY is applied. HAVING filters the resulting groups after aggregation.'),
  t(6, "### JOINs\n\nA JOIN combines rows from two or more tables based on a related column (usually a foreign key).\n\n**INNER JOIN** returns only matching rows from both tables:\n\n```sql\n-- Get learner names with their marks\nSELECT l.Name, l.Surname, r.SubjectCode, r.Mark\nFROM tblLearners l\nINNER JOIN tblResults r ON l.LearnerID = r.LearnerID;\n\n-- Get order details with product names\nSELECT o.OrderID, p.ProductName, od.Quantity,\n       od.Quantity * p.UnitPrice AS LineTotal\nFROM tblOrders o\nINNER JOIN tblOrderDetails od ON o.OrderID = od.OrderID\nINNER JOIN tblProducts p ON od.ProductID = p.ProductID;\n```\n\n**Table aliases** (l, r, o, od, p) make queries shorter and clearer."),
  q(7, 'What does an INNER JOIN return?',
    ['Only records that have matching values in both tables', 'All records from both tables', 'All records from the left table only', 'Records that do not match'], 0,
    'An INNER JOIN returns only the rows where the join condition is true in both tables. Records without a match in the other table are excluded.'),
  t(8, "### INSERT, UPDATE, DELETE\n\n**INSERT** adds a new record:\n```sql\nINSERT INTO tblLearners (Name, Surname, Grade, Province)\nVALUES ('Amahle', 'Zulu', 12, 'KZN');\n```\n\n**UPDATE** modifies existing records:\n```sql\nUPDATE tblLearners\nSET Grade = 12\nWHERE LearnerID = 1045;\n\n-- Update multiple fields\nUPDATE tblProducts\nSET Price = Price * 1.10, LastUpdated = CURDATE()\nWHERE Category = 'Stationery';\n```\n\n**DELETE** removes records:\n```sql\nDELETE FROM tblLearners\nWHERE LearnerID = 1045;\n```\n\n**WARNING:** Always include a WHERE clause with UPDATE and DELETE. Without it, ALL records are affected!"),
  q(9, 'What happens if you execute: DELETE FROM tblProducts; (without a WHERE clause)?',
    ['All records in tblProducts are deleted', 'Only the first record is deleted', 'An error occurs', 'Nothing happens'], 0,
    'Without a WHERE clause, DELETE removes ALL records from the table. This is a dangerous mistake that should always be avoided.'),
  fb(10, 'To add a new record, use the ___ statement. To change existing data, use the ___ statement.',
    ['INSERT', 'UPDATE'],
    'INSERT INTO adds new records. UPDATE modifies existing records. DELETE removes records.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Hardware and Systems Technologies (Terms 1-2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch4_lesson1 = [
  t(1, "## Hardware and Systems Technologies\n\n### Mobile Technologies\n\nMobile devices (smartphones, tablets) have become essential tools. Key technologies include:\n\n| Technology | Description |\n|-----------|------------|\n| **3G/4G/5G** | Cellular network generations. 5G offers speeds up to 10 Gbps with very low latency |\n| **Wi-Fi 6 (802.11ax)** | Latest wireless LAN standard, faster and handles more devices |\n| **Bluetooth 5** | Short-range wireless (up to 240 m), used for earphones, smartwatches |\n| **NFC** | Near Field Communication (< 10 cm), used for tap-to-pay (e.g. Apple Pay, SnapScan) |\n| **GPS** | Global Positioning System for location services and navigation |\n| **Biometric sensors** | Fingerprint scanners, facial recognition, iris scanners for security |\n| **Accelerometer/Gyroscope** | Detect motion and orientation (used in fitness trackers, gaming) |"),
  t(2, "### Factors Influencing Computer Performance\n\n| Factor | Impact |\n|--------|--------|\n| **CPU speed (GHz)** | Higher clock speed = more instructions per second |\n| **Number of cores** | Multi-core CPUs can handle more tasks simultaneously |\n| **RAM size** | More RAM allows more programs to run at once without slowing down |\n| **Storage type (HDD vs SSD)** | SSDs are 5-10x faster than HDDs for read/write operations |\n| **GPU** | Dedicated graphics card improves visual performance and parallel processing |\n| **Bus speed** | Determines how fast data moves between components |\n| **Cache memory** | Small, ultra-fast memory on the CPU chip (L1, L2, L3) |\n| **Operating system** | 64-bit OS can address more RAM than 32-bit |\n| **Bloatware** | Pre-installed software that consumes resources and slows the system |\n\n**Tip:** When recommending a computer, match the specifications to the user needs. A graphic designer needs a powerful GPU and large display; an office worker needs adequate RAM and an SSD."),
  q(3, 'Which upgrade would most improve a slow-starting computer with a traditional hard drive?',
    ['Replace the HDD with an SSD', 'Add more RAM', 'Install a faster GPU', 'Increase the CPU clock speed'], 0,
    'Replacing an HDD with an SSD dramatically improves boot times and application loading because SSDs have much faster read/write speeds and no moving parts.'),
  t(4, "### Cloud Computing\n\nCloud computing delivers computing services over the internet.\n\n**Service models:**\n\n| Model | What is provided | Example |\n|-------|-----------------|--------|\n| **IaaS** (Infrastructure as a Service) | Virtual machines, storage, networks | AWS EC2, Microsoft Azure |\n| **PaaS** (Platform as a Service) | Development platform and tools | Google App Engine, Heroku |\n| **SaaS** (Software as a Service) | Ready-to-use applications | Google Docs, Microsoft 365, Dropbox |\n\n**Deployment models:**\n- **Public cloud:** Shared infrastructure (cheaper, e.g. Google Drive)\n- **Private cloud:** Dedicated to one organisation (more secure, more expensive)\n- **Hybrid cloud:** Combination of public and private\n\n**Advantages:** Scalable, accessible anywhere, automatic updates, cost-effective (pay-as-you-go)\n**Disadvantages:** Requires internet, data security concerns, vendor lock-in, ongoing costs"),
  fb(5, 'Google Docs is an example of ___ (service model). Cloud computing where resources are shared among many users is called a ___ cloud.',
    ['SaaS', 'public'],
    'Google Docs is Software as a Service (SaaS) because the application is ready-to-use. A public cloud shares infrastructure among multiple customers.'),
  t(6, "### Virtual Reality (VR) and Augmented Reality (AR)\n\n**Virtual Reality (VR):**\n- Creates a completely artificial, immersive environment\n- Uses a headset (e.g. Meta Quest, PlayStation VR) that blocks out the real world\n- Applications: gaming, training simulations (pilot, surgeon), virtual tours, therapy\n- Requires powerful GPU, motion sensors, and headset with display\n\n**Augmented Reality (AR):**\n- Overlays digital information onto the real world\n- Uses a camera and screen (smartphone, AR glasses like Microsoft HoloLens)\n- Applications: Pokemon Go, furniture placement apps (e.g. IKEA Place), navigation overlays, education\n- Does not require a full headset; works on most smartphones\n\n**Key difference:** VR replaces the real world; AR enhances it."),
  q(7, 'A museum app that lets visitors point their phone at an exhibit and see additional information overlaid on the screen is an example of:',
    ['Augmented Reality (AR)', 'Virtual Reality (VR)', 'Cloud Computing', 'NFC Technology'], 0,
    'This is AR because digital information is overlaid onto the real-world view through the phone camera. VR would replace the real world entirely.'),
  t(8, "### System Requirements and Specifications\n\nWhen choosing or recommending hardware, consider:\n\n**Minimum vs Recommended requirements:**\n- Software lists minimum specs (the lowest hardware that will run it) and recommended specs (for optimal performance)\n- Always aim for recommended or higher\n\n**Example: Requirements for a Delphi development environment:**\n\n| Component | Minimum | Recommended |\n|-----------|---------|-------------|\n| CPU | Dual-core 2.0 GHz | Quad-core 3.0 GHz+ |\n| RAM | 4 GB | 8-16 GB |\n| Storage | 20 GB free (HDD) | 50 GB free (SSD) |\n| Display | 1280 x 1024 | 1920 x 1080 |\n| OS | Windows 10 64-bit | Windows 11 64-bit |\n\n**Warranties and service agreements:**\n- Onsite vs depot repair\n- Duration (1 year standard, 3-5 year extended)\n- What is covered (hardware only, or hardware + accidental damage)"),
  q(9, 'A school needs 30 computers for an IT lab running Delphi, a database server, and web browsers simultaneously. Which RAM specification is most appropriate?',
    ['16 GB per machine', '2 GB per machine', '4 GB per machine', '32 GB per machine'], 0,
    'Running an IDE (Delphi), a database server, and web browsers simultaneously is memory-intensive. 16 GB provides comfortable headroom for multitasking. 4 GB would be too slow.'),
  fb(10, 'The three cloud service models are IaaS, PaaS, and ___. VR stands for ___ Reality.',
    ['SaaS', 'Virtual'],
    'The three models are Infrastructure (IaaS), Platform (PaaS), and Software (SaaS) as a Service. VR is Virtual Reality.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Database Management (Term 1)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch5_lesson1 = [
  t(1, "## Database Management\n\n### Data Collection Methods\n\nData can be collected in various ways, each with advantages and limitations:\n\n| Method | Description | Example |\n|--------|-------------|--------|\n| **Manual entry** | Typing data into forms | Capturing learner details at registration |\n| **Scanning/OCR** | Optical Character Recognition converts printed text to digital | Scanning exam scripts |\n| **Bar codes / QR codes** | Scanning coded data | Supermarket checkout, asset tracking |\n| **RFID** | Radio Frequency ID tags read wirelessly | Library books, access cards |\n| **Sensors/IoT** | Automatic data from connected devices | Weather stations, traffic counters |\n| **Web forms** | Online data collection | Registration forms, surveys |\n| **Importing** | Transferring data from other systems | CSV or XML import |\n\n**Considerations when collecting data:**\n- **Accuracy:** Is the data correct and reliable?\n- **Completeness:** Is all required data present?\n- **Timeliness:** Is the data current and up to date?\n- **Relevance:** Is the data appropriate for its intended purpose?"),
  t(2, "### Location-Based Data\n\nLocation data identifies where something is geographically.\n\n**Sources of location data:**\n- **GPS (Global Positioning System):** Satellites provide coordinates (latitude, longitude)\n- **Cell tower triangulation:** Estimates position using nearby towers\n- **Wi-Fi positioning:** Uses known Wi-Fi hotspot locations\n- **IP geolocation:** Estimates location from internet address\n\n**Applications in South Africa:**\n- E-hailing services (Uber, Bolt) tracking driver and passenger locations\n- Delivery services (Takealot, Mr D) routing and tracking\n- Crime mapping and safety apps\n- Agricultural planning and farm management\n- Municipal service delivery tracking\n\n**Privacy concerns:**\n- Apps collecting location data without clear consent\n- Tracking people's movements without their knowledge\n- Location data combined with other data can reveal sensitive personal information"),
  q(3, 'Which technology allows e-hailing apps like Uber to track the real-time location of drivers?',
    ['GPS', 'Bluetooth', 'NFC', 'RFID'], 0,
    'GPS (Global Positioning System) provides real-time latitude and longitude coordinates via satellites, allowing e-hailing apps to track and display driver locations.'),
  t(4, "### Data Warehousing\n\nA **data warehouse** is a large, centralised repository that stores historical data from multiple sources for analysis and reporting.\n\n**Characteristics:**\n- **Subject-oriented:** Organised around key subjects (sales, customers, products)\n- **Integrated:** Combines data from multiple systems into a consistent format\n- **Non-volatile:** Data is stable; once loaded, it is not changed or deleted\n- **Time-variant:** Stores historical data over time for trend analysis\n\n**How it works:**\n1. Data is extracted from operational databases (point-of-sale, CRM, HR systems)\n2. Data is transformed (cleaned, formatted, standardised)\n3. Data is loaded into the warehouse (ETL process: Extract, Transform, Load)\n4. Users query the warehouse for reports and analysis\n\n**Example:** Shoprite stores transaction data from all branches. The data warehouse allows head office to analyse national sales trends, regional performance, and product popularity."),
  t(5, "### Data Mining\n\nData mining discovers patterns, trends, and relationships in large datasets.\n\n**Techniques:**\n- **Classification:** Categorising data (e.g. classifying emails as spam or not spam)\n- **Clustering:** Grouping similar data together (e.g. customer segments)\n- **Association:** Finding items that occur together (e.g. customers who buy bread also buy milk)\n- **Prediction:** Forecasting future values based on historical data (e.g. sales next quarter)\n\n**Real-world examples:**\n- **Retail:** Supermarkets analyse basket data to plan store layouts (related items placed nearby)\n- **Banking:** Detecting unusual transactions that may be fraud\n- **Healthcare:** Identifying patients at risk for certain diseases\n- **Marketing:** Targeted advertisements based on browsing and purchase history\n- **Education:** Identifying learners at risk of failing based on attendance and assessment patterns"),
  q(6, 'A supermarket discovers that customers who buy nappies on Friday evenings also tend to buy snacks. This is an example of which data mining technique?',
    ['Association', 'Classification', 'Clustering', 'Prediction'], 0,
    'Association analysis discovers items that frequently occur together. This insight could be used to place snacks near nappies or create combo deals.'),
  fb(7, 'The process of extracting data, transforming it, and loading it into a data warehouse is called ___. Data mining uses ___ analysis to find items that are frequently purchased together.',
    ['ETL', 'association'],
    'ETL stands for Extract, Transform, Load. Association analysis finds relationships between items in datasets.'),
  t(8, "### Caring for and Managing Data\n\n**Data integrity strategies:**\n- **Validation rules** at input (type checks, range checks, format checks)\n- **Referential integrity** between related tables\n- **Regular backups** (full, incremental, differential)\n- **Access control** (user roles and permissions)\n\n**Backup strategies:**\n\n| Type | Description | Speed |\n|------|-------------|-------|\n| **Full backup** | Copies everything | Slowest to create, fastest to restore |\n| **Incremental** | Copies only changes since the last backup (any type) | Fastest to create, slowest to restore |\n| **Differential** | Copies changes since the last full backup | Medium speed for both |\n\n**Best practice:** Full backup weekly + incremental daily. Store one copy offsite or in the cloud.\n\n**Data disposal:**\n- **Secure deletion:** Overwriting data multiple times so it cannot be recovered\n- **Physical destruction:** Shredding hard drives or degaussing magnetic media\n- **POPIA compliance:** South African law requires organisations to delete personal data when it is no longer needed for its original purpose"),
  q(9, 'Which backup type is fastest to create but slowest to restore?',
    ['Incremental', 'Full', 'Differential', 'Mirror'], 0,
    'Incremental backups only copy changes since the last backup (any type), making them the fastest to create. To restore, you need the last full backup plus every incremental backup since then, making restoration the slowest.'),
  fb(10, 'South African law that governs how organisations handle personal data is called ___. A ___ backup copies only the changes since the last full backup.',
    ['POPIA', 'differential'],
    'POPIA (Protection of Personal Information Act) is the SA data protection law. A differential backup copies all changes since the last full backup.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Social Implications (Terms 1-2)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch6_lesson1 = [
  t(1, "## Social Implications of Technology\n\n### Advantages and Disadvantages of Mobile Technology\n\n**Advantages:**\n- Instant communication (WhatsApp, email, video calls)\n- Access to information anywhere (educational resources, news)\n- Mobile banking (FNB app, Capitec app, SnapScan)\n- Navigation and location services\n- Entertainment (streaming, gaming, social media)\n- Health monitoring (fitness trackers, medical apps)\n- Job creation in the app economy\n\n**Disadvantages:**\n- Screen addiction and reduced face-to-face interaction\n- Cyberbullying on social media platforms\n- Health issues (eye strain, poor posture, sleep disruption from blue light)\n- Distraction in classrooms and workplaces\n- Digital divide (not everyone can afford devices or data)\n- E-waste from discarded devices\n- Privacy invasion through constant tracking and data collection"),
  t(2, "### Impact on Privacy\n\n**Personal privacy concerns:**\n- Social media oversharing reveals personal information to strangers\n- Location tracking shows where you are at all times\n- Apps requesting unnecessary permissions (e.g. a calculator app requesting camera access)\n- Data breaches exposing personal information\n- Facial recognition in public spaces\n\n**Business privacy concerns:**\n- Customer data collection and targeted advertising\n- Employee monitoring (emails, browsing, keystrokes)\n- CCTV and biometric attendance systems\n- Data sharing between companies without explicit consent\n\n**POPIA (Protection of Personal Information Act):**\n- Gives South Africans the right to know what data is collected about them\n- Requires consent before collecting personal information\n- Mandates reasonable security measures to protect data\n- Requires notification of data breaches\n- Appoints an Information Regulator to enforce compliance"),
  q(3, 'Under POPIA, which of the following is a right of a data subject (individual)?',
    ['The right to know what personal data an organisation holds about them', "The right to access any company's database", 'The right to collect data about other people', 'The right to sell personal data'], 0,
    'POPIA gives individuals the right to access their own personal information held by organisations, and to request correction or deletion.'),
  t(4, "### Internet of Things (IoT)\n\nThe IoT refers to a network of physical devices connected to the internet that can collect, share, and act on data.\n\n**Technologies enabling IoT:**\n- **Sensors:** Temperature, humidity, motion, light, pressure sensors that collect data\n- **Actuators:** Devices that perform physical actions based on data (e.g. opening a valve)\n- **Connectivity:** Wi-Fi, Bluetooth, Zigbee, LoRaWAN, cellular networks\n- **Cloud computing:** Stores and processes the massive amounts of data generated\n- **AI/Machine learning:** Analyses IoT data to make predictions and automate decisions\n- **Edge computing:** Processing data near the source (on the device) rather than in the cloud\n\n**Examples of IoT in South Africa:**\n- Smart electricity meters (prepaid meters that report usage)\n- Vehicle tracking and fleet management (Netstar, Tracker)\n- Smart farming (soil moisture sensors, automated irrigation)\n- Home automation (smart plugs, security cameras, robot vacuums)"),
  t(5, "### IoT Impact on Society\n\n**Positive impacts:**\n- **Healthcare:** Wearable devices monitor heart rate, blood sugar, and alert doctors\n- **Agriculture:** Precision farming reduces water waste and improves crop yields\n- **Energy:** Smart grids manage electricity distribution more efficiently\n- **Transport:** Traffic management, smart parking, autonomous vehicles\n- **Safety:** Smart smoke detectors, water leak sensors, security systems\n\n**Negative impacts:**\n- **Security vulnerabilities:** IoT devices often have weak security, creating entry points for hackers\n- **Privacy concerns:** Devices constantly collecting data about our habits and movements\n- **Job displacement:** Automation replacing manual monitoring and control jobs\n- **Environmental impact:** Billions of devices contributing to e-waste and energy consumption\n- **Dependency:** Over-reliance on connected systems; a network outage could disable critical infrastructure\n- **Digital divide:** Rural areas with poor connectivity cannot benefit from IoT"),
  q(6, 'Which of the following is a security concern specific to IoT devices?',
    ['Many IoT devices have weak default passwords and infrequent security updates', 'IoT devices are too expensive for hackers to target', 'IoT devices cannot connect to the internet', 'IoT data is always encrypted'], 0,
    'Many IoT devices ship with default passwords, have limited computing power for security features, and manufacturers may not provide regular security updates, making them vulnerable to attacks.'),
  fb(7, 'IoT stands for Internet of ___. Processing data on the device itself rather than sending it to the cloud is called ___ computing.',
    ['Things', 'edge'],
    'IoT = Internet of Things. Edge computing processes data locally on or near the device to reduce latency and bandwidth usage.'),
  t(8, "### Digital Citizenship and Ethical Behaviour\n\nAs an IT user, you have responsibilities:\n\n**Ethical guidelines:**\n- **Respect intellectual property:** Do not pirate software, music, or films\n- **Respect privacy:** Do not share others\\x27 personal information without consent\n- **Be honest:** Do not plagiarise or submit others\\x27 work as your own\n- **Be responsible:** Think before posting online; digital footprints are permanent\n- **Report cybercrime:** Contact the SA Cyber Crimes Centre or your school IT department\n\n**South African legislation:**\n\n| Law | Purpose |\n|-----|--------|\n| **POPIA** | Protects personal information |\n| **ECT Act** (Electronic Communications and Transactions) | Governs online transactions and cybercrime |\n| **Copyright Act** | Protects original creative works |\n| **Cybercrimes Act** | Criminalises hacking, data theft, cyber fraud, and malicious communications |"),
  q(9, 'Downloading a cracked version of Microsoft Office violates which South African law?',
    ['Copyright Act', 'POPIA', 'RICA', 'Constitution'], 0,
    'Software piracy (using cracked/unlicensed software) violates the Copyright Act, which protects the intellectual property rights of software developers.'),
  fb(10, 'The SA law that governs cybercrime such as hacking and data theft is the ___ Act. A person\\x27s trail of online activity is called a digital ___.',
    ['Cybercrimes', 'footprint'],
    'The Cybercrimes Act criminalises offences like hacking, data interception, and cyber fraud. A digital footprint is the trail of data you leave from online activity.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Internet Services and Communication (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch7_lesson1 = [
  t(1, "## Internet Services and Communication\n\n### Internet Services\n\n| Service | Description | Protocol |\n|---------|-------------|----------|\n| **WWW** | Web pages accessed through browsers | HTTP/HTTPS |\n| **Email** | Electronic mail | SMTP (send), POP3/IMAP (receive) |\n| **FTP** | File Transfer Protocol for uploading/downloading files | FTP/SFTP |\n| **VoIP** | Voice over IP (internet phone calls) | SIP, RTP |\n| **Streaming** | Real-time audio/video delivery | RTSP, HLS |\n| **Cloud storage** | Files stored on remote servers | HTTPS |\n| **DNS** | Translates domain names to IP addresses | DNS |\n\n**URL structure:**\n`https://www.example.co.za/products/page.html`\n- `https` = protocol (secure)\n- `www` = subdomain\n- `example` = domain name\n- `co.za` = top-level domain (South African commercial)\n- `/products/page.html` = path to the resource"),
  t(2, "### Online Applications\n\n**Web applications vs Desktop applications:**\n\n| Feature | Web App | Desktop App |\n|---------|---------|-------------|\n| Installation | None (runs in browser) | Must be installed |\n| Updates | Automatic (server-side) | Manual download |\n| Access | Any device with a browser | Only on installed device |\n| Performance | Depends on internet speed | Generally faster |\n| Offline | Usually not available | Works offline |\n| Examples | Google Docs, Canva, WhatsApp Web | MS Word, Delphi, Photoshop |\n\n**Types of online applications:**\n- **Productivity:** Google Workspace, Microsoft 365\n- **Communication:** Email, messaging, video conferencing (Zoom, Teams)\n- **E-commerce:** Online shopping (Takealot, Amazon)\n- **Social media:** Facebook, Instagram, TikTok\n- **Education:** Google Classroom, learning management systems\n- **Government services:** eFiling (SARS), Home Affairs online bookings"),
  q(3, 'Which protocol is used to securely transfer web pages from a server to a browser?',
    ['HTTPS', 'FTP', 'SMTP', 'POP3'], 0,
    'HTTPS (Hypertext Transfer Protocol Secure) encrypts data between the browser and web server using TLS/SSL, ensuring secure web browsing.'),
  t(4, "### The Role of SQL in Web Applications\n\nMost web applications use databases to store and retrieve data. SQL is used behind the scenes to:\n\n- **Store user data:** `INSERT INTO tblUsers ...` when a user registers\n- **Authenticate:** `SELECT * FROM tblUsers WHERE email = ... AND password = ...`\n- **Display content:** `SELECT * FROM tblProducts WHERE category = ...`\n- **Process transactions:** `UPDATE tblAccounts SET balance = balance - amount ...`\n\n**SQL Injection** is a hacking technique where malicious SQL is entered through input fields:\n\n```\nUsername: admin\nPassword: ' OR 1=1 --\n```\n\nThis tricks the database into returning all records because `1=1` is always true.\n\n**Prevention:**\n- Use **parameterised queries** (prepared statements) instead of string concatenation\n- **Validate** and **sanitise** all user input\n- Use an **ORM** (Object-Relational Mapper) that handles escaping automatically\n- Apply **principle of least privilege** (database user has minimal permissions)"),
  fb(5, 'A hacking technique where malicious SQL code is entered through a web form is called SQL ___. The best prevention is to use ___ queries.',
    ['injection', 'parameterised'],
    'SQL injection inserts malicious SQL through user input fields. Parameterised queries (prepared statements) separate SQL code from user data, preventing injection.'),
  t(6, "### Scripting Languages and Formatting Output\n\n**Client-side scripting** runs in the browser:\n- **HTML** structures web page content (headings, paragraphs, tables, forms)\n- **CSS** styles the appearance (colours, fonts, layouts)\n- **JavaScript** adds interactivity (form validation, dynamic content, animations)\n\n**Server-side scripting** runs on the web server:\n- **PHP**, **Python**, **Node.js**, **ASP.NET** process requests, query databases, and generate HTML\n\n**Example: Displaying database data on a web page:**\n1. User clicks \"View Products\" (browser sends request)\n2. Server-side script receives request\n3. Script executes SQL: `SELECT * FROM tblProducts`\n4. Script formats results as HTML table\n5. HTML is sent to the browser\n6. Browser renders the page for the user\n\n**Formatting output:**\n- **Currency:** Display with R symbol and 2 decimal places (R1 250,00)\n- **Dates:** Use consistent format (DD/MM/YYYY for SA)\n- **Tables:** Use column headings, alignment, and borders for readability"),
  q(7, 'Which scripting language runs in the web browser (client-side)?',
    ['JavaScript', 'PHP', 'Python', 'SQL'], 0,
    'JavaScript is the primary client-side scripting language that runs in web browsers. PHP and Python are server-side languages. SQL is a database query language.'),
  t(8, "### Connecting to the Internet\n\n| Connection Type | Speed | Description |\n|----------------|-------|------------|\n| **Fibre (FTTH)** | 10-1000 Mbps | Fibre optic cable to the home (fastest, most reliable) |\n| **ADSL** | 4-20 Mbps | Uses telephone line (being phased out in SA) |\n| **4G/LTE** | 10-100 Mbps | Cellular data via mobile towers |\n| **5G** | 100-1000+ Mbps | Next-gen cellular (rolling out in SA metros) |\n| **Fixed wireless** | 10-100 Mbps | Point-to-point wireless (used in rural areas) |\n| **Satellite** | 10-200 Mbps | Via satellite (Starlink now available in SA) |\n\n### Remote Access\n\n- **VPN (Virtual Private Network):** Creates a secure, encrypted tunnel over the internet to connect to a private network\n- **Remote Desktop:** Allows controlling a computer from another location (TeamViewer, Windows Remote Desktop)\n- **SSH (Secure Shell):** Secure command-line access to remote servers\n\n**Security for remote access:**\n- Strong passwords and two-factor authentication\n- VPN for all remote connections\n- Regularly update software and apply security patches\n- Monitor access logs for suspicious activity"),
  q(9, 'What does a VPN do?',
    ['Creates a secure, encrypted connection over the internet to a private network', 'Speeds up internet browsing', 'Blocks all advertising', 'Provides free internet access'], 0,
    'A VPN (Virtual Private Network) creates an encrypted tunnel between your device and a private network, protecting your data from interception and hiding your IP address.'),
  fb(10, 'The fastest wired internet connection available in South Africa is ___. SSH stands for Secure ___.',
    ['fibre', 'Shell'],
    'Fibre (FTTH) offers the fastest and most reliable wired internet in SA. SSH (Secure Shell) provides encrypted command-line access to remote servers.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Software Engineering (Term 3)
// ═══════════════════════════════════════════════════════════════════════════════

blockNum = 0;
const ch8_lesson1 = [
  t(1, "## Software Engineering\n\n### Software Development Life Cycle (SDLC)\n\nThe SDLC is a structured process for developing software:\n\n| Phase | Description |\n|-------|------------|\n| **1. Analysis** | Understand the problem. Gather requirements. Define what the system must do. |\n| **2. Design** | Plan the solution. Create flowcharts, pseudocode, ERDs, and UI mockups. |\n| **3. Implementation (Coding)** | Write the actual program code in the chosen language (e.g. Delphi). |\n| **4. Testing** | Verify the program works correctly. Find and fix bugs. |\n| **5. Documentation** | Create user manuals, technical docs, and in-code comments. |\n| **6. Maintenance** | Fix bugs found after release, add new features, update for new requirements. |\n\n**Development methodologies:**\n- **Waterfall:** Sequential, each phase completed before the next begins. Good for well-defined projects.\n- **Agile:** Iterative, working in short cycles (sprints). Good for projects where requirements evolve.\n- **Prototyping:** Build a working model first, refine based on feedback."),
  t(2, "### Computational Thinking\n\nComputational thinking is a problem-solving approach used in IT:\n\n| Skill | Description | Example |\n|-------|-------------|--------|\n| **Decomposition** | Breaking a complex problem into smaller, manageable parts | Building a school system: break into attendance, marks, timetable modules |\n| **Pattern recognition** | Identifying similarities or trends in data | Noticing that most late learners take the same bus route |\n| **Abstraction** | Focusing on important details and ignoring irrelevant ones | A map shows roads but not every tree and building |\n| **Algorithm design** | Creating step-by-step instructions to solve a problem | Writing a recipe or a sorting procedure |\n\n**Algorithms can be represented as:**\n- **Pseudocode:** Structured English describing the logic\n- **Flowcharts:** Visual diagrams using standard symbols\n- **Delphi code:** The actual implementation"),
  q(3, 'A programmer breaks a large inventory system into separate modules: stock management, ordering, reporting, and user management. Which computational thinking skill is this?',
    ['Decomposition', 'Pattern recognition', 'Abstraction', 'Algorithm design'], 0,
    'Decomposition breaks a complex problem into smaller, more manageable sub-problems or modules.'),
  t(4, "### Problem-Solving with Flowcharts\n\n**Standard flowchart symbols:**\n\n| Symbol | Shape | Purpose |\n|--------|-------|--------|\n| **Terminal** | Rounded rectangle | Start / End of program |\n| **Process** | Rectangle | An action or calculation |\n| **Decision** | Diamond | Yes/No question (branching) |\n| **Input/Output** | Parallelogram | Reading input or displaying output |\n| **Flow lines** | Arrows | Direction of flow |\n| **Connector** | Circle | Links parts of a flowchart |\n\n**Example flowchart logic: Determine pass or fail**\n\n```\nSTART\n  |\n  v\nINPUT mark\n  |\n  v\n[mark >= 50?]--YES--> OUTPUT \"Pass\"\n  |                      |\n  NO                     v\n  |                    END\n  v\nOUTPUT \"Fail\"\n  |\n  v\nEND\n```"),
  t(5, "### Pseudocode Conventions\n\nPseudocode is a structured way to describe algorithms without worrying about exact syntax.\n\n**Delphi-style pseudocode:**\n\n```pascal\n// Calculate average of marks in an array\nBEGIN\n  total := 0\n  FOR i := 1 TO numMarks DO\n    total := total + marks[i]\n  ENDFOR\n  average := total / numMarks\n  IF average >= 50 THEN\n    OUTPUT \"Pass with average: \" + average\n  ELSE\n    OUTPUT \"Fail with average: \" + average\n  ENDIF\nEND\n```\n\n**Key structures:**\n- **Sequence:** Instructions executed one after another\n- **Selection:** IF...THEN...ELSE, CASE...OF\n- **Iteration:** FOR...DO, WHILE...DO, REPEAT...UNTIL"),
  fb(6, 'The three fundamental control structures in programming are sequence, ___, and ___.',
    ['selection', 'iteration'],
    'Sequence = instructions in order. Selection = branching (IF/CASE). Iteration = looping (FOR/WHILE/REPEAT).'),
  t(7, "### Testing Strategies\n\n**Types of testing:**\n\n| Type | Description |\n|------|------------|\n| **Unit testing** | Testing individual procedures/functions in isolation |\n| **Integration testing** | Testing how modules work together |\n| **System testing** | Testing the complete system end-to-end |\n| **Acceptance testing** | Users verify the system meets their requirements |\n\n**Test data categories:**\n- **Normal data:** Typical, valid inputs (e.g. age = 25)\n- **Boundary data:** Values at the edge of valid ranges (e.g. age = 0, age = 120)\n- **Erroneous data:** Invalid inputs that should be rejected (e.g. age = -5, age = \"abc\")\n\n**Debugging techniques:**\n- **Trace tables:** Track variable values step by step through code\n- **Breakpoints:** Pause execution at a specific line to inspect variables\n- **Watch windows:** Monitor variable values in real time during debugging\n- **Step-through:** Execute code one line at a time"),
  q(8, 'A programmer tests a function that accepts ages between 1 and 120. Which test values represent boundary testing?',
    ['0, 1, 120, 121', '50, 60, 70', '-5, \"abc\"', '25, 30, 35'], 0,
    'Boundary testing uses values at and just beyond the edges of valid ranges: 0 (just below minimum), 1 (minimum), 120 (maximum), and 121 (just above maximum).'),
  t(9, "### Documentation and Maintenance\n\n**Types of documentation:**\n- **In-code comments:** Explain complex logic within the source code\n- **Technical documentation:** System architecture, database design, API specifications\n- **User manual:** How end users operate the software\n- **Installation guide:** How to set up and configure the software\n\n**Good commenting practice in Delphi:**\n```pascal\n// Calculate the total including 15% VAT\n// Input: rSubtotal (the amount before VAT)\n// Output: the amount including VAT\nfunction CalcTotalWithVAT(rSubtotal: real): real;\nbegin\n  Result := rSubtotal * 1.15;\nend;\n```\n\n**Maintenance types:**\n- **Corrective:** Fixing bugs discovered after release\n- **Adaptive:** Modifying the system for new environments (e.g. new OS version)\n- **Perfective:** Improving performance or adding features based on user feedback\n- **Preventive:** Updating code to prevent future problems"),
  q(10, 'Which type of maintenance involves adding a new reporting feature requested by users?',
    ['Perfective', 'Corrective', 'Adaptive', 'Preventive'], 0,
    'Perfective maintenance improves the software by adding new features or enhancing existing ones based on user feedback and changing requirements.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 9: Solution Development (Terms 2-3)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 9.1: Arrays and String Manipulation
blockNum = 0;
const ch9_lesson1 = [
  t(1, "## Solution Development: Arrays\n\n### One-Dimensional Arrays\n\nAn array is a data structure that stores multiple values of the same type under one name.\n\n```pascal\nvar\n  arrMarks: array[1..10] of integer;\n  arrNames: array[1..30] of string;\n  i: integer;\nbegin\n  // Assigning values\n  arrMarks[1] := 78;\n  arrMarks[2] := 65;\n  \n  // Reading values from the user\n  for i := 1 to 10 do\n    arrMarks[i] := StrToInt(InputBox(\\x27Mark\\x27,\n      \\x27Enter mark \\x27 + IntToStr(i) + \\x27:\\x27, \\x27\\x27));\n  \n  // Displaying all values\n  for i := 1 to 10 do\n    memOutput.Lines.Add(IntToStr(arrMarks[i]));\nend;\n```\n\n**Key operations on arrays:** Search (linear, bubble sort), calculate sum/average/min/max, count occurrences, insert/delete elements."),
  t(2, "### Two-Dimensional Arrays (2D Arrays)\n\nA 2D array is like a table with rows and columns.\n\n```pascal\nvar\n  arrGrid: array[1..5, 1..4] of integer;\n  iRow, iCol: integer;\nbegin\n  // Assign a value at row 2, column 3\n  arrGrid[2, 3] := 85;\n  \n  // Fill the entire grid\n  for iRow := 1 to 5 do\n    for iCol := 1 to 4 do\n      arrGrid[iRow, iCol] := Random(100);\n  \n  // Display as a table\n  for iRow := 1 to 5 do\n  begin\n    sLine := \\x27\\x27;\n    for iCol := 1 to 4 do\n      sLine := sLine + Format(\\x27%5d\\x27, [arrGrid[iRow, iCol]]);\n    memOutput.Lines.Add(sLine);\n  end;\nend;\n```\n\n**Use case:** Storing a timetable (rows = periods, columns = days), a seating plan, or a mark sheet (rows = learners, columns = assessments)."),
  q(3, 'In a 2D array declared as arrData: array[1..6, 1..5] of integer, how many elements can it store?',
    ['30', '11', '65', '25'], 0,
    'A 2D array with 6 rows and 5 columns stores 6 x 5 = 30 elements.'),
  t(4, "### Searching and Sorting Arrays\n\n**Linear Search:**\n```pascal\nfunction LinearSearch(arr: array of integer;\n  iTarget: integer): integer;\nvar\n  i: integer;\nbegin\n  Result := -1;  // not found\n  for i := 0 to High(arr) do\n    if arr[i] = iTarget then\n    begin\n      Result := i;\n      Exit;\n    end;\nend;\n```\n\n**Bubble Sort (ascending):**\n```pascal\nprocedure BubbleSort(var arr: array of integer;\n  iSize: integer);\nvar\n  i, j, iTemp: integer;\nbegin\n  for i := 0 to iSize - 2 do\n    for j := 0 to iSize - 2 - i do\n      if arr[j] > arr[j + 1] then\n      begin\n        iTemp := arr[j];\n        arr[j] := arr[j + 1];\n        arr[j + 1] := iTemp;\n      end;\nend;\n```\n\nBubble sort repeatedly compares adjacent elements and swaps them if they are in the wrong order."),
  fb(5, 'A linear search checks each element ___. Bubble sort compares ___ elements and swaps them if needed.',
    ['one by one', 'adjacent'],
    'Linear search examines each element sequentially until the target is found or the array ends. Bubble sort compares neighbouring (adjacent) elements and swaps them into the correct order.'),
  t(6, "### String Manipulation\n\nDelphi provides powerful string functions:\n\n| Function | Purpose | Example |\n|----------|---------|--------|\n| `Length(s)` | Returns the length of string s | `Length('Hello')` = 5 |\n| `Copy(s, start, count)` | Extracts a substring | `Copy('Delphi', 1, 3)` = `'Del'` |\n| `Pos(sub, s)` | Finds position of substring | `Pos('lp', 'Delphi')` = 3 |\n| `UpperCase(s)` | Converts to uppercase | `UpperCase('hello')` = `'HELLO'` |\n| `LowerCase(s)` | Converts to lowercase | `LowerCase('HELLO')` = `'hello'` |\n| `Trim(s)` | Removes leading/trailing spaces | `Trim(' Hi ')` = `'Hi'` |\n| `Delete(s, start, count)` | Removes characters from s | Modifies s in place |\n| `Insert(sub, s, pos)` | Inserts sub into s at pos | Modifies s in place |\n| `StringReplace(s, old, new, [flags])` | Replaces occurrences | Returns new string |\n| `s[i]` | Access character at position i | `'Hello'[1]` = `'H'` |"),
  q(7, "What is the output of: Copy('Information', 1, 4) + Copy('Technology', 1, 4)?",
    ['InfoTech', 'InformationTechnology', 'Info Tech', 'IT'], 0,
    "Copy('Information', 1, 4) extracts 'Info'. Copy('Technology', 1, 4) extracts 'Tech'. Concatenated: 'InfoTech'."),
  t(8, "### Date Functions\n\nDelphi provides date and time functions:\n\n```pascal\nvar\n  dToday, dBirthDate: TDateTime;\n  iAge: integer;\nbegin\n  // Current date\n  dToday := Date;\n  \n  // Current date and time\n  dToday := Now;\n  \n  // Create a specific date\n  dBirthDate := EncodeDate(2007, 3, 15);\n  \n  // Extract parts\n  ShowMessage(IntToStr(YearOf(dToday)));\n  ShowMessage(IntToStr(MonthOf(dToday)));\n  ShowMessage(IntToStr(DayOf(dToday)));\n  \n  // Calculate age\n  iAge := YearOf(Date) - YearOf(dBirthDate);\n  \n  // Format a date\n  ShowMessage(FormatDateTime(\\x27dd/mm/yyyy\\x27, dToday));\n  \n  // Days between two dates\n  ShowMessage(IntToStr(DaysBetween(Date, dBirthDate)));\nend;\n```\n\n**Common uses:** Calculating age, finding days until an event, validating date ranges, formatting dates for display."),
  fb(9, 'The Delphi function that returns the current date is ___. To extract the year from a date, use the ___ function.',
    ['Date', 'YearOf'],
    'Date returns the current system date. YearOf() extracts the year component from a TDateTime value.'),
  q(10, 'A learner was born on 15 March 2007. Using Delphi, which expression correctly calculates their age in years (approximately)?',
    ['YearOf(Date) - YearOf(dBirthDate)', 'Date - dBirthDate', 'DaysBetween(Date, dBirthDate)', 'MonthOf(Date) - MonthOf(dBirthDate)'], 0,
    'YearOf(Date) - YearOf(dBirthDate) gives the difference in years. DaysBetween gives the total days, not years. Subtracting dates directly gives a float in days.'),
];

// Lesson 9.2: File Handling and Database Integration
blockNum = 0;
const ch9_lesson2 = [
  t(1, "## File Handling in Delphi\n\n### Text Files\n\nDelphi can read from and write to text files.\n\n**Writing to a text file:**\n```pascal\nvar\n  tf: TextFile;\nbegin\n  AssignFile(tf, \\x27learners.txt\\x27);\n  Rewrite(tf);  // Create new file (overwrites if exists)\n  \n  WriteLn(tf, \\x27Sipho Dlamini, 17, Grade 12\\x27);\n  WriteLn(tf, \\x27Naledi Mokoena, 18, Grade 12\\x27);\n  WriteLn(tf, \\x27David van Wyk, 16, Grade 11\\x27);\n  \n  CloseFile(tf);\nend;\n```\n\n**Reading from a text file:**\n```pascal\nvar\n  tf: TextFile;\n  sLine: string;\nbegin\n  AssignFile(tf, \\x27learners.txt\\x27);\n  Reset(tf);  // Open existing file for reading\n  \n  while not Eof(tf) do\n  begin\n    ReadLn(tf, sLine);\n    memOutput.Lines.Add(sLine);\n  end;\n  \n  CloseFile(tf);\nend;\n```\n\n**Key functions:** `Rewrite` (create/overwrite), `Reset` (open for reading), `Append` (add to end), `Eof` (end of file), `CloseFile` (always close when done)."),
  t(2, "### Appending to a File and Error Handling\n\n**Append adds to the end of an existing file:**\n```pascal\nvar\n  tf: TextFile;\nbegin\n  AssignFile(tf, \\x27log.txt\\x27);\n  \n  if FileExists(\\x27log.txt\\x27) then\n    Append(tf)  // Open for appending\n  else\n    Rewrite(tf);  // Create new file\n  \n  WriteLn(tf, FormatDateTime(\\x27yyyy-mm-dd hh:nn:ss\\x27,\n    Now) + \\x27 - User logged in\\x27);\n  \n  CloseFile(tf);\nend;\n```\n\n**Error handling with try...finally:**\n```pascal\nvar\n  tf: TextFile;\n  sLine: string;\nbegin\n  if not FileExists(\\x27data.txt\\x27) then\n  begin\n    ShowMessage(\\x27File not found!\\x27);\n    Exit;\n  end;\n  \n  AssignFile(tf, \\x27data.txt\\x27);\n  Reset(tf);\n  try\n    while not Eof(tf) do\n    begin\n      ReadLn(tf, sLine);\n      // Process sLine\n    end;\n  finally\n    CloseFile(tf);  // Always executes\n  end;\nend;\n```\n\nThe `finally` block ensures the file is closed even if an error occurs during processing."),
  q(3, 'What is the difference between Rewrite and Append when opening a text file?',
    ['Rewrite creates a new file (erasing existing content); Append adds to the end of an existing file', 'Rewrite reads the file; Append writes to the file', 'They are identical', 'Rewrite opens for appending; Append creates a new file'], 0,
    'Rewrite creates a new file (or overwrites an existing one). Append opens an existing file and positions the write cursor at the end to add new data.'),
  t(4, "### Integrating Database with Programming\n\nIn Delphi, you can connect to a database and execute SQL from your code.\n\n**Components used:**\n- **TADOConnection:** Connects to the database\n- **TADOQuery:** Executes SQL queries\n- **TDataSource:** Links query results to visual components\n- **TDBGrid:** Displays query results in a table\n\n**Executing a SELECT query:**\n```pascal\nvar\n  qry: TADOQuery;\nbegin\n  qry := dmData.qryLearners;  // Reference to the query\n  qry.Close;\n  qry.SQL.Clear;\n  qry.SQL.Add(\\x27SELECT Name, Surname, Grade\\x27);\n  qry.SQL.Add(\\x27FROM tblLearners\\x27);\n  qry.SQL.Add(\\x27WHERE Grade = 12\\x27);\n  qry.SQL.Add(\\x27ORDER BY Surname\\x27);\n  qry.Open;  // Use Open for SELECT (returns data)\nend;\n```\n\n**Note:** Use `qry.Open` for SELECT queries (which return data) and `qry.ExecSQL` for INSERT, UPDATE, and DELETE queries (which modify data)."),
  fb(5, 'To execute a SELECT query that returns data, use qry.___. To execute an INSERT/UPDATE/DELETE query, use qry.___.',
    ['Open', 'ExecSQL'],
    'qry.Open executes a SELECT and populates the result set. qry.ExecSQL executes action queries (INSERT, UPDATE, DELETE) that modify data but do not return rows.'),
  t(6, "### Parameterised Queries in Delphi\n\nParameterised queries prevent SQL injection and handle data types correctly:\n\n```pascal\n// Safe: using parameters\nqry.Close;\nqry.SQL.Clear;\nqry.SQL.Add(\\x27SELECT * FROM tblLearners\\x27);\nqry.SQL.Add(\\x27WHERE Grade = :pGrade\\x27);\nqry.SQL.Add(\\x27AND Province = :pProvince\\x27);\nqry.Parameters.ParamByName(\\x27pGrade\\x27).Value := 12;\nqry.Parameters.ParamByName(\\x27pProvince\\x27).Value\n  := \\x27Gauteng\\x27;\nqry.Open;\n\n// INSERT with parameters\nqry.Close;\nqry.SQL.Clear;\nqry.SQL.Add(\\x27INSERT INTO tblLearners\\x27);\nqry.SQL.Add(\\x27(Name, Surname, Grade)\\x27);\nqry.SQL.Add(\\x27VALUES (:pName, :pSurname, :pGrade)\\x27);\nqry.Parameters.ParamByName(\\x27pName\\x27).Value\n  := edtName.Text;\nqry.Parameters.ParamByName(\\x27pSurname\\x27).Value\n  := edtSurname.Text;\nqry.Parameters.ParamByName(\\x27pGrade\\x27).Value\n  := StrToInt(edtGrade.Text);\nqry.ExecSQL;\n```\n\n**Always use parameters instead of concatenating user input into SQL strings!**"),
  q(7, 'Why should you use parameterised queries instead of concatenating user input into SQL strings?',
    ['To prevent SQL injection attacks', 'They are easier to type', 'They run faster', 'Delphi requires them'], 0,
    'Parameterised queries separate SQL code from user data, preventing SQL injection attacks where malicious SQL is inserted through input fields.'),
  t(8, "### Processing Query Results\n\n```pascal\n// Loop through all records in a query result\nqry.Open;\nqry.First;  // Move to first record\n\nwhile not qry.Eof do\nbegin\n  sName := qry.FieldByName(\\x27Name\\x27).AsString;\n  iGrade := qry.FieldByName(\\x27Grade\\x27).AsInteger;\n  rMark := qry.FieldByName(\\x27Mark\\x27).AsFloat;\n  \n  memOutput.Lines.Add(sName + \\x27 - Grade \\x27 +\n    IntToStr(iGrade) + \\x27 - Mark: \\x27 +\n    FloatToStrF(rMark, ffFixed, 5, 1));\n  \n  qry.Next;  // Move to next record\nend;\n\n// Count records\nShowMessage(\\x27Records found: \\x27 +\n  IntToStr(qry.RecordCount));\n```\n\n**Common field access methods:**\n- `.AsString` for text fields\n- `.AsInteger` for whole number fields\n- `.AsFloat` for decimal number fields\n- `.AsDateTime` for date fields\n- `.AsBoolean` for true/false fields"),
  q(9, 'What does qry.Eof return?',
    ['True when the cursor has passed the last record', 'True when the query has an error', 'True when the file is empty', 'True when the database is disconnected'], 0,
    'Eof (End of File/recordset) returns True when the cursor has moved past the last record, indicating there are no more records to process.'),
  t(10, "### Designing Real-World Solutions\n\nWhen developing a solution for a real-world problem:\n\n**Step 1: Analyse the problem**\n- What inputs are needed?\n- What outputs are required?\n- What processing must occur?\n\n**Step 2: Design the database**\n- Identify entities (tables needed)\n- Define fields and data types\n- Establish relationships and keys\n- Normalise to 3NF\n\n**Step 3: Design the interface**\n- Forms for data input (with validation)\n- Reports and displays for output\n- Navigation between screens\n\n**Step 4: Write the code**\n- Use OOP for business logic\n- Use SQL for data access\n- Use arrays for temporary data processing\n- Use file handling for import/export\n\n**Step 5: Test thoroughly**\n- Test with normal, boundary, and erroneous data\n- Test all CRUD operations\n- Test with realistic data volumes"),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER 10: Revision and Exam Preparation (Term 4)
// ═══════════════════════════════════════════════════════════════════════════════

// Lesson 10.1: Paper 1 Theory Revision
blockNum = 0;
const ch10_lesson1 = [
  t(1, "## Exam Preparation: Paper 1 (Theory)\n\n**Paper 1: 150 marks, 3 hours**\n\nThis paper tests your theoretical knowledge across all IT topics.\n\n| Section | Topic | Marks |\n|---------|-------|-------|\n| A | Short questions (all topics) | 20 |\n| B | Database design and SQL | 25 |\n| C | Object-Oriented Programming | 25 |\n| D | Communications and network technologies | 25 |\n| E | Data and information management | 25 |\n| F | Solution development (theory) | 30 |\n| **Total** | | **150** |\n\n**Time management:** You have approximately 1,2 minutes per mark. A 10-mark question should take about 12 minutes."),
  t(2, "### Section B Revision: Database and SQL\n\n**Key concepts to know:**\n- All three normal forms (1NF, 2NF, 3NF) and how to normalise\n- Entity-relationship diagrams and relationship types\n- Primary keys, foreign keys, composite keys\n- Data types and when to use each\n- SQL: SELECT (with calculated fields, DISTINCT, WHERE, ORDER BY)\n- Aggregate functions: COUNT, SUM, AVG, MIN, MAX\n- GROUP BY and HAVING\n- JOINs (INNER JOIN)\n- INSERT, UPDATE, DELETE statements\n- Referential integrity and its importance\n\n**Common exam question:**\n> Given the following tables, write an SQL statement to display the names of all learners in Grade 12 who have an average mark above 60, sorted by surname.\n\n```sql\nSELECT l.Name, l.Surname, AVG(r.Mark) AS AvgMark\nFROM tblLearners l\nINNER JOIN tblResults r ON l.LearnerID = r.LearnerID\nWHERE l.Grade = 12\nGROUP BY l.LearnerID, l.Name, l.Surname\nHAVING AVG(r.Mark) > 60\nORDER BY l.Surname;\n```"),
  q(3, 'In the SQL statement above, why is HAVING used instead of WHERE to filter by average mark?',
    ['HAVING filters groups after aggregation; WHERE cannot use aggregate functions', 'HAVING is faster than WHERE', 'WHERE only works with text fields', 'There is no difference between HAVING and WHERE'], 0,
    'WHERE filters individual rows BEFORE grouping. HAVING filters groups AFTER the GROUP BY and aggregation. Since AVG(r.Mark) is an aggregate function, it must be filtered with HAVING, not WHERE.'),
  t(4, "### Section C Revision: OOP\n\n**Be able to:**\n- Define and explain all OOP concepts (class, object, encapsulation, inheritance, polymorphism)\n- Write class definitions with private fields and public methods\n- Write parameterised and non-parameterised constructors\n- Write accessor (getter) and mutator (setter) methods with validation\n- Write a ToString method\n- Explain and implement inheritance (using inherited keyword)\n- Explain polymorphism with an example\n- Write and explain auxiliary methods\n\n**Typical exam question format:**\n\n> Study the following class diagram and answer the questions:\n>\n> `TAnimal` has fields: fName (string), fAge (integer)\n> `TDog` extends `TAnimal` and adds: fBreed (string)\n>\n> (a) Write the class definition for TAnimal (4 marks)\n> (b) Write the parameterised constructor for TDog (4 marks)\n> (c) Write the ToString method for TDog (3 marks)\n> (d) Explain how polymorphism applies when TDog overrides ToString (2 marks)"),
  fb(5, 'In Delphi, a child class calls its parent constructor using the keyword ___. The keyword ___ tells the compiler that a method replaces the inherited version.',
    ['inherited', 'override'],
    'inherited calls the parent class version of a method. override indicates that the method replaces the parent version.'),
  t(6, "### Section D Revision: Communications and Networks\n\n**Key topics:**\n- Internet services and protocols (HTTP, HTTPS, FTP, SMTP, POP3, DNS)\n- Client-side vs server-side scripting\n- SQL injection and prevention\n- Remote access (VPN, SSH, Remote Desktop)\n- Mobile technologies (3G/4G/5G, Wi-Fi, Bluetooth, NFC)\n- Cloud computing (IaaS, PaaS, SaaS)\n- VR and AR differences and applications\n\n**Common question types:**\n- Explain the difference between HTTP and HTTPS\n- Name THREE measures to prevent SQL injection\n- Describe TWO advantages and TWO disadvantages of cloud computing\n- Explain the difference between VR and AR with examples"),
  t(7, "### Section E Revision: Data and Information Management\n\n**Key topics:**\n- Data warehousing (characteristics, ETL process)\n- Data mining (techniques: classification, clustering, association, prediction)\n- POPIA and privacy legislation\n- IoT technologies and societal impact\n- Data collection methods\n- Backup strategies (full, incremental, differential)\n- Ethical use of technology and digital citizenship\n\n**SA context questions:**\n- How does POPIA protect South Africans?\n- Give an example of IoT in SA agriculture\n- Discuss the digital divide in South Africa"),
  q(8, 'Which data mining technique would a bank use to detect unusual patterns in customer transactions?',
    ['Classification (anomaly detection)', 'Association', 'Clustering', 'Sorting'], 0,
    'Banks use classification algorithms to categorise transactions as normal or suspicious. Anomaly detection is a form of classification that identifies transactions deviating from expected patterns.'),
  t(9, "### Section F Revision: Solution Development Theory\n\n**Key topics:**\n- SDLC phases and their purpose\n- Computational thinking (decomposition, pattern recognition, abstraction, algorithm design)\n- Flowcharts (standard symbols and drawing them)\n- Pseudocode (writing structured algorithms)\n- Testing strategies (unit, integration, system, acceptance)\n- Test data types (normal, boundary, erroneous)\n- Documentation types\n- Maintenance types (corrective, adaptive, perfective, preventive)\n\n**Common question format:**\n> Write pseudocode/draw a flowchart to:\n> - Find the largest value in an array of N numbers\n> - Calculate and display the average of all even numbers in an array\n> - Read data from a file and count records meeting a condition"),
  q(10, 'A school management system needs updating because the Department of Education changed the grading system. This is an example of which maintenance type?',
    ['Adaptive maintenance', 'Corrective maintenance', 'Perfective maintenance', 'Preventive maintenance'], 0,
    'Adaptive maintenance modifies software to work in a changed environment (new regulations, new OS, new hardware). The grading system change is an external change requiring the software to adapt.'),
];

// Lesson 10.2: Paper 2 Practical Revision
blockNum = 0;
const ch10_lesson2 = [
  t(1, "## Exam Preparation: Paper 2 (Practical)\n\n**Paper 2: 150 marks, 3 hours**\n\nThis paper is a practical programming exam done on a computer using Delphi.\n\n| Section | Topic | Approx. Marks |\n|---------|-------|---------------|\n| A | General programming (variables, loops, selection, string manipulation) | 30-40 |\n| B | Database/SQL programming (connecting, querying, displaying results) | 30-40 |\n| C | Object-Oriented Programming (class implementation) | 30-40 |\n| D | Problem-solving (arrays, file handling, integration) | 40-50 |\n| **Total** | | **150** |"),
  t(2, "### Section A Practice: String Manipulation\n\n**Typical tasks:**\n\n```pascal\n// Extract initials from a full name\nfunction GetInitials(sFullName: string): string;\nvar\n  i: integer;\n  sResult: string;\nbegin\n  sResult := UpperCase(sFullName[1]);\n  for i := 2 to Length(sFullName) do\n    if sFullName[i - 1] = \\x27 \\x27 then\n      sResult := sResult + UpperCase(sFullName[i]);\n  Result := sResult;\nend;\n// GetInitials(\\x27Nelson Rolihlahla Mandela\\x27) = \\x27NRM\\x27\n\n// Count vowels in a string\nfunction CountVowels(sText: string): integer;\nvar\n  i, iCount: integer;\nbegin\n  iCount := 0;\n  sText := UpperCase(sText);\n  for i := 1 to Length(sText) do\n    if sText[i] in [\\x27A\\x27,\\x27E\\x27,\\x27I\\x27,\\x27O\\x27,\\x27U\\x27] then\n      Inc(iCount);\n  Result := iCount;\nend;\n\n// Reverse a string\nfunction ReverseStr(s: string): string;\nvar\n  i: integer;\nbegin\n  Result := \\x27\\x27;\n  for i := Length(s) downto 1 do\n    Result := Result + s[i];\nend;\n```"),
  q(3, "What is the output of Copy('Johannesburg', 1, 6)?",
    ['Johann', 'Johanne', 'Johan', 'Johannes'], 0,
    "Copy('Johannesburg', 1, 6) extracts 6 characters starting from position 1: 'Johann'."),
  t(4, "### Section B Practice: SQL in Delphi\n\n**Common exam task:** Write code to execute an SQL query and display results.\n\n```pascal\n// Count learners per province and display in a memo\nprocedure TForm1.btnCountClick(Sender: TObject);\nvar\n  qry: TADOQuery;\nbegin\n  qry := dmData.qryLearners;\n  qry.Close;\n  qry.SQL.Clear;\n  qry.SQL.Add(\\x27SELECT Province,\\x27);\n  qry.SQL.Add(\\x27COUNT(*) AS NumLearners\\x27);\n  qry.SQL.Add(\\x27FROM tblLearners\\x27);\n  qry.SQL.Add(\\x27GROUP BY Province\\x27);\n  qry.SQL.Add(\\x27ORDER BY NumLearners DESC\\x27);\n  qry.Open;\n  \n  memOutput.Clear;\n  memOutput.Lines.Add(Format(\\x27%-20s %s\\x27,\n    [\\x27Province\\x27, \\x27Learners\\x27]));\n  memOutput.Lines.Add(\\x27----------------------------\\x27);\n  \n  while not qry.Eof do\n  begin\n    memOutput.Lines.Add(Format(\\x27%-20s %d\\x27, [\n      qry.FieldByName(\\x27Province\\x27).AsString,\n      qry.FieldByName(\\x27NumLearners\\x27).AsInteger\n    ]));\n    qry.Next;\n  end;\nend;\n```"),
  t(5, "### Section C Practice: OOP Implementation\n\n**Exam-style class implementation:**\n\n```pascal\ntype\n  TBook = class(TObject)\n  private\n    fTitle: string;\n    fAuthor: string;\n    fPrice: real;\n    fQuantity: integer;\n  public\n    constructor Create(sTitle, sAuthor: string;\n      rPrice: real; iQty: integer);\n    function GetTitle: string;\n    function GetPrice: real;\n    function GetQuantity: integer;\n    procedure SetQuantity(iNewQty: integer);\n    function CalcStockValue: real;\n    function ToString: string; override;\n  end;\n\nconstructor TBook.Create(sTitle, sAuthor: string;\n  rPrice: real; iQty: integer);\nbegin\n  fTitle := sTitle;\n  fAuthor := sAuthor;\n  fPrice := rPrice;\n  if iQty >= 0 then\n    fQuantity := iQty\n  else\n    fQuantity := 0;\nend;\n\nfunction TBook.CalcStockValue: real;\nbegin\n  Result := fPrice * fQuantity;\nend;\n\nfunction TBook.ToString: string;\nbegin\n  Result := fTitle + \\x27 by \\x27 + fAuthor +\n    \\x27 | Price: R\\x27 +\n    FloatToStrF(fPrice, ffFixed, 10, 2) +\n    \\x27 | Qty: \\x27 + IntToStr(fQuantity) +\n    \\x27 | Value: R\\x27 +\n    FloatToStrF(CalcStockValue, ffFixed, 10, 2);\nend;\n```"),
  fb(6, 'In the TBook class, the method CalcStockValue is an example of an ___ method because it supports the ToString method. The constructor validates that quantity is not ___.',
    ['auxiliary', 'negative'],
    'CalcStockValue is an auxiliary (helper) method used internally by ToString. The constructor validates that quantity is >= 0.'),
  t(7, "### Section D Practice: Arrays and File Handling\n\n**Processing a text file into an array:**\n\n```pascal\nvar\n  tf: TextFile;\n  arrNames: array[1..100] of string;\n  arrMarks: array[1..100] of integer;\n  iCount, i, iMax, iMaxPos: integer;\nbegin\n  AssignFile(tf, \\x27marks.txt\\x27);\n  Reset(tf);\n  iCount := 0;\n  \n  while not Eof(tf) do\n  begin\n    Inc(iCount);\n    ReadLn(tf, arrNames[iCount]);\n    ReadLn(tf, arrMarks[iCount]);\n  end;\n  CloseFile(tf);\n  \n  // Find the highest mark\n  iMax := arrMarks[1];\n  iMaxPos := 1;\n  for i := 2 to iCount do\n    if arrMarks[i] > iMax then\n    begin\n      iMax := arrMarks[i];\n      iMaxPos := i;\n    end;\n  \n  ShowMessage(\\x27Top learner: \\x27 + arrNames[iMaxPos] +\n    \\x27 with \\x27 + IntToStr(iMax) + \\x27%\\x27);\nend;\n```"),
  q(8, 'In the code above, why does the loop to find the maximum start at i := 2 instead of i := 1?',
    ['Because iMax is already set to arrMarks[1], so we compare from the second element', 'Because arrays in Delphi start at index 2', 'To skip the header row', 'It is a mistake in the code'], 0,
    'The variable iMax is initialised to arrMarks[1] before the loop. Starting at i := 2 avoids comparing the first element to itself unnecessarily.'),
  t(9, "### General Exam Tips for Paper 2\n\n1. **Read the entire question first** before starting to code\n2. **Use meaningful variable names** with type prefixes (s for string, i for integer, r for real, b for boolean)\n3. **Comment your code** briefly to explain logic\n4. **Compile frequently** to catch errors early\n5. **Test with the provided test data** but also try edge cases\n6. **Do not hardcode values** that should come from the database or user input\n7. **Use Format and FloatToStrF** for neat output formatting\n8. **Remember:** `qry.Open` for SELECT, `qry.ExecSQL` for INSERT/UPDATE/DELETE\n9. **Save your work regularly** (Ctrl+S after every section)\n10. **If stuck, move on** and come back later. Do not spend 30 minutes on a 5-mark question."),
  t(10, "### Quick Reference: Common Delphi Conversions\n\n| Conversion | Function |\n|-----------|----------|\n| String to Integer | `StrToInt(s)` |\n| Integer to String | `IntToStr(i)` |\n| String to Float | `StrToFloat(s)` |\n| Float to String | `FloatToStr(r)` |\n| Float to formatted String | `FloatToStrF(r, ffFixed, 10, 2)` |\n| Char to ASCII code | `Ord(c)` |\n| ASCII code to Char | `Chr(i)` |\n| Format string | `Format('%s scored %d', [sName, iMark])` |\n| Date to String | `FormatDateTime('dd/mm/yyyy', dDate)` |\n| String to Date | `StrToDate(s)` |\n\n**Boolean operations:**\n- `AND`, `OR`, `NOT` for logical operations\n- `div` for integer division (10 div 3 = 3)\n- `mod` for remainder (10 mod 3 = 1)"),
];

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT EVERYTHING
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
      title: 'Chapter 1: Database Design',
      description: 'Relational database design, normalisation, transaction processing, characteristics of good database design, caring for and managing data, hacking.',
      order: 1,
      lessons: [
        { title: 'Relational Database Design', description: 'Tables, keys, relationships, ERDs, referential integrity, data types, and validation.', blocks: ch1_lesson1, term: 1 },
        { title: 'Normalisation and Transaction Processing', description: 'Normal forms (1NF, 2NF, 3NF), ACID properties, good database design, and data protection.', blocks: ch1_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 2: Object-Oriented Programming',
      description: 'OOP concepts: classes, objects, encapsulation, inheritance, polymorphism, constructors, accessor/mutator methods, ToString, and auxiliary methods.',
      order: 2,
      lessons: [
        { title: 'OOP Fundamentals: Classes, Objects, and Encapsulation', description: 'Defining classes, creating objects, constructors, accessor and mutator methods, and the ToString method.', blocks: ch2_lesson1, term: 1 },
        { title: 'Inheritance, Polymorphism, and Auxiliary Methods', description: 'Extending classes with inheritance, overriding methods for polymorphism, and writing helper methods.', blocks: ch2_lesson2, term: 1 },
      ],
    },
    {
      title: 'Chapter 3: SQL',
      description: 'SELECT with calculated fields, DISTINCT, ORDER BY, WHERE clause operators, aggregate functions, GROUP BY, HAVING, JOINs, INSERT, DELETE, UPDATE.',
      order: 3,
      lessons: [
        { title: 'SELECT Queries and Filtering', description: 'Basic SELECT, calculated fields, DISTINCT, WHERE clause with comparison operators, LIKE, BETWEEN, AND/OR/NOT, IS NULL, IN, and ORDER BY.', blocks: ch3_lesson1, term: 1 },
        { title: 'Aggregate Functions, GROUP BY, JOINs, and DML', description: 'COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING, INNER JOIN, INSERT, UPDATE, and DELETE.', blocks: ch3_lesson2, term: 2 },
      ],
    },
    {
      title: 'Chapter 4: Hardware and Systems Technologies',
      description: 'Mobile technologies, factors influencing computer performance, cloud computing, virtual reality, augmented reality, and system requirements.',
      order: 4,
      lessons: [
        { title: 'Hardware, Mobile Tech, Cloud, VR, and AR', description: 'Mobile technologies, computer performance factors, cloud computing models, VR vs AR, and system specifications.', blocks: ch4_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 5: Database Management',
      description: 'Data collection, location-based data, data warehousing and mining, caring for and managing data.',
      order: 5,
      lessons: [
        { title: 'Data Collection, Warehousing, Mining, and Management', description: 'Data collection methods, location-based data, data warehousing, ETL, data mining techniques, backups, and POPIA.', blocks: ch5_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 6: Social Implications',
      description: 'Advantages and disadvantages of mobile technology, privacy impacts, IoT technologies and societal impact, digital citizenship.',
      order: 6,
      lessons: [
        { title: 'Social Implications, Privacy, IoT, and Digital Citizenship', description: 'Mobile technology impacts, personal and business privacy, POPIA, Internet of Things, and ethical behaviour.', blocks: ch6_lesson1, term: 1 },
      ],
    },
    {
      title: 'Chapter 7: Internet Services and Communication',
      description: 'Internet services, online applications, role of SQL in web apps, scripting languages, formatting output, connectivity, remote access, and security.',
      order: 7,
      lessons: [
        { title: 'Internet Services, Web Technologies, and Security', description: 'Internet protocols, web vs desktop applications, SQL injection, scripting languages, connectivity types, remote access, and VPNs.', blocks: ch7_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 8: Software Engineering',
      description: 'Software engineering principles, computational thinking, problem-solving with flowcharts and pseudocode, testing, documentation, and maintenance.',
      order: 8,
      lessons: [
        { title: 'SDLC, Computational Thinking, Testing, and Documentation', description: 'Software development life cycle, decomposition, pattern recognition, abstraction, algorithms, flowcharts, pseudocode, testing strategies, and maintenance.', blocks: ch8_lesson1, term: 3 },
      ],
    },
    {
      title: 'Chapter 9: Solution Development',
      description: 'Arrays (1D and 2D), string manipulation, date functions, file handling, integrating database with programming, and designing real-world solutions.',
      order: 9,
      lessons: [
        { title: 'Arrays, Strings, and Date Functions', description: '1D and 2D arrays, searching, sorting, string manipulation functions, and date operations in Delphi.', blocks: ch9_lesson1, term: 2 },
        { title: 'File Handling and Database Integration', description: 'Text file operations, parameterised queries, processing query results, and designing complete solutions.', blocks: ch9_lesson2, term: 3 },
      ],
    },
    {
      title: 'Chapter 10: Revision and Exam Preparation',
      description: 'Paper 1 (150 marks, 3hrs): Theory covering all topics. Paper 2 (150 marks, 3hrs): Practical programming exam. Exam strategies and tips.',
      order: 10,
      lessons: [
        { title: 'Paper 1: Theory Revision', description: 'Revision of database design, SQL, OOP, communications, data management, and solution development theory.', blocks: ch10_lesson1, term: 4 },
        { title: 'Paper 2: Practical Revision', description: 'Practice for the practical exam: string manipulation, SQL in Delphi, OOP implementation, arrays, and file handling.', blocks: ch10_lesson2, term: 4 },
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
    title: 'Grade 12 Information Technology \u2014 CAPS Textbook',
    description: 'Complete CAPS-aligned textbook covering Database Design, OOP, SQL, Hardware, Data Management, Social Implications, Internet Services, Software Engineering, Solution Development, and Exam Preparation for Grade 12 Information Technology.',
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
  console.log('  TEXTBOOK: Grade 12 Information Technology');
  console.log('  ID: ' + String(textbook.insertedId));
  console.log('  Chapters: ' + textbookChapters.length);
  console.log('  Lessons: ' + totalLessons);
  console.log('========================================');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
