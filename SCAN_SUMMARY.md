# Frontend Mock & Placeholder Scan Summary

**Date:** 2026-02-01  
**Repository:** meinzeug/growlog  
**Scope:** Complete frontend codebase (`apps/web/src/`)

---

## Scan Statistics

- **Total Files Scanned:** 38+ TypeScript/React files
- **Total Issues Found:** 80+ distinct mocks, placeholders, and hardcoded values
- **Total Tasks Created:** 80+ actionable tasks in TODO.md
- **Lines in TODO.md:** 1,020 lines
- **Estimated Implementation Time:** 4-6 weeks

---

## Summary by Category

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| Mock Data Structures | 2 | HIGH | Documented |
| Hardcoded Dashboard Values | 6 | CRITICAL | Documented |
| Fallback/Empty States | 4 | HIGH | Documented |
| Form Default Values | 6 | MEDIUM | Documented |
| Placeholder Text & i18n | 15+ | MEDIUM | Documented |
| Plant Templates & Strain Data | 1 | LOW | Documented |
| Calculator Default Values | 6 | LOW | Documented |
| Moon Phase & Astronomy | 1 | LOW | Documented |
| Loading States & Temporary UI | 5+ | MEDIUM | Documented |
| Incomplete Features (Comments) | 3 | LOW | Documented |
| Testing & Validation | 3 | CRITICAL | Documented |
| Documentation Tasks | 2 | MEDIUM | Documented |
| Performance & Optimization | 2 | LOW | Documented |

---

## Critical Findings (Must Fix First)

### 1. Hardcoded Dashboard Values
- **Temperature:** Displays static "24°C" instead of real sensor data
- **Humidity:** Shows fixed "55%" value
- **Next Crop Countdown:** Hardcoded "12 Days" 
- **Growth Progress:** Static "+4 week" indicator
- **Phase Weights:** Fixed percentage constants instead of configurable timelines

**Impact:** Users see fake data that doesn't reflect their actual grows.

### 2. Mock Notification System
- **Location:** `NotificationContext.tsx`
- **Issue:** Two hardcoded welcome notifications instead of real API data
- **Requirement:** Backend API endpoints needed for real notifications

### 3. Chart Fallback "Ghost" Data
- **Location:** `PlantGrowthChart.tsx`
- **Issue:** Shows fake growth progression (20, 35, 50, 75, 90) when no data exists
- **Requirement:** Replace with proper empty state UI

---

## High Priority Items

### Empty State Handling
- Dashboard stats initialized to zeros (should be null for loading detection)
- Silent error catching returns empty arrays
- Need proper loading/error/empty state differentiation

### Form Defaults
- Plant type, location type, log types all hardcoded
- Should use user preferences system
- Missing last-value defaults for metrics (pH, EC, temperature)

---

## Medium Priority Items

### Localization Gaps
- 15+ hardcoded placeholder texts not in translations.ts
- Some empty state messages not localized
- Fallback email "grower@example.com" in header

### Loading States
- Basic "Loading..." text instead of professional spinners
- "Coming Soon" placeholder pages need proper components
- Inconsistent loading indicators across components

---

## Low Priority Items

### Plant Templates
- 4 hardcoded strain templates should be database-driven
- Missing comprehensive strain database with flowering times, effects, etc.

### Calculator Enhancements
- Default values not user-configurable
- Missing unit conversions (Celsius/Fahrenheit)
- No regional electricity rates
- Missing safety warnings (CO2 calculator)

### Moon Phase Feature
- Hardcoded astronomical calculations
- Should use external API
- Recommendations should be database-configurable

---

## Methodology

1. **Automated Scan:** Used explore agent to scan all TypeScript/React files
2. **Pattern Matching:** Searched for keywords: mock, stub, TODO, FIXME, placeholder, hardcoded
3. **Manual Review:** Examined default values, empty states, loading patterns
4. **Code Analysis:** Identified fallback data, constants, and placeholder UI elements

---

## Files with Most Issues

1. `Grows.tsx` - 6+ hardcoded dashboard values
2. `Tools.tsx` - 6 calculator default values
3. `Plants.tsx` - Form defaults + templates
4. `Dashboard.tsx` - Empty state handling
5. `PlantMetrics.tsx` / `RecordMetricModal.tsx` - Metric defaults
6. `translations.ts` - Missing placeholder keys
7. `NotificationContext.tsx` - Mock notifications
8. `PlantGrowthChart.tsx` - Ghost data
9. `Tasks.tsx` - Moon phase algorithm
10. `Various components` - Loading state inconsistencies

---

## Recommended Implementation Order

### Phase 1: Critical Data (Weeks 1-2)
- Replace hardcoded dashboard metrics with real API data
- Fix empty state and error handling
- Implement proper loading states

### Phase 2: UX Improvements (Weeks 2-3)
- Make form defaults configurable via user preferences
- Complete localization (i18n)
- Standardize loading spinners

### Phase 3: Feature Completion (Weeks 3-4)
- Build strain database
- Enhance calculators
- Complete incomplete features (time picker, icons)

### Phase 4: Quality Assurance (Weeks 5-6)
- Create test fixtures and factories
- Add integration tests
- Write documentation
- Performance optimization

---

## Dependencies

### Backend API Requirements
The following API endpoints must be created:
- `GET /api/notifications` - Fetch user notifications
- `GET /api/grows/:id/environment/latest` - Environment sensor data
- `GET /api/user/preferences` - User preference settings
- `PUT /api/user/preferences` - Update preferences
- `GET /api/settings/phase-timelines` - Phase duration configs
- `GET /api/strains?search=<query>` - Strain database
- `POST /api/strains` - Add custom strain
- `GET /api/plants/:id/metrics/latest` - Latest plant metrics

### Database Schema Changes
- `UserPreferences` table
- `PhaseTimeline` configuration table
- `Strains` table
- `Environment` sensor data table
- `MoonPhaseRecommendations` table (optional)

---

## Testing Strategy

1. **Unit Tests:** Test factories and fixtures
2. **Integration Tests:** Verify API integration replaces mocks
3. **Visual Regression:** Empty states and loading indicators
4. **E2E Tests:** Full user flows with real data

---

## Success Criteria

- [ ] Zero hardcoded mock data in production code
- [ ] All empty states show informative UI
- [ ] All form defaults are user-configurable
- [ ] Complete i18n coverage (English + German)
- [ ] Professional loading states throughout
- [ ] Comprehensive test coverage (>80%)
- [ ] Documentation complete
- [ ] Performance metrics acceptable

---

## Deliverables

1. ✅ **TODO.md** - Comprehensive task list with 80+ items
2. ✅ **SCAN_SUMMARY.md** - This summary document
3. ✅ **TODO_OLD.md** - Backup of previous TODO
4. ⏳ **Implementation** - To be completed sequentially

---

## Notes for Developers

- Each task in TODO.md is self-contained and can be implemented independently
- Backend API development should proceed in parallel
- Use existing test infrastructure (vitest) for new tests
- Follow existing code patterns and conventions
- All tasks include specific line numbers and code references
- Tasks are ordered for sequential execution

---

**Generated by:** GitHub Copilot AI Agent  
**Repository:** https://github.com/meinzeug/growlog  
**Branch:** copilot/scan-frontend-codebase
