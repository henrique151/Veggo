import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateBody';
import { createProperty, deleteProperty, getAllProperties, getMyProperties, getPropertyById, updateProperty } from '../controllers/propertiesController';
import { createPropertySchema } from '../schemas/propertiesSchema';

const router = Router();

router.post('/', authMiddleware, validateBody(createPropertySchema), createProperty);
router.get('/', authMiddleware, getAllProperties);
router.get('/my-properties', authMiddleware, getMyProperties);
router.get('/:id', authMiddleware, getPropertyById);
router.put('/:id/', authMiddleware, validateBody(createPropertySchema), updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

export default router;