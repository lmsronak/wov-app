import { Request, Response } from "express";
import UserModel from "../models/userModel";
import generateToken from "../utils/generateToken";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import User, { UserRoles, UserStatusType } from "../models/userModel/User";
import EntityService from "../services/entityService";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import Subscription from "../models/subscriptionModel/Subscription";
import { TRIAL_PERIOD_DURATION_IN_DAYS } from "../config/constants";
import SubscriptionModel from "../models/subscriptionModel";
import PlanModel from "../models/planModel";
import logger from "../logging/logger";

/**
 * @desc Authenticate User
 * @route POST /api/users/login
 * @access Public
 */
// const authUser = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   const user = await UserModel.findOne({ email });

//   if (user && user.status === "rejected") {
//     res.status(400);
//     throw new Error("Your Profile has been rejected");
//   }

//   if (user && user.status === "pending") {
//     res.status(400);
//     throw new Error("Your Profile will be approved shortly");
//   }

//   if (user && (await user.matchPassword(password))) {
//     if (user.isAdmin) {
//       if (user.mfaEnabled) {
//         res.json({
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           isAdmin: user.isAdmin,
//           mfaRequired: true,
//           mfaEnabled: user.mfaEnabled,
//           qrCodeDataUrl: null,
//         });
//       } else {
//         const secret = speakeasy.generateSecret({
//           name: `ChakraApp (${user.email})`,
//         });

//         const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url || "");

//         await UserModel.findByIdAndUpdate(user._id, {
//           tempSecret: secret.base32,
//         });

//         res.json({
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           isAdmin: user.isAdmin,
//           mfaRequired: true,
//           mfaEnabled: user.mfaEnabled,
//           qrCodeDataUrl: qrCodeDataUrl,
//         });
//       }
//       return;
//     }
//     generateToken(res, user._id);

//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       mfaRequired: false,
//       mfaEnabled: user.mfaEnabled,
//       qrCodeDataUrl: null,
//     });
//   } else {
//     res.status(401);
//     throw new Error("Invalid email or password");
//   }
// };

const authUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      data: null,
    });
  }

  if (user.status === "rejected") {
    return res.status(400).json({
      success: false,
      message: "Your profile has been rejected",
      data: null,
    });
  }

  if (user.status === "pending") {
    return res.status(400).json({
      success: false,
      message: "Your profile will be approved shortly",
      data: null,
    });
  }

  // ADMIN — MFA logic
  if (user.isAdmin) {
    if (user.mfaEnabled) {
      // MFA already enabled — ask for token only
      return res.status(200).json({
        success: true,
        message: "MFA login required",
        data: {
          mfaRequired: true,
          mfaStage: "login",
          email: user.email,
        },
      });
    } else {
      // New MFA setup
      const secret = speakeasy.generateSecret({
        name: `ChakraApp (${user.email})`,
      });

      const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url || "");

      // Store temp secret for verification
      user.tempSecret = secret.base32;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "MFA setup required",
        data: {
          mfaRequired: true,
          mfaStage: "setup",
          email: user.email,
          qrCodeDataUrl,
        },
      });
    }
  }

  // REGULAR user — issue token
  await generateToken(res, user._id);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      mfaRequired: false,
    },
  });
};

/**
 * @desc Register User
 * @route POST /api/users
 * @access Public
 */

const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, roles } = req.body;

    if (roles instanceof Array) {
      roles.forEach((role) => {
        if (!Object.values(UserRoles).includes(role)) {
          res.status(400);
          res.json({ message: "Invalid Role" });
        }
      });

      if (roles.includes(UserRoles.ADMIN)) {
        res.status(403);
        res.json({ message: "Admin User cannot be created" });
      }
    }

    console.log("roles: ", roles);

    const userExists = await UserModel.findOne({
      email: email,
    });

    console.log("creating user of roles: ", roles);
    console.log("user Exists: ", userExists);

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);

    const defaultSubsciption = await SubscriptionModel.create<Subscription>({
      isDeleted: false,
      status: "approved",
      remarks: [],
      paymentMethod: null,
      transactionId: null,
      startDate: start,
      endDate: end,
      plan: null,
    });

    const user = await UserModel.create<User>({
      name,
      email,
      password,
      phone,
      roles,
      status: "pending",
      mfaEnabled: false,
      mfaSecret: null,
      subscription: defaultSubsciption._id,
    });

    if (user) {
      // generateToken(res, user._id)
      // res.status(201).json({
      //   _id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   isAdmin: user.isAdmin,
      // })

      res.status(200);
      throw new Error("Your Profile will be approved shortly");
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (err) {
    res.status(500);
    res.json({
      message:
        err instanceof Error
          ? err.message
          : process.env.NODE_ENV === "development"
          ? err
          : "Internal server error",
    });
  }
};

