import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";

import "./_filter-tags.scss";

const FilterTags = () => {
  const [filterPanelVisibility, setfilterPanelVisibility] = useState(false);
  const node = useRef();

  useEffect(() => {
    const closePanel = () => {
      setfilterPanelVisibility(false);
      document.querySelector(".p-filter-tags__input").blur();
    };

    const mouseDown = e => {
      // Check if click is outside of filter panel
      if (!node.current.contains(e.target)) {
        // If so, close the panel
        closePanel();
      }
    };

    const keyDown = e => {
      if (e.keyCode === 27) {
        // Close panel if Esc keydown detected
        closePanel();
      }
    };

    // Add listener on document to capture click events
    document.addEventListener("mousedown", mouseDown);
    // Add listener on document to capture keydown events
    document.addEventListener("keydown", keyDown);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("keydown", keyDown);
    };
  }, []);

  return (
    <div className="p-filter-tags" ref={node}>
      <form>
        <input
          type="text"
          placeholder="Filter terms"
          className="p-filter-tags__input"
          onFocus={() => setfilterPanelVisibility(true)}
        />
      </form>
      <div
        className={classNames("p-card--highlighted p-filter-panel", {
          "is-visible": filterPanelVisibility
        })}
      >
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
