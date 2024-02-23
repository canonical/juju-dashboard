export type ConfigValue = string | number | boolean | undefined;

export type ConfigOption<V, T> = {
  default?: V;
  description: string;
  error?: string | null;
  name: string;
  newValue?: V;
  source: "default" | "user";
  type: T;
  value?: V;
};

export type ConfigData =
  | ConfigOption<string, "string" | "secret">
  | ConfigOption<number, "int" | "float">
  | ConfigOption<boolean, "boolean">;

export type Config = {
  [key: string]: ConfigData;
};
