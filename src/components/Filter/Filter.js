import React from "react";
import Button from "components/Button/Button";
import classNames from "classnames";

import "./_filter.scss";

const Filter = ({ label, filters, setViewFilterToggle, viewFilterToggle }) => {
  const handleViewFilterClick = filter => {
    setViewFilterToggle(viewFilterToggle => {
      const tempViewFilterToggle = { ...viewFilterToggle };
      tempViewFilterToggle[filter] = !tempViewFilterToggle[filter];
      if (filter !== "all") {
        tempViewFilterToggle["all"] = false;
      } else {
        Object.keys(tempViewFilterToggle).forEach(filter => {
          tempViewFilterToggle[filter] = false;
        });
        tempViewFilterToggle["all"] = true;
      }

      // If user unselected all specific view filters, return to 'all' default
      const isFalse = currentValue => currentValue === false;
      if (Object.values(tempViewFilterToggle).every(isFalse)) {
        tempViewFilterToggle["all"] = true;
      }
      return tempViewFilterToggle;
    });
  };

  const filterButtons = filters.map(filter => {
    return (
      <span
        key={filter}
        data-test={filter}
        className={classNames("p-filter__item", {
          "is-selected":
            viewFilterToggle && viewFilterToggle[filter] ? "is-selected" : null
        })}
      >
        <Button onClick={() => handleViewFilterClick(filter)}>{filter}</Button>
      </span>
    );
  });
  return (
    <div className="p-filter">
      <span className="p-filter__label">{label}</span>
      {filterButtons}
    </div>
  );
};

export default Filter;
