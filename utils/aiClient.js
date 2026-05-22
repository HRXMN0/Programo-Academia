export async function askAI(question, context = '', history = []) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'chat',
        question,
        context,
        history
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `HTTP error ${response.status}`)
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error("aiClient askAI Error:", error)
    throw new Error(error.message || "AI currently unavailable. Please try again later.")
  }
}

export async function analyzeAnswer(answer, question) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        answer,
        question
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `HTTP error ${response.status}`)
    }

    const data = await response.json()
    return data.feedback
  } catch (error) {
    console.error("aiClient analyzeAnswer Error:", error)
    throw new Error(error.message || "AI currently unavailable. Please try again later.")
  }
}
