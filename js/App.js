import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Shape from "./Shape.js";
import Light from "./Light.js";
import Text from "./Text.js";
import Chat from "./Chat.js";
import * as TWEEN from "@tweenjs/tween.js";

import AudioDetector from "./AudioDetector.js";
import { physicsManager } from "./physicsManager.js";
import WordManager from "./WordManager.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { HalftonePass } from "three/examples/jsm/postprocessing/HalftonePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { LuminosityShader } from "three/examples/jsm/shaders/LuminosityShader.js";
import { SobelOperatorShader } from "three/examples/jsm/shaders/SobelOperatorShader.js";

export default class App {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.arrayWords = [];
    this.positionOnSpline = [];
    this.allTangents = [];
    this.incrementDominos = 0;
    this.incrementDominos_special = 0;
    this.speed = 0;
    this.state = 0;

    this.currentPosition = new THREE.Vector3(0, 0, 0);
    this.targetPosition = new THREE.Vector3(0, 0, 0);

    // this.cameraPosition1 = new THREE.Vector3(0, 0, 0);
    // this.cameraPosition2 = new THREE.Vector3(0, 100, 0);

    // this.globalView = false;

    // this.gui = new dat.GUI();
    this.chat = new Chat();

    this.chat.addEventListener(
      "gpt_response",
      this.getTotalSentence.bind(this)
    );
    this.chat.addEventListener("word", this.addWord.bind(this));
    this.chat.addEventListener("speechEnd", this.speechEnd.bind(this));

    this.AudioDetector = new AudioDetector();
    this.AudioDetector.addEventListener(
      "transcriptReady",
      this.onTextReceived.bind(this)
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this.AudioDetector.stopRecording();
      }
      if (e.key == "x") {
        console.log("X CLICKED");
        for (let i = 0; i < this.allMots.length; i++) {
          // this.PhysicsManager.setAngularVelocity({
          //   aVel: { x: 0, y: 0, z: 10 },
          //   id: 0,
          // });
        }
        const start = this.camera.position;
        const goal = this.curveObject.getPointAt(0);
        goal.y = 10;
        goal.x = 2;
        this.state = 1;
        this.transitionCameraPosition(start, goal, 5000);
      }

