// import package.name.Class;   // Import a single class
// import package.name.*;   // Import the whole package

import java.util.Scanner;
// import package.name.MyPackage;

import mypackage.*;
// Java Packages & API
// Built-in Packages (packages from the Java API)
// User-defined Packages (create your own packages)
public class ScannerCode {
    public static void main(String[] args) {
        Scanner newScanner = new Scanner(System.in);
        System.out.println("Please enter the fruit name: ");

        String fruitName = newScanner.nextLine();
        System.out.println("The fruit name is: " + fruitName);

        newScanner.close();

        MyPackage myPack = new MyPackage();
        myPack.main(null);
    }
}
