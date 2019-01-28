import React from "react";
import * as THREE from "three";
import { spikyGeometry, spikyGeometryOnGo } from "../../../threeHelper/Effect";
import stone from "../../../assets/stone.jpg";
const list = [];

export default function SceneSubjectTwo(scene) {
  const lightIn = new THREE.PointLight("#000", 32);
  const lightOut = new THREE.PointLight("#000", 32);

  //ADD OBJECT
  const geometry = spikyGeometry(new THREE.SphereGeometry(19.5, 32, 32));
  const geometry1 = new THREE.SphereGeometry(12, 32, 32);
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
    // emissive: 0x02e5f9,
    // emissiveIntensity: 1,
    transparent: false,
    side: THREE.DoubleSide,
    alphaTest: 0.4
  });

  material.alphaMap = new THREE.TextureLoader().load(stone);
  //material.map.repeat.y = 1;
  const innerSphere = new THREE.Mesh(geometry1, core);
  const sphere = new THREE.Mesh(geometry, material);
  lightIn.add(innerSphere);
  lightOut.add(sphere);
  scene.add(sphere);
  scene.add(innerSphere);

  const update = time => {
    let angle = time * 0.06;

    sphere.rotation.x = angle;
    sphere.rotation.y = angle;

    spikyGeometryOnGo(geometry1, list, 20);
    const scale = (Math.sin(angle * 8) + 6.4) / 5;
    sphere.scale.set(scale, scale, scale);
  };

  return {
    update
  };
}
