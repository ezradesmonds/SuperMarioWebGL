window.drawYoshiPhoto = function(yaw, blink) {
 gl.canvas.width=1280;gl.canvas.height=720;
 yoshiNode.animate(blink ? .16 : 1,'idle');
 yoshiNode.setTransform([0,0,0]);yoshiNode.position[1]=-characterFootY(yoshiNode);
 toadNode.visible=bowserJrNode.visible=false;
 camTarget=[0,1.35,.15];camDist=5.6;camYaw=yaw;camPitch=.12;
 renderWorld([yoshiNode],0);gl.finish();
};
