import React, { Component } from "react";
import Button from "../Button/Button";

import "./_filter.scss";

export default class Filter extends Component {
  render() {
    const { label, filters } = this.props;
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
  }
}
