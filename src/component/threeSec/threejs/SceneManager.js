import * as THREE from "three";
import SceneSubject from "./SceneSubject";
import GeneralLights from "./GeneralLights";
import SceneSubjectTwo from "./SceneSubjectTwo";

import SunSubject from "./SunSubject";
import { spikyGeometry, spikyGeometryOnGo } from "../../../threeHelper/Effect";

import stone from "../../../assets/stone.jpg";
import sunTexture from "../../../assets/textures/sun.png";
import px from "./textures/skies/starry/px.png";
import py from "./textures/skies/starry/py.png";
import pz from "./textures/skies/starry/pz.png";
import nx from "./textures/skies/starry/nx.png";
import ny from "./textures/skies/starry/ny.png";
import nz from "./textures/skies/starry/nz.png";
import area from "../../../assets/textures/area.png";
import search from "../../../assets/textures/search.png";

import GLTFLoader from "three-gltf-loader";
import {
  RenderPass,
  GlitchEffect,
  BloomEffect,
  GodRaysEffect,
  EffectPass,
  EffectComposer,
  KernelSize,
  SMAAEffect
} from "postprocessing";

const OrbitControls = require("three-orbit-controls")(THREE);

export default canvas => {
  const clock = new THREE.Clock();
  const origin = new THREE.Vector3(0, 0, 0);
  const screenDimensions = {
    width: canvas.width,
    height: canvas.height
  };
  const mousePosition = {
    x: 0,
    y: 0
  };

  let urls = [px, nx, py, ny, pz, nz];
  const reflectionCube = new THREE.CubeTextureLoader().load(urls);
  reflectionCube.format = THREE.RGBFormat;
  const scene = new THREE.Scene();
  scene.background = reflectionCube;

  const aspectRatio = canvas.width / canvas.height;
  const fieldOfView = 60;
  const nearPlane = 0.1;
  const farPlane = 1000;
  const camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  camera.position.z = 180;
  const control = new OrbitControls(camera);
  control.enableZoom = true;

  const sceneSubjects = [
    //new GeneralLights(scene),
    //new SceneSubject(scene),
    //new SunSubject(scene),
    //new SceneSubjectTwo(scene)
  ];
  const directionalLight = new THREE.DirectionalLight(0xff0000);

  directionalLight.position.set(0, 0, -100);
  directionalLight.target = scene;
  const sunMaterial = new THREE.PointsMaterial({
    map: new THREE.TextureLoader().load(sunTexture),
    size: 50,
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

  scene.add(sun);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor("#000");
  renderer.setSize(canvas.width, canvas.height);

  // const godRaysEffect = new GodRaysEffect(scene, camera, sun, {
  //   //resolutionScale: 0.8
  //   //kernelSize: KernelSize.SMALL
  //   // density: 0.96,
  //   //decay: 0.5
  //   // weight: 0.4,
  //   // exposure: 0.55,
  //   // samples: 60,
  //   // clampMax: 1.0
  // });

  // godRaysEffect.dithering = true;

  // const effectPass = new EffectPass(
  //   camera,
  //   //smaaEffect
  //   godRaysEffect
  //   //new GlitchEffect()
  // );
  // effectPass.renderToScreen = true;
  // const composer = new EffectComposer(renderer);
  // composer.addPass(new RenderPass(scene, camera));
  // composer.addPass(effectPass);

  function update() {
    const elapsedTime = clock.getElapsedTime();

    for (let i = 0; i < sceneSubjects.length; i++)
      sceneSubjects[i].update(elapsedTime);

    updateCameraPositionRelativeToMouse();
    control.update();

    renderer.render(0.01);
    // renderer.clear();
    // composer.render(0.01);
  }

  function updateCameraPositionRelativeToMouse() {
    //camera.position.x = (mousePosition.x * 0.01 - camera.position.x) * 0.01;
    //camera.position.y = (-(mousePosition.y * 0.01) - camera.position.y) * 0.01;
    //camera.lookAt(origin);
  }

  function onWindowResize() {
    const { width, height } = canvas;

    screenDimensions.width = width;
    screenDimensions.height = height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  function onMouseMove(x, y) {
    mousePosition.x = x;
    mousePosition.y = y;
  }

  return {
    update,
    onWindowResize,
    onMouseMove
  };
};
