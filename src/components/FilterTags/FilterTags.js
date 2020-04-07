import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { getModelData } from "app/selectors";
import queryString from "query-string";

import {
  extractCloudName,
  extractOwnerName,
  extractCredentialName,
  pluralize,
} from "app/utils";

import useAnalytics from "hooks/useAnalytics";

import "./_filter-tags.scss";

const FilterTags = () => {
  const history = useHistory();
  const location = useLocation();

  const queryParams = queryString.parse(location.search, {
    arrayFormat: "comma",
  });
  let queryParamsActiveFilters = queryParams.activeFilters;
  if (typeof queryParamsActiveFilters === "string") {
    // Maintain a consistent type returned from the parsing of the querystring.
    queryParamsActiveFilters = [queryParamsActiveFilters];
  }
  const [filterPanelVisibility, setFilterPanelVisibility] = useState(false);
  const [activeFilters, setActiveFilters] = useState(
    queryParamsActiveFilters || []
  );

  const node = useRef();
  const filters = {};
  const modelData = useSelector(getModelData);

  const sendAnalytics = useAnalytics();

  /**
    Check if filter exists and adds to array if not
    @param {string} string The type of filter
    @param {string} value The name of the filter
  */
  const addFilter = function (type, value) {
    filters[type] = filters[type] || [];
    if (!filters[type].includes(value)) {
      filters[type].push(value);
    }
  };

  // Loop the model data and pull out the available filters
  Object.values(modelData).forEach((model) => {
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

  // This useEffect sets up listeners so the panel will close if user clicks anywhere else on the page or hits the escape key
  useEffect(() => {
    const closePanel = () => {
      setFilterPanelVisibility(false);
    };

    const mouseDown = (e) => {
      // Check if click is outside of filter panel
      if (!node.current.contains(e.target)) {
        // If so, close the panel
        closePanel();
      }
    };

    const keyDown = (e) => {
      if (e.code === "Escape") {
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

  // Update query params when adding and removing filters
  useEffect(() => {
    const queryParams = queryString.parse(location.search);
    queryParams.activeFilters = activeFilters;
    history.push({
      search: queryString.stringify(queryParams, {
        arrayFormat: "comma",
      }),
    });
  }, [activeFilters, history, location.search]);

  /**
  Apply a given filter
  @param {object} e The event object
  @param {string} filter The name of the filter
   @param {string} filterBy The name of the filter group
*/
  const addActiveFilter = (filter) => {
    setActiveFilters((filters) => {
      const updatedFilters = [...filters];
      if (!updatedFilters.includes(filter)) {
        updatedFilters.push(filter);
      }
      return updatedFilters;
    });
  };

  /**
  Remove a given filter
  @param {object} e The event object
  @param {string} filter The name of the filter
   @param {string} filterBy The name of the filter group
*/
  const removeActiveFilter = (filter) => {
    setActiveFilters((filters) => {
      const updatedFilters = [...filters];
      if (updatedFilters.includes(filter)) {
        const index = updatedFilters.indexOf(filter);
        updatedFilters.splice(index, 1);
      }
      return updatedFilters;
    });
  };

  return (
    <span className="p-contextual-menu" ref={node}>
      <button
        className="p-contextual-menu__toggle is-dense"
        aria-controls="filter-tags"
        aria-expanded="false"
        aria-haspopup="true"
        onClick={() => {
          setFilterPanelVisibility(!filterPanelVisibility);
          sendAnalytics({
            category: "User",
            action: "Toggled filter panel",
          });
        }}
      >
        <span className="p-filter-tags__active-count">
          {activeFilters.length
            ? `Active filters: ${activeFilters.length}`
            : "Filter models"}
        </span>
        <i
          className={classNames("p-icon--contextual-menu", {
            "is-active": filterPanelVisibility,
          })}
        ></i>
      </button>
      <span
        className={classNames("p-contextual-menu__dropdown p-filter-panel", {
          "is-visible": filterPanelVisibility,
        })}
        id="filter-tags"
        aria-hidden="true"
        aria-label="submenu"
      >
        <span className="p-contextual-menu__group">
          {Object.entries(filters).length <= 0 && <p>Loading filters...</p>}
          <div className="p-filter-panel__section" data-test="selected">
            {Object.entries(filters).length > 0 && (
              <h4 className="p-contextual-menu__dropdown__heading">Selected</h4>
            )}
            {Array.isArray(activeFilters) &&
              Object.entries(filters).length > 0 &&
              activeFilters.length > 0 &&
              activeFilters.map((activeFilter) => (
                <button
                  className="p-contextual-menu__dropdown__button p-filter-tags__active-filter"
                  onClick={() => removeActiveFilter(activeFilter)}
                  key={activeFilter}
                >
                  {activeFilter.replace(":", ": ")}
                  <i className="p-icon--close" href="#_">
                    Remove
                  </i>
                </button>
              ))}
          </div>
          {Object.keys(filters).map((filterBy) => {
            return (
              filters[filterBy].length > 0 && (
                <div
                  key={filterBy}
                  className="p-contextual-menu__dropdown__section"
                >
                  <h4 className="p-contextual-menu__dropdown__heading">
                    {pluralize(filters[filterBy].length, filterBy)}
                  </h4>
                  <ul
                    className="p-list p-contextual-menu__dropdown__list"
                    data-test={filterBy}
                  >
                    {filters[filterBy].map((filter) => (
                      <li
                        key={filter}
                        className="p-contextual-menu__dropdown__item"
                      >
                        <button
                          onClick={() =>
                            addActiveFilter(`${filterBy}:${filter}`)
                          }
                          className={classNames(
                            "p-contextual-menu__dropdown__button",
                            {
                              "is-selected": activeFilters.includes(
                                `${filterBy}:${filter}`
                              ),
                            }
                          )}
                          type="button"
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
        </span>
      </span>
    </span>
  );
};

export default FilterTags;
