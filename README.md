# TaskFlow

A modern, minimalist personal project and task management web application designed for focused productivity. TaskFlow provides a clean workspace inspired by tools like Linear, enabling you to manage coding projects, daily tasks, deadlines, and milestones in one unified dashboard.

---

## Features

- **Dashboard Overview**: Key performance indicators (Total, In Progress, Completed, Overdue), today's focus list, and upcoming deadlines.
- **Task Management**: Create, edit, prioritize (Urgent, High, Medium, Low), and filter tasks with multi-criteria search and sorting.
- **Projects & Milestones**: Group tasks into dedicated projects with custom color accents, status tracking, and progress percentage meters.
- **Interactive Kanban Board**: Visual workflow board featuring Backlog, To Do, In Progress, and Done stages with drag-and-drop and quick stage selectors.
- **Monthly Calendar**: Visual calendar to plan schedules, inspect daily tasks, and track approaching deadlines.
- **Completed Archive**: History of finished items with one-click reopen functionality.
- **100% Local & Private**: All data is stored directly in your browser's Local Storage. Includes complete JSON backup export and import.
- **Minimalist Dark UI**: High-contrast, distraction-free dark interface with a sticky fixed sidebar and responsive mobile layout.

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Storage**: Client-side State + HTML5 LocalStorage

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18 or higher) installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/taskflow.git
   cd taskflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## Production Build

To build the project for production:

```bash
npm run build
```

The compiled static files will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## Deployment

### Deploying to Vercel

TaskFlow includes a pre-configured `vercel.json` with Single Page Application (SPA) rewrite rules to ensure seamless routing without 404 errors:

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your repository. Vercel will automatically detect the **Vite** framework preset.
4. Click **Deploy**.

---

## Project Structure

```
taskflow/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication views
│   │   ├── common/        # Modals, toasts, empty states
│   │   ├── layout/        # Fixed sidebar, header, mobile navigation
│   │   ├── projects/      # Project modals and forms
│   │   ├── tasks/         # Task cards, forms, detail inspectors
│   │   └── views/         # Dashboard, Tasks, Projects, Kanban, Calendar, Settings
│   ├── services/          # Storage persistence, authentication helpers
│   ├── types/             # TypeScript interfaces and domain models
│   ├── utils/             # Date formatting and progress calculations
│   ├── App.tsx            # Root application router and layout
│   └── main.tsx           # Application entry point
├── vercel.json            # Deployment routing configuration
└── vite.config.ts         # Vite build configuration
```

---

## License

This project is licensed under the MIT License.
