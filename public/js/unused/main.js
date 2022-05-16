import Level from "./level.js";
import Menu from "../menus/Menu.js";

let canvas;
let engine;
let inputStates = {};

let typeSceneShow = 0;
let typeSceneClick = 0;
let typeGuiShow = 0;
let typeGuiClick = 0;
let numLevelShow = 0;
let saveLevel = false;
let restartLevel = false;

let levels = [];
let menuScenes = [];
let advancedTexture;

window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);

    levels.push(new Level(0,engine, "The beginning"));
    modifySetting(levels[0].scene);
    levels.push(new Level(1, engine, "The following"));
    modifySetting(levels[1].scene);

    menuScenes.push(createMainMenu());
    menuScenes.push(createMainMenu());
    menuScenes.push(createMainMenu());
    menuScenes.push(createMainMenu());


    advancedTexture = createGuiMenu(0);
    setButtonGuiMenu();
    menuScenes[0].render();


    engine.runRenderLoop(function () {
        let deltaTime = engine.getDeltaTime();
        if (typeSceneShow !== typeSceneClick){ // changer scene
            if ((typeSceneClick === 0) && (typeSceneShow === 1)){ // change from level to menu
                if (!saveLevel){
                    levels[numLevelShow].createScene(numLevelShow);
                    levels[numLevelShow].scene.render();
                }
                menuScenes[1].render(); // print level menu
                typeGuiShow = 1;
                typeGuiClick = 1;
            }
            else if ((typeSceneClick === 1) && (typeSceneShow === 0)){   // change from menu to level
                levels[numLevelShow].scene.render();     // current level
                advancedTexture = Menu.createLevelGui(levels[numLevelShow]);
                setButtonGuiLevel();
            }
            typeSceneShow = typeSceneClick;
        }
        else if (typeSceneShow === 0){  // scene menu
            if (typeGuiShow !== typeGuiClick){  // change menu
                advancedTexture["gui"].dispose();
                advancedTexture = createGuiMenu(typeGuiClick);
                setButtonGuiMenu()
                menuScenes[typeGuiClick].render();
                typeGuiShow = typeGuiClick;
            }
            else{
                menuScenes[typeGuiShow].render();
            }
        }
        else if (typeSceneShow === 1){  // scene level
            if (restartLevel){
                levels[numLevelShow].createScene(numLevelShow, engine);
                advancedTexture = Menu.createLevelGui(levels[numLevelShow]);
                setButtonGuiLevel();
                restartLevel = false;
            }

            levels[numLevelShow].scene.assetsManager.load();
            levels[numLevelShow].scene.render();
            movePlayer(levels[typeSceneShow].currentPlayer, levels[numLevelShow], inputStates)
            //movePlayer(scene.currentPlayer, scene, inputStates);
            mergePlayer();

            if (levels[numLevelShow].canFinish) {
                levels[numLevelShow].checkIfFinish();
            }
        }
    })

}

function createGuiMenu(numScene){
    switch (numScene){
        case 0:
            return Menu.createMainMenuGui(menuScenes[numScene]);
        case 1:
            return Menu.createLevelMenu(levels, menuScenes[numScene]);
        case 2:
            return Menu.createOptionsMenu(menuScenes[numScene]);
        case 3:
            return Menu.createCommandsMenu(menuScenes[numScene]);
    }
}

function setButtonGuiMenu(){

    if (typeGuiClick === 0){    // Main menu
        advancedTexture["play"].onPointerUpObservable.add(function(){
            typeGuiClick = 1;
            console.log("change to level menu");
        });

        advancedTexture["commands"].onPointerUpObservable.add(function (){
            typeGuiClick = 2;
            typeSceneShow = 0;
            console.log("Change to commands");
        });

        advancedTexture["options"].onPointerUpObservable.add(function (){
            typeGuiClick = 3;
            typeSceneShow = 0;
            console.log("Change to options");
        });
    }
    else if (typeGuiClick === 1){   // Level menu
        advancedTexture["return"].onPointerUpObservable.add(function(){
            typeGuiClick = 0;
            typeSceneClick = 0;
            console.log("Return level");
        });

        for (let i=0; i<levels.length; i++){
            advancedTexture["levels"][i].onPointerUpObservable.add(function(){
                numLevelShow = i;
                typeSceneClick = 1;

            })
        }
    }
    else if (typeGuiClick === 2){   // Command menu
        advancedTexture["return"].onPointerUpObservable.add(function(){
            typeGuiClick = 0;
            console.log("Return command");
        });
    }
    else if (typeGuiClick === 3){   // Options menu
        advancedTexture["return"].onPointerUpObservable.add(function(){
            typeGuiClick = 0;
            console.log("Return options");
        });
    }
}

