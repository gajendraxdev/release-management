import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as releaseRepository from '../../repositories/releaseRepository.js';
import { DEFAULT_STEPS } from '../../constants/index.js';

// Mock Prisma (Prisma-style: mock db layer so repository tests don't hit the database)
vi.mock('../../db/index.js', () => ({
  default: {
    release: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

import prisma from '../../db/index.js';

describe('releaseRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all releases ordered by date desc', async () => {
      const mockReleases = [
        { id: '1', name: 'v1.0.0', date: new Date('2024-01-02') },
        { id: '2', name: 'v0.9.0', date: new Date('2024-01-01') }
      ];
      prisma.release.findMany.mockResolvedValue(mockReleases);

      const result = await releaseRepository.findAll();

      expect(prisma.release.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc' }
      });
      expect(result).toEqual(mockReleases);
    });
  });

  describe('findById', () => {
    it('should return a release by id', async () => {
      const mockRelease = { id: '1', name: 'v1.0.0' };
      prisma.release.findUnique.mockResolvedValue(mockRelease);

      const result = await releaseRepository.findById('1');

      expect(prisma.release.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(result).toEqual(mockRelease);
    });

    it('should return null when release not found', async () => {
      prisma.release.findUnique.mockResolvedValue(null);

      const result = await releaseRepository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a release with initialized steps', async () => {
      const data = {
        name: 'v1.0.0',
        date: '2024-01-01',
        additional_info: 'Test release'
      };
      const mockRelease = {
        id: '1',
        name: 'v1.0.0',
        date: new Date('2024-01-01'),
        additionalInfo: 'Test release',
        stepsCompleted: new Array(DEFAULT_STEPS.length).fill(false)
      };
      prisma.release.create.mockResolvedValue(mockRelease);

      const result = await releaseRepository.create(data);

      expect(prisma.release.create).toHaveBeenCalledWith({
        data: {
          name: 'v1.0.0',
          date: new Date('2024-01-01'),
          additionalInfo: 'Test release',
          stepsCompleted: new Array(DEFAULT_STEPS.length).fill(false)
        }
      });
      expect(result).toEqual(mockRelease);
    });

    it('should handle null additional_info', async () => {
      const data = {
        name: 'v1.0.0',
        date: '2024-01-01',
        additional_info: null
      };
      const mockRelease = {
        id: '1',
        name: 'v1.0.0',
        additionalInfo: null,
        stepsCompleted: []
      };
      prisma.release.create.mockResolvedValue(mockRelease);

      await releaseRepository.create(data);

      expect(prisma.release.create).toHaveBeenCalledWith({
        data: {
          name: 'v1.0.0',
          date: new Date('2024-01-01'),
          additionalInfo: null,
          stepsCompleted: new Array(DEFAULT_STEPS.length).fill(false)
        }
      });
    });
  });

  describe('update', () => {
    it('should update a release with provided fields', async () => {
      const updateData = {
        name: 'v1.0.1',
        date: '2024-01-02'
      };
      const mockRelease = {
        id: '1',
        name: 'v1.0.1',
        date: new Date('2024-01-02')
      };
      prisma.release.update.mockResolvedValue(mockRelease);

      const result = await releaseRepository.update('1', updateData);

      expect(prisma.release.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'v1.0.1',
          date: new Date('2024-01-02')
        }
      });
      expect(result).toEqual(mockRelease);
    });

    it('should return null when no fields to update', async () => {
      const result = await releaseRepository.update('1', {});

      expect(prisma.release.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('toggleStep', () => {
    it('should toggle a step from false to true', async () => {
      const mockRelease = {
        stepsCompleted: [false, false, false]
      };
      const updatedRelease = {
        id: '1',
        stepsCompleted: [true, false, false]
      };
      prisma.release.findUnique.mockResolvedValue(mockRelease);
      prisma.release.update.mockResolvedValue(updatedRelease);

      const result = await releaseRepository.toggleStep('1', 0);

      expect(prisma.release.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { stepsCompleted: true }
      });
      expect(prisma.release.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { stepsCompleted: [true, false, false] }
      });
      expect(result).toEqual(updatedRelease);
    });

    it('should toggle a step from true to false', async () => {
      const mockRelease = {
        stepsCompleted: [true, false, false]
      };
      const updatedRelease = {
        id: '1',
        stepsCompleted: [false, false, false]
      };
      prisma.release.findUnique.mockResolvedValue(mockRelease);
      prisma.release.update.mockResolvedValue(updatedRelease);

      const result = await releaseRepository.toggleStep('1', 0);

      expect(prisma.release.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { stepsCompleted: [false, false, false] }
      });
      expect(result).toEqual(updatedRelease);
    });

    it('should return null when release not found', async () => {
      prisma.release.findUnique.mockResolvedValue(null);

      const result = await releaseRepository.toggleStep('999', 0);

      expect(prisma.release.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should initialize steps if not an array', async () => {
      const mockRelease = {
        stepsCompleted: null
      };
      const updatedRelease = {
        id: '1',
        stepsCompleted: [true, false, false, false, false, false, false]
      };
      prisma.release.findUnique.mockResolvedValue(mockRelease);
      prisma.release.update.mockResolvedValue(updatedRelease);

      await releaseRepository.toggleStep('1', 0);

      expect(prisma.release.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          stepsCompleted: expect.arrayContaining([true])
        }
      });
    });
  });

  describe('remove', () => {
    it('should delete a release', async () => {
      const mockRelease = { id: '1', name: 'v1.0.0' };
      prisma.release.delete.mockResolvedValue(mockRelease);

      const result = await releaseRepository.remove('1');

      expect(prisma.release.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(result).toEqual(mockRelease);
    });
  });
});
