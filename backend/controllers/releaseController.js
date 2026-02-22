import * as releaseRepository from '../repositories/releaseRepository.js';
import { toReleaseResponse } from '../utils/releaseMapper.js';
import { DEFAULT_STEPS } from '../constants/index.js';

/**
 * Release controller – HTTP request/response handling and validation.
 * Calls repository for data, maps to API response.
 */

export async function list(req, res) {
  try {
    const releases = await releaseRepository.findAll();
    res.json(releases.map(toReleaseResponse));
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    const release = await releaseRepository.findById(id);
    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }
    res.json(toReleaseResponse(release));
  } catch (error) {
    console.error('Error fetching release:', error);
    res.status(500).json({ error: 'Failed to fetch release' });
  }
}

export async function create(req, res) {
  try {
    const { name, date, additional_info } = req.body;
    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }
    const release = await releaseRepository.create({
      name,
      date,
      additional_info
    });
    res.status(201).json(toReleaseResponse(release));
  } catch (error) {
    console.error('Error creating release:', error);
    res.status(500).json({ error: 'Failed to create release' });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, date, additional_info } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (date !== undefined) updateData.date = date;
    if (additional_info !== undefined) updateData.additional_info = additional_info;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const release = await releaseRepository.update(id, updateData);
    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }
    res.json(toReleaseResponse(release));
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Release not found' });
    }
    console.error('Error updating release:', error);
    res.status(500).json({ error: 'Failed to update release' });
  }
}

export async function toggleStep(req, res) {
  try {
    const { id } = req.params;
    const { stepIndex } = req.body;

    if (
      stepIndex === undefined ||
      stepIndex < 0 ||
      stepIndex >= DEFAULT_STEPS.length
    ) {
      return res.status(400).json({ error: 'Invalid step index' });
    }

    const release = await releaseRepository.toggleStep(id, stepIndex);
    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }
    res.json(toReleaseResponse(release));
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Release not found' });
    }
    console.error('Error toggling step:', error);
    res.status(500).json({ error: 'Failed to toggle step' });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    const release = await releaseRepository.remove(id);
    res.json({ message: 'Release deleted successfully', id: release.id });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Release not found' });
    }
    console.error('Error deleting release:', error);
    res.status(500).json({ error: 'Failed to delete release' });
  }
}
