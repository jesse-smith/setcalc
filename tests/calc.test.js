import { describe, test, expect } from 'vitest';
import { getPct, getRepsFromPct } from '../src/calc.js';

describe('getPct', () => {
  test('returns 100 for 1 rep at RPE 10 (true 1RM)', () => {
    expect(getPct(1, 10)).toBeCloseTo(100, 2);
  });

  test('returns higher percentage for more reps at same RPE', () => {
    const pct5Reps = getPct(5, 10);
    const pct10Reps = getPct(10, 10);
    expect(pct10Reps).toBeGreaterThan(pct5Reps);
  });

  test('returns higher percentage for lower RPE at same reps', () => {
    const pctRPE10 = getPct(5, 10);
    const pctRPE8 = getPct(5, 8);
    expect(pctRPE8).toBeGreaterThan(pctRPE10);
  });

  test('handles 0 reps', () => {
    const pct = getPct(0, 10);
    expect(pct).toBeCloseTo(100 * Math.exp(0.0262 * (0 - 1)), 2);
    expect(pct).toBeLessThan(100);
  });

  test('handles maximum reps (50)', () => {
    const pct = getPct(50, 10);
    expect(pct).toBeGreaterThan(100);
    expect(pct).toBeLessThan(1000); // Reasonable upper bound
  });

  test('handles minimum RPE (effectively > 0)', () => {
    const pct = getPct(5, 0.5);
    expect(pct).toBeGreaterThan(getPct(5, 10));
  });

  test('handles maximum RPE (10)', () => {
    const pct = getPct(5, 10);
    expect(pct).toBeGreaterThan(100);
  });

  test('handles RPE 5 (5 RIR)', () => {
    const pct = getPct(5, 5);
    // Effective reps = 5 + (10 - 5) = 10
    const expected = 100 * Math.exp(0.0262 * (10 - 1));
    expect(pct).toBeCloseTo(expected, 2);
  });

  test('handles fractional RPE (7.5)', () => {
    const pct = getPct(5, 7.5);
    expect(pct).toBeGreaterThan(getPct(5, 8));
    expect(pct).toBeLessThan(getPct(5, 7));
  });

  test('Berger equation constant is 0.0262', () => {
    // Verify the constant by checking against known formula
    const reps = 5;
    const rpe = 8;
    const repsInReserve = 10 - rpe;
    const effectiveReps = reps + repsInReserve;
    const expected = 100 * Math.exp(0.0262 * (effectiveReps - 1));
    expect(getPct(reps, rpe)).toBeCloseTo(expected, 10);
  });

  test('reference test case: 100 lbs at 5 reps RPE 8', () => {
    // This is a known reference from the docs
    const pct = getPct(5, 8);
    expect(pct).toBeGreaterThan(100);
  });

  test('effective reps calculation is correct', () => {
    // At 5 reps, RPE 8 (2 RIR), effective reps = 7
    const pct = getPct(5, 8);
    const effectiveReps = 7;
    const expected = 100 * Math.exp(0.0262 * (effectiveReps - 1));
    expect(pct).toBeCloseTo(expected, 10);
  });
});

describe('getRepsFromPct', () => {
  test('returns 1 rep for 100% at RPE 10', () => {
    expect(getRepsFromPct(100, 10)).toBeCloseTo(1, 2);
  });

  test('returns 0 for 100% at lower RPE (has RIR)', () => {
    // At RPE 9 (1 RIR), 100% means effective reps = 1, actual reps = 0
    expect(getRepsFromPct(100, 9)).toBeCloseTo(0, 2);
  });

  test('returns higher reps for higher percentage at same RPE', () => {
    const reps1 = getRepsFromPct(110, 10);
    const reps2 = getRepsFromPct(130, 10);
    expect(reps2).toBeGreaterThan(reps1);
  });

  test('returns lower reps for lower RPE at same percentage', () => {
    const repsRPE10 = getRepsFromPct(120, 10);
    const repsRPE8 = getRepsFromPct(120, 8);
    expect(repsRPE8).toBeLessThan(repsRPE10);
  });

  test('never returns negative reps (Math.max ensures >= 0)', () => {
    // Even with very low percentage and high RIR
    const reps = getRepsFromPct(50, 5);
    expect(reps).toBeGreaterThanOrEqual(0);
  });

  test('handles very high percentage', () => {
    const reps = getRepsFromPct(200, 10);
    expect(reps).toBeGreaterThan(10);
    expect(reps).toBeLessThan(100); // Reasonable bound
  });

  test('handles fractional RPE', () => {
    const reps = getRepsFromPct(120, 7.5);
    expect(reps).toBeGreaterThan(getRepsFromPct(120, 8));
    expect(reps).toBeLessThan(getRepsFromPct(120, 7));
  });

  test('inverse function consistency: getPct then getRepsFromPct', () => {
    const originalReps = 5;
    const rpe = 8;
    const pct = getPct(originalReps, rpe);
    const recoveredReps = getRepsFromPct(pct, rpe);
    expect(recoveredReps).toBeCloseTo(originalReps, 2);
  });

  test('inverse function consistency: getRepsFromPct then getPct', () => {
    const originalPct = 120;
    const rpe = 7;
    const reps = getRepsFromPct(originalPct, rpe);
    const recoveredPct = getPct(reps, rpe);
    expect(recoveredPct).toBeCloseTo(originalPct, 2);
  });

  test('Berger inverse equation constant is 0.0262', () => {
    // Verify the constant by checking against known formula
    const pct = 120;
    const rpe = 8;
    const repsInReserve = 10 - rpe;
    const effectiveReps = 1 + Math.log(pct / 100) / 0.0262;
    const expected = Math.max(0, effectiveReps - repsInReserve);
    expect(getRepsFromPct(pct, rpe)).toBeCloseTo(expected, 10);
  });

  test('handles edge case: very low percentage', () => {
    // pct < 100 with RIR might result in negative effective reps
    // but function should return 0 (Math.max protection)
    const reps = getRepsFromPct(80, 5);
    expect(reps).toBeGreaterThanOrEqual(0);
  });
});

describe('getPct and getRepsFromPct integration', () => {
  test('round trip conversion maintains accuracy for various RPE values', () => {
    const testCases = [
      { reps: 1, rpe: 10 },
      { reps: 5, rpe: 8 },
      { reps: 10, rpe: 9 },
      { reps: 3, rpe: 7.5 },
      { reps: 0, rpe: 10 },
      { reps: 20, rpe: 6 }
    ];

    testCases.forEach(({ reps, rpe }) => {
      const pct = getPct(reps, rpe);
      const recoveredReps = getRepsFromPct(pct, rpe);
      expect(recoveredReps).toBeCloseTo(reps, 2);
    });
  });
});
