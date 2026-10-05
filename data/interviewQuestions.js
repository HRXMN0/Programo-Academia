// Interview-prep question bank. Kept out of the page so the homepage can report a
// real question count instead of a made-up module total.
export const interviewQuestions = [
  {
    id: 'vector-resizing',
    title: 'Vector Resizing Mechanics',
    question: 'How does a dynamic array/vector resize itself when capacity is full?',
    difficulty: 'Medium',
    topic: 'Arrays',
    hint: 'Think about memory reallocation, time complexities (amortized O(1) vs worst-case O(N)), and the capacity growth factor.',
    sampleAnswer:
      'A vector allocates a contiguous block of memory. When it runs out of capacity, it allocates a new block that is twice the size (or 1.5x in MSVC), copies all elements to the new block, and deletes the old block. This copy is O(N) in the worst case but results in O(1) amortized insertion time.'
  },
  {
    id: 'vector-vs-list',
    title: 'Vector vs. List Memory Layout',
    question: 'What are the main performance and memory differences between std::vector and std::list in C++?',
    difficulty: 'Medium',
    topic: 'Data Structures',
    hint: 'Focus on memory layout (contiguous RAM block vs. scattered heap nodes), CPU cache locality, and runtime complexities for lookups, insertions, and deletions.',
    sampleAnswer:
      'std::vector stores elements contiguously in memory, which allows O(1) random access indexing and is CPU cache-friendly. std::list uses pointers to link scattered nodes, so random access is O(N), but insertion and deletion are O(1) once you have a pointer to the node. Vector suffers from shifting elements on insertion, whereas list suffers from cache misses due to pointer chasing.'
  },
  {
    id: 'linked-list-cycle',
    title: 'Linked List Cycle Detection',
    question: 'How do you detect a cycle in a singly linked list using pointers?',
    difficulty: 'Easy',
    topic: 'Linked Lists',
    hint: "Describe Floyd's Cycle-Finding Algorithm (Tortoise and Hare) and contrast its space/time complexity with a Hash Set approach.",
    sampleAnswer:
      "We can use Floyd's Tortoise and Hare algorithm. We initialize two pointers, a slow pointer moving 1 step at a time, and a fast pointer moving 2 steps. If there is a cycle, the fast pointer will eventually catch up and meet the slow pointer. Otherwise, the fast pointer will reach the end (nullptr). This takes O(N) time and O(1) auxiliary space, whereas using a Hash Set takes O(N) space."
  },
  {
    id: 'recursion-vs-dp',
    title: 'Recursion vs. Dynamic Programming',
    question: 'What is the difference between simple recursion and dynamic programming?',
    difficulty: 'Medium',
    topic: 'Algorithms',
    hint: 'Discuss overlapping subproblems, memoization (top-down) vs tabulation (bottom-up), and the change in time/space complexity using Fibonacci or similar examples.',
    sampleAnswer:
      'Recursion is a method where a function calls itself to solve smaller subproblems. Dynamic programming is an optimization over recursion that solves overlapping subproblems by storing their results in a memoization table or tabulation array, avoiding redundant calculations. For example, recursive Fibonacci takes O(2^N) time due to overlapping branches, but DP reduces it to O(N) time.'
  }
]

export default interviewQuestions
