// Karakter 3: BOWSER JR. (Super Mario Series) - High-Fidelity Pure WebGL Model
// Pemenuhan Ketentuan:
// 1. Ellipsoid: Kepala besar hijau, pipi & moncong krem tembem, badan kuning bulat, plastron perut bergaris, kepalan tangan, telapak kaki
// 2. Cylinder: Lengan atas/bawah, paha/kaki, ikat rambut hitam
// 3. Quadric Non-Ellipsoid/Cylinder: Cone (Tanduk kepala, duri-duri tajam pada shell hijau, taring mulut, kuku kaki, ekor, stud gelang) & Torus (Cincin putih cangkang & gelang besi)
// 4. Curve (3D Cubic Bezier Tube): Alis merah menyala, kuncir rambut merah melengkung, motif mulut monster pada bib/bandana, garis segmen perut, dan senyum menyeringai

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

    // Garis-garis segmen perut menggunakan 3D Cubic Bezier Curve
    for (const yOff of [0.06, -0.08, -0.22]) {
        const ribCurve = Primitives.createBezierTube(
            gl,
            [-0.34, yOff, 0.42],
            [-0.14, yOff - 0.02, 0.61],
            [0.14, yOff - 0.02, 0.61],
            [0.34, yOff, 0.42],
            0.015, 0.015
        );
        body.add(new SceneNode("BellyRibBezier", ribCurve, C_RIB_LINE, 15));
    }

    // BIB / BANDANA PUTIH SEGITIGA DI LEHER & DADA ATAS (Rapi menempel di dada atas, tidak menutupi perut!)
    const bibGroup = new SceneNode("BibBandanaGroup");
    bibGroup.setTransform([0, 0.34, 0.24], [0.35, 0, 0]);
    body.add(bibGroup);

    const bibCollarMesh = Primitives.createEllipsoid(gl, 0.42, 0.16, 0.34);
    const bibCollar = new SceneNode("WhiteBibCollar", bibCollarMesh, C_WHITE, 30);
    bibGroup.add(bibCollar);

    const bibTipMesh = Primitives.createConeFrustum(gl, 0.34, 0.06, 0.26, 24, 4, true);
    const bibTip = new SceneNode("WhiteBibTriangleTip", bibTipMesh, C_WHITE, 30);
    bibTip.setTransform([0, -0.10, 0.10], [Math.PI, 0, 0], [1.0, 1.0, 0.65]);
    bibGroup.add(bibTip);

    // CURVE 1: Lukisan Mulut/Gigi Monster Merah pada Bib/Bandana (Menempel rata di permukaan bib!)
    const bibMouthCurve = Primitives.createBezierTube(
        gl,
        [-0.26, -0.01, 0.30],
        [-0.12, -0.12, 0.35],
        [0.12, -0.12, 0.35],
        [0.26, -0.01, 0.30],
        0.022, 0.022
    );
    bibGroup.add(new SceneNode("BibMonsterMouthBezier", bibMouthCurve, C_RED_HAIR, 30));

    const bibTeethCurve = Primitives.createBezierTube(
        gl,
        [-0.20, -0.05, 0.32],
        [-0.06, 0.03, 0.36],
        [0.06, 0.03, 0.36],
        [0.20, -0.05, 0.32],
        0.018, 0.018
    );
    bibGroup.add(new SceneNode("BibMonsterTeethBezier", bibTeethCurve, C_RED_HAIR, 30));

    // CANGKANG BERDURI (KOOPA SHELL) DI PUNGGUNG (Dome + Torus Rim + Quadric Cones untuk Duri!)
    const shellGroup = new SceneNode("SpikedShellGroup");
    shellGroup.setTransform([0, 0.06, -0.36], [-1.42, 0, 0]);
    body.add(shellGroup);

    const shellDomeMesh = Primitives.createDome(gl, 0.58, 0.46, 0.60, Math.PI * 0.60);
    const shellDome = new SceneNode("GreenShellDome", shellDomeMesh, C_SHELL_GREEN, 45);
    shellGroup.add(shellDome);

    // Quadric Torus untuk tepi putih tebal cangkang Koopa
    const shellRimMesh = Primitives.createTorus(gl, 0.54, 0.095);
    const shellRim = new SceneNode("ShellWhiteTorusRim", shellRimMesh, C_WHITE, 35);
    shellRim.setTransform([0, 0.05, 0], [Math.PI / 2, 0, 0]);
    shellGroup.add(shellRim);

    // QUADRIC NON-ELLIPSOID/CYLINDER: CONE untuk Duri-duri Cangkang + Cincin Dasar Oranye
    const spikeConeMesh = Primitives.createConeFrustum(gl, 0.11, 0.005, 0.26, 20, 4, true);
    const spikeRingMesh = Primitives.createTorus(gl, 0.105, 0.032);
    const spikeCoords = [
        { pos: [0, 0.44, 0.16], rot: [0.35, 0, 0] },
        { pos: [0, 0.42, -0.18], rot: [-0.35, 0, 0] },
        { pos: [-0.28, 0.32, -0.02], rot: [0, 0, 0.55] },
        { pos: [0.28, 0.32, -0.02], rot: [0, 0, -0.55] }
    ];
    for (const sc of spikeCoords) {
        const spNode = new SceneNode("ShellSpikePivot");
        spNode.setTransform(sc.pos, sc.rot);
        shellGroup.add(spNode);

        const ring = new SceneNode("SpikeBaseRing", spikeRingMesh, C_YELLOW, 30);
        ring.setTransform([0, -0.07, 0], [Math.PI / 2, 0, 0]);
        spNode.add(ring);

        const cone = new SceneNode("ShellSpikeCone", spikeConeMesh, C_WHITE, 60);
        spNode.add(cone);
    }

    // EKOR KOOPA (Quadric Cone)
    const tailPivot = new SceneNode("TailPivot");
    tailPivot.setTransform([0, -0.42, -0.32], [-1.25, 0, 0]);
    body.add(tailPivot);

    const tailCone = new SceneNode("KoopaTailCone", Primitives.createConeFrustum(gl, 0.20, 0.01, 0.48, 20, 4, true), C_YELLOW, 30);
    tailCone.setTransform([0, 0.20, 0]);
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
    wideCheeks.setTransform([0, -0.10, 0.20]);
    head.add(wideCheeks);

    // Moncong Bulat Menonjol di Tengah Depan Wajah (Seperti Foto Referensi Bowser Jr.!)
    const snoutCenterMesh = Primitives.createEllipsoid(gl, 0.42, 0.30, 0.40);
    const snout = new SceneNode("CenterCreamSnout", snoutCenterMesh, C_CREAM, 32);
    snout.setTransform([0, -0.02, 0.36]);
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
    const eyeMesh = Primitives.createEllipsoid(gl, 0.075, 0.095, 0.065);
    const shineMesh = Primitives.createEllipsoid(gl, 0.028, 0.035, 0.028);
    for (const side of [-1, 1]) {
        const eye = new SceneNode("JrEye", eyeMesh, C_BLACK, 90);
        eye.setTransform([side * 0.16, 0.29, 0.32]);
        head.add(eye);

        const shine = new SceneNode("JrEyeShine", shineMesh, C_WHITE, 100);
        shine.setTransform([side * -0.018, 0.03, 0.048]);
        eye.add(shine);
    }

    // CURVE 3 & 4: ALIS MERAH TEBAL MENYALA KHAS BOWSER JR. (3D Cubic Bezier Curve Tube)
    for (const side of [-1, 1]) {
        const browCurveMesh = Primitives.createBezierTube(
            gl,
            [side * 0.06, 0.18, 0.46],
            [side * 0.17, 0.24, 0.48],
            [side * 0.30, 0.30, 0.40],
            [side * 0.40, 0.39, 0.26],
            0.042, 0.020
        );
        head.add(new SceneNode("FieryEyebrowBezier", browCurveMesh, C_RED_HAIR, 40));
    }

    // 2 TANDUK KECIL DI SAMPING KEPALA (QUADRIC CONE + TORUS BASE)
    const hornConeMesh = Primitives.createConeFrustum(gl, 0.085, 0.008, 0.20, 18, 4, true);
    const hornBaseMesh = Primitives.createTorus(gl, 0.08, 0.028);
    for (const side of [-1, 1]) {
        const hornGroup = new SceneNode("HornGroup");
        hornGroup.setTransform([side * 0.42, 0.16, -0.02], [-0.15, 0, side * -1.08]);
        head.add(hornGroup);

        const hBase = new SceneNode("HornBaseTorus", hornBaseMesh, C_CREAM, 30);
        hBase.setTransform([0, -0.05, 0], [Math.PI / 2, 0, 0]);
        hornGroup.add(hBase);

        const hCone = new SceneNode("HornCone", hornConeMesh, C_HORN, 50);
        hornGroup.add(hCone);
    }

    // KUNCIR RAMBUT MERAH (PONYTAIL) DI ATAS KEPALA (Cylinder Ikat + 3 Helai 3D Bezier Curve Tubes!)
    const hairTieMesh = Primitives.createCylinder(gl, 0.085, 0.075);
    const hairGroup = new SceneNode("PonytailGroup");
    hairGroup.setTransform([0, 0.43, -0.12], [-0.30, 0, 0]);
    head.add(hairGroup);

    const hairTie = new SceneNode("BlackHairTie", hairTieMesh, C_DARK_METAL, 40);
    hairGroup.add(hairTie);

    const hairStrands = [
        [ [0, 0.02, 0], [0, 0.22, -0.04], [0, 0.35, -0.18], [0, 0.42, -0.34] ],
        [ [-0.03, 0.02, 0], [-0.13, 0.20, -0.04], [-0.22, 0.31, -0.14], [-0.28, 0.34, -0.26] ],
        [ [0.03, 0.02, 0], [0.13, 0.20, -0.04], [0.22, 0.31, -0.14], [0.28, 0.34, -0.26] ]
    ];
    for (const pts of hairStrands) {
        const strandMesh = Primitives.createBezierTube(gl, pts[0], pts[1], pts[2], pts[3], 0.072, 0.015, 24, 14, 1.25);
        hairGroup.add(new SceneNode("RedHairBezierStrand", strandMesh, C_RED_HAIR, 45));
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

    // LENGAN KIRI & KANAN + GELANG BESI BERDURI (Cylinder Lengan + Quadric Torus Cuff + Cone Studs + Ellipsoid Kepalan Tangan)
    const armCylMesh    = Primitives.createCylinder(gl, 0.13, 0.34);
    const cuffTorusMesh = Primitives.createTorus(gl, 0.14, 0.05);
    const studConeMesh  = Primitives.createConeFrustum(gl, 0.038, 0.004, 0.075, 12, 2, true);
    const fistMesh      = Primitives.createEllipsoid(gl, 0.20, 0.18, 0.20);

    function createArm(side) {
        const shoulder = new SceneNode(side < 0 ? "LeftShoulder" : "RightShoulder");
        shoulder.setTransform([side * 0.47, 0.12, 0.20], [0.20, 0, side * 0.58]);
        body.add(shoulder);

        const arm = new SceneNode("ArmCylinder", armCylMesh, C_YELLOW, 30);
        arm.setTransform([0, -0.16, 0]);
        shoulder.add(arm);

        const wrist = new SceneNode("Wrist");
        wrist.setTransform([0, -0.18, 0]);
        arm.add(wrist);

        const cuff = new SceneNode("SpikedWristbandTorus", cuffTorusMesh, C_DARK_METAL, 70);
        cuff.setTransform([0, 0.02, 0], [Math.PI / 2, 0, 0]);
        wrist.add(cuff);

        for (let a = 0; a < 4; a++) {
            const ang = (a / 4) * Math.PI * 2;
            const stud = new SceneNode("WristSpikeCone", studConeMesh, C_WHITE, 80);
            stud.setTransform([Math.cos(ang) * 0.175, 0.02, Math.sin(ang) * 0.175], [0, -ang, -Math.PI / 2]);
            wrist.add(stud);
        }

        const fist = new SceneNode("FistEllipsoid", fistMesh, C_YELLOW, 30);
        fist.setTransform([0, -0.12, 0.03]);
        wrist.add(fist);

        return { shoulder, wrist };
    }

    const leftArm  = createArm(-1);
    const rightArm = createArm(1);

    // KAKI KIRI & KANAN + KUKU TAJAM (Cylinder Paha + Ellipsoid Telapak + 3 Quadric Cones Kuku Kaki)
    const legCylMesh   = Primitives.createCylinder(gl, 0.17, 0.30);
    const footMesh     = Primitives.createEllipsoid(gl, 0.24, 0.16, 0.33);
    const padMesh      = Primitives.createEllipsoid(gl, 0.19, 0.055, 0.26);
    const clawConeMesh = Primitives.createConeFrustum(gl, 0.05, 0.005, 0.14, 14, 3, true);

    function createLeg(side) {
        const hip = new SceneNode(side < 0 ? "LeftHip" : "RightHip");
        hip.setTransform([side * 0.34, -0.44, 0.05]);
        body.add(hip);

        const legCyl = new SceneNode("LegCylinder", legCylMesh, C_YELLOW, 30);
        legCyl.setTransform([0, -0.12, 0]);
        hip.add(legCyl);

        const foot = new SceneNode("FootEllipsoid", footMesh, C_YELLOW, 30);
        foot.setTransform([side * 0.04, -0.16, 0.11]);
        legCyl.add(foot);

        const solePad = new SceneNode("FootSolePad", padMesh, C_BELLY_TAN, 20);
        solePad.setTransform([0, -0.11, 0.0]);
        foot.add(solePad);

        for (let c = -1; c <= 1; c++) {
            const claw = new SceneNode("ToeClawCone", clawConeMesh, C_WHITE, 60);
            claw.setTransform([c * 0.095, -0.03, 0.31], [Math.PI * 0.45, c * 0.15, 0]);
            foot.add(claw);
        }

        return { hip, foot };
    }

    const leftLeg  = createLeg(-1);
    const rightLeg = createLeg(1);

    // Fungsi Animasi Hierarkis Bowser Jr.
    root.animate = function(t, mode) {
        root.resetAnim();
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
            // Menyerang (Tinju Bergantian) + Menyemburkan Bola Api & Melompat!
            const jump = Math.max(0, Math.sin(t * 4.2));
            const punch = Math.sin(t * 9.0);

            body.animPos = [0, jump * 0.34, 0];
            body.animRot = [0.12 * punch, punch * 0.26, 0];

            headPivot.animRot = [-0.08, -punch * 0.22, 0];
            hairGroup.animRot = [0.22 * Math.abs(punch), 0, 0];

            leftArm.shoulder.animRot  = [-0.75 + punch * 0.65, 0.3, -0.25];
            rightArm.shoulder.animRot = [-0.75 - punch * 0.65, -0.3, 0.25];

            leftLeg.hip.animRot  = [-0.55 * jump, 0, -0.12];
            rightLeg.hip.animRot = [0.35 * jump, 0, 0.12];
            tailPivot.animRot = [0.18, Math.sin(t * 12) * 0.45, 0];

            // Semburan Bola Api
            const firePhase = (t * 1.8) % 1.0;
            const fireScale = Math.sin(firePhase * Math.PI);
            fireballGroup.scale = [fireScale, fireScale, fireScale];
            fireballGroup.animPos = [0, -0.05, firePhase * 1.65];
            fireballGroup.animRot = [0, 0, t * 12.0];
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
    };

    return root;
}
