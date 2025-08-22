export type CustomersTableType = {
  id: number;
  onlineId: number | null;
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
  onlineId: number | null;
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

export type MedicalRepresentativeTableType = {
  id: number;
  onlineId: number | null;
  name: string | null;
  apiKey: string | null;
  productAppId: string | null;
  salesOrderAppId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};

export type salesOrderTableType = {
  id: number;
  onlineId: number | null;
  customerId: number | null;
  customerOnlineId: number | null;
  medicalRepresentativeId: number;
  salesOrderNumber: string;
  dateSold: string;
  total: string;
  remarks: string | null;
  syncDate: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};
