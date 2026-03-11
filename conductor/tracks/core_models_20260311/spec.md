# Specification: core_models_20260311

## Description
Implement the core `Individual` and `Family` data models in the Nest.js backend and create a basic individual profile view in the Next.js frontend to display individual information.

## Goals
- Define `Individual` and `Family` entities with standard GEDCOM fields (names, dates, relationships).
- Create API endpoints to retrieve individual data.
- Implement a basic individual profile page in the frontend that displays the individual's name, birth/death dates, and immediate family members.

## Technical Details
- **Backend:** Nest.js entities with TypeORM. Use the `individuals` and `families` modules.
- **Frontend:** Next.js dynamic routes (e.g., `/individuals/[id]`). Use TanStack Query for data fetching.
- **Data:** Support basic GEDCOM fields (NAME, BIRT, DEAT, FAMC, FAMS).
