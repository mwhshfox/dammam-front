export interface Itrip {
    id: string
    chairPrice: number
    busType: number
    numberOfChairs: number
    driverName1: string
    driverPhoneNumber1: string
    driverNationalId1: string
    driverName2: string
    driverPhoneNumber2: string
    driverNationalId2: string
    plateNumber: string
    departureTime: string
    returnTime: string
    transitLeaveTime: string
    fromCity: number
    toCity: number
    transitCity: any
    tripCode: string
    tickets: any[]
    departureReservedChairs: string
    returnReservedChairs: string
    transitReservedChairs: any
    createdOn?: string
}

// {
//     "id": "0342c339-e2c7-4574-26c9-08ddaf23ece6",
//     "chairPrice": 120,
//     "busType": 2,
//     "numberOfChairs": 49,
//     "driverName1": "محمد شعلان",
//     "driverPhoneNumber1": "0002122233",
//     "driverNationalId1": "3333333",
//     "driverName2": "مصطفي",
//     "driverPhoneNumber2": "3333333100",
//     "driverNationalId2": "222222",
//     "departureTime": "2025-06-26T00:00:00",
//     "returnTime": "2025-06-28T00:00:00",
//     "transitLeaveTime": "2025-06-28T00:00:00",
//     "fromCity": 1,
//     "toCity": 3,
//     "transitCity": 2,
//     "tripCode": "301",
//     "tickets": [],
//     "departureReservedChairs": "12,11,10,9,38",
//     "returnReservedChairs": "38",
//     "transitReservedChairs": "38"
// }