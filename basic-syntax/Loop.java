public class Loop {
    public static void main(String[] args) {
        int countDown = 6;

        for(int i = 6; i > 0; i--){
            countDown -= i;
        }

        System.out.println("Sum is: "  + countDown);

        // Loop in loop

        for(int i = 0; i < 3; i++){
            System.out.println("Outer Loop: " + i); 

            for(int j = 1; j <= 3; j++){
                System.out.println("Inner Loop: " +j);
            }
        }
        // Nested Loops
        for(int i = 1; i <= 3; i++){
            for(int j = 1; j <= 3; j++){
                System.out.print(i * j + " ");
            }
            System.out.println();
        }

        // Foreach

        String[] cars = {"BMW", "Mercedes", "Ford", "Mazda"}; // Array

        for(String car: cars) {
            System.out.println(car);
        }

        int[] numbers = {1, 5, 7, 9, 11};

        for(int number: numbers){
            System.out.println("Next number: " + number);
        }

        for(int i = 0; i < 10; i += 2){
            System.out.println(i);
        }

        for(int i = 4; i < 10; i++){
            if(i % 2 == 0){
                continue;
            }
            if(i % 6 == 0){
                break;
            }
            System.out.println("There goes the : " + i);
        }

        int[] newNumbers = {2, 4, -3, 5, 7, -9};

        for(int number: newNumbers) {
            if(number % 7 == 0) {
                break;
            }
            else if(number % 2 == 0){
                continue;
            }

            System.out.println("Number is :" + number);
        }
    }
}