/**
 * @desc Logout User
 * @route POST /api/users
 * @access Private
 */
const logoutUser = async (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie("userInfo", "", {
    httpOnly: false,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out" });
};

/**
 * @desc Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new Error("User Info not found for a protected route");
  }
  const user = await UserModel.findById(req.user!._id).populate({
    path: "subscription",
    strictPopulate: false,
    populate: {
      path: "plan",
      strictPopulate: false,
    },
  });

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      subscription: user.subscription,
      status: user.status,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

/**
 * @desc Update User Profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const user = await UserModel.findById(req.user!._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    await generateToken(res, updatedUser._id);

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

/**
 * @desc Get All Users
 * @route GET /api/users
 * @access Private/Admin
 */

const getUsers = async (req: Request, res: Response) => {
  const pageSize = req.query.recPerPage ? +req.query.recPerPage : 10;
  const page = req.query.pageNo ? +req.query.pageNo : 1;
  const count = await UserModel.countDocuments();

  const users = await UserModel.find({ roles: { $nin: ["client"] } }).populate({
    path: "subscription",
    strictPopulate: false,
    populate: {
      path: "plan",
      strictPopulate: false,
    },
  });
  // .limit(pageSize)
  // .skip(pageSize * (page - 1));
  res.status(200).json({ users, page, pages: Math.ceil(count / pageSize) });
};

/**
 * @desc Get user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 */

const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  // const user = await UserModel.findById(req.params.id).select("-password");

  const user = await UserModel.findById(req.params!.id)
    .select("-password -mfaSecret -tempSecret")
    .populate({
      path: "subscription",
      strictPopulate: false,
      populate: {
        path: "plan",
        strictPopulate: false,
      },
    });
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

/**
 * @desc Delete User
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */

// const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
//   const user: User | null = await UserModel.findOne({ _id: req.params.id });

//   if (user) {
//     if (user.roles.includes("client")) {
//       await UserModel.deleteOne({ _id: req.params.id });
//     }

//     if (user.roles.includes("admin") || user.isAdmin) {
//       if (req.user?.isAdmin) {
//         await UserModel.deleteOne({ _id: req.params.id });
//         res.status(200).json({ message: "User deleted successfully" });
//         return;
//       }
//       res.status(400);
//       throw new Error("Not allowed to delete this user");
//     }
//   } else {
//     res.status(404);
//     throw new Error("User not found");
//   }
// };

const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const user: User | null = await UserModel.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If the user is a client — allow deletion
  if (user.roles.includes("client")) {
    await UserModel.deleteOne({ _id: user._id });
    return res
      .status(200)
      .json({ message: "Client user deleted successfully" });
  }

  // If the user is admin or marked as admin — only another admin can delete
  // if (user.isAdmin) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Not allowed to delete this user" });
  }

  await UserModel.deleteOne({ _id: user._id });
  return res.status(200).json({ message: "Admin user deleted successfully" });
  // }else {

  // }

  // console.log(user.roles);

  // // If no known role matched, block deletion
  // return res.status(400).json({ message: "Cannot delete this user type" });
};

/**
 * @desc Update User
 * @route PUT /api/users/:id
 * @access Private/Admin
 */

const updateUser = async (req: Request, res: Response) => {
  const { name, email, phone, status, isAdmin } = req.body;

  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (typeof phone === "number") user.phone = phone;
  if (status && Object.values(UserStatusType).includes(status)) {
    user.status = status;
  }
  if (typeof isAdmin === "boolean") user.isAdmin = isAdmin;

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    status: updatedUser.status,
    isAdmin: updatedUser.isAdmin,
  });
};

// @desc    Update user status
// @route   PATCH /api/users/:id
// @access  Private/Admin
export const updateUserStatus = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.params.id).populate("subscription");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  user.status = status;

  const updatedUser = await user.save();

  res.json({
    message: "User status updated",
    user: {
      _id: updatedUser._id,
      status: updatedUser.status,
    },
  });
};

/**
 * @desc Get All Clients
 * @route GET /api/clients
 * @access Private
 */

export const getClients = async (req: AuthenticatedRequest, res: Response) => {
  const pageSize = req.query.recPerPage ? +req.query.recPerPage : 10;
  const page = req.query.pageNo ? +req.query.pageNo : 1;

  const user = await UserModel.findById(req.user!._id);

  if (!user) {
    res.status(404);
    throw new Error("User ID not found");
  }

  const count = await UserModel.countDocuments({ isClientOf: user._id });
  const clients = await UserModel.find({ isClientOf: user._id })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({ clients, page, pages: Math.ceil(count / pageSize) });
};

