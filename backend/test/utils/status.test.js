import { describe, it, expect } from 'vitest';
import { computeStatus } from '../../utils/status.js';

describe('computeStatus', () => {
  it('should return "planned" when no steps are completed', () => {
    expect(computeStatus([false, false, false])).toBe('planned');
    expect(computeStatus([])).toBe('planned');
  });

  it('should return "ongoing" when some steps are completed', () => {
    expect(computeStatus([true, false, false])).toBe('ongoing');
    expect(computeStatus([true, true, false])).toBe('ongoing');
    expect(computeStatus([false, true, false])).toBe('ongoing');
  });

  it('should return "done" when all steps are completed', () => {
    expect(computeStatus([true, true, true])).toBe('done');
    expect(computeStatus([true])).toBe('done');
  });

  it('should return "planned" for non-array input', () => {
    expect(computeStatus(null)).toBe('planned');
    expect(computeStatus(undefined)).toBe('planned');
    expect(computeStatus('not an array')).toBe('planned');
    expect(computeStatus({})).toBe('planned');
  });

  it('should handle mixed boolean values correctly', () => {
    expect(computeStatus([true, false, true, false])).toBe('ongoing');
    expect(computeStatus([true, true, true, true])).toBe('done');
  });
});
