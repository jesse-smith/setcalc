import { describe, test, expect, beforeEach } from 'vitest';
import { getBaseWeight, clearOutputs } from '../src/utils.js';

function cleanup() {
  document.body.innerHTML = '';
}

describe('getBaseWeight', () => {
  beforeEach(cleanup);

  test('returns 0 when equipment is "None" (value="0")', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="0" selected>None</option>';
    document.body.appendChild(select);

    expect(getBaseWeight()).toBe(0);
  });

  test('returns 25 when equipment is "Smith Machine"', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = `
      <option value="0">None</option>
      <option value="25" selected>Smith Machine</option>
    `;
    document.body.appendChild(select);

    expect(getBaseWeight()).toBe(25);
  });

  test('returns 167 when equipment is "45° Leg Press"', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = `
      <option value="0">None</option>
      <option value="167" selected>45° Leg Press</option>
    `;
    document.body.appendChild(select);

    expect(getBaseWeight()).toBe(167);
  });

  test('returns custom weight when equipment is "Custom"', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = `
      <option value="0">None</option>
      <option value="custom" selected>Custom</option>
    `;
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = '45';
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(45);
  });

  test('returns 0 for custom equipment with empty input', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = '';
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(0);
  });

  test('returns 0 for custom equipment with non-numeric input', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = 'abc';
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(0);
  });

  test('handles fractional custom weight', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = '12.5';
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(12.5);
  });

  test('returns 0 for custom equipment with 0 input', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="custom" selected>Custom</option>';
    document.body.appendChild(select);

    const customInput = document.createElement('input');
    customInput.id = 'customWeight';
    customInput.value = '0';
    document.body.appendChild(customInput);

    expect(getBaseWeight()).toBe(0);
  });

  test('returns 0 when select has no value', () => {
    const select = document.createElement('select');
    select.id = 'equipment';
    select.innerHTML = '<option value="">Select</option>';
    document.body.appendChild(select);

    expect(getBaseWeight()).toBe(0);
  });
});

describe('clearOutputs', () => {
  beforeEach(cleanup);

  test('sets outputReps to em dash', () => {
    const output = document.createElement('span');
    output.id = 'outputReps';
    output.textContent = '10';
    document.body.appendChild(output);

    clearOutputs();
    expect(output.textContent).toBe('—');
  });

  test('sets outputWeight to em dash', () => {
    const output = document.createElement('span');
    output.id = 'outputWeight';
    output.textContent = '100';
    document.body.appendChild(output);

    clearOutputs();
    expect(output.textContent).toBe('—');
  });

  test('sets outputRPE to em dash', () => {
    const output = document.createElement('span');
    output.id = 'outputRPE';
    output.textContent = '8';
    document.body.appendChild(output);

    clearOutputs();
    expect(output.textContent).toBe('—');
  });

  test('clears all outputs at once', () => {
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

  test('handles already cleared outputs', () => {
    const output = document.createElement('span');
    output.id = 'outputReps';
    output.textContent = '—';
    document.body.appendChild(output);

    const output2 = document.createElement('span');
    output2.id = 'outputWeight';
    output2.textContent = '—';
    document.body.appendChild(output2);

    const output3 = document.createElement('span');
    output3.id = 'outputRPE';
    output3.textContent = '—';
    document.body.appendChild(output3);

    clearOutputs();

    expect(output.textContent).toBe('—');
    expect(output2.textContent).toBe('—');
    expect(output3.textContent).toBe('—');
  });
});
