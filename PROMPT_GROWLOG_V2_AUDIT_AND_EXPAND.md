# Coding-AI Auftrag (V2): Audit + Ausbau der GrowLog App (React :15000, API :15100, PostgreSQL)
Du übernimmst ein bereits begonnenes Projekt (“GrowLog”). Es existieren bereits UI-Seiten (Dashboard, Grows, Plants) inkl. “Add New Plant”-Modal (siehe aktuelle Screenshots: My Grows, Dashboard Placeholder, My Plants, Add New Plant).  
Deine Aufgabe: **prüfe systematisch**, was vom V1-Scope umgesetzt ist, **dokumentiere Lücken**, und **implementiere/erweitere** alle fehlenden bzw. unvollständigen Funktionen mit hoher UI/UX-Qualität.

Wichtig: Du sollst NICHT neu anfangen. Du sollst **im bestehenden Code** verbessern, erweitern, refactoren, und fehlende Module bauen.

---

## 0) HARTE Rahmenbedingungen (MUSS)
- Frontend Dev-Server: **http://localhost:15000**
- Backend API: **http://localhost:15100**
- Datenbank: **PostgreSQL**
- Auth: **Role-based** Rollen: **ADMIN**, **USER**
- Registrierung + Login + Logout funktionieren, RBAC ist enforced (Server-seitig!)
- USER sieht/ändert nur eigene Daten; ADMIN kann Users verwalten
- Keine “Platzhalter” mehr in Kernmodulen (Dashboard, Reports, Calendar): echte Daten + States
- Saubere README + Start-Skripte + .env.example bleiben korrekt

---

## 1) START: Projekt-Audit (MUSS, zuerst)
### 1.1 Lokales Setup prüfen
- `docker compose up -d` (DB)
- `npm install` im Root (oder Workspace-Tool wie pnpm, je nach Repo)
- `npm run dev` startet Web (:15000) + API (:15100) (oder dokumentierte Split-Skripte)
- Führe vorhandene Tests/Lints aus (falls vorhanden). Falls keine: richte minimal ESLint/Typecheck/format ein.

### 1.2 Feature-Checklist gegen V1
Erstelle im Repo eine Datei:
- `AUDIT.md` (oder `/docs/AUDIT.md`)
mit:
- ✅ umgesetzt / ⚠️ teilweise / ❌ fehlt
- Verweise auf Dateien/Routes/Endpoints
- Screenshots/Beobachtungen kurz zusammenfassen (z.B. Dashboard “Recent Activity (Placeholder)” ist ❌)

### 1.3 Gap-Plan als Issues
Erstelle im Repo:
- `/docs/ROADMAP_V2.md`
mit:
- Priorität P0/P1/P2
- Zeitplan in Milestones (z.B. “CRUD Completion”, “Detail Views”, “Calendar & Reminders”, “Reports”, “Admin polish”, “Hardening”)
- Für jede Lücke: konkrete ToDos

> Danach erst implementieren.

---

## 2) V2 Ausbau: UI/UX & Funktionalität (MUSS)
### 2.1 Global UX-Härtung
- Einheitliches Pattern für:
  - Loading / Empty / Error / Retry
  - Toasts/Notifications (z.B. success/error)
  - Confirm-Dialogs bei Delete/Destructive actions
  - Form Validation (React Hook Form + Zod oder bestehende Lösung konsistent)
- Accessibility:
  - Modals focus trap, ESC schließt, ARIA labels
- Tabellen/Listen:
  - Suche + Filter + Sortierung (mindestens in Plants/Logs/Tasks)
- Pagination (API + UI) für Logs/Photos/Tasks wenn Listen groß werden

### 2.2 Routing & Seitenstruktur (MUSS)
Erweitere vorhandene Seiten so, dass alle Kernflows wirklich nutzbar sind:

#### Dashboard (P0)
- Entferne Placeholder.
- Cards: Active Plants, Issues, Tasks Today: echte Daten (aus /overview oder aggregierten endpoints)
- “Recent Activity”: letzte Logs/Photos/Tasks (z.B. letzte 10 Ereignisse)
- Quick Actions: “New Plant”, “New Task”, “Add Log”, “Add Metric”
- “Overdue Tasks” + “Plants with Issues” Section

#### Grows (P0)
Aktuell: Karte + “New Grow” Button.
Erweitern:
- Grow CRUD vollständig:
  - New Grow Modal (create)
  - Grow Card -> Grow Detail Seite
  - Edit Grow Modal/Drawer (update)
  - Delete Grow (confirm)
- Grow Detail Seite:
  - Grow summary (name, indoor/outdoor, created, notes)
  - Environments: list + add/edit/delete
  - Plants in Grow: list + quick add plant
  - Grow-level Tasks: list + add task

#### Plants (P0)
Aktuell: Plants Liste + New Plant Modal.
Erweitern:
- Plants CRUD vollständig:
  - Plant Card klickbar -> Plant Detail
  - Edit Plant Modal/Drawer
  - Delete Plant (confirm)
  - Phase-Change Flow (Timeline/History)
  - Status ändern (Healthy/Issues/Sick etc.)
- Filterbar:
  - by Grow, Environment, Phase, Status, Textsuche
