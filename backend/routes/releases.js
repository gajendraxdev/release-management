import express from 'express';
import * as releaseController from '../controllers/releaseController.js';

const router = express.Router();

router.get('/', releaseController.list);
router.post('/', releaseController.create);
router.patch('/:id/toggle-step', releaseController.toggleStep);
router.get('/:id', releaseController.getById);
router.patch('/:id', releaseController.update);
router.delete('/:id', releaseController.remove);

export default router;
