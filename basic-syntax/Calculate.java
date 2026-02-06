public class Calculate {
    public static void main(String[] args) {
        int items = 50;
        float costPerItem = 9.99f;
        float totalCost = items * costPerItem;
        char currency = '$';

        System.out.println("Number of items purchased:" + items);
        System.out.println("Cost per item: " + currency + costPerItem);
        System.out.println("Total cost: " + currency + totalCost);
    }
}
