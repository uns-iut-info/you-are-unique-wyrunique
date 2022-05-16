import Player from "../Player.js";
import GameState from "../GameState.js";
import Options from "../Options.js";

export default class AbstractLevel extends BABYLON.Scene{

    constructor(engine, canvas, id){
        super(engine, canvas);

        if (this.constructor === AbstractLevel){
            throw new TypeError('Abstract class "AbstractMenu" cannot be instanciated directly');
        }

        this.createLoadingOpen()

        this.id = id;
        this.name = null;
        this.players = [];
        this.cameras = [];
        this.doors = [];
        this.currentPlayer = 0;
        this.canFinish = false;
        this.endPosition = new BABYLON.Vector3(0,0,0);
        this.activeCamera = this.createFreeCamera(this); //Default camera until the rest of the scene is loaded with the cameras

        this.createScene(engine, id);

        // Music
        this.effectSoundTrack = new BABYLON.SoundTrack(this);
        this.effectButtonSoundTrack = new BABYLON.SoundTrack(this);
        this.effectDoorSoundTrack = new BABYLON.SoundTrack(this);
        this.effectHoleSoundTrack = new BABYLON.SoundTrack(this);
        this.addMusic();
        this.addSoundEffect();

    }

    createScene(engine, id){
        this.clearColor = new BABYLON.Color3(0, 0, 0);

        let gravityVector = new BABYLON.Vector3(0,-29.81, 0);
        let physicsPlugin = new BABYLON.CannonJSPlugin();
        this.enablePhysics(gravityVector, physicsPlugin);
        this.assetsManager = new BABYLON.AssetsManager(this);

        this.createLights();
        this.buildWalls(engine, id);
    }

    addMusic(){
        this.music = new BABYLON.Sound("menuMusic", "musics/Funambule1.mp3", this, null,
            {
                loop: true,
                autoplay:true,
                volume: Options.levelMusic
            });
    }
    addSoundEffect(){
        this.mergeSound = new BABYLON.Sound("mergeSound",
            "musics/mixkit-fast-small-sweep-transition-166.wav",
            this,
            null,
            {
                volume: Options.levelSoundEffect
            }
        );
        this.effectSoundTrack.addSound(this.mergeSound);

        this.buttonSound = new BABYLON.Sound("buttonSound",
            "musics/buttonSound.mp3",
            this,
            null,
            {
                volume: (Options.levelSoundEffect-0.5)%2
            }
            );
        this.effectButtonSoundTrack.addSound(this.buttonSound);

        this.doorSound = new BABYLON.Sound("doorSound",
            "musics/door/scary_wooden_door.wav",
            this,
            null,
            {
                volume: (Options.levelSoundEffect -0.8)%2
            });
        this.effectDoorSoundTrack.addSound(this.doorSound);

        this.holeSound = new BABYLON.Sound("holeSound",
            "musics/ball_hole_sound.mp3",
            this,
            null,
            {
                volume: Options.levelSoundEffect
            });
        this.effectHoleSoundTrack.addSound(this.holeSound);
    }

    buildWalls(engine, lvlID) {
        let labTask = this.assetsManager.addMeshTask("maze task", "", "assets/", "Level" + lvlID + ".babylon");
        labTask.onSuccess = (task) => {
            //Load the maze itself with the texture
            this.mazeMesh = task.loadedMeshes.find(function (mesh) {
                return mesh.name === "Labyrinthe";
            });
            this.mazeMesh.material.diffuseTexture = new BABYLON.Texture("images/Level"+ lvlID +"/Level" + lvlID + "_color.png", this.scene);
            this.mazeMesh.material.bumpTexture = new BABYLON.Texture("images/Level"+ lvlID +"/Level" + lvlID + "_normal.png");

            this.mazeMesh.position = new BABYLON.Vector3.Zero();

            this.mazeMesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mazeMesh,
                BABYLON.PhysicsImpostor.MeshImpostor, {mass: 0});

            //Create the player's mesh based on the position of an invisible mesh created in Blender
            let playerSpawnMesh = task.loadedMeshes.find(function (mesh) {
                return mesh.name === "Player";
            });
            this.createSphere(playerSpawnMesh.name, 0, playerSpawnMesh.position.x, playerSpawnMesh.position.y, playerSpawnMesh.position.z);

            //Repeat this operation for every other sphere
            for (let i = 1; i <= task.loadedMeshes.length-2; i++) {
                let partSpawnMesh = task.loadedMeshes.find(function (mesh) {
                    return mesh.name === "Part"+i;
                });

                if (partSpawnMesh !== undefined) {
                    this.createSphere(partSpawnMesh.name, i, partSpawnMesh.position.x, partSpawnMesh.position.y, partSpawnMesh.position.z);
                }
            }

            //Set the camera to the second created one which is the player's
            this.activeCamera = this.cameras[1];
            //And remove the free camera that was created to let the scene renders
            this.cameras.shift();

            this.setButtonAndDoor();
            this.loadSpecificObjects();

            let finished = this.createAdvancedTexture("gui/guiTextureLevel.json", "guiLevel");
        }

