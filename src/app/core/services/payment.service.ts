import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { api_base_url } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {


  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }



  current_client = new BehaviorSubject({})
  current_stage = new BehaviorSubject("all")



  pay_reservation(data: any): Observable<any> {
    return this.http.post(`${this.base_url}Repayment/Create-Repayment`, data);
  }

  payment_history(reservationId: string): Observable<any> {
    return this.http.get(`${this.base_url}Repayment/Get-Repayments-By-Reservation-Id?reservationId=${reservationId}`);
    // https://mwhshfox2030-001-site1.anytempurl.com/Api/Repayment/Get-Repayments-By-Reservation-Id?reservationId=a2db38a6-de37-4ac1-67be-08ddc08879ce

  }

}
