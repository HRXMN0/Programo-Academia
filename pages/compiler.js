import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[480px] bg-[#0D1117] text-on-surface-variant flex items-center justify-center font-body-md text-body-md">
      Loading editor...
    </div>
  ),
})

const LANGUAGE_OPTIONS = [
  {
    id: 'cpp',
    label: 'C++',
    monacoLanguage: 'cpp',
    filename: 'main.cpp',
    starterCode: `#include <iostream>
using namespace std;

int main() {
  int a, b;
  cin >> a >> b;
  cout << "Sum: " << a + b << endl;
  return 0;
}
`,
    starterInput: '12 30',
  },
  {
    id: 'java',
    label: 'Java',
    monacoLanguage: 'java',
    filename: 'Main.java',
    starterCode: `import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int a = sc.nextInt();
    int b = sc.nextInt();
    System.out.println("Sum: " + (a + b));
  }
}
`,
    starterInput: '12 30',
  },
  {
    id: 'python',
    label: 'Python',
    monacoLanguage: 'python',
    filename: 'main.py',
    starterCode: `a, b = map(int, input().split())
print(f"Sum: {a + b}")
`,
    starterInput: '12 30',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    filename: 'main.js',
    starterCode: `const fs = require("fs");
const [a, b] = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);

console.log(\`Sum: \${a + b}\`);
`,
    starterInput: '12 30',
  },
]

const starterCodeMap = LANGUAGE_OPTIONS.reduce((acc, language) => {
  acc[language.id] = language.starterCode
  return acc
}, {})

function getStoredSnippets() {
  if (typeof window === 'undefined') return starterCodeMap

  try {
    const saved = window.localStorage.getItem('programo-code-runner-snippets')
    return saved ? { ...starterCodeMap, ...JSON.parse(saved) } : starterCodeMap
  } catch (_) {
    return starterCodeMap
  }
}

