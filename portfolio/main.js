import './style.css';
import * as THREE from 'three';
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FontLoader } from "/node_modules/three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "/node_modules/three/examples/jsm/geometries/TextGeometry.js";
import SpriteText from 'three-spritetext';

//load fonts
const normalFont = './GeosansLight_regular.json';
const alienFont = './Sith AF_Regular.json';

//scene comp and renderer config
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0,160,120);
camera.rotateX(-Math.PI/3);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,
  0.2,
  0.3
);
bloomPass.threshold = 0;
bloomPass.strength = 0.4;
bloomPass.radius = 1;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

//loading texts
function addTextOnPosition(text, xPos, yPos, zPos, fontName, fontSize = 10){
  const fontloader = new FontLoader();
  fontloader.load(fontName, function(font){
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: fontSize,
    height: 1
  });
  const textMesh = new THREE.Mesh(textGeometry, new THREE.MeshStandardMaterial({
    emissive: 0xffffff
  }));
  textMesh.position.set(xPos, yPos, zPos);
  scene.add(textMesh);
  });
}

addTextOnPosition('Ciri -', -23, 60, 0, normalFont);
addTextOnPosition('Sciri', 7, 60, 0, alienFont);
// addTextOnPosition('Muna -', -108, 10, 0, normalFont, 3);
// addTextOnPosition('Muna', -95, 10, 0, alienFont, 3);

//background
const backGround = new THREE.TextureLoader().load('universebg.png');
scene.background = backGround;

//planets
function createPlanet(radius, image, distanceFromSun){
  let geometry = new THREE.SphereGeometry(radius, 32, 32);
  let material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(image)
  });
  let planet = new THREE.Mesh(geometry,material);
  planet.position.set(distanceFromSun,0,0);
  scene.add(planet);
  return planet;
}

const planetA = createPlanet(14, 'planetA.jpg', 170);
const planetB = createPlanet(12, 'planetB.png', 210);
const planetC = createPlanet(4, 'planetC.png', 120);
const planetMuna = createPlanet(3.2, 'planetE.png', 100);
const planetD = createPlanet(3, 'planetD.png', 75);

//Sun
const geometrySun = new THREE.SphereGeometry(38,32,32);
const materialSun = new THREE.MeshStandardMaterial({
  emissiveMap: new THREE.TextureLoader().load('star.jpg'),
  emissive: 0xffffff
});
const sun = new THREE.Mesh(geometrySun,materialSun);
sun.position.set(0,0,0);
sun.rotateX(Math.PI/1.7);
scene.add(sun);

//light
const sunLight = new THREE.PointLight(0xffffff);
sunLight.position.set(0,0,0);
scene.add(sunLight);

//initial angles
let planetA_angle = 3.2;
let planetB_angle = -1.7;
let planetC_angle = 2.7;
let planetD_angle = 0.6;
let planetMuna_angle = 0.2;

function animate(){
  requestAnimationFrame(animate);
  // renderer.render(scene, camera);
  bloomComposer.render();

  planetA.rotation.y += 0.005;
  planetA_angle += 0.0017;
  translatePlanet(planetA, 170, planetA_angle);

  planetB.rotation.y += 0.005;
  planetB_angle += 0.001;
  translatePlanet(planetB, 220, planetB_angle);

  planetC.rotation.y += 0.011;
  planetC_angle += 0.0022;
  translatePlanet(planetC, 120, planetC_angle);

  planetD.rotation.y += 0.0135;
  planetD_angle += 0.005;
  translatePlanet(planetD, 75, planetD_angle);

  planetMuna.rotation.y += 0.016;
  planetMuna_angle += 0.003;
  translatePlanet(planetMuna, 100, planetMuna_angle);

  sun.rotation.y += 0.0001;
}

function translatePlanet(mesh, radius, angle){
  mesh.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle))
}

window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

animate();