import React, { Component } from "react";
import * as THREE from "three";
import Simulation from "./Simulation";
import SimplexNoise from "simplex-noise";
import tooloud from "tooloud";
import tumult from "tumult";
import Perlin from "perlin-simplex";

import spotlight from "./spotlight.jpg";

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
  componentDidMount() {
    console.log(document.getElementById("vs-particles").textContent);

    this.raycaster = new THREE.Raycaster();
    this.tmpVector = new THREE.Vector3();
    this.nOffset = new THREE.Vector3(0, 0, 0);

    this.m = new THREE.Matrix4();
    this.v = new THREE.Vector3();
    this.scale = 0;
    this.nScale = 1;
    let colors = [
      0xed6a5a,
      0xf4f1bb,
      0x9bc1bc,
      0x5ca4a9,
      0xe6ebe0,
      0xf0b67f,
      0xfe5f55,
      0xd6d1b1,
      0xc7efcf,
      0xeef5db,
      0x50514f,
      0xf25f5c,
      0xffe066,
      0x247ba0,
      0x70c1b3
    ];
    window.onresize = this.onWindowResize;
    this.clock = new THREE.Clock();

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshNormalMaterial({ side: THREE.DoubleSide, visible: true })
    );
    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color("#000");
    this.plane.material.visible = false;

    this.scene.add(this.plane);
    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    this.camera.lookAt(this.scene.position);
    this.camera.position.z = 8;
    this.scene.add(this.camera);

    this.control = new OrbitControls(this.camera);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xff00ff);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.sim = new Simulation(this.renderer, 128, 128);
    //ADD OBJECT

    this.shadowCamera = new THREE.OrthographicCamera(-15, 15, 15, -15, 0.1, 20);

    this.shadowCamera.position.set(10, 4, 10);
    this.shadowCamera.lookAt(this.scene.position);

    this.light = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 6, 1, 36),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    this.light.position.copy(this.shadowCamera.position);
    this.scene.add(this.light);
    this.light.lookAt(this.scene.position);
    this.light.rotation.y += Math.PI / 2;
    this.light.rotation.z += Math.PI / 2;

    this.encasing = new THREE.Mesh(
      new THREE.CylinderGeometry(5.1, 6.1, 0.9, 36),
      new THREE.MeshBasicMaterial({ color: 0x101010 })
    );
    this.encasing.position.copy(this.shadowCamera.position);
    this.scene.add(this.encasing);
    this.encasing.lookAt(this.scene.position);
    this.encasing.rotation.y += Math.PI / 2;
    this.encasing.rotation.z += Math.PI / 2;

    let shadowBufferSize = Math.min(
      2048,
      this.renderer.context.getParameter(this.renderer.context.MAX_TEXTURE_SIZE)
    );

    this.shadowBuffer = new THREE.WebGLRenderTarget(
      shadowBufferSize,
      shadowBufferSize,
      {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
      }
    );

    const geometry = new THREE.BufferGeometry();

    let positionLength = this.sim.width * this.sim.height * 3 * 18;
    let positions = new Float32Array(positionLength);

    let p = 0;
    for (let j = 0; j < positionLength; j += 3) {
      positions[j] = p;
      positions[j + 1] = Math.floor(p / 18);
      positions[j + 2] = p % 18;
      p++;
    }

    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));

    const diffuseData = new Uint8Array(this.sim.width * this.sim.height * 4);
    for (let j = 0; j < this.sim.width * this.sim.height * 4; j += 4) {
      let c = new THREE.Color(colors[~~(Math.random() * colors.length)]);
      diffuseData[j + 0] = c.r * 255;
      diffuseData[j + 1] = c.g * 255;
      diffuseData[j + 2] = c.b * 255;
    }

    const diffuseTexture = new THREE.DataTexture(
      diffuseData,
      this.sim.width,
      this.sim.height,
      THREE.RGBAFormat
    );
    diffuseTexture.minFilter = THREE.NearestFilter;
    diffuseTexture.magFilter = THREE.NearestFilter;
    diffuseTexture.needsUpdate = true;

    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        map: { type: "t", value: this.sim.rtTexturePos },
        prevMap: { type: "t", value: this.sim.rtTexturePos },
        diffuse: { type: "t", value: diffuseTexture },
        width: { type: "f", value: this.sim.width },
        height: { type: "f", value: this.sim.height },
        dimensions: {
          type: "v2",
          value: new THREE.Vector2(shadowBufferSize, shadowBufferSize)
        },

        timer: { type: "f", value: 0 },
        spread: { type: "f", value: 4 },
        boxScale: { type: "v3", value: new THREE.Vector3() },
        meshScale: { type: "f", value: 1 },

        depthTexture: { type: "t", value: this.shadowBuffer },
        shadowV: { type: "m4", value: new THREE.Matrix4() },
        shadowP: { type: "m4", value: new THREE.Matrix4() },
        resolution: {
          type: "v2",
          value: new THREE.Vector2(shadowBufferSize, shadowBufferSize)
        },
        lightPosition: { type: "v3", value: new THREE.Vector3() },
        projector: {
          type: "t",
          value: new THREE.TextureLoader().load(spotlight)
        },

        boxVertices: {
          type: "3fv",
          value: [
            -1,
            -1,
            -1,
            -1,
            -1,
            1,
            -1,
            1,
            1,

            -1,
            -1,
            -1,
            -1,
            1,
            1,
            -1,
            1,
            -1,

            1,
            1,
            -1,
            1,
            -1,
            -1,
            -1,
            -1,
            -1,

            1,
            1,
            -1,
            -1,
            -1,
            -1,
            -1,
            1,
            -1,

            1,
            -1,
            1,
            -1,
            -1,
            1,
            -1,
            -1,
            -1,

            1,
            -1,
            1,
            -1,
            -1,
            -1,
            1,
            -1,
            -1,

            1,
            1,
            1,
            1,
            -1,
            1,
            1,
            -1,
            -1,

            1,
            1,
            -1,
            1,
            1,
            1,
            1,
            -1,
            -1,

            -1,
            -1,
            1,
            1,
            -1,
            1,
            1,
            1,
            1,

            -1,
            1,
            1,
            -1,
            -1,
            1,
            1,
            1,
            1,

            -1,
            1,
            -1,
            -1,
            1,
            1,
            1,
            1,
            1,

            1,
            1,
            -1,
            -1,
            1,
            -1,
            1,
            1,
            1
          ]
        },
        boxNormals: { type: "3fv", value: [1, 0, 0, 0, 0, 1, 0, 1, 0] }
      },
      vertexShader: document.getElementById("vs-particles").textContent,
      fragmentShader: document.getElementById("fs-particles").textContent,
      side: THREE.DoubleSide,
      shading: THREE.FlatShading
    });
    // const texLoader = new THREE.TextureLoader();
    // texLoader.load("./spotlight.jpg", function(res) {
    //   this.material.uniforms.projector.value = res;
    // });
    this.mesh = new THREE.Mesh(geometry, this.material);

    this.shadowMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        map: { type: "t", value: this.sim.rtTexturePos },
        prevMap: { type: "t", value: this.sim.rtTexturePos },
        width: { type: "f", value: this.sim.width },
        height: { type: "f", value: this.sim.height },

        timer: { type: "f", value: 0 },
        boxScale: { type: "v3", value: new THREE.Vector3() },
        meshScale: { type: "f", value: 1 },

        shadowV: { type: "m4", value: new THREE.Matrix4() },
        shadowP: { type: "m4", value: new THREE.Matrix4() },
        resolution: {
          type: "v2",
          value: new THREE.Vector2(shadowBufferSize, shadowBufferSize)
        },
        lightPosition: { type: "v3", value: new THREE.Vector3() },

        boxVertices: {
          type: "3fv",
          value: [
            -1,
            -1,
            -1,
            -1,
            -1,
            1,
            -1,
            1,
            1,

            -1,
            -1,
            -1,
            -1,
            1,
            1,
            -1,
            1,
            -1,

            1,
            1,
            -1,
            1,
            -1,
            -1,
            -1,
            -1,
            -1,

            1,
            1,
            -1,
            -1,
            -1,
            -1,
            -1,
            1,
            -1,

            1,
            -1,
            1,
            -1,
            -1,
            1,
            -1,
            -1,
            -1,

            1,
            -1,
            1,
            -1,
            -1,
            -1,
            1,
            -1,
            -1,

            1,
            1,
            1,
            1,
            -1,
            1,
            1,
            -1,
            -1,

            1,
            1,
            -1,
            1,
            1,
            1,
            1,
            -1,
            -1,

            -1,
            -1,
            1,
            1,
            -1,
            1,
            1,
            1,
            1,

            -1,
            1,
            1,
            -1,
            -1,
            1,
            1,
            1,
            1,

            -1,
            1,
            -1,
            -1,
            1,
            1,
            1,
            1,
            1,

            1,
            1,
            -1,
            -1,
            1,
            -1,
            1,
            1,
            1
          ]
        },
        boxNormals: {
          type: "3fv",
          value: [1, 0, 0, 0, 0, 1, 0, 1, 0, -1, 0, 0, 0, 0, -1, 0, -1, 0]
        }
      },
      vertexShader: document.getElementById("vs-particles").textContent,
      fragmentShader: document.getElementById("fs-particles-shadow")
        .textContent,
      side: THREE.DoubleSide
    });

    this.scene.add(this.mesh);

    this.proxy = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.2, 2),
      new THREE.MeshNormalMaterial()
    );
    //this.scene.add(this.proxy);
    this.proxy.material.visible = false;

    let center = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial()
    );
    //this.scene.add(center);

    const shadowDebug = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({
        map: this.shadowBuffer,
        side: THREE.DoubleSide
      })
    );
    //this.scene.add(shadowDebug);

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
    // Update particles based on their coords

    this.scale += (this.nScale - this.scale) * 0.01;

    let time = this.clock.elapsedTime;
    let delta = this.clock.getDelta() * 10;
    this.plane.lookAt(this.camera.position);

    let intersects = this.raycaster.intersectObject(this.plane);
    if (intersects.length) {
      this.nOffset.copy(intersects[0].point);
      this.proxy.position.copy(this.nOffset);
    }

    // if (true) {
    //   var r = 3;
    //   this.nOffset.set(r * Math.sin(time), r * Math.cos(0.9 * time), 0);
    // }

    this.tmpVector.copy(this.nOffset);
    this.tmpVector.sub(this.sim.simulationShader.uniforms.offset.value);
    this.tmpVector.multiplyScalar(0.1);
    this.sim.simulationShader.uniforms.offset.value.add(this.tmpVector);
    this.sim.simulationShader.uniforms.factor.value = 0.5;
    this.sim.simulationShader.uniforms.evolution.value = 0.5;
    this.sim.simulationShader.uniforms.radius.value = 0.5;

    // if (this.sim.simulationShader.uniforms.active.value) {
    //   this.mesh.rotation.y = 0.5 * time;
    // }

    this.m.copy(this.mesh.matrixWorld);
    this.sim.simulationShader.uniforms.inverseModelViewMatrix.value.getInverse(
      this.m
    );
    this.sim.simulationShader.uniforms.genScale.value = this.scale;

    if (this.sim.simulationShader.uniforms.active.value === 1) {
      this.sim.render(time, delta);
    }

    this.material.uniforms.map.value = this.shadowMaterial.uniforms.map.value = this.sim.targets[
      this.sim.targetPos
    ];
    this.material.uniforms.prevMap.value = this.shadowMaterial.uniforms.prevMap.value = this.sim.targets[
      1 - this.sim.targetPos
    ];

    this.material.uniforms.spread.value = 4;
    this.material.uniforms.timer.value = this.shadowMaterial.uniforms.timer.value = time;
    this.material.uniforms.boxScale.value.set(0.5, 1, 6);

    this.shadowMaterial.uniforms.boxScale.value.set(0.5, 1, 6);
    this.material.uniforms.meshScale.value = 1;
    this.shadowMaterial.uniforms.meshScale.value = 1;
    this.renderer.setClearColor(0);
    this.mesh.material = this.shadowMaterial;

    this.renderer.render(this.scene, this.shadowCamera, this.shadowBuffer);

    this.light.material.visible = true;
    this.tmpVector.copy(this.scene.position);
    this.tmpVector.sub(this.shadowCamera.position);
    this.tmpVector.normalize();

    this.m.makeRotationY(-this.mesh.rotation.y);
    this.v.copy(this.shadowCamera.position);
    this.v.applyMatrix4(this.m);

    this.material.uniforms.shadowP.value.copy(
      this.shadowCamera.projectionMatrix
    );
    this.material.uniforms.shadowV.value.copy(
      this.shadowCamera.matrixWorldInverse
    );
    this.material.uniforms.lightPosition.value.copy(this.v);

    this.renderer.setClearColor(0x202020);
    this.mesh.material = this.material;

    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  onWindowResize = () => {
    const { clientWidth, clientHeight } = this.mount;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(clientWidth, clientHeight);
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
