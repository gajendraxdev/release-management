import prisma from '../db/index.js';
import { DEFAULT_STEPS } from '../constants/index.js';

/**
 * Release repository – all database access for releases.
 * Returns raw Prisma records; controllers handle API shaping.
 */

export async function findAll() {
  return prisma.release.findMany({
    orderBy: { date: 'desc' }
  });
}

export async function findById(id) {
  return prisma.release.findUnique({
    where: { id }
  });
}

export async function create(data) {
  const stepsCompleted = new Array(DEFAULT_STEPS.length).fill(false);
  return prisma.release.create({
    data: {
      name: data.name,
      date: new Date(data.date),
      additionalInfo: data.additional_info ?? null,
      stepsCompleted
    }
  });
}

export async function update(id, data) {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.additional_info !== undefined) updateData.additionalInfo = data.additional_info;

  if (Object.keys(updateData).length === 0) {
    return null;
  }

  return prisma.release.update({
    where: { id },
    data: updateData
  });
}

export async function toggleStep(id, stepIndex) {
  const release = await prisma.release.findUnique({
    where: { id },
    select: { stepsCompleted: true }
  });

  if (!release) return null;

  const stepsCompleted = Array.isArray(release.stepsCompleted)
    ? [...release.stepsCompleted]
    : new Array(DEFAULT_STEPS.length).fill(false);
  stepsCompleted[stepIndex] = !stepsCompleted[stepIndex];

  return prisma.release.update({
    where: { id },
    data: { stepsCompleted }
  });
}

export async function remove(id) {
  return prisma.release.delete({
    where: { id }
  });
}
