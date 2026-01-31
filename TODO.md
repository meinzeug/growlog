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
- [ ] Analyze plant metrics data structure to understand available growth measurements
- [ ] Design a progress calculation algorithm based on actual plant metrics (e.g., height, days in phase, etc.)
- [ ] Implement dynamic progress calculation function that uses real plant data
- [ ] Update the progress display logic in Plants.tsx to use the new calculation
- [ ] Add unit tests for the progress calculation function
- [ ] Verify progress bars display correctly on the plant card grid view
- [ ] Document the new progress calculation methodology

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
- [ ] Design an informative empty state UI/UX for when no chart data exists
- [ ] Create a placeholder component or message for empty charts
- [ ] Replace default zero-value data with empty state component
- [ ] Add visual indicators (icons, text) explaining why chart is empty
- [ ] Implement call-to-action to encourage users to record metrics
- [ ] Test empty state display on Dashboard page
- [ ] Ensure responsive design for mobile and desktop

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
- [ ] Review current color usage in pie charts and bar charts
- [ ] Evaluate color accessibility (contrast ratios, colorblind-friendly)
- [ ] Consider extracting colors to a centralized theme configuration
- [ ] Ensure colors align with overall application design system
- [ ] Document color usage and meanings (e.g., green = healthy, red = issues)
- [ ] Test color visibility in both light and dark modes (if applicable)

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
- [ ] Review default values: plant_type='PHOTOPERIOD', status='HEALTHY', phase='GERMINATION'
- [ ] Verify these defaults match common grower workflows
- [ ] Add inline comments explaining why these defaults were chosen
- [ ] Consider making defaults configurable via user preferences

#### 4b. PlantDetail Form (`apps/web/src/pages/PlantDetail.tsx`, Line 26)
- [ ] Review and document default values for plant detail updates
- [ ] Ensure defaults don't override existing plant data inappropriately

#### 4c. Grows Form (`apps/web/src/pages/Grows.tsx`, Line 29)
- [ ] Review default values for creating new grows
- [ ] Add documentation for default grow settings

#### 4d. Plant Logs Form (`apps/web/src/components/plant/PlantLogs.tsx`, Line 30)
- [ ] Review default values for plant log entries
- [ ] Ensure current date/time defaults are appropriate

#### 4e. Plant Tasks Form (`apps/web/src/components/plant/PlantTasks.tsx`, Line 22)
- [ ] Review default values for creating plant tasks
- [ ] Consider default task priorities and due dates

#### 4f. Plant Metrics Form (`apps/web/src/components/plant/PlantMetrics.tsx`, Line 25)
- [ ] Review default values for recording plant metrics
- [ ] Validate metric units and ranges

#### 4g. Record Metric Modal Form (`apps/web/src/components/plant/RecordMetricModal.tsx`, Line 21)
- [ ] Review default values for metric recording modal
- [ ] Ensure consistency with PlantMetrics form defaults

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
- [ ] Validate defaults: waterAmount=1, baseNutrient=2, additive=1
- [ ] Ensure units are clearly labeled
- [ ] Add tooltips or help text explaining expected inputs
- [ ] Verify calculation formulas are accurate

#### 5b. Harvest Estimator (Lines 72-73)
- [ ] Validate defaults: flowerStartDate=today, weeks=9
- [ ] Verify 9 weeks is a reasonable default flowering period
- [ ] Add strain-specific recommendations if possible

#### 5c. VPD Calculator (Lines 123-125)
- [ ] Validate defaults: temp=24°C, rh=60%, offset=-2
- [ ] Ensure temperature units (C/F) are configurable
- [ ] Verify VPD calculation formula accuracy
- [ ] Add reference ranges for optimal VPD

#### 5d. DLI Calculator (Lines 177-178)
- [ ] Validate defaults: ppfd=800, hours=12
- [ ] Add context for optimal DLI ranges by growth phase
- [ ] Verify calculation formula

#### 5e. CO2 Calculator (Lines 211-214)
- [ ] Validate defaults: width=4, length=4, height=7, targetPPM=1200
- [ ] Ensure units are clear (feet/meters)
- [ ] Verify CO2 calculation formulas
- [ ] Add safety warnings for CO2 levels

#### 5f. Electricity Calculator (Lines 254-256)
- [ ] Validate defaults: watts=600, hours=12, cost=0.12
- [ ] Add currency configuration for electricity cost
- [ ] Consider regional default electricity rates
- [ ] Add monthly/yearly cost projections

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
- [ ] Audit all placeholder text for clarity and usefulness
- [ ] Ensure examples are realistic and helpful
- [ ] Review placeholders in Plants.tsx (line 279, 286)
- [ ] Review placeholders in Grows.tsx (line 329)
- [ ] Review placeholders in GrowDetail.tsx (lines 237, 254)
- [ ] Review placeholders in Tasks.tsx (line 364)
- [ ] Review placeholders in PlantTasks.tsx (line 167)
- [ ] Review placeholders in PlantLogs.tsx (line 134)
- [ ] Review placeholders in Login.tsx and Register.tsx (line 53)
- [ ] Ensure placeholder text matches user's locale/language
- [ ] Add more descriptive placeholders where needed
- [ ] Keep placeholder text concise but informative

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
- [ ] Review empty state initialization for Dashboard stats
- [ ] Add loading states to differentiate between "loading" and "no data"
- [ ] Implement skeleton loaders for better UX during data fetch
- [ ] Add error states for failed API calls
- [ ] Create informative messages for zero-data scenarios
- [ ] Test empty state handling across all dashboard components
- [ ] Ensure empty states are visually appealing and informative

**Implementation Details:**
- Empty state initialization prevents errors - keep it
- Enhance with loading indicators and error handling
- Provide actionable guidance when no data exists (e.g., "Add your first plant to get started")
- Consider using a loading state management library

---

## Testing & Validation

### General Testing Tasks
- [ ] Create unit tests for all new calculations and logic
- [ ] Perform integration testing for data flow between components
- [ ] Conduct user acceptance testing with growers
- [ ] Verify all forms submit correctly with new/updated defaults
- [ ] Test all calculators with edge cases and boundary values
- [ ] Validate accessibility (WCAG compliance)
- [ ] Test responsive design on mobile, tablet, desktop
- [ ] Perform cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Documentation Tasks

- [ ] Update component documentation with new implementations
- [ ] Create API documentation for any new data structures
- [ ] Document progress calculation methodology
- [ ] Add inline code comments for complex logic
- [ ] Update user-facing documentation/help guides
- [ ] Create migration guide if data structures change
- [ ] Document all calculator formulas and units

---

## Future Enhancements (Priority: Low)

- [ ] Implement user preferences for default form values
- [ ] Add theme customization including chart colors
- [ ] Create template system for common plant types/strains
- [ ] Implement data import/export functionality
- [ ] Add more advanced calculators based on user feedback
- [ ] Integrate with external APIs for strain information
- [ ] Implement predictive analytics for harvest timing
- [ ] Add social features for sharing grow logs

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
