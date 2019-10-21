import React from "react";

import "./_filter-tags.scss";

const FilterTags = () => {
  return (
    <div className="p-filter-tags">
      <form>
        <input
          type="text"
          placeholder="Filter terms"
          className="p-filter-tags__input"
        />
      </form>
      <div className="p-card--highlighted p-filter-panel">
        <div className="p-filter-panel__section">
          <h4 className="p-filter-panel__heading">Owner</h4>
          <ul className="p-list p-filter-panel__list">
            <li className="p-filter-panel__item is-selected">is-team</li>
            <li className="p-filter-panel__item">dev-team</li>
            <li className="p-filter-panel__item">yellow-team</li>
          </ul>
        </div>
        <div className="p-filter-panel__section">
          <h4 className="p-filter-panel__heading">Cloud</h4>
          <ul className="p-list p-filter-panel__list">
            <li className="p-filter-panel__item">AWS</li>
            <li className="p-filter-panel__item">Google</li>
          </ul>
        </div>
        <div className="p-filter-panel__section">
          <h4 className="p-filter-panel__heading">Region</h4>
          <ul className="p-list p-filter-panel__list">
            <li className="p-filter-panel__item">eu-west-1</li>
            <li className="p-filter-panel__item">eu-west-2</li>
          </ul>
        </div>
        <div className="p-filter-panel__section">
          <h4 className="p-filter-panel__heading">Credential</h4>
          <ul className="p-list p-filter-panel__list">
            <li className="p-filter-panel__item">cred-1</li>
            <li className="p-filter-panel__item">cred-2</li>
          </ul>
        </div>
        <div className="p-filter-panel__section">
          <h4 className="p-filter-panel__heading">Controller</h4>
          <ul className="p-list p-filter-panel__list">
            <li className="p-filter-panel__item">prodstack-1</li>
            <li className="p-filter-panel__item">prodstack-2</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FilterTags;
