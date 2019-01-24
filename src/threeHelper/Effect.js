import React from "react";

export function spikyGeometry(geometry, list, listCount) {
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
