import React, { Component } from "react";
import * as THREE from "three";

import SimplexNoise from "simplex-noise";
import tooloud from "tooloud";
import tumult from "tumult";
import Perlin from "perlin-simplex";

//import Noise from "noisejs";
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
import "./scene.css";
import sunTexture from "../../assets/textures/sun.png";
import px from "../../assets/textures/skies/space5/px.jpg";
import py from "../../assets/textures/skies/space5/py.jpg";
import pz from "../../assets/textures/skies/space5/pz.jpg";
import nx from "../../assets/textures/skies/space5/nx.jpg";
import ny from "../../assets/textures/skies/space5/ny.jpg";
import nz from "../../assets/textures/skies/space5/nz.jpg";

import stone from "../../assets/stone.jpg";
let noisejs = require("noisejs");
const OrbitControls = require("three-orbit-controls")(THREE);
export default class Scene extends Component {
  constructor(props) {
    super(props);

    this.list = [];
    this.listCount = 20;
    this.frameCount = 0;
    this.particles = [];

    this.noise = 0;
    this.noiseOffset = Math.random() * 100;
    this.numParticlesOffset = 0;
    this.p = null;
    this.params = {
      size: 22,
      noiseScale: 0.1,
      noiseSpeed: 0.001,
      noiseStrength: 0.9,
      noiseFreeze: false,
      particleCount: 3000,
      particleSize: 0.28,
      particleSpeed: 0.08,
      particleDrag: 0.9,
      particleColor: 0x41a5ff, //0x41a5ff, 0xff6728
      bgColor: 0x000000,
      particleBlending: THREE.AdditiveBlending
    };

    //this.simplex = new SimplexNoise();
    //this.noiseOffset = Math.random() * 100;
    this.perlin3 = new tumult.Perlin3();
    //this.perlin3 = new noisejs("seed");
    //this.perlin3 = new Noise(Math.random());
    //this.perlin3 = tooloud.Per
    //this.perlin3 = new Perlin();
    //noisejs.seed(Math.random());
  }
  componentDidMount() {
    //const { params } = this;

    window.onresize = this.onWindowResize;
    this.clock = new THREE.Clock();

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE

    const urls = [px, nx, py, ny, pz, nz];
    const reflectionCube = new THREE.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE.RGBFormat;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#000");

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    this.camera.lookAt(this.scene.position);
    this.camera.position.set(
      this.params.size / 1.5,
      this.params.size * 1.5,
      this.params.size * 1.5
    );

    this.control = new OrbitControls(this.camera);
    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#000");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    //ADD OBJECT
    const light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0x404040, 2);

    directionalLight.position.set(0, 0, 100);

    directionalLight.target = this.scene;
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // this.scene.fog = new THREE.Fog();
    // this.scene.fog.color.setHex(0);
    // this.scene.fog.far = 215;
    // this.scene.fog.near = 75;

    this.pointGeometry = new THREE.BoxBufferGeometry(
      this.params.particleSize,
      this.params.particleSize,
      this.params.particleSize
    );
    //this.pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0));

