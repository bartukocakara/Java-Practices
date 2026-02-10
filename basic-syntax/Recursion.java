public class Recursion {

    // Recursion is the technique of making a function call itself.
    // This technique provides a way to break complicated problems down into 
    // simpler problems which are easier to solve.
    public static int sum(int k){
        if(k > 0) {
            return k + sum(k - 1);
        } else {
            return 0;
        }
    }

    public static int multiSum(int numberOne, int numberTwo){
        if(numberOne > numberTwo){
            return numberOne + multiSum(numberOne, numberTwo - 1);
        } else{
            return numberTwo;
        }
    }

    public static void countdown(int n) {
        if(n > 0) {
            System.out.println(n +" ");
            countdown(n - 1);
        }
    }

    public static void main(String[] args){
        int sumData = sum(20);
        System.out.println(sumData);

        int multiSumResult = multiSum( 16, 32);
        System.out.println(multiSumResult);

        countdown(12);
    }
}
