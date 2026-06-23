import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  header_Token: string = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTQyMTQ1ODc1NDY2NTUzNjg5OTgzODIiLCJqdGkiOiI3ZmNhZGRlNC0zODU1LTRmMzEtYWJhMC0xZmY1ZDY2NjU0ZGQiLCJ1aWQiOiJjZmU2MDdkMy0yMzA4LTRjNjMtOTJkYy0yNmUwNjZmYzA1OWMiLCJyb2xlcyI6IkFkbWluIiwiZXhwIjoxNzQ2MTMwOTg3LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTgzIiwiYXVkIjoiTXlTZWN1cmVkQXBpVXNlcnMifQ.cD-Y1ZWHQZD_WAuVCyJVcUoVxV928ep6HFhZFhiSYSs"

  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }

  get_user_by_id_or_number(data:string):Observable<any>{
    return this.http.get(this.base_url + 'User/Get-User-By-NID-Or-Phone-Number?input=' + data , { headers: { Authorization: this.header_Token } });
  }

  get_user_by_id(user_id:string):Observable<any>{
    return this.http.get(this.base_url + 'User/Get-User-By-Id?userId=' + user_id);
  }

  add_system_users(data:any):Observable<any>{
    return this.http.post(this.base_url + 'User/Add-System-Users' , data , { headers: { Authorization: this.header_Token } });
  }
}
