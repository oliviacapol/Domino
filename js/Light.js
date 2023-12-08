import * as THREE from "three";

export default class Light {
  constructor(scene) {
    this.scene = scene;
  }

  createLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);

    // spotlight
    this.spotlight = new THREE.SpotLight(0xffffff, 0);
    this.spotlight.position.set(10, 100, 10);
    this.scene.add(this.spotlight);

    // pour gérer les ombres
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.width = 4096;
    this.spotlight.shadow.mapSize.height = 4096;

    // les lignes qui aident à voir la zone de lumière
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotlight);
    // this.scene.add(this.spotLightHelper);
  }

  //   pour que le helper se modifie en live
  update() {
    // this.spotLightHelper.update();
  }

  // gui(gui) {
  //   const folder = gui.addFolder("Light");
  //   folder.add(this.spotlight, "intensity", 0, 100, 0.01);
  //   folder.add(this.spotlight, "angle", 0, Math.PI / 3, 0.01);
  //   folder.add(this.spotlight.position, "x", -10, 10, 0.01);
  //   folder.add(this.spotlight.position, "y", -10, 10, 0.01);
  //   folder.add(this.spotlight.position, "z", -10, 10, 0.01);
  //   folder.add(this.spotlight, "penumbra", 0, 1, 0.01);
  //   // folder.add(this.spotlight, "color");
  //   // folder.add(this.spotlight, "distance", 0, 10, 0.01);
  // }
}
