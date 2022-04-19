let lineWhite, lineBlue, linePurple;
let arrayIndex = arrayIndex2 = arrayIndex3 = 0;
var mouse = {x: 0, y: 0};
let image;
const MAX_POINTS = 200;
const positions = new Float32Array( MAX_POINTS * 3 );
const positions2 = new Float32Array( (MAX_POINTS) * 3 );
const positions3 = new Float32Array( (MAX_POINTS) * 3 );


function setupTHREE() {
  // geometry
  const geometry = new THREE.BufferGeometry();
  const geometry2 = new THREE.BufferGeometry();
  const geometry3 = new THREE.BufferGeometry();

  // attributes
  geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry2.setAttribute( 'position', new THREE.BufferAttribute( positions2, 3 ) );
  geometry3.setAttribute( 'position', new THREE.BufferAttribute( positions3, 3 ) );

  // draw range
  const drawCount = MAX_POINTS; // draw the first 2 points, only
  geometry.setDrawRange( 0, drawCount );
  geometry2.setDrawRange( 0, drawCount );
  geometry3.setDrawRange( 0, drawCount);
  geometry.computeBoundingSphere();
  geometry2.computeBoundingSphere();
  geometry3.computeBoundingSphere();

  // material
  const materialWhite = new THREE.LineBasicMaterial( { color: 0xffffff} );
  const materialBlue = new THREE.LineDashedMaterial( { color: 0x87cefa, dashSize: 3, gapSize: 1, } );
  const materialPurple = new THREE.LineDashedMaterial( { color: 0xE0B0FF, dashSize: 0.5, gapSize: 0.1, } );

  // line
  lineWhite = new THREE.Line( geometry, materialWhite );
  lineBlue = new THREE.LineSegments( geometry2, materialBlue );
    lineBlue.computeLineDistances();
  linePurple = new THREE.LineSegments( geometry3, materialPurple );
    linePurple.computeLineDistances();
  //white
  positions[arrayIndex ++] = 0;
  positions[arrayIndex ++] = 0;
  positions[arrayIndex ++] = 0;

  positions[arrayIndex ++] = 0;
  positions[arrayIndex ++] = 0;
  positions[arrayIndex ++] = 0;

  positions[arrayIndex ++] = 0;
  positions[arrayIndex ++] = 0;
  positions[arrayIndex ++] = 0;

  //blue
  positions2[arrayIndex2 ++] = 0;
  positions2[arrayIndex2 ++] = 0;
  positions2[arrayIndex2 ++] = 0;

  positions2[arrayIndex2 ++] = 0;
  positions2[arrayIndex2 ++] = 0;
  positions2[arrayIndex2 ++] = 0;

  //purple
  positions3[arrayIndex3 ++] = 0;
  positions3[arrayIndex3 ++] = 0;
  positions3[arrayIndex3 ++] = 0;

  scene.add( lineWhite );
  scene.add( lineBlue );
  scene.add( linePurple );

}

function updateTHREE() {
  // add your code here!
  lineWhite.geometry.attributes.position.needsUpdate = true;
  lineBlue.geometry.attributes.position.needsUpdate = true;
  linePurple.geometry.attributes.position.needsUpdate = true;

  if (arrayIndex >= MAX_POINTS*3){
    arrayIndex = 0;
  }
  if (arrayIndex2 >= MAX_POINTS*3){
    arrayIndex2 = 0;
  }
  if (arrayIndex3 >= MAX_POINTS*3){
    arrayIndex3 = 0;
  }

}


///// p5.js /////

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("container-p5");
  canvas.hide();
  background(50);
  initTHREE();
}

function draw() {
  noLoop();
}

///// three.js /////

let container, stats, gui, params;
let scene, camera, renderer;
let time = 0;
let frame = 0;

function initTHREE() {
  // scene
  scene = new THREE.Scene();

  // camera (fov, ratio, near, far)
  var screenWidth = window.innerWidth,
      screenHeight = window.innerHeight,
      viewAngle = 75,
      nearDistance = 0.1,
      farDistance = 1000;
  camera = new THREE.PerspectiveCamera(viewAngle, screenWidth / 	screenHeight, nearDistance, farDistance);
  scene.add(camera);
  camera.position.set(0, 0, 5);
  camera.lookAt(scene.position);

  // renderer
  renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true } );
  renderer.setClearColor("#333333");
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(screenWidth, screenHeight);

  // container
  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);

  // controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  // gui
  // https://davidwalsh.name/dat-gui
  gui = new dat.gui.GUI();
  params = {
    value1: 0,
    value2: 0,
    value3: 0
  };
  gui.add(params, "value1", -10, 10).step(10);
  gui
    .add(params, "value2")
    .min(-10)
    .max(10)
    .step(10);
  // .listen()
  // .onChange(callback)
  let folder = gui.addFolder("FolderName");
  folder.add(params, "value3", -10, 10).step(1);

  // stats
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  container.appendChild(stats.dom);

  setupTHREE();

  // let's draw!
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  stats.update();
  time = performance.now();
  frame++;

  updateTHREE();

  render();
}

function render() {
  renderer.render(scene, camera);
}

// event listeners
window.addEventListener("resize", onWindowResize);
document.addEventListener('mousemove', onMouseMove, false);



function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
	// Update the mouse variable
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
  positions[arrayIndex ++] = pos.x;
  positions[arrayIndex ++] = pos.y;
  positions[arrayIndex ++] = pos.z;

  positions2[arrayIndex2 ++] = positions[arrayIndex2]+0.5;
  positions2[arrayIndex2 ++] = positions[arrayIndex2+1]+0.5;
  positions2[arrayIndex2 ++] = positions[arrayIndex2+2];

  positions3[arrayIndex3 ++] = positions[arrayIndex3]-0.5;
  positions3[arrayIndex3 ++] = positions[arrayIndex3+1]-0.5;
  positions3[arrayIndex3 ++] = positions[arrayIndex3+2];

//	mouseMesh.position.set(event.clientX, event.clientY, 0);
};
