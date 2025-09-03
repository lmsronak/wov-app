import express from "express";

import {
  createSubscription,
  updateSubscription,
  getSubscription,
  getAllSubscriptions,
  applySubscription,
} from "../controllers/subscription.controller";
import { admin, protect } from "../middlewares/authMiddleware";

const router = express.Router();

router
  .route("/")
  .get(protect, getSubscription)
  .post(protect, createSubscription)
  .put(protect, admin, updateSubscription);

router.post("/apply", applySubscription);

router.route("/allsubscription").get(protect, admin, getAllSubscriptions);

export default router;
