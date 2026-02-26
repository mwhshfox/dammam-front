import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }


  get_trip_count(){
    return this.http.get(this.base_url + 'Trip/Get-Trip-Count');
  }

  get_reservation_count(){
    return this.http.get(this.base_url + 'Reservation/get-Reservation-count');
  }

  get_hotel_count(){
    return this.http.get(this.base_url + 'Hotel/Get-Hotel-Count');
  }

  get_client_count(){
    return this.http.get(this.base_url + 'User/Get-User-Count');
  }


  get_all_trips(){
    return this.http.get(this.base_url + 'Trip/Get-All-Trips');
  }


  // get_employee_count(){
  //   return this.http.get(this.base_url + 'Employee/Get-Employee-Count');
  // }

  // get_admin_count(){
  //   return this.http.get(this.base_url + 'Admin/Get-Admin-Count');
  // }
}
