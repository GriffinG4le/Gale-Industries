import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
});

// Configure renderer and camera position
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 1, 5); // Positioning camera a bit higher and farther back

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1; // Minimum zoom distance to prevent excessive zoom in
controls.maxDistance = 15; // Maximum zoom distance to prevent zooming too far out
controls.target.set(0, 0, 0); // Focus on model center

// Define the model type
interface JetModel {
    name: string;
    range: string;
    speed: string;
    capacity: string;
}

// Define models with an index signature
const models: { [key: string]: JetModel } = {
    'caravanwzip.glb': { name: 'Cessna', range: '2000 km', speed: '200 knots', capacity: '12 seats' },
    'ravenzip.glb': { name: 'Robinson R44', range: '500 km', speed: '130 knots', capacity: '4 seats' },
    'pilatus_pc_1247.glb': { name: 'Pilatus PC12', range: '3000 km', speed: '180 knots', capacity: '8 seats' },
};

let currentJet: THREE.Group | null = null;

// Load a jet model
function loadJetModel(modelName: string) {
    if (currentJet) {
        scene.remove(currentJet); // Remove current jet if any
    }

    const loader = new GLTFLoader();
    loader.load(
        `models/${modelName}`,
        (gltf) => {
            currentJet = gltf.scene;
            gltf.scene.position.set(0, -1, 0); // Keep model at a centered position
            gltf.scene.scale.set(0.1, 0.1, 0.1); // Scale down for better visibility
            scene.add(currentJet);
            
            // Update controls target to keep the model centered
            controls.target.copy(gltf.scene.position);
            
            // Log model details
            const jetDetails = models[modelName];
            console.log(`Loaded model: ${jetDetails.name}, Range: ${jetDetails.range}, Speed: ${jetDetails.speed}, Capacity: ${jetDetails.capacity}`);
        },
        undefined,
        (error) => console.error(error)
    );
}

// Attach the function to the window object
(window as any).loadJetModel = loadJetModel;

// Add ambient and directional lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Render loop
function animate(): void {
    requestAnimationFrame(animate);
    controls.update(); // Update controls to keep smooth animation
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Call loadJetModel when the script loads to test loading
loadJetModel('caravanwzip.glb');
