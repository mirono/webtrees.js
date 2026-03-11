# Implementation Plan: core_models_20260311

## Phase 1: Core Data Models
- [x] Task: Backend - Implement `Individual` entity [4c9be09]
    - [ ] Create `Individual` entity with standard GEDCOM fields (id, names, sex, birth, death)
    - [ ] Add basic tests for the `Individual` entity
- [ ] Task: Backend - Implement `Family` entity
    - [ ] Create `Family` entity with relationships (HUSB, WIFE, CHIL)
    - [ ] Add basic tests for the `Family` entity
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Data Models' (Protocol in workflow.md)

## Phase 2: API Endpoints
- [ ] Task: Backend - Individual controller & service
    - [ ] Implement `getIndividualById` and `getAllIndividuals` endpoints
    - [ ] Add unit tests for the controller and service
- [ ] Task: Conductor - User Manual Verification 'Phase 2: API Endpoints' (Protocol in workflow.md)

## Phase 3: Frontend Individual View
- [ ] Task: Frontend - Individual Profile Page
    - [ ] Create a dynamic route `/individuals/[id]` to display individual details
    - [ ] Implement data fetching using TanStack Query
    - [ ] Design a simple layout for individual information (name, dates, family)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend Individual View' (Protocol in workflow.md)