    this.pMaterial = new THREE.MeshStandardMaterial({
      color: this.params.particleColor,
      size: this.params.particleSize,
      sizeAttenuation: true,
      transparent: false,
      //opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    // this.geometry1 = spikyGeometry(new THREE.SphereGeometry(1, 32, 32));

    // this.core = new THREE.MeshStandardMaterial({
    //   emissive: 0xff3d00,
    //   emissiveIntensity: 1,
    //   color: 0xffffff,
    //   metalness: 0.0,
    //   transparent: true,
    //   opacity: 1.8,
    //   roughness: 1,
    //   alphaMap: new THREE.TextureLoader().load(stone)
    // });

    //this.innerSphere = new THREE.Mesh(geometry1, core);
    //this.scene.add(this.innerSphere);

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
    let numParticlesOffset = this.params.particleCount - this.particles.length;
    if (numParticlesOffset > this.params.particleCount / 5) {
      for (var i = 0; i < numParticlesOffset; i++) {
        // let px = createPoint(
        //   Math.random() * 1000,
        //   Math.random() * 1000,
        //   Math.random() * 1000,
        //   this.pointGeometry,
        //   this.pMaterial,
        //   this.scene
        // );

        let px = {
          pos: new THREE.Vector3(
            Math.random() * 3,
            Math.random() * 3,
            Math.random() * 3
          ),
          vel: new THREE.Vector3(0, 0, 0),
          acc: new THREE.Vector3(0, 0, 0),
          angle: new THREE.Euler(0, 0, 0),
          mesh: null
        };

        let px1 = new THREE.Mesh(this.pointGeometry, this.pMaterial);
        px1.geometry.dynamic = true;
        px1.geometry.verticesNeedUpdate = true;

        this.scene.add(px1);
        px.mesh = px1;
        this.particles.push(px);
      }
    } else {
      for (var i = 0; i < -numParticlesOffset; i++) {
        this.scene.remove(this.particles[i].mesh);
        this.particles[i] = null;
        this.particles.splice(i, 1);
      }
    }

    // Update particles based on their coords

    for (var i = 0; i < this.particles.length; i++) {
      let current = this.particles[i];

      this.noise =
        this.perlin3.gen(
          current.pos.x * this.params.noiseScale,
          current.pos.y * this.params.noiseScale,
          current.pos.z * this.params.noiseScale +
            this.noiseOffset +
            this.frameCount * this.params.noiseSpeed
        ) *
        Math.PI *
        2;

      current.angle.set(this.noise, this.noise, this.noise);

      current.acc.set(1, 1, 1);
      current.acc.applyEuler(current.angle);
      current.acc.multiplyScalar(this.params.noiseStrength);

      current.acc.clampLength(0, this.params.particleSpeed);
      current.vel.clampLength(0, this.noise * 0.01);

      current.vel.add(current.acc);
      current.pos.add(current.vel);

      //this.p.acc.multiplyScalar(this.params.particleDrag);
      //this.p.vel.multiplyScalar(this.params.particleDrag);

      // if (current.pos.x > this.params.size) current.pos.x = 0 + Math.random();
      // if (current.pos.y > this.params.size) current.pos.y = 0 + Math.random();
      // if (current.pos.z > this.params.size) current.pos.z = 0 + Math.random();
      // if (current.pos.x < 0) current.pos.x = this.params.size - Math.random();
      // if (current.pos.y < 0) current.pos.y = this.params.size - Math.random();
      // if (current.pos.z < 0) current.pos.z = this.params.size - Math.random();

      if (
        current.pos.x > this.params.size ||
        current.pos.y > this.params.size ||
        current.pos.z > this.params.size
      ) {
        this.particles[i].mesh.scale.x *= -0.9;
        this.particles[i].mesh.scale.y *= -0.9;
        this.particles[i].mesh.scale.z *= -0.9;
        //this.particles[i].mesh.scale.set(-0.5, -0.5, -0.5);

        //console.log(this.particles[i].mesh);
        if (Math.abs(this.particles[i].mesh.scale.x) < 0.02) {
          this.scene.remove(this.particles[i].mesh);
          this.particles.splice(i, 1);
        }
      }
      current.mesh.position.set(current.pos.x, current.pos.y, current.pos.z);
    }
    //console.log(this.noise);
    this.pMaterial.color.setHex(0x41a5ff);
    this.pMaterial.size = this.params.particleSize;
    this.pMaterial.blending = parseInt(THREE.AdditiveBlending);
    if (true) this.frameCount++;

    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  onWindowResize = () => {
    const { clientWidth, clientHeight } = this.mount;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();

    //this.composer.setSize(clientWidth, clientHeight);
    this.renderer.setSize(clientWidth, clientHeight);
  };

  // onMouseMove = (x, y) => {
  //   mousePosition.x = x;
  //   mousePosition.y = y;
  // };

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
