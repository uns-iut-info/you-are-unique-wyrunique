import Player from "../Player.js";
import GameState from "../GameState.js";
import Options from "../Options.js";

export default class AbstractLevel extends BABYLON.Scene{

    constructor(engine, canvas, id){
        super(engine, canvas);

        if (this.constructor === AbstractLevel){
            throw new TypeError('Abstract class "AbstractMenu" cannot be instanciated directly');
        }

        this.id = id;
        this.name = null;
        this.players = [];
        this.cameras = [];
        this.currentPlayer = 0;
        this.canFinish = false;
        this.endPosition = new BABYLON.Vector3(0, 15, 0);

        this.activeCamera = this.createFreeCamera(this); //Default camera until the rest of the scene is loaded with the cameras

        let finished = this.createAdvancedTexture("gui/guiTextureLevel.json", "guiLevel");

        this.effectSoundTrack = new BABYLON.SoundTrack(this);

        let music = new BABYLON.Sound("menuMusic", "musics/Funambule1.mp3", this, null,
            {
                loop: true,
                autoplay:true,
                volume: Options.levelMusic
            });

        this.mergeSound = new BABYLON.Sound("mergeSound",
            "musics/mixkit-fast-small-sweep-transition-166.wav",
            this,
        null,
            {
                volume: Options.levelSoundEffect
            }
            );
        this.effectSoundTrack.addSound(this.mergeSound);
    }

    async createAdvancedTexture(path, name){
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(name, true, this);
        let loadedGui = await this.advancedTexture.parseFromURLAsync(path);


        this.quitButton = this.advancedTexture.getControlByName("quitButton");
        this.restartButton = this.advancedTexture.getControlByName("restartButton");

        if (name === "guiLevel"){
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

    buildWalls(lvlID) {
        let labTask = this.assetsManager.addMeshTask("maze task", "", "assets/", "Level" + lvlID + ".babylon");
        labTask.onSuccess = (task) => {

            //Load the maze itself with the texture
            let mazeMesh = task.loadedMeshes[0];
            mazeMesh.material.diffuseTexture = new BABYLON.Texture("images/Level" + lvlID + "_color.png", this.scene);
            mazeMesh.material.bumpTexture = new BABYLON.Texture("images/Level" + lvlID + "_normal.png");

            mazeMesh.position = new BABYLON.Vector3.Zero();

            mazeMesh.physicsImpostor = new BABYLON.PhysicsImpostor(mazeMesh,
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
        }

        labTask.onError = function (task, message, exception) {
            console.log(message, exception);
        }
        this.assetsManager.load();

    }


    createSphere(name, nb, pos_x, pos_y, pos_z){
        let sphereMesh = new BABYLON.MeshBuilder.CreateSphere(name, {diameter: 5}, this);

        sphereMesh.position.y = pos_y;
        sphereMesh.position.x = pos_x;
        sphereMesh.position.z = pos_z;
        sphereMesh.frontVector = new BABYLON.Vector3(0, 0, 1);

        let sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", this);
        sphereMaterial.diffuseTexture = new BABYLON.Texture("images/Ball.jpg", this);
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
        // light0.position.y = 100;

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
        camera.lockedTarget = target;
        camera.cameraAcceleration = 0.1; // how fast to move
        camera.maxCameraSpeed = 5; // speed limit
        camera.lowerRadiusLimit = 30;
        camera.upperRadiusLimit = 100;
        camera.upperBetaLimit = (Math.PI / 2);
        camera.attachControl(this.canvas, false, false, 0);

        return camera;
    }

    createEnd(position) {
        if (!this.canFinish) {

            this.particleSystem = new BABYLON.ParticleSystem("particles", 500, this); // on construction
            this.particleSystem.particleTexture = new BABYLON.Texture("images/Particle.jpg", this);
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
}