        labTask.onError = function (task, message, exception) {
            console.log(message, exception);
        }
        this.assetsManager.load();

    }

    loadSpecificObjects() {
        console.log("Nothing to load.")
    }

    setButtonAndDoor(){
        console.log("No door to load.");
    }

    async createAdvancedTexture(path, name){
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(name, true, this);
        let loadedGui = await this.advancedTexture.parseFromURLAsync(path);

        this.quitButton = this.advancedTexture.getControlByName("quitButton");
        this.restartButton = this.advancedTexture.getControlByName("restartButton");

        this.advancedTexture.getControlByName("globalGrid").isPointerBlocker = false;
        this.advancedTexture.getControlByName("upGrid").isPointerBlocker = false;

        if (name === "guiLevel"){
            this.advancedTexture.getControlByName("remainingBallGrid").isPointerBlocker = false;
            this.nbBallText = this.advancedTexture.getControlByName("textNbBall");
            this.nbBallText.text = this.players.length;
        }

        this.quitButton.onPointerUpObservable.add(function (){
            GameState.GameState = GameState.LevelMenu;
            console.log("level to level menu");
        })
        this.restartButton.onPointerUpObservable.add(function (){
            GameState.restartLevel = true;
            console.log("restart level");
        })
    }

    createButtonMesh(position, name){
        let button = BABYLON.MeshBuilder.CreateBox(name,
            {
                height: 3,
                width: 20,
                depth: 20,
                updatable: true
            });
        button.position = position;

        let outButton = BABYLON.MeshBuilder.CreateBox("ext"+name,
            {
                height: 2.9,
                width: 23,
                depth: 23,
                updatable:true
            });
        outButton.position = position;

        let csgButton = BABYLON.CSG.FromMesh(button);
        let csgOutButton = BABYLON.CSG.FromMesh(outButton);
        let csgExtButton = csgOutButton.subtract(csgButton)

        let extButton = csgExtButton.toMesh("extButton"+name, null, this);
        extButton.position = position;

        outButton.dispose();
        this.removeMesh(outButton);


        let buttonMaterial = new BABYLON.StandardMaterial(name+"Material", this);
        buttonMaterial.diffuseTexture = new BABYLON.Texture("images/Common/buttonTexture.jpg", this);
        buttonMaterial.diffuseColor = new BABYLON.Color3(1,0.5,0);
        button.material = buttonMaterial;

        let extButtonMaterial = new BABYLON.StandardMaterial("ext"+name+"Material", this);
        extButtonMaterial.diffuseColor = new BABYLON.Color3(0.2,0.2,0.2);
        extButton.material = extButtonMaterial;

        button.physicsImpostor = new BABYLON.PhysicsImpostor(button,
            BABYLON.PhysicsImpostor.BoxImpostor, {
                ignoreParent: true
            }, this);

        extButton.physicsImpostor = new BABYLON.PhysicsImpostor(extButton,
            BABYLON.PhysicsImpostor.MeshImpostor, {
                ignoreParent: true
            }, this);

        return button;
    }
    createPlateformJumpMesh(position, name){
        let abstractPlane = BABYLON.Plane.FromPositionAndNormal(position, new BABYLON.Vector3(0,1,0));
        let plane = BABYLON.MeshBuilder.CreatePlane("plane", {
            size:15,
            sourcePlane:abstractPlane,
            sideOrientation:BABYLON.Mesh.DOUBLESIDE
        })
        plane.position = position;

        return plane;
    }

    createSphere(name, nb, pos_x, pos_y, pos_z){
        let sphereMesh = new BABYLON.MeshBuilder.CreateSphere(name, {diameter: 5}, this);

        sphereMesh.position.y = pos_y;
        sphereMesh.position.x = pos_x;
        sphereMesh.position.z = pos_z;
        sphereMesh.frontVector = new BABYLON.Vector3(0, 0, 1);

        let sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", this);
        sphereMaterial.diffuseTexture = new BABYLON.Texture("images/Common/Ball.jpg", this);
        sphereMesh.material = sphereMaterial;

        sphereMesh.physicsImpostor = new BABYLON.PhysicsImpostor(sphereMesh,
            BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 10,
                nativeOptions: {linearDamping: 0.35, angularDamping: 0.35}
            }, this);

        let sphere = new Player(nb, sphereMesh, this);
        this.players.push(sphere);
        let followCamera = this.createFollowCamera(this, sphereMesh);

        sphereMesh.showBoundingBox = false;
    }

    createLights() {
        // i.e sun light with all light rays parallels, the vector is the direction.
        let light0 = new BABYLON.HemisphericLight("dir0", new BABYLON.Vector3(1, 0, 0), this);
        let light1 = new BABYLON.HemisphericLight("dir0", new BABYLON.Vector3(-1, 0, 0), this);
    }

    createFollowCamera(scene, target) {
        let camera = new BABYLON.ArcRotateCamera("playerFollowCamera",
            BABYLON.Tools.ToRadians(-90), // -90
            BABYLON.Tools.ToRadians(70),    // 20
            70, // 70
            target.position,
            this);

        camera.checkCollisions = true;
        camera.panningAxis = new BABYLON.Vector3(0, 0, 0);
        camera.setTarget(target);
        camera.cameraAcceleration = 0.1; // how fast to move
        camera.maxCameraSpeed = 5; // speed limit
        camera.lowerRadiusLimit = 30;
        camera.upperRadiusLimit = 100;
        camera.upperBetaLimit = (Math.PI / 2);

        // vitesse de déplacement de la caméra
        camera.inertia = 0.3;
        camera.inertialAlphaOffset = 10; // droite gauche
        camera.inertialBetaOffset = 10; // haut bas
        camera.inertialRadiusOffset = 10; // zoom

        camera.attachControl(this.canvas, true);
        return camera;
    }

    createEnd(position) {
        if (!this.canFinish) {

            this.particleSystem = new BABYLON.ParticleSystem("particles", 500, this); // on construction
            this.particleSystem.particleTexture = new BABYLON.Texture("images/Common/Particle.jpg", this);
            this.particleSystem.emitter = position;
            this.particleSystem.emitRate = 200;

            this.particleSystem.direction1 = new BABYLON.Vector3(-7, -5, 10);
            this.particleSystem.direction2 = new BABYLON.Vector3(7, -5, -10);

            this.particleSystem.minLifeTime = 0.3;
            this.particleSystem.maxLifeTime = 1.5;

            this.particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
            this.particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
            this.particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

            this.particleSystem.start();
            this.canFinish = true;
        }
    }

    changePlayer(){
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        console.log("Switching to player/camera " + this.currentPlayer);
        this.activeCamera = this.cameras[this.currentPlayer];
        return true;
    }

    createFreeCamera(scene) {
        let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
        camera.attachControl(this.canvas);
        // prevent camera to cross ground
        camera.checkCollisions = true;
        // avoid flying with the camera
        camera.applyGravity = true;

        // Add extra keys for camera movements
        // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
        camera.keysUp.push('z'.charCodeAt(0));
        camera.keysDown.push('s'.charCodeAt(0));
        camera.keysLeft.push('q'.charCodeAt(0));
        camera.keysRight.push('d'.charCodeAt(0));
        camera.keysUp.push('Z'.charCodeAt(0));
        camera.keysDown.push('S'.charCodeAt(0));
        camera.keysLeft.push('Q'.charCodeAt(0));
        camera.keysRight.push('D'.charCodeAt(0));

        return camera;
    }


    createLoadingOpen(){
        this.loadingAdvancedTexture = new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("loadingTexture", this);

        let perc = 0;
        this.loadingAdvancedTexture.ellipses = [];
        for (let i=0; i< 35; i++){
            let r = this.createEllipse(perc, perc, 100, this.loadingAdvancedTexture);
            this.loadingAdvancedTexture.ellipses.push(r);
            perc += 30+i*2;
        }

        let i= 0;
        this.interval = setInterval( () => {
            this.loadingAdvancedTexture.ellipses[i].alpha = 0;
            i++;
            if (i === 35){
                this.loadingAdvancedTexture.dispose();
                clearInterval(this.interval);
            }
        }, 10);
    }

    createEllipse( width, height, thickness, advancedTexture){
        let ellipse = new BABYLON.GUI.Ellipse();
        ellipse.width = width+"px";
        ellipse.height = height+"px";
        ellipse.color = "black";
        ellipse.background = "transparent";
        ellipse.thickness = thickness;
        advancedTexture.addControl(ellipse);
        return ellipse;
    }
}