import AbstractLevel from "./AbstractLevel.js";

export default class Level2 extends AbstractLevel{

    constructor(engine, canvas, id) {
        super(engine, canvas);

        this.createScene(id, engine);
    }

    createScene(id, engine) {
        this.clearColor = new BABYLON.Color3(0, 0, 0);

        let gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        let physicsPlugin = new BABYLON.CannonJSPlugin();
        this.enablePhysics(gravityVector, physicsPlugin);
        this.assetsManager = new BABYLON.AssetsManager(this);

        this.createLights();
        this.buildWalls(id);
        this.currentPlayer = 0;
        this.endPosition = new BABYLON.Vector3(0, 15, 250);
    }
}
