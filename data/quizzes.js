export const quizzes = {
  "arrays": [
    {
      question: "What is the time complexity of accessing an element in an array by its index?",
      options: {
        "o1": "O(1)",
        "on": "O(n)",
        "ologn": "O(log n)",
        "on2": "O(n^2)"
      },
      answer: "o1",
      explanation: "Arrays store elements in contiguous memory locations. Using the starting address and index math, RAM accesses the location instantly in constant time."
    },
    {
      question: "What is the time complexity of inserting an element at the beginning of an array of size N?",
      options: {
        "o1": "O(1)",
        "on": "O(n)",
        "ologn": "O(log n)",
        "onlogn": "O(n log n)"
      },
      answer: "on",
      explanation: "To insert an element at the index 0, all existing N elements must be shifted one position to the right, which takes linear time."
    }
  ],
  "linked-lists": [
    {
      question: "Which of the following is a primary advantage of Linked Lists over Arrays?",
      options: {
        "access": "O(1) Access time to random elements",
        "cache": "Better cache locality of elements",
        "dynamic": "Dynamic sizing without allocating sequential memory blocks",
        "overhead": "Lower memory overhead per element"
      },
      answer: "dynamic",
      explanation: "Linked lists store elements in separate non-contiguous nodes linked by pointers, allowing insertion and deletion without resizing sequential blocks."
    }
  ],
  "trees": [
    {
      question: "What is the time complexity of searching for an element in a balanced Binary Search Tree?",
      options: {
        "o1": "O(1)",
        "ologn": "O(log n)",
        "on": "O(n)",
        "onlogn": "O(n log n)"
      },
      answer: "ologn",
      explanation: "A balanced BST splits the search space in half with each node comparison, resulting in logarithmic time complexity."
    },
    {
      question: "Which tree traversal visits the root node first, followed by the left subtree, and then the right subtree?",
      options: {
        "in": "In-order traversal",
        "pre": "Pre-order traversal",
        "post": "Post-order traversal",
        "level": "Level-order traversal"
      },
      answer: "pre",
      explanation: "Pre-order traversal visits nodes in the sequence: Root -> Left -> Right. In-order is Left -> Root -> Right, and Post-order is Left -> Right -> Root."
    },
    {
      question: "What is the height of a balanced Binary Tree with N nodes?",
      options: {
        "log": "O(log N)",
        "n": "O(N)",
        "n2": "O(N^2)",
        "1": "O(1)"
      },
      answer: "log",
      explanation: "In a balanced binary tree, the height is logarithmic with respect to the number of nodes, meaning the path from root to leaf is at most log2(N)."
    }
  ]
};
