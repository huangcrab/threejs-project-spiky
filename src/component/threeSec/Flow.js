import React, { Component } from "react";

import threeEntryPoint from "./threejs/threeEntryPoint";

export default class Flow extends Component {
  componentDidMount() {
    threeEntryPoint(this.mount);
  }
  render() {
    return <div className="flow" ref={mount => (this.mount = mount)} />;
  }
}
