import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }

  current_stage = new BehaviorSubject("all")


  // 1. Get Trip Participants Data
  getTripParticipantsData(tripId: string): Observable<any> {
    return this.http.get(`${this.base_url}Report/Get-Trip-Participants-Data?tripId=${tripId}`);
  }

  // 2. Export Trip Participants Report By Trip Id
  exportTripParticipantsByTripId(tripId: string, trip_type: number | null): Observable<Blob> {
    return this.http.get(`${this.base_url}Report/Export-Trip-Participants-Report-By-Trip-Id?tripId=${tripId}${trip_type ? `&tripType=${trip_type}` : ''}`, { responseType: 'blob' });
  }

  // 3. Export Trip Participants To PDF
  exportTripParticipantsToPdf(tripId: string, trip_type: number | null): Observable<Blob> {
    return this.http.get(`${this.base_url}Report/Export-Trip-Participants-To-Pdf?tripId=${tripId}${trip_type ? `&tripType=${trip_type}` : ''}`, { responseType: 'blob' });
  }

  // 4. Export Bus Trip Participants Report
  exportBusTripParticipantsReport(tripId: string): Observable<Blob> {
    return this.http.get(`${this.base_url}Report/Export-Bus-Trip-Participants-Report?tripId=${tripId}`, { responseType: 'blob' });
  }

  // 5. Export An Invoice Report
  exportInvoiceReport(reservationId: string): Observable<Blob> {
    return this.http.get(`${this.base_url}Report/Export-An-Invoice-Report?reservationId=${reservationId}`, { responseType: 'blob' });
  }

  getAllReservations() {
    return this.http.get(`${this.base_url}Reservation/get-all-Reservation`);
  }

  get_last_reservations(date: string , to_date: string) {
    return this.http.get(`${this.base_url}Reservation/get-all-Reservation?FromCreatedOn=${date}&ToCreatedOn=${to_date}`);
  }


  // exportDepartureReport(date: string, tripCode: string): Observable<Blob> {
  //   return this.http.get(`${this.base_url}Report/Get-Reservations-By-Trip-Departure-Date?date=${date}&tripCode=${tripCode}`, { responseType: 'blob' });

  // }

  exportdaysReport(date: string, tripCode: string, report_type: string): Observable<Blob> {
    return this.http.get(`${this.base_url}Report/Get-Reservations-By-Trip-${report_type}-Date?date=${date}&tripCode=${tripCode}`, { responseType: 'blob' });
  }

  exportAvailableReport(date: string): Observable<Blob> {
    return this.http.get(`${this.base_url}Report/Get-Daily-Availability-Report?departureTime=${date}`, { responseType: 'blob' });
  }

  exportMotabakyReport(date: string, tripCode: string): Observable<Blob> {
    return this.http.get(`${this.base_url}Report/Export-User-Trip-Report-Pdf?departureDate=${date}&tripCode=${tripCode}`, { responseType: 'blob' });
  }


  // get_data_DepartureReport(date: string, tripCode: string): Observable<any> {
  //   return this.http.get(`${this.base_url}Report/Get-Reservations-By-Trip-Departure-Date-Api?date=${date}&tripCode=${tripCode}`);

  // }

  get_data_daysReport(date: string, tripCode: string | null, report_type: string): Observable<any> {
    return this.http.get(`${this.base_url}Report/Get-Reservations-By-Trip-${report_type}-Date-Api?date=${date}&tripCode=${tripCode ? tripCode : ''}`);
  }

  get_data_AvailableReport(date: string): Observable<any> {
    return this.http.get(`${this.base_url}Report/Get-Daily-Availability-Report-Api?departureTime=${date}`);
  }

  export_motabaky_Report(date: string, tripCode: string | null): Observable<any> {
    return this.http.get(`${this.base_url}Report/Get-User-Trip-Report?departureDate=${date}&tripCode=${tripCode ? tripCode : ''}`);
  }

  get_reserved_rooms_report(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.base_url}Report/Get-Reserved-Rooms-Report?startDate=${startDate}&endDate=${endDate}`);
  }
}


