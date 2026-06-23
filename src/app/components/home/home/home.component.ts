import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HomeService } from '../../../core/services/home.service';
import { Itrip } from '../../../core/models/itrip';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { DatePipe } from '@angular/common';
import { BusesComponent } from "../../../shared/components/buses/buses.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, EnumPipe, DatePipe, BusesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly Home_Service = inject(HomeService);
  private readonly router = inject(Router);

  trip_count = 0;
  reservation_count = 0;
  client_count = 0;
  hotel_count = 0;
  all_trips: Itrip[] = [];

  today_date: string = '';
  today_time: string = '';

  private intervalId: any;

  ngOnInit(): void {
    this.updateDateTime();

    this.intervalId = setInterval(() => {
      this.updateDateTime();
    }, 60000); // يحدث كل دقيقة

    this.get_home_data();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updateDateTime(): void {
    const now = new Date();

    const day = now.getDate();
    const month = now.getMonth() + 1; // الأشهر من 0 إلى 11
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    this.today_date = `${day}/${month}/${year}`;
    this.today_time = `${hours}:${minutes}`;
  }

  get_home_data() {
    this.Home_Service.get_trip_count().subscribe((res: any) => {
      this.trip_count = res.data;
    });

    this.Home_Service.get_reservation_count().subscribe((res: any) => {
      this.reservation_count = res.data;
    });

    this.Home_Service.get_client_count().subscribe((res: any) => {
      this.client_count = res.data;
    });

    this.Home_Service.get_hotel_count().subscribe((res: any) => {
      this.hotel_count = res.data;
    });

    this.Home_Service.get_all_trips().subscribe({
      next: (res: any) => {
        this.all_trips = res.data;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }
}
