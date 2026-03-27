export enum SpaceType {
  DESK = "DESK",
  PRIVATE_POD = "PRIVATE_POD",
}

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSpaceDTO {
  name: string;
  type: SpaceType;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
}
