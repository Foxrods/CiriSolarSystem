import './style.css';
import * as THREE from 'three';
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import planetAtexture from "/planetA.jpg";
import planetBtexture from "/planetB.png";
import planetCtexture from "/planetC.png";
import planetDtexture from "/planetD.png";
import planetEtexture from "/planetE.png";
import starTexture from "/star2.jpg";
import starNormal from "/starNormalMap.png";
import normalA from "/ANormalMap.png";
import normalB from "/BNormalMap.png";
import normalC from "/CNormalMap.jpg";
import normalD from "/DNormalMap.png";
import normalMuna from "/MunaNormal.png";


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
bloomPass.strength = 0.8;
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

const planetA = createPlanet(14, planetAtexture, normalA, 170, 'Zoyovoga');
const planetB = createPlanet(12, planetBtexture, normalB, 220, 'Nesnope');
const planetC = createPlanet(4, planetCtexture, normalC, 120, 'Setune');
const planetMuna = createPlanet(3.2, planetEtexture, normalMuna, 100, 'Muna');
const planetD = createPlanet(3, planetDtexture, normalD, 75, 'Roinides');

//Sun
const geometrySun = new THREE.SphereGeometry(38,32,32);
const materialSun = new THREE.MeshStandardMaterial({
  emissiveMap: new THREE.TextureLoader().load(starTexture),
  emissive: 0xffffff
});
const sun = new THREE.Mesh(geometrySun,materialSun);
sun.name = 'Ciri';
sun.position.set(0,0,0);
sun.lookAt(0,120,160);
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

  planetD_angle += 0.00055;
  translatePlanet(planetD, 60, planetD_angle);

  planetMuna.rotation.y += 0.016;
  planetMuna_angle += 0.0003;
  translatePlanet(planetMuna, 100, planetMuna_angle);

  sun.rotation.y += 0.0001;

  // raycast
  // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );
  // calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );
  //remover rings ou fake planets
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
      let radius = intersects[ i ].object.geometry.parameters.radius && intersects[ i ].object.geometry.parameters.radius > 8 ? intersects[ i ].object.geometry.parameters.radius: 8;
      const geometry = new THREE.RingGeometry( radius*1.4, radius*1.4 + 2, 1024 );
      const material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
      const mesh = new THREE.Mesh( geometry, material );
      mesh.position.set(intersects[ i ].object.position.x, intersects[ i ].object.position.y, intersects[ i ].object.position.z);
      mesh.lookAt(0,160,120);
      mesh.name = "select";
      scene.add( mesh );
    }
	}
}

const planetView = false;

function translatePlanet(mesh, radius, angle){
  mesh.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle))
}

function onPlanetClick( event ){
  raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( scene.children );
  for ( let i = 0; i < intersects.length; i ++ ){
    if(planetView || intersects[ i ].object.name == "fakeplanet"){
      return;
    }
    if(intersects[ i ].object.name == "Ciri"){
      createFakePlanet(100, starTexture, starNormal);
      bloomPass.strength = 0.5;
    }
    else{
      createFakePlanet(100, intersects[ i ].object.material.map.image.src, intersects[ i ].object.material.normalMap.image.src);
      bloomPass.strength = 0.2;
    }
    camera.position.set(1200,0,0);
    camera.lookAt(1000,0,0);
    ambient_light.intensity = 1;
    writeFields(intersects[ i ].object.name)
  }
  planetView = true;
}

