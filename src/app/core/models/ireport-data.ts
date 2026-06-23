export interface IreportData {
    departureReservedChairs: string
    returnReservedChairs: string
    transitReservedChairs: string
    ticketDto: TicketDto
    tripDto: TripDto
    reservation: Reservation
    maleCount: number
    femaleCount: number

    user?: User
    tripCode?: string
    departureTime?: string
    returnTime?: string
    totalTripAmount?: number
    paidAmount?: number
    remainingAmount?: number
    invoiceNumber?: string
}

export interface TicketDto {
    id: string
    tripTicketType: number
    createdOn: string
    customersTickets: CustomersTicket[]
    tripTicket: TripTicket[]
}

export interface CustomersTicket {
    customerId: string
    customer: Customer
}

export interface Customer {
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

export interface TripTicket {
    tripId: string
    chairsIDs: any
}

export interface TripDto {
    busType: number
    numberOfChairs: number
    driverName1: string
    driverPhoneNumber1: string
    driverNationalId1: string
    driverName2: string
    driverPhoneNumber2: string
    driverNationalId2: string
    departureTime: string
    returnTime: string
    transitLeaveTime: string
    fromCity: number
    toCity: number
    transitCity: number
    tripCode: string
    availableDeparture: number
    availableReturn: number
    departureReservedChairs: string
    returnReservedChairs: string
    transitReservedChairs: string
}

export interface Reservation {
    notes: any
    invoiceNumber: string
    totalInvoice: number
    moneyPaid: number
    remainingMoney: number
    paymentType: number
    ticketId: string
    ticket: Ticket
    residenceId: string
    residence: Residence | null
    toDate: string
    fromDate: string
    customerId: any
    employeeId: string
}

export interface Ticket {
    id: string
    tripTicketType: number
    createdOn: string
    customersTickets: CustomersTicket2[]
    tripTicket: TripTicket2[]
}

export interface CustomersTicket2 {
    customerId: string
    customer: Customer2
}

export interface Customer2 {
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

export interface TripTicket2 {
    tripId: string
    chairsIDs: any
}

export interface Residence {
    fromDate: string
    toDate: string
    stayType: number
    bedPrice: any
    roomPrice: number
    bedsCountInRoom: number
    numOfRooms: number
    hotelId: string
    hotelDto: HotelDto
}

export interface HotelDto {
    id: string
    name: string
    address: string
    place: number
    bedPrice: number
    roomPrice: number
    residencesCount: any
}



export interface IavailableReportData {
    busType: number
    numberOfChairs: number
    driverName1: string
    driverPhoneNumber1: string
    driverNationalId1: string
    driverName2: string
    driverPhoneNumber2: string
    driverNationalId2: string
    departureTime: string
    returnTime: string
    transitLeaveTime: any
    fromCity: number
    toCity: number
    transitCity: any
    tripCode: string
    availableDeparture: number
    availableReturn: number
    departureReservedChairs: string
    returnReservedChairs: string
    transitReservedChairs: any
  }

  export interface User {
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