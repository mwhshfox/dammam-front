import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Ihotel } from '../../../core/models/ihotel';
import { Itrip } from '../../../core/models/itrip';
import { EnumsService } from '../../../core/services/enums.service';
import { HotelsService } from '../../../core/services/hotels.service';
import { ReservationsService } from '../../../core/services/reservations.service';
import { TripsService } from '../../../core/services/trips.service';
import { UsersService } from '../../../core/services/users.service';
import { BusesComponent } from "../../../shared/components/buses/buses.component";
import { TripsForReservationComponent } from '../../trips/trips-for-reservation/trips-for-reservation.component';
import { ShowReservationComponent } from "../show-reservation/show-reservation.component";
import { DatePickerComponent } from "../../../shared/components/date-picker/date-picker.component";
import { TripHotelsService } from '../../../core/services/trip-hotels.service';

@Component({
  selector: 'app-edit-reservation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, BusesComponent, TripsForReservationComponent, NgTemplateOutlet, ShowReservationComponent, DatePipe, DatePickerComponent],
  providers: [DatePipe],
  templateUrl: './edit-reservation.component.html',
  styleUrl: './edit-reservation.component.scss'
})
export class EditReservationComponent {
  today_date: string = '';

  ////////////////////////////////////////////////////////////////// متغيرات التعديل (Edit Mode) ****
  reservation_id: string = '';
  original_reservation: any = null;
  original_customers_count: number = 0;
  original_ticket_id: string = '';
  original_residence_id: string = '';
  original_seats: {
    going: string[];
    return: string[];
    transit: string[];
  } = { going: [], return: [], transit: [] };

  // IDs الرحلات الأصلية (لا تتغير)
  original_going_trip_id: string = '';
  original_return_trip_id: string = '';
  original_closed_trip_id: string = '';

  // الكراسي الأصلية المحفوظة (لا تتغير)
  saved_original_seats: {
    going: string[];
    return: string[];
    transit: string[];
  } = { going: [], return: [], transit: [] };

  // بيانات التسكين الأصلية (لا تتغير)
  saved_original_residence: {
    residence_type_selected_id: number | null;
    residence_form_values: any;
  } = { residence_type_selected_id: null, residence_form_values: null };

  loading_reservation: boolean = true;

  ////////////////////////////////////////////////////////////////// enum variables & shared variables ****
  tomorrow_date!: string;
  // الرحلة المختارة من صفحة الرحلات
  trip_selected_from_trips_page: string = '';

  nationalities: { id: number, name: string }[] = [];
  genderes: { id: number, name: string }[] = [];
  trip_types: { id: number, name: string }[] = [];
  open_trip_types: { id: number, name: string }[] = [];
  residence_types: { id: number, name: string }[] = [];
  stay_types: { id: number, name: string }[] = [];
  accommodation_unit_type: { id: number, name: string }[] = [];

  active_step: number = 1;
  list_titles: string[] = ['بيانات العميل', 'بيانات الرحلة', 'بيانات الفندق', 'بيانات الدفع'];
  next_step_loading: boolean = false;
  completed_steps: boolean[] = [false, false, false, false];
  show_reservation_details: any = {};
  private readonly router = inject(Router);
  private readonly datePipe= inject(DatePipe);
  @ViewChild('residence_to_date_input') dateInput!: ElementRef<HTMLInputElement>;

  // flags لتتبع التغييرات في التعديل
  hotel_changed: boolean = false;
  trip_changed: boolean = false;


  ////////////////////////////////////////////////////////////////// step_1 variables & functions *************************************************
  myForm: FormGroup;
  table_head_titles: string[] = [
    'الإسم',
    // 'الإسم الأخير',
    'رقم الهاتف',
    'رقم الهوية',
    'الجنسية',
    'الجنس',
    '(عميل / مرافق)'
  ];
  get users(): FormArray {
    return this.myForm.get('users') as FormArray;
  }
  users_searched: any[] = [];
  user_searched: any;
  search_input: string = '';
  user_added_already_alert: boolean = false;
  // العملاء المؤكدون
  confirmed_users: any[] = [];
  // مشاكل اضافة العملاء
  users_create_issues: any[] = [];
  // خطأ البحث
  search_error_msg: string = '';
  //  step_1 functions

  updateControlToNumber(event: Event, index: number, controlName: string) {
    const value = (event.target as HTMLSelectElement).value;
    const userGroup = this.users.at(index);
    if (userGroup) {
      userGroup.get(controlName)?.setValue(value ? Number(value) : null);
    }
  }

