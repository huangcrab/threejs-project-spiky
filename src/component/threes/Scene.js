import React, { Component } from "react";
import * as THREE from "three";
import Particle from "./Particle";
import SimplexNoise from "simplex-noise";
import {
  createPoint,
  updatePoint,
  spikyGeometry,
  spikyGeometryOnGo
} from "../../threeHelper/Effect";
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
import px from "../../assets/textures/skies/space5/px.jpg";
import py from "../../assets/textures/skies/space5/py.jpg";
import pz from "../../assets/textures/skies/space5/pz.jpg";
import nx from "../../assets/textures/skies/space5/nx.jpg";
import ny from "../../assets/textures/skies/space5/ny.jpg";
import nz from "../../assets/textures/skies/space5/nz.jpg";

import stone from "../../assets/stone.jpg";
import "./scene.css";
const OrbitControls = require("three-orbit-controls")(THREE);
export default class Scene extends Component {
  constructor(props) {
    super(props);

    this.list = [];
    this.listCount = 20;
    this.frameCount = 0;
    this.particles = [];
    this.particleCount = 1000;
    this.noise = 0;
    this.noiseOffset = Math.random() * 100;
    this.numParticlesOffset = 0;
    this.p = null;
    this.params = {
      size: 22,
      noiseScale: 0.1,
      noiseSpeed: 0.009,
      noiseStrength: 0.08,
      noiseFreeze: false,

      particleSize: 0.22,
      particleSpeed: 0.1,
      particleDrag: 0.9,
      particleColor: 0x41a5ff, //0x41a5ff, 0xff6728
      bgColor: 0x000000,
      particleBlending: THREE.AdditiveBlending
    };

    this.frameCount = 0;
    this.noise = 0;
    this.noiseOffset = Math.random() * 100;
  }
  componentDidMount() {
    //const { params } = this;

    window.onresize = this.onWindowResize;
    this.clock = new THREE.Clock();
    const lightIn = new THREE.PointLight("#000", 32);
    const lightOut = new THREE.PointLight("#000", 32);

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE

    const urls = [px, nx, py, ny, pz, nz];
    const reflectionCube = new THREE.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE.RGBFormat;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#000");

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(80, width / height, 1, 700);
    this.camera.position.z = 20;

    this.control = new OrbitControls(this.camera);
    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#000");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    //ADD OBJECT

    // this.scene.fog = new THREE.Fog();
    // this.scene.fog.color.setHex(0);
    // this.scene.fog.far = 215;
    // this.scene.fog.near = 75;

    this.pointGeometry = new THREE.Geometry();
    this.pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0));

    this.pMaterial = new THREE.PointsMaterial({
      color: this.params.particleColor,
      size: this.params.particleSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0, 0);
    directionalLight.target = this.scene;
    const sunMaterial = new THREE.PointsMaterial({
      map: new THREE.TextureLoader().load(sunTexture),
      size: 10.4,
      sizeAttenuation: true,
      color: 0xffffff,
      alphaTest: 0,
      transparent: true,
      fog: true
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

    const geometry = spikyGeometry(new THREE.SphereGeometry(3, 32, 32));
    const geometry1 = spikyGeometry(new THREE.SphereGeometry(1, 32, 32));

    const core = new THREE.MeshStandardMaterial({
      emissive: 0xff3d00,
      emissiveIntensity: 1,
      color: 0xffffff,
      metalness: 0.0,
      transparent: true,
      opacity: 1.8,
      roughness: 1,
      alphaMap: new THREE.TextureLoader().load(stone)
    });

    const material = new THREE.MeshStandardMaterial({
      color: 0x02e5f9,
      emissive: 0x02e5f9,
      emissiveIntensity: 0.3,
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
      resolutionScale: 0.9,
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
      godRaysEffect
      //new GlitchEffect()
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
    let radius = Math.random() * 2 + 1;
    // this.sphere.position.set(
    //   Math.cos(Date.now() * 0.0011) * 2,
    //   Math.cos(Date.now() * 0.0011) * 2,
    //   Math.sin(Date.now() * 0.0011) * 2
    // );

    let numParticlesOffset = 1000 - this.particles.length;
    if (numParticlesOffset > 0) {
      for (var i = 0; i < numParticlesOffset; i++) {
        let p = createPoint(
          Math.random() * 22,
          Math.random() * 22,
          Math.random() * 22,
          this.pointGeometry,
          this.pMaterial,
          this.scene
        );

        this.particles.push(p);
      }
    } else {
      for (var i = 0; i < -numParticlesOffset; i++) {
        this.scene.remove(this.particles[i].mesh);
        this.particles[i] = null;
        this.particles.splice(i, 1);
      }
    }
    let simplex = new SimplexNoise();
    // Update particles based on their coords
    for (var i = 0; i < this.particles.length; i++) {
      this.p = this.particles[i];

      var noise =
        simplex.noise3D(
          this.p.pos.x * 0.1,
          this.p.pos.y * 0.1,
          this.p.pos.z * 0.1 + this.noiseOffset + this.frameCount * 0.009
        ) *
        Math.PI *
        2;

      this.p.angle.set(noise, noise, noise);
      //this.p.update();
    }

    this.pMaterial.color.setHex(0x41a5ff);
    this.pMaterial.size = 22;
    this.pMaterial.blending = parseInt(THREE.AdditiveBlending);
    if (true) this.frameCount++;
    // console.log(this.meshx);
    // let positionx = this.meshx.geometry.attributes.position;
    // for (var i = 0; i < positionx.count; i++) {
    //   var y = 35 * Math.sin(i / 5 + (this.clock.getElapsedTime() * 5 + i) / 7);
    //   positionx.setY(i, y);
    // }
    // positionx.needsUpdate = true;
    const { list, listCount } = this;
    spikyGeometryOnGo(this.innerSphere.geometry, list, listCount);
    //spikyGeometryOnGo(this.sphere.geometry, list, listCount);

    this.innerSphere.geometry.verticesNeedUpdate = true;
    this.sphere.geometry.verticesNeedUpdate = true;
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  onWindowResize = () => {
    const { clientWidth, clientHeight } = this.mount;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(clientWidth, clientHeight);
  };

  // onMouseMove = (x, y) => {
  //   mousePosition.x = x;
  //   mousePosition.y = y;
  // };

  renderScene = () => {
    this.composer.render(this.clock.getDelta());
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
