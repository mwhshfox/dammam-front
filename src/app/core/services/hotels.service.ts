import { Inject, Injectable } from '@angular/core';
import { api_base_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelsService {

  header_Token: string = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTQyMTQ1ODc1NDY2NTUzNjg5OTgzODIiLCJqdGkiOiJiNmUxNzA4MS00NzZlLTQ5OWUtOTVlOS1jMzQ4NmFjYmVhOWUiLCJ1aWQiOiJjZmU2MDdkMy0yMzA4LTRjNjMtOTJkYy0yNmUwNjZmYzA1OWMiLCJyb2xlcyI6IkFkbWluIiwiZXhwIjoxNzQ1MjM1NTcyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTgzIiwiYXVkIjoiTXlTZWN1cmVkQXBpVXNlcnMifQ.rK4gyB7dtqtehXGLjSfgiHDtWcQbc0FGcCv2-yR-U4E"
  constructor(@Inject(api_base_url) private base_url: string, private http: HttpClient) { }



  current_client = new BehaviorSubject({})
  current_stage = new BehaviorSubject("all")




  get_all_hotels() {
    return this.http.get(this.base_url + 'Hotel/Get-All-Hotels',
      //  {headers:{Authorization: this.header_Token}}
    );
  }

  get_hotel_by_id(id: string) {
    return this.http.get(this.base_url + 'Hotel/Get-Hotel-By-Id?hotelId=' + id,
      { headers: { Authorization: this.header_Token } }
    );
  }



  delete_hotel(id: string) {
    return this.http.delete(this.base_url + 'Hotel/Delete-Hotel?hotelId=' + id,
      // {headers:{Authorization: this.header_Token}}
    );
  }


  add_new_hotel(body: {}) {
    return this.http.post(this.base_url + 'Hotel/Add-Hotel',
      body,
      // { headers: { Authorization: this.header_Token } }
    );
  }


  edit_hotel(body: {}) {
    return this.http.put(this.base_url + 'Hotel/Edit-Hotel',
      body,
      // { headers: { Authorization: this.header_Token } }
    );
  }


}
