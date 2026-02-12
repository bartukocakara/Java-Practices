import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

//Read a Text File (Line by Line)
public class BufferReaderWriter {
    public static void main(String[] args){
        // READ CASE
        try(BufferedReader br = new BufferedReader(new FileReader("new-file.txt"))){
            String line;
            while((line = br.readLine()) != null){
                System.out.println(line);
            }
        } catch(IOException e) {
            System.out.println("Buffer error : " + e.getMessage());
        }

        // WRITE LINE
        try(BufferedWriter bw = new BufferedWriter(new FileWriter("new-file.txt"))){
            bw.write("First line");
            bw.newLine();
            bw.write("Second line");
            bw.newLine();
            bw.write("Third Line");
            System.out.println("Successfully wrote to a file");
        } catch(IOException e) {
            System.out.println("Error writing file . " + e.getMessage());
        }

        // APPEND TO A TEXT FILE
        try(BufferedWriter bwt = new BufferedWriter(new FileWriter("new-file.txt", true))){
            bwt.newLine();
            bwt.append("New Text to append");
            System.out.println("Text successfully appended to a file");
        } catch(IOException e) {
            System.out.println("Error occured" + e.getMessage());
        }
    }
}
