public class Arrays {
    public static void main(String[] args) {
        String[] products = {"Pencil", "Eraser", "Pen", "Notebook"};

        for(int i = 0; i < products.length;i++){
            System.out.println("Product is : " + products[i]);
        }

        int[] numbers = {1, 3, 5, 7, 9};
        int sum = 0;
        for(int i = 0; i < numbers.length; i++){
            sum += numbers[i];
        }

        System.out.println("Sum is : " + sum);

        // Multidimensional Arrays


        int[][] myNumbers = {{ 5, 7, 9 }, { 1, 3, 11 }, { 7, 8, 9 }};
        myNumbers[0][2] = 2223231;
        System.out.println(myNumbers[0][2]);

        int[][] newNumbers = {{ 1, 2, 4 }, {6, 7, 8, 9, 10}};
        System.out.println("Rows : " + newNumbers.length);
        System.out.println("First Column : " + newNumbers[0].length);
    }
}
