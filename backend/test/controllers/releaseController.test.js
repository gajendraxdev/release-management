import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as releaseController from '../../controllers/releaseController.js';
import * as releaseRepository from '../../repositories/releaseRepository.js';

// Mock repository
vi.mock('../../repositories/releaseRepository.js');

describe('releaseController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      params: {},
      body: {}
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
  });

  describe('list', () => {
    it('should return all releases', async () => {
      const mockReleases = [
        {
          id: '1',
          name: 'v1.0.0',
          date: new Date('2024-01-01'),
          additionalInfo: null,
          stepsCompleted: [false, false, false],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];
      releaseRepository.findAll.mockResolvedValue(mockReleases);

      await releaseController.list(mockReq, mockRes);

      expect(releaseRepository.findAll).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            name: 'v1.0.0',
            status: 'planned'
          })
        ])
      );
    });

    it('should handle errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      releaseRepository.findAll.mockRejectedValue(new Error('DB error'));

      await releaseController.list(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch releases' });
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getById', () => {
    it('should return a release by id', async () => {
      mockReq.params.id = '1';
      const mockRelease = {
        id: '1',
        name: 'v1.0.0',
        stepsCompleted: [true, false, false],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      releaseRepository.findById.mockResolvedValue(mockRelease);

      await releaseController.getById(mockReq, mockRes);

      expect(releaseRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: 'v1.0.0',
          status: 'ongoing'
        })
      );
    });

    it('should return 404 when release not found', async () => {
      mockReq.params.id = '999';
      releaseRepository.findById.mockResolvedValue(null);

      await releaseController.getById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Release not found' });
    });
  });

  describe('create', () => {
    it('should create a release', async () => {
      mockReq.body = {
        name: 'v1.0.0',
        date: '2024-01-01T00:00:00.000Z',
        additional_info: 'Test'
      };
      const mockRelease = {
        id: '1',
        name: 'v1.0.0',
        date: new Date('2024-01-01'),
        additionalInfo: 'Test',
        stepsCompleted: [false, false, false, false, false, false, false],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      releaseRepository.create.mockResolvedValue(mockRelease);

      await releaseController.create(mockReq, mockRes);

      expect(releaseRepository.create).toHaveBeenCalledWith({
        name: 'v1.0.0',
        date: '2024-01-01T00:00:00.000Z',
        additional_info: 'Test'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return 400 when name is missing', async () => {
      mockReq.body = { date: '2024-01-01' };

      await releaseController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Name and date are required' });
      expect(releaseRepository.create).not.toHaveBeenCalled();
    });

    it('should return 400 when date is missing', async () => {
      mockReq.body = { name: 'v1.0.0' };

      await releaseController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Name and date are required' });
    });
  });

  describe('update', () => {
    it('should update a release', async () => {
      mockReq.params.id = '1';
      mockReq.body = { name: 'v1.0.1' };
      const mockRelease = {
        id: '1',
        name: 'v1.0.1',
        stepsCompleted: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      releaseRepository.update.mockResolvedValue(mockRelease);

      await releaseController.update(mockReq, mockRes);

      expect(releaseRepository.update).toHaveBeenCalledWith('1', { name: 'v1.0.1' });
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return 400 when no fields to update', async () => {
      mockReq.params.id = '1';
      mockReq.body = {};

      await releaseController.update(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No fields to update' });
      expect(releaseRepository.update).not.toHaveBeenCalled();
    });

    it('should return 404 when release not found', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockReq.params.id = '999';
      mockReq.body = { name: 'v1.0.1' };
      const error = new Error('Not found');
      error.code = 'P2025';
      releaseRepository.update.mockRejectedValue(error);

      await releaseController.update(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('toggleStep', () => {
    it('should toggle a step', async () => {
      mockReq.params.id = '1';
      mockReq.body = { stepIndex: 0 };
      const mockRelease = {
        id: '1',
        stepsCompleted: [true, false, false],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      releaseRepository.toggleStep.mockResolvedValue(mockRelease);

      await releaseController.toggleStep(mockReq, mockRes);

      expect(releaseRepository.toggleStep).toHaveBeenCalledWith('1', 0);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return 400 for invalid step index', async () => {
      mockReq.params.id = '1';
      mockReq.body = { stepIndex: 999 };

      await releaseController.toggleStep(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid step index' });
    });

    it('should return 404 when release not found', async () => {
      mockReq.params.id = '999';
      mockReq.body = { stepIndex: 0 };
      releaseRepository.toggleStep.mockResolvedValue(null);

      await releaseController.toggleStep(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('remove', () => {
    it('should delete a release', async () => {
      mockReq.params.id = '1';
      const mockRelease = { id: '1' };
      releaseRepository.remove.mockResolvedValue(mockRelease);

      await releaseController.remove(mockReq, mockRes);

      expect(releaseRepository.remove).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Release deleted successfully',
        id: '1'
      });
    });

    it('should return 404 when release not found', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockReq.params.id = '999';
      const error = new Error('Not found');
      error.code = 'P2025';
      releaseRepository.remove.mockRejectedValue(error);

      await releaseController.remove(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      consoleErrorSpy.mockRestore();
    });
  });
});
