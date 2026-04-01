import type { OptionHTMLAttributes } from "react";

export type Props = {
  cloudOptions: OptionHTMLAttributes<HTMLOptionElement>[];
  credentialsOptions: OptionHTMLAttributes<HTMLOptionElement>[];
  defaultCloud: string;
  onCloudChange: (nextCloud: string) => void;
};
