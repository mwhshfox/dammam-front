import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HotelsService } from '../../../core/services/hotels.service';
import { Ihotel } from '../../../core/models/ihotel';

@Component({
  selector: 'app-hotel-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './hotel-page.component.html',
  styleUrl: './hotel-page.component.scss'
})
export class HotelPageComponent {
  private readonly hotel_Service = inject(HotelsService);
  private readonly router = inject(Router);
  constructor() { };


  current_name: string = ''
  current_stage: string = 'all'
  isModalVisible = false;
  show_add_new = true;



  ngOnInit(): void {
    this.get_current_stage()
  }


  get_current_stage() {
    this.hotel_Service.current_stage.subscribe((value) => {
      setTimeout(() => {
        this.current_stage = value
        console.log(value);

      }, 0);
    })
  }


}
