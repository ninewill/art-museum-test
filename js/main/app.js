//初始化設定
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
//相機控制
const controls = new THREE.OrbitControls(camera, renderer.domElement);
const interactionManager = new THREE.InteractionManager(
  renderer,
  camera,
  renderer.domElement
);

const light = createLight();
scene.add(light);

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
  camera.position.set(0, 350, 900);
  return camera;
}

//渲染到畫面
function createRenderer() {
  const root = document.getElementById("info");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);
  return renderer;
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



//地板
const helper = new THREE.GridHelper(2000, 50);
scene.add(helper);

//動畫執行
function animate(callback) {
  function loop(time) {
    callback(time);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

//RWD響應
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

animate((time) => {
  renderer.render(scene, camera);
  interactionManager.update();
  TWEEN.update(time);
});







// main code
// 圖片路徑
const source = [
  'https://source.unsplash.com/L6xHmv2R3G4/1600x900',
  'https://source.unsplash.com/ndZ1cXH34jU/1600x900',
  'https://source.unsplash.com/UDv1n0xIpU8/1600x900',
  'https://source.unsplash.com/9TqxiF46a_4/1600x900',
  'https://source.unsplash.com/8kA6__zObq8/1600x900',
]
// 展版定位點
const boardsPosition = [
  [-250, 75, 200, 30],
  [180, 75, 0, -30],
  [-300, 75, 400, 30],
  [0, 75, -230, 0],
  [300, 75, 200, -30],
]

// 生成展版
function createArtboard(imageSource) {
  const boardWidth = 200;
  const boardHeight = 150;
  const boardDepth = 10;

  function createBoard() {
    const geometry = new THREE.BoxGeometry( boardWidth, boardHeight, boardDepth );
    const material = new THREE.MeshBasicMaterial( {color: '#dedede'} );
    return new THREE.Mesh( geometry, material );
  }

  function createCanvas(source) {
    let textureLoader = new THREE.TextureLoader();
    let canvas2d = new THREE.PlaneGeometry(boardWidth, boardWidth * 0.5625);
  
    // 載入客製化圖片到材質內
    let material = new THREE.MeshLambertMaterial({
      map: textureLoader.load(source),
    });
  
    return new THREE.Mesh(canvas2d, material);
  }

  function addCameraPosition(obj) {
    const geometry = new THREE.SphereGeometry(0);
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const sphere = new THREE.Mesh( geometry, material );
    obj.add(sphere);
    sphere.position.set(0,0,120);
    sphere.name = 'cameraPosition';
  }

  // 製造組合
  const artboard = createBoard();
  const canvas = createCanvas(imageSource);
  artboard.add(canvas);
  canvas.position.set(0,0,6);
  addCameraPosition(artboard);
  return artboard;
}

// 遍歷生成展版 (返回 artbord 3D物件 與 camera定位點)
// return {object: 展版 , camPosition: 定位點}
let artboards = []
source.forEach((path,index) => {
  const artboard = createArtboard(path);
  const pos = boardsPosition[index];
  const deg = Math.PI * (pos[3] / 180);

  artboard.position.set(pos[0], pos[1], pos[2]);
  artboard.rotation.set(0, deg, 0);
  artboard.updateMatrixWorld();
  
  let camPos = new THREE.Vector3();
  artboard.getObjectByName('cameraPosition').getWorldPosition(camPos);
  let camQua = artboard.quaternion;

  artboards.push({
    object: artboard,
    camPosition: camPos,
    camQuaternion: camQua
  });
})


// 展版點擊事件綁定
artboards.forEach((boardData) => {

  const { object, camPosition, camQuaternion } = boardData;

  object.addEventListener("click", (e) => {
    controls.enabled = false;
    e.stopPropagation();
    if(e.originalEvent.button !== 0) return;

    // 暫存的位置 (當前攝影機的位置)
    const tempPos = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      t: 0
    };

    // 最終的位置 
    const finalPos = {
      x: camPosition.x,
      y: camPosition.y,
      z: camPosition.z,
      t: 1
    }
    
    
    // 不斷改變 tempPos ，使其趨近於(最終等於) finalPos
    new TWEEN.Tween(tempPos)
      .to(finalPos)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        // 每次更新 tempPos 時重新校準鏡頭
        camera.position.set(tempPos.x, tempPos.y, tempPos.z);

        // lookAt待優化
        // camera.lookAt(object.position);
        camera.quaternion.slerp(camQuaternion, tempPos.t);
      })
      .onComplete(() => {
        // 結束時重設 controls 中心點
        controls.target.set(object.position.x, object.position.y, object.position.z);
        controls.update();
        controls.enabled = true;
      })
      .start();
  });
  interactionManager.add(object);
  scene.add(object);
})
