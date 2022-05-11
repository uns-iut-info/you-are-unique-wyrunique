import Options from "./Options.js";

export default class Player {

    constructor(id, playerMesh,  scene){
        this.playerMesh = playerMesh;
        this.id = id;
        this.scene = scene;
        this.speed = 0.5;

        playerMesh.Player = this;
    }

    move(scene, inputStates){
        this.playerMesh.frontVector = scene.activeCamera.getDirection(new BABYLON.Vector3(0, 0, 1));
        this.playerMesh.frontVector.y = 0;
        this.playerMesh.frontVector.normalize();
        let forceMagnitude = 500;
        let contactLocalRefPoint = BABYLON.Vector3.Zero();
        let forceDirection = BABYLON.Vector3.Zero();
        if(inputStates.up) {
            forceDirection = new BABYLON.Vector3(this.playerMesh.frontVector.x, 0, this.playerMesh.frontVector.z);
        }
        else if(inputStates.down) {
            forceDirection = this.playerMesh.frontVector.negate();
        }
        if(inputStates.right) {
            forceDirection.x = this.playerMesh.frontVector.z;
            forceDirection.z = -this.playerMesh.frontVector.x;
        }
        else if(inputStates.left) {
            forceDirection.x = -this.playerMesh.frontVector.z;
            forceDirection.z = this.playerMesh.frontVector.x;
        }
        this.playerMesh.physicsImpostor.applyForce(forceDirection.scale(forceMagnitude), this.playerMesh.getAbsolutePosition().add(contactLocalRefPoint));
    }

    merge(scene) {
        for (let i=0; i < scene.players.length; i=i+1){
            if (i !== scene.currentPlayer){
                if (scene.players[scene.currentPlayer].playerMesh.intersectsMesh(scene.players[i].playerMesh, true)){
                    console.log("touch player: "+i);
                    let removedPlayer = scene.players.splice(i,1);
                    let removedCamera = scene.cameras.splice(i,1);
                    removedPlayer[0].playerMesh.dispose();
                    removedCamera[0].dispose();
                    if (i < scene.currentPlayer){
                        scene.currentPlayer = scene.currentPlayer - 1;
                    }
                    scene.advancedTexture.dispose();

                    if (scene.players.length === 1){
                        scene.createEnd(scene.endPosition);
                        let finished = scene.createAdvancedTexture("gui/guiTextureLevelFinish.json", "guiLevelFinish");
                    }
                    else{
                        let finished = scene.createAdvancedTexture("gui/guiTextureLevel.json", "guiLevel");
                    }
                    scene.mergeSound.play();
                    return true;

                }
            }
        }

    }


}