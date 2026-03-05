package com.example.config;

import java.io.IOException;
import java.util.logging.*;

public class LoggingConfig {

    private static final String LOG_FILE = "banking_system.log";
    private static boolean initialized = false;

    public static synchronized void init() {
        if (initialized) return; // guard against double-init

        try {
            FileHandler fh = new FileHandler(LOG_FILE, true);
            fh.setFormatter(new SimpleFormatter());

            // Root logger receives all handlers — every child logger inherits them
            Logger root = Logger.getLogger("");
            root.addHandler(fh);
            root.setLevel(Level.ALL);

            initialized = true;
        } catch (IOException e) {
            System.err.println("Critical Failure: Logger initialization failed: " + e.getMessage());
        }
    }

    /** Convenience factory — call this instead of Logger.getLogger() everywhere */
    public static Logger getLogger(Class<?> clazz) {
        return Logger.getLogger(clazz.getName());
    }
}