let camera, scene, renderer, controls, mesh, light;

//Web Audio API

const audio = document.getElementById('audio'); 

const context = new AudioContext();

let src = context.createMediaElementSource(audio); 
const analyser = context.createAnalyser(); 

// connect audio context source to the analyzer
src.connect(analyser); 
analyser.connect(context.destination); 

analyser.smoothingTimeConstant = 0.95;

audio.addEventListener('play', function() {
  context.resume();
});

analyser.fftSize = 512;


const bufferLength = analyser.frequencyBinCount; 
console.log(bufferLength);


const dataArray = new Uint8Array(bufferLength);
console.log(dataArray);


function init() {
  scene = new THREE.Scene();

  let width = window.innerWidth;
  let height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(45, width/height, 1, 25000);
  camera.position.set(0, 1100, 1000);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({alpha: 1, antialias: true});
  renderer.setSize(width, height);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  document.body.appendChild(renderer.domElement);
}

function vertices() {
  var blossom = new THREE.TextureLoader().load( 'blossom.webp' );
  let material = new THREE.MeshBasicMaterial({map: blossom});


  let geometry = new THREE.PlaneGeometry(500, 500, bufferLength - 1, bufferLength - 1);
  mesh = new THREE.Mesh(geometry, material);
  mesh.material.side = THREE.DoubleSide;

  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = Math.PI / 2;

  scene.add(mesh);
}

function animate() {
  renderer.render(scene, camera);
  controls.update();

  analyser.getByteTimeDomainData(dataArray);
  


  // visualize audio for each row of vertices
  for (let y = 0; y < bufferLength; y++) {
    let height = dataArray[y];
    for (let x = 0; x < bufferLength; x++) {
      let index = x + y * bufferLength;
      mesh.geometry.vertices[index].z = height;
    }
  }

  
  mesh.geometry.verticesNeedUpdate = true;

  requestAnimationFrame(animate);
}

function windowResize() {
  camera.aspect = (window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('load', () => {
  init();
  vertices();
  animate();
})

window.addEventListener('resize', windowResize);