# CLAUDE.md - AI Assistant Guide for SetCalc

## Project Overview

**SetCalc** is a single-page resistance training calculator that helps users determine the weight or reps needed for a target set based on a reference set's performance. The application uses the Berger equation, chosen for its close match with the Nuzzo et al 2023 meta-regression curve.

**Live URL**: https://jesse-smith.github.io/setcalc/

### Key Features
- Calculate target weight from target reps and RPE
- Calculate target reps from target weight and RPE
- Real-time input validation with user feedback
- Progressive Web App (PWA) with offline support
- Responsive design with light/dark mode support
- Zero build dependencies - pure vanilla JavaScript

## Repository Structure

```
/
├── .github/
│   └── workflows/
│       └── static.yml          # GitHub Pages deployment workflow
├── index.html                   # Entire application (HTML, CSS, JS)
├── README.md                    # User-facing documentation
└── CLAUDE.md                    # This file
```

### Architecture Philosophy

This is an **intentionally simple, single-file application**. The entire codebase lives in `index.html` with inline CSS and JavaScript. This design choice prioritizes:

1. **Simplicity** - No build tools, dependencies, or compilation steps
2. **Portability** - Can be opened directly in a browser
3. **Maintainability** - All code in one place, easy to understand
4. **Performance** - No external dependencies to load

## Tech Stack

- **HTML5** - Semantic markup with mobile-first meta tags
- **CSS3** - CSS custom properties for theming, flexbox for layout
- **Vanilla JavaScript** - ES6+ features, no frameworks
- **PWA** - Service Worker for offline caching (inline registration)
- **GitHub Pages** - Static hosting
- **GitHub Actions** - CI/CD deployment

### No External Dependencies

There are **zero npm packages, build tools, or external libraries**. Everything is vanilla web platform APIs.

## Key Code Patterns & Conventions

### 1. Calculation Logic (Berger Equation)

**Core Formula**: `pct = 100 * exp(0.0262 * (effectiveReps - 1))`

```javascript
// Location: index.html:372-383
function getPct(reps, rpe) {
  const repsInReserve = 10 - rpe;
  const effectiveReps = reps + repsInReserve;
  return 100 * Math.exp(0.0262 * (effectiveReps - 1));
}

function getRepsFromPct(pct, rpe) {
  const repsInReserve = 10 - rpe;
  const effectiveReps = 1 + Math.log(pct / 100) / 0.0262;
  return Math.max(1, effectiveReps - repsInReserve);
}
```

**Critical Implementation Details**:
- RPE (Rate of Perceived Exertion) uses a 5-10 scale but allows inputs in (0,10].
- RIR (Reps In Reserve) = 10 - RPE
- Effective reps = actual reps + reps in reserve
- The constant `0.0262` is specific to the Berger equation
- Always ensure reps ≥ 1 in the inverse calculation

### 2. Input Validation Pattern

All inputs use a three-state validation system:

```javascript
// Location: index.html:296-309
function setInvalid(inputId, message)  // Red border + error message
function setEmpty(inputId)             // Red border, no message
function clearValidation(inputId)      // Remove all validation styling
```

**Validation Rules**:
- Reps: positive numbers, max 50
- Weight: positive numbers, no max
- RPE: positive numbers, max 10, step 0.5

**UI States**:
- Empty field → Red border, no error message
- Invalid value → Red border + specific error message
- Valid → No visual indication (clear state)

### 3. Mode Switching (Calculate Weight vs Calculate Reps)

