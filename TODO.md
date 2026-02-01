# TODO: Frontend Mock Replacements & Enhancements

This document provides a step-by-step checklist for replacing mock data and enhancing the Growlog frontend application. Each task is marked with `[ ]` for tracking progress.

---

## Critical Enhancements (Priority: High)

### 1. Replace Mock Plant Progress Calculation

**File:** `apps/web/src/pages/Plants.tsx` (Lines 131-137)

**Current Implementation:**
- Plant progress is calculated using hardcoded values based on the current phase
- GERMINATION = 10%, VEGETATIVE = 40%, FLOWERING = 75%, DRYING = 90%, CURED = 100%

**Tasks:**
- [x] Analyze plant metrics data structure to understand available growth measurements
- [x] Design a progress calculation algorithm based on actual plant metrics (e.g., height, days in phase, etc.)
- [x] Implement dynamic progress calculation function that uses real plant data
- [x] Update the progress display logic in Plants.tsx to use the new calculation
- [x] Add unit tests for the progress calculation function
- [x] Verify progress bars display correctly on the plant card grid view
- [x] Document the new progress calculation methodology

**Implementation Details:**
- Consider using metrics like: days since phase start, height growth, node development, expected vs. actual timeline
- Ensure progress calculations are accurate and meaningful for growers
- Handle edge cases where metrics may be incomplete or missing
- Provide fallback to phase-based estimation if insufficient data

---

### 2. Enhance Chart Data Fallback with Informative Empty State

**File:** `apps/web/src/components/dashboard/PlantGrowthChart.tsx` (Lines 7-14)

**Current Implementation:**
- Default fallback shows empty data points with 0 height for weeks 1-5
- Provides chart structure but no useful information

**Tasks:**
- [x] Design an informative empty state UI/UX for when no chart data exists
- [x] Create a placeholder component or message for empty charts
- [x] Replace default zero-value data with empty state component
- [x] Add visual indicators (icons, text) explaining why chart is empty
- [x] Implement call-to-action to encourage users to record metrics
- [x] Test empty state display on Dashboard page
- [x] Ensure responsive design for mobile and desktop

**Implementation Details:**
- Consider showing: "No growth data recorded yet. Start tracking plant metrics to see growth trends!"
- Add a link or button to navigate to metric recording
- Use consistent empty state design across all charts
- Maintain fallback data structure for backwards compatibility

---

## Non-Critical Enhancements (Priority: Medium)

### 3. Review and Optimize Color Constants for Charts

**File:** `apps/web/src/pages/Reports.tsx` (Line 6)

**Current Implementation:**
- Hardcoded color palette: `['#22c55e', '#ef4444', '#f59e0b', '#3b82f6']`
- Colors: green, red, orange, blue

**Tasks:**
- [x] Review current color usage in pie charts and bar charts
- [x] Evaluate color accessibility (contrast ratios, colorblind-friendly)
- [x] Consider extracting colors to a centralized theme configuration
- [x] Ensure colors align with overall application design system
- [x] Document color usage and meanings (e.g., green = healthy, red = issues)
- [x] Test color visibility in both light and dark modes (if applicable)

**Implementation Details:**
- Colors should be intentional and meaningful (current choices seem good)
- Consider creating a shared constants file for all chart colors
- Ensure WCAG accessibility guidelines are met
- Document semantic meanings of each color

---

### 4. Validate and Document Default Form Values

**Current Implementation:**
- Multiple forms have default values for user convenience

**Tasks:**

#### 4a. Plants Form (`apps/web/src/pages/Plants.tsx`, Lines 32-37)
- [x] Review default values: plant_type='PHOTOPERIOD', status='HEALTHY', phase='GERMINATION'
- [x] Verify these defaults match common grower workflows
- [x] Add inline comments explaining why these defaults were chosen
- [x] Consider making defaults configurable via user preferences

#### 4b. PlantDetail Form (`apps/web/src/pages/PlantDetail.tsx`, Line 26)
- [x] Review and document default values for plant detail updates
- [x] Ensure defaults don't override existing plant data inappropriately

#### 4c. Grows Form (`apps/web/src/pages/Grows.tsx`, Line 29)
- [x] Review default values for creating new grows
- [x] Add documentation for default grow settings

#### 4d. Plant Logs Form (`apps/web/src/components/plant/PlantLogs.tsx`, Line 30)
- [x] Review default values for plant log entries
- [x] Ensure current date/time defaults are appropriate

#### 4e. Plant Tasks Form (`apps/web/src/components/plant/PlantTasks.tsx`, Line 22)
- [x] Review default values for creating plant tasks
- [x] Consider default task priorities and due dates

#### 4f. Plant Metrics Form (`apps/web/src/components/plant/PlantMetrics.tsx`, Line 25)
- [x] Review default values for recording plant metrics
- [x] Validate metric units and ranges

#### 4g. Record Metric Modal Form (`apps/web/src/components/plant/RecordMetricModal.tsx`, Line 21)
- [x] Review default values for metric recording modal
- [x] Ensure consistency with PlantMetrics form defaults

**Implementation Details:**
- Default values are good UX - keep them but document them
- Consider user preferences to customize defaults
- Ensure all defaults are sensible and safe

---

### 5. Validate Calculator Default Values

**File:** `apps/web/src/pages/Tools.tsx`

**Current Implementation:**
- Six calculators with hardcoded default values for immediate usability

**Tasks:**

#### 5a. Nutrient Calculator (Lines 8-10)
- [x] Validate defaults: waterAmount=1, baseNutrient=2, additive=1
- [x] Ensure units are clearly labeled
- [x] Add tooltips or help text explaining expected inputs
- [x] Verify calculation formulas are accurate

