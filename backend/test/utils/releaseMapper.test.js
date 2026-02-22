import { describe, it, expect } from 'vitest';
import { toReleaseResponse } from '../../utils/releaseMapper.js';
import { DEFAULT_STEPS } from '../../constants/index.js';

describe('toReleaseResponse', () => {
  it('should map a release to API response format', () => {
    const release = {
      id: '123',
      name: 'v1.0.0',
      date: new Date('2024-01-01'),
      additionalInfo: 'Test release',
      stepsCompleted: [true, false, true, false, false, false, false],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02')
    };

    const result = toReleaseResponse(release);

    expect(result.id).toBe('123');
    expect(result.name).toBe('v1.0.0');
    expect(result.additional_info).toBe('Test release');
    expect(result.steps_completed).toEqual([true, false, true, false, false, false, false]);
    expect(result.created_at).toBe(release.createdAt);
    expect(result.updated_at).toBe(release.updatedAt);
    expect(result.status).toBe('ongoing');
    expect(result.steps).toHaveLength(DEFAULT_STEPS.length);
    expect(result.steps[0]).toEqual({ name: DEFAULT_STEPS[0], completed: true });
    expect(result.steps[1]).toEqual({ name: DEFAULT_STEPS[1], completed: false });
  });

  it('should handle null additionalInfo', () => {
    const release = {
      id: '123',
      name: 'v1.0.0',
      date: new Date('2024-01-01'),
      additionalInfo: null,
      stepsCompleted: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    const result = toReleaseResponse(release);

    expect(result.additional_info).toBeNull();
    expect(result.status).toBe('planned');
  });

  it('should handle non-array stepsCompleted', () => {
    const release = {
      id: '123',
      name: 'v1.0.0',
      date: new Date('2024-01-01'),
      additionalInfo: null,
      stepsCompleted: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    const result = toReleaseResponse(release);

    expect(result.steps_completed).toEqual([]);
    expect(result.status).toBe('planned');
    expect(result.steps.every(step => step.completed === false)).toBe(true);
  });

  it('should map all steps correctly when all completed', () => {
    const release = {
      id: '123',
      name: 'v1.0.0',
      date: new Date('2024-01-01'),
      additionalInfo: null,
      stepsCompleted: new Array(DEFAULT_STEPS.length).fill(true),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    const result = toReleaseResponse(release);

    expect(result.status).toBe('done');
    expect(result.steps.every(step => step.completed === true)).toBe(true);
  });
});
