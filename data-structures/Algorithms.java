import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
// Java Algorithms
// Algorithms are used to solve problems by sorting, searching, and manipulating data structures.
// In Java, many useful algorithms are already built into the Collections class (found in the java.util package), so you don't have to write them from scratch.
public class Algorithms {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<String>();
        names.add("Liam");
        names.add("Bartu");
        names.add("Buket");
        names.add("Angies");
        names.add("Kasper");
        for (String name : names) {
            System.out.println("The name is : " + name);
        }
        Collections.sort(names);

        int index = Collections.binarySearch(names, "Bartu");
        System.out.println("Bartu is at index : " + index);

        ArrayList<Integer> numberList = new ArrayList<Integer>();
        numberList.add(100);
        numberList.add(50);
        numberList.add(124);
        numberList.add(500);
        numberList.add(12);

        Collections.sort(numberList);
        int numberIndex = Collections.binarySearch(numberList, 124);

        System.out.println("The collection 124 index is at : " + numberIndex);

        Iterator<String> itString = names.iterator();

        while(itString.hasNext()){
            System.out.println("The next name is : " + itString.next());
        }

        Collections.sort(names, Collections.reverseOrder());
        Collections.shuffle(names);
        System.out.println(names);
    }
}
