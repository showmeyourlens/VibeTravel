# VibeTravel Authentication - Technical Specification

This document outlines the architecture for implementing user authentication, registration, and account management for the VibeTravel application, based on the requirements in `.ai/prd.md`.

## 1. User Interface Architecture

### 1.1. New Pages (Astro)

New pages will be created to host the authentication forms. These pages will be responsible for rendering the layout and importing the interactive React components.

- `src/pages/login.astro`: A public page that renders the `LoginForm` component.
- `src/pages/signup.astro`: A public page that renders the `SignupForm` component.
- `src/pages/forgot-password.astro`: A public page for initiating the password recovery process.
- `src/pages/update-password.astro`: A page for setting a new password after a recovery request. This page will only be accessible via a link from the recovery email.

### 1.2. New & Updated Components

#### 1.2.1. Authentication Forms (React)

A set of new client-side React components will be created to handle user input, client-side validation, and communication with our backend API endpoints. These will function as interactive "islands" within the Astro pages.

- **`src/components/auth/LoginForm.tsx`**:
  - **Responsibility**: Manages login form state, validates inputs (email format, non-empty password), handles form submission, and displays API errors.
  - **Fields**: Email, Password.
  - **Actions**: Submits credentials to `POST /api/auth/login`. On success, it will redirect the user to the dashboard (`/`).

- **`src/components/auth/SignupForm.tsx`**:
  - **Responsibility**: Manages registration form state, validates inputs (email format, password strength), handles form submission, and displays API errors.
  - **Fields**: Email, Password, Confirm Password.
  - **Actions**: Submits credentials to `POST /api/auth/signup`. On success, it will redirect the user to the dashboard (`/`), achieving an "auto-login" experience as per `US-001`.

- **`src/components/auth/ForgotPasswordForm.tsx`**:
  - **Responsibility**: Manages the "forgot password" state and handles form submission.
  - **Fields**: Email.
  - **Actions**: Submits the user's email to `POST /api/auth/forgot-password`. It will display a success message upon submission, instructing the user to check their email.

- **`src/components/auth/UpdatePasswordForm.tsx`**:
  - **Responsibility**: Manages the password update state.
  - **Fields**: New Password, Confirm New Password.
  - **Actions**: Submits the new password to `POST /api/auth/update-password`. It will redirect to `/login` on success.

#### 1.2.2. Layout & Navigation

- **`src/components/layout/UserMenu.tsx`** (New React Component):
  - **Responsibility**: This component will render user-related navigation links conditionally, based on the user's authentication state. It will be included in the main application layout.
  - **Unauthenticated State**: Shows "Login" and "Sign Up" links.
  - **Authenticated State**: Shows a "My Plans" link and a "Logout" button.

- **`src/layouts/Layout.astro`** (Update):
  - **Responsibility**: The main layout will be updated to include the new `UserMenu` component. It will determine the user's authentication status from `Astro.locals` (populated by our middleware) and pass it as a prop to `UserMenu`.

### 1.3. Scenarios & Error Handling

- **Client-Side Validation**: Forms will provide immediate feedback for invalid email formats or mismatched passwords before allowing submission.
- **API Error Display**: Each form component will include a dedicated area to display user-friendly error messages returned from the backend, such as "Invalid email or password" or "An account with this email already exists."
- **Navigation & Redirection**:
  - An unauthenticated user attempting to access a protected page (e.g., `/plans/new`) will be automatically redirected to `/login`.
  - A logged-in user navigating to `/login` or `/signup` will be redirected to the homepage (`/`).

## 2. Backend Logic

### 2.1. API Endpoints (Astro)

Astro API routes will serve as the secure server-side layer to handle all authentication logic, communicating with Supabase on behalf of the client.

- **`POST /api/auth/signup`**:
  - **Responsibility**: Handles new user registration.
  - **Input Contract**: `{ email: string, password: string }`.
  - **Logic**: Validates input, calls the Supabase `signUp` method, sets session cookies, and returns a success or error response.

- **`POST /api/auth/login`**:
  - **Responsibility**: Handles user login.
  - **Input Contract**: `{ email: string, password: string }`.
  - **Logic**: Validates input, calls the Supabase `signInWithPassword` method, sets session cookies, and returns a success or error response.

- **`POST /api/auth/logout`**:
  - **Responsibility**: Handles user logout.
  - **Input Contract**: None.
  - **Logic**: Calls the Supabase `signOut` method and clears session cookies.

- **`GET /api/auth/callback`**:
  - **Responsibility**: Required by Supabase to handle the server-side exchange of an auth code for a user session, which is part of its server-side auth flow.
  - **Logic**: Calls Supabase `exchangeCodeForSession`, sets session cookies, and redirects the user to the dashboard.

- **`POST /api/auth/forgot-password`**:
  - **Responsibility**: Initiates the password reset process.
  - **Input Contract**: `{ email: string }`.
  - **Logic**: Calls the Supabase `resetPasswordForEmail` method.

- **`POST /api/auth/update-password`**:
  - **Responsibility**: Updates the user's password using a valid session.
  - **Input Contract**: `{ newPassword: string }`.
  - **Logic**: Verifies the user's session and calls the Supabase `updateUser` method with the new password.

### 2.2. Middleware

- **`src/middleware/index.ts`** (Update):
  - **Responsibility**: Will be updated to manage user sessions and protect routes across the application.
  - **Logic**: On every request, it will inspect cookies to retrieve the Supabase session. If a valid session exists, user data will be attached to `Astro.locals.user` to make it available in all server-rendered pages. For protected routes (e.g., any under `/plans/`), it will redirect to `/login` if no user is found.

### 2.3. Data Validation

- **`src/lib/schemas/auth.schema.ts`** (New): A new file will be created to house `Zod` schemas for all authentication-related payloads (registration, login, password update). This centralizes validation rules for use in the API endpoints.

## 3. Authentication System (Supabase)

### 3.1. Supabase Auth Configuration

- **Disable Email Confirmation**: To meet the requirement from `US-001` for automatic login after registration, the "Confirm email" option in the Supabase Auth settings will be disabled.
- **Email Templates**: The password recovery email template within Supabase will be customized to align with VibeTravel's branding.

### 3.2. Integration Strategy

- **Server-Side Auth Flow**: The integration will exclusively use Supabase's Server-Side Auth helpers for Astro (`@supabase/auth-helpers-astro`). This ensures that authentication state is managed securely through server-side cookies, and credentials are never exposed to the client. A server-side Supabase client will be instantiated in the Astro middleware and used across all API routes.
