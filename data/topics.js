export const topics = [
  {
    id: "arrays",
    title: "Arrays: The Foundation",
    slug: "arrays",
    track: "dsa",
    module: "Module 2",
    badge: "Core Foundation",
    lessonsCount: "5/15 lessons",
    iconName: "view_array",
    description: "Contiguous memory structures for fast indexed access and foundational algorithmic manipulation.",
    content: "An array is the simplest and most widely used data structure. It operates on a fundamental premise: storing elements of the same type in contiguous memory locations. This contiguous nature is what gives arrays their superpower—constant time access to any element via its index.",
    order: 1,
    prev: null,
    next: "linked-lists",
    difficulty: "easy",
    estimatedTime: "10 min",
    complexity: {
      access: "O(1)",
      search: "O(N)",
      insertion: "O(N)",
      deletion: "O(N)",
      space: "O(N)"
    },
    commonMistakes: [
      "Out of Bounds Access: Accessing index N on an array of size N (valid indices are 0 to N-1).",
      "Ignoring Resizing Overhead: Assuming append operations on dynamic vectors are always O(1) without considering capacity reallocation.",
      "Uninitialized Memory: Failing to zero-initialize primitive arrays in C++, leading to unexpected garbage values."
    ],
    intuition: {
      title: "Code Intuition: Space vs Time",
      text: "While arrays provide blazing fast O(1) read times, they are inflexible. If you need to add an element to an array that is already full, you must allocate a completely new, larger block of memory and copy all existing elements over. This makes insertion O(N) in the worst case."
    },
    codeSnippet: {
      fileName: "main.cpp",
      language: "cpp",
      code: `#include <iostream>
#include <array>

int main() {
    // 1. Traditional C-style array
    int rawArray[5] = {10, 20, 30, 40, 50};

    // 2. Modern C++ std::array (Preferred)
    std::array<int, 5> modernArray = {10, 20, 30, 40, 50};

    // Accessing via index (O(1) time complexity)
    std::cout << "First element: " << modernArray[0] << std::endl;
    
    return 0;
}`
    },
    concepts: [
      {
        icon: "memory",
        title: "Contiguous Memory",
        desc: "Elements are placed back-to-back in RAM, eliminating overhead between items and allowing for cache-friendly iterations."
      },
      {
        icon: "bolt",
        title: "O(1) Access",
        desc: "Because the starting address is known, the address of any element can be mathematically calculated instantly using its index."
      }
    ],
    table: {
      title: "Visualizing Memory Layout",
      desc: "Let's look at how the modernArray from our code block actually sits in RAM. Assuming an integer takes 4 bytes, notice how the memory addresses increment steadily.",
      headers: ["Index", "Value", "Memory Address (Hex)"],
      rows: [
        ["0", "10", "0x7ffee21ab9a0"],
        ["1", "20", "0x7ffee21ab9a4 (+4 bytes)"],
        ["2", "30", "0x7ffee21ab9a8"],
        ["3", "40", "0x7ffee21ab9ac"],
        ["4", "50", "0x7ffee21ab9b0"]
      ]
    }
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    slug: "linked-lists",
    track: "dsa",
    module: "Module 3",
    badge: "Dynamic Structures",
    lessonsCount: "12/15 lessons",
    iconName: "linear_scale",
    description: "Nodes connected by pointers allowing for efficient dynamic sizing and memory allocation.",
    content: "A linked list is a linear data structure where elements are not stored in contiguous memory locations. Instead, each element (called a node) is a separate object that contains a reference (or link/pointer) to the next node in the sequence. It allows for O(1) dynamic resizing without allocating sequential memory blocks.",
    order: 2,
    prev: "arrays",
    next: "stacks-queues",
    difficulty: "medium",
    estimatedTime: "15 min",
    complexity: {
      access: "O(N)",
      search: "O(N)",
      insertion: "O(1)",
      deletion: "O(1)",
      space: "O(N)"
    },
    commonMistakes: [
      "Memory Leaks: Forgetting to delete node pointers when removing them, causing allocated memory to persist in C++.",
      "Null Pointer Dereference: Accessing next pointers (e.g. curr->next->data) without first checking if the current node or next node is nullptr.",
      "Losing the Head Pointer: Accidentally modifying the head node pointer directly during traversals instead of using a temporary cursor."
    ],
    intuition: {
      title: "Code Intuition: Sequential Access",
      text: "Unlike arrays, linked lists do not support random access. To find the N-th element, you must start at the head node and traverse through N-1 next pointers. This makes lookup operations O(N). Use linked lists when insertion/deletion efficiency outweighs index lookup speed."
    },
    codeSnippet: {
      fileName: "linked_list.cpp",
      language: "cpp",
      code: `#include <iostream>

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

int main() {
    Node* head = new Node(10);
    head->next = new Node(20);
    head->next->next = new Node(30);

    // Traversal (O(N) time complexity)
    Node* temp = head;
    while (temp != nullptr) {
        std::cout << temp->data << " -> ";
        temp = temp->next;
    }
    std::cout << "NULL" << std::endl;
    return 0;
}`
    },
    concepts: [
      {
        icon: "linear_scale",
        title: "Dynamic Allocation",
        desc: "Nodes can be allocated anywhere in memory, linked together by pointers. No contiguous block is required."
      },
      {
        icon: "add_circle",
        title: "O(1) Insertions",
        desc: "Inserting or deleting elements only requires changing a few pointer references, rather than shifting elements."
      }
    ],
    table: {
      title: "Visualizing Node Pointer Links",
      desc: "Nodes are non-contiguous. Each node contains a data value and the memory address of the next node.",
      headers: ["Node Position", "Node Value", "Memory Address (Self)", "Next Address (Pointer)"],
      rows: [
        ["Head (0)", "10", "0x3004a0", "0x3004c8 (Points to Next)"],
        ["Second (1)", "20", "0x3004c8", "0x3005f0"],
        ["Third (2)", "30", "0x3005f0", "0x000000 (nullptr)"]
      ]
    }
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    slug: "stacks-queues",
    track: "dsa",
    module: "Module 4",
    badge: "Linear Collections",
    lessonsCount: "0/10 lessons",
    iconName: "layers",
    description: "LIFO and FIFO linear data structures essential for recursive algorithms and task processing.",
    content: "Stacks and Queues are linear data structures that follow specific rules of insertion and removal. A Stack operates on a LIFO (Last In First Out) basis, typically used in compiler call stack execution and depth-first traversals. A Queue operates on a FIFO (First In First Out) basis, standard for scheduling systems and breadth-first search logic.",
    order: 3,
    prev: "linked-lists",
    next: "trees",
    difficulty: "easy",
    estimatedTime: "12 min",
    complexity: {
      access: "O(N)",
      search: "O(N)",
      insertion: "O(1)",
      deletion: "O(1)",
      space: "O(N)"
    },
    commonMistakes: [
      "Stack Overflow/Underflow: Attempting to pop elements from an empty container, or pushing beyond predefined boundary limits.",
      "Order Confusion: Confusing enqueue (rear) and dequeue (front) operations, leading to wrong evaluation orders.",
      "Unbounded Vectors: Building stacks on vectors that frequently trigger dynamic array doublings when a list would be more predictable."
    ],
    intuition: {
      title: "Code Intuition: LIFO vs FIFO Operations",
      text: "Stacks represent LIFO (Last In First Out) workflows, resembling a stack of dinner plates where you only interact with the top. Queues represent FIFO (First In First Out) workflows, resembling a real-world checkout queue where the first person in line is served first. Both are highly restricted interfaces to optimize push and pop operations."
    },
    codeSnippet: {
      fileName: "stacks_queues.cpp",
      language: "cpp",
      code: `#include <iostream>
#include <stack>
#include <queue>

int main() {
    // 1. C++ Standard Library Stack (LIFO)
    std::stack<int> s;
    s.push(10);
    s.push(20);
    std::cout << "Stack Top: " << s.top() << std::endl; // Output: 20
    s.pop();

    // 2. C++ Standard Library Queue (FIFO)
    std::queue<int> q;
    q.push(10);
    q.push(20);
    std::cout << "Queue Front: " << q.front() << std::endl; // Output: 10
    q.pop();

    return 0;
}`
    },
    concepts: [
      {
        icon: "layers",
        title: "Top-Only Interaction",
        desc: "Stacks restrict access to the top element, which guarantees simple, fail-safe O(1) state modifications."
      },
      {
        icon: "sync",
        title: "FIFO Scheduling",
        desc: "Queues enforce processing orders based on entry times, critical for breadth-first algorithms and request buffers."
      }
    ],
    table: {
      title: "Queue Buffer Operations",
      desc: "Visualizing elements in a queue showing Front and Rear pointers.",
      headers: ["Position", "State / Action", "Element Value", "Pointers"],
      rows: [
        ["[0]", "Already Dequeued", "--", "-"],
        ["[1]", "Active Front", "10", "Front Pointer"],
        ["[2]", "Middle Element", "20", "-"],
        ["[3]", "Active Rear", "30", "Rear Pointer"]
      ]
    }
  },
  {
    id: "trees",
    title: "Trees",
    slug: "trees",
    track: "dsa",
    module: "Module 5",
    badge: "Hierarchical Structures",
    lessonsCount: "2/20 lessons",
    iconName: "account_tree",
    description: "Hierarchical data structures with a root node, critical for fast searching, sorting, and routing.",
    content: "A tree is a non-linear hierarchical data structure that consists of nodes connected by edges. Unlike arrays and linked lists which are linear, trees represent hierarchical relationships. The top node is called the root, and each node has parent-child relationships, crucial for databases, file systems, and compiler representations.",
    order: 4,
    prev: "stacks-queues",
    next: "graphs",
    difficulty: "medium",
    estimatedTime: "20 min",
    complexity: {
      access: "O(log N)",
      search: "O(log N)",
      insertion: "O(log N)",
      deletion: "O(log N)",
      space: "O(N)"
    },
    commonMistakes: [
      "Skewed Trees: Forgetting to balance a Binary Search Tree, letting it degrade into an O(N) linked list.",
      "Recursion Traps: Forgetting base cases when writing recursive traversals, leading to infinite call stack loops.",
      "Incorrect Pointer Updates: Forgetting to update a parent's left/right pointers to nullptr after deleting a child node."
    ],
    intuition: {
      title: "Code Intuition: Balance is Key",
      text: "The efficiency of a tree depends entirely on its shape. A balanced BST guarantees O(log N) operations. However, if values are inserted in sorted order, the tree degenerates into a single line (like a linked list), dropping efficiency to O(N)."
    },
    codeSnippet: {
      fileName: "bst.cpp",
      language: "cpp",
      code: `#include <iostream>

struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int val) : data(val), left(nullptr), right(nullptr) {}
};

int main() {
    TreeNode* root = new TreeNode(50);
    root->left = new TreeNode(30);
    root->right = new TreeNode(70);

    std::cout << "Root node: " << root->data << std::endl;
    std::cout << "Left child: " << root->left->data << std::endl;
    std::cout << "Right child: " << root->right->data << std::endl;
    return 0;
}`
    },
    concepts: [
      {
        icon: "account_tree",
        title: "Hierarchical Nodes",
        desc: "Represents parental relationships with a root node branching out to subtrees. Avoids linear search limitations."
      },
      {
        icon: "search",
        title: "O(log N) Operations",
        desc: "In balanced trees like BSTs, each comparison discards half of the remaining elements, similar to binary search."
      }
    ],
    table: {
      title: "Node Level and Node Details",
      desc: "A hierarchical representation of nodes in our simple Binary Search Tree.",
      headers: ["Node Value", "Node Level", "Left Child", "Right Child"],
      rows: [
        ["50 (Root)", "Level 0", "30", "70"],
        ["30 (Left)", "Level 1", "nullptr", "nullptr"],
        ["70 (Right)", "Level 1", "nullptr", "nullptr"]
      ]
    }
  },
  {
    id: "graphs",
    title: "Graphs",
    slug: "graphs",
    track: "dsa",
    module: "Module 6",
    badge: "Network Connections",
    lessonsCount: "0/25 lessons",
    iconName: "share",
    description: "Complex networks of nodes and edges representing relationships, paths, and flow.",
    content: "A graph is a non-linear data structure consisting of vertices (or nodes) and edges that connect these vertices. Graphs are used to model networks like social graph connections, traffic routes, network routing packets, or job execution dependency trees.",
    order: 5,
    prev: "trees",
    next: "dynamic-programming",
    difficulty: "hard",
    estimatedTime: "25 min",
    complexity: {
      access: "N/A",
      search: "O(V + E)",
      insertion: "O(1)",
      deletion: "O(V + E)",
      space: "O(V + E)"
    },
    commonMistakes: [
      "Infinite Cycles: Failing to keep track of a 'visited' set in cyclic graphs, causing DFS/BFS to run infinitely.",
      "Memory Inefficiency: Using an O(V^2) adjacency matrix when an adjacency list O(V + E) would save significant memory.",
      "Directed vs Undirected: Adding edges only in one direction in an undirected graph representation, breaking navigation paths."
    ],
    intuition: {
      title: "Code Intuition: Network Connections",
      text: "Graphs are extremely flexible. A tree is actually just a special type of graph (a connected, acyclic directed graph). Graphs allow nodes to connect in arbitrary patterns with cycles, which means traversals must track visited vertices to avoid infinite recursion."
    },
    codeSnippet: {
      fileName: "graph.cpp",
      language: "cpp",
      code: `#include <iostream>
#include <vector>
#include <list>

class Graph {
    int V;
    std::vector<std::list<int>> adj;
public:
    Graph(int V) {
        this->V = V;
        adj.resize(V);
    }
    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u); // Undirected graph
    }
    void printGraph() {
        for (int i = 0; i < V; ++i) {
            std::cout << "Vertex " << i << " connects to: ";
            for (int neighbor : adj[i]) {
                std::cout << neighbor << " ";
            }
            std::cout << std::endl;
        }
    }
};

int main() {
    Graph g(4);
    g.addEdge(0, 1);
    g.addEdge(0, 2);
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    g.printGraph();
    return 0;
}`
    },
    concepts: [
      {
        icon: "share",
        title: "Vertices & Edges",
        desc: "Nodes represent entities and edges represent relationships (directed or undirected, weighted or unweighted)."
      },
      {
        icon: "search",
        title: "Graph Traversals",
        desc: "BFS uses queues for shortest path search, and DFS uses stacks or recursion for backtracking."
      }
    ],
    table: {
      title: "Adjacency List Representation",
      desc: "A layout showing adjacency lists of vertices for the graph defined in our C++ code snippet.",
      headers: ["Vertex (Index)", "Connections (List of Adjacent Vertices)"],
      rows: [
        ["0", "1 -> 2"],
        ["1", "0 -> 2"],
        ["2", "0 -> 1 -> 3"],
        ["3", "2"]
      ]
    }
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    slug: "dynamic-programming",
    track: "dsa",
    module: "Module 7",
    badge: "Algorithmic Paradigms",
    lessonsCount: "0/30 lessons",
    iconName: "bolt",
    description: "Optimization techniques that break complex problems down into simpler subproblems.",
    content: "Dynamic Programming (DP) is an algorithmic optimization paradigm. It is used to solve complex problems by breaking them down into simpler, overlapping subproblems. The answers to these subproblems are stored (memoized or tabulated) so that they are solved only once, transforming exponential execution times into polynomial or linear times.",
    order: 6,
    prev: "graphs",
    next: null,
    difficulty: "hard",
    estimatedTime: "30 min",
    complexity: {
      access: "N/A",
      search: "N/A",
      insertion: "N/A",
      deletion: "N/A",
      space: "O(N)"
    },
    commonMistakes: [
      "Incorrect Base Cases: Forgetting to specify the bottom-most conditions (e.g., F(0) or F(1)), leading to stack overflow.",
      "Redundant Recomputation: Writing recursive code without memoization, leading to exponential O(2^N) complexity.",
      "Incorrect State Transition: Specifying a recurrence relation that doesn't capture all overlapping dependencies."
    ],
    intuition: {
      title: "Code Intuition: Overlapping Subproblems",
      text: "Dynamic Programming is recursion optimized. If a problem can be broken down into subproblems, and those subproblems overlap (meaning we solve the same subproblems repeatedly), we can save the solutions in a table (memoization for top-down, tabulation for bottom-up) to avoid redundant work."
    },
    codeSnippet: {
      fileName: "fibonacci.cpp",
      language: "cpp",
      code: `#include <iostream>
#include <vector>

// Bottom-up Tabulation (O(N) time, O(N) space)
int getFibonacci(int n) {
    if (n <= 1) return n;
    std::vector<int> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}

int main() {
    int n = 10;
    std::cout << "Fibonacci number at index " << n << " is: " << getFibonacci(n) << std::endl;
    return 0;
}`
    },
    concepts: [
      {
        icon: "bolt",
        title: "Tabulation & Memoization",
        desc: "Memoization stores recursive results (top-down), while tabulation builds the solution iteratively from the base case (bottom-up)."
      },
      {
        icon: "speed",
        title: "Exponential to Linear",
        desc: "Reduces execution time from O(2^N) to O(N) by solving each subproblem exactly once."
      }
    ],
    table: {
      title: "Tabulation State Array",
      desc: "The state of the DP array as we compute Fibonacci up to index 5.",
      headers: ["Index (i)", "State Transition Formula", "DP Value", "Status"],
      rows: [
        ["0", "Base Case", "0", "Solved"],
        ["1", "Base Case", "1", "Solved"],
        ["2", "dp[1] + dp[0]", "1", "Solved"],
        ["3", "dp[2] + dp[1]", "2", "Solved"],
        ["4", "dp[3] + dp[2]", "3", "Solved"],
        ["5", "dp[4] + dp[3]", "5", "Solved"]
      ]
    }
  }
];
