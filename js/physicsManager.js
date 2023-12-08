import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

export const physicsManager = (scene, debug) => {
  const world = new CANNON.World();
  const cannonDebugger = debug ? new CannonDebugger(scene, world) : null;
  const phyBoxes = [];
  const initWorld = ({ gravity }) => {
    world.gravity.set(gravity.x, gravity.y, gravity.z);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 20;
    world.solver.tolerance = 0.05;
    return world;
  };

  const createFloor = ({ size }) => {
    const phyPlane = new CANNON.Body({ mass: 0 });
    phyPlane.addShape(new CANNON.Plane(new CANNON.Vec3(size.x, size.y)));
    phyPlane.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    world.addBody(phyPlane);
    return phyPlane;
  };

  const setAngularVelocity = ({ id, aVel }) => {
    phyBoxes[id].angularVelocity.set(aVel.x, aVel.y, aVel.z);
  };

  const createBox = ({ pos, size, mass, friction, aVel, rot }) => {
    let phyBox = new CANNON.Body({ mass: mass });
    phyBox.addShape(
      new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2))
    );
    phyBox.material = new CANNON.Material({ friction: friction });
    phyBox.quaternion.setFromEuler(rot.x, rot.y, rot.z);
    phyBox.position.set(pos.x, pos.y, pos.z);
    phyBox.angularVelocity.set(aVel.x, aVel.y, aVel.z);
    phyBox.angularDamping = 0.1;
    phyBoxes.push(phyBox);
    world.addBody(phyBox);
    const id = phyBoxes.length - 1;

    return id;
  };

  const update = () => {
    if (debug) {
      cannonDebugger.update(); // Update the CannonDebugger meshes
    }
    world.step(1 / 60);
  };

  const getBox = (num) => {
    return phyBoxes[num];
  };

  return {
    getBox,
    update,
    setAngularVelocity,
    createBox,
    createFloor,
    initWorld,
  };
};
