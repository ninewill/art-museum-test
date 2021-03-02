let container, stats, controls;

let camera, scene, renderer, light, mesh;

init();
animate();

function init() {
  //選擇容器
  container = document.querySelector("#info");

  //建立相機
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 800, 1000);

  //建立場景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);

  //光源燈
  const ambient = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0x404040, 2);
  light.position.set(50, 50, 100);
  scene.add(light);

  const helperdir = new THREE.DirectionalLightHelper(light, 5);
  scene.add(helperdir);

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

  /**
   * 圖片
   **/

  // 建立紋理圖片載入器
  var loaderimg = new THREE.TextureLoader();

  // 建立圖片2D幾何寬高自行設定
  geometry2d = new THREE.PlaneGeometry(300, 200 * 0.75);

  // 將材質及圖片群組
  function makeInstance(geometry2d, x, y, z) {

    // 載入客製化圖片到材質內
    materialimg = new THREE.MeshLambertMaterial({
      map: loaderimg.load(
        "./common/img/unnamed.jpg"
      ),
    });

    meshimg = new THREE.Mesh(geometry2d, materialimg);

    // 加入場景
    scene.add(meshimg);

    // 設定位置
    meshimg.position.x = x;
    meshimg.position.y = y;
    meshimg.position.z = z;

    return meshimg;
  }
  const cubes = {
    pink: makeInstance(geometry2d, 0, 50, 11),
    purple: makeInstance(geometry2d, 400, 50, 11),
    blue: makeInstance(geometry2d, -400, 50, 11)
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




  //click 事件
  // const interactionManager = new THREE.InteractionManager(
  //   renderer,
  //   camera,
  //   container
  // );

  // console.log(interactionManager);


  // for (const [name, object] of Object.entries(cubes)) {
  //   object.addEventListener("click", (event) => {
  //     event.stopPropagation();
  //     console.log(`${name} cube was clicked`);
  //   });
  //   interactionManager.add(object);
  //   scene.add(object);
  // }






  //render 渲染
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, container);
  controls.target.set(0, 100, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // interactionManager.update();
}
