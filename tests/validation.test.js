import { describe, test, expect, beforeEach } from 'vitest';
import {
  setInvalid,
  setEmpty,
  clearValidation,
  validateReps,
  validateWeight,
  validateRPE,
  validateCustomWeight
} from '../src/validation.js';

// Helper to create a mock input element with error element
function createMockInput(id, value = '') {
  const input = document.createElement('input');
  input.id = id;
  input.value = value;

  const errorDiv = document.createElement('div');
  errorDiv.id = `${id}Error`;

  document.body.appendChild(input);
  document.body.appendChild(errorDiv);

  return { input, errorDiv };
}

// Clean up DOM after each test
function cleanup() {
  document.body.innerHTML = '';
}

describe('setInvalid', () => {
  beforeEach(cleanup);

  test('adds invalid class to input', () => {
    const { input } = createMockInput('testInput');
    setInvalid('testInput', 'Error message');
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('sets error message text', () => {
    const { errorDiv } = createMockInput('testInput');
    setInvalid('testInput', 'Error message');
    expect(errorDiv.textContent).toBe('Error message');
  });

  test('handles different error messages', () => {
    const { errorDiv } = createMockInput('testInput');
    setInvalid('testInput', 'Custom error');
    expect(errorDiv.textContent).toBe('Custom error');
  });
});

describe('setEmpty', () => {
  beforeEach(cleanup);

  test('adds invalid class to input', () => {
    const { input } = createMockInput('testInput');
    setEmpty('testInput');
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('sets empty error message', () => {
    const { errorDiv } = createMockInput('testInput');
    setEmpty('testInput');
    expect(errorDiv.textContent).toBe('');
  });

  test('clears previous error message', () => {
    const { errorDiv } = createMockInput('testInput');
    errorDiv.textContent = 'Previous error';
    setEmpty('testInput');
    expect(errorDiv.textContent).toBe('');
  });
});

describe('clearValidation', () => {
  beforeEach(cleanup);

  test('removes invalid class', () => {
    const { input } = createMockInput('testInput');
    input.classList.add('invalid');
    clearValidation('testInput');
    expect(input.classList.contains('invalid')).toBe(false);
  });

  test('clears error message', () => {
    const { errorDiv } = createMockInput('testInput');
    errorDiv.textContent = 'Error message';
    clearValidation('testInput');
    expect(errorDiv.textContent).toBe('');
  });

  test('handles already clear state', () => {
    createMockInput('testInput');
    clearValidation('testInput');
    // Should not throw
    expect(true).toBe(true);
  });
});

describe('validateReps', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('reps', '');
    expect(validateReps('reps')).toBeNull();
  });

  test('marks empty input as invalid', () => {
    const { input } = createMockInput('reps', '');
    validateReps('reps');
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('returns valid value for positive number', () => {
    createMockInput('reps', '5');
    expect(validateReps('reps')).toBe(5);
  });

  test('accepts 0 reps', () => {
    createMockInput('reps', '0');
    expect(validateReps('reps')).toBe(0);
  });

  test('accepts maximum reps (50)', () => {
    createMockInput('reps', '50');
    expect(validateReps('reps')).toBe(50);
  });

  test('rejects negative reps', () => {
    const { input } = createMockInput('reps', '-1');
    expect(validateReps('reps')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('rejects reps > 50', () => {
    const { input, errorDiv } = createMockInput('reps', '51');
    expect(validateReps('reps')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('Reps must be ≤ 50');
  });

  test('rejects non-numeric input', () => {
    const { input, errorDiv } = createMockInput('reps', 'abc');
    expect(validateReps('reps')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('Reps must be ≥ 0');
  });

  test('accepts fractional reps', () => {
    createMockInput('reps', '5.5');
    expect(validateReps('reps')).toBe(5.5);
  });

  test('clears validation for valid input', () => {
    const { input } = createMockInput('reps', '10');
    input.classList.add('invalid');
    validateReps('reps');
    expect(input.classList.contains('invalid')).toBe(false);
  });
});

describe('validateWeight', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('weight', '');
    expect(validateWeight('weight')).toBeNull();
  });

  test('marks empty input as invalid', () => {
    const { input } = createMockInput('weight', '');
    validateWeight('weight');
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('returns valid value for positive number', () => {
    createMockInput('weight', '100');
    expect(validateWeight('weight')).toBe(100);
  });

  test('rejects 0 weight', () => {
    const { input, errorDiv } = createMockInput('weight', '0');
    expect(validateWeight('weight')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('Weight must be positive');
  });

  test('rejects negative weight', () => {
    const { input, errorDiv } = createMockInput('weight', '-10');
    expect(validateWeight('weight')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('Weight must be positive');
  });

  test('rejects non-numeric input', () => {
    const { input } = createMockInput('weight', 'xyz');
    expect(validateWeight('weight')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('accepts fractional weight', () => {
    createMockInput('weight', '45.5');
    expect(validateWeight('weight')).toBe(45.5);
  });

  test('accepts very large weight', () => {
    createMockInput('weight', '1000');
    expect(validateWeight('weight')).toBe(1000);
  });

  test('clears validation for valid input', () => {
    const { input } = createMockInput('weight', '100');
    input.classList.add('invalid');
    validateWeight('weight');
    expect(input.classList.contains('invalid')).toBe(false);
  });
});

describe('validateRPE', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('rpe', '');
    expect(validateRPE('rpe')).toBeNull();
  });

  test('marks empty input as invalid', () => {
    const { input } = createMockInput('rpe', '');
    validateRPE('rpe');
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('returns valid value for positive number', () => {
    createMockInput('rpe', '8');
    expect(validateRPE('rpe')).toBe(8);
  });

  test('accepts RPE 10', () => {
    createMockInput('rpe', '10');
    expect(validateRPE('rpe')).toBe(10);
  });

  test('accepts fractional RPE (7.5)', () => {
    createMockInput('rpe', '7.5');
    expect(validateRPE('rpe')).toBe(7.5);
  });

  test('accepts very low RPE', () => {
    createMockInput('rpe', '0.5');
    expect(validateRPE('rpe')).toBe(0.5);
  });

  test('rejects 0 RPE', () => {
    const { input, errorDiv } = createMockInput('rpe', '0');
    expect(validateRPE('rpe')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('RPE must be positive');
  });

  test('rejects negative RPE', () => {
    const { input } = createMockInput('rpe', '-1');
    expect(validateRPE('rpe')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('rejects RPE > 10', () => {
    const { input, errorDiv } = createMockInput('rpe', '11');
    expect(validateRPE('rpe')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('RPE must be ≤ 10');
  });

  test('rejects non-numeric input', () => {
    const { input } = createMockInput('rpe', 'high');
    expect(validateRPE('rpe')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('clears validation for valid input', () => {
    const { input } = createMockInput('rpe', '8.5');
    input.classList.add('invalid');
    validateRPE('rpe');
    expect(input.classList.contains('invalid')).toBe(false);
  });
});

describe('validateCustomWeight', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('customWeight', '');
    expect(validateCustomWeight('customWeight')).toBeNull();
  });

  test('marks empty input as invalid', () => {
    const { input } = createMockInput('customWeight', '');
    validateCustomWeight('customWeight');
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('accepts 0 (unlike validateWeight)', () => {
    createMockInput('customWeight', '0');
    expect(validateCustomWeight('customWeight')).toBe(0);
  });

  test('accepts positive weight', () => {
    createMockInput('customWeight', '25');
    expect(validateCustomWeight('customWeight')).toBe(25);
  });

  test('rejects negative weight', () => {
    const { input, errorDiv } = createMockInput('customWeight', '-5');
    expect(validateCustomWeight('customWeight')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('Base weight must be ≥ 0');
  });

  test('accepts fractional weight', () => {
    createMockInput('customWeight', '12.5');
    expect(validateCustomWeight('customWeight')).toBe(12.5);
  });

  test('rejects non-numeric input', () => {
    const { input } = createMockInput('customWeight', 'custom');
    expect(validateCustomWeight('customWeight')).toBeNull();
    expect(input.classList.contains('invalid')).toBe(true);
  });

  test('clears validation for valid input', () => {
    const { input } = createMockInput('customWeight', '45');
    input.classList.add('invalid');
    validateCustomWeight('customWeight');
    expect(input.classList.contains('invalid')).toBe(false);
  });
});
