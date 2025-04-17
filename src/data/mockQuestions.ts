
export const mockQuestions = [
  {
    id: "q1",
    serialNumber: 1001,
    text: "Which of the following is a measure of central tendency?",
    options: [
      { id: "q1o1", text: "Standard deviation", isCorrect: false },
      { id: "q1o2", text: "Variance", isCorrect: false },
      { id: "q1o3", text: "Mean", isCorrect: true },
      { id: "q1o4", text: "Range", isCorrect: false }
    ],
    explanation: "Mean is a measure of central tendency. Standard deviation, variance, and range are measures of dispersion.",
    categoryId: "cat1",
    tags: ["Epidemiology", "Biostatistics"],
    difficulty: "easy",
    correctAnswerRate: 85
  },
  {
    id: "q2",
    serialNumber: 1002,
    text: "What is the primary purpose of a case-control study?",
    options: [
      { id: "q2o1", text: "To determine incidence of disease", isCorrect: false },
      { id: "q2o2", text: "To identify risk factors for a disease", isCorrect: true },
      { id: "q2o3", text: "To test treatment efficacy", isCorrect: false },
      { id: "q2o4", text: "To calculate prevalence", isCorrect: false }
    ],
    explanation: "Case-control studies are designed to identify potential risk factors for a disease by comparing cases (people with the disease) to controls (people without the disease).",
    categoryId: "cat1",
    tags: ["Epidemiology", "Study Design"],
    difficulty: "medium",
    correctAnswerRate: 55
  },
  {
    id: "q3",
    serialNumber: 1003,
    text: "Which of the following data structures has O(1) insertion and deletion at both ends?",
    options: [
      { id: "q3o1", text: "Array", isCorrect: false },
      { id: "q3o2", text: "Stack", isCorrect: false },
      { id: "q3o3", text: "Queue", isCorrect: false },
      { id: "q3o4", text: "Deque (Double-ended queue)", isCorrect: true }
    ],
    explanation: "A Deque (Double-ended queue) allows insertions and deletions at both ends in constant time O(1).",
    categoryId: "cat2",
    tags: ["Data Structures", "Algorithms"],
    difficulty: "medium",
    correctAnswerRate: 45
  },
  {
    id: "q4",
    serialNumber: 1004,
    text: "Which of the following is the main function of an operating system? (Select all that apply)",
    options: [
      { id: "q4o1", text: "Memory management", isCorrect: true },
      { id: "q4o2", text: "Process scheduling", isCorrect: true },
      { id: "q4o3", text: "Device management", isCorrect: true },
      { id: "q4o4", text: "Compiling source code", isCorrect: false }
    ],
    explanation: "An operating system manages computer hardware and software resources including memory, processes, and devices. It does not compile source code, which is the job of a compiler.",
    categoryId: "cat3",
    tags: ["Operating Systems"],
    difficulty: "hard",
    correctAnswerRate: 25,
    imageUrl: "https://example.com/os-diagram.jpg"
  },
  {
    id: "q5",
    serialNumber: 1005,
    text: "Which CSS property is used to create space between elements?",
    options: [
      { id: "q5o1", text: "margin", isCorrect: true },
      { id: "q5o2", text: "spacing", isCorrect: false },
      { id: "q5o3", text: "gap", isCorrect: false },
      { id: "q5o4", text: "whitespace", isCorrect: false }
    ],
    explanation: "The margin property in CSS is used to create space around elements, outside of any defined borders.",
    categoryId: "cat4",
    tags: ["HTML & CSS"],
    difficulty: "easy",
    correctAnswerRate: 78
  },
  {
    id: "q6",
    serialNumber: 1006,
    text: "What JavaScript method is used to add new elements to the end of an array?",
    options: [
      { id: "q6o1", text: "unshift()", isCorrect: false },
      { id: "q6o2", text: "push()", isCorrect: true },
      { id: "q6o3", text: "append()", isCorrect: false },
      { id: "q6o4", text: "add()", isCorrect: false }
    ],
    explanation: "The push() method adds one or more elements to the end of an array and returns the new length of the array.",
    categoryId: "cat5",
    tags: ["JavaScript"],
    difficulty: "easy",
    correctAnswerRate: 90
  },
  {
    id: "q7",
    serialNumber: 1007,
    text: "Which of the following are features of a RESTful API? (Select all that apply)",
    options: [
      { id: "q7o1", text: "Statelessness", isCorrect: true },
      { id: "q7o2", text: "Client-server architecture", isCorrect: true },
      { id: "q7o3", text: "Cacheable responses", isCorrect: true },
      { id: "q7o4", text: "Requires XML format", isCorrect: false }
    ],
    explanation: "REST APIs are stateless, follow client-server architecture, and support cacheable responses. RESTful APIs can use various formats like JSON, XML, etc., but don't specifically require XML.",
    categoryId: "cat6",
    tags: ["Backend Development", "API"],
    difficulty: "medium",
    correctAnswerRate: 62
  },
  {
    id: "q8",
    serialNumber: 1008,
    text: "Which SQL clause is used to filter records based on a specified condition?",
    options: [
      { id: "q8o1", text: "ORDER BY", isCorrect: false },
      { id: "q8o2", text: "GROUP BY", isCorrect: false },
      { id: "q8o3", text: "WHERE", isCorrect: true },
      { id: "q8o4", text: "HAVING", isCorrect: false }
    ],
    explanation: "The WHERE clause in SQL is used to filter records based on a specified condition. It specifies which records to select from the database.",
    categoryId: "cat7",
    tags: ["SQL", "Databases"],
    difficulty: "easy",
    correctAnswerRate: 88
  }
];
