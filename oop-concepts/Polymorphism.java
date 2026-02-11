// Why And When To Use "Inheritance" and "Polymorphism"?
// - It is useful for code reusability: reuse attributes and methods of an existing class when you create a new class.
//You can also use super to access an attribute from the parent class if they have an attribute with the same name:
class Polymorphism {
    String type = "Animal";
    public void animalSound(){
        System.out.println("The animal makes a sound");
    }
}

class Pig extends Polymorphism {
    public void animalSound(){
        System.out.println("The pig says: wee wee");
    }
}

class Dog extends Polymorphism {
    public void animalSound(){
        System.out.println("The dog says How how ");
    }
}

class Lion extends Polymorphism{
    String type = "Lion";
    public void animalSound(){
        System.out.println("The Lion says Roar Roar" + super.type);
    }
}

class Main{
    public static void main(String[] args){
        Polymorphism myAnimal = new Polymorphism();
        Polymorphism pig = new Pig();
        Polymorphism dog = new Dog();

        myAnimal.animalSound();
        pig.animalSound();
        dog.animalSound();
    }
}