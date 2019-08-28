import React, { Component } from "react";
import Button from "../Button/Button";

export default class Filter extends Component {
  render() {
    const { label, filters } = this.props;
    const filterButtons = filters.map(filter => (
      <li key={filter} class="p-inline-list__item">
        <Button>{filter}</Button>
      </li>
    ));
    return (
      <ul class="p-inline-list">
        <li class="p-inline-list__item">{label}</li>
        {filterButtons}
      </ul>
    );
  }
}
