# Implementation Plan: core_models_20260311

## Phase 1: Core Data Models [checkpoint: 938f916]
- [x] Task: Backend - Implement `Individual` entity [4c9be09]
    - [x] Create `Individual` entity with standard GEDCOM fields (id, names, sex, birth, death)
    - [x] Add basic tests for the `Individual` entity
- [x] Task: Backend - Implement `Family` entity [ae59a5a]
    - [x] Create `Family` entity with relationships (HUSB, WIFE, CHIL)
    - [x] Add basic tests for the `Family` entity
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Data Models' (Protocol in workflow.md) [938f916]

## Phase 2: API Endpoints [checkpoint: 458d9fb]
- [x] Task: Backend - Individual controller & service [eed942c]
    - [x] Implement `getIndividualById` and `getAllIndividuals` endpoints
    - [x] Add unit tests for the controller and service
- [x] Task: Conductor - User Manual Verification 'Phase 2: API Endpoints' (Protocol in workflow.md) [458d9fb]

## Phase 3: Frontend Individual View
- [ ] Task: Frontend - Individual Profile Page
    - [ ] Create a dynamic route `/individuals/[id]` to display individual details
    - [ ] Implement data fetching using TanStack Query
    - [ ] Design a simple layout for individual information (name, dates, family)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend Individual View' (Protocol in workflow.md)