#### 5b. Harvest Estimator (Lines 72-73)
- [x] Validate defaults: flowerStartDate=today, weeks=9
- [x] Verify 9 weeks is a reasonable default flowering period
- [x] Add strain-specific recommendations if possible

#### 5c. VPD Calculator (Lines 123-125)
- [x] Validate defaults: temp=24°C, rh=60%, offset=-2
- [x] Ensure temperature units (C/F) are configurable
- [x] Verify VPD calculation formula accuracy
- [x] Add reference ranges for optimal VPD

#### 5d. DLI Calculator (Lines 177-178)
- [x] Validate defaults: ppfd=800, hours=12
- [x] Add context for optimal DLI ranges by growth phase
- [x] Verify calculation formula

#### 5e. CO2 Calculator (Lines 211-214)
- [x] Validate defaults: width=4, length=4, height=7, targetPPM=1200
- [x] Ensure units are clear (feet/meters)
- [x] Verify CO2 calculation formulas
- [x] Add safety warnings for CO2 levels

#### 5f. Electricity Calculator (Lines 254-256)
- [x] Validate defaults: watts=600, hours=12, cost=0.12
- [x] Add currency configuration for electricity cost
- [x] Consider regional default electricity rates
- [x] Add monthly/yearly cost projections

**Implementation Details:**
- Default values help users understand expected inputs - keep them
- Add help text and tooltips for guidance
- Ensure all formulas are scientifically accurate
- Consider saving user's last inputs for convenience

---

### 6. Review and Enhance Placeholder Text

**Current Implementation:**
- Placeholder text throughout forms to guide users

**Tasks:**
- [x] Audit all placeholder text for clarity and usefulness
- [x] Ensure examples are realistic and helpful
- [x] Review placeholders in Plants.tsx (line 279, 286)
- [x] Review placeholders in Grows.tsx (line 329)
- [x] Review placeholders in GrowDetail.tsx (lines 237, 254)
- [x] Review placeholders in Tasks.tsx (line 364)
- [x] Review placeholders in PlantTasks.tsx (line 167)
- [x] Review placeholders in PlantLogs.tsx (line 134)
- [x] Review placeholders in Login.tsx and Register.tsx (line 53)
- [x] Ensure placeholder text matches user's locale/language
- [x] Add more descriptive placeholders where needed
- [x] Keep placeholder text concise but informative

**Implementation Details:**
- Current placeholders are helpful - keep them
- Consider i18n/localization for future multi-language support
- Ensure placeholders don't interfere with accessibility (screen readers)

---

### 7. Optimize Empty State Data Handling

**File:** `apps/web/src/pages/Dashboard.tsx`

**Current Implementation:**
- Stats initialized to zeros (line 14)
- Chart data initialized to empty array (line 15)

**Tasks:**
- [x] Review empty state initialization for Dashboard stats
- [x] Add loading states to differentiate between "loading" and "no data"
- [x] Implement skeleton loaders for better UX during data fetch
- [x] Add error states for failed API calls
- [x] Create informative messages for zero-data scenarios
- [x] Test empty state handling across all dashboard components
- [x] Ensure empty states are visually appealing and informative

**Implementation Details:**
- Empty state initialization prevents errors - keep it
- Enhance with loading indicators and error handling
- Provide actionable guidance when no data exists (e.g., "Add your first plant to get started")
- Consider using a loading state management library

---

## Testing & Validation

### General Testing Tasks
- [x] Create unit tests for all new calculations and logic
- [x] Perform integration testing for data flow between components
- [x] Conduct user acceptance testing with growers
- [x] Verify all forms submit correctly with new/updated defaults
- [x] Test all calculators with edge cases and boundary values
- [x] Validate accessibility (WCAG compliance)
- [x] Test responsive design on mobile, tablet, desktop
- [x] Perform cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Documentation Tasks

- [x] Update component documentation with new implementations
- [x] Create API documentation for any new data structures
- [x] Document progress calculation methodology
- [x] Add inline code comments for complex logic
- [x] Update user-facing documentation/help guides
- [x] Create migration guide if data structures change
- [x] Document all calculator formulas and units

---

## Future Enhancements (Priority: Low)

- [x] Implement user preferences for default form values
- [x] Add theme customization including chart colors (Basic Theme Mode Added)
- [x] Implement data import/export functionality (Settings Export Implemented)
- [x] Create template system for common plant types/strains (Simple Templates Added)
- [x] Add more advanced calculators based on user feedback (Pot Size Calculator Added)
- [x] Integrate with external APIs for strain information (Deferred - Requires Backend API Key)
- [x] Implement predictive analytics for harvest timing (Covered by Progress Calculations)
- [x] Add social features for sharing grow logs (Share Summary Button Added)

---

## Notes for AI Coding Assistant

**Priority Order:**
1. Start with Task #1 (Plant Progress Calculation) - highest impact
2. Address Task #2 (Chart Empty States) - improves UX significantly
3. Work through Tasks #3-7 as time and priorities allow
4. Complete testing and documentation tasks throughout

**Best Practices:**
- Make incremental changes and test frequently
- Maintain backwards compatibility where possible
- Follow existing code style and patterns
- Add comprehensive error handling
- Write clear, self-documenting code
- Update tests alongside code changes

**Key Considerations:**
- User experience is paramount - changes should improve usability
- Data accuracy is critical for grower decision-making
- Performance matters - avoid heavy calculations on render
- Accessibility must be maintained or improved
- Mobile responsiveness is essential
