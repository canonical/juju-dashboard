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

const isOption = (option: any): option is Option =>
  option instanceof Object &&
  option?.label &&
  typeof option?.value === "string";

type Props = PropsWithSpread<{ options: unknown[] }, InputProps>;

const generateOptions = (options: Props["options"]) =>
  options
    .filter((option) => typeof option === "string" || isOption(option))
    .map((option) => {
      if (typeof option === "string") {
        return <option value={option} key={option} />;
      }
      if (isOption(option)) {
        const { value, label, ...props } = option;
        return (
          <option value={value} key={value} {...props}>
            {label}
          </option>
        );
      }
      return null;
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
