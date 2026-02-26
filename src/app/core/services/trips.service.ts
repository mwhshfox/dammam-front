import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripsService {

  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }
  header_Token: string = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTQyMTQ1ODc1NDY2NTUzNjg5OTgzODIiLCJqdGkiOiJiNmUxNzA4MS00NzZlLTQ5OWUtOTVlOS1jMzQ4NmFjYmVhOWUiLCJ1aWQiOiJjZmU2MDdkMy0yMzA4LTRjNjMtOTJkYy0yNmUwNjZmYzA1OWMiLCJyb2xlcyI6IkFkbWluIiwiZXhwIjoxNzQ1MjM1NTcyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTgzIiwiYXVkIjoiTXlTZWN1cmVkQXBpVXNlcnMifQ.rK4gyB7dtqtehXGLjSfgiHDtWcQbc0FGcCv2-yR-U4E"

  current_trip = new BehaviorSubject({})
  current_stage = new BehaviorSubject("all")





  get_all_trips() {
    return this.http.get(this.base_url + 'Trip/Get-All-Trips',
    );
  }
  get_all_trips_upcoming_only() {
    return this.http.get(this.base_url + 'Trip/Get-Upcoming-Trips',
    );
  }

  get_upcoming_transit_trips() {
    return this.http.get(this.base_url + 'Trip/Get-Upcoming-Transit-Trips',
    );
  }


  add_new_trip(body: {}) {
    return this.http.post(this.base_url + 'Trip/Create-Trip', body
    );
  }


  get_trip_by_id(id: string) {
    return this.http.get(this.base_url + 'Trip/Get-Trip-By-Id?id=' + id,
    );
  }


  delete_trip(id: string) {
    return this.http.delete(this.base_url + 'Trip/Delete-Trip?Id=' + id,
    );
  }



  edit_trip(body: {}) {
    return this.http.put(this.base_url + 'Trip/Update-Trip',
      body,
    );
  }

  get_reserved_beds_in_trip_per_hotel(tripId: string, hotelId: string) {
    return this.http.get(this.base_url + 'Trip/Get-Reserved-Beds-In-Trip-Per-Hotel?tripId=' + tripId + '&hotelId=' + hotelId);
  }


  search_trip_by_code(code: string) {
    return this.http.get(this.base_url + 'Trip/Get-All-Trips?TripCode=' + code,
    );
  }

  get_all_search_trips(trip_code?: string, fromDate?: string, toDate?: string, fromCRDate?: string, toCRDate?: string , search_mode?: string) {
    if(search_mode == 'createdOn') {
      fromDate = '';
      toDate = '';
    }
    if(search_mode == 'fromdate') {
      fromCRDate = '';
      toCRDate = '';
    }
    return this.http.get(this.base_url + `Trip/Get-All-Trips?TripCode=${trip_code || ''}&DepartureTime=${fromDate || ''}&ReturnTime=${toDate || ''}&FromCreatedOn=${fromCRDate || ''}&ToCreatedOn=${toCRDate || ''}`);
    // https://mwhshfox2030-001-site1.anytempurl.com/Api/Reservation/get-all-Reservation?InvoiceNumber=inv-105&TotalInvoice=1&MoneyPaid=1&RemainingMoney=1&FromDate=%201&ToDate=%201&FromCreatedOn=1&ToCreatedOn=1&HotelName=%201

  }





  exportTripParticipantsToPdf(tripId: string) {
    const url = this.base_url + 'Report/Export-Trip-Participants-To-Pdf?tripId=' + tripId;
    return this.http.get(url, { responseType: 'blob' });
  }




}





// {
//   "chairPrice": 1,
//   "busType": 0,
//   "driverName1": "string",
//   "driverName2": "string",
//   "departureTime": "2025-04-24T20:41:45.100Z",
//   "returnTime": "2025-04-24T20:41:45.100Z",
//   "fromCity": 1,
//   "toCity": 1,
//   "tripCode": "string"
// }
