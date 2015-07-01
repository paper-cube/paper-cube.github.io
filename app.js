// MESSY CODE, WILL BE CLEANED UP SOON!


//THREEJS RELATED VARIABLES

var scene,
    camera,
    controls,
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
    shadowLight,
    backLight,
    light,
    renderer,
    container;

//SCENE
var floor, elephant, fan,
    sphere,
    isBlowing = false;

//SCREEN VARIABLES

var HEIGHT,
    WIDTH,
    windowHalfX,
    windowHalfY,
    mousePos = {x: 0, y: 0};
dist = 0;
angleZ = 0;
angleY = 0;

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function init() {
    scene = new THREE.Scene();
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 2000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane);
    camera.position.z = 800;
    camera.position.y = 0;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mousedown', handleMouseDown, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    /*
     controls = new THREE.OrbitControls( camera, renderer.domElement);
     //*/
}

function onWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
    mousePos = {x: event.clientX, y: event.clientY};
}

function handleMouseDown(event) {
    isBlowing = true;
}
function handleMouseUp(event) {
    isBlowing = false;
}

function handleTouchStart(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
        mousePos = {x: event.touches[0].pageX, y: event.touches[0].pageY};
        isBlowing = true;
    }
}

function handleTouchEnd(event) {
    mousePos = {x: windowHalfX, y: windowHalfY};
    isBlowing = false;
}

function handleTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        mousePos = {x: event.touches[0].pageX, y: event.touches[0].pageY};
    }
}

function createLights() {
    light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5)

    shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = .2;

    backLight = new THREE.DirectionalLight(0xffffff, .4);
    backLight.position.set(-100, 200, 50);
    backLight.shadowDarkness = .1;
    backLight.castShadow = true;

    scene.add(backLight);
    scene.add(light);
    scene.add(shadowLight);
}

function createFloor() {
    floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 500), new THREE.MeshBasicMaterial({color: 0xebe5e7}));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -100;
    floor.receiveShadow = true;
    scene.add(floor);
}

function createElephant() {
    elephant = new Elephant();
    scene.add(elephant.threegroup);
}

function createFan() {
    fan = new Fan();
    fan.threegroup.position.z = 350;
    scene.add(fan.threegroup);
}

Fan = function () {
    this.isBlowing = false;
    this.speed = 0;
    this.acc = 0;
    this.redMat = new THREE.MeshLambertMaterial({
        color: 0xE17338,
        shading: THREE.FlatShading
    });
    this.greenMat = new THREE.MeshLambertMaterial({
        color: 0xA5C85A,
        shading: THREE.FlatShading
    });

    this.blueMat = new THREE.MeshLambertMaterial({
        color: 0x4084BB,
        shading: THREE.FlatShading
    });

    this.greyMat = new THREE.MeshLambertMaterial({
        color: 0x777777,
        shading: THREE.FlatShading
    });

    var coreGeom = new THREE.BoxGeometry(10, 10, 20);
    var sphereGeom = new THREE.BoxGeometry(10, 10, 3);
    var propGeom = new THREE.BoxGeometry(15, 45, 2);
    propGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 45, 20));

    this.core = new THREE.Mesh(coreGeom, this.greyMat);
    var prop1 = new THREE.Mesh(propGeom, this.greenMat);
    prop1.position.z = 0;
    var prop2 = new THREE.Mesh(propGeom, this.redMat);
    prop2.rotation.z = Math.PI / 3;
    var prop3 = new THREE.Mesh(propGeom, this.blueMat);
    prop3.rotation.z = Math.PI;

    this.sphere = new THREE.Mesh(sphereGeom, this.greyMat);
    this.sphere.position.z = 15;

    this.propeller = new THREE.Group();
    this.propeller.add(prop1);
    this.propeller.add(prop2);
    this.propeller.add(prop3);


    this.threegroup = new THREE.Group();
    this.threegroup.add(this.core);
    this.threegroup.add(this.propeller);
    this.threegroup.add(this.sphere);
};

Fan.prototype.update = function (xTarget, yTarget) {
    this.threegroup.lookAt(new THREE.Vector3(0, 80, 60));

    this.tPosX = rule3(xTarget, -200, 200, -250, 250);
    this.tPosY = rule3(yTarget, -200, 200, 250, -250);

    this.threegroup.position.x += (this.tPosX - this.threegroup.position.x) / 10;
    this.threegroup.position.y += (this.tPosY - this.threegroup.position.y) / 10;

    if (this.isBlowing && this.speed < .5) {
        this.acc += .001;
        this.speed += this.acc;
    } else if (!this.isBlowing) {
        this.speed *= .98;
    }

    this.propeller.rotation.z += this.speed;
};

