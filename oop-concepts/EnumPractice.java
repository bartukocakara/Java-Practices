// An enum is a special "class" that represents a group of constants 
// (unchangeable variables, like final variables).
public class EnumPractice {
    

    public static void main(String[] args){
        Level myVar = Level.LOW;
        System.out.println("The level is " + myVar.getDescription());

        for(Level level : Level.values()){
            System.out.println("The System level is " + level.getDescription());
        }
    }
}

enum Level {
    // Enum constants (each has its own description)
    LOW("Low level"),
    MEDIUM("Medium level"),
    HIGH("High level");

    private String description;

    private Level(String description){
        this.description = description;
    }

    public String getDescription(){
        return this.description;
    }
}