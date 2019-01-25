import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Scene from "./component/threes/Scene";
import Flow from "./component/threeSec/Flow";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Scene />

        {/* <Flow /> */}
      </div>
    );
  }
}

export default App;
