import express from "express";

import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserStatus,
  verifyMfaSetup,
  verifyMfaLogin,
  registerUserAsAdmin,
  updateUserAsAdmin,
} from "../controllers/user.controller";
import { admin, protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/").post(registerUser).get(protect, admin, getUsers);
router.post("/mfa-setup-verify", verifyMfaSetup);
router.post("/mfa-verify", verifyMfaLogin);
router.post("/login", authUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route("/admin")
  .post(protect, admin, registerUserAsAdmin)
  .get(protect, admin, getUsers);

router
  .route("/admin/:id")
  .delete(protect, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUserAsAdmin)
  .patch(protect, admin, updateUserStatus);

router
  .route("/:id")
  .delete(protect, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .patch(protect, admin, updateUserStatus);

export default router;
