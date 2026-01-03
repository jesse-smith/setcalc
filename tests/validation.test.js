import { describe, test, expect, beforeEach } from 'vitest';
import {
  setInvalid,
  setEmpty,
  clearValidation,
  validateReps,
  validateWeight,
  validateRPE,
  validateCustomWeight,
  validateIncrement
} from '../src/validation.js';

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

function cleanup() {
  document.body.innerHTML = '';
}

describe('validation helpers', () => {
  beforeEach(cleanup);

  test('setInvalid adds class and message', () => {
    const { input, errorDiv } = createMockInput('test');
    setInvalid('test', 'Error message');
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('Error message');
  });

  test('setEmpty adds class without message', () => {
    const { input, errorDiv } = createMockInput('test');
    setEmpty('test');
    expect(input.classList.contains('invalid')).toBe(true);
    expect(errorDiv.textContent).toBe('');
  });

  test('clearValidation removes class and message', () => {
    const { input, errorDiv } = createMockInput('test');
    input.classList.add('invalid');
    errorDiv.textContent = 'Error';
    clearValidation('test');
    expect(input.classList.contains('invalid')).toBe(false);
    expect(errorDiv.textContent).toBe('');
  });
});

describe('validateReps', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('reps', '');
    expect(validateReps('reps')).toBeNull();
  });

  test('returns value for valid input', () => {
    createMockInput('reps', '5');
    expect(validateReps('reps')).toBe(5);
  });

  test('accepts 0 reps (lower boundary)', () => {
    createMockInput('reps', '0');
    expect(validateReps('reps')).toBe(0);
  });

  test('accepts 50 reps (upper boundary)', () => {
    createMockInput('reps', '50');
    expect(validateReps('reps')).toBe(50);
  });

  test('rejects negative reps', () => {
    const { errorDiv } = createMockInput('reps', '-1');
    expect(validateReps('reps')).toBeNull();
    expect(errorDiv.textContent).toBe('Reps must be ≥ 0');
  });

  test('rejects reps > 50', () => {
    const { errorDiv } = createMockInput('reps', '51');
    expect(validateReps('reps')).toBeNull();
    expect(errorDiv.textContent).toBe('Reps must be ≤ 50');
  });

  test('rejects non-numeric input', () => {
    createMockInput('reps', 'abc');
    expect(validateReps('reps')).toBeNull();
  });
});

describe('validateWeight', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('weight', '');
    expect(validateWeight('weight')).toBeNull();
  });

  test('returns value for valid input', () => {
    createMockInput('weight', '100');
    expect(validateWeight('weight')).toBe(100);
  });

  test('rejects 0 weight', () => {
    const { errorDiv } = createMockInput('weight', '0');
    expect(validateWeight('weight')).toBeNull();
    expect(errorDiv.textContent).toBe('Weight must be positive');
  });

  test('rejects negative weight', () => {
    createMockInput('weight', '-10');
    expect(validateWeight('weight')).toBeNull();
  });

  test('rejects non-numeric input', () => {
    createMockInput('weight', 'xyz');
    expect(validateWeight('weight')).toBeNull();
  });
});

describe('validateRPE', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('rpe', '');
    expect(validateRPE('rpe')).toBeNull();
  });

  test('returns value for valid input', () => {
    createMockInput('rpe', '8');
    expect(validateRPE('rpe')).toBe(8);
  });

  test('accepts RPE 10 (upper boundary)', () => {
    createMockInput('rpe', '10');
    expect(validateRPE('rpe')).toBe(10);
  });

  test('accepts fractional RPE', () => {
    createMockInput('rpe', '7.5');
    expect(validateRPE('rpe')).toBe(7.5);
  });

  test('rejects 0 RPE', () => {
    const { errorDiv } = createMockInput('rpe', '0');
    expect(validateRPE('rpe')).toBeNull();
    expect(errorDiv.textContent).toBe('RPE must be positive');
  });

  test('rejects RPE > 10', () => {
    const { errorDiv } = createMockInput('rpe', '11');
    expect(validateRPE('rpe')).toBeNull();
    expect(errorDiv.textContent).toBe('RPE must be ≤ 10');
  });

  test('rejects non-numeric input', () => {
    createMockInput('rpe', 'high');
    expect(validateRPE('rpe')).toBeNull();
  });
});

describe('validateCustomWeight', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('custom', '');
    expect(validateCustomWeight('custom')).toBeNull();
  });

  test('returns value for valid input', () => {
    createMockInput('custom', '25');
    expect(validateCustomWeight('custom')).toBe(25);
  });

  test('accepts 0 (unlike validateWeight)', () => {
    createMockInput('custom', '0');
    expect(validateCustomWeight('custom')).toBe(0);
  });

  test('rejects negative weight', () => {
    const { errorDiv } = createMockInput('custom', '-5');
    expect(validateCustomWeight('custom')).toBeNull();
    expect(errorDiv.textContent).toBe('Base weight must be ≥ 0');
  });

  test('rejects non-numeric input', () => {
    createMockInput('custom', 'custom');
    expect(validateCustomWeight('custom')).toBeNull();
  });
});

describe('validateIncrement', () => {
  beforeEach(cleanup);

  test('returns null for empty input', () => {
    createMockInput('increment', '');
    expect(validateIncrement('increment')).toBeNull();
  });

  test('returns value for valid input', () => {
    createMockInput('increment', '5');
    expect(validateIncrement('increment')).toBe(5);
  });

  test('accepts fractional increment', () => {
    createMockInput('increment', '2.5');
    expect(validateIncrement('increment')).toBe(2.5);
  });

  test('rejects 0 increment', () => {
    const { errorDiv } = createMockInput('increment', '0');
    expect(validateIncrement('increment')).toBeNull();
    expect(errorDiv.textContent).toBe('Increment must be positive');
  });

  test('rejects negative increment', () => {
    const { errorDiv } = createMockInput('increment', '-5');
    expect(validateIncrement('increment')).toBeNull();
    expect(errorDiv.textContent).toBe('Increment must be positive');
  });

  test('rejects non-numeric input', () => {
    createMockInput('increment', 'abc');
    expect(validateIncrement('increment')).toBeNull();
  });
});
