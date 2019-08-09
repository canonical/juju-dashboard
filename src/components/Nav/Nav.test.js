import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Nav from "./Nav";

import {shallow} from 'enzyme'

describe("Nav", () => {
  it("renders without crashing", () => {
    shallow(
      <Router>
        <Nav />
      </Router>,
    );
  });
});
