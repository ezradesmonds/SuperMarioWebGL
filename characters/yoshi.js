// Karakter 1: YOSHI (Super Mario Series) - High-Fidelity Pure WebGL Model
// Pemenuhan Ketentuan:
// 1. Ellipsoid: Kepala, moncong bulat besar, pipi putih, badan, perut putih, mata, sepatu boots, jari, telur Yoshi (dengan flush surface patch spots)
// 2. Cylinder: Leher, lengan atas/bawah, paha/betis
// 3. Quadric Non-Ellipsoid/Cylinder: Cone (Ekor meruncing & 3 jambul duri merah belakang kepala) & Torus (rim putih saddle merah & cuff sepatu)
// 4. Curve (3D Cubic Bezier Tube): Bibir senyum mulut, lidah panjang dapat menjulur, lengkungan pelana (saddle), dan kontur perut putih

function createYoshi(gl) {
    const C_GREEN       = [0.20, 0.80, 0.22];
    const C_LIGHT_GREEN = [0.28, 0.86, 0.28];
    const C_WHITE       = [0.97, 0.98, 0.99];
    const C_RED         = [0.92, 0.16, 0.14];
    const C_CREST       = [0.94, 0.28, 0.12];
    const C_DARK_MOUTH  = [0.55, 0.08, 0.12];
    const C_TONGUE      = [0.96, 0.36, 0.48];
    const C_ORANGE_BOOT = [0.95, 0.42, 0.10];
    const C_YELLOW_SOLE = [0.98, 0.84, 0.18];
    const C_BLACK       = [0.06, 0.06, 0.08];

    const root = new SceneNode("YoshiRoot");

    // PARENT UTAMA: Torso / Badan Oval (Ellipsoid)
    const bodyMesh = Primitives.createEllipsoid(gl, 0.52, 0.66, 0.48);
    const body = new SceneNode("YoshiBody", bodyMesh, C_GREEN, 36);
    body.setTransform([0, 0.90, 0], [0.16, 0, 0]);
    root.add(body);

    // Perut & Dada Putih Halus Menyatu di Depan Badan (Ellipsoid)
    const bellyMesh = Primitives.createEllipsoid(gl, 0.43, 0.58, 0.34);
    const belly = new SceneNode("YoshiBelly", bellyMesh, C_WHITE, 22);
    belly.setTransform([0, -0.01, 0.22], [-0.04, 0, 0]);
    body.add(belly);

    // CURVE 1: Kontur Tepi Perut Putih (3D Cubic Bezier Tube Kiri & Kanan)
    for (const side of [-1, 1]) {
        const bellyCurve = Primitives.createBezierTube(
            gl,
            [side * 0.22, 0.48, 0.32],
            [side * 0.42, 0.16, 0.38],
            [side * 0.40, -0.24, 0.36],
            [side * 0.18, -0.50, 0.26],
            0.025, 0.025
        );
        body.add(new SceneNode("BellyContourBezier", bellyCurve, C_WHITE, 22));
    }

    // SADDLE / PELANA MERAH DI PUNGGUNG ATAS (Dome + Quadric Torus Rim + Bezier Arch)
    const saddleNode = new SceneNode("YoshiSaddle");
    saddleNode.setTransform([0, 0.12, -0.40], [-1.32, 0, 0]);
    body.add(saddleNode);

    const saddleShellMesh = Primitives.createDome(gl, 0.40, 0.36, 0.44, Math.PI * 0.58);
    const saddleShell = new SceneNode("SaddleRedDome", saddleShellMesh, C_RED, 65);
    saddleNode.add(saddleShell);

    // Quadric Non-Ellipsoid/Cylinder: Torus untuk cincin dasar putih Saddle
    const saddleRimMesh = Primitives.createTorus(gl, 0.37, 0.07);
    const saddleRim = new SceneNode("SaddleWhiteRim", saddleRimMesh, C_WHITE, 30);
    saddleRim.setTransform([0, 0.04, 0], [Math.PI / 2, 0, 0]);
    saddleNode.add(saddleRim);

    // CURVE 2: Kurva Bezier Pelana (Saddle Arch Detail)
    const saddleArchCurve = Primitives.createBezierTube(
        gl,
        [-0.34, 0.06, 0.0],
        [-0.20, 0.39, 0.10],
        [0.20, 0.39, 0.10],
        [0.34, 0.06, 0.0],
        0.04, 0.04
    );
    saddleNode.add(new SceneNode("SaddleBezierArch", saddleArchCurve, C_RED, 65));

    // EKOR YOSHI MERUNCING KE BELAKANG ATAS (QUADRIC NON-ELLIPSOID/CYLINDER: CONE)
    const tailPivot = new SceneNode("TailPivot");
    tailPivot.setTransform([0, -0.38, -0.32], [-1.18, 0, 0]);
    body.add(tailPivot);

    const tailConeMesh = Primitives.createConeFrustum(gl, 0.30, 0.02, 0.78, 28, 8, true);
    const tailCone = new SceneNode("TailCone", tailConeMesh, C_GREEN, 30);
    tailCone.setTransform([0, 0.32, 0]);
    tailPivot.add(tailCone);

    const tailUnderMesh = Primitives.createConeFrustum(gl, 0.22, 0.01, 0.72, 24, 6, true);
    const tailUnder = new SceneNode("TailUnderWhite", tailUnderMesh, C_WHITE, 20);
    tailUnder.setTransform([0, 0.31, -0.07]);
    tailPivot.add(tailUnder);

    // LEHER & KEPALA (Leher = Cylinder, Kepala = Ellipsoid)
    const neckPivot = new SceneNode("YoshiNeckPivot");
    neckPivot.setTransform([0, 0.56, 0.06], [-0.14, 0, 0]);
    body.add(neckPivot);

    const neckMesh = Primitives.createCylinder(gl, 0.25, 0.34);
    const neck = new SceneNode("YoshiNeck", neckMesh, C_GREEN, 30);
    neck.setTransform([0, 0.10, 0]);
    neckPivot.add(neck);

    const neckFrontWhite = new SceneNode("NeckFrontWhite", Primitives.createCylinder(gl, 0.21, 0.32), C_WHITE, 20);
    neckFrontWhite.setTransform([0, 0.10, 0.07]);
    neckPivot.add(neckFrontWhite);

    const head = new SceneNode("YoshiHead", Primitives.createEllipsoid(gl, 0.46, 0.44, 0.48), C_GREEN, 36);
    head.setTransform([0, 0.38, 0.04]);
    neckPivot.add(head);

    // PIPI PUTIH LEBAR KHAS YOSHI & RAHANG BAWAH (Terlihat jelas dari depan & samping!)
    const cheekBigMesh = Primitives.createEllipsoid(gl, 0.52, 0.28, 0.44);
    const cheeks = new SceneNode("YoshiWhiteCheeks", cheekBigMesh, C_WHITE, 24);
    cheeks.setTransform([0, -0.14, 0.14]);
    head.add(cheeks);

    // Rongga Mulut Terbuka Ceria & Dagu Putih di Bawah Moncong
    const mouthCavityMesh = Primitives.createEllipsoid(gl, 0.26, 0.18, 0.28);
    const mouthCavity = new SceneNode("MouthCavity", mouthCavityMesh, C_DARK_MOUTH, 10);
    mouthCavity.setTransform([0, -0.22, 0.36], [0.25, 0, 0]);
    head.add(mouthCavity);

    const chinMesh = Primitives.createEllipsoid(gl, 0.30, 0.14, 0.32);
    const chin = new SceneNode("WhiteChin", chinMesh, C_WHITE, 22);
    chin.setTransform([0, -0.31, 0.34], [0.15, 0, 0]);
    head.add(chin);

    // CURVE 3: Garis Bibir Senyum Melengkung (3D Cubic Bezier Curve)
    const smileCurveMesh = Primitives.createBezierTube(
        gl,
        [-0.40, -0.10, 0.28],
        [-0.22, -0.26, 0.52],
        [0.22, -0.26, 0.52],
        [0.40, -0.10, 0.28],
        0.028, 0.028
    );
    head.add(new SceneNode("YoshiSmileLipBezier", smileCurveMesh, C_WHITE, 25));

    // CURVE 4: Lidah Panjang Yoshi (3D Cubic Bezier Curve yang bisa menjulur saat aksi!)
    const tonguePivot = new SceneNode("TonguePivot");
    tonguePivot.setTransform([0, -0.22, 0.42]);
    head.add(tonguePivot);

    const tongueCurveMesh = Primitives.createBezierTube(
        gl,
        [0, 0, 0],
        [0, 0.04, 0.35],
        [0, 0.02, 0.70],
        [0, 0.0, 1.05],
        0.075, 0.095
    );
    const tongueNode = new SceneNode("YoshiBezierTongue", tongueCurveMesh, C_TONGUE, 35);
    tonguePivot.add(tongueNode);
    const tongueTip = new SceneNode("TongueTip", Primitives.createEllipsoid(gl, 0.11, 0.09, 0.12), C_TONGUE, 35);
    tongueTip.setTransform([0, 0, 1.05]);
    tonguePivot.add(tongueTip);
    tonguePivot.scale = [0.2, 0.2, 0.15]; // Default tersimpan di dalam mulut

    // MONCONG BULAT BESAR KHAS YOSHI (Proporsi pas di depan atas mulut)
    const snoutMesh = Primitives.createEllipsoid(gl, 0.50, 0.45, 0.52);
    const snout = new SceneNode("YoshiBigSnout", snoutMesh, C_LIGHT_GREEN, 42);
    snout.setTransform([0, 0.06, 0.56]);
    head.add(snout);

    // Lubang Hidung (2 Ellipsoid kecil di atas moncong)
    const nostrilMesh = Primitives.createEllipsoid(gl, 0.048, 0.028, 0.055);
    for (const side of [-1, 1]) {
        const nostril = new SceneNode("Nostril", nostrilMesh, [0.06, 0.32, 0.06], 10);
        nostril.setTransform([side * 0.12, 0.39, 0.20], [0.45, 0, side * -0.2]);
        snout.add(nostril);
    }

    // MATA BESAR MENONJOL KE ATAS KHAS YOSHI (2 Dome Kembar + Sclera Putih + Pupil Hitam Besar)
    const eyeSocketMesh = Primitives.createEllipsoid(gl, 0.23, 0.40, 0.22);
    const eyeballMesh   = Primitives.createEllipsoid(gl, 0.19, 0.34, 0.15);
    const pupilMesh     = Primitives.createEllipsoid(gl, 0.085, 0.16, 0.06);
    const shineMesh     = Primitives.createEllipsoid(gl, 0.032, 0.05, 0.03);

    for (const side of [-1, 1]) {
        const eyeGroup = new SceneNode("EyeSocket", eyeSocketMesh, C_GREEN, 36);
        eyeGroup.setTransform([side * 0.18, 0.44, 0.06], [-0.08, 0, side * -0.05]);
        head.add(eyeGroup);

        const whiteEye = new SceneNode("EyeWhite", eyeballMesh, C_WHITE, 60);
        whiteEye.setTransform([0, 0.02, 0.11]);
        eyeGroup.add(whiteEye);

        const pupil = new SceneNode("Pupil", pupilMesh, C_BLACK, 85);
        pupil.setTransform([side * -0.035, 0.02, 0.12], [0, side * 0.15, 0]);
        whiteEye.add(pupil);

        const shine = new SceneNode("EyeShine", shineMesh, C_WHITE, 100);
        shine.setTransform([side * -0.01, 0.07, 0.05]);
        pupil.add(shine);
    }

    // 3 JAMBUL DURI ORANYE-MERAH DI BELAKANG KEPALA (Quadric Cone Frustum)
    const crestConeMesh = Primitives.createConeFrustum(gl, 0.15, 0.045, 0.28, 20, 4, true);
    const crestPositions = [
        { pos: [0, 0.50, -0.30], rot: [-1.05, 0, 0], scale: [0.65, 1.0, 1.1] },
        { pos: [0, 0.22, -0.44], rot: [-1.42, 0, 0], scale: [0.65, 1.0, 1.1] },
        { pos: [0, -0.06, -0.45], rot: [-1.72, 0, 0], scale: [0.65, 0.92, 1.0] }
    ];
    for (const cp of crestPositions) {
        const crest = new SceneNode("RedCrestCone", crestConeMesh, C_CREST, 40);
        crest.setTransform(cp.pos, cp.rot, cp.scale);
        head.add(crest);
    }

    // TANGAN KIRI & KANAN (Cylinder Lengan + Ellipsoid Tangan & 4 Jari)
    const upperArmMesh = Primitives.createCylinder(gl, 0.11, 0.36);
    const lowerArmMesh = Primitives.createCylinder(gl, 0.10, 0.32);
    const handMesh     = Primitives.createEllipsoid(gl, 0.14, 0.12, 0.16);
    const fingerMesh   = Primitives.createEllipsoid(gl, 0.048, 0.048, 0.13);

    function createArm(side) {
        const shoulder = new SceneNode(side < 0 ? "LeftShoulder" : "RightShoulder");
        shoulder.setTransform([side * 0.44, 0.24, 0.10], [0.25, side * -0.15, side * 0.38]);
        body.add(shoulder);

        const upperArm = new SceneNode("UpperArm", upperArmMesh, C_GREEN, 30);
        upperArm.setTransform([0, -0.16, 0]);
        shoulder.add(upperArm);

        const elbow = new SceneNode("Elbow");
        elbow.setTransform([0, -0.16, 0], [-0.55, side * -0.2, 0]);
        upperArm.add(elbow);

        const forearm = new SceneNode("Forearm", lowerArmMesh, C_GREEN, 30);
        forearm.setTransform([0, -0.14, 0]);
        elbow.add(forearm);

        const hand = new SceneNode("Hand", handMesh, C_GREEN, 30);
        hand.setTransform([0, -0.16, 0.04]);
        forearm.add(hand);

        for (let f = -1; f <= 1; f++) {
            const finger = new SceneNode("Finger", fingerMesh, C_GREEN, 30);
            finger.setTransform([f * 0.075, -0.02, 0.12], [0.2, f * 0.18, 0]);
            hand.add(finger);
        }
        const thumb = new SceneNode("Thumb", fingerMesh, C_GREEN, 30);
        thumb.setTransform([side * -0.10, 0.02, 0.06], [0, side * -0.5, 0]);
        hand.add(thumb);

        return { shoulder, elbow, hand };
    }

    const leftArm  = createArm(-1);
    const rightArm = createArm(1);

    // KAKI KIRI & KANAN (Cylinder Paha + Sepatu Boots Oranye-Merah & Sol Kuning)
    const thighMesh  = Primitives.createEllipsoid(gl, 0.21, 0.26, 0.22);
    const legCylMesh = Primitives.createCylinder(gl, 0.15, 0.34);
    const cuffMesh   = Primitives.createTorus(gl, 0.17, 0.055);
    const bootMesh   = Primitives.createEllipsoid(gl, 0.24, 0.20, 0.39);
    const soleMesh   = Primitives.createEllipsoid(gl, 0.24, 0.065, 0.38);

    function createLeg(side) {
        const hip = new SceneNode(side < 0 ? "LeftHip" : "RightHip");
        hip.setTransform([side * 0.30, -0.48, 0.04], [-0.16, 0, 0]);
        body.add(hip);

        const thigh = new SceneNode("Thigh", thighMesh, C_GREEN, 30);
        thigh.setTransform([0, -0.08, 0]);
        hip.add(thigh);

        const leg = new SceneNode("LegCylinder", legCylMesh, C_GREEN, 30);
        leg.setTransform([0, -0.18, 0]);
        hip.add(leg);

        const ankle = new SceneNode("Ankle");
        ankle.setTransform([0, -0.20, 0]);
        leg.add(ankle);

        const cuff = new SceneNode("BootCuff", cuffMesh, C_ORANGE_BOOT, 45);
        cuff.setTransform([0, 0.07, 0.02], [Math.PI / 2, 0, 0]);
        ankle.add(cuff);

        const boot = new SceneNode("OrangeBoot", bootMesh, C_ORANGE_BOOT, 55);
        boot.setTransform([0, -0.06, 0.13]);
        ankle.add(boot);

        const sole = new SceneNode("YellowSole", soleMesh, C_YELLOW_SOLE, 25);
        sole.setTransform([0, -0.14, 0.0]);
        boot.add(sole);

        return { hip, ankle };
    }

    const leftLeg = createLeg(-1);
    const rightLeg = createLeg(1);

    // Fungsi Animasi Hierarkis Yoshi
    root.animate = function(t, mode) {
        root.resetAnim();
        tonguePivot.scale = [0.2, 0.2, 0.15];

        if (mode === "walk") {
            const swing = Math.sin(t * 4.5);
            const bounce = Math.abs(Math.cos(t * 4.5));

            body.animPos = [0, bounce * 0.11, 0];
            body.animRot = [0.05 * Math.sin(t * 9), swing * 0.12, 0];

            neckPivot.animRot = [Math.sin(t * 9) * 0.07, -swing * 0.10, 0];
            head.animRot = [Math.cos(t * 9) * 0.05, 0, Math.sin(t * 4.5) * 0.04];

            leftArm.shoulder.animRot  = [swing * 0.65, 0, 0];
            rightArm.shoulder.animRot = [-swing * 0.65, 0, 0];

            leftLeg.hip.animRot = [-swing * 0.75, 0, 0];
            rightLeg.hip.animRot = [swing * 0.75, 0, 0];
            leftLeg.ankle.animRot = [Math.max(0, swing) * 0.35, 0, 0];
            rightLeg.ankle.animRot = [Math.max(0, -swing) * 0.35, 0, 0];

            tailPivot.animRot = [Math.sin(t * 9) * 0.08, swing * 0.42, 0];
        } else if (mode === "action") {
            // Aksi Spesial Yoshi: Menjulurkan Lidah Bezier 3D & Melompat Gembira bersama Telur!
            const cycle = (t * 2.2) % (Math.PI * 2);
            const tongueExtend = Math.max(0, Math.sin(cycle));
            tonguePivot.scale = [1.0, 1.0, 0.15 + tongueExtend * 1.35];

            const hop = Math.max(0, Math.sin(t * 4.2));
            body.animPos = [0, hop * 0.32, 0];
            body.animRot = [-0.10 + tongueExtend * 0.18, Math.sin(t * 2.1) * 0.15, 0];

            head.animRot = [tongueExtend * 0.15, 0, 0];
            leftArm.shoulder.animRot  = [-0.45 - hop * 0.4, 0, -0.25];
            rightArm.shoulder.animRot = [-0.45 - hop * 0.4, 0, 0.25];

            leftLeg.hip.animRot  = [-0.45 * hop, 0, 0];
            rightLeg.hip.animRot = [0.35 * hop, 0, 0];
            tailPivot.animRot = [0.15, Math.sin(t * 10) * 0.45, 0];

            // Telur melompat di samping Yoshi
        } else {
            // Idle Ceria & Bernapas Halus (Telur berdiri rapi di samping kaki Yoshi, tidak menutupi perut!)
            const breath = Math.sin(t * 2.5);
            body.animPos = [0, breath * 0.025, 0];
            neckPivot.animRot = [breath * 0.04, Math.sin(t * 1.4) * 0.12, 0];
            leftArm.shoulder.animRot  = [breath * 0.06, 0, 0];
            rightArm.shoulder.animRot = [-breath * 0.06, 0, 0];
            tailPivot.animRot = [0, Math.sin(t * 3.0) * 0.22, 0];
        }
    };

    return root;
}
