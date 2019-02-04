import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
//import Scene from "./component/threes/Scene";
import Flow from "./component/threeSec/Flow";
import Scene from "./component/threeFour/Scene";
import Ult from "./component/threeTry/Scene";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Ult />
        {/* <Sc /> */}
        {/* <Flow /> */}
      </div>
    );
  }
}

export default App;
