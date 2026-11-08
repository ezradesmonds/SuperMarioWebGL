// Film staging uses the website models and their original combined animations.
// Egg activation is derived from the frame, so seeking backwards is deterministic.
window.drawFilmFrame = function(t) {
  if (!gl || !environmentNode) throw new Error('World has not initialized');
  if (gl.canvas.width !== 1280) gl.canvas.width = 1280;
  if (gl.canvas.height !== 720) gl.canvas.height = 720;
  viewMode = 'env'; lightingMode = 'day';
  const smooth = (v) => {v = Math.max(0, Math.min(1, v)); return v*v*(3-2*v);};
  const order = [toadNode, bowserJrNode, yoshiNode];
  const opening = t < 5;
  const introduction = t >= 5 && t < 23;
  const solo = t < 11 ? toadNode : t < 17 ? bowserJrNode : yoshiNode;
  const ground = environmentNode.surfaceY;
  const hitTime = 67.5;
  const hit = t - hitTime;
  yoshiNode.eggStartedAt = 64;
  yoshiNode.eggMode = t >= 64 && t < 68.6;
  for (const [i, c] of order.entries()) {
    c.visible = !introduction || c === solo;
    c.setTransform([0,0,0]);
    c.jumpHeight = 0;
    if (c.restFootY === undefined) {c.animate(1,'idle'); c.restFootY = characterFootY(c);}
    c.animate(t, opening ? 'idle' : 'combined');
    if (opening) {
      c.setTransform([c===yoshiNode?-2.8:c===toadNode?0:2.8,0,.15],[0,0,0]);
    } else if (introduction) {
      c.setTransform([0,0,.15],[0,Math.sin((t-5)*.45)*.28,0]);
    } else {
      applyWalkMovement(c,t,i);
      // The egg closes the gap along the same circular path; contact at 67.5 s.
      if (c===yoshiNode && t>=64) {
        const close = smooth((t-64)/3.5) * (1-smooth((t-69)/4));
        const angle = t*.45-4*Math.PI/3 + close*(2*Math.PI/3-.48);
        c.position[0]=Math.cos(angle)*2;
        c.position[2]=environmentNode.walkCenterZ+Math.sin(angle)*2;
        c.rotation[1]=-angle;
      }
      // Trailer-only impact: one upright hop, then resume the circular walk.
      if (c===bowserJrNode && hit>=0 && hit<1.2) {
        c.animAxisAngle=0;
        c.jumpHeight=Math.sin(Math.PI*hit/1.2)*.55;
      }
    }
    const foot=characterFootY(c);
    c.position[1]=ground-(c===toadNode&&!opening?Math.min(foot,c.restFootY):foot)+(c.jumpHeight||0);
  }
  const camera=(target,distance,yaw,pitch)=>{camTarget=target;camDist=distance;camYaw=yaw;camPitch=pitch;};
  const follow=(c,distance,height=1)=>camera([c.position[0],ground+height,c.position[2]],distance,.06,.15);
  if(opening) camera([0,1,-.3],19-t*.6,.13,.23);
  else if(introduction) camera([0,solo===toadNode?.75:1.25,.15],solo===toadNode?5.8:7.5,.08,.14);
  else if(t<35){yoshiNode.visible=false;camera([0,ground+1.525,environmentNode.walkCenterZ],10.5,.08,.28);}
  else if(t<40){yoshiNode.visible=false;follow(toadNode,6.2,.65);}
  else if(t<45){yoshiNode.visible=false;follow(bowserJrNode,7.2);}
  else if(t<54){toadNode.visible=bowserJrNode.visible=false;follow(yoshiNode,7.6,1.2);}
  else if(t<64) camera([0,ground+1.675,environmentNode.walkCenterZ],11,.12,.30);
  else if(t<70) {
    const mid=[(yoshiNode.position[0]+bowserJrNode.position[0])/2,ground+1.175,(yoshiNode.position[2]+bowserJrNode.position[2])/2];
    camera(mid,8.2,.06,.27);
    if(hit>=0&&hit<.4) camTarget[0]+=Math.sin(hit*60)*.07*(1-hit/.4);
  }
  else if(t<76) follow(yoshiNode,7.6,1.2);
  else camera([0,ground+1.775,environmentNode.walkCenterZ],11+(t-76)*.12,.12,.28);
  renderWorld([environmentNode,...order.filter(c=>c.visible)],ground);
  gl.finish();
};
