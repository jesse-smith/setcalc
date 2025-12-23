/**
 * Utility functions for the calculator
 */

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
 * Clear all output displays (set to em dash)
 */
export function clearOutputs() {
  document.getElementById('outputReps').textContent = '—';
  document.getElementById('outputWeight').textContent = '—';
  document.getElementById('outputRPE').textContent = '—';
}
