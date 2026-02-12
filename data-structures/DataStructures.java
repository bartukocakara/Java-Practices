import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;

public class DataStructures {
    public static void main(String[] args){

        //An ArrayList is a resizable array that can grow as needed.
        // It allows you to store elements and access them by index.
        ArrayList<String> cars = new ArrayList<String>();
        cars.add("Vehicle");
        cars.add("Ferrari");
        cars.add("BYD");
        cars.add(0, "Kral");
        cars.set(0, "New Kral");

        //Sort an ArrayList
        Collections.sort(cars);
        for(String car : cars){
            System.out.println("Sorted cars : " + car);
        }
        cars.remove(0);
        int size = cars.size();
        System.out.println("0 index data : " + cars.get(0) + "And size is : " + size);
        System.out.println(cars);

        for (int i = 0; i < cars.size(); i++){
            System.out.println("Car is :" + cars.get(i));
        }

        for(String i : cars){
            System.out.println("Shorter for version car is : " + i );
        }

        ArrayList<Integer> intList = new ArrayList<Integer>();
        intList.add(5);
        intList.add(20);
        intList.add(17);
        intList.add(26);
        intList.add(5);
        intList.add(1);
        Collections.sort(intList);
        for(int i : intList){
            System.out.println(i);
        }
        // A HashSet is a collection where every element is unique - no duplicates are allowed.
        HashSet<String> hashCars = new HashSet<String>();
        hashCars.add("Volvo");
        hashCars.add("Ferrari");
        hashCars.add("Toyota");
        hashCars.add("Ford");
        hashCars.add("Ford");

        System.out.println(hashCars);

        // A HashMap stores key-value pairs, 
        // which are great when you want to store values and find them by a key (like a name or ID):
        HashMap<String, String> hashMapCars = new HashMap<String, String>();
        hashMapCars.put("Turkey", "Togg");
        hashMapCars.put("Usa", "Tesla");
        hashMapCars.put("Germany", "Mercedes");

        System.out.println(hashMapCars);

        // Iterators
        //An iterator is a way to loop through elements in a data structure.
        // Buna "yineleyici" denmesinin sebebi, "yineleme"nin teknik olarak döngü anlamına gelmesidir.
        Iterator<String> it = cars.iterator();

        while(it.hasNext()){
            System.out.println(it.next());
        }


        // var keyword
        ArrayList<String> carsExample = new ArrayList<String>();
        // List and ArrayList 
        //It works the same way, but some developers prefer this style because it gives them more flexibility to change the type later.
        List<String> carsList = new ArrayList<>();
        var carsExample2 = new ArrayList<String>();


        LinkedHashMap<String, String> capitalCities = new LinkedHashMap<>();

        capitalCities.put("England", "London");
        capitalCities.put("India", "New Delhi");

        System.out.println(capitalCities);

        for(String key : capitalCities.keySet()){
            System.out.println("Key : " + key + ", Value : " + capitalCities.get(key));
        }

        ArrayList<Integer> numbers = new ArrayList<Integer>();
        numbers.add(12);
        numbers.add(15);
        numbers.add(2);

        Iterator<Integer> iter = numbers.iterator();
        while(iter.hasNext()){
            Integer i = iter.next();
            if(i < 10) {
                iter.remove();
            }
        }

        System.out.println(numbers);
    }
}
