const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1b2a);

const camera = new THREE.PerspectiveCamera(75, 500 / 400, 0.1, 1000);
camera.position.set(0, 1, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(500, 400);
renderer.shadowMap.enabled = true;
document.getElementById("canvasContainer").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
dirLight.position.set(4, 6, 5);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x7dd3fc, 1.3, 20);
pointLight.position.set(-4, 2, 3);
scene.add(pointLight);

const objects = [];
let selectedObject = null;
let loadedFont = null;

const fontLoader = new THREE.FontLoader();
fontLoader.load(
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
  (font) => {
    loadedFont = font;
    addTextMesh(document.getElementById("textInput").value || "3D Fun");
  }
);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshPhongMaterial({ color: 0x1e293b, shininess: 10 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.2;
scene.add(floor);

const grid = new THREE.GridHelper(20, 20, 0x94a3b8, 0x334155);
grid.position.y = -2.19;
scene.add(grid);

function createMaterial(color) {
  return new THREE.MeshPhongMaterial({
    color,
    shininess: 120,
    emissive: new THREE.Color(color).multiplyScalar(0.15)
  });
}

function randomPosition() {
  return {
    x: (Math.random() - 0.5) * 5,
    y: (Math.random() - 0.5) * 2,
    z: (Math.random() - 0.5) * 2
  };
}

function addObject(mesh) {
  const pos = randomPosition();
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
  objects.push(mesh);
  selectObject(mesh);
  refreshDragControls();
}

function createShapeGeometry(shapeType) {
  switch (shapeType) {
    case "sphere":
      return new THREE.SphereGeometry(0.7, 32, 32);
    case "cone":
      return new THREE.ConeGeometry(0.6, 1.2, 32);
    case "cylinder":
      return new THREE.CylinderGeometry(0.55, 0.55, 1.2, 32);
    case "torus":
      return new THREE.TorusGeometry(0.6, 0.2, 16, 100);
    case "octahedron":
      return new THREE.OctahedronGeometry(0.75);
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function addShape(shapeType) {
  const color = document.getElementById("colorPicker").value;
  const mesh = new THREE.Mesh(createShapeGeometry(shapeType), createMaterial(color));
  addObject(mesh);
}

function addIcon(icon) {
  if (!loadedFont) {
    return;
  }

  const iconGeometry = new THREE.TextGeometry(icon, {
    font: loadedFont,
    size: 0.8,
    height: 0.25,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 5
  });
  iconGeometry.center();

  const iconMesh = new THREE.Mesh(
    iconGeometry,
    createMaterial(document.getElementById("colorPicker").value)
  );
  addObject(iconMesh);
}

function addTextMesh(textValue) {
  if (!loadedFont || !textValue.trim()) {
    return;
  }

  const textGeometry = new THREE.TextGeometry(textValue.trim(), {
    font: loadedFont,
    size: 0.5,
    height: 0.22,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.018,
    bevelSegments: 5
  });
  textGeometry.center();

  const hue = Math.floor(Math.random() * 360);
  const textColor = `hsl(${hue}, 100%, 60%)`;
  const textMesh = new THREE.Mesh(textGeometry, createMaterial(textColor));
  addObject(textMesh);
}

function selectObject(object) {
  selectedObject = object;
  const hex = `#${object.material.color.getHexString()}`;
  document.getElementById("colorPicker").value = hex;
  document.getElementById("scaleRange").value = object.scale.x.toFixed(1);
}

let dragControls = null;
function refreshDragControls() {
  if (dragControls) {
    dragControls.deactivate();
    dragControls.dispose();
  }

  dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
  dragControls.addEventListener("dragstart", (event) => {
    selectedObject = event.object;
    renderer.domElement.style.cursor = "grabbing";
  });
  dragControls.addEventListener("dragend", () => {
    renderer.domElement.style.cursor = "grab";
  });
}

renderer.domElement.style.cursor = "grab";

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(objects);
  if (hits.length > 0) {
    selectObject(hits[0].object);
  }
});

function animate() {
  requestAnimationFrame(animate);

  objects.forEach((mesh) => {
    if (mesh !== selectedObject) {
      mesh.rotation.y += 0.004;
    }
  });

  renderer.render(scene, camera);
}

addShape("box");
animate();

document.getElementById("addShapeBtn").addEventListener("click", () => {
  addShape(document.getElementById("shapeSelect").value);
});

document.getElementById("addIconBtn").addEventListener("click", () => {
  addIcon(document.getElementById("iconSelect").value);
});

document.getElementById("addTextBtn").addEventListener("click", () => {
  addTextMesh(document.getElementById("textInput").value);
});

document.getElementById("colorPicker").addEventListener("input", (event) => {
  if (selectedObject) {
    selectedObject.material.color.set(event.target.value);
  }
});

document.getElementById("rotateRange").addEventListener("input", (event) => {
  if (selectedObject) {
    selectedObject.rotation.y = Number(event.target.value) * (Math.PI / 180);
  }
});

document.getElementById("scaleRange").addEventListener("input", (event) => {
  if (selectedObject) {
    const scale = Number(event.target.value);
    selectedObject.scale.set(scale, scale, scale);
  }
});
