import './style.css';
import * as THREE from 'three';
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FontLoader } from "/node_modules/three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "/node_modules/three/examples/jsm/geometries/TextGeometry.js";

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
bloomPass.strength = 0.6;
bloomPass.radius = 1;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

//raycast
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
window.addEventListener( 'mousemove', onMouseMove, false );

//loading texts
function addTextOnPosition(text, xPos, yPos, zPos, fontName, fontSize = 10){
  const fontloader = new FontLoader();
  fontloader.load(fontName, function(font){
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: fontSize,
    height: 2
  });
  const textMesh = new THREE.Mesh(textGeometry, new THREE.MeshStandardMaterial({
    emissive: 0xffffff
  }));
  textMesh.position.set(xPos, yPos, zPos);
  textMesh.lookAt(xPos,160,120);
  textMesh.name="text";
  scene.add(textMesh);
  });
}

addTextOnPosition('Ciri -', -23, 60, 0, normalFont);
addTextOnPosition('Sciri', 7, 60, 0, alienFont);

//background
const backGround = new THREE.TextureLoader().load('universebg.png');
scene.background = backGround;

//planets
function createPlanet(radius, image, normal, distanceFromSun, name){
  let geometry = new THREE.SphereGeometry(radius, 32, 32);
  let material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(image),
    normalMap: new THREE.TextureLoader().load(normal),
    //displacementMap: new THREE.TextureLoader().load(displacement)
  });
  let planet = new THREE.Mesh(geometry,material);
  planet.position.set(distanceFromSun,0,0);
  planet.name = name;
  scene.add(planet);
  return planet;
}

function createFakePlanet(radius, image, normal){
  let geometry = new THREE.SphereGeometry(radius, 128, 128);
  let material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(image),
    normalMap: new THREE.TextureLoader().load(normal)
  });
  let planet = new THREE.Mesh(geometry,material);
  planet.position.set(1000,0,0);
  planet.name = 'fakeplanet';
  scene.add(planet);
  return planet;
}

const planetA = createPlanet(14, 'planetA.jpg', 'ANormalMap.png', 170, 'Zoyovoga');
const planetB = createPlanet(12, 'planetB.png', 'BNormalMap.png', 210, 'Nesnope');
const planetC = createPlanet(4, 'planetC.png', 'CNormalMap.jpg', 120, 'Setune');
const planetMuna = createPlanet(3.2, 'planetE.png', 'MunaNormal.png', 100, 'Muna');
const planetD = createPlanet(3, 'planetD.png', 'DNormalMap.png', 75, 'Roinides');

//Sun
const geometrySun = new THREE.SphereGeometry(38,32,32);
const materialSun = new THREE.MeshStandardMaterial({
  emissiveMap: new THREE.TextureLoader().load('star.jpg'),
  emissive: 0xff9999
});
const sun = new THREE.Mesh(geometrySun,materialSun);
sun.name = 'Ciri';
sun.position.set(0,0,0);
sun.rotateX(Math.PI/1.4);
scene.add(sun);

//light
const sunLight = new THREE.PointLight(0xffffff);
sunLight.position.set(0,0,0);
scene.add(sunLight);
const ambient_light = new THREE.AmbientLight(0xffcdcd);
ambient_light.position.set(0,0,0);
ambient_light.intensity = 0;
scene.add(ambient_light);

//initial angles
let planetA_angle = 3.2;
let planetB_angle = -1.7;
let planetC_angle = 2.7;
let planetD_angle = 0.6;
let planetMuna_angle = 0.2;

function animate(){
  requestAnimationFrame(animate);

  // animations
  bloomComposer.render();

  planetA.rotation.y += 0.005;
  planetA_angle += 0.00017;
  translatePlanet(planetA, 170, planetA_angle);

  planetB.rotation.y += 0.005;
  planetB_angle += 0.0001;
  translatePlanet(planetB, 220, planetB_angle);

  planetC.rotation.y += 0.011;
  planetC_angle += 0.00022;
  translatePlanet(planetC, 120, planetC_angle);

  planetD.rotation.y += 0.0135;
  planetD_angle += 0.0005;
  translatePlanet(planetD, 75, planetD_angle);

  planetMuna.rotation.y += 0.016;
  planetMuna_angle += 0.0003;
  translatePlanet(planetMuna, 100, planetMuna_angle);

  sun.rotation.y += 0.0001;

  // raycast
  // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );
  // calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );
  //remover rings
  scene.traverse( function( node ) {
    if ( node instanceof THREE.Mesh ) {
        if(node.name == "select")
          scene.remove(node);
        if(node.name == 'fakeplanet')
          node.rotation.y -= 0.0017;
    }
  });
  //add rings arround meshes
	for ( let i = 0; i < intersects.length; i ++ ) {
		if(intersects[ i ].object.name !== 'text' && intersects[ i ].object.name !== 'fakeplanet'){
      console.log(intersects[ i ].object.name);
      let radius = intersects[ i ].object.geometry.parameters.radius && intersects[ i ].object.geometry.parameters.radius > 8 ? intersects[ i ].object.geometry.parameters.radius: 8;
      const geometry = new THREE.RingGeometry( radius*1.4, radius*1.5, 1024 );
      const material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
      const mesh = new THREE.Mesh( geometry, material );
      mesh.position.set(intersects[ i ].object.position.x, intersects[ i ].object.position.y, intersects[ i ].object.position.z);
      mesh.lookAt(0,160,120);
      mesh.name = "select";
      scene.add( mesh );
    }
	}
}

function translatePlanet(mesh, radius, angle){
  mesh.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle))
}

function onPlanetClick( event ){
  raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( scene.children );
  for ( let i = 0; i < intersects.length; i ++ ){
    console.log(intersects[ i ].object.material.map.image);
    const fakeplanet = createFakePlanet(100, intersects[ i ].object.material.map.image.src, intersects[ i ].object.material.normalMap.image.src);
    camera.position.set(1200,0,0);
    camera.lookAt(1000,0,0);
    bloomPass.strength = 0;
    ambient_light.intensity = 1;
  }
}

window.addEventListener( "click", onPlanetClick, false);

window.addEventListener(
  "keydown", event => {
    const key = event.key; 
    if (key === "Escape") {
      scene.traverse( function( node ) {
        if ( node instanceof THREE.Mesh ) {
            if(node.name == "fakeplanet")
              scene.remove(node);
        }
      });
      camera.position.set(0,160,120);
      camera.lookAt(0,0,0);
      bloomPass.strength = 0.6;
      ambient_light.intensity = 0;
    }
});

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