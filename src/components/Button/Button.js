import React, { Component } from "react";

import "./_button.scss";

export default class Button extends Component {
  render() {
    return <button className="p-button--filter">{this.props.children}</button>;
  }
}
