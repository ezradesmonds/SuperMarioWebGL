// Karakter 3: BOWSER JR. (Super Mario Series) - High-Fidelity Pure WebGL Model
// Pemenuhan Ketentuan:
// 1. Ellipsoid: Kepala besar hijau, pipi & moncong krem tembem, badan kuning bulat, plastron perut bergaris, kepalan tangan, telapak kaki
// 2. Cylinder: Batang kaki dan ikat rambut hitam; lengan memakai cone frustum
// 3. Quadric selain ellipsoid/cylinder: cone frustum pada tanduk, duri, taring, kuku, ekor, dan lengan.
//    Torus pada cincin dan gelang adalah geometri tambahan, bukan quadric.
// 4. Curve (3D Cubic Bezier Tube): Alis merah menyala, kuncir rambut merah melengkung, garis segmen perut, dan senyum menyeringai

function createBowserJr(gl) {
    const C_YELLOW      = [0.98, 0.76, 0.10];
    const C_CREAM       = [0.99, 0.87, 0.50];
    const C_BELLY_TAN   = [0.95, 0.82, 0.44];
    const C_RIB_LINE    = [0.76, 0.54, 0.16];
    const C_GREEN_HEAD  = [0.15, 0.66, 0.18];
    const C_SHELL_GREEN = [0.12, 0.60, 0.16];
    const C_RED_HAIR    = [0.92, 0.22, 0.08];
    const C_WHITE       = [0.97, 0.98, 0.99];
    const C_DARK_METAL  = [0.20, 0.22, 0.26];
    const C_BLACK       = [0.05, 0.05, 0.07];
    const C_HORN        = [0.96, 0.92, 0.70];
    const C_SHELL_SPIKE = [1.00, 0.91, 0.61];
    const C_SPIKE_BASE  = [0.68, 0.35, 0.12];
    const C_FIRE_CORE   = [1.00, 0.92, 0.25];
    const C_FIRE_OUTER  = [0.98, 0.32, 0.06];

    const root = new SceneNode("BowserJrRoot");

    // PARENT UTAMA: Badan Bulat Kuning (Ellipsoid)
    const bodyMesh = Primitives.createEllipsoid(gl, 0.58, 0.60, 0.50);
    const body = new SceneNode("BowserJrBody", bodyMesh, C_YELLOW, 32);
    body.setTransform([0, 0.88, 0], [0.12, 0, 0]);
    root.add(body);
    // Perut Plastron Krem Bergaris (Terlihat jelas di bagian depan perut seperti gambar referensi!)
    const plastronMesh = Primitives.createEllipsoid(gl, 0.45, 0.47, 0.34);
    const plastron = new SceneNode("PlastronBelly", plastronMesh, C_BELLY_TAN, 24);
    plastron.setTransform([0, -0.08, 0.27]);
    body.add(plastron);

    // Position each Bezier rib just above the actual belly, below the bib.
    // Matching the midpoint as well as the endpoints avoids burying the curve in the ellipsoid.
    function bellySurfaceZ(x, y) {
        return 0.27 + 0.34 * Math.sqrt(Math.max(0,
            1 - (x / 0.45) ** 2 - ((y + 0.08) / 0.47) ** 2));
    }
    for (const yOff of [-0.13, -0.27, -0.405]) {
        const width = 0.45 * Math.sqrt(1 - ((yOff + 0.08) / 0.47) ** 2) * 0.72;
        const endZ = bellySurfaceZ(width, yOff) + 0.010;
        const midZ = bellySurfaceZ(0, yOff - 0.01125) + 0.010;
        const controlZ = (4 * midZ - endZ) / 3;
        const ribCurve = Primitives.createBezierTube(gl,
            [-width, yOff, endZ], [-width / 3, yOff - 0.015, controlZ],
            [width / 3, yOff - 0.015, controlZ], [width, yOff, endZ],
            0.003, 0.003, 36, 12, 2.5);
        body.add(new SceneNode("BellyRibBezier", ribCurve, C_RIB_LINE, 15));
    }

    // A rounded bandana made from an ellipsoid patch replaces the angular polygon bib.
    // Share the belly's center and curvature so its edges sit on the chest.
    const bibGroup = new SceneNode("BibBandanaGroup");
    bibGroup.setTransform([0, -0.08, 0.27]);
    body.add(bibGroup);
    const bibMesh = Primitives.createEllipsoidPatch(gl,
        0.455, 0.475, 0.35, [0, 0.67, 0.74], 0.62, 24, 48, 0.006);
    const bib = new SceneNode("WhiteBandanaPatch", bibMesh, C_WHITE, 18);
    bibGroup.add(bib);
    const collar = new SceneNode("WhiteBandanaCollar", Primitives.createTorus(gl, 0.32, 0.045), C_WHITE, 18);
    collar.setTransform([0, 0.47, 0.045], [Math.PI / 2, 0, 0], [1, 0.92, 1]);
    body.add(collar);
    const knot = new SceneNode("BandanaKnotEllipsoid", Primitives.createEllipsoid(gl, 0.105, 0.09, 0.065), C_WHITE, 18);
    knot.setTransform([0, 0.405, 0.38]);
    body.add(knot);

    // CANGKANG BERDURI (KOOPA SHELL) DI PUNGGUNG (Dome + Torus Rim + Quadric Cones untuk Duri!)
    const shellGroup = new SceneNode("SpikedShellGroup");
    shellGroup.setTransform([0, 0.02, -0.48], [-Math.PI / 2, 0, 0]);
    body.add(shellGroup);

    const shellDomeMesh = Primitives.createDome(gl, 0.58, 0.46, 0.60, Math.PI * 0.60);
    const shellDome = new SceneNode("GreenShellDome", shellDomeMesh, C_SHELL_GREEN, 45);
    shellGroup.add(shellDome);

    // Seat the torus on the cut edge of the dome (torus itself is not a quadric).
    const shellRimMesh = Primitives.createTorus(gl, 0.54, 0.095);
    const shellRim = new SceneNode("ShellWhiteTorusRim", shellRimMesh, C_WHITE, 35);
    const shellCutAngle = Math.PI * 0.60;
    shellRim.setTransform([0, 0.46 * Math.cos(shellCutAngle), 0],
        [Math.PI / 2, 0, 0],
        [0.58 * Math.sin(shellCutAngle) / 0.54, 0.60 * Math.sin(shellCutAngle) / 0.54, 1]);
    shellGroup.add(shellRim);

    // Seven cream cone frustums and warm brown collars, matching the supplied back-view reference.
    const spikeConeMesh = Primitives.createConeFrustum(gl, 0.13, 0.008, 0.23, 24, 4, true);
    const spikeRingMesh = Primitives.createTorus(gl, 0.13, 0.027);
    // Local +Z becomes the upper part of the shell after the shell pivot rotation.
    // Layout: top, upper pair, center, lower pair, bottom.
    const spikeCoords = [
        [0, 0.42],
        [-0.38, 0.20], [0.38, 0.20],
        [0, 0],
        [-0.38, -0.22], [0.38, -0.22],
        [0, -0.43]
    ];
    for (const [x, z] of spikeCoords) {
        const y = 0.46 * Math.sqrt(1 - (x / 0.58) ** 2 - (z / 0.60) ** 2);
        const normal = Vec3.normalize([x / (0.58 ** 2), y / (0.46 ** 2), z / (0.60 ** 2)]);
        // Rotate local +Y to the ellipsoid normal. Both cone and base ring share this pivot.
        const tiltX = Math.atan2(normal[2], normal[1]);
        const tiltZ = -Math.asin(normal[0]);
        const spNode = new SceneNode("ShellSpikePivot");
        spNode.setTransform([x, y, z], [tiltX, 0, tiltZ]);
        shellGroup.add(spNode);

        const ring = new SceneNode("SpikeBaseRing", spikeRingMesh, C_SPIKE_BASE, 24);
        ring.setTransform([0, 0.012, 0], [Math.PI / 2, 0, 0]);
        spNode.add(ring);

        const cone = new SceneNode("ShellSpikeCone", spikeConeMesh, C_SHELL_SPIKE, 36);
        cone.setTransform([0, 0.125, 0]);
        spNode.add(cone);
    }

    // EKOR KOOPA (Quadric Cone)
    const tailPivot = new SceneNode("TailPivot");
    tailPivot.setTransform([0, -0.47, -0.43], [-1.95, 0, 0]);
    body.add(tailPivot);

    const tailCone = new SceneNode("KoopaTailCone", Primitives.createConeFrustum(gl, 0.20, 0.01, 0.48, 20, 4, true), C_YELLOW, 30);
    tailCone.setTransform([0, 0.23, 0]);
    tailPivot.add(tailCone);

    // KEPALA BESAR BOWSER JR. (Proporsi Akurat: Tempurung Hijau + Pipi Tembem Lebar + Moncong Bulat Menonjol)
    const headPivot = new SceneNode("BowserJrHeadPivot");
    headPivot.setTransform([0, 0.52, 0.06], [-0.10, 0, 0]);
    body.add(headPivot);

    // Tempurung Kepala Hijau (Ellipsoid)
    const headGreenMesh = Primitives.createEllipsoid(gl, 0.50, 0.45, 0.48);
    const head = new SceneNode("GreenHead", headGreenMesh, C_GREEN_HEAD, 36);
    head.setTransform([0, 0.24, -0.02]);
    headPivot.add(head);

    // Pipi Tembem Lebar Kiri-Kanan & Rahang Krem (Ellipsoid Lebar)
    const wideCheeksMesh = Primitives.createEllipsoid(gl, 0.55, 0.28, 0.44);
    const wideCheeks = new SceneNode("WideCreamCheeks", wideCheeksMesh, C_CREAM, 30);
    wideCheeks.setTransform([0, -0.14, 0.19]);
    head.add(wideCheeks);

    // Moncong Bulat Menonjol di Tengah Depan Wajah (Seperti Foto Referensi Bowser Jr.!)
    const snoutCenterMesh = Primitives.createEllipsoid(gl, 0.42, 0.30, 0.40);
    const snout = new SceneNode("CenterCreamSnout", snoutCenterMesh, C_CREAM, 32);
    snout.setTransform([0, -0.06, 0.36]);
    head.add(snout);

    // Lubang Hidung di Atas Moncong
    const nostrilMesh = Primitives.createEllipsoid(gl, 0.042, 0.028, 0.05);
    for (const side of [-1, 1]) {
        const n = new SceneNode("Nostril", nostrilMesh, [0.35, 0.20, 0.06], 10);
        n.setTransform([side * 0.11, 0.16, 0.32], [0.45, 0, side * -0.15]);
        snout.add(n);
    }

    // GIGI TARING KECIL PUTIH MENONJOL DARI SUDUT MULUT (Quadric Cone!)
    const fangConeMesh = Primitives.createConeFrustum(gl, 0.048, 0.004, 0.13, 16, 3, true);
    const leftFang = new SceneNode("FangToothCone", fangConeMesh, C_WHITE, 60);
    leftFang.setTransform([-0.18, -0.19, 0.28], [Math.PI * 0.92, 0, -0.12]);
    snout.add(leftFang);

    // CURVE 2: Garis Senyum Menyeringai Khas Bowser Jr. (3D Cubic Bezier Curve)
    const grinCurveMesh = Primitives.createBezierTube(
        gl,
        [-0.34, -0.12, 0.22],
        [-0.15, -0.20, 0.39],
        [0.15, -0.20, 0.39],
        [0.34, -0.12, 0.22],
        0.016, 0.016
    );
    snout.add(new SceneNode("SmirkGrinBezier", grinCurveMesh, [0.42, 0.24, 0.08], 20));

    // MATA HITAM BULAT + KILAU PUTIH (Di atas garis moncong krem!)
    // Raised green ellipsoids behind the eyes form a permanent upper-lid/socket border.
    // The eye and its shine scale vertically to blink; the green border stays fixed.
    const eyelidBaseMesh = Primitives.createEllipsoid(gl, 0.112, 0.135, 0.075);
    const eyeMesh = Primitives.createEllipsoid(gl, 0.075, 0.095, 0.065);
    const shineMesh = Primitives.createEllipsoid(gl, 0.028, 0.035, 0.028);
    for (const side of [-1, 1]) {
        const eyelidBase = new SceneNode("EyeLidBaseEllipsoid", eyelidBaseMesh, C_GREEN_HEAD, 30);
        eyelidBase.setTransform([side * 0.17, 0.298, 0.305]);
        head.add(eyelidBase);

        const eye = new SceneNode("JrEye", eyeMesh, C_BLACK, 90);
        eye.setTransform([side * 0.17, 0.28, 0.353]);
        head.add(eye);

        const shine = new SceneNode("JrEyeShine", shineMesh, C_WHITE, 100);
        shine.setTransform([side * -0.018, 0.008, 0.054]);
        eye.add(shine);
        if (!root.blinkEyes) root.blinkEyes = [];
        root.blinkEyes.push(eye);
    }

    // CURVE 3 & 4: ALIS MERAH TEBAL MENYALA KHAS BOWSER JR. (3D Cubic Bezier Curve Tube)
    for (const side of [-1, 1]) {
        const browCurveMesh = Primitives.createBezierTube(
            gl,
            // Low inner end over the nose; the tapered outer end flicks upward.
            [side * 0.07, 0.285, 0.425],
            [side * 0.18, 0.315, 0.44],
            [side * 0.29, 0.37, 0.30],
            [side * 0.335, 0.445, 0.10],
            0.020, 0.003, 32, 16, 3.2
        );
        const eyebrow = new SceneNode("FieryEyebrowBezier", browCurveMesh, C_RED_HAIR, 40);
        eyebrow.setTransform([0, 0.045, 0]);
        head.add(eyebrow);
    }

    // 2 TANDUK KECIL DI SAMPING KEPALA (QUADRIC CONE + TORUS BASE)
    const hornConeMesh = Primitives.createConeFrustum(gl, 0.085, 0.008, 0.20, 18, 4, true);
    const hornBaseMesh = Primitives.createTorus(gl, 0.08, 0.028);
    for (const side of [-1, 1]) {
        const hornGroup = new SceneNode("HornGroup");
        hornGroup.setTransform([side * 0.445, 0.20, -0.06], [-0.15, 0, side * -1.08]);
        head.add(hornGroup);

        const hBase = new SceneNode("HornBaseTorus", hornBaseMesh, C_CREAM, 30);
        hBase.setTransform([0, 0.008, 0], [Math.PI / 2, 0, 0]);
        hornGroup.add(hBase);

        const hCone = new SceneNode("HornCone", hornConeMesh, C_HORN, 50);
        hCone.setTransform([0, 0.105, 0]);
        hornGroup.add(hCone);
    }

    // KUNCIR RAMBUT MERAH (PONYTAIL) DI ATAS KEPALA (Cylinder Ikat + 3 Helai 3D Bezier Curve Tubes!)
    const hairTieMesh = Primitives.createCylinder(gl, 0.085, 0.075);
    const hairGroup = new SceneNode("PonytailGroup");
    hairGroup.setTransform([0, 0.445, -0.07], [-0.12, 0, 0]);
    head.add(hairGroup);

    const hairTie = new SceneNode("BlackHairTie", hairTieMesh, C_DARK_METAL, 40);
    hairTie.setTransform([0, 0.025, 0]);
    hairGroup.add(hairTie);

    const hairStrands = [
        // Three overlapping tapered locks, with staggered heights and a backward sweep.
        // All roots meet the top of the exposed hair tie; side locks stay close to the center.
        [ [0, 0.065, 0], [-0.010, 0.24, -0.005], [-0.015, 0.44, -0.10], [0.025, 0.57, -0.18] ],
        [ [-0.010, 0.065, 0.002], [-0.10, 0.15, 0.020], [-0.11, 0.28, -0.075], [-0.045, 0.37, -0.23] ],
        [ [0.010, 0.065, -0.002], [0.105, 0.15, -0.045], [0.11, 0.26, -0.18], [0.12, 0.30, -0.29] ]
    ];
    for (const pts of hairStrands) {
        // Generate along local X to avoid the tube builder's frame switch near vertical tangents.
        // Rotate the existing node back afterward; the intended world-space curve is unchanged.
        const local = pts.map(([x, y, z]) => [y, -x, z]);
        const strandMesh = Primitives.createBezierTube(gl, local[0], local[1], local[2], local[3], 0.080, 0.003, 32, 18, 1.65);
        const strand = new SceneNode("RedHairBezierStrand", strandMesh, C_RED_HAIR, 45);
        strand.setTransform([0, 0, 0], [0, 0, Math.PI / 2]);
        hairGroup.add(strand);
    }

    // BOLA API BOWSER JR. (Muncul menyembur dari mulut saat mode Aksi / Environment!)
    const fireballGroup = new SceneNode("FireballProjectile");
    fireballGroup.setTransform([0, -0.08, 0.85]);
    fireballGroup.scale = [0.001, 0.001, 0.001];
    head.add(fireballGroup);

    const fireCore = new SceneNode("FireCore", Primitives.createEllipsoid(gl, 0.16, 0.16, 0.22), C_FIRE_CORE, 100);
    fireballGroup.add(fireCore);
    const fireTailCone = new SceneNode("FireTailCone", Primitives.createConeFrustum(gl, 0.18, 0.01, 0.38, 18, 4, true), C_FIRE_OUTER, 80);
    fireTailCone.setTransform([0, 0, -0.18], [-Math.PI / 2, 0, 0]);
    fireballGroup.add(fireTailCone);

    // LENGAN: cone frustum + torus cuff + cone studs + ellipsoid fists
    // +Y connects to the shoulder; keep that end narrower than the wrist end.
    const upperArmMesh = Primitives.createConeFrustum(gl, 0.13, 0.049, 0.34);
    const cuffTorusMesh = Primitives.createTorus(gl, 0.14, 0.05);
    const studConeMesh  = Primitives.createConeFrustum(gl, 0.038, 0.004, 0.075, 12, 2, true);
    const fistMesh      = Primitives.createEllipsoid(gl, 0.20, 0.18, 0.20);

    function createArm(side) {
        const shoulder = new SceneNode(side < 0 ? "LeftShoulder" : "RightShoulder");
        shoulder.setTransform([side * 0.47, 0.23, 0.09], [0.20, 0, side * 0.40]);
        body.add(shoulder);

        const arm = new SceneNode("UpperArmFrustum", upperArmMesh, C_YELLOW, 30);
        arm.setTransform([0, -0.17, 0]);
        shoulder.add(arm);

        const wrist = new SceneNode("Wrist");
        wrist.setTransform([0, -0.17, 0]);
        arm.add(wrist);

        const cuff = new SceneNode("SpikedWristbandTorus", cuffTorusMesh, C_DARK_METAL, 70);
        cuff.setTransform([0, 0.02, 0], [Math.PI / 2, 0, 0]);
        wrist.add(cuff);

        for (let a = 0; a < 4; a++) {
            const ang = (a / 4) * Math.PI * 2;
            const stud = new SceneNode("WristSpikeCone", studConeMesh, C_WHITE, 80);
            stud.setTransform([Math.cos(ang) * 0.205, 0.02, Math.sin(ang) * 0.205], [0, -ang, -Math.PI / 2]);
            wrist.add(stud);
        }

        const fist = new SceneNode("FistEllipsoid", fistMesh, C_YELLOW, 30);
        fist.setTransform([0, -0.14, 0.03]);
        wrist.add(fist);

        return { shoulder, wrist };
    }

    const leftArm  = createArm(-1);
    const rightArm = createArm(1);

    // KAKI KIRI & KANAN + KUKU TAJAM (Cylinder Paha + Ellipsoid Telapak + 3 Quadric Cones Kuku Kaki)
    // Rounded thigh joints cover the cylinder's flat upper cap during every leg swing.
    const thighJointMesh = Primitives.createEllipsoid(gl, 0.19, 0.20, 0.19);
    const legCylMesh   = Primitives.createCylinder(gl, 0.17, 0.30);
    const footMesh     = Primitives.createEllipsoid(gl, 0.24, 0.16, 0.33);
    // Surface patch follows the underside exactly, avoiding a separate floating sole disc.
    const padMesh = Primitives.createEllipsoidPatch(gl,
        0.24, 0.16, 0.33, [0, -1, 0], 0.72, 14, 32, 0.0015);
    const clawConeMesh = Primitives.createConeFrustum(gl, 0.04, 0.005, 0.12, 18, 3, true);

    function createLeg(side) {
        const hip = new SceneNode(side < 0 ? "LeftHip" : "RightHip");
        hip.setTransform([side * 0.34, -0.44, 0.05]);
        body.add(hip);

        const thighJoint = new SceneNode("ThighJointEllipsoid", thighJointMesh, C_YELLOW, 30);
        thighJoint.setTransform([0, -0.04, 0.025]);
        hip.add(thighJoint);

        const legCyl = new SceneNode("LegCylinder", legCylMesh, C_YELLOW, 30);
        legCyl.setTransform([0, -0.12, 0]);
        hip.add(legCyl);

        const foot = new SceneNode("FootEllipsoid", footMesh, C_YELLOW, 30);
        foot.setTransform([side * 0.04, -0.16, 0.11]);
        legCyl.add(foot);

        const solePad = new SceneNode("FootSolePad", padMesh, C_BELLY_TAN, 20);
        solePad.setTransform([0, 0, 0]);
        foot.add(solePad);

        for (let c = -1; c <= 1; c++) {
            const claw = new SceneNode("ToeClawCone", clawConeMesh, C_HORN, 40);
            claw.setTransform([c * 0.10, -0.025, 0.305], [Math.PI / 2, c * 0.12, 0]);
            foot.add(claw);
        }

        return { hip, foot };
    }

    const leftLeg  = createLeg(-1);
    const rightLeg = createLeg(1);

    // Fungsi Animasi Hierarkis Bowser Jr.
    root.animate = function(t, mode) {
        const combined = mode === "combined";
        if (combined) mode = "action";
        root.resetAnim();
        animateBlink(root, t);
        fireballGroup.visible = false;
        fireballGroup.scale = [0.001, 0.001, 0.001];

        if (mode === "walk") {
            const swing = Math.sin(t * 5.0);
            const bounce = Math.abs(Math.cos(t * 5.0));

            body.animPos = [0, bounce * 0.12, 0];
            body.animRot = [0.08, swing * 0.18, Math.sin(t * 5.0) * 0.07];

            headPivot.animRot = [Math.sin(t * 10) * 0.06, -swing * 0.14, 0];
            hairGroup.animRot = [Math.sin(t * 10) * 0.18, 0, swing * 0.14];

            leftArm.shoulder.animRot  = [swing * 0.70, 0, 0];
            rightArm.shoulder.animRot = [-swing * 0.70, 0, 0];

            leftLeg.hip.animRot  = [-swing * 0.80, 0, 0];
            rightLeg.hip.animRot = [swing * 0.80, 0, 0];

            tailPivot.animRot = [0, swing * 0.38, 0];
        } else if (mode === "action") {
            // Pose aksi Bowser Jr. tanpa semburan api.
            const punch = Math.sin(t * 9.0);

            // Keep torso rotation neutral so this action can accompany the walking motion.

            headPivot.animRot = [-0.08, -punch * 0.22, 0];
            hairGroup.animRot = [0.22 * Math.abs(punch), 0, 0];


            leftLeg.hip.animRot  = [0, 0, -0.12];
            rightLeg.hip.animRot = [0, 0, 0.12];
            if (combined) {
                const swing = Math.sin(t * 5.0);
                leftLeg.hip.animRot = [-swing * 0.80, 0, 0];
                rightLeg.hip.animRot = [swing * 0.80, 0, 0];
            }
            tailPivot.animRot = [0.18, Math.sin(t * 12) * 0.45, 0];

            // Efek bola api dinonaktifkan.
        } else {
            // Idle Gagah (mirip pose dinamis gambar referensi!)
            const breath = Math.sin(t * 3.0);
            body.animPos = [0, breath * 0.028, 0];
            headPivot.animRot = [breath * 0.04, Math.sin(t * 1.5) * 0.14, 0];
            hairGroup.animRot = [breath * 0.08, 0, 0];
            leftArm.shoulder.animRot  = [-0.25 + breath * 0.07, 0.15, -0.12];
            rightArm.shoulder.animRot = [0.20 - breath * 0.07, -0.15, 0.12];
            tailPivot.animRot = [0, Math.sin(t * 3.5) * 0.24, 0];
        }
        // Swing opposite arms only in the combined circular-walk mode.
        if (combined) {
            const swing = Math.sin(t * 5);
            leftArm.shoulder.animRot = [swing * 0.7, 0, 0];
            rightArm.shoulder.animRot = [-swing * 0.7, 0, 0];
        }
    };

    return root;
}
