import { describe, test, expect } from 'vitest';
import { getPct, getRepsFromPct } from '../src/calc.js';

describe('getPct', () => {
  test('calculates percentage correctly using Berger equation', () => {
    // Test known values
    expect(getPct(1, 10)).toBeCloseTo(100, 2); // 1RM at RPE 10

    // Verify formula: pct = 100 * exp(0.0262 * (effectiveReps - 1))
    // At 5 reps, RPE 8: effectiveReps = 5 + (10-8) = 7
    const expected = 100 * Math.exp(0.0262 * (7 - 1));
    expect(getPct(5, 8)).toBeCloseTo(expected, 10);
  });

  test('handles edge cases', () => {
    // Zero reps
    expect(getPct(0, 10)).toBeLessThan(100);

    // Fractional RPE
    const pct7 = getPct(5, 7);
    const pct75 = getPct(5, 7.5);
    const pct8 = getPct(5, 8);
    expect(pct75).toBeGreaterThan(pct8);
    expect(pct75).toBeLessThan(pct7);
  });
});

describe('getRepsFromPct', () => {
  test('calculates reps correctly using inverse Berger equation', () => {
    // Test known values
    expect(getRepsFromPct(100, 10)).toBeCloseTo(1, 2); // 100% at RPE 10 = 1 rep

    // Verify formula: reps = max(0, 1 + ln(pct/100)/0.0262 - RIR)
    const pct = 120;
    const rpe = 8;
    const rir = 10 - rpe;
    const effectiveReps = 1 + Math.log(pct / 100) / 0.0262;
    const expected = Math.max(0, effectiveReps - rir);
    expect(getRepsFromPct(pct, rpe)).toBeCloseTo(expected, 10);
  });

  test('never returns negative reps (Math.max protection)', () => {
    // Low percentage + high RIR could mathematically give negative reps
    // but function should return 0
    expect(getRepsFromPct(80, 5)).toBeGreaterThanOrEqual(0);
    expect(getRepsFromPct(50, 2)).toBeGreaterThanOrEqual(0);
  });
});

describe('getPct and getRepsFromPct round-trip consistency', () => {
  test('functions are true inverses of each other', () => {
    const testCases = [
      { reps: 1, rpe: 10 },
      { reps: 5, rpe: 8 },
      { reps: 10, rpe: 9 },
      { reps: 0, rpe: 10 },
      { reps: 3, rpe: 7.5 }
    ];

    testCases.forEach(({ reps, rpe }) => {
      const pct = getPct(reps, rpe);
      const recoveredReps = getRepsFromPct(pct, rpe);
      expect(recoveredReps).toBeCloseTo(reps, 2);
    });
  });
});
