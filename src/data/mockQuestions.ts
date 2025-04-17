
export const mockQuestions = [
  // Algorithms questions
  {
    id: "q1",
    serialNumber: 1,
    text: "What is the time complexity of binary search?",
    options: [
      { id: "q1-opt1", text: "O(1)", isCorrect: false },
      { id: "q1-opt2", text: "O(log n)", isCorrect: true },
      { id: "q1-opt3", text: "O(n)", isCorrect: false },
      { id: "q1-opt4", text: "O(n log n)", isCorrect: false },
    ],
    explanation: "Binary search has a time complexity of O(log n) because it divides the search interval in half with each comparison.",
    categoryId: "cat1",
    tags: ["Algorithms", "Time Complexity", "Search Algorithms"],
    difficulty: "medium",
  },
  {
    id: "q2",
    serialNumber: 2,
    text: "Which sorting algorithm has the best average-case time complexity?",
    options: [
      { id: "q2-opt1", text: "Bubble Sort", isCorrect: false },
      { id: "q2-opt2", text: "Selection Sort", isCorrect: false },
      { id: "q2-opt3", text: "Merge Sort", isCorrect: false },
      { id: "q2-opt4", text: "Quick Sort", isCorrect: true },
    ],
    explanation: "Quick Sort has an average time complexity of O(n log n) and is generally faster in practice than other O(n log n) algorithms like Merge Sort due to better locality of reference and lower constant factors.",
    categoryId: "cat1",
    tags: ["Algorithms", "Sorting", "Time Complexity"],
    difficulty: "hard",
  },
  {
    id: "q3",
    serialNumber: 3,
    text: "What algorithm would you use to find the shortest path in an unweighted graph?",
    options: [
      { id: "q3-opt1", text: "Depth-First Search", isCorrect: false },
      { id: "q3-opt2", text: "Breadth-First Search", isCorrect: true },
      { id: "q3-opt3", text: "Dijkstra's Algorithm", isCorrect: false },
      { id: "q3-opt4", text: "A* Search Algorithm", isCorrect: false },
    ],
    explanation: "Breadth-First Search (BFS) is the most efficient algorithm for finding the shortest path in an unweighted graph because it explores all vertices at the current depth before moving to vertices at the next depth level.",
    categoryId: "cat1",
    tags: ["Algorithms", "Graph Theory", "Search Algorithms"],
    difficulty: "medium",
  },
  
  // Data Structures questions
  {
    id: "q4",
    serialNumber: 4,
    text: "Which data structure would be most efficient for implementing a priority queue?",
    options: [
      { id: "q4-opt1", text: "Array", isCorrect: false },
      { id: "q4-opt2", text: "Linked List", isCorrect: false },
      { id: "q4-opt3", text: "Binary Search Tree", isCorrect: false },
      { id: "q4-opt4", text: "Heap", isCorrect: true },
    ],
    explanation: "A heap is the most efficient data structure for implementing a priority queue because it allows O(log n) time for insertion and deletion operations while maintaining the priority order.",
    categoryId: "cat2",
    tags: ["Data Structures", "Heap", "Priority Queue"],
    difficulty: "medium",
  },
  {
    id: "q5",
    serialNumber: 5,
    text: "In a hash table, what happens when two different keys hash to the same index?",
    options: [
      { id: "q5-opt1", text: "Only the first key is stored", isCorrect: false },
      { id: "q5-opt2", text: "The second key replaces the first key", isCorrect: false },
      { id: "q5-opt3", text: "A collision occurs and must be resolved using techniques like chaining or open addressing", isCorrect: true },
      { id: "q5-opt4", text: "The hash function is automatically rebuilt", isCorrect: false },
    ],
    explanation: "When two different keys hash to the same index in a hash table, it's called a collision. Collisions are typically resolved using techniques like chaining (where each cell contains a linked list of entries) or open addressing (finding another slot by using a probing sequence).",
    categoryId: "cat2",
    tags: ["Data Structures", "Hash Table", "Collision Resolution"],
    difficulty: "medium",
  },
  
  // Operating Systems questions
  {
    id: "q6",
    serialNumber: 6,
    text: "What is a deadlock in an operating system?",
    options: [
      { id: "q6-opt1", text: "A process that consumes 100% of CPU resources", isCorrect: false },
      { id: "q6-opt2", text: "A situation where two or more processes are unable to proceed because each is waiting for resources held by the other", isCorrect: true },
      { id: "q6-opt3", text: "A background process that has crashed", isCorrect: false },
      { id: "q6-opt4", text: "When the operating system freezes due to a hardware failure", isCorrect: false },
    ],
    explanation: "A deadlock occurs when two or more processes are blocked forever, waiting for each other to release resources. This happens when processes hold resources while waiting for additional resources that are being held by other waiting processes.",
    categoryId: "cat3",
    tags: ["Operating Systems", "Process Management", "Deadlock"],
    difficulty: "hard",
  },
  
  // HTML & CSS questions
  {
    id: "q7",
    serialNumber: 7,
    text: "Which CSS property is used to control the space between elements?",
    options: [
      { id: "q7-opt1", text: "padding", isCorrect: false },
      { id: "q7-opt2", text: "margin", isCorrect: true },
      { id: "q7-opt3", text: "border", isCorrect: false },
      { id: "q7-opt4", text: "space", isCorrect: false },
    ],
    explanation: "The margin property in CSS is used to create space around elements, outside of any defined borders. It controls the space between elements.",
    categoryId: "cat4",
    tags: ["HTML", "CSS", "Layout"],
    difficulty: "easy",
  },
  
  // JavaScript questions
  {
    id: "q8",
    serialNumber: 8,
    text: "What will be the output of the following code?\n\nconsole.log(typeof NaN);",
    options: [
      { id: "q8-opt1", text: "'undefined'", isCorrect: false },
      { id: "q8-opt2", text: "'object'", isCorrect: false },
      { id: "q8-opt3", text: "'number'", isCorrect: true },
      { id: "q8-opt4", text: "'NaN'", isCorrect: false },
    ],
    explanation: "In JavaScript, NaN (Not a Number) is actually of type 'number'. This is one of the quirks of JavaScript. You can verify this using typeof NaN, which will return 'number'.",
    categoryId: "cat5",
    tags: ["JavaScript", "Data Types", "Quirks"],
    difficulty: "medium",
  },
  {
    id: "q9",
    serialNumber: 9,
    text: "Which of the following correctly creates a Promise in JavaScript?",
    options: [
      { id: "q9-opt1", text: "new Promise[resolve => resolve(true)]", isCorrect: false },
      { id: "q9-opt2", text: "Promise.new((resolve, reject) => resolve(true))", isCorrect: false },
      { id: "q9-opt3", text: "new Promise((resolve, reject) => resolve(true))", isCorrect: true },
      { id: "q9-opt4", text: "Promise((resolve, reject) => resolve(true))", isCorrect: false },
    ],
    explanation: "Promises in JavaScript are created using the Promise constructor which takes an executor function with two parameters: resolve and reject. The correct syntax is: new Promise((resolve, reject) => { ... }).",
    categoryId: "cat5",
    tags: ["JavaScript", "Promises", "Asynchronous Programming"],
    difficulty: "medium",
  },
  
  // Backend Development questions
  {
    id: "q10",
    serialNumber: 10,
    text: "What does REST stand for in the context of API design?",
    options: [
      { id: "q10-opt1", text: "Representational State Transfer", isCorrect: true },
      { id: "q10-opt2", text: "Resource State Transfer", isCorrect: false },
      { id: "q10-opt3", text: "Request-Response State Transfer", isCorrect: false },
      { id: "q10-opt4", text: "Remote Endpoint Service Technology", isCorrect: false },
    ],
    explanation: "REST stands for Representational State Transfer. It's an architectural style for designing networked applications that relies on a stateless, client-server communication protocol, typically HTTP.",
    categoryId: "cat6",
    tags: ["Backend", "API", "REST"],
    difficulty: "easy",
  },
  
  // SQL Fundamentals questions
  {
    id: "q11",
    serialNumber: 11,
    text: "Which SQL command is used to retrieve data from a database?",
    options: [
      { id: "q11-opt1", text: "GET", isCorrect: false },
      { id: "q11-opt2", text: "FETCH", isCorrect: false },
      { id: "q11-opt3", text: "SELECT", isCorrect: true },
      { id: "q11-opt4", text: "RETRIEVE", isCorrect: false },
    ],
    explanation: "The SELECT statement is used to retrieve data from one or more tables in a database. It's one of the most fundamental SQL commands and is part of the Data Manipulation Language (DML).",
    categoryId: "cat7",
    tags: ["SQL", "Queries", "DML"],
    difficulty: "easy",
  },
  
  // Database Design questions
  {
    id: "q12",
    serialNumber: 12,
    text: "What is normalization in database design?",
    options: [
      { id: "q12-opt1", text: "The process of optimizing database performance by adding redundant data", isCorrect: false },
      { id: "q12-opt2", text: "The process of organizing data to minimize redundancy and dependency", isCorrect: true },
      { id: "q12-opt3", text: "The process of converting a relational database to a NoSQL database", isCorrect: false },
      { id: "q12-opt4", text: "The process of backing up a database", isCorrect: false },
    ],
    explanation: "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. It typically involves dividing large tables into smaller, more specialized ones and defining relationships between them.",
    categoryId: "cat8",
    tags: ["Database Design", "Normalization", "Data Integrity"],
    difficulty: "medium",
  },
];
