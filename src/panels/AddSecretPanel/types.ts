export enum RotatePolicy {
  NEVER = "never",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

export type SecretPairs = {
  isBase64: boolean;
  key: string;
  value: string;
};

export type FormFields = {
  description: string;
  expiryTime: string;
  label: string;
  pairs: SecretPairs[];
  rotatePolicy: RotatePolicy;
};
