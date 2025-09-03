import express from "express";

import {
  registerClient,
  getClients,
  updateClient,
  getClientById,
} from "../controllers/user.controller";
import {
  admin,
  protect,
  subscriptionActive,
} from "../middlewares/authMiddleware";

const router = express.Router();

router
  .route("/")
  .post(protect, subscriptionActive, registerClient)
  .get(protect, subscriptionActive, getClients)
  .put(protect, subscriptionActive, updateClient);

router.route("/:id").get(protect, subscriptionActive, getClientById);

export default router;
