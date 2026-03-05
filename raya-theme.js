// Raya Theme Initializer - Three.js & Matter.js
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initMatterJS();

    // Ensure body background is transparent so the HTML background and canvas can show
    document.body.style.backgroundColor = 'transparent';
});

function initThreeJS() {
    const container = document.getElementById('raya-canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    // Three.js Scene Setup for Raya Moon and Stars
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffd700, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Create a 3D Crescent Moon
    const moonShape = new THREE.Shape();
    moonShape.absarc(0, 0, 4, 0, Math.PI * 2, false);
    const moonHole = new THREE.Path();
    moonHole.absarc(1.2, 1.2, 3.6, 0, Math.PI * 2, false);
    moonShape.holes.push(moonHole);

    const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
    };

    const moonGeometry = new THREE.ExtrudeGeometry(moonShape, extrudeSettings);
    // Gold/Yellow material
    const moonMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5be2d,
        metalness: 0.4,
        roughness: 0.3
    });

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    // Add some random 3D stars
    const stars = [];
    const starGeo = new THREE.OctahedronGeometry(0.2, 0);
    const starMat = new THREE.MeshStandardMaterial({
        color: 0xffe66d,
        metalness: 0.5,
        roughness: 0.2
    });

    for (let i = 0; i < 40; i++) {
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20 - 5
        );
        star.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        stars.push({ mesh: star, speed: Math.random() * 0.02 + 0.01 });
        scene.add(star);
    }

    // Responsive window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Float the moon gently
        moon.position.x = Math.sin(time) * 1.5;
        moon.position.y = Math.cos(time * 0.8) * 1;
        moon.rotation.y = time * 0.3;
        moon.rotation.x = Math.sin(time * 0.2) * 0.1;

        // Rotate and float stars
        stars.forEach(s => {
            s.mesh.rotation.x += s.speed;
            s.mesh.rotation.y += s.speed;
            s.mesh.position.y += Math.sin(time + s.speed * 100) * 0.01;
        });

        renderer.render(scene, camera);
    }
    animate();
}

function initMatterJS() {
    if (typeof Matter === 'undefined') return;

    // Matter.js alias
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

    // Create physics engine
    const engine = Engine.create();

    // Create renderer
    const container = document.getElementById('raya-canvas-container');
    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            background: 'transparent',
            wireframes: false
        }
    });

    // Add boundaries (bottom and sides)
    const thickness = 60;
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + thickness / 2 - 10, window.innerWidth, thickness, { isStatic: true, render: { visible: false } });
    const leftWall = Bodies.rectangle(0 - thickness / 2, window.innerHeight / 2, thickness, window.innerHeight * 2, { isStatic: true, render: { visible: false } });
    const rightWall = Bodies.rectangle(window.innerWidth + thickness / 2, window.innerHeight / 2, thickness, window.innerHeight * 2, { isStatic: true, render: { visible: false } });

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Colors for Ketupat/Stars
    const colors = ['#0b6a41', '#f5be2d', '#ffffff', '#138d5a'];

    // Spawn falling objects (Ketupat squares, Stars)
    function spawnObject(x, y) {
        if (!x) x = Math.random() * window.innerWidth;
        if (!y) y = -50;

        const isKetupat = Math.random() > 0.5;
        const color = colors[Math.floor(Math.random() * colors.length)];

        let body;
        if (isKetupat) {
            // Ketupat as a rotated square
            body = Bodies.rectangle(x, y, 25, 25, {
                restitution: 0.6,
                friction: 0.1,
                render: { fillStyle: color, strokeStyle: '#f5be2d', lineWidth: 2 }
            });
            Matter.Body.setAngle(body, Math.PI / 4);
        } else {
            // Polygon for star/gem 
            body = Bodies.polygon(x, y, 8, 12, {
                restitution: 0.8,
                friction: 0.1,
                render: { fillStyle: color }
            });
        }

        Composite.add(engine.world, body);

        // Remove after a while to prevent overflow
        setTimeout(() => {
            Composite.remove(engine.world, body);
        }, 15000);
    }

    // Spawn some objects initially
    for (let i = 0; i < 15; i++) {
        setTimeout(() => spawnObject(null, -Math.random() * 500), i * 300);
    }

    // Spawn periodically every few seconds
    setInterval(() => spawnObject(), 2000);

    // Listen to document clicks to spawn items! Interactive without blocking UI
    document.addEventListener('click', (e) => {
        // Find x, y
        spawnObject(e.clientX, e.clientY - 20);
    });

    // Run the engine and renderer
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Responsive adjustment
    window.addEventListener('resize', () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + thickness / 2 - 10 });
        Matter.Body.setPosition(rightWall, { x: window.innerWidth + thickness / 2, y: window.innerHeight / 2 });
    });

    // Adjust canvas CSS to ensure it behaves well
    render.canvas.style.position = 'absolute';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.zIndex = '1';
    render.canvas.style.pointerEvents = 'none'; // Don't block UI interactions
}
