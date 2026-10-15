// Karakter 2: TOAD (Super Mario Series) - High-Fidelity Pure WebGL Model
// Dibangun dari ellipsoid, silinder, frustum, torus, dan kurva Bezier 3D.

function createToad(gl) {
    const C_SKIN   = [0.99, 0.82, 0.67];
    const C_WHITE  = [0.98, 0.98, 1.00];
    const C_RED    = [0.93, 0.12, 0.15];
    const C_BLUE   = [0.10, 0.26, 0.86];
    const C_GOLD   = [0.98, 0.84, 0.14];
    const C_BROWN  = [0.50, 0.24, 0.10];
    const C_SOLE   = [0.32, 0.15, 0.06];
    const C_BLACK  = [0.05, 0.05, 0.07];
    const C_MOUTH  = [0.62, 0.26, 0.22];

    const root = new SceneNode("ToadRoot");

    // Badan utama memakai frustum kerucut dan menjadi parent bagian tubuh lainnya.
    const torsoFrustumMesh = Primitives.createConeFrustum(gl, 0.39, 0.29, 0.56, 28, 6, true);
    const body = new SceneNode("ToadTorsoFrustum", torsoFrustumMesh, C_SKIN, 22);
    body.setTransform([0, 0.78, 0]);
    root.add(body);

    // Rompi biru berbentuk frustum terbuka di depan agar bagian dada tetap terlihat.
    const vestMesh = Primitives.createOpenVestFrustum(gl, 0.42, 0.32, 0.55, 0.44, 32);
    const vestNode = new SceneNode("ToadBlueVestFrustum", vestMesh, C_BLUE, 38);
    vestNode.setTransform([0, 0.01, 0]);
    body.add(vestNode);

    // Ellipsoid biru membentuk bagian bahu rompi.
    const strapMesh = Primitives.createEllipsoid(gl, 0.11, 0.06, 0.24);
    for (const side of [-1, 1]) {
        const strap = new SceneNode("VestShoulderStrap", strapMesh, C_BLUE, 38);
        strap.setTransform([side * 0.24, 0.27, 0.02], [0, side * 0.15, side * -0.2]);
        body.add(strap);
    }

    // Tabung Bezier emas mengikuti kedua tepi bukaan depan rompi.
    for (const side of [-1, 1]) {
        const vestEdgeGoldCurve = Primitives.createBezierTube(
            gl,
            [side * 0.219, 0.275, 0.233],
            [side * 0.226, 0.10, 0.270],
            [side * 0.226, -0.10, 0.316],
            [side * 0.219, -0.275, 0.358],
            0.027, 0.027
        );
        vestNode.add(new SceneNode("VestGoldTrimBezier", vestEdgeGoldCurve, C_GOLD, 65));
    }

    // Tabung Bezier emas meneruskan lis atas melewati sisi hingga bagian belakang rompi.
    const backAngles = [Math.PI / 2 + 0.77, Math.PI, Math.PI * 1.5, Math.PI * 2, Math.PI * 2.5 - 0.77];
    const backRadius = 0.32, backY = 0.275;
    for (let i = 0; i < backAngles.length - 1; i++) {
        const a = backAngles[i], b = backAngles[i + 1];
        const k = 4 / 3 * Math.tan((b - a) / 4);
        const p0 = [backRadius * Math.cos(a), backY, backRadius * Math.sin(a)];
        const p3 = [backRadius * Math.cos(b), backY, backRadius * Math.sin(b)];
        const t0 = [-Math.sin(a), 0, Math.cos(a)], t1 = [-Math.sin(b), 0, Math.cos(b)];
        const p1 = [p0[0] + k * backRadius * t0[0], backY, p0[2] + k * backRadius * t0[2]];
        const p2 = [p3[0] - k * backRadius * t1[0], backY, p3[2] - k * backRadius * t1[2]];
        vestNode.add(new SceneNode("VestBackTopGoldTrim", Primitives.createBezierTube(gl, p0, p1, p2, p3, 0.027, 0.027), C_GOLD, 65));
    }

    // Celana putih dibuat dari ellipsoid.
    const pantsMesh = Primitives.createEllipsoid(gl, 0.47, 0.32, 0.45);
    const pants = new SceneNode("ToadWhitePants", pantsMesh, C_WHITE, 25);
    pants.setTransform([0, -0.30, 0]);
    body.add(pants);

    // Pivot kepala menjadi parent kepala dan topi agar keduanya ikut bergerak bersama.
    const headPivot = new SceneNode("ToadHeadPivot");
    headPivot.setTransform([0, 0.32, 0]);
    body.add(headPivot);

    const headMesh = Primitives.createEllipsoid(gl, 0.45, 0.41, 0.44);
    const head = new SceneNode("ToadHead", headMesh, C_SKIN, 28);
    head.setTransform([0, 0.24, 0]);
    headPivot.add(head);

    // Mata berupa ellipsoid hitam dengan kilau ellipsoid putih.
    const eyeBlackMesh = Primitives.createEllipsoid(gl, 0.055, 0.115, 0.045);
    const eyeShineMesh = Primitives.createEllipsoid(gl, 0.026, 0.045, 0.03);
    for (const side of [-1, 1]) {
        const eye = new SceneNode("ToadEye", eyeBlackMesh, C_BLACK, 90);
        eye.setTransform([side * 0.15, 0.02, 0.41], [0, side * 0.15, 0]);
        head.add(eye);

        const shine = new SceneNode("ToadEyeShine", eyeShineMesh, C_WHITE, 100);
        shine.setTransform([side * -0.012, 0.04, 0.035]);
        eye.add(shine);

    }

    // Kurva Bezier 3D membentuk senyum.
    const smileMesh = Primitives.createBezierTube(
        gl,
        [-0.14, -0.17, 0.38],
        [-0.07, -0.24, 0.42],
        [0.07, -0.24, 0.42],
        [0.14, -0.17, 0.38],
        0.016, 0.016
    );
    head.add(new SceneNode("ToadSmileCurve", smileMesh, C_MOUTH, 20));

    // Kubah topi jamur dan lima bintik merahnya memakai ellipsoid/patch permukaan.
    const capGroup = new SceneNode("MushroomCapGroup");
    capGroup.setTransform([0, 0.64, -0.04], [-0.08, 0, 0]);
    head.add(capGroup);

    const capRx = 0.90, capRy = 0.62, capRz = 0.88;
    const capMainMesh = Primitives.createEllipsoid(gl, capRx, capRy, capRz, 36, 36);
    const capMain = new SceneNode("MushroomCapMain", capMainMesh, C_WHITE, 45);
    capGroup.add(capMain);

    // Torus membentuk lis bawah topi jamur.
    const capUnderRimMesh = Primitives.createTorus(gl, 0.46, 0.12);
    const capUnderRim = new SceneNode("MushroomUnderTorus", capUnderRimMesh, [0.92, 0.93, 0.96], 30);
    capUnderRim.setTransform([0, -0.38, 0.02], [Math.PI / 2, 0, 0]);
    capGroup.add(capUnderRim);

    // Kurva Bezier 3D menambahkan detail alur pada tepi topi.
    const capSeamCurve = Primitives.createBezierTube(
        gl,
        [-0.42, -0.38, 0.28],
        [-0.18, -0.35, 0.50],
        [0.18, -0.35, 0.50],
        [0.42, -0.38, 0.28],
        0.018, 0.018
    );
    capGroup.add(new SceneNode("CapSeamBezier", capSeamCurve, [0.86, 0.87, 0.90], 20));

    // Patch ellipsoid merah ditempel mengikuti permukaan kubah topi.
    const spotDirs = [
        { dir: [0, 0.08, 0.99],   rad: 0.46 }, // Bintik Merah Depan Tengah (Ikonik!)
        { dir: [-0.96, 0.08, 0.12], rad: 0.44 }, // Bintik Merah Samping Kiri
        { dir: [0.96, 0.08, 0.12],  rad: 0.44 }, // Bintik Merah Samping Kanan
        { dir: [0, 0.08, -0.99],  rad: 0.45 }, // Bintik Merah Belakang
        { dir: [0, 0.99, -0.05],  rad: 0.42 }  // Bintik Merah Atas
    ];
    for (const sp of spotDirs) {
        const patchMesh = Primitives.createEllipsoidPatch(gl, capRx, capRy, capRz, sp.dir, sp.rad, 14, 28, 0.009);
        capMain.add(new SceneNode("FlushRedSpotPatch", patchMesh, C_RED, 50));
    }

    // Lengan memakai dua ruas silinder dengan pivot siku dan pergelangan.
    const armCylMesh  = Primitives.createCylinder(gl, 0.09, 0.23);
    const elbowMesh   = Primitives.createEllipsoid(gl, 0.095, 0.095, 0.095);
    const palmMesh    = Primitives.createEllipsoid(gl, 0.12, 0.10, 0.13);
    const fingerMesh  = Primitives.createEllipsoid(gl, 0.038, 0.038, 0.10);

    function createArm(side) {
        const shoulder = new SceneNode(side < 0 ? "LeftShoulder" : "RightShoulder");
        shoulder.setTransform([side * 0.30, 0.18, 0.18], [0.10, 0, side * 0.50]);
        body.add(shoulder);

        const upperArm = new SceneNode("UpperArmCylinder", armCylMesh, C_SKIN, 25);
        upperArm.setTransform([0, -0.105, 0]);
        shoulder.add(upperArm);

        const elbow = new SceneNode("ElbowPivot");
        elbow.setTransform([0, -0.105, 0], [-0.55, side * -0.2, 0]);
        upperArm.add(elbow);
        elbow.add(new SceneNode("ElbowJoint", elbowMesh, C_SKIN, 25));

        const lowerArm = new SceneNode("LowerArmCylinder", armCylMesh, C_SKIN, 25);
        lowerArm.setTransform([0, -0.105, 0]);
        elbow.add(lowerArm);

        const wrist = new SceneNode("Wrist");
        wrist.setTransform([0, -0.105, 0], [0.55, side * 0.2, 0]);
        lowerArm.add(wrist);

        const hand = new SceneNode("PalmEllipsoid", palmMesh, C_SKIN, 25);
        hand.setTransform([0, -0.04, 0.02]);
        wrist.add(hand);

        for (let f = -1.5; f <= 1.5; f += 1.0) {
            const finger = new SceneNode("Finger", fingerMesh, C_SKIN, 25);
            finger.setTransform([f * 0.042, -0.05, 0.08], [0.2, f * 0.18, 0]);
            hand.add(finger);
        }
        const thumb = new SceneNode("Thumb", fingerMesh, C_SKIN, 25);
        thumb.setTransform([side * -0.09, -0.01, 0.05], [0, side * -0.6, 0]);
        hand.add(thumb);

        return { shoulder, elbow, wrist };
    }

    const leftArm  = createArm(-1);
    const rightArm = createArm(1);

    // Kaki memakai silinder; sepatu dan solnya memakai ellipsoid.
    const legCylMesh = Primitives.createCylinder(gl, 0.13, 0.20);
    const shoeMesh   = Primitives.createEllipsoid(gl, 0.26, 0.18, 0.35);
    const soleMesh   = Primitives.createEllipsoid(gl, 0.25, 0.05, 0.34);

    function createLeg(side) {
        const hip = new SceneNode(side < 0 ? "LeftHip" : "RightHip");
        hip.setTransform([side * 0.24, -0.42, 0.02]);
        body.add(hip);

        const legCyl = new SceneNode("LegCylinder", legCylMesh, C_WHITE, 20);
        legCyl.setTransform([0, -0.08, 0]);
        hip.add(legCyl);

        const shoe = new SceneNode("BrownShoe", shoeMesh, C_BROWN, 50);
        shoe.setTransform([side * 0.04, -0.18, 0.09], [0, side * -0.18, 0]);
        legCyl.add(shoe);

        const sole = new SceneNode("ShoeSole", soleMesh, C_SOLE, 20);
        sole.setTransform([0, -0.13, 0]);
        shoe.add(sole);

        return { hip, shoe };
    }

    const leftLeg  = createLeg(-1);
    const rightLeg = createLeg(1);

    // Animasi menggerakkan badan dan turunannya melalui pivot hierarkis.
    root.animate = function(t, mode) {
        root.resetAnim();
        if (mode === "walk") {
            const swing = Math.sin(t * 5.5);
            const bounce = Math.abs(Math.cos(t * 5.5));

            body.animPos = [0, bounce * 0.10, 0];
            body.animRot = [0.05, swing * 0.15, Math.sin(t * 5.5) * 0.06];

            headPivot.animRot = [Math.sin(t * 11) * 0.05, -swing * 0.12, -Math.sin(t * 5.5) * 0.06];

            leftArm.shoulder.animRot  = [swing * 0.55, 0, 0];
            rightArm.shoulder.animRot = [-swing * 0.55, 0, 0];
            leftArm.elbow.animRot = [-swing * 0.16, 0, 0];
            rightArm.elbow.animRot = [swing * 0.16, 0, 0];

            leftLeg.hip.animRot  = [-swing * 0.70, 0, 0];
            rightLeg.hip.animRot = [swing * 0.70, 0, 0];
        } else if (mode === "action") {
            // Melompat Gembira & Melambaikan Kedua Tangan ke Atas!
            const jump = Math.max(0, Math.sin(t * 4.5));
            body.animPos = [0, jump * 0.48, 0];
            body.animRot = [-jump * 0.10, Math.sin(t * 2.2) * 0.20, 0];

            headPivot.animRot = [-0.10 * jump, Math.sin(t * 4.5) * 0.14, Math.sin(t * 9.0) * 0.08];

            leftArm.shoulder.animRot  = [0, 0, -0.35 + Math.sin(t * 12) * 0.20];
            rightArm.shoulder.animRot = [0, 0, 0.35 - Math.sin(t * 12) * 0.20];
            leftArm.elbow.animRot = [-0.18, 0, 0];
            rightArm.elbow.animRot = [-0.18, 0, 0];

            leftLeg.hip.animRot  = [jump * 0.45, 0, -jump * 0.12];
            rightLeg.hip.animRot = [-jump * 0.35, 0, jump * 0.12];
        } else {
            // Idle Ceria (persis pose berdiri merentangkan tangan di gambar referensi PDF!)
            const breath = Math.sin(t * 2.8);
            body.animPos = [0, breath * 0.025, 0];
            headPivot.animRot = [breath * 0.03, Math.sin(t * 1.5) * 0.10, Math.cos(t * 2.8) * 0.04];
            leftArm.shoulder.animRot  = [0, 0, -0.35 + Math.sin(t * 3.5) * 0.08];
            rightArm.shoulder.animRot = [0, 0, 0.35 - Math.sin(t * 3.5) * 0.08];
            leftArm.elbow.animRot = [Math.sin(t * 2.8) * 0.04, 0, 0];
            rightArm.elbow.animRot = [-Math.sin(t * 2.8) * 0.04, 0, 0];
        }
    };

    return root;
}
