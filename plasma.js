// Plasma Background Animation avec WebGL
class PlasmaBackground {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            color: options.color || '#64ffda',
            speed: options.speed || 0.6,
            direction: options.direction || 'forward',
            scale: options.scale || 1.1,
            opacity: options.opacity || 0.3,
            mouseInteractive: options.mouseInteractive !== undefined ? options.mouseInteractive : true
        };
        
        this.mouse = { x: 0, y: 0 };
        this.startTime = performance.now();
        this.animationId = null;
        
        this.init();
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return [1, 0.5, 0.2];
        return [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ];
    }
    
    init() {
        // Créer le canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.container.appendChild(this.canvas);
        
        // Initialiser WebGL2
        this.gl = this.canvas.getContext('webgl2', {
            alpha: true,
            antialias: false,
            premultipliedAlpha: false
        });
        
        if (!this.gl) {
            console.warn('WebGL2 non supporté, le background Plasma ne sera pas affiché');
            return;
        }
        
        this.setupShaders();
        this.setupGeometry();
        this.resize();
        
        // Event listeners
        if (this.options.mouseInteractive) {
            this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
        }
        
        window.addEventListener('resize', this.resize.bind(this));
        
        // Démarrer l'animation
        this.animate();
    }
    
    setupShaders() {
        const vertex = `#version 300 es
        precision highp float;
        in vec2 position;
        in vec2 uv;
        out vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 0.0, 1.0);
        }`;
        
        const fragment = `#version 300 es
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform vec3 uCustomColor;
        uniform float uUseCustomColor;
        uniform float uSpeed;
        uniform float uDirection;
        uniform float uScale;
        uniform float uOpacity;
        uniform vec2 uMouse;
        uniform float uMouseInteractive;
        out vec4 fragColor;

        void mainImage(out vec4 o, vec2 C) {
            vec2 center = iResolution.xy * 0.5;
            C = (C - center) / uScale + center;
            
            vec2 mouseOffset = (uMouse - center) * 0.0002;
            C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
            
            float i, d, z, T = iTime * uSpeed * uDirection;
            vec3 O, p, S;

            for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
                p = z*normalize(vec3(C-.5*r,r.y)); 
                p.z -= 4.; 
                S = p;
                d = p.y-T;
                
                p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
                Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
                z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
                o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
            }
            
            o.xyz = tanh(O/1e4);
        }

        bool finite1(float x){ return !(isnan(x) || isinf(x)); }
        vec3 sanitize(vec3 c){
            return vec3(
                finite1(c.r) ? c.r : 0.0,
                finite1(c.g) ? c.g : 0.0,
                finite1(c.b) ? c.b : 0.0
            );
        }

        void main() {
            vec4 o = vec4(0.0);
            mainImage(o, gl_FragCoord.xy);
            vec3 rgb = sanitize(o.rgb);
            
            float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
            vec3 customColor = intensity * uCustomColor;
            vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
            
            float alpha = length(rgb) * uOpacity;
            fragColor = vec4(finalColor, alpha);
        }`;
        
        // Compiler les shaders
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertex);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragment);
        
        // Créer le programme
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Erreur de liaison du programme:', this.gl.getProgramInfoLog(this.program));
            return;
        }
        
        this.gl.useProgram(this.program);
        
        // Récupérer les emplacements des uniforms
        this.uniforms = {
            iTime: this.gl.getUniformLocation(this.program, 'iTime'),
            iResolution: this.gl.getUniformLocation(this.program, 'iResolution'),
            uCustomColor: this.gl.getUniformLocation(this.program, 'uCustomColor'),
            uUseCustomColor: this.gl.getUniformLocation(this.program, 'uUseCustomColor'),
            uSpeed: this.gl.getUniformLocation(this.program, 'uSpeed'),
            uDirection: this.gl.getUniformLocation(this.program, 'uDirection'),
            uScale: this.gl.getUniformLocation(this.program, 'uScale'),
            uOpacity: this.gl.getUniformLocation(this.program, 'uOpacity'),
            uMouse: this.gl.getUniformLocation(this.program, 'uMouse'),
            uMouseInteractive: this.gl.getUniformLocation(this.program, 'uMouseInteractive')
        };
        
        // Définir les valeurs initiales
        const customColorRgb = this.hexToRgb(this.options.color);
        this.gl.uniform3f(this.uniforms.uCustomColor, ...customColorRgb);
        this.gl.uniform1f(this.uniforms.uUseCustomColor, 1.0);
        this.gl.uniform1f(this.uniforms.uSpeed, this.options.speed * 0.4);
        this.gl.uniform1f(this.uniforms.uDirection, this.options.direction === 'reverse' ? -1.0 : 1.0);
        this.gl.uniform1f(this.uniforms.uScale, this.options.scale);
        this.gl.uniform1f(this.uniforms.uOpacity, this.options.opacity);
        this.gl.uniform2f(this.uniforms.uMouse, 0, 0);
        this.gl.uniform1f(this.uniforms.uMouseInteractive, this.options.mouseInteractive ? 1.0 : 0.0);
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Erreur de compilation du shader:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    setupGeometry() {
        // Triangle plein écran
        const positions = new Float32Array([
            -1, -1,
             3, -1,
            -1,  3
        ]);
        
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = rect.height - (e.clientY - rect.top); // Inverser Y pour WebGL
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uniforms.iResolution, this.canvas.width, this.canvas.height);
    }
    
    animate() {
        const currentTime = performance.now();
        const timeValue = (currentTime - this.startTime) * 0.001;
        
        this.gl.uniform1f(this.uniforms.iTime, timeValue);
        this.gl.uniform2f(this.uniforms.uMouse, this.mouse.x, this.mouse.y);
        
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        window.removeEventListener('resize', this.resize.bind(this));
    }
}

// Export pour utilisation
window.PlasmaBackground = PlasmaBackground;
