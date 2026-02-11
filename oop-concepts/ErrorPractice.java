// Exception Handling (try and catch)
// Exception handling lets you catch and handle errors during runtime - so your program doesn't crash.


//Order Matters
// You should always put more specific exceptions first, and general ones later. 
// Otherwise, the general catch will grab the error and the specific ones will never run:
public class ErrorPractice{
    public static void main(String[] args){
        try{
            int[] numbers = {1, 2, 3, 5};
            System.out.println("The number is : " + numbers[10]);
        } catch(ArrayIndexOutOfBoundsException e) {
            System.out.println("ArrayIndexOutOfBoundsException is : " + e.getMessage());
        }catch(ArithmeticException e){
            System.out.println("Aritmetic exception" + e.getMessage());
        } finally{
            System.out.println("The try catch is finished");
        }
    }
}