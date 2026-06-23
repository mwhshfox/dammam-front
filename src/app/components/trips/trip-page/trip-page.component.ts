import { Component, Renderer2, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TripsService } from '../../../core/services/trips.service';
import { Itrip } from '../../../core/models/itrip';

@Component({
  selector: 'app-trip-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './trip-page.component.html',
  styleUrl: './trip-page.component.scss'
})
export class TripPageComponent {

  private readonly Trips_Service = inject(TripsService);
  private readonly router = inject(Router);
  // constructor(private renderer2: Renderer2) { };



  all_trips: Itrip[] = []
  current_name: string = ''
  current_stage: string = 'all'
  isModalVisible = false;
  show_add_new = true;


  ngOnInit(): void {
    this.get_current_stage()
  }



  get_current_stage() {
    this.Trips_Service.current_stage.subscribe((value) => {
      setTimeout(() => {
        this.current_stage = value
        console.log(value);

      }, 0);
    })
  }



}
