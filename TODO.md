# TODO: Frontend Mock Replacements & Implementation Tasks

This document provides a comprehensive, step-by-step checklist for replacing ALL mock data, stubs, placeholders, hardcoded dummy values, and temporary UI elements in the Growlog frontend application.

Each task is marked with `[ ]` for tracking progress and contains:
- Precise technical description of what currently exists
- What is missing or incomplete
- What must be implemented or replaced

Tasks are ordered to be executed sequentially by a coding AI without additional clarification.

---

## SECTION 1: MOCK DATA STRUCTURES (Priority: HIGH)

### Task 1.1: Replace Mock Notification System
**File:** `apps/web/src/context/NotificationContext.tsx` (Lines 30-47)

**Current State:**
```typescript
setNotifications([
    {
        id: '1',
        title: 'Welcome to GrowLog!',
        message: 'Start by adding your first plant or grow space.',
        type: 'success',
        read: false,
        createdAt: new Date()
    },
    {
        id: '2',
        title: 'System Update',
        message: 'New features added: Moon Phase & Electricity Calculator.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 3600000)
    }
]);
```

**What's Missing:** Real backend API endpoint to fetch user-specific notifications.

**Implementation Required:**
- [ ] Create API endpoint `GET /api/notifications` in backend
- [ ] Add `NotificationService` class in backend with methods: `create()`, `read()`, `delete()`, `list()`
- [ ] Replace hardcoded notification array with `api.get('/notifications')` call
- [ ] Add error handling for failed API requests
- [ ] Implement real-time notification polling or WebSocket connection
- [ ] Add notification creation endpoints for system events (plant phase change, task due, etc.)
- [ ] Store notifications in database with user_id foreign key
- [ ] Update NotificationContext to fetch on mount and periodically refresh

---

### Task 1.2: Remove Mock Plant Test Data
**File:** `apps/web/src/tests/logicIntegration.test.ts` (Lines 5-27)

**Current State:**
```typescript
const mockPlants = [
    { id: '1', name: 'Auto Blue', plant_type: 'AUTOFLOWER', phase: 'VEGETATIVE', 
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '2', name: 'Photo Kush', plant_type: 'PHOTOPERIOD', phase: 'FLOWERING',
      start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '3', name: 'Dead Plant', plant_type: 'PHOTOPERIOD', phase: 'FINISHED',
      start_date: new Date().toISOString() }
];
```

**What's Missing:** Test data factory or proper test fixtures.

**Implementation Required:**
- [ ] Create `__fixtures__/plants.ts` file with factory functions for test data
- [ ] Implement `createMockPlant(overrides)` function that returns realistic plant objects
- [ ] Replace inline mockPlants array with factory function calls
- [ ] Add edge case fixtures: `createPlantWithNoMetrics()`, `createOverdueTask()`, etc.
- [ ] Create `createMockGrow()`, `createMockMetric()`, `createMockLog()` factories
- [ ] Centralize all test data generation for consistency across test files
- [ ] Document fixture usage in testing documentation

---

## SECTION 2: HARDCODED DASHBOARD VALUES (Priority: CRITICAL)

### Task 2.1: Replace Hardcoded Temperature Display
**File:** `apps/web/src/pages/Grows.tsx` (Line 110)

**Current State:**
```typescript
<span className="text-3xl font-bold text-slate-900">24°C</span>
```

**What's Missing:** Real environment sensor data aggregation.

**Implementation Required:**
- [ ] Create API endpoint `GET /api/grows/:id/environment/latest` returning latest sensor readings
- [ ] Add `Environment` table/model in database with fields: `grow_id`, `temperature_c`, `humidity_pct`, `co2_ppm`, `recorded_at`
- [ ] Replace hardcoded `24°C` with `{environmentData?.temperature_c ?? '--'}°C`
- [ ] Add state variable `const [environmentData, setEnvironmentData] = useState(null)`
- [ ] Fetch environment data in `useEffect` when grow ID changes
- [ ] Add temperature trend indicator (up/down arrow) based on previous reading
- [ ] Handle null/undefined temperature gracefully with `--` placeholder
- [ ] Add API endpoint to accept sensor data: `POST /api/grows/:id/environment`
- [ ] Create environment recording form or integrate with IoT sensors

---

### Task 2.2: Replace Hardcoded Humidity Display
**File:** `apps/web/src/pages/Grows.tsx` (Line 121)

**Current State:**
```typescript
<span className="text-3xl font-bold text-slate-900">55%</span>
```

**What's Missing:** Real humidity sensor readings from environment data.

**Implementation Required:**
- [ ] Use same environment data from Task 2.1 API endpoint
- [ ] Replace hardcoded `55%` with `{environmentData?.humidity_pct ?? '--'}%`
- [ ] Add humidity trend indicator (increase/decrease from last reading)
- [ ] Implement color coding: green (40-70%), yellow (30-40% or 70-80%), red (<30% or >80%)
- [ ] Add tooltip showing ideal humidity range for current growth phase
- [ ] Display VPD (Vapor Pressure Deficit) calculation using temp + humidity
- [ ] Link to VPD calculator tool when metric is clicked

---

### Task 2.3: Replace Hardcoded "Next Crop" Days Countdown
**File:** `apps/web/src/pages/Grows.tsx` (Line 132)

