import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminsService {

  header_Token: string = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTQyMTQ1ODc1NDY2NTUzNjg5OTgzODIiLCJqdGkiOiJhNGI3Y2JlYy1iMWJjLTRjMTgtYTYyZi03NjVjYTZiNTk4ODUiLCJ1aWQiOiJjZmU2MDdkMy0yMzA4LTRjNjMtOTJkYy0yNmUwNjZmYzA1OWMiLCJyb2xlcyI6IkFkbWluIiwiZXhwIjoxNzQ1MzIzMDc2LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTgzIiwiYXVkIjoiTXlTZWN1cmVkQXBpVXNlcnMifQ.TfA-20lrv-_Tgi709W2IYsBv1MftIhfXHtFU75GLmwM"

  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }
  current_admin = new BehaviorSubject({})
  current_stage = new BehaviorSubject("all")

  get_all_admins() {
    return this.http.get(this.base_url + 'User/Get-All-Admins',
      // { headers: { Authorization: this.header_Token } }
    );
  }


  add_new_admin(body: {}) {
    return this.http.post(this.base_url + 'User/Add-System-Users',
      body,
      // { headers: { Authorization: this.header_Token } }
    );
  }


  edit_admin(body: {}) {
    return this.http.put(this.base_url + 'User/Update-User',
      body,
      // { headers: { Authorization: this.header_Token } }
    );
  }


  delete_admin(id: string) {
    return this.http.delete(this.base_url + 'User/Delete-User?userId=' + id,
      // { headers: { Authorization: this.header_Token } }
    );
  }




  // http://dammamdevorex.runasp.net/Api/User/Add-System-Users
  // req data for add 
  // [
  //   {
  //     "firstName": "علاء",
  //     "lastName": "حامد",
  //     "phoneNumber": "01000654243",
  //     "nationalityId": "1494400",
  //     "nationality": 2,
  //     "gender": 1,
  //     "role": "admin"
  //   }
  // ]



}
