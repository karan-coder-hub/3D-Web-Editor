// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 500/400, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(500, 400);

document.getElementById("canvasContainer").appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 3;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Controls
const colorPicker = document.getElementById("colorPicker");
colorPicker.addEventListener("input", (e) => {
  cube.material.color.set(e.target.value);
});

const rotateRange = document.getElementById("rotateRange");
rotateRange.addEventListener("input", (e) => {
  cube.rotation.y = e.target.value * (Math.PI / 180);
});

const scaleRange = document.getElementById("scaleRange");
scaleRange.addEventListener("input", (e) => {
  const scale = parseFloat(e.target.value);
  cube.scale.set(scale, scale, scale);
});
