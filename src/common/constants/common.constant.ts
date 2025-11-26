export enum ORDER_DIRECTION {
  ASC = "ASC",
  DESC = "DESC",
}

export const FIELD_SORT_DEFAULT = "id";
export const PAGINATION_PAGE_SIZE = 10;
export const PAGINATION_PAGE_DEFAULT = 1;


export enum TABLE_NAMES {
  USER = "user",
  PARKING_LOT = "parking-lot",
  CAR_HISTORY = "car-history",
  BILL = "bill",
}

export enum APP_ROLE {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

export enum CAMERA_TYPE {
  ENTRY = "entry_gate",
  EXIT = "exit_gate",
}

export enum BillType {
  TEMPORARY = "temporary",
  MONTHLY = "monthly",
  MEMBER_SHIP_PAY = "membership",
}

export enum MemberShipRegisterType {
	MONTH_1 = "1_month",
	MONTH_3 = "3_months",
	MONTH_6 = "6_months",
	MONTH_12 = "12_months",
}