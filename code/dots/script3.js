const nbButterflies = 100;
var conf, scene, camera, cameraCtrl, light, renderer;
var whw, whh;

var butterflies;
var bodyTexture, wingTexture;
var destination = new THREE.Vector3();

var mouse = new THREE.Vector2();
var mouseOver = false;
var mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var mousePosition = new THREE.Vector3();
var raycaster = new THREE.Raycaster();

function init() {
  conf = {
    attraction: 0.03,
    velocityLimit: 1.2,
    move: true,
    followMouse: true,
    shuffle: shuffle
  };

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  cameraCtrl = new THREE.OrbitControls(camera);




  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  stats = new Stats();
  document.body.appendChild(stats.dom);

  initScene();


  const gui = new dat.GUI();
  gui.add(conf, 'move');
  gui.add(conf, 'followMouse');
  gui.add(conf, 'attraction', 0.01, 0.1);
  gui.add(conf, 'velocityLimit', 0.1, 2);
  gui.add(conf, 'shuffle');

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);

  document.addEventListener('mousemove', onMouseMove, false);
  // document.addEventListener('mouseover', function () { mouseOver = true; }, false);
  document.addEventListener('mouseout', function () { mouseOver = false; }, false);

  animate();
};

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.TextureLoader().load('https://i.imgur.com/e0JevQH.jpg');

  camera.position.z = 75;

  bodyTexture = new THREE.TextureLoader().load('https://www.iutbayonne.univ-pau.fr/~klevron/nabpi/three/b1.png');
  wingTexture1 = new THREE.TextureLoader().load('https://www.iutbayonne.univ-pau.fr/~klevron/nabpi/three/b1w.png');
  wingTexture2 = new THREE.TextureLoader().load('https://www.iutbayonne.univ-pau.fr/~klevron/nabpi/three/b2w.png');
  wingTexture3 = new THREE.TextureLoader().load('https://www.iutbayonne.univ-pau.fr/~klevron/nabpi/three/b3w.png');

  butterflies = [];
  for (var i = 0; i < nbButterflies; i++) {
    var b = new Butterfly();
    butterflies.push(b);
    scene.add(b.o3d);
  }

  shuffle();
}

function animate() {
  requestAnimationFrame(animate);

  TWEEN.update();

  cameraCtrl.update();

  if (conf.move) {
    for (var i = 0; i < butterflies.length; i++) {
      butterflies[i].move();
    }
  }

  renderer.render(scene, camera);

  stats.update();
};

function shuffle() {
  for (var i = 0; i < butterflies.length; i++) {
    butterflies[i].shuffle();
  }
}

function Butterfly() {
  this.minWingRotation = -Math.PI / 6;
  this.maxWingRotation = Math.PI / 2 - 0.1;
  this.wingRotation = 0;

  this.velocity = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true));
  this.destination = destination;

  var confs = [
    { bodyTexture: bodyTexture, bodyW: 10, bodyH: 15, wingTexture: wingTexture1, wingW: 10, wingH: 15, wingX: 5.5 },
    { bodyTexture: bodyTexture, bodyW: 6, bodyH: 9, wingTexture: wingTexture2, wingW: 15, wingH: 20, wingX: 7.5 },
    { bodyTexture: bodyTexture, bodyW: 8, bodyH: 12, wingTexture: wingTexture3, wingW: 10, wingH: 15, wingX: 5.5 },
  ];

  this.init(confs[Math.floor(rnd(3))]);
}

Butterfly.prototype.init = function (bconf) {
  var geometry = new THREE.PlaneGeometry(bconf.wingW, bconf.wingH);
  var material = new THREE.MeshBasicMaterial({ transparent: true, map: bconf.wingTexture, side: THREE.DoubleSide, depthTest: false });
  var lwmesh = new THREE.Mesh(geometry, material);
  lwmesh.position.x = -bconf.wingX;
  this.lwing = new THREE.Object3D();
  this.lwing.add(lwmesh);

  var rwmesh = new THREE.Mesh(geometry, material);
  rwmesh.rotation.y = Math.PI;
  rwmesh.position.x = bconf.wingX;
  this.rwing = new THREE.Object3D();
  this.rwing.add(rwmesh);

  geometry = new THREE.PlaneGeometry(bconf.bodyW, bconf.bodyH);
  material = new THREE.MeshBasicMaterial({ transparent: true, map: bconf.bodyTexture, side: THREE.DoubleSide, depthTest: false });
  this.body = new THREE.Mesh(geometry, material);
  // this.body.position.z = -0.1;

  this.group = new THREE.Object3D();
  this.group.add(this.body);
  this.group.add(this.lwing);
  this.group.add(this.rwing);
  this.group.rotation.x = Math.PI / 2;
  this.group.rotation.y = Math.PI;

  this.setWingRotation(this.wingRotation);
  this.initTween();

  this.o3d = new THREE.Object3D();
  this.o3d.add(this.group);
};

Butterfly.prototype.initTween = function () {
  var duration = limit(conf.velocityLimit - this.velocity.length(), 0.1, 1.5) * 1000;
  this.wingRotation = this.minWingRotation;
  this.tweenWingRotation = new TWEEN.Tween(this)
    .to({ wingRotation: this.maxWingRotation }, duration)
    .repeat(1)
    .yoyo(true)
    // .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function(object) {
      object.initTween();
    })
    .start();
};

Butterfly.prototype.move = function () {
  var destination;
  if (mouseOver && conf.followMouse) {
    destination = mousePosition;
  } else {
    destination = this.destination;
  }

  var dv = destination.clone().sub(this.o3d.position).normalize();
  this.velocity.x += conf.attraction * dv.x;
  this.velocity.y += conf.attraction * dv.y;
  this.velocity.z += conf.attraction * dv.z;
  this.limitVelocity();

  // update position & rotation
  this.setWingRotation(this.wingRotation);
  this.o3d.lookAt(this.o3d.position.clone().add(this.velocity));
  this.o3d.position.add(this.velocity);
};

Butterfly.prototype.limitVelocity = function (y) {
  this.velocity.x = limit(this.velocity.x, -conf.velocityLimit, conf.velocityLimit);
  this.velocity.y = limit(this.velocity.y, -conf.velocityLimit, conf.velocityLimit);
  this.velocity.z = limit(this.velocity.z, -conf.velocityLimit, conf.velocityLimit);
};

Butterfly.prototype.setWingRotation = function (y) {
  this.lwing.rotation.y = y;
  this.rwing.rotation.y = -y;
};

Butterfly.prototype.shuffle = function () {
  this.velocity = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true));
  var p = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true)).normalize().multiplyScalar(100);
  this.o3d.position.set(p.x, p.y, p.z);
  var scale = rnd(0.4) + 0.1;
  this.o3d.scale.set(scale, scale, scale);
}

function limit(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function rnd(max, negative) {
  return negative ? Math.random() * 2 * max - max : Math.random() * max;
}

function onWindowResize() {
  whw = window.innerWidth / 2;
  whh = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  // if (cameraCtrl.getState()!=-1) return;

  var v = new THREE.Vector3();
  camera.getWorldDirection(v);
  v.normalize();
  // console.log(v);
  mousePlane.normal = v;

  mouseOver = true;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(mousePlane, mousePosition);
}

init();
