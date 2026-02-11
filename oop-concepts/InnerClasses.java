public class InnerClasses {

    //The Philosophy Rule: A static context (the main method) can never directly talk to "instance" 
    // things without an object, because the static method exists even if no objects have been created.
    static class OuterClass {
        int x = 10;

        protected class InnerClass {
            int x = 20;
        }
    }
    public static void main(String[] args) {
        OuterClass outerClass = new OuterClass();
        OuterClass.InnerClass innerClass = outerClass.new InnerClass();

        System.out.println("The value of x is: " + outerClass.x);
        System.out.println("The value of y is: " + innerClass.x);
    }
    
}
