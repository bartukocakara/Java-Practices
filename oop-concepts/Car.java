// Inheritance Example
// If you try to access a final class, Java will generate an error:


class Vehicle {
    int modelYear;
    protected String modelName = "Ferrari";

    public static void main(String[] args){
        
    }

    public void hunk() {
        System.out.println("Duttt dutttt");
    }
}

class Car extends Vehicle{
    public static void main(String[] args){
        Car myCar = new Car();

        myCar.hunk();
        
        System.out.println(myCar.modelName + " " + myCar.modelYear);
    }
}
