//An interface is a completely "abstract class" that is used to group related methods with empty bodies:

public class InterfacePractice {
    public static void main(String[] args){
        XBank bank = new XBank();
        bank.deposit();
        bank.withdraw();
    }
}

interface Bank{
    public void withdraw();
}

interface CenterBank{
    public void deposit();
}

class XBank implements Bank, CenterBank{
    public void deposit(){
        System.out.println("Depositing from the banks");
    }
    public void withdraw(){
        System.out.println("Withdrawing from the bank");
    }
}
