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
    </div>
  );
};

export default FilterTags;
