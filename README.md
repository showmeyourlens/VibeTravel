# VibeTravel

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/your-org/your-repo) [![Build Status](https://img.shields.io/github/actions/workflow/status/your-org/your-repo/ci.yml?branch=master)](https://github.com/your-org/your-repo/actions) [![License](https://img.shields.io/badge/license-TBD-lightgrey.svg)]

A modern web application that uses AI to transform high-level travel ideas into geographically optimized daily itineraries, saving solo and couple travelers time and effort when planning 1–5 day trips in 10 popular European cities.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Available Scripts](#available-scripts)
4. [Project Scope](#project-scope)
5. [Project Status](#project-status)
6. [License](#license)

## Tech Stack

- **Frontend:** Astro 5, React 19, Tailwind CSS 4, Shadcn/ui
- **Backend & Database:** Supabase (PostgreSQL, authentication, auto-generated APIs)
- **AI Itinerary Generation:** Openrouter.ai
- **Testing:** Vitest, React Testing Library, Playwright, MSW (Mock Service Worker)
- **CI/CD & Hosting:** GitHub Actions, DigitalOcean

## Getting Started

### Prerequisites

- Node.js v22.14.0 (see `.nvmrc`)
- npm (included with Node.js)

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/your-org/your-repo.git
   cd your-repo
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file (or set environment variables) with the following:
   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   OPENROUTER_API_KEY=your-openrouter-api-key
   ```
4. Start the development server
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

In the project directory, you can run:

- `npm run dev`  
  Launches the Astro development server with hot-reload.
- `npm run build`  
  Builds the application for production.
- `npm run preview`  
  Serves the production build locally.
- `npm run astro`  
  Exposes Astro CLI commands.
- `npm run lint`  
  Runs ESLint across the codebase.
- `npm run lint:fix`  
  Runs ESLint and automatically fixes problems.
- `npm run format`  
  Formats code using Prettier.
- `npm test`  
  Runs all tests (unit, integration, and component tests) using Vitest.
- `npm run test:unit`  
  Runs unit tests only.
- `npm run test:e2e`  
  Runs end-to-end tests using Playwright.
- `npm run test:coverage`  
  Generates test coverage report.

## Project Scope

### In Scope (MVP)

- User account management (email/password sign-up & login)
- Travel Plan Wizard (select city from 10 options, trip duration 1–5 days, intensity “full day” or “half day”, free-text notes)
- AI-powered itinerary generation with:
  - 4–5 activities for full-day plans, 2–3 for half-day
  - Google Maps links for each activity
  - Disclaimer to verify details (e.g., opening hours)
- Itinerary editing controls (move up/down, delete)
- Plan saving to user accounts
- User feedback (“Was this plan helpful?”)
- Basic error handling for AI generation failures

### Out of Scope for MVP

- Monetization & payment processing
- Password recovery (“Forgot Password”)
- Advanced editing (drag-and-drop UI)
- Social login providers (e.g., Google, Facebook)
- Real-time data (traffic, live schedules)
- Post-signup profile management
- Plan sharing with other users

## Project Status

This project is currently in MVP development. Core features are implemented according to the Product Requirements Document. Further enhancements, styling refinements, and production hardening are planned.

## License

This project does not currently include a license. Please add a `LICENSE` file to specify usage terms.
