import java.util.ArrayList;

//A lambda expression is a short block of code that takes in parameters and returns a value. 
public class LambdaExpressions {
    interface StringFunction{
        String run(String str);
    }
    public static void main(String[] args){
        ArrayList<Integer> numbers = new ArrayList<>();
        numbers.add(123);
        numbers.add(132432);
        numbers.add(777);
        numbers.forEach((n) -> {System.out.println(n); });

        StringFunction exclaim = (s) -> s + "!";
        StringFunction ask = (s) -> s + "?";
        printFormatted("Hello", exclaim);
        printFormatted("Hello", ask);
    }

    public static void printFormatted(String str, StringFunction format){
        String result = format.run(str);
        System.out.println(result);
    }
}