**Current State:**
```typescript
<span className="text-3xl font-bold text-slate-900">12 Days</span>
<span className="text-xs text-slate-400">{t('next_crop')}</span>
```

**What's Missing:** Real calculation based on flowering start date and strain harvest window.

**Implementation Required:**
- [ ] Calculate from grow's plants: find average `flowering_days` from strain data
- [ ] Get earliest `phase_started_at` date where `phase === 'FLOWERING'`
- [ ] Calculate expected harvest date: `floweringStartDate + averageFloweringDays`
- [ ] Compute days until harvest: `Math.ceil((expectedHarvestDate - today) / msPerDay)`
- [ ] Replace hardcoded `12 Days` with calculated value
- [ ] Handle edge cases: no flowering plants (show `--`), multiple harvest dates (show range)
- [ ] Add "Overdue" indicator if harvest date has passed
- [ ] Make value clickable to navigate to harvest estimator tool
- [ ] Store strain-specific flowering duration in database `Strain` table

---

### Task 2.4: Replace Hardcoded Growth Progress Indicator
**File:** `apps/web/src/pages/Grows.tsx` (Line 100)

**Current State:**
```typescript
<span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">+4 {t('week')}</span>
```

**What's Missing:** Actual week count since grow started.

**Implementation Required:**
- [ ] Calculate from grow's `created_at` or `start_date` field
- [ ] Compute weeks elapsed: `Math.floor((Date.now() - growStartDate) / (7 * 24 * 60 * 60 * 1000))`
- [ ] Replace `+4` with calculated weeks value
- [ ] Change color based on age: green (<8 weeks), yellow (8-16 weeks), orange (>16 weeks)
- [ ] Add tooltip showing exact start date
- [ ] Handle grows with no start date (use created_at as fallback)
- [ ] Pluralize "week" vs "weeks" based on count

---

### Task 2.5: Replace Hardcoded Phase Weight Constants
**File:** `apps/web/src/pages/Grows.tsx` (Lines 147-154)

**Current State:**
```typescript
const phaseWeights: Record<string, number> = {
    'GERMINATION': 10,
    'VEGETATIVE': 40,
    'FLOWERING': 70,
    'DRYING': 90,
    'CURED': 95,
    'FINISHED': 100
};
```

**What's Missing:** Configurable phase durations based on plant type and strain.

**Implementation Required:**
- [ ] Create `PhaseTimeline` configuration table in database
- [ ] Add fields: `phase`, `plant_type`, `duration_days`, `weight_percentage`
- [ ] Store default timelines: AUTOFLOWER vs PHOTOPERIOD have different durations
- [ ] Fetch timeline configuration from API: `GET /api/settings/phase-timelines`
- [ ] Calculate actual progress using: `(daysInCurrentPhase / expectedPhaseDuration) * phaseWeight`
- [ ] Allow users to customize phase durations in Settings page
- [ ] Replace static phaseWeights with dynamic calculation
- [ ] Handle phase transitions where start date is known vs unknown

---

### Task 2.6: Replace Hardcoded Phase Threshold Display
**File:** `apps/web/src/pages/Grows.tsx` (Lines 215-226)

**Current State:**
```typescript
{progress < 20 ? t('germination') : progress < 60 ? t('veg') : t('flower')}
// Thresholds: 20%, 60%, etc.
```

**What's Missing:** Dynamic thresholds based on actual phase timeline configuration.

**Implementation Required:**
- [ ] Calculate thresholds from phase weights (Task 2.5) instead of hardcoding
- [ ] Use cumulative progress: germination ends at phaseWeights.GERMINATION
- [ ] Vegetative ends at phaseWeights.GERMINATION + phaseWeights.VEGETATIVE
- [ ] Replace hardcoded `< 20`, `< 60` with calculated boundaries
- [ ] Update stage label highlight logic to use dynamic thresholds
- [ ] Ensure thresholds work for both autoflower and photoperiod timelines
- [ ] Add visual indicator showing which stage is currently active

---

## SECTION 3: FALLBACK & EMPTY STATE DATA (Priority: HIGH)

### Task 3.1: Replace Chart Fallback "Ghost" Data
**File:** `apps/web/src/components/dashboard/PlantGrowthChart.tsx` (Lines 27-34)

**Current State:**
```typescript
const displayData = hasData ? data : [
    { label: 'Week 1', height: 20 },
    { label: 'Week 2', height: 35 },
    { label: 'Week 3', height: 50 },
    { label: 'Week 4', height: 75 },
    { label: 'Week 5', height: 90 },
];
```

**What's Missing:** Informative empty state UI instead of fake growth data.

**Implementation Required:**
- [ ] Create `<EmptyChartState>` component with icon and message
- [ ] Replace fallback array with conditional rendering: `{hasData ? <Chart data={data} /> : <EmptyChartState />}`
- [ ] EmptyChartState should display:
  - Icon (Chart or TrendingUp from lucide-react)
  - Message: "No growth data recorded yet"
  - Sub-message: "Start tracking plant metrics to see growth trends"
  - Button: "Record Metrics" linking to RecordMetricModal
- [ ] Style empty state with tailwind: center aligned, muted colors
- [ ] Add empty state to all charts: PlantGrowthChart, status charts, phase distribution
- [ ] Remove opacity styling on fake data (lines 45-46)

