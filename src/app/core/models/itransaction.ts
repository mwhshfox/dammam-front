export interface Itransaction {
    reservationInvoiceNumber: string;
    source: string;
    totalInvoice: number;
    paidAmount: number;
    remainingMoney: number;
    paymentMethod: number;
    date: string;
    employeeId?: string;
}

export interface PaymentMethod {
    name: string;
    icon: any;
    color: string;
}
