public class Methods {
    static void myMethod(String firstName, int age) {
        System.out.println("Hello World from izmir! My first name is " + firstName + ".And my age is : " + age);
    }

    static void checkPrice(double price) {
        if(price > 100) {
            System.out.println("The price is bigger than 100: " + price);
        } else{
            System.out.println("The price is smaller than 100: " + price);
        }
    }

    static int plusMethodInt(int x, int y) {
        return x + y;
    }

    static double plusMethodDouble(double x, double y) {
        return x + y;
    }

    static int getSumPrice(int price1, int price2) {
        int sum = price1 + price2;
        return sum;
    }

    public static void main(String[] args){
        myMethod("Bartu", 33);
        int sumPrice = getSumPrice(5, 124);
        checkPrice(sumPrice);

        System.out.println("The sum price is : " + sumPrice);

        int myNum1 = plusMethodInt(5, 6);
        double myNum2 = plusMethodDouble(sumPrice, myNum1);
        System.out.println("int: " + myNum1);
        System.out.println("double: " + myNum2);
    }
}
