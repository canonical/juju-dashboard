import type React from "react";
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";

import RadioInputBox from "components/RadioInputBox";

import type { ActionData } from "../types";

import type { FormRef } from "./ActionForm";
import ActionForm from "./ActionForm";
import type { FormControlRef } from "./types";

type Props = {
  /** Available actions to render. */
  actions: ActionData;
  /** Reference to the active form instance. Useful for submitting the form from elsewhere. */
  formControlRef?: React.Ref<FormControlRef>;
  /** Callback when an action is submitted. */
  onSubmit?: (
    action: string,
    properties: Record<string, boolean | string>,
  ) => void;
  /** Callback whenever the validity of the selected action changes. */
  onValidate?: (valid: boolean) => void;
};

export default function ActionsList({
  actions,
  formControlRef,
  onSubmit,
  onValidate,
}: Props): JSX.Element {
  const [selectedAction, setSelectedAction] = useState<keyof ActionData | null>(
    null,
  );
  const [formValid, setFormValid] = useState<Record<string, boolean>>({});
  const formRefs = useRef<Record<string, FormRef>>({});

  // Ensure `formRef` always points to the active ref.
  useImperativeHandle(
    formControlRef,
    () => ({
      submitForm: async (): Promise<void> => {
        if (selectedAction === null) {
          return;
        }

        await formRefs.current[selectedAction]?.submitForm();
      },

      get values(): null | Record<string, boolean | string> {
        if (selectedAction === null) {
          return null;
        }

        return formRefs.current[selectedAction]?.values ?? null;
      },
    }),
    [selectedAction],
  );

  // Call `onValidate` whenever the selected form changes validation state.
  useEffect(() => {
    // If nothing is selected, then it's not valid.
    if (selectedAction === null) {
      onValidate?.(false);
      return;
    }

    onValidate?.(formValid[selectedAction] ?? false);
  }, [onValidate, formValid, selectedAction]);

  // Pre-process all actions into a simpler format.
  const processedActions = useMemo(
    () =>
      Object.entries(actions).map(([name, action]) => ({
        name,
        description: action.description,
        properties: Object.entries(
          action.params.properties as Record<
            string,
            { description: string; type: string }
          >,
        ).map(([propertyName, property]) => ({
          name: propertyName,
          description: property.description,
          type: property.type,
          required:
            (action.params.required as string[] | undefined)?.includes(
              propertyName,
            ) ?? false,
        })),
      })),
    [actions],
  );

  function handleSubmit(
    action: string,
    properties: Record<string, boolean | string>,
  ): void {
    if (selectedAction !== action) {
      return;
    }

    onSubmit?.(action, properties);
  }

  function handleSelect(action: string): void {
    setSelectedAction(action);
  }

  function handleValid(action: string, valid: boolean): void {
    if (formValid[action] === valid) {
      return;
    }

    setFormValid((existing) => ({ ...existing, [action]: valid }));
  }

  return (
    <>
      {processedActions.map(({ name, description, properties }) => (
        <RadioInputBox
          key={name}
          name={name}
          description={description}
          selectedInput={selectedAction ?? undefined}
          onSelect={() => {
            handleSelect(name);
          }}
        >
          <ActionForm
            properties={properties}
            formRef={(ref) => void (formRefs.current[name] = ref)}
            onSubmit={(submittedProperties) => {
              handleSubmit(name, submittedProperties);
            }}
            onValidate={(valid) => {
              handleValid(name, valid);
            }}
          />
        </RadioInputBox>
      ))}
    </>
  );
}
