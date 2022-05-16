import AbstractLevel from "./AbstractLevel.js";
import Door from "./door/Door.js";

export default class Level2 extends AbstractLevel{

    constructor(engine, canvas) {
        super(engine, canvas, 2);

        this.endPosition = new BABYLON.Vector3(0, 15, 250);

    }

    setButtonAndDoor(lvlId){

        let door = this.getMeshByName("Porte1");
        let doorMaterial= new BABYLON.StandardMaterial("doorMaterial", this);

        doorMaterial.diffuseTexture = new BABYLON.Texture("images/Common/doorTexture.jpg", this)
        doorMaterial.diffuseColor =  new BABYLON.Color3(1,0.5,0);
        door.material = doorMaterial;

        door.physicsImpostor = new BABYLON.PhysicsImpostor(door,
            BABYLON.PhysicsImpostor.BoxImpostor, {
                ignoreParent: true
            }, this);

        let posButton1 = this.getMeshByName("Button1").position;
        let button1 = this.createButtonMesh(posButton1, "button1");
        let posButton2 = this.getMeshByName("Button2").position;
        let button2 = this.createButtonMesh(posButton2, "button2")

        this.doors[0] = new Door(this, door,[button1,button2]);
    }

}
