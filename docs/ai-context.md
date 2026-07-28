# MusicSense AI Context

This document provides persistent context for AI coding assistants contributing to MusicSense.

Read this file before implementing any feature.

---

# Project Overview

MusicSense is a production-quality AI-powered music intelligence platform.

The application analyzes a user's local music collection using machine learning and audio signal processing to generate meaningful insights, predictions, and visualizations.

This project is intended to showcase strong software engineering practices, clean architecture, and modern full-stack development.

Code quality is more important than implementation speed.

---

# Primary Goals

Always optimize for:

1. Maintainability
2. Scalability
3. Readability
4. Reusability
5. Type Safety
6. User Experience

Never sacrifice architecture for short-term convenience.

---

# Technology Stack

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Axios

Backend

- Node.js
- Express
- TypeScript

Database (planned)

- PostgreSQL
- Prisma ORM

Machine Learning (planned)

- Python
- TensorFlow
- Librosa

---

# Architecture

The project follows a modular architecture.

Frontend

Pages

↓

Reusable Components

↓

Services

↓

REST API

↓

Backend

↓

Database / ML Service

Keep responsibilities separated.

Never mix business logic into UI components.

---

# Existing Decisions

These decisions have already been made.

Do not replace them unless explicitly instructed.

UI Library

✓ shadcn/ui

Styling

✓ Tailwind CSS

HTTP Client

✓ Axios

Routing

✓ React Router

Language

✓ TypeScript

Backend

✓ Express

---

# Design Philosophy

The UI should resemble a modern SaaS product.

Inspired by:

- Spotify
- Vercel
- Linear
- GitHub
- Notion

Avoid:

- Generic AI-generated landing pages
- Excessive gradients
- Glassmorphism
- Decorative animations
- Inconsistent spacing
- Random typography

Follow docs/design-system.md.

---

# Coding Philosophy

Prefer:

Small modules.

Reusable components.

Clear names.

Single responsibility.

Avoid:

Large components.

Code duplication.

Unnecessary abstraction.

Premature optimization.

---

# Before Writing Code

Always ask:

Can this reuse an existing component?

Can this become a reusable component?

Does this already exist in shadcn/ui?

Can this be simplified?

---

# Component Rules

Reusable components belong in

components/

Page-specific components remain with their page.

Do not duplicate UI.

---

# API Rules

Never hardcode URLs.

Always use

services/api.ts

Business-specific API calls belong inside dedicated service files.

Example

authService.ts

musicService.ts

---

# TypeScript

Avoid

any

Prefer explicit interfaces.

Prefer type safety over convenience.

---

# State Management

Use local state by default.

Use Context only when justified.

Do not introduce Redux, Zustand, MobX, or other state management libraries without approval.

---

# Dependencies

Do not install packages automatically.

Before adding a dependency ask:

Is there already a built-in solution?

Can this be implemented with existing libraries?

Will this dependency increase maintenance cost?

If uncertain,

ask first.

---

# File Creation

Prefer extending existing modules.

Do not generate unnecessary files.

Keep folders organized.

---

# UI Development Order

1. Structure
2. Responsiveness
3. Accessibility
4. Styling
5. Polish

Do not reverse this order.

---

# Error Handling

Never silently ignore errors.

Always provide meaningful error messages.

Backend responses should be predictable.

---

# Git Workflow

Never commit partial features.

Every commit should represent a complete milestone.

Commit message format

feat:

fix:

refactor:

docs:

chore:

Avoid vague commit messages.

---

# Documentation

Whenever introducing a significant architectural decision,

update the appropriate file in

docs/

Do not allow documentation to become outdated.

---

# AI Behaviour

If requirements are unclear,

ask for clarification instead of making assumptions.

If multiple implementation approaches exist,

choose the simplest maintainable solution.

Prioritize long-term maintainability over writing the fewest lines of code.

Follow:

docs/architecture.md

docs/design-system.md

docs/conventions.md

docs/roadmap.md

before generating code.