```javascript
// Location: index.html:283-293
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

### 4. CSS Custom Properties (Theming)

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

### 5. Service Worker (PWA)

```javascript
// Location: index.html:454-481
// Inline service worker code stored as string
// Converted to blob and registered via object URL
// Implements install, activate, fetch lifecycle
```

**Cache Strategy**: Cache-first with network fallback

## Development Workflow

### Making Changes

1. **Edit `index.html` directly** - No build step required
2. **Test locally** - Open `index.html` in a browser
3. **Commit with descriptive messages** - See git history for examples
4. **Push to trigger deployment** - Deployment happens on version tags

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

1. **Keep it simple** - Maintain the single-file architecture
2. **Use vanilla JS** - No frameworks or libraries
3. **Validate all inputs** - Use the existing validation pattern
4. **Maintain accessibility** - Use semantic HTML, proper labels
5. **Test calculations** - Verify Berger equation implementation
6. **Support both themes** - Update both light and dark mode colors
7. **Preserve PWA functionality** - Keep service worker working
8. **Follow existing patterns** - Match the code style already present

### DON'T ✗

1. **Don't add build tools** - No webpack, vite, parcel, etc.
2. **Don't add dependencies** - No npm, no external libraries
3. **Don't split files** - Keep everything in `index.html`
4. **Don't break the calculation** - The Berger equation constant is fixed
5. **Don't remove mobile support** - Maintain viewport meta tags
6. **Don't add frameworks** - No React, Vue, Angular, etc.
7. **Don't complicate deployment** - Keep the simple tag-based deploy

### Common Tasks

#### Adding a New Input Field

1. Add HTML in appropriate `.section` div (around line 234-278)
2. Add validation function following the pattern (lines 311-362)
3. Call validation in `calculate()` function (line 385+)
4. Update output calculation logic if needed (lines 421-438)
5. Add event listener (automatic via `querySelectorAll` at line 446)

#### Modifying Calculation Logic

**Warning**: Be extremely careful when modifying the Berger equation.

1. The constant `0.0262` is scientifically derived - don't change it
2. Test with known 1RM values to verify accuracy
3. Ensure the inverse function (`getRepsFromPct`) stays synchronized
4. Validate that `effectiveReps` calculation remains correct

#### Updating Styles

1. Use CSS custom properties in `:root` (line 19-34)
2. Update both light mode override (line 36-53)
3. Follow existing naming convention: `--category-property`
4. Test in both light and dark modes

#### Changing Validation Rules

1. Find the appropriate validation function (lines 311-362)
2. Update the validation logic
3. Update error messages to be user-friendly
4. Ensure `min`, `max`, `step` attributes on `<input>` match validation

## Testing Guidelines

### Manual Testing Checklist

Since there are no automated tests, verify these scenarios:

**Calculation Accuracy**:
- [ ] Test with known 1RM values (e.g., 100 lbs @ 1 rep @ RPE 10 = 100 lbs)
- [ ] Verify weight calculation mode with reference set
- [ ] Verify reps calculation mode with reference set
- [ ] Check edge cases (very low/high reps, different RPE values)

**Validation**:
- [ ] Empty fields show red border without error message
- [ ] Invalid values show red border with error message
- [ ] Valid values clear all error states
- [ ] Output clears when any input is invalid

**UI/UX**:
- [ ] Mode toggle switches between weight/reps calculation
- [ ] Appropriate input field shows/hides based on mode
- [ ] All labels are readable in both light and dark mode
- [ ] Layout works on mobile (320px) and desktop (1920px+)
- [ ] Touch targets are at least 44px for mobile

**PWA**:
- [ ] App loads offline after first visit
- [ ] Service worker registers successfully (check DevTools)
- [ ] Cache updates on new deployments

### Test Cases for Berger Equation

```
Reference: 100 lbs, 5 reps, RPE 8
Target: 8 reps, RPE 8
Expected: ~81 lbs (weight decreases as reps increase at same RPE)

Reference: 100 lbs, 5 reps, RPE 8
Target: 5 reps, RPE 6
Expected: ~108 lbs (weight increases as RPE decreases at same reps)
```

## Important Implementation Notes

### RPE Scale
- Allow 0 < RPE <= 10
- RPE 10 = maximum effort (0 RIR)
- RPE 5 = 5 reps in reserve
- Step size: 0.5 (allows RPE 7.5, 8.5, etc.)

### Rounding
- All outputs rounded to 1 decimal place: `Math.round(value * 10) / 10`
- Location: index.html:440-442

### Input Event Handling
- All inputs trigger calculation on every keystroke
- Event listener: `input.addEventListener('input', calculate)`
- No debouncing - calculations are fast enough

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

## Version History

Recent significant changes (from git log):

- `d9a1c83` - Deploy on version tags (infrastructure)
- `eaa9237` - Rename toggle options (UX)
- `e378f56` - Re-order input sections (layout)
- `b1b9003` - Move output to top (layout)
- `977fdfc` - Remove tailwind CDN (simplification)
- `0357207` - Add static pages deployment (infrastructure)

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

1. **Does this change require external dependencies?** → If yes, reconsider
2. **Does this break the single-file architecture?** → If yes, reconsider
3. **Will this affect calculation accuracy?** → If yes, test extensively
4. **Is this change backwards compatible?** → Consider users' saved bookmarks
5. **Does this work on mobile?** → Test on small screens
6. **Does this work offline?** → Verify service worker still functions
7. **Does this work in both light and dark mode?** → Test both

## Contact & Contribution

- **Repository**: jesse-smith/setcalc
- **Issues**: Use GitHub Issues for bug reports
- **Pull Requests**: Follow existing code style and conventions

---

**Last Updated**: 2025-12-18
**Document Version**: 1.0.0
