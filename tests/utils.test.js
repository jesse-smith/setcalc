import { describe, test, expect, beforeEach } from 'vitest';
import {
  getBaseWeight,
  clearOutputs,
  getWeightIncrement,
  hasEnumeratedWeights,
  getEnumeratedWeights,
  roundToIncrement,
  roundToIncrementDown,
  roundToIncrementUp,
  roundToEnumerated,
  roundToEnumeratedDown,
  roundToEnumeratedUp,
  roundWeight,
  roundWeightDown,
  roundWeightUp,
  EQUIPMENT_CONFIG
} from '../src/utils.js';

function cleanup() {
  document.body.innerHTML = '';
}

describe('getBaseWeight', () => {
  beforeEach(cleanup);

  test('returns numeric value from select (preset equipment)', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="25" selected>Smith Machine</option>';
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = '25';
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(25);
  });

  test('returns custom weight when custom is selected', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = '45';
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(45);
  });

  test('returns 0 for custom equipment with invalid input', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = 'abc'; // NaN case
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(0);
  });

  test('returns 0 for invalid select value', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="" selected>Select</option>';
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = '';
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(0);
  });
});

describe('clearOutputs', () => {
  beforeEach(cleanup);

  test('clears all six output elements', () => {
    const outputReps = document.createElement('span');
    outputReps.id = 'outputReps';
    outputReps.textContent = '10';

    const outputWeight = document.createElement('span');
    outputWeight.id = 'outputWeight';
    outputWeight.textContent = '100';

    const outputRPE = document.createElement('span');
    outputRPE.id = 'outputRPE';
    outputRPE.textContent = '8';

    const roundedWeight = document.createElement('span');
    roundedWeight.id = 'roundedWeight';
    roundedWeight.textContent = '100';

    const roundedReps = document.createElement('span');
    roundedReps.id = 'roundedReps';
    roundedReps.textContent = '10';

    const roundedRPE = document.createElement('span');
    roundedRPE.id = 'roundedRPE';
    roundedRPE.textContent = '8';

    document.body.appendChild(outputReps);
    document.body.appendChild(outputWeight);
    document.body.appendChild(outputRPE);
    document.body.appendChild(roundedWeight);
    document.body.appendChild(roundedReps);
    document.body.appendChild(roundedRPE);

    clearOutputs();

    expect(outputReps.textContent).toBe('—');
    expect(outputWeight.textContent).toBe('—');
    expect(outputRPE.textContent).toBe('—');
    expect(roundedWeight.textContent).toBe('—');
    expect(roundedReps.textContent).toBe('—');
    expect(roundedRPE.textContent).toBe('—');
  });
});

describe('getWeightIncrement', () => {
  beforeEach(cleanup);

  test('returns numeric value from input', () => {
    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '5';
    document.body.appendChild(input);

    expect(getWeightIncrement()).toBe(5);
  });

  test('returns null for invalid input', () => {
    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = 'abc';
    document.body.appendChild(input);

    expect(getWeightIncrement()).toBe(null);
  });

  test('returns null for empty input', () => {
    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '';
    document.body.appendChild(input);

    expect(getWeightIncrement()).toBe(null);
  });
});

describe('hasEnumeratedWeights', () => {
  beforeEach(cleanup);

  test('returns true for dumbbells', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="dumbbells" selected>Dumbbells</option>';
    document.body.appendChild(select);

    expect(hasEnumeratedWeights()).toBe(true);
  });

  test('returns false for standard equipment', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="25" selected>Smith Machine</option>';
    document.body.appendChild(select);

    expect(hasEnumeratedWeights()).toBe(false);
  });

  test('returns false for custom equipment', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    expect(hasEnumeratedWeights()).toBe(false);
  });
});

describe('getEnumeratedWeights', () => {
  beforeEach(cleanup);

  test('returns weights array for dumbbells', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="dumbbells" selected>Dumbbells</option>';
    document.body.appendChild(select);

    expect(getEnumeratedWeights()).toEqual([3, 5, 8, 10, 12, 15, 17.5, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]);
  });

  test('returns null for standard equipment', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="25" selected>Smith Machine</option>';
    document.body.appendChild(select);

    expect(getEnumeratedWeights()).toBe(null);
  });
});

