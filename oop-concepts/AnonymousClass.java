// An anonymous class is a class without a name. It is created and used at the same time.

public class AnonymousClass{
    public static void main(String[] args){
        Universe universe = new Universe(){
            public void exists(){
                System.out.println("Creating a world!");
            }
        };

        universe.exists();

    }
}

class Universe{
    public void exists(){
        System.out.println("Look at the stars!");
    }
}