import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  // Themed skeleton rather than a hard-coded dark slab, so the placeholder does
  // not flash near-black on a light-mode page load.
  loading: () => (
    <div className="h-full min-h-[420px] bg-surface-container-low dark:bg-[#0D1117] flex flex-col items-center justify-center gap-3">
      <span className="material-symbols-outlined animate-spin text-[28px] leading-none text-secondary">
        progress_activity
      </span>
      <p className="font-label-md text-label-md text-on-surface-variant">Loading editor...</p>
      <div className="w-40 h-1 overflow-hidden rounded-full bg-surface-container-high dark:bg-white/10">
        <div className="h-full w-1/3 rounded-full bg-secondary animate-pulse"></div>
      </div>
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

  // Presentational only. The console below is deliberately dark in BOTH themes —
  // a terminal should look like a terminal — so its accents come from the
  // theme-independent topic-* tokens rather than tokens that flip with the theme.
  const status = isRunning
    ? { label: 'Running', pill: 'bg-topic-amber/15 text-topic-amber ring-1 ring-topic-amber/30', dot: 'bg-topic-amber animate-pulse' }
    : error
      ? { label: 'Error', pill: 'bg-topic-rose/15 text-topic-rose ring-1 ring-topic-rose/30', dot: 'bg-topic-rose' }
      : result
        ? result.success
          ? { label: 'Success', pill: 'bg-topic-emerald/15 text-topic-emerald ring-1 ring-topic-emerald/30', dot: 'bg-topic-emerald' }
          : { label: 'Failed', pill: 'bg-topic-amber/15 text-topic-amber ring-1 ring-topic-amber/30', dot: 'bg-topic-amber' }
        : { label: 'Idle', pill: 'bg-white/5 text-white/60 ring-1 ring-white/10', dot: 'bg-white/30' }

  return (
    <div className={`relative w-full bg-background flex-1 flex flex-col ${isFullscreen ? 'h-[calc(100vh-4rem)] p-4 overflow-hidden' : 'overflow-hidden'}`}>
      {/* The old grid sat at 3% alpha and rendered as literally nothing. bg-grid-fade
          is token-driven and actually visible in both themes. */}
      <div aria-hidden="true" className="absolute inset-0 bg-grid-fade bg-[size:28px_28px] pointer-events-none"></div>
      <div aria-hidden="true" className="absolute -top-24 right-0 w-[520px] h-[520px] bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <main className={`relative z-10 w-full mx-auto animate-fade-in ${isFullscreen ? 'flex-1 flex flex-col h-full max-w-none px-0 py-0' : 'max-w-container-max px-gutter py-8 md:py-10'}`}>
        {!isFullscreen && (
          <section className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-2 max-w-3xl">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 font-label-md text-[11px] uppercase tracking-[0.16em] text-secondary font-bold">
                <span className="material-symbols-outlined text-[14px] leading-none">terminal</span>
                Online compiler
              </span>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                Code, run, and learn in one clean workspace.
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-prose">
                Write C++, Java, Python, or JavaScript with a VS Code style editor, pass custom input, and see output instantly.
              </p>
            </div>

            {/* Small, concrete hints beat a paragraph of instructions */}
            <ul className="flex flex-wrap items-center gap-2">
              {[
                { icon: 'keyboard_command_key', text: 'Ctrl / Cmd + Enter runs your code' },
                { icon: 'input', text: 'Custom stdin supported' },
                { icon: 'save', text: 'Your code is saved in this browser' },
                { icon: 'code', text: `${LANGUAGE_OPTIONS.length} languages` },
              ].map((hint) => (
                <li
                  key={hint.text}
                  className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[15px] leading-none text-secondary">{hint.icon}</span>
                  {hint.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={`grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)] gap-6 items-stretch ${isFullscreen ? 'flex-1 h-full min-h-0' : ''}`}>
          <div className="bg-surface-container-lowest dark:bg-[#0D1117] border border-outline-variant dark:border-white/10 rounded-2xl shadow-lifted overflow-hidden flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant dark:border-white/10 bg-surface-container-low dark:bg-[#161B22] px-4 py-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex gap-1.5 shrink-0 items-center" aria-hidden="true">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#27C93F]"></span>
                </div>
                <span className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-outline-variant dark:border-white/10 bg-surface-container-lowest dark:bg-white/5 px-2.5 py-1">
                  <span className="material-symbols-outlined text-[15px] leading-none text-secondary">description</span>
                  <span className="font-code-block text-[13px] text-on-surface dark:text-white/80 truncate">
                    {activeLanguage.filename}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="language">
                  Select language
                </label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="bg-surface-container-lowest dark:bg-[#0D1117] border border-outline-variant dark:border-white/20 text-on-surface dark:text-white font-label-md text-label-md rounded-lg pl-3 pr-8 py-2 focus:border-secondary focus:ring-secondary/20 outline-none transition-colors duration-200 hover:border-secondary/50"
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
                  aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                  aria-pressed={isFullscreen}
                  title={isFullscreen ? 'Exit full screen' : 'Full screen'}
                  className="border border-outline-variant dark:border-white/20 text-on-surface-variant dark:text-white/80 hover:text-secondary dark:hover:text-white hover:border-secondary/50 hover:bg-secondary/5 dark:hover:bg-white/10 font-label-md text-label-md px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 active-press"
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                  <span className="hidden lg:inline">{isFullscreen ? 'Exit' : 'Full screen'}</span>
                </button>

                <button
                  type="button"
                  onClick={resetCode}
                  aria-label="Reset code and input to the starter template"
                  title="Reset to starter code"
                  className="border border-outline-variant dark:border-white/20 text-on-surface-variant dark:text-white/80 hover:text-error hover:border-error/50 hover:bg-error/10 font-label-md text-label-md px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 active-press"
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">restart_alt</span>
                  <span className="hidden lg:inline">Reset</span>
                </button>

                <button
                  id="run-code-btn"
                  type="button"
                  onClick={runCode}
                  disabled={isRunning}
                  className="bg-secondary text-on-secondary font-label-md text-label-md px-5 py-2 rounded-lg shadow-brand hover:bg-secondary/90 hover:shadow-brand-hover disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-1.5 active-press"
                >
                  <span className={`material-symbols-outlined text-[18px] leading-none ${isRunning ? 'animate-spin' : 'filled'}`}>
                    {isRunning ? 'progress_activity' : 'play_arrow'}
                  </span>
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* In fullscreen the editor takes whatever the viewport gives it; only the
                normal page layout needs a minimum height to stop the pane collapsing. */}
            <div className={`flex-1 bg-surface-container-lowest dark:bg-[#0D1117] ${isFullscreen ? 'min-h-0' : 'min-h-[420px] md:min-h-[540px]'}`}>
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

            {/* Editor status bar — the small print an IDE always shows */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant dark:border-white/10 bg-surface-container-low dark:bg-[#161B22] px-4 py-2 shrink-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-on-surface-variant dark:text-white/60">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  {activeLanguage.label}
                </span>
                <span className="hidden sm:inline">Spaces: 2</span>
                <span className="hidden sm:inline">UTF-8</span>
                <span className="hidden md:inline">Word wrap on</span>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant dark:text-white/60">
                <kbd className="rounded border border-outline-variant dark:border-white/20 bg-surface-container-lowest dark:bg-white/5 px-1.5 py-0.5 font-code-block text-[10px] text-on-surface dark:text-white/70">
                  Ctrl
                </kbd>
                <span aria-hidden="true">+</span>
                <kbd className="rounded border border-outline-variant dark:border-white/20 bg-surface-container-lowest dark:bg-white/5 px-1.5 py-0.5 font-code-block text-[10px] text-on-surface dark:text-white/70">
                  Enter
                </kbd>
                to run
              </p>
            </div>
          </div>

          <aside className="grid grid-rows-[min-content_1fr] gap-6 flex-1 min-h-0">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-card shrink-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary">
                    <span className="material-symbols-outlined text-[20px] leading-none">input</span>
                  </span>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-primary">
                      Custom input
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Data passed to standard input.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-code-block text-[11px] text-on-surface-variant">
                  stdin
                </span>
              </div>
              <textarea
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                rows={isFullscreen ? 3 : 5}
                spellCheck="false"
                className="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low font-code-block text-code-block text-on-surface p-3 focus:border-secondary focus:ring-secondary/20 outline-none transition-colors duration-200"
                placeholder="Example: 12 30"
              />
              <p className="mt-2 flex items-start gap-1.5 text-[11px] text-outline">
                <span className="material-symbols-outlined text-[14px] leading-none mt-px">lightbulb</span>
                Each line is read as one line of input, exactly like a judge would send it.
              </p>
            </div>

            {/* Console. Dark on purpose, in both themes. */}
            <div className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0D1117] shadow-lifted">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 shrink-0">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/70">
                    <span className="material-symbols-outlined text-[18px] leading-none">terminal</span>
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-label-md text-label-md text-white">
                      Output
                    </h2>
                    <p className="truncate text-[11px] text-white/60">
                      {result ? result.runtime : 'Compiler response appears here.'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {hasOutput && (
                    <button
                      onClick={clearOutput}
                      aria-label="Clear output"
                      title="Clear output"
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[11px] font-semibold text-white/60 transition-colors duration-200 hover:border-white/25 hover:bg-white/5 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-[14px] leading-none">backspace</span>
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${status.pill}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`}></span>
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-auto no-scrollbar p-4">
                {isRunning ? (
                  <p className="flex items-center gap-2 font-code-block text-code-block text-[#E6EDF3]">
                    <span className="material-symbols-outlined animate-spin text-[16px] leading-none text-topic-amber">
                      progress_activity
                    </span>
                    Running your code...
                  </p>
                ) : error ? (
                  <pre className="font-code-block text-code-block leading-relaxed text-[#ffb4ab] whitespace-pre-wrap break-words">
                    {error}
                  </pre>
                ) : result?.output ? (
                  <pre className="font-code-block text-code-block leading-relaxed text-[#E6EDF3] whitespace-pre-wrap break-words">
                    {result.output}
                  </pre>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/60 ring-4 ring-white/[0.03]">
                      <span className="material-symbols-outlined text-[24px] leading-none">play_circle</span>
                    </span>
                    <p className="font-label-md text-label-md text-white/80">Nothing to show yet</p>
                    <p className="max-w-[34ch] font-code-block text-[12px] leading-relaxed text-white/70">
                      Click Run Code to see stdout, stderr, and compiler messages.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
