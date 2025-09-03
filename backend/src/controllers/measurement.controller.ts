import { Request, Response } from "express";
// import { BlogPostModel, CommentModel } from "../models/testModel/Test";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
  Entity,
  MeasurableEntityClass,
  MeasurableEntityNames,
  typeToCollectionMap,
} from "../models/MeasurementModel/Entities";
import MeasurementModel, {
  ChakraModel,
  EnergyModel,
  GlandModel,
  OrganModel,
  SpaceModel,
  ProductModel,
  ReadingModel,
} from "../models/MeasurementModel";
import { Reading } from "../models/MeasurementModel/Measurement";
import UserModel from "../models/userModel";
import User, { UserRoles } from "../models/userModel/User";
import EntityService from "../services/entityService";
import mongoose from "mongoose";
import jsonPatch from "fast-json-patch";
import { isJsonPatchArray } from "../utils/isJsonPatch";
import logger from "../logging/logger";

export const test = async (req: Request, res: Response) => {
  //   const book = await ProductModel.create({ name: "The Count of Monte Cristo" });
  //   const post = await BlogPostModel.create({ title: "Top 10 French Novels" });
  //   // Create comment on product
  //   await CommentModel.create({
  //     body: "Great read",
  //     on: book._id,
  //     onModel: "Product",
  //   });
  //   // Create comment on blog post
  //   await CommentModel.create({
  //     body: "Very informative",
  //     on: post._id,
  //     onModel: "BlogPost",
  //   });
  //   const allComments = await CommentModel.find().populate({ path: "on" }).exec();
  //   res.status(200);
  //   res.json(allComments);
};

export const createEntity = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { entityType, name } = req.body;
  const user = req.user!;
  const clientId = req.header("X-Client-Id");

  if (!clientId) {
    res.status(404);
    res.json({ message: "Invalid id provided" });
    return;
  }

  const entity = await EntityService.createEntityByType(
    entityType as MeasurableEntityNames,
    name,
    user._id,
    clientId
  );

  res.status(201);
  res.json({ message: "Entity created succcessfully", data: entity });
};

export const deleteEntityById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const entityId = req.params.id;
  const { entityType } = req.body;

  const clientId = req.header("X-Client-Id");

  if (!clientId) {
    res.status(404);
    res.json({ message: "Invalid id provided" });
    return;
  }

  if (!req.user) {
    res.status(500);
    throw new Error("User not found on a protected route");
  }

  try {
    const deleted = await EntityService.deleteEntityByType(
      entityId,
      entityType,
      req.user?._id,
      clientId
    );

    res.status(200);
    res.json({ message: "entity deleted successfully", data: deleted });
  } catch (err) {
    res.status(500);
    throw err;
  }
};

export const createMeasurement = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { entityType, readings, location, measurementFor } = req.body;
  const user = req.user!;

  const clientId = req.header("X-Client-Id");

  if (!clientId) {
    res.status(404);
    res.json({ message: "Invalid id provided" });
    return;
  }

  const client: User = await UserModel.findById(clientId).exec();

  if (!client) {
    throw new Error(`Client not found for id ${clientId}`);
  }

  if (!clientId) {
    res.status(400);
    res.json({ message: `prop 'clientId' is required` });
  }

  const entities = await EntityService.getEntitiesByType(
    entityType as MeasurableEntityNames,
    req,
    clientId
  );

  for (const reading of readings) {
    reading.on = reading.on._id;
  }
  const measurement = await MeasurementModel.create({
    user: user._id,
    readings,
    client: client._id,
    type: entityType,
    location,
    ...(entityType === "Energy" ? { measurementFor } : {}),
  });

  if (!measurement) {
    res.status(500);
    res.json({ message: "Measurement was not created", data: measurement });
  }

  const populatedMeasurement = await MeasurementModel.findById(
    measurement._id
  ).populate({ path: "readings.on", strictPopulate: false });

  res.status(201);
  res.json(populatedMeasurement);
};

export const getMeasurementsList = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    entityType,
    page = "1",
    limit = "10",
    startDate,
    endDate,
  } = req.query;
  const clientId = req.header("X-Client-Id");

  if (!clientId) {
    res.status(404);
    res.json({ message: "Invalid id provided" });
    return;
  }

  const currentPage = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  const query: any = {
    user: req.user?._id,
    client: clientId,
    type: entityType,
  };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  const [measurements, total] = await Promise.all([
    MeasurementModel.find(query)
      .populate({ path: "readings.on", strictPopulate: false })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize),
    MeasurementModel.countDocuments(query),
  ]);

  res.status(200);
  res.json({
    message: "measurements received successfully",
    data: measurements,
    total,
    page: currentPage,
    limit: pageSize,
  });
};

export const getMeasurementById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;

  const measurement = await MeasurementModel.findById(id).populate({
    path: "readings.on",
    strictPopulate: false,
  });

  res.status(200);
  res.json(measurement);
};

