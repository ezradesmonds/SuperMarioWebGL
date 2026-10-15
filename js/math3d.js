// Pure WebGL 3D Matrix & Vector Math Library (Column-Major like OpenGL)
const Mat4 = {
    identity: function() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    },
    clone: function(a) {
        return new Float32Array(a);
    },
    multiply: function(a, b) {
        const out = new Float32Array(16);
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        return out;
    },
    translate: function(m, x, y, z) {
        const t = this.identity();
        t[12] = x; t[13] = y; t[14] = z;
        return this.multiply(m, t);
    },
    scale: function(m, x, y, z) {
        const s = this.identity();
        s[0] = x; s[5] = y; s[10] = z;
        return this.multiply(m, s);
    },
    rotateX: function(m, rad) {
        const r = this.identity();
        const c = Math.cos(rad), s = Math.sin(rad);
        r[5] = c; r[6] = s;
        r[9] = -s; r[10] = c;
        return this.multiply(m, r);
    },
    rotateY: function(m, rad) {
        const r = this.identity();
        const c = Math.cos(rad), s = Math.sin(rad);
        r[0] = c; r[2] = -s;
        r[8] = s; r[10] = c;
        return this.multiply(m, r);
    },
    rotateZ: function(m, rad) {
        const r = this.identity();
        const c = Math.cos(rad), s = Math.sin(rad);
        r[0] = c; r[1] = s;
        r[4] = -s; r[5] = c;
        return this.multiply(m, r);
    },
    perspective: function(fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        const out = new Float32Array(16);
        out[0] = f / aspect;
        out[5] = f;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[14] = (2 * far * near) * nf;
        return out;
    },
    lookAt: function(eye, center, up) {
        let z0 = eye[0] - center[0], z1 = eye[1] - center[1], z2 = eye[2] - center[2];
        let len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len; z1 *= len; z2 *= len;

        let x0 = up[1] * z2 - up[2] * z1;
        let x1 = up[2] * z0 - up[0] * z2;
        let x2 = up[0] * z1 - up[1] * z0;
        len = Math.hypot(x0, x1, x2);
        if (len) { len = 1 / len; x0 *= len; x1 *= len; x2 *= len; }

        let y0 = z1 * x2 - z2 * x1;
        let y1 = z2 * x0 - z0 * x2;
        let y2 = z0 * x1 - z1 * x0;

        const out = new Float32Array(16);
        out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
        out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
        out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
        out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
        out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
        out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
        out[15] = 1;
        return out;
    },
    normalFromMat4: function(a) {
        const a00 = a[0], a01 = a[1], a02 = a[2];
        const a10 = a[4], a11 = a[5], a12 = a[6];
        const a20 = a[8], a21 = a[9], a22 = a[10];

        const b01 = a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;

        let det = a00 * b01 + a01 * b11 + a02 * b21;
        if (!det) return new Float32Array([1,0,0, 0,1,0, 0,0,1]);
        det = 1.0 / det;

        const out = new Float32Array(9);
        out[0] = b01 * det;
        out[1] = (-a22 * a01 + a02 * a21) * det;
        out[2] = (a12 * a01 - a02 * a11) * det;
        out[3] = b11 * det;
        out[4] = (a22 * a00 - a02 * a20) * det;
        out[5] = (-a12 * a00 + a02 * a10) * det;
        out[6] = b21 * det;
        out[7] = (-a21 * a00 + a01 * a20) * det;
        out[8] = (a11 * a00 - a01 * a10) * det;
        return out;
    }
};

const Vec3 = {
    sub: (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]],
    add: (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]],
    scale: (a, s) => [a[0]*s, a[1]*s, a[2]*s],
    cross: (a, b) => [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ],
    normalize: (a) => {
        const len = Math.hypot(a[0], a[1], a[2]) || 1;
        return [a[0]/len, a[1]/len, a[2]/len];
    },
    bezierPoint: function(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const b0 = u*u*u;
        const b1 = 3*u*u*t;
        const b2 = 3*u*t*t;
        const b3 = t*t*t;
        return [
            b0*p0[0] + b1*p1[0] + b2*p2[0] + b3*p3[0],
            b0*p0[1] + b1*p1[1] + b2*p2[1] + b3*p3[1],
            b0*p0[2] + b1*p1[2] + b2*p2[2] + b3*p3[2]
        ];
    },
    bezierTangent: function(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const d0 = -3*u*u;
        const d1 = 3*u*u - 6*u*t;
        const d2 = 6*u*t - 3*t*t;
        const d3 = 3*t*t;
        return this.normalize([
            d0*p0[0] + d1*p1[0] + d2*p2[0] + d3*p3[0],
            d0*p0[1] + d1*p1[1] + d2*p2[1] + d3*p3[1],
            d0*p0[2] + d1*p1[2] + d2*p2[2] + d3*p3[2]
        ]);
    }
};
