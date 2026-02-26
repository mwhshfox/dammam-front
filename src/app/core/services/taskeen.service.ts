import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api_base_url } from '../../app.config';


@Injectable({
  providedIn: 'root'
})
export class TaskeenService {

  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }

  private trip_id: string = '';

  set_trip_id(id: string) {
    this.trip_id = id;
  }

  get_trip_id(): string | null {
    return this.trip_id;
  }

  clear() {
    this.trip_id = '';
  }

  create_reservation(body: {}) {
    return this.http.post(this.base_url + 'Reservation/Create-Reservation', body);
  }

  get_all_taskeen(hotelIds?: string, fromDate?: string, toDate?: string) {
    return this.http.get(this.base_url + `Report/Housing-Report?hotelsIds=${hotelIds || ''}&fromDate=${fromDate || ''}&toDate=${toDate || ''}`);
    // https://mwhshfox2030-001-site1.anytempurl.com/Api/Report/Housing-Report?hotelsIds=3fa85f64-5717-4562-b3fc-2c963f66afa6&fromDate=07%2F1%2F2025&toDate=07%2F30%2F2025

  }
  get_all_taskeen_org(hotelIds?: string, fromDate?: string, toDate?: string) {
    return this.http.get(this.base_url + `Report/Housing-Report?hotelsIds=${hotelIds || ''}&fromDate=${fromDate || ''}&toDate=${toDate || ''}`);
    // https://mwhshfox2030-001-site1.anytempurl.com/Api/Report/Housing-Report?hotelsIds=3fa85f64-5717-4562-b3fc-2c963f66afa6&fromDate=07%2F1%2F2025&toDate=07%2F30%2F2025

  }

  get_reservation_by_id(reservation_id: string): Observable<any> {
    return this.http.get(this.base_url + 'Reservation/get-Reservation-by-id?Id=' + reservation_id);
  }

  delete_reservation(id: string) {
    return this.http.delete(this.base_url + 'Reservation/Delete-Reservation?reservationId=' + id);
  }

}
