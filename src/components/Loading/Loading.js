import React from "react";

import "./_loading.scss";

export default function Loading() {
  return (
    <div className="loading">
      <i className="p-icon--spinner u-animation--spin"></i>
    </div>
  );
}
