/**
 * Utility functions for the calculator
 */

/**
 * Equipment configuration with base weight and rounding info
 * Each equipment can have either:
 * - increment: a number representing the weight step (e.g., 5 lbs)
 * - weights: an array of enumerated available weights (e.g., dumbbells)
 */
export const EQUIPMENT_CONFIG = {
  '0': { baseWeight: 0, increment: 5 },           // None
  '25': { baseWeight: 25, increment: 5 },         // Smith Machine
  '167': { baseWeight: 167, increment: 5 },       // 45° Leg Press
  'dumbbells': { baseWeight: 0, weights: [3, 5, 8, 10, 12, 15, 17.5, 20] },  // Dumbbells (x1)
  'custom': { baseWeight: 0, increment: 5 }       // Custom (default increment)
};

/**
 * Get equipment base weight (sled/bar weight that isn't loaded as plates)
 * @returns {number} Base weight in pounds
 */
export function getBaseWeight() {
  const customInput = document.getElementById('customWeight');
  const value = parseFloat(customInput.value);
  return isNaN(value) ? 0 : value;
}

/**
 * Get the weight increment value from the input
 * @returns {number|null} Increment value or null if not applicable
 */
export function getWeightIncrement() {
  const incrementInput = document.getElementById('weightIncrement');
  const value = parseFloat(incrementInput.value);
  return isNaN(value) ? null : value;
}

/**
 * Check if the current equipment uses enumerated weights
 * @returns {boolean} True if equipment uses enumerated weights
 */
export function hasEnumeratedWeights() {
  const equipmentSelect = document.getElementById('equipment');
  const config = EQUIPMENT_CONFIG[equipmentSelect.value];
  return config && Array.isArray(config.weights);
}

/**
 * Get the enumerated weights for current equipment
 * @returns {number[]|null} Array of weights or null if not enumerated
 */
export function getEnumeratedWeights() {
  const equipmentSelect = document.getElementById('equipment');
  const config = EQUIPMENT_CONFIG[equipmentSelect.value];
  return config && Array.isArray(config.weights) ? config.weights : null;
}

/**
 * Round a weight to the nearest increment
 * @param {number} weight - The weight to round
 * @param {number} increment - The increment to round to
 * @returns {number} The rounded weight
 */
export function roundToIncrement(weight, increment) {
  if (increment <= 0) return weight;
  return Math.round(weight / increment) * increment;
}

/**
 * Round a weight to the nearest enumerated value
 * @param {number} weight - The weight to round
 * @param {number[]} weights - Array of available weights (must be sorted ascending)
 * @returns {number} The closest available weight
 */
export function roundToEnumerated(weight, weights) {
  if (!weights || weights.length === 0) return weight;

  let closest = weights[0];
  let minDiff = Math.abs(weight - closest);

  for (let i = 1; i < weights.length; i++) {
    const diff = Math.abs(weight - weights[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = weights[i];
    }
  }

  return closest;
}

/**
 * Round a weight based on current equipment configuration
 * @param {number} weight - The weight to round
 * @returns {number} The rounded weight
 */
export function roundWeight(weight) {
  const enumeratedWeights = getEnumeratedWeights();
  if (enumeratedWeights) {
    return roundToEnumerated(weight, enumeratedWeights);
  }

  const increment = getWeightIncrement();
  if (increment && increment > 0) {
    return roundToIncrement(weight, increment);
  }

  return weight;
}

/**
 * Clear all output displays (set to em dash)
 */
export function clearOutputs() {
  document.getElementById('outputReps').textContent = '—';
  document.getElementById('outputWeight').textContent = '—';
  document.getElementById('outputRPE').textContent = '—';
  document.getElementById('roundedWeight').textContent = '—';
  document.getElementById('roundedReps').textContent = '—';
  document.getElementById('roundedRPE').textContent = '—';
}
