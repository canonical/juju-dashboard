import React, { Component } from "react";
import classNames from "classnames";
import PrimaryNav from "../PrimaryNav/PrimaryNav";
import SecondaryNav from "../SecondaryNav/SecondaryNav";

import "./_layout.scss";

export default class Layout extends Component {
  render() {
    const { sidebar } = this.props;
    return (
      <>
        <PrimaryNav />
        <div
          className={classNames({
            "l-container--sidebar": sidebar
          })}
        >
          {sidebar && (
            <div className="l-side">
              <SecondaryNav />
            </div>
          )}
          <div className="l-main">
            <main id="main-content">{this.props.children}</main>
          </div>
        </div>
      </>
    );
  }
}
