package projects.taskmanager;

import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        TaskRepo repo = new TaskRepo();
        List<Task> tasks = repo.loadTasks();

        System.out.println("--- 2026 Java Task Manager ---");
        while (true) {
            System.out.println("\n1. View Tasks | 2. Add Task | 3. Exit");
            String choice = sc.nextLine();
            if (choice.equals("1")) {
                if (tasks.isEmpty()) System.out.println("List is empty.");
                tasks.forEach(System.out::println);
            } else if (choice.equals("2")) {
                System.out.print("Enter task: ");
                tasks.add(new Task(sc.nextLine(), false));
                repo.saveTasks(tasks);
            } else if (choice.equals("3")) {
                break;
            }
        }
        sc.close();
    }
}