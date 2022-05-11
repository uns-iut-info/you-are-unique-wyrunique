import GameState from "../GameState.js";
import Options from "../Options.js";

export default class CongratulationMenu extends BABYLON.Scene{

    constructor(engine, canvas) {
        super(engine, canvas);
        let finished = this.createAdvancedTexture("gui/guiTextureCongratulation.json", "congratulationMenu");

        this.music = new BABYLON.Sound("congratulationSound", "musics/Solo-nazz.mp3", this, null,
            {
                loop:true,
                autoplay: true,
                offset: 8,
                volume: Options.levelMusic
            })

        this.clearColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);
        let camera = new BABYLON.FreeCamera("fixCamera", new BABYLON.Vector3(0,50,0), this);
        this.activeCamera = camera;
        camera.attachControl(canvas);
        let light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1,-1,0), this);
        light.position.z = 2;

        let gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        let physicsPlugin = new BABYLON.CannonJSPlugin();
        this.enablePhysics(gravityVector, physicsPlugin);
        this.assetsManager = new BABYLON.AssetsManager(this);

    }

    async createAdvancedTexture(path, name){
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(name, true, this);
        let loadedGui = await this.advancedTexture.parseFromURLAsync(path);

        this.nextLevelButton = this.advancedTexture.getControlByName("nextLevelButton");
        this.restartLevelButton = this.advancedTexture.getControlByName("restartLevelButton");
        this.returnMenuButton = this.advancedTexture.getControlByName("returnMenuButton");


        this.nextLevelButton.onPointerUpObservable.add(function (){
            GameState.numLevel = (GameState.numLevel +1);
            if (GameState.numLevel < GameState.maxNumLevel){
                GameState.GameState = GameState.Level;
            }
            else{
                GameState.GameState = GameState.LevelMenu;
                GameState.numLevel = GameState.numLevel -1;
            }

        })
        this.restartLevelButton.onPointerUpObservable.add(function (){
            GameState.GameState = GameState.Level;
            console.log("congratulation to level");
        })
        this.returnMenuButton.onPointerUpObservable.add(function (){
            GameState.GameState = GameState.LevelMenu;
            console.log("congratulation to level menu");
        })


    }

    // ne se dispose pas
    fallingBalls(){
        BABYLON.setAndStartTimer({
            timeout:5,
            contextObservable: this.onBeforeRenderObservable,
            onTick: () => {
                // y = 10
                // -18 < x < 18
                //  color
                let x = Math.random()* (18 + 18) - 18;
                let z = Math.random()* (18 + 18) - 18;
                let color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                this.sphere = this.createSphere(x, 17, z, color);
            },
            onEnded: () => {
                this.sphere.dispose();
            }
        });
    }

    createSphere(x,y,z, color){
        let sphere = BABYLON.MeshBuilder.CreateSphere( "sphere",
            {
                segments:32,
                diameter: 1,
                updatable:true
            }, this);
        sphere.position.x = x;
        sphere.position.y = y;
        sphere.position.z = z;

        let myMaterial = new BABYLON.StandardMaterial("sphereMaterial", this);
        myMaterial.diffuseColor = color;

        sphere.material = myMaterial;

        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere,
            BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 1,
                nativeOptions: {linearDamping: 0.35, angularDamping: 0.35}
            }, this);

        return sphere;
    }

}