import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

export default class Shape {
  constructor(scene, physicsManager, composer, camera) {
    // console.log(physicsManager);
    this.physicsManager = physicsManager;
    this.scene = scene;
    this.composer = composer;
    this.camera = camera;
    if (camera.isPerspectiveCamera) {
      this.outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        scene,
        camera
      );
      this.outlinePass.edgeStrength = 2;
      this.outlinePass.edgeGlow = 1;
      this.outlinePass.visibleEdgeColor.set(0xffffff);
      this.outlinePass.hiddenEdgeColor.set(0xffffff);
      this.composer.addPass(this.outlinePass);
    } else {
      console.error(
        "The provided camera is not a perspective camera. OutlinePass requires a perspective camera."
      );
    }
  }

  createRandomCubes(numberOfCubes) {
    const zone = 200;
    const minDistanceToCurve = 7;

    const cubes = [];

    const height = 11;

    for (let i = 0; i < numberOfCubes; i++) {
      const geometry = new THREE.BoxGeometry(2, height, Math.random() * 5);

      const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
      });
      const cube = new THREE.Mesh(geometry, cubeMaterial);
      // Create edges geometry
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      // Create the edges mesh
      const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edgesMesh.renderOrder = 1; // make sure edges are rendered on top
      cube.add(edgesMesh);

      const curvePoints = this.createCurve().getPoints(50);

      const cubePosition = cube.position.set(
        Math.random() * zone - zone / 2,
        height / 2,
        Math.random() * zone - zone / 2
      );

      const distanceToCurve = curvePoints.reduce((minDist, point) => {
        const dist = cubePosition.distanceTo(point);
        return Math.min(minDist, dist);
      }, Infinity);

      if (distanceToCurve <= minDistanceToCurve) {
        this.scene.remove(cube);
      } else if (distanceToCurve > minDistanceToCurve) {
        this.scene.add(cube);
        this.outlinePass.selectedObjects.push(cube);
      }

      cubes.push(cube);
    }

    return cubes;
  }

  createCurve() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 40),
      new THREE.Vector3(-20, 0, 35),
      new THREE.Vector3(-35, 0, 20),
      new THREE.Vector3(-40, 0, 0),
      new THREE.Vector3(-35, 0, -15),
      new THREE.Vector3(-20, 0, -35),
      new THREE.Vector3(0, 0, -40),
      new THREE.Vector3(20, 0, -35),
      new THREE.Vector3(30, 0, -20),
      new THREE.Vector3(30, 0, 0),
      new THREE.Vector3(20, 0, 15),
      new THREE.Vector3(0, 0, 20),
      new THREE.Vector3(-20, 0, 0),
      new THREE.Vector3(-10, 0, -15),
      new THREE.Vector3(0, 0, -20),
    ]);

    this.points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffffff,
      opacity: 0,
      transparent: true,
    });

    this.curveObject = new THREE.Line(geometry, material);
    this.curveObject.castShadow = true;
    this.curveObject.receiveShadow = true;
    this.scene.add(this.curveObject);
    return curve;
  }

  // createCurve() {
  //   const numPoints = 200;
  //   const totalTurns = 4;
  //   const curve = new THREE.CatmullRomCurve3();

  //   for (let i = 0; i < numPoints; i++) {
  //     const theta = (i * (2 * Math.PI * totalTurns)) / (numPoints - 1);
  //     const radius = (1 - i / numPoints) * 5;
  //     const x = radius * Math.cos(theta);
  //     const z = radius * Math.sin(theta);
  //     const y = 0;

  //     curve.points.push(new THREE.Vector3(x, y, z));
  //   }

  //   this.points = curve.getPoints(numPoints);
  //   const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
  //   const material = new THREE.LineBasicMaterial({ color: 0x000000 });

  //   this.taperedSpiralObject = new THREE.Line(geometry, material);
  //   this.taperedSpiralObject.castShadow = true;
  //   this.taperedSpiralObject.receiveShadow = true;
  //   this.scene.add(this.taperedSpiralObject);

  //   return curve;
  // }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(800, 800);
    const material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.rotateX(Math.PI / 2);

    // cadrillage
    const gridHelper = new THREE.GridHelper(500, 500, 0xffffff, 0xffffff);
    gridHelper.position.set(0, 0.1, 0); // Ajustez la position pour éviter le z-fighting avec le sol
    this.scene.add(gridHelper);

    const phyFloor = this.physicsManager.createFloor({
      size: { x: 500, y: 500 },
    });

    plane.position.copy(phyFloor.position);
    plane.quaternion.copy(phyFloor.quaternion);

    this.scene.add(plane);
  }
}
