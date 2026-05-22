# Project Context - Programo Academia

## Current Status
We are in the **Architecture & Planning** phase. We have analyzed the frontend HTML mockups and proposed a folder structure using Next.js (Pages Router) to transition the static UI into a functional dynamic learning application.

## Core Modules & Features
- **Landing Page (`/`):** Dynamic landing page using the "Technical Academic Minimalist" theme.
- **C++ Learning Track (`/cpp`):** Modules list for beginners covering Data Types, Control Flow, Functions, Pointers, STL Basics (maps to `/pages/cpp/index.js`).
- **DSA Track Overview (`/dsa`):** Bento-grid style navigation showing progress of lessons (maps to `/pages/dsa/index.js`).
- **Dynamic Topic Flow (`/dsa/[slug]`):** Dynamic course pages with a shared navigation Sidebar and bottom action bar (maps to `/pages/dsa/[slug].js`).
- **Dynamic MCQ Quiz (`/quiz/[topic]`):** Active selection and validation logic, grading, scoring, and explanations.
- **Authentication System (`/login`, `/signup`):** Built-in components styled according to the minimalist branding (maps to `/pages/login.js` and `/pages/signup.js`).
- **Shared Components:**
  - `Layout` wrapping pages in global elements.
  - `Navbar` with programming languages dropdown.
  - `Footer` listing site pages.
  - `Sidebar` for lesson traversal.
  - Floating dummy AI Chatbot.

## Folder Structure
```
/project-root
  ├── /pages
  │     ├── index.js             # Homepage
  │     ├── /dsa
  │     │     ├── index.js       # DSA Track Overview
  │     │     └── [slug].js      # Topic Lesson Reader
  │     ├── /cpp
  │     │     └── index.js       # C++ Beginners Track
  │     ├── /quiz
  │     │     └── [topic].js     # MCQ Quiz Page
  │     ├── login.js             # Login Screen
  │     └── signup.js            # Signup Screen
  ├── /components                # Shared React Components
  │     ├── Layout.js            # Global layout wrapper
  │     ├── Navbar.js            # Top navigation bar
  │     └── Footer.js            # Global footer
  ├── /data                      # JSON-like Static Database
  ├── /utils                     # Utility helpers
  └── /styles                    # CSS stylesheets and global resets
```

## Upcoming Milestones
1. [ ] Initialize Next.js project structure in workspace root.
2. [ ] Integrate Tailwind CSS config with the palette tokens from `DESIGN.md`.
3. [ ] Build dynamic data stores (`topics.js` & `quizzes.js`).
4. [ ] Implement shared UI components (`Navbar`, `Footer`, `Sidebar`).
5. [ ] Implement pages and client-side routing flow.
6. [ ] Implement dynamic interactive quiz grading logic.
7. [ ] Build Login & Signup pages from scratch following the visual style guide.
