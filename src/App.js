import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Scene from "./component/threes/Scene";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Scene />
      </div>
    );
  }
}

export default App;
