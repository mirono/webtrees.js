# Implementation Plan: implement_login_20260312

## Phase 1: Backend Auth Infrastructure [checkpoint: acf8dc6]
- [x] Task: Create `AuthModule` and `AuthService` structure [7ad098b]
    - [x] Write Tests: Verify `AuthModule` can be initialized and dependencies are injected
    - [x] Implement: Create `AuthModule`, `AuthService`, and `AuthController` shells
- [x] Task: Configure JWT and Bcrypt [d96a3bf]
    - [x] Write Tests: Verify Bcrypt hashing/comparison and JWT signing/verification
    - [x] Implement: Install dependencies (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`) and configure Passport with JWT strategy
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend Auth Infrastructure' (Protocol in workflow.md) [acf8dc6]

## Phase 2: Backend Login Logic [checkpoint: 5452f56]
- [x] Task: Implement login endpoint [2445e15]
    - [x] Write Tests: Verify login endpoint returns JWT for valid credentials and 401 for invalid ones
    - [x] Implement: Logic in `AuthService` to validate user against the `users` table and issue a JWT
- [x] Task: User state verification (Profile endpoint) [f4b615e]
    - [x] Write Tests: Verify `/auth/profile` returns user data when called with a valid JWT
    - [x] Implement: Create a protected endpoint to verify the auth state from the frontend
- [x] Task: Conductor - User Manual Verification 'Phase 2: Backend Login Logic' (Protocol in workflow.md) [5452f56]

## Phase 3: Frontend Login Integration
- [ ] Task: Create dedicated login page
    - [ ] Write Tests: Verify the `/login` route renders correctly and contains the login form
    - [ ] Implement: Create `frontend/app/login/page.tsx` using the existing UI patterns
- [ ] Task: Connect homepage `LoginDialog` to backend
    - [ ] Write Tests: Verify that submitting the form calls the backend API and updates the local state
    - [ ] Implement: Add fetch/Query call to `LoginDialog` and update the global authentication context
- [ ] Task: Persistent Auth State
    - [ ] Write Tests: Verify that the authentication state is restored from local storage on page refresh
    - [ ] Implement: Store the JWT in `localStorage` or a secure cookie and use it for subsequent API requests
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend Individual View' (Protocol in workflow.md)

## Phase 4: Advanced Login Features
- [ ] Task: "Remember Me" functionality
    - [ ] Write Tests: Verify that selecting "Remember Me" results in a persistent session
    - [ ] Implement: Add the checkbox to the UI and adjust JWT/session expiration logic accordingly
- [ ] Task: "Forgot Password" UI and placeholder
    - [ ] Write Tests: Verify the "Forgot Password" link is present and redirects to a placeholder/mock flow
    - [ ] Implement: Add the link to the UI and create a placeholder API endpoint for password recovery
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Advanced Login Features' (Protocol in workflow.md)