export const getClientById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Ensure logged-in user exists
    const user = await UserModel.findById(req.user!._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Find client that belongs to this user
    const client = await UserModel.findOne({
      _id: id,
      isClientOf: user._id,
    }).select("-password -__v"); // Exclude sensitive fields

    if (!client) {
      res.status(404);
      res.json({ message: "Client not found" });
      return;
    }

    res.status(200).json({
      _id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      roles: client.roles,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    });
  } catch (err) {
    logger.error("Error while getting client by id", err);
    res.status(500);
    res.json({
      message:
        err instanceof Error
          ? err.message
          : process.env.NODE_ENV === "development"
          ? err
          : "Internal server error",
    });
  }
};

/**
 * @desc Register Client
 * @route POST /api/clients
 * @access Private
 */

export const registerClient = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, email, phone, roles } = req.body;

    const user = await UserModel.findById(req.user!._id);

    if (!user) {
      res.status(404);
      throw new Error("Student Id not found");
    }

    if (roles instanceof Array) {
      roles.forEach((role) => {
        if (!Object.values(UserRoles).includes(role)) {
          res.status(400);
          res.json({ message: "Invalid Role" });
        }
      });

      if (roles.includes(UserRoles.ADMIN)) {
        res.status(403);
        res.json({ message: "Admin User cannot be created" });
      }
    }

    const clientExists = await UserModel.findOne({
      $and: [{ isClientOf: user._id }, { email }],
    });

    console.log(clientExists);

    if (clientExists) {
      res.status(400);
      throw new Error("Client with this email already exists");
    }

    const client = await UserModel.create<User>({
      name,
      email,
      phone,
      roles,
      status: "pending",
      isClientOf: user._id,
    });

    if (client) {
      await EntityService.createDefaultEntitiesForClient(user._id, client._id);

      res.status(201).json({
        _id: client._id,
        name: client.name,
        email: client.email,
        isAdmin: client.isAdmin,
      });

      res.status(200);
    } else {
      res.status(400);
      throw new Error("Invalid client data");
    }
  } catch (err) {
    res.status(500);
    res.json({
      message:
        err instanceof Error
          ? err.message
          : process.env.NODE_ENV === "development"
          ? err
          : "Internal server error",
    });
  }
};

export const updateClient = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, email, phone, clientId } = req.body;
    // const { clientId } = req.params;

    // Ensure logged-in user exists
    const user = await UserModel.findById(req.user!._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if client exists and belongs to the logged-in user
    const client = await UserModel.findOne({
      _id: clientId,
      isClientOf: user._id,
    });
    if (!client) {
      res.status(404);
      throw new Error("Client not found");
    }

    // Validate roles if provided
    // if (roles instanceof Array) {
    //   for (const role of roles) {
    //     if (!Object.values(UserRoles).includes(role)) {
    //       res.status(400);
    //       return res.json({ message: "Invalid Role" });
    //     }
    //   }
    //   if (roles.includes(UserRoles.ADMIN)) {
    //     res.status(403);
    //     return res.json({ message: "Admin User cannot be assigned" });
    //   }
    // }

    // Check for duplicate email/phone (excluding current client)
    // if (email || phone) {
    //   const existingUser = await UserModel.findOne({
    //     _id: { $ne: client._id },
    //     // $or: [{ email: email }, { phone: phone }],
    //   });
    //   if (existingUser) {
    //     res.status(400);
    //     throw new Error("Email or phone already in use");
    //   }
    // }

    // Update allowed fields
    if (name !== undefined) client.name = name;
    if (email !== undefined) client.email = email;
    if (phone !== undefined) client.phone = phone;
    // if (roles !== undefined) client.roles = roles;
    // if (status !== undefined) client.status = status;

    const updatedClient = await client.save();

    res.status(200).json({
      _id: updatedClient._id,
      name: updatedClient.name,
      email: updatedClient.email,
      phone: updatedClient.phone,
      roles: updatedClient.roles,
      status: updatedClient.status,
    });
  } catch (err) {
    res.status(500);
    res.json({
      message:
        err instanceof Error
          ? err.message
          : process.env.NODE_ENV === "development"
          ? err
          : "Internal server error",
    });
  }
};
// Verify first MFA code (after scanning QR)
export const verifyMfaSetup = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;
  const user = (await UserModel.findOne({ email })) as User;

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      data: null,
    });
  }

  const verified = speakeasy.totp.verify({
    secret: user.tempSecret || "",
    encoding: "base32",
    token,
  });

  if (verified) {
    await generateToken(res, user._id);

    await UserModel.findByIdAndUpdate(user._id, {
      mfaSecret: user.tempSecret,
      tempSecret: null,
      mfaEnabled: true,
    });
    res.send({
      success: true,
      message: "Login successfull",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        mfaRequired: user.mfaEnabled,
      },
    });
  } else {
    res.status(400).send({ success: false, message: "Invalid token" });
  }
};

