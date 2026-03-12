# Implementation Plan: implement_login_20260312

## Phase 1: Backend Auth Infrastructure
- [ ] Task: Create `AuthModule` and `AuthService` structure
    - [ ] Write Tests: Verify `AuthModule` can be initialized and dependencies are injected
    - [ ] Implement: Create `AuthModule`, `AuthService`, and `AuthController` shells
- [ ] Task: Configure JWT and Bcrypt
    - [ ] Write Tests: Verify Bcrypt hashing/comparison and JWT signing/verification
    - [ ] Implement: Install dependencies (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`) and configure Passport with JWT strategy
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend Auth Infrastructure' (Protocol in workflow.md)

## Phase 2: Backend Login Logic
- [ ] Task: Implement login endpoint
    - [ ] Write Tests: Verify login endpoint returns JWT for valid credentials and 401 for invalid ones
    - [ ] Implement: Logic in `AuthService` to validate user against the `users` table and issue a JWT
- [ ] Task: User state verification (Profile endpoint)
    - [ ] Write Tests: Verify `/auth/profile` returns user data when called with a valid JWT
    - [ ] Implement: Create a protected endpoint to verify the auth state from the frontend
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Backend Login Logic' (Protocol in workflow.md)

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
