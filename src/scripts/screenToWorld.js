export function screenToWorldCoords(x, y) {
  // First subtract the initial translation (currentOrigin)
  let adjustedX = x - currentOrigin.x;
  let adjustedY = y - currentOrigin.y;

  // Then account for the scale
  adjustedX = adjustedX / currentScale;
  adjustedY = adjustedY / currentScale;

  // Finally subtract the center translation
  adjustedX -= width / 2;
  adjustedY -= height / 2;

  //new viewport
  return { x: adjustedX, y: adjustedY };
}
