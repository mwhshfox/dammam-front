import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { DatePipe } from '@angular/common';
import { HotelsService } from '../../../core/services/hotels.service';
import { EnumsService } from '../../../core/services/enums.service';
import Swal from 'sweetalert2';
import { TripHotelsService } from '../../../core/services/trip-hotels.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-show-reservation',
  standalone: true,
  imports: [FormsModule, EnumPipe, DatePipe],
  templateUrl: './show-reservation.component.html',
  styleUrl: './show-reservation.component.scss'
})
export class ShowReservationComponent {

  constructor(private hotelsService: HotelsService, private activatedRoute:ActivatedRoute ,private tripHotelsService: TripHotelsService, private enumsService: EnumsService) { }

  table_head_titles: string[] = [
    'الإسم',
    'رقم الهاتف',
    'رقم الهوية',
    'الجنسية',
  ];

  trip_head_titles: string[] = [
    'نوع الرحلة',
    'كود الرحلة',
    ' الوجهة (من - الى)',
    'تاريخ',
    'سعر الكرسي'
  ]

  // الاعضاء
  @Input() reservation_details: any = {};
  @Output() total_paid_for_reservation = new EventEmitter<number>();
  @Output() notes_for_reservation = new EventEmitter<string>();
  @Output() total_cost_for_reservation = new EventEmitter<number>();

  isEditView:boolean = false

  users_nums: number = 0;
  total_chairs_price: number = 0;
  notes: string = '';
  total_days: number = 0;

  hotel_name: string = '';
  bed_price: number = 0;
  room_price: number = 0;
  all_days_hotel_cost: number = 0;
  reservation_total_cost_before_tax: number = 0;
  reservation_total_cost: number = 0;
  tax_rate: number = 15;
  tax_amount: number = 0;
  total_paid: string = '';
  remaining_cost: number = 0;
  reservation_payment_methods: { id: number, name: string }[] = [];