  openDatePicker(input: HTMLInputElement): void {
    if (input.showPicker) {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  }

  set_min_return_date() {
    const value = this.residence_form.get('residence_from_date')?.value;
    console.log('trip_type_selected_id', this.trip_type_selected_id);
    if ((this.trip_type_selected_id === '4' || this.trip_type_selected_id === '1' || this.trip_type_selected_id === '3') && value) {
      const date = new Date(value);
      date.setDate(date.getDate() + 1); // زيادة يوم بالتوقيت المحلي

      // إنشاء التاريخ بصيغة YYYY-MM-DD يدويًا
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');

      this.min_return_date = `${yyyy}-${mm}-${dd}`;
    }
  }
  // ###############################  start new function by shaabaaaan to get next day for some date #####################
  getNextDay(date: string | Date): Date | any {
    if (!date) return null;

    let parsedDate: Date;

    if (typeof date === 'string') {
      const cleanDate = date.split('T')[0]; // نقطع الوقت لو موجود
      const [year, month, day] = cleanDate.split('-').map(Number);
      parsedDate = new Date(year, month - 1, day); // توقيت محلي
    } else if (date instanceof Date) {
      parsedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // نسخة محلية بدون الوقت
    } else {
      return null; // مش تاريخ أصلاً
    }

    if (isNaN(parsedDate.getTime())) {
      return null; // التاريخ غير صالح
    }

    parsedDate.setDate(parsedDate.getDate() + 1); // نضيف يوم

    return parsedDate;
  }
  // ############################################### end new function by shaabaaaan ########################################

  //////////////////////////////////////// البحث عن عميل بواسطة الهوية او رقم الهاتف
  search_client(search: string) {
    this.search_error_msg = '';
    console.log(search);
    if (search.length > 0) {
      this.user_searched = '';
      this.user_added_already_alert = false;
      this.usersService.get_user_by_id_or_number(search).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.users_searched = res.data;
          }
          else {
            this.search_error_msg = res.message
          }
        },
        error: (err: HttpErrorResponse) => {
          this.search_error_msg = err.error.message
        }
      });
    }
    else {
      console.log('ادخل رقم الهاتف او الرقم القومي للبحث');

    }
  }

  //////////////////////////////////////// إضافة العميل من نتائج البحث
  select_user(user: any) {
    const user_data = user;
    const user_exist = this.users.controls.some(control => control.get('nationalityId')?.value == user_data?.nationalityId);

    if (!user_exist) {
      this.users_searched = this.users_searched.filter(user => user.nationalityId !== user_data?.nationalityId);
      const user_selected_data = this.fb.group({
        firstName: [{ value: user_data?.firstName + ' ' + user_data?.lastName, disabled: true }, Validators.required],
        lastName: [{ value: user_data?.lastName, disabled: true }, Validators.required],
        phoneNumber: [{ value: user_data?.phoneNumber, disabled: true }, Validators.required],
        nationalityId: [{ value: user_data?.nationalityId, disabled: true }, Validators.required],
        nationality: [{ value: user_data?.nationality, disabled: true }, Validators.required],
        gender: [{ value: user_data?.gender, disabled: true }, Validators.required],
        isCompanion: [{ value: user_data?.isCompanion, disabled: true }],
        id: [{ value: user_data?.id, disabled: true }, Validators.required],
        role: [{ value: 'User', disabled: true }],
      });
      this.users.push(user_selected_data);
      this.search_input = '';
      //this.user_searched = null;
    }
    else {
      this.user_added_already_alert = true;
    }
  }

  //////////////////////////////////////// اضافة عميل جديد
  create_new_user() {
    const userGroup = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['.', Validators.required],
      phoneNumber: ['', Validators.required],
      nationalityId: ['', Validators.required],
      nationality: [null, Validators.required],
      gender: [null, Validators.required],
      isCompanion: [false],
      role: 'User'
    });

    this.users.push(userGroup);
  }

  //////////////////////////////////////// حذف عميل
  remove_user(index: number): void {
    this.users.removeAt(index);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////// hotels variables
  all_hotels: Ihotel[] = [];
  /////////////////////////////////////////////////////////////// trips variables
  all_trips: Itrip[] = [];
  trip_selected_id: string = '';
  constructor(private reservationsService: ReservationsService, private formBuilder: FormBuilder, private usersService: UsersService, private fb: FormBuilder, private enumsService: EnumsService, private hotelsService: HotelsService, private tripsService: TripsService, private tripHotelsService: TripHotelsService, private activatedRoute: ActivatedRoute) {
    this.myForm = this.fb.group({
      users: this.fb.array([]) // FormArray يحتوي على المستخدمين
    });
  }
  ngOnInit(): void {
    // استخراج reservation_id من الـ route للتعديل
    const reservationId = this.activatedRoute.snapshot.paramMap.get('reservation_id');
    if (reservationId) {
      this.reservation_id = reservationId;
      this.reservation_data.reservationId = reservationId;
    }

    this.residence_form = this.formBuilder.group({
      residence_from_date: [null, Validators.required],
      residence_to_date: [null, Validators.required],
      stay_type: [null, Validators.required],
      hotel_id: [null, Validators.required],
      unit_type: [null, Validators.required],
    });

    this.residence_form.get('unit_type')?.valueChanges.subscribe(value => {
      if (value == '2') {
        // إعادة تعيين عدادات الغرف
        this.roomTypeCounts = {};
      } else {
        // مسح البيانات
        this.roomTypeCounts = {};
      }
    });

    this.today_date = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    this.tomorrow_date = `${year}-${month}-${day}`;

    this.nationalities = this.enumsService.nationalities;
    this.genderes = this.enumsService.genderes;
    this.trip_types = this.enumsService.trip_types;
    this.open_trip_types = this.enumsService.open_trip_types;
    this.residence_types = this.enumsService.residence_types;
    this.stay_types = this.enumsService.stay_types;
    this.accommodation_unit_type = this.enumsService.accommodation_unit_type;
    this.room_types = this.enumsService.room_types;

    // تحميل بيانات الحجز للتعديل
    if (this.reservation_id) {
      this.load_reservation_data();
    }
  }


  ////////////////////////////////////////////////////////////////// دوال تحميل وتعبئة بيانات الحجز للتعديل
  load_reservation_data() {
    this.loading_reservation = true;
    this.reservationsService.get_reservation_by_id(this.reservation_id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.original_reservation = res.data;



          // لا يمكن ان يتم تعديل حجز قد بدأت رحلته بالفعل او انتهت بالفعل 
          // لا يوجد لدينا تاريخ بداية و نهاية الرحلة ولكن نعتمد علي تاريخ الاقامة residenceDto 
          console.log('fromDate - todate' , this.original_reservation.residenceDto?.fromDate , this.original_reservation.residenceDto?.toDate);          
          if(this.original_reservation.residenceDto){ // التأكد ان لديه تاريخ اقاهمة لانه يمكن ان يكون تسكين فقط 
            if(this.original_reservation.residenceDto?.fromDate ? this.original_reservation.residenceDto?.fromDate >= this.today_date : this.original_reservation.residenceDto?.toDate >= this.today_date) {
              console.log('========  passed  =========');
            }
            else{
              Swal.fire({
                title:'غير مسموح',
                text:'لا يمكنك تعديل حجز بعد بداية الرحلة او انتهائها',
                icon:'error'
              })
              this.router.navigate(['/reservations']);
              return
            }
          }
          // لا يمكن ان يتم تعديل حجز قد بدأت رحلته بالفعل او انتهت بالفعل 



          console.log('Original Reservation:', this.original_reservation);
          this.populate_form_data(res.data);
        } else {
          Swal.fire('خطأ', res.message || 'حدث خطأ أثناء تحميل بيانات الحجز', 'error');
          this.router.navigate(['reservations']);
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire('خطأ', err.error?.message || 'حدث خطأ أثناء تحميل بيانات الحجز', 'error');
        this.router.navigate(['reservations']);
      },
      complete: () => {
        this.loading_reservation = false;
      }
    });
  }

  populate_form_data(reservation: any) {
    // 1. تعبئة بيانات العملاء (الخطوة 1)
    this.populate_customers_data(reservation);

    // 2. تعبئة بيانات الرحلة (الخطوة 2)
    // populate_trip_data سيستدعي populate_hotel_data بعد تحميل بيانات الرحلة
    this.populate_trip_data(reservation);

    // 3. حفظ بيانات إضافية
    this.reservation_data.notes = reservation.notes || '';
    this.reservation_data.discount = reservation.discount || 0;

    // 4. تعبئة بيانات الدفع (الخطوة 4)
    this.reservation_data.moneyPaid = reservation.moneyPaid || 0;
    this.reservation_data.paymentMethod = reservation.paymentMethod || null;
    this.reservation_data.paymentType = reservation.paymentType || 2;
  }

  populate_customers_data(reservation: any) {
    // مسح القائمة الحالية
    this.users.clear();
    this.confirmed_users = [];

    // إضافة العملاء من الحجز
    if (reservation.customerReservations && reservation.customerReservations.length > 0) {
      for (const customerReservation of reservation.customerReservations) {
        const customer = customerReservation.customer;
        const userGroup = this.fb.group({
          firstName: [{ value: customer.firstName + ' ' + customer.lastName, disabled: true }, Validators.required],
          lastName: [{ value: customer.lastName, disabled: true }, Validators.required],
          phoneNumber: [{ value: customer.phoneNumber, disabled: true }, Validators.required],
          nationalityId: [{ value: customer.nationalityId, disabled: true }, Validators.required],
          nationality: [{ value: customer.nationality, disabled: true }, Validators.required],
          gender: [{ value: customer.gender, disabled: true }, Validators.required],
          isCompanion: [{ value: customer.isCompanion, disabled: true }],
          id: [{ value: customer.id, disabled: true }, Validators.required],
          role: [{ value: 'User', disabled: true }],
        });
        this.users.push(userGroup);
        this.confirmed_users.push(customer.id);
      }
    }

    // حفظ العدد الأصلي للعملاء
    this.original_customers_count = this.confirmed_users.length;
    this.reservation_data.customersIds = [...this.confirmed_users];
    this.reservation_data.show_data.users_data = this.users.getRawValue();
  }

  populate_trip_data(reservation: any) {
    // الحصول على بيانات التذكرة (ticketDto أو ticket)
    const ticketData = reservation.ticketDto || reservation.ticket;

    // التحقق من نوع الرحلة: إذا ticketDto == null و residenceDto موجودة → تسكين فقط
    if (!ticketData && (reservation.residenceDto || reservation.residence)) {
      this.trip_type_selected_id = '4';
      this.trip_type_selected = '4';
      console.log('Trip Type: تسكين فقط (ticketDto is null, residenceDto exists)');
      // استدعاء populate_hotel_data مباشرة لأنه لا توجد رحلة
      this.populate_hotel_data(reservation);
      this.completed_steps[0] = true;
      this.completed_steps[1] = true;
      return;
    }

    // تحديد نوع الرحلة من ticketDto.tripTicketType
    const tripType = ticketData?.tripTicketType || reservation.tripTicketType;
    if (tripType) {
      // إذا كان نوع الرحلة 1, 2, 3, أو 6 فهي رحلة مفتوحة
      // نختار 10 في السيليكت الأول والنوع الفعلي في السيليكت الثاني
      if (tripType == 1 || tripType == 2 || tripType == 3 || tripType == 6) {
        this.trip_type_selected = '10'; // السيليكت الأول: رحلة مفتوحة
        this.open_trip_type_selected = tripType.toString(); // السيليكت الثاني: النوع الفعلي
        this.trip_type_selected_id = tripType.toString(); // النوع الفعلي للمنطق
      } else {
        // رحلة مغلقة (5) أو تسكين (4)
        this.trip_type_selected_id = tripType.toString();
        this.trip_type_selected = tripType.toString();
      }
      console.log('Trip Type Selected:', this.trip_type_selected_id, 'Main Select:', this.trip_type_selected, 'Open Type:', this.open_trip_type_selected);
    }

    // حفظ ticket ID الأصلي
    if (ticketData?.ticketId || ticketData?.id) {
      this.original_ticket_id = ticketData.ticketId || ticketData.id;
    }

    // تحميل بيانات الرحلة والكراسي
    if (ticketData && ticketData.tripTickets && ticketData.tripTickets.length > 0) {
      const tripTicket = ticketData.tripTickets[0];
      const tripId = tripTicket.tripId;

      // حفظ الكراسي الأصلية من التذكرة الأولى
      if (tripTicket.departureReservedChairs) {
        this.original_seats.going = tripTicket.departureReservedChairs.split(',').filter((s: string) => s.trim());
        this.going_selected_seats = [...this.original_seats.going];
      }
      if (tripTicket.returnReservedChairs) {
        this.original_seats.return = tripTicket.returnReservedChairs.split(',').filter((s: string) => s.trim());
        this.return_selected_seats = [...this.original_seats.return];
      }
      if (tripTicket.transitReservedChairs) {
        this.original_seats.transit = tripTicket.transitReservedChairs.split(',').filter((s: string) => s.trim());
        this.transit_selected_seats = [...this.original_seats.transit];
      }

      // في حالة trip_type = 3 (ذهاب وعودة مفتوحة) - الكراسي موزعة على تذكرتين
      if (tripType == 3 && ticketData.tripTickets.length > 1) {
        const returnTripTicket = ticketData.tripTickets[1];
        if (returnTripTicket.returnReservedChairs) {
          this.original_seats.return = returnTripTicket.returnReservedChairs.split(',').filter((s: string) => s.trim());
          this.return_selected_seats = [...this.original_seats.return];
        }
      }

      // حفظ ID الرحلة الأصلية والكراسي (للمقارنة عند تغيير الرحلة)
      if (tripType == 1 || tripType == 3 || tripType == 6) {
        this.original_going_trip_id = tripId;
      }
      if (tripType == 2) {
        this.original_return_trip_id = tripId;
      }
      // حفظ الكراسي الأصلية (نسخة ثابتة لا تتغير)
      this.saved_original_seats = {
        going: [...this.original_seats.going],
        return: [...this.original_seats.return],
        transit: [...this.original_seats.transit]
      };

      // تحميل بيانات الرحلة
      if (tripId) {
        this.load_trip_details(tripId, tripType);
      } else {
        // حالة لا توجد رحلة - استدعاء populate_hotel_data مباشرة
        this.populate_hotel_data(reservation);
        this.completed_steps[0] = true;
        this.completed_steps[1] = true;
      }
    } else if (ticketData && ticketData.tripTicket && ticketData.tripTicket.length > 0) {
      // دعم الـ structure القديم (tripTicket بدلاً من tripTickets)
      const tripTicket = ticketData.tripTicket[0];
      const tripId = tripTicket.tripId;

      // حفظ الكراسي الأصلية من التذكرة الأولى
      if (tripTicket.departureReservedChairs) {
        this.original_seats.going = tripTicket.departureReservedChairs.split(',').filter((s: string) => s.trim());
        this.going_selected_seats = [...this.original_seats.going];
      }
      if (tripTicket.returnReservedChairs) {
        this.original_seats.return = tripTicket.returnReservedChairs.split(',').filter((s: string) => s.trim());
        this.return_selected_seats = [...this.original_seats.return];
      }
      if (tripTicket.transitReservedChairs) {
        this.original_seats.transit = tripTicket.transitReservedChairs.split(',').filter((s: string) => s.trim());
        this.transit_selected_seats = [...this.original_seats.transit];
      }

      // في حالة trip_type = 3 (ذهاب وعودة مفتوحة) - الكراسي موزعة على تذكرتين
      if (tripType == 3 && ticketData.tripTicket.length > 1) {
        const returnTripTicket = ticketData.tripTicket[1];
        if (returnTripTicket.returnReservedChairs) {
          this.original_seats.return = returnTripTicket.returnReservedChairs.split(',').filter((s: string) => s.trim());
          this.return_selected_seats = [...this.original_seats.return];
        }
      }

      // حفظ ID الرحلة الأصلية والكراسي (للمقارنة عند تغيير الرحلة)
      if (tripType == 1 || tripType == 3 || tripType == 6) {
        this.original_going_trip_id = tripId;
      }
      if (tripType == 2) {
        this.original_return_trip_id = tripId;
      }
      // حفظ الكراسي الأصلية (نسخة ثابتة لا تتغير)
      this.saved_original_seats = {
        going: [...this.original_seats.going],
        return: [...this.original_seats.return],
        transit: [...this.original_seats.transit]
      };

      // تحميل بيانات الرحلة
      if (tripId) {
        this.load_trip_details(tripId, tripType);
      } else {
        this.populate_hotel_data(reservation);
        this.completed_steps[0] = true;
        this.completed_steps[1] = true;
      }
    } else {
      // حالة تسكين فقط (trip_type == 4) - لا توجد تذكرة رحلة
      this.populate_hotel_data(reservation);
      this.completed_steps[0] = true;
      this.completed_steps[1] = true;
    }

    // حفظ أسعار الكراسي
    this.reservation_data.busChairPrice = reservation.busChairPrice || null;
    this.reservation_data.returnBusChairPrice = reservation.returnBusChairPrice || null;

    // تعيين نوع الرحلة في show_data
    this.reservation_data.show_data.trip_type = this.trip_type_selected_id;
  }

  load_trip_details(tripId: string, tripType: number) {
    this.tripsService.get_trip_by_id(tripId).subscribe({
      next: (res: any) => {
        if (res.ok) {
          const tripData = res.data;
          // تحديد نوع الرحلة وتعيين البيانات المناسبة
          if (tripType == 5) {
            // رحلة مغلقة
            this.closed_trip_selected = tripData;
            this.reservation_data.show_data.closed_trip_selected = tripData;
            this.trip_id_for_show_hotels = tripId;
            // حفظ ID الرحلة المغلقة الأصلية
            this.original_closed_trip_id = tripId;
          } else if (tripType == 1 || tripType == 6) {
            // رحلة مفتوحة ذهاب أو ترانزيت
            this.open_going_trip_selected = tripData;
            this.reservation_data.show_data.open_going_trip_selected = tripData;
            this.trip_id_for_show_hotels = tripId;
          } else if (tripType == 2) {
            // رحلة مفتوحة عودة
            this.open_return_trip_selected = tripData;
            this.reservation_data.show_data.open_return_trip_selected = tripData;
          } else if (tripType == 3) {
            // رحلة مفتوحة ذهاب وعودة - نحتاج تحميل الرحلتين
            // هنا نفترض أن الرحلة الأولى هي الذهاب
            this.open_going_trip_selected = tripData;
            this.reservation_data.show_data.open_going_trip_selected = tripData;
            this.trip_id_for_show_hotels = tripId;

            // تحميل رحلة العودة إذا كان هناك أكثر من tripTicket
            // دعم كلا الـ structure: ticketDto/ticket و tripTickets/tripTicket
            const ticketData = this.original_reservation.ticketDto || this.original_reservation.ticket;
            const tripTicketsArray = ticketData?.tripTickets || ticketData?.tripTicket;

            if (tripTicketsArray?.length > 1) {
              const returnTripId = tripTicketsArray[1].tripId;
              // حفظ ID رحلة العودة الأصلية
              this.original_return_trip_id = returnTripId;
              this.tripsService.get_trip_by_id(returnTripId).subscribe({
                next: (returnRes: any) => {
                  if (returnRes.ok) {
                    this.open_return_trip_selected = returnRes.data;
                    this.reservation_data.show_data.open_return_trip_selected = returnRes.data;
                  }
                }
              });
            }
          }

          // بعد تحميل بيانات الرحلة، نستدعي populate_hotel_data
          if (this.original_reservation) {
            this.populate_hotel_data(this.original_reservation);
          }

          // تعيين الخطوات المكتملة
          this.completed_steps[0] = true;
          this.completed_steps[1] = true;
        }
      }
    });
  }

  populate_hotel_data(reservation: any) {
    // التحقق من وجود بيانات السكن
    if (reservation.residence || reservation.residenceDto) {
      const residence = reservation.residence || reservation.residenceDto;

      // حفظ residence ID الأصلي
      this.original_residence_id = residence.id || '';

      // تحديد نوع الإقامة (مع سكن)
      this.residence_type_selected_id = 1;
      this.reservation_data.show_data.residence_type_selected_id = 1;

      // تحديد طريقة الحجز (سرير أو غرفة) بناءً على الأسعار
      let unitType: string | null = null;
      if (residence.accommodationUnitType && residence.accommodationUnitType > 0) {
        // استخدام accommodationUnitType إذا كانت قيمته صحيحة
        unitType = residence.accommodationUnitType.toString();
      } else if (residence.bedPrice && residence.bedPrice > 0 && (!residence.roomPrice || residence.roomPrice == 0)) {
        // إذا سعر السرير موجود وسعر الغرفة = 0 → حجز بالسرير
        unitType = '1';
      } else if (residence.roomPrice && residence.roomPrice > 0 && (!residence.bedPrice || residence.bedPrice == 0)) {
        // إذا سعر الغرفة موجود وسعر السرير = 0 → حجز بالغرفة
        unitType = '2';
      }

      console.log('Unit Type determined:', unitType, 'bedPrice:', residence.bedPrice, 'roomPrice:', residence.roomPrice);

      // تعبئة نموذج الفندق
      this.residence_form.patchValue({
        residence_from_date: this.formatDateForInput(residence.fromDate),
        residence_to_date: this.formatDateForInput(residence.toDate),
        stay_type: residence.stayType?.toString() || null,
        hotel_id: residence.hotelId || null,
        unit_type: unitType,
      });

      // تعيين min_return_date لإظهار حقل تاريخ العودة (مهم للتسكين وأنواع الرحلات الأخرى)
      if (residence.fromDate) {
        const fromDate = new Date(residence.fromDate);
        fromDate.setDate(fromDate.getDate() + 1);
        const yyyy = fromDate.getFullYear();
        const mm = String(fromDate.getMonth() + 1).padStart(2, '0');
        const dd = String(fromDate.getDate()).padStart(2, '0');
        this.min_return_date = `${yyyy}-${mm}-${dd}`;
      }

      // تحديد نوع الحجز (غرف) وتعبئة عدد الغرف
      if (unitType == '2' && residence.reservedRooms && residence.reservedRooms.length > 0) {
        // حجز غرف
        for (const room of residence.reservedRooms) {
          this.roomTypeCounts[room.type] = room.roomsCount;
        }
      }

      // تحميل الفنادق حسب نوع الرحلة
      if (this.trip_type_selected_id == '4') {
        // تسكين فقط: جلب كل الفنادق
        this.get_all_hotels();
      } else {
        // رحلة مع سكن: جلب فنادق الرحلة فقط
        if (this.trip_id_for_show_hotels) {
          this.get_hotels_in_trip_by_trip_id(this.trip_id_for_show_hotels);
        }
      }

      // حفظ تواريخ العرض
      this.reservation_data.show_data.residence_from_date_to_show = residence.fromDate;
      this.reservation_data.show_data.residence_to_date_to_show = residence.toDate;
      this.reservation_data.show_data.trip_id_for_show_hotels = this.trip_id_for_show_hotels;

      // بناء residenceDto للخطوة 4 مباشرة
      this.reservation_data.residenceDto = {
        id: this.original_residence_id,
        fromDate: this.formatDateOnly(residence.fromDate),
        toDate: this.formatDateOnly(residence.toDate),
        stayType: Number(residence.stayType),
        hotelId: residence.hotelId,
        accommodationUnitType: Number(unitType),
        bedPrice: residence.bedPrice || 0,
        roomPrice: residence.roomPrice || 0,
        reservedRooms: residence.reservedRooms || []
      };

      // تعيين الخطوة 3 كمكتملة (بيانات الفندق محملة)
      this.completed_steps[2] = true;

      // حفظ بيانات التسكين الأصلية (للاستعادة عند العودة للرحلة الأصلية)
      this.saved_original_residence = {
        residence_type_selected_id: this.residence_type_selected_id,
        residence_form_values: this.residence_form.getRawValue()
      };
    } else {
      // بدون سكن
      this.residence_type_selected_id = 2;
      this.reservation_data.show_data.residence_type_selected_id = 2;

      // حفظ بيانات التسكين الأصلية (بدون سكن)
      this.saved_original_residence = {
        residence_type_selected_id: this.residence_type_selected_id,
        residence_form_values: null
      };
    }
  }

  formatDateForInput(dateString: string | null): string | null {
    if (!dateString) return null;
    // تحويل التاريخ لصيغة YYYY-MM-DD للـ input
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //////////////////////////////////////////////////////////////////

  updateRoomTypeCount(roomTypeId: number, event: any): void {
    const value = parseInt(event.target.value) || 0;
    this.roomTypeCounts[roomTypeId] = value;
  }

  // دالة لحساب إجمالي الغرف
  getTotalRoomsCount(): number {
    return Object.values(this.roomTypeCounts).reduce((total, count) => total + count, 0);
  }


  ////////////////////////////////////////////////////////////////////////// step_2 variables & function ********************************************

  trip_type_selected: string = ''; //  مغلقة / مفتوحة / تسكين / ......
  open_trip_type_selected: string = ''; // نوع الرحلة المفتوحة
  trip_type_selected_id: string = ''; // id نوع الرحلة اللي تم اختيارها
  residence_type_selected_id: null | number = null; // نوع الإقامة 
  trip_id_for_show_hotels: string = ''; // id الرحلة اللي تم اختيارها

  select_trip_type(trip_type_id: string) {
    this.reset_step_3();
    if (trip_type_id == '4' || trip_type_id == '5' || trip_type_id == '10') {
      this.open_trip_type_selected = '';
    }
    if (trip_type_id == '4') {
      this.residence_type_selected_id = 1;
    }
    this.trip_type_selected_id = trip_type_id;

    // إلغاء تحديد جميع الرحلات عند تغيير النوع
    this.open_going_trip_selected = {} as any;
    this.open_return_trip_selected = {} as any;
    this.closed_trip_selected = {} as any;
    this.going_selected_seats = [];
    this.return_selected_seats = [];
    this.transit_selected_seats = [];
    this.trip_id_for_show_hotels = '';

    // تصفير الكراسي الأصلية لأن المستخدم يغير نوع الرحلة
    this.original_seats = { going: [], return: [], transit: [] };

    console.log(this.trip_type_selected_id, 'mohamed');
  }

  //////////////////////////////////////////////////////////////////////// step_3 variables & function ***************************************************
  residence_form!: FormGroup;
  go_date: string = ''; // تاريخ الذهاب
  return_date: string = ''; // تاريخ العودة

  trip_head_titles: string[] = ['كود الرحلة', 'عدد الكراسي', 'تاريخ الذهاب', 'تاريخ العودة', 'من مدينة', 'إلي مدينة'];
  no_hotels_tickets_for_this_trip: boolean = false;
  no_hotels_tickets_for_this_trip_msg: string = '';
  min_return_date: any;
  /////////////////////////
  room_types: { id: number, name: string }[] = [];
  roomTypeCounts: { [key: number]: number } = {};

  ////////////////////////////////////////////////////////////////////// step_4 variables & function

  money_paid: number | null = null;
  reserved_data_in_trip_per_hotel: any = {};

  get_all_hotels() {
    this.hotelsService.get_all_hotels().subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_hotels = res.data;
        }
      }
    });
  }
  get_hotels_in_trip_by_trip_id(trip_id: string) {
    this.all_hotels = [];
    this.tripHotelsService.get_hotels_in_trip_by_trip_id(trip_id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.all_hotels = res.data;
        }
      }
    })
  }
  // get hotels if residence_type_selected_id == 1
  get_hotels_in_case_resedince() {
    if (this.residence_type_selected_id == 1 && this.trip_type_selected_id != '4') {
      this.get_hotels_in_trip_by_trip_id(this.trip_id_for_show_hotels);
    }
  }
  get_reserved_rooms() {
    this.hotel_changed = true;
    if (this.trip_type_selected_id == '4') {
      return
    }
    this.reserved_data_in_trip_per_hotel = {};
    this.no_hotels_tickets_for_this_trip = false;
    const hotel_id = this.residence_form.get('hotel_id')?.value;
    let trip_id: string = '';
    if (this.trip_type_selected_id == '1' || this.trip_type_selected_id == '3' || this.trip_type_selected_id == '6') {
      trip_id = this.open_going_trip_selected.id;
    }
    else if (this.trip_type_selected_id == '5') {
      trip_id = this.closed_trip_selected.id;
    }
    this.tripsService.get_reserved_beds_in_trip_per_hotel(trip_id, hotel_id).subscribe({
      next: (res: any) => {
        if (res.ok) {
          this.reserved_data_in_trip_per_hotel = res.data;
        }
      },
      error: (err: any) => {
        this.no_hotels_tickets_for_this_trip = true;
        this.no_hotels_tickets_for_this_trip_msg = err.error.message
      }
    })
  }



  reservation_data: any = {
    "show_data": {},
    "reservationId": "",
    "moneyPaid": 0,
    "notes": "",
    "discount": 0,
    "busChairPrice": null,
    "returnBusChairPrice": null,
    "fromDate": null,
    "toDate": null,
    "customersIds": [],
    "employeeId": "",
    "paymentType": 2,
    "paymentMethod": null,
    "residenceDto": null,
    "ticketDto": null
  }


  ////////////////////////////////////// التحقق والتنقل بين الخطوات
  enabled_users: any[] = [];
  go_to_step(step: number) {
    if (step == this.active_step) return;
    // go to step from step 1
    else if (this.active_step == 1 && step != 1) {
      this.confirmed_users = [];
      this.enabled_users = [];
      this.next_step_loading = true;
      let all_valid = true; // for only enabled users (creation)
      (this.users.controls as FormGroup[]).forEach(userGroup => {
        if (!userGroup.disabled) {
          this.enabled_users.push(userGroup);
        }
        else {
          this.confirmed_users.push(userGroup.get('id')?.value);
        }
      })

      // نتحقق من صلاحية الأعضاء المفعّلين
      for (const userGroup of this.enabled_users) {
        if (userGroup.invalid) {
          all_valid = false;
          break;
        }
      }

      if (all_valid && this.users.length > 0 && this.enabled_users.length > 0) {
        this.usersService.add_system_users(this.users.value).subscribe({
          next: (res: any) => {
            let all_successed = true;
            this.users_create_issues = [];
            for (const user of res.data) {
              if (!user.success) {
                all_successed = false;
                this.users_create_issues.push(user);
              }
              else {
                this.confirmed_users.push(user.originalData.id);

                const matched_user_control = this.users.controls.find((ctrl) =>
                  ctrl.get('phoneNumber')?.value === user.originalData.phoneNumber
                ) as FormGroup;

                if (matched_user_control) {
                  matched_user_control.addControl('id', new FormControl(user.originalData.id));
                }
              }
            }
            if (all_successed) {
              this.users.disable();
              this.enabled_users = [];
              this.completed_steps[0] = true;
              this.active_step = 2;
              // this.show_reservation_details.users_data = this.users.getRawValue();
              this.reservation_data.customersIds = this.confirmed_users;
              this.reservation_data.show_data.users_data = this.users.getRawValue();
              Swal.fire("نجاح", "تم اضافة المستخدمين", "success");
            }
            else {
              const formattedHtml = this.users_create_issues.map(item => {
                const fullName = `${item.originalData.firstName} ${item.originalData.lastName}`;
                const message = item.message;
                return `<p><strong>${fullName}</strong><br class="mt-2"><span class="block text-red-600 mt-2">${message}</span></p>`;
              }).join('<hr class="my-4">'); // فاصلة بين كل مستخدم

              Swal.fire({
                title: 'أخطاء المستخدمين',
                html: formattedHtml,
                icon: 'error',
                confirmButtonText: 'حسناً'
              });
              console.log(this.users_create_issues);

            }
          },
          error: (err: HttpErrorResponse) => {
            this.next_step_loading = false;
            this.completed_steps[0] = false;
          },
          complete: () => {
            this.next_step_loading = false;
          }
        });
      }

      else if (this.enabled_users.length == 0 && this.users.length > 0) {
        this.next_step_loading = false;
        this.completed_steps[0] = true;
        Swal.fire("نجاح", "تم اضافة المستخدمين", "success").then((result) => {
          this.active_step = 2;
        });
        // this.show_reservation_details.users_data = this.users.getRawValue();
        this.reservation_data.customersIds = this.confirmed_users;
        this.reservation_data.show_data.users_data = this.users.getRawValue();
      }
      else {
        this.next_step_loading = false;
        this.completed_steps[0] = false;
        Swal.fire("خطأ", "تأكد من إضافة مستخدم علي الأقل وتأكد من جميع البيانات", "error");
      }
    }

    // go to step from step 2
    else if (this.active_step == 2) {
      if (step > 2) {
        // إذا تغيرت الرحلة، يجب المرور على الخطوة 3 إجبارياً (فقط للرحلات التي بها سكن)
        // استثناء: رحلة العودة فقط (2) ورحلة مكة مدينة (6) لا يوجد بها سكن
        if (this.trip_changed && step == 4 && this.trip_type_selected_id != '2' && this.trip_type_selected_id != '6') {
          Swal.fire('تنبيه', 'تم تغيير الرحلة، يجب مراجعة بيانات الفندق أولاً', 'warning');
          return;
        }
        // تسكين فقط: يجب المرور على الخطوة 3 إجبارياً
        if (this.trip_type_selected_id == '4' && step == 4 && !this.completed_steps[2]) {
          Swal.fire('تنبيه', 'يجب مراجعة بيانات الفندق أولاً', 'warning');
          return;
        }
        if (this.trip_type_selected_id == '4') {
          this.reservation_data.show_data.trip_type = this.trip_type_selected_id;
          this.reservation_data.show_data.residence_type_selected_id = this.residence_type_selected_id;
          this.active_step = step;
          this.completed_steps[1] = true;
          // جلب جميع الفنادق دائماً لأن تسكين فقط لا يرتبط برحلة معينة
          this.get_all_hotels();
        }
        else if (this.trip_type_selected_id && this.trip_type_selected_id != '4' && this.trip_type_selected_id != '10') {
          // تحديد نوع الحجز

          this.reservation_data.show_data.trip_type = this.trip_type_selected_id;
          console.log(this.show_reservation_details);
          // رحلة مفتوحة ذهاب والترانزيت
          if (this.trip_type_selected_id == '1' || this.trip_type_selected_id == '6') {

            if (this.open_going_trip_selected.id && this.going_selected_seats.length == this.confirmed_users.length) {

              this.set_open_going_trip_data();
              if (this.trip_type_selected_id == '6') {
                // الانتقال للخطوة 4 مباشرة (تخطي الخطوة 3 لأن رحلة الترانزيت ليس بها سكن)
                this.active_step = 4;
                this.completed_steps[1] = true;
                this.completed_steps[2] = true;
              }
              else {
                this.active_step = step;
                this.completed_steps[1] = true;
              }
            }
            else if (!this.open_going_trip_selected.id) {
              Swal.fire('خطأ', 'برجاء اختيار رحلة', 'error');
            }
            else if (this.going_selected_seats.length != this.confirmed_users.length) {
              Swal.fire('خطأ', 'برجاء اختيار مقاعد الرحلة بنفس عدد العملاء', 'error');
            }
            else {
              Swal.fire('خطأ', 'برجاء التأكد من جميع البيانات المطلوبة', 'error');
            }
          }
          // رحلة مفتوحة عودة
          if (this.trip_type_selected_id == '2') {
            if (this.open_return_trip_selected.id && this.return_selected_seats.length == this.confirmed_users.length) {
              this.set_open_return_trip_data();
              // الانتقال للخطوة 4 مباشرة (تخطي الخطوة 3 لأن رحلة العودة ليس بها سكن)
              this.active_step = 4;
              this.completed_steps[1] = true;
              this.completed_steps[2] = true;
            }
            else if (!this.open_return_trip_selected.id) {
              Swal.fire('خطأ', 'برجاء اختيار رحلة', 'error');
            }
            else if (this.return_selected_seats.length != this.confirmed_users.length) {
              Swal.fire('خطأ', 'برجاء اختيار مقاعد الرحلة بنفس عدد العملاء', 'error');
            }
            else {
              Swal.fire('خطأ', 'برجاء التأكد من جميع البيانات المطلوبة', 'error');
            }
          }
          // رحلة مفتوحة ذهاب و عودة
          if (this.trip_type_selected_id == '3') {
            if (this.open_going_trip_selected.id && this.open_return_trip_selected.id && this.going_selected_seats.length == this.confirmed_users.length && this.return_selected_seats.length == this.confirmed_users.length) {
              this.set_open_going_return_trip_data();
              this.active_step = step;
              this.completed_steps[1] = true;
            }
            else if (!this.open_going_trip_selected.id || !this.open_return_trip_selected.id) {
              Swal.fire('خطأ', 'برجاء اختيار رحلة الذهاب والعودة', 'error');
            }
            else if (this.return_selected_seats.length != this.confirmed_users.length) {
              Swal.fire('خطأ', 'برجاء اختيار مقاعد الرحلتين بنفس عدد العملاء', 'error');
            }
            else {
              Swal.fire('خطأ', 'برجاء التأكد من جميع البيانات المطلوبة', 'error');
            }
          }
          // رحلة مغلقة عادية وبترانزيت
          if (this.trip_type_selected_id == '5') {
            if (this.closed_trip_selected.id && this.going_selected_seats.length == this.confirmed_users.length && this.return_selected_seats.length == this.confirmed_users.length) {
              // في حالة 3 نقط
              if (this.closed_trip_selected.transitCity && this.transit_selected_seats.length == this.confirmed_users.length) {
                this.set_closed_trip_data();
                this.set_transit_chairs_data();
                this.active_step = step;
                this.completed_steps[1] = true;
              }
              // لو الرحلة نقطتين فقط
              else if (!this.closed_trip_selected.transitCity) {
                this.set_closed_trip_data();
                this.active_step = step;
                this.completed_steps[1] = true;
              }
              else {
                Swal.fire('خطأ', 'برجاء التأكد من جميع البيانات المطلوبة', 'error');
              }
              // }
            }
            else if (!this.closed_trip_selected.id) {
              Swal.fire('خطأ', 'برجاء اختيار رحلة الذهاب والعودة', 'error');
            }
            else if (this.going_selected_seats.length == this.confirmed_users.length || this.return_selected_seats.length != this.confirmed_users.length) {
              Swal.fire('خطأ', 'برجاء اختيار مقاعد الرحلة بنفس عدد العملاء', 'error');
            }
            else {
              Swal.fire('خطأ', 'برجاء التأكد من جميع البيانات المطلوبة', 'error');
            }
          }
        }
        else {
          Swal.fire("خطأ", "يجب ان تختار نوع الحجز", "error");
          this.completed_steps[1] = false;
        }
      }
      else {
        this.completed_steps[1] = false;
        this.active_step = step;
        this.reservation_data.show_data.trip_type = this.trip_type_selected_id;
        console.log(this.show_reservation_details);
      }
    }

    ////////////////////////////////////////////////////////////// go to step from step 3

    // refactor
    else if (this.active_step == 3) {
      if (step > 3) {
        // في حالة اختيار سكن
        if (this.trip_type_selected_id == '4' || this.residence_type_selected_id == 1) {
          if (this.residence_form.valid && this.check_residence_dates()) {
            // الحفاظ على الأسعار الحالية في residenceDto إذا لم يتغير الفندق
            // (قد تكون أسعار معدلة من المستخدم في الخطوة 4)
            const currentBedPrice = this.reservation_data.residenceDto?.bedPrice || 0;
            const currentRoomPrice = this.reservation_data.residenceDto?.roomPrice || 0;

            this.reservation_data.residenceDto = {
              fromDate: this.formatDateOnly(this.residence_form.get('residence_from_date')?.value),
              toDate: this.formatDateOnly(this.residence_form.get('residence_to_date')?.value),
              stayType: Number(this.residence_form.get('stay_type')?.value),
              hotelId: this.residence_form.get('hotel_id')?.value,
              accommodationUnitType: Number(this.residence_form.get('unit_type')?.value),
              // استخدام الأسعار الحالية إذا لم يتغير الفندق (تحتفظ بالتعديلات اليدوية)
              bedPrice: this.hotel_changed ? 0 : currentBedPrice,
              roomPrice: this.hotel_changed ? 0 : currentRoomPrice,
              reservedRooms: []
            }

            if (this.residence_form.get('unit_type')?.value == '2') {
              // تحويل roomTypeCounts إلى المصفوف المطلوب
              this.reservation_data.residenceDto.reservedRooms = Object.entries(this.roomTypeCounts)
                .filter(([_, count]) => count > 0) // فقط الغرف اللي عددها أكبر من صفر
                .map(([roomTypeId, count]) => ({
                  type: Number(roomTypeId), // نوع الغرفة (2, 3, أو 4)
                  roomsCount: Number(count) // عدد الغرف من هذا النوع
                }));
            }

            if (this.trip_type_selected_id == '4') {
              this.reservation_data.ticketDto = {
                "tripTicketType": Number(this.trip_type_selected_id),
                "customersIds": this.confirmed_users,
                "tripTickets": []
              }
            }
            if (this.residence_form.get('unit_type')?.value == '2') {
              this.reservation_data.residenceDto.numOfRooms = Number(this.residence_form.get('room_count')?.value);
              this.reservation_data.residenceDto.bedsCountInRoom = Number(this.residence_form.get('bed_count')?.value);
            }
            if (this.trip_type_selected_id == '4') {
              this.reservation_data.show_data.residence_type_selected_id = this.residence_type_selected_id;
              // تخزين التاريخ للعرض
              this.reservation_data.show_data.residence_from_date_to_show = this.residence_form.get('residence_from_date')?.value;
              // تخزين التاريخ للعرض
              this.reservation_data.show_data.residence_to_date_to_show = this.residence_form.get('residence_to_date')?.value;
              this.active_step = step;
              this.completed_steps[2] = true;
            }
            else if (this.trip_type_selected_id == '1') {
              // 
              this.reservation_data.show_data.residence_from_date_to_show = this.residence_form.get('residence_to_date')?.value;
            }
            this.reservation_data.show_data.residence_type_selected_id = this.residence_type_selected_id;
            this.reservation_data.show_data.trip_id_for_show_hotels = this.trip_id_for_show_hotels;
            // تمرير flags التغييرات لـ show-reservation
            this.reservation_data.hotel_changed = this.hotel_changed;
            this.reservation_data.trip_changed = this.trip_changed;
            this.active_step = step;
            this.completed_steps[2] = true;
          }
          else if (!this.check_residence_dates()) {
            Swal.fire('خطأ', 'يجب ان يكون تاريخ الذهاب اقل من تاريخ العودة', 'error');
          }
          else {
            this.residence_form.markAllAsTouched();
            Swal.fire('خطأ', 'برجاء التأكد من جميع بيانات حجز الفندق', 'error');
            return;
          }
        }
        else {
          this.reservation_data.show_data.residence_type_selected_id = this.residence_type_selected_id;
          // تمرير flags التغييرات لـ show-reservation
          this.reservation_data.hotel_changed = this.hotel_changed;
          this.reservation_data.trip_changed = this.trip_changed;
          this.active_step = step;
          this.completed_steps[2] = true;
          this.reservation_data.residenceDto = null;
        }
      }
      else {
        this.active_step = step;
        this.completed_steps[2] = false;
      }
    }

    // go to step from step 4
    else {
      if (this.active_step == 4 && (this.trip_type_selected_id == '2' || this.trip_type_selected_id == '6') && step == 3) {
        this.active_step = 2;
      }
      else {
        this.active_step = step;
      }
    }
  }

  // recidence dates validation
  check_residence_dates(): boolean {
    const recedince_go_date = new Date(this.residence_form.get('residence_from_date')?.value);
    const recedince_return_date = new Date(this.residence_form.get('residence_to_date')?.value);
    recedince_go_date.setHours(0, 0, 0, 0);
    recedince_return_date.setHours(0, 0, 0, 0);
    if (recedince_return_date > recedince_go_date) {
      return true
    }
    else {
      return false
    }
  }

  // set trip data in trip_id 1 || 6
  set_open_going_trip_data() {
    // استخدام سعر الرحلة فقط إذا تغيرت الرحلة، وإلا يبقى السعر الأصلي من الحجز
    if (this.trip_changed) {
      this.reservation_data.busChairPrice = this.open_going_trip_selected.chairPrice;
    }
    this.reservation_data.returnBusChairPrice = 0;
    this.reservation_data.ticketDto = {
      "tripTicketType": Number(this.trip_type_selected_id),
      "customersIds": this.confirmed_users,
      "tripTickets": [
        {
          "tripId": this.open_going_trip_selected.id,
          "departureReservedChairs": this.going_selected_seats.toString(),
          "returnReservedChairs": ''
        }
      ]
    }
    this.reservation_data.show_data.open_going_trip_selected = this.open_going_trip_selected;
    this.reservation_data.show_data.open_return_trip_selected = {};
    const d = new Date(this.open_going_trip_selected.departureTime);
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);

    // -------- أهم سطر --------
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const localDate = `${y}-${m}-${dd}`;     // 2025-06-05
    //---------------------------------------

    this.residence_form.get('residence_from_date')?.setValue(localDate);

    const rawDate = new Date(this.open_going_trip_selected.departureTime);
    // حوِّلها إلى كائن Date (تبقى UTC لأن القيمة فيها ‎Z‎)
    const min_return_date = new Date(rawDate);
    // أضِف يومين
    min_return_date.setUTCDate(d.getUTCDate() + 2);
    // احفظ أقل تاريخ مسموح به للعودة بصيغة YYYY‑MM‑DD
    this.min_return_date = min_return_date.toISOString().split('T')[0];

    // store trip_id in shared var to call hotels once in trip 3
    this.trip_id_for_show_hotels = this.open_going_trip_selected.id;
    console.log(this.residence_form.get('residence_from_date')?.value);

  }
  // set trip data in trip_id 2
  set_open_return_trip_data() {
    //  العوده ملهاش تسكين
    this.reservation_data.residenceDto = null;
    this.reservation_data.busChairPrice = 0;
    // استخدام سعر الرحلة فقط إذا تغيرت الرحلة، وإلا يبقى السعر الأصلي من الحجز
    if (this.trip_changed) {
      this.reservation_data.returnBusChairPrice = this.open_return_trip_selected.chairPrice;
    }
    this.reservation_data.ticketDto = {
      "tripTicketType": Number(this.trip_type_selected_id),
      "customersIds": this.confirmed_users,
      "tripTickets": [
        {
          "tripId": this.open_return_trip_selected.id,
          "departureReservedChairs": '',
          "returnReservedChairs": this.return_selected_seats.toString()
        }
      ]
    }
    this.reservation_data.show_data.open_return_trip_selected = this.open_return_trip_selected;
    this.reservation_data.show_data.open_going_trip_selected = {};
    // store trip_id in shared var to call hotels once in trip 3
    //this.trip_id_for_show_hotels = this.open_return_trip_selected.id;
  }
  // set trip data in trip_id 3
  set_open_going_return_trip_data() {
    // استخدام سعر الرحلة فقط إذا تغيرت الرحلة، وإلا يبقى السعر الأصلي من الحجز
    if (this.trip_changed) {
      this.reservation_data.busChairPrice = this.open_going_trip_selected.chairPrice;
      this.reservation_data.returnBusChairPrice = this.open_return_trip_selected.chairPrice;
    }

    this.reservation_data.ticketDto = {
      "tripTicketType": Number(this.trip_type_selected_id),
      "customersIds": this.confirmed_users,
      "tripTickets": [
        {
          "tripId": this.open_going_trip_selected.id,
          "departureReservedChairs": this.going_selected_seats.toString(),
          "returnReservedChairs": ''
        },
        {
          "tripId": this.open_return_trip_selected.id,
          "departureReservedChairs": '',
          "returnReservedChairs": this.return_selected_seats.toString()
        }
      ]
    }
    this.reservation_data.show_data.open_going_trip_selected = this.open_going_trip_selected;
    this.reservation_data.show_data.open_return_trip_selected = this.open_return_trip_selected;


    console.log('open_return_trip_selected', this.open_return_trip_selected);

    // تخزين التاريخ للعرض
    const going_date = new Date(this.open_going_trip_selected.departureTime);
    going_date.setUTCDate(going_date.getUTCDate() + 1);
    this.residence_form.get('residence_from_date')?.setValue(going_date);
    const return_date = new Date(this.open_return_trip_selected.returnTime);
    return_date.setUTCDate(return_date.getUTCDate());
    this.residence_form.get('residence_to_date')?.setValue(return_date);

    // store trip_id in shared var to call hotels once in trip 3
    this.trip_id_for_show_hotels = this.open_going_trip_selected.id;
  }
  // set trip data in trip_id 5
  set_closed_trip_data() {
    console.log(this.closed_trip_selected, 'mohamed');

    // استخدام سعر الرحلة فقط إذا تغيرت الرحلة، وإلا يبقى السعر الأصلي من الحجز
    if (this.trip_changed) {
      this.reservation_data.busChairPrice = this.closed_trip_selected.chairPrice;
    }
    this.reservation_data.returnBusChairPrice = null;
    this.reservation_data.ticketDto = {
      "tripTicketType": Number(this.trip_type_selected_id),
      "customersIds": this.confirmed_users,
      "tripTickets": [
        {
          "tripId": this.closed_trip_selected.id,
          "departureReservedChairs": this.going_selected_seats.toString(),
          "returnReservedChairs": this.return_selected_seats.toString()
        }
      ]
    }
    this.reservation_data.show_data.closed_trip_selected = this.closed_trip_selected;
    this.reservation_data.show_data.open_going_trip_selected = {};
    this.reservation_data.show_data.open_return_trip_selected = {};
    // تخزين التاريخ للعرض
    const going_date = new Date(this.closed_trip_selected.departureTime);
    going_date.setUTCDate(going_date.getUTCDate() + 1);
    this.residence_form.get('residence_from_date')?.setValue(going_date.toISOString());
    // 
    const return_date = new Date(this.closed_trip_selected.returnTime);
    return_date.setUTCDate(return_date.getUTCDate());
    this.residence_form.get('residence_to_date')?.setValue(return_date.toISOString());

    // store trip_id in shared var to call hotels once in trip 3
    this.trip_id_for_show_hotels = this.closed_trip_selected.id;
    console.log(this.reservation_data, 'mohamed');

  }
  // set transit chairs to trip_id 5
  set_transit_chairs_data() {
    this.reservation_data.ticketDto.tripTickets[0].transitReservedChairs = this.transit_selected_seats.toString();
  }
  // 
  going_selected_seats: string[] = [];
  return_selected_seats: string[] = [];
  transit_selected_seats: string[] = [];
  handleGoSeat(seats_ids: string[]) {
    this.going_selected_seats = seats_ids
  }

  handleReturnSeat(seats_ids: string[]) {
    this.return_selected_seats = seats_ids
  }

  handleTransitSeat(seats_ids: string[]) {
    this.transit_selected_seats = seats_ids
  }

  // عند اختيار رحلة مغلقة
  closed_trip_selected: Itrip = {} as Itrip;
  open_going_trip_selected: Itrip = {} as Itrip;
  open_return_trip_selected: Itrip = {} as Itrip;
  // عند اختيار رحلة ذهاب وعودة (مغلقة)
  going_return_trip_selected(trip: Itrip) {
    this.closed_trip_selected = trip;
    this.going_selected_seats = [];
    this.return_selected_seats = [];
    this.transit_selected_seats = [];

    // إذا عاد للرحلة الأصلية ← أرجع الكراسي الأصلية ولا تعتبر الرحلة متغيرة
    if (trip.id === this.original_closed_trip_id) {
      this.original_seats.going = [...this.saved_original_seats.going];
      this.original_seats.return = [...this.saved_original_seats.return];
      this.original_seats.transit = [...this.saved_original_seats.transit];
      this.trip_changed = false;
      this.restoreOriginalResidence();
    } else {
      this.original_seats.going = [];
      this.original_seats.return = [];
      this.original_seats.transit = [];
      this.trip_changed = true;
      this.residence_type_selected_id = null;
      this.residence_form.reset();
      this.reserved_data_in_trip_per_hotel = {};
    }
  }
  // عند اختيار رحلة ذهاب فقط
  going_trip_selected(trip: Itrip) {
    this.open_going_trip_selected = trip;
    this.going_selected_seats = [];

    // إذا عاد للرحلة الأصلية ← أرجع الكراسي الأصلية ولا تعتبر الرحلة متغيرة
    if (trip.id === this.original_going_trip_id) {
      this.original_seats.going = [...this.saved_original_seats.going];
      // في حالة trip_type = 3، تحقق من رحلة العودة أيضاً
      if (this.trip_type_selected_id == '3') {
        const bothOriginal = this.open_return_trip_selected?.id === this.original_return_trip_id;
        this.trip_changed = !bothOriginal;
        if (bothOriginal) {
          this.restoreOriginalResidence();
        }
      } else {
        this.trip_changed = false;
        this.restoreOriginalResidence();
      }
    } else {
      this.original_seats.going = [];
      this.trip_changed = true;
      this.residence_type_selected_id = null;
      this.residence_form.reset();
      this.reserved_data_in_trip_per_hotel = {};
    }
  }
  // عند اختيار رحلة عودة فقط
  return_trip_selected(trip: Itrip) {
    this.open_return_trip_selected = trip;
    this.return_selected_seats = [];

    // إذا عاد للرحلة الأصلية ← أرجع الكراسي الأصلية ولا تعتبر الرحلة متغيرة
    if (trip.id === this.original_return_trip_id) {
      this.original_seats.return = [...this.saved_original_seats.return];
      // في حالة trip_type = 3، تحقق من رحلة الذهاب أيضاً
      if (this.trip_type_selected_id == '3') {
        const bothOriginal = this.open_going_trip_selected?.id === this.original_going_trip_id;
        this.trip_changed = !bothOriginal;
        if (bothOriginal) {
          this.restoreOriginalResidence();
        }
      } else {
        this.trip_changed = false;
        this.restoreOriginalResidence();
      }
    } else {
      this.original_seats.return = [];
      this.trip_changed = true;
      this.residence_type_selected_id = null;
      this.residence_form.reset();
      this.reserved_data_in_trip_per_hotel = {};
    }
  }

  // استعادة بيانات التسكين الأصلية
  restoreOriginalResidence() {
    if (this.saved_original_residence.residence_type_selected_id !== null) {
      this.residence_type_selected_id = this.saved_original_residence.residence_type_selected_id;
      if (this.saved_original_residence.residence_form_values) {
        this.residence_form.patchValue(this.saved_original_residence.residence_form_values);
      }
    }
  }

  get_remaining_cost(paid_cost: number) {
    this.reservation_data.moneyPaid = paid_cost;
  }
  reservation_total_cost: number = 0;
  get_total_cost(total_cost: number) {
    this.reservation_total_cost = total_cost;
  }
  get_notes(notes: string) {
    this.reservation_data.notes = notes;
  }
  show_data: any = {};
  async update_reservation() {
    if (!this.reservation_data.paymentMethod) {
      Swal.fire('خطأ', 'برجاء اختيار طريقة الدفع', 'error');
      return;
    }

    // التحقق من أن المبلغ المدفوع لا يتجاوز الإجمالي
    if (this.reservation_data.moneyPaid > this.reservation_total_cost) {
      Swal.fire('خطأ', 'المبلغ المدفوع أكبر من إجمالي المبلغ المطلوب', 'error');
      return;
    }

    // if (this.reservation_data.moneyPaid == 0) {
    //   const result = await Swal.fire({
    //     title: 'تنبيه',
    //     text: "يجب دفع مبلغ من الإجمالي بحد ادني 1 ر.س",
    //     icon: 'warning',
    //     confirmButtonColor: '#B50D0D',
    //     confirmButtonText: 'نعم ',
    //   });
    //   return;
    // }
    if (this.reservation_data.moneyPaid == 0) {
      const result = await Swal.fire({
        title: 'تنبيه',
        text: "لم يتم دفع اي مبلغ من الإجمالي هل تود المتابعة",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#B50D0D',
        cancelButtonColor: '#b0b0b0',
        confirmButtonText: 'تأكيد  <i class="fa-solid fa-check"></i>',
        cancelButtonText: 'الغاء <i class="fa-solid fa-xmark"></i>'
      });

      if (result.isDismissed) {
        return;
      }
    }

    // بناء body التعديل
    this.build_update_body();

    this.show_data = this.reservation_data.show_data;
    delete this.reservation_data.show_data;

    const employeeId = localStorage.getItem('userId');
    if (employeeId) {
      this.reservation_data.employeeId = employeeId;
    }

    console.log('Update Reservation Data:', this.reservation_data);

    this.reservationsService.update_reservation(this.reservation_data).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.ok) {
          Swal.fire('نجاح', 'تم تعديل الحجز بنجاح', 'success');
          this.router.navigate(['show-Reservation', this.reservation_id]);
        } else {
          Swal.fire('خطأ', res.message || 'حدث خطأ أثناء تعديل الحجز', 'error');
          this.reservation_data.show_data = this.show_data;
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire('خطأ', err.error?.message || 'حدث خطأ أثناء تعديل الحجز', 'error');
        this.reservation_data.show_data = this.show_data;
      }
    });
  }

  build_update_body() {
    // إضافة reservationId
    this.reservation_data.reservationId = this.reservation_id;

    // إضافة fromDate و toDate
    if (this.reservation_data.residenceDto) {
      this.reservation_data.fromDate = this.reservation_data.residenceDto.fromDate;
      this.reservation_data.toDate = this.reservation_data.residenceDto.toDate;

      // إضافة id للـ residenceDto
      if (this.original_residence_id) {
        this.reservation_data.residenceDto.id = this.original_residence_id;
      }

      // إضافة residenceId للـ reservedRooms
      if (this.reservation_data.residenceDto.reservedRooms && this.original_residence_id) {
        this.reservation_data.residenceDto.reservedRooms = this.reservation_data.residenceDto.reservedRooms.map((room: any) => ({
          ...room,
          residenceId: this.original_residence_id
        }));
      }

      // تعيين السعر غير المستخدم كـ null حسب نوع الوحدة السكنية
      if (this.reservation_data.residenceDto.accommodationUnitType == 1) {
        // حجز بالسرير: roomPrice = null
        this.reservation_data.residenceDto.roomPrice = null;
      } else if (this.reservation_data.residenceDto.accommodationUnitType == 2) {
        // حجز بالغرفة: bedPrice = null
        this.reservation_data.residenceDto.bedPrice = null;
      }
    } else {
      // إذا كان الحجز بسكن وتم إلغاؤه
      this.reservation_data.residenceDto = null;
      // استخدام تواريخ الرحلة
      if (this.original_reservation) {
        this.reservation_data.fromDate = this.original_reservation.fromDate;
        this.reservation_data.toDate = this.original_reservation.toDate;
      }
    }

    // إضافة ticketId للـ ticketDto
    if (this.reservation_data.ticketDto && this.original_ticket_id) {
      this.reservation_data.ticketDto.ticketId = this.original_ticket_id;
    }
  }

  reset_step_3() {
    this.min_return_date = '';
    this.reserved_data_in_trip_per_hotel = {};
    this.residence_type_selected_id = null;
    this.residence_form.reset();
    this.reservation_data.residenceDto = null
    this.reservation_data.ticketDto = null
    this.go_date = '';
    this.return_date = '';
    this.going_selected_seats = [];
    this.return_selected_seats = [];
    this.transit_selected_seats = [];
    this.closed_trip_selected = {} as Itrip;
    this.open_going_trip_selected = {} as Itrip;
    this.open_return_trip_selected = {} as Itrip;
    this.roomTypeCounts = {};
  }

  formatDateOnly(date: Date | string | null | undefined): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);

    // تأكد إن التاريخ صحيح
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}