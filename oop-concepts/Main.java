//When both files have been compiled:

//C:\Users\Your Name>javac Main.java
//C:\Users\Your >javac Second.java
//Run the Second.java file:

//C:\Users\Your Name>java Second

public class Main {
    public int x;
    private String modelName;

    public Main(int x, String modelName) {
        this.x = x;
        this.modelName = modelName;
    }
    public void fullThrottle(){
        System.out.println("The car is going as fast as it can!");
    }

    public void speed(int maxSpeed){
        Main myObj = new Main(5, "Mustang");
        System.out.println(myObj.x);
        System.out.println("Car max speed is " + maxSpeed);
    }

    public static void main(String[] args){
        Main firtCar = new Main(5, "Ferrari");
        System.out.println("Obj x value is : " + firtCar.x + "\n" + "Obj model name is : " + firtCar.modelName );

        Main secondCar = new Main(6, "Porsche");
        System.out.println("Obj x value is : " + secondCar.x + "\n" + "Obj model name is : " + secondCar.modelName );

        Person firstPerson = new Person();
        firstPerson.name = "Bartu";
        firstPerson.age = 38;
    }
}

