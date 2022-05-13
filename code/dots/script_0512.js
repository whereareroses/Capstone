//pose detection
let cam;
let pose;
let detector;
//
let dot, dot2, par;
var mouse = {x: 0, y: 0};
var trail = trail2 = [];
var trailP = [];
let bodyTexture,wingTexture;
let butterfly1, butterfly0;
let textureBlue;
let lineWhite, lineBlue;
let pointCloud;
let arrayIndex = arrayIndex2 = arrayIndex3 = 0;
const MAX_POINTS = 200;
const WORLD_SIZE = 100;
const positions = new Float32Array( MAX_POINTS * 3 );
const positions2 = new Float32Array( (MAX_POINTS) * 3 );
const positions3 = new Float32Array( (MAX_POINTS) * 3 );
let positionsParticle = [];

function setupTHREE() {
  if(params['trailPattern'] == 0){
    dot = new Ico(createVector(0,0,0));
    dot2 = new Ico(createVector(0,0,0));
    bodyTexture = new THREE.TextureLoader().load("media/body.png");
    wingTexture = new THREE.TextureLoader().load('media/BUT-01.png');
    var bconf =
        { bodyTexture: bodyTexture, bodyW: 0.2, bodyH: 0.36, wingTexture: wingTexture, wingW: 0.3125, wingH: 0.469, wingX: 0.18 };
    butterfly0 = new Butterfly(createVector(10,10,0), bconf);
    // butterfly1 = new Butterfly(createVector(10,10,0), bconf);

    butterfly0.mesh.children[0].autoUpdateMatrix = false;
    butterfly0.mesh.children[1].autoUpdateMatrix = false;

    // butterfly1.mesh.children[0].autoUpdateMatrix = false;
    // butterfly1.mesh.children[1].autoUpdateMatrix = false;
  }

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
  geometry.computeBoundingSphere();
  geometry2.computeBoundingSphere();

  // material
  const materialWhite = new THREE.LineBasicMaterial( { color: 0xffffff} );
  const materialBlue = new THREE.LineDashedMaterial( { color: 0x87cefa, dashSize: 3, gapSize: 1, } );

  // line
  lineWhite = new THREE.Line( geometry, materialWhite );
  lineBlue = new THREE.LineSegments( geometry2, materialBlue );
  lineBlue.computeLineDistances();

  //white
  positions[arrayIndex ++] = 0;
  positions[arrayIndex ++] = 0;
  positions[arrayIndex ++] = 0;

  //blue
  positions2[arrayIndex2 ++] = 0;
  positions2[arrayIndex2 ++] = 0;
  positions2[arrayIndex2 ++] = 0;


  scene.add( lineWhite );
  scene.add( lineBlue );

  for (let z = -WORLD_SIZE / 2; z < WORLD_SIZE / 2; z += 0.5) {
    for (let x = -WORLD_SIZE / 2; x < WORLD_SIZE / 2; x += 0.5) {
      let tParticle = new Position()
        .setPosition(x, -10, z)
      positionsParticle.push(tParticle);
    }
  }

  pointCloud = getPoints(positionsParticle);
  scene.add(pointCloud);


}

function updateTHREE() {
  lineWhite.geometry.attributes.position.needsUpdate = true;
  lineBlue.geometry.attributes.position.needsUpdate = true;

  if (arrayIndex >= MAX_POINTS*3){
    arrayIndex = 0;
  }
  if (arrayIndex2 >= MAX_POINTS*3){
    arrayIndex2 = 0;
  }

for (let i = 0; i < positionsParticle.length; i++) {
  let p = positionsParticle[i];
  p.fluctuate();
}

let positionArray = pointCloud.geometry.attributes.position.array;
for (let i = 0; i < positionsParticle.length; i++) {
  let p = positionsParticle[i];
  let ptIndex = i * 3;
  positionArray[ptIndex + 0] = p.pos.x;
  positionArray[ptIndex + 1] = p.pos.y;
  positionArray[ptIndex + 2] = p.pos.z;
}
pointCloud.geometry.setDrawRange(0, positionsParticle.length); // ***
pointCloud.geometry.attributes.position.needsUpdate = true;

}


