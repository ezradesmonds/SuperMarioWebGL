// Deterministic 90-second staging using the current shared models and renderer.
// Deriving every pose from t makes backward seeking restore the correct scene.
window.drawFilmFrame = function(time) {
    const t=Math.max(0,Math.min(90,time));
    const canvas=gl.canvas, ratio=Math.min(window.devicePixelRatio||1,1.5);
    const width=Math.max(1,Math.round(canvas.clientWidth*ratio));
    const height=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    lightingMode=t>=76?'golden':'day';
    const order=t<54?[toadNode,bowserJrNode,yoshiNode]:[bowserJrNode,yoshiNode,toadNode];
    const introduction=t<23, ending=t>=82;
    for(const [i,c] of order.entries()){
        c.visible=true;
        if(c===yoshiNode){c.eggMode=t>=64&&t<68.6;c.eggStartedAt=64;}
        c.animate(t,introduction||ending?'idle':'combined');
        if(introduction||ending){
            const x=c===yoshiNode?-2.8:c===toadNode?0:2.8;
            c.setTransform([x,0,.15],[0,c===yoshiNode?.15:c===toadNode?0:-.2,0]);
        }else{
            c.setTransform([0,0,0]);applyWalkMovement(c,t,i);
            if(c===bowserJrNode&&t>=67.5&&t<70)c.animAxisAngle+=Math.sin((t-67.5)/2.5*Math.PI)*.5;
        }
        c.position[1]=environmentNode.surfaceY-characterFootY(c);
    }
    camTarget=[0,1.05,environmentNode.walkCenterZ];camDist=13;camYaw=.15;camPitch=.28;
    if(t<5){camDist=22-t*.7;camYaw=.30-t*.02;camPitch=.34;}
    else if(t<23){
        const actor=t<11?toadNode:t<17?bowserJrNode:yoshiNode;
        for(const c of order)c.visible=c===actor;
        camTarget=[actor.position[0],actor.position[1]+(actor===toadNode?.9:1.45),actor.position[2]];
        camDist=actor===toadNode?3.8:5.6;camYaw=.12;camPitch=.08;
    }else if(t<82){
        camYaw=.18+Math.sin(t*.10)*.25;
        if(t>=35&&t<45){camDist=10.7;camPitch=.22;}
        if(t>=64&&t<70){camDist=11;camPitch=.36;}
        if(t>=76)camDist=14+(t-76)*.5;
    }else{camTarget=[0,1.1,1];camDist=16.4+(t-82)*.16;camPitch=.23;}
    renderWorld([environmentNode,yoshiNode,toadNode,bowserJrNode],environmentNode.surfaceY);
};
