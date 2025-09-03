import { Request, Response } from "express";
import PlanModel from "../models/planModel";

export const createPlan = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      interval,
      features,
      externalId,
      isVisibleToStudents,
    } = req.body;
    const plan = await PlanModel.create({
      name,
      description,
      priceInRupees: price,
      interval,
      features,
      externalId,
      isVisibleToStudents,
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to create plan", error });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      interval,
      features,
      externalId,
      customInterval,
      isVisibleToStudents,
    } = req.body;

    // Find and update plan
    const updatedPlan = await PlanModel.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { priceInRupees: price }),
        ...(interval && { interval }),
        ...(features && { features }),
        ...(externalId && { externalId }),
        ...(customInterval && { customInterval }),
        ...(typeof isVisibleToStudents === "boolean" && {
          isVisibleToStudents,
        }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: "Failed to update plan", error });
  }
};

export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const plans = await PlanModel.find({ isDeleted: false });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plans", error });
  }
};

export const softDeletePlan = async (req: Request, res: Response) => {
  try {
    const plan = await PlanModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ message: "Plan deleted (soft)", plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete plan", error });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await PlanModel.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plan", error });
  }
};
