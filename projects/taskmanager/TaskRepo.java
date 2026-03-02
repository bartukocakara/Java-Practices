package projects.taskmanager;

import java.io.*;
import java.util.*;

public class TaskRepo {
    private final String FILE_NAME = "tasks.txt";

    public void saveTasks(List<Task> tasks) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(FILE_NAME))) {
            for (Task t : tasks) {
                writer.println(t.description() + "|" + t.isDone());
            }
        } catch (IOException e) {
            System.out.println("Error saving tasks: " + e.getMessage());
        }
    }

    public List<Task> loadTasks() {
        List<Task> tasks = new ArrayList<>();
        File file = new File(FILE_NAME);
        if (!file.exists()) return tasks;

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|");
                tasks.add(new Task(parts[0], Boolean.parseBoolean(parts[1])));
            }
        } catch (IOException e) {
            System.out.println("Error loading tasks.");
        }
        return tasks;
    }
}