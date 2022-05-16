import Player from "../Player.js";

export default class Level {
    constructor(id, engine, name) {
        this.id = id;
        this.scene = new BABYLON.Scene(engine);
        this.name = name;
        this.currentPlayer = 0;
        this.players = [];
        this.cameras = [];
        this.canFinish = false;

        this.createScene(id,engine);
    }

    createScene(id, engine) {
        this.scene.dispose();
        this.players = [];
        this.cameras = [];
        this.scene = new BABYLON.Scene(engine)

        let gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        let physicsPlugin = new BABYLON.CannonJSPlugin();
        this.scene.enablePhysics(gravityVector, physicsPlugin);
        this.scene.assetsManager = new BABYLON.AssetsManager(this.scene);

        if (id === 0) {
            let ground = this.createGround();
            this.scene.clearColor = new BABYLON.Color3(1, 0, 1);
            this.buildWalls();
        } else {
            this.scene.clearColor = new BABYLON.Color3(1, 0, 0);

            let labTask = this.scene.assetsManager.addMeshTask("maze task", "", "assets/", "Level2.babylon");
            labTask.onSuccess = function (task) {

                let mazeMesh = task.loadedMeshes[0];
                //let mazeMaterial = new BABYLON.StandardMaterial("mazeMaterial", this.scene);
                // mazeMaterial.diffuseTexture = new BABYLON.Texture("assets/Labyrinthe_baked_DIFFUSE.jpg", this.scene);
                // mazeMesh.material.bumpTexture = new BABYLON.Texture("images/Maze_normal_4k.png");
                // mazeMesh.material = mazeMaterial;

                mazeMesh.position = new BABYLON.Vector3.Zero();
                mazeMesh.scaling = new BABYLON.Vector3(100, 100, 100);

                mazeMesh.physicsImpostor = new BABYLON.PhysicsImpostor(mazeMesh,
                    BABYLON.PhysicsImpostor.MeshImpostor, {mass: 0});
            }
            labTask.onError = function (task, message, exception) {
                console.log(message, exception);

            }
            this.scene.assetsManager.load();
        }

        this.scene.particlesEnabled = true;
        this.createLights();
        this.createAllSpheres(this.scene, id);
        this.currentPlayer = 0;
        this.scene.activeCamera = this.cameras[0];

    }

    buildWalls() {
        let wall = new BABYLON.MeshBuilder.CreateBox("wall", {height: 20, width: 2, depth: 300}, this.scene);

        let wallMaterial = new BABYLON.StandardMaterial("boxMaterial", this.scene);
        wallMaterial.diffuseTexture = new BABYLON.Texture("images/Wall.jpg", this.scene);
        wallMaterial.diffuseTexture.vScale = 3.0;
        wallMaterial.diffuseTexture.uScale = 3.0;
        wallMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        wall.material = wallMaterial;

        wall.position = new BABYLON.Vector3(15, 10, 140);
        wall.checkCollisions = true;
        wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall,
            BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0});

        let instance = wall.createInstance("wall2");
        instance.position.x = -15;
        instance.checkCollisions = true;
        instance.physicsImpostor = new BABYLON.PhysicsImpostor(instance,
            BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0});
    }

    createEnd() {
        if (!this.canFinish) {

            this.particleSystem = new BABYLON.ParticleSystem("particles", 500); // on construction
            this.particleSystem.particleTexture = new BABYLON.Texture("images/Particle.jpg", this.scene);
            this.particleSystem.emitter = new BABYLON.Vector3(0, 15, 300);
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

    checkIfFinish() {
        let emitterProjection = new BABYLON.Vector3(this.particleSystem.emitter.x, 0, this.particleSystem.emitter.z);
        if (this.players[0].playerMesh.intersectsPoint(emitterProjection)) {
            console.log("touché");
        }
    }


    createSphere(name, nb, pos_y, pos_x, pos_z, diffuseColor) {
        let sphereMesh = new BABYLON.MeshBuilder.CreateSphere(name, {diameter: 5}, this.scene);

        sphereMesh.position.y = pos_y;
        sphereMesh.position.x = pos_x;
        sphereMesh.position.z = pos_z;
        sphereMesh.frontVector = new BABYLON.Vector3(0, 0, 1);

        let sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", this.scene);
        sphereMaterial.diffuseTexture = new BABYLON.Texture("images/Ball.jpg", this.scene);
        sphereMesh.material = sphereMaterial;

        sphereMesh.physicsImpostor = new BABYLON.PhysicsImpostor(sphereMesh,
            BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 10,
                nativeOptions: {linearDamping: 0.35, angularDamping: 0.35}
            }, this.scene);

        let sphere = new Player(nb, sphereMesh, this.scene);
        this.players.push(sphere);
        let followCamera = this.createFollowCamera(this.scene, sphereMesh);

        sphereMesh.showBoundingBox = false;
    }

    createAllSpheres(scene, id) {
        if (id === 0) {
            // Sphere 1
            this.createSphere("player1", 0, 5, 0, 0, new BABYLON.Color3(0, 0, 0)); // rouge
            // Sphere 2
            this.createSphere("player2", 1, 5, 0, 20, new BABYLON.Color3(0, 1, 0));  // vert
            // Sphere 3
            this.createSphere("player3", 2, 5, 0, 30, new BABYLON.Color3(0, 0, 1)); // bleu
            // Sphere 4
            this.createSphere("player4", 3, 5, 0, 40, new BABYLON.Color3(1, 0, 1)); // violet
            // Sphere 5
            this.createSphere("player5", 5, 5, 0, 50, new BABYLON.Color3(0, 1, 1)); // cyan

        } else {
            this.createSphere("player6", 0, 5, 0, 0, new BABYLON.Color3(1, 0, 0)); // rouge
            // Sphere 2
            this.createSphere("player7", 1, 5, 0, 20, new BABYLON.Color3(0, 1, 0));  // vert
        }

    }



    createFollowCamera(scene, target) {
        let camera = new BABYLON.ArcRotateCamera("playerFollowCamera",
            BABYLON.Tools.ToRadians(-90), // -90
            BABYLON.Tools.ToRadians(70),    // 20
            70, // 70
            target.position,
            this.scene);

        camera.checkCollisions = true;
        camera.panningAxis = new BABYLON.Vector3(0, 0, 0);
        camera.lockedTarget = target;
        camera.cameraAcceleration = 0.1; // how fast to move
        camera.maxCameraSpeed = 5; // speed limit
        camera.lowerRadiusLimit = 30;
        camera.upperRadiusLimit = 100;
        camera.upperBetaLimit = (Math.PI / 2);
        camera.attachControl(this.scene.canvas, false, false, 0);

        this.cameras.push(camera);

        return camera;
    }


    createGround() {
        const groundOptions = { width:2000, height:2000, subdivisions:20, minHeight:0, maxHeight:100};
        //scene is optional and defaults to the current scene
        let ground = BABYLON.MeshBuilder.CreateGround("ground", groundOptions, this.scene);
        let groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/woodFloor.jpg", this.scene);
        groundMaterial.diffuseTexture.uScale = 10;
        groundMaterial.diffuseTexture.vScale = 10;
        ground.material = groundMaterial;

        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //groundMaterial.wireframe=true;
        // for physic engine
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, this.scene);
        return ground;
    }

    createLights() {
        let light = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), this.scene);
        light.position.z = 2;
    }
}