function trailChanged(){
  if(params['trailPattern'] == 0){
    for (let i =0; i<trailP.length; i++){scene.remove(trailP[i].mesh);}
    scene.remove(par.mesh)
    scene.add(butterfly1.mesh);  }
  if(params['trailPattern'] == 1){
    par = new Par(createVector(0,0,-5));
    for (let i =0; i<trail.length; i++){
      scene.remove(trail[i].mesh);
    }
    scene.remove(butterfly1.mesh);
    scene.remove(dot.mesh)
  }
}


function getIco() {
  textureBlue = new THREE.TextureLoader().load( 'media/longpic.jpeg' );
  let geometry = new THREE.IcosahedronGeometry(Math.random()*0.1);
  let material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: textureBlue } );
  let mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getPar() {
	const positions = [];
	const colors = [];

	for ( let i = 0; i < 50; i ++ ) {
  let x = Math.random();
  let y = Math.random()-0.5;
      if(x>0.9||x<-0.9){
        positions.push((Math.random()-y), (Math.random()+y) , (Math.random()-y));
        colors.push(params['particleColor'][0]/255, params['particleColor'][1]/255, params['particleColor'][2]/255);
      }else if(x>0.8||x<-0.8){
        positions.push((Math.random()-y)/2, (Math.random()+y)/2 , (Math.random()-y)/2);
        colors.push(params['particleColor2'][0]/255, params['particleColor2'][1]/255, params['particleColor2'][2]/255);
      }else{
        positions.push((Math.random()-y)/15, (Math.random()+y)/15 , (Math.random()-y)/15);
        colors.push(params['particleColor3'][0]/255, params['particleColor3'][1]/255, params['particleColor3'][2]/255);
      }
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	const material = new THREE.PointsMaterial( { size: 4, vertexColors: true, depthTest: false, sizeAttenuation: false } );

	const mesh = new THREE.Points( geometry, material );

  return mesh;
}

function getPoints(objects) {
  const vertices = [];
  for (let obj of objects) {
    vertices.push(obj.pos.x, obj.pos.y, obj.pos.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const drawCount = objects.length; // draw the whole objects
  geometry.setDrawRange(0, drawCount);
  // material
  const texture = new THREE.TextureLoader().load('media/particle_texture.jpg');
  const material = new THREE.PointsMaterial({
    color: 0x6ae0f7,
    size: 0.1,
    sizeAttenuation: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    map: texture
  });
  // Points
  const points = new THREE.Points(geometry, material);
  return points;
}

///// p5.js /////

function setup() {
  cam = createCapture(VIDEO);
  cam.hide();
  let canvas = createCanvas(640, 480);
  canvas.parent("container-p5");
  canvas.hide();
  background(50);
  initTHREE();
}

function draw() {
  noLoop();
}

async function loadPoseDetectionModel() {
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: "tfjs",
    enableSmoothing: true,
    modelType: "full",
  };
  detector = await poseDetection.createDetector(model, detectorConfig);
  console.log("Model Loaded!");

  // initiate the estimation
  getPoses();
}

async function getPoses() {
  const estimationConfig = { flipHorizontal: true };
  const timestamp = performance.now();
  const poses = await detector.estimatePoses(
    cam.elt,
    estimationConfig,
    timestamp
  );

  // get the first pose
  pose = poses[0];

  // repeat the estimation
  getPoses();
}
///// three.js /////

let container, stats, gui, params;
let scene, camera, renderer;
let time = 0;
let frame = 0;
let firsttime = true;

function initTHREE() {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color().setRGB( 0, 0, 0 );

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
    trailPattern: 0,
    // background: 1,
    particleColor: [0,111,255],
    particleColor2:[104, 168, 252],
    particleColor3:[217, 233, 255]
  };
  gui.add(params, "trailPattern", { icowbutterfly: 0, particles: 1}).onChange(trailChanged);
  // gui.add(params, "background", { blue: 0, island: 1, terrain: 2, red:3}).onChange(backgroundChanged);
  gui.addColor(params, "particleColor");
  gui.addColor(params, "particleColor2");
  gui.addColor(params, "particleColor3");

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

  if (cam.loadedmetadata & firsttime){
    loadPoseDetectionModel();
    firsttime = false;
    console.log("Video Loaded!")
  }

  if(pose){locationUpdate();}

  if(params['trailPattern'] == 0){
    if (frame%2 == 0){
      //add a new dot
      let newDot, pos, newDot2, pos2;
      pos = createVector(dot.mesh.position.x,dot.mesh.position.y,dot.mesh.position.z);
      pos2 = createVector(dot2.mesh.position.x,dot2.mesh.position.y,dot2.mesh.position.z);
      newDot = new Ico(pos);
      newDot2 = new Ico(pos2);
      newDot.update();
      newDot2.update();
      trail.push(newDot);
      trail2.push(newDot2);
    }
  if (trail.length > 100){
    let deaddot = trail.shift();
    let deaddot2 = trail2.shift();
    scene.remove(deaddot.mesh);
    scene.remove(deaddot2.mesh);
  }
  butterfly0.mesh.rotation.x = Math.PI/4;
  butterfly0.mesh.children[1].rotation.y = Math.sin(frame / 10);
  butterfly0.mesh.children[2].rotation.y = Math.sin(- frame / 10);
  // butterfly1.mesh.rotation.x = Math.PI/4;
  // butterfly1.mesh.children[1].rotation.y = Math.sin(frame / 10);
  // butterfly1.mesh.children[2].rotation.y = Math.sin(- frame / 10);
}
if(params['trailPattern'] == 1 && par){
  let newPar, pos2;
  pos2 = createVector(par.mesh.position.x,par.mesh.position.y,0);
  newPar = new Par(pos2);
  newPar.update();
  trailP.push(newPar);
  if (trailP.length > 100){
    let deadPar = trailP.shift();
    scene.remove(deadPar.mesh);
  }
}
  updateTHREE();

  render();
}

function render() {
  renderer.render(scene, camera);
}

// event listeners
window.addEventListener("resize", onWindowResize);
// document.addEventListener('mousemove', onMouseMove, false);



function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function locationUpdate(){

  var pos = new THREE.Vector3 (-pose.keypoints3D[15].x*5,-pose.keypoints3D[15].y*5,-pose.keypoints3D[15].z*5);
  var pos2 = new THREE.Vector3 (-pose.keypoints3D[16].x*5,-pose.keypoints3D[16].y*5,-pose.keypoints3D[16].z*5);
  var posNose = new THREE.Vector3 (-pose.keypoints3D[0].x*5,-pose.keypoints3D[0].y*5,-pose.keypoints3D[0].z*5);
  var posFootL = new THREE.Vector3 (-pose.keypoints3D[27].x*5,-pose.keypoints3D[27].y*5,-pose.keypoints3D[27].z*5);
  var posFootR = new THREE.Vector3 (-pose.keypoints3D[28].x*5,-pose.keypoints3D[28].y*5,-pose.keypoints3D[28].z*5);

  if(params['trailPattern'] == 0){
    dot.mesh.position.copy(posFootL);
    dot2.mesh.position.copy(posFootR);

    butterfly0.applyDestination(posNose.x, posNose.y, posNose.z);
    butterfly0.move();
    butterfly0.update();
  }
  if(params['trailPattern'] == 1 && par){
    par.mesh.position.copy(pos);}
    positions[arrayIndex ++] = pos.x;
    positions[arrayIndex ++] = pos.y;
    positions[arrayIndex ++] = pos.z;
    positions2[arrayIndex ++] = pos2.x;
    positions2[arrayIndex ++] = pos2.y;
    positions2[arrayIndex ++] = pos2.z;


    // positions2[arrayIndex2 ++] = positions[arrayIndex2]+0.5;
    // positions2[arrayIndex2 ++] = positions[arrayIndex2+1]+0.5;
    // positions2[arrayIndex2 ++] = positions[arrayIndex2+2];

    // positions3[arrayIndex3 ++] = positions[arrayIndex3]-0.5;
    // positions3[arrayIndex3 ++] = positions[arrayIndex3+1]-0.5;
    // positions3[arrayIndex3 ++] = positions[arrayIndex3+2];
}


function butterfly(bconf){
  var geometry = new THREE.PlaneGeometry(bconf.wingW, bconf.wingH);
  var material = new THREE.MeshBasicMaterial({ transparent: true, map: bconf.wingTexture, side: THREE.DoubleSide, depthTest: false });
  var lwmesh = new THREE.Mesh(geometry, material);
  lwmesh.position.x = -bconf.wingX;
  lwmesh.position.y = -0.07;
  let lwing = new THREE.Object3D();
  lwing.add(lwmesh);

  var rwmesh = new THREE.Mesh(geometry, material);
  rwmesh.rotation.y = Math.PI;
  rwmesh.position.y = -0.07;
  rwmesh.position.x = bconf.wingX;
  let rwing = new THREE.Object3D();
  rwing.add(rwmesh);

  geometry = new THREE.PlaneGeometry(bconf.bodyW, bconf.bodyH);
  material = new THREE.MeshBasicMaterial({ transparent: true, map: bconf.bodyTexture, side: THREE.DoubleSide, depthTest: false });
  let body = new THREE.Mesh(geometry, material);

  let group = new THREE.Object3D();
  group.add(body);
  group.add(lwing);
  group.add(rwing);
  // group.rotation.x = Math.PI / 2;
  // group.rotation.y = Math.PI;
  group.scale.set(0.5,0.5,0.5);
  return group
}




class Ico{
  constructor(pos){
    this.pos = pos.copy();
    this.mesh = getIco();
    scene.add(this.mesh);
    this.lifespan = 100;
  }
  update(){
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
  }
  isDead(){
    return this.lifespan < 0;
  }
}

class Butterfly{
  constructor(pos, bconf){
    this.pos = pos.copy();
    this.vel = createVector(0,0,0);
    this.rot = createVector(0,0,0);
    this.acc = createVector(0,0,0);
    this.mesh = butterfly(bconf);
    this.destination = createVector(0,0,0);
    scene.add(this.mesh);
  }
  applyForce(f) {
  let force = f.copy();
  force.div(10);
  this.acc.add(force);
  }
  applyDestination(x,y,z){
    this.destination.x = x;
    this.destination.y = y;
    this.destination.z = z;

  }
  move(){
    let force = p5.Vector.sub(this.destination, this.pos);
    force.mult(0.005);
    this.applyForce(force);
    this.vel.add(this.acc); // vel = vel + acc;
    this.pos.add(this.vel); // pos = pos + vel;
    this.acc.mult(0);

    this.vel.mult(0.97); // -3% per frame
  }
  rotate() {
    let force = p5.Vector.sub(this.destination, this.pos);
    force.mult(0.1);
    this.rot = force;
  }
  update(){
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
    // //
    this.mesh.rotation.x = this.rot.x;
    this.mesh.rotation.z = this.rot.z;
  }
}


class Par{
  constructor(pos){
    this.pos = pos.copy();
    this.rot = createVector();
    this.rotAcc = createVector();
    this.mesh = getPar();
    scene.add(this.mesh);
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
}
class Position {
  constructor() {
    this.originPos = createVector();
    this.pos = createVector();
  }
  setPosition(x, y, z) {
    this.originPos = createVector(x, y, z);
    this.pos = createVector(x, y, z);
    return this;
  }
  fluctuate() {
    let xFreq = this.pos.x * 0.1 + frame * 0.002;
    let zFreq = this.pos.z * 0.1 + frame * 0.002;
    let yOffset = noise(xFreq, zFreq) * 10;
    this.pos.y = this.originPos.y + yOffset;
  }
}
