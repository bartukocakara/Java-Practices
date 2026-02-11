public class Person {
    // Why Encapsulation?
    // Better control of class attributes and methods
    // Class attributes can be made read-only (if you only use the get method), or write-only (if you only use the set method)
    // Flexible: the programmer can change one part of the code without affecting other parts
    // Increased security of data
    
    // public - a public park, everyone can enter
    // private - your house key, only you can use it

    // If final is added to a variable, it cannot be changed
    public String name = "Bartu";
    public int age = 33;

    public String getName() {
        return name;
    }

    public void setName(String newName){
        this.name = newName; 
    }

    public static void main(String[] args){
        Person person = new Person();

        person.age = 38;
        person.setName("New Bartu");
        System.out.println("The person name is : " + person.name + " And the ages is : " + person.age);
    }
}
