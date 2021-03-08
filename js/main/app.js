//初始化設定
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
const interactionManager = new THREE.InteractionManager(
  renderer,
  camera,
  renderer.domElement
);


//場景
function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  return scene;
}

//相機
function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 800, 1000);
  return camera;
}

//燈光
function createLight() {
  const ambient = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0x404040, 2);
  light.position.set(50, 50, 100);
  scene.add(light);

  const helperdir = new THREE.DirectionalLightHelper(light, 5);
  scene.add(helperdir);

  return ambient, light, helperdir;
}

//3D幾何物件

// 將材質及圖片群組
let canvas2d;

function makeInstance(canvas2d, x, y, z, materialimg) {
  var loaderimg = new THREE.TextureLoader();
  canvas2d = new THREE.PlaneGeometry(300, 200 * 0.75);

  // 載入客製化圖片到材質內
  materialimg = new THREE.MeshLambertMaterial({
    map: loaderimg.load("./common/img/unnamed.jpg"),
  });

  //(canvas2d & materialimg) 載入進meshimg
  meshimg = new THREE.Mesh(canvas2d, materialimg);

  // 加入場景
  scene.add(meshimg);

  // 設定位置
  meshimg.position.x = x;
  meshimg.position.y = y;
  meshimg.position.z = z;

  return meshimg;
}

function makeInstance2(canvas2d, x, y, z, materialimg) {
  var loaderimg = new THREE.TextureLoader();
  canvas2d = new THREE.PlaneGeometry(200, 200 * 0.75);

  // 載入客製化圖片到材質內
  materialimg = new THREE.MeshLambertMaterial({
    map: loaderimg.load("./common/img/img02.jpg"),
  });

  //(canvas2d & materialimg) 載入進meshimg
  meshimg2 = new THREE.Mesh(canvas2d, materialimg);

  // 加入場景
  scene.add(meshimg2);

  // 設定位置
  meshimg2.position.x = x;
  meshimg2.position.y = y;
  meshimg2.position.z = z;
  meshimg2.rotation.y = 89.55;

  return meshimg2;
}

// model 載入進度
const manager = new THREE.LoadingManager();
// 開始載入
manager.onStart = function (item, loaded, total) {
  console.log("模型載入中...");
};
//載入完成
manager.onLoad = function () {
  console.log("模型載入完成");
  // bar.destroy();
};
// 載入訊息
manager.onProgress = function (item, loaded, total) {
  console.log(item, loaded, total);
  console.log("Loaded:", Math.round((loaded / total) * 100, 2) + "%");
  // bar.animate(1.0);
};

manager.onError = function (url) {
  console.log("Error loading");
};


//載入模型
const mtlLoader = new THREE.MTLLoader(manager);
mtlLoader.setResourcePath("./models/wall/");
mtlLoader.setPath("./models/wall/");
mtlLoader.load("wall01.mtl", function (materials) {
  materials.preload();

  const objLoader = new THREE.OBJLoader(manager);
  objLoader.setMaterials(materials);
  objLoader.setPath("./models/wall/");
  objLoader.load("wall01.obj", function (object) {
    const mesh = object;

    mesh.position.y = 50;
    mesh.opacity = 0.5;
    scene.add(mesh);
  });
});

//地板
const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
planeGeometry.rotateX(-Math.PI / 2);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y = -200;
plane.receiveShadow = true;
scene.add(plane);

const helper = new THREE.GridHelper(2000, 50);
helper.position.y = -50;
helper.material.opacity = 1;
helper.material.transparent = true;
scene.add(helper);


//渲染到畫面
function createRenderer() {
  const root = document.getElementById("info");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);
  return renderer;
}

//動畫執行
function animate(callback) {
  function loop(time) {
    callback(time);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

//相機控制
const controls = new THREE.OrbitControls(camera, renderer.domElement);

const artimg = {
  one: makeInstance(canvas2d, 0, 50, 11),
  two: makeInstance(canvas2d, 400, 50, 11),
  three: makeInstance2(canvas2d, -240, 50, 150),
};

const light = createLight();


for (const [name, object] of Object.entries(artimg)) {
  object.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    console.log(`${name} artimg was clicked`);
    const meshimg = event.target;
    const meshimg2 = event.target;
    const coords = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
    controls.enabled = false;
    const tween = new TWEEN.Tween(coords)
      .to({ x: meshimg.position.x, y: meshimg.position.y, z: 200 })
      .to({ x: meshimg2.position.x, y: meshimg2.position.y, z: 200 })
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        controls.target.set(coords.x, coords.y, controls.target.z);
        camera.position.set(coords.x, coords.y, coords.z);
        controls.update();
      })
      .onComplete(() => {
        controls.enabled = true;
        camera.lookAt(meshimg.position);
        camera.lookAt(meshimg2.position);
        console.log(controls.target);
        console.log(meshimg.position);
      })
      .start();
  });
  interactionManager.add(object);
  scene.add(object);
}

//RWD響應
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

scene.add(light);

animate((time) => {
  renderer.render(scene, camera);
  interactionManager.update();
  TWEEN.update(time);
});