function writeFields(name){
  document.getElementById('name').innerHTML = name;
  document.getElementById('name').hidden = false;
  document.getElementById('type').hidden = false
  document.getElementById('diameter').hidden = false;
  document.getElementById('mass').hidden = false;
  document.getElementById('temperature').hidden = false;
  document.getElementById('moons').hidden = false;
  document.getElementById('habitability').hidden = false;
  document.getElementById('description').hidden = false;
   
  if(name == 'Ciri'){
    document.getElementById('type').innerHTML = 'Star Type: Class M (Red Dwarf)'
    document.getElementById('diameter').innerHTML = 'Diameter: 278536 km'
    document.getElementById('mass').innerHTML = 'Mass: 8.7492e+29 kg'
    document.getElementById('temperature').innerHTML = 'Surface Temperature: 3560 K'
    document.getElementById('moons').hidden = true;
    document.getElementById('habitability').hidden = true;
    document.getElementById('description').innerHTML = 'Description: Red Dwarves are the most common stars in the universe. Their low luminosity means they are difficult to observe with the naked eye from afar. Although they typically have an extremely long lifespan, red dwarves emit almost no UV light resulting in unfavorable conditions for most forms of life.'
  }
  else if(name == 'Zoyovoga'){
    document.getElementById('type').innerHTML = 'Planet Type: Gas Gigant'
    document.getElementById('diameter').innerHTML = 'Diameter: 140338 km'
    document.getElementById('mass').innerHTML = 'Mass: 1.9982e+29 kg'
    document.getElementById('temperature').innerHTML = 'Surface Temperature: 38.15 K'
    document.getElementById('moons').innerHTML = 'Moons: 41'
    document.getElementById('habitability').innerHTML = 'Habitability: 0%';
    document.getElementById('description').innerHTML = 'Description: Zoyovoga is a gas giant planet mostly composed of helium and hydrogen swirling above its solid core. Its greenish blue color is due to the presence of ice, methane and ammonia.'
  }
  else if(name == 'Nesnope'){
    document.getElementById('type').innerHTML = 'Planet Type: Gas Gigant'
    document.getElementById('diameter').innerHTML = 'Diameter: 121916 km'
    document.getElementById('mass').innerHTML = 'Mass: 1.6531e+27 kg'
    document.getElementById('temperature').innerHTML = 'Surface Temperature: 44.2 K'
    document.getElementById('moons').innerHTML = 'Moons: 32'
    document.getElementById('habitability').innerHTML = 'Habitability: 0%';
    document.getElementById('description').innerHTML = 'Description: Nesnope is a gas giant planet mostly composed of helium and hydrogen swirling above its solid core. Its light pink color is due to the high presence of water and methane clouds that greatly reflects Ciri\'s red light.'
  }
  else if(name == 'Setune'){
    document.getElementById('type').innerHTML = 'Planet Type: Tundra World'
    document.getElementById('diameter').innerHTML = 'Diameter: 20161 km'
    document.getElementById('mass').innerHTML = 'Mass: 9.9822e+24 kg'
    document.getElementById('temperature').innerHTML = 'Surface Temperature: 180.2 K'
    document.getElementById('moons').innerHTML = 'Moons: 2'
    document.getElementById('habitability').innerHTML = 'Habitability: 20%';
    document.getElementById('description').innerHTML = 'Description: Setune is a cold and rocky world with a nitrogen-oxygen atmosphere. Permafrost covers most of the surface and a stable biosphere exists but vegetation is mostly limited to mosses and lichens.'
  }
  else if(name == 'Muna'){
    document.getElementById('type').innerHTML = 'Planet Type: Desert World'
    document.getElementById('diameter').innerHTML = 'Diameter: 14777 km'
    document.getElementById('mass').innerHTML = 'Mass: 6.1432e+24 kg'
    document.getElementById('temperature').innerHTML = 'Surface Temperature: 228.25 K'
    document.getElementById('moons').innerHTML = 'Moons: 1'
    document.getElementById('habitability').innerHTML = 'Habitability: 80%';
    document.getElementById('description').innerHTML = 'Description: Muna is a desert world composed almost entirely by platinum silicon dioxide dunes and shallow salty water oceans, and its atmosfere is rich in nitrogen that gives a very pink sky throughout the day. Muna is home of the Pukhu\'a, the only lifeform on the planet.'
  }
  else if(name == 'Roinides'){
    document.getElementById('type').innerHTML = 'Planet Type: Desert World'
    document.getElementById('diameter').innerHTML = 'Diameter: 10777 km'
    document.getElementById('mass').innerHTML = 'Mass: 3.9932e+24 kg'
    document.getElementById('temperature').innerHTML = 'Surface Temperature: 278.25 K - 50.2 K'
    document.getElementById('moons').innerHTML = 'Moons: 0'
    document.getElementById('habitability').innerHTML = 'Habitability: 0%';
    document.getElementById('description').innerHTML = 'Description: Roinides is a dry, rocky world with almost no atmosphere. The dust-covered terrain consists largely of mesas, canyons and mountains. Temperature between day and night sides varies significantly since the planet is tidal locked.'
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
      bloomPass.strength = 0.8;
      ambient_light.intensity = 0;
      document.getElementById('name').hidden = true;
      document.getElementById('type').hidden = true;
      document.getElementById('diameter').hidden = true;
      document.getElementById('mass').hidden = true;
      document.getElementById('temperature').hidden = true;
      document.getElementById('moons').hidden = true;
      document.getElementById('habitability').hidden = true;
      document.getElementById('description').hidden = true;

      planetView = false;
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