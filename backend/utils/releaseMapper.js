import { computeStatus } from './status.js';
import { DEFAULT_STEPS } from '../constants/index.js';

/**
 * Map a Prisma release record to API response shape (with status and steps).
 * @param {object} release - Raw release from repository
 * @returns {object} - Release shaped for API response
 */
export function toReleaseResponse(release) {
  const stepsCompleted = Array.isArray(release.stepsCompleted)
    ? release.stepsCompleted
    : [];

  return {
    ...release,
    additional_info: release.additionalInfo,
    steps_completed: stepsCompleted,
    created_at: release.createdAt,
    updated_at: release.updatedAt,
    status: computeStatus(stepsCompleted),
    steps: DEFAULT_STEPS.map((name, index) => ({
      name,
      completed: stepsCompleted[index] ?? false
    }))
  };
}