- Plant Detail (Tabs):
  1) Overview (Meta, Notes, Phase/Status, next tasks)
  2) Photo Timeline (Upload + caption + delete + preview modal)
  3) Logs (CRUD + Filter by type + search + attachments optional)
  4) Metrics & Charts (Add metric + charts + delete metric)
  5) Tasks (CRUD plant-scoped)

> In Plant Detail: nutze Modals (Create/Edit/Preview), nicht nur separate Seiten, aber beides ist ok wenn konsistent.

#### Calendar / Tasks (P0/P1)
- Kalenderansicht (Month ist Minimum) mit Tasks
- Task Liste mit Filter: status/date range/grow/plant
- Task CRUD:
  - Create Task modal (due date/time, optional repeat, notify)
  - Edit/complete/skip/delete
- Reminders:
  - Minimum: “Reminder Center” (fällige + bald fällige Tasks)
  - Optional: Browser Notifications (wenn permission)
  - Optional: Backend Notification table + cron/poller

#### Reports (P1)
- Entferne Placeholder/Leerseite falls vorhanden
- Implementiere:
  - Plants per phase (chart)
  - Tasks next 7 days (chart/list)
  - Issues count (kpi + list)
  - Vergleichstabelle Plants: last_log_at, next_task_due
  - Export CSV (Plants + optional Logs)

#### Users (Admin) (P0)
- Admin-only Route (server + client guard)
- Users list:
  - Pagination + Search
  - Role change USER <-> ADMIN
  - Optional: deactivate user

---

## 3) Backend V2: Vollständigkeit & Sicherheit (MUSS)
### 3.1 API Endpoints prüfen/ergänzen
Vergleiche mit V1-Spec (auth/grows/environments/plants/logs/photos/tasks/metrics/overview/admin).
- Alles Fehlende implementieren.
- Bestehende Endpoints harmonisieren (Naming, status codes, error format).
- Validation überall (Zod).
- RBAC & Ownership Checks in jedem Endpoint.

### 3.2 Auth
- Sichere Passwort-Hashes (argon2 bevorzugt, sonst bcrypt).
- JWT oder Cookies: bleib bei bestehender Entscheidung, aber:
  - refresh flow sauber
  - logout invalidiert refresh (oder server-side blacklist) – minimal sauber dokumentieren
- Rate limit auf /auth/*

### 3.3 File Uploads (Photos)
- Multer / Upload dir
- Restrict mime types, size limit
- Safe filenames (uuid)
- Serve static files sicher (kein directory traversal)
- Photo CRUD: list, upload, delete, optional download/view

### 3.4 Overview Endpoint
Implementiere oder vervollständige `/overview`:
- activePlantsCount
- issuesCount
- tasksTodayCount
- overdueTasksCount
- recentActivity[] (logs/photos/tasks mit type + timestamp + references)

---

## 4) Datenmodell: Migrations + Seeds (MUSS)
- Prisma migrations oder vorhandenes ORM migrations sauber.
- Seed:
  - ADMIN user: admin@example.com / Admin_1234!
  - Optional sample grow + environment + plant + tasks + logs + metrics
- Stelle sicher: USER-Daten strikt owner-scoped.

---

## 5) Code-Qualität & Refactor (MUSS)
- Entferne duplicated code in UI (Forms/Modals) -> shared components
- Konsistente API client layer:
  - `apiClient.ts` (auth headers/refresh handling)
- Type safety: shared types/schemas (z.B. /packages/shared)
- Error handling:
  - Backend: einheitliches error response schema
  - Frontend: zentraler error mapper + toast

---

## 6) Konkrete Deliverables (MUSS)
1) `AUDIT.md` (Status, was fehlt, wo)
2) `ROADMAP_V2.md` (Prioritäten + Milestones)
3) Implementierter Code für alle P0 Punkte:
   - Dashboard ohne placeholder
   - vollständige CRUD für Grows/Plants/Tasks/Logs/Metrics/Photos
   - Plant Detail mit Tabs + Modals
   - Calendar basic (Month) + task list
   - Admin Users management
4) Reports P1 (mindestens Plants-per-phase + CSV Export)
5) README aktualisiert:
   - Setup in 5 Minuten
   - Ports, env vars, seed credentials
   - Troubleshooting

---

## 7) Abnahmekriterien (MUSS)
- USER kann: Grow anlegen, Environment anlegen, Plant anlegen, Plant öffnen, Logs/Metrics/Photos/Tasks pflegen, Kalender sehen, Reports nutzen
- Dashboard zeigt echte Daten und Recent Activity
- ADMIN kann: Users sehen + Rollen ändern
- Keine “TODO Placeholder”-Texte in Kernseiten
- Ownership / RBAC server-seitig enforced (versuche mit fremder ID -> 403/404)
- Keine Console Errors im Browser in normalen Flows
- Lint/Typecheck laufen ohne Fehler

---

## 8) Vorgehensweise (MUSS)
- Arbeite in kleinen, nachvollziehbaren Commits (oder zumindest in logisch getrennten Änderungen)
- Nach jedem Milestone: kurz in ROADMAP_V2 abhaken
- Wenn du auf Inkonsistenzen stößt: repariere sie, dokumentiere kurz in AUDIT.md

Starte jetzt mit dem Audit, erstelle AUDIT.md + ROADMAP_V2.md und beginne dann mit P0 Implementierungen (Dashboard, CRUD Completion, Plant Detail, Tasks/Calendar, Admin Users).

