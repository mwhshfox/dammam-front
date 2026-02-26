export interface Ihotel {
    id: string
    name: string
    address: string
    place: number
    bedPrice: number
    residencesCount: number,
    roomPrice:number
}

export interface Residence {
    fromDate: string
    toDate: string
    stayType: number
    hotelId: string

}