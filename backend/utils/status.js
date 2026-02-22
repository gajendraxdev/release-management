/**
 * Compute release status based on steps_completed array
 * @param {boolean[]} stepsCompleted - Array of boolean values
 * @returns {string} - Status: 'planned', 'ongoing', or 'done'
 */
export function computeStatus(stepsCompleted) {
  if (!Array.isArray(stepsCompleted)) {
    return 'planned';
  }

  const completedCount = stepsCompleted.filter(Boolean).length;
  const totalSteps = stepsCompleted.length;

  if (completedCount === 0) {
    return 'planned';
  } else if (completedCount === totalSteps && totalSteps > 0) {
    return 'done';
  } else {
    return 'ongoing';
  }
}
