import java.util.Scanner;

// Input Types
// In the example above, we used the nextLine() method, which is used to read Strings. To read other types, look at the table below:

// Method	Description
// nextBoolean()	Reads a boolean value from the user
// nextByte()	    Reads a byte value from the user
// nextDouble()	    Reads a double value from the user
// nextFloat()	    Reads a float value from the user
// nextInt()	    Reads a int value from the user
// nextLine()	    Reads a String value from the user
// nextLong()	    Reads a long value from the user
// nextShort()	    Reads a short value from the user
// next()	        Reads a String value from User
public class UserInput{
    public static void main(String[] args){
       Scanner myObj = new Scanner(System.in);

       System.out.println("Enter a username, age and email address: ");

       String username = myObj.nextLine();
       int age = myObj.nextInt();
       String email = myObj.next();

       System.out.println("The user name is : " + username );
       System.out.println("The age is : " + age);
       System.out.println("The email is : " + email);

       myObj.close();
    }
}