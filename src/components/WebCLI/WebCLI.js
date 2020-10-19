import React from "react";

import "./_webcli.scss";

const WebCLI = () => {
  return (
    <div className="webcli">
      <div className="webcli__output"></div>
      <div className="webcli__input">
        <div className="webcli__input-prompt">$ juju</div>
        <input
          className="webcli__input-input"
          type="text"
          placeholder="enter command"
        />
        <div className="webcli__input-help">
          <i className="p-icon--help is-light" />
        </div>
      </div>
    </div>
  );
};

export default WebCLI;
