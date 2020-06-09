let camera, scene, renderer, controls, mesh, light;

//////// JS Audio API ////////

const audio = document.getElementById('audio'); // access DOM audio element

const context = new AudioContext(); // interface (audio processing graph)
// note: this method of creating the audio context is not yet supported in Safari
let src = context.createMediaElementSource(audio); // give audio context an audio source
const analyser = context.createAnalyser(); // analyzer for the audio context

src.connect(analyser); // connect audio context source to the analyzer
analyser.connect(context.destination); // end destination of audio graph (sends sound to speakers)

analyser.smoothingTimeConstant = 0.95;

audio.addEventListener('play', function() {
  context.resume();
});

// Fast Fourier Transform analysis size
// this value can be a multiple of 8 from 32 to 32768
analyser.fftSize = 256;
// (FFT) is an algorithm that samples a signal over a period of time and divides it into its frequency components (single sinusoidal oscillations)
// It separates the mixed signals and shows what frequency is a violent vibration.
// (FFTSize) represents the window size in samples that is used when performing a FFT

const bufferLength = analyser.frequencyBinCount; // read-only property
console.log(bufferLength);
// unsigned integer, half of fftSize (so in this case, bufferLength = 128)
// Equates to number of data values you have to play with for the visualization
// A bin is a spectrum sample, and defines the frequency resolution of the window.

const dataArray = new Uint8Array(bufferLength); // convert to 8-bit unsigned integer array
console.log(dataArray);
// At this point dataArray is an array with length of bufferLength but no values yet

/////////////////////////////

function init() {
  scene = new THREE.Scene();

  let width = window.innerWidth;
  let height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(45, width/height, 1, 25000);
  camera.position.set(0, 300, 700);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({alpha: 1, antialias: true});
  renderer.setSize(width, height);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  document.body.appendChild(renderer.domElement);
}

function vertices() {
  let material = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000});

  // width, height, segments
  let geometry = new THREE.SphereGeometry(100, bufferlength - 1, bufferlength - 1);
  mesh = new THREE.Mesh(geometry, material);

  // generate randon heights for each row of vertices
  // for (let y = 0; y < 21; y++) {
  //   let height = Math.floor(Math.random() * 100);
  //   for (let x = 0; x < 21; x++) {
  //     let index = x + y * 21;
  //     mesh.geometry.vertices[index].z = height;
  //   }
  // }

  mesh.rotation.x = -Math.PI / 2; // rotate flat
  mesh.rotation.z = Math.PI / 2; // rotate around 90°

  scene.add(mesh);
}

function animate() {
  renderer.render(scene, camera);
  controls.update();

  analyser.getByteTimeDomainData(dataArray); // copies the current waveform into dataArray
  // analyser.getByteFrequencyData(dataArray); // copies the frequency data into dataArray
  // use whichever of these techniques, TimeDomain or Frequency, suits your project
  // console.log('DATA-ARRAY: ', dataArray);

  // visualize audio for each row of vertices
  for (let y = 0; y < bufferLength; y++) {
    let height = dataArray[y];
    for (let x = 0; x < bufferLength; x++) {
      let index = x + y * bufferLength;
      mesh.geometry.vertices[index].z = height;
    }
  }

  // update vertices
  mesh.geometry.verticesNeedUpdate = true;

  requestAnimationFrame(animate);
}

function windowResize() {
  camera.aspect = (window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix(); // update camera

  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('load', () => {
  init();
  vertices();
  animate();
})

window.addEventListener('resize', windowResize);