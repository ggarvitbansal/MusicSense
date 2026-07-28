# MusicSense AI Context

Persistent development context, engineering guardrails, stack patterns, and code generation rules for AI assistants and developers contributing to MusicSense: An AI-powered Music Intelligence Platform.

---

## Overview
This document provides coding constraints and architectural boundaries for the MusicSense project. It is designed to be read by AI coding agents and engineers before any modification or extension of the codebase. By clarifying style preferences, code reusability rules, state management guidelines, and API clients, this document ensures the codebase remains maintainable, scalable, and safe.

## Purpose
AI assistants generate code quickly but can sometimes introduce architectural drift, redundant utilities, unapproved dependencies, or security issues if not guided by project-specific context. This document acts as a persistent guardrail to:
1. **Enforce Architectural Consistency**: Keep code aligned with the modular 3-tier structure (React, Express, Python ML).
2. **Prevent Code Bloat**: Guide developers to reuse existing libraries (Tailwind CSS, shadcn/ui) and components instead of creating duplicates.
3. **Streamline Integrations**: Enforce type safety standards and API integration conventions to prevent runtime regressions.

## Design Goals
- **Coherence**: Ensure all generated code matches the established structural patterns of the mono-repository.
- **Simplicity**: Favor clean, readable code over complex, highly abstract structures.
- **System Safety**: Protect the upload pipeline and local filesystems by enforcing security rules.

## Current Status
The foundation blocks, database migrations, auth middleware, and upload pipeline are operational. Developers and AI assistants must coordinate feature additions according to this roadmap.

## Future Scope
This document will be updated to include constraints for the Python `ml-service` module (including Pandas, TensorFlow, and Librosa coding guidelines) and guidelines for writing unit and integration tests.

## Possible Improvements
- **Auto-Linter Integrations**: Setting up custom ESLint rules matching these AI context patterns to automate syntax checking.

---

## Technical Specifications & Decisions

### 1. Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, Axios.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **ML Service**: Python 3.10, TensorFlow, Librosa.

### 2. Design Philosophy
- **Aesthetic Inspiration**: Minimalist, high-density, professional SaaS layouts (Spotify, Linear, Notion).
- **Avoid**: Flashing animations, neon glow boundaries, excessive gradients, and unstructured typography.
- **Rules File**: Refer to [design-system.md](file:///c:/Users/GARVIT_BANSAL/Projects/MusicSense/docs/design-system.md).

### 3. Coding Philosophy
- **Prefer**: Modular architectures, single-responsibility modules, explicit interfaces, and clear naming.
- **Avoid**: Multi-hundred-line components, duplicate utility modules, and premature optimization.

---

## Developer Guardrails & Rules

### Component Rules
- Reusable UI elements must reside in `client/src/components/`.
- Page-specific sub-components should remain with their respective page views in `client/src/pages/`.
- Verify if a component exists in the local workspace or in the shadcn/ui library before writing new elements.

### API Integration Rules
- Never hardcode API paths or base URLs inside page components.
- All requests must go through `client/src/services/api.ts`.
- Group API endpoints inside service files (e.g. `authService.ts`, `musicService.ts`).

### TypeScript Standards
- Avoid using the `any` keyword.
- Define interfaces and types explicitly. Utilize compiler configurations to enforce strict type checking.

### State Management
- Utilize local component state (`useState`, `useReducer`) by default.
- Move to Context APIs only when state must be shared across deeply nested components.
- Do not install global state management libraries (Redux, Zustand) without team consensus.

### Dependency Management
- Do not install packages automatically.
- Before proposing a new dependency, verify if the feature can be implemented using standard Web APIs or existing libraries.

### UI Development Sequence
Implement features strictly in this order:
1. **Structure**: Write clean, semantic HTML5 elements.
2. **Responsiveness**: Verify breakpoint formatting for mobile and desktop screens.
3. **Accessibility**: Set focus states, aria-labels, and keyboard event handlers.
4. **Styling**: Apply styling tokens via Tailwind CSS.
5. **Polish**: Add hover effects and load transitions.

### Error Handling
- Never write empty catch blocks or ignore exceptions.
- Ensure backend errors are logged, database transactions are rolled back where appropriate, and clean error messages are returned to the client.

### Git & Commit Workflow
Commit changes in complete logical milestones. Use structured prefixes:
- `feat:` for new capabilities.
- `fix:` for bug resolutions.
- `refactor:` for code restructuring.
- `docs:` for documentation updates.
- `chore:` for workspace adjustments.

---

## AI Assistant Operational Guidelines
When writing code for MusicSense:
1. **Verify Context**: Review [architecture.md](file:///c:/Users/GARVIT_BANSAL/Projects/MusicSense/docs/architecture.md) and [conventions.md](file:///c:/Users/GARVIT_BANSAL/Projects/MusicSense/docs/conventions.md) before writing any code.
2. **Clarify Intent**: If user requirements or business rules are ambiguous, ask clarifying questions instead of making assumptions.
3. **Minimize Churn**: Keep code changes compact and targeted. Reuse existing assets and logic.
4. **Type Enforce**: Write typed contracts for all API payloads and internal modules.