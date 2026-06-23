import { Component, inject, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TripsService } from '../../../core/services/trips.service';
import { Itrip } from '../../../core/models/itrip';
import { DatePipe, SlicePipe } from '@angular/common';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';

@Component({
  selector: 'app-trips-for-reservation',
  standalone: true,
  imports: [EnumPipe, DatePipe, SlicePipe],
  templateUrl: './trips-for-reservation.component.html',
  styleUrl: './trips-for-reservation.component.scss'
})
export class TripsForReservationComponent {
  private readonly tripservice = inject(TripsService);
  @Input() reserving: boolean = false;
  @Input() show_trips_type: string = '';
  @Input() go_date: string = '';
  @Input() return_date: string = '';
  @Input() trip_id: string = '';
  @Input() trip: Itrip = {} as Itrip;
  @Output() going_return_trip_selected = new EventEmitter<Itrip>();
  @Output() going_trip_selected = new EventEmitter<Itrip>();
  @Output() return_trip_selected = new EventEmitter<Itrip>();
  going_return_selected_trip_id: string = '';
  going_selected_trip_id: string = '';
  return_selected_trip_id: string = '';

  all_trips_before_filter: Itrip[] = []

  trips_display_count: number = 10
  current_name: string = ''
  all_trips: Itrip[] = []
  table_head_titles: string[] = [
    '#',
    'كود الرحلة',
    ' الوجهة (من - الى)',
    'تاريخ',
    'اماكن متاحة',
  ]

