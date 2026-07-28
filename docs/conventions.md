# MusicSense Coding Conventions

The engineering standards, naming patterns, file structures, and quality checklists for development in the MusicSense mono-repository: An AI-powered Music Intelligence Platform.

---

## Overview
This document defines the software engineering standards and code quality rules for the MusicSense codebase. It covers file naming, directory structure, imports organization, TypeScript typing practices, API client patterns, error handling, and Git workflows. Compliance with these conventions is mandatory for all contributions.

## Purpose
A codebase spanning a React client, an Express API backend, and a Python ML service can quickly become disorganized without clear conventions. Standardizing development practices ensures:
1. **Low Cognitive Load**: Developers can navigate and understand code in any module quickly.
2. **Predictable Code Reviews**: Code reviews focus on logic, security, and performance rather than formatting arguments or naming style debates.
3. **Fewer Integration Bugs**: Standardizing interfaces (e.g. unified API clients instead of direct Axios calls) reduces integration errors.

## Design Goals
- **Readability Over Cleverness**: Code must be written for other engineers first. Avoid overly abstract or compact patterns.
- **Strict Separation of Concerns**: Keep UI layers, business orchestrators, database layers, and ML model runtimes completely separate.
- **Defensive Error Management**: Never allow exceptions to fail silently. Always catch, log, and return clean messages.
- **Git Traceability**: Maintain a clear git history using standardized commit tags.

## Current Status
Coding conventions are established for the React client and Express server. TypeScript configuration files (`tsconfig.json`) are in place and configured with strict typing rules.

## Future Scope
- **ML Coding Standards**: Enforcing PEP 8 conventions, typing annotations (via Type Hints), and documentation rules for the Python `ml-service`.
- **Pre-commit Automation**: Integrating Husky and lint-staged to run auto-formatters (Prettier) and linters (ESLint, Flake8) before committing code.

## Possible Improvements
- **Automated Code Quality Metrics**: Configuring tools like SonarQube or CodeClimate in the CI/CD pipeline to track code duplication, complexity metrics, and test coverage automatically.

---

## Repository Structure

### Frontend Directory (`client/`)
```
client/
├── components/   # Shared, stateless UI components (Buttons, Inputs, Modals)
├── pages/        # Stateful page views (Dashboard, UploadPage, Landing)
├── services/     # API integration service modules (authService, musicService)
├── hooks/        # Reusable React hooks (useAuth, useUpload)
├── lib/          # External library wrapper configurations (e.g., shadcn/ui utils)
├── types/        # TypeScript interfaces and type definitions
├── assets/       # Static local media, logos, and illustrations
└── utils/        # Generic helper functions (date formatters, mathematical helpers)
```

### Backend Directory (`server/`)
```
server/
├── controllers/  # Route controller implementations (business logic)
├── routes/       # Express route definitions and parameter mappings
├── services/     # Core services (Database operations, pipeline management)
├── middleware/   # Express middleware (auth check, file filters, error handlers)
├── models/       # Database models and type schemas
├── utils/        # Internal server helpers (UUID generators, fs cleanups)
├── config/       # Environment variable configurations
└── types/        # Internal backend TypeScript types
```

---

## Naming Conventions

### 1. Components & Views
- **Pattern**: PascalCase.
- **Examples**: `Navbar.tsx`, `FeatureCard.tsx`, `MusicUploader.tsx`.

### 2. Custom Hooks
- **Pattern**: camelCase prefixed with `use`.
- **Examples**: `useAuth.ts`, `useUpload.ts`, `useMusicAnalysis.ts`.

### 3. Utility Modules & Helper Functions
- **Pattern**: camelCase.
- **Examples**: `formatDate.ts`, `calculateSimilarity.ts`.

### 4. API Service Integrations
- **Pattern**: camelCase suffixed with `Service`.
- **Examples**: `authService.ts`, `musicService.ts`.

### 5. Filenames
- **Rule**: Filenames must be descriptive.
- **Avoid**: Generic names like `helper.ts`, `utils.ts`, `new.ts`, `temp.ts`.

---

## Engineering Rules

### Single Responsibility Components
Each React component must handle one concern. Stateful operations and business logic should be extracted into custom hooks or services, leaving the UI components clean and presentable.
- **Good**: A `MusicUploader` component handling the file drag-and-drop state, delegating the network upload logic to a `useUpload` hook.
- **Bad**: A single component that manages upload states, validates files, executes raw Axios calls, hashes user sessions, and draws charts.

### Reusability
Before building a new component, check if it can be reused across pages.
- Reusable UI elements must be located in `client/components/`.
- Page-specific UI elements should remain inside their respective page folder.

### Import Organization
Keep imports grouped and organized:
1. React core libraries.
2. Third-party packages.
3. Internal aliases (e.g., `@/components/`, `@/services/`).
4. Relative imports (`../components/`).
5. Style sheets.

### State Management
- Default to local React state (`useState`, `useReducer`) first.
- Move to Context APIs only when state must be accessed by multiple nested tree children.
- Do not introduce global state managers (Redux, Zustand) without team review.

### API Integrations
All API requests must go through `client/services/api.ts` which configures baseUrl and interceptors.
- Never write raw Axios calls directly inside components.
- Group related APIs inside service files (e.g., `services/authService.ts`).

### Strict Type Safety
- **Rule**: Never use the `any` type in TypeScript.
- Write explicit interfaces and type guards. Use Prisma-generated models directly for database schema structures.

### Defensive Error Handling
Never ignore exceptions or write empty `catch` blocks.
- **Required**: Log errors with context, clean up resources (e.g., deleting temporary files on disk when a DB transaction fails), and return human-readable messages to the user.

---

## Git Workflow & Commit Rules
We use a structured commit naming system to generate clean, legible history:
- `feat: <description>`: Introduction of new features.
- `fix: <description>`: Bug fixes.
- `refactor: <description>`: Code changes that do not modify behavior or fix bugs.
- `docs: <description>`: Documentation changes.
- `chore: <description>`: Build script, workspace configurations, or dependency updates.

*Avoid vague commits like "fix", "changes", "wip", or "test".*

---

## Code Review Checklist
Before marking a task as complete and opening a merge request, verify:
- [x] Compilation: The codebase compiles without errors.
- [x] TypeScript: Zero TypeScript warnings or `any` references remain.
- [x] Responsive: Views adapt to mobile and desktop screens.
- [x] Performance: No redundant components are rerendered, and physical file paths are securely hidden.
- [x] Cleanliness: Dead code, unused imports, and debug console logs are removed.