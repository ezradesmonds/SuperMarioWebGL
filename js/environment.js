// Mushroom Kingdom: shared meshes, geometric scenery, and hierarchical animation.
function createMarioEnvironment(gl) {
    const root = new SceneNode('MushroomKingdom');
    const grass = [0.30,0.67,0.12], edge = [0.18,0.57,0.10];
    const white = [0.97,0.99,1], green = [0.12,0.64,0.17], black = [0.035,0.09,0.07];
    const box = Primitives.createBox(gl,1,1,1);
    const sphere = Primitives.createEllipsoid(gl,1,1,1,16,24);
    const cylinder = Primitives.createCylinder(gl,1,1,32,1,true);
    const detailSphere=Primitives.createEllipsoid(gl,1,1,1,8,12);
    const hillSphere=Primitives.createEllipsoid(gl,1,1,1,28,36);
    const clouds = [], blocks = [], coins = [], plants = [], butterflies = [], flags = [], windmills = [], sparkles = [];
    const shadowFootprints = [];
    const meadowTop = -2.5 + 0.25 / 2;
    const platformFootprints = [];
    root.shadowFootprints = shadowFootprints;
    function node(parent,name,mesh,color,pos,scale=[1,1,1],rot=[0,0,0]) {
        return parent.add(new SceneNode(name,mesh,color,24).setTransform(pos,rot,scale));
    }
    function ball(parent,name,color,pos,scale) {
        const small=/^(Petal|FlowerHeart|Eye|HillSpeck|GrassBlade|GardenLeaf|ButterflyBody|WingDot|DoorKnob|PotFlower|WaterSpray|CascadeFoam|RedFruit|CornerRivet)$/.test(name);
        return node(parent,name,small?detailSphere:sphere,color,pos,scale);
    }
    function cube(parent,name,color,pos,scale) { return node(parent,name,box,color,pos,scale); }
    const roundedCache=new Map();
    function rounded(parent,name,color,pos,dimensions,radius=0.08) {
        const key=JSON.stringify([...dimensions,radius]);
        if(!roundedCache.has(key))roundedCache.set(key,Primitives.createRoundedBox(gl,...dimensions,radius));
        return node(parent,name,roundedCache.get(key),color,pos);
    }
    function turfSkirt(w,d) {
        const data={positions:[],normals:[],indices:[]},radius=0.16;
        const perimeter=[];
        for(let corner=0;corner<4;corner++) {
            const angle=corner*Math.PI/2;
            const cx=(corner===0||corner===3?1:-1)*(w/2-radius);
            const cz=(corner<2?1:-1)*(d/2-radius);
            for(let j=0;j<=6;j++) {
                const a=angle+j*Math.PI/12;
                perimeter.push([cx+Math.cos(a)*radius,cz+Math.sin(a)*radius]);
            }
        }
        // Subdivide long edges for a continuous gently draping grass silhouette.
        const points=[];
        for(let i=0;i<perimeter.length;i++) {
            const a=perimeter[i],b=perimeter[(i+1)%perimeter.length];
            const steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/0.10));
            for(let j=0;j<steps;j++)points.push([a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps]);
        }
        for(let i=0;i<=points.length;i++) {
            const [x,z]=points[i%points.length];
            const nx=Math.abs(x)/(w/2)>Math.abs(z)/(d/2)?Math.sign(x):0;
            const nz=nx===0?Math.sign(z):0;
            const hang=0.19+0.045*Math.sin(x*14+z*13)+0.015*Math.sin(x*27-z*17);
            data.positions.push(x,-0.035,z,x,-hang,z);
            data.normals.push(nx,0,nz,nx,0,nz);
            if(i<points.length){const k=i*2;data.indices.push(k,k+1,k+2,k+1,k+3,k+2);}
        }
        return Primitives.createMeshBuffer(gl,data);
    }
    function platform(x,z,w,d,top,h) {
        const p=node(root,'GrassPlatform',null,white,[x,top,z]);
        platformFootprints.push({x,z,w,d,top});
        p.platformBounds={x,z,w,d,top};
        // Every island reaches the meadow, with a slight overlap preventing floating seams.
        h=Math.max(h,top-0.16-meadowTop+0.04);
        p.platformBounds.soilBottom=top-h-0.16;
        const soil=rounded(p,'CheckerSoil',[0.68,0.43,0.20],[0,-h/2-0.16,0],[w,h,d],0.12);
        soil.checker = true;
        rounded(p,'DarkGrassLip',edge,[0,-0.12,0],[w+0.10,0.23,d+0.10],0.10);
        rounded(p,'GrassSurface',grass,[0,-0.055,0],[w+0.08,0.11,d+0.08],0.045).materialKind=1;
        node(p,'DrapedTurf',turfSkirt(w+0.09,d+0.09),edge,[0,0,0]);
        return p;
    }
    root.surfaceY=0;
    // Extend the soil down into the meadow; leave the stage/character surface at y=0.
    const mainSoilHeight = root.surfaceY - 0.16 - meadowTop + 0.04;
    platform(0,0,10.8,5.2,root.surfaceY,mainSoilHeight);
    platform(-7,-5.5,3.5,3.5,0.65,3.2);
    platform(-2.4,-7.4,3.8,2.8,0.25,2.6);
    platform(2.3,-6.3,4,3.1,1.05,3.3);
    platform(7,-8.8,3.8,3.6,2.0,4.0);
    platform(8,-3.0,2.6,2.8,-0.25,2.0);
    platform(-9,-11,3.5,3,1.5,3.8);
    platform(0,-13,4,3,1.9,4.2);
    cube(root,'Meadow',[0.26,0.67,0.24],[0,-2.5,0],[100,0.25,100]).materialKind = 1;
    function pipe(x,y,z,h) {
        const p=node(root,'WarpPipe',null,white,[x,y,z]);
        shadowFootprints.push([x-0.22,z-0.15,y,0.75]);
        node(p,'PipeBody',cylinder,green,[0,h/2,0],[0.49,h,0.49]);
        node(p,'ThickLip',cylinder,[0.18,0.75,0.22],[0,h-0.04,0],[0.60,0.24,0.60]);
        node(p,'DarkOpening',cylinder,[0.025,0.15,0.055],[0,h+0.085,0],[0.48,0.012,0.48]);
        node(p,'InnerOpening',cylinder,[0.015,0.075,0.025],[0,h+0.093,0],[0.39,0.008,0.39]);
        ball(p,'PipeHighlight',[0.33,0.87,0.32],[-0.32,h/2,0.36],[0.035,h*0.40,0.025]);
    }
    pipe(-4.2,0,-1.55,1.15); pipe(-7,0.65,-5.7,1.35); pipe(2.6,1.05,-6.6,1.2); pipe(7.3,2,-9,0.95);
    function question(x,y,z) {
        const q=node(root,'QuestionBlock',Primitives.createRoundedBox(gl,1,1,1,0.055),[0.98,0.65,0.04],[x,y,z],[0.72,0.72,0.72]); blocks.push(q);
        cube(q,'GoldInset',[1,0.77,0.075],[0,0,0.507],[0.90,0.90,0.025]);
        // Extruded pixel question mark, front and back (no image texture).
        const glyph=['01110','11011','00011','00110','00100','00000','00100'];
        for(const side of [-1,1]) {
            for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(glyph[r][c]==='1')
                cube(q,'QuestionGlyph',white,[(c-2)*0.108,(3-r)*0.105,side*0.535],[0.112,0.109,0.035]);
            for(const a of [-1,1])for(const b of [-1,1])ball(q,'CornerRivet',[0.64,0.36,0.06],[a*0.39,b*0.39,side*0.52],[0.035,0.035,0.018]);
        }
    }
    function brick(x,y,z) {
        const b=node(root,'BrickBlock',Primitives.createRoundedBox(gl,1,1,1,0.035),[0.36,0.16,0.07],[x,y,z],[0.72,0.72,0.72]);
        for(let row=0;row<3;row++)for(let col=0;col<2;col++)
            cube(b,'BrickFace',[0.67+row*0.035,0.30,0.12],[-0.245+col*0.49+(row%2)*0.04,-0.33+row*0.33,0],[0.45,0.29,1.01]);
    }
    for(const [x,y,z] of [[-7,3.6,-5.5],[0,4.9,-6.4],[0.76,4.9,-6.4],[6.8,4.4,-9],[8,2.4,-3.2]])question(x,y,z);
    for(const [x,y,z] of [[-7.76,3.6,-5.5],[-6.24,3.6,-5.5],[-0.76,4.9,-6.4],[6.04,4.4,-9],[5.28,4.4,-9]])brick(x,y,z);
    function eyes(p,y,z,spacing=0.18) {
        for(const s of [-1,1])ball(p,'Eye',black,[s*spacing,y,z],[0.045,0.115,0.025]);
    }
    function mushroom(x,y,z,size,color) {
        const p=node(root,'SpottedMushroom',null,white,[x,y,z],[size,size,size]);
        ball(p,'CreamStalk',[1,0.87,0.61],[0,0.24,0],[0.23,0.29,0.22]);
        ball(p,'MushroomCap',color,[0,0.58,0],[0.57,0.36,0.53]);
        const patch=Primitives.createEllipsoidPatch;
        for(const dir of [[0,1,0],[-0.65,0.55,0.55],[0.65,0.55,0.55],[0,0.45,-0.85]]) {
            node(p,'WhiteSpot',patch.call(Primitives,gl,0.57,0.36,0.53,dir,0.30,5,10,0.004),white,[0,0.58,0]);
        }
        eyes(p,0.27,0.21,0.075);
    }
    mushroom(-4.5,0,1.5,0.8,[0.93,0.08,0.12]); mushroom(4.6,0,1.35,0.85,green);
    mushroom(-2.9,0.25,-7.0,0.8,[0.93,0.08,0.12]); mushroom(7.6,2,-8.0,0.9,[0.93,0.08,0.12]);
    mushroom(8,-0.25,-2.4,0.9,green); mushroom(-8,0.65,-5,0.65,green);
    function hill(x,z,w,h,color,face) {
        h *= 0.73;
        const p=node(root,'RoundHill',null,white,[x,-2.3,z]);
        node(p,'Hill',hillSphere,color,[0,h*0.40,0],[w,h,w*0.65]).materialKind=7;
        if(face)eyes(p,h*0.85,w*0.60,0.25);
        for(let i=0;i<4;i++)ball(p,'HillSpeck',[0.63,0.86,0.32],[(i%2?1:-1)*w*0.35,h*(0.45+i*0.18),w*0.59],[0.07,0.12,0.025]);
    }
    hill(-12,-18,3,6,[0.35,0.75,0.36],true); hill(-7,-22,3,8,[0.43,0.80,0.47],false);
    hill(4,-21,3.5,7,[0.39,0.76,0.37],true); hill(11,-19,3,8,[0.39,0.78,0.31],true);
    hill(0,-27,4,9,[0.49,0.81,0.53],false); hill(16,-25,4,7,[0.53,0.83,0.49],false);
    for(const [x,y,z,s] of [[-10,7,-15,1.5],[-5,8.5,-21,1.3],[1,6.6,-18,1],[8,8.5,-22,1.3],[13,6,-14,1.5],[-15,5,-26,2],[0,5,-30,2]]) {
        const p=node(root,'Cloud',null,white,[x,y,z],[s,s,s]); clouds.push(p);
        ball(p,'Puff',white,[0,0.15,0],[0.65,0.60,0.45]);
        ball(p,'Puff',white,[-0.5,-0.06,0],[0.48,0.38,0.4]);
        ball(p,'Puff',white,[0.5,-0.06,0],[0.48,0.38,0.4]); eyes(p,0.27,0.43,0.13);
    }
    function flower(x,z,color,y=0) {
        const f=node(root,'Flower',null,white,[x,y,z]); plants.push(f);
        node(f,'Stem',cylinder,green,[0,0.14,0],[0.022,0.28,0.022]);
        for(let i=0;i<5;i++){ const a=i*Math.PI*2/5;ball(f,'Petal',color,[Math.cos(a)*0.09,0.30+Math.sin(a)*0.09,0],[0.065,0.065,0.035]); }
        ball(f,'FlowerHeart',[1,0.73,0.04],[0,0.30,0.035],[0.055,0.055,0.03]);
    }
    for(const x of [-4.9,-3.7,-1.3,1.4,3.7,4.9])flower(x,2.1,x<0?white:[1,0.36,0.48]);
    for(const [x,z] of [[-4.8,0.5],[-3.8,1.9],[3.8,1.8],[4.8,-0.5]]) {
        ball(root,'Pebble',[0.54,0.61,0.43],[x,0.065,z],[0.14,0.08,0.11]);
        for(let i=0;i<3;i++) {
            const tuft=ball(root,'GrassBlade',edge,[x+0.16+i*0.06,0.10,z-0.1],[0.025,0.14,0.035]);
            tuft.rotation[2]=(i-1)*0.35;
        }
    }
    for(let i=0;i<7;i++) {
        const c=node(root,'RotatingCoin',null,white,[-3+i,2.0+Math.sin(i*0.5)*0.45,-10]);coins.push(c);
        node(c,'GoldDisc',cylinder,[1,0.72,0.035],[0,0,0],[0.20,0.065,0.20],[Math.PI/2,0,0]);
        cube(c,'CoinEmboss',[1,0.88,0.18],[0,0,0.045],[0.035,0.23,0.025]);
    }
    // An outer loop of landmarks leaves the character stage and orbit sightlines open.
    // Foreground islands stay low; these become the background at 180 degrees.
    platform(-7.8,4.4,3.0,2.7,-0.8,1.4);
    platform(7.5,4.8,3.1,3.0,-0.65,1.55);
    platform(-5.0,18.7,3.6,3.0,-0.35,1.7);
    platform(0.0,21.2,3.2,2.8,0.25,2.25);
    platform(5.6,19.5,3.7,3.3,0.7,2.8);
    platform(-11.3,0.0,2.8,3.6,0.15,2.3);
    platform(11.9,0.8,3.1,3.6,0.5,2.65);
    pipe(-5.4,-0.35,18.5,1.1);pipe(5.8,0.7,19.7,1.25);
    pipe(-11.4,0.15,-0.6,1.0);
    question(-0.4,2.7,21.2);question(5.3,3.3,19.3);
    brick(-1.16,2.7,21.2);brick(0.36,2.7,21.2);
    brick(6.06,3.3,19.3);brick(-11.3,2.65,0);
    mushroom(-7.7,-0.8,4.5,0.8,[0.94,0.13,0.16]);
    mushroom(7.7,-0.65,4.6,0.8,green);
    mushroom(-4.2,-0.35,18.6,0.65,green);
    mushroom(0.7,0.25,21.1,0.75,[0.94,0.13,0.16]);
    mushroom(11.8,0.5,1.0,1.05,[0.94,0.13,0.16]);

    // Hills and cloud banks surround the level, with faces turned toward the stage.
    for(const [x,z,w,h] of [[-17,11,3,6],[-11,20,3.5,7],[-3,23,3.4,8],[7,22,3.6,6.5],[16,15,3.1,8],[-21,-2,3.5,7],[22,-3,3.5,7]]) {
        hill(x,z,w,h,[0.35+(x+21)*0.003,0.74,0.36],true);
        root.children[root.children.length-1].rotation[1]=Math.atan2(-x,-z);
    }
    for(const [x,y,z,size] of [[-16,6,8,1.3],[-9,7.5,19,1.6],[2,7.8,23,1.5],[13,6.5,18,1.8],[19,8,4,1.3],[-22,8,-3,1.8]]) {
        const c=node(root,'Cloud',null,white,[x,y,z],[size,size,size],[0,Math.atan2(-x,-z),0]);clouds.push(c);
        ball(c,'CloudPuff',white,[0,0.1,0],[0.68,0.57,0.45]);
        ball(c,'CloudPuff',white,[-0.5,-0.07,0],[0.46,0.34,0.39]);
        ball(c,'CloudPuff',white,[0.5,-0.07,0],[0.46,0.34,0.39]);eyes(c,0.28,0.43,0.13);
    }

    // A curving stream at meadow level: a geometric ribbon, with shader ripples.
    const riverData={positions:[],normals:[],indices:[]};
    const riverX=z=>-12.8+Math.sin(z*0.19)*1.65;
    for(let i=0;i<=64;i++) {
        const z=-28+i*0.9;
        for(const side of [-1,1]) {
            riverData.positions.push(riverX(z)+side*0.85,-2.352,z);
            riverData.normals.push(0,1,0);
        }
        if(i<64){const k=i*2;riverData.indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
    node(root,'WindingStream',Primitives.createMeshBuffer(gl,riverData),[0.08,0.62,0.86],[0,0,0]).materialKind=2;
    for(let i=0;i<14;i++) {
        const z=-19+i*3.2;
        for(const side of [-1,1])ball(root,'RiverStone',[0.50,0.57,0.49],[riverX(z)+side*1.02,-2.28,z],[0.22+(i%3)*0.055,0.13,0.20]);
    }
    // Timber bridge over the stream, including posts, rails, and plank seams.
    const bridge=node(root,'TimberBridge',null,white,[riverX(5),-2.08,5]);
    for(let i=0;i<11;i++)cube(bridge,'BridgePlank',[0.65+(i%2)*0.06,0.39,0.18],[-1.45+i*0.29,0,0],[0.27,0.15,1.35]);
    for(const side of [-1,1]) {
        cube(bridge,'BridgeRail',[0.48,0.27,0.12],[0,0.64,side*0.65],[3.25,0.09,0.08]);
        for(const x of [-1.5,0,1.5])cube(bridge,'BridgePost',[0.56,0.32,0.14],[x,0.35,side*0.65],[0.12,0.85,0.12]);
    }
    function fence(x,y,z,length,rotation=0) {
        const f=node(root,'WhitePicketFence',null,white,[x,y,z],[1,1,1],[0,rotation,0]);
        for(let i=0;i<=length;i++) {
            cube(f,'FencePicket',[0.95,0.88,0.69],[-length*0.22+i*0.44,0.30,0],[0.12,0.6,0.10]);
            ball(f,'PicketCap',white,[-length*0.22+i*0.44,0.60,0],[0.075,0.09,0.06]);
        }
        for(const y of [0.18,0.43])cube(f,'FenceRail',[0.83,0.73,0.53],[0,y,-0.06],[length*0.44+0.2,0.07,0.08]);
    }
    fence(-5.0,-0.35,17.45,5);fence(5.6,0.7,20.9,6);fence(12.8,0.5,0.8,5,Math.PI/2);
    fence(-1.8,0,-2.35,4);fence(1.8,0,-2.35,4);

    function tree(x,y,z,size=1) {
        const t=node(root,'RoundTree',null,white,[x,y,z],[size,size,size]);
        node(t,'TreeTrunk',cylinder,[0.48,0.27,0.11],[0,0.65,0],[0.15,1.3,0.15]);
        for(const [dx,dy,dz,r] of [[0,1.7,0,0.75],[-0.45,1.4,0.1,0.55],[0.45,1.45,0.05,0.6]])ball(t,'TreeCrown',[0.24,0.62+dy*0.035,0.12],[dx,dy,dz],[r,r*1.1,r]);
        for(const [dx,dy,dz] of [[-0.4,1.4,0.56],[0.4,1.6,0.56],[0.1,2.1,0.55]])ball(t,'RedFruit',[0.94,0.13,0.09],[dx,dy,dz],[0.11,0.12,0.11]);
        shadowFootprints.push([x-0.3,z-0.2,y,0.9*size]);
    }
    tree(-9.5,-2.37,8,1.05);tree(9.7,-2.37,8.8,1.2);tree(13,-2.37,-6,1.25);
    tree(-16,-2.37,-8,1.2);tree(4,-2.37,16,1.4);
    // Low garden patches are kept outside each character's animation footprint.
    const gardenSpots=[[-4.9,-1.7,0],[4.8,-1.6,0],[-4.8,1.9,0],[4.0,2.0,0],[-7.9,5.2,-0.8],[7.3,5.8,-0.65],[-5.7,19.5,-0.35],[4.7,19.7,0.7],[-11.4,1.2,0.15],[12.4,2.1,0.5]];
    for(const [x,z,y] of gardenSpots) {
        for(let i=0;i<3;i++)flower(x+(i-1)*0.22,z+(i%2)*0.18,i%2?white:[1,0.45,0.22],y);
        for(let i=0;i<3;i++) {
            const leaf=ball(root,'GardenLeaf',green,[x-0.28+i*0.12,y+0.13,z-0.18],[0.055,0.19,0.06]);leaf.rotation[2]=(i-1)*0.45;
        }
    }
    // Discrete stepping stones connect the outer gardens without filling the stage.
    for(let i=0;i<14;i++) {
        const a=i*Math.PI*2/14;
        ball(root,'SteppingStone',[0.69,0.69,0.48],[Math.cos(a)*8.8,-2.29,Math.sin(a)*7.6],[0.38,0.10,0.27]);
    }
    function coinArc(cx,y,cz,angle) {
        for(let i=0;i<5;i++) {
            const d=(i-2)*0.48;
            const c=node(root,'GardenCoin',null,white,[cx+Math.cos(angle)*d,y+Math.sin(i*Math.PI/4)*0.45,cz+Math.sin(angle)*d]);coins.push(c);
            node(c,'Coin',cylinder,[1,0.71,0.035],[0,0,0],[0.18,0.065,0.18],[Math.PI/2,0,0]);
            cube(c,'CoinStripe',[1,0.93,0.34],[0,0,0.04],[0.035,0.21,0.025]);
        }
    }
    coinArc(-7.8,0.6,4.5,0);coinArc(6.8,1.0,5.0,0.3);coinArc(0,1.45,21.2,0);
    // Animated butterflies: tiny hinged wings and slow looping flights.
    for(const [x,y,z] of [[-4.5,0.8,1.6],[4.6,0.9,-1.7],[-7.4,0.1,5.4],[6,1.5,20]]) {
        const b=node(root,'Butterfly',null,white,[x,y,z]);
        ball(b,'ButterflyBody',black,[0,0,0],[0.025,0.08,0.025]);
        const wings=[];
        for(const side of [-1,1]) {
            const hinge=node(b,'WingHinge',null,white,[0,0,0]);
            ball(hinge,'Wing',[0.98,0.54,0.16],[side*0.09,0.025,0],[0.10,0.13,0.025]);
            ball(hinge,'WingDot',white,[side*0.11,0.07,0.025],[0.023,0.03,0.01]);wings.push(hinge);
        }
        butterflies.push({node:b,wings});
    }
    function flag(x,y,z) {
        const p=node(root,'CheckpointFlag',null,white,[x,y,z]);
        node(p,'FlagPole',cylinder,[0.84,0.86,0.78],[0,1.1,0],[0.035,2.2,0.035]);
        ball(p,'FlagFinial',[1,0.75,0.16],[0,2.24,0],[0.09,0.09,0.09]);
        const cloth=cube(p,'FlagCloth',[0.93,0.18,0.15],[0.32,1.87,0],[0.6,0.40,0.035]);flags.push(cloth);
        ball(cloth,'FlagEmblem',white,[0,0,0.55],[0.17,0.24,0.06]);
    }
    flag(-0.9,0.25,21.5);flag(11.7,0.5,-0.5);
    function lantern(x,y,z) {
        const p=node(root,'GardenLantern',null,white,[x,y,z]);
        node(p,'LanternPost',cylinder,[0.23,0.31,0.19],[0,0.40,0],[0.045,0.8,0.045]);
        const glow=ball(p,'WarmLantern',[1,0.72,0.24],[0,0.93,0],[0.14,0.20,0.14]);glow.materialKind=3;
        cube(p,'LanternRoof',[0.20,0.35,0.17],[0,1.15,0],[0.38,0.07,0.35]);
        cube(p,'LanternBase',[0.20,0.35,0.17],[0,0.73,0],[0.30,0.06,0.28]);
    }
    lantern(-4.9,0,0.2);lantern(4.9,0,0.2);lantern(-4.0,-0.35,19.5);lantern(6.6,0.7,20.8);

    // Distinct landmarks give the orbit a village, a castle, and a waterside garden.
    function cottage(x,y,z,scale,capColor) {
        const house=node(root,'MushroomCottage',null,white,[x,y,z],[scale,scale,scale]);
        node(house,'CottageWall',cylinder,[0.98,0.86,0.58],[0,0.64,0],[0.65,1.28,0.65]);
        ball(house,'CottageRoof',capColor,[0,1.37,0],[1.02,0.57,0.93]);
        for(const dir of [[0,1,0],[-0.62,0.65,0.45],[0.62,0.65,0.45],[0,0.6,-0.8]])
            node(house,'RoofSpot',Primitives.createEllipsoidPatch(gl,1.02,0.57,0.93,dir,0.23,5,12,0.008),white,[0,1.37,0]);
        rounded(house,'ArchedDoor',[0.30,0.18,0.09],[0,0.37,0.63],[0.38,0.74,0.09],0.15);
        ball(house,'DoorKnob',[1,0.76,0.16],[0.12,0.36,0.69],[0.035,0.035,0.025]);
        for(const side of [-1,1]) {
            ball(house,'WindowFrame',[0.61,0.37,0.16],[side*0.49,0.73,0.48],[0.17,0.19,0.055]);
            ball(house,'WindowGlass',[0.42,0.81,0.89],[side*0.49,0.73,0.53],[0.125,0.145,0.018]);
            cube(house,'WindowMullion',white,[side*0.49,0.73,0.555],[0.025,0.28,0.018]);
        }
        rounded(house,'Doorstep',[0.69,0.60,0.43],[0,0.035,0.81],[0.6,0.07,0.34],0.03);
        for(const side of [-1,1]) {
            node(house,'FlowerPot',cylinder,[0.71,0.32,0.17],[side*0.48,0.12,0.78],[0.10,0.24,0.10]);
            ball(house,'PotFlower',[1,0.68,0.18],[side*0.48,0.28,0.78],[0.12,0.08,0.10]);
        }
    }
    cottage(-12.3,meadowTop,-12.8,1.15,[0.92,0.14,0.16]);
    cottage(-15.2,meadowTop,-10.1,0.85,[0.16,0.63,0.75]);
    cottage(-7.7,meadowTop,23.0,1.1,[0.94,0.30,0.16]);
    cottage(-4.3,meadowTop,25.2,0.9,[0.60,0.36,0.77]);
    platform(11,-16,5.1,4.6,-0.3,2.0);
    const castle=node(root,'PeachGardenCastle',null,white,[11,-0.3,-16]);
    rounded(castle,'CastleHall',[0.93,0.85,0.71],[0,1.0,0],[2.4,2.0,1.8],0.12);
    rounded(castle,'CastleGate',[0.34,0.22,0.15],[0,0.63,0.95],[0.72,1.26,0.08],0.28);
    for(const x of [-1.28,1.28]) {
        node(castle,'CastleTurret',cylinder,[0.96,0.88,0.74],[x,1.4,0],[0.57,2.8,0.57]);
        node(castle,'RoseRoof',Primitives.createConeFrustum(gl,0.76,0.035,1.25,32,1,true),[0.88,0.26,0.37],[x,3.25,0]);
        node(castle,'RoofTrim',cylinder,[1,0.74,0.34],[x,2.63,0],[0.78,0.09,0.78]);
        rounded(castle,'TurretWindow',[0.23,0.49,0.61],[x,1.94,0.55],[0.18,0.42,0.045],0.07);
        ball(castle,'GoldenSpire',[1,0.79,0.21],[x,3.92,0],[0.075,0.095,0.075]);
    }
    for(let i=0;i<6;i++)rounded(castle,'Battlement',[0.98,0.91,0.77],[-1.0+i*0.4,2.12,0.72],[0.22,0.28,0.30],0.025);
    flag(11,1.8,-16.2);
    const mill=node(root,'GardenWindmill',null,white,[-11,meadowTop,18]);
    node(mill,'MillTower',Primitives.createConeFrustum(gl,0.74,0.44,2.6,24,1,true),[0.94,0.84,0.61],[0,1.3,0]);
    node(mill,'MillRoof',Primitives.createConeFrustum(gl,0.67,0,0.82,24,1,true),[0.20,0.55,0.58],[0,3.0,0]);
    const rotor=node(mill,'WindmillRotor',null,white,[0,2.12,0.59]);windmills.push(rotor);
    for(let i=0;i<4;i++) {
        const blade=node(rotor,'SailPivot',null,white,[0,0,0],[1,1,1],[0,0,i*Math.PI/2]);
        rounded(blade,'WoodSailFrame',[0.48,0.30,0.16],[0,0.63,0],[0.10,1.26,0.07],0.025);
        rounded(blade,'CreamSail',[0.99,0.91,0.68],[0.17,0.79,0.015],[0.34,0.77,0.035],0.015);
    }
    ball(rotor,'RotorHub',[1,0.72,0.21],[0,0,0.07],[0.15,0.15,0.09]);

    // A continuous dirt path ties the landmarks into a single little world.
    const pathData={positions:[],normals:[],indices:[]};
    for(let i=0;i<=128;i++) {
        const a=i*Math.PI*2/128;
        for(const side of [-1,1]) {
            pathData.positions.push(Math.cos(a)*(9.1+side*0.36),meadowTop+0.014,Math.sin(a)*(7.6+side*0.36));
            pathData.normals.push(0,1,0);
        }
        if(i<128){const k=i*2;pathData.indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
    node(root,'GardenTrail',Primitives.createMeshBuffer(gl,pathData),[0.83,0.69,0.40],[0,0,0]).materialKind=4;
    // Water emerges from the upper pool and cascades into a basin beside the river.
    ball(root,'SpringPool',[0.12,0.72,0.88],[-9,1.515,-11.0],[0.61,0.025,1.22]).materialKind=2;
    const waterfall=cube(root,'Waterfall',[0.28,0.78,0.93],[-9,(1.48+meadowTop)/2,-9.465],[0.72,1.48-meadowTop,0.055]);waterfall.materialKind=5;
    ball(root,'WaterfallBasin',[0.16,0.68,0.84],[-9,meadowTop+0.045,-9.0],[1.15,0.04,0.82]).materialKind=2;
    for(let i=0;i<7;i++)ball(root,'CascadeFoam',white,[-9.42+i*0.14,meadowTop+0.09,-9.37+(i%2)*0.10],[0.14,0.055,0.11]);
    for(let i=0;i<10;i++) {
        const drop=ball(root,'WaterSpray',[0.74,0.95,1],[-9+(i%3-1)*0.23,meadowTop+0.2,-9.27],[0.025,0.05,0.025]);
        sparkles.push(drop);
    }
    // Low meadow details use shared meshes and stay clear of every platform footprint.
    let seed=7421;
    function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
    for(let i=0;i<75;i++) {
        const x=(random()-0.5)*42,z=(random()-0.5)*46;
        if(platformFootprints.some(p=>Math.abs(x-p.x)<p.w/2+0.6&&Math.abs(z-p.z)<p.d/2+0.6))continue;
        if(Math.abs(x-riverX(z))<1.3)continue;
        const tuft={positions:[],normals:[],indices:[]};
        for(let j=0;j<3;j++) {
            const angle=j*Math.PI/3,dx=Math.cos(angle)*0.065,dz=Math.sin(angle)*0.065,h=0.14+random()*0.12;
            const k=tuft.positions.length/3;
            tuft.positions.push(x-dx,meadowTop+0.01,z-dz,x+dx,meadowTop+0.01,z+dz,x+dx*0.8,meadowTop+h,z+dz*0.8);
            for(let t=0;t<3;t++)tuft.normals.push(0,1,0);
            tuft.indices.push(k,k+1,k+2);
        }
        node(root,'MeadowTuft',Primitives.createMeshBuffer(gl,tuft),[0.24,0.54,0.11],[0,0,0]).materialKind=6;
        if(i%5===0)flower(x,z,i%2?[1,0.84,0.23]:[0.83,0.57,1],meadowTop);
    }
    // A distant, low silhouette prevents the meadow ending at a hard straight horizon.
    for(let i=0;i<18;i++) {
        const a=i*Math.PI*2/18;
        ball(root,'DistantRollingMeadow',[0.39,0.69,0.44],[Math.cos(a)*48,-3.8,Math.sin(a)*48],[11,3.5+(i%3),8]).materialKind=7;
    }

    // Ground-level shrubs belong beside the islands, never below their soil volumes.
    // Check the whole three-lobe footprint, including the hanging grass border.
    for(const [x,z] of [[-6.9,0],[6.1,1.6],[-9.5,-8.2],[5,-11.5],[-4.1,-10.8]]) {
        const intersectsIsland=platformFootprints.some(p=>
            x-0.5 < p.x+p.w/2+0.15 && x+1.2 > p.x-p.w/2-0.15 &&
            z-0.45 < p.z+p.d/2+0.15 && z+0.45 > p.z-p.d/2-0.15);
        if(intersectsIsland)continue;
        const shrub=node(root,'GroundBush',null,green,[x,meadowTop,z]);
        for(let i=0;i<3;i++) {
            const height=0.48+i*0.09;
            ball(shrub,'Bush',[0.16+i*0.045,0.57+i*0.055,0.14],
                [i*0.35,height-0.035,0],[0.5,height,0.45]);
        }
    }

    root.animate=function(t) {
        clouds.forEach((c,i)=>{c.animPos=[Math.sin(t*0.12+i)*0.65,Math.sin(t*0.3+i)*0.045,0];});
        blocks.forEach((b,i)=>{b.animPos=[0,Math.sin(t*1.6+i)*0.055,0];});
        coins.forEach((c,i)=>{c.animRot=[0,t*2+i,0];});
        butterflies.forEach((b,i)=>{
            b.node.animPos=[Math.sin(t*0.7+i)*0.35,Math.sin(t*1.6+i)*0.12,Math.cos(t*0.7+i)*0.25];
            b.node.animRot=[0,-t*0.7-i,0];
            b.wings.forEach((w,j)=>{w.animRot=[0,(j?1:-1)*Math.sin(t*12+i)*0.75,0];});
        });
        windmills.forEach(w=>{w.animRot=[0,0,-t*0.38];});
        sparkles.forEach((s,i)=>{
            const phase=(t*0.7+i/10)%1;
            s.animPos=[Math.sin(i*2.4)*phase*0.20,Math.sin(phase*Math.PI)*0.25,-phase*0.18];
            s.animScale=[1-phase*0.7,1-phase*0.7,1-phase*0.7];
        });
        flags.forEach((f,i)=>{f.animRot=[Math.sin(t*2+i)*0.07,Math.sin(t*2.4+i)*0.16,0];});
        plants.forEach((p,i)=>{p.animRot=[0,0,Math.sin(t*1.3+i)*0.08];});
    };
    // Bake only static geometry by material. Animated subtrees remain hierarchical.
    // Splitting at 60k vertices keeps every batch safe for WebGL 1.0 Uint16 indices.
    const dynamicNodes = new Set([...clouds,...blocks,...coins,...plants,...flags,...windmills,...sparkles,...butterflies.map(b=>b.node)]);
    function batchScenery(group) {
        const batches = new Map();
        let sourceDraws=0, sourceTriangles=0;
        function bake(n,parentMatrix) {
            if(n!==group && dynamicNodes.has(n))return;
            let m=parentMatrix;
            if(n!==group) {
                m=Mat4.translate(m,...n.position);
                m=Mat4.rotateX(m,n.rotation[0]);m=Mat4.rotateY(m,n.rotation[1]);m=Mat4.rotateZ(m,n.rotation[2]);
                m=Mat4.scale(m,...n.scale);
            }
            if(n.mesh) {
                let g=Mat4.translate(m,...n.geomOffset);
                g=Mat4.rotateX(g,n.geomRot[0]);g=Mat4.rotateY(g,n.geomRot[1]);g=Mat4.rotateZ(g,n.geomRot[2]);
                g=Mat4.scale(g,...n.geomScale);
                const normalMatrix=Mat4.normalFromMat4(g);
                const key=JSON.stringify([n.color,n.shininess,!!n.checker,n.materialKind||0]);
                if(!batches.has(key))batches.set(key,[]);
                const chunks=batches.get(key),mesh=n.mesh;
                let chunk=chunks[chunks.length-1];
                if(!chunk || (chunk.positions.length+mesh.cpuPositions.length)/3>60000) {
                    chunk={positions:[],normals:[],indices:[]};chunks.push(chunk);
                }
                const offset=chunk.positions.length/3;
                for(let i=0;i<mesh.cpuPositions.length;i+=3) {
                    const x=mesh.cpuPositions[i],y=mesh.cpuPositions[i+1],z=mesh.cpuPositions[i+2];
                    chunk.positions.push(g[0]*x+g[4]*y+g[8]*z+g[12],g[1]*x+g[5]*y+g[9]*z+g[13],g[2]*x+g[6]*y+g[10]*z+g[14]);
                    const nx=mesh.cpuNormals[i],ny=mesh.cpuNormals[i+1],nz=mesh.cpuNormals[i+2];
                    const tx=normalMatrix[0]*nx+normalMatrix[3]*ny+normalMatrix[6]*nz;
                    const ty=normalMatrix[1]*nx+normalMatrix[4]*ny+normalMatrix[7]*nz;
                    const tz=normalMatrix[2]*nx+normalMatrix[5]*ny+normalMatrix[8]*nz;
                    const length=Math.hypot(tx,ty,tz)||1;
                    chunk.normals.push(tx/length,ty/length,tz/length);
                }
                for(const index of mesh.cpuIndices)chunk.indices.push(index+offset);
                sourceDraws++;sourceTriangles+=mesh.count/3;
                n.mesh=null;
            }
            n.children.forEach(c=>bake(c,m));
        }
        bake(group,Mat4.identity());
        let batchDraws=0,batchTriangles=0;
        for(const [key,chunks] of batches) {
            const [color,shininess,checker,materialKind]=JSON.parse(key);
            for(const data of chunks) {
                const b=group.add(new SceneNode('StaticSceneryBatch',Primitives.createMeshBuffer(gl,data),color,shininess));
                b.checker=checker;b.materialKind=materialKind;
                // These baked meshes are never sampled for foot placement.
                delete b.mesh.cpuPositions;delete b.mesh.cpuNormals;delete b.mesh.cpuIndices;
                batchDraws++;batchTriangles+=data.indices.length/3;
            }
        }
        return {sourceDraws,batchDraws,sourceTriangles,batchTriangles};
    }
    const stats=[batchScenery(root)];
    // Child details are static relative to these animated pivots, so they can be batched too.
    for(const group of [...clouds,...blocks,...plants,...windmills])stats.push(batchScenery(group));
    root.staticBatchStats=stats.reduce((sum,s)=>{
        for(const key of Object.keys(sum))sum[key]+=s[key];
        return sum;
    },{sourceDraws:0,batchDraws:0,sourceTriangles:0,batchTriangles:0});
    return root;
}