describe('roundToIncrement', () => {
  test('rounds to nearest increment (down)', () => {
    expect(roundToIncrement(112, 5)).toBe(110);
  });

  test('rounds to nearest increment (up)', () => {
    expect(roundToIncrement(113, 5)).toBe(115);
  });

  test('rounds exactly at midpoint (up)', () => {
    expect(roundToIncrement(112.5, 5)).toBe(115);
  });

  test('handles fractional increments', () => {
    expect(roundToIncrement(11, 2.5)).toBe(10);
    expect(roundToIncrement(11.5, 2.5)).toBe(12.5);
  });

  test('returns weight unchanged for zero or negative increment', () => {
    expect(roundToIncrement(112, 0)).toBe(112);
    expect(roundToIncrement(112, -5)).toBe(112);
  });
});

describe('roundToIncrementDown', () => {
  test('rounds down to nearest increment', () => {
    expect(roundToIncrementDown(113, 5)).toBe(110);
    expect(roundToIncrementDown(117, 5)).toBe(115);
  });

  test('returns exact value if already on increment', () => {
    expect(roundToIncrementDown(115, 5)).toBe(115);
  });

  test('handles fractional increments', () => {
    expect(roundToIncrementDown(11.3, 2.5)).toBe(10);
  });

  test('returns weight unchanged for zero or negative increment', () => {
    expect(roundToIncrementDown(112, 0)).toBe(112);
    expect(roundToIncrementDown(112, -5)).toBe(112);
  });
});

describe('roundToIncrementUp', () => {
  test('rounds up to nearest increment', () => {
    expect(roundToIncrementUp(111, 5)).toBe(115);
    expect(roundToIncrementUp(113, 5)).toBe(115);
  });

  test('returns exact value if already on increment', () => {
    expect(roundToIncrementUp(115, 5)).toBe(115);
  });

  test('handles fractional increments', () => {
    expect(roundToIncrementUp(10.1, 2.5)).toBe(12.5);
  });

  test('returns weight unchanged for zero or negative increment', () => {
    expect(roundToIncrementUp(112, 0)).toBe(112);
    expect(roundToIncrementUp(112, -5)).toBe(112);
  });
});

describe('roundToEnumerated', () => {
  const weights = [3, 5, 8, 10, 12, 15, 17.5, 20];

  test('rounds to exact match', () => {
    expect(roundToEnumerated(10, weights)).toBe(10);
  });

  test('rounds down to nearest', () => {
    expect(roundToEnumerated(6, weights)).toBe(5);
  });

  test('rounds up to nearest', () => {
    expect(roundToEnumerated(7, weights)).toBe(8);
  });

  test('handles midpoint (rounds to lower)', () => {
    expect(roundToEnumerated(6.5, weights)).toBe(5);
  });

  test('handles value below minimum', () => {
    expect(roundToEnumerated(1, weights)).toBe(3);
  });

  test('handles value above maximum', () => {
    expect(roundToEnumerated(25, weights)).toBe(20);
  });

  test('returns weight unchanged for empty array', () => {
    expect(roundToEnumerated(10, [])).toBe(10);
  });

  test('returns weight unchanged for null array', () => {
    expect(roundToEnumerated(10, null)).toBe(10);
  });
});

describe('roundToEnumeratedDown', () => {
  const weights = [3, 5, 8, 10, 12, 15, 17.5, 20];

  test('rounds down to nearest available weight', () => {
    expect(roundToEnumeratedDown(11, weights)).toBe(10);
    expect(roundToEnumeratedDown(14, weights)).toBe(12);
  });

  test('returns exact match', () => {
    expect(roundToEnumeratedDown(10, weights)).toBe(10);
  });

  test('returns minimum when below all weights', () => {
    expect(roundToEnumeratedDown(1, weights)).toBe(3);
  });

  test('returns weight unchanged for empty array', () => {
    expect(roundToEnumeratedDown(10, [])).toBe(10);
  });
});

