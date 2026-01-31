# Roadmap V2

## Milestone 1: Core Data & Dashboard (P0)
**Goal**: Make the app "live" with real data and functional dashboard.
- [ ] Backend: Implement `GET /overview` (Stats + Recent Activity)
- [ ] Frontend: Wire up Dashboard to `/overview`
- [ ] Frontend: Replace "Placeholder" in Dashboard with real "Recent Activity" list
- [ ] Frontend: Add "Quick Action" buttons to Dashboard

## Milestone 2: CRUD Completion (P0)
**Goal**: Allow full management of entities (Edit/Delete).
- [ ] **Grows**:
  - [ ] Add Delete Grow (with Confirm)
  - [ ] Add Edit Grow Modal
- **Plants**:
  - [ ] Add Delete Plant (with Confirm)
  - [ ] Add Edit Plant Modal
- **Tasks**:
  - [ ] Add Delete Task
  - [ ] Add Mark as Done/Open toggle in Calendar

## Milestone 3: Deep Dive Views (P0)
**Goal**: The core "Tracking" experience.
- [ ] **Plant Detail Page**:
  - [ ] Header (Phase, Status, Dates)
  - [ ] Tab 1: Timeline/Logs (List of logs)
  - [ ] Tab 2: Photos (Gallery + Upload)
  - [ ] Tab 3: Metrics (Charts + Add Metric)
- [ ] **Grow Detail Page**:
  - [ ] List Environments
  - [ ] Add/Edit Environment

## Milestone 4: Admin & Polish (P1)
**Goal**: Admin features and UX hardening.
- [ ] Backend: Ensure `adminController` allows user listing/role change
- [ ] Frontend: Build `/admin/users` page with table
- [ ] Frontend: Add Toasts (replacing `alert()`) for success/error
- [ ] Frontend: Add global Search/Filter inputs

## Milestone 5: Reports & Exports (P2)
**Goal**: Data portability.
- [ ] Frontend: Add CSV Export button to Reports (Client-side generation from data)
