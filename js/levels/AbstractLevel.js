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


    createSphere(name, nb, pos_y, pos_x, pos_z, diffuseColor){
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

    buildWalls(lvlID) {
        let labTask = this.assetsManager.addMeshTask("maze task", "", "assets/", "Level" + lvlID + ".babylon");
        labTask.onSuccess = function (task) {

            let mazeMesh = task.loadedMeshes[0];
            //let mazeMaterial = new BABYLON.StandardMaterial("mazeMaterial", this.scene);
            mazeMesh.material.diffuseTexture = new BABYLON.Texture("images/Level" + lvlID + "_color.png", this.scene);
            mazeMesh.material.bumpTexture = new BABYLON.Texture("images/Level" + lvlID + "_normal.png");
            //mazeMesh.material = mazeMaterial;

            mazeMesh.position = new BABYLON.Vector3.Zero();
            mazeMesh.scaling = new BABYLON.Vector3(100, 100, 100);

            mazeMesh.physicsImpostor = new BABYLON.PhysicsImpostor(mazeMesh,
                BABYLON.PhysicsImpostor.MeshImpostor, {mass: 0});
        }
        labTask.onError = function (task, message, exception) {
            console.log(message, exception);

        }
        this.assetsManager.load();
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
}