---

### Task 3.2: Replace Dashboard Skeleton with Data-Driven Loading
**File:** `apps/web/src/pages/Dashboard.tsx` (Lines 11-28)

**Current State:**
```typescript
const DashboardSkeleton = () => (
    <div className="min-h-full animate-pulse">
        {/* Hardcoded skeleton boxes */}
    </div>
);
```

**What's Missing:** More sophisticated loading state management.

**Implementation Required:**
- [ ] Replace single `loading` boolean with object: `{ stats: false, charts: false, plants: false }`
- [ ] Show skeleton only for sections that are loading
- [ ] Allow partial data to render while other sections load
- [ ] Add error boundary component for failed data fetches
- [ ] Create reusable `<SkeletonCard>`, `<SkeletonChart>` components
- [ ] Add retry button in error state
- [ ] Implement timeout: show error message if data takes >10 seconds
- [ ] Use React.Suspense for chart components if possible

---

### Task 3.3: Replace Empty Dashboard Stats Initialization
**File:** `apps/web/src/pages/Dashboard.tsx` (Lines 44-45)

**Current State:**
```typescript
const [stats, setStats] = useState({ total: 0, active: 0, healthy: 0, waste: 0 });
const [chartData, setChartData] = useState<any[]>([]);
```

**What's Missing:** Null state to differentiate "loading" from "no data".

**Implementation Required:**
- [ ] Change initial state to `null`: `const [stats, setStats] = useState<Stats | null>(null)`
- [ ] Update rendering logic to check for null: `{stats === null ? <Loading /> : stats.total === 0 ? <EmptyState /> : <DataDisplay />}`
- [ ] Type the stats object properly: `interface Stats { total: number; active: number; healthy: number; waste: number; }`
- [ ] Same for chartData: `useState<ChartDataPoint[] | null>(null)`
- [ ] Update all stats display components to handle null gracefully
- [ ] Show different messages: "Loading stats..." vs "No plants tracked yet"
- [ ] Add explicit error state: `const [error, setError] = useState<string | null>(null)`

---

### Task 3.4: Replace Fallback Error Handling with Proper States
**File:** `apps/web/src/pages/Dashboard.tsx` (Lines 60-66)

**Current State:**
```typescript
const [overviewRes, plantsRes] = await Promise.all([
    api.get('/overview').catch(() => ({ data: { stats: null, chartData: [] } })),
    api.get('/plants').catch(() => ({ data: [] }))
]);
```

**What's Missing:** Error messages shown to user when API fails.

**Implementation Required:**
- [ ] Remove silent `.catch(() => ({ data: [] }))` handlers
- [ ] Add proper try/catch with error state updates
- [ ] Set error message: `setError('Failed to load dashboard data. Please try again.')`
- [ ] Display error UI with retry button
- [ ] Log errors to error tracking service (Sentry, LogRocket, etc.)
- [ ] Differentiate between network errors and API errors
- [ ] Show specific error messages: "Network offline" vs "Server error"
- [ ] Implement exponential backoff retry logic
- [ ] Add "Refresh" button to manually retry

---

## SECTION 4: FORM DEFAULT VALUES (Priority: MEDIUM)

### Task 4.1: Make Plant Type Default Configurable
**File:** `apps/web/src/pages/Plants.tsx` (Lines 43-48)

**Current State:**
```typescript
defaultValues: {
    plant_type: 'PHOTOPERIOD', // Most common type for serious growers
    status: 'HEALTHY',
    phase: 'GERMINATION',
    start_date: new Date().toISOString().split('T')[0]
}
```

**What's Missing:** User preference system for custom defaults.

**Implementation Required:**
- [ ] Create `UserPreferences` table with fields: `user_id`, `default_plant_type`, `default_phase`, etc.
- [ ] Add settings page section: "Default Values for New Plants"
- [ ] Fetch user preferences: `GET /api/user/preferences`
- [ ] Replace hardcoded defaults with: `plant_type: preferences?.default_plant_type || 'PHOTOPERIOD'`
- [ ] Add form in Settings to update preferences
- [ ] Store preferences in SettingsContext for app-wide access
- [ ] Persist to localStorage as backup if API fails
- [ ] Apply same pattern to all form defaults (grows, tasks, logs)

---

### Task 4.2: Make Grow Location Type Default Configurable
**File:** `apps/web/src/pages/Grows.tsx` (Lines 31-33)

**Current State:**
```typescript
defaultValues: {
    location_type: 'INDOOR' // Most home growers operate indoors
}
```

**What's Missing:** User preference for default grow location type.

**Implementation Required:**
- [ ] Add `default_location_type` field to UserPreferences table
- [ ] Fetch from preferences: `location_type: preferences?.default_location_type || 'INDOOR'`
- [ ] Add dropdown in Settings: "Default Grow Location" with options: INDOOR, OUTDOOR, GREENHOUSE
- [ ] Update API endpoint `PUT /api/user/preferences` to accept location_type
- [ ] Save preference when user creates grow with different type (learn from behavior)
- [ ] Track most-used location type and suggest as default

---

### Task 4.3: Improve Task Date/Time Default Value
**File:** `apps/web/src/pages/Tasks.tsx` (Line 84)

**Current State:**
```typescript
defaultValue={new Date().toISOString().slice(0, 16)}
```

