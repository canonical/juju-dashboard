export enum RotatePolicy {
  NEVER = "never",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

export type FormFields = {
  content: string;
  description: string;
  expiryTime: string;
  isBase64: boolean;
  label: string;
  rotatePolicy: RotatePolicy;
};
