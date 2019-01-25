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

export function Light() {}
