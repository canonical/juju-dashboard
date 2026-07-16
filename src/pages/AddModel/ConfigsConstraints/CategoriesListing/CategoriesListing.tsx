import {
  Col,
  FormikField,
  RadioInput,
  Row,
  SearchBox,
  Switch,
  Textarea,
  Tooltip,
} from "@canonical/react-components";
import classNames from "classnames";
import { useFormikContext } from "formik";
import { useId, useState, type ChangeEvent, type JSX } from "react";

import useDebounce from "hooks/useDebounce";

import { InputMode } from "../../types";
import StackList from "../StackList";
import { YAMLErrorType } from "../YAMLErrorsModal/types";
import type { ConfigFieldEntry, FormFields } from "../types";
import {
  buildYAML,
  filterEntriesBySearch,
  groupEntriesByCategory,
  validateAndParseYAML,
} from "../utils";

import type { Props } from "./types";

const CategoriesListing = ({
  title,
  arrayName,
  inputMode,
  yamlKey,
  changedOnlyLabel,
  docsLabel,
  docsLink,
  tooltipMessage,
  searchPlaceholder,
  yamlPlaceholder,
  searchName,
  setYAMLErrors,
  yamlErrorLabel,
}: Props): JSX.Element => {
  const id = useId();
  const { values, setFieldError, setFieldTouched, setFieldValue } =
    useFormikContext<FormFields>();
  const [searchQuery, setSearchQuery] = useDebounce("", 250);
  const [changedOnly, setChangedOnly] = useState(false);

  const entries: ConfigFieldEntry[] = values[arrayName];

  const isListMode = values[inputMode] === InputMode.LIST;
  const handleModeChange = (isListModeSelected: boolean): void => {
    if (!isListModeSelected) {
      void setFieldValue(yamlKey, buildYAML(entries));
    } else {
      const yamlString = values[yamlKey];
      if (!yamlString) {
        void setFieldValue(inputMode, InputMode.LIST);
        return;
      }
      const { validValues, errors } = validateAndParseYAML(yamlString, entries);
      void setFieldValue(arrayName, validValues);

      if (
        errors[YAMLErrorType.UNKNOWN_KEYS].length > 0 ||
        errors[YAMLErrorType.INVALID_VALUES].length > 0 ||
        errors[YAMLErrorType.OTHERS].length > 0
      ) {
        void setFieldTouched(yamlKey, true, false);
        // setFieldError must be called after setFieldTouched to prevent
        // Formik's internal validation run from wiping the error message.
        setTimeout(() => {
          setFieldError(yamlKey, yamlErrorLabel);
        }, 0);
        setYAMLErrors({ errors, inputMode, yamlKey });
        return;
      }

      setFieldError(yamlKey, undefined);
    }

    void setFieldValue(
      inputMode,
      isListModeSelected ? InputMode.LIST : InputMode.YAML,
    );
  };

  const filteredEntries = filterEntriesBySearch(searchQuery, entries);
  const changedGroups = groupEntriesByCategory(filteredEntries, true);
  const hasChangedFields = changedGroups.length > 0;
  const visibleGroups = changedOnly
    ? changedGroups
    : groupEntriesByCategory(filteredEntries);

  const changedOnlySwitch = (
    <Switch
      label={changedOnlyLabel}
      checked={changedOnly}
      onChange={(event: ChangeEvent<HTMLInputElement>): void => {
        if (!hasChangedFields && event.target.checked) {
          return;
        }

        setChangedOnly(event.target.checked);
      }}
    />
  );

  return (
    <section
      className="p-section u-no-padding--bottom categories-listing"
      aria-labelledby={`title-${id}`}
    >
      <h5 id={`title-${id}`} className="u-no-padding--top u-no-margin--bottom">
        {title}
      </h5>
      <p className="u-no-margin--bottom p-text--small">
        <a href={docsLink} target="_blank">
          {docsLabel}
        </a>
      </p>
      <div className="u-flex u-flex--gap">
        <div>
          <RadioInput
            checked={isListMode}
            label={InputMode.LIST}
            name={`mode-${id}`}
            onChange={() => {
              handleModeChange(true);
            }}
            value={InputMode.LIST}
          />
        </div>
        <div>
          <RadioInput
            checked={!isListMode}
            label={InputMode.YAML}
            name={`mode-${id}`}
            onChange={() => {
              handleModeChange(false);
            }}
            value={InputMode.YAML}
          />
        </div>
      </div>
      {isListMode ? (
        <>
          <div className="row u-no-padding">
            <div className="col-4">
              <SearchBox
                name={searchName}
                id={`search-${id}`}
                placeholder={searchPlaceholder}
                onChange={setSearchQuery}
                onClear={() => {
                  setSearchQuery("", { immediate: true });
                }}
                className="u-no-margin--bottom"
                aria-label={searchPlaceholder}
              />
            </div>
          </div>
          {hasChangedFields ? (
            changedOnlySwitch
          ) : (
            <Tooltip message={tooltipMessage} position="btm-left">
              {changedOnlySwitch}
            </Tooltip>
          )}
          <div className="categories__form-scroll u-sv-1--top">
            {visibleGroups.length > 0 ? (
              visibleGroups.map(({ category, fields }, index) => (
                <Row
                  key={category}
                  className={classNames("u-no-padding", {
                    "u-sv1--top": index !== 0,
                  })}
                >
                  <Col size={3}>
                    <h5>{category}</h5>
                  </Col>
                  <Col size={9}>
                    <StackList visibleFields={fields} arrayName={arrayName} />
                  </Col>
                  {index < visibleGroups.length - 1 ? (
                    <hr className="p-rule--muted" />
                  ) : null}
                </Row>
              ))
            ) : (
              <h5>No results found for {`"${searchQuery}"`}</h5>
            )}
          </div>
        </>
      ) : (
        <div className="row u-no-padding">
          <div className="col-6">
            <FormikField
              className="categories__yaml-input"
              component={Textarea}
              name={yamlKey}
              placeholder={yamlPlaceholder}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoriesListing;
