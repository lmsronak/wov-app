export interface Entity {
  _id: string;
  name: string;
  user: string; // assuming populated refs will not be used here
  client: string;
  type: MeasurableEntityNames;
  createdAt: string;
  updatedAt: string;
}

export interface Energy extends Entity {
  type: "Energy";
}

export interface Chakra extends Entity {
  type: "Chakra";
}

export interface Organ extends Entity {
  type: "Organ";
}

export interface Gland extends Entity {
  type: "Gland";
}

export interface Space extends Entity {
  type: "Space";
}

export interface Product extends Entity {
  type: "Product";
}

export type MeasurableEntityNames =
  | "Energy"
  | "Chakra"
  | "Organ"
  | "Gland"
  | "Space"
  | "Product";

export type MeasurableEntityType =
  | Energy
  | Chakra
  | Organ
  | Gland
  | Space
  | Product;

export interface Reading<
  T extends MeasurableEntityType | string = MeasurableEntityType
> {
  beforeVal: number | null | "";
  afterVal: number | null | "";
  on: T; // Ref<MeasurableEntityClass> as string _id
  onModel: MeasurableEntityNames;
  location?: string;
  measurementFor?: string;
  person?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Measurement {
  _id: string;
  user: string; // Ref<User> as string _id
  client: string; // Ref<User> as string _id
  readings: Reading[];
  type: MeasurableEntityNames;
  location?: string;
  person?: string;
  description?: string;
  measurementFor?: string;
  createdAt: string;
  updatedAt: string;
}
