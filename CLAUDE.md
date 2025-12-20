# CLAUDE.md - AI Assistant Guide for SetCalc

## Project Overview

**SetCalc** is a single-page resistance training calculator that helps users determine the weight or reps needed for a target set based on a reference set's performance. The application uses the Berger equation, chosen for its close match with the Nuzzo et al 2023 meta-regression curve.

**Live URL**: https://jesse-smith.github.io/setcalc/

### Key Features
- Calculate target weight from target reps and RPE
- Calculate target reps from target weight and RPE
- Equipment selection with automatic base weight adjustment
  - Preset options: None, Smith Machine, 45° Leg Press
  - Custom equipment base weight option
- Real-time input validation with user feedback
- Progressive Web App (PWA) with offline support
- Responsive design with light/dark mode support
- Zero build dependencies - pure vanilla JavaScript

## Repository Structure

```
/
├── .github/
│   └── workflows/
│       ├── static.yml          # GitHub Pages deployment
│       ├── test.yml            # Unit tests (runs on push/PR)
│       └── ui-tests.yml        # UI tests (manual/pre-deploy)
├── src/
│   ├── calc.js                 # Calculation functions (Berger equation)
│   ├── validation.js           # Input validation logic
│   └── utils.js                # Utility functions
├── tests/
│   ├── calc.test.js            # Unit tests for calculations
│   ├── validation.test.js      # Unit tests for validation
│   ├── utils.test.js           # Unit tests for utilities
│   └── ui.spec.js              # End-to-end UI tests (Playwright)
├── index.html                   # Main application (imports ES modules)
├── package.json                 # Dev dependencies (testing only)
├── vitest.config.js            # Vitest configuration
├── playwright.config.js        # Playwright configuration
├── README.md                    # User-facing documentation
└── CLAUDE.md                    # This file
```

### Architecture Philosophy

This is an **intentionally simple application** with minimal dependencies. The application uses ES modules for code organization while maintaining zero runtime dependencies:

**Production** (what users see):
1. **No build step** - ES modules work natively in modern browsers
2. **No runtime dependencies** - Pure vanilla JavaScript
3. **Portable** - Can be opened directly in a browser
4. **Performance** - No external libraries to load

**Development** (testing only):
1. **Modular code** - Functions split into `src/` for testability
2. **Automated testing** - Vitest for unit tests, Playwright for UI tests
3. **100% coverage** - All code paths tested and verified
4. **CI/CD** - Tests run automatically on every commit

## Tech Stack

**Production** (runtime):
- **HTML5** - Semantic markup with mobile-first meta tags
- **CSS3** - CSS custom properties for theming, flexbox for layout
- **Vanilla JavaScript** - ES6+ modules, no frameworks or libraries
- **PWA** - Service Worker for offline caching
- **GitHub Pages** - Static hosting

**Development** (testing):
- **Vitest** - Fast unit testing with 100% coverage enforcement
- **Playwright** - End-to-end browser testing for UI workflows
- **jsdom** - DOM testing environment for Vitest
- **GitHub Actions** - Automated CI/CD with test runs on every commit

### Dependencies

**Runtime**: Zero dependencies - everything uses vanilla web platform APIs

**Development**: Minimal dev dependencies (testing only):
- `vitest` - Unit test runner
- `@vitest/coverage-v8` - Code coverage reporting
- `jsdom` - DOM implementation for testing
- `@playwright/test` - Browser automation for UI tests

## Key Code Patterns & Conventions

### 1. Calculation Logic (Berger Equation)

**Core Formula**: `pct = 100 * exp(0.0262 * (effectiveReps - 1))`

```javascript
// Location: src/calc.js
export function getPct(reps, rpe) {
  const repsInReserve = 10 - rpe;
  const effectiveReps = reps + repsInReserve;
  return 100 * Math.exp(0.0262 * (effectiveReps - 1));
}

export function getRepsFromPct(pct, rpe) {
  const repsInReserve = 10 - rpe;
  const effectiveReps = 1 + Math.log(pct / 100) / 0.0262;
  return Math.max(0, effectiveReps - repsInReserve);
}
```