export const entitiesOrder: Record<MeasurableEntityNames, string[]> = {
  Chakra: [
    "Crown (Sahasrara)",
    "Third Eye (Ajna)",
    "Throat (Vishuddha)",
    "Heart (Anahata)",
    "Solar Plexus (Manipura)",
    "Sacral (Svadhisthana)",
    "Root (Muladhara)",
  ],
  Energy: ["Cosmic Energy", "Telluric Energy", "Global Energy"],
  Gland: [
    "Pineal Gland",
    "Pituitary Gland",
    "Thyroid Gland",
    "Thymus Gland",
    "Pancreas Gland",
    "Sexual Gland",
    "Adrenaline Gland",
  ],
  Organ: [
    "Heart",
    "Lungs",
    "Stomach",
    "Liver",
    "Pancreas",
    "Gallbladder",
    "Kidneys",
    "Bladder",
    "Ureters",
    "Thyroid gland",
    "Brain",
    "Pancreas",
    "Spinal cord",
    "Bones",
    "Ligaments",
    "Muscles",
  ],
  Product: [
    "Product 1",
    "Product 2",
    "Product 3",
    "Product 4",
    "Product 5",
    "Product 6",
  ],
  Space: ["Main Door", "Kitchen", "Bedroom", "Room 1", "Room 2", "Room 3"],
};

export const getAllEntities = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { entityType } = req.query;

  const clientId = req.header("X-Client-Id");

  if (!clientId) {
    res.status(404);
    res.json({ message: "Invalid id provided" });
    return;
  }

  const existingClient: User | null = await UserModel.findById(clientId);

  if (!existingClient) {
    res.status(404);
    res.json({ message: "no such client exists", data: null });
    return;
  } else if (!existingClient.roles.includes(UserRoles.CLIENT)) {
    res.status(400);
    res.json({ message: "no such client exists", data: null });
  }

  const entities = await EntityService.getEntitiesByType(
    entityType as MeasurableEntityNames,
    req,
    clientId as string
  );

  const order = entitiesOrder[entityType as MeasurableEntityNames];

  const sortedEntities = [
    ...order
      .map((name) => entities.find((e) => e.name === name))
      .filter(Boolean),
    ...entities.filter((e) => !order.includes(e.name)),
  ];

  res.status(200);
  res.json({ message: "Entities received successfully", data: sortedEntities });
};

export const deleteMeasurementById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const measurementId = req.params.id;

  const deleted = await MeasurementModel.findOneAndDelete({
    _id: measurementId,
  });

  if (!deleted) {
    res.status(200);
    res.json({ message: "measurement  already deleted" });
  }

  res.status(200);
  res.json({ message: "measurement deleted successfully", data: deleted });
};

export const updateMeasurement = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const measurementUpdate = req.body;
  const { id } = req.params;

  const measurement = await MeasurementModel.findById(id);

  if (!measurement) {
    res.status(404);
    res.json({ message: "measurement not found", data: null });
  }

  const updatedMeasurement = await MeasurementModel.findByIdAndUpdate(
    id,
    measurementUpdate,
    { new: true, runValidators: true }
  ).populate({ path: "readings.on", strictPopulate: false });

  res.status(200);
  res.json(updatedMeasurement);
};

export const getEntityAverage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { entityType } = req.query;

  const clientId = req.header("X-Client-Id");

  if (!clientId) {
    res.status(404);
    res.json({ message: "Invalid id provided" });
    return;
  }

  logger.info(`clientID: ${clientId}`);
  logger.info(`entityType: ${entityType}`);
  const existingClient: User | null = await UserModel.findById(clientId);

  if (!existingClient || !existingClient.roles.includes(UserRoles.CLIENT)) {
    res.status(404);
    res.json({ message: "no such client exists", data: null });
    return;
  }

  const data = await MeasurementModel.aggregate([
    {
      $match: {
        type: entityType,
      },
    },
    {
      $unwind: "$readings",
    },
    {
      $lookup: {
        from: typeToCollectionMap[entityType as MeasurableEntityNames],
        localField: "readings.on",
        foreignField: "_id",
        as: "entity",
      },
    },
    {
      $unwind: "$entity",
    },
    {
      $match: {
        "entity.client": new mongoose.Types.ObjectId(clientId),
      },
    },
    {
      $group: {
        _id: "$readings.on",
        name: { $first: "$entity.name" },
        avgBeforeVal: { $avg: "$readings.beforeVal" },
        avgAfterVal: { $avg: "$readings.afterVal" },
        totalReadings: { $sum: 1 },
        createdAt: { $first: "$entity.createdAt" },
      },
    },
    {
      $sort: { createdAt: 1 },
    },
  ]);

  res.status(200);
  res.json({ message: "Entity Dash received successfully", data });
};
