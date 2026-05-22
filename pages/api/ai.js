export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, question, context, answer, history = [] } = req.body
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Falls back to intelligent Mock system
    if (action === 'chat') {
      const responseText = getMockChatResponse(question, context, history)
      return res.status(200).json({ response: responseText })
    } else if (action === 'analyze') {
      const feedback = getMockFeedback(answer, question)
      return res.status(200).json({ feedback })
    }
    return res.status(400).json({ error: 'Invalid action' })
  }

  try {
    if (action === 'chat') {
      // 1. Structured prompt for Tutor Mode
      const systemPrompt = `You are a helpful senior C++ and DSA tutor on Programo Academia. 
TUTOR MODE: Explain concepts clearly, concisely, and structurally. Always use modern C++ snippets if helpful. 
Context: ${context || 'General inquiry about programming or DSA.'}
Encourage the user to learn step-by-step.`

      // 2. Add short chat memory: maintain last 4 messages from history + current question
      const slicedHistory = history.slice(-4).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const messages = [
        { role: 'system', content: systemPrompt },
        ...slicedHistory,
        { role: 'user', content: question }
      ]

      const responseText = await callOpenAI(messages, apiKey)
      return res.status(200).json({ response: responseText })
    } else if (action === 'analyze') {
      // 3. Structured prompt for Interview Mode
      const systemPrompt = `You are an expert technical interviewer assessing candidates on C++ and DSA concepts.
INTERVIEW MODE: Evaluate the user's answer to the given technical question. Give constructive, professional, and direct feedback.
Format your output strictly as a JSON object with these keys:
{
  "strengths": ["list of strengths as strings"],
  "weaknesses": ["list of weaknesses/omissions as strings"],
  "suggestions": ["list of concrete recommendations to improve the answer or a sample ideal explanation"]
}`

      const promptText = `Question: "${question}"\nCandidate's Answer: "${answer}"`

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText }
      ]

      const responseText = await callOpenAI(messages, apiKey, true)
      
      try {
        const feedbackJson = JSON.parse(responseText)
        return res.status(200).json({ feedback: feedbackJson })
      } catch (err) {
        // Fallback parse if JSON formatting failed
        return res.status(200).json({
          feedback: {
            strengths: ["Provided a technical explanation."],
            weaknesses: ["AI response could not be parsed as structured JSON."],
            suggestions: [responseText]
          }
        })
      }
    }
  } catch (error) {
    console.error("OpenAI Server Error:", error)
    return res.status(500).json({ error: "AI currently unavailable. Please try again later." })
  }
}