  ngOnInit(): void {
    if (this.trip.id) {
      this.all_trips = [this.trip];
    }
    else if (this.show_trips_type == 'transit_trips' && !this.trip.id) {
      this.get_upcoming_transit_trips();
    }
    else if (this.show_trips_type == 'return_trips') {
      this.get_all_return_trips()
    }
    else {
      this.get_all_trips()
    }
    if (this.trip_id) {
      this.selected_trip_id = this.trip_id;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.all_trips = this.all_trips;

    // إذا تغير trip_id، نحدث selected_trip_id
    if (changes['trip_id']) {
      if (this.trip_id) {
        this.selected_trip_id = this.trip_id;
      } else {
        // تصفير التحديد إذا أصبح trip_id فارغ
        this.selected_trip_id = '';
        this.return_selected_trip_id = '';
        this.going_selected_trip_id = '';
        this.going_return_selected_trip_id = '';
      }
    }

    if (changes['show_trips_type']) {
      if (this.trip.id) {
        this.all_trips = [this.trip];
      }
      else if (this.show_trips_type == 'transit_trips' && !this.trip.id) {
        this.get_upcoming_transit_trips();
      }
      else if (this.show_trips_type == 'return_trips') {
        this.get_all_return_trips()
      }
      else {
        this.get_all_trips()
      }
      if (this.trip_id) {
        this.selected_trip_id = this.trip_id;
      }
    }
    if (changes['go_date']) {
      this.filter_trips_by_date('going_trips');
    }
    if (changes['return_date']) {
      this.filter_trips_by_date('return_trips');
    }
    // if (this.show_trips_type === 'all') {
    //   this.all_trips = this.all_trips;
    // } else if (this.show_trips_type === 'going_trips' || this.show_trips_type === 'transit_trips') {
    //   this.filter_trips_by_date('going_trips')
    // } else if (this.show_trips_type === 'return_trips') {
    //   this.filter_trips_by_date('return_trips')
    // }
  }

  get_all_trips() {
    this.tripservice.get_all_trips_upcoming_only().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_trips_before_filter = res.data
          this.all_trips_before_filter = this.sortTripsByDate_departure(this.all_trips_before_filter)

          this.all_trips = res.data
          this.all_trips = this.sortTripsByDate_departure(this.all_trips)
        }
        if (res.ok && this.reserving) {
          this.all_trips = this.all_trips;
          // if (this.show_trips_type === 'all') {
          //   this.all_trips = this.all_trips;
          // } else if (this.show_trips_type === 'going_trips') {
          //   this.filter_trips_by_date('going_trips')
          // } else if (this.show_trips_type === 'return_trips') {
          //   this.filter_trips_by_date('return_trips')
          // }
        }
        console.log(res);
      }
    })
  }


  get_all_return_trips() {

    let threeDaysAgo = this.getLocalDateMinusDays(3);

    console.log('threeDaysAgo', threeDaysAgo);

    this.tripservice.get_all_search_trips('', threeDaysAgo, '', '', '', 'fromdate').subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_trips_before_filter = res.data
          this.all_trips_before_filter = this.sortTripsByDate_return(this.all_trips_before_filter)

          this.all_trips = res.data
          this.all_trips = this.sortTripsByDate_return(this.all_trips)
        }
        if (res.ok && this.reserving) {
          this.all_trips = this.all_trips;
        }
        console.log(res);
      }
    })
  }


  get_upcoming_transit_trips() {
    this.tripservice.get_upcoming_transit_trips().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_trips_before_filter = res.data
          this.all_trips_before_filter = this.sortTripsByDate_departure(this.all_trips_before_filter)

          this.all_trips = res.data
          this.all_trips = this.sortTripsByDate_departure(this.all_trips)
        }
        // if (res.ok && this.reserving) {
        //   this.filter_trips_by_date('going_trips')
        // }
      }
    })
  }

  private formatDate(dateString: string | undefined | null): string {
    if (!dateString) return ''; // لو التاريخ مش موجود، نرجع string فاضي

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // لو التاريخ غير صالح

    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
  }


  filter_trips_by_date(trip_dir: string) {
    let targetDate: string;

    if (trip_dir === 'going_trips') {
      targetDate = this.formatDate(this.go_date);

      this.all_trips = this.all_trips_before_filter.filter(trip =>
        this.formatDate(trip.departureTime) === targetDate
      );
      this.all_trips = this.sortTripsByDate_departure(this.all_trips)
    }
    else if (trip_dir === 'return_trips') {
      targetDate = this.formatDate(this.return_date);
      this.all_trips = this.all_trips_before_filter.filter(trip =>
        this.formatDate(trip.returnTime) === targetDate
      );
      this.all_trips = this.sortTripsByDate_return(this.all_trips)
    }
  }

  selected_trip_id: string = ''
  select_trip(trip: Itrip) {
    this.selected_trip_id = trip.id
    if (this.show_trips_type === 'all') {
      this.going_return_selected_trip_id = trip.id;
      this.going_return_trip_selected.emit(trip);
    }
    else if (this.show_trips_type === 'going_trips' || this.show_trips_type === 'transit_trips') {
      this.going_trip_selected.emit(trip);
      this.going_selected_trip_id = trip.id;
    }
    else if (this.show_trips_type === 'return_trips') {
      this.return_trip_selected.emit(trip);
      this.return_selected_trip_id = trip.id;
    }
  }

  show_more_trips(btn: HTMLButtonElement) {
    btn.setAttribute('disabled', 'true');
    let all_trips_count = this.all_trips.length;
    if (this.trips_display_count < all_trips_count) {
      this.trips_display_count += 10
    }
    btn.removeAttribute('disabled');
  }


  sortTripsByDate_departure(trips: any[]): any[] {
    return trips.sort((a, b) => {
      const dateA = new Date(a.departureTime).getTime();
      const dateB = new Date(b.departureTime).getTime();
      return dateB - dateA; // من الأحدث للأقدم
    });
  }

  sortTripsByDate_return(trips: any[]): any[] {
    return trips.sort((a, b) => {
      const dateA = new Date(a.returnTime).getTime();
      const dateB = new Date(b.returnTime).getTime();
      return dateB - dateA; // من الأحدث للأقدم
    });
  }


  getLocalDateMinusDays(days: number): string {
    let today = new Date();
    today.setDate(today.getDate() - days); // هنا بطرح الأيام

    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

}
