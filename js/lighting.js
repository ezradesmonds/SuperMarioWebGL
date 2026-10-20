// Directional shadow map using an RG depth encoding, requiring no WebGL extensions.
function createSunShadowPipeline(gl) {
    const size=Math.min(1536,gl.getParameter(gl.MAX_TEXTURE_SIZE));
    const texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const depth=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,depth);
    gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,size,size);
    const framebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
    const enabled=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    const program=gl.createProgram();
    gl.attachShader(program,compileShader(gl,gl.VERTEX_SHADER,`
        attribute vec3 aPosition;
        uniform mat4 uModelMatrix;
        uniform mat4 uLightMatrix;
        void main(){gl_Position=uLightMatrix*uModelMatrix*vec4(aPosition,1.0);}
    `));
    gl.attachShader(program,compileShader(gl,gl.FRAGMENT_SHADER,`
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        void main(){
            vec2 encoded=fract(vec2(1.0,255.0)*min(gl_FragCoord.z,0.99999));
            encoded.x-=encoded.y/255.0;
            gl_FragColor=vec4(encoded,0.0,1.0);
        }
    `));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    const shader={program,depthOnly:true,aPosition:gl.getAttribLocation(program,'aPosition'),uModelMatrix:gl.getUniformLocation(program,'uModelMatrix')};
    const lightView=Mat4.lookAt([25,45,35],[0,0,0],[0,1,0]);
    const extent=26,near=1,far=110;
    const projection=new Float32Array([1/extent,0,0,0,0,1/extent,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1]);
    const matrix=Mat4.multiply(projection,lightView);
    const location=gl.getUniformLocation(program,'uLightMatrix');
    return {texture,size,matrix,enabled,render(roots){
        if(!enabled)return;
        gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,size,size);
        gl.disable(gl.DITHER);gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2.5,6.0);
        gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);gl.enableVertexAttribArray(shader.aPosition);
        gl.uniformMatrix4fv(location,false,matrix);
        const identity=Mat4.identity();
        for(const root of roots)root.draw(gl,shader,identity);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.disable(gl.POLYGON_OFFSET_FILL);gl.enable(gl.DITHER);
    }};
}