**What's Missing:** Timezone handling and user-friendly default time.

**Implementation Required:**
- [ ] Replace with proper timezone-aware date: use `date-fns-tz` library
- [ ] Get user's timezone from `Intl.DateTimeFormat().resolvedOptions().timeZone`
- [ ] Store user timezone in preferences
- [ ] Set default time to "next convenient time" (e.g., 9:00 AM if before 9 AM, otherwise tomorrow 9 AM)
- [ ] Add "Schedule for tomorrow" quick button
- [ ] Remember last task time and suggest similar time for new tasks
- [ ] Add timezone display: "Due: Jan 15, 2024 9:00 AM EST"

---

### Task 4.4: Make PlantLogs Type Default Smarter
**File:** `apps/web/src/components/plant/PlantLogs.tsx` (Lines 31-37)

**Current State:**
```typescript
defaultValues: {
    type: 'NOTE',
    title: '',
    content: '',
    logged_at: new Date().toISOString().split('T')[0]
}
```

**What's Missing:** Context-aware default log type based on plant phase.

**Implementation Required:**
- [ ] Detect current plant phase from props/context
- [ ] Set default type based on phase:
  - GERMINATION → 'NOTE' (tracking emergence)
  - VEGETATIVE → 'TRAINING' (topping, LST, etc.)
  - FLOWERING → 'OBSERVATION' (trichome check, bud development)
  - DRYING → 'NOTE' (humidity checks)
- [ ] Add "Quick Log" templates: "Watered", "Fed", "Topped", "Defoliated"
- [ ] Pre-fill common log patterns with template selection
- [ ] Track user's most common log types and suggest

---

### Task 4.5: Improve PlantTasks Default Values with Smart Scheduling
**File:** `apps/web/src/components/plant/PlantTasks.tsx` (Lines 23-30)

**Current State:**
```typescript
defaultValues: {
    title: '',
    due_at: new Date().toISOString().split('T')[0],
    repeat_rule: '',
    notify: false
}
```

**What's Missing:** Smart defaults based on task type and plant needs.

**Implementation Required:**
- [ ] Add task type detection: if title contains "water" → set repeat to every 2-3 days
- [ ] If title contains "feed" → set repeat to weekly
- [ ] If title contains "check" → enable notifications by default
- [ ] Suggest due dates based on plant metrics:
  - Last watering + 2-3 days → next watering due
  - Days since feeding + 7 days → next feeding due
- [ ] Auto-enable notifications for important tasks (pest check, harvest window)
- [ ] Add recurring task templates: "Water Schedule", "Feeding Schedule", "Daily Check"
- [ ] Store task patterns per user and learn from completed tasks

---

### Task 4.6: Make PlantMetrics pH and EC Defaults Dynamic
**File:** `apps/web/src/components/plant/PlantMetrics.tsx` (Lines 26-35)
**Also:** `apps/web/src/components/plant/RecordMetricModal.tsx` (Lines 20-30)

**Current State:**
```typescript
defaultValues: {
    height_cm: 0,
    ph: 6.0,          // Standard hydro/soil pH
    ec: 1.0,          // Mild nutrient solution
    temperature_c: 24,
    humidity_pct: 60,
    light_ppfd: 0,
    notes: '',
    recorded_at: new Date().toISOString().split('T')[0]
}
```

**What's Missing:** Last recorded values as better defaults than fixed numbers.

**Implementation Required:**
- [ ] Fetch last recorded metric for plant: `GET /api/plants/:id/metrics/latest`
- [ ] Use last values as defaults: `ph: lastMetric?.ph || 6.0`
- [ ] Pre-increment height based on typical growth: `height_cm: lastMetric?.height_cm ? lastMetric.height_cm + 1 : 0`
- [ ] Keep temp/humidity if recorded within last 24 hours
- [ ] Add "Copy Last Values" button to quickly duplicate previous reading
- [ ] Show comparison: "Previous: 45cm → Current: __ cm"
- [ ] Add visual indicators if new value is significantly different (>20% change)
- [ ] Validate ranges: pH 4-8, EC 0-3, temp 15-35°C, humidity 20-90%
- [ ] Apply same pattern to RecordMetricModal.tsx

---

## SECTION 5: PLACEHOLDER TEXT & LOCALIZATION (Priority: MEDIUM)

### Task 5.1: Centralize All Placeholder Text in Translations
**Files:** Multiple components using hardcoded placeholders

**Current State:** Some placeholders in translations.ts, others hardcoded in components.

**What's Missing:** Complete i18n coverage of all placeholder text.

**Implementation Required:**
- [ ] Audit all `.tsx` files for `placeholder="..."` attributes
- [ ] Extract hardcoded placeholders to `translations.ts`:
  - `Grows.tsx` line 350: `placeholder="Tent size, equipment details..."` → `grow_description_placeholder`
  - `GrowDetail.tsx` line 291: `"No environment configured."` → `no_environment_configured`
  - `Tasks.tsx`: `placeholder="e.g. Water Plants"` → `task_title_placeholder`
  - `FeedbackFab.tsx`: `placeholder="What's on your mind?"` → `feedback_subject_placeholder`
  - All other non-translated placeholders
