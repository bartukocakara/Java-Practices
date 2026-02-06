public class WhileLoop {
    public static void main(String[] args) {
        double payment = Math.random() * 1000;

        double balance = 0.0;
        while (balance < payment) {
            balance += Math.random() * 100;
            System.out.println("Balance: " + balance);
        }
        
        System.out.println("No more money!");

        int countdown = 3;

        while (countdown > 0) {
            System.out.println("countdown: " + countdown);
            countdown--;
        }

        System.out.println("Liftoff!");

        int dice = 1;

        while (dice <= 6) {
            if (dice < 6) {
                System.out.println("No Yatzy.");
            } else {
                System.out.println("Yatzy!");
            }
            dice = dice + 1;
        }

        int sum = 0;
        for(int i = 1; i <= 6; i++) {
            sum = sum + i;
        }

        System.out.println("Sum is : " + sum);
    }
}
