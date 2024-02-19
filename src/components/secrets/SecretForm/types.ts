export type SecretPairs = {
  isBase64: boolean;
  key: string;
  value: string;
};

export type FormFields = {
  autoPrune: boolean;
  description: string;
  label: string;
  pairs: SecretPairs[];
};
