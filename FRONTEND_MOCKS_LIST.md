# Frontend Mocks List - Growlog Application

This document lists all mock data, hardcoded values, and placeholder data found in the frontend codebase (`apps/web/src/`).

## 1. Mock Progress Calculation

**Location:** `apps/web/src/pages/Plants.tsx` (Lines 131-137)

**Description:** Plant progress percentage is calculated based on the current phase using hardcoded values instead of real data.

```typescript
// Mock progress based on phase (simplified)
let progress = 0;
if (plant.phase === 'GERMINATION') progress = 10;
else if (plant.phase === 'VEGETATIVE') progress = 40;
else if (plant.phase === 'FLOWERING') progress = 75;
else if (plant.phase === 'DRYING') progress = 90;
else if (plant.phase === 'CURED') progress = 100;
```

**Usage:** Used in the plant card grid view to display a progress bar for each plant.

**Impact:** This provides a simplified progress indicator that doesn't reflect actual plant growth metrics.

---

## 2. Default Chart Data Fallback

**Location:** `apps/web/src/components/dashboard/PlantGrowthChart.tsx` (Lines 7-14)

**Description:** When no chart data is available from the API, a default array of empty data points is displayed.

```typescript
// Default fallback
const chartData = data && data.length > 0 ? data : [
    { label: '1 WEEK', height: 0 },
    { label: '2 WEEK', height: 0 },
    { label: '3 WEEK', height: 0 },
    { label: '4 WEEK', height: 0 },
    { label: '5 WEEK', height: 0 },
];
```

**Usage:** Used in the Dashboard page to show a plant growth chart.

**Impact:** Provides a placeholder chart structure when no actual growth data exists.

---

## 3. Color Constants for Charts

**Location:** `apps/web/src/pages/Reports.tsx` (Line 6)

**Description:** Hardcoded color palette used for chart visualizations.

```typescript
const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];
```

**Usage:** Used in pie charts and bar charts for plant status and phase visualizations.

**Impact:** Defines the visual theme for report charts (green, red, orange, blue).

---

## 4. Default Form Values

### Plants Form
**Location:** `apps/web/src/pages/Plants.tsx` (Lines 32-37)

```typescript
defaultValues: {
    plant_type: 'PHOTOPERIOD',
    status: 'HEALTHY',
    phase: 'GERMINATION',
    start_date: new Date().toISOString().split('T')[0]
}
```

### PlantDetail Form
**Location:** `apps/web/src/pages/PlantDetail.tsx` (Line 26)

Default values for plant detail updates.

### Grows Form
**Location:** `apps/web/src/pages/Grows.tsx` (Line 29)

Default values for creating new grows.

### Plant Logs Form
**Location:** `apps/web/src/components/plant/PlantLogs.tsx` (Line 30)

Default values for plant log entries.

### Plant Tasks Form
**Location:** `apps/web/src/components/plant/PlantTasks.tsx` (Line 22)

Default values for creating plant tasks.

### Plant Metrics Form
**Location:** `apps/web/src/components/plant/PlantMetrics.tsx` (Line 25)

Default values for recording plant metrics.

### Record Metric Modal Form
**Location:** `apps/web/src/components/plant/RecordMetricModal.tsx` (Line 21)

Default values for metric recording modal.

---

## 5. Calculator Default Values

**Location:** `apps/web/src/pages/Tools.tsx`

### Nutrient Calculator (Lines 8-10)
```typescript
const [waterAmount, setWaterAmount] = useState(1);
const [baseNutrient, setBaseNutrient] = useState(2);
const [additive, setAdditive] = useState(1);
```

### Harvest Estimator (Lines 72-73)
```typescript
const [flowerStartDate, setFlowerStartDate] = useState(new Date().toISOString().split('T')[0]);
const [weeks, setWeeks] = useState(9);
```

### VPD Calculator (Lines 123-125)
```typescript
const [temp, setTemp] = useState(24);
const [rh, setRh] = useState(60);
const [offset, setOffset] = useState(-2);
```

### DLI Calculator (Lines 177-178)
```typescript
const [ppfd, setPpfd] = useState(800);
const [hours, setHours] = useState(12);
```

### CO2 Calculator (Lines 211-214)
```typescript
const [width, setWidth] = useState(4);
const [length, setLength] = useState(4);
const [height, setHeight] = useState(7);
const [targetPPM, setTargetPPM] = useState(1200);
```

### Electricity Calculator (Lines 254-256)
```typescript
const [watts, setWatts] = useState(600);
const [hours, setHours] = useState(12);
const [cost, setCost] = useState(0.12);
```

**Usage:** These default values provide sensible starting points for growers to use the calculators.

**Impact:** Users can immediately see example calculations without entering data first.

---

## 6. Placeholder Text in Forms

Various placeholder texts are used throughout the application to guide users:

- `"e.g. Gorilla Glue #4"` - Plant name input (Plants.tsx:279)
- `"e.g. Indica Dominant"` - Strain input (Plants.tsx:286)
- `"e.g. Winter Run 2024"` - Grow name input (Grows.tsx:329)
- `"e.g. Tent 1 (80x80)"` - Environment name input (GrowDetail.tsx:237)
- `"e.g. 18/6"` - Light schedule input (GrowDetail.tsx:254)
- `"e.g. Water Plants"` - Task title input (Tasks.tsx:364)
- `"e.g. Water and Feed"` - Plant task title input (PlantTasks.tsx:167)
- `"e.g. Topped the 5th node"` - Plant log title input (PlantLogs.tsx:134)
- `"you@example.com"` - Email input (Login.tsx:53, Register.tsx:53)
- And various other descriptive placeholders

---

## 7. Empty State Data

### Dashboard Stats (Dashboard.tsx:14)
```typescript
const [stats, setStats] = useState({ total: 0, active: 0, healthy: 0, waste: 0 });
```

### Empty Chart Data (Dashboard.tsx:15)
```typescript
const [chartData, setChartData] = useState<any[]>([]);
```

**Usage:** Initial state before API data is loaded.

**Impact:** Prevents undefined errors and provides default empty visualizations.

---

## Summary

### Critical Mocks (Logic-Based)
1. **Plant Progress Calculation** - Should be replaced with actual growth metrics
2. **Default Chart Data Fallback** - Provides structure but no real data

### Non-Critical Mocks (UI/UX Enhancements)
3. **Color Constants** - Intentional design choices
4. **Default Form Values** - Sensible defaults for user convenience
5. **Calculator Default Values** - Example values for immediate usability
6. **Placeholder Text** - User guidance
7. **Empty State Data** - Prevents errors during loading

### Recommendation for AI Coding Assistant

When working on this codebase:

1. **Replace the plant progress calculation** with actual metric-based calculations when implementing real progress tracking
2. **Keep the chart data fallback** but consider showing a more informative empty state
3. **Maintain color constants** unless redesigning the theme
4. **Keep default form values** as they improve UX
5. **Keep calculator defaults** as they provide examples
6. **Keep placeholder text** as it guides users
7. **Keep empty state initializations** as they prevent errors

The most important mock to address is #1 (Plant Progress Calculation), as it provides potentially misleading information to users.
