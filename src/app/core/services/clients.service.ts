import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ClientsService {
  header_Token: string = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTQyMTQ1ODc1NDY2NTUzNjg5OTgzODIiLCJqdGkiOiI5ODYyOWJmZi0xNmMyLTQ1ZjMtYmYyYi05MTM3ZTczNDUwYmYiLCJ1aWQiOiJjZmU2MDdkMy0yMzA4LTRjNjMtOTJkYy0yNmUwNjZmYzA1OWMiLCJyb2xlcyI6IkFkbWluIiwiZXhwIjoxNzQ2MTg2MjkxLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTgzIiwiYXVkIjoiTXlTZWN1cmVkQXBpVXNlcnMifQ.fVLJVyHr6VFsC_rZ2cUayyBzup1Q4UKHkmMa_8OQrr4"

  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }
  current_client = new BehaviorSubject({})
  current_stage = new BehaviorSubject("all")


  get_all_clients() {
    return this.http.get(this.base_url + 'User/Get-All-Users',
      // { headers: { Authorization: this.header_Token } }
    );
  }
  get_searched_client(search_value: string) {
    return this.http.get(this.base_url + 'User/Get-All-Users?InputSearch=' + search_value,
      // { headers: { Authorization: this.header_Token } }
    );
  }


  add_new_client(body: {}) {
    return this.http.post(this.base_url + 'User/Add-System-Users',
      body,
      // { headers: { Authorization: this.header_Token } }
    );
  }


  edit_client(body: {}) {
    return this.http.put(this.base_url + 'User/Update-User',
      body,
      // { headers: { Authorization: this.header_Token } }
    );
  }


  delete_client(id: string) {
    return this.http.delete(this.base_url + 'User/Delete-User?userId=' + id,
      // { headers: { Authorization: this.header_Token } }
    );
  }




}
