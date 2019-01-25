import * as THREE from "three";
import sunTexture from "../../../assets/textures/sun.png";
export default function SunSubject(scene) {
  const directionalLight = new THREE.DirectionalLight(0xffbbaa);
  directionalLight.position.set(0, 0, -200);
  directionalLight.target = scene;

  scene.add(directionalLight);

  const sunMaterial = new THREE.PointsMaterial({
    map: new THREE.TextureLoader().load(sunTexture),
    size: 100,
    sizeAttenuation: true,
    color: 0xffddaa,
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
  function update(time) {}
  return { update };
}
