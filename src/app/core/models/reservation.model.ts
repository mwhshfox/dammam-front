export interface Reservation {
    id: string;
    totalInvoice: number;
    moneyPaid: number;
    remainingMoney: number;
    tripTicketType: number;
    fromDate: string;
    toDate: string;
    userFullName: string;
    usersFullNames?: string[];
    clientsIds?: string[];
    identity: number;
    nationality: string;
    phoneNumber: number;
    tripTicketCode: string;
    tripId?: string;
    fromSeatNumber: number;
    toSeatNumber: number;
    status: string;
    hotelName: string;
    invoiceNumber: string;
    paymentMethod: number;
    employeeName: string;
    employeeId: string;
    createdOn: string;
    initMoneyPaid: number;
    qoyodInvoiceId: string;
    qoyodPaymentId: string;
    customerReservations: reservation_client[]
}

export interface iPaymentHistory {
    remainingMoneyBeforePayment: number
    remainingMoneyAfterPayment: number
    paymentMethod: number
    moneyPaid: number
    employeeName: string
    createdOn: string
    qoyodPaymentId: string
    id: string
}


export interface reservation_client {
    customerId: string
    customer: Customer_data
}

export interface Customer_data {
    id: string
    phoneNumber: string
    email: string
    firstName: string
    lastName: string
    gender: number
    nationality: number
    nationalityId: string
    createdOn: string
    code: any
    fullName: string
    isCompanion: boolean
    qoyodId: any
}