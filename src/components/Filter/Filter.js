import React from "react";
import Button from "components/Button/Button";

import "./_filter.scss";

const Filter = ({ label, filters }) => {
  const filterButtons = filters.map(filter => (
    <span key={filter} className="p-filter__item">
      <Button>{filter}</Button>
    </span>
  ));
  return (
    <div className="p-filter">
      <span className="p-filter__label">{label}</span>
      {filterButtons}
    </div>
  );
};

export default Filter;
