import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { api_base_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CashflowService {

  constructor(private http: HttpClient) { }
  base_url = inject(api_base_url);

  get_all_transactions(user_id: string | null | undefined, fromDate: string, toDate: string): Observable<any> {
    console.log(this.base_url);

    const params = new URLSearchParams();
    if (user_id) {
      params.set('empId', user_id);
    }
    params.set('fromDate', fromDate);
    params.set('toDate', toDate);

    return this.http.get(`${this.base_url}Report/emp-report?${params.toString()}`);
    // https://mwhshfox2030-001-site1.anytempurl.com/Api/Report/emp-report?empId=34d0399e-a93e-4ddb-a44b-05e5814444a7&fromDate=2025-07-5&toDate=2025-07-5
  }
}
