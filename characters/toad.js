// model Toad dibuat dari bentuk-bentuk 3D sederhana menggunakan Pure WebGL.
// kepala, topi, tangan, celana, dan sepatu memakai ellipsoid; lengan serta kaki memakai silinder.
// badan dan rompi memakai frustum kerucut, yaitu objek quadric selain ellipsoid dan silinder.
// senyum, detail topi, dan lis emas rompi dibuat dari kurva Bezier 3D berbentuk tabung.
// warna dan bentuk disusun agar tampil seperti Toad; environment dibuat di file terpisah.
// posisi, rotasi, dan skala bagian model diatur melalui transformasi pada SceneNode.
// SceneNode mendukung rotasi X/Y/Z serta axis-angle untuk goyangan pada sumbu diagonal.
// badan menjadi induk bagi rompi, celana, kepala, bahu, dan pinggul.
// bagian anak mengikuti gerak induknya, seperti susunan cabang tubuh di bawah ini.

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

    // badan berbentuk frustum kerucut dan menjadi induk bagi bagian tubuh lainnya.
    const torsoFrustumMesh = Primitives.createConeFrustum(gl, 0.39, 0.29, 0.56, 28, 6, true);
    const body = new SceneNode("ToadTorsoFrustum", torsoFrustumMesh, C_SKIN, 22);
    body.setTransform([0, 0.78, 0]);
    // Scale the complete body hierarchy; root placement is reset by the scene each frame.
    body.scale = [0.65, 0.65, 0.65];
    root.add(body);

    // rompi biru terbuka di depan supaya bagian dada tetap terlihat.
    const vestMesh = Primitives.createOpenVestFrustum(gl, 0.42, 0.32, 0.55, 0.44, 32);
    const vestNode = new SceneNode("ToadBlueVestFrustum", vestMesh, C_BLUE, 38);
    vestNode.setTransform([0, 0.01, 0]);
    // lis emas menjadi anak rompi agar ikut bergerak bersamanya.
    body.add(vestNode);

    // ellipsoid biru ini membentuk bagian bahu rompi.
    const strapMesh = Primitives.createEllipsoid(gl, 0.11, 0.06, 0.24);
    for (const side of [-1, 1]) {
        const strap = new SceneNode("VestShoulderStrap", strapMesh, C_BLUE, 38);
        strap.setTransform([side * 0.24, 0.27, 0.02], [0, side * 0.15, side * -0.2]);
        body.add(strap);
    }

    // lis emas dari kurva Bezier mengikuti kedua tepi depan rompi.
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

    // border emas ini meneruskan garis tepi atas melewati sisi hingga belakang rompi.
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

    // celana putih dibuat dari bentuk ellipsoid.
    const pantsMesh = Primitives.createEllipsoid(gl, 0.47, 0.27, 0.45);
    const pants = new SceneNode("ToadWhitePants", pantsMesh, C_WHITE, 25);
    pants.setTransform([0, -0.24, 0]);
    body.add(pants);

    // pivot ini menghubungkan kepala dan topi agar keduanya bergerak bersama.
    const headPivot = new SceneNode("ToadHeadPivot");
    headPivot.setTransform([0, 0.32, 0]);
    // kepala berada di bawah pivot kepala, sedangkan mata dan senyum menjadi anak kepala.
    body.add(headPivot);

    const headMesh = Primitives.createEllipsoid(gl, 0.45, 0.41, 0.44);
    const head = new SceneNode("ToadHead", headMesh, C_SKIN, 28);
    head.setTransform([0, 0.24, 0]);
    headPivot.add(head);

    // mata hitam dan pantulan cahayanya sama-sama memakai ellipsoid.
    const eyeBlackMesh = Primitives.createEllipsoid(gl, 0.055, 0.115, 0.045);
    const eyeShineMesh = Primitives.createEllipsoid(gl, 0.026, 0.045, 0.03);
    for (const side of [-1, 1]) {
        const eye = new SceneNode("ToadEye", eyeBlackMesh, C_BLACK, 90);
        eye.setTransform([side * 0.15, 0.02, 0.41], [0, side * 0.15, 0]);
        head.add(eye);

        const shine = new SceneNode("ToadEyeShine", eyeShineMesh, C_WHITE, 100);
        shine.setTransform([side * -0.012, 0.04, 0.035]);
        eye.add(shine);
        if (!root.blinkEyes) root.blinkEyes = [];
        root.blinkEyes.push(eye);

    }

    // kurva Bezier 3D membentuk garis senyum Toad.
    const smileMesh = Primitives.createBezierTube(
        gl,
        [-0.14, -0.17, 0.38],
        [-0.07, -0.24, 0.42],
        [0.07, -0.24, 0.42],
        [0.14, -0.17, 0.38],
        0.016, 0.016
    );
    head.add(new SceneNode("ToadSmileCurve", smileMesh, C_MOUTH, 20));

    // kubah topi memakai ellipsoid; lima bintik merah mengikuti permukaan kubah.
    const capGroup = new SceneNode("MushroomCapGroup");
    capGroup.setTransform([0, 0.72, -0.04], [-0.04, 0, 0]);
    // topi menjadi anak kepala; tepian, garis detail, dan bintik menempel pada grup topi.
    head.add(capGroup);

    const capRx = 0.87, capRy = 0.72, capRz = 0.80;
    // Gently compress the lower surface; apply the same shape to its red patches.
    function flattenCapBottom(mesh) {
        const positions = mesh.cpuPositions, normals = mesh.cpuNormals;
        const edge = -0.28, depth = capRy + edge, flatten = 0.55;
        for (let i = 0; i < positions.length; i += 3) {
            if (positions[i + 1] >= edge) continue;
            const distance = edge - positions[i + 1];
            const derivative = 1 - flatten * distance / depth;
            positions[i + 1] += flatten * distance * distance / (2 * depth);
            normals[i + 1] /= derivative;
            const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
            for (let axis = 0; axis < 3; axis++) normals[i + axis] /= length;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normal);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        return mesh;
    }
    const capMainMesh = flattenCapBottom(Primitives.createEllipsoid(gl, capRx, capRy, capRz, 36, 36));
    const capMain = new SceneNode("MushroomCapMain", capMainMesh, C_WHITE, 45);
    capGroup.add(capMain);

    // torus membentuk tepian lembut di bagian bawah topi.
    const capUnderRimMesh = Primitives.createTorus(gl, 0.46, 0.12);
    const capUnderRim = new SceneNode("MushroomUnderTorus", capUnderRimMesh, [0.92, 0.93, 0.96], 30);
    capUnderRim.setTransform([0, -0.38, 0.02], [Math.PI / 2, 0, 0]);
    capGroup.add(capUnderRim);

    // kurva Bezier menambahkan garis detail di tepi topi.
    const capSeamCurve = Primitives.createBezierTube(
        gl,
        [-0.42, -0.38, 0.28],
        [-0.18, -0.35, 0.50],
        [0.18, -0.35, 0.50],
        [0.42, -0.38, 0.28],
        0.018, 0.018
    );
    capGroup.add(new SceneNode("CapSeamBezier", capSeamCurve, [0.86, 0.87, 0.90], 20));

    // bintik merah dibuat sebagai patch ellipsoid yang menempel pada kubah.
    const spotDirs = [
        { dir: [0, 0.20, 0.98],   rad: 0.52 }, // Bintik depan besar, sedikit naik mengikuti kubah.
        { dir: [-0.96, 0.08, 0.12], rad: 0.44 }, // Bintik Merah Samping Kiri
        { dir: [0.96, 0.08, 0.12],  rad: 0.44 }, // Bintik Merah Samping Kanan
        { dir: [0, 0.08, -0.99],  rad: 0.45 }, // Bintik Merah Belakang
        { dir: [0, 0.99, -0.05],  rad: 0.42 }  // Bintik Merah Atas
    ];
    for (const sp of spotDirs) {
        const patchMesh = flattenCapBottom(Primitives.createEllipsoidPatch(gl, capRx, capRy, capRz, sp.dir, sp.rad, 14, 28, 0.009));
        capMain.add(new SceneNode("FlushRedSpotPatch", patchMesh, C_RED, 50));
    }

    // Lengan atas berupa frustum yang mengecil ke bahu; lengan bawah tetap silinder.
    const upperArmMesh = Primitives.createConeFrustum(gl, 0.09, 0.034, 0.23);
    const armCylMesh  = Primitives.createCylinder(gl, 0.09, 0.23);
    const elbowMesh   = Primitives.createEllipsoid(gl, 0.095, 0.095, 0.095);
    const palmMesh    = Primitives.createEllipsoid(gl, 0.12, 0.10, 0.08);
    const fingerMesh  = Primitives.createEllipsoid(gl, 0.038, 0.038, 0.10);

    function createArm(side) {
        // susunan lengan: bahu → lengan atas → siku → lengan bawah → pergelangan → telapak → jari.
        const shoulder = new SceneNode(side < 0 ? "LeftShoulder" : "RightShoulder");
        shoulder.setTransform([side * 0.30, 0.23, 0.18], [0.10, 0, side * 0.50]);
        body.add(shoulder);

        const upperArm = new SceneNode("UpperArmFrustum", upperArmMesh, C_SKIN, 25);
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
        hand.setTransform([0, -0.04, 0.02], [0, side * Math.PI / 2, 0]);
        wrist.add(hand);

        for (let f = -1.5; f <= 1.5; f += 1.0) {
            const finger = new SceneNode("Finger", fingerMesh, C_SKIN, 25);
            // Jari mengikuti arah telapak ke bawah, bukan menunjuk ke depan.
            finger.setTransform([f * 0.042, -0.115, 0.01], [Math.PI / 2 - 0.10, 0, f * 0.10]);
            hand.add(finger);
        }
        const thumb = new SceneNode("Thumb", fingerMesh, C_SKIN, 25);
        thumb.setTransform([side * -0.11, -0.025, 0.02], [Math.PI / 2 - 0.25, 0, side * -0.65]);
        thumb.setGeomTransform([0.9, 0.9, 0.8]);
        hand.add(thumb);

        return { shoulder, elbow, wrist };
    }

    const leftArm  = createArm(-1);
    const rightArm = createArm(1);

    // kaki memakai silinder, sedangkan sepatu dan solnya memakai ellipsoid.
    const legCylMesh = Primitives.createCylinder(gl, 0.13, 0.20);
    const shoeMesh   = Primitives.createEllipsoid(gl, 0.26, 0.18, 0.35);
    const soleMesh   = Primitives.createEllipsoid(gl, 0.25, 0.05, 0.34);

    function createLeg(side) {
        // susunan kaki: pinggul → kaki → sepatu → sol.
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

    // animasi badan diteruskan ke bagian tubuh yang terhubung melalui susunan induk-anak.
    root.animate = function(t, mode) {
        const combined = mode === "combined";
        if (combined) mode = "action";
        root.resetAnim();
        animateBlink(root, t);
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
            // Toad melompat dengan tangan tetap pada pose dasar.
            const jump = Math.max(0, Math.sin(t * 4.5));
            body.animPos = [0, jump * 0.48, 0];
            // Keep torso rotation neutral so this action can accompany the walking motion.

            headPivot.animRot = [-0.10 * jump, Math.sin(t * 4.5) * 0.14, Math.sin(t * 9.0) * 0.08];


            leftLeg.hip.animRot  = [jump * 0.45, 0, -jump * 0.12];
            rightLeg.hip.animRot = [-jump * 0.35, 0, jump * 0.12];
        } else {
            // saat diam, Toad bernapas pelan dan sedikit menggerakkan kepala serta tangan.
            const breath = Math.sin(t * 2.8);
            body.animPos = [0, breath * 0.025, 0];
            headPivot.animRot = [breath * 0.03, Math.sin(t * 1.5) * 0.10, Math.cos(t * 2.8) * 0.04];
            leftArm.shoulder.animRot  = [0, 0, -0.35 + Math.sin(t * 3.5) * 0.08];
            rightArm.shoulder.animRot = [0, 0, 0.35 - Math.sin(t * 3.5) * 0.08];
            leftArm.elbow.animRot = [Math.sin(t * 2.8) * 0.04, 0, 0];
            rightArm.elbow.animRot = [-Math.sin(t * 2.8) * 0.04, 0, 0];
        }
        // High alternating steps and an occasional short kick while circling.
        if (combined) {
            const swing = Math.sin(t * 5.5);
            const phase = t % 4.0;
            const kick = phase >= 2.0 && phase < 2.8
                ? Math.sin(Math.PI * (phase - 2.0) / 0.8) ** 2 : 0;
            const kickingLeft = Math.floor(t / 4.0) % 2 === 0;
            const stepWeight = 1 - kick;
            // Replace the old repeated jumps with steps; one foot supports the body.
            body.animPos = [0, 0, 0];
            body.animRot = [0.04 + kick * 0.10, 0, 0];
            headPivot.animRot = [-kick * 0.06, 0, Math.sin(t * 5.5) * 0.025];
            leftLeg.hip.animRot = [-swing * 0.85 * stepWeight - (kickingLeft ? kick * 1.05 : 0), 0, 0];
            rightLeg.hip.animRot = [swing * 0.85 * stepWeight - (!kickingLeft ? kick * 1.05 : 0), 0, 0];
            leftLeg.hip.animPos = [0, Math.max(0, swing) * 0.10 * stepWeight, 0];
            rightLeg.hip.animPos = [0, Math.max(0, -swing) * 0.10 * stepWeight, 0];
            leftArm.shoulder.animRot = [swing * 0.50 * stepWeight - kick * 0.18, 0, -kick * 0.18];
            rightArm.shoulder.animRot = [-swing * 0.50 * stepWeight - kick * 0.18, 0, kick * 0.18];
            leftArm.elbow.animRot = [-swing * 0.12 * stepWeight, 0, 0];
            rightArm.elbow.animRot = [swing * 0.12 * stepWeight, 0, 0];
        }
    };

    return root;
}