- [ ] Replace with `placeholder={t('key_name')}`
- [ ] Add German translations for all new keys
- [ ] Test UI in both English and German languages
- [ ] Ensure placeholders are culturally appropriate and helpful
- [ ] Add JSDoc comments explaining context of each placeholder key

---

### Task 5.2: Replace Fallback Email Placeholder in Header
**File:** `apps/web/src/components/layout/Header.tsx` (Line 19)

**Current State:**
```typescript
<p className="text-xs text-slate-500 truncate">{user?.email || 'grower@example.com'}</p>
```

**What's Missing:** Proper loading state or user initialization handling.

**Implementation Required:**
- [ ] Check AuthContext loading state before showing user data
- [ ] Show skeleton/shimmer while user data loads: `{loading ? <Skeleton width="120px" /> : user?.email}`
- [ ] If no user (logged out state), show "Sign In" instead of example email
- [ ] Add user avatar/initials next to email
- [ ] Fetch user profile data separately from auth: `GET /api/user/profile`
- [ ] Cache user data in context to avoid repeated fetches
- [ ] Update profile data when user changes settings

---

## SECTION 6: PLANT TEMPLATES & STRAIN DATA (Priority: LOW)

### Task 6.1: Replace Hardcoded Plant Templates with Database
**File:** `apps/web/src/pages/Plants.tsx` (Lines 25-31)

**Current State:**
```typescript
const PLANT_TEMPLATES = [
    { name: 'Northern Lights Auto', strain: 'Northern Lights', type: 'AUTOFLOWER' },
    { name: 'White Widow Photo', strain: 'White Widow', type: 'PHOTOPERIOD' },
    { name: 'Blue Dream Photo', strain: 'Blue Dream', type: 'PHOTOPERIOD' },
    { name: 'Gorilla Glue Auto', strain: 'Gorilla Glue #4', type: 'AUTOFLOWER' }
];
```

**What's Missing:** Dynamic strain database with full strain information.

**Implementation Required:**
- [ ] Create `Strains` table with fields: `id`, `name`, `type`, `flowering_days`, `description`, `effects`, `thc_pct`, `cbd_pct`
- [ ] Seed database with popular strains (100+ entries)
- [ ] Create API endpoint: `GET /api/strains?search=<query>`
- [ ] Replace PLANT_TEMPLATES with API fetch: `const [strains, setStrains] = useState([])`
- [ ] Add autocomplete search for strain selection
- [ ] Display strain info: "Northern Lights - Indica - 8 weeks flowering"
- [ ] Allow users to add custom strains: `POST /api/strains`
- [ ] Link to strain detail modal showing full info (THC%, effects, grow tips)
- [ ] Integrate with external strain API (Leafly, Seedfinder) if available
- [ ] Cache popular strains in localStorage

---

## SECTION 7: CALCULATOR DEFAULT VALUES (Priority: LOW)

### Task 7.1: Make Nutrient Calculator Defaults User-Configurable
**File:** `apps/web/src/pages/Tools.tsx` (Lines 8-10)

**Current State:**
```typescript
const [waterAmount, setWaterAmount] = useState(1);
const [baseNutrient, setBaseNutrient] = useState(2);
const [additive, setAdditive] = useState(1);
```

**What's Missing:** Saved calculator presets and last-used values.

**Implementation Required:**
- [ ] Add localStorage persistence: `localStorage.setItem('calc_nutrient_defaults', JSON.stringify({water, base, additive}))`
- [ ] Load on mount: `const defaults = JSON.parse(localStorage.getItem('calc_nutrient_defaults') || '{}')`
- [ ] Add "Save as Default" button below calculator
- [ ] Create named presets: "Seedling Mix", "Veg Mix", "Flower Mix"
- [ ] Store presets in user preferences API
- [ ] Add preset selector dropdown above calculator inputs
- [ ] Show units clearly: "Water (Liters)", "Base Nutrient (ml/L)"
- [ ] Add tooltips explaining each input field

---

### Task 7.2: Improve Harvest Estimator with Strain-Specific Data
**File:** `apps/web/src/pages/Tools.tsx` (Lines 72-73)

**Current State:**
```typescript
const [flowerStartDate, setFlowerStartDate] = useState(new Date().toISOString().split('T')[0]);
const [weeks, setWeeks] = useState(9);
```

**What's Missing:** Integration with actual plant data and strain flowering times.

**Implementation Required:**
- [ ] Add plant selector: allow choosing plant from active plants
- [ ] Auto-populate flowering start date from plant's `phase_started_at` when phase = 'FLOWERING'
- [ ] Fetch strain data and use `flowering_days` field to set default weeks
- [ ] Calculate range: "8-10 weeks" for strains with variable finish times
- [ ] Show multiple harvest dates if grow has plants with different flowering times
- [ ] Add "early", "on-time", "late" harvest buttons (-7 days, exact, +7 days)
- [ ] Display trichome check reminders 2 weeks before estimated harvest
- [ ] Add calendar integration to export harvest date

---

### Task 7.3: Make VPD Calculator Units Configurable (Celsius/Fahrenheit)
**File:** `apps/web/src/pages/Tools.tsx` (Lines 123-125)

**Current State:**
```typescript
const [temp, setTemp] = useState(24);
const [rh, setRh] = useState(60);
const [offset, setOffset] = useState(-2);
```