// MFA verify during login (2nd step)
export const verifyMfaLogin = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;
  const user = (await UserModel.findOne({ email })) as User;

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      data: null,
    });
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret || "",
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    return res.status(401).send({ message: "Invalid MFA token" });
  }

  await generateToken(res, user._id);
  // res.json({
  //   _id: user._id,
  //   name: user.name,
  //   email: user.email,
  //   isAdmin: user.isAdmin,
  // });
  res.send({
    success: true,
    message: "Login successfull",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      mfaRequired: user.mfaEnabled,
    },
  });
};

// export const setupMfa = async (req: Request, res: Response) => {
//   const { email } = req.body;
//   const user = (await UserModel.findOne({ email })) as User;

//   const secret = speakeasy.generateSecret({
//     name: `MyApp (${user.email})`,
//   });

//   const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url || "");

//   await UserModel.findByIdAndUpdate(user._id, { tempSecret: secret.base32 });

//   return qrCodeDataUrl;
// };

const updateUserAsAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      roles,
      planId,
      mfaEnabled,
      subscriptionStatus,
      accountStatus,
      paymentMethod,
      transactionId,
      remarks,
      isAdmin,
      subscriptionStartDate,
      subscriptionEndDate,
    } = req.body;

    const user = await UserModel.findById(req.params.id).populate(
      "subscription"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // 2️⃣ Validate roles if provided
    // if (roles instanceof Array) {
    //   for (const role of roles) {
    //     if (!Object.values(UserRoles).includes(role)) {
    //       res.status(400);
    //       return res.json({ message: "Invalid Role" });
    //     }
    //   }
    //   user.roles = roles;
    // }
    const plan = await PlanModel.findById(planId);

    if (user.subscription) {
      const subscription = await SubscriptionModel.findById(
        user.subscription._id
      );
      if (subscription) {
        subscription.status = subscriptionStatus ?? subscription.status;
        subscription.remarks = remarks ?? subscription.remarks;
        subscription.paymentMethod =
          paymentMethod ?? subscription.paymentMethod;
        subscription.transactionId =
          transactionId ?? subscription.transactionId;
        subscription.startDate = subscriptionStartDate
          ? new Date(subscriptionStartDate)
          : subscription.startDate;
        subscription.endDate = subscriptionEndDate
          ? new Date(subscriptionEndDate)
          : subscription.endDate;
        subscription.plan = plan?._id ?? null;

        await subscription.save();
      }
    }

    // 4️⃣ Update user fields
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.status = accountStatus ?? user.status;
    user.mfaEnabled = mfaEnabled ?? user.mfaEnabled;
    user.isAdmin = isAdmin ?? user.isAdmin;

    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message:
        err instanceof Error
          ? err.message
          : process.env.NODE_ENV === "development"
          ? err
          : "Internal server error",
    });
  }
};

export const registerUserAsAdmin = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      roles,
      planId,
      isAdmin,
      mfaEnabled,
      subscriptionStatus,
      accountStatus,
      paymentMethod,
      transactionId,
      remarks,
      subscriptionStartDate,
      subscriptionEndDate,
    } = req.body;

    if (roles instanceof Array) {
      roles.forEach((role) => {
        if (!Object.values(UserRoles).includes(role)) {
          res.status(400);
          res.json({ message: "Invalid Role" });
        }
      });
    }

    const userExists = await UserModel.findOne({
      $or: [{ email: email }],
    });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const plan = await PlanModel.findById(planId);

    if (!plan) {
      res.status(404);
      throw new Error(
        "Invalid plan: Either the plan was deleted or never created"
      );
    }

    const start = subscriptionStartDate
      ? new Date(subscriptionStartDate)
      : new Date();
    const end = subscriptionEndDate
      ? new Date(subscriptionEndDate)
      : new Date();

    if (!subscriptionEndDate) {
      end.setDate(end.getDate() + 7);
    }

    if (paymentMethod !== "cash") {
      throw new Error("Not a valid payment method");
    }

    const newSubscription = await SubscriptionModel.create<Subscription>({
      isDeleted: false,
      status: subscriptionStatus,
      remarks: remarks,
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      // startDate: new Date(subscriptionStartDate),
      // endDate: new Date(subscriptionEndDate),
      startDate: start,
      endDate: end,
      plan: plan._id,
    });

    const user = await UserModel.create<User>({
      name,
      email,
      password,
      phone,
      roles,
      status: accountStatus,
      mfaEnabled: mfaEnabled,
      isAdmin: isAdmin,
      mfaSecret: null,
      subscription: newSubscription._id,
    });

    if (user) {
      res.status(200);
      res.json({ message: "User created successfully", data: user });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (err) {
    res.status(500);
    res.json({
      message:
        err instanceof Error
          ? err.message
          : process.env.NODE_ENV === "development"
          ? err
          : "Internal server error",
    });
  }
};

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserAsAdmin,
};
