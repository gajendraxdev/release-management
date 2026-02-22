import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import releasesRouter from '../../routes/releases.js';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/releases', releasesRouter);

describe('Releases API Integration Tests', () => {
  let createdReleaseId;

  beforeAll(async () => {
    // You can add test database setup here if needed
    // For now, tests will run against the actual database
    // In production, use a test database
  });

  afterAll(async () => {
    // Cleanup: delete test releases if needed
  });

  describe('POST /api/releases', () => {
    it('should create a new release', async () => {
      const releaseData = {
        name: 'Test Release v1.0.0',
        date: '2024-01-01T00:00:00.000Z',
        additional_info: 'Test release for integration testing'
      };

      const response = await request(app)
        .post('/api/releases')
        .send(releaseData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(releaseData.name);
      expect(response.body.additional_info).toBe(releaseData.additional_info);
      expect(response.body.status).toBe('planned');
      expect(response.body.steps).toHaveLength(7);
      expect(response.body.steps_completed).toEqual([false, false, false, false, false, false, false]);

      createdReleaseId = response.body.id;
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/releases')
        .send({
          date: '2024-01-01T00:00:00.000Z'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return 400 when date is missing', async () => {
      const response = await request(app)
        .post('/api/releases')
        .send({
          name: 'Test Release'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/releases', () => {
    it('should return all releases', async () => {
      const response = await request(app)
        .get('/api/releases')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('status');
        expect(response.body[0]).toHaveProperty('steps');
      }
    });
  });

  describe('GET /api/releases/:id', () => {
    it('should return a release by id', async () => {
      if (!createdReleaseId) {
        // Create a release first if we don't have one
        const createResponse = await request(app)
          .post('/api/releases')
          .send({
            name: 'Test Get Release',
            date: '2024-01-01T00:00:00.000Z'
          });
        createdReleaseId = createResponse.body.id;
      }

      const response = await request(app)
        .get(`/api/releases/${createdReleaseId}`)
        .expect(200);

      expect(response.body.id).toBe(createdReleaseId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('steps');
    });

    it('should return 404 when release not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/releases/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PATCH /api/releases/:id', () => {
    it('should update a release', async () => {
      if (!createdReleaseId) {
        const createResponse = await request(app)
          .post('/api/releases')
          .send({
            name: 'Test Update Release',
            date: '2024-01-01T00:00:00.000Z'
          });
        createdReleaseId = createResponse.body.id;
      }

      const updateData = {
        name: 'Updated Release Name',
        additional_info: 'Updated info'
      };

      const response = await request(app)
        .patch(`/api/releases/${createdReleaseId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.additional_info).toBe(updateData.additional_info);
    });

    it('should return 400 when no fields to update', async () => {
      if (!createdReleaseId) return;

      const response = await request(app)
        .patch(`/api/releases/${createdReleaseId}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/releases/:id/toggle-step', () => {
    it('should toggle a step from false to true', async () => {
      if (!createdReleaseId) {
        const createResponse = await request(app)
          .post('/api/releases')
          .send({
            name: 'Test Toggle Release',
            date: '2024-01-01T00:00:00.000Z'
          });
        createdReleaseId = createResponse.body.id;
      }

      const response = await request(app)
        .patch(`/api/releases/${createdReleaseId}/toggle-step`)
        .send({ stepIndex: 0 })
        .expect(200);

      expect(response.body.steps_completed[0]).toBe(true);
      expect(response.body.status).toBe('ongoing');
    });

    it('should toggle a step from true to false', async () => {
      if (!createdReleaseId) return;

      // First toggle to true
      await request(app)
        .patch(`/api/releases/${createdReleaseId}/toggle-step`)
        .send({ stepIndex: 1 });

      // Then toggle back to false
      const response = await request(app)
        .patch(`/api/releases/${createdReleaseId}/toggle-step`)
        .send({ stepIndex: 1 })
        .expect(200);

      expect(response.body.steps_completed[1]).toBe(false);
    });

    it('should return 400 for invalid step index', async () => {
      if (!createdReleaseId) return;

      const response = await request(app)
        .patch(`/api/releases/${createdReleaseId}/toggle-step`)
        .send({ stepIndex: 999 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/releases/:id', () => {
    it('should delete a release', async () => {
      // Create a release to delete
      const createResponse = await request(app)
        .post('/api/releases')
        .send({
          name: 'Test Delete Release',
          date: '2024-01-01T00:00:00.000Z'
        });
      const deleteId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/releases/${deleteId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.id).toBe(deleteId);

      // Verify it's deleted
      await request(app)
        .get(`/api/releases/${deleteId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent release', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/releases/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
