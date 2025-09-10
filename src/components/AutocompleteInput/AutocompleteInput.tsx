import {
  Input,
  type InputProps,
  type PropsWithSpread,
} from "@canonical/react-components";
import type { FC, HTMLProps, ReactNode } from "react";
import { useId } from "react";

type AutocompleteOption = PropsWithSpread<
  {
    label: ReactNode;
    value: string;
  },
  HTMLProps<HTMLOptionElement>
>;

type Props = PropsWithSpread<
  {
    options?: (AutocompleteOption | string)[] | null;
  },
  InputProps
>;

const generateOptions = (options: Props["options"]): ReactNode =>
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

const AutocompleteInput: FC<Props> = ({ options, ...props }: Props) => {
  const id = useId();
  return (
    <>
      <Input {...props} list={id} />
      <datalist id={id}>{generateOptions(options)}</datalist>
    </>
  );
};

export default AutocompleteInput;
