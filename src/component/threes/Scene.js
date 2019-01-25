import React, { Component } from "react";
import * as THREE from "three";

import { spikyGeometry, spikyGeometryOnGo } from "../../threeHelper/Effect";
import {
  RenderPass,
  GlitchEffect,
  BloomEffect,
  GodRaysEffect,
  EffectPass,
  EffectComposer,
  KernelSize
} from "postprocessing";

import sunTexture from "../../assets/textures/sun.png";
import px from "../../assets/textures/skies/starry/px.png";
import py from "../../assets/textures/skies/starry/py.png";
import pz from "../../assets/textures/skies/starry/pz.png";
import nx from "../../assets/textures/skies/starry/nx.png";
import ny from "../../assets/textures/skies/starry/ny.png";
import nz from "../../assets/textures/skies/starry/nz.png";

import stone from "../../assets/stone.jpg";
import "./scene.css";
const OrbitControls = require("three-orbit-controls")(THREE);
export default class Scene extends Component {
  constructor(props) {
    super(props);

    this.list = [];
    this.listCount = 20;
  }
  componentDidMount() {
    const lightIn = new THREE.PointLight("#000", 32);
    const lightOut = new THREE.PointLight("#000", 32);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(1000, 1000, 1000);
    spotLight.castShadow = true;

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE

    const urls = [px, nx, py, ny, pz, nz];
    const reflectionCube = new THREE.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE.RGBFormat;
    this.scene = new THREE.Scene();
    this.scene.background = reflectionCube;
    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 10;

    this.control = new OrbitControls(this.camera);
    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#000");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    //ADD OBJECT

    const directionalLight = new THREE.DirectionalLight(0xff0000);
    directionalLight.position.set(0, 0, 0);
    directionalLight.target = this.scene;
    const sunMaterial = new THREE.PointsMaterial({
      map: new THREE.TextureLoader().load(sunTexture),
      size: 5.5,
      sizeAttenuation: true,
      color: 0xff0000,
      alphaTest: 0,
      transparent: true,
      fog: false
    });

    const sunGeometry = new THREE.BufferGeometry();
    sunGeometry.addAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(3), 3)
    );
    const sun = new THREE.Points(sunGeometry, sunMaterial);
    sun.frustumCulled = false;
    sun.position.copy(directionalLight.position);

    this.scene.add(sun);

    const geometry = spikyGeometry(new THREE.SphereGeometry(1.5, 32, 32));
    const geometry1 = new THREE.SphereGeometry(1, 32, 32);

    const core = new THREE.MeshStandardMaterial({
      emissive: 0xff0000,
      emissiveIntensity: 1,
      color: 0xff0000,
      metalness: 0.0,
      transparent: true,
      opacity: 2,
      roughness: 1,
      alphaMap: new THREE.TextureLoader().load(stone)
    });

    const material = new THREE.MeshStandardMaterial({
      color: 0x02e5f9,
      //emissive: 0x02e5f9,
      //emissiveIntensity: 1,
      transparent: false,
      side: THREE.DoubleSide,
      alphaTest: 0.4
    });
    //core.Map =
    material.alphaMap = new THREE.TextureLoader().load(stone);

    this.innerSphere = new THREE.Mesh(geometry1, core);
    this.sphere = new THREE.Mesh(geometry, material);
    lightIn.add(this.innerSphere);
    lightOut.add(this.sphere);
    this.scene.add(this.sphere);
    this.scene.add(lightIn);
    //this.scene.add(spotLight);

    //ADD EFFECT COMPOSER
    const godRaysEffect = new GodRaysEffect(this.scene, this.camera, sun, {
      resolutionScale: 0.8,
      kernelSize: KernelSize.SMALL,
      density: 0.96,
      decay: 0.95,
      weight: 0.7,
      exposure: 0.95,
      samples: 30,
      clampMax: 1.0
    });
    godRaysEffect.dithering = true;

    this.composer = new EffectComposer(this.renderer);
    const effectPass = new EffectPass(
      this.camera,
      godRaysEffect,
      new GlitchEffect()
    );
    effectPass.renderToScreen = true;

    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(effectPass);

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
    this.sphere.rotation.x += 0.006;
    this.sphere.rotation.y += 0.006;

    const { list, listCount } = this;
    spikyGeometryOnGo(this.innerSphere.geometry, list, listCount);
    //spikyGeometryOnGo(this.sphere.geometry, list, listCount);

    this.innerSphere.geometry.verticesNeedUpdate = true;
    this.sphere.geometry.verticesNeedUpdate = true;
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };
  renderScene = () => {
    this.composer.render(0.01);
    //this.renderer.render(this.scene, this.camera);
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
