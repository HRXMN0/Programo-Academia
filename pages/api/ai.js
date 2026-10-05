import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

// One constant so the tutor and the interview coach never drift apart. Opus 5 is
// the strongest explainer; 'claude-sonnet-5' and 'claude-haiku-4-5' are drop-in
// swaps if the bill ever matters more than the depth of the answers.
const MODEL = 'claude-opus-5'

// Opus 5 thinks before it answers, which regularly takes longer than Vercel's
// 10s default for serverless functions. 60s is the ceiling on the Hobby plan.
export const config = {
  maxDuration: 60
}

// The interview page renders feedback as three bullet lists, so we make the API
// guarantee that shape instead of parsing whatever JSON the model felt like
// emitting. Anything off-schema is retried server-side before we ever see it.
const FeedbackSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string())
})

const TUTOR_SYSTEM = `You are a C++ and Data Structures & Algorithms tutor on Programo Academia, a free study site. Your students are mostly beginners working through their first DSA course.

Teach, don't just answer:
- Lead with the intuition, then the mechanics, then the code.
- Put any code in a fenced \`\`\`cpp block, and use modern C++ (C++17 or later).
- State time and space complexity whenever you describe an algorithm or data structure.
- Prefer one short worked example over a long abstract explanation.
- If the question is vague, answer the most likely reading and say what you assumed.

Keep it tight — a few hundred words unless the student asks you to go deeper.`

const INTERVIEWER_SYSTEM = `You are a technical interviewer reviewing a student's written answer to a C++ / DSA interview question.

Grade only what the answer actually says — never credit the student for a concept they did not mention.
Be specific: name the missing idea rather than noting that something is missing.
Write each bullet as one sentence the student can act on.
If the answer is weak, say so plainly. An empty strengths list beats an invented one.
End the suggestions list with one short model answer they can compare against.`

// Built lazily: the constructor needs a key, and the no-key path below never
// reaches the API at all.
let anthropic = null
function getClient() {
  if (!anthropic) {
    anthropic = new Anthropic({
      // Worst case is timeout × (maxRetries + 1) ≈ 50s, which stays inside the
      // 60s function limit above so we fail into the mock instead of being killed.
      timeout: 25_000,
      maxRetries: 1
    })
  }
  return anthropic
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, question, context, answer, history = [] } = req.body || {}

  if (action !== 'chat' && action !== 'analyze') {
    return res.status(400).json({ error: 'Invalid action' })
  }

  // No key configured — the site still teaches. The mock engines below cover the
  // topics we actually ship lessons for, so a missing key costs quality, not uptime.
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json(mockResponse(action, { question, context, answer, history }))
  }

  try {
    if (action === 'chat') {
      return res.status(200).json({ response: await runTutor({ question, context, history }) })
    }
    return res.status(200).json({ feedback: await runInterviewer({ question, answer }) })
  } catch (error) {
    // Same reasoning as the missing-key branch: a student mid-lesson gets a useful
    // answer instead of an error card. `degraded` lets the UI say so if it wants to,
    // and the log line is how you find out the key is wrong.
    console.error('[api/ai] falling back to offline tutor —', describeError(error))
    return res.status(200).json({
      ...mockResponse(action, { question, context, answer, history }),
      degraded: true
    })
  }
}

async function runTutor({ question, context, history }) {
  const message = await getClient().messages.create({
    model: MODEL,
    // Generous because thinking tokens count against this cap too — the length
    // limit that actually matters is the one in the system prompt.
    max_tokens: 8000,
    // Tutoring is latency-sensitive and the questions are rarely hard for Opus.
    output_config: { effort: 'medium' },
    system: `${TUTOR_SYSTEM}

Lesson the student is currently on: ${context || 'none — this is a general programming question.'}`,
    messages: [...recentTurns(history), { role: 'user', content: question }]
  })

  if (message.stop_reason === 'refusal') {
    throw new Error(`declined (${message.stop_details?.category || 'unspecified'})`)
  }

  const text = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
    .trim()

  // An empty body means the turn was spent entirely on thinking, or truncated.
  // Either way there is nothing to show, so let the caller fall back.
  if (!text) throw new Error(`empty response (stop_reason: ${message.stop_reason})`)

  return text
}

async function runInterviewer({ question, answer }) {
  const message = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 4000,
    output_config: {
      effort: 'medium',
      format: zodOutputFormat(FeedbackSchema)
    },
    system: INTERVIEWER_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Interview question: ${question}\n\nStudent's answer: ${answer}`
      }
    ]
  })

  // parsed_output is null when the model refused or the response was truncated
  // before the schema could be satisfied.
  if (!message.parsed_output) {
    throw new Error(`no structured feedback (stop_reason: ${message.stop_reason})`)
  }

  return message.parsed_output
}

// Short memory, so "explain that again" works without resending the whole chat.
function recentTurns(history) {
  const turns = (Array.isArray(history) ? history : [])
    .filter(msg => msg && typeof msg.content === 'string' && msg.content.trim())
    .slice(-4)
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

  // The Messages API requires the conversation to open on a user turn, and a
  // window sliced out of the middle of a chat lands on an assistant reply half
  // the time.
  while (turns.length > 0 && turns[0].role === 'assistant') turns.shift()

  return turns
}

function mockResponse(action, { question, context, answer, history }) {
  if (action === 'chat') {
    return { response: getMockChatResponse(question, context, history) }
  }
  return { feedback: getMockFeedback(answer, question) }
}

function describeError(error) {
  if (error instanceof Anthropic.AuthenticationError) {
    return 'ANTHROPIC_API_KEY is missing or invalid'
  }
  if (error instanceof Anthropic.RateLimitError) {
    return 'rate limited by the Anthropic API'
  }
  if (error instanceof Anthropic.APIError) {
    return `Anthropic API error ${error.status}: ${error.message}`
  }
  return error?.message || 'unknown error'
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
