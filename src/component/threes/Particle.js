import * as THREE from "three";

export default function Particle(x, y, z, scene, params, geometry, material) {
  this.pos = new THREE.Vector3(x, y, z);
  this.vel = new THREE.Vector3(0, 0, 0);
  this.acc = new THREE.Vector3(0, 0, 0);
  this.angle = new THREE.Euler(0, 0, 0);
  this.mesh = null;
  this.scene = scene;
  this.params = params;
  this.pointGeometry = geometry;
  this.pMaterial = material;
}

Particle.prototype.init = function() {
  const { pointGeometry, pMaterial } = this;
  var point = new THREE.Points(pointGeometry, pMaterial);
  point.geometry.dynamic = true;
  point.geometry.verticesNeedUpdate = true;
  this.scene.add(point);
  this.mesh = point;
};

Particle.prototype.update = function() {
  const { params } = this;
  this.acc.set(1, 1, 1);
  this.acc.applyEuler(this.angle);
  this.acc.multiplyScalar(params.noiseStrength);

  this.acc.clampLength(0, params.particleSpeed);
  this.vel.clampLength(0, params.particleSpeed);

  this.vel.add(this.acc);
  this.pos.add(this.vel);

  // this.acc.multiplyScalar(params.particleDrag);
  // this.vel.multiplyScalar(params.particleDrag);

  if (this.pos.x > params.size) this.pos.x = 0 + Math.random();
  if (this.pos.y > params.size) this.pos.y = 0 + Math.random();
  if (this.pos.z > params.size) this.pos.z = 0 + Math.random();
  if (this.pos.x < 0) this.pos.x = params.size - Math.random();
  if (this.pos.y < 0) this.pos.y = params.size - Math.random();
  if (this.pos.z < 0) this.pos.z = params.size - Math.random();

  this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
};
