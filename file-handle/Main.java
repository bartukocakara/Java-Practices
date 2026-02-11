import java.io.FileOutputStream;
import java.io.IOException;

//Java Close Resources
// When working with files, streams, or other resources, it is important to close them after use.
// If you forget to close a resource, it may keep using memory or even prevent you from opening the file again until the program ends.
public class Main {
    public static void main(String[] args){
        try(FileOutputStream output = new FileOutputStream("test-file.txt")){
            output.write("Hello".getBytes());
            output.close();
            System.out.println("Successfully wrote to the file");
        } catch(IOException e) {
            System.out.println("File error : " + e.getMessage());
        }
        
    }
}
