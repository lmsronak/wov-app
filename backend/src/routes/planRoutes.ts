import express from "express";

import { admin, protect } from "../middlewares/authMiddleware";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  softDeletePlan,
  updatePlan,
} from "../controllers/plan.controller";

const router = express.Router();

router.route("/").get(getAllPlans).post(protect, admin, createPlan);
router
  .route("/:id")
  .get(getPlanById)
  .delete(protect, admin, softDeletePlan)
  .put(protect, admin, updatePlan);

export default router;
