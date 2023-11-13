import {
  Input,
  type InputProps,
  type PropsWithSpread,
} from "@canonical/react-components";
import type { HTMLProps, ReactNode } from "react";
import { useId } from "react";

type Option = PropsWithSpread<
  {
    label: ReactNode;
    value: string;
  },
  HTMLProps<HTMLOptionElement>
>;

type Props = PropsWithSpread<
  {
    options?: (string | Option)[] | null;
  },
  InputProps
>;

const generateOptions = (options: Props["options"]) =>
  options?.map((option) => {
    if (typeof option === "string") {
      return <option value={option} key={option} />;
    }
    const { value, label, ...props } = option;
    return (
      <option value={value} key={value} {...props}>
        {label}
      </option>
    );
  });

const AutocompleteInput = ({ options, ...props }: Props) => {
  const id = useId();
  return (
    <>
      <Input {...props} list={id} />
      <datalist id={id}>{generateOptions(options)}</datalist>
    </>
  );
};

export default AutocompleteInput;
