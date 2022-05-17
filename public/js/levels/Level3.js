import AbstractLevel from "./AbstractLevel.js";
import Door from "./door/Door.js";
import Jump from "./door/Jump.js";
import GameState from "../GameState.js";

export default class Level3 extends AbstractLevel{

    constructor(engine, canvas) {
        super(engine, canvas, 3);
        this.endPosition = new BABYLON.Vector3(0,15,0);
        this.plateformMoving = false;
        this.movingDirection = BABYLON.Vector3.Zero();
    }

    loadSpecificObjects() {
        this.loadSpikes();
        this.loadPlateforms();
        this.loadTriggers();
    }

    loadSpikes() {
        this.spikesMesh = this.getMeshByName("PiegePics");
        this.spikesMesh.actionManager = new BABYLON.ActionManager(this);

        this.spikesMesh.physicsImpostor =  new BABYLON.PhysicsImpostor(this.spikesMesh,
            BABYLON.PhysicsImpostor.MeshImpostor, {
                ignoreParent: true
            }, this);

        for (let i = 0; i < this.players.length; i++) {
            let currentPlayer = this.players[i];
            let triggerAction = this.spikesMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                {trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: currentPlayer.playerMesh},
                () => {
                    console.log("Player " + currentPlayer.id + " impaled himself");
                    GameState.restartLevel = true;
                }
            ));
            this.players[i].linkedMeshes.push(this.spikesMesh);
            this.players[i].linkedTriggers.push(triggerAction);
        }
    }

    loadPlateforms() {
        this.spikePlateform = this.getMeshByName("PlateformePics");
        this.spikePlateform.physicsImpostor = new BABYLON.PhysicsImpostor(this.spikePlateform,
            BABYLON.PhysicsImpostor.BoxImpostor, {
                ignoreParent: true
            }, this);


        //loadPlateform
        for (let i = 0; i < 3; i++) {
            let jumpPlateform = this.getMeshByName("PlateformeSaut"+(i+1));
            jumpPlateform.physicsImpostor = new BABYLON.PhysicsImpostor(jumpPlateform,
                BABYLON.PhysicsImpostor.BoxImpostor, {
                    ignoreParent: true
                }, this);
        }

        // load jump plateform
        let jumpPlateformPositions = [];
        let jumpPlateformArray = [];
        for (let i = 0; i < 3; i++) {
            jumpPlateformPositions[i] = this.getMeshByName("Jump"+(i+1)).position;
            jumpPlateformArray[i] = this.createPlateformJumpMesh(jumpPlateformPositions[i], "plateform"+(i+1));
            let jumpMaterial = new BABYLON.StandardMaterial("jumpMaterial", this);
            jumpMaterial.diffuseTexture = new BABYLON.Texture("images/Common/jump.png", this);
            jumpPlateformArray[i].material = jumpMaterial;
        }

        this.jumpPlateform = new Jump(jumpPlateformArray, this);
    }

    loadTriggers() {
        this.triggerPlateform = this.getMeshByName("TriggerPlateforme");
        this.missingPiece = this.getMeshByName("PieceManquante");

        this.missingPiece.physicsImpostor = new BABYLON.PhysicsImpostor(this.missingPiece,
            BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 2,
                nativeOptions: {linearDamping: 0.35, angularDamping: 0.35}
            }, this);

        let materialMissingPiece = new BABYLON.StandardMaterial("missingPieceMaterial", this);
        materialMissingPiece.diffuseTexture = new BABYLON.Texture("images/Common/blue.png");
        this.missingPiece.material = materialMissingPiece;

        this.triggerPlateform.actionManager = new BABYLON.ActionManager(this);
        this.triggerPlateform.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            {trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: this.missingPiece},
            () => {
                console.log("Plateforme débloquée");
                this.holeSound.play();
                this.plateformMoving = true;
            }
        ));
    }

    movePlateform() {
        if (this.plateformMoving) {
            let plateform = this.getMeshByName("PlateformePics");
            if (plateform.position.x <= -37.4) {
                this.movingDirection = new BABYLON.Vector3(0.25,0,0);
            } else if (plateform.position.x >= 37.4) {
                this.movingDirection = new BABYLON.Vector3(-0.25,0,0);
            }
            plateform.moveWithCollisions(this.movingDirection);
        }
    }

    setButtonAndDoor() {
        let door = this.getMeshByName("Porte1");
        let doorMaterial= new BABYLON.StandardMaterial("doorMaterial", this);

        doorMaterial.diffuseTexture = new BABYLON.Texture("images/Common/doorTexture.jpg", this)
        doorMaterial.diffuseColor =  new BABYLON.Color3(1,0.5,0);
        door.material = doorMaterial;

        door.physicsImpostor = new BABYLON.PhysicsImpostor(door,
            BABYLON.PhysicsImpostor.BoxImpostor, {
                ignoreParent: true
            }, this);

        let posButton = this.getMeshByName("Button1").position;
        posButton.x = posButton.x + 5;
        posButton.z = posButton.z + 7;

        let button = this.createButtonMesh(posButton, "button1");

        this.doors[0] = new Door(this, door,[button]);
    }

}
