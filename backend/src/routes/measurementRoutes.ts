import { Router } from "express";
import {
  createEntity,
  createMeasurement,
  deleteEntityById,
  deleteMeasurementById,
  getAllEntities,
  getMeasurementsList,
  getMeasurementById,
  updateMeasurement,
  test,
  getEntityAverage,
} from "../controllers/measurement.controller";
import { protect, subscriptionActive } from "../middlewares/authMiddleware";

const router = Router();

router
  .route("/")
  .get(protect, subscriptionActive, getMeasurementsList)
  .post(protect, subscriptionActive, createMeasurement)
  .delete(protect, subscriptionActive, deleteMeasurementById);

router
  .route("/entity")
  .post(protect, subscriptionActive, createEntity)
  .get(protect, subscriptionActive, getAllEntities);
router.route("/average").get(protect, subscriptionActive, getEntityAverage);
router
  .route("/entity/:id")
  .delete(protect, subscriptionActive, deleteEntityById);
router
  .route("/:id")
  .delete(protect, subscriptionActive, deleteMeasurementById)
  .patch(protect, subscriptionActive, updateMeasurement)
  .get(protect, subscriptionActive, getMeasurementById);
export default router;
