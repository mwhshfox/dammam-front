import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { ReservationsService } from '../../../core/services/reservations.service';

@Component({
  selector: 'app-buses',
  standalone: true,
  imports: [],
  templateUrl: './buses.component.html',
  styleUrl: './buses.component.scss'
})
export class BusesComponent implements OnChanges {
  @Input() trip: any;
  // @Input() chairs_numbers: number = 0;
  @Input() chairs_nums_allowed_reserve: number = 0;
  // @Input() trip_id: string = '';
  @Input() trip_type: string = '';
  // @Input() reserved_chairs: string = '';
  @Input() selected_going_reserved_chairs: string[] = [];
  @Input() selected_return_reserved_chairs: string[] = [];
  @Input() selected_transit_reserved_chairs: string[] = [];

  // الكراسي الأصلية المحجوزة (للتعديل) - لن يتم مسحها عند تغيير الرحلة
  @Input() pre_selected_chairs: string[] = [];
  @Input() is_edit_mode: boolean = false;

  // ارسال الكراسي اللي بيتم حجزها الان
  selected_going_seat_ids: string[] = [];
  selected_return_seat_ids: string[] = [];
  selected_transit_seat_ids: string[] = [];
  @Output() selected_go_seat_id = new EventEmitter<string[]>();
  @Output() selected_return_seat_id = new EventEmitter<string[]>();
  @Output() selected_transit_seat_id = new EventEmitter<string[]>();

  // الكراسي المحجوزة بالفعل
  reserved_chairs_ids: string[] = [];


  constructor(private reservationsService: ReservationsService, private cd: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.selected_going_seat_ids = this.selected_going_reserved_chairs;
    this.selected_return_seat_ids = this.selected_return_reserved_chairs;
    this.selected_transit_seat_ids = this.selected_transit_reserved_chairs;
    // this.cd.detectChanges();

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trip']) {
      const current_trip_id = this.trip.id;
      const stored_trip_id = this.reservationsService.get_trip_id();

      // if (stored_trip_id !== current_trip_id ) {
      if (true) {
        this.reservationsService.set_trip_id(current_trip_id);

        setTimeout(() => {
          if (this.trip_type == 'transit') {
            // في وضع التعديل مع نفس الرحلة، احتفظ بالكراسي الأصلية
            if (this.is_edit_mode && this.pre_selected_chairs.length > 0) {
              this.selected_transit_seat_ids = [...this.pre_selected_chairs];
              this.selected_transit_seat_id.emit(this.selected_transit_seat_ids);
              // إزالة الكراسي الأصلية من قائمة المحجوزة (لأنها تابعة لهذا الحجز)
              const allReserved = this.trip.transitReservedChairs?.split(',') || [];
              this.reserved_chairs_ids = allReserved.filter((id: string) => !this.pre_selected_chairs.includes(id));
            } else {
              this.selected_transit_reserved_chairs = [];
              this.selected_transit_seat_ids = [];
              this.selected_transit_seat_id.emit([]);
              this.reserved_chairs_ids = this.trip.transitReservedChairs?.split(',') || [];
            }
          }
          else if (this.trip_type == 'going') {
            // في وضع التعديل مع نفس الرحلة، احتفظ بالكراسي الأصلية
            if (this.is_edit_mode && this.pre_selected_chairs.length > 0) {
              this.selected_going_seat_ids = [...this.pre_selected_chairs];
              this.selected_go_seat_id.emit(this.selected_going_seat_ids);
              // إزالة الكراسي الأصلية من قائمة المحجوزة (لأنها تابعة لهذا الحجز)
              const allReserved = this.trip.departureReservedChairs?.split(',') || [];
              this.reserved_chairs_ids = allReserved.filter((id: string) => !this.pre_selected_chairs.includes(id));
            } else {
              this.selected_going_reserved_chairs = [];
              this.selected_going_seat_ids = [];
              this.selected_go_seat_id.emit([]);
              this.reserved_chairs_ids = this.trip.departureReservedChairs?.split(',') || [];
            }
          }
          else if (this.trip_type == 'return') {
            // في وضع التعديل مع نفس الرحلة، احتفظ بالكراسي الأصلية
            if (this.is_edit_mode && this.pre_selected_chairs.length > 0) {
              this.selected_return_seat_ids = [...this.pre_selected_chairs];
              this.selected_return_seat_id.emit(this.selected_return_seat_ids);
              // إزالة الكراسي الأصلية من قائمة المحجوزة (لأنها تابعة لهذا الحجز)
              const allReserved = this.trip.returnReservedChairs?.split(',') || [];
              this.reserved_chairs_ids = allReserved.filter((id: string) => !this.pre_selected_chairs.includes(id));
            } else {
              this.selected_return_reserved_chairs = [];
              this.selected_return_seat_ids = [];
              this.selected_return_seat_id.emit([]);
              this.reserved_chairs_ids = this.trip.returnReservedChairs?.split(',') || [];
            }
          }
        });
      }

    }
  }
  select_seat(seat_id: string) {
    console.log(this.trip_type, seat_id);

    if (this.trip_type == 'going') {
      if (this.selected_going_seat_ids.includes(seat_id)) {
        this.selected_going_seat_ids = this.selected_going_seat_ids.filter(id => id !== seat_id);
      }
      else if (this.selected_going_seat_ids.length < this.chairs_nums_allowed_reserve && !this.selected_going_seat_ids.includes(seat_id)) {
        this.selected_going_seat_ids.push(seat_id);
      }
      this.selected_go_seat_id.emit(this.selected_going_seat_ids);
    }
    else if (this.trip_type == 'return') {
      if (this.selected_return_seat_ids.includes(seat_id)) {
        this.selected_return_seat_ids = this.selected_return_seat_ids.filter(id => id !== seat_id);
      }
      else if (this.selected_return_seat_ids.length < this.chairs_nums_allowed_reserve && !this.selected_return_seat_ids.includes(seat_id)) {
        this.selected_return_seat_ids.push(seat_id);
      }
      this.selected_return_seat_id.emit(this.selected_return_seat_ids);
    }
    else if (this.trip_type == 'transit') {
      if (this.selected_transit_seat_ids.includes(seat_id)) {
        this.selected_transit_seat_ids = this.selected_transit_seat_ids.filter(id => id !== seat_id);
      }
      else if (this.selected_transit_seat_ids.length < this.chairs_nums_allowed_reserve && !this.selected_transit_seat_ids.includes(seat_id)) {
        this.selected_transit_seat_ids.push(seat_id);
      }
      this.selected_transit_seat_id.emit(this.selected_transit_seat_ids);
    }
  }
}