**What's Missing:** Temperature unit selection and conversion.

**Implementation Required:**
- [ ] Add unit toggle button: "°C" / "°F"
- [ ] Store preference: `localStorage.setItem('temp_unit', 'F')`
- [ ] Convert display: if Fahrenheit, show `(temp * 9/5) + 32`
- [ ] Convert input back to Celsius for calculation
- [ ] Update all temperature displays app-wide to use same unit preference
- [ ] Add unit setting to Settings page: "Temperature Display: Celsius / Fahrenheit"
- [ ] Show VPD ranges colored: green (0.8-1.2 kPa), yellow (0.4-0.8 or 1.2-1.6), red (outside)
- [ ] Add phase-specific VPD recommendations: "Ideal VPD for Flowering: 1.0-1.5 kPa"

---

### Task 7.4: Enhance DLI Calculator with Phase-Specific Recommendations
**File:** `apps/web/src/pages/Tools.tsx` (Lines 177-178)

**Current State:**
```typescript
const [ppfd, setPpfd] = useState(800);
const [hours, setHours] = useState(12);
```

**What's Missing:** Context-aware DLI targets for different growth phases.

**Implementation Required:**
- [ ] Add plant phase selector: "Seedling", "Veg", "Flower"
- [ ] Display target DLI ranges:
  - Seedling: 15-25 DLI
  - Vegetative: 25-40 DLI
  - Flowering: 40-60 DLI
- [ ] Color-code result: green if in range, yellow if low, red if excessive
- [ ] Add light schedule presets: 18/6, 20/4, 12/12, 24/0
- [ ] Show recommended PPFD to hit target DLI
- [ ] Add inverse calculator: "I want DLI of 35, how many hours at 600 PPFD?"
- [ ] Link to plant detail if calculator opened from plant context
- [ ] Save last calculation to history

---

### Task 7.5: Add Safety Warnings to CO2 Calculator
**File:** `apps/web/src/pages/Tools.tsx` (Lines 211-214)

**Current State:**
```typescript
const [width, setWidth] = useState(4);
const [length, setLength] = useState(4);
const [height, setHeight] = useState(7);
const [targetPPM, setTargetPPM] = useState(1200);
```

**What's Missing:** Safety warnings and unit clarity.

**Implementation Required:**
- [ ] Add unit selector: "Feet" / "Meters"
- [ ] Show prominent warning: "⚠️ CO2 levels above 5000 PPM are dangerous to humans"
- [ ] Color-code PPM input: green (<1500), yellow (1500-2000), red (>2000)
- [ ] Add calculation breakdown: "Room volume: X cubic feet, CO2 needed: Y lbs/day"
- [ ] Include ventilation rate in calculation (air exchanges per hour)
- [ ] Add tank size calculator: "How long will a 20lb CO2 tank last?"
- [ ] Link to CO2 safety guidelines documentation
- [ ] Recommend CO2 monitoring equipment

---

### Task 7.6: Enhance Electricity Calculator with Regional Rates
**File:** `apps/web/src/pages/Tools.tsx` (Lines 254-256)

**Current State:**
```typescript
const [watts, setWatts] = useState(600);
const [hours, setHours] = useState(12);
const [cost, setCost] = useState(0.12);
```

**What's Missing:** Regional electricity rate database and cost projections.

**Implementation Required:**
- [ ] Add location selector: fetch user location from IP or user settings
- [ ] Create electricity rates database by region/country
- [ ] Auto-populate `cost` based on location: `setCost(regionRates[userRegion] || 0.12)`
- [ ] Add currency selector: USD, EUR, GBP, CAD, etc.
- [ ] Display projections: "Daily: $X, Weekly: $Y, Monthly: $Z, Annual: $W"
- [ ] Add equipment presets: "LED 480W", "HPS 1000W", "Fans 50W", etc.
- [ ] Allow adding multiple devices: lights + fans + AC
- [ ] Show cost comparison: "LED vs HPS savings: $X per year"
- [ ] Export cost report as PDF or CSV

---

## SECTION 8: MOON PHASE & ASTRONOMICAL DATA (Priority: LOW)

### Task 8.1: Replace Hardcoded Moon Phase Algorithm with API
**File:** `apps/web/src/pages/Tasks.tsx` (Lines 79-99)

**Current State:**
```typescript
const getMoonData = (date: Date) => {
    const synodic = 29.53058867;
    const knownNewMoon = new Date('2000-01-06T18:14:00').getTime();
    // ... complex calculation ...
    // Hardcoded recommendations per phase
};
```

**What's Missing:** External moon phase API and configurable recommendations.

**Implementation Required:**
- [ ] Integrate moon phase API: https://api.astronomyapi.com or similar
- [ ] Replace calculation with API call: `fetch(\`https://api.moon.com/v1/phase?date=${date}\`)`
- [ ] Cache results in localStorage to reduce API calls (moon phase only changes daily)
- [ ] Move gardening recommendations to database: `MoonPhaseRecommendations` table
- [ ] Allow users to customize recommendations or disable moon phase feature
- [ ] Add setting: "Enable moon phase gardening tips"
- [ ] Show moon illumination percentage and moonrise/moonset times
- [ ] Add moon phase emoji/icon visual representation
- [ ] Link to educational content about lunar gardening

---

