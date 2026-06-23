export interface IOkResponse {
    ok: boolean
    message: string
    data: Daum[]
}

export interface Daum {
    success: boolean
    message: string
    originalData: OriginalData
}

export interface OriginalData {
    firstName: string
    lastName: string
    phoneNumber: string
    nationalityId: string
    nationality: number
    gender: number
    role: string
  }


