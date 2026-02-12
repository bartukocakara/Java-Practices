//Java File Handling
// The File class from the java.io package, allows us to work with files.

// To use the File class, create an object of the class, and specify the filename or directory name:

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

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

        // Write To a File
        //In the example below, we use FileWriter together with its write() method to create and write some text into a file.
        try{
            // Lets write file
            FileWriter myWriter = new FileWriter("new-file.txt");
            myWriter.write("This is first text to write");
            myWriter.close();
        } catch(IOException e){
            System.out.println("File write error : " + e.getMessage());
            e.printStackTrace();
        }
        
        // Append to a file
        //Normally, FileWriter will overwrite a file if it already exists. 
        // If you want to add new content at the end of the file (without deleting what's already there), 
        // you can use the two-argument constructor and pass true as the second parameter.
        // This puts the writer into append mode:
        try(FileWriter myWriter = new FileWriter("new-file.txt", true)){
            myWriter.append("\nNew text");
            myWriter.close();
        } catch(IOException e){
            System.out.println("Append to file error" + e.getMessage());
            e.printStackTrace();
        }

        // Read Files
        // In the following example, we use the Scanner class to read the contents of the text file we created
        File fileObj = new File("new-file.txt");
        try(Scanner myReader = new Scanner(fileObj)){
            while(myReader.hasNextLine()){
                String data = myReader.nextLine();
                System.out.println(data);
            }
        } catch(FileNotFoundException e) {
            System.out.println("An error occured. " + e.getMessage());
            e.printStackTrace();
        }
    }
}
