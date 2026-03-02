package com.example;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;

public class AccountDAO {
    private static final String FILE_PATH = "balance.txt";

    public void save(Account account) throws IOException {
        Files.writeString(Paths.get(FILE_PATH), account.balance().toString());
    }

    public Account load(String owner) {
        try {
            String data = Files.readString(Paths.get(FILE_PATH));
            return new Account(owner, new BigDecimal(data));
        } catch(IOException | NumberFormatException e) {
            return new Account(owner, new BigDecimal("1000.00"));
        }
    }
}
