let dot;
var mouse = {x: 0, y: 0};
var trail = [];
let image;

async function asyncCall() {
const model = poseDetection.SupportedModels.BlazePose;
const detectorConfig = {
  runtime: 'mediapipe', // or 'tfjs'
  modelType: 'full'
};
detector = await poseDetection.createDetector(model, detectorConfig);
const poses = await detector.estimatePoses(image);
}

function setupTHREE() {
  // add your code here!

  // const video = document.getElementById('video');
  // const poses = await detector.estimatePoses(video);
  // (example)
  dot = new Dot(createVector(0,0,-5));
}

function updateTHREE() {
  // add your code here!

}

function getSphere() {
  let textureBlue = new THREE.TextureLoader().load( 'media/green.jpeg' );
  let geometry = new THREE.SphereGeometry(0.05, 32, 16);
  let material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: textureBlue } );
  let mesh = new THREE.Mesh(geometry, material);

  return mesh;
}


///// p5.js /////

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("container-p5");
  canvas.hide();
  background(50);
  image =  loadImage("/media/360city.jpeg");
  asyncCall();
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
  renderer = new THREE.WebGLRenderer();
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
  if (frame%2 == 0){
    //add a new dot
    let newDot, pos;
    // newDot = new Dot(dot.mesh.position);
    pos = createVector(dot.mesh.position.x,dot.mesh.position.y,0);
    newDot = new Dot(pos);
    newDot.update();
    trail.push(newDot);
  }
  if (trail.length > 100){
    let deaddot = trail.shift();
    scene.remove(deaddot.mesh);
  }
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

 // Make the sphere follow the mouse
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	dot.mesh.position.copy(pos);
	// Make the sphere follow the mouse
//	mouseMesh.position.set(event.clientX, event.clientY, 0);
};


class Dot{
  constructor(pos){
    this.pos = pos.copy();
    this.rot = createVector();
    this.rotAcc = createVector();
    this.mesh = getSphere();
    scene.add(this.mesh);
    this.lifespan = 100;
  }
  move(){
    this.vel.add(this.acce)
    this.pos.add(this.vel)
    this.lifespan -= 2
  }

  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }

  update(){
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
    // //
    // this.mesh.rotation.x = this.rot.x;
    // this.mesh.rotation.y = this.rotVel.y;
    // this.mesh.rotation.z = this.rotAcc.z;
  }


  isDead(){
    return this.lifespan < 0;
  }

  run(){
    this.move();
    this.rotate();
    this.update();
    // this.show();
  }

}
