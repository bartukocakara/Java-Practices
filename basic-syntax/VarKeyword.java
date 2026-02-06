public class VarKeyword {
    public static void main(String[] args) {
        String firstArg = args[0];
        var name = "John Doe";
        System.out.println(firstArg + " " + name);

        var x = 5;

        x = 9.99; // Error
    }
}
