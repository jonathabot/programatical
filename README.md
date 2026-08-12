# Programatical 🚀

> **Interactive and Gamified Educational Platform for Teaching Programming**
>
> This project was developed as a **Capstone Project** to complete a **Technology Degree**.

---

## 📋 About the Project

**Programatical** is an interactive web platform designed to revolutionize how programming and software engineering concepts are taught. By leveraging gamification and dynamic learning methodologies, the system aims to engage students and solidify theoretical concepts through practical, free hands-on practice.

Topics covered include core modern software engineering concepts:
* 🌀 **Scrum and Agile Methodologies**
* 🏗️ **Software Architecture**
* 🛡️ **SOLID Principles**
* 🗺️ **Domain-Driven Design (DDD)**
* 🌿 **Git and Workflows**

---

## ✨ Key Features

### 🎓 Student Area
* **Personalized Dashboard:** Centralized interface displaying active courses (with progress tracking) and available courses for new enrollments.
* **Multi-Step Interactive Lessons:** Each lesson is structured into dynamic stages:
  * **Reading Stages:** Theoretical content presented in a clear, accessible format.
  * **Multiple-Choice Questions:** Challenges with real-time feedback for theoretical reinforcement.
  * **Ordering/Matching Challenges:** Interactive exercises where students click and arrange words to solve prompts.
* **Scoring and Gamification:** Lesson progress earns points toward a live leaderboard.
* **Real-Time Leaderboard:** Competitive ranking table featuring top performers, filtered by overall ("All-Time") and weekly ("7 days") performance.
* **User Profile:** Management of logged-in student account details.

### 🛠️ Admin Panel (Instructor/Administrator)
* **Content Manager:** Dedicated tool to create, edit, and delete Courses, Modules, Lessons, and individual Stages (Quizzes, Texts).
* **Dynamic Input Forms:** Smart validation using Zod and React Hook Form to safely create new educational materials.

---

## 🛠️ Tech Stack

The chosen tech stack prioritizes interactivity, performance, and development speed:

* **Core:** [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [TailwindCSS](https://tailwindcss.com/)
* **Database & Auth:** [Firebase SDK](https://firebase.google.com/) (Firestore for NoSQL storage and Firebase Auth for student/admin authentication)
* **Animations:** [Framer Motion](https://www.framer.com/motion/) (for smooth UI transitions and instant answer feedback)
* **UI Components:** [Ant Design](https://ant.design/) (Pro Components) and [Radix UI](https://www.radix-ui.com/) primitives
* **Data Validation:** [Zod](https://zod.dev/) and [React Hook Form](https://react-hook-form.com/)

---

## 📂 Project Structure

Below is the directory structure of the application:

```text
programatical/
├── app/                    # Application pages and routes (Next.js App Router)
│   ├── about-us/           # Platform and team information
│   ├── administrationpage/ # Admin panel interface
│   ├── coursepage/         # Interactive course, module, and lesson screens
│   ├── initialpage/        # Student dashboard (courses and leaderboard)
│   ├── login/              # Login screen
│   ├── register/           # New student registration
│   ├── userprofile/        # Student profile page
│   ├── globals.css         # Global styles and TailwindCSS tokens
│   └── layout.tsx          # Base layout with theme and session providers
├── components/             # User interface (UI) components
│   ├── ui/                 # Reusable micro-components (Buttons, Inputs, etc.)
│   ├── AvailableCourses.tsx # Carousel of newly available courses
│   ├── Etapas.tsx           # Lesson stage renderers (Text, Quiz, Ordering)
│   ├── OngoingCourses.tsx   # User's active courses
│   └── Ranking.tsx          # Leaderboard table with time filters
├── hooks/                  # Custom React hooks for shared logic
├── lib/
│   └── firebase/           # CRUD communication functions for Firestore (courses, ranking, users)
├── types/                  # TypeScript interfaces defining domain models
└── firebase.config.ts       # Firebase service initialization and exports
```

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have installed in your environment:
* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* `yarn` or `npm` package manager

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/programatical.git
   cd programatical
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Firebase Configuration:**
   The project comes pre-configured with a default test instance in `firebase.config.ts`. To connect your own Firebase database:
   * Create a project in the Firebase Console.
   * Enable **Authentication** (Email/Password) and **Cloud Firestore**.
   * Replace credentials in `firebase.config.ts` or set up environment variables.

4. **Run the development server:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
