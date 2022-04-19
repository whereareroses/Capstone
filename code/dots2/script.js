let dot;
var mouse = {x: 0, y: 0};
var trail = [];
let image;


function setupTHREE() {
  // const video = document.getElementById('video');
  // const poses = await detector.estimatePoses(video);
  // (example)
  dot = new Dot(createVector(0,0,-5));
}

function updateTHREE() {
  // add your code here!

}

function getSphere() {

  // let geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  // let material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
  // let mesh = new THREE.Mesh(geometry, material);
  const colorArray = [ new THREE.Color( 0xd9e9ff ), new THREE.Color( 0x68a8fc ), new THREE.Color( 0x006fff ) ];
	const positions = [];
	const colors = [];

	for ( let i = 0; i < 50; i ++ ) {
  let x = Math.random();
      if(x>0.9||x<-0.9){
        positions.push((Math.random()-1)*3, (Math.random()+0.5)*3 , (Math.random()-0.5)*3);
        colors.push(colorArray[2].r, colorArray[2].g, colorArray[2].b);
      }else if(x>0.8||x<-0.8){
        positions.push((Math.random()-1), (Math.random()+0.5) , (Math.random()-0.5));
        colors.push(colorArray[1].r, colorArray[1].g, colorArray[1].b);
      }else{
        positions.push((Math.random()-1)/4, (Math.random()+0.5)/4 , (Math.random()-0.5)/4);
        colors.push(colorArray[0].r, colorArray[0].g, colorArray[0].b);
      }


	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	const material = new THREE.PointsMaterial( { size: 4, vertexColors: true, depthTest: false, sizeAttenuation: false } );

	const mesh = new THREE.Points( geometry, material );

  return mesh;
}


///// p5.js /////

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("container-p5");
  canvas.hide();
  background(50);
  image =  loadImage("media/360city.jpeg");
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

  let newDot, pos;
  pos = createVector(dot.mesh.position.x,dot.mesh.position.y,0);
  newDot = new Dot(pos);
  newDot.update();
  trail.push(newDot);
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
