public class Basics {
    public static void main(String[] args) {
        // 1. Variable Declaration
        String language = "Java";
        int yearCreated = 1995;
        boolean isPowerful = true;

        // 2. Simple Math & Concatenation
        int ageOfLanguage = 2026 - yearCreated;

        // 3. Conditional Logic (Control Flow)
        if (ageOfLanguage > 20) {
            System.out.println(language + " is a mature language.");
        } else {
            System.out.println(language + " is still a youngster.");
        }

        System.out.println("It is " + ageOfLanguage + " years old.");

        double myDouble =  9.78d;
        int myInt = (int) myDouble;

        System.out.println(myDouble);
        System.out.println(myInt);
    }
}