// Pure WebGL 1.0 Main Application, Shader Pipeline, Camera Controls, and UI State
let gl, shaderProgram;
let yoshiNode, toadNode, bowserJrNode;

let viewMode = "all";    // 'all', 'yoshi', 'toad', 'bowserjr'
let animMode = "idle";    // 'walk', 'idle'

// Camera Orbit State
let camYaw = 0.0;
let camPitch = 0.20;
let camDist = 7.8;
let camTarget = [0, 1.35, 0];
let isDragging = false;
let isRightDrag = false;
let lastMouseX = 0, lastMouseY = 0;

const VS_SOURCE = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;
    uniform mat3 uNormalMatrix;

    varying vec3 vNormal;
    varying vec3 vWorldPos;

    void main() {
        vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize(uNormalMatrix * aNormal);
        gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
    }
`;

const FS_SOURCE = `
    precision mediump float;

    varying vec3 vNormal;
    varying vec3 vWorldPos;

    uniform vec3 uColor;
    uniform float uShininess;
    uniform vec3 uCameraPos;

    void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(uCameraPos - vWorldPos);

        // Key Light (Warm sunlight from top-front-right)
        vec3 L1 = normalize(vec3(5.0, 9.0, 7.0));
        float diff1 = max(dot(N, L1), 0.0);
        vec3 H1 = normalize(L1 + V);
        float spec1 = pow(max(dot(N, H1), 0.0), uShininess) * 0.40;

        // Fill Light (Soft cool light from front-left)
        vec3 L2 = normalize(vec3(-6.0, 4.0, 5.0));
        float diff2 = max(dot(N, L2), 0.0) * 0.35;

        // Rim / Back Light (To make 3D silhouettes pop)
        float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.20;

        // Hemisphere Ambient Light
        float hemi = 0.5 + 0.5 * N.y;
        vec3 ambient = mix(vec3(0.26, 0.28, 0.36), vec3(0.46, 0.49, 0.55), hemi);

        vec3 finalColor = uColor * (ambient + diff1 * 0.70 + diff2) + vec3(spec1 + rim);
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const CHAR_DESCRIPTIONS = {
    env: `
        <b>🌟 Mode Dunia Mario (Full Environment + Aksi Interaktif):</b>
        <ul>
            <li><b>Aksi Yoshi (Kiri):</b> Menjulurkan lidah panjang (<i>3D Bezier Curve</i>) untuk menangkap buah <i>Super Berry</i> merah & melompat bersama Telur Yoshi di dekat Pipa Hijau & Piranha Plant.</li>
            <li><b>Aksi Toad (Tengah):</b> Melompat menyundul <b>? Block</b> hingga blok memantul dan mengeluarkan <b>Koin Emas Berputar</b> sambil melambaikan tangan.</li>
            <li><b>Aksi Bowser Jr. (Kanan):</b> Meninju dan menyemburkan <b>Bola Api (Fireball)</b> dari mulutnya di depan Menara Benteng Koopa.</li>
            <li><b>Environment 3D:</b> Pulau rumput Mushroom Kingdom, 2 Pipa Warp + Piranha Plant, ? Block (dengan kurva Bezier '?') & Brick Blocks, Bukit Mario (Paraboloid), Menara Benteng, & Awan melayang.</li>
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
        console.error(gl.getShaderInfoLog(s));
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
        uCameraPos: gl.getUniformLocation(prog, "uCameraPos")
    };

    gl.enableVertexAttribArray(shaderProgram.aPosition);
    gl.enableVertexAttribArray(shaderProgram.aNormal);
    gl.enable(gl.DEPTH_TEST);

    // Bangun ketiga karakter; environment sementara tidak dirender.
    yoshiNode    = createYoshi(gl);
    toadNode     = createToad(gl);
    bowserJrNode = createBowserJr(gl);

    setupMouseControls(canvas);
    setViewMode("all");
    requestAnimationFrame(renderLoop);
}

function setViewMode(mode) {
    viewMode = mode;
    document.querySelectorAll("#btn-all, #btn-yoshi, #btn-toad, #btn-bowserjr").forEach(b => {
        const active = b.id === "btn-" + mode;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active);
    });

    if (mode === "all") {
        camDist = 6.2;
        camTarget = [0, 1.05, 0];
        camYaw = 0.0;
        camPitch = 0.18;
    } else {
        camDist = 3.6;
        camTarget = mode === "yoshi" ? [-2.1, 1.0, 0.15] : mode === "bowserjr" ? [2.1, 1.0, 0.15] : [0, 1.0, 0];
        camYaw = 0.22;
        camPitch = 0.12;
    }
}

function setAnimMode(mode) {
    animMode = mode;
    document.querySelectorAll("#anim-walk, #anim-idle").forEach(b => {
        const active = b.id === "anim-" + mode;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active);
    });
}

function setupMouseControls(canvas) {
    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        isRightDrag = (e.button === 2);
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
    window.addEventListener("mouseup", () => { isDragging = false; });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        if (!isRightDrag) {
            camYaw -= dx * 0.008;
            camPitch = Math.max(-0.5, Math.min(1.3, camPitch + dy * 0.008));
        } else {
            camTarget[0] -= dx * 0.005;
            camTarget[1] += dy * 0.005;
        }
    });

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        camDist = Math.max(2.0, Math.min(16.0, camDist + e.deltaY * 0.004));
    }, { passive: false });
}

let accumTime = 0;
let lastTimestamp = 0;

function renderLoop(timestamp) {
    const dt = (timestamp - lastTimestamp) * 0.001 || 0;
    lastTimestamp = timestamp;

    accumTime += dt;

    const canvas = gl.canvas;
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    gl.clearColor(0.35, 0.68, 0.98, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = canvas.width / (canvas.height || 1);
    const projMatrix = Mat4.perspective(Math.PI / 4, aspect, 0.1, 100.0);

    const eyeX = camTarget[0] + camDist * Math.cos(camPitch) * Math.sin(camYaw);
    const eyeY = camTarget[1] + camDist * Math.sin(camPitch);
    const eyeZ = camTarget[2] + camDist * Math.cos(camPitch) * Math.cos(camYaw);
    const eye = [eyeX, eyeY, eyeZ];

    const viewMatrix = Mat4.lookAt(eye, camTarget, [0, 1, 0]);

    gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, projMatrix);
    gl.uniformMatrix4fv(shaderProgram.uViewMatrix, false, viewMatrix);
    gl.uniform3fv(shaderProgram.uCameraPos, eye);

    const identity = Mat4.identity();

    // Update animasi hierarkis masing-masing karakter
    yoshiNode.animate(accumTime, animMode);
    toadNode.animate(accumTime, animMode);
    bowserJrNode.animate(accumTime, animMode);

    yoshiNode.setTransform([-2.1, 0, 0.15], [0, 0.15, 0]);
    toadNode.setTransform([0.0, 0, 0.0], [0, 0, 0]);
    bowserJrNode.setTransform([2.1, 0, 0.15], [0, -0.20, 0]);

    if (viewMode === "all" || viewMode === "yoshi") yoshiNode.draw(gl, shaderProgram, identity, false);
    if (viewMode === "all" || viewMode === "toad") toadNode.draw(gl, shaderProgram, identity, false);
    if (viewMode === "all" || viewMode === "bowserjr") bowserJrNode.draw(gl, shaderProgram, identity, false);

    requestAnimationFrame(renderLoop);
}

window.addEventListener("DOMContentLoaded", initWebGL);
