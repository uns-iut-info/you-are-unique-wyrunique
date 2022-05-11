export default class GameState{

    static MainMenu = 0;
    static LevelMenu = 1;
    static CommandMenu = 2;
    static OptionMenu = 3;
    static Level = 4;
    static Congratulation = 5;
    static StartMenu = 6;
    static CinematicMenu = 7;
    static TextMenu = 8;

    static precGameState = this.StartMenu;
    static GameState = this.StartMenu;
    static numLevel = 0;
    static restartLevel = false;
    static maxNumLevel = 2;
}