Elephant = function () {
    this.windTime = 0;
    this.threegroup = new THREE.Group();

    this.blueMat = new THREE.MeshLambertMaterial({
        color: 0x9399E3,
        shading: THREE.FlatShading
    });

    this.whiteMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading
    });

    this.purpleMat = new THREE.MeshLambertMaterial({
        color: 0x451954,
        shading: THREE.FlatShading
    });

    this.greyMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading
    });

    this.blackMat = new THREE.MeshLambertMaterial({
        color: 0x302925,
        shading: THREE.FlatShading
    });


    var bodyGeom = new THREE.CylinderGeometry(60, 90, 140, 16);
    var faceGeom = new THREE.BoxGeometry(80, 120, 80);
    var tuskGeom = new THREE.CylinderGeometry(5, 10, 70, 10);
    tuskGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-60));
    var earGeom = new THREE.BoxGeometry(120, 120, 20);
    earGeom.applyMatrix(new THREE.Matrix4().makeRotationY(10));
    var noseGeom = new THREE.CylinderGeometry(25, 10, 120, 50);
    noseGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-6.9));
    var eyeGeom = new THREE.BoxGeometry(5, 20, 20);
    var irisGeom = new THREE.BoxGeometry(4, 10, 10);
    var mouthGeom = new THREE.BoxGeometry(20, 20, 10);
    var smileGeom = new THREE.TorusGeometry(12, 4, 2, 10, Math.PI);
    var lipsGeom = new THREE.BoxGeometry(40, 15, 20);
    var footGeom = new THREE.BoxGeometry(40, 35, 20);

    // body
    this.body = new THREE.Mesh(bodyGeom, this.blueMat);
    this.body.position.z = -40;
    this.body.position.y = -2;

    // feet
    this.backLeftFoot = new THREE.Mesh(footGeom, this.blueMat);
    this.backLeftFoot.position.z = -40;
    this.backLeftFoot.position.x = 65;
    this.backLeftFoot.position.y = -85;

    this.backRightFoot = new THREE.Mesh(footGeom, this.blueMat);
    this.backRightFoot.position.z = -40;
    this.backRightFoot.position.x = -65;
    this.backRightFoot.position.y = -85;

    this.frontRightFoot = new THREE.Mesh(footGeom, this.blueMat);
    this.frontRightFoot.position.z = 20;
    this.frontRightFoot.position.x = -32;
    this.frontRightFoot.position.y = -90;

    this.frontLeftFoot = new THREE.Mesh(footGeom, this.blueMat);
    this.frontLeftFoot.position.z = 20;
    this.frontLeftFoot.position.x = 32;
    this.frontLeftFoot.position.y = -90;

    // face
    this.face = new THREE.Mesh(faceGeom, this.blueMat);
    this.face.position.z = 135;

    // tusks

    this.tusks = [];
    this.tusk1 = new THREE.Mesh(tuskGeom, this.greyMat);
    this.tusk1.position.x = 30;
    this.tusk1.position.y = -45;
    this.tusk1.position.z = 175;

    this.tusk4 = this.tusk1.clone();
    this.tusk4.position.x = -30;

    // eyes
    this.leftEye = new THREE.Mesh(eyeGeom, this.whiteMat);
    this.leftEye.position.x = 40;
    this.leftEye.position.z = 120;
    this.leftEye.position.y = 25;

    this.rightEye = new THREE.Mesh(eyeGeom, this.whiteMat);
    this.rightEye.position.x = -40;
    this.rightEye.position.z = 120;
    this.rightEye.position.y = 25;

    // iris
    this.leftIris = new THREE.Mesh(irisGeom, this.purpleMat);
    this.leftIris.position.x = 42;
    this.leftIris.position.z = 120;
    this.leftIris.position.y = 25;

    this.rightIris = new THREE.Mesh(irisGeom, this.purpleMat);
    this.rightIris.position.x = -42;
    this.rightIris.position.z = 120;
    this.rightIris.position.y = 25;

    // ear
    this.rightEar = new THREE.Mesh(earGeom, this.blueMat);
    this.rightEar.position.x = -80;
    this.rightEar.position.y = 50;
    this.rightEar.position.z = 105;

    this.leftEar = new THREE.Mesh(earGeom, this.blueMat);
    this.leftEar.applyMatrix(new THREE.Matrix4().makeRotationY(-20));
    this.leftEar.position.x = 80;
    this.leftEar.position.y = 50;
    this.leftEar.position.z = 105;

    // nose
    this.nose = new THREE.Mesh(noseGeom, this.blueMat);
    this.nose.position.z = 190;
    this.nose.position.y = -35;

    // head
    this.head = new THREE.Group();
    this.head.add(this.face);
    this.head.add(this.rightEar);
    this.head.add(this.leftEar);
    this.head.add(this.nose);
    this.head.add(this.leftEye);
    this.head.add(this.rightEye);
    this.head.add(this.leftIris);
    this.head.add(this.rightIris);
    this.head.add(this.tusk1);
    this.head.add(this.tusk4);
    this.head.position.y = 60;

    this.threegroup.add(this.body);
    this.threegroup.add(this.head);
    this.threegroup.add(this.backLeftFoot);
    this.threegroup.add(this.backRightFoot);
    this.threegroup.add(this.frontRightFoot);
    this.threegroup.add(this.frontLeftFoot);

    this.threegroup.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
};

