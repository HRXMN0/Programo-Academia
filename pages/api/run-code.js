const JUDGE0_BASE_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com'

const LANGUAGE_CONFIG = {
  cpp: {
    label: 'C++',
    languageId: 105,
  },
  java: {
    label: 'Java',
    languageId: 91,
  },
  python: {
    label: 'Python',
    languageId: 100,
  },
  javascript: {
    label: 'JavaScript',
    languageId: 102,
  },
}

function buildJudge0Headers() {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (process.env.JUDGE0_AUTH_TOKEN) {
    headers['X-Auth-Token'] = process.env.JUDGE0_AUTH_TOKEN
  }

  if (process.env.JUDGE0_AUTH_USER) {
    headers['X-Auth-User'] = process.env.JUDGE0_AUTH_USER
  }

  return headers
}

function normalizeOutput(payload) {
  return [
    payload.compile_output,
    payload.stderr,
    payload.stdout,
    payload.message,
  ].filter(Boolean).join('\n') || 'Program finished with no output.'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { language, code, stdin = '' } = req.body || {}
  const config = LANGUAGE_CONFIG[language]

  if (!config) {
    return res.status(400).json({ message: 'Unsupported language selected.' })
  }

  if (typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({ message: 'Write some code before running it.' })
  }

  if (code.length > 20000) {
    return res.status(413).json({ message: 'Code is too large for this beginner runner.' })
  }

  if (typeof stdin === 'string' && stdin.length > 10000) {
    return res.status(413).json({ message: 'Input is too large for this runner.' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const judgeResponse = await fetch(
      `${JUDGE0_BASE_URL}/submissions/?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,message,status,time,memory,language`,
      {
        method: 'POST',
        headers: buildJudge0Headers(),
        signal: controller.signal,
        body: JSON.stringify({
          language_id: config.languageId,
          source_code: code,
          stdin,
          cpu_time_limit: 3,
          wall_time_limit: 10,
        }),
      }
    )

    const payload = await judgeResponse.json().catch(() => ({}))

    if (!judgeResponse.ok) {
      return res.status(judgeResponse.status).json({
        message: payload.message || payload.error || 'The code runner could not execute this request.',
      })
    }

    const status = payload.status || {}

    return res.status(200).json({
      success: status.id === 3,
      runtime: payload.language?.name || config.label,
      status,
      time: payload.time || null,
      memory: payload.memory || null,
      output: normalizeOutput(payload),
      stdout: payload.stdout || '',
      stderr: payload.stderr || '',
      compileOutput: payload.compile_output || '',
    })
  } catch (error) {
    const isTimeout = error.name === 'AbortError'

    return res.status(isTimeout ? 504 : 500).json({
      message: isTimeout
        ? 'Execution took too long. Try a smaller program or check for infinite loops.'
        : 'The code runner is temporarily unavailable.',
    })
  } finally {
    clearTimeout(timeout)
  }
}
