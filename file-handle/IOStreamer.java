import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

// Choosing the Right Class
// Scanner - best for simple text and when you want to parse numbers or words easily.
// BufferedReader - best for large text files, because it is faster and reads line by line.
// FileInputStream - best for binary data (images, audio, PDFs) or when you need full control of raw bytes.
public class IOStreamer {

    // I/O Streams (Input/Output Streams)
    // Byte Streams (Work with raw binary data (like images, audio, and PDF files).)

    // Character Streams
    // Work with text (characters and strings). These streams automatically handle character encoding.
    public static void main(String[] args){
        try(FileInputStream input = new FileInputStream("new-file.txt")){
            int i; // variable to store each byte until that is read

            // Read one byte at a time until end of file(-1 means "no more data")
            while((i = input.read()) != -1){
                System.out.print((char) i);
            }
        } catch(IOException e) {
            System.out.println("Error occured while reading file" + e.getMessage());
        }

        // Copy a Binary File (Real-World Example)
        try(FileInputStream input = new FileInputStream("example.jpg");
            FileOutputStream output = new FileOutputStream("output.jpg")){
                int i;

                while((i = input.read()) != -1){
                    output.write(i); // write the raw byte to the new file
                }

                System.out.println("File copied successfully");
        }catch(IOException e) {
            System.out.println("File couldn't copied");
        }

        //Write a Text File (Basic Example)
        String text = "\nText to write to a file";

        try(FileOutputStream fileOutputObj = new FileOutputStream("filename-new.txt")){
            fileOutputObj.write(text.getBytes());
            System.out.println("Successfully wrote to a file");
        } catch(IOException e){
            System.out.println("Error waiting file.");
            e.printStackTrace();
        }
    }
}