export default function CompilerPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('cpp')
  const [snippets, setSnippets] = useState(starterCodeMap)
  const [stdin, setStdin] = useState('12 30')
  const [result, setResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const activeLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((language) => language.id === selectedLanguage),
    [selectedLanguage]
  )

  const code = snippets[selectedLanguage] !== undefined ? snippets[selectedLanguage] : activeLanguage.starterCode
  const hasOutput = result || error || isRunning

  useEffect(() => {
    setSnippets(getStoredSnippets())
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    try {
      window.localStorage.setItem('programo-code-runner-snippets', JSON.stringify(snippets))
    } catch (_) {}
  }, [isHydrated, snippets])

  // Global Keyboard Shortcut for Run Code
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        document.getElementById('run-code-btn')?.click()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fullscreen Body Class Toggle
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('fullscreen-compiler')
    } else {
      document.body.classList.remove('fullscreen-compiler')
    }
    return () => document.body.classList.remove('fullscreen-compiler')
  }, [isFullscreen])

  // Theme Observer
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'))
        }
      })
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  function updateCode(value) {
    setSnippets((current) => ({
      ...current,
      [selectedLanguage]: value || '',
    }))
  }

  function handleLanguageChange(event) {
    if (snippets[selectedLanguage] !== undefined && snippets[selectedLanguage] !== activeLanguage.starterCode) {
      if (!window.confirm("Switching language will change the current environment. Continue?")) {
        return
      }
    }

    const nextLanguage = LANGUAGE_OPTIONS.find((language) => language.id === event.target.value)

    setSelectedLanguage(nextLanguage.id)
    setStdin(nextLanguage.starterInput)
    setResult(null)
    setError('')
  }

  function resetCode() {
    setSnippets((current) => ({
      ...current,
      [selectedLanguage]: activeLanguage.starterCode,
    }))
    setStdin(activeLanguage.starterInput)
    setResult(null)
    setError('')
  }

  function clearOutput() {
    setResult(null)
    setError('')
  }

  async function runCode() {
    setIsRunning(true)
    setResult(null)
    setError('')

    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          code,
          stdin,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to run code.')
      }

      setResult(payload)
    } catch (runError) {
      setError(runError.message || 'Unable to run code.')
    } finally {
      setIsRunning(false)
    }
  }

  function defineEditorTheme(monaco) {
    monaco.editor.defineTheme('programo-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#E6EDF3',
        'editorLineNumber.foreground': '#6E7681',
        'editorCursor.foreground': '#68FADE',
        'editor.lineHighlightBackground': '#161B22',
        'editor.selectionBackground': '#006B5C55',
        'editorIndentGuide.background': '#30363D',
      },
    })
    monaco.editor.defineTheme('programo-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f7f9fb',
        'editor.foreground': '#191c1e',
        'editorLineNumber.foreground': '#75777e',
        'editorCursor.foreground': '#006B5C',
        'editor.lineHighlightBackground': '#f2f4f6',
        'editor.selectionBackground': '#006B5C33',
        'editorIndentGuide.background': '#e0e3e5',
      },
    })
  }

  return (
    <div className={`relative w-full bg-background flex-1 flex flex-col ${isFullscreen ? 'h-[calc(100vh-4rem)] p-4 overflow-hidden' : 'overflow-hidden'}`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-10 right-0 w-[420px] h-[420px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className={`relative z-10 w-full mx-auto animate-fade-in ${isFullscreen ? 'flex-1 flex flex-col h-full max-w-none px-0 py-0' : 'max-w-container-max px-gutter py-10 md:py-14'}`}>
        {!isFullscreen && (
          <section className="flex flex-col gap-md mb-8">
            <div className="flex flex-col gap-xs max-w-3xl">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.14em]">
                Online compiler
              </span>
              <h1 className="font-headline-lg text-headline-lg md:text-[40px] md:leading-[48px] text-primary font-bold tracking-tight">
                Code, run, and learn in one clean workspace.
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Write C++, Java, Python, or JavaScript with a VS Code style editor, pass custom input, and see output instantly.
              </p>
            </div>
          </section>
        )}

        <section className={`grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)] gap-6 items-stretch ${isFullscreen ? 'flex-1 h-full min-h-0' : ''}`}>
          <div className="bg-surface-container-lowest dark:bg-[#0D1117] border border-outline-variant dark:border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm border-b border-outline-variant dark:border-white/10 bg-surface-container-low dark:bg-[#161B22] px-4 py-3 shrink-0">
              <div className="flex items-center gap-sm min-w-0">
                <div className="flex gap-2 shrink-0 items-center h-full mr-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#27C93F]"></span>
                </div>
                <span className="font-code-block text-code-block text-on-surface dark:text-white/80 truncate">
                  {activeLanguage.filename}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-sm">
                <label className="sr-only" htmlFor="language">
                  Select language
                </label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="bg-surface-container-lowest dark:bg-[#0D1117] border border-outline-variant dark:border-white/20 text-on-surface dark:text-white font-label-md text-label-md rounded-lg px-sm py-2 focus:border-secondary focus:ring-secondary/20 outline-none"
                >
                  {LANGUAGE_OPTIONS.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="border border-outline-variant dark:border-white/20 text-on-surface-variant dark:text-white/80 hover:text-primary dark:hover:text-white hover:bg-surface-container-low dark:hover:bg-white/10 font-label-md text-label-md px-md py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                  {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                </button>

                <button
                  type="button"
                  onClick={resetCode}
                  className="border border-outline-variant dark:border-white/20 text-on-surface-variant dark:text-white/80 hover:text-error hover:border-error/50 hover:bg-error/10 font-label-md text-label-md px-md py-2 rounded-lg transition-all duration-200"
                >
                  Reset
                </button>

                <button
                  id="run-code-btn"
                  type="button"
                  onClick={runCode}
                  disabled={isRunning}
                  className="bg-secondary text-on-secondary font-label-md text-label-md px-lg py-2 rounded-lg shadow-[0_0_18px_rgba(0,107,92,0.18)] hover:bg-secondary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-xs"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isRunning ? 'animate-spin' : ''}`}>
                    {isRunning ? 'progress_activity' : 'play_arrow'}
                  </span>
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            <div className="flex-1 bg-surface-container-lowest dark:bg-[#0D1117] min-h-[540px]">
              <MonacoEditor
                height="100%"
                language={activeLanguage.monacoLanguage}
                value={code}
                theme={isDark ? 'programo-dark' : 'programo-light'}
                beforeMount={defineEditorTheme}
                onChange={updateCode}
                options={{
                  automaticLayout: true,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  lineHeight: 22,
                  minimap: { enabled: false },
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: 'line',
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>

          <aside className="grid grid-rows-[min-content_1fr] gap-6 flex-1 min-h-0">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm shrink-0">
              <div className="flex items-center justify-between gap-sm mb-3">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">
                    Custom input
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Data passed to standard input.
                  </p>
                </div>
                <span className="material-symbols-outlined text-secondary">input</span>
              </div>
              <textarea
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                rows={isFullscreen ? 3 : 5}
                spellCheck="false"
                className="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low font-code-block text-code-block text-on-surface p-sm focus:border-secondary focus:ring-secondary/20 outline-none"
                placeholder="Example: 12 30"
              />
            </div>

            <div className="bg-surface-container-lowest dark:bg-[#0D1117] border border-outline-variant dark:border-white/10 rounded-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.22)] text-on-surface dark:text-white min-h-[320px] flex flex-col min-h-0">
              <div className="flex items-center justify-between gap-sm border-b border-outline-variant dark:border-white/10 pb-3 mb-4 shrink-0">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white font-bold tracking-tight">
                    Output
                  </h2>
                  <p className="text-xs text-on-surface-variant dark:text-white/50 mt-1">
                    {result ? result.runtime : 'Compiler response appears here.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {hasOutput && (
                    <button
                      onClick={clearOutput}
                      className="text-xs font-semibold text-on-surface-variant dark:text-white/60 hover:text-primary dark:hover:text-white transition-colors underline"
                    >
                      Clear Output
                    </button>
                  )}
                  <span
                    className={`px-sm py-xs rounded-full text-xs font-semibold ${
                    error
                      ? 'bg-error/20 text-[#ffdad6]'
                      : result?.success
                        ? 'bg-secondary/20 text-secondary-fixed'
                        : hasOutput
                          ? 'bg-[#FFBD2E]/20 dark:bg-[#FFBD2E]/15 text-[#FFBD2E]'
                          : 'bg-surface-container-highest dark:bg-white/5 text-on-surface-variant dark:text-white/50'
                  }`}
                >
                  {isRunning ? 'Running' : error ? 'Error' : result ? (result.success ? 'Success' : 'Failed') : 'Idle'}
                </span>
                </div>
              </div>

              <pre className="font-code-block text-code-block leading-relaxed text-on-surface dark:text-[#E6EDF3] whitespace-pre-wrap break-words flex-1 overflow-auto no-scrollbar">
                {isRunning
                  ? 'Running your code...'
                  : error
                    ? error
                    : result?.output || 'Click Run Code to see stdout, stderr, and compiler messages.'}
              </pre>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
