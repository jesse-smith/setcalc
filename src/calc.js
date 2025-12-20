/**
 * Berger equation for estimating 1RM from submaximal sets
 * pct = 100 * exp(0.0262 * (effectiveReps - 1))
 *
 * @param {number} reps - Actual reps performed
 * @param {number} rpe - Rate of Perceived Exertion (0-10 scale)
 * @returns {number} Percentage of 1RM
 */
export function getPct(reps, rpe) {
  const repsInReserve = 10 - rpe;
  const effectiveReps = reps + repsInReserve;
  return 100 * Math.exp(0.0262 * (effectiveReps - 1));
}

/**
 * Inverse Berger equation: calculate reps from percentage
 * reps = 1 + ln(pct / 100) / 0.0262
 *
 * @param {number} pct - Percentage of 1RM
 * @param {number} rpe - Rate of Perceived Exertion (0-10 scale)
 * @returns {number} Number of reps (always >= 0)
 */
export function getRepsFromPct(pct, rpe) {
  const repsInReserve = 10 - rpe;
  const effectiveReps = 1 + Math.log(pct / 100) / 0.0262;
  return Math.max(0, effectiveReps - repsInReserve);
}
