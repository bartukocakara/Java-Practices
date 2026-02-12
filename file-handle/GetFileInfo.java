import java.io.File;

public class GetFileInfo {
    public static void main(String[] args){
        File myObj = new File("filename.txt");
        if(myObj.exists()){
            System.out.println("The file name is : " + myObj.getName());
            System.out.println("Absolute path is : " + myObj.getAbsolutePath());
            System.out.println("Writable : " + myObj.canWrite());
            System.out.println("Readable : " + myObj.canRead());
            System.out.println("File size in bytes : " + myObj.length());
        } else{
            System.out.println("The file doesnt exists");
        }

        // Delete a File
        File deleteFileObj = new File("filename.txt");
        if(deleteFileObj.delete()){
            System.out.println("File deleted successfully : " + deleteFileObj.getName());
        } else{
            System.out.println("Delete file not successfull");
        }

        // Delete folder
        File folderObj = new File("c:\\dev\\learning\\bartu");
        if(folderObj.delete()){
            System.out.println("Delete file ok" + folderObj.getName());
        } else{
            System.out.println("Failed to delete folder");
        }
    }
}
