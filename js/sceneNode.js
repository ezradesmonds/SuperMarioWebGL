// Hierarchical Scene Graph Node for Parent-Child Transformation
class SceneNode {
    constructor(name, mesh = null, color = [1, 1, 1], shininess = 32.0) {
        this.name = name;
        this.mesh = mesh;
        this.color = color;
        this.shininess = shininess;

        // Base local transform (structural placement relative to parent)
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0]; // Euler XYZ in radians
        this.scale = [1, 1, 1];

        // Dynamic animation offsets (applied on top of base transform)
        this.animPos = [0, 0, 0];
        this.animRot = [0, 0, 0];
        this.animScale = [1, 1, 1];

        // Mesh-only local scale/offset so children don't get skewed by parent's non-uniform scale
        this.geomScale = [1, 1, 1];
        this.geomOffset = [0, 0, 0];
        this.geomRot = [0, 0, 0];

        this.children = [];
    }

    add(child) {
        this.children.push(child);
        return child;
    }

    setTransform(pos, rot = [0,0,0], scale = [1,1,1]) {
        this.position = pos;
        this.rotation = rot;
        this.scale = scale;
        return this;
    }

    setGeomTransform(scale = [1,1,1], offset = [0,0,0], rot = [0,0,0]) {
        this.geomScale = scale;
        this.geomOffset = offset;
        this.geomRot = rot;
        return this;
    }

    resetAnim() {
        this.animPos = [0, 0, 0];
        this.animRot = [0, 0, 0];
        this.animScale = [1, 1, 1];
        for (const c of this.children) c.resetAnim();
    }

    draw(gl, shader, parentMatrix, showCurveHighlight = false) {
        let localMatrix = Mat4.clone(parentMatrix);

        // Apply node translation (base + animation)
        localMatrix = Mat4.translate(
            localMatrix,
            this.position[0] + this.animPos[0],
            this.position[1] + this.animPos[1],
            this.position[2] + this.animPos[2]
        );

        // Apply node rotation (base + animation)
        localMatrix = Mat4.rotateX(localMatrix, this.rotation[0] + this.animRot[0]);
        localMatrix = Mat4.rotateY(localMatrix, this.rotation[1] + this.animRot[1]);
        localMatrix = Mat4.rotateZ(localMatrix, this.rotation[2] + this.animRot[2]);

        // Apply node uniform/structural scale
        localMatrix = Mat4.scale(
            localMatrix,
            this.scale[0] * this.animScale[0],
            this.scale[1] * this.animScale[1],
            this.scale[2] * this.animScale[2]
        );

        // Draw this node's geometry using geomMatrix
        if (this.mesh) {
            let geomMatrix = Mat4.clone(localMatrix);
            geomMatrix = Mat4.translate(geomMatrix, this.geomOffset[0], this.geomOffset[1], this.geomOffset[2]);
            geomMatrix = Mat4.rotateX(geomMatrix, this.geomRot[0]);
            geomMatrix = Mat4.rotateY(geomMatrix, this.geomRot[1]);
            geomMatrix = Mat4.rotateZ(geomMatrix, this.geomRot[2]);
            geomMatrix = Mat4.scale(geomMatrix, this.geomScale[0], this.geomScale[1], this.geomScale[2]);

            const normalMatrix = Mat4.normalFromMat4(geomMatrix);

            gl.uniformMatrix4fv(shader.uModelMatrix, false, geomMatrix);
            gl.uniformMatrix3fv(shader.uNormalMatrix, false, normalMatrix);

            let drawColor = this.color;
            if (showCurveHighlight && this.mesh.isCurve) {
                drawColor = [0.0, 1.0, 0.9]; // Cyan highlight for Bezier curves
            }
            gl.uniform3fv(shader.uColor, drawColor);
            gl.uniform1f(shader.uShininess, this.shininess);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.position);
            gl.vertexAttribPointer(shader.aPosition, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normal);
            gl.vertexAttribPointer(shader.aNormal, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indices);
            if (showCurveHighlight && this.mesh.isCurve) {
                gl.drawElements(gl.LINE_STRIP, this.mesh.count, gl.UNSIGNED_SHORT, 0);
            } else {
                gl.drawElements(gl.TRIANGLES, this.mesh.count, gl.UNSIGNED_SHORT, 0);
            }
        }

        // Propagate localMatrix to all child nodes (Hierarchical Transformation!)
        for (const child of this.children) {
            child.draw(gl, shader, localMatrix, showCurveHighlight);
        }
    }
}
