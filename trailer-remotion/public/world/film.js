// Camera/staging only. Geometry and animation functions are copied unchanged from the website.
window.drawFilmFrame = function(t) {
  if (!gl || !environmentNode) throw new Error('World has not initialized');
  if (gl.canvas.width !== 1280) gl.canvas.width = 1280;
  if (gl.canvas.height !== 720) gl.canvas.height = 720;
  viewMode = 'env'; lightingMode = 'day';
  const order = [toadNode, bowserJrNode, yoshiNode];
  const idle = t < 14;
  const ground = idle ? environmentNode.surfaceY : environmentNode.groundY;
  for (const [i, c] of order.entries()) {
    c.visible = true;
    if (c.restFootY === undefined) {c.animate(0, 'idle'); c.restFootY = characterFootY(c);}
    c.animate(t, idle ? 'idle' : 'combined');
    if (idle) {
      const x = c === yoshiNode ? -2.8 : c === toadNode ? 0 : 2.8;
      c.setTransform([x, 0, .15], [0, c === yoshiNode ? .15 : c === toadNode ? 0 : -.2, 0]);
    } else {c.setTransform([0, 0, 0]); applyWalkMovement(c, t, i);}
    const foot = characterFootY(c);
    c.position[1] = ground - (!idle && c === toadNode ? Math.min(foot, c.restFootY) : foot);
  }
  const camera = (target, distance, yaw, pitch) => {camTarget = target; camDist = distance; camYaw = yaw; camPitch = pitch;};
  const follow = (c, distance, offset = .35, height = 1.1) => {
    // Keep the camera on the open, front side of the garden; orbiting behind
    // the actor would put it inside the large central platform.
    camera([c.position[0], c.position[1] + height, c.position[2]], distance, offset * .3, .16);
  };
  if (t < 7) camera([0, .9, -1], 22 - t * .48, .28 - t * .015, .26);
  else if (t < 14) camera([0, 1.15, .15], 12.5 - (t - 7) * .12, .12, .18);
  else if (t < 24) {yoshiNode.visible = false; camera([0, -.6, 6.3], 10.6, .15, .27);}
  else if (t < 31) {yoshiNode.visible = toadNode.visible = false; follow(bowserJrNode, 6.2, .55);}
  else if (t < 38) {yoshiNode.visible = bowserJrNode.visible = false; follow(toadNode, 6.3, .35);}
  else if (t < 45) {yoshiNode.visible = false; camera([0, -.8, 6.3], 10.5, -.25, .39);}
  else if (t < 52) {toadNode.visible = bowserJrNode.visible = false; follow(yoshiNode, 6.6, .32, 1.3);}
  else if (t < 60) camera([0, -.6, 6.3], 11, .18, .30);
  else if (t < 68) camera([0, -.6, 6.3], 10.8, .12, .30);
  else if (t < 76) camera([0, -.6, 6.3], 10.5, -.22, .28);
  else if (t < 82) follow(toadNode, 7.5, -.4);
  else camera([0, -.4, 6.3], 12.5 + (t - 82) * .12, .12, .30);
  renderWorld([environmentNode, yoshiNode, toadNode, bowserJrNode], ground);
  gl.finish();
};
