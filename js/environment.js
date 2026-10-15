// Full 3D Super Mario Environment (Mushroom Kingdom Diorama) & Interactive Action Props
function createMarioEnvironment(gl) {
    const C_GRASS_TOP   = [0.24, 0.78, 0.24];
    const C_GRASS_DARK  = [0.15, 0.60, 0.18];
    const C_DIRT_BROWN  = [0.55, 0.34, 0.16];
    const C_PATH_SAND   = [0.94, 0.84, 0.58];
    const C_PIPE_GREEN  = [0.12, 0.74, 0.20];
    const C_BLACK       = [0.05, 0.05, 0.07];
    const C_WHITE       = [0.97, 0.98, 1.00];
    const C_RED         = [0.92, 0.14, 0.14];
    const C_GOLD_BLOCK  = [0.98, 0.78, 0.10];
    const C_BRICK       = [0.76, 0.34, 0.16];
    const C_COIN_GOLD   = [1.00, 0.88, 0.15];
    const C_STONE_GRAY  = [0.45, 0.48, 0.54];
    const C_HILL_GREEN  = [0.20, 0.72, 0.32];

    const root = new SceneNode("MushroomKingdomEnv");

    // 1. PULAU RUMPUT HIJAU & TANAH BERTINGKAT
    const grassTopMesh = Primitives.createCylinder(gl, 6.2, 0.24, 48, 1, true);
    const grassTop = new SceneNode("GrassIslandTop", grassTopMesh, C_GRASS_TOP, 15);
    grassTop.setTransform([0, -0.12, -0.4]);
    root.add(grassTop);

    const dirtBaseMesh = Primitives.createConeFrustum(gl, 4.8, 6.1, 0.90, 48, 2, true);
    const dirtBase = new SceneNode("DirtIslandBase", dirtBaseMesh, C_DIRT_BROWN, 10);
    dirtBase.setTransform([0, -0.68, -0.4]);
    root.add(dirtBase);

    // Jalan Setapak Pasir Krem di tengah panggung
    const pathMesh = Primitives.createEllipsoid(gl, 3.8, 0.03, 1.45);
    const sandPath = new SceneNode("SandPath", pathMesh, C_PATH_SAND, 10);
    sandPath.setTransform([0, 0.0, 0.25]);
    root.add(sandPath);

    // 2. PIPA HIJAU IKONIK (WARP PIPE) + TANAMAN PIRANHA (PIRANHA PLANT) DI SISI KIRI
    function createWarpPipe(x, z, h = 1.1) {
        const pipeGroup = new SceneNode("WarpPipeGroup");
        pipeGroup.setTransform([x, h / 2, z]);

        const bodyCyl = new SceneNode("PipeBody", Primitives.createCylinder(gl, 0.48, h, 28, 2, true), C_PIPE_GREEN, 55);
        pipeGroup.add(bodyCyl);

        const lipCyl = new SceneNode("PipeLip", Primitives.createCylinder(gl, 0.56, 0.24, 28, 1, true), C_PIPE_GREEN, 60);
        lipCyl.setTransform([0, h / 2 - 0.08, 0]);
        pipeGroup.add(lipCyl);

        const holeCyl = new SceneNode("PipeHole", Primitives.createCylinder(gl, 0.42, 0.05, 24, 1, true), C_BLACK, 5);
        holeCyl.setTransform([0, h / 2 + 0.03, 0]);
        pipeGroup.add(holeCyl);

        return pipeGroup;
    }

    const leftPipe = createWarpPipe(-3.55, -0.95, 1.05);
    root.add(leftPipe);

    // Piranha Plant yang naik turun dari dalam Pipa Kiri!
    const piranhaPivot = new SceneNode("PiranhaPivot");
    piranhaPivot.setTransform([0, 0.55, 0]);
    leftPipe.add(piranhaPivot);

    const stemNode = new SceneNode("PiranhaStem", Primitives.createCylinder(gl, 0.09, 0.55), C_PIPE_GREEN, 25);
    stemNode.setTransform([0, 0.22, 0]);
    piranhaPivot.add(stemNode);

    const pHeadRx = 0.34, pHeadRy = 0.32, pHeadRz = 0.34;
    const pHead = new SceneNode("PiranhaHead", Primitives.createEllipsoid(gl, pHeadRx, pHeadRy, pHeadRz), C_RED, 45);
    pHead.setTransform([0, 0.55, 0]);
    piranhaPivot.add(pHead);

    const pLip = new SceneNode("PiranhaWhiteLip", Primitives.createTorus(gl, 0.24, 0.065), C_WHITE, 35);
    pLip.setTransform([0, 0.14, 0.16], [0.65, 0, 0]);
    pHead.add(pLip);

    for (const dir of [[0.8, 0.3, 0.5], [-0.8, 0.3, 0.5], [0, -0.4, 0.85], [0, 0.5, -0.8]]) {
        const spot = Primitives.createEllipsoidPatch(gl, pHeadRx, pHeadRy, pHeadRz, dir, 0.36, 8, 16, 0.008);
        pHead.add(new SceneNode("PiranhaSpot", spot, C_WHITE, 40));
    }

    // 3. FLOATING BRICK BLOCKS & QUESTION BLOCK (? BLOCK) + KOIN EMAS DI ATAS TOAD!
    const blocksGroup = new SceneNode("FloatingBlocksGroup");
    blocksGroup.setTransform([0, 2.75, 0.0]);
    root.add(blocksGroup);

    const boxMesh = Primitives.createBox(gl, 0.62, 0.62, 0.62);
    const brickLeft = new SceneNode("BrickBlockLeft", boxMesh, C_BRICK, 20);
    brickLeft.setTransform([-0.68, 0, 0]);
    blocksGroup.add(brickLeft);

    const brickRight = new SceneNode("BrickBlockRight", boxMesh, C_BRICK, 20);
    brickRight.setTransform([0.68, 0, 0]);
    blocksGroup.add(brickRight);

    const qBlockNode = new SceneNode("QuestionBlockCenter", boxMesh, C_GOLD_BLOCK, 50);
    blocksGroup.add(qBlockNode);

    // Simbol '?' pada Question Block menggunakan 3D Cubic Bezier Curve Tube!
    const qMarkCurve = Primitives.createBezierTube(
        gl,
        [-0.10, 0.08, 0.33],
        [-0.12, 0.24, 0.33],
        [0.14, 0.24, 0.33],
        [0.0, -0.04, 0.33],
        0.032, 0.032
    );
    qBlockNode.add(new SceneNode("QuestionMarkBezier", qMarkCurve, C_WHITE, 60));
    const qDot = new SceneNode("QuestionMarkDot", Primitives.createEllipsoid(gl, 0.04, 0.04, 0.03), C_WHITE, 60);
    qDot.setTransform([0, -0.16, 0.33]);
    qBlockNode.add(qDot);

    // Koin Emas Berputar yang keluar dari ? Block saat disundul Toad!
    const coinPivot = new SceneNode("PopCoinPivot");
    coinPivot.setTransform([0, 0.45, 0]);
    qBlockNode.add(coinPivot);

    const coinDisc = new SceneNode("GoldCoinDisc", Primitives.createCylinder(gl, 0.22, 0.06, 24, 1, true), C_COIN_GOLD, 95);
    coinDisc.setTransform([0, 0, 0], [Math.PI / 2, 0, 0]);
    coinPivot.add(coinDisc);
    const coinRim = new SceneNode("GoldCoinRim", Primitives.createTorus(gl, 0.21, 0.035), C_COIN_GOLD, 95);
    coinPivot.add(coinRim);

    // 4. BUAH APEL / SUPER BERRY MERAH (Properti Interaktif untuk Lidah Yoshi!)
    const berryPivot = new SceneNode("SuperBerryPivot");
    berryPivot.setTransform([-2.1, 1.15, 1.35]);
    root.add(berryPivot);

    const berryBody = new SceneNode("SuperBerryRed", Primitives.createEllipsoid(gl, 0.16, 0.17, 0.16), C_RED, 55);
    berryPivot.add(berryBody);
    const berryLeaf = new SceneNode("BerryLeaf", Primitives.createEllipsoid(gl, 0.09, 0.03, 0.05), C_GRASS_TOP, 30);
    berryLeaf.setTransform([0.04, 0.16, 0], [0, 0, 0.35]);
    berryPivot.add(berryLeaf);

    // 5. MENARA BENTENG BOWSER JR. (MINI KOOPA CASTLE TOWER) DI KANAN BELAKANG
    const castleGroup = new SceneNode("MiniKoopaCastle");
    castleGroup.setTransform([3.4, 0, -2.0]);
    root.add(castleGroup);

    const towerCyl = new SceneNode("CastleTower", Primitives.createCylinder(gl, 0.85, 1.8, 24, 2, true), C_STONE_GRAY, 20);
    towerCyl.setTransform([0, 0.9, 0]);
    castleGroup.add(towerCyl);

    const roofCone = new SceneNode("CastleRoofCone", Primitives.createConeFrustum(gl, 1.05, 0.02, 0.95, 24, 4, true), C_RED, 35);
    roofCone.setTransform([0, 2.25, 0]);
    castleGroup.add(roofCone);

    const towerRing = new SceneNode("CastleTorusBand", Primitives.createTorus(gl, 0.88, 0.08), C_GOLD_BLOCK, 50);
    towerRing.setTransform([0, 1.65, 0], [Math.PI / 2, 0, 0]);
    castleGroup.add(towerRing);

    // 6. BUKIT HIJAU SUPER MARIO (PARABOLOID / DOME DENGAN MATA) & POHON JAMUR DI LATAR BELAKANG
    function createMarioHill(x, z, rx, h, color) {
        const hill = new SceneNode("MarioHill", Primitives.createParaboloid(gl, rx, rx * 0.75, h, 20, 28), color, 20);
        hill.setTransform([x, 0, z]);
        const eyeMesh = Primitives.createEllipsoid(gl, 0.06, 0.16, 0.05);
        for (const s of [-1, 1]) {
            const eye = new SceneNode("HillEye", eyeMesh, C_BLACK, 50);
            eye.setTransform([s * 0.18, h * 0.58, rx * 0.50]);
            hill.add(eye);
        }
        return hill;
    }

    root.add(createMarioHill(-2.4, -3.4, 1.45, 2.2, C_HILL_GREEN));
    root.add(createMarioHill(0.5, -3.8, 1.85, 2.8, C_GRASS_DARK));
    root.add(createMarioHill(-4.3, -2.5, 1.05, 1.5, C_GRASS_TOP));

    // Semak-semak Hijau di tepi panggung
    const bushMesh = Primitives.createEllipsoid(gl, 0.38, 0.28, 0.32);
    for (const bx of [-4.6, -4.2, 4.4, 4.8]) {
        const bush = new SceneNode("Bush", bushMesh, C_GRASS_TOP, 20);
        bush.setTransform([bx, 0.18, 0.4]);
        root.add(bush);
    }

    // 7. AWAN PUTIH MELAYANG DI LANGIT (ANIMATED CLOUDS)
    const cloudsGroup = new SceneNode("FloatingClouds");
    root.add(cloudsGroup);

    function createCloud(x, y, z, scale = 1.0) {
        const cg = new SceneNode("Cloud");
        cg.setTransform([x, y, z], [0, 0, 0], [scale, scale, scale]);
        const puffMain = new SceneNode("CloudMain", Primitives.createEllipsoid(gl, 0.65, 0.36, 0.42), C_WHITE, 15);
        const puffL    = new SceneNode("CloudL", Primitives.createEllipsoid(gl, 0.45, 0.28, 0.35), C_WHITE, 15);
        puffL.setTransform([-0.45, -0.04, 0]);
        const puffR    = new SceneNode("CloudR", Primitives.createEllipsoid(gl, 0.45, 0.28, 0.35), C_WHITE, 15);
        puffR.setTransform([0.45, -0.04, 0]);
        cg.add(puffMain);
        cg.add(puffL);
        cg.add(puffR);
        return cg;
    }

    const cloud1 = createCloud(-3.2, 3.8, -3.0, 1.1);
    const cloud2 = createCloud(2.6, 4.1, -3.2, 1.25);
    const cloud3 = createCloud(0.0, 4.4, -4.0, 0.95);
    cloudsGroup.add(cloud1);
    cloudsGroup.add(cloud2);
    cloudsGroup.add(cloud3);

    // Fungsi Animasi Environment (Sinkron dengan Aksi Ketiga Karakter!)
    root.animate = function(t, animMode) {
        root.resetAnim();

        // Awan bergerak lembut
        cloud1.animPos = [Math.sin(t * 0.5) * 0.4, Math.cos(t * 1.2) * 0.06, 0];
        cloud2.animPos = [Math.cos(t * 0.4) * 0.45, Math.sin(t * 1.0) * 0.06, 0];
        cloud3.animPos = [Math.sin(t * 0.6) * 0.35, 0, 0];

        // Piranha Plant naik-turun dari Pipa Kiri
        const piranhaUp = Math.sin(t * 2.2) * 0.32;
        piranhaPivot.animPos = [0, piranhaUp, 0];
        piranhaPivot.animRot = [0, t * 1.5, 0];

        // Ketika Toad melompat (mode 'action' atau di environment), ? Block memantul dan mengeluarkan Koin Emas!
        const jumpHit = Math.max(0, Math.sin(t * 4.5));
        const blockBounce = Math.pow(jumpHit, 4.0) * 0.26;
        qBlockNode.animPos = [0, blockBounce, 0];

        coinPivot.animPos = [0, jumpHit * 0.85, 0];
        coinPivot.animRot = [0, t * 8.0, 0];

        // Buah Super Berry tertarik ke mulut Yoshi saat Yoshi menjulurkan lidah!
        const cycle = (t * 2.2) % (Math.PI * 2);
        const tongueExtend = Math.max(0, Math.sin(cycle));
        berryPivot.animPos = [0, Math.sin(t * 4.0) * 0.08, -tongueExtend * 0.65];
        berryPivot.animRot = [0, t * 3.0, 0];
    };

    return root;
}
