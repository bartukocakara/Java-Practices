//Java Annotations
//
//Java includes several built-in annotations. Here are some of the most commonly used:

// Annotation	Description
// @Override	Indicates that a method overrides a method in a superclass
// @Deprecated	Marks a method or class as outdated or discouraged from use
// @SuppressWarnings	Tells the compiler to ignore certain warnings

import java.util.ArrayList;

public class AnnotationPractice {
    public static void main(String[] args){
        Dog dog = new Dog();

        dog.makeSound();

        oldMethod();
        suppressedMethod();
    }

    @Deprecated
    static void oldMethod(){
        System.out.println("This method is outdated. ");
    }

    @SuppressWarnings("unchecked")
    static void suppressedMethod(){
        ArrayList<String> cars = new ArrayList<>();
        cars.add("Volvo");
        System.out.println(cars);
    }
}

class Animal{
    void makeSound(){
        System.out.println("Animal Sound");
    }
}

class Dog extends Animal{
    @Override
    void makeSound(){
        System.out.println("WOFFFF!!!");
    }
}