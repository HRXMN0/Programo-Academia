// The C++ track. Lives here rather than inside the page so the homepage can count
// modules from the same source the curriculum renders from — no more hand-typed
// totals drifting away from reality.
//
// `lessonReady` is the honest bit: false means there is no lesson page behind this
// module yet, only an AI tutor explainer. Flip it to true (and add a `slug`) once a
// real lesson exists, and the UI will start linking to it instead.
export const cppModules = [
  {
    id: 'data-types',
    title: 'Data Types',
    desc: 'Understand primitive types, variables, memory allocation, and constants in C++.',
    icon: 'data_object',
    tag: null,
    lessonReady: false
  },
  {
    id: 'control-flow',
    title: 'Control Flow',
    desc: 'Master logic with if/else conditionals, switch statements, and iterative loops (for, while).',
    icon: 'route',
    tag: null,
    lessonReady: false
  },
  {
    id: 'functions',
    title: 'Functions',
    desc: 'Learn to write modular, reusable code. Cover function declaration, definition, parameters, return types, and scope.',
    icon: 'functions',
    tag: null,
    lessonReady: false,
    codeBlock: `int add(int a, int b) {
  return a + b;
}`
  },
  {
    id: 'pointers',
    title: 'Pointers',
    desc: 'Demystify memory addresses, dereferencing, and pointer arithmetic essential for C++ proficiency.',
    icon: 'ads_click',
    tag: 'Core Concept',
    lessonReady: false
  },
  {
    id: 'stl-basics',
    title: 'STL Basics',
    desc: 'Introduction to the Standard Template Library. Explore vectors, strings, and basic algorithms.',
    icon: 'library_books',
    tag: null,
    lessonReady: false
  }
]

export default cppModules