describe('roundToEnumeratedUp', () => {
  const weights = [3, 5, 8, 10, 12, 15, 17.5, 20];

  test('rounds up to nearest available weight', () => {
    expect(roundToEnumeratedUp(9, weights)).toBe(10);
    expect(roundToEnumeratedUp(11, weights)).toBe(12);
  });

  test('returns exact match', () => {
    expect(roundToEnumeratedUp(10, weights)).toBe(10);
  });

  test('returns maximum when above all weights', () => {
    expect(roundToEnumeratedUp(25, weights)).toBe(20);
  });

  test('returns weight unchanged for empty array', () => {
    expect(roundToEnumeratedUp(10, [])).toBe(10);
  });
});

describe('roundWeight', () => {
  beforeEach(cleanup);

  test('rounds using increment for standard equipment', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="25" selected>Smith Machine</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '5';
    document.body.appendChild(input);

    expect(roundWeight(113)).toBe(115);
  });

  test('rounds using enumerated weights for dumbbells', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="dumbbells" selected>Dumbbells</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '';
    document.body.appendChild(input);

    expect(roundWeight(11)).toBe(10);
  });

  test('returns weight unchanged when no increment set', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '';
    document.body.appendChild(input);

    expect(roundWeight(113)).toBe(113);
  });
});

describe('roundWeightDown', () => {
  beforeEach(cleanup);

  test('rounds down using increment for standard equipment', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="25" selected>Smith Machine</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '5';
    document.body.appendChild(input);

    expect(roundWeightDown(117)).toBe(115);
  });

  test('rounds down using enumerated weights for dumbbells', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="dumbbells" selected>Dumbbells</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '';
    document.body.appendChild(input);

    expect(roundWeightDown(11)).toBe(10);
  });

  test('returns weight unchanged when no increment set', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '';
    document.body.appendChild(input);

    expect(roundWeightDown(113)).toBe(113);
  });
});

describe('roundWeightUp', () => {
  beforeEach(cleanup);

  test('rounds up using increment for standard equipment', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="25" selected>Smith Machine</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '5';
    document.body.appendChild(input);

    expect(roundWeightUp(111)).toBe(115);
  });

  test('rounds up using enumerated weights for dumbbells', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="dumbbells" selected>Dumbbells</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '';
    document.body.appendChild(input);

    expect(roundWeightUp(9)).toBe(10);
  });

  test('returns weight unchanged when no increment set', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const input = document.createElement('input');
    input.id = 'weightIncrement';
    input.value = '';
    document.body.appendChild(input);

    expect(roundWeightUp(113)).toBe(113);
  });
});

describe('EQUIPMENT_CONFIG', () => {
  test('contains expected equipment types', () => {
    expect(EQUIPMENT_CONFIG).toHaveProperty('0');
    expect(EQUIPMENT_CONFIG).toHaveProperty('25');
    expect(EQUIPMENT_CONFIG).toHaveProperty('167');
    expect(EQUIPMENT_CONFIG).toHaveProperty('dumbbells');
    expect(EQUIPMENT_CONFIG).toHaveProperty('dumbbells_x2');
    expect(EQUIPMENT_CONFIG).toHaveProperty('cable_purple');
    expect(EQUIPMENT_CONFIG).toHaveProperty('custom');
  });

  test('has correct structure for increment-based equipment', () => {
    expect(EQUIPMENT_CONFIG['25']).toEqual({ baseWeight: 25, increment: 5 });
  });

  test('has correct structure for enumerated equipment', () => {
    expect(EQUIPMENT_CONFIG['dumbbells']).toEqual({
      baseWeight: 0,
      weights: [3, 5, 8, 10, 12, 15, 17.5, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
    });
  });

  test('dumbbells_x2 has doubled weights', () => {
    expect(EQUIPMENT_CONFIG['dumbbells_x2']).toEqual({
      baseWeight: 0,
      weights: [6, 10, 16, 20, 24, 30, 35, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140]
    });
  });

  test('cable_purple has correct increment', () => {
    expect(EQUIPMENT_CONFIG['cable_purple']).toEqual({
      baseWeight: 0,
      increment: 2.5
    });
  });
});
