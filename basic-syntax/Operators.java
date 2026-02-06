public class Operators {
    public static void main(String[] args){

        // INTEGERS
        int firstInteger = 5;
        int secondInteger = 10;
        System.out.println("Check sum result : " +  (firstInteger + secondInteger));
        int result1 = 2 + 3 * 4;     // 2 + 12 = 14
        int result2 = (2 + 3) * 4;   // 5 * 4 = 20
        System.out.println(result1);
        System.out.println(result2);

        // STRINGS
        String txt = "Please locate where 'locate' occurs!";
        System.out.println("The length of the string is : " + txt.length());
        System.out.println(txt.indexOf("locate"));

        String firstName = "Bartu";
        String lastName = "Kocakara";
        System.out.println(firstName.concat(lastName));

        // 3.rd concat
        String a = "Java ";
        String b = "is ";
        String c = "fun!";
        System.out.println(a.concat(b).concat(c));
        

        // Math
    }
}