function setButtonGuiLevel(){
    if (typeSceneClick === 1 || typeSceneShow === 1){
        advancedTexture["restartButton"].onPointerClickObservable.add(function (){
            restartLevel = true;
            console.log("click restart doesn't work");
        })
        advancedTexture["save"].onPointerClickObservable.add(function (){
            saveLevel = true;
            typeGuiClick = 0;
            typeSceneClick = 0;
            console.log("click save doesn't work");
        })
        advancedTexture["quit"].onPointerClickObservable.add(function (){
            saveLevel = false;
            typeGuiClick = 0;
            typeSceneClick = 0;
            console.log("click quit");
        })
    }
}

function createMainMenu(){
    let scene = new BABYLON.Scene(engine);
    // background
    scene.clearColor = new BABYLON.Color3(0.2,0.2,0.2);

    let camera = new BABYLON.FreeCamera("fixCamera", new BABYLON.Vector3(0, 50, 0), scene, scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas);

    createLights(scene);

    return scene;
}



/// Create environment
function createScene(id, name) {
    let scene = new BABYLON.Scene(engine);
    modifySetting(scene);
    //scene.assetsManager = configureAssetManager(scene);
    // background
    if (id === 0){
        scene.clearColor = new BABYLON.Color3(1, 0, 1);
    }
    else{
        scene.clearColor = new BABYLON.Color3(1, 0, 0);
    }

    let gravityVector = new BABYLON.Vector3(0,-9.81, 0);
    let physicsPlugin = new BABYLON.CannonJSPlugin();
    levels[id].scene.enablePhysics(gravityVector, physicsPlugin);


    createLights(scene);
    let ground = createGround(scene);
    let freeCamera = createFreeCamera(scene);

    levels[id] =  new Level(id, engine, name);


    //scene.activeCamera = freeCamera;
    levels[id].currentPlayer = 0;
    levels[id].scene.activeCamera = levels[id].cameras[0];
    createLights(levels[id].scene);

   return scene;
}



function createGround(scene) {
    const groundOptions = { width:2000, height:2000, subdivisions:20, minHeight:0, maxHeight:100};
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGround("ground", groundOptions, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("images/woodFloor.jpg", scene);
    ground.material = groundMaterial;
    ground.material.diffuseTexture.uScale = 10;
    ground.material.diffuseTexture.vScale = 10;

    // to be taken into account by collision detection
    ground.checkCollisions = true;
    //groundMaterial.wireframe=true;
    // for physic engine
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
        BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene);

    return ground;
}


/// Gestion Player
function movePlayer(numPlayer, scene, inputStates){
    let player = levels[numLevelShow].players[levels[numLevelShow].currentPlayer];
    if (player){
        player.move(levels[numLevelShow].scene, inputStates);
    }
}

function mergePlayer(){
    let player = levels[numLevelShow].players[levels[numLevelShow].currentPlayer];
    if (player){
        player.merge(levels[numLevelShow],
            levels[numLevelShow].players,
            levels[numLevelShow].cameras,
            levels[numLevelShow].currentPlayer);
    }
}




function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);
    light.position.z = 2;
}

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
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




function modifySetting(scene){
    window.addEventListener("resize", () => {
        engine.resize()
    })
    // key listener
    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;

    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if ((event.key === "q")|| (event.key === "Q")) {
            inputStates.left = true;
        } else if ((event.key === "z")|| (event.key === "Z")){
            inputStates.up = true;
        } else if ((event.key === "d")|| (event.key === "D")){
            inputStates.right = true;
        } else if ((event.key === "s")|| (event.key === "S")) {
            inputStates.down = true;
        } else if (event.key === " ") {
            inputStates.space = true;
        } else if (event.key === "&") {
            inputStates.one = true;
        }
    }, false);

    //if the key will be released, change the states object
    window.addEventListener('keyup', (event) => {
        if ((event.key === "q")|| (event.key === "Q")) {
            inputStates.left = false;
        } else if ((event.key === "z")|| (event.key === "Z")){
            inputStates.up = false;
        } else if ((event.key === "d")|| (event.key === "D")){
            inputStates.right = false;
        } else if ((event.key === "s")|| (event.key === "S")) {
            inputStates.down = false;
        }  else if (event.key === " ") {
            inputStates.space = false;
        } else if (event.key === "&") {
            if (inputStates.one === true){
                levels[numLevelShow].currentPlayer = (levels[numLevelShow].currentPlayer + 1) % levels[numLevelShow].players.length;
                console.log("Switching to player/camera " + levels[numLevelShow].currentPlayer);
                levels[numLevelShow].scene.activeCamera = levels[numLevelShow].cameras[levels[numLevelShow].currentPlayer];
            }
            inputStates.one = false;
        }
    }, false);
}