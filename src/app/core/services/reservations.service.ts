import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { api_base_url } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {

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

  get_all_reservations(invoiceNumber?: string, fromDate?: string, toDate?: string, fromCRDate?: string, toCRDate?: string, search_mode?: string, isDeleted?: boolean) {
    if (search_mode == 'createdOn') {
      fromDate = '';
      toDate = '';
    }
    if (search_mode == 'fromdate') {
      fromCRDate = '';
      toCRDate = '';
    }
    return this.http.get(this.base_url + `Reservation/get-all-Reservation?InvoiceNumber=${invoiceNumber || ''}&FromDate=${fromDate || ''}&ToDate=${toDate || ''}&FromCreatedOn=${fromCRDate || ''}&ToCreatedOn=${toCRDate || ''}&IsDeleted=${isDeleted || false}`);
    // https://mwhshfox2030-001-site1.anytempurl.com/Api/Reservation/get-all-Reservation?InvoiceNumber=inv-105&TotalInvoice=1&MoneyPaid=1&RemainingMoney=1&FromDate=%201&ToDate=%201&FromCreatedOn=1&ToCreatedOn=1&HotelName=%201

  }

  get_reservation_by_id(reservation_id: string, isDeleted?: boolean): Observable<any> {
    return this.http.get(this.base_url + `Reservation/get-Reservation-by-id?Id=${reservation_id}&IsDeleted=${isDeleted || false}`);
  }

  delete_reservation(id: string) {
    return this.http.delete(this.base_url + 'Reservation/Delete-Reservation?reservationId=' + id);
  }

  export_qiod_invoice(reservation_id: string) {
    return this.http.post(this.base_url + 'Qoyod/CreateQoyodInvoice?reservationId=' + reservation_id , "" ) ;
  }

  export_qiod_payment(repayment_id: string) {
    return this.http.post(this.base_url + 'Qoyod/CreateQoyodInvoicePayment?repaymentId=' + repayment_id , "");
  }

  delete_qyoud_invoice(reservation_id: string) {
    return this.http.put(this.base_url + 'Qoyod/CancelQoyodInvoice?reservationId=' + reservation_id , "");
  }

  update_reservation(body: any): Observable<any> {
    return this.http.put(this.base_url + 'Reservation/Update-Reservation', body);
  }

}
