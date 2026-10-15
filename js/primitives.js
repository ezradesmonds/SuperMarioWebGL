// Pure WebGL Parametric Quadrics, Surface Patches & 3D Bezier Curve Mesh Generators
const Primitives = {
    createMeshBuffer: function(gl, data) {
        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.positions), gl.STATIC_DRAW);

        const normBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normals), gl.STATIC_DRAW);

        const idxBuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW);

        return {
            position: posBuf,
            normal: normBuf,
            indices: idxBuf,
            count: data.indices.length,
            isCurve: !!data.isCurve
        };
    },

    // 1. OBJECT TYPE A: ELLIPSOID (rx, ry, rz)
    createEllipsoid: function(gl, rx = 1, ry = 1, rz = 1, latBands = 32, longBands = 32) {
        const positions = [], normals = [], indices = [];
        for (let lat = 0; lat <= latBands; lat++) {
            const theta = lat * Math.PI / latBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= longBands; lon++) {
                const phi = lon * 2 * Math.PI / longBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const ux = cosPhi * sinTheta;
                const uy = cosTheta;
                const uz = sinPhi * sinTheta;

                positions.push(rx * ux, ry * uy, rz * uz);
                const nx = ux / (rx || 1), ny = uy / (ry || 1), nz = uz / (rz || 1);
                const len = Math.hypot(nx, ny, nz) || 1;
                normals.push(nx / len, ny / len, nz / len);
            }
        }
        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < longBands; lon++) {
                const first = (lat * (longBands + 1)) + lon;
                const second = first + longBands + 1;
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
        return this.createMeshBuffer(gl, { positions, normals, indices });
    },

    // Concentric Ellipsoid Surface Patch (for flush spots on Toad's mushroom cap, Yoshi's egg, etc.)
    createEllipsoidPatch: function(gl, rx, ry, rz, dirVec, angularRadius = 0.42, rings = 12, slices = 24, lift = 0.012) {
        const positions = [], normals = [], indices = [];
        const centerDir = Vec3.normalize(dirVec);
        let upRef = [0, 1, 0];
        if (Math.abs(centerDir[1]) > 0.9) upRef = [1, 0, 0];
        const tangentU = Vec3.normalize(Vec3.cross(upRef, centerDir));
        const tangentV = Vec3.normalize(Vec3.cross(centerDir, tangentU));

        // Center vertex
        const cx = (rx + lift) * centerDir[0];
        const cy = (ry + lift) * centerDir[1];
        const cz = (rz + lift) * centerDir[2];
        positions.push(cx, cy, cz);
        const cn = Vec3.normalize([centerDir[0]/rx, centerDir[1]/ry, centerDir[2]/rz]);
        normals.push(cn[0], cn[1], cn[2]);

        for (let r = 1; r <= rings; r++) {
            const alpha = (r / rings) * angularRadius;
            const sinA = Math.sin(alpha);
            const cosA = Math.cos(alpha);
            // Smooth edge taper into surface at outer ring
            const currLift = r === rings ? 0.002 : lift * Math.cos((r / rings) * Math.PI * 0.45);

            for (let s = 0; s <= slices; s++) {
                const phi = (s / slices) * Math.PI * 2;
                const cosP = Math.cos(phi), sinP = Math.sin(phi);

                const ux = cosA * centerDir[0] + sinA * (cosP * tangentU[0] + sinP * tangentV[0]);
                const uy = cosA * centerDir[1] + sinA * (cosP * tangentU[1] + sinP * tangentV[1]);
                const uz = cosA * centerDir[2] + sinA * (cosP * tangentU[2] + sinP * tangentV[2]);
                const uNorm = Vec3.normalize([ux, uy, uz]);

                const px = (rx + currLift) * uNorm[0];
                const py = (ry + currLift) * uNorm[1];
                const pz = (rz + currLift) * uNorm[2];
                positions.push(px, py, pz);

                const n = Vec3.normalize([uNorm[0]/rx, uNorm[1]/ry, uNorm[2]/rz]);
                normals.push(n[0], n[1], n[2]);
            }
        }

        // First ring triangles around center
        for (let s = 0; s < slices; s++) {
            indices.push(0, 1 + s, 1 + s + 1);
        }
        // Outer rings
        for (let r = 1; r < rings; r++) {
            const ringStart = 1 + (r - 1) * (slices + 1);
            const nextRingStart = ringStart + (slices + 1);
            for (let s = 0; s < slices; s++) {
                const a = ringStart + s;
                const b = nextRingStart + s;
                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }
        return this.createMeshBuffer(gl, { positions, normals, indices });
    },

    // Hemisphere / Dome (with optional bottom cap)
    createDome: function(gl, rx = 1, ry = 1, rz = 1, maxTheta = Math.PI * 0.65, latBands = 24, longBands = 28, capped = true) {
        const positions = [], normals = [], indices = [];
        for (let lat = 0; lat <= latBands; lat++) {
            const theta = (lat / latBands) * maxTheta;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            for (let lon = 0; lon <= longBands; lon++) {
                const phi = lon * 2 * Math.PI / longBands;
                const ux = Math.cos(phi) * sinTheta;
                const uy = cosTheta;
                const uz = Math.sin(phi) * sinTheta;
                positions.push(rx * ux, ry * uy, rz * uz);
                const nx = ux / rx, ny = uy / ry, nz = uz / rz;
                const len = Math.hypot(nx, ny, nz) || 1;
                normals.push(nx/len, ny/len, nz/len);
            }
        }
        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < longBands; lon++) {
                const first = (lat * (longBands + 1)) + lon;
                const second = first + longBands + 1;
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
        if (capped) {
            const rimY = ry * Math.cos(maxTheta);
            const rimSin = Math.sin(maxTheta);
            const centerIdx = positions.length / 3;
            positions.push(0, rimY, 0);
            normals.push(0, -1, 0);
            for (let lon = 0; lon <= longBands; lon++) {
                const phi = lon * 2 * Math.PI / longBands;
                positions.push(rx * Math.cos(phi) * rimSin, rimY, rz * Math.sin(phi) * rimSin);
                normals.push(0, -1, 0);
            }
            for (let lon = 0; lon < longBands; lon++) {
                indices.push(centerIdx, centerIdx + lon + 1, centerIdx + lon + 2);
            }
        }
        return this.createMeshBuffer(gl, { positions, normals, indices });
    },

    // 2. OBJECT TYPE B: CYLINDER (radius, height)
    createCylinder: function(gl, r = 0.5, h = 1.0, radialSegs = 28, heightSegs = 4, capped = true) {
        return this.createConeFrustum(gl, r, r, h, radialSegs, heightSegs, capped);
    },

    // 3. OBJECT TYPE C (QUADRIC NON-ELLIPSOID & NON-CYLINDER): CONE / TRUNCATED CONE (FRUSTUM)
    createConeFrustum: function(gl, rBottom = 0.6, rTop = 0.0, h = 1.0, radialSegs = 28, heightSegs = 6, capped = true) {
        const positions = [], normals = [], indices = [];
        const halfH = h / 2;
        const slope = (rBottom - rTop) / h;

        for (let y = 0; y <= heightSegs; y++) {
            const v = y / heightSegs;
            const currY = -halfH + v * h;
            const currR = rBottom + v * (rTop - rBottom);

            for (let x = 0; x <= radialSegs; x++) {
                const u = x / radialSegs;
                const theta = u * 2 * Math.PI;
                const cosT = Math.cos(theta), sinT = Math.sin(theta);

                positions.push(currR * cosT, currY, currR * sinT);
                const n = Vec3.normalize([cosT, slope, sinT]);
                normals.push(n[0], n[1], n[2]);
            }
        }

        for (let y = 0; y < heightSegs; y++) {
            for (let x = 0; x < radialSegs; x++) {
                const i1 = y * (radialSegs + 1) + x;
                const i2 = i1 + radialSegs + 1;
                indices.push(i1, i1 + 1, i2);
                indices.push(i2, i1 + 1, i2 + 1);
            }
        }

        if (capped && rBottom > 0.001) {
            const baseCenterIdx = positions.length / 3;
            positions.push(0, -halfH, 0);
            normals.push(0, -1, 0);
            for (let x = 0; x <= radialSegs; x++) {
                const theta = (x / radialSegs) * 2 * Math.PI;
                positions.push(rBottom * Math.cos(theta), -halfH, rBottom * Math.sin(theta));
                normals.push(0, -1, 0);
            }
            for (let x = 0; x < radialSegs; x++) {
                indices.push(baseCenterIdx, baseCenterIdx + x + 1, baseCenterIdx + x + 2);
            }
        }

        if (capped && rTop > 0.001) {
            const topCenterIdx = positions.length / 3;
            positions.push(0, halfH, 0);
            normals.push(0, 1, 0);
            for (let x = 0; x <= radialSegs; x++) {
                const theta = (x / radialSegs) * 2 * Math.PI;
                positions.push(rTop * Math.cos(theta), halfH, rTop * Math.sin(theta));
                normals.push(0, 1, 0);
            }
            for (let x = 0; x < radialSegs; x++) {
                indices.push(topCenterIdx, topCenterIdx + x + 2, topCenterIdx + x + 1);
            }
        }

        return this.createMeshBuffer(gl, { positions, normals, indices });
    },

    // Open-Front Frustum Vest (for Toad's signature open-front blue vest!)
    createOpenVestFrustum: function(gl, rBottom = 0.44, rTop = 0.34, h = 0.56, gapAngle = 0.55, segs = 28) {
        const positions = [], normals = [], indices = [];
        const halfH = h / 2;
        const slope = (rBottom - rTop) / h;
        // Angle in XZ plane where +Z is front (theta = PI/2). We leave a V-shaped gap around theta = PI/2!
        const startA = Math.PI * 0.5 + gapAngle;
        const endA   = Math.PI * 2.5 - gapAngle;

        for (let y = 0; y <= 6; y++) {
            const v = y / 6;
            const currY = -halfH + v * h;
            const currR = rBottom + v * (rTop - rBottom);
            // Wider V-opening at top than middle
            const vGap = gapAngle + v * 0.22;
            const sA = Math.PI * 0.5 + vGap;
            const eA = Math.PI * 2.5 - vGap;

            for (let x = 0; x <= segs; x++) {
                const u = x / segs;
                const theta = sA + u * (eA - sA);
                const cosT = Math.cos(theta), sinT = Math.sin(theta);
                positions.push(currR * cosT, currY, currR * sinT);
                const n = Vec3.normalize([cosT, slope, sinT]);
                normals.push(n[0], n[1], n[2]);
            }
        }

        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < segs; x++) {
                const i1 = y * (segs + 1) + x;
                const i2 = i1 + segs + 1;
                indices.push(i1, i1 + 1, i2);
                indices.push(i2, i1 + 1, i2 + 1);
                // Double-sided so inside of vest is also shaded
                indices.push(i1, i2, i1 + 1);
                indices.push(i2, i2 + 1, i1 + 1);
            }
        }
        return this.createMeshBuffer(gl, { positions, normals, indices });
    },

    // 4. QUADRIC NON-ELLIPSOID/CYLINDER: TORUS / RING
    createTorus: function(gl, R = 0.6, r = 0.15, radialSegs = 24, tubularSegs = 28, arc = Math.PI * 2) {
        const positions = [], normals = [], indices = [];
        for (let j = 0; j <= radialSegs; j++) {
            for (let i = 0; i <= tubularSegs; i++) {
                const u = (i / tubularSegs) * arc;
                const v = (j / radialSegs) * Math.PI * 2;

                const cosU = Math.cos(u), sinU = Math.sin(u);
                const cosV = Math.cos(v), sinV = Math.sin(v);

                const x = (R + r * cosV) * cosU;
                const y = (R + r * cosV) * sinU;
                const z = r * sinV;
                positions.push(x, y, z);

                const nx = cosV * cosU;
                const ny = cosV * sinU;
                const nz = sinV;
                normals.push(nx, ny, nz);
            }
        }
        for (let j = 0; j < radialSegs; j++) {
            for (let i = 0; i < tubularSegs; i++) {
                const a = (tubularSegs + 1) * j + i;
                const b = (tubularSegs + 1) * (j + 1) + i;
                const c = (tubularSegs + 1) * (j + 1) + i + 1;
                const d = (tubularSegs + 1) * j + i + 1;
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        return this.createMeshBuffer(gl, { positions, normals, indices });
    },

    // 5. QUADRIC NON-ELLIPSOID/CYLINDER: PARABOLOID
    createParaboloid: function(gl, rx = 0.5, rz = 0.5, h = 0.6, stacks = 18, slices = 24) {
        const positions = [], normals = [], indices = [];
        for (let i = 0; i <= stacks; i++) {
            const v = i / stacks;
            const y = h * (1 - v * v);
            const rScale = v;
            for (let j = 0; j <= slices; j++) {
                const phi = (j / slices) * Math.PI * 2;
                const cosP = Math.cos(phi), sinP = Math.sin(phi);
                const x = rx * rScale * cosP;
                const z = rz * rScale * sinP;
                positions.push(x, y, z);

                const n = Vec3.normalize([2 * rScale * cosP / rx, 1 / h, 2 * rScale * sinP / rz]);
                normals.push(n[0], n[1], n[2]);
            }
        }
        for (let i = 0; i < stacks; i++) {
            for (let j = 0; j < slices; j++) {
                const first = i * (slices + 1) + j;
                const second = first + slices + 1;
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
        return this.createMeshBuffer(gl, { positions, normals, indices });
    },

    // 6. OBJECT TYPE D (WAJIB): 3D CUBIC BEZIER CURVE TUBE (with variable radius rStart -> rEnd and capped ends)
    createBezierTube: function(gl, p0, p1, p2, p3, rStart = 0.08, rEnd = 0.08, steps = 28, radialSegs = 16, rMidScale = 1.0) {
        const positions = [], normals = [], indices = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const center = Vec3.bezierPoint(p0, p1, p2, p3, t);
            const tangent = Vec3.bezierTangent(p0, p1, p2, p3, t);
            const baseR = rStart + (rEnd - rStart) * t;
            const bulge = 1.0 + (rMidScale - 1.0) * Math.sin(t * Math.PI);
            const radius = baseR * bulge;

            let up = [0, 1, 0];
            if (Math.abs(tangent[1]) > 0.9) up = [1, 0, 0];
            const binormal = Vec3.normalize(Vec3.cross(tangent, up));
            const normal = Vec3.normalize(Vec3.cross(binormal, tangent));

            for (let j = 0; j <= radialSegs; j++) {
                const phi = (j / radialSegs) * Math.PI * 2;
                const cosP = Math.cos(phi), sinP = Math.sin(phi);

                const nx = cosP * normal[0] + sinP * binormal[0];
                const ny = cosP * normal[1] + sinP * binormal[1];
                const nz = cosP * normal[2] + sinP * binormal[2];

                positions.push(
                    center[0] + radius * nx,
                    center[1] + radius * ny,
                    center[2] + radius * nz
                );
                normals.push(nx, ny, nz);
            }
        }

        for (let i = 0; i < steps; i++) {
            for (let j = 0; j < radialSegs; j++) {
                const a = i * (radialSegs + 1) + j;
                const b = a + radialSegs + 1;
                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }

        return this.createMeshBuffer(gl, { positions, normals, indices, isCurve: true });
    },

    // 7. CUBOID / BOX (for Mario ? Blocks and Brick Blocks in Environment)
    createBox: function(gl, sx = 1, sy = 1, sz = 1) {
        const hx = sx/2, hy = sy/2, hz = sz/2;
        const positions = [
            // Front
            -hx,-hy, hz,  hx,-hy, hz,  hx, hy, hz, -hx, hy, hz,
            // Back
             hx,-hy,-hz, -hx,-hy,-hz, -hx, hy,-hz,  hx, hy,-hz,
            // Top
            -hx, hy, hz,  hx, hy, hz,  hx, hy,-hz, -hx, hy,-hz,
            // Bottom
            -hx,-hy,-hz,  hx,-hy,-hz,  hx,-hy, hz, -hx,-hy, hz,
            // Right
             hx,-hy, hz,  hx,-hy,-hz,  hx, hy,-hz,  hx, hy, hz,
            // Left
            -hx,-hy,-hz, -hx,-hy, hz, -hx, hy, hz, -hx, hy,-hz
        ];
        const normals = [
            0,0,1, 0,0,1, 0,0,1, 0,0,1,
            0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
            0,1,0, 0,1,0, 0,1,0, 0,1,0,
            0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
            1,0,0, 1,0,0, 1,0,0, 1,0,0,
            -1,0,0, -1,0,0, -1,0,0, -1,0,0
        ];
        const indices = [];
        for (let f = 0; f < 6; f++) {
            const o = f * 4;
            indices.push(o, o+1, o+2, o, o+2, o+3);
        }
        return this.createMeshBuffer(gl, { positions, normals, indices });
    }
};
