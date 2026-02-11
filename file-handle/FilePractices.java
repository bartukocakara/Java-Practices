//Java File Handling
// The File class from the java.io package, allows us to work with files.

// To use the File class, create an object of the class, and specify the filename or directory name:

import java.io.File;
import java.io.IOException;

public class FilePractices {
    public static void main(String[] args){
        try{
            File myObj = new File("testt-file.txt");
            if(myObj.createNewFile()){
                System.out.println("File created : " + myObj.getName());
            }else{
                System.out.println("File already exists");
            }
        } catch(IOException e) {
            System.out.println("An error occured " + e.getMessage());
            e.printStackTrace();
        }
        // Create a File in a Specific Folder
        try {
            File newObj = new File("C:\\dev\\learning\\file-handle\\test.txt");
            newObj.createNewFile();
        } catch(IOException e) {
            System.out.println("System error : " + e.getMessage());
        }
        
    }
}
