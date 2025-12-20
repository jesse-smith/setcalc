import { describe, test, expect, beforeEach } from 'vitest';
import { getBaseWeight, clearOutputs } from '../src/utils.js';

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

    expect(getBaseWeight()).toBe(0);
  });
});

describe('clearOutputs', () => {
  beforeEach(cleanup);

  test('clears all three output elements', () => {
    const outputReps = document.createElement('span');
    outputReps.id = 'outputReps';
    outputReps.textContent = '10';

    const outputWeight = document.createElement('span');
    outputWeight.id = 'outputWeight';
    outputWeight.textContent = '100';

    const outputRPE = document.createElement('span');
    outputRPE.id = 'outputRPE';
    outputRPE.textContent = '8';

    document.body.appendChild(outputReps);
    document.body.appendChild(outputWeight);
    document.body.appendChild(outputRPE);

    clearOutputs();

    expect(outputReps.textContent).toBe('—');
    expect(outputWeight.textContent).toBe('—');
    expect(outputRPE.textContent).toBe('—');
  });
});
