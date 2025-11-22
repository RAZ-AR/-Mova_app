const canvas = document.getElementById('bubble-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Using a smaller offscreen canvas for performance and natural blur effect
const scaleFactor = 0.25;
const bgCanvas = document.createElement('canvas');
bgCanvas.width = width * scaleFactor;
bgCanvas.height = height * scaleFactor;
const bgCtx = bgCanvas.getContext('2d');

let blobs = [];

class Blob {
    constructor(type) {
        this.type = type; // 'base' or 'highlight'
        this.init();
    }

    init() {
        const isHighlight = this.type === 'highlight';

        // Base blobs are large, highlights are smaller
        this.radius = isHighlight
            ? (Math.random() * 0.2 + 0.1) * Math.min(width, height)
            : (Math.random() * 0.4 + 0.4) * Math.min(width, height);

        this.x = Math.random() * width;
        this.y = Math.random() * height;

        // Very slow, viscous movement
        this.vx = (Math.random() - 0.5) * (isHighlight ? 0.2 : 0.1);
        this.vy = (Math.random() - 0.5) * (isHighlight ? 0.2 : 0.1);

        this.color = this.pickColor(isHighlight);

        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.005;

        this.pulseSpeed = (Math.random() * 0.005 + 0.002);
        this.baseRadius = this.radius;
    }

    pickColor(isHighlight) {
        // Pastel color palette
        if (isHighlight) {
            const highlights = [
                'rgba(255, 255, 255, 0.7)',   // Soft white highlight
                'rgba(255, 240, 245, 0.6)',   // Lavender blush highlight
                'rgba(240, 255, 255, 0.6)',   // Azure highlight
                'rgba(240, 248, 255, 0.6)'    // Alice blue highlight
            ];
            return highlights[Math.floor(Math.random() * highlights.length)];
        } else {
            const bases = [
                '#FFDFD3', // Pastel Peach
                '#D4A5A5', // Pastel Pink
                '#A3D2CA', // Pastel Aqua
                '#5EAAA8', // Pastel Teal
                '#F0E68C', // Pastel Khaki
                '#CADCFC', // Pastel Periwinkle
                '#B2C2D8', // Pastel Blue
                '#C7CEEA', // Pastel Lavender
            ];
            return bases[Math.floor(Math.random() * bases.length)];
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angleSpeed;

        // Soft bounce off edges with a large margin to keep them on screen
        const margin = this.radius * 0.5;
        if (this.x < -margin) this.vx += 0.005;
        if (this.x > width + margin) this.vx -= 0.005;
        if (this.y < -margin) this.vy += 0.005;
        if (this.y > height + margin) this.vy -= 0.005;

        // Limit speed to keep it calm
        const maxSpeed = this.type === 'highlight' ? 0.4 : 0.2;
        this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
        this.vy = Math.max(-maxSpeed, Math.min(maxSpeed, this.vy));

        // Pulse radius for "breathing" effect
        this.radius = this.baseRadius + Math.sin(Date.now() * this.pulseSpeed) * (this.baseRadius * 0.15);
    }

    draw() {
        bgCtx.beginPath();
        const x = this.x * scaleFactor;
        const y = this.y * scaleFactor;
        const r = this.radius * scaleFactor;

        // Radial gradient for soft edges
        const grad = bgCtx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        bgCtx.fillStyle = grad;

        // Use 'screen' or 'overlay' for highlights to make them look like light
        if (this.type === 'highlight') {
            bgCtx.globalCompositeOperation = 'overlay';
        } else {
            bgCtx.globalCompositeOperation = 'source-over';
        }

        bgCtx.fill();
        bgCtx.globalCompositeOperation = 'source-over';
    }
}

let config;
let gui;

function createGUI() {
    if (gui) {
        gui.destroy();
    }
    gui = new dat.GUI();
    const animationFolder = gui.addFolder('Animation');
    animationFolder.add(config.animation, 'blur', 0, 200);
    animationFolder.add(config.animation, 'saturate', 0, 300);
    animationFolder.add(config.animation, 'base_blobs', 1, 20).step(1).onChange(init);
    animationFolder.add(config.animation, 'highlight_blobs', 1, 20).step(1).onChange(init);
    animationFolder.open();

    const mouseFolder = gui.addFolder('Mouse Interaction');
    mouseFolder.add(config.animation.mouse_interaction, 'enabled');
    mouseFolder.add(config.animation.mouse_interaction, 'distance', 50, 500);
    mouseFolder.add(config.animation.mouse_interaction, 'force', 0.01, 0.5);
    mouseFolder.open();

    gui.add({ save: () => {
        const a = document.createElement('a');
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
        a.download = 'config.json';
        a.click();
    }}, 'save').name('Save Config');

    gui.add({ load: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = readerEvent => {
                const content = readerEvent.target.result;
                config = JSON.parse(content);
                createGUI();
                init();
            }
        }
        input.click();
    }}, 'load').name('Load Config');

    gui.add({ reset: () => {
        fetch('config.json')
            .then(response => response.json())
            .then(data => {
                config = data;
                createGUI();
                init();
            });
    }}, 'reset').name('Reset to Default');
}

fetch('config.json')
    .then(response => response.json())
    .then(data => {
        config = data;
        createGUI();
        init();
        animate();
    });

function init() {
    blobs = [];
    // Base colors (Deep liquid)
    for (let i = 0; i < config.animation.base_blobs; i++) {
        blobs.push(new Blob('base'));
    }
    // Highlights (Glints and reflections)
    for (let i = 0; i < config.animation.highlight_blobs; i++) {
        blobs.push(new Blob('highlight'));
    }
}

function animate() {
    // Clear with a base color that matches the overall tone
    bgCtx.fillStyle = '#F5F5F5'; // White Smoke
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    blobs.forEach(blob => {
        blob.update();
        blob.draw();
    });

    ctx.clearRect(0, 0, width, height);

    // Heavy blur for the mesh gradient look
    ctx.filter = `blur(${config.animation.blur}px) saturate(${config.animation.saturate}%)`;
    ctx.drawImage(bgCanvas, 0, 0, width, height);
    ctx.filter = 'none';

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    bgCanvas.width = width * scaleFactor;
    bgCanvas.height = height * scaleFactor;
    init();
});


function handleMouseMove(event) {
    if (!config.animation.mouse_interaction.enabled) {
        return;
    }
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    blobs.forEach(blob => {
        const dx = blob.x - mouseX;
        const dy = blob.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.animation.mouse_interaction.distance) { // Only affect blobs close to the mouse
            const force = (config.animation.mouse_interaction.distance - distance) / config.animation.mouse_interaction.distance; // Force is stronger when closer
            blob.vx += (dx / distance) * force * config.animation.mouse_interaction.force;
            blob.vy += (dy / distance) * force * config.animation.mouse_interaction.force;
        }
    });
}

window.addEventListener('mousemove', handleMouseMove);