// Helper to query OpenAI API
async function callOpenAI(messages, apiKey, jsonMode = false) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP status ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Context-aware Mock Chat Engine
function getMockChatResponse(question, context, history) {
  const q = question.toLowerCase()
  const ctx = (context || '').toLowerCase()

  // Slices history context
  if (q.includes("thank") || q.includes("thanks")) {
    return "You're welcome! 😊 Keep coding and practicing. Let me know if you want to explore more DSA topics!"
  }

  if (q.includes("hello") || q.includes("hi")) {
    return "Hello! 👋 I'm your Programo AI Tutor. I can explain C++ features, data structures, or code intuition. What are we studying today?"
  }

  // Topic specific questions
  if (q.includes("binary search") || ctx.includes("binary search")) {
    return `**Binary Search** is an O(log N) search algorithm. It repeatedly divides a sorted search interval in half.
    
**Key Steps:**
1. Check middle element.
2. If middle equals target, return index.
3. If middle is greater than target, search left half.
4. If middle is smaller than target, search right half.

*Example Code:*
\`\`\`cpp
int binarySearch(int arr[], int l, int r, int x) {
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == x) return m;
        if (arr[m] < x) l = m + 1;
        else r = m - 1;
    }
    return -1;
}
\`\`\``
  }

  if (q.includes("array") || ctx.includes("array")) {
    return `**Arrays** are contiguous sequences of elements. They allocate a fixed block of RAM.
    
**Why use them?**
- **O(1) Access**: Calculating target RAM address takes constant time: \`Address = Start + Index * Size\`.
- **Cache Friendly**: CPU caches contiguous blocks, meaning sequential reads are incredibly fast.

**Caveat:** Resizing requires allocating a brand new block and copying elements, making dynamic array insertions O(N) in the worst case.`
  }

  if (q.includes("linked list") || ctx.includes("linked-lists")) {
    return `**Linked Lists** consist of nodes scattered in heap memory, connected by pointers.

**Trade-offs:**
- **Dynamic Size**: Easily inserts/deletes nodes in O(1) time once located. No memory copies needed.
- **Sequential Read**: Accessing the N-th node requires traversing from the head. This makes random access O(N).
- **Cache Penalty**: Nodes are not contiguous, leading to CPU cache misses during traversal.`
  }

  if (q.includes("recursion") || q.includes("call stack")) {
    return `**Recursion** is a technique where a function calls itself to solve smaller subproblems.
    
**Rule of Thumb:**
- **Base Case**: The stopping criteria that returns a value without recursing.
- **Recursive Case**: Shifting variables toward the base case.

*Warning:* Every call allocates a stack frame on the call stack. Deep recursion without base termination triggers a \`Stack Overflow\` error.`
  }

  if (q.includes("complexity") || q.includes("big o") || q.includes("space complexity")) {
    return `**Big O Complexity** evaluates how execution time or space requirements grow as input size \`N\` grows:
- **O(1)**: Constant time (e.g., array index lookup).
- **O(log N)**: Logarithmic time (e.g., binary search).
- **O(N)**: Linear time (e.g., linked list traversal).
- **O(N log N)**: Log-linear time (e.g., Merge Sort / Quick Sort).
- **O(N^2)**: Quadratic time (e.g., Bubble Sort).`
  }

  // Fallback context awareness
  if (context) {
    return `That's a good question regarding **${context}**. Let's review the core definition:
    
1. It handles state or allocations dynamically.
2. It has unique trade-offs in terms of Big-O time and space complexity.
3. In C++, we manage this using pointers or std containers.

Could you elaborate on which specific operation (e.g. searching, insertion, deletion) or code snippet you want me to explain?`
  }

  return `I'm here to help you master C++ and Data Structures! 
You can ask me questions like:
- *"Explain binary search"*
- *"What is cache locality in arrays?"*
- *"Show me recursion vs iteration"*

What topic would you like to review?`
}

