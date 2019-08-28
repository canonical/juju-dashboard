import React, { Component } from "react";
import Button from "../Button/Button";

export default class Filter extends Component {
  render() {
    const { label, filters } = this.props;
    const filterButtons = filters.map(filter => (
      <li key={filter} className="p-inline-list__item">
        <Button>{filter}</Button>
      </li>
    ));
    return (
      <ul className="p-inline-list">
        <li className="p-inline-list__item">{label}</li>
        {filterButtons}
      </ul>
    );
  }
}