**Critical Implementation Details**:
- RPE (Rate of Perceived Exertion) uses a 5-10 scale but allows inputs in (0,10].
- RIR (Reps In Reserve) = 10 - RPE
- Effective reps = actual reps + reps in reserve
- The constant `0.0262` is specific to the Berger equation
- Reps can be 0 or greater (allows for calculating scenarios with maximum weight)

### 2. Input Validation Pattern

All inputs use a three-state validation system:

```javascript
// Location: src/validation.js
export function setInvalid(inputId, message)  // Red border + error message
export function setEmpty(inputId)             // Red border, no message
export function clearValidation(inputId)      // Remove all validation styling
```

**Validation Rules**:
- Reps: non-negative numbers (≥ 0), max 50
- Weight: positive numbers (> 0), no max
- RPE: positive numbers (> 0), max 10, step 0.5

**UI States**:
- Empty field → Red border, no error message
- Invalid value → Red border + specific error message
- Valid → No visual indication (clear state)

### 3. Mode Switching (Calculate Weight vs Calculate Reps)

```javascript
// Location: index.html:354-388
let mode = 'weight'; // Global state variable

function setMode(newMode) {
  mode = newMode;
  // Toggle button active states
  // Show/hide appropriate input fields
  // Clear validation on toggled field
  // Recalculate output
}
```

**Modes**:
- `'weight'` - User inputs target reps, app calculates weight
- `'reps'` - User inputs target weight, app calculates reps

**Hidden Input Syncing**:
When a mode is active, the corresponding hidden input (targetWeight in weight mode, targetReps in reps mode) is automatically synced with the calculated output value. This ensures consistency between displayed outputs and input values when the user switches modes (lines 547-553).

### 4. Equipment Selection (Plate Weight vs Total Weight)

