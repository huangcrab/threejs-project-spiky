import * as THREE from "three";

export function spikyGeometryOnGo(geometry, list, listCount) {
  geometry.verticesNeedUpdate = true;

  let radius = geometry.vertices[0].length();

  const listNumber = geometry.vertices.length;

  while (list.length < listCount) {
    list.push({
      index: Math.floor(Math.random() * (listNumber - 1) + 1),
      limit: Math.random() * radius * 2 + radius,
      grow: true
    });
  }

  for (let i = 0; i < list.length; i++) {
    list[i].grow
      ? geometry.vertices[list[i].index].multiplyScalar(1.03)
      : geometry.vertices[list[i].index].divideScalar(1.03);

    if (
      geometry.vertices[list[i].index].length() > list[i].limit &&
      list[i].grow
    ) {
      list[i].grow = false;
    } else if (
      geometry.vertices[list[i].index].length() <= radius &&
      list[i].grow === false
    ) {
      list.splice(i, 1);
    }
  }

  return geometry;
}

export function spikyGeometry(geometry) {
  const listNumber = geometry.vertices.length;

  for (let i = 0; i < listNumber; i += 3) {
    let length = Math.random() * 1.2 + 1;
    let length2 = Math.random() * 1.1 + 1;
    geometry.vertices[i].multiplyScalar(length);
    geometry.vertices[i].divideScalar(length2);
  }

  return geometry;
}
export function createPoint(x, y, z, geometry, material, scene) {
  let point = {
    pos: new THREE.Vector3(x, y, z),
    vel: new THREE.Vector3(0, 0, 0),
    acc: new THREE.Vector3(0, 0, 0),
    angle: new THREE.Euler(0, 0, 0),
    mesh: null
  };

  const pointMesh = new THREE.Points(geometry, material);
  pointMesh.geometry.dynamic = true;
  pointMesh.geometry.verticesNeedUpdate = true;
  scene.add(pointMesh);
  point.mesh = pointMesh;

  return point;
}
export function updatePoint(point) {
  const params = {
    size: 220,
    noiseScale: 0.1,
    noiseSpeed: 0.009,
    noiseStrength: 0.08,
    noiseFreeze: false,

    particleSize: 0.01,
    particleSpeed: 0.1,
    particleDrag: 0.9,
    particleColor: 0x41a5ff, //0x41a5ff, 0xff6728
    bgColor: 0x000000,
    particleBlending: THREE.AdditiveBlending
  };

  point.acc.set(1, 1, 1);
  point.acc.applyEuler(point.angle);
  point.acc.multiplyScalar(params.noiseStrength);

  point.acc.clampLength(0, params.particleSpeed);
  point.vel.clampLength(0, params.particleSpeed);

  point.vel.add(point.acc);
  point.pos.add(point.vel);

  //point.acc.multiplyScalar(params.particleDrag);
  //point.vel.multiplyScalar(params.particleDrag);

  if (point.pos.x > params.size) point.pos.x = 0 + Math.random();
  if (point.pos.y > params.size) point.pos.y = 0 + Math.random();
  if (point.pos.z > params.size) point.pos.z = 0 + Math.random();
  if (point.pos.x < 0) point.pos.x = params.size - Math.random();
  if (point.pos.y < 0) point.pos.y = params.size - Math.random();
  if (point.pos.z < 0) point.pos.z = params.size - Math.random();

  point.mesh.position.set(point.pos.x, point.pos.y, point.pos.z);
}