  ngOnInit(): void {
    console.log(this.reservation_details, 'reservation_details');
    this.isEditView = this.activatedRoute.snapshot.routeConfig?.path?.includes('Edit-Reservation') || false;

    this.reservation_payment_methods = this.enumsService.reservation_payment_method;
    this.users_nums = this.reservation_details?.show_data.users_data?.length;

    // تعبئة المبلغ المدفوع من بيانات الحجز (في حالة التعديل)
    if (this.reservation_details.moneyPaid && this.reservation_details.moneyPaid > 0) {
      this.total_paid = this.reservation_details.moneyPaid.toString();
    }

    // تعبئة الملاحظات من بيانات الحجز (في حالة التعديل)
    if (this.reservation_details.notes) {
      this.notes = this.reservation_details.notes;
    }

    // حساب عدد الأيام
    if (this.reservation_details.residenceDto?.fromDate && this.reservation_details.residenceDto?.toDate) {
      const date1 = new Date(this.reservation_details.residenceDto.fromDate);
      const date2 = new Date(this.reservation_details.residenceDto.toDate);
      const diffInMs = date2.getTime() - date1.getTime();
      this.total_days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
      this.get_total_chairs_cost();
      this.get_total_cost();
    }
    else {
      this.total_days = 0;
      this.get_total_chairs_cost();
      this.get_total_cost();
    }

    if (this.reservation_details.residenceDto?.hotelId && this.reservation_details.show_data?.trip_type != '4') {
      this.tripHotelsService.get_trip_hotel(this.reservation_details.show_data.trip_id_for_show_hotels, this.reservation_details.residenceDto.hotelId).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.hotel_name = res.data.name;
            // استخدام الأسعار المحفوظة إذا لم يتغير الفندق، وإلا استخدام أسعار API
            if (this.reservation_details.hotel_changed) {
              this.bed_price = res.data.bedPrice;
              this.room_price = res.data.roomPrice;
            } else {
              this.bed_price = this.reservation_details.residenceDto.bedPrice || res.data.bedPrice;
              this.room_price = this.reservation_details.residenceDto.roomPrice || res.data.roomPrice;
            }
            this.get_hotel_cost();
          }
        },
        error: (err: any) => {
          console.error('Error fetching trip hotel:', err);
          // fallback: جلب بيانات الفندق مباشرة
          this.hotelsService.get_hotel_by_id(this.reservation_details.residenceDto.hotelId).subscribe({
            next: (res: any) => {
              if (res.ok) {
                this.hotel_name = res.data.name;
                // استخدام الأسعار المحفوظة إذا لم يتغير الفندق
                if (this.reservation_details.hotel_changed) {
                  this.bed_price = res.data.bedPrice;
                  this.room_price = res.data.roomPrice;
                } else {
                  this.bed_price = this.reservation_details.residenceDto.bedPrice || res.data.bedPrice;
                  this.room_price = this.reservation_details.residenceDto.roomPrice || res.data.roomPrice;
                }
                this.get_hotel_cost();
              }
            }
          });
        }
      })
    }
    else if (this.reservation_details.residenceDto?.hotelId && this.reservation_details.show_data?.trip_type == '4') {
      this.hotelsService.get_hotel_by_id(this.reservation_details.residenceDto.hotelId).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.hotel_name = res.data.name;
            // استخدام الأسعار المحفوظة إذا لم يتغير الفندق
            if (this.reservation_details.hotel_changed) {
              this.bed_price = res.data.bedPrice;
              this.room_price = res.data.roomPrice;
            } else {
              this.bed_price = this.reservation_details.residenceDto.bedPrice || res.data.bedPrice;
              this.room_price = this.reservation_details.residenceDto.roomPrice || res.data.roomPrice;
            }
            this.get_hotel_cost();
          }
        }
      })
    }
    else {
      this.get_total_cost();
    }
  }

  get_total_chairs_cost() {
    if (this.reservation_details.show_data.trip_type == 1 || this.reservation_details.show_data.trip_type == 5 || this.reservation_details.show_data.trip_type == 6) {
      this.total_chairs_price = Number(this.reservation_details.busChairPrice) * this.users_nums;
      this.get_total_cost();
    }
    else if (this.reservation_details.show_data.trip_type == 2) {
      this.total_chairs_price = Number(this.reservation_details.returnBusChairPrice) * this.users_nums;
      this.get_total_cost();
    }
    else if (this.reservation_details.show_data.trip_type == 3) {
      this.total_chairs_price = Number(this.reservation_details.busChairPrice) * this.users_nums;
      this.total_chairs_price += Number(this.reservation_details.returnBusChairPrice) * this.users_nums;
      this.get_total_cost();
    }
  }

  get_hotel_cost() {
    if (this.reservation_details.residenceDto.accommodationUnitType == 1) {
      this.all_days_hotel_cost = this.users_nums * this.bed_price * this.total_days
      this.reservation_details.residenceDto.bedPrice = Number(this.bed_price);
      this.get_total_cost();
    }
    else if (this.reservation_details.residenceDto.accommodationUnitType == 2) {
      // الطريقة الجديدة: حساب التكلفة بناءً على إجمالي عدد الغرف
      const totalRooms = this.getTotalRoomsCount();
      this.all_days_hotel_cost = totalRooms * this.room_price * this.total_days;
      this.reservation_details.residenceDto.roomPrice = Number(this.room_price);
      this.get_total_cost();
    }
  }

  get_total_cost() {
    const total_cost = Number(this.all_days_hotel_cost) + Number(this.total_chairs_price);
    this.tax_amount = total_cost * (this.tax_rate / (100 + this.tax_rate));
    this.tax_amount = parseFloat(this.tax_amount.toFixed(2));
    this.reservation_total_cost = total_cost;
    this.reservation_total_cost_before_tax = total_cost - this.tax_amount;
    this.remaining_cost = Number(this.reservation_total_cost) - Number(this.total_paid);
    // إرسال الإجمالي للـ parent component
    this.total_cost_for_reservation.emit(this.reservation_total_cost);
  }

  get_remaining_cost() {
    if (Number(this.reservation_total_cost) < Number(this.total_paid)) {
      Swal.fire('خطاء', 'المبلغ المدفوع أكثر من المبلغ المطلوب', 'error');
      this.total_paid = '0';
      this.remaining_cost = Number(this.reservation_total_cost) - Number(this.total_paid);
      return
    }
    this.remaining_cost = Number(this.reservation_total_cost) - Number(this.total_paid);
    let paid_cost: number = Number(this.total_paid);
    this.total_paid_for_reservation.emit(paid_cost);
    
    this.reservation_details.moneyPaid = paid_cost;
    if (paid_cost == this.reservation_total_cost) {
      this.reservation_details.paymentType = 1;
    }
    else if (paid_cost < this.reservation_total_cost) {
      this.reservation_details.paymentType = 3;
    }
    else {
      this.reservation_details.paymentType = 2;
    }
  }

  select_payment_method(method_id: string) {
    this.reservation_details.paymentMethod = Number(method_id);
  }

  // دالة لحساب إجمالي عدد الغرف
  getTotalRoomsCount(): number {
    if (!this.reservation_details.residenceDto?.reservedRooms) {
      return 0;
    }
    return this.reservation_details.residenceDto.reservedRooms.reduce((total: number, room: any) => {
      return total + room.roomsCount;
    }, 0);
  }

  // دالة لإرجاع اسم نوع الغرفة
  getRoomTypeName(type: number): string {
    const roomTypes: { [key: number]: string } = {
      1: 'غرفة سرير كينج',
      2: 'غرفة سريرين',
      3: 'غرفة ثلاثة سراير',
      4: 'غرفة أربعة سراير',
      5: 'غرفة خمسة سراير',
      6: 'غرفة ستة سراير'
    };
    return roomTypes[type] || `غرفة ${type} سراير`;
  }
}