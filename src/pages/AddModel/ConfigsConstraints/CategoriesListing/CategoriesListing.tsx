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
import type { FormFields } from "../types";
import {
  buildYAML,
  filterCategoriesBySearch,
  getCategoriesWithVisibleFields,
} from "../utils";

import type { Props } from "./types";

const CategoriesListing = ({
  title,
  categoriesList,
  inputMode,
  yamlKey,
  changedOnlyLabel,
  docsLabel,
  docsLink,
  tooltipMessage,
  searchPlaceholder,
  yamlPlaceholder,
  searchName,
}: Props): JSX.Element => {
  const id = useId();
  const { values, setFieldValue } = useFormikContext<
    FormFields & Record<string, string>
  >();
  const [searchQuery, setSearchQuery] = useDebounce("", 250);
  const [changedOnly, setChangedOnly] = useState(false);

  const isListMode = values[inputMode] !== InputMode.YAML;
  const handleModeChange = (isListModeSelected: boolean): void => {
    if (!isListModeSelected) {
      void setFieldValue(yamlKey, buildYAML(categoriesList, values));
    }

    void setFieldValue(
      inputMode,
      isListModeSelected ? InputMode.LIST : InputMode.YAML,
    );
  };

  const filteredCategories = filterCategoriesBySearch(
    searchQuery,
    categoriesList,
  );
  const categoriesWithChangedFields = getCategoriesWithVisibleFields(
    filteredCategories,
    values,
  );
  const hasChangedFields = categoriesWithChangedFields.length > 0;
  const visibleCategories = changedOnly
    ? categoriesWithChangedFields
    : filteredCategories;

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
        <a href={docsLink}>{docsLabel}</a>
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
            {visibleCategories.length > 0 ? (
              visibleCategories.map(({ category, fields }, index) => (
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
                    <StackList visibleFields={fields} />
                  </Col>
                  {index < visibleCategories.length - 1 ? (
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
