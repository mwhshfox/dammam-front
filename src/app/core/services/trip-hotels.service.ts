import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class TripHotelsService {

  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }

  get_hotels_in_trip_by_trip_id(trip_id: string) {
    return this.http.get(this.base_url + 'TripHotels/Get-Hotels-In-Trip-By-Trip-Id?tripId=' + trip_id);
  }
  
  get_trip_hotel(trip_id: string , hotel_id: string) {
    return this.http.get(this.base_url + `TripHotels/Get-Trip-Hotel?tripId=${trip_id}&hotelId=${hotel_id}` );
  }

}
