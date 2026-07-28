# MusicSense Coding Conventions

This document defines the coding standards for the MusicSense project.

Every contribution should follow these conventions to keep the codebase clean, predictable, and maintainable.

---

# General Principles

- Write code for humans first.
- Prefer readability over cleverness.
- Keep functions small and focused.
- Avoid premature optimization.
- Remove unused code instead of commenting it out.

---

# Project Structure

Frontend

client/
├── components/
├── pages/
├── services/
├── hooks/
├── lib/
├── types/
├── assets/
└── utils/

Backend

server/
├── controllers/
├── routes/
├── services/
├── middleware/
├── models/
├── utils/
├── config/
└── types/

---

# Naming Conventions

Components

PascalCase

Examples

Navbar.tsx

FeatureCard.tsx

MusicUploader.tsx

Hooks

camelCase beginning with "use"

Examples

useAuth.ts

useUpload.ts

useMusicAnalysis.ts

Utilities

camelCase

Examples

formatDate.ts

calculateSimilarity.ts

API Services

camelCase

Examples

authService.ts

musicService.ts

File Names

Use descriptive names.

Avoid:

helper.ts

utils.ts

new.ts

temp.ts

---

# Component Rules

Each component should have a single responsibility.

Good

Navbar

FeatureCard

UploadButton

Bad

MegaComponent

EverythingComponent

HomeEverything

---

# Reusability

Before creating a new component ask:

Can another page use this?

If yes

Move it into

components/

Page-specific UI should stay inside the page folder.

---

# Imports

Import order:

1. React
2. Third-party libraries
3. Internal aliases
4. Relative imports
5. Styles

Keep imports grouped.

Avoid scattered imports.

---

# Functions

Prefer:

Small functions.

Avoid:

300-line functions.

Each function should do one thing well.

---

# State Management

Prefer local state first.

Use Context only when necessary.

Do not introduce Redux, Zustand, or another global state library unless there is a clear need and team approval.

---

# API Calls

All API requests must go through

services/api.ts

Never call axios directly inside components.

Business-specific requests should live in dedicated service files.

Example

services/authService.ts

services/musicService.ts

---

# Environment Variables

Never hardcode:

URLs

API keys

Secrets

Ports

Always use environment variables.

---

# Styling

Use:

Tailwind CSS

shadcn/ui

Avoid inline styles unless absolutely necessary.

Keep utility classes readable.

---

# Comments

Explain WHY.

Do not explain WHAT.

Bad

// Increment i
i++;

Good

// Retry once because the API occasionally returns a transient timeout.
```

---

# Error Handling

Never silently ignore errors.

Always:

Handle

Log

Return meaningful messages

---

# TypeScript

Avoid using:

any

Prefer explicit interfaces and types.

Type safety is mandatory.

---

# Git

Commit only complete milestones.

Avoid commits like:

fix

changes

update

test

Preferred:

feat: implement landing page

feat: add authentication API

fix: resolve upload validation

refactor: extract reusable feature card

---

# Code Review Checklist

Before considering work complete:

✓ Builds successfully

✓ No TypeScript errors

✓ Responsive

✓ Accessible

✓ No duplicated code

✓ Reusable where appropriate

✓ Follows design system

✓ Uses existing project architecture

✓ No unused imports

✓ No console.log statements left behind

---

# AI Development Guidelines

When generating code:

- Reuse existing components before creating new ones.
- Keep files modular.
- Avoid unnecessary dependencies.
- Follow the project architecture.
- Follow the design system.
- Prefer composition over duplication.
- Ask for clarification instead of making assumptions about business logic.