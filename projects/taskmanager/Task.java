package projects.taskmanager;

public record Task(String description, boolean isDone) {
    @Override
    public String toString() {
        // Using String.format for cleaner alignment
        return String.format("%-5s %s", isDone ? "[X]" : "[ ]", description);
    }
}