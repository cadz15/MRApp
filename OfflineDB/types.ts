// src/database/types.ts

export interface Customer {
  id?: number;
  name: string;
  full_address: string;
  short_address: string;
  region: string;
  class: string;
  practice?: string;
  s3_license?: string;
  s3_validity?: string;
  pharmacist_name?: string;
  prc_id?: string;
  prc_validity?: string;
  remarks?: string;
  sync_date?: string;
  synced?: number;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Item {
  id?: number;
  brand_name: string;
  generic_name: string;
  milligrams: string;
  supply: string;
  catalog_price: string;
  product_type: string;
  inventory: number;
  sync_date?: string;
  synced?: number;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ItemImage {
  id?: number;
  item_id: number;
  link: string;
  sync_date?: string;
  synced?: number;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface SalesOrder {
  id?: number;
  customer_id: number;
  medical_representative_id: number;
  sales_order_number: string;
  date_sold: string;
  total: string;
  remarks?: string;
  sync_date?: string;
  status: string;
  synced?: number;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface SalesOrderItem {
  id?: number;
  sales_order_id: number;
  item_id: number;
  quantity: string;
  promo: string;
  discount?: string;
  free_item_quantity?: string;
  free_item_remarks?: string;
  remarks?: string;
  total: number;
  sync_date?: string;
  synced?: number;
  updated_at?: string;
  deleted_at?: string | null;
}
