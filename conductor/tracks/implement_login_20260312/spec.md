# Specification: implement_login_20260312

## Overview
This track involves implementing user authentication using JWT. Login will be available via a dialog on the homepage and a dedicated login screen at `/login`.

## Functional Requirements
- **Backend:**
  - Create an `AuthModule` in the Nest.js backend.
  - Implement a `login` endpoint that accepts username and password.
  - Verify credentials against the `users` table in the database.
  - Issue a JWT upon successful authentication.
  - Support "Remember Me" by issuing a long-lived refresh token or adjusting JWT expiration.
  - Provide a mock or placeholder for the "Forgot Password" functionality.
- **Frontend:**
  - Connect the existing `LoginDialog` component to the backend login endpoint.
  - Create a new page at `frontend/app/login/page.tsx` for the dedicated login screen.
  - Implement a "Remember Me" checkbox in the login UI.
  - Add a "Forgot Password" link to the login UI.
  - Persist the JWT (e.g., in `localStorage` or a secure cookie).
  - Update the UI state upon successful login (e.g., show user profile instead of "Sign in" button).

## Non-Functional Requirements
- **Security:** Passwords must be hashed (using `bcrypt` or similar).
- **UX:** Provide clear error messages for invalid credentials.

## Acceptance Criteria
- User can log in from the homepage dialog.
- User can log in from the `/login` page.
- Successful login redirects the user or updates the current page state.
- Invalid login attempts show an appropriate error message.
- "Remember Me" keeps the user logged in after a browser restart.

## Out of Scope
- Actual email sending for "Forgot Password" (only the UI and a placeholder API are required).
- Full user registration flow (can be a separate track).
