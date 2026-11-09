// Silent, camera-independent choreography following the 110-second reference MP4.
// All poses are derived from timeline time; shared character meshes remain unchanged.
(() => {
    const duration=110;
    const emergeAt=34,leavePipeAt=36,joinAt=40,eggAt=64,impactAt=68,settleAt=75,walkAt=80;
    const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
    const mix=(a,b,u)=>a+(b-a)*u;
    const turn=(a,b,u)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*u;
    function find(root,name){if(root.name===name)return root;for(const child of root.children){const found=find(child,name);if(found)return found;}}
    function track(t,index,advance=0){
        const a=t*.65-index*Math.PI*2/3+advance;
        return {x:Math.cos(a)*2,z:environmentNode.walkCenterZ+Math.sin(a)*2,yaw:-a,
            vx:-Math.sin(a)*1.3,vz:Math.cos(a)*1.3};
    }
    // Cubic Hermite joins preserve both position and velocity at either end.
    function curve(a,b,seconds,u){
        u=Math.max(0,Math.min(1,u));
        const h00=2*u*u*u-3*u*u+1,h10=u*u*u-2*u*u+u;
        const h01=-2*u*u*u+3*u*u,h11=u*u*u-u*u;
        const d00=6*u*u-6*u,d10=3*u*u-4*u+1,d01=-d00,d11=3*u*u-2*u;
        const x=h00*a.x+h10*seconds*a.vx+h01*b.x+h11*seconds*b.vx;
        const z=h00*a.z+h10*seconds*a.vz+h01*b.z+h11*seconds*b.vz;
        const dx=d00*a.x+d10*seconds*a.vx+d01*b.x+d11*seconds*b.vx;
        const dz=d00*a.z+d10*seconds*a.vz+d01*b.z+d11*seconds*b.vz;
        return {x,z,yaw:Math.hypot(dx,dz)>.00001?Math.atan2(dx,dz):(u<.5?a.yaw:b.yaw)};
    }
    function place(c,t,mode,x,z,yaw){
        // Keep supporting actors active rather than standing in an idle pose.
        if(mode==='idle'){
            mode='combined';
            const phase=c===yoshiNode?0:c===bowserJrNode?2:4;
            x+=Math.sin(t*1.8+phase)*.18;z+=Math.cos(t*1.8+phase)*.12;
            yaw+=Math.sin(t*1.8+phase)*.12;
        }
        c.visible=true;c.setTransform([x,0,z],[0,yaw,0]);c.animate(t,mode);
        if(mode==='action'){
            const left=find(c,'LeftShoulder'),right=find(c,'RightShoulder');
            if(c===bowserJrNode){
                left.animRot=[-.6+Math.sin(t*6)*.3,0,-.2];
                right.animRot=[-.6-Math.sin(t*6)*.3,0,.2];
            }else if(c===toadNode){
                left.animRot=[Math.sin(t*5)*.25,0,-.55];
                right.animRot=[-Math.sin(t*5)*.25,0,.55];
            }
        }
    }
    function chase(c,t,index){
        const p=track(t,index);
        place(c,t,'combined',p.x,p.z,p.yaw);
        c.animAxis=[1,0,1];c.animAxisAngle=.09*Math.sin(t*4.5);
    }
    function pipeEntrance(c,t){
        const pipe=find(environmentNode,'WarpPipe'),mouth=find(pipe,'InnerOpening');
        const top=pipe.position[1]+mouth.position[1]+mouth.scale[1]/2;
        const end=track(joinAt,2),seconds=joinAt-leavePipeAt;
        const start={x:pipe.position[0],z:pipe.position[2],vx:0,vz:0};
        start.yaw=Math.atan2(3*(end.x-start.x)-seconds*end.vx,3*(end.z-start.z)-seconds*end.vz);
        if(t<leavePipeAt){
            const u=smooth((t-emergeAt)/(leavePipeAt-emergeAt)),size=mix(.04,1,u);
            place(c,t,'combined',start.x,start.z,start.yaw);
            c.scale=[size,size,size];
            return mix(top-.2,top+.08,u);
        }
        const u=(t-leavePipeAt)/(joinAt-leavePipeAt),p=curve(start,end,joinAt-leavePipeAt,u);
        place(c,t,'combined',p.x,p.z,p.yaw);
        c.animAxisAngle=.09*Math.sin(t*4.5)*smooth(u);
        // Lift off the mouth, then land on the chase circle with zero vertical speed.
        return mix(top+.08,environmentNode.surfaceY,smooth(u))+.65*Math.sin(Math.PI*u)**2;
    }
    const contactGap=2*Math.asin(1.2/4);
    const catchUp=Math.PI*2/3-contactGap;
    function eggPose(c,t,phase){
        c.eggMode=true;c.eggStartedAt=t-phase;
    }
    function impactRest(index){
        const p=track(impactAt,index,index===2?catchUp:0);
        const speed=index===2?1.3+4*catchUp/(impactAt-eggAt):3.1;
        const distance=.9;
        const end=index===2?track(impactAt,2):{
            x:p.x+Math.sin(p.yaw)*distance,z:p.z+Math.cos(p.yaw)*distance,yaw:p.yaw};
        return {start:{...p,vx:Math.sin(p.yaw)*speed,vz:Math.cos(p.yaw)*speed},
            end:{...end,vx:0,vz:0}};
    }
    function stoppedToad(){
        // Integrate a two-second slowdown instead of cutting to a stationary pose.
        return track(impactAt+1,0);
    }
    function seatedBowser(c,weight){
        // Pose the existing hierarchy: torso leaned back, legs forward, hands braced.
        function pose(n,target){n.animRot=n.animRot.map((v,i)=>mix(v,target[i],weight));}
        pose(find(c,'BowserJrBody'),[-.42,0,0]);
        pose(find(c,'BowserJrHeadPivot'),[.22,0,0]);
        for(const [side,sign] of [['Left',-1],['Right',1]]){
            const hip=find(c,side+'Hip');
            pose(hip,[-1.4,0,sign*.16]);
            pose(find(hip,'FootEllipsoid'),[.8,0,0]);
            pose(find(c,side+'Shoulder'),[.4,0,sign*.25]);
        }
    }
    function frame(t){
        const y=yoshiNode,b=bowserJrNode,toad=toadNode;
        // Cache the neutral foot height before posing so jumps are not grounded away.
        for(const c of [y,b,toad])if(c.restFootY===undefined){c.animate(0,'idle');c.restFootY=characterFootY(c);}
        y.eggMode=false;
        // Each shot explicitly spawns its actors. Never retain actors from a previous shot.
        for(const c of [y,b,toad]){c.visible=false;c.resetAnim();c.scale=[1,1,1];}
        let bowserLift=0,yoshiLift=0,yoshiSurface=environmentNode.surfaceY;
        if(t<6){
            // The opening and introduction feature Toad alone in the reference.
            chase(toad,t,0);
        }else if(t<15){
            place(toad,t,'action',0,2.8,Math.sin(t*.7)*.15);
            const left=find(toad,'LeftShoulder'),right=find(toad,'RightShoulder');
            left.animRot=[0,0,-.5-Math.sin(t*4)*.2];right.animRot=[0,0,.5+Math.sin(t*4)*.2];
        }else if(t<24){
            // Bowser enters at the cut to his introduction (15 seconds).
            const u=smooth((t-15)/2.5);
            place(toad,t,'action',mix(0,-1,u),2.8,Math.PI/2);
            place(b,t,'action',mix(3,1.3,u),2.8,-Math.PI/2);
            bowserLift=Math.max(0,Math.sin((t-15)*3))*.45;
        }else if(t<emergeAt){
            // Yoshi has not entered the story yet.
            chase(toad,t,0);chase(b,t,1);
        }else if(t<eggAt){
            // Bowser keeps chasing while Yoshi emerges, grows, and joins the same path.
            chase(toad,t,0);chase(b,t,1);
            if(t<joinAt)yoshiSurface=pipeEntrance(y,t);
            else chase(y,t,2);
        }else if(t<impactAt){
            const u=(t-eggAt)/(impactAt-eggAt);
            eggPose(y,t,.3*smooth((t-eggAt)/.55));
            chase(toad,t,0);chase(b,t,1);
            // Accelerate around the existing circle until the egg reaches Bowser's back.
            const p=track(t,2,catchUp*u*u);
            place(y,t,'combined',p.x,p.z,p.yaw);
            y.animAxisAngle=.09*Math.sin(t*4.5);
            find(y,'YoshiEggRollPivot').animRot=[2*((t-eggAt)*.65+catchUp*u*u)/.65,0,0];
        }else if(t<settleAt){
            const q=t-impactAt,yr=impactRest(2),br=impactRest(1);
            const yp=curve(yr.start,yr.end,1.8,q/1.8),bp=curve(br.start,br.end,.9,q/.9);
            const face=smooth((q-1.5)/3),ypYaw=turn(yr.start.yaw,Math.atan2(br.end.x-yr.end.x,br.end.z-yr.end.z),face);
            const bpYaw=turn(br.start.yaw,Math.atan2(yr.end.x-br.end.x,yr.end.z-br.end.z),face);
            // Rebound to Yoshi's original chase slot, then unfold after landing.
            if(q<2)eggPose(y,t,4.3+.3*smooth((q-1.3)/.7));
            place(y,t,'combined',yp.x,yp.z,ypYaw);
            const rollAtImpact=2*((impactAt-eggAt)*.65+catchUp)/.65;
            const reboundDistance=(yp.x-yr.start.x)*Math.sin(yr.start.yaw)+(yp.z-yr.start.z)*Math.cos(yr.start.yaw);
            find(y,'YoshiEggRollPivot').animRot=[rollAtImpact+reboundDistance/.65,0,0];
            place(b,t,'combined',bp.x,bp.z,bpYaw);
            y.animAxisAngle=.09*Math.sin(impactAt*4.5)*(1-smooth(q));
            b.animAxisAngle=.09*Math.sin(impactAt*4.5)*(1-smooth(q/.8))+.18*Math.sin(Math.PI*smooth(q/.8));
            seatedBowser(b,smooth(q/.9)*(1-smooth((q-2.5)/2)));
            bowserLift=.3*Math.sin(Math.PI*smooth(q/.8));
            yoshiLift=.65*Math.sin(Math.PI*smooth(q/1.8));
            const d=Math.min(q,2),tp=track(impactAt+d-d*d/4,0);
            place(toad,t,'combined',tp.x,tp.z,tp.yaw);
            toad.animAxisAngle=.09*Math.sin(impactAt*4.5)*(1-smooth(q/2));
        }else{
            const u=Math.min(1,(t-settleAt)/(walkAt-settleAt)),yr=impactRest(2).end,br=impactRest(1).end,tp=stoppedToad();
            const yYaw=Math.atan2(br.x-yr.x,br.z-yr.z),bYaw=Math.atan2(yr.x-br.x,yr.z-br.z);
            for(const [c,index,start,yaw] of [[y,2,yr,yYaw],[b,1,br,bYaw],[toad,0,tp,tp.yaw]]){
                const end=track(impactAt,index),p=t<walkAt
                    ?curve({...start,vx:0,vz:0,yaw},{...end,vx:end.vx*.6,vz:end.vz*.6},walkAt-settleAt,u)
                    :track(impactAt+(t-walkAt)*.6,index);
                place(c,t,'combined',p.x,p.z,t<walkAt?turn(yaw,p.yaw,smooth(u/.3)):p.yaw);
                c.animAxisAngle=.09*Math.sin(t*4.5)*smooth(u);
            }
        }
        // Ground each pose after all local and root rotations have been applied.
        for(const c of [y,b,toad]){
            if(!c.visible)continue;
            // A seated Bowser rests on his torso/shell as well as his feet.
            const foot=characterFootY(c,c===b?/sole|footellipsoid|BowserJrBody|GreenShellDome|ShellWhiteTorusRim/i:undefined);
            const supportingFoot=c===toad?Math.min(foot,c.restFootY):foot;
            c.position[1]=(c===y?yoshiSurface+yoshiLift:environmentNode.surfaceY)-supportingFoot+(c===b?bowserLift:0);
        }
        renderWorld([environmentNode,y,toad,b],environmentNode.surfaceY);
    }
    window.CharacterFilm={active:false,time:0,duration,
        toggle(){
            this.active=!this.active;this.time=0;
            if(this.active){this.previousView=viewMode;viewMode='env';}
            else{
                viewMode=this.previousView||'env';yoshiNode.eggMode=false;
                // Visibility belongs to the film only; normal mode shows all models again.
                for(const c of [yoshiNode,toadNode,bowserJrNode]){c.visible=true;c.scale=[1,1,1];}
            }
        },
        advance(dt){this.time=(this.time+dt)%duration;frame(this.time);},
        frame
    };
})();
