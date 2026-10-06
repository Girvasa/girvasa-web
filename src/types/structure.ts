export type UnitType = "RESIDENTIAL" | "COMMERCIAL" | "PENTHOUSE" | "STUDIO" | "OTHER";
export type UnitStatus = "VACANT" | "OCCUPIED" | "UNDER_MAINTENANCE" | "INACTIVE";

export interface BuildingResponse {
  id: string;
  societyId: string;
  name: string;
  code: string;
  totalFloors: number;
  totalUnits: number;
  description?: string;
  createdAt: string;
}

export interface WingResponse {
  id: string;
  buildingId: string;
  name: string;
  code: string;
  totalFloors: number;
}

export interface UnitResponse {
  id: string;
  societyId: string;
  buildingId: string;
  buildingName?: string;
  wingId?: string;
  wingName?: string;
  unitNumber: string;
  floorNumber: number;
  unitType: UnitType;
  status: UnitStatus;
  squareFeet?: number;
  createdAt: string;
}
