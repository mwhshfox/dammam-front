import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }

  header_Token: string = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTQyMTQ1ODc1NDY2NTUzNjg5OTgzODIiLCJqdGkiOiJiNmUxNzA4MS00NzZlLTQ5OWUtOTVlOS1jMzQ4NmFjYmVhOWUiLCJ1aWQiOiJjZmU2MDdkMy0yMzA4LTRjNjMtOTJkYy0yNmUwNjZmYzA1OWMiLCJyb2xlcyI6IkFkbWluIiwiZXhwIjoxNzQ1MjM1NTcyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTgzIiwiYXVkIjoiTXlTZWN1cmVkQXBpVXNlcnMifQ.rK4gyB7dtqtehXGLjSfgiHDtWcQbc0FGcCv2-yR-U4E";
  current_client = new BehaviorSubject({})
  current_stage = new BehaviorSubject("all")


  get_all_employees() {
    return this.http.get(this.base_url + 'User/Get-All-Employees',
    //  {headers:{Authorization: this.header_Token}}
     );
  }
  
  add_new_employee(body: {}) {
    return this.http.post(this.base_url + 'User/Add-System-Users',
      body,
      // { headers: { Authorization: this.header_Token } }
    );
  }


  edit_employee(body: {}) {
    return this.http.put(this.base_url + 'User/Update-User',
      body,
      // { headers: { Authorization: this.header_Token } }
    );
  }


  delete_employee(id: string) {
    return this.http.delete(this.base_url + 'User/Delete-User?userId=' + id,
    // {headers:{Authorization: this.header_Token}}
    );
  }




  
}
