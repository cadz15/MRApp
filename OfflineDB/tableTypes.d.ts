export type CustomersTableType = {
  id: number;
  name: string;
  fullAddress: string;
  shortAddress: string;
  region: string;
  class: string;
  practice: string | null;
  s3License: string | null;
  s3Validity: string | null;
  pharmacistName: string | null;
  prcId: string | null;
  prcValidity: string | null;
  remarks: string | null;
  syncDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};

export type ItemsTableType = {
  id: number;
  brandName: string | null;
  genericName: string | null;
  milligrams: string | null;
  supply: string | null;
  catalogPrice: string;
  productType: string;
  inventory: number;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};
