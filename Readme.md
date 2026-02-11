# ☕ Java Development Hub
### *“Write Once, Run Anywhere. Build Once, Scale Everywhere.”*

Welcome to the central repository for my Java mastery journey. This workspace is organized according to professional engineering standards for the **2026 tech era**.

---

## 🏛 The Java Philosophy
Java is built on the principle of **Robustness over Cleverness**. While other languages prioritize "short" code, Java prioritizes "readable and maintainable" code for large-scale systems.

* **Managed Memory:** No manual pointers; the Garbage Collector handles the trash.
* **Strong Typing:** Catch errors at compile-time, not at 3:00 AM in production.
* **Platform Independence:** The JVM (Java Virtual Machine) abstracts the hardware.

---

## 📂 Directory Structure
| Folder | Purpose |
| :--- | :--- |
| `basic-syntax` | Variables, loops, scanners, and basic logic. |
| `oop-concepts` | Classes, Inheritance, Polymorphism, and Interfaces. |
| `data-structures` | Arrays, Lists, Maps, and Sets (The Collections Framework). |
| `projects` | Real-world applications and mini-tools. |

---

## 🚀 The 2026 Modern Java Checklist
Java has evolved. To code like a modern engineer, focus on these:

### ✅ DO (Best Practices)
* **Use Records:** For data-only classes, use `record User(String name, int id) {}`.
* **Switch Expressions:** Use the modern `yield` and arrow `->` syntax.
* **Text Blocks:** Use `"""` for multi-line strings (HTML/SQL/JSON).
* **Virtual Threads:** Use Project Loom for lightweight, high-performance concurrency.

### ❌ DON'T (Anti-Patterns)
* **Legacy Loops:** Avoid `for(int i=0; i<x; i++)` when `stream()` or `forEach` is cleaner.
* **Null Checks:** Stop using `if (obj != null)`. Use `Optional<T>` to handle empty values.
* **God Classes:** Don't put 2,000 lines in one file. Stick to **S.O.L.I.D** principles.
* **Catch-All Exceptions:** Never use `catch (Exception e) {}`. Be specific.

---

## 💻 Essential Commands
Run these from your `C:\dev\learning` terminal:

**Compile a file:**
```bash
javac FileName.java