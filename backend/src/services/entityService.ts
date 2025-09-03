import { Model, ObjectId } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import MeasurementModel, {
  ChakraModel,
  EnergyModel,
  GlandModel,
  OrganModel,
  ProductModel,
  SpaceModel,
} from "../models/MeasurementModel";
import {
  Entity,
  MeasurableEntityClass,
  MeasurableEntityNames,
} from "../models/MeasurementModel/Entities";

class EntityServiceClass {
  entityModelMap: Record<MeasurableEntityNames, Model<MeasurableEntityClass>> =
    {
      Energy: EnergyModel,
      Chakra: ChakraModel,
      Organ: OrganModel,
      Gland: GlandModel,
      Space: SpaceModel,
      Product: ProductModel,
    };

  async getEntitiesByType(
    entityType: MeasurableEntityNames,
    req: AuthenticatedRequest,
    clientId: string
  ): Promise<Entity[]> {
    const model = this.entityModelMap[entityType];

    if (!model) {
      throw new Error(`entityType ${entityType} is not a valid Entity`);
    }

    return await model.find({ user: req.user?._id, client: clientId }).exec();
  }

  async createEntityByType(
    entityType: MeasurableEntityNames,
    name: string,
    userId: string,
    clientId: string
  ): Promise<MeasurableEntityClass> {
    const model = this.entityModelMap[entityType];

    if (!model) {
      throw new Error(`entityType ${entityType} is not a valid Entity`);
    }

    const payload: Record<string, any> = {
      name,
      user: userId,
      client: clientId,
      type: entityType,
    };

    return await model.create(payload);
  }

  async createDefaultEntitiesForClient(userId: string, clientId: string) {
    const defaults: Record<MeasurableEntityNames, string[]> = {
      Energy: ["Cosmic Energy", "Telluric Energy", "Global Energy"],
      Chakra: [
        "Crown (Sahasrara)",
        "Third Eye (Ajna)",
        "Throat (Vishuddha)",
        "Heart (Anahata)",
        "Solar Plexus (Manipura)",
        "Sacral (Svadhisthana)",
        "Root (Muladhara)",
      ],
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

    const energyPayloads = defaults.Energy.map((e) => ({
      name: e,
      user: userId,
      client: clientId,
      type: "Energy" as MeasurableEntityNames,
    }));
    const chakraPayloads = defaults.Chakra.map((e) => ({
      name: e,
      user: userId,
      client: clientId,
      type: "Chakra" as MeasurableEntityNames,
    }));
    const glandPayloads = defaults.Gland.map((e) => ({
      name: e,
      user: userId,
      client: clientId,
      type: "Gland" as MeasurableEntityNames,
    }));
    const organPayloads = defaults.Organ.map((e) => ({
      name: e,
      user: userId,
      client: clientId,
      type: "Organ" as MeasurableEntityNames,
    }));
    const productPayloads = defaults.Product.map((e) => ({
      name: e,
      user: userId,
      client: clientId,
      type: "Product" as MeasurableEntityNames,
    }));
    const spacePayloads = defaults.Space.map((e) => ({
      name: e,
      user: userId,
      client: clientId,
      type: "Space" as MeasurableEntityNames,
    }));

    await this.entityModelMap["Energy"].insertMany(energyPayloads);
    await this.entityModelMap["Chakra"].insertMany(chakraPayloads);
    await this.entityModelMap["Gland"].insertMany(glandPayloads);
    await this.entityModelMap["Organ"].insertMany(organPayloads);
    await this.entityModelMap["Space"].insertMany(spacePayloads);
    await this.entityModelMap["Product"].insertMany(productPayloads);
  }

  async deleteEntityByType(
    entityType: MeasurableEntityNames,
    entityId: string,
    userId: string,
    clientId: string
  ): Promise<MeasurableEntityClass> {
    const model = this.entityModelMap[entityType];

    if (!model) {
      throw new Error(`entityType ${entityType} is not a valid Entity`);
    }

    const deleted = await model.findOneAndDelete({
      _id: entityId,
      user: userId,
      client: clientId,
    });

    if (!deleted) {
      throw new Error(
        `Entity with ID ${entityId} not found or not authorized to delete`
      );
    }

    // Cascade delete measurements that reference this entity
    await MeasurementModel.deleteMany({
      user: userId,
      client: clientId,
      "readings.on": deleted._id,
    });

    return deleted;
  }
}

const EntityService = new EntityServiceClass();

export default EntityService;
