public class ModernJava {

    // 1. A RECORD: The modern way to handle data. 
    // It automatically generates constructor, getters, equals, and hashCode.
    public record Developer(String name, String favoriteLanguage, int yearsExp) {}

    public static void main(String[] args) {
        
        // Creating an instance of our Record
        Developer dev = new Developer("User", "Java", 2026);

        // 2. A TEXT BLOCK: No more "+" symbols and "\n" for long strings.
        String welcomeMessage = """
                ***************************************
                * WELCOME TO MODERN JAVA 2026      *
                ***************************************
                Name: %s
                Focus: %s
                Era:  %d
                """.formatted(dev.name(), dev.favoriteLanguage(), dev.yearsExp());

        System.out.println(welcomeMessage);

        // 3. MODERN SWITCH: Cleaner, expression-based logic
        String status = switch (dev.yearsExp()) {
            case 2026 -> "The Future";
            case 1995 -> "The Beginning";
            default -> "Professional";
        };

        System.out.println("Dev Status: " + status);
    }
}