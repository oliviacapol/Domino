import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

export default class Text {
  constructor(scene, physicsManager) {
    this.physicsManager = physicsManager;
    this.scene = scene;
  }

  loadFont() {
    const loader = new FontLoader();
    return new Promise((resolve, reject) => {
      loader.load("Hibora_Regular.json", (font) => {
        resolve(font);
      });
    });
  }

  calcLetterLength(mesh) {
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    this.length = new THREE.Vector3();
    boundingBox.getSize(this.length);

    return this.length;
  }

  getLastLetterSize() {
    return this.length;
  }

  getColorRandom() {
    return new THREE.Color(Math.random(), Math.random(), Math.random());
  }

  createWord(_text, font) {
    const upperCaseText = _text.toUpperCase();
    const textGroup = new THREE.Group();
    const groupColor = 0xff0000; // 0xefefef; // this.getColorRandom();

    for (let i = 0; i < _text.length; i++) {
      const letter = upperCaseText.charAt(_text.length - 1 - i);
      const geometry = new TextGeometry(letter, {
        font: font,
        size: 1,
        height: 0.2,
      });

      const material = new THREE.MeshPhongMaterial({
        color: groupColor,
      });
      const text = new THREE.Mesh(geometry, material);

      // Create edges geometry
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      // Create the edges mesh
      const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edgesMesh.renderOrder = 1; // make sure edges are rendered on top
      text.add(edgesMesh);

      this.text = text;

      const letterHeight = this.calcLetterLength(text);

      text.position.y = letterHeight.y * 2 * i * 0.8;
      text.position.z = -letterHeight.z / 2;
      text.position.x = -letterHeight.x / 2;
      text.position.y += -letterHeight.y / 2;

      textGroup.add(text);
    }

    // textGroup.rotateX(-Math.PI / 2);
    textGroup.castShadow = true;
    textGroup.receiveShadow = true;
    this.scene.add(textGroup);

    return textGroup;
  }
}
