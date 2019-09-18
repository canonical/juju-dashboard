import React from "react";

import "./_login.scss";

export default function Login() {
  return (
    <div className="login">
      <h1 className="login__heading">
        <div className="p-media-object">
          <img
            alt=""
            width="50"
            src="https://assets.ubuntu.com/v1/60d9b81e-picto-canonical.svg"
            className="p-media-object__image"
          />
          <div className="p-media-object__details">
            <h3 className="p-media-object__title">Canonical Candid</h3>
          </div>
        </div>
      </h1>
      <div className="p-card--highlighted">
        <h3>Login</h3>
        <div className="p-media-object">
          <img
            alt=""
            width="50"
            src="https://assets.ubuntu.com/v1/c4f35e06-products-hero-ubuntu.svg"
            className="p-media-object__image"
          />
          <div className="p-media-object__details">
            <h3 className="p-media-object__title">Ubuntu SSO</h3>
          </div>
        </div>
        <p>Will authenticate with Candid in order to log you in.</p>
        <button className="p-button--positive">Proceed</button>
      </div>
    </div>
  );
}
