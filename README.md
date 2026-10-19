# LockLogic — Neural Password Fortress

> **Think like the attacker. Build like the vault.**

LockLogic is a privacy-focused password-strength analysis and security education project. It combines interactive visualizations, password-pattern analysis, and security guidance to help users understand password strength and common attack patterns.

This repository branch, `frontend-only`, contains the frontend application and its supporting configuration. Backend development and integration should be coordinated separately.

## Features

- **Password analysis:** Evaluate password length, character variety, estimated keyspace, and predictable patterns.
- **Predictability heuristics:** Identify patterns that may make passwords easier to guess.
- **Interactive attack education:** Explore password-security concepts through interactive UI components.
- **Security guidance:** Present suggestions to help users make informed password choices.
- **Breach-check integration:** The frontend includes breach-check-related utility code intended to work with a compatible backend endpoint.
- **AI Vault Coach integration:** The frontend includes a client utility for requesting additional security guidance from a compatible backend.
- **Interactive visuals:** React components and Three.js-based visuals support the user experience.

## Technology Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Three.js and React Three Fiber
- `@zxcvbn-ts` password-strength analysis
- Vitest for testing

## Repository Structure

```text
.
├── src/
│   ├── components/   # Frontend UI components
│   ├── data/         # Frontend data and wordlists
│   ├── ml/           # Heuristic predictability models
│   ├── utils/        # Password analysis and API client utilities
│   ├── App.tsx       # Main application
│   ├── index.css     # Global styles
│   └── main.tsx      # Frontend entry point
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

Install a compatible, current Node.js version and npm.

### Install dependencies

```bash
npm install
```

### Start the frontend development server

```bash
npm run preview
```

**Important:** The current `package.json` configures `npm run dev` to execute `tsx server.ts`. That backend file is not included in this frontend-only branch, so the existing `npm run dev` command will not work from this branch until the backend is supplied or the scripts are adjusted.

The `npm run preview` command uses Vite's preview server. It expects a production build to exist first.

### Build the frontend

```bash
npm run build
```

The current build script also attempts to bundle `server.ts`. Because that file is not present in this branch, the complete build command requires backend integration or a frontend-only build script.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the backend entry point configured in `package.json` |
| `npm run build` | Builds the frontend and bundles the backend entry point |
| `npm run preview` | Previews a previously built frontend |
| `npm test` | Runs the Vitest test suite |
| `npm run lint` | Runs the TypeScript compiler without emitting files |
| `npm start` | Starts the generated backend bundle |

Some scripts require backend files that are not included in this branch.

## Frontend and Backend Collaboration

The frontend contains API client utilities for features such as breach checking and the AI Vault Coach. These features need a compatible backend to operate fully.

Before integrating backend changes, coordinate on:

- API route paths and HTTP methods
- Request and response formats
- Environment-variable names
- Error handling and loading states
- Local development ports and the backend base URL

Backend development should happen on a separate working branch. Review changes before merging them into the shared project.

## Privacy and Security

LockLogic is designed around privacy-conscious password analysis. The frontend includes client-side password-analysis logic and utilities for backend-assisted security features.

Do not assume that every feature is fully private or operational without reviewing its implementation and network behavior. Verify what data each API request sends before deployment.

**Never commit real credentials, API keys, or `.env` files.** Use placeholder values in `.env.example` and keep secrets in local environment configuration.

## Testing

Run the test suite:

```bash
npm test
```

Run the TypeScript check:

```bash
npm run lint
```

Confirm that the necessary source files and dependencies are present before relying on these commands.

## Current Branch

This branch is named `frontend-only`. It contains the frontend snapshot published for collaboration. Backend files from the original full project are not automatically included.

## Contributing

1. Create a separate branch for your work.
2. Keep changes focused and avoid committing secrets or generated files.
3. Run relevant tests and checks.
4. Push your branch and open a pull request for review.

---

**LockLogic — Think like the attacker. Build like the vault.**