import java.util.Scanner;
// Java Packages & API
public class ScannerCode {
    public static void main(String[] args) {
        Scanner newScanner = new Scanner(System.in);
        System.out.println("Please enter the fruit name: ");

        String fruitName = newScanner.nextLine();
        System.out.println("The fruit name is: " + fruitName);

        newScanner.close();
    }
}
