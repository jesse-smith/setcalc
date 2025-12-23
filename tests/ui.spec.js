import { test, expect } from '@playwright/test';

test.describe('SetCalc UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Set Calculator');
    await expect(page.locator('h1')).toHaveText('Set Calculator');
  });

  test('displays initial calculation with default values', async ({ page }) => {
    // Default: 100 lbs, 10 reps, RPE 9 -> Target: 5 reps, RPE 9
    await expect(page.locator('#outputWeight')).not.toHaveText('—');
    await expect(page.locator('#outputReps')).toHaveText('5');
    await expect(page.locator('#outputRPE')).toHaveText('9');
  });

  test.describe('Calculate Weight Mode', () => {
    test('calculates target weight from target reps', async ({ page }) => {
      // Set reference: 100 lbs, 10 reps, RPE 9
      await page.locator('#refWeight').fill('100');
      await page.locator('#refReps').fill('10');
      await page.locator('#refRPE').fill('9');

      // Set target: 5 reps, RPE 9
      await page.locator('#targetReps').fill('5');
      await page.locator('#targetRPE').fill('9');

      // Output should show calculated weight
      const outputWeight = await page.locator('#outputWeight').textContent();
      expect(parseFloat(outputWeight)).toBeGreaterThan(100);
    });

    test('updates output when reference weight changes', async ({ page }) => {
      const initialOutput = await page.locator('#outputWeight').textContent();

      await page.locator('#refWeight').fill('200');

      const newOutput = await page.locator('#outputWeight').textContent();
      expect(parseFloat(newOutput)).toBeGreaterThan(parseFloat(initialOutput));
    });

    test('updates output when reference reps change', async ({ page }) => {
      const initialOutput = await page.locator('#outputWeight').textContent();

      await page.locator('#refReps').fill('5');

      const newOutput = await page.locator('#outputWeight').textContent();
      expect(parseFloat(newOutput)).not.toBe(parseFloat(initialOutput));
    });

    test('updates output when reference RPE changes', async ({ page }) => {
      const initialOutput = await page.locator('#outputWeight').textContent();

      await page.locator('#refRPE').fill('8');

      const newOutput = await page.locator('#outputWeight').textContent();
      expect(parseFloat(newOutput)).not.toBe(parseFloat(initialOutput));
    });

    test('updates output when target reps change', async ({ page }) => {
      const initialOutput = await page.locator('#outputWeight').textContent();

      await page.locator('#targetReps').fill('10');

      const newOutput = await page.locator('#outputWeight').textContent();
      expect(parseFloat(newOutput)).toBeLessThan(parseFloat(initialOutput));
    });

    test('updates output when target RPE changes', async ({ page }) => {
      const initialOutput = await page.locator('#outputWeight').textContent();

      await page.locator('#targetRPE').fill('8');

      const newOutput = await page.locator('#outputWeight').textContent();
      expect(parseFloat(newOutput)).not.toBe(parseFloat(initialOutput));
    });
  });

  test.describe('Calculate Reps Mode', () => {
    test('switches to calculate reps mode', async ({ page }) => {
      await page.locator('#toggleReps').click();

      // Target reps input should be hidden
      await expect(page.locator('#targetRepsGroup')).toHaveClass(/hidden/);

      // Target weight input should be visible
      await expect(page.locator('#targetWeightGroup')).not.toHaveClass(/hidden/);
    });

    test('calculates target reps from target weight', async ({ page }) => {
      await page.locator('#toggleReps').click();

      // Set reference: 100 lbs, 10 reps, RPE 9
      await page.locator('#refWeight').fill('100');
      await page.locator('#refReps').fill('10');
      await page.locator('#refRPE').fill('9');

      // Set target: 120 lbs, RPE 9
      await page.locator('#targetWeight').fill('120');
      await page.locator('#targetRPE').fill('9');

      // Output should show calculated reps
      const outputReps = await page.locator('#outputReps').textContent();
      expect(parseFloat(outputReps)).toBeLessThan(10);
    });

    test('updates output when target weight changes', async ({ page }) => {
      await page.locator('#toggleReps').click();

      const initialOutput = await page.locator('#outputReps').textContent();

      await page.locator('#targetWeight').fill('150');

      const newOutput = await page.locator('#outputReps').textContent();
      expect(parseFloat(newOutput)).not.toBe(parseFloat(initialOutput));
    });
  });

  test.describe('Mode Toggle', () => {
    test('switches between modes', async ({ page }) => {
      // Start in weight mode
      await expect(page.locator('#toggleWeight')).toHaveClass(/active/);
      await expect(page.locator('#targetRepsGroup')).not.toHaveClass(/hidden/);

      // Switch to reps mode
      await page.locator('#toggleReps').click();
      await expect(page.locator('#toggleReps')).toHaveClass(/active/);
      await expect(page.locator('#toggleWeight')).not.toHaveClass(/active/);
      await expect(page.locator('#targetWeightGroup')).not.toHaveClass(/hidden/);

      // Switch back to weight mode
      await page.locator('#toggleWeight').click();
      await expect(page.locator('#toggleWeight')).toHaveClass(/active/);
      await expect(page.locator('#targetRepsGroup')).not.toHaveClass(/hidden/);
    });

    test('preserves calculations when switching modes', async ({ page }) => {
      // In weight mode, set inputs
      await page.locator('#refWeight').fill('100');
      await page.locator('#refReps').fill('10');
      await page.locator('#targetReps').fill('5');

      const weightOutput = await page.locator('#outputWeight').textContent();

      // Switch to reps mode
      await page.locator('#toggleReps').click();

      // The calculated weight should now be the input
      const targetWeightInput = await page.locator('#targetWeight').inputValue();
      expect(targetWeightInput).toBe(weightOutput);
    });
  });

  test.describe('Validation', () => {
    test('shows validation error for empty weight', async ({ page }) => {
      await page.locator('#refWeight').fill('');
      await page.locator('#refWeight').blur();

      await expect(page.locator('#refWeight')).toHaveClass(/invalid/);
      await expect(page.locator('#outputWeight')).toHaveText('—');
    });

    test('shows validation error for negative reps', async ({ page }) => {
      await page.locator('#refReps').fill('-1');

      await expect(page.locator('#refReps')).toHaveClass(/invalid/);
      await expect(page.locator('#refRepsError')).toHaveText('Reps must be ≥ 0');
      await expect(page.locator('#outputWeight')).toHaveText('—');
    });

    test('shows validation error for reps > 50', async ({ page }) => {
      await page.locator('#refReps').fill('51');

      await expect(page.locator('#refReps')).toHaveClass(/invalid/);
      await expect(page.locator('#refRepsError')).toHaveText('Reps must be ≤ 50');
    });

    test('shows validation error for RPE > 10', async ({ page }) => {
      await page.locator('#refRPE').fill('11');

      await expect(page.locator('#refRPE')).toHaveClass(/invalid/);
      await expect(page.locator('#refRPEError')).toHaveText('RPE must be ≤ 10');
    });

    test('shows validation error for zero weight', async ({ page }) => {
      await page.locator('#refWeight').fill('0');

      await expect(page.locator('#refWeight')).toHaveClass(/invalid/);
      await expect(page.locator('#refWeightError')).toHaveText('Weight must be positive');
    });

    test('clears validation when input becomes valid', async ({ page }) => {
      // Make invalid
      await page.locator('#refReps').fill('-1');
      await expect(page.locator('#refReps')).toHaveClass(/invalid/);

      // Make valid
      await page.locator('#refReps').fill('5');
      await expect(page.locator('#refReps')).not.toHaveClass(/invalid/);
      await expect(page.locator('#refRepsError')).toHaveText('');
    });

    test('accepts 0 reps', async ({ page }) => {
      await page.locator('#refReps').fill('0');
      await expect(page.locator('#refReps')).not.toHaveClass(/invalid/);
    });

    test('accepts fractional values', async ({ page }) => {
      await page.locator('#refWeight').fill('45.5');
      await page.locator('#refRPE').fill('7.5');

      await expect(page.locator('#refWeight')).not.toHaveClass(/invalid/);
      await expect(page.locator('#refRPE')).not.toHaveClass(/invalid/);
    });
  });

  test.describe('Equipment Selection', () => {
    test('defaults to no equipment', async ({ page }) => {
      const equipment = page.locator('#equipment');
      await expect(equipment).toHaveValue('0');
    });

    test('base weight input is always visible', async ({ page }) => {
      // Base weight input should always be visible
      await expect(page.locator('#customWeightGroup')).toBeVisible();
      await expect(page.locator('#customWeight')).toBeVisible();
    });

    test('enables custom weight input when custom is selected', async ({ page }) => {
      // Input should be disabled initially (for preset equipment)
      await expect(page.locator('#customWeight')).toBeDisabled();

      await page.locator('#equipment').selectOption('custom');

      // Input should now be enabled
      await expect(page.locator('#customWeight')).toBeEnabled();
    });

    test('disables custom weight input when switching away from custom', async ({ page }) => {
      await page.locator('#equipment').selectOption('custom');
      await expect(page.locator('#customWeight')).toBeEnabled();

      await page.locator('#equipment').selectOption('0');
      await expect(page.locator('#customWeight')).toBeDisabled();
    });

    test('updates calculation when equipment changes', async ({ page }) => {
      // Set reference with no equipment
      await page.locator('#refWeight').fill('100');
      await page.locator('#refReps').fill('10');
      const outputNoEquipment = await page.locator('#outputWeight').textContent();

      // Switch to smith machine (25 lbs base)
      await page.locator('#equipment').selectOption('25');
      const outputWithEquipment = await page.locator('#outputWeight').textContent();

      // Output plate weight increases because reference total weight increases,
      // which increases e1RM, which increases target total weight proportionally
      expect(parseFloat(outputWithEquipment)).toBeGreaterThan(parseFloat(outputNoEquipment));
    });

    test('uses custom equipment weight in calculations', async ({ page }) => {
      await page.locator('#equipment').selectOption('custom');
      await page.locator('#customWeight').fill('45');

      await page.locator('#refWeight').fill('100');
      await page.locator('#refReps').fill('10');

      const output = await page.locator('#outputWeight').textContent();
      expect(parseFloat(output)).toBeGreaterThan(0);
    });

    test('handles all preset equipment options', async ({ page }) => {
      const options = ['0', '25', '167'];

      for (const value of options) {
        await page.locator('#equipment').selectOption(value);
        const output = await page.locator('#outputWeight').textContent();
        expect(output).not.toBe('—');
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('handles very high reference weight', async ({ page }) => {
      await page.locator('#refWeight').fill('1000');
      await page.locator('#refReps').fill('10');

      const output = await page.locator('#outputWeight').textContent();
      expect(parseFloat(output)).toBeGreaterThan(100);
    });

    test('handles very low target reps', async ({ page }) => {
      await page.locator('#targetReps').fill('1');

      const output = await page.locator('#outputWeight').textContent();
      expect(parseFloat(output)).toBeGreaterThan(0);
    });

    test('handles maximum reps (50)', async ({ page }) => {
      await page.locator('#refReps').fill('50');

      const output = await page.locator('#outputWeight').textContent();
      expect(output).not.toBe('—');
    });

    test('handles minimum RPE values', async ({ page }) => {
      await page.locator('#refRPE').fill('0.5');

      const output = await page.locator('#outputWeight').textContent();
      expect(output).not.toBe('—');
    });

    test('recalculates when all inputs are changed rapidly', async ({ page }) => {
      await page.locator('#refWeight').fill('150');
      await page.locator('#refReps').fill('8');
      await page.locator('#refRPE').fill('8.5');
      await page.locator('#targetReps').fill('3');
      await page.locator('#targetRPE').fill('7');

      const output = await page.locator('#outputWeight').textContent();
      expect(output).not.toBe('—');
      expect(parseFloat(output)).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#refWeight')).toBeVisible();
      await expect(page.locator('#outputWeight')).toBeVisible();

      // Can still interact
      await page.locator('#refWeight').fill('100');
      const output = await page.locator('#outputWeight').textContent();
      expect(output).not.toBe('—');
    });
  });

  // TODO: Add PWA Functionality tests with proper integration testing
  // Service worker registration tests are unreliable in current Playwright setup
  // due to Blob URL registration and environment-specific behavior.
  // Consider implementing with real service worker files and more robust timing.
});
