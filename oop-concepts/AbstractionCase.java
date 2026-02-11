public class AbstractionCase {
    public static void main(String[] args){
        Animal animal = new Dog();
        animal.animalSound();
    }
}

abstract class Animal {
    public abstract void animalSound();
    public void sleep(){
        System.out.println("The animal is sleeping");
    }
}

class Dog extends Animal{
    public void animalSound(){
        System.out.println("The dog says How How ");
    }
}