Elephant.prototype.updateHead = function (speed) {

    this.head.rotation.y += (this.tHeagRotY - this.head.rotation.y) / speed;
    this.head.rotation.x += (this.tHeadRotX - this.head.rotation.x) / speed;
    this.head.position.x += (this.tHeadPosX - this.head.position.x) / speed;
    this.head.position.y += (this.tHeadPosY - this.head.position.y) / speed;
    this.head.position.z += (this.tHeadPosZ - this.head.position.z) / speed;

    this.leftEye.scale.y += (this.tEyeScale - this.leftEye.scale.y) / (speed * 2);
    this.rightEye.scale.y = this.leftEye.scale.y;

    this.leftIris.scale.y += (this.tIrisYScale - this.leftIris.scale.y) / (speed * 2);
    this.rightIris.scale.y = this.leftIris.scale.y;

    this.leftIris.scale.z += (this.tIrisZScale - this.leftIris.scale.z) / (speed * 2);
    this.rightIris.scale.z = this.leftIris.scale.z;

    this.leftIris.position.y += (this.tIrisPosY - this.leftIris.position.y) / speed;
    this.rightIris.position.y = this.leftIris.position.y;
    this.leftIris.position.z += (this.tLeftIrisPosZ - this.leftIris.position.z) / speed;
    this.rightIris.position.z += (this.tRightIrisPosZ - this.rightIris.position.z) / speed;
};

Elephant.prototype.look = function (xTarget, yTarget) {
    this.tHeagRotY = rule3(xTarget, -200, 200, -Math.PI / 4, Math.PI / 4);
    this.tHeadRotX = rule3(yTarget, -200, 200, -Math.PI / 4, Math.PI / 4);
    this.tHeadPosX = rule3(xTarget, -200, 200, 70, -70);
    this.tHeadPosY = rule3(yTarget, -140, 260, 20, 100);
    this.tHeadPosZ = 0;


    this.tEyeScale = 1;
    this.tIrisYScale = 1;
    this.tIrisZScale = 1;
    this.tIrisPosY = rule3(yTarget, -200, 200, 35, 15);
    this.tLeftIrisPosZ = rule3(xTarget, -200, 200, 130, 110);
    this.tRightIrisPosZ = rule3(xTarget, -200, 200, 110, 130);

    this.updateHead(10);

    for (var i = 0; i < this.tusks.length; i++) {
        var m = this.tusks[i];
        m.rotation.y = 0;
    }
};

Elephant.prototype.dry = function (xTarget, yTarget) {
    this.tHeagRotY = rule3(xTarget, -200, 200, Math.PI / 4, -Math.PI / 4);
    this.tHeadRotX = rule3(yTarget, -200, 200, Math.PI / 4, -Math.PI / 4);
    this.tHeadPosX = rule3(xTarget, -200, 200, -70, 70);
    this.tHeadPosY = rule3(yTarget, -140, 260, 100, 20);
    this.tHeadPosZ = 100;

    this.tEyeScale = 0.1;
    this.tIrisYScale = 0.1;
    this.tIrisZScale = 3;

    this.tIrisPosY = 20;
    this.tLeftIrisPosZ = 120;
    this.tRightIrisPosZ = 120;

    this.updateHead(10);


    var dt = 20000 / (xTarget * xTarget + yTarget * yTarget);
    dt = Math.max(Math.min(dt, 1), .5);
    this.windTime += dt;

    this.leftEar.rotation.x = Math.cos(this.windTime) * Math.PI / 16 * dt;
    this.rightEar.rotation.x = -Math.cos(this.windTime) * Math.PI / 16 * dt;


    for (i = 0; i < this.tusks.length; i++) {
        var m = this.tusks[i];
        var amp = (i < 3) ? -Math.PI / 8 : Math.PI / 8;
        m.rotation.y = amp + Math.cos(this.windTime + i) * dt * amp;
    }
};

function loop() {
    render();
    var xTarget = (mousePos.x - windowHalfX);
    var yTarget = (mousePos.y - windowHalfY);

    elephant.isDrying = isBlowing;
    fan.isBlowing = isBlowing;
    fan.update(xTarget, yTarget);
    if (isBlowing) {
        elephant.dry(xTarget, yTarget);
    } else {
        elephant.look(xTarget, yTarget);
    }
    requestAnimationFrame(loop);
}

function render() {
    if (controls) controls.update();
    renderer.render(scene, camera);
}


init();
createLights();
createFloor();
createElephant();
createFan();
loop();


function rule3(v, vmin, vmax, tmin, tmax) {
    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    return tmin + (pc * dt);

}
