import { Router } from "express";
import { generateSports, listByProperty, evaluateSpots, updateSpot } from '../controllers/spotController';
import { validateBody } from "../middlewares/validateBody";
import { evaluateSpotSchema, generateSpotsSchema, updateSpotStatusSchema } from '../schemas/sportsSchema';
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    '/properties/:propId/spots',
    authMiddleware,
    validateBody(generateSpotsSchema),
    generateSports
);

router.get(
    '/properties/:propId/spots',
    authMiddleware,
    listByProperty
);

router.patch(
    '/:id/evaluate',
    authMiddleware,
    validateBody(evaluateSpotSchema),
    evaluateSpots
);

router.patch(
    '/:id/status',
    authMiddleware,
    validateBody(updateSpotStatusSchema),
    updateSpot
);

export default router;