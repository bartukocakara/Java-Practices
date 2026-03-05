package com.example.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

public class DatabaseConfig {
    private static final Dotenv dotenv = Dotenv.load();

    public static String getUrl() {
        return String.format("jdbc:postgresql://%s:%s/%s",
            dotenv.get("FU_MAIN_DB_HOST"),
            dotenv.get("FU_MAIN_DB_PORT"),
            dotenv.get("FU_MAIN_DB_NAME")
        );
    }

    public static String getUser(){ return dotenv.get("FU_MAIN_DB_USERNAME"); }
    public static String getPassword() { return dotenv.get("FU_MAIN_DB_PASSWORD"); }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(getUrl(), getUser(), getPassword());
    }
}