The app distinguishes between **plate weight** (what the user loads) and **total weight** (what's actually lifted):

```javascript
// Location: src/utils.js
export function getBaseWeight() {
  const equipmentSelect = document.getElementById('equipment');
  const selectedValue = equipmentSelect.value;
  if (selectedValue === 'custom') {
    const customInput = document.getElementById('customWeight');
    const value = parseFloat(customInput.value);
    return isNaN(value) ? 0 : value;
  }
  return parseFloat(selectedValue) || 0;
}

// Equipment change handler (index.html)
function onEquipmentChange() {
  const equipmentSelect = document.getElementById('equipment');
  const customWeightGroup = document.getElementById('customWeightGroup');
  const isCustom = equipmentSelect.value === 'custom';
  customWeightGroup.classList.toggle('hidden', !isCustom);
  calculate();
}
```

**Equipment Options** (index.html):
- **None** (value="0"): No base weight (barbell exercises where bar weight is loaded as plates)
- **Smith Machine** (value="25"): 25 lbs base weight (typical smith machine bar)
- **45° Leg Press** (value="167"): 167 lbs base weight (sled weight)
- **Custom** (value="custom"): User-specified base weight via additional input field

**Weight Calculation with Equipment**:
```javascript
// Location: index.html:516-540
const baseWeight = getBaseWeight();

// Reference set: convert plate weight to total weight
const refTotalWeight = refWeight + baseWeight;
const e1RM = refTotalWeight * refPct / 100;

// When calculating target weight
const totalOutputWeight = e1RM * 100 / targetPct;
const outputWeight = totalOutputWeight - baseWeight; // Convert back to plate weight

// When calculating target reps
const totalTargetWeight = targetWeight + baseWeight;
const targetPct = e1RM * 100 / totalTargetWeight;
```

**Key Concepts**:
- User always inputs **plate weight** (what they load onto the equipment)
- Calculations use **total weight** (plate weight + base weight)
- Outputs show **plate weight** (for consistency with input)
- Base weight is automatically added/subtracted during calculations

**Custom Equipment UI**:
- The custom weight input field (lines 345-349) is hidden by default
- Shows when user selects "Custom" from equipment dropdown
- Layout uses `.hidden` class toggle to prevent layout shift (line 373)
- Custom weight input has its own validation (non-negative, allows 0)

### 5. CSS Custom Properties (Theming)

```css
/* Location: index.html:19-53 */
:root {
  --bg-page: #1a1a1a;
  --text-primary: #f0f0f0;
  /* ... dark mode defaults ... */
}

@media (prefers-color-scheme: light) {
  :root {
    /* ... light mode overrides ... */
  }
}
```

**Theming Convention**: All colors use CSS variables, automatically switch based on system preference.

**Toggle Design**: The mode toggle uses a sliding pill animation (lines 161-186) with a pseudo-element that transitions smoothly between modes using CSS transforms.

**Select Dropdown Styling**: Equipment selection uses a custom-styled `<select>` element (lines 133-152) with:
- Custom dropdown arrow using inline SVG data URI
- `appearance: none` to remove default browser styling
- Consistent styling with text inputs
- Full theme support (light/dark mode)

### 6. Service Worker (PWA)

```javascript
// Location: index.html:567-594
// Inline service worker code stored as string
// Converted to blob and registered via object URL
// Implements install, activate, fetch lifecycle
```

**Cache Strategy**: Cache-first with network fallback

**Default Values**: The application initializes with sensible defaults:
- Reference set: 100 lbs (plate weight), 10 reps, RPE 9, No equipment
- Target set: 5 reps, RPE 9 (in weight calculation mode)
- Equipment: None (0 lbs base weight)
- These values produce an initial calculation that demonstrates the app's functionality

## Development Workflow

### Making Changes

1. **Edit source files** - Modify `src/*.js` for logic, `index.html` for UI
2. **Run tests** - `npm test` to verify changes (100% coverage required)
3. **Test locally** - Open `index.html` in a browser (ES modules work natively)
4. **Commit with descriptive messages** - See git history for examples
5. **Push** - Automated tests run on every commit
6. **Verify CI passes** - Tests must pass before merging
7. **Deploy** - Create version tag for production deployment

### Local Development

```bash
# First time setup
npm install

# Make changes to src/ files
vim src/calc.js

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Verify 100% coverage
npm run test:coverage

# Test in browser
open index.html  # or use any local server

# Run UI tests before committing
npm run test:ui
```

### Git Commit Conventions

Based on recent history (`git log`):

```
✓ "Deploy on version tags"           - Infrastructure changes
✓ "Rename toggle options"            - UI text changes
✓ "Re-order input sections"          - Layout changes
✓ "Fix child width in output row"    - Bug fixes
✓ "Add index.html from Claude artifact" - File additions
```

**Pattern**: Imperative mood, concise, focuses on "what" changed

### Branch Strategy

- **Development branches**: Use descriptive names (e.g., `claude/add-claude-documentation-WOkL3`)
- **Main branch**: Deployment source
- **Version tags**: Trigger production deployment (`v*` pattern)

### Deployment Process

**Trigger**: Push a version tag (e.g., `v1.0.0`, `v1.2.3`)

```bash
git tag v1.0.0
git push origin v1.0.0
```

**Workflow**: `.github/workflows/static.yml`
- Triggers on `tags: v*` or manual dispatch
- Deploys entire repository to GitHub Pages
- No build or compilation step

## Code Modification Guidelines

### DO ✓

1. **Keep it simple** - Maintain minimal dependencies and no build step
2. **Keep repo size minimal** - Avoid unnecessary files; testing deps are dev-only and don't affect production
3. **Maintain simple architecture** - Pure vanilla JS with minimal file structure (index.html + src/ modules)
4. **Use vanilla JS** - No frameworks or runtime libraries
5. **Write tests first** - Ensure 100% coverage for all changes
6. **Validate all inputs** - Use existing validation patterns in `src/validation.js`
7. **Export functions** - Use ES module exports for testability
8. **Maintain accessibility** - Use semantic HTML, proper labels
9. **Support both themes** - Update both light and dark mode colors
10. **Preserve PWA functionality** - Keep service worker working
11. **Follow existing patterns** - Match the code style already present
12. **Run tests before committing** - `npm test` must pass with 100% coverage

### DON'T ✗

1. **Don't add runtime dependencies** - Production code uses zero npm packages
2. **Don't add build tools** - ES modules work natively in browsers
3. **Don't create unnecessary files** - Keep the repo structure minimal (src/, tests/, config files only)
4. **Don't over-complicate architecture** - Resist urge to add abstraction layers, helpers, or utilities beyond what's needed
5. **Don't skip tests** - 100% coverage is enforced by CI
6. **Don't break the calculation** - The Berger equation constant (0.0262) is fixed
7. **Don't remove mobile support** - Maintain viewport meta tags
8. **Don't add frameworks** - No React, Vue, Angular, etc.
9. **Don't complicate deployment** - Keep the simple tag-based deploy
10. **Don't commit without testing** - Tests prevent bugs from reaching production

### Common Tasks

#### Adding a New Function

1. Add function to appropriate `src/` file (`calc.js`, `validation.js`, or `utils.js`)
2. Export the function: `export function myFunction() { ... }`
3. Import in `index.html`: `import { myFunction } from './src/utils.js';`
4. **Write tests** in corresponding test file before implementing
5. Run `npm run test:coverage` to verify 100% coverage
6. Test manually in browser

#### Adding a New Input Field

1. Add HTML in appropriate `.section` div in `index.html`
2. Add validation function to `src/validation.js` following existing patterns
3. Export the validation function
4. Import and call validation in `calculate()` function
5. Add event listener in `index.html`
6. **Write unit tests** for the new validation function
7. **Write UI tests** for the input field behavior

#### Adding Equipment Options

1. Add new `<option>` in equipment select (lines 337-342)
2. Set `value` attribute to the base weight in pounds (e.g., `value="45"` for 45 lbs)
3. Provide descriptive text for the option (e.g., "Olympic Barbell")
4. No additional code changes needed - `getBaseWeight()` handles numeric values automatically
5. Test calculations to verify base weight is correctly applied

**Example**:
```html
<option value="45">Olympic Barbell</option>
```

#### Modifying Calculation Logic

**Warning**: Be extremely careful when modifying the Berger equation.

1. The constant `0.0262` is scientifically derived - don't change it
2. **Update tests first** - Modify `tests/calc.test.js` with expected behavior
3. Run tests to verify they fail (TDD approach)
4. Make the change in `src/calc.js`
5. Ensure the inverse function (`getRepsFromPct`) stays synchronized
6. Validate that `effectiveReps` calculation remains correct
7. Verify all tests pass with 100% coverage
8. Test with known 1RM values in the browser

#### Updating Styles

1. Use CSS custom properties in `:root` (line 19-34)
2. Update both light mode override (line 36-53)
3. Follow existing naming convention: `--category-property`
4. Test in both light and dark modes

#### Changing Validation Rules

1. Find the appropriate validation function (lines 406-457)
2. Update the validation logic
3. Update error messages to be user-friendly
4. Ensure `min`, `max`, `step` attributes on `<input>` match validation

**Important**: When changing validation rules for reps or weight:
- Reps validation uses `value < 0` to allow zero reps (line 413)
- Weight validation uses `value <= 0` to require positive values (line 432)
- Custom weight validation allows zero (for equipment with negligible base weight)
- This distinction is intentional for different use cases

## Testing Guidelines

### Automated Testing

The project has comprehensive automated tests with **100% code coverage** enforced by CI:

**Test Suites**:
- **Unit Tests** (`tests/*.test.js`) - 37 tests covering all functions
  - `calc.test.js` - Berger equation calculations (5 tests)
  - `validation.test.js` - Input validation logic (27 tests)
  - `utils.test.js` - Utility functions (5 tests)
- **UI Tests** (`tests/ui.spec.js`) - End-to-end browser testing
  - User workflows, validation states, equipment selection, edge cases

**Running Tests Locally**:
```bash
# Install dependencies (first time only)
npm install

# Run unit tests
npm test

# Run unit tests with coverage report
npm run test:coverage

# Run unit tests in watch mode (for development)
npm run test:watch

# Run UI tests (requires browser)
npm run playwright:install  # First time only
npm run test:ui

# Run UI tests with visible browser
npm run test:ui:headed
```

**Coverage Requirements**:
- Lines: 100%
- Functions: 100%
- Branches: 100%
- Statements: 100%

Tests fail if coverage drops below these thresholds.

**CI/CD Integration**:
- Unit tests run automatically on every push and pull request
- Coverage report posted as PR comment
- UI tests run manually or on version tags
- All tests must pass before merging

### Manual Verification Checklist

While automated tests cover all code paths, manually verify these user experience aspects:

**Calculation Accuracy**:
- [ ] Test with known 1RM values (e.g., 100 lbs @ 1 rep @ RPE 10 = 100 lbs)
- [ ] Verify weight calculation mode with reference set
- [ ] Verify reps calculation mode with reference set
- [ ] Check edge cases (very low/high reps, different RPE values)
- [ ] Test equipment selection:
  - [ ] "None" option produces same results as before equipment feature
  - [ ] Smith Machine (25 lbs) adds/subtracts correctly
  - [ ] 45° Leg Press (167 lbs) adds/subtracts correctly
  - [ ] Custom equipment with various base weights
  - [ ] Switching equipment recalculates output correctly

**Validation**:
- [ ] Empty fields show red border without error message
- [ ] Invalid values show red border with error message
- [ ] Valid values clear all error states
- [ ] Output clears when any input is invalid

**UI/UX**:
- [ ] Mode toggle switches between weight/reps calculation
- [ ] Appropriate input field shows/hides based on mode
- [ ] Equipment dropdown displays all options correctly
- [ ] Custom weight input shows/hides when selecting/deselecting "Custom"
- [ ] No layout shift when toggling custom equipment visibility
- [ ] All labels are readable in both light and dark mode
- [ ] Select dropdown arrow displays correctly in both themes
- [ ] Layout works on mobile (320px) and desktop (1920px+)
- [ ] Touch targets are at least 44px for mobile

**PWA**:
- [ ] App loads offline after first visit
- [ ] Service worker registers successfully (check DevTools)
- [ ] Cache updates on new deployments

### Test Cases for Berger Equation

**Without Equipment** (base weight = 0):
```
Reference: 100 lbs, 5 reps, RPE 8
Target: 8 reps, RPE 8
Expected: ~81 lbs (weight decreases as reps increase at same RPE)

Reference: 100 lbs, 5 reps, RPE 8
Target: 5 reps, RPE 6
Expected: ~108 lbs (weight increases as RPE decreases at same reps)
```

**With Equipment** (testing base weight logic):
```
Reference: 100 lbs (plate), 5 reps, RPE 8, Smith Machine (25 lbs base)
Total weight lifted: 125 lbs
Target: 5 reps, RPE 6
Expected plate weight: ~110 lbs (total ~135 lbs)
Calculation: Same percentage increase, but base weight remains constant

Reference: 100 lbs (plate), 10 reps, RPE 9, 45° Leg Press (167 lbs base)
Total weight lifted: 267 lbs
Target: 5 reps, RPE 9
Expected plate weight: ~114 lbs (total ~281 lbs)
Calculation: Plate weight increases due to fewer reps, base weight stays 167 lbs
```

**Edge Cases**:
```
Reference: 0 lbs (plate), 10 reps, RPE 9, Smith Machine (25 lbs base)
Total weight lifted: 25 lbs (base weight only)
Target: 5 reps, RPE 9
Expected: Plate weight calculated from 25 lb reference
Note: Tests that calculations work with zero plate weight (bodyweight-style movements)
```

## Important Implementation Notes

### RPE Scale
- Allow 0 < RPE <= 10
- RPE 10 = maximum effort (0 RIR)
- RPE 5 = 5 reps in reserve
- Step size: 0.5 (allows RPE 7.5, 8.5, etc.)

### Rounding
- All outputs rounded to 1 decimal place: `Math.round(value * 10) / 10`
- Location: index.html:542-544
- Hidden inputs are also synced with the same rounding (lines 549, 552)

### Input Event Handling
- All text/number inputs trigger calculation on every keystroke
- Event listener: `input.addEventListener('input', calculate)` (line 558)
- Equipment select triggers on change: `equipment.addEventListener('change', onEquipmentChange)` (line 562)
- No debouncing - calculations are fast enough
- Initial calculation runs on page load (line 565)

### Browser Compatibility
- Target: Modern browsers (ES6+ required)
- No polyfills for older browsers
- Uses: `Math.exp()`, `Math.log()`, CSS custom properties, Service Worker
- Mobile-first viewport meta tags

### Accessibility Considerations
- Labels properly associated with inputs via `<label>` elements
- Error messages use `aria-live` implicitly via content changes
- Semantic HTML structure
- Color contrast meets WCAG AA standards in both themes

## Troubleshooting

### Common Issues

**Problem**: Outputs show "—" (em dash)
- **Cause**: One or more inputs are invalid
- **Solution**: Check validation states, fix invalid inputs

**Problem**: Calculation seems wrong
- **Cause**: Misunderstanding of effective reps or RPE scale
- **Solution**: Remember effective reps = actual reps + (10 - RPE)

**Problem**: Service worker not updating
- **Cause**: Browser caching old service worker
- **Solution**: Hard refresh (Ctrl+Shift+R) or unregister in DevTools

**Problem**: Dark mode colors wrong
- **Cause**: Forgot to update light mode override
- **Solution**: Update both `:root` and `@media (prefers-color-scheme: light)`

**Problem**: Equipment calculations seem incorrect
- **Cause**: Misunderstanding of plate weight vs total weight
- **Solution**: Remember: inputs/outputs are plate weight, but calculations use total weight (plate + base)

**Problem**: Custom equipment input not showing
- **Cause**: Equipment dropdown not set to "Custom"
- **Solution**: Select "Custom" option to reveal base weight input field

**Problem**: Layout shifts when toggling equipment
- **Cause**: Custom weight field not properly hidden with `.hidden` class
- **Solution**: Ensure `classList.toggle('hidden', condition)` is used (line 373)

## Version History

Recent significant changes (from git log):

- `d4b52a7` - Merge equipment selection feature (feature)
- `c4dcb56` - Add smith machine as equipment option (feature)
- `46ac840` - Fix layout shift when toggling custom equipment (bug fix)
- `08c55b5` - Add equipment selection for plate weight calculation (feature)
- `7db9b2f` - Update CLAUDE.md with recent codebase changes (docs)
- `6df9fec` - Allow reps to be 0 (validation update)
- `13dad47` - Update initial values (UX)
- `f8af0ac` - Sync hidden inputs with corresponding outputs (feature)
- `308227c` - Add cross-browser support for toggle button states (compatibility)
- `e936dab` - Add smooth sliding pill animation to toggle (UX enhancement)
- `36df307` - Increase toggle border-radius for pill shape design (UI)
- `fa12536` - Add comprehensive CLAUDE.md documentation for AI assistants (docs)
- `d9a1c83` - Deploy on version tags (infrastructure)
- `eaa9237` - Rename toggle options (UX)
- `e378f56` - Re-order input sections (layout)

## Resources

### Scientific Background
- Berger equation: Used for estimating 1RM from submaximal sets
- Nuzzo et al 2023 meta-regression: Validation of equation choice
- RPE scale: Zourdos et al 2016 (basis for RPE/RIR relationship)

### Web Platform APIs Used
- Service Worker API (offline support)
- Web App Manifest (PWA metadata via data URI)
- CSS Custom Properties (theming)
- Flexbox (layout)
- LocalStorage (NOT used - app is stateless)

## Questions to Ask Before Making Changes

1. **Does this require runtime dependencies?** → If yes, reconsider (dev dependencies OK)
2. **Does this need a build step?** → If yes, reconsider (ES modules work natively)
3. **Will this increase repo complexity?** → Minimize files, folders, and abstraction layers
4. **Is this file/directory necessary?** → Keep structure minimal (index.html, src/, tests/, configs only)
5. **Have I written tests?** → All code must have tests (100% coverage required)
6. **Will this affect calculation accuracy?** → Update tests first, verify with known values
7. **Is this change backwards compatible?** → Consider users' saved bookmarks
8. **Does this work on mobile?** → Test on small screens (UI tests cover this)
9. **Does this work offline?** → Verify service worker still functions
10. **Does this work in both light and dark mode?** → Test both (UI tests cover this)
11. **Do all tests pass?** → Run `npm test` before committing
12. **Will CI pass?** → Tests run automatically but verify locally first

## Contact & Contribution

- **Repository**: jesse-smith/setcalc
- **Issues**: Use GitHub Issues for bug reports
- **Pull Requests**: Follow existing code style and conventions

---

**Last Updated**: 2025-12-20
**Document Version**: 2.0.0

## Changelog

### Version 2.0.0 (2025-12-20)
- **Major Update**: Added comprehensive testing infrastructure
  - Modularized code into ES modules (`src/calc.js`, `src/validation.js`, `src/utils.js`)
  - Added Vitest for unit testing with 100% coverage enforcement
  - Added Playwright for end-to-end UI testing
  - Added GitHub Actions workflows for automated testing on every commit
  - 37 unit tests covering all code paths and edge cases
  - Comprehensive UI test suite for user workflows
- Updated repository structure documentation
- Updated architecture philosophy (production vs development)
- Added detailed testing guidelines and commands
- Updated development workflow with testing requirements
- Revised DO/DON'T guidelines to include testing practices
- Updated common tasks with test-driven approach
- Added "Questions to Ask" for testing and CI
- Removed outdated line number references

### Version 1.2.0 (2025-12-19)
- **Major Feature**: Documented equipment selection system
  - Added comprehensive section on plate weight vs total weight calculation
  - Documented `getBaseWeight()` and `onEquipmentChange()` functions
  - Explained preset equipment options (None, Smith Machine, 45° Leg Press)
  - Documented custom equipment input functionality
- Added "Adding Equipment Options" task to Common Tasks section
- Updated calculation logic documentation with equipment integration
- Added equipment-specific test cases for Berger equation
- Expanded manual testing checklist with equipment scenarios
- Added troubleshooting section for equipment-related issues
- Updated CSS documentation to include select dropdown styling
- Updated all line number references throughout document
- Updated version history with equipment selection commits
- Updated default values to include equipment selection

### Version 1.1.0 (2025-12-19)
- Updated line number references throughout document
- Documented new feature: hidden input syncing
- Documented validation change: reps can now be 0
- Updated initial default values
- Added documentation for toggle pill animation
- Updated version history with recent commits
- Fixed code examples to match current implementation

### Version 1.0.0 (2025-12-18)
- Initial comprehensive documentation