## SECTION 9: LOADING STATES & TEMPORARY UI (Priority: MEDIUM)

### Task 9.1: Replace Basic Loading Text with Spinner Component
**File:** `apps/web/src/App.tsx` (Line 18)

**Current State:**
```typescript
if (loading) return <div>Loading...</div>; // Could be a nicer spinner
```

**What's Missing:** Professional loading indicator.

**Implementation Required:**
- [ ] Create `<LoadingSpinner>` component in `components/ui/LoadingSpinner.tsx`
- [ ] Use SVG spinner animation or lucide-react Loader2 icon
- [ ] Add spinning animation: `className="animate-spin"`
- [ ] Center on screen with proper styling
- [ ] Add optional loading message prop: `<LoadingSpinner message="Initializing..." />`
- [ ] Use throughout app replacing all `<div>Loading...</div>` instances
- [ ] Add timeout: show "Taking longer than expected..." after 5 seconds
- [ ] Show progress bar for long operations if possible

---

### Task 9.2: Implement Coming Soon Page Component
**File:** `apps/web/src/App.tsx` (Line 43)

**Current State:**
```typescript
<Route path="admin/users" element={<div>Coming Soon: Users</div>} />
```

**What's Missing:** Professional coming soon page with branding.

**Implementation Required:**
- [ ] Create `<ComingSoon>` component accepting `featureName` prop
- [ ] Design: centered layout with icon, heading, description
- [ ] Show: "🚧 Users Management - Coming Soon"
- [ ] Add description: "This feature is under development"
- [ ] Include email signup for launch notification
- [ ] Add "Request Access" button that creates support ticket
- [ ] Link back to main features: "Explore other features →"
- [ ] Track page views to prioritize feature development
- [ ] Replace all "Coming Soon" placeholders with component

---

### Task 9.3: Standardize Loading States Across Components
**Files:** Multiple files with `<div>{t('loading')}</div>` patterns

**Current State:** Inconsistent loading indicators across components.

**Implementation Required:**
- [ ] Create `useLoading` hook for consistent loading state management
- [ ] Identify all components with loading states:
  - PlantMetrics.tsx (line 73)
  - PlantPhotos.tsx
  - PlantDetail.tsx (line 72)
  - GrowDetail.tsx (line 76)
- [ ] Replace with `<LoadingSpinner />` or skeleton screens
- [ ] Add loading state to context providers: AuthContext, SettingsContext
- [ ] Implement progressive loading: show layout first, then data
- [ ] Use React.Suspense boundaries where appropriate
- [ ] Add error boundaries for graceful error handling
- [ ] Create `<ErrorFallback>` component for error states

---

## SECTION 10: COMMENT PATTERNS & INCOMPLETE FEATURES (Priority: LOW)

### Task 10.1: Implement Time Picker for Plant Tasks
**File:** `apps/web/src/components/plant/PlantTasks.tsx` (Line 27)

**Current State:**
```typescript
// time: '09:00', // could add time later
```

**What's Missing:** Time selection for task due dates.

**Implementation Required:**
- [ ] Uncomment time field in form schema
- [ ] Add time input field to task form: `<input type="time" />`
- [ ] Combine date and time into single datetime: `new Date(\`${date}T${time}\`)`
- [ ] Update database column `due_at` to TIMESTAMP type (if not already)
- [ ] Display time in task list: "Due: Jan 15, 2024 at 9:00 AM"
- [ ] Add time to notifications: remind at specific time
- [ ] Handle timezone conversions properly
- [ ] Add quick time presets: "Morning (9AM)", "Afternoon (2PM)", "Evening (6PM)"

---

### Task 10.2: Replace Placeholder Icon in RecordMetricModal
**File:** `apps/web/src/components/plant/RecordMetricModal.tsx` (Line 126)

**Current State:**
```typescript
icon={Activity} // Sun would be better but need to import
```

**What's Missing:** Proper icon import and usage.

**Implementation Required:**
- [ ] Import Sun icon from lucide-react: `import { Sun } from 'lucide-react'`
- [ ] Replace Activity with Sun: `icon={Sun}`
- [ ] Review all modal icons for semantic correctness
- [ ] Use Temperature icon for temp metrics
- [ ] Use Droplet icon for humidity/water metrics
- [ ] Use Ruler icon for height measurements
- [ ] Standardize icon usage across all metric types
- [ ] Add icon legend/tooltip explaining what each icon represents

---

### Task 10.3: Add Translation Key for Environment Message
**File:** `apps/web/src/pages/GrowDetail.tsx` (Line 291)

**Current State:**
```typescript
<div className="mb-6 text-sm text-slate-400 italic">No environment configured.</div>
```

**What's Missing:** Localization for error message.

**Implementation Required:**
- [ ] Add translation key: `no_environment_configured: 'No environment configured.'`
- [ ] Add German translation: `'Keine Umgebung konfiguriert.'`
- [ ] Replace hardcoded text with `{t('no_environment_configured')}`
- [ ] Add call-to-action button: "Configure Environment"
- [ ] Make entire empty state more informative:
  - Icon (Cloud or Thermometer)
  - Message
  - Button to open environment config form
- [ ] Apply pattern to all hardcoded empty state messages

---

## SECTION 11: TESTING & VALIDATION (Priority: CRITICAL)

