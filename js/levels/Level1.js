import AbstractLevel from "./AbstractLevel.js";

export default class Level1 extends AbstractLevel{

    constructor(engine, canvas) {
        super(engine, canvas, 1);
        this.endPosition = new BABYLON.Vector3(0, 15, 0);

    }


    setButtonAndDoor(lvlId) {
    }
}