// Context-aware Mock Interview Analyzer
function getMockFeedback(answer, question) {
  const ans = (answer || '').toLowerCase()
  const q = (question || '').toLowerCase()

  if (q.includes("resizes") || q.includes("vector")) {
    const hasContiguous = ans.includes("contiguous") || ans.includes("memory")
    const hasComplexity = ans.includes("o(1)") || ans.includes("amortized") || ans.includes("o(n)")
    const hasDoubles = ans.includes("double") || ans.includes("twice") || ans.includes("factor") || ans.includes("capacity")

    const strengths = []
    const weaknesses = []
    const suggestions = []

    if (hasContiguous) strengths.push("Correctly identified contiguous memory allocation in RAM.")
    else weaknesses.push("Missed describing that elements sit sequentially back-to-back.")

    if (hasComplexity) strengths.push("Noted O(1) read indexing and amortized push complexity.")
    else weaknesses.push("Did not outline difference between O(1) amortized and O(N) worst-case resizing.")

    if (hasDoubles) strengths.push("Explained the automatic growth doubling logic of dynamic vector capacity.")
    else weaknesses.push("Failed to mention capacity expansion factor (e.g. 2x in GCC, 1.5x in MSVC).")

    if (strengths.length === 0) strengths.push("Provided a general response about vectors.")

    suggestions.push("Explain that reallocating copies elements to a new memory block, causing temporary O(N) overhead.")
    suggestions.push("Mention reserve() as an optimization to pre-allocate capacity and avoid reallocations.")

    return { strengths, weaknesses, suggestions }
  }

  if (q.includes("list") && q.includes("vector")) {
    const hasLayout = ans.includes("contiguous") || ans.includes("pointer") || ans.includes("linked")
    const hasAccess = ans.includes("o(1)") || ans.includes("index") || ans.includes("o(n)")

    const strengths = []
    const weaknesses = []
    const suggestions = []

    if (hasLayout) strengths.push("Identified that vectors are contiguous while lists use pointers.")
    else weaknesses.push("Omitted differences in memory layout (sequential block vs. scattered heap nodes).")

    if (hasAccess) strengths.push("Highlighted O(1) index reads for vectors versus O(N) sequential search for lists.")
    else weaknesses.push("Did not clearly specify lookups time complexities.")

    if (strengths.length === 0) strengths.push("Stated basic differences between vector and list.")

    suggestions.push("Mention CPU cache locality: vector contiguous memory is cache-friendly, list pointer jumps trigger cache misses.")
    suggestions.push("State that list has O(1) insertions/deletions once the node is reached, whereas vector requires shifting elements.")

    return { strengths, weaknesses, suggestions }
  }

  if (q.includes("cycle") || q.includes("detect")) {
    const hasFloyd = ans.includes("floyd") || ans.includes("tortoise") || ans.includes("hare") || ans.includes("slow") || ans.includes("fast")
    const hasHash = ans.includes("hash") || ans.includes("set") || ans.includes("visited")

    const strengths = []
    const weaknesses = []
    const suggestions = []

    if (hasFloyd) {
      strengths.push("Identified Floyd's Cycle-Finding Algorithm (Tortoise & Hare approach).")
      strengths.push("Recognized O(1) auxiliary space complexity optimization.")
    }
    if (hasHash) {
      strengths.push("Noted hash table (unordered_set) visited node tracking method.")
    }

    if (!hasFloyd && !hasHash) {
      weaknesses.push("Did not describe standard algorithms (Floyd's or HashSet tracing).")
    }

    if (strengths.length === 0) strengths.push("Described basic pointer checks.")

    suggestions.push("Explain pointer increments: slow pointer moves 1 step, fast pointer moves 2 steps.")
    suggestions.push("Discuss complexity: Floyd's algorithm uses O(N) time and O(1) space, hash set uses O(N) time and O(N) space.")

    return { strengths, weaknesses, suggestions }
  }

  if (q.includes("recursion") || q.includes("dynamic programming")) {
    const hasOverlap = ans.includes("overlap") || ans.includes("subproblem")
    const hasMemo = ans.includes("memo") || ans.includes("table") || ans.includes("tabulation")

    const strengths = []
    const weaknesses = []
    const suggestions = []

    if (hasOverlap) strengths.push("Correctly noted overlapping subproblems as the core differentiator.")
    else weaknesses.push("Did not outline that DP solves repeated subproblems only once.")

    if (hasMemo) strengths.push("Identified top-down memoization and bottom-up tabulation techniques.")
    else weaknesses.push("Failed to mention how results are cached in memory lists.")

    if (strengths.length === 0) strengths.push("Discussed general properties of recursive calls.")

    suggestions.push("Use Fibonacci as an example: recursion takes O(2^N) time due to redundant branches, DP caches them to run in O(N).")
    suggestions.push("Contrast the call stack overhead of recursion vs the iterative loop space optimization of tabulation.")

    return { strengths, weaknesses, suggestions }
  }

  // General Fallback Feedback
  return {
    strengths: [
      "Offered a direct response addressing the interview question.",
      "Used clear structure in the explanation."
    ],
    weaknesses: [
      "Could incorporate more C++ specific language vocabulary (e.g. pointer decay, cache locality).",
      "Lacks concrete time complexity (Big-O) notation."
    ],
    suggestions: [
      "Clarify the space complexity overhead of your approach.",
      "Provide a short C++ helper snippet or pseudo-algorithm to illustrate your solution."
    ]
  };
}
