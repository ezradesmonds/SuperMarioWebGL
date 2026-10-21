// Pure WebGL 1.0 Main Application, Shader Pipeline, Camera Controls, and UI State
let gl, shaderProgram;
let yoshiNode, toadNode, bowserJrNode;
let environmentNode, sunShadow;
let lightingMode = "day";

let viewMode = "all";    // 'all', 'yoshi', 'toad', 'bowserjr'
let animMode = "idle";    // 'walk', 'idle'

// Camera Orbit State
let camYaw = 0.0;
let camPitch = 0.20;
let camDist = 7.8;
let camTarget = [0, 1.35, 0];

const VS_SOURCE = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;
    uniform mat3 uNormalMatrix;
    uniform mat4 uLightMatrix;
    uniform mediump float uTime;
    uniform mediump float uMaterialKind;

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec4 vShadowCoord;

    void main() {
        vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
        if(uMaterialKind>5.5 && uMaterialKind<6.5) {
            float bend=clamp(worldPos.y+2.375,0.0,0.4);
            worldPos.x+=sin(uTime*1.6+worldPos.x*1.7+worldPos.z)*bend*0.15;
            worldPos.z+=cos(uTime*1.1+worldPos.z)*bend*0.08;
        }
        vWorldPos = worldPos.xyz;
        vShadowCoord = uLightMatrix * (worldPos + vec4(normalize(uNormalMatrix * aNormal)*0.055,0.0));
        vNormal = normalize(uNormalMatrix * aNormal);
        gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
    }
