import * as THREE from "three";

export default class WordManager {
  constructor(scene, physicsManager, obj, letterSize) {
    this.scene = scene;
    this.physicsManager = physicsManager;
    this.obj = obj;
    this.letterSize = letterSize;
    this.size = null;
  }

  getSize(mesh) {
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    this.length = new THREE.Vector3();
    boundingBox.getSize(this.length);
    return this.length;
  }

  addPhysics(props) {
    this.size = props.size;
    this.id = this.physicsManager.createBox(props);
  }

  update() {
    const phyBox = this.physicsManager.getBox(this.id);
    this.obj.position.copy(phyBox.position);
    this.obj.quaternion.copy(phyBox.quaternion);
    this.obj.translateY(-this.size.y / 2 + this.letterSize.y / 2);
  }
}
