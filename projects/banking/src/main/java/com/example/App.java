package com.example;

import java.math.BigDecimal;
import java.util.Scanner;

/**
 * Hello world!
 */
public class App 
{
    public static void main( String[] args )
    {
        Scanner scanner = new Scanner(System.in);
        BankingService bankingService = new BankingService("Kocakara");

        System.out.println("===🏦 Professional Maven Bank ===");

        while(true){
            System.out.println("\nBalance : $" + bankingService.getBalance());
            System.out.print("1.Deposit 2.Withdraw 3.Exit: ");
            String op = scanner.nextLine();

            if(op.equals("3")) break;

            try {
                System.out.print("Amount: ");
                BigDecimal amt = new BigDecimal(scanner.nextLine());

                if(op.equals("1")) bankingService.deposit(amt);
                else bankingService.withdraw(amt);

                System.out.println("Success!");
            } catch(Exception e) {
                System.out.println("Error : " + e.getMessage());
            }
        }

        scanner.close();

    }
}