`;

const FS_SOURCE = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec4 vShadowCoord;

    uniform vec3 uColor;
    uniform float uShininess;
    uniform vec3 uCameraPos;
    uniform float uChecker;
    uniform mediump float uMaterialKind;
    uniform mediump float uTime;
    uniform vec4 uContactShadows[12];
    uniform vec3 uShadowLift;
    uniform sampler2D uShadowMap;
    uniform float uShadowTexel;
    uniform float uShadowEnabled;
    uniform float uGolden;

    float sunVisibility(vec3 normal,vec3 light) {
        if(uShadowEnabled<0.5)return 1.0;
        vec3 coord=vShadowCoord.xyz/vShadowCoord.w*0.5+0.5;
        if(coord.x<0.002||coord.x>0.998||coord.y<0.002||coord.y>0.998||coord.z>1.0||coord.z<0.0)return 1.0;
        float bias=max(0.0012,0.0020*(1.0-max(dot(normal,light),0.0)));
        float visible=0.0;
        for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++) {
            vec2 encoded=texture2D(uShadowMap,coord.xy+vec2(float(x),float(y))*uShadowTexel*1.8).rg;
            float depth=dot(encoded,vec2(1.0,1.0/255.0));
            visible+=step(coord.z-bias,depth);
        }
        return visible/9.0;
    }

    void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(uCameraPos - vWorldPos);

        // Warm sunlight, a blue sky fill, and a broad rear light for a full orbit.
        vec3 L1 = normalize(vec3(5.0, 9.0, 7.0));
        float diff1 = max(dot(N, L1), 0.0);
        vec3 H1 = normalize(L1 + V);
        float spec1 = pow(max(dot(N, H1), 0.0), max(8.0,uShininess)) * 0.24;
        vec3 L2 = normalize(vec3(-6.0, 4.0, 2.0));
        float diff2 = max(dot(N, L2), 0.0);
        float back = max(dot(N, normalize(vec3(-3.0,5.0,-7.0))),0.0);
        float hemi = 0.5 + 0.5 * N.y;
        vec3 ambient = mix(vec3(0.32,0.29,0.23),vec3(0.49,0.57,0.65),hemi);
        ambient=mix(ambient,ambient*vec3(1.0,0.83,0.75),uGolden*0.45);
        // Distant hills use an even storybook fill, avoiding shadow-map aliasing at the horizon.
        float visibility=uMaterialKind>6.5?1.0:sunVisibility(N,L1);
        float rim = pow(1.0-max(dot(N,V),0.0),3.0)*back*0.13;

        vec3 material = uColor;
        if (uChecker > 0.5) {
            vec3 axis = abs(N);
            vec2 uv = axis.z > 0.5 ? vWorldPos.xy : (axis.x > 0.5 ? vWorldPos.zy : vWorldPos.xz);
            float tile = mod(floor((uv.x + 0.013) / 0.52) + floor((uv.y + 0.013) / 0.52), 2.0);
            material = mix(vec3(0.43, 0.25, 0.12), vec3(0.76, 0.54, 0.29), tile);
        }
        if (uMaterialKind > 0.5 && uMaterialKind < 1.5) {
            // Subtle broad grass variation avoids a perfectly flat solid fill.
            float variation=sin(vWorldPos.x*2.1+sin(vWorldPos.z*1.3))*sin(vWorldPos.z*2.7);
            material *= 1.0 + variation*0.035;
        }
        vec3 sunColor=mix(vec3(1.0,0.94,0.80),vec3(1.0,0.69,0.40),uGolden);
        vec3 lighting = ambient + sunColor*diff1*0.65*visibility
            + vec3(0.66,0.80,1.0)*diff2*0.23 + vec3(0.81,0.90,1.0)*back*0.23;
        vec3 finalColor = material * lighting + sunColor*spec1*visibility + vec3(0.74,0.86,1.0)*rim;
        if (uMaterialKind > 0.5 && uMaterialKind < 1.5) {
            // Soft geometric contact footprints, limited to each receiving surface height.
            float occlusion=0.0;
            for(int i=0;i<3;i++) {
                vec4 s=uContactShadows[i];
                vec2 delta=(vWorldPos.xz-s.xy)/max(s.w,0.01);
                delta.y *= 1.35;
                float lift = i==0 ? uShadowLift.x : (i==1 ? uShadowLift.y : (i==2 ? uShadowLift.z : 0.0));
                delta /= 1.0 + lift*0.45;
                float mask=(1.0-smoothstep(0.1,1.3,dot(delta,delta)))/(1.0+lift*2.5);
                float receiver=1.0-smoothstep(0.025,0.12,abs(vWorldPos.y-s.z));
                occlusion=max(occlusion,mask*receiver*0.18);
            }
            finalColor *= 1.0-occlusion*max(N.y,0.0);
        }
        // Warm light spills softly from the two lanterns on the main garden.
        for(int i=0;i<2;i++) {
            vec3 lamp=vec3(i==0?-4.9:4.9,0.93,0.2);
            vec3 delta=lamp-vWorldPos;
            float falloff=1.0/(1.0+dot(delta,delta)*3.2);
            finalColor += material*vec3(1.0,0.53,0.15)*max(dot(N,normalize(delta)),0.0)*falloff*0.30;
        }
        if(uMaterialKind > 1.5 && uMaterialKind < 2.5) {
            float ripple=sin(vWorldPos.z*9.0+uTime*2.0+sin(vWorldPos.x*7.0))*0.5+0.5;
            float glint=pow(max(dot(N,H1),0.0),50.0);
            finalColor=mix(finalColor,vec3(0.42,0.89,0.97),ripple*0.18)+vec3(0.7,0.92,1.0)*glint*0.32;
        }
        if(uMaterialKind > 2.5 && uMaterialKind < 3.5) {
            finalColor=material*vec3(1.12,1.04,0.86)*(1.0+sin(uTime*2.0)*0.035);
        }
        if(uMaterialKind > 3.5 && uMaterialKind < 4.5) {
            float grain=sin(vWorldPos.x*43.0)*sin(vWorldPos.z*37.0);
            finalColor *= 1.0+grain*0.025;
        }
        if(uMaterialKind > 4.5 && uMaterialKind < 5.5) {
            float flow=sin(vWorldPos.x*38.0+sin(vWorldPos.y*4.0+uTime*4.5))*0.5+0.5;
            float foam=pow(flow,12.0);
            finalColor=mix(vec3(0.20,0.65,0.81),vec3(0.80,0.97,1.0),foam*0.78+0.16);
        }
        // Gentle highlight compression retains bright surfaces and saturated colors.
        finalColor=finalColor/(vec3(1.0)+finalColor*0.10);
        float fog = smoothstep(18.0, 55.0, distance(uCameraPos, vWorldPos)) * 0.62;
        finalColor = mix(finalColor, mix(vec3(0.64,0.85,0.93),vec3(0.96,0.77,0.59),uGolden), fog);
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const CHAR_DESCRIPTIONS = {
    env: `
        <b>Dunia Mario ? Mushroom Kingdom</b>
        <ul>
            <li>Yoshi, Toad, dan Bowser Jr. berdampingan di platform rumput utama.</li>
            <li>Platform bertingkat dengan tanah checkerboard, pipa hijau, blok tanda tanya, dan bata.</li>
            <li>Bukit, awan bermata, jamur, bunga, semak, dan koin berputar.</li>
            <li>Pilih Idle, Berjalan, atau Aksi untuk animasi asli karakter.</li>
        </ul>
    `,
    all: `
        <b>Studio Mode - Kelompok Super Mario (3 Karakter):</b>
        <ul>
            <li><b>1. Yoshi:</b> Pipi putih lebar, mulut merah terbuka & lidah Bezier, moncong bulat besar, bintik telur <i>flush surface patch</i>, ekor & jambul Cone, pelana Torus & Bezier.</li>
            <li><b>2. Toad:</b> Mushroom cap duduk pas di atas dahi (wajah & mata terlihat 100% utuh), 5 bintik merah <i>flush surface patch</i>, rompi biru V-neck terbuka (Open Frustum) dengan lis emas Bezier.</li>
            <li><b>3. Bowser Jr.:</b> Pipi tembem krem & moncong bulat dengan taring Cone, bib/bandana segitiga rapi di leher (plastron perut terlihat utuh), alis & rambut merah Bezier, shell berduri Cone.</li>
        </ul>
    `,
    yoshi: `
        <b>1. YOSHI (High-Fidelity Model)</b>
        <ul>
            <li><b>Ellipsoid:</b> Kepala, pipi putih lebar, moncong bulat besar, badan oval, mata menonjol, sepatu boots, telur polkadot (<i>Flush Surface Patch</i>).</li>
            <li><b>Cylinder:</b> Leher, lengan atas & bawah, kaki.</li>
            <li><b>Quadric Non-Ellipsoid/Cylinder:</b> <b>Cone</b> pada ekor meruncing & 3 jambul duri merah belakang kepala; <b>Torus</b> pada cincin saddle & sepatu.</li>
            <li><b>Curve (3D Cubic Bezier):</b> Lidah panjang yang bisa menjulur, bibir senyum, arch saddle merah, dan garis kontur perut putih.</li>
        </ul>
    `,
    toad: `
        <b>2. TOAD (High-Fidelity Model)</b>
        <ul>
            <li><b>Ellipsoid:</b> Kepala bulat cerah, Mushroom Cap besar + 5 bintik merah bulat rata (<i>Flush Ellipsoid Patch</i>), celana putih, tangan & jari, sepatu coklat.</li>
            <li><b>Cylinder:</b> Lengan dan kaki.</li>
            <li><b>Quadric Non-Ellipsoid/Cylinder:</b> <b>Cone / Frustum</b> pada torso/badan dan rompi biru terbuka depan, serta <b>Torus</b> pada lipatan bawah mushroom cap.</li>
            <li><b>Curve (3D Cubic Bezier):</b> Lis emas tepi rompi biru (kiri, kanan, bawah), kurva senyum mulut, dan alur detail mushroom cap.</li>
        </ul>
    `,
    bowserjr: `
        <b>3. BOWSER JR. (High-Fidelity Model)</b>
        <ul>
            <li><b>Ellipsoid:</b> Kepala hijau, pipi krem tembem & moncong, badan kuning, plastron perut, kepalan tangan, telapak kaki, inti bola api.</li>
            <li><b>Cylinder:</b> Lengan, paha/kaki, dan ikat rambut hitam.</li>
            <li><b>Quadric Non-Ellipsoid/Cylinder:</b> <b>Cone</b> pada 2 tanduk kepala, 4 duri cangkang, gigi taring, 6 kuku kaki, stud gelang, ekor, & ujung bandana; <b>Torus</b> pada rim shell & gelang besi.</li>
            <li><b>Curve (3D Cubic Bezier):</b> Alis merah menyala, 3 helai rambut merah ponytail, lukisan mulut monster pada bib/bandana, garis segmen perut, dan senyum menyeringai.</li>
        </ul>
    `
};

function compileShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
}

function initWebGL() {
    const canvas = document.getElementById("glcanvas");
    gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) {
        alert("Browser Anda tidak mendukung WebGL!");
        return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    shaderProgram = {
        program: prog,
        aPosition: gl.getAttribLocation(prog, "aPosition"),
        aNormal: gl.getAttribLocation(prog, "aNormal"),
        uProjectionMatrix: gl.getUniformLocation(prog, "uProjectionMatrix"),
        uViewMatrix: gl.getUniformLocation(prog, "uViewMatrix"),
        uModelMatrix: gl.getUniformLocation(prog, "uModelMatrix"),
        uNormalMatrix: gl.getUniformLocation(prog, "uNormalMatrix"),
        uColor: gl.getUniformLocation(prog, "uColor"),
        uShininess: gl.getUniformLocation(prog, "uShininess"),
        uCameraPos: gl.getUniformLocation(prog, "uCameraPos"),
        uChecker: gl.getUniformLocation(prog, "uChecker"),
        uMaterialKind: gl.getUniformLocation(prog, "uMaterialKind"),
        uTime: gl.getUniformLocation(prog, "uTime"),
        uContactShadows: gl.getUniformLocation(prog, "uContactShadows[0]"),
        uShadowLift: gl.getUniformLocation(prog, "uShadowLift"),
        uLightMatrix: gl.getUniformLocation(prog,"uLightMatrix"),
        uShadowMap: gl.getUniformLocation(prog,"uShadowMap"),
        uShadowTexel: gl.getUniformLocation(prog,"uShadowTexel"),
        uShadowEnabled: gl.getUniformLocation(prog,"uShadowEnabled"),
        uGolden: gl.getUniformLocation(prog,"uGolden")
    };

    gl.enableVertexAttribArray(shaderProgram.aPosition);
    gl.enableVertexAttribArray(shaderProgram.aNormal);
    gl.enable(gl.DEPTH_TEST);

    // Original character models are preserved; environment owns the shared ground height.
    yoshiNode    = createYoshi(gl);
    toadNode     = createToad(gl);
    bowserJrNode = createBowserJr(gl);
    environmentNode = createMarioEnvironment(gl);

    sunShadow=createSunShadowPipeline(gl);
    setupMouseControls(canvas);
    setViewMode("env");
    requestAnimationFrame(renderLoop);
}


function setViewMode(mode) {
    viewMode = mode;

    // Update tombol aktif
    document.querySelectorAll(
        "#btn-env, #btn-all, #btn-yoshi, #btn-toad, #btn-bowserjr"
    ).forEach(b => {
        const active = b.id === "btn-" + mode;

        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active);
    });

    // MODE ENVIRONMENT
    if (mode === "env") {
        camDist = 17.5;
        camTarget = [0, 1.5, -2.0];
        camYaw = 0.13;
        camPitch = 0.29;
    }

    // MODE SEMUA KARAKTER
    else if (mode === "all") {
        camDist = 11.5;
        camTarget = [0, 1.05, 0];
        camYaw = 0.0;
        camPitch = 0.18;
    }

    // MODE INDIVIDUAL
    else {
        camDist = 5.0;

        if (mode === "yoshi") {
            camTarget = [-2.8, 1.1, 0.15];
        }
        else if (mode === "toad") {
            camTarget = [0, 1.0, 0];
        }
        else if (mode === "bowserjr") {
            camTarget = [2.8, 1.1, 0.15];
        }

        camYaw = 0.22;
        camPitch = 0.12;
    }
}

function setAnimMode(mode) {
    animMode = mode;
    document.querySelectorAll("#anim-idle, #anim-walk, #anim-action").forEach(b => {
        const active = b.id === "anim-" + mode;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active);
    });
}

function setupMouseControls(canvas) {
    const pointers=new Map();
    let gesture=null;
    function pan(dx,dy) {
        const speed=camDist*0.00065;
        const right=[Math.cos(camYaw),0,-Math.sin(camYaw)];
        const up=[-Math.sin(camYaw)*Math.sin(camPitch),Math.cos(camPitch),-Math.cos(camYaw)*Math.sin(camPitch)];
        camTarget=camTarget.map((v,i)=>v-dx*speed*right[i]+dy*speed*up[i]);
    }
    canvas.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0&&e.button!==2)return;
        pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,button:e.button});
        canvas.setPointerCapture(e.pointerId);gesture=null;
    });
    canvas.addEventListener('pointermove',e=>{
        const previous=pointers.get(e.pointerId);if(!previous)return;
        const dx=e.clientX-previous.x,dy=e.clientY-previous.y;
        pointers.set(e.pointerId,{...previous,x:e.clientX,y:e.clientY});
        if(pointers.size===2) {
            const [a,b]=[...pointers.values()];
            const next={x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.hypot(a.x-b.x,a.y-b.y)};
            if(gesture){pan(next.x-gesture.x,next.y-gesture.y);camDist=Math.max(2,Math.min(40,camDist*gesture.distance/Math.max(1,next.distance)));}
            gesture=next;
        } else if(previous.button===2)pan(dx,dy);
        else {camYaw-=dx*0.008;camPitch=Math.max(-0.35,Math.min(1.3,camPitch+dy*0.008));}
    });
    function release(e){pointers.delete(e.pointerId);gesture=null;}
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
    canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    canvas.addEventListener('dblclick',()=>setViewMode(viewMode));
    canvas.addEventListener('wheel',e=>{e.preventDefault();camDist=Math.max(2,Math.min(40,camDist+e.deltaY*0.004));},{passive:false});
    canvas.addEventListener('keydown',e=>{
        if(e.key==='ArrowLeft')camYaw-=0.08;
        else if(e.key==='ArrowRight')camYaw+=0.08;
        else if(e.key==='ArrowUp')camPitch=Math.min(1.3,camPitch+0.05);
        else if(e.key==='ArrowDown')camPitch=Math.max(-0.35,camPitch-0.05);
        else if(e.key.toLowerCase()==='r')setViewMode(viewMode);
        else return;
        e.preventDefault();
    });
}

let accumTime = 0;
let lastTimestamp = 0;

function renderLoop(timestamp) {
    const dt=lastTimestamp?Math.min(0.05,(timestamp-lastTimestamp)*0.001):0;
    lastTimestamp=timestamp;accumTime+=dt;
    const canvas=gl.canvas,ratio=Math.min(window.devicePixelRatio||1,1.5);
    const width=Math.round(canvas.clientWidth*ratio),height=Math.round(canvas.clientHeight*ratio);
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    yoshiNode.animate(accumTime,animMode);toadNode.animate(accumTime,animMode);bowserJrNode.animate(accumTime,animMode);
    yoshiNode.setTransform([-2.8,0,0.15],[0,0.15,0]);
    toadNode.setTransform([0,0,0]);bowserJrNode.setTransform([2.8,0,0.15],[0,-0.20,0]);
    // Ground idle feet and prevent animated soles penetrating the stage; preserve upward jumps.
    for (const character of [yoshiNode, toadNode, bowserJrNode]) {
        if (character.restFootY === undefined) {
            const animation = animMode;
            character.animate(0, 'idle');
            character.restFootY = characterFootY(character);
            character.animate(accumTime, animation);
        }
        const currentFootY = characterFootY(character);
        const bottom = animMode === 'idle' ? currentFootY : Math.min(currentFootY, character.restFootY);
        character.position[1] = (viewMode === 'env' ? environmentNode.surfaceY : 0) - bottom;
    }


    const roots=[];
    if(viewMode==='env'){environmentNode.animate(accumTime,animMode);roots.push(environmentNode);}
    for(const [mode,character] of [['yoshi',yoshiNode],['toad',toadNode],['bowserjr',bowserJrNode]])
        if(viewMode==='env'||viewMode==='all'||viewMode===mode)roots.push(character);
    gl.disableVertexAttribArray(shaderProgram.aNormal);
    sunShadow.render(roots);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.useProgram(shaderProgram.program);
    gl.enableVertexAttribArray(shaderProgram.aPosition);gl.enableVertexAttribArray(shaderProgram.aNormal);
    gl.clearColor(0.26,0.59,0.94,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    drawSkyGradient();
    const aspect=canvas.width/(canvas.height||1);
    const fov=Math.min(Math.PI/2,2*Math.atan(Math.tan(Math.PI/8)/Math.min(1,aspect/1.55)));
    const projection=Mat4.perspective(fov,aspect,0.1,180);
    const eye=[camTarget[0]+camDist*Math.cos(camPitch)*Math.sin(camYaw),camTarget[1]+camDist*Math.sin(camPitch),camTarget[2]+camDist*Math.cos(camPitch)*Math.cos(camYaw)];
    gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix,false,projection);
    gl.uniformMatrix4fv(shaderProgram.uViewMatrix,false,Mat4.lookAt(eye,camTarget,[0,1,0]));
    gl.uniformMatrix4fv(shaderProgram.uLightMatrix,false,sunShadow.matrix);
    gl.uniform3fv(shaderProgram.uCameraPos,eye);gl.uniform1f(shaderProgram.uTime,accumTime);
    gl.uniform1f(shaderProgram.uGolden,lightingMode==='golden'?1:0);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,sunShadow.texture);
    gl.uniform1i(shaderProgram.uShadowMap,0);gl.uniform1f(shaderProgram.uShadowTexel,1/sunShadow.size);
    gl.uniform1f(shaderProgram.uShadowEnabled,sunShadow.enabled?1:0);
    gl.uniform3fv(shaderProgram.uShadowLift,[yoshiNode,toadNode,bowserJrNode].map(c=>Math.max(0,characterFootY(c)+c.position[1])));
    const footprints=[[-2.8,0.25,0,0.57],[0,0.15,0,0.50],[2.8,0.25,0,0.58]];
    gl.uniform4fv(shaderProgram.uContactShadows,new Float32Array(footprints.flat()));
    const identity=Mat4.identity();for(const root of roots)root.draw(gl,shaderProgram,identity);
    requestAnimationFrame(renderLoop);
}

function setLightingMode(mode) {
    lightingMode=mode;
    document.querySelectorAll('[data-lighting]').forEach(button=>{
        const active=button.dataset.lighting===mode;
        button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);
    });
}

// Sample the actual sole vertices through the complete hierarchy, including geometry transforms.
function characterFootY(root) {
    let lowest = Infinity;
    function visit(n, parent) {
        let m = Mat4.translate(parent, n === root ? 0 : n.position[0] + n.animPos[0], n === root ? 0 : n.position[1] + n.animPos[1], n === root ? 0 : n.position[2] + n.animPos[2]);
        for (const [i, rotate] of [Mat4.rotateX,Mat4.rotateY,Mat4.rotateZ].entries()) m=rotate.call(Mat4,m,n.rotation[i]+n.animRot[i]);
        m=Mat4.scale(m,...n.scale.map((v,i)=>v*n.animScale[i]));
        if(n.mesh && /sole|footellipsoid|brownshoe|boot/i.test(n.name)) {
            let g=Mat4.translate(m,...n.geomOffset);
            g=Mat4.rotateX(g,n.geomRot[0]);g=Mat4.rotateY(g,n.geomRot[1]);g=Mat4.rotateZ(g,n.geomRot[2]);
            g=Mat4.scale(g,...n.geomScale);
            const p=n.mesh.cpuPositions;
            for(let i=0;i<p.length;i+=3)lowest=Math.min(lowest,g[1]*p[i]+g[5]*p[i+1]+g[9]*p[i+2]+g[13]);
        }
        n.children.forEach(c=>visit(c,m));
    }
    visit(root,Mat4.identity());
    if(!Number.isFinite(lowest)) throw new Error('No foot geometry found: '+root.name);
    return lowest;
}

let skyPipeline;
function drawSkyGradient() {
    if(!skyPipeline) {
        const p=gl.createProgram();
        gl.attachShader(p,compileShader(gl,gl.VERTEX_SHADER,'attribute vec2 aSky; varying float height; void main(){height=aSky.y*0.5+0.5;gl_Position=vec4(aSky,0.999,1.0);}'));
        gl.attachShader(p,compileShader(gl,gl.FRAGMENT_SHADER,'precision mediump float; varying float height; uniform float uGolden; void main(){vec3 low=mix(vec3(0.74,0.92,0.98),vec3(1.0,0.79,0.53),uGolden);vec3 high=mix(vec3(0.17,0.48,0.87),vec3(0.32,0.47,0.73),uGolden);gl_FragColor=vec4(mix(low,high,smoothstep(0.0,1.0,height)),1.0);}'));
        gl.linkProgram(p);
        if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
        const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        skyPipeline={program:p,buffer:b,attribute:gl.getAttribLocation(p,'aSky'),golden:gl.getUniformLocation(p,'uGolden')};
    }
    gl.useProgram(skyPipeline.program);gl.uniform1f(skyPipeline.golden,lightingMode==='golden'?1:0);gl.disable(gl.DEPTH_TEST);
    gl.disableVertexAttribArray(shaderProgram.aPosition);gl.disableVertexAttribArray(shaderProgram.aNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER,skyPipeline.buffer);gl.enableVertexAttribArray(skyPipeline.attribute);
    gl.vertexAttribPointer(skyPipeline.attribute,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,6);
    gl.disableVertexAttribArray(skyPipeline.attribute);gl.enable(gl.DEPTH_TEST);gl.useProgram(shaderProgram.program);
    gl.enableVertexAttribArray(shaderProgram.aPosition);gl.enableVertexAttribArray(shaderProgram.aNormal);
}

window.addEventListener("DOMContentLoaded", initWebGL);