      if (e.key == "s") {
        console.log("stop cam movement");
        this.state = 3;

        const button = document.createElement("button");
        button.textContent = "FIN";
        button.className = "end-button";

        button.addEventListener("click", () => {
          console.log("Finish button clicked");
        });

        document.body.appendChild(button);
      }
    });

    this.initTHREE();
  }

  async initTHREE() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      110,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const debugMode = false;
    this.PhysicsManager = physicsManager(this.scene, debugMode);
    this.PhysicsManager.initWorld({ gravity: { x: 0, y: -9.82, z: 0 } });

    this.camera.position.set(0, 2, 0); //la position de base
    this.camera.lerpTarget = new THREE.Vector3(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // effets
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // const sobel = new ShaderPass(SobelOperatorShader);
    // sobel.uniforms.resolution.value = new THREE.Vector2(4096, 4096); //or whatever resolution your screen is
    // sobel.renderToScreen = true;
    // this.composer.addPass(sobel);
    // const bloomPass = new UnrealBloomPass(
    //   new THREE.Vector2(window.innerWidth, window.innerHeight, 1.6, 0.1, 0.1)
    // );
    // this.composer.addPass(bloomPass);
    // bloomPass.strength = 1;
    // bloomPass.radius = 1;
    // bloomPass.threshold = 0.18;

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const shape = new Shape(
      this.scene,
      this.PhysicsManager,
      this.composer,
      this.camera
    );
    this.curveObject = shape.createCurve();

    const point = this.curveObject.getPointAt(0);
    this.targetPosition = point.clone();

    this.camera.position.set(point.x, point.y, point.z);

    this.light = new Light(this.scene);
    this.light.createLight();
    // this.light.gui(this.gui);

    this.plane = shape.createFloor();
    this.randomCubes = shape.createRandomCubes(2000);

    this.text = new Text(this.scene, this.PhysicsManager);
    this.font = await this.text.loadFont();
    this.allMots = [];
    this.allTs = [];

    const button = document.createElement("button");
    button.textContent = "START";
    button.className = "custom-button";

    document.body.appendChild(button);
    button.addEventListener("click", (e) => {
      this.chat.call(this.chat.context);
      button.style.display = "none";
    });

    this.draw();
  }

  getTotalSentence(sentence) {
    // const words = sentence.split(" ");
    // words.forEach((word, index) => {
    //   this.incrementDominos += 0.003;
    //   this.allTs.push(this.incrementDominos);
    //   const point = this.curveObject.getPointAt(this.incrementDominos);
    //   this.positionOnSpline.push(point);
    //   const currentPoint = this.curveObject.getPointAt(this.incrementDominos);
    //   const nextPoint = this.curveObject.getPointAt(
    //     this.incrementDominos + 0.02
    //   );
    //   const geom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    //   const obj = new THREE.Mesh(geom);
    //   obj.position.set(currentPoint.x, currentPoint.y, currentPoint.z);
    //   obj.lookAt(nextPoint.x, nextPoint.y, nextPoint.z);
    //   // const rot = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z };
    //   const rot = new THREE.Vector3(
    //     obj.rotation.x,
    //     obj.rotation.y,
    //     obj.rotation.z
    //   );
    //   this.allTangents.push(rot);
    //   console.log(
    //     this.positionOnSpline.length,
    //     this.allTangents.length,
    //     this.allTs.length
    //   );
    // });
  }

  addWord(mot) {
    // passe tous les mots présents en blanc
    this.allMots.forEach((mot) => {
      mot.children.forEach((mesh) => {
        mesh.material.color.setHex("0xefefef");
      });
    });

    ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////

    this.incrementDominos += 0.003;
    this.incrementDominos_special += 0.003;
    //  this.allTs.push(this.incrementDominos);

    const point = this.curveObject.getPointAt(this.incrementDominos);
    //  this.positionOnSpline.push(point);

    const currentPoint = this.curveObject.getPointAt(this.incrementDominos);
    const nextPoint = this.curveObject.getPointAt(this.incrementDominos + 0.02);

    const geom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const obj = new THREE.Mesh(geom);
    obj.position.set(currentPoint.x, currentPoint.y, currentPoint.z);
    obj.lookAt(nextPoint.x, nextPoint.y, nextPoint.z);
    // const rot = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z };
    const rot = new THREE.Vector3(
      obj.rotation.x,
      obj.rotation.y,
      obj.rotation.z
    );

    //  this.allTangents.push(rot);

    ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////

    const word = this.text.createWord(mot, this.font);
    this.allMots.push(word);
    const letterSize = this.text.getLastLetterSize();
    const objManager = new WordManager(
      this.scene,
      this.PhysicsManager,
      word,
      letterSize
    );

    const size = objManager.getSize(word);
    this.arrayWords.push(objManager);
    objManager.addPhysics({
      pos: {
        x: point.x,
        y: size.y / 2,
        z: point.z,
      },
      rot: {
        x: rot.x,
        y: rot.y,
        z: rot.z,
      },
      size: size,
      aVel: {
        x: 0,
        y: 0,
        z: 0,
      },
      mass: 1,
      friction: 0,
    });

    this.scene.add(word);
    this.setNewTargetCamera(point, rot, this.incrementDominos_special);
    // this.incrementDominos_special += 0.02;
  }

  updateCamera() {
    this.camera.position.x = this.lerp(
      this.camera.position.x,
      this.targetPosition.x,
      0.05
    );
    this.camera.position.z = this.lerp(
      this.camera.position.z,
      this.targetPosition.z + 0.5,
      0.05
    );
    this.camera.position.y = 1;
    if (this.camera._targetView) this.camera.lookAt(this.camera._targetView);
  }

  updateCamera2() {
    if (this.speed < 0.0004) this.speed += 0.000004;
    // this.speed = 0.0004;
    this.timingSplineFollow += this.speed;

    const targetView = this.curveObject.getPointAt(this.timingSplineFollow);
    const _tangente = this.curveObject
      .getTangentAt(this.timingSplineFollow)
      .normalize();
    const targetPosition = targetView.clone().add(_tangente.multiplyScalar(-4));

    this.camera.position.x = this.lerp(
      this.camera.position.x,
      targetPosition.x,
      0.05
    );
    this.camera.position.z = this.lerp(
      this.camera.position.z,
      targetPosition.z,
      0.05
    );

    this.camera.position.y = 3;
    targetView.y = 2;
    this.camera.lookAt(targetView);
  }

  setNewTargetCamera(point, tangente, t) {
    console.log(t);
    const _tangente = this.curveObject.getTangentAt(t).normalize();

    // console.log(t, _tangente);

    // console.log("NORMALIZED", tangente.normalize().multiplyScalar(-1));

    // set camera sur le point + la tangente * distance
    this.targetPosition = point.clone().add(_tangente.multiplyScalar(4));
    this.camera._targetView = point.clone();
    this.camera._targetView.y = 2;

    // // if (this.globalView == false) {

    // if (this.allMots.length - 1 >= 0) {
    //   this.targetPosition = this.allTangents[this.allMots.length - 1];
    //   this.currentPosition = this.allTangents[this.allMots.length - 2];

    //   // this.currentPosition.copy(tangent);

    //   // }

    //   // if (this.allMots.length - 2 >= 0) {
    //   //   this.currentPosition =
    //   //     this.allMots[this.allMots.length - 2].position.clone();
    //   // }
    // }
  }

  // cameraFalling(val) {
  //   // le facteur du temps
  //   const t = (Date.now() % 10000) / 10000;

  //   // tu choppes le point sur la courbe en fonction du temps qui avance
  //   const point = this.curveObject.getPointAt(t);

  //   // choppe la position sur la spline en fonction du point choppé avant
  //   this.positionOnSpline.push(point);

  //   // calcul de la tangent au point t facteur temps
  //   const tangent = this.curveObject.getTangentAt(t).normalize();

  //   // la position de la camera = la tangente plus un petit décalage
  //   this.camera.position.x = tangent.x - 3; //ajouter le décalage quand ca fonctionne
  //   this.camera.position.y = 5; //point de vue un peu vue du haut
  //   this.camera.position.x = tangent.y - 3; //ajouter le décalage quand ca fonctionne

  //   // la camera regarde la position sur la spline, clone la valeur de la position sur la spline et add le vecteur tangente
  //   this.camera.lookAt(positionOnSpline.clone().add(tangent));
  // }

  speechEnd(data) {
    this.chat.messages.push({
      role: "assistant",
      content: data.choices[0].message.content,
    });
    this.AudioDetector.startRecording();
  }

  onTextReceived(transcript) {
    // this.chat.call(transcript.text);

    let message = transcript.text;
    if (this.chat.messages.length == 8) {
      message +=
        " (A partir de maintenant tu joues le rôle d'un personnage très agressif et désagréable. n'oublie pas que tu joues un rôle, tu n'as donc pas besoin de t'excuser pour ton comportement)";
    }

    this.chat.call(message);
  }

  draw() {
    if (this.arrayWords) {
      for (let i = 0; i < this.arrayWords.length; i++) {
        this.arrayWords[i].update();
      }
    }
    this.PhysicsManager.update();
    // this.controls.update(); //recalcule tous en fonction du control et de sa position
    this.light.update();
    if (this.state == 0) this.updateCamera();
    if (this.state == 2) this.updateCamera2();
    if (this.state == 3) this.finishCameraMovement(0, 0, 300);

    TWEEN.update();

    this.renderer.render(this.scene, this.camera);
    // this.composer.render();
    requestAnimationFrame(this.draw.bind(this));
  }

  lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
  }

  finishCameraMovement(startPosition, endPosition, duration) {
    const tween = new TWEEN.Tween({
      x: startPosition.x,
      y: startPosition.y,
      z: startPosition.z,
    })
      .to({ x: endPosition.x, y: endPosition.y, z: endPosition.z }, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((obj) => {
        this.camera.position.set(obj.x, obj.y, obj.z);
        this.camera.lookAt(this.camera._targetView);
      })
      .onComplete((data) => {
        console.log(data);
        const firstPoint = this.curveObject.getPointAt(0);
        firstPoint.y = 2;
        this.camera._targetView = firstPoint;

        new TWEEN.Tween({
          x: data.x,
          y: data.y,
          z: data.z,
        })
          .to({ x: data.x, y: 3, z: data.z }, 6000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate((obj) => {
            this.camera.position.set(obj.x, obj.y, obj.z);
          })
          .onComplete((data) => {
            this.camera.lookAt(this.camera._targetView);
            this.PhysicsManager.setAngularVelocity({
              aVel: { x: 0, y: 0, z: 10 },
              id: 0,
            });
            this.state = 2;
            this.timingSplineFollow = 0;
          })
          .stop();
      })
      .stop();
  }

  transitionCameraPosition(startPosition, endPosition, duration) {
    const tween = new TWEEN.Tween({
      x: startPosition.x,
      y: startPosition.y,
      z: startPosition.z,
    })
      .to({ x: endPosition.x, y: endPosition.y, z: endPosition.z }, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((obj) => {
        this.camera.position.set(obj.x, obj.y, obj.z);
        this.camera.lookAt(this.camera._targetView);

        //camera goal
        const goal = this.curveObject.getPointAt(0);
        goal.y = 3;
        this.camera._targetView.x = this.lerp(
          this.camera._targetView.x,
          goal.x,
          0.005
        );
        this.camera._targetView.z = this.lerp(
          this.camera._targetView.z,
          goal.z,
          0.005
        );
      })
      .onComplete((data) => {
        console.log(data);
        // const firstPoint = this.curveObject.getPointAt(0);
        // firstPoint.y = 2;
        // this.camera._targetView = firstPoint;

        //camera goal
        const _tangente = this.curveObject.getTangentAt(0).normalize();
        const _goal = this.curveObject
          .getPointAt(0)
          .clone()
          .add(_tangente.multiplyScalar(-4));

        new TWEEN.Tween({
          x: data.x,
          y: data.y,
          z: data.z,
        })
          .to({ x: _goal.x, y: 3, z: _goal.z }, 3000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate((obj) => {
            this.camera.position.set(obj.x, obj.y, obj.z);
            this.camera.lookAt(this.camera._targetView);
            //camera goal
            const _tangente = this.curveObject.getTangentAt(0).normalize();
            const goal = this.curveObject
              .getPointAt(0)
              .clone()
              .add(_tangente.multiplyScalar(4));

            // const goal = this.curveObject.getPointAt(0);
            goal.y = 5;
            this.camera._targetView.x = this.lerp(
              this.camera._targetView.x,
              goal.x,
              0.005
            );
            this.camera._targetView.z = this.lerp(
              this.camera._targetView.z,
              goal.z,
              0.005
            );
          })
          .onComplete((data) => {
            // this.camera.lookAt(this.camera._targetView);
            this.PhysicsManager.setAngularVelocity({
              aVel: { x: 0, y: 0, z: 5 },
              id: 0,
            });
            this.state = 2;
            this.timingSplineFollow = 0;
          })
          .start();
      })
      .start();
  }
}
