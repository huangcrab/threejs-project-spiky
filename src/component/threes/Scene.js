import React, { Component } from "react";
import * as THREE from "three";

import { spikyGeometry } from "../../threeHelper/Effect";

import texture from "../../assets/texture.jpg";
import "./scene.css";

export default class Scene extends Component {
  constructor(props) {
    super(props);

    this.list = [];
    this.listCount = 20;
  }
  componentDidMount() {
    const lightIn = new THREE.PointLight("#000", 32);
    const lightOut = new THREE.PointLight("#000", 32);

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE
    this.scene = new THREE.Scene();
    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 4;
    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#000");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    //ADD OBJECT
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const geometry1 = new THREE.SphereGeometry(1, 32, 32);
    const core = new THREE.MeshStandardMaterial({
      emissive: 0xff0000,
      emissiveIntensity: 1,
      color: 0xff0000,
      metalness: 0.0,
      transparent: true,
      opacity: 2,
      roughness: 1,
      alphaMap: new THREE.TextureLoader().load(texture)
    });

    const material = new THREE.MeshStandardMaterial({
      color: 0x02e5f9,
      emissive: 0x02e5f9,
      emissiveIntensity: 1,
      transparent: false,
      side: THREE.DoubleSide,
      alphaTest: 0.4
    });
    //core.Map =
    material.alphaMap = new THREE.TextureLoader().load(texture);

    this.innerSphere = new THREE.Mesh(geometry1, core);
    this.sphere = new THREE.Mesh(geometry, material);
    lightIn.add(this.innerSphere);
    lightOut.add(this.sphere);
    this.scene.add(lightOut);
    this.scene.add(lightIn);

    this.start();
  }
  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }
  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };
  stop = () => {
    cancelAnimationFrame(this.frameId);
  };
  animate = () => {
    this.sphere.rotation.x += 0.003;
    this.sphere.rotation.y += 0.003;

    const { list, listCount } = this;
    spikyGeometry(this.innerSphere.geometry, list, listCount);
    spikyGeometry(this.sphere.geometry, list, listCount);

    this.innerSphere.geometry.verticesNeedUpdate = true;
    this.sphere.geometry.verticesNeedUpdate = true;
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };
  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <React.Fragment>
        <div ref={mount => (this.mount = mount)} className="scene" />
        <button className="button" onClick={this.stop}>
          Stop
        </button>
        <button className="button" onClick={this.animate}>
          Start
        </button>
      </React.Fragment>
    );
  }
}
