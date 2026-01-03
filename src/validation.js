/**
 * Validation helpers for form inputs
 */

/**
 * Mark input as invalid with error message
 * @param {string} inputId - ID of the input element
 * @param {string} message - Error message to display
 */
export function setInvalid(inputId, message) {
  document.getElementById(inputId).classList.add('invalid');
  document.getElementById(inputId + 'Error').textContent = message;
}

/**
 * Mark input as empty (invalid but no message)
 * @param {string} inputId - ID of the input element
 */
export function setEmpty(inputId) {
  document.getElementById(inputId).classList.add('invalid');
  document.getElementById(inputId + 'Error').textContent = '';
}

/**
 * Clear validation state and error message
 * @param {string} inputId - ID of the input element
 */
export function clearValidation(inputId) {
  document.getElementById(inputId).classList.remove('invalid');
  document.getElementById(inputId + 'Error').textContent = '';
}

/**
 * Validate reps input (must be >= 0, <= 50)
 * @param {string} inputId - ID of the input element
 * @returns {number|null} Validated value or null if invalid
 */
export function validateReps(inputId) {
  const input = document.getElementById(inputId);
  if (input.value === '') {
    setEmpty(inputId);
    return null;
  }
  const value = parseFloat(input.value);
  if (isNaN(value) || value < 0) {
    setInvalid(inputId, 'Reps must be ≥ 0');
    return null;
  }
  if (value > 50) {
    setInvalid(inputId, 'Reps must be ≤ 50');
    return null;
  }
  clearValidation(inputId);
  return value;
}

/**
 * Validate weight input (must be > 0)
 * @param {string} inputId - ID of the input element
 * @returns {number|null} Validated value or null if invalid
 */
export function validateWeight(inputId) {
  const input = document.getElementById(inputId);
  if (input.value === '') {
    setEmpty(inputId);
    return null;
  }
  const value = parseFloat(input.value);
  if (isNaN(value) || value <= 0) {
    setInvalid(inputId, 'Weight must be positive');
    return null;
  }
  clearValidation(inputId);
  return value;
}

/**
 * Validate RPE input (must be > 0, <= 10)
 * @param {string} inputId - ID of the input element
 * @returns {number|null} Validated value or null if invalid
 */
export function validateRPE(inputId) {
  const input = document.getElementById(inputId);
  if (input.value === '') {
    setEmpty(inputId);
    return null;
  }
  const value = parseFloat(input.value);
  if (isNaN(value) || value <= 0) {
    setInvalid(inputId, 'RPE must be positive');
    return null;
  }
  if (value > 10) {
    setInvalid(inputId, 'RPE must be ≤ 10');
    return null;
  }
  clearValidation(inputId);
  return value;
}

/**
 * Validate custom weight input (must be >= 0, allows 0)
 * @param {string} inputId - ID of the input element
 * @returns {number|null} Validated value or null if invalid
 */
export function validateCustomWeight(inputId) {
  const input = document.getElementById(inputId);
  if (input.value === '') {
    setEmpty(inputId);
    return null;
  }
  const value = parseFloat(input.value);
  if (isNaN(value) || value < 0) {
    setInvalid(inputId, 'Base weight must be ≥ 0');
    return null;
  }
  clearValidation(inputId);
  return value;
}

/**
 * Validate weight increment input (must be > 0)
 * @param {string} inputId - ID of the input element
 * @returns {number|null} Validated value or null if invalid
 */
export function validateIncrement(inputId) {
  const input = document.getElementById(inputId);
  if (input.value === '') {
    setEmpty(inputId);
    return null;
  }
  const value = parseFloat(input.value);
  if (isNaN(value) || value <= 0) {
    setInvalid(inputId, 'Increment must be positive');
    return null;
  }
  clearValidation(inputId);
  return value;
}
