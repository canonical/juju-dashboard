import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { getModelData } from "app/selectors";
import {
  extractCloudName,
  extractOwnerName,
  extractCredentialName,
  pluralize
} from "app/utils";

import "./_filter-tags.scss";

const FilterTags = () => {
  const [filterPanelVisibility, setfilterPanelVisibility] = useState(false);
  const node = useRef();

  const filters = {};

  const modelData = useSelector(getModelData);

  const addFilter = function(type, value) {
    filters[type] = filters[type] || [];
    if (!filters[type].includes(value)) {
      filters[type].push(value);
    }
  };

  // Loop the model data and pull out the available filters
  Object.values(modelData).forEach(model => {
    if (!model.info) {
      return;
    }
    // Extract cloud filters
    const cloudFilter = extractCloudName(model.info.cloudTag);
    addFilter("cloud", cloudFilter);

    // Extract region filters
    const regionFilter = model.info.cloudRegion;
    addFilter("region", regionFilter);

    // Extract owner filters
    const ownerFilter = extractOwnerName(model.info.ownerTag);
    addFilter("owner", ownerFilter);

    // Extract credential filters
    const credentialFilter = extractCredentialName(
      model.info.cloudCredentialTag
    );
    addFilter("credential", credentialFilter);
  });

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

  const handleFilterClick = () => {
    console.log("Filter clicked");
  };

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
        {Object.keys(filters).map(filterBy => {
          return (
            filters[filterBy].length > 0 && (
              <div key={filterBy} className="p-filter-panel__section">
                <h4 className="p-filter-panel__heading">
                  {pluralize(filters[filterBy].length, filterBy)}
                </h4>
                <ul
                  className="p-list p-filter-panel__list"
                  data-test={filterBy}
                >
                  {filters[filterBy].map(filter => (
                    <li key={filter} className="p-filter-panel__item">
                      <button
                        onClick={e => handleFilterClick(e)}
                        className="p-filter-panel__button"
                      >
                        {filter}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
};

export default FilterTags;