### Task 11.1: Create Test Fixtures Factory
**Implementation Required:**
- [ ] Create `/apps/web/src/__fixtures__/index.ts`
- [ ] Implement factories:
  - `createPlant(overrides?)`: returns mock plant object
  - `createGrow(overrides?)`: returns mock grow object
  - `createMetric(overrides?)`: returns mock metric object
  - `createTask(overrides?)`: returns mock task object
  - `createLog(overrides?)`: returns mock log object
  - `createUser(overrides?)`: returns mock user object
- [ ] Use faker.js or similar for realistic random data
- [ ] Export all factories as named exports
- [ ] Add TypeScript types for all fixtures
- [ ] Create arrays of fixtures: `plants: Plant[] = [createPlant(), createPlant(), ...]`
- [ ] Use in all test files instead of inline mock data

---

### Task 11.2: Add Integration Tests for Mock Data Replacement
**Implementation Required:**
- [ ] Create test file: `/apps/web/src/tests/mockDataReplacement.test.ts`
- [ ] Test notifications fetch from API instead of hardcoded array
- [ ] Test dashboard stats are fetched, not initialized to zeros
- [ ] Test environment data is displayed from API, not hardcoded "24°C"
- [ ] Test plant templates loaded from database, not const array
- [ ] Mock API responses using MSW (Mock Service Worker)
- [ ] Verify loading states → data states → error states transitions
- [ ] Test empty states display correct messages
- [ ] Ensure tests run in CI/CD pipeline

---

### Task 11.3: Add Visual Regression Tests for Empty States
**Implementation Required:**
- [ ] Set up visual regression testing (Percy, Chromatic, or Playwright screenshots)
- [ ] Capture baseline screenshots of:
  - Empty dashboard (no plants)
  - Empty growth chart
  - Empty metrics list
  - Empty logs view
  - All skeleton loading states
- [ ] Create tests that detect visual changes in empty states
- [ ] Run visual tests on every PR
- [ ] Review and approve visual changes before merging

---

## SECTION 12: DOCUMENTATION (Priority: MEDIUM)

### Task 12.1: Document All Replaced Mocks
**Implementation Required:**
- [ ] Create `/docs/MOCK_REMOVAL_GUIDE.md`
- [ ] Document each mock that was replaced:
  - What was the mock
  - What replaced it
  - Migration guide for similar patterns
- [ ] Add API endpoint documentation for all new endpoints created
- [ ] Update README with architecture changes
- [ ] Document any breaking changes for contributors
- [ ] Add comments in code explaining why certain defaults exist

---

### Task 12.2: Create User Guide for New Features
**Implementation Required:**
- [ ] Document new notification system usage
- [ ] Explain how environment sensor integration works
- [ ] Guide for setting up user preferences/defaults
- [ ] Tutorial for using strain database
- [ ] Best practices for recording metrics
- [ ] Add help tooltips in UI for complex features
- [ ] Create video tutorials or GIF demos
- [ ] Link documentation from Settings page

---

## SECTION 13: PERFORMANCE & OPTIMIZATION (Priority: LOW)

### Task 13.1: Implement Data Caching Strategy
**Implementation Required:**
- [ ] Add React Query or SWR for API data caching
- [ ] Cache plant lists with stale-while-revalidate
- [ ] Cache strain database locally (update weekly)
- [ ] Cache user preferences in memory
- [ ] Implement optimistic updates for mutations
- [ ] Reduce unnecessary re-renders with useMemo/useCallback
- [ ] Add service worker for offline functionality
- [ ] Cache static calculator defaults in localStorage

---

### Task 13.2: Lazy Load Calculator Components
**Implementation Required:**
- [ ] Split Tools.tsx into separate calculator components
- [ ] Use React.lazy for code splitting: `const NutrientCalc = React.lazy(() => import('./calculators/Nutrient'))`
- [ ] Add Suspense boundary: `<Suspense fallback={<LoadingSpinner />}>`
- [ ] Load calculators only when tab is selected
- [ ] Reduce initial bundle size
- [ ] Implement route-based code splitting
- [ ] Analyze bundle size with webpack-bundle-analyzer

---

## EXECUTION ORDER SUMMARY

### Phase 1: Critical Data Issues (Do First)
1. Task 2.1 - 2.6: Replace all hardcoded dashboard values
2. Task 3.1 - 3.4: Fix fallback/empty states
3. Task 1.1: Replace mock notifications

### Phase 2: Forms & User Experience
4. Task 4.1 - 4.6: Make form defaults configurable
5. Task 5.1 - 5.2: Complete localization
6. Task 9.1 - 9.3: Improve loading states

### Phase 3: Features & Enhancements
7. Task 6.1: Implement strain database
8. Task 7.1 - 7.6: Enhance calculators
9. Task 10.1 - 10.3: Complete incomplete features

### Phase 4: Quality & Polish
10. Task 11.1 - 11.3: Add comprehensive tests
11. Task 12.1 - 12.2: Complete documentation
12. Task 13.1 - 13.2: Performance optimization
13. Task 1.2: Clean up test fixtures
14. Task 8.1: Moon phase API integration

---

**Total Tasks: 80+**

**Estimated Effort:** 4-6 weeks for complete implementation

**Dependencies:** Backend API endpoints must be created in parallel with frontend tasks.
